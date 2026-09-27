// ================================================================
// DISEÑO DE DATOS  ·  DIAGRAMA DE CLASES DEL MODELO DE DATOS
// 1. Seguridad (RBAC)
// 2. Auditoria
// 3. Ciudades y Sucursales
// 4. Catalogo (maestros)
// 5. Productos
// 6. Proveedores y Compras
// 7. Inventario
// 8. Reservas
// 9. Vestidor Virtual RA
// 10. Carrito y Venta
// 11. Pagos
// 12. Devoluciones
// 13. IA y Reportes
// 14. Respaldos
// ================================================================
//
// GENERADO LEYENDO BASE DE DATOS/schema.sql.  Las 51 tablas y las 88
// foreign keys estan sacadas del esquema, no escritas a mano.   Si el
// esquema cambia, hay que volver a generarlo.
//
// CADA RELACION ES UNA FOREIGN KEY REAL, con la cardinalidad deducida de
//   1. Seguridad (RBAC): 10 tablas
//   2. Auditoria: 1 tablas
//   3. Ciudades y Sucursales: 3 tablas
//   4. Catalogo (maestros): 6 tablas
//   5. Productos: 4 tablas
//   6. Proveedores y Compras: 6 tablas
//   7. Inventario: 3 tablas
//   8. Reservas: 2 tablas
//   9. Vestidor Virtual RA: 2 tablas
//   10. Carrito y Venta: 5 tablas
//   11. Pagos: 1 tablas
//   12. Devoluciones: 2 tablas
//   13. IA y Reportes: 5 tablas
//   14. Respaldos: 1 tablas
//
// LAS CARDINALIDADES NO SON UN ADORNOS.   La multiplicidad del extremo
// del padre dice cuantos hijos tiene, y sale de si la FK es UNICA o no:
//   0..*   la FK no es unica, o sea que un padre tiene muchos hijos
//   0..1   la FK es unica, o sea que un padre tiene como mucho uno
// Y la multiplicidad del extremo del hijo dice cuantos padres tiene cada
// hijo, y sale de si la FK es NOT NULL o parte de la PRIMARY KEY:
//   1      la FK es obligatoria
//   0..1   la FK es NULLABLE, y el esquema no lo prohibe
//
// EL ON DELETE MARCA LA NATURALEZA DE LA ASOCIACION, y eso no es mio:
//   ON DELETE CASCADE   ->  Composition, porque el hijo no sobrevive al padre
//   ON DELETE SET NULL  ->  Dependency, porque se rompe el vinculo pero no muere
//   sin ON DELETE       ->  Association, que es RESTRICT y se hereda
//
// NO HAY OPERACIONES, Y ES A PROPOSITO.   Este es el modelo de datos: las
// tablas no tienen metodos.   Las unicas dos TRIGGER y las ocho FUNCIONES del
// esquema no son de este diagrama, son de CU31 y CU39, y estan ahi.
//
// Los nombres van TAL CUAL, sin prefijo, porque son los del esquema.
// ================================================================

var VIS_PUB = 0;
var VIS_PRI = 1;

var TOTAL_TAB = 51;
var TOTAL_REL = 88;
var TOTAL_ATR = 340;
var TOTAL_MOD = 14;

