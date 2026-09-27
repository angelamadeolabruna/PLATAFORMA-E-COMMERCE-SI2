-- =====================================================================
--  TIENDAS MONTAÑO  ·  CATÁLOGO DE CONSULTAS
--  E-commerce de ropa  ·  PostgreSQL 14+
--
--  PARA QUE SIRVE
--    El companion del script de población.  Estas consultas no modifican
--    nada: son SELECT, y se pueden copiar y pegar en psql, en DBeaver, en
--    TablePlus o en el propio panel de administración.
--
--    Van en ocho bloques, de lo general a lo que solo el modelo deja ver:
--
--      1  Catálogos y maestros      lo que se referencia siempre
--      2  Inventario                existencias, valoración y alertas
--      3  Ventas, pagos y comprobantes
--      4  Compras, recepción y proveedores
--      5  Reservas y vestidor virtual
--      6  Clientes e inteligencia artificial
--      7  Seguridad y roles
--      8  LAS CONSULTAS QUE EXPONEN LOS FALLOS DEL MODELO
--
--    El bloque 8 es el más útil para documentar el diseño de datos,
--    porque cada consulta es un problema real del esquema, con su
--    explicación y el dato que sale.
--
--  NOTA SOBRE LA MONEDA
--    Los importes están en bolivianos.   El símbolo de la moneda en el
--    proyecto es 'BOB' y está en transacciones_pago, en las ventas por
--    el precio y no como columna propia.
--
--  CÓMO SE USA
--    psql -U usuario -d tiendas_montano -f consultas.sql
--    O copia el bloque que quieras y pégalo en el cliente SQL.
-- =====================================================================


-- =====================================================================
-- 1. CATÁLOGOS Y MAESTROS
-- =====================================================================

-- 1.1  El catálogo completo, con su categoría, temporada, proveedor y las
--      combinaciones de talla y color que existen de verdad.
SELECT
    p.codigo,
    p.nombre                                   AS producto,
    c.nombre                                    AS categoria,
    t.nombre                                    AS temporada,
    pr.nombre_empresa                           AS proveedor,
    p.precio_base,
    COUNT(DISTINCT ptc.id_ptc)                   AS combinaciones,
    STRING_AGG(DISTINCT ta.nombre, ', '
               ORDER BY ta.orden)                AS tallas,
    STRING_AGG(DISTINCT col.nombre, ', ')        AS colores
FROM productos p
LEFT JOIN categorias  c    ON c.id_categoria  = p.id_categoria
LEFT JOIN temporadas  t    ON t.id_temporada  = p.id_temporada
LEFT JOIN proveedores pr   ON pr.id_proveedor  = p.id_proveedor
LEFT JOIN producto_talla_color ptc ON ptc.id_producto = p.id_producto
LEFT JOIN tallas      ta   ON ta.id_talla     = ptc.id_talla
LEFT JOIN colores     col  ON col.id_color    = ptc.id_color
GROUP BY p.id_producto, p.codigo, p.nombre, c.nombre, t.nombre, pr.nombre_empresa, p.precio_base
ORDER BY c.nombre, p.nombre;


-- 1.2  La ficha completa de una prenda: sus imágenes, sus tallas, sus
--      colores y su stock en las cuatro sucursales.
SELECT
    p.nombre                                       AS producto,
    ta.nombre                                      AS talla,
    col.nombre                                     AS color,
    ptc.id_ptc,
    ptc.estado_stock,
    COALESCE(s.nombre, '-')                        AS sucursal,
    COALESCE(s2.cantidad_disponible, 0)            AS disponible,
    COALESCE(s2.cantidad_reservada, 0)             AS reservada,
    COALESCE(s2.cantidad_vendida, 0)               AS vendida,
    COALESCE(s2.stock_minimo_alert, 0)             AS minimo_alerta
FROM producto_talla_color ptc
JOIN productos p  ON p.id_producto  = ptc.id_producto
LEFT JOIN tallas  ta ON ta.id_talla  = ptc.id_talla
LEFT JOIN colores col ON col.id_color = ptc.id_color
CROSS JOIN sucursales s
LEFT JOIN inventario_stock s2
       ON s2.id_ptc = ptc.id_ptc AND s2.id_sucursal = s.id_sucursal
ORDER BY p.nombre, ta.orden, col.nombre, s.nombre;


-- 1.3  Los precios vigentes, con el histórico de cambios de precio.
SELECT
    p.nombre  AS producto,
    ta.nombre AS talla,
    col.nombre AS color,
    pp.precio,
    pp.fecha_inicio,
    COALESCE(pp.fecha_fin::text, 'vigente') AS hasta
FROM producto_precios pp
JOIN producto_talla_color ptc ON ptc.id_ptc = pp.id_ptc
JOIN productos p ON p.id_producto = ptc.id_producto
LEFT JOIN tallas  ta  ON ta.id_talla  = ptc.id_talla
LEFT JOIN colores col ON col.id_color = ptc.id_color
ORDER BY p.nombre, pp.fecha_inicio DESC;


-- 1.4  Las colecciones y las prendas que las componen.
SELECT
    co.nombre        AS coleccion,
    t.nombre         AS temporada,
    p.codigo,
    p.nombre         AS producto,
    c.nombre         AS categoria
FROM colecciones co
LEFT JOIN temporadas t ON t.id_temporada = co.id_temporada
JOIN producto_coleccion pc ON pc.id_coleccion = co.id_coleccion
JOIN productos   p  ON p.id_producto     = pc.id_producto
LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
ORDER BY co.nombre, c.nombre, p.nombre;


-- 1.5  Los horarios de las cuatro sucursales, en una rejilla.
SELECT
    s.nombre AS sucursal,
    ci.nombre AS ciudad,
    d.dia,
    COALESCE(to_char(h.horario_apertura, 'HH24:MI'), 'cerrado') AS abre,
    COALESCE(to_char(h.horario_cierre,   'HH24:MI'), 'cerrado') AS cierra
FROM sucursales s
JOIN ciudades ci ON ci.id_ciudad = s.id_ciudad
CROSS JOIN (VALUES ('Lunes'), ('Martes'), ('Miercoles'), ('Jueves'),
                   ('Viernes'), ('Sabado'), ('Domingo')) AS d(dia)
LEFT JOIN sucursal_horarios h
       ON h.id_sucursal = s.id_sucursal AND h.dia_semana = d.dia
ORDER BY s.id_sucursal,
         CASE d.dia
           WHEN 'Lunes' THEN 1 WHEN 'Martes' THEN 2 WHEN 'Miercoles' THEN 3
           WHEN 'Jueves' THEN 4 WHEN 'Viernes' THEN 5 WHEN 'Sabado' THEN 6
           ELSE 7
         END;


-- =====================================================================
-- 2. INVENTARIO
-- =====================================================================

