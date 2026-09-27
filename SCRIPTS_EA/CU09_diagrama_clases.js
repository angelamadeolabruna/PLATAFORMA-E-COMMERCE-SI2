// ================================================================
// CU09 - INHABILITAR EMPLEADO (BAJA LOGICA)
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   web/src/pages/admin/Usuarios.tsx                tabla, ModalConfirmarDeshabilitar, campo motivo
//   web/src/lib/api.ts                             listarEmpleados, deshabilitarEmpleado
//   api/src/modulos/seguridad/CTR_Empleados.ts      PATCH empleados/:id/deshabilitar
//   api/src/modulos/seguridad/SRV_EmpleadosService.ts   inhabilitarEmpleado
//   api/src/modulos/seguridad/dependencias.ts          JwtAuthGuard
//   api/src/modulos/seguridad/SRV_JWTService.ts         verificarAccessToken, estaEnBlacklist
//   api/src/modulos/seguridad/SRV_BitacoraService.ts   registrar con old_data y new_data
//   api/src/modulos/seguridad/CE_Modelos.ts          Usuario, UsuarioEmpleado, Rol, UsuarioRol
//   BASE DE DATOS/schema.sql                       fecha_baja vive en usuarios_empleados
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
     [["empleados", "Array", VIS_PUB], ["empleadoDeshabilitar", "EmpleadoItem", VIS_PUB], ["enviandoBaja", "Boolean", VIS_PUB], ["errorBaja", "String", VIS_PUB], ["enviandoAlta", "Boolean", VIS_PUB], ["errorAlta", "String", VIS_PUB], ["toast", "Object", VIS_PUB], ["permisoOk", "Boolean", VIS_PUB]],
     [["abrirModalDeshabilitar", "void", ["emp"], VIS_PUB], ["cerrarModalDeshabilitar", "void", [], VIS_PUB], ["deshabilitar", "void", ["motivo"], VIS_PUB], ["rehabilitar", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_ModalConfirmarDeshabilitar", "ModalConfirmarDeshabilitar", "pages/admin/Usuarios.tsx",
     [["empleado", "EmpleadoItem", VIS_PUB], ["motivo", "String", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB]],
     [["alConfirmar", "void", ["motivo"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "api", "lib/api.ts",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["listarEmpleados", "Array", [], VIS_PUB], ["deshabilitarEmpleado", "Object", ["idUsuario", "motivo"], VIS_PUB], ["rehabilitarEmpleado", "Object", ["idUsuario"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_EmpleadosController", "EmpleadosController", "CTR_Empleados.ts",
     [["empleadosService", "EmpleadosService", VIS_PRI]],
     [["deshabilitarEmpleado", "Object", ["id", "body", "request", "currentUser"], VIS_PUB], ["listarEmpleados", "Array", ["currentUser"], VIS_PUB]]],

    ["SRV_EmpleadosService", "EmpleadosService", "SRV_EmpleadosService.ts",
     [["logger", "Logger", VIS_PRI], ["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["verificarPermiso", "Boolean", ["permisos", "permiso"], VIS_PRI], ["inhabilitarEmpleado", "Object", ["usuario", "idUsuario", "request", "motivo"], VIS_PUB], ["listarEmpleados", "Array", ["usuario"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "JwtAuthGuard", "dependencias.ts",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_JwtTokenService", "JwtTokenService", "SRV_JWTService.ts",
     [["tokenBlacklistRepo", "Repository", VIS_PRI]],
     [["verificarAccessToken", "TokenPayload", ["token"], VIS_PUB], ["estaEnBlacklist", "Boolean", ["jti"], VIS_PUB], ["decodificar", "TokenPayload", ["token"], VIS_PUB]]],

    ["SRV_BitacoraService", "BitacoraService", "SRV_BitacoraService.ts",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_DataSource", "DataSource", "TypeORM",
     [],
     [["getRepository", "Repository", ["entidad"], VIS_PUB], ["query", "Array", ["sql", "params"], VIS_PUB]]],

    ["CE_Usuario", "Usuario", "tabla usuarios",
     [["id_usuario", "Integer", VIS_PRI], ["email", "String", VIS_PRI], ["ci", "String", VIS_PRI], ["password_hash", "String = 255", VIS_PRI], ["estado", "String", VIS_PUB], ["intentos_fallidos", "Integer", VIS_PUB], ["bloqueado_hasta", "Timestamp", VIS_PUB], ["fecha_creacion", "Timestamp", VIS_PUB], ["fecha_ultimo_acceso", "Timestamp", VIS_PUB], ["ultimo_login", "Timestamp", VIS_PUB]],
     []],

    ["CE_UsuarioEmpleado", "UsuarioEmpleado", "tabla usuarios_empleados",
     [["id_empleado", "Integer", VIS_PRI], ["usuario", "Usuario", VIS_PRI], ["sucursal_id", "Integer", VIS_PUB], ["nombre", "String = 120", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["rol", "String = 60", VIS_PUB], ["fecha_baja", "Timestamp", VIS_PUB], ["motivo_baja", "String = 255", VIS_PUB]],
     []],

    ["CE_Rol", "Rol", "tabla roles",
     [["id_rol", "Integer", VIS_PRI], ["nombre_rol", "String = 60 UNIQUE", VIS_PUB], ["descripcion", "Text", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["estado", "String = Activo", VIS_PUB], ["fecha_creacion", "Timestamp", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "UsuarioRol", "tabla usuarios_roles",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_BitacoraAuditoria", "BitacoraAuditoria", "tabla bitacora_auditoria",
     [["id_bitacora", "Integer", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "String", VIS_PUB], ["user_agent", "String", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_DeshabilitarEmpleadoRequest", "DeshabilitarEmpleadoRequest", "CTR_Empleados.ts",
     [["motivo", "String", VIS_PUB]],
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
    var paq = subPaquete(mod, "CU09 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU09 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        relacion(C[0], C[1], "modal de confirmación", "Association", "", "pantalla", "modal", "0..1", "1");
        relacion(C[1], C[9], "empleado deshabilitado", "Association", "", "modal", "empleado", "1", "1");
        relacion(C[0], C[2], "cliente HTTP", "Dependency", "uses", "pantalla", "cliente", "1", "1");
        relacion(C[2], C[3], "punto de acceso HTTP", "Dependency", "uses", "consumidor", "endpoint", "1", "0..1");
        relacion(C[3], C[14], "datos de entrada", "Association", "", "controlador", "motivo", "1", "1");
        relacion(C[3], C[5], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        relacion(C[3], C[4], "servicio de empleados", "Association", "", "controlador", "servicio", "1", "1");
        relacion(C[4], C[5], "usuario autenticado", "Association", "", "empleados", "guard", "1", "1");
        relacion(C[4], C[7], "auditoría de la baja", "Association", "", "empleados", "auditor", "1", "1");
        relacion(C[4], C[8], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        relacion(C[4], C[9], "cuenta deshabilitada", "Composition", "composition", "empleados", "usuario", "1", "1");
        relacion(C[4], C[10], "ficha actualizada", "Composition", "composition", "empleados", "ficha", "1", "0..1");
        relacion(C[4], C[11], "rol del objetivo", "Association", "", "empleados", "rol", "1", "0..1");
        relacion(C[4], C[12], "roles del objetivo", "Association", "", "empleados", "asignación", "1", "0..*");
        relacion(C[5], C[6], "verificación de token", "Association", "", "guard", "emisor", "1", "1");
        relacion(C[5], C[9], "estado de la cuenta", "Association", "", "guard", "usuario", "1", "0..1");
        relacion(C[7], C[13], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        relacion(C[7], C[8], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        relacion(C[13], C[9], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");
        relacion(C[12], C[9], "usuario asignado", "Association", "", "asignación", "usuario", "1", "1");
        relacion(C[12], C[11], "rol asignado", "Association", "", "asignación", "rol", "1", "1");
        relacion(C[10], C[9], "empleado asociado", "Composition", "composition", "ficha", "usuario", "1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("Los mensajes y las excepciones de CU09 solo estan en el diagrama de comunicacion.");
        N.push("");
        N.push("1 actor, 15 clases y 22 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (3), CTR_ controlador (1), SRV_ servicio (5), CE_ entidad o DTO (6).");
        N.push("");
        N.push("DISCREPANCIAS CON EL CASO DE USO, verificadas contra el codigo real:");
        N.push("");
        N.push("1. fecha_baja NO esta en la tabla usuarios, sino en usuarios_empleados. La precondicion del caso");
        N.push("   dice Columna fecha_baja disponible en usuarios, y es incorrecto: en schema.sql, usuarios");
        N.push("   tiene id_usuario, email, ci, password_hash, estado, intentos_fallidos, bloqueado_hasta,");
        N.push("   fecha_creacion, fecha_ultimo_acceso y ultimo_login. fecha_baja y motivo_baja viven en");
        N.push("   usuarios_empleados. Por eso el codigo hace DOS UPDATE, no uno:");
        N.push("   UPDATE usuarios SET estado = 'Inactivo' WHERE id_usuario = ? AND LOWER(estado) = 'activo'");
        N.push("   UPDATE usuarios_empleados SET fecha_baja = NOW(), motivo_baja = ? WHERE usuario_id = ?");
        N.push("");
        N.push("2. La respuesta del guard es HTTP 401, no 403. JwtAuthGuard.canActivate lanza");
        N.push("   UnauthorizedException('Tu cuenta esta deshabilitada. Contacta al administrador.') cuando");
        N.push("   usuario.estado.toLowerCase() !== 'activo'. El caso afirma 403 en dos lugares.");
        N.push("");
        N.push("3. NO se revoca la sesion en el sentido del caso. No se inserta nada en token_blacklist ni se");
        N.push("   toca la tabla sesiones. El JWT sigue siendo criptograficamente valido hasta expirar: lo");
        N.push("   unico que cambia es la consulta de estado que el guard hace en cada peticion.");
        N.push("");
        N.push("4. E3 se decide por NOMBRE de rol, no por id_rol = 1. El codigo lee el rol del objetivo con");
        N.push("   leftJoinAndSelect de usuarios_roles y roles, y compara");
        N.push("   objetivo.rol?.nombre_rol === 'Administrador'. El caso dice superadministrador (id_rol 1).");
        N.push("   La consecuencia practica es que cualquier usuario con un rol llamado Administrador queda");
        N.push("   protegido, sin importar su id_rol.");
        N.push("");
        N.push("5. El new_data de la bitacora es mas rico que el del caso. Real:");
        N.push("   old_data = { estado: 'Activo' } y");
        N.push("   new_data = { estado: 'Inactivo', fecha_baja: 'NOW()', ...(motivo ? { motivo } : {}) }.");
        N.push("   El caso solo menciona { estado: 'Inactivo' }. El detalle es");
        N.push("   Empleado deshabilitado: {email}, con sufijo - motivo: {motivo} cuando se informa.");
        N.push("");
        N.push("6. El motivo SI forma parte del flujo real, aunque el caso no lo liste. El componente");
        N.push("   ModalConfirmarDeshabilitar tiene un campo de texto motivo y lo entrega al padre, que lo");
        N.push("   envia como api.deshabilitarEmpleado(id_usuario, motivo.trim() || undefined). El cuerpo");
        N.push("   del PATCH es { motivo?: string }. El caso solo lo menciona de pasada en la postcondicion.");
        N.push("");
        N.push("7. La condicion de E1 usa LOWER(estado) = 'activo', no estado = 'Activo'. El mensaje es");
        N.push("   exactamente El empleado ya esta inactivo. Correcto. E2 y E3 también coinciden:");
        N.push("   400 No puede deshabilitar su propia cuenta. y 403 No puede deshabilitar al superadministrador.");
        N.push("");
        N.push("8. El caso no menciona el endpoint hermano PATCH /admin/empleados/:id/rehabilitar, que es");
        N.push("   CU10 y esta implementado en el mismo servicio. rehabilitarEmpleado es el inverso exacto:");
        N.push("   pone estado = Activo, limpia fecha_baja y motivo_baja, y responde 409 El empleado no se");
        N.push("   encuentra inactivo. si el usuario no estaba inactivo.");
        N.push("");
        N.push("9. El listado de empleados excluye siempre al usuario con id_usuario = 1, con la condicion");
        N.push("   u.id_usuario != 1. Detalle que el caso no menciona al ordenar la tabla.");
        N.push("");
        N.push("10. El permiso real es gestionar_empleados y el mensaje de rechazo es");
        N.push("    No tienes permiso para gestionar usuarios. (403), no gestionar_usuarios.");
        N.push("");
        N.push("11. El caso describe Angular y FastAPI; la implementacion real es React/Vite con NestJS.");
        N.push("    No hay cliente Flutter.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU09 - INHABILITAR EMPLEADO (BAJA LOGICA) - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 60");
    T.push("Operaciones reales: " + totalOpe + " de 24");
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
    msg = msg + "CU09 - Inhabilitar empleado (baja logica)" + SALTO + SALTO;
    msg = msg + "Clases: 15    Actores: 1    Relaciones: 22" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 60" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 24" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU09 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU09 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU09", 0); } catch (e3) { }
}
