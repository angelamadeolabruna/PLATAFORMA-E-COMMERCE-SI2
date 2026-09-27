// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU16 - Consultar Catálogo con Filtros (Web)
// Diagrama de Comunicación con elementos muy pequeños.
//
// Source of truth: implementación actual React/Vite + NestJS.
// Los mensajes secundarios se agrupan para reducir la cantidad de flechas.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "RouterApp": "IU_RouterApp",
    "LayoutRaiz": "IU_LayoutRaiz",
    "Catalogo": "IU_Catalogo",
    "Producto": "IU_Producto",
    "AuthProvider": "IU_AuthProvider",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "CatalogoController": "CTR_Catalogo",
    "CatalogoService": "SRV_CatalogoService",
    "DataSource": "SRV_DataSource",
    "productos": "CE_Productos",
    "categorias": "CE_Categorias",
    "tallas": "CE_Tallas",
    "colores": "CE_Colores",
    "temporadas": "CE_Temporadas",
    "producto_talla_color": "CE_ProductoTallaColor",
    "inventario_stock": "CE_InventarioStock",
    "sucursales": "CE_Sucursales",
    "producto_imagenes": "CE_ProductoImagenes"
};

var ESCALA_X = 0.28;
var ESCALA_Y = 0.28;
var ANCHO_MINIMO = 50;
var ALTO_MINIMO = 14;
var FUENTE_PARTICIPANTES = 3;
var FUENTE_MENSAJES = 2;

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Tiendas Montaño - CU16", 0);
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

