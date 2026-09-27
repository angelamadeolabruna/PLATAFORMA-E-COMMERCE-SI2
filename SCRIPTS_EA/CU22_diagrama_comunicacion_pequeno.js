// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU22 - Registrar Recepción Física de Prendas (Ingreso a Inventario)
// Diagrama de Comunicación con elementos muy pequeños.
//
// Fuente de verdad: React/Vite + NestJS + schema.sql.
// El flujo web/API descrito en la especificación no está implementado.
// Se representa también la función PostgreSQL existente, pero no expuesta.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "RouterApp": "IU_RouterApp",
    "AdminLayout": "IU_AdminLayout",
    "adminMenu": "IU_AdminMenu",
    "AuthProvider": "IU_AuthProvider",
    "AdminOrdenesCompra": "IU_AdminOrdenesCompra",
    "AdminPlaceholder": "IU_AdminPlaceholder",
    "EnConstruccion": "IU_EnConstruccion",
    "api": "IU_Api",
    "ComprasAdminController": "CTR_ComprasAdminController",
    "ComprasService": "SRV_ComprasService",
    "InventarioModule": "SRV_InventarioModule",
    "sp_registrar_recepcion": "SRV_sp_registrar_recepcion",
    "fn_aplicar_movimiento_inventario": "SRV_fn_aplicar_movimiento_inventario",
    "trg_movimiento_inventario": "SRV_trg_movimiento_inventario",
    "KardexService": "SRV_KardexService",
    "ProveedoresService": "SRV_ProveedoresService",
    "BitacoraService": "SRV_BitacoraService",
    "usuarios_empleados": "CE_UsuariosEmpleados",
    "ordenes_compra": "CE_OrdenesCompra",
    "orden_compra_items": "CE_OrdenCompraItems",
    "recepciones": "CE_Recepciones",
    "recepcion_items": "CE_RecepcionItems",
    "inventario_stock": "CE_InventarioStock",
    "movimientos_inventario": "CE_MovimientosInventario",
    "bitacora_auditoria": "CE_BitacoraAuditoria"
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU22", 0);
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
    aviso("Generando CU22 - Elementos muy pequeños...");

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
            "CU22 - Recepción de Mercadería - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU22 - Registrar Recepción Física de Prendas - Diagrama de Comunicación Elementos Muy Pequeños",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Encargado de Sucursal (actor externo)",
            "ACTOR_EncargadoSucursal",
            "Encargado de Sucursal que intenta registrar la recepción física de mercadería."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx; no tiene Route path='recepciones'."
        );

        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "web/src/components/layout/admin/AdminLayout.tsx; renderiza <Outlet />."
        );

        var adminMenu = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "adminMenu", "Object", "Class", "Boundary",
            "web/src/data/adminMenu.ts; contiene /admin/recepciones con implementado:false."
        );

        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx."
        );

        var adminOrdenesCompra = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminOrdenesCompra", "Object", "Class", "Boundary",
            "web/src/pages/admin/AdminOrdenesCompra.tsx; no tiene acción Recepcionar."
        );

        var adminPlaceholder = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminPlaceholder", "Object", "Class", "Boundary",
            "web/src/pages/admin/AdminPlaceholder.tsx; ruta wildcard de administración."
        );

        var enConstruccion = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "EnConstruccion", "Object", "Class", "Boundary",
            "web/src/pages/EnConstruccion.tsx."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts; no contiene método de recepción de compras."
        );

        var comprasAdminController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ComprasAdminController", "Object", "Class", "Control",
            "api/src/modulos/compras/CTR_Compras.ts; no expone :id/recepcion."
        );

        var comprasService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ComprasService", "Object", "Class", "Service",
            "api/src/modulos/compras/SRV_ComprasService.ts; no implementa recepción."
        );

        var inventarioModule = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "InventarioModule", "Object", "Class", "Service",
            "api/src/modulos/inventario/inventario.module.ts; no registra RecepcionController."
        );

        var spRecepcion = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sp_registrar_recepcion", "Object", "Class", "Service",
            "BASE DE DATOS/schema.sql: función PostgreSQL CU22; no tiene endpoint Nest."
        );

        var fnMovimiento = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "fn_aplicar_movimiento_inventario", "Object", "Class", "Service",
            "BASE DE DATOS/schema.sql: BEFORE INSERT sobre movimientos_inventario."
        );

        var triggerMovimiento = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "trg_movimiento_inventario", "Object", "Class", "Service",
            "BASE DE DATOS/schema.sql: trigger de aplicación del movimiento de inventario."
        );

        var kardexService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "KardexService", "Object", "Class", "Service",
            "api/src/modulos/inventario/SRV_KardexService.ts; consulta movimientos y saldo."
        );

        var proveedoresService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ProveedoresService", "Object", "Class", "Service",
            "api/src/modulos/proveedores/SRV_ProveedoresService.ts; calcularScore() lee recepciones."
        );

        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_BitacoraService.ts; no es invocado por la función SQL."
        );

        var usuariosEmpleados = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "usuarios_empleados", "Object", "Class", "Entity",
            "Tabla SQL para sucursal del empleado; no se consulta en la función de recepción."
        );

        var ordenesCompra = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ordenes_compra", "Object", "Class", "Entity",
            "Tabla SQL de órdenes de compra; estado real: Pendiente, Recibida, Anulada."
        );

        var ordenCompraItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "orden_compra_items", "Object", "Class", "Entity",
            "Tabla SQL de detalle de la orden; la función SQL no compara sus cantidades."
        );

        var recepciones = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "recepciones", "Object", "Class", "Entity",
            "Tabla SQL cabecera de recepciones."
        );

        var recepcionItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "recepcion_items", "Object", "Class", "Entity",
            "Tabla SQL de líneas recibidas; columnas: cantidad_pedida, cantidad_recibida, diferencia."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Tabla SQL real: id_ptc, id_sucursal, cantidad_disponible, cantidad_reservada, stock_minimo_alert."
        );

        var movimientosInventario = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "movimientos_inventario", "Object", "Class", "Entity",
            "Tabla SQL real del Kardex; no existe una tabla llamada kardex."
        );

        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "bitacora_auditoria", "Object", "Class", "Entity",
            "Tabla SQL de auditoría; la función de recepción no inserta en ella."
        );

        // Elementos muy pequeños, organizados por capas.
        posicionar(diagrama, actor, 20, 20, 150, 45);
        posicionar(diagrama, routerApp, 190, 20, 310, 45);
        posicionar(diagrama, adminLayout, 360, 20, 480, 45);
        posicionar(diagrama, adminMenu, 530, 20, 650, 45);
        posicionar(diagrama, authProvider, 700, 20, 820, 45);

        posicionar(diagrama, adminOrdenesCompra, 20, 75, 150, 100);
        posicionar(diagrama, adminPlaceholder, 190, 75, 310, 100);
        posicionar(diagrama, enConstruccion, 360, 75, 480, 100);
        posicionar(diagrama, api, 530, 75, 650, 100);
        posicionar(diagrama, comprasAdminController, 700, 75, 820, 100);

        posicionar(diagrama, comprasService, 20, 130, 150, 155);
        posicionar(diagrama, inventarioModule, 190, 130, 310, 155);
        posicionar(diagrama, spRecepcion, 360, 130, 480, 155);
        posicionar(diagrama, fnMovimiento, 530, 130, 650, 155);
        posicionar(diagrama, triggerMovimiento, 700, 130, 820, 155);

        posicionar(diagrama, usuariosEmpleados, 20, 185, 150, 210);
        posicionar(diagrama, ordenesCompra, 190, 185, 310, 210);
        posicionar(diagrama, ordenCompraItems, 360, 185, 480, 210);
        posicionar(diagrama, recepciones, 530, 185, 650, 210);
        posicionar(diagrama, recepcionItems, 700, 185, 820, 210);

        posicionar(diagrama, inventarioStock, 20, 240, 150, 265);
        posicionar(diagrama, movimientosInventario, 190, 240, 310, 265);
        posicionar(diagrama, kardexService, 360, 240, 480, 265);
        posicionar(diagrama, proveedoresService, 530, 240, 650, 265);
        posicionar(diagrama, bitacoraService, 700, 240, 820, 265);
        posicionar(diagrama, bitacoraAuditoria, 190, 295, 310, 320);

        // ============================================================
        // FLUJO WEB REAL: termina en la pantalla de construcción.
        // ============================================================

        agregarMensajes(diagrama, actor, routerApp, [
            "1: intenta abrir /admin/recepciones",
            "No existe una ruta explícita 'recepciones' bajo /admin"
        ], "message");

        agregarMensajes(diagrama, routerApp, adminLayout, [
            "2: Route /admin/* -> <AdminLayout />"
        ], "message");

        agregarMensajes(diagrama, routerApp, adminPlaceholder, [
            "3: Route * -> <AdminPlaceholder />"
        ], "message");

        agregarMensajes(diagrama, adminLayout, authProvider, [
            "4: useAuth() -> usuario / token",
            "sin token -> Navigate('/login'); con token -> <Outlet />"
        ], "message");

        agregarMensajes(diagrama, adminLayout, adminMenu, [
            "5: permitted = permisos.includes('*') || permisos.includes('gestionar_inventario')",
            "item: Recepción de Mercadería · CU22 · implementado:false",
            "schema.sql: el rol Encargado incluye gestionar_recepciones, no gestionar_inventario",
            "E4: sin permiso -> módulo no visible; el enlace no se muestra"
        ], "message");

        agregarMensajes(diagrama, adminMenu, adminLayout, [
            "6: el filtro no revisa implementado; solo el permiso decide visibilidad"
        ], "message");

        agregarMensajes(diagrama, adminPlaceholder, enConstruccion, [
            "7: titulo='Recepción de Mercadería'",
            "'Esta sección aún no está implementada. Pronto estará disponible.'"
        ], "return");

        agregarMensajes(diagrama, adminPlaceholder, api, [
            "8: NO EXISTE GET /api/v1/inventario/recepciones-pendientes",
            "api.ts no define listarRecepcionesPendientes()",
            "no hay POST, items_procesados ni toast 'Recepción registrada.'"
        ], "not-implemented");

        agregarMensajes(diagrama, adminOrdenesCompra, api, [
            "9: GET /api/v1/admin/ordenes-compra",
            "OPCIONES_ESTADO: Pendiente -> Ver, Editar, Anular; no Recepcionar"
        ], "message");

        agregarMensajes(diagrama, api, comprasAdminController, [
            "10: NO EXISTE POST /api/v1/admin/ordenes-compra/:id/recepcion",
            "NO EXISTE body { id_sucursal, items:[{ id_ptc, cantidad_recibida, cantidad_neta_ok }] }"
        ], "not-implemented");

        agregarMensajes(diagrama, comprasAdminController, comprasService, [
            "11: rutas actuales: GET, GET/opciones, GET/:id, POST, PUT, PATCH/:id/anular",
            "no existe método recepcionar()"
        ], "message");

        agregarMensajes(diagrama, comprasService, ordenesCompra, [
            "12: anularOrdenCompra() consulta estado y fecha_recepcion",
            "estado='Recibida' o fecha_recepcion != null -> 409",
            "error: 'No se puede anular una orden ya recibida.'"
        ], "validation");

        agregarMensajes(diagrama, comprasService, comprasService, [
            "13: ComprasService no contiene recepción, actualización de stock ni auditoría de CU22"
        ], "not-implemented");

        agregarMensajes(diagrama, inventarioModule, inventarioModule, [
            "14: controllers actuales: KardexController, AjustesController, AlertasController, ExistenciasController",
            "no registra RecepcionController ni llama sp_registrar_recepcion"
        ], "not-implemented");

        // ============================================================
        // SOPORTE EXISTENTE EN schema.sql, NO CONECTADO A LA WEB/API.
        // ============================================================

        agregarMensajes(diagrama, spRecepcion, spRecepcion, [
            "15: única implementación encontrada: función PostgreSQL schema.sql",
            "no está expuesta por HTTP",
            "NO EXISTE: 200 { detail: 'Recepción registrada.', items_procesados: n }",
            "E1-E3: no se implementan los mensajes ni las validaciones de la especificación",
            "E1: 'La cantidad recibida no puede exceder la pedida.'",
            "E2: 'La orden no está pendiente de recepción.'",
            "E3: 'No tiene permisos para recepcionar en esta sucursal.'"
        ], "not-implemented");

        agregarMensajes(diagrama, spRecepcion, usuariosEmpleados, [
            "16: NO EXISTE: permiso 'gestionar_inventario' / sucursal del usuario"
        ], "not-implemented");

        agregarMensajes(diagrama, spRecepcion, ordenesCompra, [
            "17: NO EXISTE: SELECT y validación de existencia, Pendiente y sucursal",
            "la función inserta primero la recepción"
        ], "not-implemented");

        agregarMensajes(diagrama, spRecepcion, ordenCompraItems, [
            "18: NO EXISTE: comparación de cantidad_recibida contra cantidad pedida",
            "NO EXISTE: cantidad_neta_ok / merma"
        ], "not-implemented");

        agregarMensajes(diagrama, spRecepcion, recepciones, [
            "19: INSERT recepciones (id_orden_compra, id_sucursal, id_usuario, estado)",
            "estado='Registrada'"
        ], "message");

        agregarMensajes(diagrama, spRecepcion, recepcionItems, [
            "20: INSERT recepcion_items (id_ptc, cantidad_recibida, diferencia)",
            "diferencia=0; no guarda cantidad_pedida en la función"
        ], "message");

        agregarMensajes(diagrama, spRecepcion, movimientosInventario, [
            "21: INSERT tipo_movimiento='Recepción', cantidad=+recibida",
            "referencia='Orden #' || p_id_orden",
            "NO es 'ENTRADA-COMPRA'"
        ], "message");

        agregarMensajes(diagrama, triggerMovimiento, fnMovimiento, [
            "22: BEFORE INSERT ON movimientos_inventario",
            "-> fn_aplicar_movimiento_inventario()"
        ], "message");

        agregarMensajes(diagrama, fnMovimiento, movimientosInventario, [
            "23: NEW.stock_anterior / NEW.stock_posterior",
            "NEW.fecha=NOW()"
        ], "message");

        agregarMensajes(diagrama, fnMovimiento, inventarioStock, [
            "24: INSERT/UPSERT por id_ptc + id_sucursal",
            "cantidad_disponible += NEW.cantidad",
            "columna real: stock_minimo_alert (no stock_minimo_alertado)",
            "no fija cantidad_reservada=0"
        ], "message");

        agregarMensajes(diagrama, spRecepcion, ordenesCompra, [
            "25: UPDATE estado='Recibida', fecha_recepcion=NOW()",
            "no exige que todas las líneas estén completas"
        ], "message");

        agregarMensajes(diagrama, spRecepcion, bitacoraService, [
            "26: NO EXISTE: llamada a bitacora.registrar(...)"
        ], "not-implemented");

        agregarMensajes(diagrama, bitacoraService, bitacoraAuditoria, [
            "27: registrar() -> repo.create(bitacora) / repo.save(bitacora)",
            "existe en la aplicación, pero no lo invoca sp_registrar_recepcion"
        ], "not-implemented");

        // ============================================================
        // EFECTOS QUE SÍ PUEDEN OBSERVARSE SI SE INVOCA LA FUNCIÓN SQL.
        // ============================================================

        agregarMensajes(diagrama, kardexService, movimientosInventario, [
            "28: GET /api/v1/admin/inventario/kardex consulta movimientos",
            "descripcionTipo('Recepción') cae en fallback; no coincide con ENTRADA-COMPRA"
        ], "message");

        agregarMensajes(diagrama, kardexService, inventarioStock, [
            "29: saldo_actual = disponible / reservada / vendida",
            "KardexService exige '*' o 'consultar_kardex', no 'gestionar_inventario'"
        ], "validation");

        agregarMensajes(diagrama, proveedoresService, ordenesCompra, [
            "30: calcularScore() usa estado='recibida' y fecha_recepcion",
            "CU20 no se dispara automáticamente al ejecutar sp_registrar_recepcion"
        ], "message");

        agregarMensajes(diagrama, proveedoresService, recepciones, [
            "31: scoring lee SUM(ri.cantidad_pedida / cantidad_recibida)"
        ], "message");

        agregarMensajes(diagrama, proveedoresService, movimientosInventario, [
            "32: scoring busca merma en movimientos_inventario"
        ], "message");

        try {
            diagrama.Notes =
                "CU22 - Estado real de la implementación actual (React/Vite + NestJS + schema.sql).\n" +
                "La interfaz /admin/recepciones no tiene Route explícita; cae en AdminPlaceholder y muestra: 'Esta sección aún no está implementada. Pronto estará disponible.'\n" +
                "No existen el método api de recepciones pendientes, el endpoint POST /api/v1/admin/ordenes-compra/:id/recepcion, CTR_Recepcion ni SRV_RecepcionService.\n" +
                "schema.sql sí define sp_registrar_recepcion(p_id_orden, p_id_usuario, p_id_sucursal, p_items, p_recepcion_id), pero ningún módulo Nest la invoca.\n" +
                "La función escribe estado 'Recibida', tipo de movimiento 'Recepción' y usa id_ptc; no valida Pendiente, sucursal, permisos, cantidades, merma ni auditoría.\n" +
                "El trigger fn_aplicar_movimiento_inventario sí actualiza inventario_stock.cantidad_disponible mediante movimientos_inventario, pero no fija cantidad_reservada=0.\n" +
                "La bitácora de auditoría y el score de CU20 solo pueden quedar incompletos si no se agrega una integración de aplicación.\n" +
                "La UI es React; no existen AdminRecepciones, RecepcionesComponent ni RecepcionesScreen, y no usa Angular ni MatDialog.\n";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU22 con elementos muy pequeños creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "La UI/API no están implementadas; se muestra el soporte PostgreSQL existente.\n" +
            "Los mensajes secundarios y las discrepancias fueron agrupados.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU22", 0);
    }
}

main();
