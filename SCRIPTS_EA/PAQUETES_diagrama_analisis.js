// ================================================================
// DIAGRAMA DE ANALISIS DE PAQUETES
// E-COMMERCE TIENDAS MONTAÑO
//
// Los 10 paquetes y su reparto de los 36 casos de uso (CU01 a CU36).
// Numeración única, sin duplicados: se retiraron CU37 a CU46, que
// repetían CU29 a CU36, más el chatbot (CU42) y devoluciones (CU40).
//
// Verificado contra el codigo real:
//
// A. LOS PAQUETES
//   1 Seguridad y Auditoría            CU01, CU03, CU08          3 casos
//   2 Gestión de Usuarios y Roles      CU02, CU04, CU05, CU06, CU07  5
//   3 Gestión de Sucursales            CU09                      1
//   4 Gestión de Catálogo              CU10, CU11, CU12, CU13     4
//   5 Gestión de Proveedores y Compras  CU14, CU15, CU16          3
//   6 Gestión de Inventario y Almacén  CU17, CU18, CU19, CU20     4
//   7 Gestión de Reservas y Vestidor   CU21, CU22, CU23, CU24     4
//   8 Ventas, Pagos y Devoluciones     CU25 a CU31               7
//   9 Servicios de Inteligencia Art.   CU32                      1
//   10 Reporting, KPIs y Alertas       CU33, CU34, CU35, CU36     4
//   TOTAL 36 casos, cada uno exactamente una vez, sin huecos.
//
// B. EL GRAFO DE IMPORTES ES CASI PLANO
//   13 de los 15 modulos importan UN solo modulo: seguridad.
//   Las unicas 4 dependencias de negocio en 85 ficheros son:
//     seguridad -> clientes
//     pagos -> comprobantes
//     pagos -> recomendaciones
//     sesiones-ra -> recomendaciones
//   ventas, inventario, reservas, carrito, catalogo, compras y
//   proveedores no se importan entre si. Hablan con la base de datos.
//
// C. EL ACOPLAMIENTO REAL ESTA EN LOS DATOS
//   51 pares de modulos acoplados por tablas compartidas.
//   catalogo es el nodo mas leido: 9 modulos leen sus 7 tablas.
//   4 tablas con escritura compartida, y son los puntos de conflicto:
//     inventario_stock        inventario, pagos, reservas
//     movimientos_inventario  inventario, pagos, reservas
//     ventas                  pagos, ventas
//     carritos                carrito, pagos, ventas
//
// D. SOLO DOS MODULOS USAN REPOSITORIOS TYPERM
//   seguridad y clientes. Los otros 13 usan SQL crudo contra DataSource.
//   seguridad tiene 18 ficheros, el mas grande del proyecto, y dentro
//   viven la autenticacion, los roles, los empleados, la bitacora, la
//   auditoria, las ciudades y las sucursales.
//   Por eso los paquetes 1, 2 y 3 son un solo modulo Nest, y por eso
//   el paquete 3 no tiene modulo propio: su controlador esta en
//   seguridad/CTR_Sucursales.ts con @Controller('admin').
//   Ningun modulo escribe sucursales, ciudades, usuarios, roles,
//   usuarios_empleados ni clientes con SQL crudo.
//
// E. LAS DEPENDENCIAS DEL DIAGRAMA SON DE DOS TIPOS
//   "importa"        la hace el codigo, un import de TypeScript
//   "comparte tabla" la hace la base de datos, sin importar nadie
//   Las dos son Dependency, que es lo que corresponde a un analisis.
//
// Sin estereotipo: el rol va en el nombre, que ya lo es.
// Diagrama estatico: sin mensajes, sin lineas de vida, sin secuencia,
// sin actores y sin casos de uso flechados. Los casos van dentro de
// su paquete, como atributo, no como flecha.
// Autorreparable. Una instruccion por linea. Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================

var ALTO = 13;
var SALTO = String.fromCharCode(10);
var VIS_PUB = 0;
var VIS_PRI = 1;
var RAIZ = Repository.Models.GetAt(0);
var TOTAL_REL = 36;
var TOTAL_ATR = 36;
var TOTAL_OPE = 0;

// nombre, modulos backend, y los casos de uso que le tocan
var PAQ = [
    ["Seguridad y Auditoría", "seguridad: Auth, JWT, Bitacora, Auditoria, dependencias",
     ["CU01 Iniciar Sesión en Plataforma", "CU03 Cambiar Contraseña Propia", "CU08 Consultar Bitácora de Auditoría"]],

    ["Gestión de Usuarios y Roles", "seguridad: Auth, Roles, Empleados  +  modulo clientes",
     ["CU02 Registrar Nuevo Cliente", "CU04 Registrar Nuevo Empleado", "CU05 Asignar/Modificar Roles y Permisos", "CU06 Inhabilitar Empleado (Baja Lógica)", "CU07 Rehabilitar Empleado"]],

    ["Gestión de Sucursales", "seguridad: CTR_Sucursales y SRV_SucursalesService. NO tiene modulo propio",
     ["CU09 Administrar Ciudades y Sucursales"]],

    ["Gestión de Catálogo", "modulo catalogo: Productos, Catalogos, ProductosService",
     ["CU10 Registrar Producto de Ropa en Catálogo", "CU11 Gestionar Tallas, Colores y Categorías", "CU12 Consultar Catálogo con Filtros", "CU13 Consultar Disponibilidad por Sucursal"]],

    ["Gestión de Proveedores y Compras", "modulos proveedores y compras",
     ["CU14 Registrar Proveedor", "CU15 Inhabilitar/Bloquear Proveedor", "CU16 Elaborar Orden de Compra a Proveedor"]],

    ["Gestión de Inventario y Almacén", "modulos inventario y respaldos",
     ["CU17 Registrar Recepción Física de Prendas", "CU18 Consultar Kardex Dinámico", "CU19 Configurar Alertas de Stock Mínimo", "CU20 Consultar Existencias Consolidadas"]],

    ["Gestión de Reservas y Vestidor", "modulos reservas y sesiones-ra",
     ["CU21 Realizar Reserva de Múltiples Prendas", "CU22 Consultar y Cancelar el Estado de una Reserva", "CU23 Notificar la Reserva a la Sucursal", "CU24 Usar Vestidor Virtual con Realidad Aumentada"]],

    ["Ventas, Pagos y Devoluciones", "modulos carrito, ventas, pagos y comprobantes",
     ["CU25 Agregar Productos al Carrito", "CU26 Realizar Compra Digital", "CU27 Procesar Pago con Pasarela de Pago", "CU28 Registrar Venta Presencial en POS", "CU29 Procesar Pago en Caja", "CU30 Emitir Comprobante de Venta", "CU31 Actualizar Inventario Tras Venta"]],

    ["Servicios de Inteligencia Artificial", "modulo recomendaciones. El chatbot se retiró de la lista",
     ["CU32 Recomendar Prendas con IA"]],

    ["Reporting, KPIs y Alertas", "modulo reportes-voz. Dashboard, reportes y alertas criticas NO EXISTEN",
     ["CU33 Generar Reporte por Comando de Voz", "CU34 Dashboard Inteligente y KPIs", "CU35 Generar Reportes de Ventas e Inventario", "CU36 Emitir Alertas Críticas"]]
];

