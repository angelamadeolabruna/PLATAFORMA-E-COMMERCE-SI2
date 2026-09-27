// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU04 - Cambiar Contraseña Propia
// Diagrama de Comunicación compacto.
//
// Source of truth: implementation actual React/Vite + NestJS.
// Los mensajes se agrupan por colaboración para reducir flechas.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "api": "IU_Api",
    "localStorage": "IU_LocalStorage",
    "AuthProvider": "IU_AuthProvider",
    "AuthController": "CTR_Auth",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "UsuarioActual": "CTR_UsuarioActual",
    "CambiarPasswordRequest": "CTR_CambiarPasswordRequest",
    "AuthService": "SRV_AuthService",
    "SeguridadService": "SRV_SeguridadService",
    "JwtTokenService": "SRV_JwtTokenService",
    "DataSource": "SRV_DataSource",
    "Usuario": "CE_Usuario",
    "TokenBlacklist": "CE_TokenBlacklist",
    "BitacoraService": "SRV_BitacoraService",
    "BitacoraAuditoria": "CE_BitacoraAuditoria",
    "ApiError": "IU_ApiError"
};

// 0.45 reduce el lienzo aproximadamente al 45% del tamaño original.
var ESCALA_X = 0.45;
var ESCALA_Y = 0.45;
var ANCHO_MINIMO = 100;
var ALTO_MINIMO = 28;
var FUENTE_PARTICIPANTES = 6;
var FUENTE_MENSAJES = 5;

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Tiendas Montaño - CU04 compacto", 0);
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

    try { actor.Alias = "ACTOR_UsuarioAutenticado"; } catch (ignore) { }
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

        if (
            conector.Type == "Association" &&
            conector.SupplierID == destino.ElementID &&
            nombreConector(conector) == etiqueta
        ) {
            return conector;
        }
    }

    return null;
}

function enlaceExiste(diagrama, conectorId)
{
    for (var i = 0; i < diagrama.DiagramLinks.Count; i++) {
        if (diagrama.DiagramLinks.GetAt(i).ConnectorID == conectorId) {
            return true;
        }
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

        try { conector.Name = etiqueta; } catch (ignore) { }
        try { conector.Message = etiqueta; } catch (ignore) { }
        try { conector.Stereotype = estereotipo || "message"; } catch (ignore) { }
        try { conector.FontSize = FUENTE_MENSAJES; } catch (ignore) { }
        try { conector.WrapText = true; } catch (ignore) { }

        conector.Update();
        origen.Connectors.Refresh();
    }

    if (!enlaceExiste(diagrama, conector.ConnectorID)) {
        var enlace = diagrama.DiagramLinks.AddNew("", "");
        enlace.ConnectorID = conector.ConnectorID;
        enlace.Update();
    }
}

// Agrupa varios mensajes en un solo enlace multilínea.
function agregarMensajes(diagrama, origen, destino, mensajes, estereotipo)
{
    var etiqueta = "";

    for (var i = 0; i < mensajes.length; i++) {
        if (etiqueta != "") etiqueta += "\n";
        etiqueta += mensajes[i];
    }

    agregarMensaje(diagrama, origen, destino, etiqueta, estereotipo);
}

