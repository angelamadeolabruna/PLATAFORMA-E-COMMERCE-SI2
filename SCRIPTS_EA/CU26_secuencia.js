// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU26  Realizar Compra Digital (Web y Móvil)
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/Checkout.tsx                   574 lineas
//     web/src/pages/SandboxPago.tsx                 238 lineas
//     web/src/lib/api.ts                           L1828-1843
//     web/src/data/clienteMenu.ts                  L59, CU38
//     api/src/modulos/seguridad/dependencias.ts
//     api/src/modulos/ventas/CTR_Ventas.ts
//     api/src/modulos/ventas/SRV_VentasService.ts  564 lineas
//     api/src/modulos/pagos/CTR_Pagos.ts           156 lineas
//     api/src/modulos/pagos/SRV_PagosService.ts    784 lineas
//     api/src/modulos/seguridad/SRV_BitacoraService.ts
//     BASE DE DATOS/schema.sql   L384-405, L440-453, L564
//
// QUE HACE ESTE CASO
//   Tres endpoints, en tres ficheros distintos, y es el caso mas
//   grande de la serie:
//
//     1  Crear la venta                   POST /ventas/checkout
//     2  Crear la transaccion de pago     POST /pagos/transacciones
//     3  Simular la respuesta del banco   POST /pagos/simular
//     4  Recibir el webhook firmado       POST /pagos/webhook
//
//   Y TIENE UN HALLAZGO DE SEGURIDAD QUE ES EL MAS GRAVE DE TODOS
//   LOS VEINTE CASOS HASTA AHORA:
//
//     El secreto con el que se firma la notificacion del banco esta
//     escrito en el codigo, como valor por defecto. L40:
//
//       const FIRMA_SECRETO =
//         process.env.PAGO_WEBHOOK_SECRET ?? 'sandbox-secreto-cu35';
//
//     Y procesarWebhook NO pide sesion: solo comprueba la firma.
//
//   52 mensajes. 10 lineas de vida. 8 hallazgos.
//   2 fragmentos: dos loop y ningun alt. Explicado mas abajo.
//
// LOS FRAGMENTOS: DOS loop Y NINGUN alt
//   Contado ANTES de dibujar, con contadores, por separado en los dos
//   servicios que participan:
//
//     SRV_VentasService.ts, 564 lineas
//       for 5   while 0   Promise.all 0
//       if 30   throw 24   ternarios 0
//       dataSource.query 10   em.query 5   transaction 2   try 0   catch 0
//
//     SRV_PagosService.ts, 784 lineas
//       for 6   while 0   Promise.all 0   continue 2
//       if 40   throw 29   ternarios 67   map 0
//       dataSource.query 13   em.query 15   transaction 2   try 1   catch 1
//
//   Y DE LOS 11 for ENTRE LOS DOS FICHEROS, SOLO 2 SON DE ESTE CASO:
//
//     L193  crearCompraDigital, un bucle por item del carrito
//     L250  crearCompraDigital, un bucle por linea, con el INSERT
//
//   Los otros nueve son de otros casos: L296, L309 y L336 de
//   procesarPagoCaja, que es CU37; L432 y L454 de buscarProductosPos,
//   que es CU36; L528 de crearVentaPresencial, que es CU36; y L667,
//   L680 y L706 de procesarResultado, que es el camino del webhook,
//   que es CU35. Y se cuentan aparte, porque son otros casos de uso.
//
//   OJO CON UNO: L528, de crearVentaPresencial, esta dentro de la
//   misma transaction que el L250 de este caso, pero es OTRO caso de
//   uso. El que cuenta es el L250, que es el de la compra digital.
//
//   NO HAY NINGUN alt. Y aqui hay que ser concreto, porque hay 70 if
//   entre los dos servicios: en el camino de este caso hay doce y los
//   doce son guardas. La modalidad, el metodo, el id del carrito, la
//   pertenencia del carrito, el estado del carrito, el metodo de pago,
//   el proveedor, el id de la venta, la pertenencia de la venta, el
//   estado PENDIENTE, y el estado de la transaccion.
//
//   Y las 3 barras de activacion: la del controlador de ventas, la
//   del servicio de ventas, y la del servicio de pagos. Esta vez si
//   hay barra en la base de datos, porque crearCompraDigital abre una
//   transaccion en L235.
//
// LA Y EN NEGATIVO, QUE ES LO QUE HACE FALLAR ESTOS DIAGRAMAS
//   EA guarda Top y Bottom en NEGATIVO, porque trabaja en coordenadas
//   cartesianas con la Y creciendo hacia arriba. Si se le pasa la Y en
//   positivo no da error: simplemente no coloca nada, y todos los
//   objetos se quedan en el mismo punto. El diagrama sale amontonado.
//
//   Por eso en las dos funciones de colocacion de este script:
//
//     o.Top    = 0 - y;
//     o.Bottom = 0 - y - alto;
//
//   Y en el AddNew, en cambio, la Y va en POSITIVO, porque ahi EA ya la
//   convierte por su cuenta.
//
// SIN NINGUNA LLAMADA A SQL
//   Todo se coloca con el modelo de objetos. Nada de ExecuteSQL, Execute
//   ni SQLQuery.
//
// Autorreparable. Una instruccion por linea. Sin continuaciones con +.
// Sin operadores ternarios. Ninguna excepcion escapa.
// ================================================================

var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var TOTAL_CAB = 10;
var TOTAL_MSG = 52;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU26 Secuencia Compra Digital";
var DIAG_NOMBRE = "CU26 Compra Digital";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 150;

var X_NOTA = 2675;
var ANCHO_NOTA = 700;
var Y_NOTA0 = 250;
var ALTO_LINEA_NOTA = 10;
var ALTO_MIN_NOTA = 130;
var SEPARACION_NOTA = 26;

var ANCHO_ACTIVACION = 14;
var PLAN = [];
var ERRORES = [];
var INFORME = [];
var MARCOS_PUESTOS = 0;
var BARRAS_PUESTAS = 0;

// ---------------------------------------------------------------
// LOS DATOS
// ---------------------------------------------------------------

