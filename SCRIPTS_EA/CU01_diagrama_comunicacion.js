// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU01 - Iniciar Sesión en la Plataforma
// Diagrama de Comunicación generado con el flujo REAL del código actual.
//
// Fuente de verdad:
//   PROTOTIPO/web/src/pages/Login.tsx
//   PROTOTIPO/web/src/components/layout/Navbar.tsx
//   PROTOTIPO/web/src/router.tsx
//   PROTOTIPO/web/src/components/layout/LayoutRaiz.tsx
//   PROTOTIPO/web/src/contexts/AuthContext.tsx
//   PROTOTIPO/web/src/lib/api.ts
//   PROTOTIPO/api/src/modulos/seguridad/CTR_Auth.ts
//   PROTOTIPO/api/src/modulos/seguridad/SRV_AuthService.ts
//   PROTOTIPO/api/src/modulos/seguridad/SRV_SeguridadService.ts
//   PROTOTIPO/api/src/modulos/seguridad/SRV_JWTService.ts
//   PROTOTIPO/api/src/modulos/seguridad/SRV_BitacoraService.ts
//   PROTOTIPO/api/src/modulos/seguridad/CE_Modelos.ts
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
//
// IMPORTANTE:
//   - El script es idempotente: puede ejecutarse varias veces.
//   - Los nombres de clases, funciones y mensajes provienen del código actual.
//   - Si EA no reconoce el tipo Object, usa Class como fallback y conserva
//     el estereotipo (Boundary, Control, Entity, Service, etc.).
//   - La documentación CU01 original menciona Angular/FastAPI/Flutter;
//     este diagrama representa React/Vite + NestJS, que es lo implementado.
// ================================================================

// Alias visibles para conservar la convención PUDS, sin sustituir los
// nombres reales de clases, funciones y métodos del código.
var ALIAS_POR_NOMBRE = {
    "Navbar": "IU_Navbar",
    "RouterApp": "IU_RouterApp",
    "LayoutRaiz": "IU_LayoutRaiz",
    "Login": "IU_Login",
    "AuthContext": "IU_AuthContext",
    "AuthProvider": "IU_AuthProvider",
    "api": "IU_Api",
    "AuthController": "CTR_Auth",
    "Response": "CTR_Response",
    "AuthService": "SRV_AuthService",
    "Usuario": "CE_Usuario",
    "Rol": "CE_Rol",
    "SeguridadService": "SRV_SeguridadService",
    "JwtTokenService": "SRV_JwtTokenService",
    "BitacoraService": "SRV_BitacoraService",
    "BitacoraAuditoria": "CE_BitacoraAuditoria",
    "localStorage": "IU_LocalStorage",
    "esPersonal": "IU_EsPersonal",
    "AdminLayout": "IU_AdminLayout",
    "Home": "IU_Home"
};

// Compactación del lienzo. No modifica participantes, enlaces ni mensajes.
// 0.55 = 55% del tamaño original; usar 0.50 para compactarlo más.
var ESCALA_X = 0.55;
var ESCALA_Y = 0.55;
var ANCHO_MINIMO = 110;
var ALTO_MINIMO = 32;
var FUENTE_PARTICIPANTES = 7;
var FUENTE_MENSAJES = 6;

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Tiendas Montaño - CU01", 0);
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

function buscarElemento(paquete, nombre, tipos)
{
    if (paquete == null) return null;

    for (var i = 0; i < paquete.Elements.Count; i++) {
        var elemento = paquete.Elements.GetAt(i);
        if (elemento.Name == nombre && contiene(tipos, elemento.Type)) {
            return elemento;
        }
    }

    for (var j = 0; j < paquete.Packages.Count; j++) {
        var encontrado = buscarElemento(paquete.Packages.GetAt(j), nombre, tipos);
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
            elemento.Notes = actual == "" ? nota : actual + "\n" + nota;
            elemento.Update();
        }
    } catch (ignore) {
        // Las notas son informativas; no deben impedir crear el diagrama.
    }
}

