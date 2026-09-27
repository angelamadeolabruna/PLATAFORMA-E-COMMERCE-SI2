// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU01 - Iniciar Sesión en Plataforma
// Diagrama de análisis de clases (diagrama estático, SIN mensajes).
//
// SIN POPUPS: todo el resultado se escribe dentro del diagrama.
// Si aparece la clase "CU01 REPORTE", el script se ejecutó.
//
// Fuente de verdad: implementación real React/Vite + NestJS.
// No modifica código de la aplicación.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "Administrador": "ACTOR_Administrador",
    "Encargado de Sucursal": "ACTOR_EncargadoSucursal",
    "Cajero": "ACTOR_Cajero",
    "Cliente": "ACTOR_Cliente",
    "Login": "IU_Login",
    "AuthProvider": "IU_AuthProvider",
    "api": "IU_Api",
    "AuthController": "CTR_Auth",
    "AuthService": "SRV_AuthService",
    "SeguridadService": "SRV_SeguridadService",
    "JwtTokenService": "SRV_JwtTokenService",
    "BitacoraService": "SRV_BitacoraService",
    "DataSource": "SRV_DataSource",
    "LoginRequest": "CE_LoginRequest",
    "AuthResponse": "CE_AuthResponse",
    "Usuario": "CE_Usuario",
    "UsuarioRol": "CE_UsuarioRol",
    "Rol": "CE_Rol",
    "BitacoraAuditoria": "CE_BitacoraAuditoria"
};

var FUENTE = 4;
var SALTO = String.fromCharCode(10);

var COL_X = [10, 240, 470, 700, 930];
var FILA_Y = [10, 170, 440, 710];

var ACTORES = ["Administrador", "Encargado de Sucursal", "Cajero", "Cliente"];

var RELACIONES = [
    "usuario",
    "sesión de usuario",
    "cliente HTTP",
    "punto de acceso HTTP",
    "servicio de autenticación",
    "datos de entrada",
    "datos de salida",
    "verificación de contraseña",
    "emisión de tokens",
    "auditoría de accesos",
    "persistencia",
    "cuenta autenticada",
    "datos de sesión",
    "roles asignados",
    "rol asignado",
    "registro de auditoría",
    "usuario de la acción"
];

function buscarPaquete(paquete, nombre)
{
    if (paquete == null) return null;
    if (paquete.Name == nombre) return paquete;

    for (var i = 0; i < paquete.Packages.Count; i++) {
        var encontrado = buscarPaquete(paquete.Packages.GetAt(i), nombre);
        if (encontrado != null) return encontrado;
    }
    return null;
}

function obtenerOCrearSubPaquete(padre, nombre)
{
    for (var i = 0; i < padre.Packages.Count; i++) {
        var sub = padre.Packages.GetAt(i);
        if (sub.Name == nombre) return sub;
    }

    var nuevo = padre.Packages.AddNew(nombre, "");
    nuevo.Update();
    padre.Packages.Refresh();
    return nuevo;
}

function buscarPorTipo(raiz, nombre, tipo)
{
    for (var i = 0; i < raiz.Elements.Count; i++) {
        var elemento = raiz.Elements.GetAt(i);
        if (elemento.Name == nombre && elemento.Type == tipo) {
            return elemento;
        }
    }

    for (var j = 0; j < raiz.Packages.Count; j++) {
        var encontrado = buscarPorTipo(raiz.Packages.GetAt(j), nombre, tipo);
        if (encontrado != null) return encontrado;
    }

    return null;
}

function agregarNota(elemento, nota)
{
    if (elemento == null || nota == null || nota == "") return;

    try {
        var actual = "";
        try { actual = String(elemento.Notes || ""); } catch (ignore) { actual = ""; }

        if (actual.indexOf(nota) < 0) {
            elemento.Notes = actual == "" ? nota : actual + SALTO + nota;
            elemento.Update();
        }
    } catch (ignore) {
    }
}

function yaExisteAtributo(elemento, nombre)
{
    try {
        for (var i = 0; i < elemento.Attributes.Count; i++) {
            if (String(elemento.Attributes.GetAt(i).Name) == nombre) return true;
        }
    } catch (ignore) { }
    return false;
}

function yaExisteOperacion(elemento, nombre)
{
    try {
        for (var i = 0; i < elemento.Methods.Count; i++) {
            var texto = String(elemento.Methods.GetAt(i).Name);
            if (texto == nombre) return true;
            if (texto.indexOf(" " + nombre + "(") >= 0) return true;
        }
    } catch (ignore) { }
    return false;
}

