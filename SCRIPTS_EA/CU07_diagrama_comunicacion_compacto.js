// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU07 - Registrar Nuevo Empleado
// Diagrama de Comunicación compacto.
//
// Source of truth: implementation actual React/Vite + NestJS.
// Los mensajes se agrupan por colaboración para reducir flechas.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "RouterApp": "IU_RouterApp",
    "AdminLayout": "IU_AdminLayout",
    "Usuarios": "IU_Usuarios",
    "ModalNuevoEmpleado": "IU_ModalNuevoEmpleado",
    "Toast": "IU_Toast",
    "AuthProvider": "IU_AuthProvider",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "EmpleadosController": "CTR_Empleados",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "UsuarioActual": "CTR_UsuarioActual",
    "RegistrarEmpleadoRequest": "CTR_RegistrarEmpleadoRequest",
    "EmpleadosService": "SRV_EmpleadosService",
    "SeguridadService": "SRV_SeguridadService",
    "JwtTokenService": "SRV_JwtTokenService",
    "EmailService": "SRV_EmailService",
    "DataSource": "SRV_DataSource",
    "Usuario": "CE_Usuario",
    "Rol": "CE_Rol",
    "Sucursal": "CE_Sucursal",
    "UsuarioEmpleado": "CE_UsuarioEmpleado",
    "FirstPasswordToken": "CE_FirstPasswordToken",
    "BitacoraService": "SRV_BitacoraService",
    "BitacoraAuditoria": "CE_BitacoraAuditoria"
};

