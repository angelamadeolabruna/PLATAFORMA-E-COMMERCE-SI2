// ================================================================
// CU38 - EMITIR COMPROBANTE DE VENTA
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   api/src/modulos/comprobantes/CTR_Comprobantes.ts:8    @Controller('ventas')
//   api/src/modulos/comprobantes/CTR_Comprobantes.ts:22   GET mias/compras
//   api/src/modulos/comprobantes/CTR_Comprobantes.ts:28   @Controller('comprobantes')
//   api/src/modulos/comprobantes/CTR_Comprobantes.ts:33   GET :id/pdf con StreamableFile
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:21  el ternario del storage
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:55  esDuenoVenta
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:68  exigirPermisoConsulta
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:79  numeracionCorrelativa con COUNT
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:91  datosComprobanteDB
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:115 guardarPdf en disco
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:171 IVA con 13 fijo
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:186 generar
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:196 lee p.porcentaje_iva: NO existe
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:226 el NIT sale de la bitacora
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:312 consultarDeVenta GENERA
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:318 descargarPdf
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:338 comprasDelCliente
//   web/src/pages/admin/AdminCaja.tsx:295,308           Imprimir y Descargar PDF
//   web/src/lib/api.ts:2006-2019                        descarga por blob, renombra el archivo
//   web/src/router.tsx:93                               /compras con MisCompras
//   schema.sql:408  comprobantes, UNIQUE solo en numero
//   schema.sql:0    CERO ALTER TABLE en todo el esquema
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
var TOTAL_REL = 61;
var TOTAL_ATR = 94;
var TOTAL_OPE = 36;

