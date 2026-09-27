// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU29 - Consultar y Cancelar el Estado de una Reserva
// Diagrama de comunicación compacto conservando participantes.
//
// Se mantienen las clases UI/CTR/SRV y las entidades relevantes.
// Sólo se eliminan mensajes secundarios: 9 mensajes agrupados.
//
// Fuente de verdad: React/Vite + NestJS + schema.sql.
// No se modifica el diagrama anterior; crea una versión compacta.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "RouterApp": "IU_RouterApp",
    "ClienteLayout": "IU_ClienteLayout",
    "MisReservas": "IU_MisReservas",
    "DetalleReserva": "IU_DetalleReserva",
    "MenuCliente": "IU_MenuCliente",
    "AuthProvider": "IU_AuthProvider",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "AdminLayout": "IU_AdminLayout",
    "AdminReservas": "IU_AdminReservas",
    "Catalogo": "IU_Catalogo",
    "ReservasController": "CTR_Reservas",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "ReservasService": "SRV_ReservasService",
    "DataSource": "SRV_DataSource",
    "EntityManager": "SRV_EntityManager",
    "BitacoraService": "SRV_BitacoraService",
    "RequestExpress": "IU_RequestExpress",
    "roles": "CE_Roles",
    "usuarios_roles": "CE_UsuariosRoles",
    "usuarios_empleados": "CE_UsuariosEmpleados",
    "clientes": "CE_Clientes",
    "reservas": "CE_Reservas",
    "reserva_items": "CE_ReservaItems",
    "producto_talla_color": "CE_ProductoTallaColor",
    "productos": "CE_Productos",
    "tallas": "CE_Tallas",
    "colores": "CE_Colores",
    "sucursales": "CE_Sucursales",
    "ciudades": "CE_Ciudades",
    "inventario_stock": "CE_InventarioStock",
    "movimientos_inventario": "CE_MovimientosInventario",
    "bitacora_auditoria": "CE_BitacoraAuditoria",
    "fn_aplicar_movimiento_inventario": "SRV_fn_aplicar_movimiento_inventario",
    "trg_movimiento_inventario": "SRV_trg_movimiento_inventario"
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU29 compacto", 0);
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

function agregarMensajes(diagrama, origen, destino, mensajes, estereotipo)
{
    var etiqueta = "";
    var salto = String.fromCharCode(10);

    for (var i = 0; i < mensajes.length; i++) {
        if (etiqueta != "") etiqueta += salto;
        etiqueta += mensajes[i];
    }

    agregarMensaje(diagrama, origen, destino, etiqueta, estereotipo);
}

