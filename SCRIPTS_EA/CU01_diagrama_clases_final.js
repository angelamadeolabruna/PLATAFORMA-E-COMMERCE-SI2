// ================================================================
// CU01 - INICIAR SESION EN PLATAFORMA
// DIAGRAMA DE ANALISIS DE CLASES DEFINITIVO
//
// Los atributos y operaciones se crean con la API real de EA, segun
// lo discovered en la prueba v9:
//
//     el.Attributes.AddNew(nombre, tipo)      -> 2 argumentos, nada mas
//     attr.SetVisibility(vis)  y  attr.Update()   -> OBLIGATORIO
//     el.Methods.AddNew(nombre, retorno, parametros, "")
//     op.SetReturnType / SetParameters / SetVisibility / SetStereotype
//        / SetAbstract / SetStatic / SetQuery / SetReadOnly / SetNotes
//        y luego op.Update()                      -> OBLIGATORIO
//
// IMPORTANTE: este script NO termina con throw ni excepcion.
// Si el script lanza una excepcion, EA revierte los atributos y las
// operaciones aunque los elementos y los nombres si queden.
// El resumen se reporta con Repository.ShowMessage, que se puede
// silenciar poniendo SIN_MENSAJES = true.
//
// Diagrama estatico: sin mensajes, sin lineas de vida, sin
// secuencia y sin casos de uso.
// ================================================================

var SIN_MENSAJES = false;
var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);
var VIS_PUBLICA = 0;
var VIS_PRIVADA = 1;

var ACTORES = [
    ["Administrador", "/admin"],
    ["Encargado de Sucursal", "/admin"],
    ["Cajero", "/admin"],
    ["Cliente", "/"]
];

