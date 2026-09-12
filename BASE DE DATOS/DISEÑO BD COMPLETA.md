# BASE DE DATOS — TIENDAS MONTAÑO
## Diseño Lógico y Físico (PostgreSQL)

> Plataforma Inteligente de Comercio Electrónico de Tienda de Ropa con Vestidor Virtual RA.
> Motor: **PostgreSQL 15+**. Nombres de tablas y columnas en minúsculas y sin prefijo.
> Todo el diseño es coherente con los 46 Casos de Uso y los diagramas de comunicación.
> Las clases **CE_ (Entidad)** de los diagramas de comunicación mapean 1:1 a estas tablas.

---

## ÍNDICE DE TABLAS POR MÓDULO

| Módulo | Tablas |
|--------|--------|
| **Seguridad (RBAC)** | `roles`, `usuarios`, `usuarios_empleados`, `clientes`, `first_password_tokens`, `password_resets`, `token_blacklist`, `sesiones` |
| **Auditoría** | `bitacora_auditoria` |
| **Ciudades y Sucursales** | `ciudades`, `sucursales`, `sucursal_horarios` |
| **Catálogo (maestros)** | `tallas`, `colores`, `categorias`, `temporadas`, `colecciones`, `producto_coleccion` |
| **Productos** | `productos`, `producto_talla_color`, `producto_imagenes`, `producto_precios` |
| **Proveedores y Compras** | `proveedores`, `proveedor_contactos`, `ordenes_compra`, `orden_compra_items`, `recepciones`, `recepcion_items` |
| **Inventario** | `inventario_stock`, `movimientos_inventario`, `alertas_stock_config` |
| **Reservas** | `reservas`, `reserva_items` |
| **Vestidor Virtual RA** | `sesiones_ra`, `resultados_prueba` |
| **Carrito y Venta** | `carritos`, `carrito_items`, `ventas`, `venta_items`, `comprobantes` |
| **Pagos** | `transacciones_pago` |
| **Devoluciones** | `devoluciones`, `devolucion_items` |
| **IA y Reportes** | `preferencias_cliente`, `historial_navegacion`, `recomendaciones_ia`, `conversaciones_ia`, `reportes_generativos` |
| **Reportes/Dashboard** | (vistas materializadas y consultas agregadas, no tablas transaccionales) |
| **Respaldos** | `respaldos` |

---

# PARTE 1 — ESQUEMA Y TABLAS

```sql
-- ============================================================
-- CREACIÓN DE LA BASE DE DATOS
-- ============================================================
CREATE DATABASE ropa;
```