function agregarAtributo(elemento, nombre, tipo)
{
    if (elemento == null) return false;
    if (yaExisteAtributo(elemento, nombre)) return true;

    // EA admite varias firmas. Se prueban todas para no perder
    // silenciosamente el atributo.
    try {
        elemento.AddAttribute(nombre, tipo, "");
        return true;
    } catch (primerError) {
        try {
            elemento.AddAttribute(nombre, tipo);
            return true;
        } catch (segundoError) {
            try {
                elemento.AddAttribute(nombre);
                return true;
            } catch (tercerError) {
                return false;
            }
        }
    }
}

function agregarOperacion(elemento, nombre, retorno, parametros)
{
    if (elemento == null) return;
    if (yaExisteOperacion(elemento, nombre)) return;

    try {
        elemento.AddOperation(nombre, retorno, parametros);
    } catch (primerError) {
        try {
            elemento.AddOperation(nombre, retorno);
        } catch (segundoError) {
            try { elemento.AddOperation(nombre); } catch (tercerError) { }
        }
    }
}

function crearClase(raiz, paquete, nombre, estereotipo, nota, atributos, operaciones)
{
    var elemento = buscarPorTipo(raiz, nombre, "Class");

    if (elemento == null) {
        try {
            elemento = paquete.Elements.AddNew(nombre, "Class");
        } catch (primerError) {
            elemento = paquete.Elements.AddNew(nombre, "Object");
        }
        elemento.Update();
        paquete.Elements.Refresh();
    }

    try { elemento.Stereotype = estereotipo; } catch (ignore) { }

    try {
        if (ALIAS_POR_NOMBRE[nombre] != null) {
            elemento.Alias = ALIAS_POR_NOMBRE[nombre];
        }
    } catch (ignore) { }

    agregarNota(elemento, nota);

    var i;
    if (atributos != null) {
        for (i = 0; i < atributos.length; i++) {
            agregarAtributo(elemento, atributos[i][0], atributos[i][1]);
        }
    }

    if (operaciones != null) {
        for (i = 0; i < operaciones.length; i++) {
            agregarOperacion(elemento, operaciones[i][0], operaciones[i][1], operaciones[i][2]);
        }
    }

    try { elemento.Update(); } catch (ignore) { }
    return elemento;
}

// Los actores se crean en el MISMO paquete que el diagrama, y si el
// modelo no admite el tipo Actor se crean como Class con estereotipo.
function crearActor(raiz, paquete, nombre, nota)
{
    var actor = buscarPorTipo(raiz, nombre, "Actor");
    var tipoUsado = "Actor";

    if (actor == null) {
        try {
            actor = paquete.Elements.AddNew(nombre, "Actor");
        } catch (primerError) {
            actor = paquete.Elements.AddNew(nombre, "Class");
            tipoUsado = "Class";
        }
        actor.Update();
        paquete.Elements.Refresh();
    }

    if (tipoUsado == "Class") {
        try { actor.Stereotype = "Actor"; } catch (ignore) { }
    }

    try { actor.Alias = "ACTOR_" + nombre; } catch (ignore) { }
    agregarNota(actor, nota);
    try { actor.Update(); } catch (ignore) { }
    return actor;
}

function colocar(diagrama, elemento, izquierda, arriba, ancho, alto, forma)
{
    var objeto = null;

    for (var i = 0; i < diagrama.DiagramObjects.Count; i++) {
        var candidato = diagrama.DiagramObjects.GetAt(i);
        if (candidato.ElementID == elemento.ElementID) {
            objeto = candidato;
            break;
        }
    }

    if (objeto == null) {
        try {
            objeto = diagrama.DiagramObjects.AddNew(
                "l=" + izquierda + ";r=" + (izquierda + ancho) +
                ";t=" + arriba + ";b=" + (arriba + alto) + ";",
                forma || ""
            );
        } catch (primerError) {
            objeto = null;
        }

        if (objeto != null) {
            objeto.ElementID = elemento.ElementID;
        }
    }

    if (objeto == null) return null;

    if (forma != null && forma != "") {
        try { objeto.Shape = forma; } catch (ignore) { }
    }

    try { objeto.ManuallySized = true; } catch (ignore) { }
    try { objeto.Left = izquierda; } catch (ignore) { }
    try { objeto.Top = arriba; } catch (ignore) { }
    try { objeto.Right = izquierda + ancho; } catch (ignore) { }
    try { objeto.Bottom = arriba + alto; } catch (ignore) { }
    try { objeto.FontSize = FUENTE; } catch (ignore) { }
    try { objeto.WrapText = true; } catch (ignore) { }

    objeto.Update();
    return objeto;
}

