// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU09 - Inhabilitar Empleado (Baja Lógica)
// Diagrama de Comunicación con elementos y mensajes muy pequeños.
//
// Source of truth: implementation actual React/Vite + NestJS.
// No se eliminan mensajes: solo se reducen cajas y tipografías.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "RouterApp": "IU_RouterApp",
    "AdminLayout": "IU_AdminLayout",
    "Usuarios": "IU_Usuarios",
    "ModalConfirmarDeshabilitar": "IU_ModalConfirmarDeshabilitar",
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
    "Rol": "CE_Rol",
    "UsuarioRol": "CE_UsuarioRol",
    "UsuarioEmpleado": "CE_UsuarioEmpleado",
    "BitacoraService": "SRV_BitacoraService",
    "BitacoraAuditoria": "CE_BitacoraAuditoria"
};

// Elementos y mensajes muy pequeños.
var ESCALA_X = 0.40;
var ESCALA_Y = 0.40;
var ANCHO_MINIMO = 65;
var ALTO_MINIMO = 18;
var FUENTE_PARTICIPANTES = 4;
var FUENTE_MENSAJES = 3;

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Tiendas Montaño - CU09", 0);
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
    if ( elemento == null || nota == null || nota == "") return;

    try {
        var actual = "";
        try {
            actual = String(elemento.Notes || "");
        } catch (ignore) {
            actual = "";
        }

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

    try {
        elemento.Stereotype = estereotipo;
    } catch (ignore) {
    }

    try {
        if (ALIAS_POR_NOMBRE[nombre] != null) {
            elemento.Alias = ALIAS_POR_NOMBRE[nombre];
        }
    } catch (ignore) {
    }

    try {
        elemento.Update();
    } catch (ignore) {
    }

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

    try {
        actor.Alias = "ACTOR_Administrador";
    } catch (ignore) {
    }

    try {
        actor.Update();
    } catch (ignore) {
    }

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

    try {
        objeto.FontSize = FUENTE_PARTICIPANTES;
    } catch (ignore) {
    }

    try {
        objeto.WrapText = true;
    } catch (ignore) {
    }

    try {
        objeto.ManuallySized = true;
    } catch (ignore) {
    }

    objeto.Update();
}

