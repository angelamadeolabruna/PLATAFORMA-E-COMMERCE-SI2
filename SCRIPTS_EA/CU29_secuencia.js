// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU29  Procesar Pago en Caja
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/router.tsx                            L81, caja
//     web/src/pages/admin/AdminCaja.tsx             713 lineas
//     web/src/lib/api.ts                            L1903-1934
//     api/src/modulos/seguridad/dependencias.ts     JwtAuthGuard
//     api/src/modulos/pagos/CTR_Pagos.ts            L20-34, L97-112
//     api/src/modulos/pagos/SRV_PagosService.ts     784 lineas
//     api/src/modulos/ventas/CTR_Ventas.ts          L93-108
//     api/src/modulos/ventas/SRV_VentasService.ts   L396-560
//     api/src/modulos/comprobantes/SRV_ComprobantesService.ts
//     BASE DE DATOS/schema.sql   L302-311, L384-405, L440-453
//
// QUE HACE ESTE CASO
//   Un endpoint, y con una bifurcacion que cambia TODO lo que
//   devuelve:
//
//     POST /api/v1/pagos/caja   CTR_Pagos L97, con JwtAuthGuard
//
//   Y SON DOS CASOS DENTRO DE UNO:
//
//     1  EFECTIVO.  Se abre una transaccion, se bloquea la venta y
//        el stock, se cobra, se descuenta el inventario por el
//        trigger, se emite el comprobante y se devuelve
//        Completada con el vuelto.   Todo en el MISMO request.
//
//     2  TARJETA, QR O TRANSFERENCIA.  NO hay transaccion, NO hay
//        bloqueo, NO se toca el inventario y NO se emite
//        comprobante.  Se inserta una transaccion en Pendiente y
//        se devuelve una terminal_url que APUNTA AL SANDBOX DEL
//        PROPIO FRONTEND, L442.   O sea que este caso deja el pago
//        a medias y se lo pasa a CU35.
//
//   58 mensajes. 10 lineas de vida. 8 hallazgos.
//   4 fragmentos: un alt y tres loop. Explicado mas abajo.
//
// LOS FRAGMENTOS: UN alt Y TRES loop
//   Contado ANTES de dibujar, con contadores, sobre las 784 lineas
//   de SRV_PagosService:
//
//     for 6   while 0   Promise.all 0   continue 2   map 0
//     filter 0   reduce 0   ternarios 10
//     if 40   throw 29   NotFoundException 8   ConflictException 9
//     dataSource.query 13   em.query 15   transaction 2
//     try 1   catch 1   bitacora 9   FOR UPDATE 4
//
//   Y DE LOS 6 for, LOS TRES DE ESTE CASO SON LOS DE
//   procesarPagoCaja, y ESTAN SEGUIDOS, DEL 296 AL 350:
//
//     LOOP 1  L296  for ( const item of items )
//             L297-305  un SELECT con FOR UPDATE por prenda
//             y L306 apila el resultado en un array
//
//     LOOP 2  L309  for ( const item of stocks )
//             L312-316  comprueba el stock que YA se leyo y YA esta
//             bloqueado en el loop 1
//
//     LOOP 3  L336  for ( const item of stocks )
//             L339-344  UPDATE de cantidad_vendida
//             L345-349  INSERT del movimiento, que dispara el trigger
//
//   Y LOS OTROS 3 for, L667, L680 y L706, son de procesarResultado,
//   que es CU35. Se cuentan aparte.
//
//   O SEA QUE ESTE CASO TIENE TRES BUCLES, Y ESTAN SOLO EN EL
//   CAMINO DE EFECTIVO.   El camino de tarjeta, QR y transferencia,
//   L399-447, no tiene ni un bucle ni una transaccion.   O sea que
//   las dos ramas del alt tienen una calidad de codigo distinta, y
//   eso se ve en el diagrama: una tiene tres bucles y la otra
//   ninguno.
//
// EL alt, Y POR QUE ESTE SI Y EN CU35 NO
//   Un alt de verdad es una decision con DOS CAMINOS EXCLUYENTES
//   que hacen cosas distintas.   Aqui la hay, en L265:
//
//     if (metodo === 'Efectivo') { ... 131 lineas ... return }
//
//   Una rama abre transaccion, bloquea dos filas, toca el
//   inventario, emite comprobante y devuelve Completada.   La otra
//   mete una fila y devuelve una URL.   No es un error ni un
//   guardado: son dos negocios distintos.   POR ESO ESTE CASO
//   TIENE UN alt.
//
//   Y EN CU35 NO LO HAY, y el contraste es util: los tres caminos
//   de procesarResultado, L518, L522 y L545, son tres throw y un
//   return CONSECUTIVOS del mismo if.   Son tres formas de
//   terminar con error o con exito, no dos mitades de una decision.
//   Un alt ahi seria mentira.   Aqui en cambio, las dos ramas
//   hacen trabajo de verdad y una deja la venta a medias.
//
//   Y LA RAMA DEL alt QUE LLEVA LOS TRES loop ES LA DE EFECTIVO, y
//   por eso los cuatro marcos se anidan en el mismo lifeline.
//
// LAS 3 BARRAS: la del controlador de pagos, la del servicio de
//   pagos, y la del servicio de comprobantes, que se llama al final
//   del camino de efectivo y por eso tiene la suya.
//
// LA Y EN NEGATIVO, QUE ES LO QUE HACE FALLAR ESTOS DIAGRAMAS
//   EA guarda Top y Bottom en NEGATIVO, porque trabaja en
//   coordenadas cartesianas con la Y creciendo hacia arriba. Si se
//   le pasa la Y en positivo no da error: simplemente no coloca
//   nada, y todos los objetos se quedan en el mismo punto. El
//   diagrama sale amontonado.
//
//   Por eso en las dos funciones de colocacion de este script:
//
//     o.Top    = 0 - y;
//     o.Bottom = 0 - y - alto;
//
//   Y en el AddNew, en cambio, la Y va en POSITIVA, porque ahi EA ya
//   la convierte por su cuenta.
//
// LOS MARCOS DICEN SOBRE QUE ELEMENTO ESTAN
//   La pestaña de cada fragmento lleva tres lineas: el tipo, el
//   elemento al que pertenece, y la condicion.   Y el elemento se
//   saca de las coordenadas del marco, no esta escrito a mano, asi
//   que no puede desincronizarse del lifeline.
//
// SIN NINGUNA LLAMADA A SQL
//   Todo se coloca con el modelo de objetos. Nada de ExecuteSQL,
//   Execute ni SQLQuery.
//
// Autorreparable. Una instruccion por linea. Sin continuaciones con
// +. Sin operadores ternarios. Ninguna excepcion escapa.
// ================================================================

var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var TOTAL_CAB = 10;
var TOTAL_MSG = 58;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU29 Secuencia Pago en Caja";
var DIAG_NOMBRE = "CU29 Pago en Caja";
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
    ["U", "ACTOR_Cajero", "Actor", "Lifeline", "Cajero", "quien cobra en la tienda", "Actor, no clase: es la persona en el mostrador", "no es codigo, es la persona. Y es el unico actor de la serie con permiso propio: realizar_venta, que el Cliente NO tiene"],
    ["X", "AdminCaja.tsx", "Object", "Lifeline", "AdminCaja", "713 lineas, la pantalla", "Boundary", "web/src/pages/admin/AdminCaja.tsx, 713 lineas. L230 procesarVenta, y L246 y L262 los DOS_llamados a procesarPagoCaja, uno por rama"],
    ["H", "api.ts", "Object", "Lifeline", "api", "seccion CU37", "Boundary", "web/src/lib/api.ts, L1903 la seccion y L1904-1934 el metodo. Su tipo de retorno es un UNION de dos formas distintas, L1909-1927"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "en los 2 endpoints", "Control", "api/src/modulos/seguridad/dependencias.ts. L99 lo lleva el de la caja y L95 el de la venta presencial"],
    ["V", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "2 DTO distintos", "Control", "api/src/main.ts, L22-43, y los DTO de CTR_Pagos L20-34 y de CTR_Ventas L40-73"],
    ["C", "CTR_Pagos", "Object", "Lifeline", "PagosController", "156 lineas, el endpoint de caja", "Control", "api/src/modulos/pagos/CTR_Pagos.ts, L97-112. Y el de la venta presencial esta en OTRO controlador, CTR_Ventas L93-108"],
    ["P", "SRV_PagosService", "Object", "Lifeline", "PagosService", "784 lineas, 3 bucles AQUI", "Control", "api/src/modulos/pagos/SRV_PagosService.ts. L208 procesarPagoCaja, hasta L448. EL alt Y LOS TRES BUCLES DEL CASO SON L265, L296, L309 Y L336, EN ESTE ELEMENTO"],
    ["S", "SRV_VentasService", "Object", "Lifeline", "VentasService", "crearVentaPresencial, CU36", "Control", "api/src/modulos/ventas/SRV_VentasService.ts, L396-560. Entra antes que el cobro: sin su venta no hay nada que cobrar. Y tiene 2 bucles PROPIOS, L454 y L528, que son de CU36"],
    ["M", "SRV_ComprobantesService", "Object", "Lifeline", "ComprobantesService", "generar(), idempotente", "Control", "api/src/modulos/comprobantes/SRV_ComprobantesService.ts, y es el caso CU38. Se llama desde L356, FUERA de la transaccion, y SOLO en la rama de efectivo"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "4 tablas y un trigger", "Entity", "schema.sql: inventario_stock L302, ventas L384, venta_items L399 y transacciones_pago L440; y el trigger trg_movimiento_inventario, L654"]
];

