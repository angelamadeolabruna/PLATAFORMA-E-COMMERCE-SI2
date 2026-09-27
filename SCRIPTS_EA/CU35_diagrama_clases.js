// ================================================================
// CU35 - PROCESAR PAGO CON PASARELA DE PAGO
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   api/src/modulos/pagos/CTR_Pagos.ts:77             @Controller('pagos'), 5 rutas
//   api/src/modulos/pagos/CTR_Pagos.ts:142            @Post('webhook') SIN guard, HttpCode 200
//   api/src/modulos/pagos/SRV_PagosService.ts:40      FIRMA_SECRETO con fallback en el codigo
//   api/src/modulos/pagos/SRV_PagosService.ts:101     firmar = HMAC de id.monto.estado
//   api/src/modulos/pagos/SRV_PagosService.ts:114     crearTransaccion
//   api/src/modulos/pagos/SRV_PagosService.ts:151     una sola transaccion por venta
//   api/src/modulos/pagos/SRV_PagosService.ts:200     checkout_url apunta al propio front
//   api/src/modulos/pagos/SRV_PagosService.ts:497     simularPasarela se firma a si mismo
//   api/src/modulos/pagos/SRV_PagosService.ts:548     procesarResultado
//   api/src/modulos/pagos/SRV_PagosService.ts:577     E9 guarda de idempotencia
//   api/src/modulos/pagos/SRV_PagosService.ts:591     E5 comparacion de monto
//   api/src/modulos/pagos/SRV_PagosService.ts:650     FOR UPDATE sobre la venta
//   api/src/modulos/pagos/SRV_PagosService.ts:670     FOR UPDATE sobre cada stock
//   api/src/modulos/pagos/SRV_PagosService.ts:710     solo sube cantidad_vendida
//   api/src/modulos/pagos/SRV_PagosService.ts:716     INSERT movimientos_inventario cantidad negativa
//   api/src/modulos/pagos/SRV_PagosService.ts:727     comprobante FUERA de la transaccion
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:187  generar es idempotente
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:196  lee p.porcentaje_iva: NO existe
//   api/src/modulos/comprobantes/SRV_ComprobantesService.ts:226  el NIT sale de la bitacora
//   api/src/main.ts:22                                 ValidationPipe whitelist:true
//   web/src/pages/SandboxPago.tsx                     238 lineas, la pagina "pasarela"
//   web/src/lib/api.ts:1936-1990                       4 endpoints de pago
//   web/src/router.tsx:55                              /sandbox-pago
//   schema.sql:40   transacciones_pago sin UNIQUE en id_venta
//   schema.sql:421  movimientos_inventario
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
var TOTAL_REL = 81;
var TOTAL_ATR = 126;
var TOTAL_OPE = 43;