```sql
-- ============================================================
-- 1. MÓDULO DE SEGURIDAD (RBAC) — CU01-CU10
-- ============================================================

-- Roles del sistema: Administrador, Encargado, Cajero, Cliente, Proveedor
CREATE TABLE roles (
    id_rol         SERIAL PRIMARY KEY,
    nombre_rol     VARCHAR(60) UNIQUE NOT NULL,
    descripcion    TEXT,
    permisos_json  JSONB NOT NULL DEFAULT '[]',  -- ejemplo: ["gestionar_usuarios","gestionar_catalogo"]
    estado         VARCHAR(20) DEFAULT 'Activo', -- Activo / Inactivo
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Usuarios del sistema (login unificado web+móvil)
CREATE TABLE usuarios (
    id_usuario          SERIAL PRIMARY KEY,
    email               VARCHAR(120) UNIQUE NOT NULL,
    ci                  VARCHAR(30) UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    estado              VARCHAR(20) DEFAULT 'Pendiente', -- Pendiente/Activo/Inactivo/Bloqueado
    intentos_fallidos   INTEGER DEFAULT 0,
    bloqueado_hasta     TIMESTAMP,
    fecha_creacion      TIMESTAMP DEFAULT NOW(),
    fecha_ultimo_acceso TIMESTAMP,
    ultimo_login        TIMESTAMP
);

-- Relación usuario-rol (RBAC por FK, no por texto)
CREATE TABLE usuarios_roles (
    id_usuario  INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_rol      INTEGER REFERENCES roles(id_rol) ON DELETE CASCADE,
    PRIMARY KEY (id_usuario, id_rol)
);

-- Empleados (Administrador, Encargado, Cajero) asignados a sucursal
CREATE TABLE usuarios_empleados (
    id_empleado  SERIAL PRIMARY KEY,
    usuario_id   INTEGER UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    sucursal_id  INTEGER REFERENCES sucursales(id_sucursal),
    nombre       VARCHAR(120) NOT NULL,
    telefono     VARCHAR(30),
    rol          VARCHAR(60) NOT NULL, -- 'Administrador'/'Encargado'/'Cajero' (respaldo legible)
    fecha_baja   TIMESTAMP,
    motivo_baja  VARCHAR(255)
);

-- Clientes registrados (detalle extendido del usuario con rol Cliente)
CREATE TABLE clientes (
    id_cliente    SERIAL PRIMARY KEY,
    usuario_id    INTEGER UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nombre        VARCHAR(150) NOT NULL,
    telefono      VARCHAR(30),
    direccion     TEXT,
    fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Tokens para establecimiento de primera contraseña (CU06/CU07)
CREATE TABLE first_password_tokens (
    id_token   SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    token      UUID UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used       BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tokens para recuperación de contraseña (CU05)
CREATE TABLE password_resets (
    id_reset   SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    email      VARCHAR(120) NOT NULL,
    token      UUID UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used       BOOLEAN DEFAULT false,
    ip_origen  VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Blacklist de JWT (soporte CU02 cerrar sesión, CU04 cambio de contraseña)
CREATE TABLE token_blacklist (
    id_token     SERIAL PRIMARY KEY,
    jti          VARCHAR(128) UNIQUE NOT NULL,     -- JWT ID revocado
    usuario_id   INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    expira_en    TIMESTAMP NOT NULL,
    revocado_en  TIMESTAMP DEFAULT NOW()
);

-- Sesiones activas (historial de sesiones, soporta CU02 y alertas de seguridad)
CREATE TABLE sesiones (
    id_sesion      SERIAL PRIMARY KEY,
    usuario_id     INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    refresh_token  VARCHAR(255) UNIQUE,
    ip_origen      VARCHAR(45),
    user_agent     VARCHAR(255),
    fecha_inicio   TIMESTAMP DEFAULT NOW(),
    fecha_fin      TIMESTAMP,
    activa         BOOLEAN DEFAULT true
);
```

---

# PARTE 2 — AUDITORÍA

```sql
-- ============================================================
-- 2. MÓDULO DE AUDITORÍA — CU11
-- ============================================================
CREATE TABLE bitacora_auditoria (
    id_bitacora     SERIAL PRIMARY KEY,
    id_usuario      INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    accion_sql      VARCHAR(40),   -- INSERT/UPDATE/DELETE/LOGIN/LOGOUT/LOGIN_FAILED/RESET_PASSWORD/BACKUP
    tabla_afectada  VARCHAR(80),
    id_registro     INTEGER,
    detalle         TEXT,
    old_data        JSONB,         -- estado anterior (para UPDATE/DELETE)
    new_data        JSONB,         -- estado nuevo
    ip_address      INET,
    user_agent      VARCHAR(255),
    fecha_hora      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_bitacora_fecha ON bitacora_auditoria (fecha_hora DESC);
CREATE INDEX idx_bitacora_tabla ON bitacora_auditoria (tabla_afectada);
```

---

# PARTE 3 — CIUDADES Y SUCURSALES

```sql
-- ============================================================
-- 3. CIUDADES Y SUCURSALES — CU12, CU17
-- ============================================================
CREATE TABLE ciudades (
    id_ciudad SERIAL PRIMARY KEY,
    nombre    VARCHAR(80) UNIQUE NOT NULL,
    pais      VARCHAR(60) DEFAULT 'Bolivia',
    estado    VARCHAR(20) DEFAULT 'Activa'
);

CREATE TABLE sucursales (
    id_sucursal      SERIAL PRIMARY KEY,
    nombre           VARCHAR(100) NOT NULL,
    direccion        TEXT NOT NULL,
    id_ciudad        INTEGER REFERENCES ciudades(id_ciudad),
    telefono         VARCHAR(30),
    estado           VARCHAR(20) DEFAULT 'Activa', -- Activa / Inactiva
    fecha_registro   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sucursal_horarios (
    id_horario        SERIAL PRIMARY KEY,
    id_sucursal       INTEGER REFERENCES sucursales(id_sucursal) ON DELETE CASCADE,
    dia_semana        VARCHAR(20),   -- Lunes..Domingo
    horario_apertura  TIME,
    horario_cierre    TIME
);
```

