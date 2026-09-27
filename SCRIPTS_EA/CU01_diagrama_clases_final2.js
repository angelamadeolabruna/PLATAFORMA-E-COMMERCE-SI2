// ================================================================
// CU01 - INICIAR SESION EN PLATAFORMA
// DIAGRAMA DE ANALISIS DE CLASES - VERSION AUTOREPARADORA
//
// Problema observado: EA solo materializa los atributos de algunas
// clases por ejecucion (en la prueba anterior solo AuthService y
// JwtTokenService). No depende del numero de atributos ni del
// estereotipo, asi que parece un commit intermitente de EA.
//
// Solucion: el script LEE el estado real al arrancar, anade SOLO lo
// que falta y informa cuanto queda. Se ejecuta tantas veces como haga
// falta hasta que los totales lleguen a 45 y 27. Nunca duplica,
// porque lo ya existente se detecta por nombre antes de anadir.
//
// Dos aprendizajes de las pruebas que se aplican aqui:
//   1. El script NO debe terminar con throw ni excepcion.
//   2. Cada hijo necesita Update(). SetVisibility se pasa como 0 o 1
//      (numero), no como texto, que es como funciono en la prueba v9.
// ================================================================

var SIN_MENSAJES = false;
var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);
var VIS_PUB = 0;
var VIS_PRI = 1;

var ACTORES = [
    ["Administrador", "/admin"],
    ["Encargado de Sucursal", "/admin"],
    ["Cajero", "/admin"],
    ["Cliente", "/"]
];

