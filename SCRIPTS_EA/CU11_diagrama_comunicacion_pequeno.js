// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU11 - Consultar Bitácora de Auditoría
// Diagrama de Comunicación con elementos muy pequeños.
//
// Source of truth: implementation actual React/Vite + NestJS.
// Se conservan los mensajes esenciales; los detalles secundarios se agrupan.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "RouterApp": "IU_RouterApp",
    "AdminLayout": "IU_AdminLayout",
    "Auditoria": "IU_Auditoria",
    "AuthProvider": "IU_AuthProvider",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "AdminController": "CTR_Admin",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "UsuarioActual": "CTR_UsuarioActual",
    "AuditoriaService": "SRV_AuditoriaService",
    "JwtTokenService": "SRV_JwtTokenService",
    "DataSource": "SRV_DataSource",
    "Usuario": "CE_Usuario",
    "BitacoraAuditoria": "CE_BitacoraAuditoria",
    "Response": "CTR_Response"
};

var ESCALA_X = 0.30;
var ESCALA_Y = 0.30;
var ANCHO_MINIMO = 55;
var ALTO_MINIMO = 15;
var FUENTE_PARTICIPANTES = 3;
var FUENTE_MENSAJES = 2;

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Tiendas Montaño - CU11", 0);
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

    try { actor.Alias = "ACTOR_Administrador"; } catch (ignore) { }
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

