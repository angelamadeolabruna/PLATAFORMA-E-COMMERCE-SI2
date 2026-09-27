// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU36 - Registrar Venta Presencial en Punto de Caja (POS)
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
    "api": "IU_Api",
    "PosController": "CTR_Pos",
    "VentasController": "CTR_Ventas",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "VentasService": "SRV_VentasService",
    "DataSource": "SRV_DataSource",
    "BitacoraService": "SRV_BitacoraService",
    "usuarios_empleados": "CE_UsuariosEmpleados",
    "producto_talla_color": "CE_ProductoTallaColor",
    "productos": "CE_Productos",
    "producto_precios": "CE_ProductoPrecios",
    "inventario_stock": "CE_InventarioStock",
    "clientes": "CE_Clientes",
    "ventas": "CE_Ventas",
    "venta_items": "CE_VentaItems",
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU36 mínimo", 0);
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
    aviso("Generando CU36 mínimo...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "10. Punto de Venta (POS)");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "10. Punto de Venta (POS)");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU36 - Registrar Venta Presencial en POS - Comunicación mínima"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU36 - Registrar Venta Presencial en POS - Diagrama de Comunicación Mínimo",
            "Communication"
        );

        var cajero = obtenerOCrearActor(
            raiz, paqueteActores,
            "Cajero de punto de venta (actor)",
            "ACTOR_CajeroPOS",
            "Debe tener JWT válido, realizar_venta y una asignación en usuarios_empleados.sucursal_id."
        );

        var adminCaja = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminCaja", "Object", "Class", "Boundary",
            "admin/AdminCaja.tsx: busca prendas y clientes, acumula items, calcula totales y envía la venta."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "api.buscarProductosPos(), buscarClientesPos() y crearVentaPresencial()."
        );

        var posController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "PosController", "Object", "Class", "Control",
            "Ctr_Pos.ts: GET /api/v1/pos/productos y GET /api/v1/pos/clientes."
        );

        var ventasController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "VentasController", "Object", "Class", "Control",
            "CTR_Ventas.ts: POST /api/v1/ventas/presencial con JwtAuthGuard."
        );

        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "Valida la sesión y entrega UsuarioActual a los controladores POS y Ventas."
        );

        var ventasService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "VentasService", "Object", "Class", "Service",
            "buscarProductosPos(), buscarClientesPos() y crearVentaPresencial()."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "TypeORM DataSource y dataSource.transaction() para ventas y venta_items."
        );

        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "registrar() inserta la auditoría de la venta después de la transacción."
        );

        var usuariosEmpleados = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "usuarios_empleados", "Object", "Class", "Entity",
            "sucursalDelEmpleado() obtiene la sucursal asignada al Cajero."
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Identifica la variante id_ptc, su estado_stock y sus relaciones de talla y color."
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Aporta nombre, precio_base, estado y porcentaje_iva; schema.sql no define porcentaje_iva."
        );

        var productoPrecios = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_precios", "Object", "Class", "Entity",
            "El precio vigente se toma por fechas activas; la consulta no define ORDER BY."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Valida cantidad_disponible para id_ptc e id_sucursal; CU36 no descuenta stock."
        );

        var clientes = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "clientes", "Object", "Class", "Entity",
            "Busca por email, CI o nombre; id_cliente puede quedar NULL para Consumidor final."
        );

        var ventas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ventas", "Object", "Class", "Entity",
            "INSERT Presencial, Pendiente, id_carrito NULL, con cliente, sucursal, método y totales."
        );

        var ventaItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "venta_items", "Object", "Class", "Entity",
            "INSERT de id_ptc, cantidad, precio_unitario y subtotal por cada línea."
        );

        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "bitacora_auditoria", "Object", "Class", "Entity",
            "Registra INSERT de ventas con total, método, sucursal, cliente, factura e items."
        );

        // Participantes esenciales; seis columnas y tres filas.
        posicionar(diagrama, cajero, 20, 20, 170, 45);
        posicionar(diagrama, adminCaja, 200, 20, 350, 45);
        posicionar(diagrama, api, 380, 20, 530, 45);
        posicionar(diagrama, posController, 560, 20, 710, 45);
        posicionar(diagrama, ventasController, 740, 20, 890, 45);
        posicionar(diagrama, ventasService, 920, 20, 1070, 45);

        posicionar(diagrama, jwtAuthGuard, 20, 75, 170, 100);
        posicionar(diagrama, dataSource, 200, 75, 350, 100);
        posicionar(diagrama, bitacoraService, 380, 75, 530, 100);
        posicionar(diagrama, usuariosEmpleados, 560, 75, 710, 100);
        posicionar(diagrama, productoTallaColor, 740, 75, 890, 100);
        posicionar(diagrama, productos, 920, 75, 1070, 100);

        posicionar(diagrama, productoPrecios, 20, 130, 170, 155);
        posicionar(diagrama, inventarioStock, 200, 130, 350, 155);
        posicionar(diagrama, clientes, 380, 130, 530, 155);
        posicionar(diagrama, ventas, 560, 130, 710, 155);
        posicionar(diagrama, ventaItems, 740, 130, 890, 155);
        posicionar(diagrama, bitacoraAuditoria, 920, 130, 1070, 155);

        // ============================================================
        // SOLO 3 MENSAJES ESENCIALES.
        // ============================================================

        agregarMensaje(diagrama, cajero, adminCaja,
            "1: /admin/caja; buscar producto y cliente; agregar id_ptc/cantidad; Total a cobrar; Procesar Pago",
            "message");

        agregarMensaje(diagrama, adminCaja, ventasService,
            "2: api.buscarProductosPos/buscarClientesPos + api.crearVentaPresencial(): JwtAuthGuard -> PosController/VentasController -> permiso, sucursal, cliente, stock, precio e IVA",
            "message");

        agregarMensaje(diagrama, dataSource, adminCaja,
            "3: dataSource.transaction(): ventas Pendiente + venta_items; BitacoraService.registrar(); HTTP 201 { id_venta, total, estado: 'Pendiente', items }",
            "return");

        try {
            diagrama.Notes =
                "CU36 - La ruta real es /admin/caja dentro de AdminLayout; no existe un CajeroLayout. El menú Caja y Ventas muestra Nueva Venta (POS) si el usuario tiene realizar_venta." +
                String.fromCharCode(10) +
                "La implementación no separa CU36 y CU37: AdminCaja.procesarVenta() primero llama api.crearVentaPresencial() y, dentro del mismo envío, llama api.procesarPagoCaja(). Para Efectivo completa el cobro, actualiza inventario y genera comprobante; para Tarjeta, QR o Transferencia crea la transacción y devuelve terminal_url, dejando la venta Pendiente." +
                String.fromCharCode(10) +
                "El botón real es Procesar Pago · {total}, no Confirmar Venta. El frontend no muestra una venta Pendiente intermedia con un botón posterior para CU37; si el pago falla después del INSERT de la venta, la venta queda Pendiente y el formulario conserva los items." +
                String.fromCharCode(10) +
                "La venta y venta_items se insertan dentro de dataSource.transaction(). La llamada a BitacoraService.registrar() ocurre después; si la auditoría falla, la venta puede quedar creada aunque el frontend reciba error. No hay idempotencia de servidor: un reintento puede crear otra venta." +
                String.fromCharCode(10) +
                "El permiso real exigido por AdminCaja y VentasService, a través de PosController o VentasController, es realizar_venta o *. La semilla del rol Cajero en schema.sql concede registrar_venta, procesar_pagos, ver_inventario y gestionar_devoluciones, pero no realizar_venta; con esa semilla el acceso y la venta responden 403." +
                String.fromCharCode(10) +
                "schema.sql define productos.estado con valor predeterminado Disponible, pero buscarProductosPos() filtra p.estado = 'Activo'. El mismo criterio se repite al crear la venta. schema.sql tampoco define productos.porcentaje_iva ni categorias.porcentaje_iva_default, aunque el service los consulta para el IVA." +
                String.fromCharCode(10) +
                "La búsqueda y el registro usan producto_precios si están vigente por fechas, pero no tienen ORDER BY ni selección de la fila más reciente cuando existen varios precios activos. El precio mostrado en AdminCaja se recalcula al guardar la venta." +
                String.fromCharCode(10) +
                "El stock se valida antes de la transacción y sin FOR UPDATE. CU36 no lo descuenta; CU37 vuelve a bloquear y validar el stock. La venta presencial puede quedar Pendiente si el stock cambia entre ambas operaciones." +
                String.fromCharCode(10) +
                "nit_cliente y razon_social no se persisten en ventas; sólo se incluyen en new_data de bitacora_auditoria. La respuesta real de crearVentaPresencial() no incluye subtotal ni impuestos, y new_data no incluye n_items aunque el propósito lo indica." +
                String.fromCharCode(10) +
                "El formulario permite escribir cantidades hasta 10000 aunque el stock mostrado sea menor; crearVentaPresencial() valida la cantidad y devuelve 409 si supera cantidad_disponible. No se encontró un endpoint o pantalla de historial o listado de ventas de sucursadad; la consulta disponible para reportes es el flujo por voz de CU43." +
                String.fromCharCode(10) +
                "Las tablas tallas, colores, categorias, usuarios y roles no se representan como cajas por ser relaciones auxiliares; VentasService las consulta para mostrar variantes, calcular IVA y resolver permisos.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU36 mínimo creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Clases y entidades esenciales conservadas; 3 mensajes."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU36 mínimo", 0);
    }
}

main();
