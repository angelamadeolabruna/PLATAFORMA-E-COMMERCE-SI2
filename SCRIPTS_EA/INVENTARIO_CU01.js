// ================================================================
// INVENTARIO CU01 - SÓLO LECTURA
// No crea diagramas ni clases. Sólo crea un único elemento
// "INVENTARIO CU01" en la RAÍZ del modelo con el contenido real.
//
// Ese elemento queda en el primer nodo del árbol, así que es
// imposible no verlo.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var SALTO = String.fromCharCode(10);

var CLASES = [
    "Login", "AuthProvider", "api", "AuthController", "LoginRequest",
    "AuthService", "JwtTokenService", "SeguridadService", "DataSource",
    "BitacoraService", "AuthResponse", "Usuario", "UsuarioRol", "Rol",
    "BitacoraAuditoria"
];

var ACTORES = ["Administrador", "Encargado de Sucursal", "Cajero", "Cliente"];

// Recorre el modelo buscando un elemento por nombre y tipo.
function buscar(paquete, nombre, tipo, ruta)
{
    try {
        for (var i = 0; i < paquete.Elements.Count; i++) {
            var e = paquete.Elements.GetAt(i);
            if (String(e.Name) == nombre && (tipo == "" || String(e.Type) == tipo)) {
                return { elemento: e, ruta: ruta };
            }
        }
    } catch (ignore) { }

    try {
        for (var j = 0; j < paquete.Packages.Count; j++) {
            var sub = paquete.Packages.GetAt(j);
            var encontrado = buscar(sub, nombre, tipo, ruta + " / " + String(sub.Name));
            if (encontrado != null) return encontrado;
        }
    } catch (ignore) { }

    return null;
}

// Lista paquetes y diagramas que contengan "CU01".
function listarPaquetes(paquete, ruta, salida)
{
    try {
        for (var i = 0; i < paquete.Packages.Count; i++) {
            var sub = paquete.Packages.GetAt(i);
            var nombre = String(sub.Name);
            var nuevaRuta = ruta + " / " + nombre;

            if (nombre.toLowerCase().indexOf("cu01") >= 0) {
                salida = salida + "PAQUETE: " + nuevaRuta + SALTO;
            }

            salida = listarPaquetes(sub, nuevaRuta, salida);
        }
    } catch (ignore) { }

    return salida;
}

function listarDiagramas(paquete, ruta, salida)
{
    try {
        for (var i = 0; i < paquete.Diagrams.Count; i++) {
            var d = String(paquete.Diagrams.GetAt(i).Name);
            if (d.toLowerCase().indexOf("cu01") >= 0) {
                salida = salida + "DIAGRAMA: " + d + SALTO + "   en " + ruta + SALTO;
            }
        }
    } catch (ignore) { }

    try {
        for (var j = 0; j < paquete.Packages.Count; j++) {
            var sub = paquete.Packages.GetAt(j);
            salida = listarDiagramas(sub, ruta + " / " + String(sub.Name), salida);
        }
    } catch (ignore) { }

    return salida;
}

function agregarAtributo(elemento, nombre)
{
    try {
        for (var i = 0; i < elemento.Attributes.Count; i++) {
            if (String(elemento.Attributes.GetAt(i).Name) == nombre) return;
        }
    } catch (ignore) { }

    try {
        elemento.AddAttribute(nombre, "String", "");
    } catch (primerError) {
        try { elemento.AddAttribute(nombre, "String"); } catch (segundoError) {
            try { elemento.AddAttribute(nombre); } catch (tercerError) { }
        }
    }
}

function main()
{
    var raiz = Repository.Models.GetAt(0);

    // Crea el inventario en la raiz del modelo.
    var anterior = buscar(raiz, "INVENTARIO CU01", "", "");
    if (anterior != null) {
        try { anterior.elemento.Delete(); } catch (ignore) { }
    }

    var inv = raiz.Elements.AddNew("INVENTARIO CU01", "Class");
    try { inv.Stereotype = "Control"; } catch (ignore) { }

    agregarAtributo(inv, "COMPARTIMENTOS (tipo, atributos, operaciones)");

    var i;
    for (i = 0; i < CLASES.length; i++) {
        var encontrado = buscar(raiz, CLASES[i], "", "");
        var linea = "";

        if (encontrado == null) {
            linea = CLASES[i] + ": NO EXISTE";
        } else {
            var nAtr = -1;
            var nOpe = -1;
            try { nAtr = encontrado.elemento.Attributes.Count; } catch (e1) { }
            try { nOpe = encontrado.elemento.Methods.Count; } catch (e2) { }

            linea = CLASES[i] + ": tipo=" + encontrado.elemento.Type +
                ", atributos=" + nAtr + ", operaciones=" + nOpe;
        }

        agregarAtributo(inv, linea);
    }

    agregarAtributo(inv, "ACTORES");

    for (i = 0; i < ACTORES.length; i++) {
        var actor = buscar(raiz, ACTORES[i], "", "");
        var lineaActor = "";

        if (actor == null) {
            lineaActor = ACTORES[i] + ": NO EXISTE";
        } else {
            lineaActor = ACTORES[i] + ": tipo=" + actor.elemento.Type;
        }

        agregarAtributo(inv, lineaActor);
    }

    agregarAtributo(inv, "ESTRUCTURA DEL MODELO");
    agregarAtributo(inv, listarPaquetes(raiz, "raiz", ""));
    agregarAtributo(inv, listarDiagramas(raiz, "raiz", ""));

    try { inv.Update(); } catch (ignore) { }
    try { raiz.Elements.Refresh(); } catch (ignore) { }
}

main();
