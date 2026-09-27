// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU13 - Registrar Producto de Ropa en Catálogo (Admin)
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
    "AdminLayout": "IU_AdminLayout",
    "AdminCatalogoProductos": "IU_AdminCatalogoProductos",
    "AuthProvider": "IU_AuthProvider",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "CatalogoAdminController": "CTR_CatalogoAdmin",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "ProductosService": "SRV_ProductosService",
    "DataSource": "SRV_DataSource",
    "productos": "CE_Productos",
    "producto_talla_color": "CE_ProductoTallaColor",
    "categorias": "CE_Categorias",
    "tallas": "CE_Tallas",
    "colores": "CE_Colores",
    "temporadas": "CE_Temporadas",
    "BitacoraService": "SRV_BitacoraService",
    "BitacoraAuditoria": "CE_BitacoraAuditoria"
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU13", 0);
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

    try { actor.Alias = "ACTOR_Administrador"; } catch (ignore) { }
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
    aviso("Generando CU13 - Elementos muy pequeños...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "3. Catálogo");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "3. Catálogo");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU13 - Registrar Producto de Ropa - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU13 - Registrar Producto de Ropa - Diagrama de Comunicación Elementos Muy Pequeños",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario (actor externo)",
            "Administrador General o Encargado de Sucursal con permiso gestionar_productos."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx"
        );

        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "web/src/components/layout/admin/AdminLayout.tsx"
        );

        var adminCatalogoProductos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminCatalogoProductos", "Object", "Class", "Boundary",
            "web/src/pages/admin/AdminCatalogoProductos.tsx"
        );

        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx"
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts - catálogo y productos"
        );

        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "web/src/lib/api.ts"
        );

        var catalogoAdminController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "CatalogoAdminController", "Object", "Class", "Control",
            "api/src/modulos/catalogo/CTR_CatalogoAdmin.ts"
        );

        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts"
        );

        var productosService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ProductosService", "Object", "Class", "Service",
            "api/src/modulos/catalogo/SRV_ProductosService.ts"
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "TypeORM DataSource; SQL directo"
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Tabla SQL; no hay entidad TypeORM Producto en el módulo"
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Tabla SQL de combinaciones talla/color"
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

        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_BitacoraService.ts"
        );

        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraAuditoria", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - bitacora_auditoria"
        );

        // Elementos muy pequeños.
        posicionar(diagrama, actor, 20, 190, 120, 215);
        posicionar(diagrama, routerApp, 160, 20, 290, 48);
        posicionar(diagrama, adminLayout, 160, 75, 290, 103);
        posicionar(diagrama, adminCatalogoProductos, 160, 130, 290, 158);
        posicionar(diagrama, authProvider, 320, 130, 450, 158);

        posicionar(diagrama, api, 490, 20, 620, 48);
        posicionar(diagrama, apiError, 490, 75, 620, 103);
        posicionar(diagrama, catalogoAdminController, 490, 130, 620, 158);
        posicionar(diagrama, jwtAuthGuard, 660, 20, 790, 48);
        posicionar(diagrama, productosService, 830, 20, 960, 48);
        posicionar(diagrama, dataSource, 1000, 20, 1130, 48);
        posicionar(diagrama, productos, 1000, 75, 1130, 103);
        posicionar(diagrama, productoTallaColor, 1000, 130, 1130, 158);
        posicionar(diagrama, categorias, 1170, 20, 1300, 48);
        posicionar(diagrama, tallas, 1170, 75, 1300, 103);
        posicionar(diagrama, colores, 1170, 130, 1300, 158);
        posicionar(diagrama, temporadas, 1340, 20, 1470, 48);
        posicionar(diagrama, bitacoraService, 1340, 75, 1470, 103);
        posicionar(diagrama, bitacoraAuditoria, 1340, 130, 1470, 158);

        // ============================================================
        // FLUJO ESENCIAL DE REGISTRO DE PRODUCTO.
        // Los detalles de autenticación y validaciones se agrupan.
        // ============================================================

        agregarMensajes(diagrama, actor, routerApp, [
            "1: navega a /admin/catalogo/productos"
        ], "message");

        agregarMensajes(diagrama, routerApp, adminLayout, [
            "2: Route /admin/catalogo/productos -> <AdminCatalogoProductos />"
        ], "message");

        agregarMensajes(diagrama, adminLayout, adminCatalogoProductos, [
            "3: <Outlet /> -> <AdminCatalogoProductos />"
        ], "message");

        agregarMensajes(diagrama, adminCatalogoProductos, authProvider, [
            "4: useAuth() -> usuario / token",
            "5: permisoOk = permisos.includes('*') || permisos.includes('gestionar_productos')",
            "5a: sin permiso -> 'Acceso denegado'; AdminLayout oculta el menú"
        ], "message");

        agregarMensajes(diagrama, adminCatalogoProductos, adminCatalogoProductos, [
            "6: cargar() -> Promise.all([api.listarProductos(), api.obtenerSelectoresProducto()])",
            "7: ModalNuevoProducto: nombre, descripción, categoría, temporada, precio_base, porcentaje_iva, tallas, colores",
            "8: formularioValido: nombre >=3, precio >0 a 2 decimales, IVA 0-100, arrays no vacías",
            "9: combinaciones = tallas.length * colores.length",
            "10: guardar() -> setModal(false) / setToast(...) / cargar()"
        ], "message");

        agregarMensajes(diagrama, adminCatalogoProductos, api, [
            "11: listarProductos() / obtenerSelectoresProducto()",
            "12: crearProducto(payload)"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "13: headers: Authorization = Bearer ${token}",
            "14: credentials: 'include' -> handleResponse()"
        ], "message");

        agregarMensajes(diagrama, api, catalogoAdminController, [
            "15: GET /api/v1/admin/catalogo/productos",
            "16: GET /api/v1/admin/catalogo/productos/selectores",
            "17: POST /api/v1/admin/catalogo/productos"
        ], "message");

        agregarMensajes(diagrama, catalogoAdminController, jwtAuthGuard, [
            "18: @UseGuards(JwtAuthGuard)",
            "19: canActivate(): JwtTokenService.verificarAccessToken(), estaEnBlacklist(), usuarioRepo.findOne()"
        ], "message");

        agregarMensajes(diagrama, catalogoAdminController, productosService, [
            "20: listarSelectores() / listarProductos()",
            "21: UsuarioActual() -> currentUser; CrearProductoRequest -> crearProducto(currentUser, body, request)",
            "21a: ValidationPipe global: whitelist/transform; class-validator -> 422"
        ], "message");

        agregarMensajes(diagrama, productosService, dataSource, [
            "22: cargarPermisos() -> usuarios_roles JOIN roles.permisos_json",
            "23: listarSelectores(): categorias/tallas/colores Activos; temporadas sin filtro de estado",
            "24: valida LOWER(nombre) único, precio, IVA, categoría, temporada, tallas y colores",
            "25: insertarConSku() -> TMU-#### y reintenta si aparece 23505",
            "26: INSERT productos + INSERT producto_talla_color"
        ], "message");

        agregarMensajes(diagrama, dataSource, productos, [
            "27: productos: codigo, nombre, precio_base, porcentaje_iva, estado='Activo', fecha_registro=NOW()"
        ], "message");

        agregarMensajes(diagrama, dataSource, productoTallaColor, [
            "28: N×M combinaciones: id_producto, id_talla, id_color, estado_stock='Disponible'"
        ], "message");

        agregarMensajes(diagrama, dataSource, categorias, [
            "29: SELECT ... WHERE LOWER(estado) = 'activo'; porcentaje_iva_default"
        ], "validation");

        agregarMensajes(diagrama, dataSource, tallas, [
            "30: SELECT id_talla WHERE LOWER(estado) = 'activo'"
        ], "validation");

        agregarMensajes(diagrama, dataSource, colores, [
            "31: SELECT id_color WHERE LOWER(estado) = 'activo'"
        ], "validation");

        agregarMensajes(diagrama, dataSource, temporadas, [
            "32: SELECT id_temporada; la creación solo exige que exista"
        ], "validation");

        agregarMensajes(diagrama, productosService, bitacoraService, [
            "33: bitacora('INSERT', 'productos', ..., idProducto, null, newData)",
            "34: old_data=null; new_data=codigo, nombre, categoría, temporada, precio, IVA, combinaciones, estado"
        ], "message");

        agregarMensajes(diagrama, bitacoraService, bitacoraAuditoria, [
            "35: registrar() -> repo.create(bitacora) / repo.save(bitacora)"
        ], "message");

        agregarMensajes(diagrama, productosService, catalogoAdminController, [
            "36: 201 { detail:'Producto registrado correctamente.', id_producto, codigo, combinaciones, precio_final }",
            "E1: 422 'La categoría seleccionada no es válida.' / 'La temporada seleccionada no es válida.'",
            "E1: 422 'Una de las tallas seleccionadas no es válida.' / 'Uno de los colores seleccionados no es válido.'",
            "E2: 422 'El precio debe ser mayor a 0 y tener máximo 2 decimales.'",
            "E2: IVA -> 'El porcentaje de IVA debe estar entre 0 y 100.'",
            "E3: 409 'Ya existe un producto con ese nombre.'",
            "E4: 403 'No tienes permiso para gestionar productos.'",
            "E5: 422 'Selecciona al menos una talla.' / 'Selecciona al menos un color.'"
        ], "return");

        agregarMensajes(diagrama, catalogoAdminController, api, [
            "37: return ProductoItem[] / SelectoresProducto / resultado de creación",
            "HTTP 200 / 201 / 403 / 409 / 422"
        ], "return");

        agregarMensajes(diagrama, api, apiError, [
            "E1-E5: handleResponse() -> throw new ApiError(status, message)"
        ], "error");

        agregarMensajes(diagrama, api, adminCatalogoProductos, [
            "38: setProductos() / setSelectores()",
            "39: setToast(`${res.detail} (${res.codigo}, ${res.combinaciones} combinación(es)).`); void cargar()",
            "E1-E5: setErrorModal() / setError()"
        ], "return");

        agregarMensajes(diagrama, adminCatalogoProductos, adminCatalogoProductos, [
            "40: tabla muestra codigo, nombre, categoría, temporada, combinaciones, precio_final y estado Activo"
        ], "message");

        try {
            diagrama.Notes =
                "CU13 - Flujo real del código actual (React/Vite + NestJS).\n" +
                "El permiso real es gestionar_productos o '*'.\n" +
                "El rol base Encargado de Sucursal del schema.sql usa gestionar_catalogo; ProductosService exige gestionar_productos o '*'.\n" +
                "El formulario actual también captura porcentaje_iva y devuelve precio_final.\n" +
                "El SKU real se genera como TMU-#### (cuatro dígitos), no TMU-###.\n" +
                "Los selectores filtran categorías, tallas y colores activos; temporadas se listan sin exigir estado Activa al crear.\n" +
                "El servicio usa SQL directo y no define entidades TypeORM Producto, Categoria, Talla, Color o Temporada.\n" +
                "El schema.sql inspeccionado contiene 6 tallas, 8 colores, 8 categorías y no siembra temporadas.\n" +
                "El código usa porcentaje_iva y porcentaje_iva_default, aunque esas columnas no aparecen en schema.sql.\n" +
                "No se inserta inventario_stock en CU13; solo se crean producto_talla_color con estado_stock='Disponible'.\n" +
                "CatalogoService solo muestra productos públicos cuando existe inventario_stock con cantidad_disponible > 0.\n" +
                "No se observa una transacción explícita entre productos, combinaciones y bitácora.\n" +
                "La UI es React; no se usa MatTable.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU13 con elementos muy pequeños creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Los mensajes secundarios fueron agrupados.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU13", 0);
    }
}

main();
