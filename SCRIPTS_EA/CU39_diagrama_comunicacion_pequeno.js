// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU39 - Actualizar Inventario Tras Venta (automático)
// Diagrama de comunicación mínimo.
//
// Se conservan únicamente los participantes esenciales y 3 mensajes.
// Los detalles secundarios quedan en las notas del diagrama.
//
// Fuente de verdad: React/Vite + NestJS + schema.sql.
// No modifica código de la aplicación.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "PagosService": "SRV_PagosService",
    "DataSource": "SRV_DataSource",
    "ComprobantesService": "SRV_ComprobantesService",
    "ventas": "CE_Ventas",
    "venta_items": "CE_VentaItems",
    "inventario_stock": "CE_InventarioStock",
    "movimientos_inventario": "CE_MovimientosInventario",
    "producto_talla_color": "CE_ProductoTallaColor",
    "bitacora_auditoria": "CE_BitacoraAuditoria"
};

var ESCALA_X = 0.27;
var ESCALA_Y = 0.27;
var ANCHO_MINIMO = 48;
var ALTO_MINIMO = 13;
var FUENTE_PARTICIPANTES = 3;
var FUENTE_MENSAJES = 2;

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Tiendas Montaño - CU39 mínimo", 0);
}

function contiene(lista, valor)
{
    for (var i = 0; i < lista.length; i++) {
        if (lista[i] == valor) return true;
    }
    return false;
}

function buscarPaquete(paquete, nombre)
{
    if (paquete == null) return null;
    if (paquete.Name == nombre) return paquete;

    for (var i = 0; i < paquete.Packages.Count; i++) {
        var encontrado = buscarPaquete(paquete.Packages.GetAt(i), nombre);
        if (encontrado != null) return encontrado;
    }
    return null;
}

function obtenerOCrearSubPaquete(padre, nombre)
{
    for (var i = 0; i < padre.Packages.Count; i++) {
        var sub = padre.Packages.GetAt(i);
        if (sub.Name == nombre) return sub;
    }

    var nuevo = padre.Packages.AddNew(nombre, "");
    nuevo.Update();
    padre.Packages.Refresh();
    return nuevo;
}

function buscarElemento(paquete, nombre, tipos)
{
    if (paquete == null) return null;

    for (var i = 0; i < paquete.Elements.Count; i++) {
        var elemento = paquete.Elements.GetAt(i);
        if (elemento.Name == nombre && contiene(tipos, elemento.Type)) {
            return elemento;
        }
    }

    for (var j = 0; j < paquete.Packages.Count; j++) {
        var encontrado = buscarElemento(paquete.Packages.GetAt(j), nombre, tipos);
        if (encontrado != null) return encontrado;
    }

    return null;
}

function agregarNota(elemento, nota)
{
    if (elemento == null || nota == null || nota == "") return;

    try {
        var actual = "";
        try { actual = String(elemento.Notes || ""); } catch (ignore) { actual = ""; }

        if (actual.indexOf(nota) < 0) {
            elemento.Notes = actual == "" ? nota : actual + String.fromCharCode(10) + nota;
            elemento.Update();
        }
    } catch (ignore) {
    }
}

function obtenerOCrearElemento(raiz, paquete, nombre, tipoPreferido, tipoAlternativo, estereotipo, nota)
{
    var tipos = [tipoPreferido];
    if (tipoAlternativo != null && tipoAlternativo != tipoPreferido) {
        tipos.push(tipoAlternativo);
    }

    var elemento = buscarElemento(raiz, nombre, tipos);

    if (elemento == null) {
        try {
            elemento = paquete.Elements.AddNew(nombre, tipoPreferido);
        } catch (primerError) {
            elemento = paquete.Elements.AddNew(nombre, tipoAlternativo);
        }

        elemento.Update();
        paquete.Elements.Refresh();
    }

    try { elemento.Stereotype = estereotipo; } catch (ignore) { }

    try {
        if (ALIAS_POR_NOMBRE[nombre] != null) {
            elemento.Alias = ALIAS_POR_NOMBRE[nombre];
        }
    } catch (ignore) { }

    try { elemento.Update(); } catch (ignore) { }

    agregarNota(elemento, nota);
    return elemento;
}

function obtenerOCrearActor(raiz, paquete, nombre, alias, nota)
{
    var actor = buscarElemento(raiz, nombre, ["Actor"]);

    if (actor == null) {
        actor = paquete.Elements.AddNew(nombre, "Actor");
        actor.Update();
        paquete.Elements.Refresh();
    }

    try { actor.Alias = alias; } catch (ignore) { }
    try { actor.Update(); } catch (ignore) { }

    agregarNota(actor, nota);
    return actor;
}

