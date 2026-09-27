// ================================================================
// CU10 - REHABILITAR EMPLEADO
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   web/src/pages/admin/Usuarios.tsx                ModalConfirmarRehabilitar, boton UserCheck
//   web/src/lib/api.ts                             rehabilitarEmpleado(idUsuario)
//   api/src/modulos/seguridad/CTR_Empleados.ts      PATCH empleados/:id/rehabilitar (sin Body)
//   api/src/modulos/seguridad/SRV_EmpleadosService.ts   rehabilitarEmpleado
//   api/src/modulos/seguridad/dependencias.ts          JwtAuthGuard
//   api/src/modulos/seguridad/SRV_BitacoraService.ts   registrar
//   api/src/modulos/seguridad/CE_Modelos.ts          Usuario, UsuarioEmpleado
//   BASE DE DATOS/schema.sql                       fecha_baja y motivo_baja en usuarios_empleados
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
     [["empleados", "Array", VIS_PUB], ["empleadoRehabilitar", "EmpleadoItem", VIS_PUB], ["enviandoAlta", "Boolean", VIS_PUB], ["errorAlta", "String", VIS_PUB], ["enviandoBaja", "Boolean", VIS_PUB], ["errorBaja", "String", VIS_PUB], ["toast", "Object", VIS_PUB], ["permisoOk", "Boolean", VIS_PUB]],
     [["abrirModalRehabilitar", "void", ["emp"], VIS_PUB], ["cerrarModalRehabilitar", "void", [], VIS_PUB], ["rehabilitar", "void", [], VIS_PUB], ["deshabilitar", "void", ["motivo"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_ModalConfirmarRehabilitar", "ModalConfirmarRehabilitar", "pages/admin/Usuarios.tsx",
     [["empleado", "EmpleadoItem", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB]],
     [["alConfirmar", "void", [], VIS_PUB], ["alCerrar", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "api", "lib/api.ts",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["listarEmpleados", "Array", [], VIS_PUB], ["rehabilitarEmpleado", "Object", ["idUsuario"], VIS_PUB], ["deshabilitarEmpleado", "Object", ["idUsuario", "motivo"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_EmpleadosController", "EmpleadosController", "CTR_Empleados.ts",
     [["empleadosService", "EmpleadosService", VIS_PRI]],
     [["rehabilitarEmpleado", "Object", ["id", "request", "currentUser"], VIS_PUB], ["deshabilitarEmpleado", "Object", ["id", "body", "request", "currentUser"], VIS_PUB], ["listarEmpleados", "Array", ["currentUser"], VIS_PUB]]],

    ["SRV_EmpleadosService", "EmpleadosService", "SRV_EmpleadosService.ts",
     [["logger", "Logger", VIS_PRI], ["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["verificarPermiso", "Boolean", ["permisos", "permiso"], VIS_PRI], ["rehabilitarEmpleado", "Object", ["usuario", "idUsuario", "request"], VIS_PUB], ["listarEmpleados", "Array", ["usuario"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "JwtAuthGuard", "dependencias.ts",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

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

    ["CE_BitacoraAuditoria", "BitacoraAuditoria", "tabla bitacora_auditoria",
     [["id_bitacora", "Integer", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "String", VIS_PUB], ["user_agent", "String", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_EmpleadoItem", "EmpleadoItem", "SRV_EmpleadosService.ts",
     [["id_usuario", "Integer", VIS_PUB], ["id_empleado", "Integer", VIS_PUB], ["email", "String", VIS_PUB], ["nombre_empleado", "String", VIS_PUB], ["telefono", "String", VIS_PUB], ["sucursal_id", "Integer", VIS_PUB], ["sucursal_nombre", "String", VIS_PUB], ["rol", "String", VIS_PUB], ["estado", "String", VIS_PUB], ["fecha_creacion", "String", VIS_PUB], ["ultimo_login", "String", VIS_PUB]],
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
    var paq = subPaquete(mod, "CU10 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU10 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        relacion(C[1], C[9], "empleado rehabilitado", "Association", "", "modal", "empleado", "1", "1");
        relacion(C[0], C[2], "cliente HTTP", "Dependency", "uses", "pantalla", "cliente", "1", "1");
        relacion(C[2], C[3], "punto de acceso HTTP", "Dependency", "uses", "consumidor", "endpoint", "1", "0..1");
        relacion(C[3], C[5], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        relacion(C[3], C[4], "servicio de empleados", "Association", "", "controlador", "servicio", "1", "1");
        relacion(C[4], C[5], "usuario autenticado", "Association", "", "empleados", "guard", "1", "1");
        relacion(C[4], C[6], "auditoría de la reactivación", "Association", "", "empleados", "auditor", "1", "1");
        relacion(C[4], C[7], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        relacion(C[4], C[8], "cuenta rehabilitada", "Composition", "composition", "empleados", "usuario", "1", "1");
        relacion(C[4], C[10], "ficha restablecida", "Composition", "composition", "empleados", "ficha", "1", "0..1");
        relacion(C[5], C[8], "estado de la cuenta", "Association", "", "guard", "usuario", "1", "0..1");
        relacion(C[6], C[9], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        relacion(C[6], C[7], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        relacion(C[9], C[8], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");
        relacion(C[10], C[8], "empleado asociado", "Composition", "composition", "ficha", "usuario", "1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("Los mensajes y las excepciones de CU10 solo estan en el diagrama de comunicacion.");
        N.push("");
        N.push("1 actor, 12 clases y 17 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (3), CTR_ controlador (1), SRV_ servicio (4), CE_ entidad o DTO (4).");
        N.push("");
        N.push("LO QUE SI COINCIDE CON EL CASO:");
        N.push("");
        N.push("- Dos UPDATE, uno en usuarios y otro en usuarios_empleados, exactamente como se describe.");
        N.push("  UPDATE usuarios SET estado = 'Activo' WHERE id_usuario = ? AND LOWER(estado) = 'inactivo'");
        N.push("  UPDATE usuarios_empleados SET fecha_baja = NULL, motivo_baja = NULL WHERE usuario_id = ?");
        N.push("- No se toca ni usuarios_roles ni roles: el rol, la sucursal y los permisos quedan intactos.");
        N.push("- E1: 409 El empleado no se encuentra inactivo. Correcto, sale del affected = 0.");
        N.push("- E2: 403 No tienes permiso para gestionar usuarios. con el permiso gestionar_empleados.");
        N.push("- E3: 404 Empleado no encontrado. Correcto.");
        N.push("- El modal y el boton existen: ModalConfirmarRehabilitar y el icono UserCheck, que solo se");
        N.push("  muestra cuando emp.estado === 'Inactivo'.");
        N.push("- La respuesta es 200 con { detail: 'Empleado rehabilitado.' }.");
        N.push("");
        N.push("DISCREPANCIAS CON EL CASO DE USO, verificadas contra el codigo real:");
        N.push("");
        N.push("1. E1 esta mal planteada. El caso dice que un id inexistente tambien produce 409, pero el");
        N.push("   codigo primero busca el usuario y, si no existe, responde 404 Empleado no encontrado.");
        N.push("   El 409 solo se produce cuando el usuario EXISTE pero no esta en estado inactivo. Por eso");
        N.push("   E1 y E3 no se solapan como en el caso.");
        N.push("");
        N.push("2. La condicion del UPDATE usa LOWER(estado) = 'inactivo', no estado = 'Inactivo'.");
        N.push("");
        N.push("3. La consulta del objetivo NO hace join con roles. En RehabilitarEmpleado el query es solo");
        N.push("   where u.id_usuario = :id, sin leftJoinAndSelect de usuarios_roles y roles, al contrario que");
        N.push("   en inhabilitarEmpleado. No hace falta porque no hay validacion de superadministrador.");
        N.push("");
        N.push("4. NO hay validacion de auto-rehabilitacion ni de superadministrador. El caso no lo pide, y es");
        N.push("   correcto: rehabilitar es una accion habilitadora, no destructiva. Como contraste, en CU09 si");
        N.push("   hay dos bloqueos que aqui no existen.");
        N.push("");
        N.push("5. El endpoint NO recibe cuerpo. El controlador es");
        N.push("   PATCH empleados/:id/rehabilitar con solo @Param id, @Req request y @UsuarioActual,");
        N.push("   sin @Body. La firma del cliente es rehabilitarEmpleado(idUsuario) sin segundo argumento,");
        N.push("   y el modal ModalConfirmarRehabilitar recibe alConfirmar: () => void, sin argumento. En");
        N.push("   CU09 en cambio si hay body { motivo?: string } y campo de texto en el modal.");
        N.push("");
        N.push("6. El new_data de la bitacora es mas simple que el de CU09. Aqui:");
        N.push("   old_data = { estado: 'Inactivo' } y new_data = { estado: 'Activo' },");
        N.push("   sin incluir fecha_baja. El detalle es Empleado rehabilitado: {email}.");
        N.push("");
        N.push("7. El caso no menciona el endpoint hermano PATCH empleados/:id/deshabilitar, que es CU09 y");
        N.push("   esta implementado justo encima en el mismo servicio. Los dos metodos son inversos.");
        N.push("");
        N.push("8. El listado de empleados sigue excluyendo siempre al usuario con id_usuario = 1.");
        N.push("");
        N.push("9. El caso describe Angular y FastAPI; la implementacion real es React/Vite con NestJS.");
        N.push("    No hay cliente Flutter.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU10 - REHABILITAR EMPLEADO - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 51");
    T.push("Operaciones reales: " + totalOpe + " de 20");
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
    msg = msg + "CU10 - Rehabilitar empleado" + SALTO + SALTO;
    msg = msg + "Clases: 12    Actores: 1    Relaciones: 17" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 51" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 20" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU10 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU10 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU10", 0); } catch (e3) { }
}
