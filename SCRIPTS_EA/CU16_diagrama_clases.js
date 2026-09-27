// ================================================================
// CU16 - CONSULTAR CATALOGO CON FILTROS (WEB, PUBLICO)
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   web/src/pages/Catalogo.tsx                 filtros, debounce 300 ms, scroll infinito
//   web/src/pages/Producto.tsx                 detalle por codigo
//   web/src/lib/api.ts                         listarCatalogoPublico, listarOpcionesCatalogo,
//                                              consultarDisponibilidad
//   api/src/modulos/catalogo/CTR_Catalogo.ts     4 endpoints publicos, SIN guard
//   api/src/modulos/catalogo/SRV_CatalogoService.ts  listarPublico, consultarDisponibilidad,
//                                                   opcionesFiltros
//   BASE DE DATOS/schema.sql                   productos, producto_talla_color, producto_imagenes,
//                                               inventario_stock, sucursales, ciudades
//
// Sin estereotipo: Boundary, Control y Entity dibujan caja redondeada
// en EA. El rol va en el nombre: IU_ / CTR_ / SRV_ / CE_.
//
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
    ["IU_Catalogo", "Catalogo", "pages/Catalogo.tsx",
     [["opciones", "Object", VIS_PUB], ["busqueda", "String", VIS_PUB], ["categoria", "String", VIS_PUB], ["talla", "String", VIS_PUB], ["color", "String", VIS_PUB], ["temporada", "String", VIS_PUB], ["precioMin", "String", VIS_PUB], ["precioMax", "String", VIS_PUB], ["items", "Array", VIS_PUB], ["total", "Integer", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["cargandoMas", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["errorFiltro", "String", VIS_PUB], ["busquedaDebounce", "Object = ref", VIS_PUB]],
     [["construirFiltros", "Object", ["pagina"], VIS_PUB], ["recargar", "void", [], VIS_PUB], ["cargarMas", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Producto", "Producto", "pages/Producto.tsx",
     [["codigo", "String", VIS_PUB], ["disp", "Object", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "api", "lib/api.ts",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["listarCatalogoPublico", "Object", ["filtros"], VIS_PUB], ["listarOpcionesCatalogo", "Object", [], VIS_PUB], ["consultarDisponibilidad", "Object", ["codigo"], VIS_PUB], ["consultarDetalle", "Object", ["codigo"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_CatalogoController", "CatalogoController", "CTR_Catalogo.ts",
     [["catalogoService", "CatalogoService", VIS_PRI]],
     [["listarPublico", "Object", ["query"], VIS_PUB], ["listarOpciones", "Object", [], VIS_PUB], ["consultarDetalle", "Object", ["codigo"], VIS_PUB], ["consultarDisponibilidad", "Object", ["codigo"], VIS_PUB], ["entero", "Number", ["valor", "defecto"], VIS_PUB], ["decimal", "Number", ["valor"], VIS_PUB]]],

    ["SRV_CatalogoService", "CatalogoService", "SRV_CatalogoService.ts",
     [["logger", "Logger", VIS_PRI], ["dataSource", "DataSource", VIS_PRI]],
     [["construirFiltrosPublico", "Object", ["f"], VIS_PRI], ["consultarDisponibilidad", "Object", ["codigo"], VIS_PUB], ["listarPublico", "Object", ["f"], VIS_PUB], ["opcionesFiltros", "Object", [], VIS_PUB]]],

    ["SRV_DataSource", "DataSource", "TypeORM",
     [],
     [["getRepository", "Repository", ["entidad"], VIS_PUB], ["query", "Array", ["sql", "params"], VIS_PUB]]],

    ["CE_Producto", "Producto", "tabla productos",
     [["id_producto", "Integer", VIS_PRI], ["codigo", "String = 40 UNIQUE", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["descripcion", "Text", VIS_PUB], ["id_categoria", "Integer", VIS_PUB], ["id_temporada", "Integer", VIS_PUB], ["precio_base", "Decimal = 10,2", VIS_PUB], ["modelo_3d_url", "Text", VIS_PUB], ["estado", "String = Disponible", VIS_PUB], ["fecha_registro", "Timestamp", VIS_PUB]],
     []],

    ["CE_Categoria", "Categoria", "tabla categorias",
     [["id_categoria", "Integer", VIS_PRI], ["nombre", "String = 80 UNIQUE", VIS_PUB], ["descripcion", "Text", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_Talla", "Talla", "tabla tallas",
     [["id_talla", "Integer", VIS_PRI], ["nombre", "String = 10 UNIQUE", VIS_PUB], ["estado", "String = Activo", VIS_PUB], ["orden", "Integer", VIS_PUB]],
     []],

    ["CE_Color", "Color", "tabla colores",
     [["id_color", "Integer", VIS_PRI], ["nombre", "String = 50 UNIQUE", VIS_PUB], ["codigo_hex", "String = 7 UNIQUE", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_Temporada", "Temporada", "tabla temporadas",
     [["id_temporada", "Integer", VIS_PRI], ["nombre", "String = 80", VIS_PUB], ["fecha_inicio", "Date", VIS_PUB], ["fecha_fin", "Date", VIS_PUB], ["estado", "String = Programada", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "ProductoTallaColor", "tabla producto_talla_color",
     [["id_ptc", "Integer", VIS_PRI], ["id_producto", "Integer", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB], ["estado_stock", "String = Disponible", VIS_PUB]],
     []],

    ["CE_InventarioStock", "InventarioStock", "tabla inventario_stock",
     [["id_stock", "Integer", VIS_PRI], ["id_ptc", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["cantidad_disponible", "Integer", VIS_PUB], ["cantidad_reservada", "Integer", VIS_PUB], ["cantidad_vendida", "Integer", VIS_PUB], ["stock_minimo_alert", "Integer", VIS_PUB]],
     []],

    ["CE_ProductoImagen", "ProductoImagen", "tabla producto_imagenes",
     [["id_imagen", "Integer", VIS_PRI], ["id_producto", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB], ["url", "Text", VIS_PUB], ["es_principal", "Boolean", VIS_PUB], ["orden", "Integer", VIS_PUB]],
     []],

    ["CE_Sucursal", "Sucursal", "tabla sucursales",
     [["id_sucursal", "Integer", VIS_PRI], ["nombre", "String = 100", VIS_PUB], ["direccion", "Text", VIS_PUB], ["id_ciudad", "Integer", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["estado", "String = Activa", VIS_PUB], ["fecha_registro", "Timestamp", VIS_PUB]],
     []],

    ["CE_Ciudad", "Ciudad", "tabla ciudades",
     [["id_ciudad", "Integer", VIS_PRI], ["nombre", "String = 80 UNIQUE", VIS_PUB], ["pais", "String = 60", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_FiltrosPublico", "FiltrosPublico", "SRV_CatalogoService.ts",
     [["busqueda", "String", VIS_PUB], ["categoria", "Number", VIS_PUB], ["talla", "Number", VIS_PUB], ["color", "Number", VIS_PUB], ["temporada", "Number", VIS_PUB], ["precioMin", "Number", VIS_PUB], ["precioMax", "Number", VIS_PUB], ["pagina", "Number", VIS_PUB], ["limite", "Number", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Cliente", "Cliente", "puede agregar al carrito y reservar"],
    ["ACTOR_Visitante", "Visitante", "anonimo, sin sesion"]
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

function relacion(a, b, etiqueta, tipo, est, rolA, rolB, cA, cB) {
    if (a == null || b == null) return;
    var con = null;
    for (var i = 0; i < a.Connectors.Count; i++) {
        var c = a.Connectors.GetAt(i);
        if (c.SupplierID == b.ElementID) { con = c; break; }
    }
    if (con == null) {
        try { con = a.Connectors.AddNew("", tipo); } catch (e) { con = a.Connectors.AddNew("", "Association"); }
        con.ClientID = a.ElementID;
        con.SupplierID = b.ElementID;
        con.Update();
    }
    try { con.Name = etiqueta; } catch (e) { }
    try { con.Stereotype = est; } catch (e) { }
    try { con.SourceRole = rolA; } catch (e) { }
    try { con.DestinationRole = rolB; } catch (e) { }
    try { con.SourceCardinality = cA; } catch (e) { }
    try { con.DestinationCardinality = cB; } catch (e) { }
    try { con.FontSize = 7; } catch (e) { }
    try { con.Update(); } catch (e) { }
}

function main() {
    var cu = buscarPaquete(RAIZ, "Casos de Uso");
    if (cu == null) cu = RAIZ;
    var mod = buscarPaquete(cu, "2. Catálogo y Productos");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU16 - Análisis de clases");

    for (var d = paq.Diagrams.Count - 1; d >= 0; d--) {
        try { paq.Diagrams.GetAt(d).Delete(); } catch (e) { }
    }
    try { paq.Diagrams.Refresh(); } catch (e) { }

    var clases = [];
    for (var n = 0; n < DEF.length; n++) {
        var def = DEF[n];
        var c = buscarLocal(paq, def[0]);
        if (c == null) c = buscarLocal(paq, def[1]);
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
        nota(act, ACTORES[a][1] + ". " + ACTORES[a][2] + ".");
        try { act.Update(); } catch (e) { }
        actores[a] = act;
    }

    try { paq.Elements.Refresh(); } catch (e) { }

    var usaTexto = [];
    var conReal = [];
    var totalAtr = 0;
    var totalOpe = 0;

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
        INFORME.push(pad(d2[0], 22) + " atr " + totalDe(fin) + "/" + d2[3].length + "  ope " + totalDe(finOpe) + "/" + d2[4].length + (bien ? "  REAL" : "  TEXTO"));
    }

    var diag = null;
    try { diag = paq.Diagrams.AddNew("CU16 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
    if (diag == null) ERRORES.push("no se pudo crear el diagrama");

    if (diag != null) {
        diag.Update();
        try { paq.Diagrams.Refresh(); } catch (e) { }
        var COLX = [30, 300, 570, 840];
        var ANCHO = 250;

        for (var p = 0; p < actores.length; p++) {
            colocar(diag, actores[p], COLX[p], 25, 190, 100);
        }
        for (var k2 = 0; k2 < DEF.length; k2++) {
            var col = k2 % 4;
            var fila = 1 + Math.floor(k2 / 4);
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
        for (var r = 0; r < actores.length; r++) relacion(actores[r], C[0], "usuario", "Association", "", "actor", "catálogo", "1", "0..1");
        relacion(C[0], C[1], "detalle del producto", "Association", "", "catálogo", "detalle", "0..1", "1");
        relacion(C[0], C[2], "cliente HTTP", "Dependency", "uses", "catálogo", "cliente", "1", "1");
        relacion(C[0], C[16], "filtros aplicados", "Association", "", "catálogo", "filtros", "1", "1");
        relacion(C[1], C[2], "cliente HTTP", "Dependency", "uses", "detalle", "cliente", "1", "1");
        relacion(C[2], C[3], "punto de acceso HTTP", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        relacion(C[3], C[16], "parámetros de consulta", "Association", "", "controlador", "filtros", "1", "1");
        relacion(C[3], C[4], "servicio de catálogo", "Association", "", "controlador", "servicio", "1", "1");
        relacion(C[4], C[5], "consulta de catálogo", "Dependency", "uses", "catálogo", "datos", "1", "1");
        relacion(C[4], C[6], "productos publicados", "Dependency", "uses", "catálogo", "producto", "1", "0..*");
        relacion(C[4], C[7], "categoría del producto", "Association", "", "catálogo", "categoría", "0..1", "1");
        relacion(C[4], C[8], "tallas disponibles", "Association", "", "catálogo", "talla", "1", "0..*");
        relacion(C[4], C[9], "colores disponibles", "Association", "", "catálogo", "color", "1", "0..*");
        relacion(C[4], C[10], "temporada del producto", "Association", "", "catálogo", "temporada", "0..1", "1");
        relacion(C[4], C[11], "variantes del producto", "Dependency", "uses", "catálogo", "variante", "1", "0..*");
        relacion(C[4], C[12], "stock por variante", "Dependency", "uses", "catálogo", "stock", "1", "0..*");
        relacion(C[4], C[13], "imágenes del producto", "Dependency", "uses", "catálogo", "imagen", "1", "0..*");
        relacion(C[4], C[14], "sucursales con stock", "Dependency", "uses", "catálogo", "sucursal", "1", "0..*");
        relacion(C[4], C[15], "ciudad de la sucursal", "Association", "", "catálogo", "ciudad", "1", "0..*");
        relacion(C[6], C[7], "categoría del producto", "Association", "", "producto", "categoría", "0..1", "1");
        relacion(C[6], C[10], "temporada del producto", "Association", "", "producto", "temporada", "0..1", "1");
        relacion(C[6], C[13], "imágenes del producto", "Association", "", "producto", "imagen", "1", "0..*");
        relacion(C[11], C[6], "variante del producto", "Composition", "composition", "variante", "producto", "1", "1");
        relacion(C[11], C[8], "talla de la variante", "Association", "", "variante", "talla", "1", "1");
        relacion(C[11], C[9], "color de la variante", "Association", "", "variante", "color", "1", "1");
        relacion(C[12], C[11], "stock de la variante", "Association", "", "stock", "variante", "1", "1");
        relacion(C[12], C[14], "stock de la sucursal", "Association", "", "stock", "sucursal", "1", "1");
        relacion(C[14], C[15], "ciudad de la sucursal", "Association", "", "sucursal", "ciudad", "0..1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("Los mensajes y las excepciones de CU16 solo estan en el diagrama de comunicacion.");
        N.push("");
        N.push("2 actores, 17 clases y 28 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (3), CTR_ controlador (1), SRV_ servicio (2), CE_ entidad o DTO (11).");
        N.push("");
        N.push("HALLAZGO CRITICO: porcentaje_iva NO existe en productos.");
        N.push("");
        N.push("Es el mismo problema de CU13, y aqui el impacto es mayor porque este caso es PUBLICO.");
        N.push("listarPublico selecciona p.porcentaje_iva y calcula en SQL");
        N.push("ROUND(p.precio_base * (1 + p.porcentaje_iva / 100.0), 2) AS precio_con_iva, y");
        N.push("consultarDisponibilidad trae p.porcentaje_iva en su primer SELECT. La tabla productos de");
        N.push("schema.sql no tiene esa columna y no hay ALTER TABLE ni carpeta migrations. Si la base no se");
        N.push("altero a mano, el catalogo publico falla por completo.");
        N.push("");
        N.push("DISCREPANCIAS CON EL CASO DE USO, verificadas contra el codigo real:");
        N.push("");
        N.push("1. Hay CUATRO endpoints publicos, no los tres del caso. El controlador expone:");
        N.push("   GET catalogo/publico");
        N.push("   GET catalogo/publico/opciones                      -> el caso no lo menciona");
        N.push("   GET catalogo/publico/:codigo");
        N.push("   GET catalogo/publico/:codigo/disponibilidad         -> el caso no lo menciona");
        N.push("   Y los dos ultimos ejecutan EXACTAMENTE la misma funcion consultarDisponibilidad(codigo).");
        N.push("   Son dos endpoints identicos, uno de ellos redundante.");
        N.push("");
        N.push("2. El caso omitio que el catalogo tiene scroll infinito, ademas de la paginacion. En");
        N.push("   Catalogo.tsx estan cargandoMas y cargarMas(), que pide paginaCargada.current + 1 con");
        N.push("   limite 20 y agrega al final de la lista. paginaCargada es un useRef, no estado, para que");
        N.push("   el efecto de carga no se dispare en bucle.");
        N.push("");
        N.push("3. El debounce de 300 ms si coincide, y se implementa con un useRef que guarda el");
        N.push("   setTimeout: busquedaDebounce.current = setTimeout(recargar, 300). Se dispara cada vez que");
        N.push("   cambia el campo de busqueda, no en los demas filtros.");
        N.push("");
        N.push("4. E1 no produce ningun error de backend. Cuando no hay resultados, listarPublico hace un");
        N.push("   cortocircuito temprano: si el total es 0 devuelve { items: [], total: 0 } sin ejecutar la");
        N.push("   segunda consulta. El texto No se encontraron prendas con los filtros seleccionados.");
        N.push("   lo pone el frontend.");
        N.push("");
        N.push("5. Los filtros mal formados se IGNORAN en silencio en lugar de dar error. decimal()");
        N.push("   devuelve undefined cuando Number.isNaN(n) o n < 0, y entero() devuelve el valor por");
        N.push("   defecto cuando el valor no es entero. O sea, precio_min=abc o precio_min=-5 no producen");
        N.push("   422: simplemente no filtran. El caso no anticipa este comportamiento.");
        N.push("");
        N.push("6. E2 si coincide: 422 Rango de precio invalido. cuando precioMin > precioMax, pero solo");
        N.push("   si AMBOS vienen informados. Con uno solo no hay nada que comparar y no hay error.");
        N.push("");
        N.push("7. E3 tiene un matiz: el 404 Prenda no encontrada. se dispara cuando no hay un producto");
        N.push("   ACTIVO con ese codigo, no solo cuando el codigo no existe. El WHERE es");
        N.push("   LOWER(p.codigo) = LOWER($1) AND LOWER(p.estado) = 'activo', asi que un producto inactivo");
        N.push("   con SKU existente es indistinguible de uno inexistente. El caso no lo aclara.");
        N.push("");
        N.push("8. limite se acota entre 1 y 100 con la constante LIMITE_MAX = 100 y");
        N.push("   Math.min(Math.max(..., 1), 100); pagina tiene default 1. El caso solo dice limite=20.");
        N.push("");
        N.push("9. El orden es ORDER BY p.nombre ASC, alfabetico por nombre. No es por fecha, por codigo");
        N.push("   ni por novedad. El caso no especifica el criterio de orden.");
        N.push("");
        N.push("10. El total se cuenta aparte con SELECT COUNT(DISTINCT p.id_producto)::int, necesario");
        N.push("    porque el listado usa SELECT DISTINCT. Y las tallas y colores del listado se resuelven");
        N.push("    en una TERCERA consulta, con ARRAY(SELECT DISTINCT ...) y = ANY($1::int[]), agrupadas");
        N.push("    por producto y filtrando LOWER(estado) = 'activo' en tallas y colores.");
        N.push("");
        N.push("11. El filtro de stock es EXISTS con cantidad_disponible > 0 y NO descuenta la cantidad");
        N.push("    reservada, tal como admite el caso. Y el detalle por sucursal tampoco lo descuenta:");
        N.push("    expone disponible y reservada por separado en cada linea, y marca");
        N.push("    stock_bajo = stockMinimo > 0 && disponible <= stockMinimo.");
        N.push("");
        N.push("12. El detalle agrupa el stock en un Map por sucursal y la consulta exige ademas");
        N.push("    LOWER(s.estado) = 'activa' y hace JOIN con ciudades. Como sucursales.id_ciudad es");
        N.push("    nullable, el JOIN INNER descarta cualquier sucursal sin ciudad del detalle.");
        N.push("");
        N.push("13. La busqueda textual es ILIKE sobre p.nombre unicamente. No busca en codigo, ni en");
        N.push("    descripcion, ni en el nombre de la categoria. El caso dice busqueda por texto sin");
        N.push("    especificar el campo.");
        N.push("");
        N.push("14. El precio con IVA se calcula con dos formulas distintas: en el listado, en SQL con");
        N.push("    ROUND(precio_base * (1 + porcentaje_iva / 100.0), 2); y en el detalle, en JavaScript con");
        N.push("    Math.round(precio * (1 + iva / 100) * 100) / 100. Deberian dar el mismo valor pero no");
        N.push("    comparten codigo.");
        N.push("");
        N.push("15. Confirmado que el acceso es publico: el CatalogoController NO lleva @UseGuards, a");
        N.push("    diferencia de todos los controladores de administracion del proyecto. El caso lo dice bien.");
        N.push("");
        N.push("16. Vocabulario de estados: productos se filtran con 'activo' (sin tilde), temporadas con");
        N.push("    'activa', sucursales con 'activa' y categorias, tallas y colores con 'activo'. Y el");
        N.push("    default de productos.estado en el esquema es 'Disponible', que no corresponde a");
        N.push("    ninguno de esos valores. Un producto recien insertado que conserve el default no aparece");
        N.push("    en el catalogo.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU16 - CONSULTAR CATALOGO CON FILTROS - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 88");
    T.push("Operaciones reales: " + totalOpe + " de 23");
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
    msg = msg + "CU16 - Consultar catalogo con filtros" + SALTO + SALTO;
    msg = msg + "Clases: 17    Actores: 2    Relaciones: 28" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 88" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 23" + SALTO;
    msg = msg + "AVISO: porcentaje_iva no existe en productos." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU16 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU16 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU16", 0); } catch (e3) { }
}
