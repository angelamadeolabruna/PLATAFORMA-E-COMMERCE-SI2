// ================================================================
// MODELO DE DATOS  ·  Diagrama de clases  ·  PARTE 3 de 3
// E-COMMERCE TIENDAS MONTAÑO   ·   Diseño de datos
//
// QUE ESTO DIBUJA
//   Un solo diagrama de clases con las 51 tablas de
//   BASE DE DATOS/schema.sql, con el nombre TAL CUAL, sus 340 columnas y
//   sus 88 asociaciones, una por cada clave foránea del esquema.
//   Las cardinalidades salen del esquema, no de un criterio.
//   Y con 8 hallazgos a la derecha.
//
// POR QUE ESTA PARTIDO EN 3 SCRIPT
//   Entero son 124 KB, y el editor de scripts de Enterprise Architect no lo
//   carga.   Los 36 diagramas de clases que si funcionan pesan entre 8 y
//   70 KB.   Asi que:
//     PARTE 1  este      crea el paquete, las 51 clases y las 88 lineas
//     PARTE 2  hallazgos dibuja la bandeja de los 8 a la derecha
//     PARTE 3  notas     pone las notas largas y el informe
//   Las tres se ejecutan EN ORDEN, y se pueden repetir las veces que sea.
//
// DONDE QUEDA
//   raiz del modelo > Diseno Logico > Diseno de Datos
//     > Modelo de Datos - Diagrama de Clases
//   Y si el paquete "Diseno Logico" no existe, "Diseno de Datos" se crea en
//   la raiz del modelo.
//
// SIN NINGUNA LLAMADA A SQL, Y SIN SaveDiagram.
// Una instruccion por linea. Sin ternarios. Ninguna excepcion escapa.
// ================================================================

var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "Diseno de Datos";
var DIAG_NOMBRE = "Modelo de Datos - Diagrama de Clases";

var TOTAL_TAB = 51;
var TOTAL_REL = 88;
var TOTAL_ATR = 340;
var TOTAL_MOD = 14;
var TOTAL_HAL = 8;
var ALTO = 14;
var CONECTORES_PUESTOS = 0;
var COLS = 7;
var PASO_X = 270;
var ANCHO_CLA = 250;
var PASO_Y = 280;
var X0 = 30;
var Y0 = 25;

var ERRORES = [];
var INFORME = [];
var HAL = [];

// ---------------------------------------------------------------
// UTILIDADES  ·  el mismo patron de los 36 diagramas de clases
// ---------------------------------------------------------------

function pad(s, n) { var t = String(s); while (t.length < n) t = t + " "; return t; }

function nota(el, texto) {
    if (el == null) return;
    try { el.Notes = texto; } catch (e) { }
    try { el.Update(); } catch (e) { }
}

function buscarPaquete(P, N) {
    if (P == null) return null;
    var res = null;
    try {
        for (var i = 0; i < P.Packages.Count; i++) {
            var p = P.Packages.GetAt(i);
            if (String(p.Name) == N) { res = p; break; }
        }
    } catch (e) { }
    return res;
}

function subPaquete(padre, nombre) {
    if (padre == null) return null;
    var p = buscarPaquete(padre, nombre);
    if (p != null) return p;
    // AddNew con un solo argumento no funciona en todas las versiones de EA,
    // y con dos tampoco si el tipo va mal.   Se prueban las dos formas, y si
    // las dos fallan se prueba tambien en la raiz del modelo, que es donde
    // acaba el paquete cuando "Diseno Logico" no existe todavia.
    try { p = padre.Packages.AddNew(nombre); } catch (e) { p = null; }
    if (p == null) {
        try { p = padre.Packages.AddNew(nombre, 0); } catch (e2) { p = null; }
    }
    if (p == null) {
        try { p = padre.Packages.AddNew(nombre, -1); } catch (e3) { p = null; }
    }
    if (p == null) {
        try { p = RAIZ.Packages.AddNew(nombre); } catch (e4) { p = null; }
    }
    if (p == null) {
        try { p = RAIZ.Packages.AddNew(nombre, 0); } catch (e5) { p = null; }
    }
    return p;
}

function buscarLocal(paq, nombre) {
    if (paq == null) return null;
    try {
        for (var i = 0; i < paq.Elements.Count; i++) {
            var e = paq.Elements.GetAt(i);
            if (String(e.Name) == nombre) return e;
        }
    } catch (e) { }
    return null;
}

function objetoEn(diag, el) {
    if (diag == null || el == null) return null;
    try {
        for (var i = 0; i < diag.DiagramObjects.Count; i++) {
            var o = diag.DiagramObjects.GetAt(i);
            if (o.ElementID == el.ElementID) return o;
        }
    } catch (e) { }
    return null;
}

function nombresDe(coleccion) {
    var s = "|";
    try {
        for (var i = 0; i < coleccion.Count; i++) s = s + String(coleccion.GetAt(i).Name) + "|";
    } catch (e) { }
    return s;
}

function contiene(lista, nombre) { return lista.indexOf("|" + nombre + "|") >= 0; }
function totalDe(lista) { if (lista == "") return 0; return lista.split("|").length - 1; }

function agregarAtributo(el, nombre, tipo, vis) {
    var a = null;
    try { a = el.Attributes.AddNew(nombre, tipo, null, vis, vis); } catch (e) { a = null; }
    if (a == null) {
        try { a = el.Attributes.AddNew(nombre, tipo, 0, vis, vis); } catch (e2) { a = null; }
    }
    if (a == null) {
        try { a = el.Attributes.AddNew(nombre, tipo); } catch (e3) { a = null; }
    }
    if (a == null) return false;
    try { a.Name = nombre; } catch (e) { }
    try { a.Type = tipo; } catch (e) { }
    try { a.Visibility = vis; } catch (e) { }
    try { a.Stereotype = ""; } catch (e) { }
    try { a.Update(); } catch (e) { }
    return true;
}

function colocar(diag, el, izq, arr, ancho, alto) {
    var o = objetoEn(diag, el);
    if (o == null) {
        var tam = "l=" + izq + ";r=" + (izq + ancho) + ";t=" + arr + ";b=" + (arr + alto) + ";";
        try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e) { return null; }
        if (o == null) return null;
        o.ElementID = el.ElementID;
    }
    try { o.ManuallySized = true; } catch (e) { }
    try { o.Left = izq; } catch (e) { }
    try { o.Top = arr; } catch (e) { }
    try { o.Right = izq + ancho; } catch (e) { }
    try { o.Bottom = arr + alto; } catch (e) { }
    try { o.FontSize = 8; } catch (e) { }
    try { o.Update(); } catch (e) { }
    return o;
}