function obtenerOCrearElemento(raiz, paquete, nombre, tipoPreferido, tipoAlternativo, estereotipo, nota)
{
    var tipos = [tipoPreferido];
    if (tipoAlternativo != null && tipoAlternativo != tipoPreferido) {
        tipos.push(tipoAlternativo);
    }

    var elemento = buscarElemento(raiz, nombre, tipos);
    if (elemento == null) {
        try {
            elemento = paquete.Elements.AddNew(nombre, tipoPreferido);
        } catch (primerError) {
            elemento = paquete.Elements.AddNew(nombre, tipoAlternativo);
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
    try { elemento.Update(); } catch (ignore) { }

    agregarNota(elemento, nota);
    return elemento;
}

function obtenerOCrearActor(raiz, paquete, nombre, nota)
{
    var actor = buscarElemento(raiz, nombre, ["Actor"]);
    if (actor == null) {
        actor = paquete.Elements.AddNew(nombre, "Actor");
        actor.Update();
        paquete.Elements.Refresh();
    }
    try { actor.Alias = "ACTOR_UsuarioNoAutenticado"; } catch (ignore) { }
    try { actor.Update(); } catch (ignore) { }
    agregarNota(actor, nota);
    return actor;
}

function obtenerOCrearDiagrama(paquete, nombre, tipo)
{
    for (var i = 0; i < paquete.Diagrams.Count; i++) {
        var diagrama = paquete.Diagrams.GetAt(i);
        if (diagrama.Name == nombre) return diagrama;
    }

    var nuevo = paquete.Diagrams.AddNew(nombre, tipo);
    nuevo.Update();
    paquete.Diagrams.Refresh();
    return nuevo;
}

function posicionar(diagrama, elemento, izquierda, arriba, derecha, abajo)
{
    var objeto = null;

    for (var i = 0; i < diagrama.DiagramObjects.Count; i++) {
        var candidato = diagrama.DiagramObjects.GetAt(i);
        if (candidato.ElementID == elemento.ElementID) {
            objeto = candidato;
            break;
        }
    }

    // Escala las coordenadas originales del diagrama. Así el flujo y los
    // mensajes permanecen idénticos, pero el lienzo ocupa menos espacio.
    var ancho = Math.max(
        ANCHO_MINIMO,
        Math.round((derecha - izquierda) * ESCALA_X)
    );
    var alto = Math.max(
        ALTO_MINIMO,
        Math.round((abajo - arriba) * ESCALA_Y)
    );
    var nuevaIzquierda = Math.round(izquierda * ESCALA_X);
    var nuevoArriba = Math.round(arriba * ESCALA_Y);
    var nuevaDerecha = nuevaIzquierda + ancho;
    var nuevoAbajo = nuevoArriba + alto;

    if (objeto == null) {
        objeto = diagrama.DiagramObjects.AddNew(
            "l=" + nuevaIzquierda + ";r=" + nuevaDerecha +
            ";t=" + nuevoArriba + ";b=" + nuevoAbajo + ";",
            ""
        );
        objeto.ElementID = elemento.ElementID;
    } else {
        objeto.Left = nuevaIzquierda;
        objeto.Top = nuevoArriba;
        objeto.Right = nuevaDerecha;
        objeto.Bottom = nuevoAbajo;
    }

    // Si la versión de EA admite estas propiedades, reduce el texto de las
    // cajas; los nombres y mensajes no se modifican.
    try { objeto.FontSize = FUENTE_PARTICIPANTES; } catch (ignore) { }
    try { objeto.WrapText = true; } catch (ignore) { }
    try { objeto.ManuallySized = true; } catch (ignore) { }

    objeto.Update();
}

function nombreConector(conector)
{
    try { return String(conector.Name || ""); } catch (ignore) { return ""; }
}

function buscarMensaje(origen, destino, etiqueta)
{
    for (var i = 0; i < origen.Connectors.Count; i++) {
        var conector = origen.Connectors.GetAt(i);
        if (conector.Type == "Association" &&
            conector.SupplierID == destino.ElementID &&
            nombreConector(conector) == etiqueta) {
            return conector;
        }
    }
    return null;
}

function enlaceExiste(diagrama, conectorId)
{
    for (var i = 0; i < diagrama.DiagramLinks.Count; i++) {
        if (diagrama.DiagramLinks.GetAt(i).ConnectorID == conectorId) return true;
    }
    return false;
}

function agregarMensaje(diagrama, origen, destino, etiqueta, estereotipo)
{
    if (origen == null || destino == null) return;

    var conector = buscarMensaje(origen, destino, etiqueta);
    if (conector == null) {
        conector = origen.Connectors.AddNew("", "Association");
        conector.ClientID = origen.ElementID;
        conector.SupplierID = destino.ElementID;

        // EA muestra el nombre del conector como etiqueta en el diagrama.
        try { conector.Name = etiqueta; } catch (ignore) { }
        try { conector.Message = etiqueta; } catch (ignore) { }
        try { conector.Stereotype = estereotipo || "message"; } catch (ignore) { }
        try { conector.FontSize = FUENTE_MENSAJES; } catch (ignore) { }
        try { conector.WrapText = true; } catch (ignore) { }

        conector.Update();
        origen.Connectors.Refresh();
    }

    // Repara una ejecución anterior interrumpida entre conector y enlace.
    if (!enlaceExiste(diagrama, conector.ConnectorID)) {
        var enlace = diagrama.DiagramLinks.AddNew("", "");
        enlace.ConnectorID = conector.ConnectorID;
        enlace.Update();
    }
}

function main()
{
    aviso("Generando CU01 - Diagrama de Comunicación...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteSeguridad = obtenerOCrearSubPaquete(
            paqueteCasosUso,
            "1. Seguridad y Auditoría"
        );

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteSeguridad,
            "CU01 - Iniciar Sesión - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU01 - Iniciar Sesión - Diagrama de Comunicación",
            "Communication"
        );

        // ============================================================
        // PARTICIPANTES: nombres tomados del código actual.
        // ============================================================

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario (actor externo)",
            "Actor externo que intenta acceder a la plataforma."
        );

        var navbar = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Navbar", "Object", "Class", "Boundary",
            "web/src/components/layout/Navbar.tsx"
        );
        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx"
        );
        var layoutRaiz = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "LayoutRaiz", "Object", "Class", "Boundary",
            "web/src/components/layout/LayoutRaiz.tsx"
        );
        var login = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Login", "Object", "Class", "Boundary",
            "web/src/pages/Login.tsx"
        );
        var authContext = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthContext", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx"
        );
        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx"
        );
        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts - login(), solicitar(), handleResponse<LoginResponse>()"
        );
        var authController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthController", "Object", "Class", "Control",
            "api/src/modulos/seguridad/CTR_Auth.ts"
        );
        var response = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Response", "Object", "Class", "Boundary",
            "Express Response usado por AuthController.login"
        );
        var authService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_AuthService.ts"
        );
        var usuario = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Usuario", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - entidad usuarios"
        );
        var rol = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Rol", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - entidad roles"
        );
        var seguridadService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "SeguridadService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_SeguridadService.ts - bcrypt.compare(password, usuario.password_hash)"
        );
        var jwtTokenService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtTokenService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_JWTService.ts - HS256; accessMinutos=15; refreshDias=7"
        );
        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_BitacoraService.ts"
        );
        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraAuditoria", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - entidad bitacora_auditoria"
        );
        var localStorage = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "localStorage", "Object", "Class", "Storage",
            "web/src/contexts/AuthContext.tsx - access_token y usuario"
        );
        var esPersonal = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "esPersonal", "Object", "Class", "Utility",
            "web/src/lib/roles.ts"
        );
        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "web/src/components/layout/admin/AdminLayout.tsx"
        );
        var home = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Home", "Object", "Class", "Boundary",
            "web/src/pages/Home.tsx"
        );

        // ============================================================
        // LAYOUT: columnas por responsabilidad, no por tiempo.
        // ============================================================

        posicionar(diagrama, actor, 30, 300, 250, 360);
        posicionar(diagrama, navbar, 300, 30, 540, 90);
        posicionar(diagrama, routerApp, 300, 150, 540, 210);
        posicionar(diagrama, layoutRaiz, 300, 270, 540, 330);
        posicionar(diagrama, login, 300, 390, 540, 450);
        posicionar(diagrama, authContext, 300, 510, 540, 570);
        posicionar(diagrama, authProvider, 300, 630, 540, 690);
        posicionar(diagrama, esPersonal, 300, 750, 540, 810);

        posicionar(diagrama, api, 650, 70, 900, 130);
        posicionar(diagrama, authController, 650, 290, 900, 350);
        posicionar(diagrama, response, 650, 510, 900, 570);

        posicionar(diagrama, authService, 1000, 70, 1280, 130);
        posicionar(diagrama, seguridadService, 1000, 260, 1280, 320);
        posicionar(diagrama, jwtTokenService, 1000, 410, 1280, 470);
        posicionar(diagrama, bitacoraService, 1000, 570, 1280, 630);

        posicionar(diagrama, usuario, 1380, 70, 1640, 130);
        posicionar(diagrama, rol, 1380, 260, 1640, 320);
        posicionar(diagrama, bitacoraAuditoria, 1380, 570, 1640, 630);
        posicionar(diagrama, localStorage, 1380, 760, 1640, 820);
        posicionar(diagrama, adminLayout, 1710, 240, 1950, 300);
        posicionar(diagrama, home, 1710, 360, 1950, 420);

        // ============================================================
        // MENSAJES DEL FLUJO PRINCIPAL REAL.
        // Los enlaces representan la colaboración; la numeración solo
        // ordena el intercambio y no convierte el diagrama en secuencia.
        // ============================================================

        agregarMensaje(diagrama, navbar, authContext,
            "0: const { usuario, logout } = useAuth(); usuario === null", "message");
        agregarMensaje(diagrama, actor, navbar,
            "1: <Link to=\"/login\">", "message");
        agregarMensaje(diagrama, navbar, routerApp,
            "2: <Link to=\"/login\">", "message");
        agregarMensaje(diagrama, routerApp, layoutRaiz,
            "3: <Route element={<LayoutRaiz />}>", "message");
        agregarMensaje(diagrama, layoutRaiz, login,
            "4: <Outlet />", "message");
        agregarMensaje(diagrama, actor, login,
            "4a: onChange(e) -> setCredencial(...) / setPassword(...)", "message");
        agregarMensaje(diagrama, login, login,
            "4b: if (!credencial.trim() || !password) setError('Ingresa tu correo y contraseña.')", "validation");

        agregarMensaje(diagrama, login, authContext,
            "5: useAuth()", "message");
        agregarMensaje(diagrama, authProvider, authContext,
            "5a: return <AuthContext.Provider value={value}>", "message");
        agregarMensaje(diagrama, login, authProvider,
            "6: login(credencial.trim(), password)", "message");
        agregarMensaje(diagrama, authProvider, api,
            "7: api.login(credencial, password)", "message");
        agregarMensaje(diagrama, api, api,
            "8: solicitar('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ credencial, password }) }, { renovar: false })", "message");
        agregarMensaje(diagrama, api, authController,
            "8a: POST /api/v1/auth/login { credencial, password }", "message");
        agregarMensaje(diagrama, authController, authService,
            "9: autenticar(credencial, password, request)", "message");

        agregarMensaje(diagrama, authService, authService,
            "10: buscarPorCredencial(credencialLimpia)", "message");
        agregarMensaje(diagrama, authService, usuario,
            "11: getRepository(Usuario).createQueryBuilder('usuario').where('LOWER(usuario.email) = :email').orWhere('usuario.ci = :ci').getOne()", "message");
        agregarMensaje(diagrama, usuario, rol,
            "11a: leftJoinAndSelect('roles.rol', 'rol')", "message");
        agregarMensaje(diagrama, authService, seguridadService,
            "12: validarPassword(usuario, password)", "message");
        agregarMensaje(diagrama, authService, jwtTokenService,
            "13: generarPar(usuario.id_usuario, usuario.rol?.nombre_rol ?? null, usuario.rol?.permisos_json ?? [])", "message");
        agregarMensaje(diagrama, authService, usuario,
            "14: getRepository(Usuario).save(usuario)\nintentos_fallidos = 0; bloqueado_hasta = null; fecha_ultimo_acceso = new Date()", "message");
        agregarMensaje(diagrama, authService, bitacoraService,
            "15: registrar(usuario.id_usuario, 'LOGIN', 'usuarios', `Login exitoso del usuario ${usuario.email}`, request)", "message");
        agregarMensaje(diagrama, bitacoraService, bitacoraAuditoria,
            "16: repo.save(bitacora)", "message");

        agregarMensaje(diagrama, authService, authController,
            "17: return AuthResponse", "return");
        agregarMensaje(diagrama, authController, response,
            "18: response.cookie('access_token', resultado.access_token, { httpOnly: true, sameSite: 'lax', secure: this.cookieSecure, maxAge: ..., path: '/' })\nresponse.cookie('refresh_token', resultado.refresh_token, { httpOnly: true, sameSite: 'lax', secure: this.cookieSecure, maxAge: ..., path: '/' })", "message");
        agregarMensaje(diagrama, authController, api,
            "19: return resultado", "return");
        agregarMensaje(diagrama, api, authProvider,
            "20: handleResponse<LoginResponse>(res)", "return");
        agregarMensaje(diagrama, authProvider, authProvider,
            "20a: guardarTokenInvitado(null); setToken(resultado.access_token); setUsuarioState(resultado.usuario)", "message");
        agregarMensaje(diagrama, authProvider, localStorage,
            "21: setItem(TOKEN_KEY, token)\nsetItem(USUARIO_KEY, JSON.stringify(usuario))", "message");
        agregarMensaje(diagrama, authProvider, login,
            "22: return resultado.usuario", "return");

        agregarMensaje(diagrama, login, esPersonal,
            "23: esPersonal(u)", "message");
        agregarMensaje(diagrama, login, routerApp,
            "24: navigate(destino, { replace: true })", "message");
        agregarMensaje(diagrama, routerApp, adminLayout,
            "24a: /admin -> <AdminLayout />", "message");
        agregarMensaje(diagrama, routerApp, layoutRaiz,
            "24b: / -> <LayoutRaiz />", "message");
        agregarMensaje(diagrama, layoutRaiz, home,
            "24c: <Outlet /> -> Home()", "message");

        // ============================================================
        // ALTERNATIVAS Y ERRORES QUE EL CÓDIGO ACTUAL REALMENTE MANEJA.
        // ============================================================

        // Petición directa sin credenciales; Login.onSubmit normalmente
        // se detiene antes en la validación local.
        agregarMensaje(diagrama, authService, authController,
            "E0: throw HttpException('Credencial y contraseña son obligatorias.', HttpStatus.UNPROCESSABLE_ENTITY)", "error");
        agregarMensaje(diagrama, authController, api,
            "E0: HTTP 422", "error");
        agregarMensaje(diagrama, api, authProvider,
            "E0: handleResponse<LoginResponse>(res) throws new ApiError(422, message)", "error");
        agregarMensaje(diagrama, authProvider, login,
            "E0: login() rejects", "error");
        agregarMensaje(diagrama, login, login,
            "E0: else setError(err.message)", "error");

        // Usuario inexistente, inactivo o password incorrecta: todos terminan
        // en 401; el frontend muestra un único mensaje anti-enumeración.
        agregarMensaje(diagrama, authService, bitacoraService,
            "E1a: registrar(null, 'LOGIN_FAILED', 'usuarios', 'usuario_no_existe', request)", "error");
        agregarMensaje(diagrama, authService, bitacoraService,
            "E1b: registrar(usuario.id_usuario, 'LOGIN_FAILED', 'usuarios', 'usuario_inactivo', request)", "error");
        agregarMensaje(diagrama, authService, usuario,
            "E1c: getRepository(Usuario).save(usuario)\nintentos_fallidos += 1; si >= 5: bloqueado_hasta = Date.now() + 15 * 60 * 1000; intentos_fallidos = 0", "error");
        agregarMensaje(diagrama, authService, bitacoraService,
            "E1d: registrar(usuario.id_usuario, 'LOGIN_FAILED', 'usuarios', 'password_incorrecta', request)", "error");
        agregarMensaje(diagrama, bitacoraService, bitacoraAuditoria,
            "E1e: repo.save(bitacora)", "error");
        agregarMensaje(diagrama, authService, authController,
            "E1: throw UnauthorizedException('Credenciales inválidas.')", "error");
        agregarMensaje(diagrama, authController, api,
            "E1: HTTP 401", "error");
        agregarMensaje(diagrama, api, authProvider,
            "E1: handleResponse<LoginResponse>(res) throws new ApiError(401, message)", "error");
        agregarMensaje(diagrama, authProvider, login,
            "E1: login() rejects", "error");
        agregarMensaje(diagrama, login, login,
            "E1: if (err.status === 401) setError('Correo o contraseña incorrectos.')", "error");

        agregarMensaje(diagrama, authService, authController,
            "E2: throw HttpException('Cuenta temporalmente bloqueada. Intenta en unos minutos.', HttpStatus.LOCKED)", "error");
        agregarMensaje(diagrama, authController, api,
            "E2: HTTP 423", "error");
        agregarMensaje(diagrama, api, authProvider,
            "E2: handleResponse<LoginResponse>(res) throws new ApiError(423, message)", "error");
        agregarMensaje(diagrama, authProvider, login,
            "E2: login() rejects", "error");
        agregarMensaje(diagrama, login, login,
            "E2: else setError(err.message)", "error");

        agregarMensaje(diagrama, login, login,
            "E3: setError('No se pudo conectar con el servidor. Intenta de nuevo.')", "error");

        // La especificación original contiene otros frameworks, estados HTTP,
        // nombres de almacenamiento y rutas; aquí prima la implementación.
        try {
            diagrama.Notes =
                "CU01 - Representación del flujo real del código actual (React/Vite + NestJS).\n" +
                "La especificación original menciona Angular/FastAPI/Flutter y otros nombres.\n" +
                "No se agregaron E4/E5 como mensajes de login porque no son el flujo implementado\n" +
                "por Login.onSubmit; se conservan únicamente las alternativas reales del código.";
            diagrama.Update();
        } catch (ignore) { }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso("CU01 creado correctamente.\n\n" +
              "Diagrama: " + diagrama.Name + "\n" +
              "Paquete: " + paqueteDiagrama.Name + "\n\n" +
              "Se utilizaron los nombres y mensajes del código actual.\n" +
              "El script puede ejecutarse nuevamente sin duplicar elementos.");
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error CU01", 0);
    }
}

main();
