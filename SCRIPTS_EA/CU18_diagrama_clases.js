// ================================================================
// CU18 - REGISTRAR PROVEEDOR
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   web/src/pages/admin/AdminProveedores.tsx   tabla, modal, menu de fila, ScoreBadge
//   web/src/lib/api.ts                         listarProveedores, crearProveedor,
//                                            cambiarEstadoProveedor, recalcularScoreProveedor,
//                                            listarCiudades
//   api/src/modulos/proveedores/CTR_Proveedores.ts     dos controladores en un archivo
//   api/src/modulos/proveedores/SRV_ProveedoresService.ts  12 metodos
//   api/src/modulos/seguridad/SRV_BitacoraService.ts registrar
//   api/src/modulos/seguridad/dependencias.ts           JwtAuthGuard
//   BASE DE DATOS/schema.sql                   proveedores (sin nit_ruc, id_ciudad,
//                                               condiciones_comerciales ni score_fecha)
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
    ["IU_AdminProveedores", "AdminProveedores", "pages/admin/AdminProveedores.tsx",
     [["proveedores", "Array", VIS_PUB], ["ciudades", "Array", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["modalAbierto", "Boolean", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["errorModal", "String", VIS_PUB], ["cambioEstado", "Object", VIS_PUB], ["enviandoEstado", "Boolean", VIS_PUB], ["errorEstado", "String", VIS_PUB], ["menuAbiertoId", "Integer", VIS_PUB], ["recalculandoId", "Integer", VIS_PUB], ["toast", "Object", VIS_PUB], ["permisoOk", "Boolean", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["guardar", "void", [], VIS_PUB], ["confirmarCambioEstado", "void", [], VIS_PUB], ["recalcular", "void", ["proveedor"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_ModalProveedor", "ModalProveedor", "pages/admin/AdminProveedores.tsx",
     [["nombre", "String", VIS_PUB], ["nitRuc", "String", VIS_PUB], ["telefono", "String", VIS_PUB], ["correo", "String", VIS_PUB], ["idCiudad", "String", VIS_PUB], ["direccion", "String", VIS_PUB], ["condiciones", "String", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB]],
     [["alGuardar", "void", ["datos"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "api", "lib/api.ts",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["listarProveedores", "Array", [], VIS_PUB], ["crearProveedor", "Object", ["datos"], VIS_PUB], ["cambiarEstadoProveedor", "Object", ["id", "estado"], VIS_PUB], ["recalcularScoreProveedor", "Object", ["id"], VIS_PUB], ["listarCiudades", "Array", [], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_ProveedoresController", "ProveedoresController", "CTR_Proveedores.ts",
     [["proveedoresService", "ProveedoresService", VIS_PRI]],
     [["listarProveedores", "Array", ["currentUser"], VIS_PUB], ["crearProveedor", "Object", ["body", "request", "currentUser"], VIS_PUB], ["cambiarEstado", "Object", ["id", "body", "request", "currentUser"], VIS_PUB]]],

    ["CTR_ProveedoresAdminController", "ProveedoresAdminController", "CTR_Proveedores.ts",
     [["proveedoresService", "ProveedoresService", VIS_PRI]],
     [["recalcularScore", "Object", ["id", "request", "currentUser"], VIS_PUB]]],

    ["SRV_ProveedoresService", "ProveedoresService", "SRV_ProveedoresService.ts",
     [["logger", "Logger", VIS_PRI], ["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermiso", "void", ["usuario"], VIS_PRI], ["exigirPermisoEvaluar", "void", ["usuario"], VIS_PRI], ["formatearFechaHora", "String", ["valor"], VIS_PRI], ["bitacora", "void", ["accion", "tabla", "detalle", "usuario", "request", "idRegistro", "oldData", "newData"], VIS_PRI], ["listarProveedores", "Array", ["usuario"], VIS_PUB], ["crearProveedor", "Object", ["usuario", "dto", "request"], VIS_PUB], ["cambiarEstado", "Object", ["usuario", "id", "estado", "request"], VIS_PUB], ["detalleEstado", "String", ["estado"], VIS_PRI], ["recalcularScore", "Object", ["usuario", "id", "request"], VIS_PUB], ["calcularScore", "Number", ["idProveedor"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "JwtAuthGuard", "dependencias.ts",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_BitacoraService", "BitacoraService", "SRV_BitacoraService.ts",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_DataSource", "DataSource", "TypeORM",
     [],
     [["getRepository", "Repository", ["entidad"], VIS_PUB], ["query", "Array", ["sql", "params"], VIS_PUB]]],

    ["CE_Proveedor", "Proveedor", "tabla proveedores",
     [["id_proveedor", "Integer", VIS_PRI], ["nombre_empresa", "String = 150 UNIQUE", VIS_PUB], ["persona_contacto", "String = 120", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["email", "String = 120 UNIQUE", VIS_PUB], ["direccion", "Text", VIS_PUB], ["observaciones", "Text", VIS_PUB], ["tiempo_entrega_dias", "Integer = 15", VIS_PUB], ["estado_riesgo", "String = Activo", VIS_PUB], ["calidad_score", "Integer", VIS_PUB], ["score_fecha", "Timestamp", VIS_PUB], ["nit_ruc", "String = 20 UNIQUE", VIS_PUB], ["id_ciudad", "Integer", VIS_PUB], ["condiciones_comerciales", "Text", VIS_PUB], ["fecha_registro", "Timestamp", VIS_PUB]],
     []],

    ["CE_Ciudad", "Ciudad", "tabla ciudades",
     [["id_ciudad", "Integer", VIS_PRI], ["nombre", "String = 80 UNIQUE", VIS_PUB], ["pais", "String = 60", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_Usuario", "Usuario", "tabla usuarios",
     [["id_usuario", "Integer", VIS_PRI], ["email", "String = 120", VIS_PRI], ["estado", "String", VIS_PUB]],
     []],

    ["CE_Rol", "Rol", "tabla roles",
     [["id_rol", "Integer", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "UsuarioRol", "tabla usuarios_roles",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_BitacoraAuditoria", "BitacoraAuditoria", "tabla bitacora_auditoria",
     [["id_bitacora", "Integer", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "String", VIS_PUB], ["user_agent", "String", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_CrearProveedorRequest", "CrearProveedorRequest", "CTR_Proveedores.ts",
     [["nombre", "String", VIS_PUB], ["nit_ruc", "String", VIS_PUB], ["telefono", "String", VIS_PUB], ["correo", "String", VIS_PUB], ["id_ciudad", "Integer", VIS_PUB], ["direccion", "String", VIS_PUB], ["condiciones_comerciales", "Text", VIS_PUB]],
     []],

    ["CE_CambiarEstadoRequest", "CambiarEstadoRequest", "CTR_Proveedores.ts",
     [["estado", "String = Activo|Inactivo|Bloqueado", VIS_PUB]],
     []],

    ["CE_ItemProveedor", "ItemProveedor", "SRV_ProveedoresService.ts",
     [["id_proveedor", "Integer", VIS_PUB], ["nombre", "String", VIS_PUB], ["nit_ruc", "String", VIS_PUB], ["telefono", "String", VIS_PUB], ["correo", "String", VIS_PUB], ["id_ciudad", "Integer", VIS_PUB], ["nombre_ciudad", "String", VIS_PUB], ["direccion", "Text", VIS_PUB], ["condiciones_comerciales", "Text", VIS_PUB], ["estado", "String", VIS_PUB], ["calidad_score", "Integer", VIS_PUB], ["score_fecha", "String", VIS_PUB], ["fecha_registro", "String", VIS_PUB]],
     []],

    ["CE_OrdenCompra", "OrdenCompra", "tabla ordenes_compra",
     [["id_orden_compra", "Integer", VIS_PRI], ["id_proveedor", "Integer", VIS_PUB], ["estado", "String", VIS_PUB], ["fecha_orden", "Timestamp", VIS_PUB], ["fecha_estimada_entrega", "Date", VIS_PUB], ["fecha_recepcion", "Timestamp", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Administrador", "Administrador General", "gestionar_proveedores"]
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
    var mod = buscarPaquete(cu, "6. Proveedores y Compras");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU18 - Análisis de clases");

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
        INFORME.push(pad(d2[0], 30) + " atr " + totalDe(fin) + "/" + d2[3].length + "  ope " + totalDe(finOpe) + "/" + d2[4].length + (bien ? "  REAL" : "  TEXTO"));
    }

    var diag = null;
    try { diag = paq.Diagrams.AddNew("CU18 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        relacion(C[0], C[1], "modal de proveedor", "Association", "", "pantalla", "modal", "0..1", "1");
        relacion(C[0], C[2], "cliente HTTP", "Dependency", "uses", "pantalla", "cliente", "1", "1");
        relacion(C[0], C[10], "ciudades del selector", "Dependency", "uses", "pantalla", "ciudad", "1", "0..*");
        relacion(C[0], C[17], "proveedores mostrados", "Association", "", "pantalla", "listado", "0..*", "1");
        relacion(C[1], C[10], "ciudades del selector", "Dependency", "uses", "modal", "ciudad", "1", "0..*");
        relacion(C[2], C[3], "punto de acceso HTTP", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        relacion(C[2], C[4], "punto de acceso HTTP", "Dependency", "uses", "cliente", "endpoint admin", "1", "0..1");
        relacion(C[3], C[15], "datos de entrada", "Association", "", "controlador", "alta", "1", "1");
        relacion(C[3], C[16], "datos de entrada", "Association", "", "controlador", "estado", "1", "1");
        relacion(C[3], C[6], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        relacion(C[3], C[5], "servicio de proveedores", "Association", "", "controlador", "servicio", "1", "1");
        relacion(C[4], C[6], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        relacion(C[4], C[5], "servicio de proveedores", "Association", "", "controlador", "servicio", "1", "1");
        relacion(C[5], C[6], "usuario autenticado", "Association", "", "proveedores", "guard", "1", "1");
        relacion(C[5], C[7], "auditoría de la operación", "Association", "", "proveedores", "auditor", "1", "1");
        relacion(C[5], C[8], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        relacion(C[5], C[9], "proveedor gestionado", "Composition", "composition", "proveedores", "proveedor", "1", "0..*");
        relacion(C[5], C[10], "ciudad del proveedor", "Association", "", "proveedores", "ciudad", "0..1", "1");
        relacion(C[5], C[11], "usuario autenticado", "Association", "", "proveedores", "usuario", "1", "0..1");
        relacion(C[5], C[12], "rol del usuario", "Association", "", "proveedores", "rol", "1", "0..1");
        relacion(C[5], C[13], "asignación de rol", "Association", "", "proveedores", "asignación", "1", "0..*");
        relacion(C[5], C[18], "órdenes de compra", "Dependency", "uses", "proveedores", "orden", "1", "0..*");
        relacion(C[5], C[17], "proveedor mapeado", "Association", "", "proveedores", "item", "0..*", "1");
        relacion(C[6], C[11], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");
        relacion(C[7], C[14], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        relacion(C[7], C[8], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        relacion(C[14], C[11], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");
        relacion(C[9], C[10], "ciudad del proveedor", "Association", "", "proveedor", "ciudad", "0..1", "1");
        relacion(C[17], C[9], "proveedor representado", "Dependency", "uses", "item", "proveedor", "1", "1");
        relacion(C[18], C[9], "proveedor de la orden", "Composition", "composition", "orden", "proveedor", "1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("Los mensajes y las excepciones de CU18 solo estan en el diagrama de comunicacion.");
        N.push("");
        N.push("1 actor, 19 clases y 28 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (3), CTR_ controlador (2), SRV_ servicio (4), CE_ entidad o DTO (10).");
        N.push("");
        N.push("HALLAZGO CRITICO: LA MIGRACION DEL CASO ESTA INCOMPLETA.");
        N.push("");
        N.push("La tabla proveedores de schema.sql tiene id_proveedor, nombre_empresa, persona_contacto,");
        N.push("telefono, email, direccion, observaciones, tiempo_entrega_dias, estado_riesgo, calidad_score y");
        N.push("fecha_registro. El caso propone anadir tres columnas: nit_ruc, id_ciudad y");
        N.push("condiciones_comerciales. Pero el codigo real usa UNA CUARTA que no aparece en esa migracion:");
        N.push("score_fecha.");
        N.push("");
        N.push("  - listarProveedores selecciona p.nit_ruc, p.id_ciudad, p.condiciones_comerciales y");
        N.push("    p.score_fecha::text AS score_fecha");
        N.push("  - crearProveedor inserta nit_ruc, id_ciudad y condiciones_comerciales");
        N.push("  - recalcularScore hace UPDATE ... SET calidad_score = $2, score_fecha = NOW()");
        N.push("  - El listado de proveedores filtra ademas el estado del proveedor");
        N.push("");
        N.push("Sin score_fecha, CU20 no puede funcionar aunque se apliquen las tres columnas del caso.");
        N.push("La migracion correcta necesita las cuatro, y no hay carpeta migrations en el repositorio.");
        N.push("");
        N.push("DISCREPANCIAS CON EL CASO DE USO, verificadas contra el codigo real:");
        N.push("");
        N.push("1. HAY DOS CONTROLADORES, no uno. En el mismo archivo CTR_Proveedores.ts:");
        N.push("   ProveedoresController        @Controller('proveedores')        -> /api/v1/proveedores");
        N.push("       GET  /api/v1/proveedores");
        N.push("       POST /api/v1/proveedores                          201");
        N.push("       PATCH /api/v1/proveedores/:id/estado");
        N.push("   ProveedoresAdminController  @Controller('admin/proveedores')  -> CU20");
        N.push("       POST /api/v1/admin/proveedores/:id/recalcular_score  200");
        N.push("   El caso menciona admin.proveedores.crear, pero de hecho el alta vive en /proveedores y");
        N.push("   lo unico que cuelga de /admin/proveedores es el recálculo de score, que es de CU20.");
        N.push("");
        N.push("2. condiciones_comerciales NO mapea a observaciones. Son columnas distintas y el INSERT real");
        N.push("   escribe condiciones_comerciales en su propia columna y NO toca observaciones, que queda");
        N.push("   siempre en NULL. El mapeo descrito en el caso no ocurre en ningun punto del codigo.");
        N.push("");
        N.push("3. E3 exige tambien que la ciudad este Activa. La condicion real es");
        N.push("   !ciudad || String(ciudad.estado).toLowerCase() !== 'activa', con el mensaje");
        N.push("   La ciudad seleccionada no existe. O sea que una ciudad existente pero Inactiva produce");
        N.push("   el mismo 422 que una inexistente. El caso solo menciona Ciudad inexistente.");
        N.push("");
        N.push("4. El correo SI se valida con regex, pero en el servicio, no en el DTO. La expresion es");
        N.push("   CORREO_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/ y el mensaje es El correo no tiene un");
        N.push("   formato valido. con 422. El DTO solo lleva @IsString y @IsNotEmpty, sin @IsEmail.");
        N.push("   El correo se normaliza a minusculas con trim().toLowerCase() antes de validarse.");
        N.push("");
        N.push("5. El nombre tiene minimo 3 y maximo 150, validado en el servicio con dos mensajes");
        N.push("   propios: El nombre debe tener al menos 3 caracteres. y El nombre no puede superar 150");
        N.push("   caracteres. El DTO CrearProveedorRequest NO lleva @MinLength ni @MaxLength, a diferencia");
        N.push("   de otros DTO del proyecto. Toda la longitud se valida en el servicio.");
        N.push("");
        N.push("6. Tambien hay maximos en el servicio para telefono (30) y correo (120), y dos validaciones");
        N.push("   de id_ciudad: Number.isInteger en el servicio y @IsInt en el DTO, ambas con el mismo");
        N.push("   mensaje Debe seleccionar una ciudad.");
        N.push("");
        N.push("7. La unicidad del NIT se comprueba con igualdad exacta, no con LOWER:");
        N.push("   SELECT COUNT(*)::int AS n FROM proveedores WHERE nit_ruc = $1. Como la columna es");
        N.push("   UNIQUE en la migracion, la base ya la garantiza; la consulta solo cambia el 23505 de");
        N.push("   Postgres por un 409 con mensaje. Con dos peticiones simultaneas, la segunda recibiria");
        N.push("   el error crudo de violacion de unicidad.");
        N.push("");
        N.push("8. EL CASO OMITE DOS METODOS DEL MISMO SERVICIO, ambos visibles en la UI:");
        N.push("   cambiarEstado valida contra ESTADOS_VALIDOS = ['Activo','Inactivo','Bloqueado'] con 422");
        N.push("   Estado de proveedor no valido., y BLOQUEAR un proveedor con ordenes de compra");
        N.push("   pendientes devuelve 409 El proveedor tiene ordenes de compra pendientes. Procese o anule");
        N.push("   antes de bloquear. La condicion es LOWER(estado) NOT IN ('procesada','recibida','anulada',");
        N.push("   'cancelada'). El detalle de la respuesta cambia segun el estado: Proveedor bloqueado.,");
        N.push("   Proveedor deshabilitado. o Proveedor activado.");
        N.push("");
        N.push("9. calcularScore es una formula de cuatro pesos: puntualidad 40, velocidad 20,");
        N.push("   cumplimiento 20 y calidad 20, con clamp entre 0 y 100. Y lanza 400 No hay datos de");
        N.push("   entregas para calcular el score. si el proveedor no tiene ninguna orden recibida. La");
        N.push("   velocidad tiene un tramo fijo: 20 puntos si el promedio es de 15 dias o menos.");
        N.push("");
        N.push("10. El new_data de la bitacora tiene cinco campos, no tres:");
        N.push("    { nombre, nit_ruc, correo, telefono, id_ciudad }. El caso solo menciona nombre,");
        N.push("    nit_ruc y correo. La respuesta del alta es { detail: 'Proveedor registrado.',");
        N.push("    id_proveedor }.");
        N.push("");
        N.push("11. Hay dos permisos distintos y dos metodos distintos de verificacion:");
        N.push("    exigirPermiso con gestionar_proveedores y exigirPermisoEvaluar con");
        N.push("    evaluar_proveedores. Son los dos permisos del grupo Proveedores del catalogo.");
        N.push("");
        N.push("12. La tabla se ordena por p.id_proveedor DESC y trae LEFT JOIN ciudades con alias");
        N.push("    nombre_ciudad. El frontend ademas filtra las ciudades a estado === 'activa' en el");
        N.push("    cliente, aunque el backend ya devuelve la lista completa de CU12. Y hay un menu por");
        N.push("    fila con menuAbiertoId y un boton de recalcular por fila con recalculandoId.");
        N.push("");
        N.push("13. cargarPermisos vuelve a usar la variante de primera fila con JOIN crudo, igual que");
        N.push("    ProductosService, TemporadasService y ProveedoresService, y distinta de Empleados,");
        N.push("    Roles, Sucursales y Auditoria, que usan el QueryBuilder.");
        N.push("");
        N.push("14. Confirmado que la reutilizacion del selector de ciudades de CU12 es real:");
        N.push("    el frontend llama api.listarCiudades(), que pega en GET /api/v1/admin/ciudades.");
        N.push("");
        N.push("15. El caso describe Angular y FastAPI; la implementacion real es React/Vite con NestJS.");
        N.push("    No hay cliente Flutter.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU18 - REGISTRAR PROVEEDOR - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 98");
    T.push("Operaciones reales: " + totalOpe + " de 34");
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
    msg = msg + "CU18 - Registrar proveedor" + SALTO + SALTO;
    msg = msg + "Clases: 19    Actores: 1    Relaciones: 28" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 98" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 34" + SALTO;
    msg = msg + "AVISO: falta la columna score_fecha en la migracion propuesta." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU18 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU18 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU18", 0); } catch (e3) { }
}