var DEF = [
    ["IU_AdminCaja", "EXISTE. web/src/pages/admin/AdminCaja.tsx", "los botones Imprimir y Descargar PDF de CU37",
     [["ventaOk", "Object = null", VIS_PUB], ["error", "String = null", VIS_PUB], ["enviando", "Boolean", VIS_PUB]],
     [["consultarYImprimir", "void", [], VIS_PUB], ["consultarYDescargar", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_MisCompras", "EXISTE. web/src/pages/cliente/MisCompras.tsx, ruta /compras", "el historial de compras del Cliente",
     [["compras", "Array", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String = null", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["abrirComprobante", "void", ["idComprobante"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "EXISTE. web/src/lib/api.ts:1991-2074", "consultar, descargar y listar; la descarga es por blob",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["consultarComprobanteVenta", "Object", ["idVenta"], VIS_PUB], ["descargarComprobantePdf", "void", ["idComprobante"], VIS_PUB], ["abrirComprobantePdf", "void", ["idComprobante"], VIS_PUB], ["comprasDelCliente", "Array", [], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["IU_VisorPdf", "EXISTE. lib/api.ts:2006-2019", "convierte la respuesta en blob y renombra el archivo",
     [["enlace", "HTMLAnchorElement", VIS_PRI], ["url", "String = blob", VIS_PRI]],
     [["descargar", "void", ["idComprobante"], VIS_PUB], ["imprimir", "void", ["idComprobante"], VIS_PUB]]],

    ["CTR_ComprobanteVentaController", "EXISTE. comprobantes/CTR_Comprobantes.ts:8", "guard de clase; el GET tambien emite",
     [["comprobantesService", "ComprobantesService", VIS_PRI]],
     [["consultarDeVenta", "Comprobante", ["idVenta", "request", "currentUser"], VIS_PUB], ["misCompras", "Array", ["currentUser"], VIS_PUB]]],

    ["CTR_ComprobantesController", "EXISTE. comprobantes/CTR_Comprobantes.ts:28", "StreamableFile con Content-Disposition",
     [["comprobantesService", "ComprobantesService", VIS_PRI]],
     [["descargarPdf", "StreamableFile", ["idComprobante", "currentUser"], VIS_PUB]]],

    ["SRV_ComprobantesService", "EXISTE. comprobantes/SRV_ComprobantesService.ts, 358 lineas", "12 metodos; generar es idempotente",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["esDuenoVenta", "Boolean", ["usuario", "idVenta"], VIS_PRI], ["exigirPermisoConsulta", "void", ["usuario", "idVenta"], VIS_PRI], ["numeracionCorrelativa", "String", ["idSucursal", "anio"], VIS_PRI], ["datosComprobanteDB", "Object", ["idComprobante"], VIS_PRI], ["datosComprobanteDeVenta", "Object", ["idVenta"], VIS_PRI], ["guardarPdf", "String", ["numero", "buffer"], VIS_PRI], ["componerPdf", "Buffer", ["venta", "items", "sucursal", "cajero"], VIS_PRI], ["generar", "Comprobante", ["idVenta", "idUsuario", "request"], VIS_PUB], ["consultarDeVenta", "Comprobante", ["usuario", "idVenta", "request"], VIS_PUB], ["descargarPdf", "Object", ["usuario", "idComprobante"], VIS_PUB], ["comprasDelCliente", "Array", ["usuario"], VIS_PUB]]],

    ["SRV_StorageLocal", "EXISTE. SRV_ComprobantesService.ts:21 y :115", "el S3 no existe: el ternario tiene dos ramas iguales",
     [["DIR_COMPROBANTES", "String = comprobantes", VIS_PRI]],
     [["guardarPdf", "String", ["numero", "buffer"], VIS_PUB], ["existe", "Boolean", ["ruta"], VIS_PUB], ["leer", "Buffer", ["ruta"], VIS_PUB]]],

    ["SRV_BitacoraService", "EXISTE. seguridad/SRV_BitacoraService.ts", "una escritura, y tambien la fuente del NIT",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "EXISTE. seguridad/dependencias.ts", "las tres rutas lo llevan, de clase",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB]]],

    ["SRV_UsuarioActual", "EXISTE. seguridad/dependencias.ts", "inyecta el Usuario en las tres rutas",
     [],
     [["UsuarioActual", "Usuario", ["datos", "contexto"], VIS_PUB]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "consultas sueltas, sin transaccion en todo el servicio",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB]]],

    ["CE_Comprobante", "EXISTE. comprobantes (schema.sql:408)", "UNIQUE solo en numero; id_venta no lo tiene",
     [["id_comprobante", "Integer = PK", VIS_PRI], ["id_venta", "Integer", VIS_PUB], ["numero", "String = 30 UNIQUE", VIS_PUB], ["tipo", "String = 20", VIS_PUB], ["nit_cliente", "String = 30", VIS_PUB], ["razon_social", "String = 150", VIS_PUB], ["total", "Decimal(12,2)", VIS_PUB], ["fecha_emision", "Timestamp = NOW()", VIS_PUB], ["pdf_url", "Text", VIS_PUB]],
     []],

    ["CE_Venta", "EXISTE. ventas (schema.sql:384)", "el PDF se compone con estos datos",
     [["id_venta", "Integer = PK", VIS_PRI], ["id_cliente", "Integer = nullable", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["id_carrito", "Integer = nullable", VIS_PUB], ["modalidad", "String = 20", VIS_PUB], ["metodo_pago", "String = 30", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB], ["impuestos", "Decimal(12,2)", VIS_PUB], ["total", "Decimal(12,2)", VIS_PUB], ["estado", "String = 20", VIS_PUB], ["fecha_venta", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_VentaItem", "EXISTE. venta_items (schema.sql:399)", "el detalle que se imprime linea por linea",
     [["id_venta_item", "Integer = PK", VIS_PRI], ["id_venta", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["precio_unitario", "Decimal(10,2)", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB]],
     []],

    ["CE_Producto", "EXISTE. productos (schema.sql:223)", "solo aporta codigo y nombre; el IVA no existe",
     [["id_producto", "Integer = PK", VIS_PRI], ["codigo", "String = 40 UNIQUE", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["precio_base", "Decimal(10,2) NOT NULL", VIS_PUB], ["estado", "String = Disponible", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. producto_talla_color (schema.sql:237)", "une el item con producto, talla y color",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB], ["estado_stock", "String = Disponible", VIS_PUB]],
     []],

    ["CE_Talla", "EXISTE. tallas", "LEFT JOIN en el detalle del comprobante",
     [["id_talla", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["orden", "Integer", VIS_PUB]],
     []],

    ["CE_Color", "EXISTE. colores", "LEFT JOIN en el detalle del comprobante",
     [["id_color", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["codigo_hex", "String", VIS_PUB]],
     []],

    ["CE_Cliente", "EXISTE. clientes (schema.sql:87)", "el puente para que el Cliente sea dueno de su venta",
     [["id_cliente", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE, nullable", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["direccion", "Text", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. usuarios (schema.sql:32)", "dueño de la venta y emisor del comprobante",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120 UNIQUE", VIS_PRI], ["estado", "String = Pendiente", VIS_PUB]],
     []],

    ["CE_UsuarioEmpleado", "EXISTE. usuarios_empleados (schema.sql:76)", "de aqui sale el nombre del cajero del PDF",
     [["id_empleado", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE", VIS_PUB], ["nombre", "String = 120", VIS_PUB], ["rol", "String = 60", VIS_PUB], ["fecha_baja", "Timestamp = nullable, NO se filtra", VIS_PUB]],
     []],

    ["CE_Rol", "EXISTE. roles; permisos_json en schema.sql:573", "realizar_venta NO esta en ninguno de los 5 roles",
     [["id_rol", "Integer = PK", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["descripcion", "String", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "EXISTE. usuarios_roles con PK compuesta", "cargarPermisos solo lee la PRIMERA fila de la union",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_Sucursal", "EXISTE. sucursales", "el nombre va impreso y la sucursal forma parte del numero",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_BitacoraAuditoria", "EXISTE. bitacora_auditoria (schema.sql:148)", "es la base de datos de la facturacion",
     [["id_bitacora", "Integer = PK", VIS_PRI], ["id_usuario", "Integer = ON DELETE SET NULL", VIS_PUB], ["accion_sql", "String = 40", VIS_PUB], ["tabla_afectada", "String = 80", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "INET", VIS_PUB], ["user_agent", "String = 255", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Sistema", "El backend, al completarse el pago", "no necesita sesion: lo llaman CU35 y CU37"],
    ["ACTOR_Cajero", "Cajero que imprime o reimprime", "NO tiene realizar_venta"],
    ["ACTOR_Cliente", "Cliente que consulta el suyo", "pasa por dueno, no por permiso"],
    ["ACTOR_Administrador", "Administrador con consulta global", "wildcard *"]
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
    var mod = buscarPaquete(cu, "4. Ventas y Pagos");
    if (mod == null) mod = buscarPaquete(cu, "11. Comprobantes y Reportes");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU38 - Análisis de clases");

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
        nota(act, ACTORES[a][1] + ". Requiere el permiso " + ACTORES[a][2] + ".");
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
    try { diag = paq.Diagrams.AddNew("CU38 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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

        conEnDiagrama += relacion(diag, actores[0], C.SRV_ComprobantesService, "emite al completarse el pago", "Dependency", "uses", "sistema", "comprobantes", "0..*", "1");
        conEnDiagrama += relacion(diag, actores[1], C.IU_AdminCaja, "imprime o reimprime", "Association", "", "cajero", "caja", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C.CTR_ComprobantesController, "descarga el PDF", "Association", "", "cajero", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[2], C.IU_MisCompras, "consulta el suyo", "Association", "", "cliente", "mis compras", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[2], C.CTR_ComprobanteVentaController, "consulta por HTTP", "Association", "", "cliente", "endpoint", "1", "0..1");
                conEnDiagrama += relacion(diag, actores[3], C.CTR_ComprobanteVentaController, "consulta global", "Association", "", "administrador", "endpoint", "1", "0..1");

        conEnDiagrama += relacion(diag, C.IU_AdminCaja, C.IU_Api, "cliente HTTP", "Dependency", "uses", "caja", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminCaja, C.CE_Comprobante, "numero que muestra", "Association", "", "caja", "comprobante", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_MisCompras, C.IU_Api, "cliente HTTP", "Dependency", "uses", "mis compras", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_MisCompras, C.CE_Comprobante, "comprobante de cada venta", "Association", "", "mis compras", "comprobante", "0..*", "1");
        conEnDiagrama += relacion(diag, C.IU_MisCompras, C.CE_Venta, "compras del cliente", "Association", "", "mis compras", "venta", "0..*", "1");
        conEnDiagrama += relacion(diag, C.IU_Api, C.IU_VisorPdf, "arma la descarga", "Dependency", "uses", "cliente", "visor", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_Api, C.CTR_ComprobanteVentaController, "punto de acceso de ventas", "Dependency", "uses", "cliente", "ventas", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_Api, C.CTR_ComprobantesController, "punto de acceso del PDF", "Dependency", "uses", "cliente", "comprobantes", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_VisorPdf, C.CE_Comprobante, "archivo que descarga", "Dependency", "uses", "visor", "comprobante", "1", "1");

        conEnDiagrama += relacion(diag, C.CTR_ComprobanteVentaController, C.SRV_JwtAuthGuard, "guard de clase", "Dependency", "uses", "ventas", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ComprobanteVentaController, C.SRV_UsuarioActual, "usuario resuelto", "Dependency", "uses", "ventas", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ComprobanteVentaController, C.SRV_ComprobantesService, "servicio de comprobantes", "Association", "", "ventas", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ComprobanteVentaController, C.CE_Comprobante, "comprobante emitido o reuse", "Association", "", "ventas", "comprobante", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CTR_ComprobanteVentaController, C.CE_Venta, "venta consultada", "Association", "", "ventas", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ComprobantesController, C.SRV_JwtAuthGuard, "guard de clase", "Dependency", "uses", "comprobantes", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ComprobantesController, C.SRV_UsuarioActual, "usuario resuelto", "Dependency", "uses", "comprobantes", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ComprobantesController, C.SRV_ComprobantesService, "servicio de comprobantes", "Association", "", "comprobantes", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ComprobantesController, C.CE_Comprobante, "archivo servido", "Dependency", "uses", "comprobantes", "comprobante", "1", "1");

        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.SRV_StorageLocal, "guarda el PDF", "Dependency", "uses", "comprobantes", "storage", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.SRV_BitacoraService, "auditoria y fuente del NIT", "Association", "", "comprobantes", "auditor", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.SRV_DataSource, "consultas", "Dependency", "uses", "comprobantes", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Usuario, "usuario que consulta", "Association", "", "comprobantes", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Rol, "permiso de consulta", "Dependency", "uses", "comprobantes", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_UsuarioRol, "asignacion de rol", "Dependency", "uses", "comprobantes", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Cliente, "dueño de la venta", "Dependency", "uses", "comprobantes", "cliente", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Venta, "venta que se factura", "Association", "", "comprobantes", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_VentaItem, "detalle que se imprime", "Dependency", "uses", "comprobantes", "item de venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Comprobante, "comprobante emitido", "Composition", "composition", "comprobantes", "comprobante", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Producto, "lee porcentaje_iva: no existe", "Dependency", "uses", "comprobantes", "producto", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_ProductoTallaColor, "prenda del detalle", "Dependency", "uses", "comprobantes", "prenda", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Sucursal, "sucursal del numero y del PDF", "Dependency", "uses", "comprobantes", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_UsuarioEmpleado, "nombre del cajero impreso", "Dependency", "uses", "comprobantes", "empleado", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_BitacoraAuditoria, "lee y escribe la bitacora", "Association", "", "comprobantes", "bitacora", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_StorageLocal, C.CE_Comprobante, "ruta del archivo", "Dependency", "uses", "storage", "comprobante", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_JwtAuthGuard, C.CE_Usuario, "usuario resuelto", "Association", "", "guard", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_BitacoraService, C.SRV_DataSource, "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_BitacoraService, C.CE_BitacoraAuditoria, "fila de bitacora", "Composition", "composition", "auditor", "bitacora", "1", "1");

        conEnDiagrama += relacion(diag, C.CE_Comprobante, C.CE_Venta, "venta facturada", "Association", "", "comprobante", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Sucursal, "sucursal de la venta", "Association", "", "venta", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Usuario, "usuario de la venta", "Association", "", "venta", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Cliente, "cliente de la venta", "Association", "", "venta", "cliente", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaItem, C.CE_Venta, "venta del item", "Composition", "composition", "item de venta", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaItem, C.CE_ProductoTallaColor, "prenda del item", "Association", "", "item de venta", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Producto, C.CE_ProductoTallaColor, "prendas del producto", "Composition", "composition", "producto", "prenda", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Talla, "talla", "Association", "", "prenda", "talla", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Color, "color", "Association", "", "prenda", "color", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Cliente, C.CE_Usuario, "usuario del cliente", "Association", "", "cliente", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_Rol, "roles del usuario", "Association", "", "usuario", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_UsuarioRol, "asignaciones", "Composition", "composition", "usuario", "asignacion", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_Rol, C.CE_UsuarioRol, "usuarios del rol", "Association", "", "rol", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_UsuarioEmpleado, C.CE_Usuario, "empleado", "Association", "", "empleado", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_UsuarioEmpleado, C.CE_Sucursal, "sucursal asignada", "Association", "", "empleado", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_BitacoraAuditoria, C.CE_Usuario, "usuario de la accion", "Association", "", "bitacora", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_BitacoraAuditoria, C.CE_Venta, "venta auditada", "Association", "", "bitacora", "venta", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_BitacoraAuditoria, C.CE_Comprobante, "comprobante auditado", "Association", "", "bitacora", "comprobante", "0..*", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("4 actores, " + DEF.length + " clases y " + TOTAL_REL + " relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (4), CTR_ controlador (2), SRV_ servicio (5), CE_ entidad o DTO (" + (DEF.length - 11) + ").");
        N.push("");
        N.push("HALLAZGO CRITICO 1: NO HAY S3. EL TERNARIO TIENE LAS DOS RAMAS IGUALES.");
        N.push("");
        N.push("  const DIR_COMPROBANTES = process.env.STORAGE_BACKEND === 's3' ? 'comprobantes' : 'comprobantes';");
        N.push("");
        N.push("Las dos ramas devuelven la misma cadena. O sea que la variable de entorno se lee, se");
        N.push("compara y se descarta, y el resultado es el mismo con o sin ella. El caso pide que");
        N.push("el almacenamiento sea local o S3 segun STORAGE_BACKEND, y lo unico que hay es un");
        N.push("local disfrazado de bifurcacion. Es el segundo almacenamiento de mentira del");
        N.push("proyecto, junto al pasarela de CU35, y los dos estan en el mismo patron: una");
        N.push("estructura que aparenta admitir dos opciones y solo admite una.");
        N.push("");
        N.push("Lo que hace de verdad guardarPdf es esto:");
        N.push("");
        N.push("  mkdirSync(join(process.cwd(), DIR_COMPROBANTES), { recursive: true });");
        N.push("  writeFileSync(join(process.cwd(), DIR_COMPROBANTES, `${numero}.pdf`), buffer);");
        N.push("  return `${DIR_COMPROBANTES}/${numero}.pdf`;");
        N.push("");
        N.push("O sea que escribe en el directorio de trabajo del proceso, con rutas relativas, y");
        N.push("devuelve una ruta relativa. Eso tiene tres consecuencias que el caso no dice. Una:");
        N.push("el PDF vive en el disco del servidor, asi que en mas de una instancia, o en un");
        N.push("contenedor, el comprobante emitido por una no lo encuentra la otra. Dos: no hay");
        N.push("respaldo ni versionado de esos archivos, y el backup de respaldos no los cubre. Y");
        N.push("tres, lo mas grave para un documento fiscal: el archivo es un efecto secundario y");
        N.push("la fila de comprobantes se puede commitear sin el, porque el INSERT y el UPDATE");
        N.push("del pdf_url son consultas sueltas, sin transaccion en todo el servicio.");
        N.push("");
        N.push("HALLAZGO CRITICO 2: LA NUMERACION CORRELATIVA NO ES CORRELATIVA. USA COUNT Y NO BLOQUEA.");
        N.push("");
        N.push("  SELECT COUNT(*)::int AS total");
        N.push("   FROM comprobantes c");
        N.push("   JOIN ventas v ON v.id_venta = c.id_venta");
        N.push("   WHERE v.id_sucursal = $1 AND EXTRACT(YEAR FROM c.fecha_emision) = $2");
        N.push("");
        N.push("  return `TM-${idSucursal}-${anio}-${String(total + 1).padStart(6, '0')}`;");
        N.push("");
        N.push("El correlativo se deduce contando filas existentes. No hay secuencia de Postgres, no");
        N.push("hay MAX(numero), no hay tabla de contadores y, sobre todo, no hay ningun bloqueo.");
        N.push("Dos ventas de la misma sucursal que se completen en el mismo instante cuentan las");
        N.push("mismo, producen el mismo numero, y la segunda se come el UNIQUE de numero VARCHAR(30).");
        N.push("");
        N.push("Y aqui el fallo es especialmente caro, porque el numero UNIQUE es lo unico que de");
        N.push("verdad protege la unicidad: comprobantes no tiene indice unico en id_venta, ni");
        N.push("indice ninguno. O sea que la numeracion tiene dos problemas encadenados. El del");
        N.push("numero se manifiesta en 23505 y el del id_venta es un TOCTOU silencioso, porque");
        N.push("datosComprobanteDeVenta no lleva LIMIT 1 y toma la primera fila si hay varias.");
        N.push("");
        N.push("Y el 23505 cae dentro de un catch generico que lo convierte en un 500 de fallo de");
        N.push("almacenamiento:");
        N.push("");
        N.push("  } catch {");
        N.push("    throw new InternalServerErrorException('No se pudo generar el comprobante. Intenta nuevamente.');");
        N.push("  }");
        N.push("");
        N.push("que es el texto de E6, el de fallo de storage. O sea que un choque de numeracion se");
        N.push("le comunica al cajero como si el disco hubiera fallado, que es el mensaje que lo");
        N.push("invita a reintentar, y reintentar es justo lo que no va a arreglar nada porque el");
        N.push("numero sigue ocupado. Y mientras tanto el pago ya esta hecho.");
        N.push("");
        N.push("La solucion es una secuencia de Postgres por sucursal y anio, o un indice unico");
        N.push("parcial sobre (id_venta) mas un MAX con FOR UPDATE. Con dos lineas de esquema.");
        N.push("");
        N.push("HALLAZGO CRITICO 3: UN GET QUE ESCRIBE. CONSULTAR UN COMPROBANTE LO EMITE.");
        N.push("");
        N.push("  @Get(':id/comprobante')");
        N.push("  consultarDeVenta(id, request, currentUser) {");
        N.push("    return this.comprobantesService.consultarDeVenta(currentUser, id, request);");
        N.push("  }");
        N.push("");
        N.push("  /** Consulta el comprobante de una venta (si no existe y la venta está completada, lo emite). */");
        N.push("  async consultarDeVenta(usuario, idVenta, request) {");
        N.push("    await this.exigirPermisoConsulta(usuario, idVenta);");
        N.push("    return this.generar(idVenta, usuario.id_usuario, request);");
        N.push("  }");
        N.push("");
        N.push("Un GET con efectos: inserta en comprobantes, escribe un archivo en disco y anade");
        N.push("una fila en la bitacora. El propio comentario del autor lo dice y lo asume. Eso");
        N.push("tiene tres efectos esperando: los indices de los navegadores y de los proxies");
        N.push("pueden disparar emisiones solas; un Cliente que solo mira su compra emite el");
        N.push("comprobante de esa venta, y queda con la fecha y el usuario de el en la bitacora");
        N.push("en lugar de los del cajero; y un reintento del navegador, un F5, vuelve a llamar");
        N.push("generar, que aqui si es idempotente, o sea que en ese punto concreto no rompe");
        N.push("nada, pero depende de que la idempotencia se sostenga solo en el codigo.");
        N.push("");
        N.push("La razon por la que se permitio, y es una buena: CU35 y CU37 llaman a generar fuera");
        N.push("de su transaccion, y si falla, la unica forma de recuperarlo sin intervention es");
        N.push("volver a pedir el comprobante. Un GET que repara es comodo. Lo que no deberia es que");
        N.push("sea el unico mecanismo de consulta, porque entonces consultar crea.");
        N.push("");
        N.push("HALLAZGO CRITICO 4: LA COLUMNA QUE NO EXISTE TAMBIEN ESTA AQUI. Y ROMPE EL PDF ENTERO.");
        N.push("");
        N.push("  SELECT v.id_venta, ..., p.porcentaje_iva");
        N.push("   FROM ventas v ... GROUP BY v.id_venta, p.porcentaje_iva LIMIT 1");
        N.push("");
        N.push("Es la misma columna de CU34, CU35, CU36 y CU37, y aqui tiene un efecto peor que en");
        N.push("los demas sitios, porque generar es la ultima operacion del pago. La secuencia es:");
        N.push("");
        N.push("  1. El pago se aprueba y la venta queda Completada.");
        N.push("  2. Se descuenta el inventario.");
        N.push("  3. generar revienta con 42703 al leer porcentaje_iva.");
        N.push("  4. El webhook o el cobro de caja devuelven 500.");
        N.push("  5. No hay comprobante, y el cliente ya pago y ya se le descconto la prenda.");
        N.push("");
        N.push("O sea que este es el punto donde la columna inexistente deja de ser un error de una");
        N.push("pantalla y pasa a ser perdida de dinero, porque es el unico momento en que se");
        N.push("podria recuperar algo. Todo lo anterior a esta llamada esta committed.");
        N.push("");
        N.push("Y el PDF tiene un 13 fijo como respaldo:");
        N.push("");
        N.push("  doc.text(`Impuestos (IVA ${Number(venta.porcentaje_iva ?? 13)}%): Bs ...`);");
        N.push("");
        N.push("que es el mismo 13 por ciento que aparece en SRV_ProductosService, en");
        N.push("SRV_CatalogosService y en el Checkout. O sea que la tasa esta escrita cuatro");
        N.push("veces en el proyecto, y en ningun sitio hay una columna donde viva. Ademas el");
        N.push("GROUP BY p.porcentaje_iva mas LIMIT 1, si la columna existiera, elegiria una tasa");
        N.push("arbitraria cuando las prendas tuvieran tasas distintas, y el PDF imprimiria esa.");
        N.push("");
        N.push("HALLAZGO 5: EL NIT SE RECUPERA DE LA BITACORA. CUARTA VEZ.");
        N.push("");
        N.push("  SELECT new_data->>'nit_cliente' AS nit_cliente, new_data->>'razon_social' AS razon_social");
        N.push("   FROM bitacora_auditoria");
        N.push("   WHERE tabla_afectada = 'ventas' AND id_registro = $1 AND accion_sql = 'INSERT'");
        N.push("   ORDER BY id_bitacora DESC LIMIT 1");
        N.push("");
        N.push("  const tipo = nitCliente && razonSocial ? 'FACTURA' : 'BOLETA';");
        N.push("");
        N.push("Y de ahi sale el tipo de documento fiscal. O sea que la decision entre factura y");
        N.push("boleta, que es un problema fiscal, se toma leyendo el JSON de un registro de");
        N.push("auditoria. Las cuatro cosas que ya se dijeron en CU34 siguen valiendo y se");
        N.push("repite aqui con una consecuencia nueva: si la bitacora de CU34 o CU36 no se");
        N.push("escribio, el comprobante sale como BOLETA para un cliente que dio su NIT, sin");
        N.push("error y sin aviso. Y como el NIT no esta en ventas ni en comprobantes hasta que");
        N.push("este los copia, no hay ninguna otra fuente.");
        N.push("");
        N.push("Y el caso dice que el tipo es Factura o Boleta. El codigo escribe FACTURA y BOLETA,");
        N.push("en mayusculas, en la misma columna donde el procedimiento muerto sp_registrar_venta");
        N.push("escribe Factura en mayuscula inicial. Tres convenciones para el mismo campo.");
        N.push("");
        N.push("HALLAZGO 6: EL CLIENTE PASA POR PROPIETARIO, NO POR PERMISO. Y ESO ES LO UNICO QUE LE SIRVE.");
        N.push("");
        N.push("  private async exigirPermisoConsulta(usuario: Usuario, idVenta: number) {");
        N.push("    const permisos = await this.cargarPermisos(usuario);");
        N.push("    if (permisos.includes('*') || permisos.includes('realizar_venta')) return;");
        N.push("    if (await this.esDuenoVenta(usuario, idVenta)) return;");
        N.push("    throw new ForbiddenException('No tienes permisos para consultar comprobantes.');");
        N.push("  }");
        N.push("");
        N.push("  private async esDuenoVenta(usuario: Usuario, idVenta: number): Promise<boolean> {");
        N.push("    `SELECT v.id_venta FROM ventas v");
        N.push("     JOIN clientes c ON c.id_cliente = v.id_cliente");
        N.push("     WHERE v.id_venta = $1 AND c.usuario_id = $2`");
        N.push("  }");
        N.push("");
        N.push("La primera rama, la del permiso, no le sirve a nadie que no sea el Administrador,");
        N.push("porque realizar_venta sigue sin existir. La segunda, la de propietario, es la que");
        N.push("de verdad deja ver el comprobante a un Cliente. O sea que el permiso roto, que en");
        N.push("CU35 cerraba el sandbox por accidente, aqui abre por accidente la consulta del");
        N.push("Cliente. El mismo defecto haciendo el efecto contrario en dos casos.");
        N.push("");
        N.push("Y hay una consecuencia: la propiedad se demuestra con un JOIN a clientes, o sea");
        N.push("contra clientes.usuario_id. Para una venta de POS con id_cliente NULL, o para una");
        N.push("venta de Consumidor Final, no hay dueno y el unico que puede verla es quien tenga");
        N.push("el permiso, o sea el Administrador. Y un Cliente que compro en la caja no puede");
        N.push("descargar su comprobante desde Mis Compras, porque esa consulta tambien filtra");
        N.push("por id_cliente y no devuelve nada. El caso no distingue entre compra digital y");
        N.push("compra en caja, y en el codigo solo la digital llega al Cliente.");
        N.push("");
        N.push("HALLAZGO 7: E7 SI EXISTE, Y HAY UN RESPALDO QUE OCULTA EL PDF PERDIDO.");
        N.push("");
        N.push("  const ruta = pdfUrl");
        N.push("    ? join(process.cwd(), pdfUrl)");
        N.push("    : join(process.cwd(), DIR_COMPROBANTES, `${comprobante.numero}.pdf`);");
        N.push("  if (!existsSync(ruta)) {");
        N.push("    throw new NotFoundException('El comprobante no tiene archivo disponible.');");
        N.push("  }");
        N.push("");
        N.push("E7 es real, y hay un segundo camino: si pdf_url esta vacio, reconstruye la ruta a");
        N.push("partir del numero. O sea que un INSERT que se quedo a medias, sin su UPDATE de");
        N.push("pdf_url, todavia se puede descargar. Es una buena defensa, y hace el defecto del");
        N.push("INSERT y el UPDATE sin transaccion mucho menos grave de lo que parece.");
        N.push("");
        N.push("Lo que si es una superficie de ataque es que la ruta sale de una columna de la base:");
        N.push("join(process.cwd(), pdfUrl). Hoy el valor lo escribe el propio servicio con un");
        N.push("numero que sale de una funcion interna, asi que no es explotable. Pero si alguien");
        N.push("con acceso a la base, o una futura migracion, dejara un pdf_url con .., la ruta se");
        N.push("sale del directorio de comprobantes. Bastaria con validar que el numero no tenga");
        N.push("guiones ni barras antes de componer el path, que es el mismo cuidado que haria");
        N.push("falta en el nombre de archivo.");
        N.push("");
        N.push("HALLAZGO 8: EL PDF IMPRIME EL CAJERO DE LA VENTA, NO EL DEL COBRO.");
        N.push("");
        N.push("  SELECT nombre FROM usuarios_empleados WHERE usuario_id = $1 LIMIT 1");
        N.push("  // con el valor de ventas.id_usuario, no del de la transaccion");
        N.push("");
        N.push("El nombre sale de ventas.id_usuario, o sea de quien creo la venta. Para un pago");
        N.push("en efectivo eso coincide con quien cobra, pero un cajero puede cobrar la venta");
        N.push("de otro cajero de la misma sucursal, porque el filtro es por sucursal y no por");
        N.push("usuario. El comprobante llevara el nombre del primero, no el del segundo, y es el");
        N.push("documento que el cliente se lleva. Para una compra digital, ventas.id_usuario es");
        N.push("el Cliente, que no tiene fila en usuarios_empleados, o sea que el PDF imprime");
        N.push("Cajero: - y el campo cajero se esta llenando con una tabla de empleados para un");
        N.push("cliente.");
        N.push("");
        N.push("Y el SELECT no filtra fecha_baja, que es la tercera copia del mismo descuido.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - El PDF no tiene control de paginacion. El bucle de items escribe una linea por");
        N.push("    prenda sin comprobar el alto disponible, asi que una venta larga se sale de la");
        N.push("    pagina o corta el documento sin avisar. Y con PDFKit eso significa un PDF");
        N.push("    corrupto, no una segunda hoja: el cliente recibe un archivo que no abre.");
        N.push("  - La tabla del PDF se arma con padEnd y padStart sobre cadenas, con el nombre");
        N.push("    recortado a 40 caracteres. La cabecera usa padEnd(42) y las filas padEnd(40),");
        N.push("    o sea que el titulo y los datos no alinean. Es cosmético pero se ve en el");
        N.push("    documento que recibe el cliente.");
        N.push("  - El nombre de la empresa y el es-lo-BO estan fijos en el codigo, con la razon");
        N.push("    social como Tiendas Montaño. Correcto para el caso, pero significa que el PDF");
        N.push("    no se puede adaptar a otra tienda sin tocar el codigo.");
        N.push("  - El anio del correlativo es new Date().getFullYear(), o sea el reloj del");
        N.push("    servidor y no el de la venta. Una venta de diciembre cobrada en enero numero");
        N.push("    con el anio nuevo, que es lo habitual, pero conviene saberlo.");
        N.push("  - El frontend descarga por blob y renombra el archivo a comprobante-<id>.pdf, no");
        N.push("    a TM-<sucursal>-<anio>-<NNNNNN>.pdf. El Content-Disposition que pone el");
        N.push("    controlador no se usa, porque el blob se guarda con el nombre que decide el");
        N.push("    cliente. O sea que el comprobante llega al Cliente con un nombre que no es el");
        N.push("    numero del documento, en un documento fiscal.");
        N.push("  - comprasDelCliente lanza 404 Ventas no encontradas. cuando el usuario no tiene");
        N.push("    fila en clientes. Para un listado lo natural seria una lista vacia, y es la");
        N.push("    tercera vez que la falta de cliente se traduce en un error en vez de en un");
        N.push("    caso valido, con CU34 y con el mismo esDuenoVenta.");
        N.push("  - El servicio entero no usa transaccion ni una vez, en 358 lineas. El caso no lo");
        N.push("    pide, pero es el unico modulo de la parte de ventas que no la usa, y es el que");
        N.push("    mas writes de cara al usuario hace.");
        N.push("  - Hay dos controladores en el mismo archivo de 45 lineas, ComprobanteVentaController");
        N.push("    y ComprobantesController. Funciona, y el orden de las rutas es seguro por suerte:");
        N.push("    :id/comprobante y mias/compras se diferencian en el segundo segmento. Si el");
        N.push("    literal hubiera sido mias/comprobante, el parametro se habria comido la ruta.");
        N.push("  - El frontend si cumple lo que el caso pide: hay Imprimir y Descargar PDF, que");
        N.push("    llaman a consultarComprobanteVenta y luego al endpoint del PDF, y hay Mis");
        N.push("    Compras en la ruta /compras. Es la parte de la especificacion que acierta.");
        N.push("  - Los dos controladores usan UseGuards a nivel de clase, no por handler. Es la");
        N.push("    unica vez que el guard se pone asi en el proyecto, y es lo correcto.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU38 - EMITIR COMPROBANTE DE VENTA - INFORME");
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
    msg = msg + "CU38 - Emitir comprobante de venta" + SALTO + SALTO;
    msg = msg + "No hay S3: el ternario del storage tiene las dos" + SALTO;
    msg = msg + "ramas iguales. El PDF va al disco del servidor." + SALTO + SALTO;
    msg = msg + "El correlativo usa COUNT(*) sin bloqueo: dos ventas" + SALTO;
    msg = msg + "en el mismo instante chocan en el UNIQUE de numero." + SALTO + SALTO;
    msg = msg + "Un GET emite el comprobante: consultar crea." + SALTO;
    msg = msg + "Clases: " + DEF.length + "    Actores: 4    Relaciones: " + TOTAL_REL + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de " + TOTAL_ATR + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de " + TOTAL_OPE + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de " + TOTAL_REL + SALTO;
    if (conEnDiagrama < TOTAL_REL) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "El NIT y el tipo FACTORA/BOLETA salen de la bitacora." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU38 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU38 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU38", 0); } catch (e3) { }
}