var DEF = [
    // ============================================================
    // 1. SEGURIDAD (RBAC)
    // ============================================================

    ["roles", "EXISTE. schema.sql L23", "MODULO: 1. Seguridad (RBAC) | ORIGEN: schema.sql L23-L30, 6 columnas | PRIMARY KEY: id_rol | FOREIGN KEYS: ninguna, esta tabla es independiente | NOT NULL: 2 de 6",
  [
    ["id_rol", "Integer = autoincremental, PK", VIS_PRI],
    ["nombre_rol", "String = 60, UNIQUE, obligatorio", VIS_PUB],
    ["descripcion", "String", VIS_PUB],
    ["permisos_json", "Json = obligatorio, por defecto '[]'", VIS_PUB],
    ["estado", "String = 20, por defecto 'Activo'", VIS_PUB],
    ["fecha_creacion", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],

    ["usuarios", "EXISTE. schema.sql L32", "MODULO: 1. Seguridad (RBAC) | ORIGEN: schema.sql L32-L43, 10 columnas | PRIMARY KEY: id_usuario | FOREIGN KEYS: ninguna, esta tabla es independiente | NOT NULL: 2 de 10",
  [
    ["id_usuario", "Integer = autoincremental, PK", VIS_PRI],
    ["email", "String = 120, UNIQUE, obligatorio", VIS_PUB],
    ["ci", "String = 30, UNIQUE", VIS_PUB],
    ["password_hash", "String = 255, obligatorio", VIS_PUB],
    ["estado", "String = 20, por defecto 'Pendiente'", VIS_PUB],
    ["intentos_fallidos", "Integer = por defecto 0", VIS_PUB],
    ["bloqueado_hasta", "Timestamp", VIS_PUB],
    ["fecha_creacion", "Timestamp = por defecto NOW()", VIS_PUB],
    ["fecha_ultimo_acceso", "Timestamp", VIS_PUB],
    ["ultimo_login", "Timestamp", VIS_PUB]
  ],
  []],

    ["usuarios_roles", "EXISTE. schema.sql L45", "MODULO: 1. Seguridad (RBAC) | ORIGEN: schema.sql L45-L49, 2 columnas | PRIMARY KEY: id_usuario + id_rol | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 0 de 2  <-- ninguna columna es obligatoria",
  [
    ["id_usuario", "Integer = PK, FK a usuarios, ON DELETE CASCADE", VIS_PRI],
    ["id_rol", "Integer = PK, FK a roles, ON DELETE CASCADE", VIS_PRI]
  ],
  []],

    ["usuarios_empleados", "EXISTE. schema.sql L76", "MODULO: 1. Seguridad (RBAC) | ORIGEN: schema.sql L76-L85, 8 columnas | PRIMARY KEY: id_empleado | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 2 de 8",
  [
    ["id_empleado", "Integer = autoincremental, PK", VIS_PRI],
    ["usuario_id", "Integer = UNIQUE, FK a usuarios, ON DELETE CASCADE", VIS_PUB],
    ["sucursal_id", "Integer = FK a sucursales", VIS_PUB],
    ["nombre", "String = 120, obligatorio", VIS_PUB],
    ["telefono", "String = 30", VIS_PUB],
    ["rol", "String = 60, obligatorio", VIS_PUB],
    ["fecha_baja", "Timestamp", VIS_PUB],
    ["motivo_baja", "String = 255", VIS_PUB]
  ],
  []],

    ["clientes", "EXISTE. schema.sql L87", "MODULO: 1. Seguridad (RBAC) | ORIGEN: schema.sql L87-L94, 6 columnas | PRIMARY KEY: id_cliente | FOREIGN KEYS: 1, que son las asociaciones de esta tabla | NOT NULL: 1 de 6",
  [
    ["id_cliente", "Integer = autoincremental, PK", VIS_PRI],
    ["usuario_id", "Integer = UNIQUE, FK a usuarios, ON DELETE CASCADE", VIS_PUB],
    ["nombre", "String = 150, obligatorio", VIS_PUB],
    ["telefono", "String = 30", VIS_PUB],
    ["direccion", "String", VIS_PUB],
    ["fecha_registro", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],

    ["first_password_tokens", "EXISTE. schema.sql L96", "MODULO: 1. Seguridad (RBAC) | ORIGEN: schema.sql L96-L103, 6 columnas | PRIMARY KEY: id_token | FOREIGN KEYS: 1, que son las asociaciones de esta tabla | NOT NULL: 2 de 6",
  [
    ["id_token", "Integer = autoincremental, PK", VIS_PRI],
    ["usuario_id", "Integer = FK a usuarios, ON DELETE CASCADE", VIS_PUB],
    ["token", "Guid = UNIQUE, obligatorio", VIS_PUB],
    ["expires_at", "Timestamp = obligatorio", VIS_PUB],
    ["used", "Boolean = por defecto false", VIS_PUB],
    ["created_at", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],

    ["email_confirmations", "EXISTE. schema.sql L105", "MODULO: 1. Seguridad (RBAC) | ORIGEN: schema.sql L105-L113, 7 columnas | PRIMARY KEY: id_confirmacion | FOREIGN KEYS: 1, que son las asociaciones de esta tabla | NOT NULL: 2 de 7",
  [
    ["id_confirmacion", "Integer = autoincremental, PK", VIS_PRI],
    ["usuario_id", "Integer = FK a usuarios, ON DELETE CASCADE", VIS_PUB],
    ["token", "Guid = UNIQUE, obligatorio", VIS_PUB],
    ["expires_at", "Timestamp = obligatorio", VIS_PUB],
    ["used", "Boolean = por defecto false", VIS_PUB],
    ["confirmado_en", "Timestamp", VIS_PUB],
    ["created_at", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],

    ["password_resets", "EXISTE. schema.sql L115", "MODULO: 1. Seguridad (RBAC) | ORIGEN: schema.sql L115-L124, 8 columnas | PRIMARY KEY: id_reset | FOREIGN KEYS: 1, que son las asociaciones de esta tabla | NOT NULL: 3 de 8",
  [
    ["id_reset", "Integer = autoincremental, PK", VIS_PRI],
    ["usuario_id", "Integer = FK a usuarios, ON DELETE CASCADE", VIS_PUB],
    ["email", "String = 120, obligatorio", VIS_PUB],
    ["token", "Guid = UNIQUE, obligatorio", VIS_PUB],
    ["expires_at", "Timestamp = obligatorio", VIS_PUB],
    ["used", "Boolean = por defecto false", VIS_PUB],
    ["ip_origen", "String = 45", VIS_PUB],
    ["created_at", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],

    ["token_blacklist", "EXISTE. schema.sql L126", "MODULO: 1. Seguridad (RBAC) | ORIGEN: schema.sql L126-L132, 5 columnas | PRIMARY KEY: id_token | FOREIGN KEYS: 1, que son las asociaciones de esta tabla | NOT NULL: 2 de 5",
  [
    ["id_token", "Integer = autoincremental, PK", VIS_PRI],
    ["jti", "String = 128, UNIQUE, obligatorio", VIS_PUB],
    ["usuario_id", "Integer = FK a usuarios, ON DELETE CASCADE", VIS_PUB],
    ["expira_en", "Timestamp = obligatorio", VIS_PUB],
    ["revocado_en", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],

    ["sesiones", "EXISTE. schema.sql L134", "MODULO: 1. Seguridad (RBAC) | ORIGEN: schema.sql L134-L143, 8 columnas | PRIMARY KEY: id_sesion | FOREIGN KEYS: 1, que son las asociaciones de esta tabla | NOT NULL: 0 de 8  <-- ninguna columna es obligatoria",
  [
    ["id_sesion", "Integer = autoincremental, PK", VIS_PRI],
    ["usuario_id", "Integer = FK a usuarios, ON DELETE CASCADE", VIS_PUB],
    ["refresh_token", "String = 255, UNIQUE", VIS_PUB],
    ["ip_origen", "String = 45", VIS_PUB],
    ["user_agent", "String = 255", VIS_PUB],
    ["fecha_inicio", "Timestamp = por defecto NOW()", VIS_PUB],
    ["fecha_fin", "Timestamp", VIS_PUB],
    ["activa", "Boolean = por defecto true", VIS_PUB]
  ],
  []],
    // ============================================================
    // 2. AUDITORIA
    // ============================================================

    ["bitacora_auditoria", "EXISTE. schema.sql L148", "MODULO: 2. Auditoria | ORIGEN: schema.sql L148-L160, 11 columnas | PRIMARY KEY: id_bitacora | FOREIGN KEYS: 1, que son las asociaciones de esta tabla | NOT NULL: 0 de 11  <-- ninguna columna es obligatoria",
  [
    ["id_bitacora", "Integer = autoincremental, PK", VIS_PRI],
    ["id_usuario", "Integer = FK a usuarios, ON DELETE SET NULL", VIS_PUB],
    ["accion_sql", "String = 40", VIS_PUB],
    ["tabla_afectada", "String = 80", VIS_PUB],
    ["id_registro", "Integer", VIS_PUB],
    ["detalle", "String", VIS_PUB],
    ["old_data", "Json", VIS_PUB],
    ["new_data", "Json", VIS_PUB],
    ["ip_address", "INET", VIS_PUB],
    ["user_agent", "String = 255", VIS_PUB],
    ["fecha_hora", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],
    // ============================================================
    // 3. CIUDADES Y SUCURSALES
    // ============================================================

    ["ciudades", "EXISTE. schema.sql L51", "MODULO: 3. Ciudades y Sucursales | ORIGEN: schema.sql L51-L56, 4 columnas | PRIMARY KEY: id_ciudad | FOREIGN KEYS: ninguna, esta tabla es independiente | NOT NULL: 1 de 4",
  [
    ["id_ciudad", "Integer = autoincremental, PK", VIS_PRI],
    ["nombre", "String = 80, UNIQUE, obligatorio", VIS_PUB],
    ["pais", "String = 60, por defecto 'Bolivia'", VIS_PUB],
    ["estado", "String = 20, por defecto 'Activa'", VIS_PUB]
  ],
  []],

    ["sucursales", "EXISTE. schema.sql L58", "MODULO: 3. Ciudades y Sucursales | ORIGEN: schema.sql L58-L66, 7 columnas | PRIMARY KEY: id_sucursal | FOREIGN KEYS: 1, que son las asociaciones de esta tabla | NOT NULL: 2 de 7",
  [
    ["id_sucursal", "Integer = autoincremental, PK", VIS_PRI],
    ["nombre", "String = 100, obligatorio", VIS_PUB],
    ["direccion", "String = obligatorio", VIS_PUB],
    ["id_ciudad", "Integer = FK a ciudades", VIS_PUB],
    ["telefono", "String = 30", VIS_PUB],
    ["estado", "String = 20, por defecto 'Activa'", VIS_PUB],
    ["fecha_registro", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],

    ["sucursal_horarios", "EXISTE. schema.sql L68", "MODULO: 3. Ciudades y Sucursales | ORIGEN: schema.sql L68-L74, 5 columnas | PRIMARY KEY: id_horario | FOREIGN KEYS: 1, que son las asociaciones de esta tabla | NOT NULL: 0 de 5  <-- ninguna columna es obligatoria",
  [
    ["id_horario", "Integer = autoincremental, PK", VIS_PRI],
    ["id_sucursal", "Integer = FK a sucursales, ON DELETE CASCADE", VIS_PUB],
    ["dia_semana", "String = 20", VIS_PUB],
    ["horario_apertura", "Time", VIS_PUB],
    ["horario_cierre", "Time", VIS_PUB]
  ],
  []],
    // ============================================================
    // 4. CATALOGO (MAESTROS)
    // ============================================================

    ["tallas", "EXISTE. schema.sql L165", "MODULO: 4. Catalogo (maestros) | ORIGEN: schema.sql L165-L170, 4 columnas | PRIMARY KEY: id_talla | FOREIGN KEYS: ninguna, esta tabla es independiente | NOT NULL: 1 de 4",
  [
    ["id_talla", "Integer = autoincremental, PK", VIS_PRI],
    ["nombre", "String = 10, UNIQUE, obligatorio", VIS_PUB],
    ["estado", "String = 20, por defecto 'Activo'", VIS_PUB],
    ["orden", "Integer", VIS_PUB]
  ],
  []],

    ["colores", "EXISTE. schema.sql L172", "MODULO: 4. Catalogo (maestros) | ORIGEN: schema.sql L172-L177, 4 columnas | PRIMARY KEY: id_color | FOREIGN KEYS: ninguna, esta tabla es independiente | NOT NULL: 1 de 4",
  [
    ["id_color", "Integer = autoincremental, PK", VIS_PRI],
    ["nombre", "String = 50, UNIQUE, obligatorio", VIS_PUB],
    ["codigo_hex", "String = 7, UNIQUE", VIS_PUB],
    ["estado", "String = 20, por defecto 'Activo'", VIS_PUB]
  ],
  []],

    ["categorias", "EXISTE. schema.sql L179", "MODULO: 4. Catalogo (maestros) | ORIGEN: schema.sql L179-L184, 4 columnas | PRIMARY KEY: id_categoria | FOREIGN KEYS: ninguna, esta tabla es independiente | NOT NULL: 1 de 4",
  [
    ["id_categoria", "Integer = autoincremental, PK", VIS_PRI],
    ["nombre", "String = 80, UNIQUE, obligatorio", VIS_PUB],
    ["descripcion", "String", VIS_PUB],
    ["estado", "String = 20, por defecto 'Activo'", VIS_PUB]
  ],
  []],

    ["temporadas", "EXISTE. schema.sql L186", "MODULO: 4. Catalogo (maestros) | ORIGEN: schema.sql L186-L192, 5 columnas | PRIMARY KEY: id_temporada | FOREIGN KEYS: ninguna, esta tabla es independiente | NOT NULL: 1 de 5",
  [
    ["id_temporada", "Integer = autoincremental, PK", VIS_PRI],
    ["nombre", "String = 80, obligatorio", VIS_PUB],
    ["fecha_inicio", "Date", VIS_PUB],
    ["fecha_fin", "Date", VIS_PUB],
    ["estado", "String = 20, por defecto 'Programada'", VIS_PUB]
  ],
  []],

    ["colecciones", "EXISTE. schema.sql L263", "MODULO: 4. Catalogo (maestros) | ORIGEN: schema.sql L263-L269, 5 columnas | PRIMARY KEY: id_coleccion | FOREIGN KEYS: 1, que son las asociaciones de esta tabla | NOT NULL: 1 de 5",
  [
    ["id_coleccion", "Integer = autoincremental, PK", VIS_PRI],
    ["nombre", "String = 80, obligatorio", VIS_PUB],
    ["descripcion", "String", VIS_PUB],
    ["id_temporada", "Integer = FK a temporadas", VIS_PUB],
    ["fecha_creacion", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],

    ["producto_coleccion", "EXISTE. schema.sql L271", "MODULO: 4. Catalogo (maestros) | ORIGEN: schema.sql L271-L275, 2 columnas | PRIMARY KEY: id_coleccion + id_producto | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 0 de 2  <-- ninguna columna es obligatoria",
  [
    ["id_coleccion", "Integer = PK, FK a colecciones, ON DELETE CASCADE", VIS_PRI],
    ["id_producto", "Integer = PK, FK a productos, ON DELETE CASCADE", VIS_PRI]
  ],
  []],
    // ============================================================
    // 5. PRODUCTOS
    // ============================================================

    ["productos", "EXISTE. schema.sql L223", "MODULO: 5. Productos | ORIGEN: schema.sql L223-L235, 11 columnas | PRIMARY KEY: id_producto | FOREIGN KEYS: 3, que son las asociaciones de esta tabla | NOT NULL: 3 de 11",
  [
    ["id_producto", "Integer = autoincremental, PK", VIS_PRI],
    ["codigo", "String = 40, UNIQUE, obligatorio", VIS_PUB],
    ["nombre", "String = 150, obligatorio", VIS_PUB],
    ["descripcion", "String", VIS_PUB],
    ["id_categoria", "Integer = FK a categorias", VIS_PUB],
    ["id_temporada", "Integer = FK a temporadas", VIS_PUB],
    ["id_proveedor", "Integer = FK a proveedores", VIS_PUB],
    ["precio_base", "Decimal = 10,2, obligatorio", VIS_PUB],
    ["modelo_3d_url", "String", VIS_PUB],
    ["estado", "String = 20, por defecto 'Disponible'", VIS_PUB],
    ["fecha_registro", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],

    ["producto_talla_color", "EXISTE. schema.sql L237", "MODULO: 5. Productos | ORIGEN: schema.sql L237-L244, 5 columnas | PRIMARY KEY: id_ptc | UNIQUE: (id_producto, id_talla, id_color) | FOREIGN KEYS: 3, que son las asociaciones de esta tabla | NOT NULL: 0 de 5  <-- ninguna columna es obligatoria",
  [
    ["id_ptc", "Integer = autoincremental, PK", VIS_PRI],
    ["id_producto", "Integer = FK a productos, ON DELETE CASCADE", VIS_PUB],
    ["id_talla", "Integer = FK a tallas", VIS_PUB],
    ["id_color", "Integer = FK a colores", VIS_PUB],
    ["estado_stock", "String = 20, por defecto 'Disponible'", VIS_PUB]
  ],
  []],

    ["producto_imagenes", "EXISTE. schema.sql L246", "MODULO: 5. Productos | ORIGEN: schema.sql L246-L253, 6 columnas | PRIMARY KEY: id_imagen | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 1 de 6",
  [
    ["id_imagen", "Integer = autoincremental, PK", VIS_PRI],
    ["id_producto", "Integer = FK a productos, ON DELETE CASCADE", VIS_PUB],
    ["id_color", "Integer = FK a colores, ON DELETE SET NULL", VIS_PUB],
    ["url", "String = obligatorio", VIS_PUB],
    ["es_principal", "Boolean = por defecto false", VIS_PUB],
    ["orden", "Integer", VIS_PUB]
  ],
  []],

    ["producto_precios", "EXISTE. schema.sql L255", "MODULO: 5. Productos | ORIGEN: schema.sql L255-L261, 5 columnas | PRIMARY KEY: id_precio | FOREIGN KEYS: 1, que son las asociaciones de esta tabla | NOT NULL: 1 de 5",
  [
    ["id_precio", "Integer = autoincremental, PK", VIS_PRI],
    ["id_ptc", "Integer = FK a producto_talla_color, ON DELETE CASCADE", VIS_PUB],
    ["precio", "Decimal = 10,2, obligatorio", VIS_PUB],
    ["fecha_inicio", "Date", VIS_PUB],
    ["fecha_fin", "Date", VIS_PUB]
  ],
  []],
    // ============================================================
    // 6. PROVEEDORES Y COMPRAS
    // ============================================================

    ["proveedores", "EXISTE. schema.sql L197", "MODULO: 6. Proveedores y Compras | ORIGEN: schema.sql L197-L209, 11 columnas | PRIMARY KEY: id_proveedor | FOREIGN KEYS: ninguna, esta tabla es independiente | NOT NULL: 1 de 11",
  [
    ["id_proveedor", "Integer = autoincremental, PK", VIS_PRI],
    ["nombre_empresa", "String = 150, UNIQUE, obligatorio", VIS_PUB],
    ["persona_contacto", "String = 120", VIS_PUB],
    ["telefono", "String = 30", VIS_PUB],
    ["email", "String = 120, UNIQUE", VIS_PUB],
    ["direccion", "String", VIS_PUB],
    ["observaciones", "String", VIS_PUB],
    ["tiempo_entrega_dias", "Integer = por defecto 15", VIS_PUB],
    ["estado_riesgo", "String = 20, por defecto 'Activo'", VIS_PUB],
    ["calidad_score", "Integer", VIS_PUB],
    ["fecha_registro", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],

    ["proveedor_contactos", "EXISTE. schema.sql L211", "MODULO: 6. Proveedores y Compras | ORIGEN: schema.sql L211-L218, 6 columnas | PRIMARY KEY: id_contacto | FOREIGN KEYS: 1, que son las asociaciones de esta tabla | NOT NULL: 0 de 6  <-- ninguna columna es obligatoria",
  [
    ["id_contacto", "Integer = autoincremental, PK", VIS_PRI],
    ["id_proveedor", "Integer = FK a proveedores, ON DELETE CASCADE", VIS_PUB],
    ["nombre", "String = 120", VIS_PUB],
    ["cargo", "String = 80", VIS_PUB],
    ["telefono", "String = 30", VIS_PUB],
    ["email", "String = 120", VIS_PUB]
  ],
  []],

    ["ordenes_compra", "EXISTE. schema.sql L277", "MODULO: 6. Proveedores y Compras | ORIGEN: schema.sql L277-L288, 10 columnas | PRIMARY KEY: id_orden_compra | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 0 de 10  <-- ninguna columna es obligatoria",
  [
    ["id_orden_compra", "Integer = autoincremental, PK", VIS_PRI],
    ["id_proveedor", "Integer = FK a proveedores", VIS_PUB],
    ["id_sucursal", "Integer = FK a sucursales", VIS_PUB],
    ["numero", "String = 20", VIS_PUB],
    ["fecha_orden", "Timestamp = por defecto NOW()", VIS_PUB],
    ["fecha_estimada_entrega", "Date", VIS_PUB],
    ["fecha_recepcion", "Timestamp", VIS_PUB],
    ["estado", "String = 20, por defecto 'Pendiente'", VIS_PUB],
    ["total", "Decimal = 12,2", VIS_PUB],
    ["observaciones", "String", VIS_PUB]
  ],
  []],

    ["orden_compra_items", "EXISTE. schema.sql L290", "MODULO: 6. Proveedores y Compras | ORIGEN: schema.sql L290-L297, 6 columnas | PRIMARY KEY: id_orden_item | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 1 de 6",
  [
    ["id_orden_item", "Integer = autoincremental, PK", VIS_PRI],
    ["id_orden_compra", "Integer = FK a ordenes_compra, ON DELETE CASCADE", VIS_PUB],
    ["id_ptc", "Integer = FK a producto_talla_color", VIS_PUB],
    ["cantidad", "Integer = obligatorio, CHECK cantidad > 0", VIS_PUB],
    ["precio_unitario", "Decimal = 10,2", VIS_PUB],
    ["subtotal", "Decimal = 12,2", VIS_PUB]
  ],
  []],

    ["recepciones", "EXISTE. schema.sql L313", "MODULO: 6. Proveedores y Compras | ORIGEN: schema.sql L313-L320, 6 columnas | PRIMARY KEY: id_recepcion | FOREIGN KEYS: 3, que son las asociaciones de esta tabla | NOT NULL: 0 de 6  <-- ninguna columna es obligatoria",
  [
    ["id_recepcion", "Integer = autoincremental, PK", VIS_PRI],
    ["id_orden_compra", "Integer = FK a ordenes_compra", VIS_PUB],
    ["id_sucursal", "Integer = FK a sucursales", VIS_PUB],
    ["id_usuario", "Integer = FK a usuarios", VIS_PUB],
    ["fecha_recepcion", "Timestamp = por defecto NOW()", VIS_PUB],
    ["estado", "String = 20, por defecto 'Registrada'", VIS_PUB]
  ],
  []],

    ["recepcion_items", "EXISTE. schema.sql L322", "MODULO: 6. Proveedores y Compras | ORIGEN: schema.sql L322-L329, 6 columnas | PRIMARY KEY: id_recepcion_item | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 0 de 6  <-- ninguna columna es obligatoria",
  [
    ["id_recepcion_item", "Integer = autoincremental, PK", VIS_PRI],
    ["id_recepcion", "Integer = FK a recepciones, ON DELETE CASCADE", VIS_PUB],
    ["id_ptc", "Integer = FK a producto_talla_color", VIS_PUB],
    ["cantidad_pedida", "Integer", VIS_PUB],
    ["cantidad_recibida", "Integer", VIS_PUB],
    ["diferencia", "Integer", VIS_PUB]
  ],
  []],
    // ============================================================
    // 7. INVENTARIO
    // ============================================================

    ["inventario_stock", "EXISTE. schema.sql L302", "MODULO: 7. Inventario | ORIGEN: schema.sql L302-L311, 7 columnas | PRIMARY KEY: id_stock | UNIQUE: (id_ptc, id_sucursal) | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 0 de 7  <-- ninguna columna es obligatoria",
  [
    ["id_stock", "Integer = autoincremental, PK", VIS_PRI],
    ["id_ptc", "Integer = FK a producto_talla_color", VIS_PUB],
    ["id_sucursal", "Integer = FK a sucursales", VIS_PUB],
    ["cantidad_disponible", "Integer = por defecto 0", VIS_PUB],
    ["cantidad_reservada", "Integer = por defecto 0", VIS_PUB],
    ["cantidad_vendida", "Integer = por defecto 0", VIS_PUB],
    ["stock_minimo_alert", "Integer = por defecto 0", VIS_PUB]
  ],
  []],

    ["movimientos_inventario", "EXISTE. schema.sql L421", "MODULO: 7. Inventario | ORIGEN: schema.sql L421-L435, 13 columnas | PRIMARY KEY: id_movimiento | FOREIGN KEYS: 6, que son las asociaciones de esta tabla | NOT NULL: 0 de 13  <-- ninguna columna es obligatoria",
  [
    ["id_movimiento", "Integer = autoincremental, PK", VIS_PRI],
    ["id_ptc", "Integer = FK a producto_talla_color", VIS_PUB],
    ["id_sucursal", "Integer = FK a sucursales", VIS_PUB],
    ["tipo_movimiento", "String = 30", VIS_PUB],
    ["cantidad", "Integer", VIS_PUB],
    ["stock_anterior", "Integer", VIS_PUB],
    ["stock_posterior", "Integer", VIS_PUB],
    ["referencia", "String = 120", VIS_PUB],
    ["id_usuario", "Integer = FK a usuarios", VIS_PUB],
    ["id_orden_compra", "Integer = FK a ordenes_compra", VIS_PUB],
    ["id_venta", "Integer = FK a ventas", VIS_PUB],
    ["id_reserva", "Integer = FK a reservas", VIS_PUB],
    ["fecha", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],

    ["alertas_stock_config", "EXISTE. schema.sql L331", "MODULO: 7. Inventario | ORIGEN: schema.sql L331-L339, 7 columnas | PRIMARY KEY: id_config | FOREIGN KEYS: 3, que son las asociaciones de esta tabla | NOT NULL: 0 de 7  <-- ninguna columna es obligatoria",
  [
    ["id_config", "Integer = autoincremental, PK", VIS_PRI],
    ["id_ptc", "Integer = FK a producto_talla_color", VIS_PUB],
    ["id_categoria", "Integer = FK a categorias", VIS_PUB],
    ["id_sucursal", "Integer = FK a sucursales", VIS_PUB],
    ["stock_minimo", "Integer", VIS_PUB],
    ["notificar_email", "Boolean = por defecto false", VIS_PUB],
    ["ultima_notificacion", "Timestamp", VIS_PUB]
  ],
  []],
    // ============================================================
    // 8. RESERVAS
    // ============================================================

    ["reservas", "EXISTE. schema.sql L344", "MODULO: 8. Reservas | ORIGEN: schema.sql L344-L356, 11 columnas | PRIMARY KEY: id_reserva | FOREIGN KEYS: 4, que son las asociaciones de esta tabla | NOT NULL: 0 de 11  <-- ninguna columna es obligatoria",
  [
    ["id_reserva", "Integer = autoincremental, PK", VIS_PRI],
    ["id_cliente", "Integer = FK a clientes", VIS_PUB],
    ["id_usuario", "Integer = FK a usuarios", VIS_PUB],
    ["id_sucursal", "Integer = FK a sucursales", VIS_PUB],
    ["fecha_reserva", "Date", VIS_PUB],
    ["hora_reserva", "Time", VIS_PUB],
    ["estado", "String = 20, por defecto 'Solicitada'", VIS_PUB],
    ["id_encargado", "Integer = FK a usuarios", VIS_PUB],
    ["fecha_creacion", "Timestamp = por defecto NOW()", VIS_PUB],
    ["fecha_preparada", "Timestamp", VIS_PUB],
    ["fecha_atendida", "Timestamp", VIS_PUB]
  ],
  []],

    ["reserva_items", "EXISTE. schema.sql L358", "MODULO: 8. Reservas | ORIGEN: schema.sql L358-L363, 4 columnas | PRIMARY KEY: id_reserva_item | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 0 de 4  <-- ninguna columna es obligatoria",
  [
    ["id_reserva_item", "Integer = autoincremental, PK", VIS_PRI],
    ["id_reserva", "Integer = FK a reservas, ON DELETE CASCADE", VIS_PUB],
    ["id_ptc", "Integer = FK a producto_talla_color", VIS_PUB],
    ["cantidad", "Integer = por defecto 1", VIS_PUB]
  ],
  []],
    // ============================================================
    // 9. VESTIDOR VIRTUAL RA
    // ============================================================

    ["sesiones_ra", "EXISTE. schema.sql L480", "MODULO: 9. Vestidor Virtual RA | ORIGEN: schema.sql L480-L488, 7 columnas | PRIMARY KEY: id_sesion_ra | FOREIGN KEYS: 4, que son las asociaciones de esta tabla | NOT NULL: 0 de 7  <-- ninguna columna es obligatoria",
  [
    ["id_sesion_ra", "Integer = autoincremental, PK", VIS_PRI],
    ["id_usuario", "Integer = FK a usuarios", VIS_PUB],
    ["id_ptc", "Integer = FK a producto_talla_color", VIS_PUB],
    ["medidas_avatar", "String = 120", VIS_PUB],
    ["fecha", "Timestamp = por defecto NOW()", VIS_PUB],
    ["id_reserva", "Integer = FK a reservas", VIS_PUB],
    ["id_carrito", "Integer = FK a carritos", VIS_PUB]
  ],
  []],

    ["resultados_prueba", "EXISTE. schema.sql L490", "MODULO: 9. Vestidor Virtual RA | ORIGEN: schema.sql L490-L496, 5 columnas | PRIMARY KEY: id_resultado | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 0 de 5  <-- ninguna columna es obligatoria",
  [
    ["id_resultado", "Integer = autoincremental, PK", VIS_PRI],
    ["id_sesion_ra", "Integer = FK a sesiones_ra", VIS_PUB],
    ["id_ptc", "Integer = FK a producto_talla_color", VIS_PUB],
    ["resultado", "String = 20", VIS_PUB],
    ["fecha", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],
    // ============================================================
    // 10. CARRITO Y VENTA
    // ============================================================

    ["carritos", "EXISTE. schema.sql L368", "MODULO: 10. Carrito y Venta | ORIGEN: schema.sql L368-L374, 5 columnas | PRIMARY KEY: id_carrito | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 0 de 5  <-- ninguna columna es obligatoria",
  [
    ["id_carrito", "Integer = autoincremental, PK", VIS_PRI],
    ["id_usuario", "Integer = FK a usuarios", VIS_PUB],
    ["estado", "String = 20, por defecto 'Activo'", VIS_PUB],
    ["id_sucursal", "Integer = FK a sucursales", VIS_PUB],
    ["fecha_creacion", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],

    ["carrito_items", "EXISTE. schema.sql L376", "MODULO: 10. Carrito y Venta | ORIGEN: schema.sql L376-L382, 5 columnas | PRIMARY KEY: id_carrito_item | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 0 de 5  <-- ninguna columna es obligatoria",
  [
    ["id_carrito_item", "Integer = autoincremental, PK", VIS_PRI],
    ["id_carrito", "Integer = FK a carritos, ON DELETE CASCADE", VIS_PUB],
    ["id_ptc", "Integer = FK a producto_talla_color", VIS_PUB],
    ["cantidad", "Integer = por defecto 1", VIS_PUB],
    ["precio_unitario", "Decimal = 10,2", VIS_PUB]
  ],
  []],

    ["ventas", "EXISTE. schema.sql L384", "MODULO: 10. Carrito y Venta | ORIGEN: schema.sql L384-L397, 12 columnas | PRIMARY KEY: id_venta | FOREIGN KEYS: 4, que son las asociaciones de esta tabla | NOT NULL: 1 de 12",
  [
    ["id_venta", "Integer = autoincremental, PK", VIS_PRI],
    ["id_cliente", "Integer = FK a clientes", VIS_PUB],
    ["id_usuario", "Integer = FK a usuarios", VIS_PUB],
    ["id_sucursal", "Integer = FK a sucursales", VIS_PUB],
    ["id_carrito", "Integer = FK a carritos", VIS_PUB],
    ["modalidad", "String = 20, obligatorio", VIS_PUB],
    ["metodo_pago", "String = 30", VIS_PUB],
    ["subtotal", "Decimal = 12,2", VIS_PUB],
    ["impuestos", "Decimal = 12,2", VIS_PUB],
    ["total", "Decimal = 12,2", VIS_PUB],
    ["estado", "String = 20, por defecto 'Completada'", VIS_PUB],
    ["fecha_venta", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],

    ["venta_items", "EXISTE. schema.sql L399", "MODULO: 10. Carrito y Venta | ORIGEN: schema.sql L399-L406, 6 columnas | PRIMARY KEY: id_venta_item | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 0 de 6  <-- ninguna columna es obligatoria",
  [
    ["id_venta_item", "Integer = autoincremental, PK", VIS_PRI],
    ["id_venta", "Integer = FK a ventas, ON DELETE CASCADE", VIS_PUB],
    ["id_ptc", "Integer = FK a producto_talla_color", VIS_PUB],
    ["cantidad", "Integer", VIS_PUB],
    ["precio_unitario", "Decimal = 10,2", VIS_PUB],
    ["subtotal", "Decimal = 12,2", VIS_PUB]
  ],
  []],

    ["comprobantes", "EXISTE. schema.sql L408", "MODULO: 10. Carrito y Venta | ORIGEN: schema.sql L408-L418, 9 columnas | PRIMARY KEY: id_comprobante | FOREIGN KEYS: 1, que son las asociaciones de esta tabla | NOT NULL: 0 de 9  <-- ninguna columna es obligatoria",
  [
    ["id_comprobante", "Integer = autoincremental, PK", VIS_PRI],
    ["id_venta", "Integer = FK a ventas", VIS_PUB],
    ["numero", "String = 30, UNIQUE", VIS_PUB],
    ["tipo", "String = 20", VIS_PUB],
    ["nit_cliente", "String = 30", VIS_PUB],
    ["razon_social", "String = 150", VIS_PUB],
    ["total", "Decimal = 12,2", VIS_PUB],
    ["fecha_emision", "Timestamp = por defecto NOW()", VIS_PUB],
    ["pdf_url", "String", VIS_PUB]
  ],
  []],
    // ============================================================
    // 11. PAGOS
    // ============================================================

    ["transacciones_pago", "EXISTE. schema.sql L440", "MODULO: 11. Pagos | ORIGEN: schema.sql L440-L453, 12 columnas | PRIMARY KEY: id_transaccion | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 0 de 12  <-- ninguna columna es obligatoria",
  [
    ["id_transaccion", "Integer = autoincremental, PK", VIS_PRI],
    ["id_venta", "Integer = FK a ventas", VIS_PUB],
    ["id_usuario", "Integer = FK a usuarios", VIS_PUB],
    ["proveedor_pasarela", "String = 40", VIS_PUB],
    ["monto", "Decimal = 12,2", VIS_PUB],
    ["moneda", "String = 3, por defecto 'BOB'", VIS_PUB],
    ["metodo", "String = 30", VIS_PUB],
    ["estado", "String = 20, por defecto 'Pendiente'", VIS_PUB],
    ["referencia_externa", "String = 120", VIS_PUB],
    ["id_transaccion_pasarela", "String = 120", VIS_PUB],
    ["fecha_hora", "Timestamp = por defecto NOW()", VIS_PUB],
    ["detalle", "String", VIS_PUB]
  ],
  []],
    // ============================================================
    // 12. DEVOLUCIONES
    // ============================================================

    ["devoluciones", "EXISTE. schema.sql L458", "MODULO: 12. Devoluciones | ORIGEN: schema.sql L458-L467, 8 columnas | PRIMARY KEY: id_devolucion | FOREIGN KEYS: 3, que son las asociaciones de esta tabla | NOT NULL: 0 de 8  <-- ninguna columna es obligatoria",
  [
    ["id_devolucion", "Integer = autoincremental, PK", VIS_PRI],
    ["id_venta", "Integer = FK a ventas", VIS_PUB],
    ["id_usuario", "Integer = FK a usuarios", VIS_PUB],
    ["id_sucursal", "Integer = FK a sucursales", VIS_PUB],
    ["motivo", "String = 255", VIS_PUB],
    ["estado", "String = 20, por defecto 'En trámite'", VIS_PUB],
    ["fecha_creacion", "Timestamp = por defecto NOW()", VIS_PUB],
    ["fecha_procesada", "Timestamp", VIS_PUB]
  ],
  []],

    ["devolucion_items", "EXISTE. schema.sql L469", "MODULO: 12. Devoluciones | ORIGEN: schema.sql L469-L475, 5 columnas | PRIMARY KEY: id_devolucion_item | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 0 de 5  <-- ninguna columna es obligatoria",
  [
    ["id_devolucion_item", "Integer = autoincremental, PK", VIS_PRI],
    ["id_devolucion", "Integer = FK a devoluciones, ON DELETE CASCADE", VIS_PUB],
    ["id_ptc", "Integer = FK a producto_talla_color", VIS_PUB],
    ["cantidad", "Integer", VIS_PUB],
    ["tipo", "String = 20", VIS_PUB]
  ],
  []],
    // ============================================================
    // 13. IA Y REPORTES
    // ============================================================

    ["preferencias_cliente", "EXISTE. schema.sql L501", "MODULO: 13. IA y Reportes | ORIGEN: schema.sql L501-L509, 7 columnas | PRIMARY KEY: id_preferencia | FOREIGN KEYS: 5, que son las asociaciones de esta tabla | NOT NULL: 0 de 7  <-- ninguna columna es obligatoria",
  [
    ["id_preferencia", "Integer = autoincremental, PK", VIS_PRI],
    ["id_cliente", "Integer = FK a clientes", VIS_PUB],
    ["id_categoria", "Integer = FK a categorias", VIS_PUB],
    ["id_talla", "Integer = FK a tallas", VIS_PUB],
    ["id_color", "Integer = FK a colores", VIS_PUB],
    ["id_temporada", "Integer = FK a temporadas", VIS_PUB],
    ["puntaje", "Integer", VIS_PUB]
  ],
  []],

    ["historial_navegacion", "EXISTE. schema.sql L511", "MODULO: 13. IA y Reportes | ORIGEN: schema.sql L511-L516, 4 columnas | PRIMARY KEY: id_historial | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 0 de 4  <-- ninguna columna es obligatoria",
  [
    ["id_historial", "Integer = autoincremental, PK", VIS_PRI],
    ["id_usuario", "Integer = FK a usuarios", VIS_PUB],
    ["id_ptc", "Integer = FK a producto_talla_color", VIS_PUB],
    ["fecha", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],

    ["recomendaciones_ia", "EXISTE. schema.sql L518", "MODULO: 13. IA y Reportes | ORIGEN: schema.sql L518-L524, 5 columnas | PRIMARY KEY: id_recomendacion | FOREIGN KEYS: 2, que son las asociaciones de esta tabla | NOT NULL: 0 de 5  <-- ninguna columna es obligatoria",
  [
    ["id_recomendacion", "Integer = autoincremental, PK", VIS_PRI],
    ["id_usuario", "Integer = FK a usuarios", VIS_PUB],
    ["id_ptc", "Integer = FK a producto_talla_color", VIS_PUB],
    ["justificacion", "String", VIS_PUB],
    ["fecha", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],

    ["conversaciones_ia", "EXISTE. schema.sql L526", "MODULO: 13. IA y Reportes | ORIGEN: schema.sql L526-L532, 5 columnas | PRIMARY KEY: id_conversacion | FOREIGN KEYS: 1, que son las asociaciones de esta tabla | NOT NULL: 0 de 5  <-- ninguna columna es obligatoria",
  [
    ["id_conversacion", "Integer = autoincremental, PK", VIS_PRI],
    ["id_usuario", "Integer = FK a usuarios", VIS_PUB],
    ["mensaje", "String", VIS_PUB],
    ["respuesta", "String", VIS_PUB],
    ["fecha", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],

    ["reportes_generativos", "EXISTE. schema.sql L534", "MODULO: 13. IA y Reportes | ORIGEN: schema.sql L534-L542, 7 columnas | PRIMARY KEY: id_reporte | FOREIGN KEYS: 1, que son las asociaciones de esta tabla | NOT NULL: 0 de 7  <-- ninguna columna es obligatoria",
  [
    ["id_reporte", "Integer = autoincremental, PK", VIS_PRI],
    ["id_usuario", "Integer = FK a usuarios", VIS_PUB],
    ["tipo", "String = 40", VIS_PUB],
    ["parametros", "Json", VIS_PUB],
    ["formato", "String = 10", VIS_PUB],
    ["url_archivo", "String", VIS_PUB],
    ["fecha", "Timestamp = por defecto NOW()", VIS_PUB]
  ],
  []],
    // ============================================================
    // 14. RESPALDOS
    // ============================================================

    ["respaldos", "EXISTE. schema.sql L547", "MODULO: 14. Respaldos | ORIGEN: schema.sql L547-L555, 7 columnas | PRIMARY KEY: id_respaldo | FOREIGN KEYS: 1, que son las asociaciones de esta tabla | NOT NULL: 0 de 7  <-- ninguna columna es obligatoria",
  [
    ["id_respaldo", "Integer = autoincremental, PK", VIS_PRI],
    ["fecha", "Timestamp = por defecto NOW()", VIS_PUB],
    ["tipo", "String = 20", VIS_PUB],
    ["tamano_bytes", "Long", VIS_PUB],
    ["estado", "String = 20, por defecto 'En Progreso'", VIS_PUB],
    ["storage_url", "String", VIS_PUB],
    ["creado_por", "Integer = FK a usuarios", VIS_PUB]
  ],
  []],
];

var REL = [
    ["usuarios_roles", "usuarios", "id_usuario  ·  CASCADE", "Composition", "composition", "0..*", "1"],
    ["usuarios_roles", "roles", "id_rol  ·  CASCADE", "Composition", "composition", "0..*", "1"],
    ["sucursales", "ciudades", "id_ciudad", "Association", "", "0..*", "0..1"],
    ["sucursal_horarios", "sucursales", "id_sucursal  ·  CASCADE", "Composition", "composition", "0..*", "0..1"],
    ["usuarios_empleados", "usuarios", "usuario_id  ·  CASCADE", "Composition", "composition", "0..1", "0..1"],
    ["usuarios_empleados", "sucursales", "sucursal_id", "Association", "", "0..*", "0..1"],
    ["clientes", "usuarios", "usuario_id  ·  CASCADE", "Composition", "composition", "0..1", "0..1"],
    ["first_password_tokens", "usuarios", "usuario_id  ·  CASCADE", "Composition", "composition", "0..*", "0..1"],
    ["email_confirmations", "usuarios", "usuario_id  ·  CASCADE", "Composition", "composition", "0..*", "0..1"],
    ["password_resets", "usuarios", "usuario_id  ·  CASCADE", "Composition", "composition", "0..*", "0..1"],
    ["token_blacklist", "usuarios", "usuario_id  ·  CASCADE", "Composition", "composition", "0..*", "0..1"],
    ["sesiones", "usuarios", "usuario_id  ·  CASCADE", "Composition", "composition", "0..*", "0..1"],
    ["bitacora_auditoria", "usuarios", "id_usuario", "Dependency", "uses", "0..*", "0..1"],
    ["proveedor_contactos", "proveedores", "id_proveedor  ·  CASCADE", "Composition", "composition", "0..*", "0..1"],
    ["productos", "categorias", "id_categoria", "Association", "", "0..*", "0..1"],
    ["productos", "temporadas", "id_temporada", "Association", "", "0..*", "0..1"],
    ["productos", "proveedores", "id_proveedor", "Association", "", "0..*", "0..1"],
    ["producto_talla_color", "productos", "id_producto  ·  CASCADE", "Composition", "composition", "0..*", "0..1"],
    ["producto_talla_color", "tallas", "id_talla", "Association", "", "0..*", "0..1"],
    ["producto_talla_color", "colores", "id_color", "Association", "", "0..*", "0..1"],
    ["producto_imagenes", "productos", "id_producto  ·  CASCADE", "Composition", "composition", "0..*", "0..1"],
    ["producto_imagenes", "colores", "id_color", "Dependency", "uses", "0..*", "0..1"],
    ["producto_precios", "producto_talla_color", "id_ptc  ·  CASCADE", "Composition", "composition", "0..*", "0..1"],
    ["colecciones", "temporadas", "id_temporada", "Association", "", "0..*", "0..1"],
    ["producto_coleccion", "colecciones", "id_coleccion  ·  CASCADE", "Composition", "composition", "0..*", "1"],
    ["producto_coleccion", "productos", "id_producto  ·  CASCADE", "Composition", "composition", "0..*", "1"],
    ["ordenes_compra", "proveedores", "id_proveedor", "Association", "", "0..*", "0..1"],
    ["ordenes_compra", "sucursales", "id_sucursal", "Association", "", "0..*", "0..1"],
    ["orden_compra_items", "ordenes_compra", "id_orden_compra  ·  CASCADE", "Composition", "composition", "0..*", "0..1"],
    ["orden_compra_items", "producto_talla_color", "id_ptc", "Association", "", "0..*", "0..1"],
    ["inventario_stock", "producto_talla_color", "id_ptc", "Association", "", "0..*", "0..1"],
    ["inventario_stock", "sucursales", "id_sucursal", "Association", "", "0..*", "0..1"],
    ["recepciones", "ordenes_compra", "id_orden_compra", "Association", "", "0..*", "0..1"],
    ["recepciones", "sucursales", "id_sucursal", "Association", "", "0..*", "0..1"],
    ["recepciones", "usuarios", "id_usuario", "Association", "", "0..*", "0..1"],
    ["recepcion_items", "recepciones", "id_recepcion  ·  CASCADE", "Composition", "composition", "0..*", "0..1"],
    ["recepcion_items", "producto_talla_color", "id_ptc", "Association", "", "0..*", "0..1"],
    ["alertas_stock_config", "producto_talla_color", "id_ptc", "Association", "", "0..*", "0..1"],
    ["alertas_stock_config", "categorias", "id_categoria", "Association", "", "0..*", "0..1"],
    ["alertas_stock_config", "sucursales", "id_sucursal", "Association", "", "0..*", "0..1"],
    ["reservas", "clientes", "id_cliente", "Association", "", "0..*", "0..1"],
    ["reservas", "usuarios", "id_usuario", "Association", "", "0..*", "0..1"],
    ["reservas", "sucursales", "id_sucursal", "Association", "", "0..*", "0..1"],
    ["reservas", "usuarios", "id_encargado", "Association", "", "0..*", "0..1"],
    ["reserva_items", "reservas", "id_reserva  ·  CASCADE", "Composition", "composition", "0..*", "0..1"],
    ["reserva_items", "producto_talla_color", "id_ptc", "Association", "", "0..*", "0..1"],
    ["carritos", "usuarios", "id_usuario", "Association", "", "0..*", "0..1"],
    ["carritos", "sucursales", "id_sucursal", "Association", "", "0..*", "0..1"],
    ["carrito_items", "carritos", "id_carrito  ·  CASCADE", "Composition", "composition", "0..*", "0..1"],
    ["carrito_items", "producto_talla_color", "id_ptc", "Association", "", "0..*", "0..1"],
    ["ventas", "clientes", "id_cliente", "Association", "", "0..*", "0..1"],
    ["ventas", "usuarios", "id_usuario", "Association", "", "0..*", "0..1"],
    ["ventas", "sucursales", "id_sucursal", "Association", "", "0..*", "0..1"],
    ["ventas", "carritos", "id_carrito", "Association", "", "0..*", "0..1"],
    ["venta_items", "ventas", "id_venta  ·  CASCADE", "Composition", "composition", "0..*", "0..1"],
    ["venta_items", "producto_talla_color", "id_ptc", "Association", "", "0..*", "0..1"],
    ["comprobantes", "ventas", "id_venta", "Association", "", "0..*", "0..1"],
    ["movimientos_inventario", "producto_talla_color", "id_ptc", "Association", "", "0..*", "0..1"],
    ["movimientos_inventario", "sucursales", "id_sucursal", "Association", "", "0..*", "0..1"],
    ["movimientos_inventario", "usuarios", "id_usuario", "Association", "", "0..*", "0..1"],
    ["movimientos_inventario", "ordenes_compra", "id_orden_compra", "Association", "", "0..*", "0..1"],
    ["movimientos_inventario", "ventas", "id_venta", "Association", "", "0..*", "0..1"],
    ["movimientos_inventario", "reservas", "id_reserva", "Association", "", "0..*", "0..1"],
    ["transacciones_pago", "ventas", "id_venta", "Association", "", "0..*", "0..1"],
    ["transacciones_pago", "usuarios", "id_usuario", "Association", "", "0..*", "0..1"],
    ["devoluciones", "ventas", "id_venta", "Association", "", "0..*", "0..1"],
    ["devoluciones", "usuarios", "id_usuario", "Association", "", "0..*", "0..1"],
    ["devoluciones", "sucursales", "id_sucursal", "Association", "", "0..*", "0..1"],
    ["devolucion_items", "devoluciones", "id_devolucion  ·  CASCADE", "Composition", "composition", "0..*", "0..1"],
    ["devolucion_items", "producto_talla_color", "id_ptc", "Association", "", "0..*", "0..1"],
    ["sesiones_ra", "usuarios", "id_usuario", "Association", "", "0..*", "0..1"],
    ["sesiones_ra", "producto_talla_color", "id_ptc", "Association", "", "0..*", "0..1"],
    ["sesiones_ra", "reservas", "id_reserva", "Association", "", "0..*", "0..1"],
    ["sesiones_ra", "carritos", "id_carrito", "Association", "", "0..*", "0..1"],
    ["resultados_prueba", "sesiones_ra", "id_sesion_ra", "Association", "", "0..*", "0..1"],
    ["resultados_prueba", "producto_talla_color", "id_ptc", "Association", "", "0..*", "0..1"],
    ["preferencias_cliente", "clientes", "id_cliente", "Association", "", "0..*", "0..1"],
    ["preferencias_cliente", "categorias", "id_categoria", "Association", "", "0..*", "0..1"],
    ["preferencias_cliente", "tallas", "id_talla", "Association", "", "0..*", "0..1"],
    ["preferencias_cliente", "colores", "id_color", "Association", "", "0..*", "0..1"],
    ["preferencias_cliente", "temporadas", "id_temporada", "Association", "", "0..*", "0..1"],
    ["historial_navegacion", "usuarios", "id_usuario", "Association", "", "0..*", "0..1"],
    ["historial_navegacion", "producto_talla_color", "id_ptc", "Association", "", "0..*", "0..1"],
    ["recomendaciones_ia", "usuarios", "id_usuario", "Association", "", "0..*", "0..1"],
    ["recomendaciones_ia", "producto_talla_color", "id_ptc", "Association", "", "0..*", "0..1"],
    ["conversaciones_ia", "usuarios", "id_usuario", "Association", "", "0..*", "0..1"],
    ["reportes_generativos", "usuarios", "id_usuario", "Association", "", "0..*", "0..1"],
    ["respaldos", "usuarios", "creado_por", "Association", "", "0..*", "0..1"],
];

// ================================================================
// MAIN del diagrama de clases del MODELO DE DATOS
// ================================================================

var ALTO = 14;
var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "Diseno de Datos";
var DIAG_NOMBRE = "Modelo de Datos - Diagrama de Clases";
var DIAG_TIPO = "Class";

// LA BANDEJA DE HALLAZGOS, a la derecha de todo.  X0 30 + 6 columnas de 270
// + 250 de ancho = 1900, y 400 de margen = 2300.
var X_NOTA = 2300;
var ANCHO_NOTA = 700;
var Y_NOTA0 = 250;
var ALTO_LINEA_NOTA = 10;
var ALTO_MIN_NOTA = 130;
var SEPARACION_NOTA = 26;

var COLS = 7;
var PASO_X = 270;
var ANCHO_CLA = 250;
var PASO_Y = 280;
var Y0 = 25;

var ERRORES = [];
var INFORME = [];
var CONECTORES_PUESTOS = 0;

var HAL = [
    ["1. 51 tablas, 88 relaciones, y UN solo CHECK, y está en la tabla equivocada", [
        "La cuenta del modelo, entera, y no hay que suavizarla:",
        "",
        "  51 tablas          todas en schema.sql, de la L23 a la L555",
        "  340 columnas",
        "  88 claves foráneas",
        "  22 ON DELETE CASCADE, 2 ON DELETE SET NULL, 64 sin nada",
        "   7 índices",
        "   1 CHECK",
        "   0 ALTER TABLE",
        "   0 vistas",
        "   0 enums",
        "   0 dominios de CHECK",
        "",
        "Y EL ÚNICO CHECK DEL ESQUEMA ENTERO ES ESTE, schema.sql L294:",
        "",
        "  cantidad  INTEGER NOT NULL CHECK (cantidad > 0),",
        "",
        "  Y ESTÁ EN orden_compra_items, L290-300.   O sea que la única",
        "  invariante que la base de datos protege en todo el proyecto es",
        "  que la cantidad de una LÍNEA DE COMPRA sea positiva.   Y es la",
        "  cantidad menos importante que hay en el sistema.",
        "",
        "LO QUE QUEDA SIN PROTEGER, y esto es lo que hay que mirar:",
        "",
        "  carrito_items.cantidad        puede ser 0 o negativa",
        "  venta_items.cantidad          puede ser 0 o negativa",
        "  reserva_items.cantidad        puede ser 0 o negativa",
        "  inventario_stock              LAS CUATRO cantidades pueden",
        "                               ser negativas, y no hay ni una",
        "                               que lo impida",
        "  preferencias_cliente.puntaje  puede ser negativo o nulo",
        "  movimientos_inventario        cantidad y stock_anterior y",
        "                               stock_posterior sin comprobar",
        "  comprobantes / ventas         total y subtotal sin comprobar",
        "  sesion_ra                     todo sin comprobar",
        "",
        "Y NO ES QUE NO SE PUEDA, ES QUE NO SE HIZO, porque el modelo tiene",
        "capacity de sobra: hay 7 índices y cero ALTER TABLE.   Se puso el",
        "índice antes que el CHECK.",
        "",
        "CONSECUENCIA, y es la que se ve: la integridad de los datos la",
        "sostiene el TypeScript, que son 147 ficheros de aplicación, y si",
        "alguien inserta con psql o con un script de carga, el modelo no",
        "dice nada.   Y CU31 ya mostró lo que pasa cuando el único sitio que",
        "valida el disponible es el código: la prenda se vende dos veces."
    ]],
    ["2. ventas.estado dice lo contrario de lo que pasa", [
        "El hallazgo que más confunde a quien lea el modelo, porque es",
        "una contradicción directa entre el esquema y el código.",
        "",
        "LO QUE DICE EL MODELO, schema.sql L395:",
        "",
        "  estado  VARCHAR(20) DEFAULT 'Completada',",
        "",
        "O SEA QUE SEGÚN EL MODELO, UNA VENTA NACE COMPLETADA.",
        "",
        "LO QUE HACE EL CÓDIGO, SRV_VentasService L238-240, que es el",
        "ÚNICO INSERT INTO ventas del proyecto:",
        "",
        "  INSERT INTO ventas (..., estado, fecha_venta)",
        "  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pendiente', NOW())",
        "",
        "O SEA QUE EL INSERT PONE SIEMPRE 'Pendiente' Y NUNCA USA EL",
        "DEFAULT.   El DEFAULT está muerto, y no por casualidad: nadie",
        "loexercise porque el único INSERT lo pisa.",
        "",
        "Y PEOR: el DEFAULT ES LO CONTRARIO DE LA VERDAD, así que",
        "cualquier INSERT nuevo que olvide la columna crea una venta",
        "cobrada que nadie ha cobrado.   Y el modelo no avisa, porque no",
        "hay CHECK ni enum ni tabla de estados.",
        "",
        "Y LA MÁQUINA DE ESTADOS DE ESA COLUMNA NO EXISTE, y esto es lo",
        "que se ve en el diagrama: la columna estado está repetida en",
        "14 tablas, y las 14 son VARCHAR(20) con un DEFAULT distinto, y",
        "el proyecto entero usa UN SOLO valor, que es 'Completada',",
        "escrito a mano en 2 sitios:",
        "",
        "  Pagos L334   UPDATE ventas SET estado = 'Completada'",
        "  Pagos L696   UPDATE ventas SET estado = 'Completada'",
        "",
        "Los otros valores que sí usa el código, cada uno en su sitio y",
        "en minúsculas o mayúsculas según el módulo, son:",
        "",
        "  ventas              Pendiente, Completada",
        "  carritos            Activo, En pago, Convertido a venta",
        "  reservas            Solicitada, En tienda, Cumplida, Cancelada",
        "  transacciones_pago  Pendiente, Aprobado, Rechazado",
        "  ordenes_compra      Pedida, Recibida",
        "  respaldos           En Progreso",
        "",
        "O SEA QUE HAY UNAS 12 MÁQUINAS DE ESTADO DISTINTAS, ESCRITAS",
        "COMO LITERALES SUELTOS, SIN NINGÚN LUGAR DONDE ESTAR DEFINIDAS.",
        "El diagrama lo enseña así a propósito: la columna se dibuja con",
        "sus valores, y los valores no están en ninguna parte del modelo."
    ]],
    ["3. estado_stock: una columna que el modelo declara y nadie escribe", [
        "El hallazgo que ya apareció en CU31, y que aquí es de otro",
        "tipo: no es que la columna esté mal, es que NO ES UNA COLUMNA",
        "DE DATOS. Es un dato derivado, y el modelo lo trata como si",
        "fuera almacenado.",
        "",
        "EL MODELO, schema.sql L237-244:",
        "",
        "  CREATE TABLE producto_talla_color (",
        "    id_ptc        SERIAL PRIMARY KEY,",
        "    id_producto   INTEGER REFERENCES productos(id_producto),",
        "    id_talla      INTEGER REFERENCES tallas(id_talla),",
        "    id_color      INTEGER REFERENCES colores(id_color),",
        "    estado_stock  VARCHAR(20) DEFAULT 'Disponible',",
        "    UNIQUE (id_producto, id_talla, id_color)",
        "  );",
        "",
        "LO QUE PASA EN REALIDAD:",
        "",
        "  escrituras de estado_stock en los 147 .ts y .tsx   CERO",
        "  escrituras de estado_stock en todo schema.sql       CERO",
        "",
        "O SEA QUE LA COLUMNA NUNCA CAMBIA DE VALOR.   Se queda en",
        "'Disponible' desde el INSERT que la creó, para siempre.",
        "",
        "Y ESO LA CONVIERTE EN UNA COLUMNA QUE MIENTE, porque hay 6",
        "sitios que la leen para DECIDIR si una prenda está disponible:",
        "",
        "  SRV_CarritoService    L246   si es 'sin stock', rechaza",
        "  SRV_ReservasService  L1197   si NO es 'disponible', rechaza",
        "  SRV_ReservasService   L330   WHERE estado_stock = 'Disponible'",
        "  SRV_ReservasService   L383   WHERE estado_stock = 'Disponible'",
        "  SRV_VentasService     L197   si NO es 'Disponible', rechaza",
        "  SRV_VentasService     L315   WHERE estado_stock <> 'Sin stock'",
        "",
        "Y OJO CON QUE NO COINCIDEN ENTRE SÍ: Carrito L246 busca",
        "'sin stock' en minúscula y Reservas L1197 busca 'disponible'",
        "en minúscula, y la columna tiene 'Disponible' y 'Sin stock'",
        "con mayúscula.   O sea que dos de las seis comparaciones no",
        "pueden ser ciertas NI SIQUIERA si alguien escribiera la",
        "columna, por las mayúsculas.   Y las otras cuatro son",
        "siempre ciertas, porque el valor nunca cambia.",
        "",
        "EL DIAGRAMA DIBUJA LA COLUMNA IGUAL, y con la nota de que no",
        "la escribe nadie, porque el modelo la declara y eso hay que",
        "enseñarlo.   Lo que NO se dibuja es la regla que el documento",
        "pide, L176 punto d: si disponible mas reservada es 0, Sin",
        "stock; si disponible es menor o igual que stock_minimo_alert,",
        "Bajo; si no, Disponible.   Esa regla NO EXISTE en el modelo,",
        "ni en el esquema, ni en el código.",
        "",
        "LO QUE LA ARREGLA, y es una decisión de diseño: se borra la",
        "columna y se sustituye por una vista, o por el EXISTS que ya",
        "escribe SRV_RecomendacionesService L197-198 sobre",
        "inventario_stock.   Ese EXISTS es la única comprobación de",
        "stock REAL que hay en el proyecto, y es una recomendación, que",
        "es lo último que se audita."
    ]],
    ["4. inventario_stock: cuatro cantidades y ni una regla que las ate", [
        "El hallazgo que CU31 encontró desde el otro lado, y que aquí",
        "se ve en el modelo: las cuatro cantidades son datos sueltos.",
        "",
        "EL MODELO, schema.sql L302-311:",
        "",
        "  CREATE TABLE inventario_stock (",
        "    id_stock            SERIAL PRIMARY KEY,",
        "    id_ptc              INTEGER REFERENCES producto_talla_color(id_ptc),",
        "    id_sucursal         INTEGER REFERENCES sucursales(id_sucursal),",
        "    cantidad_disponible INTEGER DEFAULT 0,",
        "    cantidad_reservada  INTEGER DEFAULT 0,",
        "    cantidad_vendida    INTEGER DEFAULT 0,",
        "    stock_minimo_alert  INTEGER DEFAULT 0,",
        "    UNIQUE (id_ptc, id_sucursal)",
        "  );",
        "",
        "LAS CUATRO SON INTEGER, LAS CUATRO CON DEFAULT 0, Y NINGUNA DE",
        "LAS CUATRO TIENE CHECK.   Así que las cuatro pueden ser",
        "negativas, y el modelo lo permite.",
        "",
        "Y LO QUE NO EXISTE ES LA RELACIÓN ENTRE ELLAS.   En un modelo de",
        "tienda de ropa, cantidad_disponible, cantidad_reservada y",
        "cantidad_vendida tienen que obeyecer una ecuación, y aquí no hay",
        "nada que la imponga:",
        "",
        "  NO hay CHECK de que disponible mas reservada mas vendida sea",
        "       el stock total",
        "  NO hay CHECK de que disponible sea mayor o igual que cero",
        "  NO hay CHECK de que reservada sea mayor o igual que cero",
        "  NO hay vista que calcule nada de esto",
        "  NO hay función en el esquema que lo calcule",
        "",
        "O SEA QUE LA ECUACIÓN DEL INVENTARIO NO ESTÁ ESCRITA EN NINGÚN",
        "SITIO DEL PROYECTO.   Los tres números son independientes, y",
        "cualquier UPDATE puede dejarlos incoherentes para siempre.",
        "",
        "Y CUANTAS VECES SE ESCRIBE CADA UNA, contadas en el proyecto:",
        "",
        "  cantidad_disponible   2   el trigger de L648, y Reservas L710",
        "  cantidad_reservada    4   Reservas L709, L979 y L1117, y",
        "                              schema.sql L761, en una función",
        "                              que no llama nadie",
        "  cantidad_vendida      2   Pagos L341 y L711, los dos de cobro",
        "  stock_minimo_alert    -   en el modelo y en el panel, pero",
        "                              nadie lo lee en ninguna consulta",
        "",
        "O SEA QUE LA COLUMNA QUE SERIA EL UNICO LUGAR DONDE PODRIA",
        "VIVIR LA REGLA, stock_minimo_alert, NO SE USA PARA NADA, Y LA",
        "QUE LA RESPETA EL MODELO, la UNIQUE DE L310, ES LA UNICA COSA",
        "QUE SI ESTA Y SIRVE: es la que hace que el ON CONFLICT del",
        "trigger pueda funcionar, y CU31 lo confirmo contando los dos"
    ]],
    ["5. Dos columnas que el código usa y el modelo no tiene", [
        "El hallazgo que demuestra que el modelo y la aplicación NO",
        "están sincronizados, y son dos columnas concretas.",
        "",
        "  carritos.token_invitado        NO EXISTE EN schema.sql",
        "  sesiones_ra.foto_resultado     NO EXISTE EN schema.sql",
        "",
        "LAS DOS ESTÁN EN LOS MODELOS DE LA APLICACIÓN, PERO NO EN EL",
        "ESQUEMA.   Y contados los sitios de código que las nombran:",
        "44.   Cuarenta y cuatro.",
        "",
        "PARA token_invitado, SRV_CarritoService, y no es un SELECT",
        "casual, es el MECANISMO ENTERO DEL CARRITO DE INVITADO, que es",
        "el CU25:",
        "",
        "  L80    el tipo de retorno lo declara",
        "  L97    lo pone a null al crear",
        "  L105   WHERE c.token_invitado = $1   o sea, la BUSQUEDA",
        "  L115   SET token_invitado = NULL   al hacerlo propio",
        "  L122   lo pone a null al fusionar",
        "  L139   lo pone a null en otro camino",
        "  L150   WHERE c.token_invitado = $1   otra vez",
        "  L161   lo rellena al crear el carrito invitado",
        "",
        "O SEA QUE EL CARRITO DE INVITADO DEL DOCUMENTO, que es un caso",
        "de uso completo con su propio diagrama de secuencia, FUNCIONA",
        "SOBRE UNA COLUMNA QUE NO ESTÁ EN EL MODELO DE DATOS.   O el",
        "esquema está viejo, o la aplicación escribe en una columna",
        "fantasma que PostgreSQL no tiene y tiraría la consulta.",
        "",
        "Y PARA foto_resultado es peor, porque es una FOTO, o sea un",
        "binario de peso, y en CU24 se vio que la cadena deTypeScript la",
        "monta y la guarda.   En sesiones_ra, schema.sql L480-489, no",
        "hay ninguna columna de imagen.   Y ojo: sesiones_ra es",
        "precisamente la tabla que CU24 dibuja, y la que CU24 ya",
        "acusó de este mismo problema.",
        "",
        "EL DIAGRAMA DIBUJA LAS 51 TABLAS TAL COMO ESTÁN, SIN INVENTAR",
        "LAS DOS COLUMNAS QUE FALTAN.   Y por eso hay que avisar: este",
        "diagrama es el modelo que declara el ESQUEMA, que no es",
        "exactamente el que usa la APLICACIÓN.   La diferencia, por lo",
        "menos, son estas dos columnas."
    ]],
    ["6. 45 de 51 tablas sin un solo índice, y el que se llama de cliente está en la columna del empleado", [
        "Un hallazgo de rendimiento, y el nombre del índice es lo que",
        "hace que sea confuso de verdad.",
        "",
        "LOS 7 ÍNDICES DEL ESQUEMA, y solo 6 tablas los tienen:",
        "",
        "  L560  idx_bitacora_fecha        bitacora_auditoria (fecha_hora DESC)",
        "  L561  idx_bitacora_tabla        bitacora_auditoria (tabla_afectada)",
        "  L562  idx_mov_inv_ptc_suc       movimientos_inventario (id_ptc, id_sucursal, fecha)",
        "  L563  idx_inventario_sucursal  inventario_stock (id_sucursal)",
        "  L564  idx_ventas_sucursal_fecha ventas (id_sucursal, fecha_venta)",
        "  L565  idx_reservas_cliente      reservas (id_usuario)",
        "  L566  idx_ordenes_proveedor     ordenes_compra (id_proveedor, estado)",
        "",
        "O SEA QUE 45 DE LAS 51 TABLAS NO TIENEN NINGÚN ÍNDICE, y",
        "ninguna de las 7 es UNIQUE, así que no hay ni una restricción",
        "de unicidad que no sea una columna suelta o la UNIQUE de",
        "producto_talla_color y la de inventario_stock.",
        "",
        "Y EL ÍNDICE QUE MIENTE, que es el hallazgo de este apartado:",
        "",
        "  L565  CREATE INDEX idx_reservas_cliente ON reservas (id_usuario);",
        "",
        "SE LLAMA DE CLIENTE Y ESTÁ EN id_usuario, que es el EMPLEADO.",
        "Y la columna que se llama de cliente, id_cliente, L346, NO",
        "TIENE ÍNDICE, y el código la filtra en 3 sitios:",
        "",
        "  Reservas L424   WHERE r.id_cliente = $1",
        "  Reservas L461   WHERE r.id_reserva = $1 AND r.id_cliente = $2",
        "  Reservas L929   WHERE r.id_reserva = $1 AND r.id_cliente = $2",
        "",
        "ASÍ QUE LA CONSULTA DE LAS RESERVAS DE UN CLIENTE, que es la",
        "pantalla principal del módulo, hace un Seq Scan de la tabla",
        "entera.   Y el índice que hay, y que sí se usa, va al revés de",
        "lo que su nombre dice.",
        "",
        "Y LA TABLA HUB, que es la que más se consulta del proyecto, no",
        "tiene índice propio: producto_talla_color es padre de 14",
        "hijos y es la bisagra de todas las consultas de stock, y lo",
        "único que la cubre es el índice de movimientos_inventario.",
        "",
        "Lo que el diagrama enseña aquí es el MODELO, y en el modelo",
        "esto no se ve: un índice no es una clase ni una relación.   Por",
        "eso está en la bandeja de hallazgos y no en las cajas."
    ]],
    ["7. preferencias_cliente admite una fila que no dice nada", [
        "El hallazgo de la tabla peor sobrecargada del modelo, y la",
        "que tiene más claves foráneas por columnas.",
        "",
        "EL MODELO, schema.sql L501-509, y son 7 líneas:",
        "",
        "  CREATE TABLE preferencias_cliente (",
        "    id_preferencia SERIAL PRIMARY KEY,",
        "    id_cliente     INTEGER REFERENCES clientes(id_cliente),",
        "    id_categoria   INTEGER REFERENCES categorias(id_categoria),",
        "    id_talla       INTEGER REFERENCES tallas(id_talla),",
        "    id_color       INTEGER REFERENCES colores(id_color),",
        "    id_temporada   INTEGER REFERENCES temporadas(id_temporada),",
        "    puntaje        INTEGER",
        "  );",
        "",
        "LO QUE NO TIENE, y es la lista completa:",
        "",
        "  NINGUNA columna es NOT NULL, ni siquiera id_cliente",
        "  NINGUNA columna es UNIQUE",
        "  NINGUN indice sobre ninguna columna",
        "  NINGUN CHECK de que el puntaje sea positivo",
        "",
        "CONSECUENCIA 1, Y ES LA DIRECTA: una fila puede tener las CINCO",
        "referencias a NULL y un puntaje NULL, y el modelo la acepta.",
        "Una preferencia que no dice qué prefiere nadie.   Y eso no es",
        "hipotético, porque la aplicación las inserta así:",
        "",
        "  SRV_PreferenciasService L57  INSERT INTO preferencias_cliente",
        "                                (id_cliente, ${dimension}, puntaje)",
        "",
        "La palabra dimension se sustituye en runtime, o sea que la",
        "consulta cambia de forma según de dónde venga la llamada.   Y",
        "CU32 ya vio el hueco de eso: la respuesta devuelve un campo",
        "llamado fuente que dice de dónde sale, y cuando el degradado",
        "es por prenda, L298-305, ese valor no es cierto.",
        "",
        "CONSECUENCIA 2: sin UNIQUE, el mismo par cliente y categoría",
        "puede aparecer tantas veces como quiera, y el 'upsert' que",
        "dice el comentario del propio servicio, L12, no es un upsert:",
        "",
        "  L41   SELECT ... FROM preferencias_cliente   para buscar la fila",
        "  L50   UPDATE preferencias_cliente SET puntaje = puntaje + $2",
        "  L57   INSERT INTO preferencias_cliente",
        "",
        "Eso es un SELECT, y luego UPDATE o INSERT según lo que encuentre,",
        "y entre medias puede entrar otro.   Un UPSERT de verdad es un",
        "INSERT ... ON CONFLICT, que es justo lo que el trigger de",
        "inventario_stock SÍ usa, y con el que funciona, porque tiene",
        "la UNIQUE de L310 detrás.   Aquí no hay UNIQUE detrás, así que",
        "no se puede.",
        "",
        "Y LA DIFERENCIA DE MODELO ENTRE LAS DOS TABLAS ES LA CLAVE:",
        "inventario_stock, que es la que el trigger mueve, tiene UNIQUE",
        "(id_ptc, id_sucursal).   preferencias_cliente, que la aplica",
        "escrita, no tiene ninguna.   El mismo equipo, dos criterios."
    ]],
    ["8. Lo que el modelo sí hace bien, y son cinco cosas", [
        "Un diagrama de 51 clases y 88 líneas es sobre todo un aviso.",
        "Este es el otro lado, y también se cuenta.",
        "",
        "1. LAS 22 ON DELETE CASCADE SON COHERENCIA GRATIS.   22 de las",
        "   88 relaciones borran al hijo cuando muere el padre, y eso es",
        "   integridad referencial de verdad, gratis, sin una linea de",
        "   código.   Y las 2 SET NULL, en producto_imagenes L249 y",
        "   bitacora_auditoria L150, están donde toca: una foto sin",
        "   producto y un registro sin autor tienen que sobrevivir.",
        "   O sea que las 88 tienen ON DELETE pensado, no heredado por",
        "   descuido.   Las 64 que no tienen ON DELETE son RESTRICT, que",
        "   es lo correcto para ventas, pagos y stock.",
        "",
        "2. Y LA UNIQUE DE producto_talla_color ES LA FORMA CORRECTA DE",
        "   MODELAR ESA RELACIÓN.   UNIQUE (id_producto, id_talla,",
        "   id_color), L243, sobre una entidad asociativa.   Es la",
        "   solución de textbook para producto por talla por color, y",
        "   además funciona: es la que hace que la consulta del stock",
        "   de una prenda sea una búsqueda y no un recorrido.",
        "",
        "3. Y LA DE inventario_stock TAMBIÉN, Y CON MÁS RAZÓN, porque es",
        "   la que hace posible el ON CONFLICT del trigger, CU31 L647.",
        "   Sin ese UNIQUE, el INSERT ... ON CONFLICT de L645-648 no",
        "   tendría contra qué conflicto, y el caso de actualizar el",
        "   inventario tras venta no existiría en una sola sentencia.",
        "",
        "4. Y LAS 8 TABLAS RAÍZ NO TIENEN NINGUNA FK.   Son roles,",
        "   usuarios, ciudades, tallas, colores, categorias, temporadas",
        "   y proveedores.   Y eso es lo correcto: son los catálogos y",
        "   las raíces del grafo, y no deben depender de nadie.   El",
        "   grafo de las 88 relaciones arranca limpio desde 8 vértices",
        "   y no tiene ni un ciclo de creación, que es la trampa",
        "   clásica de un modelo de datos.",
        "",
        "5. Y TODAS LAS CLAVES PRIMARIAS SON SERIAL.   Las 51, sin una",
        "   sola excepción y sin ni una clave natural.   Eso evita la",
        "   discusión de si el correo es la clave del usuario, que es",
        "   la pelea más tonta que hay en un modelo de tienda.   Y la",
        "   tabla puente usuarios_roles, L45-49, lo hace todavía mejor:",
        "   PRIMARY KEY (id_usuario, id_rol) y nada más.   Es una tabla",
        "   de unión, y su clave ES la unión, sin columna inventada."
    ]]
];

// ---------------------------------------------------------------
// UTILIDADES  ·  el mismo patron de los 36 diagramas de clases
// ---------------------------------------------------------------

function pad(s, n) { var t = String(s); while (t.length < n) t = t + " "; return t; }

function nota(el, texto) {
    if (el == null) return;
    try { el.Notes = texto; } catch (e) { }
    try { el.Update(); } catch (e) { }
}

function buscarPaquete(P, N) {
    if (P == null) return null;
    var res = null;
    try {
        for (var i = 0; i < P.Packages.Count; i++) {
            var p = P.Packages.GetAt(i);
            if (String(p.Name) == N) { res = p; break; }
        }
    } catch (e) { }
    return res;
}

function subPaquete(padre, nombre) {
    if (padre == null) return null;
    var p = buscarPaquete(padre, nombre);
    if (p != null) return p;
    // AddNew con un solo argumento no funciona en todas las versiones de EA,
    // y con dos tampoco si el tipo va mal.   Se prueban las dos formas, y si
    // las dos fallan se prueba tambien en la raiz del modelo, que es donde
    // acaba el paquete cuando "Diseno Logico" no existe todavia.
    try { p = padre.Packages.AddNew(nombre); } catch (e) { p = null; }
    if (p == null) {
        try { p = padre.Packages.AddNew(nombre, 0); } catch (e2) { p = null; }
    }
    if (p == null) {
        try { p = padre.Packages.AddNew(nombre, -1); } catch (e3) { p = null; }
    }
    if (p == null) {
        try { p = RAIZ.Packages.AddNew(nombre); } catch (e4) { p = null; }
    }
    if (p == null) {
        try { p = RAIZ.Packages.AddNew(nombre, 0); } catch (e5) { p = null; }
    }
    return p;
}

function buscarLocal(paq, nombre) {
    if (paq == null) return null;
    try {
        for (var i = 0; i < paq.Elements.Count; i++) {
            var e = paq.Elements.GetAt(i);
            if (String(e.Name) == nombre) return e;
        }
    } catch (e) { }
    return null;
}

function objetoEn(diag, el) {
    if (diag == null || el == null) return null;
    try {
        for (var i = 0; i < diag.DiagramObjects.Count; i++) {
            var o = diag.DiagramObjects.GetAt(i);
            if (o.ElementID == el.ElementID) return o;
        }
    } catch (e) { }
    return null;
}

function nombresDe(coleccion) {
    var s = "|";
    try {
        for (var i = 0; i < coleccion.Count; i++) s = s + String(coleccion.GetAt(i).Name) + "|";
    } catch (e) { }
    return s;
}

function contiene(lista, nombre) { return lista.indexOf("|" + nombre + "|") >= 0; }
function totalDe(lista) { if (lista == "") return 0; return lista.split("|").length - 1; }

function agregarAtributo(el, nombre, tipo, vis) {
    var a = null;
    try { a = el.Attributes.AddNew(nombre, tipo, null, vis, vis); } catch (e) { a = null; }
    if (a == null) {
        try { a = el.Attributes.AddNew(nombre, tipo, 0, vis, vis); } catch (e2) { a = null; }
    }
    if (a == null) {
        try { a = el.Attributes.AddNew(nombre, tipo); } catch (e3) { a = null; }
    }
    if (a == null) return false;
    try { a.Name = nombre; } catch (e) { }
    try { a.Type = tipo; } catch (e) { }
    try { a.Visibility = vis; } catch (e) { }
    try { a.Stereotype = ""; } catch (e) { }
    try { a.Update(); } catch (e) { }
    return true;
}

function colocar(diag, el, izq, arr, ancho, alto) {
    var o = objetoEn(diag, el);
    if (o == null) {
        var tam = "l=" + izq + ";r=" + (izq + ancho) + ";t=" + arr + ";b=" + (arr + alto) + ";";
        try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e) { return null; }
        if (o == null) return null;
        o.ElementID = el.ElementID;
    }
    try { o.ManuallySized = true; } catch (e) { }
    try { o.Left = izq; } catch (e) { }
    try { o.Top = arr; } catch (e) { }
    try { o.Right = izq + ancho; } catch (e) { }
    try { o.Bottom = arr + alto; } catch (e) { }
    try { o.FontSize = 8; } catch (e) { }
    try { o.Update(); } catch (e) { }
    return o;
}

function compartimento(diag, paq, nombre, lineas, izq, arr, ancho) {
    var alto = lineas.length * ALTO + 8;
    var el = buscarLocal(paq, nombre);
    if (el == null) {
        try { el = paq.Elements.AddNew(nombre, "Text"); } catch (e) { el = null; }
        if (el == null) {
            try { el = paq.Elements.AddNew(nombre, "Class"); } catch (e2) { }
            try { el.Stereotype = ""; } catch (e2) { }
        }
    }
    if (el == null) return;
    try { el.Text = lineas.join(SALTO); } catch (e) { }
    try { el.Notes = lineas.join(SALTO); } catch (e) { }
    try { el.Update(); } catch (e) { }
    var o = colocar(diag, el, izq, arr, ancho, alto);
    if (o == null) return;
    try { o.BorderStyle = 0; } catch (e) { }
    try { o.BackGroundColor = 16777215; } catch (e) { }
    try { o.FontSize = 7; } catch (e) { }
    try { o.WrapText = true; } catch (e) { }
    try { o.ShowNotes = true; } catch (e) { }
    try { o.Update(); } catch (e) { }
}

function enDiagrama(diag, con) {
    if (diag == null || con == null) return false;
    try {
        for (var i = 0; i < diag.DiagramObjects.Count; i++) {
            var o = diag.DiagramObjects.GetAt(i);
            if (o.ObjectID != 0 && o.ElementID == con.ElementID) return true;
        }
    } catch (e) { }
    try { return con.DiagramID == diag.ID; } catch (e2) { }
    return false;
}

// El conector se crea en el PAQUETE, no en el diagrama.  Como el script borra
// y recrea el diagrama en cada pasada, hay que COLOCARLO a mano con DiagramID:
// si no, EA solo lo dibuja la primera vez y al reejecutar sale sin lineas.
//
// Y AQUI HAY UN ARREGLO QUE NO ESTA EN LOS OTROS 36 DIAGRAMAS: el
// borrado del conector anterior mira el NOMBRE tambien.   Sin eso,
// reservas -> usuarios se dibuja una sola vez, porque las dos FK
// (id_usuario, L347, e id_encargado, L352) van al mismo padre, y la
// segunda borraba a la primera.  Con 88 relaciones eso son 2 lineas que
// se perdian en silencio.
function relacion(diag, a, b, etiqueta, tipo, est, rolA, rolB, cA, cB) {
    if (a == null || b == null) return 0;
    var i;
    var previo = null;
    for (i = 0; i < a.Connectors.Count; i++) {
        var c = a.Connectors.GetAt(i);
        if (c.SupplierID == b.ElementID && String(c.Name) == String(etiqueta)) { previo = c; break; }
    }
    if (previo != null) {
        try { previo.Delete(); } catch (e) { }
    }
    var con = null;
    try { con = a.Connectors.AddNew("", tipo); } catch (e) { con = null; }
    if (con == null) {
        try { con = a.Connectors.AddNew("", "Association"); } catch (e) { con = null; }
    }
    if (con == null) return 0;
    try { con.ClientID = a.ElementID; } catch (e) { }
    try { con.SupplierID = b.ElementID; } catch (e) { }
    try { con.Name = etiqueta; } catch (e) { }
    try { con.Stereotype = est; } catch (e) { }
    try { con.Update(); } catch (e) { }
    try { con.DiagramID = diag.ID; con.Update(); } catch (e) { }
    try { con.SourceRole = rolA; } catch (e) { }
    try { con.DestinationRole = rolB; } catch (e) { }
    try { con.SourceCardinality = cA; } catch (e) { }
    try { con.DestinationCardinality = cB; } catch (e) { }
    try { con.FontSize = 6; } catch (e) { }
    try { con.Update(); } catch (e) { }
    if (enDiagrama(diag, con)) { CONECTORES_PUESTOS++; return 1; }
    return 0;
}

// Notas del diagrama de datos
function notasDelDiagrama(diag, puestas, h, clasesReales, totalAtr) {
    var N = [];
    N.push("MODELO DE DATOS  ·  Diagrama de clases del diseño de datos.");
    N.push("");
    N.push("QUÉ ES Y DÓNDE ESTÁ");
    N.push("");
    N.push("  Base de datos/schema.sql, 892 líneas, y es la fuente de verdad de");
    N.push("  este diagrama.   51 tablas de la L23 a la L555, más 2 triggers en la");
    N.push("  L620 y la L654, 8 funciones y 7 procedimientos entre la L608 y la");
    N.push("  L900, y 7 índices entre la L560 y la L566.");
    N.push("");
    N.push("  Los triggers y las funciones NO están en este diagrama, y es a");
    N.push("  propósito: son comportamiento, no datos.   Los lleva el diagrama de");
    N.push("  CU31, Actualizar Inventario Tras Venta, que es el único caso de la");
    N.push("  serie cuya mitad viva está en el esquema.");
    N.push("");
    N.push("  Y el documento de base de datos del proyecto, DISEÑO BD COMPLETA.md,");
    N.push("  tiene 706 líneas y reparte estas mismas 51 tablas en 16 partes.   Los");
    N.push("  14 módulos del diagrama son los suyos, con una diferencia: su parte");
    N.push("  16 son VISTAS MATERIALIZADAS, y en schema.sql hay CERO vistas, así");
    N.push("  que ese punto no tiene diagrama posible.");
    N.push("");
    N.push("LO QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  " + TOTAL_TAB + " clases, con el nombre de la tabla TAL CUAL, sin prefijo ni");
    N.push("  estereotipo.   " + TOTAL_ATR + " columnas, cada una con su tipo y sus condiciones,");
    N.push("  y " + TOTAL_REL + " asociaciones, una por cada clave foránea del esquema.");
    N.push("");
    N.push("  Y CON UN ORDEN QUE NO ES EL DEL ESQUEMA: las tablas van agrupadas en");
    N.push("  los 14 módulos, de izquierda a derecha y de arriba abajo, para que las");
    N.push("  88 líneas crucen lo menos posible.   Una tabla padre queda cerca de");
    N.push("  sus hijos: usuarios es el primero de la fila 1 y tiene 23 hijos");
    N.push("  repartidos por todo el diagrama, y producto_talla_color, que es la");
    N.push("  bisagra de todo el stock, tiene 14.");
    N.push("");
    N.push("  Y EL RECUADRO BLANCO DE ALGUNA TABLA, si lo hay, es el respaldo: si");
    N.push("  EA no muestra los atributos de esa clase, el script dibuja debajo un");
    N.push("  compartimento de texto con las mismas columnas.   Al final de las");
    N.push("  notas viene el recuento de cuántas han necesitado ese respaldo.");
    N.push("");
    N.push("  Y LAS 88 ASOCIACIONES SON LAS 88 CLAVES FORÁNEAS, UNA POR UNA.   Ni");
    N.push("  una relación más, ni una menos.   No hay ninguna relación lógica");
    N.push("  inventada para que el diagrama quede más redondo, y eso está");
    N.push("  comprobado con un verificador que cuenta las REFERENCES del");
    N.push("  esquema y las compara una a una con las 88 del script.");
    N.push("");
    N.push("  LA ETIQUETA DE CADA LÍNEA ES EL NOMBRE DE LA COLUMNA, que es la");
    N.push("  verdad del esquema.   Y donde hay ON DELETE CASCADE, la etiqueta lo");
    N.push("  dice, porque esa palabra explica por qué la línea es una composición.");
    N.push("");
    N.push("LAS CARDINALIDADES, Y DE DÓNDE SALEN");
    N.push("");
    N.push("  No se han puesto por costumbre ni por regla.   Cada multiplicidad sale de");
    N.push("  leer una cosa concreta del esquema:");
    N.push("");
    N.push("  En el extremo del HIJO, cuántas filas del padre tiene cada hijo:");
    N.push("    1       la FK es NOT NULL, o parte de la PRIMARY KEY");
    N.push("    0..1    la FK es NULLABLE, y el esquema no lo prohíbe");
    N.push("");
    N.push("  En el extremo del PADRE, cuántos hijos tiene cada padre:");
    N.push("    0..*    la FK no es UNIQUE, o sea que puede repetirse");
    N.push("    0..1    la FK es UNIQUE, o sea que como mucho un hijo");
    N.push("");
    N.push("  Y EL REPARTO, que es el dato más importante del diagrama:");
    N.push("");
    N.push("    hijo 0..*  ->  padre 0..1     82 de las 88");
    N.push("    hijo 0..*  ->  padre 1          4 de las 88");
    N.push("    hijo 0..1  ->  padre 0..1       2 de las 88");
    N.push("");
    N.push("  O SEA QUE 86 DE LAS 88 FK SON NULLABLE.   El modelo permite 82 filas");
    N.push("  huérfanas por cada una de esas columnas: un venta sin sucursal, un");
    N.push("  producto sin sucursal, un movimiento de inventario sin prenda.   Y las");
    N.push("  cuatro que son 1 son las cuatro FK que sí son NOT NULL, que son los");
    N.push("  usuarios_roles y el resto de las tablas de unión.");
    N.push("");
    N.push("  Y LAS DOS ÚNICAS QUE SON 0..1 EN EL EXTREMO DEL HIJO son las dos");
    N.push("  columnas con UNIQUE en línea que tiene el esquema, y son estas:");
    N.push("");
    N.push("    usuarios_empleados.usuario_id   L78   UNIQUE REFERENCES usuarios");
    N.push("    clientes.usuario_id             L89   UNIQUE REFERENCES usuarios");
    N.push("");
    N.push("  O sea que un usuario tiene COMO MUCHO una ficha de empleado y COMO");
    N.push("  MUCHO un registro de cliente, y el modelo lo dice con claridad.   Y esa");
    N.push("  es la razón por la que esas dos líneas llevan el 0..1 en vez del 0..*.");
    N.push("");
    N.push("EL ON DELETE, QUE ES LO QUE MARCA LA NATURALEZA DE LA LÍNEA");
    N.push("");
    N.push("  ON DELETE CASCADE   ->  Composition   22 relaciones");
    N.push("  ON DELETE SET NULL  ->  Dependency     2 relaciones");
    N.push("  sin ON DELETE       ->  Association    64 relaciones");
    N.push("");
    N.push("  O sea que las 88 tienen ON DELETE pensado.   Las 64 que no lo llevan son");
    N.push("  RESTRICT, que es lo correcto para ventas, pagos y stock: no se puede");
    N.push("  borrar una venta que tiene comprobante, ni un pago que tiene venta.");
    N.push("  Y las 2 SET NULL están donde toca: producto_imagenes L249 y");
    N.push("  bitacora_auditoria L150, que tienen que sobrevivir a su padre.");
    N.push("");
    N.push("  Y OJO CON LAS 22 COMPOSICIONES, porque es donde el modelo se pone");
    N.push("  exquisito. De las 88 relaciones, 22 borran al hijo y 66 lo conservan.");
    N.push("  Lo que se conserva al borrar la prenda son las ventas, los pagos y");
    N.push("  los comprobantes, y eso es lo correcto, porque son documentos");
    N.push("  fiscales. Lo que se borra son las líneas de venta, las líneas de");
    N.push("  reserva y los movimientos del Kardex, y eso es discutible: un Kardex");
    N.push("  que se borra al borrar la prenda deja de ser un libro mayor.");
    N.push("");
    N.push("UN ARREGLO QUE LOS 36 DIAGRAMAS DE CLASES ANTERIORES NO TENÍAN");
    N.push("");
    N.push("  reservas tiene DOS claves foráneas a usuarios: id_usuario, L347, que es");
    N.push("  el que pidió la reserva, e id_encargado, L352, que es el empleado que la");
    N.push("  preparó.   Son 2 asociaciones entre el MISMO par de tablas, que en un");
    N.push("  diagrama de clases es el caso que suele olvidarse.");
    N.push("");
    N.push("  En la función que dibuja los conectores de los 36 diagramas");
    N.push("  anteriores, el borrado del conector previo buscaba uno con el mismo");
    N.push("  SupplierID.   Con dos FK al mismo padre, la segunda relación borraba a");
    N.push("  la primera, y el diagrama salía con 87 líneas de las 88 sin decir");
    N.push("  nada.   Aquí el borrado mira también el NOMBRE, así que las dos se");
    N.push("  quedan, y se distinguen por la etiqueta, que es el nombre de la");
    N.push("  columna: id_usuario e id_encargado.");
    N.push("");
    N.push("EL HALLAZGO 1: 51 TABLAS, 88 RELACIONES, Y UN SOLO CHECK, Y ESTÁ EN LA TABLA EQUIVOCADA");
    N.push("");
    N.push("  La cuenta del modelo, entera, sin suavizar nada:");
    N.push("");
    N.push("    51 tablas          de la L23 a la L555");
    N.push("    340 columnas");
    N.push("    88 claves foráneas");
    N.push("    22 CASCADE, 2 SET NULL, 64 sin nada");
    N.push("     7 índices");
    N.push("     1 CHECK");
    N.push("     0 ALTER TABLE");
    N.push("     0 vistas");
    N.push("     0 enums");
    N.push("");
    N.push("  Y EL ÚNICO CHECK DEL ESQUEMA ENTERO ES schema.sql L294:");
    N.push("");
    N.push("    cantidad  INTEGER NOT NULL CHECK (cantidad > 0),");
    N.push("");
    N.push("  QUE ESTÁ EN orden_compra_items, L290-300.   La única invariante que la");
    N.push("  base de datos protege en todo el proyecto es que la cantidad de una");
    N.push("  LÍNEA DE COMPRA sea positiva.   Y es la cantidad menos importante que");
    N.push("  hay en el sistema.");
    N.push("");
    N.push("  LO QUE QUEDA SIN PROTEGER:");
    N.push("");
    N.push("    carrito_items.cantidad        puede ser 0 o negativa");
    N.push("    venta_items.cantidad          puede ser 0 o negativa");
    N.push("    reserva_items.cantidad        puede ser 0 o negativa");
    N.push("    inventario_stock              LAS CUATRO pueden ser negativas");
    N.push("    preferencias_cliente.puntaje  puede ser negativo o nulo");
    N.push("    movimientos_inventario        sin comprobar stock_anterior ni posterior");
    N.push("    ventas, comprobantes          total y subtotal sin comprobar");
    N.push("");
    N.push("  Y NO ES QUE NO SE PUEDA, ES QUE NO SE HIZO.   El modelo tiene capacidad");
    N.push("  de sobra, y se nota en que hay 7 índices y CERO ALTER TABLE: se puso");
    N.push("  el índice antes que el CHECK.");
    N.push("");
    N.push("EL HALLAZGO 2: ventas.estado DICE LO CONTRARIO DE LO QUE PASA");
    N.push("");
    N.push("  EL MODELO, schema.sql L395:");
    N.push("");
    N.push("    estado  VARCHAR(20) DEFAULT 'Completada',");
    N.push("");
    N.push("  O sea que según el modelo, una venta nace completada.");
    N.push("");
    N.push("  EL CÓDIGO, SRV_VentasService L238-240, que es el ÚNICO INSERT INTO");
    N.push("  ventas del proyecto:");
    N.push("");
    N.push("    INSERT INTO ventas (..., estado, fecha_venta)");
    N.push("    VALUES ($1, ..., $9, 'Pendiente', NOW())");
    N.push("");
    N.push("  El INSERT pone SIEMPRE 'Pendiente' y NUNCA usa el DEFAULT.   El DEFAULT");
    N.push("  está muerto, y no por casualidad: nadie lo ejercita.   Y peor: es lo");
    N.push("  CONTRARIO de la verdad, así que cualquier INSERT nuevo que olvide la");
    N.push("  columna crea una venta cobrada que nadie ha cobrado.");
    N.push("");
    N.push("  Y LA MÁQUINA DE ESTADOS DE ESA COLUMNA NO EXISTE.   La columna estado");
    N.push("  está repetida en 17 tablas, las 17 son VARCHAR(20) con un DEFAULT");
    N.push("  distinto, y el proyecto entero usa UN SOLO valor de estado de venta,");
    N.push("  que es 'Completada', escrito a mano en 2 sitios: Pagos L334 y L696.");
    N.push("");
    N.push("  Las otras máquinas de estado, cada una con sus valores, y ninguna en");
    N.push("  ningún sitio del modelo:");
    N.push("");
    N.push("    ventas              Pendiente, Completada");
    N.push("    carritos            Activo, En pago, Convertido a venta");
    N.push("    reservas            Solicitada, En tienda, Cumplida, Cancelada");
    N.push("    transacciones_pago  Pendiente, Aprobado, Rechazado");
    N.push("    ordenes_compra      Pedida, Recibida");
    N.push("    respaldos           En Progreso");
    N.push("");
    N.push("  Unas 12 máquinas distintas, escritas como literales sueltos.   Por eso el");
    N.push("  diagrama dibuja las columnas estado con su DEFAULT, que es lo que el");
    N.push("  modelo dice, y deja los valores en la bandeja: no están en ninguna parte.");
    N.push("");
    N.push("EL HALLAZGO 3: estado_stock, UNA COLUMNA QUE EL MODELO DECLARA Y NADIE ESCRIBE");
    N.push("");
    N.push("  No es que la columna esté mal: es que NO ES UN DATO.   Es un dato");
    N.push("  derivado, y el modelo lo trata como si fuera almacenado.");
    N.push("");
    N.push("    escrituras en los 147 .ts y .tsx      CERO");
    N.push("    escrituras en todo schema.sql          CERO");
    N.push("");
    N.push("  Así que estado_stock se queda en 'Disponible' desde el INSERT que la");
    N.push("  creó, para siempre.   Y 6 sitios la leen para DECIDIR si hay stock:");
    N.push("");
    N.push("    SRV_CarritoService    L246   si es 'sin stock', rechaza la prenda");
    N.push("    SRV_ReservasService  L1197   si NO es 'disponible', rechaza la prenda");
    N.push("    SRV_ReservasService   L330   WHERE estado_stock = 'Disponible'");
    N.push("    SRV_ReservasService   L383   WHERE estado_stock = 'Disponible'");
    N.push("    SRV_VentasService     L197   si NO es 'Disponible', rechaza la prenda");
    N.push("    SRV_VentasService     L315   WHERE estado_stock <> 'Sin stock'");
    N.push("");
    N.push("  Y ADEMÁS NO COINCIDEN ENTRE SÍ: Carrito L246 busca 'sin stock' en");
    N.push("  minúscula y Reservas L1197 busca 'disponible' en minúscula, y la columna");
    N.push("  tiene 'Disponible' y 'Sin stock' con mayúscula.   Dos de las seis");
    N.push("  comparaciones no pueden ser ciertas NI SIQUIERA escribiéndola, por las");
    N.push("  mayúsculas.   Y las otras cuatro son siempre ciertas, porque nunca cambia.");
    N.push("");
    N.push("  El documento de casos de uso, L176 punto d, pide la regla de tres");
    N.push("  estados.   Esa regla NO EXISTE en el esquema, ni en el código, ni en");
    N.push("  ningún sitio.   Por eso el diagrama dibuja la columna y NO dibuja la");
    N.push("  regla, y lo dice aquí.");
    N.push("");
    N.push("EL HALLAZGO 4: inventario_stock, CUATRO CANTIDADES Y NI UNA REGLA QUE LAS ATE");
    N.push("");
    N.push("  schema.sql L302-311.  Las cuatro son INTEGER, las cuatro con DEFAULT 0,");
    N.push("  y NINGUNA tiene CHECK.   Así que las cuatro pueden ser negativas, y el");
    N.push("  modelo lo permite.");
    N.push("");
    N.push("  Y LO QUE NO EXISTE ES LA RELACIÓN ENTRE ELLAS.   La ecuación del");
    N.push("  inventario, la que dice cuánto hay, cuánto está reservado y cuánto se ha");
    N.push("  vendido, no está escrita en ningún sitio del proyecto:");
    N.push("");
    N.push("    NO hay CHECK de que disponible + reservada + vendida sea el stock");
    N.push("    NO hay CHECK de que disponible sea mayor o igual que cero");
    N.push("    NO hay CHECK de que reservada sea mayor o igual que cero");
    N.push("    NO hay vista que calcule nada de esto");
    N.push("    NO hay función en el esquema que lo calcule");
    N.push("");
    N.push("  CUÁNTAS VECES SE ESCRIBE CADA UNA, contadas en el proyecto entero:");
    N.push("");
    N.push("    cantidad_disponible   2   el trigger de L648, y Reservas L710");
    N.push("    cantidad_reservada    4   Reservas L709, L979 y L1117, y schema.sql");
    N.push("                              L761, en una función que no llama nadie");
    N.push("    cantidad_vendida      2   Pagos L341 y L711, los dos de cobro");
    N.push("    stock_minimo_alert    0   existe en el modelo y en el panel, pero");
    N.push("                              no se lee en ninguna consulta del código");
    N.push("");
    N.push("  O SEA QUE LA COLUMNA QUE SERÍA EL LUGAR NATURAL DE LA REGLA,");
    N.push("  stock_minimo_alert, NO SE USA PARA NADA, Y LA QUE SÍ ESTÁ Y SÍ SIRVE es");
    N.push("  la UNIQUE de L310, que es la que hace posible el ON CONFLICT del trigger.");
    N.push("  CU31 lo confirmó contando los dos sitios que dependen de ella.");
    N.push("");
    N.push("EL HALLAZGO 5: DOS COLUMNAS QUE EL CÓDIGO USA Y EL MODELO NO TIENE");
    N.push("");
    N.push("    carritos.token_invitado        NO EXISTE EN schema.sql");
    N.push("    sesiones_ra.foto_resultado     NO EXISTE EN schema.sql");
    N.push("");
    N.push("  Y ENTRE LOS DOS NOMBRES HAY 44 SITIOS DE CÓDIGO.   Para");
    N.push("  token_invitado no es un SELECT casual, es el MECANISMO ENTERO del");
    N.push("  carrito de invitado, que es el CU25: la búsqueda es el L105, la");
    N.push("  fusión es el L115, y la creación es el L161.   O sea que un caso de");
    N.push("  uso completo, con su propio diagrama de secuencia, funciona sobre una");
    N.push("  columna que el modelo no declara.");
    N.push("");
    N.push("  Y para foto_resultado es peor, porque es una foto, o sea un binario de");
    N.push("  peso, y en sesiones_ra, schema.sql L480-489, no hay ninguna columna de");
    N.push("  imagen.   Y CU24 ya lo acusaba a esa misma tabla de este mismo");
    N.push("  problema, desde el lado del caso de uso.");
    N.push("");
    N.push("  ESTE DIAGRAMA DIBUJA LAS 51 TABLAS TAL COMO ESTÁN, SIN INVENTAR LAS DOS");
    N.push("  COLUMNAS QUE FALTAN.   Y por eso hay que avisar: este es el modelo que");
    N.push("  declara el ESQUEMA, que no es exactamente el que usa la APLICACIÓN.");
    N.push("  La diferencia, por lo menos, son estas dos columnas.");
    N.push("");
    N.push("EL HALLAZGO 6: 45 DE 51 TABLAS SIN ÍNDICE, Y EL QUE SE LLAMA DE CLIENTE ESTÁ EN LA COLUMNA DEL EMPLEADO");
    N.push("");
    N.push("  Los 7 índices del esquema, y solo 6 tablas los tienen:");
    N.push("");
    N.push("    L560  idx_bitacora_fecha         bitacora_auditoria (fecha_hora DESC)");
    N.push("    L561  idx_bitacora_tabla         bitacora_auditoria (tabla_afectada)");
    N.push("    L562  idx_mov_inv_ptc_suc        movimientos_inventario (id_ptc, id_sucursal, fecha)");
    N.push("    L563  idx_inventario_sucursal   inventario_stock (id_sucursal)");
    N.push("    L564  idx_ventas_sucursal_fecha  ventas (id_sucursal, fecha_venta)");
    N.push("    L565  idx_reservas_cliente       reservas (id_usuario)");
    N.push("    L566  idx_ordenes_proveedor      ordenes_compra (id_proveedor, estado)");
    N.push("");
    N.push("  45 DE LAS 51 TABLAS NO TIENEN NINGÚN ÍNDICE, y ninguno de los 7 es");
    N.push("  UNIQUE, así que no hay ninguna restricción de unicidad que no sea una");
    N.push("  columna suelta o las dos UNIQUE de producto_talla_color e");
    N.push("  inventario_stock.");
    N.push("");
    N.push("  Y EL ÍNDICE QUE MIENTE, que es el hallazgo de este apartado:");
    N.push("");
    N.push("    L565  CREATE INDEX idx_reservas_cliente ON reservas (id_usuario);");
    N.push("");
    N.push("  Se llama de cliente y está en id_usuario, que es el EMPLEADO.   Y la");
    N.push("  columna que se llama de cliente, id_cliente, L346, no tiene índice, y el");
    N.push("  código la filtra en 3 sitios: Reservas L424, L461 y L929.   O sea que la");
    N.push("  consulta de las reservas de un cliente, que es la pantalla principal del");
    N.push("  módulo, hace un Seq Scan de la tabla entera.");
    N.push("");
    N.push("  Y producto_talla_color, que es padre de 14 hijos y la bisagra de todas");
    N.push("  las consultas de stock, no tiene índice propio.   Lo que lo único");
    N.push(" Ui covers es el índice de movimientos_inventario.");
    N.push("");
    N.push("  Un índice no es una clase ni una relación, así que esto no se ve en las");
    N.push("  cajas del diagrama.   Por eso está aquí y no dibujado.");
    N.push("");
    N.push("EL HALLAZGO 7: preferencias_cliente ADMITE UNA FILA QUE NO DICE NADA");
    N.push("");
    N.push("  schema.sql L501-509, y son 7 líneas con 5 referencias y un número:");
    N.push("");
    N.push("    id_preferencia SERIAL PRIMARY KEY,");
    N.push("    id_cliente     INTEGER REFERENCES clientes(id_cliente),");
    N.push("    id_categoria   INTEGER REFERENCES categorias(id_categoria),");
    N.push("    id_talla       INTEGER REFERENCES tallas(id_talla),");
    N.push("    id_color       INTEGER REFERENCES colores(id_color),");
    N.push("    id_temporada   INTEGER REFERENCES temporadas(id_temporada),");
    N.push("    puntaje        INTEGER");
    N.push("");
    N.push("  Y LO QUE NO TIENE, y es la lista completa: ninguna columna NOT NULL,");
    N.push("  ni siquiera id_cliente.  Ninguna UNIQUE.  Ningún índice.  Ningún CHECK");
    N.push("  de que el puntaje sea positivo.");
    N.push("");
    N.push("  CONSECUENCIA DIRECTA: una fila puede tener las CINCO referencias a NULL");
    N.push("  y un puntaje NULL, y el modelo la acepta.   Una preferencia que no dice");
    N.push("  qué prefiere nadie.   Y no es hipotético, porque el servicio inserta así,");
    N.push("  SRV_PreferenciasService L57, con la palabra dimension sustituida en");
    N.push("  runtime, o sea que la consulta cambia de forma según de dónde venga la");
    N.push("  llamada.   CU32 ya vio el hueco de eso.");
    N.push("");
    N.push("  Y SIN UNIQUE, el mismo par cliente y categoría puede repetirse, y el");
    N.push("  'upsert' del comentario del propio servicio, L12, no es un upsert:");
    N.push("");
    N.push("    L41   SELECT ... FROM preferencias_cliente      para buscar la fila");
    N.push("    L50   UPDATE preferencias_cliente SET puntaje = puntaje + $2");
    N.push("    L57   INSERT INTO preferencias_cliente");
    N.push("");
    N.push("  Eso es un SELECT y luego UPDATE o INSERT según lo que encuentre, y entre");
    N.push("  medias puede entrar otro.   Un UPSERT de verdad es un INSERT ... ON");
    N.push("  CONFLICT, que es justo lo que el trigger de inventario_stock SÍ usa, y con");
    N.push("  el que funciona, porque tiene la UNIQUE de L310 detrás.   Aquí no hay");
    N.push("  UNIQUE detrás, así que no se puede.   Y esa diferencia de criterio, en el");
    N.push("  mismo equipo y en el mismo proyecto, es el hallazgo.");
    N.push("");
    N.push("EL HALLAZGO 8: LO QUE EL MODELO SÍ HACE BIEN, Y SON CINCO COSAS");
    N.push("");
    N.push("  Un diagrama de 51 clases y 88 líneas es sobre todo un aviso.   Este es el");
    N.push("  otro lado, y también se cuenta.");
    N.push("");
    N.push("  1. LAS 22 ON DELETE CASCADE SON COHERENCIA GRATIS.   22 de las 88 relaciones");
    N.push("     borran al hijo cuando muere el padre, y eso es integridad referencial");
    N.push("     de verdad, sin una línea de código.   Y las 2 SET NULL están donde");
    N.push("     toca: una foto sin producto y un registro sin autor tienen que");
    N.push("     sobrevivir.   Las 88 tienen ON DELETE pensado, no heredado por descuido.");
    N.push("");
    N.push("  2. Y LA UNIQUE DE producto_talla_color ES LA FORMA CORRECTA DE MODELAR ESA");
    N.push("     RELACIÓN.   UNIQUE (id_producto, id_talla, id_color), L243, sobre una");
    N.push("     entidad asociativa.   Es la solución de manual para producto por talla");
    N.push("     por color, y además funciona: es la que hace que la búsqueda del stock");
    N.push("     de una prenda sea una búsqueda y no un recorrido.");
    N.push("");
    N.push("  3. Y LA DE inventario_stock TAMBIÉN, Y CON MÁS RAZÓN, porque es la que hace");
    N.push("     posible el ON CONFLICT del trigger, CU31 L645-648.   Sin ese UNIQUE, el");
    N.push("     INSERT del caso de actualizar el inventario no existiría en una sola");
    N.push("     sentencia.");
    N.push("");
    N.push("  4. Y LAS 8 TABLAS RAÍZ NO TIENEN NINGUNA FK.   roles, usuarios, ciudades,");
    N.push("     tallas, colores, categorias, temporadas y proveedores.   Son los");
    N.push("     catálogos y las raíces del grafo, y no deben depender de nadie.   El");
    N.push("     grafo de las 88 relaciones arranca limpio desde 8 vértices y no tiene");
    N.push("     ni un ciclo de creación, que es la trampa clásica de un modelo de datos.");
    N.push("");
    N.push("  5. Y TODAS LAS CLAVES PRIMARIAS SON SERIAL.   Las 51, sin una sola");
    N.push("     excepción y sin ni una clave natural.   Eso evita la discusión de si el");
    N.push("     correo es la clave del usuario, que es la pelea más tonta que hay en");
    N.push("     una tienda.   Y la tabla puente usuarios_roles, L45-49, lo hace mejor:");
    N.push("     PRIMARY KEY (id_usuario, id_rol) y nada más.   Es una tabla de unión, y");
    N.push("     su clave ES la unión, sin columna inventada.");
    N.push("");
    N.push("SOBRE LA COLOCACIÓN DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Rejilla: " + COLS + " columnas por " + Math.ceil(TOTAL_TAB / COLS) + " filas para las " + TOTAL_TAB + " tablas, con las");
    N.push("  cabeceras separadas " + PASO_X + " px y " + ANCHO_CLA + " de ancho, y " + PASO_Y + " px de alto por fila.   La última");
    N.push("  tabla, respaldos, cae en la última fila y en la última columna.");
    N.push("");
    N.push("  Las tablas van en orden de módulo, no en orden de línea del esquema, para");
    N.push("  que las 88 líneas crucen lo menos posible.   El orden de módulo es el de");
    N.push("  DISEÑO BD COMPLETA.md L15-29, con una diferencia: su parte 16 son vistas");
    N.push("  materializadas y aquí no hay ninguna.");
    N.push("");
    N.push("  Un detalle que hizo fallar los diagramas de secuencia dieciséis veces: EA");
    N.push("  guarda Top y Bottom en NEGATIVO. Si se le pasa la Y en positivo no da error,");
    N.push("  simplemente no coloca nada.   En la función colocarHallazgos de este script");
    N.push("  está escrito o.Top = 0 - y y o.Bottom = 0 - y - alto.   En el AddNew, en");
    N.push("  cambio, la Y va en positiva, y por eso la rejilla de clases usa la forma");
    N.push("  larga con Left, Top, Right y Bottom en positivo, como los 36 anteriores.");
    N.push("");
    N.push("  Comprobación de esta ejecución, leída del modelo de objetos:");
    N.push("    objetos en el diagrama: " + h.leidos);
    N.push("    con la Y crecida, o sea colocados: " + h.bien);
    N.push("    clases con atributos REALES: " + clasesReales + " de " + TOTAL_TAB);
    N.push("    clases con compartimento de texto de respaldo: " + (TOTAL_TAB - clasesReales));
    N.push("    atributos leidos del modelo: " + totalAtr + " de " + TOTAL_ATR);
    N.push("    asociaciones dibujadas: " + puestas + " de " + TOTAL_REL);
    N.push("    hallazgos colocados: " + h.total + " de " + HAL.length + ", banda hasta la y " + h.fin);
    N.push("");
    N.push("  Y LOS RECUADROS BLANCOS, que son el punto flaco de esto.   En un diagrama de");
    N.push("  clases, EA tiene un ajuste que decide si los atributos se muestran o no, y");
    N.push("  ese ajuste es del USUARIO, no del script.   Si está en modo texto plano, las");
    N.push("  cajas salen vacías.   Por eso el script trae un respaldo: si al releer la");
    N.push("  clase no encuentra los atributos, dibuja debajo un compartimento de texto");
    N.push("  con las mismas columnas.   Así que si al ejecutar ves clases vacías, no es");
    N.push("  que el script falle: es que se ha activado el respaldo.   Y en ese caso hay");
    N.push("  que activar la visibilidad de atributos en el diagrama, y volver a ejecutar.");
    N.push("");
    N.push("  LO MÁS ÚTIL PARA QUIEN TENGA QUE ARREGLAR ESTE MODELO, y son 4 sitios,");
    N.push("  todos en el esquema y ninguno en un fichero .ts:");
    N.push("");
    N.push("    1  L395, el DEFAULT de ventas.estado, que dice 'Completada' y debería");
    N.push("       decir 'Pendiente'.   Una palabra, y arregla el births de venta.");
    N.push("");
    N.push("    2  L294, donde está el único CHECK del esquema.   Si se añade uno a");
    N.push("       inventario_stock, por ejemplo de que cantidad_disponible sea mayor");
    N.push("       o igual que cero, se arreglan de golpe CU29 y CU31.");
    N.push("");
    N.push("    3  L242, estado_stock.   O se borra la columna y se sustituye por una")
    N.push("       vista, o se escribe en el trigger.   De las dos, la segunda.");
    N.push("");
    N.push("    4  Y las dos columnas que faltan, carritos.token_invitado y");
    N.push("       sesiones_ra.foto_resultado, que el modelo no tiene y el código usa en")
    N.push("       44 sitios.   Alguien tiene que decidir si el esquema está viejo o si")
    N.push("       la aplicación escribe en columnas que no existen.");
    try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
}

// ---------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------

function main() {
    var raiz = buscarPaquete(RAIZ, RAIZ_NOMBRE);
    if (raiz == null) raiz = RAIZ;
    var paq = subPaquete(raiz, PAQ_NOMBRE);
    // SI NO SE PUDO CREAR, ANTES SE SALIA EN SILENCIO, y el usuario se
    // quedaba sin diagrama y sin mensaje.   Ahora avisa, y avisa de DONDE
    // tiene que estar, que es lo unico que hace falta para abrirlo.
    if (paq == null) {
        var d1 = "No se pudo crear el paquete " + PAQ_NOMBRE + ".";
        d1 = d1 + SALTO + SALTO + "Donde tiene que estar, en el Navigator:" + SALTO;
        d1 = d1 + "  raiz del modelo > " + RAIZ_NOMBRE + " > " + PAQ_NOMBRE + SALTO;
        d1 = d1 + "  y dentro, el diagrama: " + DIAG_NOMBRE + SALTO + SALTO;
        d1 = d1 + "OJO: si el paquete " + RAIZ_NOMBRE + " no existe todavia, entonces el";
        d1 = d1 + SALTO + "paquete se creo en la RAIZ del modelo, y hay que buscarlo ahi.";
        try { Repository.ShowMessage(d1, "Diseno de Datos", 0); } catch (e) { }
        return;
    }

    for (var d = paq.Diagrams.Count - 1; d >= 0; d--) {
        try { paq.Diagrams.GetAt(d).Delete(); } catch (e) { }
    }
    try { paq.Diagrams.Refresh(); } catch (e) { }

    // ---- 1. las 51 clases
    var clases = [];
    for (var n = 0; n < DEF.length; n++) {
        var def = DEF[n];
        var c = buscarLocal(paq, def[0]);
        if (c == null) {
            try { c = paq.Elements.AddNew(def[0], "Class"); } catch (e) { c = null; }
            if (c == null) { try { c = paq.Elements.AddNew(def[0], "Class"); } catch (e2) { c = null; } }
        }
        if (c == null) { ERRORES.push("no se pudo crear la clase " + def[0]); continue; }
        try { c.Name = def[0]; } catch (e) { }
        // SIN ESTEREOTIPO, porque el nombre ya es el de la tabla y las
        // entidades no llevan prefijo en este diagrama.  El rol va en la nota.
        try { c.Stereotype = ""; } catch (e) { }
        try { c.Abstract = "0"; } catch (e) { }
        nota(c, def[2]);
        try { c.Update(); } catch (e) { }
        clases[n] = c;
    }
    try { paq.Elements.Refresh(); } catch (e) { }

    // ---- 2. los atributos
    var usaTexto = [];
    var conReal = [];
    var totalAtr = 0;
    for (var n2 = 0; n2 < DEF.length; n2++) {
        var d2 = DEF[n2];
        try { paq.Elements.Refresh(); } catch (e) { }
        var el = buscarLocal(paq, d2[0]);
        if (el == null) { ERRORES.push("clase " + d2[0] + " no encontrada"); continue; }
        var antes = "";
        try { antes = nombresDe(el.Attributes); } catch (e) { antes = ""; }
        var puestos = 0;
        for (var k = 0; k < d2[3].length; k++) {
            if (contiene(antes, d2[3][k][0])) { puestos++; continue; }
            if (agregarAtributo(el, d2[3][k][0], d2[3][k][1], d2[3][k][2])) puestos++;
        }
        try { el.Update(); } catch (e) { }
        var fin = "";
        try { fin = nombresDe(el.Attributes); } catch (e) { fin = ""; }
        totalAtr = totalAtr + totalDe(fin);
        var bien = totalDe(fin) >= d2[3].length;
        usaTexto[n2] = !bien;
        if (bien) conReal.push(d2[0]);
        var marca = "  TEXTO";
        if (bien) marca = "  REAL";
        INFORME.push(pad(d2[0], 24) + " atr " + totalDe(fin) + "/" + d2[3].length + marca);
    }

    // ---- 3. el diagrama
    var diag = null;
    try { diag = paq.Diagrams.AddNew(DIAG_NOMBRE, DIAG_TIPO); } catch (e) { diag = null; }
    if (diag == null) { ERRORES.push("no se pudo crear el diagrama"); return; }
    diag.Update();
    try { paq.Diagrams.Refresh(); } catch (e) { }

    // ---- 4. la rejilla: 7 columnas por 8 filas para las 51 tablas
    var COLX = [];
    for (var cx = 0; cx < COLS; cx++) COLX[cx] = 30 + cx * PASO_X;
    var filas = Math.ceil(DEF.length / COLS);
    INFORME.push("rejilla: " + COLS + " columnas por " + filas + " filas para " + DEF.length + " tablas");
    if (filas * COLS < DEF.length) ERRORES.push("la rejilla no cabe");

    for (var k2 = 0; k2 < DEF.length; k2++) {
        var col = k2 % COLS;
        var fila = Math.floor(k2 / COLS);
        var x = COLX[col];
        var y = Y0 + fila * PASO_Y;
        if (usaTexto[k2]) {
            colocar(diag, clases[k2], x, y, ANCHO_CLA, 24);
            var txtAtr = [];
            for (var q2 = 0; q2 < DEF[k2][3].length; q2++) {
                txtAtr.push(pad("-" + DEF[k2][3][q2][0] + " : " + DEF[k2][3][q2][1], 34));
            }
            compartimento(diag, paq, "TXT " + DEF[k2][0], txtAtr, x, y + 24, ANCHO_CLA);
        } else {
            colocar(diag, clases[k2], x, y, ANCHO_CLA, DEF[k2][3].length * ALTO + 34);
        }
    }
    try { diag.DiagramObjects.Refresh(); } catch (e) { }
    try { diag.Update(); } catch (e) { }
    try { diag = guardarYRecargar(diag, paq); } catch (e) { }

    // ---- 5. las 88 asociaciones
    var C = {};
    for (var q = 0; q < DEF.length; q++) C[DEF[q][0]] = clases[q];
    var puestas = 0;
    var noPuestas = 0;
    for (var r = 0; r < REL.length; r++) {
        var a2 = C[REL[r][0]];
        var b2 = C[REL[r][1]];
        if (a2 == null || b2 == null) {
            ERRORES.push("relacion " + r + " con tabla que no existe: " + REL[r][0] + " -> " + REL[r][1]);
            noPuestas++;
            continue;
        }
        var n2b = relacion(diag, a2, b2, REL[r][2], REL[r][3], REL[r][4], REL[r][0], REL[r][1], REL[r][5], REL[r][6]);
        if (n2b == 1) { puestas++; }
        else { noPuestas++; ERRORES.push("no se pudo dibujar " + REL[r][0] + "." + REL[r][2] + " -> " + REL[r][1]); }
    }
    INFORME.push("asociaciones dibujadas: " + puestas + " de " + REL.length + ", y " + noPuestas + " sin dibujar");
    try { diag.DiagramLinks.Refresh(); } catch (e) { }
    try { diag.Update(); } catch (e) { }
    try { diag = guardarYRecargar(diag, paq); } catch (e) { }

    // ---- 6. la bandeja de hallazgos
    var h = colocarHallazgos(diag, paq);
    try { diag = guardarYRecargar(diag, paq); } catch (e) { }

    // ---- 7. las notas
    notasDelDiagrama(diag, puestas, h, conReal.length, totalAtr);

    // ---- 8. el informe del paquete
    var T = [];
    T.push("MODELO DE DATOS - DIAGRAMA DE CLASES - INFORME");
    T.push("");
    T.push("Tablas (clases):    " + DEF.length + " de " + TOTAL_TAB);
    T.push("Columnas:           " + totalAtr + " de " + TOTAL_ATR);
    T.push("Asociaciones:        " + puestas + " de " + TOTAL_REL);
    T.push("Clases con atributos reales: " + conReal.length + " de " + DEF.length);
    T.push("Módulos:            " + TOTAL_MOD);
    T.push("Rejilla:            " + COLS + " columnas por " + filas + " filas");
    T.push("Tipo de diagrama:   " + DIAG_TIPO);
    T.push("");
    T.push("CÓMO ESTÁ HECHO, Y POR QUÉ NO PUEDE HABER ERROR DE CUENTAS");
    T.push("");
    T.push("  Los datos NO están escritos a mano: los genera un lector de");
    T.push("  BASE DE DATOS/schema.sql.  Las 51 tablas, las 340 columnas, las");
    T.push("  88 FK y las cardinalidades salen del esquema.  Si el esquema");
    T.push("  cambia, hay que volver a generarlos.");
    T.push("");
    T.push("  LAS 88 ASOCIACIONES SON LAS 88 CLAVES FORÁNEAS, UNA POR UNA.  Ni");
    T.push("  una más, ni una menos.  No hay ninguna relación lógica inventada");
    T.push("  para que el diagrama quede más redondo, y eso se comprueba con");
    T.push("  el verificador, que cuenta las REFERENCES del esquema y las");
    T.push("  compara una a una con las del script.");
    T.push("");
    T.push("LAS CARDINALIDADES NO SON UN ADORNO, Y SALEN DE TRES COSAS");
    T.push("");
    T.push("  En el extremo del HIJO, cuantas filas del padre tiene cada hijo:");
    T.push("    1       la FK es NOT NULL, o parte de la PRIMARY KEY");
    T.push("    0..1    la FK es NULLABLE, y el esquema no lo prohíbe");
    T.push("");
    T.push("  En el extremo del PADRE, cuantos hijos tiene cada padre:");
    T.push("    0..*    la FK no es UNIQUE, o sea que puede repetirse");
    T.push("    0..1    la FK es UNIQUE, o sea que como mucho un hijo");
    T.push("");
    T.push("  El reparto sale así, y hay que decirlo porque es el dato más");
    T.push("  importante del diagrama:");
    T.push("");
    T.push("    hijo 0..*  ->  padre 0..1     82 de las 88");
    T.push("    hijo 0..*  ->  padre 1          4 de las 88");
    T.push("    hijo 0..1  ->  padre 0..1       2 de las 88");
    T.push("");
    T.push("  O SEA QUE 86 DE LAS 88 FK SON NULLABLE.  El modelo permite");
    T.push("  82 filas huérfanas por cada una de esas columnas.  Y las dos");
    T.push("  únicas que son 0..1 en el extremo del hijo son las dos");
    T.push("  columnas con UNIQUE en línea que tiene el esquema:");
    T.push("  usuarios_empleados.usuario_id, L78, y clientes.usuario_id, L89.");
    T.push("  O sea que un usuario tiene COMO MUCHO una ficha de empleado y");
    T.push("  COMO MUCHO un registro de cliente, y el modelo lo dice.");
    T.push("");
    T.push("EL ON DELETE MARCA LA NATURALEZA DE LA ASOCIACIÓN, Y NO ES MÍO");
    T.push("");
    T.push("  ON DELETE CASCADE   ->  Composition   22 relaciones");
    T.push("  ON DELETE SET NULL  ->  Dependency     2 relaciones");
    T.push("  sin ON DELETE       ->  Association    64 relaciones");
    T.push("");
    T.push("  Las 88 tienen ON DELETE pensado.  Las 64 que no lo llevan son");
    T.push("  RESTRICT, que es lo correcto para ventas, pagos y stock: no se");
    T.push("  puede borrar una venta que tiene comprobante.");
    T.push("");
    T.push("UN ARREGLO QUE ESTOS DIAGRAMAS DE CLASES NO TENIAN");
    T.push("");
    T.push("  reservas tiene DOS FK a usuarios: id_usuario, L347, que es el");
    T.push("  que pidió la reserva, e id_encargado, L352, que es el empleado");
    T.push("  que la preparó.   Son 2 asociaciones entre el mismo par de");
    T.push("  tablas, y la función que dibuja los conectores, en los 36");
    T.push("  diagramas anteriores, borraba el conector anterior si encontraba");
    T.push("  uno con el mismo SupplierID.   O sea que la segunda borraba a la");
    T.push("  primera y el diagrama salía con 87 líneas de las 88.   Aquí el");
    T.push("  borrado mira también el NOMBRE, así que las dos se quedan, y las");
    T.push("  dos se distinguen por la etiqueta, que es el nombre de la");
    T.push("  columna: id_usuario e id_encargado.");
    T.push("");
    T.push("HALLAZGOS");
    T.push("  1  51 tablas, 88 relaciones, 7 índices, 0 ALTER TABLE, 0 vistas,");
    T.push("     0 enums y UN SOLO CHECK, que está en orden_compra_items L294,");
    T.push("     protegiendo la cantidad de una línea de compra.  Las cuatro");
    T.push("     cantidades de inventario_stock, las de carrito_items,");
    T.push("     venta_items y reserva_items, y el puntaje de las");
    T.push("     preferencias: sin protección.  Y 0 ALTER TABLE, o sea que no");
    T.push("     se puso el CHECK.");
    T.push("  2  ventas.estado DEFAULT 'Completada', L395, y el único INSERT,");
    T.push("     Ventas L238-240, pone siempre 'Pendiente'.  El DEFAULT está");
    T.push("     muerto y dice lo contrario de la verdad.  Y no hay enum, ni");
    T.push("     CHECK, ni tabla de estados, para 17 columnas estado y unas 12");
    T.push("     máquinas distintas escritas a mano.");
    T.push("  3  estado_stock: 0 escrituras en 147 ficheros y en todo el");
    T.push("     esquema, DEFAULT 'Disponible', y 6 lecturas que deciden si hay");
    T.push("     stock.  Dos de esas 6 buscan 'sin stock' y 'disponible' en");
    T.push("     minúscula y la columna tiene mayúscula, así que no pueden ser");
    T.push("     ciertas ni escribiéndola.  El diagrama la dibuja, y la nota");
    T.push("     avisa de que no la escribe nadie.");
    T.push("  4  inventario_stock: 4 cantidades, DEFAULT 0, ni un CHECK, y");
    T.push("     ninguna relación entre ellas escrita en ningún sitio.  La");
    T.push("     ecuación del inventario no existe como invariante.  Y");
    T.push("     stock_minimo_alert, que sería el sitio natural de la regla,");
    T.push("     no se lee en ninguna consulta.");
    T.push("  5  Dos columnas que el código usa y el modelo NO tiene:");
    T.push("     carritos.token_invitado y sesiones_ra.foto_resultado.  44");
    T.push("     sitios de código las nombran.  El carrito de invitado, CU25,");
    T.push("     funciona sobre una columna fantasma.  Este diagrama dibuja el");
    T.push("     modelo del ESQUEMA, que no es exactamente el de la aplicación.");
    T.push("  6  45 de 51 tablas sin índice, y el que se llama");
    T.push("     idx_reservas_cliente está en id_usuario, que es el empleado,");
    T.push("     mientras que id_cliente, que es la que filtra el código en 3");
    T.push("     sitios, no tiene ninguno.  El nombre del índice miente.");
    T.push("  7  preferencias_cliente: 5 FK nullable, puntaje nullable, sin");
    T.push("     UNIQUE, sin índice y sin CHECK.  Una fila puede no decir qué");
    T.push("     prefiere nadie.  Y el 'upsert' de su servicio, L12, es un");
    T.push("     SELECT seguido de UPDATE o INSERT, no un ON CONFLICT.  No");
    T.push("     puede serlo: no hay UNIQUE detrás.  Y el mismo equipo SÍ usó");
    T.push("     ON CONFLICT en el trigger, donde sí hay UNIQUE.");
    T.push("  8  Y cinco cosas buenas. Las 22 CASCADE dan integridad referencial");
    T.push("     gratis.  La UNIQUE de producto_talla_color es la modelización");
    T.push("     correcta de producto por talla por color.  La de");
    T.push("     inventario_stock es la que hace posible el ON CONFLICT del");
    T.push("     trigger.  Las 8 tablas raíz no tienen FK.  Y las 51 PK son");
    T.push("     SERIAL, sin una sola clave natural.");
    T.push("");
    T.push("COLOCACIÓN");
    T.push("Objetos en el diagrama: " + h.leidos);
    T.push("Con la Y crecida, o sea colocados: " + h.bien);
    T.push("Banda de hallazgos en la x " + X_NOTA + ", a la derecha de todo.");
    T.push("La última tabla cae en la columna " + COLS + " y en la fila " + filas + ".");
    T.push("");
    if (ERRORES.length == 0) T.push("Sin errores.");
    if (ERRORES.length > 0) {
        T.push("ERRORES: " + ERRORES.length);
        for (var e2 = 0; e2 < ERRORES.length; e2++) T.push("  - " + ERRORES[e2]);
    }
    try { paq.Notes = T.join(SALTO); paq.Update(); } catch (e) { }
    try { paq.Elements.Refresh(); } catch (e) { }
    try { paq.Diagrams.Refresh(); } catch (e) { }

    var msg = "";
    msg = msg + "MODELO DE DATOS - Diagrama de clases" + SALTO;
    msg = msg + "51 tablas, 340 columnas, 88 asociaciones, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "ABRIRLO:  en el Navigator,  raiz del modelo > " + RAIZ_NOMBRE + " > " + PAQ_NOMBRE + SALTO;
    msg = msg + "           y dentro,  " + DIAG_NOMBRE + SALTO;
    msg = msg + "           OJO:  si el paquete " + RAIZ_NOMBRE + " no existia, este paquete" + SALTO;
    msg = msg + "           se ha creado en la RAIZ del modelo, y hay que buscarlo ahi." + SALTO + SALTO;
    msg = msg + "Un solo diagrama, como pediste, con las tablas tal cual y" + SALTO;
    msg = msg + "sin prefijo, con sus atributos y sus cardinalidades." + SALTO + SALTO;
    msg = msg + "LOS DATOS NO ESTÁN ESCRITOS A MANO: los genera un lector de" + SALTO;
    msg = msg + "schema.sql, así que las 88 relaciones son las 88 claves" + SALTO;
    msg = msg + "foráneas reales, una por una.  Ni una más ni una menos." + SALTO + SALTO;
    msg = msg + "CARDINALIDADES: 86 de las 88 FK son NULLABLE.  Las 2" + SALTO;
    msg = msg + "únicas que son 0..1 en el extremo del hijo son las dos con" + SALTO;
    msg = msg + "UNIQUE en línea: usuarios_empleados.usuario_id y" + SALTO;
    msg = msg + "clientes.usuario_id." + SALTO;
    msg = msg + "ON DELETE: 22 Composition, 2 Dependency, 64 Association." + SALTO + SALTO;
    msg = msg + "HALLAZGO MÁS GRAVE: 51 tablas, 88 relaciones, y UN solo" + SALTO;
    msg = msg + "CHECK, que está en orden_compra_items L294 protegiendo la" + SALTO;
    msg = msg + "cantidad de una línea de compra.  Las 4 cantidades de" + SALTO;
    msg = msg + "inventario_stock, las de carrito_items, venta_items y" + SALTO;
    msg = msg + "reserva_items, y el puntaje de las preferencias: sin" + SALTO;
    msg = msg + "proteger.  Y 0 ALTER TABLE en todo el esquema." + SALTO + SALTO;
    msg = msg + "Y ventas.estado dice DEFAULT 'Completada' cuando el único" + SALTO;
    msg = msg + "INSERT del proyecto pone siempre 'Pendiente'." + SALTO + SALTO;
    msg = msg + "Y dos columnas que el código usa y el modelo no tiene:" + SALTO;
    msg = msg + "carritos.token_invitado y sesiones_ra.foto_resultado." + SALTO;
    msg = msg + "44 sitios de código las nombran." + SALTO + SALTO;
    msg = msg + "Tablas: " + DEF.length + " de " + TOTAL_TAB + SALTO;
    msg = msg + "Columnas: " + totalAtr + " de " + TOTAL_ATR + SALTO;
    msg = msg + "Asociaciones: " + puestas + " de " + TOTAL_REL + SALTO;
    msg = msg + "Clases con atributos reales: " + conReal.length + " de " + DEF.length + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "Diseno de Datos", 0); } catch (e) { }
}

// ---------------------------------------------------------------
// LAS DOS UTILIDADES DE COLOCACION, y el fallo que hace que EA
// no coloque nada si se le pasa la Y en positivo
// ---------------------------------------------------------------

function guardarYRecargar(diag, paq) {
    try { diag.DiagramObjects.Refresh(); } catch (e) { }
    try { diag.Update(); } catch (e) { }
    try { paq.Diagrams.Refresh(); } catch (e) { }
    try {
        var i = paq.Diagrams.Count - 1;
        while (i >= 0) {
            if (String(paq.Diagrams.GetAt(i).Name) == DIAG_NOMBRE) return paq.Diagrams.GetAt(i);
            i--;
        }
    } catch (e) { }
    return diag;
}

function borrarTodo(diag) {
    try { diag.DiagramObjects.Clear(); } catch (e) { }
    try { diag.Update(); } catch (e) { }
}

function colocarHallazgos(diag, paq) {
    var creados = 0;
    var y = Y_NOTA0;
    var fin = Y_NOTA0;
    for (var i = 0; i < HAL.length; i++) {
        var lineas = HAL[i][1];
        var alto = lineas.length * ALTO_LINEA_NOTA + 26;
        if (alto < ALTO_MIN_NOTA) alto = ALTO_MIN_NOTA;
        var nom = "HALLAZGO " + HAL[i][0];
        var txt = "";
        for (var k = 0; k < lineas.length; k++) {
            if (k > 0) txt = txt + SALTO;
            txt = txt + lineas[k];
        }
        var tam = "l=" + X_NOTA + ";r=" + (X_NOTA + ANCHO_NOTA) + ";t=" + y + ";b=" + (y + alto) + ";";
        var o = null;
        try { o = diag.DiagramObjects.AddNew(tam, "Note"); } catch (e) { o = null; }
        if (o == null) {
            try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e2) { o = null; }
        }
        if (o == null) { ERRORES.push("no se pudo crear la nota " + nom); continue; }
        try { o.Text = txt; } catch (e) { }
        try { o.Notes = txt; } catch (e) { }
        try { o.ManuallySized = true; } catch (e) { }
        try { o.Left = X_NOTA; } catch (e) { }
        try { o.Right = X_NOTA + ANCHO_NOTA; } catch (e) { }
        try { o.Top = 0 - y; } catch (e) { }
        try { o.Bottom = 0 - (y + alto); } catch (e) { }
        try { o.FontSize = 8; } catch (e) { }
        try { o.WrapText = true; } catch (e) { }
        try { o.BorderStyle = 1; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        try { o.Update(); } catch (e) { }
        try { o.Text = txt; o.Update(); } catch (e) { }
        creados++;
        fin = y + alto;
        y = fin + SEPARACION_NOTA;
    }
    try { diag.Update(); } catch (e) { }
    // ---- la comprobacion de colocacion, leida del modelo de objetos
    var leidos = 0;
    var bien = 0;
    for (var q = 0; q < diag.DiagramObjects.Count; q++) {
        var ob = null;
        try { ob = diag.DiagramObjects.GetAt(q); } catch (e) { ob = null; }
        if (ob == null) continue;
        leidos++;
        var l = 0; var rr = 0; var t = 0; var b = 0;
        try { l = ob.Left; rr = ob.Right; t = ob.Top; b = ob.Bottom; } catch (e) { }
        var alto2 = b - t;
        var ancho2 = rr - l;
        if (ancho2 > 5 && alto2 < -5) bien++;
    }
    return { total: creados, fin: fin, leidos: leidos, bien: bien };
}

try {
    main();
} catch (e) {
    try {
        var r2 = buscarPaquete(RAIZ, RAIZ_NOMBRE);
        var p2 = null;
        if (r2 != null) p2 = buscarPaquete(r2, PAQ_NOMBRE);
        if (p2 == null && r2 != null) p2 = r2;
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO) + SALTO + SALTO + ERRORES.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "Diseno de Datos", 0); } catch (e3) { }
}