-- 2.1  Las existencias de la tienda, por prenda y por sucursal, con el
--      precio de referencia para valorar.
SELECT
    s.nombre        AS sucursal,
    p.codigo,
    p.nombre        AS producto,
    ta.nombre       AS talla,
    col.nombre      AS color,
    i.cantidad_disponible,
    i.cantidad_reservada,
    i.cantidad_vendida,
    i.stock_minimo_alert,
    (i.cantidad_disponible + i.cantidad_reservada + i.cantidad_vendida) AS total,
    (i.cantidad_disponible * p.precio_base) AS valor_disponible
FROM inventario_stock i
JOIN producto_talla_color ptc ON ptc.id_ptc = i.id_ptc
JOIN productos   p  ON p.id_producto  = ptc.id_producto
JOIN sucursales  s  ON s.id_sucursal  = i.id_sucursal
LEFT JOIN tallas  ta ON ta.id_talla    = ptc.id_talla
LEFT JOIN colores col ON col.id_color = ptc.id_color
ORDER BY s.nombre, p.nombre, ta.orden;


-- 2.2  LA CONSULTA DE ALERTAS DE STOCK BAJO.  Esta es la que ejecuta el
--      módulo de inventario, y es la que NO funciona: mira
--      estado_stock, y esa columna no la escribe nadie, así que siempre
--      dice 'Disponible' y esto nunca sale.  La versión que SÍ funciona
--      está en 2.3, y usa la cantidad de verdad.
SELECT
    p.nombre  AS producto,
    ta.nombre AS talla,
    col.nombre AS color,
    s.nombre  AS sucursal,
    i.cantidad_disponible,
    ptc.estado_stock,
    i.stock_minimo_alert
FROM inventario_stock i
JOIN producto_talla_color ptc ON ptc.id_ptc = i.id_ptc
JOIN productos  p ON p.id_producto = ptc.id_producto
JOIN sucursales s ON s.id_sucursal = i.id_sucursal
LEFT JOIN tallas  ta ON ta.id_talla  = ptc.id_talla
LEFT JOIN colores col ON col.id_color = ptc.id_color
WHERE ptc.estado_stock = 'Sin stock'
   OR i.cantidad_disponible <= i.stock_minimo_alert
ORDER BY i.cantidad_disponible;


-- 2.3  La misma alerta, pero con la CANTIDAD, que es lo único que
--      funciona.  Si el catálogo necesita alertas, esta es la que hay
--      que usar, porque no depende de estado_stock.
SELECT
    s.nombre AS sucursal,
    c.nombre AS categoria,
    p.nombre AS producto,
    ta.nombre AS talla,
    col.nombre AS color,
    i.cantidad_disponible,
    i.stock_minimo_alert,
    (i.stock_minimo_alert - i.cantidad_disponible) AS faltante
FROM inventario_stock i
JOIN producto_talla_color ptc ON ptc.id_ptc = i.id_ptc
JOIN productos  p  ON p.id_producto  = ptc.id_producto
JOIN sucursales s  ON s.id_sucursal  = i.id_sucursal
LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
LEFT JOIN tallas  ta ON ta.id_talla  = ptc.id_talla
LEFT JOIN colores col ON col.id_color = ptc.id_color
WHERE i.cantidad_disponible <= i.stock_minimo_alert
ORDER BY faltante DESC, p.nombre;


-- 2.4  La valoración del inventario, por sucursal y por categoría.
--      Nota: usa precio_base, no producto_precios, porque producto_precios
--      tiene varias filas por ptc y habría que quedarse con la vigente.
SELECT
    s.nombre AS sucursal,
    c.nombre AS categoria,
    COUNT(DISTINCT i.id_ptc)                 AS prendas,
    SUM(i.cantidad_disponible)               AS unidades,
    SUM(i.cantidad_disponible * p.precio_base) AS valor_bolivianos
FROM inventario_stock i
JOIN producto_talla_color ptc ON ptc.id_ptc = i.id_ptc
JOIN productos  p ON p.id_producto = ptc.id_producto
JOIN sucursales s ON s.id_sucursal = i.id_sucursal
LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
GROUP BY s.nombre, c.nombre
ORDER BY s.nombre, valor_bolivianos DESC;


-- 2.5  El KARDEX de una prenda y una sucursal, en orden de fecha, con el
--      signo corregido.  La columna 'cantidad' sale tal cual está; la
--      columna 'cantidad_en_kardex' es la que ve el administrador, y por
--      eso hay dos consultas: 2.5 la correcta y 8.5 la que hay.
SELECT
    m.fecha,
    m.tipo_movimiento,
    m.cantidad,
    m.stock_anterior,
    m.stock_posterior,
    m.referencia,
    COALESCE(v.numero, 'VNT-' || m.id_venta) AS comprobante,
    p.nombre AS producto,
    ta.nombre AS talla,
    col.nombre AS color
FROM movimientos_inventario m
JOIN producto_talla_color ptc ON ptc.id_ptc = m.id_ptc
JOIN productos p  ON p.id_producto  = ptc.id_producto
LEFT JOIN tallas  ta ON ta.id_talla  = ptc.id_talla
LEFT JOIN colores col ON col.id_color = ptc.id_color
LEFT JOIN comprobantes v ON v.id_venta = m.id_venta
WHERE m.id_ptc = 1 AND m.id_sucursal = 1
ORDER BY m.fecha, m.id_movimiento;


-- 2.6  Los movimientos de un pedido de compra, con su orden.
SELECT
    oc.numero       AS orden,
    oc.fecha_orden,
    pr.nombre_empresa AS proveedor,
    p.nombre        AS producto,
    ta.nombre       AS talla,
    col.nombre      AS color,
    oi.cantidad,
    oi.precio_unitario,
    oi.subtotal
FROM orden_compra_items oi
JOIN ordenes_compra oc ON oc.id_orden_compra = oi.id_orden_compra
JOIN proveedores   pr ON pr.id_proveedor    = oc.id_proveedor
JOIN producto_talla_color ptc ON ptc.id_ptc = oi.id_ptc
JOIN productos p  ON p.id_producto  = ptc.id_producto
LEFT JOIN tallas  ta ON ta.id_talla  = ptc.id_talla
LEFT JOIN colores col ON col.id_color = ptc.id_color
ORDER BY oc.numero, p.nombre;


-- =====================================================================
-- 3. VENTAS, PAGOS Y COMPROBANTES
-- =====================================================================

-- 3.1  El detalle de una venta, con su cliente, sus items y su
--      comprobante.  Sirve para el comprobante y para la vista de admin.
SELECT
    v.id_venta,
    v.fecha_venta,
    v.modalidad,
    v.metodo_pago,
    v.estado,
    cl.nombre AS cliente,
    s.nombre  AS sucursal,
    p.nombre  AS producto,
    ta.nombre AS talla,
    col.nombre AS color,
    vi.cantidad,
    vi.precio_unitario,
    vi.subtotal,
    cb.numero AS comprobante,
    cb.pdf_url
