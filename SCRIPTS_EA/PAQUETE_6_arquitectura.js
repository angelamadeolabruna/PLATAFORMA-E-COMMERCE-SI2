// ================================================================
// PAQUETE 6  ·  ARQUITECTURA DEL SUBSISTEMA
// Gestion de Inventario y Almacen  ·  CU17, CU18, CU19, CU20
// E-COMMERCE TIENDA MONTANO   ·   Seccion 5.3.6
//
// QUE DIBUJA
//   El diagrama de componentes del paquete 6, con los 27 componentes
//   del subsistema y las 53 interfaces entre ellos, y TODO DENTRO de
//   un marco que se llama PAQUETE 6 - INVENTARIO Y ALMACEN.
//
//   Es el PAQUETE MAS GRANDE de los documentados: 14 ficheros, cinco
//   controladores, siete servicios y 14 rutas.  Y son dos modulos de
//   NestJS, inventario y respaldos, que no se importan entre si.
//
//   27 componentes:  6 de presentacion, 5 de control, 7 de logica,
//                    2 del paquete 1, 6 de datos y 1 externo
//   53 interfaces
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
//   El ajuste de inventario comprueba que no quede negativo, pero lo
//   comprueba LEYENDO y despues ESCRIBIENDO, sin transaccion:
//
//     L216  SELECT cantidad_disponible FROM inventario_stock
//     L222  si la cantidad baja y supera lo disponible, lanza error
//     L231  INSERT INTO movimientos_inventario
//
//   Y el INSERT es lo que dispara trg_movimiento_inventario, que es el
//   que de verdad descuenta.  O sea que entre la lectura y el
//   descuento hay una ventana sin cerrar, y dos ajustes simultaneos
//   pueden pasar los dos la comprobacion.
//
//   Y NO HAY RED DE SEGURIDAD: inventario_stock no tiene ningun CHECK
//   que impida que cantidad_disponible llegue a ser negativa, y sus
//   cuatro columnas estan todas con DEFAULT 0 y sin ninguna
//   restriccion.  La unica proteccion es esa lectura, que es
//   precisamente la que no es atomica.
//
//   Ademas, de esas cuatro columnas, este paquete solo escribe una.
//   cantidad_disponible la baja el disparador.  cantidad_reservada y
//   cantidad_vendida no las escribe nadie de aqui, y cantidad_vendida
//   solo la escriben el pago, en el paquete 8.
//
// Aviso con WScript.Shell.Popup.  Sin llamadas a SQL y sin
// SaveDiagram.  Una instruccion por linea.  Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================


var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var PAQ_NOMBRE = "Paquete 6 - Inventario y Almacen";
var DIAG_NOMBRE = "Arquitectura del Paquete 6";

var TOTAL_CMP = 27;
var TOTAL_REL = 53;
var TOTAL_CAP = 6;

var ERRORES = [];
var INFORME = [];

var MARCO_NOMBRE = "PAQUETE 6 - GESTION DE INVENTARIO Y ALMACEN";
var MARCO_X = 10;
var MARCO_Y = 10;
var MARCO_W = 1900;
var MARCO_H = 950;
var MARCO_COLOR = 15132358;

// nombre, izquierda, arriba, ancho, alto, color
var CAPAS = [
    ["Presentacion", 30, 60, 700, 240, 13421823],
    ["Control", 30, 350, 700, 190, 13434879],
    ["Logica de Negocio", 30, 590, 700, 300, 13434828],
    ["Del Paquete 1", 790, 60, 340, 830, 16777164],
    ["Datos", 1180, 60, 370, 830, 16777164],
    ["Externos", 1620, 60, 260, 180, 16247743]
];


// ================================================================
// LOS 27 COMPONENTES   [nombre, capa, nota]
// ================================================================