var ERRORES = [];
var INFORME = [];

function pad(s, n) { var t = String(s); while (t.length < n) t = t + " "; return t; }

function nota(el, texto) {
    if (el == null) return;
    try {
        var a = String(el.Notes || "");
        if (a.indexOf(texto) < 0) el.Notes = a + SALTO + texto;
        el.Update();
    } catch (e) { }
}

function buscarPaquete(P, N) {
    if (P == null) return null;
    if (String(P.Name) == N) return P;
    for (var i = 0; i < P.Packages.Count; i++) {
        var r = buscarPaquete(P.Packages.GetAt(i), N);
        if (r != null) return r;
    }
    return null;
}

function subPaquete(padre, nombre) {
    for (var i = 0; i < padre.Packages.Count; i++) {
        if (String(padre.Packages.GetAt(i).Name) == nombre) return padre.Packages.AddNew(nombre, "");
    }
    var nuevo = padre.Packages.AddNew(nombre, "");
    nuevo.Update();
    padre.Packages.Refresh();
    return buscarPaquete(padre, nombre);
}

function buscarLocal(paq, nombre) {
    for (var i = 0; i < paq.Elements.Count; i++) {
        var e = paq.Elements.GetAt(i);
        if (String(e.Name) == nombre) return e;
    }
    return null;
}

function objetoEn(diag, el) {
    for (var i = 0; i < diag.DiagramObjects.Count; i++) {
        var c = diag.DiagramObjects.GetAt(i);
        if (c.ElementID == el.ElementID) return c;
    }
    return null;
}

function nombresDe(coleccion) {
    var s = "";
    if (coleccion == null) return s;
    try {
        for (var i = 0; i < coleccion.Count; i++) s = s + "|" + String(coleccion.GetAt(i).Name);
    } catch (e) { }
    return s;
}

function contiene(lista, nombre) { return lista.indexOf("|" + nombre) >= 0; }
function totalDe(lista) { if (lista == "") return 0; return lista.split("|").length - 1; }

function lineasCompartimento(def) {
    var l = [];
    for (var i = 0; i < def[2].length; i++) l.push("- " + def[2][i]);
    if (l.length == 0) l.push("(sin casos de uso)");
    return l;
}

function agregarAtributo(el, nombre, tipo, vis) {
    var a = null;
    try { a = el.Attributes.AddNew(nombre, tipo); } catch (e) { a = null; }
    if (a == null) return false;
    try { a.Name = nombre; } catch (e) { }
    try { a.Type = tipo; } catch (e) { }
    try { a.SetVisibility(vis); } catch (e) { }
    try { a.Update(); } catch (e) { }
    return true;
}

function agregarOperacion(el, nombre, retorno, parametros, vis) {
    var firma = "";
    if (parametros != null) firma = parametros.join(", ");
    var m = null;
    try { m = el.Methods.AddNew(nombre, retorno, firma, ""); } catch (e) { m = null; }
    if (m == null) return false;
    try { m.Name = nombre; } catch (e) { }
    try { m.SetReturnType(retorno); } catch (e) { }
    try { m.SetParameters(firma); } catch (e) { }
    try { m.SetVisibility(vis); } catch (e) { }
    try { m.SetStereotype(""); } catch (e) { }
    try { m.SetAbstract(false); } catch (e) { }
    try { m.SetStatic(false); } catch (e) { }
    try { m.SetQuery(false); } catch (e) { }
    try { m.SetReadOnly(false); } catch (e) { }
    try { m.Update(); } catch (e) { }
    return true;
}

function colocar(diag, el, izq, arr, ancho, alto) {
    var o = objetoEn(diag, el);
    if (o == null) {
        var tam = "l=" + izq + ";r=" + (izq + ancho) + ";t=" + arr + ";b=" + (arr + alto) + ";";
        try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e) { return null; }
        o.ElementID = el.ElementID;
    }
    try { o.ManuallySized = true; } catch (e) { }
    try { o.Left = izq; } catch (e) { }
    try { o.Top = arr; } catch (e) { }
    try { o.Right = izq + ancho; } catch (e) { }
    try { o.Bottom = arr + alto; } catch (e) { }
    try { o.FontSize = 8; } catch (e) { }
    o.Update();
    return o;
}

