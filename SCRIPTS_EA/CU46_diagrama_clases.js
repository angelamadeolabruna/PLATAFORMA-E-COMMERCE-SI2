// ================================================================
// CU46 - EMITIR ALERTAS CRITICAS
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   NO EXISTE AlertasCriticasService, ni admin/alertas/criticas,
//   ni la pagina /admin/alertas/criticas, ni el item de menu.
//   La unica ruta de alertas es admin/inventario/alertas, la de CU25.
//   SI EXISTE el patron de ciclo programado, pero es de respaldos:
//     respaldos/SchedulerService.ts:5  OnModuleInit, OnModuleDestroy
//     respaldos/SchedulerService.ts:12 setInterval(revisar, 60_000)
//     y revisar() solo lanza respaldos automaticos
//   alertas_stock_config (schema.sql:331) TIENE las tres columnas que el
//   caso necesita: stock_minimo, notificar_email, ultima_notificacion.
//   Y tiene 0 INSERT, 0 UPDATE y 0 lecturas en todo el backend.
//   notificar_email y ultima_notificacion: 0 apariciones en el codigo.
//   seguridad/SRV_EmailService.ts:100 _enviarViaSmtp THROW 'SMTP aun no
//   configurado en el prototipo'. Sin transporte, sin host, sin puerto.
//   api/package.json 17 dependencias, NINGUNA de correo.
//   .env y .env.example 3 variables: EMAIL_ENABLED, EMAIL_FROM,
//   EMAIL_BASE_URL. Ni una sola SMTP_*.
//   Los metodos de EmailService devuelven true en casi todas sus ramas.
//   EmailService lo usan 5 modulos: Cliente, Reservas, Auth, Empleados
//   y el propio seguridad.module, que lo exporta.
//   api-server.err.log NO EXISTE: 0 ficheros .log en el workspace y
//   ningun codigo escribe en uno. El arranque es nest start a secas.
//   Los valores de accion_sql que de verdad se registran son:
//   BACKUP, DELETE, INSERT, LOGIN, LOGOUT, NOTIFICAR, UPDATE. CERO SELECT.
//   bitacora_auditoria (schema.sql:148) SI tiene ip_address y user_agent.
//   No hay trigger de bitacora: solo trg_bloquear_usuario_5_intentos
//   (620) y trg_movimiento_inventario (654).
//   inventario_stock.stock_minimo_alert INTEGER DEFAULT 0 (schema.sql:309)
//   El trigger de la 645 crea la fila con tres columnas, luego el umbral
//   queda en 0. El UNICO que lo pone mayor que cero es CU25 configurar.
//   SRV_AlertasService.ts:206  filtra con stock_minimo_alert > 0, CU46 no.
//   usuarios_empleados NO tiene columna email. Tiene telefono.
//   Para el correo hay que saltar usuarios_empleados -> usuarios.
//   web/src/components/ui/Badge.tsx existe, 6 variantes, 12 usos.
//   web/src/components/layout/admin/AdminLayout.tsx:62 ya hace
//   setInterval de 30_000, con clearInterval en la linea 65.
//   AdminLayout.tsx:69 tokenPuedeAlertas: asterisco o gestionar_inventario,
//   que es exactamente el permiso que pide el caso.
//   pages/admin/AdminAlertas.tsx ya existe y ya pinta el Badge de danger.
//   SchedulerService: 60 s. AdminLayout: 30 s. El caso pide 60 s.
//
// Sin estereotipo: el rol va en el nombre IU_ / CTR_ / SRV_ / CE_.
// Diagrama estatico: sin mensajes, sin lineas de vida, sin secuencia.
// Autorreparable. Una instruccion por linea. Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================

var ALTO = 14;
var SALTO = String.fromCharCode(10);
var VIS_PUB = 0;
var VIS_PRI = 1;
var RAIZ = Repository.Models.GetAt(0);
var TOTAL_REL = 58;
var TOTAL_ATR = 109;
var TOTAL_OPE = 34;

