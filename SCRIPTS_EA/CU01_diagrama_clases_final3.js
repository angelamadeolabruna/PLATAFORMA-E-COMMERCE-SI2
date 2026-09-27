// ================================================================
// CU01 - INICIAR SESION EN PLATAFORMA
// DIAGRAMA DE ANALISIS DE CLASES
//
// Dos mecanismos de dibujo, para que ninguna caja quede vacia:
//
//   1. ATRIBUTOS REALES.  Se intentan siempre. Solo funcionan en
//      algunas clases de esta instalacion de EA: hasta ahora solo
//      AuthService y JwtTokenService, que son las dos unicas cuyo
//      nombre termina en "Service".
//   2. COMPARTIMENTO DE TEXTO. Para cada clase que al empezar el
//      script siga sin atributos reales, se coloca debajo de la caja
//      un elemento Text con el contenido UML (- atributo : Tipo y
//      + operacion() : Tipo), sin borde para que se lea como el
//      compartimento de la clase.
//
// Los nombres llevan el rol: IU_ (interfaz de usuario), CTR_
// (controlador), SRV_ (servicio) y CE_ (entidad). Las clases que ya
// tenian atributos se RENOMBRAN, de modo que no se pierden.
//
// El script NO termina con excepcion: si lo hiciera, EA revierte
// los hijos. El resumen sale con Repository.ShowMessage.
//
// Autorreparable: lee el estado real al arrancar y solo anade lo que
// falta. Se puede ejecutar varias veces sin duplicar nada.
// ================================================================

var SIN_MENSAJES = false;
var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);
var VIS_PUB = 0;
var VIS_PRI = 1;

var TEXTO_SIN_BORDE = true;
var ALTO = 14;

