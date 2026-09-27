// ================================================================
// DIAGNOSTICO version 3   LISTA EL CONTENIDO REAL DEL MODELO
// No crea, no borra, no modifica. Solo lee y escribe un informe.
// Informe en  C:\Users\pablo\desktop\diag_capas.txt
// ================================================================

var SALTO = String.fromCharCode(10);
var FICHERO = "C:\\Users\\pablo\\desktop\\diag_capas.txt";
var out = "";

function add(t) { out = out + String(t) + SALTO; }
function num(o, p) { try { return o[p]; } catch (e) { return "?"; } }
function txt(o, p) { try { return String(o[p]); } catch (e) { return "?"; } }
function tiene(s, m) { if (s == "") return false; return String(s).toLowerCase().indexOf(m) >= 0; }

function escribir(ruta, contenido) {
    var fso = null;
    try { fso = new ActiveXObject("Scripting.FileSystemObject"); } catch (e) { return "sin FSO"; }
    var f = null;
    try { f = fso.OpenTextFile(ruta, 2, true, -1); } catch (e2) { return "no se pudo abrir"; }
    try { f.Write(contenido); } catch (e3) { return "no se pudo escribir"; }
    try { f.Close(); } catch (e4) { }
    return "escrito";
}

// Busca en profundidad. Lleva la cuenta de cuantos ha visitado para no
// quedarse colgado si el modelo es enorme.
var Visitados = 0;
function recorrer(P, nivel) {
    Visitados++;
    if (Visitados > 3000) return;
    var sub = 0;
    try { sub = P.Packages.Count; } catch (e) { }
    for (var i = 0; i < sub; i++) {
        var h = null;
        try { h = P.Packages.GetAt(i); } catch (e2) { continue; }
        var nom = txt(h, "Name");
        var marcas = "";
        if (tiene(nom, "capa")) marcas = marcas + "  <<< CAPA";
        if (tiene(nom, "paquet")) marcas = marcas + "  <<< PAQUETES";
        if (tiene(nom, "logico")) marcas = marcas + "  <<< LOGICO";
        if (tiene(nom, "comunicacion")) marcas = marcas + "  <<< COMUNICACION";
        var sangria = "";
        for (var s = 0; s < nivel; s++) sangria = sangria + "  ";
        add(sangria + nom + marcas);
        recorrer(h, nivel + 1);
    }
}

function listarDiagramas(P, rutaPaq) {
    var n = 0;
    try { n = P.Diagrams.Count; } catch (e) { }
    for (var i = 0; i < n; i++) {
        var d = null;
        try { d = P.Diagrams.GetAt(i); } catch (e2) { continue; }
        var nom = txt(d, "Name");
        if (!tiene(nom, "capa") && !tiene(nom, "paquet") && !tiene(nom, "logico")) continue;
        var nobj = 0;
        try { nobj = d.DiagramObjects.Count; } catch (e3) { }
        add("");
        add("DIAGRAMA '" + nom + "'");
        add("   en el paquete: " + rutaPaq);
        add("   ID = " + num(d, "ID") + "   objetos dibujados: " + nobj);
        try {
            var vistos = 0;
            for (var k = 0; k < nobj && vistos < 4; k++) {
                var o = d.DiagramObjects.GetAt(k);
                add("     L=" + num(o, "Left") + " R=" + num(o, "Right") + " T=" + num(o, "Top") + " B=" + num(o, "Bottom") + "  " + txt(o, "ObjectType"));
                vistos++;
            }
        } catch (e4) { add("     no se pudieron leer los objetos"); }
    }
    var sub2 = 0;
    try { sub2 = P.Packages.Count; } catch (e5) { }
    for (var j = 0; j < sub2; j++) {
        var h2 = null;
        try { h2 = P.Packages.GetAt(j); } catch (e6) { continue; }
        listarDiagramas(h2, rutaPaq + " > " + txt(h2, "Name"));
    }
}

add("=== DIAGNOSTICO 3: QUE HAY REALMENTE EN EL MODELO ===");
add("");

var RAIZ = null;
try { RAIZ = Repository.Models.GetAt(0); } catch (e) { }
if (RAIZ == null) {
    add("No se pudo leer el modelo.");
} else {
    var total = 0;
    try { total = RAIZ.Packages.Count; } catch (e7) { }
    add("PAQUETES DE PRIMER NIVEL: " + total);
    add("");
    add("--- ARBOL COMPLETO DE PAQUETES ---");
    add("(marcados los que tienen 'capa', 'paquet' o 'logico' en el nombre)");
    add("");
    for (var p = 0; p < total; p++) {
        var pk = null;
        try { pk = RAIZ.Packages.GetAt(p); } catch (e8) { continue; }
        var n1 = txt(pk, "Name");
        var m1 = "";
        if (tiene(n1, "capa")) m1 = m1 + "  <<< CAPA";
        if (tiene(n1, "paquet")) m1 = m1 + "  <<< PAQUETES";
        if (tiene(n1, "logico")) m1 = m1 + "  <<< LOGICO";
        add(n1 + m1);
        recorrer(pk, 1);
    }
    add("");
    add("Paquetes visitados en el recorrido: " + Visitados);
    add("");

    add("--- DIAGRAMAS QUE SE LLAMAN CAPA, PAQUETES O LOGICO ---");
    for (var q = 0; q < total; q++) {
        var pk2 = null;
        try { pk2 = RAIZ.Packages.GetAt(q); } catch (e9) { continue; }
        listarDiagramas(pk2, txt(pk2, "Name"));
    }
}

add("");
add("=== FIN ===");

var res = escribir(FICHERO, out);
add("");
add("Informe escrito: " + res);
try { Repository.ShowMessage("Listo. Informe en C:\\Users\\pablo\\desktop\\diag_capas.txt" + SALTO + SALTO + out, "DIAGNOSTICO 3", 0); } catch (e10) { }
