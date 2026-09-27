// ================================================================
// CU36 - REGISTRAR VENTA PRESENCIAL EN PUNTO DE CAJA (POS)
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   api/src/modulos/ventas/Ctr_Pos.ts:8            @Controller('pos'), 2 GET, JwtAuthGuard
//   api/src/modulos/ventas/Ctr_Pos.ts:12           GET productos con busqueda y limite
//   api/src/modulos/ventas/Ctr_Pos.ts:24           GET clientes con busqueda y limite
//   api/src/modulos/ventas/CTR_Ventas.ts:93        @Post('presencial')
//   api/src/modulos/ventas/CTR_Ventas.ts:40        VentaPresencialRequest
//   api/src/modulos/ventas/SRV_VentasService.ts:305  buscarProductosPos
//   api/src/modulos/ventas/SRV_VentasService.ts:325  lee p.porcentaje_iva: NO existe
//   api/src/modulos/ventas/SRV_VentasService.ts:333  LEFT JOIN producto_precios sin LIMIT
//   api/src/modulos/ventas/SRV_VentasService.ts:363  buscarClientesPos
//   api/src/modulos/ventas/SRV_VentasService.ts:396  crearVentaPresencial
//   api/src/modulos/ventas/SRV_VentasService.ts:457  lee p.porcentaje_iva: NO existe
//   api/src/modulos/ventas/SRV_VentasService.ts:472  LIMIT 1 sin ORDER BY en el precio
//   api/src/modulos/ventas/SRV_VentasService.ts:484  control de stock sin FOR UPDATE
//   api/src/modulos/ventas/SRV_VentasService.ts:513  transaction solo para venta e items
//   api/src/modulos/ventas/SRV_VentasService.ts:537  bitacora FUERA de la transaccion
//   api/src/main.ts:22                            ValidationPipe whitelist:true
//   web/src/pages/admin/AdminCaja.tsx:225-228      el IVA lo calcula tambien el cliente
//   web/src/pages/admin/AdminCaja.tsx:230-276      un solo clic hace venta Y cobro
//   web/src/pages/admin/AdminCaja.tsx:641          el boton se llama Procesar Pago
//   schema.sql:662  sp_registrar_venta MUERTA, con FOR UPDATE y sin IVA
//   schema.sql:654  trg_movimiento_inventario, unica rutina viva de las ocho
//   schema.sql:179  categorias      SIN porcentaje_iva_default
//   schema.sql:223  productos        SIN porcentaje_iva
//   schema.sql:0    CERO ALTER TABLE en todo el esquema
//
// Sin estereotipo: el rol va en el nombre IU_ / CTR_ / SRV_ / CE_.
// Diagrama estatico: sin mensajes, sin lineas de vida, sin secuencia.
// Autorreparable. Una instruccion por linea. Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================

var ALTO = 14;
var SALTO = String.fromCharCode(10);
var VIS_PUB = 0;
var VIS_PRI = 1;
var RAIZ = Repository.Models.GetAt(0);
var TOTAL_REL = 95;
var TOTAL_ATR = 158;
var TOTAL_OPE = 37;

