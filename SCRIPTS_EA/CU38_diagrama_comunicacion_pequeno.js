// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU38 - Emitir Comprobante de Venta
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
    "AdminCaja": "IU_AdminCaja",
    "MisCompras": "IU_MisCompras",
    "api": "IU_Api",
    "ComprobanteVentaController": "CTR_ComprobanteVenta",
    "ComprobantesController": "CTR_Comprobantes",
    "ComprobantesService": "SRV_ComprobantesService",
    "PagosService": "SRV_PagosService",
    "DataSource": "SRV_DataSource",
    "BitacoraService": "SRV_BitacoraService",
    "ventas": "CE_Ventas",
    "venta_items": "CE_VentaItems",
    "comprobantes": "CE_Comprobantes",
    "bitacora_auditoria": "CE_BitacoraAuditoria",
    "productos": "CE_Productos",
    "producto_talla_color": "CE_ProductoTallaColor",
    "sucursales": "CE_Sucursales",
    "usuarios_empleados": "CE_UsuariosEmpleados"
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU38 mínimo", 0);
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
    aviso("Generando CU38 mínimo...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "11. Comprobantes");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "11. Comprobantes");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU38 - Emitir Comprobante de Venta - Comunicación mínima"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU38 - Emitir Comprobante de Venta - Diagrama de Comunicación Mínimo",
            "Communication"
        );

        var sistema = obtenerOCrearActor(
            raiz, paqueteActores,
            "Sistema generador de comprobantes (actor)",
            "ACTOR_SistemaComprobante",
            "PagosService genera el comprobante después de confirmar el pago."
        );

        var cajero = obtenerOCrearActor(
            raiz, paqueteActores,
            "Cajero consultante (actor)",
            "ACTOR_CajeroComprobante",
            "Consulta, imprime o descarga el comprobante desde AdminCaja."
        );

        var cliente = obtenerOCrearActor(
            raiz, paqueteActores,
            "Cliente consultante (actor)",
            "ACTOR_ClienteComprobante",
            "Consulta sus comprobantes desde MisCompras."
        );

        var adminCaja = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminCaja", "Object", "Class", "Boundary",
            "Muestra el comprobante y ofrece Imprimir o Descargar PDF después del cobro efectivo."
        );

        var misCompras = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "MisCompras", "Object", "Class", "Boundary",
            "Consulta ventas del Cliente y permite imprimir o descargar comprobantes."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "api.consultarComprobanteVenta(), abrirComprobantePdf() y descargarComprobantePdf()."
        );

        var comprobanteVentaController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ComprobanteVentaController", "Object", "Class", "Control",
            "CTR_Comprobantes.ts: GET /api/v1/ventas/:id/comprobante y /ventas/mias/compras."
        );

        var comprobantesController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ComprobantesController", "Object", "Class", "Control",
            "CTR_Comprobantes.ts: GET /api/v1/comprobantes/:id/pdf devuelve StreamableFile."
        );

        var comprobantesService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ComprobantesService", "Object", "Class", "Service",
            "generar(), consultarDeVenta(), descargarPdf() y comprasDelCliente()."
        );

        var pagosService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "PagosService", "Object", "Class", "Service",
            "Invoca ComprobantesService.generar() después de aprobar el pago de CU35 o CU37."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "Consultas de venta, items, productos, sucursal, correlativo y comprobantes."
        );

        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "registrar() inserta la trazabilidad del comprobante emitido."
        );

        var ventas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ventas", "Object", "Class", "Entity",
            "Debe existir y estar Completada; aporta total, modalidad, método, sucursal y fecha."
        );

        var ventaItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "venta_items", "Object", "Class", "Entity",
            "Aporta el detalle de prendas que se imprime en el PDF."
        );

        var comprobantes = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "comprobantes", "Object", "Class", "Entity",
            "Registro con numero, tipo, total, fecha_emision y pdf_url."
        );

        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "bitacora_auditoria", "Object", "Class", "Entity",
            "INSERT de comprobantes con new_data { numero, tipo, total }."
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Aporta código, nombre y porcentaje_iva; schema.sql no define porcentaje_iva."
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Relaciona venta_items con la variante de producto."
        );

        var sucursales = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sucursales", "Object", "Class", "Entity",
            "Aporta el nombre de la sucursal al PDF y participa en el correlativo."
        );

        var usuariosEmpleados = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "usuarios_empleados", "Object", "Class", "Entity",
            "Aporta el nombre del cajero que aparece en el PDF."
        );

        // Participantes esenciales; seis columnas y una última fila compacta para auditoría.
        posicionar(diagrama, sistema, 20, 20, 170, 45);
        posicionar(diagrama, adminCaja, 200, 20, 350, 45);
        posicionar(diagrama, misCompras, 380, 20, 530, 45);
        posicionar(diagrama, api, 560, 20, 710, 45);
        posicionar(diagrama, comprobanteVentaController, 740, 20, 890, 45);
        posicionar(diagrama, comprobantesService, 920, 20, 1070, 45);

        posicionar(diagrama, cajero, 20, 75, 170, 100);
        posicionar(diagrama, cliente, 200, 75, 350, 100);
        posicionar(diagrama, pagosService, 380, 75, 530, 100);
        posicionar(diagrama, comprobantesController, 560, 75, 710, 100);
        posicionar(diagrama, dataSource, 740, 75, 890, 100);
        posicionar(diagrama, bitacoraService, 920, 75, 1070, 100);

        posicionar(diagrama, ventas, 20, 130, 170, 155);
        posicionar(diagrama, ventaItems, 200, 130, 350, 155);
        posicionar(diagrama, comprobantes, 380, 130, 530, 155);
        posicionar(diagrama, bitacoraAuditoria, 560, 130, 710, 155);
        posicionar(diagrama, productos, 740, 130, 890, 155);
        posicionar(diagrama, productoTallaColor, 920, 130, 1070, 155);

        posicionar(diagrama, sucursales, 200, 185, 350, 210);
        posicionar(diagrama, usuariosEmpleados, 380, 185, 530, 210);

        // ============================================================
        // SOLO 3 MENSAJES ESENCIALES.
        // ============================================================

        agregarMensaje(diagrama, pagosService, comprobantesService,
            "1: venta Completada -> generar(): idempotencia; tipo; correlativo; PDF; INSERT comprobantes; pdf_url; bitácora",
            "message");

        agregarMensaje(diagrama, api, comprobanteVentaController,
            "2: GET /api/v1/ventas/:id/comprobante -> JwtAuthGuard -> consultarDeVenta(): permiso, propiedad y generar o reutilizar",
            "message");

        agregarMensaje(diagrama, comprobantesController, api,
            "3: GET /api/v1/comprobantes/:id/pdf -> descargarPdf(): verificar permiso y archivo; return StreamableFile",
            "return");

        try {
            diagrama.Notes =
                "CU38 - La emisión automática la invoca PagosService después de que una venta de CU35 o CU37 queda Completada. La consulta de caja y la de MisCompras también pueden invocar generar() mediante GET /api/v1/ventas/:id/comprobante." +
                String.fromCharCode(10) +
                "Los tipos reales se guardan en mayúsculas: FACTURA cuando nit_cliente y razon_social están disponibles; BOLETA en caso contrario. El servicio obtiene esos datos del último INSERT de ventas en bitacora_auditoria, no de columnas de facturación en ventas." +
                String.fromCharCode(10) +
                "El número se construye como TM-<id_sucursal>-<YYYY>-<COUNT+1 con seis dígitos>. El conteo por sucursal y año no está dentro de una transacción ni de una secuencia bloqueada; comprobantes sólo tiene UNIQUE(numero), no UNIQUE(id_venta), por lo que la numeración y la idempotencia pueden ser riesgosas bajo concurrencia." +
                String.fromCharCode(10) +
                "La generación inserta primero comprobantes con pdf_url NULL, compone y guarda el PDF y después actualiza pdf_url. Si falla el storage después del INSERT, la venta queda afectada por un comprobante incompleto; una consulta posterior puede devolver ese registro existente sin regenerar el archivo. La excepción real es No se pudo generar el comprobante. Intenta nuevamente." +
                String.fromCharCode(10) +
                "STORAGE_BACKEND no implementa S3 para comprobantes: DIR_COMPROBANTES es comprobantes tanto para s3 como para local y guardarPdf() siempre escribe en process.cwd()/comprobantes. La descarga usa StreamableFile y Content-Disposition attachment." +
                String.fromCharCode(10) +
                "ComprobantesService.generar() consulta productos.porcentaje_iva, pero schema.sql no define esa columna; el PDF usa 13 como valor visual de respaldo sólo si la consulta llega a completarse. La consulta de venta también agrupa por porcentaje_iva y puede fallar con el esquema entregado." +
                String.fromCharCode(10) +
                "El permiso real de consulta es * o realizar_venta, o que el usuario sea dueño de la venta mediante clientes.usuario_id. Por eso un Cliente propietario puede consultar aunque no tenga realizar_venta. Los demás errores son 404 Venta no encontrada., 409 La venta no está pagada; no se puede emitir el comprobante., 403 No tienes permisos para consultar comprobantes. y 401 por JWT." +
                String.fromCharCode(10) +
                "AdminCaja muestra Imprimir y Descargar PDF después del cobro efectivo. MisCompras permite imprimir, descargar o pulsar Generar comprobante; este último botón también aparece para ventas Pendiente, aunque consultarDeVenta() responderá 409 hasta que la venta esté Completada." +
                String.fromCharCode(10) +
                "La emisión, el guardado del PDF y la auditoría no están dentro de una única transacción. Un fallo de BitacoraService.registrar() puede dejar el comprobante y pdf_url persistidos aunque la operación responda con error; preferencias y otros procesos de PagosService también se ejecutan después del cobro." +
                String.fromCharCode(10) +
                "Las tablas roles, usuarios, clientes, tallas y colores se omitieron por ser contexto auxiliar; ComprobantesService las consulta para autorización, cajero, sucursal y detalle del PDF.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU38 mínimo creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Clases y entidades esenciales conservadas; 3 mensajes."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU38 mínimo", 0);
    }
}

main();
