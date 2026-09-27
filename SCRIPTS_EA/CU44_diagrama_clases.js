// ================================================================
// CU44 - DASHBOARD INTELIGENTE Y KPIS
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   NO EXISTE el modulo dashboard: cero apariciones de dashboard, Dashboard
//   u obtenerKpis en los 82 archivos TypeScript del backend.
//   NO EXISTE la pagina AdminDashboard ni la ruta /admin/dashboard.
//   NO EXISTE la entrada de menu para este caso.
//   web/src/package.json    6 dependencias y NINGUNA de graficos
//   web/src/router.tsx:84   el asterisco cae en AdminPlaceholder
//   web/src/pages/admin/AdminPlaceholder.tsx   renderiza EnConstruccion
//   web/src/components/layout/admin/AdminLayout.tsx:23  filtra el menu, no la ruta
//   web/src/data/adminMenu.ts:249                   el unico consultar_reportes
//   api/src/modulos/inventario/CTR_Existencias.ts:6   admin/inventario/existencias
//   api/src/modulos/inventario/CTR_Alertas.ts:46       admin/inventario/alertas
//   api/src/modulos/inventario/SRV_ExistenciasService.ts:111  sin alcance por sucursal
//   api/src/modulos/inventario/SRV_AlertasService.ts:206      dos umbrales distintos
//   api/src/modulos/reservas/SRV_ReservasService.ts:502,751  cinco estados
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:131  el patron de consultar_reportes
//   api/src/modulos/reportes-voz/SRV_ReportesVozService.ts:141  generar reporte sin filtro de sucursal
//   schema.sql:0    CERO ALTER TABLE; no hay migracion para lo que falta
//   schema.sql:384  ventas.fecha_venta (CU43 usa v.fecha y por eso falla)
//   schema.sql:455  ordenes_compra.estado no tiene ningun estado En transito
//   NO hay date_trunc, ticket_promedio, topProductos ni ventas_por_mes en el proyecto
//   NO hay ningun CSV con BOM en todo el repositorio
//
// Sin estereotipo: el rol va en el nombre IU_ / CTR_ / SRV_ / CE_.
// Diagrama estatico: sin mensajes, sin lineas de vida, sin secuencia.
// Este caso no tiene implementacion: el diagrama muestra lo que hay y lo que
// el caso necesita leer, no clases inventadas.
// Autorreparable. Una instruccion por linea. Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================

var ALTO = 14;
var SALTO = String.fromCharCode(10);
var VIS_PUB = 0;
var VIS_PRI = 1;
var RAIZ = Repository.Models.GetAt(0);
var TOTAL_REL = 56;
var TOTAL_ATR = 100;
var TOTAL_OPE = 25;