var DEF = [
    ["Login", "Boundary", "IU_Login", "pages/Login.tsx",
     [["credencial", "String", VIS_PRIVADA], ["password", "String", VIS_PRIVADA],
      ["verPassword", "Boolean", VIS_PRIVADA], ["error", "String", VIS_PRIVADA],
      ["enviando", "Boolean", VIS_PRIVADA]],
     [["onSubmit", "void", ["e: FormEvent"], VIS_PRIVADA],
      ["render", "JSX.Element", [], VIS_PUBLICA]]],

    ["AuthProvider", "Boundary", "IU_AuthProvider", "contexts/AuthContext.tsx",
     [["usuario", "UsuarioSesion", VIS_PRIVADA], ["token", "String", VIS_PRIVADA],
      ["cargando", "Boolean", VIS_PRIVADA]],
     [["login", "UsuarioSesion", ["credencial", "password"], VIS_PUBLICA],
      ["logout", "void", [], VIS_PUBLICA],
      ["setUsuario", "void", ["nuevo"], VIS_PRIVADA]]],

    ["api", "Boundary", "IU_Api", "lib/api.ts",
     [["baseUrl", "String = /api/v1", VIS_PRIVADA]],
     [["login", "LoginResponse", ["credencial", "password"], VIS_PUBLICA],
      ["logout", "void", [], VIS_PUBLICA],
      ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUBLICA]]],

    ["AuthController", "Control", "CTR_Auth", "CTR_Auth.ts",
     [["cookieSecure", "Boolean", VIS_PRIVADA]],
     [["login", "AuthResponse", ["body", "request", "response"], VIS_PUBLICA],
      ["refresh", "AuthResponse", ["body", "request", "response"], VIS_PUBLICA],
      ["logout", "void", ["request", "response", "currentUser"], VIS_PUBLICA]]],

    ["LoginRequest", "Entity", "CE_LoginRequest", "Esquemas.ts",
     [["credencial", "String", VIS_PUBLICA], ["password", "String", VIS_PUBLICA]],
     []],

    ["AuthService", "Service", "SRV_AuthService", "SRV_AuthService.ts",
     [["dataSource", "DataSource", VIS_PRIVADA], ["jwtTokenService", "JwtTokenService", VIS_PRIVADA],
      ["bitacoraService", "BitacoraService", VIS_PRIVADA], ["seguridadService", "SeguridadService", VIS_PRIVADA]],
     [["autenticar", "AuthResponse", ["credencial", "password", "request"], VIS_PUBLICA],
      ["buscarPorCredencial", "Usuario", ["credencial"], VIS_PRIVADA],
      ["refrescar", "AuthResponse", ["request", "refresco"], VIS_PUBLICA],
      ["cerrarSesion", "void", ["usuario", "token", "refreshToken"], VIS_PUBLICA]]],

    ["JwtTokenService", "Service", "SRV_JwtTokenService", "SRV_JWTService.ts",
     [["accessMinutos", "Number = 15", VIS_PRIVADA], ["refreshDias", "Number = 7", VIS_PRIVADA],
      ["algoritmo", "String = HS256", VIS_PRIVADA]],
     [["generarPar", "Par", ["subject", "rol", "permisos"], VIS_PUBLICA],
      ["crearAccessToken", "String", ["subject", "rol", "permisos"], VIS_PUBLICA],
      ["crearRefreshToken", "String", ["subject"], VIS_PUBLICA],
      ["verificarRefreshToken", "TokenPayload", ["token"], VIS_PUBLICA],
      ["estaEnBlacklist", "Boolean", ["jti"], VIS_PUBLICA]]],

    ["SeguridadService", "Service", "SRV_SeguridadService", "SRV_SeguridadService.ts",
     [],
     [["validarPassword", "Boolean", ["usuario", "password"], VIS_PUBLICA],
      ["hashearPassword", "String", ["password"], VIS_PUBLICA]]],

    ["DataSource", "Service", "SRV_DataSource", "TypeORM",
     [],
     [["getRepository", "Repository", ["entidad"], VIS_PUBLICA],
      ["query", "Array", ["sql", "params"], VIS_PUBLICA]]],

    ["BitacoraService", "Service", "SRV_BitacoraService", "SRV_BitacoraService.ts",
     [],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle"], VIS_PUBLICA]]],

    ["AuthResponse", "Entity", "CE_AuthResponse", "Esquemas.ts",
     [["access_token", "String", VIS_PUBLICA], ["refresh_token", "String", VIS_PUBLICA],
      ["token_type", "String = bearer", VIS_PUBLICA], ["usuario", "UsuarioSesion", VIS_PUBLICA]],
     []],

    ["Usuario", "Entity", "CE_Usuario", "tabla usuarios",
     [["id_usuario", "Integer", VIS_PRIVADA], ["email", "String", VIS_PRIVADA],
      ["password_hash", "String", VIS_PRIVADA], ["estado", "String = Pendiente", VIS_PUBLICA],
      ["intentos_fallidos", "Integer = 0", VIS_PUBLICA],
      ["bloqueado_hasta", "Timestamp", VIS_PUBLICA], ["fecha_ultimo_acceso", "Timestamp", VIS_PUBLICA]],
     [["get rol", "Rol", [], VIS_PUBLICA], ["get nombre", "String", [], VIS_PUBLICA]]],

    ["UsuarioRol", "Entity", "CE_UsuarioRol", "tabla usuarios_roles",
     [["id_usuario", "Integer", VIS_PRIVADA], ["id_rol", "Integer", VIS_PRIVADA]],
     []],

    ["Rol", "Entity", "CE_Rol", "tabla roles",
     [["id_rol", "Integer", VIS_PRIVADA], ["nombre_rol", "String", VIS_PUBLICA],
      ["permisos_json", "JSONB", VIS_PUBLICA], ["estado", "String = Activo", VIS_PUBLICA]],
     []],

    ["BitacoraAuditoria", "Entity", "CE_BitacoraAuditoria", "tabla bitacora_auditoria",
     [["id_bitacora", "Integer", VIS_PRIVADA], ["id_usuario", "Integer", VIS_PRIVADA],
      ["accion_sql", "String", VIS_PUBLICA], ["tabla_afectada", "String", VIS_PUBLICA],
      ["id_registro", "Integer", VIS_PUBLICA], ["detalle", "Text", VIS_PUBLICA],
      ["ip_address", "INET", VIS_PUBLICA], ["user_agent", "String", VIS_PUBLICA],
      ["fecha_hora", "Timestamp", VIS_PUBLICA]],
     []]
];

