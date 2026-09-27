// ================================================================
// CU11 - CONSULTAR BITACORA DE AUDITORIA
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   web/src/pages/admin/Auditoria.tsx        filtros, tabla, paginacion, exportar CSV
//   web/src/lib/api.ts                       listarAuditoria, exportarAuditoriaCSV
//   api/src/modulos/seguridad/CTR_Auditoria.ts      AdminController
//   api/src/modulos/seguridad/SRV_AuditoriaService.ts  consultar, exportarCSV, listarEmails
//   api/src/modulos/seguridad/dependencias.ts          JwtAuthGuard
//   api/src/modulos/seguridad/CE_Modelos.ts             BitacoraAuditoria, Usuario
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
    ["IU_Auditoria", "Auditoria", "pages/admin/Auditoria.tsx",
     [["fechaDesde", "String", VIS_PUB], ["fechaHasta", "String", VIS_PUB], ["usuarioFiltro", "String", VIS_PUB], ["tabla", "String", VIS_PUB], ["accion", "String", VIS_PUB], ["pagina", "Integer", VIS_PUB], ["datos", "Array", VIS_PUB], ["total", "Integer", VIS_PUB], ["totalPaginas", "Integer", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["expandidoId", "Integer", VIS_PUB], ["emails", "Array", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["aplicarFiltros", "void", [], VIS_PUB], ["limpiarFiltros", "void", [], VIS_PUB], ["cambiarPagina", "void", ["pagina"], VIS_PUB], ["toggleExpandir", "void", ["id"], VIS_PUB], ["exportarCSV", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "api", "lib/api.ts",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["listarAuditoria", "Object", ["filtros"], VIS_PUB], ["exportarAuditoriaCSV", "Object", ["filtros"], VIS_PUB], ["listarEmailsAuditoria", "Array", [], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_AdminController", "AdminController", "CTR_Auditoria.ts",
     [["auditoriaService", "AuditoriaService", VIS_PRI]],
     [["normalizarFiltros", "FiltrosAuditoria", ["query"], VIS_PRI], ["auditoria", "Object", ["query", "request", "response", "currentUser"], VIS_PUB], ["usuariosEmail", "Array", ["currentUser"], VIS_PUB]]],

    ["SRV_AuditoriaService", "AuditoriaService", "SRV_AuditoriaService.ts",
     [["dataSource", "DataSource", VIS_PRI]],
     [["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["verificarPermiso", "Boolean", ["permisos", "permiso"], VIS_PRI], ["calcularRango", "Object", ["fecha_desde", "fecha_hasta"], VIS_PRI], ["construirQuery", "Object", ["filtros"], VIS_PRI], ["mapearRegistro", "Object", ["fila"], VIS_PRI], ["consultar", "Object", ["usuario", "filtros"], VIS_PUB], ["exportarCSV", "String", ["usuario", "filtros"], VIS_PUB], ["listarEmails", "Array", ["usuario"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "JwtAuthGuard", "dependencias.ts",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_DataSource", "DataSource", "TypeORM",
     [],
     [["getRepository", "Repository", ["entidad"], VIS_PUB], ["query", "Array", ["sql", "params"], VIS_PUB]]],

    ["CE_BitacoraAuditoria", "BitacoraAuditoria", "tabla bitacora_auditoria",
     [["id_bitacora", "Integer", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "String", VIS_PUB], ["user_agent", "String", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_Usuario", "Usuario", "tabla usuarios",
     [["id_usuario", "Integer", VIS_PRI], ["email", "String = 120", VIS_PRI], ["ci", "String", VIS_PRI], ["password_hash", "String = 255", VIS_PRI], ["estado", "String", VIS_PUB], ["intentos_fallidos", "Integer", VIS_PUB], ["bloqueado_hasta", "Timestamp", VIS_PUB], ["fecha_creacion", "Timestamp", VIS_PUB], ["fecha_ultimo_acceso", "Timestamp", VIS_PUB], ["ultimo_login", "Timestamp", VIS_PUB]],
     []],

    ["CE_FiltrosAuditoria", "FiltrosAuditoria", "SRV_AuditoriaService.ts",
     [["pagina", "Number", VIS_PUB], ["limite", "Number", VIS_PUB], ["fecha_desde", "String = YYYY-MM-DD", VIS_PUB], ["fecha_hasta", "String = YYYY-MM-DD", VIS_PUB], ["usuario", "String", VIS_PUB], ["tabla", "String", VIS_PUB], ["accion", "String", VIS_PUB]],
     []],

    ["CE_RegistroAuditoria", "RegistroAuditoria", "SRV_AuditoriaService.ts",
     [["id", "Number", VIS_PUB], ["fecha", "String", VIS_PUB], ["ip", "String", VIS_PUB], ["correo", "String", VIS_PUB], ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB], ["registro_id", "Number", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Administrador", "Administrador General", "ver_auditoria"]
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
    var mod = subPaquete(cu, "1. Seguridad y Autenticación");
    var paq = subPaquete(mod, "CU11 - Análisis de clases");

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
        INFORME.push(pad(d2[0], 26) + " atr " + totalDe(fin) + "/" + d2[3].length + "  ope " + totalDe(finOpe) + "/" + d2[4].length + (bien ? "  REAL" : "  TEXTO"));
    }

    var diag = null;
    try { diag = paq.Diagrams.AddNew("CU11 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        relacion(C[0], C[9], "registros mostrados", "Association", "", "pantalla", "registro", "0..*", "1");
        relacion(C[1], C[2], "punto de acceso HTTP", "Dependency", "uses", "consumidor", "endpoint", "1", "0..1");
        relacion(C[2], C[8], "parámetros de consulta", "Association", "", "controlador", "filtros", "1", "1");
        relacion(C[2], C[9], "datos de salida", "Association", "", "controlador", "registro", "0..*", "1");
        relacion(C[2], C[4], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        relacion(C[2], C[3], "servicio de auditoría", "Association", "", "controlador", "servicio", "1", "1");
        relacion(C[3], C[4], "usuario autenticado", "Association", "", "auditoría", "guard", "1", "1");
        relacion(C[3], C[5], "consulta de auditoría", "Dependency", "uses", "servicio", "datos", "1", "1");
        relacion(C[3], C[8], "filtros aplicados", "Association", "", "servicio", "filtros", "1", "1");
        relacion(C[3], C[6], "registros consultados", "Dependency", "uses", "servicio", "bitácora", "1", "0..*");
        relacion(C[3], C[7], "usuario de la acción", "Association", "", "servicio", "usuario", "0..*", "0..1");
        relacion(C[3], C[9], "registros mapeados", "Association", "", "servicio", "registro", "0..*", "1");
        relacion(C[4], C[7], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("Los mensajes y las excepciones de CU11 solo estan en el diagrama de comunicacion.");
        N.push("");
        N.push("1 actor, 10 clases y 14 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (2), CTR_ controlador (1), SRV_ servicio (3), CE_ entidad o DTO (4).");
        N.push("");
        N.push("DISCREPANCIAS CON EL CASO DE USO, verificadas contra el codigo real:");
        N.push("");
        N.push("1. La tabla usuarios NO tiene columna correo, tiene email. El caso escribe");
        N.push("   LEFT JOIN usuarios u ON b.id_usuario = u.id y u.correo ILIKE. El codigo real hace");
        N.push("   leftJoin('usuarios', 'u', 'u.id_usuario = b.id_usuario') y filtra con u.email ILIKE :usuario,");
        N.push("   devolviendo u.email AS correo. El alias correo es solo el nombre de la columna del");
        N.push("   SELECT, no una columna existente.");
        N.push("");
        N.push("2. Casi ninguno de los nombres de columna del SQL del caso existe. El caso escribe");
        N.push("   b.id, b.fecha, b.ip, b.registro_id y b.id_usuario = u.id. Los nombres reales son:");
        N.push("   b.id_bitacora, b.fecha_hora, b.ip_address, b.id_registro y u.id_usuario.");
        N.push("   El servicio lo tolera porque mapearRegistro usa doble lectura, por ejemplo");
        N.push("   fila.id ?? fila.b_id_bitacora y fila.fecha ?? fila.b_fecha_hora, para aceptar los dos formatos.");
        N.push("");
        N.push("3. NO hay SQL con parametros posicionales $1 a $7. El codigo usa el QueryBuilder de TypeORM");
        N.push("   con parametros nombrados y condicionales: solo añade el andWhere si el filtro viene");
        N.push("   informado. El caso sugiere un unico query fijo con ($1::date IS NULL OR ...), que ademas");
        N.push("   impediria que el planificador use los indices.");
        N.push("");
        N.push("4. E2 tiene tres caminos distintos al mismo 422, no solo el rango invertido.");
        N.push("   calcularRango primero valida el formato de cada fecha con la expresion regular");
        N.push("   /^\\d{4}-\\d{2}-\\d{2}$/ y devuelve 422 El rango de fechas es invalido. si no es ISO.");
        N.push("   Solo despues compara desde.getTime() > hasta.getTime(). El caso solo menciona el orden.");
        N.push("");
        N.push("5. El rango se ajusta a dia completo, no por ::date. fecha_desde se parsea como");
        N.push("   ${fecha_desde}T00:00:00 y fecha_hasta como ${fecha_hasta}T23:59:59.999, y la comparacion es");
        N.push("   por timestamp directo: b.fecha_hora >= :desde y b.fecha_hora <= :hasta. El caso escribe");
        N.push("   b.fecha::date >= $1, que ademas no usaria indice sobre un timestamptz.");
        N.push("");
        N.push("6. limite se acota entre 1 y 100 con Math.min(Math.max(limite || 20, 1), 100) y pagina tiene");
        N.push("   minimo 1 con Math.max(pagina || 1, 1). El caso solo menciona limite=20.");
        N.push("");
        N.push("7. La exportacion a CSV usa el MISMO endpoint, con el parametro format=csv en el query");
        N.push("   string. Si query.format === 'csv' el controlador responde el texto plano con");
        N.push("   Content-Type: text/csv; charset=utf-8 y");
        N.push("   Content-Disposition: attachment; filename=\"bitacora_auditoria_{HOY}.csv\", donde HOY se");
        N.push("   calcula una sola vez al cargar el modulo. No hay un endpoint de exportacion aparte.");
        N.push("");
        N.push("8. exportarCSV NO pagina y NO tiene limite: trae todos los registros que casen con el filtro.");
        N.push("   El CSV se arma a mano en el servicio, con el separador coma, doble comilla escapada");
        N.push("   duplicandola y terminador de linea \\r\\n. Columnas: ID, Fecha, Usuario, Accion, Tabla,");
        N.push("   Registro ID, IP, old_data, new_data. old_data y new_data se serializan con JSON.stringify.");
        N.push("");
        N.push("9. El total se obtiene con un COUNT sobre el query clonado, no con COUNT(*) OVER().");
        N.push("   Es un segundo query: qb.clone().select('COUNT(b.id_bitacora)', 'total').getRawOne().");
        N.push("");
        N.push("10. El orden tiene desempate por identificador: ORDER BY b.fecha_hora DESC, b.id_bitacora");
        N.push("    DESC. El caso solo dice ORDER BY b.fecha DESC, que en empates de timestamp devolveria");
        N.push("    filas en orden no determinista.");
        N.push("");
        N.push("11. La respuesta incluye total_paginas, que el caso no menciona. El cuerpo es");
        N.push("    { registros, total, pagina, limite, total_paginas }.");
        N.push("");
        N.push("12. old_data y new_data se piden como texto con CAST(b.old_data AS text) y se parsean");
        N.push("    despues en mapearRegistro, con una funcion que tolera que el driver ya los devuelva");
        N.push("    como objeto y devuelve el valor crudo si el JSON no se puede parsear.");
        N.push("");
        N.push("13. Los filtros de tabla y accion son igualdad exacta, b.tabla_afectada = :tabla y");
        N.push("    b.accion_sql = :accion, sin comodines. Solo el filtro de usuario usa ILIKE con");
        N.push("    comodines a ambos lados: %valor%. El caso solo describe ese ultimo, correcto.");
        N.push("");
        N.push("14. El caso no menciona el endpoint GET /api/v1/admin/usuarios-email, que devuelve");
        N.push("    { id, email } ordenado por email y es el que alimenta el selector de usuario. Tambien");
        N.push("    exige el permiso ver_auditoria.");
        N.push("");
        N.push("15. El mensaje de permiso es No tienes permiso para consultar la bitacora de auditoria.");
        N.push("    con HTTP 403, y se aplica por igual a consultar, exportarCSV y listarEmails.");
        N.push("");
        N.push("16. El caso describe MatTable, MatDateRangePicker, MatPaginator, FormGroup y Angular; la");
        N.push("    implementacion real es React/Vite con tabla HTML, dos inputs de fecha, selectores");
        N.push("    propios y paginacion manual. No hay cliente Flutter.");
        N.push("");
        N.push("17. E3 es correcto: una pagina fuera de rango solo produce un OFFSET mayor que el total y");
        N.push("    devuelve la lista vacia, sin error.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU11 - CONSULTAR BITACORA DE AUDITORIA - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 55");
    T.push("Operaciones reales: " + totalOpe + " de 26");
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
    msg = msg + "CU11 - Consultar bitacora de auditoria" + SALTO + SALTO;
    msg = msg + "Clases: 10    Actores: 1    Relaciones: 14" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 55" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 26" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU11 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU11 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU11", 0); } catch (e3) { }
}
