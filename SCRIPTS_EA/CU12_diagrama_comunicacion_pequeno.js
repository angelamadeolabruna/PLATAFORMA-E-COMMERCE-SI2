// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU12 - Administrar Ciudades y Sucursales
// Diagrama de Comunicación con elementos muy pequeños.
//
// Source of truth: implementación actual React/Vite + NestJS.
// Los mensajes secundarios se agrupan para reducir la cantidad de flechas.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "RouterApp": "IU_RouterApp",
    "AdminLayout": "IU_AdminLayout",
    "Sucursales": "IU_Sucursales",
    "AuthProvider": "IU_AuthProvider",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "SucursalesController": "CTR_Sucursales",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "UsuarioActual": "CTR_UsuarioActual",
    "JwtTokenService": "SRV_JwtTokenService",
    "SucursalesService": "SRV_SucursalesService",
    "DataSource": "SRV_DataSource",
    "Ciudad": "CE_Ciudad",
    "Sucursal": "CE_Sucursal",
    "Usuario": "CE_Usuario",
    "BitacoraService": "SRV_BitacoraService",
    "BitacoraAuditoria": "CE_BitacoraAuditoria",
    "inventario_stock": "CE_InventarioStock"
};

var ESCALA_X = 0.28;
var ESCALA_Y = 0.28;
var ANCHO_MINIMO = 50;
var ALTO_MINIMO = 14;
var FUENTE_PARTICIPANTES = 3;
var FUENTE_MENSAJES = 2;

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Tiendas Montaño - CU12", 0);
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
    aviso("Generando CU12 - Elementos muy pequeños...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "2. Sucursales");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "2. Sucursales");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU12 - Administrar Ciudades y Sucursales - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU12 - Administrar Ciudades y Sucursales - Diagrama de Comunicación Elementos Muy Pequeños",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario (actor externo)",
            "Administrador General que administra ciudades y sucursales."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx"
        );
        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "web/src/components/layout/admin/AdminLayout.tsx"
        );
        var sucursales = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Sucursales", "Object", "Class", "Boundary",
            "web/src/pages/admin/Sucursales.tsx"
        );
        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx"
        );
        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts - ciudades y sucursales"
        );
        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "web/src/lib/api.ts"
        );
        var sucursalesController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "SucursalesController", "Object", "Class", "Control",
            "api/src/modulos/seguridad/CTR_Sucursales.ts"
        );
        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts"
        );
        var usuarioActual = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "UsuarioActual", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts"
        );
        var jwtTokenService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtTokenService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_JWTService.ts"
        );
        var sucursalesService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "SucursalesService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_SucursalesService.ts"
        );
        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "TypeORM DataSource"
        );
        var ciudad = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Ciudad", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - ciudades"
        );
        var sucursal = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Sucursal", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - sucursales"
        );
        var usuario = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Usuario", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - usuarios"
        );
        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_BitacoraService.ts"
        );
        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraAuditoria", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - bitacora_auditoria"
        );
        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Tabla SQL consultada por SRV_SucursalesService.cambiarEstadoSucursal()"
        );

        // Elementos muy pequeños.
        posicionar(diagrama, actor, 20, 190, 120, 215);
        posicionar(diagrama, routerApp, 160, 20, 290, 48);
        posicionar(diagrama, adminLayout, 160, 75, 290, 103);
        posicionar(diagrama, sucursales, 160, 130, 290, 158);
        posicionar(diagrama, authProvider, 320, 130, 450, 158);

        posicionar(diagrama, api, 490, 20, 620, 48);
        posicionar(diagrama, apiError, 490, 75, 620, 103);
        posicionar(diagrama, sucursalesController, 490, 130, 620, 158);
        posicionar(diagrama, jwtAuthGuard, 660, 20, 790, 48);
        posicionar(diagrama, usuarioActual, 660, 75, 790, 103);
        posicionar(diagrama, sucursalesService, 830, 20, 960, 48);
        posicionar(diagrama, dataSource, 1000, 20, 1130, 48);
        posicionar(diagrama, ciudad, 1000, 75, 1130, 103);
        posicionar(diagrama, sucursal, 1000, 130, 1130, 158);
        posicionar(diagrama, jwtTokenService, 1170, 20, 1300, 48);
        posicionar(diagrama, usuario, 1170, 75, 1300, 103);
        posicionar(diagrama, bitacoraService, 1170, 130, 1300, 158);
        posicionar(diagrama, bitacoraAuditoria, 1340, 20, 1470, 48);
        posicionar(diagrama, inventarioStock, 1340, 75, 1470, 103);

        // ============================================================
        // FLUJO ESENCIAL DE CIUDADES Y SUCURSALES.
        // Los detalles de autenticación y operaciones se agrupan.
        // ============================================================

        agregarMensajes(diagrama, actor, routerApp, [
            "1: navega a /admin/sucursales"
        ], "message");

        agregarMensajes(diagrama, routerApp, adminLayout, [
            "2: Route /admin -> <AdminLayout />",
            "3: Route sucursales -> <Sucursales />"
        ], "message");

        agregarMensajes(diagrama, adminLayout, sucursales, [
            "4: <Outlet /> -> <Sucursales />"
        ], "message");

        agregarMensajes(diagrama, sucursales, authProvider, [
            "5: useAuth() -> usuario / token",
            "6: permisoOk = permisos.includes('*') || permisos.includes('gestionar_sucursales')",
            "6a: sin permiso -> 'Acceso denegado'; AdminLayout oculta el menú"
        ], "message");

        agregarMensajes(diagrama, sucursales, sucursales, [
            "7: pestana ciudades / sucursales",
            "8: cargar() -> Promise.all([api.listarCiudades(), api.listarSucursales()])",
            "9: ModalCiudad / ModalSucursal / ModalConfirmarCambio / Toast",
            "10: guardarCiudad() / guardarSucursal() / confirmarCambioEstado()"
        ], "message");

        agregarMensajes(diagrama, sucursales, api, [
            "11: listarCiudades() / listarSucursales()",
            "12: crearCiudad() / actualizarCiudad() / cambiarEstadoCiudad()",
            "13: crearSucursal() / actualizarSucursal() / cambiarEstadoSucursal()"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "14: headers: Authorization = Bearer ${token}",
            "15: credentials: 'include' -> handleResponse()"
        ], "message");

        agregarMensajes(diagrama, api, sucursalesController, [
            "16: GET /api/v1/admin/ciudades | GET /api/v1/admin/sucursales",
            "17: POST /api/v1/admin/ciudades; PUT /api/v1/admin/ciudades/:id; PATCH /api/v1/admin/ciudades/:id/estado",
            "18: POST /api/v1/admin/sucursales; PUT /api/v1/admin/sucursales/:id; PATCH /api/v1/admin/sucursales/:id/estado"
        ], "message");

        agregarMensajes(diagrama, sucursalesController, jwtAuthGuard, [
            "19: @UseGuards(JwtAuthGuard) -> canActivate(context)"
        ], "message");

        agregarMensajes(diagrama, jwtAuthGuard, jwtTokenService, [
            "20: verificarAccessToken(token)",
            "21: estaEnBlacklist(payload.jti)"
        ], "message");

        agregarMensajes(diagrama, jwtAuthGuard, usuario, [
            "22: usuarioRepo.findOne({ where: { id_usuario: Number(payload.sub) } })",
            "23: estado.toLowerCase() === 'activo'"
        ], "message");

        agregarMensajes(diagrama, usuarioActual, sucursalesController, [
            "24: return request.usuario"
        ], "return");

        agregarMensajes(diagrama, sucursalesController, sucursalesService, [
            "25: listarCiudades() / listarSucursales()",
            "26: crearCiudad() / modificarCiudad() / cambiarEstadoCiudad()",
            "27: crearSucursal() / modificarSucursal() / cambiarEstadoSucursal()"
        ], "message");

        agregarMensajes(diagrama, sucursalesService, dataSource, [
            "28: exigirPermiso() -> cargarPermisos()",
            "29: getRepository(Ciudad/Sucursal).save() / updateQueryBuilder()",
            "30: busca Ciudad activa, cuenta sucursales y consulta inventario_stock"
        ], "message");

        agregarMensajes(diagrama, dataSource, ciudad, [
            "31: ciudades: id_ciudad, nombre, departamento, estado"
        ], "message");

        agregarMensajes(diagrama, dataSource, sucursal, [
            "32: sucursales: id_sucursal, nombre, id_ciudad, direccion, telefono, estado, fecha_registro"
        ], "message");

        agregarMensajes(diagrama, dataSource, inventarioStock, [
            "33: COUNT(*) WHERE cantidad_disponible > 0 OR cantidad_reservada > 0"
        ], "validation");

        agregarMensajes(diagrama, dataSource, usuario, [
            "34: Usuario.roles -> Rol.permisos_json"
        ], "message");

        agregarMensajes(diagrama, sucursalesService, bitacoraService, [
            "35: bitacora(accion, tabla, detalle, usuario, request, idRegistro, oldData, newData)",
            "36: INSERT / UPDATE -> registrar(...)"
        ], "message");

        agregarMensajes(diagrama, bitacoraService, bitacoraAuditoria, [
            "37: registrar(...) -> repo.create(bitacora) / repo.save(bitacora)",
            "38: accion_sql, tabla_afectada, id_registro, old_data, new_data, ip_address"
        ], "message");

        agregarMensajes(diagrama, sucursalesService, sucursalesController, [
            "39: return CiudadItem[] / SucursalItem[] / { detail, id_ciudad|id_sucursal }",
            "E1: 409 'La ciudad ya está registrada.'",
            "E2: 400 'La ciudad seleccionada no existe o está inactiva.'",
            "E3: 409 'La sucursal tiene inventario activo. Reubique o agote el stock antes de inhabilitarla.'",
            "E4: 403 'No tienes permiso para gestionar sucursales.'",
            "E5: 409 'La ciudad tiene sucursales activas. Inhabilite primero sus sucursales.'",
            "E6: 404 'Ciudad no encontrada.' / 'Sucursal no encontrada.'"
        ], "return");

        agregarMensajes(diagrama, sucursalesController, api, [
            "40: return CiudadItem[] / SucursalItem[] / detail + id",
            "HTTP 200 / 201 / 400 / 403 / 404 / 409"
        ], "return");

        agregarMensajes(diagrama, api, apiError, [
            "E1-E6: handleResponse() -> throw new ApiError(status, message)"
        ], "error");

        agregarMensajes(diagrama, api, sucursales, [
            "41: setCiudades() / setSucursales()",
            "42: setToast(res.detail); void cargar()",
            "E1-E6: setErrorModal() / setError()"
        ], "return");

        agregarMensajes(diagrama, sucursales, sucursales, [
            "43: renderiza tablas, estado Activa/Inactiva y nro_sucursales",
            "44: nueva sucursal usa solo ciudades Activas",
            "45: operación exitosa -> refresca ambas tablas"
        ], "message");

        try {
            diagrama.Notes =
                "CU12 - Flujo real del código actual (React/Vite + NestJS).\n" +
                "El permiso real es gestionar_sucursales o '*'.\n" +
                "Ciudad.departamento está declarado en CE_Modelos.ts; no se localizó una migración SQL en los archivos inspeccionados.\n" +
                "La entidad permite departamento nullable, pero crear/modificar exige un departamento no vacío.\n" +
                "POST de sucursal exige una ciudad activa; PUT de sucursal solo verifica que id_ciudad exista, no que esté activa.\n" +
                "nro_sucursales cuenta todas las sucursales asociadas, no solo las activas.\n" +
                "inventario_stock se consulta con dataSource.query(); no se importa una clase InventarioStock en este servicio.\n" +
                "No se usa MatTable ni Angular; la UI actual es React.\n" +
                "Las creaciones, modificaciones e inhabilitaciones registran old_data/new_data mediante BitacoraService. ";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU12 con elementos muy pequeños creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Los mensajes secundarios fueron agrupados.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU12", 0);
    }
}

main();