FROM ventas v
LEFT JOIN clientes   cl ON cl.id_cliente  = v.id_cliente
LEFT JOIN sucursales  s  ON s.id_sucursal  = v.id_sucursal
LEFT JOIN venta_items vi ON vi.id_venta    = v.id_venta
LEFT JOIN producto_talla_color ptc ON ptc.id_ptc = vi.id_ptc
LEFT JOIN productos p  ON p.id_producto  = ptc.id_producto
LEFT JOIN tallas  ta ON ta.id_talla  = ptc.id_talla
LEFT JOIN colores col ON col.id_color = ptc.id_color
LEFT JOIN comprobantes cb ON cb.id_venta = v.id_venta
ORDER BY v.id_venta, vi.id_venta_item;


-- 3.2  Las ventas por mes y por sucursal, con su conversión a digital.
--      La modalidad sale del dato real, no de un porcentaje inventado.
SELECT
    date_trunc('month', v.fecha_venta)::date              AS mes,
    s.nombre                                                AS sucursal,
    COUNT(DISTINCT v.id_venta)                              AS ventas,
    COUNT(*) FILTER (WHERE v.modalidad = 'Online')          AS online,
    COUNT(*) FILTER (WHERE v.modalidad = 'Presencial')      AS presencial,
    ROUND(100.0 * COUNT(*) FILTER (WHERE v.modalidad = 'Online')
                / NULLIF(COUNT(*), 0), 1)                   AS porcentaje_online,
    SUM(v.subtotal)                                         AS subtotal_bolivianos,
    SUM(v.impuestos)                                        AS impuestos_bolivianos,
    SUM(v.total)                                            AS total_bolivianos
FROM ventas v
JOIN sucursales s ON s.id_sucursal = v.id_sucursal
WHERE v.estado = 'Completada'
GROUP BY 1, s.nombre
ORDER BY 1 DESC, total_bolivianos DESC;


-- 3.3  Los productos más vendidos, por unidades y por dinero, con su
--      categoría.  Se usa la categoría del producto, no la del ptc.
SELECT
    c.nombre  AS categoria,
    p.codigo,
    p.nombre  AS producto,
    SUM(vi.cantidad)                              AS unidades_vendidas,
    COUNT(DISTINCT vi.id_venta)                   AS ventas,
    SUM(vi.subtotal)                              AS facturado_bolivianos,
    ROUND(AVG(vi.precio_unitario), 2)             AS precio_medio
FROM venta_items vi
JOIN ventas v  ON v.id_venta  = vi.id_venta
JOIN producto_talla_color ptc ON ptc.id_ptc = vi.id_ptc
JOIN productos p ON p.id_producto = ptc.id_producto
LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
WHERE v.estado = 'Completada'
GROUP BY c.nombre, p.codigo, p.nombre
ORDER BY unidades_vendidas DESC
LIMIT 25;


-- 3.4  Las prendas que NO se venden nunca.  Con el stock que tienen
--      guardado, que es dinero parado.
SELECT
    s.nombre  AS sucursal,
    p.codigo,
    p.nombre  AS producto,
    ta.nombre AS talla,
    col.nombre AS color,
    i.cantidad_disponible,
    i.cantidad_disponible * p.precio_base AS dinero_parado
FROM inventario_stock i
JOIN producto_talla_color ptc ON ptc.id_ptc = i.id_ptc
JOIN productos  p ON p.id_producto = ptc.id_producto
JOIN sucursales s ON s.id_sucursal = i.id_sucursal
LEFT JOIN tallas  ta ON ta.id_talla  = ptc.id_talla
LEFT JOIN colores col ON col.id_color = ptc.id_color
LEFT JOIN (SELECT DISTINCT id_ptc FROM venta_items) v ON v.id_ptc = i.id_ptc
WHERE v.id_ptc IS NULL
  AND i.cantidad_disponible > 0
ORDER BY dinero_parado DESC;


-- 3.5  Los métodos de pago, con su parte sobre el total.  La columna
--      metodo_pago existe en el esquema y el proyecto la usaba en
--      contadas oportunidades; estas son las que se han escrito.
SELECT
    COALESCE(v.metodo_pago, 'sin metodo') AS metodo,
    COUNT(*)         AS ventas,
    SUM(v.total)     AS total_bolivianos,
    ROUND(100.0 * SUM(v.total) / NULLIF(SUM(SUM(v.total)) OVER (), 0), 1) AS porcentaje
FROM ventas v
WHERE v.estado = 'Completada'
GROUP BY COALESCE(v.metodo_pago, 'sin metodo')
ORDER BY total_bolivianos DESC;


-- 3.6  El ticket medio, por modalidad y por sucursal.
SELECT
    v.modalidad,
    s.nombre  AS sucursal,
    COUNT(*)   AS ventas,
    ROUND(AVG(v.total), 2)  AS ticket_medio,
    MIN(v.total)            AS venta_mas_barata,
    MAX(v.total)            AS venta_mas_cara
FROM ventas v
JOIN sucursales s ON s.id_sucursal = v.id_sucursal
WHERE v.estado = 'Completada'
GROUP BY v.modalidad, s.nombre
ORDER BY v.modalidad, ticket_medio DESC;


-- 3.7  Las transacciones de pago y su estado real.  El sandbox se ve
--      aqui: las que quedan en Pendiente son las que el banco no ha
--      contestado, y en produccion no las aprueba nadie.
SELECT
    t.id_transaccion,
    t.fecha_hora,
    v.id_venta,
    cl.nombre  AS cliente,
    t.proveedor_pasarela,
    t.metodo,
    t.monto,
    t.moneda,
    t.estado,
    t.referencia_externa,
    t.detalle
FROM transacciones_pago t
LEFT JOIN ventas v   ON v.id_venta   = t.id_venta
LEFT JOIN clientes cl ON cl.id_cliente = v.id_cliente
ORDER BY t.fecha_hora DESC;


-- 3.8  Las ventas cuyo pago NO está aprobado.  En la caja, una venta
--      Cobrada tiene que tener su pago en Aprobado; si no, es dinero
--      que se ha entregado y no se ha cobrado.
SELECT
    v.id_venta,
    v.fecha_venta,
    cl.nombre AS cliente,
    v.total,
    t.estado  AS estado_del_pago,
    t.metodo,
    t.proveedor_pasarela
FROM ventas v
LEFT JOIN transacciones_pago t ON t.id_venta = v.id_venta
LEFT JOIN clientes cl ON cl.id_cliente = v.id_cliente
WHERE v.estado = 'Completada'
  AND (t.estado IS NULL OR t.estado <> 'Aprobado')
ORDER BY v.fecha_venta DESC;


-- 3.9  Los comprobantes emitidos, con su correlación, para el informe
--      contable del mes.
SELECT
    cb.numero,
    cb.tipo,
    cb.nit_cliente,
    cb.razon_social,
    cb.total,
    cb.fecha_emision,
    v.modalidad,
    s.nombre AS sucursal
