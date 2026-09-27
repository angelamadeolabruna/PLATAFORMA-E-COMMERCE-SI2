// ================================================================
// PAQUETE 10  ·  ARQUITECTURA DEL SUBSISTEMA
// Reporting, KPIs y Alertas  ·  CU33, CU34, CU35, CU36
// E-COMMERCE TIENDA MONTANO   ·   Seccion 5.3.10
//
// QUE DIBUJA
//   El diagrama de componentes del paquete 10, con los 21 componentes
//   del subsistema y las 32 interfaces entre ellos, y TODO DENTRO de
//   un marco que se llama PAQUETE 10 - REPORTING, KPIS Y ALERTAS.
//
//   Un modulo de NestJS, reportes-voz, con UNA RUTA, y cinco scripts
//   de mantenimiento que NO son NestJS y que estan dentro del modulo.
//
//   21 componentes:  2 de presentacion, 1 de control, 1 de logica,
//                    2 del paquete 1, 4 externos, 1 de mantenimiento
//                    y 10 de datos
//   32 interfaces
//
// PATRON COPIADO DE CAPAS_diagrama_por_capas.js, QUE SI DIBUJA BIEN
//   -  Los marcos son Package REALES del modelo, con Sequence = 1.
//   -  LAS COORDENADAS VERTICALES VAN EN NEGATIVO.
//   -  DOS PASADAS con guardarYRecargar entre ellas.
//   -  El conector se coloca con con.DiagramID = diag.ID.
//
// EL HALLAZGO DE SEGURIDAD, Y ES EL MAS GRAVE DE LOS DIEZ PAQUETES
//
//   LA CONTRASENA DE SUPABASE ESTA EN TEXTO PLANO EN 17 FICHEROS.
//
//     postgresql://postgres.XXXXXXXXXXXX:XXXXXXXXXXXXXXXX@
//     aws-0-sa-east-1.pooler.supabase.com
//
//   Que es la base de datos de PRODUCCION, en la region de Sao Paulo.
//
//   Y los 17 ficheros NO son 5.  Son:
//
//     1  PROTOTIPO/api/.env
//     4  los scripts de mantenimiento de este paquete
//    11  los ficheros de pruebas e2e, del CU20 al CU43
//     1  un script de Enterprise Architect
//
//   O sea que la credencial de la base de datos de produccion esta
//   repartida por el proyecto entero, y hay 4 scripts que la usan para
//   MODIFICAR LOS PERMISOS DE LOS ROLES por fuera de la aplicacion.
//
// EL SEGUNDO HALLAZGO: LOS DOS SERVICIOS EXTERNOS NO EXISTEN
//
//   El servicio pide la transcripcion a STT_SERVICE_URL, con valor de
//   reserva http://localhost:8001/transcribe, y la intencion a
//   IA_SERVICE_URL, con http://localhost:8002/interpret.
//
//   En el repositorio hay CERO ficheros .py, CERO docker-compose y
//   CERO requisitos.  Los dos servicios no estan.
//
//   Y ESO NO ROMPE NADA, PORQUE HAY RESPALDO.  extraerIntencion, en la
//   151, envuelve la llamada en un try, y si falla entra al comentario
//   fallback a reglas locales, que es extraerIntencionLocal, en la 186.
//   Y ahi no hay IA: hay dos diccionarios de palabras y un includes.
//
//   O SEA QUE EL PAQUETE FUNCIONA ENTERO SIN INTELIGENCIA ARTIFICIAL
//   NINGUNA, Y ESO ES LO QUE HACE QUE EL CU SE PUEDA DEMOSTRAR.
//
// EL TERCER HALLAZGO: LA MIGRACION Y EL ESQUEMA NO DICEN LO MISMO
//
//   migration_reportes_generativos.sql declara las cinco columnas con
//   NOT NULL y crea dos indices.  schema.sql declara las mismas cinco
//   columnas SIN NINGUN NOT NULL, y no crea ningun indice.
//
//   Y la migracion empieza por CREATE TABLE IF NOT EXISTS, de manera que
//   si la base de datos se creo con schema.sql, al correr la migracion
//   la tabla YA EXISTE, la sentencia no hace nada, y los NOT NULL y
//   los dos indices NUNCA LLEGAN A APLICARSE.
//
// Aviso con WScript.Shell.Popup.  Sin llamadas a SQL y sin
// SaveDiagram.  Una instruccion por linea.  Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================


var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var PAQ_NOMBRE = "Paquete 10 - Reporting, KPIs y Alertas";
var DIAG_NOMBRE = "Arquitectura del Paquete 10";

var TOTAL_CMP = 21;
var TOTAL_REL = 32;
var TOTAL_CAP = 7;

var ERRORES = [];
var INFORME = [];

var MARCO_NOMBRE = "PAQUETE 10 - REPORTING, KPIS Y ALERTAS";
var MARCO_X = 10;
var MARCO_Y = 10;
var MARCO_W = 1800;
var MARCO_H = 1200;
var MARCO_COLOR = 15132358;

// nombre, izquierda, arriba, ancho, alto, color
var CAPAS = [
    ["Presentacion", 30, 60, 800, 210, 13421823],
    ["Control", 30, 320, 800, 170, 13434879],
    ["Logica de Negocio", 30, 540, 800, 170, 13434828],
    ["Del Paquete 1", 880, 60, 300, 210, 16777164],
    ["Externos", 880, 320, 340, 340, 16777164],
    ["Mantenimiento", 880, 710, 340, 170, 13434828],
    ["Datos", 1260, 60, 510, 1060, 16770790]
];


// ================================================================
// LOS 25 COMPONENTES   [nombre, capa, nota]
// ================================================================

