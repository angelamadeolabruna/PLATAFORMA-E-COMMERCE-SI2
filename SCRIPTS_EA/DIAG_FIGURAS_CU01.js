// ================================================================
// DIAGNOSTICO - FIGURAS DE LAS CLASES DE CU01
// Solo lee. No crea, no borra, no modifica nada.
// Una instruccion por linea, sin continuaciones ni ternarios.
// ================================================================

function bus(P, N) {
    if (P == null) return null;
    if (String(P.Name) == N) return P;
    for (var i = 0; i < P.Packages.Count; i++) {
        var r = bus(P.Packages.GetAt(i), N);
        if (r != null) return r;
    }
    return null;
}

function pad(s, n) {
    var t = String(s);
    while (t.length < n) t = t + " ";
    return t;
}

function dato(o, n) {
    if (o == null) return "-";
    try { return String(o[n]); } catch (e) { return "ERR"; }
}

var SALTO = String.fromCharCode(10);
var raiz = Repository.Models.GetAt(0);
var paq = bus(raiz, "CU01 - Análisis de clases");
var txt = "";

if (paq == null) {
    txt = "No se encontro el paquete CU01 - Análisis de clases.";
} else {
    txt = "ELEMENTOS: " + paq.Elements.Count + "   DIAGRAMAS: " + paq.Diagrams.Count + SALTO + SALTO;
    for (var i = 0; i < paq.Elements.Count; i++) {
        var el = paq.Elements.GetAt(i);
        var atr = -1;
        try { atr = el.Attributes.Count; } catch (e) { atr = -1; }
        var ope = -1;
        try { ope = el.Methods.Count; } catch (e) { ope = -1; }
        var fig = "(fuera)";
        for (var d = 0; d < paq.Diagrams.Count; d++) {
            var dg = paq.Diagrams.GetAt(d);
            for (var k = 0; k < dg.DiagramObjects.Count; k++) {
                var ob = dg.DiagramObjects.GetAt(k);
                if (ob.ElementID == el.ElementID) fig = dato(ob, "Shape");
            }
        }
        txt = txt + pad(String(el.Name), 24);
        txt = txt + pad(dato(el, "Type"), 10);
        txt = txt + pad(dato(el, "Stereotype"), 14);
        txt = txt + pad(fig, 16);
        txt = txt + "atr=" + atr + " ope=" + ope + SALTO;
    }
    try { paq.Notes = txt; paq.Update(); } catch (e) { }
}

try { Repository.ShowMessage(txt, "Figuras CU01", 0); } catch (e) { }