// Agrupa mensajes secundarios para reducir la cantidad de flechas.
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
    aviso("Generando CU11 - Elementos muy pequeños...");

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
            "CU11 - Consultar Bitácora de Auditoría - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU11 - Consultar Bitácora de Auditoría - Diagrama de Comunicación Elementos Muy Pequeños",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario (actor externo)",
            "Administrador que consulta la bitácora."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx"
        );
        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "web/src/components/layout/admin/AdminLayout.tsx"
        );
        var auditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Auditoria", "Object", "Class", "Boundary",
            "web/src/pages/admin/Auditoria.tsx"
        );
        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx"
        );
        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts - listarAuditoria(), exportarAuditoriaCSV(), listarUsuariosEmail()"
        );
        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "web/src/lib/api.ts"
        );
        var adminController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminController", "Object", "Class", "Control",
            "api/src/modulos/seguridad/CTR_Auditoria.ts"
        );
        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts"
        );
        var usuarioActual = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "UsuarioActual", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts"
        );
        var auditoriaService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuditoriaService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_AuditoriaService.ts"
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
        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraAuditoria", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - bitacora_auditoria"
        );
        var response = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Response", "Object", "Class", "Boundary",
            "Express Response para exportación CSV"
        );

        // Elementos muy pequeños.
        posicionar(diagrama, actor, 20, 180, 140, 205);
        posicionar(diagrama, routerApp, 170, 20, 300, 52);
        posicionar(diagrama, adminLayout, 170, 80, 300, 112);
        posicionar(diagrama, auditoria, 170, 140, 300, 172);
        posicionar(diagrama, authProvider, 340, 140, 470, 172);

        posicionar(diagrama, api, 510, 20, 640, 52);
        posicionar(diagrama, apiError, 510, 80, 640, 112);
        posicionar(diagrama, adminController, 510, 140, 640, 172);
        posicionar(diagrama, jwtAuthGuard, 680, 20, 810, 52);
        posicionar(diagrama, usuarioActual, 680, 80, 810, 112);
        posicionar(diagrama, auditoriaService, 850, 20, 980, 52);
        posicionar(diagrama, dataSource, 850, 80, 980, 112);
        posicionar(diagrama, jwtTokenService, 850, 140, 980, 172);

        posicionar(diagrama, usuario, 1020, 20, 1150, 52);
        posicionar(diagrama, bitacoraAuditoria, 1020, 80, 1150, 112);
        posicionar(diagrama, response, 1190, 20, 1320, 52);

        // ============================================================
        // FLUJO ESENCIAL DE CONSULTA DE AUDITORÍA.
        // ============================================================

        agregarMensajes(diagrama, actor, routerApp, [
            "1: /admin/auditoria"
        ], "message");

        agregarMensajes(diagrama, routerApp, adminLayout, [
            "2: <Route path=\"/admin\" element={<AdminLayout />}>",
            "3: <Route path=\"auditoria\" element={<Auditoria />} />"
        ], "message");

        agregarMensajes(diagrama, adminLayout, auditoria, [
            "4: <Outlet /> -> <Auditoria />"
        ], "message");

        agregarMensajes(diagrama, auditoria, authProvider, [
            "5: useAuth() -> usuario / token",
            "6: permisoOk = permisos.includes('*') || permisos.includes('ver_auditoria')"
        ], "message");

        agregarMensajes(diagrama, auditoria, auditoria, [
            "7: filtrosAplicados = { pagina, limite: 20, fecha_desde, fecha_hasta, usuario, tabla, accion }",
            "8: cargar() -> setDatos / setTotal / setTotalPaginas",
            "9: rangoInvalido -> no consultar"
        ], "validation");

        agregarMensajes(diagrama, auditoria, api, [
            "10: api.listarAuditoria(filtrosAplicados)",
            "11: api.listarUsuariosEmail()",
            "12: api.exportarAuditoriaCSV(filtrosAplicados)"
        ], "message");

        agregarMensajes(diagrama, api, adminController, [
            "13: GET /api/v1/admin/auditoria",
            "14: GET /api/v1/admin/usuarios-email",
            "15: format=csv -> exportarAuditoriaCSV()",
            "16: return auditoriaResponse / CSV"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "17: headers.set('Authorization', `Bearer ${tok}`)",
            "18: credentials: 'include'",
            "19: handleResponse<AuditoriaResponse>(res)"
        ], "message");

        agregarMensajes(diagrama, adminController, jwtAuthGuard, [
            "20: @UseGuards(JwtAuthGuard)",
            "21: canActivate(context)"
        ], "message");

        agregarMensajes(diagrama, jwtAuthGuard, jwtTokenService, [
            "22: verificarAccessToken(token)",
            "23: estaEnBlacklist(payload.jti)"
        ], "message");

        agregarMensajes(diagrama, jwtAuthGuard, usuario, [
            "24: usuarioRepo.findOne({ where: { id_usuario: Number(payload.sub) } })"
        ], "message");

        agregarMensajes(diagrama, usuarioActual, adminController, [
            "25: return request.usuario"
        ], "return");

        agregarMensajes(diagrama, adminController, auditoriaService, [
            "26: normalizarFiltros(query)",
            "27: consultar(currentUser, filtros)",
            "28: exportarCSV(currentUser, filtros)",
            "29: listarEmails(currentUser)"
        ], "message");

        agregarMensajes(diagrama, auditoriaService, dataSource, [
            "30: cargarPermisos(usuario) -> usuario.roles / roles.rol.permisos_json",
            "31: getRepository(BitacoraAuditoria).createQueryBuilder('b').leftJoin('usuarios', 'u', ...)",
            "32: where fecha_hora / u.email / tabla_afectada / accion_sql",
            "33: count + orderBy + limit + offset"
        ], "message");

        agregarMensajes(diagrama, dataSource, bitacoraAuditoria, [
            "34: BitacoraAuditoria: id_bitacora, fecha_hora, ip_address, accion_sql, tabla_afectada, id_registro, old_data, new_data"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuario, [
            "35: Usuario.email / Usuario.roles / Rol.permisos_json"
        ], "message");

        agregarMensajes(diagrama, auditoriaService, adminController, [
            "36: return { registros, total, pagina, limite, total_paginas }",
            "E4: sin permisos -> 'No tienes permiso para consultar la bitácora de auditoría.'",
            "E2: dates -> 'El rango de fechas es inválido.'"
        ], "return");

        agregarMensajes(diagrama, adminController, response, [
            "37: response.setHeader('Content-Type', 'text/csv; charset=utf-8')",
            "38: response.setHeader('Content-Disposition', ...)"
        ], "message");

        agregarMensajes(diagrama, adminController, api, [
            "39: return auditoriaResponse / CSV",
            "40: HTTP 200 / HTTP 403 / HTTP 422"
        ], "return");

        agregarMensajes(diagrama, api, apiError, [
            "E2/E4: throw new ApiError(res.status, message)"
        ], "error");

        agregarMensajes(diagrama, api, auditoria, [
            "41: setDatos(res.registros)",
            "42: setTotal / setTotalPaginas / setExpandidoId(null)",
            "43: exportarCSV -> download blob",
            "43a: datos.length === 0 -> 'No se encontraron registros de auditoría.'",
            "E1: setError / setDatos([])",
            "E3: página fuera de rango -> lista vacía"
        ], "return");

        agregarMensajes(diagrama, auditoria, auditoria, [
            "44: datos.map(registro) -> FragmentFila",
            "45: old_data (naranja) / new_data (verde)",
            "46: pagina / totalPaginas -> Anterior / Siguiente"
        ], "message");

        try {
            diagrama.Notes =
                "CU11 - Flujo real del código actual (React/Vite + NestJS).\n" +
                "El permiso real es ver_auditoria o '*'.\n" +
                "La UI usa filtros, paginación y exportación CSV.\n" +
                "Los campos reales usan fecha_hora, email, ip_address e id_registro.\n" +
                "La página fuera de rango devuelve una lista vacía, no un error.\n" +
                "No se usa MatTable/MatDateRangePicker; la implementación actual usa React.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU11 con elementos muy pequeños creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Los mensajes secundarios fueron agrupados.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error CU11", 0);
    }
}

main();