function nombreConector(conector)
{
    try {
        return String(conector.Name || "");
    } catch (ignore) {
        return "";
    }
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

        try {
            conector.Name = etiqueta;
        } catch (ignore) {
        }

        try {
            conector.Message = etiqueta;
        } catch (ignore) {
        }

        try {
            conector.Stereotype = estereotipo || "message";
        } catch (ignore) {
        }

        try {
            conector.FontSize = FUENTE_MENSAJES;
        } catch (ignore) {
        }

        try {
            conector.WrapText = true;
        } catch (ignore) {
        }

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
function agregarMensajes(diagrama, origen, destino, mensajes, estereotipo)
{
    for (var i = 0; i < mensajes.length; i++) {
        agregarMensaje(diagrama, origen, destino, mensajes[i], estereotipo);
    }
}

function main()
{
    aviso("Generando CU09 - Elementos y mensajes pequeños...");

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
            "CU09 - Inhabilitar Empleado - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU09 - Inhabilitar Empleado - Diagrama de Comunicación Elementos Muy Pequeños",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario (actor externo)",
            "Administrador que deshabilita a un empleado."
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
            raiz, paqueteDiagrama, "ModalConfirmarDeshabilitar", "Object", "Class", "Boundary",
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
            "web/src/lib/api.ts - deshabilitarEmpleado()"
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
        var rol = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Rol", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - roles"
        );
        var usuarioRol = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "UsuarioRol", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - usuarios_roles"
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

        // Cajas más pequeñas, con separación suficiente para leer el flujo.
        posicionar(diagrama, actor, 20, 240, 170, 275);
        posicionar(diagrama, routerApp, 210, 20, 370, 60);
        posicionar(diagrama, adminLayout, 210, 100, 370, 140);
        posicionar(diagrama, usuarios, 210, 180, 370, 220);
        posicionar(diagrama, modalConfirmar, 210, 260, 370, 300);
        posicionar(diagrama, toast, 210, 340, 370, 380);
        posicionar(diagrama, authProvider, 420, 180, 580, 220);

        posicionar(diagrama, api, 630, 20, 790, 60);
        posicionar(diagrama, apiError, 630, 100, 790, 140);
        posicionar(diagrama, empleadosController, 630, 180, 790, 220);
        posicionar(diagrama, jwtAuthGuard, 840, 20, 1000, 60);
        posicionar(diagrama, usuarioActual, 840, 100, 1000, 140);

        posicionar(diagrama, empleadosService, 1050, 20, 1210, 60);
        posicionar(diagrama, dataSource, 1050, 100, 1210, 140);
        posicionar(diagrama, jwtTokenService, 1050, 180, 1210, 220);

        posicionar(diagrama, usuario, 1260, 20, 1420, 60);
        posicionar(diagrama, rol, 1260, 100, 1420, 140);
        posicionar(diagrama, usuarioRol, 1260, 180, 1420, 220);
        posicionar(diagrama, usuarioEmpleado, 1260, 260, 1420, 300);
        posicionar(diagrama, bitacoraService, 1470, 100, 1630, 140);
        posicionar(diagrama, bitacoraAuditoria, 1470, 200, 1630, 240);

        // ============================================================
        // FLUJO REAL DE BAJA LÓGICA.
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
            "5: const { usuario, token } = useAuth()",
            "6: permisoOk = permisos.includes('*') || permisos.includes('gestionar_empleados')"
        ], "message");

        agregarMensajes(diagrama, usuarios, usuarios, [
            "7: if (!token) return <Navigate to=\"/login\" replace />",
            "8: if (!permisoOk) return 'Acceso denegado'",
            "9: useEffect(() => { if (permisoOk && token) cargar() }, [])"
        ], "validation");

        agregarMensajes(diagrama, usuarios, api, [
            "10: api.listarEmpleados()",
            "11: setEmpleados(emp)"
        ], "message");

        agregarMensajes(diagrama, usuarios, usuarios, [
            "12: empleado.estado === 'Activo'",
            "13: onClick={() => setEmpleadoDeshabilitar(emp)}",
            "14: <UserX size={15} /> Deshabilitar"
        ], "message");

        agregarMensajes(diagrama, usuarios, modalConfirmar, [
            "15: <ModalConfirmarDeshabilitar empleado={empleadoDeshabilitar} ... />",
            "16: ¿Deshabilitar a {nombre}? Perderá el acceso al sistema.",
            "17: motivo (opcional)",
            "18: alConfirmar(motivo)"
        ], "message");

        agregarMensajes(diagrama, modalConfirmar, usuarios, [
            "19: motivo.trim() || undefined",
            "20: deshabilitar(motivo)"
        ], "message");

        agregarMensajes(diagrama, usuarios, api, [
            "21: api.deshabilitarEmpleado(empleadoDeshabilitar.id_usuario, motivo.trim() || undefined)"
        ], "message");

        agregarMensajes(diagrama, api, empleadosController, [
            "22: PATCH /api/v1/admin/empleados/{id_usuario}/deshabilitar",
            "23: body: { motivo: motivo || undefined }",
            "24: return resultado / HTTP 200 / HTTP 400 / HTTP 403 / HTTP 404 / HTTP 409"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "25: headers.set('Authorization', `Bearer ${tok}`)",
            "26: credentials: 'include'",
            "27: handleResponse<{ detail: string }>(res)"
        ], "message");

        agregarMensajes(diagrama, empleadosController, jwtAuthGuard, [
            "28: @UseGuards(JwtAuthGuard)",
            "29: canActivate(context)"
        ], "message");

        agregarMensajes(diagrama, jwtAuthGuard, jwtTokenService, [
            "30: verificarAccessToken(token)",
            "31: estaEnBlacklist(payload.jti)"
        ], "message");

        agregarMensajes(diagrama, jwtAuthGuard, usuario, [
            "32: usuarioRepo.findOne({ where: { id_usuario: Number(payload.sub) } })",
            "33: usuario.estado.toLowerCase() !== 'activo'"
        ], "message");

        agregarMensajes(diagrama, usuarioActual, empleadosController, [
            "34: return request.usuario"
        ], "return");

        agregarMensajes(diagrama, empleadosController, empleadosService, [
            "35: inhabilitarEmpleado(currentUser, id, request, body.motivo ?? null)"
        ], "message");

        agregarMensajes(diagrama, empleadosService, dataSource, [
            "36: cargarPermisos(usuario)",
            "37: getRepository(Usuario).createQueryBuilder('u').where('u.id_usuario = :id')",
            "38: update(Usuario).set({ estado: 'Inactivo' }).where('id_usuario = :id').andWhere(\"LOWER(estado) = 'activo'\")",
            "39: update(UsuarioEmpleado).set({ fecha_baja: () => 'NOW()', motivo_baja: motivoLimpio })"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuario, [
            "40: Usuario.estado: 'Activo' -> 'Inactivo'",
            "41: verificar objetivo.id_usuario === usuario.id_usuario",
            "42: objetivo.rol?.nombre_rol === 'Administrador'"
        ], "message");

        agregarMensajes(diagrama, dataSource, rol, [
            "42a: roles.rol / nombre_rol"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuarioRol, [
            "43: leftJoinAndSelect('u.roles', 'roles')",
            "44: leftJoinAndSelect('roles.rol', 'rol')"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuarioEmpleado, [
            "45: fecha_baja = NOW(); motivo_baja = motivoLimpio"
        ], "message");

        agregarMensajes(diagrama, empleadosService, empleadosService, [
            "46: if (!verificarPermiso(permisos, 'gestionar_empleados'))",
            "47: if (!objetivo) -> 'Empleado no encontrado.'",
            "48: if (objetivo.id_usuario === usuario.id_usuario) -> 'No puede deshabilitar su propia cuenta.'",
            "49: if (nombreRol === 'Administrador') -> 'No puede deshabilitar al superadministrador.'",
            "50: if (affected === 0) -> 'El empleado ya está inactivo.'"
        ], "validation");

        agregarMensajes(diagrama, empleadosService, bitacoraService, [
            "51: registrar(usuario.id_usuario, 'UPDATE', 'usuarios', `Empleado deshabilitado: ${objetivo.email}...`, request, idUsuario, { estado: 'Activo' }, { estado: 'Inactivo', fecha_baja: 'NOW()', ... })"
        ], "message");

        agregarMensajes(diagrama, bitacoraService, bitacoraAuditoria, [
            "52: repo.save(bitacora)"
        ], "message");

        agregarMensajes(diagrama, empleadosService, empleadosController, [
            "53: return { detail: 'Empleado deshabilitado.' }",
            "E1: ConflictException('El empleado ya está inactivo.')",
            "E2: HttpException('No puede deshabilitar su propia cuenta.', HttpStatus.BAD_REQUEST)",
            "E3: ForbiddenException('No puede deshabilitar al superadministrador.')",
            "E4: ForbiddenException('No tienes permiso para gestionar usuarios.')",
            "E5: HttpException('Empleado no encontrado.', HttpStatus.NOT_FOUND)"
        ], "return");

        agregarMensajes(diagrama, empleadosController, api, [
            "54: return resultado",
            "55: HTTP 200"
        ], "return");

        agregarMensajes(diagrama, api, apiError, [
            "E1-E5: throw new ApiError(res.status, message)"
        ], "error");

        agregarMensajes(diagrama, api, usuarios, [
            "56: setEmpleadoDeshabilitar(null)",
            "57: setToast({ mensaje: res.detail, tipo: 'exito' })",
            "58: cargar()",
            "E1-E5: setToast({ mensaje: err.message, tipo: 'error' })"
        ], "return");

        agregarMensajes(diagrama, usuarios, toast, [
            "59: <Toast mensaje={toast.mensaje} tipo={toast.tipo} />"
        ], "message");

        agregarMensajes(diagrama, usuarios, usuarios, [
            "60: estado = 'Inactivo'",
            "61: ESTADO_COLORES['Inactivo']",
            "62: botón Rehabilitar"
        ], "return");

        try {
            diagrama.Notes =
                "CU09 - Flujo real del código actual (React/Vite + NestJS).\n" +
                "El permiso real es gestionar_empleados o '*'.\n" +
                "fecha_baja y motivo_baja se actualizan en usuarios_empleados.\n" +
                "El código no revoca explícitamente tokens; JwtAuthGuard rechaza el siguiente request porque estado no es Activo.\n" +
                "Ese rechazo real es 401: 'Tu cuenta está deshabilitada. Contacta al administrador.'\n" +
                "Los registros históricos no se eliminan.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU09 con elementos pequeños creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Se conservaron todos los mensajes del flujo.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error CU09", 0);
    }
}

main();
