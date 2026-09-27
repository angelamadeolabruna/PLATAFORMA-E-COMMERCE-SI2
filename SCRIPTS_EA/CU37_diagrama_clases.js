// ================================================================
// CU37 - PROCESAR PAGO EN CAJA
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   api/src/modulos/pagos/CTR_Pagos.ts:97           @Post('caja') con HttpCode 200
//   api/src/modulos/pagos/CTR_Pagos.ts:20           ProcesarPagoCajaRequest, 4 campos
//   api/src/modulos/pagos/CTR_Pagos.ts:32           proveedor solo LIBELULA y STRIPE
//   api/src/modulos/pagos/SRV_PagosService.ts:36    METODOS_PAGO sin Efectivo
//   api/src/modulos/pagos/SRV_PagosService.ts:38    PROVEEDORES_CAJA sin PAYPAL
//   api/src/modulos/pagos/SRV_PagosService.ts:39    PROVEEDORES con PAYPAL
//   api/src/modulos/pagos/SRV_PagosService.ts:208   procesarPagoCaja
//   api/src/modulos/pagos/SRV_PagosService.ts:250   solo bloquea tx Pendiente o Aprobado
//   api/src/modulos/pagos/SRV_PagosService.ts:265   rama Efectivo
//   api/src/modulos/pagos/SRV_PagosService.ts:279   FOR UPDATE sobre la venta
//   api/src/modulos/pagos/SRV_PagosService.ts:302   FOR UPDATE sobre cada stock
//   api/src/modulos/pagos/SRV_PagosService.ts:324   proveedor CAJA, estado Aprobado
//   api/src/modulos/pagos/SRV_PagosService.ts:340   solo sube cantidad_vendida
//   api/src/modulos/pagos/SRV_PagosService.ts:346   INSERT movimiento con cantidad negativa
//   api/src/modulos/pagos/SRV_PagosService.ts:399   rama Tarjeta, QR y Transferencia
//   api/src/modulos/pagos/SRV_PagosService.ts:406   INSERT sin transaccion y sin bloqueos
//   api/src/modulos/pagos/SRV_PagosService.ts:442   terminal_url apunta a SandboxPago
//   api/src/modulos/pagos/SRV_PagosService.ts:519   el unico 504, y es de CU35
//   api/src/modulos/pagos/SRV_PagosService.ts:548   procesarResultado, de CU35, quien completa
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:210  exige venta COMPLETADA
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:196  lee p.porcentaje_iva: NO existe
//   web/src/pages/admin/AdminCaja.tsx:236-276        un clic hace venta y cobro
//   web/src/pages/SandboxPago.tsx:118               llama api.simularPasarela
//   schema.sql:440  transacciones_pago, proveedor admite CAJA
//   schema.sql:628  trigger BEFORE INSERT descuenta el disponible
//   schema.sql:573  realizar_venta NO esta en ningun rol
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
var TOTAL_REL = 72;
var TOTAL_ATR = 129;
var TOTAL_OPE = 35;