---

# PARTE 4 — CATÁLOGO Y MAESTROS

```sql
-- ============================================================
-- 4. MAESTROS: TALLAS, COLORES, CATEGORÍAS, TEMPORADAS — CU14, CU15
-- ============================================================
CREATE TABLE tallas (
    id_talla SERIAL PRIMARY KEY,
    nombre   VARCHAR(10) UNIQUE NOT NULL, -- XS,S,M,L,XL,XXL,3XL
    estado   VARCHAR(20) DEFAULT 'Activo',
    orden    INTEGER
);

CREATE TABLE colores (
    id_color    SERIAL PRIMARY KEY,
    nombre      VARCHAR(50) UNIQUE NOT NULL,
    codigo_hex  VARCHAR(7) UNIQUE,   -- #RRGGBB
    estado      VARCHAR(20) DEFAULT 'Activo'
);

CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre       VARCHAR(80) UNIQUE NOT NULL,
    descripcion  TEXT,
    estado       VARCHAR(20) DEFAULT 'Activo'
);

CREATE TABLE temporadas (
    id_temporada  SERIAL PRIMARY KEY,
    nombre        VARCHAR(80) NOT NULL,
    fecha_inicio  DATE,
    fecha_fin     DATE,
    estado        VARCHAR(20) DEFAULT 'Programada' -- Programada/Activa/Cerrada
);

CREATE TABLE colecciones (
    id_coleccion   SERIAL PRIMARY KEY,
    nombre         VARCHAR(80) NOT NULL,
    descripcion    TEXT,
    id_temporada   INTEGER REFERENCES temporadas(id_temporada),
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

CREATE TABLE producto_coleccion (
    id_coleccion INTEGER REFERENCES colecciones(id_coleccion) ON DELETE CASCADE,
    id_producto  INTEGER REFERENCES productos(id_producto) ON DELETE CASCADE,
    PRIMARY KEY (id_coleccion, id_producto)
);
```

---

# PARTE 5 — PRODUCTOS

```sql
-- ============================================================
-- 5. PRODUCTOS Y VARIANTES — CU13, CU16
-- ============================================================
CREATE TABLE productos (
    id_producto    SERIAL PRIMARY KEY,
    codigo         VARCHAR(40) UNIQUE NOT NULL,
    nombre         VARCHAR(150) NOT NULL,
    descripcion    TEXT,
    id_categoria   INTEGER REFERENCES categorias(id_categoria),
    id_temporada   INTEGER REFERENCES temporadas(id_temporada),
    id_proveedor   INTEGER REFERENCES proveedores(id_proveedor),
    precio_base    DECIMAL(10,2) NOT NULL,
    modelo_3d_url  TEXT,            -- modelo para realidad aumentada (CU32)
    estado         VARCHAR(20) DEFAULT 'Disponible', -- Disponible/No disponible
    fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Variante producto + talla + color (stock se maneja aquí)
CREATE TABLE producto_talla_color (
    id_ptc              SERIAL PRIMARY KEY,
    id_producto         INTEGER REFERENCES productos(id_producto) ON DELETE CASCADE,
    id_talla            INTEGER REFERENCES tallas(id_talla),
    id_color            INTEGER REFERENCES colores(id_color),
    estado_stock        VARCHAR(20) DEFAULT 'Disponible', -- Disponible/Stock bajo/Sin stock
    UNIQUE (id_producto, id_talla, id_color)
);

CREATE TABLE producto_imagenes (
    id_imagen    SERIAL PRIMARY KEY,
    id_producto  INTEGER REFERENCES productos(id_producto) ON DELETE CASCADE,
    url          TEXT NOT NULL,
    es_principal BOOLEAN DEFAULT false,
    orden        INTEGER
);

-- Precios por variante (permite precios según talla/color/colección)
CREATE TABLE producto_precios (
    id_precio    SERIAL PRIMARY KEY,
    id_ptc       INTEGER REFERENCES producto_talla_color(id_ptc) ON DELETE CASCADE,
    precio       DECIMAL(10,2) NOT NULL,
    fecha_inicio DATE,
    fecha_fin    DATE
);
```

---

# PARTE 6 — PROVEEDORES Y COMPRAS