var DEF = [
    ["IU_Badge", "EXISTE. components/ui/Badge.tsx, 6 variantes", "el componente del badge rojo, ya usado en 12 sitios", [["variant", "String = neutral", VIS_PUB]], [["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_AdminLayout", "EXISTE. components/layout/admin/AdminLayout.tsx", "el contenedor: ya sondea cada 30 s y ya tiene los permisos", [["nAlertasCriticas", "Integer = null", VIS_PUB], ["nReservasPend", "Integer = null", VIS_PUB]], [["refrescar", "void", [], VIS_PUB], ["tokenPuedeAlertas", "Boolean", [], VIS_PUB], ["tokenPuedeReservas", "Boolean", [], VIS_PUB]]],

    ["IU_AdminMenu", "EXISTE. data/adminMenu.ts", "el item del badge con su contador en rojo", [["paquetes", "Array", VIS_PUB]], [["visibles", "Array", ["permisos"], VIS_PUB]]],

    ["IU_AdminAlertas", "EXISTE. pages/admin/AdminAlertas.tsx, CU25", "la pantalla de alertas que ya existe y ya pinta el badge", [["cargando", "Boolean", VIS_PUB], ["filtroSucursal", "String = vacio", VIS_PUB]], [["cargar", "void", ["idSucursal"], VIS_PUB], ["configurarMinimo", "void", ["items"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["CTR_Alertas", "EXISTE. inventario/CTR_Alertas.ts:46", "admin/inventario/alertas, la unica ruta de alertas", [["alertasService", "AlertasService", VIS_PRI]], [["opciones", "Object", [], VIS_PUB], ["listar", "Array", ["currentUser", "idSucursal"], VIS_PUB], ["configurar", "Object", ["currentUser", "dto", "request"], VIS_PUB]]],

    ["CTR_Reservas", "EXISTE. reservas/CTR_Reservas.ts", "la otra mitad del caso: las reservas sin atender", [["reservasService", "ReservasService", VIS_PRI]], [["listar", "Array", ["currentUser", "filtros"], VIS_PUB], ["preparar", "Object", ["currentUser", "idReserva", "request"], VIS_PUB], ["atender", "Object", ["currentUser", "idReserva", "request"], VIS_PUB]]],

    ["SRV_AlertasService", "EXISTE. inventario/SRV_AlertasService.ts, CU25", "la linea 206 exige stock_minimo_alert mayor que cero", [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI]], [["listar", "Array", ["usuario", "idSucursal"], VIS_PUB], ["configurar", "Object", ["usuario", "items", "request"], VIS_PUB], ["obtenerOpciones", "Object", ["usuario"], VIS_PUB], ["sucursalAplicar", "Integer", ["usuario", "idSucursal"], VIS_PRI]]],

    ["SRV_ReservasService", "EXISTE. reservas/SRV_ReservasService.ts, CU28 a CU31", "cinco estados, y Preparada significa que todo fue bien", [["dataSource", "DataSource", VIS_PRI], ["bitacoraService", "BitacoraService", VIS_PRI], ["emailService", "EmailService", VIS_PRI]], [["crearReserva", "Object", ["usuario", "dto", "request"], VIS_PUB], ["prepararReserva", "Object", ["usuario", "idReserva", "request"], VIS_PUB], ["confirmarRecepcion", "Object", ["usuario", "idReserva", "request"], VIS_PUB], ["cancelar", "Object", ["usuario", "id", "request"], VIS_PUB]]],

    ["SRV_SchedulerService", "EXISTE. respaldos/SchedulerService.ts:5, CU43", "el patron de 60 s, pero dedicated a los respaldos", [["timer", "Object = null", VIS_PRI], ["logger", "Logger", VIS_PRI]], [["onModuleInit", "void", [], VIS_PUB], ["revisar", "void", [], VIS_PRI], ["onModuleDestroy", "void", [], VIS_PUB]]],

    ["SRV_EmailService", "EXISTE. seguridad/SRV_EmailService.ts, 103 lineas", "la sexta infraestructura de mentira: _enviarViaSmtp lanza", [["config", "ConfigService", VIS_PRI], ["logger", "Logger", VIS_PRI]], [["enviarAvisoAlerta", "Boolean", ["destinatario", "asunto", "cuerpo"], VIS_PUB], ["enviarAvisoReserva", "Boolean", ["destinatario", "asunto", "cuerpo"], VIS_PUB], ["_enviarViaSmtp", "void", ["email", "asunto", "cuerpo"], VIS_PRI]]],

    ["SRV_AjustesService", "EXISTE. inventario/SRV_AjustesService.ts, CU24", "uno de los tres resolutores que nombra el caso", [["dataSource", "DataSource", VIS_PRI]], [["registrarAjuste", "Object", ["usuario", "dto"], VIS_PUB]]],

    ["SRV_BitacoraService", "EXISTE. seguridad/SRV_BitacoraService.ts", "nunca ha registrado una lectura, solo siete verbos", [["dataSource", "DataSource", VIS_PRI]], [["registrar", "void", ["idUsuario", "accion", "tabla", "descripcion", "request", "idRegistro", "datosViejos", "datosNuevos"], VIS_PUB]]],

    ["SRV_JwtAuthGuard", "EXISTE. seguridad/dependencias.ts", "el guard de la ruta de alertas", [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]], [["canActivate", "Boolean", ["context"], VIS_PUB]]],

    ["SRV_UsuarioActual", "EXISTE. seguridad/dependencias.ts", "inyecta el Usuario para el permiso y la bitacora", [], [["UsuarioActual", "Usuario", ["datos", "contexto"], VIS_PUB]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "el ciclo de 60 s haria aqui las dos consultas", [], [["query", "Array", ["sql", "params"], VIS_PUB], ["transaction", "any", ["callback"], VIS_PUB]]],

    ["CE_InventarioStock", "EXISTE. inventario_stock (schema.sql:302). Sin filas", "el umbral por defecto es CERO, y el WHERE del caso no lo exige", [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer = UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer = UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_reservada", "Integer = 0", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB], ["stock_minimo_alert", "Integer = 0", VIS_PUB]], []],

    ["CE_AlertasStockConfig", "EXISTE. alertas_stock_config (schema.sql:331). Sin filas", "0 INSERT, 0 UPDATE y 0 lecturas en todo el backend", [["id_config", "Integer = PK", VIS_PRI], ["id_ptc", "Integer = nullable", VIS_PUB], ["id_categoria", "Integer = nullable", VIS_PUB], ["id_sucursal", "Integer = nullable", VIS_PUB], ["stock_minimo", "Integer = nullable", VIS_PUB], ["notificar_email", "Boolean = false", VIS_PUB], ["ultima_notificacion", "Timestamp = nullable", VIS_PUB]], []],

    ["CE_ProductoTallaColor", "EXISTE. producto_talla_color (schema.sql:237). Sin filas", "el detalle del quiebre: producto, talla y color", [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB], ["estado_stock", "String = Disponible, nadie lo actualiza", VIS_PUB]], []],

    ["CE_Producto", "EXISTE. productos (schema.sql:223). Sin filas", "el nombre del producto en la alerta", [["id_producto", "Integer = PK", VIS_PRI], ["codigo", "String = 40 UNIQUE", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["id_categoria", "Integer", VIS_PUB], ["precio_base", "Decimal(10,2)", VIS_PUB], ["estado", "String = Disponible", VIS_PUB]], []],

    ["CE_Talla", "EXISTE. tallas (schema.sql:165). 6 filas sembradas", "XS a XXL, para el detalle del quiebre", [["id_talla", "Integer = PK", VIS_PRI], ["nombre", "String = 10 UNIQUE", VIS_PUB], ["orden", "Integer", VIS_PUB], ["estado", "String = Activo", VIS_PUB]], []],

    ["CE_Color", "EXISTE. colores (schema.sql:172). 8 filas sembradas", "con su codigo hexadecimal", [["id_color", "Integer = PK", VIS_PRI], ["nombre", "String = 50 UNIQUE", VIS_PUB], ["codigo_hex", "String = 7 UNIQUE", VIS_PUB], ["estado", "String = Activo", VIS_PUB]], []],

    ["CE_Categoria", "EXISTE. categorias (schema.sql:179). 8 filas sembradas", "la categoria que el caso pide en el detalle", [["id_categoria", "Integer = PK", VIS_PRI], ["nombre", "String = 80 UNIQUE", VIS_PUB], ["descripcion", "Text", VIS_PUB], ["estado", "String = Activo", VIS_PUB]], []],

    ["CE_Reserva", "EXISTE. reservas (schema.sql:344). Sin filas sembradas", "cinco estados; fecha_atendida es la que distingue", [["id_reserva", "Integer = PK", VIS_PRI], ["id_cliente", "Integer = nullable", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["fecha_reserva", "Date = nullable", VIS_PUB], ["hora_reserva", "Time = nullable", VIS_PUB], ["estado", "String = 20, Solicitada", VIS_PUB], ["id_encargado", "Integer = nullable", VIS_PUB], ["fecha_creacion", "Timestamp = NOW()", VIS_PUB], ["fecha_preparada", "Timestamp = nullable", VIS_PUB], ["fecha_atendida", "Timestamp = nullable", VIS_PUB]], []],

    ["CE_ReservaItem", "EXISTE. reserva_items (schema.sql:357)", "las prendas reservadas, necesarias para saber el valor", [["id_reserva_item", "Integer = PK", VIS_PRI], ["id_reserva", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer = 1", VIS_PUB]], []],

    ["CE_Sucursal", "EXISTE. sucursales. Sin filas sembradas", "las sucursales activas del WHERE, sobre una tabla vacia", [["id_sucursal", "Integer = PK", VIS_PRI], ["nombre", "String = 100", VIS_PUB], ["direccion", "Text", VIS_PUB], ["id_ciudad", "Integer", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["estado", "String = Activa", VIS_PUB]], []],

    ["CE_Usuario", "EXISTE. usuarios (schema.sql:32). Sin filas sembradas", "de aqui sale el correo del encargado, dos saltos despues", [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120 UNIQUE", VIS_PUB], ["estado", "String = Pendiente", VIS_PUB]], []],

    ["CE_UsuarioEmpleado", "EXISTE. usuarios_empleados. Sin filas sembradas", "NO tiene columna email, y su rol es texto libre", [["id_empleado", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE", VIS_PUB], ["sucursal_id", "Integer", VIS_PUB], ["nombre", "String = 120", VIS_PUB], ["telefono", "String = 30", VIS_PUB], ["rol", "String = 60, texto libre", VIS_PUB], ["fecha_baja", "Timestamp = nullable", VIS_PUB]], []],

    ["CE_Cliente", "EXISTE. clientes (schema.sql:87). Sin filas sembradas", "quien tiene la reserva sin atender", [["id_cliente", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE, nullable", VIS_PUB], ["nombre", "String = 150", VIS_PUB]], []],

    ["CE_Rol", "EXISTE. roles (schema.sql:573). 5 filas sembradas", "el permiso de ver alertas, que CU46 si acierta", [["id_rol", "Integer = PK", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB = con el asterisco en Administrador", VIS_PUB], ["estado", "String = Activo", VIS_PUB]], []],

    ["CE_UsuarioRol", "EXISTE. usuarios_roles con PK compuesta", "la consulta del permiso se queda con la primera fila", [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]], []],

    ["CE_BitacoraAuditoria", "EXISTE. bitacora_auditoria (schema.sql:148)", "tiene ip y user_agent, y nunca ha guardado una lectura", [["id_bitacora", "Integer = PK", VIS_PRI], ["id_usuario", "Integer = ON DELETE SET NULL", VIS_PUB], ["accion_sql", "String = 40, nullable", VIS_PUB], ["tabla_afectada", "String = 80", VIS_PUB], ["id_registro", "Integer", VIS_PUB], ["detalle", "Text", VIS_PUB], ["old_data", "JSONB", VIS_PUB], ["new_data", "JSONB", VIS_PUB], ["ip_address", "String = INET", VIS_PUB], ["user_agent", "String = 255", VIS_PUB], ["fecha_hora", "Timestamp = NOW()", VIS_PUB]], []]
];

var ACTORES = [
    ["ACTOR_Sistema", "el proceso programado. Es el que inicia el caso", "setInterval de 60 s"],
    ["ACTOR_Administrador", "Administrador, unico con el asterisco", "ve todas las sucursales"],
    ["ACTOR_Encargado", "Encargado de Sucursal. OJO: da 403", "no tiene consultar_inventario"]
];

var ERRORES = [];
var INFORME = [];

function pad(s, n) { var t = String(s); while (t.length < n) t = t + " "; return t; }

function nota(el, texto) {
    if (el == null) return;
    try {
        var a = String(el.Notes || "");
        if (a.indexOf(texto) < 0) el.Notes = a + SALTO + texto;
        el.Update();
    } catch (e) { }
}

function buscarPaquete(P, N) {
    if (P == null) return null;
    if (String(P.Name) == N) return P;
    for (var i = 0; i < P.Packages.Count; i++) {
        var r = buscarPaquete(P.Packages.GetAt(i), N);
        if (r != null) return r;
    }
    return null;
}

function subPaquete(padre, nombre) {
    for (var i = 0; i < padre.Packages.Count; i++) {
        if (String(padre.Packages.GetAt(i).Name) == nombre) return padre.Packages.AddNew(nombre, "");
    }
    var nuevo = padre.Packages.AddNew(nombre, "");
    nuevo.Update();
    padre.Packages.Refresh();
    return buscarPaquete(padre, nombre);
}

function buscarLocal(paq, nombre) {
    for (var i = 0; i < paq.Elements.Count; i++) {
        var e = paq.Elements.GetAt(i);
        if (String(e.Name) == nombre) return e;
    }
    return null;
}

function objetoEn(diag, el) {
    for (var i = 0; i < diag.DiagramObjects.Count; i++) {
        var c = diag.DiagramObjects.GetAt(i);
        if (c.ElementID == el.ElementID) return c;
    }
    return null;
}

function nombresDe(coleccion) {
    var s = "";
    if (coleccion == null) return s;
    try {
        for (var i = 0; i < coleccion.Count; i++) s = s + "|" + String(coleccion.GetAt(i).Name);
    } catch (e) { }
    return s;
}

function contiene(lista, nombre) { return lista.indexOf("|" + nombre) >= 0; }
function totalDe(lista) { if (lista == "") return 0; return lista.split("|").length - 1; }

function lineasCompartimento(def) {
    var l = [];
    for (var i = 0; i < def[3].length; i++) l.push("- " + def[3][i][0] + " : " + def[3][i][1]);
    if (def[3].length > 0 && def[4].length > 0) l.push("");
    for (var j = 0; j < def[4].length; j++) {
        var p = def[4][j][2];
        var f = "";
        if (p != null) f = p.join(", ");
        l.push("+ " + def[4][j][0] + "(" + f + ") : " + def[4][j][1]);
    }
    if (l.length == 0) l.push("(sin atributos ni operaciones)");
    return l;
}

function agregarAtributo(el, nombre, tipo, vis) {
    var a = null;
    try { a = el.Attributes.AddNew(nombre, tipo); } catch (e) { a = null; }
    if (a == null) return false;
    try { a.Name = nombre; } catch (e) { }
    try { a.Type = tipo; } catch (e) { }
    try { a.SetVisibility(vis); } catch (e) { }
    try { a.Update(); } catch (e) { }
    return true;
}

function agregarOperacion(el, nombre, retorno, parametros, vis) {
    var firma = "";
    if (parametros != null) firma = parametros.join(", ");
    var m = null;
    try { m = el.Methods.AddNew(nombre, retorno, firma, ""); } catch (e) { m = null; }
    if (m == null) return false;
    try { m.Name = nombre; } catch (e) { }
    try { m.SetReturnType(retorno); } catch (e) { }
    try { m.SetParameters(firma); } catch (e) { }
    try { m.SetVisibility(vis); } catch (e) { }
    try { m.SetStereotype(""); } catch (e) { }
    try { m.SetAbstract(false); } catch (e) { }
    try { m.SetStatic(false); } catch (e) { }
    try { m.SetQuery(false); } catch (e) { }
    try { m.SetReadOnly(false); } catch (e) { }
    try { m.Update(); } catch (e) { }
    return true;
}

function colocar(diag, el, izq, arr, ancho, alto) {
    var o = objetoEn(diag, el);
    if (o == null) {
        var tam = "l=" + izq + ";r=" + (izq + ancho) + ";t=" + arr + ";b=" + (arr + alto) + ";";
        try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e) { return null; }
        o.ElementID = el.ElementID;
    }
    try { o.ManuallySized = true; } catch (e) { }
    try { o.Left = izq; } catch (e) { }
    try { o.Top = arr; } catch (e) { }
    try { o.Right = izq + ancho; } catch (e) { }
    try { o.Bottom = arr + alto; } catch (e) { }
    try { o.FontSize = 8; } catch (e) { }
    o.Update();
    return o;
}

function compartimento(diag, paq, nombre, lineas, izq, arr, ancho) {
    var alto = lineas.length * ALTO + 8;
    var el = buscarLocal(paq, nombre);
    if (el == null) {
        try { el = paq.Elements.AddNew(nombre, "Text"); } catch (e) { el = null; }
        if (el == null) {
            try { el = paq.Elements.AddNew(nombre, "Class"); } catch (e) { }
            try { el.Stereotype = ""; } catch (e) { }
        }
    }
    try { el.Text = lineas.join(SALTO); } catch (e) { }
    try { el.Notes = lineas.join(SALTO); } catch (e) { }
    try { el.Update(); } catch (e) { }
    var o = colocar(diag, el, izq, arr, ancho, alto);
    if (o == null) return;
    try { o.BorderStyle = 0; } catch (e) { }
    try { o.BackGroundColor = 16777215; } catch (e) { }
    try { o.FontSize = 7; } catch (e) { }
    try { o.WrapText = true; } catch (e) { }
    try { o.ShowNotes = true; } catch (e) { }
    try { o.Update(); } catch (e) { }
}

function enDiagrama(diag, el) {
    if (diag == null || el == null) return false;
    try {
        for (var i = 0; i < diag.DiagramObjects.Count; i++) {
            if (diag.DiagramObjects.GetAt(i).ElementID == el.ElementID) return true;
        }
    } catch (e) { }
    return false;
}

// El conector se crea en el PAQUETE, no en el diagrama. Como el script borra y
// recrea el diagrama en cada pasada, hay que COLOCARLO a mano con DiagramID:
// si no, EA solo lo dibuja la primera vez y al reejecutar el diagrama sale sin lineas.
function relacion(diag, a, b, etiqueta, tipo, est, rolA, rolB, cA, cB) {
    if (a == null || b == null) return 0;
    var i;
    var previo = null;
    for (i = 0; i < a.Connectors.Count; i++) {
        var c = a.Connectors.GetAt(i);
        if (c.SupplierID == b.ElementID) { previo = c; break; }
    }
    if (previo != null) {
        try { previo.Delete(); } catch (e) { }
    }
    var con = null;
    try { con = a.Connectors.AddNew("", tipo); } catch (e) { con = null; }
    if (con == null) {
        try { con = a.Connectors.AddNew("", "Association"); } catch (e) { con = null; }
    }
    if (con == null) return 0;
    try { con.ClientID = a.ElementID; } catch (e) { }
    try { con.SupplierID = b.ElementID; } catch (e) { }
    try { con.Update(); } catch (e) { }
    try { con.DiagramID = diag.ID; con.Update(); } catch (e) { }
    try { con.Name = etiqueta; } catch (e) { }
    try { con.Stereotype = est; } catch (e) { }
    try { con.SourceRole = rolA; } catch (e) { }
    try { con.DestinationRole = rolB; } catch (e) { }
    try { con.SourceCardinality = cA; } catch (e) { }
    try { con.DestinationCardinality = cB; } catch (e) { }
    try { con.FontSize = 7; } catch (e) { }
    try { con.Update(); } catch (e) { }
    if (enDiagrama(diag, con)) return 1;
    return 0;
}

function main() {
    var cu = buscarPaquete(RAIZ, "Casos de Uso");
    if (cu == null) cu = RAIZ;
    var mod = buscarPaquete(cu, "4. Ventas y Pagos");
    if (mod == null) mod = buscarPaquete(cu, "5. Reportes e Inteligencia");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU46 - Análisis de clases");

    for (var d = paq.Diagrams.Count - 1; d >= 0; d--) {
        try { paq.Diagrams.GetAt(d).Delete(); } catch (e) { }
    }
    try { paq.Diagrams.Refresh(); } catch (e) { }

    var clases = [];
    for (var n = 0; n < DEF.length; n++) {
        var def = DEF[n];
        var c = buscarLocal(paq, def[0]);
        if (c == null) {
            try { c = paq.Elements.AddNew(def[0], "Class"); } catch (e) { c = paq.Elements.AddNew(def[0], "Class"); }
            c.Update();
        }
        try { c.Name = def[0]; } catch (e) { }
        try { c.Stereotype = ""; } catch (e) { }
        nota(c, "Origen: " + def[2] + ".");
        try { c.Update(); } catch (e) { }
        clases[n] = c;
    }

    var actores = [];
    for (var a = 0; a < ACTORES.length; a++) {
        var act = buscarLocal(paq, ACTORES[a][0]);
        if (act == null) {
            try { act = paq.Elements.AddNew(ACTORES[a][0], "Actor"); } catch (e) { act = paq.Elements.AddNew(ACTORES[a][0], "Class"); }
        }
        try { act.Name = ACTORES[a][0]; } catch (e) { }
        try { act.Stereotype = ""; } catch (e) { }
        nota(act, ACTORES[a][1] + " (" + ACTORES[a][2] + ").");
        try { act.Update(); } catch (e) { }
        actores[a] = act;
    }

    try { paq.Elements.Refresh(); } catch (e) { }

    var usaTexto = [];
    var conReal = [];
    var totalAtr = 0;
    var totalOpe = 0;
    var conEnDiagrama = 0;

    for (var n2 = 0; n2 < DEF.length; n2++) {
        var d2 = DEF[n2];
        try { paq.Elements.Refresh(); } catch (e) { }
        var el = buscarLocal(paq, d2[0]);
        if (el == null) { ERRORES.push("clase " + d2[0] + " no encontrada"); continue; }
        var antes = "";
        var antesOpe = "";
        try { antes = nombresDe(el.Attributes); } catch (e) { antes = ""; }
        try { antesOpe = nombresDe(el.Methods); } catch (e) { antesOpe = ""; }
        for (var k = 0; k < d2[3].length; k++) {
            if (contiene(antes, d2[3][k][0])) continue;
            agregarAtributo(el, d2[3][k][0], d2[3][k][1], d2[3][k][2]);
        }
        for (var j = 0; j < d2[4].length; j++) {
            if (contiene(antesOpe, d2[4][j][0])) continue;
            agregarOperacion(el, d2[4][j][0], d2[4][j][1], d2[4][j][2], d2[4][j][3]);
        }
        try { el.Update(); } catch (e) { }
        var fin = "";
        var finOpe = "";
        try { fin = nombresDe(el.Attributes); } catch (e) { fin = ""; }
        try { finOpe = nombresDe(el.Methods); } catch (e) { finOpe = ""; }
        totalAtr = totalAtr + totalDe(fin);
        totalOpe = totalOpe + totalDe(finOpe);
        var bien = totalDe(fin) >= d2[3].length;
        if (totalDe(finOpe) >= d2[4].length) bien = true;
        usaTexto[n2] = !bien;
        if (bien) conReal.push(d2[0]);
        INFORME.push(pad(d2[0], 30) + " atr " + totalDe(fin) + "/" + d2[3].length + "  ope " + totalDe(finOpe) + "/" + d2[4].length + (bien ? "  REAL" : "  TEXTO"));
    }

    var diag = null;
    try { diag = paq.Diagrams.AddNew("CU46 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
    if (diag == null) ERRORES.push("no se pudo crear el diagrama");

    if (diag != null) {
        diag.Update();
        try { paq.Diagrams.Refresh(); } catch (e) { }
        var COLX = [30, 300, 570, 840, 1110, 1380];
        var ANCHO = 250;

        for (var p = 0; p < actores.length; p++) {
            colocar(diag, actores[p], COLX[p], 25, 190, 100);
        }
        for (var k2 = 0; k2 < DEF.length; k2++) {
            var col = k2 % 6;
            var fila = 1 + Math.floor(k2 / 6);
            var x = COLX[col];
            var y = 25 + fila * 320;
            var lineas = lineasCompartimento(DEF[k2]);
            if (usaTexto[k2]) {
                colocar(diag, clases[k2], x, y, ANCHO, 24);
                compartimento(diag, paq, "TXT " + DEF[k2][0], lineas, x, y + 24, ANCHO);
            } else {
                colocar(diag, clases[k2], x, y, ANCHO, lineas.length * ALTO + 34);
            }
        }

        var C = {};
        for (var q = 0; q < DEF.length; q++) { C[DEF[q][0]] = clases[q]; }

        conEnDiagrama += relacion(diag, actores[0], C.SRV_SchedulerService, "despierta cada 60 s", "Association", "", "ciclo", "scheduler", "1", "1");
        conEnDiagrama += relacion(diag, actores[0], C.SRV_DataSource, "ejecuta el proceso", "Association", "", "ciclo", "datos", "1", "1");
        conEnDiagrama += relacion(diag, actores[1], C.IU_AdminMenu, "ve el badge con el asterisco", "Association", "", "administrador", "menu", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[2], C.IU_AdminMenu, "ve el badge con gestionar_inventario", "Association", "", "encargado", "menu", "1", "0..1");

        conEnDiagrama += relacion(diag, C.IU_AdminLayout, C.IU_AdminMenu, "filtra el menu y ya tiene el permiso", "Dependency", "uses", "layout", "menu", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminMenu, C.IU_Badge, "el contador en rojo", "Dependency", "uses", "menu", "badge", "0..*", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminAlertas, C.IU_Badge, "el Badge variant danger que ya pinta", "Dependency", "uses", "alertas", "badge", "0..*", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminLayout, C.CTR_Alertas, "sondea el total, cada 30 s", "Dependency", "uses", "layout", "endpoint", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminLayout, C.CTR_Reservas, "cuenta las reservas pendientes", "Dependency", "uses", "layout", "endpoint", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminAlertas, C.CTR_Alertas, "lista y configura umbrales", "Dependency", "uses", "alertas", "endpoint", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_AdminMenu, C.CE_Rol, "permiso de cada entrada", "Dependency", "uses", "menu", "rol", "0..*", "1");

        conEnDiagrama += relacion(diag, C.CTR_Alertas, C.SRV_AlertasService, "servicio de alertas", "Association", "", "alertas", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_Alertas, C.SRV_JwtAuthGuard, "guard", "Dependency", "uses", "alertas", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_Alertas, C.SRV_UsuarioActual, "usuario", "Dependency", "uses", "alertas", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_Reservas, C.SRV_ReservasService, "servicio de reservas", "Association", "", "reservas", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_Reservas, C.SRV_JwtAuthGuard, "guard", "Dependency", "uses", "reservas", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_Reservas, C.SRV_UsuarioActual, "usuario", "Dependency", "uses", "reservas", "usuario", "1", "1");

        conEnDiagrama += relacion(diag, C.SRV_SchedulerService, C.SRV_AlertasService, "el ciclo que este caso quiere añadir", "Dependency", "uses", "scheduler", "alertas", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_SchedulerService, C.SRV_EmailService, "dispara el aviso, si se puede", "Dependency", "uses", "scheduler", "email", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_AlertasService, C.SRV_DataSource, "la consulta de la linea 206", "Dependency", "uses", "alertas", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_AlertasService, C.CE_InventarioStock, "comparable y minimo", "Dependency", "uses", "alertas", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_AlertasService, C.SRV_BitacoraService, "registra cada cambio de umbral", "Dependency", "uses", "alertas", "bitacora", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_AlertasService, C.CE_Rol, "exigirPermiso, el permiso que el caso acierta", "Dependency", "uses", "alertas", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReservasService, C.SRV_DataSource, "los cinco estados", "Dependency", "uses", "reservas", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReservasService, C.SRV_EmailService, "enviarAvisoReserva, que tambien lanza", "Dependency", "uses", "reservas", "email", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReservasService, C.SRV_BitacoraService, "registra cada transicion", "Dependency", "uses", "reservas", "bitacora", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ReservasService, C.CE_Reserva, "las cinco transiciones", "Composition", "composition", "reservas", "reserva", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_ReservasService, C.CE_ReservaItem, "prendas de la reserva", "Composition", "composition", "reservas", "item de reserva", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_EmailService, C.CE_Usuario, "el correo sale de usuarios, no de empleados", "Dependency", "uses", "email", "usuario", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_AjustesService, C.SRV_DataSource, "resuelve el quiebre por el lado de CU24", "Dependency", "uses", "ajustes", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_AjustesService, C.CE_InventarioStock, "cambia la cantidad disponible", "Dependency", "uses", "ajustes", "stock", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_BitacoraService, C.SRV_DataSource, "graba el evento", "Dependency", "uses", "bitacora", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_BitacoraService, C.CE_BitacoraAuditoria, "la fila, con ip y user agent", "Association", "", "bitacora", "evento", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_BitacoraService, C.CE_Usuario, "autor del evento", "Association", "", "bitacora", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_JwtAuthGuard, C.CE_Usuario, "usuario resuelto", "Association", "", "guard", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_UsuarioActual, C.CE_Usuario, "inyecta el Usuario", "Dependency", "uses", "decorador", "usuario", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_DataSource, C.CE_AlertasStockConfig, "la tercera tabla muerta, en solo lectura", "Dependency", "uses", "datos", "config", "1", "0..1");

        conEnDiagrama += relacion(diag, C.CE_InventarioStock, C.CE_ProductoTallaColor, "stock por prenda", "Association", "", "stock", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_InventarioStock, C.CE_Sucursal, "stock por sucursal, y el indice es por esto", "Association", "", "stock", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_AlertasStockConfig, C.CE_ProductoTallaColor, "config por prenda", "Association", "", "config", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_AlertasStockConfig, C.CE_Categoria, "config por categoria", "Association", "", "config", "categoria", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_AlertasStockConfig, C.CE_Sucursal, "config por sucursal", "Association", "", "config", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Producto, "prenda de un producto", "Association", "", "prenda", "producto", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Talla, "talla de la prenda", "Association", "", "prenda", "talla", "1", "0..1");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Color, "color de la prenda", "Association", "", "prenda", "color", "1", "0..1");
        conEnDiagrama += relacion(diag, C.CE_Producto, C.CE_Categoria, "categoria, que el caso pide en el detalle", "Association", "", "producto", "categoria", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Reserva, C.CE_Sucursal, "sucursal de la reserva", "Association", "", "reserva", "sucursal", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Reserva, C.CE_Usuario, "quien reserva", "Association", "", "reserva", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Reserva, C.CE_Cliente, "cliente de la reserva", "Association", "", "reserva", "cliente", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Reserva, C.CE_Usuario, "encargado que la preparó", "Association", "", "reserva", "encargado", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_ReservaItem, C.CE_Reserva, "reserva del item", "Composition", "composition", "item de reserva", "reserva", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_ReservaItem, C.CE_ProductoTallaColor, "prenda reservada", "Association", "", "item de reserva", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_Rol, "roles del usuario", "Association", "", "usuario", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_UsuarioRol, "asignaciones", "Composition", "composition", "usuario", "asignacion", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_Rol, C.CE_UsuarioRol, "usuarios del rol", "Association", "", "rol", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_UsuarioEmpleado, "la ficha de empleado", "Association", "", "usuario", "empleado", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_UsuarioEmpleado, C.CE_Sucursal, "el encargado que hay que avisar", "Association", "", "empleado", "sucursal", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_BitacoraAuditoria, C.CE_Usuario, "quien leyo", "Association", "", "evento", "usuario", "0..1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("3 actores, " + DEF.length + " clases y " + TOTAL_REL + " relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (4), CTR_ controlador (2), SRV_ servicio (9), CE_ entidad (" + (DEF.length - 15) + ").");
        N.push("");
        N.push("HALLAZGO CRITICO 1: LA MITAD IZQUIERDA DEL CASO YA ESTA HECHA Y FUNCIONA. LA");
        N.push("MITAD DERECHA NO TIENE NI TRANSPORTE.");
        N.push("");
        N.push("No existe AlertasCriticasService, ni la ruta admin/alertas/criticas, ni la pagina,");
        N.push("ni el item de menu. La unica ruta de alertas es admin/inventario/alertas, la de");
        N.push("CU25. Pero el esqueleto completo de este caso ya esta escrito, y es lo notable:");
        N.push("");
        N.push("  el ciclo de 60 s   respaldos/SchedulerService.ts:12, setInterval de 60_000, con");
        N.push("                     OnModuleInit y OnModuleDestroy. Es exactamente el patron");
        N.push("                     que el caso dice reutilizar, y lleva un solo mensaje de log:");
        N.push("                     SchedulerService iniciado, revision de respaldos cada minuto");
        N.push("  el badge          components/ui/Badge.tsx, seis variantes, doce usos. El rojo ya");
        N.push("                     esta, y AdminAlertas.tsx:424 ya lo pinta con el");
        N.push("                     disponible sobre el minimo al lado");
        N.push("  el permiso        AdminLayout.tsx:69 tokenPuedeAlertas acepta asterisco o");
        N.push("                     gestionar_inventario, que es lo que el caso pide en E1");
        N.push("  el sondeo         AdminLayout.tsx:62, setInterval de 30_000 con clearInterval");
        N.push("                     en la 65. El badge de reservas ya se refresca solo");
        N.push("  la pantalla       pages/admin/AdminAlertas.tsx, con opciones, listado,");
        N.push("                     configuracion de umbrales, Skeleton y Badge");
        N.push("");
        N.push("O sea que el caso acierta en el permiso, que es la novena vez que acierta un");
        N.push("permiso y la primera que acierta uno que existe de verdad. Y describe con exactitud");
        N.push("un patron que ya esta en el proyecto. Lo que no existe es el envio de correo, y eso");
        N.push("es media especificacion.");
        N.push("");
        N.push("HALLAZGO 2: EL CORREO NO SE PUEDE ENVIAR. Y SI SE ACTIVA EL interruptOR, ROMPE.");
        N.push("");
        N.push("El caso dice SMTP configurado, con E3 para cuando no lo este. El problema es que");
        N.push("no hay SMTP, ni como variable, ni como libreria. Lo que hay es esto:");
        N.push("");
        N.push("  seguridad/SRV_EmailService.ts, 103 lineas");
        N.push("  L100  private _enviarViaSmtp(_email, _asunto?, _cuerpo?): void {");
        N.push("  L101    throw new Error('SMTP aun no configurado en el prototipo.');");
        N.push("");
        N.push("Es la sexta vez que aparece este patron en el proyecto, y la mas explicita de");
        N.push("todas, porque el codigo lo dice con esas palabras. Las otras cinco son mas");
        N.push("sutiles: el token S3 de CU35, el ternario de CU38, la IA_EXTERNAL_URL que no esta");
        N.push("en el .env de CU41, el STORAGE_BACKEND leido con dos ramas iguales en CU43,");
        N.push("y esto. La sexta lo dice con esas palabras en el propio codigo.");
        N.push("Y hay tres detalles mas que lo hacen peor que una simple falta de transporte:");
        N.push("");
        N.push("  1. api/package.json tiene 17 dependencias y NINGUNA de correo. No hay nodemailer,");
        N.push("     ni sendgrid, ni ses. No hay nada que instalar, hay que escribirlo.");
        N.push("  2. El .env y el .env.example tienen tres variables, EMAIL_ENABLED, EMAIL_FROM y");
        N.push("     EMAIL_BASE_URL. Ni una sola SMTP_HOST, SMTP_PORT, SMTP_USER ni SMTP_PASS.");
        N.push("     O sea que el caso habla de una configuracion que no tiene ni nombre.");
        N.push("  3. EmailService esta exportado por seguridad.module.ts:64 y lo usan CINCO");
        N.push("     modulos de verdad: ClienteService:68 en el registro, ReservasService:261 al");
        N.push("     crear una reserva, AuthService:249 al recuperar contrasena, EmpleadosService:177");
        N.push("     en la primera contrasena, y el propio modulo de seguridad.");
        N.push("");
        N.push("El punto 3 es el grave, y es el mismo fallo que el de CU45 con porcentaje_iva pero");
        N.push("repetido cuatro veces. Los metodos de EmailService devuelven true en casi todas");
        N.push("sus ramas, y con EMAIL_ENABLED en falso devuelven false sin lanzar, con lo cual");
        N.push("nadie se entera de que no se envio nada. Pero con EMAIL_ENABLED en verdadero");
        N.push("llaman a _enviarViaSmtp, que lanza. O sea que:");
        N.push("");
        N.push("  EMAIL_ENABLED en falso   el correo no se envia y nadie se entera");
        N.push("  EMAIL_ENABLED en cierto  crear una reserva LANZA, y con ella el registro de");
        N.push("                          cliente, la recuperacion de contrasena y el alta de");
        N.push("                          empleado, segun como este envuelto cada llamada");
        N.push("");
        N.push("Es el mismo patron de fallo de siempre: la infraestructura de mentira no rompe");
        N.push("nada mientras nadie la enciende, y rompe en el punto de venta en cuanto se");
        N.push("enciende. Conviene decir que el caso de CU46 es el primero en el que esto se");
        N.push("puede pisar, porque es el primero cuyas tres cosas de la especificacion pasan");
        N.push("por ahi.");
        N.push("");
        N.push("HALLAZGO 3: E3 Y E5 NOMBRAN UN FICHERO DE LOG QUE NO EXISTE.");
        N.push("");
        N.push("Las dos excepciones del caso dicen que el error se registra en api-server.err.log.");
        N.push("Se comprobo:");
        N.push("");
        N.push("  ficheros .log o .err en todo el workspace = 0");
        N.push("  archivos que escriban en un log = 0");
        N.push("  api/package.json  scripts.start = nest start, sin redireccion");
        N.push("");
        N.push("El unico registro que hay es el Logger de NestJS, que escribe en la salida");
        N.push("estandar, que con nest start a secas es la terminal, y se pierde en cuanto el");
        N.push("buffer de la consola se llena. O sea que el caso diseña dos excepciones");
        N.push("alrededor de un canal de observabilidad que el proyecto no tiene. El unico sitio");
        N.push("donde hoy queda constancia de un fallo es api-server.err.log, y ese fichero no");
        N.push("esta. Conviene que el caso decida donde se escribe, porque si no el fallo del");
        N.push("ciclo se pierde y E5, que dice reintentar en el siguiente ciclo, se convierte en");
        N.push("reintentar a ciegas.");
        N.push("");
        N.push("HALLAZGO 4: LA TERCERA TABLA MUERTA, Y ESTA TIENE LAS COLUMNAS JUSTAS.");
        N.push("");
        N.push("alertas_stock_config, schema.sql:331, es la tabla que el caso necesita para el");
        N.push("paso c, y esta definida con exactamente las tres columnas que el caso nombra:");
        N.push("");
        N.push("  L336  stock_minimo         INTEGER");
        N.push("  L337  notificar_email     BOOLEAN DEFAULT false");
        N.push("  L338  ultima_notificacion TIMESTAMP");
        N.push("");
        N.push("Y no la toca nadie. En todo el backend:");
        N.push("");
        N.push("  INSERT INTO alertas_stock_config = 0");
        N.push("  UPDATE alertas_stock_config   = 0");
        N.push("  lecturas desde TypeScript     = 0");
        N.push("");
        N.push("Cero. Ni una lectura. O sea que notificar_email y ultima_notificacion tienen CERO");
        N.push("apariciones en el codigo del proyecto, y el cooldown de 24 h del paso c no tiene");
        N.push("de donde leerse. Es la tercera tabla muerta, detras de las dos de CU25, y la");
        N.push("peor de las tres, porque las de CU25 al menos tienen la pantalla que las");
        N.push("muestra. Esta no la muestra nadie y el caso la necesita para decidir si envia.");
        N.push("");
        N.push("Y hay un remate de coherencia interna: la tabla se llama alertas_stock_config y");
        N.push("tiene stock_minimo, o sea que el proyecto ya decidio que el umbral de alerta se");
        N.push("configura por config. Pero CU25, que es la pantalla que existe, lo=configura");
        N.push("sobre inventario_stock.stock_minimo_alert, y no sobre esta tabla. Hay dos sitio");
        N.push("para el umbral y el codigo usa el que no es el de config. CU46 hereda el mismo");
        N.push("desajuste y ademas anade el tercero, porque el caso tambien usa");
        N.push("inventario_stock.stock_minimo_alert.");
        N.push("");
        N.push("HALLAZGO 5: LA MITAD DE 'STOCK BAJO' ES INALCANZABLE. EL UMBRAL POR DEFECTO");
        N.push("ES CERO Y NADA LO SUBE.");
        N.push("");
        N.push("Este es el hallazgo que mas duele, porque hace que la mitad de la especificacion");
        N.push("no pueda ocurrir. La columna es:");
        N.push("");
        N.push("  schema.sql:309  stock_minimo_alert INTEGER DEFAULT 0");
        N.push("");
        N.push("Y las filas las crea un trigger, que solo nombra tres columnas:");
        N.push("");
        N.push("  schema.sql:645  INSERT INTO inventario_stock (id_ptc, id_sucursal, cantidad_disponible)");
        N.push("  schema.sql:646  VALUES (NEW.id_ptc, NEW.id_sucursal, NEW.cantidad)");
        N.push("");
        N.push("O sea que toda fila que el sistema crea por si sola tiene el umbral en CERO. Y el");
        N.push("caso clasifica:");
        N.push("");
        N.push("  Sin stock     si cantidad_disponible = 0");
        N.push("  Stock bajo    si cantidad_disponible > 0");
        N.push("");
        N.push("Con el umbral en cero, Stock bajo pide cantidad_disponible > 0 Y cantidad_disponible");
        N.push("menor o igual que CERO, que es una contradiccion. La clase Stock bajo no puede");
        N.push("existir. Solo puede aparecer Sin stock, y solo cuando una prenda se agota del todo.");
        N.push("");
        N.push("Quien puede poner el umbral en algo mayor que cero? Un solo sitio del proyecto:");
        N.push("");
        N.push("  SRV_AlertasService.ts:271  UPDATE inventario_stock SET stock_minimo_alert = $1");
        N.push("");
        N.push("que es el metodo configurar de CU25, y es una accion manual, fila por fila, con");
        N.push("un bucle, un UPDATE y una entrada de bitacora por cada renglon. Y ademas exige");
        N.push("que la fila ya exista, porque en la 265 lanza NotFoundException si no la");
        N.push("encuentra. O sea que el orden obligatorio es: primero entra mercaderia, que crea");
        N.push("la fila con umbral cero, y despues un humano abre la pantalla de CU25 y teclea");
        N.push("un minimo para esa prenda en esa sucursal. Hasta que eso pase, esa fila no puede");
        N.push("generar jamas una alerta de stock bajo.");
        N.push("");
        N.push("Y el caso no dice nada de ese paso. Su precondicion lista las tablas que existen");
        N.push("y dice que hay al menos una sucursal activa con datos, y no menciona que el umbral");
        N.push("hay que configurarlo a mano en otra pantalla. Para que las alertas de stock bajo");
        N.push("existan hace falta un trabajo previo de carga de umbrales, y ese trabajo no esta");
        N.push("en ningun caso del proyecto.");
        N.push("");
        N.push("Y hay un detalle mas fino: CU46 se salta la guarda que si tiene CU25.");
        N.push("");
        N.push("  SRV_AlertasService.ts:206  WHERE s.stock_minimo_alert > 0");
        N.push("  SRV_AlertasService.ts:207    AND s.cantidad_disponible <= s.stock_minimo_alert");
        N.push("");
        N.push("CU25 exige que el umbral sea mayor que cero, ademas de la comparacion. CU46 solo");
        N.push("pone la comparacion. Con el umbral en cero, CU25 no lista la fila y CU46 si. O");
        N.push("sea que las dos pantallas darian numeros distintos para el mismo almacen, y la");
        N.push("razon es precisamente el cero que CU25 filtra y CU46 no.");
        N.push("");
        N.push("HALLAZGO 6: EL CASO CUENTA COMO CRITICA LA RESERVA QUE SIGNIFICA QUE TODO IDO BIEN.");
        N.push("");
        N.push("El filtro de reservas del caso es estado IN (Solicitada, Preparada). El");
        N.push("vocabulario real tiene cinco estados, con estas transiciones:");
        N.push("");
        N.push("  crear     L1073  INSERT INTO reservas");
        N.push("  preparar  L751   SET estado = 'Preparada', id_encargado = $2, fecha_preparada = NOW()");
        N.push("  atender   L805   SET estado = 'En tienda', fecha_atendida = NOW()");
        N.push("  cumplir   L860   SET estado = 'Cumplida'");
        N.push("  cancelar  L965   SET estado = 'Cancelada'");
        N.push("");
        N.push("Y el mensaje que devuelve la linea 769 es:");
        N.push("");
        N.push("  Prendas preparadas. Esperando la llegada del cliente al vestidor.");
        N.push("");
        N.push("O sea que Preparada significa que el trabajo de la tienda esta HECHO y el cliente");
        N.push("todavia no ha llegado. Es el estado de exito, no el de abandono. Contarlo como");
        N.push("alerta critica por no atendido es una confusion de categorias: la tienda no");
        N.push("puede hacer nada mas con esa reserva hasta que llegue el cliente.");
        N.push("");
        N.push("Y de aqui sale el error mas grave del caso, que es su propia postcondicion:");
        N.push("");
        N.push("  una reserva sin atender deja de contar cuando se prepara/atiende (CU31)");
        N.push("");
        N.push("Es al reves. Preparada esta DENTRO del filtro, o sea que preparar una reserva no");
        N.push("quita su alerta: la mantiene. Lo que la quita es En tienda, que es atender, o");
        N.push("sea Cumplida o Cancelada. El caso ofrece dos ways de limpiar la alerta y solo");
        N.push("una funciona. Y el efecto es el contrario del que quiere: un encargado que llega");
        N.push("antes de tiempo y prepara las prendas, que es exactamente lo que hay que hacer,");
        N.push("no ve su contador bajar, lo ve subir o igual, y la conclusion que saca es que");
        N.push("preparar empeora el aviso. Es el clasico falso positivo que entrena al usuario");
        N.push("a ignorar el badge.");
        N.push("");
        N.push("Y hay un dato que resuelve el caso y esta a la vista: la columna fecha_atendida.");
        N.push("La 751, que prepara, escribe fecha_preparada y NO fecha_atendida. La 805, que");
        N.push("atiende, escribe fecha_atendida. O sea que la base ya sabe distinguir preparada de");
        N.push("atendida, y el caso no lo usa. Con fecha_atendida nula y estado Preparada, esa");
        N.push("reserva lleva mas de X horas esperando a un cliente que no ha llegado, y eso si");
        N.push("es un dato que a un encargado le sirve. Faltaria un umbral, pero el dato esta.");
        N.push("");
        N.push("HALLAZGO 7: EL WHERE DE RESERVAS, TAL COMO ESTA ESCRITO, CUENTA DE MAS.");
        N.push("");
        N.push("El caso escribe:");
        N.push("");
        N.push("  WHERE estado IN ('Solicitada','Preparada')");
        N.push("    AND fecha_creacion <= NOW() - INTERVAL '120 minutes'");
        N.push("    OR fecha_reserva <= hoy");
        N.push("");
        N.push("En SQL el AND Liga antes que el OR, asi que eso no es lo que parece. Se parsea");
        N.push("como:");
        N.push("");
        N.push("  (estado IN (...) AND fecha_creacion <= ahora menos 120 minutos)");
        N.push("  OR (fecha_reserva <= hoy)");
        N.push("");
        N.push("El lado derecho del OR no tiene filtro de estado. O sea que una reserva Cumplida o");
        N.push("Cancelada de la semana pasada, con fecha_reserva en el pasado, cumple la segunda");
        N.push("rama y sale en la lista de reservas sin atender. Se contarian reservas ya");
        N.push("resueltas, que es justo lo contrario de lo que el caso promete en su postcondicion.");
        N.push("");
        N.push("Los parentesis que trae el caso insinuan que la intencion era agrupar el OR");
        N.push("dentro del filtro de estado, y eso es lo que habria que escribir. Es un detalle");
        N.push("de un parentesis, pero cambia el numero que sale, y este numero va en un badge");
        N.push("rojo que un encargado toma como verdad.");
        N.push("");
        N.push("Y la segunda rama hace otra cosa distinta de la que dice el caso. El caso habla");
        N.push("de reservas vencidas o sin atender, y son dos relojes diferentes:");
        N.push("");
        N.push("  fecha_creacion  cuando se metio el registro. Una reserva creada hace tres dias");
        N.push("                  para la semana que viene la cumple");
        N.push("  fecha_reserva    el dia de la cita. Ahi si que cabe hablar de vencida");
        N.push("");
        N.push("O sea que la regla de las 120 minutos no mide retraso, mide antiguedad del");
        N.push("registro. Y con ella, toda reserva de mas de dos horas entra en el contador, sea");
        N.push("para manana, sea para el mes que viene. El caso dice ordenadas por antiguedad, y");
        N.push("eso confirma que el reloj que quiere usar es el de la creacion.");
        N.push("");
        N.push("HALLAZGO 8: REGISTRAR LA LECTURA EN BITACORA SERIA LA PRIMERA DE SU HISTORIA,");
        N.push("Y A 60 SEGUNDOS LLENARIA EL REGISTRO DE RUIDO.");
        N.push("");
        N.push("El paso e pide registrar en bitacora_auditoria accion_sql SELECT con la IP y el");
        N.push("user agent. Y se puede hacer, porque la bitacora NO tiene trigger: los dos");
        N.push("unicos triggers del proyecto son trg_bloquear_usuario_5_intentos, de la 620, y");
        N.push("trg_movimiento_inventario, de la 654. La bitacora se llena con INSERT explicitos");
        N.push("desde SRV_BitacoraService, y la tabla tiene las columnas necesarias:");
        N.push("");
        N.push("  schema.sql:157  ip_address   INET");
        N.push("  schema.sql:158  user_agent   VARCHAR(255)");
        N.push("");
        N.push("Eso si es la buena noticia del caso: es factible y sin trigger. La mala es que:");
        N.push("");
        N.push("  los valores de accion_sql que de verdad se registran son BACKUP, DELETE,");
        N.push("  INSERT, LOGIN, LOGOUT, NOTIFICAR y UPDATE. CERO SELECT. En todo el proyecto.");
        N.push("");
        N.push("O sea que CU46 seria el primer modulo que mete una lectura en una bitacora de");
        N.push("auditoria, que por definicion registra cambios y no consultas. Y con el badge");
        N.push("sondeando cada 60 segundos, son 1440 filas al dia por usuario de puro SELECT con");
        N.push("la misma IP y el mismo user agent, indefinidamente. La bitacora tiene");
        N.push("idx_bitacora_fecha y fecha_hora, pero no tiene politica de retencion, ni purge, ni");
        N.push("particionado. Lo que el caso va a crear es un historico de consultas que nadie");
        N.push("va a leer y que va a competir con los INSERT que si importan.");
        N.push("");
        N.push("Y hay una contradiccion con la postcondicion, que dice que la consulta queda");
        N.push("trazada. Trazada para que? El caso no dice que nadie vaya a mirar esa traza. Si");
        N.push("lo que se quiere es saber a quien se le mostro una alerta critica, eso ya se");
        N.push("sabe por el permiso y por la sucursal, y no por un SELECT guardado. Vale la pena");
        N.push("dejarlo dicho, porque trazar la lectura y no la resolucion tiene el efecto");
        N.push("inverso: se registra que alguien miro y no que alguien resolvio.");
        N.push("");
        N.push("HALLAZGO 9: EL CORREO AL ENCARGADO EXIGE DOS SALTOS Y NO HAY INDICE.");
        N.push("");
        N.push("El caso dice enviar el correo al encargado de la sucursal. El problema es que la");
        N.push("tabla de empleados no tiene correo:");
        N.push("");
        N.push("  usuarios_empleados: id_empleado, usuario_id, sucursal_id, nombre, telefono,");
        N.push("                      rol, fecha_baja, motivo_baja");
        N.push("");
        N.push("telefono, y nada mas. El correo esta en usuarios.email, o sea que hay que saltar");
        N.push("usuarios_empleados -> usuarios, y el indice unico de usuarios_empleados es");
        N.push("usuario_id, que es UNIQUE. No hay indice por sucursal_id, que es la columna por la");
        N.push("que se busca al encargado de una sucursal concreta. Con un empleado por tienda el");
        N.push("coste es nulo; con veinte, es un recorrido de la tabla entera por cada alerta, y");
        N.push("como el caso avisa por cada una de las que configuran notificar_email, otra vez.");
        N.push("");
        N.push("Y hay un detalle de vocabulario: usuarios_empleados.rol es un VARCHAR(60) de");
        N.push("texto libre, no una clave foranea a roles. O sea que quien es el encargado se");
        N.push("decide por un texto, en una columna sin indice y sin integridad. El caso, en");
        N.push("cambio, razona por permisos, que es el camino correcto del proyecto. O sea que");
        N.push("hay dos maneras de saber quien es el encargado de una sucursal, y el caso usa");
        N.push("la que el proyecto no usa. Novena vez que el vocabulario de permisos y el de");
        N.push("empleados no encajan.");
        N.push("");
        N.push("HALLAZGO 10: EL CICLO DE 60 S NO TIENE INDICE Y HAY UN TIMER DE 30 S.");
        N.push("");
        N.push("El WHERE de quiebres es cantidad_disponible menor o igual que stock_minimo_alert");
        N.push("sobre inventario_stock. El unico indice de esa tabla es:");
        N.push("");
        N.push("  schema.sql:563  idx_inventario_sucursal ON inventario_stock (id_sucursal)");
        N.push("");
        N.push("Que es por sucursal, y el WHERE del caso no restringe por sucursal: usa un IN");
        N.push("sobre las activas, o sea que restringe por un conjunto. Un IN sobre un indice");
        N.push("por la misma columna se puede usar, pero aqui la columna que se busca es otra,");
        N.push("cantidad_disponible contra stock_minimo_alert, y ninguna de las dos tiene");
        N.push("indice. O sea que el ciclo hace un recorrido completo de inventario_stock cada");
        N.push("minuto, y por encima con un JOIN de cinco tablas para traer el detalle.");
        N.push("");
        N.push("Con la tabla vacia no se nota, y con la tabla llena son 1440 recorridos al dia.");
        N.push("Un indice sobre (cantidad_disponible) seria lo minimo, y conviene que el caso lo");
        N.push("diga, porque un WHERE de este tipo sin indice es un fallo que se descubre cuando");
        N.push("ya hay datos, que es cuando ya no se puede cambiar sola la consulta.");
        N.push("");
        N.push("Y hay un segundo temporizador. El caso pide 60 s. El que ya existe sondea cada");
        N.push("30 s, y bien hecho, con clearInterval en la linea 65 y el patron activo para");
        N.push("evitar el setState sobre el componente desmontado. Si el caso anade su propio");
        N.push("setInterval, el panel tendria dos relojes: uno a 30 y otro a 60, con lo que el");
        N.push("badge de alertas criticas se actualizaria una vez cada dos iteraciones del otro.");
        N.push("Lo mas limpio es colgarlo del intervalo que ya existe, que ademas ya sabe");
        N.push("cuanto se limpia. Y de paso, si el caso va a inventar su propio temporizador,");
        N.push("que siga el patron del que ya hay, que es el unico del proyecto y esta bien");
        N.push("hecho, con su OnModuleInit, su OnModuleDestroy y su clearInterval.");
        N.push("HALLAZGO 11: LO QUE EL CASO HACE BIEN, Y ES DE LO POCO QUE HAY.");
        N.push("");
        N.push("  - El permiso es el unico de todo el lote que acierta. El caso dice asterisco o");
        N.push("    gestionar_inventario, y el Encargado de la semilla lo tiene. No es la primera");
        N.push("    vez que un caso acierta un permiso, pero si la primera que acierta uno que");
        N.push("    existe en roles.permisos_json de verdad.");
        N.push("  - El badge reutiliza un componente que ya existe, con su variante danger, en vez");
        N.push("    de inventar un contador. Y el AdminLayout ya tiene el hueco: el contador de");
        N.push("    reservas pendientes que ya se refresca cada 30 s.");
        N.push("  - El ciclo se apoya en un patron existente y real, el del SchedulerService, con su");
        N.push("    OnModuleInit y su OnModuleDestroy. Es la manera correcta de hacer un temporizador");
        N.push("    en Nest, y el proyecto la tiene escrita.");
        N.push("  - Autorresolver las alertas es la idea correcta del caso: no hay lista de tareas");
        N.push("    que alguien pueda descartar, la alerta desaparece cuando la causa desaparece.");
        N.push("    Es mejor que un semaforo que alguien pone en verde a mano.");
        N.push("  - E4, responder con ceros y mostrar Sin alertas criticas. Todo en orden, es una");
        N.push("    de las pocas cadenas de texto del caso, y tiene una funcion: distingue el");
        N.push("    estado vacio de la pantalla rota, que es la confusion clasica de un panel.");
        N.push("  - E5, reintentar en el siguiente ciclo sin perder la operatividad. Con un ciclo");
        N.push("    de 60 s, reintentar es gratis y no hace falta ni cola ni reintento manual.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - El caso dice que el badge equivale al esquema de badges de CU25 y CU27. Y es");
        N.push("    cierto: hay un unico componente Badge, con seis variantes, usado en doce");
        N.push("    sitios, entre ellos AdminAlertas:424 y AdminReservas:336. Lo unico que habria");
        N.push("    que decidir es si el total critico se suma al de reservas en el mismo contador o");
        N.push("    va en uno propio, porque si se suman, preparar una reserva que sube el");
        N.push("    contador de criticas va a parecer que el de reservas baja.");
        N.push("  - El WHERE de quiebres trae id_sucursal IN (activas), y sucursales esta vacia,");
        N.push("    con lo que el IN es un conjunto vacio y el resultado es cero filas siempre. Es");
        N.push("    el mismo problema de la base vacia de CU44 y CU45, aqui en la forma mas");
        N.push("    silenciosa: no hay ninguna tabla de negocio con filas, de modo que las dos");
        N.push("    consultas del ciclo devuelven vacio y el badge saldria en cero siempre.");
        N.push("  - El caso no dice que hacer cuando el mismo producto esta sin stock en tres");
        N.push("    sucursales. El badge contaria tres, que es lo razonable, pero la pantalla");
        N.push("    deberia agrupar por producto y decir en quantas tiendas, o el encargado ve");
        N.push("    tres lineas iguales y piensa que son tres errores.");
        N.push("  - El texto de E1 dice que el acceso por URL directa muestra Acceso denegado, y");
        N.push("    ya se sabe desde CU44 que el AdminLayout filtra el menu pero no la ruta: lo que");
        N.push("    aparece es En construccion. Es la novena vez que un caso dice eso.");
        N.push("  - E6, conservar el ultimo badge si falla la red, es lo que ya hace AdminLayout con");
        N.push("    el contador de reservas, que en su catch pone null. O sea que hay un")
        N.push("    precedente exacto, y ademas la distincion entre conservar y null ya esta");
        N.push("    hecha: null es lo que dice que se perdio la conexion.");
        N.push("  - La resolucion automatica que promete el caso son tres casos, CU22 recepcion,");
        N.push("    CU24 ajuste y CU39 devolucion. De los tres, solo CU24 toca la");
        N.push("    cantidad_disponible que el WHERE mira. Y en CU24, un ajuste que sube la");
        N.push("    cantidad por encima del umbral efectivamente limpia la alerta, pero solo si");
        N.push("    el umbral es mayor que cero, que es el hallazgo 5. O sea que la resolucion");
        N.push("    automatica solo esta probada para el Sin stock, y solo si alguien configs el");
        N.push("    minimo antes.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU46 - Emitir Alertas Criticas - INFORME");
    T.push("");
    T.push("Atributos reales: " + totalAtr + " de " + TOTAL_ATR);
    T.push("Operaciones reales: " + totalOpe + " de " + TOTAL_OPE);
    T.push("CONECTORES DIBUJADOS: " + conEnDiagrama + " de " + TOTAL_REL);
    if (conEnDiagrama < TOTAL_REL) T.push("  FALTAN LINEAS. Reejecuta el script: es idempotente y las coloca.");
    T.push("Clases completas: " + conReal.length + " -> " + conReal.join(", "));
    for (var l = 0; l < INFORME.length; l++) T.push(INFORME[l]);
    T.push("");
    if (ERRORES.length == 0) T.push("Sin errores.");
    if (ERRORES.length > 0) {
        T.push("ERRORES: " + ERRORES.length);
        for (var e2 = 0; e2 < ERRORES.length; e2++) T.push("  - " + ERRORES[e2]);
    }
    try { paq.Notes = T.join(SALTO); paq.Update(); } catch (e) { }
    try { paq.Elements.Refresh(); } catch (e) { }
    try { paq.Diagrams.Refresh(); } catch (e) { }

    var msg = "";
    msg = msg + "CU46 - Emitir alertas criticas" + SALTO + SALTO;
    msg = msg + "La izquierda del caso ya existe: el ciclo de 60 s," + SALTO;
    msg = msg + "el Badge, el permiso y el sondeo. La derecha no:" + SALTO;
    msg = msg + "EmailService._enviarViaSmtp lanza y no hay SMTP." + SALTO;
    msg = msg + "api-server.err.log no existe. Cero logs." + SALTO + SALTO;
    msg = msg + "stock_minimo_alert sale en 0 y nada lo sube, asi" + SALTO;
    msg = msg + "que 'Stock bajo' no puede existir. Solo 'Sin stock'." + SALTO;
    msg = msg + "Y Preparada significa que todo fue bien: contarla" + SALTO;
    msg = msg + "como critica, y preparar una reserva NO quita su alerta." + SALTO;
    msg = msg + "El WHERE de reservas, con AND y OR sin parentes," + SALTO;
    msg = msg + "cuenta reservas ya resueltas." + SALTO + SALTO;
    msg = msg + "Clases: " + DEF.length + "    Actores: 3    Relaciones: " + TOTAL_REL + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de " + TOTAL_ATR + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de " + TOTAL_OPE + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de " + TOTAL_REL + SALTO;
    if (conEnDiagrama < TOTAL_REL) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU46 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU46 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU46", 0); } catch (e3) { }
}