// 0.40 reduce el lienzo aproximadamente al 40% del tamaño original.
var ESCALA_X = 0.40;
var ESCALA_Y = 0.40;
var ANCHO_MINIMO = 90;
var ALTO_MINIMO = 25;
var FUENTE_PARTICIPANTES = 5;
var FUENTE_MENSAJES = 4;

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Tiendas Montaño - CU07 compacto", 0);
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
    aviso("Generando CU07 - Diagrama de Comunicación compacto...");

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
            "CU07 - Registrar Nuevo Empleado - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU07 - Registrar Nuevo Empleado - Diagrama de Comunicación Compacto",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario (actor externo)",
            "Administrador que registra personal."
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
        var modalNuevoEmpleado = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ModalNuevoEmpleado", "Object", "Class", "Boundary",
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
            "web/src/lib/api.ts - listarEmpleados(), listarSucursalesActivas(), registrarEmpleado()"
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
        var registrarEmpleadoRequest = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RegistrarEmpleadoRequest", "Object", "Class", "Control",
            "api/src/modulos/seguridad/CTR_Empleados.ts"
        );
        var empleadosService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "EmpleadosService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_EmpleadosService.ts"
        );
        var seguridadService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "SeguridadService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_SeguridadService.ts"
        );
        var jwtTokenService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtTokenService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_JWTService.ts"
        );
        var emailService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "EmailService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_EmailService.ts"
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
        var sucursal = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Sucursal", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - sucursales"
        );
        var usuarioEmpleado = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "UsuarioEmpleado", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - usuarios_empleados"
        );
        var firstPasswordToken = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "FirstPasswordToken", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - first_password_tokens"
        );
        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_BitacoraService.ts"
        );
        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraAuditoria", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - bitacora_auditoria"
        );

        // Layout muy compacto por columnas de responsabilidad.
        posicionar(diagrama, actor, 20, 230, 200, 280);
        posicionar(diagrama, routerApp, 240, 20, 440, 75);
        posicionar(diagrama, adminLayout, 240, 120, 440, 175);
        posicionar(diagrama, usuarios, 240, 220, 440, 275);
        posicionar(diagrama, modalNuevoEmpleado, 240, 320, 440, 375);
        posicionar(diagrama, toast, 240, 430, 440, 485);
        posicionar(diagrama, authProvider, 500, 220, 700, 275);

        posicionar(diagrama, api, 760, 20, 960, 75);
        posicionar(diagrama, apiError, 760, 120, 960, 175);
        posicionar(diagrama, empleadosController, 760, 220, 960, 275);

        posicionar(diagrama, jwtAuthGuard, 1020, 20, 1220, 75);
        posicionar(diagrama, usuarioActual, 1020, 120, 1220, 175);
        posicionar(diagrama, registrarEmpleadoRequest, 1020, 220, 1220, 275);

        posicionar(diagrama, empleadosService, 1280, 20, 1500, 75);
        posicionar(diagrama, dataSource, 1280, 130, 1500, 185);
        posicionar(diagrama, seguridadService, 1280, 240, 1500, 295);
        posicionar(diagrama, emailService, 1280, 350, 1500, 405);
        posicionar(diagrama, bitacoraService, 1280, 460, 1500, 515);

        posicionar(diagrama, usuario, 1560, 20, 1760, 75);
        posicionar(diagrama, rol, 1560, 110, 1760, 165);
        posicionar(diagrama, sucursal, 1560, 200, 1760, 255);
        posicionar(diagrama, usuarioEmpleado, 1560, 290, 1760, 345);
        posicionar(diagrama, firstPasswordToken, 1560, 380, 1760, 435);
        posicionar(diagrama, bitacoraAuditoria, 1560, 470, 1760, 525);

        // ============================================================
        // FLUJO PRINCIPAL Y COLABORACIONES AGRUPADAS.
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
            "5: const { usuario, token } = useAuth()"
        ], "message");

        agregarMensajes(diagrama, usuarios, usuarios, [
            "6: permisoOk = permisos.includes('*') || permisos.includes('gestionar_empleados')",
            "7: if (!token) return <Navigate to=\"/login\" replace />",
            "8: if (!permisoOk) return 'Acceso denegado'"
        ], "validation");

        agregarMensajes(diagrama, usuarios, api, [
            "9: Promise.all([api.listarEmpleados(), api.listarSucursalesActivas()])"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "10: solicitar('/api/v1/admin/empleados')",
            "11: solicitar('/api/v1/admin/sucursales/activas')",
            "12: headers.set('Authorization', `Bearer ${tok}`)"
        ], "message");

        agregarMensajes(diagrama, api, empleadosController, [
            "13: GET /api/v1/admin/empleados",
            "14: GET /api/v1/admin/sucursales/activas",
            "15: POST /api/v1/admin/empleados",
            "16: return resultado / HTTP 201 / HTTP 403 / HTTP 409 / HTTP 400"
        ], "message");

        agregarMensajes(diagrama, empleadosController, jwtAuthGuard, [
            "17: @UseGuards(JwtAuthGuard)",
            "18: canActivate(context)"
        ], "message");

        agregarMensajes(diagrama, jwtAuthGuard, jwtTokenService, [
            "19: verificarAccessToken(token)",
            "20: estaEnBlacklist(payload.jti)"
        ], "message");

        agregarMensajes(diagrama, jwtAuthGuard, usuario, [
            "21: usuarioRepo.findOne({ where: { id_usuario: Number(payload.sub) } })",
            "22: usuario.estado.toLowerCase() !== 'activo'"
        ], "message");

        agregarMensajes(diagrama, jwtAuthGuard, empleadosController, [
            "23: request.usuario = usuario; return true"
        ], "return");

        agregarMensajes(diagrama, usuarioActual, empleadosController, [
            "24: return request.usuario"
        ], "return");

        agregarMensajes(diagrama, empleadosController, registrarEmpleadoRequest, [
            "25: @IsString() / @IsEmail() / @IsNumber() / @IsOptional()",
            "26: 'El nombre es obligatorio.' / 'Correo electrónico inválido.' / 'La sucursal es obligatoria.' / 'El rol es obligatorio.'"
        ], "validation");

        agregarMensajes(diagrama, empleadosController, empleadosService, [
            "27: listarEmpleados(currentUser)",
            "28: listarSucursales(currentUser)",
            "29: registrarEmpleado(currentUser, dto, request)"
        ], "message");

        agregarMensajes(diagrama, empleadosService, dataSource, [
            "30: cargarPermisos(usuario)",
            "31: getRepository(Usuario).createQueryBuilder('u').where('LOWER(u.email) = :email')",
            "32: getRepository(Sucursal).createQueryBuilder('s').where('s.id_sucursal = :id').andWhere(\"LOWER(s.estado) = 'activa'\")",
            "33: getRepository(Rol).createQueryBuilder('r').where('LOWER(r.nombre_rol) = LOWER(:nombre)')"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuario, [
            "34: Usuario: email, password_hash, estado: 'Pendiente'",
            "35: cargarPermisos: usuario.roles / roles.rol.permisos_json"
        ], "message");

        agregarMensajes(diagrama, dataSource, sucursal, [
            "36: Sucursal: id_sucursal, estado: 'Activa'",
            "37: listarSucursales: ORDER BY s.nombre ASC"
        ], "message");

        agregarMensajes(diagrama, dataSource, rol, [
            "38: Rol: nombre_rol, permisos_json"
        ], "message");

        agregarMensajes(diagrama, empleadosService, empleadosService, [
            "39a: passwordTemporal = dto.password_temporal ?? this.generarPasswordTemporal()",
            "39b: generarPasswordTemporal() -> 'Tmp#' + 6 caracteres"
        ], "message");

        agregarMensajes(diagrama, empleadosService, seguridadService, [
            "40: hashearPassword(passwordTemporal)"
        ], "message");

        agregarMensajes(diagrama, seguridadService, empleadosService, [
            "40: bcrypt.hash(password, 10) -> passwordHash"
        ], "return");

        agregarMensajes(diagrama, empleadosService, dataSource, [
            "41: getRepository(Usuario).save(nuevoUsuario)",
            "42: insert into usuarios_roles { id_usuario, id_rol }",
            "43: getRepository(UsuarioEmpleado).save(empleado)",
            "44: dataSource.query('SELECT NOW()::timestamp AS \"ahora\"')",
            "45: getRepository(FirstPasswordToken).save(firstToken)"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuarioEmpleado, [
            "45: UsuarioEmpleado: usuario, nombre, telefono, sucursal_id, rol"
        ], "message");

        agregarMensajes(diagrama, dataSource, firstPasswordToken, [
            "46: FirstPasswordToken: usuario_id, token = randomUUID(), expires_at = ahora + 24h, used = false"
        ], "message");

        agregarMensajes(diagrama, empleadosService, emailService, [
            "47: enviarPrimeraContrasena(emailLimpio, token)"
        ], "message");

        agregarMensajes(diagrama, emailService, empleadosService, [
            "48: emailOk = true / false",
            "49: EMAIL_ENABLED=false -> EMAIL SIMULADO; SMTP error -> false"
        ], "return");

        agregarMensajes(diagrama, empleadosService, bitacoraService, [
            "50: registrar(usuario.id_usuario, 'INSERT', 'usuarios', `Empleado registrado: ${dto.nombre} (${emailLimpio}) — rol: ${dto.rol_nombre}`, request, guardado.id_usuario)"
        ], "message");

        agregarMensajes(diagrama, bitacoraService, bitacoraAuditoria, [
            "51: repo.save(bitacora)"
        ], "message");

        agregarMensajes(diagrama, empleadosService, empleadosController, [
            "52: return { detail, usuario_id }",
            "E1: throw ConflictException('Ya existe un usuario con este correo electrónico.')",
            "E2: throw HttpException('La sucursal seleccionada no es válida.', HttpStatus.BAD_REQUEST)",
            "E2b: throw HttpException('El rol seleccionado no es válido.', HttpStatus.BAD_REQUEST)",
            "E4: throw ForbiddenException('No tienes permiso para gestionar usuarios.')"
        ], "return");

        agregarMensajes(diagrama, empleadosController, api, [
            "53: return resultado",
            "54: response HTTP 201"
        ], "return");

        agregarMensajes(diagrama, api, apiError, [
            "E1/E2/E4: throw new ApiError(res.status, message)"
        ], "error");

        agregarMensajes(diagrama, api, usuarios, [
            "55: return EmpleadoItem[] / sucursales activas",
            "56: setEmpleados(emp); setSucursales(suc)",
            "57: setModalAbierto(false); setToast({ mensaje: res.detail, tipo: 'exito' }); cargar()",
            "E1: setErrorModal(err.message)",
            "E2: setErrorModal(err.message)"
        ], "return");

        agregarMensajes(diagrama, usuarios, modalNuevoEmpleado, [
            "58: setModalAbierto(true)",
            "59: <ModalNuevoEmpleado abierto={modalAbierto} ... />"
        ], "message");

        agregarMensajes(diagrama, modalNuevoEmpleado, usuarios, [
            "60: handleSubmit(e)",
            "61: alRegistrar({ nombre, email, telefono, sucursal_id: Number(sucursalId), rol_nombre, password_temporal })"
        ], "message");

        agregarMensajes(diagrama, usuarios, api, [
            "62: api.registrarEmpleado({ nombre, email, telefono, sucursal_id, rol_nombre, password_temporal })"
        ], "message");

        agregarMensajes(diagrama, usuarios, toast, [
            "63: <Toast mensaje={toast.mensaje} tipo={toast.tipo} />"
        ], "message");

        try {
            diagrama.Notes =
                "CU07 - Flujo real del código actual (React/Vite + NestJS).\n" +
                "El permiso real es gestionar_empleados; no se usa gestionar_usuarios.\n" +
                "El hash real usa bcrypt.hash(password, 10), no 12.\n" +
                "El email usa enviarPrimeraContrasena(), no enviarBienvenida().\n" +
                "No existe botón Reenviar Invitación en el código actual.\n" +
                "No hay validación frontend de contraseña débil; el DTO solo marca password_temporal como opcional.\n" +
                "La interfaz usa permisos.includes('*') || permisos.includes('gestionar_empleados').";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU07 compacto creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Los mensajes fueron agrupados por colaboración.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error CU07 compacto", 0);
    }
}

main();