FROM comprobantes cb
JOIN ventas v    ON v.id_venta    = cb.id_venta
JOIN sucursales s ON s.id_sucursal = v.id_sucursal
ORDER BY cb.fecha_emision DESC;


-- =====================================================================
-- 4. COMPRAS, RECEPCIÓN Y PROVEEDORES
-- =====================================================================

-- 4.1  Las órdenes de compra con su Reception, y si llegaron completas.
--      El porcentaje se calcula con los items, que es donde está el dato.
SELECT
    oc.numero,
    oc.fecha_orden,
    pr.nombre_empresa AS proveedor,
    s.nombre          AS sucursal destino,
    oc.estado,
    oc.fecha_estimada_entrega,
    oc.fecha_recepcion,
    (oc.fecha_recepcion::date - oc.fecha_orden::date) AS dias_de_retraso,
    COUNT(oi.id_orden_item)     AS lineas_pedidas,
    COALESCE(SUM(oi.cantidad), 0) AS unidades_pedidas,
    COALESCE(SUM(ri.cantidad_recibida), 0) AS unidades_recibidas,
    COALESCE(SUM(ri.diferencia), 0)          AS faltantes
FROM ordenes_compra oc
LEFT JOIN proveedores  pr ON pr.id_proveedor = oc.id_proveedor
LEFT JOIN sucursales   s  ON s.id_sucursal   = oc.id_sucursal
LEFT JOIN orden_compra_items oi ON oi.id_orden_compra = oc.id_orden_compra
LEFT JOIN recepciones r  ON r.id_orden_compra = oc.id_orden_compra
LEFT JOIN recepcion_items ri ON ri.id_recepcion = r.id_recepcion
WHERE oc.estado = 'Recibida'
GROUP BY oc.id_orden_compra, oc.numero, oc.fecha_orden, pr.nombre_empresa,
         s.nombre, oc.estado, oc.fecha_estimada_entrega, oc.fecha_recepcion
ORDER BY oc.fecha_orden DESC;


-- 4.2  Los proveedores con suscore de calidad, su puntualidad REAL y
--      cuánto se les ha comprado.  La puntualidad sale de las fechas,
--      no de un campo, porque no hay ninguno.
SELECT
    pr.id_proveedor,
    pr.nombre_empresa,
    pr.persona_contacto,
    pr.email,
    pr.telefono,
    pr.tiempo_entrega_dias  AS plazo_prometido,
    ROUND(AVG(oc.fecha_recepcion::date - oc.fecha_orden::date), 1) AS dias_reales_promedio,
    pr.calidad_score,
    pr.estado_riesgo,
    COUNT(oc.id_orden_compra)      AS ordenes,
    COALESCE(SUM(oc.total), 0)     AS comprado_bolivianos
FROM proveedores pr
LEFT JOIN ordenes_compra oc ON oc.id_proveedor = pr.id_proveedor
                         AND oc.estado = 'Recibida'
GROUP BY pr.id_proveedor, pr.nombre_empresa, pr.persona_contacto, pr.email,
         pr.telefono, pr.tiempo_entrega_dias, pr.calidad_score, pr.estado_riesgo
ORDER BY comprado_bolivianos DESC;


-- 4.3  Las recepciones con diferencias.  Una diferencia distinta de cero
--      significa que se pidió una cosa y llegó otra, y el único sitio
--      donde se guarda es recepcion_items.diferencia.
SELECT
    oc.numero       AS orden,
    pr.nombre_empresa AS proveedor,
    r.fecha_recepcion,
    p.nombre        AS producto,
    ta.nombre       AS talla,
    col.nombre      AS color,
    ri.cantidad_pedida,
    ri.cantidad_recibida,
    ri.diferencia
FROM recepcion_items ri
JOIN recepciones r       ON r.id_recepcion  = ri.id_recepcion
JOIN ordenes_compra oc   ON oc.id_orden_compra = r.id_orden_compra
LEFT JOIN proveedores pr ON pr.id_proveedor  = oc.id_proveedor
JOIN producto_talla_color ptc ON ptc.id_ptc = ri.id_ptc
JOIN productos p  ON p.id_producto  = ptc.id_producto
LEFT JOIN tallas  ta ON ta.id_talla  = ptc.id_talla
LEFT JOIN colores col ON col.id_color = ptc.id_color
WHERE ri.diferencia <> 0
ORDER BY r.fecha_recepcion DESC;


-- 4.4  Los contactos de cada proveedor, para la pantalla de compras.
SELECT
    pr.nombre_empresa AS proveedor,
    pr.estado_riesgo,
    pc.nombre  AS contacto,
    pc.cargo,
    pc.telefono,
    pc.email
FROM proveedores pr
LEFT JOIN proveedor_contactos pc ON pc.id_proveedor = pr.id_proveedor
ORDER BY pr.nombre_empresa, pc.nombre;


-- =====================================================================
-- 5. RESERVAS Y VESTIDOR VIRTUAL
-- =====================================================================

-- 5.1  Las reservas con su cliente, su prenda y en qué estado del
--      recorrido está.  Los tres estados intermedios tienen su fecha.
SELECT
    r.id_reserva,
    r.fecha_reserva,
    r.hora_reserva,
    cl.nombre AS cliente,
    s.nombre  AS sucursal,
    r.estado,
    p.nombre  AS producto,
    ta.nombre AS talla,
    col.nombre AS color,
    ri.cantidad,
    COALESCE(u.nombre, '(sin asignar)') AS encargado,
    r.fecha_creacion,
    r.fecha_preparada,
    r.fecha_atendida
FROM reservas r
LEFT JOIN clientes  cl ON cl.id_cliente = r.id_cliente
LEFT JOIN sucursales s  ON s.id_sucursal = r.id_sucursal
LEFT JOIN reserva_items ri ON ri.id_reserva = r.id_reserva
LEFT JOIN producto_talla_color ptc ON ptc.id_ptc = ri.id_ptc
LEFT JOIN productos p  ON p.id_producto  = ptc.id_producto
LEFT JOIN tallas  ta ON ta.id_talla  = ptc.id_talla
LEFT JOIN colores col ON col.id_color = ptc.id_color
LEFT JOIN usuarios_empleados u ON u.usuario_id = r.id_encargado
ORDER BY r.fecha_reserva DESC, r.hora_reserva DESC;


-- 5.2  Las reservas que llevan días en el mismo estado.  Es la consulta
--      de la bandeja de trabajo del vendedor: qué hay que empujar hoy.
SELECT
    r.estado,
    r.id_reserva,
    cl.nombre AS cliente,
    r.fecha_reserva,
    s.nombre  AS sucursal,
    (CURRENT_DATE - r.fecha_reserva) AS dias_en_este_estado,
    COUNT(ri.id_reserva_item) AS prendas
