// ================================================================
// CU04 - CAMBIAR CONTRASENA PROPIA
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   web/src/lib/api.ts                            api.cambiarPassword  (SIN llamador)
//   web/src/router.tsx                            NO existe la ruta /mi-perfil
//   api/src/modulos/seguridad/CTR_Auth.ts         PUT cambiar-password
//   api/src/modulos/seguridad/Esquemas.ts         CambiarPasswordRequest, MensajeResponse
//   api/src/modulos/seguridad/SRV_AuthService.ts  cambiarPassword
//   api/src/modulos/seguridad/SRV_SeguridadService.ts  validarPassword, hashearPassword
//   api/src/modulos/seguridad/dependencias.ts     JwtAuthGuard
//   api/src/modulos/seguridad/SRV_BitacoraService.ts   registrar
//   api/src/modulos/seguridad/CE_Modelos.ts       Usuario, TokenBlacklist, BitacoraAuditoria
//   BASE DE DATOS/schema.sql                      tabla usuarios (sin fecha_actualizacion)
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
    ["IU_Api", "api", "lib/api.ts",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["cambiarPassword", "MensajeResponse", ["passwordActual", "passwordNueva"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_AuthController", "AuthController", "CTR_Auth.ts",
     [["cookieSecure", "Boolean", VIS_PRI]],
     [["cambiarPassword", "MensajeResponse", ["body", "request", "currentUser"], VIS_PUB]]],

    ["SRV_AuthService", "AuthService", "SRV_AuthService.ts",
     [["dataSource", "DataSource", VIS_PRI], ["jwtTokenService", "JwtTokenService", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI], ["seguridadService", "SeguridadService", VIS_PRI]],
     [["cambiarPassword", "MensajeResponse", ["usuario", "body", "request"], VIS_PUB]]],

    ["SRV_SeguridadService", "SeguridadService", "SRV_SeguridadService.ts",
     [],
     [["validarPassword", "Boolean", ["usuario", "password"], VIS_PUB], ["hashearPassword", "String", ["password"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "JwtAuthGuard", "dependencias.ts",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["extraerToken", "String", ["request"], VIS_PRI]]],

    ["SRV_BitacoraService", "BitacoraService", "SRV_BitacoraService.ts",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_DataSource", "DataSource", "TypeORM",
     [],
     [["getRepository", "Repository", ["entidad"], VIS_PUB], ["query", "Array", ["sql", "params"], VIS_PUB]]],

    ["CE_CambiarPasswordRequest", "CambiarPasswordRequest", "Esquemas.ts",
     [["password_actual", "String", VIS_PUB], ["password_nueva", "String", VIS_PUB]],
     []],

    ["CE_MensajeResponse", "MensajeResponse", "Esquemas.ts",
     [["detail", "String", VIS_PUB]],
     []],

    ["CE_Usuario", "Usuario", "tabla usuarios",
     [["id_usuario", "Integer", VIS_PRI], ["email", "String", VIS_PRI], ["ci", "String", VIS_PRI], ["password_hash", "String = 255", VIS_PRI], ["estado", "String", VIS_PUB], ["intentos_fallidos", "Integer", VIS_PUB], ["bloqueado_hasta", "Timestamp", VIS_PUB], ["fecha_creacion", "Timestamp", VIS_PUB], ["fecha_ultimo_acceso", "Timestamp", VIS_PUB], ["ultimo_login", "Timestamp", VIS_PUB]],
     []],

    ["CE_TokenBlacklist", "TokenBlacklist", "tabla token_blacklist",
     [["id_token", "Integer", VIS_PRI], ["jti", "String = 128 UNIQUE", VIS_PRI], ["usuario_id", "Integer", VIS_PUB], ["expira_en", "Timestamp", VIS_PUB], ["revocado_en", "Timestamp", VIS_PUB]],
     []],

    ["CE_BitacoraAuditoria", "BitacoraAuditoria", "tabla bitacora_auditoria",
     [["id_bitacora", "Integer", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "String", VIS_PUB], ["user_agent", "String", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Administrador", "Administrador"],
    ["ACTOR_EncargadoSucursal", "Encargado de Sucursal"],
    ["ACTOR_Cajero", "Cajero"],
    ["ACTOR_Cliente", "Cliente"]
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
    var paq = subPaquete(mod, "CU04 - Análisis de clases");

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
        nota(act, "Actor externo. " + ACTORES[a][1] + " puede cambiar su propia contrasena.");
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
        INFORME.push(pad(d2[0], 24) + " atr " + totalDe(fin) + "/" + d2[3].length + "  ope " + totalDe(finOpe) + "/" + d2[4].length + (bien ? "  REAL" : "  TEXTO"));
    }

    var diag = null;
    try { diag = paq.Diagrams.AddNew("CU04 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        for (var r = 0; r < actores.length; r++) relacion(actores[r], C[0], "usuario autenticado", "Association", "", "actor", "cliente web", "1", "0..1");
        relacion(C[0], C[1], "punto de acceso HTTP", "Dependency", "uses", "consumidor", "endpoint", "1", "0..1");
        relacion(C[1], C[2], "servicio de autenticación", "Association", "", "controlador", "servicio", "1", "1");
        relacion(C[1], C[4], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        relacion(C[1], C[7], "datos de entrada", "Association", "", "controlador", "entrada", "1", "1");
        relacion(C[1], C[8], "datos de salida", "Association", "", "controlador", "salida", "1", "1");
        relacion(C[2], C[3], "verificación y hasheo", "Dependency", "uses", "autenticador", "bcrypt", "1", "1");
        relacion(C[2], C[5], "auditoría del cambio", "Association", "", "autenticador", "auditor", "1", "1");
        relacion(C[2], C[6], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        relacion(C[2], C[9], "cuenta actualizada", "Aggregation", "aggregation", "autenticador", "usuario", "1", "1");
        relacion(C[2], C[10], "tokens previos revocados", "Composition", "composition", "autenticador", "blacklist", "1", "0..*");
        relacion(C[4], C[9], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");
        relacion(C[5], C[11], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        relacion(C[5], C[6], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        relacion(C[11], C[9], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");
        relacion(C[10], C[9], "titular del token", "Association", "", "blacklist", "usuario", "0..*", "0..1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("Los mensajes y las excepciones de CU04 solo estan en el diagrama de comunicacion.");
        N.push("");
        N.push("4 actores externos, 12 clases y 20 relaciones estaticas. El rol va en el nombre, no en el");
        N.push("estereotipo: IU_ interfaz de usuario (1), CTR_ controlador (1), SRV_ servicio (5), CE_ entidad o DTO (5).");
        N.push("");
        N.push("AVISO IMPORTANTE: la pantalla de este caso de uso NO EXISTE en el codigo real. Solo estan");
        N.push("implementados el endpoint del backend y el metodo cliente api.cambiarPassword, que ademas");
        N.push("no tiene ningun llamador. Por eso el diagrama tiene una sola clase de interfaz de usuario.");
        N.push("");
        N.push("DISCREPANCIAS CON EL CASO DE USO, verificadas contra el codigo real:");
        N.push("");
        N.push("1. NO existe la pantalla. router.tsx no declara la ruta /mi-perfil, no hay pages/Perfil.tsx");
        N.push("   ni ProfileScreen en movil. No hay seccion Seguridad, ni modal de tres campos, ni boton");
        N.push("   Guardar Contrasena, ni indicador de fortaleza, ni fecha del ultimo cambio.");
        N.push("");
        N.push("2. api.cambiarPassword() esta definida en lib/api.ts linea 1046 pero NO la invoca nadie en");
        N.push("   todo web/src. El endpoint existe; la UI que lo usaria todavia no esta implementada.");
        N.push("");
        N.push("3. La ruta real es PUT /api/v1/auth/cambiar-password, y no cambiar-contrasena.");
        N.push("   Ver CTR_Auth.ts linea 121 y api.ts linea 1048.");
        N.push("");
        N.push("4. El body real es { password_actual, password_nueva } con validacion class-validator:");
        N.push("   password_actual con @IsString y @IsNotEmpty; password_nueva con @IsString, @IsNotEmpty,");
        N.push("   @MinLength(8) y @MaxLength(72). No hay campo de confirmacion, por lo que la excepcion E4");
        N.push("   Las contrasenas no coinciden es solo de frontend y no tiene equivalente en el backend.");
        N.push("");
        N.push("5. La tabla usuarios NO tiene columna fecha_actualizacion, ni en CE_Modelos.ts ni en");
        N.push("   schema.sql. El caso pide UPDATE usuarios SET password_hash, fecha_actualizacion = NOW();");
        N.push("   el codigo real solo hace usuario.password_hash = nuevoHash y save(usuario). La post-");
        N.push("   condicion de incrementar fecha_actualizacion NO se cumple con el esquema actual.");
        N.push("");
        N.push("6. El caso no menciona la tabla token_blacklist, pero el codigo real si la actualiza:");
        N.push("   UPDATE token_blacklist SET expira_en = NOW() WHERE usuario_id = ? AND expira_en > NOW().");
        N.push("   Eso invalida los tokens previos del usuario, en contra de la post-condicion que dice que");
        N.push("   las sesiones en otros dispositivos no se invalidan hasta la expiracion del JWT.");
        N.push("");
        N.push("7. bcrypt usa 10 rondas, no 12. SRV_SeguridadService.hashearPassword hace");
        N.push("   bcrypt.hash(password, 10), mientras el caso indica bcrypt.hash(password_nueva, 12).");
        N.push("");
        N.push("8. Los mensajes de excepcion SI coinciden con el caso:");
        N.push("   401 La contrasena actual es incorrecta. (UnauthorizedException) y");
        N.push("   400 La nueva contrasena debe ser diferente a la actual. (HttpException BAD_REQUEST).");
        N.push("");
        N.push("9. La respuesta real es HTTP 200 con el cuerpo de la clase MensajeResponse de Esquemas.ts:");
        N.push("   { detail: Contrasena actualizada correctamente. }. El caso lo describe como texto plano.");
        N.push("");
        N.push("10. La bitacora real escribe accion_sql = UPDATE, tabla_afectada = usuarios,");
        N.push("    id_registro = usuario.id_usuario y detalle = Cambio de contrasena. El caso solo dice");
        N.push("    INSERT bitacora_auditoria sin especificar valores.");
        N.push("");
        N.push("11. SI existe un guard: JwtAuthGuard con @UseGuards sobre PUT /auth/cambiar-password.");
        N.push("    Valida el JWT y consulta estaEnBlacklist(payload.jti) antes de autorizar.");
        N.push("");
        N.push("12. E3 (contrasena debil) y E4 (no coinciden) son validaciones de frontend. El backend solo");
        N.push("    aplica longitud minima 8 y maxima 72 con class-validator, sin reglas de fortaleza.");
        N.push("");
        N.push("13. El caso describe Angular y FastAPI; la implementacion real es React/Vite con NestJS.");
        N.push("    No hay cliente Flutter.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU04 - CAMBIAR CONTRASENA PROPIA - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 38");
    T.push("Operaciones reales: " + totalOpe + " de 11");
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
    msg = msg + "CU04 - Cambiar contrasena propia" + SALTO + SALTO;
    msg = msg + "Clases: 12    Actores: 4    Relaciones: 20" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 38" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 11" + SALTO;
    msg = msg + "AVISO: la pantalla Mi Perfil no existe en el codigo real." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU04 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU04 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU04", 0); } catch (e3) { }
}
