// ================================================================
// COMPONENTES PRINCIPALES  ·  Seccion 5.2 del documento
// E-COMMERCE TIENDAS MONTAÑO
//
// QUE DIBUJA
//   Un diagrama de componentes, en el nivel mas alto de descomposicion,
//   con los 23 componentes fisicos del sistema y las 56 interfaces
//   entre ellos, y TODO DENTRO de un marco que se llama
//   DIAGRAMA DE COMPONENTES, con las 5 capas dibujadas como marcos
//   mas pequenos DENTRO de ese marco.
//
// LOS MARCOS SON ELEMENTOS PACKAGE REALES
//   No son formas ni rectangulos sueltos.  Cada marco es un Package
//   del modelo, colocado en el diagrama con su nombre, su color y su
//   tamano, y con Sequence = 1 para que EA lo deje DETRAS del
//   contenido.  Es el mismo patron que usa CAPAS_diagrama_por_capas.js
//   en su funcion marco(), y por eso funciona.
//
// LAS COORDENADAS VERTICALES VAN EN NEGATIVO
//   o.Top = 0 - arr  y  o.Bottom = 0 - arr - alto.  EA las guarda
//   assim.  Es lo mismo que hace el script de capas.  Una version
//   anterior de este fichero las ponia en positivo y el diagrama
//   salia en blanco.
//
// DOS PASADAS, CON guardarYRecargar ENTRE ELLAS
//   Una pasada sola no basta: EA todavia no ha calculado el tamano
//   real de cada objeto y las coordenadas no quedan guardadas en
//   ningun sitio.  Entre pasada y pasada, diag.Update() mas
//   Repository.ReloadDiagram, Repository.OpenDiagram y
//   GetDiagramByID.
//
// LOS CONECTORES
//   Se crean en el PAQUETE y se colocan a mano con
//   con.DiagramID = diag.ID.  Si no, EA solo los dibuja la primera
//   vez y al reejecutar el diagrama sale sin lineas.
//
// DE DONDE SALE CADA COSA
//   Los 15 modulos se leen de api/src/app.module.ts, L5 a L19.  Las
//   15 rutas, de los decoradores @Controller.  Los 18 cruces entre
//   modulos, de los statements import de los 77 ficheros de
//   api/src/modulos.  Los ficheros, las lineas, las transacciones y
//   los estados de los externos, del codigo y de api/.env.example.
//
//   Un paquete del arbol del navegador no se dibuja en el diagrama por
//   si solo.  Por eso los 6 marcos son Package colocados a mano, y
//   no solo paquetes del arbol.
//
// Aviso con WScript.Shell.Popup, que Repository.ShowMessage no existe
// en esta version de EA.  Sin llamadas a SQL y sin SaveDiagram.
// Una instruccion por linea. Sin continuaciones. Ninguna excepcion
// escapa.
// ================================================================


var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var PAQ_NOMBRE = "Componentes";
var DIAG_NOMBRE = "Diagrama de Componentes Principal";

var TOTAL_CMP = 23;
var TOTAL_REL = 56;
var TOTAL_CAP = 5;
var TOTAL_MOD = 15;

var ERRORES = [];
var INFORME = [];

// Los 6 marcos: el grande del diagrama y las 5 capas.
// El nombre del Package ES la etiqueta que se ve en el marco.
var MARCO_NOMBRE = "DIAGRAMA DE COMPONENTES";
var MARCO_X = 10;
var MARCO_Y = 10;
var MARCO_W = 1650;
var MARCO_H = 730;
var MARCO_COLOR = 15132358;

// nombre, izquierda, arriba, ancho, alto, color de fondo
var CAPAS = [
    ["Presentacion", 30, 60, 250, 130, 13421823],
    ["Control", 30, 230, 250, 130, 13434879],
    ["Logica de Negocio", 320, 60, 1010, 480, 13434828],
    ["Datos", 320, 580, 1010, 130, 16777164],
    ["Externos", 1370, 60, 260, 560, 16770790]
];


// ================================================================
// LOS 23 COMPONENTES   [nombre, capa, nota]
// ================================================================