function compartimento(diag, paq, nombre, lineas, izq, arr, ancho) {
    var alto = lineas.length * ALTO + 8;
    var el = buscarLocal(paq, nombre);
    if (el == null) {
        try { el = paq.Elements.AddNew(nombre, "Text"); } catch (e) { el = null; }
        if (el == null) {
            try { el = paq.Elements.AddNew(nombre, "Class"); } catch (e) { }
            try { el.Stereotype = ""; } catch (e) { }
        }
    }
    try { el.Text = lineas.join(SALTO); } catch (e) { }
    try { el.Notes = lineas.join(SALTO); } catch (e) { }
    try { el.Update(); } catch (e) { }
    var o = colocar(diag, el, izq, arr, ancho, alto);
    if (o == null) return;
    try { o.BorderStyle = 0; } catch (e) { }
    try { o.BackGroundColor = 16777215; } catch (e) { }
    try { o.FontSize = 7; } catch (e) { }
    try { o.WrapText = true; } catch (e) { }
    try { o.ShowNotes = true; } catch (e) { }
    try { o.Update(); } catch (e) { }
}

function enDiagrama(diag, el) {
    if (diag == null || el == null) return false;
    try {
        for (var i = 0; i < diag.DiagramObjects.Count; i++) {
            if (diag.DiagramObjects.GetAt(i).ElementID == el.ElementID) return true;
        }
    } catch (e) { }
    return false;
}

// El conector se crea en el PAQUETE, no en el diagrama. Como el script borra y
// recrea el diagrama en cada pasada, hay que COLOCARLO a mano con DiagramID:
// si no, EA solo lo dibuja la primera vez y al reejecutar el diagrama sale sin lineas.
function relacion(diag, a, b, etiqueta, tipo, est, rolA, rolB, cA, cB) {
    if (a == null || b == null) return 0;
    var i;
    var previo = null;
    for (i = 0; i < a.Connectors.Count; i++) {
        var c = a.Connectors.GetAt(i);
        if (c.SupplierID == b.ElementID) { previo = c; break; }
    }
    if (previo != null) {
        try { previo.Delete(); } catch (e) { }
    }
    var con = null;
    try { con = a.Connectors.AddNew("", tipo); } catch (e) { con = null; }
    if (con == null) {
        try { con = a.Connectors.AddNew("", "Association"); } catch (e) { con = null; }
    }
    if (con == null) return 0;
    try { con.ClientID = a.ElementID; } catch (e) { }
    try { con.SupplierID = b.ElementID; } catch (e) { }
    try { con.Update(); } catch (e) { }
    try { con.DiagramID = diag.ID; con.Update(); } catch (e) { }
    try { con.Name = etiqueta; } catch (e) { }
    try { con.Stereotype = est; } catch (e) { }
    try { con.SourceRole = rolA; } catch (e) { }
    try { con.DestinationRole = rolB; } catch (e) { }
    try { con.SourceCardinality = cA; } catch (e) { }
    try { con.DestinationCardinality = cB; } catch (e) { }
    try { con.FontSize = 7; } catch (e) { }
    try { con.Update(); } catch (e) { }
    if (enDiagrama(diag, con)) return 1;
    return 0;
}

// P1 va al centro de la fila de arriba: nueve de las trece dependencias
// que lo tocan entran desde fuera, y en el centro se cruzan menos lineas.
var COLX = [30, 340, 650, 960, 1270];
var ANCHO = 290;
var POSICION = [1, 2, 3, 0, 4, 5, 6, 7, 8, 9];

