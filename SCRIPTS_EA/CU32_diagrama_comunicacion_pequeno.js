// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU32 - Usar Vestidor Virtual con Realidad Aumentada
// Diagrama de comunicación compacto conservando participantes.
//
// Se conservan las clases UI/CTR/SRV y las entidades relevantes.
// Sólo se muestran 2 mensajes esenciales; los detalles secundarios
// quedan en las notas de los elementos.
//
// Fuente de verdad: React/Vite + NestJS + schema.sql.
// La implementación actual no es Flutter: utiliza navegador, MediaPipe
// y un canvas 2D para la superposición.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "RouterApp": "IU_RouterApp",
    "Catalogo": "IU_Catalogo",
    "Producto": "IU_Producto",
    "VestidorRa": "IU_VestidorRa",
    "MediaPipeRA": "SRV_MediaPipeRA",
    "CamaraNavegador": "SRV_CamaraNavegador",
    "ClienteLayout": "IU_ClienteLayout",
    "MisPruebasRa": "IU_MisPruebasRa",
    "ModalReserva": "IU_ModalReserva",
    "Carrito": "IU_Carrito",
    "Placeholder": "IU_Placeholder",
    "AuthProvider": "IU_AuthProvider",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "SesionesRaController": "CTR_SesionesRa",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "SesionesRaService": "SRV_SesionesRaService",
    "DataSource": "SRV_DataSource",
    "BitacoraService": "SRV_BitacoraService",
    "PreferenciasService": "SRV_PreferenciasService",
    "RequestExpress": "IU_RequestExpress",
    "usuarios": "CE_Usuarios",
    "roles": "CE_Roles",
    "usuarios_roles": "CE_UsuariosRoles",
    "clientes": "CE_Clientes",
    "productos": "CE_Productos",
    "producto_talla_color": "CE_ProductoTallaColor",
    "tallas": "CE_Tallas",
    "colores": "CE_Colores",
    "producto_imagenes": "CE_ProductoImagenes",
    "sesiones_ra": "CE_SesionesRa",
    "resultados_prueba": "CE_ResultadosPrueba",
    "reservas": "CE_Reservas",
    "carritos": "CE_Carritos",
    "inventario_stock": "CE_InventarioStock",
    "preferencias_cliente": "CE_PreferenciasCliente",
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU32 compacto", 0);
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
    aviso("Generando CU32 compacto...");

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
            "CU32 - Vestidor Virtual con RA - Comunicación compacta"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU32 - Usar Vestidor Virtual con Realidad Aumentada - Diagrama de Comunicación Compacto",
            "Communication"
        );

        var cliente = obtenerOCrearActor(
            raiz, paqueteActores,
            "Cliente de Vestidor (actor web)",
            "ACTOR_ClienteVestidorRA",
            "La implementación actual es React/Vite web, no Flutter."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "Rutas /catalogo, /productos/:codigo y /reservas/pruebas-ra."
        );

        var catalogo = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Catalogo", "Object", "Class", "Boundary",
            "Catálogo público; abre VestidorRa."
        );

        var producto = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Producto", "Object", "Class", "Boundary",
            "Detalle de producto; selecciona id_ptc, talla y color."
        );

        var vestidorRa = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "VestidorRa", "Object", "Class", "Boundary",
            "Cámara/foto, canvas, Mediapipe y botones Gusta/No gusta."
        );

        var mediaPipeRa = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "MediaPipeRA", "Object", "Class", "Service",
            "MediaPipe Tasks Vision/PoseLandmarker; no es Flutter."
        );

        var camaraNavegador = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "CamaraNavegador", "Object", "Class", "Service",
            "navigator.mediaDevices.getUserMedia y carga de foto."
        );

        var clienteLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ClienteLayout", "Object", "Class", "Boundary",
            "Layout del cliente e historial."
        );

        var misPruebasRa = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "MisPruebasRa", "Object", "Class", "Boundary",
            "Historial de sesiones y resultados."
        );

        var modalReserva = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ModalReserva", "Object", "Class", "Boundary",
            "Reserva desde 'Reservar para probar en sucursal'."
        );

        var carrito = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Carrito", "Object", "Class", "Boundary",
            "No hay botón real para agregar desde VestidorRa."
        );

        var placeholder = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Placeholder", "Object", "Class", "Boundary",
            "La ruta /carrito actual es placeholder."
        );

        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "Token y usuario."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "POST sesión/resultado y GET historial."
        );

        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "Errores HTTP, cámara y SDK."
        );

        var sesionesController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "SesionesRaController", "Object", "Class", "Control",
            "CTR_SesionesRa.ts."
        );

        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "Guard de sesiones RA e historial."
        );

        var sesionesService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "SesionesRaService", "Object", "Class", "Service",
            "crearSesionRa(), registrarResultado() y consultarHistorial()."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "SQL de catálogo, sesiones, resultados y preferencias."
        );

        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "Auditoría INSERT/UPDATE."
        );

        var preferenciasService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "PreferenciasService", "Object", "Class", "Service",
            "Actualiza preferencias cuando resultado='Gusta'."
        );

        var requestExpress = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RequestExpress", "Object", "Class", "Boundary",
            "IP y user-agent."
        );

        var usuarios = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "usuarios", "Object", "Class", "Entity",
            "Usuario de la sesión."
        );

        var roles = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "roles", "Object", "Class", "Entity",
            "permisos_json."
        );

        var usuariosRoles = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "usuarios_roles", "Object", "Class", "Entity",
            "Roles del usuario."
        );

        var clientes = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "clientes", "Object", "Class", "Entity",
            "Perfil para preferencias."
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "modelo_3d_url, imagen y precio."
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Variante id_ptc y estado_stock."
        );

        var tallas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "tallas", "Object", "Class", "Entity",
            "Talla elegida."
        );

        var colores = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "colores", "Object", "Class", "Entity",
            "Color elegido."
        );

        var productoImagenes = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_imagenes", "Object", "Class", "Entity",
            "Imagen superpuesta en canvas."
        );

        var sesionesRa = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sesiones_ra", "Object", "Class", "Entity",
            "Sesión, medidas, fecha y vínculos opcionales."
        );

        var resultadosPrueba = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "resultados_prueba", "Object", "Class", "Entity",
            "Gusta/No gusta."
        );

        var reservas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "reservas", "Object", "Class", "Entity",
            "Vínculo opcional desde backend."
        );

        var carritos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "carritos", "Object", "Class", "Entity",
            "Vínculo opcional desde backend."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Disponibilidad usada por catálogo."
        );

        var preferenciasCliente = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "preferencias_cliente", "Object", "Class", "Entity",
            "Preferencias actualizadas por Gusta."
        );

        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "bitacora_auditoria", "Object", "Class", "Entity",
            "Auditoría con request."
        );

        // Participantes conservados; seis columnas y cajas pequeñas.
        posicionar(diagrama, cliente, 20, 20, 170, 45);
        posicionar(diagrama, routerApp, 200, 20, 350, 45);
        posicionar(diagrama, catalogo, 380, 20, 530, 45);
        posicionar(diagrama, producto, 560, 20, 710, 45);
        posicionar(diagrama, vestidorRa, 740, 20, 890, 45);
        posicionar(diagrama, mediaPipeRa, 920, 20, 1070, 45);

        posicionar(diagrama, camaraNavegador, 20, 75, 170, 100);
        posicionar(diagrama, clienteLayout, 200, 75, 350, 100);
        posicionar(diagrama, misPruebasRa, 380, 75, 530, 100);
        posicionar(diagrama, modalReserva, 560, 75, 710, 100);
        posicionar(diagrama, carrito, 740, 75, 890, 100);
        posicionar(diagrama, placeholder, 920, 75, 1070, 100);

        posicionar(diagrama, authProvider, 20, 130, 170, 155);
        posicionar(diagrama, api, 200, 130, 350, 155);
        posicionar(diagrama, apiError, 380, 130, 530, 155);
        posicionar(diagrama, sesionesController, 560, 130, 710, 155);
        posicionar(diagrama, jwtAuthGuard, 740, 130, 890, 155);
        posicionar(diagrama, sesionesService, 920, 130, 1070, 155);

        posicionar(diagrama, dataSource, 20, 185, 170, 210);
        posicionar(diagrama, bitacoraService, 200, 185, 350, 210);
        posicionar(diagrama, preferenciasService, 380, 185, 530, 210);
        posicionar(diagrama, requestExpress, 560, 185, 710, 210);
        posicionar(diagrama, usuarios, 740, 185, 890, 210);
        posicionar(diagrama, roles, 920, 185, 1070, 210);

        posicionar(diagrama, usuariosRoles, 20, 240, 170, 265);
        posicionar(diagrama, clientes, 200, 240, 350, 265);
        posicionar(diagrama, productos, 380, 240, 530, 265);
        posicionar(diagrama, productoTallaColor, 560, 240, 710, 265);
        posicionar(diagrama, tallas, 740, 240, 890, 265);
        posicionar(diagrama, colores, 920, 240, 1070, 265);

        posicionar(diagrama, productoImagenes, 20, 295, 170, 320);
        posicionar(diagrama, sesionesRa, 200, 295, 350, 320);
        posicionar(diagrama, resultadosPrueba, 380, 295, 530, 320);
        posicionar(diagrama, reservas, 560, 295, 710, 320);
        posicionar(diagrama, carritos, 740, 295, 890, 320);
        posicionar(diagrama, inventarioStock, 920, 295, 1070, 320);
        posicionar(diagrama, preferenciasCliente, 20, 350, 170, 375);
        posicionar(diagrama, bitacoraAuditoria, 200, 350, 350, 375);

        // ============================================================
        // SOLO 2 MENSAJES ESENCIALES.
        // ============================================================

        agregarMensaje(diagrama, cliente, vestidorRa,
            "1: catálogo -> seleccionar id_ptc -> cámara/MediaPipe -> Me gusta/No gusta", "message");

        agregarMensaje(diagrama, vestidorRa, dataSource,
            "2: API -> Controller -> Service -> SQL; registra sesión/resultado, auditoría e historial", "return");

        try {
            diagrama.Notes =
                "CU32 - Implementación real React/Vite, no Flutter. Usa MediaPipe Tasks Vision, PoseLandmarker, canvas 2D y getUserMedia." +
                String.fromCharCode(10) +
                "modelo_3d_url se devuelve como dato, pero la superposición usa prenda.imagen; no hay avatar genérico explícito." +
                String.fromCharCode(10) +
                "El servicio valida producto activo, pero no comprueba estado_stock='Sin stock'." +
                String.fromCharCode(10) +
                "El frontend permite subir foto si la cámara se deniega; la denegación por sí sola no crea sesión." +
                String.fromCharCode(10) +
                "La UI no tiene botón 'Agregar al carrito': sólo abre ModalReserva al reservar; /carrito es placeholder." +
                String.fromCharCode(10) +
                "El servicio acepta id_reserva/id_carrito opcionales, pero VestidorRa no los envía." +
                String.fromCharCode(10) +
                "Un segundo resultado actualiza el primero; no siempre inserta una nueva fila." +
                String.fromCharCode(10) +
                "El código usa campo foto_resultado, pero schema.sql no define esa columna en sesiones_ra." +
                String.fromCharCode(10) +
                "El permiso real es consultar_catalogo; la semilla de schema.sql usa ver_catalogo para Cliente." +
                String.fromCharCode(10) +
                "El historial está en /reservas/pruebas-ra bajo ClienteLayout.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU32 compacto creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Clases y entidades conservadas; 2 mensajes esenciales."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU32 compacto", 0);
    }
}

main();
