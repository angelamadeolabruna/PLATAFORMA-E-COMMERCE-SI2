// ================================================================
// PRUEBA API v7 - ¿Enterprise Architect crea atributos y operaciones
// por script en esta maquina?
//
// Crea el paquete "PRUEBA API v7", genera 24 elementos probando
// distintas combinaciones de tipo de elemento y de llamada a la API,
// y deja el informe completo dentro del modelo. Al final lanza un
// error con un resumen corto para verlo de inmediato.
//
// El paquete se limpia y se vuelve a generar en cada ejecucion.
//
// SIN POPUPS. Al terminar queda un solo elemento: "INFORME v7".
// ================================================================

var SALTO = String.fromCharCode(10);
var raiz = Repository.Models.GetAt(0);
var NOPAQ = "PRUEBA API v7";
var seq = 0;
var full = [];
var corto = [];

// ---------------------------------------------------------------
// 1. PAQUETE DE PRUEBA
// ---------------------------------------------------------------
var paq = null;
for (var i = 0; i < raiz.Packages.Count; i++) {
    if (String(raiz.Packages.GetAt(i).Name) == NOPAQ) paq = raiz.Packages.GetAt(i);
}
if (paq == null) {
    paq = raiz.Packages.AddNew(NOPAQ, "");
    paq.Update();
    raiz.Packages.Refresh();
}

for (var d = paq.Diagrams.Count - 1; d >= 0; d--) {
    try { paq.Diagrams.Delete(paq.Diagrams.GetAt(d)); } catch (e0) { }
}
for (var x = paq.Elements.Count - 1; x >= 0; x--) {
    try { paq.Elements.Delete(paq.Elements.GetAt(x)); } catch (e1) { }
}
try { paq.Elements.Refresh(); } catch (e2) { }

// ---------------------------------------------------------------
// 2. UTILIDADES
// ---------------------------------------------------------------

function pad(s, n) {
    var t = String(s);
    while (t.length < n) t = t + ".";
    return t;
}

function crear(tipo) {
    var nombre = "P" + seq;
    seq = seq + 1;
    var el = null;
    try {
        el = paq.Elements.AddNew(nombre, tipo);
    } catch (e) {
        el = null;
    }
    if (el != null) {
        try { el.Update(); } catch (e3) { }
        try { paq.Elements.Refresh(); } catch (e4) { }
    }
    return el;
}

function crearSinTipo() {
    var nombre = "P" + seq;
    seq = seq + 1;
    var el = null;
    try { el = paq.Elements.AddNew(nombre); } catch (e) { el = null; }
    if (el != null) {
        try { el.Update(); } catch (e3) { }
        try { paq.Elements.Refresh(); } catch (e4) { }
    }
    return el;
}

function crearConClassifier() {
    var nombre = "P" + seq;
    seq = seq + 1;
    var el = null;
    try { el = paq.Elements.AddNew(nombre, "Class", 0); } catch (e) { el = null; }
    if (el != null) {
        try { el.Update(); } catch (e3) { }
        try { paq.Elements.Refresh(); } catch (e4) { }
    }
    return el;
}

// atributos/metodos del objeto en memoria
function medir(el) {
    if (el == null) return "sinElemento";
    var a = "x";
    var m = "x";
    try { a = el.Attributes.Count; } catch (e) { }
    try { m = el.Methods.Count; } catch (e) { }
    return a + "/" + m;
}

// atributos/metodos tras releer del repositorio
function medirFresco(id) {
    var f = null;
    try { f = Repository.Models.GetByID(id); } catch (e) { return "noRefetch"; }
    if (f == null) return "noRefetch";
    var a = "x";
    var m = "x";
    try { a = f.Attributes.Count; } catch (e) { }
    try { m = f.Methods.Count; } catch (e) { }
    return a + "/" + m;
}

// atributos tras releer de la coleccion del paquete
function medirPorPaquete(id) {
    for (var k = 0; k < paq.Elements.Count; k++) {
        var x = paq.Elements.GetAt(k);
        if (x.ElementID == id) {
            var a = "x";
            try { a = x.Attributes.Count; } catch (e) { }
            return String(a);
        }
    }
    return "no";
}

function anota(etiqueta, detalle) {
    full.push(pad(etiqueta, 46) + " " + detalle);
    corto.push(etiqueta + "=" + detalle);
}

function intentar(etiqueta, fn, el) {
    if (el == null) { anota(etiqueta, "NO SE PUDO CREAR EL ELEMENTO"); return; }
    var r;
    try { fn(); r = "llamada ok"; }
    catch (e) { r = "EXCEPCION " + (e.message ? e.message : e); }
    try { el.Update(); } catch (e2) { }
    anota(etiqueta, r + " | memoria " + medir(el) + " | refrescado " + medirFresco(el.ElementID) + " | paquete " + medirPorPaquete(el.ElementID));
}

// ---------------------------------------------------------------
// 3. SUPERFICIE DE LA API  (lo mas importante)
// ---------------------------------------------------------------
var p0 = crear("Class");
var sup = [];
var v;