function obtenerOCrearDiagrama(paquete, nombre, tipo)
{
    for (var i = 0; i < paquete.Diagrams.Count; i++) {
        var diagrama = paquete.Diagrams.GetAt(i);
        if (diagrama.Name == nombre) return diagrama;
    }

    var nuevo = paquete.Diagrams.AddNew(nombre, tipo);
    nuevo.Update();
    paquete.Diagrams.Refresh();
    return nuevo;
}

function posicionar(diagrama, elemento, izquierda, arriba, derecha, abajo)
{
    var objeto = null;

    for (var i = 0; i < diagrama.DiagramObjects.Count; i++) {
        var candidato = diagrama.DiagramObjects.GetAt(i);
        if (candidato.ElementID == elemento.ElementID) {
            objeto = candidato;
            break;
        }
    }

    var ancho = Math.max(
        ANCHO_MINIMO,
        Math.round((derecha - izquierda) * ESCALA_X)
    );

    var alto = Math.max(
        ALTO_MINIMO,
        Math.round((abajo - arriba) * ESCALA_Y)
    );

    var nuevaIzquierda = Math.round(izquierda * ESCALA_X);
    var nuevoArriba = Math.round(arriba * ESCALA_Y);
    var nuevaDerecha = nuevaIzquierda + ancho;
    var nuevoAbajo = nuevoArriba + alto;

    if (objeto == null) {
        objeto = diagrama.DiagramObjects.AddNew(
            "l=" + nuevaIzquierda + ";r=" + nuevaDerecha +
            ";t=" + nuevoArriba + ";b=" + nuevoAbajo + ";",
            ""
        );
        objeto.ElementID = elemento.ElementID;
    } else {
        objeto.Left = nuevaIzquierda;
        objeto.Top = nuevoArriba;
        objeto.Right = nuevaDerecha;
        objeto.Bottom = nuevoAbajo;
    }

    try { objeto.FontSize = FUENTE_PARTICIPANTES; } catch (ignore) { }
    try { objeto.WrapText = true; } catch (ignore) { }
    try { objeto.ManuallySized = true; } catch (ignore) { }

    objeto.Update();
}

function nombreConector(conector)
{
    try { return String(conector.Name || ""); } catch (ignore) { return ""; }
}

function buscarMensaje(origen, destino, etiqueta)
{
    for (var i = 0; i < origen.Connectors.Count; i++) {
        var conector = origen.Connectors.GetAt(i);

        if (
            conector.Type == "Association" &&
            conector.SupplierID == destino.ElementID &&
            nombreConector(conector) == etiqueta
        ) {
            return conector;
        }
    }
    return null;
}

function enlaceExiste(diagrama, conectorId)
{
    for (var i = 0; i < diagrama.DiagramLinks.Count; i++) {
        if (diagrama.DiagramLinks.GetAt(i).ConnectorID == conectorId) return true;
    }
    return false;
}

function agregarMensaje(diagrama, origen, destino, etiqueta, estereotipo)
{
    if (origen == null || destino == null) return;

    var conector = buscarMensaje(origen, destino, etiqueta);

    if (conector == null) {
        conector = origen.Connectors.AddNew("", "Association");
        conector.ClientID = origen.ElementID;
        conector.SupplierID = destino.ElementID;

        try { conector.Name = etiqueta; } catch (ignore) { }
        try { conector.Message = etiqueta; } catch (ignore) { }
        try { conector.Stereotype = estereotipo || "message"; } catch (ignore) { }
        try { conector.FontSize = FUENTE_MENSAJES; } catch (ignore) { }
        try { conector.WrapText = true; } catch (ignore) { }

        conector.Update();
        origen.Connectors.Refresh();
    }

    if (!enlaceExiste(diagrama, conector.ConnectorID)) {
        var enlace = diagrama.DiagramLinks.AddNew("", "");
        enlace.ConnectorID = conector.ConnectorID;
        enlace.Update();
    }
}

