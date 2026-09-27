// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU30 - Notificar Reserva a la Sucursal
// Diagrama de comunicación compacto conservando participantes.
//
// Se conservan las clases UI/CTR/SRV y las entidades relevantes.
// Sólo se muestran 7 mensajes agrupados; los detalles secundarios
// quedan en las notas de los elementos.
//
// Fuente de verdad: React/Vite + NestJS + schema.sql.
// No modifica código de la aplicación.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "RouterApp": "IU_RouterApp",
    "AdminLayout": "IU_AdminLayout",
    "MenuAdmin": "IU_MenuAdmin",
    "AdminReservas": "IU_AdminReservas",
    "AuthProvider": "IU_AuthProvider",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "Catalogo": "IU_Catalogo",
    "ClienteLayout": "IU_ClienteLayout",
    "ReservasController": "CTR_Reservas",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "ReservasService": "SRV_ReservasService",
    "DataSource": "SRV_DataSource",
    "EntityManager": "SRV_EntityManager",
    "BitacoraService": "SRV_BitacoraService",
    "EmailService": "SRV_EmailService",
    "ConfigService": "SRV_ConfigService",
    "Logger": "SRV_Logger",
    "RequestExpress": "IU_RequestExpress",
    "roles": "CE_Roles",
    "usuarios_roles": "CE_UsuariosRoles",
    "usuarios_empleados": "CE_UsuariosEmpleados",
    "usuarios": "CE_Usuarios",
    "sucursales": "CE_Sucursales",
    "reservas": "CE_Reservas",
    "reserva_items": "CE_ReservaItems",
    "clientes": "CE_Clientes",
    "producto_talla_color": "CE_ProductoTallaColor",
    "productos": "CE_Productos",
    "tallas": "CE_Tallas",
    "colores": "CE_Colores",
    "inventario_stock": "CE_InventarioStock",
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU30 compacto", 0);
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
    aviso("Generando CU30 compacto...");

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
            "CU30 - Notificación de Reserva a Sucursal - Comunicación compacta"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU30 - Notificar Reserva a la Sucursal - Diagrama de Comunicación Compacto",
            "Communication"
        );

        var backend = obtenerOCrearActor(
            raiz, paqueteActores,
            "Backend (actor iniciador)",
            "ACTOR_BackendCU30",
            "Inicia la notificación como postcondición de CU28."
        );

        var encargado = obtenerOCrearActor(
            raiz, paqueteActores,
            "Encargado de Sucursal (actor receptor)",
            "ACTOR_EncargadoSucursal",
            "Consulta y prepara reservas de su sucursal."
        );

        var administrador = obtenerOCrearActor(
            raiz, paqueteActores,
            "Administrador General (actor supervisor)",
            "ACTOR_AdministradorReservas",
            "Supervisa todas las sucursales mediante permiso '*'."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "Ruta /admin/reservas."
        );

        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "No existe un EncargadoLayout separado; la ruta usa AdminLayout."
        );

        var menuAdmin = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "MenuAdmin", "Object", "Class", "Boundary",
            "adminMenu.ts; ítem Reservas de mi Sucursal."
        );

        var adminReservas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminReservas", "Object", "Class", "Boundary",
            "Lista, detalle y preparación de reservas."
        );

        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "Token, usuario y renovación."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "Rutas de reservas de sucursal y conteo."
        );

        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "Errores 401/403/404."
        );

        var clienteLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ClienteLayout", "Object", "Class", "Boundary",
            "Layout de cliente; CU29/CU28 related."
        );

        var catalogo = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Catalogo", "Object", "Class", "Boundary",
            "Origen de reservas CU28."
        );

        var reservasController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ReservasController", "Object", "Class", "Control",
            "CTR_Reservas.ts."
        );

        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "Protección de las rutas de sucursal."
        );

        var reservasService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ReservasService", "Object", "Class", "Service",
            "Crear, listar, contar y supervisar reservas."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "SQL y alcance de sucursal."
        );

        var entityManager = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "EntityManager", "Object", "Class", "Service",
            "Transacciones de las transiciones de reserva."
        );

        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "Auditoría INSERT/NOTIFICAR."
        );

        var emailService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "EmailService", "Object", "Class", "Service",
            "Correo de aviso de reserva."
        );

        var configService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ConfigService", "Object", "Class", "Service",
            "EMAIL_ENABLED y SMTP_HOST."
        );

        var logger = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Logger", "Object", "Class", "Service",
            "Logger de NestJS; no escribe api-server.err.log."
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
            "sucursal_id del encargado."
        );

        var usuarios = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "usuarios", "Object", "Class", "Entity",
            "Correo y rol."
        );

        var sucursales = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sucursales", "Object", "Class", "Entity",
            "Sucursal de la reserva."
        );

        var reservas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "reservas", "Object", "Class", "Entity",
            "Estado Solicitada/Preparada/En tienda."
        );

        var reservaItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "reserva_items", "Object", "Class", "Entity",
            "Resumen de prendas."
        );

        var clientes = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "clientes", "Object", "Class", "Entity",
            "Cliente de la reserva."
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Variante de prenda."
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Nombre y código de producto."
        );

        var tallas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "tallas", "Object", "Class", "Entity",
            "Talla."
        );

        var colores = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "colores", "Object", "Class", "Entity",
            "Color."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Stock de la sucursal."
        );

        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "bitacora_auditoria", "Object", "Class", "Entity",
            "Traza de notificación."
        );

        // Participantes conservados; seis columnas y cajas pequeñas.
        posicionar(diagrama, backend, 20, 20, 170, 45);
        posicionar(diagrama, encargado, 20, 75, 170, 100);
        posicionar(diagrama, administrador, 20, 130, 170, 155);
        posicionar(diagrama, routerApp, 200, 20, 350, 45);
        posicionar(diagrama, adminLayout, 380, 20, 530, 45);
        posicionar(diagrama, menuAdmin, 560, 20, 710, 45);
        posicionar(diagrama, adminReservas, 740, 20, 890, 45);
        posicionar(diagrama, authProvider, 920, 20, 1070, 45);

        posicionar(diagrama, api, 200, 75, 350, 100);
        posicionar(diagrama, apiError, 380, 75, 530, 100);
        posicionar(diagrama, clienteLayout, 560, 75, 710, 100);
        posicionar(diagrama, catalogo, 740, 75, 890, 100);
        posicionar(diagrama, reservasController, 920, 75, 1070, 100);
        posicionar(diagrama, jwtAuthGuard, 200, 130, 350, 155);
        posicionar(diagrama, reservasService, 380, 130, 530, 155);
        posicionar(diagrama, dataSource, 560, 130, 710, 155);
        posicionar(diagrama, entityManager, 740, 130, 890, 155);
        posicionar(diagrama, bitacoraService, 920, 130, 1070, 155);

        posicionar(diagrama, emailService, 200, 185, 350, 210);
        posicionar(diagrama, configService, 380, 185, 530, 210);
        posicionar(diagrama, logger, 560, 185, 710, 210);
        posicionar(diagrama, requestExpress, 740, 185, 890, 210);
        posicionar(diagrama, roles, 920, 185, 1070, 210);
        posicionar(diagrama, usuariosRoles, 200, 240, 350, 265);
        posicionar(diagrama, usuariosEmpleados, 380, 240, 530, 265);
        posicionar(diagrama, usuarios, 560, 240, 710, 265);
        posicionar(diagrama, sucursales, 740, 240, 890, 265);
        posicionar(diagrama, reservas, 920, 240, 1070, 265);
        posicionar(diagrama, reservaItems, 200, 295, 350, 320);
        posicionar(diagrama, clientes, 380, 295, 530, 320);
        posicionar(diagrama, productoTallaColor, 560, 295, 710, 320);
        posicionar(diagrama, productos, 740, 295, 890, 320);
        posicionar(diagrama, tallas, 920, 295, 1070, 320);
        posicionar(diagrama, colores, 200, 350, 350, 375);
        posicionar(diagrama, inventarioStock, 380, 350, 530, 375);
        posicionar(diagrama, bitacoraAuditoria, 560, 350, 710, 375);

        // ============================================================
        // SOLO 7 MENSAJES PRINCIPALES.
        // ============================================================

        agregarMensajes(diagrama, backend, reservasService, [
            "1: CU28 crea Solicitada; después del commit registra NOTIFICAR y ejecuta aviso de correo"
        ], "message");

        agregarMensajes(diagrama, encargado, adminReservas, [
            "2: login y acceso a /admin/reservas; lista y detalle de la sucursal"
        ], "message");

        agregarMensajes(diagrama, adminLayout, api, [
            "3: GET /api/v1/reservas/sucursal/pendientes; polling 30 s; cuenta Solicitada + Preparada"
        ], "message");

        agregarMensajes(diagrama, adminReservas, reservasController, [
            "4: GET /reservas/sucursal y /sucursal/:id; JwtAuthGuard, alcance y errores 401/403"
        ], "message");

        agregarMensajes(diagrama, reservasController, reservasService, [
            "5: consultarReservasSucursal(), contarPendientesSucursal() y consultarDetalleSucursal(); lista Solicitada/Preparada/En tienda"
        ], "message");

        agregarMensajes(diagrama, reservasService, dataSource, [
            "6: alcanceSucursal(), correos de empleados activos y consultas de reservas/items/clientes"
        ], "validation");

        agregarMensajes(diagrama, dataSource, adminReservas, [
            "7: lista/conteo/detail; Preparada mantiene el conteo y En tienda/Cancelada lo reduce"
        ], "return");

        try {
            diagrama.Notes =
                "CU30 - Notificación real: el aviso se ejecuta dentro de crearReserva(), no como evento externo." +
                String.fromCharCode(10) +
                "Discrepancias: no hay cola; el correo es simulado salvo EMAIL_ENABLED/SMTP_HOST; _enviarViaSmtp() lanza en el prototipo." +
                String.fromCharCode(10) +
                "La notificación se envía a todos los empleados activos de la sucursal, no sólo al Encargado." +
                String.fromCharCode(10) +
                "El polling no conserva el último badge si falla: AdminLayout lo deja en null." +
                String.fromCharCode(10) +
                "El conteo real incluye Solicitada y Preparada, no sólo Solicitada." +
                String.fromCharCode(10) +
                "No existe EncargadoLayout separado: la ruta usa AdminLayout." +
                String.fromCharCode(10) +
                "La lista de AdminReservas no se actualiza automáticamente; sólo el badge hace polling." +
                String.fromCharCode(10) +
                "No existe push ni incremento inmediato N+1; el siguiente polling actualiza el conteo.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU30 compacto creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Clases y entidades conservadas; 7 mensajes agrupados."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU30 compacto", 0);
    }
}

main();