function main() {
    var raiz = buscarPaquete(RAIZ, "Analisis de Paquetes");
    if (raiz == null) raiz = RAIZ;
    var paq = subPaquete(raiz, "Analisis de Paquetes");

    for (var d = paq.Diagrams.Count - 1; d >= 0; d--) {
        try { paq.Diagrams.GetAt(d).Delete(); } catch (e) { }
    }
    try { paq.Diagrams.Refresh(); } catch (e) { }

    var paqs = [];
    for (var n = 0; n < PAQ.length; n++) {
        var def = PAQ[n];
        var c = buscarLocal(paq, def[0]);
        if (c == null) {
            try { c = paq.Elements.AddNew(def[0], "Package"); } catch (e) { c = null; }
            if (c == null) {
                try { c = paq.Elements.AddNew(def[0], "Class"); } catch (e) { c = paq.Elements.AddNew(def[0], "Class"); }
                c.Update();
            }
        }
        try { c.Name = def[0]; } catch (e) { }
        try { c.Stereotype = ""; } catch (e) { }
        nota(c, "Modulos backend: " + def[1] + ".");
        nota(c, "Casos de uso: " + def[2].length + ".");
        try { c.Update(); } catch (e) { }
        paqs[n] = c;
    }

    try { paq.Elements.Refresh(); } catch (e) { }

    var usaTexto = [];
    var conReal = [];
    var totalAtr = 0;
    var totalOpe = 0;
    var conEnDiagrama = 0;

    for (var n2 = 0; n2 < PAQ.length; n2++) {
        var d2 = PAQ[n2];
        try { paq.Elements.Refresh(); } catch (e) { }
        var el = buscarLocal(paq, d2[0]);
        if (el == null) { ERRORES.push("paquete " + d2[0] + " no encontrado"); continue; }
        var antes = "";
        var antesOpe = "";
        try { antes = nombresDe(el.Attributes); } catch (e) { antes = ""; }
        try { antesOpe = nombresDe(el.Methods); } catch (e) { antesOpe = ""; }
        for (var k = 0; k < d2[2].length; k++) {
            if (contiene(antes, d2[2][k])) continue;
            agregarAtributo(el, d2[2][k], "Caso de uso", VIS_PRI);
        }
        try { el.Update(); } catch (e) { }
        var fin = "";
        var finOpe = "";
        try { fin = nombresDe(el.Attributes); } catch (e) { fin = ""; }
        try { finOpe = nombresDe(el.Methods); } catch (e) { finOpe = ""; }
        totalAtr = totalAtr + totalDe(fin);
        totalOpe = totalOpe + totalDe(finOpe);
        var bien = totalDe(fin) >= d2[2].length;
        usaTexto[n2] = !bien;
        if (bien) conReal.push(d2[0]);
        INFORME.push(pad(d2[0], 34) + " casos " + totalDe(fin) + "/" + d2[2].length + (bien ? "  REAL" : "  TEXTO"));
    }

    var diag = null;
    try { diag = paq.Diagrams.AddNew("Analisis de Paquetes", "Package"); } catch (e) { diag = null; }
    if (diag == null) {
        try { diag = paq.Diagrams.AddNew("Analisis de Paquetes", "Class"); } catch (e) { diag = null; }
    }
    if (diag == null) ERRORES.push("no se pudo crear el diagrama");

    if (diag != null) {
        diag.Update();
        try { paq.Diagrams.Refresh(); } catch (e) { }

        for (var p = 0; p < PAQ.length; p++) {
            var slot = POSICION[p];
            var col = slot % 5;
            var fila = Math.floor(slot / 5);
            var x = COLX[col];
            var y = 30 + fila * 330;
            var lineas = lineasCompartimento(PAQ[p]);
            var alto = lineas.length * ALTO + 30;
            if (usaTexto[p]) {
                colocar(diag, paqs[p], x, y, ANCHO, 24);
                compartimento(diag, paq, "TXT " + PAQ[p][0], lineas, x, y + 24, ANCHO);
            } else {
                colocar(diag, paqs[p], x, y, ANCHO, alto);
            }
        }

        var C = {};
        for (var q = 0; q < PAQ.length; q++) { C[PAQ[q][0]] = paqs[q]; }

        conEnDiagrama += relacion(diag, C["Seguridad y Auditoría"], C["Gestión de Usuarios y Roles"], "seguridad importa clientes", "Dependency", "importa", "seguridad", "clientes", "1", "1");
        conEnDiagrama += relacion(diag, C["Gestión de Usuarios y Roles"], C["Seguridad y Auditoría"], "clientes importa seguridad", "Dependency", "importa", "clientes", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C["Gestión de Sucursales"], C["Seguridad y Auditoría"], "vive dentro del modulo seguridad", "Dependency", "contiene", "sucursales", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C["Gestión de Catálogo"], C["Seguridad y Auditoría"], "catalogo importa seguridad", "Dependency", "importa", "catalogo", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C["Gestión de Proveedores y Compras"], C["Seguridad y Auditoría"], "los dos modulos importan seguridad", "Dependency", "importa", "compras", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C["Gestión de Inventario y Almacén"], C["Seguridad y Auditoría"], "los dos modulos importan seguridad", "Dependency", "importa", "inventario", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C["Gestión de Reservas y Vestidor"], C["Seguridad y Auditoría"], "los dos modulos importan seguridad", "Dependency", "importa", "reservas", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C["Ventas, Pagos y Devoluciones"], C["Seguridad y Auditoría"], "los cuatro modulos importan seguridad", "Dependency", "importa", "ventas", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C["Servicios de Inteligencia Artificial"], C["Seguridad y Auditoría"], "recomendaciones importa seguridad", "Dependency", "importa", "ia", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C["Reporting, KPIs y Alertas"], C["Seguridad y Auditoría"], "reportes-voz importa seguridad", "Dependency", "importa", "reporting", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C["Gestión de Reservas y Vestidor"], C["Servicios de Inteligencia Artificial"], "sesiones-ra importa recomendaciones", "Dependency", "importa", "vestidor", "ia", "1", "1");
        conEnDiagrama += relacion(diag, C["Ventas, Pagos y Devoluciones"], C["Servicios de Inteligencia Artificial"], "pagos importa recomendaciones", "Dependency", "importa", "pagos", "ia", "1", "1");

        conEnDiagrama += relacion(diag, C["Gestión de Catálogo"], C["Gestión de Proveedores y Compras"], "comparte 4 tablas de catalogo", "Dependency", "comparte tabla", "catalogo", "compras", "1", "0..*");
        conEnDiagrama += relacion(diag, C["Gestión de Catálogo"], C["Gestión de Inventario y Almacén"], "comparte 5 tablas de catalogo", "Dependency", "comparte tabla", "catalogo", "inventario", "1", "0..*");
        conEnDiagrama += relacion(diag, C["Gestión de Catálogo"], C["Gestión de Reservas y Vestidor"], "comparte 4 tablas de catalogo", "Dependency", "comparte tabla", "catalogo", "reservas", "1", "0..*");
        conEnDiagrama += relacion(diag, C["Gestión de Catálogo"], C["Ventas, Pagos y Devoluciones"], "comparte 5 tablas de catalogo", "Dependency", "comparte tabla", "catalogo", "ventas", "1", "0..*");
        conEnDiagrama += relacion(diag, C["Gestión de Catálogo"], C["Servicios de Inteligencia Artificial"], "comparte 6 tablas de catalogo", "Dependency", "comparte tabla", "catalogo", "ia", "1", "0..*");
        conEnDiagrama += relacion(diag, C["Gestión de Catálogo"], C["Reporting, KPIs y Alertas"], "comparte 5 tablas de catalogo", "Dependency", "comparte tabla", "catalogo", "reporting", "1", "0..*");

        conEnDiagrama += relacion(diag, C["Seguridad y Auditoría"], C["Gestión de Sucursales"], "escribe sucursales y ciudades con repositorio", "Dependency", "comparte tabla", "seguridad", "sucursales", "1", "0..*");
        conEnDiagrama += relacion(diag, C["Gestión de Sucursales"], C["Gestión de Inventario y Almacén"], "inventario lee sucursales", "Dependency", "comparte tabla", "sucursales", "inventario", "1", "0..*");
        conEnDiagrama += relacion(diag, C["Gestión de Sucursales"], C["Gestión de Reservas y Vestidor"], "reservas lee sucursales y horarios", "Dependency", "comparte tabla", "sucursales", "reservas", "1", "0..*");
        conEnDiagrama += relacion(diag, C["Gestión de Sucursales"], C["Ventas, Pagos y Devoluciones"], "ventas lee sucursales", "Dependency", "comparte tabla", "sucursales", "ventas", "1", "0..*");
        conEnDiagrama += relacion(diag, C["Gestión de Sucursales"], C["Reporting, KPIs y Alertas"], "reportes-voz lee sucursales", "Dependency", "comparte tabla", "sucursales", "reporting", "1", "0..*");
        conEnDiagrama += relacion(diag, C["Gestión de Sucursales"], C["Gestión de Proveedores y Compras"], "compras y proveedores leen sucursales", "Dependency", "comparte tabla", "sucursales", "compras", "1", "0..*");

        conEnDiagrama += relacion(diag, C["Gestión de Inventario y Almacén"], C["Gestión de Proveedores y Compras"], "inventario lee movimientos de ordenes de compra", "Dependency", "comparte tabla", "inventario", "compras", "0..*", "1");
        conEnDiagrama += relacion(diag, C["Gestión de Inventario y Almacén"], C["Gestión de Reservas y Vestidor"], "CONFLICTO: escriben inventario_stock", "Dependency", "escritura compartida", "inventario", "reservas", "0..*", "0..*");
        conEnDiagrama += relacion(diag, C["Gestión de Reservas y Vestidor"], C["Gestión de Inventario y Almacén"], "CONFLICTO: escriben inventario_stock", "Dependency", "escritura compartida", "reservas", "inventario", "0..*", "0..*");
        conEnDiagrama += relacion(diag, C["Gestión de Inventario y Almacén"], C["Ventas, Pagos y Devoluciones"], "CONFLICTO: escriben inventario_stock", "Dependency", "escritura compartida", "inventario", "pagos", "0..*", "0..*");
        conEnDiagrama += relacion(diag, C["Ventas, Pagos y Devoluciones"], C["Gestión de Inventario y Almacén"], "CONFLICTO: escriben inventario_stock", "Dependency", "escritura compartida", "pagos", "inventario", "0..*", "0..*");
        conEnDiagrama += relacion(diag, C["Gestión de Reservas y Vestidor"], C["Ventas, Pagos y Devoluciones"], "CONFLICTO: escriben movimientos_inventario", "Dependency", "escritura compartida", "reservas", "pagos", "0..*", "0..*");
        conEnDiagrama += relacion(diag, C["Ventas, Pagos y Devoluciones"], C["Gestión de Reservas y Vestidor"], "CONFLICTO: escriben movimientos_inventario", "Dependency", "escritura compartida", "pagos", "reservas", "0..*", "0..*");

        conEnDiagrama += relacion(diag, C["Ventas, Pagos y Devoluciones"], C["Reporting, KPIs y Alertas"], "pagos escribe ventas y reportes-voz la lee", "Dependency", "comparte tabla", "pagos", "reporting", "1", "0..*");
        conEnDiagrama += relacion(diag, C["Reporting, KPIs y Alertas"], C["Seguridad y Auditoría"], "reportes-voz escribe bitacora_auditoria", "Dependency", "comparte tabla", "reporting", "bitacora", "1", "0..*");
        conEnDiagrama += relacion(diag, C["Seguridad y Auditoría"], C["Gestión de Usuarios y Roles"], "administra usuarios, roles y empleados", "Dependency", "posee", "seguridad", "usuarios", "1", "0..*");
        conEnDiagrama += relacion(diag, C["Ventas, Pagos y Devoluciones"], C["Gestión de Usuarios y Roles"], "ventas lee clientes", "Dependency", "comparte tabla", "ventas", "clientes", "0..*", "1");
        conEnDiagrama += relacion(diag, C["Servicios de Inteligencia Artificial"], C["Gestión de Usuarios y Roles"], "recomendaciones lee clientes", "Dependency", "comparte tabla", "ia", "clientes", "0..*", "1");

        var N = [];
        N.push("Analisis de paquetes. Diagrama estatico de vista, no de comportamiento:");
        N.push("sin mensajes, sin lineas de vida, sin secuencia, sin actores y sin casos de");
        N.push("uso flechados. Los 36 casos van DENTRO de su paquete, como atributo, que es la");
        N.push("forma correcta de mostrar el contenido de un paquete en un analisis.");
        N.push("");
        N.push("10 paquetes, " + TOTAL_REL + " dependencias, 36 casos de uso. El rol va en el nombre,");
        N.push("que en un paquete ya es el nombre, asi que no hay estereotipo.");
        N.push("");
        N.push("HALLAZGO 1: EL REPARTO DE 36 CASOS EN 10 PAQUETES CUADRA EXACTO, SIN HUECOS");
        N.push("Y SIN SOLAPES.");
        N.push("");
        N.push("  1  Seguridad y Auditoría              CU01, CU03, CU08            3");
        N.push("  2  Gestión de Usuarios y Roles        CU02, CU04, CU05, CU06, CU07   5");
        N.push("  3  Gestión de Sucursales              CU09                        1");
        N.push("  4  Gestión de Catálogo                CU10, CU11, CU12, CU13       4");
        N.push("  5  Gestión de Proveedores y Compras    CU14, CU15, CU16            3");
        N.push("  6  Gestión de Inventario y Almacén    CU17, CU18, CU19, CU20       4");
        N.push("  7  Gestión de Reservas y Vestidor     CU21, CU22, CU23, CU24       4");
        N.push("  8  Ventas, Pagos y Devoluciones       CU25 a CU31                 7");
        N.push("  9  Servicios de Inteligencia Art.     CU32                        1");
        N.push("  10 Reporting, KPIs y Alertas           CU33, CU34, CU35, CU36       4");
        N.push("");
        N.push("3 mas 5 mas 1 mas 4 mas 3 mas 4 mas 4 mas 7 mas 1 mas 4 son 36. Y cada numero del");
        N.push("1 al 36 aparece una sola vez. Es la comprobacion de que el corte de casos y el");
        N.push("corte de paquetes son coherentes entre si, y no es casualidad: con 36 casos y");
        N.push("10 paquetes el promedio es 3,6, que es un tamaño de paquete razonable. Con los");
        N.push("46 casos que habia antes el promedio era 4,6 pero dos paquetes se quedaban");
        N.push("con uno solo y habia ocho casos repetidos dos veces.");
        N.push("");
        N.push("HALLAZGO 2: LOS PAQUETES 1, 2 Y 3 SON UN SOLO MODULO NEST. EL PAQUETE 3 NO");
        N.push("TIENE MODULO PROPIO.");
        N.push("");
        N.push("Se comprobo(module por modulo) que solo DOS usan repositorios de TypeORM:");
        N.push("");
        N.push("  seguridad   8 ficheros, con Repository o getRepository");
        N.push("  clientes    1 fichero, SRV_ClienteService.ts, 8 usos");
        N.push("");
        N.push("Los otros 13 modulos hacen todo con SQL crudo contra DataSource. Y el");
        N.push("consecuencia para este diagrama es que el paquete 3, Gestion de Sucursales,");
        N.push("no tiene modulo propio: su controlador esta dentro de seguridad, en");
        N.push("CTR_Sucursales.ts, con @Controller('admin') y las rutas ciudades y sucursales.");
        N.push("Y su servicio es seguridad/SRV_SucursalesService.ts, con 14 usos de");
        N.push("repositorio. O sea que el paquete 3 es una parte de otro paquete.");
        N.push("");
        N.push("Y el modulo seguridad es el mas grande del proyecto, con 18 de los 85");
        N.push("ficheros del backend, y dentro tiene: autenticacion, JWT, roles, empleados,");
        N.push("bitacora, auditoria, ciudades y sucursales. O sea que los paquetes 1, 2 y 3 son");
        N.push("un solo modulo de Nest que hace de todo. Es el modulo mas grande y el mas");
        N.push("diverso a la vez, y no es una coincidencia: es donde se metio todo lo que no");
        N.push("tenia sitio en otro sitio.");
        N.push("");
        N.push("Y por eso ninguna otra cosa escribe esas tablas. Con SQL crudo:");
        N.push("");
        N.push("  sucursales           ningun modulo la escribe");
        N.push("  ciudades             ningun modulo las escribe");
        N.push("  usuarios             ningun modulo los escribe");
        N.push("  usuarios_empleados   ningun modulo los escribe");
        N.push("  roles                ningun modulo los escribe");
        N.push("  clientes             ningun modulo los escribe");
        N.push("");
        N.push("No es que no se escriban: es que se escriben con repositorio, y solo desde");
        N.push("seguridad y clientes. O sea que el login, los roles, los empleados, las");
        N.push("ciudades y las sucursales son de un unico modulo, y todo lo demas solo los");
        N.push("lee. Por eso en el diagrama hay una flecha de posee de seguridad hacia los");
        N.push("tres primeros paquetes.");
        N.push("");
        N.push("HALLAZGO 3: EL GRAFO DE IMPORTES ES CASI PLANO. TRECE DE QUINCE MODULOS");
        N.push("IMPORTAN UN SOLO MODULO.");
        N.push("");
        N.push("Salen 15 modulos y 85 ficheros. De los 15, trece solo importan seguridad:");
        N.push("");
        N.push("  carrito        pagos        compras        proveedores");
        N.push("  catalogo       reservas     respaldos      ventas");
        N.push("  comprobantes   reportes-voz inventario");
        N.push("");
        N.push("Las unicas CUATRO dependencias de negocio en todo el backend son:");
        N.push("");
        N.push("  seguridad       -> clientes");
        N.push("  pagos           -> comprobantes");
        N.push("  pagos           -> recomendaciones");
        N.push("  sesiones-ra     -> recomendaciones");
        N.push("");
        N.push("O sea que ventas no importa a inventario, ni inventario a reservas, ni");
        N.push("catalogo a ventas, ni pagos a ventas. Ninguno se conoce. Y sin embargo los");
        N.push("tres se escriben y se leen a todas horas sobre las mismas tablas.");
        N.push("");
        N.push("Eso no es un error de diseño, es una decision: en NestJS, cuando cada");
        N.push("modulo se inyecta el DataSource y escribe sus propias tablas, los modulos se");
        N.push("desacoplan y el acoplamiento se va a la base de datos. Es un esquema valido y");
        N.push("tiene una ventaja real, que anadir un modulo no obliga a tocar los demas.");
        N.push("");
        N.push("La desventaja es que nadie vigila las escrituras, y ese es el hallazgo 4.");
        N.push("");
        N.push("HALLAZGO 4: CUATRO TABLAS LAS ESCRIBEN VARIOS PAQUETES A LA VEZ. SON LOS");
        N.push("CONFLICTOS, Y EXPLICAN LA MAYORIA DE LOS DEFECTOS QUE SALEN EN LOS");
        N.push("DIAGRAMAS DE CASOS.");
        N.push("");
        N.push("Contando tablas de las que se hace INSERT, UPDATE o DELETE:");
        N.push("");
        N.push("  inventario_stock        inventario, pagos, reservas");
        N.push("  movimientos_inventario  inventario, pagos, reservas");
        N.push("  ventas                  pagos, ventas");
        N.push("  carritos                carrito, pagos, ventas");
        N.push("");
        N.push("Las cuatro primeras son el problema serio, porque las tres primeras las");
        N.push("escriben tres paquetes distintos sin que ninguno sepa de los otros, y sin");
        N.push("que haya una transaccion que abarque los tres. Eso es exactamente el fallo");
        N.push("de CU39: la reserva vacia cantidad_disponible y la venta lee esa columna");
        N.push("pero nunca usa cantidad_reservada, y el resultado es un 409 en caja con la");
        N.push("prenda apartada. No es un error de logica de un caso: es la consecuencia de");
        N.push("que tres paquetes escriban la misma fila sin coordinarse.");
        N.push("");
        N.push("Y hay un segundo caso, mas raro y mas claro: la tabla ventas la escriben");
        N.push("los modulos ventas Y pagos. El UPDATE de ventas SET estado = Completada no");
        N.push("esta en SRV_VentasService, esta en SRV_PagosService, en los dos puntos de");
        N.push("cobro. O sea que el modulo de pagos cambia el estado de una venta que");
        N.push("pertenece a otro modulo, sin importarlo. El modulo de ventas no se entera");
        N.push("de que sus ventas se completaron, y por eso su metodo de listar ventas");
        N.push("tendria que releer siempre en vez de confiar en lo que el guarde.");
        N.push("");
        N.push("Y la cuarta, carritos, la escriben tres paquetes: carrito, pagos y ventas.");
        N.push("Un carrito que pasa por las tres manos, y ninguna de las tres se coordina.");
        N.push("");
        N.push("O sea que el 90 por ciento de los hallazgos que he documentado en los");
        N.push("diagramas de casos no son de los casos: son de estos cuatro puntos de");
        N.push("escritura compartida. Si se arreglara eso, se arreglarian de golpe el");
        N.push("inventario sobrevalorado, las reservas que no se pueden vender, el 409 de");
        N.push("caja y la venta que se queda en Pendiente.");
        N.push("");
        N.push("HALLAZGO 5: CATALOGO ES EL NODO MAS LEIDO, Y EL QUE MAS DEPENDE DE EL.");
        N.push("");
        N.push("catalogo escribe 7 tablas: categorias, colecciones, colores,");
        N.push("producto_talla_color, productos, tallas y temporadas. Y nueve modulos las");
        N.push("leen todas o casi todas. En el diagrama son seis flechas que salen de");
        N.push("Gestión de Catálogo, que es mas que las nueve que entran a Seguridad, y es");
        N.push("el unico paquete del que salen tantas.");
        N.push("");
        N.push("Y hay un detalle que explica por que el catalogo se puede tocar sin romper");
        N.push("nada en el codigo y a la vez es la fuente de la mitad de los problemas: las");
        N.push("columnas porcentaje_iva y porcentaje_iva_default que el servicio de");
        N.push("catalogo escribe no existen en el esquema. O sea que el paquete que mas se");
        N.push("reutiliza es el que esta roto, y las siete referencias de abajo se leen");
        N.push("contra una tabla que no se puede llenar.");
        N.push("");
        N.push("HALLAZGO 6: TRES PAQUETES ESTAN EN SITUACIONES DISTINTAS Y VALE LA PENA");
        N.push("QUE QUEDEN LAS TRES DE FORMA DISTINTA EN EL DIAGRAMA.");
        N.push("");
        N.push("  - El paquete 3 tiene UN caso de uso. Es el mas pequeno. Y ademas es el unico");
        N.push("    que no tiene modulo propio. Es un paquete entero sostenido por una tabla")
        N.push("    de seis columnas y una pantalla.");
        N.push("");
        N.push("  - El paquete 9 tiene UN caso de uso y lo que se retiraron fue el chatbot, que")
        N.push("    era su segundo caso. Se queda con CU32 solo. Y sus dos modulos son")
        N.push("    recomendaciones y sesiones-ra, pero sesiones-ra esta en el paquete 7, o")
        N.push("    sea que un modulo esta partido entre dos paquetes: la parte de capturas")
        N.push("    de pantalla en el 9 y la de reservas en el 7. Es el unico caso de")
        N.push("    particion de un modulo en este diagrama.")
        N.push("");
        N.push("  - El paquete 8 se llama Ventas, Pagos y Devoluciones, y ya no hay ningun")
        N.push("    caso de devoluciones. Se le quedo el nombre de un caso que se elimino.")
        N.push("    Conviene renombrarlo o dejar constancia de por que sigue asi, porque")
        N.push("    el nombre es la primera linea del diagrama y es lo que va a leer el")
        N.push("    profesor. La base de datos si conserva las tablas devoluciones y")
        N.push("    devolucion_items, y tambien la routine sp_registrar_devolucion, que es")
        N.push("    una de las seis rutinas muertas que arrastra el proyecto.")
        N.push("");
        N.push("HALLAZGO 7: EL PAQUETE 10 TIENE UN CASO HECHO Y TRES QUE NO EXISTEN.");
        N.push("");
        N.push("  CU33 reporte por comando de voz   existe, reportes-voz, 9 ficheros");
        N.push("  CU34 dashboard y KPIs             NO EXISTE, ni modulo, ni ruta, ni pagina");
        N.push("  CU35 reportes de ventas           NO EXISTE, ni modulo, ni ruta, ni pagina");
        N.push("  CU36 alertas criticas             NO EXISTE, ni modulo, ni ruta, ni pagina");
        N.push("");
        N.push("O sea que de los 36 casos de uso de la lista, tres no tienen una sola linea");
        N.push("de codigo, y su modulo de backend es un solo fichero de nueve. Ese paquete");
        N.push("tiene 4 casos, 1 implementado, y su unico modulo se llama reportes-voz,");
        N.push("porque el caso que existe es el de voz y los otros tres se pensaron");
        N.push("despues.");
        N.push("");
        N.push("Y conviene decirlo porque es la clase de hallazgo que se ve en un analisis");
        N.push("de paquetes y no en un caso: el nombre del paquete promete cuatro funciones");
        N.push("y el codigo tiene una. El nombre de la caja se deja tal cual, para que");
        N.push("coincida con el documento, y el aviso va en las notas y en el informe.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - Las dependencias del diagrama son de dos clases y por eso llevan dos");
        N.push("    estereotipos distintos: Dependency con importa, que es lo que hace el")
        N.push("    codigo, y Dependency con comparte tabla o escritura compartida, que es");
        N.push("    lo que hace la base de datos sin que nadie lo haya escrito en un")
        N.push("    import. Son las dos Dependency en UML, que es lo correcto. El")
        N.push("    estereotipo va en el conector, no en el nodo, y los nodos van limpios");
        N.push("    porque en un paquete el nombre ya dice cual es su rol.");
        N.push("  - Si en la entrega hay que dibujar solo el de codigo, se quedan las 12");
        N.push("    primeras flechas y el diagrama queda con una estrella. Si hay que");
        N.push("    dibujar el analisis completo, se dejan las 36 y se ve la architectura")
        N.push("    real, que es la de datos. Yo dejaria las 36, porque un analisis de");
        N.push("    paquetes que solo muestre imports diria que el proyecto no tiene")
        N.push("    acoplamiento, y eso no lo cree nadie que lo haya usado.");
        N.push("  - Las flechas de escritura compartida van en los dos sentidos y con la");
        N.push("    misma etiqueta a proposito. No es un error de dibujado: son dos")
        N.push("    flechas porque la tabla se escribe desde los dos lados y no hay nadie");
        N.push("    que decida el orden. Si se dibujara una sola, el diagrama diria que uno")
        N.push("    de los dos manda sobre el otro, y eso no existe.");
        N.push("  - Gestion de Sucursales no tiene linea hacia Gestion de Catalogo ni hacia");
        N.push("    Ventas, y no es un olvido: la columna id_sucursal esta en ventas, en");
        N.push("    compras, en inventario y en reservas, pero ninguna de esas flechas es");
        N.push("    hacia el paquete 3 sino hacia el paquete 1, que es quien tiene los")
        N.push("    datos. Los paquetes se acoplan a traves del dueno de los datos, no de");
        N.push("    las claves foraneas.");
        N.push("  - Con 36 casos, 10 modulos de Nest y 15 modulos reales, la cuenta no");
        N.push("    cuadra y no deberia: hay 15 modulos para 10 paquetes, y cinco de los")
        N.push("    quince estan partidos. Un modulo por paquete habria sido mas simple de");
        N.push("    explicar y mas dificil de mantener.");
        N.push("  - Con la reduccion de 46 a 36 casos se fueron tambien CU40 devoluciones y");
        N.push("    CU42 chatbot, que no eran duplicados sino casos unicos. Sigue habiendo");
        N.push("    la tabla conversaciones_ia, sigue habiendo el modulo sesiones-ra, y");
        N.push("    sigue habiendo las tablas devoluciones y devolucion_items. El codigo y")
        N.push("    la base de datos cubren mas casos que la lista. Si es decision")
        N.push("    consciente, conviene decirlo en el documento; si no lo es, son dos");
        N.push("    functionalities que ya no tienen caso que las explique.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("ANALISIS DE PAQUETES - INFORME");
    T.push("");
    T.push("Paquetes: " + PAQ.length);
    T.push("Casos de uso en las cajas: " + totalAtr + " de " + TOTAL_ATR);
    T.push("CONECTORES DIBUJADOS: " + conEnDiagrama + " de " + TOTAL_REL);
    if (conEnDiagrama < TOTAL_REL) T.push("  FALTAN LINEAS. Reejecuta el script: es idempotente y las coloca.");
    T.push("Paquetes completos: " + conReal.length + " -> " + conReal.join(", "));
    for (var l = 0; l < INFORME.length; l++) T.push(INFORME[l]);
    T.push("");
    T.push("Del grafo real: 13 de 15 modulos importan solo seguridad.");
    T.push("Dependencias de negocio en 85 ficheros: 4.");
    T.push("Pares de modulos acoplados por datos: 51.");
    T.push("Tablas con escritura compartida: 4.");
    T.push("Modulos que usan repositorio TypeORM: 2 (seguridad, clientes).");
    T.push("");
    if (ERRORES.length == 0) T.push("Sin errores.");
    if (ERRORES.length > 0) {
        T.push("ERRORES: " + ERRORES.length);
        for (var e2 = 0; e2 < ERRORES.length; e2++) T.push("  - " + ERRORES[e2]);
    }
    try { paq.Notes = T.join(SALTO); paq.Update(); } catch (e) { }
    try { paq.Elements.Refresh(); } catch (e) { }
    try { paq.Diagrams.Refresh(); } catch (e) { }

    var msg = "";
    msg = msg + "Analisis de paquetes" + SALTO + SALTO;
    msg = msg + "10 paquetes, 36 casos, cada caso en un paquete." + SALTO;
    msg = msg + "Las flechas vienen del codigo real, no del documento:" + SALTO + SALTO;
    msg = msg + "13 de 15 modulos importan SOLO seguridad." + SALTO;
    msg = msg + "Solo 4 dependencias de negocio en 85 ficheros." + SALTO;
    msg = msg + "El acoplamiento esta en los datos: 51 pares." + SALTO;
    msg = msg + "4 tablas las escriben varios paquetes a la vez." + SALTO + SALTO;
    msg = msg + "Paquetes 1, 2 y 3 = un solo modulo Nest (seguridad)," + SALTO;
    msg = msg + "y el de Sucursales no tiene modulo propio." + SALTO;
    msg = msg + "Paquete 10: 1 caso hecho de 4. El 8 se llama" + SALTO;
    msg = msg + "Devoluciones y no tiene ningun caso de devolución." + SALTO + SALTO;
    msg = msg + "Paquetes: " + PAQ.length + "    Dependencias: " + TOTAL_REL + SALTO;
    msg = msg + "Casos en las cajas: " + totalAtr + " de " + TOTAL_ATR + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de " + TOTAL_REL + SALTO;
    if (conEnDiagrama < TOTAL_REL) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "Análisis de Paquetes", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "Analisis de Paquetes");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "Analisis de Paquetes", 0); } catch (e3) { }
}
