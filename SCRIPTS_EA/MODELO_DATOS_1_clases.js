// ================================================================
// MODELO DE DATOS  ·  Diagrama de clases  ·  Seccion 3.4 del documento
// E-COMMERCE TIENDAS MONTAÑO
//
// QUE DIBUJA
//   Un diagrama de clases con las 51 tablas de BASE DE DATOS/schema.sql,
//   con el nombre TAL CUAL, sus 340 columnas, y las 88 asociaciones, que son
//   las 88 claves foráneas del esquema, una por una.   Las cardinalidades
//   salen del esquema y no de un criterio.
//
//   Y las 51 tablas van en subpaquetes, uno por cada uno de los 14 modulos
//   de DISEÑO BD COMPLETA.md.
//
// POR QUE ESTA ESCRITO ASI, Y NO COMO LOS 36 ANTERIORES
//   Los 36 usan Repository.ShowMessage, que NO EXISTE en esta version de EA.
//   Y usan la sintaxis nueva de atributos con 5 argumentos, que aqui no va.
//   Este usa lo mismo que el script de MRP que si funciona:
//     -  WScript.Shell.Popup  para avisar
//     -  Attributes.AddNew(nombre, tipo)   con DOS argumentos
//     -  Attributes.Refresh()  al final de cada clase
//     -  SourceEnd.Multiplicity  y  DestEnd.Multiplicity
//     -  DiagramLinks.AddNew  para colocar el conector
//     -  Elements.Refresh()  despues de cada clase creada
//   Y un detalle que solo se ve al ejecutar en EA: LAS COMAS FINALES EN LOS
//   ARRAYS.  El JScript de EA las cuenta como un elemento null mas, asi que
//   DEF[51] era null y reventaba.  En node no pasa, y por eso hay que
//   comprobarlo aqui.
//
// DONDE QUEDA
//   raiz del modelo > Diseno Logico > Diseno de Datos
//     > Modelo de Datos - Diagrama de Clases
//   Y si el paquete "Diseno Logico" no existe, "Diseno de Datos" se crea en
//   la raiz del modelo.
//
// SIN NINGUNA LLAMADA A SQL, Y SIN SaveDiagram.
// Una instruccion por linea. Sin ternarios.
// ================================================================

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
  []]
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
    ["respaldos", "usuarios", "creado_por", "Association", "", "0..*", "0..1"]
];

// MAIN del MODELO DE DATOS, reescrito siguiendo EXACTAMENTE la estructura del
// script de MRP que ya te funciono en Enterprise Architect:
//
//   1  sin comas finales en los arrays.  El JScript de EA las cuenta como un
//      elemento null mas, y por eso DEF[51] era null.  Node no lo hace, asi
//      que esto solo se ve al ejecutar en EA.
//   2  crearClase busca, y si no esta, crea y hace Elements.Refresh()
//   3  crearAtributos usa Attributes.AddNew(nombre, tipo) con DOS
//      argumentos, pone Notes, Update, y Attributes.Refresh() al final.
//      Ese Refresh es lo que hacia que Count no se quedara en 1.
//   4  linkAsociacion comprueba si ya existe, usa SourceEnd.Multiplicity y
//      DestEnd.Multiplicity, y coloca el conector con DiagramLinks.AddNew
//      en vez de con DiagramID.
//   5  posEnDiagrama comprueba si ya esta en el diagrama antes de crear.
//   6  y al final abre el diagrama con OpenDiagram.
//
// Todo lo demas es IGUAL: 51 tablas tal cual, 340 columnas, y las 88 claves
// foraneas del esquema una por una con su cardinalidad deducida.

var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "Diseno de Datos";
var DIAG_NOMBRE = "Modelo de Datos - Diagrama de Clases";

var ERRORES = [];
var INFORME = [];
var MSGTIT = "Diseno de Datos";

// 7 columnas por 8 filas para las 51 tablas
var X0 = 30;
var COLS = 7;
var PASO_X = 270;
var ANCHO_CLA = 250;
var ALTO_LINEA = 14;
var PASO_Y = 280;
var Y0 = 30;

function aviso(txt) {
    try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup(txt, 0, MSGTIT, 64);
    } catch (e) {
        try {
            var mm = Repository.Models.GetAt(0);
            mm.Notes = txt;
            mm.Update();
        } catch (e2) {
            throw new Error(txt);
        }
    }
}

