// ================================================================
// SONDA DE DIAGRAMA DE COMPONENTES
//
// POR QUE EXISTE ESTE FICHERO
//   El script del diagrama deja el lienzo en blanco y no sabemos si
//   es que no se crea nada, o si se crea y no se ve.  Este fichero no
//   adivina: LEE lo que hay en el modelo y PRUEBA las llamadas una a
//   una, y lo cuenta.  Lo que salga en el aviso es la respuesta.
//
// QUE HACE, EN ORDEN
//   1.  Localiza o crea el paquete  Arquitectura Fisica > Componentes
//   2.  Lista los diagramas que hay dentro, con su tipo
//   3.  Del diagrama que nos interesa: cuantos objetos, cuantas
//       lineas, cuantas capas, y como se llaman y si se ven
//   4.  Los 6 primeros objetos, con su tipo y sus 4 coordenadas
//   5.  PRUEBA de colocar un objeto, de 4 maneras distintas, y dice
//       cuantas funcionan y que coordenadas devuelve cada una
//   6.  PRUEBA de los nombres de tipo de diagrama, y dice cuales
//       acepta esta version de EA
//   7.  PRUEBA de los nombres de tipo de elemento
//
// NO TOCA NADA DE LO QUE YA HAY.  Solo crea objetos de prueba con
// nombre PROBE, que se pueden borrar a mano, y un paquete PROBE.
// ================================================================

var SALTO = String.fromCharCode(10);
var ERRORES = [];
var R = [];
var MSGTIT = "Sonda de Componentes";

var PAQ1 = "Arquitectura Fisica";
var PAQ2 = "Componentes";
var DIAG = "Diagrama de Componentes Principal";

function aviso(txt) {
    try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup(txt, 0, MSGTIT, 64);
    } catch (e) {
        throw new Error(txt);
    }
}

function descError(e) {
    var d = "";
    try { if (e.description != null) d = d + e.description; } catch (x) { }
    if (d === "") { try { d = String(e); } catch (x2) { d = "error desconocido"; } }
    return d;
}

function obtenerPaquete(padre, nombre) {
    for (var i = 0; i < padre.Packages.Count; i++) {
        var sp = padre.Packages.GetAt(i);
        if (sp.Name == nombre) { return sp; }
    }
    return null;
}

function obtenerDiagrama(paquete, nombre) {
    for (var i = 0; i < paquete.Diagrams.Count; i++) {
        var d = paquete.Diagrams.GetAt(i);
        if (d.Name == nombre) { return d; }
    }
    return null;
}


