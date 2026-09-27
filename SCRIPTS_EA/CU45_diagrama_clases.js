// ================================================================
// CU45 - GENERAR REPORTES DE VENTAS E INVENTARIO
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   NO EXISTE el modulo reportes: cero apariciones de reportes/ventas,
//   reportes/inventario o ReportesService en los 82 archivos del backend.
//   NO EXISTE la pagina AdminReportes ni la ruta /admin/reportes.
//   router.tsx:83   la unica ruta de reportes es reportes/voz, la de CU43
//   api/src/main.ts:20   setGlobalPrefix('api/v1'), el caso acierta
//   api/src/main.ts:22   ValidationPipe con whitelist y transform
//   PERO LAS PIEZAS SI EXISTEN, y son tres:
//     SRV_ComprobantesService.ts   pdfkit, guardarPdf, descargarPdf
//     SRV_ReportesVozService.ts    pdf-lib, xlsx, CSV, CU43
//     SRV_AuditoriaService.ts:142  el unico CSV bien escapado del proyecto
//   Y TRES RUTAS QUE YA SIRVEN UN ARCHIVO:
//     comprobantes/:id/pdf         StreamableFile, disposition attachment
//     admin/respaldos/:id/descargar StreamableFile, application/gzip
//     admin/auditoria?format=csv   response.setHeader, no StreamableFile
//   Y TRES HELPERS DE DESCARGA en web/src/lib/api.ts: 1121, 1654, 2014
//   schema.sql:573 5 roles sembrados, NINGUNO tiene consultar_reportes
//   schema.sql:semilla  8 categorias, 6 tallas, 8 colores. Y NADA MAS.
//   schema.sql:0    ni una sola tabla de negocio con filas iniciales
//   productos 0 INSERT, ventas 0 INSERT, usuarios 0 INSERT, sucursales 0
//   porcentaje_iva y porcentaje_iva_default: 0 apariciones en schema.sql
//   unica migracion del repo: migration_reportes_generativos.sql, 530 bytes
//   SRV_ComprobantesService.ts:196  lee p.porcentaje_iva, columna inexistente
//   SRV_ProductosService.ts:245     inserta porcentaje_iva, columna inexistente
//   SRV_CatalogosService.ts:497,557 inserta y actualiza porcentaje_iva_default
//   schema.sql:564  el unico indice de ventas es (id_sucursal, fecha_venta)
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
var TOTAL_REL = 75;
var TOTAL_ATR = 110;
var TOTAL_OPE = 36;