function depurarRelaciones(diagrama, permitidas)
{
    var eliminadas = 0;

    for (var i = diagrama.DiagramLinks.Count - 1; i >= 0; i--) {
        var enlace = diagrama.DiagramLinks.GetAt(i);
        var conector = null;

        try { conector = Repository.GetElementByID(enlace.ConnectorID); } catch (ignore) { conector = null; }
        if (conector == null) continue;

        var nombre = "";
        try { nombre = String(conector.Name || ""); } catch (ignore) { nombre = ""; }

        var valida = false;
        for (var p = 0; p < permitidas.length; p++) {
            if (permitidas[p] == nombre) { valida = true; break; }
        }

        if (!valida) {
            try { conector.Delete(); eliminadas = eliminadas + 1; } catch (ignore) { }
        }
    }

    try { diagrama.DiagramLinks.Refresh(); } catch (ignore) { }
    return eliminadas;
}

function agregarRelacion(diagrama, origen, destino, etiqueta, tipo, estereotipo, rolOrigen, rolDestino, card1, card2)
{
    if (origen == null || destino == null) return;

    var conector = null;

    for (var i = 0; i < origen.Connectors.Count; i++) {
        var c = origen.Connectors.GetAt(i);
        var nombre = "";
        try { nombre = String(c.Name || ""); } catch (ignore) { nombre = ""; }

        if (c.SupplierID == destino.ElementID && nombre == etiqueta) {
            conector = c;
            break;
        }
    }

    if (conector == null) {
        try {
            conector = origen.Connectors.AddNew("", tipo);
        } catch (primerError) {
            conector = origen.Connectors.AddNew("", "Association");
        }

        conector.ClientID = origen.ElementID;
        conector.SupplierID = destino.ElementID;
        conector.Update();
        origen.Connectors.Refresh();
    }

    try { conector.Name = etiqueta; } catch (ignore) { }
    try { conector.Stereotype = estereotipo || ""; } catch (ignore) { }
    try { conector.SourceRole = rolOrigen; } catch (ignore) { }
    try { conector.DestinationRole = rolDestino; } catch (ignore) { }
    try { conector.SourceCardinality = card1; } catch (ignore) { }
    try { conector.DestinationCardinality = card2; } catch (ignore) { }
    try { conector.FontSize = 3; } catch (ignore) { }

    conector.Update();

    var yaEsta = false;
    for (var k = 0; k < diagrama.DiagramLinks.Count; k++) {
        if (diagrama.DiagramLinks.GetAt(k).ConnectorID == conector.ConnectorID) {
            yaEsta = true;
            break;
        }
    }

    if (!yaEsta) {
        var enlace = diagrama.DiagramLinks.AddNew("", "");
        enlace.ConnectorID = conector.ConnectorID;
        enlace.Update();
    }
}

