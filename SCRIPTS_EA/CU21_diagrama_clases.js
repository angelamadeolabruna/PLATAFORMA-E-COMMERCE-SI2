// ================================================================
// CU21 - ELABORAR ORDEN DE COMPRA A PROVEEDOR
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   web/src/pages/admin/AdminOrdenesCompra.tsx  estadoBadge, ACCIONES, agregarLinea,
//                                               cambiarProducto, formularioValido, Toast
//   web/src/lib/api.ts                         listar, obtener, opciones, crear, anular
//   api/src/modulos/compras/CTR_Compras.ts     6 endpoints, OrdenCompraRequest + LineaDetalleRequest
//   api/src/modulos/compras/SRV_ComprasService.ts  14 metodos, validarDetalle, validarEncabezado
//   BASE DE DATOS/schema.sql:277               ordenes_compra
//   BASE DE DATOS/schema.sql:290               orden_compra_items
//
// Sin estereotipo: Boundary, Control y Entity dibujan caja redondeada
// en EA. El rol va en el nombre: IU_ / CTR_ / SRV_ / CE_.
//
// Diagrama estatico: sin mensajes, sin lineas de vida, sin secuencia.
// Autorreparable. Una instruccion por linea. Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================

var ALTO = 14;
var SALTO = String.fromCharCode(10);
var VIS_PUB = 0;
var VIS_PRI = 1;
var RAIZ = Repository.Models.GetAt(0);

