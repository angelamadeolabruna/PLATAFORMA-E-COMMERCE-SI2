# TIENDAS MONTAÑO — TRIGGERS Y PROCEDIMIENTOS ALMACENADOS
## PostgreSQL

> Coherentes con el diseño de tablas de `DISEÑO BD COMPLETA.md`.
> Cada trigger/procedimiento se vincula a los casos de uso que soporta.

---

## 1. TRIGGER: Bloqueo por intentos fallidos (CU01)

**Tabla:** `usuarios` · **Caso de uso:** CU01

```sql
CREATE OR REPLACE FUNCTION fn_incrementar_intentos()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la contraseña fue incorrecta, el backend incrementa intentos_fallidos.
    -- Este trigger bloquea cuando se alcanza el límite (5 en 15 minutos).
    IF NEW.intentos_fallidos >= 5 THEN
        NEW.estado = 'Bloqueado';
        NEW.bloqueado_hasta = NOW() + INTERVAL '15 minutes';
        NEW.intentos_fallidos = 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bloquear_usuario_5_intentos
BEFORE UPDATE OF intentos_fallidos ON usuarios
FOR EACH ROW
EXECUTE FUNCTION fn_incrementar_intentos();
```

---

## 2. TRIGGER: Recalcular stock en movimiento de inventario (CU22-CU26)

**Tabla:** `movimientos_inventario` · **Casos de uso:** CU22 (recepción), CU24 (ajuste/merma), ventas (CU39), reservas

Cuando se inserta un movimiento, se actualiza la columna `stock_anterior/stock_posterior`
a partir del stock actual de `inventario_stock`.

```sql
CREATE OR REPLACE FUNCTION fn_aplicar_movimiento_inventario()
RETURNS TRIGGER AS $$
DECLARE
    v_disponible INTEGER;
BEGIN
    -- Stock actual antes del movimiento
    SELECT cantidad_disponible INTO v_disponible
    FROM inventario_stock
    WHERE id_ptc = NEW.id_ptc AND id_sucursal = NEW.id_sucursal;

    IF v_disponible IS NULL THEN
        v_disponible := 0;
    END IF;

    NEW.stock_anterior := v_disponible;
    NEW.stock_posterior := v_disponible + NEW.cantidad;
    NEW.fecha := NOW();

    -- Actualizar inventario_stock
    INSERT INTO inventario_stock (id_ptc, id_sucursal, cantidad_disponible)
    VALUES (NEW.id_ptc, NEW.id_sucursal, NEW.cantidad)
    ON CONFLICT (id_ptc, id_sucursal)
    DO UPDATE SET cantidad_disponible = inventario_stock.cantidad_disponible + NEW.cantidad;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_movimiento_inventario
BEFORE INSERT ON movimientos_inventario
FOR EACH ROW
EXECUTE FUNCTION fn_aplicar_movimiento_inventario();
```

---

## 3. PROCEDIMIENTO: Registrar venta (CU36-CU39)

**Tablas:** `ventas`, `venta_items`, `movimientos_inventario`, `inventario_stock`, `comprobantes`

Transacción atómica que valida stock, descuenta inventario, registra movimientos y emite comprobante.

```sql
CREATE OR REPLACE FUNCTION sp_registrar_venta(
    p_id_usuario   INTEGER,
    p_id_sucursal  INTEGER,
    p_modalidad    VARCHAR,
    p_metodo_pago  VARCHAR,
    p_items        JSONB,     -- [{id_ptc, cantidad, precio_unitario}]
    OUT p_venta_id INTEGER,
    OUT p_total    DECIMAL(12,2)
) AS $$
DECLARE
    item JSONB;
    v_id_ptc INTEGER;
    v_cant INTEGER;
    v_precio DECIMAL(10,2);
    v_stock INTEGER;
    v_subtotal DECIMAL(12,2);
BEGIN
    p_total := 0;

    -- Validar stock de cada ítem y calcular total
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_id_ptc := (item->>'id_ptc')::INTEGER;
        v_cant := (item->>'cantidad')::INTEGER;
        v_precio := (item->>'precio_unitario')::DECIMAL(10,2);

        SELECT cantidad_disponible - cantidad_reservada INTO v_stock
        FROM inventario_stock
        WHERE id_ptc = v_id_ptc AND id_sucursal = p_id_sucursal
        FOR UPDATE;

        IF v_stock IS NULL OR v_stock < v_cant THEN
            RAISE EXCEPTION 'Stock insuficiente para producto % (disponible %)', v_id_ptc, v_stock;
        END IF;

        v_subtotal := v_cant * v_precio;
        p_total := p_total + v_subtotal;
    END LOOP;

    -- Insertar venta
    INSERT INTO ventas (id_usuario, id_sucursal, modalidad, metodo_pago, subtotal, impuestos, total, estado)
    VALUES (p_id_usuario, p_id_sucursal, p_modalidad, p_metodo_pago, p_total, 0, p_total, 'Completada')
    RETURNING id_venta INTO p_venta_id;

    -- Insertar ítems, movimientos y descontar inventario
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_id_ptc := (item->>'id_ptc')::INTEGER;
        v_cant := (item->>'cantidad')::INTEGER;
        v_precio := (item->>'precio_unitario')::DECIMAL(10,2);
        v_subtotal := v_cant * v_precio;

        INSERT INTO venta_items (id_venta, id_ptc, cantidad, precio_unitario, subtotal)
        VALUES (p_venta_id, v_id_ptc, v_cant, v_precio, v_subtotal);

        -- Movimiento de salida
        INSERT INTO movimientos_inventario
            (id_ptc, id_sucursal, tipo_movimiento, cantidad, referencia, id_venta)
        VALUES (v_id_ptc, p_id_sucursal, 'Venta', -v_cant, 'Venta #' || p_venta_id, p_venta_id);
    END LOOP;

    -- Emitir comprobante
    INSERT INTO comprobantes (id_venta, numero, tipo, total)
    VALUES (p_venta_id, 'C-' || LPAD(p_venta_id::TEXT, 8, '0'), 'Factura', p_total);

END;
$$ LANGUAGE plpgsql;
```

