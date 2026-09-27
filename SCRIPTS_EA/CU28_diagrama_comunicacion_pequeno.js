// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU28 - Realizar Reserva de Múltiples Prendas
// Diagrama de comunicación con elementos muy pequeños.
//
// Fuente de verdad: React/Vite + NestJS + schema.sql.
// Se muestra el flujo invitado real y también la página multiítem
// existente pero no registrada en RouterApp.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "RouterApp": "IU_RouterApp",
    "LayoutRaiz": "IU_LayoutRaiz",
    "Catalogo": "IU_Catalogo",
    "Producto": "IU_Producto",
    "ModalReserva": "IU_ModalReserva",
    "NuevaReserva": "IU_NuevaReserva",
    "AuthProvider": "IU_AuthProvider",
    "Login": "IU_Login",
    "Registro": "IU_Registro",
    "ClienteLayout": "IU_ClienteLayout",
    "MisReservas": "IU_MisReservas",
    "AdminReservas": "IU_AdminReservas",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "CatalogoController": "CTR_Catalogo",
    "CatalogoService": "SRV_CatalogoService",
    "ReservasController": "CTR_Reservas",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "ReservasService": "SRV_ReservasService",
    "EmailService": "SRV_EmailService",
    "BitacoraService": "SRV_BitacoraService",
    "DataSource": "SRV_DataSource",
    "fn_aplicar_movimiento_inventario": "SRV_fn_aplicar_movimiento_inventario",
    "trg_movimiento_inventario": "SRV_trg_movimiento_inventario",
    "roles": "CE_Roles",
    "usuarios_roles": "CE_UsuariosRoles",
    "usuarios_empleados": "CE_UsuariosEmpleados",
    "clientes": "CE_Clientes",
    "sucursales": "CE_Sucursales",
    "sucursal_horarios": "CE_SucursalHorarios",
    "producto_talla_color": "CE_ProductoTallaColor",
    "productos": "CE_Productos",
    "tallas": "CE_Tallas",
    "colores": "CE_Colores",
    "inventario_stock": "CE_InventarioStock",
    "reservas": "CE_Reservas",
    "reserva_items": "CE_ReservaItems",
    "movimientos_inventario": "CE_MovimientosInventario"
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU28", 0);
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
            elemento.Notes = actual == "" ? nota : actual + "\n" + nota;
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

// Agrupa mensajes secundarios para reducir la cantidad de flechas.
function agregarMensajes(diagrama, origen, destino, mensajes, estereotipo)
{
    var etiqueta = "";

    for (var i = 0; i < mensajes.length; i++) {
        if (etiqueta != "") etiqueta += "\n";
        etiqueta += mensajes[i];
    }

    agregarMensaje(diagrama, origen, destino, etiqueta, estereotipo);
}

