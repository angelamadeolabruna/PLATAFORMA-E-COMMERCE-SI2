// ================================================================
// DIAG3 - SONDA DE FIRMAS
// Prueba 9 firmas de atributos y 3 de operaciones, cada una en su
// propia clase. Todo el resultado cabe en el NOMBRE de un elemento.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

function main()
{
    var raiz = Repository.Models.GetAt(0);

    var p = raiz.Packages.AddNew("DIAG3", "");
    p.Update();
    raiz.Packages.Refresh();

    var a = [];
    var i;

    for (i = 1; i <= 9; i++) {
        a[i] = p.Elements.AddNew("DIAG3 a" + i, "Class");
        a[i].Update();
    }

    var o1 = p.Elements.AddNew("DIAG3 o1", "Class");
    var o2 = p.Elements.AddNew("DIAG3 o2", "Class");
    var o3 = p.Elements.AddNew("DIAG3 o3", "Class");
    o1.Update(); o2.Update(); o3.Update();

    // 9 firmas de atributo
    try { a[1].AddAttribute("c", "String"); } catch (e) { }
    try { a[2].AddAttribute("c", "String", ""); } catch (e) { }
    try { a[3].AddAttribute("c", "String", "", 0); } catch (e) { }
    try { a[4].AddAttribute("c", "String", "", 0, 0); } catch (e) { }
    try { a[5].AddAttribute("c", "String", "", 0, 0, false); } catch (e) { }
    try { a[6].Attributes.AddNew("c", "String"); } catch (e) { }
    try { a[7].Attributes.AddNew("c", "String", ""); } catch (e) { }
    try { a[8].Attributes.AddNew("c", "String", "", 0); } catch (e) { }
    try { a[9].Attributes.AddNew("c", "String", "", 0, 0); } catch (e) { }

    // 3 firmas de operacion
    try { o1.AddOperation("m", "void", ""); } catch (e) { }
    try { o2.AddOperation("m", "void", "", ""); } catch (e) { }
    try { o3.Methods.AddNew("m", "void", ""); } catch (e) { }

    for (i = 1; i <= 9; i++) { try { a[i].Update(); } catch (e) { } }
    try { o1.Update(); } catch (e) { }
    try { o2.Update(); } catch (e) { }
    try { o3.Update(); } catch (e) { }

    function n(e) { try { return e.Attributes.Count; } catch (x) { return -1; } }
    function m(e) { try { return e.Methods.Count; } catch (x) { return -1; } }

    var r = raiz.Elements.AddNew(
        "DIAG3 attrs " +
        n(a[1]) + n(a[2]) + n(a[3]) + n(a[4]) + n(a[5]) +
        n(a[6]) + n(a[7]) + n(a[8]) + n(a[9]) +
        " ops " + m(o1) + m(o2) + m(o3) +
        " tipo " + a[1].Type,
        "Class"
    );

    try { r.Update(); } catch (e) { }

    raiz.Packages.Refresh();
}

main();
