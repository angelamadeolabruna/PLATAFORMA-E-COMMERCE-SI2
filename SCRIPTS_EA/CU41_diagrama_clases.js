// ================================================================
// CU41 - RECOMENDAR PRENDAS CON IA
// DIAGRAMA DE ANALISIS DE CLASES
//
// Verificado contra el codigo real:
//   api/src/modulos/recomendaciones/CTR_Recomendaciones.ts:6   @Controller('recomendaciones')
//   api/src/modulos/recomendaciones/CTR_Recomendaciones.ts:11  JwtOpcionalAuthGuard
//   api/src/modulos/recomendaciones/SRV_RecomendacionesService.ts:66  consulta consultar_catalogo
//   api/src/modulos/recomendaciones/SRV_RecomendacionesService.ts:88  temporada activa, fallback identico
//   api/src/modulos/recomendaciones/SRV_RecomendacionesService.ts:133 historial SIN filtro de estado
//   api/src/modulos/recomendaciones/SRV_RecomendacionesService.ts:184 lee p.porcentaje_iva: NO existe
//   api/src/modulos/recomendaciones/SRV_RecomendacionesService.ts:197Exists sin filtro de sucursal
//   api/src/modulos/recomendaciones/SRV_RecomendacionesService.ts:222 populares, misma temporada
//   api/src/modulos/recomendaciones/SRV_RecomendacionesService.ts:261  anónimo devuelve populares
//   api/src/modulos/recomendaciones/SRV_RecomendacionesService.ts:299  mezcla IA e interno
//   api/src/modulos/recomendaciones/SRV_ScoringService.ts:29   IA_EXTERNAL_URL con fallback vacio
//   api/src/modulos/recomendaciones/SRV_ScoringService.ts:138  si no hay URL, no llama
//   api/src/modulos/recomendaciones/SRV_ScoringService.ts:141  AbortSignal 4 segundos
//   api/src/modulos/recomendaciones/SRV_ScoringService.ts:42   maxDe normaliza por el maximo
//   api/src/modulos/recomendaciones/SRV_PreferenciasService.ts:40  upsert por SELECT y luego INSERT
//   api/src/modulos/recomendaciones/RecomendacionesModule.ts:17  exporta PreferenciasService
//   api/.env                        NO tiene IA_EXTERNAL_URL
//   web/src/pages/cliente/Recomendaciones.tsx:143  el badge muestra el score con porcentaje
//   web/src/pages/cliente/Recomendaciones.tsx:160  un unico enlace, fijo, al vestidor
//   web/src/lib/api.ts:2080        ItemRecomendacion sin stock ni sucursal
//   web/src/router.tsx:97          /recomendaciones bajo ClienteLayout
//   schema.sql:501  preferencias_cliente sin ningun indice
//   schema.sql:186  temporadas.estado por defecto Programada
//   schema.sql:223  productos SIN porcentaje_iva
//   schema.sql:573  consultar_catalogo NO esta en ningun rol
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
var TOTAL_REL = 96;
var TOTAL_ATR = 128;
var TOTAL_OPE = 37;

