// ================================================================
// CU39 - ACTUALIZAR INVENTARIO TRAS VENTA (AUTOMATICO)
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   api/src/modulos/pagos/SRV_PagosService.ts:670   lee cantidad_reservada y NO la usa
//   api/src/modulos/pagos/SRV_PagosService.ts:682   compara solo cantidad_disponible
//   api/src/modulos/pagos/SRV_PagosService.ts:711   UPDATE solo cantidad_vendida
//   api/src/modulos/pagos/SRV_PagosService.ts:716   INSERT movimiento con cantidad negativa
//   api/src/modulos/pagos/SRV_PagosService.ts:299   la rama de caja lee solo disponible
//   api/src/modulos/reservas/SRV_ReservasService.ts:1110  SALIDA-RESERVA con cantidad negativa
//   api/src/modulos/reservas/SRV_ReservasService.ts:1117  cantidad_reservada += cantidad
//   api/src/modulos/reservas/SRV_ReservasService.ts:709   doble conteo en liberarStockReserva
//   api/src/modulos/reservas/SRV_ReservasService.ts:979   la copia correcta
//   api/src/modulos/reservas/SRV_ReservasService.ts:330   estado_stock SOLO se lee
//   api/src/modulos/inventario/inventario.module.ts:15   4 servicios, ninguno es InventarioService
//   api/src/modulos/inventario/SRV_KardexService.ts:247   lee movimientos_inventario directo
//   api/src/modulos/inventario/SRV_AlertasService.ts:206  alerta por stock_minimo_alert
//   schema.sql:628  fn_aplicar_movimiento_inventario, el que de verdad descuenta
//   schema.sql:662  sp_registrar_venta MUERTA: si resta cantidad_reservada
//   schema.sql:237  producto_talla_color.estado_stock, que nadie actualiza nunca
//   InventarioService NO EXISTE en ningun archivo del proyecto
//   aplicarVenta NO EXISTE: cero referencias en las 60 clases del backend
//   api-server.err.log NO EXISTE y pagos ni ventas no tienen Logger
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
var TOTAL_REL = 61;
var TOTAL_ATR = 89;
var TOTAL_OPE = 26;