// ------------------------------------------------------------------
// UTILIDADES
// ------------------------------------------------------------------

var ERRORES = [];
var LOG = [];

function nota(el, texto)
{
    if (el == null) return;
    try {
        var a = String(el.Notes || "");
        if (a.indexOf(texto) < 0) el.Notes = (a == "") ? texto : a + SALTO + texto;
        el.Update();
    } catch (ignore) { }
}

function buscarPaquete(paquete, nombre)
{
    if (paquete == null) return null;
    if (String(paquete.Name) == nombre) return paquete;
    for (var i = 0; i < paquete.Packages.Count; i++) {
        var e = buscarPaquete(paquete.Packages.GetAt(i), nombre);
        if (e != null) return e;
    }
    return null;
}

function subPaquete(padre, nombre)
{
    for (var i = 0; i < padre.Packages.Count; i++) {
        if (String(padre.Packages.GetAt(i).Name) == nombre) return padre.Packages.GetAt(i);
    }
    var nuevo = padre.Packages.AddNew(nombre, "");
    nuevo.Update();
    padre.Packages.Refresh();
    return buscarPaquete(padre, nombre);
}

function buscarLocal(paq, nombre, tipo)
{
    for (var i = 0; i < paq.Elements.Count; i++) {
        var e = paq.Elements.GetAt(i);
        if (String(e.Name) == nombre) {
            if (tipo == "" || String(e.Type) == tipo) return e;
        }
    }
    return null;
}

function visTexto(v) { return (v == VIS_PRIVADA) ? "private" : "public"; }

// ------------------------------------------------------------------
// ATRIBUTOS Y OPERACIONES
// ------------------------------------------------------------------

function ponerAtributo(el, nombre, tipo, vis)
{
    var a = null;
    try { a = el.Attributes.AddNew(nombre, tipo); } catch (e) { a = null; }
    if (a == null) {
        ERRORES.push("atributo " + nombre + " no se pudo crear");
        return false;
    }
    try { a.SetVisibility(visTexto(vis)); } catch (e) { }
    try { a.SetNotes(""); } catch (e) { }
    try { a.SetClassifierID(0); } catch (e) { }
    try { a.Update(); } catch (e) { }
    return true;
}

function ponerOperacion(el, nombre, retorno, parametros, vis)
{
    var m = null;
    var firma = (parametros && parametros.length > 0) ? parametros.join(", ") : "";
    try { m = el.Methods.AddNew(nombre, retorno, firma, ""); } catch (e) { m = null; }
    if (m == null) {
        ERRORES.push("operacion " + nombre + " no se pudo crear");
        return false;
    }
    try { m.SetReturnType(retorno); } catch (e) { }
    try { m.SetParameters(firma); } catch (e) { }
    try { m.SetVisibility(visTexto(vis)); } catch (e) { }
    try { m.SetStereotype(""); } catch (e) { }
    try { m.SetAbstract(false); } catch (e) { }
    try { m.SetStatic(false); } catch (e) { }
    try { m.SetQuery(false); } catch (e) { }
    try { m.SetReadOnly(false); } catch (e) { }
    try { m.SetNotes(""); } catch (e) { }
    try { m.Update(); } catch (e) { }
    return true;
}

function contarAtributos(el)
{
    try { return el.Attributes.Count; } catch (e) { return -1; }
}

function contarOperaciones(el)
{
    try { return el.Methods.Count; } catch (e) { return -1; }
}

// ------------------------------------------------------------------
// DIAGRAMA
// ------------------------------------------------------------------

