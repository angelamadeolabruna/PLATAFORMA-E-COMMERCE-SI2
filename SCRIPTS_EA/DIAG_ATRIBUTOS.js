// ================================================================
// DIAGNOSTICO DE ATRIBUTOS
// El resultado va en el NOMBRE del elemento, porque el nombre
// siempre se ve en el arbol. Si aqui tampoco hay triángulo de
// expansión, el problema no son los atributos sino la vista.
//
// Prueba 4 APIs distintas de EA para crear atributos.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

function borrar(paquete, nombre)
{
    try {
        for (var i = paquete.Elements.Count - 1; i >= 0; i--) {
            var e = paquete.Elements.GetAt(i);
            if (String(e.Name).indexOf(nombre) == 0) {
                try { e.Delete(); } catch (ignore) { }
            }
        }
    } catch (ignore) { }

    try { paquete.Elements.Refresh(); } catch (ignore) { }
}

// API 1: AddAttribute con 2 argumentos
function api1(elemento, nombre, tipo)
{
    try { elemento.AddAttribute(nombre, tipo); } catch (e) { return false; }
    return true;
}

// API 2: AddAttribute con 3 argumentos
function api2(elemento, nombre, tipo)
{
    try { elemento.AddAttribute(nombre, tipo, ""); } catch (e) { return false; }
    return true;
}

// API 3: Attributes.AddNew con 2 argumentos
function api3(elemento, nombre, tipo)
{
    try { elemento.Attributes.AddNew(nombre, tipo); } catch (e) { return false; }
    return true;
}

// API 4: Attributes.AddNew con 3 argumentos
function api4(elemento, nombre, tipo)
{
    try { elemento.Attributes.AddNew(nombre, tipo, ""); } catch (e) { return false; }
    return true;
}

function contar(elemento)
{
    try { return elemento.Attributes.Count; } catch (e) { return -1; }
}

function main()
{
    var raiz = Repository.Models.GetAt(0);

    borrar(raiz, "DIAG");

    // Crea 4 clases de prueba, una por API.
    var t1 = raiz.Elements.AddNew("DIAG A1 AddAttribute2", "Class");
    var t2 = raiz.Elements.AddNew("DIAG A2 AddAttribute3", "Class");
    var t3 = raiz.Elements.AddNew("DIAG A3 AttrAddNew2", "Class");
    var t4 = raiz.Elements.AddNew("DIAG A4 AttrAddNew3", "Class");

    try { t1.Update(); } catch (ignore) { }
    try { t2.Update(); } catch (ignore) { }
    try { t3.Update(); } catch (ignore) { }
    try { t4.Update(); } catch (ignore) { }

    api1(t1, "campoUno", "String");
    api2(t2, "campoUno", "String");
    api3(t3, "campoUno", "String");
    api4(t4, "campoUno", "String");

    try { t1.Update(); } catch (ignore) { }
    try { t2.Update(); } catch (ignore) { }
    try { t3.Update(); } catch (ignore) { }
    try { t4.Update(); } catch (ignore) { }

    var c1 = contar(t1);
    var c2 = contar(t2);
    var c3 = contar(t3);
    var c4 = contar(t4);

    // Tambien prueba operaciones con la misma logica.
    var o1 = -1;
    try {
        var m1 = raiz.Elements.AddNew("DIAG M1 AddOperation", "Class");
        m1.Update();
        try { m1.AddOperation("hacer", "void", ""); } catch (e1) {
            try { m1.Methods.AddNew("hacer", "void", ""); } catch (e2) { }
        }
        m1.Update();
        o1 = m1.Methods.Count;
    } catch (ignore) { o1 = -2; }

    // El nombre lleva el resultado: siempre es visible en el arbol.
    var resumen = raiz.Elements.AddNew(
        "DIAG RESULTADO A1=" + c1 + " A2=" + c2 + " A3=" + c3 + " A4=" + c4 +
        " Ops=" + o1 + " TipoA1=" + t1.Type,
        "Class"
    );

    try { resumen.Update(); } catch (ignore) { }

    try { raiz.Elements.Refresh(); } catch (ignore) { }
}

main();