var DEF = [
    ["Login", "Boundary", "IU_Login", "pages/Login.tsx",
     [["credencial", "String", VIS_PRI], ["password", "String", VIS_PRI],
      ["verPassword", "Boolean", VIS_PRI], ["error", "String", VIS_PRI],
      ["enviando", "Boolean", VIS_PRI]],
     [["onSubmit", "void", ["e: FormEvent"], VIS_PRI],
      ["render", "JSX.Element", [], VIS_PUB]]],

    ["AuthProvider", "Boundary", "IU_AuthProvider", "contexts/AuthContext.tsx",
     [["usuario", "UsuarioSesion", VIS_PRI], ["token", "String", VIS_PRI],
      ["cargando", "Boolean", VIS_PRI]],
     [["login", "UsuarioSesion", ["credencial", "password"], VIS_PUB],
      ["logout", "void", [], VIS_PUB],
      ["setUsuario", "void", ["nuevo"], VIS_PRI]]],

    ["api", "Boundary", "IU_Api", "lib/api.ts",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["login", "LoginResponse", ["credencial", "password"], VIS_PUB],
      ["logout", "void", [], VIS_PUB],
      ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["AuthController", "Control", "CTR_Auth", "CTR_Auth.ts",
     [["cookieSecure", "Boolean", VIS_PRI]],
     [["login", "AuthResponse", ["body", "request", "response"], VIS_PUB],
      ["refresh", "AuthResponse", ["body", "request", "response"], VIS_PUB],
      ["logout", "void", ["request", "response", "currentUser"], VIS_PUB]]],

    ["LoginRequest", "Entity", "CE_LoginRequest", "Esquemas.ts",
     [["credencial", "String", VIS_PUB], ["password", "String", VIS_PUB]],
     []],

    ["AuthService", "Service", "SRV_AuthService", "SRV_AuthService.ts",
     [["dataSource", "DataSource", VIS_PRI], ["jwtTokenService", "JwtTokenService", VIS_PRI],
      ["bitacoraService", "BitacoraService", VIS_PRI], ["seguridadService", "SeguridadService", VIS_PRI]],
     [["autenticar", "AuthResponse", ["credencial", "password", "request"], VIS_PUB],
      ["buscarPorCredencial", "Usuario", ["credencial"], VIS_PRI],
      ["refrescar", "AuthResponse", ["request", "refresco"], VIS_PUB],
      ["cerrarSesion", "void", ["usuario", "token", "refreshToken"], VIS_PUB]]],

    ["JwtTokenService", "Service", "SRV_JwtTokenService", "SRV_JWTService.ts",
     [["accessMinutos", "Number = 15", VIS_PRI], ["refreshDias", "Number = 7", VIS_PRI],
      ["algoritmo", "String = HS256", VIS_PRI]],
     [["generarPar", "Par", ["subject", "rol", "permisos"], VIS_PUB],
      ["crearAccessToken", "String", ["subject", "rol", "permisos"], VIS_PUB],
      ["crearRefreshToken", "String", ["subject"], VIS_PUB],
      ["verificarRefreshToken", "TokenPayload", ["token"], VIS_PUB],
      ["estaEnBlacklist", "Boolean", ["jti"], VIS_PUB]]],

    ["SeguridadService", "Service", "SRV_SeguridadService", "SRV_SeguridadService.ts",
     [],
     [["validarPassword", "Boolean", ["usuario", "password"], VIS_PUB],
      ["hashearPassword", "String", ["password"], VIS_PUB]]],

    ["DataSource", "Service", "SRV_DataSource", "TypeORM",
     [],
     [["getRepository", "Repository", ["entidad"], VIS_PUB],
      ["query", "Array", ["sql", "params"], VIS_PUB]]],

    ["BitacoraService", "Service", "SRV_BitacoraService", "SRV_BitacoraService.ts",
     [],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle"], VIS_PUB]]],

    ["AuthResponse", "Entity", "CE_AuthResponse", "Esquemas.ts",
     [["access_token", "String", VIS_PUB], ["refresh_token", "String", VIS_PUB],
      ["token_type", "String = bearer", VIS_PUB], ["usuario", "UsuarioSesion", VIS_PUB]],
     []],

    ["Usuario", "Entity", "CE_Usuario", "tabla usuarios",
     [["id_usuario", "Integer", VIS_PRI], ["email", "String", VIS_PRI],
      ["password_hash", "String", VIS_PRI], ["estado", "String = Pendiente", VIS_PUB],
      ["intentos_fallidos", "Integer = 0", VIS_PUB],
      ["bloqueado_hasta", "Timestamp", VIS_PUB], ["fecha_ultimo_acceso", "Timestamp", VIS_PUB]],
     [["get rol", "Rol", [], VIS_PUB], ["get nombre", "String", [], VIS_PUB]]],

    ["UsuarioRol", "Entity", "CE_UsuarioRol", "tabla usuarios_roles",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["Rol", "Entity", "CE_Rol", "tabla roles",
     [["id_rol", "Integer", VIS_PRI], ["nombre_rol", "String", VIS_PUB],
      ["permisos_json", "JSONB", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["BitacoraAuditoria", "Entity", "CE_BitacoraAuditoria", "tabla bitacora_auditoria",
     [["id_bitacora", "Integer", VIS_PRI], ["id_usuario", "Integer", VIS_PRI],
      ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB],
      ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB],
      ["ip_address", "INET", VIS_PUB], ["user_agent", "String", VIS_PUB],
      ["fecha_hora", "Timestamp", VIS_PUB]],
     []]
];

// ------------------------------------------------------------------
// UTILIDADES DE MODELO
// ------------------------------------------------------------------

var ERRORES = [];
var INFORME = [];

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

// ------------------------------------------------------------------
// LECTURA DEL ESTADO REAL
// ------------------------------------------------------------------

function nombresDe(coleccion)
{
    var s = "";
    if (coleccion == null) return s;
    try {
        for (var i = 0; i < coleccion.Count; i++) {
            s = s + "|" + String(coleccion.GetAt(i).Name);
        }
    } catch (e) { }
    return s;
}

function contiene(lista, nombre) { return lista.indexOf("|" + nombre) >= 0; }

// ------------------------------------------------------------------
// ALTA DE ATRIBUTOS Y OPERACIONES
// ------------------------------------------------------------------

function agregarAtributo(el, nombre, tipo, vis)
{
    var a = null;
    try { a = el.Attributes.AddNew(nombre, tipo); } catch (e) { a = null; }
    if (a == null) { ERRORES.push("atributo " + nombre + " no se pudo crear"); return false; }
    try { a.Name = nombre; } catch (e) { }
    try { a.Type = tipo; } catch (e) { }
    try { a.SetVisibility(vis); } catch (e) { }
    try { a.Update(); } catch (e) { }
    return true;
}

function agregarOperacion(el, nombre, retorno, parametros, vis)
{
    var firma = (parametros && parametros.length > 0) ? parametros.join(", ") : "";
    var m = null;
    try { m = el.Methods.AddNew(nombre, retorno, firma, ""); } catch (e) { m = null; }
    if (m == null) { ERRORES.push("operacion " + nombre + " no se pudo crear"); return false; }
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

    // 1. Estereotipo, alias y nota de las 15 clases.
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
    }

    // 2. Los 4 actores.
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

    try { paq.Elements.Refresh(); } catch (ignore) { }

    // 3. Una sola pasada: se lee el estado real y se anade lo que falta.
    //    Nunca se relee despues de anadir, para no crear duplicados si
    //    la lectura en caliente todavia no ve lo recien insertado.
    var totalAtr = 0;
    var totalOpe = 0;
    var faltanAtr = 0;
    var faltanOpe = 0;

    for (var n2 = 0; n2 < DEF.length; n2++) {
        var d2 = DEF[n2];
        var nom2 = d2[0];

        // releer la clase desde el paquete
        try { paq.Elements.Refresh(); } catch (ignore) { }
        var el = buscarLocal(paq, nom2, "Class");
        if (el == null) { ERRORES.push("clase " + nom2 + " no encontrada"); continue; }

        var antes = "";
        try { antes = nombresDe(el.Attributes); } catch (e) { antes = ""; }
        var antesOpe = "";
        try { antesOpe = nombresDe(el.Methods); } catch (e) { antesOpe = ""; }

        var naAntes = (antes == "") ? 0 : antes.split("|").length - 1;
        var noAntes = (antesOpe == "") ? 0 : antesOpe.split("|").length - 1;

        var k;
        for (k = 0; k < d2[4].length; k++) {
            var ad = d2[4][k];
            if (contiene(antes, ad[0])) continue;
            agregarAtributo(el, ad[0], ad[1], ad[2]);
        }
        for (k = 0; k < d2[5].length; k++) {
            var od = d2[5][k];
            if (contiene(antesOpe, od[0])) continue;
            agregarOperacion(el, od[0], od[1], od[2], od[3]);
        }
        try { el.Update(); } catch (ignore) { }

        var fin = "";
        try { fin = nombresDe(el.Attributes); } catch (e) { fin = ""; }
        var finOpe = "";
        try { finOpe = nombresDe(el.Methods); } catch (e) { finOpe = ""; }

        var naFin = (fin == "") ? 0 : fin.split("|").length - 1;
        var noFin = (finOpe == "") ? 0 : finOpe.split("|").length - 1;
        var pideA = d2[4].length;
        var pideO = d2[5].length;

        totalAtr += naFin;
        totalOpe += noFin;
        faltanAtr += pideA - naFin;
        faltanOpe += pideO - noFin;

        INFORME.push(pad(nom2, 20) + " atributos " + naAntes + " -> " + naFin + " de " + pideA +
                     "   operaciones " + noAntes + " -> " + noFin + " de " + pideO);
    }

    // 4. Diagrama limpio con todo lo anterior.
    for (var d = paq.Diagrams.Count - 1; d >= 0; d--) {
        try { paq.Diagrams.GetAt(d).Delete(); } catch (ignore) { }
    }
    try { paq.Diagrams.Refresh(); } catch (ignore) { }

    var diag = null;
    try { diag = paq.Diagrams.AddNew("CU01 - Análisis de Clases", "Class"); }
    catch (e) {
        try { diag = paq.Diagrams.AddNew("CU01 - Análisis de Clases", "ClassDiagram"); }
        catch (e2) { diag = null; }
    }
    if (diag != null) {
        diag.Update();
        try { paq.Diagrams.Refresh(); } catch (ignore) { }

        var cl = [];
        for (var n3 = 0; n3 < DEF.length; n3++) {
            cl[n3] = buscarLocal(paq, DEF[n3][0], "Class");
        }

        for (var r = 0; r < actores.length; r++) {
            relacion(actores[r], cl[0], "usuario", "Association", "", "actor", "pantalla", "1", "0..1");
        }
        relacion(cl[0], cl[1], "sesión de usuario", "Association", "", "pantalla", "sesión", "1", "1");
        relacion(cl[1], cl[2], "cliente HTTP", "Dependency", "uses", "consumidor", "cliente", "1", "1");
        relacion(cl[2], cl[3], "punto de acceso HTTP", "Dependency", "uses", "consumidor", "endpoint", "1", "0..1");
        relacion(cl[3], cl[4], "datos de entrada", "Association", "", "controlador", "entrada", "1", "1");
        relacion(cl[3], cl[5], "servicio de autenticación", "Association", "", "controlador", "servicio", "1", "1");
        relacion(cl[3], cl[10], "datos de salida", "Association", "", "controlador", "salida", "1", "1");
        relacion(cl[5], cl[7], "verificación de contraseña", "Dependency", "uses", "autenticador", "bcrypt", "1", "1");
        relacion(cl[5], cl[6], "emisión de tokens", "Association", "", "autenticador", "emisor", "1", "1");
        relacion(cl[5], cl[9], "auditoría de accesos", "Association", "", "autenticador", "auditor", "1", "1");
        relacion(cl[5], cl[8], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        relacion(cl[5], cl[11], "cuenta autenticada", "Aggregation", "aggregation", "autenticador", "usuario", "1", "0..1");
        relacion(cl[10], cl[11], "datos de sesión", "Dependency", "uses", "respuesta", "usuario", "1", "1");
        relacion(cl[11], cl[12], "roles asignados", "Composition", "composition", "usuario", "asignación", "1", "0..*");
        relacion(cl[12], cl[13], "rol asignado", "Association", "", "asignación", "rol", "1", "1");
        relacion(cl[9], cl[14], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        relacion(cl[14], cl[11], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");

        var COLX = [40, 340, 640, 940];
        for (var p = 0; p < actores.length; p++) colocar(diag, actores[p], COLX[p], 30, 200, 110);
        for (var k2 = 0; k2 < cl.length; k2++) {
            var col = k2 % 4;
            var fila = 1 + Math.floor(k2 / 4);
            colocar(diag, cl[k2], COLX[col], 30 + fila * 260, 250, 220);
        }

        try {
            diag.Notes =
                "Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso. " +
                "Los mensajes y las excepciones de CU01 estan en el diagrama de comunicacion. " + SALTO + SALTO +
                "4 actores externos, 15 clases (3 Boundary, 1 Control, 5 Service, 2 Entity-DTO, 4 Entity) " +
                "y 17 relaciones estaticas. " + SALTO + SALTO +
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
    } else {
        ERRORES.push("no se pudo crear el diagrama");
    }

    // 5. Informe.
    var txt = [];
    txt.push("CU01 - ANALISIS DE CLASES - INFORME");
    txt.push("");
    txt.push("Atributos presentes: " + totalAtr + " de 45   (faltan " + faltanAtr + ")");
    txt.push("Operaciones presentes: " + totalOpe + " de 27   (faltan " + faltanOpe + ")");
    txt.push("");
    for (var l = 0; l < INFORME.length; l++) txt.push(INFORME[l]);
    txt.push("");
    if (ERRORES.length == 0) {
        txt.push("Sin errores.");
        if (faltanAtr == 0 && faltanOpe == 0) txt.push("COMPLETO. No hace falta ejecutar otra vez.");
        else txt.push("Vuelve a ejecutar el script: EA solo materializa algunas clases por ejecucion.");
    } else {
        txt.push("ERRORES (" + ERRORES.length + "):");
        for (var e2 = 0; e2 < ERRORES.length; e2++) txt.push("  - " + ERRORES[e2]);
    }
    try { paq.Notes = txt.join(SALTO); paq.Update(); } catch (ignore) { }
    try { paq.Elements.Refresh(); } catch (ignore) { }
    try { paq.Diagrams.Refresh(); } catch (ignore) { }

    if (!SIN_MENSAJES) {
        var msg =
            "CU01 - Analisis de clases" + SALTO + SALTO +
            "Atributos: " + totalAtr + " de 45  (faltan " + faltanAtr + ")" + SALTO +
            "Operaciones: " + totalOpe + " de 27  (faltan " + faltanOpe + ")" + SALTO +
            "Errores: " + ERRORES.length + SALTO + SALTO;
        if (faltanAtr == 0 && faltanOpe == 0 && ERRORES.length == 0) {
            msg = msg + "COMPLETO.";
        } else {
            msg = msg + "Ejecuta de nuevo para completar lo que falta.";
        }
        try { Repository.ShowMessage(msg, "CU01 - Análisis de Clases", 0); } catch (ignore) { }
    }
}

function pad(s, n) { var t = String(s); while (t.length < n) t = t + " "; return t; }

main();
