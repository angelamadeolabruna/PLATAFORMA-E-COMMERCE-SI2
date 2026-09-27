// ================================================================
// CU30 - NOTIFICAR RESERVA A LA SUCURSAL
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   api/src/modulos/reservas/SRV_ReservasService.ts:238  emailsSucursal
//   api/src/modulos/reservas/SRV_ReservasService.ts:249  notificarSucursal, SIN await al enviar
//   api/src/modulos/reservas/SRV_ReservasService.ts:491  consultarReservasSucursal
//   api/src/modulos/reservas/SRV_ReservasService.ts:562  contarPendientesSucursal
//   api/src/modulos/reservas/SRV_ReservasService.ts:1142 la bitacora NOTIFICAR, dentro de CU28
//   web/src/pages/admin/AdminReservas.tsx:44  ACCIONES_POR_ESTADO con 3 transiciones
//   web/src/pages/admin/AdminReservas.tsx:230 el badge se recalcula en el cliente
//   web/src/pages/admin/AdminReservas.tsx:70  total estimado con precio_base
//   web/src/AdminLayout.tsx:62               setInterval(refrescar, 30_000)
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
    ["IU_AdminReservas", "EXISTE. pages/admin/AdminReservas.tsx", "listado de la sucursal; recalcula el badge en el cliente",
     [["lista", "Array", VIS_PUB], ["sucursal", "Object", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["detalleAbierto", "Boolean", VIS_PUB], ["detalle", "Object", VIS_PUB], ["cargandoDetalle", "Boolean", VIS_PUB], ["errorDetalle", "String", VIS_PUB], ["detalleId", "Integer", VIS_PUB], ["toast", "Object", VIS_PUB], ["transicionId", "Integer", VIS_PUB], ["transicionAccion", "String", VIS_PUB], ["permisoOk", "Boolean", VIS_PUB], ["pendientes", "Integer", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["pendientesDe", "Integer", ["lista"], VIS_PUB], ["abrirDetalle", "void", ["idReserva"], VIS_PUB], ["transicionar", "void", ["tipo"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_ModalDetalleSucursal", "EXISTE. AdminReservas.tsx", "detalle con el total estimado y la maquina de estados",
     [["datos", "Object", VIS_PUB], ["totalEstimado", "Number", VIS_PUB], ["alCerrar", "Object", VIS_PUB], ["transicionAccion", "String", VIS_PUB]],
     [["accionDe", "Object", ["estado"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_AdminLayout", "EXISTE. AdminLayout.tsx", "badge del menu lateral y el polling de 30 s",
     [["pendientes", "Integer", VIS_PUB], ["intervalo", "Object", VIS_PUB], ["contador", "Integer", VIS_PUB], ["menuAbierto", "Boolean", VIS_PUB]],
     [["refrescar", "void", [], VIS_PUB], ["useEffect", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "EXISTE. lib/api.ts", "listar, contar, detalle y las tres transiciones",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["listarReservasSucursal", "Object", [], VIS_PUB], ["contarPendientesSucursal", "Object", [], VIS_PUB], ["obtenerDetalleSucursal", "Object", ["idReserva"], VIS_PUB], ["prepararReserva", "Object", ["idReserva"], VIS_PUB], ["confirmarRecepcion", "Object", ["idReserva"], VIS_PUB], ["finalizarReserva", "Object", ["idReserva"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_ReservasController", "EXISTE. reservas/CTR_Reservas.ts", "los tres endpoints de la sucursal llevan guard",
     [["reservasService", "ReservasService", VIS_PRI]],
     [["reservasSucursal", "Object", ["currentUser"], VIS_PUB], ["pendientesSucursal", "Object", ["currentUser"], VIS_PUB], ["detalleSucursal", "Object", ["id", "currentUser"], VIS_PUB], ["opciones", "Object", [], VIS_PUB], ["disponibilidad", "Object", ["idSucursal"], VIS_PUB], ["preparar", "Object", ["id", "request", "currentUser"], VIS_PUB], ["confirmarRecepcion", "Object", ["id", "request", "currentUser"], VIS_PUB], ["finalizar", "Object", ["id", "request", "currentUser"], VIS_PUB]]],

    ["SRV_ReservasService", "EXISTE. reservas/SRV_ReservasService.ts", "notificarSucursal:249; el correo se dispara SIN await",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI], ["emailService", "EmailService", VIS_PRI], ["logger", "Logger", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermiso", "void", ["usuario"], VIS_PRI], ["alcanceSucursal", "Object", ["usuario"], VIS_PRI], ["datosSucursal", "Object", ["idSucursal"], VIS_PRI], ["emailsSucursal", "Array", ["idSucursal"], VIS_PRI], ["notificarSucursal", "void", ["aviso", "idSucursal"], VIS_PRI], ["clienteDe", "Integer", ["usuario"], VIS_PRI], ["formatearFechaHora", "String", ["valor"], VIS_PRI], ["formatearHora", "String", ["valor"], VIS_PRI], ["formatearFecha", "String", ["valor"], VIS_PRI], ["numeroReserva", "String", ["idReserva"], VIS_PRI], ["itemDetalle", "Array", ["idReserva"], VIS_PRI], ["exigirAlcanceSucursalReservas", "void", ["usuario", "idReserva"], VIS_PRI], ["cargarReservaEnAlcance", "Object", ["usuario", "idReserva"], VIS_PRI], ["consultarReservasSucursal", "Object", ["usuario"], VIS_PUB], ["contarPendientesSucursal", "Object", ["usuario"], VIS_PUB], ["consultarDetalleSucursal", "Object", ["usuario", "idReserva"], VIS_PUB]]],

    ["SRV_EmailService", "EXISTE. seguridad/SRV_EmailService", "el envio es fire-and-forget: no se espera la promesa",
     [["transporter", "Object", VIS_PRI], ["smtpHost", "String del entorno", VIS_PRI], ["smtpUser", "String del entorno", VIS_PRI]],
     [["enviarAvisoReserva", "Boolean", ["destinatarios", "asunto", "cuerpo"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "EXISTE. seguridad/dependencias.ts", "canActivate propio; header Bearer o cookie access_token",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_BitacoraService", "EXISTE. seguridad/SRV_BitacoraService.ts", "guarda la fila con accion_sql NOTIFICAR",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "el polling dispara 2 a 4 consultas cada 30 s por encargado",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "Object", ["callback"], VIS_PUB], ["getRepository", "Repository", ["entidad"], VIS_PUB]]],

    ["CE_Reserva", "EXISTE. tabla reservas (schema.sql:56)", "cinco estados; VARCHAR(20) sin CHECK y sin columna numero",
     [["id_reserva", "Integer = PK", VIS_PRI], ["id_cliente", "Integer", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["fecha_reserva", "Date", VIS_PUB], ["hora_reserva", "Time", VIS_PUB], ["estado", "String = Solicitada", VIS_PUB], ["id_encargado", "Integer", VIS_PUB], ["fecha_creacion", "Timestamp = NOW()", VIS_PUB], ["fecha_preparada", "Timestamp", VIS_PUB], ["fecha_atendida", "Timestamp", VIS_PUB]],
     []],

    ["CE_ReservaItem", "EXISTE. tabla reserva_items (schema.sql:66)", "sin precio: el total estimado se calcula en el cliente",
     [["id_reserva_item", "Integer = PK", VIS_PRI], ["id_reserva", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer = 1", VIS_PUB]],
     []],

    ["CE_Cliente", "EXISTE. tabla clientes (schema.sql:87)", "el cliente cuya reserva se atiende; sin columna estado",
     [["id_cliente", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["direccion", "Text", VIS_PUB], ["fecha_registro", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. tabla usuarios", "los empleados de la sucursal que reciben el correo",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120", VIS_PRI], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioEmpleado", "EXISTE. tabla usuarios_empleados (schema.sql:76)", "de aqui sale el alcance por sucursal y la lista de correos",
     [["id_empleado", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE", VIS_PUB], ["sucursal_id", "Integer", VIS_PUB], ["nombre", "String = 120", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["rol", "String = 60", VIS_PUB], ["fecha_baja", "Timestamp", VIS_PUB], ["motivo_baja", "String = 255", VIS_PUB]],
     []],

    ["CE_Sucursal", "EXISTE. tabla sucursales", "la destinataria del aviso; el nombre llega por datosSucursal",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. tabla producto_talla_color", "la prenda del detalle y del resumen de prendas",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB], ["estado_stock", "String = Disponible", VIS_PUB]],
     []],

    ["CE_Producto", "EXISTE. tabla productos", "precio_base es el precio de VENTA que usa el total estimado",
     [["id_producto", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["id_categoria", "Integer", VIS_PUB], ["estado", "String = Activo", VIS_PUB], ["precio_base", "Decimal(10,2)", VIS_PUB]],
     []],

    ["CE_Talla", "EXISTE. tabla tallas", "de donde sale el nombre de la talla en el resumen",
     [["id_talla", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["orden", "Integer", VIS_PUB]],
     []],

    ["CE_Color", "EXISTE. tabla colores", "de donde sale el nombre del color en el resumen",
     [["id_color", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB]],
     []],

    ["CE_BitacoraAuditoria", "EXISTE. tabla bitacora_auditoria", "una fila con accion_sql NOTIFICAR por cada reserva",
     [["id_bitacora", "Integer = PK", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["accion_sql", "String = NOTIFICAR", VIS_PUB], ["tabla_afectada", "String = reservas", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "String", VIS_PUB], ["user_agent", "String", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_ReservaSucursalItem", "EXISTE. SRV_ReservasService.ts", "una fila del listado de la sucursal",
     [["id_reserva", "Integer", VIS_PUB], ["numero", "String = recalculado", VIS_PUB], ["estado", "String", VIS_PUB], ["fecha_reserva", "String", VIS_PUB], ["hora_reserva", "String", VIS_PUB], ["fecha_creacion", "String", VIS_PUB], ["cliente", "String", VIS_PUB], ["prendas", "String", VIS_PUB]],
     []],

    ["CE_ReservasPendientesConteo", "EXISTE. SRV_ReservasService.ts", "el badge; cuenta Solicitada Y Preparada",
     [["total", "Integer", VIS_PUB], ["sucursal", "Object", VIS_PUB]],
     []],

    ["CE_AvisoReserva", "EXISTE. SRV_ReservasService.ts", "el cuerpo del correo; se arma en CU28 y se envia aqui",
     [["numero", "String", VIS_PUB], ["sucursal", "String", VIS_PUB], ["codigo", "String", VIS_PUB], ["fecha_reserva", "String", VIS_PUB], ["hora_reserva", "String", VIS_PUB], ["prendas", "String", VIS_PUB]],
     []],

    ["CE_DetalleReservaSucursal", "EXISTE. SRV_ReservasService.ts", "el modal; sus items si traen precio_base",
     [["reserva", "Object", VIS_PUB], ["items", "Array", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Sistema", "Backend al confirmar CU28", "ninguno: dispara la notificacion"],
    ["ACTOR_Encargado", "Encargado de Sucursal", "gestionar_reservas"],
    ["ACTOR_Administrador", "Administrador General", "*"],
    ["ACTOR_Cliente", "Cliente origen del evento", "gestionar_reservas"]
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
    var paq = subPaquete(mod, "CU30 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU30 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        conEnDiagrama += relacion(diag, actores[0], C[5], "dispara el aviso", "Dependency", "uses", "sistema", "reservas", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C[6], "envio del correo", "Dependency", "uses", "sistema", "correo", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C[8], "registra la notificación", "Dependency", "uses", "sistema", "auditor", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C[0], "usuario", "Association", "", "encargado", "pantalla", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C[2], "badge del menú", "Association", "", "encargado", "layout", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C[4], "gestiona de su sucursal", "Association", "", "encargado", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[2], C[0], "supervisión global", "Association", "", "administrador", "pantalla", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[2], C[4], "supervisión global", "Association", "", "administrador", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[3], C[10], "origen del evento", "Association", "", "cliente", "reserva", "0..*", "1");
        conEnDiagrama += relacion(diag, C[0], C[1], "modal de detalle", "Association", "", "pantalla", "modal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[0], C[2], "contador del menú", "Dependency", "uses", "pantalla", "layout", "1", "0..1");
        conEnDiagrama += relacion(diag, C[0], C[3], "cliente HTTP", "Dependency", "uses", "pantalla", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[0], C[21], "listado de la sucursal", "Association", "", "pantalla", "item", "0..*", "1");
        conEnDiagrama += relacion(diag, C[0], C[15], "sucursal del encabezado", "Association", "", "pantalla", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[0], C[12], "cliente de la reserva", "Association", "", "pantalla", "cliente", "0..*", "1");
        conEnDiagrama += relacion(diag, C[1], C[24], "detalle cargado", "Association", "", "modal", "respuesta", "1", "0..1");
        conEnDiagrama += relacion(diag, C[1], C[11], "ítems de la reserva", "Association", "", "modal", "ítem", "0..*", "1");
        conEnDiagrama += relacion(diag, C[1], C[17], "precio del total estimado", "Dependency", "uses", "modal", "producto", "0..*", "1");
        conEnDiagrama += relacion(diag, C[2], C[3], "cliente HTTP", "Dependency", "uses", "layout", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[2], C[22], "contador del badge", "Association", "", "layout", "conteo", "1", "0..1");
        conEnDiagrama += relacion(diag, C[3], C[4], "punto de acceso HTTP", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, C[4], C[7], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "0..1");
        conEnDiagrama += relacion(diag, C[4], C[5], "servicio de reservas", "Association", "", "controlador", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[6], "envío del correo", "Dependency", "uses", "reservas", "correo", "1", "0..1");
        conEnDiagrama += relacion(diag, C[5], C[7], "usuario autenticado", "Association", "", "reservas", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[8], "auditoría de la notificación", "Association", "", "reservas", "auditor", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[9], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[23], "aviso de correo", "Dependency", "uses", "reservas", "aviso", "1", "0..1");
        conEnDiagrama += relacion(diag, C[5], C[21], "listado producido", "Association", "", "reservas", "item", "0..*", "1");
        conEnDiagrama += relacion(diag, C[5], C[22], "conteo producido", "Association", "", "reservas", "conteo", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[24], "detalle producido", "Association", "", "reservas", "respuesta", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[10], "reserva atendida", "Composition", "composition", "reservas", "reserva", "1", "0..*");
        conEnDiagrama += relacion(diag, C[5], C[14], "empleados de la sucursal", "Dependency", "uses", "reservas", "empleado", "0..*", "1");
        conEnDiagrama += relacion(diag, C[5], C[12], "cliente de la reserva", "Dependency", "uses", "reservas", "cliente", "0..*", "1");
        conEnDiagrama += relacion(diag, C[6], C[13], "destinatarios", "Dependency", "uses", "correo", "usuario", "0..*", "1");
        conEnDiagrama += relacion(diag, C[7], C[13], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");
        conEnDiagrama += relacion(diag, C[8], C[20], "registro de notificación", "Composition", "composition", "auditor", "bitácora", "1", "1");
        conEnDiagrama += relacion(diag, C[8], C[9], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[10], C[12], "cliente de la reserva", "Association", "", "reserva", "cliente", "1", "0..1");
        conEnDiagrama += relacion(diag, C[10], C[13], "usuario de la reserva", "Association", "", "reserva", "usuario", "1", "0..1");
        conEnDiagrama += relacion(diag, C[10], C[15], "sucursal notificadora", "Association", "", "reserva", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[11], C[10], "reserva del ítem", "Composition", "composition", "ítem", "reserva", "1", "1");
        conEnDiagrama += relacion(diag, C[11], C[16], "prenda del ítem", "Association", "", "ítem", "ptc", "1", "0..1");
        conEnDiagrama += relacion(diag, C[12], C[13], "usuario del cliente", "Association", "", "cliente", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C[14], C[15], "sucursal del empleado", "Association", "", "empleado", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[14], C[13], "usuario del empleado", "Association", "", "empleado", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C[16], C[17], "producto del ptc", "Association", "", "ptc", "producto", "1", "1");
        conEnDiagrama += relacion(diag, C[16], C[18], "talla del ptc", "Association", "", "ptc", "talla", "1", "0..1");
        conEnDiagrama += relacion(diag, C[16], C[19], "color del ptc", "Association", "", "ptc", "color", "1", "0..1");
        conEnDiagrama += relacion(diag, C[20], C[13], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");
        conEnDiagrama += relacion(diag, C[21], C[10], "reserva listada", "Dependency", "uses", "item", "reserva", "1", "1");
        conEnDiagrama += relacion(diag, C[22], C[15], "sucursal del conteo", "Dependency", "uses", "conteo", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[23], C[15], "sucursal del aviso", "Dependency", "uses", "aviso", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C[24], C[10], "reserva del detalle", "Dependency", "uses", "respuesta", "reserva", "1", "1");
        conEnDiagrama += relacion(diag, C[24], C[17], "precio base de los ítems", "Dependency", "uses", "respuesta", "producto", "0..*", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("4 actores, 25 clases y 55 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (4), CTR_ controlador (1), SRV_ servicio (5), CE_ entidad o DTO (15).");
        N.push("");
        N.push("HALLAZGO CRITICO 1: EL CORREO SE DISPARA SIN await, ASI QUE EL try/catch NO SIRVE.");
        N.push("");
        N.push("  private async notificarSucursal(aviso, idSucursal): Promise<void> {");
        N.push("    try {");
        N.push("      const emails = await this.emailsSucursal(idSucursal);");
        N.push("      if (emails.length === 0) { this.logger.warn(...); return; }");
        N.push("      ...");
        N.push("      this.emailService.enviarAvisoReserva(emails.join(', '), asunto, cuerpo);   <- SIN await");
        N.push("    } catch (error) {");
        N.push("      this.logger.error(`[CU30] Error enviando correo ...`);");
        N.push("    }");
        N.push("  }");
        N.push("");
        N.push("El unico await del bloque es emailsSucursal. La llamada al correo no se espera, asi que");
        N.push("el try/catch solo protege el SELECT de correos y el armado del texto. Si");
        N.push("enviarAvisoReserva devuelve una promesa rechazada, el catch NO se ejecuta: la rejection");
        N.push("se escapa como unhandled rejection. En Node 15 y posteriores eso imprime un");
        N.push("WARNING y sigue, pero con --unhandled-rejections=throw, que es como arrancan muchos");
        N.push("contenedores, el proceso muere.");
        N.push("");
        N.push("O sea que E4, tal como el caso lo describe, NO esta garantizado. El caso dice que si el");
        N.push("correo falla no se bloquea la operacion y el error queda en los logs. La primera parte es");
        N.push("cierta y es una buena decision; la segunda no, porque el error no llega al logger.error");
        N.push("sino al manejador global de rejections.");
        N.push("");
        N.push("El arreglo es una palabra: await this.emailService.enviarAvisoReserva(...). Con eso el");
        N.push("catch funciona y la linea 263 hace lo que dice. Ademas notificarSucursal ya es async y");
        N.push("el que la llama en crearReserva la espera con await, asi que no habria coste de");
        N.push("bloqueo adicional por el SMTP.");
        N.push("");
        N.push("HALLAZGO CRITICO 2: EL BADGE CUENTA 'Solicitada' Y 'Preparada'. EL CASO DICE QUE SOLO");
        N.push("CUENTA 'Solicitada' Y QUE BAJA AL PASAR A 'Preparada'.");
        N.push("");
        N.push("  contarPendientesSucursal:");
        N.push("    WHERE r.estado IN ('Solicitada','Preparada')");
        N.push("");
        N.push("El caso dice tres veces que el badge cuenta las Solicitadas y que al cambiar a Preparada");
        N.push("el contador baja. Eso NO es lo que hace el codigo. El badge significa 'reservas todavia");
        N.push("sin atender', no 'reservas nuevas', y sigue contando las preparadas hasta que pasan a");
        N.push("En tienda, Cumplida o Cancelada.");
        N.push("");
        N.push("La consecuencia es la que el propio caso anticipa en el paso 6: el Encargado prepara la");
        N.push("reserva, ve que el numero del badge no baja, y no tiene forma de saber que el sistema");
        N.push("funciona o que el caso estaba mal. Lo que seria intuitivo, que el badge baje al dejar de");
        N.push("estar pendiente de preparacion, es justo lo que no ocurre.");
        N.push("");
        N.push("HALLAZGO 3: EL BADGE SE CALCULA DOS VECES, EN EL SERVIDOR Y EN EL CLIENTE.");
        N.push("");
        N.push("  AdminLayout.tsx:62  setInterval(refrescar, 30_000)  -> GET /sucursal/pendientes");
        N.push("  AdminReservas.tsx:230");
        N.push("    (lista ?? []).filter((r) => r.estado === 'Solicitada' || r.estado === 'Preparada').length");
        N.push("");
        N.push("La pagina recalcula el numero desde la lista que ya tiene cargada, aplicando el mismo");
        N.push("criterio que el servidor. Es la CUARTA duplicacion de una regla de negocio entre cliente");
        N.push("y servidor en este proyecto, despues del total estimado de CU21, el filtro de CU25 y el");
        N.push("esCancelable de CU29. El riesgo es el de siempre: si divergen, el sidebar y la pagina");
        N.push("muestran numeros distintos, y el de la pagina se recalcula cada vez que se recarga la");
        N.push("lista mientras el del sidebar llega por polling cada 30 s. Durante ese desfase conviven");
        N.push("los dos numeros.");
        N.push("");
        N.push("HALLAZGO 4: LA PAGINA DE LA SUCURSAL MUESTRA UN TOTAL ESTIMADO Y EL CLIENTE NO.");
        N.push("");
        N.push("  AdminReservas.tsx:70");
        N.push("    const totalEstimado = (datos?.items ?? []).reduce((acc, i) => acc + i.precio_base * i.cantidad, 0);");
        N.push("");
        N.push("El detalle de la sucursal trae precio_base por item y calcula un total en dinero. El");
        N.push("detalle del Cliente, en CU29, no trae ningun total. Y el precio que se multiplica es");
        N.push("precio_base, que es el PRECIO DE VENTA del catalogo, no un precio de reserva: la");
        N.push("reserva no se cobra nunca, asi que ese total no representa nada que se vaya a pagar.");
        N.push("");
        N.push("Es asimetrico y confuso: el Encargado ve 'Bs. 340.00' sobre una reserva que no genera");
        N.push("ningun ingreso, y el Cliente, que es quien reservo, no ve ninguna cifra. Si el total");
        N.push("tiene sentido como referencia de valor de mercaderia apartada, habria que decirlo en la");
        N.push("propia pantalla, porque a primera vista parece un importe a cobrar.");
        N.push("");
        N.push("Y explica por que reserva_items no tiene precio, lo que se vio en CU28 y CU29: el");
        N.push("detalle de la sucursal lo trae de productos.precio_base en el JOIN, y no de la reserva.");
        N.push("");
        N.push("HALLAZGO 5: LA MAQUINA DE ESTADOS DE LA SUCURSAL TIENE UNA ASERTCION QUE PUEDE REVENTAR.");
        N.push("");
        N.push("  const ACCIONES_POR_ESTADO = {");
        N.push("    Solicitada: { tipo: 'preparar',   label: 'Preparar Prendas' },");
        N.push("    Preparada:  { tipo: 'confirmar', label: 'Confirmar Recepcion' },");
        N.push("    'En tienda':{ tipo: 'finalizar',  label: 'Finalizar Atencion' },");
        N.push("  };");
        N.push("  ...");
        N.push("  ACCIONES_POR_ESTADO[datos.reserva.estado]!.tipo === 'preparar' ? ... : ...");
        N.push("");
        N.push("Hay tres estados con entrada y dos sin ella: Cumplida y Cancelada. El acceso usa el");
        N.push("operador no nulo, o sea que el autor asume que la clave existe. Si el detalle se");
        N.push("abriera con una reserva en cualquiera de los dos estados terminales, la expresion daria");
        N.push("undefined y el acceso a .tipo lanzaria un TypeError que tumba el componente.");
        N.push("");
        N.push("En la practica el listado solo trae Solicitada y Preparada, asi que el modal no se abre");
        N.push("para un estado terminal desde el flujo normal, y por eso no ha reventado. Es un");
        N.push("riesgo latente, no un fallo activo: depende de que el listado y el modal se mantengan");
        N.push("sincronizados, y ambos filtros estan escritos por separado.");
        N.push("");
        N.push("HALLAZGO 6: EL CORREO VA A TODOS LOS EMPLEADOS DE LA SUCURSAL, NO AL ENCARGADO.");
        N.push("");
        N.push("  SELECT u.email FROM usuarios_empleados ue");
        N.push("  JOIN usuarios u ON u.id_usuario = ue.usuario_id");
        N.push("  WHERE ue.sucursal_id = $1 AND ue.fecha_baja IS NULL AND LOWER(u.estado) = 'activo'");
        N.push("");
        N.push("El caso dice que se notifica al Encargado. El codico selecciona TODOS los empleados con");
        N.push("fila en usuarios_empleados de esa sucursal, sin filtrar por rol. Con el filtro correcto");
        N.push("de los dos dados de baja y de los usuarios desactivados, lo cual esta bien, pero sin");
        N.push("discriminar por rol. Un cajero de esa sucursal recibe el aviso de una reserva que no le");
        N.push("corresponde.");
        N.push("");
        N.push("Y hay una consecuencia de seguridad: el cuerpo del correo lleva el codigo de la reserva,");
        N.push("la fecha, la hora y la lista completa de prendas con nombre, talla y color. A todas las");
        N.push("direcciones de la sucursal. Si un empleado de tienda tiene acceso al buzon compartido,");
        N.push("el detalle de que garments ha pedido un cliente concreto queda expuesto a todo el");
        N.push("personal, sin ninguna relacion con el alcance por sucursal que el resto del caso si");
        N.push("aplica.");
        N.push("");
        N.push("HALLAZGO 7: E3 ESTA CUBIERTO, PERO SOLO A MEDIAS.");
        N.push("");
        N.push("El caso dice que si la sucursal no tiene Encargado la reserva se queda sin badge para");
        N.push("nadie y queda en los logs. El codico cubre el caso de la lista de correos vacia:");
        N.push("");
        N.push("  if (emails.length === 0) {");
        N.push("    this.logger.warn(`[CU30] Sin correos de empleados activos en la sucursal ${idSucursal}.`);");
        N.push("    return;");
        N.push("  }");
        N.push("");
        N.push("Eso es un warn y un return temprano, exactamente el comportamiento que pide el caso.");
        N.push("Lo que NO ocurre es lo otro que el caso promete: que el Administrador la vea en su");
        N.push("listado global. Eso ya lo hacia el caso, porque el alcance del admin es todas las");
        N.push("sucursales, con independencia de que la sucursal tenga empleados. O sea que la");
        N.push("reserva no se pierde, pero no por este codigo: por el del alcance, que es de CU28.");
        N.push("");
        N.push("HALLAZGO 8: LA TRAZA DE LA NOTIFICACION ESTA DENTRO DE CU28, NO DE CU30.");
        N.push("");
        N.push("El caso CU30 describe la fila de bitacora con accion_sql NOTIFICAR como parte de este");
        N.push("caso. No lo es: se escribe en crearReserva, el metodo de CU28, en las lineas 1142-1151,");
        N.push("con:");
        N.push("");
        N.push("  'NOTIFICAR', 'reservas',");
        N.push("  `Notificacion a sucursal: reserva ${numero} en estado Solicitada.`,");
        N.push("  request, idReserva, null,");
        N.push("  { sucursal: sucursal.nombre ?? dto.id_sucursal, evento: 'Reserva nueva' }");
        N.push("");
        N.push("Coincide con lo que el caso describe, old_data null y new_data con sucursal y evento. Pero");
        N.push("ese registrar y el de la creacion estan los dos FUERA de la transaccion, y despues");
        N.push("viene notificarSucursal, que es lo unico que realmente es de este caso.");
        N.push("");
        N.push("Ademas esa fila dice 'estado Solicitada' y se escribe siempre con ese texto,");
        N.push("independientemente del estado real. Como solo se dispara al crear, y al crear siempre es");
        N.push("Solicitada, hoy no miente. Pero si alguien reutiliza esa llamada para notificar un");
        N.push("cambio de estado, el texto seria falso.");
        N.push("");
        N.push("Y sigue siendo la unica vez que accion_sql recibe un valor que no es SQL, como ya");
        N.push("senalaba CU28. La columna se llama accion_sql y guarda INSERT, UPDATE y NOTIFICAR.");
        N.push("Filtrar la bitacora por accion real exige tratar ese caso a mano.");
        N.push("");
        N.push("HALLAZGO 9: E5 Y E6 NO TIENEN CONTRAPARTE EN EL CODIGO, Y SON LO CORRECTO.");
        N.push("");
        N.push("E5, el error de red en el polling, no tiene ninguna comprobacion: es un setInterval");
        N.push("que llama refrescar. Si la peticion falla, el behaveor de AdminLayout decide. No hay un");
        N.push("try/catch ni un estado de ultimo conteo valido explicito.");
        N.push("");
        N.push("E6, la reserva cancelada desaparece del pendiente, no es codigo: es consecuencia de que");
        N.push("la consulta del badge excludes 'Cancelada' y la del listado tambien. Ninguna de las dos");
        N.push("tiene una condicion sobre 'Cancelada', justamente porque no hace falta, y por eso el");
        N.push("caso lo describe como una notificacion que se desactiva, cuando en realidad es solo que");
        N.push("el estado deja de coincidir con el IN. El registro historico no se borra, que es lo");
        N.push("que el caso pide, y eso si es correcto.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - El polling de 30 s es real: AdminLayout.tsx:62, setInterval(refrescar, 30_000). Y hay");
        N.push("    otro polling en el proyecto con otra cadencia: AdminRespaldos.tsx:145 usa 12000 ms.");
        N.push("    Son dos ritmos distintos para lo mismo y no hay una constante comun.");
        N.push("  - El polling no se detiene cuando la pestana se oculta. El intervalo sigue corriendo");
        N.push("    con la pestana en segundo plano, y contarPendientesSucursal hace de 2 a 4 consultas");
        N.push("    por ciclo: permisos, la sucursal del empleado si no es admin, los datos de la");
        N.push("    sucursal, y el COUNT. Con varios encargados abiertos son cientos de consultas");
        N.push("    por hora en activos. Un document.visibilitychange lo resolveria.");
        N.push("  - E1 es exacto: 'No tienes permisos para gestionar reservas.' es el mensaje de");
        N.push("    exigirPermiso. Y el comodin '*' esta contemplado en alcanceSucursal, que devuelve");
        N.push("    esAdmin true y sucursalId null, con lo que el COUNT se hace sin filtro de sucursal.");
        N.push("  - Para el admin el COUNT es un WHERE r.estado IN ('Solicitada','Preparada') a secas,");
        N.push("    o sea el total de toda la cadena. El badge del administrador dice cuantos pedidos");
        N.push("    hay pendientes en total, que es un dato de negocio util que el caso no menciona.");
        N.push("  - Los logs de este caso llevan la etiqueta [CU30] dentro del propio codigo, tanto el");
        N.push("    warn de la linea 253 como el error de la 263. Es la primera vez que el codigo se");
        N.push("    autoetiqueta con el numero de caso, y es una buena practica para rastrear en un log.");
        N.push("  - notificarSucursal es el unico punto del proyecto donde un envio de correo es");
        N.push("    opcional y silencioso. En el resto del proyecto no hay mas uso de emailService, asi");
        N.push("    que este camino no tiene a quien compararse.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU30 - NOTIFICAR RESERVA A LA SUCURSAL - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 113");
    T.push("Operaciones reales: " + totalOpe + " de 50");
    T.push("CONECTORES DIBUJADOS: " + conEnDiagrama + " de 55");
    if (conEnDiagrama < 53) T.push("  FALTAN LINEAS. Reejecuta el script: es idempotente y las coloca.");
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
    msg = msg + "CU30 - Notificar reserva a la sucursal" + SALTO + SALTO;
    msg = msg + "Clases: 25    Actores: 4    Relaciones: 55" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 113" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 50" + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de 55" + SALTO;
    if (conEnDiagrama < 53) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "AVISO 1: el correo se envia SIN await; el catch no" + SALTO;
    msg = msg + "         atrapa la falla y se pierde en los logs." + SALTO;
    msg = msg + "AVISO 2: el badge cuenta Solicitada Y Preparada; no" + SALTO;
    msg = msg + "         baja al preparar, contra lo que dice el caso." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU30 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU30 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU30", 0); } catch (e3) { }
}