---

## 4. PROCEDIMIENTO: Registrar reserva (CU28)

**Tablas:** `reservas`, `reserva_items`, `inventario_stock`, `movimientos_inventario`

```sql
CREATE OR REPLACE FUNCTION sp_registrar_reserva(
    p_id_usuario  INTEGER,
    p_id_sucursal INTEGER,
    p_fecha_ini   DATE,
    p_hora_ini    TIME,
    p_items       JSONB,     -- [{id_ptc, cantidad}]
    OUT p_reserva_id INTEGER
) AS $$
DECLARE
    item JSONB;
    v_id_ptc INTEGER;
    v_cant INTEGER;
    v_stock_libre INTEGER;
BEGIN
    INSERT INTO reservas (id_usuario, id_sucursal, fecha_reserva, hora_reserva, estado)
    VALUES (p_id_usuario, p_id_sucursal, p_fecha_ini, p_hora_ini, 'Solicitada')
    RETURNING id_reserva INTO p_reserva_id;

    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_id_ptc := (item->>'id_ptc')::INTEGER;
        v_cant := (item->>'cantidad')::INTEGER;

        -- Stock libre = disponible - reservado
        SELECT cantidad_disponible - cantidad_reservada INTO v_stock_libre
        FROM inventario_stock WHERE id_ptc = v_id_ptc AND id_sucursal = p_id_sucursal FOR UPDATE;

        IF v_stock_libre IS NULL OR v_stock_libre < v_cant THEN
            RAISE EXCEPTION 'No hay stock libre suficiente (producto %)', v_id_ptc;
        END IF;

        INSERT INTO reserva_items (id_reserva, id_ptc, cantidad)
        VALUES (p_reserva_id, v_id_ptc, v_cant);

        -- Incrementar reservado
        UPDATE inventario_stock SET cantidad_reservada = cantidad_reservada + v_cant
        WHERE id_ptc = v_id_ptc AND id_sucursal = p_id_sucursal;

        INSERT INTO movimientos_inventario
            (id_ptc, id_sucursal, tipo_movimiento, cantidad, referencia, id_reserva)
        VALUES (v_id_ptc, p_id_sucursal, 'Reserva', -v_cant, 'Reserva #' || p_reserva_id, p_reserva_id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. PROCEDIMIENTO: Registrar devolución (CU40)

**Tablas:** `devoluciones`, `devolucion_items`, `inventario_stock`, `movimientos_inventario`

```sql
CREATE OR REPLACE FUNCTION sp_registrar_devolucion(
    p_id_venta     INTEGER,
    p_id_usuario   INTEGER,
    p_id_sucursal  INTEGER,
    p_motivo       VARCHAR,
    p_items        JSONB,     -- [{id_ptc, cantidad, tipo}]
    OUT p_devolucion_id INTEGER
) AS $$
DECLARE
    item JSONB;
    v_id_ptc INTEGER;
    v_cant INTEGER;
    v_tipo VARCHAR;
BEGIN
    INSERT INTO devoluciones (id_venta, id_usuario, id_sucursal, motivo, estado)
    VALUES (p_id_venta, p_id_usuario, p_id_sucursal, p_motivo, 'Procesada')
    RETURNING id_devolucion INTO p_devolucion_id;

    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_id_ptc := (item->>'id_ptc')::INTEGER;
        v_cant := (item->>'cantidad')::INTEGER;
        v_tipo := (item->>'tipo')::VARCHAR;

        INSERT INTO devolucion_items (id_devolucion, id_ptc, cantidad, tipo)
        VALUES (p_devolucion_id, v_id_ptc, v_cant, v_tipo);

        -- Devolver stock (entrada)
        INSERT INTO movimientos_inventario
            (id_ptc, id_sucursal, tipo_movimiento, cantidad, referencia, id_venta)
        VALUES (v_id_ptc, p_id_sucursal, 'Devolución', v_cant, 'Devolución #' || p_devolucion_id, p_id_venta);
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. PROCEDIMIENTO: Recepción de mercadería (CU22)