function main()
{
    aviso("Generando CU29 compacto con participantes...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "7. Reservas y Atención");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "7. Reservas y Atención");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU29 - Consulta y Cancelación de Reserva - Comunicación compacta"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU29 - Consultar y Cancelar Reserva - Diagrama de Comunicación Compacto con Participantes",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz, paqueteActores,
            "Cliente de Reservas (actor externo)",
            "ACTOR_ClienteReservas",
            "Consulta y cancela sus reservas."
        );

        var actorAdmin = obtenerOCrearActor(
            raiz, paqueteActores,
            "Encargado/Administrador de Reservas (actor secundario)",
            "ACTOR_EncargadoAdminReservas",
            "Supervisa y prepara reservas de la sucursal."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "Rutas /reservas y /reservas/:id."
        );

        var clienteLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ClienteLayout", "Object", "Class", "Boundary",
            "Layout de cliente; no protege las rutas."
        );

        var misReservas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "MisReservas", "Object", "Class", "Boundary",
            "Lista de reservas propias."
        );

        var detalleReserva = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DetalleReserva", "Object", "Class", "Boundary",
            "Detalle, línea de tiempo y cancelación."
        );

        var menuCliente = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "MenuCliente", "Object", "Class", "Boundary",
            "Menú de Mis Reservas."
        );

        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "Token y sesión."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "Cliente HTTP."
        );

        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "Errores HTTP/red."
        );

        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "Layout administrativo."
        );

        var adminReservas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminReservas", "Object", "Class", "Boundary",
            "Reservas de la sucursal."
        );

        var catalogo = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Catalogo", "Object", "Class", "Boundary",
            "Catálogo público; estado vacío."
        );

        var reservasController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ReservasController", "Object", "Class", "Control",
            "CTR_Reservas.ts."
        );

        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "Guard de las rutas CU29."
        );

        var reservasService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ReservasService", "Object", "Class", "Service",
            "consultarMias(), consultarDetalle() y cancelar()."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "SQL de reservas, clientes e inventario."
        );

        var entityManager = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "EntityManager", "Object", "Class", "Service",
            "Transacción de cancelación."
        );

        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "Auditoría."
        );

        var requestExpress = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RequestExpress", "Object", "Class", "Boundary",
            "IP y user-agent."
        );

        var roles = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "roles", "Object", "Class", "Entity",
            "permisos_json."
        );

        var usuariosRoles = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "usuarios_roles", "Object", "Class", "Entity",
            "Roles del usuario."
        );

        var usuariosEmpleados = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "usuarios_empleados", "Object", "Class", "Entity",
            "Sucursal del empleado."
        );

        var clientes = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "clientes", "Object", "Class", "Entity",
            "id_cliente."
        );

        var reservas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "reservas", "Object", "Class", "Entity",
            "Reserva y estados."
        );

        var reservaItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "reserva_items", "Object", "Class", "Entity",
            "Prendas."
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Variante id_ptc."
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Producto."
        );

        var tallas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "tallas", "Object", "Class", "Entity",
            "Talla."
        );

        var colores = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "colores", "Object", "Class", "Entity",
            "Color."
        );

        var sucursales = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sucursales", "Object", "Class", "Entity",
            "Sucursal."
        );

        var ciudades = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ciudades", "Object", "Class", "Entity",
            "Ciudad."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Stock disponible/reservado."
        );

        var movimientosInventario = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "movimientos_inventario", "Object", "Class", "Entity",
            "Kardex."
        );

        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "bitacora_auditoria", "Object", "Class", "Entity",
            "Auditoría."
        );

        var fnMovimiento = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "fn_aplicar_movimiento_inventario", "Object", "Class", "Service",
            "Trigger de inventario."
        );

        var triggerMovimiento = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "trg_movimiento_inventario", "Object", "Class", "Service",
            " BEFORE INSERT de movimientos_inventario."
        );

        // Participantes conservados; disposición compacta en seis columnas.
        posicionar(diagrama, actor, 20, 20, 170, 45);
        posicionar(diagrama, actorAdmin, 20, 75, 170, 100);
        posicionar(diagrama, routerApp, 200, 20, 350, 45);
        posicionar(diagrama, clienteLayout, 380, 20, 530, 45);
        posicionar(diagrama, misReservas, 560, 20, 710, 45);
        posicionar(diagrama, detalleReserva, 740, 20, 890, 45);
        posicionar(diagrama, menuCliente, 920, 20, 1070, 45);

        posicionar(diagrama, authProvider, 200, 75, 350, 100);
        posicionar(diagrama, api, 380, 75, 530, 100);
        posicionar(diagrama, apiError, 560, 75, 710, 100);
        posicionar(diagrama, adminLayout, 740, 75, 890, 100);
        posicionar(diagrama, adminReservas, 920, 75, 1070, 100);
        posicionar(diagrama, catalogo, 200, 130, 350, 155);

        posicionar(diagrama, reservasController, 380, 130, 530, 155);
        posicionar(diagrama, jwtAuthGuard, 560, 130, 710, 155);
        posicionar(diagrama, reservasService, 740, 130, 890, 155);
        posicionar(diagrama, dataSource, 920, 130, 1070, 155);
        posicionar(diagrama, entityManager, 200, 185, 350, 210);
        posicionar(diagrama, bitacoraService, 380, 185, 530, 210);

        posicionar(diagrama, requestExpress, 560, 185, 710, 210);
        posicionar(diagrama, roles, 740, 185, 890, 210);
        posicionar(diagrama, usuariosRoles, 920, 185, 1070, 210);
        posicionar(diagrama, usuariosEmpleados, 200, 240, 350, 265);
        posicionar(diagrama, clientes, 380, 240, 530, 265);
        posicionar(diagrama, reservas, 560, 240, 710, 265);
        posicionar(diagrama, reservaItems, 740, 240, 890, 265);
        posicionar(diagrama, productoTallaColor, 920, 240, 1070, 265);

        posicionar(diagrama, productos, 200, 295, 350, 320);
        posicionar(diagrama, tallas, 380, 295, 530, 320);
        posicionar(diagrama, colores, 560, 295, 710, 320);
        posicionar(diagrama, sucursales, 740, 295, 890, 320);
        posicionar(diagrama, ciudades, 920, 295, 1070, 320);
        posicionar(diagrama, inventarioStock, 200, 350, 350, 375);
        posicionar(diagrama, movimientosInventario, 380, 350, 530, 375);
        posicionar(diagrama, bitacoraAuditoria, 560, 350, 710, 375);
        posicionar(diagrama, fnMovimiento, 740, 350, 890, 375);
        posicionar(diagrama, triggerMovimiento, 920, 350, 1070, 375);

        // ============================================================
        // SOLO MENSAJES PRINCIPALES: 9 conectores agrupados.
        // ============================================================

        agregarMensajes(diagrama, actor, routerApp, [
            "1: login y acceso a /reservas; las rutas React no tienen guard propio"
        ], "message");

        agregarMensajes(diagrama, routerApp, misReservas, [
            "2: renderiza lista MisReservas y DetalleReserva"
        ], "message");

        agregarMensajes(diagrama, misReservas, api, [
            "3: GET /api/v1/reservas/mias"
        ], "message");

        agregarMensajes(diagrama, api, reservasController, [
            "4: GET /reservas/mias, GET /reservas/:id y PATCH /reservas/:id/cancelar; JwtAuthGuard"
        ], "message");

        agregarMensajes(diagrama, reservasController, reservasService, [
            "5: consultarMias(), consultarDetalle() y cancelar(); permiso gestionar_reservas y clienteDe()"
        ], "message");

        agregarMensajes(diagrama, reservasService, dataSource, [
            "6: lista, detalle, pertenencia y cancelación: SELECT FOR UPDATE + estado Solicitada/Preparada",
            "SQL sobre roles, clientes, reservas, reserva_items, sucursales y producto/talla/color"
        ], "validation");

        agregarMensajes(diagrama, entityManager, movimientosInventario, [
            "7: UPDATE Cancelada + SALIDA-RESERVA positivo",
            "trg_movimiento_inventario suma disponible y el service reduce reservado"
        ], "message");

        agregarMensajes(diagrama, reservasService, bitacoraService, [
            "8: registrar UPDATE con old_data/new_data, IP y user agent después del commit"
        ], "message");

        agregarMensajes(diagrama, detalleReserva, api, [
            "9: PATCH /api/v1/reservas/:id/cancelar",
            "200 -> estado local Cancelada y toast; 403/404/401 se muestran como error"
        ], "return");

        try {
            diagrama.Notes =
                "CU29 - Participantes conservados y mensajes secundarios eliminados." +
                String.fromCharCode(10) +
                "La notificación/badge administrativa se documenta en CU30.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU29 compacto creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Clases y entidades conservadas; 9 mensajes agrupados."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU29 compacto", 0);
    }
}

main();