var DEF = [
    ["IU_AdminLayout", "EXISTE. components/layout/admin/AdminLayout.tsx", "el contenedor: filtra el menu por permiso pero no la ruta",
     [["usuario", "Object", VIS_PUB], ["permisos", "Array", VIS_PUB], ["paquetesVisibles", "Array", VIS_PUB]],
     [["permitido", "Boolean", ["item"], VIS_PUB], ["puedeInventario", "Boolean", [], VIS_PUB], ["puedeReservas", "Boolean", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_AdminPlaceholder", "EXISTE. pages/admin/AdminPlaceholder.tsx", "lo que se ve HOY en /admin/dashboard: En construccion",
     [["pathname", "String", VIS_PUB]],
     [["resolverEtiqueta", "String", ["pathname"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_AdminMenu", "EXISTE. data/adminMenu.ts, 16 permisos declarados", "solo 4 de esos 16 existen en la semilla",
     [["paquetes", "Array", VIS_PUB]],
     [["visibles", "Array", ["permisos"], VIS_PUB]]],

    ["CTR_ExistenciasController", "EXISTE. inventario/CTR_Existencias.ts:6", "admin/inventario/existencias, dos GET",
     [["existenciasService", "ExistenciasService", VIS_PRI]],
     [["opciones", "Object", [], VIS_PUB], ["consultar", "Array", ["usuario", "filtros"], VIS_PUB]]],

    ["CTR_AlertasController", "EXISTE. inventario/CTR_Alertas.ts:46", "admin/inventario/alertas, dos GET",
     [["alertasService", "AlertasService", VIS_PRI]],
     [["opciones", "Object", [], VIS_PUB], ["listar", "Array", ["usuario"], VIS_PUB]]],

    ["CTR_ReportesVoz", "EXISTE. reportes-voz/CTR_ReportesVoz.ts:8", "el unico endpoint con consultar_reportes",
     [["reportesVozService", "ReportesVozService", VIS_PRI]],
     [["procesar", "Object", ["currentUser", "dto"], VIS_PUB]]],

    ["SRV_ExistenciasService", "EXISTE. inventario/SRV_ExistenciasService.ts, CU26", "consolida existencias SIN alcance por sucursal",
     [["dataSource", "DataSource", VIS_PRI], ["logger", "Logger", VIS_PRI]],
     [["consultar", "Array", ["usuario", "filtros"], VIS_PUB]]],

    ["SRV_AlertasService", "EXISTE. inventario/SRV_AlertasService.ts, CU25", "alerta por disponible contra stock_minimo_alert",
     [["dataSource", "DataSource", VIS_PRI], ["logger", "Logger", VIS_PRI]],
     [["listar", "Array", ["usuario"], VIS_PUB], ["configurarMinimo", "Object", ["usuario", "idStock", "stockMinimo", "request"], VIS_PUB]]],

    ["SRV_ReservasService", "EXISTE. reservas/SRV_ReservasService.ts, CU28 a CU31", "los cinco estados que contaria el KPI",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI], ["logger", "Logger", VIS_PRI]],
     [["listar", "Array", ["usuario", "filtros"], VIS_PUB], ["crearReserva", "Object", ["usuario", "dto", "request"], VIS_PUB], ["prepararReserva", "Object", ["usuario", "idReserva", "request"], VIS_PUB], ["cancelar", "Object", ["usuario", "id", "request"], VIS_PUB]]],

    ["SRV_ReportesVozService", "EXISTE. reportes-voz/SRV_ReportesVozService.ts, CU43", "el patron a copiar: permiso y transaction",
     [["dataSource", "DataSource", VIS_PRI], ["logger", "Logger", VIS_PRI]],
     [["procesar", "Object", ["usuario", "dto"], VIS_PUB], ["exigirPermisoReportes", "void", ["usuario"], VIS_PRI], ["registrarReporte", "Integer", ["usuario", "intencion", "url"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "EXISTE. seguridad/dependencias.ts", "el guard que usaria el endpoint del dashboard",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB]]],

    ["SRV_UsuarioActual", "EXISTE. seguridad/dependencias.ts", "inyecta el Usuario para leer sus permisos",
     [],
     [["UsuarioActual", "Usuario", ["datos", "contexto"], VIS_PUB]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "las agregaciones serian consultas de solo lectura",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB]]],

    ["CE_Usuario", "EXISTE. usuarios (schema.sql:32)", "el que consulta; sus permisos salen de permisos_json",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120 UNIQUE", VIS_PRI], ["estado", "String = Pendiente", VIS_PUB]],
     []],

    ["CE_Rol", "EXISTE. roles; permisos_json en schema.sql:573", "consultar_reportes NO esta en ninguno de los 5 roles",
     [["id_rol", "Integer = PK", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["descripcion", "String", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "EXISTE. usuarios_roles con PK compuesta", "la consulta del permiso se queda con la PRIMERA fila",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_Sucursal", "EXISTE. sucursales", "el filtro del dashboard: Todas, o una concreta",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_Venta", "EXISTE. ventas (schema.sql:384)", "ventas_totales y ticket_promedio salen de aqui",
     [["id_venta", "Integer = PK", VIS_PRI], ["id_cliente", "Integer = nullable", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["id_carrito", "Integer = nullable", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB], ["impuestos", "Decimal(12,2)", VIS_PUB], ["total", "Decimal(12,2)", VIS_PUB], ["estado", "String = 20, se filtra Completada", VIS_PUB], ["fecha_venta", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_VentaItem", "EXISTE. venta_items (schema.sql:399)", "top_productos: SUM(cantidad) agrupado",
     [["id_venta_item", "Integer = PK", VIS_PRI], ["id_venta", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["precio_unitario", "Decimal(10,2)", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB]],
     []],

    ["CE_Cliente", "EXISTE. clientes (schema.sql:87)", "no hace falta para ningun KPI del caso",
     [["id_cliente", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE, nullable", VIS_PUB], ["nombre", "String = 150", VIS_PUB]],
     []],

    ["CE_Reserva", "EXISTE. reservas (schema.sql:301)", "reservasPorEstado: cinco valores, sin CHECK",
     [["id_reserva", "Integer = PK", VIS_PRI], ["id_cliente", "Integer", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["fecha_reserva", "Date", VIS_PUB], ["hora_reserva", "Time", VIS_PUB], ["estado", "String = 20, Solicitada", VIS_PUB], ["id_encargado", "Integer = nullable", VIS_PUB], ["fecha_creacion", "Timestamp = NOW()", VIS_PUB], ["fecha_preparada", "Timestamp = nullable", VIS_PUB], ["fecha_atendida", "Timestamp = nullable", VIS_PUB]],
     []],

    ["CE_ReservaItem", "EXISTE. reserva_items (schema.sql:314)", "no la necesita ningun KPI del caso",
     [["id_reserva_item", "Integer = PK", VIS_PRI], ["id_reserva", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer = 1", VIS_PUB]],
     []],

    ["CE_InventarioStock", "EXISTE. inventario_stock (schema.sql:302)", "existencias consolidadas y alertas de stock bajo",
     [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer = UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer = UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_reservada", "Integer = 0", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB], ["stock_minimo_alert", "Integer = 0", VIS_PUB]],
     []],

    ["CE_Producto", "EXISTE. productos (schema.sql:223)", "top_productos necesita nombre y categoria",
     [["id_producto", "Integer = PK", VIS_PRI], ["codigo", "String = 40 UNIQUE", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["id_categoria", "Integer", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. producto_talla_color (schema.sql:237)", "el punto de union entre ventas y stock",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB], ["estado_stock", "String = Disponible, nadie lo actualiza", VIS_PUB]],
     []],

    ["CE_Categoria", "EXISTE. categorias (schema.sql:179)", "el caso pide la categoria en el top de productos",
     [["id_categoria", "Integer = PK", VIS_PRI], ["nombre", "String = 80 UNIQUE", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_OrdenCompra", "EXISTE. ordenes_compra (schema.sql:196)", "NO tiene ningun estado En transito",
     [["id_orden_compra", "Integer = PK", VIS_PRI], ["id_proveedor", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["numero", "String = 20", VIS_PUB], ["fecha_orden", "Timestamp = NOW()", VIS_PUB], ["fecha_estimada_entrega", "Date", VIS_PUB], ["fecha_recepcion", "Timestamp = nullable", VIS_PUB], ["estado", "String = 20, Pendiente", VIS_PUB], ["total", "Decimal(12,2)", VIS_PUB]],
     []],

    ["CE_OrdenCompraItem", "EXISTE. orden_compra_items (schema.sql:207)", "de aqui saldría proximas_a_ingresar",
     [["id_orden_item", "Integer = PK", VIS_PRI], ["id_orden_compra", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer NOT NULL", VIS_PUB], ["precio_unitario", "Decimal(10,2)", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Administrador", "Administrador, unico con el permiso", "wildcard *"],
    ["ACTOR_Encargado", "Encargado. OJO: da 403", "no tiene consultar_reportes"],
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
    var paq = subPaquete(mod, "CU44 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU44 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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

        conEnDiagrama += relacion(diag, actores[0], C.IU_AdminLayout, "abre el panel de administracion", "Association", "", "administrador", "panel", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C.IU_AdminPlaceholder, "acaba en En construccion", "Association", "", "administrador", "placeholder", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C.IU_AdminPlaceholder, "ve lo mismo que el admin", "Association", "", "encargado", "placeholder", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[2], C.IU_AdminPlaceholder, "ve lo mismo que el admin", "Association", "", "cajero", "placeholder", "1", "0..1");

        conEnDiagrama += relacion(diag, C.IU_AdminLayout, C.IU_AdminMenu, "filtra el menu", "Dependency", "uses", "panel", "menu", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminLayout, C.IU_AdminPlaceholder, "el asterisco cae aqui", "Dependency", "uses", "panel", "placeholder", "0..*", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminLayout, C.CE_Usuario, "usuario con sus permisos", "Association", "", "panel", "usuario", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_AdminLayout, C.CE_Rol, "permiso de cada entrada", "Dependency", "uses", "panel", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminMenu, C.CE_Rol, "dieciseis permisos declarados", "Dependency", "uses", "menu", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminPlaceholder, C.IU_AdminMenu, "busca la etiqueta", "Dependency", "uses", "placeholder", "menu", "1", "1");

        conEnDiagrama += relacion(diag, C.CTR_ExistenciasController, C.SRV_ExistenciasService, "servicio de existencias", "Association", "", "existencias", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ExistenciasController, C.SRV_JwtAuthGuard, "guard", "Dependency", "uses", "existencias", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ExistenciasController, C.SRV_UsuarioActual, "usuario", "Dependency", "uses", "existencias", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_AlertasController, C.SRV_AlertasService, "servicio de alertas", "Association", "", "alertas", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_AlertasController, C.SRV_JwtAuthGuard, "guard", "Dependency", "uses", "alertas", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_AlertasController, C.SRV_UsuarioActual, "usuario", "Dependency", "uses", "alertas", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ReportesVoz, C.SRV_ReportesVozService, "servicio de voz", "Association", "", "voz", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ReportesVoz, C.SRV_JwtAuthGuard, "guard con consultar_reportes", "Dependency", "uses", "voz", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ReportesVoz, C.CE_Rol, "el unico consultar_reportes", "Dependency", "uses", "voz", "rol", "0..*", "1");

        conEnDiagrama += relacion(diag, C.SRV_ExistenciasService, C.SRV_DataSource, "consolida existencias", "Dependency", "uses", "existencias", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ExistenciasService, C.CE_InventarioStock, "suma las tres cantidades", "Dependency", "uses", "existencias", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ExistenciasService, C.CE_ProductoTallaColor, "variante del stock", "Dependency", "uses", "existencias", "prenda", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ExistenciasService, C.CE_Usuario, "usuario, que no filtra nada", "Association", "", "existencias", "usuario", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_AlertasService, C.SRV_DataSource, "consulta de alertas", "Dependency", "uses", "alertas", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_AlertasService, C.CE_InventarioStock, "compara disponible y minimo", "Dependency", "uses", "alertas", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_AlertasService, C.CE_Usuario, "usuario, para el alcance por sucursal", "Dependency", "uses", "alertas", "usuario", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReservasService, C.SRV_DataSource, "consulta de reservas", "Dependency", "uses", "reservas", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReservasService, C.CE_Reserva, "los cinco estados", "Composition", "composition", "reservas", "reserva", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReservasService, C.CE_ReservaItem, "prendas de la reserva", "Composition", "composition", "reservas", "item de reserva", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReservasService, C.CE_Usuario, "usuario de la reserva", "Association", "", "reservas", "usuario", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.SRV_DataSource, "agrega y registra", "Dependency", "uses", "voz", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_Usuario, "autor del reporte", "Association", "", "voz", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReportesVozService, C.CE_Rol, "permiso de reportes", "Dependency", "uses", "voz", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_JwtAuthGuard, C.CE_Usuario, "usuario resuelto", "Association", "", "guard", "usuario", "0..1", "1");

        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_Rol, "roles del usuario", "Association", "", "usuario", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_UsuarioRol, "asignaciones", "Composition", "composition", "usuario", "asignacion", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_Rol, C.CE_UsuarioRol, "usuarios del rol", "Association", "", "rol", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Sucursal, "sucursal de la venta", "Association", "", "venta", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Usuario, "usuario de la venta", "Association", "", "venta", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Cliente, "cliente de la venta", "Association", "", "venta", "cliente", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaItem, C.CE_Venta, "venta del item", "Composition", "composition", "item de venta", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaItem, C.CE_ProductoTallaColor, "prenda vendida", "Association", "", "item de venta", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Reserva, C.CE_Sucursal, "sucursal de la reserva", "Association", "", "reserva", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Reserva, C.CE_Usuario, "usuario de la reserva", "Association", "", "reserva", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Reserva, C.CE_Cliente, "cliente de la reserva", "Association", "", "reserva", "cliente", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_ReservaItem, C.CE_Reserva, "reserva del item", "Composition", "composition", "item de reserva", "reserva", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_ReservaItem, C.CE_ProductoTallaColor, "prenda reservada", "Association", "", "item de reserva", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_InventarioStock, C.CE_ProductoTallaColor, "stock por prenda", "Association", "", "stock", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_InventarioStock, C.CE_Sucursal, "stock por sucursal", "Association", "", "stock", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Producto, C.CE_Categoria, "categoria del producto", "Association", "", "producto", "categoria", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Producto, C.CE_ProductoTallaColor, "prendas del producto", "Composition", "composition", "producto", "prenda", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Categoria, "categoria heredada", "Dependency", "uses", "prenda", "categoria", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_OrdenCompra, C.CE_Sucursal, "sucursal de la orden", "Association", "", "orden", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_OrdenCompra, C.CE_Usuario, "no hay id_usuario en la orden", "Dependency", "uses", "orden", "usuario", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_OrdenCompraItem, C.CE_OrdenCompra, "orden del item", "Composition", "composition", "item de orden", "orden", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_OrdenCompraItem, C.CE_ProductoTallaColor, "prenda que entra", "Association", "", "item de orden", "prenda", "1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("ATENCION: este caso no tiene implementacion. Las clases del diagrama son las que");
        N.push("existen y que el caso necesitaria leer, no las que el caso propone.");
        N.push("");
        N.push("3 actores, " + DEF.length + " clases y " + TOTAL_REL + " relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (3), CTR_ controlador (3), SRV_ servicio (7), CE_ entidad (" + (DEF.length - 13) + ").");
        N.push("");
        N.push("HALLAZGO CRITICO 1: NO HAY NADA DE ESTE CASO. NI UNA LINEA.");
        N.push("");
        N.push("A diferencia de CU39, donde InventarioService no existia pero la logica si estaba");
        N.push("escrita, repartida entre el trigger y dos copias del servicio de pagos, aqui no hay");
        N.push("ni una pieza empezada. Lo que se comprobo:");
        N.push("");
        N.push("  - Cero apariciones de dashboard, Dashboard u obtenerKpis en los 82 archivos");
        N.push("    TypeScript del backend. Ni un servicio, ni un controlador, ni un DTO, ni un");
        N.push("    comentario que lo mencione.");
        N.push("  - No hay modulo dashboard entre los quince modulos del backend.");
        N.push("  - No hay pagina de dashboard en el frontend. Lo unico que dice dashboard en todo");
        N.push("    web/src es LayoutDashboard, que es un icono de lucide-react importado en el");
        N.push("    Navbar, y no es una ruta ni una pantalla.");
        N.push("  - No hay ruta /admin/dashboard. Las rutas admin estan todas en router.tsx:65-84 y la");
        N.push("    ultima es el asterisco, que cae en AdminPlaceholder.");
        N.push("  - No hay entrada de menu. El grupo Reportes e Inteligencia tiene un solo item, el");
        N.push("    de CU43.");
        N.push("");
        N.push("O sea que el caso es, de todo el lote, el primero que no se puede ni siquiera");
        N.push("auditar contra una implementacion: no hay linea de codigo que leer. El diagrama se ha");
        N.push("hecho con lo que hay alrededor, que es lo unico que se puede documentar.");
        N.push("");
        N.push("HALLAZGO 2: LO QUE SE VE HOY EN /admin/dashboard ES En construccion, NO Acceso denegado.");
        N.push("");
        N.push("El caso dice que el acceso por URL directa muestra Acceso denegado. Lo que pasa de");
        N.push("verdad es esto:");
        N.push("");
        N.push("  router.tsx:84   <Route path=\"*\" element={<AdminPlaceholder />} />");
        N.push("");
        N.push("  AdminPlaceholder.tsx");
        N.push("    let etiqueta = 'Módulo de administración';");
        N.push("    for (const paquete of PAQUETES_ADMIN) {");
        N.push("      const item = paquete.items.find((i) => i.ruta === pathname);");
        N.push("      if (item) { etiqueta = item.etiqueta; break; }");
        N.push("    }");
        N.push("    return <EnConstruccion titulo={etiqueta} ... />");
        N.push("");
        N.push("El componente busca la etiqueta en el menu, no la encuentra porque el dashboard no");
        N.push("esta dado de alta, y cae en el texto generico. O sea que la pantalla que aparece es");
        N.push("En construccion, con el titulo Módulo de administración, y la comprueba de permiso no");
        N.push("llega a hacerse porque no hay nada que comprobar.");
        N.push("");
        N.push("Y AdminLayout, que es el contenedor, filtra el MENU por permiso:");
        N.push("");
        N.push("  const permitido = (item) => permisos.includes('*') || (item.permiso ? permisos.includes(item.permiso) : true);");
        N.push("  const paquetesVisibles = PAQUETES_ADMIN.filter((paquete) => paquete.items.some(permitido));");
        N.push("");
        N.push("pero no protege la ruta que se esta renderizando: solo el Outlet. O sea que el gate");
        N.push("de permisos del panel es de menu, no de acceso, y por eso el caso dice dos veces");
        N.push("acceso denegado para pantallas que en realidad muestran un placeholder. Vale para");
        N.push("este caso, y probablemente para todos los de administracion.");
        N.push("");
        N.push("HALLAZGO 3: LAS SEIS AGREGACIONES DEL CASO NO EXISTEN EN NINGUNA FORMA.");
        N.push("");
        N.push("El caso enumera ventas_totales, ticket_promedio, ventas_por_sucursal, ventas_por_mes,");
        N.push("top_productos, existencias_consolidadas, reservas por estado, alertas_stock_bajo y");
        N.push("proximas_a_ingresar. En todo el backend no hay ni un date_trunc, ni un");
        N.push("ticket_promedio, ni un topProductos, ni un ventas_por_mes. Las series de tiempo y el");
        N.push("ranking de productos no se calculan en ninguna parte, para nadie.");
        N.push("");
        N.push("Lo que si existe son tres de las piezas, en modulos que sirven otra cosa:");
        N.push("");
        N.push("  existencias_consolidadas   SRV_ExistenciasService.consultar, CU26");
        N.push("  alertas_stock_bajo         SRV_AlertasService.listar, CU25");
        N.push("  reservas por estado        el vocabulario de cinco estados de SRV_ReservasService");
        N.push("");
        N.push("Y ninguna se puede reutilizar tal cual, por una razon distinta cada una. Las");
        N.push("existencias de CU26 no tienen alcance por sucursal: el servicio no menciona ni");
        N.push("esAdministrador ni usuarios_empleados en ninguna de sus 259 lineas, o sea que sus");
        N.push("totales son globales para todo el mundo. Y el dashboard es justamente un filtro por");
        N.push("sucursal, con la opcion Todas. O sea que el caso dice reutiliza la logica de CU26 y");
        N.push("lo que hay que reutilizar no admite el filtro que el caso necesita.");
        N.push("");
        N.push("Las alertas de CU25 si son por sucursal, pero leen un umbral distinto del que el");
        N.push("caso quiere contar: el servicio alerta con inventario_stock.stock_minimo_alert, y");
        N.push("alertas_stock_config.stock_minimo es una segunda tabla que nunca se escribe. Si el");
        N.push("dashboard cuenta una cosa y la pantalla de alertas otra, el administrador ve dos");
        N.push("cifras incompatibles en dos pantallas del mismo menu, que es el mismo defecto de");
        N.push("los dos umbrales de CU25, y ahora repartido en dos casos.");
        N.push("");
        N.push("Y el reporte de voz de CU43, que es el unico endpoint con consultar_reportes, tiene");
        N.push("justo el defecto opuesto: no tiene filtro de sucursal en absoluto. Sus tres");
        N.push("consultas filtran por el id que le llega, y si no le llega ninguno, genera para todas.");
        N.push("O sea que el permiso de este caso tiene dos predecesores y los dos se equivocan en");
        N.push("direcciones opuestas.");
        N.push("");
        N.push("HALLAZGO 4: proximas_a_ingresar NO TIENE ESTADO QUE FILTRAR.");
        N.push("");
        N.push("El caso lo define como las cantidades de ordenes de compra en transito. Ni la tabla");
        N.push("ni el codigo tienen ese estado:");
        N.push("");
        N.push("  ordenes_compra.estado  VARCHAR(20) DEFAULT 'Pendiente'");
        N.push("");
        N.push("y los tres unicos valores que el codigo escribe son Pendiente, Anulada y Recibida.");
        N.push("No hay transito, ni en transito, ni En camino, en ninguna parte del repositorio. Es");
        N.push("el octavo vocabulario de estado distinto del proyecto, y este es el primero que se");
        N.push("usa como criterio de calculo y no como etiqueta.");
        N.push("");
        N.push("Lo mas cerca que existe es Pendiente, osea las ordenes que se emitieron y no han");
        N.push("llegado. Si se usara ese, el KPI seria correcto en el caso habitual. Pero conviene");
        N.push("que este escrito en el caso, porque hoy la frase esta describiendo un estado");
        N.push("imposible y quien lo lea no lo notara.");
        N.push("");
        N.push("Y ojo con el nombre: proximas_a_ingresar mezclaria dos cosas distintas, las que estan");
        N.push("Pendiente y las que ya estan Recibidas pero sin mercaderia registrada, que es lo");
        N.push("que hace CU22 con sp_registrar_recepcion, que escribe Recepcion donde el resto de");
        N.push("los codigos espera Recibida. O sea que la linea de tiempo de una orden tiene dos");
        N.push("vocabularios incompatibles, y el KPI tiene que elegir uno.");
        N.push("");
        N.push("HALLAZGO 5: NO HAY LIBRERIA DE GRAFICOS. EL FRONTEND TIENE SEIS DEPENDENCIAS.");
        N.push("");
        N.push("  web/package.json dependencies: clsx, lucide-react, react, react-dom,");
        N.push("                                 react-router-dom, tailwind-merge");
        N.push("");
        N.push("Seis. Ninguna de graficos: no hay recharts, ni chart.js, ni d3, ni victory, ni nivo,");
        N.push("ni echarts, ni apexcharts. El caso pide barras por sucursal, barras por mes y un");
        N.push("doughnut de distribucion de existencias, mas animaciones y skeletons, y no hay con");
        N.push("que hacerlo. Habria que anadir la libreria, o escribir un SVG a mano.");
        N.push("");
        N.push("Es un dato del proyecto que no sale de los casos: el frontend entero se sostiene");
        N.push("en Tailwind y en los iconos de lucide. No hay una sola libreria de visualizacion de");
        N.push("datos, lo cual es raro en un proyecto con un modulo de reportes y otro de");
        N.push("recomendaciones, y explica por que los dos son de tablas y no de graficos.");
        N.push("");
        N.push("HALLAZGO 6: EL CSV CON BOM NO TIENE PRECEDENTE, Y EL QUE HAY ESTA PEOR.");
        N.push("");
        N.push("El caso dice que el boton Exportar CSV descarga con BOM para Excel. En todo el");
        N.push("repositorio no hay ni un archivo con BOM: cero. Y el unico generador de CSV que");
        N.push("existe es el de CU43, que hace:");
        N.push("");
        N.push("  return Buffer.from([header, ...rows].join('\\n'), 'utf-8');");
        N.push("");
        N.push("Sin BOM. O sea que un CSV de ese codigo abierto en Excel muestra categoria, talla y");
        N.push("nombres con acentos como caracteres raros, y el caso le pide a este modulo que haga");
        N.push("mejor que el unico precedente que existe. El BOM es el caracter U+FEFF al principio");
        N.push("del fichero, y son tres bytes, no un problema de codificacion.");
        N.push("");
        N.push("Y el de CU43 arrastra los otros dos fallos que ya se describieron alli: solo entre-");
        N.push("quilla los valores con coma, y no escapa ni comillas sueltas ni saltos de linea. Si el");
        N.push("dashboard reutiliza ese helper en vez de escribir el suyo, hereda los dos.");
        N.push("");
        N.push("HALLAZGO 7: LAS SERIES DEL CASO COINCIDEN CON LAS QUE YA FALLARON.");
        N.push("");
        N.push("El caso define ventas_por_mes agrupando por date_trunc('month', ventas.fecha_venta),");
        N.push("y esa columna se llama asi de verdad, segun schema.sql:384. O sea que aqui el caso");
        N.push("acierta donde CU43 se equivocaba, porque alli el codigo leia v.fecha y la columna es");
        N.push("fecha_venta. Conviene decirlo porque son las dos mitades del mismo error: CU43 lo");
        N.push("tiene escrito mal en el codigo, y CU44 lo tiene bien en la especificacion.");
        N.push("");
        N.push("Lo que CU44 no dice, y que es un problema de fondo para este caso: los KPI de");
        N.push("existencias, alertas y proximas_a_ingresar no son de rango de fechas. Son fotos del");
        N.push("ahora. Y las ventas si son del rango. O sea que un dashboard con un filtro de fecha");
        N.push("mezcla dos cosas de naturalezas distintas y la interfaz no lo explica en ningun");
        N.push("sitio: las tarjetas de existencias y alertas no cambian al mover el rango, y un");
        N.push("administrador interpretaria que si. Lo mas honesto es rotular esas tarjetas con su");
        N.push("propia fecha de corte, que es lo que hace un panel de verdad.");
        N.push("");
        N.push("Y hay una segunda mezcla: el ticket_promedio se define como ventas_totales");
        N.push("dividido entre el numero de ventas, y ventas_totales es SUM(ventas.total). Como");
        N.push("ventas.total ya incluye impuestos, el ticket promedio con impuestos, que es lo");
        N.push("correcto. Pero si alguien lo calcula sobre el subtotal, como hace el resumen de");
        N.push("CU43, dara un numero un trece por ciento menor. Dos proyectos, dos criterios.");
        N.push("");
        N.push("HALLAZGO 8: LO QUE EL CASO HACE BIEN, Y ES POR QUE NO ES FACIL.");
        N.push("");
        N.push("  - Declara que no hay escrituras. Es cierto y es una buena noticia: un dashboard es");
        N.push("    de solo lectura, con lo que no puede dejar el inventario ni las ventas en mal");
        N.push("    estado, que es el riesgo real de los otros modulos de este proyecto.");
        N.push("  - Filtra ventas por estado Completada, no por Pendiente. Con lo que se sabe de");
        N.push("    CU35, una venta Pendiente puede quedarse para siempre sin pagarse, y sin ese");
        N.push("    filtro contaria como venta en todos los KPIs y en el ticket promedio.");
        N.push("  - Usa fecha_venta, la columna correcta.");
        N.push("  - El detalle de existencias pide las tres cantidades y el conteo de agotadas por");
        N.push("    prenda, que es la lectura correcta del modelo de tres cantidades y que evita");
        N.push("    sumar disponible mas reservada, que con el hallazgo 2 de CU39 seria repetir el");
        N.push("    error de contar dos veces lo mismo.");
        N.push("  - Pide la sucursal como Todas o una concreta, que es el filtro que hace util el");
        N.push("    panel para una administracion con varias tiendas.");
        N.push("  - E5 y E7 estan bien pensadas: el dashboard se responde con ceros en vez de");
        N.push("    fallar, y el CSV se genera aunque no tenga filas. Un panel que se queda en blanco");
        N.push("    cuando no hay datos es un panel que el usuario no sabe si esta roto o vacio.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - El permiso seguiria siendo consultar_reportes, octava aparicion de un permiso");
        N.push("    que no existe en la semilla. Con el caso anterior se repartiría entre CU43 y");
        N.push("    CU44, y los dos menu items serian invisibles para todo el mundo salvo el");
        N.push("    administrador. La buena noticia es que en los dos casos el permiso del menu y el");
        N.push("    del servicio coinciden, cosa que no pasa en otros modulos.");
        N.push("  - Si el dashboard se añade al menu, el filtro de AdminLayout lo mostraria solo a");
        N.push("    quien tenga el permiso, y ese filtro ya funciona. Es la parte de la");
        N.push("    visibilidad que el caso da por perdida y en realidad esta resuelta.");
        N.push("  - El caso menciona skeletons, animaciones y un intervalo de refresco. El resto del");
        N.push("    panel de administracion no usa ninguna de las tres cosas, asi que serian las");
        N.push("    primeras. El intervalo ademas tiene que limpiarse al desmontar o la pantalla");
        N.push("    sigue pidiendo KPIs cada N segundos cuando el usuario ya no esta mirando, que");
        N.push("    es el fallo clasico de este patron.");
        N.push("  - ventas_por_sucursal y ventas_por_mes con date_trunc devuelven una fila por");
        N.push("    combinacion, no una serie completa. Si una sucursal no vendio en un mes, ese mes");
        N.push("    no aparece en la serie, y el grafico de barras dibuja dos meses juntos. El caso");
        N.push("    lo describe como series con etiqueta y valor, que es la forma de rellenar los");
        N.push("    huecos, pero no dice de donde sale la lista de meses.");
        N.push("  - Para un panel en tiempo real sobre ventas, el trigger fn_aplicar_movimiento");
        N.push("    inventario y la tabla movimientos_inventario ya dan el rastro, pero el caso no");
        N.push("    propone ningun indice sobre ventas.fecha_venta. El indice existente es");
        N.push("    idx_ventas_sucursal_fecha sobre (id_sucursal, fecha_venta), que ayuda si se");
        N.push("    filtra por sucursal y no si se pide Todas, que es el caso por defecto.");
        N.push("  - Este caso es el que mas conviene hacer bien y el mas dificil de hacer bien, y no");
        N.push("    por el codigo: es el que mas depende de datos que el proyecto todavia no tiene.");
        N.push("    Sin productos (por el porcentaje_iva de CU36), sin ventas (por CU34), sin");
        N.push("    comprobantes (por CU38) y con el stock sobrevalorado (por CU39), los");
        N.push("    indicadores saldrian correctos y serian mentira.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU44 - DASHBOARD INTELIGENTE Y KPIS - INFORME");
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
    msg = msg + "CU44 - Dashboard inteligente y KPIs" + SALTO + SALTO;
    msg = msg + "Este caso NO TIENE IMPLEMENTACION. Ni modulo, ni" + SALTO;
    msg = msg + "servicio, ni ruta, ni pagina, ni entrada de menu." + SALTO;
    msg = msg + "Lo unico que dice 'dashboard' es un icono lucide." + SALTO;
    msg = msg + "Hoy /admin/dashboard muestra 'En construccion'." + SALTO + SALTO;
    msg = msg + "Ninguna de las seis agregaciones existe. Tres piezas" + SALTO;
    msg = msg + "hay, pero CU26 no filtra por sucursal y CU43 tampoco." + SALTO;
    msg = msg + "No hay estado 'En transito' en ordenes_compra." + SALTO;
    msg = msg + "El frontend tiene 6 dependencias y ninguna de graficos." + SALTO + SALTO;
    msg = msg + "Clases: " + DEF.length + "    Actores: 3    Relaciones: " + TOTAL_REL + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de " + TOTAL_ATR + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de " + TOTAL_OPE + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de " + TOTAL_REL + SALTO;
    if (conEnDiagrama < TOTAL_REL) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU44 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU44 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU44", 0); } catch (e3) { }
}
