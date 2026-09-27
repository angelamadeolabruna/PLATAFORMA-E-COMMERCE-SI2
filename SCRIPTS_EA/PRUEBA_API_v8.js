// ================================================================
// PRUEBA API v8 - segunda ronda, informada por v7
//
// Hallazgo de v7: Attributes.AddNew(nombre, tipo) es la firma
// correcta (2 argumentos) y NO lanza excepcion, pero no persiste.
// Repository.Models.GetByID(id) devuelve null.
//
// Aqui se prueba:
//   1. Que metodos existen en la coleccion Attributes y Methods
//   2. Update() sobre el atributo recien creado
//   3. Attributes.Refresh() despues de anadir
//   4. Releer el elemento con paq.Elements.GetByID(id)
//   5. Buscar el elemento con Repository.Models.GetAllModelsAt(0)
//   6. Anadir a una clase creada A MANO con un atributo ya puesto
//   7. Operaciones con Update sobre el metodo
//   8. Si existen SQLQuery / SQLCommand / Execute en el Repository
//
// REQUISITO: antes de ejecutar, crea a mano una clase llamada
// MANUAL1 en la raiz del modelo (o en un paquete propio) con un
// atributo agregado desde el menu derecho > Features.
//
// SIN POPUPS. Deja un elemento "INFORME v8" con el detalle.
// ================================================================

var SALTO = String.fromCharCode(10);
var raiz = Repository.Models.GetAt(0);
var NOPAQ = "PRUEBA API v8";
var seq = 0;
var full = [];
var verd = [];

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
function pad(s, n) { var t = String(s); while (t.length < n) t = t + "."; return t; }

function crea(tipo) {
    var n = "P" + seq; seq = seq + 1;
    var el = null;
    try { el = paq.Elements.AddNew(n, tipo); } catch (e) { el = null; }
    if (el != null) { try { el.Update(); } catch (a) { } try { paq.Elements.Refresh(); } catch (b) { } }
    return el;
}

function atr(el) {
    if (el == null) return "sinEl";
    try { return el.Attributes.Count; } catch (e) { return "x"; }
}

function ope(el) {
    if (el == null) return "sinEl";
    try { return el.Methods.Count; } catch (e) { return "x"; }
}

function par(el) { return atr(el) + "/" + ope(el); }

function anota(t, det) { full.push(pad(t, 40) + " " + det); }

function ver(t) {
    var s = "";
    for (var k = 0; k < verd.length; k++) {
        if (verd[k].indexOf(t) == 0) { verd[k] = t + s; return; }
    }
    verd.push(t + s);
}

function prueba(t, fn, el) {
    var det = "";
    try { det = fn(el); } catch (e) { det = "EXCEPCION " + (e.message ? e.message : e); }
    try { el.Update(); } catch (a) { }
    var res = det + " >> " + par(el);
    anota(t, res);
    ver(t + "=" + res);
    return el;
}

function leerProp(o, n) {
    try { return String(o[n]); } catch (e) { return "ERR"; }
}

// typeof de una propiedad/método de un objeto COM
function leerTipo2(objeto, nombre) {
    if (objeto == null) return "nulo";
    try {
        var v = objeto[nombre];
        if (v === null) return "null";
        if (v === undefined) return "undefined";
        return typeof v;
    } catch (e) { return "ERR"; }
}

// typeof de una propiedad de un elemento recien creado
function leerTipo(tipo) { return leerTipo2(p0probe, tipo); }

var p0probe = null;

// Busca un elemento por nombre sin recorrer todo el modelo:
// raiz, primer nivel de la raiz y primer nivel de cada paquete.
function buscarManual(nombre) {
    var i, k, x, p;
    try {
        for (i = 0; i < raiz.Elements.Count; i++) {
            x = raiz.Elements.GetAt(i);
            if (String(x.Name) == nombre) return x;
        }
    } catch (e1) { }
    for (i = 0; i < raiz.Packages.Count; i++) {
        p = raiz.Packages.GetAt(i);
        try {
            for (k = 0; k < p.Elements.Count; k++) {
                x = p.Elements.GetAt(k);
                if (String(x.Name) == nombre) return x;
            }
        } catch (e2) { }
    }
    return null;
}

// ---------------------------------------------------------------
// 3. SUPERVIVENCIA DE LA API  (primero, va en el mensaje)
// ---------------------------------------------------------------
var p0 = crea("Class");
p0probe = p0;
var sup = [];

sup.push("Element.Type=" + leerProp(p0, "Type"));
sup.push("Element.Stereotype=[" + leerProp(p0, "Stereotype") + "]");
sup.push("Element.ObjectID=" + leerProp(p0, "ObjectID"));
sup.push("Element.ClassifierID=" + leerProp(p0, "ClassifierID"));
sup.push("Element.ElementID=" + leerProp(p0, "ElementID"));
sup.push("Element.ElementGUID=" + leerProp(p0, "ElementGUID"));

