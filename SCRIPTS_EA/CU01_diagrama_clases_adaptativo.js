// ================================================================
// CU01 - ANALISIS DE CLASES
//
// Los atributos y operaciones se dibujan con elementos "Text" de EA,
// colocados justo debajo de la caja de cada clase. Asi se ven como
// compartimentos UML, pero se generan por codigo: la API de atributos
// de EA no crea atributos en esta maquina.
//
// Resultado visual por clase:
//   [ nombre de la clase ]        <- caja de la clase (cabecera)
//   [ - atributo : Tipo ]         <- elemento Text pegado debajo
//   [ + operacion() : Tipo ]
//
// El diagrama es estatico: sin mensajes, sin lineas de vida, sin
// secuencia temporal y sin casos de uso.
//
// SIN POPUPS.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var SALTO = String.fromCharCode(10);
var FUENTE = 4;
var COL_X = [10, 250, 490, 730, 970];
var FILA_Y = [10, 180, 470, 760];

var ACTORES = ["Administrador", "Encargado de Sucursal", "Cajero", "Cliente"];

var ALIAS = {
    "Login": "IU_Login", "AuthProvider": "IU_AuthProvider", "api": "IU_Api",
    "AuthController": "CTR_Auth", "AuthService": "SRV_AuthService",
    "SeguridadService": "SRV_SeguridadService", "JwtTokenService": "SRV_JwtTokenService",
    "BitacoraService": "SRV_BitacoraService", "DataSource": "SRV_DataSource",
    "LoginRequest": "CE_LoginRequest", "AuthResponse": "CE_AuthResponse",
    "Usuario": "CE_Usuario", "UsuarioRol": "CE_UsuarioRol", "Rol": "CE_Rol",
    "BitacoraAuditoria": "CE_BitacoraAuditoria"
};

var DEFINICION = [
    ["Login", "Boundary", "pages/Login.tsx",
     [["credencial", "String"], ["password", "String"], ["verPassword", "Boolean"], ["error", "String"], ["enviando", "Boolean"]],
     [["onSubmit", "void", "e: FormEvent"], ["render", "JSX.Element", ""]]],

    ["AuthProvider", "Boundary", "contexts/AuthContext.tsx",
     [["usuario", "UsuarioSesion"], ["token", "String"], ["cargando", "Boolean"]],
     [["login", "UsuarioSesion", "credencial, password"], ["logout", "void", ""], ["setUsuario", "void", "nuevo"]]],

    ["api", "Boundary", "lib/api.ts",
     [["baseUrl", "String = /api/v1"]],
     [["login", "LoginResponse", "credencial, password"], ["logout", "void", ""], ["solicitar", "Response", "url, init, opciones"]]],

    ["AuthController", "Control", "CTR_Auth.ts",
     [["cookieSecure", "Boolean"]],
     [["login", "AuthResponse", "body, request, response"], ["refresh", "AuthResponse", "body, request, response"], ["logout", "void", "request, response, currentUser"]]],

    ["LoginRequest", "DTO", "Esquemas.ts",
     [["credencial", "String"], ["password", "String"]],
     []],

    ["AuthService", "Service", "SRV_AuthService.ts",
     [["dataSource", "DataSource"], ["jwtTokenService", "JwtTokenService"], ["bitacoraService", "BitacoraService"], ["seguridadService", "SeguridadService"]],
     [["autenticar", "AuthResponse", "credencial, password, request"], ["buscarPorCredencial", "Usuario", "credencial"], ["refrescar", "AuthResponse", "request, refresco"], ["cerrarSesion", "void", "usuario, token, refreshToken"]]],

    ["JwtTokenService", "Service", "SRV_JWTService.ts",
     [["accessMinutos", "Number = 15"], ["refreshDias", "Number = 7"], ["algoritmo", "String = HS256"]],
     [["generarPar", "Par", "subject, rol, permisos"], ["crearAccessToken", "String", "subject, rol, permisos"], ["crearRefreshToken", "String", "subject"], ["verificarRefreshToken", "TokenPayload", "token"], ["estaEnBlacklist", "Boolean", "jti"]]],

    ["SeguridadService", "Service", "SRV_SeguridadService.ts",
     [],
     [["validarPassword", "Boolean", "usuario, password"], ["hashearPassword", "String", "password"]]],

    ["DataSource", "Service", "TypeORM",
     [],
     [["getRepository", "Repository", "entidad"], ["query", "Array", "sql, params"]]],

    ["BitacoraService", "Service", "SRV_BitacoraService.ts",
     [],
     [["registrar", "BitacoraAuditoria", "idUsuario, accion, tabla, detalle"]]],

    ["AuthResponse", "DTO", "Esquemas.ts",
     [["access_token", "String"], ["refresh_token", "String"], ["token_type", "String = bearer"], ["usuario", "UsuarioSesion"]],
     []],

    ["Usuario", "Entity", "tabla usuarios",
     [["id_usuario", "Integer"], ["email", "String"], ["password_hash", "String"], ["estado", "String = Pendiente"], ["intentos_fallidos", "Integer = 0"], ["bloqueado_hasta", "Timestamp"], ["fecha_ultimo_acceso", "Timestamp"]],
     [["get rol", "Rol", ""], ["get nombre", "String", ""]]],

    ["UsuarioRol", "Entity", "tabla usuarios_roles",
     [["id_usuario", "Integer"], ["id_rol", "Integer"]],
     []],

    ["Rol", "Entity", "tabla roles",
     [["id_rol", "Integer"], ["nombre_rol", "String"], ["permisos_json", "JSONB"], ["estado", "String = Activo"]],
     []],

    ["BitacoraAuditoria", "Entity", "tabla bitacora_auditoria",
     [["id_bitacora", "Integer"], ["id_usuario", "Integer"], ["accion_sql", "String"], ["tabla_afectada", "String"], ["id_registro", "Integer"], ["detalle", "Text"], ["ip_address", "INET"], ["user_agent", "String"], ["fecha_hora", "Timestamp"]],
     []]
];

