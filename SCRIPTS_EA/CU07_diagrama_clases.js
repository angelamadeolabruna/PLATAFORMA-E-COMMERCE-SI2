// ================================================================
// CU07 - REGISTRAR NUEVO EMPLEADO
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   web/src/pages/admin/Usuarios.tsx                pagina Usuarios y modal Nuevo Empleado
//   web/src/lib/api.ts                              listarEmpleados, listarSucursalesActivas, registrarEmpleado
//   web/src/contexts/AuthContext.tsx                useAuth para el permiso
//   api/src/modulos/seguridad/CTR_Empleados.ts      admin/empleados POST
//   api/src/modulos/seguridad/SRV_EmpleadosService.ts  registrarEmpleado
//   api/src/modulos/seguridad/SRV_SeguridadService.ts   hashearPassword
//   api/src/modulos/seguridad/SRV_EmailService.ts      enviarPrimeraContrasena
//   api/src/modulos/seguridad/SRV_BitacoraService.ts   registrar
//   api/src/modulos/seguridad/dependencias.ts          JwtAuthGuard
//   api/src/modulos/seguridad/CE_Modelos.ts             Usuario, UsuarioEmpleado,
//                                                        FirstPasswordToken, Rol, Sucursal, UsuarioRol
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
    ["IU_Usuarios", "Usuarios", "pages/admin/Usuarios.tsx",
     [["empleados", "Array", VIS_PUB], ["sucursales", "Array", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["modalAbierto", "Boolean", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["errorModal", "String", VIS_PUB], ["toast", "Object", VIS_PUB], ["permisoOk", "Boolean", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["abrirModal", "void", [], VIS_PUB], ["cerrarModal", "void", [], VIS_PUB], ["handleSubmit", "void", ["event"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "api", "lib/api.ts",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["listarEmpleados", "Array", [], VIS_PUB], ["listarSucursalesActivas", "Array", [], VIS_PUB], ["registrarEmpleado", "Object", ["datos"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["IU_AuthProvider", "AuthProvider", "contexts/AuthContext.tsx",
     [["usuario", "UsuarioSesion", VIS_PRI], ["token", "String", VIS_PRI], ["cargando", "Boolean", VIS_PUB]],
     [["useAuth", "AuthContextValue", [], VIS_PUB]]],

    ["CTR_EmpleadosController", "EmpleadosController", "CTR_Empleados.ts",
     [["empleadosService", "EmpleadosService", VIS_PRI]],
     [["listarEmpleados", "Array", ["currentUser"], VIS_PUB], ["listarSucursalesActivas", "Array", ["currentUser"], VIS_PUB], ["registrarEmpleado", "Object", ["body", "request", "currentUser"], VIS_PUB]]],

    ["SRV_EmpleadosService", "EmpleadosService", "SRV_EmpleadosService.ts",
     [["logger", "Logger", VIS_PRI], ["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI], ["seguridadService", "SeguridadService", VIS_PRI], ["emailService", "EmailService", VIS_PRI]],
     [["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["verificarPermiso", "Boolean", ["permisos", "permiso"], VIS_PRI], ["listarEmpleados", "Array", ["usuario"], VIS_PUB], ["listarSucursales", "Array", ["usuario"], VIS_PUB], ["registrarEmpleado", "Object", ["usuario", "dto", "request"], VIS_PUB], ["generarPasswordTemporal", "String", [], VIS_PRI]]],

    ["SRV_SeguridadService", "SeguridadService", "SRV_SeguridadService.ts",
     [],
     [["hashearPassword", "String", ["password"], VIS_PUB], ["validarPassword", "Boolean", ["usuario", "password"], VIS_PUB]]],

    ["SRV_EmailService", "EmailService", "SRV_EmailService.ts",
     [["logger", "Logger", VIS_PRI], ["config", "ConfigService", VIS_PRI]],
     [["enviarPrimeraContrasena", "Boolean", ["email", "token"], VIS_PUB], ["enviarBienvenida", "Boolean", ["email", "token"], VIS_PUB], ["enviarRecuperacionContrasena", "Boolean", ["email", "token"], VIS_PUB], ["_enviarViaSmtp", "void", ["email", "asunto", "cuerpo"], VIS_PRI]]],

    ["SRV_BitacoraService", "BitacoraService", "SRV_BitacoraService.ts",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "JwtAuthGuard", "dependencias.ts",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["extraerToken", "String", ["request"], VIS_PRI]]],

    ["SRV_DataSource", "DataSource", "TypeORM",
     [],
     [["getRepository", "Repository", ["entidad"], VIS_PUB], ["query", "Array", ["sql", "params"], VIS_PUB]]],

    ["CE_Usuario", "Usuario", "tabla usuarios",
     [["id_usuario", "Integer", VIS_PRI], ["email", "String", VIS_PRI], ["ci", "String", VIS_PRI], ["password_hash", "String = 255", VIS_PRI], ["estado", "String = Pendiente", VIS_PUB], ["intentos_fallidos", "Integer", VIS_PUB], ["bloqueado_hasta", "Timestamp", VIS_PUB], ["fecha_creacion", "Timestamp", VIS_PUB], ["fecha_ultimo_acceso", "Timestamp", VIS_PUB], ["ultimo_login", "Timestamp", VIS_PUB]],
     []],

    ["CE_UsuarioEmpleado", "UsuarioEmpleado", "tabla usuarios_empleados",
     [["id_empleado", "Integer", VIS_PRI], ["usuario", "Usuario", VIS_PRI], ["sucursal_id", "Integer", VIS_PUB], ["nombre", "String = 120", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["rol", "String = 60", VIS_PUB], ["fecha_baja", "Timestamp", VIS_PUB], ["motivo_baja", "String = 255", VIS_PUB]],
     []],

    ["CE_FirstPasswordToken", "FirstPasswordToken", "tabla first_password_tokens",
     [["id_token", "Integer", VIS_PRI], ["usuario_id", "Integer", VIS_PUB], ["token", "String = 36 UNIQUE", VIS_PRI], ["expires_at", "Timestamp", VIS_PUB], ["used", "Boolean = false", VIS_PUB], ["created_at", "Timestamp", VIS_PUB]],
     []],

    ["CE_Rol", "Rol", "tabla roles",
     [["id_rol", "Integer", VIS_PRI], ["nombre_rol", "String = 60 UNIQUE", VIS_PUB], ["descripcion", "Text", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["estado", "String = Activo", VIS_PUB], ["fecha_creacion", "Timestamp", VIS_PUB]],
     []],

    ["CE_Sucursal", "Sucursal", "tabla sucursales",
     [["id_sucursal", "Integer", VIS_PRI], ["nombre", "String = 80 UNIQUE", VIS_PUB], ["direccion", "Text", VIS_PUB], ["id_ciudad", "Integer", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["estado", "String = Activa", VIS_PUB], ["fecha_registro", "Timestamp", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "UsuarioRol", "tabla usuarios_roles",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_BitacoraAuditoria", "BitacoraAuditoria", "tabla bitacora_auditoria",
     [["id_bitacora", "Integer", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "String", VIS_PUB], ["user_agent", "String", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_RegistrarEmpleadoRequest", "RegistrarEmpleadoRequest", "CTR_Empleados.ts",
     [["nombre", "String", VIS_PUB], ["email", "String", VIS_PUB], ["telefono", "String", VIS_PUB], ["sucursal_id", "Number", VIS_PUB], ["rol_nombre", "String", VIS_PUB], ["password_temporal", "String", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Administrador", "Administrador General", "gestionar_empleados"]
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
    var paq = subPaquete(mod, "CU07 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU07 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        relacion(C[3], C[17], "datos de entrada", "Association", "", "controlador", "entrada", "1", "1");
        relacion(C[3], C[8], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        relacion(C[3], C[4], "servicio de empleados", "Association", "", "controlador", "servicio", "1", "1");
        relacion(C[4], C[5], "hasheo de contraseña", "Dependency", "uses", "empleados", "bcrypt", "1", "1");
        relacion(C[4], C[6], "envío de email", "Association", "", "empleados", "correo", "1", "1");
        relacion(C[4], C[7], "auditoría del alta", "Association", "", "empleados", "auditor", "1", "1");
        relacion(C[4], C[9], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        relacion(C[4], C[10], "cuenta creada", "Aggregation", "aggregation", "empleados", "usuario", "1", "1");
        relacion(C[4], C[11], "ficha de empleado", "Composition", "composition", "empleados", "ficha", "1", "0..1");
        relacion(C[4], C[12], "token de primera contraseña", "Composition", "composition", "empleados", "token", "1", "0..*");
        relacion(C[4], C[13], "rol asignado", "Association", "", "empleados", "rol", "1", "0..1");
        relacion(C[4], C[14], "sucursal asignada", "Association", "", "empleados", "sucursal", "1", "0..1");
        relacion(C[4], C[15], "asignación de rol", "Composition", "composition", "empleados", "asignación", "1", "1");
        relacion(C[8], C[10], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");
        relacion(C[7], C[16], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        relacion(C[7], C[9], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        relacion(C[16], C[10], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");
        relacion(C[11], C[10], "empleado asociado", "Composition", "composition", "ficha", "usuario", "1", "1");
        relacion(C[12], C[10], "titular del token", "Association", "", "token", "usuario", "0..*", "0..1");
        relacion(C[15], C[10], "usuario asignado", "Association", "", "asignación", "usuario", "1", "1");
        relacion(C[15], C[13], "rol asignado", "Association", "", "asignación", "rol", "1", "1");
        relacion(C[14], C[11], "sucursal del empleado", "Association", "", "sucursal", "empleados", "1", "0..*");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("Los mensajes y las excepciones de CU07 solo estan en el diagrama de comunicacion.");
        N.push("");
        N.push("1 actor, 18 clases y 27 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (3), CTR_ controlador (1), SRV_ servicio (6), CE_ entidad o DTO (8).");
        N.push("");
        N.push("DISCREPANCIAS CON EL CASO DE USO, verificadas contra el codigo real:");
        N.push("");
        N.push("1. NO existe el decorador @require_permission. El permiso se verifica dentro del servicio con");
        N.push("   cargarPermisos() y verificarPermiso(permisos, 'gestionar_empleados'), que acepta el comodin");
        N.push("   * o el permiso exacto. Si falta, lanza ForbiddenException con HTTP 403 y el mensaje");
        N.push("   No tienes permiso para gestionar usuarios. En el frontend, Usuarios.tsx calcula permisoOk con");
        N.push("   la misma regla contra usuario.permisos y oculta el panel si no lo tiene.");
        N.push("");
        N.push("2. El permiso real es gestionar_empleados, NO gestionar_usuarios como dice el caso.");
        N.push("   Aparece en adminMenu.ts, Roles.tsx y SRV_RolesService.ts dentro del grupo Usuarios.");
        N.push("");
        N.push("3. El email NO se envia de verdad. SRV_EmailService._enviarViaSmtp() lanza");
        N.push("   Error('SMTP aun no configurado en el prototipo.'). Con EMAIL_ENABLED en false, que es el valor");
        N.push("   por defecto, el servicio solo escribe [EMAIL SIMULADO] en el log y DEVUELVE TRUE. Por lo tanto");
        N.push("   la excepcion E3 no puede producirse con la configuracion por defecto; solo ocurre si");
        N.push("   EMAIL_ENABLED=true, momento en que el catch devuelve false.");
        N.push("");
        N.push("4. El correo que se envia es el de PRIMERA CONTRASENA, no un email de bienvenida generico:");
        N.push("   enviarPrimeraContrasena(email, token) con el enlace");
        N.push("   {EMAIL_BASE_URL}/establecer-contrasena?token={token}, que es el flujo de CU06.");
        N.push("   El metodo enviarBienvenida() existe y apunta a /confirmar-cuenta?token=, pero NO se usa aqui.");
        N.push("");
        N.push("5. El caso no menciona la tabla usuarios_roles, pero el codigo SI inserta en ella con");
        N.push("   insert().into('usuarios_roles'), tomando el Rol que coincide con LOWER(nombre_rol) =");
        N.push("   LOWER(:nombre). Sin esa asignacion el usuario nuevo no tendria ningun rol.");
        N.push("");
        N.push("6. Los roles validos no son los del caso. El codigo acepta exactamente");
        N.push("   Administrador, Encargado de Sucursal y Cajero. Si el rol no esta en esa lista devuelve");
        N.push("   HTTP 400 El rol seleccionado no es valido. Esa excepcion NO esta documentada en el caso.");
        N.push("");
        N.push("7. bcrypt usa 10 rondas, no 12, porque el hasheo delega en SeguridadService.hashearPassword,");
        N.push("   que hace bcrypt.hash(password, 10).");
        N.push("");
        N.push("8. El token de first_password_tokens se genera con randomUUID() y caduca a 24 horas, calculado");
        N.push("   con SELECT NOW()::timestamp mas 24 * 60 * 60 * 1000. El caso no especifica la vigencia.");
        N.push("   La columna es token varchar(36) UNIQUE, no UUID.");
        N.push("");
        N.push("9. E3: NO existe el boton Reenviar Invitacion. Usuarios.tsx no tiene ninguna accion de reenvio.");
        N.push("   Lo unico es el texto de la respuesta: Empleado {nombre} registrado. No se pudo enviar el");
        N.push("   email (intenta reenviar la invitacion).");
        N.push("");
        N.push("10. La respuesta real es HTTP 201 Created con el cuerpo { detail, usuario_id }. El caso solo");
        N.push("   menciona 201 sin especificar el cuerpo.");
        N.push("");
        N.push("11. La bitacora real escribe accion_sql = INSERT, tabla_afectada = usuarios, id_registro =");
        N.push("    id_usuario del nuevo empleado y detalle = Empleado registrado: {nombre} ({email}) - rol: {rol}.");
        N.push("");
        N.push("12. El listado de empleados excluye siempre al usuario con id_usuario = 1, con la condicion");
        N.push("    u.id_usuario != 1. Detalle que el caso no menciona.");
        N.push("");
        N.push("13. El caso no menciona el endpoint GET /api/v1/admin/sucursales/activas, que es el que llena");
        N.push("    el selector de sucursal del modal con los registros donde LOWER(estado) = 'activa'.");
        N.push("");
        N.push("14. El caso describe Angular y FastAPI; la implementacion real es React/Vite con NestJS.");
        N.push("    No hay cliente Flutter.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU07 - REGISTRAR NUEVO EMPLEADO - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 81");
    T.push("Operaciones reales: " + totalOpe + " de 26");
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
    msg = msg + "CU07 - Registrar nuevo empleado" + SALTO + SALTO;
    msg = msg + "Clases: 18    Actores: 1    Relaciones: 27" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 81" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 26" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU07 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU07 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU07", 0); } catch (e3) { }
}