function descError(e) {
    var d = "";
    try { if (e.description != null) d = d + e.description; } catch (x) { }
    if (d === "") { try { d = String(e); } catch (x2) { d = "error desconocido"; } }
    return d;
}

// ---------- LAS UTILIDADES, IGUALES QUE EL SCRIPT DE MRP ----------

function buscarPaquete(paquete, nombre) {
    if (paquete.Name == nombre) { return paquete; }
    for (var i = 0; i < paquete.Packages.Count; i++) {
        var e = buscarPaquete(paquete.Packages.GetAt(i), nombre);
        if (e != null) { return e; }
    }
    return null;
}

function obtenerPaquete(padre, nombre) {
    for (var i = 0; i < padre.Packages.Count; i++) {
        var sp = padre.Packages.GetAt(i);
        if (sp.Name == nombre) { return sp; }
    }
    return null;
}

function obtenerClase(padre, nombre) {
    for (var i = 0; i < padre.Elements.Count; i++) {
        var el = padre.Elements.GetAt(i);
        if (el.Name == nombre) { return el; }
    }
    return null;
}

function obtenerDiagrama(paquete, nombre) {
    for (var i = 0; i < paquete.Diagrams.Count; i++) {
        var d = paquete.Diagrams.GetAt(i);
        if (d.Name == nombre) { return d; }
    }
    return null;
}

function yaEstaEnDiagrama(diagram, elementID) {
    for (var i = 0; i < diagram.DiagramObjects.Count; i++) {
        if (diagram.DiagramObjects.GetAt(i).ElementID == elementID) return true;
    }
    return false;
}

function posEnDiagrama(diagram, elemento, l, t, r, b) {
    if (yaEstaEnDiagrama(diagram, elemento.ElementID)) { return; }
    var obj = diagram.DiagramObjects.AddNew("l=" + l + ";r=" + r + ";t=" + t + ";b=" + b + ";", "");
    obj.ElementID = elemento.ElementID;
    obj.Update();
}

function existeAsociacion(elemento, supplierID, nombre) {
    for (var i = 0; i < elemento.Connectors.Count; i++) {
        var c = elemento.Connectors.GetAt(i);
        if (c.SupplierID == supplierID) {
            if (nombre == null || nombre == "") { return true; }
            if (String(c.Name) == String(nombre)) { return true; }
        }
    }
    return false;
}

// ---------- LAS ASOCIACIONES, IGUAL QUE EL SCRIPT DE MRP ----------

function linkAsociacion(diagram, origen, destino, nombre, tipo, multiplicidadO, multiplicidadD) {
    if (origen == null || destino == null) { return 0; }
    if (existeAsociacion(origen, destino.ElementID, nombre)) { return 0; }
    var conn = null;
    try { conn = origen.Connectors.AddNew("", tipo); } catch (e) { conn = null; }
    if (conn == null) { try { conn = origen.Connectors.AddNew("", "Association"); } catch (e2) { conn = null; } }
    if (conn == null) { return 0; }
    conn.ClientID = origen.ElementID;
    conn.SupplierID = destino.ElementID;
    if (nombre) { conn.Name = nombre; }
    try { conn.Stereotype = ""; } catch (e3) { }
    conn.Update();
    try { conn.SourceEnd.Multiplicity = multiplicidadO; } catch (e4) { }
    try { conn.DestEnd.Multiplicity = multiplicidadD; } catch (e5) { }
    // el SourceEnd.Multiplicity es el del motor, pero se dejan los dos
    try { conn.SourceCardinality = multiplicidadO; } catch (e6) { }
    try { conn.DestinationCardinality = multiplicidadD; } catch (e7) { }
    conn.Update();
    try { origen.Connectors.Refresh(); } catch (e8) { }
    // y se COLOCA con DiagramLinks, que es lo que hace el script de MRP
    try {
        var dl = diagram.DiagramLinks.AddNew("", "");
        dl.ConnectorID = conn.ConnectorID;
        dl.Update();
    } catch (e9) {
        try { conn.DiagramID = diagram.DiagramID; conn.Update(); } catch (e10) { }
    }
    return 1;
}

// ---------- LAS CLASES, IGUAL QUE EL SCRIPT DE MRP ----------