var CAB = [
    ["U", "ACTOR_Cliente", "Actor", "Lifeline", "Cliente", "quien compra", "Actor, no clase: es quien paga", "no es codigo, es la persona. Y segun el seed NO puede usar este caso: hallazgo 4"],
    ["K", "Checkout.tsx", "Object", "Lifeline", "Checkout", "574 lineas, 3 pasos", "Boundary", "web/src/pages/Checkout.tsx, 574 lineas, y el paso 1, 2 y 3 de L204. L196 manda a la pantalla del sandbox"],
    ["X", "SandboxPago.tsx", "Object", "Lifeline", "SandboxPago", "238 lineas, el banco falso", "Boundary", "web/src/pages/SandboxPago.tsx, 238 lineas. Es la pantalla a la que lleva el checkout_url de L200: la pasarela de pago DEL PROPIO PROYECTO"],
    ["H", "api.ts", "Object", "Lifeline", "api", "seccion CU34", "Boundary", "web/src/lib/api.ts, L1828-1843 el checkout, y L1939 la transaccion de pago"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "en 3 de los 4", "Control", "api/src/modulos/seguridad/dependencias.ts. Y el CUARTO, el del webhook, NO lo lleva: es el unico endpoint sin sesion"],
    ["V", "CTR_Ventas", "Object", "Lifeline", "VentasController", "el checkout", "Control", "api/src/modulos/ventas/CTR_Ventas.ts, y el DTO CheckoutDTO con modalidad, metodo_pago, nit y razon_social"],
    ["S", "SRV_VentasService", "Object", "Lifeline", "VentasService", "564 lineas, 1 tx, 2 bucles", "Control", "api/src/modulos/ventas/SRV_VentasService.ts, L110-304 crearCompraDigital, con su transaction en L235"],
    ["P", "SRV_PagosService", "Object", "Lifeline", "PagosService", "784 lineas, 1 tx, 0 bucles", "Control", "api/src/modulos/pagos/SRV_PagosService.ts, L114-205 crearTransaccion, L480-495 procesarWebhook, L497-546 simularPasarela, L548+ procesarResultado"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar(), 3 veces", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "3 tablas, 1 indice", "Entity", "schema.sql L384-397 ventas con 12 columnas; L399-406 venta_items con 6; L440-453 transacciones_pago con 12; y UN solo indice, L564, sobre ventas"]
];

var MSG = [
    [1, "U", "K", "1. entra al checkout   Checkout.tsx, 574 lineas, que es la pantalla mas grande de la compra   Y tiene TRES PASOS, L74 y L204: el carrito, la modalidad y el metodo, y el pago.   O sea que el caso del documento, que dice Web y Movil, aqui es un formulario de tres pasos con barra de progreso", "S"],
    [2, "K", "K", "2. y el paso 1 consulta el carrito, L159: await api.consultarCarrito()   Y actualiza el estado local, L163, con un refresco.   O sea que el paso 1 no es el carrito de CU25: es una lectura", "S"],
    [3, "K", "H", "3. y en el paso 2 elige la modalidad, L75: 'Retiro' o 'Entrega'. Y el metodo, L76: 'Tarjeta', 'QR' o 'Transferencia'. Y el proveedor, L86: LIBELULA, STRIPE o PAYPAL.   Y si es entrega, el NIT, L79, y la razon social, L80", "S"],
    [4, "H", "V", "4. POST /api/v1/ventas/checkout   api.ts L1837, seccion CU34 - Realizar Compra Digital, L1828   Y el cuerpo, L1830-1835: id_carrito, id_sucursal, modalidad, metodo_pago, nit_cliente y razon_social.   O sea que el metodo de pago se elige AQUI y no en el paso 3", "S"],
    [5, "H", "G", "5. con Authorization Bearer   Y el guard es el JwtAuthGuard de siempre.   Este es el unico caso donde el cliente tiene que traer la sesion, y por eso es el que falla con el hallazgo 4", "S"],
    [6, "G", "V", "6. CheckoutDTO: modalidad, metodo_pago, nit_cliente y razon_social, con sus validadores.   Y el id_sucursal es opcional: si no viene, la modalidad Retiro lo deduce", "S"],
    [7, "V", "S", "7. crearCompraDigital( usuario, dto, request ), SRV_VentasService L110, y empieza por exigirPermisoVenta, L115, y clienteDe, L116", "S"],
    [8, "S", "S", "8. y aqui esta el HALLAZGO 4: exigirPermisoVenta, L70-75, comprueba realizar_venta, L72, y el rol Cliente del seed, schema.sql L577, tiene comprar.   O sea que el CUARTO caso con el mismo bug, y el mensaje, L73, es 'No tienes permisos para comprar.', que es el texto correcto otra vez", "S"],
    [9, "S", "S", "9. y los cuatro guardas de entrada, y son una lista blanca de verdad: [modalidad no esta en MODALIDADES] 422, L119-121.   [metodo no esta en METODOS_PAGO] 422, L123-125.   [id_carrito no entero o <= 0] 404, L130-132.   Y el NIT y la razon social, L126-127, con el trim y el null, que es el cuidado de los datos de texto", "S"],
    [10, "S", "Q", "10. SELECT c.id_carrito, c.id_sucursal, c.estado, c.id_usuario FROM carritos c WHERE c.id_carrito = $1 LIMIT 1, L138-141   Consulta 1   Y OJO: es un WHERE por id_carrito, la clave primaria, y eso si tiene indice.   Pero en CU25 se buscaba por id_usuario, y esa columna no tiene indice ninguno", "S"],
    [11, "S", "S", "11. y los dos guardas de pertenencia y de estado: [el carrito no es suyo] 404 'Carrito no encontrado.', L145.   Y el estado, que tiene que ser Activo, porque si esta 'En pago' o 'Convertido a venta' el carrito ya se uso.   O sea que el estado del carrito, que CU25 vio que es un VARCHAR(20) sin CHECK, aqui es lo que decide si se puede comprar", "S"],
    [12, "S", "Q", "12. y carga los items del carrito: SELECT de carrito_items con JOIN a producto_talla_color, productos, tallas y colores, y el precio_unitario guardado, NO el de hoy.   Consulta 2.   O sea que el precio de la venta es el que el cliente vio al meter la prenda en el carrito, y CU25 lo guardaba. Ese es el acierto de CU25 pagando aqui", "S"],
    [13, "S", "S", "13. y aqui empieza el PRIMER LOOP del caso, L193: for ( const item of items ), y lo que hace es ACUMULAR el subtotal, los impuestos y el total   O sea que el bucle no escribe nada: solo suma. Y es el unico bucle de lectura del caso", "S"],
    [14, "S", "S", "14. y aqui empieza la transaccion, L235: await this.dataSource.transaction( async (em) => {   Y ESTA VEZ SI HAY BARRA EN LA BASE DE DATOS, que es la primera vez en la serie que un caso de escritura tiene una transaccion Y un bucle de escritura dentro", "S"],
    [15, "S", "D", "15. y dentro, el primero: INSERT INTO ventas ( id_cliente, id_usuario, id_sucursal, id_carrito, modalidad, metodo_pago, subtotal, impuestos, total, estado, fecha_venta ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pendiente', NOW() ) RETURNING id_venta, L238-241   OJO el estado: 'Pendiente', con mayuscula P minuscula. Y el esquema, L395, tiene DEFAULT 'Completada'. Los dos INSERT del proyecto, L240 y L518, ponen Pendiente a mano, o sea que el DEFAULT no lo usa nadie", "A"],
    [16, "S", "D", "16. y aqui empieza el SEGUNDO LOOP del caso, L250: for ( const linea of lineas ), y este SI escribe.   INSERT INTO venta_items ( id_venta, id_ptc, cantidad, precio_unitario, subtotal ) VALUES ( $1, $2, $3, $4, $5 ), L252-253   Consulta 3   Y venta_items, L399-405, tiene 6 columnas y UNA es precio_unitario.   O sea que la venta guarda el precio, igual que el carrito y al reves que la reserva", "S"],
    [17, "S", "D", "17. vuelta 1, vuelta 2, hasta N: un INSERT por prenda del carrito, con el precio que tenia.   Y con 6 prendas son 6 escrituras dentro de la misma transaccion, y el mismo COUNT que CU21: la cabecera mas un INSERT por item", "S"],
    [18, "S", "D", "18. y el ultimo UPDATE de la transaccion, L260: UPDATE carritos SET estado = 'En pago' WHERE id_carrito = $1   O sea que el carrito pasa a 'En pago'.   Y ese es un TERCER estado de carritos, que es VARCHAR(20) sin CHECK: Activo, En pago y Convertido a venta. Y el codigo de CU25 solo menciona el primero", "A"],
    [19, "S", "B", "19. COMMIT, L263, y aqui FUERA la bitacora, L271: registrar( usuario, 'INSERT', 'ventas', .. )   O sea que la venta esta creada y la bitacora va detras, y si la bitacora falla la venta existe sin rastro.   Es el mismo patron que CU21 y CU25", "S"],
    [20, "S", "H", "20. { id_venta, total, estado: 'Pendiente' }   Y la pantalla pasa al paso 3, Checkout.tsx L422: paso === 3 y !ventaOk", "A"],
    [21, "K", "K", "21. y en el paso 3, L525, el boton de pagar   Y el PAGO, L191: await api.crearTransaccion( { id_venta, metodo_pago, proveedor_pasarela } )   O sea que la venta ya existe y ahora se paga. Son dos peticiones y dos servicios distintos", "S"],
    [22, "K", "H", "22. POST /api/v1/pagos/transacciones   api.ts L1939, y aqui YA se cambia de fichero: de ventas a pagos.   Es el mismo caso repartido en dos modulos, que es lo unico de la serie que hace esto", "S"],
    [23, "H", "G", "23. el guard otra vez, y la segunda consulta de permisos del caso", "S"],
    [24, "G", "P", "24. crearTransaccion( usuario, dto, request ), SRV_PagosService L114, que es OTRO servicio y OTRO fichero, con 784 lineas y 6 bucles que son de otros casos", "S"],
    [25, "P", "P", "25. y exigirPermisoPagar, L119, que comprueba LO MISMO que el de CU25, realizar_venta, L78, y con un mensaje distinto: 'No tienes permisos para realizar pagos.'   O sea que en este caso hay DOS metodos que piden el mismo permiso con dos textos, L76 y L83 en Ventas y L76 en Pagos", "S"],
    [26, "P", "S", "26. y los tres guardas: [id_venta no entero] 404, L122-124.   [metodo no esta en METODOS_PAGO] 422, L127-129.   Y [proveedor no esta en PROVEEDORES] 422, L131-133.   Y el proveedor va en toUpperCase antes de comparar, L130, que es el cuidado de las tres listas de L36-39", "S"],
    [27, "P", "Q", "27. SELECT id_venta, id_usuario, id_carrito, estado, total FROM ventas WHERE id_venta = $1 LIMIT 1, L137-140   Y DOS guardas con el MISMO 404: [no existe] y [no es suya], L144-146.   O sea que la venta de otro da el mismo 404 que la que no existe, y eso es lo correcto, igual que CU22 y CU24", "S"],
    [28, "P", "S", "28. y el quarto guarda, L147-149: [estado != 'PENDIENTE'] 409 'La venta ya fue procesada.'   Y aqui hay que mirar el detalle: la venta se creo con 'Pendiente', L240, y aqui se compara con toUpperCase() !== 'PENDIENTE'.   O sea que el toUpperCase hace que 'Pendiente' pase, y el autor lo escribio a proposito.   Pero es la MISMA comparacion con L253 y L701 de este mismo servicio", "S"],
    [29, "P", "Q", "29. y el quinto guarda, que es el que no tiene transaccion: SELECT id_transaccion FROM transacciones_pago WHERE id_venta = $1 LIMIT 1, L152.   [ya hay una transaccion] 409 'La venta ya fue procesada.', L155-157.   O sea que este SELECT es un candado, y no hay ni transaccion ni indice detras", "S"],
    [30, "P", "S", "30. y aqui estan los dos UUID que lo explican todo: referenciaExterna = randomUUID(), L160, e idTransaccionPasarela = 'SBX-' + randomUUID(), L161   O sea que el 'identificador de la pasarela' lo genera EL SERVIDOR, no la pasarela. Y el prefijo SBX, que es sandbox", "S"],
    [31, "P", "D", "31. INSERT INTO transacciones_pago ( id_venta, id_usuario, proveedor_pasarela, monto, moneda, metodo, estado, referencia_externa, id_transaccion_pasarela, fecha_hora ) VALUES ( $1, $2, $3, $4, 'BOB', $5, 'Pendiente', $6, $7, NOW() ) RETURNING id_transaccion, L165-169   Consulta 4   Y con la moneda HARDCODEADA a 'BOB', L168.   O sea que el DECIMAL(3) de la tabla, L446, no se puede cambiar sin tocar el codigo", "A"],
    [32, "P", "B", "32. y la bitacora, L178-196, con la accion INSERT sobre transacciones_pago y el newData con las 8 columnas, L186-195   Y otra vez FUERA de transaccion, porque este INSERT no tiene ninguna: es el unico camino del caso de escritura que no la abre", "S"],
    [33, "P", "K", "33. { id_transaccion, checkout_url, id_transaccion_pasarela, estado: 'Pendiente', monto }, L198-204   Y el checkout_url, L200, es FRONTEND_URL + /sandbox-pago?tx=N.   O sea que NO HAY PASARELA: la pantalla de pago es una pagina del propio proyecto, y el 'banco' esta en SandboxPago.tsx, 238 lineas", "A"],
    [34, "K", "X", "34. y el navegador salta a esa pagina, Checkout.tsx L196: window.location.href = res.checkout_url   O sea que se abandona el checkout y se va a OTRA pagina, y luego hay que volver.   Y como se pasa el id por la URL, L200, el estado vive en el servidor, que es lo correcto", "S"],
    [35, "U", "X", "35. y en SandboxPago.tsx ve una pantalla que dice LIBELULA, L14, con tres botones: aprobar, rechazar y no responder.   O sea que la persona que compra es quien decide si su pago se aprueba", "A"],
    [36, "X", "H", "36. POST /api/v1/pagos/simular   api.ts, y el cuerpo, L499: id_transaccion, resultado ('Aprobado', 'Rechazado' o 'no_responde') y detalle.   O sea que el TERCER resultado es no_responde, que es el timeout del banco", "S"],
    [37, "H", "G", "37. el guard por TERCERA vez, y la tercera consulta de permisos del caso", "S"],
    [38, "G", "P", "38. simularPasarela( usuario, dto, request ), L497, y empieza con exigirPermisoPagar, L502.   O sea que la pasarela simulada SI exige sesion y permiso, y la persona tiene que ser la dueña de la transaccion", "S"],
    [39, "P", "Q", "39. SELECT t.id_transaccion, t.id_usuario, t.monto, v.total AS venta_total FROM transacciones_pago t JOIN ventas v ON v.id_venta = t.id_venta WHERE t.id_transaccion = $1 LIMIT 1, L506-510   Consulta 5   Y el guarda de pertenencia, L514-516, con 404 'Transacción no encontrada.'   O sea que solo el dueno de la transaccion puede decidir como se paga", "S"],
    [40, "P", "S", "40. y aqui hay dos salidas, y la primera es el timeout: [resultado == 'no_responde'] 504 'La pasarela de pago no respondió. Intenta de nuevo en unos ...', L518-520   O sea que un caso de uso entero se puede quedar colgado por decision del cliente, y con un 504 que es el codigo correcto", "S"],
    [41, "P", "S", "41. y el quinto guarda: [resultado no es Aprobado ni Rechazado] 422, L522-524   Y luego monta la notificacion, L537-543, con los cuatro campos: id_transaccion, estado, monto y firma.   Y la firma es this.firmar( id, monto, estado ), L542, es decir, LA FIRMA EL PROPIO SERVIDOR", "S"],
    [42, "P", "P", "42. y aqui esta el hallazgo 3 del caso entero, en UNA linea: L545, return this.procesarWebhook( notificacion, request )   O sea que simularPasarela llama a procesarWebhook con una notificacion que el mismo acaba de firmar.   Y procesarWebhook, L484-486, verifica la firma contra FIRMA_SECRETO.   O sea que el banco simulado es el servidor, y el servidor se verifica a si mismo", "S"],
    [43, "P", "P", "43. procesarWebhook( dto, request ), L480, y aqui esta el HALLAZGO 1: L484, const esperada = this.firmar( id, monto, estado ). Y L485-487, [la firma no coincide] 401 'Firma inválida.'   Y LONTA este es el UNICO endpoint del caso SIN GUARD: no pide sesion, no pide permiso, no pide nada.   Lo unico que separa un webhook legitimo de uno falso es la firma", "S"],
    [44, "P", "P", "44. y la firma, L101-105, entera: createHmac('sha256', FIRMA_SECRETO).update(idTransaccion + '.' + monto + '.' + estado).digest('hex')   Y FIRMA_SECRETO, L40, es process.env.PAGO_WEBHOOK_SECRET ?? 'sandbox-secreto-cu35'   O SEA QUE EL SECRETO ESTA ESCRITO EN EL CODIGO, como valor por defecto, y si la variable de entorno no esta, cualquiera que lea el proyecto lo sabe", "S"],
    [45, "P", "P", "45. y la comparacion, L107-112, es CORRECTA: compara longitudes y luego timingSafeEqual, que es la forma de comparar sin que el tiempo dependa del contenido.   Ese es el unico detalle criptografico bien hecho del caso, y merece decirse", "A"],
    [46, "P", "Q", "46. y procesarResultado, L548, que es donde pasa a la base: SELECT con JOIN de transacciones_pago y ventas, L557-563, y el idempotente, L577: [el estado ya no es Pendiente] devuelve el estado actual sin reprocesar, L578-586.   Consulta 6", "S"],
    [47, "P", "D", "47. y el guard del monto, L591: si el monto notificado no es el total de la venta, UPDATE transacciones_pago SET estado = 'Rechazado', detalle = 'Monto no válido' WHERE id_transaccion = $1 AND estado = 'Pendiente', L593-594   Y el WHERE lleva el estado, o sea que es un compare-and-set: dos webhooks a la vez, solo uno actualiza.   Con su bitacora y su oldData real, L604-605", "A"],
    [48, "P", "P", "49. y si el resultado es Rechazado, L617-620, otro UPDATE a Rechazado con el detalle.   Y si es Aprobado, L647: dataSource.transaction, la segunda transaccion del fichero, y dentro el flujo feliz de L644: pagos Aprobado, venta Completada y carrito Convertido a venta", "S"],
    [49, "P", "D", "49. y las tres escrituras del flujo feliz, L691, L696 y L701: UPDATE transacciones_pago SET estado = 'Aprobado'; UPDATE ventas SET estado = 'Completada'; UPDATE carritos SET estado = 'Convertido a venta'   O sea que un pago mueve el estado de TRES tablas, y las tres dentro de la misma transaccion.   Y el detalle del pago va en el L234, que es una columna TEXT, L452", "S"],
    [50, "P", "B", "50. y la bitacora, L723, con la accion UPDATE y el numero de comprobante, L748, que se emite por el caso CU38   O sea que este caso deja la venta lista para que el comprobante se emita, pero no lo emite", "S"],
    [51, "P", "X", "51. { id_transaccion, estado: 'Aprobado', monto, moneda, numero_comprobante }, L745-750   Y la pantalla SandboxPago, L48, pinta ese estado.   Y el monto que ve, L49, es el que la pasarela NOTIFICO, que el servidor ya comparo con el total", "A"],
    [52, "U", "U", "52. este caso es el mas grande de la serie, en cuatro endpoints, tres ficheros de api y dos de web, y es el primero que tiene un secreto de firma.   Y tiene un hallazgo de seguridad que es el mas grave de los veinte: FIRMA_SECRETO tiene el valor por defecto escrito en el codigo, y el webhook es el unico endpoint sin sesion.   O sea que quien lea el proyecto puede firmar un pago falso", "A"]
];

var HAL = [
    ["1. El secreto de la firma esta escrito en el codigo", [
        "El hallazgo MAS GRAVE de los veinte casos, y es de",
        "seguridad, no de diseno.",
        "",
        "L40, la linea entera:",
        "",
        "  const FIRMA_SECRETO =",
        "    process.env.PAGO_WEBHOOK_SECRET ?? 'sandbox-secreto-cu35';",
        "",
        "O sea que hay una variable de entorno, que es lo correcto, Y UN",
        "VALOR POR DEFECTO escrito en el fuente. Si la variable no esta",
        "definida en el despliegue, la firma HMAC se calcula con la",
        "cadena sandbox-secreto-cu35.",
        "",
        "Y POR QUE ESO ES GRAVE, y no es un descuido de estilo:",
        "procesarWebhook es el UNICO endpoint de este caso SIN GUARD.",
        "No lleva @UseGuards, no pide sesion, no pide permiso y no",
        "comprueba nada del usuario. Es lo correcto para un webhook:",
        "la pasarela no tiene cuenta. Pero significa que lo UNICO que",
        "distingue una notificacion legitima de una falsificada es la",
        "firma.",
        "",
        "Y SI EL SECRETO ESTA EN EL CODIGO, la firma se puede fabricar.",
        "Cualquiera que tenga el repositorio, o el paquete compilado,",
        "o un log de error que lo muestre, puede enviar un POST a",
        "/pagos/webhook con la firma correcta y marcar CUALQUIER",
        "transaccion como Aprobada.",
        "",
        "LO QUE LO HACE MAS GRAVE: procesarResultado, L591, solo",
        "comprueba que el MONTO notificado sea el total de la venta. Y",
        "ese monto sale de la propia base, L588, o sea que un atacante",
        "que ya puede firmar puede ademas mandar el monto correcto, que",
        "es un dato publico. El control de monto, que es el que",
        "parece proteger, no protege.",
        "",
        "Y LA CADENA, para que quede claro que es de este caso:",
        "",
        "  1  POST /pagos/webhook, sin sesion",
        "  2  firmar( id, monto, estado ) con el secreto por defecto",
        "  3  firmasCoinciden pasa",
        "  4  procesarResultado actualiza a Aprobado y marca la venta",
        "",
        "LO QUE HABRIA QUE HACER, y es una linea: que el secreto no",
        "tenga valor por defecto, y que si falta, el servidor no",
        "arranque. O una linea y un throw al cargar el modulo. Lo que",
        "no puede ser es un default que funciona."
    ]],
    ["2. La firma solo cubre tres campos de la transaccion", [
        "El hallazgo de seguridad numero dos, y es mas sutil que",
        "el anterior.",
        "",
        "firmar, L101-105, entera:",
        "",
        "  private firmar(idTransaccion: number, monto: number,",
        "              estado: string): string {",
        "    return createHmac('sha256', FIRMA_SECRETO)",
        "      .update(`${idTransaccion}.${monto}.${estado}`)",
        "      .digest('hex');",
        "  }",
        "",
        "LO QUE FIRMA: el id de la transaccion, el monto y el estado.",
        "Tres campos.",
        "",
        "LO QUE NO FIRMA, y es lo que importa:",
        "",
        "  -  el id_usuario, o sea QUIEN es el dueno del pago",
        "  -  el id_venta, o sea QUE se esta pagando",
        "  -  el proveedor de pasarela",
        "  -  el metodo de pago",
        "  -  la fecha o la hora",
        "  -  el detalle",
        "",
        "O SEA QUE LA FIRMA ES REUTILIZABLE. La misma firma sirve",
        "para el mismo id, el mismo monto y el mismo estado, para",
        "SIEMPRE. No caduca, porque no lleva fecha. Y no depende de",
        "quien compra.",
        "",
        "EL EFECTO, y hay que pensarlo un segundo mas: una firma",
        "capturada para un Aprobado, si el monto y el estado coinciden,",
        "sigue siendo valida mañana, en otro despliegue que comparta el",
        "secreto, y para cualquier persona que tenga ese id de",
        "transaccion. Como el secreto por defecto esta en el codigo, el",
        "problema se multiplica por todas las instalaciones que no",
        "definan la variable.",
        "",
        "Y COMPARADO CON LO QUE HACE BIEN, que es el mismo archivo:",
        "firmasCoinciden, L107-112, SÍ usa timingSafeEqual y SÍ",
        "comprueba las longitudes antes, L110, porque timingSafeEqual",
        "de Node lanza si no coinciden. O sea que la comparacion la",
        "escribieron con cuidado, y lo que noSignup esta firmando es",
        "poco.   Es el mismo patron que CU20 y CU22: el efecto es",
        "correcto y el alcance esta mal."
    ]],
    ["3. No hay pasarela de pago: el banco es el propio proyecto", [
        "El hallazgo que explica el caso entero, y no es un fallo:",
        "es una decision de alcance, dicha sin decirlo.",
        "",
        "TRES PIEZAS QUE JUNTAS DICEN QUE LA PASARELA NO EXISTE:",
        "",
        "1. L161, en crearTransaccion:",
        "",
        "     idTransaccionPasarela = `SBX-${randomUUID()}`;",
        "",
        "   El identificador de transaccion DE LA PASARELA lo genera el",
        "   servidor. Con el prefijo SBX, que es sandbox. Y hay otro",
        "   UUID al lado, L160, que es referenciaExterna, que es el id",
        "   que le pasaria UNA pasarela de verdad.",
        "",
        "2. L200, en la respuesta:",
        "",
        "     checkout_url: `${FRONTEND_URL}/sandbox-pago?tx=${...}`",
        "",
        "   La URL de pago es una PAGINA DEL PROPIO FRONTEND, y se",
        "   llama sandbox-pago. Y FRONTEND_URL, L41, es process.env",
        "   con un default de localhost:5173, o sea que en un",
        "   despliegue sin configurar, el cliente paga en la",
        "   maquina del servidor.",
        "",
        "3. L497, simularPasarela, y L545:",
        "",
        "     return this.procesarWebhook( notificacion, request );",
        "",
        "   El simulador ARMA la notificacion, la FIRMA con el mismo",
        "   secreto, y se la pasa al webhook. O sea que el webhook se",
        "   verifica a si mismo.",
        "",
        "Y LA PANTALLA, SandboxPago.tsx, 238 lineas, con los tres",
        "botones: aprobar, rechazar y no responder.   O sea que quien",
        "compra decide si su pago se aprueba.",
        "",
        "LO QUE ESTA BIEN, y es mucho:",
        "",
        "  -  La pasarela simulada NOTIFICA con el mismo formato que",
        "     llegaria de una real, L537-543, con los cuatro campos.",
        "     Y el comentario del autor, L526-527, lo dice: es una",
        "     simulacion emissions por produccion.   O sea que el",
        "     camino del codigo esta escrito para que cambiar la",
        "     simulacion por una pasarela real sea cambiar UNA",
        "     pantalla.",
        "  -  El monto notificado sale de la base, L528, no del",
        "     cliente.   O sea que el cliente no puede decir cuanto",
        "     pago.",
        "  -  Y el no_responde, L518, con un 504.   O sea que el",
        "     caso de timeout del banco esta previsto, con su codigo",
        "     HTTP correcto.",
        "",
        "LO QUE NO ESTA BIEN: el comentario de L526 dice 'en",
        "produccion', y no hay un solo rastro de como se cambia. No",
        "hay una interfaz de pasarela, ni una bandera, ni una",
        "variable. El unico punto de union es FIRMA_SECRETO, y ese",
        "tiene el default. O sea que el unico lugar donde habria que",
        "intervenir para poner una pasarela de verdad es el mismo que",
        "esta comprometido."
    ]],
    ["4. El cuarto caso del mismo bug de permiso", [
        "El patron ya no es un patron: es una constante.",
        "",
        "LO QUE PIDE ESTE CASO, SRV_VentasService L70-75:",
        "",
        "  private async exigirPermisoVenta(usuario) {",
        "    const permisos = await this.cargarPermisos(usuario);",
        "    if (!(permisos.includes('*') ||",
        "          permisos.includes('realizar_venta'))) {",
        "      throw new ForbiddenException(",
        "        'No tienes permisos para comprar.');",
        "    }",
        "  }",
        "",
        "Y LA LLAMA EN L115, la primera linea de crearCompraDigital.",
        "",
        "EL ROL CLIENTE DEL SEED, schema.sql L577:",
        "",
        "  (\"ver_catalogo\", \"comprar\", \"reservar\",",
        "   \"usar_vestidor_ra\")",
        "",
        "comprar. NO realizar_venta.   Y el mensaje de L73 dice",
        "'No tienes permisos para comprar', que es EXACTAMENTE lo",
        "que la persona quiere hacer.   O sea que aqui, como en CU25,",
        "el texto esta bien y la condicion no.",
        "",
        "LA LISTA COMPLETA, y son cuatro:",
        "",
        "  CU22  gestionar_reservas   el Cliente tiene reservar",
        "  CU24  consultar_catalogo    el Cliente tiene ver_catalogo",
        "  CU25  realizar_venta       el Cliente tiene comprar",
        "  CU26  realizar_venta       el Cliente tiene comprar",
        "",
        "Y ADEMAS, en ESTE caso hay CUATRO metodos mas que piden el",
        "mismo permiso, en dos ficheros:",
        "",
        "  SRV_VentasService L72   exigirPermisoVenta, que es el de",
        "                             este caso, L115",
        "  SRV_VentasService L79   exigirPermisoRegistrarVenta, que",
        "                             tambien pide realizar_venta, con su",
        "                             mensaje: registrar ventas",
        "  SRV_PagosService  L78   exigirPermisoPagar, que pide",
        "                             realizar_venta, con su mensaje:",
        "                             realizar pagos",
        "  SRV_PagosService  L85   exigirPermisoCaja, que pide",
        "                             REALIZAR_VENTA tambien, y es el",
        "                             metodo que dice 'caja'",
        "",
        "O SEA QUE CUATRO METODOS CON CUATRO NOMBRES, UNA SOLA",
        "CONDICION, Y EL MISMO ROL QUE NO LO TIENE.   Y como el",
        "Cliente no puede comprar, tampoco puede pagar, porque los",
        "dos usan el permiso de la caja.",
        "",
        "Y UN DETALLE MAS: el metodo de L83, exigirPermisoCaja, se",
        "llama caja y no pide permiso de caja.   Y el de L96,",
        "sucursalDelEmpleado, repite el texto de L86 con un",
        "significado distinto: ahi si es que no tiene sucursal."
    ]],
    ["5. El candado sin transaccion y sin indice", [
        "Un hallazgo de concurrencia, y sale de un SELECT.",
        "",
        "crearTransaccion, L151-157:",
        "",
        "  const txExistente = await this.dataSource.query(",
        "    `SELECT id_transaccion FROM transacciones_pago",
        "     WHERE id_venta = $1 LIMIT 1`,",
        "    [idVenta],",
        "  );",
        "  if (Array.isArray(txExistente) && txExistente.length > 0) {",
        "    throw new ConflictException('La venta ya fue procesada.');",
        "  }",
        "",
        "Y DIEZ LINEAS DESPUES, L163-172, el INSERT de la",
        "transaccion.",
        "",
        "O SEA QUE ES UN CANDADO SIN CANDADO. El patron correcto, que",
        "el propio proyecto usa en otros sitios, es el INSERT con la",
        "condicion dentro:",
        "",
        "  INSERT INTO transacciones_pago ...",
        "  WHERE ...",
        "  ON CONFLICT ...",
        "",
        "o una transaccion con SELECT .. FOR UPDATE, como hacen",
        "procesarPagoCaja, L279, y crearCompraDigital, L235.",
        "",
        "ASI QUE DOS PULSOS A LA VEZ CREAN DOS TRANSACCIONES DE LA",
        "MISMA VENTA. Los dos SELECT ven que no hay ninguna, porque",
        "llegan antes de que ninguna escriba.",
        "",
        "Y NO HAY INDICE QUE LO IMPIDA, que es la otra mitad:",
        "",
        "  transacciones_pago   CERO indices.   Y se busca por",
        "                         id_venta, L152, que no es la clave",
        "                         primaria, que es id_transaccion.",
        "  ventas               UN indice, L564:",
        "                         idx_ventas_sucursal_fecha sobre",
        "                         (id_sucursal, fecha_venta).",
        "",
        "O sea que el SELECT de L152 es un seq scan de la tabla, y la",
        "de L137, que busca por id_venta en ventas, tambien: el indice",
        "que hay es por sucursal y fecha, y esa consulta es por venta.",
        "",
        "Y LA DE id_usuario, que es la que usa la pantalla CU38, no",
        "tiene indice.   O sea que el mismo bug de CU22, en las dos",
        "tablas nuevas: el indice esta en la columna que se busca para",
        "los ADMINISTRADORES, y no en la que se busca para los",
        "CLIENTES."
    ]],
    ["6. El DEFAULT 'Completada' que la aplicacion nunca usa", [
        "Un hallazgo de esquema, y es pequeno pero conviene.",
        "",
        "schema.sql L395:",
        "",
        "  estado VARCHAR(20) DEFAULT 'Completada',",
        "",
        "Y LOS TRES ESTADOS QUE EL CODIGO USA:",
        "",
        "  'Pendiente'   lo pone el INSERT de la digital, L240, y el",
        "                de la presencial, L518.   Los dos a mano.",
        "  'Completada'  la ponen tres UPDATE: Pagos L334, L696 y",
        "                Ventas.",
        "  'En pago'     es de carritos, no de ventas.",
        "",
        "O SEA QUE EL DEFAULT NUNCA SE USA. Los dos unicos INSERT",
        "del proyecto en ventas ponen el estado a mano, L240 y L518.",
        "El DEFAULT solo se aplicaria si alguien inserta sin estado,",
        "y eso no lo hace nadie.",
        "",
        "Y ESO ES JUSTO LO QUE LO HACE PELIGROSO. Una venta que",
        "nace Completada es una venta COBRADA sin que nadie haya",
        "cobrado.   O sea que el estado por defecto del esquema es el",
        "estado final del proceso, y el proceso empieza en el otro.",
        "",
        "UN DEFAULT RAZONABLE SERIA NULL, o 'Pendiente', o un",
        "'Borrador'. Con 'Completada', el fallo de un INSERT futuro",
        "que olvide la columna produce una venta cerrada.",
        "",
        "Y LO MISMO EN LAS OTRAS DOS TABLAS, y esto ya es una",
        "constante de la serie:",
        "",
        "  ventas              VARCHAR(20) DEFAULT 'Completada'",
        "  sin CHECK",
        "  carritos            VARCHAR(20) DEFAULT 'Activo'      sin CHECK",
        "  transacciones_pago  VARCHAR(20) DEFAULT 'Pendiente'  sin CHECK",
        "  sesiones_ra         VARCHAR(20)                     sin CHECK",
        "  resultados_prueba   resultado VARCHAR(20)           sin CHECK",
        "  reservas            VARCHAR(20) DEFAULT 'Solicitada' sin CHECK",
        "",
        "SEIS tablas de estado, SEIS VARCHAR, CERO CHECK en todo el",
        "esquema.   O sea que el estado de una venta, de una",
        "transaccion o de un carrito es una cadena libre de 20",
        "caracteres, y lo unico que la acota son los if del",
        "TypeScript.   Y CU22 ya lo senalo con las 5 listas de",
        "estados del proyecto. Esta es la raiz de las dos cosas."
    ]],
    ["7. La maquina de estados de la compra, en cinco estados y dos ficheros", [
        "Un hallazgo de reparto, y sale de contar estados.",
        "",
        "LOS CINCO ESTADOS DE ESTE CASO, y donde estan:",
        "",
        "  ventas",
        "    Pendiente   lo pone el INSERT, L240 y L518",
        "    Completada  la ponen Pagos L334 y L696",
        "  carritos",
        "    Activo           CU25, el DEFAULT de L371",
        "    En pago          Ventas L260, en ESTE caso",
        "    Convertido a venta  Pagos L701, en ESTE caso",
        "",
        "O SEA QUE UN SOLO CASO DE USO MUEVE EL ESTADO DE TRES",
        "TABLAS, y dos de ellas quedan en un estado que ningun otro",
        "caso conoce.   'En pago' lo pone solo Ventas L260.",
        "'Convertido a venta' lo pone solo Pagos L701.   Y CU25, que",
        "es el caso que crea el carrito, no menciona ninguno de los",
        "dos: su unico estado es 'Activo'.",
        "",
        "Y LA CONSECUENCIA, y es operativa: si un carrito se queda en",
        "'En pago' porque el cliente cerro la pestana del sandbox,",
        "no hay NINGUN camino en el proyecto que lo devuelva a",
        "'Activo'. El unico UPDATE de carritos que he encontrado en",
        "todo el fichero de Pagos, L701, va a 'Convertido a venta', y",
        "el de Ventas L260 va a 'En pago'.   O sea que un carrito",
        "abandonado bloquea el checkout para siempre, y el cliente no",
        "puede volver a comprar con el.",
        "",
        "Y NO HAY UNA TAREA QUE LO LIMPIE: cero llamadas a un metodo",
        "de expiracion, cero setTimeout en el servidor, y en el",
        "frontend tampoco hay un temporizador de pago.   El",
        "sandbox-pago tiene un boton de 'no_responde', L36 del DTO, que",
        "devuelve un 504, pero eso es una peticion que falla, no un",
        "carro que se limpia.",
        "",
        "Y LA COMPARACION CON EL RESTO: CU21, la reserva, tiene su",
        "propia transaccion y su FOR UPDATE.   CU25, el carrito, no",
        "tiene ni una.   Este, la compra, tiene dos.   O sea que la",
        "calidad de la transaccion sube y baja por el modulo, no por",
        "el caso."
    ]],
    ["8. Lo que esta bien, y es bastante", [
        "Este caso tiene siete cosas buenas, con el mismo detalle",
        "que las malas. Y es el mejor del proyecto en concurrencia.",
        "",
        "1. LA FIRMA SE COMPARA CON timingSafeEqual, L107-112, Y CON",
        "   LA COMPROBACION DE LONGITUD ANTES, L110, porque",
        "   timingSafeEqual de Node lanza si no coinciden.   O sea que",
        "   esa funcion esta escrita por alguien que sabe lo que hace.",
        "   Y el fallo de las dos-lineas de la firma no es de",
        "   criptografia, es de alcance.",
        "",
        "2. Y LA MONEDA VA HARDCODEADA en el INSERT, L168, en vez de",
        "   venir del dto.   Y el monto sale de la base, L159, con",
        "   venta.total, y no de lo que dice el cliente.   O sea que",
        "   el cliente no puede decidir cuanto paga.",
        "",
        "3. Y EL CONTROL DEL MONTO ES UN COMPARE-AND-SET, L591-594:",
        "   el UPDATE lleva WHERE id_transaccion = $1 AND estado =",
        "   'Pendiente'.   O sea que si llegan dos webhooks a la vez,",
        "   solo el primero actualiza, y el segundo se queda con la",
        "   respuesta idempotente de L578-586.   Eso es lo que",
        "   CU19 no hacia con sus veinte productos, y CU21 lo hacia",
        "   con el FOR UPDATE.   Aqui se hace de otra forma, y",
        "   tambien funciona.",
        "",
        "4. Y LA TRANSACCION DEL FLUJO FELIZ ABRE Y CIERRA LOS TRES",
        "   ESTADOS, L647, L691, L696 y L701: pago Aprobado, venta",
        "   Completada y carrito Convertido a venta.   Tres tablas en",
        "   una transaccion.   Y el pago mueve el stock, por el",
        "   trigger de L654, que CU20 demostro que resta.",
        "",
        "5. Y EL IDEMPOTENTE ESTA PENSADO, L576-586, con un",
        "   comentario que explica POR QUE, E9, y que devuelve el",
        "   estado actual en vez de reprocesar.   O sea que un",
        "   webhook repetido, que es lo normal en una pasarela, no",
        "   rompe nada.",
        "",
        "6. Y LA VALIDACION DE ENTRADA TIENE LISTAS BLANCAS",
        "   DUPLICADAS, L36-39: METODOS_PAGO, PROVEEDORES,",
        "   METODOS_PAGO_CAJA y PROVEEDORES_CAJA.   O sea que la caja",
        "   tiene las suyas, mas cortas, y las digitales las suyas. Y",
        "   el proveedor se pasa a mayusculas antes de comparar, L130,",
        "   para que 'libelula' y 'LIBELULA' sean lo mismo.   Eso es",
        "   un detalle que casi nadie hace.",
        "",
        "7. Y LOS 404 CON EL MISMO TEXTO, L144-146 y L514-516: una",
        "   venta de otro y una transaccion de otro dan el mismo 404",
        "   que las que no existen.   Y el del webhook es un 401 con",
        "   'Firma inválida.', L486, que es el codigo correcto para",
        "   una firma que no cuadra.   CU22 y CU24 hicieron lo mismo y",
        "   CU25 no lo hizo, y esta es la tercera vez que sale bien."
    ]]
];
// ---------------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------------

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
    var nuevo = null;
    try { nuevo = padre.Packages.AddNew(nombre, ""); } catch (e) { nuevo = null; }
    if (nuevo == null) return null;
    try { nuevo.Update(); } catch (e) { }
    try { padre.Packages.Refresh(); } catch (e) { }
    return buscarPaquete(padre, nombre);
}

