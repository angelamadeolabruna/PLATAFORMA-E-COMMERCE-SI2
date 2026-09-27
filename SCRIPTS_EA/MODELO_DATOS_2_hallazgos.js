// ================================================================
// MODELO DE DATOS  ·  Diagrama de clases  ·  PARTE 2 de 3
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

var ANCHO_NOTA = 700;
var Y_NOTA0 = 250;
var ALTO_LINEA_NOTA = 10;
var ALTO_MIN_NOTA = 130;
var SEPARACION_NOTA = 26;

var ALTO = 14;
var ERRORES = [];
var INFORME = [];
var CONECTORES_PUESTOS = 0;
var X_NOTA = 2300;

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

var HAL = [
    ["1. 51 tablas, 88 relaciones, y UN solo CHECK, y está en la tabla equivocada", [
        "La cuenta del modelo, entera, y no hay que suavizarla:",
        "",
        "  51 tablas          todas en schema.sql, de la L23 a la L555",
        "  340 columnas",
        "  88 claves foráneas",
        "  22 ON DELETE CASCADE, 2 ON DELETE SET NULL, 64 sin nada",
        "   7 índices",
        "   1 CHECK",
        "   0 ALTER TABLE",
        "   0 vistas",
        "   0 enums",
        "   0 dominios de CHECK",
        "",
        "Y EL ÚNICO CHECK DEL ESQUEMA ENTERO ES ESTE, schema.sql L294:",
        "",
        "  cantidad  INTEGER NOT NULL CHECK (cantidad > 0),",
        "",
        "  Y ESTÁ EN orden_compra_items, L290-300.   O sea que la única",
        "  invariante que la base de datos protege en todo el proyecto es",
        "  que la cantidad de una LÍNEA DE COMPRA sea positiva.   Y es la",
        "  cantidad menos importante que hay en el sistema.",
        "",
        "LO QUE QUEDA SIN PROTEGER, y esto es lo que hay que mirar:",
        "",
        "  carrito_items.cantidad        puede ser 0 o negativa",
        "  venta_items.cantidad          puede ser 0 o negativa",
        "  reserva_items.cantidad        puede ser 0 o negativa",
        "  inventario_stock              LAS CUATRO cantidades pueden",
        "                               ser negativas, y no hay ni una",
        "                               que lo impida",
        "  preferencias_cliente.puntaje  puede ser negativo o nulo",
        "  movimientos_inventario        cantidad y stock_anterior y",
        "                               stock_posterior sin comprobar",
        "  comprobantes / ventas         total y subtotal sin comprobar",
        "  sesion_ra                     todo sin comprobar",
        "",
        "Y NO ES QUE NO SE PUEDA, ES QUE NO SE HIZO, porque el modelo tiene",
        "capacity de sobra: hay 7 índices y cero ALTER TABLE.   Se puso el",
        "índice antes que el CHECK.",
        "",
        "CONSECUENCIA, y es la que se ve: la integridad de los datos la",
        "sostiene el TypeScript, que son 147 ficheros de aplicación, y si",
        "alguien inserta con psql o con un script de carga, el modelo no",
        "dice nada.   Y CU31 ya mostró lo que pasa cuando el único sitio que",
        "valida el disponible es el código: la prenda se vende dos veces."
    ]],
    ["2. ventas.estado dice lo contrario de lo que pasa", [
        "El hallazgo que más confunde a quien lea el modelo, porque es",
        "una contradicción directa entre el esquema y el código.",
        "",
        "LO QUE DICE EL MODELO, schema.sql L395:",
        "",
        "  estado  VARCHAR(20) DEFAULT 'Completada',",
        "",
        "O SEA QUE SEGÚN EL MODELO, UNA VENTA NACE COMPLETADA.",
        "",
        "LO QUE HACE EL CÓDIGO, SRV_VentasService L238-240, que es el",
        "ÚNICO INSERT INTO ventas del proyecto:",
        "",
        "  INSERT INTO ventas (..., estado, fecha_venta)",
        "  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pendiente', NOW())",
        "",
        "O SEA QUE EL INSERT PONE SIEMPRE 'Pendiente' Y NUNCA USA EL",
        "DEFAULT.   El DEFAULT está muerto, y no por casualidad: nadie",
        "loexercise porque el único INSERT lo pisa.",
        "",
        "Y PEOR: el DEFAULT ES LO CONTRARIO DE LA VERDAD, así que",
        "cualquier INSERT nuevo que olvide la columna crea una venta",
        "cobrada que nadie ha cobrado.   Y el modelo no avisa, porque no",
        "hay CHECK ni enum ni tabla de estados.",
        "",
        "Y LA MÁQUINA DE ESTADOS DE ESA COLUMNA NO EXISTE, y esto es lo",
        "que se ve en el diagrama: la columna estado está repetida en",
        "14 tablas, y las 14 son VARCHAR(20) con un DEFAULT distinto, y",
        "el proyecto entero usa UN SOLO valor, que es 'Completada',",
        "escrito a mano en 2 sitios:",
        "",
        "  Pagos L334   UPDATE ventas SET estado = 'Completada'",
        "  Pagos L696   UPDATE ventas SET estado = 'Completada'",
        "",
        "Los otros valores que sí usa el código, cada uno en su sitio y",
        "en minúsculas o mayúsculas según el módulo, son:",
        "",
        "  ventas              Pendiente, Completada",
        "  carritos            Activo, En pago, Convertido a venta",
        "  reservas            Solicitada, En tienda, Cumplida, Cancelada",
        "  transacciones_pago  Pendiente, Aprobado, Rechazado",
        "  ordenes_compra      Pedida, Recibida",
        "  respaldos           En Progreso",
        "",
        "O SEA QUE HAY UNAS 12 MÁQUINAS DE ESTADO DISTINTAS, ESCRITAS",
        "COMO LITERALES SUELTOS, SIN NINGÚN LUGAR DONDE ESTAR DEFINIDAS.",
        "El diagrama lo enseña así a propósito: la columna se dibuja con",
        "sus valores, y los valores no están en ninguna parte del modelo."
    ]],
    ["3. estado_stock: una columna que el modelo declara y nadie escribe", [
        "El hallazgo que ya apareció en CU31, y que aquí es de otro",
        "tipo: no es que la columna esté mal, es que NO ES UNA COLUMNA",
        "DE DATOS. Es un dato derivado, y el modelo lo trata como si",
        "fuera almacenado.",
        "",
        "EL MODELO, schema.sql L237-244:",
        "",
        "  CREATE TABLE producto_talla_color (",
        "    id_ptc        SERIAL PRIMARY KEY,",
        "    id_producto   INTEGER REFERENCES productos(id_producto),",
        "    id_talla      INTEGER REFERENCES tallas(id_talla),",
        "    id_color      INTEGER REFERENCES colores(id_color),",
        "    estado_stock  VARCHAR(20) DEFAULT 'Disponible',",
        "    UNIQUE (id_producto, id_talla, id_color)",
        "  );",
        "",
        "LO QUE PASA EN REALIDAD:",
        "",
        "  escrituras de estado_stock en los 147 .ts y .tsx   CERO",
        "  escrituras de estado_stock en todo schema.sql       CERO",
        "",
        "O SEA QUE LA COLUMNA NUNCA CAMBIA DE VALOR.   Se queda en",
        "'Disponible' desde el INSERT que la creó, para siempre.",
        "",
        "Y ESO LA CONVIERTE EN UNA COLUMNA QUE MIENTE, porque hay 6",
        "sitios que la leen para DECIDIR si una prenda está disponible:",
        "",
        "  SRV_CarritoService    L246   si es 'sin stock', rechaza",
        "  SRV_ReservasService  L1197   si NO es 'disponible', rechaza",
        "  SRV_ReservasService   L330   WHERE estado_stock = 'Disponible'",
        "  SRV_ReservasService   L383   WHERE estado_stock = 'Disponible'",
        "  SRV_VentasService     L197   si NO es 'Disponible', rechaza",
        "  SRV_VentasService     L315   WHERE estado_stock <> 'Sin stock'",
        "",
        "Y OJO CON QUE NO COINCIDEN ENTRE SÍ: Carrito L246 busca",
        "'sin stock' en minúscula y Reservas L1197 busca 'disponible'",
        "en minúscula, y la columna tiene 'Disponible' y 'Sin stock'",
        "con mayúscula.   O sea que dos de las seis comparaciones no",
        "pueden ser ciertas NI SIQUIERA si alguien escribiera la",
        "columna, por las mayúsculas.   Y las otras cuatro son",
        "siempre ciertas, porque el valor nunca cambia.",
        "",
        "EL DIAGRAMA DIBUJA LA COLUMNA IGUAL, y con la nota de que no",
        "la escribe nadie, porque el modelo la declara y eso hay que",
        "enseñarlo.   Lo que NO se dibuja es la regla que el documento",
        "pide, L176 punto d: si disponible mas reservada es 0, Sin",
        "stock; si disponible es menor o igual que stock_minimo_alert,",
        "Bajo; si no, Disponible.   Esa regla NO EXISTE en el modelo,",
        "ni en el esquema, ni en el código.",
        "",
        "LO QUE LA ARREGLA, y es una decisión de diseño: se borra la",
        "columna y se sustituye por una vista, o por el EXISTS que ya",
        "escribe SRV_RecomendacionesService L197-198 sobre",
        "inventario_stock.   Ese EXISTS es la única comprobación de",
        "stock REAL que hay en el proyecto, y es una recomendación, que",
        "es lo último que se audita."
    ]],
    ["4. inventario_stock: cuatro cantidades y ni una regla que las ate", [
        "El hallazgo que CU31 encontró desde el otro lado, y que aquí",
        "se ve en el modelo: las cuatro cantidades son datos sueltos.",
        "",
        "EL MODELO, schema.sql L302-311:",
        "",
        "  CREATE TABLE inventario_stock (",
        "    id_stock            SERIAL PRIMARY KEY,",
        "    id_ptc              INTEGER REFERENCES producto_talla_color(id_ptc),",
        "    id_sucursal         INTEGER REFERENCES sucursales(id_sucursal),",
        "    cantidad_disponible INTEGER DEFAULT 0,",
        "    cantidad_reservada  INTEGER DEFAULT 0,",
        "    cantidad_vendida    INTEGER DEFAULT 0,",
        "    stock_minimo_alert  INTEGER DEFAULT 0,",
        "    UNIQUE (id_ptc, id_sucursal)",
        "  );",
        "",
        "LAS CUATRO SON INTEGER, LAS CUATRO CON DEFAULT 0, Y NINGUNA DE",
        "LAS CUATRO TIENE CHECK.   Así que las cuatro pueden ser",
        "negativas, y el modelo lo permite.",
        "",
        "Y LO QUE NO EXISTE ES LA RELACIÓN ENTRE ELLAS.   En un modelo de",
        "tienda de ropa, cantidad_disponible, cantidad_reservada y",
        "cantidad_vendida tienen que obeyecer una ecuación, y aquí no hay",
        "nada que la imponga:",
        "",
        "  NO hay CHECK de que disponible mas reservada mas vendida sea",
        "       el stock total",
        "  NO hay CHECK de que disponible sea mayor o igual que cero",
        "  NO hay CHECK de que reservada sea mayor o igual que cero",
        "  NO hay vista que calcule nada de esto",
        "  NO hay función en el esquema que lo calcule",
        "",
        "O SEA QUE LA ECUACIÓN DEL INVENTARIO NO ESTÁ ESCRITA EN NINGÚN",
        "SITIO DEL PROYECTO.   Los tres números son independientes, y",
        "cualquier UPDATE puede dejarlos incoherentes para siempre.",
        "",
        "Y CUANTAS VECES SE ESCRIBE CADA UNA, contadas en el proyecto:",
        "",
        "  cantidad_disponible   2   el trigger de L648, y Reservas L710",
        "  cantidad_reservada    4   Reservas L709, L979 y L1117, y",
        "                              schema.sql L761, en una función",
        "                              que no llama nadie",
        "  cantidad_vendida      2   Pagos L341 y L711, los dos de cobro",
        "  stock_minimo_alert    -   en el modelo y en el panel, pero",
        "                              nadie lo lee en ninguna consulta",
        "",
        "O SEA QUE LA COLUMNA QUE SERIA EL UNICO LUGAR DONDE PODRIA",
        "VIVIR LA REGLA, stock_minimo_alert, NO SE USA PARA NADA, Y LA",
        "QUE LA RESPETA EL MODELO, la UNIQUE DE L310, ES LA UNICA COSA",
        "QUE SI ESTA Y SIRVE: es la que hace que el ON CONFLICT del",
        "trigger pueda funcionar, y CU31 lo confirmo contando los dos"
    ]],
    ["5. Dos columnas que el código usa y el modelo no tiene", [
        "El hallazgo que demuestra que el modelo y la aplicación NO",
        "están sincronizados, y son dos columnas concretas.",
        "",
        "  carritos.token_invitado        NO EXISTE EN schema.sql",
        "  sesiones_ra.foto_resultado     NO EXISTE EN schema.sql",
        "",
        "LAS DOS ESTÁN EN LOS MODELOS DE LA APLICACIÓN, PERO NO EN EL",
        "ESQUEMA.   Y contados los sitios de código que las nombran:",
        "44.   Cuarenta y cuatro.",
        "",
        "PARA token_invitado, SRV_CarritoService, y no es un SELECT",
        "casual, es el MECANISMO ENTERO DEL CARRITO DE INVITADO, que es",
        "el CU25:",
        "",
        "  L80    el tipo de retorno lo declara",
        "  L97    lo pone a null al crear",
        "  L105   WHERE c.token_invitado = $1   o sea, la BUSQUEDA",
        "  L115   SET token_invitado = NULL   al hacerlo propio",
        "  L122   lo pone a null al fusionar",
        "  L139   lo pone a null en otro camino",
        "  L150   WHERE c.token_invitado = $1   otra vez",
        "  L161   lo rellena al crear el carrito invitado",
        "",
        "O SEA QUE EL CARRITO DE INVITADO DEL DOCUMENTO, que es un caso",
        "de uso completo con su propio diagrama de secuencia, FUNCIONA",
        "SOBRE UNA COLUMNA QUE NO ESTÁ EN EL MODELO DE DATOS.   O el",
        "esquema está viejo, o la aplicación escribe en una columna",
        "fantasma que PostgreSQL no tiene y tiraría la consulta.",
        "",
        "Y PARA foto_resultado es peor, porque es una FOTO, o sea un",
        "binario de peso, y en CU24 se vio que la cadena deTypeScript la",
        "monta y la guarda.   En sesiones_ra, schema.sql L480-489, no",
        "hay ninguna columna de imagen.   Y ojo: sesiones_ra es",
        "precisamente la tabla que CU24 dibuja, y la que CU24 ya",
        "acusó de este mismo problema.",
        "",
        "EL DIAGRAMA DIBUJA LAS 51 TABLAS TAL COMO ESTÁN, SIN INVENTAR",
        "LAS DOS COLUMNAS QUE FALTAN.   Y por eso hay que avisar: este",
        "diagrama es el modelo que declara el ESQUEMA, que no es",
        "exactamente el que usa la APLICACIÓN.   La diferencia, por lo",
        "menos, son estas dos columnas."
    ]],
    ["6. 45 de 51 tablas sin un solo índice, y el que se llama de cliente está en la columna del empleado", [
        "Un hallazgo de rendimiento, y el nombre del índice es lo que",
        "hace que sea confuso de verdad.",
        "",
        "LOS 7 ÍNDICES DEL ESQUEMA, y solo 6 tablas los tienen:",
        "",
        "  L560  idx_bitacora_fecha        bitacora_auditoria (fecha_hora DESC)",
        "  L561  idx_bitacora_tabla        bitacora_auditoria (tabla_afectada)",
        "  L562  idx_mov_inv_ptc_suc       movimientos_inventario (id_ptc, id_sucursal, fecha)",
        "  L563  idx_inventario_sucursal  inventario_stock (id_sucursal)",
        "  L564  idx_ventas_sucursal_fecha ventas (id_sucursal, fecha_venta)",
        "  L565  idx_reservas_cliente      reservas (id_usuario)",
        "  L566  idx_ordenes_proveedor     ordenes_compra (id_proveedor, estado)",
        "",
        "O SEA QUE 45 DE LAS 51 TABLAS NO TIENEN NINGÚN ÍNDICE, y",
        "ninguna de las 7 es UNIQUE, así que no hay ni una restricción",
        "de unicidad que no sea una columna suelta o la UNIQUE de",
        "producto_talla_color y la de inventario_stock.",
        "",
        "Y EL ÍNDICE QUE MIENTE, que es el hallazgo de este apartado:",
        "",
        "  L565  CREATE INDEX idx_reservas_cliente ON reservas (id_usuario);",
        "",
        "SE LLAMA DE CLIENTE Y ESTÁ EN id_usuario, que es el EMPLEADO.",
        "Y la columna que se llama de cliente, id_cliente, L346, NO",
        "TIENE ÍNDICE, y el código la filtra en 3 sitios:",
        "",
        "  Reservas L424   WHERE r.id_cliente = $1",
        "  Reservas L461   WHERE r.id_reserva = $1 AND r.id_cliente = $2",
        "  Reservas L929   WHERE r.id_reserva = $1 AND r.id_cliente = $2",
        "",
        "ASÍ QUE LA CONSULTA DE LAS RESERVAS DE UN CLIENTE, que es la",
        "pantalla principal del módulo, hace un Seq Scan de la tabla",
        "entera.   Y el índice que hay, y que sí se usa, va al revés de",
        "lo que su nombre dice.",
        "",
        "Y LA TABLA HUB, que es la que más se consulta del proyecto, no",
        "tiene índice propio: producto_talla_color es padre de 14",
        "hijos y es la bisagra de todas las consultas de stock, y lo",
        "único que la cubre es el índice de movimientos_inventario.",
        "",
        "Lo que el diagrama enseña aquí es el MODELO, y en el modelo",
        "esto no se ve: un índice no es una clase ni una relación.   Por",
        "eso está en la bandeja de hallazgos y no en las cajas."
    ]],
    ["7. preferencias_cliente admite una fila que no dice nada", [
        "El hallazgo de la tabla peor sobrecargada del modelo, y la",
        "que tiene más claves foráneas por columnas.",
        "",
        "EL MODELO, schema.sql L501-509, y son 7 líneas:",
        "",
        "  CREATE TABLE preferencias_cliente (",
        "    id_preferencia SERIAL PRIMARY KEY,",
        "    id_cliente     INTEGER REFERENCES clientes(id_cliente),",
        "    id_categoria   INTEGER REFERENCES categorias(id_categoria),",
        "    id_talla       INTEGER REFERENCES tallas(id_talla),",
        "    id_color       INTEGER REFERENCES colores(id_color),",
        "    id_temporada   INTEGER REFERENCES temporadas(id_temporada),",
        "    puntaje        INTEGER",
        "  );",
        "",
        "LO QUE NO TIENE, y es la lista completa:",
        "",
        "  NINGUNA columna es NOT NULL, ni siquiera id_cliente",
        "  NINGUNA columna es UNIQUE",
        "  NINGUN indice sobre ninguna columna",
        "  NINGUN CHECK de que el puntaje sea positivo",
        "",
        "CONSECUENCIA 1, Y ES LA DIRECTA: una fila puede tener las CINCO",
        "referencias a NULL y un puntaje NULL, y el modelo la acepta.",
        "Una preferencia que no dice qué prefiere nadie.   Y eso no es",
        "hipotético, porque la aplicación las inserta así:",
        "",
        "  SRV_PreferenciasService L57  INSERT INTO preferencias_cliente",
        "                                (id_cliente, ${dimension}, puntaje)",
        "",
        "La palabra dimension se sustituye en runtime, o sea que la",
        "consulta cambia de forma según de dónde venga la llamada.   Y",
        "CU32 ya vio el hueco de eso: la respuesta devuelve un campo",
        "llamado fuente que dice de dónde sale, y cuando el degradado",
        "es por prenda, L298-305, ese valor no es cierto.",
        "",
        "CONSECUENCIA 2: sin UNIQUE, el mismo par cliente y categoría",
        "puede aparecer tantas veces como quiera, y el 'upsert' que",
        "dice el comentario del propio servicio, L12, no es un upsert:",
        "",
        "  L41   SELECT ... FROM preferencias_cliente   para buscar la fila",
        "  L50   UPDATE preferencias_cliente SET puntaje = puntaje + $2",
        "  L57   INSERT INTO preferencias_cliente",
        "",
        "Eso es un SELECT, y luego UPDATE o INSERT según lo que encuentre,",
        "y entre medias puede entrar otro.   Un UPSERT de verdad es un",
        "INSERT ... ON CONFLICT, que es justo lo que el trigger de",
        "inventario_stock SÍ usa, y con el que funciona, porque tiene",
        "la UNIQUE de L310 detrás.   Aquí no hay UNIQUE detrás, así que",
        "no se puede.",
        "",
        "Y LA DIFERENCIA DE MODELO ENTRE LAS DOS TABLAS ES LA CLAVE:",
        "inventario_stock, que es la que el trigger mueve, tiene UNIQUE",
        "(id_ptc, id_sucursal).   preferencias_cliente, que la aplica",
        "escrita, no tiene ninguna.   El mismo equipo, dos criterios."
    ]],
    ["8. Lo que el modelo sí hace bien, y son cinco cosas", [
        "Un diagrama de 51 clases y 88 líneas es sobre todo un aviso.",
        "Este es el otro lado, y también se cuenta.",
        "",
        "1. LAS 22 ON DELETE CASCADE SON COHERENCIA GRATIS.   22 de las",
        "   88 relaciones borran al hijo cuando muere el padre, y eso es",
        "   integridad referencial de verdad, gratis, sin una linea de",
        "   código.   Y las 2 SET NULL, en producto_imagenes L249 y",
        "   bitacora_auditoria L150, están donde toca: una foto sin",
        "   producto y un registro sin autor tienen que sobrevivir.",
        "   O sea que las 88 tienen ON DELETE pensado, no heredado por",
        "   descuido.   Las 64 que no tienen ON DELETE son RESTRICT, que",
        "   es lo correcto para ventas, pagos y stock.",
        "",
        "2. Y LA UNIQUE DE producto_talla_color ES LA FORMA CORRECTA DE",
        "   MODELAR ESA RELACIÓN.   UNIQUE (id_producto, id_talla,",
        "   id_color), L243, sobre una entidad asociativa.   Es la",
        "   solución de textbook para producto por talla por color, y",
        "   además funciona: es la que hace que la consulta del stock",
        "   de una prenda sea una búsqueda y no un recorrido.",
        "",
        "3. Y LA DE inventario_stock TAMBIÉN, Y CON MÁS RAZÓN, porque es",
        "   la que hace posible el ON CONFLICT del trigger, CU31 L647.",
        "   Sin ese UNIQUE, el INSERT ... ON CONFLICT de L645-648 no",
        "   tendría contra qué conflicto, y el caso de actualizar el",
        "   inventario tras venta no existiría en una sola sentencia.",
        "",
        "4. Y LAS 8 TABLAS RAÍZ NO TIENEN NINGUNA FK.   Son roles,",
        "   usuarios, ciudades, tallas, colores, categorias, temporadas",
        "   y proveedores.   Y eso es lo correcto: son los catálogos y",
        "   las raíces del grafo, y no deben depender de nadie.   El",
        "   grafo de las 88 relaciones arranca limpio desde 8 vértices",
        "   y no tiene ni un ciclo de creación, que es la trampa",
        "   clásica de un modelo de datos.",
        "",
        "5. Y TODAS LAS CLAVES PRIMARIAS SON SERIAL.   Las 51, sin una",
        "   sola excepción y sin ni una clave natural.   Eso evita la",
        "   discusión de si el correo es la clave del usuario, que es",
        "   la pelea más tonta que hay en un modelo de tienda.   Y la",
        "   tabla puente usuarios_roles, L45-49, lo hace todavía mejor:",
        "   PRIMARY KEY (id_usuario, id_rol) y nada más.   Es una tabla",
        "   de unión, y su clave ES la unión, sin columna inventada."
    ]]
];