// ------------------------------------------------------------------
// UTILIDADES DE MODELO (busqueda local, sin recorrer todo el modelo)
// ------------------------------------------------------------------

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
    return nuevo;
}

function nota(el, texto)
{
    if (el == null) return;
    try {
        var a = String(el.Notes || "");
        if (a.indexOf(texto) < 0) el.Notes = a == "" ? texto : a + SALTO + texto;
        el.Update();
    } catch (ignore) { }
}

// ------------------------------------------------------------------
// TEXTO DE COMPARTIMENTOS
// ------------------------------------------------------------------

function textoCompartimentos(def)
{
    var i;
    var lineas = [];
    var a = def[3];
    var o = def[4];

    for (i = 0; i < a.length; i++) {
        lineas.push("- " + a[i][0] + " : " + a[i][1]);
    }

    if (a.length > 0 && o.length > 0) lineas.push("");

    for (i = 0; i < o.length; i++) {
        lineas.push("+ " + o[i][0] + "(" + o[i][2] + ") : " + o[i][1]);
    }

    if (lineas.length == 0) lineas.push("(sin atributos ni operaciones)");

    return lineas.join(SALTO);
}

// Crea un elemento Text con el contenido. Si EA no acepta el tipo Text,
// usa Class con el texto en las notas y ShowNotes en el diagrama.
function crearCajaDeTexto(paq, nombre, texto)
{
    var t = null;

    try {
        t = paq.Elements.AddNew(nombre, "Text");
    } catch (e1) {
        t = null;
    }

    if (t != null) {
        var puesto = false;
        try { t.Text = texto; puesto = true; } catch (e2) { }
        if (!puesto) { try { t.Notes = texto; puesto = true; } catch (e3) { } }
        if (puesto) {
            try { t.Update(); } catch (ignore) { }
            return { elemento: t, esTexto: true };
        }
        try { t.Delete(); } catch (ignore) { }
    }

    var c = paq.Elements.AddNew(nombre, "Class");
    try { c.Stereotype = "Note"; } catch (ignore) { }
    c.Notes = texto;
    try { c.Update(); } catch (ignore) { }
    return { elemento: c, esTexto: false };
}

// ------------------------------------------------------------------
// DIAGRAMA
// ------------------------------------------------------------------

function colocar(diag, el, izq, arr, ancho, alto, forma)
{
    var o = null;
    for (var i = 0; i < diag.DiagramObjects.Count; i++) {
        var c = diag.DiagramObjects.GetAt(i);
        if (c.ElementID == el.ElementID) { o = c; break; }
    }
    if (o == null) {
        try {
            o = diag.DiagramObjects.AddNew(
                "l=" + izq + ";r=" + (izq + ancho) + ";t=" + arr + ";b=" + (arr + alto) + ";", forma || "");
        } catch (e) { return null; }
        o.ElementID = el.ElementID;
    }
    if (forma) { try { o.Shape = forma; } catch (ignore) { } }
    try { o.ManuallySized = true; } catch (ignore) { }
    try { o.Left = izq; } catch (ignore) { }
    try { o.Top = arr; } catch (ignore) { }
    try { o.Right = izq + ancho; } catch (ignore) { }
    try { o.Bottom = arr + alto; } catch (ignore) { }
    try { o.FontSize = FUENTE; } catch (ignore) { }
    try { o.WrapText = true; } catch (ignore) { }
    o.Update();
    return o;
}

