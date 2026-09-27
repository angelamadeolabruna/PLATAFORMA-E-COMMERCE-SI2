// ================================================================
// CU29 - CONSULTAR Y CANCELAR EL ESTADO DE UNA RESERVA
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   web/src/pages/cliente/MisReservas.tsx        lista; usa varianteEstadoReserva de lib/reservas
//   web/src/pages/cliente/DetalleReserva.tsx     timeline de 3 pasos; esCancelable en el cliente
//   web/src/lib/reservas.ts                      varianteEstadoReserva con los 5 estados
//   api/src/modulos/reservas/CTR_Reservas.ts     mias, :id y :id/cancelar con guard
//   api/src/modulos/reservas/SRV_ReservasService.ts  consultarMias:413, consultarDetalle:445,
//                                                    itemDetalle:885, cancelar:910
//   schema.sql:56  reservas    estado VARCHAR(20) sin CHECK, sin columna numero
//   schema.sql:66  reserva_items  sin precio_unitario
//   schema.sql:628 trigger BEFORE INSERT que suma el stock en la cancelacion
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

var DEF = [
    ["IU_MisReservas", "EXISTE. pages/cliente/MisReservas.tsx", "lista las reservas del Cliente, de la mas reciente a la mas antigua",
     [["reservas", "Array", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["toast", "String", VIS_PUB], ["permisoOk", "Boolean", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_ReservaTarjeta", "EXISTE. MisReservas.tsx", "la tarjeta; pinta numero, estado y cantidad de prendas",
     [["reserva", "ReservaListaItem", VIS_PUB]],
     [["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_DetalleReserva", "EXISTE. pages/cliente/DetalleReserva.tsx", "detalle con la linea de tiempo y el boton de cancelar",
     [["datos", "Object", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["es404", "Boolean", VIS_PUB], ["confirmarCancelacion", "Boolean", VIS_PUB], ["cancelando", "Boolean", VIS_PUB], ["toast", "Object", VIS_PUB], ["esCancelable", "Boolean", VIS_PUB], ["pasos", "Array", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["cancelar", "void", [], VIS_PUB], ["esCancelable", "Boolean", [], VIS_PUB], ["pasosDe", "Array", ["reserva"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_ConfirmarCancelar", "EXISTE. DetalleReserva.tsx", "el dialogo; su texto coincide exacto con el caso",
     [["abierto", "Boolean", VIS_PUB], ["reserva", "Object", VIS_PUB], ["cancelando", "Boolean", VIS_PUB]],
     [["confirmar", "void", [], VIS_PUB], ["cerrar", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "EXISTE. lib/api.ts", "listarReservasMias, obtenerReservaDetalle y cancelarReserva",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["listarReservasMias", "Array", [], VIS_PUB], ["obtenerReservaDetalle", "Object", ["idReserva"], VIS_PUB], ["cancelarReserva", "Object", ["idReserva"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_ReservasController", "EXISTE. reservas/CTR_Reservas.ts", "estos tres handlers llevan guard; opciones no",
     [["reservasService", "ReservasService", VIS_PRI]],
     [["mias", "Array", ["currentUser"], VIS_PUB], ["detalle", "Object", ["id", "currentUser"], VIS_PUB], ["cancelar", "Object", ["id", "request", "currentUser"], VIS_PUB], ["opciones", "Object", [], VIS_PUB], ["disponibilidad", "Object", ["idSucursal"], VIS_PUB]]],

    ["SRV_ReservasService", "EXISTE. reservas/SRV_ReservasService.ts", "cancelar:910; NO usa liberarStockReserva, trae su propio bucle",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI], ["emailService", "EmailService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermiso", "void", ["usuario"], VIS_PRI], ["clienteDe", "Integer", ["usuario"], VIS_PRI], ["formatearFechaHora", "String", ["valor"], VIS_PRI], ["formatearHora", "String", ["valor"], VIS_PRI], ["formatearFecha", "String", ["valor"], VIS_PRI], ["numeroReserva", "String", ["idReserva"], VIS_PRI], ["consultarMias", "Array", ["usuario"], VIS_PUB], ["consultarDetalle", "Object", ["usuario", "idReserva"], VIS_PUB], ["itemDetalle", "Array", ["idReserva"], VIS_PRI], ["cancelar", "Object", ["usuario", "idReserva", "request"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "EXISTE. seguridad/dependencias.ts", "canActivate propio; header Bearer o cookie access_token",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_BitacoraService", "EXISTE. seguridad/SRV_BitacoraService.ts", "una sola llamada, y queda fuera de la transaccion",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "una transaccion con SELECT ... FOR UPDATE sobre la reserva",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "Object", ["callback"], VIS_PUB], ["getRepository", "Repository", ["entidad"], VIS_PUB]]],

    ["SRV_TriggerMovimientoInventario", "EXISTE. schema.sql:628", "el que suma el stock devuelto en la cancelacion",
     [["v_disponible", "Integer", VIS_PRI]],
     [["fn_aplicar_movimiento_inventario", "void", ["NEW"], VIS_PUB]]],

    ["CE_Reserva", "EXISTE. tabla reservas (schema.sql:56)", "cinco estados posibles; VARCHAR(20) sin CHECK y sin columna numero",
     [["id_reserva", "Integer = PK", VIS_PRI], ["id_cliente", "Integer", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["fecha_reserva", "Date", VIS_PUB], ["hora_reserva", "Time", VIS_PUB], ["estado", "String = Solicitada", VIS_PUB], ["id_encargado", "Integer", VIS_PUB], ["fecha_creacion", "Timestamp = NOW()", VIS_PUB], ["fecha_preparada", "Timestamp", VIS_PUB], ["fecha_atendida", "Timestamp", VIS_PUB]],
     []],

    ["CE_ReservaItem", "EXISTE. tabla reserva_items (schema.sql:66)", "sin precio_unitario ni subtotal",
     [["id_reserva_item", "Integer = PK", VIS_PRI], ["id_reserva", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer = 1", VIS_PUB]],
     []],

    ["CE_Cliente", "EXISTE. tabla clientes (schema.sql:87)", "el Dueño de la reserva; sin columna estado",
     [["id_cliente", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["direccion", "Text", VIS_PUB], ["fecha_registro", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. tabla usuarios", "de donde sale el permiso y el id_usuario de la bitacora",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120", VIS_PRI], ["estado", "String", VIS_PUB]],
     []],

    ["CE_Sucursal", "EXISTE. tabla sucursales", "de donde sale el nombre que pinta la tarjeta",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_InventarioStock", "EXISTE. tabla inventario_stock (schema.sql:302)", "el trigger suma disponible; el codigo resta reservada",
     [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_reservada", "Integer = 0", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB], ["stock_minimo_alert", "Integer = 0", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. tabla producto_talla_color", "la prenda; el detalle llega a traves de ella",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB], ["estado_stock", "String = Disponible", VIS_PUB]],
     []],

    ["CE_Producto", "EXISTE. tabla productos", "de donde sale el nombre de la prenda",
     [["id_producto", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["id_categoria", "Integer", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_Talla", "EXISTE. tabla tallas", "de donde sale el nombre de la talla",
     [["id_talla", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["orden", "Integer", VIS_PUB]],
     []],

    ["CE_Color", "EXISTE. tabla colores", "de donde sale el nombre del color",
     [["id_color", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB]],
     []],

    ["CE_MovimientoInventario", "EXISTE. tabla movimientos_inventario (schema.sql:421)", "la cancelacion escribe SALIDA-RESERVA con cantidad POSITIVA",
     [["id_movimiento", "Integer = PK", VIS_PRI], ["id_ptc", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["tipo_movimiento", "String = SALIDA-RESERVA", VIS_PUB], ["cantidad", "Integer = positiva al cancelar", VIS_PUB], ["stock_anterior", "Integer = lo pone el trigger", VIS_PUB], ["stock_posterior", "Integer = lo pone el trigger", VIS_PUB], ["referencia", "String = Cancelacion RES-000001", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_orden_compra", "Integer", VIS_PUB], ["id_venta", "Integer", VIS_PUB], ["id_reserva", "Integer", VIS_PUB], ["fecha", "Timestamp = la sobrescribe el trigger", VIS_PUB]],
     []],

    ["CE_BitacoraAuditoria", "EXISTE. tabla bitacora_auditoria", "UPDATE sobre reservas con old_data y new_data de un campo",
     [["id_bitacora", "Integer = PK", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "String", VIS_PUB], ["user_agent", "String", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_ReservaListaItem", "EXISTE. SRV_ReservasService.ts", "cantidad_prendas cuenta LINEAS, no unidades",
     [["id_reserva", "Integer", VIS_PUB], ["numero", "String = recalculado", VIS_PUB], ["estado", "String", VIS_PUB], ["sucursal", "String", VIS_PUB], ["fecha_reserva", "String", VIS_PUB], ["hora_reserva", "String", VIS_PUB], ["fecha_creacion", "String", VIS_PUB], ["cantidad_prendas", "Integer = COUNT de items", VIS_PUB]],
     []],

    ["CE_ReservaDetalle", "EXISTE. SRV_ReservasService.ts", "envuelve la reserva y su lista de items",
     [["reserva", "Object", VIS_PUB], ["detalle", "Array", VIS_PUB]],
     []],

    ["CE_ReservaDetalleItem", "EXISTE. SRV_ReservasService.ts", "una prenda con su nombre, talla y color resueltos",
     [["id_ptc", "Integer", VIS_PUB], ["nombre_producto", "String", VIS_PUB], ["talla", "String", VIS_PUB], ["color", "String", VIS_PUB], ["cantidad", "Integer", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Cliente", "Cliente autenticado", "gestionar_reservas"],
    ["ACTOR_Encargado", "Encargado de Sucursal", "gestionar_reservas"],
    ["ACTOR_Administrador", "Administrador General", "*"]
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
    var mod = buscarPaquete(cu, "8. Reservas");
    if (mod == null) mod = buscarPaquete(cu, "7. Inventario y Recepciones");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU29 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU29 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        conEnDiagrama += relacion(diag, actores[0], C[0], "usuario", "Association", "", "cliente", "pantalla", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C[2], "usuario", "Association", "", "cliente", "detalle", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C[5], "consulta y cancela", "Association", "", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C[5], "consulta de su sucursal", "Association", "", "encargado", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[2], C[5], "consulta", "Association", "", "administrador", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, C[0], C[1], "tarjeta de cada reserva", "Association", "", "pantalla", "tarjeta", "0..*", "1");
        conEnDiagrama += relacion(diag, C[0], C[2], "abre el detalle", "Association", "", "pantalla", "detalle", "0..1", "1");
        conEnDiagrama += relacion(diag, C[0], C[4], "cliente HTTP", "Dependency", "uses", "pantalla", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[0], C[23], "lista mostrada", "Association", "", "pantalla", "item", "0..*", "1");
        conEnDiagrama += relacion(diag, C[1], C[23], "reserva de la tarjeta", "Association", "", "tarjeta", "item", "1", "1");
        conEnDiagrama += relacion(diag, C[2], C[3], "dialogo de cancelación", "Association", "", "detalle", "modal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[2], C[4], "cliente HTTP", "Dependency", "uses", "detalle", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[2], C[24], "detalle cargado", "Association", "", "detalle", "respuesta", "1", "0..1");
        conEnDiagrama += relacion(diag, C[2], C[25], "ítems del detalle", "Association", "", "detalle", "ítem", "0..*", "1");
        conEnDiagrama += relacion(diag, C[3], C[24], "reserva a cancelar", "Association", "", "modal", "respuesta", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[5], "punto de acceso HTTP", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, C[5], C[7], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "0..1");
        conEnDiagrama += relacion(diag, C[5], C[6], "servicio de reservas", "Association", "", "controlador", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[7], "usuario autenticado", "Association", "", "reservas", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[8], "auditoría de la operación", "Association", "", "reservas", "auditor", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[9], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[11], "reserva cancelada", "Composition", "composition", "reservas", "reserva", "1", "0..*");
        conEnDiagrama += relacion(diag, C[6], C[12], "ítems liberados", "Composition", "composition", "reservas", "ítem", "1", "0..*");
        conEnDiagrama += relacion(diag, C[6], C[13], "cliente propietario", "Dependency", "uses", "reservas", "cliente", "1", "0..1");
        conEnDiagrama += relacion(diag, C[6], C[16], "stock liberado", "Composition", "composition", "reservas", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C[6], C[21], "movimiento de devolución", "Composition", "composition", "reservas", "movimiento", "1", "0..*");
        conEnDiagrama += relacion(diag, C[6], C[15], "sucursal de la reserva", "Dependency", "uses", "reservas", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[6], C[23], "lista producida", "Association", "", "reservas", "item", "0..*", "1");
        conEnDiagrama += relacion(diag, C[6], C[24], "detalle producido", "Association", "", "reservas", "respuesta", "1", "1");
        conEnDiagrama += relacion(diag, C[7], C[14], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");
        conEnDiagrama += relacion(diag, C[8], C[22], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        conEnDiagrama += relacion(diag, C[8], C[9], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[10], C[21], "movimiento procesado", "Composition", "composition", "trigger", "movimiento", "1", "0..*");
        conEnDiagrama += relacion(diag, C[10], C[16], "stock aplicado", "Composition", "composition", "trigger", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C[11], C[13], "cliente de la reserva", "Association", "", "reserva", "cliente", "1", "0..1");
        conEnDiagrama += relacion(diag, C[11], C[14], "usuario de la reserva", "Association", "", "reserva", "usuario", "1", "0..1");
        conEnDiagrama += relacion(diag, C[11], C[15], "sucursal de retiro", "Association", "", "reserva", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[12], C[11], "reserva del ítem", "Composition", "composition", "ítem", "reserva", "1", "1");
        conEnDiagrama += relacion(diag, C[12], C[17], "prenda del ítem", "Association", "", "ítem", "ptc", "1", "0..1");
        conEnDiagrama += relacion(diag, C[13], C[14], "usuario del cliente", "Association", "", "cliente", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C[16], C[17], "stock por ptc", "Association", "", "stock", "ptc", "1", "1");
        conEnDiagrama += relacion(diag, C[16], C[15], "stock por sucursal", "Association", "", "stock", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[17], C[18], "producto del ptc", "Association", "", "ptc", "producto", "1", "1");
        conEnDiagrama += relacion(diag, C[17], C[19], "talla del ptc", "Association", "", "ptc", "talla", "1", "0..1");
        conEnDiagrama += relacion(diag, C[17], C[20], "color del ptc", "Association", "", "ptc", "color", "1", "0..1");
        conEnDiagrama += relacion(diag, C[21], C[17], "prenda del movimiento", "Association", "", "movimiento", "ptc", "1", "0..1");
        conEnDiagrama += relacion(diag, C[21], C[15], "sucursal del movimiento", "Association", "", "movimiento", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[21], C[14], "usuario del movimiento", "Association", "", "movimiento", "usuario", "0..1", "0..1");
        conEnDiagrama += relacion(diag, C[21], C[11], "reserva del movimiento", "Dependency", "uses", "movimiento", "reserva", "0..1", "0..1");
        conEnDiagrama += relacion(diag, C[22], C[14], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");
        conEnDiagrama += relacion(diag, C[23], C[11], "reserva listada", "Dependency", "uses", "item", "reserva", "1", "1");
        conEnDiagrama += relacion(diag, C[24], C[11], "reserva del detalle", "Dependency", "uses", "respuesta", "reserva", "1", "1");
        conEnDiagrama += relacion(diag, C[25], C[17], "prenda del item", "Dependency", "uses", "item", "ptc", "1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("3 actores, 26 clases y 45 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (5), CTR_ controlador (1), SRV_ servicio (5), CE_ entidad o DTO (15).");
        N.push("");
        N.push("HALLAZGO CRITICO 1: LA CANCELACION TIENE DOS COPIAS DEL CODIGO DE LIBERAR STOCK, Y SOLO");
        N.push("UNA ESTA BIEN. LA OTRA SUMA EL STOCK DOS VECES.");
        N.push("");
        N.push("La copia de cancelar (linea 968) hace:");
        N.push("  INSERT INTO movimientos_inventario (..., 'SALIDA-RESERVA', +cantidad, ...)");
        N.push("  UPDATE inventario_stock SET cantidad_reservada = GREATEST(0, cantidad_reservada - cantidad)");
        N.push("");
        N.push("El UPDATE solo toca cantidad_reservada. El disponible lo suma el trigger, porque la");
        N.push("cantidad es positiva. Cada columna se ve afectada una vez. CORRECTO.");
        N.push("");
        N.push("La otra copia, liberarStockReserva (linea 682), hace:");
        N.push("  INSERT INTO movimientos_inventario (..., 'SALIDA-RESERVA', +cantidad, ...)");
        N.push("  UPDATE inventario_stock SET cantidad_reservada = GREATEST(0, cantidad_reservada - cantidad),");
        N.push("                             cantidad_disponible = cantidad_disponible + cantidad");
        N.push("");
        N.push("Aqui el UPDATE SUMA cantidad_disponible Y ADEMAS el trigger ya lo habia sumado por el");
        N.push("movimiento. Resultado: el disponible se incrementa DOS VECES por cada prenda liberada.");
        N.push("Es el error de doble conteo de stock mas claro de todo el proyecto.");
        N.push("");
        N.push("Y no es teorico: liberarStockReserva se llama en la linea 861, dentro de finalizarReserva,");
        N.push("que es CU31. O sea que al FINALIZAR una reserva en tienda el stock se infla al doble, y");
        N.push("eso se propaga a las alertas de CU25 y al consolidado de CU26. cancelar, que es este");
        N.push("caso, esta bien. Lo que falla es el camino de la sucursal.");
        N.push("");
        N.push("La causa de fondo es que la logica de liberar stock esta duplicada en la misma clase en");
        N.push("lugar de estar en un unico metodo, y las dos copias no coinciden. Si cancelar llamara a");
        N.push("liberarStockReserva, el bug pasaria a ser el de CU29 tambien.");
        N.push("");
        N.push("HALLAZGO 2: LA CANCELACION APARECE EN EL KARDEX COMO UNA SALIDA MAS.");
        N.push("");
        N.push("La reserva y su cancelacion escriben el MISMO tipo_movimiento, 'SALIDA-RESERVA'. La");
        N.push("unica diferencia es el signo de la cantidad y el prefijo de la referencia:");
        N.push("  crear:      'SALIDA-RESERVA', -cantidad, referencia = RES-000001");
        N.push("  cancelar:   'SALIDA-RESERVA', +cantidad, referencia = Cancelacion RES-000001");
        N.push("");
        N.push("El caso de CU29 dice que el movimiento inverso deberia ser de tipo 'Reserva'. No hay tal");
        N.push("valor, igual que en CU28 no lo habia para la salida.");
        N.push("");
        N.push("Consecuencia en el kardex de CU23: la etiqueta es la misma ('Salida por reserva'), el");
        N.push("badge es el mismo ambar, y la cantidad se calcula con cantidadSigno, que hace");
        N.push("-Math.abs(m.cantidad) para todo lo que empieza por SALIDA. O sea que la devolucion de");
        N.push("5 unidades se dibuja como -5, cuando en realidad suma 5 al stock. El saldo acumulado de");
        N.push("la prenda queda descuadrado y no hay forma de que el usuario entienda que esa fila es");
        N.push("una devolucion y no una reserva nueva. Habria que usar 'ENTRADA-RESERVA' o");
        N.push("'DEVOLUCION-RESERVA' y anadirlo a DESCRIPCIONES_TIPO y a badgeDe.");
        N.push("");
        N.push("HALLAZGO 3: cantidad_prendas CUENTA LINEAS, NO UNIDADES.");
        N.push("");
        N.push("  COUNT(ri.id_reserva_item)::int AS total_prendas");
        N.push("");
        N.push("Y el frontend lo pinta asi:");
        N.push("  {r.cantidad_prendas} {r.cantidad_prendas === 1 ? 'prenda' : 'prendas'}");
        N.push("");
        N.push("Una reserva con una sola linea de 5 unidades muestra '1 prenda'. El caso dice que la");
        N.push("tarjeta muestra la cantidad de prendas, y eso es lo que hace el nombre del campo, pero");
        N.push("lo que cuenta son lineas de detalle. Deberia ser SUM(ri.cantidad). El detalle si trae");
        N.push("la cantidad por prenda, de modo que el usuario ve '1 prenda' en la lista y 'x5' al abrir");
        N.push("la reserva, y parece una contradiccion.");
        N.push("");
        N.push("HALLAZGO 4: LA LINEA DE TIEMPO TIENE TRES PASOS, NO CINCO ESTADOS.");
        N.push("");
        N.push("  { etiqueta: 'Solicitada', valor: fecha_creacion, completada: true }");
        N.push("  { etiqueta: 'Preparada',  valor: fecha_preparada, completada: Boolean(fecha_preparada) }");
        N.push("  { etiqueta: 'En tienda',  valor: fecha_atendida, completada: Boolean(fecha_atendida) }");
        N.push("");
        N.push("No hay paso para 'Cumplida' ni para 'Cancelada', aunque varianteEstadoReserva si tiene");
        N.push("los cinco casos con su color. Consecuencia: una reserva que llega a Cumplida muestra la");
        N.push("linea de tiempo detenida en En tienda, sin ninguna seña de que se completo, y solo el");
        N.push("badge verde de la cabecera lo delata. La cancelacion se comunica con un banner aparte");
        N.push("('Esta reserva fue cancelada y ya no esta vigente.'), no con la linea de tiempo.");
        N.push("El caso describe la linea de tiempo como fecha_creacion a fecha_preparada a fecha_atendida,");
        N.push("o sea que en eso acierta; lo que no dice es que Cumplida no tiene paso propio.");
        N.push("");
        N.push("HALLAZGO 5: el estado Cancelada NO tiene columna propia. Reutiliza fecha_atendida.");
        N.push("");
        N.push("La tabla reservas tiene estado, id_encargado, fecha_creacion, fecha_preparada y");
        N.push("fecha_atendida. No hay fecha_cancelacion ni motivo_cancelacion. Una reserva cancelada");
        N.push("tiene estado = 'Cancelada' y fecha_atendida = NULL, o sea que es indistinguible de una");
        N.push("reserva Solicitada o Preparada por el campo de fechas. El unico rastro del momento de la");
        N.push("cancelacion esta en bitacora_auditoria.fecha_hora. Para auditar cuantas reservas se");
        N.push("cancelaron por dia habria que contar en la bitacora, no en la tabla.");
        N.push("");
        N.push("HALLAZGO 6: HAY UN QUINTO MENSAJE DE CANCELACION QUE EL CASO NO LISTA.");
        N.push("");
        N.push("El caso da dos 409 para E4. El codigo tiene tres, y en este orden:");
        N.push("  estado === 'Cancelada'                        -> La reserva ya no esta vigente.");
        N.push("  estado === 'En tienda' || 'Cumplida'         -> La reserva ya fue atendida y no puede cancelarse. Si tienes un inconveniente, contacta a la sucursal.");
        N.push("  cualquier otro estado                          -> La reserva ya no puede cancelarse.");
        N.push("");
        N.push("Los dos primeros son EXACTOS, palabra por palabra, incluidos los puntos suspensivos que");
        N.push("el caso pone. El tercero es una red de seguridad para un estado inesperado, y no esta");
        N.push("en la lista del caso. Se llegaria a el con un estado escrito a mano o con uno que");
        N.push("ningun caso del proyecto produce.");
        N.push("");
        N.push("Y el 404 de E3 tambien es exacto, 'Reserva no encontrada.', y se usa para DOS casos");
        N.push("distintos: id invalido y reserva ajena. El id invalido se comprueba antes de tocar la");
        N.push("base con un NotFoundException propio, y la reserva ajena no aparece en el SELECT porque");
        N.push("la pertenencia va en el WHERE. Ese es el mecanismo anti-enumeracion que el caso praises, y");
        N.push("esta bien: la consulta es WHERE r.id_reserva = $1 AND r.id_cliente = $2, de modo que");
        N.push("una reserva de otro cliente es indistinguible de una que no existe.");
        N.push("");
        N.push("HALLAZGO 7: LA RESPUESTA USA 'message' Y EL RESTO DEL PROYECTO USA 'detail'.");
        N.push("");
        N.push("  return { message: 'Reserva cancelada correctamente.', estado: 'Cancelada' };");
        N.push("");
        N.push("Comparese con los demas casos de escritura, que devuelven detail: CU18 'Proveedor");
        N.push("registrado.', CU21 'Orden de compra OC-000001 creada.', CU25 'Umbral configurado.',");
        N.push("CU28 'Reserva RES-000001 creada.'. Este es el unico del proyecto que devuelve message.");
        N.push("El frontend lo lee bien porque hace resultado.message, pero cualquier cliente que");
        N.push("escriba un manejador generico de errores buscando detail se quedaria sin mensaje en este endpoint.");
        N.push("");
        N.push("HALLAZGO 8: LA BITACORA DE LA CANCELACION QUEDA FUERA DE LA TRANSACCION. TERCERA VEZ.");
        N.push("");
        N.push("La transaccion cierra en la linea 985 y el registrar llega en la 987. Es el mismo patron");
        N.push("que CU21 y CU28. Si la bitacora falla, la reserva queda cancelada con el stock liberado y");
        N.push("sin rastro de auditoria, y el cliente recibe un 500. Como el estado ya es 'Cancelada',");
        N.push("un reintento del usuario ya no entra: la segunda vez recibe 409 'La reserva ya no esta");
        N.push("vigente.' El cliente se queda sin poder hacer nada y el registro se pierde para siempre.");
        N.push("");
        N.push("El contenido de la bitacora si coincide con el caso:");
        N.push("  { estado: estadoActual }  ->  { estado: 'Cancelada' }");
        N.push("con id_registro = idReserva y la IP y el user agent los pone el propio registrar. Ojo");
        N.push("con que solo graba el estado, no las prendas liberadas ni el stock, que es lo que");
        N.push("CU25 si guarda (id_ptc, id_sucursal, stock_minimo_alert).");
        N.push("");
        N.push("HALLAZGO 9: GREATEST(0, ...) ENVELECE LA RESTA DE cantidad_reservada, Y ESO ESCONDE UN BUG.");
        N.push("");
        N.push("  SET cantidad_reservada = GREATEST(0, cantidad_reservada - $3)");
        N.push("");
        N.push("El piso en cero evita que la cantidad reservada quede negativa si algo se libro dos veces.");
        N.push("Bien puesto. Pero tambien hace silencioso un desajuste real: si por un error se cancelara");
        N.push("una reserva ya cancelada, el GREATEST devolveria 0 sin quejarse. En la practica el 409");
        N.push("de estado lo impide, asi que el piso es solo una red de seguridad. Lo que si conviene es");
        N.push("saber que el disponible NO tiene ese piso: la suma es sin GREATEST, asi que cualquier");
        N.push("doble liberacion se ve como un crecimiento silencioso en el stock, que es justo el hallazgo 1.");
        N.push("");
        N.push("HALLAZGO 10: el permiso del encargo NO le deja cancelar por el Cliente, como dices, pero");
        N.push("el caso no explica por que. No es una regla de codigo, es de alcance.");
        N.push("");
        N.push("cancelar llama a clienteDe(usuario) y busca WHERE r.id_cliente = $2. Un Encargado de");
        N.push("Sucursal casi seguro no tiene fila en clientes, o tiene una distinta, asi que recibiria");
        N.push("404 'Reserva no encontrada.' por cualquier reserva que intentara cancelar. El efecto");
        N.push("neto es el que el caso describe, pero por la regla de propiedad y no por el permiso:");
        N.push("gestionar_reservas lo comparten Cliente, Encargado y Administrador, y los tres pueden");
        N.push("llegar al endpoint. Lo que separa al Cliente es que existe en clientes.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - El dialogo de confirmacion es EXACTO. El texto del codigo es '¿Estas seguro? Se");
        N.push("    liberara el stock de las prendas reservadas.' con el titulo 'Cancelar reserva', un");
        N.push("    icono ShieldAlert, boton 'Volver' y boton de peligro con loading. Coincide con el caso.");
        N.push("  - El boton de cancelar se muestra con esCancelable = estado === 'Solicitada' || estado");
        N.push("    === 'Preparada', recomputado en el frontend. Duplica la regla del backend por tercera");
        N.push("    vez en el proyecto, como el filtro de alertas en CU25 y el total estimado de CU21. Si");
        N.push("    las dos copias se separan, el boton ofrece una accion que el API va a rechazar.");
        N.push("  - El toast de exito usa resultado.message, o sea el texto del backend, no un literal");
        N.push("    del frontend. Igual que CU19, CU21 y CU28. Hay una tendencia clara en el proyecto a");
        N.push("    que sea el servidor quien redacta el mensaje de exito.");
        N.push("  - DetalleReserva tiene un estado es404 separado, para distinguir la reserva ajena o");
        N.push("    inexistente de un error de servidor y pintar una pagina de no encontrada. Correcto.");
        N.push("  - consultarMias no tiene paginacion, a diferencia de Kardex, Ordenes de Compra y");
        N.push("    Existencias. Un cliente con muchas reservas ve la lista completa. Como no hay ningun");
        N.push("    limite, un usuario con cientos de reservas genera una respuesta grande sin aviso.");
        N.push("  - El ORDER BY es r.fecha_creacion DESC, r.id_reserva DESC, con desempate por id. Coherente");
        N.push("    con lo que dice el caso, y el desempate evita que dos reservas del mismo segundo se");
        N.push("    reordenen entre peticiones.");
        N.push("  - El numero de la tarjeta es numeroReserva(idReserva), recalculado. Confirma lo de CU28:");
        N.push("    la tabla reservas no tiene columna numero y el codigo RES-###### se deriva siempre");
        N.push("    del id. Aqui se ve en la interfaz, en la tarjeta de Mis Reservas.");
        N.push("  - reserva_items no tiene precio_unitario, igual que en CU28. El detalle de la reserva no");
        N.push("    puede mostrar importes aunque el caso no los menciona. Aqui es menos grave porque");
        N.push("    una reserva no cobra nada, pero el Cliente no ve cuanto reservo en dinero.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU29 - CONSULTAR Y CANCELAR UNA RESERVA - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 114");
    T.push("Operaciones reales: " + totalOpe + " de 39");
    T.push("CONECTORES DIBUJADOS: " + conEnDiagrama + " de 53");
    if (conEnDiagrama < 45) T.push("  FALTAN LINEAS. Reejecuta el script: es idempotente y las coloca.");
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
    msg = msg + "CU29 - Consultar y cancelar una reserva" + SALTO + SALTO;
    msg = msg + "Clases: 26    Actores: 3    Relaciones: 53" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 114" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 39" + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de 53" + SALTO;
    if (conEnDiagrama < 45) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "AVISO 1: la cancelacion esta bien; la de finalizar" + SALTO;
    msg = msg + "         (CU31) suma el stock dos veces." + SALTO;
    msg = msg + "AVISO 2: cantidad_prendas cuenta lineas, no unidades." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU29 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU29 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU29", 0); } catch (e3) { }
}

