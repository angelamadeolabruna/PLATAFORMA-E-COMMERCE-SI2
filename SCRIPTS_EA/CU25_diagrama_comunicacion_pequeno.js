// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU25 - Configurar Alertas de Stock Mínimo
// Diagrama de Comunicación con elementos muy pequeños.
//
// Fuente de verdad: React/Vite + NestJS + schema.sql.
// Los mensajes secundarios se agrupan para reducir la cantidad de flechas.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "RouterApp": "IU_RouterApp",
    "AdminLayout": "IU_AdminLayout",
    "AdminAlertas": "IU_AdminAlertas",
    "AuthProvider": "IU_AuthProvider",
    "adminMenu": "IU_AdminMenu",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "AlertasController": "CTR_Alertas",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "AlertasService": "SRV_AlertasService",
    "InventarioModule": "SRV_InventarioModule",
    "DataSource": "SRV_DataSource",
    "BitacoraService": "SRV_BitacoraService",
    "roles": "CE_Roles",
    "usuarios_roles": "CE_UsuariosRoles",
    "usuarios_empleados": "CE_UsuariosEmpleados",
    "sucursales": "CE_Sucursales",
    "producto_talla_color": "CE_ProductoTallaColor",
    "productos": "CE_Productos",
    "tallas": "CE_Tallas",
    "colores": "CE_Colores",
    "inventario_stock": "CE_InventarioStock",
    "alertas_stock_config": "CE_AlertasStockConfig",
    "fn_detectar_stock_bajo": "SRV_fn_detectar_stock_bajo",
    "bitacora_auditoria": "CE_BitacoraAuditoria",
    "AdminKardex": "IU_AdminKardex",
    "AdminOrdenesCompra": "IU_AdminOrdenesCompra"
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU25", 0);
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

