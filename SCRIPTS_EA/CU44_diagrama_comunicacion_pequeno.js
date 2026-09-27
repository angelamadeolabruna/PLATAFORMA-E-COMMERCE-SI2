// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU44 - Dashboard Inteligente y KPIs
// Diagrama de comunicación de trazabilidad.
//
// No se encontró una implementación de CU44 en React/Vite o NestJS.
// Se muestran los participantes solicitados como conceptuales y se
// identifican explícitamente los elementos que no existen.
//
// No modifica código de la aplicación.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "RouterApp": "IU_RouterApp",
    "AdminLayout": "IU_AdminLayout",
    "Dashboard (no implementado)": "IU_Dashboard",
    "api": "IU_Api",
    "DashboardController (no implementado)": "CTR_Dashboard",
    "DashboardService (no implementado)": "SRV_DashboardService",
    "DataSource": "SRV_DataSource",
    "ventas": "CE_Ventas",
    "venta_items": "CE_VentaItems",
    "inventario_stock": "CE_InventarioStock",
    "reservas": "CE_Reservas",
    "sucursales": "CE_Sucursales",
    "productos": "CE_Productos",
    "ordenes_compra": "CE_OrdenesCompra"
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU44 trazabilidad", 0);
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
            elemento.Notes = actual == "" ? nota : actual + String.fromCharCode(10) + nota;
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

function main()
{
    aviso("Generando CU44 de trazabilidad...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "15. Dashboard");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "15. Dashboard");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU44 - Dashboard Inteligente y KPIs - Comunicación de trazabilidad"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU44 - Dashboard Inteligente y KPIs - Diagrama de Comunicación de Trazabilidad",
            "Communication"
        );

        var administrador = obtenerOCrearActor(
            raiz, paqueteActores,
            "Administrador de indicadores (actor)",
            "ACTOR_AdministradorDashboard",
            "Actor previsto para consultar_reportes o *."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "Existe en React, pero no contiene una ruta /admin/dashboard."
        );

        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "Contenedor real de las rutas /admin; no contiene una entrada Dashboard."
        );

        var dashboard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Dashboard (no implementado)", "Object", "Class", "Boundary",
            "No se encontró una pantalla Dashboard en web/src."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "Existe api.ts, pero no contiene dashboard/kpis ni exportación CSV."
        );

        var dashboardController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DashboardController (no implementado)", "Object", "Class", "Control",
            "No se encontró un Controller para /api/v1/dashboard/kpis."
        );

        var dashboardService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DashboardService (no implementado)", "Object", "Class", "Service",
            "No se encontró DashboardService.obtenerKpis() ni sus agregaciones."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "DataSource genérico disponible; no está conectado a un servicio Dashboard."
        );

        var ventas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ventas", "Object", "Class", "Entity",
            "Fuente prevista para ventas_totales, ticket_promedio y ventas por sucursal/mes."
        );

        var ventaItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "venta_items", "Object", "Class", "Entity",
            "Fuente prevista para topProductos por SUM(cantidad)."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Fuente prevista para existencias, agotadas y alertas de stock bajo."
        );

        var reservas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "reservas", "Object", "Class", "Entity",
            "Fuente prevista para reservasPorEstado."
        );

        var sucursales = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sucursales", "Object", "Class", "Entity",
            "Fuente y filtro previsto por id_sucursal."
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Fuente prevista para categorías y topProductos."
        );

        var ordenesCompra = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ordenes_compra", "Object", "Class", "Entity",
            "Fuente prevista para proximas_a_ingresar; no se implementa el KPI."
        );

        // Participantes compactos; tres filas.
        posicionar(diagrama, administrador, 20, 20, 170, 45);
        posicionar(diagrama, routerApp, 200, 20, 350, 45);
        posicionar(diagrama, adminLayout, 380, 20, 530, 45);
        posicionar(diagrama, dashboard, 560, 20, 710, 45);
        posicionar(diagrama, api, 740, 20, 890, 45);
        posicionar(diagrama, dashboardController, 920, 20, 1070, 45);

        posicionar(diagrama, dashboardService, 20, 75, 170, 100);
        posicionar(diagrama, dataSource, 200, 75, 350, 100);
        posicionar(diagrama, ventas, 380, 75, 530, 100);
        posicionar(diagrama, ventaItems, 560, 75, 710, 100);
        posicionar(diagrama, inventarioStock, 740, 75, 890, 100);
        posicionar(diagrama, reservas, 920, 75, 1070, 100);

        posicionar(diagrama, sucursales, 20, 130, 170, 155);
        posicionar(diagrama, productos, 200, 130, 350, 155);
        posicionar(diagrama, ordenesCompra, 380, 130, 530, 155);

        // ============================================================
        // SOLO 3 MENSAJES CONCEPTUALES.
        // ============================================================

        agregarMensaje(diagrama, administrador, dashboard,
            "1: /admin/dashboard; definir desde, hasta e id_sucursal; NO IMPLEMENTADO",
            "message");

        agregarMensaje(diagrama, dashboard, dashboardController,
            "2: GET /api/v1/dashboard/kpis; api.ts no tiene método; endpoint NO EXISTE",
            "message");

        agregarMensaje(diagrama, dashboardController, dashboardService,
            "3: DashboardController -> DashboardService.obtenerKpis() -> DataSource; agregados y return KPIs; NO IMPLEMENTADO",
            "return");

        try {
            diagrama.Notes =
                "CU44 - No existe una implementación de Dashboard Inteligente y KPIs en el proyecto React/Vite + NestJS. Se crea este diagrama como trazabilidad del caso solicitado, no como una afirmación de funcionalidad existente." +
                String.fromCharCode(10) +
                "No se encontraron páginas Dashboard.tsx, DashboardService, DashboardController, DashboardModule, método api para dashboard/kpis, ruta /admin/dashboard, gráficos, tarjetas KPI ni exportación CSV." +
                String.fromCharCode(10) +
                "RouterApp sólo registra /admin/reportes/voz dentro de AdminLayout; el menú adminMenu no contiene una entrada Dashboard. AdminLayout tampoco tiene un control de Acceso denegado específico para esta ruta." +
                String.fromCharCode(10) +
                "Los cuadros Dashboard, DashboardController y DashboardService están marcados como no implementados. DataSource, api, RouterApp, AdminLayout y las entidades sí tienen implementación o tablas relacionadas, pero no están conectados por un flujo real de CU44." +
                String.fromCharCode(10) +
                "No existe validación real de consultar_reportes, fechas, sucursal, filtros, agregaciones, skeleton, intervalo de refresco, gráficos o CSV para este caso. Los mensajes 403, 422, 200 con cero y Sin datos para exportar. no tienen un endpoint que los produzca." +
                String.fromCharCode(10) +
                "Las tablas necesarias sí están presentes: ventas y venta_items, inventario_stock, reservas, sucursales, productos y ordenes_compra. El KPI proximas_a_ingresar y las series subdivididas por mes/sucursal todavía deben implementarse." +
                String.fromCharCode(10) +
                "La línea de tiempo, los filtros por período y la exportación CSV son requisitos de diseño; no existe código actual que los ejecute.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU44 de trazabilidad creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "El diagrama marca explícitamente los componentes no implementados."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU44 trazabilidad", 0);
    }
}

main();
