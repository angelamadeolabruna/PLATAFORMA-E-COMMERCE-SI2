// ================================================================
// TIENDAS MONTAÑO - PUDS / ANÁLISIS
// CU03 - Registrar Nuevo Cliente
// Diagrama de Comunicación compacto.
//
// Source of truth: implementation actual React/Vite + NestJS.
// Los mensajes se agrupan por colaboración para reducir flechas.
//
// Ejecutar en Enterprise Architect:
//   Scripting > JScript > Run
// ================================================================

var ALIAS_POR_NOMBRE = {
    "Navbar": "IU_Navbar",
    "RouterApp": "IU_RouterApp",
    "LayoutRaiz": "IU_LayoutRaiz",
    "Login": "IU_Login",
    "Registro": "IU_Registro",
    "api": "IU_Api",
    "ApiError": "IU_ApiError",
    "Response": "CTR_Response",
    "ClienteController": "CTR_Cliente",
    "DataSource": "SRV_DataSource",
    "ClienteService": "SRV_ClienteService",
    "Usuario": "CE_Usuario",
    "Rol": "CE_Rol",
    "UsuarioRol": "CE_UsuarioRol",
    "SeguridadService": "SRV_SeguridadService",
    "Cliente": "CE_Cliente",
    "EmailConfirmation": "CE_EmailConfirmation",
    "EmailService": "SRV_EmailService",
    "BitacoraService": "SRV_BitacoraService",
    "BitacoraAuditoria": "CE_BitacoraAuditoria"
};

// 0.45 reduce el lienzo aproximadamente al 45% del tamaño original.
var ESCALA_X = 0.45;
var ESCALA_Y = 0.45;
var ANCHO_MINIMO = 100;
var ALTO_MINIMO = 28;
var FUENTE_PARTICIPANTES = 6;
var FUENTE_MENSAJES = 5;

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Tiendas Montaño - CU03 compacto", 0);
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

    try { actor.Alias = "ACTOR_ClienteNuevo"; } catch (ignore) { }
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
        if (diagrama.DiagramLinks.GetAt(i).ConnectorID == conectorId) {
            return true;
        }
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