function buscarLocal(paq, nombre) {
    if (paq == null) return null;
    for (var i = 0; i < paq.Elements.Count; i++) {
        var e = paq.Elements.GetAt(i);
        if (String(e.Name) == nombre) return e;
    }
    return null;
}

function objetoEn(diag, el) {
    if (diag == null || el == null) return null;
    for (var i = 0; i < diag.DiagramObjects.Count; i++) {
        var c = diag.DiagramObjects.GetAt(i);
        if (c.ElementID == el.ElementID) return c;
    }
    return null;
}

function nota(el, texto) {
    if (el == null) return;
    try {
        var a = String(el.Notes || "");
        if (a.indexOf(texto) < 0) el.Notes = a + SALTO + texto;
        el.Update();
    } catch (e) { }
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
    try { nuevo.DiagramLinks.Refresh(); } catch (e) { }
    return nuevo;
}

function borrarTodo(diag) {
    for (var i = diag.DiagramObjects.Count - 1; i >= 0; i--) {
        try { diag.DiagramObjects.GetAt(i).Delete(); } catch (e) { }
    }
    try { diag.DiagramObjects.Refresh(); } catch (e) { }
}

function indiceDe(clave) {
    for (var i = 0; i < CAB.length; i++) if (CAB[i][0] == clave) return i;
    return -1;
}

