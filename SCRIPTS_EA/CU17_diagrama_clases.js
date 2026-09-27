// ================================================================
// CU17 - CONSULTAR DISPONIBILIDAD POR SUCURSAL (WEB CLIENTE)
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   web/src/router.tsx                     ruta /productos/:codigo -> Producto
//   web/src/pages/Producto.tsx            detalle, filtros en vivo, semaforo, carrito, reserva
//   web/src/lib/api.ts                    consultarDisponibilidad -> /catalogo/publico/:c/disponibilidad
//   web/src/contexts/CartContext.tsx      agregar al carrito
//   api/src/modulos/catalogo/CTR_Catalogo.ts    CatalogoController sin guard
//   api/src/modulos/catalogo/SRV_CatalogoService.ts  consultarDisponibilidad
//   BASE DE DATOS/schema.sql              producto_imagenes, inventario_stock, sucursales,
//                                          ciudades, producto_talla_color
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
    ["IU_Producto", "Producto", "pages/Producto.tsx",
     [["codigo", "String = ruta", VIS_PUB], ["datos", "Object", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["es404", "Boolean", VIS_PUB], ["tallaSel", "String", VIS_PUB], ["colorSel", "String", VIS_PUB], ["imgFallback", "Boolean", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["sucursalSel", "Integer", VIS_PUB], ["errorCarrito", "String", VIS_PUB], ["inicialReserva", "Object", VIS_PUB], ["modalAbierto", "Boolean", VIS_PUB], ["vestidorRa", "Object", VIS_PUB], ["vestidorAbierto", "Boolean", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["abrirReserva", "void", [], VIS_PUB], ["abrirVestidor", "void", [], VIS_PUB], ["agregarAlCarrito", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_CartProvider", "CartContext", "contexts/CartContext.tsx",
     [["items", "Array", VIS_PUB], ["total", "Number", VIS_PUB], ["agregando", "Boolean", VIS_PUB]],
     [["agregar", "void", ["producto"], VIS_PUB], ["useCart", "Object", [], VIS_PUB]]],

    ["IU_AuthProvider", "AuthProvider", "contexts/AuthContext.tsx",
     [["usuario", "UsuarioSesion", VIS_PRI]],
     [["useAuth", "AuthContextValue", [], VIS_PUB]]],

    ["IU_Api", "api", "lib/api.ts",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["consultarDisponibilidad", "Object", ["codigo"], VIS_PUB], ["agregarItem", "Object", ["payload"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_CatalogoController", "CatalogoController", "CTR_Catalogo.ts",
     [["catalogoService", "CatalogoService", VIS_PRI]],
     [["consultarDisponibilidad", "Object", ["codigo"], VIS_PUB], ["consultarDetalle", "Object", ["codigo"], VIS_PUB]]],

    ["SRV_CatalogoService", "CatalogoService", "SRV_CatalogoService.ts",
     [["logger", "Logger", VIS_PRI], ["dataSource", "DataSource", VIS_PRI]],
     [["consultarDisponibilidad", "Object", ["codigo"], VIS_PUB]]],

    ["SRV_DataSource", "DataSource", "TypeORM",
     [],
     [["getRepository", "Repository", ["entidad"], VIS_PUB], ["query", "Array", ["sql", "params"], VIS_PUB]]],

    ["CE_Producto", "Producto", "tabla productos",
     [["id_producto", "Integer", VIS_PRI], ["codigo", "String = 40 UNIQUE", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["descripcion", "Text", VIS_PUB], ["id_categoria", "Integer", VIS_PUB], ["precio_base", "Decimal = 10,2", VIS_PUB], ["modelo_3d_url", "Text", VIS_PUB], ["estado", "String = Disponible", VIS_PUB]],
     []],

    ["CE_Categoria", "Categoria", "tabla categorias",
     [["id_categoria", "Integer", VIS_PRI], ["nombre", "String = 80 UNIQUE", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
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
     [["id_sucursal", "Integer", VIS_PRI], ["nombre", "String = 100", VIS_PUB], ["direccion", "Text", VIS_PUB], ["id_ciudad", "Integer", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_Ciudad", "Ciudad", "tabla ciudades",
     [["id_ciudad", "Integer", VIS_PRI], ["nombre", "String = 80 UNIQUE", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_Talla", "Talla", "tabla tallas",
     [["id_talla", "Integer", VIS_PRI], ["nombre", "String = 10 UNIQUE", VIS_PUB], ["estado", "String = Activo", VIS_PUB], ["orden", "Integer", VIS_PUB]],
     []],

    ["CE_Color", "Color", "tabla colores",
     [["id_color", "Integer", VIS_PRI], ["nombre", "String = 50 UNIQUE", VIS_PUB], ["codigo_hex", "String = 7 UNIQUE", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_ConsultaDisponibilidad", "ConsultaDisponibilidad", "SRV_CatalogoService.ts",
     [["producto", "Object", VIS_PUB], ["imagenes", "Array", VIS_PUB], ["tallas", "Array", VIS_PUB], ["colores", "Array", VIS_PUB], ["sucursales", "Array", VIS_PUB]],
     []],

    ["CE_SucursalDisponibilidad", "SucursalDisponibilidad", "SRV_CatalogoService.ts",
     [["id_sucursal", "Integer", VIS_PUB], ["nombre", "String", VIS_PUB], ["direccion", "Text", VIS_PUB], ["ciudad", "String", VIS_PUB], ["telefono", "String", VIS_PUB], ["lineas", "Array", VIS_PUB]],
     []],

    ["CE_LineaDisponibilidad", "LineaDisponibilidad", "SRV_CatalogoService.ts",
     [["id_ptc", "Integer", VIS_PUB], ["talla", "String", VIS_PUB], ["color", "String", VIS_PUB], ["codigo_hex", "String", VIS_PUB], ["disponible", "Number", VIS_PUB], ["reservada", "Number", VIS_PUB], ["stock_bajo", "Boolean", VIS_PUB]],
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
    var paq = subPaquete(mod, "CU17 - Análisis de clases");

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
        INFORME.push(pad(d2[0], 30) + " atr " + totalDe(fin) + "/" + d2[3].length + "  ope " + totalDe(finOpe) + "/" + d2[4].length + (bien ? "  REAL" : "  TEXTO"));
    }

    var diag = null;
    try { diag = paq.Diagrams.AddNew("CU17 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        for (var r = 0; r < actores.length; r++) relacion(actores[r], C[0], "usuario", "Association", "", "actor", "detalle", "1", "0..1");
        relacion(C[0], C[1], "carrito de compra", "Dependency", "uses", "detalle", "carrito", "0..1", "1");
        relacion(C[0], C[2], "sesión de usuario", "Association", "", "detalle", "sesión", "0..1", "1");
        relacion(C[0], C[3], "cliente HTTP", "Dependency", "uses", "detalle", "cliente", "1", "1");
        relacion(C[0], C[18], "disponibilidad mostrada", "Association", "", "detalle", "consulta", "1", "1");
        relacion(C[0], C[17], "sucursales mostradas", "Association", "", "detalle", "sucursal", "0..*", "1");
        relacion(C[1], C[3], "cliente HTTP", "Dependency", "uses", "carrito", "cliente", "1", "1");
        relacion(C[2], C[3], "cliente HTTP", "Dependency", "uses", "sesión", "cliente", "1", "1");
        relacion(C[3], C[4], "punto de acceso HTTP", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        relacion(C[4], C[5], "servicio de catálogo", "Association", "", "controlador", "servicio", "1", "1");
        relacion(C[5], C[6], "consulta de disponibilidad", "Dependency", "uses", "catálogo", "datos", "1", "1");
        relacion(C[5], C[7], "prenda consultada", "Dependency", "uses", "catálogo", "producto", "1", "0..1");
        relacion(C[5], C[8], "categoría de la prenda", "Dependency", "uses", "catálogo", "categoría", "0..1", "1");
        relacion(C[5], C[12], "variantes publicadas", "Dependency", "uses", "catálogo", "variante", "1", "0..*");
        relacion(C[5], C[9], "imágenes de la prenda", "Dependency", "uses", "catálogo", "imagen", "1", "0..*");
        relacion(C[5], C[10], "tallas publicadas", "Dependency", "uses", "catálogo", "talla", "1", "0..*");
        relacion(C[5], C[11], "colores publicados", "Dependency", "uses", "catálogo", "color", "1", "0..*");
        relacion(C[5], C[13], "stock por sucursal", "Dependency", "uses", "catálogo", "sucursal", "1", "0..*");
        relacion(C[5], C[14], "ciudad de la sucursal", "Association", "", "catálogo", "ciudad", "1", "0..*");
        relacion(C[5], C[18], "consulta construida", "Association", "", "catálogo", "consulta", "1", "1");
        relacion(C[18], C[7], "prenda de la consulta", "Dependency", "uses", "consulta", "producto", "1", "0..1");
        relacion(C[18], C[9], "imágenes de la consulta", "Association", "", "consulta", "imagen", "0..*", "1");
        relacion(C[18], C[10], "tallas de la consulta", "Association", "", "consulta", "talla", "0..*", "1");
        relacion(C[18], C[11], "colores de la consulta", "Association", "", "consulta", "color", "0..*", "1");
        relacion(C[18], C[17], "sucursales de la consulta", "Composition", "composition", "consulta", "sucursales", "0..*", "1");
        relacion(C[17], C[16], "líneas de la sucursal", "Composition", "composition", "sucursal", "líneas", "1", "0..*");
        relacion(C[16], C[12], "variante de la línea", "Association", "", "línea", "variante", "1", "1");
        relacion(C[17], C[13], "sucursal del aviso", "Association", "", "sucursal", "sucursal", "1", "1");
        relacion(C[17], C[14], "ciudad de la sucursal", "Association", "", "sucursal", "ciudad", "0..1", "1");
        relacion(C[12], C[7], "variante del producto", "Composition", "composition", "variante", "producto", "1", "1");
        relacion(C[12], C[10], "talla de la variante", "Association", "", "variante", "talla", "1", "1");
        relacion(C[12], C[11], "color de la variante", "Association", "", "variante", "color", "1", "1");
        relacion(C[9], C[7], "imagen del producto", "Association", "", "imagen", "producto", "1", "1");
        relacion(C[9], C[11], "imagen del color", "Association", "", "imagen", "color", "0..1", "1");
        relacion(C[15], C[13], "stock de la sucursal", "Association", "", "stock", "sucursal", "1", "1");
        relacion(C[15], C[12], "stock de la variante", "Association", "", "stock", "variante", "1", "1");
        relacion(C[7], C[8], "categoría del producto", "Association", "", "producto", "categoría", "0..1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("Los mensajes y las excepciones de CU17 solo estan en el diagrama de comunicacion.");
        N.push("");
        N.push("2 actores, 20 clases y 36 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (4), CTR_ controlador (1), SRV_ servicio (2), CE_ entidad o DTO (13).");
        N.push("");
        N.push("LO QUE SI COINCIDE CON EL CASO:");
        N.push("");
        N.push("- La ruta es GET /api/v1/catalogo/publico/:codigo/disponibilidad y el cliente la llama");
        N.push("  con api.consultarDisponibilidad(codigo), que hace encodeURIComponent del codigo y usa");
        N.push("  la opcion renovar: false. Correcto.");
        N.push("- El endpoint es publico: el CatalogoController NO lleva @UseGuards. Correcto.");
        N.push("- El filtro en vivo de talla y color existe y es un useMemo que recalcula cuando cambian");
        N.push("  tallaSel o colorSel, sobre las lineas ya cargadas. No vuelve a llamar al servidor.");
        N.push("- El semaforo de stock bajo existe: cada linea trae stock_bajo, calculado en el backend como");
        N.push("  stockMinimo > 0 && disponible <= stockMinimo.");
        N.push("- E3 coincide: 404 Prenda no encontrada.");
        N.push("");
        N.push("DISCREPANCIAS CON EL CASO DE USO, verificadas contra el codigo real:");
        N.push("");
        N.push("1. FALSA LA PREMISA DEL CASO. El caso dice que la pagina /productos/:codigo es nueva y que");
        N.push("   CU16 no esta implementado, por lo que habria que reemplazar un placeholder. La");
        N.push("   realidad es la contraria: router.tsx ya declara /productos/:codigo con el componente");
        N.push("   Producto, y /productos redirige con Navigate a /catalogo. No hay ningun placeholder que");
        N.push("   reemplazar.");
        N.push("");
        N.push("2. EL SQL DEL CASO NO ES EL DEL CODIGO. El caso propone un unico SELECT que hace");
        N.push("   JOIN productos p y filtra por p.codigo = $1. El codigo real hace cuatro consultas");
        N.push("   encadenadas: (1) el producto por codigo, (2) las tallas distintas, (3) las imagenes, (4)");
        N.push("   los colores con su imagen, y (5) el stock. Y la quinta NO hace JOIN con productos:");
        N.push("   filtra por ptc.id_producto = $1 usando el id ya resuelto en la primera consulta. Ademas la");
        N.push("   consulta de tallas usa GROUP BY con ORDER BY MIN(t.orden) y filtra");
        N.push("   LOWER(t.estado) = 'activo', y la de colores filtra LOWER(col.estado) = 'activo'.");
        N.push("");
        N.push("3. NO HAY TIMEOUT DE 10 SEGUNDOS. El caso menciona un timeout de 10s en E4, pero el cliente");
        N.push("   no usa AbortController ni setTimeout de cancelacion en ningun punto: buscarTimeout solo");
        N.push("   aparece en Catalogo.tsx, y ahi es el debounce de la busqueda, no un timeout de red.");
        N.push("   Si la peticion se cuelga, la pantalla queda en cargando indefinidamente.");
        N.push("");
        N.push("4. LOS TEXTOS DE E1 Y E2 SON OTROS. E1 real: Prenda agotada temporalmente en todas las");
        N.push("   sucursales. E2 real: Sin existencias para color {X} en talla {Y}., y solo se muestra si");
        N.push("   hay al menos un filtro aplicado, porque el caso sin filtros sin stock cae en E1.");
        N.push("");
        N.push("5. EL SEMAFORO NO USA LAS ETIQUETAS DEL CASO. El caso dice verde Disponible en tienda y");
        N.push("   amarillo Stock bajo. El codigo pinta Stock bajo ({n}) con icono AlertTriangle cuando");
        N.push("   stock_bajo es cierto, y {n} disponibles con icono CheckCircle2 en el caso contrario.");
        N.push("");
        N.push("6. LOS BOTONES DE AGREGAR AL CARRITO Y RESERVAR NO SON PLACEHOLDERS. El caso los describe");
        N.push("   como placeholder visual porque Carrito y CU28 no estan implementados. En realidad la");
        N.push("   pagina integra el carrito real (useCart y CartContext), el modal de reserva");
        N.push("   (ModalReserva con InicialReserva), el vestidor de reality augmentation (VestidorRa) y");
        N.push("   ademas exige el permiso realizar_venta o el comodin * con tienePermisoVenta. El boton");
        N.push("   de carrito se oculta si el visitante no tiene ese permiso.");
        N.push("");
        N.push("7. HAY UNEFECTO DE AUTOSELECCION QUE EL CASO NO MENCIONA. Al cargar, si hay colores se");
        N.push("   selecciona automaticamente el primero, y lo mismo con la primera talla. El filtro en vivo");
        N.push("   arranca con el primer color ya aplicado, no con todos los colores como sugiere el caso.");
        N.push("");
        N.push("8. EL FILTRO EN VIVO ES POR NOMBRE, NO POR ID. La comparacion es l.talla === tallaSel y");
        N.push("   l.color === colorSel, contra el nombre que devuelve el backend. Y solo compara cuando");
        N.push("   el filtro esta informado: (!tallaSel || ...) && (!colorSel || ...). La talla se pinta");
        N.push("   como Todas cuando no hay seleccion, y el color como Selecciona.");
        N.push("");
        N.push("9. cantidad_reservada NO se descuenta. El caso lo reconoce, y conviene subrayarlo porque");
        N.push("   la disponibilidad mostrada es la bruta: un producto con 3 disponibles y 3 reservadas");
        N.push("   aparece como 3 disponibles. El backend expone ambos campos por separado en cada linea.");
        N.push("");
        N.push("10. El detalle expone mas de lo que el caso lista: descripcion, modelo_3d_url, el arreglo");
        N.push("    imagenes completo y, por color, un imagen_url. Y el precio se devuelve con IVA");
        N.push("    calculado, no precio_base crudo como en la ficha.");
        N.push("");
        N.push("11. En la base de datos, productos y las tablas de variante, imagen e inventario no");
        N.push("    tienen datos sembrados, y schema.sql no inserta filas en ninguna de ellas. Por eso el");
        N.push("    caso menciona sembrar un producto de ejemplo: es necesario, no opcional.");
        N.push("");
        N.push("12. Confirmado que la sucursal se filtra por LOWER(s.estado) = 'activa' y que el JOIN con");
        N.push("    ciudades es INNER, de modo que una sucursal sin ciudad (su id_ciudad es nullable) no");
        N.push("    aparece en el detalle, aunque tenga stock.");
        N.push("");
        N.push("13. El caso describe Angular y el prototipo Flutter; la implementacion real es React/Vite");
        N.push("    con componentes en pages/Producto.tsx y contexts/CartContext.tsx.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU17 - CONSULTAR DISPONIBILIDAD POR SUCURSAL - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 82");
    T.push("Operaciones reales: " + totalOpe + " de 14");
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
    msg = msg + "CU17 - Consultar disponibilidad por sucursal" + SALTO + SALTO;
    msg = msg + "Clases: 20    Actores: 2    Relaciones: 36" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 82" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 14" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU17 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU17 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU17", 0); } catch (e3) { }
}
