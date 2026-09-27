// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU43 - Generar Reporte por Comando de Voz (IA)
// Diagrama de comunicación mínimo.
//
// Se conservan únicamente los participantes esenciales y 3 mensajes.
// Los detalles secundarios quedan en las notas del diagrama.
//
// Fuente de verdad: React/Vite + NestJS + schema.sql.
// No modifica código de la aplicación.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "ReportesVoz": "IU_ReportesVoz",
    "api": "IU_Api",
    "ReportesVozController": "CTR_ReportesVoz",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "ReportesVozService": "SRV_ReportesVozService",
    "DataSource": "SRV_DataSource",
    "reportes_generativos": "CE_ReportesGenerativos",
    "bitacora_auditoria": "CE_BitacoraAuditoria",
    "ventas": "CE_Ventas",
    "venta_items": "CE_VentaItems",
    "inventario_stock": "CE_InventarioStock",
    "sucursales": "CE_Sucursales",
    "producto_talla_color": "CE_ProductoTallaColor",
    "productos": "CE_Productos"
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU43 mínimo", 0);
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
    aviso("Generando CU43 mínimo...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "14. Reportes por Voz");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "14. Reportes por Voz");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU43 - Generar Reporte por Comando de Voz - Comunicación mínima"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU43 - Generar Reporte por Comando de Voz - Diagrama de Comunicación Mínimo",
            "Communication"
        );

        var administrador = obtenerOCrearActor(
            raiz, paqueteActores,
            "Administrador de reportes (actor)",
            "ACTOR_AdministradorReportes",
            "Usuario con consultar_reportes o *; la semilla schema.sql concede * al Administrador."
        );

        var motorVoz = obtenerOCrearActor(
            raiz, paqueteActores,
            "Servicio STT/IA de voz (actor opcional)",
            "ACTOR_STT_IA",
            "STT_SERVICE_URL transcribe el audio e IA_SERVICE_URL interpreta la intención."
        );

        var reportesVoz = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ReportesVoz", "Object", "Class", "Boundary",
            "pages/admin/ReportesVoz.tsx: MediaRecorder, Web Speech API, Confirmar y Ver/Descargar."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "api.generarReporteVoz(): POST multipart /api/v1/reportes/voz."
        );

        var reportesVozController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ReportesVozController", "Object", "Class", "Control",
            "CTR_ReportesVoz.ts: FileInterceptor('audio') y Body texto."
        );

        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "Exige JWT válido antes de invocar ReportesVozService."
        );

        var reportesVozService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ReportesVozService", "Object", "Class", "Service",
            "procesar(), transcribirAudio(), extraerIntencion(), generarReporte() y registrarReporte()."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "TypeORM DataSource y queryRunner para datos, reportes_generativos y bitácora."
        );

        var reportesGenerativos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "reportes_generativos", "Object", "Class", "Entity",
            "Registra tipo, parametros, formato, url_archivo, fecha e id_usuario."
        );

        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "bitacora_auditoria", "Object", "Class", "Entity",
            "INSERT de reportes_generativos con tipo, formato y url."
        );

        var ventas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ventas", "Object", "Class", "Entity",
            "Datos de ventas por sucursal y rango temporal."
        );

        var ventaItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "venta_items", "Object", "Class", "Entity",
            "Detalle de productos, cantidad, precio y subtotal del reporte."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Datos de inventario y disponibilidad por sucursal."
        );

        var sucursales = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sucursales", "Object", "Class", "Entity",
            "Resuelve el nombre de sucursal y filtra los reportes."
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Relaciona productos y variantes en el detalle de reportes."
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Aporta código, nombre y categoría de las prendas."
        );

        // Participantes esenciales; seis columnas y tres filas compactas.
        posicionar(diagrama, administrador, 20, 20, 170, 45);
        posicionar(diagrama, reportesVoz, 200, 20, 350, 45);
        posicionar(diagrama, api, 380, 20, 530, 45);
        posicionar(diagrama, reportesVozController, 560, 20, 710, 45);
        posicionar(diagrama, jwtAuthGuard, 740, 20, 890, 45);
        posicionar(diagrama, reportesVozService, 920, 20, 1070, 45);

        posicionar(diagrama, motorVoz, 20, 75, 170, 100);
        posicionar(diagrama, dataSource, 200, 75, 350, 100);
        posicionar(diagrama, reportesGenerativos, 380, 75, 530, 100);
        posicionar(diagrama, bitacoraAuditoria, 560, 75, 710, 100);
        posicionar(diagrama, ventas, 740, 75, 890, 100);
        posicionar(diagrama, ventaItems, 920, 75, 1070, 100);

        posicionar(diagrama, inventarioStock, 20, 130, 170, 155);
        posicionar(diagrama, sucursales, 200, 130, 350, 155);
        posicionar(diagrama, productoTallaColor, 380, 130, 530, 155);
        posicionar(diagrama, productos, 560, 130, 710, 155);

        // ============================================================
        // SOLO 3 MENSAJES ESENCIALES.
        // ============================================================

        agregarMensaje(diagrama, administrador, reportesVoz,
            "1: /admin/reportes/voz; micrófono o texto -> api.generarReporteVoz(): multipart audio/texto",
            "message");

        agregarMensaje(diagrama, reportesVozController, reportesVozService,
            "2: JwtAuthGuard; consultar_reportes; STT_SERVICE_URL o texto; IA_SERVICE_URL/NLP; confirmar período, sucursal y formato",
            "message");

        agregarMensaje(diagrama, reportesVozService, dataSource,
            "3: consultar datos; generar PDF/XLSX/CSV; guardar archivo; registrar reportes_generativos y bitácora; return 201 { id_reporte, url_archivo, resumen }",
            "return");

        try {
            diagrama.Notes =
                "CU43 - La ruta real es /admin/reportes/voz dentro de AdminLayout. ReportesVoz.tsx no realiza una comprobación propia de consultar_reportes; el bloqueo real ocurre en ReportesVozService y el menú de AdminLayout sólo oculta el enlace." +
                String.fromCharCode(10) +
                "El frontend captura MediaRecorder y Web Speech API. api.generarReporteVoz() siempre construye FormData y envía audio y texto; ReportesVozService prioriza texto no vacío y sólo invoca STT_SERVICE_URL cuando no recibe texto." +
                String.fromCharCode(10) +
                "STT_SERVICE_URL e IA_SERVICE_URL tienen valores por defecto localhost, pero no aparecen en api/.env.example. transcribirAudio() no establece timeout; extraerIntencion() degrada a reglas locales si falla la IA, no devuelve HTTP 504." +
                String.fromCharCode(10) +
                "La extracción local reconoce palabras clave para tipo y formato, pero devuelve formato: 'pdf' aunque haya detectado Excel o CSV. La expresión de sucursal puede capturar texto adicional y la IA externa puede devolver valores inválidos; normalizarIntencion() termina usando ventas y PDF como valores por defecto." +
                String.fromCharCode(10) +
                "Si faltan sucursal o período, procesar() devuelve id_reporte = 0 y una pregunta de confirmación, pero no persiste una conversación ni un estado pendiente. La UI muestra la pregunta como texto y el usuario debe enviar otro comando." +
                String.fromCharCode(10) +
                "La consulta de ventas usa v.fecha, pero schema.sql define ventas.fecha_venta. El reporte de ventas puede fallar con el esquema entregado. Los reportes de inventario y disponibilidad consultan existencias actuales y no filtran por el período extraído." +
                String.fromCharCode(10) +
                "La validación local sólo obtiene una sucursal que ya existe; si IA_SERVICE_URL devuelve un id_sucursal numérico arbitrario, validarParametros() no vuelve a consultar sucursales y el reporte puede quedar vacío en vez de devolver Sucursal no encontrada." +
                String.fromCharCode(10) +
                "El servicio genera PDF con pdf-lib, XLSX con xlsx y CSV; un conjunto vacío produce un resumen con (sin datos en el período) y el PDF añade No hay datos en el período seleccionado. El controller responde 201, incluso para el paso de confirmación, no 200." +
                String.fromCharCode(10) +
                "guardarArchivo() siempre escribe en STORAGE_PATH local y devuelve /storage/reportes/{nombre}; la propiedad storageBackend no se usa para S3. main.ts no configura un middleware de archivos estáticos para esa URL, por lo que Ver/Descargar puede devolver 404 aunque exista el archivo." +
                String.fromCharCode(10) +
                "registrarReporte() inserta reportes_generativos y bitacora_auditoria en una transacción QueryRunner. Si el guardado previo funciona y falla la base de datos, el archivo puede quedar huérfano; si falla el guardado, no se inserta el reporte." +
                String.fromCharCode(10) +
                "El frontend no mantiene historial de reportes ni llama a un endpoint de listados; sólo conserva el reporte actual en estado React. La respuesta usa resúmenes como Reporte de ventas: N registros, total Bs X, no el texto exacto Reporte generado: 12 ventas." +
                String.fromCharCode(10) +
                "La semilla de roles de schema.sql no asigna consultar_reportes al Administrador, sólo *; el catálogo de permisos de RolesService sí lo ofrece. E1, E2 y los mensajes de validación se aplican en el backend, no mediante una pantalla Acceso denegado." +
                String.fromCharCode(10) +
                "Las tablas usuarios, roles, categorias, tallas y colores se omitieron por ser contexto auxiliar o relaciones de joins; ReportesVozService las consulta para autorización, sucursal y detalle.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU43 mínimo creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Clases y entidades esenciales conservadas; 3 mensajes."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU43 mínimo", 0);
    }
}

main();