sup.push("typeof Attributes=" + leerTipo("Attributes"));
sup.push("typeof Methods=" + leerTipo("Methods"));
sup.push("typeof Operations=" + leerTipo("Operations"));
sup.push("typeof AddAttribute=" + leerTipo("AddAttribute"));
sup.push("typeof AddOperation=" + leerTipo("AddOperation"));
sup.push("typeof Notes=" + leerTipo("Notes"));
sup.push("typeof Alias=" + leerTipo("Alias"));
sup.push("typeof Connectors=" + leerTipo("Connectors"));
sup.push("typeof Tags=" + leerTipo("Tags"));
sup.push("typeof CustomProperties=" + leerTipo("CustomProperties"));

var colA = p0.Attributes;
sup.push("colA.Count=" + leerProp(colA, "Count"));
sup.push("colA.GetAt=" + leerTipo2(colA, "GetAt"));
sup.push("colA.AddNew=" + leerTipo2(colA, "AddNew"));
sup.push("colA.Add=" + leerTipo2(colA, "Add"));
sup.push("colA.Insert=" + leerTipo2(colA, "Insert"));
sup.push("colA.Refresh=" + leerTipo2(colA, "Refresh"));
sup.push("colA.Delete=" + leerTipo2(colA, "Delete"));

var colM = p0.Methods;
sup.push("colM.Count=" + leerProp(colM, "Count"));
sup.push("colM.AddNew=" + leerTipo2(colM, "AddNew"));
sup.push("colM.Add=" + leerTipo2(colM, "Add"));
sup.push("colM.Refresh=" + leerTipo2(colM, "Refresh"));

sup.push("typeof Repository.SQLQuery=" + leerTipo2(Repository, "SQLQuery"));
sup.push("typeof Repository.SQLCommand=" + leerTipo2(Repository, "SQLCommand"));
sup.push("typeof Repository.Execute=" + leerTipo2(Repository, "Execute"));
sup.push("typeof Repository.GetElementByID=" + leerTipo2(Repository, "GetElementByID"));
sup.push("typeof Repository.Models.GetAllModelsAt=" + leerTipo2(Repository.Models, "GetAllModelsAt"));

anota("SUPERVIVENCIA", "");
for (var s1 = 0; s1 < sup.length; s1++) full.push(sup[s1]);
full.push("");
ver("SUP=Type:" + leerProp(p0, "Type") + " ObjID:" + leerProp(p0, "ObjectID") +
    " Attr=" + leerTipo("Attributes") + "/" + leerProp(colA, "Count") +
    " Meth=" + leerTipo("Methods") + "/" + leerProp(colM, "Count") +
    " colA.AddNew=" + leerTipo2(colA, "AddNew") + " colM.AddNew=" + leerTipo2(colM, "AddNew") +
    " SQLQuery=" + leerTipo2(Repository, "SQLQuery") + " Execute=" + leerTipo2(Repository, "Execute"));

// ---------------------------------------------------------------
// 4. G1 - AddNew y luego Update sobre el atributo
// ---------------------------------------------------------------
prueba("G1 AddNew + attr.Update()", function (el) {
    var a = el.Attributes.AddNew("campo", "String");
    var s = "AddNew ok; leido Name=" + leerProp(a, "Name") + " Type=" + leerProp(a, "Type") + " AttributeID=" + leerProp(a, "AttributeID");
    try { a.Name = "campo"; a.Type = "String"; a.Update(); s += "; Update ok"; }
    catch (e) { s += "; Update EXCEPCION " + (e.message ? e.message : e); }
    return s;
}, crea("Class"));

// ---------------------------------------------------------------
// 5. G2 - AddNew y despues Attributes.Refresh()
// ---------------------------------------------------------------
prueba("G2 AddNew + Attributes.Refresh()", function (el) {
    var a = el.Attributes.AddNew("campo", "String");
    var s = "AddNew ok";
    try { el.Attributes.Refresh(); s += "; Refresh ok, Count tras refresh=" + el.Attributes.Count; }
    catch (e) { s += "; Refresh EXCEPCION " + (e.message ? e.message : e); }
    return s;
}, crea("Class"));

