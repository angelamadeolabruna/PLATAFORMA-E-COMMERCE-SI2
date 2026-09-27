// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU27  Procesar Pago con Pasarela de Pago
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/router.tsx                          L55, /sandbox-pago
//     web/src/pages/SandboxPago.tsx               238 lineas
//     web/src/lib/api.ts                          L1969-1985
//     api/src/modulos/seguridad/dependencias.ts
//     api/src/modulos/pagos/CTR_Pagos.ts           156 lineas
//     api/src/modulos/pagos/SRV_PagosService.ts    784 lineas
//     api/src/modulos/comprobantes/SRV_ComprobantesService.ts
//     api/src/modulos/recomendaciones/SRV_PreferenciasService.ts
//     api/src/modulos/seguridad/SRV_BitacoraService.ts
//     BASE DE DATOS/schema.sql   L408-418, L421-435, L645-657
//
// QUE HACE ESTE CASO
//   Dos endpoints, y solo uno tiene guard:
//
//     1  La pantalla del banco simulado llama a POST /pagos/sandbox/gateway
//     2  Y ESE, al final, se llama a si mismo por POST /pagos/webhook,
//        que es el unico endpoint del proyecto SIN sesion
//
//   Y TIENE TRES BUCLES, que es lo que hace este caso distinto de
//   los demas: los tres estan en el MISMO lifeline, el del servicio
//   de pagos, y los tres estan dentro de la MISMA transaccion.
//
//   40 mensajes. 10 lineas de vida. 8 hallazgos.
//   3 fragmentos: tres loop y ningun alt. Explicado mas abajo.
//
// LOS FRAGMENTOS: TRES loop Y NINGUN alt
//   Contado ANTES de dibujar, con contadores, sobre las 784 lineas de
//   SRV_PagosService:
//
//     for 6   while 0   Promise.all 0   continue 2   map 0
//     if 40   throw 29   ternarios 10   reduce 0   filter 0
//     dataSource.query 13   em.query 15   transaction 2
//     try 1   catch 1   bitacora 9   FOR UPDATE 4
//
//   Y DE LOS 6 for, LOS TRES DE ESTE CASO SON LOS DE procesarResultado,
//   Y ESTAN SEGUIDOS, DEL 667 AL 720:
//
//     LOOP 1  L667  for ( const item of items )
//             L668-676  un SELECT con FOR UPDATE por prenda
//             y L677 apila el resultado en un array
//
//     LOOP 2  L680  for ( const item of stocks )
//             L683-686  comprueba el stock que YA se leyo y YA esta
//             bloqueado en el loop 1
//
//     LOOP 3  L706  for ( const item of stocks )
//             L709-714  UPDATE de cantidad_vendida
//             L715-719  INSERT del movimiento, que dispara el trigger
//
//   Y LOS OTROS 3 for, L296, L309 y L336, son de procesarPagoCaja, que
//   es CU37. Se cuentan aparte.
//
//   O SEA QUE ESTE CASO TIENE TRES BUCLES Y CERO alts, y es el caso
//   con mas bucles por lifeline de toda la serie: los tres estan en
//   SRV_PagosService, y los tres en un solo metodo.
//
//   NO HAY NINGUN alt. De los 40 if del fichero, los que son de este
//   caso son cinco, y los cinco son guardas: la transaccion no existe,
//   la venta no esta PENDIENTE, el monto no coincide, el estado ya no
//   es Pendiente, y el stock cambio.
//
//   Y las 3 barras de activacion: la del controlador, la del
//   servicio de pagos, y la del servicio de comprobantes, que se
//   llama al final y por eso tiene la suya.
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
// LOS MARCOS DICEN SOBRE QUE ELEMENTO ESTAN
//   La pestaña de cada fragmento lleva tres lineas: el tipo, el
//   elemento al que pertenece, y la condicion.   Y el elemento se
//   saca de las coordenadas del marco, no esta escrito a mano, asi
//   que no puede desincronizarse del lifeline.
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
var TOTAL_MSG = 40;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU27 Secuencia Pago con Pasarela";
var DIAG_NOMBRE = "CU27 Pago con Pasarela";
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
    ["U", "ACTOR_Cliente", "Actor", "Lifeline", "Cliente", "quien aprueba el pago", "Actor, no clase: es quien pulsa", "no es codigo, es la persona. Y aqui decide si su pago se aprueba o se rechaza"],
    ["X", "SandboxPago.tsx", "Object", "Lifeline", "SandboxPago", "238 lineas, el banco", "Boundary", "web/src/pages/SandboxPago.tsx, 238 lineas. L114 confirmar, y L189, L199 y L207 los TRES botones"],
    ["H", "api.ts", "Object", "Lifeline", "api", "seccion CU35", "Boundary", "web/src/lib/api.ts, L1902 la seccion y L1969-1985 el simularPasarela"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "en 1 de los 2", "Control", "api/src/modulos/seguridad/dependencias.ts. L125 lo lleva el sandbox y L142-144 NO lo lleva el webhook"],
    ["V", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "dos DTO distintos", "Control", "api/src/main.ts, L22-43, y los DTO de CTR_Pagos L47-57 y L59-74"],
    ["C", "CTR_Pagos", "Object", "Lifeline", "PagosController", "156 lineas, 2 endpoints", "Control", "api/src/modulos/pagos/CTR_Pagos.ts, L123-131 el sandbox y L142-151 el webhook"],
    ["P", "SRV_PagosService", "Object", "Lifeline", "PagosService", "784 lineas, 3 bucles AQUI", "Control", "api/src/modulos/pagos/SRV_PagosService.ts. L497 simularPasarela, L480 procesarWebhook, L548-760 procesarResultado. LOS TRES BUCLES DEL CASO SON L667, L680 y L706, EN ESTE ELEMENTO"],
    ["M", "SRV_ComprobantesService", "Object", "Lifeline", "ComprobantesService", "generar(), idempotente", "Control", "api/src/modulos/comprobantes/SRV_ComprobantesService.ts, y es el caso CU38. Se llama desde L727, FUERA de la transaccion"],
    ["F", "SRV_PreferenciasService", "Object", "Lifeline", "PreferenciasService", "registrarPreferenciasVenta", "Control", "api/src/modulos/recomendaciones/SRV_PreferenciasService.ts, desde L769, con try/catch propio"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "4 tablas y un trigger", "Entity", "schema.sql: comprobantes L408, movimientos_inventario L421, transacciones_pago L440, inventario_stock; y el trigger trg_movimiento_inventario, L654"]
];

