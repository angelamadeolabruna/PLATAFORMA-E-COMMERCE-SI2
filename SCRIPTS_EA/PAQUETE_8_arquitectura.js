// ================================================================
// PAQUETE 8  ·  ARQUITECTURA DEL SUBSISTEMA
// Ventas y Pagos  ·  CU28 a CU31
// E-COMMERCE TIENDA MONTANO   ·   Seccion 5.3.8
//
// QUE DIBUJA
//   El diagrama de componentes del paquete 8, con los 31 componentes
//   del subsistema y las 62 interfaces entre ellos, y TODO DENTRO de
//   un marco que se llama PAQUETE 8 - VENTAS Y PAGOS.
//
//   Cuatro modulos de NestJS, carrito, ventas, pagos y comprobantes,
//   mas un quinto controlador, PosController, que vive dentro de la
//   carpeta de ventas.  16 rutas en 5 controladores.
//
//   31 componentes:  6 de presentacion, 5 de control, 4 de logica,
//                    3 del paquete 1, 1 del paquete 9, 2 externos
//                    y 10 de datos
//   62 interfaces
//
// PATRON COPIADO DE CAPAS_diagrama_por_capas.js, QUE SI DIBUJA BIEN
//   -  Los marcos son Package REALES del modelo, con Sequence = 1.
//   -  LAS COORDENADAS VERTICALES VAN EN NEGATIVO.
//   -  DOS PASADAS con guardarYRecargar entre ellas.
//   -  El conector se coloca con con.DiagramID = diag.ID.
//
// LOS TRES HALLAZGOS DE ESTE PAQUETE
//
//   1. carritos.token_invitado NO EXISTE, Y LA USA 9 SENTENCIAS SQL.
//      La tabla carritos tiene 5 columnas y ninguna es esa.  El
//      servicio la nombra 25 veces, siempre en el mismo fichero, y
//      nueve de esas veces dentro de SQL: tres SELECT, dos UPDATE y
//      un INSERT.  Y el SELECT de la 463 esta en obtenerOCrearCarrito,
//      que es el camino por el que pasan TODAS las operaciones del
//      carrito.  O sea que no se rompe el carrito de invitado: se
//      rompe el carrito entero.
//
//   2. LAS DEVOLUCIONES NO EXISTEN COMO CODIGO.  El esquema tiene las
//      tablas devoluciones y devolucion_items, y el procedimiento
//      sp_registrar_devolucion.  En los 79 ficheros de modulos no hay
//      ni una linea que las nombre.  Cero rutas, cero servicios,
//      cero pantallas.  La tabla mas el procedimiento, y nada mas.
//
//   3. LA PASARELA Y EL VERIFICADOR DE FIRMAS SON LO MISMO, CON LA
//      MISMA CLAVE.  El secreto tiene un valor de reserva escrito en
//      el codigo, la pasarela simulada es una ruta del propio
//      servidor, y las dos cosas firman con la misma funcion.
//
// Y UNO QUE ES LO CONTRARIO DE TODO LO DEMAS: el stock de este
// paquete esta BIEN HECHO.  Y es el patron que el paquete 7 hace
// mal, al reves.  Aqui el UPDATE del stock y el INSERT del
// movimiento tocan columnas distintas y la cantidad va en NEGATIVO,
// de manera que el disparador resta una sola vez.  En el paquete 7
// los dos tocan la misma columna y la cantidad va en POSITIVO, de
// manera que el disponible sube dos veces.  El mismo patron, dos
// resultados opuestos, y la diferencia esta en el signo.
//
// Aviso con WScript.Shell.Popup.  Sin llamadas a SQL y sin
// SaveDiagram.  Una instruccion por linea.  Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================


var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var PAQ_NOMBRE = "Paquete 8 - Ventas y Pagos";
var DIAG_NOMBRE = "Arquitectura del Paquete 8";

var TOTAL_CMP = 31;
var TOTAL_REL = 62;
var TOTAL_CAP = 7;

var ERRORES = [];
var INFORME = [];

var MARCO_NOMBRE = "PAQUETE 8 - VENTAS Y PAGOS";
var MARCO_X = 10;
var MARCO_Y = 10;
var MARCO_W = 1600;
var MARCO_H = 1120;
var MARCO_COLOR = 15132358;

// nombre, izquierda, arriba, ancho, alto, color
var CAPAS = [
    ["Presentacion", 30, 60, 800, 300, 13421823],
    ["Control", 30, 410, 800, 280, 13434879],
    ["Logica de Negocio", 30, 740, 800, 280, 13434828],
    ["Del Paquete 1", 880, 60, 300, 280, 16777164],
    ["Del Paquete 9", 880, 380, 300, 130, 13434828],
    ["Externos", 880, 550, 300, 210, 16777164],
    ["Datos", 1230, 60, 330, 1000, 16770790]
];


// ================================================================
// LOS 31 COMPONENTES   [nombre, capa, nota]
// ================================================================

