// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU01 - Iniciar Sesión en Plataforma
// Diagrama de análisis de clases (diagrama estático, SIN mensajes).
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

var FUENTE_PARTICIPANTES = 4;
var FUENTE_RELACIONES = 3;

// Rejilla compacta: 5 columnas x 4 filas.
// Fila 0: actores. Filas 1-3: clases.
var COL_X = [10, 240, 470, 700, 930];
var FILA_Y = [10, 160, 430, 700];

// Actores que participan en CU01 como referencias externas.
var ACTORES_CU01 = ["Administrador", "Encargado de Sucursal", "Cajero", "Cliente"];

// Nombres admitidos en el diagrama de clases. Cualquier otra
// relacion presente en el diagrama se elimina.
var RELACIONES_VALIDAS = [
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

var avisos = "";
var tamanoCero = 0;

function registrarAviso(texto)
{
    avisos = avisos == "" ? texto : avisos + String.fromCharCode(10) + texto;
}

function mostrarAviso(texto)
{
    try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup(texto, 0, "Tiendas Montaño - CU01 análisis de clases", 0);
    } catch (ignore) {
    }
}

function contiene(lista, valor)
{
    for (var i = 0; i < lista.length; i++) {
        if (lista[i] == valor) return true;
    }
    return false;
}

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
    if (raiz == null) return null;

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

function buscarClase(raiz, nombre)
{
    return buscarPorTipo(raiz, nombre, "Class");
}

// Crea (o reutiliza) un actor. Los actores son referencias externas
// al sistema y no forman parte de la implementacion.
function obtenerOCrearActor(raiz, paqueteActores, nombre, nota)
{
    var actor = buscarPorTipo(raiz, nombre, "Actor");

    if (actor == null) {
        try {
            actor = paqueteActores.Elements.AddNew(nombre, "Actor");
        } catch (primerError) {
            actor = paqueteActores.Elements.AddNew(nombre, "Class");
            registrarAviso("AVISO: el actor " + nombre + " se creo como Class.");
        }

        actor.Update();
        paqueteActores.Elements.Refresh();
    }

    try {
        if (ALIAS_POR_NOMBRE[nombre] != null) {
            actor.Alias = ALIAS_POR_NOMBRE[nombre];
        }
    } catch (ignore) { }

    agregarNota(actor, nota);

    try { actor.Update(); } catch (ignore) { }

    return actor;
}