FROM reservas r
LEFT JOIN clientes cl ON cl.id_cliente = r.id_cliente
LEFT JOIN sucursales s ON s.id_sucursal = r.id_sucursal
LEFT JOIN reserva_items ri ON ri.id_reserva = r.id_reserva
WHERE r.estado IN ('Solicitada', 'En tienda')
GROUP BY r.estado, r.id_reserva, cl.nombre, r.fecha_reserva, s.nombre
ORDER BY dias_en_este_estado DESC;


-- 5.3  Los tiempos del recorrido de una reserva: cuánto tarda en
--      comprobarse y en atenderse.  Si alguna fecha falta, sale NULL, que
--      es exactamente lo que pasa con las que están en 'Solicitada'.
SELECT
    r.id_reserva,
    r.estado,
    r.fecha_creacion,
    r.fecha_preparada,
    r.fecha_atendida,
    r.fecha_preparada - r.fecha_creacion AS horas_para_preparar,
    r.fecha_atendida  - r.fecha_creacion AS horas_hasta_atender
FROM reservas r
WHERE r.estado IN ('En tienda', 'Cumplida')
ORDER BY r.id_reserva;


-- 5.4  El vestidor virtual: qué prenda se virtualization y qué se elige.
--      OJO: CU24 LICITÓ que la columna foto_resultado se escribe desde el
--      código y NO EXISTE en el esquema, así que aquí no aparece.
SELECT
    s.id_sesion_ra,
    s.fecha,
    u.email AS usuario,
    p.nombre  AS prenda_probada,
    ta.nombre AS talla,
    col.nombre AS color,
    rp.resultado,
    r.id_reserva,
    sc.id_carrito,
    s.medidas_avatar
FROM sesiones_ra s
LEFT JOIN usuarios u ON u.id_usuario = s.id_usuario
LEFT JOIN producto_talla_color ptc ON ptc.id_ptc = s.id_ptc
LEFT JOIN productos p  ON p.id_producto  = ptc.id_producto
LEFT JOIN tallas  ta ON ta.id_talla  = ptc.id_talla
LEFT JOIN colores col ON col.id_color = ptc.id_color
LEFT JOIN resultados_prueba rp ON rp.id_sesion_ra = s.id_sesion_ra
LEFT JOIN reservas r ON r.id_reserva = s.id_reserva
LEFT JOIN carritos sc ON sc.id_carrito = s.id_carrito
ORDER BY s.fecha DESC;


-- 5.5  La conversión del vestidor: cuántas prendas se probaron y cuántas
--      Acabaron en el carrito.  Esta es la métrica del módulo.
SELECT
    u.email,
    COUNT(DISTINCT s.id_sesion_ra)                             AS sesiones,
    COUNT(rp.id_resultado)                                     AS prendas_probadas,
    COUNT(rp.id_resultado) FILTER (WHERE rp.resultado = 'Gusta')  AS los_que_te_gustaron,
    COUNT(DISTINCT s.id_carrito)                                AS carritos_generados,
    COUNT(DISTINCT s.id_reserva)                                AS reservas_generadas
FROM sesiones_ra s
LEFT JOIN usuarios u ON u.id_usuario = s.id_usuario
LEFT JOIN resultados_prueba rp ON rp.id_sesion_ra = s.id_sesion_ra
GROUP BY u.email
ORDER BY prendas_probadas DESC;


-- =====================================================================
-- 6. CLIENTES E INTELIGENCIA ARTIFICIAL
-- =====================================================================

-- 6.1  La ficha de cada cliente con su usuario, sus compras y su ropa
--      favorita.  Es la vista de la pantalla de clientes.
SELECT
    cl.id_cliente,
    cl.nombre,
    cl.telefono,
    cl.direccion,
    u.email,
    u.estado AS estado_del_usuario,
    u.fecha_ultimo_acceso,
    COUNT(DISTINCT v.id_venta)                          AS compras,
    COALESCE(SUM(v.total) FILTER (WHERE v.estado = 'Completada'), 0) AS gastado_bolivianos,
    MAX(v.fecha_venta)                                  AS ultima_compra,
    COUNT(DISTINCT r.id_reserva)                        AS reservas,
    (SELECT COUNT(*) FROM preferencias_cliente pc WHERE pc.id_cliente = cl.id_cliente) AS preferencias
FROM clientes cl
LEFT JOIN usuarios  u ON u.id_usuario = cl.usuario_id
LEFT JOIN ventas    v ON v.id_cliente = cl.id_cliente
LEFT JOIN reservas  r ON r.id_cliente = r.id_cliente
GROUP BY cl.id_cliente, cl.nombre, cl.telefono, cl.direccion,
         u.email, u.estado, u.fecha_ultimo_acceso
ORDER BY gastado_bolivianos DESC;


-- 6.2  Las preferencias declaradas de un cliente, tal y como están.  Se
--      ve aquí lo del hallazgo: las 5 referencias son NULLABLE, así que
--      hay filas que no dicen nada, y no hay UNIQUE, así que se repiten.
SELECT
    cl.nombre AS cliente,
    pc.id_preferencia,
    COALESCE(c.nombre,  '-')  AS categoria,
    COALESCE(ta.nombre, '-')   AS talla,
    COALESCE(col.nombre, '-') AS color,
    COALESCE(t.nombre, '-')   AS temporada,
    COALESCE(pc.puntaje, 0)   AS puntaje,
    (CASE WHEN pc.id_categoria IS NULL THEN 1 ELSE 0 END
     + CASE WHEN pc.id_talla     IS NULL THEN 1 ELSE 0 END
     + CASE WHEN pc.id_color     IS NULL THEN 1 ELSE 0 END
     + CASE WHEN pc.id_temporada IS NULL THEN 1 ELSE 0 END) AS referencias_nulas
FROM preferencias_cliente pc
JOIN clientes cl ON cl.id_cliente = pc.id_cliente
LEFT JOIN categorias c  ON c.id_categoria  = pc.id_categoria
LEFT JOIN tallas     ta ON ta.id_talla     = pc.id_talla
LEFT JOIN colores    col ON col.id_color    = pc.id_color
LEFT JOIN temporadas t  ON t.id_temporada  = pc.id_temporada
ORDER BY cl.nombre, pc.puntaje DESC NULLS LAST;


-- 6.3  Las preferencias INÚTILES: filas que no dicen nada de nada, que
--      el esquema permite porque las 5 referencias son NULLABLE.
SELECT
    cl.nombre AS cliente,
    COUNT(*)   AS preferencias_vacias,
    'el motor las lee igual y devuelve la fuente populares_temporada' AS que_pasa
FROM preferencias_cliente pc
JOIN clientes cl ON cl.id_cliente = pc.id_cliente
WHERE pc.id_categoria IS NULL
  AND pc.id_talla     IS NULL
  AND pc.id_color     IS NULL
  AND pc.id_temporada IS NULL
GROUP BY cl.nombre;