var DEF = [
    ["IU_AdminCaja", "EXISTE. web/src/pages/admin/AdminCaja.tsx", "la unica pantalla que ve el resultado: el 409 de E1",
     [["ventaOk", "Object = null", VIS_PUB], ["error", "String = null", VIS_PUB], ["enviando", "Boolean", VIS_PUB]],
     [["procesarVenta", "void", ["evento"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["CTR_PagosController", "EXISTE. pagos/CTR_Pagos.ts", "dispara el descuento: caja en 97 y webhook en 142",
     [["pagosService", "PagosService", VIS_PRI]],
     [["procesarPagoCaja", "Object", ["currentUser", "body", "request"], VIS_PUB], ["procesarWebhook", "Object", ["body", "request"], VIS_PUB]]],

    ["CTR_KardexController", "EXISTE. inventario/CTR_Kardex.ts", "consulta los movimientos que este caso escribe",
     [["kardexService", "KardexService", VIS_PRI]],
     [["consultar", "Array", ["usuario", "filtros"], VIS_PUB]]],

    ["CTR_AlertasController", "EXISTE. inventario/CTR_Alertas.ts", "las alertas leen el disponible que aqui se descuenta",
     [["alertasService", "AlertasService", VIS_PRI]],
     [["listar", "Array", ["usuario"], VIS_PUB]]],

    ["CTR_ExistenciasController", "EXISTE. inventario/CTR_Existencias.ts", "las existencias consolidadas leen lo mismo",
     [["existenciasService", "ExistenciasService", VIS_PRI]],
     [["consultar", "Array", ["usuario", "filtros"], VIS_PUB]]],

    ["SRV_PagosService", "EXISTE. pagos/SRV_PagosService.ts", "el descuento esta incrustado, no en un servicio aparte",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI], ["comprobantesService", "ComprobantesService", VIS_PRI], ["preferenciasService", "PreferenciasService", VIS_PRI]],
     [["procesarPagoCaja", "Object", ["usuario", "dto", "request"], VIS_PUB], ["procesarWebhook", "Object", ["dto", "request"], VIS_PUB], ["procesarResultado", "Object", ["idTransaccion", "estado", "montoNotificado", "detalle", "request"], VIS_PRI], ["simularPasarela", "Object", ["usuario", "dto", "request"], VIS_PUB]]],

    ["SRV_TrgMovimientoInventario", "EXISTE. schema.sql:628, TRIGGER BEFORE INSERT", "el que descuenta de verdad, sin que nadie lo pida",
     [["v_disponible", "Integer", VIS_PRI]],
     [["fn_aplicar_movimiento_inventario", "void", ["NEW"], VIS_PUB], ["trg_movimiento_inventario", "Trigger", [], VIS_PUB]]],

    ["SRV_ReservasService", "EXISTE. reservas/SRV_ReservasService.ts", "el unico que escribe cantidad_reservada, en 3 sitios",
     [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI], ["logger", "Logger", VIS_PRI]],
     [["crearReserva", "Reserva", ["usuario", "dto", "request"], VIS_PUB], ["liberarStockReserva", "Number", ["idReserva", "numero", "usuario", "request"], VIS_PUB], ["cancelar", "Object", ["usuario", "id", "request"], VIS_PUB], ["finalizarReserva", "Object", ["usuario", "id", "request"], VIS_PUB], ["prepararReserva", "Object", ["usuario", "idReserva", "request"], VIS_PUB]]],

    ["SRV_KardexService", "EXISTE. inventario/SRV_KardexService.ts (CU23)", "lee movimientos_inventario con su propia consulta",
     [["dataSource", "DataSource", VIS_PRI], ["logger", "Logger", VIS_PRI]],
     [["consultarMovimientos", "Array", ["usuario", "filtros"], VIS_PUB], ["consultar", "Object", ["usuario", "filtros"], VIS_PUB]]],

    ["SRV_AlertasService", "EXISTE. inventario/SRV_AlertasService.ts (CU25)", "alerta por disponible contra stock_minimo_alert",
     [["dataSource", "DataSource", VIS_PRI], ["logger", "Logger", VIS_PRI]],
     [["listar", "Array", ["usuario"], VIS_PUB], ["configurarMinimo", "Object", ["usuario", "idStock", "stockMinimo", "request"], VIS_PUB]]],

    ["SRV_ExistenciasService", "EXISTE. inventario/SRV_ExistenciasService.ts (CU26)", "sin alcance por sucursal, como se documento",
     [["dataSource", "DataSource", VIS_PRI], ["logger", "Logger", VIS_PRI]],
     [["consultar", "Array", ["usuario", "filtros"], VIS_PUB]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "las dos ramas del cobro usan transaction",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "Object", ["callback"], VIS_PUB]]],

    ["CE_InventarioStock", "EXISTE. inventario_stock (schema.sql:302)", "el disponible lo baja el trigger, el reservado el reservas",
     [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer = UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer = UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_reservada", "Integer = 0", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB], ["stock_minimo_alert", "Integer = 0", VIS_PUB]],
     []],

    ["CE_MovimientoInventario", "EXISTE. movimientos_inventario (schema.sql:421)", "el kardex; la fecha y los saldos los pone el trigger",
     [["id_movimiento", "Integer = PK", VIS_PRI], ["id_ptc", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["tipo_movimiento", "String = 30, Venta o SALIDA-RESERVA", VIS_PUB], ["cantidad", "Integer = negativa al salir", VIS_PUB], ["stock_anterior", "Integer = lo pone el trigger", VIS_PUB], ["stock_posterior", "Integer = lo pone el trigger", VIS_PUB], ["referencia", "String = 120, VNT-id_venta", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_orden_compra", "Integer = nullable", VIS_PUB], ["id_venta", "Integer", VIS_PUB], ["id_reserva", "Integer = nullable, la venta lo deja NULL", VIS_PUB], ["fecha", "Timestamp = el trigger la pisa con NOW()", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. producto_talla_color (schema.sql:237)", "estado_stock NO lo actualiza nadie en el proyecto",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB], ["estado_stock", "String = Disponible, congelado", VIS_PUB]],
     []],

    ["CE_Venta", "EXISTE. ventas (schema.sql:384)", "la sucursal del descuento sale de aqui, no de la del cajero",
     [["id_venta", "Integer = PK", VIS_PRI], ["id_cliente", "Integer = nullable", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["modalidad", "String = 20", VIS_PUB], ["metodo_pago", "String = 30", VIS_PUB], ["total", "Decimal(12,2)", VIS_PUB], ["estado", "String = 20", VIS_PUB], ["fecha_venta", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_VentaItem", "EXISTE. venta_items (schema.sql:399)", "el descuento sale de cantidad, una linea por item",
     [["id_venta_item", "Integer = PK", VIS_PRI], ["id_venta", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["precio_unitario", "Decimal(10,2)", VIS_PUB], ["subtotal", "Decimal(12,2)", VIS_PUB]],
     []],

    ["CE_Reserva", "EXISTE. reservas (schema.sql:301)", "5 estados, ninguno enlazado a una venta",
     [["id_reserva", "Integer = PK", VIS_PRI], ["id_cliente", "Integer", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["fecha_reserva", "Date", VIS_PUB], ["hora_reserva", "Time", VIS_PUB], ["estado", "String = 20, Solicitada", VIS_PUB], ["id_encargado", "Integer = nullable", VIS_PUB], ["fecha_creacion", "Timestamp = NOW()", VIS_PUB], ["fecha_preparada", "Timestamp = nullable", VIS_PUB], ["fecha_atendida", "Timestamp = nullable", VIS_PUB]],
     []],

    ["CE_ReservaItem", "EXISTE. reserva_items (schema.sql:314)", "la prenda reservada, que la venta nunca consulta",
     [["id_reserva_item", "Integer = PK", VIS_PRI], ["id_reserva", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer = 1", VIS_PUB]],
     []],

    ["CE_Sucursal", "EXISTE. sucursales", "el stock es por prenda y sucursal, con indice unico",
     [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["estado", "String = Activa", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. usuarios (schema.sql:32)", "el id_usuario que se graba en el movimiento",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120 UNIQUE", VIS_PRI], ["estado", "String = Pendiente", VIS_PUB]],
     []],

    ["CE_SpRegistrarVenta", "EXISTE. schema.sql:662, FUNCION PLPGSQL. CERO llamadas", "la version que si resta lo reservado",
     [["p_id_usuario", "Integer", VIS_PUB], ["p_id_sucursal", "Integer", VIS_PUB], ["p_modalidad", "String", VIS_PUB], ["p_metodo_pago", "String", VIS_PUB], ["p_items", "JSONB", VIS_PUB], ["p_venta_id", "Integer = OUT", VIS_PUB], ["p_total", "Decimal(12,2) = OUT", VIS_PUB]],
     [["sp_registrar_venta", "void", ["p_id_usuario", "p_id_sucursal", "p_modalidad", "p_metodo_pago", "p_items"], VIS_PUB]]]
];

var ACTORES = [
    ["ACTOR_Sistema", "El backend, al completarse el pago", "no necesita sesion ni permiso"],
    ["ACTOR_Cajero", "Cajero que ve el resultado o el 409", "no escribe nada: el descuento es automatico"],
    ["ACTOR_Cliente", "Cliente cuya prenda se descuenta", "tampoco interviene"]
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
    if (mod == null) mod = buscarPaquete(cu, "4. Ventas y Pagos");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU39 - Análisis de clases");

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
        nota(act, ACTORES[a][1] + ".");
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
    try { diag = paq.Diagrams.AddNew("CU39 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
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

        conEnDiagrama += relacion(diag, actores[0], C.SRV_PagosService, "dispara el descuento", "Dependency", "uses", "sistema", "pagos", "0..*", "1");
        conEnDiagrama += relacion(diag, actores[0], C.SRV_TrgMovimientoInventario, "dispara el descuento real", "Dependency", "uses", "sistema", "trigger", "0..*", "1");
        conEnDiagrama += relacion(diag, actores[1], C.IU_AdminCaja, "ve el 409 o el ok", "Association", "", "cajero", "caja", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[2], C.CE_InventarioStock, "le descuentan su prenda", "Association", "", "cliente", "stock", "0..*", "1");

        conEnDiagrama += relacion(diag, C.IU_AdminCaja, C.CTR_PagosController, "cobra por HTTP", "Dependency", "uses", "caja", "pagos", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_AdminCaja, C.CE_Venta, "venta descontada", "Association", "", "caja", "venta", "1", "0..1");
        conEnDiagrama += relacion(diag, C.CTR_PagosController, C.SRV_PagosService, "servicio de pagos", "Association", "", "pagos", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_PagosController, C.CE_Venta, "venta que se descuenta", "Association", "", "pagos", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_KardexController, C.SRV_KardexService, "servicio de kardex", "Association", "", "kardex", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_KardexController, C.CE_MovimientoInventario, "movimientos devueltos", "Association", "", "kardex", "movimiento", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CTR_AlertasController, C.SRV_AlertasService, "servicio de alertas", "Association", "", "alertas", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_AlertasController, C.CE_InventarioStock, "stock que se vigila", "Dependency", "uses", "alertas", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CTR_ExistenciasController, C.SRV_ExistenciasService, "servicio de existencias", "Association", "", "existencias", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_ExistenciasController, C.CE_InventarioStock, "existencias consolidadas", "Dependency", "uses", "existencias", "stock", "1", "0..*");

        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.SRV_DataSource, "transaccion del cobro", "Dependency", "uses", "pagos", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_Venta, "venta a Completada", "Association", "", "pagos", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_VentaItem, "items a descontar", "Dependency", "uses", "pagos", "item de venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_InventarioStock, "bloquea y suma vendida", "Association", "", "pagos", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_MovimientoInventario, "movimiento tipo Venta", "Composition", "composition", "pagos", "movimiento", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_ProductoTallaColor, "estado_stock: no se toca", "Dependency", "uses", "pagos", "prenda", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_Usuario, "usuario del movimiento", "Association", "", "pagos", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PagosService, C.CE_Sucursal, "sucursal del descuento", "Dependency", "uses", "pagos", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_TrgMovimientoInventario, C.CE_MovimientoInventario, "se dispara en el INSERT", "Association", "", "trigger", "movimiento", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_TrgMovimientoInventario, C.CE_InventarioStock, "descuenta el disponible", "Association", "", "trigger", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReservasService, C.SRV_DataSource, "transaccion de la reserva", "Dependency", "uses", "reservas", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReservasService, C.CE_InventarioStock, "suma y resta cantidad_reservada", "Association", "", "reservas", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReservasService, C.CE_MovimientoInventario, "movimiento SALIDA-RESERVA", "Composition", "composition", "reservas", "movimiento", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReservasService, C.CE_Reserva, "reserva que bloquea stock", "Composition", "composition", "reservas", "reserva", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReservasService, C.CE_ReservaItem, "prendas reservadas", "Composition", "composition", "reservas", "item de reserva", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReservasService, C.CE_ProductoTallaColor, "filtra por estado_stock", "Dependency", "uses", "reservas", "prenda", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReservasService, C.CE_Venta, "nunca se enlaza con una venta", "Association", "", "reservas", "venta", "0..*", "0..1");
        conEnDiagrama += relacion(diag, C.SRV_KardexService, C.SRV_DataSource, "consulta de movimientos", "Dependency", "uses", "kardex", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_KardexService, C.CE_MovimientoInventario, "kardex leido directo", "Dependency", "uses", "kardex", "movimiento", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_KardexService, C.CE_InventarioStock, "saldos actuales", "Dependency", "uses", "kardex", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_AlertasService, C.SRV_DataSource, "consulta de alertas", "Dependency", "uses", "alertas", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_AlertasService, C.CE_InventarioStock, "compara disponible y minimo", "Dependency", "uses", "alertas", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_AlertasService, C.CE_ProductoTallaColor, "prenda de la alerta", "Dependency", "uses", "alertas", "prenda", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ExistenciasService, C.SRV_DataSource, "consulta de existencias", "Dependency", "uses", "existencias", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ExistenciasService, C.CE_InventarioStock, "suma por prenda", "Dependency", "uses", "existencias", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ExistenciasService, C.CE_Sucursal, "sin filtro por sucursal", "Dependency", "uses", "existencias", "sucursal", "0..*", "1");

        conEnDiagrama += relacion(diag, C.CE_InventarioStock, C.CE_ProductoTallaColor, "stock por prenda", "Association", "", "stock", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_InventarioStock, C.CE_Sucursal, "stock por sucursal", "Association", "", "stock", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_InventarioStock, "afecta al stock", "Association", "", "movimiento", "stock", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_ProductoTallaColor, "prenda del movimiento", "Association", "", "movimiento", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_Sucursal, "sucursal del movimiento", "Association", "", "movimiento", "sucursal", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_Usuario, "usuario del movimiento", "Association", "", "movimiento", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_Venta, "venta del movimiento", "Association", "", "movimiento", "venta", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_MovimientoInventario, C.CE_Reserva, "reserva del movimiento", "Association", "", "movimiento", "reserva", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Usuario, "sin relacion directa", "Dependency", "uses", "prenda", "usuario", "0..*", "0..*");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Usuario, "usuario de la venta", "Association", "", "venta", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Sucursal, "sucursal de la venta", "Association", "", "venta", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaItem, C.CE_Venta, "venta del item", "Composition", "composition", "item de venta", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaItem, C.CE_ProductoTallaColor, "prenda del item", "Association", "", "item de venta", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Reserva, C.CE_Usuario, "usuario de la reserva", "Association", "", "reserva", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Reserva, C.CE_Sucursal, "sucursal de la reserva", "Association", "", "reserva", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_ReservaItem, C.CE_Reserva, "reserva del item", "Composition", "composition", "item de reserva", "reserva", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_ReservaItem, C.CE_ProductoTallaColor, "prenda reservada", "Association", "", "item de reserva", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_SpRegistrarVenta, C.CE_InventarioStock, "disponible menos reservada", "Dependency", "uses", "procedimiento", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_SpRegistrarVenta, C.CE_Venta, "venta que crearia", "Composition", "composition", "procedimiento", "venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_SpRegistrarVenta, C.CE_VentaItem, "items que crearia", "Composition", "composition", "procedimiento", "item de venta", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_SpRegistrarVenta, C.CE_MovimientoInventario, "movimiento que crearia", "Composition", "composition", "procedimiento", "movimiento", "1", "0..*");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("3 actores, " + DEF.length + " clases y " + TOTAL_REL + " relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (1), CTR_ controlador (4), SRV_ servicio o trigger (7), CE_ entidad (" + (DEF.length - 12) + ").");
        N.push("");
        N.push("Es el primer caso sin ninguna clase de servicio propia, y no por decision del caso: no");
        N.push("existe. El caso entero esta construido sobre una clase que no esta en el proyecto.");
        N.push("");
        N.push("HALLAZGO CRITICO 1: InventarioService NO EXISTE. aplicarVenta TAMPOCO.");
        N.push("");
        N.push("El caso dice que se invoca InventarioService.aplicarVenta(id_venta) dentro de la misma");
        N.push("transaccion de la venta. Ninguna de las dos cosas esta en el codigo:");
        N.push("");
        N.push("  - El modulo inventario declara cuatro servicios: Ajustes, Alertas, Existencias y");
        N.push("    Kardex. No hay un quinto, y no hay ningun InventarioService.");
        N.push("  - La cadena aplicarVenta no aparece ni una vez en los 82 archivos TypeScript del");
        N.push("    backend. Ni como metodo, ni en un comentario, ni en un documento. Y InventarioService");
        N.push("    tampoco aparece, con cero coincidencias en los mismos 82 archivos.");
        N.push("");
        N.push("Lo que hay es lo contrario de una pieza encapsulada: la logica esta partida en tres");
        N.push("sitios, y el caso la describe como si fuera uno.");
        N.push("");
        N.push("  1. SRV_PagosService.procesarResultado, lineas 706-720   (pago digital de CU35)");
        N.push("  2. SRV_PagosService.procesarPagoCaja, lineas 336-350    (pago en caja de CU37)");
        N.push("  3. el trigger fn_aplicar_movimiento_inventario         (el que de verdad descuenta)");
        N.push("");
        N.push("Los dos primeros son copias casi literales del mismo bloque de quince lineas. Y el");
        N.push("tercero es el unico que ejecuta el UPDATE que el caso describe en su paso c. O sea");
        N.push("que el caso de uso, leido como documento, no se puede implementar tal cual: la unidad");
        N.push("de trabajo que propone no existe, y ademas no seria lo que hay que hacer, porque el");
        N.push("descuento no tiene un modulo propio sino codigo repetido dentro de pagos.");
        N.push("");
        N.push("El proyecto tiene 81 clases en el backend, asi que no es un modulo pequeno que se");
        N.push("haya dejado sin terminar. Es una pieza que no se escribio nunca.");
        N.push("HALLAZGO CRITICO 2: LAS PRENDAS RESERVADAS NO SE PUEDEN VENDER. Y ESTO ES NUEVO.");
        N.push("");
        N.push("Este es el hallazgo de este caso, y no lo habia salido en CU33 a CU38 porque la");
        N.push("logica de reservas vive en otro modulo.");
        N.push("");
        N.push("Cuando se crea una reserva, SRV_ReservasService hace las dos cosas a la vez:");
        N.push("");
        N.push("  linea 1110  INSERT INTO movimientos_inventario (..., 'SALIDA-RESERVA', -cantidad, ...)");
        N.push("  linea 1117  UPDATE inventario_stock SET cantidad_reservada = cantidad_reservada + $3");
        N.push("");
        N.push("El movimiento con cantidad negativa hace que el trigger baje cantidad_disponible, y");
        N.push("el UPDATE suma cantidad_reservada. O sea que reservar es un traslado correcto:");
        N.push("disponible -X, reservada +X. El total no cambia. Con una prenda:");
        N.push("");
        N.push("  inicial      disponible = 1   reservada = 0   vendida = 0");
        N.push("  tras reservar disponible = 0   reservada = 1   vendida = 0     total 1, correcto");
        N.push("");
        N.push("Ahora el paso (c) del caso dice que si la prenda venía reservada, el stock se");
        N.push("traslada de reservada a vendida. Eso es exactamente lo que hace falta y NO ESTA");
        N.push("ESCRITO EN NINGUN SITIO. El camino de venta nunca lee cantidad_reservada para decidir:");
        N.push("");
        N.push("  CU35, linea 670  SELECT id_ptc, cantidad_disponible, cantidad_reservada");
        N.push("                      FROM inventario_stock WHERE ... FOR UPDATE");
        N.push("  CU35, linea 682  if (disponible < cantidad) throw ...       // solo mira disponible");
        N.push("");
        N.push("O sea que CU35 LEE cantidad_reservada y no la usa nunca. Es una lectura muerta, y es");
        N.push("precisamente el campo que el caso necesita. Y CU37 ni siquiera lo lee:");
        N.push("");
        N.push("  CU37, linea 299  SELECT id_ptc, cantidad_disponible");
        N.push("                          FROM inventario_stock WHERE ... FOR UPDATE");
        N.push("");
        N.push("Las dos ramas del cobro difieren tambien en eso, que es la sexta version de un mismo");
        N.push("bloque. Y no hay ninguna consulta que cruce venta_items con reserva_items para saber si");
        N.push("la prenda comprada estaba reservada. El caso habla de un supuesto que el codigo no");
        N.push("puede comprobar.");
        N.push("");
        N.push("La consecuencia, siguiendo los numeros de arriba. El cliente reserva la ultima prenda");
        N.push("y luego la compra en la caja:");
        N.push("");
        N.push("  tras la venta   disponible = -1  reservada = 1  vendida = 1");
        N.push("");
        N.push("Pero no llega a ese -1, porque la revalidacion de la linea 312 ve disponible = 0, que");
        N.push("es menor que la cantidad, y aborta con 409:");
        N.push("");
        N.push("  El stock de este producto cambió. Disponible: 0. No se puede completar la venta.");
        N.push("");
        N.push("O sea que el resultado real es peor y mas visible que un stock negativo: la prenda");
        N.push("reservada es IMPOSIBLE DE COBRAR. El cliente se reserva algo, llega a la caja, y el");
        N.push("sistema le dice que no hay stock de un producto que esta apartado esperandolo a el.");
        N.push("Y el mensaje no menciona ni la prenda ni la reserva, asi que el cajero no tiene forma");
        N.push("de entenderlo. Y la reserva sigue en pie, con la unidad en cantidad_reservada, sin");
        N.push("posibilidad de que se consuma con una venta.");
        N.push("");
        N.push("Y hay un segundo efecto, este en la base y permanente: la unidad cuenta como");
        N.push("reservada, y como la venta nunca la libera, las existencias quedan sobrevaloradas de");
        N.push("forma acumulativa. Ademas la alerta de stock de CU25 compara solo disponible, o sea");
        N.push("que una prenda reservada con disponible = 0 dispara alerta de stock minimo aunque la");
        N.push("unidad exista y este commitment con el cliente. El aviso de existencias de CU26 hace");
        N.push("lo mismo, porque suma disponible sin resto.");
        N.push("");
        N.push("HALLAZGO 3: LA CORRECTA ESTA EN EL PROCEDIMIENTO MUERTO. OTRA VEZ.");
        N.push("");
        N.push("  SELECT cantidad_disponible - cantidad_reservada INTO v_stock");
        N.push("   FROM inventario_stock");
        N.push("   WHERE id_ptc = v_id_ptc AND id_sucursal = p_id_sucursal");
        N.push("   FOR UPDATE;");
        N.push("");
        N.push("Eso es sp_registrar_venta, schema.sql:687, con cero llamadas. Y es la unica linea del");
        N.push("proyecto donde alguien calculo lo que de verdad se puede vender: disponible menos lo");
        N.push("reservado. Ademas lleva FOR UPDATE. O sea que la version muerta de este caso es mas");
        N.push("correcta que las dos copias vivas, y es la tercera vez que pasa con este mismo");
        N.push("procedimiento, despues de CU36. Alguien escribio la regla bien en SQL, la dejo sin");
        N.push("el cableado, y el equivalente en TypeScript perdio la resta de lo reservado.");
        N.push("");
        N.push("HALLAZGO CRITICO 4: producto_talla_color.estado_stock NO LO ACTUALIZA NADIE.");
        N.push("");
        N.push("El paso (d) del caso dice que hay que recalcular estado_stock con tres reglas: si");
        N.push("disponible mas reservada es 0, Sin stock; si disponible es menor o igual que");
        N.push("stock_minimo_alert, Bajo; si no, Disponible. Es una regla razonable y bien");
        N.push("especificada, y no existe implementada en ninguna parte.");
        N.push("");
        N.push("En todo el backend hay exactamente dos menciones de la columna, y las dos son de");
        N.push("LECTURA, y ademas como filtro:");
        N.push("");
        N.push("  SRV_ReservasService.ts:330  WHERE ... AND ptc.estado_stock = 'Disponible'");
        N.push("  SRV_ReservasService.ts:383  WHERE ... AND ptc.estado_stock = 'Disponible'");
        N.push("");
        N.push("No hay ni un UPDATE de estado_stock en el proyecto. Con el DEFAULT de la columna");
        N.push("siendo Disponible y ninguna escritura, la columna esta CONGELADA en ese valor para");
        N.push("siempre. Sus consecuencias, todas en cadena:");
        N.push("");
        N.push("  - El estado Sin stock no existe jamas. El paso 5 del flujo principal, marcar la prenda");
        N.push("    sin stock cuando se agota, no ocurre nunca.");
        N.push("  - El estado Bajo tampoco. O sea que la parte de la regla que cruza con");
        N.push("    stock_minimo_alert, que es la unica que tendria sentido, es la parte muerta.");
        N.push("  - El filtro de CU36, ptc.estado_stock <> 'Sin stock', es entonces siempre cierto, y");
        N.push("    el filtro de reservas estado_stock = 'Disponible' es siempre cierto tambien. Los");
        N.push("    dos filtros parecen protectores y no descartan nada.");
        N.push("  - Las alertas de CU25 no leen esta columna, leen inventario_stock, asi que siguen");
        N.push("    funcionando por su cuenta. Pero si alguien las conectara con estado_stock, el");
        N.push("    sistema no tendria ninguna fuente de ese dato.");
        N.push("");
        N.push("La informacion para calcularla si esta disponible: el trigger deja stock_anterior y");
        N.push("stock_posterior en cada movimiento, y stock_minimo_alert esta en la misma fila. Es");
        N.push("una regla de tres lineas que nunca se escribio, y la unica forma de calcularla es");
        N.push("cruzando datos que ya estan ahi.");
        N.push("");
        N.push("HALLAZGO 5: LO QUE ESTA BIEN. EL BLOQUEO Y LA TRANSACCION SI CUMPLEN.");
        N.push("");
        N.push("El caso promete dos cosas que el codigo cumple de verdad, y conviene decirlo con la");
        N.push("misma claridad con que se dicen los fallos.");
        N.push("");
        N.push("  - El bloqueo de filas esta en las dos ramas. Las tres apariciones de FOR UPDATE");
        N.push("    del proyecto, mas la del procedimiento muerto, son las de inventario. CU35 bloquea");
        N.push("    la venta y cada stock (lineas 650 y 670), CU37 bloquea la venta y cada stock");
        N.push("    (lineas 279 y 302). O sea que E2, la carrera entre dos ventas, esta cubierta de");
        N.push("    verdad en las dos rutas de cobro.");
        N.push("  - El descuento, el cambio de estado de la venta y el movimiento van dentro de una");
        N.push("    transaccion en las dos ramas (CU37 276-351, CU35 647-721). O sea que E3, el");
        N.push("    rollback completo ante un fallo parcial, tambien se cumple: si el INSERT del");
        N.push("    movimiento falla, no queda venta cobrada sin descuento.");
        N.push("");
        N.push("Y el descuento nunca puede dejar el disponible negativo por la via del trigger,");
        N.push("porque las dos ramas revalidan antes de escribir y la revalidacion esta dentro de la");
        N.push("transaccion y con la fila bloqueada. La unica excepcion seria que el INSERT del");
        N.push("trigger creara la fila ausente con cantidad negativa, y eso lo impide justamente el");
        N.push("SELECT previo: si no hay fila, el stock llega como 0 y la comprobacion corta.");
        N.push("");
        N.push("HALLAZGO 6: LAS EXCEPCIONES DEL CASO NO SON LAS DEL CODIGO.");
        N.push("");
        N.push("  E1, el mensaje. El caso dice El stock de [prenda] (talla, color) se agotó mientras se");
        N.push("      procesaba la venta. El texto real, identico en CU35 y CU37, es:");
        N.push("        El stock de este producto cambió. Disponible: X. No se puede completar la venta.");
        N.push("      O sea que no hay ni prenda, ni talla, ni color, aunque el dato esta disponible en");
        N.push("      las dos consultas. CU34 si los mete en su mensaje de stock, y CU39 no. El mismo");
        N.push("      problema con dos redactos, en el mismo dominio y a pocas lineas de distancia.");
        N.push("  E4, venta no completada. El caso dice que si se intenta el descuento sobre una venta")
        N.push("      Pendiente el proceso simplemente no se ejecuta. No hay ninguna comprobacion con")
        N.push("      esa intencion: lo unico que hay es que los dos metodos de pago ya exigen")
        N.push("      PENDIENTE antes de llegar al descuento, o sea que la proteccion es indirecta y")
        N.push("      por suerte. Si alguien llamara al descuento desde otro sitio, no habria red.")
        N.push("  E5, el registro de inventario inexistente. El caso dice que se revierte la")
        N.push("      transaccion y se registra el error en api-server.err.log para revision del")
        N.push("      encargado. El archivo no existe, no hay logger de archivo en el proyecto, y ni")
        N.push("      SRV_PagosService ni SRV_VentasService tienen un Logger. Hay 24 Logger en 21")
        N.push("      servicios y ninguno esta en los dos que hacen el descuento. El error real, sin")
        N.push("      fila de inventario, es que el SELECT devuelve nada, la revalidacion ve 0, y")
        N.push("      sale un 409 de stock. No hay ninguna traza, ni en archivo ni en la bitacora,")
        N.push("      porque la bitacora se escribe despues del descuento y no se llega.")
        N.push("");
        N.push("La unica parte de E5 que se cumple es el rollback, y no por el log sino porque todo");
        N.push("esta en la transaccion.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - La sucursal del descuento sale de dos sitios distintos segun la rama: CU37 usa");
        N.push("    el idSucursal que saco de usuarios_empleados, y CU35 usa venta.id_sucursal leida");
        N.push("    de la venta. Hoy coinciden siempre, porque CU36 y CU34 crean la venta con la");
        N.push("    sucursal de quien la creo. Pero son dos fuentes para el mismo dato, y si alguna");
        N.push("    vez se cobrara en una sucursal distinta a la de la venta, cada rama descontaria de");
        N.push("    una Sucursal diferente. La de CU35 es la correcta: la del stock es el de la venta.");
        N.push("  - movimiento_inventario.id_reserva queda NULL en los movimientos de venta, y el caso");
        N.push("    lo dice, o sea que acierta. Pero eso cierra la puerta de trazar una venta hasta");
        N.push("    la reserva que la origino, que es justo el dato que haria falta para arreglar el");
        N.push("    hallazgo 2. El trigger tampoco escribe id_reserva, y podria, porque NEW lo tiene.");
        N.push("  - tipo_movimiento es un VARCHAR(30) sin CHECK con al menos tres convenciones: Venta");
        N.push("    con inicial mayuscula, SALIDA-RESERVA en mayusculas, y Recepcion con tilde en el");
        N.push("    procedimiento de CU22. El kardex lo devuelve tal cual, asi que el filtro por tipo");
        N.push("    que se le pase al usuario tiene que conocer las tres escrituras.");
        N.push("  - El caso dice que el proceso alimenta existencias, kardex y alertas. Las tres leen");
        N.push("    de verdad: el kardex consulta movimientos_inventario con su propio SQL, sin");
        N.push("    usar fn_kardex_producto, que sigue siendo la funcion muerta rotulada CU23; las");
        N.push("    alertas comparan disponible contra stock_minimo_alert; y las existencias suman");
        N.push("    disponible. Las tres reciben bien el dato, aunque las tres leen solo disponible y");
        N.push("    por lo tanto las tres comparten el mismo error de vista con las reservas.");
        N.push("  - Este caso es el primero del lote sin ninguna clase IU_ de servicio, y eso no es un");
        N.push("    descuido del diagrama: es lo que pasa cuando el caso describe un proceso y no un");
        N.push("    flujo de pantalla. La unica clase de interfaz es la caja, porque es donde se ve");
        N.push("    el 409.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU39 - ACTUALIZAR INVENTARIO TRAS VENTA - INFORME");
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
    msg = msg + "CU39 - Actualizar inventario tras venta" + SALTO + SALTO;
    msg = msg + "InventarioService y aplicarVenta NO EXISTEN. La logica" + SALTO;
    msg = msg + "esta partida en pagos (x2) y en el trigger." + SALTO + SALTO;
    msg = msg + "HALLAZGO NUEVO: una prenda RESERVADA no se puede cobrar," + SALTO;
    msg = msg + "porque la reserva ya vacio el disponible y la venta no" + SALTO;
    msg = msg + "lee cantidad_reservada. CU35 la lee y no la usa." + SALTO;
    msg = msg + "estado_stock no lo actualiza NADIE en todo el proyecto." + SALTO + SALTO;
    msg = msg + "BIEN: FOR UPDATE y transaccion en las dos ramas." + SALTO;
    msg = msg + "Clases: " + DEF.length + "    Actores: 3    Relaciones: " + TOTAL_REL + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de " + TOTAL_ATR + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de " + TOTAL_OPE + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de " + TOTAL_REL + SALTO;
    if (conEnDiagrama < TOTAL_REL) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU39 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU39 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU39", 0); } catch (e3) { }
}