var DEF = [
    ["IU_AdminOrdenesCompra", "AdminOrdenesCompra", "pages/admin/AdminOrdenesCompra.tsx",
     [["ordenes", "Array", VIS_PUB], ["opciones", "Object", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["modalAbierto", "Boolean", VIS_PUB], ["editando", "Object", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["errorModal", "String", VIS_PUB], ["verOrden", "Object", VIS_PUB], ["aAnular", "Object", VIS_PUB], ["enviandoAnular", "Boolean", VIS_PUB], ["errorAnular", "String", VIS_PUB], ["cargandoDetalle", "Integer", VIS_PUB], ["toast", "Object", VIS_PUB], ["permisoOk", "Boolean", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["verDetalle", "void", ["orden"], VIS_PUB], ["abrirEdicion", "void", ["orden"], VIS_PUB], ["confirmarAnular", "void", [], VIS_PUB], ["estadoBadge", "Object", ["estado"], VIS_PUB], ["accionesDe", "Array", ["estado"], VIS_PUB], ["formatFecha", "String", ["dateStr"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_FormularioOrdenCompra", "FormularioOrdenCompra", "pages/admin/AdminOrdenesCompra.tsx",
     [["abierto", "Boolean", VIS_PUB], ["proveedor", "String", VIS_PUB], ["sucursal", "String", VIS_PUB], ["fecha", "String", VIS_PUB], ["observaciones", "String", VIS_PUB], ["lineas", "Array", VIS_PUB], ["contadorRef", "Object", VIS_PUB], ["total", "Number", VIS_PUB], ["formularioValido", "Boolean", VIS_PUB]],
     [["agregarLinea", "void", [], VIS_PUB], ["quitarLinea", "void", ["uid"], VIS_PUB], ["cambiarProducto", "void", ["uid", "id_ptc"], VIS_PUB], ["cambiarCampo", "void", ["uid", "campo", "valor"], VIS_PUB], ["calcularTotal", "Number", [], VIS_PUB], ["esValido", "Boolean", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_ConfirmarAnular", "ModalConfirmarAnular", "pages/admin/AdminOrdenesCompra.tsx",
     [["orden", "OrdenCompraItem", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB]],
     [["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "api", "lib/api.ts",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["listarOrdenesCompra", "Array", [], VIS_PUB], ["obtenerOrdenCompra", "Object", ["id"], VIS_PUB], ["obtenerOpcionesOrdenCompra", "Object", [], VIS_PUB], ["crearOrdenCompra", "Object", ["payload"], VIS_PUB], ["actualizarOrdenCompra", "Object", ["id", "payload"], VIS_PUB], ["anularOrdenCompra", "Object", ["id"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_ComprasAdminController", "ComprasAdminController", "CTR_Compras.ts",
     [["comprasService", "ComprasService", VIS_PRI]],
     [["listar", "Array", ["currentUser"], VIS_PUB], ["opciones", "Object", ["currentUser"], VIS_PUB], ["obtener", "Object", ["id", "currentUser"], VIS_PUB], ["crear", "Object", ["body", "request", "currentUser"], VIS_PUB], ["actualizar", "Object", ["id", "body", "request", "currentUser"], VIS_PUB], ["anular", "Object", ["id", "request", "currentUser"], VIS_PUB]]],

    ["SRV_ComprasService", "ComprasService", "SRV_ComprasService.ts",
     [["logger", "Logger", VIS_PRI], ["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermiso", "void", ["usuario"], VIS_PRI], ["bitacora", "void", ["accion", "tabla", "detalle", "usuario", "request", "idRegistro", "oldData", "newData"], VIS_PRI], ["formatearFechaHora", "String", ["valor"], VIS_PRI], ["formatearFecha", "String", ["valor"], VIS_PRI], ["listarOrdenesCompra", "Array", ["usuario"], VIS_PUB], ["obtenerOrdenCompra", "Object", ["usuario", "id"], VIS_PUB], ["obtenerOpciones", "Object", ["usuario"], VIS_PUB], ["validarDetalle", "void", ["detalle"], VIS_PRI], ["validarEncabezado", "Object", ["dto"], VIS_PRI], ["crearOrdenCompra", "Object", ["usuario", "dto", "request"], VIS_PUB], ["actualizarOrdenCompra", "Object", ["usuario", "id", "dto", "request"], VIS_PUB], ["anularOrdenCompra", "Object", ["usuario", "id", "request"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "JwtAuthGuard", "dependencias.ts",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_BitacoraService", "BitacoraService", "SRV_BitacoraService.ts",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_DataSource", "DataSource", "TypeORM",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "Object", ["callback"], VIS_PUB], ["getRepository", "Repository", ["entidad"], VIS_PUB]]],

    ["CE_OrdenCompra", "OrdenCompra", "tabla ordenes_compra (schema.sql:277)",
     [["id_orden_compra", "Integer = PK", VIS_PRI], ["id_proveedor", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["numero", "String = 20 sin UNIQUE", VIS_PUB], ["fecha_orden", "Timestamp = NOW()", VIS_PUB], ["fecha_estimada_entrega", "Date", VIS_PUB], ["fecha_recepcion", "Timestamp", VIS_PUB], ["estado", "String = Pendiente sin CHECK", VIS_PUB], ["total", "Decimal(12,2)", VIS_PUB], ["observaciones", "Text", VIS_PUB]],
     []],

    ["CE_OrdenCompraItem", "OrdenCompraItem", "tabla orden_compra_items (schema.sql:290)",
     [["id_orden_item", "Integer = PK", VIS_PRI], ["id_orden_compra", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer NOT NULL CHECK > 0", VIS_PUB], ["precio_unitario", "Decimal(10,2) sin CHECK", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB]],
     []],

    ["CE_OrdenCompraRequest", "OrdenCompraRequest", "CTR_Compras.ts",
     [["id_proveedor", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["fecha_estimada_entrega", "String", VIS_PUB], ["detalle", "Array", VIS_PUB], ["observaciones", "String", VIS_PUB]],
     []],

    ["CE_LineaDetalleRequest", "LineaDetalleRequest", "CTR_Compras.ts",
     [["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["precio_unitario_compra", "Decimal(2)", VIS_PUB]],
     []],

    ["CE_CrearOrdenCompraDTO", "CrearOrdenCompraDTO", "SRV_ComprasService.ts",
     [["id_proveedor", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["fecha_estimada_entrega", "String", VIS_PUB], ["detalle", "Array", VIS_PUB], ["observaciones", "String", VIS_PUB]],
     []],

    ["CE_LineaDetalleCompra", "LineaDetalleCompra", "SRV_ComprasService.ts",
     [["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["precio_unitario_compra", "Decimal", VIS_PUB]],
     []],

    ["CE_OrdenCompraItemDTO", "OrdenCompraItem", "SRV_ComprasService.ts",
     [["id_orden_compra", "Integer", VIS_PUB], ["numero", "String", VIS_PUB], ["id_proveedor", "Integer", VIS_PUB], ["nombre_proveedor", "String", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["nombre_sucursal", "String", VIS_PUB], ["fecha_orden", "String", VIS_PUB], ["fecha_estimada_entrega", "String", VIS_PUB], ["fecha_recepcion", "String", VIS_PUB], ["estado", "String", VIS_PUB], ["total", "Number", VIS_PUB], ["nro_items", "Integer", VIS_PUB]],
     []],

    ["CE_LineaOrdenDetalle", "LineaOrdenDetalle", "SRV_ComprasService.ts",
     [["id_orden_item", "Integer", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["nombre_producto", "String", VIS_PUB], ["talla", "String", VIS_PUB], ["color", "String", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["precio_unitario", "Decimal", VIS_PUB], ["subtotal", "Decimal", VIS_PUB]],
     []],

    ["CE_OpcionProveedorCompra", "OpcionProveedorCompra", "SRV_ComprasService.ts",
     [["id_proveedor", "Integer", VIS_PUB], ["nombre", "String", VIS_PUB], ["estado", "String", VIS_PUB], ["calidad_score", "Integer", VIS_PUB]],
     []],

    ["CE_OpcionProductoCompra", "OpcionProductoCompra", "SRV_ComprasService.ts",
     [["id_ptc", "Integer", VIS_PUB], ["id_producto", "Integer", VIS_PUB], ["nombre_producto", "String", VIS_PUB], ["talla", "String", VIS_PUB], ["color", "String", VIS_PUB], ["precio_base", "Decimal = precio de VENTA", VIS_PUB]],
     []],

    ["CE_Proveedor", "Proveedor", "tabla proveedores",
     [["id_proveedor", "Integer = PK", VIS_PRI], ["nombre_empresa", "String = 150", VIS_PUB], ["estado_riesgo", "String = Activo", VIS_PUB], ["calidad_score", "Integer", VIS_PUB]],
     []],

    ["CE_Sucursal", "Sucursal", "tabla sucursales",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "ProductoTallaColor", "tabla producto_talla_color",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB]],
     []],

    ["CE_Usuario", "Usuario", "tabla usuarios",
     [["id_usuario", "Integer", VIS_PRI], ["email", "String = 120", VIS_PRI], ["estado", "String", VIS_PUB]],
     []],

    ["CE_Rol", "Rol", "tabla roles",
     [["id_rol", "Integer", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "UsuarioRol", "tabla usuarios_roles",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_BitacoraAuditoria", "BitacoraAuditoria", "tabla bitacora_auditoria",
     [["id_bitacora", "Integer", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "String", VIS_PUB], ["user_agent", "String", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Administrador", "Administrador General", "elaborar_orden_compra o *"]
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
    var mod = buscarPaquete(cu, "6. Proveedores y Compras");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU21 - Análisis de clases");

    for (var d = paq.Diagrams.Count - 1; d >= 0; d--) {
        try { paq.Diagrams.GetAt(d).Delete(); } catch (e) { }
    }
    try { paq.Diagrams.Refresh(); } catch (e) { }

    var clases = [];
    for (var n = 0; n < DEF.length; n++) {
        var def = DEF[n];
        var c = buscarLocal(paq, def[0]);
        if (c == null) c = buscarLocal(paq, def[1]);
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
    try { diag = paq.Diagrams.AddNew("CU21 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        conEnDiagrama += relacion(diag, actores[0], C[0], "usuario", "Association", "", "actor", "pantalla", "1", "0..1");
        conEnDiagrama += relacion(diag, C[0], C[1], "formulario de orden", "Association", "", "pantalla", "formulario", "0..1", "1");
        conEnDiagrama += relacion(diag, C[0], C[2], "modal de anulación", "Association", "", "pantalla", "modal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[0], C[3], "cliente HTTP", "Dependency", "uses", "pantalla", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[0], C[15], "órdenes listadas", "Association", "", "pantalla", "listado", "0..*", "1");
        conEnDiagrama += relacion(diag, C[0], C[17], "opciones de proveedor", "Dependency", "uses", "pantalla", "opción", "1", "0..*");
        conEnDiagrama += relacion(diag, C[0], C[18], "opciones de producto", "Dependency", "uses", "pantalla", "opción", "1", "0..*");
        conEnDiagrama += relacion(diag, C[1], C[17], "selector de proveedor", "Association", "", "formulario", "opción", "1", "0..*");
        conEnDiagrama += relacion(diag, C[1], C[18], "selector de producto", "Association", "", "formulario", "opción", "1", "0..*");
        conEnDiagrama += relacion(diag, C[1], C[11], "cuerpo enviado", "Association", "", "formulario", "petición", "1", "1");
        conEnDiagrama += relacion(diag, C[2], C[15], "orden a anular", "Association", "", "modal", "orden", "1", "1");
        conEnDiagrama += relacion(diag, C[3], C[4], "punto de acceso HTTP", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, C[4], C[11], "datos de entrada", "Association", "", "controlador", "orden", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[12], "línea de entrada", "Composition", "composition", "controlador", "línea", "1", "0..*");
        conEnDiagrama += relacion(diag, C[4], C[6], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[5], "servicio de compras", "Association", "", "controlador", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[6], "usuario autenticado", "Association", "", "compras", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[7], "auditoría de la operación", "Association", "", "compras", "auditor", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[8], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[9], "orden gestionada", "Composition", "composition", "compras", "orden", "1", "0..*");
        conEnDiagrama += relacion(diag, C[5], C[10], "líneas de la orden", "Composition", "composition", "compras", "línea", "1", "0..*");
        conEnDiagrama += relacion(diag, C[5], C[13], "DTO mapeado", "Association", "", "compras", "dto", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[14], "línea del DTO", "Composition", "composition", "dto", "línea", "1", "0..*");
        conEnDiagrama += relacion(diag, C[5], C[15], "orden mapeada", "Association", "", "compras", "item", "0..*", "1");
        conEnDiagrama += relacion(diag, C[5], C[16], "línea leída", "Association", "", "compras", "detalle", "0..*", "1");
        conEnDiagrama += relacion(diag, C[5], C[17], "opción de proveedor", "Association", "", "compras", "opción", "0..*", "1");
        conEnDiagrama += relacion(diag, C[5], C[18], "opción de producto", "Association", "", "compras", "opción", "0..*", "1");
        conEnDiagrama += relacion(diag, C[5], C[19], "proveedor validado", "Dependency", "uses", "compras", "proveedor", "1", "0..1");
        conEnDiagrama += relacion(diag, C[5], C[20], "sucursal validada", "Dependency", "uses", "compras", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[5], C[21], "productos de las líneas", "Dependency", "uses", "compras", "ptc", "0..*", "1");
        conEnDiagrama += relacion(diag, C[6], C[22], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");
        conEnDiagrama += relacion(diag, C[7], C[25], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        conEnDiagrama += relacion(diag, C[7], C[8], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[25], C[22], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");
        conEnDiagrama += relacion(diag, C[9], C[19], "proveedor de la orden", "Composition", "composition", "orden", "proveedor", "1", "0..1");
        conEnDiagrama += relacion(diag, C[9], C[20], "sucursal de la orden", "Association", "", "orden", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[10], C[9], "orden de la línea", "Composition", "composition", "línea", "orden", "1", "1");
        conEnDiagrama += relacion(diag, C[10], C[21], "producto de la línea", "Association", "", "línea", "ptc", "1", "0..1");
        conEnDiagrama += relacion(diag, C[16], C[21], "producto de la línea", "Dependency", "uses", "detalle", "ptc", "1", "0..1");
        conEnDiagrama += relacion(diag, C[17], C[19], "proveedor representado", "Dependency", "uses", "opción", "proveedor", "1", "1");
        conEnDiagrama += relacion(diag, C[18], C[21], "ptc representado", "Dependency", "uses", "opción", "ptc", "1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("Los mensajes y las excepciones de CU21 solo estan en el diagrama de comunicacion.");
        N.push("");
        N.push("1 actor, 26 clases y 41 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (4), CTR_ controlador (1), SRV_ servicio (4), CE_ entidad o DTO (17).");
        N.push("El diagrama es mas grande que los anteriores porque este caso tiene seis endpoints, no uno:");
        N.push("GET lista, GET opciones, GET detalle, POST crear, PUT actualizar y PATCH anular.");
        N.push("");
        N.push("HALLAZGO CRITICO 1: NO SE PUEDE REPETIR EL MISMO producto.talla.color EN DOS LINEAS.");
        N.push("");
        N.push("Este es el defecto mas concreto del caso. En validarDetalle, linea 326:");
        N.push("  const ids = detalle.map((l) => l.id_ptc);");
        N.push("  const filas = await this.dataSource.query(");
        N.push("    SELECT id_ptc FROM producto_talla_color WHERE id_ptc = ANY($1::int[]), [ids]);");
        N.push("  if (filas.length !== ids.length) throw ... 'Uno de los productos seleccionados no existe.'");
        N.push("");
        N.push("El operador = ANY() no duplica filas. Si dos lineas llevan el mismo id_ptc, ids tiene dos");
        N.push("entradas pero filas devuelve una sola, asi que 1 !== 2 y se responde 422 con un mensaje");
        N.push("que MIENTE: el producto si existe, esta duplicado. Y el caso no puede evitarlo porque:");
        N.push("");
        N.push("  - agregarLinea empuja la linea nueva sin mirar las que ya hay (linea 142 del tsx).");
        N.push("  - formularioValido solo comprueba l.id_ptc !== '' linea por linea, sin unicidad entre");
        N.push("    lineas (linea 140 del tsx).");
        N.push("  - orden_compra_items NO tiene UNIQUE (id_orden_compra, id_ptc), asi que la base no lo");
        N.push("    detecta tampoco. Solo tiene el CHECK (cantidad > 0).");
        N.push("");
        N.push("La correccion es comparar contra el conjunto unico, new Set(ids).size, o fusionar las");
        N.push("lineas repetidas en el frontend antes de enviar.");
        N.push("");
        N.push("HALLAZGO CRITICO 2: AL CAMBIAR EL PRODUCTO DE UNA LINEA, EL PRECIO NO SE RECALCULA.");
        N.push("");
        N.push("cambiarProducto, linea 157 del tsx:");
        N.push("  precio: l.precio === '' || !l.precio ? String(producto?.precio_base ?? '') : l.precio");
        N.push("");
        N.push("El precio solo se autocompleta cuando el campo esta vacio. Si la linea ya tiene precio y");
        N.push("el administrador cambia el producto, se CONSERVA el precio del producto anterior. Y como");
        N.push("formularioValido solo pide Number(l.precio) > 0, la orden se envia sin quejarse. O sea que");
        N.push("es posible pedir 50 unidades del producto B al precio del producto A.");
        N.push("");
        N.push("Y hay un segundo problema en el mismo campo: lo que se precarga es producto.precio_base,");
        N.push("que es el PRECIO DE VENTA del producto (CU13/CU15), no un precio de compra. El campo se");
        N.push("llama precio_unitario_compra. El administrador tiene que corregir a mano el precio en");
        N.push("cada linea, y es facil que se le olvide en la primera.");
        N.push("");
        N.push("HALLAZGO CRITICO 3: EL ORDEN DE LAS VALIDACIONES ES EL INVERSO AL DEL CASO.");
        N.push("");
        N.push("En crearOrdenCompra, lineas 384-386:");
        N.push("  await this.exigirPermiso(usuario);        -> 403");
        N.push("  await this.validarDetalle(dto.detalle);    -> 422");
        N.push("  const { total } = await this.validarEncabezado(dto);  -> 404, 409 o 422");
        N.push("");
        N.push("El caso enumera (b) proveedor y (c) lineas y sucursal. En el codigo las lineas se");
        N.push("validan ANTES que el encabezado. Consecuencia observable: una peticion con proveedor");
        N.push("bloqueado y una linea mala devuelve el 422 de la linea, no el 409 del proveedor, y el");
        N.push("administrador no ve el problema real hasta corregir el detalle.");
        N.push("");
        N.push("HALLAZGO CRITICO 4: LA BITACORA SE ESCRIBE FUERA DE LA TRANSACCION.");
        N.push("");
        N.push("El caso presenta (g) como un paso mas de la transaccion. No lo es. En crearOrdenCompra:");
        N.push("  linea 414   await this.dataSource.transaction(...)   <- aqui se confirma el INSERT");
        N.push("  linea 416   await this.bitacora(...)                 <- aqui va la bitacora, por fuera");
        N.push("");
        N.push("Si la bitacora falla, la orden YA esta confirmada y el cliente recibe un 500 sin");
        N.push("id_orden_compra, con la orden creada y sin registro de auditoria. El caso promete que la");
        N.push("bitacora registra la creacion; eso no esta garantizado. Mismo defecto en");
        N.push("actualizarOrdenCompra, y anularOrdenCompra es peor: no usa transaccion en absoluto, el");
        N.push("UPDATE SET estado = 'Anulada' de la linea 512 es un dataSource.query suelto.");
        N.push("");
        N.push("HALLAZGO 5: E2 TIENE CINCO MENSAJES, NO DOS.");
        N.push("");
        N.push("El caso fusiona la validacion de cantidad con la de precio. El orden real es:");
        N.push("  detalle vacio          -> Agrega al menos una linea a la orden.");
        N.push("  id_ptc no entero       -> Cada linea debe tener un producto valido.");
        N.push("  cantidad no entera o <= 0 -> Cada linea debe tener un producto y una cantidad mayor a 0.");
        N.push("  precio no finito o <= 0   -> Cada linea debe tener un precio unitario mayor a 0.");
        N.push("  id_ptc inexistente     -> Uno de los productos seleccionados no existe.");
        N.push("");
        N.push("Los tres primeros estan dentro del for y se evaluan linea por linea, en ese orden. El caso");
        N.push("solo documenta el tercero y el quinto.");
        N.push("");
        N.push("HALLAZGO 6: HAY UN 400 MAS POR LA REGLA DE DECIMALES, CON UN MENSAJE ENGAÑOSO.");
        N.push("");
        N.push("LineaDetalleRequest lleva:");
        N.push("  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Cada linea debe tener un precio unitario mayor a 0.' })");
        N.push("");
        N.push("Un precio con tres decimales lo rechaza el validation pipe con un 400, no un 422, y el");
        N.push("mensaje dice mayor a 0 cuando el problema real es la cantidad de decimales. Y validarDetalle");
        N.push("solo comprueba precio <= 0, nunca los decimales: las dos capas usan el mismo texto para dos");
        N.push("problemas que no tienen nada que ver.");
        N.push("");
        N.push("HALLAZGO 7: EL NUMERO SE GENERA EN DOS ESCRITURAS, Y numero ES CODIGO MUERTO.");
        N.push("");
        N.push("validarEncabezado devuelve return { numero: '', total } en la linea 376, y quien lo");
        N.push("consume hace const { total } = ...: nunca lee numero. El numero real se arma dentro de la");
        N.push("transaccion con el id del RETURNING:");
        N.push("  numero = `OC-${String(idOrden).padStart(6, '0')}`");
        N.push("y se escribe con un segundo UPDATE. O sea que son dos escrituras (INSERT + UPDATE) donde");
        N.push("bastaria una. Y schema.sql declara numero VARCHAR(20) SIN UNIQUE: la unicidad se apoya");
        N.push("unicamente en que el numero se deriva de la clave primaria. Ademas padStart(6) no recorta:");
        N.push("pasada la orden 999999 el numero sale de siete digitos.");
        N.push("");
        N.push("HALLAZGO 8: ESTADO NO TIENE CHECK NI ENUM, Y EL PENDIENTE VIENE DE UN LITERAL.");
        N.push("");
        N.push("schema.sql: estado VARCHAR(20) DEFAULT 'Pendiente', sin CHECK y sin ENUM. Lo que");
        N.push("garantiza el alta es el LITERAL 'Pendiente' dentro del VALUES del INSERT, no el default.");
        N.push("Por eso el badge tiene un return de reserva: estadoBadge mapea pendiente a warning (ambar),");
        N.push("recibida a success y anulada a neutral, y cualquier otro valor se muestra tal cual con");
        N.push("variante brand. Nada impide que un UPDATE manual deje Procesada o Recibido y la tabla lo");
        N.push("muestre crudo. Los estados que produce el codigo son Pendiente, Anulada y (CU22) Recibida.");
        N.push("");
        N.push("HALLAZGO 9: LA ANULACION CRITERIA RECIBIDA POR DOS VIAS, EL CASO DOCUMENTA UNA.");
        N.push("");
        N.push("  const recibida = estado.toLowerCase() === 'recibida' || fila.fecha_recepcion != null;");
        N.push("");
        N.push("Una orden con estado Pendiente pero fecha_recepcion ya rellenada NO se puede anular.");
        N.push("Y el orden de las dos comprobaciones de E4 es primero la de recibida y luego la de anulada,");
        N.push("que es el orden correcto. Como el UPDATE solo pone estado = 'Anulada' y no toca");
        N.push("fecha_recepcion, anular dos veces si cae en el segundo mensaje, tal como dice el caso.");
        N.push("");
        N.push("HALLAZGO 10: ANULAR NO VALIDA NI PROVEEDOR NI LINEAS.");
        N.push("");
        N.push("Es el unico de los tres metodos que se salta validarEncabezado y validarDetalle. El");
        N.push("efecto es correcto e intencionado: una orden creada con un proveedor activo se puede");
        N.push("anular aunque ese proveedor este ahora bloqueado o inactivo. Lo que no esta bien es que el");
        N.push("El caso meta E1 y E4 en la misma lista de excepciones, como si interactuaran. No interactuan.");
        N.push("");
        N.push("HALLAZGO 11: HAY UNA TERCER ACCION POR FILA QUE EL CASO NO DESCRIBE.");
        N.push("");
        N.push("  const ACCIONES = { Pendiente: ['Ver', 'Editar', 'Anular'], ... }");
        N.push("");
        N.push("La accion Ver, que hace GET /:id y abre el detalle con el JOIN de orden_compra_items a");
        N.push("producto_talla_color, productos, tallas y colores, no esta en la descripcion del caso. Es");
        N.push("la unica forma de ver el numero completo y el detalle de una orden ya creada, y es la que");
        N.push("devuelve los nombres de producto, talla y color que el formulario solo muestra por id.");
        N.push("");
        N.push("HALLAZGO 12: EL TOAST ES res.detail DEL BACKEND, Y HAY TRES MENSAJES DISTINTOS.");
        N.push("");
        N.push("  crear   -> Orden de compra OC-000001 creada.");
        N.push("  editar  -> Orden OC-000001 actualizada.");
        N.push("  anular  -> Orden OC-000001 anulada.");
        N.push("");
        N.push("El caso solo documenta el primero. Y el ?? id de los otros dos es una degradacion: numero");
        N.push("es nullable y se genera en el UPDATE posterior al INSERT, asi que para una orden antigua");
        N.push("sin numero el toast queda Orden 42 actualizada., con el id pelado.");
        N.push("");
        N.push("HALLAZGO 13: EL TOTAL SE CALCULA DOS VECES, CON METODOS DISTINTOS.");
        N.push("");
        N.push("Cliente, sin redondear y con Number(x) || 0:");
        N.push("  lineas.reduce((acc, l) => acc + (Number(l.cantidad) || 0) * (Number(l.precio) || 0), 0)");
        N.push("Servidor, con el parche de coma flotante estandar:")
        N.push("  Math.round((valor + Number.EPSILON) * 100) / 100");
        N.push("");
        N.push("Los || 0 y el + Number.EPSILON tapan problemas distintos. En la practica el total mostrado");
        N.push("puede diferir en un centimo mientras se escribe, y el que queda guardado es el del servidor.");
        N.push("El caso solo menciona el redondeo del lado del backend.");
        N.push("");
        N.push("HALLAZGO 14: LA BASE GARANTIZA LA CANTIDAD PERO NO EL PRECIO.");
        N.push("");
        N.push("  cantidad        INTEGER NOT NULL CHECK (cantidad > 0)     <- si");
        N.push("  precio_unitario DECIMAL(10,2)                                <- no");
        N.push("  total           DECIMAL(12,2)                                <- no");
        N.push("");
        N.push("El unico guard del precio es el servicio. Un UPDATE manual con precio 0 o negativo se");
        N.push("acepta sin quejarse. Y CU21 no necesita migracion: ordenes_compra y orden_compra_items");
        N.push("estan completas en schema.sql, a diferencia de lo que pasa con proveedores en CU18.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - E5: en el backend es 403 con ForbiddenException('No tienes permiso para elaborar");
        N.push("    ordenes de compra.'), y el permiso acepta el comodin '*' ademas de elaborar_orden_compra.");
        N.push("    En el frontend permisoOk es un useMemo y si es falso la pagina entera se reemplaza por");
        N.push("    un h1 Acceso denegado, no solo se oculta el boton.");
        N.push("  - formatearFecha del frontend hace new Date(dateStr.length <= 10 ? `+T00:00:00` : ...)");
        N.push("    para tratar YYYY-MM-DD como fecha local y evitar el corrimiento de un dia. El servicio");
        N.push("    hace lo propio con FECHA_RE = /^\\d{4}-\\d{2}-\\d{2}$/ sobre el texto que devuelve el cast");
        N.push("    ::text de una columna DATE, que Postgres devuelve siempre en ese formato exacto.");
        N.push("  - El token llega por header Bearer o, si falta, por la cookie access_token. Igual que en");
        N.push("    CU18, CU19 y CU20. La app React usa la cookie.");
        N.push("  - cargarPermisos vuelve a usar la variante de JOIN crudo, la misma divergencia de CU18.");
        N.push("  - El caso dice web React/TypeScript + Vite + Tailwind, que si coincide con el codigo real.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU21 - ELABORAR ORDEN DE COMPRA - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 128");
    T.push("Operaciones reales: " + totalOpe + " de 49");
    T.push("CONECTORES DIBUJADOS: " + conEnDiagrama + " de 41");
    if (conEnDiagrama < 41) T.push("  FALTAN LINEAS. Reejecuta el script: es idempotente y las coloca.");
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
    msg = msg + "CU21 - Elaborar orden de compra" + SALTO + SALTO;
    msg = msg + "Clases: 26    Actores: 1    Relaciones: 41" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 128" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 49" + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de 41" + SALTO;
    if (conEnDiagrama < 41) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "AVISO: no se puede repetir producto-talla-color en dos lineas." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU21 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU21 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU21", 0); } catch (e3) { }
}