function obtenerOCrearActor(raiz, paquete, nombre, nota)
{
    var actor = buscarElemento(raiz, nombre, ["Actor"]);

    if (actor == null) {
        actor = paquete.Elements.AddNew(nombre, "Actor");
        actor.Update();
        paquete.Elements.Refresh();
    }

    try { actor.Alias = "ACTOR_Cliente"; } catch (ignore) { }
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
    aviso("Generando CU16 - Elementos muy pequeños...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "4. Catálogo Público");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "4. Catálogo Público");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU16 - Consultar Catálogo con Filtros - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU16 - Consultar Catálogo con Filtros - Diagrama de Comunicación Elementos Muy Pequeños",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario (actor externo)",
            "Cliente o visitante anónimo que explora el catálogo público."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx"
        );

        var layoutRaiz = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "LayoutRaiz", "Object", "Class", "Boundary",
            "web/src/components/layout/LayoutRaiz.tsx"
        );

        var catalogo = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Catalogo", "Object", "Class", "Boundary",
            "web/src/pages/Catalogo.tsx"
        );

        var producto = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Producto", "Object", "Class", "Boundary",
            "web/src/pages/Producto.tsx"
        );

        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx; solo controla acciones de carrito"
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts - catálogo público"
        );

        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "web/src/lib/api.ts"
        );

        var catalogoController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "CatalogoController", "Object", "Class", "Control",
            "api/src/modulos/catalogo/CTR_Catalogo.ts"
        );

        var catalogoService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "CatalogoService", "Object", "Class", "Service",
            "api/src/modulos/catalogo/SRV_CatalogoService.ts"
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "TypeORM DataSource; SQL directo"
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Tabla SQL de productos; no hay entidad TypeORM Producto en este módulo"
        );

        var categorias = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "categorias", "Object", "Class", "Entity",
            "Tabla SQL de categorías"
        );

        var tallas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "tallas", "Object", "Class", "Entity",
            "Tabla SQL de tallas"
        );

        var colores = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "colores", "Object", "Class", "Entity",
            "Tabla SQL de colores"
        );

        var temporadas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "temporadas", "Object", "Class", "Entity",
            "Tabla SQL de temporadas"
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Tabla SQL de combinaciones de talla y color"
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Tabla SQL de existencias por sucursal"
        );

        var sucursales = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sucursales", "Object", "Class", "Entity",
            "Tabla SQL de sucursales; el detalle también consulta ciudades"
        );

        var productoImagenes = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_imagenes", "Object", "Class", "Entity",
            "Tabla SQL de imágenes de producto"
        );

        // Elementos muy pequeños.
        posicionar(diagrama, actor, 20, 190, 120, 215);
        posicionar(diagrama, routerApp, 160, 20, 290, 48);
        posicionar(diagrama, layoutRaiz, 160, 75, 290, 103);
        posicionar(diagrama, catalogo, 160, 130, 290, 158);
        posicionar(diagrama, producto, 320, 130, 450, 158);
        posicionar(diagrama, authProvider, 320, 20, 450, 48);

        posicionar(diagrama, api, 490, 20, 620, 48);
        posicionar(diagrama, apiError, 490, 75, 620, 103);
        posicionar(diagrama, catalogoController, 490, 130, 620, 158);
        posicionar(diagrama, catalogoService, 660, 20, 790, 48);
        posicionar(diagrama, dataSource, 830, 20, 960, 48);
        posicionar(diagrama, productos, 830, 75, 960, 103);
        posicionar(diagrama, productoTallaColor, 830, 130, 960, 158);
        posicionar(diagrama, inventarioStock, 1000, 20, 1130, 48);
        posicionar(diagrama, sucursales, 1000, 75, 1130, 103);
        posicionar(diagrama, categorias, 1000, 130, 1130, 158);
        posicionar(diagrama, tallas, 1170, 20, 1300, 48);
        posicionar(diagrama, colores, 1170, 75, 1300, 103);
        posicionar(diagrama, temporadas, 1170, 130, 1300, 158);
        posicionar(diagrama, productoImagenes, 1340, 20, 1470, 48);

        // ============================================================
        // FLUJO ESENCIAL DEL CATÁLOGO PÚBLICO.
        // Las consultas de lista, opciones y detalle se agrupan.
        // ============================================================

        agregarMensajes(diagrama, actor, routerApp, [
            "1: abre /catalogo"
        ], "message");

        agregarMensajes(diagrama, routerApp, layoutRaiz, [
            "2: Route /catalogo dentro de LayoutRaiz"
        ], "message");

        agregarMensajes(diagrama, layoutRaiz, catalogo, [
            "3: <Outlet /> -> <Catalogo />"
        ], "message");

        agregarMensajes(diagrama, catalogo, authProvider, [
            "4: useAuth() solo para mostrar acciones de carrito; catálogo no exige token"
        ], "message");

        agregarMensajes(diagrama, catalogo, catalogo, [
            "5: filtros: busqueda, categoria, talla, color, temporada, precio_min, precio_max",
            "6: cargarOpciones() + construirFiltros(pagina); LIMITE=20",
            "7: setTimeout(recargar, 300) para cambios de filtros",
            "8: cargar(1,false) / cargarMas() -> setItems() / setTotal()",
            "9: hayErrorRango / sinResultados / error / Reintentar"
        ], "message");

        agregarMensajes(diagrama, catalogo, api, [
            "10: listarOpcionesCatalogo()",
            "11: listarCatalogoPublico(filtros)",
            "12: consultarDisponibilidad(codigo) para tarjeta, detalle y vestidor"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "13: fetch público con credentials: 'include' -> handleResponse()",
            "13a: consultarDisponibilidad() usa renovar:false; listar/options pueden adjuntar Bearer si existe token"
        ], "message");

        agregarMensajes(diagrama, api, catalogoController, [
            "14: GET /api/v1/catalogo/publico",
            "15: GET /api/v1/catalogo/publico/opciones",
            "16: GET /api/v1/catalogo/publico/{codigo}/disponibilidad"
        ], "message");

        agregarMensajes(diagrama, catalogoController, catalogoService, [
            "17: listarPublico(filtros) / opcionesFiltros()",
            "18: consultarDisponibilidad(codigo)",
            "19: pagina=1, limite=20, LIMITE_MAX=100; valida precio_min <= precio_max"
        ], "message");

        agregarMensajes(diagrama, catalogoService, dataSource, [
            "20: construirFiltrosPublico(): LOWER(p.estado)='activo' + EXISTS inventario_stock",
            "21:ILIKE por nombre; categoria; EXISTS talla/color; temporada; precio_base",
            "22: COUNT(DISTINCT) + ORDER BY nombre + LIMIT/OFFSET",
            "23: consulta detalle: producto, imágenes, combos, inventario, sucursales y ciudades"
        ], "message");

        agregarMensajes(diagrama, dataSource, productos, [
            "24: productos: id_producto, codigo, nombre, precio_base, porcentaje_iva"
        ], "message");

        agregarMensajes(diagrama, dataSource, productoTallaColor, [
            "25: EXISTS por id_talla/id_color; tallas y colores activos asociados al producto"
        ], "message");

        agregarMensajes(diagrama, dataSource, inventarioStock, [
            "26: lista: s.cantidad_disponible > 0",
            "27: detalle: cantidad_disponible y cantidad_reservada por id_ptc"
        ], "message");

        agregarMensajes(diagrama, dataSource, sucursales, [
            "28: detalle: JOIN sucursales + ciudades, LOWER(s.estado)='activa'"
        ], "message");

        agregarMensajes(diagrama, dataSource, categorias, [
            "29: opciones: LOWER(estado)='activo'"
        ], "validation");

        agregarMensajes(diagrama, dataSource, tallas, [
            "30: opciones: LOWER(estado)='activo'"
        ], "validation");

        agregarMensajes(diagrama, dataSource, colores, [
            "31: opciones: LOWER(estado)='activo'"
        ], "validation");

        agregarMensajes(diagrama, dataSource, temporadas, [
            "32: opciones: LOWER(estado)='activa'"
        ], "validation");

        agregarMensajes(diagrama, dataSource, productoImagenes, [
            "33: imagen principal y galería; es_principal=true"
        ], "message");

        agregarMensajes(diagrama, catalogoService, catalogoController, [
            "34: return { items, total } / ConsultaDisponibilidad",
            "35: sin coincidencias -> items=[] y total=0",
            "E2: 422 'Rango de precio inválido.'",
            "E3: 404 'Prenda no encontrada.'"
        ], "return");

        agregarMensajes(diagrama, catalogoController, api, [
            "36: return items/total o detalle; HTTP 200 / 404 / 422"
        ], "return");

        agregarMensajes(diagrama, api, apiError, [
            "E2-E3: handleResponse() -> throw new ApiError(status, message)"
        ], "error");

        agregarMensajes(diagrama, api, catalogo, [
            "37: setOpciones() / setItems() / setTotal()",
            "38: items append en cargarMas(); paginaCargada++",
            "E1: 'No se encontraron prendas con los filtros seleccionados.'",
            "E2: setErrorFiltro('Rango de precio inválido.')",
            "E4: 'No se pudo cargar el catálogo. Verifique su conexión.' + Reintentar"
        ], "return");

        agregarMensajes(diagrama, catalogo, producto, [
            "39: Link to /productos/:codigo"
        ], "message");

        agregarMensajes(diagrama, producto, api, [
            "40: useParams(codigo) -> consultarDisponibilidad(codigo)"
        ], "message");

        agregarMensajes(diagrama, api, producto, [
            "41: setDatos(datos); preselecciona color, talla y sucursal",
            "E3: es404=true -> 'Prenda no encontrada'"
        ], "return");

        agregarMensajes(diagrama, producto, producto, [
            "42: renderiza imagen, galería, precio con IVA, tallas, colores",
            "43: muestra sucursales, combinaciones y existencias",
            "44: agregar al carrito / reservar / vestidor RA son acciones posteriores"
        ], "message");

        try {
            diagrama.Notes =
                "CU16 - Flujo real del código actual (React/Vite + NestJS).\n" +
                "La página real se llama Catalogo, no CatalogoPublico; la ruta es /catalogo.\n" +
                "El backend no tiene JwtAuthGuard en CatalogoController.\n" +
                "La web usa /catalogo/publico/{codigo}/disponibilidad para el detalle; el controlador también expone /catalogo/publico/{codigo}.\n" +
                "El listado usa precio_base y LOWER(p.estado)='activo'; el rango de precio se aplica al precio base.\n" +
                "El código usa porcentaje_iva aunque esa columna no aparece en productos del schema.sql inspeccionado.\n" +
                "El filtro de talla/color usa EXISTS sobre producto_talla_color.\n" +
                "El listado exige inventario_stock.cantidad_disponible > 0, pero no resta cantidad_reservada.\n" +
                "La consulta de listado no filtra sucursal activa; el detalle sí usa LOWER(s.estado)='activa'.\n" +
                "El detalle mapea disponible y reservado por separado; no calcula disponible menos reservado.\n" +
                "La consulta de detalle sí exige cantidad_disponible > 0 y LOWER(s.estado)='activa'; no resta cantidad_reservada.\n" +
                "La UI usa Cargar más, no MatPaginator; la búsqueda y cambios de filtros usan debounce de 300 ms.\n" +
                "El backend ignora enteros/decimales inválidos o negativos y solo devuelve 422 cuando precio_min > precio_max.\n" +
                "El catálogo y sus filtros son públicos; no se requiere autenticación.\n" +
                "La UI React también ofrece carrito, reservas y vestidor RA, pero esas acciones quedan fuera del flujo central.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU16 con elementos muy pequeños creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Los mensajes secundarios fueron agrupados.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU16", 0);
    }
}

main();
