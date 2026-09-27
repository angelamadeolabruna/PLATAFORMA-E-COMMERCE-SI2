// ================================================================
// CU12 - ADMINISTRAR CIUDADES Y SUCURSALES
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   web/src/pages/admin/Sucursales.tsx          pagina con pestanas, modales y toasts
//   web/src/lib/api.ts                         listar/crear/actualizar/cambiarEstado de ambos
//   api/src/modulos/seguridad/CTR_Sucursales.ts        8 endpoints bajo /admin
//   api/src/modulos/seguridad/SRV_SucursalesService.ts  8 metodos + metodo privado bitacora
//   api/src/modulos/seguridad/SRV_BitacoraService.ts    registrar
//   api/src/modulos/seguridad/dependencias.ts           JwtAuthGuard
//   api/src/modulos/seguridad/CE_Modelos.ts             Ciudad, Sucursal, Usuario
//   api/src/modulos/inventario/                         inventario_stock
//   BASE DE DATOS/schema.sql                       ciudades sin departamento ni fecha_registro
//
// Sin estereotipo: Boundary, Control y Entity dibujan caja redondeada
// en EA. El rol va en el nombre: IU_ / CTR_ / SRV_ / CE_.
//
// Diagrama estatico: sin mensajes, sin lineas de vida, sin secuencia.
// Autorreparable. Una instruccion por linea. Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================

var ALTO = 14;
var SALTO = String.fromCharCode(10);
var VIS_PUB = 0;
var VIS_PRI = 1;
var RAIZ = Repository.Models.GetAt(0);

