// ================================================================
// DIAG5 - QUE TIPOS DE ELEMENTO ACEPTAN ATRIBUTOS
// Crea un elemento de cada tipo y prueba anadirle un atributo.
// El resultado de cada tipo queda en un elemento con ese nombre.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

function limpiar(texto)
{
    var t = String(texto);
    t = t.replace(/'/g, "");
    t = t.replace(/"/g, "");
    t = t.replace(/[\r\n]/g, " ");
    if (t.length > 40) t = t.substring(0, 40);
    return t;
}

function probar(raiz, tipo)
{
    var p = raiz.Packages.AddNew("DIAG5", "");
    try { p.Update(); } catch (ignore) { }
    try { raiz.Packages.Refresh(); } catch (ignore) { }

    var el = null;
    var errorCrear = "ok";

    try {
        el = p.Elements.AddNew("DIAG5 " + tipo, tipo);
    } catch (e) {
        errorCrear = limpiar(e.description || e.message || e);
    }

    if (el == null) {
        return "DIAG5 " + tipo + " NO SE PUDO CREAR " + errorCrear;
    }

    try { el.Update(); } catch (ignore) { }

    var tipoReal = "?";
    try { tipoReal = String(el.Type); } catch (ignore) { }

    var errorAttr = "ok";
    try { el.AddAttribute("c", "String"); } catch (e) {
        errorAttr = limpiar(e.description || e.message || e);
    }

    var n = -1;
    try { n = el.Attributes.Count; } catch (ignore) { }

    return "DIAG5 " + tipo + " tipoReal=" + tipoReal + " attrs=" + n + " err=" + errorAttr;
}

function main()
{
    var raiz = Repository.Models.GetAt(0);

    var tipos = ["Class", "Interface", "Object", "UseCase", "Analyst", "Boundary"];

    for (var i = 0; i < tipos.length; i++) {
        var nombre = probar(raiz, tipos[i]);
        var r = raiz.Elements.AddNew(nombre, "Class");
        try { r.Update(); } catch (e) { }
    }

    try { raiz.Elements.Refresh(); } catch (ignore) { }
}

main();