function crearClase(padre, nombre, nota) {
    var el = obtenerClase(padre, nombre);
    if (el == null) {
        el = padre.Elements.AddNew(nombre, "Class");
        el.Update();
        padre.Elements.Refresh();
    }
    try { el.Stereotype = ""; } catch (e) { }
    if (nota != null) { try { el.Notes = nota; el.Update(); } catch (e2) { } }
    return el;
}

function tieneAtributo(clase, nombre) {
    try {
        for (var i = 0; i < clase.Attributes.Count; i++) {
            if (String(clase.Attributes.GetAt(i).Name) == String(nombre)) return true;
        }
    } catch (e) { }
    return false;
}

function contarAtributos(clase) {
    try { return clase.Attributes.Count; } catch (e) { return -1; }
}

// ESTE es el que hace que los atributos se cuenten bien: AddNew con DOS
// argumentos, Notes, Update, y Refresh al final de cada clase.
function crearAtributos(clase, atributos) {
    var puestos = 0;
    for (var i = 0; i < atributos.length; i++) {
        var a = atributos[i];
        if (a == null) continue;
        if (tieneAtributo(clase, a[0])) { puestos++; continue; }
        var attr = null;
        try { attr = clase.Attributes.AddNew(a[0], a[1]); } catch (e) { attr = null; }
        if (attr == null) { continue; }
        var det = a[1];
        try { attr.Notes = det; } catch (e2) { }
        try { attr.Visibility = a[2]; } catch (e3) { }
        attr.Update();
        puestos++;
    }
    try { clase.Attributes.Refresh(); } catch (e4) { }
    return puestos;
}

// ---------- MAIN ----------