var DEF = [
    ["IU_AdminAuditoria", "EXISTE. pages/admin/AdminAuditoria.tsx", "el unico boton de exportar del panel de administracion", [["filtros", "Object", VIS_PUB], ["descargando", "Boolean", VIS_PUB]], [["exportar", "void", ["filtros"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_AdminKardex", "EXISTE. pages/admin/AdminKardex.tsx", "la tabla paginada que el preview del reporte imitaria", [["pagina", "Integer = 1", VIS_PUB], ["paginas", "Integer", VIS_PUB]], [["cargar", "void", ["filtros"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_AdminMenu", "EXISTE. data/adminMenu.ts, 20 permisos declarados", "solo 4 de esos 20 existen en la semilla", [["paquetes", "Array", VIS_PUB]], [["visibles", "Array", ["permisos"], VIS_PUB]]],

    ["CTR_Auditoria", "EXISTE. seguridad/CTR_Auditoria.ts:9", "admin, la unica que fija Content-Disposition a mano", [["auditoriaService", "AuditoriaService", VIS_PRI]], [["listar", "Object", ["currentUser", "filtros"], VIS_PUB], ["exportar", "void", ["currentUser", "filtros", "response"], VIS_PUB], ["usuariosEmail", "Array", [], VIS_PUB]]],

    ["CTR_Respaldos", "EXISTE. respaldos/CTR_Respaldos.ts:51", "admin/respaldos, StreamableFile con application/gzip", [["respaldosService", "RespaldosService", VIS_PRI]], [["listar", "Array", ["currentUser"], VIS_PUB], ["crear", "Object", ["currentUser", "dto"], VIS_PUB], ["descargar", "StreamableFile", ["currentUser", "id"], VIS_PUB]]],

    ["CTR_Comprobantes", "EXISTE. comprobantes/CTR_Comprobantes.ts:28", "comprobantes/:id/pdf, el unico PDF que se sirve hoy", [["comprobantesService", "ComprobantesService", VIS_PRI]], [["descargarPdf", "StreamableFile", ["currentUser", "idComprobante"], VIS_PUB]]],

    ["CTR_ReportesVoz", "EXISTE. reportes-voz/CTR_ReportesVoz.ts:8", "el unico endpoint con consultar_reportes", [["reportesVozService", "ReportesVozService", VIS_PRI]], [["procesar", "Object", ["currentUser", "dto"], VIS_PUB]]],

    ["CTR_Kardex", "EXISTE. inventario/CTR_Kardex.ts:6", "admin/inventario/kardex, el lector paginado de movimientos", [["kardexService", "KardexService", VIS_PRI]], [["opciones", "Object", [], VIS_PUB], ["consultar", "Object", ["currentUser", "filtros"], VIS_PUB]]],

    ["SRV_AuditoriaService", "EXISTE. seguridad/SRV_AuditoriaService.ts:142", "exportarCSV: siempre entrecomilla y duplica las comillas", [["dataSource", "DataSource", VIS_PRI]], [["exportarCSV", "String", ["usuario", "filtros"], VIS_PUB], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["verificarPermiso", "Boolean", ["permisos", "permiso"], VIS_PRI]]],

    ["SRV_ComprobantesService", "EXISTE. comprobantes/SRV_ComprobantesService.ts, CU38", "componerPdf con pdfkit, linea 196 lee p.porcentaje_iva", [["dataSource", "DataSource", VIS_PRI]], [["generar", "Fila", ["idVenta", "idUsuario", "request"], VIS_PUB], ["componerPdf", "Buffer", ["venta", "numero", "tipo"], VIS_PRI], ["guardarPdf", "String", ["numero", "buffer"], VIS_PRI], ["descargarPdf", "Fila", ["usuario", "idComprobante"], VIS_PUB]]],

    ["SRV_ReportesVozService", "EXISTE. reportes-voz/SRV_ReportesVozService.ts, CU43", "pdf-lib, xlsx de una sola hoja llamada Reporte", [["dataSource", "DataSource", VIS_PRI]], [["procesar", "Object", ["usuario", "dto"], VIS_PUB], ["generarXLSX", "Buffer", ["filas", "columnas"], VIS_PRI], ["generarCSV", "Buffer", ["filas", "columnas"], VIS_PRI], ["registrarReporte", "Integer", ["usuario", "intencion", "url"], VIS_PUB]]],

    ["SRV_ExistenciasService", "EXISTE. inventario/SRV_ExistenciasService.ts, CU26", "consolida existencias sin alcance por sucursal", [["dataSource", "DataSource", VIS_PRI]], [["consultar", "Array", ["usuario", "filtros"], VIS_PUB]]],

    ["SRV_KardexService", "EXISTE. inventario/SRV_KardexService.ts, CU22", "SI tiene alcance por sucursal, lineas 79 y 89", [["dataSource", "DataSource", VIS_PRI]], [["consultar", "Array", ["usuario", "filtros"], VIS_PUB], ["obtenerOpciones", "Object", ["usuario"], VIS_PUB], ["sucursalEncargado", "Integer", ["usuario"], VIS_PRI], ["esAdministrador", "Boolean", ["usuario"], VIS_PRI]]],

    ["SRV_BitacoraService", "EXISTE. seguridad/SRV_BitacoraService.ts", "el servicio que CU43 usa y este caso no", [["dataSource", "DataSource", VIS_PRI]], [["registrar", "void", ["idUsuario", "accion", "tabla", "descripcion", "request", "idRegistro", "datosViejos", "datosNuevos"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "EXISTE. seguridad/dependencias.ts", "el guard de las tres rutas de archivo", [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]], [["canActivate", "Boolean", ["context"], VIS_PUB]]],

    ["SRV_UsuarioActual", "EXISTE. seguridad/dependencias.ts", "inyecta el Usuario para leer sus permisos", [], [["UsuarioActual", "Usuario", ["datos", "contexto"], VIS_PUB]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "las seis tablas del reporte se leen aqui", [], [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "any", ["callback"], VIS_PUB]]],

    ["CE_Usuario", "EXISTE. usuarios (schema.sql:32). Sin filas sembradas", "el que exporta; no hay ni un usuario en la base", [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120 UNIQUE", VIS_PRI], ["estado", "String = Pendiente", VIS_PUB]], []],

    ["CE_Rol", "EXISTE. roles (schema.sql:573). 5 filas sembradas", "consultar_reportes no esta en ninguno de los 5", [["id_rol", "Integer = PK", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB = con el asterisco en Administrador", VIS_PUB], ["estado", "String = Activo", VIS_PUB]], []],

    ["CE_UsuarioRol", "EXISTE. usuarios_roles con PK compuesta", "la consulta del permiso se queda con la primera fila", [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]], []],

    ["CE_Sucursal", "EXISTE. sucursales. Sin filas sembradas", "el filtro Todas o una concreta, sobre una tabla vacia", [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]], []],

    ["CE_Venta", "EXISTE. ventas (schema.sql:384). Sin filas sembradas", "ventas_totales y n_ventas; metodo_pago nunca se actualiza", [["id_venta", "Integer = PK", VIS_PRI], ["id_cliente", "Integer = nullable", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["id_carrito", "Integer = nullable", VIS_PUB], ["modalidad", "String = 20, Presencial o Retiro", VIS_PUB], ["metodo_pago", "String = 30, nullable y sin default", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB], ["impuestos", "Decimal(12,2)", VIS_PUB], ["total", "Decimal(12,2)", VIS_PUB], ["estado", "String = 20, se filtra Completada", VIS_PUB], ["fecha_venta", "Timestamp = NOW()", VIS_PUB]], []],

    ["CE_VentaItem", "EXISTE. venta_items (schema.sql:399). Sin filas sembradas", "el detalle por linea, y la causa del doble conteo", [["id_venta_item", "Integer = PK", VIS_PRI], ["id_venta", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["precio_unitario", "Decimal(10,2)", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB]], []],

    ["CE_Comprobante", "EXISTE. comprobantes (schema.sql:408). Sin filas sembradas", "el numero que el caso pone en cada linea del detalle", [["id_comprobante", "Integer = PK", VIS_PRI], ["id_venta", "Integer", VIS_PUB], ["numero", "String = 30 UNIQUE", VIS_PUB], ["tipo", "String = 20", VIS_PUB], ["nit_cliente", "String = 30", VIS_PUB], ["razon_social", "String = 150", VIS_PUB], ["total", "Decimal(12,2)", VIS_PUB], ["fecha_emision", "Timestamp = NOW()", VIS_PUB], ["pdf_url", "Text = nullable", VIS_PUB]], []],

    ["CE_Cliente", "EXISTE. clientes (schema.sql:87). Sin filas sembradas", "el caso lo llama Consumidor Final cuando no hay cliente", [["id_cliente", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE, nullable", VIS_PUB], ["nombre", "String = 150", VIS_PUB]], []],

    ["CE_Producto", "EXISTE. productos (schema.sql:223). Sin filas sembradas", "NO tiene porcentaje_iva y el servicio la inserta", [["id_producto", "Integer = PK", VIS_PRI], ["codigo", "String = 40 UNIQUE", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["id_categoria", "Integer", VIS_PUB], ["id_temporada", "Integer", VIS_PUB], ["id_proveedor", "Integer", VIS_PUB], ["precio_base", "Decimal(10,2)", VIS_PUB], ["estado", "String = Disponible", VIS_PUB]], []],

    ["CE_ProductoTallaColor", "EXISTE. producto_talla_color (schema.sql:237). Sin filas", "el punto de union entre ventas, stock y productos", [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB], ["estado_stock", "String = Disponible, nadie lo actualiza", VIS_PUB]], []],

    ["CE_Categoria", "EXISTE. categorias (schema.sql:179). 8 filas sembradas", "las unicas 8 filas de negocio de toda la base", [["id_categoria", "Integer = PK", VIS_PRI], ["nombre", "String = 80 UNIQUE", VIS_PUB], ["descripcion", "Text", VIS_PUB], ["estado", "String = Activo", VIS_PUB]], []],

    ["CE_Temporada", "EXISTE. temporadas (schema.sql:186). Sin filas sembradas", "el filtro opcional, sobre una tabla sin una sola fila", [["id_temporada", "Integer = PK", VIS_PRI], ["nombre", "String = 80", VIS_PUB], ["fecha_inicio", "Date = nullable", VIS_PUB], ["fecha_fin", "Date = nullable", VIS_PUB], ["estado", "String = Programada", VIS_PUB]], []],

    ["CE_Talla", "EXISTE. tallas (schema.sql:165). 6 filas sembradas", "XS a XXL, con su orden", [["id_talla", "Integer = PK", VIS_PRI], ["nombre", "String = 10 UNIQUE", VIS_PUB], ["orden", "Integer", VIS_PUB], ["estado", "String = Activo", VIS_PUB]], []],

    ["CE_Color", "EXISTE. colores (schema.sql:172). 8 filas sembradas", "con su codigo hexadecimal", [["id_color", "Integer = PK", VIS_PRI], ["nombre", "String = 50 UNIQUE", VIS_PUB], ["codigo_hex", "String = 7 UNIQUE", VIS_PUB], ["estado", "String = Activo", VIS_PUB]], []],

    ["CE_InventarioStock", "EXISTE. inventario_stock (schema.sql:302). Sin filas", "NO tiene columna estado; el caso lo pide igual", [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer = UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer = UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_reservada", "Integer = 0", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB], ["stock_minimo_alert", "Integer = 0", VIS_PUB]], []],

    ["CE_MovimientoInventario", "EXISTE. movimientos_inventario (schema.sql:421). Sin filas", "la unica seccion del reporte que esta bien especificada", [["id_movimiento", "Integer = PK", VIS_PRI], ["id_ptc", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["tipo_movimiento", "String = 30, Venta y AJUSTE", VIS_PUB], ["cantidad", "Integer, negativa en venta", VIS_PUB], ["stock_anterior", "Integer = nullable", VIS_PUB], ["stock_posterior", "Integer = nullable", VIS_PUB], ["referencia", "String = 120", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_orden_compra", "Integer = nullable", VIS_PUB], ["id_venta", "Integer = nullable", VIS_PUB], ["id_reserva", "Integer = nullable", VIS_PUB], ["fecha", "Timestamp = NOW()", VIS_PUB]], []]
];

var ACTORES = [
    ["ACTOR_Administrador", "Administrador, unico con el permiso", "asterisco en permisos_json"],
    ["ACTOR_Encargado", "Encargado de Sucursal. OJO: da 403", "no tiene consultar_reportes"],
    ["ACTOR_Cajero", "Cajero. OJO: da 403", "no tiene consultar_reportes"]
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
        if (String(padre.Packages.GetAt(i).Name) == nombre) return padre.Packages.AddNew(nombre, "");
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
    var paq = subPaquete(mod, "CU45 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU45 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
    if (diag == null) ERRORES.push("no se pudo crear el diagrama");

    if (diag != null) {
        diag.Update();
        try { paq.Diagrams.Refresh(); } catch (e) { }
        var COLX = [30, 300, 570, 840, 1110, 1380];
        var ANCHO = 250;

        for (var p = 0; p < actores.length; p++) {
            colocar(diag, actores[p], COLX[p], 25, 190, 100);
        }
        for (var k2 = 0; k2 < DEF.length; k2++) {
            var col = k2 % 6;
            var fila = 1 + Math.floor(k2 / 6);
            var x = COLX[col];
            var y = 25 + fila * 320;
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

        conEnDiagrama += relacion(diag, actores[0], C.IU_AdminAuditoria, "exporta la bitacora", "Association", "", "administrador", "auditoria", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C.IU_AdminKardex, "consulta el kardex", "Association", "", "administrador", "kardex", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C.IU_AdminKardex, "ve solo su sucursal", "Association", "", "encargado", "kardex", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[2], C.IU_AdminKardex, "ve el kardex entero", "Association", "", "cajero", "kardex", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C.IU_AdminMenu, "abre el panel de administracion", "Association", "", "administrador", "menu", "1", "0..1");

        conEnDiagrama += relacion(diag, C.IU_AdminAuditoria, C.IU_AdminMenu, "se declara en el menu", "Dependency", "uses", "auditoria", "menu", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminKardex, C.IU_AdminMenu, "se declara en el menu", "Dependency", "uses", "kardex", "menu", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminAuditoria, C.CTR_Auditoria, "llama al backend", "Dependency", "uses", "auditoria", "endpoint", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminKardex, C.CTR_Kardex, "llama al backend", "Dependency", "uses", "kardex", "endpoint", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminMenu, C.CE_Rol, "permiso de cada entrada", "Dependency", "uses", "menu", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminAuditoria, C.CE_Usuario, "sesion con token", "Dependency", "uses", "auditoria", "usuario", "1", "1");

        conEnDiagrama += relacion(diag, C.CTR_Auditoria, C.SRV_AuditoriaService, "servicio de bitacora", "Association", "", "auditoria", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_Auditoria, C.SRV_JwtAuthGuard, "guard", "Dependency", "uses", "auditoria", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_Auditoria, C.SRV_UsuarioActual, "usuario", "Dependency", "uses", "auditoria", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_Respaldos, C.SRV_JwtAuthGuard, "guard", "Dependency", "uses", "respaldos", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_Respaldos, C.SRV_UsuarioActual, "usuario", "Dependency", "uses", "respaldos", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_Respaldos, C.SRV_DataSource, "lee el archivo del disco", "Dependency", "uses", "respaldos", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_Respaldos, C.CE_Usuario, "autor del respaldo", "Dependency", "uses", "respaldos", "usuario", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CTR_Comprobantes, C.SRV_ComprobantesService, "servicio de comprobantes", "Association", "", "comprobantes", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_Comprobantes, C.SRV_JwtAuthGuard, "guard", "Dependency", "uses", "comprobantes", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_Comprobantes, C.SRV_UsuarioActual, "usuario", "Dependency", "uses", "comprobantes", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ReportesVoz, C.SRV_ReportesVozService, "servicio de voz", "Association", "", "voz", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ReportesVoz, C.SRV_JwtAuthGuard, "guard con consultar_reportes", "Dependency", "uses", "voz", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ReportesVoz, C.CE_Rol, "el unico consultar_reportes", "Dependency", "uses", "voz", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CTR_Kardex, C.SRV_KardexService, "servicio de kardex", "Association", "", "kardex", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_Kardex, C.SRV_JwtAuthGuard, "guard", "Dependency", "uses", "kardex", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_Kardex, C.SRV_UsuarioActual, "usuario", "Dependency", "uses", "kardex", "usuario", "1", "1");

        conEnDiagrama += relacion(diag, C.SRV_AuditoriaService, C.SRV_DataSource, "consulta la bitacora", "Dependency", "uses", "auditoria", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_AuditoriaService, C.CE_Usuario, "autor de la accion", "Association", "", "auditoria", "usuario", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_AuditoriaService, C.CE_Rol, "verificarPermiso, ver_auditoria", "Dependency", "uses", "auditoria", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.SRV_DataSource, "consulta la venta y graba el pdf_url", "Dependency", "uses", "comprobantes", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Venta, "la venta que hay que comprobar", "Dependency", "uses", "comprobantes", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Comprobante, "emite el comprobante", "Association", "", "comprobantes", "comprobante", "1", "0..1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Producto, "lee porcentaje_iva, que no existe", "Dependency", "uses", "comprobantes", "producto", "1", "0..1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Cliente, "nit y razon social", "Dependency", "uses", "comprobantes", "cliente", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Sucursal, "nombre de la sucursal", "Dependency", "uses", "comprobantes", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.SRV_BitacoraService, "registra la emision", "Dependency", "uses", "comprobantes", "bitacora", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.SRV_DataSource, "agrega y registra", "Dependency", "uses", "voz", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.SRV_BitacoraService, "registrarReporte, en transaccion", "Dependency", "uses", "voz", "bitacora", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_Usuario, "autor del reporte", "Association", "", "voz", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_Rol, "exigirPermisoReportes", "Dependency", "uses", "voz", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_ExistenciasService, C.SRV_DataSource, "consolida existencias", "Dependency", "uses", "existencias", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ExistenciasService, C.CE_InventarioStock, "suma las tres cantidades", "Dependency", "uses", "existencias", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ExistenciasService, C.CE_ProductoTallaColor, "variante del stock", "Dependency", "uses", "existencias", "prenda", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ExistenciasService, C.CE_Sucursal, "sucursal, pero sin filtrar por ella", "Dependency", "uses", "existencias", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_KardexService, C.SRV_DataSource, "lee los movimientos", "Dependency", "uses", "kardex", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_KardexService, C.CE_MovimientoInventario, "la seccion kardex del reporte", "Dependency", "uses", "kardex", "movimiento", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_KardexService, C.CE_Usuario, "alcance por sucursal del usuario", "Association", "", "kardex", "usuario", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_KardexService, C.CE_Sucursal, "sucursal del encargado", "Dependency", "uses", "kardex", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_BitacoraService, C.SRV_DataSource, "graba el evento", "Dependency", "uses", "bitacora", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_BitacoraService, C.CE_Usuario, "autor del evento", "Association", "", "bitacora", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_JwtAuthGuard, C.CE_Usuario, "usuario resuelto", "Association", "", "guard", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_UsuarioActual, C.CE_Usuario, "inyecta el Usuario", "Dependency", "uses", "decorador", "usuario", "1", "1");

        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_Rol, "roles del usuario", "Association", "", "usuario", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_UsuarioRol, "asignaciones", "Composition", "composition", "usuario", "asignacion", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_Rol, C.CE_UsuarioRol, "usuarios del rol", "Association", "", "rol", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_VentaItem, "items de la venta", "Composition", "composition", "venta", "item de venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_VentaItem, C.CE_ProductoTallaColor, "prenda vendida, une con el filtro de categoria", "Association", "", "item de venta", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Cliente, "cliente, o Consumidor Final", "Association", "", "venta", "cliente", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Sucursal, "sucursal de la venta", "Association", "", "venta", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Usuario, "vendedor", "Association", "", "venta", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Comprobante, C.CE_Venta, "comprobante de la venta, puede faltar", "Association", "", "comprobante", "venta", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Comprobante, C.CE_Cliente, "nit y razon social", "Dependency", "uses", "comprobante", "cliente", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Producto, C.CE_Categoria, "categoria del producto", "Association", "", "producto", "categoria", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Producto, C.CE_Temporada, "temporada del producto, nunca de la venta", "Association", "", "producto", "temporada", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Producto, C.CE_ProductoTallaColor, "prendas del producto", "Composition", "composition", "producto", "prenda", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Talla, "talla de la prenda", "Association", "", "prenda", "talla", "1", "0..1");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Color, "color de la prenda", "Association", "", "prenda", "color", "1", "0..1");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Categoria, "categoria heredada del producto", "Dependency", "uses", "prenda", "categoria", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_InventarioStock, C.CE_ProductoTallaColor, "stock por prenda", "Association", "", "stock", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_InventarioStock, C.CE_Sucursal, "stock por sucursal", "Association", "", "stock", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_ProductoTallaColor, "prenda que se movio", "Association", "", "movimiento", "prenda", "1", "0..1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_Sucursal, "sucursal del movimiento", "Association", "", "movimiento", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_Venta, "referencia VNT- mas id", "Dependency", "uses", "movimiento", "venta", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_Usuario, "quien lo hizo", "Association", "", "movimiento", "usuario", "0..1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("3 actores, " + DEF.length + " clases y " + TOTAL_REL + " relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (3), CTR_ controlador (5), SRV_ servicio (9), CE_ entidad (" + (DEF.length - 17) + ").");
        N.push("");
        N.push("HALLAZGO CRITICO 1: ESTE CASO NO TIENE IMPLEMENTACION, PERO ES EL PRIMERO");
        N.push("DE TODO EL LOTE EN EL QUE SE PUEDE HACER. LAS PIEZAS EXISTEN Y SON TRES.");
        N.push("");
        N.push("No hay modulo reportes, ni ReportesService, ni pagina, ni ruta /admin/reportes. La");
        N.push("unica ruta de reportes que hay es reportes/voz, la de CU43. Ese es el maximo que");
        N.push("se puede comprobar del caso. Pero a diferencia de CU44, aqui todo lo que el caso");
        N.push("necesita ya esta escrito en el proyecto:");
        N.push("");
        N.push("  las tres librerias      pdfkit, pdf-lib y xlsx, las tres instaladas");
        N.push("  tres generadores        comprobantes con pdfkit, voz con pdf-lib y xlsx, auditoria con CSV");
        N.push("  tres rutas de archivo   comprobantes/:id/pdf, respaldos/:id/descargar, auditoria?format=csv");
        N.push("  tres helpers de descarga  web/src/lib/api.ts lineas 1121, 1654 y 2014");
        N.push("");
        N.push("Y el caso acierta en lo tecnico: api/v1 es el prefijo real, main.ts:20, y el");
        N.push("ValidationPipe con whitelist y transform de main.ts:22 es lo que produciria los 422.");
        N.push("O sea que este es el caso mas barato de implementar del grupo de reportes. Lo que");
        N.push("no es barato es que los datos que tiene que exportar no existen.");
        N.push("");
        N.push("HALLAZGO 2: LA PRECONDICION DE ESTE CASO ES FALSA DE LA MANERA MAS LITERAL.");
        N.push("Las tablas EXISTEN. Lo que no existe son las FILAS.");
        N.push("");
        N.push("La base de datos tiene, despues de ejecutar schema.sql:");
        N.push("");
        N.push("  5 roles             Administrador, Encargado, Cajero, Cliente, Proveedor");
        N.push("  8 categorias        Remera, Pantalon, Vestido, Zapato y cuatro mas");
        N.push("  6 tallas             XS a XXL");
        N.push("  8 colores            con su codigo hexadecimal");
        N.push("");
        N.push("Y nada mas. Cero usuarios, cero sucursales, cero clientes, cero proveedores, cero");
        N.push("productos, cero ventas, cero venta_items, cero comprobantes, cero inventario_stock, cero");
        N.push("reservas, cero temporadas, cero movimientos.");
        N.push("");
        N.push("El caso lista diez tablas en su precondicion y dice que estan pobladas. De las diez,");
        N.push("solo categorias tiene filas, y son ocho nombres de prenda. Las otras nueve estan");
        N.push("vacias, y una de ellas, temporadas, es justamente el filtro opcional del caso: o");
        N.push("sea que el desplegable de temporada se ofrece con cero opciones.");
        N.push("");
        N.push("Ojo con una trampa al leer el schema: los INSERT INTO ventas, venta_items,");
        N.push("comprobantes, inventario_stock y movimientos_inventario SI aparecen en el fichero,");
        N.push("y no son datos iniciales. Son el cuerpo de sp_registrar_venta y de los triggers, que");
        N.push("ya se saben muertos. Un lector apresurado cuenta las tablas sembradas de una en");
        N.push("una y se lleva la sorpresa. Lo que hay que contar es el bloque de datos iniciales,");
        N.push("schema.sql:567,");
        N.push("y ahi solo estan roles, categorias, tallas y colores.");
        N.push("");
        N.push("HALLAZGO 3: PRODUCTOS NO SE PUEDE LLENAR NI UNO. LA CADENA ESTA ROTA EN SU ORIGEN.");
        N.push("");
        N.push("El caso depende de que existan productos, y el unico camino que hay para crearlos");
        N.push("falla siempre:");
        N.push("");
        N.push("  SRV_ProductosService.ts:245");
        N.push("    (codigo, nombre, descripcion, id_categoria, id_temporada, precio_base,");
        N.push("     porcentaje_iva, estado) VALUES (...)");
        N.push("");
        N.push("  schema.sql:223   productos  NO tiene porcentaje_iva");
        N.push("");
        N.push("No es que falte un valor: es que la sentencia INSERT nombra una columna que no");
        N.push("existe, y PostgreSQL la rechaza entera. Lo mismo en el otro sentido:");
        N.push("");
        N.push("  SRV_CatalogosService.ts:497,557   categorias.porcentaje_iva_default, que tampoco existe");
        N.push("");
        N.push("O sea que de las ocho categorias que SI estan sembradas, ninguna se puede editar");
        N.push("desde la aplicacion, porque el UPDATE de la linea 557 nombra la misma columna");
        N.push("inexistente. Las ocho que hay son intocables.");
        N.push("");
        N.push("Y no hay por donde arreglarlo. La unica migracion que hay en todo el repositorio es");
        N.push("migration_reportes_generativos.sql, de 530 bytes, y solo crea reportes_generativos.");
        N.push("No toca productos ni categorias. El unico ALTER TABLE del proyecto es el de");
        N.push("seed_imagenes_polera.sql, que anade una columna a producto_imagenes.");
        N.push("");
        N.push("Esta es la segunda aparicion del defecto de porcentaje_iva en un diagrama de esta");
        N.push("serie, y aqui tiene una consecuencia distinta: en CU34 y CU36 era que el IVA salia");
        N.push("mal en el calculo. Aqui es que no hay ni un solo producto en la base, y por lo tanto");
        N.push("el reporte de existencias, el detalle por linea, el filtro de categoria, el filtro");
        N.push("de temporada y el ranking de prendas quedan todos sin datos que mostrar.");
        N.push("");
        N.push("HALLAZGO 4: EL ESTADO QUE EL CASO PIDE NO ES UNA COLUMNA. HAY QUE CALCULARLO.");
        N.push("");
        N.push("El caso pide, para el reporte de inventario:");
        N.push("");
        N.push("  cantidad_disponible, cantidad_reservada, cantidad_vendida, stock_minimo_alert");
        N.push("  y estado (Disponible / Bajo / Sin stock)");
        N.push("");
        N.push("Las cuatro primeras columnas existen. La quinta no existe en ninguna parte: las");
        N.push("palabras Bajo y Sin stock aparecen CERO veces en schema.sql, y la tabla");
        N.push("inventario_stock no tiene columna estado. La unica que se parece es");
        N.push("producto_talla_color.estado_stock, con default Disponible, y que nadie actualiza");
        N.push("nunca en todo el proyecto: es la cuarta columna que no se recalcula.");
        N.push("");
        N.push("O sea que el estado del reporte hay que derivarlo en la consulta, y eso es lo");
        N.push("correcto. Pero conviene que quede escrito, porque si alguien reutiliza el");
        N.push("estado_stock del producto para rellenar la columna del reporte estaria.publicando");
        N.push("un dato parado, y el mismo producto apareceria con dos estados distintos en dos");
        N.push("pantallas del mismo sistema de administracion.");
        N.push("");
        N.push("Y hay un remate: ese estado, derivado, tiene que salir de las tres cantidades, y las");
        N.push("tres cantidades ya se sabe que no cuadran. CU39 demostro que la reserva vacia");
        N.push("cantidad_disponible y que la venta lee esa columna pero nunca usa cantidad_reservada.");
        N.push("O sea que un Sin stock calculado sobre esas cifras es correcto segun la regla y");
        N.push("falso segun la realidad. El caso pide la foto de existencias de un almacen que no");
        N.push("se puede describir con esas tres columnas.");
        N.push("");
        N.push("HALLAZGO 5: EL FILTRO DE TEMPORADA NO LLEGA A LA VENTA. Y LA TABLA ESTA VACIA.");
        N.push("");
        N.push("El caso define temporada como filtro del reporte de ventas. Pero id_temporada esta");
        N.push("en cuatro tablas y ninguna es de ventas:");
        N.push("");
        N.push("  schema.sql:229   productos.id_temporada");
        N.push("  schema.sql:267   colecciones.id_temporada");
        N.push("  schema.sql:507   preferencias_cliente.id_temporada");
        N.push("");
        N.push("Ni ventas ni venta_items la tienen. O sea que una venta no es de una temporada: es");
        N.push("de productos, y los productos son de temporadas. Una venta con tres prendas de dos");
        N.push("temporadas distintas pertenece a las dos, y al aplicar el filtro aparece en dos");
        N.push("grupos. Y una venta de diciembre del Verano 2025 cae a la vez en el grupo de la");
        N.push("temporada y en el mes de diciembre, que es el otro eje de tiempo que usa este");
        N.push("proyecto: el ventas_por_mes de CU44. Un reporte con dos ejes temporales");
        N.push("superpuestos, uno por fecha de venta y otro por temporada comercial.");
        N.push("");
        N.push("Y por si fuera poco, la tabla temporadas no tiene ni una fila, asi que el filtro");
        N.push("no tiene nada que ofrecer. Para colmo su estado tiene default Programada, que es el");
        N.push("estado mas raro del vocabulario del proyecto.");
        N.push("");
        N.push("HALLAZGO 6: EL FILTRO DE CATEGORIA INVENTA DINERO. EL RIESGO MAYOR DEL CASO.");
        N.push("");
        N.push("ventas no tiene id_categoria. La categoria de una venta se deduce por la cadena");
        N.push("");
        N.push("  ventas -> venta_items -> producto_talla_color -> productos -> categorias");
        N.push("");
        N.push("que es una cadena de uno a muchos, y ahi esta el problema. El caso pide filtrar por");
        N.push("categoria y en el mismo GROUP BY pedir n_ventas y ventas_totales con SUM(total).");
        N.push("Una venta de tres prendas repartidas en dos categorias, al cruzarla con el filtro,");
        N.push("aparece DOS VECES. El total se cuenta dos veces, y el numero de ventas tambien, o");
        N.push("sea que el reporte dira que se vendieron mas prendas de las que se vendieron.");
        N.push("");
        N.push("Y esto no es un error de redondeo ni una discrepancia de centavos: es una cifra de");
        N.push("ingresos inflada, y es justo la cifra que va a contabilidad. Todo lo demas de este");
        N.push("lote ha sido un error visible o un dato que no aparece. Este es el primero que");
        N.push("presenta un numero plausible y mayor que el real, en un documento que alguien");
        N.push("firmaria. La solucion es un DISTINCT en la consulta, con id_venta para el");
        N.push("conteo y con el total tomado de la venta y no de la linea, y conviene que el caso");
        N.push("la escriba, porque el agregador por categoria es tentador y falla en silencio.");
        N.push("");
        N.push("HALLAZGO 7: METODO DE PAGO TIENE DOS VALORES REALES, UN TERCER GRUPO VACIO,");
        N.push("Y NO ES EL QUE DICE SI LA VENTA SE COBRO.");
        N.push("");
        N.push("El caso agrupa por metodo_pago. Esa columna esta en ventas, linea 391, asi que");
        N.push("existe. Lo que no cuadra es su contenido:");
        N.push("");
        N.push("  el codigo escribe solo Efectivo y Tarjeta, en dos sitios cada uno");
        N.push("  metodo_pago es VARCHAR(30), nullable, sin default");
        N.push("  NADCA parte del proyecto hace UPDATE de ventas.metodo_pago");
        N.push("");
        N.push("El unico UPDATE de ventas en el backend entero es SET estado = Completada, en los");
        N.push("dos puntos de cobro de SRV_PagosService. O sea que el metodo de pago se escribe");
        N.push("una vez, al crear la venta, y no se vuelve a tocar. Y como es nullable, hay un");
        N.push("tercer grupo que no es Efectivo ni Tarjeta sino vacio, que el reporte imprimiria");
        N.push("con un encabezado sin nada debajo.");
        N.push("");
        N.push("El problema de fondo es otro y ya se conoce de CU35: el estado real del pago esta");
        N.push("en pagos.estado, con sus tres valores Pendiente, Aprobado y Rechazado, y en");
        N.push("transacciones_pago. ventas.metodo_pago es una etiqueta. El caso filtra por");
        N.push("ventas.estado = Completada y nunca mira pagos.estado, y con lo que se sabe de");
        N.push("CU35 una venta puede quedar Completada con una transaccion rechazada o con el");
        N.push("pago reintentado. El reporte contaria como venta cobrada una venta cuyo cobro no se");
        N.push("confirmo, y mas grave para contabilidad: lo presentaria como facturado.");
        N.push("");
        N.push("Y el detalle por linea del caso exige comprobante.numero. Con lo del hallazgo 8");
        N.push("ese numero no existe, asi que la columna saldra vacia en todas las lineas.");
        N.push("");
        N.push("HALLAZGO 8: LA SECCION DE COMPROBANTES DEL REPORTE NUNCA SE PUEDE LLENAR.");
        N.push("");
        N.push("El caso dice que el reporte es consistente con las ventas completadas Y con los");
        N.push("comprobantes. Y pide comprobar que comprobantes se emite junto al cobro. Y hay un");
        N.push("problema mas profundo:");
        N.push("");
        N.push("SRV_ComprobantesService.ts:196   SELECT ... p.porcentaje_iva");
        N.push("schema.sql:223                 productos no tiene porcentaje_iva");
        N.push("");
        N.push("Esa consulta lanza column p.porcentaje_iva does not exist, que es un error de");
        N.push("PostgreSQL, no una excepcion de Nest, y sube hasta el llamador. Los dos puntos");
        N.push("que llaman a generar no lo envuelven en try. La llamada a caja esta en");
        N.push("SRV_PagosService.ts:356 y la digital en la 727, y en los dos casos esta FUERA del");
        N.push("bloque de transaccion, que ya se cerro antes.");
        N.push("");
        N.push("Y hay un comentario al lado, en la linea 781, que dice:");
        N.push("");
        N.push("  El feedback de preferencias nunca debe impedir completar la venta");
        N.push("  ni emitir el comprobante.");
        N.push("");
        N.push("El autor estaba pensando en el comprobante, pero el try que escribio envuelve a");
        N.push("registrarPreferenciasDeVenta, y no a generar. O sea que el try que evita que");
        N.push("el comprobante rompa la venta se puso en el sitio equivocado. El resultado es");
        N.push("este, y es el peor fallo posible en un punto de caja:");
        N.push("");
        N.push("  1. la transaccion ya se commiteo: inventario restado, movimiento escrito,");
        N.push("     venta en Completada, dinero cobrado");
        N.push("  2. generar falla al leer porcentaje_iva");
        N.push("  3. el error sube y el cliente recibe un 500");
        N.push("");
        N.push("El cajero ve un error, el cliente cree que no se cobro, y la venta si que se");
        N.push("cobro. Y el comprobante es idempotente, lo cual suena bien pero aqui no ayuda:")
        N.push("la idempotencia solo sirve si la primera llamada sale bien, y la primera");
        N.push("falla siempre.");
        N.push("");
        N.push("Para este caso la consecuencia es directa: la tabla comprobantes no tendra ni una");
        N.push("fila, la columna comprobante.numero del detalle saldra vacia, y la postcondicion");
        N.push("del caso, que dice que el archivo es consistente con los comprobantes, no se puede");
        N.push("cumplir. Un reporte contable cuya linea de detalle no tiene numero de");
        N.push("comprobante no sirve para nada, y es la razon por la que el numero de");
        N.push("comprobante se pide explicitamente en cada linea.");
        N.push("");
        N.push("HALLAZGO 9: HAY DOS GENERADORES DE CSV Y NO SE PARECEN EN NADA. ESTE CASO SERIA");
        N.push("EL TERCERO Y EL PRIMERO QUE SALE BIEN.");
        N.push("");
        N.push("El caso pide CSV con BOM para Excel. En el repositorio no hay ni un archivo con");
        N.push("BOM, y los dos generadores que hay se contradicen en todo:");
        N.push("");
        N.push("  SRV_ReportesVozService  entrecomilla solo los valores que llevan coma, no escapa");
        N.push("                          las comillas sueltas, une con \\n, devuelve un Buffer");
        N.push("  SRV_AuditoriaService   entrecomilla SIEMPRE y duplica las comillas internas,");
        N.push("                          une con \\r\\n, devuelve un string");
        N.push("");
        N.push("El de auditoria es el correcto. El de voz tiene los dos fallos clasicos: un");
        N.push("valor con una coma dentro de un texto entrecomillado rompe la columna, y una");
        N.push("comilla suelta descoloca la linea entera. Y ninguno de los dos escribe BOM.");
        N.push("");
        N.push("El caso, al pedir el BOM, seria el primer CSV bien formado del proyecto. Y hay un");
        N.push("detalle en la ruta que ya existe: CTR_Auditoria.ts:37 fija");
        N.push("text/csv; charset=utf-8, y Excel no hace caso al charset en un CSV, solo al BOM.");
        N.push("O sea que el charset esta declarado y es decorativo, y el BOM que hace falta no");
        N.push("esta. La bitacora de hoy, abierta en Excel, muestra Accion y Razon social con");
        N.push("caracteres raros. Arreglar el de auditoria es una linea; arreglar el de voz es reescribir");
        N.push("el escape. Y el caso, al ser nuevo, deberia copiar el de auditoria, no el de voz.");
        N.push("");
        N.push("HALLAZGO 10: EL XLSX DE DOS HOJAS ES CAPACIDAD NUEVA, Y EL PDF DE REPORTE");
        N.push("CON TABLA Y TOTALES TAMBIÉN.");
        N.push("");
        N.push("El caso pide un XLSX con hojas Ventas y Kardex. El unico generador de XLSX es el");
        N.push("de CU43, y sus cuatro lineas hacen esto:");
        N.push("");
        N.push("  const ws = XLSX.utils.json_to_sheet(filas, { header: columnas });");
        N.push("  const wb = XLSX.utils.book_new();");
        N.push("  XLSX.utils.book_append_sheet(wb, ws, 'Reporte');");
        N.push("  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });");
        N.push("");
        N.push("Una sola hoja, de nombre fijo. Anadir la segunda hoja es cambiar una linea, pero");
        N.push("eso obliga a que generarXLSX acepte un array de hojas y no una tabla, osea que");
        N.push("cambia la firma, y entonces hay que tocar tambien la llamada. No es gratis.");
        N.push("");
        N.push("Y el PDF con tabla de detalle y totales, con paginacion y cabecera repetida, es");
        N.push("otro tanto: el unico PDF con tabla del proyecto es el de comprobantes, que es un");
        N.push("documento de una hoja con texto plano y pdfkit, y el unico de pdf-lib es el de");
        N.push("voz, que es un PDF de texto. Ninguno de los dos ha hecho nunca una tabla que");
        N.push("salte de pagina. Es la parte de este caso que mas trabajo real tiene, y es la");
        N.push("que el caso describe en una linea.");
        N.push("");
        N.push("HALLAZGO 11: LA TENDENCIA DE AUDITORIA ES UNA REGRESION, Y EN ESTE CASO CUESTA.");
        N.push("");
        N.push("El caso dice: queda la trazabilidad opcional del evento si el Admin lo audita. O");
        N.push("sea que el reporte NO se registra. Y el caso anterior, el de voz, si lo hace, y");
        N.push("con una transaccion de verdad:");
        N.push("");
        N.push("  SRV_ReportesVozService.ts:433   registrarReporte");
        N.push("  434  createQueryRunner, connect, startTransaction");
        N.push("  441  INSERT INTO reportes_generativos");
        N.push("  447  INSERT INTO bitacora_auditoria, dentro de la misma transaccion");
        N.push("  452  commitTransaction");
        N.push("");
        N.push("Es la unica transaccion real del proyecto entero, y esta en el modulo que");
        N.push("genera una lista de ventas hablada. Este caso genera un documento de ventas para");
        N.push("contabilidad, y no deja ni una linea de que se ha descargado. Es el artefacto mas");
        N.push("sensible del sistema y el unico cuya descarga no queda registrada. Ademas no hay");
        N.push("manera de saber que alguien ha sacado la lista de ventas de la empresa, porque");
        N.push("la tabla reportes_generativos existe y esta disponible, con sus dos indices, y");
        N.push("la unica migracion del proyecto es la que la crea.");
        N.push("");
        N.push("A esto se suma que el caso dice opcional por una intencion que conviene mirar: si");
        N.push("se registra, se puede saber que un administrador consulto ventas de toda la");
        N.push("empresa. No registrar no es neutro, es no tener registro. Y en una tienda de ropa");
        N.push("con cinco roles, el caso es justo el que mas conviene que quede anotado.");
        N.push("");
        N.push("HALLAZGO 12: EL PREVIEW PAGINADO ES LO UNICO DEL CASO QUE YA ESTA HECHO.");
        N.push("");
        N.push("El paso 3, la vista previa paginada antes de exportar, tiene once archivos de");
        N.push("referencia en el backend: catalogos, ajustes, existencias, kardex, auditoria,");
        N.push("recomendaciones y ventas usan pagina, limit y offset. Y el patron de la consulta");
        N.push("de Kardex es exactamente el que necesita la seccion de movimientos del reporte,");
        N.push("con sus tres referencias opcionales resueltas a una sola y sus COALESCE en los");
        N.push("stocks. Es la parte de este caso que se puede copiar casi linea por linea.");
        N.push("");
        N.push("Y hay un detalle a favor que el caso no menciona: SRV_KardexService SI tiene");
        N.push("alcance por sucursal, con sucursalEncargado en la linea 79 y esAdministrador en la");
        N.push("89. SRV_ExistenciasService, que CU44 senalo como el que no lo tiene, tambien esta");
        N.push("en este diagrama por la mitad de existencias. O sea que las dos mitades del");
        N.push("reporte de inventario leen el mismo almacen con dos alcances distintos: Kardex");
        N.push("filtrado por la sucursal del encargado y existencias sin filtrar. Un mismo PDF");
        N.push("con las dos cifras al lado, y solo una respetando el permiso de sucursal.");
        N.push("");
        N.push("HALLAZGO 13: EL INDICE QUE HAY NO SIRVE PARA EL FILTRO POR DEFECTO.");
        N.push("");
        N.push("El unico indice sobre ventas es el de la linea 564:");
        N.push("");
        N.push("  CREATE INDEX idx_ventas_sucursal_fecha ON ventas (id_sucursal, fecha_venta);");
        N.push("");
        N.push("El caso dice que el filtro por defecto es Todas, es decir que NO se manda");
        N.push("id_sucursal. Con ese indice, un reporte de Todas no lo puede usar, porque la");
        N.push("primera columna del indice no se restringe. O sea que el caso por defecto sobre un");
        N.push("ano entero es un recorrido secuencial de ventas, y luego un orden por fecha.");
        N.push("");
        N.push("Y no hay indice en ninguno de los dos puntos de union: venta_items no tiene");
        N.push("indice sobre id_venta, ni comprobantes sobre id_venta. Postgres no crea indice");
        N.push("automatico en las claves foraneas, y los siete CREATE INDEX del esquema son");
        N.push("todos de otros. Un reporte que une ventas con venta_items, producto_talla_color,");
        N.push("productos, categorias, comprobantes y sucursales, y ademas con movimientos,");
        N.push("son ocho tablas, con dos tablas puente y sin un indice de union. La primera vez");
        N.push("que se pida el reporte de un ano, es cuando se descubre eso, y coincide con la");
        N.push("excepcion E5, que es justamente la que avisa de un fallo de generacion por");
        N.push("limite de datos. La excepcion bien pensada llega tarde, porque la causa real no");
        N.push("es el volumen, es que no hay indice donde hace falta.");
        N.push("");
        N.push("HALLAZGO 14: LO QUE EL CASO HACE BIEN, Y NO ES POCO.");
        N.push("");
        N.push("  - Declara que no hay escrituras. Es cierto, y en un proyecto donde el cobro");
        N.push("    deja la venta a medias CU45 es mucho mas seguro que los otros modulos.");
        N.push("  - Filtra ventas por estado Completada, no por Pendiente. Con lo de CU35 una")
        N.push("    venta pendiente puede quedarse para siempre sin pagarse, y sin ese filtro")
        N.push("    contaria en el reporte como venta.")
        N.push("  - Usa la misma convencion de formato que CU43, pdf, xlsx y csv, con la misma")
        N.push("    validacion de lista blanca, que es lo que ya hace CU43. Reutilizar el")
        N.push("    FORMATOS y la exception de CU43 evita un tercer vocabulario.")
        N.push("  - Pide el Kardex como seccion aparte y no mezclado con las existencias, que es")
        N.push("    la distincion correcta: uno es una foto, el otro es un historico.")
        N.push("  - E4, generar el archivo aunque no haya datos, es la misma decision que CU44 y")
        N.push("    aqui importa mas. Un reporte que se niega a generarse cuando el periodo esta")
        N.push("    vacio no se puede usar para demostrar que no hubo ventas, que es la consulta")
        N.push("    mas frecuente de un reporte contable.")
        N.push("  - La vista previa antes de exportar es lo que evita el error caro: descargar")
        N.push("    un informe anual equivocado y descubrirlo al abrir el PDF.")
        N.push("");
        N.push("HALLAZGO 15: LO QUE FALTA EN LA INTERFAZ Y YA SE SABE COMO SE RESUELVE.");
        N.push("");
        N.push("El caso pide un toast de confirmacion. No hay un toast compartido: es una funcion");
        N.push("Toast definida dentro de cada pagina, y hay que copiarla otra vez. Los tres");
        N.push("helpers de descarga de api.ts resuelven el problema de verdad, y son estos:");
        N.push("");
        N.push("  api.ts:1121  exportarAuditoriaCSV   devuelve { blob, filename }, lee el")
        N.push("                                        Content-Disposition con una expresion");
        N.push("                                        regular y pone su propio nombre por si")
        N.push("                                        falta la cabecera")
        N.push("  api.ts:1654  descargarRespaldo       igual, con su nombre de reserva")
        N.push("  api.ts:2014  descargarComprobantePdf  este es el raro: recibe el blob, hace")
        N.push("                                        una etiqueta con el nombre y lo baja, y")
        N.push("                                        se INVENTA el nombre, comprobante-N.pdf,");
        N.push("                                        ignorando el numero de comprobante que")
        N.push("                                        el servidor si manda. O sea que CU38")
        N.push("                                        pierde el nombre real del PDF.")
        N.push("");
        N.push("Para CU45 el camino es copiar el de la 1654, que es el correcto, y no inventar un")
        N.push("cuarto. Y ojo con el nombre de fichero que pide el caso, reporte_ventas_YYYYMMDD.pdf:")
        N.push("sin guiones. La unica descarga existente usa bitacora_auditoria_YYYY-MM-DD.csv, con")
        N.push("guiones. Serian dos formatos de fecha en el nombre de la misma carpeta de descargas.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - El permiso seguiria siendo consultar_reportes, novena aparicion de un");
        N.push("    permiso que no esta en ninguno de los cinco roles sembrados. Con CU43 se")
        N.push("    repartiria entre dos items de menu, ambos invisibles para todo el mundo")
        N.push("    salvo el administrador, que lo tiene por el asterisco.")
        N.push("  - La precondicion dice que la sucursal del usuario, si corresponde, permite el")
        N.push("    alcance del reporte. Esa clausula no le sirve a nadie: al Encargado y al Cajero")
        N.push("    se les rechaza antes por falta de consultar_reportes, y el Administrador ve")
        N.push("    todas por el asterisco. Es el noveno caso en que el permiso y el alcance por")
        N.push("    sucursal no tienen ni un usuario al que aplicarse. Y de las tres rutas que hoy")
        N.push("    sirven un archivo, ninguna filtra por sucursal: auditoria no, comprobantes")
        N.push("    no, respaldos no.")
        N.push("  - El caso dice que usa la misma fuente de datos que CU44, y CU44 no existe.")
        N.push("    Las dos referencias cruzadas del caso apuntan a dos cosas distintas: un")
        N.push("    modulo inexistente y un servicio que no filtra por sucursal. La primera es")
        N.push("    una promesa de reutilizacion imposible y la segunda es una limitacion real.")
        N.push("  - La columna estado del reporte y la del producto, que no se actualiza nunca,");
        N.push("    darian dos verdades distintas sobre el mismo almacen. Conviene que el reporte")
        N.push("    lo derive y que el nombre de la columna lo diga, para que nadie lo lea como")
        N.push("    un dato guardado.")
        N.push("  - Es el unico caso del lote cuya parte mas fiable y la parte mas dudosa estan")
        N.push("    en el mismo fichero. La seccion Kardex, con tipo, cantidad, stock anterior,");
        N.push("    stock posterior, referencia y fecha, coincide exactamente con el esquema y")
        N.push("    tiene indice en la linea 562, y la llenan cuatro servicios y cuatro triggers.")
        N.push("    Esa parte seria correcta. La parte de ventas no tendria ni una fila. Y en el")
        N.push("    PDF saldrian una tras otra, sin separacion, que es como se cuelan los datos")
        N.push("    buenos de un sistema que en general no los tiene.");
        N.push("");
        N.push("  - La comparacion con CU44, que es el caso gemelo: el de CU44 tiene seis");
        N.push("    agregaciones que no existen y este tiene tres generadores que si. Al")
        N.push("    reveso de CU44, aqui el trabajo de codigo es pequeno y el de decidir que se")
        N.push("    imprime, cuando el almacen esta vacio, es el grande. Un reporte de ventas con");
        N.push("    cero ventas, ocho categorias y ningun comprobante se entrega igual, con sus")
        N.push("    totales en cero y su aviso de que no hay datos. Se puede hacer, y probablemente");
        N.push("    convenga, pero conviene que el archivo diga en portada la fecha de corte y")
        N.push("    que no se confunda con un reporte de un periodo sin actividad.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU45 - Generar Reportes de Ventas e Inventario - INFORME");
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
    msg = msg + "CU45 - Generar reportes de ventas e inventario" + SALTO + SALTO;
    msg = msg + "No hay modulo reportes, ni pagina, ni ruta. Pero las" + SALTO;
    msg = msg + "piezas si: 3 librerias, 3 generadores, 3 rutas de" + SALTO;
    msg = msg + "archivo y 3 helpers de descarga. El caso mas barato" + SALTO;
    msg = msg + "de implementar del grupo de reportes." + SALTO + SALTO;
    msg = msg + "La base solo tiene 5 roles, 8 categorias, 6 tallas y" + SALTO;
    msg = msg + "8 colores. Cero productos, cero ventas, cero usuarios." + SALTO;
    msg = msg + "Y productos no se puede llenar: el INSERT nombra" + SALTO;
    msg = msg + "porcentaje_iva, que no existe en el esquema." + SALTO;
    msg = msg + "El filtro de categoria puede contar el dinero dos veces." + SALTO;
    msg = msg + "Y el comprobante.numero saldra vacio siempre." + SALTO;
    msg = msg + "El Kardex si estaria bien. Las ventas no." + SALTO + SALTO;
    msg = msg + "Clases: " + DEF.length + "    Actores: 3    Relaciones: " + TOTAL_REL + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de " + TOTAL_ATR + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de " + TOTAL_OPE + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de " + TOTAL_REL + SALTO;
    if (conEnDiagrama < TOTAL_REL) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU45 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU45 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU45", 0); } catch (e3) { }
}