function xDe(indice) { return X0 + indice * PASO; }

function clavesPresentes(C) {
    var n = 0;
    for (var i = 0; i < CAB.length; i++) if (C[CAB[i][0]] != null) n++;
    return n;
}

// ---------------------------------------------------------------
// COLOCACION
//
// AQUI ESTA LA Y EN NEGATIVO. Ver el comentario del principio del
// fichero. Si esto se cambia a positivo, los objetos caen en el mismo
// punto y el diagrama sale amontonado.
// ---------------------------------------------------------------

function crearCabeceras(paq) {
    var C = {};
    for (var i = 0; i < CAB.length; i++) {
        var nom = CAB[i][1];
        var el = buscarLocal(paq, nom);
        if (el == null) {
            try { el = paq.Elements.AddNew(nom, CAB[i][2]); } catch (e) { el = null; }
            if (el == null) {
                ERRORES.push("no se pudo crear la cabecera " + nom);
                continue;
            }
            try { el.Update(); } catch (e2) { }
        }
        try { el.Name = nom; } catch (e) { }
        try { el.Stereotype = CAB[i][3]; } catch (e) { }
        try { el.Alias = CAB[i][4]; } catch (e) { }
        try { el.Abstract = false; } catch (e) { }
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU26."; } catch (e) { }
        nota(el, "Papel RUP: " + CAB[i][6] + ".");
        nota(el, "Subtitulo en la cabecera: " + CAB[i][5] + ".");
        nota(el, "Fichero real: " + CAB[i][7] + ".");
        try { el.Update(); } catch (e) { }
        C[CAB[i][0]] = el;
    }
    try { paq.Elements.Refresh(); } catch (e) { }
    return C;
}

