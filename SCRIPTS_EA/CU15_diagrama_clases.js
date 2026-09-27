// ================================================================
// CU15 - GESTIONAR TEMPORADAS Y COLECCIONES
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   web/src/pages/admin/AdminTemporadas.tsx     pestanas, modal unico, confirmacion
//   web/src/lib/api.ts                          listar/crear/actualizar temporadas y colecciones
//   api/src/modulos/catalogo/CTR_TemporadasAdmin.ts     7 endpoints bajo /admin
//   api/src/modulos/catalogo/SRV_TemporadasService.ts   19 metodos
//   api/src/modulos/seguridad/SRV_BitacoraService.ts   registrar
//   api/src/modulos/seguridad/dependencias.ts           JwtAuthGuard
//   BASE DE DATOS/schema.sql                   temporadas, colecciones, producto_coleccion
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
    ["IU_AdminTemporadas", "AdminTemporadas", "pages/admin/AdminTemporadas.tsx",
     [["pestana", "String = temporadas|colecciones", VIS_PUB], ["temporadas", "Array", VIS_PUB], ["colecciones", "Array", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["edicion", "Object", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["errorModal", "String", VIS_PUB], ["cambioEstado", "Object", VIS_PUB], ["enviandoEstado", "Boolean", VIS_PUB], ["errorEstado", "String", VIS_PUB], ["toast", "Object", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["abrirEdicion", "void", ["item"], VIS_PUB], ["guardar", "void", [], VIS_PUB], ["confirmarInhabilitar", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "api", "lib/api.ts",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["listarTemporadas", "Array", [], VIS_PUB], ["crearTemporada", "Object", ["payload"], VIS_PUB], ["actualizarTemporada", "Object", ["id", "payload"], VIS_PUB], ["inhabilitarTemporada", "Object", ["id"], VIS_PUB], ["listarColecciones", "Array", [], VIS_PUB], ["crearColeccion", "Object", ["payload"], VIS_PUB], ["actualizarColeccion", "Object", ["id", "payload"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_TemporadasAdminController", "TemporadasAdminController", "CTR_TemporadasAdmin.ts",
     [["temporadasService", "TemporadasService", VIS_PRI]],
     [["listarTemporadas", "Array", ["currentUser"], VIS_PUB], ["crearTemporada", "Object", ["body", "request", "currentUser"], VIS_PUB], ["actualizarTemporada", "Object", ["id", "body", "request", "currentUser"], VIS_PUB], ["inhabilitarTemporada", "Object", ["id", "body", "request", "currentUser"], VIS_PUB], ["listarColecciones", "Array", ["currentUser"], VIS_PUB], ["crearColeccion", "Object", ["body", "request", "currentUser"], VIS_PUB], ["actualizarColeccion", "Object", ["id", "body", "request", "currentUser"], VIS_PUB]]],

    ["SRV_TemporadasService", "TemporadasService", "SRV_TemporadasService.ts",
     [["logger", "Logger", VIS_PRI], ["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermiso", "void", ["usuario"], VIS_PRI], ["validarNombre", "String", ["nombre"], VIS_PRI], ["validarFecha", "String", ["fecha"], VIS_PRI], ["validarRango", "void", ["inicio", "fin"], VIS_PRI], ["validarEstado", "String", ["estado"], VIS_PRI], ["asegurarTemporadaUnica", "void", ["nombre", "idActual"], VIS_PRI], ["asegurarColeccionUnica", "void", ["nombre", "idActual"], VIS_PRI], ["validarTemporadaExiste", "void", ["id"], VIS_PRI], ["formatearFecha", "String", ["valor"], VIS_PRI], ["formatearFechaHora", "String", ["valor"], VIS_PRI], ["bitacora", "void", ["accion", "tabla", "detalle", "usuario", "request", "idRegistro", "oldData", "newData"], VIS_PRI], ["listarTemporadas", "Array", ["usuario"], VIS_PUB], ["crearTemporada", "Object", ["usuario", "dto", "request"], VIS_PUB], ["actualizarTemporada", "Object", ["usuario", "id", "dto", "request"], VIS_PUB], ["inhabilitarTemporada", "Object", ["usuario", "id", "request"], VIS_PUB], ["listarColecciones", "Array", ["usuario"], VIS_PUB], ["crearColeccion", "Object", ["usuario", "dto", "request"], VIS_PUB], ["actualizarColeccion", "Object", ["usuario", "id", "dto", "request"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "JwtAuthGuard", "dependencias.ts",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_BitacoraService", "BitacoraService", "SRV_BitacoraService.ts",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_DataSource", "DataSource", "TypeORM",
     [],
     [["getRepository", "Repository", ["entidad"], VIS_PUB], ["query", "Array", ["sql", "params"], VIS_PUB]]],

    ["CE_Temporada", "Temporada", "tabla temporadas",
     [["id_temporada", "Integer", VIS_PRI], ["nombre", "String = 80", VIS_PUB], ["fecha_inicio", "Date", VIS_PUB], ["fecha_fin", "Date", VIS_PUB], ["estado", "String = Programada", VIS_PUB]],
     []],

    ["CE_Coleccion", "Coleccion", "tabla colecciones",
     [["id_coleccion", "Integer", VIS_PRI], ["nombre", "String = 80", VIS_PUB], ["descripcion", "Text", VIS_PUB], ["id_temporada", "Integer", VIS_PUB], ["fecha_creacion", "Timestamp", VIS_PUB]],
     []],

    ["CE_Producto", "Producto", "tabla productos",
     [["id_producto", "Integer", VIS_PRI], ["codigo", "String = 40", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["id_temporada", "Integer", VIS_PUB], ["precio_base", "Decimal = 10,2", VIS_PUB], ["estado", "String = Disponible", VIS_PUB]],
     []],

    ["CE_ProductoColeccion", "ProductoColeccion", "tabla producto_coleccion",
     [["id_coleccion", "Integer", VIS_PRI], ["id_producto", "Integer", VIS_PRI]],
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
     []],

    ["CE_TemporadaRequest", "TemporadaRequest", "CTR_TemporadasAdmin.ts",
     [["nombre", "String = 3 a 60", VIS_PUB], ["fecha_inicio", "String = AAAA-MM-DD", VIS_PUB], ["fecha_fin", "String = AAAA-MM-DD", VIS_PUB], ["estado", "String = Activa|Inactiva", VIS_PUB]],
     []],

    ["CE_ColeccionRequest", "ColeccionRequest", "CTR_TemporadasAdmin.ts",
     [["nombre", "String = 3 a 60", VIS_PUB], ["descripcion", "Text = max 500", VIS_PUB], ["id_temporada", "Integer", VIS_PUB]],
     []],

    ["CE_EstadoRequest", "EstadoRequest", "CTR_TemporadasAdmin.ts",
     [["estado", "String = Inactiva", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Administrador", "Administrador General", "gestionar_temporadas"]
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

function relacion(a, b, etiqueta, tipo, est, rolA, rolB, cA, cB) {
    if (a == null || b == null) return;
    var con = null;
    for (var i = 0; i < a.Connectors.Count; i++) {
        var c = a.Connectors.GetAt(i);
        if (c.SupplierID == b.ElementID) { con = c; break; }
    }
    if (con == null) {
        try { con = a.Connectors.AddNew("", tipo); } catch (e) { con = a.Connectors.AddNew("", "Association"); }
        con.ClientID = a.ElementID;
        con.SupplierID = b.ElementID;
        con.Update();
    }
    try { con.Name = etiqueta; } catch (e) { }
    try { con.Stereotype = est; } catch (e) { }
    try { con.SourceRole = rolA; } catch (e) { }
    try { con.DestinationRole = rolB; } catch (e) { }
    try { con.SourceCardinality = cA; } catch (e) { }
    try { con.DestinationCardinality = cB; } catch (e) { }
    try { con.FontSize = 7; } catch (e) { }
    try { con.Update(); } catch (e) { }
}

function main() {
    var cu = buscarPaquete(RAIZ, "Casos de Uso");
    if (cu == null) cu = RAIZ;
    var mod = buscarPaquete(cu, "2. Catálogo y Productos");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU15 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU15 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
    if (diag == null) ERRORES.push("no se pudo crear el diagrama");

    if (diag != null) {
        diag.Update();
        try { paq.Diagrams.Refresh(); } catch (e) { }
        var COLX = [30, 300, 570, 840];
        var ANCHO = 250;

        for (var p = 0; p < actores.length; p++) {
            colocar(diag, actores[p], COLX[p], 25, 190, 100);
        }
        for (var k2 = 0; k2 < DEF.length; k2++) {
            var col = k2 % 4;
            var fila = 1 + Math.floor(k2 / 4);
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
        for (var r = 0; r < actores.length; r++) relacion(actores[r], C[0], "usuario", "Association", "", "actor", "pantalla", "1", "0..1");
        relacion(C[0], C[1], "cliente HTTP", "Dependency", "uses", "pantalla", "cliente", "1", "1");
        relacion(C[0], C[7], "temporadas mostradas", "Association", "", "pantalla", "listado", "0..*", "1");
        relacion(C[0], C[8], "colecciones mostradas", "Association", "", "pantalla", "listado", "0..*", "1");
        relacion(C[1], C[2], "punto de acceso HTTP", "Dependency", "uses", "consumidor", "endpoint", "1", "0..1");
        relacion(C[2], C[15], "datos de entrada", "Association", "", "controlador", "temporada", "1", "1");
        relacion(C[2], C[16], "datos de entrada", "Association", "", "controlador", "colección", "1", "1");
        relacion(C[2], C[17], "datos de entrada", "Association", "", "controlador", "estado", "1", "1");
        relacion(C[2], C[4], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        relacion(C[2], C[3], "servicio de temporadas", "Association", "", "controlador", "servicio", "1", "1");
        relacion(C[3], C[4], "usuario autenticado", "Association", "", "temporadas", "guard", "1", "1");
        relacion(C[3], C[5], "auditoría de la operación", "Association", "", "temporadas", "auditor", "1", "1");
        relacion(C[3], C[6], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        relacion(C[3], C[7], "temporada gestionada", "Composition", "composition", "temporadas", "temporada", "1", "0..*");
        relacion(C[3], C[8], "colección gestionada", "Composition", "composition", "temporadas", "colección", "1", "0..*");
        relacion(C[3], C[9], "productos en uso", "Dependency", "uses", "temporadas", "producto", "1", "0..*");
        relacion(C[3], C[11], "usuario autenticado", "Association", "", "temporadas", "usuario", "1", "0..1");
        relacion(C[3], C[12], "rol del usuario", "Association", "", "temporadas", "rol", "1", "0..1");
        relacion(C[3], C[13], "asignación de rol", "Association", "", "temporadas", "asignación", "1", "0..*");
        relacion(C[4], C[11], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");
        relacion(C[5], C[14], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        relacion(C[5], C[6], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        relacion(C[14], C[11], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");
        relacion(C[7], C[9], "productos de la temporada", "Association", "", "temporada", "producto", "1", "0..*");
        relacion(C[8], C[7], "temporada de la colección", "Association", "", "colección", "temporada", "0..1", "1");
        relacion(C[10], C[8], "productos de la colección", "Composition", "composition", "enlace", "colección", "1", "1");
        relacion(C[10], C[9], "colecciones del producto", "Composition", "composition", "enlace", "producto", "1", "1");
        relacion(C[13], C[11], "usuario asignado", "Association", "", "asignación", "usuario", "1", "1");
        relacion(C[13], C[12], "rol asignado", "Association", "", "asignación", "rol", "1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("Los mensajes y las excepciones de CU15 solo estan en el diagrama de comunicacion.");
        N.push("");
        N.push("1 actor, 18 clases y 29 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (2), CTR_ controlador (1), SRV_ servicio (4), CE_ entidad o DTO (11).");
        N.push("");
        N.push("DISCREPANCIAS CON EL CASO DE USO, verificadas contra el codigo real:");
        N.push("");
        N.push("1. NO hay 12 endpoints, hay 7. El controlador expone:");
        N.push("   GET    admin/temporadas");
        N.push("   POST   admin/temporadas        201");
        N.push("   PUT    admin/temporadas/:id");
        N.push("   PATCH  admin/temporadas/:id");
        N.push("   GET    admin/colecciones");
        N.push("   POST   admin/colecciones       201");
        N.push("   PUT    admin/colecciones/:id");
        N.push("   No hay DELETE en ninguna de las dos tablas, ni PATCH de estado en colecciones, y tampoco");
        N.push("   existe ninguna forma de eliminar fisicamente una temporada o una coleccion.");
        N.push("");
        N.push("2. La ruta real del PATCH es PATCH admin/temporadas/:id, y no admin/temporadas/:id/estado.");
        N.push("   El caso se contradice: en la descripcion escribe /temporadas/:id/estado y mas abajo solo");
        N.push("   /temporadas/:id.");
        N.push("");
        N.push("3. El DTO EstadoRequest solo admite el valor Inactiva, con @IsIn(['Inactiva']). NO existe un");
        N.push("   endpoint de reactivacion: para volver una temporada a Activa hay que usar el");
        N.push("   PUT admin/temporadas/:id con estado: 'Activa', porque ahi el campo si acepta ambos.");
        N.push("   El caso no menciona esta limitacion.");
        N.push("");
        N.push("4. E1 tiene tres caminos distintos. Formato incorrecto: La fecha debe tener formato");
        N.push("   AAAA-MM-DD., que sale de la expresion regular /^\\d{4}-\\d{2}-\\d{2}$/ tanto en el DTO");
        N.push("   (@Matches) como en validarFecha. Fecha con formato valido pero inexistente en el");
        N.push("   calendario: mismo mensaje, porque validarFecha construye new Date(Date.UTC(anio, mes-1,");
        N.push("   dia)) y compara getUTCFullYear, getUTCMonth y getUTCDate contra los componentes, de");
        N.push("   modo que 2026-02-30 se rechaza. Rango invertido: La fecha de fin debe ser posterior a la");
        N.push("   de inicio. El caso solo menciona el ultimo.");
        N.push("");
        N.push("5. El nombre se limita a 60 caracteres, aunque las columnas son VARCHAR(80) en las dos");
        N.push("   tablas. El DTO trae @MaxLength(60) y validarNombre repite la comprobacion con");
        N.push("   El nombre no puede superar 60 caracteres. El limite efectivo es mas restrictivo que");
        N.push("   el de la base.");
        N.push("");
        N.push("6. La descripcion de coleccion se limita a 500 caracteres con La descripcion no puede");
        N.push("   superar 500 caracteres., aunque la columna es TEXT.");
        N.push("");
        N.push("7. HALLAZGO IMPORTANTE: la comprobacion de E4 filtra por LOWER(estado) = 'activo', pero el");
        N.push("   default de productos.estado en schema.sql es 'Disponible', y CU13 inserta 'Activo'.");
        N.push("   O sea que conviven dos vocabularios: un producto creado por CU13 cuenta como activo y");
        N.push("   bloquea la inhabilitacion, mientras que un producto que conserve el default del esquema,");
        N.push("   'Disponible', NO cuenta y deja nautical la temporada. El caso no advierte esta colision.");
        N.push("");
        N.push("8. El mensaje de E4 es exacto: No se puede inhabilitar: existen productos activos en esta");
        N.push("   temporada.");
        N.push("");
        N.push("9. Excepcion adicional no documentada: La temporada ya esta inactiva. con 409, si se");
        N.push("   intenta inhabilitar una que ya lo esta. El servicio vuelve a comprobarlo aunque el DTO");
        N.push("   ya limita el valor a Inactiva.");
        N.push("");
        N.push("10. Confirmado que no hace falta migracion. temporadas tiene id_temporada, nombre,");
        N.push("    fecha_inicio, fecha_fin y estado; colecciones tiene id_coleccion, nombre,");
        N.push("    descripcion, id_temporada y fecha_creacion, sin columna estado, tal como anticipa");
        N.push("    el caso. PERO el default de temporadas.estado es 'Programada', no 'Activa', y el");
        N.push("    servicio siempre envia el estado explicito con default 'Activa' en validarEstado.");
        N.push("");
        N.push("11. HALLAZGO IMPORTANTE: nombre NO es UNIQUE ni en temporadas ni en colecciones. Las dos");
        N.push("    columnas son VARCHAR(80) NOT NULL sin restriccion. La unicidad la impone solo la");
        N.push("    aplicacion, con SELECT COUNT(*)::int FROM ... WHERE LOWER(nombre) = LOWER($1) y el");
        N.push("    descarte por id en la edicion mediante ($2::int IS NULL OR id_temporada <> $2). Con");
        N.push("    dos peticiones simultaneas se pueden crear duplicados.");
        N.push("");
        N.push("12. cargarPermisos vuelve a usar la variante de primera fila con JOIN crudo, igual que");
        N.push("    ProductosService, y distinta de Empleados, Roles, Sucursales y Auditoria, que usan el");
        N.push("    QueryBuilder con leftJoinAndSelect sobre usuario.roles[].rol.permisos_json.");
        N.push("");
        N.push("13. Las respuestas de alta devuelven el objeto completo, no un { detail }. CrearTemporada");
        N.push("    devuelve ItemTemporada con nro_productos: 0 fijo, y crearColeccion devuelve");
        N.push("    ItemColeccion con nombre_temporada: null fijo. El toast Temporada registrada. lo arma el");
        N.push("    frontend, no la API. Solo inhabilitarTemporada devuelve { detail }, con el texto");
        N.push("    Temporada inhabilitada correctamente.");
        N.push("");
        N.push("14. BUG REAL: actualizarTemporada siempre devuelve nro_productos: 0. La consulta previa");
        N.push("    SELECT id_temporada, nombre, fecha_inicio::text, fecha_fin::text, estado FROM temporadas");
        N.push("    WHERE id_temporada = $1 no trae el subselect de conteo, y el codigo hace");
        N.push("    Number(vieja.nro_productos ?? 0). Despues de editar una temporada, el frontend ve 0");
        N.push("    productos aunque tenga, hasta que recargue la lista.");
        N.push("");
        N.push("15. El servicio tiene un ayudante privado unaFila() que tolera dos formas de retorno de");
        N.push("    dataSource.query: si el driver devuelve un arreglo de arreglos toma resultado[0][0], y");
        N.push("    si devuelve un arreglo de objetos toma el primero. Existe porque la forma del arreglo");
        N.push("    de filas no es estable, y se usa en cada INSERT, UPDATE y SELECT con RETURNING.");
        N.push("");
        N.push("16. La tabla producto_coleccion existe en el esquema con id_coleccion e id_producto, pero");
        N.push("    NINGUN endpoint de este caso la usa. crearColeccion solo inserta en colecciones. O sea");
        N.push("    que el vínculo prenda-coleccion existe en el modelo pero no se puede administrar por API.");
        N.push("");
        N.push("17. Los dos listados usan SQL crudo. listarTemporadas ordena por");
        N.push("    t.fecha_inicio DESC NULLS LAST, t.id_temporada DESC y trae el conteo con");
        N.push("    (SELECT COUNT(*)::int FROM productos p WHERE p.id_temporada = t.id_temporada) AS");
        N.push("    nro_productos, sin filtro de estado. listarColecciones hace LEFT JOIN temporadas y");
        N.push("    ordena por id_coleccion DESC.");
        N.push("");
        N.push("18. El caso describe Angular y FastAPI; la implementacion real es React/Vite con NestJS.");
        N.push("    No hay cliente Flutter.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU15 - GESTIONAR TEMPORADAS Y COLECCIONES - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 66");
    T.push("Operaciones reales: " + totalOpe + " de 44");
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
    msg = msg + "CU15 - Gestionar temporadas y colecciones" + SALTO + SALTO;
    msg = msg + "Clases: 18    Actores: 1    Relaciones: 29" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 66" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 44" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU15 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU15 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU15", 0); } catch (e3) { }
}
