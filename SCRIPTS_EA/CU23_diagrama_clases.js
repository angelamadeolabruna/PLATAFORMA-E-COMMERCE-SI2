// ================================================================
// CU23 - CONSULTAR KARDEX DINAMICO
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   web/src/pages/admin/AdminKardex.tsx        esEntrada, badgeDe, cantidadSigno,
//                                            exportarCsv, useSearchParams, irPagina
//   api/src/modulos/inventario/CTR_Kardex.ts  2 handlers + parseIntId con 4 mensajes
//   api/src/modulos/inventario/SRV_KardexService.ts  9 metodos, DESCRIPCIONES_TIPO
//   schema.sql:628  fn_aplicar_movimiento_inventario  TRIGGER BEFORE INSERT
//   schema.sql:873  fn_kardex_producto        existe rotulada CU23 y NO se usa
//   schema.sql:811  sp_registrar_recepcion    escribe tipo_movimiento 'Recepcion'
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

var DEF = [
    ["IU_AdminKardex", "EXISTE. pages/admin/AdminKardex.tsx", "kardex dinamico con filtros, paginacion y saldo al pie",
     [["searchParams", "Object", VIS_PUB], ["opciones", "Object", VIS_PUB], ["cargandoOpciones", "Boolean", VIS_PUB], ["idPtc", "String", VIS_PUB], ["idSucursal", "String", VIS_PUB], ["fechaDesde", "String", VIS_PUB], ["fechaHasta", "String", VIS_PUB], ["resultado", "Object", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["toast", "Object", VIS_PUB], ["permisoOk", "Boolean", VIS_PUB]],
     [["cargarOpciones", "void", [], VIS_PUB], ["consultar", "void", [], VIS_PUB], ["irPagina", "void", ["pagina"], VIS_PUB], ["formatearFecha", "String", ["dateStr"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_CsvKardex", "EXISTE. AdminKardex.tsx", "exportador de CSV; exporta solo la pagina cargada",
     [],
     [["exportarCsv", "void", ["movimientos"], VIS_PUB], ["construirCsv", "String", ["movimientos"], VIS_PUB]]],

    ["IU_Api", "EXISTE. lib/api.ts", "obtenerOpcionesKardex y consultarKardex",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["obtenerOpcionesKardex", "Object", [], VIS_PUB], ["consultarKardex", "Object", ["filtro"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_KardexController", "EXISTE. inventario/CTR_Kardex.ts", "ruta admin/inventario/kardex",
     [["kardexService", "KardexService", VIS_PRI]],
     [["opciones", "Object", ["currentUser"], VIS_PUB], ["consultar", "Object", ["query", "currentUser"], VIS_PUB]]],

    ["SRV_KardexService", "EXISTE. inventario/SRV_KardexService.ts", "9 metodos; logger declarado y nunca usado; no recibe BitacoraService",
     [["logger", "Logger sin usar", VIS_PRI], ["dataSource", "DataSource", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["formatearFechaHora", "String", ["valor"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermiso", "void", ["usuario"], VIS_PRI], ["sucursalEncargado", "Integer", ["usuario"], VIS_PRI], ["esAdministrador", "Boolean", ["usuario"], VIS_PRI], ["validarElegida", "Integer", ["usuario", "idSucursal"], VIS_PRI], ["obtenerOpciones", "Object", ["usuario"], VIS_PUB], ["consultar", "Object", ["usuario", "filtro"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "EXISTE. seguridad/dependencias.ts", "canActivate propio; header Bearer o cookie access_token",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "tres consultas: COUNT, movimientos paginados y saldo",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "Object", ["callback"], VIS_PUB], ["getRepository", "Repository", ["entidad"], VIS_PUB]]],

    ["SRV_TriggerMovimientoInventario", "EXISTE. schema.sql:628", "TRIGGER BEFORE INSERT; calcula los saldos que el kardex muestra",
     [["v_disponible", "Integer", VIS_PRI]],
     [["fn_aplicar_movimiento_inventario", "void", ["NEW"], VIS_PUB]]],

    ["CE_MovimientoInventario", "EXISTE. tabla movimientos_inventario (schema.sql:421)", "no hay tabla kardex; esta es la tabla real",
     [["id_movimiento", "Integer = PK", VIS_PRI], ["id_ptc", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["tipo_movimiento", "String = 30", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["stock_anterior", "Integer = lo pone el trigger", VIS_PUB], ["stock_posterior", "Integer = lo pone el trigger", VIS_PUB], ["referencia", "String = 120", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_orden_compra", "Integer", VIS_PUB], ["id_venta", "Integer", VIS_PUB], ["id_reserva", "Integer", VIS_PUB], ["fecha", "Timestamp = la sobrescribe el trigger", VIS_PUB]],
     []],

    ["CE_InventarioStock", "EXISTE. tabla inventario_stock (schema.sql:302)", "de aqui sale el saldo_actual; el trigger solo toca disponible",
     [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_reservada", "Integer = 0", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB], ["stock_minimo_alert", "Integer = 0", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. tabla usuarios", "de donde sale permisos_json y el id_usuario del movimiento",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120", VIS_PRI], ["estado", "String", VIS_PUB]],
     []],

    ["CE_UsuarioEmpleado", "EXISTE. tabla usuarios_empleados (schema.sql:76)", "la sucursal sale de aqui, con fecha_baja IS NULL",
     [["id_empleado", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE", VIS_PUB], ["sucursal_id", "Integer", VIS_PUB], ["nombre", "String = 120", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["rol", "String = 60", VIS_PUB], ["fecha_baja", "Timestamp", VIS_PUB], ["motivo_baja", "String = 255", VIS_PUB]],
     []],

    ["CE_Sucursal", "EXISTE. tabla sucursales", "obtenerOpciones solo ofrece las que estan Activas",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. tabla producto_talla_color", "es el id_ptc que viaja en el filtro",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB]],
     []],

    ["CE_Producto", "EXISTE. tabla productos", "opciones filtra por LOWER(estado) = activo",
     [["id_producto", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activo", VIS_PUB], ["precio_base", "Decimal(10,2)", VIS_PUB]],
     []],

    ["CE_Talla", "EXISTE. tabla tallas", "se ordena por t.orden",
     [["id_talla", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["orden", "Integer", VIS_PUB]],
     []],

    ["CE_Color", "EXISTE. tabla colores", "se ordena por nombre",
     [["id_color", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB]],
     []],

    ["CE_Rol", "EXISTE. tabla roles", "consultar_kardex vive en permisos_json",
     [["id_rol", "Integer = PK", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "EXISTE. tabla usuarios_roles", "une usuario con rol",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_KardexFiltro", "EXISTE. SRV_KardexService.ts", "los cinco filtros de la query string",
     [["id_ptc", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["fecha_desde", "String", VIS_PUB], ["fecha_hasta", "String", VIS_PUB], ["pagina", "Integer", VIS_PUB], ["limite", "Integer = 20", VIS_PUB]],
     []],

    ["CE_KardexMovimiento", "EXISTE. SRV_KardexService.ts", "devuelve saldo, no stock_posterior; referencia_id colapsa tres FK",
     [["id_movimiento", "Integer", VIS_PUB], ["fecha", "String", VIS_PUB], ["tipo_movimiento", "String", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["stock_anterior", "Integer", VIS_PUB], ["saldo", "Integer", VIS_PUB], ["referencia", "String", VIS_PUB], ["referencia_id", "Integer", VIS_PUB], ["descripcion", "String", VIS_PUB], ["id_usuario", "Integer", VIS_PUB]],
     []],

    ["CE_FnKardexProducto", "EXISTE. schema.sql:873", "RETURNS TABLE de fn_kardex_producto, que no se usa",
     [["fecha", "Timestamp", VIS_PUB], ["tipo", "VARCHAR", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["stock_anterior", "Integer", VIS_PUB], ["stock_posterior", "Integer", VIS_PUB], ["referencia", "VARCHAR", VIS_PUB]],
     []],

    ["CE_OpcionesKardex", "EXISTE. SRV_KardexService.ts", "sucursales puede venir vacia sin lanzar error",
     [["sucursales", "Array", VIS_PUB], ["productos", "Array", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Encargado", "Encargado de Sucursal", "consultar_kardex"],
    ["ACTOR_Administrador", "Administrador General", "*"]
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
    var mod = buscarPaquete(cu, "7. Inventario y Recepciones");
    if (mod == null) mod = buscarPaquete(cu, "6. Proveedores y Compras");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU23 - Análisis de clases");

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
        INFORME.push(pad(d2[0], 32) + " atr " + totalDe(fin) + "/" + d2[3].length + "  ope " + totalDe(finOpe) + "/" + d2[4].length + (bien ? "  REAL" : "  TEXTO"));
    }

    var diag = null;
    try { diag = paq.Diagrams.AddNew("CU23 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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

        var C = clases;
        conEnDiagrama += relacion(diag, actores[0], C[0], "usuario", "Association", "", "actor", "pantalla", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C[0], "usuario", "Association", "", "actor", "pantalla", "1", "0..1");
        conEnDiagrama += relacion(diag, C[0], C[1], "exporta el listado", "Dependency", "uses", "pantalla", "csv", "1", "0..1");
        conEnDiagrama += relacion(diag, C[0], C[2], "cliente HTTP", "Dependency", "uses", "pantalla", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[0], C[22], "opciones de los filtros", "Association", "", "pantalla", "opciones", "1", "1");
        conEnDiagrama += relacion(diag, C[0], C[20], "movimientos de la tabla", "Association", "", "pantalla", "listado", "0..*", "1");
        conEnDiagrama += relacion(diag, C[0], C[9], "tarjetas de saldo", "Association", "", "pantalla", "saldo", "1", "0..1");
        conEnDiagrama += relacion(diag, C[1], C[20], "filas a exportar", "Dependency", "uses", "csv", "movimiento", "0..*", "1");
        conEnDiagrama += relacion(diag, C[2], C[3], "punto de acceso HTTP", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, C[3], C[19], "filtro de la query string", "Association", "", "controlador", "filtro", "1", "1");
        conEnDiagrama += relacion(diag, C[3], C[5], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[3], C[4], "servicio de kardex", "Association", "", "controlador", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[5], "usuario autenticado", "Association", "", "kardex", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[6], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[8], "movimientos leídos", "Association", "", "kardex", "movimiento", "0..*", "1");
        conEnDiagrama += relacion(diag, C[4], C[9], "saldo actual consultado", "Dependency", "uses", "kardex", "stock", "0..1", "1");
        conEnDiagrama += relacion(diag, C[4], C[11], "sucursal del encargado", "Dependency", "uses", "kardex", "empleado", "0..*", "1");
        conEnDiagrama += relacion(diag, C[4], C[17], "rol del usuario", "Dependency", "uses", "kardex", "rol", "1", "0..1");
        conEnDiagrama += relacion(diag, C[4], C[18], "asignación de rol", "Dependency", "uses", "kardex", "asignación", "1", "0..*");
        conEnDiagrama += relacion(diag, C[4], C[19], "filtro aplicado", "Association", "", "kardex", "filtro", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[20], "movimiento mapeado", "Association", "", "kardex", "movimiento", "0..*", "1");
        conEnDiagrama += relacion(diag, C[4], C[21], "alternativa no usada", "Dependency", "uses", "kardex", "función", "0..*", "1");
        conEnDiagrama += relacion(diag, C[4], C[22], "opciones producidas", "Association", "", "kardex", "opciones", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[12], "sucursales listadas", "Association", "", "kardex", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C[4], C[13], "productos listados", "Association", "", "kardex", "ptc", "0..*", "1");
        conEnDiagrama += relacion(diag, C[5], C[10], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");
        conEnDiagrama += relacion(diag, C[7], C[8], "movimiento procesado", "Composition", "composition", "trigger", "movimiento", "1", "0..*");
        conEnDiagrama += relacion(diag, C[7], C[9], "stock aplicado", "Composition", "composition", "trigger", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C[8], C[13], "producto del movimiento", "Association", "", "movimiento", "ptc", "1", "0..1");
        conEnDiagrama += relacion(diag, C[8], C[12], "sucursal del movimiento", "Association", "", "movimiento", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[8], C[10], "usuario del movimiento", "Association", "", "movimiento", "usuario", "0..1", "0..1");
        conEnDiagrama += relacion(diag, C[9], C[13], "stock por ptc", "Association", "", "stock", "ptc", "1", "1");
        conEnDiagrama += relacion(diag, C[9], C[12], "stock por sucursal", "Association", "", "stock", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[11], C[12], "sucursal del empleado", "Association", "", "empleado", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[11], C[10], "usuario del empleado", "Association", "", "empleado", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C[10], C[17], "rol del usuario", "Association", "", "usuario", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C[10], C[18], "asignación de rol", "Association", "", "usuario", "asignación", "1", "0..*");
        conEnDiagrama += relacion(diag, C[13], C[14], "producto del ptc", "Association", "", "ptc", "producto", "1", "1");
        conEnDiagrama += relacion(diag, C[13], C[15], "talla del ptc", "Association", "", "ptc", "talla", "1", "0..1");
        conEnDiagrama += relacion(diag, C[13], C[16], "color del ptc", "Association", "", "ptc", "color", "1", "0..1");
        conEnDiagrama += relacion(diag, C[20], C[8], "movimiento representada", "Dependency", "uses", "movimiento", "movimiento", "1", "1");
        conEnDiagrama += relacion(diag, C[21], C[8], "movimientos de la función", "Dependency", "uses", "función", "movimiento", "0..*", "1");
        conEnDiagrama += relacion(diag, C[22], C[12], "sucursales de las opciones", "Association", "", "opciones", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C[22], C[13], "productos de las opciones", "Association", "", "opciones", "ptc", "0..*", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("2 actores, 23 clases y 44 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (3), CTR_ controlador (1), SRV_ servicio (4), CE_ entidad o DTO (15).");
        N.push("");
        N.push("HALLAZGO CRITICO 1: LOS SALDOS DEL KARDEX NO LOS CALCULA NINGUN CODIGO TS.");
        N.push("");
        N.push("stock_anterior y stock_posterior son columnas de movimientos_inventario, pero NO aparecen");
        N.push("en la lista de columnas del INSERT. Las pone un trigger de Postgres:");
        N.push("");
        N.push("  schema.sql:628  CREATE FUNCTION fn_aplicar_movimiento_inventario() RETURNS TRIGGER");
        N.push("  schema.sql:654  CREATE TRIGGER trg_movimiento_inventario");
        N.push("                   BEFORE INSERT ON movimientos_inventario FOR EACH ROW");
        N.push("");
        N.push("El cuerpo hace tres cosas:");
        N.push("  NEW.stock_anterior  := v_disponible;");
        N.push("  NEW.stock_posterior := v_disponible + NEW.cantidad;");
        N.push("  NEW.fecha           := NOW();");
        N.push("y despues el propio UPSERT de inventario_stock con ON CONFLICT (id_ptc, id_sucursal).");
        N.push("");
        N.push("Es decir: el ON CONFLICT que CU22 se inventaba YA EXISTE, en el trigger, y con el nombre");
        N.push("de columna correcto. Y el saldo que CU23 muestra al usuario lo produce ese trigger.");
        N.push("");
        N.push("HALLAZGO CRITICO 2: EL TRIGGER SOBRESCRIBE LA FECHA. NO SE PUEDE HACER CARGA RETROACTIVA.");
        N.push("");
        N.push("  NEW.fecha := NOW();");
        N.push("");
        N.push("Aunque el INSERT de la aplicacion intente mandar otra fecha, el trigger la pisa. Y el");
        N.push("DEFAULT NOW() de la columna tampoco sirve de nada. Consecuencia para CU23: el filtro");
        N.push("fecha_desde / fecha_hasta solo puede ver movimientos desde el momento en que se");
        N.push("registraron. No se puede retrospectively insertar un movimiento de ayer, ni de una");
        N.push("importacion de historico. El rango de fechas es de ahora hacia adelante, no del pasado.");
        N.push("");
        N.push("HALLAZGO CRITICO 3: HAY UNA CARRERA EN EL TRIGGER QUE ROMPE LA CADENA DE SALDOS.");
        N.push("");
        N.push("  SELECT cantidad_disponible INTO v_disponible FROM inventario_stock WHERE ...");
        N.push("  ... NEW.stock_posterior := v_disponible + NEW.cantidad;");
        N.push("  INSERT ... ON CONFLICT DO UPDATE SET cantidad_disponible = ... + NEW.cantidad;");
        N.push("");
        N.push("El SELECT no bloquea. Bajo READ COMMITTED, dos movimientos concurrentes del mismo");
        N.push("id_ptc e id_sucursal pueden leer los dos el mismo v_disponible y calcular los dos el");
        N.push("mismo stock_anterior. El ON CONFLICT si serializa el incremento, asi que el stock");
        N.push("final de inventario_stock queda bien, pero el kardex muestra DOS filas con el mismo");
        N.push("stock_anterior y la suma de la columna saldo deja de cuadrar. Es justo el tipo de");
        N.push("fallo que se ve en un kardex, y la arreglar es SELECT ... FOR UPDATE en el trigger.");
        N.push("");
        N.push("HALLAZGO CRITICO 4: EL TRIGGER SOLO MUEVE cantidad_disponible.");
        N.push("");
        N.push("El trigger no toca cantidad_reservada ni cantidad_vendida. O sea:");
        N.push("  - una SALIDA-VENTA resta disponible pero NO suma cantidad_vendida");
        N.push("  - una SALIDA-RESERVA resta disponible pero NO resta cantidad_reservada");
        N.push("");
        N.push("Y CU23 muestra esas dos cifras en las tarjetas de saldo al pie (reservada y vendida).");
        N.push("Si ningun otro codigo las mantiene, mostraran 0 o valores viejos. Vale la pena");
        N.push("confirmar si SRV_ReservasService y el modulo de ventas las actualizan por su cuenta.");
        N.push("");
        N.push("HALLAZGO 5: HAY TRES NOMBRES DISTINTOS PARA EL MISMO MOVIMIENTO DE ENTRADA.");
        N.push("");
        N.push("  - El caso de CU22 pide escribir 'ENTRADA-COMPRA'.");
        N.push("  - DESCRIPCIONES_TIPO en SRV_KardexService:41 tiene la clave 'ENTRADA-COMPRA'");
        N.push("    como etiqueta, para traducirla a 'Entrada por compra'.");
        N.push("  - sp_registrar_recepcion (schema.sql:837) escribe tipo_movimiento = 'Recepcion'.");
        N.push("");
        N.push("Y ese tercer nombre es el unico que alguien escribe de verdad. Efecto en el kardex:");
        N.push("  - descripcionTipo('Recepcion') no encuentra la clave y devuelve 'Movimiento Recepcion'");
        N.push("  - badgeDe('Recepcion') no empieza por ENTRADA ni es SALIDA-RESERVA ni AJUSTE ni MERMA,");
        N.push("    asi que cae en el return final y devuelve variante 'danger'");
        N.push("");
        N.push("O sea que CADA RECEPCION SE PINTA CON BADGE ROJO en el kardex, que se lee como salida");
        N.push("o peligro, cuando en realidad es una entrada de mercaderia. Y el signo de la cantidad");
        N.push("si sale bien por casualidad, porque cantidadSigno cae en el return de la resta");
        N.push("(saldo - stock_anterior), que da +recibida porque el trigger suma. El numero bien, el");
        N.push("color mal. Es el defecto visible mas claro de todo este caso.");
        N.push("");
        N.push("HALLAZGO 6: 'AJUSTE-MANUAL' SE PUEDE ESCRIBIR PERO NO LO CONOCE NINGUNA DE LAS TRES CAPAS.");
        N.push("");
        N.push("CTR_Ajustes valida el tipo con @IsIn(['AJUSTE', 'MERMA', 'AJUSTE-MANUAL']). O sea que");
        N.push("AJUSTE-MANUAL es alcanzable desde la API. Pero:");
        N.push("  - DESCRIPCIONES_TIPO solo tiene AJUSTE y MERMA -> 'Movimiento AJUSTE-MANUAL'");
        N.push("  - badgeDe usa t === 'AJUSTE', igualdad exacta, no startsWith -> cae en 'danger'");
        N.push("Es el mismo fallo que en el hallazgo 5 pero por otra causa: aqui el problema es la");
        N.push("comparacion exacta, no el prefijo. Si el badge usara startsWith('AJUSTE') lo arreglaria.");
        N.push("");
        N.push("HALLAZGO 7: EXISTE fn_kardex_producto, ESTA ROTULADA CU23, Y NO SE USA.");
        N.push("");
        N.push("  schema.sql:871  -- 8. FUNCIÓN: Kardex con saldos (CU23)");
        N.push("  schema.sql:873  CREATE OR REPLACE FUNCTION fn_kardex_producto(p_id_ptc, p_sucursal)");
        N.push("                     RETURNS TABLE(fecha, tipo, cantidad, stock_anterior,");
        N.push("                                 stock_posterior, referencia)");
        N.push("");
        N.push("No hay ningun SELECT fn_kardex fn_kardex_producto en el codigo. SRV_KardexService.consultar");
        N.push("consulta movimientos_inventario directamente. Y la funcion es peor para este caso:");
        N.push("  - no tiene paginacion ni limite");
        N.push("  - no tiene filtro de fechas");
        N.push("  - no tiene RBAC de sucursal");
        N.push("  - ordena ASC, y el servicio ordena DESC (mas reciente primero)");
        N.push("Ademas su tabla de retorno se llama 'tipo' mientras el servicio expone 'tipo_movimiento'.");
        N.push("Es codigo muerto, y el comentario del schema dice que es para CU23.");
        N.push("");
        N.push("HALLAZGO 8: LA API DEVUELVE 'saldo', NO 'stock_posterior'. Y PIERDE QUE ES LA REFERENCIA.");
        N.push("");
        N.push("El caso lista stock_posterior entre las columnas del SELECT y dice saldo = stock_posterior.");
        N.push("La query real si trae stock_posterior, pero el SELECT la renombra al exponerla:");
        N.push("  saldo: Number(f.stock_posterior ?? 0)");
        N.push("");
        N.push("Asi que el campo stock_posterior no existe en la respuesta. Y hay un detalle peor:");
        N.push("");
        N.push("  const referenciaId = (f.id_orden_compra) ?? (f.id_venta) ?? (f.id_reserva) ?? null;");
        N.push("");
        N.push("Las tres FK se colapsan en un unico referencia_id. El cliente recibe un numero pero no");
        N.push("sabe si es una orden, una venta o una reserva, porque la informacion se perdio en el");
        N.push("servidor. El caso sugiere mostrar '#id de id_orden_compra/id_venta/id_reserva', pero no");
        N.push("hay forma de distinguirlo. Ademas la respuesta incluye id_usuario y el caso no lo");
        N.push("menciona, aunque si se usa en la bitacora de movimientos.");
        N.push("");
        N.push("HALLAZGO 9: HAY CINCO EXCEPCIONES MAS DE LAS CUATRO DEL CASO, Y UNA ES DE 400.");
        N.push("");
        N.push("El caso lista E1 (sin movimientos), E2 (fechas), E3 (sucursal) y E4 (sin permiso).");
        N.push("El endpoint puede responder ademas:");
        N.push("  422 Debe seleccionar un producto.        el servicio, si id_ptc no viene");
        N.push("  422 La fecha desde no es valida.        FECHA_RE, mensaje propio");
        N.push("  422 La fecha hasta no es valida.        FECHA_RE, mensaje propio");
        N.push("  400 El producto no es valido.           parseIntId, si no es entero positivo");
        N.push("  400 La sucursal no es valida.           parseIntId");
        N.push("  400 La pagina no es valida.             parseIntId");
        N.push("  400 El limite no es valido.             parseIntId");
        N.push("  404 Sucursal no encontrada.             validarElegida, solo para admin");
        N.push("  422 Debe seleccionar una sucursal.      validarElegida, solo para admin");
        N.push("");
        N.push("O sea nueve mensajes, no cuatro. Y hay una asimetría: las fechas se validan en el");
        N.push("servicio y dan 422, pero pagina y limite se parsean en el CONTROLADOR con parseIntId y");
        N.push("dan 400. El caso trata todas las entradas invalidas como 422.");
        N.push("");
        N.push("HALLAZGO 10: Math.max(1, pagina) ES CODIGO MUERTO POR HTTP.");
        N.push("");
        N.push("  const pagina = Math.max(1, Number(filtro.pagina ?? 1));");
        N.push("  const limite = Math.min(100, Math.max(1, Number(filtro.limite ?? 20)));");
        N.push("");
        N.push("parseIntId ya rechaza con 400 cualquier valor que no sea entero positivo (n <= 0),");
        N.push("así que pagina=0 y limite=0 nunca llegan al servicio. El Math.max(1, ...) no se puede");
        N.push("alcanzar. En cambio Math.min(100, ...) SI se alcanza: limite=500 pasa parseIntId y");
        N.push("llega truncado a 100. El caso solo dice limite=20 y no menciona el tope de 100.");
        N.push("");
        N.push("HALLAZGO 11: LA COMPARACION DE FECHAS ES DE CADENAS, Y ESO ES LO QUE LA SALVA.");
        N.push("");
        N.push("  if (fechaDesde != null && fechaHasta != null && fechaDesde > fechaHasta) throw ...");
        N.push("");
        N.push("Se comparan strings, no Date. Funciona porque FECHA_RE obliga a YYYY-MM-DD con ceros");
        N.push("a la izquierda, y ese formato ordena lexicograficamente igual que cronologicamente.");
        N.push("Es una decision correcta, pero fragil: si alguien relaja la regex, el filtro de rango");
        N.push("empieza a comparar mal sin que salte ningun error. Las fechas si se expanden a");
        N.push("jornada completa: desde + ' 00:00:00' y hasta + ' 23:59:59'.");
        N.push("");
        N.push("HALLAZGO 12: obtenerOpciones Y consultar APLICAN DISTINTO ROL A LA SUCURSAL.");
        N.push("");
        N.push("consultar -> validarElegida -> lanza 403 si el encargado no tiene sucursal.");
        N.push("obtenerOpciones -> si no es admin y no tiene sucursal, devuelve sucursales: [] y NO");
        N.push("lanza nada. O sea que un encargado sin sucursal ve la pagina cargar bien, con el");
        N.push("selector de sucursal vacio y todos los productos, y solo se entera al pulsar Consultar.");
        N.push("El caso da por hecho que el RBAC se resuelve en un solo sitio.");
        N.push("");
        N.push("Ademas el listado de productos de las opciones NO filtra por sucursal ni por stock, solo");
        N.push("por LOWER(p.estado) = 'activo'. Es el catalogo entero. para un catalogo con muchas");
        N.push("variantes de talla y color el desplegable es largo, y no indica cuales tienen stock.");
        N.push("");
        N.push("HALLAZGO 13: EL EXPORT CSV SOLO SACA LA PAGINA ACTUAL.");
        N.push("");
        N.push("  onClick={() => exportarCsv(resultado.movimientos)}");
        N.push("");
        N.push("resultado.movimientos son las 20 filas de la pagina visible, no las N del total. El");
        N.push("boton dice Exportar CSV y el usuario se lleva un archivo con solo una pagina de un historial");
        N.push("que puede tener miles de filas, sin ningun aviso. La API devuelve total y pagina, de");
        N.push("modo que faltaria un endpoint de exportacion o un aviso en el boton.");
        N.push("");
        N.push("Lo que si esta bien: el archivo lleva el BOM \\\\uFEFF para que Excel respete los acentos, y");
        N.push("el nombre es kardex_AAAA-MM-DD.csv. La cabecera la construye construirCsv.");
        N.push("");
        N.push("HALLAZGO 14: LA HORA QUE SE MUESTRA PUEDE IR DESFASADA.");
        N.push("");
        N.push("El servicio hace fecha: this.formatearFechaHora(f.fecha), con fecha::text de una");
        N.push("columna TIMESTAMP sin zona, que Postgres devuelve como '2026-09-25 14:30:00.123456'.");
        N.push("new Date() interpreta ese string como hora LOCAL del servidor, y toISOString() lo");
        N.push("convierte a UTC. Despues el navegador lo pinta con toLocaleString en su zona. El");
        N.push("resultado solo es correcto si la zona del servidor y la del navegador coinciden. Es el");
        N.push("mismo patron fragile que ya aparecio en CU21 con fecha_orden, aqui por tercera vez.");
        N.push("");
        N.push("HALLAZGO 15: CU23 NO ESCRIBE NADA, Y POR ESO NO TIENE BITACORA.");
        N.push("");
        N.push("KardexService no recibe BitacoraService: su constructor es solo dataSource. Es el");
        N.push("primer caso de solo lectura real del proyecto. El caso CU23 no menciona bitacora y");
        N.push("hace bien: no hay nada que auditar. Por eso este diagrama no incluye ninguna clase");
        N.push("de auditoria, a diferencia de CU18, CU19, CU21 y CU22.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - logger es un campo declarado y nunca usado en SRV_KardexService. Cero apariciones");
        N.push("    de this.logger en las 296 lineas del archivo.");
        N.push("  - cargarPermisos se llama dos veces en consultar: una en exigirPermiso y otra en");
        N.push("    esAdministrador dentro de validarElegida. Y tres veces en obtenerOpciones, porque");
        N.push("    tambien llama a esAdministrador. Son dos o tres SELECT idénticos por petición.");
        N.push("  - El frontend usa useSearchParams, o sea que los filtros viven en la URL y la pagina");
        N.push("    se puede compartir o marcar como favorita. El caso no lo menciona y es un acierto.");
        N.push("  - El frontend bloquea la consulta sin producto con un toast propio, 'Debe seleccionar");
        N.push("    un producto para consultar.', asi que el 422 del servicio no se ve desde la UI.");
        N.push("  - saldo_actual sale de inventario_stock con ?? 0 en las tres cifras. Si el ptc nunca");
        N.push("    tuvo fila de stock pero tiene movimientos, las tarjetas muestran 0/0/0 sin avisar.");
        N.push("  - El caso dice que el saldo se muestra con el signo mas o menos. El codigo usa");
        N.push("    esEntrada por prefijo ENTRADA y SALIDA por prefijo SALIDA, y para el resto calcula");
        N.push("    el delta saldo menos stock_anterior. Coincide con lo que dice el caso.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU23 - CONSULTAR KARDEX DINAMICO - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 96");
    T.push("Operaciones reales: " + totalOpe + " de 27");
    T.push("CONECTORES DIBUJADOS: " + conEnDiagrama + " de 44");
    if (conEnDiagrama < 44) T.push("  FALTAN LINEAS. Reejecuta el script: es idempotente y las coloca.");
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
    msg = msg + "CU23 - Consultar kardex dinamico" + SALTO + SALTO;
    msg = msg + "Clases: 23    Actores: 2    Relaciones: 44" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 96" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 27" + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de 44" + SALTO;
    if (conEnDiagrama < 44) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "AVISO 1: los saldos los pone un trigger, no codigo TS." + SALTO;
    msg = msg + "AVISO 2: la recepcion se escribe como 'Recepcion' y sale con badge ROJO." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU23 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU23 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU23", 0); } catch (e3) { }
}