```sql
-- ============================================================
-- 6. PROVEEDORES Y COMPRAS — CU18-CU22
-- ============================================================
CREATE TABLE proveedores (
    id_proveedor      SERIAL PRIMARY KEY,
    nombre_empresa    VARCHAR(150) UNIQUE NOT NULL,
    persona_contacto  VARCHAR(120),
    telefono          VARCHAR(30),
    email             VARCHAR(120) UNIQUE,
    direccion         TEXT,
    observaciones     TEXT,
    tiempo_entrega_dias INTEGER DEFAULT 15,
    estado_riesgo     VARCHAR(20) DEFAULT 'Activo', -- Activo/Observado/Inhabilitado
    calidad_score     INTEGER,                      -- 0-100 (CU20)
    fecha_registro    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE proveedor_contactos (
    id_contacto    SERIAL PRIMARY KEY,
    id_proveedor   INTEGER REFERENCES proveedores(id_proveedor) ON DELETE CASCADE,
    nombre         VARCHAR(120),
    cargo          VARCHAR(80),
    telefono       VARCHAR(30),
    email          VARCHAR(120)
);

CREATE TABLE ordenes_compra (
    id_orden_compra        SERIAL PRIMARY KEY,
    id_proveedor           INTEGER REFERENCES proveedores(id_proveedor),
    id_sucursal            INTEGER REFERENCES sucursales(id_sucursal),
    numero                 VARCHAR(20),
    fecha_orden            TIMESTAMP DEFAULT NOW(),
    fecha_estimada_entrega DATE,
    fecha_recepcion        TIMESTAMP,
    estado                 VARCHAR(20) DEFAULT 'Pendiente', -- Pendiente/Recibida/Cancelada
    total                  DECIMAL(12,2),
    observaciones          TEXT
);

CREATE TABLE orden_compra_items (
    id_orden_item      SERIAL PRIMARY KEY,
    id_orden_compra    INTEGER REFERENCES ordenes_compra(id_orden_compra) ON DELETE CASCADE,
    id_ptc             INTEGER REFERENCES producto_talla_color(id_ptc),
    cantidad           INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario    DECIMAL(10,2),
    subtotal           DECIMAL(12,2)
);

CREATE TABLE recepciones (
    id_recepcion       SERIAL PRIMARY KEY,
    id_orden_compra    INTEGER REFERENCES ordenes_compra(id_orden_compra),
    id_sucursal        INTEGER REFERENCES sucursales(id_sucursal),
    id_usuario         INTEGER REFERENCES usuarios(id_usuario), -- encargado que recibe
    fecha_recepcion    TIMESTAMP DEFAULT NOW(),
    estado             VARCHAR(20) DEFAULT 'Registrada'
);

CREATE TABLE recepcion_items (
    id_recepcion_item   SERIAL PRIMARY KEY,
    id_recepcion        INTEGER REFERENCES recepciones(id_recepcion) ON DELETE CASCADE,
    id_ptc              INTEGER REFERENCES producto_talla_color(id_ptc),
    cantidad_pedida     INTEGER,
    cantidad_recibida   INTEGER,
    diferencia          INTEGER   -- pedida - recibida
);
```

---

# PARTE 7 — INVENTARIO

