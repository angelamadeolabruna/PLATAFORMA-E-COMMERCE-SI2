// ================================================================
// CU19 - INHABILITAR / BLOQUEAR PROVEEDOR (ESTADO DE RIESGO)
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   web/src/pages/admin/AdminProveedores.tsx   MenuFilaProveedor, ModalConfirmarEstado,
//                                            OPCIONES_POR_ESTADO, AVISOS, confirmarEstado
//   web/src/lib/api.ts                         cambiarEstadoProveedor, listarProveedores
//   api/src/modulos/proveedores/CTR_Proveedores.ts         PATCH :id/estado
//   api/src/modulos/proveedores/SRV_ProveedoresService.ts  cambiarEstado, detalleEstado
//   api/src/modulos/compras/SRV_ComprasService.ts:349       validarEncabezado (CU21)
//   api/src/modulos/seguridad/dependencias.ts:25            JwtAuthGuard
//   BASE DE DATOS/schema.sql                   proveedores.estado_riesgo (String, no ENUM)
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
     [["proveedores", "Array", VIS_PUB], ["ciudades", "Array", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["menuAbiertoId", "Integer", VIS_PUB], ["cambioEstado", "Object", VIS_PUB], ["enviandoEstado", "Boolean", VIS_PUB], ["errorEstado", "String", VIS_PUB], ["toast", "Object", VIS_PUB], ["permisoOk", "Boolean", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["abrirAccion", "void", ["proveedor", "accion"], VIS_PUB], ["confirmarEstado", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_MenuFilaProveedor", "MenuFilaProveedor", "pages/admin/AdminProveedores.tsx",
     [["proveedor", "ItemProveedor", VIS_PUB], ["opciones", "Array", VIS_PUB], ["menuAbierto", "Boolean", VIS_PUB]],
     [["alternar", "void", [], VIS_PUB], ["alElegir", "void", ["accion"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_ModalConfirmarEstado", "ModalConfirmarEstado", "pages/admin/AdminProveedores.tsx",
     [["proveedor", "ItemProveedor", VIS_PUB], ["accion", "AccionEstado", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB]],
     [["frase", "String", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "api", "lib/api.ts",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["cambiarEstadoProveedor", "Object", ["id", "estado"], VIS_PUB], ["listarProveedores", "Array", [], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_ProveedoresController", "ProveedoresController", "CTR_Proveedores.ts",
     [["proveedoresService", "ProveedoresService", VIS_PRI]],
     [["cambiarEstado", "Object", ["id", "body", "request", "currentUser"], VIS_PUB], ["listarProveedores", "Array", ["currentUser"], VIS_PUB]]],

    ["SRV_ProveedoresService", "ProveedoresService", "SRV_ProveedoresService.ts",
     [["logger", "Logger", VIS_PRI], ["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermiso", "void", ["usuario"], VIS_PRI], ["formatearFechaHora", "String", ["valor"], VIS_PRI], ["bitacora", "void", ["accion", "tabla", "detalle", "usuario", "request", "idRegistro", "oldData", "newData"], VIS_PRI], ["cambiarEstado", "Object", ["usuario", "id", "estado", "request"], VIS_PUB], ["detalleEstado", "String", ["estado"], VIS_PRI]]],

    ["SRV_ComprasService", "ComprasService", "compras/SRV_ComprasService.ts",
     [["logger", "Logger", VIS_PRI], ["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["validarEncabezado", "Object", ["dto"], VIS_PRI]]],

    ["SRV_JwtAuthGuard", "JwtAuthGuard", "dependencias.ts",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_BitacoraService", "BitacoraService", "SRV_BitacoraService.ts",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_DataSource", "DataSource", "TypeORM",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB], ["getRepository", "Repository", ["entidad"], VIS_PUB]]],

    ["CE_Proveedor", "Proveedor", "tabla proveedores",
     [["id_proveedor", "Integer", VIS_PRI], ["nombre_empresa", "String = 150", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["email", "String = 120", VIS_PUB], ["tiempo_entrega_dias", "Integer = 15", VIS_PUB], ["estado_riesgo", "String = Activo", VIS_PUB], ["calidad_score", "Integer", VIS_PUB], ["score_fecha", "Timestamp", VIS_PUB], ["fecha_registro", "Timestamp", VIS_PUB]],
     []],

    ["CE_ItemProveedor", "ItemProveedor", "SRV_ProveedoresService.ts",
     [["id_proveedor", "Integer", VIS_PUB], ["nombre", "String", VIS_PUB], ["estado", "String", VIS_PUB], ["calidad_score", "Integer", VIS_PUB], ["score_fecha", "String", VIS_PUB]],
     []],

    ["CE_AccionEstado", "AccionEstado", "AdminProveedores.tsx",
     [["accion", "String = Activar|Deshabilitar|Bloquear", VIS_PUB], ["estado", "String = Activo|Inactivo|Bloqueado", VIS_PUB]],
     []],

    ["CE_CambiarEstadoRequest", "CambiarEstadoRequest", "CTR_Proveedores.ts",
     [["estado", "String = Activo|Inactivo|Bloqueado", VIS_PUB]],
     []],

    ["CE_OrdenCompra", "OrdenCompra", "tabla ordenes_compra",
     [["id_orden_compra", "Integer", VIS_PRI], ["id_proveedor", "Integer", VIS_PUB], ["estado", "String", VIS_PUB], ["fecha_orden", "Timestamp", VIS_PUB], ["fecha_estimada_entrega", "Date", VIS_PUB], ["fecha_recepcion", "Timestamp", VIS_PUB]],
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
    var paq = subPaquete(mod, "CU19 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU19 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        relacion(actores[0], C[0], "usuario", "Association", "", "actor", "pantalla", "1", "0..1");
        relacion(C[0], C[1], "menú de fila", "Association", "", "pantalla", "menú", "0..*", "1");
        relacion(C[0], C[2], "modal de confirmación", "Association", "", "pantalla", "modal", "0..1", "1");
        relacion(C[0], C[3], "cliente HTTP", "Dependency", "uses", "pantalla", "cliente", "1", "1");
        relacion(C[0], C[11], "filas mostradas", "Association", "", "pantalla", "listado", "0..*", "1");
        relacion(C[1], C[12], "opción elegida", "Association", "", "menú", "acción", "1", "1");
        relacion(C[1], C[11], "proveedor de la fila", "Association", "", "menú", "proveedor", "1", "1");
        relacion(C[2], C[12], "acción a confirmar", "Association", "", "modal", "acción", "1", "1");
        relacion(C[2], C[11], "proveedor confirmado", "Association", "", "modal", "proveedor", "1", "1");
        relacion(C[3], C[4], "punto de acceso HTTP", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        relacion(C[4], C[13], "datos de entrada", "Association", "", "controlador", "estado", "1", "1");
        relacion(C[4], C[7], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        relacion(C[4], C[5], "servicio de proveedores", "Association", "", "controlador", "servicio", "1", "1");
        relacion(C[5], C[7], "usuario autenticado", "Association", "", "proveedores", "guard", "1", "1");
        relacion(C[5], C[8], "auditoría de la operación", "Association", "", "proveedores", "auditor", "1", "1");
        relacion(C[5], C[9], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        relacion(C[5], C[10], "estado gestionado", "Composition", "composition", "proveedores", "proveedor", "1", "0..*");
        relacion(C[5], C[14], "órdenes de compra", "Dependency", "uses", "proveedores", "orden", "1", "0..*");
        relacion(C[5], C[11], "proveedor mapeado", "Association", "", "proveedores", "item", "0..*", "1");
        relacion(C[6], C[7], "usuario autenticado", "Association", "", "compras", "guard", "1", "1");
        relacion(C[6], C[14], "orden a validar", "Composition", "composition", "compras", "orden", "1", "0..*");
        relacion(C[6], C[10], "estado del proveedor", "Dependency", "uses", "compras", "proveedor", "1", "0..1");
        relacion(C[7], C[15], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");
        relacion(C[8], C[18], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        relacion(C[8], C[9], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        relacion(C[18], C[15], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");
        relacion(C[14], C[10], "proveedor de la orden", "Composition", "composition", "orden", "proveedor", "1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("Los mensajes y las excepciones de CU19 solo estan en el diagrama de comunicacion.");
        N.push("");
        N.push("1 actor, 19 clases y 25 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (4), CTR_ controlador (1), SRV_ servicio (5), CE_ entidad o DTO (9).");
        N.push("");
        N.push("HALLAZGO 1: EL CASO ESCRIBE UN SQL QUE NO EXISTE.");
        N.push("");
        N.push("El caso dice: UPDATE proveedores SET estado = $1 WHERE id = $2.");
        N.push("El codigo real dice:");
        N.push("  UPDATE proveedores SET estado_riesgo = $2 WHERE id_proveedor = $1");
        N.push("");
        N.push("Tres diferencias, las tres relevantes:");
        N.push("  - la columna no se llama estado, se llama estado_riesgo");
        N.push("  - la clave primaria no se llama id, se llama id_proveedor");
        N.push("  - el orden de los parametros esta invertido: el estado va en $2 y el id en $1");
        N.push("En proveedores no existe ninguna columna llamada estado ni ninguna llamada id.");
        N.push("");
        N.push("HALLAZGO 2: LA POST CONDICION ES MAS FUERTE DE LO QUE DICE EL CASO, Y CON OTRO MENSAJE.");
        N.push("");
        N.push("El caso dice que el sistema impide crear ordenes nuevas y muestra una advertencia.");
        N.push("Lo que hace CU21, en validarEncabezado de SRV_ComprasService.ts linea 349, es:");
        N.push("  if (estadoProveedor.toLowerCase() !== 'activo') throw new ConflictException(...)");
        N.push("");
        N.push("  - Se bloquea con 409, no es una advertencia de interfaz sino un error duro.");
        N.push("  - Se bloquea tambien con el estado Inactivo, no solo con Bloqueado. O sea que un");
        N.push("    proveedor desactivado tampoco puede recibir ordenes, cosa que el caso no dice.");
        N.push("  - El mensaje es No se puede crear una orden con un proveedor bloqueado. Estado");
        N.push("    actual: Bloqueado. y el caso nunca lo menciona.");
        N.push("  - Y hay una segunda barrera: el listado de proveedores para el formulario de ordenes");
        N.push("    filtra con LOWER(p.estado_riesgo) = 'activo', de modo que un proveedor bloqueado");
        N.push("    simplemente desaparece del selector en lugar de aparecer y fallar.");
        N.push("");
        N.push("HALLAZGO 3: HAY TRES EXCEPCIONES MAS, EL CASO NO LAS LISTA.");
        N.push("");
        N.push("El caso documenta E1, E2 y E3. El endpoint puede responder ademas:");
        N.push("  404 Proveedor no encontrado.   el SELECT de la linea 261 no devuelve filas");
        N.push("  400 El estado es obligatorio.   del @IsNotEmpty de CambiarEstadoRequest con body vacio");
        N.push("  400 Validation failed (id is expected to be a number...)  del ParseIntPipe");
        N.push("      sobre :id, por ejemplo PATCH /api/v1/proveedores/abc/estado");
        N.push("La precondicion dice El proveedor debe existir pero no hay excepcion para cuando no existe.");
        N.push("");
        N.push("HALLAZGO 4: EL ORDEN DE LAS VALIDACIONES ES OTRO, Y E2 NO ESCRITE NADA.");
        N.push("");
        N.push("Orden real de cambiarEstado:");
        N.push("  1. exigirPermiso                              -> 403 si falta gestionar_proveedores");
        N.push("  2. ESTADOS_VALIDOS.includes(estado.trim())    -> 422 Estado de proveedor no valido.");
        N.push("  3. SELECT id_proveedor, nombre_empresa, estado_riesgo -> 404");
        N.push("  4. conteo de ordenes pendientes, SOLO si nuevo es Bloqueado y el viejo no lo era -> 409");
        N.push("  5. UPDATE proveedores SET estado_riesgo");
        N.push("  6. bitacora con accion_sql UPDATE");
        N.push("  7. return { detail: detalleEstado(nuevo) }      -> 200");
        N.push("");
        N.push("El caso pone la validacion del estado en el mismo paso (b) que el UPDATE, lo que hace");
        N.push("que E2 parezca algo que ocurre despues de escribir. En el codigo, si el estado es");
        N.push("invalido no se escribe nada y tampoco se toca la bitacora.");
        N.push("");
        N.push("HALLAZGO 5: LA COMPARACION DE ESTADOS ES SENSIBLE A MAYUSCULAS Y MINUSCULAS.");
        N.push("");
        N.push("  const ESTADOS_VALIDOS = ['Activo', 'Inactivo', 'Bloqueado'] as const;");
        N.push("  if (!ESTADOS_VALIDOS.includes(estado.trim())) throw new UnprocessableEntityException(...)");
        N.push("");
        N.push("Solo hay trim(), no hay toLowerCase() ni toUpperCase(). Un cliente que mande activo o");
        N.push("BLOQUEADO recibe 422. La app React nunca lo hace porque manda la forma exacta desde");
        N.push("OPCIONES_POR_ESTADO, pero un cliente Flutter que use minusculas fallaria siempre.");
        N.push("Es un contraste con CU21, donde validarEncabezado si normaliza con toLowerCase().");
        N.push("");
        N.push("HALLAZGO 6: EL 409 SOLO SE EVALUA AL TRANSICIONAR A BLOQUEADO. NADA MAS.");
        N.push("");
        N.push("  if (nuevo === 'Bloqueado' && viejo !== 'Bloqueado') { ...conteo... }");
        N.push("");
        N.push("Tres consecuencias que el caso no documenta:");
        N.push("  - Volver a bloquear un proveedor ya bloqueado NO consulta ordenes. La opcion Bloquear");
        N.push("    sigue apareciendo en el menu, el guard viejo !== Bloqueado es false, y la peticion");
        N.push("    devuelve 200 sin comprobar nada.");
        N.push("  - Desactivar a Inactivo NUNCA consulta ordenes pendientes. Un proveedor con cinco");
        N.push("    ordenes en curso se puede desactivar sin que nada lo impida, y E1 no aplica.");
        N.push("  - Reactivar a Activo TAMPOCO consulta ordenes pendientes. Se puede reactivar un");
        N.push("    proveedor que fue bloqueado en una urgencia anterior sin mirar su cartera.");
        N.push("");
        N.push("HALLAZGO 7: EL MENU TIENE UNA RAMA RARA Y EL CASO NO LA DETALLA.");
        N.push("");
        N.push("OPCIONES_POR_ESTADO es un Record<string, AccionEstado[]> con tres ramas:");
        N.push("  estado por defecto  -> [Deshabilitar, Bloquear]");
        N.push("  Bloqueado           -> [Activar, Bloquear]      <- vuelve a ofrecer Bloquear");
        N.push("  Activo / Inactivo   -> [Activar, Deshabilitar]");
        N.push("");
        N.push("La segunda rama es la rara: el menu de un proveedor ya bloqueado ofrece Activar y");
        N.push("tambien Bloquear. El caso solo dice segun el estado actual sin detallar la tabla.");
        N.push("");
        N.push("HALLAZGO 8: LA BITACORA GRABA DOS CAMPOS, NO UNO.");
        N.push("");
        N.push("El caso muestra old_data { estado: 'Activo' } y new_data { estado: 'Bloqueado' }.");
        N.push("El codigo graba dos campos en cada lado, con el nombre de empresa incluido:");
        N.push("  { nombre: fila.nombre_empresa, estado: viejo }");
        N.push("  { nombre: fila.nombre_empresa, estado: nuevo }");
        N.push("El nombre viene del SELECT de la linea 261, que trae id_proveedor, nombre_empresa y");
        N.push("estado_riesgo. Ademas el campo detalle de la bitacora es una cadena generada:");
        N.push("  Proveedor ${nuevo.toLowerCase()}: ${fila.nombre_empresa}");
        N.push("que produce textos como Proveedor bloqueado: Textiles Andinos S.A. El caso no lo menciona.");
        N.push("");
        N.push("HALLAZGO 9: HAY TRES MENSAJES DE RESPUESTA, NO UNO.");
        N.push("");
        N.push("  detalleEstado(estado) devuelve tres cosas distintas:");
        N.push("    Bloqueado  -> Proveedor bloqueado.");
        N.push("    Inactivo   -> Proveedor deshabilitado.");
        N.push("    default    -> Proveedor activado.");
        N.push("");
        N.push("El caso solo documenta Proveedor bloqueado. Ojo con el segundo: el estado se llama");
        N.push("Inactivo pero el mensaje dice deshabilitado, y la accion del menu dice Deshabilitar.");
        N.push("El termino cambia tres veces para la misma transicion.");
        N.push("");
        N.push("HALLAZGO 10: EL TOAST NO ES UN LITERAL DE LA PANTALLA, ES LA RESPUESTA DEL SERVIDOR.");
        N.push("");
        N.push("En confirmarEstado:");
        N.push("  const res = await api.cambiarEstadoProveedor(...)");
        N.push("  setToast({ mensaje: res.detail, tipo: 'exito' })");
        N.push("  void cargar()");
        N.push("");
        N.push("O sea que el texto que ve el usuario lo decide detalleEstado() del backend, no el");
        N.push("frontend. Y el badge no se actualiza en local: se recarga la tabla entera con cargar().");
        N.push("");
        N.push("HALLAZGO 11: EL AVISO DEL DIALOGO ES CORRECTO, PERO ESTA INCOMPLETO.");
        N.push("");
        N.push("La frase del caso es literal del codigo, en el objeto AVISOS de AdminProveedores.tsx:");
        N.push("  Bloqueado: 'Al bloquear no se podran crear nuevas ordenes de compra con este proveedor.'");
        N.push("");
        N.push("Pero el dialogo tiene ademas una segunda frase dinamica que el caso no transcribe:");
        N.push("  Seguro que deseas activar o deshabilitar o bloquear al proveedor {nombre_empresa}?");
        N.push("Y el dialogo cambia de estilo segun la accion: fondo bg-danger-50 con icono Lock para");
        N.push("Bloquear, bg-brand-50 con ShieldOff para Deshabilitar y ShieldCheck para Activar. El");
        N.push("boton Confirmar solo lleva bg-danger-600 hover:bg-danger-700 en el caso de Bloquear.");
        N.push("");
        N.push("HALLAZGO 12: EL TOKEN VIAJA POR DOS VIAS, Y LA DEL CASO NO ES LA QUE USA LA APP.");
        N.push("");
        N.push("El caso dice Authorization: Bearer {access_token}. El JwtAuthGuard hace:");
        N.push("  let token = (request.headers.authorization ?? '').replace('Bearer ', '').trim();");
        N.push("  if (!token) token = this.cookieDe(request.headers.cookie, 'access_token') ?? '';");
        N.push("");
        N.push("Primero intenta el header y solo si queda vacio cae a la cookie access_token. La app");
        N.push("React depende de la cookie, no del header. Los dos funcionan, pero describirlos solo");
        N.push("por el header deja fuera el mecanismo que de verdad usa el cliente.");
        N.push("");
        N.push("HALLAZGO 13: estado_riesgo ES UN STRING LIBRE, NO UN ENUM.");
        N.push("");
        N.push("schema.sql lo declara con DEFAULT 'Activo' pero sin CHECK y sin ENUM. La unica");
        N.push("garantia de integridad es el ESTADOS_VALIDOS del servicio. Un UPDATE manual en la base");
        N.push("puede dejar un estado que el servicio nunca produce, y entonces CU21 arma el mensaje");
        N.push("No se puede crear una orden con un proveedor {estado}. con un texto inesperado.");
        N.push("");
        N.push("HALLAZGO 14: EL SCORING NO SE VE AFECTADO. LA AFIRMACION DEL CASO NO SE SOSTIENE.");
        N.push("");
        N.push("El caso dice El scoring (CU20) se ve afectado. cambiarEstado no toca calidad_score ni");
        N.push("score_fecha en ningun punto. La calidad se calcula en calcularScore y solo se escribe");
        N.push("desde recalcularScore, que es CU20 y exige el permiso evaluar_proveedores, distinto del");
        N.push("gestionar_proveedores que exige CU19.");
        N.push("");
        N.push("Consecuencia concreta: bloquear un proveedor deja su score intacto y la tabla sigue");
        N.push("mostrando el numero en la columna Score. Y un administrador puede bloquear proveedores");
        N.push("sin tener permiso para recalcular el score, porque son dos permisos separados.");
        N.push("");
        N.push("HALLAZGO 15: CU19 NO DEPENDE DE LA MIGRACION DE CU18.");
        N.push("");
        N.push("A diferencia de CU18, CU20 y CU21, este caso no necesita columnas nuevas: solo usa");
        N.push("id_proveedor y estado_riesgo, que existen desde el esquema base. Es el unico de los");
        N.push("tres que funciona aunque nunca se haya aplicado la migracion de CU18.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - cargarPermisos vuelve a usar la variante de primera fila con JOIN crudo, igual que");
        N.push("    en CU18. Distinta de Empleados, Roles, Sucursales y Auditoria, que usan QueryBuilder.");
        N.push("  - E3 dice Acciones ocultas. En el codigo permisoOk gobierna la pagina entera y el");
        N.push("    menu de fila con la misma bandera, y el backend vuelve a comprobarlo por su cuenta.");
        N.push("  - El caso describe Angular con MatMenu y MatDialog, FastAPI y Flutter. La");
        N.push("    implementacion real es React/Vite con NestJS, y el menu es un div con useState.");
        N.push("  - El guard no es el JwtAuthGuard de Passport sino un canActivate propio de canActivate().");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU19 - INHABILITAR / BLOQUEAR PROVEEDOR - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 71");
    T.push("Operaciones reales: " + totalOpe + " de 28");
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
    msg = msg + "CU19 - Inhabilitar / Bloquear proveedor" + SALTO + SALTO;
    msg = msg + "Clases: 19    Actores: 1    Relaciones: 25" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 71" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 28" + SALTO;
    msg = msg + "AVISO: la columna real es estado_riesgo y la clave id_proveedor." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU19 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU19 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU19", 0); } catch (e3) { }
}