function main() {

    // ---------- 1. EL PAQUETE ----------
    var raiz = Repository.Models.GetAt(0);
    R.push("=== 1. PAQUETES ===");
    R.push("  raiz del modelo: " + raiz.Name);
    var p1 = obtenerPaquete(raiz, PAQ1);
    if (p1 == null) {
        p1 = raiz.Packages.AddNew(PAQ1, "");
        p1.Update();
        raiz.Packages.Refresh();
        R.push("  " + PAQ1 + ": NO EXISTIA, se ha creado");
    } else {
        R.push("  " + PAQ1 + ": existe");
    }
    var p2 = obtenerPaquete(p1, PAQ2);
    if (p2 == null) {
        p2 = p1.Packages.AddNew(PAQ2, "");
        p2.Update();
        p1.Packages.Refresh();
        R.push("  " + PAQ1 + " > " + PAQ2 + ": NO EXISTIA, se ha creado");
    } else {
        R.push("  " + PAQ1 + " > " + PAQ2 + ": existe");
    }
    R.push("");

    // ---------- 2. LOS DIAGRAMAS DE ESE PAQUETE ----------
    R.push("=== 2. DIAGRAMAS EN " + PAQ2 + " ===");
    R.push("  hay " + p2.Diagrams.Count);
    for (var d = 0; d < p2.Diagrams.Count; d++) {
        var dd = p2.Diagrams.GetAt(d);
        var tipo = "?";
        try { tipo = String(dd.Type); } catch (e0) { }
        R.push("    " + String(dd.Name) + "   tipo=" + tipo);
    }
    R.push("");

    // ---------- 3. EL DIAGRAMA QUE NOS INTERESA ----------
    var diagram = obtenerDiagrama(p2, DIAG);
    if (diagram == null) {
        R.push("=== 3. EL DIAGRAMA " + DIAG + " NO EXISTE ===");
        R.push("  O el script no llego a crearlo, o se creo con otro nombre.");
        R.push("  Los nombres que hay estan en el apartado 2 de arriba.");
        R.push("");
        R.push("=== 5. PRUEBA DE TIPOS DE DIAGRAMA (aun asi) ===");
        probarTiposDiagrama(p2);
        R.push("");
        R.push("=== 6. PRUEBA DE TIPOS DE ELEMENTO ===");
        probarTiposElemento(p1);
        R.push("");
        R.push("=== 7. PRUEBA DE COLOCAR UN OBJETO, si se puede ===");
        return cerrar(p1, p2);
    }
    R.push("=== 3. EL DIAGRAMA QUE NOS INTERESA ===");
    var nObj = -1, nLin = -1, nCapas = -1;
    try { nObj = diagram.DiagramObjects.Count; } catch (e1) { R.push("  objetos: ERROR " + descError(e1)); }
    try { nLin = diagram.DiagramLinks.Count; } catch (e2) { }
    try { nCapas = diagram.Layers.Count; } catch (e3) { }
    R.push("  objetos: " + nObj);
    R.push("  lineas:  " + nLin);
    R.push("  capas:   " + nCapas);
    for (var c = 0; c < diagram.Layers.Count; c++) {
        var lay = diagram.Layers.GetAt(c);
        var vis = "?";
        try { vis = String(lay.Visible); } catch (e4) { }
        R.push("    capa " + c + ": '" + String(lay.Name) + "'  visible=" + vis);
    }
    R.push("");

    // ---------- 4. LOS PRIMEROS OBJETOS ----------
    R.push("=== 4. LOS 6 PRIMEROS OBJETOS DEL DIAGRAMA ===");
    if (nObj == 0) {
        R.push("  NO HAY NINGUNO. El diagrama esta de verdad vacio.");
        R.push("  Entonces el fallo es al CREARLOS, no al verlos.");
    }
    for (var q = 0; q < diagram.DiagramObjects.Count && q < 6; q++) {
        var ob = diagram.DiagramObjects.GetAt(q);
        var nm = "(sin elemento)";
        try { if (ob.ElementID != 0) nm = String(ob.Object.Name); } catch (e5) { }
        R.push("  " + q + ": tipo='" + String(ob.Type) + "'  id=" + String(ob.ElementID) + "  " + nm);
        R.push("      l=" + String(ob.Left) + " r=" + String(ob.Right) + " t=" + String(ob.Top) + " b=" + String(ob.Bottom));
        try { R.push("      ancho=" + String(ob.Width) + " alto=" + String(ob.Height)); } catch (e6) { }
        try { R.push("      capa=" + String(ob.Layer)); } catch (e7) { }
    }
    R.push("");
    R.push("  LEE ESTO: si t sale POSITIVO, las coordenadas estan al reves.");
    R.push("  si ancho o alto salen 0, el objeto esta encogido y por eso");
    R.push("  no se ve nada.  las dos cosas son fallos.");
    R.push("");

    // ---------- 7. PROBAR A COLOCAR UN OBJETO ----------
    R.push("=== 7. PROBAR A COLOCAR UN OBJETO EN ESTE DIAGRAMA ===");
    probarColocar(diagram, p2);
    R.push("");

    R.push("=== 5. PROBA DE TIPOS DE DIAGRAMA ===");
    probarTiposDiagrama(p2);
    R.push("");
    R.push("=== 6. PROBA DE TIPOS DE ELEMENTO ===");
    probarTiposElemento(p1);
    R.push("");

    return cerrar(p1, p2);
}