function colocar(diag, el, izq, arr, ancho, alto)
{
    var o = null;
    for (var i = 0; i < diag.DiagramObjects.Count; i++) {
        var c = diag.DiagramObjects.GetAt(i);
        if (c.ElementID == el.ElementID) { o = c; break; }
    }
    if (o == null) {
        try {
            o = diag.DiagramObjects.AddNew(
                "l=" + izq + ";r=" + (izq + ancho) + ";t=" + arr + ";b=" + (arr + alto) + ";", "");
        } catch (e) { return null; }
        o.ElementID = el.ElementID;
    }
    try { o.ManuallySized = true; } catch (ignore) { }
    try { o.Left = izq; } catch (ignore) { }
    try { o.Top = arr; } catch (ignore) { }
    try { o.Right = izq + ancho; } catch (ignore) { }
    try { o.Bottom = arr + alto; } catch (ignore) { }
    try { o.FontSize = 8; } catch (ignore) { }
    o.Update();
    return o;
}

function relacion(a, b, etiqueta, tipo, est, rolA, rolB, cA, cB)
{
    if (a == null || b == null) return;
    var con = null;
    for (var i = 0; i < a.Connectors.Count; i++) {
        var c = a.Connectors.GetAt(i);
        if (c.SupplierID == b.ElementID) { con = c; break; }
    }
    if (con == null) {
        try { con = a.Connectors.AddNew("", tipo); }
        catch (e) { con = a.Connectors.AddNew("", "Association"); }
        con.ClientID = a.ElementID;
        con.SupplierID = b.ElementID;
        con.Update();
    }
    try { con.Name = etiqueta; } catch (ignore) { }
    try { con.Stereotype = est || ""; } catch (ignore) { }
    try { con.SourceRole = rolA; } catch (ignore) { }
    try { con.DestinationRole = rolB; } catch (ignore) { }
    try { con.SourceCardinality = cA; } catch (ignore) { }
    try { con.DestinationCardinality = cB; } catch (ignore) { }
    try { con.FontSize = 7; } catch (ignore) { }
    try { con.Update(); } catch (ignore) { }
    LOG.push(etiqueta + " : " + (a.Name) + " -> " + (b.Name));
}

// ------------------------------------------------------------------
// PROGRAMA
// ------------------------------------------------------------------

