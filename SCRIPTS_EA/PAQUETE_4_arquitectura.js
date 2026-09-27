// ================================================================
// PAQUETE 4  ·  ARQUITECTURA DEL SUBSISTEMA
// Gestion de Catalogo  ·  CU10, CU11, CU12, CU13
// E-COMMERCE TIENDA MONTANO   ·   Seccion 5.3.4
//
// QUE DIBUJA
//   El diagrama de componentes del paquete 4, con los 20 componentes
//   del subsistema y las 34 interfaces entre ellos, y TODO DENTRO de
//   un marco que se llama PAQUETE 4 - CATALOGO.
//
//   20 componentes:  6 de presentacion, 4 de control, 4 de logica,
//                    2 del paquete 1 y 4 de datos
//   34 interfaces
//
//   Es el paquete con MAS RUTAS DEL SISTEMA: 26, de las cuales 4 son
//   publicas y 22 de administracion.  Y el unico con CUATRO
//   controladores.
//
// PATRON COPIADO DE CAPAS_diagrama_por_capas.js, QUE SI DIBUJA BIEN
//   -  Los marcos son Package REALES del modelo, con Sequence = 1
//      para que EA los deje DETRAS del contenido.  El nombre del
//      Package es la etiqueta del marco.  No son formas.
//   -  LAS COORDENADAS VERTICALES VAN EN NEGATIVO.
//   -  DOS PASADAS con guardarYRecargar entre ellas.
//   -  El conector se coloca con con.DiagramID = diag.ID.
//
// EL HALLAZGO DE ESTE PAQUETE
//   Los 4 servicios de este paquete son EL UNICO GRUPO DEL PROYECTO
//   QUE NO USA NI UN REPOSITORIO.  63 llamadas a dataSource, cero
//   getRepository y cero QueryBuilder.  Todo es SQL escrito a mano.
//
//   Y ESO HACE QUE EL CATALOGO SEA EL PAQUETE QUE ACERTA CON EL
//   STOCK.  Los otros tres que leen disponibilidad, carrito, reservas
//   y ventas, filtran por la columna estado_stock.  El catalogo no:
//   usa cantidad_disponible, que es el numero de verdad.  La columna
//   estado_stock no la mira nadie de este paquete.
//
//   Por que importa: estado_stock se escribe UNA SOLA VEZ, al dar de
//   alta un producto, con el literal 'Disponible', y no cambia nunca.
//   Y 4 paquetes la comparan de 4 maneras distintas: 'sin stock',
//   'Disponible', 'disponible' y 'Sin stock'.  Cuatro escrituras de
//   un estado que solo tiene un valor posible.
//
// Aviso con WScript.Shell.Popup.  Sin llamadas a SQL y sin
// SaveDiagram.  Una instruccion por linea.  Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================


var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var PAQ_NOMBRE = "Paquete 4 - Catalogo";
var DIAG_NOMBRE = "Arquitectura del Paquete 4";

var TOTAL_CMP = 20;
var TOTAL_REL = 34;
var TOTAL_CAP = 5;

var ERRORES = [];
var INFORME = [];

var MARCO_NOMBRE = "PAQUETE 4 - GESTION DE CATALOGO";
var MARCO_X = 10;
var MARCO_Y = 10;
var MARCO_W = 1780;
var MARCO_H = 860;
var MARCO_COLOR = 15132358;

// nombre, izquierda, arriba, ancho, alto, color
var CAPAS = [
    ["Presentacion", 30, 60, 1000, 220, 13421823],
    ["Control", 30, 320, 1000, 200, 13434879],
    ["Logica de Negocio", 30, 560, 1000, 200, 13434828],
    ["Del Paquete 1", 1070, 60, 680, 200, 16777164],
    ["Datos", 1070, 300, 680, 520, 16770790]
];


// ================================================================
// LOS 20 COMPONENTES   [nombre, capa, nota]
// ================================================================