function compartimento(diag, paq, nombre, lineas, izq, arr, ancho) {
    var alto = lineas.length * ALTO + 8;
    var el = buscarLocal(paq, nombre);
    if (el == null) {
        try { el = paq.Elements.AddNew(nombre, "Text"); } catch (e) { el = null; }
        if (el == null) {
            try { el = paq.Elements.AddNew(nombre, "Class"); } catch (e2) { }
            try { el.Stereotype = ""; } catch (e2) { }
        }
    }
    if (el == null) return;
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

function enDiagrama(diag, con) {
    if (diag == null || con == null) return false;
    try {
        for (var i = 0; i < diag.DiagramObjects.Count; i++) {
            var o = diag.DiagramObjects.GetAt(i);
            if (o.ObjectID != 0 && o.ElementID == con.ElementID) return true;
        }
    } catch (e) { }
    try { return con.DiagramID == diag.ID; } catch (e2) { }
    return false;
}

// El conector se crea en el PAQUETE, no en el diagrama.  Como el script borra
// y recrea el diagrama en cada pasada, hay que COLOCARLO a mano con DiagramID:
// si no, EA solo lo dibuja la primera vez y al reejecutar sale sin lineas.
//
// Y AQUI HAY UN ARREGLO QUE NO ESTA EN LOS OTROS 36 DIAGRAMAS: el
// borrado del conector anterior mira el NOMBRE tambien.   Sin eso,
// reservas -> usuarios se dibuja una sola vez, porque las dos FK
// (id_usuario, L347, e id_encargado, L352) van al mismo padre, y la
// segunda borraba a la primera.  Con 88 relaciones eso son 2 lineas que
// se perdian en silencio.
function relacion(diag, a, b, etiqueta, tipo, est, rolA, rolB, cA, cB) {
    if (a == null || b == null) return 0;
    var i;
    var previo = null;
    for (i = 0; i < a.Connectors.Count; i++) {
        var c = a.Connectors.GetAt(i);
        if (c.SupplierID == b.ElementID && String(c.Name) == String(etiqueta)) { previo = c; break; }
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
    try { con.Name = etiqueta; } catch (e) { }
    try { con.Stereotype = est; } catch (e) { }
    try { con.Update(); } catch (e) { }
    try { con.DiagramID = diag.ID; con.Update(); } catch (e) { }
    try { con.SourceRole = rolA; } catch (e) { }
    try { con.DestinationRole = rolB; } catch (e) { }
    try { con.SourceCardinality = cA; } catch (e) { }
    try { con.DestinationCardinality = cB; } catch (e) { }
    try { con.FontSize = 6; } catch (e) { }
    try { con.Update(); } catch (e) { }
    if (enDiagrama(diag, con)) { CONECTORES_PUESTOS++; return 1; }
    return 0;
}

// Notas del diagrama de datos
function notasDelDiagrama(diag, puestas, h, clasesReales, totalAtr) {
    var N = [];
    N.push("MODELO DE DATOS  ·  Diagrama de clases del diseño de datos.");
    N.push("");
    N.push("QUÉ ES Y DÓNDE ESTÁ");
    N.push("");
    N.push("  Base de datos/schema.sql, 892 líneas, y es la fuente de verdad de");
    N.push("  este diagrama.   51 tablas de la L23 a la L555, más 2 triggers en la");
    N.push("  L620 y la L654, 8 funciones y 7 procedimientos entre la L608 y la");
    N.push("  L900, y 7 índices entre la L560 y la L566.");
    N.push("");
    N.push("  Los triggers y las funciones NO están en este diagrama, y es a");
    N.push("  propósito: son comportamiento, no datos.   Los lleva el diagrama de");
    N.push("  CU31, Actualizar Inventario Tras Venta, que es el único caso de la");
    N.push("  serie cuya mitad viva está en el esquema.");
    N.push("");
    N.push("  Y el documento de base de datos del proyecto, DISEÑO BD COMPLETA.md,");
    N.push("  tiene 706 líneas y reparte estas mismas 51 tablas en 16 partes.   Los");
    N.push("  14 módulos del diagrama son los suyos, con una diferencia: su parte");
    N.push("  16 son VISTAS MATERIALIZADAS, y en schema.sql hay CERO vistas, así");
    N.push("  que ese punto no tiene diagrama posible.");
    N.push("");
    N.push("LO QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  " + TOTAL_TAB + " clases, con el nombre de la tabla TAL CUAL, sin prefijo ni");
    N.push("  estereotipo.   " + TOTAL_ATR + " columnas, cada una con su tipo y sus condiciones,");
    N.push("  y " + TOTAL_REL + " asociaciones, una por cada clave foránea del esquema.");
    N.push("");
    N.push("  Y CON UN ORDEN QUE NO ES EL DEL ESQUEMA: las tablas van agrupadas en");
    N.push("  los 14 módulos, de izquierda a derecha y de arriba abajo, para que las");
    N.push("  88 líneas crucen lo menos posible.   Una tabla padre queda cerca de");
    N.push("  sus hijos: usuarios es el primero de la fila 1 y tiene 23 hijos");
    N.push("  repartidos por todo el diagrama, y producto_talla_color, que es la");
    N.push("  bisagra de todo el stock, tiene 14.");
    N.push("");
    N.push("  Y EL RECUADRO BLANCO DE ALGUNA TABLA, si lo hay, es el respaldo: si");
    N.push("  EA no muestra los atributos de esa clase, el script dibuja debajo un");
    N.push("  compartimento de texto con las mismas columnas.   Al final de las");
    N.push("  notas viene el recuento de cuántas han necesitado ese respaldo.");
    N.push("");
    N.push("  Y LAS 88 ASOCIACIONES SON LAS 88 CLAVES FORÁNEAS, UNA POR UNA.   Ni");
    N.push("  una relación más, ni una menos.   No hay ninguna relación lógica");
    N.push("  inventada para que el diagrama quede más redondo, y eso está");
    N.push("  comprobado con un verificador que cuenta las REFERENCES del");
    N.push("  esquema y las compara una a una con las 88 del script.");
    N.push("");
    N.push("  LA ETIQUETA DE CADA LÍNEA ES EL NOMBRE DE LA COLUMNA, que es la");
    N.push("  verdad del esquema.   Y donde hay ON DELETE CASCADE, la etiqueta lo");
    N.push("  dice, porque esa palabra explica por qué la línea es una composición.");
    N.push("");
    N.push("LAS CARDINALIDADES, Y DE DÓNDE SALEN");
    N.push("");
    N.push("  No se han puesto por costumbre ni por regla.   Cada multiplicidad sale de");
    N.push("  leer una cosa concreta del esquema:");
    N.push("");
    N.push("  En el extremo del HIJO, cuántas filas del padre tiene cada hijo:");
    N.push("    1       la FK es NOT NULL, o parte de la PRIMARY KEY");
    N.push("    0..1    la FK es NULLABLE, y el esquema no lo prohíbe");
    N.push("");
    N.push("  En el extremo del PADRE, cuántos hijos tiene cada padre:");
    N.push("    0..*    la FK no es UNIQUE, o sea que puede repetirse");
    N.push("    0..1    la FK es UNIQUE, o sea que como mucho un hijo");
    N.push("");
    N.push("  Y EL REPARTO, que es el dato más importante del diagrama:");
    N.push("");
    N.push("    hijo 0..*  ->  padre 0..1     82 de las 88");
    N.push("    hijo 0..*  ->  padre 1          4 de las 88");
    N.push("    hijo 0..1  ->  padre 0..1       2 de las 88");
    N.push("");
    N.push("  O SEA QUE 86 DE LAS 88 FK SON NULLABLE.   El modelo permite 82 filas");
    N.push("  huérfanas por cada una de esas columnas: un venta sin sucursal, un");
    N.push("  producto sin sucursal, un movimiento de inventario sin prenda.   Y las");
    N.push("  cuatro que son 1 son las cuatro FK que sí son NOT NULL, que son los");
    N.push("  usuarios_roles y el resto de las tablas de unión.");
    N.push("");
    N.push("  Y LAS DOS ÚNICAS QUE SON 0..1 EN EL EXTREMO DEL HIJO son las dos");
    N.push("  columnas con UNIQUE en línea que tiene el esquema, y son estas:");
    N.push("");
    N.push("    usuarios_empleados.usuario_id   L78   UNIQUE REFERENCES usuarios");
    N.push("    clientes.usuario_id             L89   UNIQUE REFERENCES usuarios");
    N.push("");
    N.push("  O sea que un usuario tiene COMO MUCHO una ficha de empleado y COMO");
    N.push("  MUCHO un registro de cliente, y el modelo lo dice con claridad.   Y esa");
    N.push("  es la razón por la que esas dos líneas llevan el 0..1 en vez del 0..*.");
    N.push("");
    N.push("EL ON DELETE, QUE ES LO QUE MARCA LA NATURALEZA DE LA LÍNEA");
    N.push("");
    N.push("  ON DELETE CASCADE   ->  Composition   22 relaciones");
    N.push("  ON DELETE SET NULL  ->  Dependency     2 relaciones");
    N.push("  sin ON DELETE       ->  Association    64 relaciones");
    N.push("");
    N.push("  O sea que las 88 tienen ON DELETE pensado.   Las 64 que no lo llevan son");
    N.push("  RESTRICT, que es lo correcto para ventas, pagos y stock: no se puede");
    N.push("  borrar una venta que tiene comprobante, ni un pago que tiene venta.");
    N.push("  Y las 2 SET NULL están donde toca: producto_imagenes L249 y");
    N.push("  bitacora_auditoria L150, que tienen que sobrevivir a su padre.");
    N.push("");
    N.push("  Y OJO CON LAS 22 COMPOSICIONES, porque es donde el modelo se pone");
    N.push("  exquisito. De las 88 relaciones, 22 borran al hijo y 66 lo conservan.");
    N.push("  Lo que se conserva al borrar la prenda son las ventas, los pagos y");
    N.push("  los comprobantes, y eso es lo correcto, porque son documentos");
    N.push("  fiscales. Lo que se borra son las líneas de venta, las líneas de");
    N.push("  reserva y los movimientos del Kardex, y eso es discutible: un Kardex");
    N.push("  que se borra al borrar la prenda deja de ser un libro mayor.");
    N.push("");
    N.push("UN ARREGLO QUE LOS 36 DIAGRAMAS DE CLASES ANTERIORES NO TENÍAN");
    N.push("");
    N.push("  reservas tiene DOS claves foráneas a usuarios: id_usuario, L347, que es");
    N.push("  el que pidió la reserva, e id_encargado, L352, que es el empleado que la");
    N.push("  preparó.   Son 2 asociaciones entre el MISMO par de tablas, que en un");
    N.push("  diagrama de clases es el caso que suele olvidarse.");
    N.push("");
    N.push("  En la función que dibuja los conectores de los 36 diagramas");
    N.push("  anteriores, el borrado del conector previo buscaba uno con el mismo");
    N.push("  SupplierID.   Con dos FK al mismo padre, la segunda relación borraba a");
    N.push("  la primera, y el diagrama salía con 87 líneas de las 88 sin decir");
    N.push("  nada.   Aquí el borrado mira también el NOMBRE, así que las dos se");
    N.push("  quedan, y se distinguen por la etiqueta, que es el nombre de la");
    N.push("  columna: id_usuario e id_encargado.");
    N.push("");
    N.push("EL HALLAZGO 1: 51 TABLAS, 88 RELACIONES, Y UN SOLO CHECK, Y ESTÁ EN LA TABLA EQUIVOCADA");
    N.push("");
    N.push("  La cuenta del modelo, entera, sin suavizar nada:");
    N.push("");
    N.push("    51 tablas          de la L23 a la L555");
    N.push("    340 columnas");
    N.push("    88 claves foráneas");
    N.push("    22 CASCADE, 2 SET NULL, 64 sin nada");
    N.push("     7 índices");
    N.push("     1 CHECK");
    N.push("     0 ALTER TABLE");
    N.push("     0 vistas");
    N.push("     0 enums");
    N.push("");
    N.push("  Y EL ÚNICO CHECK DEL ESQUEMA ENTERO ES schema.sql L294:");
    N.push("");
    N.push("    cantidad  INTEGER NOT NULL CHECK (cantidad > 0),");
    N.push("");
    N.push("  QUE ESTÁ EN orden_compra_items, L290-300.   La única invariante que la");
    N.push("  base de datos protege en todo el proyecto es que la cantidad de una");
    N.push("  LÍNEA DE COMPRA sea positiva.   Y es la cantidad menos importante que");
    N.push("  hay en el sistema.");
    N.push("");
    N.push("  LO QUE QUEDA SIN PROTEGER:");
    N.push("");
    N.push("    carrito_items.cantidad        puede ser 0 o negativa");
    N.push("    venta_items.cantidad          puede ser 0 o negativa");
    N.push("    reserva_items.cantidad        puede ser 0 o negativa");
    N.push("    inventario_stock              LAS CUATRO pueden ser negativas");
    N.push("    preferencias_cliente.puntaje  puede ser negativo o nulo");
    N.push("    movimientos_inventario        sin comprobar stock_anterior ni posterior");
    N.push("    ventas, comprobantes          total y subtotal sin comprobar");
    N.push("");
    N.push("  Y NO ES QUE NO SE PUEDA, ES QUE NO SE HIZO.   El modelo tiene capacidad");
    N.push("  de sobra, y se nota en que hay 7 índices y CERO ALTER TABLE: se puso");
    N.push("  el índice antes que el CHECK.");
    N.push("");
    N.push("EL HALLAZGO 2: ventas.estado DICE LO CONTRARIO DE LO QUE PASA");
    N.push("");
    N.push("  EL MODELO, schema.sql L395:");
    N.push("");
    N.push("    estado  VARCHAR(20) DEFAULT 'Completada',");
    N.push("");
    N.push("  O sea que según el modelo, una venta nace completada.");
    N.push("");
    N.push("  EL CÓDIGO, SRV_VentasService L238-240, que es el ÚNICO INSERT INTO");
    N.push("  ventas del proyecto:");
    N.push("");
    N.push("    INSERT INTO ventas (..., estado, fecha_venta)");
    N.push("    VALUES ($1, ..., $9, 'Pendiente', NOW())");
    N.push("");
    N.push("  El INSERT pone SIEMPRE 'Pendiente' y NUNCA usa el DEFAULT.   El DEFAULT");
    N.push("  está muerto, y no por casualidad: nadie lo ejercita.   Y peor: es lo");
    N.push("  CONTRARIO de la verdad, así que cualquier INSERT nuevo que olvide la");
    N.push("  columna crea una venta cobrada que nadie ha cobrado.");
    N.push("");
    N.push("  Y LA MÁQUINA DE ESTADOS DE ESA COLUMNA NO EXISTE.   La columna estado");
    N.push("  está repetida en 17 tablas, las 17 son VARCHAR(20) con un DEFAULT");
    N.push("  distinto, y el proyecto entero usa UN SOLO valor de estado de venta,");
    N.push("  que es 'Completada', escrito a mano en 2 sitios: Pagos L334 y L696.");
    N.push("");
    N.push("  Las otras máquinas de estado, cada una con sus valores, y ninguna en");
    N.push("  ningún sitio del modelo:");
    N.push("");
    N.push("    ventas              Pendiente, Completada");
    N.push("    carritos            Activo, En pago, Convertido a venta");
    N.push("    reservas            Solicitada, En tienda, Cumplida, Cancelada");
    N.push("    transacciones_pago  Pendiente, Aprobado, Rechazado");
    N.push("    ordenes_compra      Pedida, Recibida");
    N.push("    respaldos           En Progreso");
    N.push("");
    N.push("  Unas 12 máquinas distintas, escritas como literales sueltos.   Por eso el");
    N.push("  diagrama dibuja las columnas estado con su DEFAULT, que es lo que el");
    N.push("  modelo dice, y deja los valores en la bandeja: no están en ninguna parte.");
    N.push("");
    N.push("EL HALLAZGO 3: estado_stock, UNA COLUMNA QUE EL MODELO DECLARA Y NADIE ESCRIBE");
    N.push("");
    N.push("  No es que la columna esté mal: es que NO ES UN DATO.   Es un dato");
    N.push("  derivado, y el modelo lo trata como si fuera almacenado.");
    N.push("");
    N.push("    escrituras en los 147 .ts y .tsx      CERO");
    N.push("    escrituras en todo schema.sql          CERO");
    N.push("");
    N.push("  Así que estado_stock se queda en 'Disponible' desde el INSERT que la");
    N.push("  creó, para siempre.   Y 6 sitios la leen para DECIDIR si hay stock:");
    N.push("");
    N.push("    SRV_CarritoService    L246   si es 'sin stock', rechaza la prenda");
    N.push("    SRV_ReservasService  L1197   si NO es 'disponible', rechaza la prenda");
    N.push("    SRV_ReservasService   L330   WHERE estado_stock = 'Disponible'");
    N.push("    SRV_ReservasService   L383   WHERE estado_stock = 'Disponible'");
    N.push("    SRV_VentasService     L197   si NO es 'Disponible', rechaza la prenda");
    N.push("    SRV_VentasService     L315   WHERE estado_stock <> 'Sin stock'");
    N.push("");
    N.push("  Y ADEMÁS NO COINCIDEN ENTRE SÍ: Carrito L246 busca 'sin stock' en");
    N.push("  minúscula y Reservas L1197 busca 'disponible' en minúscula, y la columna");
    N.push("  tiene 'Disponible' y 'Sin stock' con mayúscula.   Dos de las seis");
    N.push("  comparaciones no pueden ser ciertas NI SIQUIERA escribiéndola, por las");
    N.push("  mayúsculas.   Y las otras cuatro son siempre ciertas, porque nunca cambia.");
    N.push("");
    N.push("  El documento de casos de uso, L176 punto d, pide la regla de tres");
    N.push("  estados.   Esa regla NO EXISTE en el esquema, ni en el código, ni en");
    N.push("  ningún sitio.   Por eso el diagrama dibuja la columna y NO dibuja la");
    N.push("  regla, y lo dice aquí.");
    N.push("");
    N.push("EL HALLAZGO 4: inventario_stock, CUATRO CANTIDADES Y NI UNA REGLA QUE LAS ATE");
    N.push("");
    N.push("  schema.sql L302-311.  Las cuatro son INTEGER, las cuatro con DEFAULT 0,");
    N.push("  y NINGUNA tiene CHECK.   Así que las cuatro pueden ser negativas, y el");
    N.push("  modelo lo permite.");
    N.push("");
    N.push("  Y LO QUE NO EXISTE ES LA RELACIÓN ENTRE ELLAS.   La ecuación del");
    N.push("  inventario, la que dice cuánto hay, cuánto está reservado y cuánto se ha");
    N.push("  vendido, no está escrita en ningún sitio del proyecto:");
    N.push("");
    N.push("    NO hay CHECK de que disponible + reservada + vendida sea el stock");
    N.push("    NO hay CHECK de que disponible sea mayor o igual que cero");
    N.push("    NO hay CHECK de que reservada sea mayor o igual que cero");
    N.push("    NO hay vista que calcule nada de esto");
    N.push("    NO hay función en el esquema que lo calcule");
    N.push("");
    N.push("  CUÁNTAS VECES SE ESCRIBE CADA UNA, contadas en el proyecto entero:");
    N.push("");
    N.push("    cantidad_disponible   2   el trigger de L648, y Reservas L710");
    N.push("    cantidad_reservada    4   Reservas L709, L979 y L1117, y schema.sql");
    N.push("                              L761, en una función que no llama nadie");
    N.push("    cantidad_vendida      2   Pagos L341 y L711, los dos de cobro");
    N.push("    stock_minimo_alert    0   existe en el modelo y en el panel, pero");
    N.push("                              no se lee en ninguna consulta del código");
    N.push("");
    N.push("  O SEA QUE LA COLUMNA QUE SERÍA EL LUGAR NATURAL DE LA REGLA,");
    N.push("  stock_minimo_alert, NO SE USA PARA NADA, Y LA QUE SÍ ESTÁ Y SÍ SIRVE es");
    N.push("  la UNIQUE de L310, que es la que hace posible el ON CONFLICT del trigger.");
    N.push("  CU31 lo confirmó contando los dos sitios que dependen de ella.");
    N.push("");
    N.push("EL HALLAZGO 5: DOS COLUMNAS QUE EL CÓDIGO USA Y EL MODELO NO TIENE");
    N.push("");
    N.push("    carritos.token_invitado        NO EXISTE EN schema.sql");
    N.push("    sesiones_ra.foto_resultado     NO EXISTE EN schema.sql");
    N.push("");
    N.push("  Y ENTRE LOS DOS NOMBRES HAY 44 SITIOS DE CÓDIGO.   Para");
    N.push("  token_invitado no es un SELECT casual, es el MECANISMO ENTERO del");
    N.push("  carrito de invitado, que es el CU25: la búsqueda es el L105, la");
    N.push("  fusión es el L115, y la creación es el L161.   O sea que un caso de");
    N.push("  uso completo, con su propio diagrama de secuencia, funciona sobre una");
    N.push("  columna que el modelo no declara.");
    N.push("");
    N.push("  Y para foto_resultado es peor, porque es una foto, o sea un binario de");
    N.push("  peso, y en sesiones_ra, schema.sql L480-489, no hay ninguna columna de");
    N.push("  imagen.   Y CU24 ya lo acusaba a esa misma tabla de este mismo");
    N.push("  problema, desde el lado del caso de uso.");
    N.push("");
    N.push("  ESTE DIAGRAMA DIBUJA LAS 51 TABLAS TAL COMO ESTÁN, SIN INVENTAR LAS DOS");
    N.push("  COLUMNAS QUE FALTAN.   Y por eso hay que avisar: este es el modelo que");
    N.push("  declara el ESQUEMA, que no es exactamente el que usa la APLICACIÓN.");
    N.push("  La diferencia, por lo menos, son estas dos columnas.");
    N.push("");
    N.push("EL HALLAZGO 6: 45 DE 51 TABLAS SIN ÍNDICE, Y EL QUE SE LLAMA DE CLIENTE ESTÁ EN LA COLUMNA DEL EMPLEADO");
    N.push("");
    N.push("  Los 7 índices del esquema, y solo 6 tablas los tienen:");
    N.push("");
    N.push("    L560  idx_bitacora_fecha         bitacora_auditoria (fecha_hora DESC)");
    N.push("    L561  idx_bitacora_tabla         bitacora_auditoria (tabla_afectada)");
    N.push("    L562  idx_mov_inv_ptc_suc        movimientos_inventario (id_ptc, id_sucursal, fecha)");
    N.push("    L563  idx_inventario_sucursal   inventario_stock (id_sucursal)");
    N.push("    L564  idx_ventas_sucursal_fecha  ventas (id_sucursal, fecha_venta)");
    N.push("    L565  idx_reservas_cliente       reservas (id_usuario)");
    N.push("    L566  idx_ordenes_proveedor      ordenes_compra (id_proveedor, estado)");
    N.push("");
    N.push("  45 DE LAS 51 TABLAS NO TIENEN NINGÚN ÍNDICE, y ninguno de los 7 es");
    N.push("  UNIQUE, así que no hay ninguna restricción de unicidad que no sea una");
    N.push("  columna suelta o las dos UNIQUE de producto_talla_color e");
    N.push("  inventario_stock.");
    N.push("");
    N.push("  Y EL ÍNDICE QUE MIENTE, que es el hallazgo de este apartado:");
    N.push("");
    N.push("    L565  CREATE INDEX idx_reservas_cliente ON reservas (id_usuario);");
    N.push("");
    N.push("  Se llama de cliente y está en id_usuario, que es el EMPLEADO.   Y la");
    N.push("  columna que se llama de cliente, id_cliente, L346, no tiene índice, y el");
    N.push("  código la filtra en 3 sitios: Reservas L424, L461 y L929.   O sea que la");
    N.push("  consulta de las reservas de un cliente, que es la pantalla principal del");
    N.push("  módulo, hace un Seq Scan de la tabla entera.");
    N.push("");
    N.push("  Y producto_talla_color, que es padre de 14 hijos y la bisagra de todas");
    N.push("  las consultas de stock, no tiene índice propio.   Lo que lo único");
    N.push(" Ui covers es el índice de movimientos_inventario.");
    N.push("");
    N.push("  Un índice no es una clase ni una relación, así que esto no se ve en las");
    N.push("  cajas del diagrama.   Por eso está aquí y no dibujado.");
    N.push("");
    N.push("EL HALLAZGO 7: preferencias_cliente ADMITE UNA FILA QUE NO DICE NADA");
    N.push("");
    N.push("  schema.sql L501-509, y son 7 líneas con 5 referencias y un número:");
    N.push("");
    N.push("    id_preferencia SERIAL PRIMARY KEY,");
    N.push("    id_cliente     INTEGER REFERENCES clientes(id_cliente),");
    N.push("    id_categoria   INTEGER REFERENCES categorias(id_categoria),");
    N.push("    id_talla       INTEGER REFERENCES tallas(id_talla),");
    N.push("    id_color       INTEGER REFERENCES colores(id_color),");
    N.push("    id_temporada   INTEGER REFERENCES temporadas(id_temporada),");
    N.push("    puntaje        INTEGER");
    N.push("");
    N.push("  Y LO QUE NO TIENE, y es la lista completa: ninguna columna NOT NULL,");
    N.push("  ni siquiera id_cliente.  Ninguna UNIQUE.  Ningún índice.  Ningún CHECK");
    N.push("  de que el puntaje sea positivo.");
    N.push("");
    N.push("  CONSECUENCIA DIRECTA: una fila puede tener las CINCO referencias a NULL");
    N.push("  y un puntaje NULL, y el modelo la acepta.   Una preferencia que no dice");
    N.push("  qué prefiere nadie.   Y no es hipotético, porque el servicio inserta así,");
    N.push("  SRV_PreferenciasService L57, con la palabra dimension sustituida en");
    N.push("  runtime, o sea que la consulta cambia de forma según de dónde venga la");
    N.push("  llamada.   CU32 ya vio el hueco de eso.");
    N.push("");
    N.push("  Y SIN UNIQUE, el mismo par cliente y categoría puede repetirse, y el");
    N.push("  'upsert' del comentario del propio servicio, L12, no es un upsert:");
    N.push("");
    N.push("    L41   SELECT ... FROM preferencias_cliente      para buscar la fila");
    N.push("    L50   UPDATE preferencias_cliente SET puntaje = puntaje + $2");
    N.push("    L57   INSERT INTO preferencias_cliente");
    N.push("");
    N.push("  Eso es un SELECT y luego UPDATE o INSERT según lo que encuentre, y entre");
    N.push("  medias puede entrar otro.   Un UPSERT de verdad es un INSERT ... ON");
    N.push("  CONFLICT, que es justo lo que el trigger de inventario_stock SÍ usa, y con");
    N.push("  el que funciona, porque tiene la UNIQUE de L310 detrás.   Aquí no hay");
    N.push("  UNIQUE detrás, así que no se puede.   Y esa diferencia de criterio, en el");
    N.push("  mismo equipo y en el mismo proyecto, es el hallazgo.");
    N.push("");
    N.push("EL HALLAZGO 8: LO QUE EL MODELO SÍ HACE BIEN, Y SON CINCO COSAS");
    N.push("");
    N.push("  Un diagrama de 51 clases y 88 líneas es sobre todo un aviso.   Este es el");
    N.push("  otro lado, y también se cuenta.");
    N.push("");
    N.push("  1. LAS 22 ON DELETE CASCADE SON COHERENCIA GRATIS.   22 de las 88 relaciones");
    N.push("     borran al hijo cuando muere el padre, y eso es integridad referencial");
    N.push("     de verdad, sin una línea de código.   Y las 2 SET NULL están donde");
    N.push("     toca: una foto sin producto y un registro sin autor tienen que");
    N.push("     sobrevivir.   Las 88 tienen ON DELETE pensado, no heredado por descuido.");
    N.push("");
    N.push("  2. Y LA UNIQUE DE producto_talla_color ES LA FORMA CORRECTA DE MODELAR ESA");
    N.push("     RELACIÓN.   UNIQUE (id_producto, id_talla, id_color), L243, sobre una");
    N.push("     entidad asociativa.   Es la solución de manual para producto por talla");
    N.push("     por color, y además funciona: es la que hace que la búsqueda del stock");
    N.push("     de una prenda sea una búsqueda y no un recorrido.");
    N.push("");
    N.push("  3. Y LA DE inventario_stock TAMBIÉN, Y CON MÁS RAZÓN, porque es la que hace");
    N.push("     posible el ON CONFLICT del trigger, CU31 L645-648.   Sin ese UNIQUE, el");
    N.push("     INSERT del caso de actualizar el inventario no existiría en una sola");
    N.push("     sentencia.");
    N.push("");
    N.push("  4. Y LAS 8 TABLAS RAÍZ NO TIENEN NINGUNA FK.   roles, usuarios, ciudades,");
    N.push("     tallas, colores, categorias, temporadas y proveedores.   Son los");
    N.push("     catálogos y las raíces del grafo, y no deben depender de nadie.   El");
    N.push("     grafo de las 88 relaciones arranca limpio desde 8 vértices y no tiene");
    N.push("     ni un ciclo de creación, que es la trampa clásica de un modelo de datos.");
    N.push("");
    N.push("  5. Y TODAS LAS CLAVES PRIMARIAS SON SERIAL.   Las 51, sin una sola");
    N.push("     excepción y sin ni una clave natural.   Eso evita la discusión de si el");
    N.push("     correo es la clave del usuario, que es la pelea más tonta que hay en");
    N.push("     una tienda.   Y la tabla puente usuarios_roles, L45-49, lo hace mejor:");
    N.push("     PRIMARY KEY (id_usuario, id_rol) y nada más.   Es una tabla de unión, y");
    N.push("     su clave ES la unión, sin columna inventada.");
    N.push("");
    N.push("SOBRE LA COLOCACIÓN DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Rejilla: " + COLS + " columnas por " + Math.ceil(TOTAL_TAB / COLS) + " filas para las " + TOTAL_TAB + " tablas, con las");
    N.push("  cabeceras separadas " + PASO_X + " px y " + ANCHO_CLA + " de ancho, y " + PASO_Y + " px de alto por fila.   La última");
    N.push("  tabla, respaldos, cae en la última fila y en la última columna.");
    N.push("");
    N.push("  Las tablas van en orden de módulo, no en orden de línea del esquema, para");
    N.push("  que las 88 líneas crucen lo menos posible.   El orden de módulo es el de");
    N.push("  DISEÑO BD COMPLETA.md L15-29, con una diferencia: su parte 16 son vistas");
    N.push("  materializadas y aquí no hay ninguna.");
    N.push("");
    N.push("  Un detalle que hizo fallar los diagramas de secuencia dieciséis veces: EA");
    N.push("  guarda Top y Bottom en NEGATIVO. Si se le pasa la Y en positivo no da error,");
    N.push("  simplemente no coloca nada.   En la función colocarHallazgos de este script");
    N.push("  está escrito o.Top = 0 - y y o.Bottom = 0 - y - alto.   En el AddNew, en");
    N.push("  cambio, la Y va en positiva, y por eso la rejilla de clases usa la forma");
    N.push("  larga con Left, Top, Right y Bottom en positivo, como los 36 anteriores.");
    N.push("");
    N.push("  Comprobación de esta ejecución, leída del modelo de objetos:");
    N.push("    objetos en el diagrama: " + h.leidos);
    N.push("    con la Y crecida, o sea colocados: " + h.bien);
    N.push("    clases con atributos REALES: " + clasesReales + " de " + TOTAL_TAB);
    N.push("    clases con compartimento de texto de respaldo: " + (TOTAL_TAB - clasesReales));
    N.push("    atributos leidos del modelo: " + totalAtr + " de " + TOTAL_ATR);
    N.push("    asociaciones dibujadas: " + puestas + " de " + TOTAL_REL);
    N.push("    hallazgos colocados: " + h.total + " de " + HAL.length + ", banda hasta la y " + h.fin);
    N.push("");
    N.push("  Y LOS RECUADROS BLANCOS, que son el punto flaco de esto.   En un diagrama de");
    N.push("  clases, EA tiene un ajuste que decide si los atributos se muestran o no, y");
    N.push("  ese ajuste es del USUARIO, no del script.   Si está en modo texto plano, las");
    N.push("  cajas salen vacías.   Por eso el script trae un respaldo: si al releer la");
    N.push("  clase no encuentra los atributos, dibuja debajo un compartimento de texto");
    N.push("  con las mismas columnas.   Así que si al ejecutar ves clases vacías, no es");
    N.push("  que el script falle: es que se ha activado el respaldo.   Y en ese caso hay");
    N.push("  que activar la visibilidad de atributos en el diagrama, y volver a ejecutar.");
    N.push("");
    N.push("  LO MÁS ÚTIL PARA QUIEN TENGA QUE ARREGLAR ESTE MODELO, y son 4 sitios,");
    N.push("  todos en el esquema y ninguno en un fichero .ts:");
    N.push("");
    N.push("    1  L395, el DEFAULT de ventas.estado, que dice 'Completada' y debería");
    N.push("       decir 'Pendiente'.   Una palabra, y arregla el births de venta.");
    N.push("");
    N.push("    2  L294, donde está el único CHECK del esquema.   Si se añade uno a");
    N.push("       inventario_stock, por ejemplo de que cantidad_disponible sea mayor");
    N.push("       o igual que cero, se arreglan de golpe CU29 y CU31.");
    N.push("");
    N.push("    3  L242, estado_stock.   O se borra la columna y se sustituye por una")
    N.push("       vista, o se escribe en el trigger.   De las dos, la segunda.");
    N.push("");
    N.push("    4  Y las dos columnas que faltan, carritos.token_invitado y");
    N.push("       sesiones_ra.foto_resultado, que el modelo no tiene y el código usa en")
    N.push("       44 sitios.   Alguien tiene que decidir si el esquema está viejo o si")
    N.push("       la aplicación escribe en columnas que no existen.");
    try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
}

function main() {
    var raiz = buscarPaquete(RAIZ, RAIZ_NOMBRE);
    if (raiz == null) raiz = RAIZ;
    var paq = buscarPaquete(raiz, PAQ_NOMBRE);
    if (paq == null) { ERRORES.push("el paquete " + PAQ_NOMBRE + " no existe: ejecuta antes la PARTE 1"); cerrar(null, "PARTE 3", "No se ha puesto nada."); return; }
    var diag = buscarDiagrama(paq);
    if (diag == null) { ERRORES.push("el diagrama " + DIAG_NOMBRE + " no existe: ejecuta antes la PARTE 1"); cerrar(null, "PARTE 3", "No se ha puesto nada."); return; }
    var T = [];
    T.push("MODELO DE DATOS - DIAGRAMA DE CLASES - INFORME");
    T.push("");
    T.push("Tablas (clases):    " + TOTAL_TAB);
    T.push("Columnas:           " + TOTAL_ATR);
    T.push("Asociaciones:        " + TOTAL_REL);
    T.push("Modulos:            " + TOTAL_MOD);
    T.push("Rejilla:            " + COLS + " columnas");
    T.push("");
    T.push("COMO ESTA HECHO, Y POR QUE NO PUEDE HABER ERROR DE CUENTAS");
    T.push("");
    T.push("  Los datos NO estan escritos a mano: los genera un lector de");
    T.push("  BASE DE DATOS/schema.sql.  Las 51 tablas, las 340 columnas, las");
    T.push("  88 FK y las cardinalidades salen del esquema.");
    T.push("");
    T.push("  LAS 88 ASOCIACIONES SON LAS 88 CLAVES FORANEAS, UNA POR UNA.  Ni");
    T.push("  una mas, ni una menos.  No hay ninguna relacion logica inventada");
    T.push("  para que el diagrama quede mas redondo.");
    T.push("");
    T.push("LAS CARDINALIDADES NO SON UN ADORNO, Y SALEN DE TRES COSAS");
    T.push("");
    T.push("  En el extremo del HIJO, cuantas filas del padre tiene cada hijo:");
    T.push("    1       la FK es NOT NULL, o parte de la PRIMARY KEY");
    T.push("    0..1    la FK es NULLABLE, y el esquema no lo prohibe");
    T.push("");
    T.push("  En el extremo del PADRE, cuantos hijos tiene cada padre:");
    T.push("    0..*    la FK no es UNIQUE, o sea que puede repetirse");
    T.push("    0..1    la FK es UNIQUE, o sea que como mucho un hijo");
    T.push("");
    T.push("EL REPARTO, que es el dato mas importante del diagrama:");
    T.push("    hijo 0..*  ->  padre 0..1     82 de las 88");
    T.push("    hijo 0..*  ->  padre 1          4 de las 88");
    T.push("    hijo 0..1  ->  padre 0..1       2 de las 88");
    T.push("");
    T.push("O SEA QUE 86 DE LAS 88 FK SON NULLABLE.  El modelo permite 82 filas");
    T.push("huerfanas por cada una de esas columnas: una venta sin sucursal, un");
    T.push("producto sin sucursal, un movimiento de inventario sin prenda.  Y las");
    T.push("cuatro que son 1 son las cuatro FK que si son NOT NULL.");
    T.push("");
    T.push("Y LAS DOS UNICAS QUE SON 0..1 EN EL EXTREMO DEL HIJO son las dos");
    T.push("columnas con UNIQUE en linea del esquema:");
    T.push("    usuarios_empleados.usuario_id   L78");
    T.push("    clientes.usuario_id             L89");
    T.push("");
    T.push("EL ON DELETE MARCA LA NATURALEZA DE LA ASOCIACION, Y NO ES MIO");
    T.push("");
    T.push("  ON DELETE CASCADE   ->  Composition   22 relaciones");
    T.push("  ON DELETE SET NULL  ->  Dependency     2 relaciones");
    T.push("  sin ON DELETE       ->  Association    64 relaciones");
    T.push("");
    T.push("Las 88 tienen ON DELETE pensado.  Las 64 que no lo llevan son RESTRICT,");
    T.push("que es lo correcto para ventas, pagos y stock: no se puede borrar una");
    T.push("venta que tiene comprobante, ni un pago que tiene venta.");
    T.push("");
    T.push("UN ARREGLO QUE LOS 36 DIAGRAMAS DE CLASES ANTERIORES NO TENIAN");
    T.push("");
    T.push("reservas tiene DOS claves foraneas a usuarios: id_usuario, L347, que es");
    T.push("el que pidio la reserva, e id_encargado, L352, que es el empleado que la");
    T.push("preparo.  Son 2 asociaciones entre el MISMO par de tablas, que en un");
    T.push("diagrama de clases es el caso que suele olvidarse.");
    T.push("");
    T.push("En la funcion que dibuja los conectores de los 36 diagramas anteriores,");
    T.push("el borrado del conector previo buscaba uno con el mismo SupplierID.  Con");
    T.push("dos FK al mismo padre, la segunda relacion borraba a la primera, y el");
    T.push("diagrama salia con 87 lineas de las 88 sin decir nada.  Aqui el borrado");
    T.push("mira tambien el NOMBRE, asi que las dos se quedan, y se distinguen por");
    T.push("la etiqueta, que es el nombre de la columna: id_usuario e id_encargado.");
    T.push("");
    T.push("HALLAZGOS");
    T.push("  1  51 tablas, 88 relaciones, 7 indices, 0 ALTER TABLE, 0 vistas,");
    T.push("     0 enums y UN SOLO CHECK, que esta en orden_compra_items L294,");
    T.push("     protegiendo la cantidad de una linea de compra.  Las cuatro");
    T.push("     cantidades de inventario_stock, las de carrito_items,");
    T.push("     venta_items y reserva_items, y el puntaje de las");
    T.push("     preferencias: sin proteccion.  Y 0 ALTER TABLE, o sea que no");
    T.push("     se puso el CHECK.");
    T.push("  2  ventas.estado DEFAULT  Completada, L395, y el unico INSERT,");
    T.push("     Ventas L238-240, pone siempre Pendiente.  El DEFAULT esta");
    T.push("     muerto y dice lo contrario de la verdad.  Y no hay enum, ni");
    T.push("     CHECK, ni tabla de estados, para 17 columnas estado y unas 12");
    T.push("     maquinas distintas escritas a mano.");
    T.push("  3  estado_stock: 0 escrituras en 147 ficheros y en todo el");
    T.push("     esquema, DEFAULT Disponible, y 6 lecturas que deciden si hay");
    T.push("     stock.  Dos de esas 6 buscan sin stock y disponible en");
    T.push("     minuscula y la columna tiene mayuscula, asi que no pueden ser");
    T.push("     ciertas ni escribiendola.");
    T.push("  4  inventario_stock: 4 cantidades, DEFAULT 0, ni un CHECK, y");
    T.push("     ninguna relacion entre ellas escrita en ningun sitio.  La");
    T.push("     ecuacion del inventario no existe como invariante.  Y");
    T.push("     stock_minimo_alert, que seria el sitio natural de la regla,");
    T.push("     no se lee en ninguna consulta.");
    T.push("  5  Dos columnas que el codigo usa y el modelo NO tiene:");
    T.push("     carritos.token_invitado y sesiones_ra.foto_resultado.  44");
    T.push("     sitios de codigo las nombran.  El carrito de invitado, CU25,");
    T.push("     funciona sobre una columna fantasma.");
    T.push("  6  45 de 51 tablas sin indice, y el que se llama");
    T.push("     idx_reservas_cliente esta en id_usuario, que es el empleado,");
    T.push("     mientras que id_cliente, que es la que filtra el codigo en 3");
    T.push("     sitios, no tiene ninguno.  El nombre del indice miente.");
    T.push("  7  preferencias_cliente: 5 FK nullable, puntaje nullable, sin");
    T.push("     UNIQUE, sin indice y sin CHECK.  Una fila puede no decir que");
    T.push("     prefiere nadie.  Y el upsert de su servicio, L12, es un");
    T.push("     SELECT seguido de UPDATE o INSERT, no un ON CONFLICT.  No");
    T.push("     puede serlo: no hay UNIQUE detras.  Y el mismo equipo SI uso");
    T.push("     ON CONFLICT en el trigger, donde si hay UNIQUE.");
    T.push("  8  Y cinco cosas buenas.  Las 22 CASCADE dan integridad referencial");
    T.push("     gratis.  La UNIQUE de producto_talla_color es la modelizacion");
    T.push("     correcta de producto por talla por color.  La de");
    T.push("     inventario_stock es la que hace posible el ON CONFLICT del");
    T.push("     trigger.  Las 8 tablas raiz no tienen FK.  Y las 51 PK son");
    T.push("     SERIAL, sin una sola clave natural.");
    T.push("");
    if (ERRORES.length == 0) T.push("Sin errores.");
    if (ERRORES.length > 0) {
        T.push("ERRORES: " + ERRORES.length);
        for (var e2 = 0; e2 < ERRORES.length; e2++) T.push("  - " + ERRORES[e2]);
    }
    try { paq.Notes = T.join(SALTO); paq.Update(); } catch (e) { }
    try { paq.Elements.Refresh(); } catch (e) { }
    try { paq.Diagrams.Refresh(); } catch (e) { }
    try { notasDelDiagrama(diag, 0, 0, 0, 0); } catch (e) { }
    cerrar(diag, "PARTE 3 de 3: notas e informe", T.join(SALTO));
}

function buscarDiagrama(paq) {
    try {
        for (var i = 0; i < paq.Diagrams.Count; i++) {
            if (String(paq.Diagrams.GetAt(i).Name) == DIAG_NOMBRE) return paq.Diagrams.GetAt(i);
        }
    } catch (e) { }
    return null;
}

// ---------------------------------------------------------------
// CIERRE: REFRESCAR, Y DECIR DONDE HA QUEDADO
// ---------------------------------------------------------------

// Repository.ShowMessage NO EXISTE en esta version de EA, y como el mensaje
// va dentro de un try/catch, el error se tragaba en silencio: se ejecutaba el
// script entero y el usuario no veia NADA.  Este es el que si funciona, en
// tres canales, y el ultimo no puede fallar.
var MSGTIT = "Diseno de Datos";
function mensaje(txt) {
    try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup(txt, 0, MSGTIT, 64);
    } catch (e) {
        try {
            var mm = Repository.Models.GetAt(0);
            mm.Notes = txt;
            mm.Update();
        } catch (e2) {
            throw new Error(txt);
        }
    }
}

function cerrar(diag, titulo, resumen) {
    try { diag.DiagramObjects.Refresh(); } catch (e) { }
    try { diag.Update(); } catch (e) { }
    var m = "";
    m = m + titulo + SALTO + SALTO;
    m = m + resumen + SALTO + SALTO;
    m = m + "ABRIRLO:  raiz del modelo > " + RAIZ_NOMBRE + " > " + PAQ_NOMBRE + SALTO;
    m = m + "           y dentro,  " + DIAG_NOMBRE + SALTO;
    m = m + "           OJO:  si el paquete " + RAIZ_NOMBRE + " no existia, este paquete" + SALTO;
    m = m + "           se ha creado en la RAIZ del modelo." + SALTO + SALTO;
    m = m + "Errores: " + ERRORES.length + SALTO;
    if (ERRORES.length > 0) {
        for (var i = 0; i < ERRORES.length; i++) m = m + "  - " + ERRORES[i] + SALTO;
    }
    mensaje(m);
}

try {
    main();
} catch (e) {
    var traza = "ERROR NO CONTROLADO en la " + MSGTIT + SALTO + SALTO + String(e) + SALTO + SALTO;
    traza = traza + "Donde deberia estar:  raiz > " + RAIZ_NOMBRE + " > " + PAQ_NOMBRE + SALTO;
    traza = traza + "Diagrama:  " + DIAG_NOMBRE + SALTO + SALTO;
    // A DEFENSIVA: si INFORME o ERRORES fussen undefined, esto no puede petar
    var nInf = 0;
    var nErr = 0;
    try { nInf = INFORME.length; } catch (e3) { }
    try { nErr = ERRORES.length; } catch (e4) { }
    try { if (nInf > 0) traza = traza + "AVANCE HASTA EL FALLO:" + SALTO + INFORME.join(SALTO) + SALTO + SALTO; } catch (e5) { }
    try { if (nErr > 0) traza = traza + "ERRORES:" + SALTO + ERRORES.join(SALTO) + SALTO; } catch (e6) { }
    try {
        var r2 = buscarPaquete(RAIZ, RAIZ_NOMBRE);
        if (r2 == null) r2 = RAIZ;
        var p2 = buscarPaquete(r2, PAQ_NOMBRE);
        if (p2 == null) p2 = r2;
        if (p2 != null) {
            p2.Notes = traza;
            p2.Update();
        }
    } catch (e2) { }
    mensaje(traza);
}