**Tablas:** `ordenes_compra`, `orden_compra_items`, `recepciones`, `recepcion_items`, `inventario_stock`, `movimientos_inventario`

```sql
CREATE OR REPLACE FUNCTION sp_registrar_recepcion(
    p_id_orden     INTEGER,
    p_id_usuario   INTEGER,
    p_id_sucursal  INTEGER,
    p_items        JSONB,     -- [{id_ptc, cantidad_recibida}]
    OUT p_recepcion_id INTEGER
) AS $$
DECLARE
    item JSONB;
    v_id_ptc INTEGER;
    v_recibida INTEGER;
BEGIN
    INSERT INTO recepciones (id_orden_compra, id_sucursal, id_usuario, estado)
    VALUES (p_id_orden, p_id_sucursal, p_id_usuario, 'Registrada')
    RETURNING id_recepcion INTO p_recepcion_id;

    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_id_ptc := (item->>'id_ptc')::INTEGER;
        v_recibida := (item->>'cantidad_recibida')::INTEGER;

        INSERT INTO recepcion_items (id_recepcion, id_ptc, cantidad_recibida, diferencia)
        VALUES (p_recepcion_id, v_id_ptc, v_recibida, 0);

        -- Entrada de stock
        INSERT INTO movimientos_inventario
            (id_ptc, id_sucursal, tipo_movimiento, cantidad, referencia, id_orden_compra)
        VALUES (v_id_ptc, p_id_sucursal, 'Recepción', v_recibida, 'Orden #' || p_id_orden, p_id_orden);
    END LOOP;

    -- Marcar orden como recibida
    UPDATE ordenes_compra SET estado = 'Recibida', fecha_recepcion = NOW()
    WHERE id_orden_compra = p_id_orden;
END;
$$ LANGUAGE plpgsql;
```

---

## 7. PROCEDIMIENTO: Evaluar alertas de stock (CU25/CU26)

**Tablas:** `alertas_stock_config`, `inventario_stock`, `producto_talla_color`, `sucursales`

```sql
CREATE OR REPLACE FUNCTION fn_detectar_stock_bajo()
RETURNS TABLE(
    id_ptc INTEGER, id_sucursal INTEGER, producto VARCHAR, talla VARCHAR,
    color VARCHAR, stock_actual INTEGER, stock_minimo INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT a.id_ptc, is2.id_sucursal,
           p.nombre, t.nombre, c.nombre,
           is2.cantidad_disponible, a.stock_minimo
    FROM alertas_stock_config a
    JOIN inventario_stock is2 ON is2.id_ptc = a.id_ptc AND is2.id_sucursal = a.id_sucursal
    JOIN producto_talla_color ptc ON ptc.id_ptc = a.id_ptc
    JOIN productos p ON p.id_producto = ptc.id_producto
    JOIN tallas t ON t.id_talla = ptc.id_talla
    JOIN colores c ON c.id_color = ptc.id_color
    WHERE a.notificar_email = true
      AND is2.cantidad_disponible <= a.stock_minimo
      AND (a.ultima_notificacion IS NULL OR a.ultima_notificacion < NOW() - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql;
```

---

## 8. PROCEDIMIENTO: Kardex con saldos (CU23)

```sql
CREATE OR REPLACE FUNCTION fn_kardex_producto(
    p_id_ptc INTEGER, p_id_sucursal INTEGER
) RETURNS TABLE(
    fecha TIMESTAMP, tipo VARCHAR, cantidad INTEGER,
    stock_anterior INTEGER, stock_posterior INTEGER, referencia VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.fecha, m.tipo_movimiento, m.cantidad,
           m.stock_anterior, m.stock_posterior, m.referencia
    FROM movimientos_inventario m
    WHERE m.id_ptc = p_id_ptc AND m.id_sucursal = p_id_sucursal
    ORDER BY m.fecha ASC;
END;
$$ LANGUAGE plpgsql;
```

---

## NOTAS

- Los procedimientos se ejecutan desde la capa de servicios FastAPI (`CTRL_`) en transacciones vía SQLAlchemy `func` o `text()`.
- Cada trigger/procedimiento está asociado a uno o más CU; la coherencia diagrama-flujo-código-BD se garantiza usando **los mismos nombres de tablas y columnas**.
- Faltan por detallar (fases siguientes): procedimientos de reserva cancelación (CU29/CU31), reportes agregados (CU44-46), scoring de proveedores (CU20).