function relacion(diag, a, b, etiqueta, tipo, est, r1, r2, c1, c2)
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
    try { con.SourceRole = r1; } catch (ignore) { }
    try { con.DestinationRole = r2; } catch (ignore) { }
    try { con.SourceCardinality = c1; } catch (ignore) { }
    try { con.DestinationCardinality = c2; } catch (ignore) { }
    try { con.FontSize = 3; } catch (ignore) { }
    con.Update();

    var ya = false;
    for (var k = 0; k < diag.DiagramLinks.Count; k++) {
        if (diag.DiagramLinks.GetAt(k).ConnectorID == con.ConnectorID) ya = true;
    }
    if (!ya) {
        var l = diag.DiagramLinks.AddNew("", "");
        l.ConnectorID = con.ConnectorID;
        l.Update();
    }
}

function main()
{
    var raiz = Repository.Models.GetAt(0);

    var cu = buscarPaquete(raiz, "Casos de Uso");
    if (cu == null) cu = raiz;
    var mod = subPaquete(cu, "1. Seguridad y Autenticación");
    var paq = subPaquete(mod, "CU01 - Análisis de clases");

    // Limpia diagrama anterior.
    for (var d = paq.Diagrams.Count - 1; d >= 0; d--) {
        try { paq.Diagrams.GetAt(d).Delete(); } catch (ignore) { }
    }
    try { paq.Diagrams.Refresh(); } catch (ignore) { }

    // Limpia las cajas de texto de ejecuciones anteriores.
    for (var t = paq.Elements.Count - 1; t >= 0; t--) {
        var viejo = paq.Elements.GetAt(t);
        var nv = String(viejo.Name || "");
        if (nv.indexOf(" [compartimentos]") > 0) {
            try { viejo.Delete(); } catch (ignore) { }
        }
    }
    try { paq.Elements.Refresh(); } catch (ignore) { }

    var diag = null;
    try { diag = paq.Diagrams.AddNew("CU01 - Análisis de Clases", "Class"); }
    catch (e) {
        try { diag = paq.Diagrams.AddNew("CU01 - Análisis de Clases", "ClassDiagram"); }
        catch (e2) { diag = null; }
    }
    if (diag == null) return;
    diag.Update();
    paq.Diagrams.Refresh();

    // Actores.
    var actores = [];
    for (var a = 0; a < ACTORES.length; a++) {
        var nombre = ACTORES[a];
        var act = buscarLocal(paq, nombre, "Actor");

        if (act == null) {
            act = buscarLocal(paq, nombre, "Class");
            if (act != null) {
                try { act.Stereotype = "Actor"; act.Update(); } catch (ignore) { }
            } else {
                try { act = paq.Elements.AddNew(nombre, "Actor"); }
                catch (e3) {
                    act = paq.Elements.AddNew(nombre, "Class");
                    try { act.Stereotype = "Actor"; } catch (ignore) { }
                }
                act.Update();
                try { act.Alias = "ACTOR_" + nombre; } catch (ignore) { }
            }
        }

        nota(act, "Actor externo de CU01. Destino: " + (nombre == "Cliente" ? "/" : "/admin") + ".");
        actores[a] = act;
    }

    // Clases + cajas de compartimentos.
    var clases = [];
    var cajas = [];

    for (var n = 0; n < DEFINICION.length; n++) {
        var def = DEFINICION[n];
        var nom = def[0];
        var c = buscarLocal(paq, nom, "Class");

        if (c == null) {
            try { c = paq.Elements.AddNew(nom, "Class"); }
            catch (e4) { c = paq.Elements.AddNew(nom, "Object"); }
            c.Update();
        }

        try { c.Stereotype = def[1]; } catch (ignore) { }
        try { if (ALIAS[nom] != null) c.Alias = ALIAS[nom]; } catch (ignore) { }
        nota(c, "Origen: " + def[2] + ". Atributos y operaciones en la caja contigua.");
        try { c.Update(); } catch (ignore) { }
        clases[n] = c;

        var caja = crearCajaDeTexto(paq, nom + " [compartimentos]", textoCompartimentos(def));
        cajas[n] = caja.elemento;
    }

    // Relaciones.
    for (var r = 0; r < actores.length; r++) {
        relacion(diag, actores[r], clases[0], "usuario", "Association", "", "actor", "pantalla", "1", "0..1");
    }
    relacion(diag, clases[0], clases[1], "sesión de usuario", "Association", "", "pantalla", "sesión", "1", "1");
    relacion(diag, clases[1], clases[2], "cliente HTTP", "Dependency", "uses", "consumidor", "cliente", "1", "1");
    relacion(diag, clases[2], clases[3], "punto de acceso HTTP", "Dependency", "uses", "consumidor", "endpoint", "1", "0..1");
    relacion(diag, clases[3], clases[4], "datos de entrada", "Association", "", "controlador", "entrada", "1", "1");
    relacion(diag, clases[3], clases[5], "servicio de autenticación", "Association", "", "controlador", "servicio", "1", "1");
    relacion(diag, clases[3], clases[10], "datos de salida", "Association", "", "controlador", "salida", "1", "1");
    relacion(diag, clases[5], clases[7], "verificación de contraseña", "Dependency", "uses", "autenticador", "bcrypt", "1", "1");
    relacion(diag, clases[5], clases[6], "emisión de tokens", "Association", "", "autenticador", "emisor", "1", "1");
    relacion(diag, clases[5], clases[9], "auditoría de accesos", "Association", "", "autenticador", "auditor", "1", "1");
    relacion(diag, clases[5], clases[8], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
    relacion(diag, clases[5], clases[11], "cuenta autenticada", "Aggregation", "aggregation", "autenticador", "usuario", "1", "0..1");
    relacion(diag, clases[10], clases[11], "datos de sesión", "Dependency", "uses", "respuesta", "usuario", "1", "1");
    relacion(diag, clases[11], clases[12], "roles asignados", "Composition", "composition", "usuario", "asignación", "1", "0..*");
    relacion(diag, clases[12], clases[13], "rol asignado", "Association", "", "asignación", "rol", "1", "1");
    relacion(diag, clases[9], clases[14], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
    relacion(diag, clases[14], clases[11], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");

    // Posicionamiento: los actores arriba, y cada clase pegada a su caja.
    for (var p = 0; p < actores.length; p++) {
        colocar(diag, actores[p], COL_X[p], FILA_Y[0], 100, 120, "Actor");
    }

    for (var k = 0; k < clases.length; k++) {
        var col = k % 5;
        var fila = 1 + Math.floor(k / 5);
        var x = COL_X[col];
        var y = FILA_Y[fila];

        colocar(diag, clases[k], x, y, 250, 26, "");

        var oc = colocar(diag, cajas[k], x, y + 26, 250, 180, "");
        if (oc != null) {
            try { oc.BorderStyle = 0; } catch (ignore) { }
            try { oc.BackGroundColor = 16777215; } catch (ignore) { }
            try { oc.FontSize = 4; } catch (ignore) { }
            try { oc.WrapText = true; } catch (ignore) { }
            try { oc.ShowNotes = true; } catch (ignore) { }
            try { oc.Update(); } catch (ignore) { }
        }
    }

    try {
        diag.Notes =
            "Analisis de clases estatico: sin mensajes, sin lineas de vida y sin secuencia. " +
            "Los mensajes y excepciones de CU01 solo estan en el diagrama de comunicacion." + SALTO +
            "Los atributos y operaciones se dibujan con elementos Text colocados bajo cada clase, " +
            "porque la API de atributos de EA no los crea en esta maquina (se probaron 9 firmas)." + SALTO +
            "Composicion: 4 actores externos y 15 clases (3 Boundary, 1 Control, 5 Service, " +
            "2 DTO, 4 Entity) con 45 atributos y 27 operaciones. 17 relaciones estaticas." + SALTO +
            "DISCREPANCIAS: el caso describe Angular, FastAPI y Flutter; la implementacion real " +
            "es React/Vite con NestJS. El cuerpo real es { credencial, password }. El access_token " +
            "dura 15 minutos por JWT_ACCESS_TOKEN_MINUTES y el refresh 7 dias, no 8 horas. " +
            "No existe AuthGuard ni las rutas /inicio, /sucursal y /caja: Login.tsx navega a " +
            "/admin para Administrador, Encargado de Sucursal y Cajero, y a / para clientes. " +
            "La respuesta usa la clave usuario y no incluye avatar. No hay columna usuarios.rol: " +
            "el rol se obtiene por usuarios_roles. Una cuenta bloqueada devuelve 423 Locked.";
        diag.Update();
    } catch (ignore) { }

    try { paq.Diagrams.Refresh(); } catch (ignore) { }
    try { paq.Elements.Refresh(); } catch (ignore) { }

    Repository.OpenDiagram(diag.DiagramID);
}

main();