-- 6.4  Los clientes SIN preferencias registradas, que son los que el
--      motor de recomendaciones trata como 'populares_temporada'.
SELECT
    cl.id_cliente,
    cl.nombre,
    u.email,
    COUNT(v.id_venta) AS compras,
    'populares_temporada' AS fuente_que_usaria_el_motor
FROM clientes cl
LEFT JOIN usuarios u ON u.id_usuario = cl.usuario_id
LEFT JOIN ventas   v ON v.id_cliente = cl.id_cliente
WHERE NOT EXISTS (SELECT 1 FROM preferencias_cliente pc WHERE pc.id_cliente = cl.id_cliente)
GROUP BY cl.id_cliente, cl.nombre, u.email
ORDER BY compras DESC;


-- 6.5  El historial de navegación con el nombre de la prenda, que es lo
--      que se necesita para saber qué vio y cuándo.
SELECT
    h.fecha,
    u.email,
    p.nombre AS prenda,
    ta.nombre AS talla,
    col.nombre AS color
FROM historial_navegacion h
LEFT JOIN usuarios u ON u.id_usuario = h.id_usuario
LEFT JOIN producto_talla_color ptc ON ptc.id_ptc = h.id_ptc
LEFT JOIN productos p  ON p.id_producto  = ptc.id_producto
LEFT JOIN tallas  ta ON ta.id_talla  = ptc.id_talla
LEFT JOIN colores col ON col.id_color = ptc.id_color
ORDER BY h.fecha DESC
LIMIT 100;


-- 6.6  Las recomendaciones con su justificación, que es lo que la
--      pantalla muestra como motivo de la sugerencia.
SELECT
    r.fecha,
    u.email,
    p.nombre AS prenda_recomendada,
    r.justificacion
FROM recomendaciones_ia r
LEFT JOIN usuarios u ON u.id_usuario = r.id_usuario
LEFT JOIN producto_talla_color ptc ON ptc.id_ptc = r.id_ptc
LEFT JOIN productos p ON p.id_producto = ptc.id_producto
ORDER BY r.fecha DESC;


-- 6.7  Las conversaciones con la IA, para revisar qué se le pregunta.
SELECT
    c.fecha,
    u.email,
    c.mensaje,
    c.respuesta
FROM conversaciones_ia c
LEFT JOIN usuarios u ON u.id_usuario = c.id_usuario
ORDER BY c.fecha DESC;


-- 6.8  Qué prendas se recommending más, cruzando el histórico con las
--      recomendaciones.  Sirve para ver si el motor insiste.
SELECT
    p.nombre AS prenda,
    (SELECT COUNT(*) FROM historial_navegacion h WHERE h.id_ptc = ptc.id_ptc) AS veces_vista,
    (SELECT COUNT(*) FROM recomendaciones_ia r   WHERE r.id_ptc = ptc.id_ptc) AS veces_recomendada,
    (SELECT COUNT(*) FROM venta_items vi        WHERE vi.id_ptc = ptc.id_ptc) AS veces_vendida
FROM producto_talla_color ptc
JOIN productos p ON p.id_producto = ptc.id_producto
WHERE (SELECT COUNT(*) FROM historial_navegacion h WHERE h.id_ptc = ptc.id_ptc) > 0
   OR (SELECT COUNT(*) FROM recomendaciones_ia r   WHERE r.id_ptc = ptc.id_ptc) > 0
ORDER BY veces_recomendada DESC, veces_vista DESC;


-- =====================================================================
-- 7. SEGURIDAD Y ROLES
-- =====================================================================

-- 7.1  Quién es quién en el sistema: usuario, rol, sucursal y si sigue
--      de alta.  El filtro de fecha_baja es el que CU29 audited y es el
--      único que no está en todos los sitios del código.
SELECT
    u.id_usuario,
    u.email,
    ue.rol,
    s.nombre AS sucursal,
    ue.fecha_baja,
    ue.motivo_baja,
    CASE WHEN ue.fecha_baja IS NULL THEN 'activo' ELSE 'de baja' END AS situacion,
    STRING_AGG(r.nombre_rol, ', ' ORDER BY r.nombre_rol) AS roles
FROM usuarios u
LEFT JOIN usuarios_empleados ue ON ue.usuario_id = u.id_usuario
LEFT JOIN sucursales s ON s.id_sucursal = ue.sucursal_id
LEFT JOIN usuarios_roles ur ON ur.id_usuario = u.id_usuario
LEFT JOIN roles r ON r.id_rol = ur.id_rol
GROUP BY u.id_usuario, u.email, ue.rol, s.nombre, ue.fecha_baja, ue.motivo_baja
ORDER BY situacion, s.nombre, u.email;


-- 7.2  Los permisos declarados de cada rol, del JSONB directamente, sin
--      interpretarlos.  El asterisco es el de administrador.
SELECT
    r.nombre_rol,
    r.estado,
    jsonb_array_length(r.permisos_json) AS numero_de_permisos,
    ('["*"]'::jsonb = r.permisos_json)    AS es_superusuario,
    r.permisos_json
FROM roles r
ORDER BY r.nombre_rol;


-- 7.3  Quién puede cobrar.  La respuesta sale de los permisos del rol,
--      y aquí se ve que 'procesar_pago' y 'registrar_venta' son los que
--      separan al vendedor del resto.
SELECT
    u.email,
    ue.rol,
    s.nombre AS sucursal,
    (r.permisos_json @> '["procesar_pago"]'::jsonb)   AS puede_cobrar,
    (r.permisos_json @> '["gestionar_devoluciones"]'::jsonb) AS puede_devolver,
    (r.permisos_json @> '["gestionar_usuarios"]'::jsonb)    AS puede_gestionar_usuarios
FROM usuarios u
JOIN usuarios_roles ur ON ur.id_usuario = u.id_usuario
JOIN roles r ON r.id_rol = ur.id_rol
LEFT JOIN usuarios_empleados ue ON ue.usuario_id = u.id_usuario
LEFT JOIN sucursales s ON s.id_sucursal = ue.sucursal_id
ORDER BY puede_cobrar DESC, u.email;


-- 7.4  Los usuarios pendientes de confirmar, y los que llevan intentos
--      fallidos.  Los dos grupos que la aplicación tiene que limpiar.
SELECT
    u.id_usuario,
    u.email,
    u.estado,
    u.intentos_fallidos,
    u.bloqueado_hasta,
    u.fecha_creacion,
    CASE
      WHEN u.estado = 'Pendiente'              THEN 'sin confirmar el correo'
      WHEN u.bloqueado_hasta IS NOT NULL
       AND u.bloqueado_hasta > NOW()           THEN 'bloqueado'
      WHEN u.intentos_fallidos >= 3            THEN 'tres o mas fallos'
      ELSE 'ok'
    END AS situacion
FROM usuarios u
WHERE u.estado <> 'Activo'
   OR u.intentos_fallidos >= 3
   OR (u.bloqueado_hasta IS NOT NULL AND u.bloqueado_hasta > NOW())