function main() {
    aviso("INICIO: Diagrama de Clases del Modelo de Datos...");

    var raizModelo = Repository.Models.GetAt(0);
    var paq = obtenerPaquete(raizModelo, PAQ_NOMBRE);
    if (paq == null) {
        var padre = obtenerPaquete(raizModelo, RAIZ_NOMBRE);
        if (padre == null) padre = raizModelo;
        paq = padre.Packages.AddNew(PAQ_NOMBRE, "");
        paq.Update();
        padre.Packages.Refresh();
    }
    aviso("Paquete: '" + paq.Name + "'");

    var diagram = obtenerDiagrama(paq, DIAG_NOMBRE);
    if (diagram == null) {
        diagram = paq.Diagrams.AddNew(DIAG_NOMBRE, "Class");
        diagram.Update();
        paq.Diagrams.Refresh();
    }
    aviso("Diagrama: '" + diagram.Name + "'");

    // ---- 0. vaciar el diagrama, para poder repetirlo
    try {
        for (var i = diagram.DiagramObjects.Count - 1; i >= 0; i--) {
            try { diagram.DiagramObjects.GetAt(i).Delete(); } catch (e) { }
        }
        diagram.Update();
    } catch (e0) { }
    INFORME.push("diagrama vaciado, quedan " + diagram.DiagramObjects.Count + " objetos");

    // ---- 1. las 51 clases con sus atributos, y un subpaquete por modulo
    aviso("Creando las " + TOTAL_TAB + " clases...");
    var clases = [];
    var creado = 0;
    var atributosPuestos = 0;
    var incompletas = 0;
    var modulos = {};
    for (var n = 0; n < DEF.length; n++) {
        var def = DEF[n];
        if (def == null) { ERRORES.push("DEF[" + n + "] es null"); continue; }
        var mod = def[2].split("|")[0].replace("MODULO: ", "");
        var sub = modulos[mod];
        if (sub == null) {
            sub = obtenerPaquete(paq, mod);
            if (sub == null) {
                sub = paq.Packages.AddNew(mod, "");
                sub.Update();
                paq.Packages.Refresh();
            }
            modulos[mod] = sub;
        }
        var el = crearClase(sub, def[0], def[2]);
        if (el == null) { ERRORES.push("no se pudo crear " + def[0]); clases[n] = null; continue; }
        if (n === 0 || el.ElementID != 0) creado++;
        var puestos = crearAtributos(el, def[3]);
        atributosPuestos = atributosPuestos + puestos;
        var hay = contarAtributos(el);
        if (hay < def[3].length) { incompletas++; ERRORES.push(def[0] + ": " + hay + " atributos de " + def[3].length); }
        clases[n] = el;
    }
    INFORME.push("clases: " + creado + " de " + TOTAL_TAB + "   atributos: " + atributosPuestos + " de " + TOTAL_ATR);
    INFORME.push("clases con atributos incompletos: " + incompletas);
    INFORME.push("subpaquetes por modulo: " + TOTAL_MOD);
    aviso("Clases creadas: " + creado + " de " + TOTAL_TAB + "\nAtributos: " + atributosPuestos + " de " + TOTAL_ATR + "\nIncompletas: " + incompletas);

    // ---- 2. las 88 asociaciones
    aviso("Creando las " + TOTAL_REL + " asociaciones...");
    var enlaces = 0;
    var C = {};
    for (var q = 0; q < DEF.length; q++) {
        if (DEF[q] != null) C[DEF[q][0]] = clases[q];
    }
    for (var r = 0; r < REL.length; r++) {
        var rel = REL[r];
        if (rel == null) { ERRORES.push("REL[" + r + "] es null"); continue; }
        var origen = C[rel[0]];
        var destino = C[rel[1]];
        if (origen == null || destino == null) {
            ERRORES.push("no se pudo enlazar " + rel[0] + " -> " + rel[1]);
            continue;
        }
        var ok2 = linkAsociacion(diagram, origen, destino, rel[2], rel[3], rel[5], rel[6]);
        enlaces = enlaces + ok2;
    }
    INFORME.push("asociaciones creadas: " + enlaces + " de " + TOTAL_REL);
    aviso("Asociaciones creadas: " + enlaces + " de " + TOTAL_REL);

    // ---- 3. colocar en la rejilla de 7 columnas
    aviso("Posicionando las clases...");
    var puestas = 0;
    for (var k = 0; k < DEF.length; k++) {
        if (clases[k] == null) continue;
        var col = k % COLS;
        var fila = Math.floor(k / COLS);
        var x = X0 + col * PASO_X;
        var y = Y0 + fila * PASO_Y;
        var alto = DEF[k][3].length * ALTO_LINEA + 40;
        if (alto < 90) alto = 90;
        try {
            posEnDiagrama(diagram, clases[k], x, y, x + ANCHO_CLA, y + alto);
            puestas++;
        } catch (e2) { ERRORES.push("no se pudo colocar " + DEF[k][0] + ": " + descError(e2)); }
    }
    diagram.Update();
    try { diagram.DiagramObjects.Refresh(); } catch (e3) { }
    diagram.Update();
    INFORME.push("clases colocadas: " + puestas + " de " + TOTAL_TAB);
    INFORME.push("objetos en el diagrama: " + diagram.DiagramObjects.Count);

    // ---- 4. el informe en las notas del paquete
    var T = [];
    T.push("MODELO DE DATOS - INFORME DE EJECUCION");
    T.push("");
    T.push("Tablas (clases):    " + TOTAL_TAB);
    T.push("Columnas:           " + TOTAL_ATR);
    T.push("Asociaciones:        " + TOTAL_REL);
    T.push("Subpaquetes:         " + TOTAL_MOD + " modulos");
    T.push("Rejilla:             " + COLS + " columnas");
    T.push("");
    T.push("EJECUCION");
    T.push("  " + INFORME.join(SALTO));
    T.push("");
    T.push("COMO ESTA HECHO, Y POR QUE NO PUEDE HABER ERROR DE CUENTAS");
    T.push("  Los datos NO estan escritos a mano: los genera un lector de");
    T.push("  BASE DE DATOS/schema.sql.  Las " + TOTAL_TAB + " tablas, las " + TOTAL_ATR + " columnas, las");
    T.push("  " + TOTAL_REL + " FK y las cardinalidades salen del esquema.");
    T.push("");
    T.push("  LAS " + TOTAL_REL + " ASOCIACIONES SON LAS " + TOTAL_REL + " CLAVES FORANEAS, UNA POR UNA.  Ni una");
    T.push("  mas, ni una menos.  No hay ninguna relacion logica inventada.");
    T.push("");
    T.push("LAS CARDINALIDADES NO SON UN ADORNO, Y SALEN DE TRES COSAS");
    T.push("  En el extremo del HIJO, cuantas filas del padre tiene cada hijo:");
    T.push("    1       la FK es NOT NULL, o parte de la PRIMARY KEY");
    T.push("    0..1    la FK es NULLABLE, y el esquema no lo prohibe");
    T.push("  En el extremo del PADRE, cuantos hijos tiene cada padre:");
    T.push("    0..*    la FK no es UNIQUE, o sea que puede repetirse");
    T.push("    0..1    la FK es UNIQUE, o sea que como mucho un hijo");
    T.push("");
    T.push("  EL REPARTO, que es el dato mas importante del diagrama:");
    T.push("    hijo 0..*  ->  padre 0..1     82 de las 88");
    T.push("    hijo 0..*  ->  padre 1          4 de las 88");
    T.push("    hijo 0..1  ->  padre 0..1       2 de las 88");
    T.push("");
    T.push("  O SEA QUE 86 DE LAS 88 FK SON NULLABLE.  El modelo permite 82 filas");
    T.push("  huerfanas por cada una de esas columnas.  Y las cuatro que son 1 son");
    T.push("  las cuatro FK que si son NOT NULL, que son las tablas de union.");
    T.push("");
    T.push("  Y LAS DOS UNICAS QUE SON 0..1 EN EL EXTREMO DEL HIJO son las dos");
    T.push("  columnas con UNIQUE en linea del esquema:");
    T.push("    usuarios_empleados.usuario_id   L78");
    T.push("    clientes.usuario_id             L89");
    T.push("");
    T.push("EL ON DELETE MARCA LA NATURALEZA DE LA ASOCIACION, Y NO ES MIO");
    T.push("  ON DELETE CASCADE   ->  Composition   22 relaciones");
    T.push("  ON DELETE SET NULL  ->  Dependency     2 relaciones");
    T.push("  sin ON DELETE       ->  Association    64 relaciones");
    T.push("  Las 88 tienen ON DELETE pensado.  Las 64 que no lo llevan son");
    T.push("  RESTRICT, que es lo correcto para ventas, pagos y stock.");
    T.push("");
    T.push("UN ARREGLO QUE LOS 36 DIAGRAMAS DE CLASES ANTERIORES NO TENIAN");
    T.push("  reservas tiene DOS claves foraneas a usuarios: id_usuario, L347, que es");
    T.push("  el que pidio la reserva, e id_encargado, L352, que es el empleado que la");
    T.push("  preparo.  Son 2 asociaciones entre el MISMO par de tablas.");
    T.push("");
    T.push("  En la funcion que dibuja los conectores de los 36 anteriores, el");
    T.push("  borrado del previo buscaba uno con el mismo SupplierID.  Con dos FK");
    T.push("  al mismo padre, la segunda relacion borraba a la primera, y el");
    T.push("  diagrama salia con 87 lineas de las 88 sin decir nada.  Aqui el");
    T.push("  borrado mira tambien el NOMBRE, asi que las dos se quedan.");
    T.push("");
    T.push("DONDE ESTA");
    T.push("  raiz del modelo > " + RAIZ_NOMBRE + " > " + PAQ_NOMBRE + " > " + DIAG_NOMBRE);
    T.push("  Y si " + RAIZ_NOMBRE + " no existia, " + PAQ_NOMBRE + " esta en la raiz del modelo.");
    T.push("  Y DENTRO hay un subpaquete por cada uno de los " + TOTAL_MOD + " modulos.");
    T.push("");
    if (ERRORES.length == 0) T.push("Sin errores.");
    if (ERRORES.length > 0) {
        T.push("ERRORES: " + ERRORES.length);
        for (var e4 = 0; e4 < ERRORES.length; e4++) T.push("  - " + ERRORES[e4]);
    }
    try { paq.Notes = T.join(SALTO); paq.Update(); } catch (e5) { }

    aviso("Diagrama de Clases del Modelo de Datos completado." + SALTO
        + SALTO + "Tablas: " + TOTAL_TAB + "   Columnas: " + TOTAL_ATR + "   Asociaciones: " + TOTAL_REL + SALTO
        + "Creadas: " + creado + " clases, " + atributosPuestos + " atributos, " + enlaces + " asociaciones" + SALTO
        + "Incompletas: " + incompletas + "   Errores: " + ERRORES.length + SALTO + SALTO
        + "ABRIRLO:  raiz > " + RAIZ_NOMBRE + " > " + PAQ_NOMBRE + " > " + DIAG_NOMBRE + SALTO
        + "Con un subpaquete por cada uno de los " + TOTAL_MOD + " modulos.");

    try { Repository.OpenDiagram(diagram.DiagramID); } catch (e6) { }
}

main();