// ---------------------------------------------------------------
// 6. G3 - Releer el elemento con paq.Elements.GetByID
// ---------------------------------------------------------------
var g3 = crea("Class");
prueba("G3 releer con paq.Elements.GetByID", function (el) {
    var f = null;
    try { f = paq.Elements.GetByID(el.ElementID); } catch (e) { return "GetByID EXCEPCION " + (e.message ? e.message : e); }
    if (f == null) return "GetByID devolvio null";
    var s = "GetByID ok; antes de anadir Count=" + f.Attributes.Count;
    try { f.Attributes.AddNew("campo", "String"); s += "; AddNew ok"; } catch (e) { s += "; AddNew EXCEPCION"; }
    try { f.Update(); s += "; Update ok, Count=" + f.Attributes.Count; } catch (e) { s += "; Update EXCEPCION"; }
    return s;
}, g3);

// ---------------------------------------------------------------
// 7. G4 - Buscar el elemento en GetAllModelsAt
// ---------------------------------------------------------------
var g4 = crea("Class");
prueba("G4 buscar en Models.GetAllModelsAt(0)", function (el) {
    var todos = null;
    try { todos = Repository.Models.GetAllModelsAt(0); } catch (e) { return "GetAllModelsAt EXCEPCION " + (e.message ? e.message : e); }
    if (todos == null) return "GetAllModelsAt devolvio null";
    var n = todos.Count;
    var s = "total en el modelo=" + n;
    var encontrado = null;
    var tope = n;
    if (tope > 6000) tope = 6000;
    for (var k = 0; k < tope; k++) {
        var o = null;
        try { o = todos.GetAt(k); } catch (e) { }
        if (o == null) continue;
        if (leerProp(o, "ElementID") == el.ElementID) { encontrado = o; break; }
    }
    if (encontrado == null) return s + "; el elemento NO aparece en la coleccion";
    var c = "x";
    try { c = encontrado.Attributes.Count; } catch (e) { }
    return s + "; encontrado, Attributes.Count=" + c;
}, g4);

// ---------------------------------------------------------------
// 8. G5 - CLASE CREADA A MANO
// ---------------------------------------------------------------
var manual = buscarManual("MANUAL1");
if (manual == null) {
    anota("G5 clase manual", "NO SE ENCONTRO MANUAL1 - creala a mano antes de ejecutar");
    ver("G5=NO SE ENCONTRO MANUAL1");
} else {
    var antes = par(manual);
    anota("G5a MANUAL1 estado inicial", "atributos/metodos=" + antes + " Type=" + leerProp(manual, "Type"));
    prueba("G5b MANUAL1 Attributes.AddNew", function (el) {
        var a = el.Attributes.AddNew("segundo", "String");
        var s = "AddNew ok; leido AttributeID=" + leerProp(a, "AttributeID");
        try { a.Update(); s += "; Update ok"; } catch (e) { s += "; Update EXCEPCION"; }
        return s + "; Count tras anadir=" + el.Attributes.Count;
    }, manual);
    anota("G5c MANUAL1 despues", "atributos/metodos=" + par(manual));
    ver("G5=" + antes + "->" + par(manual));

    prueba("G6 MANUAL1 Methods.AddNew + Update", function (el) {
        var m = el.Methods.AddNew("operacion", "void", "", "");
        var s = "AddNew ok; leido MethodID=" + leerProp(m, "MethodID") + " Name=" + leerProp(m, "Name");
        try { m.Update(); s += "; Update ok"; } catch (e) { s += "; Update EXCEPCION"; }
        return s + "; Count=" + el.Methods.Count;
    }, manual);
}

// ---------------------------------------------------------------
// 9. G7 - Other collections on a new Class
// ---------------------------------------------------------------
prueba("G7 Tags.AddNew en Class nueva", function (el) {
    var t = el.Tags.AddNew("PRUEBA");
    try { t.Update(); } catch (e) { }
    return "Tags.Count=" + el.Tags.Count;
}, crea("Class"));

prueba("G8 Connectors.AddNew entre dos Class", function (el) {
    var o = crea("Class");
    var c = el.Connectors.AddNew("", "Association");
    c.ClientID = el.ElementID;
    c.SupplierID = o.ElementID;
    c.Update();
    return "Connectors.Count=" + el.Connectors.Count;
}, g4);

// ---------------------------------------------------------------
// 10. INFORME
// ---------------------------------------------------------------
full.push("");
full.push("=== RESULTADOS (atributos/métodos) ===");

var inf = crea("Class");
try { inf.Name = "INFORME v8"; } catch (e) { }
try { inf.Stereotype = "note"; } catch (e) { }
try { inf.Notes = full.join(SALTO); } catch (e) { }
try { inf.Update(); } catch (e) { }
try { paq.Notes = full.join(SALTO); paq.Update(); } catch (e) { }
try { paq.Elements.Refresh(); } catch (e) { }

var resumen = "";
for (var r = 0; r < verd.length; r++) {
    if (resumen.length > 560) break;
    if (resumen.length > 0) resumen = resumen + " | ";
    resumen = resumen + verd[r];
}
throw new Error(resumen);
