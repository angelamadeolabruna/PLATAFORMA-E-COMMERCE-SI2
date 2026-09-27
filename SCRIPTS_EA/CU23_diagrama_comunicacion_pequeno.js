// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU23 - Consultar Kardex Dinámico
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
    "AdminKardex": "IU_AdminKardex",
    "AuthProvider": "IU_AuthProvider",
    "adminMenu": "IU_AdminMenu",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "KardexController": "CTR_Kardex",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "KardexService": "SRV_KardexService",
    "InventarioModule": "SRV_InventarioModule",
    "DataSource": "SRV_DataSource",
    "roles": "CE_Roles",
    "usuarios_roles": "CE_UsuariosRoles",
    "usuarios_empleados": "CE_UsuariosEmpleados",
    "sucursales": "CE_Sucursales",
    "producto_talla_color": "CE_ProductoTallaColor",
    "productos": "CE_Productos",
    "tallas": "CE_Tallas",
    "colores": "CE_Colores",
    "movimientos_inventario": "CE_MovimientosInventario",
    "inventario_stock": "CE_InventarioStock"
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU23", 0);
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
    aviso("Generando CU23 - Elementos muy pequeños...");

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
            "CU23 - Kardex Dinámico - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU23 - Consultar Kardex Dinámico - Diagrama de Comunicación Elementos Muy Pequeños",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario Kardex (actor externo)",
            "ACTOR_UsuarioKardex",
            "Encargado de Sucursal o Administrador General que audita movimientos y saldos."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx; Route /admin/inventario/kardex."
        );

        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "web/src/components/layout/admin/AdminLayout.tsx; renderiza <Outlet />."
        );

        var adminKardex = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminKardex", "Object", "Class", "Boundary",
            "web/src/pages/admin/AdminKardex.tsx; filtros, tabla, paginación y CSV."
        );

        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx."
        );

        var adminMenu = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "adminMenu", "Object", "Class", "Boundary",
            "web/src/data/adminMenu.ts; Kardex Dinámico, permiso consultar_kardex, implementado:true."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts; obtenerOpcionesKardex() y consultarKardex()."
        );

        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "web/src/lib/api.ts; handleResponse() y renovación de token."
        );

        var kardexController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "KardexController", "Object", "Class", "Control",
            "api/src/modulos/inventario/CTR_Kardex.ts; @Controller('admin/inventario/kardex')."
        );

        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts; @UseGuards(JwtAuthGuard)."
        );

        var kardexService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "KardexService", "Object", "Class", "Service",
            "api/src/modulos/inventario/SRV_KardexService.ts; opciones, RBAC, filtros y saldos."
        );

        var inventarioModule = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "InventarioModule", "Object", "Class", "Service",
            "api/src/modulos/inventario/inventario.module.ts; registra KardexController y KardexService."
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
            "Tabla SQL; sucursal_id y fecha_baja para RBAC de sucursal."
        );

        var sucursales = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sucursales", "Object", "Class", "Entity",
            "Tabla SQL de sucursales; opciones activas y validación de sucursal."
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Tabla SQL de variantes id_ptc; une producto, talla y color."
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Tabla SQL de productos; opciones activas del Kardex."
        );

        var tallas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "tallas", "Object", "Class", "Entity",
            "Tabla SQL de tallas; etiquetas de las variantes."
        );

        var colores = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "colores", "Object", "Class", "Entity",
            "Tabla SQL de colores; etiquetas de las variantes."
        );

        var movimientosInventario = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "movimientos_inventario", "Object", "Class", "Entity",
            "Tabla SQL real del Kardex; no existe una tabla llamada kardex."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Tabla SQL de saldo vigente: disponible, reservada y vendida."
        );

        // Elementos muy pequeños, organizados por capas.
        posicionar(diagrama, actor, 20, 20, 150, 45);
        posicionar(diagrama, routerApp, 190, 20, 310, 45);
        posicionar(diagrama, adminLayout, 360, 20, 480, 45);
        posicionar(diagrama, adminKardex, 530, 20, 650, 45);
        posicionar(diagrama, authProvider, 700, 20, 820, 45);

        posicionar(diagrama, adminMenu, 20, 75, 150, 100);
        posicionar(diagrama, api, 190, 75, 310, 100);
        posicionar(diagrama, apiError, 360, 75, 480, 100);
        posicionar(diagrama, kardexController, 530, 75, 650, 100);
        posicionar(diagrama, jwtAuthGuard, 700, 75, 820, 100);

        posicionar(diagrama, kardexService, 20, 130, 150, 155);
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
        posicionar(diagrama, movimientosInventario, 190, 240, 310, 265);
        posicionar(diagrama, inventarioStock, 360, 240, 480, 265);

        // ============================================================
        // FLUJO WEB: CARGA DE OPCIONES Y CONSULTA.
        // ============================================================

        agregarMensajes(diagrama, actor, routerApp, [
            "1: navega a /admin/inventario/kardex"
        ], "message");

        agregarMensajes(diagrama, routerApp, adminLayout, [
            "2: Route /admin/* -> <AdminLayout />"
        ], "message");

        agregarMensajes(diagrama, routerApp, adminKardex, [
            "3: Route path='inventario/kardex' -> <AdminKardex />"
        ], "message");

        agregarMensajes(diagrama, adminLayout, authProvider, [
            "4: useAuth() -> usuario / token",
            "sin token -> Navigate('/login'); con token -> <Outlet />"
        ], "message");

        agregarMensajes(diagrama, adminLayout, adminMenu, [
            "5: item Kardex Dinámico · CU23 · implementado:true",
            "permitido = permisos.includes('*') || permisos.includes('consultar_kardex')"
        ], "message");

        agregarMensajes(diagrama, adminKardex, authProvider, [
            "6: permisoOk = permisos.includes('*') || permisos.includes('consultar_kardex')",
            "esAdmin = permisos.includes('*')",
            "sin permiso -> 'Acceso denegado'; 'No tienes permiso para consultar el kardex.'"
        ], "validation");

        agregarMensajes(diagrama, adminKardex, adminKardex, [
            "7: useSearchParams(); id_ptc/id_sucursal opcionales",
            "selecciona Producto · Talla · Color, sucursal y fechas",
            "Consultar -> ejecutarConsulta(); paginación -> irPagina()"
        ], "message");

        agregarMensajes(diagrama, adminKardex, api, [
            "8: useEffect() -> api.obtenerOpcionesKardex()",
            "GET /api/v1/admin/inventario/kardex/opciones"
        ], "message");

        agregarMensajes(diagrama, api, kardexController, [
            "9: GET /admin/inventario/kardex/opciones"
        ], "message");

        agregarMensajes(diagrama, kardexController, jwtAuthGuard, [
            "10: @UseGuards(JwtAuthGuard); UsuarioActual()",
            "verifica access token y blacklist"
        ], "message");

        agregarMensajes(diagrama, kardexController, kardexService, [
            "11: obtenerOpciones(currentUser)"
        ], "message");

        agregarMensajes(diagrama, kardexService, dataSource, [
            "12: exigirPermiso('consultar_kardex')",
            "admin: sucursales activas; no-admin: sucursalEncargado()",
            "productos activos con id_ptc, producto, talla y color"
        ], "message");

        agregarMensajes(diagrama, dataSource, roles, [
            "13: SELECT r.permisos_json mediante usuarios + usuarios_roles + roles"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuariosRoles, [
            "14: JOIN usuarios_roles para obtener los roles del usuario"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuariosEmpleados, [
            "15: SELECT sucursal_id WHERE usuario_id=$1 AND fecha_baja IS NULL"
        ], "message");

        agregarMensajes(diagrama, dataSource, sucursales, [
            "16: admin: todas las sucursales LOWER(estado)='activa'",
            "no-admin: solo la sucursal asignada"
        ], "message");

        agregarMensajes(diagrama, dataSource, productoTallaColor, [
            "17: SELECT id_ptc, id_producto, nombre, talla, color"
        ], "message");

        agregarMensajes(diagrama, dataSource, productos, [
            "18: JOIN productos; WHERE LOWER(estado)='activo'"
        ], "message");

        agregarMensajes(diagrama, dataSource, tallas, [
            "19: JOIN tallas; ORDER BY t.orden"
        ], "message");

        agregarMensajes(diagrama, dataSource, colores, [
            "20: JOIN colores"
        ], "message");

        agregarMensajes(diagrama, kardexService, kardexController, [
            "21: return { sucursales, productos }"
        ], "return");

        agregarMensajes(diagrama, kardexController, api, [
            "22: return opciones; HTTP 200"
        ], "return");

        agregarMensajes(diagrama, api, adminKardex, [
            "23: setOpciones(); preselecciona id_ptc/id_sucursal si vienen en la URL"
        ], "return");

        // ============================================================
        // CONSULTA PRINCIPAL DEL KARDEX.
        // ============================================================

        agregarMensajes(diagrama, adminKardex, adminKardex, [
            "24: idPtc obligatorio; idSucursal, fechaDesde, fechaHasta opcionales",
            "filtro = { id_ptc, id_sucursal, fecha_desde, fecha_hasta, pagina, limite }"
        ], "message");

        agregarMensajes(diagrama, adminKardex, api, [
            "25: api.consultarKardex(filtro)",
            "GET /api/v1/admin/inventario/kardex?id_ptc=&id_sucursal=&fecha_desde=&fecha_hasta=&pagina=1&limite=20",
            "Authorization: Bearer ${token}; credentials:'include'"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "26: baseUrl='/api/v1'; 401 -> renovarToken() y reintenta"
        ], "message");

        agregarMensajes(diagrama, api, kardexController, [
            "27: GET /admin/inventario/kardex"
        ], "message");

        agregarMensajes(diagrama, kardexController, jwtAuthGuard, [
            "28: JwtAuthGuard -> UsuarioActual()"
        ], "message");

        agregarMensajes(diagrama, kardexController, kardexService, [
            "29: consultar(currentUser, filtro)"
        ], "message");

        agregarMensajes(diagrama, kardexService, dataSource, [
            "30: exigirPermiso('consultar_kardex')",
            "31: id_ptc obligatorio; validarElegida()",
            "32: FECHA_RE para fechas; pagina y limite se normalizan",
            "33: COUNT(*) y SELECT de movimientos paginado"
        ], "validation");

        agregarMensajes(diagrama, dataSource, roles, [
            "34: verificar '*' o 'consultar_kardex'"
        ], "validation");

        agregarMensajes(diagrama, dataSource, usuariosEmpleados, [
            "35: no-admin obtiene sucursal_id; si no existe -> 403"
        ], "validation");

        agregarMensajes(diagrama, dataSource, sucursales, [
            "36: admin valida id_sucursal; sucursal inexistente -> 404"
        ], "validation");

        agregarMensajes(diagrama, dataSource, movimientosInventario, [
            "37: SELECT COUNT(*)",
            "38: SELECT id_movimiento, fecha, tipo_movimiento, cantidad,",
            "stock_anterior, stock_posterior, referencia, id_orden_compra, id_venta, id_reserva, id_usuario",
            "WHERE id_ptc=$1 AND id_sucursal=$2 AND fechas",
            "ORDER BY fecha DESC, id_movimiento DESC LIMIT/OFFSET"
        ], "message");

        agregarMensajes(diagrama, dataSource, inventarioStock, [
            "39: SELECT cantidad_disponible, cantidad_reservada, cantidad_vendida",
            "WHERE id_ptc=$1 AND id_sucursal=$2"
        ], "message");

        agregarMensajes(diagrama, kardexService, kardexController, [
            "40: 200 { total, pagina, limite, id_ptc, id_sucursal, saldo_actual, movimientos[] }",
            "saldo = stock_posterior",
            "descripcionTipo() y referencia_id = orden_compra -> venta -> reserva",
            "E1: lista vacía en frontend; E2: 422 fechas; E3: 403 sucursal; E4: 403 permiso"
        ], "return");

        agregarMensajes(diagrama, kardexController, api, [
            "41: return respuesta; HTTP 200 / 400 / 403 / 404 / 422"
        ], "return");

        agregarMensajes(diagrama, api, apiError, [
            "E2-E4: handleResponse() -> new ApiError(status, message)",
            "body.message puede ser string o string[]"
        ], "error");

        agregarMensajes(diagrama, api, adminKardex, [
            "42: setResultado(res) o setError(err.message)",
            "fallback: 'No se pudo consultar el kardex.'"
        ], "return");

        // ============================================================
        // RENDER, PAGINACIÓN, CSV Y SALDOS.
        // ============================================================

        agregarMensajes(diagrama, adminKardex, adminKardex, [
            "43: resultado.movimientos[] -> tabla Fecha, Tipo, Cantidad, Saldo, Descripción, Referencia",
            "badge: ENTRADA*=success; SALIDA-RESERVA=warning; AJUSTE=violeta; MERMA=naranja; resto=danger",
            "cantidadSigno(): entrada +; salida -; AJUSTE/MERMA = saldo - stock_anterior",
            "tipo desconocido -> delta; SALIDA-RESERVA positivo se muestra negativo",
            "referencia = texto o #id de id_orden_compra/id_venta/id_reserva"
        ], "return");

        agregarMensajes(diagrama, adminKardex, adminKardex, [
            "44: renderiza saldo_actual: Disponible, Reservado y Vendido acumulado",
            "paginación: Anterior / Siguiente; Página X de Y",
            "irPagina() conserva filtros y usa resultado.limite"
        ], "return");

        agregarMensajes(diagrama, adminKardex, adminKardex, [
            "45: exportarCsv(movimientos) solo si la página tiene movimientos",
            "CSV client-side: Fecha, Tipo, Cantidad, Saldo, Referencia, Descripción",
            "Blob + URL.createObjectURL + link.download; no consulta todas las páginas"
        ], "return");

        agregarMensajes(diagrama, adminKardex, adminKardex, [
            "46: sin movimientos -> 'No hay movimientos para los filtros seleccionados.'",
            "sin producto -> 'Debe seleccionar un producto para consultar.'"
        ], "validation");

        agregarMensajes(diagrama, kardexService, kardexService, [
            "47: sin permiso: 'No tienes permiso para consultar el kardex.'",
            "sin sucursal: 'Tu usuario no está asociado a una sucursal.'",
            "otra sucursal: 'No tienes permisos para consultar esta sucursal.'",
            "admin sin sucursal: 'Debe seleccionar una sucursal.'",
            "sucursal inexistente: 'Sucursal no encontrada.'",
            "fecha: 'La fecha desde no es válida.' / 'La fecha hasta no es válida.'",
            "rango: 'La fecha desde no puede ser mayor que la fecha hasta.'",
            "producto: 'Debe seleccionar un producto.'"
        ], "error");

        agregarMensajes(diagrama, kardexController, kardexController, [
            "48: parseIntId(): 'El producto no es válido.' / 'La sucursal no es válida.'",
            "parseIntId(): 'La página no es válida.' / 'El límite no es válido.'"
        ], "error");

        agregarMensajes(diagrama, kardexService, kardexService, [
            "49: tipos reales mezclados: 'Venta', 'Reserva', 'Recepción', 'SALIDA-RESERVA', 'AJUSTE', 'MERMA'",
            "descripcionTipo solo reconoce ENTRADA-COMPRA, ENTRADA-DEVOLUCION, SALIDA-VENTA, SALIDA-DEVOLUCION, SALIDA-RESERVA, AJUSTE y MERMA",
            "tipos desconocidos -> 'Movimiento <tipo>'"
        ], "error");

        agregarMensajes(diagrama, inventarioModule, kardexController, [
            "50: InventarioModule registra KardexController y KardexService"
        ], "message");

        try {
            diagrama.Notes =
                "CU23 - Flujo real de la implementación actual (React/Vite + NestJS).\n" +
                "La página es AdminKardex.tsx y la ruta es /admin/inventario/kardex.\n" +
                "El frontend carga opciones con GET /api/v1/admin/inventario/kardex/opciones y consulta con GET /api/v1/admin/inventario/kardex.\n" +
                "KardexService exige '*' o 'consultar_kardex'; para Encargado fuerza la sucursal de usuarios_empleados y rechaza otra sucursal.\n" +
                "La consulta usa movimientos_inventario; no existe una tabla llamada kardex. stock_posterior se expone como saldo.\n" +
                "schema.sql define fn_kardex_producto, pero KardexService no la invoca.\n" +
                "Los escritores actuales usan tipos mezclados: Venta, Reserva, Recepción, SALIDA-RESERVA, AJUSTE y MERMA; descripcionTipo solo tiene descripciones amigables para los tipos con guion.\n" +
                "Exportar CSV es client-side y solo descarga los movimientos de la página cargada.\n" +
                "schema.sql no incluye consultar_kardex en los roles seed Encargado de Sucursal ni Cajero, aunque RolesService sí lo cataloga como permiso.\n" +
                "La UI es React; no utiliza Angular, MatDialog ni Flutter.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU23 con elementos muy pequeños creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Los mensajes secundarios, validaciones y discrepancias fueron agrupados.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU23", 0);
    }
}

main();