// Agrupa varios mensajes en un solo enlace multilínea.
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
    aviso("Generando CU03 - Diagrama de Comunicación compacto...");

    try {
        var raiz = Repository.Models.GetAt(0);

        var paqueteCasosUso = buscarPaquete(raiz, "Casos de Uso");
        if (paqueteCasosUso == null) paqueteCasosUso = raiz;

        var paqueteActores = buscarPaquete(raiz, "Actores");
        if (paqueteActores == null) {
            paqueteActores = obtenerOCrearSubPaquete(paqueteCasosUso, "Actores");
        }

        var paqueteSeguridad = obtenerOCrearSubPaquete(
            paqueteCasosUso,
            "1. Seguridad y Auditoría"
        );

        var paqueteDiagrama = obtenerOCrearSubPaquete(
            paqueteSeguridad,
            "CU03 - Registrar Nuevo Cliente - Comunicación"
        );

        // Nombre nuevo para no mezclar los mensajes del diagrama individual.
        var diagrama = obtenerOCrearDiagrama(
            paqueteDiagrama,
            "CU03 - Registrar Nuevo Cliente - Diagrama de Comunicación Compacto",
            "Communication"
        );

        var actor = obtenerOCrearActor(
            raiz,
            paqueteActores,
            "Usuario (actor externo)",
            "Cliente nuevo sin cuenta previa."
        );

        var navbar = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Navbar", "Object", "Class", "Boundary",
            "web/src/components/layout/Navbar.tsx"
        );
        var routerApp = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "RouterApp", "Object", "Class", "Boundary",
            "web/src/router.tsx"
        );
        var layoutRaiz = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "LayoutRaiz", "Object", "Class", "Boundary",
            "web/src/components/layout/LayoutRaiz.tsx"
        );
        var login = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Login", "Object", "Class", "Boundary",
            "web/src/pages/Login.tsx"
        );
        var registro = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Registro", "Object", "Class", "Boundary",
            "web/src/pages/Registro.tsx"
        );
        var api = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "api", "Object", "Class", "Boundary",
            "web/src/lib/api.ts - registrar(), solicitar(), handleResponse<RegistroResponse>()"
        );
        var apiError = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ApiError", "Object", "Class", "Boundary",
            "web/src/lib/api.ts"
        );
        var response = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Response", "Object", "Class", "Boundary",
            "Express Response usado por ClienteController.registrar"
        );
        var clienteController = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ClienteController", "Object", "Class", "Control",
            "api/src/modulos/clientes/CTR_Cliente.ts"
        );
        var dataSource = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "DataSource", "Object", "Class", "Service",
            "TypeORM DataSource"
        );
        var clienteService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "ClienteService", "Object", "Class", "Service",
            "api/src/modulos/clientes/SRV_ClienteService.ts"
        );
        var usuario = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Usuario", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - usuarios"
        );
        var rol = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Rol", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - roles"
        );
        var usuarioRol = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "UsuarioRol", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - usuarios_roles"
        );
        var seguridadService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "SeguridadService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_SeguridadService.ts - hashearPassword()"
        );
        var cliente = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "Cliente", "Object", "Class", "Entity",
            "api/src/modulos/clientes/CE_Modelos.ts - clientes"
        );
        var emailConfirmation = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "EmailConfirmation", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - email_confirmations"
        );
        var emailService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "EmailService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_EmailService.ts - enviarBienvenida()"
        );
        var bitacoraService = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraService", "Object", "Class", "Service",
            "api/src/modulos/seguridad/SRV_BitacoraService.ts"
        );
        var bitacoraAuditoria = obtenerOCrearElemento(
            raiz, paqueteDiagrama, "BitacoraAuditoria", "Object", "Class", "Entity",
            "api/src/modulos/seguridad/CE_Modelos.ts - bitacora_auditoria"
        );

        // Layout compacto por columnas de responsabilidad.
        posicionar(diagrama, actor, 20, 250, 210, 310);
        posicionar(diagrama, navbar, 250, 20, 450, 80);
        posicionar(diagrama, routerApp, 250, 110, 450, 170);
        posicionar(diagrama, layoutRaiz, 250, 200, 450, 260);
        posicionar(diagrama, login, 250, 290, 450, 350);
        posicionar(diagrama, registro, 250, 380, 450, 440);

        posicionar(diagrama, api, 560, 40, 760, 100);
        posicionar(diagrama, apiError, 560, 160, 760, 220);
        posicionar(diagrama, clienteController, 560, 290, 760, 350);
        posicionar(diagrama, response, 560, 430, 760, 490);

        posicionar(diagrama, clienteService, 880, 40, 1100, 100);
        posicionar(diagrama, dataSource, 880, 160, 1100, 220);
        posicionar(diagrama, seguridadService, 880, 280, 1100, 340);

        posicionar(diagrama, usuario, 1220, 20, 1440, 80);
        posicionar(diagrama, rol, 1220, 120, 1440, 180);
        posicionar(diagrama, usuarioRol, 1220, 220, 1440, 280);
        posicionar(diagrama, cliente, 1220, 320, 1440, 380);
        posicionar(diagrama, emailConfirmation, 1220, 420, 1440, 480);

        posicionar(diagrama, emailService, 1560, 100, 1780, 160);
        posicionar(diagrama, bitacoraService, 1560, 250, 1780, 310);
        posicionar(diagrama, bitacoraAuditoria, 1560, 370, 1780, 430);

        // ============================================================
        // FLUJO PRINCIPAL Y COLABORACIONES AGRUPADAS.
        // ============================================================

        agregarMensajes(diagrama, navbar, routerApp, [
            "1: <Link to=\"/registro\">"
        ], "message");

        agregarMensajes(diagrama, login, routerApp, [
            "2: rutaRegistro = '/registro'",
            "3: <Link to={rutaRegistro}>Regístrate</Link>"
        ], "message");

        agregarMensajes(diagrama, routerApp, layoutRaiz, [
            "4: <Route element={<LayoutRaiz />}>"
        ], "message");

        agregarMensajes(diagrama, layoutRaiz, registro, [
            "5: <Outlet /> -> <Registro />"
        ], "message");

        agregarMensajes(diagrama, actor, registro, [
            "6: onChange(e) -> setNombre(...) / setEmail(...) / setTelefono(...) / setPassword(...) / setConfirmarPassword(...)",
            "7: onSubmit(e)"
        ], "message");

        agregarMensajes(diagrama, registro, registro, [
            "8: if (nombre.trim().length < 2) setError('El nombre debe tener al menos 2 caracteres.')",
            "9: if (!/^\\S+@\\S+\\.\\S+$/.test(email.trim())) setError('Ingresa un correo electrónico válido.')",
            "10: if (password.length < 8) setError('La contraseña debe tener al menos 8 caracteres.')",
            "11: if (password !== confirmarPassword) setError('Las contraseñas no coinciden.')",
            "12: finally setEnviando(false)"
        ], "validation");

        agregarMensajes(diagrama, registro, api, [
            "13: api.registrar({ nombre: nombre.trim(), email: email.trim(), password, telefono: telefono.trim() || undefined })"
        ], "message");

        agregarMensajes(diagrama, api, api, [
            "14: solicitar('/api/v1/clientes/registrar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, { renovar: false })",
            "15: handleResponse<RegistroResponse>(res)"
        ], "message");

        agregarMensajes(diagrama, api, apiError, [
            "E1/E7: handleResponse<RegistroResponse>(res) throws new ApiError(res.status, message)"
        ], "error");

        agregarMensajes(diagrama, apiError, registro, [
            "E1: err instanceof ApiError",
            "E1: err.status === 409"
        ], "error");

        agregarMensajes(diagrama, api, clienteController, [
            "16: POST /api/v1/clientes/registrar { nombre, email, password, telefono? }",
            "17: return resultado / HTTP 201 / HTTP 207",
            "18: HTTP 409 / HTTP 500"
        ], "message");

        agregarMensajes(diagrama, clienteController, clienteService, [
            "19: registrarCliente(body, request)"
        ], "message");

        agregarMensajes(diagrama, clienteService, clienteService, [
            "20a: emailNormalizado = body.email.toLowerCase().trim()"
        ], "message");

        agregarMensajes(diagrama, clienteService, dataSource, [
            "20: getRepository(Usuario).findOne({ where: { email: emailNormalizado } })",
            "21: getRepository(Rol).findOne({ where: { nombre_rol: 'Cliente' } })",
            "22: getRepository(Usuario).create(...) / save(usuario)",
            "23: getRepository(UsuarioRol).insert({ id_usuario, id_rol })",
            "24: getRepository(Cliente).create(...) / save(cliente)",
            "25: getRepository(EmailConfirmation).insert({ usuario_id, token, expires_at, used: false })"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuario, [
            "26: Usuario: email, password_hash, estado: 'Activo'"
        ], "message");

        agregarMensajes(diagrama, dataSource, rol, [
            "27: Rol: nombre_rol: 'Cliente'"
        ], "message");

        agregarMensajes(diagrama, dataSource, usuarioRol, [
            "28: UsuarioRol: id_usuario, id_rol"
        ], "message");

        agregarMensajes(diagrama, dataSource, cliente, [
            "29: Cliente: usuario, nombre, telefono ?? null"
        ], "message");

        agregarMensajes(diagrama, dataSource, emailConfirmation, [
            "30: EmailConfirmation: token = randomUUID(); expires_at = Date.now() + 24h; used = false"
        ], "message");

        agregarMensajes(diagrama, clienteService, seguridadService, [
            "31: hashearPassword(body.password)"
        ], "message");

        agregarMensajes(diagrama, seguridadService, clienteService, [
            "32: bcrypt.hash(password, 10) -> hash"
        ], "return");

        agregarMensajes(diagrama, clienteService, emailService, [
            "33: enviarBienvenida(emailNormalizado, token)"
        ], "message");

        agregarMensajes(diagrama, emailService, clienteService, [
            "34: emailOk = true / false",
            "35: EMAIL_ENABLED=false -> EMAIL SIMULADO; SMTP error -> false"
        ], "return");

        agregarMensajes(diagrama, clienteService, bitacoraService, [
            "36: registrar(usuario.id_usuario, 'INSERT', 'clientes', 'Alta de nuevo cliente', request, usuario.id_usuario)"
        ], "message");

        agregarMensajes(diagrama, bitacoraService, bitacoraAuditoria, [
            "37: repo.save(bitacora)"
        ], "message");

        agregarMensajes(diagrama, clienteService, clienteController, [
            "38: return { statusCode, detail, usuario_id, confirmacion_email, warning? }",
            "E1: throw ConflictException('Ya existe una cuenta con este correo electrónico.')",
            "E7: throw HttpException('El rol Cliente no está configurado en el sistema.', HttpStatus.INTERNAL_SERVER_ERROR)"
        ], "return");

        agregarMensajes(diagrama, clienteController, response, [
            "39: response.status(statusCode)"
        ], "message");

        agregarMensajes(diagrama, response, api, [
            "40: return resultado"
        ], "return");

        agregarMensajes(diagrama, api, registro, [
            "41: setExito(resultado.detail)",
            "42: if (resultado.warning) setError(resultado.warning)",
            "43: setTimeout(() => navigate('/login'), 2500)",
            "E1: if (err.status === 409) setError('Ya existe una cuenta con ese correo.')",
            "E7: else setError(err.message)",
            "E8: setError('No se pudo enviar el correo de confirmación.')"
        ], "return");

        agregarMensajes(diagrama, registro, routerApp, [
            "44: navigate('/login')"
        ], "message");

        agregarMensajes(diagrama, routerApp, login, [
            "45: /login -> <Login />"
        ], "message");

        // La documentación menciona términos, validación async de email,
        // contraseña fuerte y otros campos; no se agregan porque no existen
        // en el código actual de Registro.tsx.
        try {
            diagrama.Notes =
                "CU03 - Flujo real del código actual (React/Vite + NestJS).\n" +
                "No se implementan términos y condiciones, validación async de email,\n" +
                "contraseña con regex fuerte, teléfono Bolivia ni preferencias_json.\n" +
                "El hash real usa bcrypt.hash(password, 10).";
            diagrama.Update();
        } catch (ignore) {
        }

        diagrama.Update();
        Repository.OpenDiagram(diagrama.DiagramID);

        aviso(
            "CU03 compacto creado correctamente.\n\n" +
            "Diagrama: " + diagrama.Name + "\n" +
            "Los mensajes fueron agrupados por colaboración.\n" +
            "El diagrama anterior no se modifica."
        );
    } catch (e) {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error CU03 compacto", 0);
    }
}

main();
