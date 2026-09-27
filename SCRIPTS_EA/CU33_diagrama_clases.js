// ================================================================
// CU33 - AGREGAR PRODUCTOS AL CARRITO
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   api/src/modulos/carrito/CTR_Carrito.ts            4 handlers con JwtOpcionalAuthGuard
//   api/src/modulos/carrito/SRV_CarritoService.ts     17 metodos; obtenerOCrearCarrito con 4 ramas
//   api/src/modulos/seguridad/dependencias.ts:77      CredencialesCarrito { usuario, tokenInvitado }
//   api/src/modulos/seguridad/dependencias.ts:84      JwtOpcionalAuthGuard, devuelve true sin token
//   api/src/modulos/seguridad/dependencias.ts:141     lee el header X-Carrito-Token
//   web/src/lib/api.ts:899                            TOKEN_INVITADO_KEY = carrito_token_invitado
//   web/src/contexts/AuthContext.tsx:66               guardarTokenInvitado(null) al iniciar sesion
//   schema.sql:368  carritos        SIN columna token_invitado
//   schema.sql:376  carrito_items   sin subtotal; el subtotal se recalcula al vuelo
//   schema.sql:255  producto_precios con fecha_fin nullable
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
var TOTAL_REL = 59;
var TOTAL_ATR = 85;
var TOTAL_OPE = 46;