function colocarCabeceras(diag, C) {
    for (var i = 0; i < CAB.length; i++) {
        var el = C[CAB[i][0]];
        if (el == null) continue;
        var x = xDe(i);
        var o = objetoEn(diag, el);
        if (o == null) {
            var tam = "l=" + x + ";r=" + (x + ANCHO_CAB) + ";t=" + Y_CAB + ";b=" + (Y_CAB + ALTO_CAB) + ";";
            try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e) { o = null; }
            if (o == null) continue;
            o.ElementID = el.ElementID;
        }
        try { o.ManuallySized = true; } catch (e) { }
        try { o.Left = x; } catch (e) { }
        try { o.Right = x + ANCHO_CAB; } catch (e) { }
        try { o.Top = 0 - Y_CAB; } catch (e) { }
        try { o.Bottom = 0 - Y_CAB - ALTO_CAB; } catch (e) { }
        try { o.FontSize = 8; } catch (e) { }
        try { o.WrapText = true; } catch (e) { }
        try { o.ShowNotes = false; } catch (e) { }
        try { o.ShowStereotype = false; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        try { o.BorderStyle = 1; } catch (e) { }
        try { o.BorderColor = 4210752; } catch (e) { }
        o.Update();
    }
}

// ---------------------------------------------------------------
// LOS DOS FRAGMENTOS Y LAS TRES BARRAS
//
// EA no coloca fragmentos de forma fiable por script, asi que lo que hay
// aqui son FORMAS con su etiqueta. Cada una va en try/catch y cuenta las
// que ha conseguido poner, y el informe final lo dice.
//
// Este caso tiene DOS loop (L1173 de validarPrendas y L1086 de la
// transaccion) y NINGUN alt. Se ha contado antes de escribir.
// ---------------------------------------------------------------

// De que lifeline es este punto. Se usa para poner en la
// pestaña del fragmento sobre QUE lifeline esta el loop o el alt.
function lifelineEnX(x) {
    for (var i = 0; i < CAB.length; i++) {
        if (xDe(i) === x) return CAB[i][1];
    }
    return "el diagrama";
}

function fragmento(diag, nombre, izq, der, yTop, yBottom) {
    var alto = yBottom - yTop;
    if (alto < 40) alto = 40;
    var x1 = izq - 14;
    var x2 = der + 14;

    // EL MARCO. Es un rectángulo con borde, que es la forma del
    // fragmento combinado, y no una etiqueta suelta al lado.
    var tam = "l=" + x1 + ";r=" + x2 + ";t=" + yTop + ";b=" + (yTop + alto) + ";";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(tam, "Shape"); } catch (e) { o = null; }
    if (o == null) {
        try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e2) { o = null; }
    }
    if (o == null) return false;
    try { o.BackGroundColor = 251658239; } catch (e) { }
    try { o.BorderStyle = 1; } catch (e) { }
    try { o.BorderColor = 8421504; } catch (e) { }
    try { o.ManuallySized = true; } catch (e) { }
    try { o.Left = x1; } catch (e) { }
    try { o.Right = x2; } catch (e) { }
    try { o.Top = 0 - yTop; } catch (e) { }
    try { o.Bottom = 0 - (yTop + alto); } catch (e) { }
    try { o.Update(); } catch (e) { }

        // LA PESTAÑA, arriba a la izquierda, DENTRO del marco. Y lleva
    // TRES lineas: el tipo del fragmento, sobre QUE lifeline esta,
    // y la condicion entre corchetes.   Lo segundo es lo que
    // faltaba: un loop sin saber de quien es, no dice nada.
    var pos = String(nombre).indexOf("[");
    var tipo = String(nombre);
    var condicion = "";
    if (pos > 0) {
        tipo = String(nombre).substring(0, pos);
        condicion = String(nombre).substring(pos);
    }
    var sobre = lifelineEnX(izq);
    var tab = "l=" + x1 + ";r=" + (x1 + 300) + ";t=" + yTop + ";b=" + (yTop + 36) + ";";
    var ot = null;
    try { ot = diag.DiagramObjects.AddNew(tab, "Text"); } catch (e) { ot = null; }
    if (ot != null) {
        var txt = tipo + "\nsobre: " + sobre + "\n" + condicion;
        try { ot.Text = txt; } catch (e) { }
        try { ot.FontSize = 9; } catch (e) { }
        try { ot.BorderStyle = 1; } catch (e) { }
        try { ot.BorderColor = 8421504; } catch (e) { }
        try { ot.BackGroundColor = 216543242; } catch (e) { }
        try { ot.Left = x1; } catch (e) { }
        try { ot.Right = x1 + 300; } catch (e) { }
        try { ot.Top = 0 - yTop; } catch (e) { }
        try { ot.Bottom = 0 - (yTop + 36); } catch (e) { }
        ot.Update();
    }

    // Y LA LINEA PUNTEADA, que es lo que separa las dos ramas de un
    // alt y lo que no tiene un loop. Se dibuja en la mitad del alto.
    if (String(nombre).indexOf("/") > 0) {
        var ym = yTop + Math.round(alto / 2);
        var lp = "l=" + x1 + ";r=" + (x1 + 40) + ";t=" + ym + ";b=" + (ym + 3) + ";";
        var ol = null;
        try { ol = diag.DiagramObjects.AddNew(lp, "Shape"); } catch (e) { ol = null; }
        if (ol != null) {
            try { ol.BackGroundColor = 8421504; } catch (e) { }
            try { ol.BorderStyle = 0; } catch (e) { }
            try { ol.ManuallySized = true; } catch (e) { }
            try { ol.Left = x1; } catch (e) { }
            try { ol.Right = x1 + 40; } catch (e) { }
            try { ol.Top = 0 - ym; } catch (e) { }
            try { ol.Bottom = 0 - (ym + 3); } catch (e) { }
            ol.Update();
        }
    }

    MARCOS_PUESTOS++;
    return true;
}

function activacion(diag, xLinea, yTop, yBottom) {
    var alto = yBottom - yTop;
    if (alto < 20) alto = 20;
    var x1 = xLinea - (ANCHO_ACTIVACION / 2);
    var tam = "l=" + x1 + ";r=" + (x1 + ANCHO_ACTIVACION) + ";t=" + yTop + ";b=" + (yTop + alto) + ";";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(tam, "Shape"); } catch (e) { o = null; }
    if (o == null) {
        try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e2) { o = null; }
    }
    if (o == null) return false;
    try { o.BackGroundColor = 4210752; } catch (e) { }
    try { o.BorderStyle = 0; } catch (e) { }
    try { o.ManuallySized = true; } catch (e) { }
    try { o.Left = x1; } catch (e) { }
    try { o.Right = x1 + ANCHO_ACTIVACION; } catch (e) { }
    try { o.Top = 0 - yTop; } catch (e) { }
    try { o.Bottom = 0 - (yTop + alto); } catch (e) { }
    try { o.Update(); } catch (e) { }
    BARRAS_PUESTAS++;
    return true;
}

function colocarFragmentos(diag) {
    var xS = xDe(indiceDe("S"));
    var xD = xDe(indiceDe("D"));
    // El loop de validarPrendas, L1173: un SELECT por prenda, fuera de la transaccion.
    // LOS 2 LOOP DEL CASO, y los dos son de crearCompraDigital, el primer servicio.
    var xV = xDe(indiceDe("S"));
    var xD = xDe(indiceDe("D"));
    fragmento(diag, "loop [por cada item del carrito: acumula subtotal, impuestos y total]", xV, xD, Y_MSG0 + 12 * PASO_MSG - 34, Y_MSG0 + 14 * PASO_MSG + 16);
    fragmento(diag, "loop [por cada linea: un INSERT en venta_items, DENTRO de la transaccion]", xV, xD, Y_MSG0 + 15 * PASO_MSG - 34, Y_MSG0 + 18 * PASO_MSG + 16);
    activacion(diag, xDe(indiceDe("V")), Y_MSG0 + 3 * PASO_MSG - 26, Y_MSG0 + 20 * PASO_MSG + 12);
    activacion(diag, xV, Y_MSG0 + 6 * PASO_MSG - 26, Y_MSG0 + 19 * PASO_MSG + 12);
    activacion(diag, xDe(indiceDe("P")), Y_MSG0 + 22 * PASO_MSG - 26, Y_MSG0 + 50 * PASO_MSG + 12);
}

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 940) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU26  Realizar Compra Digital (Web y Móvil)   ·   en el código del proyecto este caso es CU34, y son CUATRO endpoints"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 940) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseño de caso de uso, sección 3.3.2.1.  10 líneas de vida, 52 mensajes, 8 hallazgos, 2 loop y NINGUN alt, y 3 barras de activación."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su línea de vida. El tiempo baja. Este es el mejor caso de escritura del proyecto: tiene una transacción de verdad con las cinco escrituras dentro, y un SELECT con FOR UPDATE en la segunda vuelta del bucle, antes de mover el stock. El bloqueo por filas NO es un invento suyo: las siete transacciones del proyecto lo llevan. Lo que sí es de este caso es el orden. El caso se llama de múltiples prendas y la pantalla no existe: router.tsx L56 manda /reservas/nueva al catálogo. Dos bucles y ningún alt, de los cinco for del servicio solo dos son de este caso."; } catch (e) { }
        try { o3.FontSize = 8; } catch (e) { }
        try { o3.WrapText = true; } catch (e) { }
        try { o3.BorderStyle = 0; } catch (e) { }
        try { o3.BackGroundColor = 16777215; } catch (e) { }
        o3.Update();
    }
}