var PAQ = [

    // ---------------- PRESENTACION: 6 ----------------

    ["AdminExistencias.tsx", "Presentacion",
    "CAPA: Presentacion | CASOS: CU20 Consultar Existencias Consolidadas | FICHERO: web/src/pages/admin/AdminExistencias.tsx, 441 lineas | LLAMA: dos funciones, api.obtenerOpcionesExistencias y api.consultarExistencias, que son las 2 rutas de su controlador"],

    ["AdminKardex.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU18 Consultar Kardex Dinamico | FICHERO: web/src/pages/admin/AdminKardex.tsx, 468 lineas: **la mas larga de las cinco pantallas del paquete** | LLAMA: dos funciones, las 2 rutas de su controlador | **ES LA PANTALLA DEL CU18, Y EL CU18 CONSULTA MOVIMIENTOS, NO UNA TABLA LLAMADA KARDEX.** No hay ninguna tabla kardex en el esquema, y no hace falta: el kardex ES la tabla de movimientos, con su saldo anterior y su saldo posterior en cada fila"],

    ["AdminAjustes.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU17 Registrar Recepcion Fisica de Prendas | FICHERO: web/src/pages/admin/AdminAjustes.tsx, 462 lineas | LLAMA: tres funciones, y **una de ellas es de otro controlador**: pide las opciones con api.obtenerOpcionesKardex, o sea que el formulario de ajustes carga sus listas desde el KARDEX y no desde su propio servicio | **Y NO PUEDE HACER OTRA COSA**: su controlador solo tiene GET y POST, sin ruta de opciones. Asi que el cruce con el kardex no es un descuido, es la unica salida, y funciona | **ES LA PANTALLA DE CU17, Y CU17 ESTA ROTO DE OTRA MANERA**: esta recibe la prenda, pero no hay ninguna escritura en las tablas de recepcion en el proyecto entero"],

    ["AdminAlertas.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU19 Configurar Alertas de Stock Minimo | FICHERO: web/src/pages/admin/AdminAlertas.tsx, 461 lineas | LLAMA: tres funciones, las 3 rutas de su controlador | LAS CINCO PANTALLAS DEL PAQUETE ESTAN ENTRE 438 Y 468 LINEAS, lo cual no es casualidad: son cinco formularios con la misma forma, hechos en paralelo"],

    ["AdminRespaldos.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: ninguno de los 4. Los respaldos no tienen caso de uso | FICHERO: web/src/pages/admin/AdminRespaldos.tsx, 438 lineas: la mas corta de las cinco | LLAMA: cinco funciones, api.listarRespaldos, api.obtenerProgramacion, api.crearRespaldo, api.descargarRespaldo y api.guardarProgramacion, que son las 5 rutas de su controlador | **ES LA UNICA PANTALLA DEL PAQUETE QUE NO ES DE UN CASO**, y la unica que tiene un boton de descarga de fichero"],

    ["api.ts", "Presentacion",
    "CAPA: Presentacion | FICHERO: web/src/lib/api.ts | EL CLIENTE HTTP DEL PAQUETE | CATORCE rutas del paquete, y **cuatro de ellas no tienen caso**: las cuatro de opciones, que son los selectores de los formularios, mas la de respaldos al completo | LAS CATORCE ESTAN BAJO TRES PREFIJOS: admin/inventario con cuatro subcarpetas, y admin/respaldos"],

    // ---------------- CONTROL: 5 ----------------

    ["CTR_Existencias", "Control",
    "CAPA: Control | CASOS: CU20, y la ruta de opciones no tiene caso | FICHERO: api/src/modulos/inventario/CTR_Existencias.ts, **44 LINEAS: el controlador mas pequeno del proyecto** | @Controller('admin/inventario/existencias') con JwtAuthGuard | DOS rutas: GET opciones y GET, y las dos son de lectura | ES EL UNICO DE LOS CINCO SIN UNA SOLA RUTA DE ESCRITURA. Solo mira, nunca toca"],

    ["CTR_Kardex", "Control",
    "CAPA: Control | CASO: CU18, y la ruta de opciones no tiene caso | FICHERO: api/src/modulos/inventario/CTR_Kardex.ts, 42 lineas | @Controller('admin/inventario/kardex') con JwtAuthGuard | DOS rutas, las dos de lectura | **ES GEMELO DEL DE EXISTENCIAS, Y NO POR CASUALIDAD**: los dos tienen exactamente la misma forma, con su GET opciones y su GET, y los dos con 42 y 44 lineas. La diferencia esta en el servicio, no en el controlador"],

    ["CTR_Ajustes", "Control",
    "CAPA: Control | CASO: CU17 | FICHERO: api/src/modulos/inventario/CTR_Ajustes.ts, 80 lineas | @Controller('admin/inventario/ajustes') con JwtAuthGuard | **SOLO DOS RUTAS, GET Y POST, Y ES EL UNICO DE LOS CINCO SIN RUTA DE OPCIONES.** Por eso la pantalla de ajustes pide las suyas al controlador del kardex | **SU POST ES LA RUTA QUE MUEVE EL STOCK DE TODO EL PROYECTO**: es la unica via por la que un humano cambia una cantidad sin pasar por una venta o una compra. Y funciona escribiendo un movimiento, no el stock"],

    ["CTR_Alertas", "Control",
    "CAPA: Control | CASO: CU19, y la ruta de opciones no tiene caso | FICHERO: api/src/modulos/inventario/CTR_Alertas.ts, 90 lineas | @Controller('admin/inventario/alertas') con JwtAuthGuard | TRES rutas: GET opciones, GET y POST stock-minimo | **ES EL UNICO DE LOS CINCO CON UN NOMBRE DE RUTA QUE DICE LO QUE ESCRIBE**: stock-minimo. Los otros cuatro usan el nombre de la operacion generico, POST a secas | SU POST ES UNICA, y escribe en alertas_stock_config, que es la tabla que guarda el minimo de cada prenda o categoria y si hay que avisar por correo"],

    ["CTR_Respaldos", "Control",
    "CAPA: Control | CASO: ninguno | FICHERO: api/src/modulos/respaldos/CTR_Respaldos.ts, 100 lineas | @Controller('admin/respaldos') con JwtAuthGuard | CINCO rutas, y es el unico de los cinco con un GET de descarga de fichero | ES EL UNICO CONTROLADOR DEL PROYECTO QUE DEJA SALIR UN BINARIO. Los demas devuelven JSON"],

    // ---------------- LOGICA DE NEGOCIO: 7 ----------------

    ["SRV_ExistenciasService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/inventario/SRV_ExistenciasService.ts, 259 lineas | METODOS: 3, para 2 rutas | OCHO LLAMADAS, CERO REPOSITORIOS, TODO SQL A MANO | **ES EL QUE MAS TABLAS TOCA DEL PROYECTO, Y CON MAS LECTURAS**: nueve tablas, entre ellas producto_talla_color, productos, tallas, colores, categorias, sucursales, inventario_stock y usuarios. O sea que para pintar una tabla de existencias tiene que unir casi todo el catalogo | **Y USA LA CANTIDAD REAL, NO estado_stock**: consulta inventario_stock y compara con productos.estado, que es el estado del producto y si existe. Acierta como el paquete 4 | NO ESCRIBE NADA, y no importa a la bitacora del paquete 1"],

    ["SRV_KardexService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/inventario/SRV_KardexService.ts, 296 lineas | METODOS: 4, para 2 rutas | NUEVE LLAMADAS, CERO REPOSITORIOS | **ES EL SERVICIO DEL CU18, Y CU18 NO CONSULTA UNA TABLA LLAMADA KARDEX, PORQUE NO EXISTE.** Consulta movimientos_inventario, que tiene trece columnas y seis claves foraneas, y el indice idx_mov_inv_ptc_suc esta justo sobre las tres que el filtro usa: id_ptc, id_sucursal y fecha | **Y POR ESO EL KARDEX ES FIABLE**: cada fila del movimiento trae su stock_anterior y su stock_posterior, los escribe el disparador del motor antes de aplicar el descuento. No hay que recalcular nada ninio | NO ESCRIBE Y NO SE AUDITA"],

    ["SRV_AjustesService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/inventario/SRV_AjustesService.ts, 271 lineas | METODOS: 4, para 2 rutas | NUEVE LLAMADAS, CERO REPOSITORIOS, Y **CERO TRANSACCIONES** | **AQUI ESTA EL FLUJO DE CU17, Y TIENE UN AGUJERO**: en la linea 216 lee la cantidad disponible de inventario_stock, en la 222 comprueba que la merma no la supere y en la 231 inserta el movimiento. Entre la lectura y el descuento no hay nada que cierre la ventana, porque el descuento lo hace el disparador y no esta en la transaccion | **Y LA COMPROBACION DEL NEGATIVO SOLO LA HACE EL CODIGO**: inventario_stock no tiene ningun CHECK que impida que cantidad_disponible baje de cero. Si dos ajustes salen a la vez y los dos leen el mismo disponible, los dos pasan la comprobacion y el segundo deja la fila en negativo | **TIENE TRES VALIDACIONES ANTES DE ESCRIBIR**: que la cantidad sea un entero distinto de cero, que el motivo sea obligatorio, y que el producto exista. Y una regla deSigns que el servicio aplica solo: si el tipo es MERMA, la cantidad se toma en valor absoluto y con signo menos, de manera que una merma nunca suma por error | TAMBIEN ES EL QUE MIRA LAS OTRAS TRES COLUMNAS**: antes de insertar mira cuantos movimientos de tipo AJUSTE o MERMA hay ya en esa prenda"],

    ["SRV_AlertasService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/inventario/SRV_AlertasService.ts, 291 lineas | METODOS: 4, para 3 rutas | DIEZ LLAMADAS, CERO REPOSITORIOS | **ES EL SERVICIO DEL CU19, Y EL UNICO QUE ESCRIBE EN DOS NIVELES A LA VEZ**: alertas_stock_config tiene tres claves foraneas, a la combinacion de prenda, a la categoria y a la sucursal, de manera que el minimo se puede poner a una prenda suelta, a una categoria entera o a una tienda. Y las tres pueden ser nulas | **Y EL AVISO TIENE DOS CAMPOS**: notificar_email, para avisar, y ultima_notificacion, para no avisar dos veces. El segundo es lo que hace que la alerta no se repita | **COMO EL DE EXISTENCIAS, USA LA CANTIDAD REAL Y NO estado_stock.** Consulta inventario_stock y compara con el minimo de la configuracion | ES EL SEGUNDO SERVICIO DEL PAQUETE QUE USA LA BITACORA, en su unica escritura"],

    ["SRV_RespaldosService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/respaldos/SRV_RespaldosService.ts, 409 lineas | METODOS: 9, y solo 5 son de las 5 rutas. Los otros cuatro son ayuda: unaFila, formatearHora, respaldoDesdeFila y **verificarEjecucionAutomatica**, que es la que llama el planificador | **DIECISEIS LLAMADAS, CERO REPOSITORIOS, TODO SQL A MANO** | **ES EL SERVICIO CON MAS TRABAJO INTERNO DEL PAQUETE, Y EL MAS SEPARADO**: delega todo el disco en SRV_StorageService, de manera que este solo sabe de filas y el otro solo sabe de archivos | **Y CONTIENE LA UNICA FUNCION QUE SE LLAMA SIN QUE NADIE LA PIDA**: verificarEjecucionAutomatica, que decide si toca hacer un respaldo y devuelve si lo lanzar. La llama el planificador cada minuto"],

    ["SRV_StorageService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/respaldos/SRV_StorageService.ts, 75 lineas | LA CLASE SE LLAMA BackupStorageService, y el fichero se llama SRV_StorageService. Es el unico caso del proyecto en que el nombre de la clase y el del fichero no coinciden | METODOS: 6, y son de archivo: generarNombre, guardar, obtenerRuta, existe, obtener y eliminar | **ES EL UNICO COMPONENTE DEL PROYECTO QUE USA EL SISTEMA DE FICHEROS DE NODE DIRECTAMENTE**, con writeFileSync, readFileSync, existsSync, statSync y unlinkSync. Los otros tres que guardan cosas, comprobantes, respaldos y audio, lo hacen tambien, pero a traves de su propio servicio | **TIENE UN MODO S3 DECLARADO Y NO IMPLEMENTADO**: el constructor lee STORAGE_BACKEND y si vale s3 registra que esta en modo S3 y que los archivos se quedan en local. O sea que la rama existe y no hace nada | **Y LOS ARCHIVOS SE LLAMAN .sql.gz PERO NO SE COMPRIMEN**: generarNombre devuelve respaldo_marca.sql.gz y guardar hace un writeFileSync a secas, sin gunzip ni zlib. O sea que hay un .gz en el nombre y SQL plano en el contenido, y quien lo descomprima con gunzip se va a encontrar un error"],

    ["SchedulerService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/respaldos/SchedulerService.ts, 33 LINEAS | **ES EL UNICO COMPONENTE DEL PROYECTO QUE SE DISPARA POR TIEMPO Y NO POR PETICION.** Todos los demas esperan a que alguien llame | NO ES UN CRON: es un setInterval de 60.000 milisegundos, o sea que despierta cada minuto y pregunta. Y lo que pregunta es una sola cosa, si toca hacer respaldo | SE ENGANCHA CON onModuleInit al arrancar el modulo y con onModuleDestroy al pararlo, de manera que el temporizador se limpia solo | **ES EL UNICO COMPONENTE DEL PAQUETE QUE NO HABLA CON LA BASE DE DATOS NI CON EL DISCO**: sus 33 lineas no tienen ni un SELECT ni un writeFileSync. Solo pregunta"],

    // ---------------- DEL PAQUETE 1: 2 ----------------

    ["dependencias.ts", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/dependencias.ts, 148 lineas | LA USA LOS 5 CONTROLADORES, con la guarda a NIVEL DE CLASE, de manera que las 14 rutas quedan protegidas con cinco lineas | **Y NINGUNO DE LOS 7 SERVICIOS LA USA.** Ningun servicio de este paquete comprueba permisos por su cuenta, al contrario del paquete 3, el 5 y el de roles del 2. Aqui la guarda es la unica puerta"],

    ["SRV_BitacoraService", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/SRV_BitacoraService.ts, 40 lineas | LA USA SOLO 2 DE LOS 7 SERVICIOS, y los dos son de escritura: el de ajustes y el de alertas | **GUARDA EL DATO ANTERIOR**: el de ajustes mete en la bitacora la cantidad que habia antes del movimiento y la que queda despues. O sea que CU17 deja rastro de cuanto a cuanto se corrigio el stock, que es justo lo que se necesita para auditar un ajuste manual | LOS OTOS CINCO NO LA USAN, y tres de ellos ni escriben: existencias, kardex y el de almacenamiento solo leen o escriben archivos"],

    // ---------------- DATOS: 6 ----------------

    ["CE_Modelos.ts (seguridad)", "Datos",
    "CAPA: Datos | FICHERO: api/src/modulos/seguridad/CE_Modelos.ts | LA USAN LOS 5 CONTROLADORES Y LOS 5 SERVICIOS CON BASE DE DATOS, o sea 10 de los 12 componentes del paquete. El unico que no la trae es SchedulerService, y los otros dos que tampoco son el de existencias en sus listados de usuario y el de almacenamiento | Y SIEMPRE PARA LO MISMO: el tipo Usuario, como parametro de decorador o como argumento de metodo. Ninguno abre la entidad para consultar. Es la dependencia mas repetida del proyecto"],

    ["inventario_stock", "Datos",
    "CAPA: Datos | FICHERO: la tabla | OCHO COLUMNAS, de las cuales CUATRO SON CANTIDADES, y las cuatro estan con DEFAULT 0 | **ES LA UNICA TABLA DEL PROYECTO QUE ESTA MAPEADA COMO ENTIDAD DE TYPORM.** En CE_Modelos hay trece entidades, y esta es la de inventario, que es la que el disparador del motor necesita para poder escribirla | **TIENE UN UNIQUE DE SUS DOS CLAVES**, id_ptc e id_sucursal, de manera que una prenda tiene como mucho una fila por tienda. Y por eso el indice idx_inventario_sucursal esta puesto sobre id_sucursal, que es la columna que se busca | **Y NO TIENE NINGUN CHECK.** Ninguna de las cuatro cantidades tiene la restriccion que la de orden_compra_items si tiene. El disponible puede quedar negativo y el motor no dice nada | **DE SUS CUATRO CANTIDADES, ESTE PAQUETE SOLO ESCRIBE UNA**, y ni siquiera el codigo: la que baja el disparador. Las otras tres las escriben el paquete 7, el 8 y el trigger de las recepciones"],

    ["movimientos_inventario", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **TRECE COLUMNAS, Y LA TABLA MAS RICA DEL PAQUETE**: guarda el tipo de movimiento, la cantidad, el saldo anterior, el saldo posterior, una referencia de texto, y cuatro claves foraneas que dicen de donde salio: usuario, orden de compra, venta y reserva | **ES LA TABLA QUE HACE DE KARDEX, Y POR ESO TIENE UN INDICE QUE ESTA PERFECTO PUESTO**: idx_mov_inv_ptc_suc sobre id_ptc, id_sucursal y fecha, que son exactamente las tres columnas por las que CU18 filtra | **ES LA UNICA TABLA DEL PROYECTO QUE GUARDA SU PROPIO SALDO**: stock_anterior y stock_posterior estan en la fila, los escribe el disparador antes de aplicar el descuento, y por eso el historial no hay que recalcularlo | **Y TIENE LA COLUMNA QUE CU17 NO PUEDE LLENAR**: id_orden_compra, y nadie la escribe. Es la que uniria una recepcion con la orden que la pidio, y la recepcion es justo lo que no esta implementado"],

    ["alertas_stock_config", "Datos",
    "CAPA: Datos | FICHERO: la tabla | SEIS COLUMNAS, con tres claves foraneas que pueden ser nulas: a la combinacion de prenda, a la categoria y a la sucursal | **ES LA UNICA TABLA DEL PROYECTO QUE ADMITE TRES NIVELES A LA VEZ**, y por eso CU19 no necesita tres tablas: el minimo se puede poner a una prenda, a una categoria entera o a una tienda, y si no se pone ninguna es para todo | **TIENE LA COLUMNA notificar_email, QUE NO ENVIA CORREO.** Es un booleano que se guarda, y el servicio de correo del paquete 1 no esta informado de ella. O sea que la casilla existe y nadie la lee para enviar nada"],

    ["respaldos", "Datos",
    "CAPA: Datos | FICHERO: la tabla | SIETE COLUMNAS, con el estado por defecto En Progreso y un storage_url de texto | **ES LA UNICA TABLA DEL PROYECTO QUE GUARDA UN PUNTERO A UN ARCHIVO.** Las demas guardan imagenes con una ruta, pero esta guarda el resultado de una operacion que no es una imagen sino un volcado, y por eso el campo es TEXT y no VARCHAR | **NO HAY NI UN INDICE SOBRE ELLA, NI UNA RESTRICCION, Y NADIE LA BORRA.** Los respaldos se acumulan para siempre, y su tabla crece sin limite y sin limpieza | ES LA MITAD DEL PAQUETE 6 QUE NO ES INVENTARIO, y esta ahi porque protege el mismo dato"],

    ["PostgreSQL 16", "Datos",
    "CAPA: Datos | LAS CUATRO TABLAS PROPIAS SON inventario_stock con 8 columnas, movimientos_inventario con 13, alertas_stock_config con 6 y respaldos con 7 | **LO UNICO QUE SOSTIENE LA INTEGRIDAD DE TODO ESTO ES UN DISPARADOR, trg_movimiento_inventario, que es BEFORE INSERT sobre movimientos_inventario y ejecuta fn_aplicar_movimiento_inventario.** La funcion lee el disponible, guarda el saldo anterior y el posterior en la propia fila, y descuenta con un INSERT ON CONFLICT DO UPDATE | **O SEA QUE EL CODIGO NUNCA ESCRIBE inventario_stock.** Los siete servicios de este paquete no tienen ni un UPDATE ni un INSERT contra esa tabla, y los tres que la consultan solo la leen | **Y NO HAY CHECK QUE PROTEJA EL RESULTADO.** El motor descuenta lo que le digan y no comprueba que la fila quede por encima de cero. La unica proteccion es la del servicio de ajustes, que es una lectura sin transaccion"],

    // ---------------- EXTERNOS: 1 ----------------

    ["Disco local", "Externos",
    "CAPA: Externo | QUE ES: el sistema de archivos donde SRV_StorageService deja los respaldos, en la carpeta RESPALDOS_DIR, que por defecto es respaldos, resuelta contra el directorio de trabajo del proceso | LO USA SOLO SRV_StorageService, y por eso es el unico componente del paquete que sale de la base de datos | **NO HAY ALMACENAMIENTO REMOTO.** El servicio lee STORAGE_BACKEND y tiene una rama para s3 que registra un aviso y sigue escribiendo en local. No hay cubo, ni bucket, ni credenciales de S3 en ninguna variable del proyecto | **Y LA CARPETA NO ESTA EN EL .gitignore CON LOS RESPALDOS.** El .gitignore tiene node_modules, dist, build, los registros y los ficheros temporales de Office. Las carpetas api/respaldos, api/comprobantes y api/storage no aparecen, y las tres tienen contenido generado por el backend"]
];


// ================================================================
// LAS 53 INTERFACES   [origen, destino, nombre, tipo, estereotipo]
// ================================================================

var REL = [
    ["AdminExistencias.tsx", "api.ts", "2 funciones", "Assembly", "llama"],
    ["AdminKardex.tsx", "api.ts", "2 funciones", "Assembly", "llama"],
    ["AdminAjustes.tsx", "api.ts", "3 funciones, 1 de otro controlador", "Assembly", "llama"],
    ["AdminAlertas.tsx", "api.ts", "3 funciones", "Assembly", "llama"],
    ["AdminRespaldos.tsx", "api.ts", "5 funciones", "Assembly", "llama"],

    ["api.ts", "CTR_Existencias", "HTTP/JSON, 2 rutas", "Assembly", "expone"],
    ["api.ts", "CTR_Kardex", "HTTP/JSON, 2 rutas", "Assembly", "expone"],
    ["api.ts", "CTR_Ajustes", "HTTP/JSON, 2 rutas, sin opciones", "Assembly", "expone"],
    ["api.ts", "CTR_Alertas", "HTTP/JSON, 3 rutas", "Assembly", "expone"],
    ["api.ts", "CTR_Respaldos", "HTTP/JSON, 5 rutas", "Assembly", "expone"],

    ["CTR_Existencias", "SRV_ExistenciasService", "3 metodos para 2 rutas", "Dependency", "delega"],
    ["CTR_Existencias", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_Existencias", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["CTR_Kardex", "SRV_KardexService", "4 metodos para 2 rutas", "Dependency", "delega"],
    ["CTR_Kardex", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_Kardex", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["CTR_Ajustes", "SRV_AjustesService", "4 metodos para 2 rutas", "Dependency", "delega"],
    ["CTR_Ajustes", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_Ajustes", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["CTR_Alertas", "SRV_AlertasService", "4 metodos para 3 rutas", "Dependency", "delega"],
    ["CTR_Alertas", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_Alertas", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["CTR_Respaldos", "SRV_RespaldosService", "9 metodos para 5 rutas", "Dependency", "delega"],
    ["CTR_Respaldos", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_Respaldos", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["SchedulerService", "SRV_RespaldosService", "verificarEjecucionAutomatica, cada 60 s", "Dependency", "despacha"],

    ["SRV_AjustesService", "SRV_BitacoraService", "registrar, con el saldo antes y despues", "Dependency", "delega"],
    ["SRV_AlertasService", "SRV_BitacoraService", "registrar, 1 escritura", "Dependency", "delega"],
    ["SRV_RespaldosService", "SRV_BitacoraService", "registrar, 4 escrituras", "Dependency", "delega"],
    ["SRV_RespaldosService", "SRV_StorageService", "6 metodos de archivo", "Dependency", "delega"],

    ["SRV_ExistenciasService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["SRV_KardexService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["SRV_AjustesService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["SRV_AlertasService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["SRV_RespaldosService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["SRV_AjustesService", "movimientos_inventario", "INSERT, y el trigger descuenta", "Assembly", "escribe"],
    ["SRV_AjustesService", "inventario_stock", "SELECT antes de escribir", "Dependency", "lee sin transaccion"],
    ["SRV_AlertasService", "alertas_stock_config", "POST stock-minimo, 3 niveles", "Assembly", "escribe"],
    ["SRV_AlertasService", "inventario_stock", "cantidad_disponible, no estado_stock", "Dependency", "consulta"],
    ["SRV_ExistenciasService", "inventario_stock", "cantidad_disponible, no estado_stock", "Dependency", "consulta"],
    ["SRV_KardexService", "movimientos_inventario", "CU18, el kardex son los movimientos", "Dependency", "consulta"],
    ["SRV_RespaldosService", "respaldos", "16 llamadas, todo SQL a mano", "Assembly", "consulta"],

    ["SRV_ExistenciasService", "PostgreSQL 16", "8 llamadas, 9 tablas, solo lectura", "Assembly", "consulta"],
    ["SRV_KardexService", "PostgreSQL 16", "9 llamadas, indice por id_ptc e id_sucursal", "Assembly", "consulta"],
    ["SRV_AjustesService", "PostgreSQL 16", "9 llamadas, sin transaccion", "Assembly", "consulta"],
    ["SRV_AlertasService", "PostgreSQL 16", "10 llamadas, usa la cantidad real", "Assembly", "consulta"],
    ["SRV_RespaldosService", "PostgreSQL 16", "16 llamadas, sin transaccion", "Assembly", "consulta"],
    ["SRV_StorageService", "Disco local", "writeFileSync, y el nombre dice .sql.gz", "Dependency", "escribe"],

    ["CE_Modelos.ts (seguridad)", "PostgreSQL 16", "la unica entidad de inventario", "Assembly", "mapea"],
    ["inventario_stock", "PostgreSQL 16", "4 cantidades, ningun CHECK", "Assembly", "apunta"],
    ["movimientos_inventario", "PostgreSQL 16", "13 columnas y 4 FK de origen", "Assembly", "apunta"],
    ["alertas_stock_config", "PostgreSQL 16", "3 claves foraneas, las 3 opcionales", "Assembly", "apunta"],
    ["respaldos", "PostgreSQL 16", "sin indice, sin limpieza", "Assembly", "apunta"]
];


// ================================================================
// DONDE CAE CADA COMPONENTE   [nombre, izquierda, arriba, ancho, alto]
// ================================================================

var DOND = [
    ["AdminExistencias.tsx", 55, 100, 200, 60],
    ["AdminKardex.tsx", 275, 100, 200, 60],
    ["AdminAjustes.tsx", 495, 100, 200, 60],
    ["AdminAlertas.tsx", 55, 175, 200, 60],
    ["AdminRespaldos.tsx", 275, 175, 200, 60],
    ["api.ts", 495, 175, 200, 60],

    ["CTR_Existencias", 55, 390, 120, 110],
    ["CTR_Kardex", 190, 390, 120, 110],
    ["CTR_Ajustes", 325, 390, 120, 110],
    ["CTR_Alertas", 460, 390, 120, 110],
    ["CTR_Respaldos", 595, 390, 120, 110],

    ["SRV_ExistenciasService", 55, 630, 155, 110],
    ["SRV_KardexService", 225, 630, 155, 110],
    ["SRV_AjustesService", 395, 630, 155, 110],
    ["SRV_AlertasService", 565, 630, 155, 110],
    ["SRV_RespaldosService", 55, 760, 155, 110],
    ["SRV_StorageService", 225, 760, 155, 110],
    ["SchedulerService", 395, 760, 155, 110],

    ["dependencias.ts", 815, 100, 290, 320],
    ["SRV_BitacoraService", 815, 460, 290, 320],

    ["CE_Modelos.ts (seguridad)", 1205, 100, 320, 100],
    ["inventario_stock", 1205, 225, 320, 100],
    ["movimientos_inventario", 1205, 350, 320, 100],
    ["alertas_stock_config", 1205, 475, 320, 100],
    ["respaldos", 1205, 600, 320, 100],
    ["PostgreSQL 16", 1205, 725, 320, 100],

    ["Disco local", 1645, 100, 210, 80]
];


function aviso(txt) {
    try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup(txt, 0, "Paquete 6 - Inventario y Almacen", 64);
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
    N.push("ARQUITECTURA DEL PAQUETE 6 - INFORME DE EJECUCION");
    N.push("Paquete 6: Gestion de Inventario y Almacen. Casos CU17, CU18, CU19 y CU20.");
    N.push("");
    N.push("Componentes:   " + creados + " de " + TOTAL_CMP);
    N.push("Interfaces:    " + enlaces + " de " + TOTAL_REL);
    N.push("Marcos:        " + marcosCreados + " de 7, y son Package reales");
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
    N.push("  deben ser 34 objetos con tamano: 27 componentes + 7 marcos.");
    N.push("");
    N.push("EL REPARTO DE LOS 27 COMPONENTES");
    N.push("  Presentacion        6   5 pantallas y el cliente HTTP");
    N.push("  Control             5   uno por cada servicio de inventario,");
    N.push("                           mas el de respaldos");
    N.push("  Logica de Negocio  7   4 de inventario y 3 de respaldos");
    N.push("  Del Paquete 1       2   las guardas y la bitacora");
    N.push("  Datos               6   4 tablas, las entidades y el motor");
    N.push("  Externos            1   el disco donde van los respaldos");
    N.push("");
    N.push("  Es el paquete mas grande de los seis: 27 componentes y 53");
    N.push("  interfaces, y el unico con 5 controladores y 7 servicios.");
    N.push("");
    N.push("EL REPARTO DE LAS 53 INTERFACES");
    N.push("  pantalla -> cliente HTTP      5   una por pantalla");
    N.push("  cliente -> control            5   las 14 rutas, en cinco bloques");
    N.push("  dependencias de codigo       21   los statements import");
    N.push("  hacia las tablas              7   las de escritura y las de lectura");
    N.push("  hacia PostgreSQL 16           6   los 5 servicios y las entidades");
    N.push("  hacia el disco                1   solo el de almacenamiento");
    N.push("  dentro de la misma capa        8   el planificador y el almacenamiento");
    N.push("");
    N.push("EL HALLAZGO: LA COMPROBACION DEL NEGATIVO NO ES ATOMICA");
    N.push("");
    N.push("  El ajuste de inventario, que es CU17 y la unica via por la que");
    N.push("  un humano cambia una cantidad sin pasar por venta o compra,");
    N.push("  hace tres cosas seguidas y sin transaccion:");
    N.push("");
    N.push("    L216  SELECT cantidad_disponible FROM inventario_stock");
    N.push("    L222  si la cantidad baja y supera lo disponible, lanza error");
    N.push("    L231  INSERT INTO movimientos_inventario");
    N.push("");
    N.push("  Y EL DESCUENTO NO LO HACE EL CODIGO, LO HACE EL DISPARADOR");
    N.push("  trg_movimiento_inventario, que salta al insertar. De manera que");
    N.push("  entre la lectura de la 216 y el descuento hay una ventana que");
    N.push("  nada cierra, y dos ajustes simultaneos pueden pasar los dos la");
    N.push("  comprobacion.");
    N.push("");
    N.push("  Y NO HAY NINGUNA RED DE SEGURIDAD: inventario_stock no tiene un");
    N.push("  solo CHECK que impida que la cantidad disponible baje de cero.");
    N.push("  Las cuatro cantidades estan con DEFAULT 0 y sin ninguna");
    N.push("  restriccion. La unica proteccion del sistema contra el stock");
    N.push("  negativo es esa lectura, que es justamente la que no es");
    N.push("  atomica.");
    N.push("");
    N.push("  NINGUNO DE LOS 7 SERVICIOS ABRE UNA TRANSACCION. CERO. En todo");
    N.push("  el paquete. Y es coherente con el diseno: el descuento lo hace");
    N.push("  el motor, y el motor ya es atomico. Lo que no es atomica es la");
    N.push("  COMPROBACION, que es del codigo.");
    N.push("");
    N.push("LO QUE ESTA BIEN, Y HAY CUATRO COSAS CONCRETAS");
    N.push("");
    N.push("  EL DISPARADOR HACE EL TRABAJO SUELTO. inventario_stock es la");
    N.push("  UNICA tabla mapeada como entidad de TypeORM del proyecto, y es");
    N.push("  justamente para que el motor pueda escribirla. Los 7 servicios");
    N.push("  no tienen ni un UPDATE contra esa tabla. El stock lo baja el");
    N.push("  motor y nadie mas, y por eso el dato tiene un solo dueño.");
    N.push("");
    N.push("  EL KARDEX NO NECESITA UNA TABLA. No hay ninguna tabla kardex en");
    N.push("  el esquema, y CU18 no la necesita: el kardex ES la tabla de");
    N.push("  movimientos, con su saldo anterior y su posterior en cada fila,");
    N.push("  escritos por el disparador. 13 columnas, 6 claves foraneas que");
    N.push("  dicen si el movimiento vino de una compra, una venta o una");
    N.push("  reserva, y un indice puesto JUSTO en las tres columnas por las");
    N.push("  que CU18 filtra: id_ptc, id_sucursal y fecha.");
    N.push("");
    N.push("  LA ALERTA TIENE TRES NIVELES Y NO NECESITA TRES TABLAS. La");
    N.push("  clave foranea puede ser la prenda, la categoria o la sucursal,");
    N.push("  y las tres pueden ser nulas. El minimo se pone donde haga falta.");
    N.push("");
    N.push("  LOS DOS SERVICIOS DE CONSULTA ACIERTAN CON EL STOCK. Existencias");
    N.push("  y alertas leen cantidad_disponible y comparan con el estado del");
    N.push("  PRODUCTO, que si se escribe. No miran estado_stock. Son los");
    N.push("  otros dos del proyecto, con el catalogo, que leen la cantidad.");
    N.push("");
    N.push("LO QUE NO ESTA BIEN, Y TAMBIEN SE VE");
    N.push("");
    N.push("  CU17 ESTA ROTO DE DOS FORMAS A LA VEZ. Una es que no hay");
    N.push("  ninguna escritura en las tablas de recepcion en todo el");
    N.push("  proyecto: cero INSERT, y son las columnas id_orden_compra de la");
    N.push("  tabla de movimientos las que unirian la recepcion con la orden.");
    N.push("  La otra es la del negativo, que ya se ha descrito.");
    N.push("");
    N.push("  LA COLUMNA notificar_email NO ENVIA CORREO. Es un booleano que");
    N.push("  se guarda en alertas_stock_config y que el servicio de correo");
    N.push("  del paquete 1 no llega a mirar. La casilla existe, se puede");
    N.push("  marcar y no ocurre nada.");
    N.push("");
    N.push("  LOS RESPALDOS SE LLAMAN .sql.gz PERO NO SE COMPRIMEN.");
    N.push("  generarNombre devuelve respaldo_marca.sql.gz y guardar hace un");
    N.push("  writeFileSync a secas, sin gunzip ni zlib. Hay un .gz en el");
    N.push("  nombre y SQL plano en el contenido, y quien lo descomprima se");
    N.push("  va a encontrar un error.");
    N.push("");
    N.push("  EL MODO S3 ESTA DECLARADO Y NO HACE NADA. El constructor lee");
    N.push("  STORAGE_BACKEND, y si vale s3 registra un aviso y sigue");
    N.push("  escribiendo en local. La rama existe y esta vacia.");
    N.push("");
    N.push("  LOS RESPALDOS NO SE LIMPIAN NUNCA. La tabla no tiene indice,");
    N.push("  ni restriccion, y ningun servicio borra. Crece sin limite.");
    N.push("");
    N.push("  Y LAS CARPETAS QUE LOS GUARDAN NO ESTAN EN EL .gitignore,");
    N.push("  que excluye node_modules, dist, build y los registros, pero no");
    N.push("  api/respaldos, api/comprobantes ni api/storage.");
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
    U.push("PAQUETE 6 - Gestion de Inventario y Almacen");
    U.push("CU17, CU18, CU19 y CU20   ·   2 modulos de NestJS");
    U.push("El mas grande: 5 controladores, 7 servicios, 14 rutas.");
    U.push("");
    U.push("Componentes:   " + creados + " de " + TOTAL_CMP);
    U.push("Interfaces:    " + enlaces + " de " + TOTAL_REL);
    U.push("Marcos:        " + marcosCreados + " de 7");
    U.push("Huerfanos:     " + huerfanos);
    U.push("Errores:       " + ERRORES.length);
    U.push("");
    U.push("LEIDO DEL DIAGRAMA:");
    U.push("  tipo:       " + tipoDiag);
    U.push("  objetos:    " + nObj);
    U.push("  con tamano: " + conTam + "   (deben ser 34)");
    U.push("  lineas:     " + nLin);
    U.push("");
    U.push("HALLAZGO: la comprobacion de stock negativo");
    U.push("  es un SELECT seguido de un INSERT, sin transaccion,");
    U.push("  y inventario_stock no tiene ningun CHECK. Dos");
    U.push("  ajustes a la vez pueden pasar los dos la comprobacion.");
    U.push("");
    if (conTam < 34) U.push("AVISO: menos de 34 con tamano. Copia este texto y pegamelo.");
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