var MSG = [
    [1, "U", "X", "1. llega a /sandbox-pago?tx=NNN   router.tsx L55, dentro del LayoutRaiz de L48 y SIN guard de cliente: /reservas, /compras y /recomendaciones, L87, L93 y L97, si lo tienen con ClienteLayout, y /admin lo tiene en AdminLayout, L65   Y el id va en el query string, no en la ruta: L46, params.get('tx')   O sea que con la URL se llega, y el que la controla el backend", "S"],
    [2, "X", "H", "2. GET del estado primero: api.ts, y L64-68, setEstado(tx.estado), setDetalle y setMonto, L64, L48-49.   O sea que la pantalla consulta el estado de la transaccion al abrirse, antes de mostrar los botones", "S"],
    [3, "X", "X", "3. pero DENTRO de la pantalla si hay un control: L75, if (usuario === null), y si no hay usuario en el contexto pinta un aviso con un ShieldCheck y no deja pulsar nada.   O sea que la ruta es publica pero la pantalla no.   Y tiene CUATRO salidas, no tres: L189 Aprobado, L199 Rechazado, L207 no_responde, y L224 un cuarto boton, con el RefreshCcw en L225 y el texto Reintentar pago, que vuelve a llamar confirmar('Aprobado') dentro del bloque estado === 'Rechazado' de L222", "S"],
    [4, "X", "H", "4. POST /api/v1/pagos/sandbox/gateway   api.ts L1981, seccion CU35 - Procesar Pago con Pasarela de Pago, L1902   Y el cuerpo, L1969: id_transaccion, resultado y detalle", "S"],
    [5, "H", "G", "5. con Authorization Bearer   Y aqui SI hay guard: @UseGuards(JwtAuthGuard) en CTR_Pagos L125, que es el primero de los dos endpoints de este caso   O sea que la pantalla del banco pide sesion, y el webhook no. Lo veremos", "S"],
    [6, "G", "V", "6. SimularPasarelaRequest, L47-57: id_transaccion con @IsInt, resultado con @IsIn de los TRES valores (Aprobado, Rechazado, no_responde), y detalle opcional con @IsString.   O sea que el timeout del banco es un valor del DTO, del mismo rango que los otros dos", "S"],
    [7, "V", "C", "7. simularPasarela( @Body() body, @Req() request ), L126-131, con @HttpCode(HttpStatus.OK) en L124   O sea que 200 y no 201, y el codigo no cambia entre aprobado, rechazado y timeout", "S"],
    [8, "C", "P", "8. simularPasarela( usuario, dto, request ), L497, y empieza con exigirPermisoPagar, L502.   Que es el MISMO permiso de CU26: realizar_venta, L78.   O sea que este caso tiene el cuarto bug de permiso, y en el servidor", "S"],
    [9, "P", "D", "9. SELECT t.id_transaccion, t.id_usuario, t.monto, v.total AS venta_total FROM transacciones_pago t JOIN ventas v ON v.id_venta = t.id_venta WHERE t.id_transaccion = $1 LIMIT 1, L506-510   Consulta 1   Y el guarda de pertenencia, L514-516, con 404 'Transacción no encontrada.'   O sea que solo el dueno de la transaccion puede decidir", "S"],
    [10, "P", "P", "10. y aqui se separan los TRES caminos, y el primero es el timeout: [resultado == 'no_responde'] 504 'La pasarela de pago no respondió. Intenta de nuevo en unos ...', L518-520.   Un caso de uso entero se queda colgado por lo que pinche la persona, y con el codigo HTTP del timeout", "S"],
    [11, "P", "P", "11. y el quinto guarda: [el resultado no es Aprobado ni Rechazado] 422 'Resultado de pago inválido.', L522-524.   O sea que el no_responde se resolve ANTES, y este solo coge los otros dos", "S"],
    [12, "P", "P", "12. y aqui esta el HALLAZGO 1, y es la linea que hace que todo lo demas sea simulado: L537-543, la notificacion, y L545, return this.procesarWebhook( notificacion, request )   O sea que el SIMULADOR se llama a si mismo por el webhook, y la firma la hace el servidor con FIRMA_SECRETO, L542", "S"],
    [13, "P", "P", "13. procesarWebhook( dto, request ), L480, y este NO LLEVA GUARD.   Ni sesion, ni permiso, ni usuario.   Y su unico control es la firma: L484 la calcula y L485-487, si no coincide, 401 'Firma inválida.'   O sea que lo unico que separa un webhook real de uno falso es un secreto que esta escrito en el codigo", "S"],
    [14, "P", "P", "14. y procesarResultado( id, estado, monto, detalle, request ), L548   O sea que el webhook no hace nada por si mismo: delega.   Y el codigo del resultado va en el MISMO parametro que la firma, o sea que la firma incluye el resultado que se quiere", "S"],
    [15, "P", "D", "15. SELECT t.id_transaccion, t.id_venta, t.id_usuario, t.monto, t.moneda, t.metodo, t.estado AS tx_estado, t.detalle AS tx_detalle, v.total AS venta_total, v.estado AS venta_estado, v.id_carrito, v.id_sucursal, v.modalidad AS venta_modalidad FROM transacciones_pago t JOIN ventas v .. WHERE t.id_transaccion = $1 LIMIT 1, L557-564   Consulta 2.   Trece columnas de dos tablas en un SELECT", "S"],
    [16, "P", "P", "16. y el idempotente, L577: [el estado de la transaccion ya no es Pendiente] devuelve el estado ACTUAL sin reprocesar, L578-586, con reprocesado: false en L584.   Y el comentario del autor, L576, dice E9 y explica por que.   O sea que un webhook repetido, que es lo normal en una pasarela, no rompe nada", "A"],
    [17, "P", "P", "17. y el segundo camino: el guard del monto, L591.   Si el monto notificado no es el total de la venta, L588, la transaccion se rechaza: UPDATE transacciones_pago SET estado = 'Rechazado', detalle = 'Monto no válido' WHERE id_transaccion = $1 AND estado = 'Pendiente', L593-594.   Con su bitacora y su oldData real, L604-605, y reprocesado: true en la respuesta", "S"],
    [18, "P", "D", "18. y el tercer camino: [estado == 'Rechazado'] L617, y la razon sale de detalle o del texto por defecto 'Pago rechazado por la pasarela.', L618.   UPDATE a Rechazado con el detalle, L620-621, con su bitacora, L624-633.   Y en este camino la venta NO se toca: se queda en Pendiente, y el mensaje de la bitacora, L628, lo dice", "S"],
    [19, "P", "P", "19. y si no, el camino feliz, y aqui empieza la transaction, L647.   O sea que de los tres caminos del resultado, SOLO UNO abre transaccion. Los otros dos hacen un UPDATE suelto", "S"],
    [20, "P", "D", "20. y el primer guardia de la transaction, L648-653: SELECT id_venta, estado, id_carrito, id_sucursal, modalidad FROM ventas WHERE id_venta = $1, con FOR UPDATE.   Consulta 3.   Y L654-656: [la venta no esta PENDIENTE] 409 'La venta ya fue procesada.'   O sea que la venta tambien se bloquea, y con la fila de la venta el de la transaccion", "A"],
    [21, "P", "D", "21. y carga los items vendidos, L658-664: SELECT vi.id_ptc, vi.cantidad, vi.precio_unitario FROM venta_items vi WHERE vi.id_venta = $1 ORDER BY vi.id_venta_item ASC   Consulta 4.   Y mira el precio_unitario de la VENTA, L659, no el de catalogo de hoy, o sea que el comprobante sale con el precio que se cobro", "S"],
    [22, "P", "P", "22. y aqui empieza el LOOP 1 DEL CASO, L667: for ( const item of items )   Y es el que hace el trabajo de verdad: L668-676 trae SELECT id_ptc, cantidad_disponible, cantidad_reservada FROM inventario_stock WHERE id_ptc = $1 AND id_sucursal = $2 FOR UPDATE", "S"],
    [23, "P", "D", "23. vuelta 1, y el FOR UPDATE, L670-673: bloquea la fila de inventario_stock de ESA prenda hasta el final de la transaccion.   O sea que dos pagos a la vez de la MISMA prenda no se pueden pasar el stock: la segunda espera, y cuando entra ya ve el numero actualizado.   CONTADO EN TODO EL PROYECTO: hay NUEVE FOR UPDATE en el codigo, cuatro en este servicio y cinco en el de reservas.   Este, L673, es el cuarto de los cuatro del fichero, y el segundo de los dos de procesarResultado.   Los otros dos del fichero, L279 y L302, son de procesarPagoCaja, que es CU37", "S"],
    [24, "P", "P", "24. vuelta 2, 3, hasta N: el mismo SELECT con FOR UPDATE por prenda, y L677 apila el resultado en el array stocks con ...(stock ?? { cantidad_disponible: 0 }).   O sea que si no hay fila de inventario, no falla: sigue con cero.   Con 6 prendas son 6 bloqueos de fila, todos dentro de la misma transaccion", "S"],
    [25, "P", "P", "25. y aqui empieza el LOOP 2 DEL CASO, L680: for ( const item de stocks ), y lo unico que hace es COMPARAR en memoria, L683: [disponible < cantidad] 409 con el texto 'El stock de este producto cambió. Disponible: N. No se completar la venta', L685.   O sea que lee del array que el loop anterior lleno, sin tocar la base", "S"],
    [26, "P", "P", "26. y aqui esta el HALLAZGO 2: este bucle comprueba el MISMO dato que el anterior ya leyo y ya bloqueo.   El loop 1 de L670 trae cantidad_disponible y lo apila.   El loop 2 de L682 lo lee del array.   O sea que la validacion de stock se hace DOS veces, y la segunda no puede encontrar nada que la primera no hubiera visto   Y estan separados por CERO lineas de logica, podrian estar en el mismo bucle", "S"],
    [27, "P", "D", "27. y con la validacion pasada, las TRES escrituras de estado, y las tres van antes del loop 3: UPDATE transacciones_pago SET estado = 'Aprobado', L691-693; UPDATE ventas SET estado = 'Completada', L696; y UPDATE carritos SET estado = 'Convertido a venta', L701, con su if de L699 para el carrito nulo", "S"],
    [28, "P", "P", "28. y aqui empieza el LOOP 3 DEL CASO, L706: for ( const item de stocks ), con el continue de L708 si la cantidad es 0 o menos.   Y este es el que toca el inventario de verdad", "S"],
    [29, "P", "D", "29. vuelta 1: UPDATE inventario_stock SET cantidad_vendida = cantidad_vendida + $2 WHERE id_ptc = $1 AND id_sucursal = $3, L710-712.   Y vuelta 2: INSERT INTO movimientos_inventario ( id_ptc, id_sucursal, tipo_movimiento, cantidad, referencia, id_usuario, id_venta ) VALUES ( $1, $2, 'Venta', $3, $4, $5, $6 ), L716-717, con la cantidad NEGATIVA, L718, y la referencia VNT-NNN, L718", "S"],
    [30, "D", "D", "30. y aqui se dispara el trigger trg_movimiento_inventario, L654, un BEFORE INSERT FOR EACH ROW.   Y su funcion, fn_aplicar_movimiento_inventario, L628-652: L633-635 lee el disponible, L641-642 lo mete en stock_anterior y stock_posterior de la propia fila de movimiento, y L645-648 el INSERT en inventario_stock con ON CONFLICT (id_ptc, id_sucursal) DO UPDATE SET cantidad_disponible = inventario_stock.cantidad_disponible + NEW.cantidad.   Como la cantidad es negativa, RESTA.   O sea que el stock baja sin que nadie lo escriba a mano, y funciona por el UNIQUE de L310", "A"],
    [31, "P", "D", "31. y aqui esta el HALLAZGO 3: ese trigger, L645-648, actualiza SOLO cantidad_disponible.   Y el loop 3, L710-712, actualiza SOLO cantidad_vendida.   Y cantidad_reservada, que el loop 1 leyo en L670, NO LA ESCRIBE NADIE en todo este camino   O sea que si la prenda estaba reservada, se vende y la reserva sigue viva   Y cuando se cancele esa reserva, su movimiento de cantidad positiva devuelve el disponible y el stock queda inflado", "S"],
    [32, "P", "P", "32. fin del loop 3, y COMMIT, L721.   O sea que los tres bucles del caso, y las siete escrituras del camino feliz, estan en la misma transaction y se deshacen juntas   Y eso es lo que CU25 no tenia y CU19 tampoco", "A"],
    [33, "P", "F", "33. y aqui FUERA de la transaction: registrarPreferenciasDeVenta( idVenta, idUsuario, request ), L724.   Que es un metodo CON try/catch PROPIO, L768 y L780, y con un comentario que explica el porque, L781: El feedback de preferencias nunca debe impedir completar la venta ni emitir el comprobante   O sea que el autor SI sabe que un try/catch puede tirar el pago entero, y aqui lo evita", "A"],
    [34, "P", "M", "34. y tambien fuera: comprobantesService.generar( idVenta, idUsuario, request ), L727   Que es el caso CU38, y el comentario de L726 dice que generar es idempotente.   O sea que si el webhook llega dos veces, el segundo generar no duplica el comprobante.   O sea que el pago tiene las TRES transacciones bien cerradas y las DOS llamadas de afterward sin cerrar, y las dos son idempotentes", "S"],
    [35, "M", "D", "35. INSERT en comprobantes con el numero, que es UNIQUE, L411, y el NIT y la razon social que el cliente metio en el checkout de CU26   Y devuelve el numero, que es lo que sale en la respuesta", "S"],
    [36, "P", "P", "36. y las DOS ultimas escrituras, que son las dos bitacoras, L730-739 y L740-749, las dos FUERA de la transaction y las dos con oldData REAL.   Las escribe SRV_BitacoraService por el repositorio de TypeORM, no por em.query, y por eso no puede entrar en la transaction, y por eso no hay lifeline para el: { estado: 'Pendiente' } y { estado: 'Aprobado' }, y { estado: 'Pendiente' } y { estado: 'Completada', id_transaccion, numero_comprobante }   O sea que este es el CUARTO sitio del proyecto con oldData de verdad, y el unico que escribe en DOS tablas", "A"],
    [37, "P", "H", "37. { id_transaccion, estado: 'Aprobado', monto, moneda, detalle, reprocesado: true, numero_comprobante }, L751-759   Y el reprocesado, L757, es lo que le dice a la pantalla si esto se ha procesado ahora o si ya estaba", "A"],
    [38, "H", "X", "38. la respuesta   api.ts L1969-1985   Y la pantalla la pinta: L123 setEstado(res.estado), y L154 el Badge del color, y L214 el bloque de aprobado, o L222 el de rechazado, o el boton de reintentar de L224", "A"],
    [39, "X", "U", "39. el cliente ve el resultado.   Y si pincho no responder, ve un 504 y el boton de reintentar, L224   Y si reintenta con Aprobado, todo el camino se repite, y el idempotente de L577 y el generar de L727 hacen que no duplique nada", "A"],
    [40, "U", "U", "40. este caso es el que mueve el inventario de verdad, con el trigger, y es el que tiene mas bucles por elemento de la serie: TRES, todos en SRV_PagosService y todos en un metodo   Y tiene el bug mas raro de todos: la reserva sobrevive a la venta, porque cantidad_reservada se lee y no se escribe nunca en este camino", "A"]
];

