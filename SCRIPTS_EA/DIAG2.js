// ================================================================
// DIAG2 - MINIMO Y RAPIDO
// Un paquete, una clase, un atributo. Nada mas.
// El resultado va en el NOMBRE de la clase, que siempre se ve.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

function main()
{
    var raiz = Repository.Models.GetAt(0);

    var p = raiz.Packages.AddNew("DIAG2", "");
    p.Update();
    raiz.Packages.Refresh();

    var c = p.Elements.AddNew("DIAG2 prueba", "Class");
    c.Update();

    var resultado = "sin probar";

    try {
        c.AddAttribute("campo", "String");
        resultado = "AddAttribute2 OK count=" + c.Attributes.Count;
    } catch (e1) {
        try {
            c.Attributes.AddNew("campo", "String");
            resultado = "AttrAddNew2 OK count=" + c.Attributes.Count;
        } catch (e2) {
            try {
                c.AddAttribute("campo", "String", "");
                resultado = "AddAttribute3 OK count=" + c.Attributes.Count;
            } catch (e3) {
                resultado = "NINGUNA API FUNCIONA";
            }
        }
    }

    c.Name = "DIAG2 R " + resultado + " tipo=" + c.Type;
    c.Update();

    raiz.Packages.Refresh();
}

main();
