// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU18 - Registrar Proveedor
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
    "AdminProveedores": "IU_AdminProveedores",
    "AuthProvider": "IU_AuthProvider",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "ProveedoresController": "CTR_Proveedores",
    "SucursalesController": "CTR_Sucursales",
    "JwtAuthGuard": "CTR_JwtAuthGuard",
    "ProveedoresService": "SRV_ProveedoresService",
    "SucursalesService": "SRV_SucursalesService",
    "DataSource": "SRV_DataSource",
    "proveedores": "CE_Proveedores",
    "ciudades": "CE_Ciudades",
    "BitacoraService": "SRV_BitacoraService",
    "BitacoraAuditoria": "CE_BitacoraAuditoria"
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
    shell.Popup(texto, 0, "Tiendas Montaño - CU18", 0);
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
    aviso("Generando CU18 - Elementos muy pequeños...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteModulo = buscarPaquete(paqueteCasosUso, "5. Proveedores y Compras");
        if (paqueteModulo == null) {
            paqueteModulo = obtenerOCrearSubPaquete(paqueteCasosUso, "5. Proveedores y Compras");
        }

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteModulo,
            "CU18 - Registrar Proveedor - Comunicación"
        );

        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU18 - Registrar Proveedor - Diagrama de Comunicación Elementos Muy Pequeños",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario (actor externo)",
            "Administrador General que registra un proveedor."
        );

        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx"
        );

        var adminLayout = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminLayout", "Object", "Class", "Boundary",
            "web/src/components/layout/admin/AdminLayout.tsx"
        );

        var adminProveedores = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AdminProveedores", "Object", "Class", "Boundary",
            "web/src/pages/admin/AdminProveedores.tsx"
        );

        var authProvider = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "AuthProvider", "Object", "Class", "Boundary",
            "web/src/contexts/AuthContext.tsx"
        );

        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts - proveedores y ciudades"
        );

        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "web/src/lib/api.ts"
        );

        var proveedoresController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ProveedoresController", "Object", "Class", "Control",
            "api/src/modulos/proveedores/CTR_Proveedores.ts"
        );

        var sucursalesController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "SucursalesController", "Object", "Class", "Control",
            "api/src/modulos/seguridad/CTR_Sucursales.ts"
        );

        var jwtAuthGuard = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "JwtAuthGuard", "Object", "Class", "Control",
            "api/src/modulos/seguridad/dependencias.ts"
        );

        var proveedoresService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ProveedoresService", "Object", "Class", "Service",
            "api/src/modulos/proveedores/SRV_ProveedoresService.ts"
        );

        var sucursalesService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "SucursalesService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_SucursalesService.ts"
        );

        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "TypeORM DataSource; SQL directo"
        );

        var proveedores = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "proveedores", "Object", "Class", "Entity",
            "Tabla SQL de proveedores; no hay entidad TypeORM Proveedor"
        );

        var ciudades = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ciudades", "Object", "Class", "Entity",
            "Tabla SQL de ciudades"
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
        posicionar(diagrama, adminProveedores, 160, 130, 290, 158);
        posicionar(diagrama, authProvider, 320, 130, 450, 158);

        posicionar(diagrama, api, 490, 20, 620, 48);
        posicionar(diagrama, apiError, 490, 75, 620, 103);
        posicionar(diagrama, proveedoresController, 490, 130, 620, 158);
        posicionar(diagrama, sucursalesController, 660, 20, 790, 48);
        posicionar(diagrama, jwtAuthGuard, 660, 75, 790, 103);
        posicionar(diagrama, proveedoresService, 830, 20, 960, 48);
        posicionar(diagrama, sucursalesService, 830, 75, 960, 103);
        posicionar(diagrama, dataSource, 1000, 20, 1130, 48);
        posicionar(diagrama, proveedores, 1000, 75, 1130, 103);
        posicionar(diagrama, ciudades, 1000, 130, 1130, 158);
        posicionar(diagrama, bitacoraService, 1170, 20, 1300, 48);
        posicionar(diagrama, bitacoraAuditoria, 1170, 75, 1300, 103);

        // ============================================================
        // FLUJO ESENCIAL DE REGISTRO DE PROVEEDOR.
        // La consulta de ciudades reutilizada y la auditoría se agrupan.
        // ============================================================

        agregarMensajes(diagrama, actor, routerApp, [
            "1: navega a /admin/proveedores"
        ], "message");

        agregarMensajes(diagrama, routerApp, adminLayout, [
            "2: Route /admin/proveedores"
        ], "message");

        agregarMensajes(diagrama, adminLayout, adminProveedores, [
            "3: <Outlet /> -> <AdminProveedores />"
        ], "message");

        agregarMensajes(diagrama, adminProveedores, authProvider, [
            "4: useAuth() -> usuario / token",
            "5: permisoOk = permisos.includes('*') || permisos.includes('gestionar_proveedores')",
            "5a: sin permiso -> 'Acceso denegado'; AdminLayout oculta el menú"
        ], "message");

        agregarMensajes(diagrama, adminProveedores, adminProveedores, [
            "6: cargar() -> Promise.all([api.listarProveedores(), api.listarCiudades()])",
            "7: ciudades.filter(estado='Activa') para el formulario",
            "8: ModalNuevoProveedor valida nombre, NIT, teléfono, correo y ciudad",
            "9: guardar() -> crearProveedor(); setToast(res.detail); cargar()"
        ], "message");

        agregarMensajes(diagrama, adminProveedores, api, [
            "10: listarProveedores()",
            "11: listarCiudades()",
            "12: crearProveedor(payload)"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "13: headers: Authorization = Bearer ${token}",
            "14: credentials: 'include' -> handleResponse()"
        ], "message");

        agregarMensajes(diagrama, api, proveedoresController, [
            "15: GET /api/v1/proveedores",
            "16: POST /api/v1/proveedores"
        ], "message");

        agregarMensajes(diagrama, api, sucursalesController, [
            "17: GET /api/v1/admin/ciudades (reutilizado de CU12)"
        ], "message");

        agregarMensajes(diagrama, proveedoresController, jwtAuthGuard, [
            "18: @UseGuards(JwtAuthGuard); UsuarioActual()",
            "19: JwtTokenService.verificarAccessToken() / estaEnBlacklist()"
        ], "message");

        agregarMensajes(diagrama, sucursalesController, jwtAuthGuard, [
            "20: mismo JwtAuthGuard para /admin/ciudades"
        ], "message");

        agregarMensajes(diagrama, proveedoresController, proveedoresService, [
            "21: CrearProveedorRequest -> DTO",
            "22: listarProveedores() / crearProveedor(currentUser, dto, request)"
        ], "message");

        agregarMensajes(diagrama, sucursalesController, sucursalesService, [
            "23: listarCiudades(currentUser)"
        ], "message");

        agregarMensajes(diagrama, proveedoresService, dataSource, [
            "24: exigirPermiso() -> roles.permisos_json",
            "25: valida nombre 3-150, NIT /^\\d{6,10}$/, teléfono, correo e id_ciudad",
            "26: SELECT ciudad LOWER(estado)='activa'",
            "27: SELECT COUNT(*) FROM proveedores WHERE nit_ruc = $1",
            "28: INSERT estado_riesgo='Activo', fecha_registro=NOW()"
        ], "message");

        agregarMensajes(diagrama, sucursalesService, dataSource, [
            "29: exigirPermiso('gestionar_sucursales')",
            "30: SELECT ciudades; la UI filtra Activas"
        ], "message");

        agregarMensajes(diagrama, dataSource, proveedores, [
            "31: id_proveedor, nombre_empresa, nit_ruc, telefono, email",
            "32: id_ciudad, direccion, condiciones_comerciales, estado_riesgo, fecha_registro"
        ], "message");

        agregarMensajes(diagrama, dataSource, ciudades, [
            "33: id_ciudad, nombre, estado"
        ], "validation");

        agregarMensajes(diagrama, proveedoresService, bitacoraService, [
            "34: bitacora('INSERT', 'proveedores', ..., idProveedor, null, newData)",
            "35: new_data={nombre,nit_ruc,correo,telefono,id_ciudad}"
        ], "message");

        agregarMensajes(diagrama, bitacoraService, bitacoraAuditoria, [
            "36: registrar() -> repo.create(bitacora) / repo.save(bitacora)"
        ], "message");

        agregarMensajes(diagrama, proveedoresService, proveedoresController, [
            "37: 201 { detail:'Proveedor registrado.', id_proveedor }",
            "E1: 409 'El NIT/RUC ya está registrado.'",
            "E2: 422 'El NIT/RUC no tiene un formato válido.'",
            "E3: 422 'La ciudad seleccionada no existe.'",
            "E4: 403 'No tienes permiso para gestionar proveedores.'"
        ], "return");

        agregarMensajes(diagrama, sucursalesService, sucursalesController, [
            "38: return CiudadItem[]"
        ], "return");

        agregarMensajes(diagrama, proveedoresController, api, [
            "39: return ItemProveedor[] / { detail, id_proveedor }; HTTP 200 / 201 / 403 / 409 / 422"
        ], "return");

        agregarMensajes(diagrama, sucursalesController, api, [
            "40: return ciudades; HTTP 200 / 403"
        ], "return");

        agregarMensajes(diagrama, api, apiError, [
            "E1-E4: handleResponse() -> throw new ApiError(status, message)"
        ], "error");

        agregarMensajes(diagrama, api, adminProveedores, [
            "41: setProveedores() / setCiudades()",
            "42: Éxito: setToast('Proveedor registrado.'); void cargar()",
            "E1-E4: setErrorModal() / setError()"
        ], "return");

        agregarMensajes(diagrama, adminProveedores, adminProveedores, [
            "43: tabla muestra nombre, NIT/RUC, teléfono, correo, ciudad, estado y score",
            "44: calidad_score=null -> ScoreBadge muestra '—'",
            "45: estado Activo habilita el proveedor; el mismo módulo contiene CU19/CU20"
        ], "message");

        try {
            diagrama.Notes =
                "CU18 - Flujo real del código actual (React/Vite + NestJS).\n" +
                "La ruta web real es /admin/proveedores.\n" +
                "ProveedoresModule está registrado en app.module.ts.\n" +
                "El permiso de ProveedoresService es gestionar_proveedores o '*'.\n" +
                "La consulta de ciudades reutiliza /admin/ciudades de CU12 y exige gestionar_sucursales o '*'.\n" +
                "Por eso gestionar_proveedores sin gestionar_sucursales puede impedir cargar el formulario.\n" +
                "El servicio mapea nombre -> nombre_empresa, correo -> email y estado -> estado_riesgo='Activo'.\n" +
                "El código inserta condiciones_comerciales; no lo mapea a la columna observaciones.\n" +
                "El schema.sql inspeccionado no contiene nit_ruc, id_ciudad, condiciones_comerciales ni score_fecha.\n" +
                "No se localizó una migración de esos campos en los archivos inspeccionados.\n" +
                "El servicio valida el NIT y la ciudad activa, pero no pre-valida duplicados de nombre o email.\n" +
                "El schema sí declara nombre_empresa UNIQUE y email UNIQUE; una colisión puede terminar en error SQL.\n" +
                "El toast real usa res.detail: 'Proveedor registrado.', no 'Proveedor registrado correctamente.'.\n" +
                "El módulo también expone cambios de estado y score de CU19/CU20, fuera del flujo central de CU18.";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU18 con elementos muy pequeños creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Los mensajes secundarios fueron agrupados.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        var detalle = "";
        try { detalle = e.description || e.message || String(e); } catch (ignore) { detalle = String(e); }
        shell.Popup("ERROR: " + detalle, 0, "Error CU18", 0);
    }
}

main();
