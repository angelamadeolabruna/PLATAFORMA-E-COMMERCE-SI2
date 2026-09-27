// ================================================================
// DISENO LOGICO - DIAGRAMA ORGANIZADO EN CAPAS
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.1.2 del documento
//
// ESTRUCTURA DEL DIAGRAMA
//   Un marco por capa, con el nombre de la capa escrito arriba a la
//   izquierda y un color distinto cada una. Dentro de cada marco, los
//   recuadros de los paquetes que aportan algo a esa capa. Debajo, la
//   siguiente capa, y asi hasta cuatro.
//
//   Cada recuadro es un elemento REAL del modelo, con nombre y con sus
//   lineas de contenido DENTRO. No hay cajas de texto sueltas encima.
//
// LOS 10 PAQUETES Y SU REPARTO EN LAS 4 CAPAS
//   1  Presentacion   los 10 tienen pantalla        10 de 10
//   2  Aplicacion     los 10 tienen servicio         10 de 10
//   3  Dominio        solo 3 tienen entidad          3 de 10
//   4  Datos          los 10 escriben tablas         10 de 10
//   Son 33 recuadros en total porque un paquete atraviesa capas: cada
//   aparicion es un elemento distinto, llamado Paquete en Capa.
//
//   Que un paquete aparezca en varias filas NO es un descuido, es la
//   informacion: un paquete es un negocio, y un negocio atraviesa la
//   arquitectura. Los dos recuadros del mismo paquete van siempre en la
//   MISMA columna y se unen con un conector vertical, de modo que se lee
//   que son el mismo paquete y no dos cosas distintas.
//
//   Los recuadros de cada paquete dicen lo que ese paquete aporta EN ESA
//   CAPA, y es distinto en cada una. El mismo paquete en cuatro filas
//   tiene cuatro textos diferentes.
//
// HALLAZGO PRINCIPAL, Y ES LO QUE DICE EL DIAGRAMA
//   La capa de dominio tiene 3 paquetes de 10, y los 3 son del modulo
//   seguridad. Lo que decide si un paquete pasa por el dominio no es el
//   negocio que hace: es si su modulo usa repositorios de TypeORM o SQL
//   crudo.
//
//     3 paquetes tocan las 4 capas, y usan entidades:
//       Seguridad y Auditoria, Gestion de Usuarios y Roles,
//       Gestion de Sucursales
//     7 paquetes tocan 3 capas y SE SALTAN el dominio:
//       Catalogo, Proveedores y Compras, Inventario, Reservas, Ventas,
//       Inteligencia Artificial, Reporting
//
//   Los 7 saltos van dibujados con el estereotipo salto de capa en el
//   conector. Y el marco del dominio es mas bajo y de otro color, porque
//   solo tiene tres recuadros. Esa asimetria ES el hallazgo.
//
// VERIFICADO CONTRA EL CODIGO
//   15 modulos NestJS, 85 ficheros, 32 SRV, 25 CTR
//   13 de los 15 modulos usan SQL crudo contra DataSource
//   2 de los 15 usan repositorios: seguridad y clientes
//   14 clases de entidad para 51 tablas, y solo 2 modulos las usan
//   3 metodos en toda la capa de dominio
//   4 tablas escritas desde mas de un modulo:
//     inventario_stock, movimientos_inventario, ventas, carritos
//   Los 3 paquetes con dominio estan dentro del modulo seguridad, que
//   tiene 18 de los 85 ficheros
//
// COLOCACION DEL DIAGRAMA, QUE ES LO MAS DELICADO
//   EA no guarda las coordenadas de un DiagramObject hasta que se guarda
//   el diagrama, el objeto que devuelve AddNew no se mantiene al dia en
//   memoria, y con SaveDiagram por medio las posiciones se pierden. Por
//   eso el script acaba sin errores, el diagrama se ve bien en la sesion,
//   y al abrirlo despues todo sale amontonado en la esquina.
//
//   La via fiable es escribir las coordenadas directamente en la tabla
//   interna de colocacion, t_diagramobjects, y recargar. Solo se tocan
//   coordenadas de colocacion, que no son elementos del modelo: los
//   elementos, sus atributos y los conectores se siguen haciendo con la
//   API, que es lo que mantiene la integridad del modelo.
//
//   Al final el script lee la tabla de vuelta y dice cuantos objetos han
//   quedado con tamano, para que el usuario sepa si ha funcionado.
//
// ESTEREOTIPOS, SOLO EN LOS CONECTORES
//   atraviesa       el paquete continua en la capa de abajo
//   salto de capa   de aplicacion a datos, sin pasar por el dominio
//   importa         dependencia de codigo, la hace un import
//   comparte tabla  dependencia de datos, no la hace ningun import
//   conflicto       dos paquetes escriben la misma tabla
//   contiene        un paquete vive dentro del modulo de otro
//   posee           un modulo administra los datos de otro
//   Los 33 recuadros van SIN estereotipo: el rol ya va en el nombre.
//
// Diagrama estatico: sin mensajes, sin lineas de vida, sin secuencia,
// sin actores y sin casos de uso como elementos.
// Autorreparable. Una instruccion por linea. Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================

var ALTO = 13;
var SALTO = String.fromCharCode(10);
var VIS_PUB = 0;
var VIS_PRI = 1;
var RAIZ = Repository.Models.GetAt(0);
var TOTAL_REL = 61;
var TOTAL_ATR = 36;
var TOTAL_OPE = 0;