function main()
{
    aviso("Generando CU28 - Elementos muy pequeños...");

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
            "CU28 - Reserva de Múltiples Prendas - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU28 - Realizar Reserva de Múltiples Prendas - Diagrama de Comunicación Elementos Muy Pequeños",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Visitante de Reservas (actor externo)",
            "ACTOR_VisitanteReservas",
            "Visitante sin sesión que arma una reserva o Cliente autenticado que confirma."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx; /reservas/nueva redirige a /catalogo."
        );

        var layoutRaiz = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "LayoutRaiz", "Object", "Class", "Boundary",
            "web/src/components/layout/LayoutRaiz.tsx; layout público."
        );

        var catalogo = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Catalogo", "Object", "Class", "Boundary",
            "web/src/pages/Catalogo.tsx; catálogo público y ModalReserva."
        );

        var producto = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Producto", "Object", "Class", "Boundary",
            "web/src/pages/Producto.tsx; detalle público y ModalReserva."
        );

        var modalReserva = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ModalReserva", "Object", "Class", "Boundary",
            "web/src/components/reserva/ModalReserva.tsx; reserva real de una prenda."
        );

        var nuevaReserva = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "NuevaReserva", "Object", "Class", "Boundary",
            "web/src/pages/cliente/NuevaReserva.tsx; multiítem, pero RouterApp no la registra."
        );

        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx; token y usuario en localStorage."
        );

        var login = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Login", "Object", "Class", "Boundary",
            "web/src/pages/Login.tsx; redirect e indicación de reserva pendiente."
        );

        var registro = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Registro", "Object", "Class", "Boundary",
            "web/src/pages/Registro.tsx; registro con redirect a login."
        );

        var clienteLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ClienteLayout", "Object", "Class", "Boundary",
            "web/src/components/layout/cliente/ClienteLayout.tsx; no protege /reservas."
        );

        var misReservas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "MisReservas", "Object", "Class", "Boundary",
            "web/src/pages/cliente/MisReservas.tsx; consulta las reservas propias."
        );

        var adminReservas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminReservas", "Object", "Class", "Boundary",
            "web/src/pages/admin/AdminReservas.tsx; seguimiento de sucursal CU30."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts; opciones, disponibilidad, crearReserva() y sesión."
        );

        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "web/src/lib/api.ts; handleResponse() y errores de red."
        );

        var catalogoController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "CatalogoController", "Object", "Class", "Control",
            "api/src/modulos/catalogo/CTR_Catalogo.ts; rutas públicas."
        );

        var catalogoService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "CatalogoService", "Object", "Class", "Service",
            "api/src/modulos/catalogo/SRV_CatalogoService.ts; catálogo y disponibilidad."
        );

        var reservasController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ReservasController", "Object", "Class", "Control",
            "api/src/modulos/reservas/CTR_Reservas.ts; opciones/availability públicas, POST protegido."
        );

        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts; POST /reservas usa guard."
        );

        var reservasService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ReservasService", "Object", "Class", "Service",
            "api/src/modulos/reservas/SRV_ReservasService.ts; crearReserva() y notificación."
        );

        var emailService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "EmailService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_EmailService.ts; aviso de nueva reserva."
        );

        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_BitacoraService.ts; auditoría INSERT y NOTIFICAR."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "TypeORM DataSource; transacción y SQL directo."
        );

        var fnMovimiento = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "fn_aplicar_movimiento_inventario", "Object", "Class", "Service",
            "BASE DE DATOS/schema.sql: función BEFORE INSERT de movimientos_inventario."
        );

        var triggerMovimiento = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "trg_movimiento_inventario", "Object", "Class", "Service",
            "BASE DE DATOS/schema.sql: trigger que invoca fn_aplicar_movimiento_inventario()."
        );

        var roles = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "roles", "Object", "Class", "Entity",
            "Tabla SQL de roles; permisos_json."
        );

        var usuariosRoles = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "usuarios_roles", "Object", "Class", "Entity",
            "Tabla SQL de asignación usuario-rol."
        );

        var usuariosEmpleados = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "usuarios_empleados", "Object", "Class", "Entity",
            "Tabla SQL; sucursal para seguimiento administrativo, no para crear como cliente."
        );

        var clientes = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "clientes", "Object", "Class", "Entity",
            "Tabla SQL; id_cliente vinculado por usuario_id."
        );

        var sucursales = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sucursales", "Object", "Class", "Entity",
            "Tabla SQL; estado real Activa/Inactiva."
        );

        var sucursalHorarios = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sucursal_horarios", "Object", "Class", "Entity",
            "Tabla SQL de horarios por día."
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Tabla SQL de variantes id_ptc y estado_stock."
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Tabla SQL de productos; estado Activo."
        );

        var tallas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "tallas", "Object", "Class", "Entity",
            "Tabla SQL de tallas."
        );

        var colores = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "colores", "Object", "Class", "Entity",
            "Tabla SQL de colores."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Tabla SQL de stock por id_ptc e id_sucursal."
        );

        var reservas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "reservas", "Object", "Class", "Entity",
            "Tabla SQL de reservas; estado Solicitada."
        );

        var reservaItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "reserva_items", "Object", "Class", "Entity",
            "Tabla SQL de múltiples id_ptc y cantidades."
        );

        var movimientosInventario = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "movimientos_inventario", "Object", "Class", "Entity",
            "Tabla SQL del Kardex; el servicio inserta SALIDA-RESERVA."
        );

        // Elementos muy pequeños, organizados por capas.
        posicionar(diagrama, actor, 20, 20, 150, 45);
        posicionar(diagrama, routerApp, 190, 20, 310, 45);
        posicionar(diagrama, layoutRaiz, 360, 20, 480, 45);
        posicionar(diagrama, catalogo, 530, 20, 650, 45);
        posicionar(diagrama, producto, 700, 20, 820, 45);

        posicionar(diagrama, modalReserva, 20, 75, 150, 100);
        posicionar(diagrama, nuevaReserva, 190, 75, 310, 100);
        posicionar(diagrama, authProvider, 360, 75, 480, 100);
        posicionar(diagrama, login, 530, 75, 650, 100);
        posicionar(diagrama, registro, 700, 75, 820, 100);

        posicionar(diagrama, clienteLayout, 20, 130, 150, 155);
        posicionar(diagrama, misReservas, 190, 130, 310, 155);
        posicionar(diagrama, adminReservas, 360, 130, 480, 155);
        posicionar(diagrama, api, 530, 130, 650, 155);
        posicionar(diagrama, apiError, 700, 130, 820, 155);

        posicionar(diagrama, catalogoController, 20, 185, 150, 210);
        posicionar(diagrama, catalogoService, 190, 185, 310, 210);
        posicionar(diagrama, reservasController, 360, 185, 480, 210);
        posicionar(diagrama, jwtAuthGuard, 530, 185, 650, 210);
        posicionar(diagrama, reservasService, 700, 185, 820, 210);

        posicionar(diagrama, emailService, 20, 240, 150, 265);
        posicionar(diagrama, bitacoraService, 190, 240, 310, 265);
        posicionar(diagrama, dataSource, 360, 240, 480, 265);
        posicionar(diagrama, fnMovimiento, 530, 240, 650, 265);
        posicionar(diagrama, roles, 700, 240, 820, 265);
        posicionar(diagrama, triggerMovimiento, 850, 240, 970, 265);

        posicionar(diagrama, usuariosRoles, 20, 295, 150, 320);
        posicionar(diagrama, usuariosEmpleados, 190, 295, 310, 320);
        posicionar(diagrama, clientes, 360, 295, 480, 320);
        posicionar(diagrama, sucursales, 530, 295, 650, 320);
        posicionar(diagrama, sucursalHorarios, 700, 295, 820, 320);

        posicionar(diagrama, productoTallaColor, 20, 350, 150, 375);
        posicionar(diagrama, productos, 190, 350, 310, 375);
        posicionar(diagrama, tallas, 360, 350, 480, 375);
        posicionar(diagrama, colores, 530, 350, 650, 375);
        posicionar(diagrama, inventarioStock, 700, 350, 820, 375);

        posicionar(diagrama, reservas, 20, 405, 150, 430);
        posicionar(diagrama, reservaItems, 190, 405, 310, 430);
        posicionar(diagrama, movimientosInventario, 360, 405, 480, 430);

        // ============================================================
        // FLUJO PÚBLICO REAL: CATÁLOGO + MODAL DE UNA PRENDA.
        // ============================================================

        agregarMensajes(diagrama, actor, routerApp, [
            "1: visitante entra al catálogo público sin sesión"
        ], "message");

        agregarMensajes(diagrama, routerApp, layoutRaiz, [
            "2: /catalogo y /productos/:codigo -> LayoutRaiz"
        ], "message");

        agregarMensajes(diagrama, routerApp, nuevaReserva, [
            "3: /reservas/nueva -> <Navigate to='/catalogo' replace />",
            "NuevaReserva.tsx existe, pero RouterApp no importa ni registra la página"
        ], "not-implemented");

        agregarMensajes(diagrama, layoutRaiz, catalogo, [
            "4: Route /catalogo -> <Catalogo />"
        ], "message");

        agregarMensajes(diagrama, layoutRaiz, producto, [
            "5: Route /productos/:codigo -> <Producto />"
        ], "message");

        agregarMensajes(diagrama, catalogo, modalReserva, [
            "6: botón 'Reservar para probar'",
            "abrir ModalReserva con id_producto, nombre, código y precio",
            "si no hay intención, ModalReserva elige la primera variante"
        ], "message");

        agregarMensajes(diagrama, producto, modalReserva, [
            "7: 'Reservar para probar en sucursal'",
            "preselecciona talla y color seleccionados en Producto"
        ], "message");

        agregarMensajes(diagrama, catalogo, api, [
            "8: GET /api/v1/catalogo/publico y /publico/:codigo/disponibilidad",
            "consulta pública sin JwtAuthGuard"
        ], "message");

        agregarMensajes(diagrama, producto, api, [
            "9: GET /api/v1/catalogo/publico/:codigo/disponibilidad",
            "selección de variante desde disponibilidad"
        ], "message");

        agregarMensajes(diagrama, api, catalogoController, [
            "10: GET /catalogo/publico...; controller sin guard"
        ], "message");

        agregarMensajes(diagrama, catalogoController, catalogoService, [
            "11: listarPublico() / consultarDisponibilidad()"
        ], "message");

        agregarMensajes(diagrama, modalReserva, api, [
            "12: GET /api/v1/reservas/opciones",
            "GET /api/v1/reservas/disponibilidad/{id_sucursal}",
            "ambos endpoints son públicos; api puede adjuntar token si existe"
        ], "message");

        agregarMensajes(diagrama, api, reservasController, [
            "13: GET /reservas/opciones",
            "GET /reservas/disponibilidad/:id_sucursal",
            "no tienen @UseGuards(JwtAuthGuard)"
        ], "message");

        agregarMensajes(diagrama, reservasController, reservasService, [
            "14: obtenerOpciones() / obtenerDisponibilidad(idSucursal)"
        ], "message");

        agregarMensajes(diagrama, reservasService, dataSource, [
            "15: sucursales LOWER(estado)='activa' + sucursal_horarios",
            "16: producto_talla_color estado_stock='Disponible'",
            "17: inventario_stock disponibilidad por sucursal"
        ], "message");

        agregarMensajes(diagrama, dataSource, sucursales, [
            "18: opciones de sucursal y validación de existencia/estado"
        ], "message");

        agregarMensajes(diagrama, dataSource, sucursalHorarios, [
            "19: dia_semana, horario_apertura, horario_cierre"
        ], "message");

        agregarMensajes(diagrama, dataSource, productoTallaColor, [
            "20: id_ptc, id_producto, nombre, talla, color, estado_stock"
        ], "message");

        agregarMensajes(diagrama, dataSource, productos, [
            "21: productos LOWER(estado)='activo'"
        ], "message");

        agregarMensajes(diagrama, dataSource, inventarioStock, [
            "22: cantidad_disponible y cantidad_reservada por id_ptc/id_sucursal"
        ], "message");

        agregarMensajes(diagrama, modalReserva, modalReserva, [
            "23: talla, color, cantidad, sucursal, fecha y hora",
            "24: valida availability localmente y muestra 'Confirmando...' al enviar",
            "25: ModalReserva solo maneja una prenda; no tiene panel multiítem"
        ], "message");

        // ============================================================
        // CONFIRMACIÓN INVITADA: INTENCIÓN + LOGIN/REGISTRO.
        // ============================================================

        agregarMensajes(diagrama, modalReserva, modalReserva, [
            "26: sin token -> guardar tm_intencion_reserva en sessionStorage",
            "redirect real: /login?redirect=<ruta actual>",
            "guarda id_producto, talla, color, cantidad, sucursal, fecha y hora",
            "no usa /reservas/nueva en el flujo accesible"
        ], "message");

        agregarMensajes(diagrama, modalReserva, login, [
            "27: navigate('/login?redirect=...')",
            "el texto visible de Login: 'Inicia sesión para confirmar tu reserva. Al autenticarte volverás con tus datos listos para confirmar.'"
        ], "message");

        agregarMensajes(diagrama, login, authProvider, [
            "28: useAuth(); login(credencial, password)",
            "si usuario ya existe -> Navigate al redirect válido"
        ], "message");

        agregarMensajes(diagrama, registro, login, [
            "29: Registro -> /login?redirect=... tras completar el registro"
        ], "message");

        agregarMensajes(diagrama, authProvider, api, [
            "30: POST /api/v1/auth/login",
            "access_token y usuario se guardan en localStorage"
        ], "message");

        agregarMensajes(diagrama, api, authProvider, [
            "31: 200 LoginResponse; evento tm:sesion actualiza AuthContext"
        ], "return");

        agregarMensajes(diagrama, login, catalogo, [
            "32: tras login, Catalogo/Producto leen tm_intencion_reserva",
            "abren ModalReserva y restorations de talla/color/cantidad"
        ], "return");

        agregarMensajes(diagrama, nuevaReserva, nuevaReserva, [
            "33: archivo con panel 'Tu Reserva' y múltiples líneas",
            "guarda tm_borrador_reserva; POST con items[]",
            "pero no es accesible porque /reservas/nueva redirige a /catalogo",
            "Login/Catalogo restauran tm_intencion_reserva, no tm_borrador_reserva"
        ], "not-implemented");

        // ============================================================
        // CONFIRMACIÓN AUTENTICADA Y TRANSACCIÓN DE RESERVA.
        // ============================================================

        agregarMensajes(diagrama, modalReserva, api, [
            "34: POST /api/v1/reservas",
            "body: { id_sucursal, fecha_reserva, hora_reserva, items:[{ id_ptc, cantidad }] }",
            "Authorization: Bearer ${token}"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "35: credentials:'include'; 401 intenta renovarToken() y reintenta"
        ], "message");

        agregarMensajes(diagrama, api, reservasController, [
            "36: POST /reservas"
        ], "message");

        agregarMensajes(diagrama, reservasController, jwtAuthGuard, [
            "37: @UseGuards(JwtAuthGuard) en POST",
            "UsuarioActual(); token expirado/inválido -> 401"
        ], "message");

        agregarMensajes(diagrama, reservasController, reservasService, [
            "38: crearReserva(currentUser, dto, request)"
        ], "message");

        agregarMensajes(diagrama, reservasService, dataSource, [
            "39: exigirPermiso('gestionar_reservas')",
            "40: clienteDe() -> clientes.id_cliente por usuario_id",
            "41: valida fecha, hora, sucursal y horario",
            "42: validarPrendas() por cada id_ptc"
        ], "validation");

        agregarMensajes(diagrama, dataSource, roles, [
            "43: SELECT r.permisos_json; '*' o 'gestionar_reservas'"
        ], "validation");

        agregarMensajes(diagrama, dataSource, usuariosRoles, [
            "44: JOIN usuarios_roles para permisos"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuariosEmpleados, [
            "45: no se usa para crear; se usa en alcance administrativo de reservas"
        ], "not-implemented");

        agregarMensajes(diagrama, dataSource, clientes, [
            "46: SELECT id_cliente WHERE usuario_id=$1",
            "sin vínculo -> 'Tu usuario no está registrado como cliente.'"
        ], "validation");

        agregarMensajes(diagrama, dataSource, sucursales, [
            "47: SELECT sucursal; estado real debe ser 'activa'",
            "inactiva -> 'La sucursal seleccionada no está activa.'"
        ], "validation");

        agregarMensajes(diagrama, dataSource, sucursalHorarios, [
            "48: busca dia_semana de la fecha",
            "sin horario -> 'No hay horario de atención definido para el ...'",
            "hora fuera -> 'La hora seleccionada está fuera del horario de atención (...).'"
        ], "validation");

        agregarMensajes(diagrama, dataSource, productoTallaColor, [
            "49: valida id_ptc, estado_stock y producto activo",
            "prenda no existente -> 'Prenda no encontrada.'",
            "no disponible -> 'La prenda [nombre] no está disponible actualmente.'"
        ], "validation");

        agregarMensajes(diagrama, dataSource, productos, [
            "50: JOIN productos + tallas + colores para nombre y variante"
        ], "message");

        agregarMensajes(diagrama, reservasService, dataSource, [
            "51: dataSource.transaction()",
            "INSERT reservas estado='Solicitada' y fecha_creacion=NOW()",
            "INSERT reserva_items por cada línea",
            "SELECT inventario_stock FOR UPDATE y valida cantidad"
        ], "message");

        agregarMensajes(diagrama, dataSource, reservas, [
            "52: INSERT id_cliente, id_usuario, id_sucursal, fecha, hora",
            "número RES-000001 se deriva del id_reserva"
        ], "message");

        agregarMensajes(diagrama, dataSource, reservaItems, [
            "53: INSERT (id_reserva, id_ptc, cantidad)"
        ], "message");

        agregarMensajes(diagrama, dataSource, movimientosInventario, [
            "54: INSERT tipo_movimiento='SALIDA-RESERVA', cantidad=-cantidad",
            "referencia=numero, id_usuario, id_reserva"
        ], "message");

        agregarMensajes(diagrama, triggerMovimiento, fnMovimiento, [
            "55: trg_movimiento_inventario BEFORE INSERT",
            "-> fn_aplicar_movimiento_inventario()"
        ], "message");

        agregarMensajes(diagrama, fnMovimiento, movimientosInventario, [
            "56: calcula stock_anterior/stock_posterior y descuenta disponible"
        ], "message");

        agregarMensajes(diagrama, dataSource, inventarioStock, [
            "57: UPDATE cantidad_reservada = cantidad_reservada + cantidad",
            "cantidad_disponible disminuye por el trigger del movimiento"
        ], "message");

        agregarMensajes(diagrama, reservasService, reservasService, [
            "58: stock insuficiente -> ConflictException con nombre, talla, color y disponible",
            "la excepción dentro de transaction() revierte la reserva"
        ], "error");

        agregarMensajes(diagrama, reservasService, bitacoraService, [
            "59: registrar(..., 'INSERT', 'reservas', ..., new_data)",
            "60: registrar(..., 'NOTIFICAR', 'reservas', ...)"
        ], "message");

        agregarMensajes(diagrama, bitacoraService, dataSource, [
            "61: repo.save(bitacora) -> bitacora_auditoria"
        ], "message");

        agregarMensajes(diagrama, reservasService, emailService, [
            "62: notificarSucursal() después de crear",
            "enviarAvisoReserva() a empleados activos de la sucursal"
        ], "message");

        agregarMensajes(diagrama, reservasService, reservasController, [
            "63: 201 { detail: 'Reserva RES-000001 creada.', id_reserva, numero, estado:'Solicitada', total_items }"
        ], "return");

        agregarMensajes(diagrama, reservasController, api, [
            "64: return resultado; HTTP 201"
        ], "return");

        agregarMensajes(diagrama, api, modalReserva, [
            "65: limpiarIntencionReserva(); onCerrar(); navigate('/reservas/{id_reserva}')"
        ], "return");

        agregarMensajes(diagrama, api, nuevaReserva, [
            "66: flujo multiítem: setToast(detail); limpia líneas y sessionStorage",
            "no navega a detalle en la página no registrada"
        ], "return");

        agregarMensajes(diagrama, modalReserva, misReservas, [
            "67: Detalle /reservas/:id y luego MisReservas -> GET /reservas/mias",
            "ambos endpoints requieren JwtAuthGuard"
        ], "message");

        agregarMensajes(diagrama, misReservas, api, [
            "68: GET /api/v1/reservas/mias",
            "GET /api/v1/reservas/{id_reserva}"
        ], "message");

        agregarMensajes(diagrama, adminReservas, api, [
            "69: GET /api/v1/reservas/sucursal y /pendientes",
            "seguimiento CU30; alcance por usuarios_empleados.sucursal_id"
        ], "message");

        // ============================================================
        // EXCEPCIONES Y DIFERENCIAS DE LA ESPECIFICACIÓN.
        // ============================================================

        agregarMensajes(diagrama, reservasService, reservasService, [
            "E1: 'No tienes permisos para realizar reservas.'",
            "ClienteLayout no protege /reservas; el API puede responder 401/403",
            "Cliente seed no incluye gestionar_reservas"
        ], "error");

        agregarMensajes(diagrama, jwtAuthGuard, apiError, [
            "E2: 401 'No autenticado.' / 'Token expirado o inválido.' / 'Token revocado.'",
            "solicitar() intenta refresh; si no puede, expulsa la sesión",
            "la intención/borrador puede permanecer en sessionStorage"
        ], "error");

        agregarMensajes(diagrama, reservasController, reservasService, [
            "E3: items vacío -> 'Debes seleccionar al menos una prenda.'",
            "E4: id_ptc inexistente -> 'Prenda no encontrada.'",
            "E4: cantidad <= 0 -> 'La cantidad debe ser un número entero mayor a cero.'",
            "E4: producto inactivo/Sin stock -> 'La prenda [nombre] no está disponible actualmente.'"
        ], "error");

        agregarMensajes(diagrama, reservasService, dataSource, [
            "E5: 409 'Stock insuficiente de la prenda [nombre] (talla, color). Disponible: X.'",
            "E6: fecha anterior -> 'La fecha de reserva no puede ser anterior al día de hoy.'",
            "E6: sucursal -> 'La sucursal seleccionada no está activa.'",
            "E6: horario -> 'La hora seleccionada está fuera del horario de atención (...).'"
        ], "error");

        agregarMensajes(diagrama, modalReserva, apiError, [
            "E7: fetch/red sin respuesta -> fallback local; no existe el texto exacto 'Error de conexión...' en este flujo",
            "NuevaReserva/ModalReserva usan 'No se pudo crear la reserva.' o el error de ApiError"
        ], "error");

        agregarMensajes(diagrama, modalReserva, modalReserva, [
            "E8: el botón se deshabilita durante POST; en el camino invitado no permanece loading durante toda la redirección",
            "E9: al volver se recargan opciones/disponibilidad; si cambia stock, el backend revalida"
        ], "validation");

        agregarMensajes(diagrama, nuevaReserva, routerApp, [
            "E10: la página multiítem y /reservas/nueva no están conectadas en RouterApp",
            "el flujo guest real usa ModalReserva de una prenda"
        ], "not-implemented");

        try {
            diagrama.Notes =
                "CU28 - Flujo real de la implementación actual (React/Vite + NestJS).\n" +
                "El catálogo público y ModalReserva permiten reservar una prenda sin iniciar sesión.\n" +
                "GET /reservas/opciones y GET /reservas/disponibilidad/:id_sucursal son públicos; POST /reservas usa JwtAuthGuard.\n" +
                "La ruta /reservas/nueva está definida como Navigate a /catalogo; NuevaReserva.tsx no se importa en RouterApp.\n" +
                "ModalReserva guarda tm_intencion_reserva y redirige al login con la ruta actual; no guarda un panel multiítem.\n" +
                "NuevaReserva usa tm_borrador_reserva, pero Login/Catalogo solo restauran tm_intencion_reserva.\n" +
                "El servicio crea reservas, reserva_items, movimientos SALIDA-RESERVA y actualiza stock dentro de una transacción.\n" +
                "El trigger fn_aplicar_movimiento_inventario descuenta cantidad_disponible; el servicio incrementa cantidad_reservada.\n" +
                "Después de la transacción se registran dos auditorías y se notifica por email a la sucursal.\n" +
                "La UI es React; no utiliza Angular, MatDialog ni Flutter.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU28 con elementos muy pequeños creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Se muestran el flujo invitado real y la página multiítem no registrada.\n" +
            "Los mensajes secundarios y las discrepancias fueron agrupados.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU28", 0);
    }
}

main();