var DEF = [
    ["IU_Recomendaciones", "EXISTE. web/src/pages/cliente/Recomendaciones.tsx, 182 lineas", "muestra el score como porcentaje y un solo enlace fijo",
     [["items", "Array", VIS_PUB], ["fuente", "String", VIS_PUB], ["cargando", "Boolean", VIS_PUB], ["error", "String = null", VIS_PUB]],
     [["cargar", "void", [], VIS_PUB], ["badgeScore", "String", ["score"], VIS_PUB], ["hexDeColor", "String", ["color", "codigoHex"], VIS_PUB], ["formatearPrecio", "String", ["precio"], VIS_PUB], ["render", "JSX.Element", [], VIS_PUB]]],

    ["IU_Api", "EXISTE. web/src/lib/api.ts:2042", "un solo metodo: obtenerRecomendaciones",
     [["baseUrl", "String = /api/v1", VIS_PRI]],
     [["obtenerRecomendaciones", "RespuestaRecomendaciones", [], VIS_PUB], ["solicitar", "Response", ["url", "init", "opciones"], VIS_PUB]]],

    ["IU_ClienteLayout", "EXISTE. web/src/router.tsx:97", "envuelve la pantalla de recomendaciones",
     [["usuario", "Object", VIS_PUB]],
     [["render", "JSX.Element", [], VIS_PUB]]],

    ["CTR_RecomendacionesController", "EXISTE. recomendaciones/CTR_Recomendaciones.ts, 15 lineas", "guard OPCIONAL: el invitado entra y recibe las populares",
     [["recomendacionesService", "RecomendacionesService", VIS_PRI]],
     [["recomendar", "Object", ["credenciales"], VIS_PUB]]],

    ["SRV_RecomendacionesService", "EXISTE. recomendaciones/SRV_RecomendacionesService.ts, 320 lineas", "11 metodos; el perfil se arma en tres consultas",
     [["dataSource", "DataSource", VIS_PRI], ["scoringService", "ScoringService", VIS_PRI], ["preferenciasService", "PreferenciasService", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["cargarPermisos", "Array", ["usuario"], VIS_PRI], ["exigirPermisoRecomendaciones", "void", ["usuario"], VIS_PRI], ["idClienteDeUsuario", "Number = nullable", ["usuario"], VIS_PRI], ["temporadaActualId", "Number = nullable", [], VIS_PRI], ["construirPerfil", "PerfilRecomendacion", ["idCliente", "usuario"], VIS_PRI], ["perfilVacio", "Boolean", ["perfil"], VIS_PRI], ["candidatos", "Array", [], VIS_PRI], ["popularesTemporada", "Array", [], VIS_PRI], ["precioConIva", "Number", ["precioBase", "iva"], VIS_PRI], ["mapaItem", "ItemRecomendacion", ["fila", "score", "motivo"], VIS_PRI], ["recomendar", "Object", ["usuario"], VIS_PUB]]],

    ["SRV_ScoringService", "EXISTE. recomendaciones/SRV_ScoringService.ts, 188 lineas", "scoring heuristico y adaptador de la IA externa",
     [["logger", "Logger", VIS_PRI]],
     [["maxDe", "Number", ["mapa"], VIS_PRI], ["norm", "Number", ["mapa", "clave"], VIS_PRI], ["motivoPrincipal", "String", ["args"], VIS_PRI], ["scoringInterno", "ScorePrenda", ["prenda", "perfil", "temporadaActualId"], VIS_PUB], ["delegarIA", "Map", ["perfil", "prendas", "temporadaActualId"], VIS_PUB]]],

    ["SRV_IaExterna", "EXISTE. SRV_ScoringService.ts:133", "la URL no esta en el .env: nunca se llama",
     [["IA_EXTERNAL_URL", "String = process.env o vacio", VIS_PRI], ["timeout", "Number = 4000 ms", VIS_PRI]],
     [["delegarIA", "Map", ["perfil", "prendas", "temporadaActualId"], VIS_PUB], ["degradar", "String", ["error"], VIS_PUB]]],

    ["SRV_PreferenciasService", "EXISTE. recomendaciones/SRV_PreferenciasService.ts, 131 lineas", "lo exporta el modulo, lo usan pagos y el vestidor",
     [["dataSource", "DataSource", VIS_PRI]],
     [["unaFila", "Object", ["resultado"], VIS_PRI], ["upsertDimension", "void", ["idCliente", "dimension", "valor", "peso"], VIS_PRI], ["dimensionesDePtc", "Object", ["idPtc"], VIS_PRI], ["aplicarDimensiones", "void", ["idCliente", "dims", "peso"], VIS_PRI], ["registrarPreferenciasVenta", "void", ["idVenta"], VIS_PUB], ["registrarPreferenciasGusta", "void", ["usuarioId", "idPtc"], VIS_PUB]]],

    ["SRV_JwtOpcionalAuthGuard", "EXISTE. seguridad/dependencias.ts:84", "el mismo guard del carrito de CU33, aqui con decision deliberada",
     [["jwtTokenService", "JwtTokenService", VIS_PRI], ["usuarioRepo", "Repository", VIS_PRI]],
     [["canActivate", "Boolean", ["context"], VIS_PUB], ["cookieDe", "String", ["header", "nombre"], VIS_PRI]]],

    ["SRV_DataSource", "EXISTE. TypeORM", "tres consultas para el perfil, ninguna en transaccion",
     [],
     [["query", "Array", ["sql", "params"], VIS_PUB]]],

    ["CE_ItemRecomendacion", "EXISTE. SRV_RecomendacionesService.ts:12 y api.ts:2080", "sin stock ni sucursal: no hay de donde sacar el badge",
     [["id_ptc", "Integer", VIS_PUB], ["producto", "Object", VIS_PUB], ["talla", "String", VIS_PUB], ["color", "String", VIS_PUB], ["codigo_hex", "String = nullable", VIS_PUB], ["precio", "Number, con IVA", VIS_PUB], ["imagen", "String = nullable", VIS_PUB], ["score", "Number = 0 a 100", VIS_PUB], ["motivo", "String", VIS_PUB]],
     []],

    ["CE_RespuestaRecomendaciones", "EXISTE. api.ts:2096", "el discriminant fuente decide el texto de la pantalla",
     [["items", "Array", VIS_PUB], ["fuente", "String = scoring_interno|ia_externa|populares_temporada", VIS_PUB]],
     []],

    ["CE_PerfilRecomendacion", "EXISTE. SRV_ScoringService.ts", "cuatro Mapas de id a puntaje, uno por dimension",
     [["categorias", "Map", VIS_PUB], ["tallas", "Map", VIS_PUB], ["colores", "Map", VIS_PUB], ["temporadas", "Map", VIS_PUB]],
     []],

    ["CE_PrendaParaScoring", "EXISTE. SRV_ScoringService.ts", "el payload que se envia a la IA externa",
     [["id_ptc", "Integer", VIS_PUB], ["id_producto", "Integer", VIS_PUB], ["id_categoria", "Integer = nullable", VIS_PUB], ["id_talla", "Integer = nullable", VIS_PUB], ["id_color", "Integer = nullable", VIS_PUB], ["id_temporada", "Integer = nullable", VIS_PUB], ["nombre_categoria", "String = nullable", VIS_PUB], ["nombre_temporada", "String = nullable", VIS_PUB], ["talla", "String", VIS_PUB], ["color", "String", VIS_PUB]],
     []],

    ["CE_ScorePrenda", "EXISTE. SRV_ScoringService.ts", "score y motivo, lo que devuelve el motor",
     [["id_ptc", "Integer", VIS_PUB], ["score", "Number = 0 a 100", VIS_PUB], ["motivo", "String", VIS_PUB]],
     []],

    ["CE_CredencialesCarrito", "EXISTE. seguridad/dependencias.ts:77", "el param decorator que resuelve usuario y token",
     [["usuario", "Usuario = nullable", VIS_PUB], ["tokenInvitado", "String = nullable", VIS_PUB]],
     []],

    ["CE_PreferenciasCliente", "EXISTE. preferencias_cliente (schema.sql:501)", "una dimension por fila y ningun indice",
     [["id_preferencia", "Integer = PK", VIS_PRI], ["id_cliente", "Integer", VIS_PUB], ["id_categoria", "Integer = nullable", VIS_PUB], ["id_talla", "Integer = nullable", VIS_PUB], ["id_color", "Integer = nullable", VIS_PUB], ["id_temporada", "Integer = nullable", VIS_PUB], ["puntaje", "Integer", VIS_PUB]],
     []],

    ["CE_Cliente", "EXISTE. clientes (schema.sql:87)", "si no hay fila, el perfil se arma sin historial",
     [["id_cliente", "Integer = PK", VIS_PRI], ["usuario_id", "Integer = UNIQUE, nullable", VIS_PUB], ["nombre", "String = 150", VIS_PUB]],
     []],

    ["CE_Usuario", "EXISTE. usuarios (schema.sql:32)", "los Gusta se filtran por usuario, no por cliente",
     [["id_usuario", "Integer = PK", VIS_PRI], ["email", "String = 120 UNIQUE", VIS_PRI], ["estado", "String = Pendiente", VIS_PUB]],
     []],

    ["CE_Rol", "EXISTE. roles; permisos_json en schema.sql:573", "consultar_catalogo NO esta en ninguno de los 5 roles",
     [["id_rol", "Integer = PK", VIS_PRI], ["nombre_rol", "String = 60", VIS_PUB], ["permisos_json", "JSONB", VIS_PUB], ["descripcion", "String", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_UsuarioRol", "EXISTE. usuarios_roles con PK compuesta", "cargarPermisos solo lee la PRIMERA fila de la union",
     [["id_usuario", "Integer", VIS_PRI], ["id_rol", "Integer", VIS_PRI]],
     []],

    ["CE_Producto", "EXISTE. productos (schema.sql:223)", "NO tiene columna porcentaje_iva y las dos consultas la leen",
     [["id_producto", "Integer = PK", VIS_PRI], ["codigo", "String = 40 UNIQUE", VIS_PUB], ["nombre", "String = 150", VIS_PUB], ["descripcion", "Text", VIS_PUB], ["id_categoria", "Integer", VIS_PUB], ["id_temporada", "Integer", VIS_PUB], ["precio_base", "Decimal(10,2) NOT NULL", VIS_PUB], ["estado", "String = Disponible", VIS_PUB]],
     []],

    ["CE_ProductoTallaColor", "EXISTE. producto_talla_color (schema.sql:237)", "la unidad que se puntua y se recomienda",
     [["id_ptc", "Integer = PK", VIS_PRI], ["id_producto", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_talla", "Integer", VIS_PUB], ["id_color", "Integer", VIS_PUB], ["estado_stock", "String = Disponible", VIS_PUB]],
     []],

    ["CE_ProductoImagen", "EXISTE. producto_imagenes (schema.sql:246)", "la subquery toma la principal, con orden estable",
     [["id_imagen", "Integer = PK", VIS_PRI], ["id_producto", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_color", "Integer = ON DELETE SET NULL", VIS_PUB], ["url", "Text NOT NULL", VIS_PUB], ["es_principal", "Boolean = false", VIS_PUB], ["orden", "Integer", VIS_PUB]],
     []],

    ["CE_Categoria", "EXISTE. categorias (schema.sql:179)", "una dimension del perfil",
     [["id_categoria", "Integer = PK", VIS_PRI], ["nombre", "String = 80 UNIQUE", VIS_PUB], ["descripcion", "Text", VIS_PUB], ["estado", "String = Activo", VIS_PUB]],
     []],

    ["CE_Temporada", "EXISTE. temporadas (schema.sql:186)", "estado por defecto Programada, y el filtro pide Activa",
     [["id_temporada", "Integer = PK", VIS_PRI], ["nombre", "String = 80", VIS_PUB], ["fecha_inicio", "Date", VIS_PUB], ["fecha_fin", "Date", VIS_PUB], ["estado", "String = Programada", VIS_PUB]],
     []],

    ["CE_Talla", "EXISTE. tallas", "una dimension del perfil",
     [["id_talla", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["orden", "Integer", VIS_PUB]],
     []],

    ["CE_Color", "EXISTE. colores", "una dimension del perfil, y el hex va a la tarjeta",
     [["id_color", "Integer = PK", VIS_PRI], ["nombre", "String", VIS_PUB], ["codigo_hex", "String", VIS_PUB]],
     []],

    ["CE_InventarioStock", "EXISTE. inventario_stock", "el filtro de disponibilidad mira cualquier sucursal",
     [["id_stock", "Integer = PK", VIS_PRI], ["id_ptc", "Integer = UNIQUE con id_sucursal", VIS_PUB], ["id_sucursal", "Integer = UNIQUE con id_ptc", VIS_PUB], ["cantidad_disponible", "Integer = 0", VIS_PUB], ["cantidad_vendida", "Integer = 0", VIS_PUB]],
     []],

    ["CE_Venta", "EXISTE. ventas (schema.sql:384)", "el historial no filtra por estado: cuenta tambien lo no pagado",
     [["id_venta", "Integer = PK", VIS_PRI], ["id_cliente", "Integer = nullable", VIS_PUB], ["id_usuario", "Integer", VIS_PUB], ["id_sucursal", "Integer", VIS_PUB], ["estado", "String = 20", VIS_PUB], ["fecha_venta", "Timestamp = NOW()", VIS_PUB]],
     []],

    ["CE_VentaItem", "EXISTE. venta_items (schema.sql:399)", "de aqui sale el peso del historial",
     [["id_venta_item", "Integer = PK", VIS_PRI], ["id_venta", "Integer = ON DELETE CASCADE", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["cantidad", "Integer", VIS_PUB], ["precio_unitario", "Decimal(10,2)", VIS_PUB]],
     []],

    ["CE_SesionRa", "EXISTE. sesiones_ra (schema.sql:479)", "el puente entre un Gusta y su usuario",
     [["id_sesion_ra", "Integer = PK", VIS_PRI], ["id_usuario", "Integer", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["medidas_avatar", "String = 120", VIS_PUB], ["fecha", "Timestamp = NOW()", VIS_PUB], ["id_reserva", "Integer = nullable", VIS_PUB], ["id_carrito", "Integer = nullable", VIS_PUB]],
     []],

    ["CE_ResultadoPrueba", "EXISTE. resultados_prueba (schema.sql:490)", "el Gusta del vestidor, VARCHAR(20)",
     [["id_resultado", "Integer = PK", VIS_PRI], ["id_sesion_ra", "Integer", VIS_PUB], ["id_ptc", "Integer", VIS_PUB], ["resultado", "String = 20", VIS_PUB], ["fecha", "Timestamp = NOW()", VIS_PUB]],
     []]
];

var ACTORES = [
    ["ACTOR_Cliente", "Cliente autenticado. OJO: da 403", "NO tiene consultar_catalogo"],
    ["ACTOR_Invitado", "Visitante sin sesion. SI entra", "recibe las populares de la temporada"],
    ["ACTOR_Administrador", "Administrador con wildcard", "unico que pasa el permiso"],
    ["ACTOR_ServicioIA", "IA externa, opcional y no configurada", "nunca se llama"]
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
        if (String(padre.Packages.GetAt(i).Name) == nombre) return padre.Packages.GetAt(i);
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
    var mod = buscarPaquete(cu, "2. Catalogo y Productos");
    if (mod == null) mod = buscarPaquete(cu, "8. Reservas");
    if (mod == null) mod = cu;
    var paq = subPaquete(mod, "CU41 - Análisis de clases");

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
    try { diag = paq.Diagrams.AddNew("CU41 - Análisis de Clases", "Class"); } catch (e) { diag = null; }
    if (diag == null) ERRORES.push("no se pudo crear el diagrama");

    if (diag != null) {
        diag.Update();
        try { paq.Diagrams.Refresh(); } catch (e) { }
        var COLX = [30, 300, 570, 840, 1110];
        var ANCHO = 250;

        for (var p = 0; p < actores.length; p++) {
            colocar(diag, actores[p], COLX[p], 25, 190, 100);
        }
        for (var k2 = 0; k2 < DEF.length; k2++) {
            var col = k2 % 5;
            var fila = 1 + Math.floor(k2 / 5);
            var x = COLX[col];
            var y = 25 + fila * 300;
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

        conEnDiagrama += relacion(diag, actores[0], C.IU_Recomendaciones, "pide sus recomendaciones", "Association", "", "cliente", "pantalla", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[0], C.CTR_RecomendacionesController, "las pide por HTTP", "Association", "", "cliente", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[1], C.CTR_RecomendacionesController, "pide sin sesion", "Association", "", "invitado", "endpoint", "1", "0..1");
        conEnDiagrama += relacion(diag, actores[2], C.CTR_RecomendacionesController, "unico que pasa el permiso", "Association", "", "administrador", "endpoint", "1", "0..1");
                conEnDiagrama += relacion(diag, actores[3], C.SRV_IaExterna, "puntua las prendas", "Dependency", "uses", "servicio IA", "adaptador", "0..*", "1");

        conEnDiagrama += relacion(diag, C.IU_Recomendaciones, C.IU_Api, "cliente HTTP", "Dependency", "uses", "pantalla", "cliente", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_Recomendaciones, C.CE_ItemRecomendacion, "tarjetas que muestra", "Association", "", "pantalla", "item", "0..*", "1");
        conEnDiagrama += relacion(diag, C.IU_Recomendaciones, C.CE_RespuestaRecomendaciones, "respuesta que pinta", "Dependency", "uses", "pantalla", "respuesta", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_Recomendaciones, C.CE_ProductoImagen, "imagen de la tarjeta", "Association", "", "pantalla", "imagen", "0..*", "1");
        conEnDiagrama += relacion(diag, C.IU_Api, C.CTR_RecomendacionesController, "punto de acceso", "Dependency", "uses", "cliente", "recomendaciones", "1", "0..1");
        conEnDiagrama += relacion(diag, C.IU_Api, C.CE_RespuestaRecomendaciones, "respuesta tipada", "Association", "", "cliente", "respuesta", "1", "1");
        conEnDiagrama += relacion(diag, C.IU_ClienteLayout, C.IU_Recomendaciones, "envuelve la pantalla", "Dependency", "uses", "layout", "pantalla", "0..1", "1");

        conEnDiagrama += relacion(diag, C.CTR_RecomendacionesController, C.SRV_JwtOpcionalAuthGuard, "guard opcional", "Dependency", "uses", "recomendaciones", "guard", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_RecomendacionesController, C.CE_CredencialesCarrito, "credenciales resueltas", "Dependency", "uses", "recomendaciones", "credenciales", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_RecomendacionesController, C.SRV_RecomendacionesService, "servicio de recomendaciones", "Association", "", "recomendaciones", "servicio", "1", "1");
        conEnDiagrama += relacion(diag, C.CTR_RecomendacionesController, C.CE_RespuestaRecomendaciones, "items y fuente", "Association", "", "recomendaciones", "respuesta", "0..*", "1");

        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.SRV_ScoringService, "scoring y delegacion", "Dependency", "uses", "recomendaciones", "scoring", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.SRV_PreferenciasService, "preferencias del modulo", "Dependency", "uses", "recomendaciones", "preferencias", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.SRV_DataSource, "consultas del perfil y candidatos", "Dependency", "uses", "recomendaciones", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.SRV_JwtOpcionalAuthGuard, "usuario del guard", "Association", "", "recomendaciones", "guard", "1", "0..1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_CredencialesCarrito, "usuario nullable", "Dependency", "uses", "recomendaciones", "credenciales", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_Usuario, "usuario del perfil", "Association", "", "recomendaciones", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_Rol, "permiso comprobado", "Dependency", "uses", "recomendaciones", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_UsuarioRol, "asignacion de rol", "Dependency", "uses", "recomendaciones", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_Cliente, "cliente del perfil", "Dependency", "uses", "recomendaciones", "cliente", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_PreferenciasCliente, "preferencias leidas", "Dependency", "uses", "recomendaciones", "preferencia", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_Venta, "historial de compras", "Dependency", "uses", "recomendaciones", "venta", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_VentaItem, "cantidad comprada", "Dependency", "uses", "recomendaciones", "item de venta", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_SesionRa, "sesiones del vestidor", "Dependency", "uses", "recomendaciones", "sesion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_ResultadoPrueba, "resultados Gusta", "Dependency", "uses", "recomendaciones", "resultado", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_PerfilRecomendacion, "perfil armado", "Composition", "composition", "recomendaciones", "perfil", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_PrendaParaScoring, "prendas a puntuar", "Composition", "composition", "recomendaciones", "prenda", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_ScorePrenda, "puntajes aplicados", "Dependency", "uses", "recomendaciones", "score", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_ProductoTallaColor, "candidatos con stock", "Dependency", "uses", "recomendaciones", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_Producto, "lee porcentaje_iva: no existe", "Dependency", "uses", "recomendaciones", "producto", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_InventarioStock, "filtro de disponibilidad", "Dependency", "uses", "recomendaciones", "stock", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_Temporada, "temporada actual", "Dependency", "uses", "recomendaciones", "temporada", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_Categoria, "categoria de la prenda", "Dependency", "uses", "recomendaciones", "categoria", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_Talla, "talla de la prenda", "Dependency", "uses", "recomendaciones", "talla", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_Color, "color de la prenda", "Dependency", "uses", "recomendaciones", "color", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_ProductoImagen, "imagen principal", "Dependency", "uses", "recomendaciones", "imagen", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_ItemRecomendacion, "items devueltos", "Composition", "composition", "recomendaciones", "item", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_RecomendacionesService, C.CE_RespuestaRecomendaciones, "respuesta con fuente", "Composition", "composition", "recomendaciones", "respuesta", "1", "1");

        conEnDiagrama += relacion(diag, C.SRV_ScoringService, C.SRV_IaExterna, "delega si hay URL", "Dependency", "uses", "scoring", "ia externa", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ScoringService, C.CE_PerfilRecomendacion, "perfil normalizado", "Dependency", "uses", "scoring", "perfil", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ScoringService, C.CE_PrendaParaScoring, "prenda a puntuar", "Dependency", "uses", "scoring", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_ScoringService, C.CE_ScorePrenda, "score y motivo", "Composition", "composition", "scoring", "score", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_IaExterna, C.CE_PrendaParaScoring, "payload enviado", "Dependency", "uses", "ia externa", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_IaExterna, C.CE_PerfilRecomendacion, "perfil serializado", "Dependency", "uses", "ia externa", "perfil", "1", "0..1");
        conEnDiagrama += relacion(diag, C.SRV_IaExterna, C.CE_ScorePrenda, "puntajes recibidos", "Composition", "composition", "ia externa", "score", "0..*", "1");
        conEnDiagrama += relacion(diag, C.SRV_PreferenciasService, C.SRV_DataSource, "upsert por SELECT y luego INSERT", "Dependency", "uses", "preferencias", "datos", "1", "1");
        conEnDiagrama += relacion(diag, C.SRV_PreferenciasService, C.CE_PreferenciasCliente, "puntaje acumulado", "Composition", "composition", "preferencias", "preferencia", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PreferenciasService, C.CE_Venta, "venta que se registra", "Dependency", "uses", "preferencias", "venta", "1", "0..1");
        conEnDiagrama += relacion(diag, C.SRV_PreferenciasService, C.CE_ProductoTallaColor, "dimensiones de la prenda", "Dependency", "uses", "preferencias", "prenda", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_PreferenciasService, C.CE_Cliente, "cliente del puntaje", "Association", "", "preferencias", "cliente", "1", "0..*");
        conEnDiagrama += relacion(diag, C.SRV_JwtOpcionalAuthGuard, C.CE_Usuario, "usuario resuelto", "Association", "", "guard", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.SRV_JwtOpcionalAuthGuard, C.CE_CredencialesCarrito, "credenciales que produce", "Association", "", "guard", "credenciales", "1", "1");

        conEnDiagrama += relacion(diag, C.CE_CredencialesCarrito, C.CE_Usuario, "usuario nullable", "Association", "", "credenciales", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_RespuestaRecomendaciones, C.CE_ItemRecomendacion, "items ordenados", "Composition", "composition", "respuesta", "item", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_ItemRecomendacion, C.CE_ProductoTallaColor, "prenda recomendada", "Association", "", "item", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_ItemRecomendacion, C.CE_ProductoImagen, "imagen principal", "Association", "", "item", "imagen", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_ItemRecomendacion, C.CE_Color, "color con su hex", "Association", "", "item", "color", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_PerfilRecomendacion, C.CE_Categoria, "puntaje por categoria", "Association", "", "perfil", "categoria", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_PerfilRecomendacion, C.CE_Talla, "puntaje por talla", "Association", "", "perfil", "talla", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_PerfilRecomendacion, C.CE_Color, "puntaje por color", "Association", "", "perfil", "color", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_PerfilRecomendacion, C.CE_Temporada, "puntaje por temporada", "Association", "", "perfil", "temporada", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_PrendaParaScoring, C.CE_ProductoTallaColor, "prenda a puntuar", "Association", "", "prenda", "ptc", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_PrendaParaScoring, C.CE_Categoria, "categoria", "Association", "", "prenda", "categoria", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_PrendaParaScoring, C.CE_Talla, "talla", "Association", "", "prenda", "talla", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_PrendaParaScoring, C.CE_Color, "color", "Association", "", "prenda", "color", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_PrendaParaScoring, C.CE_Temporada, "temporada", "Association", "", "prenda", "temporada", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_ScorePrenda, C.CE_PrendaParaScoring, "prenda puntuada", "Association", "", "score", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_PreferenciasCliente, C.CE_Cliente, "cliente de la preferencia", "Association", "", "preferencia", "cliente", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_PreferenciasCliente, C.CE_Categoria, "categoria puntuada", "Association", "", "preferencia", "categoria", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_PreferenciasCliente, C.CE_Talla, "talla puntuada", "Association", "", "preferencia", "talla", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_PreferenciasCliente, C.CE_Color, "color puntuado", "Association", "", "preferencia", "color", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_PreferenciasCliente, C.CE_Temporada, "temporada puntuada", "Association", "", "preferencia", "temporada", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Cliente, C.CE_Usuario, "usuario del cliente", "Association", "", "cliente", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_Rol, "roles del usuario", "Association", "", "usuario", "rol", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Usuario, C.CE_UsuarioRol, "asignaciones", "Composition", "composition", "usuario", "asignacion", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_Rol, C.CE_UsuarioRol, "usuarios del rol", "Association", "", "rol", "asignacion", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_Producto, C.CE_Categoria, "categoria del producto", "Association", "", "producto", "categoria", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Producto, C.CE_Temporada, "temporada del producto", "Association", "", "producto", "temporada", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_Producto, C.CE_ProductoTallaColor, "prendas del producto", "Composition", "composition", "producto", "prenda", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_Producto, C.CE_ProductoImagen, "imagenes del producto", "Composition", "composition", "producto", "imagen", "1", "0..*");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Talla, "talla", "Association", "", "prenda", "talla", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_ProductoTallaColor, C.CE_Color, "color", "Association", "", "prenda", "color", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_ProductoImagen, C.CE_Color, "color de la imagen", "Association", "", "imagen", "color", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_InventarioStock, C.CE_ProductoTallaColor, "stock por prenda", "Association", "", "stock", "prenda", "0..*", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaItem, C.CE_Venta, "venta del item", "Composition", "composition", "item de venta", "venta", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_VentaItem, C.CE_ProductoTallaColor, "prenda comprada", "Association", "", "item de venta", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_Venta, C.CE_Cliente, "cliente de la venta", "Association", "", "venta", "cliente", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_ResultadoPrueba, C.CE_SesionRa, "sesion del resultado", "Association", "", "resultado", "sesion", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_ResultadoPrueba, C.CE_ProductoTallaColor, "prenda probada", "Association", "", "resultado", "prenda", "1", "1");
        conEnDiagrama += relacion(diag, C.CE_SesionRa, C.CE_Usuario, "usuario de la sesion", "Association", "", "sesion", "usuario", "0..1", "1");
        conEnDiagrama += relacion(diag, C.CE_SesionRa, C.CE_ProductoTallaColor, "prenda probada", "Association", "", "sesion", "prenda", "0..1", "1");

        var N = [];
        N.push("Analisis de clases estatico: sin mensajes, sin lineas de vida, sin secuencia y sin casos de uso.");
        N.push("");
        N.push("4 actores, " + DEF.length + " clases y " + TOTAL_REL + " relaciones estaticas. El rol va en el nombre, no en el estereotipo:");
        N.push("IU_ interfaz de usuario (3), CTR_ controlador (1), SRV_ servicio o adaptador (6), CE_ entidad o tipo (" + (DEF.length - 10) + ").");
        N.push("");
        N.push("HALLAZGO CRITICO 1: LAS RECOMENDACIONES NO FUNCIONAN PARA NINGUN AUTENTICADO.");
        N.push("");
        N.push("  private async exigirPermisoRecomendaciones(usuario: Usuario): Promise<void> {");
        N.push("    const permisos = await this.cargarPermisos(usuario);");
        N.push("    if (!(permisos.includes('*') || permisos.includes('consultar_catalogo'))) {");
        N.push("      throw new ForbiddenException('No tienes permisos para acceder a recomendaciones.');");
        N.push("    }");
        N.push("  }");
        N.push("");
        N.push("Es la septima aparicion de un permiso que no existe. consultar_catalogo no esta en");
        N.push("ninguno de los cinco roles de schema.sql:573. Lo que hay:");
        N.push("");
        N.push("  Cliente   [\"ver_catalogo\",\"comprar\",\"reservar\",\"usar_vestidor_ra\"]");
        N.push("  Encargado [\"gestionar_catalogo\", ...]");
        N.push("");
        N.push("Ni ver_catalogo ni gestionar_catalogo son consultar_catalogo. Es el mismo patron de");
        N.push("realizar_venta en CU33, CU34, CU35 y CU37, pero aqui con un nombre nuevo: cada caso");
        N.push("inventa el permiso que le conviene y ninguno existe.");
        N.push("");
        N.push("Y hay un detalle de estructura que hace la cosa mas absurda. La ruta usa el guard");
        N.push("OPCIONAL, el mismo de CU33:");
        N.push("");
        N.push("  @Get()");
        N.push("  @UseGuards(JwtOpcionalAuthGuard)");
        N.push("  recommendar(@CredencialesCarritoActual() credenciales: CredencialesCarrito) {");
        N.push("    return this.recomendacionesService.recomendar(credenciales.usuario);");
        N.push("  }");
        N.push("");
        N.push("  async recomendar(usuario: Usuario | null) {");
        N.push("    if (usuario == null) {");
        N.push("      return { items: await this.popularesTemporada(), fuente: 'populares_temporada' };");
        N.push("    }");
        N.push("    await this.exigirPermisoRecomendaciones(usuario);   // aqui si entra");
        N.push("");
        N.push("El invitado entra antes del permiso. El Cliente pasa el guard y se come el 403. O sea");
        N.push("que la unica forma de obtener recomendaciones es no estar autenticado, y lo que");
        N.push("recibe un Cliente es un 403 con el texto exacto de E1. La pantalla de");
        N.push("recomendaciones es la del CU41 entero, y es inalcanzable para el actor principal.");
        N.push("");
        N.push("La diferencia con CU33 es que aqui la rama del nulo es deliberada y esta justificada");
        N.push("en un comentario, cosa que alli no pasaba. Aun asi el efecto es el mismo: al Cliente le");
        N.push("toca la version generica si se equivoca de sesion.");
        N.push("");
        N.push("HALLAZGO CRITICO 2: LA IA EXTERNA NO EXISTE. IA_EXTERNAL_URL NO ESTA EN EL .ENV.");
        N.push("");
        N.push("  const IA_EXTERNAL_URL = process.env.IA_EXTERNAL_URL ?? '';   // linea 29");
        N.push("  if (!IA_EXTERNAL_URL) return null;                          // linea 138");
        N.push("");
        N.push("El .env del backend tiene once variables activas y IA_EXTERNAL_URL no es una de ellas.");
        N.push("O sea que delegarIA devuelve null en la primera linea, siempre, y todo el scoring lo");
        N.push("hace el heuristico interno. El caso describe un servicio de IA contratado, con su");
        N.push("timeout, su degradacion y su validacion de respuesta, y todo eso esta bien escrito");
        N.push("pero es codigo muerto por falta de una variable de entorno.");
        N.push("");
        N.push("Es la cuarta infraestructura de mentira del proyecto, y el patron ya es un");
        N.push("reconocible:");
        N.push("");
        N.push("  CU35  pasarela de pago     ningun HTTP, ningun SDK, ningun key");
        N.push("  CU38  almacenamiento S3   ternario con las dos ramas iguales");
        N.push("  CU41  servicio de IA       la variable no esta en el .env");
        N.push("  CU36  sp_registrar_venta   el procedimiento existe y no lo llama nadie");
        N.push("");
        N.push("Y el contraste con el otro servicio externo del proyecto, que si es real de verdad:");
        N.push("  SRV_ReportesVozService.ts:70  STT_SERVICE_URL ?? 'http://localhost:8001/transcribe'");
        N.push("  SRV_ReportesVozService.ts:71  IA_SERVICE_URL  ?? 'http://localhost:8002/interpret'");
        N.push("");
        N.push("O sea que el proyecto si sabe integrar servicios externos, y lo hace con dos");
        N.push("variables con fallback a localhost en el modulo de reportes de voz. Recomendaciones");
        N.push("tiene su propio IA_EXTERNAL_URL, con fallback a cadena vacia, en otro modulo. Son");
        N.push("dos integraciones distintas con dos nombres distintos para lo mismo, y la segunda");
        N.push("nunca se ha encendido.");
        N.push("");
        N.push("HALLAZGO CRITICO 3: LO QUE SE MUESTRA NO ES LO QUE SE COMPRA.");
        N.push("");
        N.push("La tarjeta muestra un precio con IVA:");
        N.push("");
        N.push("  precio: this.precioConIva(f.precio_base, f.porcentaje_iva)");
        N.push("  // que es  Math.round(base * (1 + pct / 100) * 100) / 100");
        N.push("");
        N.push("y el carrito de CU33 muestra un precio SIN IVA:");
        N.push("");
        N.push("  precioVigente: producto_precios.precio, o productos.precio_base. Sin sumar nada.");
        N.push("");
        N.push("O sea que para la misma prenda, la pantalla de recomendaciones dice Bs X y la del");
        N.push("carrito dice Bs Y, con X = Y * 1.13. El cliente ve un precio, se anima, y al llegar");
        N.push("al carrito ve otro. Es la segunda vez que el precio se duplica en dos capas, despues");
        N.push("del IVA de AdminCaja en CU36, y las dos son visibles para el usuario y las dos son");
        N.push("dinero. Con la columna inexistente, hoy las dos consultas fallan, pero la divergencia");
        N.push("esta escrita y seguira ahi cuando se arregle el esquema.");
        N.push("");
        N.push("Y el caso no lo menciona. El caso dice que la tarjeta muestra precio, disponibilidad");
        N.push("y motivo, y que al pulsar se puede ir a CU16, CU32 o CU33. De las tres cosas:");
        N.push("");
        N.push("  - El precio existe, pero es el que lleva IVA y no coincide con el del carrito.");
        N.push("  - El badge de disponibilidad NO EXISTE. ItemRecomendacion no tiene ningun campo de");
        N.push("    stock ni de sucursal. Son nueve campos y ninguno es disponibilidad. No hay de");
        N.push("    donde sacarlo.");
        N.push("  - Los tres enlaces del paso 7 no existen. En las diez tarjetas hay UN solo enlace,");
        N.push("    y es el mismo en todas: un Link fijo a /reservas/pruebas-ra, el vestidor. No hay");
        N.push("    ir al detalle del producto ni agregar al carrito. Una recomendacion no se puede");
        N.push("    aprovechar, solo se puede ir al probador de la misma prenda.");
        N.push("");
        N.push("HALLAZGO 4: EL HISTORIAL DE COMPRAS CUENTA LO QUE NO SE HA PAGADO.");
        N.push("");
        N.push("  SELECT ptc.id_talla, ptc.id_color, p.id_categoria, p.id_temporada, SUM(vi.cantidad) AS total");
        N.push("   FROM ventas v");
        N.push("   JOIN venta_items vi ON vi.id_venta = v.id_venta");
        N.push("   JOIN producto_talla_color ptc ON ptc.id_ptc = vi.id_ptc");
        N.push("   JOIN productos p ON p.id_producto = ptc.id_producto");
        N.push("   WHERE v.id_cliente = $1");
        N.push("   GROUP BY ptc.id_talla, ptc.id_color, p.id_categoria, p.id_temporada");
        N.push("");
        N.push("No hay filtro por estado. O sea que una venta en Pendiente pesa igual que una");
        N.push("Completada. Y con el hallazgo 4 de CU35, una venta cuyo pago se rechazo queda en");
        N.push("Pendiente para siempre y ya no se puede reintentar: es una venta que no se cobrara");
        N.push("nunca y que sin embargo esta contando para el perfil de gusto del cliente, con todo el");
        N.push("peso de las unidades. O sea que el perfil de gusto se construye con intentos de");
        N.push("compra fallidos, y un cliente que anade muchas prendas y nunca paga tiene un perfil");
        N.push("muy marcado y ninguna compra. El caso dice que el perfil combina historial de");
        N.push("compras, y no dice que la compra tiene que haberse completado.");
        N.push("");
        N.push("Y un detalle de pesos que el caso no fija: el historial suma SUM(cantidad) y los");
        N.push("Gusta suman 1 cada uno (lineas 161-166). O sea que un like pesa igual que una unidad");
        N.push("comprada. Un cliente que desliza treinta prendas sin comprar nada tiene el mismo");
        N.push("perfil que uno que compro treinta unidades, y las dos cosas se suman en el mismo");
        N.push("mapa sin distincion.");
        N.push("");
        N.push("HALLAZGO 5: EL SCORE ES UNA NORMALIZACION RELATIVA, Y SE MUESTRA COMO PORCENTAJE.");
        N.push("");
        N.push("  private maxDe(mapa: Map<number, number>): number { ... }");
        N.push("  private norm(mapa, clave) { return max > 0 ? valor / max : 0; }");
        N.push("");
        N.push("Cada dimension se normaliza contra su propio maximo, o sea que el mejor candidato");
        N.push("de cada dimension siempre se lleva 1, y el score final siempre tiene un 100. Da igual");
        N.push("que el catalogo no tenga NADA que ver con el cliente: la mejor coincidencia es 100 por");
        N.push("construccion. Es una medida de posicion dentro del conjunto, no una afinidad absoluta.");
        N.push("");
        N.push("Y la tarjeta lo presenta como porcentaje:");
        N.push("");
        N.push("  <Badge variant={badgeScore(item.score)}>{item.score}%</Badge>");
        N.push("");
        N.push("El % le dice al cliente que hay un 87 por ciento de probabilidad de que le guste.");
        N.push("No hay ninguna probabilidad ahi: es un maximo normalizado. Con un perfil debilisimo y");
        N.push("un catalogo enorme, el primer resultado sale con 100 por ciento. Y el color del");
        N.push("badge sale del propio score (70 o mas success, 40 o mas accent), o sea que el");
        N.push("-verde y el ambar son tan arbitrarios como el numero. El caso no habla del badge.");
        N.push("");
        N.push("HALLAZGO 6: IA PARCIAL MEZCLADA Y ETIQUETADA COMO SI FUERA TODO DE UN MOTOR.");
        N.push("");
        N.push("  const ia = puntajesIA?.get(p.id_ptc);");
        N.push("  if (ia) { fuente = 'ia_externa'; return ia; }");
        N.push("  return this.scoringService.scoringInterno(p, perfil, temporadaActualId);");
        N.push("");
        N.push("La busqueda es por prenda, o sea que si la IA devuelve puntuaciones para la mitad");
        N.push("del catalogo, esas Items vienen de la IA y las otras del heuristico interno, y la");
        N.push("respuesta entera se etiqueta como ia_externa. El cliente ve Recomendaciones generadas");
        N.push("con scoring personalizado y en realidad es mitad y mitad. No hay forma de saber");
        N.push("cuales prendas vinieron de cada motor, ni de depurar el interno contra el externo.");
        N.push("");
        N.push("Lo que si esta bien es la degradacion: si la URL no existe, si falla, si no responde");
        N.push("en 4 segundos, si devuelve un no ok, o si el body no trae un array, se devuelve null");
        N.push("y se usa el interno, con un logger.warn que lo deja escrito. Es la mejor manejo de");
        N.push("fallbacks del proyecto, y solo funciona que no haya nada a lo que quedarse sin");
        N.push("respuesta. Lo que no esta controlado es el tamano: se manda el catalogo entero de");
        N.push("candidatos, que son todas las prendas activas con stock en cualquier sucursal, en un");
        N.push("solo POST con 4 segundos de margen. Con un catalogo real eso son cientos de");
        N.push("prendas por peticion.");
        N.push("");
        N.push("HALLAZGO 7: EL FILTRO DE DISPONIBILIDAD ES EN CUALQUIER SUCURSAL, Y NO SE DICE CUAL.");
        N.push("");
        N.push("  AND EXISTS (SELECT 1 FROM inventario_stock inv");
        N.push("              WHERE inv.id_ptc = ptc.id_ptc AND inv.cantidad_disponible > 0)");
        N.push("");
        N.push("El caso dice que es en cualquier sucursal, y acierta. La consecuencia es que se");
        N.push("puede recomendar una talla o un color que solo existe en una sucursal a mil");
        N.push("kilometros, y como el response no lleva ni id_sucursal ni cantidad, el cliente no");
        N.push("tiene forma de enterarse. Peor con el hallazgo 2 de CU39: la disponibilidad se");
        N.push("lee sin descontar lo reservado, o sea que se puede recomendar una prenda cuya unica");
        N.push("unidad esta apartada para una reserva y que no se puede comprar en ninguna parte.");
        N.push("");
        N.push("HALLAZGO 8: LA TEMPORADA ACTIVA NO EXISTE SI NADIE LA ACTIVA, Y EL FALLBACK NO RESUELVE.");
        N.push("");
        N.push("  // consulta principal: estado = 'activa' Y dentro del rango de fechas");
        N.push("  // Fallback: primera temporada con estado Activa");
        N.push("  SELECT id_temporada FROM temporadas WHERE LOWER(estado) = 'activa' ORDER BY id_temporada LIMIT 1");
        N.push("");
        N.push("El fallback quita el rango de fechas, pero conserva el filtro de estado, o sea que");
        N.push("no es un fallback: si ninguna temporada esta Activa, las dos consultas devuelven");
        N.push("nada. Y el DEFAULT de la columna es Programada, o sea que una temporada recien creada");
        N.push("no cuenta como actual. La temporada activa hay que ponerla a mano, y el caso");
        N.push("asume que existe una por fecha vigente, que es la lectura natural de la columna.");
        N.push("");
        N.push("Y el caso mete la temporada en el perfil, o sea que la dimension temporadas");
        N.push("acumula la temporada de cada prenda comprada, y no solo la vigente. Eso esta bien");
        N.push("pensado, pero con temporadas mal dadas de alta la dimension queda siempre vacia y el");
        N.push("factor de temporada no hace nada.");
        N.push("");
        N.push("HALLAZGO 9: LAS PREFERENCIAS NO TIENEN INDICE Y EL UPSERT ES UN SELECT Y LUEGO INSERT.");
        N.push("");
        N.push("  const sqlExiste = `SELECT id_preferencia FROM preferencias_cliente");
        N.push("     WHERE id_cliente = $1 AND ${dimension} = $2");
        N.push("       AND ${otros.map((c) => `${c} IS NULL`).join(' AND ')} LIMIT 1`;");
        N.push("  ... si existe, UPDATE; si no, INSERT");
        N.push("");
        N.push("preferencias_cliente no tiene indice unico, ni indice de ningun tipo, y no hay mas");
        N.push("que ese SELECT. O sea que cada llamada hace un recorrido completo de la tabla, y dos");
        N.push("altempotadas simultaneas pueden no ver ninguna fila y las dos insertar, dejando dos");
        N.push("filas con la misma dimension y el mismo cliente. A partir de ahi el puntaje se parte");
        N.push("en dos y ninguno de los dos ve el total.");
        N.push("");
        N.push("Y el diseno de una dimension por fila, con las otras tres a NULL, es bueno: es una");
        N.push("forma dispersa de esbelta y el perfil la reagrupa al leer. Eso si esta bien hecho.");
        N.push("Lo que falta es el indice unico parcial que haria el upsert atomico, que es una");
        N.push("linea de esquema.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - El perfil se arma con tres consultas secuenciales, sin transaccion: preferencias,");
        N.push("    historial y Gustas. Con un BUY en medio el perfil seria incoherente, y con la");
        N.push("    venta de CU35 que escribe las preferencias despues de commitear, hay una ventana");
        N.push("    real en la que el perfil todavia no incluye la compra que acaba de hacerse.");
        N.push("  - El LIMIT 10 y el orden con desempate por id_ptc, .sort((a, b) => b.score -");
        N.push("    a.score || a.id_ptc - b.id_ptc), son deterministas. Bien: dos peticiones con el");
        N.push("    mismo perfil devuelven exactamente la misma lista.");
        N.push("  - La subquery de la imagen principal usa ORDER BY orden, id_imagen LIMIT 1, y");
        N.push("    producto_imagenes no tiene unicidad sobre es_principal, asi que puede haber dos");
        N.push("    principales. El orden la hace determinista de todos modos.");
        N.push("  - E5, catalogo sin disponibilidad, esta bien: items vacio y la pantalla dice");
        N.push("    Aún sin recomendaciones disponibles, que es el texto del caso. Y el caso no");
        N.push("    lista ninguna excepcion para el caso de que el Cliente no tenga fila en");
        N.push("    clientes, que es el mismo 404 de CU34 y CU38, y aqui no pasa nada porque");
        N.push("    idClienteDeUsuario devuelve null y el perfil se arma igual, sin historial.");
        N.push("  - La pantalla cambia el subtitulo segun fuente, con las tres ramas cubiertas, lo");
        N.push("    cual es el unico indicio que recibe el cliente de que le estan mostrando las");
        N.push("    populares en vez de una personalizacion. Y como fuente solo puede valer");
        N.push("    populares_temporada o scoring_interno con IA sin configurar, el cliente nunca");
        N.push("    vera la rama de IA externa.");
        N.push("  - RecomendacionesModule exporta PreferenciasService, y eso es lo que permite que");
        N.push("    SRV_PagosService lo inyecte desde otro modulo sin acoplar los dos. Es la unica");
        N.push("    frontera de modulo que esta bien puesta en el proyecto entero.");
        N.push("  - El modulo tiene un solo controlador, con un solo GET de 15 lineas, y tres");
        N.push("    servicios. Es el modulo mas pequeno del proyecto y el que mas dependencias cruza");
        N.push("    (ventas, reserva, sesiones RA, preferencias, stock, catalogo).");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("CU41 - RECOMENDAR PRENDAS CON IA - INFORME");
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
    msg = msg + "CU41 - Recomendar prendas con IA" + SALTO + SALTO;
    msg = msg + "consultar_catalogo NO existe: el Cliente da 403 y el" + SALTO;
    msg = msg + "invitado, que entra antes del permiso, si recibe lista." + SALTO;
    msg = msg + "IA_EXTERNAL_URL no esta en el .env: la IA nunca se llama." + SALTO + SALTO;
    msg = msg + "El precio de la tarjeta lleva IVA y el del carrito no:" + SALTO;
    msg = msg + "el cliente ve dos precios para la misma prenda." + SALTO;
    msg = msg + "El historial de compras no filtra por estado: cuenta lo no" + SALTO;
    msg = msg + "pagado. El score es un maximo normalizado y se muestra con %." + SALTO + SALTO;
    msg = msg + "Clases: " + DEF.length + "    Actores: 4    Relaciones: " + TOTAL_REL + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de " + TOTAL_ATR + SALTO;
    msg = msg + "Operaciones reales: " + totalOpe + " de " + TOTAL_OPE + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de " + TOTAL_REL + SALTO;
    if (conEnDiagrama < TOTAL_REL) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU41 - Análisis de Clases", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "CU41 - Análisis de clases");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU41", 0); } catch (e3) { }
}