try { v = String(p0.Type); } catch (e) { v = "ERR"; }
sup.push("Type=" + v);
try { v = String(p0.Stereotype); } catch (e) { v = "ERR"; }
sup.push("Stereotype=[" + v + "]");
try { v = String(p0.ClassifierID); } catch (e) { v = "ERR"; }
sup.push("ClassifierID=" + v);
try { v = String(p0.ObjectID); } catch (e) { v = "ERR"; }
sup.push("ObjectID=" + v);
try { v = String(p0.ElementID); } catch (e) { v = "ERR"; }
sup.push("ElementID=" + v);

try { v = typeof p0.Attributes; } catch (e) { v = "ERR"; }
sup.push("typeof Attributes=" + v);
try { v = (p0.Attributes == null) ? "es null" : "Attributes.Count=" + p0.Attributes.Count; } catch (e) { v = "ERR al leer Count"; }
sup.push(v);

try { v = typeof p0.Methods; } catch (e) { v = "ERR"; }
sup.push("typeof Methods=" + v);
try { v = (p0.Methods == null) ? "es null" : "Methods.Count=" + p0.Methods.Count; } catch (e) { v = "ERR al leer Count"; }
sup.push(v);

try { v = typeof p0.Operations; } catch (e) { v = "ERR"; }
sup.push("typeof Operations=" + v);
try { v = typeof p0.AddAttribute; } catch (e) { v = "ERR"; }
sup.push("typeof AddAttribute=" + v);
try { v = typeof p0.AddOperation; } catch (e) { v = "ERR"; }
sup.push("typeof AddOperation=" + v);
try { v = typeof p0.AddMethod; } catch (e) { v = "ERR"; }
sup.push("typeof AddMethod=" + v);
try { v = typeof p0.Stereotypes; } catch (e) { v = "ERR"; }
sup.push("typeof Stereotypes=" + v);
try { v = typeof p0.Notes; } catch (e) { v = "ERR"; }
sup.push("typeof Notes=" + v);
try { v = typeof p0.Alias; } catch (e) { v = "ERR"; }
sup.push("typeof Alias=" + v);
try { v = typeof p0.Connectors; } catch (e) { v = "ERR"; }
sup.push("typeof Connectors=" + v);
try { v = typeof p0.Diagrams; } catch (e) { v = "ERR"; }
sup.push("typeof Diagrams=" + v);
try { v = String(Repository.CurrentPerspective); } catch (e) { v = "ERR"; }
sup.push("Repository.CurrentPerspective=" + v);
try { v = String(Repository.GetCurrentPerspective()); } catch (e) { v = "ERR"; }
sup.push("GetCurrentPerspective()=" + v);

full.push("");
full.push("=== SUPERFICIE DE LA API sobre un Class recien creado ===");
for (var s = 0; s < sup.length; s++) full.push(sup[s]);
full.push("");

// ---------------------------------------------------------------
// 4. CLASE PLANO SIN ESTEREOTIPO - SIGNATURE VARIADAS
// ---------------------------------------------------------------
var a1 = crear("Class");
intentar("A1 Class, Attributes.AddNew(nombre, tipo)", function () { a1.Attributes.AddNew("campo", "String"); }, a1);

var a2 = crear("Class");
intentar("A2 Class, Attributes.AddNew(n,t,notas)", function () { a2.Attributes.AddNew("campo", "String", "nota"); }, a2);

var a3 = crear("Class");
intentar("A3 Class, Attributes.AddNew(n,t,notas,vis)", function () { a3.Attributes.AddNew("campo", "String", "", 0); }, a3);

var a4 = crear("Class");
intentar("A4 Class, Attributes.AddNew(n,t,notas,vis,col)", function () { a4.Attributes.AddNew("campo", "String", "", 0, 0); }, a4);

var a5 = crear("Class");
intentar("A5 Class, AddAttribute(nombre, tipo)", function () { a5.AddAttribute("campo", "String"); }, a5);

var a6 = crear("Class");
intentar("A6 Class, AddAttribute(nombre, tipo, notas)", function () { a6.AddAttribute("campo", "String", "nota"); }, a6);

// ---------------------------------------------------------------
// 5. CONFIRMAR EL ELEMENTO ANTES DE ANADIR
// ---------------------------------------------------------------
var b1 = crear("Class");
try { b1.Update(); } catch (e) { }
intentar("B1 Class, Update previo y luego AddNew(2)", function () { b1.Attributes.AddNew("campo", "String"); }, b1);

var b2 = crear("Class");
try { b2.Update(); } catch (e) { }
var b2f = null;
try { b2f = Repository.Models.GetByID(b2.ElementID); } catch (e) { }
intentar("B2 Class releida con GetByID y luego AddNew(2)", function () { b2f.Attributes.AddNew("campo", "String"); b2f.Update(); }, b2);

var b3 = crear("Class");
var b3f = null;
for (var k3 = 0; k3 < paq.Elements.Count; k3++) {
    if (paq.Elements.GetAt(k3).ElementID == b3.ElementID) { b3f = paq.Elements.GetAt(k3); break; }
}
intentar("B3 Class releida del paquete y luego AddNew(2)", function () { b3f.Attributes.AddNew("campo", "String"); b3f.Update(); }, b3);

