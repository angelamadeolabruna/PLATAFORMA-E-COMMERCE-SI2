// ================================================================
// CU22 - REGISTRAR RECEPCION FISICA DE PRENDAS (INGRESO A INVENTARIO)
// DIAGRAMA DE ANALISIS DE CLASES
//
// ESTE CASO NO ESTA IMPLEMENTADO. Verificado en el codigo real:
//   api/src/modulos/compras/CTR_Compras.ts        6 endpoints, NINGUNO de recepcion
//   api/src/modulos/compras/SRV_ComprasService.ts 15 metodos, NINGUNO de recepcion
//   api/src/modulos/inventario/                   Ajustes, Alertas, Existencias, Kardex
//                                                NO hay modulo ni pantalla de recepciones
//   web/src/                                      no existe AdminRecepciones ni ruta
//   schema.sql:302  inventario_stock             id_ptc, no id_producto
//   schema.sql:313  recepciones                  existe, NADIE escribe
//   schema.sql:322  recepcion_items              existe, NADIE escribe
//   schema.sql:421  movimientos_inventario        es el kardex real; no hay tabla kardex
//   SRV_KardexService.ts:96-117                  el unico RBAC por sucursal real
//   SRV_AjustesService.ts:216,244                el patron real de tocar inventario_stock
//   SRV_ComprasService.ts:404 y 504              el codigo ya espera el estado 'Recibida'
//   SRV_ProveedoresService.ts:350-395            el scoring de CU20 ya LEE las recepciones
//
// Las clases marcadas NO EXISTE son las que CU22 pide crear. Las marcadas
// EXISTE estan en el codigo y se incluyen para mostrar con quien conversa
// el caso: el que ya consume los datos, el que escribe el kardex, el que
// aplica el patron de inventario y el que resuelve el alcance por sucursal.
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
    ["IU_AdminRecepciones", "NO EXISTE. screens/AdminRecepciones.tsx", "propuesto por CU22 sobre el panel admin",
     [["ordenes", "Array", VIS_PUB], ["sucursal", "Integer", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB], ["modalAbierto", "Boolean", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["errorModal", "String", VIS_PUB], ["toast", "Object", VIS_PUB], ["permisoOk", "Boolean", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["abrirRecepcion", "void", ["orden"], VIS_PUB], ["confirmar", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_DialogoRecepcion", "NO EXISTE. componente DialogoRecepcion", "propuesto por CU22, sustituye al MatDialog del caso",
     [["orden", "OrdenCompraItem", VIS_PUB], ["lineas", "Array", VIS_PUB], ["idSucursal", "Integer", VIS_PUB], ["merma", "String", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["error", "String", VIS_PUB]],
     [["cambiarCantidad", "void", ["id_ptc", "valor"], VIS_PUB], ["calcularDiferencia", "Integer", [], VIS_PUB], ["esValido", "Boolean", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "EXISTE. lib/api.ts", "ya tiene listarKardex y listarExistencias; faltan las de recepcion",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["listarRecepcionesPendientes", "Array", [], VIS_PUB], ["registrarRecepcion", "Object", ["id", "payload"], VIS_PUB], ["listarKardex", "Array", ["filtros"], VIS_PUB], ["listarExistencias", "Array", ["filtros"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_ComprasAdminController", "EXISTE. CTR_Compras.ts", "le faltan el endpoint :id/recepcion y el DTO de items",
     [["comprasService", "ComprasService", VIS_PRI]],
     [["listar", "Array", ["currentUser"], VIS_PUB], ["opciones", "Object", ["currentUser"], VIS_PUB], ["obtener", "Object", ["id", "currentUser"], VIS_PUB], ["crear", "Object", ["body", "request", "currentUser"], VIS_PUB], ["actualizar", "Object", ["id", "body", "request", "currentUser"], VIS_PUB], ["anular", "Object", ["id", "request", "currentUser"], VIS_PUB]]],

    ["CTR_KardexController", "EXISTE. inventario/CTR_Kardex.ts", "lee el kardex; no puede escribir en el",
     [["kardexService", "KardexService", VIS_PRI]],
     [["opciones", "Object", ["currentUser"], VIS_PUB], ["consultar", "Array", ["filtros", "currentUser"], VIS_PUB]]],

    ["CTR_ExistenciasController", "EXISTE. inventario/CTR_Existencias.ts", "solo lectura de inventario_stock",
     [["existenciasService", "ExistenciasService", VIS_PRI]],
     [["opciones", "Object", ["currentUser"], VIS_PUB], ["consultar", "Array", ["filtros", "currentUser"], VIS_PUB]]],

    ["SRV_ComprasService", "EXISTE. compras/SRV_ComprasService.ts", "le falta el metodo recepcionar que pide CU22",
     [["logger", "Logger", VIS_PRI], ["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["redondearDos", "Number", ["valor"], VIS_PRI], ["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermiso", "void", ["usuario"], VIS_PRI], ["bitacora", "void", ["accion", "tabla", "detalle", "usuario", "request", "idRegistro", "oldData", "newData"], VIS_PRI], ["formatearFechaHora", "String", ["valor"], VIS_PRI], ["formatearFecha", "String", ["valor"], VIS_PRI], ["listarOrdenesCompra", "Array", ["usuario"], VIS_PUB], ["obtenerOrdenCompra", "Object", ["usuario", "id"], VIS_PUB], ["obtenerOpciones", "Object", ["usuario"], VIS_PUB], ["validarDetalle", "void", ["detalle"], VIS_PRI], ["validarEncabezado", "Object", ["dto"], VIS_PRI], ["crearOrdenCompra", "Object", ["usuario", "dto", "request"], VIS_PUB], ["actualizarOrdenCompra", "Object", ["usuario", "id", "dto", "request"], VIS_PUB], ["anularOrdenCompra", "Object", ["usuario", "id", "request"], VIS_PUB]]],

    ["SRV_ProveedoresService", "EXISTE. proveedores/SRV_ProveedoresService.ts", "CU20 ya lee recepciones y recepcion_items; hoy siempre da 400",
     [["logger", "Logger", VIS_PRI], ["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["exigirPermisoEvaluar", "void", ["usuario"], VIS_PRI], ["bitacora", "void", ["accion", "tabla", "detalle", "usuario", "request", "idRegistro", "oldData", "newData"], VIS_PRI], ["recalcularScore", "Object", ["usuario", "id", "request"], VIS_PUB], ["calcularScore", "Number", ["idProveedor"], VIS_PUB]]],

    ["SRV_KardexService", "EXISTE. inventario/SRV_KardexService.ts", "traduce tipo_movimiento a etiquetas; incluye ENTRADA-COMPRA que nadie escribe",
     [["dataSource", "DataSource", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["formatearFechaHora", "String", ["valor"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermiso", "void", ["usuario"], VIS_PRI], ["sucursalEncargado", "Integer", ["usuario"], VIS_PRI], ["esAdministrador", "Boolean", ["usuario"], VIS_PRI], ["validarElegida", "Integer", ["usuario", "idSucursal"], VIS_PRI], ["obtenerOpciones", "Object", ["usuario"], VIS_PUB], ["consultar", "Array", ["filtros", "usuario"], VIS_PUB]]],

    ["SRV_ExistenciasService", "EXISTE. inventario/SRV_ExistenciasService.ts", "los mismos 6 metodos que Kardex, sin bitacora",
     [["dataSource", "DataSource", VIS_PRI]],
     [["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermiso", "void", ["usuario"], VIS_PRI], ["unaFila", "Object", ["resultado"], VIS_PRI], ["obtenerOpciones", "Object", ["usuario"], VIS_PUB], ["consultar", "Array", ["filtros", "usuario"], VIS_PUB]]],

    ["SRV_AjustesService", "EXISTE. inventario/SRV_AjustesService.ts", "el unico que modifica inventario_stock; es el patron a copiar",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["formatearFechaHora", "String", ["valor"], VIS_PRI], ["listar", "Array", ["filtros", "usuario"], VIS_PUB], ["registrar", "Object", ["dto", "request", "usuario"], VIS_PUB]]],

    ["SRV_ReservasService", "EXISTE. reservas/SRV_ReservasService.ts", "contiene alcanceSucursal, el otro patron de alcance por sucursal",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI], ["emailService", "EmailService", VIS_PRI]],
     [["alcanceSucursal", "Object", ["usuario"], VIS_PRI], ["unaFila", "Object", ["resultado"], VIS_PRI]]],

    ["SRV_JwtAuthGuard", "EXISTE. seguridad/dependencias.ts", "canActivate propio, no es el de Passport",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_BitacoraService", "EXISTE. seguridad/SRV_BitacoraService.ts", "el caso lo necesita porque es una escritura de inventario",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "la recepcion necesita transaccion y hay que auditar fuera de ella",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "Object", ["callback"], VIS_PUB], ["getRepository", "Repository", ["entidad"], VIS_PUB]]],

    ["CE_Recepcion", "EXISTE. tabla recepciones (schema.sql:313)", "la tabla esta creada y vacia: nadie inserta",
     [["id_recepcion", "Integer = PK", VIS_PRI], ["id_orden_compra", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["fecha_recepcion", "Timestamp = NOW()", VIS_PUB], ["estado", "String = Registrada", VIS_PUB]],
     []],

    ["CE_RecepcionItem", "EXISTE. tabla recepcion_items (schema.sql:322)", "tiene diferencia; NO tiene cantidad_neta_ok",
     [["id_recepcion_item", "Integer = PK", VIS_PRI], ["id_recepcion", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad_pedida", "Integer", VIS_PUB], ["cantidad_recibida", "Integer", VIS_PUB], ["diferencia", "Integer", VIS_PUB]],
     []],

    ["CE_InventarioStock", "EXISTE. tabla inventario_stock (schema.sql:302)", "la clave es id_ptc, no id_producto como dice el caso",
     [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_reservada", "Integer = 0", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB], ["stock_minimo_alert", "Integer = 0", VIS_PUB]],
     []],

    ["CE_MovimientoInventario", "EXISTE. tabla movimientos_inventario (schema.sql:421)", "ESTA es la tabla kardex; no hay tabla kardex",
     [["id_movimiento", "Integer = PK", VIS_PRI], ["id_ptc", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["tipo_movimiento", "String = 30", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["stock_anterior", "Integer", VIS_PUB], ["stock_posterior", "Integer", VIS_PUB], ["referencia", "String = 120", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_orden_compra", "Integer", VIS_PUB], ["id_venta", "Integer", VIS_PUB], ["id_reserva", "Integer", VIS_PUB], ["fecha", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_OrdenCompra", "EXISTE. tabla ordenes_compra (schema.sql:277)", "el codigo ya escribe y lee el estado Recibida en ella",
     [["id_orden_compra", "Integer = PK", VIS_PRI], ["id_proveedor", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["numero", "String = 20", VIS_PUB], ["fecha_orden", "Timestamp", VIS_PUB], ["fecha_estimada_entrega", "Date", VIS_PUB], ["fecha_recepcion", "Timestamp", VIS_PUB], ["estado", "String = Recibida", VIS_PUB], ["total", "Decimal(12,2)", VIS_PUB]],
     []],

    ["CE_Sucursal", "EXISTE. tabla sucursales", "destino de la recepcion",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. tabla usuarios", "el que recibe y el que queda en la bitacora",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120", VIS_PRI], ["estado", "String", VIS_PUB]],
     []],

    ["CE_UsuarioEmpleado", "EXISTE. tabla usuarios_empleados (schema.sql:76)", "de aqui sale la sucursal del encargado, con fecha_baja IS NULL",
     [["id_empleado", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE", VIS_PUB], ["sucursal_id", "Integer", VIS_PUB], ["nombre", "String = 120", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["rol", "String = 60", VIS_PUB], ["fecha_baja", "Timestamp", VIS_PUB], ["motivo_baja", "String = 255", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. tabla producto_talla_color", "la unidad de inventario es el ptc, no el producto",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB]],
     []],

    ["CE_BitacoraAuditoria", "EXISTE. tabla bitacora_auditoria", "el caso graba un UPDATE sobre inventario_stock",
     [["id_bitacora", "Integer = PK", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["accion_sql", "String", VIS_PUB], ["tabla_afectada", "String", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "String", VIS_PUB], ["user_agent", "String", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_Rol", "EXISTE. tabla roles", "de donde sale el permiso gestionar_inventario",
     [["id_rol", "Integer = PK", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "EXISTE. tabla usuarios_roles", "une usuario con rol",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []]
];

var ACTORES = [
    ["ACTOR_Encargado", "Encargado de Sucursal", "gestionar_inventario"],
    ["ACTOR_Administrador", "Administrador General", "* o gestionar_inventario"]
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
    var paq = subPaquete(mod, "CU22 - Análisis de clases");

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
    var conEnDiagrama = 0;
    var nuevas = 0;
    var existentes = 0;

    for (var n2 = 0; n2 < DEF.length; n2++) {
        var d2 = DEF[n2];
        try { paq.Elements.Refresh(); } catch (e) { }
        var el = buscarLocal(paq, d2[0]);
        if (el == null) { ERRORES.push("clase " + d2[0] + " no encontrada"); continue; }
        if (String(d2[1]).indexOf("EXISTE") == 0) existentes = existentes + 1;
        if (String(d2[1]).indexOf("NO EXISTE") == 0) nuevas = nuevas + 1;
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
    try { diag = paq.Diagrams.AddNew("CU22 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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
        conEnDiagrama += relacion(diag, C[0], C[1], "wizard de recepción", "Association", "", "pantalla", "wizard", "0..1", "1");
        conEnDiagrama += relacion(diag, C[0], C[2], "cliente HTTP", "Dependency", "uses", "pantalla", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C[0], C[18], "órdenes pendientes", "Association", "", "pantalla", "listado", "0..*", "1");
        conEnDiagrama += relacion(diag, C[1], C[18], "orden a recepcionar", "Association", "", "wizard", "orden", "1", "1");
        conEnDiagrama += relacion(diag, C[1], C[22], "líneas a recibir", "Association", "", "wizard", "ptc", "1", "0..*");
        conEnDiagrama += relacion(diag, C[1], C[19], "sucursal de destino", "Association", "", "wizard", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[2], C[3], "punto de acceso HTTP", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, C[2], C[4], "kardex", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, C[2], C[5], "existencias", "Dependency", "uses", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, C[3], C[11], "guard de autenticación", "Dependency", "uses", "controlador", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[3], C[6], "servicio de compras", "Association", "", "controlador", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C[4], C[8], "servicio de kardex", "Association", "", "controlador", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C[5], C[9], "servicio de existencias", "Association", "", "controlador", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[11], "usuario autenticado", "Association", "", "compras", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[12], "auditoría de la operación", "Association", "", "compras", "auditor", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[14], "persistencia", "Dependency", "uses", "servicio", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[6], C[18], "orden recibida", "Composition", "composition", "compras", "orden", "1", "0..*");
        conEnDiagrama += relacion(diag, C[6], C[19], "sucursal de la recepción", "Dependency", "uses", "compras", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[6], C[17], "patrón de inventario", "Dependency", "uses", "compras", "ajustes", "1", "0..1");
        conEnDiagrama += relacion(diag, C[6], C[21], "alcance por sucursal", "Dependency", "uses", "compras", "reservas", "1", "0..1");
        conEnDiagrama += relacion(diag, C[6], C[15], "cabecera de la recepción", "Composition", "composition", "compras", "recepción", "1", "0..*");
        conEnDiagrama += relacion(diag, C[6], C[16], "líneas de la recepción", "Composition", "composition", "compras", "ítem", "1", "0..*");
        conEnDiagrama += relacion(diag, C[7], C[15], "recepciones leídas", "Dependency", "uses", "scoring", "recepción", "0..*", "1");
        conEnDiagrama += relacion(diag, C[7], C[16], "ítems leídos", "Dependency", "uses", "scoring", "ítem", "0..*", "1");
        conEnDiagrama += relacion(diag, C[7], C[18], "órdenes recibidas", "Dependency", "uses", "scoring", "orden", "0..*", "1");
        conEnDiagrama += relacion(diag, C[7], C[23], "merma de movimientos", "Dependency", "uses", "scoring", "movimiento", "0..*", "1");
        conEnDiagrama += relacion(diag, C[8], C[23], "movimientos leídos", "Association", "", "kardex", "movimiento", "0..*", "1");
        conEnDiagrama += relacion(diag, C[8], C[21], "sucursal del encargado", "Dependency", "uses", "kardex", "empleado", "0..*", "1");
        conEnDiagrama += relacion(diag, C[9], C[16], "existencias por ptc", "Association", "", "existencias", "stock", "0..*", "1");
        conEnDiagrama += relacion(diag, C[9], C[21], "sucursal del encargado", "Dependency", "uses", "existencias", "empleado", "0..*", "1");
        conEnDiagrama += relacion(diag, C[10], C[16], "stock ajustado", "Composition", "composition", "ajustes", "stock", "1", "0..1");
        conEnDiagrama += relacion(diag, C[10], C[23], "movimiento de ajuste", "Composition", "composition", "ajustes", "movimiento", "1", "0..*");
        conEnDiagrama += relacion(diag, C[10], C[12], "auditoría del ajuste", "Association", "", "ajustes", "auditor", "1", "1");
        conEnDiagrama += relacion(diag, C[11], C[20], "usuario autenticado", "Association", "", "guard", "usuario", "1", "0..1");
        conEnDiagrama += relacion(diag, C[12], C[24], "registro de auditoría", "Composition", "composition", "auditor", "bitácora", "1", "1");
        conEnDiagrama += relacion(diag, C[12], C[14], "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C[24], C[20], "usuario de la acción", "Association", "", "bitácora", "usuario", "0..*", "1");
        conEnDiagrama += relacion(diag, C[15], C[18], "orden recepcionada", "Association", "", "recepción", "orden", "1", "0..1");
        conEnDiagrama += relacion(diag, C[15], C[19], "sucursal receptora", "Association", "", "recepción", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[15], C[20], "usuario que recibe", "Association", "", "recepción", "usuario", "1", "0..1");
        conEnDiagrama += relacion(diag, C[16], C[15], "recepción de la línea", "Composition", "composition", "ítem", "recepción", "1", "1");
        conEnDiagrama += relacion(diag, C[16], C[22], "producto de la línea", "Association", "", "ítem", "ptc", "1", "0..1");
        conEnDiagrama += relacion(diag, C[16], C[18], "orden del ítem", "Dependency", "uses", "ítem", "orden", "1", "0..1");
        conEnDiagrama += relacion(diag, C[17], C[22], "stock por ptc", "Association", "", "stock", "ptc", "1", "1");
        conEnDiagrama += relacion(diag, C[17], C[19], "stock por sucursal", "Association", "", "stock", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[18], C[19], "sucursal de la orden", "Association", "", "orden", "sucursal", "1", "0..1");
        conEnDiagrama += relacion(diag, C[23], C[22], "producto del movimiento", "Association", "", "movimiento", "ptc", "1", "0..1");
        conEnDiagrama += relacion(diag, C[23], C[18], "orden del movimiento", "Dependency", "uses", "movimiento", "orden", "0..1", "0..1");
        conEnDiagrama += relacion(diag, C[23], C[20], "usuario del movimiento", "Association", "", "movimiento", "usuario", "0..1", "0..1");
        conEnDiagrama += relacion(diag, C[21], C[19], "sucursal del empleado", "Association", "", "empleado", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C[21], C[20], "usuario del empleado", "Association", "", "empleado", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C[20], C[25], "rol del usuario", "Association", "", "usuario", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C[20], C[26], "asignación de rol", "Association", "", "usuario", "asignación", "1", "0..*");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("HALLAZGO PRINCIPAL: ESTE CASO NO ESTA IMPLEMENTADO EN NINGUNA PARTE.");
        N.push("");
        N.push("Verificado pieza por pieza:");
        N.push("  - No existe el endpoint POST /api/v1/admin/ordenes-compra/:id/recepcion. El");
        N.push("    ComprasAdminController tiene 6 handlers: listar, opciones, obtener, crear,");
        N.push("    actualizar y anular. Ninguno es una recepcion.");
        N.push("  - No existe el metodo de servicio. SRV_ComprasService tiene 15 metodos y ninguno");
        N.push("    recepciona. La palabra recepcion solo aparece ahi como nombre de columna.");
        N.push("  - No hay modulo de recepciones. El modulo inventario tiene Ajustes, Alertas,");
        N.push("    Existencias y Kardex.");
        N.push("  - No hay pantalla. En web/src no existe ningún archivo con Recep en el nombre y");
        N.push("    router.tsx no registra ninguna ruta de recepciones.");
        N.push("  - No existe el endpoint GET /api/v1/inventario/recepciones-pendientes.");
        N.push("  - Las tablas recepciones y recepcion_items SI existen en schema.sql, pero NADIE");
        N.push("    escribe en ellas. La unica lectura esta en el scoring de CU20.");
        N.push("");
        N.push("Es decir: hay todo el modelo de datos y hay un consumidor esperando los datos, pero");
        N.push("falta por completo el Camino Feliz. Este diagrama marca en cada clase si existe o no.");
        N.push("");
        N.push("1. EL ESTADO ES 'Recibida', NO 'Recibido'. Y EL CASO LO ESCRIBE MAL.");
        N.push("");
        N.push("El caso dice UPDATE ordenes_compra SET estado = 'Recibido'. El codigo real usa el");
        N.push("femenino en los tres sitios que tocan ese estado:");
        N.push("  - SRV_ComprasService:504  estado.toLowerCase() === 'recibida'");
        N.push("  - AdminOrdenesCompra.tsx:30  if (clave === 'recibida') -> badge success");
        N.push("  - SRV_ProveedoresService:360  WHERE LOWER(oc.estado) = 'recibida'");
        N.push("");
        N.push("Si se implementara el caso tal cual, con 'Recibido', el scoring de CU20 no");
        N.push("encontraria ninguna orden y responderia 400 No hay datos de entregas para calcular el");
        N.push("score. porque filtra por 'recibida'. El orden de compra tampoco podria anularse,");
        N.push("porque el 409 de CU21 comprueba 'recibida' con el mismo literal.");
        N.push("");
        N.push("2. LA TABLA kardex NO EXISTE. EL KARDEX ES movimientos_inventario.");
        N.push("");
        N.push("El caso dice INSERT INTO kardex (id_producto, id_sucursal, fecha, tipo_movimiento,");
        N.push("cantidad, saldo, referencia_id). No hay ninguna tabla kardex en schema.sql. El kardex");
        N.push("real es una lectura de movimientos_inventario, en SRV_KardexService, que traduce");
        N.push("tipo_movimiento a etiquetas:");
        N.push("  ENTRADA-COMPRA     -> Entrada por compra");
        N.push("  ENTRADA-DEVOLUCION -> Entrada por devolucion");
        N.push("  SALIDA-VENTA       -> Salida por venta");
        N.push("  SALIDA-RESERVA     -> Salida por reserva");
        N.push("  SALIDA-DEVOLUCION  -> Salida por devolucion");
        N.push("  MERMA              -> Merma");
        N.push("");
        N.push("ENCUENTRA IMPORTANTE: el literal ENTRADA-COMPRA existe, pero SOLO como etiqueta de");
        N.push("presentacion. No hay ni un solo INSERT con ese valor en todo el proyecto. Los");
        N.push("unicos tipo_movimiento que el codigo escribe son MERMA, en SRV_AjustesService, y");
        N.push("SALIDA-RESERVA, en SRV_ReservasService. El item de kardex que CU22 necesita es");
        N.push("precisamente el que falta.");
        N.push("");
        N.push("Y las columnas que el caso inventa para kardex no mapean: no hay saldo sino");
        N.push("stock_anterior y stock_posterior, no hay referencia_id sino referencia VARCHAR(120)");
        N.push("mas tres columnas de FK (id_orden_compra, id_venta, id_reserva), y no hay id_producto");
        N.push("sino id_ptc.");
        N.push("");
        N.push("3. LA CLAVE DE inventario_stock ES id_ptc, NO id_producto. Y stock_minimo_alert ES");
        N.push("   UN ENTERO, NO UN BOOLEANO.");
        N.push("");
        N.push("El caso dice:");
        N.push("  INSERT INTO inventario_stock (id_producto, id_sucursal, cantidad_disponible,");
        N.push("    cantidad_reservada, stock_minimo_alertado) VALUES ($1,$2,$r,0,FALSE)");
        N.push("  ON CONFLICT (id_producto, id_sucursal) DO UPDATE ...");
        N.push("");
        N.push("La tabla real (schema.sql:302):");
        N.push("  id_stock SERIAL PK, id_ptc, id_sucursal, cantidad_disponible, cantidad_reservada,");
        N.push("  cantidad_vendida, stock_minimo_alert INTEGER DEFAULT 0, UNIQUE (id_ptc, id_sucursal)");
        N.push("");
        N.push("  - no existe la columna id_producto, la clave es id_ptc");
        N.push("  - no existe stock_minimo_alertado, se llama stock_minimo_alert");
        N.push("  - es INTEGER, y el caso le pasa FALSE, que en Postgres es boolean: error de tipo");
        N.push("  - falta cantidad_vendida, que el caso no menciona y que existe");
        N.push("  - el UNIQUE es sobre (id_ptc, id_sucursal), no sobre (id_producto, id_sucursal)");
        N.push("");
        N.push("4. EL PATRON DE INVENTARIO DEL PROYECTO NO ES UPSERT. ES SELECT Y DESPUES DECIDIR.");
        N.push("");
        N.push("El caso se inventa el ON CONFLICT. En el codigo real no hay ningun ON CONFLICT para");
        N.push("inventario. SRV_AjustesService:216 y :244 hacen:");
        N.push("  SELECT cantidad_disponible FROM inventario_stock WHERE id_ptc = $1 AND id_sucursal = $2");
        N.push("  SELECT id_stock FROM inventario_stock WHERE id_ptc = $1 AND id_sucursal = $2");
        N.push("y luego actualiza o inserta segun lo que salio. Lo mismo hace SRV_AlertasService:260 y");
        N.push("SRV_CarritoService:239. SRV_AjustesService es el unico servicio que modifica stock y es");
        N.push("el patron que CU22 deberia seguir, no el ON CONFLICT del caso.");
        N.push("");
        N.push("5. cantidad_neta_ok NO EXISTE. recepcion_items TIENE diferencia.");
        N.push("");
        N.push("El body del caso manda { id_producto, cantidad_recibida, cantidad_neta_ok }. El schema");
        N.push("de recepcion_items (schema.sql:322) tiene id_recepcion_item, id_recepcion, id_ptc,");
        N.push("cantidad_pedida, cantidad_recibida y diferencia. No hay cantidad_neta_ok, y la clave");
        N.push("es id_ptc en vez de id_producto. La diferencia es exactamente el dato que el scoring");
        N.push("de CU20 ya consume, asi que la columna existe y bien mirada.");
        N.push("");
        N.push("6. EL MENSAJE DE E3 NO EXISTE. EL REAL TIENE TRES VARIANTES.");
        N.push("");
        N.push("El caso dice 403 No tiene permisos para recepcionar en esta sucursal. Ese texto no");
        N.push("aparece en el proyecto. El patron real esta en SRV_KardexService:96-117, dentro de");
        N.push("validarElegida, y son cuatro mensajes:");
        N.push("  422 Debe seleccionar una sucursal.         el admin no elige sucursal");
        N.push("  404 Sucursal no encontrada.                la sucursal no existe");
        N.push("  403 Tu usuario no esta asociado a una sucursal.   el encargado no tiene fila en empleados");
        N.push("  403 No tienes permisos para consultar esta sucursal.  el encargo es de otra sucursal");
        N.push("");
        N.push("Ojo con el ultimo: dice consultar, no recepcionar, porque el metodo es generico. Y hay un");
        N.push("segundo patron, alcanceSucursal en SRV_ReservasService:202, que devuelve");
        N.push("{ esAdmin, sucursalId } en vez de lanzar. Son dos rutinas parecidas pero distintas: una");
        N.push("devuelve el alcance, la otra exige uno. CU22 tiene que elegir una, no copiar el texto");
        N.push("del caso.");
        N.push("");
        N.push("7. LA SUCURSAL DEL ENCARGADO SALE DE usuarios_empleados, Y SOLO SI NO ESTA DADO DE BAJA.");
        N.push("");
        N.push("  SELECT ue.sucursal_id FROM usuarios_empleados ue");
        N.push("   WHERE ue.usuario_id = $1 AND ue.fecha_baja IS NULL");
        N.push("");
        N.push("Ojo con el nombre de la columna: es sucursal_id y usuario_id, no id_sucursal ni");
        N.push("id_usuario como en el resto de las tablas. Y usuarios_empleados es UNIQUE por");
        N.push("usuario_id, o sea que un usuario pertenece como mucho a una sucursal. fecha_baja y");
        N.push("motivo_baja viven en usuarios_empleados, no en usuarios, que es donde las busca el caso.");
        N.push("");
        N.push("8. EL SCORING DE CU20 YA ESTA ESCRITO Y HOY SIEMPRE FALLA.");
        N.push("");
        N.push("calcularScore, en SRV_ProveedoresService:350, lee de las tres tablas que CU22");
        N.push("propono escribir:");
        N.push("  FROM ordenes_compra oc WHERE LOWER(oc.estado) = 'recibida'");
        N.push("  FROM recepciones rc JOIN ordenes_compra oc ... JOIN recepcion_items ri ...");
        N.push("  FROM movimientos_inventario m JOIN ordenes_compra oc ...");
        N.push("       AND (LOWER(m.tipo_movimiento) LIKE '%mer%' OR LOWER(m.referencia) LIKE '%mer%')");
        N.push("");
        N.push("Como no hay ninguna fila en recepciones, el primer total da 0 y el metodo lanza 400");
        N.push("No hay datos de entregas para calcular el score. O sea que CU20 esta terminado a medias:");
        N.push("la mitad que consume esta hecha, la mitad que produce no. CU22 es justo lo que falta.");
        N.push("");
        N.push("Y hay un detalle de fragile en la consulta de merma: no busca un tipo_movimiento");
        N.push("especifico, sino cualquier cosa que contenga mer en el tipo o en la referencia. Eso");
        N.push("incluye la palabra merma dentro de un texto libre. Con los tipos que si usa el codigo");
        N.push("funciona, pero es una busqueda por subcadena sobre un VARCHAR, no un equality.");
        N.push("");
        N.push("9. LA BITACORA DEL CASO ESCRIBE UN UPDATE, PERO SERIA UN INSERT.");
        N.push("");
        N.push("El caso pone new_data: { id_producto, cantidad_disponible } con accion_sql UPDATE sobre");
        N.push("inventario_stock. Como la recepcion crea la fila si no existia, en el caso mas normal la");
        N.push("accion es un INSERT. Y si se copia el patron de SRV_AjustesService, que ademas escribe");
        N.push("el id_registro con el id_stock que devuelve la consulta previa, la bitacora quedaria");
        N.push("mucho mejor anclada. Ademas el caso graba solo un registro por item, cuando una");
        N.push("recepcion de diez lineas merece un registro de cabecera o un new_data con el resumen.");
        N.push("");
        N.push("10. DOS CLASES DE INVENTARIO CON METODOS IDENTICOS.");
        N.push("");
        N.push("SRV_KardexService y SRV_ExistenciasService tienen los mismos seis metodos, los");
        N.push("mismos nombres, el mismo cuerpo y solo se diferencian en la tabla que consultan. Sus");
        N.push("constructores son identicos (solo dataSource) y ninguno recibe BitacoraService,");
        N.push("porque los dos son de solo lectura. Lo mismo pasa con sus controladores, que se");
        N.push("diferencian solo en el tipo inyectado. Eso es duplicacion real que conviene reusar");
        N.push("en un unico SRV_InventarioLecturaService con las dos consultas, aunque no es");
        N.push("proposito de este caso.");
        N.push("");
        N.push("11. LO QUE EL CASO NO DICE Y HACE FALTA PARA QUE LA RECEPCION CUADRE.");
        N.push("");
        N.push("  - Si se recibe parte de una linea, la diferencia queda en recepcion_items pero no");
        N.push("    hay ninguna regla de negocio que diga que hacer con ella. El caso solo menciona");
        N.push("    registrar merma como ajuste, y la merma ya la registra SRV_AjustesService.");
        N.push("  - El paso (c) del caso dice por cada item UPDATE estado = Recibido. Pero el estado");
        N.push("    es de la ORDEN, no del item, asi que la actualizacion se hace una vez al final.");
        N.push("    Con el caso escrito literalmente se intentaria cambiar el estado de la orden");
        N.push("    dentro del bucle, una vez por linea.");
        N.push("  - No se dice que pase con fecha_recepcion, que es la columna que CU21 y CU20 leen.");
        N.push("    Si no se escribe, una orden queda Recibida sin fecha y el 409 de anulacion de");
        N.push("    CU21 seguiria permitiendo anularla, porque comprueba estado O fecha.");
        N.push("  - No hay transaccion en el caso, y esto escribe en cinco tablas. Con el fallo que");
        N.push("    ya tiene CU21, la bitacora quedaria otra vez fuera de la transaccion.");
        N.push("  - Si una orden se recibe en dos veces, la segunda debe restar lo ya recibido. El");
        N.push("    caso solo contempla el camino de una sola recepcion completa.");
        N.push("");
        N.push("12. LO QUE SI COINCIDE CON EL CODIGO REAL.");
        N.push("");
        N.push("  - El permiso gestionar_inventario es el que usan Kardex, Existencias y Ajustes.");
        N.push("  - La idea de que el estado inicial sea Pendiente y solo se pueda recibir asi es la");
        N.push("    de CU21, correcta.");
        N.push("  - Los mensajes de E1 y E2 encajan con el estilo del proyecto, aunque no estan");
        N.push("    escritos en ningun sitio todavia.");
        N.push("  - El uso de ON CONFLICT sobre el UNIQUE (id_ptc, id_sucursal) seria una mejora");
        N.push("    sobre el patron SELECT-y-decidir, si se corrige el nombre de la columna.");
        N.push("  - La estructura de la bitacora y el permiso con comodin * son los de todo el resto.");
        N.push("");
        N.push("COMO ESTA CONSTRUIDO ESTE DIAGRAMA:");
        N.push("");
        N.push("Las clases IU_AdminRecepciones e IU_DialogoRecepcion llevan NO EXISTE en sus notas,");
        N.push("porque CU22 las pide crear y no hay ningun archivo que las respalde. El resto lleva");
        N.push("EXISTE con su ruta real, e incluye a los servicios que el caso todavia no nombra");
        N.push("pero con los que tiene que conversacionar: el scoring de CU20 que ya lee las");
        N.push("recepciones, el Kardex que hay que escribir, Ajustes que tiene el patron de stock,");
        N.push("y Reservas y Kardex con los dos alcances por sucursal que ya existen.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU22 - REGISTRAR RECEPCION FISICA - INFORME");
    T.push("");
    T.push("CASO NO IMPLEMENTADO. Clases existentes: " + existentes + "   Clases a crear: " + nuevas);
    T.push("Atributos reales: " + totalAtr + " de 111");
    T.push("Operaciones reales: " + totalOpe + " de 69");
    T.push("CONECTORES DIBUJADOS: " + conEnDiagrama + " de 55");
    if (conEnDiagrama < 56) T.push("  FALTAN LINEAS. Reejecuta el script: es idempotente y las coloca.");
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
    msg = msg + "CU22 - Registrar recepcion fisica" + SALTO + SALTO;
    msg = msg + "CASO NO IMPLEMENTADO: no hay endpoint, ni metodo," + SALTO;
    msg = msg + "ni modulo, ni pantalla. Las tablas si existen." + SALTO + SALTO;
    msg = msg + "Clases: 27    Actores: 2    Relaciones: 55" + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de 111" + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de 69" + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de 55" + SALTO;
    if (conEnDiagrama < 56) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "AVISO 1: el estado es 'Recibida', no 'Recibido'." + SALTO;
    msg = msg + "AVISO 2: no hay tabla kardex; es movimientos_inventario." + SALTO;
    msg = msg + "AVISO 3: la clave de inventario_stock es id_ptc, no id_producto." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU22 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU22 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU22", 0); } catch (e3) { }
}