```sql
-- ============================================================
-- 7. INVENTARIO POR SUCURSAL (KARDEX) — CU22-CU26
-- ============================================================
CREATE TABLE inventario_stock (
    id_stock            SERIAL PRIMARY KEY,
    id_ptc              INTEGER REFERENCES producto_talla_color(id_ptc),
    id_sucursal         INTEGER REFERENCES sucursales(id_sucursal),
    cantidad_disponible INTEGER DEFAULT 0,
    cantidad_reservada  INTEGER DEFAULT 0,
    cantidad_vendida    INTEGER DEFAULT 0,
    stock_minimo_alert  INTEGER DEFAULT 0,
    UNIQUE (id_ptc, id_sucursal)
);

-- Kardex: historial de todos los movimientos IN/OUT
CREATE TABLE movimientos_inventario (
    id_movimiento       SERIAL PRIMARY KEY,
    id_ptc              INTEGER REFERENCES producto_talla_color(id_ptc),
    id_sucursal         INTEGER REFERENCES sucursales(id_sucursal),
    tipo_movimiento     VARCHAR(30), -- Recepción/Ajuste/Merma/Venta/Reserva/Devolución
    cantidad            INTEGER,     -- +entrada / -salida
    stock_anterior      INTEGER,
    stock_posterior     INTEGER,
    referencia          VARCHAR(120),
    id_usuario          INTEGER REFERENCES usuarios(id_usuario),
    id_orden_compra     INTEGER REFERENCES ordenes_compra(id_orden_compra),
    id_venta            INTEGER REFERENCES ventas(id_venta),
    id_reserva          INTEGER REFERENCES reservas(id_reserva),
    fecha               TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_mov_inv_ptc_suc ON movimientos_inventario (id_ptc, id_sucursal, fecha);

-- Configuración de alertas de stock mínimo (CU25)
CREATE TABLE alertas_stock_config (
    id_config           SERIAL PRIMARY KEY,
    id_ptc              INTEGER REFERENCES producto_talla_color(id_ptc),
    id_categoria        INTEGER REFERENCES categorias(id_categoria),
    id_sucursal         INTEGER REFERENCES sucursales(id_sucursal),
    stock_minimo        INTEGER,
    notificar_email     BOOLEAN DEFAULT false,
    ultima_notificacion TIMESTAMP,
    UNIQUE (id_ptc, id_sucursal)
);
```

---

# PARTE 8 — RESERVAS

```sql
-- ============================================================
-- 8. RESERVAS DE PRENDAS — CU28-CU31
-- ============================================================
CREATE TABLE reservas (
    id_reserva       SERIAL PRIMARY KEY,
    id_cliente       INTEGER REFERENCES clientes(id_cliente),
    id_usuario       INTEGER REFERENCES usuarios(id_usuario), -- referencia cliente (usuarios)
    id_sucursal      INTEGER REFERENCES sucursales(id_sucursal),
    fecha_reserva    DATE,
    hora_reserva     TIME,
    estado           VARCHAR(20) DEFAULT 'Solicitada', -- Solicitada/Preparada/En tienda/Cumplida/Cancelada
    id_encargado     INTEGER REFERENCES usuarios(id_usuario), -- encargado que prepara
    fecha_creacion   TIMESTAMP DEFAULT NOW(),
    fecha_preparada  TIMESTAMP,
    fecha_atendida   TIMESTAMP
);

CREATE TABLE reserva_items (
    id_reserva_item SERIAL PRIMARY KEY,
    id_reserva      INTEGER REFERENCES reservas(id_reserva) ON DELETE CASCADE,
    id_ptc          INTEGER REFERENCES producto_talla_color(id_ptc),
    cantidad        INTEGER DEFAULT 1
);
```

---

# PARTE 9 — VESTIDOR VIRTUAL RA

```sql
-- ============================================================
-- 9. VESTIDOR VIRTUAL RA (MÓVIL) — CU32
-- ============================================================
CREATE TABLE sesiones_ra (
    id_sesion_ra  SERIAL PRIMARY KEY,
    id_usuario    INTEGER REFERENCES usuarios(id_usuario),
    id_ptc        INTEGER REFERENCES producto_talla_color(id_ptc),
    medidas_avatar VARCHAR(120),  -- medidas estimadas del usuario
    fecha         TIMESTAMP DEFAULT NOW(),
    id_reserva    INTEGER REFERENCES reservas(id_reserva),
    id_carrito    INTEGER REFERENCES carritos(id_carrito)
);

CREATE TABLE resultados_prueba (
    id_resultado   SERIAL PRIMARY KEY,
    id_sesion_ra   INTEGER REFERENCES sesiones_ra(id_sesion_ra),
    id_ptc         INTEGER REFERENCES producto_talla_color(id_ptc),
    resultado      VARCHAR(20),  -- Gusta / No gusta
    fecha          TIMESTAMP DEFAULT NOW()
);
```

---

# PARTE 10 — CARRITO Y VENTAS