function guardarYRecargar(diag, paq) {
    try { diag.DiagramObjects.Refresh(); } catch (e) { }
    try { diag.Update(); } catch (e) { }
    try { paq.Diagrams.Refresh(); } catch (e) { }
    try {
        var i = paq.Diagrams.Count - 1;
        while (i >= 0) {
            if (String(paq.Diagrams.GetAt(i).Name) == DIAG_NOMBRE) return paq.Diagrams.GetAt(i);
            i--;
        }
    } catch (e) { }
    return diag;
}

function borrarTodo(diag) {
    try { diag.DiagramObjects.Clear(); } catch (e) { }
    try { diag.Update(); } catch (e) { }
}


function colocarHallazgos(diag, paq) {
    var creados = 0;
    var y = Y_NOTA0;
    var fin = Y_NOTA0;
    for (var i = 0; i < HAL.length; i++) {
        var lineas = HAL[i][1];
        var alto = lineas.length * ALTO_LINEA_NOTA + 26;
        if (alto < ALTO_MIN_NOTA) alto = ALTO_MIN_NOTA;
        var nom = "HALLAZGO " + HAL[i][0];
        var txt = "";
        for (var k = 0; k < lineas.length; k++) {
            if (k > 0) txt = txt + SALTO;
            txt = txt + lineas[k];
        }
        var tam = "l=" + X_NOTA + ";r=" + (X_NOTA + ANCHO_NOTA) + ";t=" + y + ";b=" + (y + alto) + ";";
        var o = null;
        try { o = diag.DiagramObjects.AddNew(tam, "Note"); } catch (e) { o = null; }
        if (o == null) {
            try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e2) { o = null; }
        }
        if (o == null) { ERRORES.push("no se pudo crear la nota " + nom); continue; }
        try { o.Text = txt; } catch (e) { }
        try { o.Notes = txt; } catch (e) { }
        try { o.ManuallySized = true; } catch (e) { }
        try { o.Left = X_NOTA; } catch (e) { }
        try { o.Right = X_NOTA + ANCHO_NOTA; } catch (e) { }
        try { o.Top = 0 - y; } catch (e) { }
        try { o.Bottom = 0 - (y + alto); } catch (e) { }
        try { o.FontSize = 8; } catch (e) { }
        try { o.WrapText = true; } catch (e) { }
        try { o.BorderStyle = 1; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        try { o.Update(); } catch (e) { }
        try { o.Text = txt; o.Update(); } catch (e) { }
        creados++;
        fin = y + alto;
        y = fin + SEPARACION_NOTA;
    }
    try { diag.Update(); } catch (e) { }
    // ---- la comprobacion de colocacion, leida del modelo de objetos
    var leidos = 0;
    var bien = 0;
    for (var q = 0; q < diag.DiagramObjects.Count; q++) {
        var ob = null;
        try { ob = diag.DiagramObjects.GetAt(q); } catch (e) { ob = null; }
        if (ob == null) continue;
        leidos++;
        var l = 0; var rr = 0; var t = 0; var b = 0;
        try { l = ob.Left; rr = ob.Right; t = ob.Top; b = ob.Bottom; } catch (e) { }
        var alto2 = b - t;
        var ancho2 = rr - l;
        if (ancho2 > 5 && alto2 < -5) bien++;
    }
    return { total: creados, fin: fin, leidos: leidos, bien: bien };
}


