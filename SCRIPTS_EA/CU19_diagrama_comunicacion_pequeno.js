// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU19 - Inhabilitar/Bloquear Proveedor (Estado de Riesgo)
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
    "AdminProveedores": "IU_AdminProveedores",
    "AuthProvider": "IU_AuthProvider",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "ProveedoresController": "CTR_Proveedores",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "ProveedoresService": "SRV_ProveedoresService",
    "ComprasService": "SRV_ComprasService",
    "DataSource": "SRV_DataSource",
    "proveedores": "CE_Proveedores",
    "ordenes_compra": "CE_OrdenesCompra",
    "BitacoraService": "SRV_BitacoraService",
    "BitacoraAuditoria": "CE_BitacoraAuditoria"
};

var ESCALA_X = 0.27;
var ESCALA_Y = 0.27;
var ANCHO_MINIMO = 48;
var ALTO_MINIMO = 13;
var FUENTE_PARTICIPANTES = 3;
var FUENTE_MENSAJES = 2;

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Tiendas Montaño - CU19", 0);
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
    aviso("Generando CU19 - Elementos muy pequeños...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "5. Proveedores y Compras");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "5. Proveedores y Compras");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU19 - Estado de Riesgo del Proveedor - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU19 - Inhabilitar/Bloquear Proveedor - Diagrama de Comunicación Elementos Muy Pequeños",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario (actor externo)",
            "Administrador General que cambia el estado de riesgo de un proveedor."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx"
        );

        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "web/src/components/layout/admin/AdminLayout.tsx"
        );

        var adminProveedores = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminProveedores", "Object", "Class", "Boundary",
            "web/src/pages/admin/AdminProveedores.tsx"
        );

        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx"
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts - cambiarEstadoProveedor()"
        );

        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "web/src/lib/api.ts"
        );

        var proveedoresController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ProveedoresController", "Object", "Class", "Control",
            "api/src/modulos/proveedores/CTR_Proveedores.ts"
        );

        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts"
        );

        var proveedoresService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ProveedoresService", "Object", "Class", "Service",
            "api/src/modulos/proveedores/SRV_ProveedoresService.ts"
        );

        var comprasService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ComprasService", "Object", "Class", "Service",
            "api/src/modulos/compras/SRV_ComprasService.ts"
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "TypeORM DataSource; SQL directo"
        );

        var proveedores = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "proveedores", "Object", "Class", "Entity",
            "Tabla SQL de proveedores"
        );

        var ordenesCompra = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ordenes_compra", "Object", "Class", "Entity",
            "Tabla SQL de órdenes de compra"
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
        posicionar(diagrama, actor, 20, 190, 120, 215);
        posicionar(diagrama, routerApp, 160, 20, 290, 48);
        posicionar(diagrama, adminLayout, 160, 75, 290, 103);
        posicionar(diagrama, adminProveedores, 160, 130, 290, 158);
        posicionar(diagrama, authProvider, 320, 130, 450, 158);

        posicionar(diagrama, api, 490, 20, 620, 48);
        posicionar(diagrama, apiError, 490, 75, 620, 103);
        posicionar(diagrama, proveedoresController, 490, 130, 620, 158);
        posicionar(diagrama, jwtAuthGuard, 660, 20, 790, 48);
        posicionar(diagrama, proveedoresService, 830, 20, 960, 48);
        posicionar(diagrama, comprasService, 830, 75, 960, 103);
        posicionar(diagrama, dataSource, 1000, 20, 1130, 48);
        posicionar(diagrama, proveedores, 1000, 75, 1130, 103);
        posicionar(diagrama, ordenesCompra, 1000, 130, 1130, 158);
        posicionar(diagrama, bitacoraService, 1170, 20, 1300, 48);
        posicionar(diagrama, bitacoraAuditoria, 1170, 75, 1300, 103);

        // ============================================================
        // FLUJO ESENCIAL DE ESTADO DE RIESGO DEL PROVEEDOR.
        // Las consecuencias para órdenes de compra se agrupan.
        // ============================================================

        agregarMensajes(diagrama, actor, routerApp, [
            "1: navega a /admin/proveedores"
        ], "message");

        agregarMensajes(diagrama, routerApp, adminLayout, [
            "2: Route /admin/proveedores"
        ], "message");

        agregarMensajes(diagrama, adminLayout, adminProveedores, [
            "3: <Outlet /> -> <AdminProveedores />"
        ], "message");

        agregarMensajes(diagrama, adminProveedores, authProvider, [
            "4: useAuth() -> usuario / token",
            "5: permisoOk = permisos.includes('*') || permisos.includes('gestionar_proveedores')",
            "5a: sin permiso -> 'Acceso denegado'; menú y acciones ocultos"
        ], "message");

        agregarMensajes(diagrama, adminProveedores, adminProveedores, [
            "6: MenuAcciones: Activar / Deshabilitar / Bloquear según estado",
            "7: ModalConfirmarEstado muestra consecuencia",
            "8: confirmarEstado() -> api.cambiarEstadoProveedor(id, estado)",
            "9: éxito -> setToast(res.detail); void cargar()"
        ], "message");

        agregarMensajes(diagrama, adminProveedores, api, [
            "10: PATCH /api/v1/proveedores/{id}/estado { estado }"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "11: Authorization: Bearer ${token}; credentials: 'include'",
            "12: handleResponse<{ detail: string }>()"
        ], "message");

        agregarMensajes(diagrama, api, proveedoresController, [
            "13: PATCH /api/v1/proveedores/:id/estado"
        ], "message");

        agregarMensajes(diagrama, proveedoresController, jwtAuthGuard, [
            "14: @UseGuards(JwtAuthGuard); UsuarioActual()",
            "15: JwtTokenService.verificarAccessToken() / estaEnBlacklist()"
        ], "message");

        agregarMensajes(diagrama, proveedoresController, proveedoresService, [
            "16: CambiarEstadoRequest -> cambiarEstado(currentUser, id, estado, request)"
        ], "message");

        agregarMensajes(diagrama, proveedoresService, dataSource, [
            "17: exigirPermiso('gestionar_proveedores')",
            "18: valida ESTADOS_VALIDOS = Activo | Inactivo | Bloqueado",
            "19: SELECT proveedor por id_proveedor",
            "20: si Bloqueado: COUNT(*) ordenes_compra no procesadas",
            "21: UPDATE proveedores SET estado_riesgo = $2",
            "22: bitacora UPDATE con old_data/new_data"
        ], "message");

        agregarMensajes(diagrama, dataSource, proveedores, [
            "23: id_proveedor, nombre_empresa, estado_riesgo"
        ], "message");

        agregarMensajes(diagrama, dataSource, ordenesCompra, [
            "24: estado NOT IN ('procesada','recibida','anulada','cancelada')"
        ], "validation");

        agregarMensajes(diagrama, proveedoresService, bitacoraService, [
            "25: bitacora('UPDATE', 'proveedores', ..., id, {nombre,estado: viejo}, {nombre,estado:nuevo})"
        ], "message");

        agregarMensajes(diagrama, bitacoraService, bitacoraAuditoria, [
            "26: registrar() -> repo.create(bitacora) / repo.save(bitacora)"
        ], "message");

        agregarMensajes(diagrama, proveedoresService, proveedoresController, [
            "27: 200 { detail: 'Proveedor bloqueado.' / 'Proveedor deshabilitado.' / 'Proveedor activado.' }",
            "E1: 409 'El proveedor tiene órdenes de compra pendientes. Procese o anule antes de bloquear.'",
            "E2: 422 'Estado de proveedor no válido.'",
            "E3: 403 'No tienes permiso para gestionar proveedores.'",
            "E4: 404 'Proveedor no encontrado.'"
        ], "return");

        agregarMensajes(diagrama, proveedoresController, api, [
            "28: return { detail }; HTTP 200 / 403 / 404 / 409 / 422"
        ], "return");

        agregarMensajes(diagrama, api, apiError, [
            "E1-E4: handleResponse() -> throw new ApiError(status, message)"
        ], "error");

        agregarMensajes(diagrama, api, adminProveedores, [
            "29: setToast({ mensaje: res.detail, tipo:'exito' }); void cargar()",
            "E1-E4: setErrorEstado() / setError()"
        ], "return");

        agregarMensajes(diagrama, comprasService, dataSource, [
            "30: CU21 validarEncabezado() -> SELECT estado_riesgo",
            "31: estado != Activo -> 409; Bloqueado: 'No se puede crear una orden con un proveedor bloqueado.'"
        ], "validation");

        agregarMensajes(diagrama, adminProveedores, adminProveedores, [
            "32: badge Activo/Inactivo/Bloqueado; ModalConfirmarEstado muestra la consecuencia",
            "33: el estado y el histórico permanecen; el score de CU20 se conserva"
        ], "message");

        try {
            diagrama.Notes =
                "CU19 - Flujo real del código actual (React/Vite + NestJS).\n" +
                "La ruta es /admin/proveedores y el endpoint es PATCH /api/v1/proveedores/{id}/estado.\n" +
                "El estado real se almacena en estado_riesgo, no en estado.\n" +
                "El servicio permite Activo, Inactivo y Bloqueado.\n" +
                "Al bloquear consulta órdenes_compra cuyo estado no está en procesada, recibida, anulada o cancelada.\n" +
                "La bitácora registra old_data/new_data con nombre y estado.\n" +
                "ComprasService vuelve a validar estado_riesgo antes de crear una orden en CU21.\n" +
                "La UI es React; no usa Angular, MatMenu ni MatDialog.\n" +
                "El módulo también contiene CU20 (score) y CU21 (órdenes), fuera del cambio de estado central.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU19 con elementos muy pequeños creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Los mensajes secundarios fueron agrupados.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU19", 0);
    }
}

main();
