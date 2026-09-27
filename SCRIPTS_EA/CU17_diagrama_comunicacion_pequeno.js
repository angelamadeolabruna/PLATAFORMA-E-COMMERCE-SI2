// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU17 - Consultar Disponibilidad por Sucursal (Web Cliente)
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
    "producto_talla_color": "CE_ProductoTallaColor",
    "inventario_stock": "CE_InventarioStock",
    "sucursales": "CE_Sucursales",
    "ciudades": "CE_Ciudades",
    "producto_imagenes": "CE_ProductoImagenes"
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU17", 0);
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
    aviso("Generando CU17 - Elementos muy pequeños...");

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
            "CU17 - Consultar Disponibilidad por Sucursal - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU17 - Consultar Disponibilidad por Sucursal - Diagrama de Comunicación Elementos Muy Pequeños",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario (actor externo)",
            "Cliente o visitante que consulta disponibilidad de una prenda."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx"
        );

        var layoutRaiz = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "LayoutRaiz", "Object", "Class", "Boundary",
            "web/src/components/layout/LayoutRaiz.tsx"
        );

        var producto = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Producto", "Object", "Class", "Boundary",
            "web/src/pages/Producto.tsx"
        );

        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx; opcional para carrito"
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts - consultarDisponibilidad()"
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
            "Tabla SQL de productos"
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

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Tabla SQL de combinaciones"
        );

        var inventarioStock = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "inventario_stock", "Object", "Class", "Entity",
            "Tabla SQL de existencias"
        );

        var sucursales = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "sucursales", "Object", "Class", "Entity",
            "Tabla SQL de sucursales"
        );

        var ciudades = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ciudades", "Object", "Class", "Entity",
            "Tabla SQL de ciudades"
        );

        var productoImagenes = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_imagenes", "Object", "Class", "Entity",
            "Tabla SQL de imágenes"
        );

        // Elementos muy pequeños.
        posicionar(diagrama, actor, 20, 190, 120, 215);
        posicionar(diagrama, routerApp, 160, 20, 290, 48);
        posicionar(diagrama, layoutRaiz, 160, 75, 290, 103);
        posicionar(diagrama, producto, 160, 130, 290, 158);
        posicionar(diagrama, authProvider, 320, 20, 450, 48);

        posicionar(diagrama, api, 490, 20, 620, 48);
        posicionar(diagrama, apiError, 490, 75, 620, 103);
        posicionar(diagrama, catalogoController, 490, 130, 620, 158);
        posicionar(diagrama, catalogoService, 660, 20, 790, 48);
        posicionar(diagrama, dataSource, 830, 20, 960, 48);
        posicionar(diagrama, productos, 830, 75, 960, 103);
        posicionar(diagrama, categorias, 830, 130, 960, 158);
        posicionar(diagrama, productoTallaColor, 1000, 20, 1130, 48);
        posicionar(diagrama, inventarioStock, 1000, 75, 1130, 103);
        posicionar(diagrama, sucursales, 1000, 130, 1130, 158);
        posicionar(diagrama, ciudades, 1170, 20, 1300, 48);
        posicionar(diagrama, tallas, 1170, 75, 1300, 103);
        posicionar(diagrama, colores, 1170, 130, 1300, 158);
        posicionar(diagrama, productoImagenes, 1340, 20, 1470, 48);

        // ============================================================
        // FLUJO ESENCIAL DE DISPONIBILIDAD POR SUCURSAL.
        // El detalle, filtros y semáforo se agrupan en pocos enlaces.
        // ============================================================

        agregarMensajes(diagrama, actor, routerApp, [
            "1: abre /productos/:codigo"
        ], "message");

        agregarMensajes(diagrama, routerApp, layoutRaiz, [
            "2: Route /productos/:codigo dentro de LayoutRaiz"
        ], "message");

        agregarMensajes(diagrama, layoutRaiz, producto, [
            "3: <Outlet /> -> <Producto />"
        ], "message");

        agregarMensajes(diagrama, producto, authProvider, [
            "4: useAuth() solo para habilitar carrito; la consulta no requiere token"
        ], "message");

        agregarMensajes(diagrama, producto, producto, [
            "5: useParams(codigo) -> cargar()",
            "6: tallaSel / colorSel -> sucursalesVisibles()",
            "7: lineaSeleccionada / stockDeCombinacion()",
            "8: reintentar() ante error de red o HTTP 500"
        ], "message");

        agregarMensajes(diagrama, producto, api, [
            "9: consultarDisponibilidad(codigo)"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "10: GET público con credentials: 'include'",
            "11: renovar:false -> handleResponse<ConsultaDisponibilidad>()"
        ], "message");

        agregarMensajes(diagrama, api, catalogoController, [
            "12: GET /api/v1/catalogo/publico/{codigo}/disponibilidad"
        ], "message");

        agregarMensajes(diagrama, catalogoController, catalogoService, [
            "13: consultarDisponibilidad(codigo)"
        ], "message");

        agregarMensajes(diagrama, catalogoService, dataSource, [
            "14: busca producto por LOWER(codigo) y LOWER(estado)='activo'",
            "15: carga tallas, colores, imágenes y disponibilidad",
            "16: JOIN inventario_stock + producto_talla_color + productos",
            "17: JOIN sucursales + ciudades con LOWER(s.estado)='activa'",
            "18: inv.cantidad_disponible > 0; ORDER BY ciudad, sucursal, talla, color",
            "19: precio = ROUND(precio_base * (1 + porcentaje_iva / 100), 2); stock_bajo = stock_minimo_alert > 0 && disponible <= stock_minimo_alert"
        ], "message");

        agregarMensajes(diagrama, dataSource, productos, [
            "20: productos: id_producto, codigo, nombre, descripcion, precio_base, porcentaje_iva, estado"
        ], "message");

        agregarMensajes(diagrama, dataSource, categorias, [
            "21: LEFT JOIN categorias -> categoria"
        ], "message");

        agregarMensajes(diagrama, dataSource, productoTallaColor, [
            "22: combinaciones id_producto, id_ptc, id_talla, id_color"
        ], "message");

        agregarMensajes(diagrama, dataSource, inventarioStock, [
            "23: id_ptc, id_sucursal, cantidad_disponible, cantidad_reservada, stock_minimo_alert"
        ], "message");

        agregarMensajes(diagrama, dataSource, sucursales, [
            "24: nombre, direccion, telefono, LOWER(estado)='activa'"
        ], "validation");

        agregarMensajes(diagrama, dataSource, ciudades, [
            "25: JOIN ciudades por s.id_ciudad; muestra ciudad"
        ], "message");

        agregarMensajes(diagrama, dataSource, tallas, [
            "26: tallas activas asociadas al producto"
        ], "message");

        agregarMensajes(diagrama, dataSource, colores, [
            "27: colores activos asociados al producto"
        ], "message");

        agregarMensajes(diagrama, dataSource, productoImagenes, [
            "28: imagen_principal y galería; es_principal=true"
        ], "message");

        agregarMensajes(diagrama, catalogoService, catalogoController, [
            "29: return ConsultaDisponibilidad { producto, imagenes, tallas, colores, sucursales }",
            "E1: producto sin stock -> 200 con sucursales=[]",
            "E3: producto inexistente/inactivo -> 404 'Prenda no encontrada.'"
        ], "return");

        agregarMensajes(diagrama, catalogoController, api, [
            "30: return detalle; HTTP 200 / 404 / 500"
        ], "return");

        agregarMensajes(diagrama, api, apiError, [
            "E3-E4: handleResponse() -> ApiError(status, message)"
        ], "error");

        agregarMensajes(diagrama, api, producto, [
            "31: setDatos(datos); preselecciona primera talla, color y sucursal",
            "E1: 'Prenda agotada temporalmente en todas las sucursales.'",
            "E2: 'Sin existencias para ... en talla ...'",
            "E3: es404 -> 'Prenda no encontrada'",
            "E4: 'No pudimos cargar la disponibilidad' + Reintentar"
        ], "return");

        agregarMensajes(diagrama, producto, producto, [
            "32: cards por sucursal con ciudad, teléfono, talla, color y disponible",
            "33: stock_bajo -> 'Stock bajo (n)' / disponible -> 'n disponibles'",
            "34: filtrar en vivo por talla/color; limpiar filtros",
            "35: agregar al carrito, reservar y vestidor son acciones posteriores"
        ], "message");

        try {
            diagrama.Notes =
                "CU17 - Flujo real del código actual (React/Vite + NestJS).\n" +
                "La página /productos/:codigo ya está implementada en Producto.tsx; no es un placeholder.\n" +
                "El endpoint web real es /api/v1/catalogo/publico/{codigo}/disponibilidad.\n" +
                "CatalogoController no exige JWT; api.consultarDisponibilidad() usa renovar:false.\n" +
                "El detalle sí filtra inv.cantidad_disponible > 0 y LOWER(s.estado)='activa'.\n" +
                "El detalle no resta cantidad_reservada; devuelve disponible, reservada y stock_bajo por separado.\n" +
                "stock_bajo usa stock_minimo_alert solo si el umbral es mayor que cero.\n" +
                "Los filtros de talla/color se hacen en memoria sobre sucursalesVisibles.\n" +
                "El texto real para una combinación filtrada es 'Sin existencias para ... en talla ...'.\n" +
                "No existe timeout de 10 segundos en el fetch actual.\n" +
                "Las acciones de carrito, reserva y vestidor ya tienen implementación parcial en Producto.tsx.\n" +
                "El código usa porcentaje_iva aunque esa columna no aparece en productos del schema.sql inspeccionado.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU17 con elementos muy pequeños creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Los mensajes secundarios fueron agrupados.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU17", 0);
    }
}

main();