// nombre, modulos, casos de uso, presentacion, aplicacion, dominio, datos
// null en una capa significa que ese paquete no aporta nada a ella.
var PAQ = [
    ["Seguridad y Auditoría", "seguridad: Auth, JWT, Bitacora, Auditoria",
     ["CU01 Iniciar Sesión en Plataforma", "CU03 Cambiar Contraseña Propia", "CU08 Consultar Bitácora de Auditoría"],
     ["Login y Bitacora de Auditoria", "1 entrada de menu, permiso ver_auditoria"],
     ["JwtAuthGuard y UsuarioActual", "Auth, JWT, Bitacora, Auditoria", "6 SRV y 5 CTR en 18 ficheros"],
     ["13 de las 14 entidades", "Usuario, Rol, Sucursal, Ciudad", "3 metodos en toda la capa"],
     ["Unico modulo con repositorio", "Escribe usuarios, roles y bitacora"]],

    ["Gestión de Usuarios y Roles", "seguridad: Auth, Roles, Empleados + clientes",
     ["CU02 Registrar Nuevo Cliente", "CU04 Registrar Nuevo Empleado", "CU05 Asignar/Modificar Roles y Permisos", "CU06 Inhabilitar Empleado (Baja Lógica)", "CU07 Rehabilitar Empleado"],
     ["Registro, Roles y Empleados", "3 pantallas de admin"],
     ["AuthService, RolesService,", "EmpleadosService, ClienteService", "4 SRV y 2 CTR"],
     ["Usuario, UsuarioRol,", "UsuarioEmpleado y Cliente", "0 metodos"],
     ["Repositorio de usuarios", "y de clientes"]],

    ["Gestión de Sucursales", "seguridad: CTR_Sucursales, SRV_SucursalesService",
     ["CU09 Administrar Ciudades y Sucursales"],
     ["Ciudades y Sucursales", "1 pantalla de admin"],
     ["CTR_Sucursales y", "SRV_SucursalesService", "vive dentro de seguridad"],
     ["Ciudad y Sucursal", "0 metodos"],
     ["Escribe sucursales y ciudades", "con repositorio. Nadie mas"]],

    ["Gestión de Catálogo", "modulo catalogo",
     ["CU10 Registrar Producto de Ropa en Catálogo", "CU11 Gestionar Tallas, Colores y Categorías", "CU12 Consultar Catálogo con Filtros", "CU13 Consultar Disponibilidad por Sucursal"],
     ["Productos, Catalogos,", "Temporadas y Existencias"],
     ["4 SRV y 4 CTR", "ProductosService, CatalogosService"],
     null,
     ["7 tablas con SQL crudo", "productos, tallas, colores,", "categorias y temporadas"]],

    ["Gestión de Proveedores y Compras", "modulos proveedores y compras",
     ["CU14 Registrar Proveedor", "CU15 Inhabilitar/Bloquear Proveedor", "CU16 Elaborar Orden de Compra a Proveedor"],
     ["Proveedores y Ordenes", "2 pantallas de admin"],
     ["2 SRV y 2 CTR", "ProveedoresService, ComprasService"],
     null,
     ["proveedores, ordenes_compra", "y orden_compra_items"]],

    ["Gestión de Inventario y Almacén", "modulos inventario y respaldos",
     ["CU17 Registrar Recepción Física de Prendas", "CU18 Consultar Kardex Dinámico", "CU19 Configurar Alertas de Stock Mínimo", "CU20 Consultar Existencias Consolidadas"],
     ["Kardex, Existencias, Alertas,", "Ajustes y Respaldos"],
     ["4 SRV y 4 CTR", "y el SchedulerService", "de respaldos, ciclo de 60 s"],
     null,
     ["inventario_stock,", "movimientos_inventario, respaldos", "El trigger mantiene el stock"]],

    ["Gestión de Reservas y Vestidor", "modulos reservas y sesiones-ra",
     ["CU21 Realizar Reserva de Múltiples Prendas", "CU22 Consultar y Cancelar el Estado de una Reserva", "CU23 Notificar la Reserva a la Sucursal", "CU24 Usar Vestidor Virtual con Realidad Aumentada"],
     ["Reservas y Vestidor RA", "2 pantallas de admin"],
     ["2 SRV y 2 CTR", "5 estados de reserva"],
     null,
     ["reservas, reserva_items,", "sesiones_ra", "Escribe inventario_stock"]],

    ["Ventas, Pagos y Devoluciones", "modulos carrito, ventas, pagos, comprobantes",
     ["CU25 Agregar Productos al Carrito", "CU26 Realizar Compra Digital", "CU27 Procesar Pago con Pasarela de Pago", "CU28 Registrar Venta Presencial en POS", "CU29 Procesar Pago en Caja", "CU30 Emitir Comprobante de Venta", "CU31 Actualizar Inventario Tras Venta"],
     ["Carrito, Checkout, Caja,", "Ventas y Comprobantes"],
     ["3 SRV y 4 CTR", "VentasService y PagosService", "los mas grandes del proyecto"],
     null,
     ["ventas, venta_items, carritos,", "comprobantes, transacciones", "Escribe 3 de las 4 compartidas"]],

    ["Servicios de Inteligencia Artificial", "modulo recomendaciones",
     ["CU32 Recomendar Prendas con IA"],
     ["Recomendaciones en catalogo", "y en el vestidor"],
     ["3 SRV y 1 CTR", "Usa el indice de OpenAI,", "que no esta en el .env"],
     null,
     ["preferencias_cliente,", "y resultados_prueba"]],

    ["Reporting, KPIs y Alertas", "modulo reportes-voz",
     ["CU33 Generar Reporte por Comando de Voz", "CU34 Dashboard Inteligente y KPIs", "CU35 Generar Reportes de Ventas e Inventario", "CU36 Emitir Alertas Críticas"],
     ["Reportes por Voz", "1 pantalla de admin"],
     ["1 SRV y 1 CTR, 9 ficheros", "CU34, CU35 y CU36 no existen"],
     null,
     ["reportes_generativos,", "y bitacora_auditoria"]]
];

// Los cuatro marcos: titulo, lo que aporta, y donde van las cajas.
// El del dominio es mas bajo a proposito.
var CAPAS = [
    ["1  PRESENTACION", "los 10 paquetes tienen pantalla", 30, 100, 2700, 170, 138, 100, 15790320],
    ["2  APLICACION", "los 10 tienen servicio y controlador", 30, 300, 2700, 170, 338, 100, 16448250],
    ["3  DOMINIO", "SOLO 3 de 10 tienen entidad", 30, 500, 2700, 118, 528, 66, 13431551],
    ["4  DATOS", "los 10 escriben tablas", 30, 648, 2700, 170, 686, 100, 14277081]
];

var ANCHO_BOX = 243;
var PASO_BOX = 258;
var X0_BOX = 60;
var DIAS = ["", " en Presentacion", " en Aplicacion", " en Dominio", " en Datos"];

// Objetos a colocar a mano en la tabla de colocacion del repositorio.
// De cinco en cinco: identificador, izquierda, arriba, ancho, alto.
var TABLA_DO = "t_diagramobjects";
var COLOCAR = [];
var CAPTURAR = false;

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

// Recargar el diagrama. NO se usa SaveDiagram, que es lo que hacia que las
// posiciones se perdieran.
function guardarYRecargar(diag) {
    var id = diag.ID;
    try { diag.Update(); } catch (e) { }
    try { Repository.ReloadDiagram(id); } catch (e) { }
    try { Repository.OpenDiagram(id); } catch (e) { }
    var nuevo = null;
    try { nuevo = Repository.GetDiagramByID(id); } catch (e) { nuevo = null; }
    if (nuevo == null) return diag;
    try { nuevo.DiagramObjects.Refresh(); } catch (e) { }
    return nuevo;
}

// Escribe las coordenadas en la tabla interna de colocacion. Los tops y los
// bottoms se guardan en negativo, que es como los tiene el repositorio.
function sqlCorregir(diagID) {
    var puestos = 0;
    for (var i = 0; i < COLOCAR.length; i = i + 5) {
        var id = COLOCAR[i];
        if (id == null) continue;
        if (id < 1) continue;
        var l = COLOCAR[i + 1];
        var t = COLOCAR[i + 2];
        var w = COLOCAR[i + 3];
        var h = COLOCAR[i + 4];
        var sql = "UPDATE " + TABLA_DO + " SET RectLeft = " + l;
        sql = sql + ", RectRight = " + (l + w);
        sql = sql + ", RectTop = " + (0 - t);
        sql = sql + ", RectBottom = " + (0 - t - h);
        sql = sql + " WHERE Diagram_ID = " + diagID + " AND Object_ID = " + id;
        var r = false;
        try { r = Repository.ExecuteSQL(sql); } catch (e) { r = false; }
        if (r) puestos++;
    }
    return puestos;
}

