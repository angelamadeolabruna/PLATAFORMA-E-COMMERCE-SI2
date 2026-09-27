// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU10 - Rehabilitar Empleado
// Diagrama de Comunicación con elementos muy pequeños y mensajes resumidos.
//
// Source of truth: implementation actual React/Vite + NestJS.
// Se conserva la esencia del flujo y se omiten detalles secundarios.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "RouterApp": "IU_RouterApp",
    "AdminLayout": "IU_AdminLayout",
    "Usuarios": "IU_Usuarios",
    "ModalConfirmarRehabilitar": "IU_ModalConfirmarRehabilitar",
    "Toast": "IU_Toast",
    "AuthProvider": "IU_AuthProvider",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "EmpleadosController": "CTR_Empleados",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "UsuarioActual": "CTR_UsuarioActual",
    "EmpleadosService": "SRV_EmpleadosService",
    "JwtTokenService": "SRV_JwtTokenService",
    "DataSource": "SRV_DataSource",
    "Usuario": "CE_Usuario",
    "UsuarioEmpleado": "CE_UsuarioEmpleado",
    "BitacoraService": "SRV_BitacoraService",
    "BitacoraAuditoria": "CE_BitacoraAuditoria"
};

// Elementos muy pequeños.
var ESCALA_X = 0.32;
var ESCALA_Y = 0.32;
var ANCHO_MINIMO = 60;
var ALTO_MINIMO = 16;
var FUENTE_PARTICIPANTES = 3;
var FUENTE_MENSAJES = 2;

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Tiendas Montaño - CU10", 0);
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