// [ nombreNuevo, nombreViejo, estereotipo, origen, atributos, operaciones ]
var DEF = [
    ["IU_Login", "Login", "Boundary", "pages/Login.tsx",
     [["credencial", "String", VIS_PRI], ["password", "String", VIS_PRI],
      ["verPassword", "Boolean", VIS_PRI], ["error", "String", VIS_PRI],
      ["enviando", "Boolean", VIS_PRI]],
     [["onSubmit", "void", ["e: FormEvent"], VIS_PRI],
      ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_AuthProvider", "AuthProvider", "Boundary", "contexts/AuthContext.tsx",
     [["usuario", "UsuarioSesion", VIS_PRI], ["token", "String", VIS_PRI],
      ["cargando", "Boolean", VIS_PRI]],
     [["login", "UsuarioSesion", ["credencial", "password"], VIS_PUB],
      ["logout", "void", [], VIS_PUB],
      ["setUsuario", "void", ["nuevo"], VIS_PRI]]],

    ["IU_Api", "api", "Boundary", "lib/api.ts",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["login", "LoginResponse", ["credencial", "password"], VIS_PUB],
      ["logout", "void", [], VIS_PUB],
      ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_AuthController", "AuthController", "Control", "CTR_Auth.ts",
     [["cookieSecure", "Boolean", VIS_PRI]],
     [["login", "AuthResponse", ["body", "request", "response"], VIS_PUB],
      ["refresh", "AuthResponse", ["body", "request", "response"], VIS_PUB],
      ["logout", "void", ["request", "response", "currentUser"], VIS_PUB]]],

    ["CE_LoginRequest", "LoginRequest", "Entity", "Esquemas.ts",
     [["credencial", "String", VIS_PUB], ["password", "String", VIS_PUB]],
     []],

    ["SRV_AuthService", "AuthService", "Service", "SRV_AuthService.ts",
     [["dataSource", "DataSource", VIS_PRI], ["jwtTokenService", "JwtTokenService", VIS_PRI],
      ["bitacoraService", "BitacoraService", VIS_PRI], ["seguridadService", "SeguridadService", VIS_PRI]],
     [["autenticar", "AuthResponse", ["credencial", "password", "request"], VIS_PUB],
      ["buscarPorCredencial", "Usuario", ["credencial"], VIS_PRI],
      ["refrescar", "AuthResponse", ["request", "refresco"], VIS_PUB],
      ["cerrarSesion", "void", ["usuario", "token", "refreshToken"], VIS_PUB]]],

    ["SRV_JwtTokenService", "JwtTokenService", "Service", "SRV_JWTService.ts",
     [["accessMinutos", "Number = 15", VIS_PRI], ["refreshDias", "Number = 7", VIS_PRI],
      ["algoritmo", "String = HS256", VIS_PRI]],
     [["generarPar", "Par", ["subject", "rol", "permisos"], VIS_PUB],
      ["crearAccessToken", "String", ["subject", "rol", "permisos"], VIS_PUB],
      ["crearRefreshToken", "String", ["subject"], VIS_PUB],
      ["verificarRefreshToken", "TokenPayload", ["token"], VIS_PUB],
      ["estaEnBlacklist", "Boolean", ["jti"], VIS_PUB]]],

    ["SRV_SeguridadService", "SeguridadService", "Service", "SRV_SeguridadService.ts",
     [],
     [["validarPassword", "Boolean", ["usuario", "password"], VIS_PUB],
      ["hashearPassword", "String", ["password"], VIS_PUB]]],

    ["SRV_DataSource", "DataSource", "Service", "TypeORM",
     [],
     [["getRepository", "Repository", ["entidad"], VIS_PUB],
      ["query", "Array", ["sql", "params"], VIS_PUB]]],

    ["SRV_BitacoraService", "BitacoraService", "Service", "SRV_BitacoraService.ts",
     [],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle"], VIS_PUB]]],

    ["CE_AuthResponse", "AuthResponse", "Entity", "Esquemas.ts",
     [["access_token", "String", VIS_PUB], ["refresh_token", "String", VIS_PUB],
      ["token_type", "String = bearer", VIS_PUB], ["usuario", "UsuarioSesion", VIS_PUB]],
     []],

    ["CE_Usuario", "Usuario", "Entity", "tabla usuarios",
     [["id_usuario", "Integer", VIS_PRI], ["email", "String", VIS_PRI],
      ["password_hash", "String", VIS_PRI], ["estado", "String = Pendiente", VIS_PUB],
      ["intentos_fallidos", "Integer = 0", VIS_PUB],
      ["bloqueado_hasta", "Timestamp", VIS_PUB], ["fecha_ultimo_acceso", "Timestamp", VIS_PUB]],
     [["get rol", "Rol", [], VIS_PUB], ["get nombre", "String", [], VIS_PUB]]],

    ["CE_UsuarioRol", "UsuarioRol", "Entity", "tabla usuarios_roles",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_Rol", "Rol", "Entity", "tabla roles",
     [["id_rol", "Integer", VIS_PRI], ["nombre_rol", "String", VIS_PUB],
      ["permisos_json", "JSONB", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_BitacoraAuditoria", "BitacoraAuditoria", "Entity", "tabla bitacora_auditoria",
     [["id_bitacora", "Integer", VIS_PRI], ["id_usuario", "Integer", VIS_PRI],
      ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB],
      ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB],
      ["ip_address", "INET", VIS_PUB], ["user_agent", "String", VIS_PUB],
      ["fecha_hora", "Timestamp", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Administrador", "Administrador", "/admin"],
    ["ACTOR_EncargadoSucursal", "Encargado de Sucursal", "/admin"],
    ["ACTOR_Cajero", "Cajero", "/admin"],
    ["ACTOR_Cliente", "Cliente", "/"]
];

// ------------------------------------------------------------------
// UTILIDADES
// ------------------------------------------------------------------

var ERRORES = [];
var INFORME = [];

function pad(s, n) { var t = String(s); while (t.length < n) t = t + " "; return t; }

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

function nombresDe(coleccion)
{
    var s = "";
    if (coleccion == null) return s;
    try {
        for (var i = 0; i < coleccion.Count; i++) s = s + "|" + String(coleccion.GetAt(i).Name);
    } catch (e) { }
    return s;
}

function contiene(lista, nombre) { return lista.indexOf("|" + nombre) >= 0; }

function totalDe(lista) { return (lista == "") ? 0 : lista.split("|").length - 1; }

// ------------------------------------------------------------------
// TEXTO DEL COMPARTIMENTO
// ------------------------------------------------------------------

function lineasCompartimento(def)
{
    var l = [];
    var i;
    for (i = 0; i < def[4].length; i++) l.push("- " + def[4][i][0] + " : " + def[4][i][1]);
    if (def[4].length > 0 && def[5].length > 0) l.push("");
    for (i = 0; i < def[5].length; i++) {
        var p = def[5][i][2];
        l.push("+ " + def[5][i][0] + "(" + ((p && p.length > 0) ? p.join(", ") : "") + ") : " + def[5][i][1]);
    }
    if (l.length == 0) l.push("(sin atributos ni operaciones)");
    return l;
}

// ------------------------------------------------------------------
// ATRIBUTOS Y OPERACIONES REALES
// ------------------------------------------------------------------

function agregarAtributo(el, nombre, tipo, vis)
{
    var a = null;
    try { a = el.Attributes.AddNew(nombre, tipo); } catch (e) { a = null; }
    if (a == null) return false;
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

// ------------------------------------------------------------------
// DIAGRAMA
// ------------------------------------------------------------------

function objetoEn(diag, el)
{
    for (var i = 0; i < diag.DiagramObjects.Count; i++) {
        var c = diag.DiagramObjects.GetAt(i);
        if (c.ElementID == el.ElementID) return c;
    }
    return null;
}

function colocar(diag, el, izq, arr, ancho, alto)
{
    var o = objetoEn(diag, el);
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

function compartimento(diag, paq, nombre, lineas, izq, arr, ancho)
{
    var alto = lineas.length * ALTO + 8;
    var el = buscarLocal(paq, nombre, "");
    if (el == null) {
        try { el = paq.Elements.AddNew(nombre, "Text"); } catch (e) { el = null; }
        if (el == null) {
            try { el = paq.Elements.AddNew(nombre, "Class"); } catch (e2) { return; }
            try { el.Stereotype = "note"; } catch (e3) { }
        }
    }
    var puesto = false;
    try { el.Text = lineas.join(SALTO); puesto = true; } catch (e4) { }
    if (!puesto) { try { el.Notes = lineas.join(SALTO); puesto = true; } catch (e5) { } }
    try { el.Update(); } catch (e6) { }

    var o = colocar(diag, el, izq, arr, ancho, alto);
    if (o == null) return;
    if (TEXTO_SIN_BORDE) {
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
    }
    try { o.FontSize = 7; } catch (e) { }
    try { o.WrapText = true; } catch (e) { }
    try { o.ShowNotes = true; } catch (e) { }
    try { o.Update(); } catch (e) { }
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

    // 0. Diagrama limpio desde el principio, para no arrastrar cajas viejas.
    for (var d = paq.Diagrams.Count - 1; d >= 0; d--) {
        try { paq.Diagrams.GetAt(d).Delete(); } catch (ignore) { }
    }
    try { paq.Diagrams.Refresh(); } catch (ignore) { }

    // 1. Las 15 clases. Si ya existe con el nombre viejo, se renombra
    //    para conservar los atributos que ya tuviera.
    var clases = [];
    for (var n = 0; n < DEF.length; n++) {
        var def = DEF[n];
        var nuevo = def[0];
        var viejo = def[1];
        var c = buscarLocal(paq, nuevo, "Class");
        if (c == null) {
            c = buscarLocal(paq, viejo, "Class");
            if (c != null) { try { c.Name = nuevo; c.Update(); } catch (ignore) { } }
        }
        if (c == null) {
            try { c = paq.Elements.AddNew(nuevo, "Class"); }
            catch (e) { c = paq.Elements.AddNew(nuevo, "Object"); }
            c.Update();
        }
        try { c.Stereotype = def[2]; } catch (ignore) { }
        try { c.Alias = ""; } catch (ignore) { }
        nota(c, "Origen: " + def[3] + ".");
        try { c.Update(); } catch (ignore) { }
        clases[n] = c;
    }

    // 2. Los 4 actores.
    var actores = [];
    for (var a = 0; a < ACTORES.length; a++) {
        var nom = ACTORES[a][1];
        var act = buscarLocal(paq, ACTORES[a][0], "Actor");
        if (act == null) {
            act = buscarLocal(paq, nom, "Actor");
            if (act == null) {
                act = buscarLocal(paq, ACTORES[a][0], "Class");
                if (act == null) {
                    try { act = paq.Elements.AddNew(ACTORES[a][0], "Actor"); }
                    catch (e) { act = paq.Elements.AddNew(ACTORES[a][0], "Class"); }
                }
            }
            try { act.Name = ACTORES[a][0]; } catch (e2) { }
        }
        try { act.Stereotype = ""; } catch (ignore) { }
        nota(act, "Actor externo. Destino tras iniciar sesion: " + ACTORES[a][2] + ".");
        try { act.Update(); } catch (ignore) { }
        actores[a] = act;
    }

    try { paq.Elements.Refresh(); } catch (ignore) { }

    // 3. Una pasada: leer el estado real y anadir lo que falte.
    var conTexto = [];
    var conReal = [];
    var usaTexto = [];          // una bandera por clase: true = lleva texto
    var totalAtr = 0;
    var totalOpe = 0;

    for (var n2 = 0; n2 < DEF.length; n2++) {
        var d2 = DEF[n2];
        try { paq.Elements.Refresh(); } catch (ignore) { }
        var el = buscarLocal(paq, d2[0], "Class");
        if (el == null) { ERRORES.push("clase " + d2[0] + " no encontrada"); continue; }

        var antes = "";
        try { antes = nombresDe(el.Attributes); } catch (e) { antes = ""; }
        var antesOpe = "";
        try { antesOpe = nombresDe(el.Methods); } catch (e) { antesOpe = ""; }

        var k;
        for (k = 0; k < d2[4].length; k++) {
            if (contiene(antes, d2[4][k][0])) continue;
            agregarAtributo(el, d2[4][k][0], d2[4][k][1], d2[4][k][2]);
        }
        for (k = 0; k < d2[5].length; k++) {
            if (contiene(antesOpe, d2[5][k][0])) continue;
            agregarOperacion(el, d2[5][k][0], d2[5][k][1], d2[5][k][2], d2[5][k][3]);
        }
        try { el.Update(); } catch (ignore) { }

        var fin = "";
        try { fin = nombresDe(el.Attributes); } catch (e) { fin = ""; }
        var finOpe = "";
        try { finOpe = nombresDe(el.Methods); } catch (e) { finOpe = ""; }

        totalAtr += totalDe(fin);
        totalOpe += totalDe(finOpe);

        var pideA = d2[4].length;
        var pideO = d2[5].length;
        var tieneA = totalDe(fin);
        var tieneO = totalDe(finOpe);
        var completo = (tieneA >= pideA && tieneO >= pideO);

        if (completo) { conReal.push(d2[0]); } else { conTexto.push(d2[0]); }
        usaTexto[n2] = !completo;

        INFORME.push(pad(d2[0], 22) + " atr " + totalDe(antes) + "->" + tieneA + "/" + pideA +
                     "   ope " + totalDe(antesOpe) + "->" + tieneO + "/" + pideO +
                     (completo ? "   REAL" : "   TEXTO"));
    }

    // 4. Diagrama.
    var diag = null;
    try { diag = paq.Diagrams.AddNew("CU01 - Análisis de Clases", "Class"); }
    catch (e) {
        try { diag = paq.Diagrams.AddNew("CU01 - Análisis de Clases", "ClassDiagram"); }
        catch (e2) { diag = null; }
    }
    if (diag == null) { ERRORES.push("no se pudo crear el diagrama"); }

    if (diag != null) {
        diag.Update();
        try { paq.Diagrams.Refresh(); } catch (ignore) { }

        var COLX = [30, 300, 570, 840];
        var ANCHO = 240;

        for (var p = 0; p < actores.length; p++) {
            colocar(diag, actores[p], COLX[p], 25, 190, 100);
        }

        for (var k2 = 0; k2 < DEF.length; k2++) {
            var col = k2 % 4;
            var fila = 1 + Math.floor(k2 / 4);
            var x = COLX[col];
            var y = 25 + fila * 300;

            var conCajaReal = !usaTexto[k2];
            var lineas = lineasCompartimento(DEF[k2]);

            if (conCajaReal) {
                // La clase tiene compartimentos reales: caja normal.
                colocar(diag, clases[k2], x, y, ANCHO, lineas.length * ALTO + 34);
            } else {
                // Cabecera de la clase pegada al compartimento de texto.
                colocar(diag, clases[k2], x, y, ANCHO, 24);
                compartimento(diag, paq, "TXT " + DEF[k2][0], lineas, x, y + 24, ANCHO);
            }
        }

        var C = clases;
        for (var r = 0; r < actores.length; r++) {
            relacion(actores[r], C[0], "usuario", "Association", "", "actor", "pantalla", "1", "0..1");
        }
        relacion(C[0], C[1], "sesión de usuario", "Association", "", "pantalla", "sesión", "1", "1");
        relacion(C[1], C[2], "cliente HTTP", "Dependency", "uses", "consumidor", "cliente", "1", "1");
        relacion(C[2], C[3], "punto de acceso HTTP", "Dependency", "uses", "consumidor", "endpoint", "1", "0..1");
        relacion(C[3], C[4], "datos de entrada", "Association", "", "controlador", "entrada", "1", "1");
        relacion(C[3], C[5], "servicio de autenticación", "Association", "", "controlador", "servicio", "1", "1");
        relacion(C[3], C[10], "datos de salida", "Association", "", "controlador", "salida", "1", "1");
        relacion(C[5], C[7], "verificación de contraseña", "Dependency", "uses", "autenticador", "bcrypt", "1", "1");
        relacion(C[5], C[6], "emisión de tokens", "Association", "", "autenticador", "emisor", "1", "1");
        relacion(C[5], C[9], "auditoría de accesos", "Association", "", "autenticador", "auditor", "1", "1");
        relacion(C[5], C[8], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        relacion(C[5], C[11], "cuenta autenticada", "Aggregation", "aggregation", "autenticador", "usuario", "1", "0..1");
        relacion(C[10], C[11], "datos de sesión", "Dependency", "uses", "respuesta", "usuario", "1", "1");
        relacion(C[11], C[12], "roles asignados", "Composition", "composition", "usuario", "asignación", "1", "0..*");
        relacion(C[12], C[13], "rol asignado", "Association", "", "asignación", "rol", "1", "1");
        relacion(C[9], C[14], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        relacion(C[14], C[11], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");

        try {
            diag.Notes =
                "Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso. " +
                "Los mensajes y las excepciones de CU01 estan en el diagrama de comunicacion. " + SALTO + SALTO +
                "4 actores externos, 15 clases (3 Boundary, 1 Control, 5 Service, 2 Entity-DTO, 4 Entity) " +
                "y 17 relaciones estaticas. Prefijos: IU_ interfaz de usuario, CTR_ controlador, " +
                "SRV_ servicio, CE_ entidad. " + SALTO + SALTO +
                "NOTA TECNICA: en esta instalacion de EA la API de atributos solo materializa algunas " +
                "clases. Por eso las clases que siguen sin compartimentos reales llevan debajo un elemento " +
                "Text con el mismo contenido en notacion UML. " + SALTO + SALTO +
                "DISCREPANCIAS CON EL CASO DE USO: el caso describe Angular, FastAPI y Flutter; la implementacion " +
                "real es React/Vite con NestJS. El cuerpo real es { credencial, password } y no { email, password }; " +
                "buscarPorCredencial acepta LOWER(email) o ci. No existe AuthGuard. No existen las rutas /inicio, " +
                "/sucursal ni /caja: IU_Login navega a destino, o a /admin para Administrador, Encargado de Sucursal " +
                "y Cajero, y a / para clientes. El access_token dura 15 minutos (JWT_ACCESS_TOKEN_MINUTES) y el refresh " +
                "7 dias (JWT_REFRESH_TOKEN_DAYS), no 8 horas. El payload es { sub, rol, permisos, type, jti, iat, exp } " +
                "y no incluye email. IU_AuthProvider escribe en localStorage y CTR_AuthController ademas fija cookies " +
                "httpOnly access_token y refresh_token con sameSite lax; no hay cookie session_tt ni sessionStorage ni " +
                "cliente Flutter. La respuesta usa la clave usuario sin avatar. No hay columna usuarios.rol: el rol se " +
                "obtiene por usuarios_roles. Una cuenta bloqueada devuelve 423 Locked sin countdown, y el trigger " +
                "fn_incrementar_intentos de schema.sql ademas pone estado = 'Bloqueado', lo que hace que el usuario " +
                "bloqueado reciba 401 en lugar de 423. La bitacora escribe la columna detalle y no new_data con " +
                "{ resultado: 'Exitoso' }.";
            diag.Update();
        } catch (ignore) { }
    }

    // 5. Informe.
    var txt = [];
    txt.push("CU01 - ANALISIS DE CLASES - INFORME");
    txt.push("");
    txt.push("Atributos reales: " + totalAtr + " de 45");
    txt.push("Operaciones reales: " + totalOpe + " de 27");
    txt.push("Clases con compartimentos reales: " + conReal.length + " -> " + conReal.join(", "));
    txt.push("Clases con compartimento de texto: " + conTexto.length);
    txt.push("");
    for (var l = 0; l < INFORME.length; l++) txt.push(INFORME[l]);
    txt.push("");
    if (ERRORES.length == 0) txt.push("Sin errores.");
    else {
        txt.push("ERRORES (" + ERRORES.length + "):");
        for (var e2 = 0; e2 < ERRORES.length; e2++) txt.push("  - " + ERRORES[e2]);
    }
    try { paq.Notes = txt.join(SALTO); paq.Update(); } catch (ignore) { }
    try { paq.Elements.Refresh(); } catch (ignore) { }
    try { paq.Diagrams.Refresh(); } catch (ignore) { }

    if (!SIN_MENSAJES) {
        var msg =
            "CU01 - Analisis de clases" + SALTO + SALTO +
            "Atributos reales: " + totalAtr + " de 45" + SALTO +
            "Operaciones reales: " + totalOpe + " de 27" + SALTO +
            "Con caja real: " + conReal.length + " de 15" + SALTO +
            "Con texto: " + conTexto.length + " de 15" + SALTO +
            "Errores: " + ERRORES.length;
        try { Repository.ShowMessage(msg, "CU01 - Análisis de Clases", 0); } catch (ignore) { }
    }
}

// El script se ejecuta dentro de un try para que NINGUNA excepcion
// escape: si escapa, EA revierte los atributos y las operaciones que
// se hayan creado en esta ejecucion.
var FALLO = "";

try {
    main();
} catch (e) {
    FALLO = (e && e.message) ? e.message : String(e);
    try {
        var raiz2 = Repository.Models.GetAt(0);
        var p2 = buscarPaquete(raiz2, "CU01 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + FALLO;
            p2.Update();
        }
    } catch (ignore) { }
}

if (FALLO != "") {
    if (!SIN_MENSAJES) {
        try { Repository.ShowMessage("Ocurrio un error:" + SALTO + SALTO + FALLO, "CU01", 0); } catch (ignore) { }
    }
}
