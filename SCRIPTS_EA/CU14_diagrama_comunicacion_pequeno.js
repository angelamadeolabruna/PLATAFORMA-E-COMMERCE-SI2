// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU14 - Gestionar Tallas, Colores y Categorías
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
    "AdminCatalogos": "IU_AdminCatalogos",
    "AuthProvider": "IU_AuthProvider",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "CatalogosAdminController": "CTR_CatalogosAdmin",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "CatalogosService": "SRV_CatalogosService",
    "DataSource": "SRV_DataSource",
    "tallas": "CE_Tallas",
    "colores": "CE_Colores",
    "categorias": "CE_Categorias",
    "producto_talla_color": "CE_ProductoTallaColor",
    "productos": "CE_Productos",
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU14", 0);
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
    aviso("Generando CU14 - Elementos muy pequeños...");

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
            "CU14 - Gestionar Tallas, Colores y Categorías - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU14 - Gestionar Tallas, Colores y Categorías - Diagrama de Comunicación Elementos Muy Pequeños",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario (actor externo)",
            "Administrador General que mantiene los catálogos de referencia."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx"
        );

        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "web/src/components/layout/admin/AdminLayout.tsx"
        );

        var adminCatalogos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminCatalogos", "Object", "Class", "Boundary",
            "web/src/pages/admin/AdminCatalogos.tsx"
        );

        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx"
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts - catálogos de referencia"
        );

        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "web/src/lib/api.ts"
        );

        var catalogosAdminController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "CatalogosAdminController", "Object", "Class", "Control",
            "api/src/modulos/catalogo/CTR_CatalogosAdmin.ts"
        );

        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts"
        );

        var catalogosService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "CatalogosService", "Object", "Class", "Service",
            "api/src/modulos/catalogo/SRV_CatalogosService.ts"
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "TypeORM DataSource; SQL directo"
        );

        var tallas = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "tallas", "Object", "Class", "Entity",
            "Tabla SQL de tallas; no hay entidad TypeORM Talla"
        );

        var colores = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "colores", "Object", "Class", "Entity",
            "Tabla SQL de colores; no hay entidad TypeORM Color"
        );

        var categorias = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "categorias", "Object", "Class", "Entity",
            "Tabla SQL de categorías; no hay entidad TypeORM Categoria"
        );

        var productoTallaColor = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "producto_talla_color", "Object", "Class", "Entity",
            "Tabla SQL usada para verificar uso de tallas y colores"
        );

        var productos = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "productos", "Object", "Class", "Entity",
            "Tabla SQL usada para verificar uso de categorías"
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
        posicionar(diagrama, adminCatalogos, 160, 130, 290, 158);
        posicionar(diagrama, authProvider, 320, 130, 450, 158);

        posicionar(diagrama, api, 490, 20, 620, 48);
        posicionar(diagrama, apiError, 490, 75, 620, 103);
        posicionar(diagrama, catalogosAdminController, 490, 130, 620, 158);
        posicionar(diagrama, jwtAuthGuard, 660, 20, 790, 48);
        posicionar(diagrama, catalogosService, 830, 20, 960, 48);
        posicionar(diagrama, dataSource, 1000, 20, 1130, 48);
        posicionar(diagrama, tallas, 1000, 75, 1130, 103);
        posicionar(diagrama, colores, 1000, 130, 1130, 158);
        posicionar(diagrama, categorias, 1170, 20, 1300, 48);
        posicionar(diagrama, productoTallaColor, 1170, 75, 1300, 103);
        posicionar(diagrama, productos, 1170, 130, 1300, 158);
        posicionar(diagrama, bitacoraService, 1340, 20, 1470, 48);
        posicionar(diagrama, bitacoraAuditoria, 1340, 75, 1470, 103);

        // ============================================================
        // FLUJO ESENCIAL DE CATÁLOGOS DE REFERENCIA.
        // Las tres entidades comparten el mismo flujo de permisos y auditoría.
        // ============================================================

        agregarMensajes(diagrama, actor, routerApp, [
            "1: navega a /admin/catalogo/listas"
        ], "message");

        agregarMensajes(diagrama, routerApp, adminLayout, [
            "2: Route /admin/catalogo/listas -> <AdminCatalogos />"
        ], "message");

        agregarMensajes(diagrama, adminLayout, adminCatalogos, [
            "3: <Outlet /> -> <AdminCatalogos />"
        ], "message");

        agregarMensajes(diagrama, adminCatalogos, authProvider, [
            "4: useAuth() -> usuario / token",
            "5: permisoOk = permisos.includes('*') || permisos.includes('gestionar_tallas_colores')",
            "5a: sin permiso -> 'Acceso denegado'; AdminLayout oculta el menú"
        ], "message");

        agregarMensajes(diagrama, adminCatalogos, adminCatalogos, [
            "6: cargar() -> Promise.all([api.listarTallas(), api.listarColores(), api.listarCategorias()])",
            "7: PESTANAS tallas / colores / categorias; ModalEdicion / ModalConfirmarCambio",
            "8: guardar() -> crear*() / actualizar*(); confirmarInhabilitar()",
            "9: Toast de registro, modificación o inhabilitación; void cargar()"
        ], "message");

        agregarMensajes(diagrama, adminCatalogos, api, [
            "10: listarTallas() / listarColores() / listarCategorias()",
            "11: crearTalla() / crearColor() / crearCategoria()",
            "12: actualizarTalla() / actualizarColor() / actualizarCategoria()",
            "13: inhabilitarTalla() / inhabilitarColor() / inhabilitarCategoria()"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "14: headers: Authorization = Bearer ${token}",
            "15: credentials: 'include' -> handleResponse()"
        ], "message");

        agregarMensajes(diagrama, api, catalogosAdminController, [
            "16: GET /api/v1/admin/catalogos/tallas|colores|categorias",
            "17: POST /api/v1/admin/catalogos/{tallas|colores|categorias}",
            "18: PUT /api/v1/admin/catalogos/{tallas|colores|categorias}/:id",
            "19: PATCH /api/v1/admin/catalogos/{tallas|colores|categorias}/:id { estado:'Inactivo' }"
        ], "message");

        agregarMensajes(diagrama, catalogosAdminController, jwtAuthGuard, [
            "20: @Controller('admin/catalogos') + @UseGuards(JwtAuthGuard)",
            "21: JwtTokenService.verificarAccessToken(), estaEnBlacklist(), UsuarioActual()"
        ], "message");

        agregarMensajes(diagrama, catalogosAdminController, catalogosService, [
            "22: listarTallas() / listarColores() / listarCategorias()",
            "23: crear*() / actualizar*() / inhabilitar*()",
            "24: TallaRequest / ColorRequest / CategoriaRequest / EstadoRequest"
        ], "message");

        agregarMensajes(diagrama, catalogosService, dataSource, [
            "25: exigirPermiso() -> usuarios_roles JOIN roles.permisos_json",
            "26: asegurarUnico() -> LOWER(nombre) por tabla",
            "27: INSERT/UPDATE/SELECT de tallas, colores y categorias",
            "28: enUsoPorProductos() antes de UPDATE estado='Inactivo'",
            "29: bitacora() -> INSERT/UPDATE con old_data/new_data"
        ], "message");

        agregarMensajes(diagrama, dataSource, tallas, [
            "30: id_talla, nombre, talla_europea, orden, estado",
            "31: INSERT: orden = COALESCE(MAX(orden), 0) + 1, estado='Activo'"
        ], "message");

        agregarMensajes(diagrama, dataSource, colores, [
            "32: id_color, nombre, codigo_hex, estado",
            "33: validarHex(/^#[0-9A-Fa-f]{6}$/) y normalizar a mayúsculas"
        ], "validation");

        agregarMensajes(diagrama, dataSource, categorias, [
            "34: id_categoria, nombre, descripcion, porcentaje_iva_default, estado",
            "35: validarIva(): 0-100 y máximo 2 decimales; default 13"
        ], "validation");

        agregarMensajes(diagrama, dataSource, productoTallaColor, [
            "36: enUsoPorProductos('id_talla'/'id_color') con productos LOWER(estado)='activo'"
        ], "validation");

        agregarMensajes(diagrama, dataSource, productos, [
            "37: enUsoPorProductos('id_categoria') con productos LOWER(estado)='activo'"
        ], "validation");

        agregarMensajes(diagrama, catalogosService, bitacoraService, [
            "38: bitacora(accion, tabla, detalle, usuario, request, idRegistro, oldData, newData)",
            "39: INSERT al crear; UPDATE al modificar o inhabilitar"
        ], "message");

        agregarMensajes(diagrama, bitacoraService, bitacoraAuditoria, [
            "40: registrar() -> repo.create(bitacora) / repo.save(bitacora)"
        ], "message");

        agregarMensajes(diagrama, catalogosService, catalogosAdminController, [
            "41: 201/200 return TallaItem / ColorItem / ItemCategoria o { detail }",
            "E1: 409 'Ya existe una talla con ese nombre.' / 'Ya existe un color con ese nombre.' / 'Ya existe una categoría con ese nombre.'",
            "E2: 422 'El código de color debe tener formato #RRGGBB.'",
            "E3: 409 'No se puede inhabilitar: existen productos activos con esta talla.' / '... esta color.' / '... esta categoría.'",
            "E4: 403 'No tienes permiso para gestionar tallas, colores y categorías.'",
            "E5: 409 'La talla ya está inactiva.' / 'La color ya está inactivo.' / 'La categoría ya está inactiva.'",
            "E6: 404 'Talla no encontrada.' / 'Color no encontrado.' / 'Categoría no encontrada.'"
        ], "return");

        agregarMensajes(diagrama, catalogosAdminController, api, [
            "42: return item / detail; PATCH con estado distinto de Inactivo -> 'no tiene cambios'",
            "HTTP 200 / 201 / 403 / 404 / 409 / 422"
        ], "return");

        agregarMensajes(diagrama, api, apiError, [
            "E1-E6: handleResponse() -> throw new ApiError(status, message)"
        ], "error");

        agregarMensajes(diagrama, api, adminCatalogos, [
            "43: setTallas() / setColores() / setCategorias()",
            "44: Talla/Color/Categoría registrada/modificada: res.nombre; patch -> res.detail; setToast(); void cargar()",
            "E1-E6: setErrorModal() / setError()"
        ], "return");

        agregarMensajes(diagrama, adminCatalogos, adminCatalogos, [
            "45: tabla muestra nombre, datos específicos, estado y acciones",
            "46: entidad Activa queda disponible para los selectores de productos"
        ], "message");

        try {
            diagrama.Notes =
                "CU14 - Flujo real del código actual (React/Vite + NestJS).\n" +
                "La ruta web real es /admin/catalogo/listas, no /admin/catalogos.\n" +
                "Los endpoints reales usan /api/v1/admin/catalogos/{tallas|colores|categorias}.\n" +
                "El estado real es 'Inactivo' para las tres entidades, no 'Inactiva'.\n" +
                "El PATCH con un estado distinto de Inactivo devuelve un mensaje 'no tiene cambios'.\n" +
                "Las listas muestran registros activos e inactivos.\n" +
                "El código usa SQL directo y no define entidades TypeORM Talla, Color o Categoria.\n" +
                "El schema.sql inspeccionado no contiene talla_europea en tallas ni porcentaje_iva_default en categorias.\n" +
                "Para tallas y colores, el uso se verifica mediante producto_talla_color y productos activos.\n" +
                "Para categorías, el uso se verifica directamente mediante productos.id_categoria.\n" +
                "No se usa MatTabs, MatTable, MatDialog, FormGroup, Angular ni Flutter.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU14 con elementos muy pequeños creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Los mensajes secundarios fueron agrupados.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU14", 0);
    }
}

main();