// Agrupa detalles secundarios en una sola etiqueta para reducir flechas.
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
    aviso("Generando CU10 - Diagrama con elementos pequeños...");

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
            "CU10 - Rehabilitar Empleado - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU10 - Rehabilitar Empleado - Diagrama de Comunicación Elementos Pequeños",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario (actor externo)",
            "Administrador que rehabilita a un empleado."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx"
        );
        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "web/src/components/layout/admin/AdminLayout.tsx"
        );
        var usuarios = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Usuarios", "Object", "Class", "Boundary",
            "web/src/pages/admin/Usuarios.tsx"
        );
        var modalConfirmar = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ModalConfirmarRehabilitar", "Object", "Class", "Boundary",
            "web/src/pages/admin/Usuarios.tsx"
        );
        var toast = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Toast", "Object", "Class", "Boundary",
            "web/src/pages/admin/Usuarios.tsx"
        );
        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx"
        );
        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts - rehabilitarEmpleado()"
        );
        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "web/src/lib/api.ts"
        );
        var empleadosController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "EmpleadosController", "Object", "Class", "Control",
            "api/src/modulos/seguridad/CTR_Empleados.ts"
        );
        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts"
        );
        var usuarioActual = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "UsuarioActual", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts"
        );
        var empleadosService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "EmpleadosService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_EmpleadosService.ts"
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
        var usuarioEmpleado = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "UsuarioEmpleado", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - usuarios_empleados"
        );
        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_BitacoraService.ts"
        );
        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraAuditoria", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - bitacora_auditoria"
        );

        // Elementos muy pequeños.
        posicionar(diagrama, actor, 20, 180, 150, 210);
        posicionar(diagrama, routerApp, 180, 20, 320, 55);
        posicionar(diagrama, adminLayout, 180, 85, 320, 120);
        posicionar(diagrama, usuarios, 180, 150, 320, 185);
        posicionar(diagrama, modalConfirmar, 180, 215, 320, 250);
        posicionar(diagrama, toast, 180, 280, 320, 315);
        posicionar(diagrama, authProvider, 360, 150, 500, 185);

        posicionar(diagrama, api, 540, 20, 680, 55);
        posicionar(diagrama, apiError, 540, 85, 680, 120);
        posicionar(diagrama, empleadosController, 540, 150, 680, 185);
        posicionar(diagrama, jwtAuthGuard, 720, 20, 860, 55);
        posicionar(diagrama, usuarioActual, 720, 85, 860, 120);

        posicionar(diagrama, empleadosService, 900, 20, 1040, 55);
        posicionar(diagrama, dataSource, 900, 85, 1040, 120);
        posicionar(diagrama, jwtTokenService, 900, 150, 1040, 185);

        posicionar(diagrama, usuario, 1080, 20, 1220, 55);
        posicionar(diagrama, usuarioEmpleado, 1080, 85, 1220, 120);
        posicionar(diagrama, bitacoraService, 1260, 20, 1400, 55);
        posicionar(diagrama, bitacoraAuditoria, 1260, 85, 1400, 120);

        // ============================================================
        // FLUJO RESUMIDO DE REHABILITACIÓN.
        // ============================================================

        agregarMensajes(diagrama, actor, routerApp, [
            "1: /admin/usuarios"
        ], "message");

        agregarMensajes(diagrama, routerApp, adminLayout, [
            "2: <Route path=\"/admin\" element={<AdminLayout />}>",
            "3: <Route path=\"usuarios\" element={<Usuarios />} />"
        ], "message");

        agregarMensajes(diagrama, adminLayout, usuarios, [
            "4: <Outlet /> -> <Usuarios />"
        ], "message");

        agregarMensajes(diagrama, usuarios, authProvider, [
            "5: useAuth() -> usuario / token",
            "6: permisoOk = permisos.includes('*') || permisos.includes('gestionar_empleados')"
        ], "message");

        agregarMensajes(diagrama, usuarios, usuarios, [
            "7: if (!token) -> /login; if (!permisoOk) -> Acceso denegado",
            "8: cargar() -> api.listarEmpleados()",
            "9: empleado.estado === 'Inactivo' -><UserCheck /> Rehabilitar"
        ], "validation");

        agregarMensajes(diagrama, usuarios, modalConfirmar, [
            "10: setEmpleadoRehabilitar(emp)",
            "11: ¿Rehabilitar a {nombre}? Recuperará el acceso al sistema.",
            "12: alConfirmar()"
        ], "message");

        agregarMensajes(diagrama, modalConfirmar, usuarios, [
            "13: rehabilitar()"
        ], "message");

        agregarMensajes(diagrama, usuarios, api, [
            "14: api.rehabilitarEmpleado(empleadoRehabilitar.id_usuario)"
        ], "message");

        agregarMensajes(diagrama, api, empleadosController, [
            "15: PATCH /api/v1/admin/empleados/{id_usuario}/rehabilitar",
            "16: return resultado / HTTP 200 / HTTP 403 / HTTP 404 / HTTP 409"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "17: headers.set('Authorization', `Bearer ${tok}`)",
            "18: credentials: 'include'",
            "19: handleResponse<{ detail: string }>(res)"
        ], "message");

        agregarMensajes(diagrama, empleadosController, jwtAuthGuard, [
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

        agregarMensajes(diagrama, usuarioActual, empleadosController, [
            "25: return request.usuario"
        ], "return");

        agregarMensajes(diagrama, empleadosController, empleadosService, [
            "26: rehabilitarEmpleado(currentUser, id, request)"
        ], "message");

        agregarMensajes(diagrama, empleadosService, dataSource, [
            "27: cargarPermisos(usuario)",
            "28: getRepository(Usuario).createQueryBuilder('u').where('u.id_usuario = :id')",
            "29: update(Usuario).set({ estado: 'Activo' }).where('id_usuario = :id').andWhere(\"LOWER(estado) = 'inactivo'\")",
            "30: update(UsuarioEmpleado).set({ fecha_baja: null, motivo_baja: null })"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuario, [
            "31: Usuario.estado = 'Activo'",
            "32: if (affected === 0) -> 'El empleado no se encuentra inactivo.'"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuarioEmpleado, [
            "33: fecha_baja = null; motivo_baja = null"
        ], "message");

        agregarMensajes(diagrama, empleadosService, bitacoraService, [
            "34: registrar(usuario.id_usuario, 'UPDATE', 'usuarios', `Empleado rehabilitado: ${objetivo.email}`, request, idUsuario)"
        ], "message");

        agregarMensajes(diagrama, bitacoraService, bitacoraAuditoria, [
            "35: repo.save(bitacora)"
        ], "message");

        agregarMensajes(diagrama, empleadosService, empleadosController, [
            "36: return { detail: 'Empleado rehabilitado.' }",
            "E1: ConflictException('El empleado no se encuentra inactivo.')",
            "E2: ForbiddenException('No tienes permiso para gestionar usuarios.')",
            "E3: HttpException('Empleado no encontrado.', HttpStatus.NOT_FOUND)"
        ], "return");

        agregarMensajes(diagrama, empleadosController, api, [
            "37: return resultado",
            "38: HTTP 200"
        ], "return");

        agregarMensajes(diagrama, api, apiError, [
            "E1-E3: throw new ApiError(res.status, message)"
        ], "error");

        agregarMensajes(diagrama, api, usuarios, [
            "39: setEmpleadoRehabilitar(null)",
            "40: setToast({ mensaje: res.detail, tipo: 'exito' })",
            "41: cargar()",
            "E1-E3: setToast({ mensaje: err.message, tipo: 'error' })"
        ], "return");

        agregarMensajes(diagrama, usuarios, toast, [
            "42: <Toast mensaje={toast.mensaje} tipo={toast.tipo} />",
            "43: estado = 'Activo' -> botón Rehabilitar desaparece"
        ], "message");

        try {
            diagrama.Notes =
                "CU10 - Flujo real del código actual (React/Vite + NestJS).\n" +
                "El permiso real es gestionar_empleados o '*'.\n" +
                "No se modifica password_hash, rol, sucursal ni permisos.\n" +
                "fecha_baja y motivo_baja se ponen en NULL en usuarios_empleados.\n" +
                "La bitácora registra la acción, pero en esta implementación no se pasan old_data/new_data.\n" +
                "El empleado inexistente retorna 404; el estado no inactivo retorna 409.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU10 con elementos pequeños creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Se conservaron las interacciones esenciales.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error CU10", 0);
    }
}

main();
