// ================================================================
// DIAG4 - MENSAJE DE ERROR Y ORDEN DE LLAMADAS
// 1) Captura el mensaje real de la excepcion de AddAttribute.
// 2) Prueba si el atributo se anade ANTES del Update del elemento.
//
// El resultado y los mensajes van en el NOMBRE de los elementos.
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
    if (t.length > 45) t = t.substring(0, 45);
    return t;
}

function main()
{
    var raiz = Repository.Models.GetAt(0);

    var p = raiz.Packages.AddNew("DIAG4", "");
    p.Update();
    raiz.Packages.Refresh();

    // A: AddAttribute DESPUES del Update (lo que haciamos siempre)
    var a = p.Elements.AddNew("DIAG4 A despues", "Class");
    a.Update();
    var errA = "sin error";
    try { a.AddAttribute("c", "String"); } catch (e) { errA = limpiar(e.description || e.message || e); }

    // B: AddAttribute ANTES del Update
    var b = p.Elements.AddNew("DIAG4 B antes", "Class");
    var errB = "sin error";
    try { b.AddAttribute("c", "String"); } catch (e) { errB = limpiar(e.description || e.message || e); }
    b.Update();

    // C: Attributes.AddNew ANTES del Update
    var c = p.Elements.AddNew("DIAG4 C antesNew", "Class");
    var errC = "sin error";
    try { c.Attributes.AddNew("c", "String"); } catch (e) { errC = limpiar(e.description || e.message || e); }
    c.Update();

    // D: AddAttribute 3 args ANTES del Update
    var d = p.Elements.AddNew("DIAG4 D antes3", "Class");
    var errD = "sin error";
    try { d.AddAttribute("c", "String", ""); } catch (e) { errD = limpiar(e.description || e.message || e); }
    d.Update();

    // E: elementos repetidos: EA no debe permitirlo, pero lo comprobamos
    var f = p.Elements.AddNew("DIAG4 E tag", "Class");
    f.Stereotype = "Entity";
    f.Update();
    var errE = "sin error";
    try { f.AddAttribute("c", "String"); } catch (e) { errE = limpiar(e.description || e.message || e); }

    try { a.Update(); } catch (e) { }
    try { f.Update(); } catch (e) { }

    function n(x) { try { return x.Attributes.Count; } catch (y) { return -1; } }

    var r = raiz.Elements.AddNew(
        "DIAG4 A=" + n(a) + " B=" + n(b) + " C=" + n(c) + " D=" + n(d) + " E=" + n(f),
        "Class"
    );
    try { r.Update(); } catch (e) { }

    var r2 = raiz.Elements.AddNew("DIAG4 errA=" + errA, "Class");
    try { r2.Update(); } catch (e) { }
    var r3 = raiz.Elements.AddNew("DIAG4 errD=" + errD, "Class");
    try { r3.Update(); } catch (e) { }

    raiz.Packages.Refresh();
}

main();