function main()
{
    var raiz = Repository.Models.GetAt(0);

    var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
    if (paqueteCasosUso == null) paqueteCasosUso = raiz;

    var paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "1. Seguridad y Autenticación");
    var paquete = obtenerOCrearSubPaquete(paqueteModulo, "CU01 - Análisis de clases");

    for (var d = paquete.Diagrams.Count - 1; d >= 0; d--) {
        try { paquete.Diagrams.GetAt(d).Delete(); } catch (ignore) { }
    }
    try { paquete.Diagrams.Refresh(); } catch (ignore) { }

    var diagrama = null;
    try {
        diagrama = paquete.Diagrams.AddNew("CU01 - Análisis de Clases", "Class");
    } catch (primerError) {
        try {
            diagrama = paquete.Diagrams.AddNew("CU01 - Análisis de Clases", "ClassDiagram");
        } catch (segundoError) {
            diagrama = null;
        }
    }

    if (diagrama == null) {
        var fallo = paquete.Elements.AddNew("CU01 ERROR", "Class");
        agregarAtributo(fallo, "No se pudo crear el diagrama de clases");
        try { fallo.Update(); } catch (ignore) { }
        return;
    }

    diagrama.Update();
    paquete.Diagrams.Refresh();

    var notasActores = {
        "Administrador": "Accede con correo o CI. Permiso '*'. Destino: /admin.",
        "Encargado de Sucursal": "Accede con correo o CI. Permisos de inventario, compras y reservas. Destino: /admin.",
        "Cajero": "Accede con correo o CI. Permiso registrar_venta. Destino: /admin.",
        "Cliente": "Accede con correo. Destino: /."
    };

    var actores = [];
    for (var a = 0; a < ACTORES.length; a++) {
        actores[a] = crearActor(raiz, paquete, ACTORES[a], notasActores[ACTORES[a]]);
    }

    var login = crearClase(raiz, paquete, "Login", "Boundary",
        "pages/Login.tsx. Ruta /login.",
        [["credencial", "String"], ["password", "String"], ["verPassword", "Boolean"], ["error", "String"], ["enviando", "Boolean"]],
        [["onSubmit", "void", "e: FormEvent"], ["render", "JSX.Element", ""]]);

    var authProvider = crearClase(raiz, paquete, "AuthProvider", "Boundary",
        "contexts/AuthContext.tsx. Guarda access_token en localStorage.",
        [["usuario", "UsuarioSesion"], ["token", "String"], ["cargando", "Boolean"]],
        [["login", "UsuarioSesion", "credencial, password"], ["logout", "void", ""], ["setUsuario", "void", "nuevo"]]);

    var api = crearClase(raiz, paquete, "api", "Boundary",
        "lib/api.ts. Envia Bearer token. Renueva ante 401.",
        [["baseUrl", "String = /api/v1"]],
        [["login", "LoginResponse", "credencial, password"], ["logout", "void", ""], ["solicitar", "Response", "url, init, opciones"]]);

    var authController = crearClase(raiz, paquete, "AuthController", "Control",
        "CTR_Auth.ts. Fija cookies httpOnly.",
        [["cookieSecure", "Boolean"]],
        [["login", "AuthResponse", "body, request, response"], ["refresh", "AuthResponse", "body, request, response"], ["logout", "void", "request, response, currentUser"]]);

    var loginRequest = crearClase(raiz, paquete, "LoginRequest", "DTO",
        "Esquemas.ts. Cuerpo real: { credencial, password }.",
        [["credencial", "String"], ["password", "String"]], []);

    var authService = crearClase(raiz, paquete, "AuthService", "Service",
        "SRV_AuthService.ts. Logica de CU01.",
        [["dataSource", "DataSource"], ["jwtTokenService", "JwtTokenService"], ["bitacoraService", "BitacoraService"], ["seguridadService", "SeguridadService"]],
        [["autenticar", "AuthResponse", "credencial, password, request"], ["buscarPorCredencial", "Usuario", "credencial"], ["refrescar", "AuthResponse", "request, refresco"], ["cerrarSesion", "void", "usuario, token, refreshToken"]]);

    var jwtTokenService = crearClase(raiz, paquete, "JwtTokenService", "Service",
        "SRV_JWTService.ts. HS256. Access 15 min, refresh 7 dias.",
        [["accessMinutos", "Number = 15"], ["refreshDias", "Number = 7"], ["algoritmo", "String = HS256"]],
        [["generarPar", "Par", "subject, rol, permisos"], ["crearAccessToken", "String", "subject, rol, permisos"], ["crearRefreshToken", "String", "subject"], ["verificarRefreshToken", "TokenPayload", "token"], ["estaEnBlacklist", "Boolean", "jti"]]);

    var seguridadService = crearClase(raiz, paquete, "SeguridadService", "Service",
        "SRV_SeguridadService.ts. bcrypt coste 10.",
        [],
        [["validarPassword", "Boolean", "usuario, password"], ["hashearPassword", "String", "password"]]);

    var dataSource = crearClase(raiz, paquete, "DataSource", "Service",
        "TypeORM DataSource.",
        [],
        [["getRepository", "Repository", "entidad"], ["query", "Array", "sql, params"]]);

    var bitacoraService = crearClase(raiz, paquete, "BitacoraService", "Service",
        "SRV_BitacoraService.ts. Guarda detalle en texto.",
        [],
        [["registrar", "BitacoraAuditoria", "idUsuario, accion, tabla, detalle"]]);

    var authResponse = crearClase(raiz, paquete, "AuthResponse", "DTO",
        "Esquemas.ts. Clave 'usuario', no 'user'.",
        [["access_token", "String"], ["refresh_token", "String"], ["token_type", "String = bearer"], ["usuario", "UsuarioSesion"]], []);

    var usuario = crearClase(raiz, paquete, "Usuario", "Entity",
        "Tabla usuarios. Rol via usuarios_roles.",
        [["id_usuario", "Integer"], ["email", "String"], ["password_hash", "String"], ["estado", "String = Pendiente"], ["intentos_fallidos", "Integer = 0"], ["bloqueado_hasta", "Timestamp"], ["fecha_ultimo_acceso", "Timestamp"]],
        [["get rol", "Rol", ""], ["get nombre", "String", ""]]);

    var usuarioRol = crearClase(raiz, paquete, "UsuarioRol", "Entity",
        "Tabla usuarios_roles.",
        [["id_usuario", "Integer"], ["id_rol", "Integer"]], []);

    var rol = crearClase(raiz, paquete, "Rol", "Entity",
        "Tabla roles. permisos_json alimenta el JWT.",
        [["id_rol", "Integer"], ["nombre_rol", "String"], ["permisos_json", "JSONB"], ["estado", "String = Activo"]], []);

    var bitacoraAuditoria = crearClase(raiz, paquete, "BitacoraAuditoria", "Entity",
        "Tabla bitacora_auditoria.",
        [["id_bitacora", "Integer"], ["id_usuario", "Integer"], ["accion_sql", "String"], ["tabla_afectada", "String"], ["id_registro", "Integer"], ["detalle", "Text"], ["ip_address", "INET"], ["user_agent", "String"], ["fecha_hora", "Timestamp"]], []);

    var clases = [login, authProvider, api, authController, loginRequest,
        authService, jwtTokenService, seguridadService, dataSource, bitacoraService,
        authResponse, usuario, usuarioRol, rol, bitacoraAuditoria];

    for (var r = 0; r < actores.length; r++) {
        agregarRelacion(diagrama, actores[r], login, "usuario", "Association", "", "actor", "pantalla", "1", "0..1");
    }

    agregarRelacion(diagrama, login, authProvider, "sesión de usuario", "Association", "", "pantalla", "sesión", "1", "1");
    agregarRelacion(diagrama, authProvider, api, "cliente HTTP", "Dependency", "uses", "consumidor", "cliente", "1", "1");
    agregarRelacion(diagrama, api, authController, "punto de acceso HTTP", "Dependency", "uses", "consumidor", "endpoint", "1", "0..1");
    agregarRelacion(diagrama, authController, loginRequest, "datos de entrada", "Association", "", "controlador", "entrada", "1", "1");
    agregarRelacion(diagrama, authController, authService, "servicio de autenticación", "Association", "", "controlador", "servicio", "1", "1");
    agregarRelacion(diagrama, authController, authResponse, "datos de salida", "Association", "", "controlador", "salida", "1", "1");
    agregarRelacion(diagrama, authService, seguridadService, "verificación de contraseña", "Dependency", "uses", "autenticador", "bcrypt", "1", "1");
    agregarRelacion(diagrama, authService, jwtTokenService, "emisión de tokens", "Association", "", "autenticador", "emisor", "1", "1");
    agregarRelacion(diagrama, authService, bitacoraService, "auditoría de accesos", "Association", "", "autenticador", "auditor", "1", "1");
    agregarRelacion(diagrama, authService, dataSource, "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
    agregarRelacion(diagrama, authService, usuario, "cuenta autenticada", "Aggregation", "aggregation", "autenticador", "usuario", "1", "0..1");
    agregarRelacion(diagrama, authResponse, usuario, "datos de sesión", "Dependency", "uses", "respuesta", "usuario", "1", "1");
    agregarRelacion(diagrama, usuario, usuarioRol, "roles asignados", "Composition", "composition", "usuario", "asignación", "1", "0..*");
    agregarRelacion(diagrama, usuarioRol, rol, "rol asignado", "Association", "", "asignación", "rol", "1", "1");
    agregarRelacion(diagrama, bitacoraService, bitacoraAuditoria, "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
    agregarRelacion(diagrama, bitacoraAuditoria, usuario, "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");

    depurarRelaciones(diagrama, RELACIONES);

    for (var p = 0; p < actores.length; p++) {
        colocar(diagrama, actores[p], COL_X[p], FILA_Y[0], 90, 100, "Actor");
    }

    colocar(diagrama, login, COL_X[0], FILA_Y[1], 220, 150, "");
    colocar(diagrama, authProvider, COL_X[1], FILA_Y[1], 220, 150, "");
    colocar(diagrama, api, COL_X[2], FILA_Y[1], 220, 150, "");
    colocar(diagrama, authController, COL_X[3], FILA_Y[1], 220, 150, "");
    colocar(diagrama, loginRequest, COL_X[4], FILA_Y[1], 220, 150, "");

    colocar(diagrama, authService, COL_X[0], FILA_Y[2], 220, 150, "");
    colocar(diagrama, jwtTokenService, COL_X[1], FILA_Y[2], 220, 150, "");
    colocar(diagrama, seguridadService, COL_X[2], FILA_Y[2], 220, 150, "");
    colocar(diagrama, dataSource, COL_X[3], FILA_Y[2], 220, 150, "");
    colocar(diagrama, bitacoraService, COL_X[4], FILA_Y[2], 220, 150, "");

    colocar(diagrama, usuario, COL_X[0], FILA_Y[3], 220, 150, "");
    colocar(diagrama, usuarioRol, COL_X[1], FILA_Y[3], 220, 150, "");
    colocar(diagrama, rol, COL_X[2], FILA_Y[3], 220, 150, "");
    colocar(diagrama, authResponse, COL_X[3], FILA_Y[3], 220, 150, "");
    colocar(diagrama, bitacoraAuditoria, COL_X[4], FILA_Y[3], 220, 150, "");

    var detalleActores = "";
    for (var q = 0; q < actores.length; q++) {
        detalleActores = detalleActores + actores[q].Name + " (" + actores[q].Type + "); ";
    }

    // Verificacion real de compartimentos: cuenta lo que EA guardo
    // en cada clase, para saber si el problema es de guardado o de vista.
    var totalAtributos = 0;
    var totalOperaciones = 0;
    var lineas = "";

    for (var v = 0; v < clases.length; v++) {
        var nAtr = 0;
        var nOpe = 0;

        try { nAtr = clases[v].Attributes.Count; } catch (e1) { nAtr = -1; }
        try { nOpe = clases[v].Methods.Count; } catch (e2) { nOpe = -1; }

        if (nAtr > 0) totalAtributos = totalAtributos + nAtr;
        if (nOpe > 0) totalOperaciones = totalOperaciones + nOpe;

        lineas = lineas + clases[v].Name + " (" + clases[v].Type + "): " +
            nAtr + " atributos, " + nOpe + " operaciones" + SALTO;
    }

    var reporte = paquete.Elements.AddNew("CU01 REPORTE", "Class");
    try { reporte.Stereotype = "Control"; } catch (ignore) { }
    agregarAtributo(reporte, "Objetos en el diagrama: " + diagrama.DiagramObjects.Count);
    agregarAtributo(reporte, "Relaciones en el diagrama: " + diagrama.DiagramLinks.Count);
    agregarAtributo(reporte, "Actores creados: " + actores.length);
    agregarAtributo(reporte, "Tipos de actor: " + detalleActores);
    agregarAtributo(reporte, "TOTAL atributos guardados: " + totalAtributos);
    agregarAtributo(reporte, "TOTAL operaciones guardadas: " + totalOperaciones);
    agregarAtributo(reporte, "COMPARTIMENTOS POR CLASE:");
    agregarAtributo(reporte, lineas);
    try { reporte.Update(); } catch (ignore) { }

    try {
        diagrama.Notes =
            "Diagrama de analisis de clases: es estatico, sin mensajes, sin lineas de vida y sin secuencia. " +
            "Los mensajes y las excepciones de CU01 solo existen en el diagrama de comunicacion de CU01." + SALTO +
            "Actores como referencias externas asociados a la pantalla Login con el rol usuario." + SALTO +
            "15 clases: 3 Boundary, 1 Control, 5 Service, 2 DTO y 4 Entity, con atributos y operaciones dentro." + SALTO +
            "Discrepancias: el caso describe Angular, FastAPI y Flutter, pero la implementacion real es React/Vite con NestJS. " +
            "El cuerpo real es { credencial, password } y no { email, password }. " +
            "El access_token dura 15 minutos por JWT_ACCESS_TOKEN_MINUTES, no 8 horas. " +
            "No existe AuthGuard ni las rutas /inicio, /sucursal y /caja. " +
            "La respuesta usa la clave usuario y no incluye avatar. " +
            "Una cuenta bloqueada devuelve 423 Locked y no hay countdown.";
        diagrama.Update();
    } catch (ignore) { }

    try { paquete.Diagrams.Refresh(); } catch (ignore) { }
    try { paquete.Elements.Refresh(); } catch (ignore) { }

    Repository.OpenDiagram(diagrama.DiagramID);
}

main();