function agregarNota(elemento, nota)
{
    if (elemento == null || nota == null || nota == "") return;

    try {
        var actual = "";
        try { actual = String(elemento.Notes || ""); } catch (ignore) { actual = ""; }

        if (actual.indexOf(nota) < 0) {
            elemento.Notes = actual == "" ? nota : actual + String.fromCharCode(10) + nota;
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
            var metodo = elemento.Methods.GetAt(i);
            var texto = String(metodo.Name);
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

    try {
        elemento.AddAttribute(nombre, tipo);
        return true;
    } catch (primerError) {
        try {
            elemento.AddAttribute(nombre, tipo, "");
            return true;
        } catch (segundoError) {
            return false;
        }
    }
}

function agregarOperacion(elemento, nombre, retorno, parametros)
{
    if (elemento == null) return false;
    if (yaExisteOperacion(elemento, nombre)) return true;

    try {
        elemento.AddOperation(nombre, retorno, parametros);
        return true;
    } catch (primerError) {
        try {
            elemento.AddOperation(nombre, retorno);
            return true;
        } catch (segundoError) {
            try {
                elemento.AddOperation(nombre);
                return true;
            } catch (tercerError) {
                return false;
            }
        }
    }
}

// Crea (o reutiliza) una clase con sus compartimentos de atributos
// y operaciones. Devuelve el elemento.
function obtenerOCrearClase(raiz, paquete, nombre, estereotipo, nota, atributos, operaciones)
{
    var elemento = buscarClase(raiz, nombre);

    if (elemento == null) {
        try {
            elemento = paquete.Elements.AddNew(nombre, "Class");
        } catch (primerError) {
            elemento = paquete.Elements.AddNew(nombre, "Object");
            registrarAviso("AVISO: " + nombre + " se creo como Object, no como Class.");
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
    var j;

    if (atributos != null) {
        for (i = 0; i < atributos.length; i++) {
            agregarAtributo(elemento, atributos[i][0], atributos[i][1]);
        }
    }

    if (operaciones != null) {
        for (j = 0; j < operaciones.length; j++) {
            agregarOperacion(elemento, operaciones[j][0], operaciones[j][1], operaciones[j][2]);
        }
    }

    try { elemento.Update(); } catch (ignore) { }

    // Respaldo: si el modelo no guardo los compartimentos, quedan en notas.
    try {
        if (atributos != null && atributos.length > 0 && elemento.Attributes.Count == 0) {
            var lista = "";
            for (i = 0; i < atributos.length; i++) {
                lista = lista == "" ? "" : lista + ", ";
                lista = lista + atributos[i][0] + " : " + atributos[i][1];
            }
            agregarNota(elemento, "Atributos: " + lista);
        }

        if (operaciones != null && operaciones.length > 0 && elemento.Methods.Count == 0) {
            var listaOps = "";
            for (j = 0; j < operaciones.length; j++) {
                listaOps = listaOps == "" ? "" : listaOps + ", ";
                listaOps = listaOps + operaciones[j][0] + "(" + operaciones[j][2] + ") : " + operaciones[j][1];
            }
            agregarNota(elemento, "Operaciones: " + listaOps);
        }
    } catch (ignore) { }

    return elemento;
}

function contieneIgnorandoMayusculas(texto, aguja)
{
    return String(texto).toLowerCase().indexOf(String(aguja).toLowerCase()) >= 0;
}

function eliminarDiagramasDeClases(paquete)
{
    var eliminados = 0;

    for (var i = paquete.Diagrams.Count - 1; i >= 0; i--) {
        var diagrama = paquete.Diagrams.GetAt(i);

        if (contieneIgnorandoMayusculas(diagrama.Name, "análisis de clases")) {
            try { diagrama.Delete(); eliminados = eliminados + 1; } catch (ignore) { }
        }
    }

    for (var j = paquete.Packages.Count - 1; j >= 0; j--) {
        eliminados = eliminados + eliminarDiagramasDeClases(paquete.Packages.GetAt(j));
    }

    try { paquete.Diagrams.Refresh(); } catch (ignore) { }

    return eliminados;
}

function eliminarPaquetesLegados(padre, marcador, conservar)
{
    var eliminados = 0;

    for (var i = padre.Packages.Count - 1; i >= 0; i--) {
        var sub = padre.Packages.GetAt(i);
        var nombre = String(sub.Name || "");

        if (nombre != conservar && contieneIgnorandoMayusculas(nombre, marcador)) {
            try { sub.Delete(); eliminados = eliminados + 1; } catch (ignore) { }
        }
    }

    try { padre.Packages.Refresh(); } catch (ignore) { }

    return eliminados;
}

function listarDiagramas(paquete, prefijo, salida)
{
    for (var i = 0; i < paquete.Diagrams.Count; i++) {
        var nombre = String(paquete.Diagrams.GetAt(i).Name || "");
        if (nombre.indexOf(prefijo) == 0) {
            salida = salida == "" ? "" : salida + String.fromCharCode(10);
            salida = salida + "  - " + nombre;
        }
    }

    for (var j = 0; j < paquete.Packages.Count; j++) {
        salida = listarDiagramas(paquete.Packages.GetAt(j), prefijo, salida);
    }

    return salida;
}

function crearDiagramaDeClases(paquete, nombre)
{
    var nuevo = null;

    try {
        nuevo = paquete.Diagrams.AddNew(nombre, "Class");
    } catch (primerError) {
        try {
            nuevo = paquete.Diagrams.AddNew(nombre, "ClassDiagram");
        } catch (segundoError) {
            nuevo = null;
        }
    }

    if (nuevo == null) {
        throw new Error("No se pudo crear el diagrama de clases. Revise el tipo de diagrama del modelo.");
    }

    nuevo.Update();
    paquete.Diagrams.Refresh();
    return nuevo;
}

function buscarObjeto(diagrama, elemento)
{
    for (var i = 0; i < diagrama.DiagramObjects.Count; i++) {
        var candidato = diagrama.DiagramObjects.GetAt(i);
        if (candidato.ElementID == elemento.ElementID) {
            return candidato;
        }
    }
    return null;
}

// Coloca un elemento en el diagrama. El parametro "forma" fuerza la
// figura: en un diagrama de clases EA puede dejar un Actor con tamano
// cero si no se le indica la forma, y entonces no se ve nada.
function colocar(diagrama, elemento, izquierda, arriba, ancho, alto, forma)
{
    var objeto = buscarObjeto(diagrama, elemento);

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

    if (objeto == null) {
        try {
            objeto = diagrama.DiagramObjects.AddNew(elemento.Name, forma || "");
            objeto.ElementID = elemento.ElementID;
        } catch (segundoError) {
            objeto = null;
        }
    }

    if (objeto == null) {
        registrarAviso("AVISO: no se pudo crear el objeto de " + elemento.Name + ".");
        return null;
    }

    if (forma != null && forma != "") {
        try { objeto.Shape = forma; } catch (ignore) { }
    }

    try { objeto.ManuallySized = true; } catch (ignore) { }
    try { objeto.Left = izquierda; } catch (ignore) { }
    try { objeto.Top = arriba; } catch (ignore) { }
    try { objeto.Right = izquierda + ancho; } catch (ignore) { }
    try { objeto.Bottom = arriba + alto; } catch (ignore) { }
    try { objeto.FontSize = FUENTE_PARTICIPANTES; } catch (ignore) { }
    try { objeto.WrapText = true; } catch (ignore) { }

    objeto.Update();
    return objeto;
}

// Las clases se dibujan con caja fija para que los compartimentos de
// atributos y operaciones quepan DENTRO del cuerpo.
function posicionar(diagrama, elemento, izquierda, arriba)
{
    return colocar(diagrama, elemento, izquierda, arriba, 220, 150, "");
}

// El actor necesita la forma explicita: sin ella puede quedar con
// ancho y alto cero en un diagrama de clases y no se dibuja.
function posicionarActor(diagrama, elemento, izquierda, arriba)
{
    return colocar(diagrama, elemento, izquierda, arriba, 70, 80, "Actor");
}

// Mide el objeto dibujado: sirve para saber si EA lo creo con tamano cero.
function detalleObjetos(diagrama, elementos)
{
    var salida = "";
    var salto = String.fromCharCode(10);

    for (var i = 0; i < elementos.length; i++) {
        var objeto = buscarObjeto(diagrama, elementos[i]);
        var nombre = elementos[i].Name;
        var tipo = "";

        try { tipo = String(elementos[i].Type); } catch (ignore) { tipo = "?"; }

        if (objeto == null) {
            salida = salida + nombre + " (" + tipo + "): SIN OBJETO" + salto;
            continue;
        }

        var ancho = -1;
        var alto = -1;
        var izq = -1;
        var arr = -1;

        try { ancho = Math.round(objeto.Width); } catch (e1) { }
        try { alto = Math.round(objeto.Height); } catch (e2) { }
        try { izq = Math.round(objeto.Left); } catch (e3) { }
        try { arr = Math.round(objeto.Top); } catch (e4) { }

        if (ancho <= 0 || alto <= 0) {
            tamanoCero = tamanoCero + 1;
        }

        salida = salida + nombre + " (" + tipo + "): " + ancho + "x" + alto +
            " en (" + izq + "," + arr + ")" + salto;
    }

    return salida;
}

function nombreConector(conector)
{
    try { return String(conector.Name || ""); } catch (ignore) { return ""; }
}

// Deja el diagrama con exactamente las relaciones permitidas.
// Recorre solo los enlaces de este diagrama, por lo que no afecta
// a los diagramas de comunicacion.
function depurarRelaciones(diagrama, permitidas)
{
    var eliminadas = 0;

    for (var i = diagrama.DiagramLinks.Count - 1; i >= 0; i--) {
        var enlace = diagrama.DiagramLinks.GetAt(i);
        var conector = null;

        try { conector = Repository.GetElementByID(enlace.ConnectorID); } catch (ignore) { conector = null; }
        if (conector == null) continue;

        if (!contiene(permitidas, nombreConector(conector))) {
            try { conector.Delete(); eliminadas = eliminadas + 1; } catch (ignore) { }
        }
    }

    try { diagrama.DiagramLinks.Refresh(); } catch (ignore) { }
    return eliminadas;
}

function agregarRelacion(diagrama, origen, destino, etiqueta, tipoConector, estereotipoRel, rolOrigen, rolDestino, cardOrigen, cardDestino)
{
    if (origen == null || destino == null) return;

    var usado = tipoConector;
    var conector = null;

    for (var i = 0; i < origen.Connectors.Count; i++) {
        var candidato = origen.Connectors.GetAt(i);
        if (
            candidato.SupplierID == destino.ElementID &&
            nombreConector(candidato) == etiqueta &&
            candidato.Type == usado
        ) {
            conector = candidato;
            break;
        }
    }

    if (conector == null && (usado == "Aggregation" || usado == "Composition")) {
        usado = "Association";
        for (var j = 0; j < origen.Connectors.Count; j++) {
            var alterno = origen.Connectors.GetAt(j);
            if (
                alterno.SupplierID == destino.ElementID &&
                nombreConector(alterno) == etiqueta &&
                alterno.Type == usado
            ) {
                conector = alterno;
                break;
            }
        }
    }

    if (conector == null) {
        try {
            conector = origen.Connectors.AddNew("", usado);
        } catch (primerError) {
            usado = "Association";
            conector = origen.Connectors.AddNew("", usado);
        }

        conector.ClientID = origen.ElementID;
        conector.SupplierID = destino.ElementID;

        conector.Update();
        origen.Connectors.Refresh();
    }

    try { conector.Name = etiqueta; } catch (ignore) { }
    try { conector.Stereotype = estereotipoRel || ""; } catch (ignore) { }
    try { conector.SourceRole = rolOrigen; } catch (ignore) { }
    try { conector.DestinationRole = rolDestino; } catch (ignore) { }
    try { conector.SourceCardinality = cardOrigen; } catch (ignore) { }
    try { conector.DestinationCardinality = cardDestino; } catch (ignore) { }
    try { conector.Direction = usado == "Dependency" ? "SourceToTarget" : "Bidirectional"; } catch (ignore) { }
    try { conector.FontSize = FUENTE_RELACIONES; } catch (ignore) { }
    try { conector.WrapText = true; } catch (ignore) { }

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
    // Cadena de identificacion: si no aparece este texto en el primer
    // aviso, no se esta ejecutando este script.
    mostrarAviso("TIENDAS MONTANO - CU01 ANALISIS DE CLASES v3 - INICIANDO");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "1. Seguridad y Autenticación");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "1. Seguridad y Autenticación");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU01 - Análisis de clases"
        );

        // Los actores viven en un paquete propio como referencias externas.
        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(raiz, "Actores");
        }

        // Limpieza: se borran los diagramas de analisis de clases de CU01
        // que quedaron en cualquier paquete, incluidos los de versiones
        // anteriores, para que sólo exista el diagrama de este script.
        var diagramasBorrados = eliminarDiagramasDeClases(raiz);
        var paquetesBorrados = eliminarPaquetesLegados(paqueteModulo, "análisis de clases", "CU01 - Análisis de clases");

        // Se recrea el paquete destino, que pudo haber sido eliminado antes.
        paqueteDiagrama = obtenerOCrearSubPaquete(paqueteModulo, "CU01 - Análisis de clases");

        var diagrama = crearDiagramaDeClases(
            paqueteDiagrama,
            "CU01 - Análisis de Clases v3 (sin mensajes)"
        );

        // --------------------------------------------------------
        // ACTORES (referencias externas al sistema)
        // --------------------------------------------------------

        var notasActores = {
            "Administrador": "Accede con su correo o CI. Permitido '*' en roles.permisos_json. Destino tras iniciar sesión: /admin.",
            "Encargado de Sucursal": "Accede con su correo o CI. Rol con permisos de inventario, compras, recepciones y reservas. Destino: /admin.",
            "Cajero": "Accede con su correo o CI. Rol con permiso registrar_venta. Destino: /admin.",
            "Cliente": "Accede con su correo. No tiene acciones en este caso de uso. Destino: /."
        };

        var actores = [];
        var k;
        for (k = 0; k < ACTORES_CU01.length; k++) {
            actores[k] = obtenerOCrearActor(
                raiz, paqueteActores,
                ACTORES_CU01[k],
                notasActores[ACTORES_CU01[k]]
            );
        }

        // --------------------------------------------------------
        // CAPA DE INTERFAZ
        // --------------------------------------------------------

        var login = obtenerOCrearClase(
            raiz, paqueteDiagrama, "Login", "Boundary",
            "pages/Login.tsx. Ruta /login. Botón 'Ingresar'. Sin validación de correo con expresión regular.",
            [
                ["credencial", "String"],
                ["password", "String"],
                ["verPassword", "Boolean"],
                ["error", "String"],
                ["enviando", "Boolean"]
            ],
            [
                ["onSubmit", "void", "e: FormEvent"],
                ["render", "JSX.Element", ""]
            ]
        );

        var authProvider = obtenerOCrearClase(
            raiz, paqueteDiagrama, "AuthProvider", "Boundary",
            "contexts/AuthContext.tsx. Guarda access_token y usuario en localStorage.",
            [
                ["usuario", "UsuarioSesion"],
                ["token", "String"],
                ["cargando", "Boolean"]
            ],
            [
                ["login", "UsuarioSesion", "credencial, password"],
                ["logout", "void", ""],
                ["setUsuario", "void", "nuevo"]
            ]
        );

        var api = obtenerOCrearClase(
            raiz, paqueteDiagrama, "api", "Boundary",
            "lib/api.ts. Envía Authorization: Bearer y credentials: 'include'; renueva token ante 401.",
            [
                ["baseUrl", "String = '/api/v1'"]
            ],
            [
                ["login", "LoginResponse", "credencial, password"],
                ["logout", "void", ""],
                ["solicitar", "Response", "url, init, opciones"]
            ]
        );

        var authController = obtenerOCrearClase(
            raiz, paqueteDiagrama, "AuthController", "Control",
            "CTR_Auth.ts. @Controller('auth'). Fija cookies httpOnly access_token y refresh_token (sameSite lax, path '/').",
            [
                ["cookieSecure", "Boolean"]
            ],
            [
                ["login", "AuthResponse", "body, request, response"],
                ["refresh", "AuthResponse", "body, request, response"],
                ["logout", "void", "request, response, currentUser"]
            ]
        );

        var loginRequest = obtenerOCrearClase(
            raiz, paqueteDiagrama, "LoginRequest", "DTO",
            "Esquemas.ts. El cuerpo real es { credencial, password }; acepta email o ci.",
            [
                ["credencial", "String"],
                ["password", "String"]
            ],
            []
        );

        // --------------------------------------------------------
        // CAPA DE SERVICIOS
        // --------------------------------------------------------

        var authService = obtenerOCrearClase(
            raiz, paqueteDiagrama, "AuthService", "Service",
            "SRV_AuthService.ts. Lógica de CU01. Inyecta además EmailService, usado sólo en recuperación de contraseña.",
            [
                ["dataSource", "DataSource"],
                ["jwtTokenService", "JwtTokenService"],
                ["bitacoraService", "BitacoraService"],
                ["seguridadService", "SeguridadService"]
            ],
            [
                ["autenticar", "AuthResponse", "credencial, password, request"],
                ["buscarPorCredencial", "Usuario", "credencial"],
                ["refrescar", "AuthResponse", "request, refresco"],
                ["cerrarSesion", "void", "usuario, token, refreshToken"]
            ]
        );

        var jwtTokenService = obtenerOCrearClase(
            raiz, paqueteDiagrama, "JwtTokenService", "Service",
            "SRV_JWTService.ts. Usa JwtService de @nestjs/jwt. Configurable por JWT_ACCESS_TOKEN_MINUTES y JWT_REFRESH_TOKEN_DAYS.",
            [
                ["accessMinutos", "Number = 15"],
                ["refreshDias", "Number = 7"],
                ["algoritmo", "String = 'HS256'"]
            ],
            [
                ["generarPar", "Par", "subject, rol, permisos"],
                ["crearAccessToken", "String", "subject, rol, permisos"],
                ["crearRefreshToken", "String", "subject"],
                ["verificarRefreshToken", "TokenPayload", "token"],
                ["estaEnBlacklist", "Boolean", "jti"]
            ]
        );

        var seguridadService = obtenerOCrearClase(
            raiz, paqueteDiagrama, "SeguridadService", "Service",
            "SRV_SeguridadService.ts. bcrypt.compare y bcrypt.hash con coste 10.",
            [],
            [
                ["validarPassword", "Boolean", "usuario, password"],
                ["hashearPassword", "String", "password"]
            ]
        );

        var dataSource = obtenerOCrearClase(
            raiz, paqueteDiagrama, "DataSource", "Service",
            "TypeORM DataSource inyectado con @InjectDataSource.",
            [],
            [
                ["getRepository", "Repository", "entidad"],
                ["query", "Array", "sql, params"]
            ]
        );

        var bitacoraService = obtenerOCrearClase(
            raiz, paqueteDiagrama, "BitacoraService", "Service",
            "SRV_BitacoraService.ts. Guarda detalle en texto; no usa new_data para el login.",
            [],
            [
                ["registrar", "BitacoraAuditoria", "idUsuario, accion, tabla, detalle"]
            ]
        );

        // --------------------------------------------------------
        // ESTRUCTURAS DE INTERCAMBIO Y ENTIDADES
        // --------------------------------------------------------

        var authResponse = obtenerOCrearClase(
            raiz, paqueteDiagrama, "AuthResponse", "DTO",
            "Esquemas.ts. La clave es 'usuario', no 'user'; incluye permisos y no incluye avatar.",
            [
                ["access_token", "String"],
                ["refresh_token", "String"],
                ["token_type", "String = 'bearer'"],
                ["usuario", "UsuarioSesion"]
            ],
            []
        );

        var usuario = obtenerOCrearClase(
            raiz, paqueteDiagrama, "Usuario", "Entity",
            "Tabla usuarios. No existe columna usuarios.rol; el rol se obtiene por usuarios_roles. El getter nombre usa clientes o usuarios_empleados.",
            [
                ["id_usuario", "Integer"],
                ["email", "String"],
                ["password_hash", "String"],
                ["estado", "String = 'Pendiente'"],
                ["intentos_fallidos", "Integer = 0"],
                ["bloqueado_hasta", "Timestamp"],
                ["fecha_ultimo_acceso", "Timestamp"]
            ],
            [
                ["get rol", "Rol", ""],
                ["get nombre", "String", ""]
            ]
        );

        var usuarioRol = obtenerOCrearClase(
            raiz, paqueteDiagrama, "UsuarioRol", "Entity",
            "Tabla usuarios_roles. Clave compuesta (id_usuario, id_rol).",
            [
                ["id_usuario", "Integer"],
                ["id_rol", "Integer"]
            ],
            []
        );

        var rol = obtenerOCrearClase(
            raiz, paqueteDiagrama, "Rol", "Entity",
            "Tabla roles. permisos_json alimenta el payload del access_token y las verificaciones de permisos del frontend.",
            [
                ["id_rol", "Integer"],
                ["nombre_rol", "String"],
                ["permisos_json", "JSONB"],
                ["estado", "String = 'Activo'"]
            ],
            []
        );

        var bitacoraAuditoria = obtenerOCrearClase(
            raiz, paqueteDiagrama, "BitacoraAuditoria", "Entity",
            "Tabla bitacora_auditoria. Tiene además old_data y new_data no usados en el login.",
            [
                ["id_bitacora", "Integer"],
                ["id_usuario", "Integer"],
                ["accion_sql", "String"],
                ["tabla_afectada", "String"],
                ["id_registro", "Integer"],
                ["detalle", "Text"],
                ["ip_address", "INET"],
                ["user_agent", "String"],
                ["fecha_hora", "Timestamp"]
            ],
            []
        );

        // --------------------------------------------------------
        // RELACIONES DE ANÁLISIS DE CLASES
        // Nombres de asociación, roles y multiplicidades.
        // Sin mensajes, sin excepciones, sin secuencia.
        // --------------------------------------------------------

        // --- Actores ---
        for (var a = 0; a < actores.length; a++) {
            agregarRelacion(diagrama, actores[a], login,
                "usuario", "Association", "",
                "actor", "pantalla de acceso", "1", "0..1");
        }

        // --- Interfaz ---
        agregarRelacion(diagrama, login, authProvider,
            "sesión de usuario", "Association", "",
            "pantalla", "proveedor de sesión", "1", "1");

        agregarRelacion(diagrama, authProvider, api,
            "cliente HTTP", "Dependency", "uses",
            "consumidor", "cliente HTTP", "1", "1");

        agregarRelacion(diagrama, api, authController,
            "punto de acceso HTTP", "Dependency", "uses",
            "consumidor", "endpoint", "1", "0..1");

        agregarRelacion(diagrama, authController, loginRequest,
            "datos de entrada", "Association", "",
            "controlador", "estructura de entrada", "1", "1");

        // --- Control ---
        agregarRelacion(diagrama, authController, authService,
            "servicio de autenticación", "Association", "",
            "controlador", "servicio", "1", "1");

        agregarRelacion(diagrama, authController, authResponse,
            "datos de salida", "Association", "",
            "controlador", "estructura de salida", "1", "1");

        // --- Servicios ---
        agregarRelacion(diagrama, authService, seguridadService,
            "verificación de contraseña", "Dependency", "uses",
            "autenticador", "verificador", "1", "1");

        agregarRelacion(diagrama, authService, jwtTokenService,
            "emisión de tokens", "Association", "",
            "autenticador", "emisor de tokens", "1", "1");

        agregarRelacion(diagrama, authService, bitacoraService,
            "auditoría de accesos", "Association", "",
            "autenticador", "auditor", "1", "1");

        agregarRelacion(diagrama, authService, dataSource,
            "persistencia", "Dependency", "uses",
            "repositorio", "origen de datos", "1", "1");

        // --- Entidades ---
        agregarRelacion(diagrama, authService, usuario,
            "cuenta autenticada", "Aggregation", "aggregation",
            "autenticador", "usuario", "1", "0..1");

        agregarRelacion(diagrama, authResponse, usuario,
            "datos de sesión", "Dependency", "uses",
            "respuesta", "usuario", "1", "1");

        agregarRelacion(diagrama, usuario, usuarioRol,
            "roles asignados", "Composition", "composition",
            "usuario", "asignación", "1", "0..*");

        agregarRelacion(diagrama, usuarioRol, rol,
            "rol asignado", "Association", "",
            "asignación", "rol", "1", "1");

        agregarRelacion(diagrama, bitacoraService, bitacoraAuditoria,
            "registro de auditoría", "Composition", "composition",
            "auditor", "bitácora", "1", "1");

        agregarRelacion(diagrama, bitacoraAuditoria, usuario,
            "usuario de la acción", "Association", "",
            "bitácora", "usuario", "0..*", "1");

        // Sólo quedan las relaciones admitidas para análisis de clases.
        var eliminadas = depurarRelaciones(diagrama, RELACIONES_VALIDAS);

        // --------------------------------------------------------
        // POSICIONAMIENTO (5 columnas x 4 filas)
        // --------------------------------------------------------

        posicionarActor(diagrama, actores[0], COL_X[0], FILA_Y[0]);
        posicionarActor(diagrama, actores[1], COL_X[1], FILA_Y[0]);
        posicionarActor(diagrama, actores[2], COL_X[2], FILA_Y[0]);
        posicionarActor(diagrama, actores[3], COL_X[3], FILA_Y[0]);

        posicionar(diagrama, login, COL_X[0], FILA_Y[1]);
        posicionar(diagrama, authProvider, COL_X[1], FILA_Y[1]);
        posicionar(diagrama, api, COL_X[2], FILA_Y[1]);
        posicionar(diagrama, authController, COL_X[3], FILA_Y[1]);
        posicionar(diagrama, loginRequest, COL_X[4], FILA_Y[1]);

        posicionar(diagrama, authService, COL_X[0], FILA_Y[2]);
        posicionar(diagrama, jwtTokenService, COL_X[1], FILA_Y[2]);
        posicionar(diagrama, seguridadService, COL_X[2], FILA_Y[2]);
        posicionar(diagrama, dataSource, COL_X[3], FILA_Y[2]);
        posicionar(diagrama, bitacoraService, COL_X[4], FILA_Y[2]);

        posicionar(diagrama, usuario, COL_X[0], FILA_Y[3]);
        posicionar(diagrama, usuarioRol, COL_X[1], FILA_Y[3]);
        posicionar(diagrama, rol, COL_X[2], FILA_Y[3]);
        posicionar(diagrama, authResponse, COL_X[3], FILA_Y[3]);
        posicionar(diagrama, bitacoraAuditoria, COL_X[4], FILA_Y[3]);

        // Verificacion: cada elemento esperado debe tener un objeto
        // dibujado en el diagrama. Lo que falte se informa por nombre.
        tamanoCero = 0;

        var detalleActores = detalleObjetos(diagrama, actores);

        var esperados = [];
        var v;
        for (v = 0; v < actores.length; v++) esperados.push(actores[v]);
        esperados.push(login);
        esperados.push(authProvider);
        esperados.push(api);
        esperados.push(authController);
        esperados.push(loginRequest);
        esperados.push(authService);
        esperados.push(jwtTokenService);
        esperados.push(seguridadService);
        esperados.push(dataSource);
        esperados.push(bitacoraService);
        esperados.push(authResponse);
        esperados.push(usuario);
        esperados.push(usuarioRol);
        esperados.push(rol);
        esperados.push(bitacoraAuditoria);

        var faltantes = "";
        var sinObjeto = 0;
        for (v = 0; v < esperados.length; v++) {
            if (buscarObjeto(diagrama, esperados[v]) == null) {
                sinObjeto = sinObjeto + 1;
                faltantes = faltantes == "" ? "" : faltantes + ", ";
                faltantes = faltantes + esperados[v].Name + " (ID " + esperados[v].ElementID + ", tipo " + esperados[v].Type + ")";
            }
        }

        try {
            diagrama.Notes =
                "Este diagrama es de análisis de clases, por lo que es estático: no contiene mensajes, líneas de vida, secuencia temporal ni casos de uso. Los mensajes y las excepciones de CU01 sólo existen en el diagrama de comunicación de CU01." +
                String.fromCharCode(10) +
                "Composición: 4 actores externos (Administrador, Encargado de Sucursal, Cajero, Cliente) y 15 clases: 3 de interfaz (Boundary), 1 de control (Control), 5 de servicio o infraestructura (Service), 2 estructuras de intercambio (DTO) y 4 entidades (Entity). Los atributos y las operaciones de cada clase son los reales del código y se muestran dentro de la caja; EA dimensiona cada caja automáticamente para que los compartimentos quepan en el cuerpo." +
                String.fromCharCode(10) +
                "Los actores no son clases: son referencias externas al sistema y sólo se asocian a la pantalla Login con el rol 'usuario'. En CU01 los cuatro roles se autentican por igual; lo que los diferencia es el destino de la redirección y los permisos de roles.permisos_json." +
                String.fromCharCode(10) +
                "Relaciones: asociación entre clases de la misma capa o entre servicio y entidad; dependencia con estereotipo uses cuando una clase sólo necesita a otra; agregación para el uso de repositorios (AuthService con Usuario); composición para las partes que no existen sin su todo (Usuario con UsuarioRol, BitacoraService con BitacoraAuditoria). No hay generalización ni especialización: Cliente y UsuarioEmpleado son extensiones de datos de Usuario por asociación opcional, no por herencia." +
                String.fromCharCode(10) +
                "Discrepancias entre el caso de uso y el código real: el caso describe Angular con LoginComponent, AuthService y AuthGuard, y FastAPI; la implementación es React/Vite (Login.tsx, AuthContext.tsx, api.ts) con NestJS (CTR_Auth.ts, SRV_AuthService.ts). No existe AuthGuard ni las rutas /inicio, /sucursal y /caja: Login.tsx navega a /admin para Administrador, Encargado de Sucursal y Cajero, y a / para clientes." +
                String.fromCharCode(10) +
                "El cuerpo real es { credencial, password } y no { email, password }; buscarPorCredencial() acepta LOWER(email) o ci. El access_token dura 15 minutos por JWT_ACCESS_TOKEN_MINUTES y el refresh 7 días por JWT_REFRESH_TOKEN_DAYS, no 8 horas. El payload es { sub, rol, permisos, type, jti, iat, exp } y no incluye email." +
                String.fromCharCode(10) +
                "Almacenamiento: AuthProvider escribe access_token y usuario en localStorage, y AuthController fija además cookies httpOnly access_token y refresh_token con sameSite lax y path /. No existe la cookie session_tt ni sessionStorage, y no hay cliente Flutter." +
                String.fromCharCode(10) +
                "La respuesta usa la clave usuario con { id, nombre, email, rol, permisos } y no incluye avatar. No existe columna usuarios.rol: el rol se obtiene por usuarios_roles." +
                String.fromCharCode(10) +
                "Excepciones reales: usuario inexistente, estado distinto de activo o contraseña incorrecta devuelven 401 Credenciales inválidas. y registran en bitácora el detalle usuario_no_existe, usuario_inactivo o password_incorrecta. No hay 403 de cuenta deshabilitada ni 429 con minutos restantes: una cuenta bloqueada devuelve 423 Locked y no hay countdown. El trigger fn_incrementar_intentos de schema.sql además pone estado Bloqueado, en conflicto con la ventana de 15 minutos, por lo que el usuario bloqueado suele recibir 401 y no 423." +
                String.fromCharCode(10) +
                "Bitácora: registrar() escribe accion_sql, tabla_afectada, id_registro, detalle, ip_address, user_agent y fecha_hora. No se usa new_data con resultado Exitoso ni el nombre registro_id. La postcondición real actualiza intentos_fallidos, bloqueado_hasta y fecha_ultimo_acceso; la columna ultimo_login no se escribe. No hay validación de correo con expresión regular, ni toast, ni botón Reintentar, ni timeout de 10 segundos.";
            diagrama.Update();
        } catch (ignore) {
        }

        try { paqueteDiagrama.Elements.Refresh(); } catch (ignore) { }
        try { paqueteDiagrama.Diagrams.Refresh(); } catch (ignore) { }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        // Reporte de ejecucion: queda escrito en las notas del diagrama,
        // no solo en el popup, para poder leerlo desde Enterprise Architect.
        var reporte =
            "REPORTE DE EJECUCION v3" + String.fromCharCode(10) +
            "Objetos en el diagrama: " + diagrama.DiagramObjects.Count + String.fromCharCode(10) +
            "Elementos esperados: " + esperados.length + String.fromCharCode(10) +
            "Elementos SIN objeto en el diagrama: " + sinObjeto + String.fromCharCode(10) +
            (sinObjeto == 0 ? "  (ninguno)" : "  " + faltantes) + String.fromCharCode(10) +
            "Relaciones en el diagrama: " + diagrama.DiagramLinks.Count + String.fromCharCode(10) +
            "Relaciones eliminadas por no ser de analisis de clases: " + eliminadas + String.fromCharCode(10) +
            "Diagramas de analisis de clases borrados antes: " + diagramasBorrados + String.fromCharCode(10) +
            "Paquetes legados borrados: " + paquetesBorrados + String.fromCharCode(10) +
            (avisos == "" ? "Sin avisos." : "Avisos: " + avisos) + String.fromCharCode(10) +
            "Diagramas CU01 presentes en el modelo:" + String.fromCharCode(10) +
            listarDiagramas(raiz, "CU01", "  ") + String.fromCharCode(10) +
            "MEDIDAS DE LOS ACTORES (ancho x alto en izquierda,arriba):" + String.fromCharCode(10) +
            detalleActores +
            "Objetos con tamano cero: " + tamanoCero;

        agregarNota(diagrama, reporte);

        // Popup corto: WScript.Shell.Popup corta el texto a 1024 caracteres,
        // por eso aqui va solo lo esencial y el resto queda en las notas.
        var resumen =
            "CU01 CLASES v3 - " + diagrama.Name + String.fromCharCode(10) +
            "Objetos: " + diagrama.DiagramObjects.Count + " | SIN objeto: " + sinObjeto +
            " | Tamano cero: " + tamanoCero + String.fromCharCode(10) +
            (sinObjeto == 0 ? "Faltantes: ninguno" : "Faltantes: " + faltantes) + String.fromCharCode(10) +
            (tamanoCero == 0 ? "ACTORES: " + detalleActores.replace(String.fromCharCode(10), " | ") : "ACTORES con tamano CERO") + String.fromCharCode(10) +
            "Reporte completo en las NOTAS del diagrama.";

        mostrarAviso(resumen);
    } catch (e) {
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        mostrarAviso("ERROR: " + detalle);
    }
}

main();