ORDER BY u.estado, u.intentos_fallidos DESC;


-- 7.5  Las sesiones abiertas y los tokens revocados.  token_blacklist
--      es lo que impide que un refresh token siga valiendo.
SELECT
    'sesion' AS tipo,
    s.id_sesion AS id,
    u.email,
    s.ip_origen,
    s.fecha_inicio,
    s.fecha_fin,
    s.activa
FROM sesiones s
LEFT JOIN usuarios u ON u.id_usuario = s.id_usuario
WHERE s.activa
UNION ALL
SELECT
    'revocado',
    t.id_token,
    u.email,
    NULL,
    t.revocado_en,
    t.expira_en,
    FALSE
FROM token_blacklist t
LEFT JOIN usuarios u ON u.id_usuario = t.id_usuario
ORDER BY tipo, id;


-- 7.6  La bitácora, que es la única pista cuando algo sale mal.  Y aquí
--      se ve el ON DELETE SET NULL de la L150: el registro 12 se queda
--      sin usuario porque su autor se borró, y eso es lo correcto.
SELECT
    b.fecha_hora,
    u.email AS autor,
    b.accion_sql,
    b.tabla_afectada,
    b.id_registro,
    b.detalle,
    b.ip_address
FROM bitacora_auditoria b
LEFT JOIN usuarios u ON u.id_usuario = b.id_usuario
ORDER BY b.fecha_hora DESC
LIMIT 100;


-- =====================================================================
-- 8. LAS CONSULTAS QUE EXPONEN LOS FALLOS DEL MODELO
--
-- Cada consulta es un problema REAL del esquema, con su explicación.
-- Son las que hacen falta para defender la parte de weaknesses del
-- documento de diseño de datos.
-- =====================================================================

-- 8.1  EL DISPONIBLE PUEDE SER NEGATIVO, Y NADIE LO COMPRUEBA
--
--      inventario_stock no tiene ni un CHECK, y el ÚNICO CHECK del
--      esquema está en orden_compra_items.cantidad.   Esta consulta
--      tiene que salir VACÍA, y si no sale, hay datos malos.
SELECT
    s.nombre AS sucursal,
    p.nombre AS producto,
    ta.nombre AS talla,
    col.nombre AS color,
    i.cantidad_disponible,
    i.cantidad_reservada,
    i.cantidad_vendida
FROM inventario_stock i
JOIN producto_talla_color ptc ON ptc.id_ptc = i.id_ptc
JOIN productos  p ON p.id_producto = ptc.id_producto
JOIN sucursales s ON s.id_sucursal = i.id_sucursal
LEFT JOIN tallas  ta ON ta.id_talla  = ptc.id_talla
LEFT JOIN colores col ON col.id_color = ptc.id_color
WHERE i.cantidad_disponible < 0
   OR i.cantidad_reservada  < 0
   OR i.cantidad_vendida    < 0;


-- 8.2  estado_stock NO SE ESCRIBE NUNCA
--
--      La columna tiene DEFAULT 'Disponible' y CERO escrituras en todo el
--      proyecto.  Estas dos consultas lo demuestran: la de arriba cuenta
--      cuántas filas dicen algo que no sea 'Disponible', que solo puede
--      ser porque alguien lo escribió a mano, y la de abajo mira si el
--      catálogo se contradice con el stock real.
SELECT
    ptc.estado_stock,
    COUNT(*) AS combinaciones,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS porcentaje
FROM producto_talla_color ptc
GROUP BY ptc.estado_stock
ORDER BY combinaciones DESC;


-- 8.3  EL CATÁLOGO DICE QUE HAY STOCK Y EL INVENTARIO DICE QUE NO
--
--      Estas dos cifras tienen que coincidir.  Si una prenda sale en la
--      consulta de arriba, tiene que salir en esta, o al revés.  O sea:
--      la columna que 6 módulos usan para decidir NO está al día.
WITH disponibilidad AS (
    SELECT i.id_ptc, SUM(i.cantidad_disponible) AS total
    FROM inventario_stock i
    GROUP BY i.id_ptc
)
SELECT
    p.codigo,
    p.nombre AS producto,
    ptc.estado_stock AS lo_que_dice_el_catalogo,
    COALESCE(d.total, 0) AS lo_que_dice_el_inventario,
    CASE
      WHEN ptc.estado_stock = 'Disponible' AND COALESCE(d.total, 0) <= 0
        THEN 'el catalogo ofrece una prenda agotada'
      WHEN ptc.estado_stock <> 'Disponible' AND COALESCE(d.total, 0) > 0
        THEN 'el catalogo oculta una prenda con stock'
      ELSE 'coinciden'
    END AS veredicto
FROM producto_talla_color ptc
JOIN productos p ON p.id_producto = ptc.id_producto
LEFT JOIN disponibilidad d ON d.id_ptc = ptc.id_ptc
WHERE ptc.estado_stock <> 'Disponible' OR COALESCE(d.total, 0) <= 0
ORDER BY veredicto, p.nombre;


-- 8.4  LAS COMPARACIONES DE estado_stock NO COINCIDEN EN MAYÚSCULAS
--
--      La columna tiene 'Disponible' y 'Sin stock' con mayúscula, y el
--      código escribe 'sin stock' y 'disponible' en minúscula en dos
--      sitios.  En PostgreSQL, 'Disponible' <> 'disponible'.   Estas dos
--      consultas son las que están rotas, y salen siempre vacías.
SELECT 'Carrito L246 busca  sin stock  en minuscula' AS comparacion,
       COUNT(*) AS filas_afectadas
FROM producto_talla_color
WHERE estado_stock = 'sin stock'

UNION ALL

SELECT 'Reservas L1197 busca  disponible  en minuscula',
       COUNT(*)
FROM producto_talla_color
WHERE estado_stock = 'disponible'

UNION ALL

SELECT 'Ventas  busca  Disponible  con mayuscula, y SI funciona',
       COUNT(*)
FROM producto_talla_color
WHERE estado_stock = 'Disponible';


-- 8.5  EL KARDEX INVIERTE EL SIGNO DE LAS SALIDAS DE RESERVA
--
--      La pantalla multiplica por -1 cualquier tipo que empiece por
--      SALIDA, sin mirar lo que hay en la base.   En la base, una de las
--      tres va con cantidad POSITIVA, y la pantalla la enseña como -N.
--      Esta consulta devuelve lo que HAY y lo que SE VE.
SELECT
    m.tipo_movimiento,
    m.cantidad AS cantidad_en_la_base,
    (CASE
       WHEN m.tipo_movimiento LIKE 'ENTRADA%' THEN  m.cantidad
       WHEN m.tipo_movimiento LIKE 'SALIDA%'  THEN -ABS(m.cantidad)
       ELSE m.stock_posterior - m.stock_anterior
     END) AS cantidad_en_la_pantalla,
    COUNT(*) AS movimientos,
    COUNT(*) FILTER (
      WHERE (CASE
               WHEN m.tipo_movimiento LIKE 'ENTRADA%' THEN  m.cantidad
               WHEN m.tipo_movimiento LIKE 'SALIDA%'  THEN -ABS(m.cantidad)
               ELSE m.stock_posterior - m.stock_anterior
             END) <> m.cantidad
    ) AS filas_con_el_signo_invertido
