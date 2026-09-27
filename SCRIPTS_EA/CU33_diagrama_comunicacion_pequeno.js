// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU33 - Agregar Productos al Carrito
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
    "RouterApp": "IU_RouterApp",
    "Catalogo": "IU_Catalogo",
    "Producto": "IU_Producto",
    "CartContext": "IU_CartContext",
    "CartPanel": "IU_CartPanel",
    "Navbar": "IU_Navbar",
    "Checkout": "IU_Checkout",
    "api": "IU_Api",
    "CarritoController": "CTR_Carrito",
    "JwtOpcionalAuthGuard": "CTR_JwtOpcionalAuthGuard",
    "CarritoService": "SRV_CarritoService",
    "DataSource": "SRV_DataSource",
    "BitacoraService": "SRV_BitacoraService",
    "roles": "CE_Roles",
    "usuarios_roles": "CE_UsuariosRoles",
    "carritos": "CE_Carritos",
    "carrito_items": "CE_CarritoItems",
    "producto_talla_color": "CE_ProductoTallaColor",
    "productos": "CE_Productos",
    "producto_precios": "CE_ProductoPrecios",
    "inventario_stock": "CE_InventarioStock",
    "sucursales": "CE_Sucursales",
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU33 mínimo", 0);
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
    aviso("Generando CU33 mínimo...");

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
            "CU33 - Agregar Productos al Carrito - Comunicación mínima"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU33 - Agregar Productos al Carrito - Diagrama de Comunicación Mínimo",
            "Communication"
        );

        var cliente = obtenerOCrearActor(
            raiz, paqueteActores,
            "Cliente/Invitado de Carrito (actor)",
            "ACTOR_ClienteCarrito",
            "El endpoint real también permite crear un carrito invitado."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "Rutas de catálogo, panel y checkout."
        );

        var catalogo = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Catalogo", "Object", "Class", "Boundary",
            "Agrega desde la tarjeta de producto."
        );

        var producto = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Producto", "Object", "Class", "Boundary",
            "Selecciona talla, color, cantidad y sucursal."
        );

        var cartContext = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "CartContext", "Object", "Class", "Boundary",
            "Estado global, token invitado, loading y apertura del panel."
        );

        var cartPanel = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "CartPanel", "Object", "Class", "Boundary",
            "Muestra, actualiza y quita ítems; enlace a Checkout."
        );

        var navbar = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Navbar", "Object", "Class", "Boundary",
            "Badge por total de unidades."
        );

        var checkout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Checkout", "Object", "Class", "Boundary",
            "CU34; no es una página de carrito completa."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "POST /api/v1/carrito/items y PATCH/DELETE de carrito."
        );

        var carritoController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "CarritoController", "Object", "Class", "Control",
            "CTR_Carrito.ts."
        );

        var jwtOpcional = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtOpcionalAuthGuard", "Object", "Class", "Control",
            "Permite usuario o X-Carrito-Token."
        );

        var carritoService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "CarritoService", "Object", "Class", "Service",
            "agregarItem(), precio, stock, carrito y subtotal."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "SQL de carrito, producto, precio, inventario y sucursal."
        );

        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "Auditoría INSERT/UPDATE."
        );

        var roles = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "roles", "Object", "Class", "Entity",
            "permisos_json."
        );

        var usuariosRoles = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "usuarios_roles", "Object", "Class", "Entity",
            "Permisos del usuario."
        );

        var carritos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "carritos", "Object", "Class", "Entity",
            "Carrito activo de usuario o invitado."
        );

        var carritoItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "carrito_items", "Object", "Class", "Entity",
            "Ítems, cantidades y precio unitario."
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Variante id_ptc."
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Precio base y producto."
        );

        var productoPrecios = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_precios", "Object", "Class", "Entity",
            "Precio vigente."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Disponibilidad por sucursal."
        );

        var sucursales = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sucursales", "Object", "Class", "Entity",
            "Sucursal activa."
        );

        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "bitacora_auditoria", "Object", "Class", "Entity",
            "Traza de carrito_items."
        );

        // Participantes esenciales; seis columnas.
        posicionar(diagrama, cliente, 20, 20, 170, 45);
        posicionar(diagrama, routerApp, 200, 20, 350, 45);
        posicionar(diagrama, catalogo, 380, 20, 530, 45);
        posicionar(diagrama, producto, 560, 20, 710, 45);
        posicionar(diagrama, cartContext, 740, 20, 890, 45);
        posicionar(diagrama, api, 920, 20, 1070, 45);

        posicionar(diagrama, cartPanel, 20, 75, 170, 100);
        posicionar(diagrama, navbar, 200, 75, 350, 100);
        posicionar(diagrama, checkout, 380, 75, 530, 100);
        posicionar(diagrama, carritoController, 560, 75, 710, 100);
        posicionar(diagrama, jwtOpcional, 740, 75, 890, 100);
        posicionar(diagrama, carritoService, 920, 75, 1070, 100);

        posicionar(diagrama, dataSource, 20, 130, 170, 155);
        posicionar(diagrama, bitacoraService, 200, 130, 350, 155);
        posicionar(diagrama, roles, 380, 130, 530, 155);
        posicionar(diagrama, usuariosRoles, 560, 130, 710, 155);
        posicionar(diagrama, carritos, 740, 130, 890, 155);
        posicionar(diagrama, carritoItems, 920, 130, 1070, 155);

        posicionar(diagrama, productoTallaColor, 20, 185, 170, 210);
        posicionar(diagrama, productos, 200, 185, 350, 210);
        posicionar(diagrama, productoPrecios, 380, 185, 530, 210);
        posicionar(diagrama, inventarioStock, 560, 185, 710, 210);
        posicionar(diagrama, sucursales, 740, 185, 890, 210);
        posicionar(diagrama, bitacoraAuditoria, 920, 185, 1070, 210);

        // ============================================================
        // SOLO 3 MENSAJES ESENCIALES.
        // ============================================================

        agregarMensaje(diagrama, producto, cartContext,
            "1: seleccionar id_ptc, cantidad y sucursal; agregar al carrito", "message");

        agregarMensaje(diagrama, cartContext, carritoService,
            "2: api -> CarritoController -> JwtOpcionalAuthGuard -> CarritoService", "message");

        agregarMensaje(diagrama, carritoService, dataSource,
            "3: permiso, stock, precio, carrito, item, subtotal, bitácora y HTTP 201", "return");

        try {
            diagrama.Notes =
                "CU33 - El flujo real permite invitados mediante X-Carrito-Token; no exige siempre Bearer." +
                String.fromCharCode(10) +
                "El Cliente de schema.sql tiene comprar, no realizar_venta; el botón de carrito puede quedar oculto para usuarios autenticados sin ese permiso." +
                String.fromCharCode(10) +
                "El catálogo usa la primera sucursal y cantidad 1; Producto permite seleccionar talla, color, sucursal y cantidad." +
                String.fromCharCode(10) +
                "Un carrito activo existente conserva su sucursal aunque se envíe otra id_sucursal." +
                String.fromCharCode(10) +
                "La operación no usa una transacción única para item, subtotal y auditoría; un fallo posterior puede dejar el item persistido." +
                String.fromCharCode(10) +
                "schema.sql no define token_invitado en carritos, aunque el service lo consulta e inserta." +
                String.fromCharCode(10) +
                "El badge usa totalCantidad; /carrito es placeholder y Checkout es la ruta real de CU34.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU33 mínimo creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Clases y entidades esenciales conservadas; 3 mensajes."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU33 mínimo", 0);
    }
}

main();