```sql
-- ============================================================
-- 10. CARRITO, VENTAS Y COMPROBANTES — CU33-CU39
-- ============================================================
CREATE TABLE carritos (
    id_carrito      SERIAL PRIMARY KEY,
    id_usuario      INTEGER REFERENCES usuarios(id_usuario),
    estado          VARCHAR(20) DEFAULT 'Activo', -- Activo/Convertido/Descartado
    id_sucursal     INTEGER REFERENCES sucursales(id_sucursal), -- sucursal de retiro
    fecha_creacion  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE carrito_items (
    id_carrito_item SERIAL PRIMARY KEY,
    id_carrito      INTEGER REFERENCES carritos(id_carrito) ON DELETE CASCADE,
    id_ptc          INTEGER REFERENCES producto_talla_color(id_ptc),
    cantidad        INTEGER DEFAULT 1,
    precio_unitario DECIMAL(10,2)
);

CREATE TABLE ventas (
    id_venta      SERIAL PRIMARY KEY,
    id_cliente    INTEGER REFERENCES clientes(id_cliente),
    id_usuario    INTEGER REFERENCES usuarios(id_usuario), -- comprador o cajero
    id_sucursal   INTEGER REFERENCES sucursales(id_sucursal),
    id_carrito    INTEGER REFERENCES carritos(id_carrito),
    modalidad     VARCHAR(20) NOT NULL, -- Digital / Presencial
    metodo_pago   VARCHAR(30),         -- Efectivo/Tarjeta/QR/Pasarela
    subtotal      DECIMAL(12,2),
    impuestos     DECIMAL(12,2),
    total         DECIMAL(12,2),
    estado        VARCHAR(20) DEFAULT 'Completada', -- Completada/Anulada
    fecha_venta   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE venta_items (
    id_venta_item   SERIAL PRIMARY KEY,
    id_venta        INTEGER REFERENCES ventas(id_venta) ON DELETE CASCADE,
    id_ptc          INTEGER REFERENCES producto_talla_color(id_ptc),
    cantidad        INTEGER,
    precio_unitario DECIMAL(10,2),
    subtotal        DECIMAL(12,2)
);

CREATE TABLE comprobantes (
    id_comprobante  SERIAL PRIMARY KEY,
    id_venta        INTEGER REFERENCES ventas(id_venta),
    numero          VARCHAR(30) UNIQUE,
    tipo            VARCHAR(20),   -- Factura/Boleta
    nit_cliente     VARCHAR(30),
    razon_social    VARCHAR(150),
    total           DECIMAL(12,2),
    fecha_emision   TIMESTAMP DEFAULT NOW(),
    pdf_url         TEXT
);
```

---

# PARTE 11 — PAGOS

```sql
-- ============================================================
-- 11. PASARELA DE PAGO — CU35
-- ============================================================
CREATE TABLE transacciones_pago (
    id_transaccion     SERIAL PRIMARY KEY,
    id_venta           INTEGER REFERENCES ventas(id_venta),
    id_usuario         INTEGER REFERENCES usuarios(id_usuario),
    proveedor_pasarela VARCHAR(40),   -- Stripe/PayPal/QR/BTC según integración
    monto              DECIMAL(12,2),
    moneda             VARCHAR(3) DEFAULT 'BOB',
    metodo             VARCHAR(30),   -- Debito/Credito/QR/Transferencia
    estado             VARCHAR(20) DEFAULT 'Pendiente', -- Aprobado/Rechazado/Pendiente
    referencia_externa VARCHAR(120),  -- id de la pasarela
    id_transaccion_pasarela VARCHAR(120),
    fecha_hora         TIMESTAMP DEFAULT NOW(),
    detalle            TEXT
);
```

---

# PARTE 12 — DEVOLUCIONES

```sql
-- ============================================================
-- 12. DEVOLUCIONES Y CAMBIOS — CU40
-- ============================================================
CREATE TABLE devoluciones (
    id_devolucion     SERIAL PRIMARY KEY,
    id_venta          INTEGER REFERENCES ventas(id_venta),
    id_usuario        INTEGER REFERENCES usuarios(id_usuario), -- quien gestiona
    id_sucursal       INTEGER REFERENCES sucursales(id_sucursal),
    motivo            VARCHAR(255),
    estado            VARCHAR(20) DEFAULT 'En trámite', -- En trámite/Procesada/Rechazada
    fecha_creacion    TIMESTAMP DEFAULT NOW(),
    fecha_procesada   TIMESTAMP
);

CREATE TABLE devolucion_items (
    id_devolucion_item SERIAL PRIMARY KEY,
    id_devolucion      INTEGER REFERENCES devoluciones(id_devolucion) ON DELETE CASCADE,
    id_ptc             INTEGER REFERENCES producto_talla_color(id_ptc),
    cantidad           INTEGER,
    tipo               VARCHAR(20) -- Devolución / Cambio
);
```