var HAL = [
    ["1. El webhook es la puerta trasera, y la llave esta en el codigo", [
        "El hallazgo de seguridad, y en CU26 ya se vio. Aqui se",
        "ve desde el otro lado, que es donde duele.",
        "",
        "LOS DOS ENDPOINTS DE ESTE CASO, y el contraste es el caso:",
        "",
        "  POST /pagos/sandbox/gateway   CTR_Pagos L123-131",
        "    CON @UseGuards(JwtAuthGuard) en L125",
        "    y con exigirPermisoPagar en el servicio, L502",
        "",
        "  POST /pagos/webhook           CTR_Pagos L142-151",
        "    SIN @UseGuards.  Cero.  Ni en el controlador ni en",
        "    el servicio: procesarWebhook, L480, no llama a",
        "    cargarPermisos ni a exigirPermiso ni a clienteDe",
        "",
        "Y ESO, PARA UN WEBHOOK, ES LO CORRECTO. Una pasarela de pago",
        "no tiene cuenta ni sesion ni permiso: no hay usuario que",
        "mandar. O sea que el unico mecanismo de autenticacion",
        "posible es la firma del cuerpo.",
        "",
        "EL PROBLEMA ES QUE LA FIRMA NO SIRVE, por dos cosas:",
        "",
        "1. EL SECRETO ESTA EN EL CODIGO. L40:",
        "",
        "     const FIRMA_SECRETO =",
        "       process.env.PAGO_WEBHOOK_SECRET ?? 'sandbox-secreto-cu35';",
        "",
        "   Si la variable de entorno no esta, la firma se calcula con",
        "   una cadena que esta en el repositorio. Y el codigo que",
        "   hace falta para exploitarla son 3 lineas de la propia",
        "   funcion firmar, L101-105.",
        "",
        "2. Y LA FIRMA SOLO CAMBIA CON EL ESTADO. L103:",
        "",
        "     .update(`${idTransaccion}.${monto}.${estado}`)",
        "",
        "   O sea que la firma de un Rechazado NO sirve para un",
        "   Aprobado, porque el estado va dentro.   Eso es un acierto,",
        "   y es lo unico que impide reutilizar una firma capturada",
        "   para cambiar el veredicto de un pago.",
        "",
        "PERO NO IMPIDE LO OTRO, que es lo grave: la firma no lleva",
        "NI FECHA NI USUARIO.   O sea que la misma firma sirve para",
        "siempre, para ese id y ese monto, y no caduca. Y en este",
        "proyecto el unico endpoint sin sesion acepta eso.",
        "",
        "LO QUE LO HACE MAS BARATO DE EXPLOTAR, y hay que decirlo:",
        "el monto que hay que firmar sale de la propia base, L588,",
        "con venta.total.   O sea que un atacante lee el total de la",
        "tabla ventas, construye id.monto.estado, firma con el",
        "secreto del codigo, y manda el webhook.   El control del",
        "monto de L591, que es lo que parece proteger, compara el",
        "monto contra un dato publico.",
        "",
        "Y LA MITAD BUENA, porque hay que decirla:",
        "",
        "  -  La firma incluye el estado, L103.   Cambiar un",
        "     Rechazado por un Aprobado invalida la firma.",
        "  -  Y firmasCoinciden, L107-112, usa timingSafeEqual con",
        "     la longitud comprobada antes, L110.   Escrito por",
        "     alguien que sabe lo que hace.",
        "",
        "O SEA QUE LA CRITICIDAD DE ESTE HALLAZGO ES EL SECRETO, Y NO",
        "LA COMPARACION. Arreglarlo es una linea: que FIRMA_SECRETO no",
        "tenga valor por defecto, y que el modulo no arranque sin el."
    ]],
    ["2. El stock se comprueba dos veces, y la segunda no puede fallar", [
        "Un hallazgo de logica, y los dos bucles estan uno detras",
        "de otro.",
        "",
        "LOOP 1, L667-678, el que trae el dato:",
        "",
        "  for (const item of items) {",
        "    const stock = this.unaFila(",
        "      await em.query(",
        "        `SELECT id_ptc, cantidad_disponible, cantidad_reservada",
        "         FROM inventario_stock",
        "         WHERE id_ptc = $1 AND id_sucursal = $2",
        "         FOR UPDATE`,",
        "        [item.id_ptc, venta.id_sucursal],",
        "      ),",
        "    );",
        "    stocks.push({ ...item, ...(stock ?? { cantidad_disponible: 0 }) });",
        "  }",
        "",
        "LOOP 2, L680-688, el que lo comprueba:",
        "",
        "  for (const item of stocks) {",
        "    const disponible = Number(item.cantidad_disponible ?? 0);",
        "    if (disponible < cantidad) {",
        "      throw new ConflictException(",
        "        `El stock de este producto cambió. ...`);",
        "    }",
        "  }",
        "",
        "EL DATO DEL LOOP 2 SALE DEL ARRAY DEL LOOP 1. O sea que la",
        "comparacion es puramente en memoria, y ya con la fila",
        "BLOQUEADA con el FOR UPDATE de L673.",
        "",
        "LO QUE ESO QUIERE DECIR, y es lo importante:",
        "",
        "  -  El loop 2 NO PUEDE ENCONTRAR NADA QUE EL LOOP 1 NO",
        "     HUBIERA VISTO.   El numero es el mismo, y esta leido",
        "     de la fila bloqueada.   O sea que la validacion no es",
        "     una segunda red: es la MISMA comprobacion, dos veces.",
        "",
        "  -  Y ADEMAS, el loop 2 MIRA UN ARRAY que se construyo con",
        "     ...(stock ?? { cantidad_disponible: 0 }).   O sea que",
        "     si una prenda no tiene fila en inventario_stock, el",
        "     ?? le pone CERO, y el loop 2 la rechaza con un 409 que",
        "     dice 'El stock de este producto cambió'.   O sea que",
        "     el mensaje culpa a un cambio de stock que en realidad",
        "     es que la prenda nunca estuvo en el inventario.",
        "",
        "LO BUENO, y hay que decirlo porque es lo importante de este",
        "caso: el ORDEN es el correcto.   El FOR UPDATE de L673 esta",
        "en el LOOP 1, que es el que trae el dato, y el INSERT del",
        "movimiento de L716 esta en el LOOP 3, que es el ultimo.   O",
        "sea que se comprueba DESPUES de bloquear, y nunca antes.   Y",
        "por eso dos pagos simultaneos de la misma prenda no se",
        "pueden pasar el stock.   Y lo mismo hace el camino de la",
        "reserva, que tambien lleva su FOR UPDATE, L1098.",
        "",
        "LO QUE SE PODRIA HACER, y es un bucle menos: meter el if",
        "dentro del loop 1, justo despues del SELECT, y quedarse con",
        "un solo recorrido.   El array stocks solo hace falta para el",
        "tercer bucle, y ese podria ir sobre items con los datos",
        "pegados."
    ]],
    ["3. La reserva sobrevive a la venta", [
        "El hallazgo mas raro de la serie, y sale de una columna que",
        "se lee y no se escribe.   Y para encontrarlo hubo que",
        "countar donde se ESCRIBE, no donde se lee.",
        "",
        "PRIMERO, COMO FUNCIONA LA RESERVA, porque es la clave:",
        "SRV_ReservasService, crearReserva, L1109-1120:",
        "",
        "  L1110-1112  INSERT en movimientos_inventario con",
        "              tipo 'SALIDA-RESERVA' y cantidad NEGATIVA",
        "  L1115-1120  UPDATE inventario_stock SET",
        "              cantidad_reservada = cantidad_reservada + $3",
        "",
        "O SEA QUE RESERVAR RESTA EL DISPONIBLE, y no lo hace el",
        "UPDATE: lo hace el trigger, por el signo de L1112.   Y",
        "despues anota la cantidad en la columna reservada.",
        "",
        "Y ESO ES LO QUE HACE CORRECTA LA VALIDACION DE L683-686,",
        "y hay que decirlo antes del bug: comparar solo contra",
        "cantidad_disponible FUNCIONA, porque lo reservado ya no",
        "esta en el disponible.   Si este caso sumara las dos",
        "columnas, rechazaria ventas de verdad.   No lo hace, y",
        "hace bien.",
        "",
        "AHORA EL BUG, que es de este caso:",
        "",
        "  1  Prenda con disponible 5. El cliente la reserva.",
        "     Queda disponible 4, reservada 1.   Todo correcto.",
        "",
        "  2  El mismo cliente, en vez de pagar su reserva, la mete",
        "     en el carrito y paga desde el sandbox.   O sea que",
        "     hay DOS caminos para llevarse la prenda.",
        "",
        "  3  Este caso la vende, y la validacion de L683 la deja",
        "     pasar, porque disponible 4 >= 1.   El loop 3 suma",
        "     cantidad_vendida y el trigger resta el disponible.",
        "     Los dos lados se mueven bien.",
        "",
        "  4  Y cantidad_reservada NO SE TOCA.   En todo el camino",
        "     de L647 a L721 no hay ni un UPDATE que la escriba.",
        "     El unico sitio donde aparece es el SELECT del loop 1,",
        "     L670, que la LEE y no la usa.",
        "",
        "CONTADO EN TODO EL PROYECTO, que es lo que hacia falta:",
        "cantidad_reservada se ESCRIBE en CUATRO sitios, y solo",
        "TRES estan en codigo:",
        "",
        "  L1117  crearReserva         cantidad_reservada + $3",
        "  L709   liberarStockReserva  GREATEST(0, ... - $3)",
        "  L979   cancelar             GREATEST(0, ... - $3)",
        "",
        "  Y EL CUARTO ESTA EN EL ESQUEMA, schema.sql L761, dentro",
        "  de sp_registrar_reserva, que es de las funciones que no",
        "  llama nadie.   O sea que la columna se escribe en cuatro",
        "  sitios y en ninguno de los dos caminos de pago.",
        "",
        "Y NINGUNO DE LOS CUATRO ESTA EN UN CAMINO DE PAGO. Ni este",
        "ni el otro.",
        "",
        "  -  El digital, el de aqui, L647-721: no.",
        "  -  Y el de caja, procesarPagoCaja, que es CU37, tampoco:",
        "     sus bucles de L296, L309 y L336 son copia de estos, y",
        "     su SELECT de L299-302 trae SOLO cantidad_disponible,",
        "     ni siquiera la lee.   O sea que los dos caminos de",
        "     pago del proyecto hacen lo mismo.",
        "",
        "O SEA QUE EL UNICO QUE SABE BAJAR LA RESERVADA ES EL CAMINO",
        "DE LA RESERVA, que es donde no hace falta.",
        "",
        "CONSECUENCIA, y es de negocio:",
        "",
        "  -  La venta se completa y la reserva sigue Activa, con su",
        "     cantidad, y CU22 del documento, que es CU29 en el",
        "     codigo, la sigue mostrando en Mis Reservas.",
        "",
        "  -  O sea que el mismo cliente tiene una reserva viva por",
        "     una prenda que ya se le vendio. Dos documentos sobre",
        "     una prenda que ya no esta.",
        "",
        "  -  Y CUANDO SE CANCELE ESA RESERVA, L972-982, el",
        "     movimiento de L973-975 va con cantidad POSITIVA, o",
        "     sea que el trigger vuelve a SUMAR el disponible, y la",
        "     prenda reaparece en el armario con stock que ya se",
        "     vendio.   El disponible queda inflado en la cantidad de",
        "     la prenda, para siempre, hasta que alguien lo ajuste a",
        "     mano."
    ]],
    ["4. El trigger hace el trabajo y nadie lo escribe", [
        "Un hallazgo de reparto, y es el que hace que este caso",
        "sea distinto de todos los de escritura.",
        "",
        "EN ESTE CASO NO HAY UN solo UPDATE DE STOCK, HAY UN",
        "INSERT.   O sea que el codigo no toca cantidad_disponible:",
        "inserta un movimiento y el trigger lo hace.",
        "",
        "L715-719, la segunda escritura del loop 3:",
        "",
        "  INSERT INTO movimientos_inventario",
        "    (id_ptc, id_sucursal, tipo_movimiento, cantidad,",
        "     referencia, id_usuario, id_venta)",
        "  VALUES ($1, $2, 'Venta', $3, $4, $5, $6)",
        "  [item.id_ptc, venta.id_sucursal, -cantidad,",
        "   `VNT-${idVenta}`, idUsuario, idVenta]",
        "",
        "Y EL TRIGGER, schema.sql L654-657:",
        "",
        "  CREATE TRIGGER trg_movimiento_inventario",
        "  BEFORE INSERT ON movimientos_inventario",
        "  FOR EACH ROW",
        "  EXECUTE FUNCTION fn_aplicar_movimiento_inventario();",
        "",
        "Y LA FUNCION, fn_aplicar_movimiento_inventario, L628-652,",
        "y su parte que importa, L645-648:",
        "",
        "  INSERT INTO inventario_stock (id_ptc, id_sucursal,",
        "                                cantidad_disponible)",
        "  VALUES (NEW.id_ptc, NEW.id_sucursal, NEW.cantidad)",
        "  ON CONFLICT (id_ptc, id_sucursal)",
        "  DO UPDATE SET cantidad_disponible =",
        "    inventario_stock.cantidad_disponible + NEW.cantidad;",
        "",
        "COMO LA CANTIDAD ES NEGATIVA, RESTA.   O sea que el stock",
        "baja sin que nadie lo escriba.",
        "",
        "Y POR QUE ESTO ESTA BIEN HECHO, y es lo mejor del caso:",
        "",
        "  -  El BEFORE INSERT, L655, o sea que el trigger ve la",
        "     fila ya completa y puede calcular stock_anterior y",
        "     stock_posterior, L641-642, que son columnas de la",
        "     propia tabla de movimientos.   O sea que el",
        "     movimiento guarda el antes y el despues del stock.",
        "     Y tambien pone la fecha, L643, con NOW().",
        "",
        "  -  Y hay UN SOLO punto donde el stock se actualiza en",
        "     todo el proyecto, que es esta funcion.   El resto de",
        "     casos hacen UPDATE a mano y por eso se desvian.",
        "",
        "  -  Y EL ON CONFLICT, L647, es lo que hace que una prenda",
        "     que no tenia fila de inventario la cree, en vez de",
        "     fallar.   Y funciona porque UNIQUE (id_ptc,",
        "     id_sucursal) existe, en L310, y CU22 demostro que en",
        "     las otras tablas no hay indice.",
        "",
        "EL CONTEO DE LAS FUNCIONES DEL ESQUEMA, que hay que hacerlo",
        "porque aqui es donde se ve el precio de esta eleccion:",
        "schema.sql tiene OCHO funciones y DOS triggers. De las",
        "ocho funciones, UNA esta viva: esta. Las otras SIETE:",
        "",
        "  -  sp_registrar_venta     L662   y tiene un FOR UPDATE",
        "  -  sp_registrar_reserva   L728   y tiene otro, L751",
        "  -  sp_registrar_devolucion L774",
        "  -  sp_registrar_recepcion  L811",
        "  -  fn_detectar_stock_bajo  L848",
        "  -  fn_kardex_producto      L873",
        "  -  fn_incrementar_intentos L608, que es la del otro",
        "                              trigger, y no esta muerta:",
        "                              SRV_AuthService L61-64 hace",
        "                              EXACTAMENTE lo mismo en",
        "                              TypeScript, con el mismo 5, el",
        "                              mismo 15 minutos y el mismo",
        "                              reset.   O sea que esta",
        "                              duplicada, no muerta.",
        "",
        "Y CERO llamadas a sp_ o fn_ desde el codigo, contadas en",
        "los 149 ficheros .ts y .tsx del prototipo.   O sea que de",
        "los ONCE FOR UPDATE del proyecto, dos estan en funciones",
        "que no ejecuta nadie.   Y el unico trigger que hace falta",
        "de verdad es el que ajusta el stock de todo el proyecto, y",
        "funciona por el signo de la cantidad y nada mas."
    ]],
    ["5. Las dos llamadas de afterward estan fuera de la transaccion", [
        "Un hallazgo de orden, y es el precio de haber dejado el",
        "nucleo bien cerrado.",
        "",
        "LA TRANSACTION CIERRA EN L721, con los tres bucles dentro y",
        "las siete escrituras del camino feliz.   Y a partir de ahi",
        "todo es afterward:",
        "",
        "  L724  registrarPreferenciasDeVenta( idVenta, idUsuario )",
        "  L727  comprobantesService.generar( idVenta, idUsuario )",
        "  L730  bitacora sobre transacciones_pago",
        "  L740  bitacora sobre ventas",
        "",
        "O SEA QUE HAY COSAS QUE NO SE DESHACEN CON LA",
        "TRANSACCION, y hay que mirar si eso es un problema:",
        "",
        "  LAS PREFERENCIAS, L724, es el que MEJOR esta tratado de",
        "  los cuatro.   El metodo registrarPreferenciasDeVenta,",
        "  L763-783, tiene un try/catch PROPIO, L768 y L780, con un",
        "  comentario en L781 que explica el porque: El feedback de",
        "  preferencias nunca debe impedir completar la venta ni",
        "  emitir el comprobante.   O sea que el autor sabe",
        "  exactamente que esta llamada puede fallar y decided",
        "  que el pago no se tire por un extra.   Y ese es el",
        "  UNICO try/catch del fichero, de 784 lineas.",
        "",
        "  EL COMPROBANTE, L727, es idempotente por construccion:",
        "  el comentario de L726 lo dice, y la tabla tiene numero",
        "  UNIQUE, L411.   O sea que un webhook repetido no",
        "  duplica el comprobante.",
        "",
        "  LAS BITACORAS, L730 y L740, son las que NO tienen",
        "  proteccion.   Si la primera falla, la segunda no se",
        "  escribe, y la venta esta completada sin la fila que dice",
        "  que se completo.   Y van fuera de la transaccion porque",
        "  SRV_BitacoraService escribe por el repositorio de",
        "  TypeORM, no por em.query, y por eso no puede entrar.",
        "",
        "Y ESO ES JUSTAMENTE LO QUE CU21 Y CU22 YA HABIAN DICHO, y",
        "aquí se ve el patron entero: en los tres casos la bitacora",
        "se escribe por el repositorio y queda fuera.   Y aqui se",
        "ve porque el caso tiene la transaccion mas completa de la",
        "serie y aun asi las dos ultimas escrituras quedan fuera."
    ]],
    ["6. Un unico CASE en el cliente, y tres botones con el mismo codigo", [
        "Un hallazgo de diseno, del lado del sandbox.",
        "",
        "SandboxPago.tsx, 238 lineas, y su funcion confirmar, L114:",
        "",
        "  const confirmar = async (resultado: 'Aprobado' | 'Rechazado'",
        "                           | 'no_responde') => {",
        "",
        "Y TRES BOTONES LA LLAMAN, L189, L199 y L207, y un",
        "CUARTO la vuelve a llamar, L224.",
        "",
        "O SEA QUE EL TRES-EN-UNO ESTA EN EL PARAMETRO, y el codigo",
        "unico es el de L114-123.   Eso esta bien.",
        "",
        "LO QUE NO ESTA TAN BIEN, y son cuatro cosas:",
        "",
        "  0  LA PANTALLA NOMBRA PASARELAS QUE NO EXISTEN.   L13-18:",
        "",
        "       const NOMBRE_PASARELA: Record<string, string> = {",
        "         LIBELULA: 'Libélula',",
        "         STRIPE: 'Stripe',",
        "         PAYPAL: 'PayPal',",
        "         default: 'Pasarela',",
        "       };",
        "",
        "     Y el backend tiene su propia lista, PROVEEDORES, en",
        "     SRV_PagosService, con esos mismos tres.   O sea que la",
        "     pantalla del sandbox enseña el logo mental de Libelula,",
        "     Stripe o PayPal segun lo que le pase el proveedor, y",
        "     ninguna de las tres esta integrada: no hay SDK, ni",
        "     llamada saliente, ni URL de redireccion.   Todo el",
        "     caso es local, y el L23 lo dice sin rodeos: Estas en",
        "     la pagina simulada de la pasarela de pago (CU35).",
        "     Estamos la pasarela.   La honestidad esta en el texto",
        "     de la pantalla y no en el nombre que pone arriba.",
        "",
        "  1  EL CUARTO BOTON, L224, es un 'Aprobado' mas, con un",
        "     RefreshCcw al lado y el texto Reintentar pago, que",
        "     aparece cuando el estado es Rechazado, en L222.   O",
        "     sea que tras un rechazo SIMULADO la pantalla ofrece",
        "     aprobar. Y eso, en un sandbox, es lo que hace falta",
        "     para probar el camino.   En una pasarela de verdad",
        "     ese boton no existiria, y por eso mismo el caso",
        "     CU35 tal como esta escrito no sirve para el caso real",
        "     que dice representar.",
        "",
        "  2  EL TIMEOUT ES UN TERCER RESULTADO DEL DTO, L51, y no",
        "     un error.   O sea que 'la pasarela no respondio' se",
        "     expresa como un resultado de pago mas, con su propio",
        "     valor en la lista blanca, y se resuelve en L518 con",
        "     un 504.   Es una decision de diseno, y es buena: el",
        "     caso de negocio del timeout existe de verdad en una",
        "     pasarela, y darle un valor propio lo hace visible en",
        "     el DTO y en la validacion.   CU25 no tenia nada de",
        "     eso.",
        "",
        "  3  Y EL ESTADO SE PINTA DESDE LA RESPUESTA, L123,",
        "     setEstado(res.estado), no con una recarga.   Y con el",
        "     IF de L99, que separa el caso de 'no hay transaccion'",
        "     del caso de 'hay transaccion pero todavia no hay",
        "     monto'.   O sea que la pantalla tiene tres estados de",
        "     carga, no dos.",
        "",
        "  4  Y EL 401 ECHA AL LOGIN, L127-129:",
        "",
        "     if (err instanceof ApiError && err.status === 401) {",
        "       navegar('/login');",
        "       return;",
        "     }",
        "",
        "     O sea que la pantalla es PUBLICA, L55, y se abre sin",
        "     sesion, pero en cuanto se pulsa un boton sin token el",
        "     guard responde 401 y la pantalla tira al login.   Y",
        "     el caso lo trata bien: no se queda en blanco con un",
        "     error, manda al sitio donde se puede arreglar.   Es el",
        "     unico manejo de 401 de la serie que NO se limita a",
        "     pintar el texto.",
        "",
        "  5  Y EL RECHAZO SIEMPRE DICE LO MISMO, L121:",
        "",
        "     detalle: resultado === 'Rechazado'",
        "              ? 'Fondos insuficientes (simulado)'",
        "              : undefined",
        "",
        "     O sea que el sandbox no puede simular 'tarjeta",
        "     expirada' ni 'fondos insuficientes' por separado: hay",
        "     un solo motivo de rechazo, y el texto lo dice",
        "    explicitamente entre parentesis.   El backend, en",
        "     cambio, tiene dos caminos de motivo: el que le mandan",
        "     en el DTO y el texto por defecto de L618.   Los dos",
        "     lados lo hacen bien, y por eso el de L618 casi nunca",
        "     se ve.",
        "",
        "  6  Y PAYPAL ESTA EN UNA LISTA Y NO EN LA OTRA.   L37:",
        "",
        "     const PROVEEDORES = ['LIBELULA', 'STRIPE', 'PAYPAL'];",
        "     const PROVEEDORES_CAJA = ['LIBELULA', 'STRIPE'];",
        "",
        "     Y la pantalla tiene los tres, L14 a L16.   O sea que",
        "     un cliente puede pagar ONLINE con PayPal y en la CAJA,",
        "     que es CU37, no.   Y no es un descuido de la",
        "     pantalla: es el backend el que tiene dos listas",
        "     distintas, y la de la caja es mas corta.   Del",
        "     cliente no se dice nada, y por eso nadie se da cuenta."
    ]],
    ["7. El codigo HTTP del sandbox es el mismo para los tres resultados", [
        "Un hallazgo pequeno, y sale de un decorador.",
        "",
        "CTR_Pagos L123-125:",
        "",
        "  @Post('sandbox/gateway')",
        "  @HttpCode(HttpStatus.OK)",
        "  @UseGuards(JwtAuthGuard)",
        "",
        "Y EN EL SERVICIO, los tres caminos de L497-546 devuelven",
        "cosas distintas:",
        "",
        "  resultado 'no_responde'   L519   GatewayTimeoutException, 504",
        "  resultado invalido      L523   UnprocessableEntityException, 422",
        "  resultado valido        L545   return, o sea 200 por el",
        "                                     @HttpCode(OK) de L124",
        "",
        "ASI QUE EL @HttpCode(OK) SOLO APLICA AL CAMINO FELIZ, que es",
        "lo normal en Nest.   Pero en el sandbox significa que el",
        "cliente ve 200 con estado Aprobado, 504 con estado nada, y",
        "422 con estado nada.   O sea que el codigo HTTP y el estado",
        "de la transaccion son dos cosas distintas, y el codigo solo",
        "coincide con el estado en un camino de tres.",
        "",
        "Y EN LA PANTALLA, L99 y L175, el error se pinta con el",
        "mensaje del ApiError y el estado de la transaccion se",
        "mantiene en el useState, L47.   O sea que la transaccion",
        "sigue en Pendiente y la pantalla puede seguir mostrando los",
        "tres botones.   Lo cual es correcto para reintentar, y",
        "confuso para quien lee el codigo.",
        "",
        "LO QUE SI ESTA BIEN, y hay que decirlo: el webhook SI usa",
        "el codigo correcto para lo que hace, L486, y 401 es",
        "exactamente lo que es una firma que no cuadra.   Y el",
        "sandbox usa 504, que es exactamente un timeout.   O sea",
        "que los codigos estan bien puestos; lo que se repite es el",
        "numero."
    ]],
    ["8. Lo que esta bien, y es el mejor caso de la serie", [
        "Este caso tiene siete cosas buenas. Y la tercera es la",
        "razon por la que este es el diagrama mas complejo de los",
        "veintiseis, y merece decirse antes que nada.",
        "",
        "1. LA TRANSACCION DEL NUCLEO ESTA CERRADA Y COMPLETA. De",
        "   L647 a L721: los tres bucles dentro, las siete",
        "   escrituras del camino feliz dentro, y un COMMIT al",
        "   final.   O sea que si el INSERT del comprobante de",
        "   CU38 falla, la venta NO se completa y el pago se",
        "   puede reintentar con el webhook.   Es lo que CU19",
        "   TST de stock hacia con veinte productos y SIN",
        "   transaccion, y lo que CU25 no tenia.",
        "",
        "2. Y LOS TRES BUCLES ESTAN EN EL MISMO LIFELINE Y EN EL",
        "   MISMO METODO.   De L667 a L720, sin una sola linea de",
        "   codigo que no sea del caso.   O sea que procesarResultado",
        "   es el metodo mas legible de la serie: lee, bloquea,",
        "   comprueba, escribe y cierra, en ese orden, y en un",
        "   recorrido.",
        "",
        "3. Y EL ORDEN DE LAS TRES COSAS, que es lo importante: el",
        "   FOR UPDATE de L673 esta en la segunda vuelta del bucle",
        "   de escritura, y el INSERT del movimiento de L716 en la",
        "   tercera.   O sea que se comprueba DESPUES de bloquear,",
        "   y nunca antes.   Y por eso dos pagos simultaneos de la",
        "   misma prenda no se pueden pasar el stock.   Es",
        "   exactamente lo que CU21 hizo bien y CU19 no.",
        "",
        "4. Y EL IDEMPOTENTE ESTA PENSADO, L576-586, con un",
        "   comentario que explica el porque, E9, y que devuelve",
        "   el estado ACTUAL con reprocesado: false en vez de",
        "   reprocesar.   Y el campo reprocesado, L757, travels en",
        "   la respuesta, o sea que el cliente sabe si esto se",
        "   proeso ahora o si ya estaba.   Un webhook repetido,",
        "   que es lo NORMAL en una pasarela, no rompe nada.",
        "",
        "5. Y LAS TRES SALIDAS DEL CASO ESTAN TRATADAS POR SEPARADO,",
        "   con su codigo y su bitacora: el timeout, L519; el monto",
        "   inconsistente, L591-615; y el rechazo, L617-642.   Y las",
        "   dos que son un UPDATE llevan el estado en el WHERE, un",
        "   compare-and-set, L594 y L621.   O sea que un webhook",
        "   repetido no puede cambiar un Rechazado por un Aprobado.",
        "",
        "6. Y EL TRY/CATCH DEL AFTERWARD, L768 y L780, con el",
        "   comentario de L781 que explica que el feedback de",
        "   preferencias no debe impedir el pago.   Es el UNICO",
        "   try/catch de 784 lineas, y esta en el sitio",
        "   EXACTAMENTE donde hace falta.   CU24 lo puso en el",
        "   cliente y CU25 no lo puso en ninguna parte; aqui esta",
        "   en el servidor y en el punto correcto.",
        "",
        "7. Y EL PRECIO DE LA VENTA ES EL DE LA VENTA, L661, con",
        "   precio_unitario de venta_items, y no el de catalogo de",
        "   hoy.   O sea que el comprobante sale con lo que se",
        "   cobro, aunque el precio haya cambiado.   Es lo",
        "   contrario de lo que hacia CU22, que ensenaba el de",
        "   hoy, y lo mismo que hizo bien CU25 al guardarlo."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU27."; } catch (e) { }
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
    // LOS 3 LOOP DEL CASO, y los TRES estan en el MISMO lifeline y en el
    // MISMO metodo: procesarResultado, de L667 a L720. Ninguno es de otro
    // caso, y por eso los tres van en la misma columna.
    //
    // Y LOS LIMITES ESTAN CALCULADOS PARA QUE NO SE SOLAPEN, uno a uno:
    // el loop 1 acaba donde empieza el 2, el 2 acaba antes del mensaje 27
    // (que es el de las tres escrituras de estado, y NO es de ningun bucle),
    // y el 3 empieza en el 28.   El 30, que es el trigger, va dentro del 3
    // porque lo dispara el INSERT del 29.
    fragmento(diag, "loop [por cada item vendido: SELECT ... FOR UPDATE, bloquea esa prenda]", xP, xD, Y_MSG0 + 21 * PASO_MSG - 34, Y_MSG0 + 24 * PASO_MSG - 34);
    fragmento(diag, "loop [por cada item: compara el stock YA LEIDO en el bucle anterior]", xP, xD, Y_MSG0 + 24 * PASO_MSG - 34, Y_MSG0 + 26 * PASO_MSG - 40);
    fragmento(diag, "loop [por cada item: UPDATE cantidad_vendida e INSERT del movimiento]", xP, xD, Y_MSG0 + 27 * PASO_MSG - 34, Y_MSG0 + 30 * PASO_MSG - 40);
    // LAS 3 BARRAS, y se ANIDAN, que es lo correcto: el controlador llama al
    // servicio, y el servicio llama al de comprobantes.   La del controlador
    // llega hasta el mensaje 38, que es donde se devuelve la respuesta al
    // navegador, porque en un controlador sincrono sigue activo mientras
    // espera; si se acortara en el 14 se veria que el servicio sigue
    // trabajando cuando el controlador ya habia terminado, que no es cierto.
    activacion(diag, xDe(indiceDe("C")), Y_MSG0 + 6 * PASO_MSG - 26, Y_MSG0 + 38 * PASO_MSG + 12);
    activacion(diag, xP, Y_MSG0 + 7 * PASO_MSG - 26, Y_MSG0 + 37 * PASO_MSG + 12);
    activacion(diag, xDe(indiceDe("M")), Y_MSG0 + 33 * PASO_MSG - 26, Y_MSG0 + 35 * PASO_MSG + 12);
}

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 940) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU27  Procesar Pago con Pasarela de Pago   ·   en el código del proyecto este caso es CU35, con el título IGUAL"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 940) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseño de caso de uso, sección 3.3.2.1.  10 líneas de vida, 40 mensajes, 8 hallazgos, 3 loop y NINGUN alt, y 3 barras de activación."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su línea de vida. El tiempo baja. Este es el caso con MÁS bucles de la serie, y los tres están en el MISMO lifeline y en el MISMO método: procesarResultado, de L667 a L720. Tres loop y ningún alt, y de los seis for del servicio solo tres son de este caso, los otros tres son de la caja, CU37. Ojo con esto: el sandbox se llama a SÍ MISMO por el webhook, L545, con un secreto que está en el código, L40, y procesarWebhook es el único endpoint sin sesión. Y cantidad_reservada se lee en L670 y no la escribe nadie en todo el camino: la reserva sobrevive a la venta."; } catch (e) { }
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
function notasDelDiagrama(diag, r, h, ch) {
    var N = [];
    N.push("CU27  Procesar Pago con Pasarela de Pago.  Diseño de caso de uso, sección 3.3.2.1.");
    N.push("");
    N.push("AVISO DE NUMERACIÓN");
    N.push("");
    N.push("  Este caso es CU27 en el documento y CU35 en el código del proyecto, y el título");
    N.push("  COINCIDE EXACTO, sin una palabra de diferencia:");
    N.push("");
    N.push("    documento  Procesar Pago con Pasarela de Pago");
    N.push("    codigo     // CU35 - Procesar Pago con Pasarela de Pago   api.ts L1902");
    N.push("");
    N.push("  Es el único caso de la serie hasta ahora con el título exactamente igual en los");
    N.push("  dos sitios. CU26 tenía un paréntesis de diferencia, CU24 y CU25 no.");
    N.push("");
    N.push("  Y TIENE UNA SORPRESA DE NUMERACIÓN QUE HAY QUE DECIR: el caso de la CAJA, que es");
    N.push("  CU37 en el código, está pegado justo debajo, en api.ts L1903, a dos líneas de este. Y");
    N.push("  los dos comparten servicio, SRV_PagosService, y los dos tienen la misma forma de");
    N.push("  código: los mismos tres bucles, la misma transacción, el mismo trigger.   Este");
    N.push("  diagrama es el lado digital; el de la caja es CU37.");
    N.push("");
    N.push("  Y CUANDO SE MIRA LA NUMERACIÓN DE TODO EL FICHERO, api.ts, que tiene 2104 líneas,");
    N.push("  salen tres desajustes que son ciertos y comprobables:");
    N.push("");
    N.push("    1  El orden está alterado en dos sitios. En la sección de cliente, CU31 está en");
    N.push("       L780 y CU30 en L794, o sea que el 31 va antes del 30. Y en la sección de");
    N.push("       pago, CU36 está en L1845 y CU35 en L1902, o sea que este caso va después");
    N.push("       del 36.");
    N.push("");
    N.push("    2  CU41 aparece DOS veces, en L2041 y en L2077, con el CU43 en medio, en L2047.");
    N.push("");
    N.push("    3  Y hay un caso con DOS TÍTULOS: el CU28 es 'Realizar Reserva de Múltiples");
    N.push("       Prendas' en la sección de cliente, L673, y es solo 'Reservas' en la de");
    N.push("       administrador, L1680.");
    N.push("");
    N.push("  Lo que NO es un error, y hay que decirlo para no contarlo dos veces: los casos");
    N.push("  CU18 a CU31 y el CU33 aparecen dos veces porque api.ts tiene dos secciones, la");
    N.push("  del cliente, de L374 a L898, y la del administrador, de L1423 a L1830.   El mismo");
    N.push("  caso con sus dos grupos de endpoints.   Once casos por duplicado, todos con el");
    N.push("  mismo número en los dos sitios.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 líneas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Cliente             «actor»     quien aprueba o rechaza su propio pago");
    N.push("    SandboxPago.tsx           «boundary»  238 líneas, la pantalla del banco simulado");
    N.push("    api.ts                    «boundary»  sección CU35, L1969-1987");
    N.push("    JwtAuthGuard              «control»   en 1 de los 2. El del webhook NO lo lleva");
    N.push("    ValidationPipe            «control»   dos DTO distintos, L47-57 y L59-75");
    N.push("    CTR_Pagos                 «control»   156 líneas, 2 endpoints del caso");
    N.push("    SRV_PagosService          «control»   784 líneas, 3 bucles del caso aquí");
    N.push("    SRV_ComprobantesService   «control»   generar(), idempotente, y es CU38");
    N.push("    SRV_PreferenciasService   «control»   registrarPreferenciasVenta, con try/catch");
    N.push("    PostgreSQL                «entity»    4 tablas y el trigger del inventario");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes. Repartidos, contados sobre el propio diagrama:");
    N.push("");
    N.push("    11  van a la base de datos.   Los mensajes 9, 15, 18, 20, 21, 23, 27, 29, 30, 31 y 35.");
    N.push("    18  son mensajes a sí mismo, en el lifeline del servicio o de la pantalla. Son 16 en");
    N.push("        SRV_PagosService y 2 en SandboxPago.");
    N.push("     6  llevan la guarda [condición] entre corchetes: los mensajes 10, 11, 16, 18, 20 y 25.");
    N.push("        Esos seis son las salidas del caso, y de los seis solo el 18 y el 20 son");
    N.push("        mitades de una decisión doble; los otros cuatro son un return con su guarda.");
    N.push("     8  citan un código HTTP: 404 en el 9, 504 en el 10, 422 en el 11, 409 en el 20 y el");
    N.push("        25, 401 en el 13.");
    N.push("    30  son síncronos y 10 son retornos con condición.");
    N.push("");
    N.push("  Y una lifeline a propósito NO está: SRV_BitacoraService, que aparece cuatro veces en");
    N.push("  el caso y siempre fuera de la transacción, porque escribe por el repositorio de");
    N.push("  TypeORM y no por em.query, y por eso no puede entrar. Se explica en el hallazgo 5.");
    N.push("");
    N.push("  Y POR LIFELINE, para que se vea quien hace el trabajo: SRV_PagosService recibe 16 de");
    N.push("  los 40 mensajes, PostgreSQL 11, SandboxPago 3 y api.ts 3, y los otros cinco lifeline");
    N.push("  reciben uno cada uno. El caso se lee entero en la sexta columna.");
    N.push("");
    N.push("  Y LOS TRES FRAGMENTOS, que es lo que pediste saber, están TODOS en la misma");
    N.push("  lifeline y en el mismo método:");
    N.push("");
    N.push("    loop  sobre: SRV_PagosService");
    N.push("            [por cada item vendido: SELECT ... FOR UPDATE]        L667");
    N.push("    loop  sobre: SRV_PagosService");
    N.push("            [por cada item: compara el stock en memoria]          L680");
    N.push("    loop  sobre: SRV_PagosService");
    N.push("            [por cada item: UPDATE cantidad_vendida, INSERT mov] L706");
    N.push("");
    N.push("  CERO alt. De los 40 if del servicio, cinco son de este caso y los CINCO son");
    N.push("  guardas, ninguno es un 'if con dos caminos'.   El caso se lee en una sola");
    N.push("  columna.");
    N.push("");
    N.push("Y NINGUN alt, Y ESO ES LO RARO, porque hay tres caminos de resultado y solo se");
    N.push("dibujan con marcos los bucles.   Los tres caminos son:");
    N.push("");
    N.push("  L518  'no_responde'   GatewayTimeoutException, 504");
    N.push("  L522  resultado malo  UnprocessableEntityException, 422");
    N.push("  L545  resultado bueno return this.procesarWebhook(...)");
    N.push("");
    N.push("Los dos primeros se pintan como mensajes de retorno a la propia lifeline con la");
    N.push("guarda entre corchetes, que es lo que hace este script con un 'S' o un 'A' al");
    N.push("final del mensaje.   Un alt aquí no aportaría nada: son tres 'return'");
    N.push("consecutivos del mismo if, no dos mitades de una misma decisión.");
    N.push("");
    N.push("EL HALLAZGO 1: EL SECRETO DE LA FIRMA ESTÁ EN EL CÓDIGO");
    N.push("");
    N.push("  L40, en el propio fichero de este caso:");
    N.push("");
    N.push("    const FIRMA_SECRETO =");
    N.push("      process.env.PAGO_WEBHOOK_SECRET ?? 'sandbox-secreto-cu35';");
    N.push("");
    N.push("  Y L103, lo que se firma:");
    N.push("");
    N.push("    .update(`${idTransaccion}.${monto}.${estado}`)");
    N.push("");
    N.push("  O sea que la firma SÍ lleva el estado, y eso está bien: la firma de un Rechazado");
    N.push("  no sirve para un Aprobado.   Y firmasCoinciden, L107-112, usa timingSafeEqual");
    N.push("  con la longitud comprobada antes, L110.");
    N.push("");
    N.push("  EL PROBLEMA ES QUE NO LLEVA FECHA NI USUARIO, y el endpoint que lo acepta es el");
    N.push("  ÚNICO SIN SESIÓN del proyecto.   procesarWebhook, L480, no lleva @UseGuards y no");
    N.push("  recibe @UsuarioActual, en CTR_Pagos L142-144. Para un webhook eso es lo");
    N.push("  correcto: una pasarela no tiene cuenta.   El problema es que el secreto por");
    N.push("  defecto está escrito en el repositorio, y el código para exploitarla son tres");
    N.push("  líneas de la propia función firmar, L101-105.");
    N.push("");
    N.push("  Y AÑADE ESTO, que es lo que lo hace barato: el monto que hay que firmar sale de");
    N.push("  la propia base, L588, con venta.total.   O sea que el control del monto de L591,");
    N.push("  que es lo que parece proteger, compara el monto contra un dato público.");
    N.push("");
    N.push("  Y EL SIMULADOR SE LLAMA A SÍ MISMO POR ESE WEBHOOK, L545.   El servidor construye");
    N.push("  la notificación, L537-543, la firma con su propio secreto, L542, y se la manda a");
    N.push("  sí mismo por el endpoint sin sesión.   O sea que la firma no es un control en la");
    N.push("  práctica: aquí la genera el mismo proceso que la valida.   En una pasarela de");
    N.push("  verdad sería lo contrario, y por eso el caso CU35 tal como está escrito no");
    N.push("  representa una pasarela real, sino un simulador que se ha disfrazado de ella.");
    N.push("");
    N.push("EL HALLAZGO 2: EL STOCK SE COMPRUEBA DOS VECES, Y LA SEGUNDA NO PUEDE FALLAR");
    N.push("");
    N.push("  L667-678, el LOOP 1, el que trae el dato:");
    N.push("");
    N.push("    for (const item of items) {");
    N.push("      const stock = this.unaFila(await em.query(");
    N.push("        `SELECT id_ptc, cantidad_disponible, cantidad_reservada");
    N.push("         FROM inventario_stock");
    N.push("         WHERE id_ptc = $1 AND id_sucursal = $2 FOR UPDATE`,");
    N.push("      ...))");
    N.push("      stocks.push({ ...item, ...(stock ?? { cantidad_disponible: 0 }) });");
    N.push("    }");
    N.push("");
    N.push("  L680-688, el LOOP 2, el que lo comprueba:");
    N.push("");
    N.push("    for (const item of stocks) {");
    N.push("      const disponible = Number(item.cantidad_disponible ?? 0);");
    N.push("      if (disponible < cantidad) {");
    N.push("        throw new ConflictException(");
    N.push("          `El stock de este producto cambió. ...`);");
    N.push("      }");
    N.push("    }");
    N.push("");
    N.push("  El dato del LOOP 2 sale del array del LOOP 1.   O sea que la comparación es en");
    N.push("  memoria, y ya con la fila bloqueada por el FOR UPDATE de L673.   El LOOP 2 no");
    N.push("  puede encontrar nada que el LOOP 1 no hubiera visto.   No es una segunda red: es");
    N.push("  la MISMA comprobación dos veces, y están separadas por cero líneas de lógica.");
    N.push("");
    N.push("  Y ADEMÁS el ?? del push, L677: si una prenda no tiene fila en inventario_stock,");
    N.push("  el ?? le pone CERO y el LOOP 2 la rechaza con un 409 que dice 'El stock de este");
    N.push("  producto cambió'.   O sea que el mensaje culpa a un cambio de stock que en");
    N.push("  realidad es que la prenda nunca estuvo en el inventario.");
    N.push("");
    N.push("  LO BUENO, y es lo importante: el ORDEN es el correcto.   El FOR UPDATE está en");
    N.push("  el LOOP 1, que trae el dato, y el INSERT del movimiento de L716 en el LOOP 3, que");
    N.push("  es el último.   O sea que se comprueba DESPUÉS de bloquear y nunca antes, y por");
    N.push("  eso dos pagos simultáneos de la misma prenda no se pueden pasar el stock.");
    N.push("");
    N.push("EL HALLAZGO 3: LA RESERVA SOBREVIVE A LA VENTA");
    N.push("");
    N.push("  Para encontrarlo hubo que contar dónde se ESCRIBE la columna, no dónde se lee.");
    N.push("  En todo el proyecto se escribe en TRES sitios, y los tres están en");
    N.push("  SRV_ReservasService:");
    N.push("");
    N.push("    L1117  crearReserva         cantidad_reservada = cantidad_reservada + $3");
    N.push("    L709   liberarStockReserva  GREATEST(0, ... - $3)");
    N.push("    L979   cancelar             GREATEST(0, ... - $3)");
    N.push("");
    N.push("  Y NINGUNO ESTÁ EN UN CAMINO DE PAGO.   Ni el digital, que es este, ni el de caja,");
    N.push("  que es CU37 y cuyo SELECT de L299-302 ni siquiera trae la columna.   Este caso la");
    N.push("  LEE en L670 y no la usa para nada.");
    N.push("");
    N.push("  PARA ENTENDERLO HAY QUE VER CÓMO FUNCIONA LA RESERVA.   crearReserva mete un");
    N.push("  movimiento con cantidad NEGATIVA, L1110-1112, o sea que el trigger RESTA el");
    N.push("  disponible, y luego anota la cantidad en la columna reservada, L1115-1120.   Eso");
    N.push("  significa que la validación de L683, que compara solo contra disponible, es");
    N.push("  CORRECTA: lo reservado ya no está en el disponible.");
    N.push("");
    N.push("  EL BUG ES OTRO, y es este: la prenda está reservada, el cliente la compra y paga,");
    N.push("  se vende, y la reserva sigue Activa.   Y cuando se cancele esa reserva, su");
    N.push("  movimiento de L973-975 va con cantidad POSITIVA, o sea que el trigger vuelve a");
    N.push("  sumar el disponible, y el stock queda inflado en la cantidad de esa prenda, para");
    N.push("  siempre, hasta que alguien lo ajuste a mano.");
    N.push("");
    N.push("  O SEA QUE EL ÚNICO QUE SABE BAJAR LA RESERVADA ES EL CAMINO DE LA RESERVA, que");
    N.push("  es donde no hace falta.");
    N.push("");
    N.push("EL HALLAZGO 4: EL STOCK NO LO ESCRIBE NADIE, LO ESCRIBE EL ESQUEMA");
    N.push("");
    N.push("  En este caso no hay ni un UPDATE de cantidad_disponible.   Hay un INSERT, el de");
    N.push("  L715-719, con tipo 'Venta' y cantidad NEGATIVA, y el trigger lo convierte en un");
    N.push("  UPDATE.   schema.sql L654-657:");
    N.push("");
    N.push("    CREATE TRIGGER trg_movimiento_inventario");
    N.push("    BEFORE INSERT ON movimientos_inventario");
    N.push("    FOR EACH ROW");
    N.push("    EXECUTE FUNCTION fn_aplicar_movimiento_inventario();");
    N.push("");
    N.push("  Y LA FUNCIÓN, L628-652, y su parte que importa, L645-648:");
    N.push("");
    N.push("    INSERT INTO inventario_stock (id_ptc, id_sucursal,");
    N.push("                                  cantidad_disponible)");
    N.push("    VALUES (NEW.id_ptc, NEW.id_sucursal, NEW.cantidad)");
    N.push("    ON CONFLICT (id_ptc, id_sucursal)");
    N.push("    DO UPDATE SET cantidad_disponible =");
    N.push("      inventario_stock.cantidad_disponible + NEW.cantidad;");
    N.push("");
    N.push("  El BEFORE INSERT, L655, permite además que la función rellene stock_anterior y");
    N.push("  stock_posterior, L641-642, que son columnas de la propia tabla de movimientos.   O");
    N.push("  sea que cada movimiento guarda el antes y el después del stock.   Y el ON CONFLICT");
    N.push("  crea la fila si la prenda no tenía, y funciona porque UNIQUE (id_ptc,");
    N.push("  id_sucursal) existe, en L310.");
    N.push("");
    N.push("  EL CONTEO DE LAS FUNCIONES DEL ESQUEMA:");
    N.push("");
    N.push("    8 funciones y 2 triggers.  De las 8 funciones, UNA está viva: esta.");
    N.push("    Las otras 7:");
    N.push("");
    N.push("      sp_registrar_venta       L662   lleva un FOR UPDATE, L690");
    N.push("      sp_registrar_reserva     L728   lleva otro, L751");
    N.push("      sp_registrar_devolucion  L774");
    N.push("      sp_registrar_recepcion   L811");
    N.push("      fn_detectar_stock_bajo   L848");
    N.push("      fn_kardex_producto       L873");
    N.push("      fn_incrementar_intentos  L608   la del otro trigger, y NO esta muerta:");
    N.push("                                SRV_AuthService L61-64 hace exactamente lo");
    N.push("                                mismo en TypeScript, con el mismo 5, el mismo");
    N.push("                                15 minutos y el mismo reset. Está duplicada.");
    N.push("");
    N.push("  CERO llamadas a sp_ o fn_ desde el código, contadas en los 149 ficheros .ts y");
    N.push("  .tsx del prototipo.   O sea que de los ONCE FOR UPDATE del proyecto, dos están");
    N.push("  en funciones que no ejecuta nadie, y el único trigger que hace falta de verdad");
    N.push("  es el del stock, que funciona por el signo de la cantidad y nada más.");
    N.push("");
    N.push("EL HALLAZGO 5: LAS CUATRO LLAMADAS DE AFTERWARD ESTÁN FUERA DE LA TRANSACCIÓN");
    N.push("");
    N.push("  La transacción cierra en L721 con los tres bucles dentro y las siete escrituras");
    N.push("  del camino feliz.   Y a partir de ahí todo es afterward:");
    N.push("");
    N.push("    L724  registrarPreferenciasDeVenta( idVenta, idUsuario )");
    N.push("    L727  comprobantesService.generar( idVenta, idUsuario )");
    N.push("    L730  bitácora sobre transacciones_pago");
    N.push("    L740  bitácora sobre ventas");
    N.push("");
    N.push("  LAS PREFERENCIAS, L724, es la que MEJOR está tratada.   El método");
    N.push("  registrarPreferenciasDeVenta, L763-783, tiene un try/catch PROPIO, L768 y L780,");
    N.push("  con un comentario en L781 que explica el porqué: El feedback de preferencias nunca");
    N.push("  debe impedir completar la venta ni emitir el comprobante.   O sea que el autor");
    N.push("  sabe exactamente que esa llamada puede fallar y decidió que el pago no se tire por");
    N.push("  un extra.   Y es el ÚNICO try/catch de 784 líneas, y está en el sitio exacto donde");
    N.push("  hace falta.   CU24 lo puso en el cliente y CU25 no lo puso en ninguna parte.");
    N.push("");
    N.push("  EL COMPROBANTE, L727, es idempotente por construcción: el comentario de L726 lo");
    N.push("  dice, y la tabla tiene numero UNIQUE, L411.   Un webhook repetido no lo duplica.");
    N.push("");
    N.push("  LAS BITÁCORAS, L730 y L740, son las que NO tienen protección.   Si la primera");
    N.push("  falla, la segunda no se escribe, y la venta queda completada sin la fila que dice");
    N.push("  que se completó.   Y van fuera porque SRV_BitacoraService escribe por el");
    N.push("  repositorio de TypeORM y no por em.query, y por eso no puede entrar.   Por eso no");
    N.push("  hay lifeline para ese servicio en este diagrama: no recibe ni un mensaje dentro");
    N.push("  de la frontera de la transacción.");
    N.push("");
    N.push("LO BUENO, Y SON OCHO COSAS");
    N.push("");
    N.push("  1. LA TRANSACCIÓN DEL NÚCLEO ESTÁ CERRADA Y COMPLETA. De L647 a L721: los tres");
    N.push("     bucles dentro, las siete escrituras del camino feliz dentro, y un COMMIT al");
    N.push("     final.   Si el INSERT del comprobante de CU38 falla, la venta NO se completa y");
    N.push("     el pago se puede reintentar con el webhook.   Es lo que CU19 no hacía con sus");
    N.push("     veinte productos, y lo que CU25 no tenía.");
    N.push("");
    N.push("  2. Y LOS TRES BUCLES ESTÁN EN EL MISMO LIFELINE Y EN EL MISMO MÉTODO. De L667 a");
    N.push("     L720, sin una línea que no sea del caso.   procesarResultado es el método más");
    N.push("     legible de la serie: lee, bloquea, comprueba, escribe y cierra, en ese orden y");
    N.push("     en un recorrido.   Es el caso con más bucles por lifeline de los veintisiete.");
    N.push("");
    N.push("  3. Y EL ORDEN DE LAS TRES COSAS, que es lo importante: el FOR UPDATE de L673 está");
    N.push("     en el LOOP 1, que trae el dato, y el INSERT del movimiento de L716 en el LOOP");
    N.push("     3, que es el último.   Se comprueba DESPUÉS de bloquear y nunca antes.");
    N.push("");
    N.push("  4. Y EL IDEMPOTENTE ESTÁ PENSADO, L576-586, con un comentario que explica el");
    N.push("     porqué, E9, y que devuelve el estado ACTUAL con reprocesado: false en vez de");
    N.push("     reprocesar.   Y el campo reprocesado, L757, viaja en la respuesta, o sea que el");
    N.push("     cliente sabe si esto se procesó ahora o si ya estaba.   Un webhook repetido, que");
    N.push("     es lo NORMAL en una pasarela, no rompe nada.");
    N.push("");
    N.push("  5. Y LAS TRES SALIDAS ESTÁN TRATADAS POR SEPARADO, con su código y su bitácora: el");
    N.push("     timeout, L519; el monto inconsistente, L591-615; y el rechazo, L617-642.   Y las");
    N.push("     dos que son un UPDATE llevan el estado en el WHERE, un compare-and-set, L594 y");
    N.push("     L621.   Un webhook repetido no puede cambiar un Rechazado por un Aprobado.");
    N.push("");
    N.push("  6. Y EL GUARD DE LA PERTENENCIA, L514-516, con el mismo 404 que el de la consulta");
    N.push("     de estado: 'Transacción no encontrada.'   O sea que solo el dueño de la");
    N.push("     transacción puede decidir su resultado.   CU22 y CU24 lo hicieron igual.");
    N.push("");
    N.push("  7. Y LA PANTALLA TIRA AL LOGIN EN UN 401, L127-129, con navegar('/login').   Es");
    N.push("     el único manejo de 401 de la serie que no se limita a pintar el texto, y la");
    N.push("     pantalla además comprueba usuario === null antes de dejar pulsar nada, L75.");
    N.push("");
    N.push("  8. Y EL PRECIO DE LA VENTA ES EL DE LA VENTA, L659, con precio_unitario de");
    N.push("     venta_items, y no el de catálogo de hoy.   El comprobante sale con lo que se");
    N.push("     cobró, aunque el precio haya cambiado.   Es lo contrario de lo que hacía CU22.");
    N.push("");
    N.push("LO QUE NO ES UNA PASARELA DE PAGO, y hay que decirlo porque el título del caso lo");
    N.push("dice: la pantalla nombra a Libélula, Stripe y PayPal, L13-18, y el backend tiene su");
    N.push("propia lista en L37.   Pero no hay SDK, ni llamada saliente, ni redirección: todo es");
    N.push("local, y el servidor se llama a sí mismo por su propio webhook, L545.   El propio");
    N.push("texto de la pantalla lo dice, L23: Estás en la página simulada de la pasarela de");
    N.push("pago (CU35). Somos la pasarela.   La honestidad está en el texto y no en el nombre");
    N.push("que pone arriba.   Y hay un detalle de negocio: PayPal está en la lista digital,");
    N.push("L37, y NO en la de caja, que es L39 y solo tiene dos.   O sea que se puede pagar");
    N.push("online con PayPal y en la caja no, y de eso no dice nada ni el DTO ni la pantalla.");
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
    N.push("  Y LA PESTAÑA DE LOS TRES MARCOS DICE SOBRE QUÉ LIFELINE ESTÁ CADA UNO, y eso se");
    N.push("  saca de las coordenadas del marco con lifelineEnX(), no está escrito a mano, así");
    N.push("  que no puede desincronizarse del lifeline.   Los tres dicen SRV_PagosService.");
    N.push("");
    N.push("  Comprobación de esta ejecución, leída del modelo de objetos:");
    N.push("    objetos en el diagrama: " + ch.leidos);
    N.push("    con la Y crecida, o sea colocados: " + ch.bien);
    N.push("    mensajes dibujados: " + r.puestos + " de " + TOTAL_MSG);
    N.push("    mensajes a sí mismo: " + r.autodestino);
    N.push("    conectores en el diagrama: " + r.enDiagrama);
    N.push("    MARCOS de fragmento colocados: " + MARCOS_PUESTOS + " de 3");
    N.push("    BARRAS de activación colocadas: " + BARRAS_PUESTAS + " de 3");
    N.push("");
    N.push("  Y UN AVISO QUE HAY QUE REPETIR: los tres marcos y las tres barras son FORMAS");
    N.push("  dibujadas por script, NO son fragmentos nativos de EA.   EA no los coloca de forma");
    N.push("  fiable por API.   Cada uno va en try/catch y cuenta los que ha puesto, y el informe");
    N.push("  final lo dice.   Si alguno sale a 0, hay que dibujarlo a mano.");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU27 Secuencia", 0); } catch (e) { }
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
    T.push("CU27 - DIAGRAMA DE SECUENCIA - INFORME");
    T.push("");
    T.push("Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB);
    T.push("Tipo de diagrama: " + tipoUsado);
    T.push("Mensajes: " + r.puestos + " de " + TOTAL_MSG);
    T.push("Mensajes a sí mismo: " + r.autodestino);
    T.push("Conectores en el diagrama: " + r.enDiagrama);
    T.push("Hallazgos: " + h2.total + " de " + TOTAL_HAL + ", banda hasta la y " + h2.fin);
    T.push("");
    T.push("AVISO DE NUMERACIÓN");
    T.push("Este caso es CU27 en el documento y CU35 en el código, y el título");
    T.push("COINCIDE EXACTO, sin una palabra de diferencia. Un caso de la");
    T.push("serie con eso. Y el caso de la caja, CU37, está a dos líneas en el");
    T.push("mismo fichero y comparte servicio, bucles y transacción.");
    T.push("");
    T.push("MARCOS Y BARRAS  <-- MIRA ESTO");
    T.push("Este caso tiene 3 loop y NINGUN alt. Contado ANTES de dibujar, con");
    T.push("contadores, sobre las 784 líneas de SRV_PagosService:");
    T.push("  for 6   while 0   Promise.all 0   continue 2   map 0");
    T.push("  filter 0   reduce 0   ternarios 10");
    T.push("  if 40   throw 29   NotFoundException 8   ConflictException 9");
    T.push("  dataSource.query 13   em.query 15   transaction 2");
    T.push("  try 1   catch 1   bitacora 9   FOR UPDATE 4");
    T.push("Y LOS 6 for, REPARTIDOS EN DOS MÉTODOS:");
    T.push("  L296  procesarPagoCaja   que es CU37, y NO es de este caso");
    T.push("  L309  procesarPagoCaja   que es CU37, y NO es de este caso");
    T.push("  L336  procesarPagoCaja   que es CU37, y NO es de este caso");
    T.push("  L667  procesarResultado  <-- LOOP 1 DEL CASO");
    T.push("  L680  procesarResultado  <-- LOOP 2 DEL CASO");
    T.push("  L706  procesarResultado  <-- LOOP 3 DEL CASO");
    T.push("Los tres del caso están SEGUIDOS, del 667 al 720, y en el MISMO");
    T.push("lifeline y en el MISMO método. Es el caso con más bucles por");
    T.push("lifeline de la serie, y el único con tres en un solo elemento.");
    T.push("");
    T.push("NINGÚN alt, y por qué: de los tres caminos de resultado, L518 el");
    T.push("timeout, L522 el resultado inválido y L545 el válido, son tres");
    T.push("'return' consecutivos del mismo if, no dos mitades de una decisión.");
    T.push("Un alt no aportaría nada. Los tres van como mensajes de retorno");
    T.push("con la guarda entre corchetes, que es lo que hace el script con");
    T.push("la letra S o A del final.");
    T.push("");
    T.push("SOBRE QUÉ ELEMENTO ESTÁ CADA MARCO:");
    T.push("  loop 1  sobre SRV_PagosService  L667  SELECT ... FOR UPDATE");
    T.push("  loop 2  sobre SRV_PagosService  L680  compara en memoria");
    T.push("  loop 3  sobre SRV_PagosService  L706  UPDATE e INSERT");
    T.push("El nombre sale de las coordenadas del marco con lifelineEnX(), no");
    T.push("está escrito a mano, así que no puede desincronizarse.");
    T.push("");
    T.push("Fragmentos colocados: " + MARCOS_PUESTOS + " de 3");
    T.push("Barras de activación colocadas: " + BARRAS_PUESTAS + " de 3");
    if (MARCOS_PUESTOS < 3 || BARRAS_PUESTAS < 3) {
        T.push("  Si alguno sale a 0, EA no ha aceptado la forma y hay que");
        T.push("  dibujarlo a mano en el diagrama.");
    } else {
        T.push("  Los 6 han salido. Son FORMAS dibujadas por script, no");
        T.push("  fragmentos nativos de EA: EA no los coloca por API de forma");
        T.push("  fiable. El marco lleva pestaña, tipo, elemento y condición.");
    }
    T.push("");
    T.push("HALLAZGOS");
    T.push("  1  El secreto de la firma está en el código, L40, y el único");
    T.push("     endpoint sin sesión es el que lo acepta, L480. La firma");
    T.push("     incluye el estado, L103, pero no lleva fecha ni usuario.");
    T.push("  2  El stock se comprueba dos veces, L667 y L680, y la segunda");
    T.push("     no puede fallar: lee del array que la primera llenó.");
    T.push("  3  cantidad_reservada se lee en L670 y no la escribe nadie en");
    T.push("     todo el camino. Se escribe en 3 sitios del proyecto y los 3");
    T.push("     están en SRV_ReservasService: L1117, L709 y L979. Ninguno en");
    T.push("     un camino de pago. La reserva sobrevive a la venta.");
    T.push("  4  El stock no lo escribe el código: lo escribe el trigger, que");
    T.push("     es el ÚNICO que hace falta. De 8 funciones y 2 triggers del");
    T.push("     esquema, 1 función viva, 1 duplicada por el TS y 6 sin llamar.");
    T.push("  5  Las 4 llamadas de afterward están fuera de la transacción, y");
    T.push("     solo las de preferencias tienen try/catch propio, L768-780.");
    T.push("  6  La pantalla nombra a Libélula, Stripe y PayPal, L13-18, y no");
    T.push("     hay ninguno integrado: el servidor se llama a sí mismo, L545.");
    T.push("  7  @HttpCode(OK) de L124 solo aplica al camino feliz. El webhook");
    T.push("     sí usa el código correcto, 401 para la firma, L486.");
    T.push("  8  Y ocho cosas buenas, la primera la transacción cerrada de");
    T.push("     L647 a L721 con los tres bucles dentro, y el try/catch de L768");
    T.push("     en el punto exacto donde hace falta.");
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
    msg = msg + "CU27 - Procesar Pago con Pasarela de Pago" + SALTO;
    msg = msg + "Diagrama de secuencia, sección 3.3.2.1." + SALTO;
    msg = msg + "En el código del proyecto este caso es CU35, y el título" + SALTO;
    msg = msg + "COINCIDE EXACTO, sin una palabra de diferencia." + SALTO + SALTO;
    msg = msg + "10 líneas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "3 loop, TODOS en SRV_PagosService, y NINGUN alt." + SALTO;
    msg = msg + "Es el caso con más bucles de la serie y el único con" + SALTO;
    msg = msg + "tres en un solo lifeline: L667, L680 y L706, seguidos, en" + SALTO;
    msg = msg + "procesarResultado. Los otros tres for del servicio, L296, L309" + SALTO;
    msg = msg + "y L336, son de la caja, CU37." + SALTO;
    msg = msg + "Sobre qué elemento está cada uno: los tres, SRV_PagosService." + SALTO;
    msg = msg + "FRAGMENTOS colocados: " + MARCOS_PUESTOS + " de 3." + SALTO;
    msg = msg + "BARRAS colocadas: " + BARRAS_PUESTAS + " de 3." + SALTO;
    if (MARCOS_PUESTOS < 3 || BARRAS_PUESTAS < 3) msg = msg + "  Si falta alguno, hay que dibujarlo a mano." + SALTO;
    msg = msg + SALTO;
    msg = msg + "HALLAZGO GRAVE DE SEGURIDAD: FIRMA_SECRETO, L40, tiene el valor" + SALTO;
    msg = msg + "por defecto 'sandbox-secreto-cu35' escrito en el código, y" + SALTO;
    msg = msg + "procesarWebhook, L480, es el ÚNICO endpoint sin guard. La firma" + SALTO;
    msg = msg + "sí lleva el estado, L103, y usa timingSafeEqual, L111. Lo que" + SALTO;
    msg = msg + "no lleva es fecha ni usuario, así que no caduca. Y el sandbox" + SALTO;
    msg = msg + "se llama a sí mismo por ese webhook, L545: la firma la genera" + SALTO;
    msg = msg + "el mismo proceso que la valida." + SALTO + SALTO;
    msg = msg + "HALLAZGO DE LÓGICA: cantidad_reservada se lee en L670 y no la" + SALTO;
    msg = msg + "escribe nadie en todo el camino. En el proyecto se escribe en" + SALTO;
    msg = msg + "3 sitios y los 3 están en SRV_ReservasService: L1117, L709 y" + SALTO;
    msg = msg + "L979. Ninguno en un camino de pago, ni el digital ni el de" + SALTO;
    msg = msg + "caja. Así que una prenda reservada se puede vender y la reserva" + SALTO;
    msg = msg + "sigue viva, y al cancelarla el stock queda inflado." + SALTO + SALTO;
    msg = msg + "Y no es una pasarela real: la pantalla nombra a Libélula," + SALTO;
    msg = msg + "Stripe y PayPal, y no hay ninguno integrado. Todo es local." + SALTO + SALTO;
    msg = msg + "Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACIÓN: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU27 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU27 Secuencia", 0); } catch (e3) { }
}