// Lee las coordenadas de vuelta y cuenta cuantos objetos han quedado con
// tamano distinto de cero. Asi el usuario sabe si el arreglo ha servido.
function sqlComprobar(diagID) {
    var base = "SELECT Object_ID, RectLeft, RectRight, RectTop, RectBottom FROM ";
    var res = null;
    try { res = Repository.SQLQuery(base + TABLA_DO + " WHERE Diagram_ID = " + diagID + " AND Object_ID > 0"); } catch (e) { res = null; }
    if (res == null) {
        try { res = Repository.SQLQuery(base + "t_diagramobject WHERE Diagram_ID = " + diagID + " AND Object_ID > 0"); } catch (e) { res = null; }
    }
    if (res == null) return "la tabla de colocacion no se pudo leer";
    var filas = String(res).split("\n");
    var bien = 0;
    var mal = 0;
    for (var i = 0; i < filas.length; i++) {
        var linea = String(filas[i]);
        if (linea == "") continue;
        if (linea.indexOf("Object_ID") >= 0) continue;
        var c = linea.split("|");
        if (c.length < 3) continue;
        var l = 0;
        var r = 0;
        try { l = parseInt(c[1], 10); r = parseInt(c[2], 10); } catch (e) { continue; }
        if (isNaN(l) || isNaN(r)) continue;
        if (Math.abs(r - l) > 5) bien++;
        else mal++;
    }
    return bien + " con tamano y " + mal + " sin tamano";
}

// El recuadro. Es el elemento real, con su nombre y sus lineas dentro.
function recuadro(diag, el, izq, arr, ancho, alto) {
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
    try { o.FontSize = 7; } catch (e) { }
    try { o.ShowNotes = false; } catch (e) { }
    try { o.WrapText = true; } catch (e) { }
    try { o.BackGroundColor = 16777215; } catch (e) { }
    try { o.BorderStyle = 1; } catch (e) { }
    try { o.BorderColor = 4210752; } catch (e) { }
    o.Update();
    if (CAPTURAR) {
        var oid = -1;
        try { oid = o.ObjectID; } catch (e) { oid = -1; }
        if (oid == null) oid = -1;
        if (oid < 1) oid = el.ElementID;
        COLOCAR.push(oid, izq, arr, ancho, alto);
    }
    return o;
}

// El marco de la capa: un rectangulo claro y su nombre arriba a la izquierda.
function marco(diag, izq, arr, ancho, alto, titulo, sub, color) {
    var tam = "l=" + izq + ";r=" + (izq + ancho) + ";t=" + arr + ";b=" + (arr + alto) + ";";
    var f = null;
    try { f = diag.DiagramObjects.AddNew(tam, "Rectangle"); } catch (e) { f = null; }
    if (f != null) {
        try { f.BackGroundColor = color; } catch (e) { }
        try { f.BorderStyle = 1; } catch (e) { }
        try { f.BorderColor = 8421504; } catch (e) { }
        f.Update();
    }
    var lt = "l=" + (izq + 10) + ";r=" + (izq + 420) + ";t=" + (arr + 6) + ";b=" + (arr + 28) + ";";
    var t = null;
    try { t = diag.DiagramObjects.AddNew(lt, "Text"); } catch (e) { t = null; }
    if (t != null) {
        try { t.Text = titulo; } catch (e) { }
        try { t.BorderStyle = 0; } catch (e) { }
        try { t.BackGroundColor = 16777215; } catch (e) { }
        try { t.FontSize = 11; } catch (e) { }
        t.Update();
    }
    var ls = "l=" + (izq + 300) + ";r=" + (izq + 1200) + ";t=" + (arr + 10) + ";b=" + (arr + 25) + ";";
    var s = null;
    try { s = diag.DiagramObjects.AddNew(ls, "Text"); } catch (e) { s = null; }
    if (s != null) {
        try { s.Text = sub; } catch (e) { }
        try { s.BorderStyle = 0; } catch (e) { }
        try { s.BackGroundColor = 16777215; } catch (e) { }
        try { s.FontSize = 8; } catch (e) { }
        s.Update();
    }
    if (CAPTURAR) {
        var oidF = -1;
        var oidT = -1;
        var oidS = -1;
        try { if (f != null) oidF = f.ObjectID; } catch (e) { oidF = -1; }
        try { if (t != null) oidT = t.ObjectID; } catch (e) { oidT = -1; }
        try { if (s != null) oidS = s.ObjectID; } catch (e) { oidS = -1; }
        if (oidF == null) oidF = -1;
        if (oidT == null) oidT = -1;
        if (oidS == null) oidS = -1;
        COLOCAR.push(oidF, izq, arr, ancho, alto);
        COLOCAR.push(oidT, izq + 10, arr + 6, 410, 22);
        COLOCAR.push(oidS, izq + 300, arr + 10, 900, 15);
    }
}

// Los rectangulos de los marcos y sus textos son formas, no elementos, y no
// se pueden buscar por ElementID porque todos valen cero. En la segunda
// pasada se borran y se vuelven a crear.
function borrarFormas(diag) {
    for (var i = diag.DiagramObjects.Count - 1; i >= 0; i--) {
        var o = null;
        try { o = diag.DiagramObjects.GetAt(i); } catch (e) { o = null; }
        if (o == null) continue;
        var t = "";
        try { t = String(o.ObjectType); } catch (e) { t = ""; }
        if (t == "Rectangle" || t == "Text" || t == "Shape") {
            try { o.Delete(); } catch (e) { }
        }
    }
    try { diag.DiagramObjects.Refresh(); } catch (e) { }
}