FROM movimientos_inventario m
GROUP BY m.tipo_movimiento
ORDER BY filas_con_el_signo_invertido DESC, movimientos DESC;


-- 8.6  LA ECUACIÓN DEL INVENTARIO NO EXISTE
--
--      Estas cuatro columnas deberían sumar el stock total, y no hay NINGÚN
--      CHECK, NINGUNA vista y NINGUNA función en el esquema que lo
--      compruebe.   La consulta lista las prendas donde la suma no cuadra
--      con lo que dicen las piezas.
SELECT
    p.nombre AS producto,
    ta.nombre AS talla,
    col.nombre AS color,
    i.id_sucursal,
    i.cantidad_disponible,
    i.cantidad_reservada,
    i.cantidad_vendida,
    (i.cantidad_disponible + i.cantidad_reservada + i.cantidad_vendida) AS suma,
    (SELECT COALESCE(SUM(oi.cantidad), 0)
       FROM orden_compra_items oi
      WHERE oi.id_ptc = i.id_ptc) AS comprado_en_ordenes,
    (SELECT COALESCE(SUM(m.cantidad), 0)
       FROM movimientos_inventario m
      WHERE m.id_ptc = i.id_ptc AND m.id_sucursal = i.id_sucursal) AS movido_en_el_kardex,
    'el esquema no obliga a que estas tres columnas cuadren' AS aviso
FROM inventario_stock i
JOIN producto_talla_color ptc ON ptc.id_ptc = i.id_ptc
JOIN productos p ON p.id_producto = ptc.id_producto
LEFT JOIN tallas  ta ON ta.id_talla  = ptc.id_talla
LEFT JOIN colores col ON col.id_color = ptc.id_color
ORDER BY p.nombre, i.id_sucursal;


-- 8.7  LA RESERVA Y LA VENTA NUNCA SE ENLAZAN
--
--      El documento de casos de uso pide que una prenda reservada se
--      traslade de cantidad_reservada a cantidad_vendida al venderla.
--      Estas dos consultas lo demuestran: la primera busca el vínculo y
--      no lo hay, y la segunda muestra que la columna solo se escribe en
--      3 sitios, ninguno de ellos un pago.
SELECT
    r.id_reserva,
    r.estado AS estado_de_la_reserva,
    v.id_venta,
    v.estado AS estado_de_la_venta,
    p.nombre AS producto,
    'ningun sitio del proyecto enlaza la venta con la reserva' AS por_que_no_aparece
FROM reserva_items ri
JOIN reservas r  ON r.id_reserva = ri.id_reserva
JOIN producto_talla_color ptc ON ptc.id_ptc = ri.id_ptc
JOIN productos p ON p.id_producto = ptc.id_producto
LEFT JOIN venta_items vi ON vi.id_ptc = ri.id_ptc
LEFT JOIN ventas v ON v.id_venta = vi.id_venta
WHERE ri.cantidad > 0
ORDER BY r.id_reserva;


-- 8.8  LAS DOS COLUMNAS QUE EL CÓDIGO USA Y EL ESQUEMA NO TIENE
--
--      Estas dos consultas TIENEN que fallar con un error de columna.
--      Es la demostración de que el modelo está desactualizado con
--      respecto a la aplicación: carritos.token_invitado, que usa el
--      carrito de invitado del CU25, y sesiones_ra.foto_resultado, que
--      usa el vestidor del CU24.   Se dejan comentadas para que el
--      script se pueda ejecutar entero.
--
--   SELECT * FROM carritos   WHERE token_invitado   = 'abc';
--   SELECT * FROM sesiones_ra WHERE foto_resultado IS NOT NULL;


-- 8.9  EL ÍNDICE QUE SE LLAMA DE CLIENTE ESTÁ EN LA COLUMNA DEL EMPLEADO
--
--      idx_reservas_cliente está sobre id_usuario, que es el empleado,
--      y id_cliente, que es la que filtra el código en 3 sitios, no tiene
--      índice.   Esta consulta cuenta las reservas por cliente, que es la
--      que hace un Seq Scan.
SELECT
    cl.id_cliente,
    cl.nombre AS cliente,
    COUNT(r.id_reserva) AS reservas,
    (SELECT COUNT(*) FROM reservas r2
      WHERE r2.id_cliente = cl.id_cliente) AS el_mismo_numero_con_indice_en_usuario
FROM clientes cl
LEFT JOIN reservas r ON r.id_cliente = cl.id_cliente
GROUP BY cl.id_cliente, cl.nombre
ORDER BY reservas DESC;


-- 8.10  45 DE 51 TABLAS NO TIENEN NINGÚN ÍNDICE
--
--      Esta consulta es la que demuestra el punto: mira pg_indexes y
--      cuenta cuántas tablas no aparecen.
SELECT
    t.tablename,
    (SELECT COUNT(*) FROM pg_index i
      WHERE i.indrelid = (quote_ident(t.tablename))::regclass) AS indices
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND NOT EXISTS (
        SELECT 1 FROM pg_indexes ix
         WHERE ix.tablename = t.tablename
           AND ix.schemaname = 'public'
      )
ORDER BY t.tablename;


-- =====================================================================
-- 9. UNA CONSULTA DE EJECUCIÓN, PARA VER SI EL ESQUEMA USA LOS ÍNDICES
--
--    EXPLAIN, no ejecuta nada.  Si sale Seq Scan en una tabla grande, es
--    que falta un índice, y el nombre del índice que falta se deduce de
--    la consulta.
-- =====================================================================

-- 9.1  Las reservas de un cliente, que es la consulta que hace Seq Scan
--      porque idx_reservas_cliente está en la columna equivocada.
EXPLAIN
SELECT r.id_reserva, r.fecha_reserva, r.estado
FROM reservas r
WHERE r.id_cliente = 1
ORDER BY r.fecha_reserva DESC;


-- 9.2  El stock de una prenda en una sucursal, que sí tiene índice y
--      tiene que salir con Index Scan por el UNIQUE de L310.
EXPLAIN
SELECT i.cantidad_disponible, i.cantidad_reservada, i.cantidad_vendida
FROM inventario_stock i
WHERE i.id_ptc = 1 AND i.id_sucursal = 1;


-- 9.3  El Kardex de una prenda, que es la consulta que sí aprovecha el
--      índice compuesto de L562.
EXPLAIN
SELECT m.fecha, m.tipo_movimiento, m.cantidad
FROM movimientos_inventario m
WHERE m.id_ptc = 1 AND m.id_sucursal = 1
ORDER BY m.fecha DESC;
