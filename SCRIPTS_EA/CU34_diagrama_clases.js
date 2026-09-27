// ================================================================
// CU34 - REALIZAR COMPRA DIGITAL
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   api/src/modulos/ventas/CTR_Ventas.ts:70            @Controller('ventas'), 2 rutas
//   api/src/modulos/ventas/CTR_Ventas.ts:18            CheckoutRequest con 6 campos
//   api/src/modulos/ventas/SRV_VentasService.ts:110    crearCompraDigital
//   api/src/modulos/ventas/SRV_VentasService.ts:235    SI usa dataSource.transaction
//   api/src/modulos/ventas/SRV_VentasService.ts:265    bitacora FUERA de la transaccion
//   api/src/modulos/ventas/SRV_VentasService.ts:14     interface CheckoutDTO
//   api/src/modulos/pagos/CTR_Pagos.ts:77              @Controller('pagos') = CU35
//   api/src/modulos/pagos/SRV_PagosService.ts:200      devuelve checkout_url
//   api/src/modulos/pagos/SRV_PagosService.ts:701      carrito -> 'Convertido a venta'
//   api/src/main.ts:22                                 ValidationPipe whitelist:true
//   web/src/pages/Checkout.tsx:25                      TASA_IVA_ESTIMADA = 0.13
//   web/src/pages/Checkout.tsx:69                      Checkout, 574 lineas, 3 pasos
//   web/src/lib/api.ts:1828                            api.checkout, id_sucursal opcional
//   web/src/router.tsx:54                              /checkout
//   schema.sql:179  categorias      SIN porcentaje_iva_default
//   schema.sql:223  productos        SIN porcentaje_iva
//   schema.sql:384  ventas           SIN nit_cliente ni razon_social
//   schema.sql:399  venta_items      con subtotal
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
var TOTAL_REL = 77;
var TOTAL_ATR = 130;
var TOTAL_OPE = 34;

