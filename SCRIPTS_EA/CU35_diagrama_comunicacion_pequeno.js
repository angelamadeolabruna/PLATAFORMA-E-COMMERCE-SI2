// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU35 - Procesar Pago con Pasarela de Pago
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
    "Checkout": "IU_Checkout",
    "SandboxPago": "IU_SandboxPago",
    "api": "IU_Api",
    "PagosController": "CTR_Pagos",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "PagosService": "SRV_PagosService",
    "DataSource": "SRV_DataSource",
    "ComprobantesService": "SRV_ComprobantesService",
    "BitacoraService": "SRV_BitacoraService",
    "ventas": "CE_Ventas",
    "transacciones_pago": "CE_TransaccionesPago",
    "venta_items": "CE_VentaItems",
    "carritos": "CE_Carritos",
    "inventario_stock": "CE_InventarioStock",
    "movimientos_inventario": "CE_MovimientosInventario",
    "comprobantes": "CE_Comprobantes",
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU35 mínimo", 0);
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
    aviso("Generando CU35 mínimo...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "9. Pasarela de Pago");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "9. Pasarela de Pago");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU35 - Procesar Pago con Pasarela de Pago - Comunicación mínima"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU35 - Procesar Pago con Pasarela de Pago - Diagrama de Comunicación Mínimo",
            "Communication"
        );

        var cliente = obtenerOCrearActor(
            raiz, paqueteActores,
            "Cliente pagador (actor)",
            "ACTOR_ClientePago",
            "Debe tener JWT válido, realizar_venta y una venta Pendiente de CU34."
        );

        var pasarela = obtenerOCrearActor(
            raiz, paqueteActores,
            "Pasarela de Pago externa (actor conceptual)",
            "ACTOR_PasarelaPago",
            "No existe una integración externa real; el proyecto usa una pasarela local simulada."
        );

        var checkout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Checkout", "Object", "Class", "Boundary",
            "Pagar ahora llama api.crearTransaccion() y abre window.location.href con checkout_url."
        );

        var sandboxPago = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "SandboxPago", "Object", "Class", "Boundary",
            "Consulta el estado y permite simular Aprobado, Rechazado o no_responde; no es un iframe externo."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "api.crearTransaccion(), consultarEstadoTransaccion() y simularPasarela() usan Authorization: Bearer {access_token}."
        );

        var pagosController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "PagosController", "Object", "Class", "Control",
            "CTR_Pagos.ts: crearTransaccion(), consultarEstado(), simularPasarela() y procesarWebhook()."
        );

        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "Protege creación, consulta y simulación; procesarWebhook() se protege con firma HMAC."
        );

        var pagosService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "PagosService", "Object", "Class", "Service",
            "crearTransaccion(), consultarEstado(), procesarWebhook(), simularPasarela() y procesarResultado()."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "Consultas y dataSource.transaction() con bloqueos FOR UPDATE para venta e inventario."
        );

        var comprobantesService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ComprobantesService", "Object", "Class", "Service",
            "generar() se invoca después de aprobar el pago y es idempotente."
        );

        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "registrar() traza creación, rechazo, aprobación, venta y comprobante."
        );

        var ventas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ventas", "Object", "Class", "Entity",
            "Debe pertenecer al usuario y estar Pendiente; al aprobar cambia a Completada."
        );

        var transaccionesPago = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "transacciones_pago", "Object", "Class", "Entity",
            "Estado Pendiente, Aprobado o Rechazado; referencia_externa e id_transaccion_pasarela."
        );

        var ventaItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "venta_items", "Object", "Class", "Entity",
            "Define los id_ptc y cantidades que se descuentan al aprobar."
        );

        var carritos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "carritos", "Object", "Class", "Entity",
            "Cambia de En pago a Convertido a venta cuando el pago resulta Aprobado."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Se bloquea con FOR UPDATE; cantidad_vendida aumenta y el trigger descuenta cantidad_disponible."
        );

        var movimientosInventario = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "movimientos_inventario", "Object", "Class", "Entity",
            "INSERT tipo_movimiento Venta con cantidad negativa, referencia VNT-{id_venta}, id_usuario e id_venta."
        );

        var comprobantes = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "comprobantes", "Object", "Class", "Entity",
            "Se emite después de completar la venta; el resultado devuelve numero_comprobante."
        );

        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "bitacora_auditoria", "Object", "Class", "Entity",
            "Guarda INSERT de la transacción y UPDATE con old_data/new_data para pagos y venta."
        );

        // Participantes esenciales; seis columnas y una última fila compacta para la bitácora.
        posicionar(diagrama, cliente, 20, 20, 170, 45);
        posicionar(diagrama, checkout, 200, 20, 350, 45);
        posicionar(diagrama, sandboxPago, 380, 20, 530, 45);
        posicionar(diagrama, api, 560, 20, 710, 45);
        posicionar(diagrama, pagosController, 740, 20, 890, 45);
        posicionar(diagrama, pagosService, 920, 20, 1070, 45);

        posicionar(diagrama, pasarela, 20, 75, 170, 100);
        posicionar(diagrama, jwtAuthGuard, 200, 75, 350, 100);
        posicionar(diagrama, dataSource, 380, 75, 530, 100);
        posicionar(diagrama, comprobantesService, 560, 75, 710, 100);
        posicionar(diagrama, bitacoraService, 740, 75, 890, 100);
        posicionar(diagrama, transaccionesPago, 920, 75, 1070, 100);

        posicionar(diagrama, ventas, 20, 130, 170, 155);
        posicionar(diagrama, ventaItems, 200, 130, 350, 155);
        posicionar(diagrama, carritos, 380, 130, 530, 155);
        posicionar(diagrama, inventarioStock, 560, 130, 710, 155);
        posicionar(diagrama, movimientosInventario, 740, 130, 890, 155);
        posicionar(diagrama, comprobantes, 920, 130, 1070, 155);

        posicionar(diagrama, bitacoraAuditoria, 560, 185, 710, 210);

        // ============================================================
        // SOLO 3 MENSAJES ESENCIALES.
        // ============================================================

        agregarMensaje(diagrama, cliente, checkout,
            "1: Pagar ahora -> api.crearTransaccion(): POST /api/v1/pagos/transacciones -> checkout_url /sandbox-pago",
            "message");

        agregarMensaje(diagrama, sandboxPago, pagosService,
            "2: JwtAuthGuard -> PagosController.crearTransaccion() -> PagosService.crearTransaccion(): INSERT Pendiente; SBX-UUID; consultarEstado()",
            "message");

        agregarMensaje(diagrama, pasarela, sandboxPago,
            "3: webhook firmado -> procesarWebhook()/procesarResultado(): monto; Aprobado/Rechazado; idempotencia; venta, carrito, inventario, movimiento, comprobante y bitácora",
            "return");

        try {
            diagrama.Notes =
                "CU35 - La integración real es local y simulada. PagosService.crearTransaccion() no llama a LIBELULA, STRIPE ni PAYPAL, no usa PAYMENT_PUBLIC_KEY/PAYMENT_PRIVATE_KEY y tampoco crea un intent o checkout externo. Genera referencia UUID e id_transaccion_pasarela SBX-UUID, y checkout_url apunta a FRONTEND_URL/sandbox-pago." +
                String.fromCharCode(10) +
                "SandboxPago.tsx es una página React local, no un iframe o webview externo. El botón llama POST /api/v1/pagos/sandbox/gateway; PagosService.simularPasarela() genera internamente la firma HMAC y invoca procesarWebhook() en el mismo backend." +
                String.fromCharCode(10) +
                "GET /api/v1/pagos/transacciones/:id/estado no consulta una pasarela externa: sólo lee transacciones_pago, verifica propietario y permiso, y devuelve estado, detalle y una firma HMAC calculada por el servidor." +
                String.fromCharCode(10) +
                ".env.example no contiene PAGO_WEBHOOK_SECRET, FRONTEND_URL ni credenciales de pasarela. PagosService usa el valor predeterminado sandbox-secreto-cu35 para PAGO_WEBHOOK_SECRET." +
                String.fromCharCode(10) +
                "crearTransaccion() rechaza cualquier venta que ya tenga una transacción, incluso si la anterior está Rechazada. El botón Reintentar pago de SandboxPago reutiliza la misma transacción; procesarResultado() detecta el estado definitivo y sigue devolviendo Rechazado. No se crea una nueva transacción de reintento." +
                String.fromCharCode(10) +
                "Tras el INSERT de crearTransaccion(), BitacoraService.registrar() ocurre fuera de transacción. Si la auditoría falla, la transacción Pendente queda persistida y un nuevo POST recibe 409. La consulta previa tampoco evita dos inserciones concurrentes porque transacciones_pago no tiene UNIQUE(id_venta)." +
                String.fromCharCode(10) +
                "La aprobación usa dataSource.transaction(), bloquea ventas e inventario con FOR UPDATE y actualiza transacciones_pago, ventas, carritos, inventario_stock y movimientos_inventario atómicamente. PagosService incrementa cantidad_vendida; el trigger trg_movimiento_inventario descuenta cantidad_disponible mediante el movimiento negativo." +
                String.fromCharCode(10) +
                "PreferenciasService se ejecuta después y sus errores se omiten. ComprobantesService.generar() y las auditorías de aprobación se ejecutan después de la transacción; un fallo posterior puede dejar pago Aprobado y venta Completada aunque la respuesta del webhook termine con error." +
                String.fromCharCode(10) +
                "ComprobantesService.generar() consulta productos.porcentaje_iva, pero schema.sql no define esa columna. La emisión del comprobante puede fallar con el esquema entregado." +
                String.fromCharCode(10) +
                "El frontend no muestra el texto exacto Pago aprobado. ¡Gracias por tu compra! ni presenta el comprobante. SandboxPago muestra ¡Pago aprobado!, descarta numero_comprobante de la respuesta y sólo ofrece volver al catálogo." +
                String.fromCharCode(10) +
                "La semilla del rol Cliente de schema.sql incluye comprar, no realizar_venta; PagosService exige realizar_venta o * y respondería 403." +
                String.fromCharCode(10) +
                "Los participantes transversales usuarios, usuarios_roles y roles se omitieron por ser contexto compartido; PagosService los consulta para validar propietario y permiso.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU35 mínimo creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Clases y entidades esenciales conservadas; 3 mensajes."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU35 mínimo", 0);
    }
}

main();