var PAQ = [

    // ---------------- PRESENTACION: 2 ----------------

    ["ReportesVoz.tsx", "Presentacion",
    "CAPA: Presentacion | CASOS: CU33, CU34, CU35 y CU36 | FICHERO: web/src/pages/admin/ReportesVoz.tsx, 218 lineas | LLAMA: una sola funcion, api.generarReporteVoz, que es la unica ruta del paquete | **ES LA UNICA PANTALLA DEL PAQUETE, Y EL PAQUETE SE LLAMA Reporting, KPIs y Alertas.** O sea que de los tres nombres del paquete, aqui solo hay reporting | **LO QUE PIDE ES UNA FRASE, EN TEXTO O EN AUDIO, Y EL SERVIDOR LA INTERPRETA.** No hay un formulario con tres campos de tipo, formato y fecha. Eso es lo que hace el caso de uso y por eso se llama voz | **Y EL SERVIDOR LE DEVUELVE UNA PREGUNTA DE CONFIRMACION ANTES DE GENERAR NADA**, con generarPreguntaConfirmacion en la 264. Dice le tipo de reporte, la sucursal, el periodo y el formato, y acaba con Responde Si para confirmar | **ADMINISTRATIVA, CON SU RUTA EN admin.** Esta en pages/admin, y por eso las otras tres pantallas del paquete, las de alertas, estan tambien en admin y las sirve otro modulo"],

    ["api.ts", "Presentacion",
    "CAPA: Presentacion | FICHERO: web/src/lib/api.ts | EL CLIENTE HTTP DEL PAQUETE | **UNA SOLA RUTA, POST reportes/voz, que es la unica del paquete entero** | **Y ES LA UNICA DEL PROYECTO QUE MANDA AUDIO.** La peticion va como FormData, porque el controlador usa FileInterceptor con el nombre de campo audio. Las otras 15 rutas del cliente HTTP son JSON | **LO QUE DEVUELVE TIENE TRES CAMPOS: id_reporte, url_archivo y resumen.** Y hay un caso en que el id_reporte vale CERO: cuando el servidor devuelve la pregunta de confirmacion en vez del reporte. O sea que el CERO no es un error, es el estado de conversacion"],

    // ---------------- CONTROL: 1 ----------------

    ["CTR_ReportesVoz", "Control",
    "CAPA: Control | FICHERO: api/src/modulos/reportes-voz/CTR_ReportesVoz.ts, **31 LINEAS** | @Controller('reportes/voz') con JwtAuthGuard en la ruta | **UNA RUTA, POST, y ES LA UNICA DEL PROYECTO QUE ADMITE UN FICHERO ADJUNTO**, con UseInterceptors y FileInterceptor en la 14, sobre el campo audio | **Y EL CONTROLADOR HACE UNA VALIDACION PROPIA, ANTES DE LLAMAR AL SERVICIO**: en la 25, si no llega ni audio ni texto, lanza BadRequestException con el mensaje Debe enviar audio o texto del comando | **EL TIPO DEL FICHERO ES any, NO Multer.** La propia firma lo declara, con UploadedFile() y audio: any. Es el unico punto del proyecto donde se pierde el tipado, y en el punto donde mas lo hace falta, porque el buffer de audio entra directamente en una llamada de red | **Y LA RUTA SE LLAMA procesar, IGUAL QUE EL METODO DEL SERVICIO.** procesar, en el 15 del controlador, y procesar, en el 89 del servicio. Es el unico sitio del proyecto donde controlador y servicio comparten nombre, y no es un error: aqui el controlador es una pasarela"],

    // ---------------- LOGICA DE NEGOCIO: 1 ----------------

    ["SRV_ReportesVozService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/reportes-voz/SRV_ReportesVozService.ts, **461 LINEAS: EL FICHERO MAS LARGO DE ESTE PAQUETE Y EL DECIMO DEL PROYECTO** | METODOS: 15, y solo uno es la ruta: procesar. Los otros catorce son asegurarStorage, exigirPermisoReportes, transcribirAudio, extraerIntencion, normalizarIntencion, extraerIntencionLocal, generarPreguntaConfirmacion, validarParametros, generarReporte, generarPDF, generarXLSX, generarCSV, guardarArchivo y registrarReporte | **Y ES EL UNICO SERVICIO DEL PROYECTO QUE USA UNA TRANSACCION CON QueryRunner Y NO CON dataSource.** En registrarReporte, en la 434, con createQueryRunner, connect, startTransaction y el commit al final. Los paquetes 7 y 8 usan dataSource.transaction, o sea que el proyecto tiene dos maneras de escribir una transaccion y cada paquete uso la suya | **EL FLUJO ENTERO ESTA EN procesar, Y SON SIETE PASOS:** el permiso, transcribir o no, extraer la intencion, la confirmacion, validar, generar el fichero, y por ultimo registrar | **SOLO ENTIENDE TRES TIPOS DE REPORTE: ventas, inventario y disponibilidad.** Y validarParametros, en la 282, rechaza cualquier otro con un UnprocessableEntityException. O sea que el paquete que se llama KPIs no tiene ni un solo KPI | **Y TRES FORMATOS: pdf, xlsx y csv.** Tres funciones distintas, generarPDF, generarXLSX y generarCSV, y el CSV se arma a mano con un join de comas, en la 415, sin ningun paquete de npm | **LOS PARAMETROS OBLIGATORIOS SON TRES, Y CADA UNO CON SU MENSAJE:** la sucursal, el periodo y el tipo. La confirmacion los anuncia como falta sucursal y falta periodo, con parentesis, y el error definitivo es Sucursal no encontrada. y Periodo no definido. | **LA IA NO HACE NADA DE LO QUE PARECE.** extraerIntencionLocal, en la 186, es un diccionario de nueve palabras para el tipo, siete para el formato, y una expresion regular para el periodo. Y el bucle es un includes sobre el texto en minusculas, con un break en la primera que coincide"],

    // ---------------- DEL PAQUETE 1: 2 ----------------

    ["dependencias.ts", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/dependencias.ts | LO USA EL CONTROLADOR Y EL SERVICIO, o sea los dos componentes de codigo del paquete | **Y EL PERMISO NO ESTA EN LA GUARDA, ESTA EN EL SERVICIO.** La guarda solo comprueba que haya sesion. El permiso de verdad lo comprueba exigirPermisoReportes, en la 120, y busca la cadena consultar_reportes en el JSON de permisos del rol, o el asterisco | **Y ESO ES LA OCTAVA REGLA DE PERMISOS DEL PROYECTO, Y LA MAS FINA DE LAS OCHO.** El resto mira un rol entero o una sucursal entera. Esta mira un permiso de texto suelto dentro de un JSONB | **EL PERMISO consultar_reportes NO ESTA EN schema.sql, NI EN roles.permisos_json.** Lo metieron despues los scripts de mantenimiento, por fuera de la aplicacion, contra la base de datos de produccion. O sea que el CU33 a CU36 dependen de un UPDATE manual que no esta en ningun sitio del repositorio como dato maestro"],

    ["CE_Modelos.ts (seguridad)", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/CE_Modelos.ts | LA USA EL CONTROLADOR Y EL SERVICIO, y el modulo la declara con TypeOrmModule.forFeature | **Y OJO CON LA CONVENCION, QUE AQUI SI SE INVIERTE.** En los otros nueve paquetes, CE_Modelos va en la capa de datos. Aqui va en la del paquete 1, porque ReportesVozModule la mete en sus imports con TypeOrmModule.forFeature, y eso la convierte en parte de la configuracion del modulo. Es la misma clase, pero dependida de otra manera | Y SIGUE SIENDO LA ENTIDAD Usuario, que es la unica del proyecto que se mapea con TypeORM en serio"],

    // ---------------- EXTERNOS: 4 ----------------

    ["Servicio STT (puerto 8001)", "Externos",
    "CAPA: Externos | **ESTE COMPONENTE NO EXISTE EN EL REPOSITORIO** | transcribirAudio, en la 136, hace POST a STT_SERVICE_URL, que por defecto es http://localhost:8001/transcribe, mandando el audio como un Blob de tipo audio/webm dentro de un FormData | **Y EN EL PROYECTO HAY CERO FICHEROS .py, CERO DOCKER-COMPOSE Y CERO REQUISITOS.** O sea que el servicio de transcripcion no esta ahi, y sin el no hay voz | **PERO LA RUTA ACEPTA TEXTO TAMBIEN, Y ENTONCES ESTE COMPONENTE NO SE LLAMA.** En procesar, la 94, si viene texto se usa directamente y no se transcribe. O sea que la mitad de la ruta funciona sin este componente | **Y SI SE LLAMA Y FALLA, EL EFECTO ES EL MENSAJE:** en la 147, No se pudo transcribir el audio. Intenta nuevamente. Y despues, en la 99, el servicio dice No se pudo capturar el comando de voz | **LO UNICO QUE DICE EL CODIGO DE QUE ESTO SE PENSÓ PARA WHISPER ES EL TIPO MIME, audio/webm.** Y el nombre del campo es el mismo que el del interceptor, audio, de manera que las dos puntas hablan el mismo idioma"],

    ["Servicio IA (puerto 8002)", "Externos",
    "CAPA: Externos | **ESTE COMPONENTE TAMPOCO EXISTE** | extraerIntencion, en la 151, hace POST a IA_SERVICE_URL, que por defecto es http://localhost:8002/interpret, con un JSON que tiene una sola clave, texto | **Y AQUI SI HAY RESPALDO DE VERDAD, Y ESTA BIEN PUESTO.** La llamada va dentro de un try, y si falla, el catch esta VACIO, con un comentario que dice fallback a reglas locales, y la funcion sigue con extraerIntencionLocal | **O SEA QUE LA IA ES UN MEJORA, NO UN REQUISITO.** Y eso es exactamente lo que haria bien un buen diseño: si el motor de lenguaje no esta, el paquete funciona igual | **LO QUE MANDA ES EL TEXTO CRUDO, sin el perfil del usuario ni las sucursales ni los roles.** O sea que este servicio no sabe a quien le pregunta, y la normalizacion posterior pone el tipo por defecto en ventas cuando lo que llega no es ninguno de los tres | Y EL OTRO DEFECTO DE ESTE COMPONENTE: no tiene limite de tiempo, a diferencia del motor de IA del paquete 9, que si lo tenia con AbortSignal.timeout"],

    ["Multer", "Externos",
    "CAPA: Externos | FICHERO: lo aporta @nestjs/platform-express, con el FileInterceptor | **ES LO QUE CONVIERTE LA RUTA EN UNA RUTA CON FICHERO ADJUNTO**, y no hay ningun limite de tamano declarado | **O SEA QUE LA PETICION PUEDE LLEGAR A SER ENORME Y NO HAY NADA QUE LA PARE.** El controlador coge audio.buffer y lo pasa entero al servicio, que lo mete en un Blob y lo manda por la red. En un despliegue publico eso es un vector de agotamiento de memoria, y mas en un despliegue de bolivia con el servidor de la tienda | **Y NO HAY VALIDACION DEL TIPO MIME.** El servicio lo fuerza a audio/webm al construir el Blob, en la 139, sin mirar lo que realmente llego. O sea que un PDF con el nombre audio.webm pasaria el filtro sin problema | Ojo: los tres paquetes que aceptan ficheros, este y los dos de respaldos, son los unicos sitios donde Multer aparece en el proyecto"],

    ["Sistema de ficheros (storage)", "Externos",
    "CAPA: Externos | **ES EL SEGUNDO BACKEND QUE EL PAQUETE DECLARA Y EL UNICO QUE IMPLEMENTA** | El servicio declara dos variables: storagePath, que por defecto es ./storage/reportes, y storageBackend, que por defecto es local | **Y SOLO USA LA PRIMERA.** El mkdir con recursive en la 83, y el writeFile en la 424, con path.join. O sea que storageBackend se lee, se guarda en una propiedad, y no se consulta en ningun sitio del fichero | **ESO ES UNA DEUDA ANONIMA:** la variable promete S3, Minio, o lo que sea, y el codigo es de disco local. Es el mismo patron del modulo de respaldos, que tambien declara un modo S3 y esta vacio | **Y EL PAQUETE 8 TIENE EL MISMO PROBLEMA CON OTRO NOMBRE:** ahi se llama pdf_url y guarda una ruta en disco, y aqui se llama url_archivo y tambien. Los dos campos dicen url y los dos son rutas de fichero"],

    // ---------------- MANTENIMIENTO: 1 ----------------

    ["Scripts de mantenimiento (5)", "Mantenimiento",
    "CAPA: Mantenimiento | FICHEROS: agregar-permiso.js con 34 lineas, agregar-permiso-cajero.js con 24, quitar-permiso.js con 32, check-roles.js con 32 y ejecutar-migracion.js con 30. **SON 152 LINEAS DENTRO DE LA CARPETA DE UN MODULO DE NESTJS** | **Y NO SON CODIGO DEL MODULO: SON CINCO EJECUCIONES DE UNA VEZ.** Con ConnectionString escrito a mano, con pg.Client, y con un main que se ejecuta al importar el fichero | **LO QUE HACEN ES MODIFICAR LOS PERMISOS DE LOS ROLES POR FUERA DE LA APLICACION.** Agregan la cadena consultar_reportes al rol 3, que es el Cajero, y al 2, que es el Encargado, con un UPDATE de roles y un permisos_json con el operador de concatenacion de JSONB | **Y LOS IDENTIFICADORES DE ROL ESTAN ESCRITOS A MANO, EL 3 Y EL 2.** O sea que el permiso se aplica al identificador, no al nombre. Si el seed inserta los roles en otro orden, el permiso se le da al rol equivocado y nadie se entera | **Y HAY UN SCRIPT QUE ES OTRO SCRIPT.** agregar-permiso.js hace Cajero y Encargado, y agregar-permiso-cajero.js hace solo Cajero, con el mismo UPDATE copiado. Los dos existen, y el segundo es el primero recortado | **Y HAY UN TERCER SCRIPT, quitar-permiso.js, QUE QUITA EL PERMISO, con el operador de resta de JSONB, y cuyo comentario dice para que E2 pase.** O sea que el permiso se pondio para que una prueba pasara, y luego hubo que probarlo otra vez quitandolo | **Y check-roles.js BUSCA USUARIOS POR CORREO, con un LIKE a cu36 y a cu32 de tiendasmontano.com.** O sea que hay una cuenta de prueba por caso de uso, en produccion, y el proyecto lo sabe"],

    // ---------------- DATOS: 14 ----------------

    ["reportes_generativos", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **SIETE COLUMNAS, Y ES LA UNICA QUE ESCRIBE ESTE PAQUETE ADEMAS DE LA BITACORA** | TIENE id_reporte, id_usuario, tipo, parametros, formato, url_archivo y fecha | **Y schema.sql Y LA MIGRACION NO DICEN LO MISMO, Y LA DIFERENCIA ES IMPORTANTE.** En schema.sql las cinco columnas de datos estan SIN NINGUN NOT NULL. En migration_reportes_generativos.sql las cinco son NOT NULL | **Y LA MIGRACION EMPIEZA POR CREATE TABLE IF NOT EXISTS.** O sea que si la base de datos se creo con schema.sql, al correr la migracion la tabla ya existe, la sentencia no hace nada, y los NOT NULL NUNCA LLEGAN. **ADEMAS schema.sql NO CREA NINGUN INDICE PARA ESTA TABLA, Y LA MIGRACION SI, DOS** | **LO QUE SE GUARDA EN parametros ES UN JSONB CON LAS TRES COSAS QUE PIDO EL USUARIO**: desde, hasta y la sucursal, con los dos primeros recortados a fecha, sin la hora, con un split del caracter T | **Y NO HAY NI UN CHECK NI NINGUN ESTADO.** tipo admite los tres valores en el codigo y cualquier cosa en la base de datos, y formato lo mismo. Y no hay columna que diga si el fichero sigue ahi, de manera que un reporte cuyo PDF se borro del disco sigue pensando que existe"],

    ["bitacora_auditoria", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **ONCE COLUMNAS, Y ES LA MEJOR TABLA DEL ESQUEMA, Y DICHO POR EL PROPIO PROYECTO** | TIENE id_bitacora, id_usuario, accion_sql, tabla_afectada, id_registro, detalle, old_data, new_data, ip_address, user_agent y fecha_hora | **LO QUE LA HACE BUENA SON TRES COSAS:** guarda el antes y el despues en dos JSONB, tiene la direccion IP y el agente, y su clave foranea a usuarios es ON DELETE SET NULL, que es lo unico del proyecto. O sea que si borras un usuario, sus auditorias se quedan | **Y TIENE LOS DOS UNICOS INDICES CON NOMBRE DEL PAQUETE DE SEGURIDAD:** uno por fecha_hora en orden descendente, y otro por tabla_afectada. Los dos son los que la consulta del paquete 8 necesita para buscar el NIT de un cliente | **ESTE PAQUETE LA ESCRIBE DENTRO DE LA MISMA TRANSACCION QUE EL REPORTE**, en registrarReporte, con un segundo INSERT en la 447, y con el mismo QueryRunner. O sea que o se guardan los dos o no se guarda ninguno, y eso esta bien hecho"],

    ["ventas", "Datos",
    "CAPA: Datos | FICHERO: la tabla | ONCE COLUMNAS, LEIDA Y NUNCA ESCRITA POR ESTE PAQUETE | **Y LA CONSULTA DE VENTAS ES LA MEJOR DEL PROYECTO, Y PORQUE USA UNA EXPRESION, NO UNA COLUMNA.** En la 297 calcula el subtotal como vi.cantidad por vi.precio_unitario, en vez de leer la columna venta_items.subtotal que ya existe | **Y ESO TIENE UNA CONSECUENCIA BUENA Y OTRA NO TAN BUENA.** La buena: el informe no depende de que el subtotal guardado sea correcto. La no tan buena: si el precio se cambio despues de la venta, el informe recalcula con el precio_unitario congelado en venta_items, que si es correcto, pero el total que muestra la pantalla de venta y el del informe pueden no coincidir si el subtotal guardado esta mal | **Y EL FILTRO ES DE TRES COSAS:** la sucursal, y el periodo con BETWEEN. O sea que el total de la empresa no sale de este reporte: hay que pedir cada sucursal por separado. Y no se mira el estado de la venta, igual que hacia el motor de recomendaciones del paquete 9"],

    ["venta_items", "Datos",
    "CAPA: Datos | FICHERO: la tabla | SEIS COLUMNAS, leida y nunca escrita por este paquete | **ES LA QUE DA EL DETALLE DEL REPORTE DE VENTAS**: cantidad, precio_unitario y el producto, con la talla y el color, en un JOIN de seis tablas | **Y POR ESA UNION DE SEIS TABLAS, UNA FILA ES UNA UNIDAD, NO UNA VENTA.** Si alguien compro tres prendas del mismo modelo, salen tres filas. Y el resumen, en la 313, dice N registros y el total es la suma de los subtotales, o sea que cuenta unidades y dice registros | **Y EL RESUMEN NO DICE CUANTAS VENTAS HUBO**, que es el numero que se le pediria a un reporte de ventas. Es un detalle, pero es el que separa un listado de un informe"],

    ["productos, producto_talla_color, tallas, colores y categorias", "Datos",
    "CAPA: Datos | FICHERO: las cinco tablas, en un componente | **SON LAS CINCO QUE NECESITA EL REPORTE DE INVENTARIO, Y EL REPORTE DE VENTAS USA LAS MISMAS MENOS categorias** | producto_talla_color es la que convierte producto en prenda, y de ahi salen la talla y el color | **Y EL REPORTE DE INVENTARIO, en la 316, PIDE codigo_hex DEL COLOR Y NO LO USA PARA NADA.** Lo trae en la lista de columnas, de modo que sale en el PDF y en el Excel, y no se pin-ta en ninguna parte de la interfaz. Es el unico campo decorativo del paquete | **Y LAS CINCO TABLAS SE LEEN, NUNCA SE ESCRIBEN, DESDE UN PAQUETE QUE SE LLAMA KPIs.** No hay ni un indicador, ni un porcentaje, ni una comparacion entre periodos. Los tres reportes son tres listados con un total al final"],

    ["inventario_stock", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **SIETE COLUMNAS, Y EL REPORTE DE INVENTARIO USA TRES**: cantidad_disponible, cantidad_vendida y el stock_minimo_alert, por el nombre del campo | **Y NO USA LA QUE DEBERIA.** No pide cantidad_reservada, que es la que el paquete 7 mueve y la que explica por que el disponible no cuadra con el fisico. O sea que el reporte de inventario dara un numero que ya se sabe que esta mal, y no va a decir por que | **Y LA CONSULTA ES CORRECTA EN LO IMPORTANTE:** filtra por sucursal y ordena por producto, talla y color, de manera que el informe sale ordenado como lo lee una persona"],

    ["sucursales", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **LEIDA, Y OBLIGATORIA EN LOS TRES REPORTES** | validarParametros, en la 284, lanza Sucursal no encontrada. si no hay identificador, y eso es para los tres tipos de reporte | **O SEA QUE NO HAY REPORTE DE TODA LA EMPRESA.** Ni de ventas, ni de inventario, ni de disponibilidad. Hay que preguntar tres veces, una por tienda, y con el nombre de la sucursal en el JOIN porque el reporte lo muestra en la primera columna | **Y LA SUCURSAL NUNCA SE SACA DEL USUARIO.** Un empleado ve los reportes de cualquier tienda, solo porque la pida. Es la unica de las tres donde el permiso no comprueba que la sucursal sea la suya"],

    ["clientes", "Datos",
    "CAPA: Datos | FICHERO: la tabla | CINCO COLUMNAS | **SE USA CON UN LEFT JOIN, Y ESO ESTA BIEN PUESTO.** En la 301. O sea que una venta sin cliente, que el esquema permite porque id_cliente es nullable, sale con el nombre en blanco en vez de desaparecer del informe | **Y DE LAS CINCO COLUMNAS SOLO SE USA nombre.** Ni el telefono, ni la direccion, ni la fecha de registro. Un reporte de ventas de una tienda de ropa muestra nombres de cliente"],

    ["usuarios, roles y usuarios_roles", "Datos",
    "CAPA: Datos | FICHERO: las tres tablas | **Y LAS USA EL PAQUETE PARA UNA COSA SOLA: COMPROBAR EL PERMISO** | exigirPermisoReportes, en la 121, las une y lee el JSONB de permisos del rol, y no mira ningun otro campo | **LA CONSULTA NO TIENE LIMITE Y NO COMPRUEBA CUANTOS ROLES TIENE EL USUARIO.** O sea que si un usuario tiene dos roles, sale la fila del primero que encuentre la base de datos, y el permiso puede estar en el segundo | **Y ES LA MISMA CONSULTA, CON LA MISMA FORMA, QUE HACE EL PAQUETE 9 EN SU 52.** Las dos copian el mismo patron de tres tablas para el permiso. Al menos ahi hay consistencia"],

    ["PostgreSQL 16", "Datos",
    "CAPA: Datos | LAS QUINCE TABLAS QUE TOCA SON reportes_generativos con 7, bitacora_auditoria con 11, ventas con 11, venta_items con 6, productos con 9, producto_talla_color, inventario_stock con 7, sucursales, clientes con 5, tallas, colores, categorias, usuarios, roles y usuarios_roles | **LO QUE SOSTIENE EL PAQUETE SON TRES COSAS Y LAS TRES ESTAN EN CUALQUIER SITIO MENOS EN LA BASE DE DATOS.** Los tres tipos de reporte, los tres formatos y los tres campos obligatorios estan en el codigo, con literales, en cinco sitios distintos | **Y LAS CINCO FUNCIONES Y PROCEDIMIENTOS DEL MOTOR, NI UNO SE USA.** Y los dos que de verdad learian bien los reportes, sp_registrar_venta y fn_kardex_producto, siguen sin usarse | **LA TABLA DE ALERTAS, alertas_stock_config, CON SUS 7 COLUMNAS, ESTA EN EL ESQUEMA Y NO LA USA NADIE.** Cero ficheros del proyecto la nombran. Es la tercera tabla muerta del proyecto, detras de devoluciones y recomendaciones_ia"]
];


// ================================================================
// LAS 32 INTERFACES   [origen, destino, nombre, tipo, estereotipo]
// ================================================================

var REL = [
    // ---- pantalla -> cliente HTTP: 1 ----
    ["ReportesVoz.tsx", "api.ts", "generarReporteVoz, la unica ruta", "Assembly", "llama"],

    // ---- cliente -> control: 1 ----
    ["api.ts", "CTR_ReportesVoz", "HTTP multipart, 1 ruta POST", "Assembly", "expone"],

    // ---- importaciones de codigo: 5 ----
    ["CTR_ReportesVoz", "SRV_ReportesVozService", "procesar, 1 metodo para 1 ruta", "Dependency", "delega"],
    ["CTR_ReportesVoz", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_ReportesVoz", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["SRV_ReportesVozService", "dependencias.ts", "UsuarioActual, para el permiso", "Dependency", "importa"],
    ["SRV_ReportesVozService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    // ---- hacia los externos: 4 ----
    ["CTR_ReportesVoz", "Multer", "FileInterceptor sobre el campo audio", "Dependency", "adjunta"],
    ["SRV_ReportesVozService", "Servicio STT (puerto 8001)", "POST con el audio, y no existe", "Assembly", "simula"],
    ["SRV_ReportesVozService", "Servicio IA (puerto 8002)", "POST con el texto, y no existe", "Assembly", "simula"],
    ["SRV_ReportesVozService", "Sistema de ficheros (storage)", "mkdir y writeFile, en local", "Assembly", "escribe"],

    // ---- mantenimiento: 2 ----
    ["Scripts de mantenimiento (5)", "usuarios, roles y usuarios_roles", "UPDATE de permisos_json, 4 scripts", "Assembly", "escribe"],
    ["Scripts de mantenimiento (5)", "PostgreSQL 16", "con la contrasena escrita a mano", "Assembly", "roba la conexion"],

    // ---- hacia las tablas: 14 ----
    ["SRV_ReportesVozService", "reportes_generativos", "1 INSERT, con QueryRunner", "Assembly", "escribe"],
    ["SRV_ReportesVozService", "bitacora_auditoria", "1 INSERT, en la misma transaccion", "Assembly", "escribe"],
    ["SRV_ReportesVozService", "ventas", "el calculo del subtotal, en la consulta", "Assembly", "consulta"],
    ["SRV_ReportesVozService", "venta_items", "cantidad y precio_unitario", "Assembly", "consulta"],
    ["SRV_ReportesVozService", "inventario_stock", "disponible y vendida, y no la reservada", "Assembly", "consulta"],
    ["SRV_ReportesVozService", "productos, producto_talla_color, tallas, colores y categorias", "el nombre de la prenda", "Assembly", "consulta"],
    ["SRV_ReportesVozService", "sucursales", "obligatoria en los 3 reportes", "Assembly", "consulta"],
    ["SRV_ReportesVozService", "clientes", "con LEFT JOIN, y solo el nombre", "Assembly", "consulta"],
    ["SRV_ReportesVozService", "usuarios, roles y usuarios_roles", "solo para el permiso", "Assembly", "consulta"],

    // ---- hacia PostgreSQL 16: 11 ----
    ["SRV_ReportesVozService", "PostgreSQL 16", "1 transaccion, con QueryRunner y no con dataSource", "Assembly", "consulta"],
    ["reportes_generativos", "PostgreSQL 16", "schema.sql y la migracion no coinciden", "Assembly", "apunta"],
    ["bitacora_auditoria", "PostgreSQL 16", "11 columnas y 2 indices", "Assembly", "apunta"],
    ["ventas", "PostgreSQL 16", "11 columnas, y sin filtro de estado", "Assembly", "apunta"],
    ["venta_items", "PostgreSQL 16", "6 columnas, y el subtotal no se usa", "Assembly", "apunta"],
    ["productos, producto_talla_color, tallas, colores y categorias", "PostgreSQL 16", "las 5 del catalogo", "Assembly", "apunta"],
    ["inventario_stock", "PostgreSQL 16", "7 columnas, y no lee la reservada", "Assembly", "apunta"],
    ["sucursales", "PostgreSQL 16", "obligatoria en los 3 reportes", "Assembly", "apunta"],
    ["clientes", "PostgreSQL 16", "5 columnas, y solo se usa el nombre", "Assembly", "apunta"],
    ["usuarios, roles y usuarios_roles", "PostgreSQL 16", "y el permiso no esta en el seed", "Assembly", "apunta"]
];


// ================================================================
// DONDE CAE CADA COMPONENTE   [nombre, izquierda, arriba, ancho, alto]
// ================================================================

var DOND = [
    ["ReportesVoz.tsx", 55, 100, 230, 90],
    ["api.ts", 300, 100, 230, 90],

    ["CTR_ReportesVoz", 55, 360, 350, 95],

    ["SRV_ReportesVozService", 55, 580, 350, 95],

    ["dependencias.ts", 905, 100, 250, 70],
    ["CE_Modelos.ts (seguridad)", 905, 180, 250, 70],

    ["Servicio STT (puerto 8001)", 905, 360, 140, 90],
    ["Servicio IA (puerto 8002)", 1065, 360, 140, 90],
    ["Multer", 905, 470, 140, 90],
    ["Sistema de ficheros (storage)", 1065, 470, 140, 90],

    ["Scripts de mantenimiento (5)", 905, 750, 290, 95],

    ["reportes_generativos", 1285, 100, 235, 90],
    ["bitacora_auditoria", 1530, 100, 235, 90],
    ["ventas", 1285, 250, 235, 90],
    ["venta_items", 1530, 250, 235, 90],
    ["productos, producto_talla_color, tallas, colores y categorias", 1285, 400, 235, 90],
    ["inventario_stock", 1530, 400, 235, 90],
    ["sucursales", 1285, 550, 235, 90],
    ["clientes", 1530, 550, 235, 90],
    ["usuarios, roles y usuarios_roles", 1285, 700, 235, 90],
    ["PostgreSQL 16", 1530, 700, 235, 90]
];


function aviso(txt) {
    try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup(txt, 0, "Paquete 10 - Reporting, KPIs y Alertas", 64);
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
    N.push("ARQUITECTURA DEL PAQUETE 10 - INFORME DE EJECUCION");
    N.push("Paquete 10: Reporting, KPIs y Alertas. Casos CU33, CU34, CU35 y CU36.");
    N.push("");
    N.push("Componentes:   " + creados + " de " + TOTAL_CMP);
    N.push("Interfaces:    " + enlaces + " de " + TOTAL_REL);
    N.push("Marcos:        " + marcosCreados + " de 8, y son Package reales");
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
    N.push("  deben ser 29 objetos con tamano: 21 componentes + 8 marcos.");
    N.push("");
    N.push("EL REPARTO DE LOS 21 COMPONENTES");
    N.push("  Presentacion        2   1 pantalla y el cliente HTTP");
    N.push("  Control             1   la unica ruta, y con fichero adjunto");
    N.push("  Logica de Negocio  1   los 15 metodos del servicio");
    N.push("  Del Paquete 1       2   la guarda y las entidades");
    N.push("  Externos            4   2 servicios que no existen, Multer y el disco");
    N.push("  Mantenimiento       1   5 scripts que no son NestJS");
    N.push("  Datos              10   15 tablas agrupadas en 9 componentes y el motor");
    N.push("");
    N.push("EL REPARTO DE LAS 32 INTERFACES");
    N.push("  pantalla -> cliente HTTP       1   una sola pantalla, una sola ruta");
    N.push("  cliente -> control             1   la ruta unica del paquete");
    N.push("  importaciones de codigo        5   los statements import");
    N.push("  hacia los externos             4   2 que no existen, Multer y el disco");
    N.push("  mantenimiento                   2   los scripts y su conexion");
    N.push("  hacia las tablas               9   2 que escribe y 7 que lee");
    N.push("  hacia PostgreSQL 16           10   1 servicio y 9 entidades");
    N.push("");
    N.push("HALLAZGO 1: LA CONTRASENA DE SUPABASE ESTA EN 17 FICHEROS");
    N.push("");
    N.push("  postgresql://postgres.XXXXXXXXXXXX:XXXXXXXXXXXXXXXX@");
    N.push("  aws-0-sa-east-1.pooler.supabase.com");
    N.push("");
    N.push("  Que es la base de datos de PRODUCCION, en la region de Sao Paulo.");
    N.push("");
    N.push("  Y NO SON 5 FICHEROS.  SON 17, Y ESTAN REPARTIDOS ASI:");
    N.push("");
    N.push("     1  PROTOTIPO/api/.env");
    N.push("     4  los scripts de mantenimiento de este mismo paquete");
    N.push("    11  los ficheros de pruebas e2e, del CU20 al CU43");
    N.push("     1  un script de Enterprise Architect");
    N.push("");
    N.push("  O SEA QUE LA CREDENCIAL DE LA BASE DE DATOS DE PRODUCCION ESTA");
    N.push("  ESPARCIDA POR EL PROYECTO ENTERO.  Y ADEMAS HAY 4 SCRIPTS QUE LA");
    N.push("  USAN PARA MODIFICAR LOS PERMISOS DE LOS ROLES POR FUERA DE LA");
    N.push("  APLICACION, CONTRA ESA MISMA BASE DE DATOS.");
    N.push("");
    N.push("HALLAZGO 2: LOS DOS SERVICIOS EXTERNOS NO EXISTEN, Y NO HACE FALTA");
    N.push("");
    N.push("  L70  private readonly sttUrl = process.env.STT_SERVICE_URL");
    N.push("                                          ?? 'http://localhost:8001/transcribe';");
    N.push("  L71  private readonly iaUrl = process.env.IA_SERVICE_URL");
    N.push("                                          ?? 'http://localhost:8002/interpret';");
    N.push("");
    N.push("  EN EL REPOSITORIO HAY CERO FICHEROS .py, CERO DOCKER-COMPOSE Y CERO");
    N.push("  REQUISITOS.  Los dos servicios no estan.");
    N.push("");
    N.push("  Y ESO NO ROMPE NADA, PORQUE HAY RESPALDO, Y ESTA BIEN PUESTO.");
    N.push("  extraerIntencion, en la 151, mete la llamada en un try, y si falla el");
    N.push("  catch esta vacio con un comentario que dice fallback a reglas");
    N.push("  locales, y sigue con extraerIntencionLocal, en la 186.");
    N.push("");
    N.push("  Y AHI NO HAY IA: HAY UN DICCIONARIO DE 9 PALABRAS PARA EL TIPO, OTRO");
    N.push("  DE 7 PARA EL FORMATO, Y UNA EXPRESION REGULAR PARA EL PERIODO.  El");
    N.push("  bucle es un includes sobre el texto en minusculas, con un break en la");
    N.push("  primera palabra que coincide.");
    N.push("");
    N.push("  O SEA QUE EL PAQUETE FUNCIONA ENTERO SIN INTELIGENCIA ARTIFICIAL");
    N.push("  NINGUNA, Y ESO ES JUSTO LO QUE HACE QUE EL CU SE PUEDA DEMOSTRAR.");
    N.push("");
    N.push("  Y LA RUTA ACEPTA TEXTO, EN LA 94, Y SI VIENE TEXTO NO TRANSCRIBE.")
    N.push("  O sea que la mitad de la ruta nunca toca el puerto 8001.");
    N.push("");
    N.push("HALLAZGO 3: LA MIGRACION Y EL ESQUEMA NO DICEN LO MISMO");
    N.push("");
    N.push("  migration_reportes_generativos.sql, de 13 lineas:");
    N.push("    id_usuario  INTEGER NOT NULL REFERENCES usuarios(id_usuario)");
    N.push("    tipo        VARCHAR(40) NOT NULL");
    N.push("    parametros  JSONB NOT NULL DEFAULT '{}'");
    N.push("    formato     VARCHAR(10) NOT NULL");
    N.push("    url_archivo TEXT NOT NULL");
    N.push("    mas 2 indices");
    N.push("");
    N.push("  schema.sql, las mismas cinco columnas:");
    N.push("    id_usuario  INTEGER REFERENCES usuarios(id_usuario)");
    N.push("    tipo        VARCHAR(40)");
    N.push("    parametros  JSONB");
    N.push("    formato     VARCHAR(10)");
    N.push("    url_archivo TEXT");
    N.push("    CERO NOT NULL   Y   CERO INDICES");
    N.push("");
    N.push("  Y LA MIGRACION EMPIEZA POR CREATE TABLE IF NOT EXISTS.  O SEA QUE SI");
    N.push("  LA BASE DE DATOS SE CREO CON schema.sql, AL CORRER LA MIGRACION LA");
    N.push("  TABLA YA EXISTE, LA SENTENCIA NO HACE NADA, Y LOS NOT NULL Y LOS DOS");
    N.push("  INDICES NUNCA LLEGAN A APLICARSE.");
    N.push("");
    N.push("  Y ADEMAS LA MIGRACION ESTA DUPLICADA: ejecutar-migracion.js tiene el");
    N.push("  mismo SQL escrito dentro, con la diferencia de que ese si lee la")
    N.push("  conexion de process.env.DATABASE_URL y los otros cuatro la tienen")
    N.push("  escrita a mano.");
    N.push("");
    N.push("LO QUE ESTA HECHO, Y SON CUATRO COSAS CONCRETAS");
    N.push("");
    N.push("  LA CONFIRMACION ANTES DE GENERAR NADA.  generarPreguntaConfirmacion,");
    N.push("  en la 264, monta una frase con el tipo, la sucursal, el periodo y el");
    N.push("  formato, y le anade lo que falta con parentesis, falta sucursal y");
    N.push("  falta periodo, y acaba con Responde Si para confirmar.  Y el servidor");
    N.push("  devuelve un id_reporte de CERO cuando esta en ese estado.  O sea que");
    N.push("  el CERO no es un error, es la conversacion");
    N.push("");
    N.push("  EL PERMISO ES LA REGLA MAS FINA DE LAS OCHO DEL PROYECTO.  Exige el");
    N.push("  asterisco o la cadena consultar_reportes dentro del JSONB de permisos");
    N.push("  del rol.  El resto de reglas mira un rol entero o una sucursal entera.");
    N.push("  Esta mira un permiso de texto suelto");
    N.push("");
    N.push("  LA BITACORA DENTRO DE LA MISMA TRANSACCION DEL REPORTE.  En");
    N.push("  registrarReporte, con el mismo QueryRunner, dos INSERT seguidos.  O se");
    N.push("  guardan los dos o no se guarda ninguno.  Y la bitacora_auditoria es la");
    N.push("  mejor tabla del esquema: guarda el antes y el despues, tiene la IP y el");
    N.push("  agente, y su clave foranea a usuarios es ON DELETE SET NULL, lo unico");
    N.push("  del proyecto");
    N.push("");
    N.push("  EL SUBTOTAL DEL REPORTE DE VENTAS SE CALCULA, NO SE LEE.  En la 297,");
    N.push("  cantidad por precio_unitario, en vez de usar la columna");
    N.push("  venta_items.subtotal que ya existe.  Es lo correcto: el informe no");
    N.push("  depende de que el dato guardado este bien");
    N.push("");
    N.push("  EL CLIENTE VA CON UN LEFT JOIN, en la 301.  Una venta sin cliente, que");
    N.push("  el esquema permite porque id_cliente es nullable, sale con el nombre");
    N.push("  en blanco en vez de desaparecer del informe");
    N.push("");
    N.push("LO QUE ESTA HECHO Y ADEMAS ES LA CONVENCION QUE ROMPE EL PROYECTO:")
    N.push("");
    N.push("  ESTE PAQUETE USA UNA TRANSACCION CON QueryRunner Y NO CON dataSource.");
    N.push("  En registrarReporte, en la 434, con createQueryRunner, connect y");
    N.push("  startTransaction.  Los paquetes 7 y 8 usan dataSource.transaction.  O");
    N.push("  sea que el proyecto tiene dos maneras de escribir una transaccion, y");
    N.push("  cada paquete uso la suya.  Es la unica transaccion manual del proyecto");
    N.push("");
    N.push("LO QUE NO ESTA BIEN, Y TAMBIEN SE VE");
    N.push("");
    N.push("  EL PAQUETE SE LLAMA KPIs Y NO HAY NI UN KPI.  Tres tipos de reporte,");
    N.push("  ventas, inventario y disponibilidad, y validarParametros rechaza");
    N.push("  cualquier otro.  No hay porcentaje, ni comparacion entre periodos, ni");
    N.push("  indicador.  Los tres reportes son tres listados con un total al final");
    N.push("");
    N.push("  EL PAQUETE SE LLAMA ALERTAS Y LAS ALERTAS ESTAN EN EL PAQUETE 6.**");
    N.push("  La pantalla AdminAlertas.tsx, de 461 lineas, llama a");
    N.push("  api.listarAlertas y api.obtenerOpcionesAlertas, y las dos rutas las");
    N.push("  sirve CTR_Alertas, que es @Controller admin/inventario/alertas y esta");
    N.push("  en el modulo de inventario.  Este paquete no tiene nada de alertas");
    N.push("");
    N.push("  Y LA TABLA alertas_stock_config, CON SUS 7 COLUMNAS, ESTA EN EL");
    N.push("  ESQUEMA Y NO LA USA NADIE.**  Cero ficheros del proyecto la nombran.");
    N.push("  Con notificar_email y ultima_notificacion y todo, pero sin codigo.  Es");
    N.push("  la tercera tabla muerta del proyecto, detras de devoluciones, del");
    N.push("  paquete 8, y recomendaciones_ia, del paquete 9");
    N.push("");
    N.push("  EL PERMISO consultar_reportes NO ESTA EN NINGUN SITIO COMO DATO MAESTRO.");
    N.push("  No esta en schema.sql, ni en el seed de roles, ni en una migracion.");
    N.push("  Lo metieron los scripts, con un UPDATE de permisos_json y el operador");
    N.push("  de concatenacion de JSONB, y con los identificadores de rol ESCRITOS A");
    N.push("  MANO, el 3 que es Cajero y el 2 que es Encargado.  O sea que CU33 a");
    N.push("  CU36 dependen de un UPDATE manual contra produccion");
    N.push("");
    N.push("  HAY CUATRO SCRIPTS QUE MODIFICAN LA BASE DE DATOS POR FUERA DE LA");
    N.push("  APLICACION, DENTRO DE LA CARPETA DE UN MODULO DE NESTJS.**  Y uno es");
    N.push("  copia recortada del otro, y hay un quinto que quita el permiso otra");
    N.push("  vez, con el operador de resta de JSONB, y cuyo comentario dice para");
    N.push("  que E2 pase.  O sea que el permiso se puso para que una prueba pasara");
    N.push("");
    N.push("  check-roles.js BUSCA USUARIOS POR CORREO, con un LIKE a cu36 y a cu32");
    N.push("  de tiendasmontano.com.  O sea que hay una cuenta de prueba por caso de");
    N.push("  uso, en produccion, y el proyecto lo sabe");
    N.push("");
    N.push("  LA PETICION PUEDE LLEGAR A SER ENORME Y NO HAY NADA QUE LA PARE.**  El");
    N.push("  controlador usa FileInterceptor sin limite de tamano, coge");
    N.push("  audio.buffer y lo pasa entero.  Y el servicio fuerza el tipo MIME a");
    N.push("  audio/webm al construir el Blob, sin mirar lo que llego de verdad.  Un");
    N.push("  PDF con el nombre audio.webm pasaria el filtro sin problema");
    N.push("");
    N.push("  LA SUCURSAL NUNCA SE SACA DEL USUARIO.  Es obligatoria en los tres");
    N.push("  reportes, y no se comprueba que sea la del empleado.  Un empleado ve");
    N.push("  los reportes de cualquier tienda, solo porque la pida.  Es la unica de");
    N.push("  las tres donde el permiso no comprueba la sucursal");
    N.push("");
    N.push("  NO HAY REPORTE DE TODA LA EMPRESA.  Hay que pedir cada sucursal por");
    N.push("  separado, tres veces, y el resumen no dice cuantas ventas hubo sino");
    N.push("  cuantos registros, que son unidades, no ventas");
    N.push("");
    N.push("  EL REPORTE DE INVENTARIO NO LEE cantidad_reservada, QUE ES LA QUE");
    N.push("  EXPLICA POR QUE EL DISPONIBLE NO CUADRA CON EL FISICO.  O sea que");
    N.push("  entregara un numero que ya se sabe que esta mal, y no va a decir por que");
    N.push("");
    N.push("  Y EL REPORTE DE INVENTARIO PIDE codigo_hex DEL COLOR Y NO LO USA PARA");
    N.push("  NADA.  Sale en el PDF y en el Excel, y no se pinta en ninguna parte");
    N.push("");
    N.push("  storageBackend DECLARA UN MODO S3 QUE NO EXISTE.  La propiedad se lee");
    N.push("  y no se consulta en ningun sitio.  Es el mismo patron que el modulo de");
    N.push("  respaldos, y el mismo que el pdf_url del paquete 8: campos que se")
    N.push("  llaman url y son rutas en disco");
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
    U.push("PAQUETE 10 - Reporting, KPIs y Alertas");
    U.push("CU33 a CU36   ·   1 modulo   ·   1 ruta POST   ·   9 ficheros");
    U.push("");
    U.push("Componentes:   " + creados + " de " + TOTAL_CMP);
    U.push("Interfaces:    " + enlaces + " de " + TOTAL_REL);
    U.push("Marcos:        " + marcosCreados + " de 8");
    U.push("Huerfanos:     " + huerfanos);
    U.push("Errores:       " + ERRORES.length);
    U.push("");
    U.push("LEIDO DEL DIAGRAMA:");
    U.push("  tipo:       " + tipoDiag);
    U.push("  objetos:    " + nObj);
    U.push("  con tamano: " + conTam + "   (deben ser 29)");
    U.push("  lineas:     " + nLin);
    U.push("");
    U.push("HALLAZGO 1: la contrasena de Supabase de PRODUCCION esta");
    U.push("  en 17 ficheros. 1 .env, 4 scripts de este modulo,");
    U.push("  11 ficheros e2e y 1 script de EA.");
    U.push("");
    U.push("HALLAZGO 2: los servicios de los puertos 8001 y 8002 no");
    U.push("  existen. Hay 0 ficheros .py. Pero hay respaldo por");
    U.push("  reglas locales, y el paquete funciona entero sin IA.");
    U.push("");
    U.push("HALLAZGO 3: la migracion pone NOT NULL donde schema.sql no,");
    U.push("  y como empieza por IF NOT EXISTS, nunca se aplica.");
    U.push("");
    U.push("LO QUE NO CUADRA CON EL NOMBRE: no hay ni un KPI, y las");
    U.push("  alertas estan en el paquete 6, con su propia tabla,");
    U.push("  alertas_stock_config, que no usa nadie.");
    U.push("");
    if (conTam < 29) U.push("AVISO: menos de 29 con tamano. Copia este texto y pegamelo.");
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
