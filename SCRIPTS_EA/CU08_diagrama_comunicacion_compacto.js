// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU08 - Asignar/Modificar Roles y Permisos
// Diagrama de Comunicación con elementos y mensajes pequeños.
//
// Source of truth: implementation actual React/Vite + NestJS.
// Se conserva cada mensaje del flujo; solo se reduce el tamaño visual.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "RouterApp": "IU_RouterApp",
    "AdminLayout": "IU_AdminLayout",
    "Roles": "IU_Roles",
    "ModalPermisos": "IU_ModalPermisos",
    "ModalRol": "IU_ModalRol",
    "ModalConfirmar": "IU_ModalConfirmar",
    "Toast": "IU_Toast",
    "AuthProvider": "IU_AuthProvider",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "RolesController": "CTR_Roles",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "UsuarioActual": "CTR_UsuarioActual",
    "ActualizarPermisosRequest": "CTR_ActualizarPermisosRequest",
    "CrearRolRequest": "CTR_CrearRolRequest",
    "ActualizarRolRequest": "CTR_ActualizarRolRequest",
    "RolesService": "SRV_RolesService",
    "JwtTokenService": "SRV_JwtTokenService",
    "DataSource": "SRV_DataSource",
    "Usuario": "CE_Usuario",
    "Rol": "CE_Rol",
    "CATALOGO_PERMISOS": "CE_CATALOGO_PERMISOS",
    "TODOS_PERMISOS": "CE_TODOS_PERMISOS",
    "BitacoraService": "SRV_BitacoraService",
    "BitacoraAuditoria": "CE_BitacoraAuditoria"
};

// Tamaño pequeño de elementos y mensajes, sin eliminar mensajes del flujo.
var ESCALA_X = 0.55;
var ESCALA_Y = 0.55;
var ANCHO_MINIMO = 75;
var ALTO_MINIMO = 20;
var FUENTE_PARTICIPANTES = 5;
var FUENTE_MENSAJES = 4;

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Tiendas Montaño - CU08 compacto", 0);
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

// Conserva cada mensaje del flujo como un mensaje independiente.
// La reducción es únicamente visual: no se eliminan interacciones.
function agregarMensajes(diagrama, origen, destino, mensajes, estereotipo)
{
    for (var i = 0; i < mensajes.length; i++) {
        agregarMensaje(diagrama, origen, destino, mensajes[i], estereotipo);
    }
}

