// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU41 - Recomendar Prendas con IA
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
    "Recomendaciones": "IU_Recomendaciones",
    "api": "IU_Api",
    "RecomendacionesController": "CTR_Recomendaciones",
    "JwtOpcionalAuthGuard": "CTR_JwtOpcionalAuthGuard",
    "RecomendacionesService": "SRV_RecomendacionesService",
    "ScoringService": "SRV_ScoringService",
    "PreferenciasService": "SRV_PreferenciasService",
    "DataSource": "SRV_DataSource",
    "preferencias_cliente": "CE_PreferenciasCliente",
    "ventas": "CE_Ventas",
    "venta_items": "CE_VentaItems",
    "sesiones_ra": "CE_SesionesRa",
    "resultados_prueba": "CE_ResultadosPrueba",
    "productos": "CE_Productos",
    "producto_talla_color": "CE_ProductoTallaColor",
    "inventario_stock": "CE_InventarioStock",
    "temporadas": "CE_Temporadas"
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU41 mínimo", 0);
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
    aviso("Generando CU41 mínimo...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "13. IA y Recomendaciones");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "13. IA y Recomendaciones");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU41 - Recomendar Prendas con IA - Comunicación mínima"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU41 - Recomendar Prendas con IA - Diagrama de Comunicación Mínimo",
            "Communication"
        );

        var cliente = obtenerOCrearActor(
            raiz, paqueteActores,
            "Cliente de recomendaciones (actor)",
            "ACTOR_ClienteRecomendaciones",
            "Usuario autenticado con consultar_catalogo; el endpoint real también acepta anónimos."
        );

        var iaExterna = obtenerOCrearActor(
            raiz, paqueteActores,
            "Servicio de IA externo (actor opcional)",
            "ACTOR_IARecomendaciones",
            "Es un actor conceptual cuando IA_EXTERNAL_URL está configurada."
        );

        var recomendaciones = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Recomendaciones", "Object", "Class", "Boundary",
            "pages/cliente/Recomendaciones.tsx: carga, actualiza y muestra tarjetas con score, precio y motivo."
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "api.obtenerRecomendaciones(): GET /api/v1/recomendaciones con Bearer cuando existe sesión."
        );

        var recomendacionesController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RecomendacionesController", "Object", "Class", "Control",
            "CTR_Recomendaciones.ts: GET /api/v1/recomendaciones."
        );

        var jwtOpcional = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtOpcionalAuthGuard", "Object", "Class", "Control",
            "Permite consulta anónima; si hay JWT inválido responde 401."
        );

        var recomendacionesService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RecomendacionesService", "Object", "Class", "Service",
            "recomendar(), construirPerfil(), candidatos(), popularesTemporada() y.precioConIva()."
        );

        var scoringService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ScoringService", "Object", "Class", "Service",
            "scoringInterno() y delegarIA(); fallback interno con pesos y motivos."
        );

        var preferenciasService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "PreferenciasService", "Object", "Class", "Service",
            "registrarPreferenciasVenta() y registrarPreferenciasGusta() realimentan el perfil."
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "TypeORM DataSource para perfil, historial, candidatos, stock y temporada."
        );

        var preferenciasCliente = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "preferencias_cliente", "Object", "Class", "Entity",
            "Perfil por categoría, talla, color y temporada con puntaje."
        );

        var ventas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ventas", "Object", "Class", "Entity",
            "Historial de compras usado para sumar pesos por cantidad."
        );

        var ventaItems = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "venta_items", "Object", "Class", "Entity",
            "Relaciona compras con id_ptc y cantidades."
        );

        var sesionesRa = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sesiones_ra", "Object", "Class", "Entity",
            "Sesiones del usuario que originan resultados Gusta."
        );

        var resultadosPrueba = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "resultados_prueba", "Object", "Class", "Entity",
            "Resultados con resultado = Gusta se suman al perfil."
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Candidatos con estado Activo, precio_base y porcentaje_iva."
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Variantes candidatas y relación con productos."
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Filtra candidatos con cantidad_disponible > 0 en cualquier sucursal."
        );

        var temporadas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "temporadas", "Object", "Class", "Entity",
            "Temporada activa por fechas y fallback de la primera temporada activa."
        );

        // Participantes esenciales; seis columnas y cuatro filas compactas.
        posicionar(diagrama, cliente, 20, 20, 170, 45);
        posicionar(diagrama, recomendaciones, 200, 20, 350, 45);
        posicionar(diagrama, api, 380, 20, 530, 45);
        posicionar(diagrama, recomendacionesController, 560, 20, 710, 45);
        posicionar(diagrama, jwtOpcional, 740, 20, 890, 45);
        posicionar(diagrama, recomendacionesService, 920, 20, 1070, 45);

        posicionar(diagrama, iaExterna, 20, 75, 170, 100);
        posicionar(diagrama, scoringService, 200, 75, 350, 100);
        posicionar(diagrama, preferenciasService, 380, 75, 530, 100);
        posicionar(diagrama, dataSource, 560, 75, 710, 100);
        posicionar(diagrama, preferenciasCliente, 740, 75, 890, 100);
        posicionar(diagrama, ventas, 920, 75, 1070, 100);

        posicionar(diagrama, ventaItems, 20, 130, 170, 155);
        posicionar(diagrama, sesionesRa, 200, 130, 350, 155);
        posicionar(diagrama, resultadosPrueba, 380, 130, 530, 155);
        posicionar(diagrama, productos, 560, 130, 710, 155);
        posicionar(diagrama, productoTallaColor, 740, 130, 890, 155);
        posicionar(diagrama, inventarioStock, 920, 130, 1070, 155);

        posicionar(diagrama, temporadas, 560, 185, 710, 210);

        // ============================================================
        // SOLO 3 MENSAJES ESENCIALES.
        // ============================================================

        agregarMensaje(diagrama, cliente, recomendaciones,
            "1: /recomendaciones; Ver mis recomendaciones -> api.obtenerRecomendaciones(): GET /api/v1/recomendaciones",
            "message");

        agregarMensaje(diagrama, recomendacionesController, recomendacionesService,
            "2: JwtOpcionalAuthGuard; credenciales; exigir consultar_catalogo; construirPerfil() con preferencias, compras y Gusta",
            "message");

        agregarMensaje(diagrama, recomendacionesService, dataSource,
            "3: candidatos con stock; ScoringService.delegarIA() o scoringInterno(); ordenar score, limitar 10 y return { items, fuente }",
            "return");

        try {
            diagrama.Notes =
                "CU41 - La implementación real es React/Vite: Recomendaciones.tsx en /recomendaciones. No se encontró RecomendacionesScreen de Flutter en el proyecto." +
                String.fromCharCode(10) +
                "Aunque el actor es Cliente, RecomendacionesController usa JwtOpcionalAuthGuard: sin token responde con populares de temporada; con token exige consultar_catalogo o *. La semilla Cliente de schema.sql concede ver_catalogo, no consultar_catalogo, por lo que el menú y el servicio pueden responder 403." +
                String.fromCharCode(10) +
                "La respuesta real incluye items y fuente: populares_temporada, scoring_interno o ia_externa. El límite es 10 y cada item contiene id_ptc, producto, talla, color, precio, imagen, score y motivo." +
                String.fromCharCode(10) +
                "ScoringService.delegarIA() usa IA_EXTERNAL_URL, POST con perfil y prendas, AbortSignal.timeout(4000) y degradación silenciosa al scoring interno si falla. No devuelve HTTP 504; el caso describe una degradación que la implementación resuelve con HTTP 200. api/.env.example no define IA_EXTERNAL_URL, por lo que el arranque normal usa el motor interno." +
                String.fromCharCode(10) +
                "El scoring interno usa pesos de categoría, talla, color y temporada, más BONUS_TEMPORADA_ACTUAL. El perfil suma preferencias_cliente, todas las ventas del cliente sin filtrar por estado y resultados Gusta de sesiones_ra." +
                String.fromCharCode(10) +
                "schema.sql no define productos.porcentaje_iva, aunque candidatos(), popularesTemporada() y precioConIva() lo consultan. schema.sql tampoco define estado Activo como valor predeterminado de productos; usa Disponible. Las consultas reales pueden fallar o devolver candidatos incompletos con el esquema entregado." +
                String.fromCharCode(10) +
                "No se usa historial_navegacion ni recomendaciones_ia para construir o persistir las recomendaciones. El precio enviado al frontend es precio_base con IVA calculado, no el precio_base solo." +
                String.fromCharCode(10) +
                "La UI no muestra un badge de disponibilidad por sucursal; muestra score, categoría, talla, color, precio y motivo. El enlace de producto lleva a /productos/:codigo y Probar con RA lleva a /reservas/pruebas-ra; no hay botón directo para CU33." +
                String.fromCharCode(10) +
                "PreferenciasService.registrarPreferenciasVenta() se llama después de un pago de CU34/CU36 y sólo opera si ventas.id_cliente no es NULL; sus errores se omiten en PagosService. registrarPreferenciasGusta() se invoca al registrar resultado Gusta en CU32. El upsert no tiene una restricción única y puede duplicar dimensiones si ocurren concurrentemente.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU41 mínimo creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Clases y entidades esenciales conservadas; 3 mensajes."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU41 mínimo", 0);
    }
}

main();
