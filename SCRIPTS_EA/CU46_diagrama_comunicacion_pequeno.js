// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU46 - Emitir Alertas Críticas
// Diagrama de comunicación de trazabilidad.
//
// Existe una implementación parcial de alertas de stock (CU25), pero
// no existe el proceso unificado de alertas críticas de CU46.
//
// No modifica código de la aplicación.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "AdminAlertas": "IU_AdminAlertas",
    "AdminLayout": "IU_AdminLayout",
    "api": "IU_Api",
    "AlertasCriticasController (no implementado)": "CTR_AlertasCriticas",
    "AlertasService": "SRV_AlertasService",
    "AlertasCriticasService (no implementado)": "SRV_AlertasCriticasService",
    "SchedulerService": "SRV_SchedulerService",
    "DataSource": "SRV_DataSource",
    "inventario_stock": "CE_InventarioStock",
    "alertas_stock_config": "CE_AlertasStockConfig",
    "reservas": "CE_Reservas",
    "producto_talla_color": "CE_ProductoTallaColor",
    "productos": "CE_Productos",
    "sucursales": "CE_Sucursales",
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU46 trazabilidad", 0);
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
    aviso("Generando CU46 de trazabilidad...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "17. Alertas Críticas");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "17. Alertas Críticas");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU46 - Emitir Alertas Críticas - Comunicación de trazabilidad"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU46 - Emitir Alertas Críticas - Diagrama de Comunicación de Trazabilidad",
            "Communication"
        );

        var sistema = obtenerOCrearActor(
            raiz, paqueteActores,
            "Sistema de alertas (actor)",
            "ACTOR_SistemaAlertas",
            "Proceso automático previsto; el SchedulerService actual sólo ejecuta respaldos."
        );

        var receptor = obtenerOCrearActor(
            raiz, paqueteActores,
            "Administrador/Encargado (actor)",
            "ACTOR_ReceptorAlertas",
            "Usuarios que consultarían las alertas de su alcance."
        );

        var adminAlertas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminAlertas", "Object", "Class", "Boundary",
            "pages/admin/AdminAlertas.tsx implementa sólo alertas y umbrales de stock."
        );

        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "Muestra un badge de alertas de stock y otro de reservas, pero no Alertas Críticas."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "api.listarAlertas() y contarReservasPendientes() existen; no existe /admin/alertas/criticas."
        );

        var alertasController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AlertasCriticasController (no implementado)", "Object", "Class", "Control",
            "No existe el endpoint combinado GET /api/v1/admin/alertas/criticas."
        );

        var alertasService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AlertasService", "Object", "Class", "Service",
            "Implementación parcial de CU25: listar(), obtenerOpciones() y configurar()."
        );

        var alertasCriticasService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AlertasCriticasService (no implementado)", "Object", "Class", "Service",
            "No existe el servicio que consolida quiebres, reservas, caché y correo."
        );

        var schedulerService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "SchedulerService", "Object", "Class", "Service",
            "Existe y ejecuta un ciclo de 60 s, pero sólo para respaldos automáticos."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "DataSource usado por AlertasService, ReservasService y el servicio conceptual."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Cantidad disponible y stock_minimo_alert por id_ptc e id_sucursal."
        );

        var alertasStockConfig = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "alertas_stock_config", "Object", "Class", "Entity",
            "notificar_email y ultima_notificacion; fn_detectar_stock_bajo existe en schema.sql."
        );

        var reservas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "reservas", "Object", "Class", "Entity",
            "Estados, fecha_creacion, fecha_reserva y hora_reserva para detectar retrasos."
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Relación de variante para el detalle de quiebres."
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Nombre y categoría del producto en la alerta."
        );

        var sucursales = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sucursales", "Object", "Class", "Entity",
            "Sucursal y alcance del receptor."
        );

        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "bitacora_auditoria", "Object", "Class", "Entity",
            "La lectura de alertas críticas con SELECT no tiene implementación."
        );

        // Participantes compactos; cuatro filas.
        posicionar(diagrama, sistema, 20, 20, 170, 45);
        posicionar(diagrama, receptor, 200, 20, 350, 45);
        posicionar(diagrama, adminAlertas, 380, 20, 530, 45);
        posicionar(diagrama, adminLayout, 560, 20, 710, 45);
        posicionar(diagrama, api, 740, 20, 890, 45);
        posicionar(diagrama, alertasController, 920, 20, 1070, 45);

        posicionar(diagrama, alertasService, 20, 75, 170, 100);
        posicionar(diagrama, alertasCriticasService, 200, 75, 350, 100);
        posicionar(diagrama, schedulerService, 380, 75, 530, 100);
        posicionar(diagrama, dataSource, 560, 75, 710, 100);
        posicionar(diagrama, inventarioStock, 740, 75, 890, 100);
        posicionar(diagrama, alertasStockConfig, 920, 75, 1070, 100);

        posicionar(diagrama, reservas, 20, 130, 170, 155);
        posicionar(diagrama, productoTallaColor, 200, 130, 350, 155);
        posicionar(diagrama, productos, 380, 130, 530, 155);
        posicionar(diagrama, sucursales, 560, 130, 710, 155);
        posicionar(diagrama, bitacoraAuditoria, 740, 130, 890, 155);

        // ============================================================
        // SOLO 3 MENSAJES DE TRAZABILIDAD.
        // ============================================================

        agregarMensaje(diagrama, sistema, alertasCriticasService,
            "1: ciclo cada 60 s; detectar quiebres y reservas; NO IMPLEMENTADO",
            "message");

        agregarMensaje(diagrama, receptor, alertasController,
            "2: GET /api/v1/admin/alertas/criticas; endpoint combinado NO EXISTE",
            "message");

        agregarMensaje(diagrama, alertasCriticasService, dataSource,
            "3: consultas, caché, correo y SELECT de auditoría; return { quiebres, reservas_sin_atender }; NO IMPLEMENTADO",
            "return");

        try {
            diagrama.Notes =
                "CU46 - No existe una implementación unificada de Alertas Críticas. Existe una implementación parcial de CU25 para stock mínimo en AlertasService, AlertasController y AdminAlertas." +
                String.fromCharCode(10) +
                "El endpoint real parcial es GET /api/v1/admin/inventario/alertas. No existe GET /api/v1/admin/alertas/criticas, no existe /admin/alertas/criticas y no existe una página que combine quiebres con reservas." +
                String.fromCharCode(10) +
                "SchedulerService sí usa setInterval(..., 60_000), pero en cada ciclo llama RespaldosService.verificarEjecucionAutomatica(); no ejecuta alertas, reservas, caché ni correo." +
                String.fromCharCode(10) +
                "AlertasService.listar() detecta cantidad_disponible <= stock_minimo_alert cuando stock_minimo_alert > 0, une producto, talla, color y sucursal, y devuelve el total. No clasifica Sin stock/Stock bajo, no filtra sucursales activas, no incluye reservas y no registra SELECT en bitácora." +
                String.fromCharCode(10) +
                "La tabla alertas_stock_config y la función schema.sql.fn_detectar_stock_bajo() contienen notificar_email y ultima_notificacion con ventana de 24 horas, pero no están conectadas a AlertasService, SchedulerService ni SMTP." +
                String.fromCharCode(10) +
                "El conteo de reservas existente, contarPendientesSucursal(), cuenta estados Solicitada y Preparada sin aplicar las 120 minutos ni fecha_reserva vencida. AdminLayout lo consulta cada 30 segundos, no 60, y el badge no representa reservas sin atender." +
                String.fromCharCode(10) +
                "AdminAlertas implementa Alertas de Stock Mínimo, filtros de sucursal y configuración de umbrales. El menú AdminLayout muestra un badge de stock y otro de reservas, pero no un total crítico unificado. AdminAlertas muestra Sin alertas de stock, no Sin alertas críticas. Todo en orden." +
                String.fromCharCode(10) +
                "El permiso real de AlertasService es * o gestionar_inventario. El caso también menciona gestionar_reservas para el receptor, pero no existe un permiso combinado para CU46. La semilla Encargado de schema.sql concede editar_inventario, no gestionar_inventario, por lo que puede quedar fuera del acceso real." +
                String.fromCharCode(10) +
                "No existe caché de corta duración, envío SMTP, actualización de ultima_notificacion, registro en api-server.err.log, polling de 60 s para alertas críticas ni autorresolución cacheada. Las alertas de stock se recalculan sólo al consultar el endpoint parcial." +
                String.fromCharCode(10) +
                "Las entidades necesarias existen, pero no hay una transacción o proceso programado que combine inventario_stock, alertas_stock_config y reservas. El diagrama marca la parte real y la parte pendiente de CU46.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU46 de trazabilidad creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "El diagrama distingue la alerta de stock existente del proceso crítico no implementado."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU46 trazabilidad", 0);
    }
}

main();
