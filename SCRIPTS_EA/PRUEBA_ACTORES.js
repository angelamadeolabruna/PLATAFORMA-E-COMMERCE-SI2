// ================================================================
// PRUEBA DE AISLAMIENTO - ACTORES EN DIAGRAMA DE CLASES
// Este script NO toca el diagrama de CU01. Solo crea un diagrama
// nuevo de prueba con 4 actores y mide si EA los dibuja.
//
// Si aqui los actores tampoco se ven, el problema es de EA/perfil
// y no del script de CU01.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

function avisar(texto)
{
    try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup(texto, 0, "PRUEBA ACTORES v4", 0);
    } catch (ignore) {
    }
}

function salto()
{
    return String.fromCharCode(10);
}

function buscarPaquete(paquete, nombre)
{
    if (paquete == null) return null;
    if (paquete.Name == nombre) return paquete;

    for (var i = 0; i < paquete.Packages.Count; i++) {
        var encontrado = buscarPaquete(paquete.Packages.GetAt(i), nombre);
        if (encontrado != null) return encontrado;
    }
    return null;
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

function main()
{
    avisar("PRUEBA ACTORES v4 - INICIANDO");

    var lineas = "";

    try {
        var raiz = Repository.Models.GetAt(0);

        var paquete = obtenerOCrearSubPaquete(raiz, "PRUEBA ACTORES v4");

        // Borra el diagrama de prueba anterior.
        for (var d = paquete.Diagrams.Count - 1; d >= 0; d--) {
            try { paquete.Diagrams.GetAt(d).Delete(); } catch (ignore) { }
        }
        try { paquete.Diagrams.Refresh(); } catch (ignore) { }

        var diagrama = null;
        try {
            diagrama = paquete.Diagrams.AddNew("PRUEBA ACTORES v4", "Class");
        } catch (primerError) {
            diagrama = paquete.Diagrams.AddNew("PRUEBA ACTORES v4", "ClassDiagram");
        }
        diagrama.Update();
        paquete.Diagrams.Refresh();

        var nombres = ["Administrador", "Encargado de Sucursal", "Cajero", "Cliente"];
        var elementos = [];
        var i;

        for (i = 0; i < nombres.length; i++) {
            var actor = buscarPorTipo(raiz, nombres[i], "Actor");

            if (actor == null) {
                try {
                    actor = paquete.Elements.AddNew(nombres[i], "Actor");
                } catch (primerError) {
                    actor = paquete.Elements.AddNew(nombres[i], "Class");
                }
                actor.Update();
                paquete.Elements.Refresh();
            }

            try { actor.Alias = "ACTOR_" + nombres[i]; } catch (ignore) { }
            try { actor.Update(); } catch (ignore) { }

            elementos.push(actor);
        }

        // Crea los objetos con forma explicita "Actor" y mide.
        for (i = 0; i < elementos.length; i++) {
            var izquierda = 20 + (i * 200);
            var arriba = 20;
            var ancho = 70;
            var alto = 80;

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
                lineas = lineas + elementos[i].Name + ": NO SE PUDO CREAR EL OBJETO" + salto();
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

            lineas = lineas + elementos[i].Name + " (" + elementos[i].Type + "): " +
                w + "x" + h + salto();
        }

        try { diagrama.Update(); } catch (ignore) { }
        try { paquete.Diagrams.Refresh(); } catch (ignore) { }
        Repository.OpenDiagram(diagrama.DiagramID);

        avisar(
            "PRUEBA ACTORES v4" + salto() +
            "Diagrama: PRUEBA ACTORES v4" + salto() +
            "Paquete: PRUEBA ACTORES v4" + salto() +
            "Objetos: " + diagrama.DiagramObjects.Count + salto() +
            salto() + lineas + salto() +
            "Revisa si los 4 actores se ven en el diagrama."
        );
    } catch (e) {
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        avisar("ERROR: " + detalle);
    }
}

main();