var DEF = [
    ["IU_AdminCaja", "EXISTE. web/src/pages/admin/AdminCaja.tsx", "el mismo clic de CU36 termina en este cobro",
     [["items", "Array", VIS_PUB], ["metodoPago", "String", VIS_PUB], ["montoRecibido", "String", VIS_PUB], ["total", "Number", VIS_PUB], ["enviando", "Boolean", VIS_PUB], ["error", "String = null", VIS_PUB], ["ventaOk", "Object = null", VIS_PUB]],
     [["procesarVenta", "void", ["evento"], VIS_PUB], ["cambiarCantidad", "void", ["idPtc", "cantidad", "tope"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_FormularioPago", "EXISTE. AdminCaja.tsx, bloques de 560 a 700", "metodo, monto recibido, vuelto y boton unico",
     [["metodoPago", "String", VIS_PUB], ["montoRecibido", "String", VIS_PUB], ["vuelto", "Number", VIS_PUB], ["proveedorPasarela", "String", VIS_PUB], ["terminal_url", "String = opcional", VIS_PUB]],
     [["calcularVuelto", "Number", ["montoRecibido", "total"], VIS_PUB], ["abrirTerminal", "void", [], VIS_PUB], ["imprimir", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_SandboxPago", "EXISTE. web/src/pages/SandboxPago.tsx", "es el terminal_url; aprueba por la ruta de CU35",
     [["idTransaccion", "Integer", VIS_PUB], ["estado", "String = Pendiente", VIS_PUB], ["confirmando", "String = null", VIS_PUB]],
     [["confirmar", "void", ["resultado"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "EXISTE. web/src/lib/api.ts", "procesarPagoCaja y simularPasarela",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["procesarPagoCaja", "Object", ["body"], VIS_PUB], ["simularPasarela", "Object", ["body"], VIS_PUB], ["consultarEstadoTransaccion", "Object", ["idTransaccion"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["CTR_PagosController", "EXISTE. pagos/CTR_Pagos.ts", "la ruta caja con HttpCode 200 y JwtAuthGuard",
     [["pagosService", "PagosService", VIS_PRI]],
     [["procesarPagoCaja", "Object", ["currentUser", "body", "request"], VIS_PUB], ["procesarWebhook", "Object", ["body", "request"], VIS_PUB], ["simularPasarela", "Object", ["currentUser", "body", "request"], VIS_PUB]]],

    ["SRV_PagosService", "EXISTE. pagos/SRV_PagosService.ts, 784 lineas", "dos ramas con disciplinas opuestas",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI], ["comprobantesService", "ComprobantesService", VIS_PRI], ["preferenciasService", "PreferenciasService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermisoPagar", "void", ["usuario"], VIS_PRI], ["exigirPermisoCaja", "void", ["usuario"], VIS_PRI], ["sucursalDelEmpleado", "Number", ["usuario"], VIS_PRI], ["procesarPagoCaja", "Object", ["usuario", "dto", "request"], VIS_PUB], ["procesarWebhook", "Object", ["dto", "request"], VIS_PUB], ["simularPasarela", "Object", ["usuario", "dto", "request"], VIS_PUB], ["procesarResultado", "Object", ["idTransaccion", "estado", "montoNotificado", "detalle", "request"], VIS_PRI], ["consultarEstado", "Object", ["usuario", "idTransaccion"], VIS_PUB], ["registrarPreferenciasDeVenta", "void", ["idVenta", "idUsuario", "request"], VIS_PRI]]],

    ["SRV_ComprobantesService", "EXISTE. comprobantes/SRV_ComprobantesService.ts (CU38)", "generar exige venta COMPLETADA y lee porcentaje_iva",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["generar", "Comprobante", ["idVenta", "idUsuario", "request"], VIS_PUB], ["datosComprobanteDeVenta", "Object", ["idVenta"], VIS_PUB], ["numeracionCorrelativa", "String", ["idSucursal", "anio"], VIS_PUB], ["componerPdf", "Buffer", ["venta", "items", "sucursal", "cajero"], VIS_PUB]]],

    ["SRV_PreferenciasService", "EXISTE. recomendaciones/SRV_PreferenciasService.ts (CU41)", "su fallo nunca bloquea el cobro",
     [],
     [["registrarPreferenciasVenta", "void", ["idVenta"], VIS_PUB]]],

    ["SRV_BitacoraService", "EXISTE. seguridad/SRV_BitacoraService.ts", "dos llamadas en efectivo, una en pasarela, todas fuera",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "transaccion solo en la rama de efectivo",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "Object", ["callback"], VIS_PUB]]],

    ["CE_ProcesarPagoCajaRequest", "EXISTE. pagos/CTR_Pagos.ts:20", "4 campos; el monto y el proveedor son opcionales",
     [["id_venta", "Integer", VIS_PUB], ["metodo_pago", "String = Efectivo|Tarjeta|QR|Transferencia", VIS_PUB], ["monto_recibido", "Number = opcional", VIS_PUB], ["proveedor_pasarela", "String = LIBELULA|STRIPE, opcional", VIS_PUB]],
     []],

    ["CE_ProcesarPagoCajaDTO", "EXISTE. SRV_PagosService.ts:25", "el tipo interno; identico al request",
     [["id_venta", "Integer", VIS_PUB], ["metodo_pago", "String", VIS_PUB], ["monto_recibido", "Number = opcional", VIS_PUB], ["proveedor_pasarela", "String = opcional", VIS_PUB]],
     []],

    ["CE_TransaccionPago", "EXISTE. transacciones_pago (schema.sql:440)", "proveedor admite CAJA, LIBELULA, STRIPE o PAYPAL",
     [["id_transaccion", "Integer = PK", VIS_PRI], ["id_venta", "Integer", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["proveedor_pasarela", "String = 40", VIS_PUB], ["monto", "Decimal(12,2)", VIS_PUB], ["moneda", "String = 3, BOB", VIS_PUB], ["metodo", "String = 30", VIS_PUB], ["estado", "String = 20", VIS_PUB], ["referenciaExterna", "String = 120", VIS_PUB], ["id_transaccion_pasarela", "String = 120, NULL si es efectivo", VIS_PUB], ["fecha_hora", "Timestamp = NOW()", VIS_PUB], ["detalle", "Text", VIS_PUB]],
     []],

    ["CE_Venta", "EXISTE. ventas (schema.sql:384)", "el total se compara contra el monto recibido, no al reves",
     [["id_venta", "Integer = PK", VIS_PRI], ["id_cliente", "Integer = nullable", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["id_carrito", "Integer = NULL en POS", VIS_PUB], ["modalidad", "String = 20", VIS_PUB], ["metodo_pago", "String = 30", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB], ["impuestos", "Decimal(12,2)", VIS_PUB], ["total", "Decimal(12,2)", VIS_PUB], ["estado", "String = 20", VIS_PUB], ["fecha_venta", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_VentaItem", "EXISTE. venta_items (schema.sql:399)", "cantidad y precio_unitario salen de aqui para el descuento",
     [["id_venta_item", "Integer = PK", VIS_PRI], ["id_venta", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["precio_unitario", "Decimal(10,2)", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. usuarios (schema.sql:32)", "el que cobra; puede no ser quien creo la venta",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120 UNIQUE", VIS_PRI], ["estado", "String = Pendiente", VIS_PUB]],
     []],

    ["CE_Rol", "EXISTE. roles; permisos_json en schema.sql:573", "realizar_venta NO esta en ninguno de los 5 roles",
     [["id_rol", "Integer = PK", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["descripcion", "String", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "EXISTE. usuarios_roles con PK compuesta", "cargarPermisos solo lee la PRIMERA fila de la union",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_UsuarioEmpleado", "EXISTE. usuarios_empleados (schema.sql:76)", "de aqui sale la sucursal que puede cobrar",
     [["id_empleado", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE", VIS_PUB], ["sucursal_id", "Integer", VIS_PUB], ["nombre", "String = 120", VIS_PUB], ["rol", "String = 60", VIS_PUB], ["fecha_baja", "Timestamp = nullable, aqui NO se filtra", VIS_PUB]],
     []],

    ["CE_Sucursal", "EXISTE. sucursales", "el filtro de pertenencia: otra sucursal da 404, no 403",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_InventarioStock", "EXISTE. inventario_stock", "el disponible lo baja el trigger, aqui solo sube cantidad_vendida",
     [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer = UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer = UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_reservada", "Integer = 0, el trigger NO la toca", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB], ["stock_minimo_alert", "Integer = 0", VIS_PUB]],
     []],

    ["CE_MovimientoInventario", "EXISTE. movimientos_inventario (schema.sql:421)", "el BEFORE INSERT es lo que descuenta el stock",
     [["id_movimiento", "Integer = PK", VIS_PRI], ["id_ptc", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["tipo_movimiento", "String = 30, Venta", VIS_PUB], ["cantidad", "Integer = negativa", VIS_PUB], ["stock_anterior", "Integer = lo pone el trigger", VIS_PUB], ["stock_posterior", "Integer = lo pone el trigger", VIS_PUB], ["referencia", "String = 120, VNT-id_venta", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_venta", "Integer", VIS_PUB], ["fecha", "Timestamp = el trigger la pisa con NOW()", VIS_PUB]],
     []],

    ["CE_Comprobante", "EXISTE. comprobantes (schema.sql:406)", "generar es idempotente y exige venta COMPLETADA",
     [["id_comprobante", "Integer = PK", VIS_PRI], ["id_venta", "Integer", VIS_PUB], ["numero", "String = 30 UNIQUE", VIS_PUB], ["tipo", "String = 20", VIS_PUB], ["nit_cliente", "String = 30", VIS_PUB], ["razon_social", "String = 150", VIS_PUB], ["total", "Decimal(12,2)", VIS_PUB], ["fecha_emision", "Timestamp", VIS_PUB], ["pdf_url", "String", VIS_PUB]],
     []],

    ["CE_BitacoraAuditoria", "EXISTE. bitacora_auditoria (schema.sql:148)", "guarda el vuelto, que ventas no tiene",
     [["id_bitacora", "Integer = PK", VIS_PRI], ["id_usuario", "Integer = ON DELETE SET NULL", VIS_PUB], ["accion_sql", "String = 40", VIS_PUB], ["tabla_afectada", "String = 80", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "INET", VIS_PUB], ["user_agent", "String = 255", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_Producto", "EXISTE. productos (schema.sql:223)", "solo aparece por el comprobante, y ahi revienta",
     [["id_producto", "Integer = PK", VIS_PRI], ["codigo", "String = 40 UNIQUE", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["precio_base", "Decimal(10,2) NOT NULL", VIS_PUB], ["estado", "String = Disponible", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. producto_talla_color (schema.sql:237)", "la prenda que se descuenta",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB], ["estado_stock", "String = Disponible", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Cajero", "Cajero de la caja. OJO: da 403", "NO tiene realizar_venta"],
    ["ACTOR_Cliente", "Cliente que paga en efectivo", "no toca el sistema"],
    ["ACTOR_Pasarela", "Terminal sandbox de la pasarela", "sin sesion: aprueba la transaccion"],
    ["ACTOR_Administrador", "Unico que pasa el permiso", "wildcard *"]
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
    var mod = buscarPaquete(cu, "4. Ventas y Pagos");
    if (mod == null) mod = buscarPaquete(cu, "7. Inventario y Recepciones");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU37 - Análisis de clases");

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
        INFORME.push(pad(d2[0], 30) + " atr " + totalDe(fin) + "/" + d2[3].length + "  ope " + totalDe(finOpe) + "/" + d2[4].length + (bien ? "  REAL" : "  TEXTO"));
    }

    var diag = null;
    try { diag = paq.Diagrams.AddNew("CU37 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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

        var C = {};
        for (var q = 0; q < DEF.length; q++) { C[DEF[q][0]] = clases[q]; }

        conEnDiagrama += relacion(diag, actores[0], C.IU_AdminCaja, "pulsa Procesar Pago", "Association", "", "cajero", "caja", "1", "1");
        conEnDiagrama += relacion(diag, actores[0], C.CTR_PagosController, "cobra por HTTP", "Association", "", "cajero", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C.IU_FormularioPago, "ingresa el monto", "Association", "", "cajero", "formulario", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C.IU_FormularioPago, "recibe el vuelto", "Association", "", "cliente", "formulario", "0..*", "1");
        conEnDiagrama += relacion(diag, actores[2], C.IU_SandboxPago, "opera el terminal", "Association", "", "pasarela", "terminal", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[2], C.CTR_PagosController, "notifica sin sesion", "Association", "", "pasarela", "webhook", "0..*", "1");
        conEnDiagrama += relacion(diag, actores[3], C.CTR_PagosController, "unico que pasa el permiso", "Association", "", "administrador", "endpoint", "1", "0..1");

        conEnDiagrama += relacion(diag, C.IU_AdminCaja, C.IU_FormularioPago, "bloque de cobro", "Composition", "composition", "caja", "formulario", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminCaja, C.IU_Api, "cliente HTTP", "Dependency", "uses", "caja", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminCaja, C.CE_ProcesarPagoCajaRequest, "cuerpo del cobro", "Association", "", "caja", "cuerpo", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_AdminCaja, C.CE_Venta, "venta cobrada", "Association", "", "caja", "venta", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_FormularioPago, C.CE_Venta, "total a cobrar", "Dependency", "uses", "formulario", "venta", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_FormularioPago, C.CE_Comprobante, "comprobante a imprimir", "Association", "", "formulario", "comprobante", "0..*", "1");
        conEnDiagrama += relacion(diag, C.IU_SandboxPago, C.IU_Api, "cliente HTTP", "Dependency", "uses", "terminal", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_SandboxPago, C.CE_TransaccionPago, "transaccion que aprueba", "Association", "", "terminal", "transaccion", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_Api, C.CTR_PagosController, "punto de acceso de pagos", "Dependency", "uses", "cliente", "pagos", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_Api, C.CE_TransaccionPago, "estado consultado", "Association", "", "cliente", "transaccion", "1", "0..1");

        conEnDiagrama += relacion(diag, C.CTR_PagosController, C.SRV_PagosService, "servicio de pagos", "Association", "", "pagos", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_PagosController, C.CE_ProcesarPagoCajaRequest, "cuerpo de entrada", "Association", "", "pagos", "cuerpo", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_PagosController, C.CE_ProcesarPagoCajaDTO, "DTO mapeado", "Association", "", "pagos", "dto", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_PagosController, C.CE_TransaccionPago, "resultado del cobro", "Association", "", "pagos", "transaccion", "0..*", "1");

        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.SRV_ComprobantesService, "emite el comprobante", "Dependency", "uses", "pagos", "comprobantes", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.SRV_PreferenciasService, "feedback de CU41", "Dependency", "uses", "pagos", "preferencias", "1", "0..1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.SRV_BitacoraService, "auditoria, fuera de la transaccion", "Association", "", "pagos", "auditor", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.SRV_DataSource, "consultas y bloqueos", "Dependency", "uses", "pagos", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_ProcesarPagoCajaDTO, "DTO recibido", "Dependency", "uses", "pagos", "dto", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_Usuario, "cajero que cobra", "Association", "", "pagos", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_UsuarioRol, "asignacion de rol", "Dependency", "uses", "pagos", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_Rol, "permiso de caja", "Dependency", "uses", "pagos", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_UsuarioEmpleado, "sucursal de la caja", "Dependency", "uses", "pagos", "empleado", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_Sucursal, "sucursal que cobra", "Dependency", "uses", "pagos", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_Venta, "venta que se cobra", "Association", "", "pagos", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_VentaItem, "items a descontar", "Dependency", "uses", "pagos", "item de venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_TransaccionPago, "transaccion creada", "Composition", "composition", "pagos", "transaccion", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_InventarioStock, "stock bloqueado y descontado", "Association", "", "pagos", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_MovimientoInventario, "movimiento tipo Venta", "Composition", "composition", "pagos", "movimiento", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_ProductoTallaColor, "prenda del movimiento", "Dependency", "uses", "pagos", "prenda", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_BitacoraAuditoria, "registros de auditoria", "Composition", "composition", "pagos", "bitacora", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_Comprobante, "comprobante emitido", "Association", "", "pagos", "comprobante", "0..*", "1");

        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.SRV_DataSource, "consulta y escritura", "Dependency", "uses", "comprobantes", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.SRV_BitacoraService, "auditoria del comprobante", "Association", "", "comprobantes", "auditor", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Comprobante, "comprobante generado", "Composition", "composition", "comprobantes", "comprobante", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Venta, "venta facturada", "Dependency", "uses", "comprobantes", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_VentaItem, "items facturados", "Dependency", "uses", "comprobantes", "item de venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Producto, "lee porcentaje_iva: no existe", "Dependency", "uses", "comprobantes", "producto", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_UsuarioEmpleado, "cajero que imprime", "Dependency", "uses", "comprobantes", "empleado", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PreferenciasService, C.CE_Venta, "preferencias de la venta", "Dependency", "uses", "preferencias", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_BitacoraService, C.SRV_DataSource, "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_BitacoraService, C.CE_BitacoraAuditoria, "fila de bitacora", "Composition", "composition", "auditor", "bitacora", "1", "1");

        conEnDiagrama += relacion(diag, C.CE_ProcesarPagoCajaRequest, C.CE_ProcesarPagoCajaDTO, "mapeo del DTO", "Dependency", "uses", "cuerpo", "dto", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_ProcesarPagoCajaRequest, C.CE_Venta, "venta a cobrar", "Association", "", "cuerpo", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_ProcesarPagoCajaDTO, C.CE_Venta, "venta del DTO", "Association", "", "dto", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_TransaccionPago, C.CE_Venta, "venta cobrada", "Association", "", "transaccion", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_TransaccionPago, C.CE_Usuario, "cajero de la transaccion", "Association", "", "transaccion", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Sucursal, "sucursal de la venta", "Association", "", "venta", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Usuario, "cajero que creo la venta", "Association", "", "venta", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaItem, C.CE_Venta, "venta del item", "Composition", "composition", "item de venta", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaItem, C.CE_ProductoTallaColor, "prenda vendida", "Association", "", "item de venta", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_Rol, "roles del usuario", "Association", "", "usuario", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_UsuarioRol, "asignaciones", "Composition", "composition", "usuario", "asignacion", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_Rol, C.CE_UsuarioRol, "usuarios del rol", "Association", "", "rol", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_UsuarioEmpleado, C.CE_Usuario, "empleado", "Association", "", "empleado", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_UsuarioEmpleado, C.CE_Sucursal, "sucursal asignada", "Association", "", "empleado", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_InventarioStock, C.CE_ProductoTallaColor, "stock por prenda", "Association", "", "stock", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_InventarioStock, C.CE_Sucursal, "stock por sucursal", "Association", "", "stock", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_InventarioStock, "stock del movimiento", "Association", "", "movimiento", "stock", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_Sucursal, "sucursal del movimiento", "Association", "", "movimiento", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_Venta, "venta del movimiento", "Association", "", "movimiento", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_Usuario, "cajero del movimiento", "Association", "", "movimiento", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Comprobante, C.CE_Venta, "venta facturada", "Association", "", "comprobante", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_BitacoraAuditoria, C.CE_Usuario, "usuario de la accion", "Association", "", "bitacora", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Producto, C.CE_ProductoTallaColor, "prendas del producto", "Composition", "composition", "producto", "prenda", "1", "0..*");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("4 actores, " + DEF.length + " clases y " + TOTAL_REL + " relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (4), CTR_ controlador (1), SRV_ servicio (5), CE_ entidad o DTO (" + (DEF.length - 10) + ").");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("HALLAZGO CRITICO 1: HAY DOS COBROS EN UN MISMO METODO Y NO SE PARECEN EN NADA.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("procesarPagoCaja tiene dos ramas y solo una esta terminada. La rama de efectivo, de");
        N.push("la linea 265 a la 396, hace todo lo que el caso describe. La rama de Tarjeta, QR y");
        N.push("Transferencia, de la linea 399 a la 447, crea la transaccion y se acaba.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("  Concepto                    Efectivo (265-396)      Pasarela (399-447)");
        N.push("  ---------------------------  ----------------------  ----------------------");
        N.push("  transaccion de datos         SI (276)                NO");
        N.push("  FOR UPDATE sobre la venta   SI (279)                NO");
        N.push("  FOR UPDATE sobre el stock   SI (302)                NO");
        N.push("  revalida el estado interno  SI (283)                NO");
        N.push("  revalida el stock           SI (309-317)             NO");
        N.push("  INSERT transacciones_pago  SI, Aprobado (319)      SI, Pendiente (404)");
        N.push("  UPDATE ventas a Completada  SI (334)                NO");
        N.push("  descuenta inventario        SI (336-350)            NO");
        N.push("  emite el comprobante        SI (356)                NO");
        N.push("  devuelve vuelto             SI (394)                NO");
        N.push("  respuesta                   Completada (391)        Pendiente (444)");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("O sea que el caso describe un unico flujo y en realidad hay dos, y el segundo esta a");
        N.push("medio hacer. Para tarjeta, QR o transferencia, procesarPagoCaja devuelve estado");
        N.push("Pendiente, la venta sigue Pendiente, el inventario no se toca y no hay comprobante.");
        N.push("El cobro lo termina otro caso de uso, CU35, por la via del terminal.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("HALLAZGO 2: EL TERMINAL ES LA MISMA PAGINA DE CU35 Y POR AHI SE COMPLETA.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("  terminal_url: `${FRONTEND_URL}/sandbox-pago?tx=${idTransaccion}`");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Es la misma ruta y la misma pagina SandboxPago.tsx que usa la compra digital de");
        N.push("CU35, no un terminal propio de caja. Y esa pagina, al pulsar Aprobado, llama a");
        N.push("api.simularPasarela, que entra en simularPasarela, que firma su propia notificacion y");
        N.push("la manda a procesarWebhook, que termina en procesarResultado.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Y procesarResultado es el metodo de CU35, el que hace el FOR UPDATE, el UPDATE de");
        N.push("ventas, el descuento, el comprobante y las dos bitacoras. O sea que el cobro con");
        N.push("tarjeta de una venta de caja lo completa, sin ninguna de las garantias del caso,");
        N.push("el codigo de CU35. Para el negocio es lo mismo, pero el cobro en caja no es");
        N.push("autocontenido: depende de un metodo que vive en otro caso de uso y que podria");
        N.push("cambiar sin que nadie mire este.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Detalle util: procesarResultado solo actualiza el carrito si la venta lo tiene,");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("  if (venta.id_carrito != null) { UPDATE carritos SET estado = 'Convertido a venta' }");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Una venta de POS tiene id_carrito NULL, asi que el carrito no se toca. Esta bien");
        N.push("pensado, porque si no CU37 intentaria cerrar un carrito que no existe.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("HALLAZGO CRITICO 3: E6 SI FUNCIONA AQUI, Y EN CU35 NO. LA DIFERENCIA ES UNA PALABRA.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("El caso dice que si la pasarela rechaza, la venta sigue Pendiente y el Cajero puede");
        N.push("cambiar el medio y reintentar. Y eso es exactamente lo que hace esta rama, porque el");
        N.push("guard de la linea 250 filtra por estado:");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("  SELECT id_transaccion FROM transacciones_pago");
        N.push("   WHERE id_venta = $1 AND estado IN ('Pendiente', 'Aprobado') LIMIT 1");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Una transaccion Rechazada no esta en esa lista, o sea que no bloquea y se puede");
        N.push("intentar de nuevo con otro medio. Y en CU35 el guard es:");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("  SELECT id_transaccion FROM transacciones_pago WHERE id_venta = $1 LIMIT 1");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Sin filtro de estado, con lo que alli la transaccion Rechazada bloquea el reintento");
        N.push("para siempre. La misma idea, el mismo servicio, el mismo autor, dos versiones");
        N.push("distintas del mismo guard, y la correcta esta en el camino de caja. Es el");
        N.push("contraste mas claro del proyecto: un detalle de seis palabras decide si un cliente");
        N.push("puede reintentar un pago rechazado.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Ojo con el detalle tecnico: ese estado IN ('Pendiente', 'Aprobado') cubre la venta");
        N.push("Aprobada pero no la Completada, o sea que si la venta llega Completada sin");
        N.push("transaccion, el cobro pasaria el guard de la linea 250 pero lo cortaria el de la");
        N.push("246. La cobertura real la da el estado de la venta, no el de la transaccion.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("HALLAZGO 4: E7 NO EXISTE. NO HAY NADQUE QUE PUEDA HACER TIMEOUT.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("El caso pide HTTP 504 con La pasarela no respondió. Reintenta el cobro. En las 784");
        N.push("lineas del servicio hay un solo GatewayTimeoutException, y esta en la linea 519, que");
        N.push("es simularPasarela, el endpoint de simulacion de CU35, y se dispara cuando el");
        N.push("propio cliente pide el resultado no_responde.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("En procesarPagoCaja no hay ninguno. Y no puede haberlo, por la misma razon de CU35:");
        N.push("la rama de pasarela no hace ninguna llamada HTTP. Inserta la transaccion, devuelve");
        N.push("un terminal_url y se acaba. No hay un tercero al que esperarle la respuesta, asi");
        N.push("que no hay timeout que medir. El caso da por hecho una llamada de red que el codigo");
        N.push("no hace.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Lo que si tiene esta rama es el hueco de E7: si el cajero cierra la pestana del");
        N.push("terminal, la transaccion queda Pendiente y la venta Pendiente, sin transaccion");
        N.push("Aprobada ni Rechazada. Es el estado que E9 de CU35 no cubre, porque ahi la");
        N.push("transaccion ya tiene id y se puede reintentar; aqui tambien, porque el guard de");
        N.push("la 250 dejaria crear otra. O sea que se puede recuperar a mano, pero nada en la");
        N.push("interfaz lo dice.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("HALLAZGO 5: LA RAMA DE EFECTIVO ESTA BIEN HECHA. HAY QUE DECIRLO.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Es la parte mas sólida de todo el modulo de pagos, y conviene registrarla porque");
        N.push("contrasta con CU36, que esta en el mismo dominio y no bloquea nada.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("  - La venta se bloquea con FOR UPDATE (279) y se revalida el estado DENTRO de la");
        N.push("    transaccion (283). O sea que el 409 de la 246, que esta fuera, es solo una");
        N.push("    comprobacion temprana y la que manda es la interna.");
        N.push("  - Cada fila de stock se bloquea una por una con FOR UPDATE (302), antes de");
        N.push("    comprobar nada. Es la tercera vez que aparece FOR UPDATE en el proyecto y las");
        N.push("    tres estan aqui y en CU35.");
        N.push("  - La revalidacion de stock (309-317) ocurre con las filas ya bloqueadas.");
        N.push("  - Todo el bloque de escritura cabe en una transaccion: transaccion, venta, stock y");
        N.push("    movimientos.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Y el calculo del vuelto esta bien, con un detalle que vale la pena:");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("  const montoRecibido = dto.monto_recibido == null ? NaN : Number(dto.monto_recibido);");
        N.push("  const vuelto = Number.isFinite(montoRecibido) ? Math.round((montoRecibido - total) * 100) / 100 : NaN;");
        N.push("  const faltante = Number.isFinite(vuelto) ? Math.round((total - montoRecibido) * 100) / 100 : total;");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Si no mandan monto_recibido, el NaN se propaga a faltante y el mensaje sale con el");
        N.push("total completo: Faltan Bs 150.00. Es un uso correcto de NaN como bandera, y");
        N.push("evita un if (monto_recibido) que habria tratado el 0 como ausente. El unico detalle");
        N.push("es que vuelve a convertir el faltante ya redondeado, o sea que hace el redondeo");
        N.push("dos veces, lo cual es inocuo pero redundante.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("HALLAZGO 6: EL VUELTO NO ESTA EN NINGUNA TABLA, SOLO EN LA BITACORA.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("El vuelto se calcula, se devuelve y se escribe en el new_data de la bitacora (374).");
        N.push("No hay columna para el, ni en transacciones_pago ni en ventas ni en comprobantes.");
        N.push("Y comprobantes tiene nit_cliente y razon_social pero ningun campo de efectivo o");
        N.push("cambio, asi que el comprobante que se le entrega al cliente no lo refleja.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Es la tercera vez que la bitacora es el unico deposito de un dato de negocio, despues");
        N.push("del NIT de CU34 y CU36. Y tiene el mismo problema: si la escritura falla, el");
        N.push("cambio se pierde sin aviso, porque ya se cobro y ya se entrego el comprobante.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("HALLAZGO 7: EL DESCUENTO SIGUE SIENDO COSA DEL TRIGGER, NO DEL SERVICIO.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("El caso dice inventario_stock.cantidad_disponible = cantidad_disponible - cantidad");
        N.push("y cantidad_vendida = cantidad_vendida + cantidad. La segunda es la unica que esta");
        N.push("escrita, y la primera la pone el trigger fn_aplicar_movimiento_inventario al hacer");
        N.push("el INSERT del movimiento, con la cantidad en negativo. Es exactamente el mismo");
        N.push("mecanismo de CU35, y el comentario del propio servicio lo dice en la linea 645 de");
        N.push("aquel caso: descuento de inventario con movimientos tipo Venta, el trigger actualiza");
        N.push("el disponible. O sea que el autor lo sabe y lo escribio, y el caso no lo recogio.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Lo que el caso tampoco dice es que cantidad_reservada no se toca, aqui ni en CU35.");
        N.push("Y que el trigger pisa la fecha con NOW(), asi que el movimiento no admite fecha");
        N.push("retroactiva. Y que si faltara la fila de inventario_stock, el INSERT del trigger");
        N.push("crearia una con disponible negativo, salvo que la revalidacion de la 309 lo impida.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("HALLAZGO 8: E1 ESTA MAL PLANTEADA. OTRA SUCURSAL DA 404, NO 403.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("El caso dice que sin realizar_venta o de otra sucursal responde 403 No tienes");
        N.push("permisos para procesar pagos en esta caja. El codigo separa las dos cosas:");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("  linea 213  exigirPermisoCaja   -> 403 No tienes permisos para procesar pagos en esta caja.");
        N.push("  linea 243  if (!venta || Number(venta.id_sucursal) !== idSucursal)");
        N.push("                                -> 404 Venta no encontrada.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Y el 404 es la mejor respuesta posible, porque no le dice al cajero de otra sucursal");
        N.push("que la venta existe. O sea que el codigo esta mejor que el caso, y conviene no");
        N.push("cambiar el 404 por el 403 que pide la especificacion.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Y ojo con un mensaje duplicado: exigirPermisoCaja y sucursalDelEmpleado lanzan");
        N.push("exactamente el mismo texto, No tienes permisos para procesar pagos en esta caja.,");
        N.push("aunque uno es un fallo de permiso y el otro es que al usuario no le asignaron");
        N.push("sucursal. Para el usuario es indistinguible, y para diagnosticar tambien.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("HALLAZGO 9: PAYPAL FUNCIONA EN DIGITAL Y NO EN CAJA.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("  const PROVEEDORES      = ['LIBELULA', 'STRIPE', 'PAYPAL'];   // linea 37, CU35");
        N.push("  const PROVEEDORES_CAJA = ['LIBELULA', 'STRIPE'];           // linea 39, CU37");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Y el DTO de la caja lo repite:");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("  @IsIn(['LIBELULA', 'STRIPE'], { message: 'Proveedor de pasarela inválido.' })");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("El caso no menciona PAYPAL en ninguna parte, asi que segun el caso los dos son");
        N.push("iguales. En el codigo, la compra digital acepta PayPal y la caja no. Y la columna");
        N.push("proveedor_pasarela es un VARCHAR(40) sin CHECK donde caben cuatro valores:");
        N.push("CAJA, LIBELULA, STRIPE y PAYPAL. CAJA lo escribe el propio servicio en el INSERT");
        N.push("del efectivo y no esta en ninguna de las dos listas de proveedores, porque no es");
        N.push("una pasarela: es la ausencia de pasarela.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("HALLAZGO 10: E4 TIENE TRES 409 Y SOLO UNO ESTA EN EL CASO.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("  linea 247  venta.estado != PENDIENTE              -> La venta ya fue cobrada.");
        N.push("  linea 257  ya existe tx Pendiente o Aprobado      -> La venta ya fue cobrada.");
        N.push("  linea 284  revalidacion dentro de la transaccion  -> La venta ya fue cobrada.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("Los tres son correctos y el tercero es el que de verdad cierra la carrera, porque");
        N.push("esta dentro de la transaccion y con la fila bloqueada. El caso solo menciona el");
        N.push("primero. Y la idempotencia que el caso promete para el doble clic, en efectivo si");
        N.push("se cumple de verdad por el 284; en pasarela la cumple el 257, que es una lectura");
        N.push("sin FOR UPDATE, o sea que dos peticiones simultaneas podrian pasar las dos y");
        N.push("crear dos transacciones para la misma venta.");
        N.push("    pdf_url como null y despues un UPDATE la rellena, cuando la url ya se podia");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - El permiso sigue siendo realizar_venta, sexta aparicion, y sigue sin existir en");
        N.push("    ninguno de los cinco roles. El Cajero tiene registrar_venta y procesar_pagos,");
        N.push("    que son los dos nombres de los mensajes de error, y ninguno es el que se");
        N.push("    comprueba. Y cargarPermisos con const [fila] sobre el JOIN por rol, que se");
        N.push("    queda con la mitad de los permisos, es la decimaoctava copia de ese defecto.");
        N.push("  - sucursalDelEmpleado en pagos NO filtra por fecha_baja, al contrario que la copia");
        N.push("    de SRV_VentasService, que si lo hace con AND ue.fecha_baja IS NULL. O sea que un");
        N.push("    empleado dado de baja conserva la caja aqui y no en ventas, y esta es la version");
        N.push("    que se usa para cobrar. Un empleado dado de baja puede seguir cobrando.");
        N.push("  - El PDF del comprobante SI se guarda, y con su url en la columna. guardarPdf");
        N.push("    escribe el buffer en el directorio de comprobantes con mkdirSync y");
        N.push("    writeFileSync, y devuelve la ruta. O sea que el boton de descargar tiene de");
        N.push("    donde salir, y el caso acierta. Lo unico raro es que se hace en dos tiempos: el");
        N.push("    INSERT escribe pdf_url como null y despues un UPDATE la rellena, cuando la url");
        N.push("    ya se podia calcular antes de insertar. Es un UPDATE de mas, sin efecto adverso,");
        N.push("    pero delata que la funcion se escribio en dos-passadas.");
        N.push("  - generar se invoca FUERA de la transaccion del cobro, en la linea 356, y exige");
        N.push("    que la venta ya este COMPLETADA, en la linea 210 de su servicio. El orden es");
        N.push("    correcto: el UPDATE de la 334 va dentro de la transaccion y generar va despues.");
        N.push("    Pero si generar falla, el cobro ya esta hecho, el stock ya se descontó y el");
        N.push("    comprobante se pierde sin reintento automatico, porque esta ruta no tiene un");
        N.push("    webhook que lo vuelva a pedir. Es el problema del hallazgo 7 de CU35, aqui sin");
        N.push("    ninguna red de seguridad.");
        N.push("  - Y ademas generar todavia falla, porque lee p.porcentaje_iva. O sea que el cobro");
        N.push("    en efectivo se completa, se descuenta el stock y el cajero recibe un 500 sin");
        N.push("    comprobante. Es la misma columna que no existe y que ya atraviesa CU34, CU35 y");
        N.push("    CU36, y en los tres casos cae en el sitio mas malo posible.");
        N.push("  - El caso dice en el paso 9 que la venta queda en el cierre de caja diario. No hay");
        N.push("    ninguna tabla de cierre ni de turno de caja en el esquema, y el modulo no tiene");
        N.push("    nada de eso: AdminCaja.tsx es una sola pantalla que ademas mezcla el cobro con el");
        N.push("    alta de la venta.");
        N.push("  - E9 es la octava doble validacion. El @IsIn del metodo de pago corta con 400 y");
        N.push("    deja inalcanzable el 422 de la linea 222, que tiene el mismo texto; el caso");
        N.push("    dice 422. Y el @IsNumber de monto_recibido trae un mensaje propio, El monto");
        N.push("    recibido debe ser numerico., que no esta en la lista de excepciones del caso.");
        N.push("  - id_carrito se lee en el SELECT de la 236 y no se usa en ninguna de las dos");
        N.push("    ramas. Es una lectura muerta que en CU35 si hacia falta, para marcar el carrito");
        N.push("    como convertido, y aqui no, porque una venta de POS no tiene carrito.");
        N.push("  - Este caso comparte servicio, controlador y hasta pagina de terminal con CU35.");
        N.push("    Las diferencias entre ambos estan en el mismo archivo, a unas 200 lineas de");
        N.push("    distancia, y son justo las que no se ven sin leer las dos: una rama con");
        N.push("    transaccion y bloqueos y otra sin nada, un guard que permite reintentar y otro");
        N.push("    que no, y un mensaje de 404 donde el caso pide 403.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU37 - PROCESAR PAGO EN CAJA - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de " + TOTAL_ATR);
    T.push("Operaciones reales: " + totalOpe + " de " + TOTAL_OPE);
    T.push("CONECTORES DIBUJADOS: " + conEnDiagrama + " de " + TOTAL_REL);
    if (conEnDiagrama < TOTAL_REL) T.push("  FALTAN LINEAS. Reejecuta el script: es idempotente y las coloca.");
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
    msg = msg + "CU37 - Procesar pago en caja" + SALTO + SALTO;
    msg = msg + "Dos ramas en un metodo y solo una esta completa." + SALTO;
    msg = msg + "Efectivo: transaccion, FOR UPDATE, stock, comprobante." + SALTO;
    msg = msg + "Pasarela: solo el INSERT, y lo termina el codigo de CU35." + SALTO + SALTO;
    msg = msg + "E6 (reintentar) FUNCIONA aqui y NO en CU35: es un" + SALTO;
    msg = msg + "estado IN mas en la consulta de la linea 250." + SALTO;
    msg = msg + "E7 (504) no existe: no hay nada que pueda hacer timeout." + SALTO;
    msg = msg + "Clases: " + DEF.length + "    Actores: 4    Relaciones: " + TOTAL_REL + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de " + TOTAL_ATR + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de " + TOTAL_OPE + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de " + TOTAL_REL + SALTO;
    if (conEnDiagrama < TOTAL_REL) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU37 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU37 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU37", 0); } catch (e3) { }
}