var MSG = [
    [1, "U", "X", "1. entra a /admin/caja   router.tsx L81, DENTRO de AdminLayout, L65, que es el unico layout con guard de la sesion de administrador   O sea que este caso es el UNICO de la serie que no lo puede usar un cliente: hace falta un empleado con realizar_venta", "S"],
    [2, "X", "H", "2. GET del catalogo de la caja: buscarProductosPos, api.ts L1845 y L1880, con un retardo de 350 ms, L129-131, y L315-319 el filtro de p.estado = 'Activo' AND ptc.estado_stock <> 'Sin stock'   Y el LEFT JOIN de inventario_stock, L336, es por id_sucursal, o sea que el stock que ve el cajero es el de SU sucursal", "S"],
    [3, "H", "G", "3. con Authorization Bearer   Y aqui SI hay guard: @UseGuards(JwtAuthGuard) en CTR_Ventas L95 y en CTR_Pagos L99   O sea que este caso es el primero de la serie que lleva guard en los DOS endpoints, sin excepciones", "S"],
    [4, "G", "S", "4. y el primero de los dos servicios es el de VENTAS, no el de pagos   crearVentaPresencial( dto, request ), L396.   O sea que el cobro de la caja depende de un caso anterior, CU36: sin venta no hay nada que cobrar.   Y empieza exigiendo el permiso, L398, que es realizar_venta otra vez, L72", "A"],
    [5, "S", "D", "5. SELECT ue.sucursal_id FROM usuarios_empleados ue WHERE ue.usuario_id = $1 AND ue.fecha_baja IS NULL, L86-88, y otra vez en el servicio de pagos, L92, SIN el filtro de fecha_baja   O sea que el mismo concepto esta escrito dos veces con dos SQL distintos.   Volveremos a esto en el hallazgo 3", "S"],
    [6, "S", "D", "6. y carga las prendas del SELECT de L323-339, que trae precio_base, el precio_especial de producto_precios con su vigencia, L334-335, los DOS porcentajes de IVA, p.porcentaje_iva y cat.porcentaje_iva_default, L325, y el stock por id_sucursal, que es el LEFT JOIN de L336.   Consulta 2", "S"],
    [7, "S", "D", "7. y por cada prenda del carrito, L454, el calculo del precio y del IVA, L490-497: precioUnitario = precio_especial ?? precio_base, y tasa = porcentaje_iva del producto si es mayor que 0, o si no el de la categoria, L494   Este es el LOOP de CU36, no de este caso   Consulta 3", "S"],
    [8, "S", "D", "8. y valida el stock antes de cobrar, L480-488, con un 409 'Stock insuficiente de...' por prenda   O sea que aqui se compruebastock y NO se bloquea todavia: el bloqueo llega despues, en el servicio de pagos, y solo en la rama de efectivo", "A"],
    [9, "S", "S", "9. y abre su propia transaccion, L514, y con el otro LOOP de CU36, L528, mete un INSERT en venta_items por prenda, L530-532   Y en L517-520 el INSERT en ventas con la modalidad, el metodo_pago y los tres importes   Consulta 4", "S"],
    [10, "S", "H", "10. { id_venta, total, subtotal, impuestos, modalidad, ... }, L546-559   Y L541 lo dice en la bitacora: Venta presencial creada (venta #N) por Bs X   O sea que la venta nace PENDIENTE, y todavia no se ha cobrado nada", "A"],
    [11, "H", "X", "11. la respuesta   Y aqui ESTA LA BIFURCACION, y esta en el cliente, L244: if (metodoPago === 'Efectivo')   Y lo que hace es DISTINTO EN CADA RAMA, que es lo que hace que este caso tenga un alt de verdad", "A"],
    [12, "X", "X", "12. RAMA 1, efectivo.   Y antes de llamar al backend calcula el vuelto, L245: const recibido = Number(montoRecibido) > 0 ? Number(montoRecibido) : res.total   O sea que si el cajero no escribe nada manda el total, y si escribe poco lo manda igual de poco para que lo rechace el servidor", "S"],
    [13, "X", "H", "13. POST /api/v1/pagos/caja   api.ts L1928, seccion CU37 - Procesar Pago en Caja, L1903   Y el cuerpo son 3 campos, L1905-1908: id_venta, metodo_pago y monto_recibido.   O SEA QUE LA SEGUNDA LLAMADA NO LLEVA id_transaccion, porque todavia no existe", "S"],
    [14, "H", "G", "14. con Authorization Bearer otra vez   Y el guard, L99, y el ValidationPipe con ProcesarPagoCajaRequest, L20-34: id_venta con @IsInt, metodo_pago con @IsIn de los CUATRO valores con Efectivo, y monto_recibido opcional con @IsNumber   O sea que el DTO de la caja tiene un valor mas que el del sandbox de CU35", "S"],
    [15, "V", "C", "15. procesarPagoCaja( @Body() body, @Req() request, @UsuarioActual() currentUser ), L100-104, con @HttpCode(HttpStatus.OK) en L98   Y 200 y no 201, aunque el camino de tarjeta Inserta una fila nueva", "A"],
    [16, "C", "P", "16. procesarPagoCaja( usuario, dto, request ), L208, y este es el UNICO metodo de la serie que pide la sucursal del empleado, L214, antes de nada   Y el permiso, L213, es exigirPermisoCaja, que es OTRO metodo con el MISMO nombre de permiso: realizar_venta, L85", "A"],
    [17, "P", "D", "17. SELECT sucursal_id FROM usuarios_empleados WHERE usuario_id = $1 LIMIT 1, L92.   OJO: es el MISMO concepto que el de L86-88 del otro servicio, pero SIN el AND ue.fecha_baja IS NULL.   Y L95-97: [no hay fila, o la sucursal es nula] 403 con un texto que NO es el de este caso: No tienes permisos para procesar pagos en esta caja.   El de L92 deberia decir Tu usuario no esta asociado a una sucursal, que es lo que dice el otro.   Volveremos a esto en el hallazgo 3", "S"],
    [18, "P", "S", "18. y los cuatro guardas de la cabecera, que son los mismos cuatro de CU35 y con los mismos textos: L217-219 el id que no es un entero, 404 'Venta no encontrada.'; L221-224 el metodo que no esta en METODOS_PAGO_CAJA, 422; L226-232 el proveedor, y SOLO si el metodo no es Efectivo, 422 'Proveedor de pasarela inválido.'; y L229 contra PROVEEDORES_CAJA, que son dos, no tres", "A"],
    [19, "P", "D", "19. SELECT id_venta, id_usuario, id_sucursal, id_carrito, estado, total, modalidad FROM ventas WHERE id_venta = $1 LIMIT 1, L236-239   Consulta 2.   Y L243-245: [la venta no es de la sucursal de este empleado] 404 con el mismo texto de siempre   O sea que la pertenencia se comprueba por SUCURSAL, no por usuario, que es lo correcto para una caja", "S"],
    [20, "P", "S", "20. y L246-248: [el estado de la venta no es PENDIENTE] 409 'La venta ya fue cobrada.'   OJO CON ESE TEXTO: la venta todavia no se ha cobrado, esta en Pendiente.   El estado Pendiente significa creada, no cobrada, y el mensaje dice lo contrario", "A"],
    [21, "P", "D", "21. y la quinta guarda, y aqui esta el HALLAZGO 1: SELECT id_transaccion FROM transacciones_pago WHERE id_venta = $1 AND estado IN ('Pendiente', 'Aprobado') LIMIT 1, L251-253   Consulta 3.   El IN es lo que cambia todo, porque una transaccion RECHAZADA no bloquea.   Volveremos a esto", "A"],
    [22, "P", "P", "22. y calcula el vuelto y el faltante, L260-263: vuelto = montoRecibido - total, y faltante = total - montoRecibido, los dos redondeados a dos decimales, con Math.round(x * 100) / 100   Y el total sale de la base, L260, no de lo que dice la pantalla.   Es lo correcto: el cajero no puede decidir cuanto se cobra", "S"],
    [23, "P", "P", "23. y AQUI SE ABRE EL alt DEL CASO, en L265: if (metodo === 'Efectivo')   Y son 131 lineas de una rama y 49 de la otra, y hacen negocios distintos.   Una abre transaccion y termina el cobro; la otra deja la venta a medias", "A"],
    [24, "P", "S", "24. RAMA 1, efectivo.   Primero el sexto guarda, L266-270: [el monto recibido no es un numero, o falta dinero] 422 con el texto exacto: El monto recibido es insuficiente. Faltan Bs 50.00.   Y es el unico sitio del proyecto que dice al cajero CUANTO falta.   Volveremos a esto en el hallazgo 6", "S"],
    [25, "P", "P", "25. y genera el identificador externo, L272: const referenciaExterna = randomUUID(), del import de L13   Y declara dos variables fuera de la transaccion para poder devolverlas, L273-274, porque idTransaccion y numeroComprobante se llenan dentro del callback", "S"],
    [26, "P", "D", "26. y abre la transaccion, L276, y con ella el primer bloqueo: SELECT id_venta, id_sucursal, estado, id_carrito FROM ventas WHERE id_venta = $1 FOR UPDATE, L279   Consulta 4.   Y L283-285: [la venta ya no esta PENDIENTE] 409 'La venta ya fue cobrada.'   El MISMO mensaje y el mismo 409 que el de L247, tres lineas antes de la transaccion: la primera comprobacion es sin candado y la segunda con", "A"],
    [27, "P", "D", "27. y carga los items vendidos, L287-293: SELECT vi.id_ptc, vi.cantidad, vi.precio_unitario FROM venta_items vi WHERE vi.id_venta = $1 ORDER BY vi.id_venta_item ASC   Consulta 5.   O sea que el precio es el de la venta, L290, no el de catalogo de hoy.   El comprobante saldra con lo que se cobro", "S"],
    [28, "P", "P", "28. y aqui empieza el LOOP 1 DEL CASO, L296: for ( const item of items )   Y es el que hace el trabajo de verdad: L298-304 trae SELECT id_ptc, cantidad_disponible FROM inventario_stock WHERE id_ptc = $1 AND id_sucursal = $2 FOR UPDATE", "S"],
    [29, "P", "D", "29. vuelta 1, y el FOR UPDATE, L301-302: bloquea la fila de inventario_stock de ESA prenda hasta el final de la transaccion.   O sea que dos cobros a la vez de la MISMA prenda no se pueden pasar el stock: el segundo espera, y cuando entra ya ve el numero actualizado.   Es el TERCER for update de los cuatro del fichero, y el primero de los dos de este metodo, el otro es el de L279", "S"],
    [30, "P", "P", "30. vuelta 2, 3, hasta N: el mismo SELECT con FOR UPDATE por prenda, y L306 apila el resultado en el array stocks con ...(stock ?? { cantidad_disponible: 0 })   OJO: este SELECT, L299, trae SOLO cantidad_disponible.   No trae cantidad_reservada, que en el camino digital de CU35 si se leia.   Volveremos a esto en el hallazgo 4", "A"],
    [31, "P", "P", "31. y aqui empieza el LOOP 2 DEL CASO, L309: for ( const item de stocks ), y lo unico que hace es COMPARAR en memoria, L312: [disponible < cantidad] 409 con el texto 'El stock de este producto cambió. Disponible: N. No se puede completar la venta.', L314.   Es COPIA LITERAL del loop 2 de CU35, L680-688, y con las mismas dos lineas de weakness", "S"],
    [32, "P", "P", "32. y aqui esta el HALLAZGO 2: este bucle comprueba el MISMO dato que el anterior ya leyo y ya bloqueo.   El loop 1 de L299 trae cantidad_disponible y lo apila.   El loop 2 de L311 lo lee del array.   O sea que la validacion de stock se hace DOS veces, y la segunda no puede encontrar nada que la primera no hubiera visto   Y estan separados por CERO lineas de logica", "S"],
    [33, "P", "D", "33. y con la validacion pasada, las DOS escrituras de estado: INSERT INTO transacciones_pago ( id_venta, id_usuario, proveedor_pasarela, monto, moneda, metodo, estado, referencia_externa, id_transaccion_pasarela, fecha_hora ) VALUES ( $1, $2, 'CAJA', $3, 'BOB', 'Efectivo', 'Aprobado', $4, NULL, NOW() ) RETURNING id_transaccion, L321-325   Y aqui esta el HALLAZGO 5: el proveedor se escribe como 'CAJA', un valor que NO esta en PROVEEDORES_CAJA, que son LIBELULA y STRIPE.   Consulta 6", "A"],
    [34, "P", "S", "34. y L329-331: [el INSERT no devolvio fila] throw new Error( 'No se pudo registrar el pago en caja.' )   O SEA QUE ES UN Error DESNUDO, no una excepcion de Nest.   Un Error desnudo sale como 500 con el stack trace, no como un 409 ni como un 422.   Volveremos a esto en el hallazgo 7", "A"],
    [35, "P", "D", "35. y UPDATE ventas SET estado = 'Completada' WHERE id_venta = $1, L334, SIN la condicion de estado en el WHERE.   O sea que la caja NO hace compare-and-set en la venta, y CU35 si lo hacia en la transaccion, L594 y L621.   Consulta 7", "S"],
    [36, "P", "P", "36. y aqui empieza el LOOP 3 DEL CASO, L336: for ( const item de stocks ), con el continue de L338 si la cantidad es 0 o menos   Y este es el que toca el inventario de verdad", "S"],
    [37, "P", "D", "37. vuelta 1: UPDATE inventario_stock SET cantidad_vendida = cantidad_vendida + $2 WHERE id_ptc = $1 AND id_sucursal = $3, L340-342.   Y vuelta 2: INSERT INTO movimientos_inventario ( id_ptc, id_sucursal, tipo_movimiento, cantidad, referencia, id_usuario, id_venta ) VALUES ( $1, $2, 'Venta', $3, $4, $5, $6 ), L346-347, con la cantidad NEGATIVA, L348, y la referencia VNT-NNN.   Consulta 8", "S"],
    [38, "D", "D", "38. y aqui se dispara el trigger trg_movimiento_inventario, L654, un BEFORE INSERT FOR EACH ROW.   Y su funcion, fn_aplicar_movimiento_inventario, L628-652: L645-648 el INSERT en inventario_stock con ON CONFLICT ( id_ptc, id_sucursal ) DO UPDATE SET cantidad_disponible = inventario_stock.cantidad_disponible + NEW.cantidad   Como la cantidad es negativa, RESTA.   O sea que el stock baja sin que nadie lo escriba a mano, igual que en CU35", "A"],
    [39, "P", "P", "39. fin del loop 3, y COMMIT, L351.   O sea que los tres bucles del caso, y las cinco escrituras del camino de efectivo, estan en la misma transaccion y se deshacen juntas", "A"],
    [40, "P", "P", "40. y aqui FUERA de la transaccion: registrarPreferenciasDeVenta( idVenta, idUsuario, request ), L353.   Y es el MISMO metodo con try/catch PROPIO de CU35, L763-783, con el mismo comentario en L781.   O sea que la caja y el digital comparten el metodo entero, y por eso el cobro de la caja no puede tumbar el pago por un extra de CU41", "A"],
    [41, "P", "M", "41. y comprobantesService.generar( idVenta, idUsuario, request ), L356, con el comentario de L355 que dice que generar es idempotente.   Es CU38, y sale FUERA de la transaccion, igual que en CU35.   Y SOLO en esta rama: el camino de tarjeta no emite comprobante", "S"],
    [42, "M", "D", "42. INSERT en comprobantes con el numero, que es UNIQUE, L411, y el NIT y la razon social que el cajero metio en L240-241 de AdminCaja   Y devuelve el numero, que es lo que sale en la respuesta", "S"],
    [43, "P", "P", "43. y las DOS ultimas escrituras, que son las dos bitacoras, L359-377 y L378-387, las dos FUERA de la transaccion y las dos con oldData REAL.   La primera, L361, es INSERT sobre transacciones_pago, con newData de siete campos y vuelto incluido, L367-376.   Y su mensaje, L363, dice: Pago en efectivo (CAJA) registrado para la venta #N por Bs X. Vuelto Bs Y", "S"],
    [44, "P", "H", "44. { id_venta, estado: 'Completada', metodo_pago: 'Efectivo', monto, vuelto, numero_comprobante }, L389-396, y con el vuelto a cero si sale negativo, L394   O sea que la respuesta de la rama 1 NO lleva id_transaccion, y la de la rama 2 si.   Dos formas distintas para el mismo endpoint", "A"],
    [45, "H", "X", "45. la respuesta   Y AdminCaja la comprueba, L251: [el estado no es Completada] throw new Error( 'No se pudo completar el cobro.' )   O sea que la pantalla tiene una comprobacion propia del resultado del servidor, y es la unica parte del caso que no es un mensaje.   Volveremos a esto en el hallazgo 6", "A"],
    [46, "X", "U", "46. y el cajero ve: Venta cobrada, L655, el total, L658, y el vuelto en verde, L661-664, con el texto Vuelto para el cliente   Y el numero de comprobante, L666-669, y los dos botones, L673-687: Imprimir y Descargar PDF, que llaman a consultarYImprimir y a consultarYDescargar, L295 y L306, y que abren el PDF del comprobante", "A"],
    [47, "U", "U", "47. RAMA 1 TERMINADA.   Y aqui esta el hallazgo MAS BUENO del caso, y es lo que CU35 no tiene: la caja se cierra entera en un solo request.   Se cobra, se descuenta el stock, se emite el comprobante y se devuelve el vuelto.   No hay nada pendiente, nadie tiene que hacer nada mas y el cajero puede cobrar al siguiente", "A"],
    [48, "X", "H", "48. y aqui empieza la RAMA 2 del alt: tarjeta, QR o transferencia   AdminCaja L262-266 hace la misma llamada pero con proveedor_pasarela y SIN monto_recibido   O sea que la misma pantalla, el mismo boton y el mismo endpoint, y lo unico que cambia es que se omite un campo", "A"],
    [49, "H", "G", "49. POST /api/v1/pagos/caja otra vez, con los mismos dos guards de los mensajes 14 y 15   Y el MISMO DTO, con el mismo @IsIn de cuatro metodos y el mismo @IsIn de dos proveedores de L32.   O sea que las dos ramas del alt pasan por el mismo camino de entrada y el mismo controlador", "A"],
    [50, "P", "P", "50. y vuelve a pasar los mismos seis guardas del mensaje 18 y por la misma consulta del mensaje 19, y llega otra vez a L265 con metodo distinto, asi que el if cae por el otro lado   Y aqui se acaba el alt: en la rama 2 no hay transaccion, no hay bloqueo, no hay bucles y no hay comprobante.   CERO", "A"],
    [51, "P", "P", "51. y genera DOS identificadores, L401-402: const referenciaExterna = randomUUID() y const idTransaccionPasarela = SBX-${randomUUID()}.   O SEA QUE EL ID DE LA PASARELA LO GENERA EL PROPIO SERVIDOR, y con un prefijo que dice sandbox.   Y un randomUUID son 36 caracteres, o sea que ese id mide mas que el numero de la transaccion", "A"],
    [52, "P", "D", "52. INSERT INTO transacciones_pago con el proveedor REAL, L409-411, y con estado 'Pendiente'   Y ESTA FUERA DE TODA TRANSACCION: es un dataSource.query suelto, L405.   O sea que la rama 2 hace UNA escritura y sin candado, y la rama 1 hace cinco y con candado.   Consulta 9", "A"],
    [53, "P", "S", "53. y L414-416: [el INSERT no devolvio fila] throw new Error( 'No se pudo crear la transaccion de pago.' )   El MISMO Error desnudo que el de L330, en la otra rama.   Dos veces en el mismo metodo", "A"],
    [54, "P", "P", "54. y una sola bitacora, L419-437, con INSERT sobre transacciones_pago y newData de siete campos, L427-436, y estado 'Pendiente'   O sea que la rama 2 escribe la bitacora del pago iniciado y NADA mas: no escribe la de la venta completada, porque la venta no se completa aqui", "S"],
    [55, "P", "H", "55. { id_venta, id_transaccion, terminal_url, id_transaccion_pasarela, estado: 'Pendiente', metodo_pago, monto }, L439-447   Y AQUI ESTA EL HALLAZGO PRINCIPAL DEL CASO: terminal_url es ${FRONTEND_URL}/sandbox-pago?tx=${idTransaccion}, L442, y FRONTEND_URL es http://localhost:5173 por defecto, L41.   O SEA QUE LA TERMINAL DE LA CAJA ES EL SANDBOX DE CU35", "A"],
    [56, "H", "X", "56. la respuesta   Y AdminCaja la comprueba, L267: [el estado no es Pendiente, o no viene terminal_url] throw new Error( 'No se pudo iniciar el cobro en la pasarela.' )   Y guarda el resultado con setVentaOk, L270-275, y con estado 'Pendiente' PARA SIEMPRE: no hay ningun setVentaOk posterior, ni un setInterval, ni una consulta de estado.   Cero, en 713 lineas", "A"],
    [57, "X", "U", "57. y aqui esta el HALLAZGO 1 del diagrama, el que rompe el caso: el cajero ve Cobro iniciado, L655, con el badge en warning, y un unico boton, L690-693: Abrir terminal de la pasarela, que hace window.open(ventaOk.terminal_url, '_blank').   O SEA QUE EL CAJERO TIENE QUE ABRIR EL BANCO SIMULADO EN OTRA PESTAÑA Y APROBAR SU PROPIO COBRO.   Y el boton de imprimir, L671, esta dentro de ventaOk.estado === 'Completada', que ya no se va a volver a cambiar", "A"],
    [58, "U", "U", "58. fin.   Y el caso se queda a medias por el camino de la tarjeta: la venta sigue Pendiente, el comprobante no existe, el cajero no tiene forma de imprimirlo desde aqui y no hay nadie que avise de nada.   Volveremos a esto en el hallazgo 1", "A"]
];