function main()
{
    aviso("Generando CU08 - Diagrama con elementos pequeños...");

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
            "CU08 - Asignar/Modificar Roles y Permisos - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU08 - Asignar/Modificar Roles y Permisos - Diagrama de Comunicación Elementos Pequeños",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario (actor externo)",
            "Administrador que gestiona roles y permisos."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx"
        );
        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "web/src/components/layout/admin/AdminLayout.tsx"
        );
        var roles = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Roles", "Object", "Class", "Boundary",
            "web/src/pages/admin/Roles.tsx"
        );
        var modalPermisos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ModalPermisos", "Object", "Class", "Boundary",
            "web/src/pages/admin/Roles.tsx"
        );
        var modalRol = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ModalRol", "Object", "Class", "Boundary",
            "web/src/pages/admin/Roles.tsx"
        );
        var modalConfirmar = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ModalConfirmar", "Object", "Class", "Boundary",
            "web/src/pages/admin/Roles.tsx"
        );
        var toast = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Toast", "Object", "Class", "Boundary",
            "web/src/pages/admin/Roles.tsx"
        );
        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx"
        );
        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts - roles y permisos"
        );
        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "web/src/lib/api.ts"
        );
        var rolesController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RolesController", "Object", "Class", "Control",
            "api/src/modulos/seguridad/CTR_Roles.ts"
        );
        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts"
        );
        var usuarioActual = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "UsuarioActual", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts"
        );
        var actualizarPermisosRequest = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ActualizarPermisosRequest", "Object", "Class", "Control",
            "api/src/modulos/seguridad/CTR_Roles.ts"
        );
        var crearRolRequest = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "CrearRolRequest", "Object", "Class", "Control",
            "api/src/modulos/seguridad/CTR_Roles.ts"
        );
        var actualizarRolRequest = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ActualizarRolRequest", "Object", "Class", "Control",
            "api/src/modulos/seguridad/CTR_Roles.ts"
        );
        var rolesService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RolesService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_RolesService.ts"
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
        var rol = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Rol", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - roles"
        );
        var catalogoPermisos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "CATALOGO_PERMISOS", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/SRV_RolesService.ts"
        );
        var todosPermisos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "TODOS_PERMISOS", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/SRV_RolesService.ts"
        );
        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_BitacoraService.ts"
        );
        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraAuditoria", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - bitacora_auditoria"
        );

        // Layout muy compacto: 35% del tamaño original.
        posicionar(diagrama, actor, 20, 230, 190, 275);
        posicionar(diagrama, routerApp, 220, 20, 400, 70);
        posicionar(diagrama, adminLayout, 220, 100, 400, 150);
        posicionar(diagrama, roles, 220, 180, 400, 230);
        posicionar(diagrama, modalPermisos, 220, 260, 400, 310);
        posicionar(diagrama, modalRol, 220, 340, 400, 390);
        posicionar(diagrama, modalConfirmar, 220, 420, 400, 470);
        posicionar(diagrama, toast, 220, 500, 400, 550);
        posicionar(diagrama, authProvider, 450, 180, 630, 230);

        posicionar(diagrama, api, 680, 20, 860, 70);
        posicionar(diagrama, apiError, 680, 100, 860, 150);
        posicionar(diagrama, rolesController, 680, 180, 860, 230);
        posicionar(diagrama, actualizarPermisosRequest, 680, 260, 860, 310);
        posicionar(diagrama, crearRolRequest, 680, 340, 860, 390);
        posicionar(diagrama, actualizarRolRequest, 680, 420, 860, 470);

        posicionar(diagrama, jwtAuthGuard, 910, 20, 1090, 70);
        posicionar(diagrama, usuarioActual, 910, 100, 1090, 150);
        posicionar(diagrama, rolesService, 910, 180, 1090, 230);
        posicionar(diagrama, dataSource, 910, 260, 1090, 310);
        posicionar(diagrama, jwtTokenService, 910, 340, 1090, 390);

        posicionar(diagrama, usuario, 1140, 20, 1320, 70);
        posicionar(diagrama, rol, 1140, 100, 1320, 150);
        posicionar(diagrama, catalogoPermisos, 1140, 180, 1320, 230);
        posicionar(diagrama, todosPermisos, 1140, 260, 1320, 310);
        posicionar(diagrama, bitacoraService, 1140, 340, 1320, 390);
        posicionar(diagrama, bitacoraAuditoria, 1140, 420, 1320, 470);

        // ============================================================
        // FLUJO PRINCIPAL AGRUPADO.
        // ============================================================

        agregarMensajes(diagrama, actor, routerApp, [
            "1: /admin/roles"
        ], "message");

        agregarMensajes(diagrama, routerApp, adminLayout, [
            "2: <Route path=\"/admin\" element={<AdminLayout />}>",
            "3: <Route path=\"roles\" element={<Roles />} />"
        ], "message");

        agregarMensajes(diagrama, adminLayout, roles, [
            "4: <Outlet /> -> <Roles />"
        ], "message");

        agregarMensajes(diagrama, roles, authProvider, [
            "5: const { usuario, token } = useAuth()",
            "6: permisoOk = permisos.includes('*') || permisos.includes('gestionar_roles')"
        ], "message");

        agregarMensajes(diagrama, roles, roles, [
            "7: if (!token) return <Navigate to=\"/login\" replace />",
            "8: if (!permisoOk) return 'Acceso denegado'",
            "9: useEffect(() => { if (permisoOk && token) cargar() }, [])"
        ], "validation");

        agregarMensajes(diagrama, roles, api, [
            "10: Promise.all([api.listarRoles(), api.obtenerCatalogoPermisos()])"
        ], "message");

        agregarMensajes(diagrama, api, rolesController, [
            "11: GET /api/v1/admin/roles",
            "12: GET /api/v1/admin/roles/permisos-catalogo",
            "13: GET /api/v1/admin/roles/:rolId/permisos",
            "14: PUT /api/v1/admin/roles/:rolId/permisos",
            "15: POST /api/v1/admin/roles",
            "16: PUT /api/v1/admin/roles/:rolId",
            "17: DELETE /api/v1/admin/roles/:rolId"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "18: headers.set('Authorization', `Bearer ${tok}`)",
            "19: handleResponse(...)"
        ], "message");

        agregarMensajes(diagrama, rolesController, jwtAuthGuard, [
            "20: @UseGuards(JwtAuthGuard)",
            "21: canActivate(context)"
        ], "message");

        agregarMensajes(diagrama, jwtAuthGuard, jwtTokenService, [
            "22: verificarAccessToken(token)",
            "23: estaEnBlacklist(payload.jti)",
            "E8: Token expirado o inválido. / Token revocado. / Usuario no existe."
        ], "message");

        agregarMensajes(diagrama, jwtAuthGuard, usuario, [
            "24: usuarioRepo.findOne({ where: { id_usuario: Number(payload.sub) } })",
            "25: request.usuario = usuario"
        ], "message");

        agregarMensajes(diagrama, usuarioActual, rolesController, [
            "26: return request.usuario"
        ], "return");

        agregarMensajes(diagrama, rolesController, actualizarPermisosRequest, [
            "27: @IsArray() / @ArrayMinSize(0) / @IsString({ each: true })",
            "28: 'Los permisos deben ser un array.'"
        ], "validation");

        agregarMensajes(diagrama, rolesController, crearRolRequest, [
            "29: @IsString() / @IsNotEmpty() / @IsOptional()",
            "30: 'El nombre del rol es obligatorio.'"
        ], "validation");

        agregarMensajes(diagrama, rolesController, actualizarRolRequest, [
            "31: @IsString() / @IsOptional()"
        ], "validation");

        agregarMensajes(diagrama, rolesController, rolesService, [
            "32: listarRoles(currentUser)",
            "33: exigirPermisoPublico(currentUser)",
            "34: obtenerPermisos(currentUser, rolId)",
            "35: actualizarPermisos(currentUser, rolId, permisos, request)",
            "36: crearRol(currentUser, nombre_rol, descripcion, request)",
            "37: actualizarRol(currentUser, rolId, nombre_rol, descripcion, request)",
            "38: eliminarRol(currentUser, rolId, request)"
        ], "message");

        agregarMensajes(diagrama, rolesService, dataSource, [
            "39: cargarPermisos(usuario) -> usuario.roles / roles.rol.permisos_json",
            "40: getRepository(Rol).createQueryBuilder('r')",
            "41: getRepository(Rol).save(rol)",
            "42: getRepository(Rol).remove(rol)",
            "43: SELECT COUNT(*) FROM usuarios_roles",
            "44: crearRol -> { nombre_rol, descripcion, permisos_json: [], estado: 'Activo' }"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuario, [
            "44: Usuario.roles / UsuarioRol / Rol"
        ], "message");

        agregarMensajes(diagrama, dataSource, rol, [
            "45: Rol: id_rol, nombre_rol, descripcion, permisos_json, estado",
            "46: nro_usuarios = COUNT(usuarios_roles)"
        ], "message");

        agregarMensajes(diagrama, rolesService, catalogoPermisos, [
            "47: return { grupos: CATALOGO_PERMISOS }",
            "48: 8 grupos / 21 permisos"
        ], "message");

        agregarMensajes(diagrama, rolesService, todosPermisos, [
            "49: CATALOGO_PERMISOS.flatMap((g) => g.permisos)",
            "50: desconocidos = permisos.filter((p) => !TODOS_PERMISOS.includes(p))",
            "E1: throw HttpException(`Permiso no reconocido: ${desconocidos.join(', ')}.`, HttpStatus.UNPROCESSABLE_ENTITY)"
        ], "validation");

        agregarMensajes(diagrama, rolesService, rolesService, [
            "51: if (!Array.isArray(permisos)) throw HttpException('Formato de permisos inválido.', HttpStatus.BAD_REQUEST)",
            "52: if (rol.id_rol === ROL_ADMIN_ID && !permisos.includes(PERMISO_PROTEGIDO))",
            "53: if (!verificarPermiso(permisos, 'gestionar_roles'))",
            "E5: throw ForbiddenException('El rol Administrador debe conservar el permiso de gestión de roles.')",
            "E7: throw ForbiddenException('No tienes permiso para gestionar roles y permisos.')"
        ], "validation");

        agregarMensajes(diagrama, rolesService, bitacoraService, [
            "53: registrar(usuario.id_usuario, 'UPDATE', 'roles', ..., request, rol.id_rol, { permisos: oldPermisos }, { permisos })",
            "54: registrar(usuario.id_usuario, 'INSERT', 'roles', ..., request, rol.id_rol)",
            "55: registrar(usuario.id_usuario, 'DELETE', 'roles', ..., request, rolId)"
        ], "message");

        agregarMensajes(diagrama, bitacoraService, bitacoraAuditoria, [
            "56: repo.save(bitacora)"
        ], "message");

        agregarMensajes(diagrama, rolesService, rolesController, [
            "57: return { detail: 'Permisos actualizados.' }",
            "58: return { detail: 'Rol ...' }",
            "59: return { detail: 'Rol ...' }",
            "E3: throw ConflictException('No se puede eliminar un rol con usuarios asignados.')",
            "E4: throw HttpException('Rol no encontrado.', HttpStatus.NOT_FOUND)",
            "E5: throw ForbiddenException('El rol Administrador no puede eliminarse.')",
            "E6: throw ConflictException('Ya existe un rol con ese nombre.')"
        ], "return");

        agregarMensajes(diagrama, rolesController, api, [
            "60: return resultado",
            "61: HTTP 200 / HTTP 201 / HTTP 400 / HTTP 401 / HTTP 403 / HTTP 404 / HTTP 409 / HTTP 422"
        ], "return");

        agregarMensajes(diagrama, api, apiError, [
            "E1-E8: throw new ApiError(res.status, message)"
        ], "error");

        agregarMensajes(diagrama, api, roles, [
            "62: setRoles(rs); setGrupos(gruposData.grupos)",
            "63: setModalPermisosRol(...) / setModalRol(...) / setRolEliminar(...)",
            "64: setToast({ mensaje: res.detail, tipo: 'exito' }); cargar()",
            "64a: disabled={rol.id_rol === ROL_ADMIN_ID || rol.nro_usuarios > 0}"
        ], "return");

        agregarMensajes(diagrama, roles, modalPermisos, [
            "65: abrirPermisos(rol)",
            "66: abrirPermisos -> api.obtenerPermisosRol(rol.id_rol)",
            "67: togglePermiso(permiso) / toggleGrupo(grupo)",
            "67a: protegido = rol.id_rol === ROL_ADMIN_ID && permiso === PERMISO_PROTEGIDO",
            "68: Guardar Permisos -> alGuardar(seleccionados)"
        ], "message");

        agregarMensajes(diagrama, modalPermisos, roles, [
            "69: alGuardar(seleccionados)",
            "70: Roles.guardarPermisos(permisos)"
        ], "message");

        agregarMensajes(diagrama, roles, api, [
            "71: api.actualizarPermisosRol(rolId, permisos)",
            "72: api.crearRol(payload) / api.actualizarRol(rolId, payload) / api.eliminarRol(rolId)"
        ], "message");

        agregarMensajes(diagrama, roles, modalRol, [
            "73: Nuevo Rol / Editar Rol",
            "74: handleSubmit(e) -> alGuardar({ nombre_rol, descripcion })"
        ], "message");

        agregarMensajes(diagrama, roles, modalConfirmar, [
            "75: setRolEliminar(rol)",
            "76: alConfirmar() -> eliminar()"
        ], "message");

        agregarMensajes(diagrama, roles, toast, [
            "77: <Toast mensaje={toast.mensaje} tipo={toast.tipo} />"
        ], "message");

        try {
            diagrama.Notes =
                "CU08 - Elementos pequeños; se conserva cada mensaje del flujo.\n" +
                "El permiso real es gestionar_roles o '*'.\n" +
                "El backend carga permisos desde la base en cada request.\n" +
                "El catálogo real tiene 8 grupos y 21 permisos.\n" +
                "La UI protege el checkbox de gestionar_roles del rol Administrador.\n" +
                "El backend relee permisos desde la base en cada request; el estado de permisos del frontend no se refresca solo.\n" +
                "No se usa un AuthGuard de Angular; el acceso se valida en el frontend y RolesService.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU08 con elementos pequeños creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Se conservaron todos los mensajes del flujo.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error CU08", 0);
    }
}

main();
