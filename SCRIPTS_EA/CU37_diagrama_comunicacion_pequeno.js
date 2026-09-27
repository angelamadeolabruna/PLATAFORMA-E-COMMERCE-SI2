// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU37 - Procesar Pago en Caja
// Diagrama de comunicación mínimo.
//
// Se conserva únicamente los participantes esenciales y 3 mensajes.
// Los detalles secundarios quedan en las notas del diagrama.
//
// Fuente de verdad: React/Vite + NestJS + schema.sql.
// No modifica código de la aplicación.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "AdminCaja": "IU_AdminCaja",
    "SandboxPago": "IU_SandboxPago",
    "api": "IU_Api",
    "PagosController": "CTR_Pagos",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "PagosService": "SRV_PagosService",
    "DataSource": "SRV_DataSource",
    "ComprobantesService": "SRV_ComprobantesService",
    "BitacoraService": "SRV_BitacoraService",
    "usuarios_empleados": "CE_UsuariosEmpleados",
    "ventas": "CE_Ventas",
    "venta_items": "CE_VentaItems",
    "transacciones_pago": "CE_TransaccionesPago",
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU37 mínimo", 0);
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
    aviso("Generando CU37 mínimo...");

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
            "CU37 - Procesar Pago en Caja - Comunicación mínima"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU37 - Procesar Pago en Caja - Diagrama de Comunicación Mínimo",
            "Communication"
        );

        var cajero = obtenerOCrearActor(
            raiz, paqueteActores,
            "Cajero de punto de venta (actor)",
            "ACTOR_CajeroCaja",
            "Debe tener JWT válido, realizar_venta y una asignación en usuarios_empleados.sucursal_id."
        );

        var pasarela = obtenerOCrearActor(
            raiz, paqueteActores,
            "Pasarela de Pago externa (actor conceptual)",
            "ACTOR_PasarelaCaja",
            "La implementación real no se conecta a una pasarela externa; el terminal es SandboxPago local."
        );

        var adminCaja = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminCaja", "Object", "Class", "Boundary",
            "admin/AdminCaja.tsx: método recibido, medio de pago y botón Procesar Pago."
        );

        var sandboxPago = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "SandboxPago", "Object", "Class", "Boundary",
            "Terminal local para aprobar, rechazar o simular timeout de la venta con pago no efectivo."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "api.procesarPagoCaja() y api.simularPasarela() incluyen Authorization: Bearer {access_token}."
        );

        var pagosController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "PagosController", "Object", "Class", "Control",
            "CTR_Pagos.ts: POST /api/v1/pagos/caja devuelve HTTP 200; delega en PagosService."
        );

        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "Protege el cobro de caja y entrega UsuarioActual al controller."
        );

        var pagosService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "PagosService", "Object", "Class", "Service",
            "procesarPagoCaja(), exigirPermisoCaja(), sucursalDelEmpleado() y procesamiento del resultado."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "Consultas y dataSource.transaction() con FOR UPDATE para venta e inventario."
        );

        var comprobantesService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ComprobantesService", "Object", "Class", "Service",
            "generar() se llama después del commit para emitir el comprobante CU38."
        );

        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "registrar() traza transacciones_pago y ventas después del commit."
        );

        var usuariosEmpleados = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "usuarios_empleados", "Object", "Class", "Entity",
            "sucursalDelEmpleado() obtiene la sucursal autorizada para el cobro."
        );

        var ventas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ventas", "Object", "Class", "Entity",
            "Debe estar Pendiente y pertenecer a id_sucursal; pasa a Completada."
        );

        var ventaItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "venta_items", "Object", "Class", "Entity",
            "Define id_ptc, cantidad y precio de las líneas que se descuentan."
        );

        var transaccionesPago = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "transacciones_pago", "Object", "Class", "Entity",
            "Efectivo: CAJA/Aprobado. Pasarela: Pendiente hasta el resultado sandbox."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Se bloquea con FOR UPDATE y se actualiza mediante movimiento Venta."
        );

        var movimientosInventario = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "movimientos_inventario", "Object", "Class", "Entity",
            "Registra tipo Venta, cantidad negativa, referencia, id_usuario e id_venta."
        );

        var comprobantes = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "comprobantes", "Object", "Class", "Entity",
            "Comprobante emitido después de completar la venta; devuelve numero_comprobante."
        );

        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "bitacora_auditoria", "Object", "Class", "Entity",
            "Guarda INSERT de transacción y UPDATE de venta con estado anterior y nuevo."
        );

        // Participantes esenciales; seis columnas y una última fila compacta para auditoría.
        posicionar(diagrama, cajero, 20, 20, 170, 45);
        posicionar(diagrama, adminCaja, 200, 20, 350, 45);
        posicionar(diagrama, api, 380, 20, 530, 45);
        posicionar(diagrama, pagosController, 560, 20, 710, 45);
        posicionar(diagrama, jwtAuthGuard, 740, 20, 890, 45);
        posicionar(diagrama, pagosService, 920, 20, 1070, 45);

        posicionar(diagrama, pasarela, 20, 75, 170, 100);
        posicionar(diagrama, sandboxPago, 200, 75, 350, 100);
        posicionar(diagrama, dataSource, 380, 75, 530, 100);
        posicionar(diagrama, comprobantesService, 560, 75, 710, 100);
        posicionar(diagrama, bitacoraService, 740, 75, 890, 100);
        posicionar(diagrama, usuariosEmpleados, 920, 75, 1070, 100);

        posicionar(diagrama, transaccionesPago, 20, 130, 170, 155);
        posicionar(diagrama, ventas, 200, 130, 350, 155);
        posicionar(diagrama, ventaItems, 380, 130, 530, 155);
        posicionar(diagrama, inventarioStock, 560, 130, 710, 155);
        posicionar(diagrama, movimientosInventario, 740, 130, 890, 155);
        posicionar(diagrama, comprobantes, 920, 130, 1070, 155);

        posicionar(diagrama, bitacoraAuditoria, 560, 185, 710, 210);

        // ============================================================
        // SOLO 3 MENSAJES ESENCIALES.
        // ============================================================

        agregarMensaje(diagrama, cajero, adminCaja,
            "1: venta Pendiente; Efectivo: monto recibido; Tarjeta/QR/Transferencia: proveedor; Procesar Pago",
            "message");

        agregarMensaje(diagrama, adminCaja, pagosService,
            "2: api.procesarPagoCaja(): POST /api/v1/pagos/caja; JwtAuthGuard -> PagosController.procesarPagoCaja() -> permiso, sucursal, venta y método",
            "message");

        agregarMensaje(diagrama, pagosService, adminCaja,
            "3: Efectivo o SandboxPago -> procesarPagoCaja/procesarResultado(): venta Completada, inventario, comprobante y bitácora; return estado, vuelto y numero_comprobante",
            "return");

        try {
            diagrama.Notes =
                "CU37 - En la implementación actual, CU36 y CU37 se ejecutan dentro de AdminCaja.procesarVenta(). Para Efectivo, tras crear la venta Presencial Pendiente se llama inmediatamente a api.procesarPagoCaja() y el resultado final queda Completada." +
                String.fromCharCode(10) +
                "Para Tarjeta, QR o Transferencia, procesarPagoCaja() crea una transacción Pendiente y devuelve terminal_url hacia /sandbox-pago. SandboxPago llama api.simularPasarela() y el backend procesa el resultado; no existe una pasarela externa real." +
                String.fromCharCode(10) +
                "La ruta de caja acepta LIBELULA y STRIPE en CrearTransaccionRequest; PAYPAL no está permitido en POST /api/v1/pagos/caja aunque exista para el flujo digital." +
                String.fromCharCode(10) +
                "La imagen de la interfaz es local: SandboxPago permite Aprobar, Rechazar o no_responde y el backend genera internamente la firma HMAC. No se usan credenciales de una pasarela externa." +
                String.fromCharCode(10) +
                "Para Efectivo, AdminCaja usa el total como monto recibido cuando el campo está vacío. Si se envía directamente sin monto, PagosService devuelve 422: El monto recibido es insuficiente. Faltan Bs X." +
                String.fromCharCode(10) +
                "La validación de venta, sucursal y estado ocurre antes de cobrar; la ruta de efectivo vuelve a bloquear la venta con FOR UPDATE y bloquea inventario. Una venta de otra sucursal se oculta como 404 Venta no encontrada." +
                String.fromCharCode(10) +
                "El flujo de efectivo inserta transacciones_pago con proveedor CAJA, estado Aprobado, actualiza ventas a Completada, incrementa cantidad_vendida e inserta movimientos Venta negativos. El trigger fn_aplicar_movimiento_inventario descuenta cantidad_disponible." +
                String.fromCharCode(10) +
                "La transacción de base de datos cubre transacciones_pago, ventas e inventario. ComprobantesService.generar() y las llamadas a BitacoraService.registrar() se ejecutan después; un fallo de comprobante o auditoría puede devolver error aunque la venta ya esté Completada." +
                String.fromCharCode(10) +
                "La respuesta real de caja es HTTP 200. Efectivo devuelve id_venta, estado Completada, metodo_pago, monto, vuelto y numero_comprobante. Los medios de pasarela devuelven estado Pendiente, id_transaccion y terminal_url; no completan la venta hasta procesar el resultado." +
                String.fromCharCode(10) +
                "Mensajes reales relevantes: 403 No tienes permisos para procesar pagos en esta caja.; 404 Venta no encontrada.; 409 La venta ya fue cobrada.; 422 Método de pago inválido.; 504 La pasarela de pago no respondió. Intenta de nuevo en unos minutos." +
                String.fromCharCode(10) +
                "El botón loading evita el doble clic durante la llamada, pero el backend devuelve 409 La venta ya fue cobrada ante un reintento; no es una respuesta idempotente 200. La comprobación de transacción activa ocurre fuera de una restricción única, por lo que dos solicitudes concurrentes aún pueden competir." +
                String.fromCharCode(10) +
                "Un resultado Rechazado deja la venta Pendiente. SandboxPago muestra Reintentar pago, pero reutiliza la transacción definitiva y PagosService.procesarResultado() devuelve el estado Rechazado; no crea automáticamente una nueva transacción. Un nuevo cobro debe volver a llamar POST /api/v1/pagos/caja." +
                String.fromCharCode(10) +
                "La semilla Cajero de schema.sql concede registrar_venta, pero no realizar_venta; PagosService.exigirPermisoCaja() exige realizar_venta o *. AdminCaja y el menú también exigen realizar_venta, por lo que la semilla del Cajero entrega acceso 403." +
                String.fromCharCode(10) +
                "ComprobantesService.generar() consulta productos.porcentaje_iva, aunque schema.sql no define esa columna. La emisión del comprobante puede fallar con el esquema entregado." +
                String.fromCharCode(10) +
                "AdminCaja permite imprimir o descargar el PDF después del cobro efectivo, pero SandboxPago no muestra ni descarga el comprobante; sólo muestra el estado Aprobado. PreferenciasService se ejecuta después y sus errores se omiten." +
                String.fromCharCode(10) +
                "Las tablas roles, usuarios, sucursales y productos se omitieron como contexto transversal; PagosService y ComprobantesService las consultan para permisos, sucursal y comprobante.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU37 mínimo creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Clases y entidades esenciales conservadas; 3 mensajes."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU37 mínimo", 0);
    }
}

main();
