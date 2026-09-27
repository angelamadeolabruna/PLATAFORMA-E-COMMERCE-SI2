// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU26 - Consultar Existencias Consolidadas
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
    "AdminExistencias": "IU_AdminExistencias",
    "AuthProvider": "IU_AuthProvider",
    "adminMenu": "IU_AdminMenu",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "ExistenciasController": "CTR_Existencias",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "ExistenciasService": "SRV_ExistenciasService",
    "InventarioModule": "SRV_InventarioModule",
    "DataSource": "SRV_DataSource",
    "roles": "CE_Roles",
    "usuarios_roles": "CE_UsuariosRoles",
    "usuarios_empleados": "CE_UsuariosEmpleados",
    "sucursales": "CE_Sucursales",
    "categorias": "CE_Categorias",
    "producto_talla_color": "CE_ProductoTallaColor",
    "productos": "CE_Productos",
    "tallas": "CE_Tallas",
    "colores": "CE_Colores",
    "inventario_stock": "CE_InventarioStock",
    "alertas_stock_config": "CE_AlertasStockConfig",
    "fn_detectar_stock_bajo": "SRV_fn_detectar_stock_bajo"
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU26", 0);
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
    aviso("Generando CU26 - Elementos muy pequeños...");

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
            "CU26 - Existencias Consolidadas - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU26 - Consultar Existencias Consolidadas - Diagrama de Comunicación Elementos Muy Pequeños",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario Existencias (actor externo)",
            "ACTOR_UsuarioExistencias",
            "Administrador General o Encargado de Sucursal que consulta el inventario consolidado."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx; Route /admin/inventario/existencias."
        );

        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "web/src/components/layout/admin/AdminLayout.tsx; renderiza <Outlet />."
        );

        var adminExistencias = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminExistencias", "Object", "Class", "Boundary",
            "web/src/pages/admin/AdminExistencias.tsx; filtros, tabla, expansión, paginación y CSV."
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
            "web/src/lib/api.ts; obtenerOpcionesExistencias() y consultarExistencias()."
        );

        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "web/src/lib/api.ts; handleResponse() y renovación de token."
        );

        var existenciasController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ExistenciasController", "Object", "Class", "Control",
            "api/src/modulos/inventario/CTR_Existencias.ts; @Controller('admin/inventario/existencias')."
        );

        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts; @UseGuards(JwtAuthGuard)."
        );

        var existenciasService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ExistenciasService", "Object", "Class", "Service",
            "api/src/modulos/inventario/SRV_ExistenciasService.ts; consolidación, filtros y desglose."
        );

        var inventarioModule = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "InventarioModule", "Object", "Class", "Service",
            "api/src/modulos/inventario/inventario.module.ts; registra ExistenciasController y ExistenciasService."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "TypeORM DataSource; SQL directo."
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
            "Tabla SQL; no se consulta para limitar el alcance de sucursal."
        );

        var sucursales = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sucursales", "Object", "Class", "Entity",
            "Tabla SQL de sucursales; opciones activas y validación de filtros."
        );

        var categorias = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "categorias", "Object", "Class", "Entity",
            "Tabla SQL de categorías; opciones activas y filtro."
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Tabla SQL que relaciona inventario_stock con id_ptc, producto, talla y color."
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Tabla SQL de productos; LOWER(estado)='activo'."
        );

        var tallas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "tallas", "Object", "Class", "Entity",
            "Tabla SQL de tallas; búsqueda y orden."
        );

        var colores = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "colores", "Object", "Class", "Entity",
            "Tabla SQL de colores; búsqueda y orden."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Tabla SQL consolidada por id_ptc: disponible, reservada, vendida y stock_minimo_alert."
        );

        var alertasStockConfig = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "alertas_stock_config", "Object", "Class", "Entity",
            "Tabla SQL de schema; no la usa ExistenciasService."
        );

        var fnDetectarStockBajo = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "fn_detectar_stock_bajo", "Object", "Class", "Service",
            "Función SQL de schema; no se invoca desde ExistenciasService."
        );

        // Elementos muy pequeños, organizados por capas.
        posicionar(diagrama, actor, 20, 20, 150, 45);
        posicionar(diagrama, routerApp, 190, 20, 310, 45);
        posicionar(diagrama, adminLayout, 360, 20, 480, 45);
        posicionar(diagrama, adminExistencias, 530, 20, 650, 45);
        posicionar(diagrama, authProvider, 700, 20, 820, 45);

        posicionar(diagrama, adminMenu, 20, 75, 150, 100);
        posicionar(diagrama, api, 190, 75, 310, 100);
        posicionar(diagrama, apiError, 360, 75, 480, 100);
        posicionar(diagrama, existenciasController, 530, 75, 650, 100);
        posicionar(diagrama, jwtAuthGuard, 700, 75, 820, 100);

        posicionar(diagrama, existenciasService, 20, 130, 150, 155);
        posicionar(diagrama, inventarioModule, 190, 130, 310, 155);
        posicionar(diagrama, dataSource, 360, 130, 480, 155);
        posicionar(diagrama, roles, 530, 130, 650, 155);
        posicionar(diagrama, usuariosRoles, 700, 130, 820, 155);

        posicionar(diagrama, usuariosEmpleados, 20, 185, 150, 210);
        posicionar(diagrama, sucursales, 190, 185, 310, 210);
        posicionar(diagrama, categorias, 360, 185, 480, 210);
        posicionar(diagrama, productoTallaColor, 530, 185, 650, 210);
        posicionar(diagrama, productos, 700, 185, 820, 210);

        posicionar(diagrama, tallas, 20, 240, 150, 265);
        posicionar(diagrama, colores, 190, 240, 310, 265);
        posicionar(diagrama, inventarioStock, 360, 240, 480, 265);
        posicionar(diagrama, alertasStockConfig, 530, 240, 650, 265);
        posicionar(diagrama, fnDetectarStockBajo, 700, 240, 820, 265);

        // ============================================================
        // FLUJO WEB: NAVEGACIÓN, OPCIONES Y CONSULTA.
        // ============================================================

        agregarMensajes(diagrama, actor, routerApp, [
            "1: navega a /admin/inventario/existencias"
        ], "message");

        agregarMensajes(diagrama, routerApp, adminLayout, [
            "2: Route /admin/* -> <AdminLayout />"
        ], "message");

        agregarMensajes(diagrama, routerApp, adminExistencias, [
            "3: Route path='inventario/existencias' -> <AdminExistencias />"
        ], "message");

        agregarMensajes(diagrama, adminLayout, authProvider, [
            "4: useAuth() -> usuario / token",
            "sin token -> Navigate('/login'); con token -> <Outlet />"
        ], "message");

        agregarMensajes(diagrama, adminLayout, adminMenu, [
            "5: item Existencias Consolidadas · CU26 · implementado:true",
            "permitido = permisos.includes('*') || permisos.includes('gestionar_inventario')",
            "Cajero sin ese permiso -> módulo no visible"
        ], "message");

        agregarMensajes(diagrama, adminExistencias, authProvider, [
            "6: permisoOk = permisos.includes('*') || permisos.includes('gestionar_inventario')",
            "sin permiso -> 'Acceso denegado'; 'No tienes permiso para consultar las existencias consolidadas.'"
        ], "validation");

        agregarMensajes(diagrama, adminExistencias, adminExistencias, [
            "7: useEffect() carga opciones al entrar; no consulta existencias automáticamente",
            " pulsar Consultar -> construir FiltroExistencias",
            " Limpiar filtros -> resultado=null"
        ], "message");

        agregarMensajes(diagrama, adminExistencias, api, [
            "8: GET /api/v1/admin/inventario/existencias/opciones",
            "opciones: sucursales activas + categorías activas"
        ], "message");

        agregarMensajes(diagrama, api, existenciasController, [
            "9: GET /admin/inventario/existencias/opciones"
        ], "message");

        agregarMensajes(diagrama, existenciasController, jwtAuthGuard, [
            "10: @UseGuards(JwtAuthGuard); UsuarioActual()"
        ], "message");

        agregarMensajes(diagrama, existenciasController, existenciasService, [
            "11: obtenerOpciones(currentUser)"
        ], "message");

        agregarMensajes(diagrama, existenciasService, dataSource, [
            "12: exigirPermiso('gestionar_inventario')",
            "13: SELECT sucursales LOWER(estado)='activa'",
            "14: SELECT categorias LOWER(estado)='activo'"
        ], "message");

        agregarMensajes(diagrama, dataSource, roles, [
            "15: SELECT r.permisos_json mediante usuarios + usuarios_roles + roles"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuariosRoles, [
            "16: JOIN usuarios_roles para obtener permisos"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuariosEmpleados, [
            "17: NO SE CONSULTA: ExistenciasService no limita la consulta a la sucursal del Encargado"
        ], "not-implemented");

        agregarMensajes(diagrama, dataSource, sucursales, [
            "18: opciones de sucursales activas"
        ], "message");

        agregarMensajes(diagrama, dataSource, categorias, [
            "19: opciones de categorías activas"
        ], "message");

        agregarMensajes(diagrama, existenciasService, existenciasController, [
            "20: return { sucursales, categorias }"
        ], "return");

        agregarMensajes(diagrama, existenciasController, api, [
            "21: return opciones; HTTP 200"
        ], "return");

        agregarMensajes(diagrama, api, adminExistencias, [
            "22: setOpciones(); activa selects de sucursal y categoría",
            "error: fallback 'No se pudieron cargar las opciones.'"
        ], "return");

        agregarMensajes(diagrama, adminExistencias, adminExistencias, [
            "23: FiltroExistencias { busqueda, categoria, id_sucursal, pagina:1, limite:20 }",
            "busqueda -> nombre, talla o color"
        ], "message");

        agregarMensajes(diagrama, adminExistencias, api, [
            "24: GET /api/v1/admin/inventario/existencias?busqueda=&categoria=&id_sucursal=&pagina=1&limite=20",
            "Authorization: Bearer ${token}; credentials:'include'"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "25: baseUrl='/api/v1'; 401 -> renovarToken() y reintenta"
        ], "message");

        agregarMensajes(diagrama, api, existenciasController, [
            "26: GET /admin/inventario/existencias"
        ], "message");

        agregarMensajes(diagrama, existenciasController, jwtAuthGuard, [
            "27: JwtAuthGuard -> UsuarioActual()"
        ], "message");

        agregarMensajes(diagrama, existenciasController, existenciasService, [
            "28: consultar(currentUser, filtro)"
        ], "message");

        agregarMensajes(diagrama, existenciasService, dataSource, [
            "29: exigirPermiso('gestionar_inventario')",
            "30: valida existencia de sucursal y categoría",
            "31: pagina/limite se normalizan",
            "32: aplica filtros id_sucursal, categoría y LIKE"
        ], "validation");

        agregarMensajes(diagrama, dataSource, roles, [
            "33: verificar '*' o 'gestionar_inventario'"
        ], "validation");

        agregarMensajes(diagrama, dataSource, sucursales, [
            "34: SELECT id_sucursal; inexistente -> 404",
            "la consulta principal no exige que la sucursal esté activa"
        ], "validation");

        agregarMensajes(diagrama, dataSource, categorias, [
            "35: SELECT id_categoria; inexistente -> 404",
            "la consulta principal no exige que la categoría esté activa"
        ], "validation");

        agregarMensajes(diagrama, dataSource, inventarioStock, [
            "36: JOIN por id_ptc, no por id_producto",
            "GROUP BY ptc.id_ptc, ptc.id_producto, producto, talla, color, categoría",
            "COUNT(*) sobre el grupo para total",
            "SUM(cantidad_disponible), SUM(cantidad_reservada), SUM(cantidad_vendida), SUM(stock_minimo_alert)",
            "HAVING SUM(cantidad_disponible) > 0",
            "ORDER BY producto, t.orden, color; LIMIT/OFFSET"
        ], "message");

        agregarMensajes(diagrama, dataSource, productoTallaColor, [
            "37: ptc.id_ptc = i.id_ptc; ptc.id_producto, talla y color"
        ], "message");

        agregarMensajes(diagrama, dataSource, productos, [
            "38: JOIN productos LOWER(p.estado)='activo'; categoría"
        ], "message");

        agregarMensajes(diagrama, dataSource, tallas, [
            "39: JOIN tallas; t.nombre y t.orden"
        ], "message");

        agregarMensajes(diagrama, dataSource, colores, [
            "40: JOIN colores; c.nombre"
        ], "message");

        agregarMensajes(diagrama, dataSource, inventarioStock, [
            "41: segunda consulta WHERE i.id_ptc = ANY($1::int[])",
            "filtro opcional i.id_sucursal; desglose por sucursal"
        ], "message");

        agregarMensajes(diagrama, existenciasService, existenciasController, [
            "42: return { total, pagina, limite, busqueda, id_categoria, id_sucursal, items[] }",
            "items: totales, stock_minimo_global, stock_bajo y sucursales[]"
        ], "return");

        agregarMensajes(diagrama, existenciasController, api, [
            "43: return respuesta; HTTP 200 / 400 / 403 / 404"
        ], "return");

        agregarMensajes(diagrama, api, apiError, [
            "E2-E3: handleResponse() -> new ApiError(status, message)"
        ], "error");

        agregarMensajes(diagrama, api, adminExistencias, [
            "44: setResultado(res); setExpandidos(new Set())",
            "E1: items vacío -> 'No hay existencias para los filtros.'",
            "error: fallback 'No se pudieron consultar las existencias.'"
        ], "return");

        agregarMensajes(diagrama, existenciasService, existenciasService, [
            "45: stock_bajo = stock_minimo_global > 0 && total_disponible <= stock_minimo_global",
            "46: HAVING excluye variantes con total_disponible = 0"
        ], "validation");

        agregarMensajes(diagrama, adminExistencias, adminExistencias, [
            "47: tabla Producto, Categoría, Total disponible, Total reservado, Total vendido, Estado",
            "Categoría -> Badge brand; Estado -> 'Stock bajo' o 'OK'",
            "expandidos:Set<id_ptc>; ChevronDown/ChevronUp",
            "Desglose por sucursal: disponible, reservado, vendido, stock_minimo_alert"
        ], "return");

        agregarMensajes(diagrama, adminExistencias, adminExistencias, [
            "48: sin items -> 'No hay existencias para los filtros.'",
            "49: total > 0 -> Anterior / Siguiente; página X de Y",
            "irPagina() conserva filtros y limite"
        ], "return");

        agregarMensajes(diagrama, adminExistencias, adminExistencias, [
            "50: exportarCsv(items) client-side solo si items.length > 0",
            "CSV: Producto, Talla, Color, Categoria, Total disponible, Total reservado, Total vendido, Stock min global, Desglose",
            "UTF-8 BOM; desglose exporta nombre: disponible por sucursal"
        ], "return");

        agregarMensajes(diagrama, existenciasController, existenciasController, [
            "E2: 'Sucursal no encontrada.' / 'Categoría no encontrada.'",
            "parseIntId: 'La categoría no es válida.' / 'La sucursal no es válida.'",
            "parseIntId: 'La página no es válida.' / 'El límite no es válido.'"
        ], "error");

        agregarMensajes(diagrama, existenciasService, existenciasService, [
            "E3: 'No tienes permiso para consultar las existencias consolidadas.'",
            "opciones/consulta no aplican RBAC por usuarios_empleados.sucursal_id"
        ], "error");

        agregarMensajes(diagrama, fnDetectarStockBajo, alertasStockConfig, [
            "51: schema.sql define fn_detectar_stock_bajo() y alertas_stock_config",
            "ExistenciasService calcula stock_bajo en TypeScript y no usa esas tablas ni funciones"
        ], "not-implemented");

        agregarMensajes(diagrama, inventarioModule, existenciasController, [
            "52: InventarioModule registra ExistenciasController y ExistenciasService"
        ], "message");

        try {
            diagrama.Notes =
                "CU26 - Flujo real de la implementación actual (React/Vite + NestJS).\n" +
                "La página es AdminExistencias.tsx y la ruta es /admin/inventario/existencias.\n" +
                "Al entrar solo carga opciones; la consulta de existencias ocurre al pulsar Consultar.\n" +
                "El permiso real es '*' o gestionar_inventario; el menú no usa consultar_inventario.\n" +
                "schema.sql no concede gestionar_inventario a Encargado de Sucursal ni Cajero.\n" +
                "La consolidación se hace por id_ptc mediante producto_talla_color, no por id_producto.\n" +
                "La consulta principal y el desglose usan inventario_stock; HAVING excluye total_disponible=0.\n" +
                "No hay límite por sucursal para el Encargado: usuarios_empleados no se consulta.\n" +
                "El estado Stock bajo se calcula en TypeScript con stock_minimo_global y total_disponible.\n" +
                "La exportación CSV es client-side y solo descarga la página cargada.\n" +
                "La UI es React; no utiliza Angular, MatDialog ni Flutter.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU26 con elementos muy pequeños creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Los mensajes secundarios, validaciones y discrepancias fueron agrupados.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU26", 0);
    }
}

main();
