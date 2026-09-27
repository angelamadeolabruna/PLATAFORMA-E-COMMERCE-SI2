// ================================================================
// PRUEBA API v9 - la clave es NO terminar con excepcion
//
// v7 y v8 terminaban con throw new Error(...) para mostrar el
// resumen. Si EA confirma los cambios al final del script y una
// excepcion aborta ese cierre, eso explicaria que Attributes.AddNew
// devuelva un objeto con Name y Type correctos pero AttributeID = 0.
//
// Este script NO lanza ninguna excepcion: termina normal.
//
// Ademas pide la clase MANUAL1 creada a mano en la raiz, con un
// atributo puesto desde el menu Features, para comprobar si la
// lectura de atributos funciona sobre una clase real.
//
// Al terminar solo hay que mirar el arbol: que clases V9_* tienen
// triangulo de expandir (o sea, hijos). El detalle queda en las
// notas del elemento "MARCADOR v9".
//
// SIN POPUPS. NO BORRA NADA DE EJECUCIONES ANTERIORES.
// ================================================================

var SALTO = String.fromCharCode(10);
var raiz = Repository.Models.GetAt(0);
var NOPAQ = "PRUEBA API v9";
var full = [];

// ---------------------------------------------------------------
// 1. PAQUETE (no se limpia)
// ---------------------------------------------------------------
var paq = null;
for (var i = 0; i < raiz.Packages.Count; i++) {
    if (String(raiz.Packages.GetAt(i).Name) == NOPAQ) paq = raiz.Packages.GetAt(i);
}
if (paq == null) {
    try { paq = raiz.Packages.AddNew(NOPAQ, ""); } catch (e) { paq = null; }
    if (paq != null) { try { paq.Update(); } catch (e) { } }
    try { raiz.Packages.Refresh(); } catch (e) { }
    for (var j = 0; j < raiz.Packages.Count; j++) {
        if (String(raiz.Packages.GetAt(j).Name) == NOPAQ) paq = raiz.Packages.GetAt(j);
    }
}
if (paq == null) { throw new Error("No se pudo crear ni localizar el paquete " + NOPAQ); }

function pad(s, n) { var t = String(s); while (t.length < n) t = t + "."; return t; }
function anota(t, det) { full.push(pad(t, 38) + " " + det); }

function prop(o, n) {
    if (o == null) return "nulo";
    try { var v = o[n]; if (v === null) return "null"; if (v === undefined) return "undefined"; return String(v); }
    catch (e) { return "ERR"; }
}

function excepcion(f) {
    try { f(); return "ok"; } catch (e) { return "EXCEPCION " + (e.message ? e.message : e); }
}

function crea(nombre, tipo) {
    var el = null;
    for (var k = 0; k < paq.Elements.Count; k++) {
        if (String(paq.Elements.GetAt(k).Name) == nombre) return paq.Elements.GetAt(k);
    }
    try { el = paq.Elements.AddNew(nombre, tipo); } catch (e) { el = null; }
    if (el != null) { try { el.Update(); } catch (e) { } }
    return el;
}

function atr(el) { try { return el.Attributes.Count; } catch (e) { return "x"; } }
function ope(el) { try { return el.Methods.Count; } catch (e) { return "x"; } }
function par(el) { return atr(el) + "/" + ope(el); }

// lista los nombres de los hijos reales que se pueden leer
function hijos(el) {
    var s = "";
    try {
        for (var i2 = 0; i2 < el.Attributes.Count; i2++) {
            s += s.length > 0 ? "," : "";
            s += el.Attributes.GetAt(i2).Name;
        }
    } catch (e) { s = "ERR:" + (e.message ? e.message : e); }
    return s == "" ? "(ninguno)" : s;
}

// busca un elemento por nombre en raiz y primer nivel de paquetes
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
// 2. METODOS DE CONFIRMACION DISPONIBLES
// ---------------------------------------------------------------
var a0 = crea("V9_A", "Class");
anota("V9_A AttributeID leido tras AddNew", "---");

var confirma = [];
confirma.push("Repository.Save=" + excepcion(function () { return typeof Repository.Save; }));
confirma.push("Repository.Commit=" + excepcion(function () { return typeof Repository.Commit; }));
confirma.push("Repository.Flush=" + excepcion(function () { return typeof Repository.Flush; }));
confirma.push("Session.Save=" + excepcion(function () { return typeof Session.Save; }));
confirma.push("Element.Update=" + excepcion(function () { return typeof a0.Update; }));
confirma.push("Package.Update=" + excepcion(function () { return typeof paq.Update; }));
for (var c = 0; c < confirma.length; c++) anota("disponible", confirma[c]);

// ---------------------------------------------------------------
// 3. LAS PRUEBAS
// ---------------------------------------------------------------
var res = [];