// ---------------------------------------------------------------
// 6. CLASE CON ESTEREOTIPO
// ---------------------------------------------------------------
var c1 = crear("Class");
try { c1.Stereotype = "Entity"; c1.Update(); } catch (e) { }
intentar("C1 Class estereotipo Entity, AddNew(2)", function () { c1.Attributes.AddNew("campo", "String"); }, c1);

var c2 = crear("Class");
try { c2.Stereotype = "Boundary"; c2.Update(); } catch (e) { }
intentar("C2 Class estereotipo Boundary, AddNew(2)", function () { c2.Attributes.AddNew("campo", "String"); }, c2);

// ---------------------------------------------------------------
// 7. OTRAS FORMAS DE CREAR LA CLASE
// ---------------------------------------------------------------
var d1 = crearSinTipo();
intentar("D1 AddNew(nombre) sin tipo, AddNew(2)", function () { d1.Attributes.AddNew("campo", "String"); }, d1);

var d2 = crearConClassifier();
intentar("D2 AddNew(nombre,Class,0) ClassifierID 0", function () { d2.Attributes.AddNew("campo", "String"); }, d2);

var e1 = crear("Object");
intentar("E1 tipo Object, Attributes.AddNew(2)", function () { e1.Attributes.AddNew("campo", "String"); }, e1);

var e2 = crear("Interface");
intentar("E2 tipo Interface, Attributes.AddNew(2)", function () { e2.Attributes.AddNew("campo", "String"); }, e2);

var e3 = crear("Element");
intentar("E3 tipo Element, Attributes.AddNew(2)", function () { e3.Attributes.AddNew("campo", "String"); }, e3);

// ---------------------------------------------------------------
// 8. OPERACIONES
// ---------------------------------------------------------------
var f1 = crear("Class");
intentar("F1 Class, Methods.AddNew(n,ret,param,notas)", function () { f1.Methods.AddNew("operacion", "void", "", ""); }, f1);

var f2 = crear("Class");
intentar("F2 Class, Methods.AddNew(nombre, retorno)", function () { f2.Methods.AddNew("operacion", "void"); }, f2);

var f3 = crear("Class");
intentar("F3 Class, Operations.AddNew(n,ret,param,notas)", function () { f3.Operations.AddNew("operacion", "void", "", ""); }, f3);

var f4 = crear("Class");
intentar("F4 Class, AddOperation(n,ret,param,notas)", function () { f4.AddOperation("operacion", "void", "", ""); }, f4);

// ---------------------------------------------------------------
// 9. VARIOS ATRIBUTOS SEGUIDOS
// ---------------------------------------------------------------
var g1 = crear("Class");
var gr = "";
try { g1.Attributes.AddNew("uno", "String"); gr = "uno ok"; } catch (e) { gr = "uno ERR"; }
try { g1.Attributes.AddNew("dos", "String"); gr = gr + " / dos ok"; } catch (e) { gr = gr + " / dos ERR"; }
try { g1.Attributes.AddNew("tres", "String"); gr = gr + " / tres ok"; } catch (e) { gr = gr + " / tres ERR"; }
try { g1.Update(); } catch (e) { }
anota("G1 tres atributos seguidos", gr + " | memoria " + medir(g1) + " | refrescado " + medirFresco(g1.ElementID) + " | paquete " + medirPorPaquete(g1.ElementID));

// ---------------------------------------------------------------
// 10. ELEMENTO YA COLOCADO EN UN DIAGRAMA
// ---------------------------------------------------------------
var diag = null;
try { diag = paq.Diagrams.AddNew("DIAG PRUEBA", "Class"); diag.Update(); paq.Diagrams.Refresh(); } catch (e) { }

var h1 = crear("Class");
if (diag != null) {
    try {
        var o = diag.DiagramObjects.AddNew("l=10;r=200;t=10;b=120;", "");
        o.ElementID = h1.ElementID;
        o.Update();
    } catch (e) { }
}
intentar("H1 Class ya en el diagrama, AddNew(2)", function () { h1.Attributes.AddNew("campo", "String"); }, h1);

// ---------------------------------------------------------------
// 11. INFORME
// ---------------------------------------------------------------
full.push("");
full.push("=== RESULTADOS (memoria / refrescado / paquete = atributos/métodos) ===");
full.push("Una prueba sirve si algun numero es mayor que 0.");

var informe = crear("Class");
try { informe.Name = "INFORME v7"; } catch (e) { }
try { informe.Stereotype = "note"; } catch (e) { }
try { informe.Notes = full.join(SALTO); } catch (e) { }
try { informe.Update(); } catch (e) { }

try {
    paq.Notes = full.join(SALTO);
    paq.Update();
} catch (e) { }

try { paq.Elements.Refresh(); } catch (e) { }

// resumen compacto para el mensaje de error
var resumen = "";
for (var r = 0; r < corto.length; r++) {
    if (resumen.length < 620) {
        if (resumen.length > 0) resumen = resumen + " | ";
        resumen = resumen + corto[r];
    }
}

throw new Error(resumen);