function colocarHallazgos(diag, paq) {
    var creados = 0;
    var y = Y_NOTA0;
    for (var i = 0; i < HAL.length; i++) {
        var lineas = HAL[i][1];
        var alto = lineas.length * ALTO_LINEA_NOTA + 26;
        if (alto < ALTO_MIN_NOTA) alto = ALTO_MIN_NOTA;
        var nom = "HALLAZGO " + HAL[i][0];
        var el = buscarLocal(paq, nom);
        if (el == null) {
            try { el = paq.Elements.AddNew(nom, "Note"); } catch (e) { el = null; }
            if (el == null) {
                ERRORES.push("no se pudo crear el hallazgo " + (i + 1));
                continue;
            }
            try { el.Update(); } catch (e2) { }
        }
        try { el.Name = nom; } catch (e) { }
        try { el.Notes = lineas.join(SALTO); } catch (e) { }
        try { el.Update(); } catch (e) { }
        try { paq.Elements.Refresh(); } catch (e) { }
        var o = objetoEn(diag, el);
        if (o == null) {
            var tam = "l=" + X_NOTA + ";r=" + (X_NOTA + ANCHO_NOTA) + ";t=" + y + ";b=" + (y + alto) + ";";
            try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e) { o = null; }
            if (o == null) continue;
            o.ElementID = el.ElementID;
        }
        try { o.ManuallySized = true; } catch (e) { }
        try { o.Left = X_NOTA; } catch (e) { }
        try { o.Right = X_NOTA + ANCHO_NOTA; } catch (e) { }
        try { o.Top = 0 - y; } catch (e) { }
        try { o.Bottom = 0 - y - alto; } catch (e) { }
        try { o.FontSize = 8; } catch (e) { }
        try { o.WrapText = true; } catch (e) { }
        try { o.ShowNotes = false; } catch (e) { }
        try { o.BackGroundColor = 16448250; } catch (e) { }
        try { o.BorderStyle = 1; } catch (e) { }
        try { o.BorderColor = 12874308; } catch (e) { }
        try { o.Update(); } catch (e) { }
        creados++;
        y = y + alto + SEPARACION_NOTA;
    }
    try { paq.Elements.Refresh(); } catch (e) { }
    return { total: creados, fin: y };
}

// ---------------------------------------------------------------
// LOS 43 MENSAJES
// ---------------------------------------------------------------

function mensaje(a, b, texto, n, esRetorno) {
    if (a == null || b == null) {
        ERRORES.push("mensaje " + n + " sin cabeceras");
        return null;
    }
    var est = "llamada";
    if (esRetorno) est = "retorno";
    var synch = "Synchronous";
    if (esRetorno) synch = "Asynchronous";
    var previo = null;
    for (var i = 0; i < a.Connectors.Count; i++) {
        var c = a.Connectors.GetAt(i);
        if (String(c.Name) == texto && c.SupplierID == b.ElementID) { previo = c; break; }
    }
    if (previo != null) {
        try { previo.Delete(); } catch (e) { }
    }
    var con = null;
    try { con = a.Connectors.AddNew(texto, "Sequence"); } catch (e) { con = null; }
    if (con == null) {
        try { con = a.Connectors.AddNew(texto, "Message"); } catch (e) { con = null; }
    }
    if (con == null) {
        ERRORES.push("mensaje " + n + " no se pudo crear");
        return null;
    }
    try { con.ClientID = a.ElementID; } catch (e) { }
    try { con.SupplierID = b.ElementID; } catch (e) { }
    try { con.Update(); } catch (e) { }
    try { con.Name = texto; } catch (e) { }
    try { con.Notes = ""; } catch (e) { }
    try { con.Stereotype = est; } catch (e) { }
    try { con.Synch = synch; } catch (e) { }
    try { con.Direction = "Source_To_Destination"; } catch (e) { }
    try { con.FontSize = 7; } catch (e) { }
    try { con.Update(); } catch (e) { }
    return con;
}

function dibujarMensajes(diag, C) {
    var puestos = 0;
    var autodestino = 0;
    PLAN = [];
    for (var i = 0; i < MSG.length; i++) {
        var n = MSG[i][0];
        var ia = indiceDe(MSG[i][1]);
        var ib = indiceDe(MSG[i][2]);
        if (ia < 0 || ib < 0) {
            ERRORES.push("mensaje " + n + " con clave de cabecera que no existe");
            continue;
        }
        var con = mensaje(C[MSG[i][1]], C[MSG[i][2]], MSG[i][3], n, MSG[i][4] == "A");
        if (con == null) continue;
        try { con.DiagramID = diag.ID; con.Update(); } catch (e) { }
        var y = Y_MSG0 + (n - 1) * PASO_MSG;
        PLAN.push(n, xDe(ia), y, xDe(ib), y);
        if (ia == ib) autodestino++;
        puestos++;
    }
    try { diag.DiagramLinks.Refresh(); } catch (e) { }
    try { diag.Update(); } catch (e) { }
    return { puestos: puestos, autodestino: autodestino, enDiagrama: contarLinks(diag) };
}

function contarLinks(diag) {
    var n = 0;
    try {
        for (var i = 0; i < diag.DiagramLinks.Count; i++) n++;
    } catch (e) { n = -1; }
    return n;
}

function comprobar(diag) {
    var leidos = 0;
    var bien = 0;
    var muestra = "";
    for (var i = 0; i < diag.DiagramObjects.Count; i++) {
        var o = null;
        try { o = diag.DiagramObjects.GetAt(i); } catch (e) { o = null; }
        if (o == null) continue;
        leidos++;
        var l = 0;
        var r = 0;
        var t = 0;
        var b = 0;
        try { l = o.Left; r = o.Right; t = o.Top; b = o.Bottom; } catch (e) { }
        var alto = b - t;
        var ancho = r - l;
        if (ancho > 5 && alto < -5) bien++;
        if (muestra.length < 150) muestra = muestra + " L=" + l + " R=" + r + " T=" + t + " B=" + b + " | ";
    }
    return { leidos: leidos, bien: bien, muestra: muestra };
}

// ---------------------------------------------------------------
// NOTAS DEL DIAGRAMA
// ---------------------------------------------------------------