var DEF = [
    ["IU_SandboxPago", "EXISTE. web/src/pages/SandboxPago.tsx, 238 lineas", "es la pasarela: elige Aprobado, Rechazado o no_responde",
     [["idTransaccion", "Integer", VIS_PUB], ["estado", "String = Pendiente", VIS_PUB], ["monto", "Number", VIS_PUB], ["confirmando", "String = null", VIS_PUB], ["error", "String = null", VIS_PUB], ["cargando", "Boolean", VIS_PUB]],
     [["confirmar", "void", ["resultado"], VIS_PUB], ["cargarEstado", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Checkout", "EXISTE. web/src/pages/Checkout.tsx (CU34)", "el paso 3 llama crearTransaccion y redirige al checkout_url",
     [["idVentaCreada", "Integer = null", VIS_PUB], ["creandoPago", "Boolean", VIS_PUB], ["metodoPago", "String = Tarjeta", VIS_PUB], ["proveedor", "String = LIBELULA", VIS_PUB], ["totalEstimado", "Number", VIS_PUB]],
     [["iniciarPago", "void", [], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "EXISTE. web/src/lib/api.ts:1936-1990", "cuatro endpoints: transacciones, estado, sandbox y caja",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["crearTransaccion", "Object", ["body"], VIS_PUB], ["consultarEstadoTransaccion", "Object", ["idTransaccion"], VIS_PUB], ["simularPasarela", "Object", ["body"], VIS_PUB], ["procesarPagoCaja", "Object", ["body"], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["IU_Router", "EXISTE. web/src/router.tsx:54-55", "monta /checkout y /sandbox-pago",
     [],
     [["resolver", "Element", ["ruta"], VIS_PUB]]],

    ["CTR_PagosController", "EXISTE. pagos/CTR_Pagos.ts", "5 rutas; el webhook es la unica SIN guard",
     [["pagosService", "PagosService", VIS_PRI]],
     [["crearTransaccion", "Object", ["body", "usuario", "request"], VIS_PUB], ["procesarPagoCaja", "Object", ["body", "usuario", "request"], VIS_PUB], ["consultarEstado", "Object", ["idTransaccion", "usuario"], VIS_PUB], ["simularPasarela", "Object", ["body", "usuario", "request"], VIS_PUB], ["procesarWebhook", "Object", ["body", "request"], VIS_PUB]]],

    ["CTR_VentasController", "EXISTE. ventas/CTR_Ventas.ts (CU34)", "creo la venta Pendiente que aqui se cobra",
     [["ventasService", "VentasService", VIS_PRI]],
     [["checkout", "Object", ["body", "usuario", "request"], VIS_PUB]]],

    ["SRV_PagosService", "EXISTE. pagos/SRV_PagosService.ts, 784 lineas", "13 metodos; el nucleo bien bloqueado con FOR UPDATE",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI], ["comprobantesService", "ComprobantesService", VIS_PRI], ["preferenciasService", "PreferenciasService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermisoPagar", "void", ["usuario"], VIS_PRI], ["exigirPermisoCaja", "void", ["usuario"], VIS_PRI], ["sucursalDelEmpleado", "Number", ["usuario"], VIS_PRI], ["firmar", "String", ["idTransaccion", "monto", "estado"], VIS_PRI], ["firmasCoinciden", "Boolean", ["a", "b"], VIS_PRI], ["crearTransaccion", "Object", ["usuario", "dto", "request"], VIS_PUB], ["procesarPagoCaja", "Object", ["usuario", "dto", "request"], VIS_PUB], ["consultarEstado", "Object", ["usuario", "idTransaccion"], VIS_PUB], ["procesarWebhook", "Object", ["dto", "request"], VIS_PUB], ["simularPasarela", "Object", ["usuario", "dto", "request"], VIS_PUB], ["procesarResultado", "Object", ["idTransaccion", "estado", "montoNotificado", "detalle", "request"], VIS_PRI], ["registrarPreferenciasDeVenta", "void", ["idVenta", "idUsuario", "request"], VIS_PRI]]],

    ["SRV_FirmaWebhook", "EXISTE. pagos/SRV_PagosService.ts:101-112", "HMAC sha256 sobre id.monto.estado, sin nonce ni fecha",
     [["FIRMA_SECRETO", "String = process.env o fallback", VIS_PRI]],
     [["firmar", "String", ["idTransaccion", "monto", "estado"], VIS_PUB], ["firmasCoinciden", "Boolean", ["a", "b"], VIS_PUB]]],

    ["SRV_ComprobantesService", "EXISTE. comprobantes/SRV_ComprobantesService.ts (CU38)", "generar es idempotente, pero lee p.porcentaje_iva",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]],
     [["generar", "Comprobante", ["idVenta", "idUsuario", "request"], VIS_PUB], ["datosComprobanteDeVenta", "Object", ["idVenta"], VIS_PUB], ["numeracionCorrelativa", "String", ["idSucursal", "anio"], VIS_PUB], ["componerPdf", "Buffer", ["venta", "items", "sucursal", "cajero"], VIS_PUB]]],

    ["SRV_PreferenciasService", "EXISTE. recomendaciones/SRV_PreferenciasService.ts (CU41)", "su fallo nunca bloquea el pago",
     [],
     [["registrarPreferenciasVenta", "void", ["idVenta"], VIS_PUB]]],

    ["SRV_BitacoraService", "EXISTE. seguridad/SRV_BitacoraService.ts", "dos llamadas fuera de la transaccion del pago",
     [["repo", "Repository", VIS_PRI]],
     [["registrar", "BitacoraAuditoria", ["idUsuario", "accion", "tabla", "detalle", "request", "idRegistro", "oldData", "newData"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "EXISTE. seguridad/dependencias.ts", "protege 4 de las 5 rutas; el webhook queda abierto",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB]]],

    ["SRV_ValidationPipe", "EXISTE. api/src/main.ts:22", "whitelist:true y los @IsIn cortan antes que el servicio",
     [],
     [["validate", "Object", ["value", "metadatos"], VIS_PUB]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "query sueltas para leer y transaction para el camino feliz",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "Object", ["callback"], VIS_PUB]]],

    ["CE_CrearTransaccionRequest", "EXISTE. pagos/CTR_Pagos.ts:36", "3 campos, los dos ultimos con @IsIn",
     [["id_venta", "Integer", VIS_PUB], ["metodo", "String = Tarjeta|QR|Transferencia", VIS_PUB], ["proveedor_pasarela", "String = LIBELULA|STRIPE|PAYPAL", VIS_PUB]],
     []],

    ["CE_CrearTransaccionDTO", "EXISTE. SRV_PagosService.ts:19", "el tipo interno; identico al request",
     [["id_venta", "Integer", VIS_PUB], ["metodo", "String = Tarjeta|QR|Transferencia", VIS_PUB], ["proveedor_pasarela", "String = LIBELULA|STRIPE|PAYPAL", VIS_PUB]],
     []],

    ["CE_SimularPasarelaRequest", "EXISTE. pagos/CTR_Pagos.ts:47", "el cliente elige el resultado, incluido no_responde",
     [["id_transaccion", "Integer", VIS_PUB], ["resultado", "String = Aprobado|Rechazado|no_responde", VIS_PUB], ["detalle", "String = opcional", VIS_PUB]],
     []],

    ["CE_WebhookRequest", "EXISTE. pagos/CTR_Pagos.ts:59", "el unico payload sin sesion; llega firmado",
     [["id_transaccion", "Integer", VIS_PUB], ["estado", "String = Aprobado|Rechazado", VIS_PUB], ["monto", "Number", VIS_PUB], ["detalle", "String = opcional", VIS_PUB], ["firma", "String", VIS_PUB]],
     []],

    ["CE_TransaccionPago", "EXISTE. transacciones_pago (schema.sql:440)", "sin UNIQUE en id_venta: la unicidad la impone el servicio",
     [["id_transaccion", "Integer = PK", VIS_PRI], ["id_venta", "Integer", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["proveedor_pasarela", "String = 40", VIS_PUB], ["monto", "Decimal(12,2)", VIS_PUB], ["moneda", "String = 3, BOB", VIS_PUB], ["metodo", "String = 30", VIS_PUB], ["estado", "String = 20, Pendiente", VIS_PUB], ["referenciaExterna", "String = 120", VIS_PUB], ["id_transaccion_pasarela", "String = 120", VIS_PUB], ["fecha_hora", "Timestamp = NOW()", VIS_PUB], ["detalle", "Text", VIS_PUB]],
     []],

    ["CE_Venta", "EXISTE. ventas (schema.sql:384)", "el monto que se cobra sale de aqui, no de la pasarela",
     [["id_venta", "Integer = PK", VIS_PRI], ["id_cliente", "Integer", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["id_carrito", "Integer = nullable", VIS_PUB], ["modalidad", "String = 20", VIS_PUB], ["metodo_pago", "String = 30", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB], ["impuestos", "Decimal(12,2)", VIS_PUB], ["total", "Decimal(12,2)", VIS_PUB], ["estado", "String = 20", VIS_PUB], ["fecha_venta", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_VentaItem", "EXISTE. venta_items (schema.sql:399)", "cantidad y precio_unitario salen de aqui para el descuento",
     [["id_venta_item", "Integer = PK", VIS_PRI], ["id_venta", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["precio_unitario", "Decimal(10,2)", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB]],
     []],

    ["CE_Carrito", "EXISTE. carritos (schema.sql:368)", "pasa a 'Convertido a venta', el valor que el caso llama 'Convertido'",
     [["id_carrito", "Integer = PK", VIS_PRI], ["id_usuario", "Integer = nullable", VIS_PUB], ["estado", "String = Activo", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["fecha_creacion", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. tabla usuarios", "dueño de la transaccion; el permiso se le denies por rol",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120", VIS_PRI], ["estado", "String", VIS_PUB]],
     []],

    ["CE_Rol", "EXISTE. roles; permisos_json en schema.sql:573", "realizar_venta NO esta en ninguno de los 5 roles",
     [["id_rol", "Integer = PK", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["descripcion", "String", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "EXISTE. usuarios_roles", "cargarPermisos solo lee la PRIMERA fila de la union",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_InventarioStock", "EXISTE. inventario_stock", "el trigger descuenta el disponible; aqui solo sube cantidad_vendida",
     [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer = UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer = UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_reservada", "Integer = 0, el trigger NO la toca", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB], ["stock_minimo_alert", "Integer = 0", VIS_PUB]],
     []],

    ["CE_MovimientoInventario", "EXISTE. movimientos_inventario (schema.sql:421)", "el BEFORE INSERT es lo que descuenta el stock",
     [["id_movimiento", "Integer = PK", VIS_PRI], ["id_ptc", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["tipo_movimiento", "String = 30", VIS_PUB], ["cantidad", "Integer = negativa en venta", VIS_PUB], ["stock_anterior", "Integer = lo pone el trigger", VIS_PUB], ["stock_posterior", "Integer = lo pone el trigger", VIS_PUB], ["referencia", "String = 120", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_orden_compra", "Integer = nullable", VIS_PUB], ["id_venta", "Integer", VIS_PUB], ["id_reserva", "Integer = nullable", VIS_PUB], ["fecha", "Timestamp = el trigger la pisa con NOW()", VIS_PUB]],
     []],

    ["CE_Sucursal", "EXISTE. tabla sucursales", "el descuento se hace contra la sucursal de la venta, no la del carrito",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_BitacoraAuditoria", "EXISTE. bitacora_auditoria (schema.sql:148)", "ademas de traza, es la unica fuente del NIT y la razon social",
     [["id_bitacora", "Integer = PK", VIS_PRI], ["id_usuario", "Integer = ON DELETE SET NULL", VIS_PUB], ["accion_sql", "String = 40", VIS_PUB], ["tabla_afectada", "String = 80", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "INET", VIS_PUB], ["user_agent", "String = 255", VIS_PUB], ["fecha_hora", "Timestamp", VIS_PUB]],
     []],

    ["CE_Comprobante", "EXISTE. comprobantes (schema.sql:406)", "sin UNIQUE en id_venta; la idempotencia la comprueba el servicio",
     [["id_comprobante", "Integer = PK", VIS_PRI], ["id_venta", "Integer", VIS_PUB], ["numero", "String = 30 UNIQUE", VIS_PUB], ["tipo", "String = 20", VIS_PUB], ["nit_cliente", "String = 30", VIS_PUB], ["razon_social", "String = 150", VIS_PUB], ["total", "Decimal(12,2)", VIS_PUB], ["fecha_emision", "Timestamp", VIS_PUB], ["pdf_url", "String", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Cliente", "Cliente que paga. OJO: da 403", "NO tiene realizar_venta"],
    ["ACTOR_Pasarela", "La propia pagina SandboxPago", "sin sesion: es el webhook"],
    ["ACTOR_Administrador", "Unico que pasa el permiso", "wildcard *"],
    ["ACTOR_Cajero", "Cajero, solo por el flujo de caja", "NO tiene realizar_venta"]
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
    if (mod == null) mod = buscarPaquete(cu, "10. Carrito y Checkout");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU35 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU35 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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

        conEnDiagrama += relacion(diag, actores[0], C.IU_Checkout, "confirma y paga", "Association", "", "cliente", "checkout", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C.IU_Api, "pide la transaccion", "Dependency", "uses", "cliente", "cliente HTTP", "1", "1");
        conEnDiagrama += relacion(diag, actores[0], C.CTR_PagosController, "paga por HTTP", "Association", "", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C.CTR_VentasController, "compro antes de pagar", "Association", "", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C.IU_SandboxPago, "es la pasarela simulada", "Association", "", "pasarela", "pantalla", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C.CTR_PagosController, "notifica por webhook", "Association", "", "pasarela", "webhook", "0..*", "1");
        conEnDiagrama += relacion(diag, actores[2], C.CTR_PagosController, "unico que pasa el permiso", "Association", "", "administrador", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[3], C.CTR_PagosController, "cobra en el punto de caja", "Association", "", "cajero", "endpoint", "1", "0..1");

        conEnDiagrama += relacion(diag, C.IU_SandboxPago, C.IU_Api, "cliente HTTP", "Dependency", "uses", "sandbox", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_SandboxPago, C.IU_Router, "ruta de la pantalla", "Dependency", "uses", "sandbox", "router", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_SandboxPago, C.CE_SimularPasarelaRequest, "payload de la simulacion", "Association", "", "sandbox", "cuerpo", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_SandboxPago, C.CE_TransaccionPago, "estado que muestra", "Association", "", "sandbox", "transaccion", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_Checkout, C.IU_Api, "cliente HTTP", "Dependency", "uses", "checkout", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_Checkout, C.CE_CrearTransaccionRequest, "cuerpo de la transaccion", "Association", "", "checkout", "cuerpo", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_Checkout, C.CE_Venta, "venta que paga", "Association", "", "checkout", "venta", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_Api, C.CTR_PagosController, "punto de acceso de pagos", "Dependency", "uses", "cliente", "pagos", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_Router, C.IU_SandboxPago, "monta la pantalla", "Dependency", "uses", "router", "sandbox", "0..1", "1");
        conEnDiagrama += relacion(diag, C.IU_Router, C.IU_Checkout, "monta el checkout", "Dependency", "uses", "router", "checkout", "0..1", "1");

        conEnDiagrama += relacion(diag, C.CTR_PagosController, C.SRV_PagosService, "servicio de pagos", "Association", "", "pagos", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_PagosController, C.SRV_JwtAuthGuard, "guard en 4 de 5 rutas", "Dependency", "uses", "pagos", "guard", "1", "0..1");
        conEnDiagrama += relacion(diag, C.CTR_PagosController, C.SRV_ValidationPipe, "filtro de entrada", "Dependency", "uses", "pagos", "filtro", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_PagosController, C.CE_CrearTransaccionRequest, "cuerpo de crearTransaccion", "Association", "", "pagos", "cuerpo", "1", "0..1");
        conEnDiagrama += relacion(diag, C.CTR_PagosController, C.CE_SimularPasarelaRequest, "cuerpo de la simulacion", "Association", "", "pagos", "cuerpo", "1", "0..1");
        conEnDiagrama += relacion(diag, C.CTR_PagosController, C.CE_WebhookRequest, "cuerpo del webhook", "Association", "", "pagos", "cuerpo", "1", "0..1");
        conEnDiagrama += relacion(diag, C.CTR_PagosController, C.CE_CrearTransaccionDTO, "DTO mapeado", "Association", "", "pagos", "dto", "1", "0..1");
        conEnDiagrama += relacion(diag, C.CTR_VentasController, C.CE_Venta, "venta creada en CU34", "Composition", "composition", "ventas", "venta", "1", "0..*");

        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.SRV_FirmaWebhook, "firma y verifica", "Dependency", "uses", "pagos", "firma", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_FirmaWebhook, C.SRV_PagosService, "HMAC sha256", "Dependency", "uses", "firma", "pagos", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.SRV_ComprobantesService, "emite el comprobante", "Dependency", "uses", "pagos", "comprobantes", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.SRV_PreferenciasService, "feedback de CU41", "Dependency", "uses", "pagos", "preferencias", "1", "0..1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.SRV_BitacoraService, "auditoria, fuera de la transaccion", "Association", "", "pagos", "auditor", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.SRV_JwtAuthGuard, "usuario del guard", "Association", "", "pagos", "guard", "1", "0..1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.SRV_DataSource, "consultas y bloqueos", "Dependency", "uses", "pagos", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_CrearTransaccionDTO, "DTO recibido", "Dependency", "uses", "pagos", "dto", "1", "0..1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_TransaccionPago, "transaccion creada y actualizada", "Association", "", "pagos", "transaccion", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_Venta, "venta que se cobra", "Association", "", "pagos", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_VentaItem, "items a descontar", "Dependency", "uses", "pagos", "item de venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_Carrito, "carrito a Convertido a venta", "Association", "", "pagos", "carrito", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_Usuario, "usuario pagador", "Association", "", "pagos", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_Rol, "rol comprobado", "Dependency", "uses", "pagos", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_UsuarioRol, "asignacion de rol", "Dependency", "uses", "pagos", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_InventarioStock, "stock bloqueado y descontado", "Association", "", "pagos", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_MovimientoInventario, "movimiento tipo Venta", "Composition", "composition", "pagos", "movimiento", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_Sucursal, "sucursal de la venta", "Dependency", "uses", "pagos", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_BitacoraAuditoria, "registros de auditoria", "Composition", "composition", "pagos", "bitacora", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_Comprobante, "comprobante emitido", "Association", "", "pagos", "comprobante", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.SRV_DataSource, "consulta y escritura", "Dependency", "uses", "comprobantes", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_BitacoraAuditoria, "lee el NIT de la bitacora", "Dependency", "uses", "comprobantes", "bitacora", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Comprobante, "comprobante generado", "Composition", "composition", "comprobantes", "comprobante", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_Venta, "venta facturada", "Dependency", "uses", "comprobantes", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ComprobantesService, C.CE_VentaItem, "items facturados", "Dependency", "uses", "comprobantes", "item de venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PreferenciasService, C.CE_Venta, "preferencias de la venta", "Dependency", "uses", "preferencias", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_BitacoraService, C.SRV_DataSource, "persistencia", "Dependency", "uses", "auditor", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_BitacoraService, C.CE_BitacoraAuditoria, "fila de bitacora", "Composition", "composition", "auditor", "bitacora", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_JwtAuthGuard, C.CE_Usuario, "usuario resuelto", "Association", "", "guard", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ValidationPipe, C.CE_CrearTransaccionRequest, "clase validada", "Dependency", "uses", "filtro", "cuerpo", "1", "0..1");
        conEnDiagrama += relacion(diag, C.SRV_ValidationPipe, C.CE_SimularPasarelaRequest, "clase validada", "Dependency", "uses", "filtro", "cuerpo", "1", "0..1");
        conEnDiagrama += relacion(diag, C.SRV_ValidationPipe, C.CE_WebhookRequest, "clase validada", "Dependency", "uses", "filtro", "cuerpo", "1", "0..1");

        conEnDiagrama += relacion(diag, C.CE_CrearTransaccionRequest, C.CE_CrearTransaccionDTO, "mapeo del DTO", "Dependency", "uses", "cuerpo", "dto", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_CrearTransaccionRequest, C.CE_Venta, "venta a pagar", "Association", "", "cuerpo", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_CrearTransaccionDTO, C.CE_Venta, "venta del DTO", "Association", "", "dto", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_SimularPasarelaRequest, C.CE_TransaccionPago, "transaccion simulada", "Association", "", "cuerpo", "transaccion", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_WebhookRequest, C.CE_TransaccionPago, "transaccion notificada", "Association", "", "cuerpo", "transaccion", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_TransaccionPago, C.CE_Venta, "venta cobrada", "Association", "", "transaccion", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_TransaccionPago, C.CE_Usuario, "usuario pagador", "Association", "", "transaccion", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_VentaItem, "items de la venta", "Composition", "composition", "venta", "item de venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Carrito, "carrito de origen", "Association", "", "venta", "carrito", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Sucursal, "sucursal de la venta", "Association", "", "venta", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaItem, C.CE_Venta, "venta del item", "Composition", "composition", "item de venta", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Carrito, C.CE_Usuario, "dueño del carrito", "Association", "", "carrito", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Carrito, C.CE_Sucursal, "sucursal del carrito", "Association", "", "carrito", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_Rol, "roles del usuario", "Association", "", "usuario", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_UsuarioRol, "asignaciones", "Composition", "composition", "usuario", "asignacion", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_Rol, C.CE_UsuarioRol, "usuarios del rol", "Association", "", "rol", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_InventarioStock, C.CE_Sucursal, "stock por sucursal", "Association", "", "stock", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_InventarioStock, "stock del movimiento", "Association", "", "movimiento", "stock", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_Sucursal, "sucursal del movimiento", "Association", "", "movimiento", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_Usuario, "usuario del movimiento", "Association", "", "movimiento", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_Venta, "venta del movimiento", "Association", "", "movimiento", "venta", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_BitacoraAuditoria, C.CE_Usuario, "usuario de la accion", "Association", "", "bitacora", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Comprobante, C.CE_Venta, "venta facturada", "Association", "", "comprobante", "venta", "1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("4 actores, 30 clases y " + TOTAL_REL + " relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (4), CTR_ controlador (2), SRV_ servicio (8), CE_ entidad o DTO (16).");
        N.push("");
        N.push("HALLAZGO CRITICO 1: NO HAY PASARELA. EL SERVIDOR SE FIRMA A SI MISMO.");
        N.push("");
        N.push("El caso describe el paso (c) como crear el pago en la pasarela en modo pruebas, con un");
        N.push("intent o un checkout de sandbox, usando las credenciales del entorno:");
        N.push("");
        N.push("  PAYMENT_PUBLIC_KEY / PRIVATE_KEY");
        N.push("");
        N.push("Eso no existe. En las 784 lineas del servicio no hay una sola llamada HTTP, ni un SDK,");
        N.push("ni un axios, ni un fetch, ni una URL de pasarela, ni lectura de ninguna API key. El");
        N.push("identificador de la transaccion en la pasarela se inventa aqui:");
        N.push("");
        N.push("  const idTransaccionPasarela = `SBX-${randomUUID()}`;");
        N.push("");
        N.push("y el checkout_url que recibe el cliente apunta al propio frontend:");
        N.push("");
        N.push("  checkout_url: `${FRONTEND_URL}/sandbox-pago?tx=${idTransaccion}`");
        N.push("");
        N.push("o sea que la pantalla de la pasarela es la pagina SandboxPago.tsx del proyecto, que se");
        N.push("presenta ella misma como la pasarela:");
        N.push("");
        N.push("  'Estás en la página simulada de la pasarela de pago (CU35). Somos la pasarela:");
        N.push("   al elegir un resultado notificamos a la...'");
        N.push("");
        N.push("Para un trabajo academico de sandbox esto es una decision razonable y esta bien");
        N.push("documentada en el propio texto de la pagina. Lo que hay que registrar es que las");
        N.push("consecuencias no son las que dice el caso: no hay un tercero externo a quien");
        N.push("preguntarle, y por eso las validaciones E5, E6 y E7 no se pueden probar de verdad.");
        N.push("");
        N.push("HALLAZGO CRITICO 2: E5 Y E7 SON INALCANZABLES POR EL CAMINO NORMAL.");
        N.push("");
        N.push("La firma se calcula con:");
        N.push("");
        N.push("  createHmac('sha256', FIRMA_SECRETO).update(`${idTransaccion}.${monto}.${estado}`).digest('hex')");
        N.push("");
        N.push("y el flujo de aprobacion es este:");
        N.push("");
        N.push("  SandboxPago.confirmar('Aprobado')");
        N.push("    -> POST /pagos/sandbox/gateway");
        N.push("       -> simularPasarela lee ventas.total de la base");
        N.push("          y monta la notificacion CON EL MONTO DE LA VENTA (linea 528)");
        N.push("       -> y la firma con el MISMO secreto (linea 542)");
        N.push("    -> procesarWebhook (linea 545)");
        N.push("       -> calcula la firma esperada y la compara con la que acaba de crear");
        N.push("");
        N.push("Es una comprobacion de si uno mismo esta de acuerdo consigo mismo. Consecuencias:");
        N.push("");
        N.push("  - E5, el monto inconsistente, no puede ocurrir por esta via: el monto notificado se");
        N.push("    lee de ventas.total, que es el mismo valor que se comparo en la linea 591. Solo")
        N.push("    se llega si alguien llama a POST /pagos/webhook a mano con otro monto.");
        N.push("  - E7, la firma invalida, tampoco: la firma que se verifica es la que se genero dos");
        N.push("    lineas antes. Solo falla por una llamada directa al webhook.");
        N.push("  - E6, el 504, no es un timeout: lo produce el valor 'no_responde' que el propio");
        N.push("    cliente elige en un boton de SandboxPago.tsx (linea 206).");
        N.push("");
        N.push("Las tres excepciones del caso existen en el codigo, pero las tres son");
        N.push("inalcanzables por la interfaz. Lo que si queda es que el endpoint de simulacion es el");
        N.push("que realmente decide el resultado del pago, y eso es una decision de seguridad que");
        N.push("conviene tener presente: en produccion, ese endpoint no puede existir.");
        N.push("");
        N.push("Y una nota a favor: simularPasarela NO es libre. Pasa por exigirPermisoPagar, o sea");
        N.push("que con el permiso roto de siempre solo el Administrador puede apretar Aprobado. El");
        N.push("cliente no puede aprobar su propio pago. Es una salvaguarda accidental, no un");
        N.push("diseño, pero evita el agujero mas grande.");
        N.push("");
        N.push("HALLAZGO CRITICO 3: EL SECRETO TIENE UN RESPALDO DENTRO DEL CODIGO FUENTE.");
        N.push("");
        N.push("  const FIRMA_SECRETO = process.env.PAGO_WEBHOOK_SECRET ?? 'sandbox-secreto-cu35';");
        N.push("");
        N.push("Si la variable de entorno no esta definida, el secreto pasa a ser la cadena");
        N.push("sandbox-secreto-cu35, que esta escrita en el repositorio. Con ese secreto cualquiera");
        N.push("que lea el codigo puede calcular una firma valida para cualquier estado y llamar a");
        N.push("POST /pagos/webhook, que es la unica de las cinco rutas sin guard:");
        N.push("");
        N.push("  @Post('webhook')");
        N.push("  @HttpCode(HttpStatus.OK)");
        N.push("  procesarWebhook(@Body() body: WebhookRequest, @Req() request: Request) {");
        N.push("");
        N.push("y ahi aprueba o rechaza la transaccion que quiera, sin sesion. El caso da por hecho");
        N.push("un secreto compartido en el .env, y el .env no es obligatorio: el fallback hace que");
        N.push("el sistema parezca seguro en un despliegue mal configurado. Un fallo de este tipo");
        N.push("deberia ser un error de arranque, no un valor por defecto.");
        N.push("");
        N.push("Y la firma no lleva ni un nonce, ni una marca de tiempo, ni el id_venta, ni el");
        N.push("proveedor. O sea que la misma terna (id, monto, estado) produce siempre la misma");
        N.push("firma y es reproducible para siempre. Lo unico que impide que un webhook");
        N.push("capturado se procese dos veces es el estado de la transaccion, o sea E9, no la firma.");
        N.push("La firma de verificar es correcta en su forma, con timingSafeEqual y la");
        N.push("comparacion de longitudes, pero lo que aporta es nulo frente a la repeticion.");
        N.push("");
        N.push("consultarEstado devuelve la firma del estado actual en la respuesta (linea 476). No");
        N.push("permite forjar otro estado, porque es un HMAC y la clave no se deduce de un");
        N.push("resultado, asi que no es una fuga. Pero si delata que la firma es determinista y sin");
        N.push("caducidad, que es justo lo que hace que un replay sea posible.");
        N.push("");
        N.push("HALLAZGO CRITICO 4: E8 ES INVIABLE. EL CLIENTE NO PUEDE REINTENTAR.");
        N.push("");
        N.push("El caso dice que si el pago se rechaza la venta sigue Pendiente y el Cliente puede");
        N.push("reintentar, y que al volver a confirmar el checkout se inicia una transaccion nueva.");
        N.push("Eso no puede ocurrir. En crearTransaccion hay un segundo bloqueo ademas del estado:");
        N.push("");
        N.push("  const txExistente = await this.dataSource.query(");
        N.push("    `SELECT id_transaccion FROM transacciones_pago WHERE id_venta = $1 LIMIT 1`, ...");
        N.push("  if (Array.isArray(txExistente) && txExistente.length > 0) {");
        N.push("    throw new ConflictException('La venta ya fue procesada.');");
        N.push("  }");
        N.push("");
        N.push("Una vez que existe una transaccion para esa venta, no se puede crear otra. Ni");
        N.push("siquiera para reintentar un pago rechazado. Y transacciones_pago no tiene indice");
        N.push("unico en id_venta (schema.sql:440), o sea que el unico sitio donde se exige esa");
        N.push("unicidad es esa consulta, que es ademas un TOCTOU: dos peticiones simultaneas");
        N.push("pueden ver cero filas e insertar las dos.");
        N.push("");
        N.push("El resultado es que la venta se queda en Pendiente con una transaccion Rechazada, y");
        N.push("no hay ninguna accion que la saque de ahi. Volver al checkout da 409 La venta ya");
        N.push("fue procesada., y la unica via es el endpoint de caja, que es de otro caso de uso.");
        N.push("");
        N.push("Ojo que este 409 tambien es lo que protege de pagos dobles, asi que el guard no es");
        N.push("un descuido: es la unica defensa. Lo que falta es el camino de reintento, que es lo");
        N.push("que el caso promete. La solucion tipica es permitir la transaccion nueva cuando la");
        N.push("anterior quedo Rechazada, y poner el indice unico parcial sobre el estado Pendiente.");
        N.push("");
        N.push("HALLAZGO 5: EL DESCUENTO DE INVENTARIO NO LO HACE EL SERVICIO, LO HACE EL TRIGGER.");
        N.push("");
        N.push("El caso dice que se hace inventario_stock.cantidad_disponible = cantidad_disponible -");
        N.push("cantidad y cantidad_vendida = cantidad_vendida + cantidad. Solo la segunda existe.");
        N.push("");
        N.push("  UPDATE inventario_stock");
        N.push("   SET cantidad_vendida = cantidad_vendida + $2");
        N.push("   WHERE id_ptc = $1 AND id_sucursal = $3");
        N.push("");
        N.push("El disponible lo descuenta el trigger fn_aplicar_movimiento_inventario");
        N.push("(schema.sql:628), que es BEFORE INSERT sobre movimientos_inventario:");
        N.push("");
        N.push("  NEW.stock_anterior := v_disponible;");
        N.push("  NEW.stock_posterior := v_disponible + NEW.cantidad;");
        N.push("  NEW.fecha := NOW();");
        N.push("  INSERT INTO inventario_stock (id_ptc, id_sucursal, cantidad_disponible)");
        N.push("  VALUES (NEW.id_ptc, NEW.id_sucursal, NEW.cantidad)");
        N.push("  ON CONFLICT (id_ptc, id_sucursal)");
        N.push("  DO UPDATE SET cantidad_disponible = inventario_stock.cantidad_disponible + NEW.cantidad;");
        N.push("");
        N.push("Y el servicio inserta el movimiento con la cantidad en negativo:");
        N.push("");
        N.push("  INSERT INTO movimientos_inventario (id_ptc, id_sucursal, tipo_movimiento, cantidad,");
        N.push("                                referencia, id_usuario, id_venta)");
        N.push("  VALUES ($1, $2, 'Venta', $3, $4, $5, $6)");
        N.push("  // con -cantidad en $3 y la referencia VNT-<id_venta>");
        N.push("");
        N.push("Tres cosas que se siguen de ahi y que conviene tener presentes. Una: el");
        N.push("cantidad_reservada no lo toca ni el trigger ni el servicio, igual que en CU22 y");
        N.push("CU29. Dos: el trigger pisa la fecha con NOW(), asi que el movimiento no se puede");
        N.push("registrar con fecha retroactiva aunque se quiera. Y tres, la mas importante: si");
        N.push("la fila de inventario_stock no existe, el INSERT del trigger crea una con");
        N.push("cantidad_disponible igual a la cantidad, o sea NEGATIVA. Lo que evita ese");
        N.push("desastre es la revalidacion de la linea 683, que compara disponible contra");
        N.push("cantidad y aborta con 409 antes de insertar nada. O sea que la seguridad de ese");
        N.push("trigger la pone el servicio, no el trigger.");
        N.push("");
        N.push("HALLAZGO 6: EL NUCLEO ESTA BIEN HECHO. ESTE CASO SI TOMA LAS MEDIDAS.");
        N.push("");
        N.push("Es lo primero que hay que decir de CU35, porque contrasta con casi todo lo demas.");
        N.push("");
        N.push("  - La venta se bloquea con SELECT ... FOR UPDATE (linea 650) y cada fila de stock");
        N.push("    tambien, una por una (linea 670). O sea que dos aprobaciones simultaneas del");
        N.push("    mismo pago se serializan de verdad. Es la segunda vez que aparece FOR UPDATE en");
        N.push("    el proyecto, y las dos estan en este servicio: la otra es procesarPagoCaja, de");
        N.push("    CU37. El checkout de CU34 no lo usa, que es justo por donde cabe la carrera.");
        N.push("  - E9 esta bien implementado: si el estado ya no es Pendiente, se devuelve el");
        N.push("    estado actual con reprocesado: false y se sale, sin tocar nada.");
        N.push("  - Los tres UPDATE de estado llevan la guarda AND estado = 'Pendiente', o sea un");
        N.push("    compare-and-set correcto en las tres ramas: aprobado, rechazado por pasarela y");
        N.push("    rechazado por monto.");
        N.push("  - La revalidacion de stock (linea 683) ocurre DENTRO de la transaccion, con las");
        N.push("    filas ya bloqueadas, que es el unico sitio donde tiene sentido comprobar algo.");
        N.push("  - El trigger del inventario hace que el descuento sea imposible de saltarse");
        N.push("    saltandose el servicio, porque va atado al movimiento.");
        N.push("");
        N.push("HALLAZGO 7: EL COMPROBANTE SE PIDE FUERA DE LA TRANSACCION Y SE PIERDE.");
        N.push("");
        N.push("  linea 721  transaction(commit)");
        N.push("  linea 724  await this.registrarPreferenciasDeVenta(...)");
        N.push("  linea 727  const comprobante = await this.comprobantesService.generar(...)");
        N.push("");
        N.push("Las tres quedan fuera. Preferences tiene su propio try/catch con un comentario que");
        N.push("explica que nunca debe impedir el pago, y esa es la decision correcta. El");
        N.push("comprobante no: si generar falla, el webhook responde 500 con el pago ya");
        N.push("aprobado, la venta ya Completada y el stock ya descontado. Y si la pasarela");
        N.push("reintenta el webhook, E9 lo corta con reprocesado: false y el comprobante no se");
        N.push("vuelve a pedir nunca. Se queda pagado, descontado y sin factura, de forma permanente.");
        N.push("");
        N.push("Y ademas generar todavia no funciona, por el hallazgo que viene.");
        N.push("");
        N.push("HALLAZGO 8: CU38 LEE LA MISMA COLUMNA QUE NO EXISTE. EL PAGO TERMINA EN 500.");
        N.push("");
        N.push("  SELECT v.id_venta, ..., p.porcentaje_iva");
        N.push("   FROM ventas v ... GROUP BY v.id_venta, p.porcentaje_iva LIMIT 1");
        N.push("");
        N.push("Es la septima aparicion de porcentaje_iva, y la primera que se ve desde un modulo");
        N.push("distinto. La cadena completa queda asi:");
        N.push("");
        N.push("  CU34  POST /ventas/checkout    -> 42703, la venta no se crea");
        N.push("  CU35  POST /pagos/transacciones -> la venta no existe, 404");
        N.push("  CU35  POST /pagos/webhook        -> 42703 en generar, 500 con el pago aprobado");
        N.push("  CU38  GET  comprobante            -> 42703, no hay documento");
        N.push("");
        N.push("O sea que arreglar el checkout sin arreglar el comprobante cambia el fallo de sitio");
        N.push("pero no lo quita: el pago pasaria a aprobarse y a descontar stock, y el comprobante");
        N.push("seguiria fallando, con el efecto irreversible que acaba de describir el hallazgo 7.");
        N.push("El GROUP BY ademas tiene un problema propio: agrupa por la tasa de IVA y luego");
        N.push("hace LIMIT 1, asi que con dos prendas de tasas distintas elegira una de las dos");
        N.push("para pintar el PDF. Es un bug que sigue latente aunque la columna exista.");
        N.push("");
        N.push("HALLAZGO 9: LA BITACORA ES LA UNICA FUENTE DEL NIT Y DE LA RAZON SOCIAL.");
        N.push("");
        N.push("En CU34 se vio que nit_cliente y razon_social no se guardan en ventas: se descartan");
        N.push("y solo llegan a bitacora_auditoria.new_data. Ahora se ve para que se hace eso.");
        N.push("El comprobante los recupera de ahi:");
        N.push("");
        N.push("  SELECT new_data->>'nit_cliente' AS nit_cliente, new_data->>'razon_social' AS razon_social");
        N.push("   FROM bitacora_auditoria");
        N.push("   WHERE tabla_afectada = 'ventas' AND id_registro = $1 AND accion_sql = 'INSERT'");
        N.push("   ORDER BY id_bitacora DESC LIMIT 1");
        N.push("");
        N.push("  const tipo = nitCliente && razonSocial ? 'FACTURA' : 'BOLETA';");
        N.push("");
        N.push("Es decir, la bitacora de auditoria no es un registro de auditoría: es la base de");
        N.push("datos de la facturacion. Y eso tiene tres consecuencias:");
        N.push("");
        N.push("  - Si la escritura de la bitacora falla, que en CU34 puede pasar porque esta fuera");
        N.push("    de la transaccion, el comprobante sale como BOLETA para un cliente que si dio su");
        N.push("    NIT. No hay error, hay un documento fiscal equivocado.");
        N.push("  - Los dos modulos se atan por una clave de texto dentro de un JSONB. No hay tipo, no");
        N.push("    hay interfaz, no hay nada que avise si alguien renombra nit_cliente en uno de los");
        N.push("    dos lados. El fallo seria silencioso y total.");
        N.push("  - Si alguna vez se reintenta el INSERT de la venta, ORDER BY id_bitacora DESC se");
        N.push("    queda con la fila mas reciente, lo cual es razonable, pero depende de que el");
        N.push("    campo id_bitacora sea monotono, y lo es porque es SERIAL.");
        N.push("");
        N.push("La solucion de verdad es una columna nit_cliente en ventas, que es donde la tabla");
        N.push("comprobantes ya la tiene. Alguien la escribio ahi y no en ventas.");
        N.push("");
        N.push("HALLAZGO 10: E4 TIENE DOS 409 Y SOLO UNO ESTA EN EL CODIGO COMO DICE EL CASO.");
        N.push("");
        N.push("  linea 147  if (venta.estado.toUpperCase() !== 'PENDIENTE') -> 'La venta ya fue procesada.'");
        N.push("  linea 155  if (txExistente.length > 0)                    -> 'La venta ya fue procesada.'");
        N.push("");
        N.push("Los dos son correctos y el segundo es el que no esta en el caso. Y el 404 tambien");
        N.push("tiene dos caminos, uno por id_venta invalido (linea 123) y otro por venta ajena o");
        N.push("inexistente (linea 145), con el mismo texto, lo cual cumple lo que el caso pide de");
        N.push("no revelar la existencia. Bien hecho.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - El permiso es el mismo realizar_venta inexistente de CU33 y CU34, cuarta vez, y");
        N.push("    con dos funciones distintas que comparan exactamente lo mismo: exigirPermisoPagar");
        N.push("    y exigirPermisoCaja, con mensajes diferentes. La palabra realizar_venta no es el");
        N.push("    permiso de ninguno de los dos mensajes.");
        N.push("  - cargarPermisos trae el mismo const [fila] sobre un JOIN por rol, y no son tres");
        N.push("    copias: el mismo JOIN usuarios_roles con const [fila] esta replicado en 18");
        N.push("    servicios, o sea en todos los que hay. Carrito, catalogos, productos, temporadas,");
        N.push("    compras, comprobantes, ajustes, alertas, existencias, kardex, pagos, proveedores,");
        N.push("    recomendaciones, reportes de voz, reservas, respaldos, sesiones-ra y ventas. Es");
        N.push("    el unico defecto copiado a todo el proyecto, y cada copia arrastra el mismo");
        N.push("    problema de quedarse con la mitad de los permisos del usuario. Corregirlo en un");
        N.push("    solo sitio no alcanza: habria que tocar las 18, y de paso extraer un servicio de");
        N.push("    permisos y una funcion de exigir permiso, que hoy son codigo repetido.");
        N.push("  - sucursalDelEmpleado en pagos NO filtra por fecha_baja, al contrario que la de");
        N.push("    SRV_VentasService, que si lo hace con AND ue.fecha_baja IS NULL. O sea que un");
        N.push("    empleado dado de baja conserva su sucursal aqui. Y ademas lanza el mismo texto");
        N.push("    que exigirPermisoCaja, con lo que un fallo de asignacion y un fallo de permiso");
        N.push("    son indistinguibles para el usuario.");
        N.push("  - La comparacion de E5 es Number(montoNotificado) !== Number(venta.total), una");
        N.push("    igualdad estricta de flotantes sobre dinero. Con DECIMAL(12,2) y el valor leido");
        N.push("    de la propia base no hay problema, pero si algun dia el monto llega de una");
        N.push("    pasarela de verdad habria que comparar a centimos, no con !==.");
        N.push("  - SandboxPago.tsx tiene un boton que, tras un rechazo, ofrece volver a Aprobado.");
        N.push("    O sea que la interfaz SI ofrece el reintento que el hallazgo 4 dice que el backend");
        N.push("    no permite. El boton llama a simularPasarela otra vez sobre la misma");
        N.push("    transaccion, que como esta en Rechazado sale por E9 con reprocesado: false, o");
        N.push("    sea que el boton no hace nada y la pantalla no cambia. El cliente pulsa y no ve");
        N.push("    ningun feedback de por que.");
        N.push("  - El toast que menciona el caso no existe como toast. SandboxPago.tsx no pinta");
        N.push("    ningun aviso global, solo un estado local de la pagina. Y el proyecto no tiene");
        N.push("    ningun modulo de notificaciones: no hay carpeta, no hay servicio y el modulo de");
        N.push("    pagos no importa nada de eso. Asi que ese texto de Pago aprobado. Gracias por tu");
        N.push("    compra! solo puede existir como rotulo en pantalla.");
        N.push("  - SandboxPago.tsx se identifica a si misma como la pasarela y ofrece tres");
        N.push("    botones: Aprobado, Rechazado y no_responde. Es una pantalla de pruebas");
        N.push("    assumida como tal, montada en una ruta de producto (/sandbox-pago) sin ninguna");
        N.push("    proteccion. Quien llegue ahi ve el boton de Aprobado.");
        N.push("  - El flujo de caja de este mismo servicio, procesarPagoCaja, es de CU37 y tiene su");
        N.push("    propio DTO con monto_recibido, calculo de vuelto y faltante, y tambien su");
        N.push("    propio permiso. Comparte el servicio pero no el caso.");
        N.push("  - Este modulo si respeta los prefijos SRV_ y CTR_ en los nombres de archivo.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU35 - PROCESAR PAGO CON PASARELA - INFORME");
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
    msg = msg + "CU35 - Procesar pago con pasarela" + SALTO + SALTO;
    msg = msg + "NO hay pasarela: el servidor se firma a si mismo y el" + SALTO;
    msg = msg + "checkout_url apunta a SandboxPago.tsx del propio front." + SALTO;
    msg = msg + "El secreto tiene fallback en el codigo fuente." + SALTO + SALTO;
    msg = msg + "Clases: 30    Actores: 4    Relaciones: " + TOTAL_REL + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de " + TOTAL_ATR + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de " + TOTAL_OPE + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de " + TOTAL_REL + SALTO;
    if (conEnDiagrama < TOTAL_REL) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "BIEN: usa FOR UPDATE y E9 con compare-and-set." + SALTO;
    msg = msg + "MAL: E8 es inviable, no se puede reintentar el pago." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU35 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU35 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU35", 0); } catch (e3) { }
}