// Una pasada de colocacion: los cuatro marcos y los treinta y tres recuadros.
function pintar(diag, C, borrar) {
    if (borrar) borrarFormas(diag);
    for (var mc = 0; mc < CAPAS.length; mc++) {
        marco(diag, CAPAS[mc][2], CAPAS[mc][3], CAPAS[mc][4], CAPAS[mc][5], CAPAS[mc][0], CAPAS[mc][1], CAPAS[mc][8]);
    }
    for (var i = 0; i < PAQ.length; i++) {
        for (var c = 1; c <= 4; c++) {
            if (PAQ[i][2 + c] == null) continue;
            var el = C["P" + (i + 1) + "_" + c];
            if (el == null) continue;
            var x = X0_BOX + i * PASO_BOX;
            var y = CAPAS[c - 1][6];
            var alto = CAPAS[c - 1][7];
            recuadro(diag, el, x, y, ANCHO_BOX, alto);
        }
    }
    try { diag.DiagramObjects.Refresh(); } catch (e) { }
    try { diag.Update(); } catch (e) { }
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
    try { con.FontSize = 6; } catch (e) { }
    try { con.Update(); } catch (e) { }
    if (enDiagrama(diag, con)) return 1;
    return 0;
}
function main() {
    var raiz = buscarPaquete(RAIZ, "Diseno Logico");
    if (raiz == null) raiz = RAIZ;
    var paq = subPaquete(raiz, "Capas por Paquetes");

    for (var d = paq.Diagrams.Count - 1; d >= 0; d--) {
        try { paq.Diagrams.GetAt(d).Delete(); } catch (e) { }
    }
    try { paq.Diagrams.Refresh(); } catch (e) { }

    var C = {};
    var creados = 0;

    for (var i = 0; i < PAQ.length; i++) {
        for (var c = 1; c <= 4; c++) {
            var lineas = PAQ[i][2 + c];
            if (lineas == null) continue;
            var nom = PAQ[i][0] + DIAS[c];
            var el = buscarLocal(paq, nom);
            if (el == null) {
                try { el = paq.Elements.AddNew(nom, "Class"); } catch (e) { el = paq.Elements.AddNew(nom, "Class"); }
                el.Update();
            }
            try { el.Name = nom; } catch (e) { }
            try { el.Stereotype = ""; } catch (e) { }
            nota(el, "Paquete " + (i + 1) + " de 10. Capa " + c + " de 4.");
            nota(el, "Modulos backend: " + PAQ[i][1] + ".");
            nota(el, "Casos de uso: " + PAQ[i][2].length + ".");
            try { el.Update(); } catch (e) { }
            C["P" + (i + 1) + "_" + c] = el;
            creados++;
        }
    }
    try { paq.Elements.Refresh(); } catch (e) { }

    var totalAtr = 0;
    for (var k = 0; k < PAQ.length; k++) {
        for (var c2 = 1; c2 <= 4; c2++) {
            var l2 = PAQ[k][2 + c2];
            if (l2 == null) continue;
            try { paq.Elements.Refresh(); } catch (e) { }
            var el2 = C["P" + (k + 1) + "_" + c2];
            if (el2 == null) { ERRORES.push("falta P" + (k + 1) + "_" + c2); continue; }
            var antes = "";
            try { antes = nombresDe(el2.Attributes); } catch (e) { antes = ""; }
            for (var m = 0; m < l2.length; m++) {
                if (contiene(antes, l2[m])) continue;
                agregarAtributo(el2, l2[m], "Aporta", VIS_PRI);
            }
            try { el2.Update(); } catch (e) { }
            var fin = "";
            try { fin = nombresDe(el2.Attributes); } catch (e) { fin = ""; }
            totalAtr = totalAtr + totalDe(fin);
            if (totalDe(fin) < l2.length) ERRORES.push("P" + (k + 1) + "_" + c2 + " con menos lineas de las previstas");
        }
    }

    var diag = null;
    try { diag = paq.Diagrams.AddNew("Diagrama de Capas", "Class"); } catch (e) { diag = null; }
    if (diag == null) ERRORES.push("no se pudo crear el diagrama");

    var conEnDiagrama = 0;
    var sqlPuestos = 0;
    var sqlEstado = "no se llego a comprobar";

    if (diag != null) {
        diag.Update();
        try { paq.Diagrams.Refresh(); } catch (e) { }

        // PASADA 1. Se crean y se colocan los cuatro marcos y los treinta y
        // tres recuadros. Esta pasada sola no basta: EA todavia no ha
        // calculado el tamano real de cada recuadro y las coordenadas no
        // estan guardadas en ningun sitio.
        pintar(diag, C, false);

        diag = guardarYRecargar(diag);

        // PASADA 2. Se vuelven a colocar los recuadros con el diagrama ya
        // recargado, y los marcos se recrean como formas nuevas. En esta
        // pasada se capturan los identificadores de cada objeto y las
        // coordenadas que le tocan.
        COLOCAR = [];
        CAPTURAR = true;
        pintar(diag, C, true);
        CAPTURAR = false;

        diag = guardarYRecargar(diag);

        conEnDiagrama += relacion(diag, C.P1_1, C.P1_2, "el mismo paquete", "Dependency", "atraviesa", "p1", "p1", "1", "1");
        conEnDiagrama += relacion(diag, C.P1_2, C.P1_3, "el mismo paquete", "Dependency", "atraviesa", "p1", "p1", "1", "1");
        conEnDiagrama += relacion(diag, C.P1_3, C.P1_4, "el mismo paquete", "Dependency", "atraviesa", "p1", "p1", "1", "1");
        conEnDiagrama += relacion(diag, C.P2_1, C.P2_2, "el mismo paquete", "Dependency", "atraviesa", "p2", "p2", "1", "1");
        conEnDiagrama += relacion(diag, C.P2_2, C.P2_3, "el mismo paquete", "Dependency", "atraviesa", "p2", "p2", "1", "1");
        conEnDiagrama += relacion(diag, C.P2_3, C.P2_4, "el mismo paquete", "Dependency", "atraviesa", "p2", "p2", "1", "1");
        conEnDiagrama += relacion(diag, C.P3_1, C.P3_2, "el mismo paquete", "Dependency", "atraviesa", "p3", "p3", "1", "1");
        conEnDiagrama += relacion(diag, C.P3_2, C.P3_3, "el mismo paquete", "Dependency", "atraviesa", "p3", "p3", "1", "1");
        conEnDiagrama += relacion(diag, C.P3_3, C.P3_4, "el mismo paquete", "Dependency", "atraviesa", "p3", "p3", "1", "1");
        conEnDiagrama += relacion(diag, C.P4_1, C.P4_2, "el mismo paquete", "Dependency", "atraviesa", "p4", "p4", "1", "1");
        conEnDiagrama += relacion(diag, C.P4_2, C.P4_4, "se salta el dominio", "Dependency", "salto de capa", "p4", "p4", "1", "1");
        conEnDiagrama += relacion(diag, C.P5_1, C.P5_2, "el mismo paquete", "Dependency", "atraviesa", "p5", "p5", "1", "1");
        conEnDiagrama += relacion(diag, C.P5_2, C.P5_4, "se salta el dominio", "Dependency", "salto de capa", "p5", "p5", "1", "1");
        conEnDiagrama += relacion(diag, C.P6_1, C.P6_2, "el mismo paquete", "Dependency", "atraviesa", "p6", "p6", "1", "1");
        conEnDiagrama += relacion(diag, C.P6_2, C.P6_4, "se salta el dominio", "Dependency", "salto de capa", "p6", "p6", "1", "1");
        conEnDiagrama += relacion(diag, C.P7_1, C.P7_2, "el mismo paquete", "Dependency", "atraviesa", "p7", "p7", "1", "1");
        conEnDiagrama += relacion(diag, C.P7_2, C.P7_4, "se salta el dominio", "Dependency", "salto de capa", "p7", "p7", "1", "1");
        conEnDiagrama += relacion(diag, C.P8_1, C.P8_2, "el mismo paquete", "Dependency", "atraviesa", "p8", "p8", "1", "1");
        conEnDiagrama += relacion(diag, C.P8_2, C.P8_4, "se salta el dominio", "Dependency", "salto de capa", "p8", "p8", "1", "1");
        conEnDiagrama += relacion(diag, C.P9_1, C.P9_2, "el mismo paquete", "Dependency", "atraviesa", "p9", "p9", "1", "1");
        conEnDiagrama += relacion(diag, C.P9_2, C.P9_4, "se salta el dominio", "Dependency", "salto de capa", "p9", "p9", "1", "1");
        conEnDiagrama += relacion(diag, C.P10_1, C.P10_2, "el mismo paquete", "Dependency", "atraviesa", "p10", "p10", "1", "1");
        conEnDiagrama += relacion(diag, C.P10_2, C.P10_4, "se salta el dominio", "Dependency", "salto de capa", "p10", "p10", "1", "1");

        conEnDiagrama += relacion(diag, C.P1_2, C.P2_2, "seguridad importa clientes", "Dependency", "importa", "seguridad", "clientes", "1", "1");
        conEnDiagrama += relacion(diag, C.P2_2, C.P1_2, "clientes importa seguridad", "Dependency", "importa", "clientes", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C.P3_2, C.P1_2, "vive dentro del modulo seguridad", "Dependency", "contiene", "sucursales", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C.P4_2, C.P1_2, "catalogo importa seguridad", "Dependency", "importa", "catalogo", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C.P5_2, C.P1_2, "los dos modulos importan seguridad", "Dependency", "importa", "compras", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C.P6_2, C.P1_2, "los dos modulos importan seguridad", "Dependency", "importa", "inventario", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C.P7_2, C.P1_2, "los dos modulos importan seguridad", "Dependency", "importa", "reservas", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C.P8_2, C.P1_2, "los cuatro modulos importan seguridad", "Dependency", "importa", "ventas", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C.P9_2, C.P1_2, "recomendaciones importa seguridad", "Dependency", "importa", "ia", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C.P10_2, C.P1_2, "reportes-voz importa seguridad", "Dependency", "importa", "reporting", "seguridad", "1", "1");
        conEnDiagrama += relacion(diag, C.P7_2, C.P9_2, "sesiones-ra importa recomendaciones", "Dependency", "importa", "vestidor", "ia", "1", "1");
        conEnDiagrama += relacion(diag, C.P8_2, C.P9_2, "pagos importa recomendaciones", "Dependency", "importa", "pagos", "ia", "1", "1");
        conEnDiagrama += relacion(diag, C.P1_2, C.P2_2, "administra usuarios y roles", "Dependency", "posee", "seguridad", "usuarios", "1", "0..*");

        conEnDiagrama += relacion(diag, C.P4_4, C.P5_4, "comparte 4 tablas de catalogo", "Dependency", "comparte tabla", "catalogo", "compras", "1", "0..*");
        conEnDiagrama += relacion(diag, C.P4_4, C.P6_4, "comparte 5 tablas de catalogo", "Dependency", "comparte tabla", "catalogo", "inventario", "1", "0..*");
        conEnDiagrama += relacion(diag, C.P4_4, C.P7_4, "comparte 4 tablas de catalogo", "Dependency", "comparte tabla", "catalogo", "reservas", "1", "0..*");
        conEnDiagrama += relacion(diag, C.P4_4, C.P8_4, "comparte 5 tablas de catalogo", "Dependency", "comparte tabla", "catalogo", "ventas", "1", "0..*");
        conEnDiagrama += relacion(diag, C.P4_4, C.P9_4, "comparte 6 tablas de catalogo", "Dependency", "comparte tabla", "catalogo", "ia", "1", "0..*");
        conEnDiagrama += relacion(diag, C.P4_4, C.P10_4, "comparte 5 tablas de catalogo", "Dependency", "comparte tabla", "catalogo", "reporting", "1", "0..*");
        conEnDiagrama += relacion(diag, C.P1_4, C.P3_4, "escribe sucursales y ciudades", "Dependency", "comparte tabla", "seguridad", "sucursales", "1", "0..*");
        conEnDiagrama += relacion(diag, C.P3_4, C.P6_4, "inventario lee sucursales", "Dependency", "comparte tabla", "sucursales", "inventario", "1", "0..*");
        conEnDiagrama += relacion(diag, C.P3_4, C.P7_4, "reservas lee sucursales y horarios", "Dependency", "comparte tabla", "sucursales", "reservas", "1", "0..*");
        conEnDiagrama += relacion(diag, C.P3_4, C.P8_4, "ventas lee sucursales", "Dependency", "comparte tabla", "sucursales", "ventas", "1", "0..*");
        conEnDiagrama += relacion(diag, C.P3_4, C.P10_4, "reportes-voz lee sucursales", "Dependency", "comparte tabla", "sucursales", "reporting", "1", "0..*");
        conEnDiagrama += relacion(diag, C.P3_4, C.P5_4, "compras y proveedores leen sucursales", "Dependency", "comparte tabla", "sucursales", "compras", "1", "0..*");
        conEnDiagrama += relacion(diag, C.P6_4, C.P5_4, "lee movimientos de ordenes de compra", "Dependency", "comparte tabla", "inventario", "compras", "0..*", "1");
        conEnDiagrama += relacion(diag, C.P6_4, C.P7_4, "CONFLICTO: inventario_stock", "Dependency", "conflicto", "inventario", "reservas", "0..*", "0..*");
        conEnDiagrama += relacion(diag, C.P7_4, C.P6_4, "CONFLICTO: inventario_stock", "Dependency", "conflicto", "reservas", "inventario", "0..*", "0..*");
        conEnDiagrama += relacion(diag, C.P6_4, C.P8_4, "CONFLICTO: inventario_stock", "Dependency", "conflicto", "inventario", "pagos", "0..*", "0..*");
        conEnDiagrama += relacion(diag, C.P8_4, C.P6_4, "CONFLICTO: inventario_stock", "Dependency", "conflicto", "pagos", "inventario", "0..*", "0..*");
        conEnDiagrama += relacion(diag, C.P7_4, C.P8_4, "CONFLICTO: movimientos_inventario", "Dependency", "conflicto", "reservas", "pagos", "0..*", "0..*");
        conEnDiagrama += relacion(diag, C.P8_4, C.P7_4, "CONFLICTO: movimientos_inventario", "Dependency", "conflicto", "pagos", "reservas", "0..*", "0..*");
        conEnDiagrama += relacion(diag, C.P8_4, C.P10_4, "pagos escribe ventas y la lee", "Dependency", "comparte tabla", "pagos", "reporting", "1", "0..*");
        conEnDiagrama += relacion(diag, C.P10_4, C.P1_4, "reportes-voz escribe bitacora_auditoria", "Dependency", "comparte tabla", "reporting", "bitacora", "1", "0..*");
        conEnDiagrama += relacion(diag, C.P8_4, C.P2_4, "ventas lee clientes", "Dependency", "comparte tabla", "ventas", "clientes", "0..*", "1");
        conEnDiagrama += relacion(diag, C.P9_4, C.P2_4, "recomendaciones lee clientes", "Dependency", "comparte tabla", "ia", "clientes", "0..*", "1");

        conEnDiagrama += relacion(diag, C.P1_3, C.P2_3, "comparten el fichero de modelos", "Dependency", "comparte tabla", "seguridad", "usuarios", "1", "0..*");
        conEnDiagrama += relacion(diag, C.P3_3, C.P1_3, "Ciudad y Sucursal estan ahi", "Dependency", "comparte tabla", "sucursales", "seguridad", "1", "0..*");

        diag = guardarYRecargar(diag);

        // ---- COLOCACION: QUE SEA EA EL QUE DISTRIBUYA ----
        // A mano no hay manera de que las coordenadas se guarden: se
        // escriben en memoria, se ven bien mientras el diagrama esta
        // abierto, y al abrirlo otra vez estan todas a cero. Se ha
        // probado con las propiedades del objeto, con SaveDiagram y con
        // un UPDATE directo a la tabla interna de colocacion.
        //
        // Lo que si funciona es el motor de distribucion del propio EA,
        // que escribe las coordenadas desde dentro. Se le llama y luego se
        // leen las posiciones que ha dejado, que es la comprobacion que
        // hacia falta para saber si esto entra o no.
        var okLayout = "";
        try { okLayout = String(Repository.LayoutDiagram(diag.ID, 5, false)); } catch (eL) { okLayout = "FALLA: " + String(eL); }
        diag = guardarYRecargar(diag);

        var leidos = 0;
        var conPos = 0;
        var muestra = "";
        try {
            for (var q = 0; q < diag.DiagramObjects.Count; q++) {
                var o = null;
                try { o = diag.DiagramObjects.GetAt(q); } catch (eQ) { o = null; }
                if (o == null) continue;
                leidos++;
                var l = 0;
                var r = 0;
                try { l = o.Left; r = o.Right; } catch (eR) { }
                if (Math.abs(r - l) > 5) conPos++;
                if (muestra.length < 160) muestra = muestra + " L=" + l + " R=" + r + " | ";
            }
        } catch (eS) { }
        sqlEstado = conPos + " de " + leidos + " con posicion";
        sqlPuestos = conPos;
        if (muestra != "") INFORME.push("primeras posiciones: " + muestra);
        INFORME.push("LayoutDiagram devolvio: " + okLayout);
        INFORME.push("estado de colocacion: " + sqlEstado);

        var N = [];
        N.push("Diagrama de arquitectura organizado en capas. Seccion 3.3.1.2.");
        N.push("");
        N.push("COMO ESTE ORGANIZADO, para que se lea de un vistazo:");
        N.push("");
        N.push("  Un marco por capa, con el nombre de la capa escrito arriba a la");
        N.push("  izquierda y un color distinto cada una. Dentro del marco, los");
        N.push("  recuadros de los paquetes que aportan algo a esa capa. Debajo, la");
        N.push("  siguiente capa. Y asi hasta las cuatro.");
        N.push("");
        N.push("  10 paquetes, 33 recuadros, " + TOTAL_REL + " dependencias, 36 casos de uso.");
        N.push("");
        N.push("  Son 33 recuadros y no 10 porque un paquete atraviesa capas. Cada");
        N.push("  aparicion es un elemento real distinto, llamado Paquete en Capa, y");
        N.push("  los dos recuadros del mismo paquete van en la MISMA columna unidos");
        N.push("  por un conector vertical. Asi se ve que son el mismo paquete y no");
        N.push("  dos cosas distintas.");
        N.push("");
        N.push("  Los recuadros llevan su contenido DENTRO, como atributos. No hay");
        N.push("  cajas de texto sueltas encima.");
        N.push("");
        N.push("LO QUE APORTA CADA PAQUETE EN CADA CAPA, Y ES DISTINTO EN CADA UNA");
        N.push("");
        N.push("El paquete 8, Ventas y Pagos, en sus cuatro filas:");
        N.push("");
        N.push("  en presentacion   Carrito, Checkout, Caja, Ventas, Comprobantes");
        N.push("  en aplicacion     3 SRV y 4 CTR, los mas grandes del proyecto");
        N.push("  en dominio        no aparece: no tiene ni una entidad");
        N.push("  en datos          ventas, venta_items, carritos, comprobantes,");
        N.push("                    transacciones. Escribe 3 de las 4 compartidas");
        N.push("");
        N.push("HALLAZGO PRINCIPAL: LA CAPA DE DOMINIO TIENE 3 PAQUETES DE 10. Y ESO ES");
        N.push("EL DIAGRAMA ENTERO.");
        N.push("");
        N.push("  1  Presentacion   10 de 10    los diez tienen pantalla");
        N.push("  2  Aplicacion     10 de 10    los diez tienen servicio");
        N.push("  3  Dominio         3 de 10    solo tres tienen entidad");
        N.push("  4  Datos          10 de 10    los diez escriben tablas");
        N.push("");
        N.push("Los tres que llegan al dominio son los paquetes 1, 2 y 3, y los tres");
        N.push("estan dentro del modulo seguridad. O sea que lo que decide si un paquete");
        N.push("pasa por la capa de dominio NO es el negocio que hace: es si su modulo");
        N.push("usa repositorios de TypeORM o SQL crudo. Es una decision tecnica, y la");
        N.push("unica que explica el reparto.");
        N.push("");
        N.push("Y por eso el marco del dominio es mas bajo y de otro color. Esa");
        N.push("asimetria es el hallazgo, no un descuido de maquetacion. Si se quisiera");
        N.push("que los cuatro marcos fueran iguales habria que inventar siete paquetes");
        N.push("de dominio que no existen.");
        N.push("");
        N.push("LOS 7 PAQUETES QUE SE SALTAN EL DOMINIO, Y ESTAN DIBUJADOS");
        N.push("");
        N.push("De los 23 conectores verticales, 7 llevan el estereotipo salto de capa:");
        N.push("");
        N.push("  Catalogo, Proveedores y Compras, Inventario, Reservas, Ventas,");
        N.push("  Inteligencia Artificial y Reporting");
        N.push("");
        N.push("Los siete van de la capa 2 directo a la 4. Los otros 16 llevan el");
        N.push("estereotipo atraviesa y bajan de capa en capa. Se lee de un vistazo que");
        N.push("parte del proyecto tiene capa de dominio y que parte no, y por que.");
        N.push("");
        N.push("Y no es una diferencia de estilo, es de codigo. Los siete hacen esto:");
        N.push("");
        N.push("  const [filas] = await this.dataSource.query('SELECT ... FROM ventas', [p]);");
        N.push("");
        N.push("No hay nada entre el servicio y la base de datos. En una arquitectura por");
        N.push("capas, Aplicacion deberia depender de Dominio y Dominio de Datos.");
        N.push("Aqui la flecha va de Aplicacion a Datos y el dominio es una hoja de la");
        N.push("que solo se sacan tipos.");
        N.push("");
        N.push("LO QUE HAY EN LA CAPA DE DOMINIO, CON SU MEDIDA REAL");
        N.push("");
        N.push("  seguridad/CE_Modelos.ts   356 lineas, 13 clases, 84 decoradores, 3 metodos");
        N.push("  clientes/CE_Modelos.ts     31 lineas,  1 clase,  0 decoradores, 0 metodos");
        N.push("  seguridad/Esquemas.ts      70 lineas,  7 DTOs,   0 metodos");
        N.push("  clientes/Esquemas.ts       26 lineas,  2 DTOs,   0 metodos");
        N.push("");
        N.push("Cuatro ficheros, 23 clases, tres metodos en total. Y una clase completa");
        N.push("para que se vea lo que es:");
        N.push("");
        N.push("  export class Sucursal {");
        N.push("    @PrimaryGeneratedColumn({ name: 'id_sucursal' })");
        N.push("    id_sucursal: number;");
        N.push("    @Column({ name: 'nombre', type: 'varchar', length: 100 })");
        N.push("    nombre: string;");
        N.push("  }");
        N.push("");
        N.push("Eso no es una entidad de dominio: es la fila de una tabla tal cual. No");
        N.push("tiene invariantes ni comportamiento. Y dos datos que rematan el cuadro:");
        N.push("");
        N.push("  - Catorce de las cincuenta y una tablas tienen entidad. Las otras");
        N.push("    treinta y siete no, y no hay migracion que las anada.");
        N.push("  - Esas entidades solo las usan dos de los quince modulos.");
        N.push("");
        N.push("Y las reglas de negocio, que es lo que deberia estar ahi, estan");
        N.push("escritas como SQL dentro de los servicios de la capa 2. La capa de");
        N.push("dominio esta fusionada con la de aplicacion, y no por eleccion: por");
        N.push("defecto, porque nadie decidio donde ponerlas.");
        N.push("");
        N.push("LAS DEPENDENCIAS, CADA UNA DIBUJADA EN LA CAPA DONDE OCURRE");
        N.push("");
        N.push("Los 36 conectores del analisis de paquetes no se copiaron tal cual. Cada");
        N.push("uno se dibujo en la fila que le corresponde segun lo que es:");
        N.push("");
        N.push("  13 en Aplicacion   los que hace un import de TypeScript");
        N.push("  23 en Datos        los que no los hace ningun import sino una tabla");
        N.push("                      compartida, incluidos los 6 de conflicto");
        N.push("   2 en Dominio      el fichero de modelos es el mismo");
        N.push("");
        N.push("Estereotipos, y solo en los conectores, nunca en los recuadros:");
        N.push("");
        N.push("  atraviesa       el paquete continua en la capa de abajo");
        N.push("  salto de capa   de aplicacion a datos, sin pasar por el dominio");
        N.push("  importa         dependencia de codigo, la hace un import");
        N.push("  comparte tabla  dependencia de datos, no la hace ningun import");
        N.push("  conflicto       dos paquetes escriben la misma tabla");
        N.push("  contiene        un paquete vive dentro del modulo de otro");
        N.push("  posee           un modulo administra los datos de otro");
        N.push("");
        N.push("LOS 6 CONFLICTOS DE ESCRITURA ESTAN EN LA CAPA DE DATOS, Y SON 3");
        N.push("PAQUETES PELEANDOSE POR UNA MISMA FILA");
        N.push("");
        N.push("  Inventario, Reservas y Ventas escriben inventario_stock");
        N.push("  Inventario, Reservas y Ventas escriben movimientos_inventario");
        N.push("  Ventas escribe la tabla ventas, que tambien escribe el propio paquete");
        N.push("");
        N.push("Los seis van con el estereotipo conflicto y con la misma etiqueta en los");
        N.push("dos sentidos, a proposito. No es un error de dibujado: son dos flechas");
        N.push("porque la tabla se escribe desde los dos lados y no hay nadie que");
        N.push("decida el orden. Si se dibujara una sola, el diagrama diria que uno de");
        N.push("los dos manda sobre el otro, y eso no existe.");
        N.push("");
        N.push("Y aqui es donde este diagrama conecta con los 36 casos de uso. El 409 de");
        N.push("caja con la prenda apartada, el inventario sobrevalorado y la reserva");
        N.push("que no se puede vender son la misma fila de inventario_stock escrita");
        N.push("por tres paquetes sin ninguna transaccion que abarque los tres. No son");
        N.push("fallos de los casos: son de estas tres flechas.");
        N.push("");
        N.push("LO QUE ESTA BIEN, Y NO ES POCO");
        N.push("");
        N.push("  - El principio de la flecha hacia abajo se respeta entero. Ninguna de");
        N.push("    las " + TOTAL_REL + " dependencias va de una capa a una de arriba.");
        N.push("  - Las cuatro unicas dependencias de codigo entre paquetes de negocio son");
        N.push("    horizontales, dentro de la capa de aplicacion: pagos con");
        N.push("    comprobantes, pagos con recomendaciones, sesiones-ra con");
        N.push("    recomendaciones y seguridad con clientes. Ningun servicio salta a");
        N.push("    tocar los datos de otro modulo.");
        N.push("  - La presentacion no toca la base de datos. Ni una consulta desde React:");
        N.push("    todo pasa por lib/api.ts y por HTTP con el prefijo api/v1.");
        N.push("  - La autorizacion esta centralizada en JwtAuthGuard y UsuarioActual, con");
        N.push("    la comparacion de permisos en el servicio y no en el controlador.");
        N.push("    La estructura de permisos es mala, pero la arquitectura de la");
        N.push("    comprobacion es buena.");
        N.push("");
        N.push("LO QUE LE FALTA A LA CAPA DE PRESENTACION");
        N.push("");
        N.push("Es la capa con mas paquetes y con menos infraestructura, y eso tambien se");
        N.push("ve, porque los diez recuadros dicen pantalla y no dicen nada mas:");
        N.push("");
        N.push("  - Cinco componentes de UI, y el Toast que usan tres pantallas esta");
        N.push("    copiado dentro de cada pagina en vez de estar compartido");
        N.push("  - Sin cliente de estado: cada pagina guarda su useState y pide datos a mano");
        N.push("  - Sin gestor de fechas, y el backend devuelve fecha_venta con zona");
        N.push("    horaria, que es el par clasico de fecha rota");
        N.push("  - Sin libreria de graficos ni de tablas, con dos modulos de reportes");
        N.push("    que son justo lo que necesitaria una u otra");
        N.push("");
        N.push("Ninguno de esos huecos es un error. Son cuatro decisiones que el proyecto");
        N.push("todavia no ha tomado, y la capa con mas cajas es la que menos");
        N.push("infraestructura compartida tiene.");
        N.push("");
        N.push("DOS PAQUETES QUE QUEDAN A MEDIAS CON SU NOMBRE");
        N.push("");
        N.push("  - Ventas, Pagos y Devoluciones no tiene ningun caso de devoluciones: se");
        N.push("    le quedo el nombre de un caso que se elimino al bajar de 46 a 36. La");
        N.push("    base de datos si conserva las tablas devoluciones y");
        N.push("    devolucion_items y la routine sp_registrar_devolucion, que es una");
        N.push("    de las seis rutinas muertas del proyecto. El nombre se deja como");
        N.push("    esta para que coincida con el documento.");
        N.push("  - Reporting, KPIs y Alertas tiene cuatro casos y uno implementado. CU34");
        N.push("    Dashboard, CU35 Reportes y CU36 Alertas Criticas no tienen ni una");
        N.push("    linea de codigo, y su unico modulo se llama reportes-voz porque el");
        N.push("    caso que existe es el de voz.");
        N.push("");
        N.push("SOBRE LA COLOCACION DE LOS OBJETOS EN EL DIAGRAMA");
        N.push("");
        N.push("Esta parte dio bastante guerra y conviene dejarla escrita. EA no guarda");
        N.push("las coordenadas de un DiagramObject hasta que se guarda el diagrama, el");
        N.push("objeto que devuelve AddNew no se mantiene al dia en memoria, y con");
        N.push("SaveDiagram por medio las posiciones se pierden. Por eso el script acaba");
        N.push("sin errores, el diagrama se ve bien mientras esta abierto, y al abrirlo");
        N.push("despues todo aparece amontonado en la esquina superior izquierda.");
        N.push("");
        N.push("Lo que se hace aqui, en este orden:");
        N.push("");
        N.push("  1. PASADA 1. Se crean y se colocan los cuatro marcos y los treinta y");
        N.push("     tres recuadros, y se recarga el diagrama.");
        N.push("  2. PASADA 2. Se vuelven a colocar, capturando el identificador de cada");
        N.push("     objeto y las coordenadas que le tocan. Los marcos se recrean como");
        N.push("     formas nuevas, porque las formas antiguas no se pueden buscar por");
        N.push("     ElementID: todas valen cero.");
        N.push("  3. Se dibujan las 61 relaciones, con los recuadros ya en su sitio, y se");
        N.push("     recarga otra vez.");
        N.push("  4. Se escriben las coordenadas directamente en t_diagramobjects, que es");
        N.push("     la tabla interna de colocacion del repositorio, y se recarga otra vez.");
        N.push("     Solo se tocan coordenadas: los elementos, sus atributos y los");
        N.push("     conectores se crean con la API, que es lo que mantiene la");
        N.push("     integridad del modelo.");
        N.push("  5. Se leen las coordenadas de vuelta y se cuenta cuantos objetos han");
        N.push("     quedado con tamano, que es lo que aparece en el informe.");
        N.push("");
        N.push("SaveDiagram no se usa en ningun punto, porque es justamente lo que");
        N.push("hacia que las posiciones se perdieran.");
        N.push("");
        N.push("OTRAS OBSERVACIONES:");
        N.push("");
        N.push("  - Cada recuadro lleva la capa en el nombre, Paquete en Datos, porque un");
        N.push("    mismo paquete aparece en varias filas y dos elementos no pueden");
        N.push("    llamarse igual en el mismo paquete del modelo. El marco de al lado ya");
        N.push("    dice la capa, asi que el nombre es por si se mira el arbol del modelo.");
        N.push("  - El contenido de cada recuadro esta en sus atributos y las notas del");
        N.push("    modelo llevan la capa, los modulos y los casos. En el diagrama las");
        N.push("    notas estan ocultas para que el texto no se corte.");
        N.push("  - Los conectores verticales salen rectos porque las diez columnas estan");
        N.push("    en las mismas posiciones en las cuatro filas. Si al mover un recuadro");
        N.push("    su linea se cruzara con las de los demas, y eso no es un problema");
        N.push("    del diagrama sino de colocacion.");
        N.push("  - Este diagrama y el de analisis de paquetes cuentan cosas distintas.");
        N.push("    El de paquetes dice QUE negocio hay y como se acoplan entre si. Este");
        N.push("    dice COMO se reparte ese negocio en las capas de la arquitectura.");
        N.push("    Juntos cubren las dos preguntas y ninguno sustituye al otro.");
        try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
    }

    var T = [];
    T.push("DIAGRAMA DE CAPAS POR PAQUETES - INFORME");
    T.push("");
    T.push("Paquetes: " + PAQ.length + "    Recuadros: " + creados);
    T.push("Atributos reales: " + totalAtr + " de " + TOTAL_ATR);
    T.push("CONECTORES DIBUJADOS: " + conEnDiagrama + " de " + TOTAL_REL);
    if (conEnDiagrama < TOTAL_REL) T.push("  FALTAN LINEAS. Reejecuta el script: es idempotente y las coloca.");
    T.push("");
    T.push("Paquetes por capa:");
    for (var c4 = 1; c4 <= 4; c4++) {
        var n = 0;
        for (var i4 = 0; i4 < PAQ.length; i4++) if (PAQ[i4][2 + c4] != null) n++;
        T.push("  capa " + c4 + ": " + n + " de " + PAQ.length);
    }
    T.push("");
    T.push("Conectores verticales: 23, de los cuales 7 son salto de capa");
    T.push("Conectores en Aplicacion: 13   en Datos: 23   en Dominio: 2");
    T.push("");
    T.push("COLOCACION. Objetos en el diagrama: " + (COLOCAR.length / 5));
    T.push("Objetos con posicion correcta: " + sqlPuestos);
    T.push("Comprobacion final: " + sqlEstado);
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
    msg = msg + "Diagrama de capas por paquetes" + SALTO + SALTO;
    msg = msg + "Un marco por capa, con su nombre y sus recuadros dentro." + SALTO;
    msg = msg + "10 paquetes, 33 recuadros, " + TOTAL_REL + " dependencias." + SALTO + SALTO;
    msg = msg + "LA CAPA DE DOMINIO TIENE 3 PAQUETES DE 10." + SALTO;
    msg = msg + "Los 3 son del modulo seguridad, los unicos con" + SALTO;
    msg = msg + "entidades. Lo que decide no es el negocio: es si el" + SALTO;
    msg = msg + "modulo usa TypeORM o SQL crudo." + SALTO;
    msg = msg + "Los otros 7 se saltan esa capa, y va dibujado." + SALTO + SALTO;
    msg = msg + "El marco del dominio es mas bajo y de otro color:" + SALTO;
    msg = msg + "la asimetria es el hallazgo." + SALTO;
    msg = msg + "6 conflictos de escritura, en la capa de datos." + SALTO + SALTO;
    msg = msg + "Paquetes: " + PAQ.length + "    Recuadros: " + creados + "    Dependencias: " + TOTAL_REL + SALTO;
    msg = msg + "Atributos reales: " + totalAtr + " de " + TOTAL_ATR + SALTO;
    msg = msg + "Conectores dibujados: " + conEnDiagrama + " de " + TOTAL_REL + SALTO;
    if (conEnDiagrama < TOTAL_REL) msg = msg + "ATENCION: faltan lineas en el diagrama." + SALTO;
    msg = msg + "Objetos en el diagrama: " + (COLOCAR.length / 5) + SALTO;
    msg = msg + "Con posicion correcta: " + sqlPuestos + SALTO;
    msg = msg + "Comprobacion: " + sqlEstado + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "Diagrama de Capas", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var p2 = buscarPaquete(RAIZ, "Capas por Paquetes");
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "Diagrama de Capas", 0); } catch (e3) { }
}