function main() {
    var raiz = buscarPaquete(RAIZ, RAIZ_NOMBRE);
    if (raiz == null) raiz = RAIZ;
    var paq = buscarPaquete(raiz, PAQ_NOMBRE);
    if (paq == null) { ERRORES.push("el paquete " + PAQ_NOMBRE + " no existe: ejecuta antes la PARTE 1"); cerrar(null, "PARTE 2", "No se ha dibujado nada."); return; }
    var diag = buscarDiagrama(paq);
    if (diag == null) { ERRORES.push("el diagrama " + DIAG_NOMBRE + " no existe: ejecuta antes la PARTE 1"); cerrar(null, "PARTE 2", "No se ha dibujado nada."); return; }
    borrarHallazgos(diag);
    diag = guardarYRecargar(diag, paq);
    var h = colocarHallazgos(diag, paq);
    diag = guardarYRecargar(diag, paq);
    INFORME.push("hallazgos colocados: " + h.total + " de " + HAL.length);
    INFORME.push("banda hasta la y " + h.fin);
    INFORME.push("objetos: " + h.leidos + ", colocados: " + h.bien);
    cerrar(diag, "PARTE 2 de 3: la bandeja de los " + HAL.length + " hallazgos", INFORME.join(SALTO));
}

function borrarHallazgos(diag) {
    try {
        for (var i = diag.DiagramObjects.Count - 1; i >= 0; i--) {
            var o = diag.DiagramObjects.GetAt(i);
            if (o.ObjectType == "Note" || o.ObjectType == "Text") { try { o.Delete(); } catch (e) { } }
        }
    } catch (e) { }
    try { diag.Update(); } catch (e) { }
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