function main()
{
    aviso("Generando CU39 mínimo...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "12. Inventario");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "12. Inventario");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU39 - Actualizar Inventario Tras Venta - Comunicación mínima"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU39 - Actualizar Inventario Tras Venta - Diagrama de Comunicación Mínimo",
            "Communication"
        );

        var sistema = obtenerOCrearActor(
            raiz, paqueteActores,
            "Sistema backend de ventas (actor)",
            "ACTOR_SistemaInventario",
            "El descuento se ejecuta automáticamente al aprobar CU35 o CU37; no hay actor de UI."
        );

        var pagosService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "PagosService", "Object", "Class", "Service",
            "procesarResultado() y procesarPagoCaja() contienen la lógica real de inventario."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "dataSource.transaction() y consultas con FOR UPDATE sobre venta e inventario."
        );

        var comprobantesService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ComprobantesService", "Object", "Class", "Service",
            "Se invoca después del commit para continuar con CU38."
        );

        var ventas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ventas", "Object", "Class", "Entity",
            "Proporciona id_venta, id_sucursal, estado y modalidad de la venta."
        );

        var ventaItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "venta_items", "Object", "Class", "Entity",
            "Aporta id_ptc y cantidad que se descuentan."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "cantidad_disponible, cantidad_reservada, cantidad_vendida y stock_minimo_alert."
        );

        var movimientosInventario = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "movimientos_inventario", "Object", "Class", "Entity",
            "Kardex tipo Venta con cantidad negativa, referencia VNT-{id_venta} y saldos."
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "El caso espera recalcular estado_stock, pero el flujo real no lo actualiza."
        );

        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "bitacora_auditoria", "Object", "Class", "Entity",
            "La auditoría de pago y venta se ejecuta después de la transacción de inventario."
        );

        // Participantes esenciales; dos filas compactas.
        posicionar(diagrama, sistema, 20, 20, 170, 45);
        posicionar(diagrama, pagosService, 200, 20, 350, 45);
        posicionar(diagrama, dataSource, 380, 20, 530, 45);
        posicionar(diagrama, comprobantesService, 560, 20, 710, 45);
        posicionar(diagrama, ventas, 740, 20, 890, 45);
        posicionar(diagrama, ventaItems, 920, 20, 1070, 45);

        posicionar(diagrama, inventarioStock, 20, 75, 170, 100);
        posicionar(diagrama, movimientosInventario, 200, 75, 350, 100);
        posicionar(diagrama, productoTallaColor, 380, 75, 530, 100);
        posicionar(diagrama, bitacoraAuditoria, 560, 75, 710, 100);

        // ============================================================
        // SOLO 3 MENSAJES ESENCIALES.
        // ============================================================

        agregarMensaje(diagrama, sistema, pagosService,
            "1: venta Completada por CU35/CU37 -> procesarResultado()/procesarPagoCaja(): iniciar transacción",
            "message");

        agregarMensaje(diagrama, pagosService, dataSource,
            "2: venta_items + ventas.id_sucursal -> SELECT inventario_stock FOR UPDATE; validar disponible; UPDATE cantidad_vendida; INSERT movimiento Venta",
            "message");

        agregarMensaje(diagrama, dataSource, comprobantesService,
            "3: trigger fn_aplicar_movimiento_inventario descuenta disponible; commit; continúa ComprobantesService.generar()",
            "return");

        try {
            diagrama.Notes =
                "CU39 - No existe InventarioService.aplicarVenta() en la implementación. El descuento está duplicado dentro de PagosService.procesarPagoCaja() para CU37 y PagosService.procesarResultado() para CU35; VentasService sólo crea la venta Pendiente." +
                String.fromCharCode(10) +
                "Ambas rutas bloquean la venta y cada inventario_stock con SELECT ... FOR UPDATE. Si no hay stock suficiente, la excepción real es 409 El stock de este producto cambió. Disponible: X. No se puede completar la venta., no el mensaje de prenda, talla y color del propósito." +
                String.fromCharCode(10) +
                "La ruta digital selecciona cantidad_reservada, pero ninguna de las dos rutas la utiliza. Siempre validan y descuentan cantidad_disponible; no ejecutan cantidad_reservada = cantidad_reservada - cantidad ni relacionan id_reserva con la venta o venta_items." +
                String.fromCharCode(10) +
                "Además, crearReserva() ya resta cantidad_disponible mediante un movimiento y suma cantidad_reservada. Si esa prenda se vende después, el flujo puede descontar disponible otra vez en lugar de trasladar la reserva a cantidad_vendida." +
                String.fromCharCode(10) +
                "PagosService incrementa cantidad_vendida e inserta movimientos_inventario con cantidad negativa. El BEFORE INSERT trg_movimiento_inventario actualiza cantidad_disponible y completa stock_anterior, stock_posterior y fecha; el servicio no escribe esos saldos directamente." +
                String.fromCharCode(10) +
                "No existe actualización de producto_talla_color.estado_stock con las reglas Sin stock, Bajo o Disponible. Sólo SRV_AlertasService consulta stock_minimo_alert; el estado de la variante puede permanecer obsoleto." +
                String.fromCharCode(10) +
                "Si falta la fila de inventario_stock, el código la sustituye por cantidad_disponible = 0 y devuelve 409. No se encontró registro en api-server.err.log." +
                String.fromCharCode(10) +
                "La venta, el inventario, el movimiento y el cambio de estado del pago se confirman en la misma dataSource.transaction(). Un fallo SQL de esas operaciones revierte el conjunto. Sin embargo, ComprobantesService.generar() y las auditorías de PagosService se ejecutan después del commit; un fallo de CU38 no revierte el descuento." +
                String.fromCharCode(10) +
                "El movimiento se referencia como VNT-<id_venta>, pero id_reserva queda en su valor predeterminado NULL. Las tablas reservas y reserva_items no participan en este flujo de venta.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU39 mínimo creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Clases y entidades esenciales conservadas; 3 mensajes."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU39 mínimo", 0);
    }
}

main();