function main()
{
    aviso("Generando CU04 - Diagrama de Comunicación compacto...");

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
            "CU04 - Cambiar Contraseña Propia - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU04 - Cambiar Contraseña Propia - Diagrama de Comunicación Compacto",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario (actor externo)",
            "Usuario autenticado que solicita cambiar su contraseña."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts - cambiarPassword(), solicitar(), handleResponse()"
        );
        var localStorage = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "localStorage", "Object", "Class", "Storage",
            "web/src/lib/api.ts - TOKEN_KEY = 'access_token'"
        );
        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx"
        );
        var authController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthController", "Object", "Class", "Control",
            "api/src/modulos/seguridad/CTR_Auth.ts"
        );
        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts"
        );
        var usuarioActual = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "UsuarioActual", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts"
        );
        var cambiarPasswordRequest = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "CambiarPasswordRequest", "Object", "Class", "Control",
            "api/src/modulos/seguridad/Esquemas.ts"
        );
        var authService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_AuthService.ts"
        );
        var seguridadService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "SeguridadService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_SeguridadService.ts"
        );
        var jwtTokenService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtTokenService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_JWTService.ts"
        );
        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "TypeORM DataSource"
        );
        var usuario = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Usuario", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - usuarios"
        );
        var tokenBlacklist = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "TokenBlacklist", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - token_blacklist"
        );
        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_BitacoraService.ts"
        );
        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraAuditoria", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - bitacora_auditoria"
        );
        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "web/src/lib/api.ts"
        );

        // Layout compacto por columnas de responsabilidad.
        posicionar(diagrama, actor, 20, 250, 210, 310);
        posicionar(diagrama, api, 250, 30, 460, 90);
        posicionar(diagrama, localStorage, 250, 160, 460, 220);
        posicionar(diagrama, authProvider, 250, 290, 460, 350);

        posicionar(diagrama, authController, 560, 30, 770, 90);
        posicionar(diagrama, jwtAuthGuard, 560, 150, 770, 210);
        posicionar(diagrama, usuarioActual, 560, 270, 770, 330);
        posicionar(diagrama, cambiarPasswordRequest, 560, 390, 770, 450);
        posicionar(diagrama, apiError, 560, 510, 770, 570);

        posicionar(diagrama, authService, 880, 30, 1100, 90);
        posicionar(diagrama, seguridadService, 880, 180, 1100, 240);
        posicionar(diagrama, jwtTokenService, 880, 330, 1100, 390);
        posicionar(diagrama, dataSource, 880, 480, 1100, 540);

        posicionar(diagrama, usuario, 1200, 30, 1420, 90);
        posicionar(diagrama, tokenBlacklist, 1200, 180, 1420, 240);
        posicionar(diagrama, bitacoraService, 1200, 330, 1420, 390);
        posicionar(diagrama, bitacoraAuditoria, 1200, 480, 1420, 540);

        // ============================================================
        // FLUJO PRINCIPAL Y COLABORACIONES AGRUPADAS.
        // ============================================================

        agregarMensajes(diagrama, actor, api, [
            "1: cambiarPassword(passwordActual, passwordNueva)"
        ], "message");

        agregarMensajes(diagrama, api, localStorage, [
            "2: getItem(TOKEN_KEY)",
            "3: headers.set('Authorization', `Bearer ${tok}`)"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "4: solicitar('/api/v1/auth/cambiar-password', { method: 'PUT', body: JSON.stringify({ password_actual, password_nueva }) })",
            "5: handleResponse<{ detail: string }>(res)",
            "5a: if (res.status === 401 && renovar) -> renovarToken() y retry"
        ], "message");

        agregarMensajes(diagrama, api, authController, [
            "6: PUT /api/v1/auth/cambiar-password",
            "7: body: { password_actual, password_nueva }",
            "8: return resultado / HTTP 200",
            "E1/E5: HTTP 401",
            "E2: HTTP 400"
        ], "message");

        agregarMensajes(diagrama, authController, jwtAuthGuard, [
            "9: @UseGuards(JwtAuthGuard)",
            "10: canActivate(context)"
        ], "message");

        agregarMensajes(diagrama, jwtAuthGuard, jwtTokenService, [
            "11: verificarAccessToken(token)",
            "12: estaEnBlacklist(payload.jti)"
        ], "message");

        agregarMensajes(diagrama, jwtTokenService, jwtAuthGuard, [
            "13: payload.sub / payload.jti",
            "E5: Token expirado o inválido. / Token revocado."
        ], "return");

        agregarMensajes(diagrama, jwtAuthGuard, usuario, [
            "14: usuarioRepo.findOne({ where: { id_usuario: Number(payload.sub) } })",
            "15: if (usuario.estado.toLowerCase() !== 'activo')"
        ], "message");

        agregarMensajes(diagrama, jwtAuthGuard, authController, [
            "16: request.usuario = usuario; return true"
        ], "return");

        agregarMensajes(diagrama, usuarioActual, authController, [
            "17: return request.usuario"
        ], "return");

        agregarMensajes(diagrama, authController, cambiarPasswordRequest, [
            "18: @IsNotEmpty() / @MinLength(8) / @MaxLength(72)"
        ], "validation");

        agregarMensajes(diagrama, authController, authService, [
            "19: cambiarPassword(currentUser, body, request)"
        ], "message");

        agregarMensajes(diagrama, authService, seguridadService, [
            "20: validarPassword(usuario, body.password_actual)"
        ], "message");

        agregarMensajes(diagrama, seguridadService, authService, [
            "21: bcrypt.compare(password, usuario.password_hash) -> true / false",
            "E1: false -> UnauthorizedException('La contraseña actual es incorrecta.')"
        ], "return");

        agregarMensajes(diagrama, authService, authService, [
            "22: if (body.password_nueva === body.password_actual)",
            "24: usuario.password_hash = nuevoHash",
            "E2: throw HttpException('La nueva contraseña debe ser diferente a la actual.', HttpStatus.BAD_REQUEST)"
        ], "message");

        agregarMensajes(diagrama, seguridadService, authService, [
            "25: bcrypt.hash(password, 10) -> nuevoHash"
        ], "return");

        agregarMensajes(diagrama, authService, dataSource, [
            "26: getRepository(Usuario).save(usuario)",
            "27: getRepository(TokenBlacklist).createQueryBuilder().update(TokenBlacklist).set({ expira_en: ahora }).where('usuario_id = :id').andWhere('expira_en > :ahora').execute()"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuario, [
            "28: Usuario.password_hash = nuevoHash"
        ], "message");

        agregarMensajes(diagrama, dataSource, tokenBlacklist, [
            "29: TokenBlacklist.set({ expira_en: ahora })"
        ], "message");

        agregarMensajes(diagrama, authService, bitacoraService, [
            "30: registrar(usuario.id_usuario, 'UPDATE', 'usuarios', 'Cambio de contraseña', request, usuario.id_usuario)"
        ], "message");

        agregarMensajes(diagrama, bitacoraService, bitacoraAuditoria, [
            "31: repo.save(bitacora)"
        ], "message");

        agregarMensajes(diagrama, authService, authController, [
            "32: return { detail: 'Contraseña actualizada correctamente.' }",
            "E1: throw UnauthorizedException('La contraseña actual es incorrecta.')",
            "E2: throw HttpException('La nueva contraseña debe ser diferente a la actual.', HttpStatus.BAD_REQUEST)"
        ], "return");

        agregarMensajes(diagrama, authController, api, [
            "33: return resultado",
            "34: HTTP 200"
        ], "return");

        agregarMensajes(diagrama, api, apiError, [
            "E1/E2/E5: throw new ApiError(res.status, message)"
        ], "error");

        agregarMensajes(diagrama, api, actor, [
            "35: return { detail: 'Contraseña actualizada correctamente.' }",
            "E1: handleResponse<{ detail: string }>(res) rejects",
            "E2: handleResponse<{ detail: string }>(res) rejects"
        ], "return");

        // El cliente actual no implementa una pantalla Mi Perfil ni un modal
        // para este caso. El método api.cambiarPassword() sí existe.
        agregarMensajes(diagrama, api, localStorage, [
            "E5: si renovarToken() falla -> expulsarSesion()",
            "36: removeItem(TOKEN_KEY); removeItem('usuario')",
            "E5: si renovarToken() tiene éxito -> setItem(TOKEN_KEY, body.access_token)"
        ], "error");

        agregarMensajes(diagrama, api, authProvider, [
            "37: window.dispatchEvent(new CustomEvent('tm:sesion', { detail: { token: null, tipo: 'expirada' } }))",
            "E5: renovarToken() -> dispatchEvent(new CustomEvent('tm:sesion', { detail: { token: body.access_token, usuario: body.usuario, tipo: 'renovada' } }))"
        ], "error");

        agregarMensajes(diagrama, authProvider, authProvider, [
            "38: setToken(null); setUsuarioState(null)"
        ], "error");

        try {
            diagrama.Notes =
                "CU04 - Flujo real del código actual (React/Vite + NestJS).\n" +
                "No existe una ruta /mi-perfil ni un modal de cambio de contraseña en el código web.\n" +
                "El cliente solo define api.cambiarPassword(passwordActual, passwordNueva).\n" +
                "No hay confirmación de contraseña ni validación de fortaleza en el frontend.\n" +
                "El hash real usa bcrypt.hash(password, 10).\n" +
                "El código no actualiza fecha_actualizacion; solo password_hash y TokenBlacklist.expira_en.\n" +
                "No se modifica la tabla Sesion.\n" +
                "El guard puede refrescar el token; si falla, limpia localStorage y no redirige automáticamente.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU04 compacto creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Los mensajes fueron agrupados por colaboración.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error CU04 compacto", 0);
    }
}

main();