var PAQ = [

    // ---------------- PRESENTACION: 6 ----------------

    ["Catalogo.tsx", "Presentacion",
    "CAPA: Presentacion | CASOS: CU12 Consultar Catalogo con Filtros y parte de CU13 | FICHERO: web/src/pages/Catalogo.tsx, 701 lineas: la septima mas larga del frontend | LLAMA: tres funciones, api.listarCatalogoPublico, api.listarOpcionesCatalogo y api.consultarDisponibilidad | ES UNA DE LAS DOS UNICAS PANTALLAS SIN SESION DEL PAQUETE, y por eso el backend no le pone guardia: se puede entrar al catalogo sin cuenta | TIENE EL FILTRADO COMPLETO, con las tallas, los colores y las categorias, y las saca de la ruta de opciones y no de la de listado"],

    ["Producto.tsx", "Presentacion",
    "CAPA: Presentacion | CASOS: parte de CU12 y CU13 Consultar Disponibilidad por Sucursal | FICHERO: web/src/pages/Producto.tsx, 831 LINEAS: **ES LA PAGINA MAS LARGA DE LAS 35 DEL FRONTEND**, mas que AdminOrdenesCompra con 794 y que Sucursales con 780. Ojo con el matiz: hay un componente de React mas largo, VestidorRa.tsx con 1.110 del paquete 7, pero no es una pagina | LLAMA: api.consultarDisponibilidad, la de la ruta publico/:codigo/disponibilidad | UNA SOLA RUTA Y OCHOCIENTAS LINEAS: la pantalla se come el detalle del producto, la galeria por color, el selector de talla, el de color y la tabla de disponibilidad por sucursal, que es una tabla y no un numero | ES LA QUE MAS MEJOR ESTA HECHA DEL LADO DE LA DISPONIBILIDAD, y no por el backend sino por la pantalla: pide la disponibilidad y la enseña como esta, sin decidir por su cuenta si hay stock"],

    ["AdminCatalogoProductos.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU10 Registrar Producto de Ropa en Catalogo | FICHERO: web/src/pages/admin/AdminCatalogoProductos.tsx, 477 lineas: la mas corta de las tres de administracion de este paquete | LLAMA: tres funciones, api.obtenerSelectoresProducto, api.listarProductos y api.crearProducto | ES LA UNICA QUE DA DE ALTA UNA PRENDA, y por eso la unica que tiene que resolver el problema de los tres maestros a la vez: un producto no tiene talla ni color propios, tiene combinaciones"],

    ["AdminCatalogos.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU11 Gestionar Tallas, Colores y Categorias | FICHERO: web/src/pages/admin/AdminCatalogos.tsx, 684 lineas | LLAMA: doce funciones, las cuatro de cada maestro: listar, crear, actualizar e inhabilitar | **UNA PANTALLA, TRES MAESTROS, DOCE OPERACIONES.** Y el patron se repite exactamente igual en los tres: no hay un boton de borrar en ninguno de los tres, solo de inhabilitar | ES LA PANTALLA QUE MAS REPETICION TIENE DEL PROYECTO, y eso es lo que hace que 684 lineas parezcan muchas y sean tres veces la misma"],

    ["AdminTemporadas.tsx", "Presentacion",
    "CAPA: Presentacion | CASOS: CU10 y CU11, para temporadas y colecciones | FICHERO: web/src/pages/admin/AdminTemporadas.tsx, 642 lineas | LLAMA: ocho funciones, las cuatro de temporada y tres de coleccion | LA COLECCION TIENE UNA RUTA MENOS QUE LOS OTROS TRES MAESTROS: no hay PATCH para jariarla, o sea que una coleccion no se puede inhabilitar. Es la unica de las siete operaciones de maestro que falta"],

    ["api.ts", "Presentacion",
    "CAPA: Presentacion | FICHERO: web/src/lib/api.ts | EL CLIENTE HTTP DEL PAQUETE | VEINTISEIS rutas, todas bajo dos prefijos: catalogo para las 4 publicas, y admin/catalogo, admin/catalogos y admin para las 22 de administracion | COMO LLAMA: fetch con credentials: 'include' en las dos variantes | Y DE LAS VEINTISEIS, CUATRO NO LLEVAN GUARDIA EN EL SERVIDOR, que son las de catalogo: las unicas del proyecto abiertas a proposito"],

    // ---------------- CONTROL: 4 ----------------

    ["CTR_Catalogo", "Control",
    "CAPA: Control | CASOS: CU12 y CU13 | FICHERO: api/src/modulos/catalogo/CTR_Catalogo.ts, 74 lineas, el mas pequeno de los cuatro | @Controller('catalogo') con CUATRO rutas y **NINGUNA GUARDIA** | **ES EL UNICO CONTROLADOR DEL PROYECTO QUE NO IMPORTA NADA DEL PAQUETE 1**: sus dos unicos imports son de NestJS y del servicio. No trae la guarda, no trae UsuarioActual y no trae las entidades | POR QUE NO LA TRAE, Y ES LA RAZON DE SER DE ESTE PAQUETE: no se puede poner un JwtAuthGuard en el catalogo, porque entonces no se podria ver la ropa sin cuenta, y ver la ropa sin cuenta es el caso de uso CU12 | TIENE UN TOPE DE RESULTADOS, que es lo unico que hace el controlador: LIMITE_MAX igual a 100, de manera que el listado publico nunca devuelve mas de 100 prendas por pagina, este o no paginado"],

    ["CTR_CatalogoAdmin", "Control",
    "CAPA: Control | CASO: CU10 | FICHERO: api/src/modulos/catalogo/CTR_CatalogoAdmin.ts, 83 lineas | @Controller('admin/catalogo') con @UseGuards(JwtAuthGuard) A NIVEL DE CLASE | TRES rutas: GET productos/selectores, GET productos y POST productos | LA RUTA DE SELECTORES NO TIENE CASO: es la que carga tallas, colores y categorias para el formulario de alta, y existe para que la pantalla no tenga que llamar a tres rutas de tres maestros distintos | IMPORTA DEL PAQUETE 1 LAS DOS PIEZAS: la guarda y UsuarioActual"],

    ["CTR_CatalogosAdmin", "Control",
    "CAPA: Control | CASO: CU11 | FICHERO: api/src/modulos/catalogo/CTR_CatalogosAdmin.ts, 209 lineas: el mas largo de los cuatro controladores | @Controller('admin/catalogos') con la guarda a NIVEL DE CLASE | DOCE rutas, y son las doce de los tres maestros: cuatro de tallas, cuatro de colores y cuatro de categorias. Las cuatro operaciones de cada uno son listar, crear, actualizar y PATCH para cambiar el estado | **LAS DOCE RUTAS TIENEN EXACTAMENTE LA MISMA FORMA**, ruta por ruta, y en el mismo orden. Es el unico controlador del proyecto donde se puede leer el patron entero en una pantalla | NO HAY NINGUN DELETE EN LAS DOCE**: el estado se cambia con un PATCH y nada se borra, igual que en el paquete 3"],

    ["CTR_TemporadasAdmin", "Control",
    "CAPA: Control | CASOS: CU10 y CU11 | FICHERO: api/src/modulos/catalogo/CTR_TemporadasAdmin.ts, 144 lineas | **@Controller('admin') A SECAS, Y NO admin/catalogo COMO SU HERMANO.** Es la excepcion del paquete: de los 4 controladores, 3 usan un prefijo propio y este usa el generico | SIETE rutas: cuatro de temporadas y tres de colecciones | LA CONSECUENCIA DE ESE PREFIJO: admin lo comparten 5 controladores del proyecto con 29 rutas, 4 del modulo seguridad y este de aqui. O sea que el prefijo admin cruza dos modulos y dos paquetes, y se distinguen por el subcamino: ciudades, sucursales, empleados, roles, auditoria, temporadas y colecciones | LE FALTA UNA RUTA RESPECTO A SUS HERMANOS: no hay PATCH de estado para las colecciones, de manera que una coleccion no se puede inhabilitar"],

    // ---------------- LOGICA DE NEGOCIO: 4 ----------------

    ["SRV_CatalogoService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/catalogo/SRV_CatalogoService.ts, 341 lineas | METODOS: 3. consultarDisponibilidad, listarPublico y opcionesFiltros, que son las 4 rutas publicas, porque opcionesFiltros devuelve tallas, colores y categorias en una sola llamada | **ES EL UNICO SERVICIO DEL PAQUETE QUE NO IMPORTA NADA DEL PAQUETE 1**: ni la guarda, ni la bitacora, ni las entidades. Los tres imports son de NestJS y del motor. Es coherente: no escribe nada, y lo que no se escribe no se audita | **Y ES EL UNO QUE ACIERTA CON LA DISPONIBILIDAD**: en vez de mirar la columna estado_stock, mira el numero. La consulta de disponibilidad filtra por cantidad_disponible mayor que cero, y la del listado usa un EXISTS sobre inventario_stock. Y el aviso de poco stock lo CALCULA, en vez de leerlo: stock_bajo es verdadero cuando el minimo es mayor que cero y el disponible es menor o igual que ese minimo | SUS DOCE LLAMADAS SON SQL ESCRITO A MANO, sin una sola linea con getRepository"],

    ["SRV_CatalogosService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/catalogo/SRV_CatalogosService.ts, 634 LINEAS: el servicio mas largo del proyecto despues del de reservas | METODOS: 12, y son DOCE, que es uno por cada ruta de los tres maestros. Cuatro por maestro: listar, crear, actualizar e inhabilitar | Y LOS DOCE METODOS SON EL MISMO METODO ESCRITO TRES VECES, con el nombre de la tabla cambiado. Es lo que hace que 634 lineas de un CRUD se convierta en la mitad del paquete | ES EL SERVICIO QUE MAS REPETICION TIENE DE TODO EL BACKEND, y a la vez el mas uniforme: las doce rutas hacen exactamente lo mismo y con el mismo orden de operaciones | LAS VEINTIDOS LLAMADAS SON SQL A MANO, y es el mayor numero de los cuatro servicios"],

    ["SRV_ProductosService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/catalogo/SRV_ProductosService.ts, 292 lineas | METODOS: 3, para 3 rutas | **AQUI ESTA LA UNICA ESCRITURA DE estado_stock DE TODO EL PROYECTO**: la linea 198 inserta el producto en producto_talla_color con el valor 'Disponible' puesto como literal en el propio INSERT, una vez por cada combinacion de talla y color | O SEA QUE LA COLUMNA TIENE UN SOLO VALOR POSIBLE Y SE ESCRIBE UNA SOLA VEZ. No hay ningun UPDATE de estado_stock en ningun sitio, y no lo hay porque nadie lo necesita: la disponibilidad real esta en inventario_stock, que es la que mueve el disparador del motor | TAMBIEN ES EL QUE RESUELVE EL PROBLEMA DE LAS COMBINACIONES: al dar de alta una prenda genera una fila de producto_talla_color por cada talla y cada color elegidos, y el esquema tiene un UNIQUE de esas tres columnas, de manera que la misma combinacion no se puede repetir | CATORCE LLAMADAS, todas SQL a mano"],

    ["SRV_TemporadasService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/catalogo/SRV_TemporadasService.ts, 518 lineas | METODOS: 7, cuatro de temporadas y tres de colecciones, el mismo reparto de rutas que su controlador | ES EL UNICO DE LOS CUATRO QUE TIENE EL METODO DE INHABILITAR SOLO PARA UNO DE SUS DOS MAESTROS: listarTemporadas, crearTemporada, actualizarTemporada e inhabilitarTemporada, y luego listarColecciones, crearColeccion y actualizarColeccion. La coleccion no tiene con que jariarse | QUINCE LLAMADAS, todas SQL a mano, y trae la bitacora del paquete 1 para las cuatro operaciones de escritura"],

    // ---------------- DEL PAQUETE 1: 2 ----------------

    ["dependencias.ts", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/dependencias.ts, 148 lineas | LA USA 3 DE LOS 4 CONTROLADORES, y el que no la usa es justamente el publico | LOS TRES MONTAN LA GUARDIA A NIVEL DE CLASE, de manera que con una linea quedan protegidas las 3, las 12 y las 7 rutas. En total, 22 de las 26 rutas del paquete | Y UsuarioActual, que las cuatro rutas de listado necesitan para saber quien pregunta y que permiso tiene"],

    ["SRV_BitacoraService", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/SRV_BitacoraService.ts, 40 lineas | LA USA 3 DE LOS 4 SERVICIOS, y el que no la usa es el publico, que no escribe nada | ES LO QUE HACE QUE LOS CAMBIOS DE MAESTRO SEAN AUDITABLES: cada alta, cada modificacion y cada cambio de estado deja rastro. El paquete tiene 22 rutas de escritura y las 22 quedan registradas | **Y NO LA USA SRV_CatalogoService, Y ESO NO ES OLVIDO**: leer no se audita. Es el unico servicio de los siete paquetes documentados que se salta la bitacora a proposito"],

    // ---------------- DATOS: 4 ----------------

    ["CE_Modelos.ts (seguridad)", "Datos",
    "CAPA: Datos | FICHERO: api/src/modulos/seguridad/CE_Modelos.ts | LO USA SOLO PARA EL TIPO Usuario, y unicamente los tres controladores de administracion. El publico no lo trae, y SRV_CatalogoService tampoco | ES LA DEPENDENCIA MAS BARATA DEL PAQUETE: una clase, usada como tipo de un parametro de decorador, sin una sola consulta"],

    ["producto_talla_color", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **ES LA TABLA QUE SOSTIENE TODO EL PAQUETE, Y LA QUE NO SE ENTREVISTE CON NADIE**: 5 columnas, y las tres primeras son las que unen el producto con la talla y con el color | TIENE UN UNIQUE DE LAS TRES JUNTAS, de manera que la misma combinacion de producto, talla y color no se puede repetir. Es la restriccion que hace que el alta de una prenda genere una fila por combinacion y no mas | **SOLO UNA DE SUS TRES CLAVES FORANEAS TIENE ON DELETE**: id_producto es CASCADE, e id_talla e id_color son RESTRICT. O sea que se puede borrar el producto y se arrastran sus combinaciones, pero no se puede borrar una talla que este en uso sin quitar antes la combinacion | Y LA QUINTA COLUMNA, estado_stock, es la que se escribe una vez y no vuelve a cambiar"],

    ["inventario_stock", "Datos",
    "CAPA: Datos | FICHERO: la tabla | NO ES DE ESTE PAQUETE, Y AUNQUE ASI SRV_CatalogoService LA LEE PARA MOSTRAR LA DISPONIBILIDAD | **ES LA QUE MUEVE EL DETERMINO**: el catalogo no calcula el stock de ningun sitio, lo lee de aqui. Y aqui lo baja el disparador trg_movimiento_inventario del motor, no el codigo | O SEA QUE LA CADENA ES: el codigo escribe un movimiento, el disparador descuenta el disponible, y el catalogo lo lee y lo enseña. Los tres pasos no estan en el mismo fichero, y esa es la razon por la que el catalogo acierte y los otros tres no | SU CLAVE PRIMARIA ES COMPUESTA, por id_ptc e id_sucursal, de manera que el mismo modelo puede tener distinta cantidad en cada tienda"],

    ["PostgreSQL 16", "Datos",
    "CAPA: Datos | LAS DIEZ TABLAS PROPIAS DEL PAQUETE, QUE SON LAS MAS DE CUALQUIER PAQUETE: productos con 11 columnas, producto_talla_color con 5, producto_imagenes con 6, producto_precios con 5, colecciones con 5, temporadas con 5, y tallas, colores y categorias con 4 cada una | **LOS CUATRO MAESTROS SON TABLAS GEMELAS**: tallas, colores, categorias y temporadas tienen 4 columnas, cero claves foraneas y un NOT NULL, que es el nombre con UNIQUE. Se podrian resolver con una sola tabla de tipo maestro, y el proyecto eligio cuatro. Es una decision discutible pero coherente | **Y ESO TIENE UN COSTE**: Producto.tsx tiene 831 lineas porque tiene que manejar los tres maestros por separado, y el catalogo publico devuelve las tallas y los colores en dos subconsultas, con LOWER y ORDER BY, una por maestro | LAS UNIQUE DEL PAQUETE SON SEIS: los nombres de los cuatro maestros, mas productos.codigo, mas el UNIQUE de las tres columnas juntas de producto_talla_color | Y NINGUNA DE LAS CUATRO TABLAS MAESTRO TIENE ON DELETE, o sea que son RESTRICT. Borrar una talla que este en una combinacion es un error de integridad, y por eso el paquete no tiene ni una ruta de borrado"]
];


// ================================================================
// LAS 34 INTERFACES   [origen, destino, nombre, tipo, estereotipo]
// ================================================================

var REL = [
    ["Catalogo.tsx", "api.ts", "3 funciones publicas", "Assembly", "llama"],
    ["Producto.tsx", "api.ts", "consultarDisponibilidad", "Assembly", "llama"],
    ["AdminCatalogoProductos.tsx", "api.ts", "3 funciones de producto", "Assembly", "llama"],
    ["AdminCatalogos.tsx", "api.ts", "12 funciones de maestros", "Assembly", "llama"],
    ["AdminTemporadas.tsx", "api.ts", "8 funciones de temporada", "Assembly", "llama"],

    ["api.ts", "CTR_Catalogo", "HTTP/JSON, 4 rutas sin guardia", "Assembly", "expone"],
    ["api.ts", "CTR_CatalogoAdmin", "HTTP/JSON, 3 rutas de admin", "Assembly", "expone"],
    ["api.ts", "CTR_CatalogosAdmin", "HTTP/JSON, 12 rutas de admin", "Assembly", "expone"],
    ["api.ts", "CTR_TemporadasAdmin", "HTTP/JSON, 7 rutas de admin", "Assembly", "expone"],

    ["CTR_Catalogo", "SRV_CatalogoService", "3 metodos para 4 rutas", "Dependency", "delega"],

    ["CTR_CatalogoAdmin", "SRV_ProductosService", "3 metodos, uno por ruta", "Dependency", "delega"],
    ["CTR_CatalogoAdmin", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_CatalogoAdmin", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["CTR_CatalogosAdmin", "SRV_CatalogosService", "12 metodos, uno por ruta", "Dependency", "delega"],
    ["CTR_CatalogosAdmin", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_CatalogosAdmin", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["CTR_TemporadasAdmin", "SRV_TemporadasService", "7 metodos, uno por ruta", "Dependency", "delega"],
    ["CTR_TemporadasAdmin", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_TemporadasAdmin", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["SRV_CatalogosService", "SRV_BitacoraService", "registrar, 12 escrituras", "Dependency", "delega"],
    ["SRV_ProductosService", "SRV_BitacoraService", "registrar, 3 escrituras", "Dependency", "delega"],
    ["SRV_TemporadasService", "SRV_BitacoraService", "registrar, 7 escrituras", "Dependency", "delega"],
    ["SRV_CatalogosService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["SRV_ProductosService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["SRV_TemporadasService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["SRV_ProductosService", "producto_talla_color", "INSERT con 'Disponible' literal", "Assembly", "escribe"],
    ["SRV_CatalogoService", "inventario_stock", "cantidad_disponible, no estado_stock", "Dependency", "consulta"],

    ["SRV_CatalogoService", "PostgreSQL 16", "12 llamadas, todas SQL a mano", "Assembly", "consulta"],
    ["SRV_CatalogosService", "PostgreSQL 16", "22 llamadas, todas SQL a mano", "Assembly", "consulta"],
    ["SRV_ProductosService", "PostgreSQL 16", "14 llamadas, todas SQL a mano", "Assembly", "consulta"],
    ["SRV_TemporadasService", "PostgreSQL 16", "15 llamadas, todas SQL a mano", "Assembly", "consulta"],

    ["CE_Modelos.ts (seguridad)", "PostgreSQL 16", "13 entidades, solo como tipo", "Assembly", "mapea"],
    ["producto_talla_color", "PostgreSQL 16", "UNIQUE de 3 columnas", "Assembly", "apunta"],
    ["inventario_stock", "PostgreSQL 16", "clave compuesta por id_ptc e id_sucursal", "Assembly", "apunta"]
];


// ================================================================
// DONDE CAE CADA COMPONENTE   [nombre, izquierda, arriba, ancho, alto]
// ================================================================

var DOND = [
    ["Catalogo.tsx", 55, 100, 300, 65],
    ["Producto.tsx", 370, 100, 300, 65],
    ["AdminCatalogoProductos.tsx", 685, 100, 300, 65],
    ["AdminCatalogos.tsx", 55, 175, 300, 65],
    ["AdminTemporadas.tsx", 370, 175, 300, 65],
    ["api.ts", 685, 175, 300, 65],

    ["CTR_Catalogo", 55, 360, 230, 120],
    ["CTR_CatalogoAdmin", 300, 360, 230, 120],
    ["CTR_CatalogosAdmin", 545, 360, 230, 120],
    ["CTR_TemporadasAdmin", 790, 360, 230, 120],

    ["SRV_CatalogoService", 55, 600, 230, 120],
    ["SRV_CatalogosService", 300, 600, 230, 120],
    ["SRV_ProductosService", 545, 600, 230, 120],
    ["SRV_TemporadasService", 790, 600, 230, 120],

    ["dependencias.ts", 1095, 100, 300, 120],
    ["SRV_BitacoraService", 1425, 100, 300, 120],

    ["CE_Modelos.ts (seguridad)", 1095, 340, 300, 200],
    ["inventario_stock", 1425, 340, 300, 200],
    ["producto_talla_color", 1095, 570, 300, 200],
    ["PostgreSQL 16", 1425, 570, 300, 200]
];


function aviso(txt) {
    try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup(txt, 0, "Paquete 4 - Catalogo", 64);
    } catch (e) { }
}

function descError(e) {
    var d = "";
    try { if (e.description != null) d = d + e.description; } catch (x) { }
    if (d === "") { try { d = String(e); } catch (x2) { d = "error desconocido"; } }
    return d;
}


// ---------- LAS UTILIDADES, IGUALES QUE EL SCRIPT DE CAPAS ----------

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
        if (String(padre.Packages.GetAt(i).Name) == nombre) {
            return padre.Packages.GetAt(i);
        }
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


// ---------- EL MARCO ----------

function marco(diag, el, izq, arr, ancho, alto, color) {
    if (el == null) return false;
    var o = objetoEn(diag, el);
    if (o == null) {
        var tam = "l=" + izq + ";r=" + (izq + ancho) + ";t=" + arr + ";b=" + (arr + alto) + ";";
        try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e) { return false; }
        o.ElementID = el.ElementID;
    }
    try { o.ManuallySized = true; } catch (e) { }
    try { o.Left = izq; } catch (e) { }
    try { o.Right = izq + ancho; } catch (e) { }
    try { o.Top = 0 - arr; } catch (e) { }
    try { o.Bottom = 0 - arr - alto; } catch (e) { }
    try { o.FontSize = 10; } catch (e) { }
    try { o.TextAlign = 1; } catch (e) { }
    try { o.ShowStereotype = false; } catch (e) { }
    try { o.ShowNotes = false; } catch (e) { }
    try { o.BackGroundColor = color; } catch (e) { }
    try { o.BorderStyle = 1; } catch (e) { }
    try { o.BorderColor = 8421504; } catch (e) { }
    try { o.Sequence = 1; } catch (e) { }
    try { o.Update(); } catch (e) { }
    return true;
}


// ---------- EL RECUADRO ----------

function recuadro(diag, el, izq, arr, ancho, alto) {
    var o = objetoEn(diag, el);
    if (o == null) {
        var tam = "l=" + izq + ";r=" + (izq + ancho) + ";t=" + arr + ";b=" + (arr + alto) + ";";
        try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e) { return null; }
        o.ElementID = el.ElementID;
    }
    try { o.ManuallySized = true; } catch (e) { }
    try { o.Left = izq; } catch (e) { }
    try { o.Right = izq + ancho; } catch (e) { }
    try { o.Top = 0 - arr; } catch (e) { }
    try { o.Bottom = 0 - arr - alto; } catch (e) { }
    try { o.FontSize = 9; } catch (e) { }
    try { o.ShowNotes = false; } catch (e) { }
    try { o.WrapText = true; } catch (e) { }
    try { o.BackGroundColor = 16777215; } catch (e) { }
    try { o.BorderStyle = 1; } catch (e) { }
    try { o.BorderColor = 4210752; } catch (e) { }
    o.Update();
    return o;
}


// ---------- UNA PASADA ----------

function pintar(diag, C, F) {
    var marcos = 0;
    if (marco(diag, F[MARCO_NOMBRE], MARCO_X, MARCO_Y, MARCO_W, MARCO_H, MARCO_COLOR)) { marcos++; }
    for (var mc = 0; mc < CAPAS.length; mc++) {
        if (marco(diag, F[CAPAS[mc][0]], CAPAS[mc][1], CAPAS[mc][2], CAPAS[mc][3], CAPAS[mc][4], CAPAS[mc][5])) { marcos++; }
    }
    var puestos = 0;
    for (var i = 0; i < DOND.length; i++) {
        var pos = DOND[i];
        if (pos == null) { ERRORES.push("DOND[" + i + "] es null"); continue; }
        var el = C[pos[0]];
        if (el == null) { ERRORES.push("no hay componente " + pos[0]); continue; }
        var o = recuadro(diag, el, pos[1], pos[2], pos[3], pos[4]);
        if (o != null) { puestos++; }
    }
    try { diag.DiagramObjects.Refresh(); } catch (e) { }
    try { diag.Update(); } catch (e) { }
    return puestos + " recuadros y " + marcos + " marcos";
}

function enDiagrama(diag, con) {
    if (diag == null || con == null) return false;
    try { diag.DiagramLinks.Refresh(); } catch (e) { }
    try {
        for (var i = 0; i < diag.DiagramLinks.Count; i++) {
            if (diag.DiagramLinks.GetAt(i).ConnectorID == con.ConnectorID) return true;
        }
    } catch (e) { }
    return false;
}


// ---------- EL CONECTOR ----------

function relacion(diag, a, b, etiqueta, tipo, est) {
    if (a == null || b == null) return 0;
    var i;
    var con = null;
    for (i = 0; i < a.Connectors.Count; i++) {
        var existente = a.Connectors.GetAt(i);
        if (existente.SupplierID == b.ElementID && String(existente.Name) == etiqueta && String(existente.Stereotype) == est) {
            con = existente;
            break;
        }
    }
    if (con == null) {
        try { con = a.Connectors.AddNew("", tipo); } catch (e) { con = null; }
    }
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
    try { con.FontSize = 7; } catch (e) { }
    try { con.Update(); } catch (e) { }
    if (enDiagrama(diag, con)) return 1;
    return 0;
}


// ---------- MAIN ----------

function main() {
    var paq = subPaquete(RAIZ, PAQ_NOMBRE);
    try { paq.Diagrams.Refresh(); } catch (e) { }
    try { paq.Elements.Refresh(); } catch (e) { }

    var F = {};
    var marcosCreados = 0;
    var listaMarcos = [MARCO_NOMBRE];
    for (var mc0 = 0; mc0 < CAPAS.length; mc0++) { listaMarcos.push(CAPAS[mc0][0]); }
    for (var fm = 0; fm < listaMarcos.length; fm++) {
        var nomM = String(listaMarcos[fm]).replace(/\s+/g, " ");
        var me = buscarLocal(paq, nomM);
        if (me == null) {
            try { me = paq.Elements.AddNew(nomM, "Package"); } catch (e) { me = null; }
        }
        if (me != null) {
            try { me.Name = nomM; me.Stereotype = ""; me.Update(); } catch (e) { }
            F[nomM] = me;
            marcosCreados++;
        } else {
            ERRORES.push("no se pudo crear el marco " + nomM);
        }
    }
    try { paq.Elements.Refresh(); } catch (e) { }

    var C = {};
    var creados = 0;
    for (var i = 0; i < PAQ.length; i++) {
        var def = PAQ[i];
        if (def == null) { ERRORES.push("PAQ[" + i + "] es null"); continue; }
        var el = buscarLocal(paq, def[0]);
        if (el == null) {
            try { el = paq.Elements.AddNew(def[0], "Component"); } catch (e) { el = null; }
            if (el == null) { try { el = paq.Elements.AddNew(def[0], "Class"); } catch (e2) { el = null; } }
        }
        if (el == null) { ERRORES.push("no se pudo crear " + def[0]); C[def[0]] = null; continue; }
        try { el.Name = def[0]; el.Stereotype = ""; el.Notes = def[2]; el.Update(); } catch (e) { }
        C[def[0]] = el;
        if (el.ElementID != 0) { creados++; }
    }
    try { paq.Elements.Refresh(); } catch (e) { }

    var diag = null;
    for (var d = 0; d < paq.Diagrams.Count; d++) {
        if (String(paq.Diagrams.GetAt(d).Name) == DIAG_NOMBRE) { diag = paq.Diagrams.GetAt(d); break; }
    }
    if (diag == null) {
        try { diag = paq.Diagrams.AddNew(DIAG_NOMBRE, "Component"); } catch (e) { diag = null; }
    }
    if (diag == null) { try { diag = paq.Diagrams.AddNew(DIAG_NOMBRE, "Class"); } catch (e2) { diag = null; } }
    if (diag == null) { ERRORES.push("no se pudo crear el diagrama"); return; }
    diag.Update();
    try { paq.Diagrams.Refresh(); } catch (e) { }
    var tipoDiag = "?";
    try { tipoDiag = String(diag.Type); } catch (e) { }

    for (var viejo = diag.DiagramObjects.Count - 1; viejo >= 0; viejo--) {
        try { diag.DiagramObjects.GetAt(viejo).Delete(); } catch (e) { }
    }
    try { diag.DiagramObjects.Refresh(); } catch (e) { }

    INFORME.push("pasada 1: " + pintar(diag, C, F));
    diag = guardarYRecargar(diag);
    INFORME.push("pasada 2: " + pintar(diag, C, F));
    diag = guardarYRecargar(diag);

    var enlaces = 0;
    var huerfanos = 0;
    for (var r = 0; r < REL.length; r++) {
        var rel = REL[r];
        if (rel == null) { ERRORES.push("REL[" + r + "] es null"); continue; }
        var origen = C[rel[0]];
        var destino = C[rel[1]];
        if (origen == null || destino == null) {
            huerfanos++;
            ERRORES.push("no se pudo enlazar " + rel[0] + " -> " + rel[1]);
            continue;
        }
        enlaces = enlaces + relacion(diag, origen, destino, rel[2], rel[3], rel[4]);
    }
    diag = guardarYRecargar(diag);

    var nObj = 0, nLin = 0, conTam = 0;
    try { nObj = diag.DiagramObjects.Count; } catch (e) { }
    try { nLin = diag.DiagramLinks.Count; } catch (e) { }
    try {
        for (var q = 0; q < diag.DiagramObjects.Count; q++) {
            var ob = diag.DiagramObjects.GetAt(q);
            var w = 0;
            try { w = ob.Right - ob.Left; } catch (e2) { w = 0; }
            if (w > 5) conTam++;
        }
    } catch (e3) { }

    INFORME.push("objetos " + nObj + ", con tamano " + conTam + ", lineas " + nLin);

    var N = [];
    N.push("ARQUITECTURA DEL PAQUETE 4 - INFORME DE EJECUCION");
    N.push("Paquete 4: Gestion de Catalogo. Casos CU10, CU11, CU12 y CU13.");
    N.push("");
    N.push("Componentes:   " + creados + " de " + TOTAL_CMP);
    N.push("Interfaces:    " + enlaces + " de " + TOTAL_REL);
    N.push("Marcos:        " + marcosCreados + " de 6, y son Package reales");
    N.push("Huerfanos:     " + huerfanos);
    N.push("Errores:       " + ERRORES.length);
    N.push("");
    N.push("EJECUCION");
    N.push("  " + INFORME.join(SALTO));
    N.push("");
    N.push("LEIDO DEL DIAGRAMA");
    N.push("  tipo del diagrama: " + tipoDiag);
    N.push("  objetos:          " + nObj + "   con tamano: " + conTam);
    N.push("  lineas:           " + nLin);
    N.push("  deben ser 26 objetos con tamano: 20 componentes + 6 marcos.");
    N.push("");
    N.push("EL REPARTO DE LOS 20 COMPONENTES");
    N.push("  Presentacion        6   5 pantallas y el cliente HTTP");
    N.push("  Control             4   el unico paquete con 4 controladores");
    N.push("  Logica de Negocio  4   uno por cada grupo de rutas");
    N.push("  Del Paquete 1       2   las guardas y la bitacora");
    N.push("  Datos               4   las entidades, la combinacion, el stock y el motor");
    N.push("");
    N.push("EL REPARTO DE LAS 34 INTERFACES");
    N.push("  pantalla -> cliente HTTP      5   una por pantalla");
    N.push("  cliente -> control            4   las 26 rutas, en cuatro bloques");
    N.push("  dependencias de codigo       19   los statements import");
    N.push("  hacia PostgreSQL 16           4   los 4 servicios, y las 3 entidades");
    N.push("  hacia otras tablas             2   la combinacion y el stock");
    N.push("");
    N.push("EL PAQUETE CON MAS RUTAS DEL SISTEMA: 26");
    N.push("");
    N.push("  4 publicas, sin guardia, y 22 de administracion con ella.");
    N.push("  Es el unico paquete con CUATRO controladores, y el unico con");
    N.push("  una pantalla sin sesion al lado de cuatro de administracion.");
    N.push("");
    N.push("  4 + 3 + 12 + 7 = 26. Y las doce de CTR_CatalogosAdmin son");
    N.push("  las cuatro operaciones de cada uno de los tres maestros, en el");
    N.push("  mismo orden. Es el unico controlador del proyecto donde el");
    N.push("  patron entero se lee en una sola pantalla.");
    N.push("");
    N.push("EL PREFIXO admin LO COMPARTEN 5 CONTROLADORES Y 2 MODULOS");
    N.push("");
    N.push("  CTR_Auditoria      seguridad         2 rutas");
    N.push("  CTR_Empleados      seguridad         5 rutas");
    N.push("  CTR_Roles          seguridad         7 rutas");
    N.push("  CTR_Sucursales     seguridad         8 rutas");
    N.push("  CTR_TemporadasAdmin catalogo         7 rutas");
    N.push("                            TOTAL     29 rutas");
    N.push("");
    N.push("  CTR_TemporadasAdmin es la EXCEPCION del paquete 4: sus 3");
    N.push("  hermanos usan admin/catalogo y admin/catalogos, y el usa a");
    N.push("  secas. Por eso el prefijo admin cruza dos modulos y dos");
    N.push("  paquetes. Se distinguen por el subcamino, y hay siete.");
    N.push("");
    N.push("LOS 4 SERVICIOS NO USAN NI UN REPOSITORIO. ES UNICO DEL PROYECTO");
    N.push("");
    N.push("  SRV_CatalogosService     634 lineas   12 metodos   22 llamadas");
    N.push("  SRV_TemporadasService   518 lineas    7 metodos   15 llamadas");
    N.push("  SRV_CatalogoService     341 lineas    3 metodos   12 llamadas");
    N.push("  SRV_ProductosService    292 lineas    3 metodos   14 llamadas");
    N.push("                              1.785        25          63");
    N.push("");
    N.push("  Sesenta y tres llamadas a dataSource, cero getRepository y");
    N.push("  cero QueryBuilder. Todo SQL escrito a mano, y el catalogo es el");
    N.push("  unico paquete del sistema donde eso es cierto de principio a");
    N.push("  fin. Los paquetes 1, 2 y 3 usan repositorios de TypeORM.");
    N.push("");
    N.push("Y ESO HACE QUE EL CATALOGO SEA EL QUE ACIERTA CON EL STOCK");
    N.push("");
    N.push("  El catalogo NO mira la columna estado_stock. Mira el numero:");
    N.push("  la disponibilidad filtra por cantidad_disponible mayor que");
    N.push("  cero, y el aviso de poco stock lo CALCULA en vez de leerlo.");
    N.push("");
    N.push("  estado_stock se escribe UNA SOLA VEZ en todo el proyecto: en");
    N.push("  la linea 198 de SRV_ProductosService, al dar de alta un");
    N.push("  producto, con el literal 'Disponible' en el propio INSERT. Y");
    N.push("  no hay ningun UPDATE en ningun sitio, porque no hace falta:");
    N.push("  la verdad esta en inventario_stock, que mueve el disparador.");
    N.push("");
    N.push("  Y LA LEEN CUATRO PAQUETES, CADA UNO A SU MANERA:");
    N.push("    carrito    L246  compara contra 'sin stock'");
    N.push("    reservas   L330  compara contra 'Disponible'");
    N.push("    reservas  L1197  pasa a minusculas y compara 'disponible'");
    N.push("    ventas     L315  compara contra 'Sin stock' con mayuscula");
    N.push("");
    N.push("  Cuatro escrituras de un estado que solo tiene un valor");
    N.push("  posible, y cuatro paquetes comparando de cuatro formas. El");
    N.push("  unico que no sufre el problema es el que no lo mira.");
    N.push("");
    N.push("  CORRECCION RESPECTO A LO QUE DIGUE ANTES: se dijo que");
    N.push("  estado_stock no se escribia nunca. Es FALSO. Se escribe una");
    N.push("  vez, con literal, y por eso el problema es peor de lo que");
    N.push("  parece: no es que falte el UPDATE, es que la columna esta");
    N.push("  de mas y cuatro paquetes la toman por cierta.");
    N.push("");
    N.push("LO QUE ESTA BIEN, Y SON TRES COSAS CONCRETAS");
    N.push("");
    N.push("  LA CADENA DEL STOCK ESTA SEPARADA Y CADA PASO EN SU SITIO:");
    N.push("  el codigo escribe un movimiento, el disparador descuenta el");
    N.push("  disponible, y el catalogo lo lee y lo enseña. Los tres no");
    N.push("  estan en el mismo fichero, y por eso el catalogo acierta.");
    N.push("");
    N.push("  LA SEPARACION PUBLICO Y ADMIN ES REAL Y NO ES CONVENCION:");
    N.push("  el unico controlador sin guardia es el que sirve el catalogo,");
    N.push("  porque ver la ropa sin cuenta es el caso CU12. Y los otros");
    N.push("  tres montan la guarda a nivel de clase, con una linea.");
    N.push("");
    N.push("  EL UNICO DE LAS 22 RUTAS DE ADMIN SIN CASO ES EL SELECTOR DE");
    N.push("  PRODUCTO, y esta justificado: existe para que el formulario de");
    N.push("  alta no tenga que llamar a tres rutas de tres maestros.");
    N.push("");
    N.push("DONDE ESTA");
    N.push("  raiz del modelo > " + PAQ_NOMBRE + " > " + DIAG_NOMBRE);
    N.push("");
    if (ERRORES.length == 0) N.push("Sin errores.");
    if (ERRORES.length > 0) {
        N.push("ERRORES: " + ERRORES.length);
        for (var e4 = 0; e4 < ERRORES.length && e4 < 20; e4++) N.push("  - " + ERRORES[e4]);
    }
    try { paq.Notes = N.join(SALTO); paq.Update(); } catch (e5) { }

    var U = [];
    U.push("PAQUETE 4 - Gestion de Catalogo");
    U.push("CU10, CU11, CU12 y CU13   ·   26 rutas, el maximo");
    U.push("");
    U.push("Componentes:   " + creados + " de " + TOTAL_CMP);
    U.push("Interfaces:    " + enlaces + " de " + TOTAL_REL);
    U.push("Marcos:        " + marcosCreados + " de 6");
    U.push("Huerfanos:     " + huerfanos);
    U.push("Errores:       " + ERRORES.length);
    U.push("");
    U.push("LEIDO DEL DIAGRAMA:");
    U.push("  tipo:       " + tipoDiag);
    U.push("  objetos:    " + nObj);
    U.push("  con tamano: " + conTam + "   (deben ser 26)");
    U.push("  lineas:     " + nLin);
    U.push("");
    U.push("Los 4 servicios usan 63 llamadas a dataSource y");
    U.push("CERO repositorios. Y el catalogo es el unico que");
    U.push("mira cantidad_disponible en vez de estado_stock.");
    U.push("");
    if (conTam < 26) U.push("AVISO: menos de 26 con tamano. Copia este texto y pegamelo.");
    U.push("El informe entero esta en las Notas del paquete.");
    aviso(U.join(SALTO));
}

try {
    main();
} catch (e) {
    try {
        var pp = buscarPaquete(RAIZ, PAQ_NOMBRE);
        if (pp != null) {
            pp.Notes = "ERROR NO CONTROLADO: " + descError(e) + SALTO + SALTO + INFORME.join(SALTO);
            pp.Update();
        }
    } catch (e2) { }
    aviso("Error: " + descError(e));
}