var DEF = [
    ["IU_Checkout", "EXISTE. web/src/pages/Checkout.tsx, 574 lineas", "3 pasos; el IVA lo estima con 0.13 fijo",
     [["paso", "Integer = 1|2|3", VIS_PUB], ["modalidad", "String = Retiro", VIS_PUB], ["metodoPago", "String = Tarjeta", VIS_PUB], ["proveedor", "String = LIBELULA", VIS_PUB], ["idSucursal", "Integer = null", VIS_PUB], ["sucursales", "Array", VIS_PUB], ["nit", "String", VIS_PUB], ["razonSocial", "String", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["creandoPago", "Boolean", VIS_PUB], ["ventaOk", "Boolean", VIS_PUB], ["idVentaCreada", "Integer = null", VIS_PUB], ["error", "String = null", VIS_PUB], ["opcionPago", "String = tarjeta", VIS_PUB], ["subtotal", "Number", VIS_PUB], ["impuestosEstimados", "Number", VIS_PUB], ["totalEstimado", "Number", VIS_PUB]],
     [["confirmar", "void", [], VIS_PUB], ["iniciarPago", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_CartContext", "EXISTE. contexts/CartContext.tsx", "aporta el id_carrito y el subtotal del paso 1",
     [["carrito", "Object", VIS_PUB], ["subtotal", "Number", VIS_PUB]],
     [["refrescar", "void", [], VIS_PUB], ["useCart", "Object", [], VIS_PUB]]],

    ["IU_Api", "EXISTE. web/src/lib/api.ts", "checkout, consultarCarrito y crearTransaccion",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["checkout", "RespuestaCheckout", ["body"], VIS_PUB], ["consultarCarrito", "Object", [], VIS_PUB], ["crearTransaccion", "Object", ["idVenta", "metodo", "proveedorPasarela"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["IU_PanelCarrito", "EXISTE. panel lateral del carrito (CU33)", "el boton Ir a pagar que abre /checkout",
     [["carrito", "Object", VIS_PUB]],
     [["irAlCheckout", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["CTR_VentasController", "EXISTE. ventas/CTR_Ventas.ts", "ruta ventas; JwtAuthGuard, NO el opcional del carrito",
     [["ventasService", "VentasService", VIS_PRI]],
     [["checkout", "Object", ["body", "usuario", "request"], VIS_PUB], ["ventaPresencial", "Object", ["body", "usuario", "request"], VIS_PUB]]],

    ["CTR_PagosController", "EXISTE. pagos/CTR_Pagos.ts (CU35)", "crearTransaccion devuelve checkout_url",
     [["pagosService", "PagosService", VIS_PRI]],
     [["crearTransaccion", "Object", ["body", "usuario", "request"], VIS_PUB], ["consultarEstado", "Object", ["idTransaccion"], VIS_PUB]]],

    ["SRV_VentasService", "EXISTE. ventas/SRV_VentasService.ts", "10 metodos; el unico que envuelve en transaccion",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermisoVenta", "void", ["usuario"], VIS_PRI], ["exigirPermisoRegistrarVenta", "void", ["usuario"], VIS_PRI], ["sucursalDelEmpleado", "Number", ["usuario"], VIS_PRI], ["clienteDe", "Number", ["usuario"], VIS_PRI], ["crearCompraDigital", "Object", ["usuario", "dto", "request"], VIS_PUB], ["buscarProductosPos", "Object", ["usuario", "busqueda"], VIS_PUB], ["buscarClientesPos", "Array", ["usuario", "busqueda", "limite"], VIS_PUB], ["crearVentaPresencial", "Object", ["usuario", "dto", "request"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "EXISTE. seguridad/dependencias.ts", "aqui SI exige token; el carrito usaba el opcional",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_UsuarioActual", "EXISTE. seguridad/dependencias.ts", "inyecta el Usuario ya resuelto por el guard",
     [],
     [["UsuarioActual", "Usuario", ["datos", "contexto"], VIS_PUB]]],

    ["SRV_ValidationPipe", "EXISTE. api/src/main.ts:22", "whitelist:true elimina lo que el DTO no declare",
     [],
     [["validate", "Object", ["value", "metadatos"], VIS_PUB], ["transform", "Boolean", ["value", "metadatos"], VIS_PUB]]],

    ["SRV_BitacoraService", "EXISTE. seguridad/SRV_BitacoraService.ts", "se invoca fuera de la transaccion de la venta",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "query para leer y transaction para escribir",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "Object", ["callback"], VIS_PUB], ["getRepository", "Repository", ["entidad"], VIS_PUB]]],

    ["CE_CheckoutRequest", "EXISTE. ventas/CTR_Ventas.ts:17", "6 campos; el caso de uso solo lista 5",
     [["id_carrito", "Integer", VIS_PUB], ["id_sucursal", "Integer = opcional", VIS_PUB], ["modalidad", "String = Retiro|Entrega", VIS_PUB], ["metodo_pago", "String = Tarjeta|QR|Transferencia", VIS_PUB], ["nit_cliente", "String = opcional", VIS_PUB], ["razon_social", "String = opcional", VIS_PUB]],
     []],

    ["CE_CheckoutDTO", "EXISTE. SRV_VentasService.ts:14", "el tipo interno; identico al request",
     [["id_carrito", "Integer", VIS_PUB], ["id_sucursal", "Integer = opcional", VIS_PUB], ["modalidad", "String = Retiro|Entrega", VIS_PUB], ["metodo_pago", "String = Tarjeta|QR|Transferencia", VIS_PUB], ["nit_cliente", "String = opcional", VIS_PUB], ["razon_social", "String = opcional", VIS_PUB]],
     []],

    ["CE_Venta", "EXISTE. tabla ventas (schema.sql:384)", "estado por defecto Completada; el codigo escribe Pendiente",
     [["id_venta", "Integer = PK", VIS_PRI], ["id_cliente", "Integer", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["id_carrito", "Integer", VIS_PUB], ["modalidad", "String = NOT NULL, 20", VIS_PUB], ["metodo_pago", "String = 30", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB], ["impuestos", "Decimal(12,2)", VIS_PUB], ["total", "Decimal(12,2)", VIS_PUB], ["estado", "String = 20", VIS_PUB], ["fecha_venta", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_VentaItem", "EXISTE. tabla venta_items (schema.sql:399)", "si guarda el subtotal por linea, a diferencia del carrito",
     [["id_venta_item", "Integer = PK", VIS_PRI], ["id_venta", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["precio_unitario", "Decimal(10,2)", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB]],
     []],

    ["CE_Carrito", "EXISTE. tabla carritos (schema.sql:368)", "sin columna token_invitado; el checkout exige id_usuario",
     [["id_carrito", "Integer = PK", VIS_PRI], ["id_usuario", "Integer = nullable", VIS_PUB], ["estado", "String = Activo", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["fecha_creacion", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_CarritoItem", "EXISTE. tabla carrito_items (schema.sql:376)", "el precio_unitario congelado en CU33 es el que se cobra",
     [["id_carrito_item", "Integer = PK", VIS_PRI], ["id_carrito", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer = 1", VIS_PUB], ["precio_unitario", "Decimal(10,2)", VIS_PUB]],
     []],

    ["CE_Cliente", "EXISTE. tabla clientes (schema.sql:87)", "usuario_id es UNIQUE: un cliente por usuario, como maximo",
     [["id_cliente", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["direccion", "Text", VIS_PUB], ["fecha_registro", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. tabla usuarios", "el que compra; debe tener fila en clientes o da 403",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120", VIS_PRI], ["estado", "String", VIS_PUB]],
     []],

    ["CE_Rol", "EXISTE. tabla roles; permisos_json en schema.sql:573", "realizar_venta NO esta en ninguno de los 5 roles",
     [["id_rol", "Integer = PK", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["descripcion", "String", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "EXISTE. tabla usuarios_roles", "cargarPermisos solo lee la PRIMERA fila de esta union",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_Producto", "EXISTE. tabla productos (schema.sql:223)", "NO tiene columna porcentaje_iva y el servicio la lee",
     [["id_producto", "Integer = PK", VIS_PRI], ["codigo", "String = 40 UNIQUE", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["descripcion", "Text", VIS_PUB], ["id_categoria", "Integer", VIS_PUB], ["id_temporada", "Integer", VIS_PUB], ["precio_base", "Decimal(10,2) NOT NULL", VIS_PUB], ["modelo_3d_url", "Text", VIS_PUB], ["estado", "String = Disponible", VIS_PUB], ["fecha_registro", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_Categoria", "EXISTE. tabla categorias (schema.sql:179)", "NO tiene columna porcentaje_iva_default",
     [["id_categoria", "Integer = PK", VIS_PRI], ["nombre", "String = 80 UNIQUE", VIS_PUB], ["descripcion", "Text", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. tabla producto_talla_color (schema.sql:237)", "estado_stock debe ser Disponible o el checkout da 409",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB], ["estado_stock", "String = Disponible", VIS_PUB]],
     []],

    ["CE_InventarioStock", "EXISTE. tabla inventario_stock", "LEFT JOIN: si no hay fila, disponible es 0 y hay 409",
     [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer = UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer = UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_reservada", "Integer = 0", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB], ["stock_minimo_alert", "Integer = 0", VIS_PUB]],
     []],

    ["CE_Sucursal", "EXISTE. tabla sucursales", "el codigo exige estado 'activa' en femenino",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_Talla", "EXISTE. tabla tallas", "JOIN interior: sin talla no aparece el item",
     [["id_talla", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["orden", "Integer", VIS_PUB]],
     []],

    ["CE_Color", "EXISTE. tabla colores", "JOIN interior: sin color no aparece el item",
     [["id_color", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["codigo_hex", "String", VIS_PUB]],
     []],

    ["CE_BitacoraAuditoria", "EXISTE. tabla bitacora_auditoria (schema.sql:148)", "recibe nit_cliente y razon_social, la venta no",
     [["id_bitacora", "Integer = PK", VIS_PRI], ["id_usuario", "Integer = ON DELETE SET NULL", VIS_PUB], ["accion_sql", "String = 40", VIS_PUB], ["tabla_afectada", "String = 80", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "INET", VIS_PUB], ["user_agent", "String = 255", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Cliente", "Cliente autenticado. OJO: da 403", "NO tiene realizar_venta"],
    ["ACTOR_Cajero", "Cajero. OJO: da 403", "NO tiene realizar_venta"],
    ["ACTOR_Administrador", "Administrador. Unico que pasa el permiso", "wildcard *"],
    ["ACTOR_SistemaPasarela", "CU35, sistema de pagos", "continuador del flujo"]
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
    var mod = buscarPaquete(cu, "10. Carrito y Checkout");
    if (mod == null) mod = buscarPaquete(cu, "4. Ventas y Pagos");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU34 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU34 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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

        var C = clases;

        conEnDiagrama += relacion(diag, actores[0], C[0], "confirma la compra", "Association", "", "cliente", "checkout", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C[3], "pulsa Ir a pagar", "Association", "", "cliente", "panel", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C[4], "compra por HTTP", "Association", "", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C[4], "cobra en el punto de caja", "Association", "", "cajero", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[2], C[4], "único que pasa el permiso", "Association", "", "administrador", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[3], C[5], "aprueba el pago", "Association", "", "pasarela", "endpoint", "1", "0..1");

        conEnDiagrama += relacion(diag, C[0], C[1], "estado del carrito", "Dependency", "uses", "checkout", "contexto", "1", "1");
        conEnDiagrama += relacion(diag, C[0], C[2], "cliente HTTP", "Dependency", "uses", "checkout", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[0], C[13], "DTO de la petición", "Association", "", "checkout", "dto", "1", "1");
        conEnDiagrama += relacion(diag, C[0], C[14], "venta creada mostrada", "Association", "", "checkout", "venta", "1", "0..1");
        conEnDiagrama += relacion(diag, C[0], C[15], "items del resumen", "Association", "", "checkout", "item", "0..*", "1");
        conEnDiagrama += relacion(diag, C[1], C[2], "consulta previa", "Dependency", "uses", "contexto", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[2], C[4], "punto de acceso HTTP", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, C[2], C[5], "punto de acceso de pagos", "Dependency", "uses", "cliente", "pagos", "1", "0..1");
        conEnDiagrama += relacion(diag, C[2], C[12], "cuerpo de entrada", "Association", "", "cliente", "cuerpo", "1", "0..1");
        conEnDiagrama += relacion(diag, C[2], C[14], "venta pagada", "Association", "", "cliente", "venta", "1", "0..1");
        conEnDiagrama += relacion(diag, C[3], C[0], "abre el checkout", "Dependency", "uses", "panel", "checkout", "0..*", "1");

        conEnDiagrama += relacion(diag, C[4], C[7], "guard obligatorio", "Dependency", "uses", "controlador", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[8], "usuario resuelto", "Dependency", "uses", "controlador", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[9], "filtro de entrada", "Dependency", "uses", "controlador", "filtro", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[6], "servicio de ventas", "Association", "", "controlador", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[12], "cuerpo de entrada", "Association", "", "controlador", "cuerpo", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[13], "DTO mapeado", "Association", "", "controlador", "dto", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[6], "servicio de pagos", "Association", "", "pagos", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[14], "transicion a Pagada", "Association", "", "pagos", "venta", "0..*", "1");
        conEnDiagrama += relacion(diag, C[5], C[16], "carrito a Convertido a venta", "Association", "", "pagos", "carrito", "0..*", "1");

        conEnDiagrama += relacion(diag, C[6], C[7], "usuario del guard", "Association", "", "ventas", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[10], "auditoria de la venta", "Association", "", "ventas", "auditor", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[11], "persistencia y transaccion", "Dependency", "uses", "ventas", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[13], "DTO recibido", "Dependency", "uses", "ventas", "dto", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[14], "venta creada", "Composition", "composition", "ventas", "venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C[6], C[15], "items de la venta", "Composition", "composition", "ventas", "item", "1", "0..*");
        conEnDiagrama += relacion(diag, C[6], C[16], "carrito a En pago", "Association", "", "ventas", "carrito", "1", "0..1");
        conEnDiagrama += relacion(diag, C[6], C[17], "items del carrito", "Dependency", "uses", "ventas", "item de carrito", "1", "0..*");
        conEnDiagrama += relacion(diag, C[6], C[18], "cliente de la venta", "Association", "", "ventas", "cliente", "0..*", "1");
        conEnDiagrama += relacion(diag, C[6], C[19], "usuario que compra", "Association", "", "ventas", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[20], "rol comprobado", "Dependency", "uses", "ventas", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C[6], C[21], "asignacion de rol", "Dependency", "uses", "ventas", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C[6], C[22], "producto del item", "Dependency", "uses", "ventas", "producto", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[23], "categoria del producto", "Dependency", "uses", "ventas", "categoria", "0..1", "1");
        conEnDiagrama += relacion(diag, C[6], C[24], "prenda del item", "Dependency", "uses", "ventas", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[25], "stock revalidado", "Dependency", "uses", "ventas", "stock", "0..*", "1");
        conEnDiagrama += relacion(diag, C[6], C[26], "sucursal validada", "Dependency", "uses", "ventas", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[27], "talla del mensaje", "Dependency", "uses", "ventas", "talla", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[28], "color del mensaje", "Dependency", "uses", "ventas", "color", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[29], "registro de auditoria", "Composition", "composition", "ventas", "bitacora", "1", "1");

        conEnDiagrama += relacion(diag, C[7], C[19], "usuario resuelto", "Association", "", "guard", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C[9], C[12], "clase validada", "Dependency", "uses", "filtro", "cuerpo", "1", "0..1");
        conEnDiagrama += relacion(diag, C[10], C[11], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[10], C[29], "fila de bitacora", "Composition", "composition", "auditor", "bitacora", "1", "1");
        conEnDiagrama += relacion(diag, C[10], C[19], "usuario de la accion", "Association", "", "auditor", "usuario", "0..1", "1");

        conEnDiagrama += relacion(diag, C[12], C[13], "mapeo del DTO", "Dependency", "uses", "cuerpo", "dto", "1", "1");
        conEnDiagrama += relacion(diag, C[12], C[24], "prenda del cuerpo", "Association", "", "cuerpo", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C[12], C[26], "sucursal del cuerpo", "Association", "", "cuerpo", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[13], C[24], "prenda del DTO", "Association", "", "dto", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C[13], C[26], "sucursal del DTO", "Association", "", "dto", "sucursal", "0..1", "1");

        conEnDiagrama += relacion(diag, C[14], C[18], "cliente facturado", "Association", "", "venta", "cliente", "0..1", "1");
        conEnDiagrama += relacion(diag, C[14], C[19], "usuario comprador", "Association", "", "venta", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C[14], C[26], "sucursal de la venta", "Association", "", "venta", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[14], C[16], "carrito de origen", "Association", "", "venta", "carrito", "0..1", "1");
        conEnDiagrama += relacion(diag, C[15], C[14], "venta del item", "Composition", "composition", "item", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C[15], C[24], "prenda vendida", "Association", "", "item", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C[16], C[19], "dueño del carrito", "Association", "", "carrito", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C[16], C[26], "sucursal del carrito", "Association", "", "carrito", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[17], C[16], "carrito del item", "Composition", "composition", "item de carrito", "carrito", "1", "1");
        conEnDiagrama += relacion(diag, C[17], C[24], "prenda del item", "Association", "", "item de carrito", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C[18], C[19], "usuario del cliente", "Association", "", "cliente", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C[19], C[20], "roles del usuario", "Association", "", "usuario", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C[19], C[21], "asignaciones", "Composition", "composition", "usuario", "asignacion", "1", "0..*");
        conEnDiagrama += relacion(diag, C[20], C[21], "usuarios del rol", "Association", "", "rol", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C[22], C[23], "categoria del producto", "Association", "", "producto", "categoria", "0..1", "1");
        conEnDiagrama += relacion(diag, C[24], C[22], "producto de la prenda", "Composition", "composition", "prenda", "producto", "1", "1");
        conEnDiagrama += relacion(diag, C[24], C[27], "talla de la prenda", "Association", "", "prenda", "talla", "0..1", "1");
        conEnDiagrama += relacion(diag, C[24], C[28], "color de la prenda", "Association", "", "prenda", "color", "0..1", "1");
        conEnDiagrama += relacion(diag, C[25], C[24], "stock por prenda", "Association", "", "stock", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C[25], C[26], "stock por sucursal", "Association", "", "stock", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C[29], C[19], "usuario de la accion", "Association", "", "bitacora", "usuario", "0..1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("4 actores, 30 clases y " + TOTAL_REL + " relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (4), CTR_ controlador (2), SRV_ servicio (6), CE_ entidad o DTO (18).");
        N.push("");
        N.push("HALLAZGO CRITICO 1: EL CHECKOUT DA 500 SIEMPRE. LAS COLUMNAS DEL IVA NO EXISTEN.");
        N.push("");
        N.push("Este caso es el tercero de la misma familia, despues de foto_resultado en CU32 y");
        N.push("token_invitado en CU33, y el mas grave de los tres porque la consulta rota es la");
        N.push("unica que lee el carrito, o sea que nada de lo que viene despues puede ejecutarse.");
        N.push("");
        N.push("La consulta de items (SRV_VentasService.ts:169) pide:");
        N.push("");
        N.push("  p.porcentaje_iva,             <-- productos NO tiene esta columna");
        N.push("  cat.porcentaje_iva_default,   <-- categorias NO tiene esta columna");
        N.push("");
        N.push("Y el esquema dice:");
        N.push("  schema.sql:223  productos   (codigo, nombre, descripcion, id_categoria, id_temporada,");
        N.push("                                  id_proveedor, precio_base, modelo_3d_url, estado,");
        N.push("                                  fecha_registro)");
        N.push("  schema.sql:179  categorias  (id_categoria, nombre, descripcion, estado)");
        N.push("");
        N.push("Y schema.sql no tiene ni un solo ALTER TABLE, que ya se comprobo en CU32. O sea que");
        N.push("Postgres responde 42703 column does not exist y POST /ventas/checkout devuelve 500");
        N.push("para cualquier usuario, con cualquier carrito, en cualquier escenario. El caso es");
        N.push("inexecutable de principio a fin.");
        N.push("");
        N.push("HALLAZGO CRITICO 2: NO ES UN FALLO DE CU34, ES DE TODO EL PROYECTO.");
        N.push("");
        N.push("Las mismas dos columnas se leen o se escriben en 6 servicios del backend:");
        N.push("");
        N.push("  ventas/SRV_VentasService.ts:171,172   checkout, POS y venta presencial");
        N.push("  ventas/SRV_VentasService.ts:325,457   busqueda del punto de caja");
        N.push("  catalogo/SRV_CatalogoService.ts:104,263   listado y precio_con_iva");
        N.push("  catalogo/SRV_CatalogosService.ts:460,497,541,557   alta, edicion y listado de");
        N.push("                                        categorias, con INSERT y UPDATE");
        N.push("  catalogo/SRV_ProductosService.ts:73,93,245   alta y edicion de productos, con");
        N.push("                                        INSERT INTO productos (..., porcentaje_iva, ...)");
        N.push("  comprobantes/SRV_ComprobantesService.ts:196,202   PDF con GROUP BY p.porcentaje_iva");
        N.push("  recomendaciones/SRV_RecomendacionesService.ts:184,207   precio con IVA");
        N.push("");
        N.push("Y en 5 archivos del frontend: api.ts, AdminCaja.tsx, AdminCatalogoProductos.tsx,");
        N.push("AdminCatalogos.tsx y los tipos de catalogo.");
        N.push("");
        N.push("Lo mas grave es SRV_ProductosService.ts:245, que hace INSERT INTO productos con la");
        N.push("columna del IVA. O sea que dar de alta un producto por la API falla siempre, y como");
        N.push("schema.sql tampoco siembra productos, la tabla productos esta vacia. Y de una tabla");
        N.push("vacia no hay catalogo, no hay id_ptc, no hay carrito de CU33 y no hay checkout de CU34.");
        N.push("El fallo de CU34 es la punta de una cadena que empieza en el alta de productos.");
        N.push("");
        N.push("Lo mismo con categorias: SRV_CatalogosService.ts:497 hace INSERT INTO categorias con");
        N.push("porcentaje_iva_default, asi que tampoco se puede crear ninguna categoria. El codigo");
        N.push("tiene hasta una validacion dedicada, validarIva, con un 13 por defecto:");
        N.push("");
        N.push("  const iva = Number(dto.porcentaje_iva_default ?? 13);");
        N.push("");
        N.push("O sea que hay una regla de negocio escrita, validada y con valor por defecto para una");
        N.push("columna que no existe. El 13 tambien aparece como respaldo en el comprobante y en el");
        N.push("frontend, lo cual confirma que el 13 por ciento es la tasa Boliviana que el proyecto");
        N.push("asume, y que ninguna de las dos columnas llega nunca a tener valor.");
        N.push("");
        N.push("HALLAZGO CRITICO 3: EL MISMO PERMISO INEXISTENTE DE CU33, Y EL 403 CAE EN EL PEOR SITIO.");
        N.push("");
        N.push("exigirPermisoVenta es una copia character por character del de CU33, incluido el");
        N.push("mismo fallo de cargarPermisos con const [fila] sobre un JOIN que devuelve una fila");
        N.push("por rol:");
        N.push("");
        N.push("  if (!(permisos.includes('*') || permisos.includes('realizar_venta'))) {");
        N.push("    throw new ForbiddenException('No tienes permisos para comprar.');");
        N.push("  }");
        N.push("");
        N.push("realizar_venta no esta en ninguno de los cinco roles de schema.sql:573, igual que en");
        N.push("CU33. Entonces:");
        N.push("");
        N.push("  Cliente   -> 403 No tienes permisos para comprar.");
        N.push("  Cajero    -> 403 No tienes permisos para comprar.");
        N.push("  Invitado  -> 401, porque aqui si se usa JwtAuthGuard y no el opcional del carrito");
        N.push("  Administrador -> pasa el permiso...");
        N.push("");
        N.push("...y ahi viene lo nuevo: despues del permiso se llama clienteDe, que exige una fila");
        N.push("en clientes:");
        N.push("");
        N.push("  const idCliente = await this.clienteDe(usuario);   // linea 116, antes de leer el carrito");
        N.push("");
        N.push("  SELECT id_cliente FROM clientes WHERE usuario_id = $1");
        N.push("  if (!fila) throw new ForbiddenException('Tu usuario no está registrado como cliente.');");
        N.push("");
        N.push("clientes.usuario_id es UNIQUE y esta tabla no se siembra, asi que la fila solo existe");
        N.push("para quien se dio de alta como cliente. El administrador es un empleado, no un cliente,");
        N.push("o sea que el unico rol que supera el permiso puede caer en este segundo 403. Y este");
        N.push("403 no esta en la lista de excepciones del caso, que solo menciona el de permisos.");
        N.push("");
        N.push("O sea que el checkout no lo puede hacer nadie: los roles de compra die 403 por el");
        N.push("permiso y el que lo pasa da 403 por no ser cliente. Y aunolinguna de las dos");
        N.push("excepciones es la misma, asi que el mensaje que ve el usuario es ambiguo.");
        N.push("");
        N.push("Nota ademas que exigirPermisoVenta y exigirPermisoRegistrarVenta son el mismo codigo");
        N.push("con distinto mensaje: los dos comparan '*' o 'realizar_venta'. El segundo solo lo usa");
        N.push("el punto de caja. O sea que hay dos funciones para una condicion, y elnombre del");
        N.push("permiso no coincide con ninguno de los dos mensajes.");
        N.push("");
        N.push("HALLAZGO 4: AQUI SI HAY TRANSACCION. ES LA PRIMERA VEZ EN TODO EL PROYECTO.");
        N.push("");
        N.push("El INSERT de ventas, los INSERT de venta_items y el UPDATE del carrito van dentro de");
        N.push("await this.dataSource.transaction(async (em) => { ... }). Es exactamente lo que");
        N.push("faltaba en CU21, CU28, CU29, CU30, CU32 y CU33, y aqui esta bien puesto: si falla un");
        N.push("venta_item, no queda ni la venta ni el cambio de estado del carrito.");
        N.push("");
        N.push("PERO la bitacora sigue estando fuera, en la linea 265, despues del cierre de la");
        N.push("transaccion. O sea que el defecto se reduce pero no desaparece: si bitacoraService.");
        N.push("registrar falla, la venta ya esta creada y el carrito ya esta en En pago, y el");
        N.push("cliente recibe un 500 con una venta que si existe. Un reintento vuelve a entrar, y");
        N.push("como se explica en el hallazgo 6, eso duplica la venta. Octava aparicion del patron,");
        N.push("pero la primera en que al menos la parte de negocio queda coherente.");
        N.push("");
        N.push("HALLAZGO 5: E8 NO SE CUMPLE. HAY UNA CARRERA ENTRE DOS CONFIRMACIONES.");
        N.push("");
        N.push("El caso dice que el boton en loading evita ventas duplicadas. En el servidor no hay");
        N.push("nada de eso. La secuencia real es:");
        N.push("");
        N.push("  linea 148  SELECT estado FROM carritos WHERE id_carrito = $1   -> lee 'Activo'");
        N.push("  linea 149  if (estado !== 'activo') throw 409");
        N.push("  ...muchas lineas y varias consultas mas...");
        N.push("  linea 235  transaction(begin)");
        N.push("  linea 238    INSERT INTO ventas ... RETURNING id_venta");
        N.push("  linea 260    UPDATE carritos SET estado = 'En pago' WHERE id_carrito = $1");
        N.push("  linea 263  transaction(commit)");
        N.push("");
        N.push("La comprobacion del estado esta FUERA de la transaccion y el UPDATE no lleva guarda:");
        N.push("");
        N.push("  UPDATE carritos SET estado = 'En pago' WHERE id_carrito = $1");
        N.push("");
        N.push("Falta el AND estado = 'Activo' y falta el SELECT ... FOR UPDATE. O sea que dos");
        N.push("peticiones que llegan juntas leen las dos 'Activo' antes de que ninguna escriba, y");
        N.push("las dosinsertan venta. El resultado son dos ventas con el mismo id_carrito y el");
        N.push("carrito en un solo estado. Es un TOCTOU clasico, y la transaccion no lo evita porque");
        N.push("la lectura que decide no esta dentro.");
        N.push("");
        N.push("El boton deshabilitado solo reduce la ventana, no la cierra: alcanza con un doble");
        N.push("clic, con dos pestanas abiertas o con un reintento automatico de red tras un timeout.");
        N.push("Y no hay indice unico sobre ventas.id_carrito que lo impide en la base, aunque la");
        N.push("columna existe. Con un indice unico parcial sobre ventas(id_carrito) el segundo");
        N.push("INSERT rebotaria solo, que es la forma barata de cerrar la carrera.");
        N.push("");
        N.push("HALLAZGO 6: nit_cliente y razon_social SE NORMALIZAN Y SE DESCARTAN.");
        N.push("");
        N.push("El caso dice que el paso 2 pide datos de factura opcionales. El codigo los recibe, los");
        N.push("limpia con trim y los pasa a null si vienen vacios, y a partir de ahi no los vuelve a");
        N.push("usar para nada. El INSERT de ventas (linea 238) no los incluye:");
        N.push("");
        N.push("  INSERT INTO ventas (id_cliente, id_usuario, id_sucursal, id_carrito, modalidad,");
        N.push("                               metodo_pago, subtotal, impuestos, total, estado, fecha_venta)");
        N.push("");
        N.push("Y no es que falten columnas: ventas (schema.sql:384) no tiene nit_cliente ni");
        N.push("razon_social, y donde si estan es en comprobantes (schema.sql:409), que es CU38.");
        N.push("Los unicos sitios donde sobreviven son el detalle de la bitacora y el new_data, o");
        N.push("sea que el NIT que el cliente escribio se puede auditar pero no se puede facturar.");
        N.push("");
        N.push("Y hay un detalle de validacion: nit_cliente y razon_social solo tienen @IsOptional y");
        N.push("@IsString, sin @MaxLength. En comprobantes razon_social es VARCHAR(150) y nit_cliente");
        N.push("es VARCHAR(30), asi que cuando CU38 los copie de la bitacora, un NIT de 40 caracteres");
        N.push("reventara el comprobante. El limite no se comprueba en ningun sitio del flujo.");
        N.push("");
        N.push("HALLAZGO 7: EL IVA SE CALCULA POR LINEA EN EL SERVIDOR Y CON UN 13 FIJO EN EL FRONT.");
        N.push("");
        N.push("El servidor, por cada item:");
        N.push("");
        N.push("  const ivaProducto  = Number(item.porcentaje_iva);");
        N.push("  const ivaCategoria = Number(item.porcentaje_iva_default ?? 0);");
        N.push("  const tasa = !Number.isNaN(ivaProducto) && ivaProducto > 0 ? ivaProducto : ivaCategoria;");
        N.push("  const imp = sub * (tasa / 100);");
        N.push("");
        N.push("Y el frontend:");
        N.push("");
        N.push("  const TASA_IVA_ESTIMADA = 0.13;                       // Checkout.tsx:25");
        N.push("  const impuestosEstimados = Math.round(subtotal * TASA_IVA_ESTIMADA * 100) / 100;");
        N.push("");
        N.push("Es la quinta vez que aparece la misma regla en dos capas, despues del total de CU21,");
        N.push("el filtro de CU25, el esCancelable de CU29 y el badge de CU30, y aqui es la que mas");
        N.push("duele porque es dinero. El paso 3 muestra al cliente ese total estimado, y si el");
        N.push("carrito tiene dos prendas con tasas distintas, el importe que ve y el que se cobra no");
        N.push("son el mismo. La UI lo admite con el texto Impuestos (estimados), lo cual es")
        N.push("honesto, pero no evita que la discrepancia exista.");
        N.push("");
        N.push("Detalle sobre Number(): si porcentaje_iva llega NULL, Number(null) es 0, no NaN, y 0");
        N.push("no es > 0, asi que cae a la tasa de la categoria. El fallback a Number(x ?? 0) solo");
        N.push("salva el undefined, que no se da. Ademas las dos columnas no existen, asi que hoy");
        N.push("esto no se ejecuta; queda como la logica que habria que revisar al arreglar el esquema.");
        N.push("");
        N.push("HALLAZGO 8: E6 DICE 422 PERO EL DTO RESPONDE 400.");
        N.push("");
        N.push("El caso lista las tres validaciones de E6 con 422. Las dos primeras las corta el DTO");
        N.push("con @IsIn, y el ValidationPipe de Nest lanza BadRequestException, que es 400:");
        N.push("");
        N.push("  @IsIn(['Retiro', 'Entrega'], { message: 'Modalidad de entrega inválida.' })");
        N.push("  @IsIn(['Tarjeta', 'QR', 'Transferencia'], { message: 'Método de pago inválido.' })");
        N.push("");
        N.push("Y en el servicio hay una segunda comprobacion con el MISMO texto:");
        N.push("");
        N.push("  const MODALIDADES = ['Retiro', 'Entrega'];            // linea 35");
        N.push("  if (!MODALIDADES.includes(modalidad)) throw new UnprocessableEntityException('Modalidad de entrega inválida.');");
        N.push("");
        N.push("Esa linea 119 es inalcanzable, porque el DTO ya habria devuelto 400. Es la sexta");
        N.push("aparicion del patron de doble validacion DTO mas servicio, y aqui se nota porque el");
        N.push("mismo mensaje aparece con dos codigos distintos segun por donde entre la peticion.");
        N.push("");
        N.push("La tercera de E6 si es 422 de verdad, pero con un matiz: el mensaje La sucursal");
        N.push("seleccionada no está disponible. aparece en dos sitios, en el @IsInt del DTO, que da");
        N.push("400, y en el servicio, que da 422. Si mandas id_sucursal como texto te dice 400, y");
        N.push("si lo mandas como numero de una sucursal inactiva te dice 422, con el mismo texto.");
        N.push("");
        N.push("HALLAZGO 9: E5 TIENE DOS MENSAJES Y EL CASO CONOCE UNO.");
        N.push("");
        N.push("El caso da un solo texto para E5. El codigo tiene dos, y el primero no esta en el caso:");
        N.push("");
        N.push("  if (estado_producto !== 'activo' || estado_stock !== 'disponible')");
        N.push("    -> 'El stock de X (talla, color) cambió. Ya no está disponible. Ajusta tu carrito e intenta de nuevo.'");
        N.push("");
        N.push("  if (disponible < cantidad)");
        N.push("    -> 'El stock de X (talla, color) cambió. Disponible: N (mínimo M). Ajusta tu carrito e intenta de nuevo.'");
        N.push("");
        N.push("El segundo tiene un sufijo que el caso no menciona, el minimo de stock_minimo_alert,");
        N.push("y solo aparece si ese valor es mayor que cero. Y ojo con el primero: compara");
        N.push("productos.estado contra 'activo', y el DEFAULT de esa columna es 'Disponible', no");
        N.push("Activo. La aplicacion siempre escribe 'Activo' al dar de alta, asi que hoy funciona,");
        N.push("pero cualquier producto insertado por SQL directo queda invisible para el catalogo");
        N.push("(LOWER(p.estado) = 'activo') y para el checkout al mismo tiempo. Es una bomba de")
        N.push("tiempo, no un fallo activo, y conviene saber que existe.");
        N.push("");
        N.push("HALLAZGO 10: el LEFT JOIN de inventario convierte una fila ausente en un 409.");
        N.push("");
        N.push("  LEFT JOIN inventario_stock ist ON ist.id_ptc = ci.id_ptc AND ist.id_sucursal = $2");
        N.push("");
        N.push("El LEFT JOIN es correcto para no perder items, pero si no hay fila de stock para esa");
        N.push("pareja, cantidad_disponible llega NULL y Number(item.cantidad_disponible ?? 0) da 0,");
        N.push("o sea que 0 < cantidad y el mensaje dice Disponible: 0. Es un 409 legitimo, aunque");
        N.push("el motivo real sea que el stock no esta dado de alta y no que se haya agotado. Y el");
        N.push("$2 es la sucursal del CHECKOUT, que puede ser distinta de la del carrito si el cliente");
        N.push("la cambio en el paso 2, o sea que aqui si se revalida contra la sucursal elegida.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - El caso describe el body con cinco campos y son seis. Falta id_sucursal, que si");
        N.push("    esta en el DTO, en api.ts y en Checkout.tsx, con @IsOptional. Como el ValidationPipe");
        N.push("    va con whitelist:true, si no estuviera declarado en la clase el campo se");
        N.push("    eliminaria de la peticion; al estar declarado, funciona. Lo que no se puede es");
        N.push("    cambiar de sucursal en el paso 2: se puede, y ademas es lo que dispara el 422.");
        N.push("  - El caso dice que el carrito puede estar 'En pago' o 'Convertido' en E4. El valor");
        N.push("    real que escribe CU35 es 'Convertido a venta' (SRV_PagosService.ts:701), no");
        N.push("    'Convertido'. Da igual porque la comprobacion es estado !== 'activo' y las dos");
        N.push("    formas dan 409, pero el vocabulario del caso no es el del codigo. El recorrido real");
        N.push("    es Activo -> En pago -> Convertido a venta, tres estados en un VARCHAR(20) sin CHECK.");
        N.push("  - El caso no menciona que el carrito se bloquea a En pago pero no a otro estado. Si el");
        N.push("    cliente vuelve al panel, cualquier operacion del carrito que exija estado Activo");
        N.push("    va a fallar con el 409 Este carrito ya fue procesado. No hay forma de cancelar la");
        N.push("    compra ni de reabrir el carrito, ni en este caso ni en el de pagos.");
        N.push("  - Antes de llamar al checkout, Checkout.tsx:159 hace api.consultarCarrito(), o sea");
        N.push("    una llamada a CU33, y si el carrito viene vacio lanza un ApiError(422) desde el");
        N.push("    cliente. O sea que Tu carrito está vacío. puede venir del navegador o del backend,");
        N.push("    y no hay forma de distinguirlo por el codigo. El texto es identico al del servicio.");
        N.push("  - El paso 3 no es de este caso: al confirmar se guarda idVentaCreada y la pantalla");
        N.push("    llama a api.crearTransaccion, que es CU35, y luego hace window.location.href =");
        N.push("    res.checkout_url. Ese checkout_url si lo devuelve el backend de pagos, apuntando a");
        N.push("    FRONTEND_URL/sandbox-pago?tx=..., o sea que el sandbox es del propio proyecto.");
        N.push("  - Exigir el permiso antes de leer el carrito significa que un 403 de permiso no");
        N.push("    revela nada, lo cual es correcto. Pero el orden inverso al habitual hace que el");
        N.push("    caso de uso presente el carrito como validado y la compra como autorizado, y en");
        N.push("    el codigo lo primero que se hace es permitir, y lo segundo es descobrir que el");
        N.push("    usuario no es cliente.");
        N.push("  - El servicio tiene 10 metodos y este caso solo describe crearCompraDigital. Los");
        N.push("    otros tres, buscarProductosPos, buscarClientesPos y crearVentaPresencial, son de");
        N.push("    CU36 y comparten el mismo servicio, asi que la duplicacion de exigirPermisoVenta");
        N.push("    aparece tambien alli.");
        N.push("  - Este modulo si respeta el prefijo SRV_ y CTR_ en los nombres de archivo, a");
        N.push("    diferencia del de sesiones-ra de CU32, que usa nombres sueltos.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU34 - REALIZAR COMPRA DIGITAL - INFORME");
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
    msg = msg + "CU34 - Realizar compra digital" + SALTO + SALTO;
    msg = msg + "ATENCION: porcentaje_iva y porcentaje_iva_default NO existen." + SALTO;
    msg = msg + "El checkout da 500 siempre, y 6 servicios lo comparten." + SALTO + SALTO;
    msg = msg + "Clases: 30    Actores: 4    Relaciones: " + TOTAL_REL + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de " + TOTAL_ATR + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de " + TOTAL_OPE + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de " + TOTAL_REL + SALTO;
    if (conEnDiagrama < TOTAL_REL) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "SI usa transaccion, pero la bitacora queda fuera." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU34 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU34 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU34", 0); } catch (e3) { }
}
