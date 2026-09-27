// ================================================================
// CU43 - GENERAR REPORTE POR COMANDO DE VOZ (IA)
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   api/src/modulos/reportes-voz/CTR_ReportesVoz.ts:8   @Controller('reportes/voz'), 1 POST
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:70  STT_SERVICE_URL con fallback localhost
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:71  IA_SERVICE_URL con fallback localhost
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:73  storageBackend asignado y sin usar
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:78  asegarStorage sin await en el constructor
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:131  comprueba consultar_reportes
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:142  fetch del STT sin timeout
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:177  la IA normaliza a ventas por defecto
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:199  detecta formato y luego lo tira
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:249  regex de sucursal demasiado greedy
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:261  devuelve formato pdf literal
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:268  la confirmacion imprime el id, no el nombre
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:296  usa v.fecha: la columna es fecha_venta
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:393  el PDF corta a 40 filas
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:427  url fija que no sigue a STORAGE_PATH
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:441  transaction con QueryRunner
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:447  bitacora por SQL crudo, con IP y agente
//   api/src/modulos/reportes-voz/agregar-permiso.js:4  CONTRASENA DE PRODUCCION en el codigo
//   api/src/modulos/reportes-voz/ejecutar-migracion.js:6  si usa process.env
//   api/src/main.ts:20                     prefijo api/v1 y nada de estaticos
//   web/src/pages/admin/ReportesVoz.tsx   MediaRecorder, Web Speech y ambos botones
//   web/src/data/adminMenu.ts:249         permiso consultar_reportes, el mismo del servicio
//   package.json                          sin @nestjs/serve-static, con pdf-lib y pdfkit
//   schema.sql:534  reportes_generativos, version laxa
//   migration_reportes_generativos.sql    version estricta, con NOT NULL y dos indices
//
// Sin estereotipo: el rol va en el nombre IU_ / CTR_ / SRV_ / CE_.
// Diagrama estatico: sin mensajes, sin lineas de vida, sin secuencia.
// Autorreparable. Una instruccion por linea. Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================

var ALTO = 14;
var SALTO = String.fromCharCode(10);
var VIS_PUB = 0;
var VIS_PRI = 1;
var RAIZ = Repository.Models.GetAt(0);
var TOTAL_REL = 65;
var TOTAL_ATR = 101;
var TOTAL_OPE = 29;