var DEF = [
    ["IU_CartContext", "EXISTE. contexts/CartContext.tsx", "guarda el carrito y el token de invitado en el estado",
     [["carrito", "Object", VIS_PUB], ["token_invitado", "String", VIS_PUB], ["items", "Array", VIS_PUB], ["subtotal", "Number", VIS_PUB], ["cargando", "Boolean", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["agregarItem", "void", ["payload"], VIS_PUB], ["actualizarCantidad", "void", ["idCarritoItem", "cantidad"], VIS_PUB], ["quitarItem", "void", ["idCarritoItem"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_PanelCarrito", "EXISTE. panel lateral del carrito", "detalle con cantidades, quitar y ir al checkout",
     [["abierto", "Boolean", VIS_PUB], ["carrito", "Object", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB]],
     [["cambiarCantidad", "void", ["idCarritoItem", "cantidad"], VIS_PUB], ["quitar", "void", ["idCarritoItem"], VIS_PUB], ["irAlCheckout", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_CarritoHeader", "EXISTE. cabecera del Cliente", "el badge que cuenta los items del carrito",
     [["contadorItems", "Integer", VIS_PUB], ["totalItems", "Integer", VIS_PUB]],
     [["refrescarContador", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "EXISTE. lib/api.ts", "los 4 endpoints mandan X-Carrito-Token automaticamente",
     [["baseUrl", "String = /api/v1", VIS_PRI], ["TOKEN_INVITADO_KEY", "String = carrito_token_invitado", VIS_PRI]],
     [["consultarCarrito", "Object", [], VIS_PUB], ["agregarItemCarrito", "Object", ["payload"], VIS_PUB], ["actualizarCantidadCarrito", "Object", ["idCarritoItem", "cantidad"], VIS_PUB], ["quitarItemCarrito", "Object", ["idCarritoItem"], VIS_PUB], ["headersConTokenInvitado", "Object", ["base"], VIS_PUB], ["guardarTokenInvitado", "void", ["token"], VIS_PUB], ["leerTokenInvitado", "String", [], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_CarritoController", "EXISTE. carrito/CTR_Carrito.ts", "ruta carrito; guard OPCIONAL en los 4 handlers",
     [["carritoService", "CarritoService", VIS_PRI]],
     [["consultar", "Object", ["credenciales"], VIS_PUB], ["agregar", "Object", ["body", "request", "credenciales"], VIS_PUB], ["actualizarCantidad", "Object", ["idCarritoItem", "body", "credenciales"], VIS_PUB], ["quitar", "Object", ["idCarritoItem", "request", "credenciales"], VIS_PUB]]],

    ["SRV_CarritoService", "EXISTE. carrito/SRV_CarritoService.ts", "17 metodos; el permiso se salta si no hay usuario",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermisoVenta", "void", ["usuario"], VIS_PRI], ["obtenerOCrearCarrito", "Object", ["credenciales", "idSucursal"], VIS_PRI], ["validarPrenda", "Object", ["idPtc"], VIS_PRI], ["validarSucursalActiva", "void", ["idSucursal"], VIS_PRI], ["validarStock", "void", ["prenda", "idSucursal", "cantidad"], VIS_PRI], ["precioVigente", "Number", ["prenda"], VIS_PRI], ["cargarItems", "Array", ["idCarrito"], VIS_PRI], ["recalcularSubtotal", "Number", ["idCarrito"], VIS_PRI], ["armarCarrito", "Object", ["idCarrito", "idSucursal", "items", "subtotal", "coincidencia", "extra"], VIS_PRI], ["agregarItem", "Object", ["credenciales", "dto", "request"], VIS_PUB], ["consultarCarrito", "Object", ["credenciales"], VIS_PUB], ["obtenerItemDeCarrito", "Object", ["credenciales", "idCarritoItem"], VIS_PUB], ["actualizarCantidad", "Object", ["credenciales", "idCarritoItem", "cantidad", "request"], VIS_PUB], ["quitarItem", "Object", ["credenciales", "idCarritoItem", "request"], VIS_PUB]]],

    ["SRV_JwtOpcionalAuthGuard", "EXISTE. seguridad/dependencias.ts:84", "devuelve true SIN token; el carrito es de invitado",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_CarritoCredenciales", "EXISTE. seguridad/dependencias.ts:77 y :136", "el param decorator que arma usuario + tokenInvitado",
     [],
     [["CredencialesCarritoActual", "Object", ["datos", "contexto"], VIS_PUB]]],

    ["SRV_BitacoraService", "EXISTE. seguridad/SRV_BitacoraService.ts", "acepta id_usuario NULL para el carrito de invitado",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "sin transaccion en agregar, actualizar ni quitar",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "Object", ["callback"], VIS_PUB], ["getRepository", "Repository", ["entidad"], VIS_PUB]]],

    ["CE_Carrito", "EXISTE. tabla carritos (schema.sql:368)", "NO tiene token_invitado; id_usuario es nullable",
     [["id_carrito", "Integer = PK", VIS_PRI], ["id_usuario", "Integer = nullable", VIS_PUB], ["estado", "String = Activo", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["fecha_creacion", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_CarritoItem", "EXISTE. tabla carrito_items (schema.sql:376)", "sin subtotal ni precio de lista; solo el unitario",
     [["id_carrito_item", "Integer = PK", VIS_PRI], ["id_carrito", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer = 1", VIS_PUB], ["precio_unitario", "Decimal(10,2)", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. tabla usuarios", "dueño del carrito; NULL si es de invitado",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120", VIS_PRI], ["estado", "String", VIS_PUB]],
     []],

    ["CE_Rol", "EXISTE. tabla roles; permisos_json sembrado en schema.sql:573", "realizar_venta NO esta en ninguno de los 5 roles sembrados",
     [["id_rol", "Integer = PK", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["descripcion", "String", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "EXISTE. tabla usuarios_roles", "une usuario con rol",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. tabla producto_talla_color", "la prenda; la clave del carrito es esta, no id_producto",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB], ["estado_stock", "String = Disponible", VIS_PUB]],
     []],

    ["CE_Producto", "EXISTE. tabla productos", "precio_base es el respaldo si no hay precio vigente",
     [["id_producto", "Integer = PK", VIS_PRI], ["codigo", "String", VIS_PUB], ["nombre", "String", VIS_PUB], ["id_categoria", "Integer", VIS_PUB], ["estado", "String = Activo", VIS_PUB], ["precio_base", "Decimal(10,2)", VIS_PUB]],
     []],

    ["CE_ProductoPrecio", "EXISTE. tabla producto_precios (schema.sql:255)", "fecha_fin NULL significa vigente; el solape se resuelve por id",
     [["id_precio", "Integer = PK", VIS_PRI], ["id_ptc", "Integer = ON DELETE CASCADE", VIS_PUB], ["precio", "Decimal(10,2) NOT NULL", VIS_PUB], ["fecha_inicio", "Date", VIS_PUB], ["fecha_fin", "Date = NULL es vigente", VIS_PUB]],
     []],

    ["CE_InventarioStock", "EXISTE. tabla inventario_stock (schema.sql:302)", "la fuente de la comprobacion de stock",
     [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_reservada", "Integer = 0", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB], ["stock_minimo_alert", "Integer = 0", VIS_PUB]],
     []],

    ["CE_Sucursal", "EXISTE. tabla sucursales", "se valida Activa; si el carrito ya existe, su sucursal gana",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_BitacoraAuditoria", "EXISTE. tabla bitacora_auditoria", "id_usuario nullable y ON DELETE SET NULL",
     [["id_bitacora", "Integer = PK", VIS_PRI], ["id_usuario", "Integer = nullable", VIS_PUB], ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "INET", VIS_PUB], ["user_agent", "String = 255", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_AgregarItemRequest", "EXISTE. carrito/CTR_Carrito.ts", "el body con sus tres validadores de @IsInt",
     [["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB]],
     []],

    ["CE_AgregarItemDTO", "EXISTE. SRV_CarritoService.ts", "el tipo interno tras el mapeo del controlador",
     [["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB]],
     []],

    ["CE_CarritoRespuesta", "EXISTE. lib/api.ts y SRV_CarritoService.ts", "el carrito con items, subtotal y el token del invitado",
     [["carrito", "Object", VIS_PUB], ["subtotal", "Number", VIS_PUB], ["token_invitado", "String", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Cliente", "Cliente autenticado. OJO: da 403", "NO tiene realizar_venta; tiene comprar"],
    ["ACTOR_Cajero", "Cajero. OJO: da 403", "NO tiene realizar_venta; tiene registrar_venta"],
    ["ACTOR_Invitado", "Visitante sin sesion. SI puede", "ninguno: el guard lo deja pasar"],
    ["ACTOR_Administrador", "Administrador. SI puede", "* o wildcard"]
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
    if (mod == null) mod = buscarPaquete(cu, "3. Catalogo y Productos");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU33 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU33 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        conEnDiagrama += relacion(diag, actores[0], C[0], "usuario", "Association", "", "cliente", "contexto", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C[1], "abre el panel", "Association", "", "cliente", "panel", "0..*", "1");
        conEnDiagrama += relacion(diag, actores[0], C[2], "badge del carrito", "Association", "", "cliente", "cabecera", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C[4], "compra por HTTP", "Association", "", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C[4], "cobra en el punto de caja", "Association", "", "cajero", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[2], C[4], "armar carrito sin sesión", "Association", "", "invitado", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[3], C[4], "único autenticado que pasa", "Association", "", "administrador", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, C[0], C[1], "estado del carrito", "Association", "", "contexto", "panel", "0..1", "1");
        conEnDiagrama += relacion(diag, C[0], C[2], "contador de items", "Dependency", "uses", "contexto", "cabecera", "1", "0..1");
        conEnDiagrama += relacion(diag, C[0], C[3], "cliente HTTP", "Dependency", "uses", "contexto", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[1], C[3], "cliente HTTP", "Dependency", "uses", "panel", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[1], C[11], "items del panel", "Association", "", "panel", "item", "0..*", "1");
        conEnDiagrama += relacion(diag, C[1], C[23], "carrito mostrado", "Association", "", "panel", "respuesta", "1", "0..1");
        conEnDiagrama += relacion(diag, C[2], C[0], "contador compartido", "Dependency", "uses", "cabecera", "contexto", "1", "1");
        conEnDiagrama += relacion(diag, C[3], C[4], "punto de acceso HTTP", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, C[3], C[10], "token del invitado", "Dependency", "uses", "cliente", "carrito", "1", "0..*");
        conEnDiagrama += relacion(diag, C[4], C[6], "guard opcional", "Dependency", "uses", "controlador", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[7], "credenciales del carrito", "Dependency", "uses", "controlador", "credenciales", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[5], "servicio de carrito", "Association", "", "controlador", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[21], "cuerpo de entrada", "Dependency", "uses", "controlador", "cuerpo", "1", "0..1");
        conEnDiagrama += relacion(diag, C[5], C[6], "usuario resuelto", "Association", "", "carrito", "guard", "1", "0..1");
        conEnDiagrama += relacion(diag, C[5], C[7], "credenciales consumidas", "Dependency", "uses", "carrito", "credenciales", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[8], "auditoría de la operación", "Association", "", "carrito", "auditor", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[9], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[10], "carrito gestionado", "Composition", "composition", "carrito", "carrito", "1", "0..*");
        conEnDiagrama += relacion(diag, C[5], C[11], "ítems del carrito", "Composition", "composition", "carrito", "ítem", "1", "0..*");
        conEnDiagrama += relacion(diag, C[5], C[12], "usuario autenticado", "Dependency", "uses", "carrito", "usuario", "1", "0..1");
        conEnDiagrama += relacion(diag, C[5], C[13], "rol del usuario", "Dependency", "uses", "carrito", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C[5], C[14], "asignación de rol", "Dependency", "uses", "carrito", "asignación", "0..*", "1");
        conEnDiagrama += relacion(diag, C[5], C[15], "prenda validada", "Dependency", "uses", "carrito", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[16], "producto de la prenda", "Dependency", "uses", "carrito", "producto", "1", "0..1");
        conEnDiagrama += relacion(diag, C[5], C[17], "precio vigente", "Dependency", "uses", "carrito", "precio", "0..*", "1");
        conEnDiagrama += relacion(diag, C[5], C[18], "stock comprobado", "Dependency", "uses", "carrito", "stock", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[19], "sucursal validada", "Dependency", "uses", "carrito", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[22], "DTO mapeado", "Dependency", "uses", "carrito", "dto", "1", "0..1");
        conEnDiagrama += relacion(diag, C[5], C[23], "carrito armado", "Dependency", "uses", "carrito", "respuesta", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[12], "usuario resuelto", "Association", "", "guard", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C[7], C[12], "usuario de las credenciales", "Dependency", "uses", "credenciales", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C[7], C[10], "carrito del invitado", "Dependency", "uses", "credenciales", "carrito", "0..1", "1");
        conEnDiagrama += relacion(diag, C[8], C[20], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        conEnDiagrama += relacion(diag, C[8], C[9], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[10], C[12], "dueño del carrito", "Association", "", "carrito", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C[10], C[19], "sucursal del carrito", "Association", "", "carrito", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[11], C[10], "carrito del ítem", "Composition", "composition", "ítem", "carrito", "1", "1");
        conEnDiagrama += relacion(diag, C[11], C[15], "prenda del ítem", "Association", "", "ítem", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C[11], C[17], "precio del ítem", "Association", "", "ítem", "precio", "0..1", "1");
        conEnDiagrama += relacion(diag, C[12], C[13], "rol del usuario", "Association", "", "usuario", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C[12], C[14], "asignación de rol", "Composition", "composition", "usuario", "asignación", "1", "0..*");
        conEnDiagrama += relacion(diag, C[15], C[16], "producto del ptc", "Composition", "composition", "ptc", "producto", "1", "1");
        conEnDiagrama += relacion(diag, C[15], C[17], "precios del ptc", "Association", "", "ptc", "precio", "1", "0..*");
        conEnDiagrama += relacion(diag, C[18], C[15], "stock por ptc", "Association", "", "stock", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C[18], C[19], "stock por sucursal", "Association", "", "stock", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C[20], C[12], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C[21], C[15], "prenda del request", "Association", "", "cuerpo", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C[21], C[19], "sucursal del request", "Association", "", "cuerpo", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C[22], C[15], "prenda del DTO", "Association", "", "dto", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C[22], C[19], "sucursal del DTO", "Association", "", "dto", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C[23], C[10], "carrito devuelto", "Association", "", "respuesta", "carrito", "1", "1");
        conEnDiagrama += relacion(diag, C[23], C[11], "ítems devueltos", "Association", "", "respuesta", "ítem", "0..*", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("4 actores, 24 clases y " + TOTAL_REL + " relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (4), CTR_ controlador (1), SRV_ servicio (5), CE_ entidad o DTO (14).");
        N.push("");
        N.push("HALLAZGO CRITICO 0: EL PERMISO REALIZAR_VENTA NO ESTA EN NINGUN ROL.");
        N.push("");
        N.push("El caso dice que Cliente y Cajero tienen realizar_venta y que Encargado no. La siembra de");
        N.push("roles en schema.sql:573 dice lo contrario:");
        N.push("");
        N.push("  Administrador         [\"*\"]");
        N.push("  Encargado de Sucursal [\"gestionar_catalogo\",\"ver_inventario\",\"editar_inventario\",");
        N.push("                          \"gestionar_compras\",\"gestionar_recepciones\",\"gestionar_reservas\",");
        N.push("                          \"ver_existencias\"]");
        N.push("  Cajero                [\"procesar_pagos\",\"ver_inventario\",\"registrar_venta\",");
        N.push("                          \"gestionar_devoluciones\"]");
        N.push("  Cliente               [\"ver_catalogo\",\"comprar\",\"reservar\",\"usar_vestidor_ra\"]");
        N.push("  Proveedor             [\"ver_ordenes_compra\"]");
        N.push("");
        N.push("realizar_venta no aparece en ninguno de los cinco. Y la comprobacion es:");
        N.push("");
        N.push("  if (!(permisos.includes('*') || permisos.includes('realizar_venta'))) {");
        N.push("    throw new ForbiddenException('No tienes permisos para comprar.');");
        N.push("  }");
        N.push("");
        N.push("Resultado, cruzando el permiso con la tabla de arriba:");
        N.push("  Administrador  -> tiene *            -> PASA");
        N.push("  Cliente        -> ver_catalogo,comprar... -> 403");
        N.push("  Cajero         -> registrar_venta    -> 403");
        N.push("  Encargado      -> sin el permiso     -> 403");
        N.push("  Invitado       -> no se comprueba    -> PASA");
        N.push("");
        N.push("O sea que el unico usuario autenticado que puede agregar al carrito es el");
        N.push("administrador, y el visitante sin sesion tambien puede. El Cliente, que es el actor");
        N.push("principal del caso y el unico para el que tiene sentido la compra, recibe 403. Es");
        N.push("justo al reves de lo que dice el caso, y peor: donde el caso espera un 403 para un");
        N.push("rol de mas, el 403 se lleva al rol de menos.");
        N.push("");
        N.push("El permiso que el Cliente si tiene es comprar, y el del Cajero es registrar_venta, y");
        N.push("ninguno de los dos es el que se comprueba. Con cambiar la cadena por comprar se");
        N.push("arreglaria el caso del Cliente, pero el Cajero seguiria fuera, porque comprar no es");
        N.push("su permiso. Habria que decidir si el carrito es de clientes, de cajeros o de los dos.");
        N.push("");
        N.push("Y hay un segundo defecto en la misma funcion, en cargarPermisos:");
        N.push("");
        N.push("  const [fila] = (await this.dataSource.query(");
        N.push("    `SELECT r.permisos_json");
        N.push("     FROM usuarios u");
        N.push("     JOIN usuarios_roles ur ON ur.id_usuario = u.id_usuario");
        N.push("     JOIN roles r ON r.id_rol = ur.id_rol");
        N.push("     WHERE u.id_usuario = $1`,");
        N.push("    [usuario.id_usuario],");
        N.push("  )) as Array<{ permisos_json: string[] }>;");
        N.push("  return fila?.permisos_json ?? [];");
        N.push("");
        N.push("La consulta devuelve una fila POR ROL, y el destructuring se queda solo con la");
        N.push("primera. O sea que un usuario con dos roles recibe los permisos de uno de los dos, y");
        N.push("cual de los dos no lo decide ni el SQL ni el codigo, porque no hay ORDER BY. Es un");
        N.push("fallo silencioso: no da error, simplemente ignora la mitad de los permisos. Y como");
        N.push("el permiso buscado no existe en ningun rol, el efecto practico es que da igual");
        N.push("cuantos roles tenga el usuario, salvo que uno sea el de Administrador.");
        N.push("");
        N.push("El cast as Array<{ permisos_json: string[] }> tampoco corresponde a la base:");
        N.push("permisos_json es JSONB y lo que devuelve el driver hay que leerlo a mano. Si el driver");
        N.push("lo devolviera como texto en vez de como arreglo, permisos.includes('*') pasaria a");
        N.push("ser una busqueda de subcadena, y el asterisco se encontraria dentro de casi cualquier");
        N.push("cadena. Conviene comprobarlo en ejecucion, porque segun como este el driver el");
        N.push("resultado seria 403 para todos o acceso para todos.");
        N.push("");
        N.push("HALLAZGO CRITICO 1: EL CARRITO ES DE INVITADO Y EL ESQUEMA NO TIENE LA COLUMNA.");
        N.push("");
        N.push("Los cuatro handlers usan JwtOpcionalAuthGuard, no JwtAuthGuard. Ese guard tiene:");
        N.push("  if (!token) return true;");
        N.push("O sea que una peticion SIN token pasa el guard. Y ademas lee un header:");
        N.push("  const tokenInvitado = (request.headers['x-carrito-token'] ?? '').trim() || null;");
        N.push("que el param decorator CredencialesCarritoActual mete en CredencialesCarrito,");
        N.push("junto con el usuario. El servicio recibe { usuario, tokenInvitado }.");
        N.push("");
        N.push("Y el servicio implementa las cuatro ramas que hacen falta para un carrito de invitado:");
        N.push("  1. con usuario, ya tiene carrito Activo      -> se usa ese");
        N.push("  2. con usuario, sin carrito, con token       -> UPDATE carritos SET id_usuario = $1, token_invitado = NULL");
        N.push("     o sea, FUSIONA el carrito de invitado al iniciar sesion");
        N.push("  3. con usuario, sin carrito ni token        -> INSERT nuevo");
        N.push("  4. sin usuario, con token o sin el         -> INSERT con randomUUID()");
        N.push("");
        N.push("Problema: la tabla carritos (schema.sql:368) es");
        N.push("  id_carrito, id_usuario, estado, id_sucursal, fecha_creacion");
        N.push("y NO TIENE token_invitado. Y schema.sql no tiene ni un ALTER TABLE.");
        N.push("");
        N.push("Consecuencias concretas:");
        N.push("  - Invitado que agrega un item -> INSERT INTO carritos (token_invitado, ...) -> 42703 -> 500.");
        N.push("    El carrito de invitado esta roto de principio a fin.");
        N.push("  - Usuario autenticado SIN carrito activo y CON el header presente -> el SELECT de la");
        N.push("    rama 2 busca WHERE c.token_invitado = $1 -> 42703 -> 500.");
        N.push("  - Usuario autenticado con carrito activo -> funciona, porque la rama 1 no toca la columna.");
        N.push("  - Usuario autenticado sin carrito y SIN header -> funciona, porque el ternario se");
        N.push("    cortocircuita y salta la rama 2.");
        N.push("");
        N.push("O sea que CU33 solo funciona en un caso muy estrecho: usuario autenticado, con carrito");
        N.push("activo, o sin carrito y sin el header. Todo lo demas devuelve 500. Es el mismo tipo de");
        N.push("fallo que CU32 con foto_resultado, pero aqui afecta a la columna central del caso.");
        N.push("");
        N.push("HALLAZGO CRITICO 2: EL FRONTEND BORRA EL TOKEN QUE HARIA FUNCIONAR LA FUSION.");
        N.push("");
        N.push("La parte 2 del backend, fusionar el carrito de invitado al iniciar sesion, es un trabajo");
        N.push("bien hecho y sin embargo es codigo muerto, por dos razones independientes:");
        N.push("");
        N.push("  1. AuthContext.tsx:66 llama guardarTokenInvitado(null) al iniciar sesion, y eso hace");
        N.push("     localStorage.removeItem(TOKEN_INVITADO_KEY). O sea que para cuando el usuario ya");
        N.push("     esta autenticado y toca el carrito, el token de invitado ya no existe, credenciales.");
        N.push("     tokenInvitado llega a null y la rama 2 no se ejecuta. Se crea un carrito NUEVO y");
        N.push("     vacio, y lo que el visitante habia dejado se pierde.");
        N.push("  2. Aunque el token llegara, la columna no existe y la consulta fallaria.");
        N.push("");
        N.push("El resultado es que el carrito de invitado, que el backend soporta entero, no sobrevive");
        N.push("al login. Y es la misma promesa que CU28 hacia con las reservas:.sessionStorage para");
        N.push("guardar el borrador entre la redireccion al login y la vuelta.");
        N.push("");
        N.push("HALLAZGO CRITICO 3: E1 ESTA MAL PLANTEADA. SIN SESION NO HAY 403, HAY CARRITO.");
        N.push("");
        N.push("  const idUsuario = credenciales.usuario?.id_usuario ?? null;");
        N.push("  if (credenciales.usuario) {");
        N.push("    await this.exigirPermisoVenta(credenciales.usuario);");
        N.push("  }");
        N.push("");
        N.push("La comprobacion de permiso esta DENTRO de un if. Sin usuario no se comprueba nada, y el");
        N.push("invitado puede agregar prendas, ver su carrito, cambiar cantidades y quitar items sin");
        N.push("tener ningun permiso.");
        N.push("");
        N.push("El caso dice que E1 es 403 No tienes permisos para comprar. Ese 403 solo ocurre con un");
        N.push("token valido de un usuario sin realizar_venta, o con un token caducado, revocado o de");
        N.push("una cuenta deshabilitada, que son los otros tres mensajes del guard. Para el visitante");
        N.push("sin sesion no hay 403: hay un carrito.");
        N.push("");
        N.push("Y es una decision de producto coherente con CU32, que tambien ofrece agregar al carrito");
        N.push("desde la app, y con el patron guest checkout que el propio caso CU28 invoca de referencia.");
        N.push("Lo que falla es que el caso lo describe como un carrito autenticado.");
        N.push("");
        N.push("HALLAZGO 4: SI EL CARRITO YA EXISTE, LA SUCURSAL DEL REQUEST SE IGNORA.");
        N.push("");
        N.push("La rama 1 devuelve id_sucursal: Number(existente.id_sucursal), o sea la del carrito");
        N.push("existente, no la que vino en el body. Y el paso siguiente lo confirma:");
        N.push("");
        N.push("  await this.validarStock(prenda, Number(dto.id_sucursal), cantidad);   // sucursal del REQUEST");
        N.push("  ...");
        N.push("  await this.validarStock(prenda, carrito.id_sucursal, nuevaCantidad);  // sucursal del CARRITO");
        N.push("");
        N.push("En una sola peticion se valida el stock de DOS sucursales distintas. La primera");
        N.push("comprobacion es trabajo tirado si el item ya existia, porque la segunda es la que");
        N.push("manda. Y si el cliente pide la sucursal B con un carrito que ya es de la A, la prenda");
        N.push("acaba en el carrito de la A sin avisar. El caso dice que la sucursal seleccionada es la");
        N.push("que el cliente elige, y en la practica es la que el carrito eligio el primero.");
        N.push("");
        N.push("HALLAZGO 5: LA SUCURSAL SE VALIDA CON ESTADO = 'Activo' O 'Activa'?");
        N.push("");
        N.push("El caso dice que la sucursal debe estar en estado 'Activo'. En el resto del proyecto");
        N.push("el valor es 'Activa' en femenino, y es lo que comprueba validarSucursalActiva. Ademas");
        N.push("el caso usa 'Activo' tambien para el carrito, y ahi si es correcto: carritos.estado es");
        N.push("'Activo'. O sea que el mismo caso mezcla los dos generos en el mismo parrafo, y solo");
        N.push("uno de los dos acierta.");
        N.push("");
        N.push("HALLAZGO 6: precioVigente tiene reglas que el caso simplifica de más.");
        N.push("");
        N.push("  SELECT precio FROM producto_precios");
        N.push("  WHERE id_ptc = $1 AND fecha_inicio <= CURRENT_DATE");
        N.push("    AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE)");
        N.push("  ORDER BY id_precio DESC LIMIT 1");
        N.push("");
        N.push("Tres cosas que el caso no dice. Una: fecha_fin NULL significa precio abierto, no");
        N.push("invalido, asi que un precio sin fecha de fin se aplica para siempre. Dos: si hay dos");
        N.push("filas de precio que se solapan en el tiempo, gana la de id_precio mas alto, o sea la");
        N.push("mas reciente. Es una regla sensata y es la unica garantia, porque la tabla no tiene");
        N.push("NINGUN indice que impida el solape: no hay EXCLUDE por rango ni UNIQUE parcial. Tres:");
        N.push("la columna es id_ptc, no id_producto, o sea que el precio es por talla y color, no por");
        N.push("prenda. Eso es lo correcto para un catalogo con variantes, y el caso no lo menciona.");
        N.push("");
        N.push("HALLAZGO 7: carrito_items NO TIENE subtotal, Y EL SUBTOTAL SE CALCULA AL VUELO.");
        N.push("");
        N.push("recalcularSubtotal hace un SUM(cantidad * precio_unitario) sobre carrito_items cada vez");
        N.push("que se agrega, actualiza o quita algo. No hay columna que lo persista, y no podria");
        N.push("haberla sin el problema de que quede desfasada: si el precio de un item cambia en");
        N.push("producto_precios, el subtotal guardado ya no seria el correcto, mientras que el calculado");
        N.push("al vuelo si lo es. La decision es buena y tiene un coste: cada operacion del carrito es");
        N.push("una consulta mas de agregacion, y el panel tiene que usar el valor devuelto en lugar de");
        N.push("leer de la base.");
        N.push("");
        N.push("Y lo coherente con lo anterior: precio_unitario se congela al agregar el item, no se");
        N.push("recalcula al ver el carrito. O sea que un cliente puede tener en el carrito un precio que");
        N.push("ya no es el vigente, y se llevara ese al pagar. No es un error, es una decision de");
        N.push("ecommerce, pero conviene que sea consciente.");
        N.push("");
        N.push("HALLAZGO 8: la variable accion se calcula y se tira.");
        N.push("");
        N.push("  let accion: 'INSERT' | 'UPDATE';");
        N.push("  ...");
        N.push("  accion = 'UPDATE';   // o 'INSERT'");
        N.push("  ...");
        N.push("  void accion;");
        N.push("");
        N.push("Se asigna en las dos ramas y despues se descarta explicitamente con void. La respuesta");
        N.push("recibe la coincidencia del item, que es lo que la UI usa para resaltar lo anadido, pero");
        N.push("no recibe la accion. Es un resto de una version que la devolvia. Y la variable");
        N.push("coincidencia tampoco se usa en armarCarrito como tal, segun la llamada.");
        N.push("");
        N.push("HALLAZGO 9: la bitacora acepta id_usuario NULL, y eso es correcto.");
        N.push("");
        N.push("  bitacora_auditoria.id_usuario  INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL");
        N.push("");
        N.push("No tiene NOT NULL, y lleva ON DELETE SET NULL. O sea que el carrito de invitado puede");
        N.push("auditarse con id_usuario nulo, que es justo lo que hace el servicio con");
        N.push("idUsuario = credenciales.usuario?.id_usuario ?? null. Es el unico sitio del proyecto");
        N.push("donde el esquema esta pensado para accommodating al invitado, y contrasta con las");
        N.push("tablas de CU28 y CU32, donde el usuario es obligatorio.");
        N.push("");
        N.push("HALLAZGO 10: NINGUNA DE LAS TRES ESCRITURAS USA TRANSACCION.");
        N.push("");
        N.push("agregarItem escribe el item y luego la bitacora, sin transaction. En el camino de");
        N.push("UPDATE, el UPDATE del item, la bitacora, el recalculo del subtotal y la carga de items");
        N.push("son cuatro consultas sueltas. Si la bitacora falla, el item queda agregado y el cliente");
        N.push("recibe un 500, y un reintento suma la cantidad otra vez. Es la septima aparicion de");
        N.push("este defecto, tras CU21, CU28, CU29, CU30, CU32 y CU33 mismo. Y en el carrito el");
        N.push("efecto del reintento es peor, porque la operacion NO es idempotente: agregar dos veces");
        N.push("el mismo item hace cantidad = cantidad + cantidad, no una actualizacion idempotente.");
        N.push("El E7 del caso, el boton en loading, es la unica proteccion y es de cliente.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - Los mensajes de E3, E4 y E5 son los mismos que en CU28 y CU29, porque se");
        N.push("    reutilizan el mismo estilo de validacion de prenda. Prenda no encontrada. y La");
        N.push("    cantidad debe ser mayor a cero. son los que dice el caso, pero conviene notar que la");
        N.push("    validacion de cantidad esta en el servicio (422) y no en el DTO, que solo lleva");
        N.push("    un @IsInt sin mensaje. O sea que un cantidad = 0 pasa el DTO y lo corta el servicio.");
        N.push("  - E5, La sucursal seleccionada no está disponible., es un texto propio del carrito.");
        N.push("    El de CU28 para la misma situacion es La sucursal seleccionada no está activa. Son");
        N.push("    dos mensajes para la misma causa en dos modulos, y el caso de CU33 acierta con el");
        N.push("    suyo pero con el genero equivocado en el estado.");
        N.push("  - El caso menciona que el badge suma 1 por cada agregado. El codigo no lleva un");
        N.push("    contador incremental en ningun sitio: el badge se deriva del numero de items que");
        N.push("    devuelve armarCarrito, que recalcula desde cero. Es mas correcto, porque si se");
        N.push("    fusiona una Cantidad may que 1 el incremento no es 1, pero es otra consulta.");
        N.push("  - Cuando el item ya existia, la bitacora graba old_data con la cantidad anterior y la");
        N.push("    nueva, y con precio_unitario en ambos lados aunque el precio no cambie. Es un poco");
        N.push("    ruidoso pero fiel, y con la ventaja de que el precio queda auditado en el momento");
        N.push("    en que se congelo.");
        N.push("  - El servicio tiene 17 metodos pero el caso solo describe agregarItem. consultar,");
        N.push("    actualizarCantidad y quitar son los otros tres endpoints del controlador y los");
        N.push("    usa el panel lateral, asi que el caso los da por supuestos. validarStock se usa");
        N.push("    tambien desde actualizar y quitar, no solo al agregar.");
        N.push("  - El modulo se llama carrito y la carpeta CarritoModule.ts usa el prefijo SRV_ y CTR_");
        N.push("    como el resto, a diferencia del de sesiones-ra de CU32.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU33 - AGREGAR PRODUCTOS AL CARRITO - INFORME");
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
    msg = msg + "CU33 - Agregar productos al carrito" + SALTO + SALTO;
    msg = msg + "ATENCION: realizar_venta NO esta en ningun rol sembrado." + SALTO;
    msg = msg + "Solo pasan Administrador (*) y el Invitado (sin check)." + SALTO + SALTO;
    msg = msg + "El carrito es de INVITADO (guard opcional) y carritos no" + SALTO;
    msg = msg + "tiene la columna token_invitado: el invitado da 500." + SALTO + SALTO;
    msg = msg + "Clases: 24    Actores: 4    Relaciones: " + TOTAL_REL + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de " + TOTAL_ATR + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de " + TOTAL_OPE + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de " + TOTAL_REL + SALTO;
    if (conEnDiagrama < TOTAL_REL) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "AVISO 2: sin sesion no hay 403; el permiso se salta." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU33 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU33 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU33", 0); } catch (e3) { }
}
