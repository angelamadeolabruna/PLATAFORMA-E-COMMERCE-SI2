// ================================================================
// CU32 - USAR VESTIDOR VIRTUAL CON REALIDAD AUMENTADA
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   api/src/modulos/sesiones-ra/CTR_SesionesRa.ts     3 handlers, DTO con foto_resultado
//   api/src/modulos/sesiones-ra/SRV_SesionesRaService.ts 11 metodos
//   web/src/components/ra/VestidorRa.tsx             recorte por flood fill + canvas 2D
//   web/src/pages/cliente/MisPruebasRa.tsx           el historial
//   web/package.json                                 NINGUNA libreria de RA, 3D ni pose
//   schema.sql:480  sesiones_ra      SIN columna foto_resultado
//   schema.sql:490  resultados_prueba
//   schema.sql:232  productos.modelo_3d_url  existe pero el vestidor no lo usa
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
    ["IU_VestidorRa", "EXISTE. components/ra/VestidorRa.tsx", "composicion 2D sobre canvas; no hay RA ni 3D",
     [["canvasRef", "Object", VIS_PRI], ["fondoFotoRef", "Object", VIS_PRI], ["estadoCamara", "String = solicitando", VIS_PUB], ["poseCargando", "Boolean", VIS_PUB], ["poseDetectada", "Boolean", VIS_PUB], ["congelada", "Boolean", VIS_PUB], ["modoFoto", "Boolean", VIS_PUB], ["medidas", "String", VIS_PUB], ["alturaCm", "String", VIS_PUB], ["escala", "Number = 1.3", VIS_PUB], ["posX", "Number = 0", VIS_PUB], ["posY", "Number = 0", VIS_PUB], ["rotacion", "Number = 0", VIS_PUB], ["opacidad", "Number = 0.92", VIS_PUB], ["tolerancia", "Number = 40", VIS_PUB], ["sesion", "Object", VIS_PUB]],
     [["recortarFondo", "Object", ["img", "tolerancia"], VIS_PUB], ["cargarPrendaRecortada", "Object", ["url", "tolerancia"], VIS_PUB], ["detectarVideo", "Boolean", [], VIS_PUB], ["guardarFotoSesion", "void", ["foto"], VIS_PUB], ["detectarPose", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_MisPruebasRa", "EXISTE. pages/cliente/MisPruebasRa.tsx", "el historial de sesiones del Cliente",
     [["sesiones", "Array", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "EXISTE. lib/api.ts", "crearSesionRa, registrarResultadoRa y consultarHistorialRa",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["crearSesionRa", "Object", ["payload"], VIS_PUB], ["registrarResultadoRa", "Object", ["id", "resultado"], VIS_PUB], ["consultarHistorialRa", "Object", [], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_SesionesRaController", "EXISTE. sesiones-ra/CTR_SesionesRa.ts", "ruta sesiones-ra; los 3 handlers llevan guard",
     [["sesionesRaService", "SesionesRaService", VIS_PRI]],
     [["historial", "Object", ["currentUser"], VIS_PUB], ["registrarResultado", "Object", ["id", "body", "request", "currentUser"], VIS_PUB], ["crear", "Object", ["body", "request", "currentUser"], VIS_PUB]]],

    ["SRV_SesionesRaService", "EXISTE. sesiones-ra/SRV_SesionesRaService.ts", "11 metodos; el resultado es UPSERT y alimenta las recomendaciones",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI], ["preferenciasService", "PreferenciasService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermisoCatalogo", "void", ["usuario"], VIS_PRI], ["validarPrenda", "Object", ["idPtc"], VIS_PRI], ["validarReservaVinculada", "void", ["idReserva", "usuario"], VIS_PRI], ["validarCarritoVinculado", "void", ["idCarrito", "usuario"], VIS_PRI], ["crearSesionRa", "Object", ["usuario", "dto", "request"], VIS_PUB], ["registrarResultado", "Object", ["usuario", "id", "resultado", "request"], VIS_PUB], ["consultarHistorial", "Object", ["usuario"], VIS_PUB]]],

    ["SRV_PreferenciasService", "EXISTE. recomendaciones", "un Gusta reinforce el perfil; el caso no lo menciona",
     [],
     [["registrarPreferenciasGusta", "void", ["idUsuario", "idPtc"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "EXISTE. seguridad/dependencias.ts", "canActivate propio; header Bearer o cookie access_token",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_BitacoraService", "EXISTE. seguridad/SRV_BitacoraService.ts", "una fila por sesion y otra por resultado",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "sin transaccion en ninguno de los dos metodos de escritura",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "Object", ["callback"], VIS_PUB], ["getRepository", "Repository", ["entidad"], VIS_PUB]]],

    ["CE_SesionRa", "EXISTE. tabla sesiones_ra (schema.sql:480)", "NO tiene foto_resultado, que el servicio si escribe",
     [["id_sesion_ra", "Integer = PK", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["medidas_avatar", "String = 120", VIS_PUB], ["fecha", "Timestamp = NOW()", VIS_PUB], ["id_reserva", "Integer", VIS_PUB], ["id_carrito", "Integer", VIS_PUB]],
     []],

    ["CE_ResultadoPrueba", "EXISTE. tabla resultados_prueba (schema.sql:490)", "resultado VARCHAR(20) sin CHECK",
     [["id_resultado", "Integer = PK", VIS_PRI], ["id_sesion_ra", "Integer", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["resultado", "String = 20", VIS_PUB], ["fecha", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. tabla usuarios", "el dueno de la sesion; la propiedad se comprueba con 404",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120", VIS_PRI], ["estado", "String", VIS_PUB]],
     []],

    ["CE_Rol", "EXISTE. tabla roles", "consultar_catalogo vive en permisos_json",
     [["id_rol", "Integer = PK", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "EXISTE. tabla usuarios_roles", "une usuario con rol",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. tabla producto_talla_color", "la prenda probada; no se valida estado_stock",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB], ["estado_stock", "String = Disponible", VIS_PUB]],
     []],

    ["CE_Producto", "EXISTE. tabla productos", "modelo_3d_url existe pero el vestidor no lo usa",
     [["id_producto", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["id_categoria", "Integer", VIS_PUB], ["estado", "String = Activo", VIS_PUB], ["precio_base", "Decimal(10,2)", VIS_PUB], ["modelo_3d_url", "Text = la API la devuelve, la UI no la usa", VIS_PUB]],
     []],

    ["CE_Talla", "EXISTE. tabla tallas", "de donde sale el nombre de la talla en la respuesta",
     [["id_talla", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["orden", "Integer", VIS_PUB]],
     []],

    ["CE_Color", "EXISTE. tabla colores", "de donde sale el nombre del color en la respuesta",
     [["id_color", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB]],
     []],

    ["CE_Reserva", "EXISTE. tabla reservas", "vinculo opcional; la pertenencia se comprueba con 422",
     [["id_reserva", "Integer = PK", VIS_PRI], ["id_cliente", "Integer", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["fecha_reserva", "Date", VIS_PUB], ["estado", "String = Solicitada", VIS_PUB]],
     []],

    ["CE_Cliente", "EXISTE. tabla clientes", "de donde sale el usuario_id para validar la reserva",
     [["id_cliente", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["telefono", "String = 30", VIS_PUB]],
     []],

    ["CE_Carrito", "EXISTE. tabla carritos", "vinculo opcional; la pertenencia se comprueba por usuario",
     [["id_carrito", "Integer = PK", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["estado", "String = Activo", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB]],
     []],

    ["CE_BitacoraAuditoria", "EXISTE. tabla bitacora_auditoria", "INSERT al crear, UPDATE al cambiar el resultado",
     [["id_bitacora", "Integer = PK", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "String", VIS_PUB], ["user_agent", "String", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_CrearSesionRaRequest", "EXISTE. CTR_SesionesRa.ts", "el unico campo que el caso no menciona: foto_resultado",
     [["id_ptc", "Integer", VIS_PUB], ["medidas_avatar", "String = 255", VIS_PUB], ["foto_resultado", "String = 2000000", VIS_PUB], ["id_reserva", "Integer", VIS_PUB], ["id_carrito", "Integer", VIS_PUB]],
     []],

    ["CE_RegistrarResultadoRequest", "EXISTE. CTR_SesionesRa.ts", "@IsIn de dos valores; da 400, no 422",
     [["resultado", "String = Gusta|No gusta", VIS_PUB]],
     []],

    ["CE_RespuestaSesionRa", "EXISTE. lib/api.ts", "la respuesta incluye la prenda y su modelo_3d_url",
     [["detail", "String", VIS_PUB], ["id_sesion_ra", "Integer", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["medidas_avatar", "String", VIS_PUB], ["foto_resultado", "String", VIS_PUB], ["fecha", "String", VIS_PUB], ["id_reserva", "Integer", VIS_PUB], ["id_carrito", "Integer", VIS_PUB], ["prenda", "Object", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Cliente", "Cliente autenticado", "consultar_catalogo o *"],
    ["ACTOR_SdkRa", "Camara y recorte 2D", "ninguno: getUserMedia y canvas"]
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
    var mod = buscarPaquete(cu, "9. Realidad Aumentada");
    if (mod == null) mod = buscarPaquete(cu, "3. Catalogo y Productos");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU32 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU32 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        conEnDiagrama += relacion(diag, actores[0], C[0], "usuario", "Association", "", "cliente", "vestidor", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C[1], "usuario", "Association", "", "cliente", "historial", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C[3], "usuario", "Association", "", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C[0], "imagen y cámara", "Association", "", "sdk", "vestidor", "1", "1");
        conEnDiagrama += relacion(diag, C[0], C[2], "cliente HTTP", "Dependency", "uses", "vestidor", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[0], C[19], "sesión creada", "Association", "", "vestidor", "respuesta", "0..*", "1");
        conEnDiagrama += relacion(diag, C[0], C[14], "prenda probada", "Association", "", "vestidor", "ptc", "1", "0..1");
        conEnDiagrama += relacion(diag, C[0], C[15], "producto de la prenda", "Dependency", "uses", "vestidorra", "producto", "1", "0..*");
        conEnDiagrama += relacion(diag, C[0], C[16], "foto de la sesión", "Dependency", "uses", "vestidorra", "talla", "1", "0..*");
        conEnDiagrama += relacion(diag, C[0], C[20], "id de sesión", "Dependency", "uses", "vestidorra", "carrito", "1", "0..*");
        conEnDiagrama += relacion(diag, C[1], C[2], "cliente HTTP", "Dependency", "uses", "historial", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[1], C[11], "sesiones del historial", "Dependency", "uses", "mispruebasra", "usuario", "1", "0..*");
        conEnDiagrama += relacion(diag, C[2], C[3], "punto de acceso HTTP", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, C[3], C[4], "servicio de sesiones RA", "Association", "", "controlador", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C[3], C[5], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[3], C[21], "cuerpo de la sesión", "Association", "", "controlador", "petición", "1", "1");
        conEnDiagrama += relacion(diag, C[3], C[22], "resultado de entrada", "Dependency", "uses", "controlador", "crearsesionrarequest", "1", "0..*");
        conEnDiagrama += relacion(diag, C[4], C[6], "perfil de recomendaciones", "Dependency", "uses", "sesiones", "preferencias", "1", "0..1");
        conEnDiagrama += relacion(diag, C[4], C[7], "usuario autenticado", "Association", "", "sesiones", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[8], "auditoría de la sesión", "Association", "", "sesiones", "auditor", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[9], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[11], "sesión registrada", "Composition", "composition", "sesiones", "sesión", "1", "0..*");
        conEnDiagrama += relacion(diag, C[4], C[12], "resultado de la prueba", "Dependency", "uses", "sesionesraservice", "rol", "1", "0..*");
        conEnDiagrama += relacion(diag, C[4], C[14], "prenda validada", "Dependency", "uses", "sesionesraservice", "productotallacolor", "1", "0..*");
        conEnDiagrama += relacion(diag, C[4], C[17], "reserva vinculada", "Dependency", "uses", "sesionesraservice", "color", "1", "0..*");
        conEnDiagrama += relacion(diag, C[4], C[18], "carrito vinculado", "Dependency", "uses", "sesionesraservice", "reserva", "1", "0..*");
        conEnDiagrama += relacion(diag, C[5], C[0], "sesión de la que se parte", "Dependency", "uses", "preferencias", "sesión", "0..*", "1");
        conEnDiagrama += relacion(diag, C[7], C[9], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");
        conEnDiagrama += relacion(diag, C[8], C[20], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        conEnDiagrama += relacion(diag, C[8], C[9], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[10], C[9], "usuario de la sesión", "Association", "", "sesión", "usuario", "1", "0..1");
        conEnDiagrama += relacion(diag, C[10], C[14], "prenda de la sesión", "Association", "", "sesión", "ptc", "1", "0..1");
        conEnDiagrama += relacion(diag, C[10], C[17], "reserva vinculada", "Dependency", "uses", "resultadoprueba", "color", "1", "0..*");
        conEnDiagrama += relacion(diag, C[10], C[18], "carrito vinculado", "Dependency", "uses", "resultadoprueba", "reserva", "1", "0..*");
        conEnDiagrama += relacion(diag, C[12], C[11], "sesión del resultado", "Dependency", "uses", "rol", "usuario", "1", "0..*");
        conEnDiagrama += relacion(diag, C[12], C[14], "prenda del resultado", "Dependency", "uses", "rol", "productotallacolor", "1", "0..*");
        conEnDiagrama += relacion(diag, C[14], C[15], "producto del ptc", "Dependency", "uses", "productotallacolor", "producto", "1", "0..*");
        conEnDiagrama += relacion(diag, C[14], C[16], "talla del ptc", "Association", "", "ptc", "talla", "1", "0..1");
        conEnDiagrama += relacion(diag, C[14], C[17], "color del ptc", "Association", "", "ptc", "color", "1", "0..1");
        conEnDiagrama += relacion(diag, C[17], C[19], "cliente de la reserva", "Dependency", "uses", "color", "cliente", "1", "0..*");
        conEnDiagrama += relacion(diag, C[17], C[10], "usuario de la reserva", "Dependency", "uses", "color", "resultadoprueba", "1", "0..*");
        conEnDiagrama += relacion(diag, C[18], C[10], "usuario del carrito", "Dependency", "uses", "reserva", "resultadoprueba", "1", "0..*");
        conEnDiagrama += relacion(diag, C[20], C[10], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");
        conEnDiagrama += relacion(diag, C[21], C[14], "prenda del request", "Dependency", "uses", "bitacoraauditoria", "productotallacolor", "1", "0..*");
        conEnDiagrama += relacion(diag, C[21], C[17], "reserva del request", "Dependency", "uses", "bitacoraauditoria", "color", "1", "0..*");
        conEnDiagrama += relacion(diag, C[21], C[18], "carrito del request", "Dependency", "uses", "bitacoraauditoria", "reserva", "1", "0..*");
        conEnDiagrama += relacion(diag, C[22], C[12], "resultado del request", "Dependency", "uses", "crearsesionrarequest", "rol", "1", "0..*");
        conEnDiagrama += relacion(diag, C[23], C[11], "sesión devuelta", "Dependency", "uses", "registrarresultadorequest", "usuario", "1", "0..*");
        conEnDiagrama += relacion(diag, C[23], C[14], "ptc devuelto", "Dependency", "uses", "registrarresultadorequest", "productotallacolor", "1", "0..*");
        conEnDiagrama += relacion(diag, C[23], C[15], "modelo 3d devuelto", "Dependency", "uses", "registrarresultadorequest", "producto", "1", "0..*");
        conEnDiagrama += relacion(diag, C[10], C[7], "rol del usuario", "Dependency", "uses", "sesión", "guard", "1", "0..1");
        conEnDiagrama += relacion(diag, C[10], C[8], "rol del usuario", "Dependency", "uses", "resultadoprueba", "datasource", "1", "0..*");
        conEnDiagrama += relacion(diag, C[19], C[8], "rol del usuario", "Dependency", "uses", "cliente", "datasource", "1", "0..*");
        conEnDiagrama += relacion(diag, C[19], C[9], "asignación de rol", "Dependency", "uses", "cliente", "sesionra", "1", "0..*");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("2 actores, 25 clases y 54 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (3), CTR_ controlador (1), SRV_ servicio (5), CE_ entidad o DTO (15).");
        N.push("");
        N.push("HALLAZGO CRITICO 1: EL POST DE SESION ESTA ROTO. ESCRIBE UNA COLUMNA QUE NO EXISTE.");
        N.push("");
        N.push("  schema.sql:480");
        N.push("  CREATE TABLE sesiones_ra (id_sesion_ra, id_usuario, id_ptc, medidas_avatar,");
        N.push("                         fecha, id_reserva, id_carrito)");
        N.push("");
        N.push("Y el servicio, linea 158:");
        N.push("  INSERT INTO sesiones_ra (id_usuario, id_ptc, medidas_avatar, foto_resultado, fecha,");
        N.push("                        id_reserva, id_carrito)");
        N.push("  VALUES ($1, $2, $3, $4, NOW(), $5, $6)");
        N.push("  RETURNING id_sesion_ra, id_usuario, id_ptc, medidas_avatar, foto_resultado, fecha, ...");
        N.push("");
        N.push("La columna foto_resultado NO ESTA en la tabla. Postgres devuelve el error 42703, column");
        N.push("\"foto_resultado\" of relation \"sesiones_ra\" does not exist, y el endpoint responde 500.");
        N.push("");
        N.push("Lo grave es que el campo es @IsOptional(): da igual si el cliente manda foto o no, porque");
        N.push("la columna aparece en la lista de columnas del INSERT y el parametro $4 va siempre.");
        N.push("O sea que POST /api/v1/sesiones-ra falla SIEMPRE, con o sin foto. CU32 esta bloqueado en el");
        N.push("primer paso del camino principal, y por tanto el historial, el resultado y las");
        N.push("recomendaciones tampoco llegan a funcionar.");
        N.push("");
        N.push("Y no hay arreglo por la via del esquema: schema.sql no tiene ni un solo ALTER TABLE, lo");
        N.push("verifique en todo el archivo. O se creo la columna a mano en la base, o este endpoint no");
        N.push("ha funcionado nunca. Es el mismo patron que las columnas que faltan en CU18, pero aqui");
        N.push("con la diferencia de que en CU18 faltaban columnas de un caso futuro y aqui falta la");
        N.push("columna que el propio caso ya instalado usa.");
        N.push("");
        N.push("HALLAZGO CRITICO 2: NO HAY REALIDAD AUMENTADA NI MODELO 3D. ES COMPOSICION 2D.");
        N.push("");
        N.push("El caso describe un SDK de RA movil que superpone el modelo 3D de la prenda ajustado a las");
        N.push("medidas del usuario, en tiempo real mientras se mueve. Lo que hay en VestidorRa.tsx es:");
        N.push("");
        N.push("  recortarFogo(img, tolerancia)            flood fill para quitar el fondo blanco");
        N.push("  cargarPrendaRecortada(url, tolerancia)  carga la FOTO del producto y la recorta");
        N.push("  <canvas> + document.getElementById       dibuja la foto recortada encima del video");
        N.push("  escala, posX, posY, rotacion, opacidad   controles MANUALES de placement");
        N.push("  tolerancia                              0 a 255, que tan agresivo es el recorte");
        N.push("");
        N.push("Es decir: una foto de la prenda, recortada a mano por flood fill, que el usuario arrastra");
        N.push("sobre el video de la camara con cinco deslizadores. No hay modelo 3D, no hay malla que se");
        N.push("adapte al cuerpo, y no hay ajuste por medidas: la escala la mueve el usuario con un");
        N.push("control, no la calcula el sistema.");
        N.push("");
        N.push("modelo_3d_url aparece UNA SOLA VEZ en todo VestidorRa.tsx, en la linea 36, dentro de una");
        N.push("interfaz de tipos. No se lee, no se descarga y no se usa. El backend lo devuelve en la");
        N.push("respuesta (prenda.modelo_3d_url) y ahi se queda. La columna existe en schema.sql:232 y");
        N.push("lleva sin uso desde el principio.");
        N.push("");
        N.push("HALLAZGO CRITICO 3: NO HAY NINGUNA LIBRERIA DE RA, 3D NI POSE EN EL PROYECTO.");
        N.push("");
        N.push("Las unicas dependencias de web/package.json son:");
        N.push("  react, react-dom, react-router-dom, lucide-react, clsx, tailwind-merge");
        N.push("");
        N.push("Ni three.js, ni @react-three/fiber, ni mediapipe, ni @tensorflow-models, ni model-viewer,");
        N.push("ni body-pose, ni un visor .gltf o .vrm. Nada. Todo el efecto se consigue con getUserMedia");
        N.push("y un canvas 2D, que es API del navegador.");
        N.push("");
        N.push("Y poseDetectada, que el caso presenta como la deteccion de pose que permite ver como le");
        N.push("queda la prenda, se pone a true en la linea 481 con una sola comprobacion:");
        N.push("");
        N.push("  if (detectarVideo()) setPoseDetectada(true);");
        N.push("");
        N.push("Es decir, significa 'la camara arranco'. No hay ninguna deteccion de pose, ni de puntos");
        N.push("clave, ni de silueta. El nombre de la variable es engañoso y por eso el caso lo describe");
        N.push("como algo que no es. La E3, del permiso de camara, si es real: getUserMedia pide el");
        N.push("permiso y si el usuario lo deniega no se crea la sesion.");
        N.push("");
        N.push("HALLAZGO 4: EL RESULTADO ES UN UPSERT, NO UN INSERT, Y EL CASO DICE INSERT.");
        N.push("");
        N.push("  const existente = SELECT id_resultado, resultado FROM resultados_prueba");
        N.push("                      WHERE id_sesion_ra = $1 ORDER BY id_resultado ASC LIMIT 1");
        N.push("  if (existente) { UPDATE resultados_prueba SET resultado = $2, fecha = NOW() ... }");
        N.push("  else          { INSERT INTO resultados_prueba ... }");
        N.push("");
        N.push("O sea que una sesion tiene como maximo un veredicto, y pulsar la otra opcion lo");
        N.push("SOBREESCRIBE. La respuesta lo dice con actualizado: Boolean(existente).");
        N.push("");
        N.push("Como decision es defendible: uno se prueba una prenda y decide si le gusta, no la califica");
        N.push("dos veces. Pero el caso lo describe como un POST que inserta, y ademas el camino de");
        N.push("actualizacion escribe en la bitacora un UPDATE, no un INSERT como dice el caso. Con dos");
        N.push("pulsaciones seguidas hay dos filas de bitacora con la misma id_registro y la segunda con");
        N.push("old_data, que es la forma correcta de auditar un cambio de opinion.");
        N.push("");
        N.push("HALLAZGO 5: UN 'Gusta' ALIMENTA EL PERFIL DE RECOMENDACIONES. EL CASO NO LO MENCIONA.");
        N.push("");
        N.push("  if (resultado === 'Gusta') {");
        N.push("    await this.preferenciasService.registrarPreferenciasGusta(usuario.id_usuario, idPtc);");
        N.push("  }");
        N.push("");
        N.push("Es un efecto secundario que cruza de modulo: el vestidor virtual entrena el motor de");
        N.push("recomendaciones. El caso no dice ni una palabra de esto, y es la razon por la que");
        N.push("SRV_RecomendacionesService aparece al buscar sesiones_ra en el codigo. El paso 5 del caso");
        N.push("termina en registrar el resultado; en realidad termina en adiestrar el perfil.");
        N.push("");
        N.push("Y solo con 'Gusta': un 'No gusta' no deja rastro en las preferencias, lo cual es");
        N.push("simetrico y razonable.");
        N.push("");
        N.push("HALLAZGO 6: E5 DA 400, NO 422. QUINTA VEZ QUE PASA EN EL PROYECTO.");
        N.push("");
        N.push("  @IsIn(['Gusta', 'No gusta'], { message: 'Resultado de la prueba invalido.' })  -> 400");
        N.push("  if (resultado !== 'Gusta' && resultado !== 'No gusta')");
        N.push("    throw new UnprocessableEntityException('Resultado de la prueba invalido.');   -> 422");
        N.push("");
        N.push("Como el validation pipe corre antes que el servicio, por HTTP siempre gana el 400. El 422");
        N.push("del servicio es inalcanzable. Es exactamente el mismo patron que en CU25 dos veces");
        N.push("(stock minimo negativo y arreglo de items vacio), CU28 con la cantidad, y CU29 con la");
        N.push("maquina de estados. Se puede arreglar de una vez poniendo los validadores en el DTO y");
        N.push("quitando la comprobacion del servicio, o al reves.");
        N.push("");
        N.push("HALLAZGO 7: validarPrenda NO MIRA estado_stock, Y EL AVATAR GENERICO NO EXISTE.");
        N.push("");
        N.push("  SELECT ptc.id_ptc, ..., p.estado AS estado_producto, ..., p.modelo_3d_url");
        N.push("  ...");
        N.push("  if (String(fila.estado_producto).toLowerCase() !== 'activo')");
        N.push("    throw new UnprocessableEntityException('Prenda no encontrada.');");
        N.push("");
        N.push("La precondicion del caso pide que estado_stock no sea 'Sin stock'. El servicio solo mira");
        N.push("el estado del PRODUCTO y no el del ptc. O sea que se puede probar con RA una prenda sin");
        N.push("stock, que es justo lo que el caso queria evitar.");
        N.push("");
        N.push("Y la E4 del caso, el avatar generico con el aviso 'Esta prenda usa una representacion");
        N.push("generica.', no tiene ninguna contraparte. El servicio devuelve modelo_3d_url tal cual,");
        N.push("incluido null, y no hace ninguna comprobacion de si esta vacio. Como el vestidor tampoco");
        N.push("lo lee, ese camino simply no existe en ninguna de las dos capas.");
        N.push("");
        N.push("Nota: el mensaje 'Prenda no encontrada.' se reutiliza para el producto inactivo, lo");
        N.push("cual es buena practica anti-enumeracion y coherente con el 404 de la sesion ajena.");
        N.push("");
        N.push("HALLAZGO 8: LA FOTO SE GUARDA EN sessionStorage, PERO LA TABLA NO LA TIENE.");
        N.push("");
        N.push("  guardarFotoSesion(foto) { sessionStorage.setItem('tm_ultima_foto_ra', foto); }");
        N.push("");
        N.push("La foto del resultado se compone en canvas y se guarda en base64, con un");
        N.push("@MaxLength(2_000_000) de dos megas y medio. Es un monton de datos para un campo de texto.");
        N.push("Lo coherente seria un bucket de objetos y una URL, o al menos una columna BYTEA. Y como");
        N.push("la tabla no tiene la columna, segun el hallazgo 1, la foto se pierde: se queda en la");
        N.push("pestana del navegador y no llega a la base. El E7 del caso, reintentar sin duplicar, no");
        N.push("tiene resuelto nada de eso.");
        N.push("");
        N.push("HALLAZGO 9: DOS COMPROBACIONES DE PROPIEDAD DISTINTAS EN EL MISMO SERVICIO.");
        N.push("");
        N.push("  registrarResultado:  sesion ajena -> 404 Sesión no encontrada.   (anti-enumeracion)");
        N.push("  validarReservaVinculada: reserva ajena -> 422 La reserva no pertenece a tu usuario.");
        N.push("");
        N.push("La primera oculta la existencia del recurso, la segunda la revela. Las dos estan en");
        N.push("SRV_SesionesRaService. Y validarCarritoVinculado tiene un tercer mensaje propio, 422");
        N.push("Carrito no encontrado. para el caso de que no exista, mientras que si el carrito es de");
        N.push("otro usuario el mensaje es distinto otra vez. Tres tratamientos para la misma idea en");
        N.push("80 lineas de servicio.");
        N.push("");
        N.push("HALLAZGO 10: NINGUNO DE LOS DOS METODOS DE ESCRITURA USA TRANSACCION.");
        N.push("");
        N.push("crearSesionRa hace el INSERT y luego el registrar de la bitacora, sin transaction. Si la");
        N.push("bitacora falla, la sesion queda creada sin auditar. registrarResultado hace lo mismo en");
        N.push("sus dos ramas. Es la sexta vez que aparece este defecto, tras CU21, CU28, CU29 y CU30.");
        N.push("Y aqui tiene un efecto extra: como la sesion no se puede crear (hallazgo 1), el flujo se");
        N.push("detiene antes, asi que el defecto esta latente detras de un fallo mayor.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - E1 es exacto: 'No tienes permisos para consultar el catálogo.' con el comodin '*'");
        N.push("    aceptado, igual que en el resto de casos de lectura del catalogo.");
        N.push("  - E6 es exacto: 'Sesión no encontrada.' y ademas cubre el caso de la sesion ajena, que");
        N.push("    el caso no menciona pero que es la parte interesante del mensaje.");
        N.push("  - E4 y E7 no tienen contraparte en el backend: la camara es cosa del navegador y el");
        N.push("    error de red lo maneja el cliente. La E3 si es real, porque getUserMedia es el que");
        N.push("    pide el permiso y decide si hay sesion o no.");
        N.push("  - El caso dice Flutter en el titulo, en los actores y en cinco frases mas. La");
        N.push("    implementacion es React con Vite y Tailwind, como todo el proyecto. No hay cliente");
        N.push("    movil en ningun sitio, lo cual tiene una consecuencia concreta: la superposicion se");
        N.push("    hace sobre la camara FRONTAL del navegador de escritorio o movil, con resolucion");
        N.push("    ideal 720x900, no con la camara de ARKit o ARCore del movil.");
        N.push("  - El caso menciona que las medidas del avatar se capturan al inicio, con estatura y");
        N.push("    complexion. En el codigo medidas_avatar es un VARCHAR(120) libre que el usuario");
        N.push("    escribe a mano en un Input, igual que alturaCm. No hay ninguna captura, ni estructurada");
        N.push("    ni automatica. Y en la respuesta del DTO el limite es 255, mas del que admite la");
        N.push("    columna de 120, o sea que un texto de 200 caracteres pasaria la validacion y")
        ;
        N.push("    Postgres lo cortaria con un error de longitud.");
        N.push("  - El historial vive en MisPruebasRa.tsx, en pages/cliente, con su propio endpoint");
        N.push("    GET /sesiones-ra/historial. El caso lo menciona como 'el perfil del Cliente' sin");
        N.push("    decir que es una pagina propia.");
        N.push("  - El modulo se llama sesiones-ra con guion, y los archivos se llaman SRV_SesionesRaService");
        N.push("    con el prefijo SRV_. Es la unica carpeta del proyecto con guion en el nombre; las");
        N.push("    demas usan cartoneria o ander con guion si la palabra lo necesita.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU32 - VESTIDOR VIRTUAL CON RA - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 105");
    T.push("Operaciones reales: " + totalOpe + " de 31");
    T.push("CONECTORES DIBUJADOS: " + conEnDiagrama + " de 54");
    if (conEnDiagrama < 46) T.push("  FALTAN LINEAS. Reejecuta el script: es idempotente y las coloca.");
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
    msg = msg + "CU32 - Vestidor virtual con realidad aumentada" + SALTO + SALTO;
    msg = msg + "POST /sesiones-ra falla: escribe la columna foto_resultado," + SALTO;
    msg = msg + "que no existe en sesiones_ra." + SALTO + SALTO;
    msg = msg + "Clases: 25    Actores: 2    Relaciones: 54" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 105" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 31" + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de 54" + SALTO;
    if (conEnDiagrama < 46) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "AVISO 2: no hay RA ni 3D. Es una foto recortada sobre" + SALTO;
    msg = msg + "         canvas, colocada a mano por el usuario." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU32 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU32 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU32", 0); } catch (e3) { }
}
