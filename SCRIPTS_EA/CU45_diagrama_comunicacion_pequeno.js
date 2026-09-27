// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU45 - Generar Reportes de Ventas e Inventario
// Diagrama de comunicación de trazabilidad.
//
// No se encontró una implementación de CU45 en React/Vite o NestJS.
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
    "Reportes (no implementado)": "IU_Reportes",
    "api": "IU_Api",
    "ReportesController (no implementado)": "CTR_Reportes",
    "ReportesService (no implementado)": "SRV_ReportesService",
    "DataSource": "SRV_DataSource",
    "ventas": "CE_Ventas",
    "venta_items": "CE_VentaItems",
    "comprobantes": "CE_Comprobantes",
    "inventario_stock": "CE_InventarioStock",
    "movimientos_inventario": "CE_MovimientosInventario",
    "productos": "CE_Productos",
    "categorias": "CE_Categorias",
    "temporadas": "CE_Temporadas",
    "sucursales": "CE_Sucursales"
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU45 trazabilidad", 0);
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
    aviso("Generando CU45 de trazabilidad...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "16. Reportes Gerenciales");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "16. Reportes Gerenciales");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU45 - Generar Reportes de Ventas e Inventario - Comunicación de trazabilidad"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU45 - Generar Reportes de Ventas e Inventario - Diagrama de Comunicación de Trazabilidad",
            "Communication"
        );

        var administrador = obtenerOCrearActor(
            raiz, paqueteActores,
            "Administrador de reportes (actor)",
            "ACTOR_AdministradorReportesGerenciales",
            "Actor previsto para consultar_reportes o *."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "Existe en React, pero no contiene una ruta /admin/reportes."
        );

        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "Contenedor real de /admin; no contiene una entrada Reportes."
        );

        var reportes = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Reportes (no implementado)", "Object", "Class", "Boundary",
            "No se encontró una pantalla de reportes de ventas e inventario."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "Existe api.ts, pero no contiene /reportes/ventas, /reportes/inventario ni descarga formal."
        );

        var reportesController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ReportesController (no implementado)", "Object", "Class", "Control",
            "No se encontró Controller para los endpoints de reportes gerenciales."
        );

        var reportesService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ReportesService (no implementado)", "Object", "Class", "Service",
            "No se encontró ReportesService.exportar() ni generación PDF/XLSX/CSV."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "DataSource genérico disponible; no está conectado a ReportesService."
        );

        var ventas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ventas", "Object", "Class", "Entity",
            "Fuente prevista para ventas completadas y agregados por sucursal, categoría y método."
        );

        var ventaItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "venta_items", "Object", "Class", "Entity",
            "Fuente prevista para detalle de líneas, cantidad, precio, subtotal e impuestos."
        );

        var comprobantes = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "comprobantes", "Object", "Class", "Entity",
            "Fuente prevista para número y datos del comprobante."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Fuente actual de existencias, reservas, ventas y umbral de alerta."
        );

        var movimientosInventario = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "movimientos_inventario", "Object", "Class", "Entity",
            "Fuente prevista para la sección Kardex del reporte de inventario."
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Fuente prevista para producto, categoría y filtros."
        );

        var categorias = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "categorias", "Object", "Class", "Entity",
            "Filtro y agrupación previstos por categoría."
        );

        var temporadas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "temporadas", "Object", "Class", "Entity",
            "Filtro previsto por temporada; no se observa uso en un reporte implementado."
        );

        var sucursales = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sucursales", "Object", "Class", "Entity",
            "Filtro y agrupación previstos por sucursal."
        );

        // Participantes compactos; cuatro filas.
        posicionar(diagrama, administrador, 20, 20, 170, 45);
        posicionar(diagrama, routerApp, 200, 20, 350, 45);
        posicionar(diagrama, adminLayout, 380, 20, 530, 45);
        posicionar(diagrama, reportes, 560, 20, 710, 45);
        posicionar(diagrama, api, 740, 20, 890, 45);
        posicionar(diagrama, reportesController, 920, 20, 1070, 45);

        posicionar(diagrama, reportesService, 20, 75, 170, 100);
        posicionar(diagrama, dataSource, 200, 75, 350, 100);
        posicionar(diagrama, ventas, 380, 75, 530, 100);
        posicionar(diagrama, ventaItems, 560, 75, 710, 100);
        posicionar(diagrama, comprobantes, 740, 75, 890, 100);
        posicionar(diagrama, inventarioStock, 920, 75, 1070, 100);

        posicionar(diagrama, movimientosInventario, 20, 130, 170, 155);
        posicionar(diagrama, productos, 200, 130, 350, 155);
        posicionar(diagrama, categorias, 380, 130, 530, 155);
        posicionar(diagrama, temporadas, 560, 130, 710, 155);
        posicionar(diagrama, sucursales, 740, 130, 890, 155);

        // ============================================================
        // SOLO 3 MENSAJES CONCEPTUALES.
        // ============================================================

        agregarMensaje(diagrama, administrador, reportes,
            "1: /admin/reportes; filtros, vista previa y Exportar; NO IMPLEMENTADO",
            "message");

        agregarMensaje(diagrama, reportes, reportesController,
            "2: GET /api/v1/reportes/ventas o /reportes/inventario; endpoint NO EXISTE",
            "message");

        agregarMensaje(diagrama, reportesController, reportesService,
            "3: ReportesService.exportar() -> DataSource; PDF/XLSX/CSV y StreamableFile; NO IMPLEMENTADO",
            "return");

        try {
            diagrama.Notes =
                "CU45 - No existe una implementación de Reportes de Ventas e Inventario en el proyecto React/Vite + NestJS. Este diagrama es de trazabilidad del caso solicitado." +
                String.fromCharCode(10) +
                "No se encontraron ReportesService, ReportesController, ReportesModule, páginas Reportes.tsx o ReportesVentasInventario.tsx, rutas /admin/reportes, métodos api /reportes/ventas y /reportes/inventario, ni descarga formal con StreamableFile." +
                String.fromCharCode(10) +
                "RouterApp sólo registra /admin/reportes/voz. El módulo existente ReportesVoz genera reportes de voz, pero no implementa filtros de ventas/inventario, vista previa paginada, PDF/XLSX/CSV gerencial ni el toast Reporte exportado." +
                String.fromCharCode(10) +
                "Los cuadros Reportes, ReportesController y ReportesService están marcados como no implementados. DataSource, api, RouterApp, AdminLayout y las entidades sí existen, pero no están conectados por un flujo real de CU45." +
                String.fromCharCode(10) +
                "No existe validación real de consultar_reportes, fechas, sucursal, categoría, temporada o formato. Tampoco existen las agregaciones por ventas completadas, métodos de pago, sucursal, categoría, ni la sección Kardex de movimientos_inventario." +
                String.fromCharCode(10) +
                "Los módulos AdminExistencias y AdminKardex sí tienen consultas y exportaciones propias, pero no constituyen un reporte unificado de CU45. No se encontró auditoría específica para la exportación formal." +
                String.fromCharCode(10) +
                "Las tablas ventas, venta_items, comprobantes, inventario_stock, movimientos_inventario, productos, categorias, temporadas y sucursales están disponibles como fuentes potenciales; las agregaciones y el archivo formal siguen pendientes.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU45 de trazabilidad creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "El diagrama marca explícitamente los componentes no implementados."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU45 trazabilidad", 0);
    }
}

main();