---

# PARTE 13 — IA

```sql
-- ============================================================
-- 13. INTELIGENCIA ARTIFICIAL — CU41-CU43
-- ============================================================
CREATE TABLE preferencias_cliente (
    id_preferencia SERIAL PRIMARY KEY,
    id_cliente     INTEGER REFERENCES clientes(id_cliente),
    id_categoria   INTEGER REFERENCES categorias(id_categoria),
    id_talla       INTEGER REFERENCES tallas(id_talla),
    id_color       INTEGER REFERENCES colores(id_color),
    id_temporada   INTEGER REFERENCES temporadas(id_temporada),
    puntaje        INTEGER
);

CREATE TABLE historial_navegacion (
    id_historial  SERIAL PRIMARY KEY,
    id_usuario    INTEGER REFERENCES usuarios(id_usuario),
    id_ptc        INTEGER REFERENCES producto_talla_color(id_ptc),
    fecha         TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recomendaciones_ia (
    id_recomendacion SERIAL PRIMARY KEY,
    id_usuario       INTEGER REFERENCES usuarios(id_usuario),
    id_ptc           INTEGER REFERENCES producto_talla_color(id_ptc),
    justificacion    TEXT,
    fecha            TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversaciones_ia (
    id_conversacion SERIAL PRIMARY KEY,
    id_usuario      INTEGER REFERENCES usuarios(id_usuario),
    mensaje         TEXT,
    respuesta       TEXT,
    fecha           TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reportes_generativos (
    id_reporte  SERIAL PRIMARY KEY,
    id_usuario  INTEGER REFERENCES usuarios(id_usuario),
    tipo        VARCHAR(40),   -- ventas/inventario/disponibilidad
    parametros  JSONB,
    formato     VARCHAR(10),   -- pdf/xlsx/csv
    url_archivo TEXT,
    fecha       TIMESTAMP DEFAULT NOW()
);
```

---

# PARTE 14 — RESPALDOS

```sql
-- ============================================================
-- 14. RESPALDOS — CU27
-- ============================================================
CREATE TABLE respaldos (
    id_respaldo   SERIAL PRIMARY KEY,
    fecha         TIMESTAMP DEFAULT NOW(),
    tipo          VARCHAR(20),   -- Manual / Automático
    tamano_bytes  BIGINT,
    estado        VARCHAR(20) DEFAULT 'En Progreso', -- En Progreso/Exitoso/Fallido
    storage_url   TEXT,
    creado_por    INTEGER REFERENCES usuarios(id_usuario)
);
```

---

# PARTE 15 — TRIGGERS Y PROCEDIMIENTOS ALMACENADOS

```sql
-- ============================================================
-- TRIGGERS
-- ============================================================

-- (Pendiente de detallar en fases siguientes: ver notas abajo)
```

> **Nota:** los triggers y procedimientos almacenados se documentan en el archivo
> `TRIGGERS Y PROCEDIMIENTOS.md` dentro de esta misma carpeta. Entre los previstos:
> - `trg_bloquear_usuario_5_intentos` — al alcanzar 5 intentos fallidos bloquea 15 min (CU01).
> - `trg_movimiento_inventario` — al insertar en `movimientos_inventario` recalcula stock (CU23).
> - `sp_registrar_venta` — transacción: valida stock, descuenta inventario, registra movimientos, emite comprobante (CU36-CU39).
> - `sp_registrar_reserva` — valida y reserva stock (CU28).
> - `sp_registrar_devolucion` — devuelve stock y genera movimiento (CU40).

---

# PARTE 16 — VISTAS MATERIALIZADAS (REPORTES)

```sql
-- (Pendiente en fase de Reportes/Dashboard CU44-CU46)
-- VISTA: existencias_consolidadas (CU26) — disponible/reservada/vendida/por_ingresar por sucursal
```

---

## NOTAS DE COHERENCIA CON DIAGRAMAS DE COMUNICACIÓN

- Cada **CE_** de los diagramas = una tabla de este documento.
- **CTRL_** (FastAPI) = routers + services que operan sobre estas tablas.
- **IU_** (Angular/Flutter) = componentes que consumen los endpoints.
- Los nombres de columnas y tablas son estables; los métodos de los diagramas los referencian.
- La BD soporta los 46 CU, los triggers/procedures y las vistas de reportes.