var PAQ = [
    ["web", "Presentacion",
    "CAPA: Presentacion | QUE ES: la aplicacion de una sola pagina que ve el usuario. No hay renderizado en servidor: todo el HTML se genera en el navegador. | FICHEROS: web/, 65 ficheros .ts y .tsx | PILA: React 19.1, React Router DOM 7.6, Vite 6.3, Tailwind CSS 4.1, lucide-react 0.525, clsx y tailwind-merge | SERVIDOR: puerto 5173, en modo desarrollo | COMO LLEGA A LA API: el servidor de Vite hace de proxy, y todo lo que empieza por /api va a http://localhost:3000, con lo que en desarrollo el navegador nunca ve el puerto del backend (web/vite.config.ts) | RUTAS DE PANTALLA: web/src/pages/cliente y web/src/pages/admin, que son los dos perfiles | CLIENTE HTTP: web/src/lib/api.ts, con fetch, credentials: 'include' para las cookies httpOnly y la cabecera Authorization para el token | ES EL UNICO COMPONENTE QUE ESTA FUERA DEL BACKEND, y el unico que corre en la maquina del usuario"],

    ["health", "Control",
    "CAPA: Control | FICHERO: api/src/health.controller.ts | QUE HACE: un unico @Get que responde { status: 'ok' } | RUTA COMPLETA: GET /api/v1/health, porque main.ts pone el prefijo global api/v1 con setGlobalPrefix | NO TOCA LA BASE DE DATOS: no hay ninguna consulta en las 12 lineas del fichero, y por eso NO tiene conector a PostgreSQL 16. Los otros 15 componentes si lo tienen | NO ES UN MODULO: lo declara app.module.ts en la raiz, fuera de los 15 | ES EL UNICO COMPONENTE SIN PAQUETE PROPIO EN EL CODIGO, y el unico que se puede quitar sin tocar nada"],

    ["seguridad", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHEROS: 18, y 3.240 lineas: es el modulo mas grande del sistema | RUTAS: 29, repartidas en 5 controladores. @Controller('auth') con 7 operaciones, y cuatro controladores @Controller('admin') con 22 entre los cuatro | CONTENIDO: CE_Modelos.ts, que es la unica clase de entidad TypeORM mapeada del proyecto, y Esquemas.ts, que son los objetos de transferencia con sus reglas de class-validator | SERVICIOS: SRV_AuthService, SRV_JWTService, SRV_SeguridadService, SRV_RolesService, SRV_EmpleadosService, SRV_SucursalesService, SRV_AuditoriaService, SRV_BitacoraService y SRV_EmailService | ES EL NUCLEO DEL SISTEMA: es el modulo del que dependen los otros 14. El cruce hacia seguridad se repite 14 veces y es el unico de los 18 cruces que se repite | TOKENS: JWT de 15 minutos de acceso y 7 dias de refresco, con revocacion en la tabla token_blacklist y la sesion en la tabla sesiones | GUARDIAS: dependencias.ts declara JwtAuthGuard y JwtOpcionalAuthGuard, y hay 97 usos de @UseGuards en el backend"],

    ["clientes", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHEROS: 3, 132 lineas: es el modulo mas pequeno del sistema | RUTA: clientes, un unico @Post, el alta de cliente | DEPENDE DE: seguridad, por SRV_ClienteService.ts y clientes.module.ts | Y ESTE MODULO TIENE UN CICLO DE IMPORTS, EL UNICO DEL SISTEMA: seguridad importa clientes, en CE_Modelos.ts y en seguridad.module.ts, y clientes importa seguridad. Los dos modulos se referencian en los dos sentidos, en 2 ficheros de cada lado, y por eso estos 2 componentes tienen flechas en las dos direcciones"],

    ["catalogo", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHEROS: 9, 2.320 lineas | RUTAS: 26, el mayor del sistema. @Controller('catalogo') con 4, @Controller('admin/catalogo') con 3, @Controller('admin/catalogos') con 12 y @Controller('admin') con 7 | SERVICIOS: SRV_CatalogoService, SRV_ProductosService, SRV_CatalogosService y SRV_TemporadasService | SEPARACION DE PERMISOS REAL: el controlador publico CTR_Catalogo.ts no lleva JwtAuthGuard, y los tres de administracion si. Leer el catalogo es publico y escribirlo no | DEPENDE DE: seguridad, en 7 de sus 9 ficheros | OJO CON EL NOMBRE: admin aparece en el prefijo de ruta de 3 modulos distintos, seguridad, catalogo y Temporal, y admin/catalogo y admin/catalogos se diferencian solo en la s final"],

    ["proveedores", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHEROS: 3, 533 lineas | RUTA: proveedores, 4 operaciones: 1 GET, 2 POST y 1 PATCH | DEPENDE DE: seguridad, en los 3 ficheros | ESCRIBE EN DOS TABLAS: proveedores y proveedor_contactos, y la segunda es el unico nombre de tabla en plural cuyo contenido esta en singular"],

    ["compras", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHEROS: 3, 685 lineas | RUTA: admin/ordenes-compra, 6 operaciones: 3 GET, 1 POST, 1 PUT y 1 PATCH | DEPENDE DE: seguridad | USA dataSource.transaction EN 2 SITIOS, L390 y L454, y es uno de los 5 modulos que envuelve su escritura en transaccion | ES EL UNICO QUE ESCRIBE EN LAS 6 TABLAS DE SU CADENA: ordenes_compra, orden_compra_items, proveedores, inventario_stock y las 2 de recepcion"],

    ["inventario", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHEROS: 9, 1.393 lineas | RUTAS: 9, y las 4 son de administracion: admin/inventario/ajustes con 2, admin/inventario/alertas con 3, admin/inventario/existencias con 2 y admin/inventario/kardex con 2 | SERVICIOS: SRV_ExistenciasService, SRV_AjustesService, SRV_KardexService y SRV_AlertasService, uno por cada ruta | EL STOCK NO LO BAJA EL CODIGO: el saldo de inventario_stock lo aplica el disparador trg_movimiento_inventario, que es BEFORE INSERT sobre movimientos_inventario, con la funcion fn_aplicar_movimiento_inventario. El codigo escribe el movimiento y el motor hace la cuenta | ES EL MODULO QUE MAS TABLAS TOCA: 9, entre ellas inventario_stock, movimientos_inventario, producto_talla_color, alertas_stock_config, producto_precios y producto_imagenes"],

    ["ventas", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHEROS: 4, 720 lineas | RUTAS: 4, en dos controladores. @Controller('ventas') con 2 POST y @Controller('pos') con 2 GET. Son los dos puntos de entrada de la venta: el web y el punto de venta | DEPENDE DE: seguridad | USA dataSource.transaction | INCONSISTENCIA REAL DE NOMBRE: los dos controladores se llaman CTR_Ventas.ts y Ctr_Pos.ts, con la C en mayuscula en uno y en minuscula en el otro. Es la unica incoherencia de prefijo de las 30 clases del backend"],

    ["pagos", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHEROS: 3, 956 lineas | RUTA: pagos, 5 operaciones: 4 POST y 1 GET | ES EL MODULO CON MAS CRUCES: 3. Depende de seguridad, de comprobantes y de recomendaciones | USA dataSource.transaction EN 2 SITIOS, L276 y L647, y es el unico modulo que abre una transaccion y ademas escribe en 2 tablas a la vez: transacciones_pago y ventas | FIRMA LAS NOTIFICACIONES con createHmac('sha256', FIRMA_SECRETO) y compara con timingSafeEqual. FIRMA_SECRETO sale de PAGO_WEBHOOK_SECRET y por defecto vale 'sandbox-secreto-cu35', o sea que el valor por defecto esta en el codigo | LA PASARELA ESTA SIMULADA: simularPasarela() genera en el propio servidor la notificacion firmada que en produccion llegaria del exterior. No hay ninguna llamada saliente a LIBELULA, a STRIPE ni a PAYPAL: los tres nombres solo aparecen como valores admitidos en los objetos de transferencia y en la constante PROVEEDORES de L37"],

    ["comprobantes", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHEROS: 3, 418 lineas | RUTA: ventas, 3 GET. OJO: comparte prefijo de ruta con el modulo ventas, y los dos cuelgan de /api/v1/ventas | DEPENDE DE: seguridad, y es uno de los 4 modulos que no dependen SOLO de seguridad | ES EL UNICO COMPONENTE QUE USA pdfkit 0.20 Y pdf-lib 1.17, y las dos librerias estan aqui a proposito, porque el comprobante de venta es un documento | PERSISTE EN DISCO con STORAGE_BACKEND, que por defecto vale 'local', y escribe en la carpeta api/comprobantes | LO CONSUME pagos: el modulo pagos importa comprobantes para emitir el comprobante dentro de su misma transaccion"],

    ["carrito", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHEROS: 3, 749 lineas | RUTA: carrito, 4 operaciones: 1 GET, 1 POST, 1 PATCH y 1 DELETE | DEPENDE DE: seguridad | ES EL UNICO QUE USA JwtOpcionalAuthGuard, en los 4 metodos del controlador. Ese guard deja pasar al que no ha iniciado sesion, y por eso el carrito se puede usar sin cuenta | ES EL UNICO COMPONENTE CUYAS 4 OPERACIONES ESTAN EN UNA SOLA RUTA: los demas modulos reparten las suyas en varias"],

    ["reservas", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHEROS: 3, 1.379 lineas | RUTAS: 12, y es el segundo mas grande despues de catalogo: 7 GET, 4 PATCH y 1 POST | DEPENDE DE: seguridad | ES EL MODULO QUE MAS TRANSACCIONES ABRE: 5 llamadas a dataSource.transaction, mas que ningun otro, y es el que mas tablas escribe de una vez: reservas, reserva_items, inventario_stock, productos y las 3 de producto_talla_color | LLEGA AL NEGOCIO DE INVENTARIO: es el que llama a liberarStockReserva y a finalizarReserva"],

    ["sesiones-ra", "Logica de Negocio",
    "CAPA: Logica de Negocio | NOMBRE REAL: el modulo es 'sesiones-ra' y la clase es SRV_SesionesRaService, y RA es el vestidor virtual, el reconocimiento de prendas | FICHEROS: 3, 471 lineas | RUTAS: 3, en sesiones-ra: 1 GET y 2 POST | DEPENDE DE seguridad Y de recomendaciones. Es el segundo modulo con doble dependencia, y el unico que cruza con recomendaciones sin ser pagos | FALLO CONFIRMADO, Y ES DEL MODELO DE DATOS: escribe en sesiones_ra.foto_resultado y en sesiones_ra.token_invitado, y esas dos columnas NO EXISTEN en BASE DE DATOS/schema.sql. El componente esta bien; lo que falla es que el modelo de datos no las tiene | ES EL UNICO COMPONENTE CUYA RESPUESTA LLEVA UNA IMAGEN GENERADA"],

    ["recomendaciones", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHEROS: 5, 672 lineas | RUTA: recomendaciones, un unico @Get | DEPENDE DE: seguridad | DELAGA EL PUNTAJE A UNA IA EXTERNA con fetch(IA_EXTERNAL_URL) y un tiempo limite de 4 segundos, AbortSignal.timeout(4000), en SRV_ScoringService.ts L142 | LA DEGRADACION ESTA IMPLEMENTADA: si no hay URL, o si la llamada falla o expira, devuelve null y el puntaje lo resuelve la logica interna. No es un punto unico de fallo | LA CONSUME pagos, al descontar la venta, y es lo que hace que los dos modulos mas pesados del sistema estan unidos"],

    ["reportes-voz", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHEROS: 3, 506 lineas | RUTA: reportes/voz, un unico @Post, y es la unica ruta del sistema cuyo cuerpo de entrada es un fichero de audio | DEPENDE DE: seguridad | HABLA CON DOS SERVICIOS POR HTTP REAL Y SON LAS DOS UNICAS LLAMADAS SALIENTES DE TODO EL BACKEND: fetch(STT_SERVICE_URL) en L142 y fetch(IA_SERVICE_URL) en L153 | ES EL UNICO QUE ABRE SU TRANSACCION CON EL QUERYRUNNER, queryRunner.startTransaction() en L436, y no con dataSource.transaction como los otros 4 | GUARDA EL AUDIO en STORAGE_PATH, que por defecto es ./storage/reportes, y el resultado en STORAGE_BACKEND, que por defecto es 'local'"],

    ["respaldos", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHEROS: 5, 633 lineas | RUTA: admin/respaldos, 5 operaciones: 3 GET, 1 POST y 1 PUT | DEPENDE DE: seguridad | TIENE UN PLANIFICADOR PROPIO, SchedulerService.ts, y es EL UNICO COMPONENTE DEL SISTEMA QUE DISPARA TRABAJO POR TIEMPO Y NO POR PETICION. Todos los demas solo trabajan cuando alguien les llama | PERSISTE con SRV_StorageService.ts, el unico componente que separa el Almacenamiento en un fichero propio, y escribe en la carpeta api/respaldos | ES EL UNICO MODULO CUYO EFECTO NO SE VE EN UNA PETICION"],

    ["PostgreSQL 16", "Datos",
    "CAPA: Datos | QUE ES: el motor de base de datos, PostgreSQL 16, en instalacion local sobre Windows como servicio | ESQUEMA: BASE DE DATOS/schema.sql. 51 tablas, 88 claves foraneas, 2 disparadores, 8 funciones PL/pgSQL, 7 indices y 1 unica restriccion CHECK | ACCESO: TypeORM, con la version declarada en api/package.json, y el driver pg 8.23 | LA FORMA DEL ACCESO NO ES LA DE UN ORM NORMAL: solo hay UNA entidad mapeada con decorador, la de inventario_stock. Todo lo demas se consulta con dataSource.query, o sea SQL escrito a mano dentro del servicio. Son 532 usos de TypeORM en el backend y solo una entidad de verdad | synchronize: false, de manera que el esquema lo manda schema.sql y no la aplicacion | TRANSACCIONES: 12 llamadas. dataSource.transaction en compras, pagos, reservas y ventas, y QueryRunner en reportes-voz | LOS 15 MODULOS LEEN O ESCRIBEN AQUI, y por eso los 15 tienen conector a este componente. El unico que no lo tiene es health"],

    ["Pasarela de pago", "Externos",
    "CAPA: Externo | QUE ES: la pasarela de pagos del comercio, la que devuelve el resultado de un cobro con tarjeta, QR o transferencia | QUE HAY DE VERDAD: ESTA SIMULADA. SRV_PagosService.simularPasarela(), L497, construye en el propio servidor la notificacion firmada que en produccion llegaria de fuera, y la mete por el mismo camino que entraria de verdad | LO QUE NO HAY: ninguna llamada saliente a LIBELULA, ni a STRIPE, ni a PAYPAL. Los tres nombres aparecen en PROVEEDORES, L37, y en las uniones de tipo de los objetos de transferencia, y en ningun otro sitio | LA INTERFAZ SI ESTA COMPLETA: procesarWebhook(), L480, valida la firma con createHmac('sha256', FIRMA_SECRETO) y compara en tiempo constante con timingSafeEqual, para que no se pueda falsificar. O sea que el camino del webhook, que es el que de verdad importa, esta entero y probado | METODOS ADMITIDOS: Efectivo, Tarjeta, QR y Transferencia en el punto de venta; Tarjeta, QR y Transferencia en linea. Efectivo no existe en la venta por internet, y no por casualidad: no hay pasarela que lo acepte"],

    ["Servicio de voz STT", "Externos",
    "CAPA: Externo | QUE ES: el servicio que transcribe a texto el audio de un reporte de voz | ENDPOINT: STT_SERVICE_URL, que por defecto es http://localhost:8001/transcribe | COMO SE LLAMA: fetch con POST y el audio en un FormData, en SRV_ReportesVozService.ts L142 | LO USA: el modulo reportes-voz, y es la unica llamada de este tipo en todo el sistema | POR DEFECTO APUNTA A LOCALHOST: sin configurar STT_SERVICE_URL, el sistema intenta llamar a un servicio que no existe en otra parte. O hay que levantarlo, o hay que configurarlo"],

    ["Servicio de IA", "Externos",
    "CAPA: Externo | QUE ES: el servicio que interpreta el reporte de voz ya transcrito, y el que puntua las prendas para las recomendaciones. Son dos servicios distintos con la misma idea | ENDPOINT UNO: IA_SERVICE_URL, por defecto http://localhost:8002/interpret, en SRV_ReportesVozService.ts L153. Interpreta la transcripcion | ENDPOINT DOS: IA_EXTERNAL_URL, SIN NINGUN VALOR POR DEFECTO, en SRV_ScoringService.ts L142. Puntua las prendas | TIENE LIMITE DE TIEMPO: 4 segundos, AbortSignal.timeout(4000). Si se agota o falla, el puntaje lo resuelve la logica interna y el sistema sigue | LO USAN DOS MODULOS: reportes-voz para interpretar, y recomendaciones para puntuar. Es el unico externo con dos clientes"],

    ["Correo SMTP", "Externos",
    "CAPA: Externo | QUE ES: el servidor de correo que manda la confirmacion de cuenta y la recuperacion de contrasena | VARIABLES: EMAIL_ENABLED, SMTP_HOST, EMAIL_FROM y EMAIL_BASE_URL | ESTADO REAL, Y NO ES BUENO: LA IMPLEMENTACION NO EXISTE. SRV_EmailService._enviarViaSmtp(), L100 y L101, no envia nada: lanza el error 'SMTP aun no configurado en el prototipo.' | Y CON EMAIL_ENABLED EN FALSE NI SIQUIERA LLEGA A LLAMARLO: el servicio escribe dos lineas en el registro con el prefijo [EMAIL SIMULADO] y devuelve true. O sea que la API responde que el correo se ha enviado sin que salga ningun correo, y el usuario se queda esperando un mensaje que no va a llegar nunca | LO USA: el modulo seguridad, en sus 3 metodos de envio. Es el unico componente dibujado en este diagrama cuya interfaz esta declarada y no implementada"],

    ["Almacenamiento local", "Externos",
    "CAPA: Externo | QUE ES: el sistema de archivos donde el backend guarda lo que no cabe en una tabla: los PDF, los respaldos y el audio de los reportes | VARIABLES: STORAGE_BACKEND, que por defecto vale 'local', y STORAGE_PATH, que por defecto vale ./storage/reportes | LO USAN TRES MODULOS, y por eso tiene tres conectores: comprobantes, que escribe en api/comprobantes; respaldos, que escribe en api/respaldos; y reportes-voz, que escribe en STORAGE_PATH | NO HAY ALMACENAMIENTO REMOTO: con STORAGE_BACKEND en 'local' los tres estan en el disco de la misma maquina que corre el backend, y en el repositorio no hay ninguna variable de cubo, ni de bucket, ni de contenedor. Las tres carpetas estan en el .gitignore del proyecto"]
];


// ================================================================
// DONDE CAE CADA COMPONENTE   [nombre, izquierda, arriba, ancho, alto]
//
//   IZQUIERDA   web y health, en dos cajas apiladas
//     CENTRO      los 15 modulos, 5 columnas por 3 filas, agrupados
//                 por dominio:
//                   fila 1  identidad y catalogo
//                   fila 2  la operacion del negocio
//                   fila 3  servicios al cliente e inteligencia
//     ABAJO       el motor de datos, bajo los 15
//     DERECHA     los 5 externos, en columna
// ================================================================

var DOND = [
    ["web", 45, 100, 220, 75],
    ["health", 45, 270, 220, 70],

    ["seguridad", 365, 100, 175, 90],
    ["clientes", 555, 100, 175, 90],
    ["catalogo", 745, 100, 175, 90],
    ["proveedores", 935, 100, 175, 90],
    ["compras", 1125, 100, 175, 90],

    ["inventario", 365, 245, 175, 90],
    ["ventas", 555, 245, 175, 90],
    ["pagos", 745, 245, 175, 90],
    ["comprobantes", 935, 245, 175, 90],
    ["carrito", 1125, 245, 175, 90],

    ["reservas", 365, 390, 175, 90],
    ["sesiones-ra", 555, 390, 175, 90],
    ["recomendaciones", 745, 390, 175, 90],
    ["reportes-voz", 935, 390, 175, 90],
    ["respaldos", 1125, 390, 175, 90],

    ["PostgreSQL 16", 500, 625, 500, 70],

    ["Pasarela de pago", 1390, 100, 220, 70],
    ["Servicio de voz STT", 1390, 205, 220, 70],
    ["Servicio de IA", 1390, 310, 220, 70],
    ["Correo SMTP", 1390, 415, 220, 70],
    ["Almacenamiento local", 1390, 520, 220, 70]
];


// ================================================================
// LAS 56 INTERFACES   [origen, destino, nombre, tipo, estereotipo]
//
//   Los 56 salen de leer el codigo:
//     los 15 de web      las 15 rutas que el navegador puede pedir,
//                        con el prefijo api/v1 que pone main.ts
//     los 18 de import   los 18 statements import que cruzan de un
//                        modulo a otro
//     los 15 de SQL      los 15 modulos que consultan PostgreSQL
//     los  8 externos    las 8 llamadas y escrituras hacia fuera
// ================================================================

var REL = [

    ["web", "seguridad", "REST /auth, /admin", "Assembly", ""],
    ["web", "clientes", "REST /clientes", "Assembly", ""],
    ["web", "catalogo", "REST /catalogo, /admin", "Assembly", ""],
    ["web", "proveedores", "REST /proveedores", "Assembly", ""],
    ["web", "compras", "REST /admin/ordenes-compra", "Assembly", ""],
    ["web", "inventario", "REST /admin/inventario", "Assembly", ""],
    ["web", "ventas", "REST /ventas, /pos", "Assembly", ""],
    ["web", "pagos", "REST /pagos", "Assembly", ""],
    ["web", "comprobantes", "REST /ventas", "Assembly", ""],
    ["web", "carrito", "REST /carrito", "Assembly", ""],
    ["web", "reservas", "REST /reservas", "Assembly", ""],
    ["web", "sesiones-ra", "REST /sesiones-ra", "Assembly", ""],
    ["web", "recomendaciones", "REST /recomendaciones", "Assembly", ""],
    ["web", "reportes-voz", "REST /reportes/voz", "Assembly", ""],
    ["web", "respaldos", "REST /admin/respaldos", "Assembly", ""],

    ["carrito", "seguridad", "importa seguridad", "Dependency", "importa"],
    ["catalogo", "seguridad", "importa seguridad", "Dependency", "importa"],
    ["clientes", "seguridad", "importa seguridad", "Dependency", "importa"],
    ["compras", "seguridad", "importa seguridad", "Dependency", "importa"],
    ["comprobantes", "seguridad", "importa seguridad", "Dependency", "importa"],
    ["inventario", "seguridad", "importa seguridad", "Dependency", "importa"],
    ["pagos", "seguridad", "importa seguridad", "Dependency", "importa"],
    ["proveedores", "seguridad", "importa seguridad", "Dependency", "importa"],
    ["recomendaciones", "seguridad", "importa seguridad", "Dependency", "importa"],
    ["reportes-voz", "seguridad", "importa seguridad", "Dependency", "importa"],
    ["reservas", "seguridad", "importa seguridad", "Dependency", "importa"],
    ["respaldos", "seguridad", "importa seguridad", "Dependency", "importa"],
    ["sesiones-ra", "seguridad", "importa seguridad", "Dependency", "importa"],
    ["ventas", "seguridad", "importa seguridad", "Dependency", "importa"],
    ["seguridad", "clientes", "importa clientes", "Dependency", "importa"],
    ["pagos", "comprobantes", "importa comprobantes", "Dependency", "importa"],
    ["pagos", "recomendaciones", "importa recomendaciones", "Dependency", "importa"],
    ["sesiones-ra", "recomendaciones", "importa recomendaciones", "Dependency", "importa"],

    ["seguridad", "PostgreSQL 16", "SQL / TypeORM", "Assembly", "consulta"],
    ["clientes", "PostgreSQL 16", "SQL / TypeORM", "Assembly", "consulta"],
    ["catalogo", "PostgreSQL 16", "SQL / TypeORM", "Assembly", "consulta"],
    ["proveedores", "PostgreSQL 16", "SQL / TypeORM", "Assembly", "consulta"],
    ["compras", "PostgreSQL 16", "SQL / TypeORM", "Assembly", "consulta"],
    ["inventario", "PostgreSQL 16", "SQL / TypeORM", "Assembly", "consulta"],
    ["ventas", "PostgreSQL 16", "SQL / TypeORM", "Assembly", "consulta"],
    ["pagos", "PostgreSQL 16", "SQL / TypeORM", "Assembly", "consulta"],
    ["comprobantes", "PostgreSQL 16", "SQL / TypeORM", "Assembly", "consulta"],
    ["carrito", "PostgreSQL 16", "SQL / TypeORM", "Assembly", "consulta"],
    ["reservas", "PostgreSQL 16", "SQL / TypeORM", "Assembly", "consulta"],
    ["sesiones-ra", "PostgreSQL 16", "SQL / TypeORM", "Assembly", "consulta"],
    ["recomendaciones", "PostgreSQL 16", "SQL / TypeORM", "Assembly", "consulta"],
    ["reportes-voz", "PostgreSQL 16", "SQL / TypeORM", "Assembly", "consulta"],
    ["respaldos", "PostgreSQL 16", "SQL / TypeORM", "Assembly", "consulta"],

    ["pagos", "Pasarela de pago", "notificacion firmada", "Assembly", "webhook"],
    ["reportes-voz", "Servicio de voz STT", "HTTP POST multipart", "Assembly", "http"],
    ["reportes-voz", "Servicio de IA", "HTTP POST JSON", "Assembly", "http"],
    ["recomendaciones", "Servicio de IA", "HTTP POST JSON, 4 s", "Assembly", "http"],
    ["seguridad", "Correo SMTP", "SMTP, declarado sin implementar", "Dependency", "declarado"],
    ["comprobantes", "Almacenamiento local", "ficheros, STORAGE_BACKEND", "Dependency", "escribe"],
    ["respaldos", "Almacenamiento local", "ficheros, STORAGE_BACKEND", "Dependency", "escribe"],
    ["reportes-voz", "Almacenamiento local", "audio, STORAGE_PATH", "Dependency", "escribe"]
];


function aviso(txt) {
    try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup(txt, 0, "Componentes Principales", 64);
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

// Recargar el diagrama. NO se usa SaveDiagram, que es lo que hacia que
// las posiciones se perdieran.
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


// ---------- EL MARCO: un Package real, con Sequence 1 para que quede detras ----------

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


// ---------- EL RECUADRO: el componente de verdad, con su nombre ----------

function recuadro(diag, el, izq, arr, ancho, alto) {
    var o = objetoEn(diag, el);
    if (o == null) {
        var tam = "l=" + izq + ";r=" + (izq + ancho) + ";t=" + arr + ";b=" + (arr + alto) + ";";
        try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e) { return null; }
        o.ElementID = el.ElementID;
    }
    // LAS COORDENADAS VERTICALES EN NEGATIVO.  EA las guarda asi, y es
    // lo que hace el script de capas.  En positivo el diagrama sale en
    // blanco.
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


// ---------- UNA PASADA: el marco grande, las 5 capas y los 23 recuadros ----------

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

    // ---- los 6 marcos, que son Package del modelo.
    // El nombre del Package es la etiqueta que se ve en el marco, y
    // por eso los de capa se llaman igual que las capas.
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

    // ---- los 23 componentes
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

    // ---- el diagrama
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

    // ---- quitar solo las ubicaciones visuales anteriores; los
    // elementos del modelo se conservan
    for (var viejo = diag.DiagramObjects.Count - 1; viejo >= 0; viejo--) {
        try { diag.DiagramObjects.GetAt(viejo).Delete(); } catch (e) { }
    }
    try { diag.DiagramObjects.Refresh(); } catch (e) { }

    // PASADA 1.  Esta sola no basta: EA todavia no ha calculado el
    // tamano real de cada objeto y las coordenadas no estan guardadas.
    INFORME.push("pasada 1: " + pintar(diag, C, F));
    diag = guardarYRecargar(diag);

    // PASADA 2.  Se vuelven a colocar los 6 marcos y los 23 recuadros
    // con el diagrama ya recargado.
    INFORME.push("pasada 2: " + pintar(diag, C, F));
    diag = guardarYRecargar(diag);

    // ---- las 56 lineas
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

    // ---- que hay de verdad
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

    // ---- el informe
    var N = [];
    N.push("DIAGRAMA DE COMPONENTES PRINCIPAL - INFORME DE EJECUCION");
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
    N.push("  deben ser 29 objetos con tamano: 23 componentes + 6 marcos.");
    N.push("");
    N.push("EL REPARTO DE LOS 23 COMPONENTES");
    N.push("  Presentacion       1    web");
    N.push("  Control            1    health");
    N.push("  Logica de Negocio 15   los 15 modulos de NestJS");
    N.push("  Datos              1    PostgreSQL 16");
    N.push("  Externos           5    pasarela, STT, IA, SMTP, disco");
    N.push("");
    N.push("EL REPARTO DE LAS 56 INTERFACES");
    N.push("  navegador -> API          15  uno por cada modulo, que es");
    N.push("                                lo que el navegador puede pedir");
    N.push("  modulo -> modulo          18  los 18 imports cruzados");
    N.push("  modulo -> PostgreSQL 16   15  uno por cada modulo.  health NO");
    N.push("                                esta, y no por olvido: no toca");
    N.push("                                la base de datos");
    N.push("  modulo -> externo          8  hacia los 5 externos");
    N.push("");
    N.push("LO QUE DICEN LOS 18 CRUCES ENTRE MODULOS");
    N.push("  14 de los 18 apuntan a seguridad, y son los 14 modulos");
    N.push("  que hay aparte del propio seguridad.  O sea que TODO modulo");
    N.push("  del sistema depende de seguridad.  No queda ninguno fuera.");
    N.push("");
    N.push("  Los 4 que no son hacia seguridad, y por que existen:");
    N.push("    pagos -> comprobantes      el comprobante se emite dentro");
    N.push("                               de la transaccion del pago");
    N.push("    pagos -> recomendaciones   la recomendacion se cobra al");
    N.push("                               confirmar la venta");
    N.push("    sesiones-ra -> recomendaciones   el puntaje de la prenda");
    N.push("    seguridad -> clientes      CE_Modelos.ts y seguridad.module");
    N.push("");
    N.push("  Y HAY UN CICLO DE IMPORTS, Y SOLO UNO:");
    N.push("    seguridad -> clientes   y   clientes -> seguridad");
    N.push("");
    N.push("LO QUE DICEN LOS 5 EXTERNOS, Y NO ES LO QUE SUENA");
    N.push("  DE LOS 5 EXTERNOS, SOLO 3 SON LLAMADAS DE RED DE VERDAD:");
    N.push("    pagos -> Pasarela de pago   NO HAY LLAMADA.  La pasarela");
    N.push("                               esta SIMULADA en el propio");
    N.push("                               servidor, en simularPasarela().");
    N.push("                               LIBELULA, STRIPE y PAYPAL solo");
    N.push("                               son valores admitidos");
    N.push("    reportes-voz -> STT         fetch real a localhost:8001");
    N.push("    reportes-voz -> IA          fetch real a localhost:8002");
    N.push("    recomendaciones -> IA        fetch real a IA_EXTERNAL_URL");
    N.push("                               con 4 s de limite, y degrada al");
    N.push("                               puntaje interno si falla");
    N.push("  Y UNO ESTA DECLARADO Y SIN IMPLEMENTAR:");
    N.push("    seguridad -> Correo SMTP    _enviarViaSmtp() lanza el");
    N.push("                               error 'SMTP aun no configurado");
    N.push("                               en el prototipo'.  Y con");
    N.push("                               EMAIL_ENABLED en false, que es");
    N.push("                               el valor por defecto, ni se");
    N.push("                               llama: se registra [EMAIL");
    N.push("                               SIMULADO] y la API responde");
    N.push("                               exito sin enviar nada");
    N.push("");
    N.push("  LAS OTRAS 4 INTERFACES SON ESCRITURA EN DISCO, no red:");
    N.push("  comprobantes, respaldos y reportes-voz escriben en el");
    N.push("  sistema de archivos local.  No hay cubo, ni bucket, ni");
    N.push("  contenedor, y las carpetas estan en el .gitignore.");
    N.push("");
    N.push("SOBRE LOS MARCOS, Y POR QUE SON ELEMENTOS Y NO FORMAS");
    N.push("  Los 6 marcos son Package del modelo, colocados en el");
    N.push("  diagrama con Sequence 1 para que EA los deje detras del");
    N.push("  contenido.  El nombre del Package es la etiqueta que se ve");
    N.push("  arriba a la izquierda, y no hay ninguna forma de texto por");
    N.push("  encima.  Es el mismo patron que el diagrama de capas por");
    N.push("  paquetes, que es el que si dibuja bien.");
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

    // el Popup no cabe con todo, asi que solo lo importante
    var U = [];
    U.push("Componentes:   " + creados + " de " + TOTAL_CMP);
    U.push("Interfaces:    " + enlaces + " de " + TOTAL_REL);
    U.push("Marcos:        " + marcosCreados + " de 6");
    U.push("Huerfanos:     " + huerfanos);
    U.push("Errores:       " + ERRORES.length);
    U.push("");
    U.push("LEIDO DEL DIAGRAMA:");
    U.push("  tipo:       " + tipoDiag);
    U.push("  objetos:    " + nObj);
    U.push("  con tamano: " + conTam + "   (deben ser 29)");
    U.push("  lineas:     " + nLin);
    U.push("");
    if (conTam < 29) U.push("AVISO: menos de 29 con tamano. Copia este texto y pegamelo.");
    U.push("Todo dentro del marco DIAGRAMA DE COMPONENTES.");
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
