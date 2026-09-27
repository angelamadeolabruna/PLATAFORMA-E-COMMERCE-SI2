// ================================================================
// CU08 - ASIGNAR Y MODIFICAR ROLES Y PERMISOS
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   web/src/pages/admin/Roles.tsx                  pagina Roles y modales
//   web/src/lib/api.ts                             listarRoles, obtenerCatalogoPermisos,
//                                                  obtenerPermisosRol, actualizarPermisosRol,
//                                                  crearRol, actualizarRol, eliminarRol
//   web/src/contexts/AuthContext.tsx               useAuth
//   api/src/modulos/seguridad/CTR_Roles.ts         admin/roles
//   api/src/modulos/seguridad/SRV_RolesService.ts   CATALOGO_PERMISOS, RolesService
//   api/src/modulos/seguridad/SRV_BitacoraService.ts   registrar con old_data y new_data
//   api/src/modulos/seguridad/dependencias.ts          JwtAuthGuard
//   api/src/modulos/seguridad/CE_Modelos.ts             Rol, Usuario, UsuarioRol
//   BASE DE DATOS/schema.sql                          seed de los 5 roles base
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
    ["IU_Roles", "Roles", "pages/admin/Roles.tsx",
     [["roles", "Array", VIS_PUB], ["grupos", "Array", VIS_PUB], ["seleccionados", "Array", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["toast", "Object", VIS_PUB], ["modalPermisosRol", "RolItem", VIS_PUB], ["modalRol", "Object", VIS_PUB], ["rolEliminar", "RolItem", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["errorModal", "String", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["abrirPermisos", "void", ["rol"], VIS_PUB], ["alternarGrupo", "void", ["grupo"], VIS_PUB], ["guardarPermisos", "void", [], VIS_PUB], ["guardarRol", "void", [], VIS_PUB], ["eliminarRol", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "api", "lib/api.ts",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["listarRoles", "Array", [], VIS_PUB], ["obtenerCatalogoPermisos", "Object", [], VIS_PUB], ["obtenerPermisosRol", "Object", ["rolId"], VIS_PUB], ["actualizarPermisosRol", "Object", ["rolId", "permisos"], VIS_PUB], ["crearRol", "Object", ["datos"], VIS_PUB], ["actualizarRol", "Object", ["rolId", "datos"], VIS_PUB], ["eliminarRol", "Object", ["rolId"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["IU_AuthProvider", "AuthProvider", "contexts/AuthContext.tsx",
     [["usuario", "UsuarioSesion", VIS_PRI], ["token", "String", VIS_PRI], ["cargando", "Boolean", VIS_PUB]],
     [["useAuth", "AuthContextValue", [], VIS_PUB]]],

    ["CTR_RolesController", "RolesController", "CTR_Roles.ts",
     [["rolesService", "RolesService", VIS_PRI]],
     [["listarRoles", "Array", ["currentUser"], VIS_PUB], ["catalogoPermisos", "Object", ["currentUser"], VIS_PUB], ["obtenerPermisos", "Object", ["rolId", "currentUser"], VIS_PUB], ["actualizarPermisos", "Object", ["rolId", "body", "request", "currentUser"], VIS_PUB], ["crearRol", "Object", ["body", "request", "currentUser"], VIS_PUB], ["actualizarRol", "Object", ["rolId", "body", "request", "currentUser"], VIS_PUB], ["eliminarRol", "Object", ["rolId", "request", "currentUser"], VIS_PUB]]],

    ["SRV_RolesService", "RolesService", "SRV_RolesService.ts",
     [["logger", "Logger", VIS_PRI], ["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["verificarPermiso", "Boolean", ["permisos", "permiso"], VIS_PRI], ["exigirPermiso", "void", ["usuario", "permiso"], VIS_PRI], ["exigirPermisoPublico", "void", ["usuario"], VIS_PUB], ["listarRoles", "Array", ["usuario"], VIS_PUB], ["parsearPermisos", "Array", ["valor"], VIS_PRI], ["obtenerPermisos", "Object", ["usuario", "rolId"], VIS_PUB], ["actualizarPermisos", "Object", ["usuario", "rolId", "permisos", "request"], VIS_PUB], ["crearRol", "Object", ["usuario", "nombreRol", "descripcion", "request"], VIS_PUB], ["actualizarRol", "Object", ["usuario", "rolId", "nombreRol", "descripcion", "request"], VIS_PUB], ["eliminarRol", "Object", ["usuario", "rolId", "request"], VIS_PUB]]],

    ["SRV_BitacoraService", "BitacoraService", "SRV_BitacoraService.ts",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "JwtAuthGuard", "dependencias.ts",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["extraerToken", "String", ["request"], VIS_PRI]]],

    ["SRV_DataSource", "DataSource", "TypeORM",
     [],
     [["getRepository", "Repository", ["entidad"], VIS_PUB], ["query", "Array", ["sql", "params"], VIS_PUB]]],

    ["CE_Rol", "Rol", "tabla roles",
     [["id_rol", "Integer", VIS_PRI], ["nombre_rol", "String = 60 UNIQUE", VIS_PUB], ["descripcion", "Text", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["estado", "String = Activo", VIS_PUB], ["fecha_creacion", "Timestamp", VIS_PUB]],
     []],

    ["CE_Usuario", "Usuario", "tabla usuarios",
     [["id_usuario", "Integer", VIS_PRI], ["email", "String", VIS_PRI], ["ci", "String", VIS_PRI], ["password_hash", "String = 255", VIS_PRI], ["estado", "String", VIS_PUB], ["intentos_fallidos", "Integer", VIS_PUB], ["bloqueado_hasta", "Timestamp", VIS_PUB], ["fecha_creacion", "Timestamp", VIS_PUB], ["fecha_ultimo_acceso", "Timestamp", VIS_PUB], ["ultimo_login", "Timestamp", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "UsuarioRol", "tabla usuarios_roles",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_BitacoraAuditoria", "BitacoraAuditoria", "tabla bitacora_auditoria",
     [["id_bitacora", "Integer", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "String", VIS_PUB], ["user_agent", "String", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_GrupoPermisos", "GrupoPermisos", "SRV_RolesService.ts",
     [["grupo", "String", VIS_PUB], ["permisos", "Array", VIS_PUB]],
     []],

    ["CE_RolItem", "RolItem", "SRV_RolesService.ts",
     [["id_rol", "Integer", VIS_PUB], ["nombre_rol", "String", VIS_PUB], ["descripcion", "Text", VIS_PUB], ["estado", "String", VIS_PUB], ["nro_usuarios", "Integer", VIS_PUB], ["permisos", "Array", VIS_PUB]],
     []],

    ["CE_ActualizarPermisosRequest", "ActualizarPermisosRequest", "CTR_Roles.ts",
     [["permisos", "Array", VIS_PUB]],
     []],

    ["CE_CrearRolRequest", "CrearRolRequest", "CTR_Roles.ts",
     [["nombre_rol", "String", VIS_PUB], ["descripcion", "String", VIS_PUB]],
     []],

    ["CE_ActualizarRolRequest", "ActualizarRolRequest", "CTR_Roles.ts",
     [["nombre_rol", "String", VIS_PUB], ["descripcion", "String", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Administrador", "Administrador General", "gestionar_roles"]
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
    var paq = subPaquete(mod, "CU08 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU08 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        relacion(C[0], C[2], "permisos de sesión", "Association", "", "pantalla", "sesión", "1", "1");
        relacion(C[2], C[1], "cliente HTTP", "Dependency", "uses", "consumidor", "cliente", "1", "1");
        relacion(C[0], C[1], "cliente HTTP", "Dependency", "uses", "pantalla", "cliente", "1", "1");
        relacion(C[1], C[3], "punto de acceso HTTP", "Dependency", "uses", "consumidor", "endpoint", "1", "0..1");
        relacion(C[3], C[14], "datos de entrada", "Association", "", "controlador", "permisos", "1", "1");
        relacion(C[3], C[15], "datos de entrada", "Association", "", "controlador", "alta", "1", "0..1");
        relacion(C[3], C[16], "datos de entrada", "Association", "", "controlador", "edición", "1", "0..1");
        relacion(C[3], C[6], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        relacion(C[3], C[12], "catálogo de permisos", "Dependency", "uses", "controlador", "catálogo", "1", "1");
        relacion(C[3], C[13], "datos de salida", "Association", "", "controlador", "listado", "1", "0..*");
        relacion(C[3], C[4], "servicio de roles", "Association", "", "controlador", "servicio", "1", "1");
        relacion(C[4], C[12], "validación contra catálogo", "Dependency", "uses", "roles", "catálogo", "1", "1");
        relacion(C[4], C[5], "auditoría del cambio", "Association", "", "roles", "auditor", "1", "1");
        relacion(C[4], C[7], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        relacion(C[4], C[8], "rol actualizado", "Aggregation", "aggregation", "roles", "rol", "1", "0..*");
        relacion(C[4], C[9], "usuario autenticado", "Association", "", "roles", "usuario", "1", "0..1");
        relacion(C[4], C[10], "usuarios del rol", "Association", "", "roles", "asignación", "1", "0..*");
        relacion(C[6], C[9], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");
        relacion(C[5], C[11], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        relacion(C[5], C[7], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        relacion(C[11], C[9], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");
        relacion(C[10], C[9], "usuario asignado", "Association", "", "asignación", "usuario", "1", "1");
        relacion(C[10], C[8], "rol asignado", "Association", "", "asignación", "rol", "1", "1");
        relacion(C[13], C[8], "rol representado", "Association", "", "listado", "rol", "0..*", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("Los mensajes y las excepciones de CU08 solo estan en el diagrama de comunicacion.");
        N.push("");
        N.push("1 actor, 17 clases y 24 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (3), CTR_ controlador (1), SRV_ servicio (4), CE_ entidad o DTO (9).");
        N.push("");
        N.push("LO QUE SI COINCIDE CON EL CASO:");
        N.push("");
        N.push("- El catalogo canonico de 8 grupos y 21 permisos coincide exactamente. Vive en la constante");
        N.push("  CATALOGO_PERMISOS de SRV_RolesService.ts y se expone en GET /admin/roles/permisos-catalogo");
        N.push("  como { grupos: CATALOGO_PERMISOS }. TODOS_PERMISOS es su aplanado con flatMap y es el que");
        N.push("  valida cada permiso recibido.");
        N.push("- El rol Administrador tiene [\"*\"] en el seed y esta protegido.");
        N.push("- E1: 422 con el mensaje Permiso no reconocido: {nombres}. Correcto.");
        N.push("- La bitacora registra old_data y new_data: registrar(..., { permisos: oldPermisos }, { permisos }).");
        N.push("- La lista de roles incluye el numero de usuarios, con el subselect");
        N.push("  (SELECT COUNT(*) FROM usuarios_roles ur WHERE ur.id_rol = r.id_rol) AS nro_usuarios.");
        N.push("- El permiso se relee de la base en cada peticion: exigirPermiso() llama a cargarPermisos(), que");
        N.push("  hace un query fresco a usuarios_roles unido con roles. Soporta el comodin *.");
        N.push("");
        N.push("DISCREPANCIAS CON EL CASO DE USO, verificadas contra el codigo real:");
        N.push("");
        N.push("1. INCONSISTENCIA CRITICA: los roles base del seed NO usan el catalogo de 21 permisos.");
        N.push("   schema.sql inserta para Encargado de Sucursal: gestionar_catalogo, ver_inventario,");
        N.push("   editar_inventario, gestionar_compras, gestionar_recepciones, gestionar_reservas y");
        N.push("   ver_existencias (7 permisos, ninguno del catalogo). Para Cajero: procesar_pagos,");
        N.push("   ver_inventario, registrar_venta y gestionar_devoluciones (4). Para Cliente: ver_catalogo,");
        N.push("   comprar, reservar y usar_vestidor_ra (4). Para Proveedor: ver_ordenes_compra (1).");
        N.push("   El caso dice 5, 4, 3 y 0 respectivamente, asi que el caso y el seed estan mal y ademas");
        N.push("   no coinciden entre si. Consecuencia practica: al abrir el modal de permisos de esos roles,");
        N.push("   ningun checkbox del catalogo aparece marcado, y al guardar se perderian todos sus permisos.");
        N.push("");
        N.push("2. E2 no se puede producir por la API. El endpoint recibe ActualizarPermisosRequest, que declara");
        N.push("   permisos con @IsArray(), @ArrayMinSize(0) y @IsString({ each: true }). Si permisos no es un");
        N.push("   array, class-validator lo rechaza antes de llegar al servicio, con un 400 de validacion");
        N.push("   estandar y la forma { message: [ ... ] }, no con { message: 'Formato de permisos invalido.' }.");
        N.push("   El if (!Array.isArray(permisos)) del servicio es una segunda barrera que por la API nunca");
        N.push("   se dispara; solo se activaria en una llamada interna al servicio.");
        N.push("");
        N.push("3. La proteccion del rol Administrador se decide por ID, no por nombre. La constante es");
        N.push("   ROL_ADMIN_ID = 1, y solo si rol.id_rol === 1 se exige conservar el permiso gestionar_roles");
        N.push("   y se bloquean el renombrado y el borrado. Si el seed insertara el Administrador con otro id,");
        N.push("   la proteccion no se activaria. El nombre protegido NOMBRE_ROL_ADMIN = 'Administrador' solo");
        N.push("   se usa para comparar en el renombrado.");
        N.push("");
        N.push("4. El caso no menciona el CRUD completo de roles, que si existe y es el que produce E3, E4,");
        N.push("   E5 y E6: POST /admin/roles (201), PUT /admin/roles/:rolId y DELETE /admin/roles/:rolId.");
        N.push("");
        N.push("5. Excepcion adicional no documentada: al crear un rol, si el nombre coincide con algun");
        N.push("   permiso del catalogo, devuelve 400 Ese nombre no puede usarse para un rol.");
        N.push("");
        N.push("6. La respuesta real de PUT /admin/roles/:rolId/permisos es 200 con { detail: 'Permisos");
        N.push("   actualizados.' }, no el texto que sugiere el caso. No lleva @HttpCode, asi que es 200.");
        N.push("");
        N.push("7. Inconsistencia menor dentro del propio codigo: listarRoles() usa parsearPermisos(), que");
        N.push("   tolera que permisos_json llegue como texto JSON y devuelve [] si no puede parsear, pero");
        N.push("   obtenerPermisos() hace un cast directo y devolveria el valor crudo sin normalizar.");
        N.push("");
        N.push("8. Sobre la vigencia del JWT: es correcto que los permisos se relean de la base en cada");
        N.push("   peticion, pero el decorador @UsuarioActual() resuelve el usuario a partir de payload.sub,");
        N.push("   asi que E8 (sesion expirada, 401) sigue aplicando igual que en los demas casos.");
        N.push("");
        N.push("9. El caso describe Angular y FastAPI; la implementacion real es React/Vite con NestJS.");
        N.push("   No hay cliente Flutter.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU08 - ASIGNAR Y MODIFICAR ROLES Y PERMISOS - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 64");
    T.push("Operaciones reales: " + totalOpe + " de 39");
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
    msg = msg + "CU08 - Asignar y modificar roles y permisos" + SALTO + SALTO;
    msg = msg + "Clases: 17    Actores: 1    Relaciones: 24" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 64" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 39" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU08 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU08 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU08", 0); } catch (e3) { }
}