var DEF = [
    ["IU_AdminCaja", "EXISTE. web/src/pages/admin/AdminCaja.tsx, 713 lineas", "un solo clic crea la venta y cobra; no hay dos pasos",
     [["items", "Array", VIS_PUB], ["cliente", "Object = null", VIS_PUB], ["metodoPago", "String", VIS_PUB], ["proveedorPasarela", "String", VIS_PUB], ["montoRecibido", "String", VIS_PUB], ["nit", "String", VIS_PUB], ["razonSocial", "String", VIS_PUB], ["busqueda", "String", VIS_PUB], ["busquedaCliente", "String", VIS_PUB], ["subtotal", "Number", VIS_PUB], ["impuestos", "Number", VIS_PUB], ["total", "Number", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["error", "String = null", VIS_PUB], ["ventaOk", "Object = null", VIS_PUB]],
     [["procesarVenta", "void", ["evento"], VIS_PUB], ["agregarItem", "void", ["producto"], VIS_PUB], ["cambiarCantidad", "void", ["idPtc", "cantidad", "tope"], VIS_PUB], ["quitarItem", "void", ["idPtc"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_FormularioPago", "EXISTE. AdminCaja.tsx, bloques de 560 a 700", "metodo, monto recibido, vuelto y datos de factura",
     [["metodoPago", "String", VIS_PUB], ["montoRecibido", "String", VIS_PUB], ["vuelto", "Number", VIS_PUB], ["nit", "String", VIS_PUB], ["razonSocial", "String", VIS_PUB], ["terminal_url", "String = opcional", VIS_PUB]],
     [["calcularVuelto", "Number", ["montoRecibido", "total"], VIS_PUB], ["abrirTerminal", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "EXISTE. web/src/lib/api.ts", "los tres endpoints: pos productos, pos clientes y ventas presencial",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["buscarProductosPos", "Array", ["busqueda", "limite"], VIS_PUB], ["buscarClientesPos", "Array", ["busqueda", "limite"], VIS_PUB], ["crearVentaPresencial", "Object", ["body"], VIS_PUB], ["procesarPagoCaja", "Object", ["body"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["IU_CajeroLayout", "EXISTE. layout de la seccion admin", "envuelve la caja y oculta el modulo sin permiso",
     [["usuario", "Object", VIS_PUB]],
     [["puedeCobrar", "Boolean", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["CTR_PosController", "EXISTE. ventas/Ctr_Pos.ts, 31 lineas", "ruta pos; dos GET con JwtAuthGuard y HttpCode 200",
     [["ventasService", "VentasService", VIS_PRI]],
     [["buscarProductos", "Array", ["currentUser", "busqueda", "limite"], VIS_PUB], ["buscarClientes", "Array", ["currentUser", "busqueda", "limite"], VIS_PUB]]],

    ["CTR_VentasController", "EXISTE. ventas/CTR_Ventas.ts:93", "la ruta presencial; comparte servicio con el checkout",
     [["ventasService", "VentasService", VIS_PRI]],
     [["checkout", "Object", ["body", "usuario", "request"], VIS_PUB], ["ventaPresencial", "Object", ["body", "usuario", "request"], VIS_PUB]]],

    ["SRV_VentasService", "EXISTE. ventas/SRV_VentasService.ts, 564 lineas", "10 metodos; el POS no bloquea el stock",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermisoVenta", "void", ["usuario"], VIS_PRI], ["exigirPermisoRegistrarVenta", "void", ["usuario"], VIS_PRI], ["sucursalDelEmpleado", "Number", ["usuario"], VIS_PRI], ["clienteDe", "Number", ["usuario"], VIS_PRI], ["crearCompraDigital", "Object", ["usuario", "dto", "request"], VIS_PUB], ["buscarProductosPos", "Array", ["usuario", "busqueda", "limite"], VIS_PUB], ["buscarClientesPos", "Array", ["usuario", "busqueda", "limite"], VIS_PUB], ["crearVentaPresencial", "Object", ["usuario", "dto", "request"], VIS_PUB]]],

    ["SRV_BitacoraService", "EXISTE. seguridad/SRV_BitacoraService.ts", "una llamada, fuera de la transaccion de la venta",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "EXISTE. seguridad/dependencias.ts", "las tres rutas del POS lo llevan",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB]]],

    ["SRV_UsuarioActual", "EXISTE. seguridad/dependencias.ts", "inyecta el Usuario en los tres handlers",
     [],
     [["UsuarioActual", "Usuario", ["datos", "contexto"], VIS_PUB]]],

    ["SRV_ValidationPipe", "EXISTE. api/src/main.ts:22", "whitelist:true y los @IsIn cortan antes que el servicio",
     [],
     [["validate", "Object", ["value", "metadatos"], VIS_PUB], ["transform", "Boolean", ["value", "metadatos"], VIS_PUB]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "una consulta por cada item del pedido",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "Object", ["callback"], VIS_PUB]]],

    ["CE_BuscarProductosQuery", "EXISTE. Ctr_Pos.ts:12", "busqueda y limite, sueltos en query string",
     [["busqueda", "String = opcional", VIS_PUB], ["limite", "Number = 30, tope 100", VIS_PUB]],
     []],

    ["CE_BuscarClientesQuery", "EXISTE. Ctr_Pos.ts:24", "busqueda y limite, con tope de 50",
     [["busqueda", "String = opcional", VIS_PUB], ["limite", "Number = 10, tope 50", VIS_PUB]],
     []],

    ["CE_ProductoPosItem", "EXISTE. SRV_VentasService.ts:349", "la fila que ve el cajero, con el IVA ya resuelto",
     [["id_ptc", "Integer", VIS_PUB], ["id_producto", "Integer", VIS_PUB], ["codigo", "String", VIS_PUB], ["nombre", "String", VIS_PUB], ["talla", "String", VIS_PUB], ["color", "String", VIS_PUB], ["precio_unitario", "Number", VIS_PUB], ["porcentaje_iva", "Number", VIS_PUB], ["cantidad_disponible", "Number", VIS_PUB]],
     []],

    ["CE_VentaPresencialItemRequest", "EXISTE. CTR_Ventas.ts:40", "id_ptc y cantidad, ambos con @IsInt y mensaje",
     [["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer", VIS_PUB]],
     []],

    ["CE_VentaPresencialRequest", "EXISTE. CTR_Ventas.ts:47", "5 campos; el metodo admite Efectivo, los otros no",
     [["items", "Array", VIS_PUB], ["id_cliente", "Integer = opcional", VIS_PUB], ["metodo_pago", "String = Efectivo|Tarjeta|QR|Transferencia", VIS_PUB], ["proveedor_pasarela", "String = opcional", VIS_PUB], ["nit_cliente", "String = opcional", VIS_PUB], ["razon_social", "String = opcional", VIS_PUB]],
     []],

    ["CE_VentaPresencialDTO", "EXISTE. SRV_VentasService.ts:23", "el tipo interno; identico al request",
     [["items", "Array", VIS_PUB], ["id_cliente", "Integer = opcional", VIS_PUB], ["metodo_pago", "String", VIS_PUB], ["nit_cliente", "String = opcional", VIS_PUB], ["razon_social", "String = opcional", VIS_PUB]],
     []],

    ["CE_Venta", "EXISTE. ventas (schema.sql:384)", "id_carrito queda NULL y modalidad es Presencial",
     [["id_venta", "Integer = PK", VIS_PRI], ["id_cliente", "Integer = nullable", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["id_carrito", "Integer = NULL en POS", VIS_PUB], ["modalidad", "String = 20", VIS_PUB], ["metodo_pago", "String = 30", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB], ["impuestos", "Decimal(12,2)", VIS_PUB], ["total", "Decimal(12,2)", VIS_PUB], ["estado", "String = 20", VIS_PUB], ["fecha_venta", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_VentaItem", "EXISTE. venta_items (schema.sql:399)", "guarda el subtotal por linea, a diferencia del carrito",
     [["id_venta_item", "Integer = PK", VIS_PRI], ["id_venta", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["precio_unitario", "Decimal(10,2)", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB]],
     []],

    ["CE_Cliente", "EXISTE. clientes (schema.sql:87)", "el POS solo encuentra los que tienen usuario_id",
     [["id_cliente", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE, nullable", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["direccion", "Text", VIS_PUB], ["fecha_registro", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. usuarios (schema.sql:32)", "el CI vive aqui, no en clientes, y es UNIQUE",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120 UNIQUE", VIS_PRI], ["ci", "String = 30 UNIQUE, nullable", VIS_PRI], ["estado", "String = Pendiente", VIS_PUB]],
     []],

    ["CE_Rol", "EXISTE. roles; permisos_json en schema.sql:573", "realizar_venta NO esta en ninguno de los 5 roles",
     [["id_rol", "Integer = PK", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["descripcion", "String", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "EXISTE. usuarios_roles con PK compuesta", "cargarPermisos solo lee la PRIMERA fila de la union",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_UsuarioEmpleado", "EXISTE. usuarios_empleados (schema.sql:76)", "de aqui sale la sucursal de la caja",
     [["id_empleado", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE", VIS_PUB], ["sucursal_id", "Integer", VIS_PUB], ["nombre", "String = 120", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["rol", "String = 60", VIS_PUB], ["fecha_baja", "Timestamp = nullable", VIS_PUB], ["motivo_baja", "String = 255", VIS_PUB]],
     []],

    ["CE_Producto", "EXISTE. productos (schema.sql:223)", "NO tiene columna porcentaje_iva y el servicio la lee",
     [["id_producto", "Integer = PK", VIS_PRI], ["codigo", "String = 40 UNIQUE", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["descripcion", "Text", VIS_PUB], ["id_categoria", "Integer", VIS_PUB], ["id_temporada", "Integer", VIS_PUB], ["id_proveedor", "Integer", VIS_PUB], ["precio_base", "Decimal(10,2) NOT NULL", VIS_PUB], ["modelo_3d_url", "Text", VIS_PUB], ["estado", "String = Disponible", VIS_PUB], ["fecha_registro", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_Categoria", "EXISTE. categorias (schema.sql:179)", "NO tiene columna porcentaje_iva_default",
     [["id_categoria", "Integer = PK", VIS_PRI], ["nombre", "String = 80 UNIQUE", VIS_PUB], ["descripcion", "Text", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. producto_talla_color (schema.sql:237)", "el POS filtra estado_stock <> 'Sin stock'",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB], ["estado_stock", "String = Disponible", VIS_PUB]],
     []],

    ["CE_ProductoPrecio", "EXISTE. producto_precios (schema.sql:255)", "el LEFT JOIN sin LIMIT duplica el item en el listado",
     [["id_precio", "Integer = PK", VIS_PRI], ["id_ptc", "Integer = ON DELETE CASCADE", VIS_PUB], ["precio", "Decimal(10,2) NOT NULL", VIS_PUB], ["fecha_inicio", "Date", VIS_PUB], ["fecha_fin", "Date = NULL es vigente", VIS_PUB]],
     []],

    ["CE_InventarioStock", "EXISTE. inventario_stock", "el POS compara contra disponible sin restar cantidad_reservada",
     [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer = UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer = UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_reservada", "Integer = 0", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB], ["stock_minimo_alert", "Integer = 0", VIS_PUB]],
     []],

    ["CE_Sucursal", "EXISTE. sucursales", "la caja del cajero; el POS no mira el estado de la sucursal",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_Talla", "EXISTE. tallas", "JOIN interior en las tres consultas del POS",
     [["id_talla", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["orden", "Integer", VIS_PUB]],
     []],

    ["CE_Color", "EXISTE. colores", "JOIN interior en las tres consultas del POS",
     [["id_color", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["codigo_hex", "String", VIS_PUB]],
     []],

    ["CE_BitacoraAuditoria", "EXISTE. bitacora_auditoria (schema.sql:148)", "recibe nit_cliente y razon_social, la venta no",
     [["id_bitacora", "Integer = PK", VIS_PRI], ["id_usuario", "Integer = ON DELETE SET NULL", VIS_PUB], ["accion_sql", "String = 40", VIS_PUB], ["tabla_afectada", "String = 80", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "INET", VIS_PUB], ["user_agent", "String = 255", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_SpRegistrarVenta", "EXISTE. schema.sql:662, FUNCION PLPGSQL. CERO llamadas", "la version del POS que nunca se conecto",
     [["p_id_usuario", "Integer", VIS_PUB], ["p_id_sucursal", "Integer", VIS_PUB], ["p_modalidad", "String", VIS_PUB], ["p_metodo_pago", "String", VIS_PUB], ["p_items", "JSONB", VIS_PUB], ["p_venta_id", "Integer = OUT", VIS_PUB], ["p_total", "Decimal(12,2) = OUT", VIS_PUB]],
     [["sp_registrar_venta", "void", ["p_id_usuario", "p_id_sucursal", "p_modalidad", "p_metodo_pago", "p_items"], VIS_PUB]]]
];

var ACTORES = [
    ["ACTOR_Cajero", "Cajero de la caja. OJO: da 403", "NO tiene realizar_venta"],
    ["ACTOR_Encargado", "Encargado de la sucursal. OJO: da 403", "NO tiene realizar_venta"],
    ["ACTOR_Administrador", "Unico que pasa el permiso", "wildcard *"],
    ["ACTOR_Cliente", "Cliente presencial, sin sesion", "no toca el sistema: paga en la caja"]
];

var ERRORES = [];
var INFORME = [];

function pad(s, n) { var t = String(s); while (t.length < n) t = t + " "; return t; }

function nota(el, texto) {
    if (el == null) return;
    try {
        var a = String(el.Notes || "");
        if (a.indexOf(texto) < 0) el.Notes = a + SALTO + texto;
        el.Update();
    } catch (e) { }
}

function buscarPaquete(P, N) {
    if (P == null) return null;
    if (String(P.Name) == N) return P;
    for (var i = 0; i < P.Packages.Count; i++) {
        var r = buscarPaquete(P.Packages.GetAt(i), N);
        if (r != null) return r;
    }
    return null;
}

function subPaquete(padre, nombre) {
    for (var i = 0; i < padre.Packages.Count; i++) {
        if (String(padre.Packages.GetAt(i).Name) == nombre) return padre.Packages.GetAt(i);
    }
    var nuevo = padre.Packages.AddNew(nombre, "");
    nuevo.Update();
    padre.Packages.Refresh();
    return buscarPaquete(padre, nombre);
}

function buscarLocal(paq, nombre) {
    for (var i = 0; i < paq.Elements.Count; i++) {
        var e = paq.Elements.GetAt(i);
        if (String(e.Name) == nombre) return e;
    }
    return null;
}

function objetoEn(diag, el) {
    for (var i = 0; i < diag.DiagramObjects.Count; i++) {
        var c = diag.DiagramObjects.GetAt(i);
        if (c.ElementID == el.ElementID) return c;
    }
    return null;
}

function nombresDe(coleccion) {
    var s = "";
    if (coleccion == null) return s;
    try {
        for (var i = 0; i < coleccion.Count; i++) s = s + "|" + String(coleccion.GetAt(i).Name);
    } catch (e) { }
    return s;
}

function contiene(lista, nombre) { return lista.indexOf("|" + nombre) >= 0; }
function totalDe(lista) { if (lista == "") return 0; return lista.split("|").length - 1; }

function lineasCompartimento(def) {
    var l = [];
    for (var i = 0; i < def[3].length; i++) l.push("- " + def[3][i][0] + " : " + def[3][i][1]);
    if (def[3].length > 0 && def[4].length > 0) l.push("");
    for (var j = 0; j < def[4].length; j++) {
        var p = def[4][j][2];
        var f = "";
        if (p != null) f = p.join(", ");
        l.push("+ " + def[4][j][0] + "(" + f + ") : " + def[4][j][1]);
    }
    if (l.length == 0) l.push("(sin atributos ni operaciones)");
    return l;
}

function agregarAtributo(el, nombre, tipo, vis) {
    var a = null;
    try { a = el.Attributes.AddNew(nombre, tipo); } catch (e) { a = null; }
    if (a == null) return false;
    try { a.Name = nombre; } catch (e) { }
    try { a.Type = tipo; } catch (e) { }
    try { a.SetVisibility(vis); } catch (e) { }
    try { a.Update(); } catch (e) { }
    return true;
}

function agregarOperacion(el, nombre, retorno, parametros, vis) {
    var firma = "";
    if (parametros != null) firma = parametros.join(", ");
    var m = null;
    try { m = el.Methods.AddNew(nombre, retorno, firma, ""); } catch (e) { m = null; }
    if (m == null) return false;
    try { m.Name = nombre; } catch (e) { }
    try { m.SetReturnType(retorno); } catch (e) { }
    try { m.SetParameters(firma); } catch (e) { }
    try { m.SetVisibility(vis); } catch (e) { }
    try { m.SetStereotype(""); } catch (e) { }
    try { m.SetAbstract(false); } catch (e) { }
    try { m.SetStatic(false); } catch (e) { }
    try { m.SetQuery(false); } catch (e) { }
    try { m.SetReadOnly(false); } catch (e) { }
    try { m.Update(); } catch (e) { }
    return true;
}

function colocar(diag, el, izq, arr, ancho, alto) {
    var o = objetoEn(diag, el);
    if (o == null) {
        var tam = "l=" + izq + ";r=" + (izq + ancho) + ";t=" + arr + ";b=" + (arr + alto) + ";";
        try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e) { return null; }
        o.ElementID = el.ElementID;
    }
    try { o.ManuallySized = true; } catch (e) { }
    try { o.Left = izq; } catch (e) { }
    try { o.Top = arr; } catch (e) { }
    try { o.Right = izq + ancho; } catch (e) { }
    try { o.Bottom = arr + alto; } catch (e) { }
    try { o.FontSize = 8; } catch (e) { }
    o.Update();
    return o;
}

function compartimento(diag, paq, nombre, lineas, izq, arr, ancho) {
    var alto = lineas.length * ALTO + 8;
    var el = buscarLocal(paq, nombre);
    if (el == null) {
        try { el = paq.Elements.AddNew(nombre, "Text"); } catch (e) { el = null; }
        if (el == null) {
            try { el = paq.Elements.AddNew(nombre, "Class"); } catch (e) { }
            try { el.Stereotype = ""; } catch (e) { }
        }
    }
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

function enDiagrama(diag, el) {
    if (diag == null || el == null) return false;
    try {
        for (var i = 0; i < diag.DiagramObjects.Count; i++) {
            if (diag.DiagramObjects.GetAt(i).ElementID == el.ElementID) return true;
        }
    } catch (e) { }
    return false;
}

// El conector se crea en el PAQUETE, no en el diagrama. Como el script borra y
// recrea el diagrama en cada pasada, hay que COLOCARLO a mano con DiagramID:
// si no, EA solo lo dibuja la primera vez y al reejecutar el diagrama sale sin lineas.
function relacion(diag, a, b, etiqueta, tipo, est, rolA, rolB, cA, cB) {
    if (a == null || b == null) return 0;
    var i;
    var previo = null;
    for (i = 0; i < a.Connectors.Count; i++) {
        var c = a.Connectors.GetAt(i);
        if (c.SupplierID == b.ElementID) { previo = c; break; }
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
    try { con.Update(); } catch (e) { }
    try { con.DiagramID = diag.ID; con.Update(); } catch (e) { }
    try { con.Name = etiqueta; } catch (e) { }
    try { con.Stereotype = est; } catch (e) { }
    try { con.SourceRole = rolA; } catch (e) { }
    try { con.DestinationRole = rolB; } catch (e) { }
    try { con.SourceCardinality = cA; } catch (e) { }
    try { con.DestinationCardinality = cB; } catch (e) { }
    try { con.FontSize = 7; } catch (e) { }
    try { con.Update(); } catch (e) { }
    if (enDiagrama(diag, con)) return 1;
    return 0;
}
function main() {
    var cu = buscarPaquete(RAIZ, "Casos de Uso");
    if (cu == null) cu = RAIZ;
    var mod = buscarPaquete(cu, "4. Ventas y Pagos");
    if (mod == null) mod = buscarPaquete(cu, "7. Inventario y Recepciones");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU36 - Análisis de clases");

    for (var d = paq.Diagrams.Count - 1; d >= 0; d--) {
        try { paq.Diagrams.GetAt(d).Delete(); } catch (e) { }
    }
    try { paq.Diagrams.Refresh(); } catch (e) { }

    var clases = [];
    for (var n = 0; n < DEF.length; n++) {
        var def = DEF[n];
        var c = buscarLocal(paq, def[0]);
        if (c == null) {
            try { c = paq.Elements.AddNew(def[0], "Class"); } catch (e) { c = paq.Elements.AddNew(def[0], "Class"); }
            c.Update();
        }
        try { c.Name = def[0]; } catch (e) { }
        try { c.Stereotype = ""; } catch (e) { }
        nota(c, "Origen: " + def[2] + ".");
        try { c.Update(); } catch (e) { }
        clases[n] = c;
    }

    var actores = [];
    for (var a = 0; a < ACTORES.length; a++) {
        var act = buscarLocal(paq, ACTORES[a][0]);
        if (act == null) {
            try { act = paq.Elements.AddNew(ACTORES[a][0], "Actor"); } catch (e) { act = paq.Elements.AddNew(ACTORES[a][0], "Class"); }
        }
        try { act.Name = ACTORES[a][0]; } catch (e) { }
        try { act.Stereotype = ""; } catch (e) { }
        nota(act, ACTORES[a][1] + ". Requiere el permiso " + ACTORES[a][2] + ".");
        try { act.Update(); } catch (e) { }
        actores[a] = act;
    }

    try { paq.Elements.Refresh(); } catch (e) { }

    var usaTexto = [];
    var conReal = [];
    var totalAtr = 0;
    var totalOpe = 0;
    var conEnDiagrama = 0;

    for (var n2 = 0; n2 < DEF.length; n2++) {
        var d2 = DEF[n2];
        try { paq.Elements.Refresh(); } catch (e) { }
        var el = buscarLocal(paq, d2[0]);
        if (el == null) { ERRORES.push("clase " + d2[0] + " no encontrada"); continue; }
        var antes = "";
        var antesOpe = "";
        try { antes = nombresDe(el.Attributes); } catch (e) { antes = ""; }
        try { antesOpe = nombresDe(el.Methods); } catch (e) { antesOpe = ""; }
        for (var k = 0; k < d2[3].length; k++) {
            if (contiene(antes, d2[3][k][0])) continue;
            agregarAtributo(el, d2[3][k][0], d2[3][k][1], d2[3][k][2]);
        }
        for (var j = 0; j < d2[4].length; j++) {
            if (contiene(antesOpe, d2[4][j][0])) continue;
            agregarOperacion(el, d2[4][j][0], d2[4][j][1], d2[4][j][2], d2[4][j][3]);
        }
        try { el.Update(); } catch (e) { }
        var fin = "";
        var finOpe = "";
        try { fin = nombresDe(el.Attributes); } catch (e) { fin = ""; }
        try { finOpe = nombresDe(el.Methods); } catch (e) { finOpe = ""; }
        totalAtr = totalAtr + totalDe(fin);
        totalOpe = totalOpe + totalDe(finOpe);
        var bien = totalDe(fin) >= d2[3].length;
        if (totalDe(finOpe) >= d2[4].length) bien = true;
        usaTexto[n2] = !bien;
        if (bien) conReal.push(d2[0]);
        INFORME.push(pad(d2[0], 30) + " atr " + totalDe(fin) + "/" + d2[3].length + "  ope " + totalDe(finOpe) + "/" + d2[4].length + (bien ? "  REAL" : "  TEXTO"));
    }

    var diag = null;
    try { diag = paq.Diagrams.AddNew("CU36 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
    if (diag == null) ERRORES.push("no se pudo crear el diagrama");

    if (diag != null) {
        diag.Update();
        try { paq.Diagrams.Refresh(); } catch (e) { }
        var COLX = [30, 300, 570, 840, 1110];
        var ANCHO = 250;

        for (var p = 0; p < actores.length; p++) {
            colocar(diag, actores[p], COLX[p], 25, 190, 100);
        }
        for (var k2 = 0; k2 < DEF.length; k2++) {
            var col = k2 % 5;
            var fila = 1 + Math.floor(k2 / 5);
            var x = COLX[col];
            var y = 25 + fila * 300;
            var lineas = lineasCompartimento(DEF[k2]);
            if (usaTexto[k2]) {
                colocar(diag, clases[k2], x, y, ANCHO, 24);
                compartimento(diag, paq, "TXT " + DEF[k2][0], lineas, x, y + 24, ANCHO);
            } else {
                colocar(diag, clases[k2], x, y, ANCHO, lineas.length * ALTO + 34);
            }
        }

        var C = {};
        for (var q = 0; q < DEF.length; q++) { C[DEF[q][0]] = clases[q]; }

        conEnDiagrama += relacion(diag, actores[0], C.IU_AdminCaja, "opera la caja", "Association", "", "cajero", "caja", "1", "1");
        conEnDiagrama += relacion(diag, actores[0], C.CTR_PosController, "busca prendas y clientes", "Association", "", "cajero", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C.CTR_PosController, "consulta las ventas", "Association", "", "encargado", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[2], C.CTR_PosController, "unico que pasa el permiso", "Association", "", "administrador", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C.CTR_VentasController, "confirma la venta", "Association", "", "cajero", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[3], C.CTR_VentasController, "paga en la caja", "Association", "", "cliente", "endpoint", "1", "0..1");
                conEnDiagrama += relacion(diag, actores[2], C.CTR_VentasController, "tambien es el unico que cobra", "Association", "", "administrador", "endpoint", "1", "0..1");

        conEnDiagrama += relacion(diag, C.IU_AdminCaja, C.IU_FormularioPago, "bloque de cobro", "Composition", "composition", "caja", "formulario", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminCaja, C.IU_Api, "cliente HTTP", "Dependency", "uses", "caja", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminCaja, C.CE_ProductoPosItem, "prenda agregada", "Association", "", "caja", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminCaja, C.CE_Cliente, "cliente de la venta", "Association", "", "caja", "cliente", "0..1", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminCaja, C.CE_Venta, "venta creada", "Association", "", "caja", "venta", "0..*", "1");
        conEnDiagrama += relacion(diag, C.IU_FormularioPago, C.CE_Venta, "total a cobrar", "Dependency", "uses", "formulario", "venta", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_Api, C.CTR_PosController, "punto de acceso del catalogo", "Dependency", "uses", "cliente", "pos", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_Api, C.CTR_VentasController, "punto de acceso de ventas", "Dependency", "uses", "cliente", "ventas", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_Api, C.CE_BuscarProductosQuery, "busqueda enviada", "Association", "", "cliente", "consulta", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_Api, C.CE_BuscarClientesQuery, "busqueda enviada", "Association", "", "cliente", "consulta", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_Api, C.CE_VentaPresencialRequest, "cuerpo de la venta", "Association", "", "cliente", "cuerpo", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_Api, C.CE_ProductoPosItem, "listado recibido", "Association", "", "cliente", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C.IU_CajeroLayout, C.IU_AdminCaja, "envuelve la pantalla", "Dependency", "uses", "layout", "caja", "0..1", "1");

        conEnDiagrama += relacion(diag, C.CTR_PosController, C.SRV_JwtAuthGuard, "guard en las dos rutas", "Dependency", "uses", "pos", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_PosController, C.SRV_UsuarioActual, "usuario resuelto", "Dependency", "uses", "pos", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_PosController, C.SRV_VentasService, "servicio de ventas", "Association", "", "pos", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_PosController, C.CE_BuscarProductosQuery, "consulta de productos", "Association", "", "pos", "consulta", "1", "0..1");
        conEnDiagrama += relacion(diag, C.CTR_PosController, C.CE_BuscarClientesQuery, "consulta de clientes", "Association", "", "pos", "consulta", "1", "0..1");
        conEnDiagrama += relacion(diag, C.CTR_PosController, C.CE_ProductoPosItem, "listado devuelto", "Association", "", "pos", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CTR_PosController, C.CE_Cliente, "clientes devueltos", "Association", "", "pos", "cliente", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CTR_VentasController, C.SRV_JwtAuthGuard, "guard", "Dependency", "uses", "ventas", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_VentasController, C.SRV_UsuarioActual, "usuario resuelto", "Dependency", "uses", "ventas", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_VentasController, C.SRV_ValidationPipe, "filtro de entrada", "Dependency", "uses", "ventas", "filtro", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_VentasController, C.SRV_VentasService, "servicio de ventas", "Association", "", "ventas", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_VentasController, C.CE_VentaPresencialRequest, "cuerpo de entrada", "Association", "", "ventas", "cuerpo", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_VentasController, C.CE_VentaPresencialItemRequest, "items validados", "Association", "", "ventas", "item", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CTR_VentasController, C.CE_VentaPresencialDTO, "DTO mapeado", "Association", "", "ventas", "dto", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_VentasController, C.CE_Venta, "venta creada", "Association", "", "ventas", "venta", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CTR_VentasController, C.CE_VentaItem, "items devueltos", "Association", "", "ventas", "item de venta", "0..*", "1");

        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.SRV_BitacoraService, "auditoria de la venta", "Association", "", "ventas", "auditor", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.SRV_DataSource, "consultas y transaccion", "Dependency", "uses", "ventas", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_VentaPresencialDTO, "DTO recibido", "Dependency", "uses", "ventas", "dto", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_UsuarioRol, "asignacion de rol", "Dependency", "uses", "ventas", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_Rol, "rol comprobado", "Dependency", "uses", "ventas", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_UsuarioEmpleado, "sucursal de la caja", "Dependency", "uses", "ventas", "empleado", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_Usuario, "cajero que cobra", "Association", "", "ventas", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_Sucursal, "sucursal del POS", "Dependency", "uses", "ventas", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_Cliente, "cliente validado", "Dependency", "uses", "ventas", "cliente", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_Venta, "venta presencial creada", "Composition", "composition", "ventas", "venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_VentaItem, "items de la venta", "Composition", "composition", "ventas", "item de venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_ProductoTallaColor, "prenda validada", "Dependency", "uses", "ventas", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_Producto, "producto de la prenda", "Dependency", "uses", "ventas", "producto", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_Categoria, "categoria del producto", "Dependency", "uses", "ventas", "categoria", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_ProductoPrecio, "precio vigente", "Dependency", "uses", "ventas", "precio", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_InventarioStock, "stock de la sucursal", "Dependency", "uses", "ventas", "stock", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_Talla, "talla de la prenda", "Dependency", "uses", "ventas", "talla", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_Color, "color de la prenda", "Dependency", "uses", "ventas", "color", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_ProductoPosItem, "listado del POS", "Association", "", "ventas", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_VentasService, C.CE_BitacoraAuditoria, "registro de auditoria", "Composition", "composition", "ventas", "bitacora", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_JwtAuthGuard, C.CE_Usuario, "usuario resuelto", "Association", "", "guard", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ValidationPipe, C.CE_VentaPresencialRequest, "clase validada", "Dependency", "uses", "filtro", "cuerpo", "1", "0..1");
        conEnDiagrama += relacion(diag, C.SRV_BitacoraService, C.SRV_DataSource, "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_BitacoraService, C.CE_BitacoraAuditoria, "fila de bitacora", "Composition", "composition", "auditor", "bitacora", "1", "1");

        conEnDiagrama += relacion(diag, C.CE_BuscarProductosQuery, C.CE_ProductoPosItem, "filtra el listado", "Dependency", "uses", "consulta", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_BuscarClientesQuery, C.CE_Cliente, "filtra clientes", "Dependency", "uses", "consulta", "cliente", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_ProductoPosItem, C.CE_ProductoTallaColor, "prenda concreta", "Association", "", "prenda", "ptc", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_ProductoPosItem, C.CE_InventarioStock, "stock mostrado", "Dependency", "uses", "prenda", "stock", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_ProductoPosItem, C.CE_Categoria, "iva de la categoria", "Dependency", "uses", "prenda", "categoria", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaPresencialItemRequest, C.CE_ProductoTallaColor, "prenda del item", "Association", "", "item", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaPresencialRequest, C.CE_VentaPresencialItemRequest, "contiene items", "Composition", "composition", "cuerpo", "item", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_VentaPresencialRequest, C.CE_VentaPresencialDTO, "mapeo del DTO", "Dependency", "uses", "cuerpo", "dto", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaPresencialRequest, C.CE_Cliente, "cliente del cuerpo", "Association", "", "cuerpo", "cliente", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaPresencialDTO, C.CE_Venta, "venta del DTO", "Association", "", "dto", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Cliente, "cliente facturado", "Association", "", "venta", "cliente", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Usuario, "cajero de la venta", "Association", "", "venta", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Sucursal, "sucursal de la venta", "Association", "", "venta", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaItem, C.CE_Venta, "venta del item", "Composition", "composition", "item de venta", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaItem, C.CE_ProductoTallaColor, "prenda vendida", "Association", "", "item de venta", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Cliente, C.CE_Usuario, "usuario del cliente", "Association", "", "cliente", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_Rol, "roles del usuario", "Association", "", "usuario", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_UsuarioRol, "asignaciones", "Composition", "composition", "usuario", "asignacion", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_Rol, C.CE_UsuarioRol, "usuarios del rol", "Association", "", "rol", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_UsuarioEmpleado, C.CE_Usuario, "empleado", "Association", "", "empleado", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_UsuarioEmpleado, C.CE_Sucursal, "sucursal asignada", "Association", "", "empleado", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Producto, C.CE_Categoria, "categoria del producto", "Association", "", "producto", "categoria", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Producto, "producto de la prenda", "Composition", "composition", "ptc", "producto", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Talla, "talla de la prenda", "Association", "", "ptc", "talla", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Color, "color de la prenda", "Association", "", "ptc", "color", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_ProductoPrecio, C.CE_ProductoTallaColor, "precio de la prenda", "Association", "", "precio", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_InventarioStock, C.CE_ProductoTallaColor, "stock por prenda", "Association", "", "stock", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_InventarioStock, C.CE_Sucursal, "stock por sucursal", "Association", "", "stock", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_BitacoraAuditoria, C.CE_Usuario, "usuario de la accion", "Association", "", "bitacora", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_SpRegistrarVenta, C.CE_Venta, "venta que crearia", "Composition", "composition", "procedimiento", "venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_SpRegistrarVenta, C.CE_VentaItem, "items que crearia", "Composition", "composition", "procedimiento", "item de venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_SpRegistrarVenta, C.CE_Usuario, "usuario que recibe", "Association", "", "procedimiento", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_SpRegistrarVenta, C.CE_Sucursal, "sucursal del argumento", "Dependency", "uses", "procedimiento", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_SpRegistrarVenta, C.CE_InventarioStock, "stock con FOR UPDATE", "Dependency", "uses", "procedimiento", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_SpRegistrarVenta, C.CE_ProductoTallaColor, "prenda del argumento", "Dependency", "uses", "procedimiento", "prenda", "1", "0..*");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("4 actores, " + DEF.length + " clases y " + TOTAL_REL + " relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (4), CTR_ controlador (2), SRV_ servicio (6), CE_ entidad o DTO (" + (DEF.length - 12) + ").");
        N.push("");
        N.push("HALLAZGO CRITICO 1: EL CASO DICE QUE HAY DOS PASOS. HAY UN SOLO CLIC.");
        N.push("");
        N.push("El caso describe el paso 6 como pulsar Confirmar Venta, que crea la venta Pendiente, y");
        N.push("el paso 7 como ver el total y pulsar Procesar Pago, que continua en CU37. En el codigo");
        N.push("no hay dos pasos: hay un unico formulario con un unico boton, y ese boton se llama");
        N.push("");
        N.push("  Procesar Pago · {total}                                        // AdminCaja.tsx:641");
        N.push("");
        N.push("y el mismo manejador hace las dos llamadas, una detras de otra:");
        N.push("");
        N.push("  const procesarVenta = async (e: FormEvent) => {                // linea 230");
        N.push("    const res = await api.crearVentaPresencial({...});          // linea 236  -> CU36");
        N.push("    if (metodoPago === 'Efectivo') {");
        N.push("      const cobro = await api.procesarPagoCaja({...});          // linea 246  -> CU37");
        N.push("      if (cobro.estado !== 'Completada') throw new Error('No se pudo completar el cobro.');");
        N.push("    } else {");
        N.push("      const cobro = await api.procesarPagoCaja({...});          // linea 262  -> CU37");
        N.push("      if (cobro.estado !== 'Pendiente' || !cobro.terminal_url) throw new Error(...);");
        N.push("    }");
        N.push("    setItems([]);                                                // linea 277");
        N.push("  };");
        N.push("");
        N.push("O sea que CU36 y CU37 son un unico caso de uso en la interfaz, aunque sean dos");
        N.push("endpoints y dos casos de uso en la especificacion. El caso no esta equivocado en el");
        N.push("API, que si tiene los dos pasos, sino en la pantalla.");
        N.push("");
        N.push("Y de ahi sale el problema real. Si crearVentaPresencial tiene exito y");
        N.push("procesarPagoCaja falla, el catch muestra el error y el return temprano deja la venta");
        N.push("Pendiente ya creada, pero los setItems([]) de la linea 277 no llegan a ejecutarse:");
        N.push("el formulario sigue lleno. El cajero ve un error, le da otra vez al boton, y se crea");
        N.push("una SEGUNDA venta. Eso es exactamente el E8 que el caso dice que esta resuelto con");
        N.push("el boton en loading, y no: el loading evita el doble clic, no el reintento tras un");
        N.push("fallo. Es el camino de doble venta que el caso descarta.");
        N.push("");
        N.push("HALLAZGO 2: LA BUSQUEDA DE PRENDAS DUPLICA LAS FILAS.");
        N.push("");
        N.push("buscarProductosPos (linea 305) hace un LEFT JOIN con producto_precios:");
        N.push("");
        N.push("  LEFT JOIN producto_precios pp ON pp.id_ptc = ptc.id_ptc");
        N.push("     AND pp.fecha_inicio <= CURRENT_DATE");
        N.push("     AND (pp.fecha_fin IS NULL OR pp.fecha_fin >= CURRENT_DATE)");
        N.push("");
        N.push("sin ninguna clausula que deje una sola fila por prenda, porque no hay DISTINCT, no");
        N.push("hay agrupacion y no hay LIMIT por grupo. Si un id_ptc tiene dos filas de precio que");
        N.push("se solapan en el tiempo, el join devuelve DOS filas para la misma prenda, con dos");
        N.push("precios distintos, y las dos salen en el listado de la caja. Y dos filas de precio");
        N.push("solapadas son posibles porque producto_precios no tiene ningun indice que lo impida:");
        N.push("no hay EXCLUDE por rango ni indice unico parcial. O sea que el fallo depende de los");
        N.push("datos, y llega justo a la pantalla donde el cajero cobra.");
        N.push("");
        N.push("Y el mismo servicio resuelve el precio vigente de TRES maneras distintas, en tres");
        N.push("sitios, para la misma regla de negocio:");
        N.push("");
        N.push("  SRV_CarritoService.precioVigente  ORDER BY id_precio DESC LIMIT 1   -> determinista");
        N.push("  buscarProductosPos                LEFT JOIN sin LIMIT               -> duplica filas");
        N.push("  crearVentaPresencial             LEFT JOIN con LIMIT 1 sin ORDER BY -> precio arbitrario");
        N.push("");
        N.push("La tercera es la mas delicada, porque es la que cobra: si hay dos precios");
        N.push("solapados, la venta presencial carga uno u otro segun el plan de ejecucion de");
        N.push("Postgres, y el cajero no tiene forma de saber cual. Y el caso dice que el precio");
        N.push("vigente se determina de producto_precios o del precio_base, lo cual es cierto, pero");
        N.push("no dice cual de los dos precios cuando hay mas de uno. Es la septima aparicion de la");
        N.push("misma regla en dos capas, tras el total de CU21, el filtro de CU25, el esCancelable");
        N.push("de CU29, el badge de CU30, el IVA de CU34 y la firma de CU35.");
        N.push("");
        N.push("HALLAZGO 3: EL CONTROL DE STOCK NO BLOQUEA NADA, Y ESTA AL LADO DEL QUE SI LO HACE.");
        N.push("");
        N.push("En crearVentaPresencial el stock se comprueba en la linea 484:");
        N.push("");
        N.push("  const disponible = Number(prenda.cantidad_disponible ?? 0);");
        N.push("  if (p.cantidad > disponible) throw new ConflictException('Stock insuficiente de ...');");
        N.push("");
        N.push("Eso es una lectura normal, sin FOR UPDATE, y esta fuera de la transaccion, que");
        N.push("empieza mas abajo en la linea 513 y solo cubre el INSERT de la venta y el de los");
        N.push("items. O sea que el stock no se bloquea en ningun momento.");
        N.push("");
        N.push("El contraste es que CU35, en el servicio de pagos, hace exactamente esto:");
        N.push("");
        N.push("  SELECT id_ptc, cantidad_disponible, cantidad_reservada");
        N.push("   FROM inventario_stock");
        N.push("   WHERE id_ptc = $1 AND id_sucursal = $2");
        N.push("   FOR UPDATE;");
        N.push("");
        N.push("Misma tabla, misma operacion, misma empresa, dos disciplinas distintas. Y el punto");
        N.push("de la carrera es precisamente el del POS: una caja con dos cajeros y la ultima");
        N.push("prenda del talon. Los dos leen disponible = 1, los dos pasan el control, los dos");
        N.push("crean su venta Pendiente, y la reserva se pierde. En el POS eso es un cliente que");
        N.push("se va con la prenda y una venta que no se puede cobrar.");
        N.push("");
        N.push("Y hay una segunda diferencia con el procedimiento abandonado, en el hallazgo 5.");
        N.push("");
        N.push("HALLAZGO 4: LAS COLUMNAS DEL IVA SIGUEN SIN EXISTIR. UNA MAS DE CADA UNA.");
        N.push("");
        N.push("Las tres consultas del POS leen las dos columnas inexistentes, o sea que las tres");
        N.push("rutas de este caso devuelven 500:");
        N.push("");
        N.push("  linea 325  buscarProductosPos     SELECT ... p.porcentaje_iva, cat.porcentaje_iva_default");
        N.push("  linea 457  crearVentaPresencial   SELECT ... p.porcentaje_iva, cat.porcentaje_iva_default");
        N.push("");
        N.push("Es la novena y la decima aparicion. El conteo del proyecto son 10 sitios de");
        N.push("consulta o calculo repartidos en 7 archivos, entre ellos AdminCaja.tsx, que es este");
        N.push("caso. Y el origen es el mismo de siempre: schema.sql no tiene ni un ALTER TABLE.");
        N.push("");
        N.push("Lo que cambia con CU36 es who lo sobrevive. En CU34 la columna rota estaba en la");
        N.push("consulta del checkout, y en CU35 vimos que arrastra tambien al comprobante. Ahora");
        N.push("esta en el catalogo de la caja, o sea que el POS no puede ni BUSCAR una prenda, y");
        N.push("sin busqueda no hay venta. El fallo de CU36 no es solo del checkout y del");
        N.push("comprobante: es de la operacion de caja entera.");
        N.push("");
        N.push("HALLAZGO 5: HAY UNA IMPLEMENTACION DEL CASO EN SQL. ESTA MUERTA Y ES MEJOR.");
        N.push("");
        N.push("schema.sql:662 define sp_registrar_venta, con el comentario PROCEDIMIENTO:");
        N.push("Registrar venta (CU36-CU39), y con la firma que el caso describe:");
        N.push("");
        N.push("  p_id_usuario, p_id_sucursal, p_modalidad, p_metodo_pago, p_items JSONB,");
        N.push("  OUT p_venta_id, OUT p_total");
        N.push("");
        N.push("No tiene ni una sola llamada en el proyecto. Y en cuatro cosas es mas correcta que");
        N.push("el codigo que si corre:");
        N.push("");
        N.push("  1. Bloquea el stock de verdad, con la misma linea FOR UPDATE que CU35:");
        N.push("     SELECT cantidad_disponible - cantidad_reservada INTO v_stock");
        N.push("      FROM inventario_stock WHERE ... FOR UPDATE;");
        N.push("  2. Resta tambien cantidad_reservada, y el codigo de NestJS solo mira");
        N.push("     cantidad_disponible. O sea que la version muerta descuenta lo reservado y la");
        N.push("     viva no, que es al reves de como deberia ser.");
        N.push("  3. Valida el stock con RAISE EXCEPTION, que aborta la funcion entera.");
        N.push("  4. Emite el movimiento de inventario, que es lo que hace que el trigger descuente.");
        N.push("");
        N.push("Y en tres cosas es peor, o esta desalineada con el caso:");
        N.push("");
        N.push("  1. Inserta la venta ya Completada, con estado Completada en el propio INSERT, o");
        N.push("     sea que se salta el estado Pendiente y con el CU37 entero. El caso dice");
        N.push("     Pendiente, y el codigo vivo tambien dice Pendiente.");
        N.push("  2. No calcula impuestos: pone impuestos = 0 y total = subtotal. O sea que el");
        N.push("     unico camino que podria funcionar hoy cobra sin IVA, precisamente porque no");
        N.push("     toca la columna que no existe.");
        N.push("  3. Toma el precio del cliente: v_precio := (item->>'precio_unitario'), o sea que");
        N.push("     el precio lo manda el navegador. El codigo de NestJS lo vuelve a calcular en el");
        N.push("     servidor, que es lo correcto.");
        N.push("");
        N.push("Ademas inserta el comprobante con el numero C- mas el id de venta padded y con tipo");
        N.push("Factura fijo, sin mirar el NIT, mientras que SRV_ComprobantesService tiene una");
        N.push("numeracionCorrelativa y decide Factura o Boleta segun el NIT. Si alguien conectara");
        N.push("esta funcion, emits comprobantes con numeracion paralela.");
        N.push("");
        N.push("El proyecto entero tiene 8 rutinas creadas en schema.sql y solo 2 estan vivas, y");
        N.push("las dos por trigger, no por llamada desde TypeScript:");
        N.push("");
        N.push("  VIVA por trigger  trg_bloquear_usuario_5_intentos  -> fn_incrementar_intentos");
        N.push("  VIVA por trigger  trg_movimiento_inventario        -> fn_aplicar_movimiento_inventario");
        N.push("  MUERTA           sp_registrar_venta                 CU36-CU39, este caso");
        N.push("  MUERTA           sp_registrar_reserva               CU28");
        N.push("  MUERTA           sp_registrar_devolucion            CU40");
        N.push("  MUERTA           sp_registrar_recepcion             CU22");
        N.push("  MUERTA           fn_detectar_stock_bajo             ni siquiera tiene trigger");
        N.push("  MUERTA           fn_kardex_producto                 CU23, rotulada y sin usar");
        N.push("");
        N.push("Seis rutinas muertas, cuatro de ellas procedimientos escritos para casos de uso");
        N.push("concretos. fn_detectar_stock_bajo es la mas triste: no la llama nadie y no tiene");
        N.push("trigger, o sea que la alerta de stock bajo del proyecto no existe como codigo que");
        N.push("se ejecute.");
        N.push("");
        N.push("HALLAZGO 6: EL MISMO PERMISO INEXISTENTE, Y EL CAJERO TAMPOCO PUEDE.");
        N.push("");
        N.push("  private async exigirPermisoRegistrarVenta(usuario: Usuario): Promise<void> {");
        N.push("    const permisos = await this.cargarPermisos(usuario);");
        N.push("    if (!(permisos.includes('*') || permisos.includes('realizar_venta'))) {");
        N.push("      throw new ForbiddenException('No tienes permisos para registrar ventas.');");
        N.push("    }");
        N.push("  }");
        N.push("");
        N.push("Quinta aparicion de realizar_venta, que no esta en ninguno de los cinco roles de");
        N.push("schema.sql:573. Y aqui el desnivel con el caso es total, porque el caso nombra al");
        N.push("Cajero como el actor principal y tambien lo nombra en los actores permitidos. La");
        N.push("semilla del Cajero es:");
        N.push("");
        N.push("  ('Cajero', 'Procesa ventas y pagos en caja',");
        N.push("   '[\"procesar_pagos\",\"ver_inventario\",\"registrar_venta\",\"gestionar_devoluciones\"]', 'Activo')");
        N.push("");
        N.push("O sea que tiene registrar_venta y procesar_pagos, que son los dos nombres que");
        N.push("aparecen en los mensajes de error, y ninguno es el que se comprueba. Lo mismo que");
        N.push("en CU33, CU34 y CU35: el rol que deberia poder cobrar no puede, y el unico que");
        N.push("puede es el Administrador, que no esta en la caja. El mensaje de E1 del caso esta");
        N.push("bien copiado, lo que falla es la cadena.");
        N.push("");
        N.push("Y hay un segundo 403 que el caso no lista: sucursalDelEmpleado lanza");
        N.push("");
        N.push("  if (!fila) throw new ForbiddenException('Tu usuario no está asociado a una sucursal.');");
        N.push("");
        N.push("o sea que un Administrador sin fila en usuarios_empleados pasa el permiso y se");
        N.push("come este 403. Es el mismo segundo 403 de CU34, con el mismo patron.");
        N.push("");
        N.push("HALLAZGO 7: LA BUSQUEDA DE CLIENTES DEJA FUERA A LOS QUE NO TIENEN USUARIO.");
        N.push("");
        N.push("  SELECT c.id_cliente, c.nombre, c.telefono, c.direccion, u.email, u.ci");
        N.push("   FROM clientes c");
        N.push("   LEFT JOIN usuarios u ON u.id_usuario = c.usuario_id");
        N.push("   WHERE c.usuario_id IS NOT NULL");
        N.push("     AND (u.email ILIKE $1 OR u.ci ILIKE $1 OR c.nombre ILIKE $1)");
        N.push("");
        N.push("El filtro usuario_id IS NOT NULL deja fuera a todos los clientes que se dieron de");
        N.push("alta sin cuenta. Y el CI se busca en usuarios.ci, no en clientes, porque clientes no");
        N.push("tiene columna ci: el CI vive en el usuario. O sea que un cliente que dejo su CI en");
        N.push("la ficha y no tiene cuenta no aparece nunca en la busqueda, que es justo el caso de");
        N.push("uso que un cliente presencial tiene. El LEFT JOIN a usuarios es decorativo, porque");
        N.push("el WHERE descarta todo lo que el LEFT dejo a NULL.");
        N.push("");
        N.push("Y ojo con el nombre por defecto: el map devuelve f.nombre ?? 'Consumidor final', o");
        N.push("sea que un cliente con nombre NULL aparece como Consumidor final aunque tenga");
        N.push("usuario y CI. El caso dice que Consumidor final es lo que queda cuando no se");
        N.push("registra cliente, y en el codigo tambien puede ser un cliente real sin nombre, lo");
        N.push("que mezcla los dos conceptos en la misma pantalla.");
        N.push("");
        N.push("HALLAZGO 8: N+1 Y UNA CONSULTA POR ITEM.");
        N.push("");
        N.push("  for (const p of pedido) {");
        N.push("    const prenda = this.unaFila(await this.dataSource.query( una consulta de 9 tablas ... ));");
        N.push("  }");
        N.push("");
        N.push("Cada item del pedido dispara su propia consulta con nueve JOIN, mas una para el");
        N.push("cliente, mas un INSERT por item dentro de la transaccion. Una venta de diez prendas");
        N.push("son una decena de consultas grandes contra la base, y ademas abre una ventana de");
        N.push("tiempo entre la primera y la ultima, que es justo la ventana de la carrera de stock");
        N.push("del hallazgo 3. Con un unico WHERE id_ptc IN (...) se resolveria la consulta y se");
        N.push("cerraria ademas la ventana, sin necesidad de FOR UPDATE, porque la lectura seria");
        N.push("atomica.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - El POST de venta presencial SI va en transaccion para la venta y los items, y la");
        N.push("    bitacora se queda fuera en la linea 537, igual que en CU34 y CU35. Novena");
        N.push("    aparicion del patron, y aqui la consecuencia es la de CU34: si la bitacora");
        N.push("    falla, la venta queda creada y el cajero ve un error.");
        N.push("  - La bitacora vuelve a ser la unica fuente del NIT. CU38 lo recupera con");
        N.push("    new_data->>'nit_cliente' de la bitacora, y en CU36 pasa lo mismo que en CU34: si");
        N.push("    esa escritura falla, el comprobante sale como BOLETA para un cliente con NIT.");
        N.push("    Y el DTO no valida @MaxLength, mientras que comprobantes.razon_social es");
        N.push("    VARCHAR(150) y nit_cliente VARCHAR(30).");
        N.push("  - El caso dice que el body tiene cinco campos. El DTO tiene seis: ademas de items,");
        N.push("    id_cliente, metodo_pago, nit_cliente y razon_social, esta proveedor_pasarela con");
        N.push("    @IsIn(['LIBELULA','STRIPE']). El caso no la menciona y es obligatoria en el DTO,");
        N.push("    o sea que sin ella la peticion no pasa la validacion aunque no se use en el POS.");
        N.push("  - E6 y E3 tienen doble validacion, y es la septima vez que aparece el patron. El");
        N.push("    @IsIn del metodo de pago corta con 400 y deja inalcanzable el 422 de la linea");
        N.push("    405, y el @IsArray corta con 400 el 422 de la linea 412. El caso dice 422 en los");
        N.push("    dos casos, y el 400 solo aparece si se mandan los tipos equivocados.");
        N.push("  - E4 tiene dos causas con el mismo mensaje. Una prenda inexistente da Prenda no");
        N.push("    encontrada. y un producto con estado distinto de activo tambien, en la linea 480,");
        N.push("    con el mismo 422. O sea que una prenda desactivada se reporta como inexistente,");
        N.push("    lo cual es defendible por seguridad pero confunde al cajero que la acaba de buscar.");
        N.push("  - Cliente no encontrado. con 422 (linea 425) no esta en la lista de excepciones.");
        N.push("  - El POS no comprueba el estado de la sucursal. El checkout de CU34 si exige");
        N.push("    estado activa; aqui la sucursal sale de usuarios_empleados y se usa tal cual, sin");
        N.push("    mirar si esta Activa. O sea que una caja de una sucursal cerrada sigue cobrando.");
        N.push("  - sucursalDelEmpleado en ventas SI filtra por fecha_baja, al contrario que la copia");
        N.push("    de pagos. La diferencia entre las dos copias es la que hace que un empleado dado");
        N.push("    de baja conserve la caja en pagos y no en ventas.");
        N.push("  - El nombre del archivo del controlador del POS es Ctr_Pos.ts, con minúscula en el");
        N.push("    prefijo, al lado de CTR_Ventas.ts en el mismo directorio. Es el mismo desajuste");
        N.push("    de nombres del modulo de sesiones-ra de CU32.");
        N.push("  - El filtro del listado es p.estado = 'Activo' AND ptc.estado_stock <> 'Sin stock'.");
        N.push("    El <> excluye Sin stock pero deja pasar cualquier otro valor futuro, y el");
        N.push("    default de estado_stock es Disponible, no Sin stock, asi que un ptc recien creado");
        N.push("    aparece en la caja sin stock. El stock se muestra en 0 y el agregar lo limita.");
        N.push("  - agregarItem en el cliente limita la cantidad a lo disponible, con tope = min(1,");
        N.push("    disponible, cantidad + 1), y cambiarCantidad recorta al tope. O sea que la");
        N.push("    proteccion de stock esta en la interfaz, que es el mismo patron de E8 de todos");
        N.push("    los casos: la validacion real vive en el navegador.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU36 - REGISTRAR VENTA PRESENCIAL EN POS - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de " + TOTAL_ATR);
    T.push("Operaciones reales: " + totalOpe + " de " + TOTAL_OPE);
    T.push("CONECTORES DIBUJADOS: " + conEnDiagrama + " de " + TOTAL_REL);
    if (conEnDiagrama < TOTAL_REL) T.push("  FALTAN LINEAS. Reejecuta el script: es idempotente y las coloca.");
    T.push("Clases completas: " + conReal.length + " -> " + conReal.join(", "));
    for (var l = 0; l < INFORME.length; l++) T.push(INFORME[l]);
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
    msg = msg + "CU36 - Registrar venta presencial en POS" + SALTO + SALTO;
    msg = msg + "El caso dice dos pasos (Confirmar Venta, Procesar" + SALTO;
    msg = msg + "Pago). El codigo hace los dos en UN SOLO clic, y si" + SALTO;
    msg = msg + "el cobro falla la venta queda creada y el formulario" + SALTO;
    msg = msg + "lleno: el cajero puede vender dos veces." + SALTO + SALTO;
    msg = msg + "Clases: " + DEF.length + "    Actores: 4    Relaciones: " + TOTAL_REL + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de " + TOTAL_ATR + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de " + TOTAL_OPE + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de " + TOTAL_REL + SALTO;
    if (conEnDiagrama < TOTAL_REL) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "El stock no se bloquea, pero CU35 si lo hace." + SALTO;
    msg = msg + "sp_registrar_venta esta muerta y es mejor que el codigo." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU36 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU36 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU36", 0); } catch (e3) { }
}