// A: un atributo, nada mas
var A = crea("V9_A", "Class");
anota("A AddNew y nada mas", excepcion(function () { A.Attributes.AddNew("campoA", "String"); }) + " >> " + par(A) + " hijos=" + hijos(A));
res.push("A=" + par(A));

// B: un atributo y Update sobre el atributo
var B = crea("V9_B", "Class");
anota("B AddNew + Update del atributo", excepcion(function () {
    var a = B.Attributes.AddNew("campoB", "String");
    a.Name = "campoB"; a.Type = "String";
    a.Update();
}) + " >> " + par(B) + " hijos=" + hijos(B));
res.push("B=" + par(B));

// C: tres atributos seguidos
var C = crea("V9_C", "Class");
anota("C tres AddNew seguidos", excepcion(function () {
    C.Attributes.AddNew("uno", "String");
    C.Attributes.AddNew("dos", "String");
    C.Attributes.AddNew("tres", "String");
}) + " >> " + par(C) + " hijos=" + hijos(C));
res.push("C=" + par(C));

// D: atributo y luego renombrar la clase para forzar escritura
var D = crea("V9_D", "Class");
anota("D AddNew + renombrar la clase", excepcion(function () {
    D.Attributes.AddNew("campoD", "String");
    D.Name = "V9_D";
    D.Update();
}) + " >> " + par(D) + " hijos=" + hijos(D));
res.push("D=" + par(D));

// E: operacion
var E = crea("V9_E", "Class");
anota("E Methods.AddNew + Update", excepcion(function () {
    var m = E.Methods.AddNew("operacion", "void", "", "");
    m.Name = "operacion"; m.ReturnType = "void";
    m.Update();
}) + " >> " + par(E));
res.push("E=" + par(E));

// F: atributo con visibility
var F = crea("V9_F", "Class");
anota("F AddNew y SetVisiblity", excepcion(function () {
    var a = F.Attributes.AddNew("campoF", "String");
    try { a.SetVisibility(0); } catch (e) { }
    a.Update();
}) + " >> " + par(F) + " hijos=" + hijos(F));
res.push("F=" + par(F));

// G: aplicar Update a todo lo creado
excepcion(function () { A.Update(); B.Update(); C.Update(); D.Update(); E.Update(); F.Update(); });

// H: forzar guardado de la raiz
anota("H forzar guardado", excepcion(function () {
    try { Repository.Save(); } catch (e) { throw new Error("Repository.Save no existe: " + (e.message ? e.message : e)); }
}));

// ---------------------------------------------------------------
// 4. CLASE CREADA A MANO
// ---------------------------------------------------------------
var manual = buscarManual("MANUAL1");
if (manual == null) {
    anota("MANUAL1", "NO ENCONTRADA. Creala en la raiz del arbol con un atributo.");
    res.push("MANUAL1=NO ENCONTRADA");
} else {
    anota("MANUAL1 antes", par(manual) + " hijos=" + hijos(manual) + " Type=" + prop(manual, "Type"));
    var inicial = par(manual);
    var nombresAntes = hijos(manual);

    anota("MANUAL1 anadir atributo", excepcion(function () {
        var a = manual.Attributes.AddNew("segundo", "String");
        a.Update();
    }));

    anota("MANUAL1 despues", par(manual) + " hijos=" + hijos(manual));
    res.push("MANUAL1=" + inicial + "->" + par(manual) + " " + nombresAntes + "->" + hijos(manual));

    anota("MANUAL1 anadir operacion", excepcion(function () {
        var m = manual.Methods.AddNew("operacionNueva", "void", "", "");
        m.Update();
    }));
    anota("MANUAL1 final", par(manual) + " hijos=" + hijos(manual));
}

// ---------------------------------------------------------------
// 5. MARCADOR E INFORME  (sin excepciones, cierre limpio)
// ---------------------------------------------------------------
var todos = [];
todos.push("V9 A=" + par(A) + " B=" + par(B) + " C=" + par(C) + " D=" + par(D) + " E=" + par(E) + " F=" + par(F));
for (var r = 0; r < res.length; r++) todos.push(res[r]);
todos.push("");
todos.push("Si este archivo se leyo completo, el script termino sin excepcion.");
todos.push("Revisa en el arbol cuales clases V9_* tienen triangulo de expandir.");
todos.push("");
for (var f2 = 0; f2 < full.length; f2++) todos.push(full[f2]);

var marcador = crea("MARCADOR v9", "Class");
try { marcador.Stereotype = "note"; } catch (e) { }
try { marcador.Notes = todos.join(SALTO); } catch (e) { }
try { marcador.Update(); } catch (e) { }
try { paq.Notes = todos.join(SALTO); paq.Update(); } catch (e) { }

excepcion(function () { A.Update(); B.Update(); C.Update(); D.Update(); E.Update(); F.Update(); });
excepcion(function () { marcador.Update(); paq.Update(); raiz.Update(); });
excepcion(function () { try { Repository.Save(); } catch (e) { } });