function obtenerOCrearActor(raiz, paquete, nombre, alias, nota)
{
    var actor = buscarElemento(raiz, nombre, ["Actor"]);

    if (actor == null) {
        actor = paquete.Elements.AddNew(nombre, "Actor");
        actor.Update();
        paquete.Elements.Refresh();
    }

    try { actor.Alias = alias; } catch (ignore) { }
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
    aviso("Generando CU25 - Elementos muy pequeños...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "6. Inventario y Existencias");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "6. Inventario y Existencias");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU25 - Alertas de Stock Mínimo - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU25 - Configurar Alertas de Stock Mínimo - Diagrama de Comunicación Elementos Muy Pequeños",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario Alertas (actor externo)",
            "ACTOR_UsuarioAlertas",
            "Administrador General o Encargado de Sucursal que controla el stock mínimo."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx; Route /admin/inventario/alertas."
        );

        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "web/src/components/layout/admin/AdminLayout.tsx; Outlet y badge de alertas."
        );

        var adminAlertas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminAlertas", "Object", "Class", "Boundary",
            "web/src/pages/admin/AdminAlertas.tsx; panel, modal, filtros y enlaces."
        );

        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx."
        );

        var adminMenu = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "adminMenu", "Object", "Class", "Boundary",
            "web/src/data/adminMenu.ts; permiso gestionar_inventario, implementado:true."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts; obtenerOpcionesAlertas(), listarAlertas(), configurarStockMinimo()."
        );

        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "web/src/lib/api.ts; handleResponse() y errores de validación."
        );

        var alertasController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AlertasController", "Object", "Class", "Control",
            "api/src/modulos/inventario/CTR_Alertas.ts; @Controller('admin/inventario/alertas')."
        );

        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts; @UseGuards(JwtAuthGuard)."
        );

        var alertasService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AlertasService", "Object", "Class", "Service",
            "api/src/modulos/inventario/SRV_AlertasService.ts; opciones, RBAC, alerta y actualización."
        );

        var inventarioModule = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "InventarioModule", "Object", "Class", "Service",
            "api/src/modulos/inventario/inventario.module.ts; registra AlertasController y AlertasService."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "TypeORM DataSource; SQL directo."
        );

        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_BitacoraService.ts; registrar() por cada actualización."
        );

        var roles = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "roles", "Object", "Class", "Entity",
            "Tabla SQL de roles; permisos_json."
        );

        var usuariosRoles = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "usuarios_roles", "Object", "Class", "Entity",
            "Tabla SQL de asignación usuario-rol."
        );

        var usuariosEmpleados = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "usuarios_empleados", "Object", "Class", "Entity",
            "Tabla SQL; sucursal_id y fecha_baja para RBAC."
        );

        var sucursales = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sucursales", "Object", "Class", "Entity",
            "Tabla SQL de sucursales activas."
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Tabla SQL de variantes id_ptc."
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Tabla SQL de productos activos."
        );

        var tallas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "tallas", "Object", "Class", "Entity",
            "Tabla SQL de tallas."
        );

        var colores = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "colores", "Object", "Class", "Entity",
            "Tabla SQL de colores."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Tabla real: stock_minimo_alert, cantidad_disponible, id_ptc, id_sucursal."
        );

        var alertasStockConfig = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "alertas_stock_config", "Object", "Class", "Entity",
            "Tabla SQL de schema; no la usa SRV_AlertasService."
        );

        var fnDetectarStockBajo = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "fn_detectar_stock_bajo", "Object", "Class", "Service",
            "Función SQL de schema; no la invoca SRV_AlertasService."
        );

        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "bitacora_auditoria", "Object", "Class", "Entity",
            "Tabla SQL de auditoría; old_data/new_data por producto."
        );

        var adminKardex = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminKardex", "Object", "Class", "Boundary",
            "web/src/pages/admin/AdminKardex.tsx; destino de Ver Kardex."
        );

        var adminOrdenesCompra = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminOrdenesCompra", "Object", "Class", "Boundary",
            "web/src/pages/admin/AdminOrdenesCompra.tsx; destino de Reordenar."
        );

        // Elementos muy pequeños, organizados por capas.
        posicionar(diagrama, actor, 20, 20, 150, 45);
        posicionar(diagrama, routerApp, 190, 20, 310, 45);
        posicionar(diagrama, adminLayout, 360, 20, 480, 45);
        posicionar(diagrama, adminAlertas, 530, 20, 650, 45);
        posicionar(diagrama, authProvider, 700, 20, 820, 45);

        posicionar(diagrama, adminMenu, 20, 75, 150, 100);
        posicionar(diagrama, api, 190, 75, 310, 100);
        posicionar(diagrama, apiError, 360, 75, 480, 100);
        posicionar(diagrama, alertasController, 530, 75, 650, 100);
        posicionar(diagrama, jwtAuthGuard, 700, 75, 820, 100);

        posicionar(diagrama, alertasService, 20, 130, 150, 155);
        posicionar(diagrama, inventarioModule, 190, 130, 310, 155);
        posicionar(diagrama, dataSource, 360, 130, 480, 155);
        posicionar(diagrama, roles, 530, 130, 650, 155);
        posicionar(diagrama, usuariosRoles, 700, 130, 820, 155);

        posicionar(diagrama, usuariosEmpleados, 20, 185, 150, 210);
        posicionar(diagrama, sucursales, 190, 185, 310, 210);
        posicionar(diagrama, productoTallaColor, 360, 185, 480, 210);
        posicionar(diagrama, productos, 530, 185, 650, 210);
        posicionar(diagrama, tallas, 700, 185, 820, 210);

        posicionar(diagrama, colores, 20, 240, 150, 265);
        posicionar(diagrama, inventarioStock, 190, 240, 310, 265);
        posicionar(diagrama, alertasStockConfig, 360, 240, 480, 265);
        posicionar(diagrama, fnDetectarStockBajo, 530, 240, 650, 265);
        posicionar(diagrama, bitacoraAuditoria, 700, 240, 820, 265);

        posicionar(diagrama, bitacoraService, 20, 295, 150, 320);
        posicionar(diagrama, adminKardex, 190, 295, 310, 320);
        posicionar(diagrama, adminOrdenesCompra, 360, 295, 480, 320);

        // ============================================================
        // FLUJO WEB: LISTADO, BADGE Y CONFIGURACIÓN.
        // ============================================================

        agregarMensajes(diagrama, actor, routerApp, [
            "1: navega a /admin/inventario/alertas"
        ], "message");

        agregarMensajes(diagrama, routerApp, adminLayout, [
            "2: Route /admin/* -> <AdminLayout />"
        ], "message");

        agregarMensajes(diagrama, routerApp, adminAlertas, [
            "3: Route path='inventario/alertas' -> <AdminAlertas />"
        ], "message");

        agregarMensajes(diagrama, adminLayout, authProvider, [
            "4: useAuth() -> usuario / token",
            "sin token -> Navigate('/login'); con token -> <Outlet />"
        ], "message");

        agregarMensajes(diagrama, adminLayout, adminMenu, [
            "5: item Alertas de Stock Mínimo · CU25 · implementado:true",
            "permitido = permisos.includes('*') || permisos.includes('gestionar_inventario')",
            "badge: AdminLayout llama listarAlertas() y muestra nAlertas"
        ], "message");

        agregarMensajes(diagrama, adminAlertas, authProvider, [
            "6: permisoOk = permisos.includes('*') || permisos.includes('gestionar_inventario')",
            "esAdmin = permisos.includes('*')",
            "sin permiso -> 'Acceso denegado'; 'No tienes permiso para gestionar alertas de inventario.'"
        ], "validation");

        agregarMensajes(diagrama, adminAlertas, adminAlertas, [
            "7: cargar() -> Promise.all([obtenerOpcionesAlertas(), listarAlertas(filtro?)])",
            "AdminLayout puede ejecutar otro listarAlertas() para el badge",
            "el badge del layout no tiene polling de alertas"
        ], "message");

        agregarMensajes(diagrama, adminAlertas, api, [
            "8: GET /api/v1/admin/inventario/alertas/opciones",
            "GET /api/v1/admin/inventario/alertas?id_sucursal="
        ], "message");

        agregarMensajes(diagrama, api, alertasController, [
            "9: GET /admin/inventario/alertas/opciones",
            "GET /admin/inventario/alertas"
        ], "message");

        agregarMensajes(diagrama, alertasController, jwtAuthGuard, [
            "10: @UseGuards(JwtAuthGuard); UsuarioActual()"
        ], "message");

        agregarMensajes(diagrama, alertasController, alertasService, [
            "11: obtenerOpciones(currentUser)",
            "12: listar(currentUser, idSucursal?)"
        ], "message");

        agregarMensajes(diagrama, alertasService, dataSource, [
            "13: exigirPermiso('gestionar_inventario')",
            "14: sucursalEncargado() para Encargado; admin puede filtrar",
            "15: productos y sucursales activas para opciones"
        ], "message");

        agregarMensajes(diagrama, dataSource, roles, [
            "16: SELECT r.permisos_json mediante usuarios + usuarios_roles + roles"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuariosRoles, [
            "17: JOIN usuarios_roles para permisos del usuario"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuariosEmpleados, [
            "18: SELECT sucursal_id WHERE usuario_id=$1 AND fecha_baja IS NULL"
        ], "message");

        agregarMensajes(diagrama, dataSource, sucursales, [
            "19: admin: sucursales activas; no-admin: sucursal asignada"
        ], "message");

        agregarMensajes(diagrama, dataSource, productoTallaColor, [
            "20: opciones de producto: id_ptc, nombre, talla, color"
        ], "message");

        agregarMensajes(diagrama, dataSource, productos, [
            "21: JOIN productos; WHERE LOWER(estado)='activo'"
        ], "message");

        agregarMensajes(diagrama, dataSource, tallas, [
            "22: JOIN tallas; ORDER BY t.orden"
        ], "message");

        agregarMensajes(diagrama, dataSource, colores, [
            "23: JOIN colores"
        ], "message");

        agregarMensajes(diagrama, alertasService, alertasController, [
            "24: return { sucursales, productos }"
        ], "return");

        agregarMensajes(diagrama, alertasController, api, [
            "25: return opciones; HTTP 200"
        ], "return");

        agregarMensajes(diagrama, api, adminAlertas, [
            "26: setOpciones(); setAlertas(); renderiza panel y header badge"
        ], "return");

        agregarMensajes(diagrama, dataSource, inventarioStock, [
            "27: SELECT s.id_stock, s.id_ptc, s.id_sucursal,",
            "s.cantidad_disponible, s.stock_minimo_alert",
            "WHERE stock_minimo_alert > 0",
            "AND cantidad_disponible <= stock_minimo_alert",
            "AND filtro id_sucursal opcional"
        ], "message");

        agregarMensajes(diagrama, alertasService, alertasController, [
            "28: return { total, sucursal, items[] }",
            "items incluye nombre_producto, talla, color, nombre_sucursal"
        ], "return");

        agregarMensajes(diagrama, alertasController, api, [
            "29: return listado; HTTP 200 / 400 / 403 / 404"
        ], "return");

        agregarMensajes(diagrama, api, adminAlertas, [
            "30: setAlertas(res); conAlertas = items.filter(disponible <= stock_minimo_alert)",
            "faltantes = stock_minimo_alert - cantidad_disponible",
            "muestra: '... unidades restantes · faltan ... para el mínimo (...) · Sucursal ...'"
        ], "return");

        // ============================================================
        // CONFIGURACIÓN EN LOTE DE stock_minimo_alert.
        // ============================================================

        agregarMensajes(diagrama, adminAlertas, adminAlertas, [
            "31: Configurar Umbrales -> ModalConfigurarUmbrales",
            "32: N filas; admin muestra sucursal, Encargado la omite",
            "frontend: Number.isInteger(stock_minimo) && stock_minimo >= 0",
            "frontend no incluye id_sucursal en filasValidas para admin"
        ], "message");

        agregarMensajes(diagrama, adminAlertas, api, [
            "33: POST /api/v1/admin/inventario/alertas/stock-minimo",
            "body: { items: [{ id_ptc, id_sucursal?, stock_minimo }] }",
            "Authorization: Bearer ${token}; credentials:'include'"
        ], "message");

        agregarMensajes(diagrama, api, alertasController, [
            "34: POST /admin/inventario/alertas/stock-minimo"
        ], "message");

        agregarMensajes(diagrama, alertasController, jwtAuthGuard, [
            "35: JwtAuthGuard -> UsuarioActual()"
        ], "message");

        agregarMensajes(diagrama, alertasController, alertasService, [
            "36: configurar(currentUser, items, request)",
            "ItemStockMinimoRequest: @IsInt, @Min(0), id_sucursal opcional"
        ], "message");

        agregarMensajes(diagrama, alertasService, dataSource, [
            "37: exigirPermiso('gestionar_inventario')",
            "38: items no vacío; valida id_ptc y stock_minimo",
            "stock_minimo usa Math.trunc; el DTO @IsInt puede rechazarlo antes",
            "39: sucursalAplicar() y SELECT de inventario_stock",
            "40: UPDATE stock_minimo_alert por id_stock",
            "41: bitacoraService.registrar() por cada item"
        ], "validation");

        agregarMensajes(diagrama, dataSource, roles, [
            "42: verificar '*' o 'gestionar_inventario'"
        ], "validation");

        agregarMensajes(diagrama, dataSource, usuariosEmpleados, [
            "43: Encargado: sucursal_id; otra sucursal -> 403"
        ], "validation");

        agregarMensajes(diagrama, dataSource, sucursales, [
            "44: admin: id_sucursal obligatorio y sucursal debe existir"
        ], "validation");

        agregarMensajes(diagrama, dataSource, inventarioStock, [
            "45: SELECT id_stock, stock_minimo_alert, cantidad_disponible",
            "WHERE id_ptc=$1 AND id_sucursal=$2",
            "UPDATE inventario_stock SET stock_minimo_alert=$1 WHERE id_stock=$2"
        ], "message");

        agregarMensajes(diagrama, alertasService, bitacoraService, [
            "46: registrar(usuario, 'UPDATE', 'inventario_stock', ...)",
            "old_data/new_data: id_ptc, id_sucursal, stock_minimo_alert"
        ], "message");

        agregarMensajes(diagrama, bitacoraService, bitacoraAuditoria, [
            "47: repo.create(bitacora) / repo.save(bitacora)"
        ], "message");

        agregarMensajes(diagrama, alertasService, alertasController, [
            "48: 200 { detail: 'Umbral configurado.', actualizados }",
            "actualizados += 1 por cada item; no usa transaction()",
            "si un item falla, los updates anteriores no se revierten"
        ], "return");

        agregarMensajes(diagrama, alertasController, api, [
            "49: return { detail, actualizados }; HTTP 200"
        ], "return");

        agregarMensajes(diagrama, api, adminAlertas, [
            "50: setModalAbierto(false)",
            "toast: `${res.detail} ${res.actualizados} producto(s) actualizado(s).`",
            "void cargar(); panel se refresca"
        ], "return");

        agregarMensajes(diagrama, api, apiError, [
            "E1-E5: handleResponse() -> new ApiError(status, message)"
        ], "error");

        agregarMensajes(diagrama, adminAlertas, adminAlertas, [
            "51: Ver Kardex -> /admin/inventario/kardex?id_ptc={id_ptc}&id_sucursal={id_sucursal}",
            "AdminKardex precarga y ejecuta consulta automáticamente",
            "Reordenar -> /admin/ordenes-compra"
        ], "message");

        agregarMensajes(diagrama, alertasService, alertasService, [
            "52: listar/configurar exigen '*' o 'gestionar_inventario'",
            "gestionar_alertas aparece en RolesService, pero no lo usa este módulo",
            "schema.sql no concede gestionar_inventario al Encargado ni Cajero"
        ], "validation");

        agregarMensajes(diagrama, alertasController, alertasController, [
            "E1: @Min(0) -> 'El stock mínimo no puede ser negativo.'",
            "E5: @IsArray/items vacío -> 'Debe enviar al menos un producto para configurar el stock mínimo.'",
            "parseIntId: 'La sucursal no es válida.'"
        ], "error");

        agregarMensajes(diagrama, alertasService, alertasService, [
            "E2: 'No se encontró inventario para el producto en esa sucursal.'",
            "E3: 'No tienes permisos para gestionar alertas de esta sucursal.'",
            "E4: 'No tienes permiso para gestionar alertas de inventario.'",
            "adicionales: 'Debe seleccionar un producto válido.'",
            "adicionales: 'Debe especificar la sucursal.' / 'Debe especificar la sucursal del producto.'",
            "adicionales: 'Tu usuario no está asociado a una sucursal.' / 'Sucursal no encontrada.'"
        ], "error");

        agregarMensajes(diagrama, fnDetectarStockBajo, alertasStockConfig, [
            "53: schema.sql define fn_detectar_stock_bajo() y alertas_stock_config",
            "la función real de AlertasService no las utiliza; consulta inventario_stock"
        ], "not-implemented");

        agregarMensajes(diagrama, inventarioModule, alertasController, [
            "54: InventarioModule registra AlertasController y AlertasService"
        ], "message");

        try {
            diagrama.Notes =
                "CU25 - Flujo real de la implementación actual (React/Vite + NestJS).\n" +
                "La página es AdminAlertas.tsx y la ruta es /admin/inventario/alertas.\n" +
                "El frontend carga obtenerOpcionesAlertas() y listarAlertas() en paralelo; AdminLayout también lista alertas para el badge.\n" +
                "El permiso real del módulo es '*' o gestionar_inventario; gestionar_alertas solo aparece en el catálogo de RolesService.\n" +
                "La consulta activa usa inventario_stock.stock_minimo_alert > 0 y cantidad_disponible <= stock_minimo_alert.\n" +
                "La configuración actualiza en lote por item, registra bitácora por item y no usa una transacción.\n" +
                "La UI permite 0 para desactivar la alerta; el filtro de sucursal solo se muestra al Administrador.\n" +
                "Ver Kardex navega con id_ptc e id_sucursal; Reordenar solo navega a /admin/ordenes-compra.\n" +
                "schema.sql contiene alertas_stock_config y fn_detectar_stock_bajo, pero SRV_AlertasService no los utiliza.\n" +
                "La UI es React; no utiliza Angular, MatDialog ni Flutter.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU25 con elementos muy pequeños creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Los mensajes secundarios, validaciones y discrepancias fueron agrupados.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU25", 0);
    }
}

main();