function probarColocar(diagram, paq) {
    var antes = 0;
    try { antes = diagram.DiagramObjects.Count; } catch (e) { }
    R.push("  objetos antes de probar: " + antes);

    // A. un Shape con tipo vacio
    var a = prueba(diagram, "l=100;r=400;t=100;b=200;", "");
    R.push("  A  AddNew(tam, \"\")            -> " + a);
    // B. un Shape con tipo Shape
    var b = prueba(diagram, "l=100;r=400;t=300;b=400;", "Shape");
    R.push("  B  AddNew(tam, \"Shape\")       -> " + b);
    // C. un Shape con tipo Component
    var c = prueba(diagram, "l=100;r=400;t=500;b=600;", "Component");
    R.push("  C  AddNew(tam, \"Component\")   -> " + c);
    // D. un elemento Component de verdad
    var d = "";
    try {
        var el = paq.Elements.AddNew("PROBE Elemento", "Component");
        el.Update();
        paq.Elements.Refresh();
        var o = diagram.DiagramObjects.AddNew("l=100;r=400;t=700;b=800;", "");
        o.ElementID = el.ElementID;
        o.Update();
        d = "OK  se creo el elemento " + el.ElementID + " y el objeto en el diagrama" + SALTO + "        leido: l=" + String(o.Left) + " t=" + String(o.Top) + " r=" + String(o.Right) + " b=" + String(o.Bottom);
    } catch (e) {
        d = "FALLO " + descError(e);
    }
    R.push("  D  elemento Component + objeto -> " + d);
    R.push("");
    R.push("  LEE ESTO: si A, B, C o D dicen OK pero el diagrama sigue");
    R.push("  en blanco, el problema no es colocar, es que los objetos");
    R.push("  estan en una CAPA oculta.  Mira el apartado 3.");
}

function prueba(diagram, tam, tipo) {
    try {
        var o = diagram.DiagramObjects.AddNew(tam, tipo);
        o.ManuallySized = true;
        o.Update();
        return "OK  l=" + String(o.Left) + " t=" + String(o.Top) + " r=" + String(o.Right) + " b=" + String(o.Bottom);
    } catch (e) {
        return "FALLO " + descError(e);
    }
}

function probarTiposDiagrama(paq) {
    var tipos = ["Component", "ComponentDiagram", "Logical", "Class", "Structure", "Deployment"];
    for (var i = 0; i < tipos.length; i++) {
        var nombre = "PROBE Diag " + tipos[i];
        var res = "no ";
        try {
            var dg = paq.Diagrams.AddNew(nombre, tipos[i]);
            dg.Update();
            paq.Diagrams.Refresh();
            var leido = "?";
            try { leido = String(dg.Type); } catch (e1) { }
            res = "SI  lo ha creado y su Type se lee como " + leido;
        } catch (e) {
            res = "no  " + descError(e);
        }
        R.push("  " + tipos[i] + " -> " + res);
    }
    R.push("  BORA DESPUES los que pone PROBE, en el arbol del navegador.");
}

function probarTiposElemento(paq) {
    var tipos = ["Component", "ComponentPart", "Class", "Interface", "Package", "Node", "Device"];
    for (var i = 0; i < tipos.length; i++) {
        var res = "no ";
        try {
            var el = paq.Elements.AddNew("PROBE " + tipos[i], tipos[i]);
            el.Update();
            paq.Elements.Refresh();
            res = "SI  ElementID " + el.ElementID;
        } catch (e) {
            res = "no  " + descError(e);
        }
        R.push("  " + tipos[i] + " -> " + res);
    }
}

function cerrar(p1, p2) {
    R.push("");
    R.push("=== RESUMEN ===");
    R.push("  Copia TODO este texto y pegamelo.");
    R.push("  Siesta todo en PROBE, se puede borrar sin perder nada.");
    var txt = R.join(SALTO);
    try { p2.Notes = txt; p2.Update(); } catch (e) { }
    aviso(txt);
}

main();