// CU26 - notas del diagrama y MAIN
function notasDelDiagrama(diag, r, h, ch) {
    var N = [];
    N.push("CU26  Realizar Compra Digital (Web y Móvil).  Diseño de caso de uso, sección 3.3.2.1.");
    N.push("");
    N.push("AVISO DE NUMERACIÓN");
    N.push("");
    N.push("  Este caso es CU26 en el documento y CU34 en el código del proyecto, y el título es");
    N.push("  IGUAL salvo por el paréntesis: el documento dice 'Realizar Compra Digital (Web y");
    N.push("  Móvil)' y el código dice 'Realizar Compra Digital'.");
    N.push("");
    N.push("    web/src/lib/api.ts L1828   // CU34 - Realizar Compra Digital");
    N.push("");
    N.push("  Y ATENCIÓN, porque esto no lo hace ningún otro caso: CU34 en el código es UN");
    N.push("  ENDPOINT, y este caso son CUATRO, repartidos en tres ficheros de api y dos de web.");
    N.push("");
    N.push("    1  Crear la venta                   POST /ventas/checkout");
    N.push("    2  Crear la transaccion de pago     POST /pagos/transacciones");
    N.push("    3  Simular la respuesta del banco   POST /pagos/simular");
    N.push("    4  Recibir el webhook firmado       POST /pagos/webhook");
    N.push("");
    N.push("  Y el caso cambia de servicio a mitad: la venta la crea SRV_VentasService y el pago");
    N.push("  lo crea SRV_PagosService. Es el único caso de la serie repartido en dos módulos.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 líneas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Cliente            «actor»     quien compra, y quien aprueba el pago");
    N.push("    Checkout.tsx             «boundary»  574 líneas, y el paso 1, 2 y 3 de L204");
    N.push("    SandboxPago.tsx          «boundary»  238 líneas, y es la 'pasarela' de verdad");
    N.push("    api.ts                   «boundary»  sección CU34, L1828-1843");
    N.push("    JwtAuthGuard             «control»   en 3 de los 4. El del webhook NO lo lleva");
    N.push("    CTR_Ventas               «control»   el checkout, y el DTO de 6 campos");
    N.push("    SRV_VentasService        «control»   564 líneas, 1 transacción, 2 bucles");
    N.push("    SRV_PagosService         «control»   784 líneas, 2 transacciones, 0 bucles");
    N.push("    SRV_BitacoraService      «control»   registrar(), 3 veces");
    N.push("    PostgreSQL               «entity»    ventas, venta_items, transacciones_pago");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes. 7 van a la base de datos, 14 son mensajes a sí mismo, 10 son");
    N.push("  retornos, 10 llevan la guarda escrita entre corchetes y 3 tocan al actor.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("LOS FRAGMENTOS: DOS loop Y NINGUN alt");
    N.push("");
    N.push("  Contados ANTES de dibujar, con contadores, por separado en los dos servicios:");
    N.push("");
    N.push("    SRV_VentasService.ts, 564 líneas");
    N.push("      for 5   while 0   Promise.all 0");
    N.push("      if 30   throw 24   dataSource.query 10   em.query 5   transaction 2");
    N.push("    SRV_PagosService.ts, 784 líneas");
    N.push("      for 6   while 0   Promise.all 0   continue 2   map 0");
    N.push("      if 40   throw 29   ternarios 67   try 1   catch 1");
    N.push("      dataSource.query 13   em.query 15   transaction 2   bitacora 9");
    N.push("");
    N.push("  Y DE LOS 11 for ENTRE LOS DOS FICHEROS, SOLO 2 SON DE ESTE CASO:");
    N.push("");
    N.push("    L193  crearCompraDigital, un bucle por item del carrito, que solo suma");
    N.push("    L250  crearCompraDigital, un bucle por linea, con el INSERT de venta_items");
    N.push("");
    N.push("  Los otros nueve son de otros casos: L296, L309 y L336 de procesarPagoCaja, que es");
    N.push("  CU37; L432 y L454 de buscarProductosPos, que es CU36; L528 de");
    N.push("  crearVentaPresencial, que es CU36; y L667, L680 y L706 de procesarResultado, que es");
    N.push("  el camino del webhook, que es CU35. Y se cuentan aparte.");
    N.push("");
    N.push("  OJO CON UNO, porque parece del caso y no lo es: el L528 de crearVentaPresencial");
    N.push("  esta dentro de una transaction parecida a la del L250, pero es otro método y es");
    N.push("  la venta presencial. El que cuenta para este caso es el L250.");
    N.push("");
    N.push("  NO HAY NINGUN alt, y conviene decirlo con numeros: hay 70 if entre los dos");
    N.push("  servicios, y en el camino de este caso hay DOCE, y los doce son guardas. La");
    N.push("  modalidad, el método, el id del carrito, la pertenencia del carrito, el estado del");
    N.push("  carrito, el método de pago, el proveedor, el id de la venta, la pertenencia de la");
    N.push("  venta, el estado PENDIENTE, el estado de la transacción, y el resultado del pago.");
    N.push("");
    N.push("  Y las 3 barras de activación: la del controlador de ventas, la del servicio de");
    N.push("  ventas, y la del servicio de pagos. Esta vez SÍ hay barra en la base de datos,");
    N.push("  porque crearCompraDigital abre una transacción en L235, y es la primera vez en la");
    N.push("  serie que un caso de escritura tiene transacción Y un bucle de escritura dentro.");
    N.push("");
    N.push("EL HALLAZGO 1: EL SECRETO DE LA FIRMA ESTÁ ESCRITO EN EL CÓDIGO");
    N.push("");
    N.push("  L40, la línea entera:");
    N.push("");
    N.push("    const FIRMA_SECRETO =");
    N.push("      process.env.PAGO_WEBHOOK_SECRET ?? 'sandbox-secreto-cu35';");
    N.push("");
    N.push("  Hay una variable de entorno, que es lo correcto, Y UN VALOR POR DEFECTO escrito en");
    N.push("  el fuente. Si la variable no está definida en el despliegue, la firma HMAC se calcula");
    N.push("  con la cadena sandbox-secreto-cu35.");
    N.push("");
    N.push("  Y POR QUÉ ESO ES GRAVE: procesarWebhook es el ÚNICO endpoint de este caso SIN");
    N.push("  GUARD. No lleva @UseGuards, no pide sesión, no pide permiso. Es lo correcto para");
    N.push("  un webhook, porque la pasarela no tiene cuenta. Pero significa que lo único que");
    N.push("  distingue una notificación legítima de una falsificada es la firma.");
    N.push("");
    N.push("  Y SI EL SECRETO ESTÁ EN EL CÓDIGO, la firma se puede fabricar. Cualquiera que tenga");
    N.push("  el repositorio puede mandar un POST a /pagos/webhook con la firma correcta y");
    N.push("  marcar CUALQUIER transacción como Aprobada. Y el control del monto, L591, no ayuda:");
    N.push("  el monto sale de la propia base, L588, o sea que es un dato público.");
    N.push("");
    N.push("EL HALLAZGO 2: LA FIRMA SOLO CUBRE TRES CAMPOS");
    N.push("");
    N.push("  L101-105: createHmac('sha256', FIRMA_SECRETO).update(`${id}.${monto}.${estado}`)");
    N.push("");
    N.push("  Firma el id de la transacción, el monto y el estado. Y NO firma el id_usuario, ni");
    N.push("  el id_venta, ni el proveedor, ni la fecha.   O sea que la firma es REUTILIZABLE:");
    N.push("  la misma sirve siempre para el mismo id, monto y estado, y no caduca porque no");
    N.push("  lleva fecha. Con el secreto por defecto, el problema se multiplica por todas las");
    N.push("  instalaciones que no definan la variable.");
    N.push("");
    N.push("  Y LA COMPARACIÓN SÍ ESTÁ BIEN HECHA: firmasCoinciden, L107-112, usa");
    N.push("  timingSafeEqual y comprueba las longitudes antes, L110, porque timingSafeEqual de");
    N.push("  Node lanza si no coinciden.   Es el mismo patrón que CU20 y CU22: el efecto es");
    N.push("  correcto y el alcance está mal.");
    N.push("");
    N.push("EL HALLAZGO 3: NO HAY PASARELA, EL BANCO ES EL PROPIO PROYECTO");
    N.push("");
    N.push("  Tres piezas que juntas lo dicen:");
    N.push("");
    N.push("  1  L161: idTransaccionPasarela = 'SBX-' + randomUUID(). El identificador de la");
    N.push("     pasarela lo genera el servidor, con prefijo de sandbox.");
    N.push("  2  L200: checkout_url = FRONTEND_URL + /sandbox-pago?tx=N. La URL de pago es una");
    N.push("     PÁGINA DEL PROPIO FRONTEND, y FRONTEND_URL tiene default localhost:5173.");
    N.push("  3  L545: simularPasarela devuelve this.procesarWebhook( notificacion ). El simulador");
    N.push("     firma la notificación y se la pasa al webhook, o sea que el webhook se verifica");
    N.push("     a sí mismo.");
    N.push("");
    N.push("  Y LA PANTALLA, SandboxPago.tsx, 238 líneas, con tres botones: aprobar, rechazar y");
    N.push("  no responder. Quien compra decide si su pago se aprueba.");
    N.push("");
    N.push("  LO QUE ESTÁ BIEN, y es mucho: la pasarela simulada notifica con el MISMO formato");
    N.push("  que llegaría de una real, L537-543, y el monto sale de la base y no del cliente,");
    N.push("  L528. El comentario del autor, L526, dice que es una simulación para producción.");
    N.push("  O sea que cambiar a una pasarela de verdad es cambiar una pantalla.   Y el único");
    N.push("  punto de unión es FIRMA_SECRETO, que es justo el que está comprometido.");
    N.push("");
    N.push("EL HALLAZGO 4: EL CUARTO CASO DEL MISMO BUG DE PERMISO");
    N.push("");
    N.push("  CU22 pide gestionar_reservas, CU24 pide consultar_catalogo, y CU25 y CU26");
    N.push("  piden realizar_venta.   Y el Cliente tiene reservar, ver_catalogo y comprar.   Los");
    N.push("  cuatro permisos que el Cliente sí tiene para esto no los comprueba NADIE.");
    N.push("");
    N.push("  Y EN ESTE CASO HAY CUATRO MÉTODOS QUE PIDEN EL MISMO PERMISO: exigirPermisoVenta,");
    N.push("  exigirPermisoRegistrarVenta, L77, exigirPermisoPagar, en Pagos L76, y exigirPermisoCaja, en Pagos L83,");
    N.push("  que se llama caja y no pide permiso de caja.   Cuatro nombres, una sola condición, y el mismo rol");
    N.push("  que no lo tiene.   Y como el Cliente no puede comprar, tampoco puede pagar.");
    N.push("");
    N.push("  Y el mensaje de L73 dice 'No tienes permisos para comprar', que es exactamente lo");
    N.push("  que la persona quiere hacer. Como en CU25: el texto bien y la condición mal.");
    N.push("");
    N.push("EL HALLAZGO 5: EL CANDADO SIN TRANSACCIÓN Y SIN ÍNDICE");
    N.push("");
    N.push("  crearTransaccion, L151-157, hace SELECT id_transaccion FROM");
    N.push("  transacciones_pago WHERE id_venta = $1 LIMIT 1, y si hay algo lanza 409. Diez");
    N.push("  líneas después, L163, inserta.   O sea que es un candado sin candado: dos pulsos a");
    N.push("  la vez crean dos transacciones de la misma venta, porque los dos SELECT llegan");
    N.push("  antes de que ninguna escriba.");
    N.push("");
    N.push("  Y transacciones_pago NO TIENE NINGÚN ÍNDICE. Y ventas tiene uno solo, L564: sobre");
    N.push("  (id_sucursal, fecha_venta). O sea que la consulta de L152 es un seq scan, y la de");
    N.push("  L137 también, porque busca por id_venta. Y la de id_usuario, que es la que usa la");
    N.push("  pantalla de CU38, tampoco tiene índice.   El mismo bug de CU22 en las dos tablas");
    N.push("  nuevas: el índice está en la columna que se busca para los ADMINISTRADORES.");
    N.push("");
    N.push("    N.push('  ventas              VARCHAR(20) DEFAULT 'Completada'   sin CHECK')");
    N.push("    N.push('  carritos            VARCHAR(20) DEFAULT 'Activo'      sin CHECK')");
    N.push("    N.push('  transacciones_pago  VARCHAR(20) DEFAULT 'Pendiente'  sin CHECK')");
    N.push("    N.push('  sesiones_ra         resultado VARCHAR(20)             sin CHECK')");
    N.push("    N.push('  resultados_prueba   resultado VARCHAR(20)             sin CHECK')");
    N.push("    N.push('  reservas            VARCHAR(20) DEFAULT 'Solicitada' sin CHECK')");
    N.push('');
    N.push('  SEIS tablas con su estado en un VARCHAR de 20 caracteres, y CERO CHECK en las seis. El estado de');
    N.push('  una venta es una cadena libre, y lo único que la acota son los if del TypeScript.');
    N.push('');
    N.push('  Y CON UN DETALLE, porque hay que corregirse a uno mismo: la primera versión de este hallazgo decía');
    N.push('  CERO CHECK en todo el esquema. ES FALSO: hay UNO, y está en la tabla hermana.');
    N.push('');
    N.push("    N.push('    carrito_items L294  cantidad INTEGER NOT NULL CHECK (cantidad > 0)')");
    N.push("    N.push('    reserva_items L362  cantidad INTEGER DEFAULT 1               SIN CHECK')");
    N.push('');
    N.push('  El proyecto tiene un solo CHECK en todo el esquema, y lo puso en la tabla del carrito de CU25. La');
    N.push('  tabla de la reserva, que es su gemela, no lo tiene. Las dos son la misma tabla con otro prefijo.');
    N.push("");
    N.push("  ventas              VARCHAR(20) DEFAULT 'Completada'   sin CHECK");
    N.push("  carritos            VARCHAR(20) DEFAULT 'Activo'      sin CHECK");
    N.push("  transacciones_pago  VARCHAR(20) DEFAULT 'Pendiente'  sin CHECK");
    N.push("  sesiones_ra         VARCHAR(20)                     sin CHECK");
    N.push("  resultados_prueba   resultado VARCHAR(20)           sin CHECK");
    N.push("  reservas            VARCHAR(20) DEFAULT 'Solicitada' sin CHECK");
    N.push("");
    N.push("  Y EL DEFAULT DE ventas ES PELIGROSO: los dos únicos INSERT del proyecto ponen el");
    N.push("  estado a mano, L240 y L518, así que 'Completada' no lo usa nadie. Pero una venta");
    N.push("  que nace Completada es una venta COBRADA sin que nadie haya cobrado.   Un default");
    N.push("  razonable sería NULL o 'Pendiente'.");
    N.push("");
    N.push("EL HALLAZGO 7: UN CARRITO ABANDONADO BLOQUEA EL CHECKOUT PARA SIEMPRE");
    N.push("");
    N.push("  Este caso mueve el estado de TRES tablas, y deja el carrito en dos estados que");
    N.push("  ningún otro caso conoce:");
    N.push("");
    N.push("    En pago           Ventas L260");
    N.push("    Convertido a venta   Pagos L701",
    "");
    N.push("  Y si el cliente cierra la pestaña del sandbox a medias, el carrito se queda en");
    N.push("  'En pago' y NO HAY NINGÚN CAMINO en el proyecto que lo devuelva a 'Activo'. Los");
    N.push("  dos únicos UPDATE de carritos en Pagos y Ventas van hacia delante, nunca atrás.");
    N.push("");
    N.push("  Y NO HAY TAREA QUE LO LIMPIE: cero llamadas a un método de expiración, cero");
    N.push("  temporizador de pago en el servidor, y el 'no_responde' del sandbox devuelve un");
    N.push("  504, que es una petición que falla, no un carro que se limpia.   O sea que el");
    N.push("  cliente no puede volver a comprar con ese carrito.");
    N.push("");
    N.push("  Y LA COMPARACIÓN CON EL RESTO: CU21 tiene su transacción y su FOR UPDATE, CU25 no");
    N.push("  tiene ni una, y este tiene dos. La calidad de la transacción sube y baja por");
    N.push("  módulo, no por caso.");
    N.push("");
    N.push("LO BUENO, Y ES EL MEJOR DEL PROYECTO EN CONCURRENCIA");
    N.push("");
    N.push("  1. LA COMPARACIÓN DE LA FIRMA USA timingSafeEqual, L111, Y COMPRUEBA LAS");
    N.push("     LONGITUDES ANTES, L110, porque timingSafeEqual de Node lanza si no coinciden.");
    N.push("     Esa función la escribió alguien que sabe lo que hace.");
    N.push("");
    N.push("  2. Y EL MONTO SALE DE LA BASE, L159, con venta.total, y no de lo que dice el");
    N.push("     cliente. O sea que el cliente no puede decidir cuánto paga. Y la moneda va");
    N.push("     hardcodeada a 'BOB' en el INSERT, L168, en vez de venir del dto.");
    N.push("");
    N.push("  3. Y EL CONTROL DEL MONTO ES UN COMPARE-AND-SET, L591-594: el UPDATE lleva WHERE");
    N.push("     id_transaccion = $1 AND estado = 'Pendiente'. Si llegan dos webhooks a la vez,");
    N.push("     solo el primero actualiza, y el segundo se queda con la respuesta idempotente");
    N.push("     de L578-586. Es lo que CU19 no hacía con sus veinte productos, y lo que CU21");
    N.push("     hacía con el FOR UPDATE. Aquí se hace de otra forma, y también funciona.");
    N.push("");
    N.push("  4. Y LA TRANSACCIÓN DEL FLUJO FELIZ ABRE Y CIERRA LOS TRES ESTADOS, L647, L691,");
    N.push("     L696 y L701: pago Aprobado, venta Completada y carrito Convertido a venta. Tres");
    N.push("     tablas en una transacción. Y el pago mueve el stock, por el trigger de L654.");
    N.push("");
    N.push("  5. Y EL IDEMPOTENTE ESTÁ PENSADO, L576-586, con un comentario que explica POR QUÉ,");
    N.push("     y devuelve el estado actual en vez de reprocesar. Un webhook repetido, que es lo");
    N.push("     normal en una pasarela, no rompe nada.");
    N.push("");
    N.push("  6. Y LAS LISTAS BLANCAS SON CUATRO, L36-39: METODOS_PAGO, PROVEEDORES,");
    N.push("     METODOS_PAGO_CAJA y PROVEEDORES_CAJA. La caja tiene las suyas, más cortas, y");
    N.push("     las digitales las suyas. Y el proveedor se pasa a mayúsculas antes de comparar,");
    N.push("     L130, para que 'libelula' y 'LIBELULA' sean lo mismo.");
    N.push("");
    N.push("  7. Y LOS 404 CON EL MISMO TEXTO, L144-146 y L514-516, y el 401 con 'Firma inválida.'");
    N.push("     para la firma que no cuadra, que es el código HTTP correcto. CU22 y CU24 lo");
    N.push("     hicieron bien, CU25 no, y esta es la tercera vez que sale bien.");
    N.push("");
    N.push("SOBRE LA COLOCACIÓN DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Anchura: las diez cabeceras separadas " + PASO + " px, con " + ANCHO_CAB + " de ancho. Quedan");
    N.push("  65 px entre una y otra. Altura: " + PASO_MSG + " px por mensaje. El mensaje 1 cae en la y " + Y_MSG0);
    N.push("  y el " + TOTAL_MSG + " en la y " + (Y_MSG0 + (TOTAL_MSG - 1) * PASO_MSG) + ".");
    N.push("");
    N.push("  Un detalle que hizo fallar estos diagramas dieciseis veces y que conviene no");
    N.push("  olvidar: EA guarda Top y Bottom en NEGATIVO, porque trabaja en coordenadas");
    N.push("  cartesianas con la Y creciendo hacia arriba. Si se le pasa la Y en positivo no da");
    N.push("  error, simplemente no coloca nada y todos los objetos se quedan en el mismo");
    N.push("  punto. En las dos funciones de colocación de este script está escrito o.Top = 0 - y");
    N.push("  y o.Bottom = 0 - y - alto. En el AddNew, en cambio, la Y va en positiva, porque ahí");
    N.push("  EA ya la convierte.");
    N.push("");
    N.push("  Comprobación de esta ejecución, leída del modelo de objetos:");
    N.push("    objetos en el diagrama: " + ch.leidos);
    N.push("    con la Y crecida, o sea colocados: " + ch.bien);
    N.push("    mensajes dibujados: " + r.puestos + " de " + TOTAL_MSG);
    N.push("    mensajes a sí mismo: " + r.autodestino);
    N.push("    conectores en el diagrama: " + r.enDiagrama);
    N.push("    MARCOS de fragmento colocados: " + MARCOS_PUESTOS + " de 2");
    N.push("    BARRAS de activación colocadas: " + BARRAS_PUESTAS + " de 3");
    try { diag.Notes = N.join(SALTO); diag.Update(); } catch (e) { }
}
// ---------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------

function main() {
    var raiz = buscarPaquete(RAIZ, RAIZ_NOMBRE);
    if (raiz == null) raiz = RAIZ;
    var paq = subPaquete(raiz, PAQ_NOMBRE);
    if (paq == null) {
        ERRORES.push("no se pudo crear el paquete " + PAQ_NOMBRE);
        return;
    }

    for (var d = paq.Diagrams.Count - 1; d >= 0; d--) {
        try { paq.Diagrams.GetAt(d).Delete(); } catch (e) { }
    }
    try { paq.Diagrams.Refresh(); } catch (e) { }

    var C = crearCabeceras(paq);
    INFORME.push("cabeceras creadas: " + clavesPresentes(C) + " de " + TOTAL_CAB);

    var diag = null;
    var tipoUsado = "";
    try { diag = paq.Diagrams.AddNew(DIAG_NOMBRE, DIAG_TIPO); } catch (e) { diag = null; }
    if (diag != null) tipoUsado = DIAG_TIPO;
    if (diag == null) {
        try { diag = paq.Diagrams.AddNew(DIAG_NOMBRE, "Class"); } catch (e) { diag = null; }
    }
    if (diag != null) tipoUsado = "Class";
    if (diag == null) {
        ERRORES.push("no se pudo crear el diagrama");
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU24 Secuencia", 0); } catch (e) { }
        return;
    }
    INFORME.push("tipo de diagrama: " + tipoUsado);
    if (tipoUsado != DIAG_TIPO) ERRORES.push("el diagrama es de tipo " + tipoUsado + " y no " + DIAG_TIPO + ": las líneas de vida no se verán");
    diag.Update();
    try { paq.Diagrams.Refresh(); } catch (e) { }

    borrarTodo(diag);
    colocarCabeceras(diag, C);
    tituloYLeyenda(diag);
    var h1 = colocarHallazgos(diag, paq);
    diag = guardarYRecargar(diag);

    borrarTodo(diag);
    colocarCabeceras(diag, C);
    tituloYLeyenda(diag);
    var h2 = colocarHallazgos(diag, paq);
    if (h1.total != h2.total) ERRORES.push("los hallazgos no se colocan igual en las dos pasadas");
    INFORME.push("hallazgos colocados: " + h2.total + " de " + TOTAL_HAL);

    diag = guardarYRecargar(diag);

    var r = dibujarMensajes(diag, C);
    diag = guardarYRecargar(diag);

    if (MARCOS_PUESTOS == 0 && BARRAS_PUESTAS == 0) colocarFragmentos(diag);
    diag = guardarYRecargar(diag);

    var ch = comprobar(diag);
    INFORME.push("objetos: " + ch.leidos + ", colocados: " + ch.bien);
    INFORME.push("primeras coordenadas: " + ch.muestra);

    notasDelDiagrama(diag, r, h2, ch);

    var T = [];
    T.push("CU24 - DIAGRAMA DE SECUENCIA - INFORME");
    T.push("");
    T.push("Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB);
    T.push("Tipo de diagrama: " + tipoUsado);
    T.push("Mensajes: " + r.puestos + " de " + TOTAL_MSG);
    T.push("Mensajes a sí mismo: " + r.autodestino);
    T.push("Conectores en el diagrama: " + r.enDiagrama);
    T.push("Hallazgos: " + h2.total + " de " + TOTAL_HAL + ", banda hasta la y " + h2.fin);
    T.push("");
    T.push("AVISO DE NUMERACIÓN");
    T.push("Este caso es CU24 en el documento y CU32 en el código, y el título");
    T.push("COINCIDE EXACTO. Tres endpoints: historial, crear y resultado.");
    T.push("");
    T.push("MARCOS Y BARRAS  <-- MIRA ESTO");
    T.push("Este caso tiene 2 loop y NINGUN alt. Contado antes de dibujar con");
    T.push("contadores, por separado en las dos mitades del caso:");
    T.push("  SRV_SesionesRaService.ts, 367 líneas");
    T.push("    for 0   while 0   Promise.all 0   continue 0   reduce 0   map 1");
    T.push("    if 19   throw 13   ternarios 24");
    T.push("    dataSource.query 10   em.query 0   transaction 0   try 0   catch 0");
    T.push("  VestidorRa.tsx, 1110 líneas");
    T.push("    for 3   while 1   Promise.all 0   map 0");
    T.push("    useState 19   useEffect 6   useRef 11   useCallback 7");
    T.push("    try 4   catch 9   requestAnimationFrame 7   setTimeout 0");
    T.push("El servicio NO tiene ni un bucle. Los 4 loop del caso están TODOS");
    T.push("en el cliente y son el relleno por inundación del motor:");
    T.push("  L130  for x: siembra la fila de arriba y la de abajo");
    T.push("  L134  for y: siembra la columna izquierda y la derecha");
    T.push("  L149  for...of: las cuatro esquinas");
    T.push("  L162  while: el relleno por inundación píxel a píxel");
    T.push("Por eso los 4 marcos van en la parte izquierda, en la lifeline");
    T.push("del cliente, y no en el backend.");
    T.push("Fragmentos colocados: " + MARCOS_PUESTOS + " de 2");
    T.push("Barras de activación colocadas: " + BARRAS_PUESTAS + " de 3");
    if (MARCOS_PUESTOS < 4 || BARRAS_PUESTAS < 2) {
        T.push("  Si alguno sale a 0, EA no ha aceptado la forma y hay que");
        T.push("  dibujarlo a mano en el diagrama.");
    } else {
        T.push("  Los 6 han salido. Son FORMAS dibujadas por script, no");
        T.push("  fragmentos nativos de EA.");
    }
    T.push("");
    T.push("COLOCACIÓN");
    T.push("Objetos en el diagrama: " + ch.leidos);
    T.push("Con la Y crecida, o sea colocados: " + ch.bien + " de " + ch.leidos);
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
    msg = msg + "CU24 - Usar Vestidor Virtual con Realidad Aumentada" + SALTO;
    msg = msg + "Diagrama de secuencia, sección 3.3.2.1." + SALTO;
    msg = msg + "En el código del proyecto este caso es CU32, y el título" + SALTO;
    msg = msg + "COINCIDE EXACTO." + SALTO + SALTO;
    msg = msg + "10 líneas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "4 loop, TODOS en el cliente, y NINGUN alt." + SALTO;
    msg = msg + "Son el relleno por inundación de VestidorRa.tsx: L130," + SALTO;
    msg = msg + "L134, L149 y L162. El servicio, con 367 líneas, no tiene" + SALTO;
    msg = msg + "ni un bucle ni una transacción." + SALTO;
    msg = msg + "FRAGMENTOS colocados: " + MARCOS_PUESTOS + " de 4." + SALTO;
    msg = msg + "BARRAS colocadas: " + BARRAS_PUESTAS + " de 2." + SALTO;
    if (MARCOS_PUESTOS < 4 || BARRAS_PUESTAS < 2) msg = msg + "  Si falta alguno, hay que dibujarlo a mano." + SALTO;
    msg = msg + SALTO;
    msg = msg + "HALLAZGO GRAVE: la columna foto_resultado NO EXISTE en el" + SALTO;
    msg = msg + "esquema, y se nombra en 5 ficheros y 12 sitios. Se inserta" + SALTO;
    msg = msg + "en L158 y se lee en L326, con CERO ALTER TABLE en todo el" + SALTO;
    msg = msg + "proyecto. Así que 2 de los 3 endpoints fallan: el historial" + SALTO;
    msg = msg + "y el de crear. Solo sobrevive el del resultado." + SALTO + SALTO;
    msg = msg + "Y pide consultar_catalogo, L60, pero el rol Cliente del" + SALTO;
    msg = msg + "seed, L577, tiene ver_catalogo. Dos nombres para lo mismo y" + SALTO;
    msg = msg + "el cliente tiene el que nadie pide. CU41 también." + SALTO + SALTO;
    msg = msg + "Y NO ES REALIDAD AUMENTADA: no hay Three.js, ni WebXR, ni" + SALTO;
    msg = msg + "MediaPipe, ni A-Frame. Es un flood fill con tolerancia de" + SALTO;
    msg = msg + "color. Y modelo_3d_url existe y el frontend no lo usa." + SALTO + SALTO;
    msg = msg + "Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACIÓN: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU24 Secuencia", 0); } catch (e) { }
}

try {
    main();
} catch (e) {
    try {
        var raiz2 = buscarPaquete(RAIZ, RAIZ_NOMBRE);
        var p2 = null;
        if (raiz2 != null) p2 = buscarPaquete(raiz2, PAQ_NOMBRE);
        if (p2 != null) {
            p2.Notes = "ERROR NO CONTROLADO: " + String(e) + SALTO + SALTO + INFORME.join(SALTO);
            p2.Update();
        }
    } catch (e2) { }
    try { Repository.ShowMessage("Error: " + String(e), "CU24 Secuencia", 0); } catch (e3) { }
}
