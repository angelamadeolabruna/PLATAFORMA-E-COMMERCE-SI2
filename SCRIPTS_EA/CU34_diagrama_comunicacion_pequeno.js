// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU34 - Realizar Compra Digital
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
    "CartContext": "IU_CartContext",
    "api": "IU_Api",
    "VentasController": "CTR_Ventas",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "VentasService": "SRV_VentasService",
    "DataSource": "SRV_DataSource",
    "carritos": "CE_Carritos",
    "carrito_items": "CE_CarritoItems",
    "inventario_stock": "CE_InventarioStock",
    "sucursales": "CE_Sucursales",
    "ventas": "CE_Ventas",
    "venta_items": "CE_VentaItems",
    "producto_talla_color": "CE_ProductoTallaColor",
    "productos": "CE_Productos",
    "categorias": "CE_Categorias",
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU34 mínimo", 0);
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
    aviso("Generando CU34 mínimo...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "8. Carrito y Ventas");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "8. Carrito y Ventas");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU34 - Realizar Compra Digital - Comunicación mínima"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU34 - Realizar Compra Digital - Diagrama de Comunicación Mínimo",
            "Communication"
        );

        var cliente = obtenerOCrearActor(
            raiz, paqueteActores,
            "Cliente registrado (actor)",
            "ACTOR_ClienteCompraDigital",
            "El checkout real exige usuario autenticado y un carrito Activo que le pertenezca."
        );

        var checkout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Checkout", "Object", "Class", "Boundary",
            "checkout.tsx: confirmar() consulta el carrito y luego api.checkout() con el formulario confirmado."
        );

        var cartContext = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "CartContext", "Object", "Class", "Boundary",
            "Aporta carrito, subtotal e ítems; refrescar() se ejecuta antes de confirmar."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "api.checkout(): POST /api/v1/ventas/checkout; solicitar() agrega Authorization: Bearer {access_token}."
        );

        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "Autenticación obligatoria del endpoint; el frontend intenta renovar el JWT al recibir 401."
        );

        var ventasController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "VentasController", "Object", "Class", "Control",
            "CTR_Ventas.ts: checkout() delega en VentasService.crearCompraDigital()."
        );

        var ventasService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "VentasService", "Object", "Class", "Service",
            "crearCompraDigital(): permiso, cliente, carrito, sucursal, stock, totales, transacción y respuesta."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "TypeORM DataSource: consultas, dataSource.transaction() y acceso a bitácora."
        );

        var carritos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "carritos", "Object", "Class", "Entity",
            "Pertenece al usuario, debe estar Activo y cambia a En pago dentro de la transacción."
        );

        var carritoItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "carrito_items", "Object", "Class", "Entity",
            "Ítems y precios congelados desde CU33."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "CU34 revalida cantidad_disponible por id_ptc e id_sucursal; no lo descuenta."
        );

        var sucursales = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sucursales", "Object", "Class", "Entity",
            "El estado válido real es Activa; id_sucursal es opcional en el cuerpo y la UI permite editarlo."
        );

        var ventas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ventas", "Object", "Class", "Entity",
            "INSERT de la compra digital en estado Pendiente, con id_cliente, id_usuario, id_sucursal e id_carrito."
        );

        var ventaItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "venta_items", "Object", "Class", "Entity",
            "Copia cada carrito_item con id_ptc, cantidad, precio_unitario y subtotal."
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Valida que cada id_ptc exista y tenga estado_stock Disponible."
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "El service consulta porcentaje_iva y exige estado Activo; schema.sql no define porcentaje_iva y usa estado predeterminado Disponible."
        );

        var categorias = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "categorias", "Object", "Class", "Entity",
            "El service consulta porcentaje_iva_default; schema.sql no define esa columna."
        );

        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "bitacora_auditoria", "Object", "Class", "Entity",
            "La llamada a BitacoraService.registrar() ocurre después de confirmar la transacción."
        );

        // Participantes esenciales; seis columnas y tres filas.
        posicionar(diagrama, cliente, 20, 20, 170, 45);
        posicionar(diagrama, checkout, 200, 20, 350, 45);
        posicionar(diagrama, api, 380, 20, 530, 45);
        posicionar(diagrama, jwtAuthGuard, 560, 20, 710, 45);
        posicionar(diagrama, ventasController, 740, 20, 890, 45);
        posicionar(diagrama, ventasService, 920, 20, 1070, 45);

        posicionar(diagrama, cartContext, 20, 75, 170, 100);
        posicionar(diagrama, dataSource, 200, 75, 350, 100);
        posicionar(diagrama, carritos, 380, 75, 530, 100);
        posicionar(diagrama, carritoItems, 560, 75, 710, 100);
        posicionar(diagrama, inventarioStock, 740, 75, 890, 100);
        posicionar(diagrama, sucursales, 920, 75, 1070, 100);

        posicionar(diagrama, ventas, 20, 130, 170, 155);
        posicionar(diagrama, ventaItems, 200, 130, 350, 155);
        posicionar(diagrama, productoTallaColor, 380, 130, 530, 155);
        posicionar(diagrama, productos, 560, 130, 710, 155);
        posicionar(diagrama, categorias, 740, 130, 890, 155);
        posicionar(diagrama, bitacoraAuditoria, 920, 130, 1070, 155);

        // ============================================================
        // SOLO 3 MENSAJES ESENCIALES.
        // ============================================================

        agregarMensaje(diagrama, cliente, checkout,
            "1: Ir a pagar -> /checkout; confirmar(): consultarCarrito() + api.checkout(): POST /api/v1/ventas/checkout",
            "message");

        agregarMensaje(diagrama, api, ventasService,
            "2: JwtAuthGuard -> VentasController.checkout() -> VentasService.crearCompraDigital(): JWT, permiso, cliente, carrito, sucursal, stock e IVA",
            "message");

        agregarMensaje(diagrama, dataSource, checkout,
            "3: transacción ventas + venta_items + carritos = 'En pago'; bitácora; HTTP 201 { id_venta, total, estado: 'Pendiente', resumen }",
            "return");

        try {
            diagrama.Notes =
                "CU34 - La implementación real encontrada es React/Vite: Checkout. No existe CheckoutScreen de Flutter en el proyecto." +
                String.fromCharCode(10) +
                "Checkout estima IVA con TASA_IVA_ESTIMADA = 0.13; VentasService usa productos.porcentaje_iva y, si no es > 0, categorias.porcentaje_iva_default. schema.sql no define ninguna de esas dos columnas, por lo que el cálculo o la consulta real pueden diferir del schema." +
                String.fromCharCode(10) +
                "schema.sql define productos.estado con valor predeterminado Disponible, pero VentasService exige Activo al revalidar los ítems." +
                String.fromCharCode(10) +
                "La semilla del rol Cliente incluye comprar, no realizar_venta; el endpoint de VentasService exige realizar_venta o * y respondería 403." +
                String.fromCharCode(10) +
                "Después del HTTP 201, Checkout no redirige automáticamente: el Cliente debe pulsar Pagar ahora para llamar api.crearTransaccion() mediante POST /api/v1/pagos/transacciones y seguir checkout_url de CU35." +
                String.fromCharCode(10) +
                "La UI ofrece PayPal, pero lo envía como metodo_pago = Tarjeta y proveedor_pasarela = PAYPAL; no es un valor nuevo de metodo_pago." +
                String.fromCharCode(10) +
                "El cuerpo real admite id_sucursal opcional aunque el propósito lo omite; la UI lo inicializa con la sucursal del carrito y permite editarlo." +
                String.fromCharCode(10) +
                "nit_cliente y razon_social llegan al backend, pero CU34 solo los conserva en new_data de bitacora_auditoria; no los persiste en ventas." +
                String.fromCharCode(10) +
                "ventas, venta_items y el cambio del carrito usan una transacción. La auditoría se ejecuta después; si falla, la venta puede quedar creada aunque el frontend reciba error." +
                String.fromCharCode(10) +
                "La revalidación de stock ocurre antes de la transacción y sin bloqueo ni reserva; CU34 tampoco ofrece idempotencia de servidor. El loading sólo evita doble clic en esa instancia del frontend." +
                String.fromCharCode(10) +
                "Los participantes transversales usuarios, usuarios_roles, roles y clientes se omitieron por ser contexto compartido; VentasService los consulta para resolver permiso e id_cliente.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU34 mínimo creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Clases y entidades esenciales conservadas; 3 mensajes."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU34 mínimo", 0);
    }
}

main();