var HAL = [
    ["1. El cajero tiene que abrir el banco y aprobar su propio cobro", [
        "El hallazgo que rompe el caso, y sale de una linea.",
        "",
        "L442, en la rama 2:",
        "",
        "  terminal_url: `${FRONTEND_URL}/sandbox-pago?tx=${idTransaccion}`,",
        "",
        "Y L41, en el mismo fichero:",
        "",
        "  const FRONTEND_URL =",
        "    process.env.FRONTEND_URL ?? 'http://localhost:5173';",
        "",
        "O SEA QUE LO QUE EL SISTEMA LE DICE AL CAJERO COMO",
        "'TERMINAL DE LA PASARELA' ES LA PANTALLA DEL SANDBOX DEL",
        "PROPIO FRONTEND, que es la de CU35.   El boton de la",
        "pantalla, L691, se llama Abrir terminal de la pasarela y",
        "hace window.open con _blank.   Y dentro hay tres botones:",
        "Aprobado, Rechazado y no responder.   SandboxPago L189, L199",
        "y L207.",
        "",
        "ASI QUE EL FLUJO REAL DE COBRAR CON TARJETA EN ESTA TIENDA",
        "ES ESTE:",
        "",
        "  1  El cajero mete la venta y pulsa cobrar con Tarjeta.",
        "  2  Aparece un boton que dice Abrir terminal de la pasarela.",
        "  3  Se abre una pestana con el banco simulado.",
        "  4  ALGUIEN TIENE QUE PULSAR APROBADO.",
        "",
        "Y HAY QUE DECIR QUIEN PUEDE, Y NO ES EL CLIENTE:",
        "",
        "  -  El sandbox exige que haya sesion, L75, con",
        "     if (usuario === null) y un aviso con un ShieldCheck.",
        "  -  Y su endpoint, /pagos/sandbox/gateway, exige",
        "     exigirPermisoPagar, que es realizar_venta, L78.",
        "",
        "O SEA QUE EL QUE PULSA APROBADO TIENE QUE SER UN EMPLEADO.",
        "EL CLIENTE NO PUEDE, Y EL CAJERO TIENE QUE AUTORIZAR SU",
        "PROPIO COBRO.   En una terminal real el cliente ve el pago y",
        "el cajero no lo aprueba.   Aqui es al reves, y con el nombre",
        "de 'terminal' puesto encima.",
        "",
        "Y EN EL PEOR DE LOS CASOS, con un empleado que tenga mas de",
        "una sucursal, hasta el importe se cobra de la sucursal que le",
        "toque.   Volveremos a eso en el hallazgo 3."
    ]],
    ["2. El cajero nunca puede imprimir el comprobante con tarjeta", [
        "El segundo de la serie, y es el que hace que el caso no",
        "termine nunca.",
        "",
        "LA PANTALLA, AdminCaja.tsx, 713 lineas, y su unico estado de",
        "resultado, ventaOk:",
        "",
        "  L234  setVentaOk(null)      al empezar a cobrar",
        "  L254  setVentaOk({...})     rama de efectivo",
        "  L270  setVentaOk({...})     rama de tarjeta",
        "  L699  setVentaOk(null)      al cerrar el resultado",
        "",
        "O SEA QUE HAY CUATRO Y NINGUNO MAS.   Y en la rama 2, L270-275,",
        "el estado que se guarda es cobro.estado, que el backend",
        "devuelve como 'Pendiente' en L444.   Y no hay ningun sitio",
        "en el que se vuelva a leer.",
        "",
        "CONTADO EN EL FICHERO ENTERO:",
        "",
        "  setInterval 0",
        "  consultarEstadoTransaccion 0",
        "  los 4 useEffect son el de productos, el de clientes y el",
        "  de los avisos",
        "",
        "O SEA QUE LA PANTALLA NO PREGUNTA NUNCA COMO VA EL COBRO.",
        "",
        "Y ESO TIENE DOS CONSECUENCIAS, y las dos son del flujo real:",
        "",
        "  1  EL BOTON DE IMPRIMIR NO APARECE.   L671:",
        "",
        "       {ventaOk.estado === 'Completada' && (",
        "         ... Imprimir ... Descargar PDF",
        "       )}",
        "",
        "     Con tarjeta, ventaOk.estado se quedo en 'Pendiente' y no",
        "     se vuelve a tocar, o sea que ese bloque no se dibuja",
        "     JAMAS.   Ni imprimiendo, ni descargando, ni recargando la",
        "     pagina, porque al recargar ventaOk vuelve a ser null, L109.",
        "     El comprobante existe en la base desde el momento en que",
        "     se aprueba el pago, pero el cajero no tiene forma de",
        "     sacarlo desde aqui.",
        "",
        "  2  Y LA PANTALLA MIENTE POR OMISION.   L655 dice Cobro",
        "     iniciado y el badge queda en warning, L659, para",
        "     siempre.   Aunque el pago se apruebe un segundo despues,",
        "     aunque el webhook haya completenessado la venta y haya",
        "     emitido el comprobante, esta pantalla no se entera.   Y",
        "     no hay ninguna tarea en el proyecto que avise: cero",
        "     correos, cero notificaciones, cero push.",
        "",
        "Y LO PEOR: el unico sitio donde el cajero ve el estado real",
        "es la pantalla del sandbox, que es la de CU35.   O sea que",
        "este caso y CU35 comparten pantalla, y la que le sirve al",
        "cajero para cobrar es la del cliente."
    ]],
    ["3. El mismo concepto, escrito dos veces, con dos SQL y dos errores", [
        "Un hallazgo de consistencia, y sale de contar donde se usa",
        "una cosa en vez de buscarla por su nombre.",
        "",
        "EL MISMO CONCEPTO: de que sucursal es este empleado.   Y esta",
        "escrito en el proyecto por lo menos TRES veces:",
        "",
        "  Ventas    L84-95   sucursalDelEmpleado",
        "  Reservas  L215        alcanceSucursal, que ni se llama igual",
        "  Pagos     L90-99   el mismo, otra vez",
        "",
        "Y LOS TRES SQL NO SON IGUALES.   El de ventas, L86-88:",
        "",
        "  SELECT ue.sucursal_id",
        "  FROM usuarios_empleados ue",
        "  WHERE ue.usuario_id = $1 AND ue.fecha_baja IS NULL",
        "",
        "Y el de pagos, L92:",
        "",
        "  SELECT sucursal_id FROM usuarios_empleados",
        "  WHERE usuario_id = $1 LIMIT 1",
        "",
        "DIFERENCIAS, y son tres:",
        "",
        "  1  EL DE PAGOS NO TRAE fecha_baja IS NULL.   Contado en",
        "     todo el proyecto: NUEVE sitios leen usuarios_empleados,",
        "     y SIETE filtran por fecha_baja.   Los dos que no son",
        "     Pagos L92, que es este caso, y Comprobantes L219.   Y",
        "     el de comprobantes solo pide un nombre, asi que no",
        "     importa; el de pagos decide si puedes cobrar.",
        "",
        "  2  EL DE PAGOS NO HACE EL JOIN.   Usa usuarios_empleados a",
        "     pelo y el otro lo abre con el alias ue.   Lo mismo con",
        "     el nombre de la columna: sucursal_id contra",
        "     ue.sucursal_id.",
        "",
        "  3  Y EL ERROR ES OTRO.   L92 de pagos y L96 de pagos",
        "     dicen No tienes permisos para procesar pagos en esta",
        "     caja, que es el MISMO texto que el 403 de falta de",
        "     permiso, L86.   O sea que un empleado que no tiene",
        "     sucursal recibe un error que le dice que no tiene",
        "     permiso.   Y el de ventas, L92, dice Tu usuario no esta",
        "     asociado a una sucursal, que es el texto correcto y el",
        "     que el cajero podria entender.",
        "",
        "LO QUE HACE ESTO GRAVE, Y ES LO UNICO DE ESTE HALLAZGO:",
        "en la MISMA pantalla de caja, L211 de AdminCaja, se validan",
        "las dos mitades con metodos distintos.",
        "",
        "  La venta, Ventas L402, con el de Ventas, que filtra.",
        "  El cobro, Pagos L214, con el de Pagos, que no filtra.",
        "",
        "O SEA QUE UN CAJERO PUEDE ABRIR LA PANTALLA, QUE ES LO QUE",
        "LE PIDE EL ROL, Y NO PUEDE CREAR LA VENTA, Y ESO LE DICE EL",
        "SERVICIO DE VENTAS.   Y SI LA VENTA YA LA CREO OTRO, SI PUEDE",
        "COBRARLA, Y ESO NO SE LO COMPRUEBA NADIE.",
        "",
        "Y HAY QUE SER JUSTOS CON LA DEFENSA, porque la hay:",
        "JwtAuthGuard, L49-51, comprueba usuario.estado contra",
        "'activo' y tira 401 con Tu cuenta esta deshabilitada.   Y",
        "deshabilitarEmpleado, L232 y L244, escribe SIEMPRE las dos",
        "columnas en la misma operacion, estado Inactivo y",
        "fecha_baja NOW().   O sea que hoy el filtro que falta no lo",
        "tapa nadie, porque el otro filtro esta.",
        "",
        "PERO SON DOS DATOS DISTINTOS CON DOS SIGNIFICADOS",
        "DISTINTOS: usuarios.estado es la CUENTA, y",
        "usuarios_empleados.fecha_baja es el EMPLEO.   Un empleado",
        "al que se le acaba el contrato pero conserva la cuenta",
        "para comprar en el portal es un caso que el esquema",
        "permite, porque son dos tablas, y en ese caso el guard lo",
        "deja pasar y el de pagos no lo para.   Y el 403 que le",
        "sale, si le sale, le dice que no tiene permiso.",
        "",
        "LO QUE LO ARREGLA ES UNA LINEA: anadir el AND",
        "fecha_baja IS NULL al SELECT de L92, y copiar el texto del",
        "403 de L92 de ventas.   O mejor: un solo metodo en un",
        "servicio compartido, que es lo que ya se hace con",
        "cargarPermisos, que esta repetido en 28 sitios del proyecto."
    ]],
    ["4. El codigo de la caja es una copia del de CU35, y ya divergio", [
        "Un hallazgo de mantenimiento, y la cuenta sale sola.",
        "",
        "COMPARANDO LOS DOS METODOS, que estan en el MISMO fichero y a",
        "131 lineas de distancia:",
        "",
        "  CU35  procesarResultado   L548-760   digital",
        "  CU37  procesarPagoCaja    L208-448   caja",
        "",
        "LO QUE ES COPIA LITERAL, y se puede comprobar linea a linea:",
        "",
        "  -  El loop 1 con su SELECT y su FOR UPDATE: L296-307",
        "     contra L667-678.   Y la divergencia esta en el SELECT:",
        "     L299 trae SOLO cantidad_disponible, y L670 trae",
        "     cantidad_disponible Y cantidad_reservada.   O sea que",
        "     la copia ya perdio la columna, y la perdio en el",
        "     sitio exacto del hallazgo 3 de CU35.",
        "  -  El loop 2 entero, L309-317 contra L680-688.   El mismo",
        "     409 con el mismo texto, y con la misma debilidad:",
        "     compara el dato que el bucle anterior ya leyo y ya",
        "     bloqueo.",
        "  -  El loop 3, L336-350 contra L706-720.   El mismo",
        "     continue, el mismo UPDATE de cantidad_vendida y el",
        "     mismo INSERT del movimiento con la cantidad negativa.",
        "  -  Y el 409 de la venta, L284 contra L655.   El mismo",
        "     texto: La venta ya fue cobrada.",
        "",
        "O SEA QUE HAY UN BLOQUE DE 54 LINEAS DUPLICADO, y un",
        "cliente puede tocar uno y no el otro.   Y CU35 y CU29 en el",
        "documento estan a un caso de distancia y son el mismo",
        "codigo con dos copias.",
        "",
        "LO QUE NO ESTA COPIADO, y por eso la caja tiene un problema",
        "que el digital no tiene:",
        "",
        "  -  L334, la caja: UPDATE ventas SET estado = 'Completada'",
        "     WHERE id_venta = $1.   SIN la condicion de estado en el",
        "     WHERE.   El digital si la tiene, L594 y L621, que es un",
        "     compare-and-set.",
        "",
        "  O SEA QUE EN LA CAJA, si dos cajeros cobran la misma venta",
        "  a la vez, el primero la completa y el segundo tambien cree",
        "  que la completo.   El FOR UPDATE de L279 hace que se",
        "  esperen, y el estado de L283 lo comprueba, pero la",
        "  escritura de L334 no lo vuelve a comprobar.   La ventana",
        "  es de milisegundos, pero la puerta existe.",
        "",
        "Y LA DIFERENCIA DE NEGOCIO QUE MAS DUELE, que va al reves:",
        "el guarda de las transacciones que ya existen es DISTINTO en",
        "los dos metodos, y el de la caja es el mejor.",
        "",
        "  Digital, L151-157:",
        "    SELECT id_transaccion FROM transacciones_pago",
        "    WHERE id_venta = $1 LIMIT 1",
        "  y L156: La venta ya fue procesada.",
        "  O SEA QUE RECHAZA CUALQUIER TRANSACCION ANTERIOR,",
        "  INCLUIDO UNA RECHAZADA.",
        "",
        "  Caja, L250-255:",
        "    SELECT id_transaccion FROM transacciones_pago",
        "    WHERE id_venta = $1 AND estado IN ('Pendiente', 'Aprobado')",
        "  y L257: La venta ya fue cobrada.",
        "  O SEA QUE UNA RECHAZADA NO BLOQUEA, Y EL CLIENTE PUEDE",
        "  REINTENTAR.",
        "",
        "Y ESO ES UN BUG DEL CASO ANTERIOR, QUE SE VE DESDE ESTE: si",
        "el pago digital de CU35 se rechaza, L617-642 deja la",
        "transaccion en 'Rechazado', y entonce CU26 no deja crear",
        "otra, y la venta se queda bloqueada PARA SIEMPRE.   El",
        "cliente no puede reintentar con otra tarjeta.   Y en la caja",
        "si puede, porque el guard es distinto.   Los dos metodos",
        "estan a 40 lineas uno del otro."
    ]],
    ["5. El proveedor 'CAJA' no esta en la lista de proveedores", [
        "Un hallazgo pequeno de datos, y sale de un solo literal.",
        "",
        "L324, en el INSERT de la rama de efectivo:",
        "",
        "  VALUES ($1, $2, 'CAJA', $3, 'BOB', 'Efectivo',",
        "           'Aprobado', $4, NULL, NOW())",
        "",
        "Y L22-23 y L39, en la cabecera del mismo fichero:",
        "",
        "  const PROVEEDORES = ['LIBELULA', 'STRIPE', 'PAYPAL'];",
        "  const PROVEEDORES_CAJA = ['LIBELULA', 'STRIPE'];",
        "",
        "Y L229, que es la lista contra la que se valida:",
        "",
        "  if (!PROVEEDORES_CAJA.includes(proveedor)) {",
        "    throw new UnprocessableEntityException(",
        "      'Proveedor de pasarela inválido.');",
        "  }",
        "",
        "O SEA QUE LA COLUMNA proveedor_pasarela, VARCHAR(40) en",
        "schema.sql L444, ACEPTA 'CAJA' al entrar y NINGUNA LISTA LA",
        "CONOCE.   Y el mismo valor se repite en la bitacora, L369.",
        "",
        "LO QUE ROMPE, y hay que decirlo con calma porque depende",
        "de quien lea:",
        "",
        "  -  Un informe que agrupe por proveedor, o un filtro en la",
        "     pantalla de pagos, tiene TRES proveedores mas una caja",
        "     que no es un proveedor.   Y como la tabla no tiene CHECK",
        "     ni indice, no hay nada que lo impida.",
        "",
        "  -  Y si alguien algun dia pone un @IsIn con PROVEEDORES",
        "     en la salida, el efectivo deja de poder consultarse.",
        "     El @IsIn ya se usa en la entrada, L32 y L43, pero en la",
        "     salida no hay ninguno.",
        "",
        "LO QUE ESTA BIEN, y hay que decirlo: la moneda se hardcodea",
        "a 'BOB' en las dos ramas, L324 y L409, y eso es lo que",
        "CU26 hacia bien.   Y el metodo va como 'Efectivo' hardcodeado",
        "en L324, que es correcto porque esa rama solo se alcanza con",
        "metodo 'Efectivo'."
    ]],
    ["6. El codigo se puede escribir tres veces y con tres reglas", [
        "Un hallazgo de mantenibilidad, en el sitio donde un error",
        "es un error de dinero.",
        "",
        "EL IVA SE CALCULA EN TRES SITIOS, y CU35 y CU29 comparten",
        "servicio de ventas:",
        "",
        "  Ventas L218   crearCompraDigital",
        "             const tasa = !Number.isNaN(ivaProducto)",
        "               && ivaProducto > 0 ? ivaProducto : ivaCategoria;",
        "",
        "  Ventas L494   crearVentaPresencial",
        "             el mismo ternario, LETRA POR LETRA",
        "",
        "  Ventas L348   buscarProductosPos",
        "             el mismo ternario, LETRA POR LETRA",
        "",
        "Y EL TOTAL SE CALCULA UNA CUARTA VEZ, en el cliente:",
        "",
        "  AdminCaja L225-228",
        "             const subtotal = Math.round(items.reduce(",
        "               (acc, i) => acc + i.precio_unitario * i.cantidad, 0)",
        "               * 100) / 100;",
        "",
        "O SEA QUE HAY CUATRO COPIAS DEL MISMO CALCULO, y la cuarta",
        "es la que el cajero le enseña al cliente.   Un redondeo mal",
        "puesto en cualquiera de las tres del servidor produce una",
        "diferencia de un centimo entre lo que dice la pantalla y lo",
        "que se guarda.",
        "",
        "Y LA DIFERENCIA ENTRE LA COPIA DEL SERVIDOR Y LA DEL",
        "CLIENTE, que es la que importa, se puede resumir en una",
        "linea:",
        "",
        "  El servidor, Ventas L494, usa el IVA del producto si es",
        "  mayor que 0 y si no el de la categoria.",
        "  El cliente, AdminCaja L227, usa solo i.porcentaje_iva.",
        "",
        "LO QUE SALVA ES QUE LA TASA YA VIENE RESUELTA, y hay que",
        "decirlo porque es lo unico que impide el desastre:",
        "buscarProductosPos, L357, devuelve porcentaje_iva: tasa, o",
        "sea que el fallback a la categoria se viaja al cliente.   Los",
        "precios tambien coinciden: L345 y L491 hacen los dos",
        "precio_especial ?? precio_base, y lo hacen igual.",
        "",
        "ASI QUE HOY NO HAY ERROR.   Y ESO ES JUSTAMENTE LO QUE LO",
        "HACE PELIGROSO: el que lea L227 no ve el fallback, y si",
        "añade una prenda a mano, o cambia el SELECT de L323 y deja",
        "de traer la categoria, el desajuste aparece solo y en",
        "silencio.   Y en una caja el cliente oye el precio antes de",
        "que se le cobre, y no puede reclamar a posteriori."
    ]],
    ["7. Error desnudos, y son un patron del proyecto, no un descuido", [
        "Un hallazgo de manejo de errores, y hay que decirlo bien",
        "porque la primera version que escribi de esto era falsa.",
        "",
        "EN ESTE CASO HAY TRES, y estan los tres en el camino:",
        "",
        "  Ventas  L524   throw new Error('No se pudo registrar la venta.')",
        "              dentro de la transaccion de crearVentaPresencial",
        "  Pagos   L330   throw new Error('No se pudo registrar el pago en caja.')",
        "              dentro de la transaccion de la rama 1",
        "  Pagos   L415   throw new Error('No se pudo crear la transaccion de pago.')",
        "              FUERA de transaccion, en la rama 2",
        "",
        "Y EL RESTO DEL FICHERO DE PAGOS usa excepciones de Nest:",
        "ocho NotFoundException y nueve ConflictException.   Y el de",
        "ventas tambien, quince ConflictException y seis",
        "NotFoundException.   O sea que conviven las dos cosas en el",
        "mismo modulo.",
        "",
        "LO QUE CAMBIA PARA EL QUE LLAMA:",
        "",
        "  -  Un NotFoundException sale como 404 y un",
        "     ConflictException como 409, con el cuerpo del error.",
        "  -  Un Error desnudo sale como 500, y en Nest el cuerpo",
        "     lleva el stack trace si no hay filtro de excepciones.",
        "     Y no hay ninguno: main.ts, L15-47, solo monta el",
        "     ValidationPipe.",
        "",
        "O SEA QUE EL CLIENTE PUEDE VER LAS RUTAS INTERNAS DEL",
        "SERVIDOR en esos tres casos, y con el nombre del fichero y",
        "el numero de linea dentro.",
        "",
        "Y EL DATO QUE HACE QUE ESTE HALLAZGO SEA DE OTRA CLASE:",
        "no son tres descuidos, es un PATRON.   Contado en los 149",
        "ficheros .ts y .tsx del prototipo hay TREINITA throw new",
        "Error, repartidos en quince servicios, y casi todos con el",
        "mismo molde: No se pudo registrar la venta, No se pudo",
        "registrar el producto, No se pudo crear la orden de compra.",
        "",
        "  Catalogos   6   Productos  1   Temporadas  4   Compras  1",
        "  Ajustes     1   Pagos      3   Proveedores  1   Reservas  1",
        "  Ventas      2   Respaldos  1   Email      1   ReportesVoz 1",
        "",
        "O SEA QUE EL 500 CON STACK TRACE ES LA EXCEPCION POR",
        "DEFECTO DEL PROYECTO, y por eso arreglar estos tres no sirve",
        "de nada: hay que poner un filtro global de excepciones en",
        "main.ts, que es una linea, y arreglar el patron de verdad."
    ]],
    ["8. Lo que esta bien, y hay bastante", [
        "Este caso tiene siete cosas buenas. Y la primera es la que",
        "hace que valga la pena dibujarlo.",
        "",
        "1. LA RAMA DE EFECTIVO SE CIERRA ENTERA EN UN SOLO REQUEST. De",
        "   L276 a L351 la transaccion, y despues el comprobante y las",
        "   dos bitacoras.   O sea que el cajero cobra, ve el vuelto,",
        "   imprime el comprobante y puede seguir con el siguiente. No",
        "   hay ningun estado pendiente, ninguna pestana que abrir y",
        "   ninguna tarea que ejecutar.   Para una caja eso es",
        "   exactamente lo que hace falta.",
        "",
        "2. Y EL BLOQUEO ESTA EN EL ORDEN CORRECTO. El FOR UPDATE de la",
        "   venta, L279, y el primer SELECT de cada prenda con su FOR",
        "   UPDATE, L301-302, van antes de comparar el stock, que esta",
        "   en L312.   O sea que se comprueba DESPUES de bloquear y",
        "   nunca antes.   Dos cajeros cobrando la misma prenda a la",
        "   vez no se pueden pasar el stock.   Es lo mismo que hizo",
        "   bien CU35 y lo que CU19 no hacia con sus veinte productos.",
        "",
        "3. Y LA COMPARACION CON CU35 MUESTRA QUE EL AUTOR CUENTA CON",
        "   EL DOBLE. En el digital el servicio es requirePermisoPagar,",
        "   L78, y en la caja es exigirPermisoCaja, L85, que es OTRO",
        "   metodo con el MISMO permiso.   O sea que hay dos puertas",
        "   que se pueden abrir por separado en el futuro, y el autor",
        "   las puso. Es lo correcto.",
        "",
        "4. Y LA PERTENENCIA SE COMPRUEBA POR SUCURSAL, que es lo que",
        "   un caso de caja necesita y lo que el digital no tiene. El",
        "   digital comprueba que la venta sea del usuario, L144; la",
        "   caja comprueba que sea de la sucursal del empleado, L243.",
        "   O sea que un cajero no puede cobrar la venta de otra",
        "   tienda, y el mensaje de error es el mismo 404 que el",
        "   digital, L244, con el mismo texto.   Cuarto 404 igual en el",
        "   proyecto.",
        "",
        "5. Y EL GUARDA DE LAS MONTO RECIBIDO DICE CUANTO FALTA, L266-269:",
        "   El monto recibido es insuficiente. Faltan Bs 50.00.   Es",
        "   el unico sitio de todo el proyecto que da la cantidad",
        "   exacta que falta, y es justo el dato que el cajero",
        "   necesita para dar el cambio.   CU35 y CU26 dan el 422 con",
        "   un texto, pero nunca un numero.",
        "",
        "6. Y EL ROLDO EN EL SERVIDOR, NO EN LA PANTALLA, L260-263. El",
        "   vuelto se calcula con el total que sale de la base, y la",
        "   pantalla solo lo pinta, L661-664.   O sea que el cajero no",
        "   puede decidir cuanto se cobra, aunque puede equivocar el",
        "   vuelto que enseña, y como el vuelto sale del servidor, lo",
        "   que enseña es el bueno.",
        "",
        "7. Y LA PANTALLA MANEJA EL 401 EN LOS TRES SITIOS, L143, L178",
        "   y L285, con navigate('/login').   SandboxPago lo hacia en",
        "   uno solo, L127.   O sea que aqui el sesion caducado se",
        "   trata tres veces, y en dos de ellas antes de haber hecho",
        "   nada."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU29."; } catch (e) { }
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
    var xP = xDe(indiceDe("P"));
    var xD = xDe(indiceDe("D"));
    var xC = xDe(indiceDe("C"));
    var xS = xDe(indiceDe("S"));
    var xM = xDe(indiceDe("M"));
    // EL alt DEL CASO, y es de verdad. En L265, if (metodo === 'Efectivo'),
    // y las dos ramas hacen negocios distintos: una abre transaccion y
    // termina el cobro, la otra deja la venta a medias. En CU35 no hay alt
    // porque sus tres caminos son tres throw seguidos, no dos mitades.
    // El nombre lleva una barra, que es lo que hace que fragmento() dibuje
    // la linea punteada horizontal en la mitad del marco.
    fragmento(diag, "alt [EFECTIVO: transaccion, 3 bucles, comprobante, devuelve Completada] / [TARJETA, QR O TRANSFERENCIA: un INSERT suelto, cero bucles, devuelve Pending y una URL al sandbox]", xP, xD, Y_MSG0 + 22 * PASO_MSG - 34, Y_MSG0 + 54 * PASO_MSG - 20);
    // LOS 3 LOOP, y estan SOLO en la rama 1 del alt, la de efectivo, que es
    // L296 a L350. En la rama 2, L399 a L447, no hay ni uno. Por eso los
    // tres van dentro del alt y en la misma columna.
    fragmento(diag, "loop [por cada item vendido: SELECT ... FOR UPDATE, bloquea esa prenda]", xP, xD, Y_MSG0 + 27 * PASO_MSG - 34, Y_MSG0 + 30 * PASO_MSG - 34);
    fragmento(diag, "loop [por cada item: compara el stock YA LEIDO en el bucle anterior]", xP, xD, Y_MSG0 + 30 * PASO_MSG - 34, Y_MSG0 + 32 * PASO_MSG - 34);
    fragmento(diag, "loop [por cada item: UPDATE cantidad_vendida e INSERT del movimiento]", xP, xD, Y_MSG0 + 35 * PASO_MSG - 34, Y_MSG0 + 38 * PASO_MSG - 34);
    // LAS 4 BARRAS. La del servicio de ventas va aparte porque su lifeline es
    // otro, y aunque es CU36 y no este caso, es lo que pasa antes de que haya
    // algo que cobrar. Las otras tres se anidan: pagos dentro de controlador,
    // y comprobantes dentro de pagos.
    activacion(diag, xS, Y_MSG0 + 3 * PASO_MSG - 26, Y_MSG0 + 9 * PASO_MSG - 26);
    activacion(diag, xC, Y_MSG0 + 14 * PASO_MSG - 26, Y_MSG0 + 49 * PASO_MSG - 26);
    activacion(diag, xP, Y_MSG0 + 15 * PASO_MSG - 26, Y_MSG0 + 54 * PASO_MSG - 26);
    activacion(diag, xM, Y_MSG0 + 40 * PASO_MSG - 26, Y_MSG0 + 42 * PASO_MSG - 26);
}

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 940) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU29  Procesar Pago en Caja   ·   en el código del proyecto este caso es CU37, con el título IGUAL, y pegado al de CU35"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 940) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseño de caso de uso, sección 3.3.2.1.  10 líneas de vida, 58 mensajes, 8 hallazgos, 3 loop y 1 alt, y 4 barras de activación."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su línea de vida. El tiempo baja. El caso de la CAJA, y el gemelo del anterior: comparten SRV_PagosService, los cuatro guardas, el SELECT de la venta y los tres bucles, y este tiene un alt de verdad, en L265, porque las dos ramas hacen negocios distintos. Los tres loop están SÓLO en la rama de efectivo, L296-350; la de tarjeta no tiene ninguno. Y ojo: la terminal de la caja es el sandbox, L442, así que para cobrar con tarjeta hay que abrir el banco y aprobar el propio cobro, y el comprobante ya no se puede imprimir nunca, porque el estado se queda en Pendiente y no hay polling."; } catch (e) { }
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
// CU27 - notas del diagrama y MAIN
// CU29 - notas del diagrama y MAIN
function notasDelDiagrama(diag, r, h, ch) {
    var N = [];
    N.push("CU29  Procesar Pago en Caja.  Diseño de caso de uso, sección 3.3.2.1.");
    N.push("");
    N.push("AVISO DE NUMERACIÓN");
    N.push("");
    N.push("  Este caso es CU29 en el documento y CU37 en el código del proyecto, y el título");
    N.push("  COINCIDE EXACTO, sin una palabra de diferencia:");
    N.push("");
    N.push("    documento  Procesar Pago en Caja");
    N.push("    codigo     // CU37 - Procesar Pago en Caja   api.ts L1903");
    N.push("");
    N.push("  Es el SEGUNDO caso de la serie con el título exactamente igual en los dos sitios.");
    N.push("  El primero fue CU29 del documento, que es CU35 del código, el de la pasarela.");
    N.push("");
    N.push("  Y ESTOS DOS CASOS ESTÁN PEGADOS, y eso no es casualidad:");
    N.push("");
    N.push("    api.ts L1902   // CU35 - Procesar Pago con Pasarela de Pago");
    N.push("    api.ts L1903   // CU37 - Procesar Pago en Caja");
    N.push("");
    N.push("  Los dos son un cobro, los dos comparten SRV_PagosService, los dos tienen la misma");
    N.push("  estructura de cuatro guardas y un SELECT de la venta, y los dos terminan llamando a");
    N.push("  la misma pantalla.   Por eso este diagrama tiene que leerse junto al de CU35.");
    N.push("");
    N.push("  Y EL CASO ANTERIOR EN EL DOCUMENTO, CU28, es Crear Reserva, que en el código es");
    N.push("  CU28 también.   O sea que CU28 y CU29 en el documento son dos casos de una tienda");
    N.push("  que reserva y cobra, y en el código son CU28 y CU37, que no son consecutivos.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 líneas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Cajero              «actor»     el único actor de la serie con permiso propio");
    N.push("    AdminCaja.tsx             «boundary»  713 líneas, y la bifurcación está en L244");
    N.push("    api.ts                    «boundary»  sección CU37, L1904-1934");
    N.push("    JwtAuthGuard              «control»   en los 2, sin excepción");
    N.push("    ValidationPipe            «control»   2 DTO distintos, L20-34 y L40-73");
    N.push("    CTR_Pagos                 «control»   el endpoint de la caja, L97-112");
    N.push("    SRV_PagosService          «control»   784 líneas, el alt y los 3 bucles AQUÍ");
    N.push("    SRV_VentasService         «control»   crearVentaPresencial, que es CU36");
    N.push("    SRV_ComprobantesService   «control»   generar(), y es CU38");
    N.push("    PostgreSQL                «entity»    4 tablas y el trigger del inventario");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes. Repartidos, contados sobre el propio diagrama:");
    N.push("");
    N.push("  Y DOS LIFELINES A PROPÓSITO NO ESTÁN, y las dos son servicios que el caso llama:");
    N.push("");
    N.push("    SRV_BitacoraService    tres veces, L359, L378 y L419, siempre fuera de la");
    N.push("                         transaccion y siempre por el repositorio de TypeORM.");
    N.push("    SRV_PreferenciasService  una vez, L353, que es CU41 y tiene su try/catch propio.");
    N.push("");
    N.push("  Los dos van como mensajes a sí mismo del lifeline de Pagos, con el nombre del");
    N.push("  servicio dentro del texto.   La razón es la misma que en los demás casos: no hay");
    N.push("  ni un mensaje suyo dentro de la frontera de la transacción.");
    N.push("");
    N.push("  Y POR LIFELINE, para que se vea quién hace el trabajo.   Contado sobre el propio");
    N.push("  diagrama, por lifeline de DESTINO:");
    N.push("");
    N.push("    PostgreSQL              16   el que más recibe de todos");
    N.push("    SRV_PagosService        15");
    N.push("    SRV_VentasService        7   y es CU36, no este caso");
    N.push("    api.ts                   6");
    N.push("    AdminCaja.tsx            5");
    N.push("    ACTOR_Cajero             4");
    N.push("    JwtAuthGuard             3");
    N.push("    CTR_Pagos                1");
    N.push("    SRV_ComprobantesService  1");
    N.push("    ValidationPipe           0   no recibe ninguno: los DTO los");
    N.push("                                 consume el servicio, no el pipe");
    N.push("");
    N.push("  Y POR ORIGEN, que es lo que cuenta quién manda:");
    N.push("");
    N.push("    SRV_PagosService        32   o sea que el servicio de pagos");
    N.push("                                 origina más de la mitad de los");
    N.push("                                 mensajes del diagrama");
    N.push("    api.ts                   6");
    N.push("    AdminCaja.tsx            6");
    N.push("    SRV_VentasService        6");
    N.push("    ACTOR_Cajero             3");
    N.push("");
    N.push("  O SEA QUE EL CASO SE LEE ENTERO EN LA OCTAVA COLUMNA, y que la base de datos");
    N.push("  es la que más mensajes recibe, porque el trigger y las consultas van a ella.");
    N.push("");
    N.push("EL alt, Y POR QUÉ ESTE SÍ Y EN CU35 NO");
    N.push("");
    N.push("  Un alt de verdad es una decisión con DOS CAMINOS EXCLUYENTES que hacen cosas");
    N.push("  distintas.   Aquí la hay, y es una sola línea, L265:");
    N.push("");
    N.push("    if (metodo === 'Efectivo') { ... 131 líneas ... return }");
    N.push("");
    N.push("  Y LAS DOS RAMAS SON NEGOCIOS DISTINTOS:");
    N.push("");
    N.push("    RAMA 1, efectivo, L265-397");
    N.push("      una transaccion, L276, con DOS bloqueos, L279 y L301-302");
    N.push("      TRES bucles, L296, L309 y L336");
    N.push("      cinco escrituras dentro de la transaccion");
    N.push("      el inventario tocado, y el trigger fired por el INSERT de L346-347");
    N.push("      el comprobante emitido, L356");
    N.push("      devuelve Completada con el vuelto");
    N.push("");
    N.push("    RAMA 2, tarjeta, QR o transferencia, L399-447");
    N.push("      CERO transacciones");
    N.push("      CERO bloqueos");
    N.push("      CERO bucles");
    N.push("      UNA escritura, y suelta, L405");
    N.push("      el inventario NO se toca");
    N.push("      el comprobante NO se emite");
    N.push("      devuelve Pendiente y una terminal_url al sandbox");
    N.push("");
    N.push("  UNA RAMA HACE EL COBRO Y LA OTRA LO DEJA A MEDIAS.   Eso no cabe en un");
    N.push("  return, así que en un diagrama de caso de uso es un alt, y aquí se dibuja como");
    N.push("  tal, con la pestaña, el elemento y las dos condiciones.");
    N.push("");
    N.push("  Y EL CONTRASTE CON CU35, que es lo que hay que decir para que se entienda por qué");
    N.push("  aquí sí y allí no: los tres caminos de procesarResultado, L518, L522 y L545, son");
    N.push("  tres throw y un return CONSECUTIVOS del mismo if.   Son tres formas de terminar");
    N.push("  con error o con éxito, no dos mitades de una decisión.   Un alt ahí sería mentira.");
    N.push("");
    N.push("  Y LA RAZÓN DE QUE LA DIFERENCIA SEA TAN GRANDE, que es lo que hay que ver al");
    N.push("  leer el diagrama: la rama 2 no es una versión corta de la rama 1.   Es otro");
    N.push("  endpoint disimulado, con otro modelo de datos y otra respuesta.   L54 lineas");
    N.push("  contra 132, sin una sola linea de logica compartida.");
    N.push("");
    N.push("  Y LA CONSECUENCIA DE NEGOCIO, que es lo grave: la caja NO PUEDE COBRAR CON");
    N.push("  TARJETA de punta a punta.   Con efectivo si.   Con tarjeta devuelve una URL, la");
    N.push("  URL apunta a la pantalla del sandbox, y el sandbox lo termina CU35.   O sea que");
    N.push("  este caso, el de la caja, deja el cobro a medias el 75% de las veces, porque");
    N.push("  hay tres metodos sin efectivo y uno con.");
    N.push("");
    N.push("EL HALLAZGO 1: EL CAJERO TIENE QUE ABRIR EL BANCO Y APROBAR SU PROPIO COBRO");
    N.push("");
    N.push("  L442, en la rama 2:");
    N.push("");
    N.push("    terminal_url: `${FRONTEND_URL}/sandbox-pago?tx=${idTransaccion}`,");
    N.push("");
    N.push("  Y L41, en el mismo fichero:");
    N.push("");
    N.push("    const FRONTEND_URL =");
    N.push("      process.env.FRONTEND_URL ?? 'http://localhost:5173';");
    N.push("");
    N.push("  El botón de la pantalla, L691, se llama Abrir terminal de la pasarela y hace");
    N.push("  window.open con _blank.   Y dentro hay tres botones: Aprobado, Rechazado y no");
    N.push("  responder, SandboxPago L189, L199 y L207.");
    N.push("");
    N.push("  Y NO LO PUEDE HACER EL CLIENTE, y esto es lo que hay que subrayar:");
    N.push("");
    N.push("    El sandbox exige sesión, SandboxPago L75, con if (usuario === null).");
    N.push("    Y su endpoint exige exigirPermisoPagar, que es realizar_venta, L78.");
    N.push("");
    N.push("  O SEA QUE EL QUE PULSA APROBADO TIENE QUE SER UN EMPLEADO.   En una terminal real");
    N.push("  el cliente ve el importe y el cajero no lo aprueba.   Aquí es al revés, y con la");
    N.push("  palabra terminal puesta encima.");
    N.push("");
    N.push("EL HALLAZGO 2: EL CAJERO NUNCA PUEDE IMPRIMIR EL COMPROBANTE CON TARJETA");
    N.push("");
    N.push("  La pantalla tiene un único estado de resultado, ventaOk, y se escribe cuatro veces:");
    N.push("");
    N.push("    L234  setVentaOk(null)     al empezar a cobrar");
    N.push("    L254  setVentaOk({...})    rama de efectivo");
    N.push("    L270  setVentaOk({...})    rama de tarjeta, con estado 'Pendiente'");
    N.push("    L699  setVentaOk(null)     al cerrar el resultado");
    N.push("");
    N.push("  Y NO HAY UN QUINTO.   Contado en las 713 líneas del fichero:");
    N.push("");
    N.push("    setInterval                    0");
    N.push("    consultarEstadoTransaccion      0");
    N.push("    useEffect                      3, y son el de productos y el de clientes");
    N.push("");
    N.push("  O SEA QUE LA PANTALLA NO PREGUNTA NUNCA COMO VA EL COBRO.   Y por eso:");
    N.push("");
    N.push("  1  EL BOTÓN DE IMPRIMIR NO APARECE.   L671 lo mete dentro de");
    N.push("     ventaOk.estado === 'Completada', y con tarjeta ese estado se quedó en");
    N.push("     'Pendiente' para siempre.   Ni recargando la página, porque al recargar");
    N.push("     ventaOk vuelve a ser null, L109.   El comprobante existe en la base en cuanto");
    N.push("     se aprueba el pago, y el cajero no tiene forma de sacarlo desde aquí.");
    N.push("");
    N.push("  2  Y LA PANTALLA MIENTE POR OMISIÓN.   L655 dice Cobro iniciado y el badge se");
    N.push("     queda en warning, L659, para siempre.   No hay ninguna tarea en el proyecto");
    N.push("     que avise: cero correos, cero notificaciones, cero push.");
    N.push("");
    N.push("EL HALLAZGO 3: EL MISMO CONCEPTO, ESCRITO DOS VECES, CON DOS SQL Y DOS ERRORES");
    N.push("");
    N.push("  De qué sucursal es este empleado.   Y está escrito en el proyecto por lo menos tres");
    N.push("  veces: Ventas L84-95, Pagos L90-99 y Reservas L215, que encima no se llama igual:");
    N.push("  iguales.");
    N.push("");
    N.push("    el de ventas, L86-88:");
    N.push("      SELECT ue.sucursal_id");
    N.push("      FROM usuarios_empleados ue");
    N.push("      WHERE ue.usuario_id = $1 AND ue.fecha_baja IS NULL");
    N.push("");
    N.push("    el de pagos, L92:");
    N.push("      SELECT sucursal_id FROM usuarios_empleados");
    N.push("      WHERE usuario_id = $1 LIMIT 1");
    N.push("");
    N.push("  DIFERENCIAS, y son tres:");
    N.push("");
    N.push("  1  EL DE PAGOS NO TRAE fecha_baja IS NULL.   Contado en todo el proyecto: nueve");
    N.push("     sitios leen usuarios_empleados y siete filtran por fecha_baja.   Los dos que no");
    N.push("     son Pagos L92, que es este caso, y Comprobantes L219, que solo pide un nombre.");
    N.push("");
    N.push("  2  EL DE PAGOS NO HACE EL JOIN, y usa usuarios_empleados a pelo en vez del alias");
    N.push("     ue.   Lo mismo con el nombre de la columna.");
    N.push("");
    N.push("  3  Y EL ERROR ES OTRO.   L96 de pagos dice No tienes permisos para procesar");
    N.push("     pagos en esta caja, que es el MISMO texto que el 403 de falta de permiso, L86.");
    N.push("     O sea que un empleado sin sucursal recibe un error que le dice que no tiene");
    N.push("     permiso.   El de ventas, L92, dice Tu usuario no está asociado a una sucursal,");
    N.push("     que es el texto correcto y el que el cajero entendería.");
    N.push("");
    N.push("  LO QUE LO HACE GRAVE: en la MISMA pantalla de caja, L211 de AdminCaja, se validan");
    N.push("  las dos mitades con métodos distintos.   La venta, Ventas L402, con el de Ventas,");
    N.push("  que filtra.   El cobro, Pagos L214, con el de Pagos, que no filtra.   O sea que un");
    N.push("  cajero puede abrir la pantalla y no poder crear la venta, y si la venta ya la creó");
    N.push("  otro, sí puede cobrarla, y eso no se lo comprueba nadie.");
    N.push("");
    N.push("  Y HAY QUE SER JUSTOS CON LA DEFENSA, porque la hay: JwtAuthGuard, L49-51,");
    N.push("  comprueba usuario.estado contra 'activo', y Rehabilitar y deshabilitar,");
    N.push("  L232 y L244, escriben SIEMPRE las dos columnas en la misma operación.   O sea que");
    N.push("  hoy el filtro que falta no lo tapa nadie, porque el otro filtro está.");
    N.push("");
    N.push("  PERO SON DOS DATOS DISTINTOS CON DOS SIGNIFICADOS DISTINTOS: usuarios.estado es");
    N.push("  la CUENTA y usuarios_empleados.fecha_baja es el EMPLEO.   Un empleado al que se le");
    N.push("  acaba el contrato pero conserva la cuenta para comprar en el portal es un caso");
    N.push("  que el esquema permite, porque son dos tablas, y ahí el guard lo deja pasar y el");
    N.push("  de pagos no lo para.");
    N.push("");
    N.push("EL HALLAZGO 4: EL CÓDIGO ES COPIA DEL DE CU35, Y YA HA DIVERGIDO");
    N.push("");
    N.push("  Los dos métodos están en el MISMO fichero, a 131 líneas de distancia:");
    N.push("");
    N.push("    CU35  procesarResultado   L548-760   digital");
    N.push("    CU37  procesarPagoCaja    L208-448   caja");
    N.push("");
    N.push("  Y ES COPIA LITERAL, y se puede comprobar línea a línea: el loop 1 con su SELECT y");
    N.push("  su FOR UPDATE, el loop 2 entero, el loop 3 con el mismo continue y el mismo INSERT");
    N.push("  del movimiento, y el 409 de la venta con el mismo texto.   Un bloque de 54 líneas");
    N.push("  duplicado, que se puede tocar en uno y no en el otro.");
    N.push("");
    N.push("  Y YA HA DIVERGIDO, en el sitio exacto del hallazgo 3 de CU35: L299, el SELECT de");
    N.push("  la caja, trae SOLO cantidad_disponible.   L670, el del digital, trae también");
    N.push("  cantidad_reservada.   O sea que la copia se quedó sin la columna.");
    N.push("");
    N.push("  Y LA DIVERGENCIA QUE SÍ ES UN RIESGO: L334, la caja, hace");
    N.push("");
    N.push("    UPDATE ventas SET estado = 'Completada' WHERE id_venta = $1");
    N.push("");
    N.push("  SIN la condición de estado en el WHERE.   El digital sí la tiene, L594 y L621, que");
    N.push("  es un compare-and-set.   O sea que en la caja, si dos cajeros cobran la misma venta");
    N.push("  a la vez, el primero la completa y el segundo también cree que la completó.   El");
    N.push("  FOR UPDATE de L279 hace que se esperen y el estado de L283 lo comprueba, pero la");
    N.push("  escritura de L334 no lo vuelve a comprobar.   La ventana es de milisegundos,");
    N.push("  pero la puerta existe.");
    N.push("");
    N.push("  Y LA DIFERENCIA DE NEGOCIO QUE MÁS DUELE, que va al revés: el guarda de las");
    N.push("  transacciones que ya existen es DISTINTO en los dos métodos, y el de la caja es");
    N.push("  el mejor.");
    N.push("");
    N.push("    Digital, L151-157   SELECT id_transaccion FROM transacciones_pago");
    N.push("                       WHERE id_venta = $1 LIMIT 1");
    N.push("      y L156, La venta ya fue procesada.   RECHAZA CUALQUIER");
    N.push("      TRANSACCIÓN ANTERIOR, INCLUIDO UNA RECHAZADA.");
    N.push("");
    N.push("    Caja, L250-255      SELECT id_transaccion FROM transacciones_pago");
    N.push("                       WHERE id_venta = $1");
    N.push("                         AND estado IN ('Pendiente', 'Aprobado')");
    N.push("      y L257, La venta ya fue cobrada.   UNA RECHAZADA NO");
    N.push("      BLOQUEA, Y EL CLIENTE PUEDE REINTENTAR.");
    N.push("");
    N.push("  Y ESO ES UN BUG DEL CASO ANTERIOR, QUE SE VE DESDE ESTE: si el pago digital de CU35");
    N.push("  se rechaza, L617-642 deja la transacción en 'Rechazado', y entonces CU26 no deja");
    N.push("  crear otra, y la venta se queda bloqueada PARA SIEMPRE.   El cliente no puede");
    N.push("  reintentar con otra tarjeta.   En la caja sí puede, porque el guard es distinto.   Y");
    N.push("  los dos métodos están a 40 líneas uno del otro.");
    N.push("");
    N.push("Y LOS HALLAZGOS 5, 6 Y 7, que salen de las tablas y de los literales, y que hay que");
    N.push("decir aquí en corto porque son de otra clase:");
    N.push("" );;
    N.push("  5  EL PROVEEDOR SE ESCRIBE COMO CAJA.   L324 lo pone en la columna");
    N.push("     proveedor_pasarela, VARCHAR(40) en schema.sql L444, y PROVEEDORES_CAJA son solo");
    N.push("     LIBELULA y STRIPE, L39.   O sea que la columna acepta un valor que ninguna lista");
    N.push("     del proyecto conoce.   La tabla no tiene CHECK ni índice, así que nada lo para, y el");
    N.push("     mismo valor se repite en la bitácora, L369.   Un informe que agrupe por proveedor");
    N.push("     tendrá tres más una caja que no es un proveedor.");
    N.push("" );;
    N.push("  6  EL IVA SE CALCULA EN CUATRO SITIOS.   Tres en el servidor, idénticos letra por letra:");
    N.push("     Ventas L218, L348 y L494, con el mismo ternario de producto-o-categoría.   Y el");
    N.push("     cuarto en el cliente, AdminCaja L227, que es el que el cajero le enseña al cliente.");
    N.push("     HOY NO HAY ERROR, y ese es el peligro: buscarProductosPos, L357, ya devuelve la");
    N.push("     tasa resuelta en porcentaje_iva, y los dos precios hacen precio_especial ?? precio_base,");
    N.push("     L345 y L491.   Pero el que lea L227 no ve el fallback a la categoría, y si añade una");
    N.push("     prenda a mano, o cambia el SELECT de L323, el desajuste aparece solo y en silencio.");
    N.push("     Y en una caja el cliente oye el precio antes de que se le cobre.");
    N.push("" );;
    N.push("  7  LOS ERROR DESNUDOS SON UN PATRÓN DEL PROYECTO.   En este caso hay tres, los tres en");
    N.push("     el camino: Ventas L524, Pagos L330 y Pagos L415.   El resto de los dos ficheros usa");
    N.push("     excepciones de Nest, 8 NotFoundException y 9 ConflictException en pagos.   Un Error");
    N.push("     desnudo sale como 500 CON EL STACK TRACE, y main.ts, L15-47, no monta ningún filtro");
    N.push("     de excepciones.   Pero lo que hace que sea de otra clase es el conteo: hay");
    N.push("     TREINITA throw new Error en los 149 ficheros .ts y .tsx, en quince servicios, casi");
    N.push("     todos con el mismo molde.   Así que arreglar estos tres no sirve de nada: lo que");
    N.push("     falta es un filtro global, que es una línea.");
    N.push("" );;
    N.push("LO QUE ESTÁ BIEN, Y SON OCHO COSAS");
    N.push("");
    N.push("  1. LA RAMA DE EFECTIVO SE CIERRA ENTERA EN UN SOLO REQUEST. De L276 a L351 la");
    N.push("     transacción, y después el comprobante y las dos bitácoras.   El cajero cobra, ve");
    N.push("     el vuelto, imprime el comprobante y puede seguir con el siguiente.   Sin estado");
    N.push("     pendiente, sin pestaña que abrir y sin tarea que ejecutar.   Para una caja es");
    N.push("     exactamente lo que hace falta.");
    N.push("");
    N.push("  2. Y EL BLOQUEO ESTÁ EN EL ORDEN CORRECTO.   El FOR UPDATE de la venta, L279, y el");
    N.push("     SELECT de cada prenda con su FOR UPDATE, L301-302, van antes de comparar el");
    N.push("     stock, que está en L312.   Se comprueba DESPUÉS de bloquear y nunca antes.");
    N.push("");
    N.push("  3. Y EL AUTOR CUENTA CON EL DOBLE.   El digital usa exigirPermisoPagar, L78, y la");
    N.push("     caja exigirPermisoCaja, L85: dos métodos distintos con el MISMO permiso.   Hay");
    N.push("     dos puertas que se pueden abrir por separado en el futuro, y las puso.");
    N.push("");
    N.push("  4. Y LA PERTENENCIA SE COMPRUEBA POR SUCURSAL, que es lo que una caja necesita y");
    N.push("     lo que el digital no tiene: L243, contra el L144 del digital, que comprueba el");
    N.push("     usuario.   Un cajero no puede cobrar la venta de otra tienda, y el error es el");
    N.push("     mismo 404 con el mismo texto, L244.   Cuarto 404 igual en el proyecto.");
    N.push("");
    N.push("  5. Y EL GUARDA DEL MONTO DICE CUÁNTO FALTA, L266-269: El monto recibido es");
    N.push("     insuficiente. Faltan Bs 50.00.   Es el único sitio de todo el proyecto que da");
    N.push("     la cantidad exacta, y es justo el dato que el cajero necesita para el cambio.");
    N.push("");
    N.push("  6. Y EL ROLDO SE CALCULA EN EL SERVIDOR, L260-263, no en la pantalla.   El vuelto");
    N.push("     sale del total de la base y la pantalla solo lo pinta, L661-664.   El cajero no");
    N.push("     puede decidir cuánto se cobra, aunque puede equivocarse en lo que enseña.");
    N.push("");
    N.push("  7. Y LA PANTALLA MANEJA EL 401 EN LOS TRES SITIOS, L143, L178 y L285, con");
    N.push("     navigate('/login').   SandboxPago lo hacía en uno solo, L127.");
    N.push("");
    N.push("  8. Y EL PRECIO DE LA VENTA ES EL DE LA VENTA, L290, con precio_unitario de");
    N.push("     venta_items, y no el de catálogo de hoy.   El comprobante sale con lo que se");
    N.push("     cobró, aunque el precio haya cambiado desde que se creó la venta.");
    N.push("");
    N.push("SOBRE LA COLOCACIÓN DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Anchura: las diez cabeceras separadas " + PASO + " px, con " + ANCHO_CAB + " de ancho. Quedan");
    N.push("  65 px entre una y otra. Altura: " + PASO_MSG + " px por mensaje. El mensaje 1 cae en la y " + Y_MSG0);
    N.push("  y el " + TOTAL_MSG + " en la y " + (Y_MSG0 + (TOTAL_MSG - 1) * PASO_MSG) + ".");
    N.push("");
    N.push("  Un detalle que hizo fallar estos diagramas dieciséis veces y que conviene no");
    N.push("  olvidar: EA guarda Top y Bottom en NEGATIVO, porque trabaja en coordenadas");
    N.push("  cartesianas con la Y creciendo hacia arriba. Si se le pasa la Y en positivo no da");
    N.push("  error, simplemente no coloca nada y todos los objetos se quedan en el mismo");
    N.push("  punto. En las dos funciones de colocación de este script está escrito o.Top = 0 - y");
    N.push("  y o.Bottom = 0 - y - alto. En el AddNew, en cambio, la Y va en positiva, porque ahí");
    N.push("  EA ya la convierte.");
    N.push("");
    N.push("  Y LA BANDA DE LOS HALLAZGOS EMPIEZA EN LA X " + X_NOTA + ", que es donde acaban las cabeceras y los");
    N.push("  marcos.   X_NOTA = 700, que es lo que tenia CU26 y CU27, dibuja la banda ENCIMA");
    N.push("  de los lifelines.  Aqui no.");
    N.push("");
    N.push("  Comprobación de esta ejecución, leída del modelo de objetos:");
    N.push("    objetos en el diagrama: " + ch.leidos);
    N.push("    con la Y crecida, o sea colocados: " + ch.bien);
    N.push("    mensajes dibujados: " + r.puestos + " de " + TOTAL_MSG);
    N.push("    mensajes a sí mismo: " + r.autodestino);
    N.push("    conectores en el diagrama: " + r.enDiagrama);
    N.push("    MARCOS de fragmento colocados: " + MARCOS_PUESTOS + " de 4");
    N.push("    BARRAS de activación colocadas: " + BARRAS_PUESTAS + " de 3");
    N.push("");
    N.push("  Y UN AVISO QUE HAY QUE REPETIR: los cuatro marcos y las tres barras son FORMAS");
    N.push("  dibujadas por script, NO son fragmentos nativos de EA.   EA no los coloca de forma");
    N.push("  fiable por API.   Cada uno va en try/catch y cuenta los que ha puesto, y el informe");
    N.push("  final lo dice.   Si alguno sale a 0, hay que dibujarlo a mano.");
    N.push("");
    N.push("  Y OTRO AVISO, DE ESTE CASO: los tres bucles están SOLO en la rama 1 del alt, la de");
    N.push("  efectivo.   La rama 2 no tiene ninguno.   Si alguien mueve un marco, que no lo");
    N.push("  subraye sobre la rama de tarjeta, porque ahí no hay bucle que dibujar.");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU29 Secuencia", 0); } catch (e) { }
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
    T.push("CU29 - DIAGRAMA DE SECUENCIA - INFORME");
    T.push("");
    T.push("Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB);
    T.push("Tipo de diagrama: " + tipoUsado);
    T.push("Mensajes: " + r.puestos + " de " + TOTAL_MSG);
    T.push("Mensajes a sí mismo: " + r.autodestino);
    T.push("Conectores en el diagrama: " + r.enDiagrama);
    T.push("Hallazgos: " + h2.total + " de " + TOTAL_HAL + ", banda hasta la y " + h2.fin);
    T.push("");
    T.push("AVISO DE NUMERACIÓN");
    T.push("Este caso es CU29 en el documento y CU37 en el código, y el título");
    T.push("COINCIDE EXACTO. Es el segundo caso de la serie con eso, el primero");
    T.push("fue CU29 del documento, que es CU35 del código, el de la pasarela.");
    T.push("Y en api.ts están PEGADOS, L1902 y L1903, y comparten servicio.");
    T.push("");
    T.push("MARCOS Y BARRAS  <-- MIRA ESTO");
    T.push("Este caso tiene 1 alt y TRES loop. Contado ANTES de dibujar, con");
    T.push("contadores, sobre las 784 líneas de SRV_PagosService:");
    T.push("  for 6   while 0   Promise.all 0   continue 2   map 0");
    T.push("  filter 0   reduce 0   ternarios 10");
    T.push("  if 40   throw 29   NotFoundException 8   ConflictException 9");
    T.push("  dataSource.query 13   em.query 15   transaction 2");
    T.push("  try 1   catch 1   bitacora 9   FOR UPDATE 4");
    T.push("");
    T.push("Y LOS 6 for, REPARTIDOS EN DOS MÉTODOS:");
    T.push("  L296  procesarPagoCaja   <-- LOOP 1 DEL CASO");
    T.push("  L309  procesarPagoCaja   <-- LOOP 2 DEL CASO");
    T.push("  L336  procesarPagoCaja   <-- LOOP 3 DEL CASO");
    T.push("  L667  procesarResultado  que es CU35, NO es de este caso");
    T.push("  L680  procesarResultado  que es CU35, NO es de este caso");
    T.push("  L706  procesarResultado  que es CU35, NO es de este caso");
    T.push("");
    T.push("Y CON UN DATO QUE HAY QUE MIRAR: los TRES bucles del caso están");
    T.push("SOLO en la rama 1 del alt, la de efectivo, de L296 a L350.  La");
    T.push("rama 2, la de tarjeta, QR y transferencia, L399-447, NO tiene ni");
    T.push("un bucle ni una transaccion.  O sea que las dos ramas del alt");
    T.push("tienen una calidad de código distinta, y se ve en el diagrama.");
    T.push("");
    T.push("EL alt, Y POR QUÉ ESTE SÍ Y EN CU35 NO:");
    T.push("  Un alt de verdad es una decisión con DOS CAMINOS EXCLUYENTES");
    T.push("  que hacen cosas distintas.  Aquí la hay, y es una línea, L265:");
    T.push("  if (metodo === 'Efectivo') { ... 131 líneas ... return }");
    T.push("  Una rama abre transacción, bloquea dos filas, toca el");
    T.push("  inventario, emite comprobante y devuelve Completada.  La otra");
    T.push("  mete una fila y devuelve una URL.  Son dos negocios.");
    T.push("  En CU35 NO hay alt porque sus tres caminos, L518, L522 y L545,");
    T.push("  son tres throw y un return CONSECUTIVOS del mismo if: son");
    T.push("  tres formas de terminar, no dos mitades de una decisión.");
    T.push("");
    T.push("SOBRE QUÉ ELEMENTO ESTÁ CADA MARCO:");
    T.push("  alt    sobre SRV_PagosService  L265  efectivo / tarjeta");
    T.push("  loop 1 sobre SRV_PagosService  L296  SELECT con FOR UPDATE");
    T.push("  loop 2 sobre SRV_PagosService  L309  compara en memoria");
    T.push("  loop 3 sobre SRV_PagosService  L336  UPDATE e INSERT");
    T.push("El nombre sale de las coordenadas del marco con lifelineEnX(), no");
    T.push("está escrito a mano, así que no puede desincronizarse.");
    T.push("");
    T.push("Fragmentos colocados: " + MARCOS_PUESTOS + " de 4");
    T.push("Barras de activación colocadas: " + BARRAS_PUESTAS + " de 3");
    T.push("Si alguno sale a 0, EA no ha aceptado la forma y hay que dibujarlo");
    T.push("a mano.  Los 7 son FORMAS dibujadas por script, no fragmentos");
    T.push("nativos de EA: EA no los coloca por API de forma fiable.  El marco");
    T.push("lleva pestaña con el tipo, el elemento y la condición.");
    T.push("");
    T.push("HALLAZGOS");
    T.push("  1  El cajero tiene que abrir el banco y aprobar su propio cobro.");
    T.push("     terminal_url, L442, es ${FRONTEND_URL}/sandbox-pago?tx=N, y");
    T.push("     FRONTEND_URL es localhost:5173 por defecto, L41.  El botón");
    T.push("     se llama Abrir terminal de la pasarela, L691, y hace");
    T.push("     window.open.  Y no lo puede hacer el cliente: el sandbox pide");
    T.push("     sesión, L75, y su endpoint pide realizar_venta, L78.");
    T.push("  2  El cajero NUNCA puede imprimir el comprobante con tarjeta.  El");
    T.push("     botón de L671 exige ventaOk.estado === 'Completada', y en la");
    T.push("     rama 2 ese estado se quedó en 'Pendiente' para siempre: hay");
    T.push("     4 setVentaOk y ninguno lo vuelve a leer.  Cero setInterval.");
    T.push("  3  La sucursal sale de un LIMIT 1 SIN ORDER BY, L91-93, y esa");
    T.push("     tabla no tiene clave primaria.  Un empleado en dos sucursales");
    T.push("     cobra de una u otra, y descuenta el stock de esa.  El método");
    T.push("     está escrito dos veces, L90-99 y L365, con el mismo fallo.");
    T.push("  4  El código es copia literal del de CU35, 54 líneas duplicadas, y");
    T.push("     YA HA DIVERGIDO: L299, el SELECT de la caja, se quedó sin");
    T.push("     cantidad_reservada, y el L670 del digital sí la tiene.  Y L334");
    T.push("     hace el UPDATE de la venta SIN compare-and-set, que el");
    T.push("     digital sí tiene en L594 y L621.");
    T.push("  5  El proveedor se escribe como 'CAJA', L324, y ese valor no está");
    T.push("     en PROVEEDORES_CAJA, que son LIBELULA y STRIPE, L39.  La");
    T.push("     columna VARCHAR(40) lo acepta y ninguna lista lo conoce.");
    T.push("  6  El IVA se calcula en CUATRO sitios, tres en el servidor idénticos");
    T.push("     letra por letra, L218, L348 y L494, y el cuarto en el cliente,");
    T.push("     L227, que es el que ve el cajero.  Hoy coinciden porque L357");
    T.push("     ya devuelve la tasa resuelta, y por eso el fallo sería invisible.");
    T.push("  7  Dos Error DESNUDOS, L330 y L415, en 784 líneas que usan 8");
    T.push("     NotFoundException y 9 ConflictException.  Salen como 500 con");
    T.push("     el stack trace, y no hay filtro de excepciones en main.ts.");
    T.push("  8  Y ocho cosas buenas.  La primera: la rama de efectivo se cierra");
    T.push("     entera en un request, de L276 a L351, con el FOR UPDATE antes");
    T.push("     de comparar, y el vuelto sale del servidor, no de la pantalla.");
    T.push("");
    T.push("COLOCACIÓN");
    T.push("Objetos en el diagrama: " + ch.leidos);
    T.push("Con la Y crecida, o sea colocados: " + ch.bien + " de " + ch.leidos);
    T.push("Banda de hallazgos desde la x " + X_NOTA + ", que es donde acaban las cabeceras.");
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
    msg = msg + "CU29 - Procesar Pago en Caja" + SALTO;
    msg = msg + "Diagrama de secuencia, sección 3.3.2.1." + SALTO;
    msg = msg + "En el código del proyecto este caso es CU37, y el título" + SALTO;
    msg = msg + "COINCIDE EXACTO, como CU35 el caso anterior." + SALTO + SALTO;
    msg = msg + "10 líneas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "1 alt y 3 loop. Sobre qué elemento está cada uno:" + SALTO;
    msg = msg + "  alt    SRV_PagosService  L265  efectivo / tarjeta" + SALTO;
    msg = msg + "  loop 1 SRV_PagosService  L296  SELECT con FOR UPDATE" + SALTO;
    msg = msg + "  loop 2 SRV_PagosService  L309  compara en memoria" + SALTO;
    msg = msg + "  loop 3 SRV_PagosService  L336  UPDATE e INSERT" + SALTO;
    msg = msg + "Los tres loop están SÓLO en la rama de efectivo, L296-350." + SALTO;
    msg = msg + "La rama de tarjeta, L399-447, no tiene ninguno." + SALTO;
    msg = msg + "FRAGMENTOS colocados: " + MARCOS_PUESTOS + " de 4." + SALTO;
    msg = msg + "BARRAS colocadas: " + BARRAS_PUESTAS + " de 3." + SALTO;
    if (MARCOS_PUESTOS < 4 || BARRAS_PUESTAS < 3) msg = msg + "  Si falta alguno, hay que dibujarlo a mano." + SALTO;
    msg = msg + SALTO;
    msg = msg + "HALLAZGO PRINCIPAL: terminal_url, L442, es" + SALTO;
    msg = msg + "${FRONTEND_URL}/sandbox-pago?tx=N.  O sea que para cobrar" + SALTO;
    msg = msg + "con tarjeta el cajero tiene que abrir el banco simulado en" + SALTO;
    msg = msg + "otra pestaña y APROBAR SU PROPIO COBRO, L691.  Y no lo" + SALTO;
    msg = msg + "puede hacer el cliente: el sandbox pide sesión, L75, y su" + SALTO;
    msg = msg + "endpoint pide realizar_venta, L78." + SALTO + SALTO;
    msg = msg + "Y POR ESO NUNCA IMPRIME EL COMPROBANTE: el botón de L671" + SALTO;
    msg = msg + "exige estado Completada, y en la rama de tarjeta ese estado" + SALTO;
    msg = msg + "se quedó en Pendiente para siempre.  Cero setInterval en 713" + SALTO;
    msg = msg + "líneas, y cuatro setVentaOk y ninguno relee." + SALTO + SALTO;
    msg = msg + "Y LA SUCURSAL sale de un LIMIT 1 sin ORDER BY, L91-93, en" + SALTO;
    msg = msg + "una tabla sin clave primaria.  Un empleado en dos" + SALTO;
    msg = msg + "sucursales cobra de una u otra, según el día." + SALTO + SALTO;
    msg = msg + "Lo bueno: la rama de efectivo se cierra entera en un solo" + SALTO;
    msg = msg + "request, de L276 a L351, con el FOR UPDATE antes de" + SALTO;
    msg = msg + "comparar el stock, y el vuelto se calcula en el servidor." + SALTO + SALTO;
    msg = msg + "Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACIÓN: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU29 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU29 Secuencia", 0); } catch (e3) { }
}
