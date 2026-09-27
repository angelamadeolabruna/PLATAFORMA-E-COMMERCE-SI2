// ================================================================
// CU26 - CONSULTAR EXISTENCIAS CONSOLIDADAS
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   api/src/modulos/inventario/CTR_Existencias.ts     2 handlers + parseIntId con 4 mensajes
//   api/src/modulos/inventario/SRV_ExistenciasService.ts 5 metodos; SIN esAdministrador,
//                                                    SIN sucursalEncargado, SIN usuarios_empleados
//   web/src/pages/admin/AdminExistencias.tsx        expandidos como Set, exportarCsv de la pagina
//   web/src/lib/api.ts                              obtenerOpcionesExistencias, consultarExistencias
//   schema.sql:302  inventario_stock                la unica tabla que se consolida
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
    ["IU_AdminExistencias", "EXISTE. pages/admin/AdminExistencias.tsx", "tabla consolidada con fila expandible por sucursal",
     [["opciones", "Object", VIS_PUB], ["cargandoOpciones", "Boolean", VIS_PUB], ["busqueda", "String", VIS_PUB], ["categoria", "String", VIS_PUB], ["idSucursal", "String", VIS_PUB], ["resultado", "Object", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["toast", "Object", VIS_PUB], ["permisoOk", "Boolean", VIS_PUB], ["expandidos", "Set", VIS_PUB]],
     [["cargarOpciones", "void", [], VIS_PUB], ["consultar", "void", [], VIS_PUB], ["irPagina", "void", ["pagina"], VIS_PUB], ["toggleExpandido", "void", ["idPtc"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_CsvExistencias", "EXISTE. AdminExistencias.tsx", "exportador de CSV; tambien solo la pagina cargada",
     [],
     [["exportarCsv", "void", ["items"], VIS_PUB], ["construirCsv", "String", ["items"], VIS_PUB]]],

    ["IU_Api", "EXISTE. lib/api.ts", "obtenerOpcionesExistencias y consultarExistencias",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["obtenerOpcionesExistencias", "Object", [], VIS_PUB], ["consultarExistencias", "Object", ["filtro"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_ExistenciasController", "EXISTE. inventario/CTR_Existencias.ts", "ruta admin/inventario/existencias",
     [["existenciasService", "ExistenciasService", VIS_PRI]],
     [["opciones", "Object", ["currentUser"], VIS_PUB], ["consultar", "Object", ["query", "currentUser"], VIS_PUB]]],

    ["SRV_ExistenciasService", "EXISTE. inventario/SRV_ExistenciasService.ts", "5 metodos; SIN alcance por sucursal; logger sin usar",
     [["logger", "Logger sin usar", VIS_PRI], ["dataSource", "DataSource", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermiso", "void", ["usuario"], VIS_PRI], ["obtenerOpciones", "Object", ["usuario"], VIS_PUB], ["consultar", "Object", ["usuario", "filtro"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "EXISTE. seguridad/dependencias.ts", "canActivate propio; header Bearer o cookie access_token",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "tres consultas: COUNT sobre el subgrupo, la pagina y el desglose",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "Object", ["callback"], VIS_PUB], ["getRepository", "Repository", ["entidad"], VIS_PUB]]],

    ["CE_InventarioStock", "EXISTE. tabla inventario_stock (schema.sql:302)", "la unica tabla que se consolida; la clave es id_ptc",
     [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_reservada", "Integer = 0", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB], ["stock_minimo_alert", "Integer = 0", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. tabla producto_talla_color", "es el nivel en el que se consolida, no id_producto",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB]],
     []],

    ["CE_Producto", "EXISTE. tabla productos", "JOIN interior con LOWER(estado) = activo",
     [["id_producto", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["id_categoria", "Integer", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_Talla", "EXISTE. tabla tallas", "se ordena por t.orden y participa en el GROUP BY",
     [["id_talla", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["orden", "Integer", VIS_PUB]],
     []],

    ["CE_Color", "EXISTE. tabla colores", "participa en el GROUP BY y en la busqueda",
     [["id_color", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB]],
     []],

    ["CE_Categoria", "EXISTE. tabla categorias", "LEFT JOIN en el consolidado; filtro por id_categoria",
     [["id_categoria", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_Sucursal", "EXISTE. tabla sucursales", "el nombre llega por el JOIN del desglose",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. tabla usuarios", "de donde sale permisos_json",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120", VIS_PRI], ["estado", "String", VIS_PUB]],
     []],

    ["CE_Rol", "EXISTE. tabla roles", "gestionar_inventory vive en permisos_json",
     [["id_rol", "Integer = PK", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "EXISTE. tabla usuarios_roles", "une usuario con rol",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_ExistenciasFiltro", "EXISTE. SRV_ExistenciasService.ts", "cinco filtros; el query param se llama categoria, no id_categoria",
     [["busqueda", "String", VIS_PUB], ["id_categoria", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["pagina", "Integer", VIS_PUB], ["limite", "Integer = 20", VIS_PUB]],
     []],

    ["CE_ExistenciaItem", "EXISTE. SRV_ExistenciasService.ts", "stock_minimo_global es una SUMA, no un maximo",
     [["id_ptc", "Integer", VIS_PUB], ["id_producto", "Integer", VIS_PUB], ["nombre_producto", "String", VIS_PUB], ["talla", "String", VIS_PUB], ["color", "String", VIS_PUB], ["categoria", "String", VIS_PUB], ["total_disponible", "Integer", VIS_PUB], ["total_reservado", "Integer", VIS_PUB], ["total_vendido", "Integer", VIS_PUB], ["stock_minimo_global", "Integer = SUM de minimos", VIS_PUB], ["stock_bajo", "Boolean", VIS_PUB], ["sucursales", "Array", VIS_PUB]],
     []],

    ["CE_ExistenciaPorSucursal", "EXISTE. SRV_ExistenciasService.ts", "el detalle de la fila expandida",
     [["id_sucursal", "Integer", VIS_PUB], ["nombre_sucursal", "String", VIS_PUB], ["disponible", "Integer", VIS_PUB], ["reservada", "Integer", VIS_PUB], ["vendida", "Integer", VIS_PUB], ["stock_minimo_alert", "Integer", VIS_PUB]],
     []],

    ["CE_OpcionesExistencias", "EXISTE. SRV_ExistenciasService.ts", "sucursales y categorias; es el unico retorno que no consolida",
     [["sucursales", "Array", VIS_PUB], ["categorias", "Array", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Administrador", "Administrador General", "*"],
    ["ACTOR_Encargado", "Encargado de Sucursal", "gestionar_inventario"]
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
    var paq = subPaquete(mod, "CU26 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU26 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        conEnDiagrama += relacion(diag, C[0], C[1], "exporta la tabla", "Dependency", "uses", "pantalla", "csv", "1", "0..1");
        conEnDiagrama += relacion(diag, C[0], C[2], "cliente HTTP", "Dependency", "uses", "pantalla", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[0], C[20], "opciones de los filtros", "Dependency", "uses", "pantalla", "opciones", "1", "0..1");
        conEnDiagrama += relacion(diag, C[0], C[18], "filas de la tabla", "Association", "", "pantalla", "item", "0..*", "1");
        conEnDiagrama += relacion(diag, C[0], C[19], "desglose expandido", "Association", "", "pantalla", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C[0], C[12], "filtro de categoría", "Association", "", "pantalla", "categoría", "0..*", "1");
        conEnDiagrama += relacion(diag, C[0], C[13], "filtro de sucursal", "Association", "", "pantalla", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C[1], C[18], "filas a exportar", "Dependency", "uses", "csv", "item", "0..*", "1");
        conEnDiagrama += relacion(diag, C[1], C[19], "columnas del desglose", "Dependency", "uses", "csv", "desglose", "0..*", "1");
        conEnDiagrama += relacion(diag, C[2], C[3], "punto de acceso HTTP", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, C[3], C[17], "filtro de la query string", "Association", "", "controlador", "filtro", "1", "1");
        conEnDiagrama += relacion(diag, C[3], C[5], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[3], C[4], "servicio de existencias", "Association", "", "controlador", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[5], "usuario autenticado", "Association", "", "existencias", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[6], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[7], "stock consolidado", "Dependency", "uses", "existencias", "stock", "0..*", "1");
        conEnDiagrama += relacion(diag, C[4], C[15], "rol del usuario", "Dependency", "uses", "existencias", "rol", "1", "0..1");
        conEnDiagrama += relacion(diag, C[4], C[16], "asignación de rol", "Dependency", "uses", "existencias", "asignación", "1", "0..*");
        conEnDiagrama += relacion(diag, C[4], C[17], "filtro aplicado", "Association", "", "existencias", "filtro", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[18], "item mapeado", "Association", "", "existencias", "item", "0..*", "1");
        conEnDiagrama += relacion(diag, C[4], C[19], "desglose mapeado", "Association", "", "existencias", "desglose", "0..*", "1");
        conEnDiagrama += relacion(diag, C[4], C[20], "opciones producidas", "Association", "", "existencias", "opciones", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[12], "categorías listadas", "Association", "", "existencias", "categoría", "0..*", "1");
        conEnDiagrama += relacion(diag, C[4], C[13], "sucursales listadas", "Association", "", "existencias", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C[5], C[14], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");
        conEnDiagrama += relacion(diag, C[7], C[8], "stock por ptc", "Association", "", "stock", "ptc", "1", "1");
        conEnDiagrama += relacion(diag, C[7], C[13], "stock por sucursal", "Association", "", "stock", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[8], C[9], "producto del ptc", "Association", "", "ptc", "producto", "1", "1");
        conEnDiagrama += relacion(diag, C[8], C[10], "talla del ptc", "Association", "", "ptc", "talla", "1", "0..1");
        conEnDiagrama += relacion(diag, C[8], C[11], "color del ptc", "Association", "", "ptc", "color", "1", "0..1");
        conEnDiagrama += relacion(diag, C[9], C[12], "categoría del producto", "Association", "", "producto", "categoría", "0..1", "0..1");
        conEnDiagrama += relacion(diag, C[14], C[15], "rol del usuario", "Association", "", "usuario", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C[14], C[16], "asignación de rol", "Association", "", "usuario", "asignación", "1", "0..*");
        conEnDiagrama += relacion(diag, C[17], C[12], "categoría del filtro", "Dependency", "uses", "filtro", "categoría", "0..1", "1");
        conEnDiagrama += relacion(diag, C[17], C[13], "sucursal del filtro", "Dependency", "uses", "filtro", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[18], C[7], "stock del item", "Dependency", "uses", "item", "stock", "0..*", "1");
        conEnDiagrama += relacion(diag, C[18], C[8], "ptc del item", "Dependency", "uses", "item", "ptc", "1", "1");
        conEnDiagrama += relacion(diag, C[18], C[19], "desglose del item", "Composition", "composition", "item", "desglose", "1", "0..*");
        conEnDiagrama += relacion(diag, C[19], C[13], "sucursal del desglose", "Association", "", "desglose", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C[19], C[7], "stock de la sucursal", "Dependency", "uses", "desglose", "stock", "1", "0..1");
        conEnDiagrama += relacion(diag, C[20], C[12], "categorías de las opciones", "Association", "", "opciones", "categoría", "0..*", "1");
        conEnDiagrama += relacion(diag, C[20], C[13], "sucursales de las opciones", "Association", "", "opciones", "sucursal", "0..*", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("2 actores, 21 clases y 44 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (3), CTR_ controlador (1), SRV_ servicio (3), CE_ entidad o DTO (14).");
        N.push("");
        N.push("HALLAZGO CRITICO 1: NO HAY NINGUN ALCANCE POR SUCURSAL. CERO.");
        N.push("");
        N.push("En SRV_ExistenciasService no aparece ni una sola vez esAdministrador, sucursalEncargado,");
        N.push("usuarios_empleados ni el mensaje de no estar asociado a una sucursal. Cero referencias.");
        N.push("");
        N.push("Consecuencia: cualquier usuario con gestionar_inventario ve el stock CONSOLIDADO de todas");
        N.push("las sucursales, y ademas puede filtrar por cualquier id_sucursal. Un Encargado de Sucursal");
        N.push("no ve solo su sucursal: ve el global y puede elegir el desglose de las demas. Y como cada");
        N.push("fila trae sucursales[] con nombre y cantidad de cada sede, el nombre de las otras");
        N.push("sucursales y su inventario queda expuesto al encargado.");
        N.push("");
        N.push("Esto contrasta con los otros dos casos de lectura del mismo modulo:");
        N.push("  CU23 Kardex    tiene sucursalEncargado, esAdministrador y validarElegida. Acota.");
        N.push("  CU25 Alertas   tiene sucursalEncargado y sucursalAplicar. Acota y lanza 403.");
        N.push("  CU26 Existencias  no tiene nada. No acota.");
        N.push("");
        N.push("El caso CU26 no dice ni una palabra de esto. Es la diferencia de seguridad mas grave del");
        N.push("lote, y es precisamente la que hace el caso mas urgente: la vista consolidada es la que");
        N.push("revela el inventario de toda la cadena.");
        N.push("");
        N.push("HALLAZGO CRITICO 2: stock_minimo_global ES UNA SUMA, NO UN MAXIMO. Y DISCREPA DE CU25.");
        N.push("");
        N.push("  SUM(i.stock_minimo_alert)::int AS stock_minimo_global");
        N.push("  ...");
        N.push("  stock_bajo: stockMinimoGlobal > 0 && totalDisponible <= stockMinimoGlobal");
        N.push("");
        N.push("O sea que el umbral global es la SUMA de los minimos de todas las sucursales. El nombre");
        N.push("global sugiere otra cosa, y el caso tambien: dice total_disponible <= stock_minimo_global");
        N.push("con minimo mayor que cero, sin advertir de donde sale ese minimo.");
        N.push("");
        N.push("El problema: el umbral CRECE con el numero de sucursales. Una prenda con minimo 5 en tres");
        N.push("sucursales da stock_minimo_global = 15. Si el total disponible es 12, el badge dice");
        N.push("Stock bajo, aunque 12 sea mas que 5. Cuantas mas sucursales tenga la tienda, mas dificil");
        N.push("es que salte la alerta. Y al revés, con minimo 0 en una sucursal, esa sucursal aporta 0");
        N.push("al umbral pero si aporta su disponible al total, asi que falsea hacia el otro lado.");
        N.push("");
        N.push("PEOR: CU26 y CU25 discrepan sobre la misma prenda. CU25 alerta POR SUCURSAL:");
        N.push("  cantidad_disponible <= stock_minimo_alert, fila por fila de inventario_stock.");
        N.push("CU26 alerta POR SUMA. Con una prenda en 3 sucursales, 10 disponibles y minimo 5 en cada");
        N.push("una, CU25 no muestra ninguna alerta (10 > 5 en las tres) pero CU26 marca Stock bajo");
        N.push("(12 <= 15, o 10 <= 15). El administrador ve Stock bajo y no encuentra ninguna alerta en");
        N.push("la pagina de alertas que explique por qué. Para que los dos coincidan, el badge global");
        N.push("debería usar MAX(stock_minimo_alert) o disparar si CUALQUIER sucursal esta bajo su minimo.");
        N.push("");
        N.push("HALLAZGO CRITICO 3: UNA PRENDA AGOTADA EN TODAS LAS SUCURSALES NO APARECE JAMAS.");
        N.push("");
        N.push("  HAVING SUM(i.cantidad_disponible) > 0");
        N.push("");
        N.push("El caso acierta al escribirlo, pero lo trata como precondicion y no como hueco de");
        N.push("funcionalidad. Una prenda con 0 unidades en todas las sucursales queda fuera de la");
        N.push("tabla, del total, de la paginacion y del CSV. Para el usuario es indistinguible de que");
        N.push("esa prenda no exista. Y es justo el caso mas grave de todos: una prenda totalmente");
        N.push("agotada en la red entera es el maximo nivel de desabastecimiento, y no se puede ver.");
        N.push("Para arreglarlo haria falta un HAVING con OR: SUM(disponible) > 0 OR SUM(minimo) > 0.");
        N.push("");
        N.push("HALLAZGO 4: EL PARAMETRO DE LA URL SE LLAMA categoria Y EL CAMPO id_categoria.");
        N.push("");
        N.push("  CTR_Existencias: query.categoria ? parseIntId(query.categoria, 'La categoria no es valida.')");
        N.push("  y luego lo mete en id_categoria: del filtro");
        N.push("");
        N.push("O sea que en la URL es categoria=4 pero en el tipo se llama id_categoria. El caso lo");
        N.push("describe como filtro categoria, lo cual es correcto para el usuario. Pero el servicio");
        N.push("responde id_categoria en el JSON y el controller lee categoria de la query string, asi que");
        N.push("la misma concepto tiene dos nombres distintos en las dos capas. En Kardex y Alertas los");
        N.push("parametros si coinciden con los campos. Aqui no.");
        N.push("");
        N.push("HALLAZGO 5: LA BUSQUEDA NO QUITA ACENTOS, Y LA APP ES EN CASTELLANO.");
        N.push("");
        N.push("  params.push(`%${busqueda.toLowerCase()}%`)");
        N.push("  (LOWER(p.nombre) LIKE $n OR LOWER(t.nombre) LIKE $n OR LOWER(c.nombre) LIKE $n)");
        N.push("");
        N.push("El LOWER resuelve las mayusculas, bien. Pero Postgres no quita acentos con LOWER, y el");
        N.push("codigo no usa unaccent(), ni lo hay en ningun sitio del proyecto. Consecuencia: buscar");
        N.push("cafe no encuentra Camisa Cafe, y buscar sudado no encuentra Sudan. Es el fallo de");
        N.push("busqueda mas probable en una tienda de ropa, porque los nombres de");
        N.push("prenda en espanol llevan tilde a menudo y los usuarios no la escriben. El caso lo");
        N.push("describe como busqueda por nombre, talla o color via LIKE, sin advertir el límite.");
        N.push("");
        N.push("Ojo ademas: el LIKE no escapa los comodines. Si el usuario escribe % en el buscador,");
        N.push("el patron se convierte en comodín y la busqueda devuelve todo. No es inyección SQL");
        N.push("porque el valor va siempre como parametro ligado, pero si un filtro inesperado.");
        N.push("");
        N.push("HALLAZGO 6: HAY CUATRO 400 MAS, DE parseIntId, QUE EL CASO NO LISTA.");
        N.push("");
        N.push("  400 La categoria no es valida.");
        N.push("  400 La sucursal no es valida.");
        N.push("  400 La pagina no es valida.");
        N.push("  400 El limite no es valido.");
        N.push("");
        N.push("Los dos 404 de E2 si estan en el caso y son exactos: Sucursal no encontrada. y");
        N.push("Categoria no encontrada. Pero los cuatro 400 no, y el caso trata E2 como si fuera la");
        N.push("unica forma de que un filtro venga mal. Ademas parseIntId rechaza con 400 cualquier");
        N.push("valor que no sea entero POSITIVO, asi que pagina=0 y limite=0 dan 400, y eso hace que");
        N.push("el Math.max(1, ...) del servicio sea inalcanzable, igual que en CU23. El Math.min(100,..)");
        N.push("si se alcanza: limite=500 pasa el parseIntId y llega truncado a 100.");
        N.push("");
        N.push("El orden real de las validaciones es: permiso, luego sucursal, luego categoria. El caso");
        N.push("no ordena nada y mete el 403 de E3 al final, cuando en realidad el permiso se comprueba");
        N.push("primero que nada.");
        N.push("");
        N.push("HALLAZGO 7: EL COUNT REUTILIZA EL MISMO GRUPO. ESO ESTA BIEN HECHO.");
        N.push("");
        N.push("  const grupo = `SELECT ... GROUP BY ... HAVING SUM(i.cantidad_disponible) > 0`;");
        N.push("  const totalFila = SELECT COUNT(*)::int AS n FROM (${grupo}) q");
        N.push("  const filas = ${grupo} ORDER BY ... LIMIT $n OFFSET $n+1");
        N.push("");
        N.push("Merece destacarse lo que esta bien: el string del grupo se construye una vez y se usa");
        N.push("tanto para el COUNT como para las filas paginadas, con los mismos parametros. Asi el");
        N.push("total y los items no pueden desincronizarse. Los placeholders del LIMIT y del OFFSET se");
        N.push("numeran con params.length + 1 y + 2, que es la forma correcta de ampliar un conjunto");
        N.push("de parametros ya construido. El filtro de busqueda tambien se mete en el subgrupo, de");
        N.push("modo que el total cuenta lo filtrado y no el total de la tabla.");
        N.push("");
        N.push("Y el desglose se consulta aparte con WHERE i.id_ptc = ANY($1::int[]) y se agrupa en un");
        N.push("Map<number, ExistenciaPorSucursal[]>. La segunda consulta vuelve a aplicar el filtro de");
        N.push("sucursal si viene, y se salta entera si ids esta vacio. Todo correcto.");
        N.push("");
        N.push("HALLAZGO 8: EL CSV DE NUEVO SOLO SACA LA PAGINA ACTUAL.");
        N.push("");
        N.push("  onClick={() => exportarCsv(resultado.items)}");
        N.push("");
        N.push("Es el mismo defecto que en CU23, y ahora es mas grave porque aqui el listado es una");
        N.push("consolidacion de toda la cadena: el usuario ve N producto(s) en el pie y se baja 20 filas.");
        N.push("Aun asi el archivo lleva el BOM \\\\uFEFF para Excel y se llama existencias_AAAA-MM-DD.csv,");
        N.push("y ahora el CSV si incluye las columnas del desglose por sucursal, que en CU23 no hacia");
        N.push("falta porque ahi no habia desglose.");
        N.push("");
        N.push("HALLAZGO 9: EL JOIN DE productos FILTRA, Y ESO SE COMBINA CON EL HAVING.");
        N.push("");
        N.push("  JOIN productos p ON p.id_producto = ptc.id_producto AND LOWER(p.estado) = 'activo'");
        N.push("");
        N.push("Igual que en CU25: es un JOIN interior, asi que una prenda desactivada desaparece del");
        N.push("consolidado. Y aqui el efecto se suma al HAVING: si la prenda esta Inactiva no aparece,");
        N.push("y si esta en cero tampoco. Entre las dos cosas, el consolidado solo muestra prendas");
        N.push("activas con stock positivo, que es justo el conjunto que NO necesita supervision.");
        N.push("La categoria es LEFT JOIN, en cambio, asi que una prenda sin categoria si aparece con");
        N.push("categoria null, y el filtro por id_categoria si la excluye. Eso si es coherente.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - logger vuelve a estar declarado y sin usar, igual que en SRV_KardexService. Es la");
        N.push("    segunda vez. Los dos unicos servicios del modulo inventario con solo lectura lo");
        N.push("    declaran y no lo usan nunca.");
        N.push("  - A diferencia de CU25, aqui no hay bitacora. ExistenciasService no recibe");
        N.push("    BitacoraService porque no escribe nada. Es el segundo caso de solo lectura real, junto");
        N.push("    con CU23, y por eso este diagrama no incluye ninguna clase de auditoria.");
        N.push("  - A diferencia de CU23 y CU25, aqui tampoco hay usuarios_empleados en el diagrama. No es");
        N.push("    un descuido: es la ausencia de alcance por sucursal del hallazgo 1.");
        N.push("  - El caso acierta al decir que el permiso real es gestionar_inventario y que");
        N.push("    consultar_inventario no existe en el seed. exigirPermiso comprueba '*' o");
        N.push("    gestionar_inventario. Pero el mensaje vuelve a no coincidir con el permiso:");
        N.push("    No tienes permiso para consultar las existencias consolidadas.");
        N.push("  - El mensaje de E3 si es exacto. Es el segundo mensaje exacto del lote, junto con los");
        N.push("    dos 403 de CU25.");
        N.push("  - El frontend guarda los expandidos en un Set<number> de id_ptc y lo vacia al cambiar de");
        N.push("    filtro y al cambiar de pagina. Correcto, porque un id_ptc de la pagina 2 no");
        N.push("    significaria lo mismo en la 1. Y los dos botones de paginacion se deshabilitan en los");
        N.push("    extremos, con pagina <= 1 y pagina >= totalPaginas.");
        N.push("  - El caso menciona que la fila se expande con una flechita. El codigo usa ChevronDown y");
        N.push("    ChevronUp del mismo icono, alternos, segun el estado del Set.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU26 - CONSULTAR EXISTENCIAS CONSOLIDADAS - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 77");
    T.push("Operaciones reales: " + totalOpe + " de 22");
    T.push("CONECTORES DIBUJADOS: " + conEnDiagrama + " de 44");
    if (conEnDiagrama < 40) T.push("  FALTAN LINEAS. Reejecuta el script: es idempotente y las coloca.");
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
    msg = msg + "CU26 - Consultar existencias consolidadas" + SALTO + SALTO;
    msg = msg + "Clases: 21    Actores: 2    Relaciones: 44" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 77" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 22" + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de 44" + SALTO;
    if (conEnDiagrama < 40) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "AVISO 1: no hay alcance por sucursal; un encargado ve" + SALTO;
    msg = msg + "         el stock de todas las sucursales." + SALTO;
    msg = msg + "AVISO 2: stock_minimo_global es la SUMA de los minimos." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU26 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU26 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU26", 0); } catch (e3) { }
}
