// ================================================================
// CU25 - CONFIGURAR ALERTAS DE STOCK MINIMO
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   api/src/modulos/inventario/CTR_Alertas.ts        3 handlers + 2 DTO con @Min(0)
//   api/src/modulos/inventario/SRV_AlertasService.ts 10 metodos, configurar SIN transaccion
//   web/src/pages/admin/AdminAlertas.tsx              ModalConfigurarUmbrales, filtro doble, input /\D/g
//   web/src/lib/api.ts:1598                           obtenerOpcionesAlertas, listarAlertas,
//                                                    configurarStockMinimo
//   schema.sql:302  inventario_stock.stock_minimo_alert   la que usa la aplicacion
//   schema.sql:331  alertas_stock_config.stock_minimo     la que usa fn_detectar_stock_bajo
//   schema.sql:848  fn_detectar_stock_bajo               lee la otra, y no la escribe nadie
//
// Sin estereotipo: el rol va en el nombre IU_ / CTR_ / SRV_ / CE_.
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
    ["IU_AdminAlertas", "EXISTE. pages/admin/AdminAlertas.tsx", "panel de alertas, filtro por sucursal y badge de contador",
     [["opciones", "Object", VIS_PUB], ["alertas", "Object", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["filtroSucursal", "String", VIS_PUB], ["modalAbierto", "Boolean", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["errorModal", "String", VIS_PUB], ["toast", "Object", VIS_PUB], ["permisoOk", "Boolean", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["guardarUmbrales", "void", ["items"], VIS_PUB], ["conAlertas", "Array", ["respuesta"], VIS_PUB], ["faltantesDe", "Integer", ["alerta"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_ModalConfigurarUmbrales", "EXISTE. AdminAlertas.tsx", "alta y edicion de N umbrales; el input descarta los signos",
     [["filas", "Array", VIS_PUB], ["opciones", "Object", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB]],
     [["agregarFila", "void", [], VIS_PUB], ["actualizarFila", "void", ["key", "campo", "valor"], VIS_PUB], ["limpiarNoNumerico", "String", ["valor"], VIS_PUB], ["esValido", "Boolean", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "EXISTE. lib/api.ts", "obtenerOpcionesAlertas devuelve el tipo OpcionesKardex",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["obtenerOpcionesAlertas", "Object", [], VIS_PUB], ["listarAlertas", "Object", ["idSucursal"], VIS_PUB], ["configurarStockMinimo", "Object", ["items"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["IU_AdminLayout", "EXISTE. AdminLayout.tsx", "campana BellRing con el contador de alertas en el menu",
     [["contadorAlertas", "Integer", VIS_PUB], ["menuAbierto", "Boolean", VIS_PUB]],
     [["cargarContador", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["CTR_AlertasController", "EXISTE. inventario/CTR_Alertas.ts", "ruta admin/inventario/alertas con 3 handlers",
     [["alertasService", "AlertasService", VIS_PRI]],
     [["opciones", "Object", ["currentUser"], VIS_PUB], ["listar", "Object", ["query", "currentUser"], VIS_PUB], ["configurar", "Object", ["body", "request", "currentUser"], VIS_PUB]]],

    ["SRV_AlertasService", "EXISTE. inventario/SRV_AlertasService.ts", "10 metodos; configura en bucle y SIN transaccion",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["esAdministrador", "Boolean", ["usuario"], VIS_PRI], ["exigirPermiso", "void", ["usuario"], VIS_PRI], ["sucursalEncargado", "Integer", ["usuario"], VIS_PRI], ["sucursalAplicar", "Integer", ["usuario", "idSucursal"], VIS_PRI], ["obtenerOpciones", "Object", ["usuario"], VIS_PUB], ["listar", "Object", ["usuario", "idSucursal"], VIS_PUB], ["configurar", "Object", ["usuario", "items", "request"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "EXISTE. seguridad/dependencias.ts", "canActivate propio; header Bearer o cookie access_token",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_BitacoraService", "EXISTE. seguridad/SRV_BitacoraService.ts", "el unico que llama es configurar, y lo llama directo",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "configurar no abre transaccion en ningun punto",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "Object", ["callback"], VIS_PUB], ["getRepository", "Repository", ["entidad"], VIS_PUB]]],

    ["SRV_FnDetectarStockBajo", "EXISTE. schema.sql:848", "FUNCION que NADIE invoca y que lee la tabla equivocada",
     [],
     [["fn_detectar_stock_bajo", "Array", [], VIS_PUB]]],

    ["CE_InventarioStock", "EXISTE. tabla inventario_stock (schema.sql:302)", "la que la aplicacion lee y escribe de verdad",
     [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_reservada", "Integer = 0", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB], ["stock_minimo_alert", "Integer = 0", VIS_PUB]],
     []],

    ["CE_AlertasStockConfig", "EXISTE. tabla alertas_stock_config (schema.sql:331)", "NADIE escribe aqui; solo la lee una funcion muerta",
     [["id_config", "Integer = PK", VIS_PRI], ["id_ptc", "Integer", VIS_PUB], ["id_categoria", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["stock_minimo", "Integer", VIS_PUB], ["notificar_email", "Boolean = false", VIS_PUB], ["ultima_notificacion", "Timestamp", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. tabla producto_talla_color", "el id_ptc del filtro y de la configuracion",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB]],
     []],

    ["CE_Producto", "EXISTE. tabla productos", "listar hace JOIN con LOWER(estado) = activo",
     [["id_producto", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_Talla", "EXISTE. tabla tallas", "se ordena por t.orden",
     [["id_talla", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["orden", "Integer", VIS_PUB]],
     []],

    ["CE_Color", "EXISTE. tabla colores", "se ordena por nombre",
     [["id_color", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB]],
     []],

    ["CE_Categoria", "EXISTE. tabla categorias", "solo aparece como FK en la tabla muerta",
     [["id_categoria", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB]],
     []],

    ["CE_Sucursal", "EXISTE. tabla sucursales", "el filtro del listado y el destino del umbral",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. tabla usuarios", "de donde sale permisos_json y el id_usuario de la bitacora",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120", VIS_PRI], ["estado", "String", VIS_PUB]],
     []],

    ["CE_UsuarioEmpleado", "EXISTE. tabla usuarios_empleados (schema.sql:76)", "la sucursal del encargado, con fecha_baja IS NULL",
     [["id_empleado", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE", VIS_PUB], ["sucursal_id", "Integer", VIS_PUB], ["nombre", "String = 120", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["rol", "String = 60", VIS_PUB], ["fecha_baja", "Timestamp", VIS_PUB], ["motivo_baja", "String = 255", VIS_PUB]],
     []],

    ["CE_Rol", "EXISTE. tabla roles", "gestionar_inventario vive en permisos_json",
     [["id_rol", "Integer = PK", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "EXISTE. tabla usuarios_roles", "une usuario con rol",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_BitacoraAuditoria", "EXISTE. tabla bitacora_auditoria", "un registro por item configurado",
     [["id_bitacora", "Integer = PK", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "String", VIS_PUB], ["user_agent", "String", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_ConfigurarAlertasRequest", "EXISTE. CTR_Alertas.ts", "con @Min(0), que ya da 400 antes que el servicio",
     [["items", "Array", VIS_PUB]],
     []],

    ["CE_ItemStockMinimoRequest", "EXISTE. CTR_Alertas.ts", "id_sucursal es opcional; el servicio puede exigirla",
     [["id_ptc", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["stock_minimo", "Integer >= 0", VIS_PUB]],
     []],

    ["CE_ConfigurarStockMinimoItemDTO", "EXISTE. SRV_AlertasService.ts", "el tipo que el controlador mapea hacia el servicio",
     [["id_ptc", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["stock_minimo", "Integer", VIS_PUB]],
     []],

    ["CE_AlertaStockItem", "EXISTE. SRV_AlertasService.ts", "el item que el panel pinta; no trae faltantes",
     [["id_stock", "Integer", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["nombre_sucursal", "String", VIS_PUB], ["nombre_producto", "String", VIS_PUB], ["talla", "String", VIS_PUB], ["color", "String", VIS_PUB], ["cantidad_disponible", "Integer", VIS_PUB], ["stock_minimo_alert", "Integer", VIS_PUB]],
     []],

    ["CE_RespuestaAlertas", "EXISTE. SRV_AlertasService.ts", "total es filas.length, sin COUNT ni paginacion",
     [["total", "Integer", VIS_PUB], ["sucursal", "Integer", VIS_PUB], ["items", "Array", VIS_PUB]],
     []],

    ["CE_FnDetectarStockBajoRow", "EXISTE. schema.sql:848", "RETURNS TABLE de fn_detectar_stock_bajo",
     [["id_ptc", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["producto", "VARCHAR", VIS_PUB], ["talla", "VARCHAR", VIS_PUB], ["color", "VARCHAR", VIS_PUB], ["stock_actual", "Integer", VIS_PUB], ["stock_minimo", "Integer", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Administrador", "Administrador General", "*"],
    ["ACTOR_Encargado", "Encargado de Sucursal", "gestionar_inventario"]
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

function main() {
    var cu = buscarPaquete(RAIZ, "Casos de Uso");
    if (cu == null) cu = RAIZ;
    var mod = buscarPaquete(cu, "7. Inventario y Recepciones");
    if (mod == null) mod = buscarPaquete(cu, "6. Proveedores y Compras");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU25 - Análisis de clases");

    for (var d = paq.Diagrams.Count - 1; d >= 0; d--) {
        try { paq.Diagrams.GetAt(d).Delete(); } catch (e) { }
    }
    try { paq.Diagrams.Refresh(); } catch (e) { }

    var clases = [];
    for (var n = 0; n < DEF.length; n++) {
        var def = DEF[n];
        var c = buscarLocal(paq, def[0]);
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
    var conEnDiagrama = 0;

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
        INFORME.push(pad(d2[0], 32) + " atr " + totalDe(fin) + "/" + d2[3].length + "  ope " + totalDe(finOpe) + "/" + d2[4].length + (bien ? "  REAL" : "  TEXTO"));
    }

    var diag = null;
    try { diag = paq.Diagrams.AddNew("CU25 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
    if (diag == null) ERRORES.push("no se pudo crear el diagrama");

    if (diag != null) {
        diag.Update();
        try { paq.Diagrams.Refresh(); } catch (e) { }
        var COLX = [30, 300, 570, 840, 1110];
        var ANCHO = 250;

        for (var p = 0; p < actores.length; p++) {
            colocar(diag, actores[p], COLX[p], 25, 190, 100);
        }
        for (var k2 = 0; k2 < DEF.length; k2++) {
            var col = k2 % 5;
            var fila = 1 + Math.floor(k2 / 5);
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
        conEnDiagrama += relacion(diag, actores[0], C[0], "usuario", "Association", "", "actor", "pantalla", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C[0], "usuario", "Association", "", "actor", "pantalla", "1", "0..1");
        conEnDiagrama += relacion(diag, C[0], C[1], "modal de umbrales", "Association", "", "pantalla", "modal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[0], C[2], "cliente HTTP", "Dependency", "uses", "pantalla", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[0], C[3], "contador del menú", "Dependency", "uses", "pantalla", "layout", "1", "0..1");
        conEnDiagrama += relacion(diag, C[0], C[27], "respuesta de alertas", "Association", "", "pantalla", "respuesta", "1", "0..1");
        conEnDiagrama += relacion(diag, C[0], C[26], "items de la tabla", "Association", "", "pantalla", "alerta", "0..*", "1");
        conEnDiagrama += relacion(diag, C[0], C[17], "filtro de sucursal", "Association", "", "pantalla", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C[1], C[24], "ítems del formulario", "Association", "", "modal", "item", "1", "0..*");
        conEnDiagrama += relacion(diag, C[1], C[17], "selector de sucursal", "Association", "", "modal", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C[1], C[12], "selector de producto", "Association", "", "modal", "ptc", "0..*", "1");
        conEnDiagrama += relacion(diag, C[2], C[4], "punto de acceso HTTP", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, C[3], C[2], "contador de alertas", "Dependency", "uses", "layout", "cliente", "1", "0..1");
        conEnDiagrama += relacion(diag, C[4], C[23], "cuerpo de la petición", "Association", "", "controlador", "petición", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[24], "datos de entrada", "Association", "", "controlador", "ítem", "1", "0..*");
        conEnDiagrama += relacion(diag, C[4], C[6], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[5], "servicio de alertas", "Association", "", "controlador", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[6], "usuario autenticado", "Association", "", "alertas", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[7], "auditoría de la operación", "Association", "", "alertas", "auditor", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[8], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[9], "función de stock bajo", "Dependency", "uses", "alertas", "función", "0..*", "0..1");
        conEnDiagrama += relacion(diag, C[5], C[10], "umbral configurado", "Composition", "composition", "alertas", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C[5], C[17], "sucursal resuelta", "Dependency", "uses", "alertas", "sucursal", "1", "0..*");
        conEnDiagrama += relacion(diag, C[5], C[20], "rol del usuario", "Dependency", "uses", "alertas", "rol", "1", "0..1");
        conEnDiagrama += relacion(diag, C[5], C[21], "asignación de rol", "Dependency", "uses", "alertas", "asignación", "1", "0..*");
        conEnDiagrama += relacion(diag, C[5], C[25], "DTO mapeado", "Association", "", "alertas", "dto", "1", "0..*");
        conEnDiagrama += relacion(diag, C[5], C[26], "alerta mapeada", "Association", "", "alertas", "alerta", "0..*", "1");
        conEnDiagrama += relacion(diag, C[5], C[27], "respuesta producida", "Association", "", "alertas", "respuesta", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[18], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");
        conEnDiagrama += relacion(diag, C[7], C[22], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        conEnDiagrama += relacion(diag, C[7], C[8], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[8], C[10], "fila de stock", "Dependency", "uses", "datos", "stock", "0..*", "1");
        conEnDiagrama += relacion(diag, C[9], C[10], "stock del ptc", "Dependency", "uses", "función", "stock", "0..*", "1");
        conEnDiagrama += relacion(diag, C[9], C[11], "config leída", "Dependency", "uses", "función", "config", "0..*", "1");
        conEnDiagrama += relacion(diag, C[9], C[17], "sucursal configurada", "Dependency", "uses", "función", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C[9], C[12], "producto configurado", "Dependency", "uses", "función", "ptc", "0..*", "1");
        conEnDiagrama += relacion(diag, C[9], C[28], "filas devueltas", "Association", "", "función", "fila", "0..*", "1");
        conEnDiagrama += relacion(diag, C[10], C[12], "stock por ptc", "Association", "", "stock", "ptc", "1", "1");
        conEnDiagrama += relacion(diag, C[10], C[17], "stock por sucursal", "Association", "", "stock", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[11], C[12], "producto de la config", "Dependency", "uses", "config", "ptc", "0..1", "1");
        conEnDiagrama += relacion(diag, C[11], C[17], "sucursal de la config", "Dependency", "uses", "config", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[11], C[16], "categoría configurada", "Association", "", "config", "categoría", "0..1", "0..1");
        conEnDiagrama += relacion(diag, C[12], C[13], "producto del ptc", "Association", "", "ptc", "producto", "1", "1");
        conEnDiagrama += relacion(diag, C[12], C[14], "talla del ptc", "Association", "", "ptc", "talla", "1", "0..1");
        conEnDiagrama += relacion(diag, C[12], C[15], "color del ptc", "Association", "", "ptc", "color", "1", "0..1");
        conEnDiagrama += relacion(diag, C[18], C[20], "rol del usuario", "Association", "", "usuario", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C[18], C[21], "asignación de rol", "Association", "", "usuario", "asignación", "1", "0..*");
        conEnDiagrama += relacion(diag, C[19], C[17], "sucursal del empleado", "Association", "", "empleado", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[19], C[18], "usuario del empleado", "Association", "", "empleado", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C[22], C[18], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");
        conEnDiagrama += relacion(diag, C[24], C[10], "umbral del request", "Dependency", "uses", "item", "stock", "0..*", "1");
        conEnDiagrama += relacion(diag, C[24], C[17], "sucursal del request", "Dependency", "uses", "item", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[24], C[12], "producto del request", "Dependency", "uses", "item", "ptc", "0..1", "1");
        conEnDiagrama += relacion(diag, C[25], C[10], "umbral del DTO", "Dependency", "uses", "dto", "stock", "0..*", "1");
        conEnDiagrama += relacion(diag, C[26], C[10], "alerta representada", "Dependency", "uses", "alerta", "stock", "1", "0..1");
        conEnDiagrama += relacion(diag, C[27], C[26], "alertas contenidas", "Association", "", "respuesta", "alerta", "0..*", "1");
        conEnDiagrama += relacion(diag, C[28], C[11], "config leída", "Dependency", "uses", "fila", "config", "1", "0..1");
        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("2 actores, 29 clases y 57 relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (4), CTR_ controlador (1), SRV_ servicio (5), CE_ entidad o DTO (19).");
        N.push("");
        N.push("HALLAZGO CRITICO 1: HAY DOS COLUMNAS DE UMBRAL Y LA APLICACION ESCRIBE UNA Y LA");
        N.push("FUNCION DE LA BASE LEE LA OTRA. NUNCA SE CRUZAN.");
        N.push("");
        N.push("  - SRV_AlertasService.configurar hace:");
        N.push("      UPDATE inventario_stock SET stock_minimo_alert = $1 WHERE id_stock = $2");
        N.push("    y listar filtra con s.stock_minimo_alert > 0 AND s.cantidad_disponible <= s.stock_minimo_alert");
        N.push("");
        N.push("  - fn_detectar_stock_bajo (schema.sql:848) hace:");
        N.push("      FROM alertas_stock_config a JOIN inventario_stock is2 ...");
        N.push("      WHERE a.notificar_email = true AND is2.cantidad_disponible <= a.stock_minimo");
        N.push("");
        N.push("O sea: la aplicacion escribe stock_minimo_alert en inventario_stock, y la unica funcion");
        N.push("que buscaria umbrales bajos lee stock_minimo de alertas_stock_config. Son dos tablas,");
        N.push("dos nombres de columna y ningun puente. Y ADEMAS nadie escribe en alertas_stock_config:");
        N.push("no hay ni un INSERT ni un UPDATE en ningun archivo .ts o .tsx del proyecto sobre esa");
        N.push("tabla. Esta siempre vacia, con notificar_email = false por defecto. O sea que");
        N.push("fn_detectar_stock_bajo devuelve cero filas siempre, y el camino de notificacion por");
        N.push("correo que el schema parece prever no existe. fn_detectar_stock_bajo es codigo muerto.");
        N.push("");
        N.push("HALLAZGO CRITICO 2: CONFIGURAR ES UN Bucle SIN TRANSACCION. UN LOTE ES PARCIAL.");
        N.push("");
        N.push("  for (const item of items) {");
        N.push("    ... validaciones ...");
        N.push("    const idSucursal = await this.sucursalAplicar(usuario, item.id_sucursal);");
        N.push("    const fila = SELECT id_stock, stock_minimo_alert, cantidad_disponible FROM inventario_stock");
        N.push("    if (!fila) throw new NotFoundException('No se encontro inventario para el producto en esa sucursal.');");
        N.push("    await this.dataSource.query(UPDATE inventario_stock SET stock_minimo_alert = $1 ...);");
        N.push("    await this.bitacoraService.registrar(...);");
        N.push("    actualizados += 1;");
        N.push("  }");
        N.push("");
        N.push("No hay dataSource.transaction en ningun punto. Si un lote de 10 productos falla en el");
        N.push("quinto, los cuatro primeros UPDATE ya estan confirmados y su bitacora escrita, y el");
        N.push("cliente recibe un error sin saber cuantos quedaron aplicados. El campo actualizados solo");
        N.push("se devuelve cuando TODO va bien, o sea que nunca informa de un lote parcial. El caso");
        N.push("presenta el paso 5 como un POST con arreglo y el 9 con actualizados, sin advertir que");
        N.push("es atómico cuando no lo es. Es el mismo fallo de atomicidad de CU21, pero aqui es mas");
        N.push("grave porque el lote es de configuracion y el usuario no puede reintentar a ciegas.");
        N.push("");
        N.push("Y empeora en el caso de E3: si el encargado manda dos items y el segundo es de otra");
        N.push("sucursal, el primero ya quedo escrito con el umbral cambiado.");
        N.push("");
        N.push("HALLAZGO CRITICO 3: E1 DA 400, NO 422. LA MISMA REGLA ESTA VALIDADA DOS VECES.");
        N.push("");
        N.push("El caso dice 422 El stock minimo no puede ser negativo. Y el texto es exactamente ese,");
        N.push("pero el status que sale por HTTP es otro:");
        N.push("");
        N.push("  Capa DTO, en CTR_Alertas.ts:");
        N.push("    @Min(0, { message: 'El stock minimo no puede ser negativo.' })   -> 400 del validation pipe");
        N.push("");
        N.push("  Capa servicio, en SRV_AlertasService.configurar:");
        N.push("    if (!Number.isInteger(stockMinimo) || stockMinimo < 0)");
        N.push("      throw new UnprocessableEntityException('El stock minimo no puede ser negativo.');  -> 422");
        N.push("");
        N.push("Como el validation pipe corre antes de llegar al servicio, por HTTP siempre gana el 400.");
        N.push("El 422 del servicio solo se alcanzaria llamando al servicio directamente. Mismo texto,");
        N.push("dos codigos, y el caso documenta el que no ocurre. Con E5 pasa igual: el @IsArray del");
        N.push("ConfigurarAlertasRequest y el Array.isArray del servicio comparten el mensaje");
        N.push("'Debe enviar al menos un producto para configurar el stock minimo.' y el primero es 400.");
        N.push("");
        N.push("HALLAZGO 4: EL SERVICIO TRUNCA EL UMBRAL EN VEZ DE RECHAZARLO.");
        N.push("");
        N.push("  const stockMinimo = Math.trunc(Number(item.stock_minimo));");
        N.push("");
        N.push("Un 5.9 se convierte en 5 sin avisar. Por HTTP el @IsInt del DTO lo rechaza antes con");
        N.push("400, pero si alguien llama al servicio directamente, o si el DTO se relaja, el umbral se");
        N.push("guarda truncado y el usuario cree que puso 6. Y ojo con la combinacion: Math.trunc");
        N.push("devuelve NaN si el valor no es numerico, y Number.isInteger(NaN) es false, asi que un");
        N.push("stock_minimo = 'abc' cae en el 422 de negativo aunque el problema no sea el signo.");
        N.push("");
        N.push("HALLAZGO 5: PONER EL UMBRAL A 0 ES LA FORMA DE BORRARLA, Y NO HAY DELETE.");
        N.push("");
        N.push("El @Min(0) permite el 0, y listar exige stock_minimo_alert > 0. O sea que guardar un");
        N.push("umbral de 0 DESACTIVA la alerta de esa prenda sin borrarla y sin dejar rastro de que");
        N.push("estaba configurada. No hay ningun endpoint DELETE, y la bitacora registrara un UPDATE");
        N.push("a 0, que es la unica forma de saber que la alerta existio. El caso no lo menciona.");
        N.push("");
        N.push("HALLAZGO 6: UNA PRENDA DESACTIVADA DEJA DE GENERAR ALERTA.");
        N.push("");
        N.push("  JOIN productos p ON p.id_producto = ptc.id_producto AND LOWER(p.estado) = 'activo'");
        N.push("");
        N.push("Es un JOIN interior con filtro de estado. Si alguien pone un producto en Inactivo, sus");
        N.push("inventarios con stock bajo desaparecen del panel y del contador del menu, aunque la");
        N.push("mercaderia siga en el almacen y el umbral siga configurado. Es un INNER JOIN con");
        N.push("efecto de filtro de negocio, no un LEFT JOIN, y el caso no lo dice. Con el trigger de");
        N.push("stock bajo (CU26) puede pasar lo mismo.");
        N.push("");
        N.push("HALLAZGO 7: sucursalAplicar ES UNA TERCERA COPIA DEL ALCANCE POR SUCURSAL.");
        N.push("");
        N.push("Ya habia dos, y las tres son distintas entre si:");
        N.push("  SRV_KardexService.validarElegida      devuelve el id, lanza 422 si el admin no elige");
        N.push("  SRV_ReservasService.alcanceSucursal   devuelve { esAdmin, sucursalId }, no lanza");
        N.push("  SRV_AlertasService.sucursalAplicar     devuelve el id, lanza 422 con otro texto");
        N.push("");
        N.push("Los mensajes de la tercera variante:");
        N.push("  422 Debe especificar la sucursal.               admin sin id_sucursal");
        N.push("  404 Sucursal no encontrada.                       la sucursal no existe");
        N.push("  403 Tu usuario no esta asociado a una sucursal.   el encargado no tiene fila");
        N.push("  403 No tienes permisos para gestionar alertas de esta sucursal.  el encargo es de otra");
        N.push("");
        N.push("Los dos ultimos mensajes SI coinciden con el caso, y son los unicos casos de todo el");
        N.push("lote en que el texto del caso de uso es exacto. Pero el 422 de la sucursal ausente y el");
        N.push("404 no estan en la lista de excepciones de CU25.");
        N.push("");
        N.push("Y hay una incoherencia entre listar y configurar: listar treats al admin sin filtro");
        N.push("como 'todas las sucursales' y devuelve sucursal: null, pero configurar le EXIGE una");
        N.push("sucursal y lanza 422 si no la mandas. El caso lo describe bien, solo que noialize que son");
        N.push("comportamientos distintos dentro del mismo servicio.");
        N.push("");
        N.push("HALLAZGO 8: E5 TIENE TEXTO COMPLETO EN EL CODIGO, EL CASO LO CORTA.");
        N.push("");
        N.push("  Debe enviar al menos un producto para configurar el stock minimo.");
        N.push("");
        N.push("El caso lo abrevia con puntos suspensivos. El texto real es ese, y aparece dos veces,");
        N.push("en el @IsArray del request y en el Array.isArray del servicio.");
        N.push("");
        N.push("HALLAZGO 9: EL FRONTEND VUELVE A FILTRAR LO QUE EL BACKEND YA FILTRO.");
        N.push("");
        N.push("  const conAlertas = (alertas?.items ?? []).filter((a) => a.cantidad_disponible <= a.stock_minimo_alert);");
        N.push("");
        N.push("La query del servicio ya trae WHERE stock_minimo_alert > 0 AND cantidad_disponible <=");
        N.push("stock_minimo_alert. El filtro del cliente es identico y redundante. No rompe nada, pero");
        N.push("significa que la regla de alerta esta escrita en tres sitios: la query, el filtro del");
        N.push("componente y la condicion del modal. Si se cambia en uno y no en los otros, se desincroniza.");
        N.push("");
        N.push("HALLAZGO 10: E1 NO ES ALCANZABLE DESDE EL NAVEGADOR.");
        N.push("");
        N.push("  onChange={(e) => actualizarFila(fila.key, 'stock_minimo', e.target.value.replace(/\\D/g, ''))}");
        N.push("");
        N.push("El input descarta todo lo que no sea digito con la expresion regular \\D, asi que es");
        N.push("imposible escribir un guion. Sumado al @Min(0) del DTO y al 422 del servicio, el camino");
        N.push("completo de la validacion de E1 no tiene ninguna arista que se pueda disparar desde la");
        N.push("interfaz. Solo se puede provocar con curl o con un cliente de API. El caso lo presenta");
        N.push("como una excepcion del camino de usuario, y no lo es.");
        N.push("");
        N.push("HALLAZGO 11: EL CONTADOR DEL MENU ES UNA TERCERA CONSULTA.");
        N.push("");
        N.push("AdminLayout llama listarAlertas() para el badge de la campana, y AdminAlertas tambien");
        N.push("llama listarAlertas() para su panel. Son dos peticiones idénticas en cada carga de");
        N.push("cualquier pagina del panel de administracion, porque el layout esta siempre montado. Y");
        N.push("la consulta no es trivial: cinco JOIN y dos condiciones. El caso lo da por hecho, pero");
        N.push("es el endpoint mas caro del modulo inventario y se ejecuta en cada navegacion.");
        N.push("");
        N.push("Ademas obtenerOpcionesAlertas() devuelve el tipo OpcionesKardex, reutilizado tal cual. O");
        N.push("sea que las opciones de alertas y las de kardex son el mismo payload con distinto");
        N.push("endpoint, y el usuario ve la misma lista de sucursales y de productos dos veces, en dos");
        N.push("paginas distintas, con dos peticiones al servidor.");
        N.push("");
        N.push("HALLAZGO 12: LA ARITMETICA DEL TEXTO DEL CASO NO CUADRA CON EL CODIGO.");
        N.push("");
        N.push("El caso escribe el ejemplo '5 unidades restantes - faltan 5 para el minimo (5)'.");
        N.push("El codigo hace:");
        N.push("  const faltantes = a.stock_minimo_alert - a.cantidad_disponible;");
        N.push("");
        N.push("Con 5 disponibles y minimo 5, faltantes = 0, no 5. Para que salieran 'faltan 5' con");
        N.push("minimo 5 habria que tener 0 disponibles. El texto del caso se contradice solo. El que");
        N.push("muestra el codigo esta bien, solo que falta el 0 en el ejemplo del caso. Ademas el caso");
        N.push("no menciona el badge con la razon disponible/minimo, que el panel si pinta.");
        N.push("");
        N.push("HALLAZGO 13: BITACORA CON old_data Y new_data DE TRES CAMPOS, ANCLADA AL id_stock.");
        N.push("");
        N.push("  { id_ptc, id_sucursal, stock_minimo_alert: anterior }");
        N.push("  { id_ptc, id_sucursal, stock_minimo_alert: nuevo }");
        N.push("  id_registro = fila.id_stock");
        N.push("  detalle = 'Stock minimo configurado para el producto #N (sucursal M): A - B'");
        N.push("");
        N.push("El caso solo dice old/new data sin detalle. Y el id_registro es el id_stock, que es lo");
        N.push("correcto: la bitacora apunta a la fila que se modifico, no al id_ptc, que se repite");
        N.push("en varias sucursales. Es mejor que lo que proponia CU22 para las alertas de inventario.");
        N.push("");
        N.push("Un detalle menor: el detalle lleva una flecha unicode (A -> B) en el texto. No es un");
        N.push("problema, pero es el unico punto del proyecto donde el detalle de la bitacora lleva un");
        N.push("caracter no ascii, y se vera raro en un reporte exportado.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - El caso acierta al decir que el permiso es gestionar_inventario y que no existe");
        N.push("    gestionar_alertas. exigirPermiso comprueba '*' o gestionar_inventario. El nombre del");
        N.push("    mensaje, en cambio, si dice alertas: 'No tienes permiso para gestionar alertas de");
        N.push("    inventario.' El permiso y el mensaje no comparten nombre, cosa que ya pasa en Kardex");
        N.push("    y Existencias con consultar_kardex.");
        N.push("  - SucursalAplicar se llama DENTRO del bucle de configurar, asi que un lote de 10 items");
        N.push("    hace 10 veces esAdministrador, que a su vez hace 10 SELECT de permisos_json. Con eso");
        N.push("    y el exigirPermiso inicial son 11 consultas identicas de permisos en una sola peticion.");
        N.push("    El alcance del usuario no cambia entre items, se podria resolver una vez antes del bucle.");
        N.push("  - listar devuelve total: filas.length, sin consulta COUNT. Como no hay paginacion en");
        N.push("    este caso, es coherente, pero el tipo RespuestaAlertas no tiene pagina ni limite.");
        N.push("  - No hay paginacion en el panel, a diferencia de Kardex y Ordenes de Compra. Con una");
        N.push("    tienda de muchas prendas y varias sucursales la lista puede ser muy larga.");
        N.push("  - El ORDER BY del listado es por sucursal, producto, t.orden y color, que es el mismo");
        N.push("    criterio que las opciones de Kardex. Coherente, pero hace un JOIN extra con tallas y");
        N.push("    colores solo para ordenar por t.orden.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU25 - CONFIGURAR ALERTAS DE STOCK MINIMO - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de 108");
    T.push("Operaciones reales: " + totalOpe + " de 35");
    T.push("CONECTORES DIBUJADOS: " + conEnDiagrama + " de 57");
    if (conEnDiagrama < 44) T.push("  FALTAN LINEAS. Reejecuta el script: es idempotente y las coloca.");
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
    msg = msg + "CU25 - Configurar alertas de stock minimo" + SALTO + SALTO;
    msg = msg + "Clases: 29    Actores: 2    Relaciones: 57" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 108" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 35" + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de 57" + SALTO;
    if (conEnDiagrama < 44) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "AVISO 1: dos columnas de umbral, la app escribe una y la" + SALTO;
    msg = msg + "         funcion de la base lee la otra." + SALTO;
    msg = msg + "AVISO 2: configurar es un bucle SIN transaccion; el lote es parcial." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU25 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU25 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU25", 0); } catch (e3) { }
}