var DEF = [
    ["IU_Sucursales", "Sucursales", "pages/admin/Sucursales.tsx",
     [["pestana", "String = ciudades|sucursales", VIS_PUB], ["ciudades", "Array", VIS_PUB], ["sucursales", "Array", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["ciudadEdicion", "Object", VIS_PUB], ["sucursalEdicion", "Object", VIS_PUB], ["cambioEstado", "Object", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["errorModal", "String", VIS_PUB], ["enviandoEstado", "Boolean", VIS_PUB], ["errorEstado", "String", VIS_PUB], ["toast", "Object", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["guardarCiudad", "void", [], VIS_PUB], ["guardarSucursal", "void", [], VIS_PUB], ["confirmarCambioEstado", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_ModalCiudad", "ModalCiudad", "pages/admin/Sucursales.tsx",
     [["edicion", "String = nueva|editar", VIS_PUB], ["nombre", "String", VIS_PUB], ["departamento", "String", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB]],
     [["alGuardar", "void", ["datos"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_ModalSucursal", "ModalSucursal", "pages/admin/Sucursales.tsx",
     [["edicion", "String = nueva|editar", VIS_PUB], ["nombre", "String", VIS_PUB], ["idCiudad", "String", VIS_PUB], ["direccion", "String", VIS_PUB], ["telefono", "String", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB]],
     [["alGuardar", "void", ["datos"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "api", "lib/api.ts",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["listarCiudades", "Array", [], VIS_PUB], ["crearCiudad", "Object", ["datos"], VIS_PUB], ["actualizarCiudad", "Object", ["id", "datos"], VIS_PUB], ["cambiarEstadoCiudad", "Object", ["id", "estado"], VIS_PUB], ["listarSucursales", "Array", [], VIS_PUB], ["crearSucursal", "Object", ["datos"], VIS_PUB], ["actualizarSucursal", "Object", ["id", "datos"], VIS_PUB], ["cambiarEstadoSucursal", "Object", ["id", "estado"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_SucursalesController", "SucursalesController", "CTR_Sucursales.ts",
     [["sucursalesService", "SucursalesService", VIS_PRI]],
     [["listarCiudades", "Array", ["currentUser"], VIS_PUB], ["crearCiudad", "Object", ["body", "request", "currentUser"], VIS_PUB], ["modificarCiudad", "Object", ["id", "body", "request", "currentUser"], VIS_PUB], ["cambiarEstadoCiudad", "Object", ["id", "body", "request", "currentUser"], VIS_PUB], ["listarSucursales", "Array", ["currentUser"], VIS_PUB], ["crearSucursal", "Object", ["body", "request", "currentUser"], VIS_PUB], ["modificarSucursal", "Object", ["id", "body", "request", "currentUser"], VIS_PUB], ["cambiarEstadoSucursal", "Object", ["id", "body", "request", "currentUser"], VIS_PUB]]],

    ["SRV_SucursalesService", "SucursalesService", "SRV_SucursalesService.ts",
     [["logger", "Logger", VIS_PRI], ["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["verificarPermiso", "Boolean", ["permisos", "permiso"], VIS_PRI], ["exigirPermiso", "void", ["usuario"], VIS_PRI], ["listarCiudades", "Array", ["usuario"], VIS_PUB], ["crearCiudad", "Object", ["usuario", "dto", "request"], VIS_PUB], ["modificarCiudad", "Object", ["usuario", "idCiudad", "dto", "request"], VIS_PUB], ["cambiarEstadoCiudad", "Object", ["usuario", "idCiudad", "estado", "request"], VIS_PUB], ["listarSucursales", "Array", ["usuario"], VIS_PUB], ["crearSucursal", "Object", ["usuario", "dto", "request"], VIS_PUB], ["modificarSucursal", "Object", ["usuario", "idSucursal", "dto", "request"], VIS_PUB], ["cambiarEstadoSucursal", "Object", ["usuario", "idSucursal", "estado", "request"], VIS_PUB], ["bitacora", "void", ["accion", "tabla", "detalle", "usuario", "request", "idRegistro", "oldData", "newData"], VIS_PRI]]],

    ["SRV_JwtAuthGuard", "JwtAuthGuard", "dependencias.ts",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_BitacoraService", "BitacoraService", "SRV_BitacoraService.ts",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_DataSource", "DataSource", "TypeORM",
     [],
     [["getRepository", "Repository", ["entidad"], VIS_PUB], ["query", "Array", ["sql", "params"], VIS_PUB]]],

    ["CE_Ciudad", "Ciudad", "tabla ciudades",
     [["id_ciudad", "Integer", VIS_PRI], ["nombre", "String = 80 UNIQUE", VIS_PUB], ["pais", "String = 60", VIS_PUB], ["departamento", "String = 60", VIS_PUB], ["estado", "String = Activa", VIS_PUB], ["fecha_registro", "Timestamp", VIS_PUB]],
     []],

    ["CE_Sucursal", "Sucursal", "tabla sucursales",
     [["id_sucursal", "Integer", VIS_PRI], ["nombre", "String = 100", VIS_PUB], ["direccion", "Text", VIS_PUB], ["id_ciudad", "Integer", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["estado", "String = Activa", VIS_PUB], ["fecha_registro", "Timestamp", VIS_PUB]],
     []],

    ["CE_InventarioStock", "InventarioStock", "tabla inventario_stock",
     [["id_stock", "Integer", VIS_PRI], ["id_ptc", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["cantidad_disponible", "Integer", VIS_PUB], ["cantidad_reservada", "Integer", VIS_PUB], ["cantidad_vendida", "Integer", VIS_PUB], ["stock_minimo_alert", "Integer", VIS_PUB]],
     []],

    ["CE_Usuario", "Usuario", "tabla usuarios",
     [["id_usuario", "Integer", VIS_PRI], ["email", "String = 120", VIS_PRI], ["ci", "String", VIS_PRI], ["password_hash", "String = 255", VIS_PRI], ["estado", "String", VIS_PUB], ["intentos_fallidos", "Integer", VIS_PUB], ["bloqueado_hasta", "Timestamp", VIS_PUB], ["fecha_creacion", "Timestamp", VIS_PUB], ["fecha_ultimo_acceso", "Timestamp", VIS_PUB], ["ultimo_login", "Timestamp", VIS_PUB]],
     []],

    ["CE_BitacoraAuditoria", "BitacoraAuditoria", "tabla bitacora_auditoria",
     [["id_bitacora", "Integer", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "String", VIS_PUB], ["user_agent", "String", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_CrearCiudadRequest", "CrearCiudadRequest", "CTR_Sucursales.ts",
     [["nombre", "String = max 80", VIS_PUB], ["departamento", "String = max 60", VIS_PUB]],
     []],

    ["CE_CrearSucursalRequest", "CrearSucursalRequest", "CTR_Sucursales.ts",
     [["nombre", "String = max 100", VIS_PUB], ["id_ciudad", "Integer", VIS_PUB], ["direccion", "Text", VIS_PUB], ["telefono", "String = max 30", VIS_PUB]],
     []],

    ["CE_CambiarEstadoRequest", "CambiarEstadoRequest", "CTR_Sucursales.ts",
     [["estado", "String", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Administrador", "Administrador General", "gestionar_sucursales"]
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
        if (String(padre.Packages.GetAt(i).Name) == nombre) return padre.Packages.GetAt(i);
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
    for (var i = 0; i < def[3].length; i++) l.push("- " + def[3][i][0] + " : " + def[3][i][1]);
    if (def[3].length > 0 && def[4].length > 0) l.push("");
    for (var j = 0; j < def[4].length; j++) {
        var p = def[4][j][2];
        var f = "";
        if (p != null) f = p.join(", ");
        l.push("+ " + def[4][j][0] + "(" + f + ") : " + def[4][j][1]);
    }
    if (l.length == 0) l.push("(sin atributos ni operaciones)");
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

function relacion(a, b, etiqueta, tipo, est, rolA, rolB, cA, cB) {
    if (a == null || b == null) return;
    var con = null;
    for (var i = 0; i < a.Connectors.Count; i++) {
        var c = a.Connectors.GetAt(i);
        if (c.SupplierID == b.ElementID) { con = c; break; }
    }
    if (con == null) {
        try { con = a.Connectors.AddNew("", tipo); } catch (e) { con = a.Connectors.AddNew("", "Association"); }
        con.ClientID = a.ElementID;
        con.SupplierID = b.ElementID;
        con.Update();
    }
    try { con.Name = etiqueta; } catch (e) { }
    try { con.Stereotype = est; } catch (e) { }
    try { con.SourceRole = rolA; } catch (e) { }
    try { con.DestinationRole = rolB; } catch (e) { }
    try { con.SourceCardinality = cA; } catch (e) { }
    try { con.DestinationCardinality = cB; } catch (e) { }
    try { con.FontSize = 7; } catch (e) { }
    try { con.Update(); } catch (e) { }
}

function main() {
    var cu = buscarPaquete(RAIZ, "Casos de Uso");
    if (cu == null) cu = RAIZ;
    var mod = subPaquete(cu, "1. Seguridad y Autenticación");
    var paq = subPaquete(mod, "CU12 - Análisis de clases");

    for (var d = paq.Diagrams.Count - 1; d >= 0; d--) {
        try { paq.Diagrams.GetAt(d).Delete(); } catch (e) { }
    }
    try { paq.Diagrams.Refresh(); } catch (e) { }

    var clases = [];
    for (var n = 0; n < DEF.length; n++) {
        var def = DEF[n];
        var c = buscarLocal(paq, def[0]);
        if (c == null) c = buscarLocal(paq, def[1]);
        if (c == null) {
            try { c = paq.Elements.AddNew(def[0], "Class"); } catch (e) { c = paq.Elements.AddNew(def[0], "Class"); }
            c.Update();
        }
        try { c.Name = def[0]; } catch (e) { }
        try { c.Stereotype = ""; } catch (e) { }
        nota(c, "Origen: " + def[2] + ".");
        try { c.Update(); } catch (e) { }
        clases[n] = c;
    }

    var actores = [];
    for (var a = 0; a < ACTORES.length; a++) {
        var act = buscarLocal(paq, ACTORES[a][0]);
        if (act == null) {
            try { act = paq.Elements.AddNew(ACTORES[a][0], "Actor"); } catch (e) { act = paq.Elements.AddNew(ACTORES[a][0], "Class"); }
        }
        try { act.Name = ACTORES[a][0]; } catch (e) { }
        try { act.Stereotype = ""; } catch (e) { }
        nota(act, ACTORES[a][1] + ". Requiere el permiso " + ACTORES[a][2] + ".");
        try { act.Update(); } catch (e) { }
        actores[a] = act;
    }

    try { paq.Elements.Refresh(); } catch (e) { }

    var usaTexto = [];
    var conReal = [];
    var totalAtr = 0;
    var totalOpe = 0;

    for (var n2 = 0; n2 < DEF.length; n2++) {
        var d2 = DEF[n2];
        try { paq.Elements.Refresh(); } catch (e) { }
        var el = buscarLocal(paq, d2[0]);
        if (el == null) { ERRORES.push("clase " + d2[0] + " no encontrada"); continue; }
        var antes = "";
        var antesOpe = "";
        try { antes = nombresDe(el.Attributes); } catch (e) { antes = ""; }
        try { antesOpe = nombresDe(el.Methods); } catch (e) { antesOpe = ""; }
        for (var k = 0; k < d2[3].length; k++) {
            if (contiene(antes, d2[3][k][0])) continue;
            agregarAtributo(el, d2[3][k][0], d2[3][k][1], d2[3][k][2]);
        }
        for (var j = 0; j < d2[4].length; j++) {
            if (contiene(antesOpe, d2[4][j][0])) continue;
            agregarOperacion(el, d2[4][j][0], d2[4][j][1], d2[4][j][2], d2[4][j][3]);
        }
        try { el.Update(); } catch (e) { }
        var fin = "";
        var finOpe = "";
        try { fin = nombresDe(el.Attributes); } catch (e) { fin = ""; }
        try { finOpe = nombresDe(el.Methods); } catch (e) { finOpe = ""; }
        totalAtr = totalAtr + totalDe(fin);
        totalOpe = totalOpe + totalDe(finOpe);
        var bien = totalDe(fin) >= d2[3].length;
        if (totalDe(finOpe) >= d2[4].length) bien = true;
        usaTexto[n2] = !bien;
        if (bien) conReal.push(d2[0]);
        INFORME.push(pad(d2[0], 28) + " atr " + totalDe(fin) + "/" + d2[3].length + "  ope " + totalDe(finOpe) + "/" + d2[4].length + (bien ? "  REAL" : "  TEXTO"));
    }

    var diag = null;
    try { diag = paq.Diagrams.AddNew("CU12 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
    if (diag == null) ERRORES.push("no se pudo crear el diagrama");

    if (diag != null) {
        diag.Update();
        try { paq.Diagrams.Refresh(); } catch (e) { }
        var COLX = [30, 300, 570, 840];
        var ANCHO = 250;

        for (var p = 0; p < actores.length; p++) {
            colocar(diag, actores[p], COLX[p], 25, 190, 100);
        }
        for (var k2 = 0; k2 < DEF.length; k2++) {
            var col = k2 % 4;
            var fila = 1 + Math.floor(k2 / 4);
            var x = COLX[col];
            var y = 25 + fila * 300;
            var lineas = lineasCompartimento(DEF[k2]);
            if (usaTexto[k2]) {
                colocar(diag, clases[k2], x, y, ANCHO, 24);
                compartimento(diag, paq, "TXT " + DEF[k2][0], lineas, x, y + 24, ANCHO);
            } else {
                colocar(diag, clases[k2], x, y, ANCHO, lineas.length * ALTO + 34);
            }
        }

        var C = clases;
        for (var r = 0; r < actores.length; r++) relacion(actores[r], C[0], "usuario", "Association", "", "actor", "pantalla", "1", "0..1");
        relacion(C[0], C[1], "modal de ciudad", "Association", "", "pantalla", "modal", "0..1", "1");
        relacion(C[0], C[2], "modal de sucursal", "Association", "", "pantalla", "modal", "0..1", "1");
        relacion(C[0], C[3], "cliente HTTP", "Dependency", "uses", "pantalla", "cliente", "1", "1");
        relacion(C[0], C[9], "ciudades mostradas", "Association", "", "pantalla", "listado", "0..*", "1");
        relacion(C[0], C[10], "sucursales mostradas", "Association", "", "pantalla", "listado", "0..*", "1");
        relacion(C[1], C[9], "ciudad editada", "Association", "", "modal", "ciudad", "0..1", "1");
        relacion(C[2], C[10], "sucursal editada", "Association", "", "modal", "sucursal", "0..1", "1");
        relacion(C[3], C[4], "punto de acceso HTTP", "Dependency", "uses", "consumidor", "endpoint", "1", "0..1");
        relacion(C[4], C[14], "datos de entrada", "Association", "", "controlador", "ciudad", "1", "1");
        relacion(C[4], C[15], "datos de entrada", "Association", "", "controlador", "sucursal", "1", "1");
        relacion(C[4], C[16], "datos de entrada", "Association", "", "controlador", "estado", "1", "1");
        relacion(C[4], C[6], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        relacion(C[4], C[5], "servicio de sucursales", "Association", "", "controlador", "servicio", "1", "1");
        relacion(C[5], C[6], "usuario autenticado", "Association", "", "sucursales", "guard", "1", "1");
        relacion(C[5], C[7], "auditoría de la operación", "Association", "", "sucursales", "auditor", "1", "1");
        relacion(C[5], C[8], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        relacion(C[5], C[9], "ciudad gestionada", "Composition", "composition", "sucursales", "ciudad", "1", "0..*");
        relacion(C[5], C[10], "sucursal gestionada", "Composition", "composition", "sucursales", "sucursal", "1", "0..*");
        relacion(C[5], C[11], "inventario de la sucursal", "Dependency", "uses", "sucursales", "stock", "1", "0..*");
        relacion(C[5], C[12], "usuario autenticado", "Association", "", "sucursales", "usuario", "1", "0..1");
        relacion(C[6], C[12], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");
        relacion(C[7], C[13], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        relacion(C[7], C[8], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        relacion(C[13], C[12], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");
        relacion(C[11], C[10], "stock de la sucursal", "Association", "", "stock", "sucursal", "0..*", "1");
        relacion(C[10], C[9], "ciudad de la sucursal", "Association", "", "sucursal", "ciudad", "0..1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("Los mensajes y las excepciones de CU12 solo estan en el diagrama de comunicacion.");
        N.push("");
        N.push("1 actor, 17 clases y 26 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (4), CTR_ controlador (1), SRV_ servicio (4), CE_ entidad o DTO (8).");
        N.push("");
        N.push("LO QUE SI COINCIDE CON EL CASO:");
        N.push("");
        N.push("- Los 8 endpoints bajo /admin: GET, POST, PUT y PATCH estado, tanto para ciudades como para");
        N.push("  sucursales. Los POST devuelven 201 por @HttpCode(HttpStatus.CREATED).");
        N.push("- La verificacion de E3: SELECT COUNT(*)::int AS n FROM inventario_stock WHERE id_sucursal = $1");
        N.push("  AND (cantidad_disponible > 0 OR cantidad_reservada > 0).");
        N.push("- E5: al inhabilitar una ciudad se cuentan sus sucursales con LOWER(s.estado) = 'activa' y se");
        N.push("  rechaza con La ciudad tiene sucursales activas. Inhabilite primero sus sucursales.");
        N.push("- E1 y E3 y E4 y E6: mensajes y codigos correctos. El permiso es gestionar_sucursales y el 403");
        N.push("  es No tienes permiso para gestionar sucursales.");
        N.push("- La bitacora registra old_data y new_data en las 8 operaciones, con id_registro = id_ciudad o");
        N.push("  id_sucursal del registro afectado.");
        N.push("");
        N.push("DISCREPANCIAS CON EL CASO DE USO, verificadas contra el codigo real:");
        N.push("");
        N.push("1. schema.sql NO tiene la columna departamento. La tabla ciudades del esquema base es:");
        N.push("   id_ciudad, nombre, pais y estado. No existe ni departamento ni fecha_registro. En cambio la");
        N.push("   entidad Ciudad de CE_Modelos.ts declara pais, departamento y fecha_registro, y");
        N.push("   listarCiudades hace SELECT c.departamento. El caso dice que departamento se agrega por");
        N.push("   migracion, pero en el repositorio NO hay ninguna carpeta migrations. Si la base no se");
        N.push("   migró a mano, el listado de ciudades falla por columna inexistente.");
        N.push("");
        N.push("2. Al EDITAR una sucursal NO se valida que la ciudad esté activa. crearSucursal consulta con");
        N.push("   andWhere LOWER(c.estado) = 'activa', pero modificarSucursal usa findOneBy({ id_ciudad })");
        N.push("   sin filtro de estado. Se puede mover una sucursal a una ciudad inactiva. El caso presenta");
        N.push("   E2 como una sola regla, pero son dos validaciones distintas.");
        N.push("");
        N.push("3. El mensaje de E2 difiere entre crear y editar. Crear:");
        N.push("   La ciudad seleccionada no existe o esta inactiva. Editar: La ciudad seleccionada no existe.");
        N.push("");
        N.push("4. El estado se normaliza de forma binaria, sin validar el dominio. En ambos cambiarEstado:");
        N.push("   estado === 'Activa' ? 'Activa' : 'Inactiva'. Cualquier cadena distinta de la exacta");
        N.push("   Activa se convierte en Inactiva. El DTO solo exige @IsString y @IsNotEmpty, sin enum.");
        N.push("");
        N.push("5. La duplicidad de ciudad se comprueba con LOWER(c.nombre), sin distinguir mayusculas, y");
        N.push("   tambien en la edicion, pero SOLO si el nombre cambio. Si el nombre es identico no se");
        N.push("   vuelve a buscar, y ademas se excluye la propia ciudad con existe.id_ciudad !== idCiudad.");
        N.push("   El caso solo menciona la validacion al crear.");
        N.push("");
        N.push("6. Los dos listados usan SQL crudo con dataSource.query, no el QueryBuilder.");
        N.push("   El de ciudades lleva el subselect (SELECT COUNT(*)::int FROM sucursales s WHERE");
        N.push("   s.id_ciudad = c.id_ciudad) AS nro_sucursales, que cuenta TODAS las sucursales, no solo las");
        N.push("   activas. El de sucursales lleva LEFT JOIN ciudades c y devuelve c.nombre AS nombre_ciudad.");
        N.push("");
        N.push("7. Hay validaciones de obligatoriedad en el servicio que el caso no documenta, ademas de");
        N.push("   las de class-validator: El nombre de la ciudad es obligatorio., El departamento es");
        N.push("   obligatorio., El nombre de la sucursal es obligatorio. y La direccion es obligatoria.,");
        N.push("   todas con HTTP 400. Y en el DTO hay limites de longitud: nombre de ciudad 80,");
        N.push("   departamento 60, nombre de sucursal 100 y telefono 30.");
        N.push("");
        N.push("8. La bitacora pasa por un metodo privado bitacora(accion, tabla, detalle, usuario, request,");
        N.push("   idRegistro, oldData, newData) que solo delega a BitacoraService.registrar con los ocho");
        N.push("   argumentos en orden fijo. Evita repetir la llamada en los 8 metodos del servicio.");
        N.push("");
        N.push("9. El caso no menciona que las respuestas de alta devuelven el id recien creado:");
        N.push("   { detail: Ciudad X creada., id_ciudad } y { detail: Sucursal X creada., id_sucursal }.");
        N.push("");
        N.push("10. Confirmado que no existe la columna encargado_id, ni en CE_Modelos.ts ni en schema.sql,");
        N.push("    tal como anticipa el caso.");
        N.push("");
        N.push("11. El caso describe React con pestañas, y aqui si coincide: la pagina Sucursales.tsx tiene");
        N.push("    el estado pestana con valores ciudades y sucursales, dos modales de alta/edicion y un");
        N.push("    unico modal de confirmacion de cambio de estado reutilizado para ambos. No hay cliente");
        N.push("    Flutter ni Angular.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU12 - ADMINISTRAR CIUDADES Y SUCURSALES - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 80");
    T.push("Operaciones reales: " + totalOpe + " de 43");
    T.push("Clases completas: " + conReal.length + " -> " + conReal.join(", "));
    for (var l = 0; l < INFORME.length; l++) T.push(INFORME[l]);
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
    msg = msg + "CU12 - Administrar ciudades y sucursales" + SALTO + SALTO;
    msg = msg + "Clases: 17    Actores: 1    Relaciones: 26" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 80" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 43" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU12 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU12 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU12", 0); } catch (e3) { }
}