var PAQ = [

    // ---------------- PRESENTACION: 6 ----------------

    ["CartContext.tsx", "Presentacion",
    "CAPA: Presentacion | FICHERO: web/src/contexts/CartContext.tsx, 139 lineas | LLAMA: cuatro funciones, api.consultarCarrito, api.agregarAlCarrito, api.actualizarCantidadCarrito y api.quitarItemCarrito, que son las cuatro rutas del controlador del carrito | **EL CARRITO NO TIENE PAGINA, TIENE UN CONTEXTO DE REACT.** Y esa es una decision de arquitectura, no un descuido: el carrito tiene que verse en la ficha de producto, en el checkout y en el menu, y un contexto es la unica forma de que las tres lo vean sin pasarselo por props | **Y ES LO QUE HACE QUE NO EXISTA pages/cliente/Carrito.tsx**: no hay pagina de carrito en todo el frontend, y las 35 paginas del proyecto lo confirman | **Y ESTA ROTO POR LA COLUMNA QUE NO EXISTE**, porque las cuatro rutas que llama este componente son precisamente las que nombran carritos.token_invitado"],

    ["Checkout.tsx", "Presentacion",
    "CAPA: Presentacion | FICHERO: web/src/pages/Checkout.tsx, 574 lineas | LLAMA: tres funciones, api.consultarCarrito, api.checkout y api.crearTransaccion, que son el GET del carrito, el POST ventas/checkout y el POST pagos/transacciones | **ES LA PANTALLA QUE MAS TRABAJA DEL PAQUETE, y hace de caja y de pasarela a la vez**: primero manda al checkout, que crea la venta en estado Pendiente, y luego crea la transaccion de pago. Dos pasos en una sola pantalla | **Y EL SEGUNDO PASO NO ES AUTOMATICO**: la venta queda en Pendiente y hay que ir a SandboxPago.tsx para que algo la confirme. O sea que el happy path del pago exige que el usuario pulse otro boton en otra pagina"],

    ["SandboxPago.tsx", "Presentacion",
    "CAPA: Presentacion | FICHERO: web/src/pages/SandboxPago.tsx, 238 lineas | LLAMA: una sola funcion, api.simularPasarela, que es la ruta POST pagos/sandbox/gateway | **ES LA PANTALLA DE LA PASARELA, Y ESTA DENTRO DEL PROYECTO.** O sea que el usuario elige el resultado del pago, Aprobado, Rechazado o no_responde, desde la propia aplicacion | **Y ESO ES LO QUE HACE QUE LA FIRMA NO PRUEBE NADA**: la pantalla pide el resultado y la ruta le devuelve una notificacion firmada con la clave del servidor. El unico que puede cambiar un pago de Pendiente a Aprobado es el propio vendedor, desde su propio navegador"],

    ["AdminCaja.tsx", "Presentacion",
    "CAPA: Presentacion | FICHERO: web/src/pages/admin/AdminCaja.tsx, 713 lineas, **LA SEGUNDA PANTALLA MAS LARGA DEL PAQUETE** | LLAMA: seis funciones, api.buscarProductosPos, api.buscarClientesPos, api.procesarPagoCaja, api.consultarComprobanteVenta, api.abrirComprobantePdf y api.descargarComprobantePdf | **ES EL PUNTO DE VENTA, Y TOMA LAS SEIS RUTAS QUE NO SON DEL CARRITO**: dos del punto de venta, una de cobro en caja y tres de comprobante | **Y TIENE UNA VALIDACION QUE ESTA TAMBIEN EN EL SERVIDOR**: el vuelto no puede ser negativo, y el servidor lo comprueba otra vez con otro mensaje"],

    ["MisCompras.tsx", "Presentacion",
    "CAPA: Presentacion | FICHERO: web/src/pages/cliente/MisCompras.tsx, 214 lineas | LLAMA: tres funciones, api.consultarComprobanteVenta, api.abrirComprobantePdf y api.descargarComprobantePdf, que son las tres rutas de comprobantes | **LE SOBRA EL NOMBRE:** el caso de uso era historial de pedidos y compras, y lo que se guarda y se lista son comprobantes. Las ventas se ven por el comprobante, no por la venta | **Y ES LA UNICA PANTALLA DEL PAQUETE QUE NO TOCA EL BACKEND DE ESCRITURA**: las otras cuatro crean carritos, ventas o pagos. Esta solo lee"],

    ["api.ts", "Presentacion",
    "CAPA: Presentacion | FICHERO: web/src/lib/api.ts | EL CLIENTE HTTP DEL PAQUETE | Dieciseis rutas del paquete, en cinco bloques: cuatro de carrito, dos de punto de venta, dos de venta, cinco de pago y tres de comprobante | **Y TRES DE ESAS RUTAS TIENEN UN ALIAS QUE NO SE INTUYE**: abrirComprobantePdf y descargarComprobantePdf son la misma ruta GET ventas/id/pdf, y la diferencia esta en si el navegador la abre en una pestana o la baja como fichero"],

    // ---------------- CONTROL: 5 ----------------

    ["CTR_Carrito", "Control",
    "CAPA: Control | FICHERO: api/src/modulos/carrito/CTR_Carrito.ts, 86 lineas | @Controller('carrito') con JwtOpcionalAuthGuard | **CUATRO RUTAS, GET, POST, PATCH y DELETE sobre items, y las cuatro con guardia OPCIONAL** | **Y LA GUARDIA OPCIONAL ES LA DECISION BIEN TOMADA DEL PAQUETE.** Es la unica del proyecto: el resto de controladores usan JwtAuthGuard a NIVEL DE CLASE, y este lo usa a nivel de metodo para poder dejar pasar al que todavia no ha iniciado sesion. Por eso existe la columna token_invitado | **Y ESA GUARDIA VIENE DEL PAQUETE 1 COMO UNA TERCERA COSA**, CredencialesCarrito, que es lo que permite distinguir un carrito de invitado de uno de usuario. El resto del proyecto solo tiene dos: el rol y la sucursal"],

    ["CTR_Ventas", "Control",
    "CAPA: Control | FICHERO: api/src/modulos/ventas/CTR_Ventas.ts, 110 lineas | @Controller('ventas') con JwtAuthGuard a NIVEL DE CLASE | **DOS RUTAS Y LAS DOS DIFIEREN EN EL NOMBRE**, que es la convencion correcta: POST checkout para la compra en linea y POST presencial para la venta en caja | **Y LAS DOS TIENEN SU DTO PROPIO**: CheckoutDTO con metodo_pago de Tarjeta, QR o Transferencia, y VentaPresencialDTO que ademas admite Efectivo. O sea que la diferencia entre comprar y cobrar esta en los tipos, no en un parametro | Y OJO: este controlador y el de comprobantes comparten el prefijo ventas, y eso se nota en las tres rutas del otro"],

    ["Ctr_Pos", "Control",
    "CAPA: Control | FICHERO: api/src/modulos/ventas/Ctr_Pos.ts, 31 lineas | @Controller('pos') con JwtAuthGuard en las DOS rutas, no a nivel de clase | **ESTE CONTROLADOR ROMPE LA CONVENCION DE NOMBRES DEL PROYECTO, Y POR LOS DOS LADOS.** El fichero se llama Ctr_Pos.ts, con la C mayuscula y el punto, cuando lo normal en el proyecto es el guion, y la clase se llama PosController, cuando todo lo demas es el nombre del fichero mas SRV o CTR. | **Y ES EL MAS PEQUENO DEL PAQUETE, CON 31 LINEAS, PORQUE NO HACE NADA**: las dos rutas GET solo buscan productos y clientes por texto, y las dos delegan en el servicio de ventas. No es un controlador de ventas, es un buscador | Y REPITE LA GUARDIA EN CADA RUTA, que es lo que hace el resto de controladores, pero al revés que este paquete"],

    ["CTR_Pagos", "Control",
    "CAPA: Control | FICHERO: api/src/modulos/pagos/CTR_Pagos.ts, 156 lineas | @Controller('pagos') | **CINCO RUTAS Y LAS CINCO GUARDIAS ESTAN EN LAS RUTAS, NO EN LA CLASE. Es el unico controlador del proyecto que lo hace asi** | **Y ESO ES JUSTO LO QUE HACE POSIBLE EL WEBHOOK.** La quinta ruta, POST pagos/webhook en la linea 142, NO lleva guardia, y no es un descuido: una pasarela de pago de verdad no puede mandar un JWT. Es la unica ruta sin proteccion de las 16 del paquete, y esta bien que lo este | **Y LAS CINCO RUTAS DICEN LO QUE HACEN**, y no es casualidad: es el unico punto del proyecto donde entra dinero de fuera y conviene que cada ruta se pueda auditar por su nombre"],

    ["CTR_Comprobantes", "Control",
    "CAPA: Control | FICHERO: api/src/modulos/comprobantes/CTR_Comprobantes.ts, 45 lineas, **EL MAS PEQUENO** | @Controller('ventas') con JwtAuthGuard a NIVEL DE CLASE | **Y AQUI ESTA LA SORPRESA DEL PAQUETE: ESTE CONTROLADOR NO CUELGA DE pagos, CUELGA DE ventas.** O sea que las tres rutas de comprobante son GET ventas/id/comprobante, GET ventas/mias/compras y GET ventas/id/pdf, y viven en el modulo de comprobantes | **ESO ESTA BIEN PENSADO**: la factura pertenece a la venta, no al pago. El problema es de mapa mental, no de diseno, porque quien lea las rutas de api.ts ve tres peticiones a ventas y no sabria que las sirve otro modulo | **Y LAS TRES RUTAS DEVUELVEN EL PDF COMO StreamableFile**, no una URL. El binario se genera en cada peticion"],

    // ---------------- LOGICA DE NEGOCIO: 4 ----------------

    ["SRV_CarritoService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/carrito/SRV_CarritoService.ts, 649 lineas | METODOS: 16, de los cuales cuatro son las cuatro rutas y doce son de ayuda: unaFila, cargarPermisos, exigirPermisoVenta, obtenerOCrearCarrito, validarPrenda, validarSucursalActiva, validarStock, precioVigente, cargarItems, recalcularSubtotal, armarCarrito, agregarItem, consultarCarrito, obtenerItemDeCarrito, actualizarCantidad y quitarItem | **CERO TRANSACCIONES, y aqui si es coherente**: el carrito no mueve dinero ni stock, solo suma renglones | **AQUI ESTA EL FALLO 1 DEL PAQUETE**: el metodo obtenerOCrearCarrito, que es la pieza central y el camino de todas las operaciones, nombra carritos.token_invitado nueve veces dentro de SQL. Y el INSERT de la 167 la nombra en la lista de columnas, o sea que falla al escribir | **Y TIENE UN MENSAJE DE STOCK QUE NO COINCIDE CON EL RESTO**: en la 246 compara estado_stock con 'sin stock' en minusculas, y lo hace con toLowerCase, que es lo correcto. El problema es que la columna solo se escribe una vez en todo el proyecto, con el literal 'Disponible', y nadie mas la escribe | **Y ES EL UNICO SERVICIO DEL PAQUETE QUE USA LA GUARDIA OPCIONAL**: recibe CredencialesCarrito, que es un token o un usuario, y decide con eso"],

    ["SRV_VentasService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/ventas/SRV_VentasService.ts, 564 lineas | METODOS: 10, de los cuales dos son las dos rutas y cuatro son de ayuda: unaFila, cargarPermisos, exigirPermisoVenta y exigirPermisoRegistrarVenta | **DOS TRANSACCIONES, en las lineas 235 y 513, y CERO FOR UPDATE.** O sea que bloquea la escritura pero no la fila: dos cajas que cobran la misma prenda a la vez pueden pasar las dos | **Y TIENE DOS METODOS DE PERMISO DISTINTOS**: exigirPermisoVenta para el checkout y exigirPermisoRegistrarVenta para la venta en caja. La sexta regla de permisos del proyecto, y la mas correcta, porque no reutiliza la primera sino que la separa para cada caso | **Y TIENE UNA VALIDACION CON CINCO MENSAJES DISTINTOS**: modalidad de entrega invalida, metodo de pago invalido, sucursal no disponible, carrito vacio, y dos mensajes de conflicto para el carrito ya procesado. Cinco reglas comprobadas en el mismo metodo"],

    ["SRV_PagosService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/pagos/SRV_PagosService.ts, 784 lineas, **EL FICHERO MAS LARGO DEL PAQUETE** | METODOS: 14, y tres de ellos hacen el trabajo de verdad: procesarPagoCaja, procesarResultado y simularPasarela | **DOS TRANSACCIONES, en las 276 y la 647, Y CUATRO FOR UPDATE. ES EL UNICO SITIO DEL PROYECTO QUE BLOQUEA FILAS.** El de la 650 es sobre ventas y el de la 672 es sobre inventario_stock, y ambos con FOR UPDATE. Eso significa que dos pagos del mismo producto no pueden solaparse | **EL STOCK DE ESTE PAQUETE SI ESTA BIEN HECHO, Y ES EL CONTRARIO EXACTO DEL PAQUETE 7.** En la 710 y en la 340 actualiza cantidad_vendida, que es OTRA columna, y en la 716 y en la 346 inserta el movimiento con la cantidad en NEGATIVO, de manera que el disparador resta el disponible UNA sola vez. En el paquete 7 los dos tocan la misma columna con la cantidad en positivo y el disponible sube dos veces | **Y ANTES DE COBRAR COMPRUEBA EL STOCK CON UN MENSAJE QUE DICE EL DISPONIBLE REAL**: El stock de este producto cambio. Disponible: N. No se puede completar la venta. Se lee con el numero dentro del texto, que es lo que un usuario necesita ver | **AQUI ESTA EL FALLO 3**: la 40 tiene el secreto de la firma con un valor de reserva escrito en el codigo, y la 497 es una pasarela simulada que es una ruta del propio servidor. Las dos firman con la misma funcion"],

    ["SRV_ComprobantesService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/comprobantes/SRV_ComprobantesService.ts, 358 lineas | METODOS: 13, de los cuales tres son las tres rutas: generar, consultarDeVenta y comprasDelCliente | **CERO TRANSACCIONES, Y AQUI SI ES UN PROBLEMA DE VERDAD**: generar inserta el comprobante con la 273, luego compone el PDF, luego lo escribe en disco con la 284 y luego actualiza la fila con la 287. Son cuatro pasos y ninguno esta en una transaccion: si el PDF falla, queda un comprobante con pdf_url a NULL | **Y EL TIPO DE COMPROBANTE SE DECIDE CON LOS DATOS, NO CON UN PARAMETRO**: en la 236 es FACTURA si hay NIT y razon social, y BOLETA si no. Y el NIT no viene de clientes, sino de una consulta a bitacora_auditoria en la 226, o sea que lo busca en la auditoria porque en la ficha del cliente no esta | **Y ES EL UNICO QUE GENERA UN FICHERO EN DISCO**: mkdirSync y writeFileSync sobre process.cwd(), y el pdf_url se guarda como texto. Si el numero de comprobante se repite, el fichero se pisa"],

    // ---------------- DEL PAQUETE 1: 3 ----------------

    ["dependencias.ts", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/dependencias.ts | LO USAN LOS 5 CONTROLADORES Y 1 SERVICIO, o sea 6 de los 15 componentes de este paquete | **Y DE AQUI SALE LA TERCERA REGLA DE PERMISOS DEL PROYECTO, QUE ES LA MAS ORIGINAL**: CredencialesCarrito. El resto de los controladores o exigen sesion o no, y este tiene un tercer estado, que es el de invitado. Por eso el carrito es el unico modulo que puede funcionar sin iniciar sesion | **Y LOS 5 CONTROLADORES LA IMPORTAN TODOS, PERO NO IGUAL**: cuatro la usan para JwtAuthGuard y UsuarioActual, y solo el del carrito la usa para CredencialesCarrito. Un mismo fichero, dos propositos"],

    ["CE_Modelos.ts (seguridad)", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/CE_Modelos.ts | LA USA 8 DE LOS 15 COMPONENTES DEL PAQUETE: los 4 controladores menos el del carrito, y los 4 servicios | Y SIEMPRE PARA LO MISMO: el tipo Usuario. **NINGUNO DE LOS 8 USA OTRA ENTIDAD**, ni Cliente, ni Producto, ni Venta. Todo el modelo de datos del paquete lo manejan SQL a mano"],

    ["SRV_BitacoraService", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/SRV_BitacoraService.ts | LA USAN LOS 4 SERVICIOS | **GUARDA LA TRAZA DE LOS CAMBIOS DE DINERO**: cada pago deja anotado el antes y el despues de la venta, con el estado Pendiente y luego Completada, y el numero de comprobante | **Y TAMBIEN ES LA QUE GUARDA EL NIT PARA LA FACTURA**, pero eso no es ella: es que el servicio de comprobantes lo busca en la tabla de auditoria. La bitacora de seguridad acaba sirviendo tambien de registro de datos fiscales"],

    // ---------------- DEL PAQUETE 9: 1 ----------------

    ["SRV_PreferenciasService", "Del Paquete 9",
    "CAPA: Del Paquete 9 | FICHERO: api/src/modulos/recomendaciones/SRV_PreferenciasService.ts | LO IMPORTA SRV_PagosService, y es EL CRUCE ENTRE EL PAQUETE 8 Y UN PAQUETE QUE NO SEA EL 1 | **Y EL CRUCE TIENE SENTIDO, Y ES EL MISMO QUE EN EL PAQUETE 7**: lo que se compro alimenta las recomendaciones. En los dos paquetes el que llama a la IA es el servicio de negocio, no el de recomendaciones, y por eso el paquete 9 parece tan aislado | **Y EL COMENTARIO DEL CODIGO DICE QUE NO DEBE BLOQUEAR EL PAGO**: la 762 lo dice con palabras, que es un pago ya cobrado y no se puede tirar abajo porque falle una recomendacion. Esta bien pensado"],

    // ---------------- EXTERNOS: 2 ----------------

    ["Pasarela de Pago (sandbox)", "Externos",
    "CAPA: Externos | **ESTE COMPONENTE NO EXISTE FUERA DEL PROYECTO, Y ESO ES EL PROBLEMA** | Lo que hay es la ruta POST pagos/sandbox/gateway y el metodo simularPasarela, en la 497 | **LA PANTALLA SandboxPago.tsx ELIGE EL RESULTADO DEL PAGO Y EL SERVIDOR LO FIRMA.** O sea que la pasarela es una funcion del mismo proceso que verifica la firma, con la misma clave y la misma funcion firmar | **Y EL SECRETO TIENE UN VALOR DE RESERVA EN EL CODIGO**: la 40, process.env.PAGO_WEBHOOK_SECRET, con el valor 'sandbox-secreto-cu35' si la variable no esta. O sea que si nadie configura esa variable, la firma se hace con una clave que esta escrita en el repositorio | **LO QUE SI ESTA BIEN HECHO ES LA COMPROBACION**: firmasCoinciden, en la 107, usa timingSafeEqual, que es la forma correcta de comparar y evita que el tiempo de respuesta diga cuanto coincide la firma. Eso esta a la altura"],

    ["PDFKit y node:fs", "Externos",
    "CAPA: Externos | SRV_ComprobantesService importa PDFDocument de pdfkit, y mkdirSync, writeFileSync y readFileSync de node:fs | **EL COMPROBANTE SE GENERA ENTERO Y SE ESCRIBE EN DISCO EN CADA PETICION**: GET ventas/id/pdf no devuelve un fichero guardado, compone el PDF, lo lee del disco y lo devuelve como StreamableFile | **Y ESO HACE QUE LA RUTA SEA MAS LENTA DE LO QUE PARECE, y que dependa de que el disco del servidor tenga permiso de escritura** | **Y HAY UN DETALLE DE COHERENCIA**: el pdf_url se guarda en la base de datos, pero no como ruta web, sino como ruta relativa en disco. O sea que es un dato que parece una URL y no lo es"],

    // ---------------- DATOS: 10 ----------------

    ["carritos", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **CINCO COLUMNAS: id_carrito, id_usuario, estado, id_sucursal y fecha_creacion** | **Y LE FALTA LA QUE EL CODIGO NECESITA**: token_invitado. Y no una columna cualquiera: es la que permite que el carrito sobreviva a que el visitante cierre sesion y vuelva | **NINE SENTENCIAS SQL LA NOMBRAN, Y LAS NUEVE ESTAN EN UN SOLO FICHERO.** Tres SELECT, la 105, la 150 y la 474, dos UPDATE, la 115 y la 484, un INSERT en la 167 que la mete en la lista de columnas, y tres mas en SELECT mas largos, la 463, la 492 y la 535 | **EL UNICO INSERT QUE LA IGNORA ES EL DE LA 127**, que es el del usuario que ya ha iniciado sesion y todavia no tiene carrito. O sea que ese camino es el unico que funciona | **Y EL ESTADO NO TIENE CHECK**: es VARCHAR(20) con DEFAULT 'Activo', el codigo filtra con LOWER(estado) = 'activo' en minusculas, y escribe 'En pago' y 'Convertido a venta'. Cuatro grafias para el mismo campo y ninguna declarada"],

    ["carrito_items", "Datos",
    "CAPA: Datos | FICHERO: la tabla | CUATRO COLUMNAS, y la cantidad y el precio_unitario tienen DEFAULT, de manera que un renglon sin precio vale 0 y no se ve | **GUARDA EL PRECIO CON QUE SE METIO LA PRENDA, no el de ahora.** Eso es lo correcto: si el precio sube mañana, el carrito que ya estaba formado no cambia | **Y LA CLAVE FORANEA A EL CARRITO ES CASCADE**, que es lo unico del paquete que declara una regla de borrado. Los demas pares del proyecto no la tienen | Y NO TIENE UNIQUE sobre id_ptc, de manera que la misma prenda puede aparecer dos veces en el mismo carrito, como en el paquete 7"],

    ["ventas", "Datos",
    "CAPA: Datos | FICHERO: la tabla | ONCE COLUMNAS, y es la tabla mas ancha del paquete | **GUARDA LAS CUATRO COSAS QUE UNA VENTA TIENE QUE PODER CONTESTAR**: quien compra, quien cobra, en que tienda y de que carrito vino, ademas de la modalidad, el metodo, los tres importes y el estado | **TIENE TRES CLAVES FORANEAS QUE NINGUNA ES OBLIGATORIA.** id_cliente, id_usuario, id_sucursal e id_carrito admiten NULL, de manera que se puede crear una venta sin cliente, sin usuario, sin tienda y sin carrito. El codigo pone el estado Pendiente al crearla y lo cambia a Completada al cobrar | **Y EL ESTADO TAMBIEN ESTA SIN CHECK**, con DEFAULT 'Completada', mientras que el codigo escribe 'Pendiente' al crear y 'Completada' al cobrar. Si la venta nace Completada y el pago falla, queda una venta cobrada que no se cobro"],

    ["venta_items", "Datos",
    "CAPA: Datos | FICHERO: la tabla | SEIS COLUMNAS, y a diferencia de carrito_items, aqui cantidad y precio_unitario NO tienen DEFAULT: son obligatorios | **ES LA COPIA CONGELADA DEL CARRITO**, y la palabra congelada es la importante: los tres valores, cantidad, precio y subtotal, se copian al crear la venta. Por eso el comprobante sale siempre bien, aunque el precio haya cambiado despues | **Y SU CLAVE FORANEA A LA VENTA ES CASCADE**, como en carrito_items. Las dos tablas de detalle del proyecto declaran la regla, y son las unicas dos"],

    ["transacciones_pago", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **DOCE COLUMNAS, Y LA MAS RICA DEL PAQUETE** | **GUARDA LO QUE NECESITA UNA PASARELA DE VERDAD**: el proveedor, el identificador de la transaccion en la pasarela, la referencia externa y el detalle del rechazo | **Y TIENE MONEDA FIJA A BOB, con DEFAULT 'BOB', y EL CODIGO NO ACEPTA OTRA.** Las dos monedas de la aplicacion son bolivianos, y no hay por donde cambiarlo | **EL ESTADO TIENE TRES VALORES EN EL CODIGO Y NINGUNO EN EL ESQUEMA**: Pendiente, que es el DEFAULT, Aprobado y Rechazado. Los tres se escriben con literales en cinco sitios distintos, y un estado mal escrito deja la venta en Pendiente para siempre"],

    ["comprobantes", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **OCHO COLUMNAS Y UN UNIQUE, Y ESO ES LO MAS VALIOSO DEL PAQUETE**: numero es UNIQUE, y es lo que impide que dos comprobantes tengan el mismo numero | **LA NUMERACION ES CORRELATIVA POR SUCURSAL Y POR ANIO**, y se calcula en la 79. O sea que cada tienda lleva su propia serie, que es como funciona de verdad una factura | **Y TIENE UNA COLUMNA PARA LOS DATOS FISCALES DEL CLIENTE, nit_cliente y razon_social, MAS LA FECHA**: los tres estan porque una factura boliviana los necesita, y el servicio los busca en la bitacora de auditoria y no en la ficha del cliente | **Y pdf_url ES TEXT, NO ES UNA URL WEB**: es una ruta en disco. El PDF se genera en cada peticion y la columna solo guarda donde esta el fichero"],

    ["devoluciones", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **OCHO COLUMNAS, Y CON EL ESTADO YA PUESTO POR DEFECTO: En tramite** | **Y CON ESTA NO HAY NADA.** Ni una linea en los 79 ficheros de modulos la nombra. Cero rutas, cero servicios, cero pantallas, y tampoco aparece en el controlador del punto de venta | **ADEMAS ESTA EL PROCEDIMIENTO sp_registrar_devolucion, Y TAMPOCO LO LLAMA NADIE.** Esta declarado en el esquema con sus seis parametros y su salida, y no hay ni una llamada en el proyecto | **ASI QUE LA MITAD DE ESTE PAQUETE NO EXISTE.** El nombre del paquete es Ventas, Pagos y Devoluciones, y las devoluciones son solo una tabla. **NI LA TABLA devolucion_items, QUE ESTA AL LADO, TIENE CODIGO**"],

    ["inventario_stock", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **SIETE COLUMNAS, DE LAS CUALES CUATRO SON CONTADORES**: cantidad_disponible, cantidad_reservada, cantidad_vendida y stock_minimo_alert, mas la id_stock, la id_ptc y la id_sucursal | **Y TIENE UN UNIQUE SOBRE id_ptc E id_sucursal, que es LA REGLA MAS VALIOSA DE TODA LA BASE DE DATOS**: una sola fila por prenda y por tienda. Sin eso, dos cajas que cobran la misma prenda tendrian dos filas y el stock seria la mitad de lo que parece | **ESTE PAQUETE LA ESCRIBE, Y LO HACE BIEN.** Tres escrituras: la 340 y la 710, que suman a cantidad_vendida, y la del paquete 7, que suma al disponible. Cada columna la toca un solo sitio | **Y LA TABLA LA ESCRIBE EL PAQUETE 6 CON UN UPDATE, el del stock minimo de alerta, que es un umbral y no un contador.** Cinco UPDATE en total en el proyecto, en tres ficheros de dos paquetes, y solo uno toca el disponible"],

    ["movimientos_inventario", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **Y SOBRE ELLA ESTA EL DISPARADOR trg_movimiento_inventario, que es QUIEN DE VERDAD MANIJA EL STOCK.** El disparador hace cantidad_disponible = cantidad_disponible + NEW.cantidad, y por eso en este paquete el INSERT lleva la cantidad en NEGATIVO: para restar una sola vez | **Y A PESAR DE ESO, LA ESCRIBEN TRES SERVICIOS DE TRES PAQUETES**: pagos, con tipo Venta, y reservas, con tipo SALIDA-RESERVA. El paquete 6 solo la lee | **Y AQUI ESTA LA DIFERENCIA ENTRE EL PAQUETE 7 Y EL 8, Y ES UN SIGNO.** En pagos la cantidad va en negativo y el UPDATE de al lado suma otra columna, de manera que el disponible baja una vez. En reservas la cantidad va en positivo y el UPDATE de al lado suma el disponible otra vez, de manera que sube dos. El patron es el mismo, el signo lo decide todo, y el del paquete 7 esta al reves"],

    ["PostgreSQL 16", "Datos",
    "CAPA: Datos | LAS NUEVE TABLAS PROPIAS SON carritos con 5 columnas, carrito_items con 4, ventas con 11, venta_items con 6, transacciones_pago con 12, comprobantes con 8, devoluciones con 8, inventario_stock con 7 y movimientos_inventario con la que tenga | **LO QUE SOSTIENE LAS REGLAS DEL PAQUETE SON TRES COSAS Y SOLO UNA ESTA DECLARADA.** El UNIQUE de comprobantes.numero, el UNIQUE de inventario_stock sobre id_ptc e id_sucursal, y los CHECK, que son CERO en las nueve tablas | **LOS ESTADOS LOS PONE EL CODIGO, EN CINCO SITOS, Y NINGUNO ESTA EN EL MOTOR.** Pendiente, Completada, En pago, Convertido a venta, Aprobado, Rechazado. Seis estados repartidos entre tres tablas, todos con literales | **Y LOS PROCEDIMIENTOS QUE EL PROYECTO SE ESCRIBIO A SI MISMO NO LOS USA NADIE**: sp_registrar_venta, sp_registrar_devolucion, fn_kardex_producto y fn_detectar_stock_bajo estan declarados y el codigo hace el INSERT a mano. El motor ofrece la transaccion y la aplicacion la rehace"]
];


// ================================================================
// LAS 62 INTERFACES   [origen, destino, nombre, tipo, estereotipo]
// ================================================================

var REL = [
    // ---- pantalla -> cliente HTTP: 5 ----
    ["CartContext.tsx", "api.ts", "las 4 rutas del carrito", "Assembly", "llama"],
    ["Checkout.tsx", "api.ts", "consultar, checkout y transaccion", "Assembly", "llama"],
    ["SandboxPago.tsx", "api.ts", "simularPasarela", "Assembly", "llama"],
    ["AdminCaja.tsx", "api.ts", "6 funciones de caja y comprobante", "Assembly", "llama"],
    ["MisCompras.tsx", "api.ts", "las 3 rutas del comprobante", "Assembly", "llama"],

    // ---- cliente -> control: 5 ----
    ["api.ts", "CTR_Carrito", "HTTP/JSON, 4 rutas", "Assembly", "expone"],
    ["api.ts", "CTR_Ventas", "HTTP/JSON, 2 rutas", "Assembly", "expone"],
    ["api.ts", "Ctr_Pos", "HTTP/JSON, 2 rutas", "Assembly", "expone"],
    ["api.ts", "CTR_Pagos", "HTTP/JSON, 5 rutas", "Assembly", "expone"],
    ["api.ts", "CTR_Comprobantes", "HTTP/JSON, 3 rutas", "Assembly", "expone"],

    // ---- importaciones de codigo: 20 ----
    ["CTR_Carrito", "dependencias.ts", "CredencialesCarrito", "Dependency", "importa"],
    ["CTR_Ventas", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["Ctr_Pos", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_Pagos", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_Comprobantes", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_Ventas", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["Ctr_Pos", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["CTR_Pagos", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["CTR_Comprobantes", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["SRV_CarritoService", "dependencias.ts", "CredencialesCarrito", "Dependency", "importa"],
    ["SRV_CarritoService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["SRV_CarritoService", "SRV_BitacoraService", "registrar, cambios del carrito", "Dependency", "importa"],
    ["SRV_VentasService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["SRV_VentasService", "SRV_BitacoraService", "registrar, ventas y pagos", "Dependency", "importa"],
    ["SRV_PagosService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["SRV_PagosService", "SRV_BitacoraService", "registrar, con el antes y el despues", "Dependency", "importa"],
    ["SRV_PagosService", "SRV_ComprobantesService", "generar, 5 llamadas", "Dependency", "delega"],
    ["SRV_PagosService", "SRV_PreferenciasService", "lo comprado pasa a preferencia", "Dependency", "delega"],
    ["SRV_ComprobantesService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["SRV_ComprobantesService", "SRV_BitacoraService", "registrar, emision del comprobante", "Dependency", "importa"],

    // ---- control -> logica: 5 ----
    ["CTR_Carrito", "SRV_CarritoService", "4 metodos para 4 rutas", "Dependency", "delega"],
    ["CTR_Ventas", "SRV_VentasService", "2 metodos para 2 rutas", "Dependency", "delega"],
    ["Ctr_Pos", "SRV_VentasService", "2 busquedas, sin logica propia", "Dependency", "delega"],
    ["CTR_Pagos", "SRV_PagosService", "5 metodos para 5 rutas", "Dependency", "delega"],
    ["CTR_Comprobantes", "SRV_ComprobantesService", "3 metodos para 3 rutas", "Dependency", "delega"],

    // ---- hacia los externos: 2 ----
    ["SRV_PagosService", "Pasarela de Pago (sandbox)", "crearHmac, y firma con la misma clave", "Assembly", "simula"],
    ["SRV_ComprobantesService", "PDFKit y node:fs", "componer y escribir el PDF", "Assembly", "consulta"],

    // ---- hacia las tablas: 12 ----
    ["SRV_CarritoService", "carritos", "9 sentencias, y una columna que no existe", "Assembly", "rompe"],
    ["SRV_CarritoService", "carrito_items", "las 4 escrituras del carrito", "Assembly", "escribe"],
    ["SRV_VentasService", "ventas", "2 INSERT y 1 UPDATE de estado", "Assembly", "escribe"],
    ["SRV_VentasService", "venta_items", "la copia congelada", "Assembly", "escribe"],
    ["SRV_VentasService", "carritos", "UPDATE a 'En pago'", "Assembly", "escribe"],
    ["SRV_PagosService", "transacciones_pago", "3 estados y 2 rechazos distintos", "Assembly", "escribe"],
    ["SRV_PagosService", "ventas", "UPDATE a 'Completada', 2 veces", "Assembly", "escribe"],
    ["SRV_PagosService", "inventario_stock", "UPDATE a cantidad_vendida, bien", "Assembly", "escribe"],
    ["SRV_PagosService", "movimientos_inventario", "cantidad en NEGATIVO, resta una vez", "Assembly", "escribe"],
    ["SRV_PagosService", "carritos", "UPDATE a 'Convertido a venta'", "Assembly", "escribe"],
    ["SRV_ComprobantesService", "comprobantes", "INSERT, PDF y UPDATE, sin transaccion", "Assembly", "escribe"],
    ["SRV_ComprobantesService", "ventas", "datos de la venta y estado de pago", "Assembly", "consulta"],

    // ---- hacia PostgreSQL 16: 14 ----
    ["SRV_CarritoService", "PostgreSQL 16", "0 transacciones, 649 lineas", "Assembly", "consulta"],
    ["SRV_VentasService", "PostgreSQL 16", "2 transacciones, 0 FOR UPDATE", "Assembly", "consulta"],
    ["SRV_PagosService", "PostgreSQL 16", "2 transacciones y 4 FOR UPDATE", "Assembly", "consulta"],
    ["SRV_ComprobantesService", "PostgreSQL 16", "0 transacciones, escribe en disco", "Assembly", "consulta"],
    ["carritos", "PostgreSQL 16", "5 columnas, falta token_invitado", "Assembly", "apunta"],
    ["carrito_items", "PostgreSQL 16", "CASCADE, la unica con regla de borrado", "Assembly", "apunta"],
    ["ventas", "PostgreSQL 16", "11 columnas y 4 claves opcionales", "Assembly", "apunta"],
    ["venta_items", "PostgreSQL 16", "CASCADE, y sin DEFAULT", "Assembly", "apunta"],
    ["transacciones_pago", "PostgreSQL 16", "12 columnas, 3 estados sin CHECK", "Assembly", "apunta"],
    ["comprobantes", "PostgreSQL 16", "UNIQUE en numero, la regla que si esta", "Assembly", "apunta"],
    ["devoluciones", "PostgreSQL 16", "8 columnas y CERO codigo", "Assembly", "apunta"],
    ["inventario_stock", "PostgreSQL 16", "UNIQUE en id_ptc e id_sucursal", "Assembly", "apunta"],
    ["movimientos_inventario", "PostgreSQL 16", "el disparador suma aqui", "Assembly", "apunta"]
];


// ================================================================
// DONDE CAE CADA COMPONENTE   [nombre, izquierda, arriba, ancho, alto]
// ================================================================

var DOND = [
    ["CartContext.tsx", 55, 100, 230, 85],
    ["Checkout.tsx", 300, 100, 230, 85],
    ["SandboxPago.tsx", 545, 100, 230, 85],
    ["AdminCaja.tsx", 55, 200, 230, 85],
    ["MisCompras.tsx", 300, 200, 230, 85],
    ["api.ts", 545, 200, 230, 85],

    ["CTR_Carrito", 55, 450, 230, 85],
    ["CTR_Ventas", 300, 450, 230, 85],
    ["Ctr_Pos", 545, 450, 230, 85],
    ["CTR_Pagos", 55, 550, 230, 85],
    ["CTR_Comprobantes", 300, 550, 230, 85],

    ["SRV_CarritoService", 55, 780, 350, 90],
    ["SRV_VentasService", 435, 780, 350, 90],
    ["SRV_PagosService", 55, 880, 350, 90],
    ["SRV_ComprobantesService", 435, 880, 350, 90],

    ["dependencias.ts", 905, 100, 250, 70],
    ["CE_Modelos.ts (seguridad)", 905, 180, 250, 70],
    ["SRV_BitacoraService", 905, 260, 250, 70],

    ["SRV_PreferenciasService", 905, 420, 250, 80],

    ["Pasarela de Pago (sandbox)", 905, 590, 250, 75],
    ["PDFKit y node:fs", 905, 675, 250, 75],

    ["carritos", 1255, 100, 280, 85],
    ["carrito_items", 1255, 195, 280, 85],
    ["ventas", 1255, 290, 280, 85],
    ["venta_items", 1255, 385, 280, 85],
    ["transacciones_pago", 1255, 480, 280, 85],
    ["comprobantes", 1255, 575, 280, 85],
    ["devoluciones", 1255, 670, 280, 85],
    ["inventario_stock", 1255, 765, 280, 85],
    ["movimientos_inventario", 1255, 860, 280, 85],
    ["PostgreSQL 16", 1255, 955, 280, 85]
];


function aviso(txt) {
    try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup(txt, 0, "Paquete 8 - Ventas y Pagos", 64);
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
    N.push("ARQUITECTURA DEL PAQUETE 8 - INFORME DE EJECUCION");
    N.push("Paquete 8: Ventas y Pagos. Casos CU28 a CU31.");
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
    N.push("  deben ser 39 objetos con tamano: 31 componentes + 8 marcos.");
    N.push("");
    N.push("EL REPARTO DE LOS 31 COMPONENTES");
    N.push("  Presentacion        6   4 pantallas, un contexto de React y el cliente HTTP");
    N.push("  Control             5   cuatro modulos y un quinto controlador");
    N.push("  Logica de Negocio  4   uno por cada modulo de NestJS");
    N.push("  Del Paquete 1       3   las guardas, las entidades y la bitacora");
    N.push("  Del Paquete 9       1   el servicio de preferencias, de la IA");
    N.push("  Externos            2   la pasarela simulada y la generacion del PDF");
    N.push("  Datos              10   9 tablas, el stock y el motor");
    N.push("");
    N.push("EL REPARTO DE LAS 62 INTERFACES");
    N.push("  pantalla -> cliente HTTP       5   una por pantalla o contexto");
    N.push("  cliente -> control             5   las 16 rutas, en cinco bloques");
    N.push("  importaciones de codigo       20   los statements import, 2 de ellos de servicio a servicio");
    N.push("  hacia los externos             2   la pasarela y el PDF");
    N.push("  hacia las tablas              12   las que escriben y las que leen");
    N.push("  hacia PostgreSQL 16           13   4 servicios y 9 tablas");
    N.push("");
    N.push("FALLO 1: carritos.token_invitado NO EXISTE, Y LA USA 9 SENTENCIAS SQL");
    N.push("");
    N.push("  La tabla carritos tiene 5 COLUMNAS: id_carrito, id_usuario,");
    N.push("  estado, id_sucursal y fecha_creacion.  Y ninguna es esa.");
    N.push("");
    N.push("  EL CODIGO LA USA 25 VECES, LAS 25 EN UN SOLO FICHERO, Y NUEVE DE");
    N.push("  ESAS SON SENTENCIAS SQL:");
    N.push("");
    N.push("    L105  WHERE c.token_invitado = $1 AND LOWER(c.estado) = 'activo'");
    N.push("    L115  SET id_usuario = $1, token_invitado = NULL");
    N.push("    L150  WHERE c.token_invitado = $1 AND LOWER(c.estado) = 'activo'");
    N.push("    L167  INSERT INTO carritos (token_invitado, estado, id_sucursal, fecha_creacion)");
    N.push("    L463  SELECT c.id_carrito, c.id_sucursal, c.token_invitado");
    N.push("    L474  SELECT c.id_carrito, c.id_sucursal, c.token_invitado");
    N.push("    L484  UPDATE carritos SET id_usuario = $1, token_invitado = NULL");
    N.push("    L492  SELECT c.id_carrito, c.id_sucursal, c.token_invitado");
    N.push("    L535  WHERE ci.id_carrito_item = $1 AND c.token_invitado = $2");
    N.push("");
    N.push("  Y AQUI ESTA LO IMPORTANTE: el SELECT de la 463 y el de la 492 estan");
    N.push("  en obtenerOCrearCarrito, que es el metodo por el que pasan TODAS las");
    N.push("  operaciones del carrito.  Consultar, agregar, cambiar cantidad y");
    N.push("  quitar llaman antes a ese metodo.");
    N.push("");
    N.push("  O SEA QUE NO SE ROMPE EL CARRITO DE INVITADO: SE ROMPE EL CARRITO");
    N.push("  ENTERO.  Y ESO INCLUYE EL CAMINO DE UN USUARIO QUE YA HA INICIADO");
    N.push("  SESION, PORQUE LA 115 Y LA 484 SON UPDATEs QUE LA NOMBRAN TAMBIEN.");
    N.push("");
    N.push("  EL UNICO INSERT QUE LA IGNORA ES EL DE LA 127, que es el del usuario");
    N.push("  que todavia no tiene carrito.  O sea que el primer carrito de un");
    N.push("  cliente se crea bien y el segundo ya no.");
    N.push("");
    N.push("FALLO 2: LAS DEVOLUCIONES NO EXISTEN COMO CODIGO");
    N.push("");
    N.push("  El esquema tiene DOS TABLAS, devoluciones con 8 columnas y");
    N.push("  devolucion_items, y el PROCEDIMIENTO sp_registrar_devolucion, con");
    N.push("  sus seis parametros y su salida.");
    N.push("");
    N.push("  Y EN LOS 79 FICHEROS DE modulos NO HAY NI UNA LINEA QUE LAS");
    N.push("  NOMBRE.  Cero rutas, cero servicios, cero pantallas, y tampoco");
    N.push("  aparece en el controlador del punto de venta.");
    N.push("");
    N.push("  LAS DEVOLUCIONES QUEDAN FUERA DEL ALCANCE DE ESTE PAQUETE, PERO EL");
    N.push("  ESQUEMA LAS MANTIENE, Y POR ESO EL COMPONENTE devoluciones ESTA");
    N.push("  DIBUJADO CON LA NOTA DE QUE NO HAY NADA DETRAS.  Son alcance futuro,");
    N.push("  NO UN CASO DE USO DEL SEGUNDO CICLO.");
    N.push("");
    N.push("FALLO 3: LA PASARELA Y EL VERIFICADOR SON LO MISMO, CON LA MISMA CLAVE");
    N.push("");
    N.push("  L40   const FIRMA_SECRETO = process.env.PAGO_WEBHOOK_SECRET");
    N.push("                                     ?? 'sandbox-secreto-cu35';");
    N.push("");
    N.push("  El secreto tiene un VALOR DE RESERVA ESCRITO EN EL CODIGO.  Si la");
    N.push("  variable de entorno no esta puesta, la firma se hace con una clave");
    N.push("  que esta en el repositorio.");
    N.push("");
    N.push("  Y LA PASARELA ES UNA RUTA DEL PROPRIO SERVIDOR: POST");
    N.push("  pagos/sandbox/gateway, el metodo simularPasarela en la 497, que");
    N.push("  firma la notificacion en la 542 con la misma funcion firmar.");
    N.push("");
    N.push("  O SEA QUE EL UNICO QUE PUEDE CAMBIAR UN PAGO DE Pendiente A");
    N.push("  Aprobado ES EL PROPIO VENDEDOR, DESDE SU PROPIO NAVEGADOR, Y LA");
    N.push("  FIRMA NO PRUEBA NADA.  SandboxPago.tsx, de 238 lineas, es la");
    N.push("  pantalla que elige el resultado del pago.");
    N.push("");
    N.push("  LO QUE SI ESTA BIEN, Y SON DOS COSAS CONCRETAS:");
    N.push("");
    N.push("    firmasCoinciden, en la 107, USA timingSafeEqual.  Es la forma");
    N.push("    correcta de comparar y evita que el tiempo de respuesta diga");
    N.push("    cuanto coincide la firma.  Eso esta a la altura.");
    N.push("");
    N.push("    Y LA RUTA DEL WEBHOOK ES LA UNICA SIN GUARDIA, EN LA 142.  Las");
    N.push("    otras cuatro de este controlador llevan JwtAuthGuard en la ruta,");
    N.push("    no en la clase.  Y no es un descuido: una pasarela de verdad no");
    N.push("    puede mandar un JWT.  Es la excepcion bien puesta del paquete.");
    N.push("");
    N.push("LO QUE ESTA BIEN Y ES EL HALLAZGO MAS VALIOSO: EL STOCK DE ESTE");
    N.push("PAQUETE NO TIENE EL ERROR DEL PAQUETE 7.  ES EL MISMO PATRON AL REVES.");
    N.push("");
    N.push("  EN PAGOS, la 340 y la 710:");
    N.push("      UPDATE inventario_stock SET cantidad_vendida = cantidad_vendida + $2");
    N.push("      INSERT INTO movimientos_inventario VALUES (..., 'Venta', -cantidad, ...)");
    N.push("");
    N.push("  El UPDATE toca CANTIDAD_VENDIDA, que es otra columna, y el");
    N.push("  movimiento lleva la cantidad EN NEGATIVO, de manera que el");
    N.push("  disparador resta el disponible UNA sola vez.  Cada columna, una vez.");
    N.push("");
    N.push("  EN RESERVAS, la 703 y la 708:");
    N.push("      INSERT INTO movimientos_inventario VALUES (..., 'SALIDA-RESERVA', cantidad, ...)");
    N.push("      UPDATE inventario_stock SET cantidad_disponible = cantidad_disponible + cantidad");
    N.push("");
    N.push("  Los dos tocan CANTIDAD_DISPONIBLE, y la cantidad va en POSITIVO, de");
    N.push("  manera que el disponible sube DOS veces.  El patron es el mismo y el");
    N.push("  SIGNO LO DECIDE TODO.  El de aqui esta bien y el de alla esta al reves.");
    N.push("");
    N.push("Y EL BLOQUEO DE FILAS, QUE NO HACE NINGUN OTRO PAQUETE");
    N.push("");
    N.push("  SRV_PagosService es el UNICO sitio del proyecto con FOR UPDATE, y");
    N.push("  tiene cuatro.  El de la 650 es sobre ventas y el de la 672 es sobre");
    N.push("  inventario_stock.  Con eso dos cajas no pueden cobrar la misma");
    N.push("  prenda a la vez, porque la segunda espera a que la primera solt el");
    N.push("  bloqueo.");
    N.push("");
    N.push("  Y EL UNIQUE DE inventario_stock, sobre id_ptc e id_sucursal, es LA");
    N.push("  REGLA MAS VALIOSA DE TODA LA BASE DE DATOS: una sola fila por");
    N.push("  prenda y por tienda.  Sin eso, dos cajas que cobran la misma prenda");
    N.push("  tendrian dos filas y el stock seria la mitad de lo que parece.");
    N.push("");
    N.push("LO QUE ESTA BIEN Y ADEMAS ES UNA BUENA IDEA: EL TIPO DE COMPROBANTE");
    N.push("SE DECIDE CON LOS DATOS, Y EL NIT SE BUSCA EN LA AUDITORIA");
    N.push("");
    N.push("  En la 236, el tipo es FACTURA si hay NIT y razon social, y BOLETA si");
    N.push("  no.  No es un parametro: se deduce de los datos que hay.");
    N.push("");
    N.push("  Y EL NIT NO SALE DE LA FICHA DEL CLIENTE, SALE DE bitacora_auditoria, en");
    N.push("  la 226.  O sea que la bitacora de seguridad acaba sirviendo tambien");
    N.push("  de registro de datos fiscales.  Es un rodeo que funciona, y que");
    N.push("  es de las cosas mas arguibles del proyecto.");
    N.push("");
    N.push("LO QUE NO ESTA BIEN, Y TAMBIEN SE VE");
    N.push("");
    N.push("  LAS CUATRO GRAFÍAS DE estado_stock, EN TRES PAQUETES.  La columna");
    N.push("  tiene UNA sola escritura en todo el proyecto, con el literal");
    N.push("  'Disponible'.  Y la leen 14 lineas de 4 ficheros, con 4 grafias:")
    N.push("  'sin stock' en el carrito (L246, con toLowerCase, que es lo");
    N.push("  correcto), 'Sin stock' en ventas (L315, sin toLowerCase), y las");
    N.push("  dos del paquete 7.  Y EL CATALOGO NO LO MIRA: usa");
    N.push("  cantidad_disponible.  O sea que la columna esta a medio usar.");
    N.push("");
    N.push("  CERO CHECK EN LAS NUEVE TABLAS DEL PAQUETE.  Los seis estados");
    N.push("  -- Pendiente, Completada, En pago, Convertido a venta, Aprobado y");
    N.push("  Rechazado -- estan escritos con literales en cinco sitios, y ninguno")
    N.push("  esta declarado.  Y con el DEFAULT de ventas siendo 'Completada',")
    N.push("  una venta nace cobrada y el pago puede fallar.");
    N.push("");
    N.push("  generate() NO ESTA EN UNA TRANSACCION, Y TIENE CUATRO PASOS.  Inserta");
    N.push("  el comprobante en la 273, compone el PDF, lo escribe en disco en la");
    N.push("  284 y actualiza la fila en la 287.  Si el PDF falla, queda un")
    N.push("  comprobante con pdf_url a NULL y sin fichero que lo respalde.");
    N.push("");
    N.push("  SRV_VentasService TIENE 2 TRANSACCIONES Y 0 FOR UPDATE.  Bloquea la");
    N.push("  escritura pero no la fila, de manera que dos checkouts del mismo")
    N.push("  producto pueden solaparse.  Es el unico servicio con transacciones")
    N.push("  del paquete y el unico que no bloquea.");
    N.push("");
    N.push("  CTR_Comprobantes ES @Controller('ventas'), ASI QUE SUS TRES RUTAS");
    N.push("  CUELGAN DEL PREFIJO DE VENTAS Y VIVEN EN OTRO MODULO.  Y Ctr_Pos.ts")
    N.push("  ROMPE LA CONVENCION DE NOMBRES POR LOS DOS LADOS: el fichero es")
    N.push("  Ctr_Pos.ts, con C mayuscula y punto, y la clase es PosController,")
    N.push("  cuando todo lo demas es el nombre del fichero con SRV o CTR.");
    N.push("");
    N.push("  EL PROYECTO SE ESCRIBIO A SI MISMO UNOS PROCEDIMIENTOS Y NO LOS USA.");
    N.push("  sp_registrar_venta, sp_registrar_devolucion, fn_kardex_producto y");
    N.push("  fn_detectar_stock_bajo estan declarados en el esquema, y no hay ni")
    N.push("  una llamada.  El motor ofrece la transaccion y la aplicacion la")
    N.push("  rehace a mano, y por ahi es por donde se cuelan los errores.");
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
    U.push("PAQUETE 8 - Ventas y Pagos");
    U.push("CU28 a CU31   ·   4 modulos + 1 controlador extra   ·   16 rutas");
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
    U.push("  con tamano: " + conTam + "   (deben ser 39)");
    U.push("  lineas:     " + nLin);
    U.push("");
    U.push("FALLO 1: carritos.token_invitado no existe y la usan 9");
    U.push("  sentencias SQL. El carrito entero esta roto, no solo el");
    U.push("  de invitado.");
    U.push("");
    U.push("FALLO 2: las devoluciones no tienen codigo. Tabla y");
    U.push("  procedimiento si, y cero lineas que los usen.");
    U.push("");
    U.push("FALLO 3: la pasarela y el verificador de firmas son el");
    U.push("  mismo proceso, con la misma clave y un valor de reserva");
    U.push("  escrito en el codigo.");
    U.push("");
    U.push("LO BUENO: el stock de este paquete NO repite el error");
    U.push("  del paquete 7. UPDATE a cantidad_vendida y movimiento en");
    U.push("  NEGATIVO. Y es el unico sitio del proyecto con FOR UPDATE.");
    U.push("");
    if (conTam < 39) U.push("AVISO: menos de 39 con tamano. Copia este texto y pegamelo.");
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
