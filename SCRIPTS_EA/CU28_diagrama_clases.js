// ================================================================
// CU28 - REALIZAR RESERVA DE MULTIPLES PRENDAS
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   web/src/router.tsx:56            /reservas/nueva es <Navigate to="/catalogo" replace />
//   web/src/pages/cliente/NuevaReserva.tsx   NO ESTA IMPORTADA por nadie: pagina huerfana
//   web/src/components/reserva/ModalReserva.tsx:234  navigate('/login?redirect=...')
//   web/src/lib/reservas.ts          el borrador es UN item, en sessionStorage
//   api/src/modulos/reservas/CTR_Reservas.ts:50   sin @UseGuards de clase;
//                                                  opciones y disponibilidad son publicas
//   api/src/modulos/reservas/SRV_ReservasService.ts 25 metodos; crearReserva en la linea 1001
//   schema.sql:56  reservas           NO tiene columna numero
//   schema.sql:68  sucursal_horarios  sin UNIQUE en (id_sucursal, dia_semana)
//   schema.sql:461 Trigger BEFORE INSERT que descuenta el stock de la reserva
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
    ["IU_NuevaReserva", "HUERFANA. pages/cliente/NuevaReserva.tsx", "la pagina del caso; existe el archivo pero no hay ruta",
     [["sucursal", "Integer", VIS_PUB], ["fecha", "String", VIS_PUB], ["hora", "String", VIS_PUB], ["items", "Array", VIS_PUB], ["paso", "Integer", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["totalEstimado", "Number", VIS_PUB], ["permisoOk", "Boolean", VIS_PUB]],
     [["cargarOpciones", "void", [], VIS_PUB], ["cargarDisponibilidad", "void", ["idSucursal"], VIS_PUB], ["agregarItem", "void", ["item"], VIS_PUB], ["quitarItem", "void", ["idPtc"], VIS_PUB], ["confirmar", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_ModalReserva", "EXISTE. components/reserva/ModalReserva.tsx", "la que si esta enrutada; guarda el borrador y redirige al login",
     [["abierto", "Boolean", VIS_PUB], ["prenda", "Object", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["idSucursal", "Integer", VIS_PUB], ["fecha", "String", VIS_PUB], ["hora", "String", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB]],
     [["abrir", "void", ["prenda"], VIS_PUB], ["cerrar", "void", [], VIS_PUB], ["confirmar", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_CatalogoPublico", "EXISTE. pages/catalogo (CU16)", "origen del boton Reservar para probar; es publico",
     [["productos", "Array", VIS_PUB], ["filtro", "String", VIS_PUB], ["pagina", "Integer", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_IntencionReserva", "EXISTE. lib/reservas.ts", "el borrador; guarda UN item en sessionStorage, no una lista",
     [],
     [["guardarIntencionReserva", "void", ["intencion"], VIS_PUB], ["leerIntencionReserva", "Object", [], VIS_PUB], ["limpiarIntencionReserva", "void", [], VIS_PUB], ["varianteEstadoReserva", "String", ["estado"], VIS_PUB], ["formatearFechaHora", "String", ["iso"], VIS_PUB]]],

    ["IU_Api", "EXISTE. lib/api.ts", "guarda ademas un token de invitado aparte del token de sesion",
     [["baseUrl", "String = /api/v1", VIS_PRI], ["TOKEN_INVITADO_KEY", "String = tm_token_invitado", VIS_PRI]],
     [["obtenerOpcionesReservas", "Object", [], VIS_PUB], ["obtenerDisponibilidad", "Object", ["idSucursal"], VIS_PUB], ["crearReserva", "Object", ["payload"], VIS_PUB], ["tokenInvitado", "String", [], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_ReservasController", "EXISTE. reservas/CTR_Reservas.ts", "12 handlers; SOLO opciones y disponibilidad son publicas",
     [["reservasService", "ReservasService", VIS_PRI]],
     [["opciones", "Object", [], VIS_PUB], ["disponibilidad", "Object", ["idSucursal"], VIS_PUB], ["mias", "Array", ["currentUser"], VIS_PUB], ["pendientesSucursal", "Object", ["currentUser"], VIS_PUB], ["detalleSucursal", "Object", ["id", "currentUser"], VIS_PUB], ["reservasSucursal", "Object", ["currentUser"], VIS_PUB], ["detalle", "Object", ["id", "currentUser"], VIS_PUB], ["cancelar", "Object", ["id", "request", "currentUser"], VIS_PUB], ["preparar", "Object", ["id", "request", "currentUser"], VIS_PUB], ["confirmarRecepcion", "Object", ["id", "request", "currentUser"], VIS_PUB], ["finalizar", "Object", ["id", "request", "currentUser"], VIS_PUB], ["crear", "Object", ["body", "request", "currentUser"], VIS_PUB]]],

    ["SRV_ReservasService", "EXISTE. reservas/SRV_ReservasService.ts", "25 metodos; crea la reserva en la 1001; bitacora fuera de la transaccion",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI], ["emailService", "EmailService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermiso", "void", ["usuario"], VIS_PRI], ["alcanceSucursal", "Object", ["usuario"], VIS_PRI], ["datosSucursal", "Object", ["idSucursal"], VIS_PRI], ["emailsSucursal", "Array", ["idSucursal"], VIS_PRI], ["notificarSucursal", "void", ["aviso", "idSucursal"], VIS_PRI], ["clienteDe", "Integer", ["usuario"], VIS_PRI], ["formatearFechaHora", "String", ["valor"], VIS_PRI], ["formatearHora", "String", ["valor"], VIS_PRI], ["formatearFecha", "String", ["valor"], VIS_PRI], ["obtenerOpciones", "Object", [], VIS_PUB], ["obtenerDisponibilidad", "Object", ["idSucursal"], VIS_PUB], ["numeroReserva", "String", ["idReserva"], VIS_PRI], ["crearReserva", "Object", ["usuario", "dto", "request"], VIS_PUB], ["validarPrendas", "Array", ["items"], VIS_PRI]]],

    ["SRV_EmailService", "EXISTE. seguridad/SRV_EmailService", "notifica a la sucursal; se ejecuta DESPUES de confirmar la reserva",
     [["transporter", "Object", VIS_PRI]],
     [["enviar", "Boolean", ["destinatarios", "asunto", "cuerpo"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "EXISTE. seguridad/dependencias.ts", "en este controlador se aplica POR HANDLER, no por clase",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_BitacoraService", "EXISTE. seguridad/SRV_BitacoraService.ts", "el servicio lo llama DOS veces por reserva",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "una transaccion para la reserva; el SELECT de stock usa FOR UPDATE",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "Object", ["callback"], VIS_PUB], ["getRepository", "Repository", ["entidad"], VIS_PUB]]],

    ["SRV_TriggerMovimientoInventario", "EXISTE. schema.sql:628", "es el que descuenta cantidad_disponible de la reserva",
     [["v_disponible", "Integer", VIS_PRI]],
     [["fn_aplicar_movimiento_inventario", "void", ["NEW"], VIS_PUB]]],

    ["CE_Reserva", "EXISTE. tabla reservas (schema.sql:56)", "NO tiene columna numero; el estado es VARCHAR(20) sin CHECK",
     [["id_reserva", "Integer = PK", VIS_PRI], ["id_cliente", "Integer", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["fecha_reserva", "Date", VIS_PUB], ["hora_reserva", "Time", VIS_PUB], ["estado", "String = Solicitada", VIS_PUB], ["id_encargado", "Integer", VIS_PUB], ["fecha_creacion", "Timestamp = NOW()", VIS_PUB], ["fecha_preparada", "Timestamp", VIS_PUB], ["fecha_atendida", "Timestamp", VIS_PUB]],
     []],

    ["CE_ReservaItem", "EXISTE. tabla reserva_items (schema.sql:66)", "NO tiene precio_unitario ni subtotal",
     [["id_reserva_item", "Integer = PK", VIS_PRI], ["id_reserva", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer = 1", VIS_PUB]],
     []],

    ["CE_Cliente", "EXISTE. tabla clientes (schema.sql:87)", "UNIQUE por usuario_id; NO tiene columna estado",
     [["id_cliente", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["direccion", "Text", VIS_PUB], ["fecha_registro", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. tabla usuarios", "el autor de la reserva; no es lo mismo que id_cliente",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120", VIS_PRI], ["estado", "String", VIS_PUB]],
     []],

    ["CE_Sucursal", "EXISTE. tabla sucursales", "el estado se compara con 'activa', no con 'Activo'",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_SucursalHorario", "EXISTE. tabla sucursal_horarios (schema.sql:68)", "sin UNIQUE en (id_sucursal, dia_semana)",
     [["id_horario", "Integer = PK", VIS_PRI], ["id_sucursal", "Integer = ON DELETE CASCADE", VIS_PUB], ["dia_semana", "String = 20", VIS_PUB], ["horario_apertura", "Time", VIS_PUB], ["horario_cierre", "Time", VIS_PUB]],
     []],

    ["CE_InventarioStock", "EXISTE. tabla inventario_stock (schema.sql:302)", "el trigger resta disponible; el codigo suma reservada",
     [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_reservada", "Integer = 0", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB], ["stock_minimo_alert", "Integer = 0", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. tabla producto_talla_color", "validarPrendas exige estado_stock = 'disponible'",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB], ["estado_stock", "String = Disponible", VIS_PUB]],
     []],

    ["CE_Producto", "EXISTE. tabla productos", "validarPrendas exige estado = 'activo'",
     [["id_producto", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["id_categoria", "Integer", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_Talla", "EXISTE. tabla tallas", "entra en el mensaje de stock insuficiente",
     [["id_talla", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["orden", "Integer", VIS_PUB]],
     []],

    ["CE_Color", "EXISTE. tabla colores", "entra en el mensaje de stock insuficiente",
     [["id_color", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB]],
     []],

    ["CE_MovimientoInventario", "EXISTE. tabla movimientos_inventario (schema.sql:421)", "la reserva escribe SALIDA-RESERVA, no 'Reserva'",
     [["id_movimiento", "Integer = PK", VIS_PRI], ["id_ptc", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["tipo_movimiento", "String = SALIDA-RESERVA", VIS_PUB], ["cantidad", "Integer = negativa", VIS_PUB], ["stock_anterior", "Integer = lo pone el trigger", VIS_PUB], ["stock_posterior", "Integer = lo pone el trigger", VIS_PUB], ["referencia", "String = RES-000001", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_orden_compra", "Integer", VIS_PUB], ["id_venta", "Integer", VIS_PUB], ["id_reserva", "Integer", VIS_PUB], ["fecha", "Timestamp = la sobrescribe el trigger", VIS_PUB]],
     []],

    ["CE_BitacoraAuditoria", "EXISTE. tabla bitacora_auditoria", "recibe accion_sql INSERT y tambien NOTIFICAR",
     [["id_bitacora", "Integer = PK", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "String", VIS_PUB], ["user_agent", "String", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_CrearReservaDTO", "EXISTE. SRV_ReservasService.ts", "el body del POST; no tiene campo de borrador",
     [["id_sucursal", "Integer", VIS_PUB], ["fecha_reserva", "String", VIS_PUB], ["hora_reserva", "String", VIS_PUB], ["items", "Array", VIS_PUB]],
     []],

    ["CE_ItemReservaDTO", "EXISTE. SRV_ReservasService.ts", "una prenda por item; sin precio",
     [["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer", VIS_PUB]],
     []],

    ["CE_IntencionReserva", "EXISTE. lib/reservas.ts", "el borrador: un solo id_ptc, no una lista de items",
     [["retorno", "String", VIS_PUB], ["id_producto", "Integer", VIS_PUB], ["codigo", "String", VIS_PUB], ["nombre", "String", VIS_PUB], ["precio", "Number", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["talla", "String", VIS_PUB], ["color", "String", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["fecha", "String", VIS_PUB], ["hora", "String", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Visitante", "Visitante sin sesion", "ninguno: puede consultar y armar el borrador"],
    ["ACTOR_Cliente", "Cliente autenticado", "gestionar_reservas o *"],
    ["ACTOR_Encargado", "Encargado de Sucursal", "gestionar_reservas"]
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
    var cu = buscarPaquete(RAIZ, "Casas de Uso");
    if (cu == null) cu = RAIZ;
    var mod = buscarPaquete(cu, "8. Reservas");
    if (mod == null) mod = buscarPaquete(cu, "7. Inventario y Recepciones");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU28 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU28 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        conEnDiagrama += relacion(diag, actores[0], C[0], "armar borrador", "Association", "", "visitante", "página", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C[2], "navega el catálogo", "Association", "", "visitante", "catálogo", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C[1], "abre el modal", "Association", "", "visitante", "modal", "0..*", "1");
        conEnDiagrama += relacion(diag, actores[1], C[0], "confirmar", "Association", "", "cliente", "página", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C[1], "confirmar", "Association", "", "cliente", "modal", "0..*", "1");
        conEnDiagrama += relacion(diag, actores[1], C[5], "confirma por HTTP", "Association", "", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[2], C[5], "seguimiento", "Association", "", "encargado", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, C[0], C[1], "modal de reserva", "Association", "", "página", "modal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[0], C[3], "guarda el borrador", "Dependency", "uses", "página", "borrador", "1", "0..1");
        conEnDiagrama += relacion(diag, C[0], C[4], "cliente HTTP", "Dependency", "uses", "página", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[0], C[25], "cuerpo enviado", "Association", "", "página", "dto", "1", "1");
        conEnDiagrama += relacion(diag, C[0], C[19], "prendas del catálogo", "Association", "", "página", "ptc", "0..*", "1");
        conEnDiagrama += relacion(diag, C[1], C[3], "guarda la intención", "Dependency", "uses", "modal", "borrador", "1", "0..1");
        conEnDiagrama += relacion(diag, C[1], C[4], "cliente HTTP", "Dependency", "uses", "modal", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[1], C[27], "intención guardada", "Association", "", "modal", "intención", "1", "1");
        conEnDiagrama += relacion(diag, C[2], C[1], "reservar para probar", "Association", "", "catálogo", "modal", "0..*", "1");
        conEnDiagrama += relacion(diag, C[2], C[19], "prenda mostrada", "Association", "", "catálogo", "ptc", "0..*", "1");
        conEnDiagrama += relacion(diag, C[3], C[27], "persiste la intención", "Composition", "composition", "borrador", "intención", "1", "0..*");
        conEnDiagrama += relacion(diag, C[4], C[5], "punto de acceso HTTP", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, C[4], C[17], "disponibilidad pública", "Dependency", "uses", "cliente", "horario", "0..*", "1");
        conEnDiagrama += relacion(diag, C[5], C[6], "servicio de reservas", "Association", "", "controlador", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[25], "datos de entrada", "Association", "", "controlador", "dto", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[26], "ítem de entrada", "Composition", "composition", "controlador", "ítem", "1", "0..*");
        conEnDiagrama += relacion(diag, C[5], C[8], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "0..1");
        conEnDiagrama += relacion(diag, C[6], C[8], "usuario autenticado", "Association", "", "reservas", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[9], "auditoría de la operación", "Association", "", "reservas", "auditor", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[7], "notificación a la sucursal", "Dependency", "uses", "reservas", "correo", "1", "0..1");
        conEnDiagrama += relacion(diag, C[6], C[10], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[12], "reserva creada", "Composition", "composition", "reservas", "reserva", "1", "0..*");
        conEnDiagrama += relacion(diag, C[6], C[13], "ítems de la reserva", "Composition", "composition", "reservas", "ítem", "1", "0..*");
        conEnDiagrama += relacion(diag, C[6], C[14], "cliente de la reserva", "Dependency", "uses", "reservas", "cliente", "1", "0..1");
        conEnDiagrama += relacion(diag, C[6], C[16], "sucursal de retiro", "Dependency", "uses", "reservas", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[6], C[17], "horario de la fecha", "Dependency", "uses", "reservas", "horario", "1", "0..1");
        conEnDiagrama += relacion(diag, C[6], C[18], "stock bloqueado", "Dependency", "uses", "reservas", "stock", "0..*", "1");
        conEnDiagrama += relacion(diag, C[6], C[19], "prenda validada", "Dependency", "uses", "reservas", "ptc", "0..*", "1");
        conEnDiagrama += relacion(diag, C[6], C[23], "movimiento de salida", "Composition", "composition", "reservas", "movimiento", "1", "0..*");
        conEnDiagrama += relacion(diag, C[7], C[16], "sucursal notificada", "Dependency", "uses", "correo", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[8], C[15], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");
        conEnDiagrama += relacion(diag, C[9], C[24], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        conEnDiagrama += relacion(diag, C[9], C[10], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[11], C[23], "movimiento procesado", "Composition", "composition", "trigger", "movimiento", "1", "0..*");
        conEnDiagrama += relacion(diag, C[11], C[18], "stock aplicado", "Composition", "composition", "trigger", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C[12], C[14], "cliente de la reserva", "Association", "", "reserva", "cliente", "1", "0..1");
        conEnDiagrama += relacion(diag, C[12], C[15], "usuario de la reserva", "Association", "", "reserva", "usuario", "1", "0..1");
        conEnDiagrama += relacion(diag, C[12], C[16], "sucursal de retiro", "Association", "", "reserva", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[13], C[12], "reserva del ítem", "Composition", "composition", "ítem", "reserva", "1", "1");
        conEnDiagrama += relacion(diag, C[13], C[19], "prenda del ítem", "Association", "", "ítem", "ptc", "1", "0..1");
        conEnDiagrama += relacion(diag, C[14], C[15], "usuario del cliente", "Association", "", "cliente", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C[16], C[17], "horarios de la sucursal", "Composition", "composition", "sucursal", "horario", "1", "0..*");
        conEnDiagrama += relacion(diag, C[18], C[19], "stock por ptc", "Association", "", "stock", "ptc", "1", "1");
        conEnDiagrama += relacion(diag, C[18], C[16], "stock por sucursal", "Association", "", "stock", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[19], C[20], "producto del ptc", "Association", "", "ptc", "producto", "1", "1");
        conEnDiagrama += relacion(diag, C[19], C[21], "talla del ptc", "Association", "", "ptc", "talla", "1", "0..1");
        conEnDiagrama += relacion(diag, C[19], C[22], "color del ptc", "Association", "", "ptc", "color", "1", "0..1");
        conEnDiagrama += relacion(diag, C[23], C[19], "prenda del movimiento", "Association", "", "movimiento", "ptc", "1", "0..1");
        conEnDiagrama += relacion(diag, C[23], C[16], "sucursal del movimiento", "Association", "", "movimiento", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[23], C[15], "usuario del movimiento", "Association", "", "movimiento", "usuario", "0..1", "0..1");
        conEnDiagrama += relacion(diag, C[23], C[12], "reserva del movimiento", "Dependency", "uses", "movimiento", "reserva", "0..1", "0..1");
        conEnDiagrama += relacion(diag, C[24], C[15], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");
        conEnDiagrama += relacion(diag, C[25], C[26], "ítems del DTO", "Composition", "composition", "dto", "ítem", "1", "0..*");
        conEnDiagrama += relacion(diag, C[27], C[19], "prenda de la intención", "Dependency", "uses", "intención", "ptc", "0..1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("3 actores, 28 clases y 61 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (5), CTR_ controlador (1), SRV_ servicio (6), CE_ entidad o DTO (16).");
        N.push("");
        N.push("HALLAZGO CRITICO 1: LA RUTA /reservas/nueva ES UN REDIRECT A /catalogo. NO HAY PAGINA.");
        N.push("");
        N.push("  web/src/router.tsx:56");
        N.push("  <Route path=\"/reservas/nueva\" element={<Navigate to=\"/catalogo\" replace />} />");
        N.push("");
        N.push("Eso es todo. La ruta que el caso describe como el corazón del flujo de invitado esta");
        N.push("ocupada por un redirect al catalogo. Si un visitante abre /reservas/nueva, o si vuelve");
        N.push("del login con ?redirect=/reservas/nueva, aterriza en el catalogo y el borrador se queda ahi");
        N.push("en sessionStorage sin ninguna pagina que lo lea.");
        N.push("");
        N.push("Y el archivo SI existe: web/src/pages/cliente/NuevaReserva.tsx, con su export function");
        N.push("NuevaReserva en la linea 66. Lo grave es que no lo importa NINGUN archivo del proyecto:");
        N.push("es una pagina huerfana, compilada pero inalcanzable. Todo el modo invitado del caso esta");
        N.push("escrito y desconectado.");
        N.push("");
        N.push("HALLAZGO CRITICO 2: EL BORRADOR GUARDA UN SOLO ITEM, NO UNA LISTA.");
        N.push("");
        N.push("  interface IntencionReserva {");
        N.push("    retorno: string; id_producto: number; codigo: string; nombre: string; precio: number;");
        N.push("    id_ptc?: string; talla?: string; color?: string; cantidad: number;");
        N.push("    id_sucursal?: number; fecha?: string; hora?: string;");
        N.push("  }");
        N.push("");
        N.push("Es la forma de UNA prenda: un id_ptc y una cantidad. No hay items[] ni ningun array. Y");
        N.push("leerIntencionReserva lo confirma, porque valida typeof v.id_producto === 'number' en");
        N.push("singular. O sea que el caso se titula Reserva de MULTIPLES prendas, el panel Tu reserva");
        N.push("acumula items segun el paso 4, y la estructura de datos del codigo solo sabe guardar uno.");
        N.push("Si el visitante reserva dos prendas en el mismo borrador, la segunda pisa a la primera.");
        N.push("");
        N.push("Ademas el borrador va en sessionStorage, no en localStorage. Sobrevive a la redireccion");
        N.push("del login porque es la misma pestana, pero muere al cerrar la pestana. Para un carrito de");
        N.push("reservas eso es una perdida de datos evitable.");
        N.push("");
        N.push("HALLAZGO CRITICO 3: LA TABLA reservas NO TIENE COLUMNA numero. NUNCA SE PERSISTE.");
        N.push("");
        N.push("  CREATE TABLE reservas (id_reserva, id_cliente, id_usuario, id_sucursal,");
        N.push("    fecha_reserva, hora_reserva, estado, id_encargado, fecha_creacion,");
        N.push("    fecha_preparada, fecha_atendida)");
        N.push("");
        N.push("No hay numero. Y en crearReserva, dentro de la transaccion:");
        N.push("  INSERT INTO reservas (..., estado, fecha_creacion) VALUES (..., 'Solicitada', NOW())");
        N.push("  numero = `RES-${String(idReserva).padStart(6, '0')}`");
        N.push("  UPDATE reservas SET estado = 'Solicitada' WHERE id_reserva = $1");
        N.push("");
        N.push("Ese UPDATE es un NO-OP: el INSERT ya habia puesto 'Solicitada' en la misma columna, y");
        N.push("el numero que se calcula en la linea 1083 no se escribe en ninguna parte. Se parece a");
        N.push("CU21, alla el segundo UPDATE si hacia falta porque guardaba el numero; aqui se copio el");
        N.push("patron y se cambio la columna por una que ya estaba correcta.");
        N.push("");
        N.push("No rompe nada porque numeroReserva(idReserva) RECALCULA el codigo cada vez que se necesita.");
        N.push("Pero significa que el codigo RES-000001 vive solo en las respuestas de la API, en el texto");
        N.push("de la bitacora y en el correo. No se puede consultar por el, no se puede indexar y no");
        N.push("sobrevive a un cambio en la forma de construirlo.");
        N.push("");
        N.push("HALLAZGO CRITICO 4: reserva_items NO TIENE PRECIO. EL 'total estimado' NO EXISTE.");
        N.push("");
        N.push("  CREATE TABLE reserva_items (id_reserva_item, id_reserva, id_ptc, cantidad)");
        N.push("");
        N.push("Sin precio_unitario, sin subtotal, sin total. Y CrearReservaDTO tampoco lleva precios.");
        N.push("El paso 4 del caso dice que el panel Tu reserva acumula los items y muestra el total");
        N.push("estimado. Para que ese total exista habria que traer el precio del catalogo en el");
        N.push("frontend y multiplicar alli, porque en el backend no hay ningun precio que leer.");
        N.push("Y si ese precio fuera precio_base, seria el precio de VENTA, no el de la prenda reservada.");
        N.push("");
        N.push("HALLAZGO 5: EL TIPO DE MOVIMIENTO ES 'SALIDA-RESERVA', NO 'Reserva'.");
        N.push("");
        N.push("El caso dice movimientos_inventario tipo 'Reserva'. El codigo escribe:");
        N.push("  INSERT INTO movimientos_inventario (id_ptc, id_sucursal, tipo_movimiento, cantidad,");
        N.push("         referencia, id_usuario, id_reserva)");
        N.push("  VALUES ($1, $2, 'SALIDA-RESERVA', $3, $4, $5, $6)");
        N.push("");
        N.push("Que es el unico valor con el que el kardex de CU23 pinta una reserva bien: esta en el mapa");
        N.push("DESCRIPCIONES_TIPO como Salida por reserva y el badge del frontend le pone warning,");
        N.push("el ambar. O sea que aqui NO se repite el problema de CU22, donde sp_registrar_recepcion");
        N.push("escribia 'Recepcion' y salia con badge rojo. La reserva es el camino bien hecho.");
        N.push("");
        N.push("HALLAZGO 6: QUIEN DESCUENTA EL STOCK NO ES EL CODIGO, ES EL TRIGGER. Y ESTO ESTA BIEN.");
        N.push("");
        N.push("El caso presenta (f) como actualizar inventario_stock con cantidad_reservada mas y");
        N.push("cantidad_disponible menos, y (g) como insertar el movimiento con cantidad negativa y que");
        N.push("el trigger recalcule. En el codigo esta separado de una forma distinta, y el resultado");
        N.push("neto es el correcto:");
        N.push("");
        N.push("  INSERT INTO movimientos_inventario (..., 'SALIDA-RESERVA', -linea.cantidad, ...)");
        N.push("    -> dispara el trigger, que hace cantidad_disponible = disponible + (-cantidad)");
        N.push("    -> o sea, DESCUENTA disponible");
        N.push("");
        N.push("  UPDATE inventario_stock SET cantidad_reservada = cantidad_reservada + $3");
        N.push("    -> solo SUMA reservada, no toca disponible");
        N.push("");
        N.push("Disponible baja por el trigger, reservada sube por el UPDATE. Una sola responsabilidad");
        N.push("por capa. Y a diferencia de lo que pasa con una venta, aqui la reserva SI suma");
        N.push("cantidad_reservada, que es justamente lo que el trigger de CU23 no hacia.");
        N.push("");
        N.push("Y la validacion de stock usa SELECT ... FOR UPDATE, que es la pieza que le falta al");
        N.push("trigger de CU23. Con el bloqueo de fila, dos reservas concurrentes sobre la misma");
        N.push("prenda se serializan y la segunda ve el stock ya descontado. Esta bien hecho y es el")
        N.push("contrapunto directo de la carrera que sufria el kardex.");
        N.push("");
        N.push("HALLAZGO 7: LA BITACORA SE ESCRIBE DOS VECES, Y UNA USA 'NOTIFICAR' EN accion_sql.");
        N.push("");
        N.push("  bitacoraService.registrar(usuario, 'INSERT', 'reservas', 'Reserva creada: RES-...', ...)")
        N.push("  bitacoraService.registrar(usuario, 'NOTIFICAR', 'reservas', 'Notificacion a sucursal...', ...)");
        N.push("");
        N.push("Dos filas por reserva, sobre la misma tabla y con el mismo id_registro. La segunda");
        N.push("guarda 'NOTIFICAR' en una columna llamada accion_sql, que por su nombre deberia");
        N.push("contener una operacion SQL. INSERT, UPDATE, DELETE, SELECT, eso seria coherente.");
        N.push("Es la primera vez que esa columna recibe un valor que no es SQL, y hace impossible");
        N.push("filtrar la bitacora por accion real sin tratar ese caso a mano.");
        N.push("");
        N.push("Las dos llamadas estan FUERA de la transaccion, igual que en CU21. Si la primera falla,");
        N.push("la reserva ya esta confirmada y no queda auditada. Y si la segunda falla, tampoco,");
        N.push("pero ademas el notificarSucursal del correo se queda sin ejecutar, asi que la sucursal");
        N.push("no se entera de una reserva que si existe.");
        N.push("");
        N.push("HALLAZGO 8: HAY SEIS MENSAJES QUE EL CASO NO RECITA, Y TRES QUE RECITA MAL.");
        N.push("");
        N.push("Correctos:");
        N.push("  422 Debes seleccionar al menos una prenda.                    E3, exacto");
        N.push("  422 Prenda no encontrada.                                    E4, exacto");
        N.push("  409 La prenda [nombre] no esta disponible actualmente.      E4, exacto");
        N.push("  409 Stock insuficiente de la prenda [nombre] (talla, color). Disponible: X.   E5, exacto");
        N.push("  403 No tienes permisos para realizar reservas.              E1, exacto");
        N.push("");
        N.push("Distintos de lo que dice el caso:");
        N.push("  caso: fecha anterior a hoy, 'La fecha de la reserva no puede ser anterior a hoy.'");
        N.push("  real: La fecha de reserva no puede ser anterior al dia de hoy.");
        N.push("  caso: sucursal inactiva, 'La sucursal seleccionada no esta disponible para reservas.'");
        N.push("  real: La sucursal seleccionada no esta activa.");
        N.push("  caso: hora fuera de horario, texto fijo");
        N.push("  real: La hora seleccionada esta fuera del horario de atencion (09:00 - 18:00).");
        N.push("        El mensaje real es DINAMICO, incluye el horario de la sucursal.");
        N.push("");
        N.push("No citados en el caso:");
        N.push("  422 La fecha de reserva es obligatoria y valida.   si no viene en formato YYYY-MM-DD");
        N.push("  422 La hora de reserva es obligatoria y valida (HH:MM:SS).");
        N.push("  422 No hay horario de atencion definido para el [dia] en esta sucursal.");
        N.push("  404 Sucursal no encontrada.   id_sucursal inexistente, el caso solo dice 'sucursal inactiva'");
        N.push("  422 La cantidad debe ser un numero entero mayor a cero.");
        N.push("        El caso lo parte en dos: 'La cantidad debe ser mayor a cero.' y un 422 por id_ptc.")
        N.push("        En el codigo es UN solo mensaje para las dos cosas, porque la comprobacion es:");
        N.push("        if (!Number.isInteger(idPtc) || !Number.isInteger(cantidad) || cantidad <= 0)");
        N.push("");
        N.push("HALLAZGO 9: EL DIA DE LA SEMANA SE CALCULA EN UTC SOBRE UNA FECHA LOCAL.");
        N.push("");
        N.push("  const fechaReserva = new Date(`${fecha}T00:00:00`);");
        N.push("  const diaSemana = DIAS_SEMANA[fechaReserva.getUTCDay()];");
        N.push("");
        N.push("La cadena sin Z se interpreta como medianoche LOCAL, y getUTCDay() devuelve el dia en");
        N.push("UTC. En Bolivia (UTC-4) la medianoche local son las 04:00 UTC del mismo dia, asi que");
        N.push("coincide y no se nota. En cualquier zona por delante de UTC la medianoche local cae en");
        N.push("el dia ANTERIOR en UTC: una reserva de domingo se validaria contra el horario del");
        N.push("sabado. Es un bug de portabilidad latente que en este proyecto no se manifiesta,");
        N.push("pero que se activaria en cuanto se desplegara fuera de Bolivia.");
        N.push("");
        N.push("HALLAZGO 10: LA COMPARACION DE LA HORA ES DE CADENAS, Y ACEPTA EL HORA DE CIERRE.");
        N.push("");
        N.push("  if (hora < apertura || hora > cierre) throw ...");
        N.push("");
        N.push("Compara HH:MM:SS como texto, que funciona porque ambos vienen con ceros a la izquierda,");
        N.push("mismo patron que el filtro de fechas de CU23. El detalle es que usa > y no >=, asi que");
        N.push("una reserva exactamente a la hora de cierre se acepta. Ademas no comprueba que la fecha");
        N.push("no sea un domingo si la sucursal no tiene horario: en ese caso da el 422 de 'no hay");
        N.push("horario definido', que es el comportamiento correcto.");
        N.push("");
        N.push("HALLAZGO 11: sucursal_horarios NO TIENE UNIQUE EN (id_sucursal, dia_semana).");
        N.push("");
        N.push("  CREATE TABLE sucursal_horarios (id_horario, id_sucursal, dia_semana,");
        N.push("    horario_apertura, horario_cierre)");
        N.push("");
        N.push("Se puede meter el mismo dia dos veces para la misma sucursal con horarios distintos, y");
        N.push("la consulta que usa unaFila se quedaria con el primero que devuelva Postgres, sin avisar.");
        N.push("El resultado seria que el administrador ve un horario en la configuracion y el sistema")
        N.push("valida contra otro. Vale la pena un UNIQUE (id_sucursal, dia_semana).");
        N.push("");
        N.push("HALLAZGO 12: LAS DOS RUTAS PUBLICAS EXISTEN, Y ESO ESTA HECHO BIEN.");
        N.push("");
        N.push("El controlador NO lleva @UseGuards a nivel de clase. Los doce handlers lo llevan");
        N.push("individualmente, y solo dos se quedan sin el:");
        N.push("  @Get('opciones')                    sin guard, publico");
        N.push("  @Get('disponibilidad/:id_sucursal') sin guard, publico");
        N.push("Los otros diez, mias, sucursal, :id, cancelar, preparar, confirmar-recepcion, finalizar y");
        N.push("crear, llevan @UseGuards(JwtAuthGuard). Es la manera mas limpia de tener una parte")
        N.push("publica y otra autenticada en el mismo recurso, y encaja con el caso. Merece mención.")
        N.push("");
        N.push("Un detalle: disponibilidad usa @Param('id_sucursal') idSucursal: number SIN ParseIntPipe,");
        N.push("o sea que recibe un string donde el tipo dice number. Funciona porque el valor va como")
        N.push("parametro ligado y Postgres convierte el texto al comparar contra la columna entera, y")
        N.push("el id_sucursal que se devuelve en el JSON es el que sale de la base. Pero el tipado")
        N.push("miente, y en los otros dos controladores que si usan parseIntId, el mismo parametro")
        N.push("habria dado 400.");
        N.push("");
        N.push("Ojo tambien: como es publica, obtenerDisponibilidad devuelve el inventario de una");
        N.push("sucursal a cualquiera que la solicite, incluyendo cantidad_reservada. Es informacion");
        N.push("operativa interna de la tienda, no solo disponibilidad de venta.");
        N.push("");
        N.push("HALLAZGO 13: LA MAQUINA DE ESTADOS DE RESERVAS ES DISTINTA DE LA DE ORDENES DE COMPRA.");
        N.push("");
        N.push("  reservas.estado:      Solicitada, Preparada, En tienda, Cumplida, Cancelada");
        N.push("  ordenes_compra.estado: Pendiente, Anulada, Recibida");
        N.push("");
        N.push("Y el caso CU19, al bloquear un proveedor, cuenta como pendientes las ordenes_compra cuyo");
        N.push("estado NO este en ('procesada','recibida','anulada','cancelada'). Es decir, tres");
        N.push("vocabularios distintos para lo que significa 'una reserva viva'. Un developer que lea")
        N.push("un caso y otro no puede asumir nada en comun, y el proyecto no tiene ni un Enum de")
        N.push("Postgres ni una tabla de estados que los unifique. Las dos columnas son VARCHAR(20) sin");
        N.push("CHECK, asi que nada impide escribir un estado que ninguna rama del switch del frontend")
        N.push("conoce, y ese cae en el default que devuelve el badge neutral.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - El caso acierta en que crearReserva NO cambia: es exactamente el metodo verificado, con");
        N.push("    las nueve etapas que describe. Los desvios estan en los nombres de los mensajes, en el");
        N.push("    tipo de movimiento y en la tabla de numeros, no en la estructura del metodo.");
        N.push("  - E8, el boton en loading para evitar dobles reservas, es una mitigacion solo de");
        N.push("    frontend. Dos pestanas, o el mismo boton tras un F5, mandan dos POST y se crean dos");
        N.push("    reservas. El backend no tiene idempotencia ni token de peticion. La unica defensa");
        N.push("    real seria un indice unico parcial, del tipo un id de intencion.");
        N.push("  - E9, el aviso de borrador obsoleto, no tiene contraparte en el codigo: no hay ninguna");
        N.push("    marca de version en el borrador ni comparacion contra la disponibilidad al");
        N.push("    restaurar. La revalidacion del backend (E5) es lo unico que protege.");
        N.push("  - La precondicion del caso menciona el comodin '*'. Correcto: exigirPermiso comprueba");
        N.push("    permisos.includes('*') || permisos.includes('gestionar_reservas'), con el mensaje");
        N.push("    'No tienes permisos para realizar reservas.'");
        N.push("  - El permiso gestionar_reservas lo comparte el Cliente con el Encargado y el Admin, y el");
        N.push("    alcance por sucursal se resuelve con alcanceSucursal, que devuelve { esAdmin,");
        N.push("    sucursalId } en lugar de lanzar. Es el segundo patron de alcance del proyecto, distinto");
        N.push("    del validarElegida de Kardex y el sucursalAplicar de Alertas.");
        N.push("  - clienteDe resuelve el id_cliente por clientes.usuario_id. Si el usuario no tiene fila");
        N.push("    en clientes, la reserva no se puede crear ni con el permiso correto. Y clientes NO");
        N.push("    tiene columna estado, asi que un cliente dado de baja sigue pudiendo reservar.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU28 - RESERVA DE MULTIPLES PRENDAS - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 126");
    T.push("Operaciones reales: " + totalOpe + " de 58");
    T.push("CONECTORES DIBUJADOS: " + conEnDiagrama + " de 61");
    if (conEnDiagrama < 60) T.push("  FALTAN LINEAS. Reejecuta el script: es idempotente y las coloca.");
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
    msg = msg + "CU28 - Reserva de multiples prendas" + SALTO + SALTO;
    msg = msg + "Clases: 28    Actores: 3    Relaciones: 60" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 126" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 58" + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de 61" + SALTO;
    if (conEnDiagrama < 60) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "AVISO 1: /reservas/nueva es un redirect a /catalogo." + SALTO;
    msg = msg + "AVISO 2: el borrador guarda UN item, no una lista." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU28 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU28 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU28", 0); } catch (e3) { }
}
