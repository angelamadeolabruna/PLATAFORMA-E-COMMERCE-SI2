// ================================================================
// PRUEBA v5 - SIN POPUPS
// El resultado se escribe DENTRO del diagrama, asi que no hay
// dialogos que puedan confundirse con ejecuciones anteriores.
//
// Si en el diagrama aparece la clase "v5 EJECUTADO", este script
// si se ejecuto. Si no aparece, EA no esta corriendo este codigo.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

function salto()
{
    return String.fromCharCode(10);
}

function obtenerOCrearSubPaquete(padre, nombre)
{
    for (var i = 0; i < padre.Packages.Count; i++) {
        var sub = padre.Packages.GetAt(i);
        if (sub.Name == nombre) return sub;
    }

    var nuevo = padre.Packages.AddNew(nombre, "");
    nuevo.Update();
    padre.Packages.Refresh();
    return nuevo;
}

function buscarPorTipo(raiz, nombre, tipo)
{
    for (var i = 0; i < raiz.Elements.Count; i++) {
        var elemento = raiz.Elements.GetAt(i);
        if (elemento.Name == nombre && elemento.Type == tipo) {
            return elemento;
        }
    }

    for (var j = 0; j < raiz.Packages.Count; j++) {
        var encontrado = buscarPorTipo(raiz.Packages.GetAt(j), nombre, tipo);
        if (encontrado != null) return encontrado;
    }

    return null;
}

function agregarAtributo(elemento, nombre)
{
    try {
        for (var i = 0; i < elemento.Attributes.Count; i++) {
            if (String(elemento.Attributes.GetAt(i).Name) == nombre) return;
        }
    } catch (ignore) { }

    try {
        elemento.AddAttribute(nombre, "String");
    } catch (primerError) {
        try { elemento.AddAttribute(nombre); } catch (segundoError) { }
    }
}

function main()
{
    var raiz = Repository.Models.GetAt(0);
    var paquete = obtenerOCrearSubPaquete(raiz, "PRUEBA v5");

    for (var d = paquete.Diagrams.Count - 1; d >= 0; d--) {
        try { paquete.Diagrams.GetAt(d).Delete(); } catch (ignore) { }
    }
    try { paquete.Diagrams.Refresh(); } catch (ignore) { }

    var diagrama = null;
    try {
        diagrama = paquete.Diagrams.AddNew("PRUEBA v5", "Class");
    } catch (primerError) {
        diagrama = paquete.Diagrams.AddNew("PRUEBA v5", "ClassDiagram");
    }
    diagrama.Update();
    paquete.Diagrams.Refresh();

    // Caja testigo: si la ves en el diagrama, el script si corrio.
    var testigo = paquete.Elements.AddNew("v5 EJECUTADO", "Class");
    try { testigo.Stereotype = "Control"; } catch (ignore) { }
    agregarAtributo(testigo, "Este texto significa que el script v5 se ejecuto");
    try { testigo.Update(); } catch (ignore) { }

    // Cuatro actores.
    var nombres = ["Administrador", "Encargado de Sucursal", "Cajero", "Cliente"];
    var elementos = [];
    var i;

    for (i = 0; i < nombres.length; i++) {
        var actor = buscarPorTipo(raiz, nombres[i], "Actor");

        if (actor == null) {
            try {
                actor = paquete.Elements.AddNew("v5 " + nombres[i], "Actor");
            } catch (primerError) {
                actor = paquete.Elements.AddNew("v5 " + nombres[i], "Class");
            }
            actor.Update();
            paquete.Elements.Refresh();
        }

        try { actor.Alias = "ACTOR_" + nombres[i]; } catch (ignore) { }
        try { actor.Update(); } catch (ignore) { }

        elementos.push(actor);
    }

    // Coloca el testigo y los actores, y mide cada objeto.
    var izqTestigo = 20;
    var arribaTestigo = 20;

    try {
        var objetoTestigo = diagrama.DiagramObjects.AddNew(
            "l=" + izqTestigo + ";r=" + (izqTestigo + 400) +
            ";t=" + arribaTestigo + ";b=" + (arribaTestigo + 60) + ";",
            ""
        );
        objetoTestigo.ElementID = testigo.ElementID;
        objetoTestigo.ManuallySized = true;
        objetoTestigo.FontSize = 8;
        objetoTestigo.Update();
    } catch (ignore) {
    }

    for (i = 0; i < elementos.length; i++) {
        var izquierda = 20 + (i * 200);
        var arriba = 140;
        var ancho = 90;
        var alto = 100;

        var objeto = null;

        try {
            objeto = diagrama.DiagramObjects.AddNew(
                "l=" + izquierda + ";r=" + (izquierda + ancho) +
                ";t=" + arriba + ";b=" + (arriba + alto) + ";",
                "Actor"
            );
        } catch (primerError) {
            objeto = null;
        }

        if (objeto == null) {
            try {
                objeto = diagrama.DiagramObjects.AddNew(elementos[i].Name, "Actor");
            } catch (segundoError) {
                objeto = null;
            }
        }

        if (objeto == null) {
            agregarAtributo(testigo, "SIN OBJETO: " + elementos[i].Name);
            try { testigo.Update(); } catch (ignore) { }
            continue;
        }

        objeto.ElementID = elementos[i].ElementID;

        try { objeto.Shape = "Actor"; } catch (ignore) { }
        try { objeto.ManuallySized = true; } catch (ignore) { }
        try { objeto.Left = izquierda; } catch (ignore) { }
        try { objeto.Top = arriba; } catch (ignore) { }
        try { objeto.Right = izquierda + ancho; } catch (ignore) { }
        try { objeto.Bottom = arriba + alto; } catch (ignore) { }
        try { objeto.FontSize = 8; } catch (ignore) { }

        objeto.Update();

        var w = -1;
        var h = -1;
        try { w = Math.round(objeto.Width); } catch (e1) { }
        try { h = Math.round(objeto.Height); } catch (e2) { }

        agregarAtributo(testigo, elementos[i].Name + " (" + elementos[i].Type + ") " + w + "x" + h);
    }

    try { testigo.Update(); } catch (ignore) { }
    try { diagrama.Update(); } catch (ignore) { }
    try { paquete.Diagrams.Refresh(); } catch (ignore) { }
    try { paquete.Elements.Refresh(); } catch (ignore) { }

    Repository.OpenDiagram(diagrama.DiagramID);
}

main();