function main()
{
    var cu = buscarPaquete(RAIZ, "Casos de Uso");
    if (cu == null) cu = RAIZ;
    var mod = subPaquete(cu, "1. Seguridad y Autenticación");
    var paq = subPaquete(mod, "CU01 - Análisis de clases");

    // 1. Diagrama limpio.
    for (var d = paq.Diagrams.Count - 1; d >= 0; d--) {
        try { paq.Diagrams.GetAt(d).Delete(); } catch (ignore) { }
    }
    try { paq.Diagrams.Refresh(); } catch (ignore) { }

    // 2. Las 15 clases con sus atributos y operaciones.
    var clases = [];
    var totalAtr = 0;
    var totalOpe = 0;

    for (var n = 0; n < DEF.length; n++) {
        var def = DEF[n];
        var nombre = def[0];
        var c = buscarLocal(paq, nombre, "Class");

        if (c == null) {
            try { c = paq.Elements.AddNew(nombre, "Class"); }
            catch (e) { c = paq.Elements.AddNew(nombre, "Object"); }
        }

        try { c.Stereotype = def[1]; } catch (ignore) { }
        try { c.Alias = def[2]; } catch (ignore) { }
        nota(c, "Origen: " + def[3] + ".");
        try { c.Update(); } catch (ignore) { }

        var i;
        for (i = 0; i < def[4].length; i++) {
            ponerAtributo(c, def[4][i][0], def[4][i][1], def[4][i][2]);
        }
        for (i = 0; i < def[5].length; i++) {
            ponerOperacion(c, def[5][i][0], def[5][i][1], def[5][i][2], def[5][i][3]);
        }

        try { c.Update(); } catch (ignore) { }

        var na = contarAtributos(c);
        var no = contarOperaciones(c);
        if (na >= 0) totalAtr += na;
        if (no >= 0) totalOpe += no;
        LOG.push(nombre + " : " + na + " atributos, " + no + " operaciones");

        clases[n] = c;
    }

    // 3. Los 4 actores.
    var actores = [];
    for (var a = 0; a < ACTORES.length; a++) {
        var nom = ACTORES[a][0];
        var act = buscarLocal(paq, nom, "Actor");
        if (act == null) {
            act = buscarLocal(paq, nom, "Class");
            if (act != null) {
                try { act.Stereotype = "Actor"; act.Update(); } catch (ignore) { }
            } else {
                try { act = paq.Elements.AddNew(nom, "Actor"); }
                catch (e3) {
                    act = paq.Elements.AddNew(nom, "Class");
                    try { act.Stereotype = "Actor"; } catch (ignore) { }
                }
            }
        }
        try { act.Alias = "ACTOR_" + nom; } catch (ignore) { }
        nota(act, "Actor externo. Destino tras iniciar sesion: " + ACTORES[a][1] + ".");
        try { act.Update(); } catch (ignore) { }
        actores[a] = act;
    }

    // 4. Diagrama.
    var diag = null;
    try { diag = paq.Diagrams.AddNew("CU01 - Análisis de Clases", "Class"); }
    catch (e) {
        try { diag = paq.Diagrams.AddNew("CU01 - Análisis de Clases", "ClassDiagram"); }
        catch (e2) { diag = null; }
    }
    if (diag == null) { ERRORES.push("no se pudo crear el diagrama"); return; }
    diag.Update();
    try { paq.Diagrams.Refresh(); } catch (ignore) { }

    // 5. Relaciones (17).
    for (var r = 0; r < actores.length; r++) {
        relacion(actores[r], clases[0], "usuario", "Association", "", "actor", "pantalla", "1", "0..1");
    }
    relacion(clases[0], clases[1], "sesión de usuario", "Association", "", "pantalla", "sesión", "1", "1");
    relacion(clases[1], clases[2], "cliente HTTP", "Dependency", "uses", "consumidor", "cliente", "1", "1");
    relacion(clases[2], clases[3], "punto de acceso HTTP", "Dependency", "uses", "consumidor", "endpoint", "1", "0..1");
    relacion(clases[3], clases[4], "datos de entrada", "Association", "", "controlador", "entrada", "1", "1");
    relacion(clases[3], clases[5], "servicio de autenticación", "Association", "", "controlador", "servicio", "1", "1");
    relacion(clases[3], clases[10], "datos de salida", "Association", "", "controlador", "salida", "1", "1");
    relacion(clases[5], clases[7], "verificación de contraseña", "Dependency", "uses", "autenticador", "bcrypt", "1", "1");
    relacion(clases[5], clases[6], "emisión de tokens", "Association", "", "autenticador", "emisor", "1", "1");
    relacion(clases[5], clases[9], "auditoría de accesos", "Association", "", "autenticador", "auditor", "1", "1");
    relacion(clases[5], clases[8], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
    relacion(clases[5], clases[11], "cuenta autenticada", "Aggregation", "aggregation", "autenticador", "usuario", "1", "0..1");
    relacion(clases[10], clases[11], "datos de sesión", "Dependency", "uses", "respuesta", "usuario", "1", "1");
    relacion(clases[11], clases[12], "roles asignados", "Composition", "composition", "usuario", "asignación", "1", "0..*");
    relacion(clases[12], clases[13], "rol asignado", "Association", "", "asignación", "rol", "1", "1");
    relacion(clases[9], clases[14], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
    relacion(clases[14], clases[11], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");

    // 6. Posicionamiento: actores arriba, clases en 4 filas de 4.
    var COLX = [40, 340, 640, 940];
    for (var p = 0; p < actores.length; p++) {
        colocar(diag, actores[p], COLX[p], 30, 200, 110);
    }
    for (var k = 0; k < clases.length; k++) {
        var col = k % 4;
        var fila = 1 + Math.floor(k / 4);
        colocar(diag, clases[k], COLX[col], 30 + fila * 260, 250, 220);
    }

    // 7. Notas del diagrama.
    try {
        diag.Notes =
            "Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso. " +
            "Los mensajes y las excepciones de CU01 estan en el diagrama de comunicacion. " + SALTO + SALTO +
            "Composicion: 4 actores externos y 15 clases (3 Boundary, 1 Control, 5 Service, 2 Entity-DTO, 4 Entity) " +
            "con 45 atributos y 27 operaciones, y 17 relaciones estaticas. " + SALTO + SALTO +
            "GENERADO POR SCRIPT. Para crear atributos y operaciones hay que llamar SetVisibility y Update " +
            "sobre cada uno, y el script no debe terminar con una excepcion porque EA revierte los hijos. " + SALTO + SALTO +
            "DISCREPANCIAS CON EL CASO DE USO: el caso describe Angular, FastAPI y Flutter; la implementacion " +
            "real es React/Vite con NestJS. El cuerpo real es { credencial, password } y no { email, password }; " +
            "buscarPorCredencial acepta LOWER(email) o ci. No existe AuthGuard. No existen las rutas /inicio, " +
            "/sucursal ni /caja: Login.tsx navega a destino, o a /admin para Administrador, Encargado de Sucursal " +
            "y Cajero, y a / para clientes. El access_token dura 15 minutos (JWT_ACCESS_TOKEN_MINUTES) y el refresh " +
            "7 dias (JWT_REFRESH_TOKEN_DAYS), no 8 horas. El payload es { sub, rol, permisos, type, jti, iat, exp } " +
            "y no incluye email. AuthProvider escribe en localStorage y AuthController ademas fija cookies httpOnly " +
            "access_token y refresh_token con sameSite lax; no hay cookie session_tt ni sessionStorage ni cliente " +
            "Flutter. La respuesta usa la clave usuario sin avatar. No hay columna usuarios.rol: el rol se obtiene " +
            "por usuarios_roles. Una cuenta bloqueada devuelve 423 Locked sin countdown, y el trigger " +
            "fn_incrementar_intentos de schema.sql ademas pone estado = 'Bloqueado', lo que hace que el usuario " +
            "bloqueado reciba 401 en lugar de 423. La bitacora escribe la columna detalle y no new_data con " +
            "{ resultado: 'Exitoso' }.";
        diag.Update();
    } catch (ignore) { }

    // 8. Informe en las notas del paquete.
    var informe = [];
    informe.push("CU01 - ANALISIS DE CLASES - INFORME DE GENERACION");
    informe.push("");
    informe.push("Clases: 15   Actores: 4   Relaciones: 17");
    informe.push("Atributos generados: " + totalAtr + " de 45");
    informe.push("Operaciones generadas: " + totalOpe + " de 27");
    informe.push("");
    for (var l = 0; l < LOG.length; l++) informe.push(LOG[l]);
    informe.push("");
    if (ERRORES.length == 0) {
        informe.push("Sin errores.");
    } else {
        informe.push("ERRORES (" + ERRORES.length + "):");
        for (var e2 = 0; e2 < ERRORES.length; e2++) informe.push("  - " + ERRORES[e2]);
    }
    try { paq.Notes = informe.join(SALTO); paq.Update(); } catch (ignore) { }

    // 9. Update final de todo.
    for (var n2 = 0; n2 < clases.length; n2++) {
        try { clases[n2].Update(); } catch (ignore) { }
    }
    for (var a2 = 0; a2 < actores.length; a2++) {
        try { actores[a2].Update(); } catch (ignore) { }
    }
    try { diag.Update(); } catch (ignore) { }
    try { paq.Elements.Refresh(); } catch (ignore) { }
    try { paq.Diagrams.Refresh(); } catch (ignore) { }

    // 10. Resumen con ShowMessage, que no es una excepcion.
    if (!SIN_MENSAJES) {
        var txt =
            "CU01 - Analisis de clases generado." + SALTO + SALTO +
            "Clases: 15    Actores: 4    Relaciones: 17" + SALTO +
            "Atributos: " + totalAtr + " de 45" + SALTO +
            "Operaciones: " + totalOpe + " de 27" + SALTO +
            "Errores: " + ERRORES.length + SALTO + SALTO;
        for (var e3 = 0; e3 < ERRORES.length && e3 < 12; e3++) {
            txt = txt + ERRORES[e3] + SALTO;
        }
        try { Repository.ShowMessage(txt, "CU01 - Análisis de Clases", 0); } catch (ignore) { }
    }
}

main();