var DEF = [
    ["IU_ReportesVoz", "EXISTE. web/src/pages/admin/ReportesVoz.tsx", "graba, transcribe en el navegador y lee la respuesta en voz",
     [["estaGrabando", "Boolean", VIS_PUB], ["procesando", "Boolean", VIS_PUB], ["textoTranscrito", "String", VIS_PUB], ["reporte", "Object = null", VIS_PUB], ["error", "String = null", VIS_PUB], ["mediaRecorderRef", "MediaRecorder = null", VIS_PRI], ["recognitionRef", "SpeechRecognition = null", VIS_PRI], ["chunksRef", "Array de Blob", VIS_PRI]],
     [["iniciarGrabacion", "void", [], VIS_PUB], ["detenerGrabacion", "void", [], VIS_PUB], ["enviarComando", "void", ["audio"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_AdminMenu", "EXISTE. web/src/data/adminMenu.ts:246", "oculta el modulo por permiso, sin segunda puerta en la pagina",
     [["items", "Array", VIS_PUB]],
     [["visible", "Boolean", ["permiso", "permisos"], VIS_PUB]]],

    ["IU_Api", "EXISTE. web/src/lib/api.ts:2048", "generarReporteVoz manda FormData con audio y texto",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["generarReporteVoz", "Object", ["audio", "texto"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_ReportesVoz", "EXISTE. reportes-voz/CTR_ReportesVoz.ts, 31 lineas", "un solo POST con JwtAuthGuard",
     [["reportesVozService", "ReportesVozService", VIS_PRI]],
     [["procesar", "Object", ["currentUser", "dto"], VIS_PUB]]],

    ["SRV_ReportesVozService", "EXISTE. reportes-voz/SRV_ReportesVozService.ts, 461 lineas", "17 metodos; el nucleo esta bien hecho",
     [["dataSource", "DataSource", VIS_PRI], ["logger", "Logger", VIS_PRI], ["sttUrl", "String = localhost:8001", VIS_PRI], ["iaUrl", "String = localhost:8002", VIS_PRI], ["storagePath", "String = ./storage/reportes", VIS_PRI], ["storageBackend", "String = local, NUNCA se usa", VIS_PRI]],
     [["asegarStorage", "void", [], VIS_PRI], ["procesar", "Object", ["usuario", "dto"], VIS_PUB], ["exigirPermisoReportes", "void", ["usuario"], VIS_PRI], ["transcribirAudio", "String", ["audioBuffer"], VIS_PRI], ["extraerIntencion", "Intencion", ["texto"], VIS_PRI], ["normalizarIntencion", "Intencion", ["data"], VIS_PRI], ["extraerIntencionLocal", "Intencion", ["texto"], VIS_PRI], ["generarPreguntaConfirmacion", "String", ["intencion"], VIS_PRI], ["validarParametros", "void", ["intencion"], VIS_PRI], ["generarReporte", "Object", ["intencion"], VIS_PUB], ["generarPDF", "Buffer", ["filas", "columnas", "titulo"], VIS_PUB], ["generarXLSX", "Buffer", ["filas", "columnas"], VIS_PUB], ["generarCSV", "Buffer", ["filas", "columnas"], VIS_PUB], ["guardarArchivo", "String", ["buffer", "nombre"], VIS_PUB], ["registrarReporte", "Integer", ["usuario", "intencion", "url"], VIS_PUB]]],

    ["SRV_SttExterno", "EXISTE. SRV_ReportesVozService.ts:136", "sin timeout y con fallback a localhost:8001",
     [["sttUrl", "String = process.env o localhost", VIS_PRI]],
     [["transcribir", "String", ["audioBuffer"], VIS_PUB]]],

    ["SRV_IaExterna", "EXISTE. SRV_ReportesVozService.ts:151", "si falla, cae a las reglas locales sin avisar",
     [["iaUrl", "String = process.env o localhost", VIS_PRI]],
     [["interpretar", "Intencion", ["texto"], VIS_PUB], ["normalizar", "Intencion", ["data"], VIS_PUB]]],

    ["SRV_AlmacenamientoReporte", "EXISTE. SRV_ReportesVozService.ts:423", "escribe en disco y devuelve una url fija",
     [["storagePath", "String = process.env o ./storage/reportes", VIS_PRI], ["urlFija", "String = /storage/reportes", VIS_PRI]],
     [["guardar", "String", ["buffer", "nombre"], VIS_PUB], ["asegurarDirectorio", "void", [], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "EXISTE. seguridad/dependencias.ts", "el unico guard del caso, y si es obligatorio",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB]]],

    ["CE_ProcesarComandoDto", "EXISTE. reportes-voz/CTR_ReportesVoz.ts", "audio opcional, texto opcional, y ninguno es obligatorio",
     [["audio", "File = opcional", VIS_PUB], ["texto", "String = opcional", VIS_PUB]],
     []],

    ["CE_ResultadoReporte", "EXISTE. SRV_ReportesVozService.ts y api.ts:2101", "id_reporte 0 significa que solo es una pregunta",
     [["id_reporte", "Integer = 0 si es confirmacion", VIS_PUB], ["url_archivo", "String = vacio si es confirmacion", VIS_PUB], ["resumen", "String", VIS_PUB]],
     []],

    ["CE_Intencion", "EXISTE. SRV_ReportesVozService.ts", "el resultado de interpretar el comando",
     [["tipo", "String = ventas|inventario|disponibilidad", VIS_PUB], ["desde", "Date = nullable", VIS_PUB], ["hasta", "Date = nullable", VIS_PUB], ["id_sucursal", "Integer = nullable", VIS_PUB], ["formato", "String = pdf|xlsx|csv", VIS_PUB], ["confirmacion", "Boolean", VIS_PUB]],
     []],

    ["CE_ReporteGenerativo", "EXISTE. schema.sql:534, version laxa", "la migracion del mismo nombre la crea con NOT NULL",
     [["id_reporte", "Integer = PK", VIS_PRI], ["id_usuario", "Integer = nullable en schema, NOT NULL en la migracion", VIS_PUB], ["tipo", "String = 40, nullable en schema", VIS_PUB], ["parametros", "JSONB, nullable en schema", VIS_PUB], ["formato", "String = 10, nullable en schema", VIS_PUB], ["url_archivo", "Text, nullable en schema", VIS_PUB], ["fecha", "Timestamp = NOW(), nunca se escribe", VIS_PUB]],
     []],

    ["CE_Venta", "EXISTE. ventas (schema.sql:384)", "el reporte pide v.fecha y la columna se llama fecha_venta",
     [["id_venta", "Integer = PK", VIS_PRI], ["id_cliente", "Integer = nullable", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB], ["impuestos", "Decimal(12,2)", VIS_PUB], ["total", "Decimal(12,2)", VIS_PUB], ["estado", "String = 20", VIS_PUB], ["fecha_venta", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_VentaItem", "EXISTE. venta_items (schema.sql:399)", "una fila por item, y el reporte los cuenta como ventas",
     [["id_venta_item", "Integer = PK", VIS_PRI], ["id_venta", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["precio_unitario", "Decimal(10,2)", VIS_PUB]],
     []],

    ["CE_Cliente", "EXISTE. clientes (schema.sql:87)", "LEFT JOIN, para que la venta de consumidor final tambien salga",
     [["id_cliente", "Integer = PK", VIS_PRI], ["nombre", "String = 150", VIS_PUB]],
     []],

    ["CE_Sucursal", "EXISTE. sucursales", "se resuelve por LIKE con el resto de la frase, y falla",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. usuarios (schema.sql:32)", "dueno del reporte y de la bitacora",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120 UNIQUE", VIS_PRI], ["estado", "String = Pendiente", VIS_PUB]],
     []],

    ["CE_Rol", "EXISTE. roles; permisos_json en schema.sql:573", "consultar_reportes NO esta en ninguno de los 5 roles",
     [["id_rol", "Integer = PK", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["descripcion", "String", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "EXISTE. usuarios_roles con PK compuesta", "la consulta del permiso se queda con la PRIMERA fila",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_Producto", "EXISTE. productos (schema.sql:223)", "este caso es el unico que no lee porcentaje_iva",
     [["id_producto", "Integer = PK", VIS_PRI], ["codigo", "String = 40 UNIQUE", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["id_categoria", "Integer", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. producto_talla_color (schema.sql:237)", "la variante que define una fila de stock",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB]],
     []],

    ["CE_InventarioStock", "EXISTE. inventario_stock", "inventario y disponibilidad no filtran por periodo",
     [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer = UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer = UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB]],
     []],

    ["CE_Talla", "EXISTE. tallas", "JOIN interior en las tres consultas",
     [["id_talla", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB]],
     []],

    ["CE_Color", "EXISTE. colores", "JOIN interior, y el hex sale en el reporte de inventario",
     [["id_color", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["codigo_hex", "String", VIS_PUB]],
     []],

    ["CE_Categoria", "EXISTE. categorias (schema.sql:179)", "LEFT JOIN en inventario y disponibilidad",
     [["id_categoria", "Integer = PK", VIS_PRI], ["nombre", "String = 80 UNIQUE", VIS_PUB]],
     []],

    ["CE_BitacoraAuditoria", "EXISTE. bitacora_auditoria (schema.sql:148)", "escrita por SQL crudo: sin IP, sin agente, sin detalle",
     [["id_bitacora", "Integer = PK", VIS_PRI], ["id_usuario", "Integer = ON DELETE SET NULL", VIS_PUB], ["accion_sql", "String = 40", VIS_PUB], ["tabla_afectada", "String = 80", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text = null en este caso", VIS_PUB], ["old_data", "JSONB = null", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "INET = null en este caso", VIS_PUB], ["user_agent", "String = null en este caso", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Administrador", "Administrador, unico con el permiso", "wildcard *"],
    ["ACTOR_Encargado", "Encargado. OJO: da 403", "no tiene consultar_reportes"],
    ["ACTOR_Cajero", "Cajero. OJO: da 403", "no tiene consultar_reportes"],
    ["ACTOR_ServicioVoz", "STT e IA, externos y opcionales", "no hay ni un proceso que los escuche"]
];

var ERRORES = [];
var INFORME = [];

function pad(s, n) { var t = String(s); while (t.length < n) t = t + " "; return t; }

function nota(el, texto) {
    if (el == null) return;
    try {
        var a = String(el.Notes || "");
        if (a.indexOf(texto) < 0) el.Notes = a + SALTO + texto;
        el.Update();
    } catch (e) { }
}

function buscarPaquete(P, N) {
    if (P == null) return null;
    if (String(P.Name) == N) return P;
    for (var i = 0; i < P.Packages.Count; i++) {
        var r = buscarPaquete(P.Packages.GetAt(i), N);
        if (r != null) return r;
    }
    return null;
}

function subPaquete(padre, nombre) {
    for (var i = 0; i < padre.Packages.Count; i++) {
        if (String(padre.Packages.GetAt(i).Name) == nombre) return padre.Packages.GetAt(i);
    }
    var nuevo = padre.Packages.AddNew(nombre, "");
    nuevo.Update();
    padre.Packages.Refresh();
    return buscarPaquete(padre, nombre);
}

function buscarLocal(paq, nombre) {
    for (var i = 0; i < paq.Elements.Count; i++) {
        var e = paq.Elements.GetAt(i);
        if (String(e.Name) == nombre) return e;
    }
    return null;
}

function objetoEn(diag, el) {
    for (var i = 0; i < diag.DiagramObjects.Count; i++) {
        var c = diag.DiagramObjects.GetAt(i);
        if (c.ElementID == el.ElementID) return c;
    }
    return null;
}

function nombresDe(coleccion) {
    var s = "";
    if (coleccion == null) return s;
    try {
        for (var i = 0; i < coleccion.Count; i++) s = s + "|" + String(coleccion.GetAt(i).Name);
    } catch (e) { }
    return s;
}

function contiene(lista, nombre) { return lista.indexOf("|" + nombre) >= 0; }
function totalDe(lista) { if (lista == "") return 0; return lista.split("|").length - 1; }

function lineasCompartimento(def) {
    var l = [];
    for (var i = 0; i < def[3].length; i++) l.push("- " + def[3][i][0] + " : " + def[3][i][1]);
    if (def[3].length > 0 && def[4].length > 0) l.push("");
    for (var j = 0; j < def[4].length; j++) {
        var p = def[4][j][2];
        var f = "";
        if (p != null) f = p.join(", ");
        l.push("+ " + def[4][j][0] + "(" + f + ") : " + def[4][j][1]);
    }
    if (l.length == 0) l.push("(sin atributos ni operaciones)");
    return l;
}

function agregarAtributo(el, nombre, tipo, vis) {
    var a = null;
    try { a = el.Attributes.AddNew(nombre, tipo); } catch (e) { a = null; }
    if (a == null) return false;
    try { a.Name = nombre; } catch (e) { }
    try { a.Type = tipo; } catch (e) { }
    try { a.SetVisibility(vis); } catch (e) { }
    try { a.Update(); } catch (e) { }
    return true;
}

function agregarOperacion(el, nombre, retorno, parametros, vis) {
    var firma = "";
    if (parametros != null) firma = parametros.join(", ");
    var m = null;
    try { m = el.Methods.AddNew(nombre, retorno, firma, ""); } catch (e) { m = null; }
    if (m == null) return false;
    try { m.Name = nombre; } catch (e) { }
    try { m.SetReturnType(retorno); } catch (e) { }
    try { m.SetParameters(firma); } catch (e) { }
    try { m.SetVisibility(vis); } catch (e) { }
    try { m.SetStereotype(""); } catch (e) { }
    try { m.SetAbstract(false); } catch (e) { }
    try { m.SetStatic(false); } catch (e) { }
    try { m.SetQuery(false); } catch (e) { }
    try { m.SetReadOnly(false); } catch (e) { }
    try { m.Update(); } catch (e) { }
    return true;
}

function colocar(diag, el, izq, arr, ancho, alto) {
    var o = objetoEn(diag, el);
    if (o == null) {
        var tam = "l=" + izq + ";r=" + (izq + ancho) + ";t=" + arr + ";b=" + (arr + alto) + ";";
        try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e) { return null; }
        o.ElementID = el.ElementID;
    }
    try { o.ManuallySized = true; } catch (e) { }
    try { o.Left = izq; } catch (e) { }
    try { o.Top = arr; } catch (e) { }
    try { o.Right = izq + ancho; } catch (e) { }
    try { o.Bottom = arr + alto; } catch (e) { }
    try { o.FontSize = 8; } catch (e) { }
    o.Update();
    return o;
}

function compartimento(diag, paq, nombre, lineas, izq, arr, ancho) {
    var alto = lineas.length * ALTO + 8;
    var el = buscarLocal(paq, nombre);
    if (el == null) {
        try { el = paq.Elements.AddNew(nombre, "Text"); } catch (e) { el = null; }
        if (el == null) {
            try { el = paq.Elements.AddNew(nombre, "Class"); } catch (e) { }
            try { el.Stereotype = ""; } catch (e) { }
        }
    }
    try { el.Text = lineas.join(SALTO); } catch (e) { }
    try { el.Notes = lineas.join(SALTO); } catch (e) { }
    try { el.Update(); } catch (e) { }
    var o = colocar(diag, el, izq, arr, ancho, alto);
    if (o == null) return;
    try { o.BorderStyle = 0; } catch (e) { }
    try { o.BackGroundColor = 16777215; } catch (e) { }
    try { o.FontSize = 7; } catch (e) { }
    try { o.WrapText = true; } catch (e) { }
    try { o.ShowNotes = true; } catch (e) { }
    try { o.Update(); } catch (e) { }
}

function enDiagrama(diag, el) {
    if (diag == null || el == null) return false;
    try {
        for (var i = 0; i < diag.DiagramObjects.Count; i++) {
            if (diag.DiagramObjects.GetAt(i).ElementID == el.ElementID) return true;
        }
    } catch (e) { }
    return false;
}

// El conector se crea en el PAQUETE, no en el diagrama. Como el script borra y
// recrea el diagrama en cada pasada, hay que COLOCARLO a mano con DiagramID:
// si no, EA solo lo dibuja la primera vez y al reejecutar el diagrama sale sin lineas.
function relacion(diag, a, b, etiqueta, tipo, est, rolA, rolB, cA, cB) {
    if (a == null || b == null) return 0;
    var i;
    var previo = null;
    for (i = 0; i < a.Connectors.Count; i++) {
        var c = a.Connectors.GetAt(i);
        if (c.SupplierID == b.ElementID) { previo = c; break; }
    }
    if (previo != null) {
        try { previo.Delete(); } catch (e) { }
    }
    var con = null;
    try { con = a.Connectors.AddNew("", tipo); } catch (e) { con = null; }
    if (con == null) {
        try { con = a.Connectors.AddNew("", "Association"); } catch (e) { con = null; }
    }
    if (con == null) return 0;
    try { con.ClientID = a.ElementID; } catch (e) { }
    try { con.SupplierID = b.ElementID; } catch (e) { }
    try { con.Update(); } catch (e) { }
    try { con.DiagramID = diag.ID; con.Update(); } catch (e) { }
    try { con.Name = etiqueta; } catch (e) { }
    try { con.Stereotype = est; } catch (e) { }
    try { con.SourceRole = rolA; } catch (e) { }
    try { con.DestinationRole = rolB; } catch (e) { }
    try { con.SourceCardinality = cA; } catch (e) { }
    try { con.DestinationCardinality = cB; } catch (e) { }
    try { con.FontSize = 7; } catch (e) { }
    try { con.Update(); } catch (e) { }
    if (enDiagrama(diag, con)) return 1;
    return 0;
}
function main() {
    var cu = buscarPaquete(RAIZ, "Casos de Uso");
    if (cu == null) cu = RAIZ;
    var mod = buscarPaquete(cu, "5. Reportes e Inteligencia");
    if (mod == null) mod = buscarPaquete(cu, "4. Ventas y Pagos");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU43 - Análisis de clases");

    for (var d = paq.Diagrams.Count - 1; d >= 0; d--) {
        try { paq.Diagrams.GetAt(d).Delete(); } catch (e) { }
    }
    try { paq.Diagrams.Refresh(); } catch (e) { }

    var clases = [];
    for (var n = 0; n < DEF.length; n++) {
        var def = DEF[n];
        var c = buscarLocal(paq, def[0]);
        if (c == null) {
            try { c = paq.Elements.AddNew(def[0], "Class"); } catch (e) { c = paq.Elements.AddNew(def[0], "Class"); }
            c.Update();
        }
        try { c.Name = def[0]; } catch (e) { }
        try { c.Stereotype = ""; } catch (e) { }
        nota(c, "Origen: " + def[2] + ".");
        try { c.Update(); } catch (e) { }
        clases[n] = c;
    }

    var actores = [];
    for (var a = 0; a < ACTORES.length; a++) {
        var act = buscarLocal(paq, ACTORES[a][0]);
        if (act == null) {
            try { act = paq.Elements.AddNew(ACTORES[a][0], "Actor"); } catch (e) { act = paq.Elements.AddNew(ACTORES[a][0], "Class"); }
        }
        try { act.Name = ACTORES[a][0]; } catch (e) { }
        try { act.Stereotype = ""; } catch (e) { }
        nota(act, ACTORES[a][1] + " (" + ACTORES[a][2] + ").");
        try { act.Update(); } catch (e) { }
        actores[a] = act;
    }

    try { paq.Elements.Refresh(); } catch (e) { }

    var usaTexto = [];
    var conReal = [];
    var totalAtr = 0;
    var totalOpe = 0;
    var conEnDiagrama = 0;

    for (var n2 = 0; n2 < DEF.length; n2++) {
        var d2 = DEF[n2];
        try { paq.Elements.Refresh(); } catch (e) { }
        var el = buscarLocal(paq, d2[0]);
        if (el == null) { ERRORES.push("clase " + d2[0] + " no encontrada"); continue; }
        var antes = "";
        var antesOpe = "";
        try { antes = nombresDe(el.Attributes); } catch (e) { antes = ""; }
        try { antesOpe = nombresDe(el.Methods); } catch (e) { antesOpe = ""; }
        for (var k = 0; k < d2[3].length; k++) {
            if (contiene(antes, d2[3][k][0])) continue;
            agregarAtributo(el, d2[3][k][0], d2[3][k][1], d2[3][k][2]);
        }
        for (var j = 0; j < d2[4].length; j++) {
            if (contiene(antesOpe, d2[4][j][0])) continue;
            agregarOperacion(el, d2[4][j][0], d2[4][j][1], d2[4][j][2], d2[4][j][3]);
        }
        try { el.Update(); } catch (e) { }
        var fin = "";
        var finOpe = "";
        try { fin = nombresDe(el.Attributes); } catch (e) { fin = ""; }
        try { finOpe = nombresDe(el.Methods); } catch (e) { finOpe = ""; }
        totalAtr = totalAtr + totalDe(fin);
        totalOpe = totalOpe + totalDe(finOpe);
        var bien = totalDe(fin) >= d2[3].length;
        if (totalDe(finOpe) >= d2[4].length) bien = true;
        usaTexto[n2] = !bien;
        if (bien) conReal.push(d2[0]);
        INFORME.push(pad(d2[0], 30) + " atr " + totalDe(fin) + "/" + d2[3].length + "  ope " + totalDe(finOpe) + "/" + d2[4].length + (bien ? "  REAL" : "  TEXTO"));
    }

    var diag = null;
    try { diag = paq.Diagrams.AddNew("CU43 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
    if (diag == null) ERRORES.push("no se pudo crear el diagrama");

    if (diag != null) {
        diag.Update();
        try { paq.Diagrams.Refresh(); } catch (e) { }
        var COLX = [30, 300, 570, 840, 1110];
        var ANCHO = 250;

        for (var p = 0; p < actores.length; p++) {
            colocar(diag, actores[p], COLX[p], 25, 190, 100);
        }
        for (var k2 = 0; k2 < DEF.length; k2++) {
            var col = k2 % 5;
            var fila = 1 + Math.floor(k2 / 5);
            var x = COLX[col];
            var y = 25 + fila * 300;
            var lineas = lineasCompartimento(DEF[k2]);
            if (usaTexto[k2]) {
                colocar(diag, clases[k2], x, y, ANCHO, 24);
                compartimento(diag, paq, "TXT " + DEF[k2][0], lineas, x, y + 24, ANCHO);
            } else {
                colocar(diag, clases[k2], x, y, ANCHO, lineas.length * ALTO + 34);
            }
        }

        var C = {};
        for (var q = 0; q < DEF.length; q++) { C[DEF[q][0]] = clases[q]; }

        conEnDiagrama += relacion(diag, actores[0], C.IU_ReportesVoz, "dicta el comando", "Association", "", "administrador", "pantalla", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C.CTR_ReportesVoz, "genera por HTTP", "Association", "", "administrador", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C.CTR_ReportesVoz, "transcribe el audio", "Dependency", "uses", "servicio STT", "endpoint", "0..*", "1");
        conEnDiagrama += relacion(diag, actores[1], C.SRV_IaExterna, "interpreta la intencion", "Dependency", "uses", "servicio IA", "adaptador", "0..*", "1");
        conEnDiagrama += relacion(diag, actores[2], C.CTR_ReportesVoz, "da 403 sin el permiso", "Association", "", "encargado", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[3], C.CTR_ReportesVoz, "da 403 sin el permiso", "Association", "", "cajero", "endpoint", "1", "0..1");

        conEnDiagrama += relacion(diag, C.IU_ReportesVoz, C.IU_Api, "cliente HTTP", "Dependency", "uses", "pantalla", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_ReportesVoz, C.IU_AdminMenu, "se muestra si tiene el permiso", "Dependency", "uses", "pantalla", "menu", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_ReportesVoz, C.CE_ProcesarComandoDto, "audio o texto", "Association", "", "pantalla", "cuerpo", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_ReportesVoz, C.CE_ResultadoReporte, "resumen y url", "Association", "", "pantalla", "respuesta", "0..*", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminMenu, C.CE_Rol, "permiso del menu", "Dependency", "uses", "menu", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.IU_Api, C.CTR_ReportesVoz, "punto de acceso", "Dependency", "uses", "cliente", "voz", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_Api, C.CE_ResultadoReporte, "respuesta tipada", "Association", "", "cliente", "respuesta", "1", "0..1");

        conEnDiagrama += relacion(diag, C.CTR_ReportesVoz, C.SRV_JwtAuthGuard, "guard obligatorio", "Dependency", "uses", "voz", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ReportesVoz, C.SRV_ReportesVozService, "servicio de reportes", "Association", "", "voz", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ReportesVoz, C.CE_ProcesarComandoDto, "cuerpo multipart", "Association", "", "voz", "cuerpo", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ReportesVoz, C.CE_ResultadoReporte, "respuesta 201", "Association", "", "voz", "respuesta", "0..*", "1");

        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.SRV_SttExterno, "transcribe el audio", "Dependency", "uses", "reportes", "stt", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.SRV_IaExterna, "intencion por IA o local", "Dependency", "uses", "reportes", "ia externa", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.SRV_AlmacenamientoReporte, "guarda el archivo", "Dependency", "uses", "reportes", "storage", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.SRV_JwtAuthGuard, "usuario del guard", "Association", "", "reportes", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_Usuario, "usuario que reporta", "Association", "", "reportes", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_Rol, "permiso de reportes", "Dependency", "uses", "reportes", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_UsuarioRol, "asignacion de rol", "Dependency", "uses", "reportes", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_ProcesarComandoDto, "comando recibido", "Dependency", "uses", "reportes", "cuerpo", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_Intencion, "intencion interpretada", "Composition", "composition", "reportes", "intencion", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_Sucursal, "sucursal resuelta por nombre", "Dependency", "uses", "reportes", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_Venta, "reporte de ventas: falla", "Dependency", "uses", "reportes", "venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_VentaItem, "una fila por item", "Dependency", "uses", "reportes", "item de venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_Cliente, "cliente de la venta", "Dependency", "uses", "reportes", "cliente", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_InventarioStock, "inventario y disponibilidad", "Dependency", "uses", "reportes", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_Producto, "producto del reporte", "Dependency", "uses", "reportes", "producto", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_ProductoTallaColor, "variante del reporte", "Dependency", "uses", "reportes", "prenda", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_Talla, "talla del reporte", "Dependency", "uses", "reportes", "talla", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_Color, "color del reporte", "Dependency", "uses", "reportes", "color", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_Categoria, "categoria del reporte", "Dependency", "uses", "reportes", "categoria", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_ReporteGenerativo, "reporte registrado", "Composition", "composition", "reportes", "reporte", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_BitacoraAuditoria, "bitacora por SQL crudo", "Composition", "composition", "reportes", "bitacora", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_ResultadoReporte, "respuesta final", "Composition", "composition", "reportes", "respuesta", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_SttExterno, C.SRV_ReportesVozService, "texto transcrito", "Dependency", "uses", "stt", "reportes", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_IaExterna, C.CE_Intencion, "intencion de la IA", "Association", "", "ia externa", "intencion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_IaExterna, C.CE_Sucursal, "id que propone la IA", "Dependency", "uses", "ia externa", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_AlmacenamientoReporte, C.CE_ReporteGenerativo, "url que se registra", "Association", "", "storage", "reporte", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_JwtAuthGuard, C.CE_Usuario, "usuario resuelto", "Association", "", "guard", "usuario", "0..1", "1");

        conEnDiagrama += relacion(diag, C.CE_ProcesarComandoDto, C.CE_Intencion, "texto a interpretar", "Dependency", "uses", "cuerpo", "intencion", "1", "0..1");
        conEnDiagrama += relacion(diag, C.CE_ResultadoReporte, C.CE_ReporteGenerativo, "reporte(devuelto)", "Association", "", "respuesta", "reporte", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Intencion, C.CE_Sucursal, "sucursal interpretada", "Association", "", "intencion", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Intencion, C.CE_ReporteGenerativo, "parametros que se guardan", "Association", "", "intencion", "reporte", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_ReporteGenerativo, C.CE_Usuario, "autor del reporte", "Association", "", "reporte", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_ReporteGenerativo, C.CE_BitacoraAuditoria, "auditado", "Association", "", "reporte", "bitacora", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Sucursal, "sucursal de la venta", "Association", "", "venta", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Usuario, "usuario de la venta", "Association", "", "venta", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Cliente, "cliente de la venta", "Association", "", "venta", "cliente", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaItem, C.CE_Venta, "venta del item", "Composition", "composition", "item de venta", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaItem, C.CE_ProductoTallaColor, "prenda vendida", "Association", "", "item de venta", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Producto, C.CE_Categoria, "categoria del producto", "Association", "", "producto", "categoria", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Producto, C.CE_ProductoTallaColor, "prendas del producto", "Composition", "composition", "producto", "prenda", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Talla, "talla", "Association", "", "prenda", "talla", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Color, "color", "Association", "", "prenda", "color", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_InventarioStock, C.CE_ProductoTallaColor, "stock por prenda", "Association", "", "stock", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_InventarioStock, C.CE_Sucursal, "stock por sucursal", "Association", "", "stock", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_Rol, "roles del usuario", "Association", "", "usuario", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_UsuarioRol, "asignaciones", "Composition", "composition", "usuario", "asignacion", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_Rol, C.CE_UsuarioRol, "usuarios del rol", "Association", "", "rol", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_BitacoraAuditoria, C.CE_Usuario, "usuario de la accion", "Association", "", "bitacora", "usuario", "0..1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("4 actores, " + DEF.length + " clases y " + TOTAL_REL + " relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (3), CTR_ controlador (1), SRV_ servicio o adaptador (5), CE_ entidad o tipo (" + (DEF.length - 9) + ").");
        N.push("");
        N.push("HALLAZGO CRITICO 1: HAY UNA CONTRASENA DE PRODUCCION EN CINCO ARCHIVOS DEL CODIGO.");
        N.push("");
        N.push("En agregar-permiso.js, quitar-permiso.js, check-roles.js, agregar-permiso-cajero.js y");
        N.push("ejecutar-migracion.js, la misma cadena de conexion esta escrita a mano:");
        N.push("");
        N.push("  connectionString: 'postgresql://postgres.XXXXXXXXXXXX:");
        N.push("                   XXXXXXXXXXXXXXXX@aws-0-sa-east-1.pooler.supabase.com:5432/postgres'");
        N.push("O sea el identificador del proyecto de Supabase, el usuario postgres, la contrasena y");
        N.push("el host del pooler, en texto plano, en cinco archivos. Y el propio .env abre con un");
        N.push("comentario que dice NUNCA subas .env a un repositorio publico, mientras estos cinco");
        N.push("archivos hacen exactamente eso, con una credencial bastante mas peligrosa que la del .env,");
        N.push(".env porque es la de postgres y no una de aplicacion.");
        N.push("");
        N.push("Lo que hay que hacer con esto, en orden: rotar la contrasena de esa base cuanto antes,");
        N.push("sacar la cadena de los cinco archivos y dejarla en el .env, y revisar el historial del");
        N.push("repositorio por si el proyecto estuvo versionado. No es un problema de este caso de");
        N.push("uso: es un problema del repositorio, y se documenta aqui porque es donde esta el");
        N.push("codigo. Los cinco scripts estan ademas junto al servicio, no en una carpeta de");
        N.push("utilidades, asi que viajan con el modulo.");
        N.push("");
        N.push("Lo que si hacen los scripts, ademas, es documentar como se improviso la seguridad:");
        N.push("agregar-permiso.js mete consultar_reportes al Cajero (id_rol 3) y al Encargado");
        N.push("(id_rol 2), y quitar-permiso.js lo saca de los dos con los comentarios para que E2");
        N.push("pase y para que E2 funcione. O sea que se quito un permiso real a dos roles para");
        N.push("forzar una prueba. Y E2 en el caso es la sesion caducada, que es un 401 del guard: si");
        N.push("quitas el permiso lo que sale es un 403, que es E1. O sea que el arreglo no hacia");
        N.push("pasar la prueba, solo cambiaba el codigo de error. check-roles.js consulta por");
        N.push("email, con los correos de los usuarios de prueba nombrados por el caso que los creo,");
        N.push("cu36@ y cu32@, lo cual dice en que casos se probó y con que datos.");
        N.push("");
        N.push("HALLAZGO CRITICO 2: EL REPORTE DE VENTAS USA v.fecha Y LA COLUMNA ES fecha_venta.");
        N.push("");
        N.push("  SELECT v.id_venta, v.fecha, s.nombre AS sucursal, ...");
        N.push("   FROM ventas v ...");
        N.push("   WHERE v.id_sucursal = $1 AND v.fecha BETWEEN $2 AND $3");
        N.push("   ORDER BY v.fecha DESC");
        N.push("");
        N.push("La tabla ventas (schema.sql:384) tiene fecha_venta, no fecha. O sea que las tres");
        N.push("apariciones de v.fecha dan 42703 y el reporte de ventas revienta siempre. Y es el");
        N.push("reporte insignia del caso, el del ejemplo que el propio enunciado escribe: generar un");
        N.push("reporte de ventas de la sucursal Centro de la semana pasada en PDF.");
        N.push("");
        N.push("Que sea la tercera vez que aparece una columna que no existe en este lote, con dos");
        N.push("variantes. Las de CU32, CU33 y CU34 a CU38 fueron casos en los que el codigo leia una columna");
        N.push("que el esquema no tiene. Esta es al reves: el codigo le inventa un nombre a una");
        N.push("columna que si existe. El mismo error de criterio, la misma consecuencia, y aqui encima");
        N.push("no hay forma de que el reporte de ventas funcione nunca, porque no tiene atajo.");
        N.push("");
        N.push("Lo que si queda bien del reporte de ventas es el resto: la consulta es una sola con");
        N.push("ocho JOIN, no hay N+1, y usa LEFT JOIN con clientes para que la venta de consumidor");
        N.push("final tambien aparezca. Y este es el unico caso del proyecto entero que no lee");
        N.push("porcentaje_iva, el unico que se ha librado de esa columna.");
        N.push("");
        N.push("HALLAZGO CRITICO 3: EL FORMATO SE DETECTA Y SE TIRA. SOLO SALEN PDF.");
        N.push("");
        N.push("  // lineas 199 a 205: se busca pdf, excel, xlsx, hoja, hoja_de_calculo, csv, comma");
        N.push("  let formato: Intencion['formato'] = 'pdf';");
        N.push("  for (const [palabra, val] of Object.entries(palabrasFormato)) {");
        N.push("    if (t.includes(palabra)) { formato = val; break; }");
        N.push("  }");
        N.push("");
        N.push("  // linea 261: se devuelve el literal");
        N.push("  return { tipo, desde, hasta, id_sucursal, formato: 'pdf', confirmacion };");
        N.push("");
        N.push("El extractor local calcula el formato, lo guarda en una variable y en el return");
        N.push("devuelve la cadena pdf, no la variable. O sea que las nueve palabras clave del");
        N.push("diccionario alimentan un valor que se descarta entero. Con la IA caida, que es el");
        N.push("estado normal porque las dos URLs son localhost, el unico formato posible por voz es");
        N.push("PDF. El segundo ejemplo del caso, un reporte de inventario de este mes en Excel, es");
        N.push("imposable: sale en PDF o no sale.");
        N.push("");
        N.push("Es un fallo de una linea y es el mas caro del caso en cuanto a la promesa, porque el");
        N.push("formato es una de las tres cosas que el usuario dicta.");
        N.push("");
        N.push("HALLAZGO CRITICO 4: LA CONFIRMACION NO TIENE FIN. ES UN BUCLE.");
        N.push("");
        N.push("  const confirmacion = !id_sucursal || !desde ||      // linea 259");
        N.push("");
        N.push("  if (intencion.confirmacion) {");
        N.push("    return { id_reporte: 0, url_archivo: '', resumen: this.generarPreguntaConfirmacion(intencion) };");
        N.push("  }");
        N.push("");
        N.push("  // que termina en");
        N.push("  partes.push('Responde \"Si\" para confirmar.');   // linea 278");
        N.push("");
        N.push("La pregunta le pide al usuario que responda Si. Pero en la peticion siguiente el");
        N.push("servicio no recuerda nada: no hay sesion, no hay estado pendiente, no hay nada. Se");
        N.push("vuelve a extraer la intencion desde cero del texto nuevo, y el texto Si no contiene");
        N.push("ninguna palabra clave de tipo, asi que tipo vuelve al valor por defecto ventas, no");
        N.push("hay periodo, no hay sucursal, o sea que confirmacion vuelve a ser true y se repite");
        N.push("la misma pregunta. Para siempre.");
        N.push("");
        N.push("O sea que el paso 5 del flujo principal, el confirmar con el usuario antes de generar,");
        N.push("y la parte de E4 que dice que se responde con las opciones y se espera un nuevo");
        N.push("comando, no se pueden completar. El caso esta describiendo una conversacion y el");
        N.push("codigo no tiene donde guardarla. Con el STT y la IA levantados el problema se");
        N.push("esconde, porque la IA puede devolver confirmacion false con todos los datos, pero");
        N.push("contra el caso, que es el estado real, el flujo no termina.");
        N.push("");
        N.push("Y hay dos detalles mas en la pregunta. Imprime el identificador y no el nombre:");
        N.push("");
        N.push("  partes.push(`de la sucursal ${i.id_sucursal}`);   // linea 268");
        N.push("");
        N.push("O sea que el usuario oye de su navegador la sucursal 3, cuando el dijo Centro, aunque");
        N.push("el nombre se resolvio dos lineas antes. Y el caso escribe la pregunta con el nombre.");
        N.push("Y las fechas salen con toLocaleDateString() sin locale, o sea con el del servidor.");
        N.push("");
        N.push("HALLAZGO 5: EL COMANDO DE EJEMPLO DEL CASO NO RESUELVE LA SUCURSAL.");
        N.push("");
        N.push("  const sucMatch = t.match(/sucursal\\s+([a-záéíóúñ\\s]+)/);   // linea 249");
        N.push("");
        N.push("El grupo captura letras y espacios, sin limite, o sea que se come el resto de la");
        N.push("frase. Con el comando del propio caso:");
        N.push("");
        N.push("  genera un reporte de ventas de la sucursal Centro de la semana pasada en PDF");
        N.push("");
        N.push("el grupo se lleva centro de la semana pasada en pdf, y la busqueda es:");
        N.push("");
        N.push("  SELECT id_sucursal FROM sucursales WHERE LOWER(nombre) LIKE $1 LIMIT 1");
        N.push("  con el parametro %centro de la semana pasada en pdf%");
        N.push("");
        N.push("que no encuentra nada. O sea que el comando de ejemplo no resuelve la sucursal, cae");
        N.push("en la confirmacion, y la confirmacion no se puede contestar. El caso entero se queda");
        N.push("en el primer paso con la frase que el propio caso propone.");
        N.push("");
        N.push("Un arreglo de una linea es cortar en la primera palabra que no siga siendo un nombre");
        N.push("o un separador, o mejor, quedarse con el nombre de la sucursal mas largo que este");
        N.push("contido en la frase. Y la consulta con LOWER y LIKE sobre el nombre entero es");
        N.push("fragil: dos sucursales que se llamen Centro y Centro Norte se mezclarian con el");
        N.push("LIKE por defecto.");
        N.push("");
        N.push("HALLAZGO 6: LA IA CAE EN SILENCIO Y EL TIPO MAL INTERPRETADO SE CONVIERTE EN VENTAS.");
        N.push("");
        N.push("  try { const res = await fetch(this.iaUrl, { ... }); ... }");
        N.push("  catch {");
        N.push("    // fallback a reglas locales");
        N.push("  }");
        N.push("");
        N.push("El comentario es el unico rastro: no hay logger, ni un contador, ni nada en la");
        N.push("respuesta. Y a diferencia de CU41, donde delegarIA si hacia logger.warn y la");
        N.push("respuesta traia un campo fuente que decia que motor habia actuado, aqui la");
        N.push("respuesta no dice nada. El usuario no puede distinguir si su comando lo entendio una");
        N.push("IA o un programa que cuenta palabras.");
        N.push("");
        N.push("Y el fallo de la normalizacion es el peor posible para un generador de informes:");
        N.push("");
        N.push("  tipo: ['ventas', 'inventario', 'disponibilidad'].includes(tipo) ? tipo : 'ventas'");
        N.push("  formato: ['pdf', 'xlsx', 'csv'].includes(formato) ? formato : 'pdf'");
        N.push("");
        N.push("Si la IA responde, responde otra cosa, o devuelve un JSON con los campos mal");
        N.push("escritos, el resultado no es un error: es un reporte de ventas en PDF con el nombre");
        N.push("equivocado. No hay ninguna forma de que el sistema se niegue a producir un informe");
        N.push("cuando no entiende lo que le pidieron, y E4, que es exactamente la excepcion para");
        N.push("eso, no se implementa en ninguna parte. El unico camino a una pregunta de");
        N.push("confirmacion es que falte el periodo o la sucursal, no el tipo.");
        N.push("");
        N.push("Ademas hay un detalle en el orden de las palabras clave. El bucle hace break en la");
        N.push("primera coincidencia del diccionario, no la primera de la frase, porque Object.entries");
        N.push("respeta el orden de insercion y venta es la primera clave. O sea que un comando que");
        N.push("diga reporte de ventas con problemas de stock se clasifica como ventas y la palabra");
        N.push("stock se ignora. El desempate lo decide el orden del literal, no lo que dijo el");
        N.push("usuario.");
        N.push("");
        N.push("HALLAZGO CRITICO 7: EL REPORTE SE GENERA Y NO SE PUEDE ABRIR. NO HAY ESTATICOS.");
        N.push("");
        N.push("Los dos botones de la pantalla son enlaces a un fichero:");
        N.push("");
        N.push("  href={`${api.baseUrl.replace('/api/v1', '')}${reporte.url_archivo}`}");
        N.push("");
        N.push("y guardarArchivo devuelve /storage/reportes/<nombre>. Pero en main.ts no hay");
        N.push("useStaticAssets, ni ServeStaticModule, ni express.static, y @nestjs/serve-static ni");
        N.push("siquiera esta en package.json. O sea que no hay nada que atienda /storage/reportes.");
        N.push("");
        N.push("El pipeline entero funciona: se interpreta, se consulta, se compone el PDF, se");
        N.push("escribe en disco, se inserta en reportes_generativos con su transaccion y se audita.");
        N.push("Y despues los dos botones dan 404. El ultimo metro, que es el entregable, es el que");
        N.push("falta. Es el mismo patron que el S3 de CU38, pero aqui no hay ni una rama fingida:");
        N.push("simplemente no esta configurado.");
        N.push("");
        N.push("Y hay un segundo defecto en la misma linea. guardarArchivo escribe en");
        N.push("path.join(this.storagePath, nombre) pero devuelve el literal /storage/reportes/.");
        N.push("Si STORAGE_PATH se define a otra cosa, el fichero sale en un sitio y la url apunta a");
        N.push("otro, y el desajuste es silencioso porque el fichero si se guardo.");
        N.push("");
        N.push("HALLAZGO 8: LAS HAY COSAS QUE ESTAN BIEN. Y SON VARIAS.");
        N.push("");
        N.push("Este caso es el mejor construido de todo el lote en la parte de escritura, y conviene");
        N.push("dejarlo dicho con la misma claridad con que se dicen los fallos.");
        N.push("");
        N.push("  - registrarReporte usa una transaccion de verdad, con createQueryRunner, commit,");
        N.push("    rollback y release en el finally. Es la primera vez que alguien escribe asi en el");
        N.push("    proyecto, y es la unica operacion en la que el INSERT de la bitacora y el del");
        N.push("    negocio van en la MISMA transaccion. Deshace la pauta de nueve casos, donde la");
        N.push("    bitacora siempre cae fuera.");
        N.push("  - Consecuencia ironica: es la unica bitacora atomica y tambien la mas pobre. Se");
        N.push("    escribe con SQL crudo, no con el servicio, y sin ip_address, sin user_agent y");
        N.push("    sin detalle. Las nueve bitacoras que si tienen IP y agente no son atomicas, y la");
        N.push("    que es atomica no las tiene. Son dos defectos que se cancelan por separado.");
        N.push("  - El frontend esta completo y bien hecho: MediaRecorder, getUserMedia, la Web Speech");
        N.push("    API con su alternativa webkit, SpeechSynthesisUtterance para leer la respuesta en");
        N.push("    voz, y los dos botones. Es la parte del caso que mas acierta.");
        N.push("  - El permiso del menu (adminMenu.ts:249) y el del servicio son el mismo,");
        N.push("    consultar_reportes. Coinciden, que no es lo habitual en este proyecto.");
        N.push("  - generarXLSX usa la libreria xlsx de verdad, y generarCSV escapa las comas");
        N.push("    dobles. Los tres formatos existen como codigo, aunque el de voz solo llegue a PDF.");
        N.push("  - generarPDF pagina con addPage. Y usa pdf-lib, mientras que el comprobante de CU38");
        N.push("    usa pdfkit. Dos librerias de PDF en el mismo proyecto, y las dos instaladas.");
        N.push("  - E6 esta bien resuelto: el archivo se genera aunque no haya filas, el PDF escribe");
        N.push("    No hay datos en el periodo seleccionado. y el resumen lo anade al final.");
        N.push("");
        N.push("HALLAZGO 9: LAS DOS DEFINICIONES DE reportes_generativos NO COINCIDEN.");
        N.push("");
        N.push("La tabla aparece en dos sitios con contratos distintos:");
        N.push("");
        N.push("  schema.sql:534                             id_usuario y tipo y parametros y url en NULL");
        N.push("  migration_reportes_generativos.sql         los cuatro NOT NULL, y dos indices");
        N.push("");
        N.push("Y la migracion empieza con CREATE TABLE IF NOT EXISTS, o sea que si se aplico");
        N.push("schema.sql primero la migracion no hace nada y se va en silencio, y si se aplico la");
        N.push("migracion primero el resto del esquema podria fallar al crear la tabla sin IF NOT");
        N.push("EXISTS. En cualquiera de los dos caminos el proyecto acaba con una de las dos");
        N.push("versiones y no sabe cual. Y el servicio escribe parametros con un objeto, asi que la");
        N.push("version laxa es la que funciona con lo que hay.");
        N.push("");
        N.push("Esto corrige algo que dije en casos anteriores. He repetido que el proyecto no");
        N.push("tiene migraciones, y es verdad que schema.sql no tiene ni un ALTER TABLE, pero si");
        N.push("hay migracion: este archivo, un seed de imagenes, y cinco scripts de una vez. La");
        N.push("afirmacion correcta es que las columnas que faltan (porcentaje_iva, token_invitado,");
        N.push("foto_resultado, estado_stock) no tienen migracion en ninguna parte, y que la unica");
        N.push("migracion que existe se uso para una tabla que schema.sql ya tenia.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - El transcriptor es la unica llamada externa del proyecto sin limite de tiempo. En");
        N.push("    CU41 el delegarIA tiene AbortSignal.timeout(4000); aqui el fetch del STT no tiene");
        N.push("    nada. Si el servicio de transcripcion se cuelga, la peticion se queda colgada");
        N.push("    colgada, y es la peticion que depende del microfono de una persona.");
        N.push("  - El metodo que crea el directorio se llama asegarStorage, sin la segunda r, y se");
        N.push("    llama desde el constructor sin await. O sea que hay un mkdir en vuelo mientras");
        N.push("    arranca el primer modulo, y si el primer reporte llega antes de que termine, el");
        N.push("    writeFile falla y el usuario recibe el 500 de E7.");
        N.push("  - E3 tiene dos textos. El caso dice No se pudo capturar el comando de voz, y ese es");
        N.push("    el de la transcripcion vacia, en procesar. El fallo real del STT dice No se pudo");
        N.push("    transcribir el audio. Dos mensajes para la misma situacion.");
        N.push("  - E5: el texto de sucursal es Sucursal no encontrada. y el caso dice Sucursal no");
        N.push("    encontrada. El de rango de fechas si coincide. Y el de formato real lleva el");
        N.push("    detalle, Formato invalido (pdf, xlsx, csv).");
        N.push("  - Dos de las seis comprobaciones de validarParametros son inalcanzables: Tipo de");
        N.push("    reporte invalido no puede pasar porque el tipo siempre es uno de los tres, y");
        N.push("    Periodo no definido no puede pasar porque confirmacion corta antes. El caso las");
        N.push("    da por activas.");
        N.push("  - Los reportes de inventario y de disponibilidad ignoran el periodo: sus");
        N.push("    consultas solo filtran por sucursal. El usuario oye un rango en la confirmacion,");
        N.push("    lo ve validado, y el resultado es la foto de hoy. Solo ventas usa fechas.");
        N.push("  - El resumen de ventas cuenta filas de venta_items y las llama registros, y su");
        N.push("    total es la suma de cantidad por precio_unitario, sin impuestos. El ejemplo del");
        N.push("    caso dice 12 ventas y total Bs 5.480; el real dice N registros, y el total no");
        N.push("    coincide con ventas.total de ningun lado. Un informe de ventas cuyo total no");
        N.push("    cuadra con las ventas es el fallo que mas dana en un modulo de reportes.");
        N.push("  - generarPDF corta a 40 filas con filas.slice(0, 40). Hay paginacion, pero solo");
        N.push("    dentro de esas 40. De la 41 en adelante se pierden sin aviso, y el resumen de");
        N.push("    arriba dice el numero real, o sea que el PDF enseña 40 y dice 300. Perder filas");
        N.push("    en silencio en un informe es el peor modo de fallo posible aqui.");
        N.push("  - generarCSV solo entrecomilla si el valor tiene coma, y solo dobla las comillas");
        N.push("    en ese caso. Un texto con comillas y sin coma sale sin proteger y rompe el");
        N.push("    CSV, y un salto de linea parte la fila. Faltan las comillas dobles y el escape");
        N.push("    de CRLF.");
        N.push("  - El modulo tiene un solo controlador con un solo POST de 31 lineas, y es el mas");
        N.push("    limpio de los que tienen su propio prefijo. Lo que no es limpio es la carpeta:");
        N.push("    convive el servicio con cinco scripts de un solo uso, un .sql y un .js que");
        N.push("    duplica ese .sql como cadena.");
        N.push("  - ReportesVoz.tsx hace const { usuario: _usuario } = useAuth() y no lo usa.");
        N.push("    O sea que la pagina no tiene control de acceso propio: el menu oculta el enlace y");
        N.push("    el 403 llega de la API. El caso dice que el acceso por URL directa muestra Acceso");
        N.push("    denegado, y lo que pasaria es que la pagina carga y el boton falla.");
        N.push("  - El menu de administracion declara 16 permisos distintos y la semilla de roles");
        N.push("    tiene otro juego de nombres: el menu usa gestionar_x y consultar_x, y la");
        N.push("    semilla usa pares verbo-sustinto como ver_catalogo, registrar_venta,");
        N.push("    gestionar_reservas. Ahi esta el origen de casi todos los permisos inexistentes");
        N.push("    de CU33 a CU43: el frontend y el backend se escribieron con dos convenciones");
        N.push("    distintas y nadie los cruzo. De los 16 del menu, solo ver_auditoria,");
        N.push("    realizar_venta, gestionar_reservas y respaldos aparecen en la semilla.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU43 - GENERAR REPORTE POR COMANDO DE VOZ - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de " + TOTAL_ATR);
    T.push("Operaciones reales: " + totalOpe + " de " + TOTAL_OPE);
    T.push("CONECTORES DIBUJADOS: " + conEnDiagrama + " de " + TOTAL_REL);
    if (conEnDiagrama < TOTAL_REL) T.push("  FALTAN LINEAS. Reejecuta el script: es idempotente y las coloca.");
    T.push("Clases completas: " + conReal.length + " -> " + conReal.join(", "));
    for (var l = 0; l < INFORME.length; l++) T.push(INFORME[l]);
    T.push("");
    if (ERRORES.length == 0) T.push("Sin errores.");
    if (ERRORES.length > 0) {
        T.push("ERRORES: " + ERRORES.length);
        for (var e2 = 0; e2 < ERRORES.length; e2++) T.push("  - " + ERRORES[e2]);
    }
    try { paq.Notes = T.join(SALTO); paq.Update(); } catch (e) { }
    try { paq.Elements.Refresh(); } catch (e) { }
    try { paq.Diagrams.Refresh(); } catch (e) { }

    var msg = "";
    msg = msg + "CU43 - Generar reporte por comando de voz" + SALTO + SALTO;
    msg = msg + "ATENCION: hay una CONTRASENA DE PRODUCCION de Supabase" + SALTO;
    msg = msg + "en texto plano en 5 archivos del modulo. Rotarla." + SALTO + SALTO;
    msg = msg + "El reporte de ventas usa v.fecha y la columna es" + SALTO;
    msg = msg + "fecha_venta: da 500 siempre." + SALTO;
    msg = msg + "El formato se detecta y se tira: solo salen PDF." + SALTO;
    msg = msg + "La confirmacion no tiene fin: es un bucle sin estado." + SALTO;
    msg = msg + "El comando de ejemplo del caso no resuelve la sucursal." + SALTO;
    msg = msg + "Los archivos se guardan pero NO se sirven: no hay estaticos." + SALTO + SALTO;
    msg = msg + "BIEN: unica transaccion real, con la bitacora dentro." + SALTO;
    msg = msg + "Clases: " + DEF.length + "    Actores: 4    Relaciones: " + TOTAL_REL + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de " + TOTAL_ATR + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de " + TOTAL_OPE + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de " + TOTAL_REL + SALTO;
    if (conEnDiagrama < TOTAL_REL) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU43 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU43 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU43", 0); } catch (e3) { }
}
