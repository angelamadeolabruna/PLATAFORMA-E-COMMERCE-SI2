// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU22  Consultar y Cancelar el Estado de una Reserva
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/router.tsx                          L87-90
//     web/src/pages/cliente/MisReservas.tsx       148 lineas
//     web/src/pages/cliente/DetalleReserva.tsx    324 lineas
//     web/src/lib/reservas.ts                     84 lineas
//     web/src/lib/roles.ts                        L14-18
//     web/src/components/layout/Navbar.tsx        L254
//     web/src/data/clienteMenu.ts                 L38-44
//     web/src/lib/api.ts                          L734, L1700-1716
//     api/src/modulos/seguridad/dependencias.ts   L15-65
//     api/src/modulos/reservas/CTR_Reservas.ts    L64-102
//     api/src/modulos/reservas/SRV_ReservasService.ts  1215 lineas
//     api/src/modulos/seguridad/SRV_BitacoraService.ts L14-39
//     BASE DE DATOS/schema.sql                    L344-363, L565, L573-578
//
// QUE HACE ESTE CASO
//   Dos cosas, en dos pantallas que SI existen, a diferencia de CU21:
//   ver la lista de reservas del cliente, ver el detalle de una, y
//   cancelarla.
//
//     MisReservas.tsx      148 lineas, la lista
//     DetalleReserva.tsx   324 lineas, el detalle, la linea de tiempo
//                          y el boton de cancelar
//     router.tsx L87-90    las dos rutas, y las dos funcionan
//
//   Y tiene DOS HALLAZGOS GRAVES, ambos verificables:
//
//     1  El caso pide un permiso que el rol Cliente NO tiene. El
//        endpoint exige gestionar_reservas, L197. El seed del
//        rol Cliente, schema.sql L577, es
//        ["ver_catalogo","comprar","reservar","usar_vestidor_ra"].
//        O sea que el caso entero devuelve 403 al que debe usarlo.
//
//     2  El indice de la tabla esta en la columna que nadie consulta.
//        schema.sql L565 crea idx_reservas_cliente sobre id_usuario,
//        y las tres consultas de este caso filtran por id_cliente.
//
//   53 mensajes. 10 lineas de vida. 8 hallazgos.
//   1 fragmento: un loop y ningun alt. Explicado mas abajo.
//
// LOS FRAGMENTOS: UN loop Y NINGUN alt
//   Contado antes de escribir, con contadores, sobre las 1215 lineas de
//   SRV_ReservasService:
//
//     for 5   while 0   Promise.all 0
//     if 60   throw 45   ternarios 80   map 11   reduce 1   continue 2
//     dataSource.query 22   em.query 20   transaction 5
//     bitacoraService.registrar 6
//
//   Y DE LOS 5 FOR, SOLO 1 ES DE ESTE CASO:
//
//     L968  el bucle de cancelar, que devuelve el stock prenda a prenda
//
//   Los otros cuatro son de otros casos: L524, L698 que es el helper
//   de finalizar, L1086 que es crear y L1173 que es validar. Y se
//   cuentan aparte, porque son otros casos de uso.
//
//   LAS DOS CONSULTAS DE ESTE CASO NO TIENEN NINGUN BUCLE. Ni
//   consultarMias, L413-443, ni consultarDetalle, L445-489, ni
//   itemDetalle, L885-908. Los tres son un SELECT y un map. Y un map
//   no es un bucle de control, asi que no se cuenta.
//
//   NO HAY NINGUN alt. En el camino de este caso hay ocho if y ocho
//   son guardas: el permiso, el cliente, el id, el 404, y los cuatro
//   estados que impiden cancelar. Ninguno tiene dos caminos de verdad.
//
//   Y las 3 barras de activacion: la del controlador, la del servicio,
//   y la de la base de datos, que existe solo entre L924 y L985.
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
var TOTAL_MSG = 53;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU22 Secuencia Consultar Cancelar Reserva";
var DIAG_NOMBRE = "CU22 Consultar Cancelar Reserva";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 150;

var X_NOTA = 2675;
var ANCHO_NOTA = 520;
var Y_NOTA0 = 250;
var ALTO_LINEA_NOTA = 12;
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
    ["U", "ACTOR_Cliente", "Actor", "Lifeline", "Cliente", "quien consulta y cancela", "Actor, no clase: es quien pulsa", "no es codigo, es la persona. Y segun el seed NO puede usar este caso: hallazgo 1"],
    ["M", "MisReservas.tsx", "Object", "Lifeline", "MisReservas", "148 lineas, la lista", "Boundary", "web/src/pages/cliente/MisReservas.tsx, 148 lineas, L112-140 el map de la lista"],
    ["D", "DetalleReserva.tsx", "Object", "Lifeline", "DetalleReserva", "324 lineas, cancelar", "Boundary", "web/src/pages/cliente/DetalleReserva.tsx, 324 lineas, L57-71 el cancelar y L74 la guarda del boton"],
    ["V", "lib/reservas.ts", "Object", "Lifeline", "libReservas", "varianteEstadoReserva", "Boundary", "web/src/lib/reservas.ts, 84 lineas, L56-71 el switch de los 5 estados"],
    ["H", "api.ts", "Object", "Lifeline", "api", "seccion CU29", "Boundary", "web/src/lib/api.ts, L734 la seccion y L1700-1716 los tres metodos"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de las tres rutas", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["C", "CTR_Reservas", "Object", "Lifeline", "ReservasController", "3 endpoints del caso", "Control", "api/src/modulos/reservas/CTR_Reservas.ts, L64-102"],
    ["S", "SRV_ReservasService", "Object", "Lifeline", "ReservasService", "1215 lineas, 3 metodos", "Control", "api/src/modulos/reservas/SRV_ReservasService.ts, L413-443, L445-489, L910-999"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar(), al cancelar", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["Q", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "reservas y reserva_items", "Entity", "schema.sql L344-363: reservas, 11 columnas, sin numero; reserva_items, 4 columnas, sin precio. Y L565 el indice sobre id_usuario"]
];

var MSG = [
    [1, "U", "M", "1. entra a /reservas   router.tsx L87-88: la ruta con ClienteLayout y el index a MisReservas   Y OJO: la ruta NO tiene guard de permiso, L87. O sea que la pantalla se abre siempre, y el 403 llega despues, del backend", "S"],
    [2, "M", "H", "2. GET /api/v1/reservas/mias   api.ts L1701-1704, dentro de la seccion CU29 de L1700   Y el caso de uso se llama 'Consultar Y Cancelar', pero son tres llamadas distintas: listarReservasMias, obtenerReservaDetalle y cancelarReserva", "S"],
    [3, "H", "G", "3. con Authorization Bearer   El GET no lleva cuerpo, y NO hay DTO: el controlador mias, L66, no recibe nada mas que currentUser", "S"],
    [4, "G", "Q", "4. SELECT usuarios WHERE id_usuario = :sub   L44 del guard   Una consulta por peticion, en el guard, antes de todo", "S"],
    [5, "G", "C", "5. mias( @UsuarioActual() currentUser ), CTR_Reservas L64-68   Y el decorador @UseGuards(JwtAuthGuard) esta en L65, o sea que el permiso NO se comprueba aqui sino dentro del servicio", "S"],
    [6, "C", "S", "6. consultarMias( currentUser ), L413, y aqui entra el HALLAZGO 1: exigirPermiso( usuario ), L414", "S"],
    [7, "S", "Q", "7. SELECT r.permisos_json FROM usuarios JOIN usuarios_roles JOIN roles WHERE u.id_usuario = $1   L184-191, con 3 JOIN   Y el resultado se queda con el PRIMERO: const [fila] = ..., L184", "S"],
    [8, "S", "S", "8. [permisos no incluye '*' ni 'gestionar_reservas'] 403 'No tienes permisos para realizar reservas.'   L197-199   Y aqui esta el hallazgo 1: el rol Cliente del seed, schema.sql L577, es [ver_catalogo, comprar, reservar, usar_vestidor_ra]. No tiene gestionar_reservas   El permiso que SI tiene, 'reservar', no lo comprueba NADIE en todo el proyecto: cero ocurrencias", "S"],
    [9, "S", "Q", "9. SELECT id_cliente FROM clientes WHERE usuario_id = $1   L270, en clienteDe   Y si no hay fila: 403 'Tu usuario no está registrado como cliente.', L275", "S"],
    [10, "S", "Q", "10. SELECT r.id_reserva, r.fecha_reserva, r.hora_reserva, r.estado, r.fecha_creacion, s.nombre AS sucursal, COUNT(ri.id_reserva_item)::int AS total_prendas FROM reservas r JOIN sucursales s LEFT JOIN reserva_items ri WHERE r.id_cliente = $1 GROUP BY .. ORDER BY r.fecha_creacion DESC, r.id_reserva DESC   L418-427   Y AQUI ESTA EL HALLAZGO 2: filtra por id_cliente, y el unico indice de la tabla es sobre id_usuario, L565", "S"],
    [11, "S", "S", "11. y el COUNT es COUNT(ri.id_reserva_item), L420: cuenta LINEAS de reserva_items, no prendas.   En la base no hay SUM(ri.cantidad) en ningun sitio.   Y con el LEFT JOIN, una reserva sin items sale con 0 y no desaparece de la lista, que es lo correcto", "S"],
    [12, "S", "S", "12. y aqui hay otro detalle: numero: this.numeroReserva( idReserva ), L434, que es RES- + el id con padStart(6,'0'), L409-411   O sea que el numero se RECOMPONE en cada respuesta.   Y la tabla reservas, L344-355, tiene 11 columnas y numero NO esta entre ellas. El numero no existe en la base de datos", "S"],
    [13, "S", "H", "13. el array de ReservaListaItem, api.ts L735-744: id_reserva, numero, estado, sucursal, fecha_reserva, hora_reserva, fecha_creacion y cantidad_prendas", "A"],
    [14, "H", "M", "14. la respuesta   Y la pinta en el map de L112-140, con el numero en font-mono, L122, el Badge del estado en L123, la sucursal, la fecha, y el numero de prendas con su plural, L133", "A"],
    [15, "M", "V", "15. y para pintar el Badge llama a varianteEstadoReserva( r.estado ), L123, que esta en lib/reservas.ts L56-71   Un switch con los 5 estados y su color: Solicitada brand, Preparada warning, En tienda accent, Cumplida success, Cancelada danger, y default neutral", "S"],
    [16, "V", "M", "16. [Solicitada] brand   [Preparada] warning   [En tienda] accent   [Cumplida] success   [Cancelada] danger   [cualquier otro] neutral   O sea que la lista de estados del frontend es UNA TERCERA COPIA, y no esta en el esquema: el campo es VARCHAR(20) sin CHECK ni ENUM, L351", "A"],
    [17, "M", "D", "17. y pincha en una reserva, L115: Link to /reservas/{id}   router.tsx L89, la ruta :id a DetalleReserva   Y es un Link, o sea que no hay peticion todavia: la pantalla de detalle tiene su propio useEffect", "S"],
    [18, "D", "H", "18. GET /api/v1/reservas/{id}   api.ts L1706-1709   Y el id llega como texto de useParams, DetalleReserva L27, y se convierte a numero en la pantalla", "S"],
    [19, "H", "G", "19. el guard otra vez: otra consulta a usuarios, L44   O sea que esta segunda pantalla del caso paga un SELECT de permiso mas", "S"],
    [20, "G", "C", "20. detalle( @Param('id') id, @UsuarioActual() currentUser ), L88-92   Y con el decorador en L89, que va DESPUES de la ruta: el orden de los decoradores en el fuente es al reves", "S"],
    [21, "C", "S", "21. consultarDetalle( currentUser, idReserva ), L445   Y vuelve a empezar por exigirPermiso, L446, y clienteDe, L447   O sea que la segunda pantalla del caso repite las DOS consultas de la primera: permisos y cliente", "S"],
    [22, "S", "S", "22. [id no entero o <= 0] 404 'Reserva no encontrada.'   L448-451   O sea que un id con letras da 404 y no 400. Y DetalleReserva L33 tiene un setEs404 para el caso, y L91-93 lo distingue del error de conexion", "S"],
    [23, "S", "Q", "23. SELECT r.id_reserva, .., r.fecha_preparada, r.fecha_atendida, r.id_encargado, s.nombre, s.direccion, ci.nombre AS ciudad, s.telefono FROM reservas r JOIN sucursales s LEFT JOIN ciudades ci WHERE r.id_reserva = $1 AND r.id_cliente = $2   L455-462   Consulta 1 de 2 del detalle.   Y otra vez por id_cliente, no por id_usuario", "S"],
    [24, "S", "S", "24. [no hay fila] 404 'Reserva no encontrada.'   L465-467   Y el WHERE lleva el id_cliente, o sea que la reserva de otro cliente da el MISMO 404 que una que no existe. Eso es lo correcto, y por eso el mensaje de la pantalla, L92, dice 'La reserva no existe o no te pertenece.'", "S"],
    [25, "S", "Q", "25. SELECT ri.id_ptc, ri.cantidad, p.nombre, p.codigo, t.nombre AS talla, c.nombre AS color, p.precio_base FROM reserva_items ri JOIN producto_talla_color ptc JOIN productos p JOIN tallas t JOIN colores c WHERE ri.id_reserva = $1 ORDER BY ri.id_reserva_item ASC   L887-896, en itemDetalle   Consulta 2 de 2, con 4 JOIN   Y SIN GROUP BY, sin bucle y sin N+1: una sola consulta con el id de la reserva", "S"],
    [26, "S", "S", "26. y los mapea uno a uno, L899-907, con el Number() en cantidad y en precio_base, y el ?? '' en los cuatro nombres", "A"],
    [27, "S", "H", "27. { reserva: { .., 12 campos }, items: [ .. ] }   api.ts L756-773   Y las deux mitades del return, L471-488: la reserva con sus 3 fechas y su id_encargado, y los items aparte", "A"],
    [28, "H", "D", "28. la respuesta   Y DetalleReserva L43 la guarda en un unico useState, datos, L30, que o es el objeto entero o es null", "A"],
    [29, "D", "D", "29. y aqui se arma la linea de tiempo, L73 y L127: los pasos son Solicitada, Preparada y En tienda, y cada uno con su fecha   O sea que hay un paso por ESTADO, y el estado Cumplida y el Cancelada no son pasos: el Cancelada es un aviso aparte, L255-260, y el Cumplida no aparece", "S"],
    [30, "D", "D", "30. y hay un total estimado, L76: reduce( (acc, i) => acc + i.precio_base * i.cantidad, 0 )   O sea que la pantalla enseña un TOTAL DE DINERO al cliente. Y ese dinero no existe: reserva_items tiene 4 columnas, L358-363, y no hay ningun precio guardado. El precio sale de productos.precio_base, que es el de catalogo de HOY", "S"],
    [31, "D", "D", "31. y el boton de cancelar sale solo si esCancelable, L149, que es L74: estado === 'Solicitada' || estado === 'Preparada'   O sea que el boton es una guarda en el cliente, y no hay ningun estado mas que lo esconda", "A"],
    [32, "D", "U", "32. y pincha en 'Cancelar Reserva', L150, con Trash2 al lado   Se abre un modal de confirmacion, L279-291, con dos botones: volver y 'Sí, cancelar reserva'", "S"],
    [33, "U", "D", "33. confirma   Y el modal tiene su propio boton con loading={cancelando}, L290, para que no se pueda pinchar dos veces", "S"],
    [34, "D", "H", "34. PATCH /api/v1/reservas/{id}/cancelar   api.ts L1711-1716, con method: 'PATCH' y SIN cuerpo   O sea que no hay motivo de cancelacion, ni nota, ni nada. La palabra la pone el backend: 'Reserva cancelada correctamente.'", "S"],
    [35, "H", "G", "35. el guard por tercera vez: la tercera consulta a usuarios del caso", "S"],
    [36, "G", "C", "36. cancelar( @Param('id') id, @UsuarioActual() currentUser, @Req() request ), CTR_Reservas L94-102   Y este SI lleva el request, porque la bitacora lo necesita", "S"],
    [37, "C", "S", "37. cancelar( usuario, idReserva, request ), L910, y el resultado es { message, estado }   Y vuelve a empezar por exigirPermiso, L915, y clienteDe, L916: la cuarta y la quinta consulta repetidas", "S"],
    [38, "S", "Q", "38. dataSource.transaction( async (em) => { ... } ), L924   O sea que el cancelar SI es atomico, y con FOR UPDATE, L930, para que dos personas no cancelen la misma reserva a la vez", "S"],
    [39, "S", "Q", "39. SELECT r.id_reserva, r.estado, r.id_sucursal FROM reservas r WHERE r.id_reserva = $1 AND r.id_cliente = $2 FOR UPDATE   L927-931   Y otra vez por id_cliente   Y el FOR UPDATE es el MISMO patron que en CU21, y uno de los nueve del proyecto", "S"],
    [40, "S", "S", "40. y aqui estan los CUATRO guardas de estado, y son la parte mas bien escrita del caso:   [Cancelada] 409 'La reserva ya no está vigente.', L939-941   [En tienda o Cumplida] 409 'La reserva ya fue atendida y no puede cancelarse. Si tienes un inconveniente, contacta a ...', L942-946   [cualquier otro] 409 'La reserva ya no puede cancelarse.', L947-949   Y el ultimo es una lista blanca: solo pasa Solicitada y Preparada, que son los mismos dos que mira la pantalla en L74", "S"],
    [41, "S", "Q", "41. SELECT ri.id_ptc, ri.cantidad, p.nombre, t.nombre AS talla, c.nombre AS color FROM reserva_items ri JOIN producto_talla_color ptc JOIN productos p JOIN tallas t JOIN colores c WHERE ri.id_reserva = $1 ORDER BY ri.id_reserva_item ASC   L953-962   Y es el mismo SELECT que el del detalle, L887-896, con dos columnas menos: ni codigo ni precio_base", "S"],
    [42, "S", "Q", "42. UPDATE reservas SET estado = 'Cancelada' WHERE id_reserva = $1   L965   Y el WHERE es solo por id_reserva, SIN id_cliente. O sea que la escritura no repite el filtro de la lectura, L929. Aqui no importa, porque el id_cliente ya se comprobo con la fila bloqueada de L927, pero son dos criterios distintos en la misma transaccion", "S"],
    [43, "S", "S", "43. y aqui empieza el UNICO LOOP del caso, L968, que es de donde sale el contador de prendas: for ( const item of items ), con L970 continue si la cantidad es 0, y L971 prendas += cantidad", "S"],
    [44, "S", "Q", "44. vuelta 1: INSERT INTO movimientos_inventario ( id_ptc, id_sucursal, tipo_movimiento, cantidad, referencia, id_usuario, id_reserva ) VALUES ( $1, $2, 'SALIDA-RESERVA', $3, $4, $5, $6 )   L973-975, con la cantidad POSITIVA y la referencia 'Cancelacion RES-000123'   Y vuelta 2: UPDATE inventario_stock SET cantidad_reservada = GREATEST(0, cantidad_reservada - $3)   L978-981   Y AQUI ESTA LA BUENA NOTICIA: NO toca cantidad_disponible. Lo hace el trigger, schema.sql L648, y solo una vez. O sea que esta ruta esta BIEN, y el hallazgo 3 de CU20 no aplica aqui", "S"],
    [45, "S", "Q", "45. fin del loop, y COMMIT, L985   Y cantidadPrendas = prendas, L984, que es lo que va al mensaje de la bitacora", "A"],
    [46, "S", "B", "46. bitacoraService.registrar( usuario, 'UPDATE', 'reservas', 'Reserva RES-000123 cancelada (N prenda(s), stock liberado).', request, id, { estado: 'Solicitada' }, { estado: 'Cancelada' } ), L987-996   Y ESTA ES LA UNICA BITACORA DEL CASO QUE TRAE OLDDATA Y NEWDATA DE VERDAD, L994-995, con el estado antes y despues   Las de CU21, en cambio, ponian null. Y va FUERA de la transaccion, que cierra en L985", "S"],
    [47, "B", "Q", "47. y se escribe por el repositorio de TypeORM, SRV_BitacoraService L27-38, repo.create y repo.save   NO es un INSERT por dataSource.query, y por eso no puede entrar en la transaccion de L924   O sea que la reserva puede estar cancelada y sin bitacora", "A"],
    [48, "S", "C", "48. { message: 'Reserva cancelada correctamente.', estado: 'Cancelada' }   L998   Y la palabra 'correctamente' se dice antes de que nadie haya comprobado nada. O sea que si el trigger falla, el mensaje ya estaba escrito", "A"],
    [49, "C", "H", "49. 200 OK con ese JSON   Y el PATCH devuelve 200 y no 204, y con cuerpo, que es lo que hace que la pantalla pueda poner el estado sin recargar", "A"],
    [50, "H", "D", "50. la respuesta   api.ts L1715", "A"],
    [51, "D", "D", "51. y aqui hay un detalle: NO recarga. L62: setDatos( prev => ({ ...prev, reserva: { ...prev.reserva, estado: resultado.estado } } ) )   O sea que cambia el estado EN MEMORIA y no vuelve a pedir los datos   Y acierta, pero por casualidad: lo unico que cambiar es el estado, porque cancelar no toca fecha_atendida ni id_encargado. Si manana cancelar rellenara una fecha, la linea de tiempo de L127 la seguiria mostrando vacia", "S"],
    [52, "D", "U", "52. toast de exito con el mensaje del backend, L64, y el modal se cierra, L63   Y si falla, L65-68, el toast de error con el ApiError. O sea que el 409 de los cuatro guardas de L939-949 llega a la pantalla con su texto entero", "A"],
    [53, "U", "U", "53. este caso tiene las dos pantallas, y eso lo hace el primero que lo consigue.   Y tiene dos hallazgos graves: pide un permiso que el rol Cliente no tiene, y el indice de la tabla esta en la columna que nadie consulta   Y un tercero pequeno: el numero de reserva no existe en la base de datos, se recompone cada vez, y es lo que se ve en la pantalla", "A"]
];

var HAL = [
    ["1. El caso exige un permiso que el rol Cliente no tiene", [
        "El hallazgo grave, y hace que este caso de uso no lo pueda",
        "hacer el que debe hacerlo.",
        "",
        "EL SERVIDOR, SRV_ReservasService L195-200:",
        "",
        "  private async exigirPermiso(usuario: Usuario): Promise<void> {",
        "    const permisos = await this.cargarPermisos(usuario);",
        "    if (!(permisos.includes('*') ||",
        "          permisos.includes('gestionar_reservas'))) {",
        "      throw new ForbiddenException(",
        "        'No tienes permisos para realizar reservas.');",
        "    }",
        "  }",
        "",
        "Y LA LLAMA EN LOS TRES ENDPOINTS DE ESTE CASO: L414 en",
        "consultarMias, L446 en consultarDetalle y L915 en cancelar. O",
        "sea que los tres empiezan por el mismo 403.",
        "",
        "EL ROL CLIENTE DEL SEED, schema.sql L577, entero:",
        "",
        "  ('Cliente', 'Compra y reserva en la plataforma',",
        "   '[\"ver_catalogo\",\"comprar\",\"reservar\",",
        "    \"usar_vestidor_ra\"]', 'Activo'),",
        "",
        "gestionar_reservas NO ESTA. Y el permiso que el cliente SI",
        "tiene, que es 'reservar', NO LO COMPRUEBA NADIE: cero",
        "ocurrencias de un permisos.includes('reservar') en los 24",
        "modulos y las 40 paginas. O sea que el permiso que describe",
        "lo que el cliente puede hacer esta sembrado y muerto.",
        "",
        "CONSECUENCIA, y es literal: un Cliente que entra a /reservas",
        "recibe 403 en las tres llamadas. La ruta no tiene guard de",
        "permiso, router.tsx L87, o sea que la pantalla se pinta y",
        "luego falla. El menu tampoco lo salva: clienteMenu.ts L41",
        "pide permiso: 'gestionar_reservas', o sea que /reservas",
        "tampoco le sale en el menu a un Cliente.",
        "",
        "LO QUE SI LO HACE, y no es poco: el Administrador, que tiene",
        "'*', entra sin problema. Y el Encargado de Sucursal, que lo",
        "tiene en su lista de L575, tambien. O sea que este caso SI",
        "funciona, para quien no le toca.",
        "",
        "Y LA SEGUNDA CONSECUENCIA, que es la mas rara: lib/roles.ts",
        "L14-18, la funcion que decide si alguien es cliente,",
        "",
        "  export function esCliente(usuario) {",
        "    const permisos = usuario?.permisos ?? [];",
        "    return permisos.includes('gestionar_reservas')",
        "        && !esPersonal(usuario);",
        "  }",
        "",
        "Usa un permiso de GESTION para decidir quien es CLIENTE. Con",
        "el seed, esCliente() no devuelve true para NINGUN rol: al",
        "Cliente le falta el permiso, y al Administrador y al Encargado",
        "los saca el && !esPersonal. Y Navbar.tsx L254 lo usa para",
        "pintar el bloque de cliente, o sea que la barra de",
        "navegacion no le muestra nada a un Cliente."
    ]],
    ["2. El indice de la tabla esta en la columna que nadie consulta", [
        "El hallazgo tecnico, y es el mas facil de arreglar de todos",
        "los que han salido.",
        "",
        "EL UNICO INDICE DE LA TABLA reservas, schema.sql L565:",
        "",
        "  CREATE INDEX idx_reservas_cliente ON reservas (id_usuario);",
        "",
        "Se llama idx_reservas_cliente, o sea que la intencion era",
        "clara: indice para las reservas de un cliente. Pero esta",
        "sobre id_usuario.",
        "",
        "Y LAS TRES CONSULTAS DE ESTE CASO FILTRAN POR id_cliente:",
        "",
        "  consultarMias     L424  WHERE r.id_cliente = $1",
        "  consultarDetalle  L461  WHERE r.id_reserva = $1",
        "                           AND r.id_cliente = $2",
        "  cancelar          L929  WHERE r.id_reserva = $1",
        "                           AND r.id_cliente = $2",
        "",
        "Cero consultas por id_usuario en este caso. Y la columna no",
        "esta de adorno: CU21 la rellena, L1073, el INSERT mete",
        "id_cliente Y id_usuario.",
        "",
        "ASI QUE LA LISTA DE MIS RESERVAS HACE UN SEQ SCAN de la",
        "tabla reservas en cada carga, y encima lleva GROUP BY de 6",
        "columnas, L425, y ORDER BY de dos, L426, y un LEFT JOIN con",
        "reserva_items para el COUNT, L423. O sea que el caso mas",
        "consultado del modulo es el que no tiene indice.",
        "",
        "Y NO HAY NINGUN ALTER TABLE NI NINGUN CREATE INDEX en el",
        "TypeScript: el indice se crea al desplegar y no se toca",
        "despues. Las 11 columnas de reservas, L345-355, se pueden",
        "quitar sin que nada se entere.",
        "",
        "LO QUE LO HACE MAS CARO: el precio de la consulta crece con",
        "el numero de reservas de la BASE ENTERA, no con las del",
        "cliente. Y el numero de reservas de la base entera es el",
        "que crece, porque el indice no frena a nadie.",
        "",
        "Y LA PARTE DE ADEMAS: el nombre del indice es",
        "idx_reservas_cliente y la columna es id_usuario. O sea que",
        "alguien leyo el nombre y creyo que estaba bien. Es el mismo",
        "descuido de nombre que el UPDATE de L1084 de CU21, que no",
        "guardaba el numero: la intencion esta escrita y la linea se",
        "quedo con otra cosa."
    ]],
    ["3. El numero de reserva no existe en la base de datos", [
        "Este es el hallazgo 6 de CU21 visto desde el otro lado, y",
        "aqui se ve completo.",
        "",
        "LA TABLA reservas, schema.sql L344-356, tiene 11 columnas:",
        "",
        "  id_reserva  id_cliente  id_usuario  id_sucursal",
        "  fecha_reserva  hora_reserva  estado  id_encargado",
        "  fecha_creacion  fecha_preparada  fecha_atendida",
        "",
        "numero NO ESTA. Y en el TypeScript tampoco: cero",
        "SET numero y cero INSERT con numero, en las reservas.",
        "",
        "ENTONCES EL NUMERO SE RECOMPONE, numeroReserva L409-411:",
        "",
        "  private numeroReserva(idReserva: number): string {",
        "    return `RES-${String(idReserva).padStart(6, '0')}`;",
        "  }",
        "",
        "Y SE LLAMA EN CADA RESPUESTA, CUATRO VECES EN ESTE CASO, y 10 en el",
        "fichero entero:",
        "",
        "  L434  el numero de cada fila de la lista",
        "  L474  el numero de la cabecera del detalle",
        "  L757  el de prepararReserva, que es de otro caso",
        "  L975  la referencia del movimiento, dentro de la tx",
        "  L991  el mensaje de la bitacora",
        "",
        "Y CU21 lo construia en una variable, L1083, con la misma",
        "formula, y su UPDATE de L1084 no lo guardaba. Los dos",
        "lugares del proyecto que tocan el numero hacen lo mismo:",
        "calcularlo.",
        "",
        "Y ADEMAS, y esto es lo que mas lo dice: el proyecto SI sabe",
        "guardar un numero de documento. En SRV_ComprasService hay un",
        "SET numero, y ordenes_compra tiene su columna numero. O sea que",
        "la respuesta buena se escribio para las ordenes de compra y no",
        "se copio para las reservas. No es que no supieran: es que aqui",
        "no lo hicieron.",
        "",
        "POR QUE IMPORTA, y no es puramente estetico:",
        "",
        "  1  El numero es lo que ve el cliente. MisReservas L122 lo",
        "     pinta en font-mono, y DetalleReserva L142 lo pone de",
        "     TITULO de la pagina. O sea que es el dato mas visible",
        "     del caso.",
        "  2  El numero va dentro del contenido de un movimiento de",
        "     inventario, L975. O sea que el kardex de CU18 lo guarda",
        "     como texto, y ese texto es un dato derivado del id.",
        "  3  Si algun dia el formato cambia, las reservas ya",
        "     guardadas en el kardex siguen con el numero viejo y las",
        "     nuevas salen con el nuevo. Y no hay forma de saber",
        "     cuales son de las otras sin recomputar el id.",
        "",
        "LO QUE ESTA BIEN, y es una decision buena: no duplicar un",
        "dato que se puede derivar. Un numero de reserva guardado es",
        "un numero de reserva que se puede desincronizar del id. Lo",
        "malo es que se deriva en cuatro sitios distintos en lugar",
        "de uno, y que hay un UPDATE, el de L1084, que parece que lo",
        "guarda y no lo guarda."
    ]],
    ["4. La lista dice cuantas LINEAS hay, no cuantas prendas", [
        "Un hallazgo de nombre, y sale de una linea.",
        "",
        "SRV_ReservasService L418-420:",
        "",
        "  SELECT r.id_reserva, ..,",
        "         COUNT(ri.id_reserva_item)::int AS total_prendas",
        "  FROM reservas r",
        "  LEFT JOIN reserva_items ri ON ri.id_reserva = r.id_reserva",
        "",
        "O sea que cuenta id_reserva_item, que es la clave de la tabla",
        "hija, una vez por fila. Eso es un COUNT de LINEAS de",
        "reserva_items, no una suma de prendas.",
        "",
        "Y LA COLUMNA SE LLAMA cantidad_prendas, api.ts L743, y la",
        "pantalla la pinta como 'N prenda' o 'N prendas', MisReservas",
        "L133, con su plural.",
        "",
        "DIFERENCIA: si una linea tuviera cantidad 3, la lista diria",
        "'1 prenda' y la prenda real son 3. Y el numero que aparece",
        "en la linea de tiempo y en el total estimado de L76 sale de",
        "un reduce con cantidad, o sea que ahi SI se cuenta bien. O",
        "sea que la lista y el detalle pueden NO COINCIDIR.",
        "",
        "POR QUE HOY NO SE NOTA, y hay que decirlo: CU21 mete una",
        "linea por prenda, L1086-L1090, con el id_ptc y la cantidad.",
        "O sea que el endpoint acepta una linea con cantidad 3, y el",
        "formulario que lo llenara no existe, que es el hallazgo 1 de",
        "CU21. Con el formulario de una sola prenda, linea = prenda",
        "y el COUNT acierta por casualidad.",
        "",
        "LO QUE FALTARIA, y hay algo en el proyecto que lo hace: en",
        "CU16, L327-330, la validacion de productos trae el",
        "detalle con una consulta y un ANY. Para esto seria",
        "SUM(ri.cantidad) y no COUNT, que es cambiar una palabra. Y",
        "OJO: con el LEFT JOIN, SUM sobre null da null y habria que",
        "usar COALESCE, que es justo el detalle que se pierde cuando",
        "se cambia un COUNT por un SUM sin mirar."
    ]],
    ["5. La pantalla enseña un total de dinero que no existe", [
        "Un hallazgo que no es del backend, y por eso no lo habia",
        "salido en ningun caso anterior.",
        "",
        "DetalleReserva.tsx L76, entero:",
        "",
        "  const totalEstimado = (datos?.items ?? []).reduce(",
        "    (acc, i) => acc + i.precio_base * i.cantidad, 0)",
        "",
        "Y ese total se pinta en la pagina. O sea que el cliente ve",
        "los cuatro datos de su reserva y ADEMAS un precio.",
        "",
        "EL PROBLEMA, y son dos cosas:",
        "",
        "  1  reserva_items tiene 4 COLUMNAS, schema.sql L358-363:",
        "     id_reserva_item, id_reserva, id_ptc y cantidad. No hay",
        "     ningun precio. La reserva no recuerda a cuanto iba a",
        "     costar cuando se hizo.",
        "",
        "  2  El precio que sale es productos.precio_base, del",
        "     SELECT de L888, y es el de catalogo de HOY. O sea que",
        "     el mismo numero, en la misma pantalla, puede cambiar",
        "     entre la primera vez que se mira y la segunda, sin que",
        "     nadie toque la reserva. Y una prenda que baja de precio",
        "     ayer, ensucia el total de una reserva hecha la semana",
        "     pasada.",
        "",
        "Y LA CONSECUENCIA DE NEGOCIO: si alguien lee ese total como",
        "el precio de la reserva, y la prenda sube de precio antes de",
        "que la persona llegue a la tienda, la reserva se cumple a un",
        "precio que nadie promised y que no estaba en ningun sitio. O al",
        "reves, la tienda tiene que respetar un precio que el cliente",
        "vio en la web y que en la base de datos no existe.",
        "",
        "LO QUE LO HACE MAS GRAVE: la palabra 'Estimado'. El propio",
        "codigo la usa. O sea que el autor sabia que era una",
        "estimacion, y la puso en la pantalla. Lo que no hay es",
        "ninguna nota de que el precio real se confirma en tienda,",
        "ni ningun sitio donde se confirme. La palabra esta en el",
        "calculo, no en la interfaz."
    ]],
    ["6. Tres pantallas, cinco consultas repetidas y un 403 en cada una", [
        "Un hallazgo de coste, y sale de contar.",
        "",
        "EL CASO COMPLETO, tres endpoints, hace estas consultas:",
        "",
        "  listarReservasMias   permisos(1) + cliente(1) + lista(1)",
        "                        = 3, y con el guard, 4",
        "",
        "  obtenerReservaDetalle permisos(1) + cliente(1) + cabecera(1)",
        "                        + items(1) = 4, y con el guard, 5",
        "",
        "  cancelarReserva      permisos(1) + cliente(1) + [SELECT",
        "                        FOR UPDATE(1) + items(1) + UPDATE(1)",
        "                        + N x 2] + bitacora(1 por repo)",
        "                        = 6 con una prenda, y con el guard 7",
        "",
        "Y LAS DOS PRIMERAS ESTAN EN LOS TRES ENDPOINTS DEL CASO.",
        "exigirPermiso y clienteDe son L414/L415, L446/L447 y",
        "L915/L916. Y en todo el fichero exigirPermiso se llama 4",
        "veces y clienteDe 4, y las dos ultimas son de CU21, L1006 y",
        "L1007.",
        "",
        "O SEA QUE ABRIR LAS DOS PANTALLAS DE ESTE CASO HACE 9",
        "CONSULTAS, de las cuales 4 son el mismo SELECT de permisos y",
        "3 son el mismo SELECT de cliente. Y el SELECT de permisos",
        "trae permisos_json de un jsonb, que es lo mas caro de leer",
        "una vez y lo mas descyente de releer en la misma sesion.",
        "",
        "Y HAY UNA MAS: la consulta de permisos, L184, hace",
        "",
        "  const [fila] = (await this.dataSource.query(`SELECT",
        "    r.permisos_json FROM usuarios JOIN usuarios_roles",
        "    JOIN roles ...",
        "",
        "y se queda con la PRIMERA fila. O sea que si un usuario",
        "tuviera DOS roles, sus permisos serian los del primero que",
        "devuelva la base, sin ningun ORDER BY que decida cual. Y el",
        "resultado no se cachea en ninguna parte: cada endpoint, cada",
        "peticion.",
        "",
        "LO QUE HABRA QUE HACER, y hay un patron en el proyecto: un",
        "guard de alcance, o un interceptor, que resolvia el",
        "usuario una vez por peticion y lo passed por el request. En",
        "este proyecto no hay, y por eso el mismo SELECT se paga en",
        "cada endpoint de los seis de reservas y de los demas",
        "modulos."
    ]],
    ["7. Lo que esta bien, y hay bastante", [
        "Este caso tiene seis cosas buenas, y hay que decirolas con",
        "el mismo detalle que las malas.",
        "",
        "1. LAS DOS PANTALLAS EXISTEN Y FUNCIONAN. A diferencia de",
        "   CU21, donde /reservas/nueva es un Navigate al catalogo, aqui",
        "   router.tsx L87-90 declara las dos rutas de verdad, con",
        "   MisReservas.tsx de 148 lineas y DetalleReserva.tsx de 324,",
        "   y las dos pintan datos, manejan cargando, manejan error y",
        "   manejan el 404 por separado, L33 y L91-93. Es el primer",
        "   caso de la serie en que la pantalla existe entera.",
        "",
        "2. LA CONSULTA DEL DETALLE NO TIENE N+1. itemDetalle, L885,",
        "   hace UN SELECT con 4 JOIN para todas las prendas de la",
        "   reserva, no uno por prenda. Y con el WHERE sobre",
        "   ri.id_reserva, que es un indice natural de la FK, y un",
        "   ORDER BY por la clave primaria de la hija, L895. Esto es",
        "   lo contrario del hallazgo 5 de CU21, donde validarPrendas",
        "   hacia un SELECT por prenda. El mismo proyecto, los dos",
        "   extremos.",
        "",
        "3. EL CANCELAR ES ATOMICO Y ESTA BLOQUEADO. L924 abre una",
        "   transaccion y L930 trae un FOR UPDATE sobre la reserva. O",
        "   sea que dos personas que cancelen la misma reserva a la",
        "   vez no pueden: la segunda espera, y cuando entra ya ve el",
        "   estado cambiado y recibe el 409 de L939.",
        "",
        "4. Y LOS CUATRO GUARDAS DE ESTADO, L939-949, que son una",
        "   lista blanca de verdad. El ultimo, L947, dice",
        "   estadoActual !== 'Solicitada' && estadoActual !== 'Preparada',",
        "   o sea que lo que NO esta en la lista no pasa. Y el primero",
        "   distingue los tres casos con tres mensajes distintos:",
        "   cancelada, atendida, y generico. Y el de atendida, L944,",
        "   dice QUE HACER: 'contacta a ...'.",
        "",
        "5. Y LA PANTALLA USA LA MISMA LISTA QUE EL BACKEND. L74 de",
        "   DetalleReserva: estado === 'Solicitada' || estado ===",
        "   'Preparada'. Son los mismos dos estados de L947. O sea que",
        "   el boton aparece exactamente cuando el servidor lo",
        "   permite. Y el 404, L461, filtra por id_cliente, o sea que",
        "   la reserva de otro no se distingue de la que no existe, y",
        "   el mensaje de L92 lo dice: 'no existe o no te pertenece'.",
        "",
        "6. Y LA BITACORA DE ESTE CASO ES LA MEJOR DEL MODULO. L994-995",
        "   trae oldData { estado: 'Solicitada' } y newData",
        "   { estado: 'Cancelada' }, o sea que el antes y el despues",
        "   de verdad. Las de CU21, L1131 y L1149, ponian null, y la",
        "   de prepararReserva L765-766 hace igual. Esta es la unica",
        "   transicion de las cinco que guarda el estado anterior."
    ]],
    ["8. Un detalle pequeno, y uno de los estados que no se pintan", [
        "Dos cosas pequenas, para cerrar.",
        "",
        "EL 404 EN LUGAR DEL 400. L918-920, en cancelar:",
        "",
        "  const id = Math.trunc(Number(idReserva));",
        "  if (!Number.isInteger(id) || id <= 0) {",
        "    throw new NotFoundException('Reserva no encontrada.');",
        "  }",
        "",
        "Y lo mismo en consultarDetalle, L449-451. O sea que una",
        "peticion con id=abc, que es un error de cliente, responde 404",
        "y dice 'Reserva no encontrada.' cuando el problema es que el",
        "numero no es un numero. Y en las dos rutas el id ya venia",
        "convertido por el controlador, asi que el error de verdad, el",
        "de la base, nunca llega aqui: la fila no se busca hasta",
        "L927, y ahi se pierde el motivo por el que fallo.",
        "",
        "LA LISTA DE ESTADOS ESTA TRES VECES, y la cuarta se la",
        "pierde. Los cinco estados reales son Solicitada, Preparada,",
        "En tienda, Cumplida y Cancelada. Y estan escritos en:",
        "",
        "  el que ESCRIBE   el servicio, 4 UPDATE y 1 INSERT",
        "                   L751 Preparada, L805 En tienda,",
        "                   L860 Cumplida, L965 Cancelada",
        "  el que DIBUJA    lib/reservas.ts L56-71, el switch de los 5",
        "  el que COMPRUEBA el servicio, L947 y L74 del cliente",
        "  el que RESTRINGE el esquema, NADA. L351 es VARCHAR(20)",
        "                   DEFAULT 'Solicitada', sin CHECK, sin ENUM",
        "",
        "Y LA PANTALLA PIERDE UN PASO. DetalleReserva L127 define los",
        "pasos de la linea de tiempo como Solicitada, Preparada y En",
        "tienda. O sea que CUATRO de los cinco estados tienen paso:",
        "Preparada y En tienda si, y Solicitada con fecha_creacion. Y",
        "Cumplida NO tiene paso, y no sale en ningun sitio de la",
        "pantalla del cliente. Cancelada sale como aviso, L255-260,",
        "no como paso. O sea que una reserva atendida y cumplida se ve",
        "en la linea de tiempo igual que una que esta pendiente: los",
        "tres pasos marcados y sin el ultimo.",
        "",
        "Y ESO NO ES UN ERROR DE LA PANTALLA, es de la maquina de",
        "estados. La tabla tiene tres campos de fecha, L353-355:",
        "fecha_creacion, fecha_preparada y fecha_atendida. O sea que",
        "el esquema PREVIO la fecha de cierre, y el paso no se",
        "escribio. Y el UPDATE que la pondria es el de L860, el de",
        "finalizarReserva, que solo hace SET estado = 'Cumplida'.",
        "O sea que tambien falta ahi."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU22."; } catch (e) { }
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
    // El UNICO loop del caso: L968, dentro de la transaccion que abre L924, al cancelar.
    fragmento(diag, "loop [por cada prenda: 1 movimiento y 1 UPDATE del reservado]", xS, xD, Y_MSG0 + 42 * PASO_MSG - 34, Y_MSG0 + 45 * PASO_MSG + 16);
    activacion(diag, xDe(indiceDe("C")), Y_MSG0 + 4 * PASO_MSG - 26, Y_MSG0 + 49 * PASO_MSG + 12);
    activacion(diag, xDe(indiceDe("S")), Y_MSG0 + 5 * PASO_MSG - 26, Y_MSG0 + 48 * PASO_MSG + 12);
    activacion(diag, xD, Y_MSG0 + 37 * PASO_MSG - 26, Y_MSG0 + 46 * PASO_MSG + 12);
}

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 940) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU22  Consultar y Cancelar el Estado de una Reserva   ·   en el código del proyecto este caso es CU29"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 940) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseño de caso de uso, sección 3.3.2.1.  10 líneas de vida, 53 mensajes, 8 hallazgos, 1 loop y NINGUN alt, y 3 barras de activación."; } catch (e) { }
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

function notasDelDiagrama(diag, r, h, ch) {
    var N = [];
    N.push("CU22  Consultar y Cancelar el Estado de una Reserva.  Diseño de caso de uso, sección 3.3.2.1.");
    N.push("");
    N.push("AVISO DE NUMERACIÓN, IGUAL QUE EN LOS CINCO ANTERIORES");
    N.push("");
    N.push("  Este caso es CU22 en el documento y CU29 en el código del proyecto, y el título");
    N.push("  COINCIDE EXACTO, que no es lo habitual:");
    N.push("");
    N.push("    web/src/lib/api.ts L734    // CU29 - Consultar y Cancelar el Estado de una Reserva");
    N.push("    web/src/lib/api.ts L1700   // CU29 - Consultar y Cancelar el Estado de una Reserva");
    N.push("");
    N.push("  Y OJO CON ESTO: bajo ese mismo título de CU29 hay TRES llamadas distintas.");
    N.push("");
    N.push("    L1701  listarReservasMias()      GET  /reservas/mias");
    N.push("    L1706  obtenerReservaDetalle()   GET  /reservas/{id}");
    N.push("    L1711  cancelarReserva()         PATCH /reservas/{id}/cancelar");
    N.push("");
    N.push("QUE HACE ESTE CASO, Y A DIFERENCIA DE CU21 LAS PANTALLAS EXISTEN");
    N.push("");
    N.push("  router.tsx L87-90, las dos rutas enteras:");
    N.push("");
    N.push("    <Route path=\"/reservas\" element={<ClienteLayout />}>");
    N.push("      <Route index element={<MisReservas />} />");
    N.push("      <Route path=\":id\" element={<DetalleReserva />} />");
    N.push("");
    N.push("  MisReservas.tsx, 148 líneas, y DetalleReserva.tsx, 324. Las dos pintan datos, manejan");
    N.push("  cargando, manejan error, y la segunda hasta distingue el 404 del error de conexión,");
    N.push("  L33 y L91-93. Es el primer caso de la serie con la pantalla entera.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 líneas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Cliente            «actor»     quien consulta y cancela");
    N.push("    MisReservas.tsx          «boundary»  148 líneas, la lista");
    N.push("    DetalleReserva.tsx       «boundary»  324 líneas, el cancelar");
    N.push("    lib/reservas.ts          «boundary»  84 líneas, el switch de los 5 estados");
    N.push("    api.ts                   «boundary»  sección CU29, L734 y L1700-1716");
    N.push("    JwtAuthGuard             «control»   dependencias.ts, L15-65");
    N.push("    CTR_Reservas             «control»   L64-102, los tres endpoints del caso");
    N.push("    SRV_ReservasService      «control»   L413-443, L445-489, L910-999");
    N.push("    SRV_BitacoraService      «control»   registrar(), solo al cancelar");
    N.push("    PostgreSQL               «entity»    reservas, 11 columnas sin numero");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes. 8 van a la base de datos, 13 son mensajes a sí mismo, 14 son");
    N.push("  retornos, 7 llevan la guarda escrita entre corchetes y 5 tocan al actor.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("EL HALLAZGO 1: EL CASO PIDE UN PERMISO QUE EL ROL CLIENTE NO TIENE");
    N.push("");
    N.push("  exigirPermiso, L195-200, y la llama en los TRES endpoints de este caso: L414, L446 y L915.");
    N.push("");
    N.push("    if (!(permisos.includes('*') || permisos.includes('gestionar_reservas')))");
    N.push("      throw new ForbiddenException('No tienes permisos para realizar reservas.');");
    N.push("");
    N.push("  Y EL ROL CLIENTE DEL SEED, schema.sql L577, entero:");
    N.push("");
    N.push("    ('Cliente', 'Compra y reserva en la plataforma',");
    N.push("     '[\"ver_catalogo\",\"comprar\",\"reservar\",\"usar_vestidor_ra\"]', 'Activo'),");
    N.push("");
    N.push("  gestionar_reservas NO ESTÁ. Y el permiso que el cliente SÍ tiene, que es 'reservar', no lo");
    N.push("  comprueba nadie: cero ocurrencias de permisos.includes('reservar') en los 24 módulos y las 40");
    N.push("  páginas. El permiso que describe lo que el cliente puede hacer está sembrado y muerto.");
    N.push("");
    N.push("  La ruta no tiene guard de permiso, router.tsx L87, o sea que la pantalla se pinta y luego");
    N.push("  falla. Y el menú tampoco lo salva: clienteMenu.ts L41 pide permiso: 'gestionar_reservas', así");
    N.push("  que /reservas tampoco le sale en el menú a un Cliente. Lo que sí funciona es para el");
    N.push("  Administrador, que tiene '*', y para el Encargado, que lo tiene en su lista de L575.");
    N.push("");
    N.push("  Y LA SEGUNDA CONSECUENCIA, que es la más rara: lib/roles.ts L14-18, la función que decide si");
    N.push("  alguien es cliente, usa un permiso de GESTIÓN:");
    N.push("");
    N.push("    return permisos.includes('gestionar_reservas') && !esPersonal(usuario);");
    N.push("");
    N.push("  Con el seed, esCliente() no devuelve true para NINGÚN rol: al Cliente le falta el permiso, y");
    N.push("  al Administrador y al Encargado los saca el && !esPersonal. Y Navbar.tsx L254 lo usa para");
    N.push("  pintar el bloque de cliente. La barra de navegación no le muestra nada a un Cliente.");
    N.push("");
    N.push("EL HALLAZGO 2: EL ÍNDICE ESTÁ EN LA COLUMNA QUE NADIE CONSULTA");
    N.push("");
    N.push("  El único índice de la tabla, schema.sql L565:");
    N.push("");
    N.push("    CREATE INDEX idx_reservas_cliente ON reservas (id_usuario);");
    N.push("");
    N.push("  Se llama idx_reservas_cliente, o sea que la intención era clara. Pero las tres consultas de");
    N.push("  este caso filtran por id_cliente, y no por id_usuario:");
    N.push("");
    N.push("    L424  WHERE r.id_cliente = $1");
    N.push("    L461  WHERE r.id_reserva = $1 AND r.id_cliente = $2");
    N.push("    L929  WHERE r.id_reserva = $1 AND r.id_cliente = $2");
    N.push("");
    N.push("  Y la columna no está de adorno: CU21 la rellena, L1073, el INSERT mete id_cliente Y");
    N.push("  id_usuario. Así que la lista de Mis Reservas hace un seq scan de la tabla entera en cada");
    N.push("  carga, y encima lleva GROUP BY de 6 columnas, L425, ORDER BY de dos, L426, y un LEFT JOIN");
    N.push("  con reserva_items para el COUNT, L423. El caso más consultado del módulo es el que no tiene");
    N.push("  índice. Y no hay ni un ALTER TABLE ni un CREATE INDEX en el TypeScript: se crea al");
    N.push("  desplegar y no se toca después.");
    N.push("");
    N.push("EL HALLAZGO 3: EL NÚMERO DE RESERVA NO EXISTE EN LA BASE DE DATOS");
    N.push("");
    N.push("  La tabla reservas, L344-355, tiene 11 columnas y numero no está entre ellas. Y en el");
    N.push("  TypeScript tampoco: cero SET numero y cero INSERT con numero en todo el proyecto. Entonces");
    N.push("  el número se recompone, numeroReserva L409-411:");
    N.push("");
    N.push("    return 'RES-' + String(idReserva).padStart(6, '0');");
    N.push("");
    N.push("  Y se llama CUATRO VECES en este caso: L434 el número de cada fila de la lista, L474 el de la");
    N.push("  cabecera, L975 la referencia del movimiento DENTRO de la transacción, y L991 el mensaje de la");
    N.push("  bitácora. CU21 lo construía en una variable, L1083, con la misma fórmula, y su UPDATE de");
    N.push("  L1084 no lo guardaba.");
    N.push("");
    N.push("  No duplicar un dato derivable es una decisión buena. Lo malo es que se deriva en cuatro");
    N.push("  sitios y que hay un UPDATE que parece que lo guarda y no lo guarda. Y que el número va");
    N.push("  dentro del contenido de un movimiento de inventario, L975, así que el kardex de CU18 lo");
    N.push("  guarda como texto y ese texto es un dato derivado del id.");
    N.push("");
    N.push("LO QUE ESTÁ BIEN, Y HAY BASTANTE");
    N.push("");
    N.push("  1. LAS DOS PANTALLAS EXISTEN Y FUNCIONAN, con rutas de verdad en router.tsx L87-90. Es el");
    N.push("     primer caso de la serie en que la pantalla existe entera.");
    N.push("");
    N.push("  2. LA CONSULTA DEL DETALLE NO TIENE N+1. itemDetalle, L885, hace UN SELECT con 4 JOIN");
    N.push("     para todas las prendas, no uno por prenda, con el WHERE sobre la FK y un ORDER BY por la");
    N.push("     clave de la hija, L895. Es lo contrario del hallazgo 5 de CU21, donde validarPrendas");
    N.push("     hacía un SELECT por prenda. El mismo proyecto, los dos extremos.");
    N.push("");
    N.push("  3. EL CANCELAR ES ATÓMICO Y ESTÁ BLOQUEADO. L924 abre transacción y L930 trae FOR UPDATE");
    N.push("     sobre la reserva. Dos personas que cancelen la misma reserva a la vez no pueden: la");
    N.push("     segunda espera y cuando entra recibe el 409 de L939.");
    N.push("");
    N.push("  4. Y LOS CUATRO GUARDAS DE ESTADO, L939-949, que son una lista blanca de verdad: el último,");
    N.push("     L947, dice estadoActual !== 'Solicitada' && estadoActual !== 'Preparada', o sea que lo");
    N.push("     que NO está en la lista no pasa. Y el primero distingue tres casos con tres mensajes");
    N.push("     distintos, y el de atendida, L944, dice QUÉ HACER: contacta a ...");
    N.push("");
    N.push("  5. Y LA PANTALLA USA LA MISMA LISTA QUE EL BACKEND: L74 de DetalleReserva es exactamente");
    N.push("     L947 del servicio. El botón aparece cuando el servidor lo permite. Y el 404, L461, filtra");
    N.push("     por id_cliente, así que la reserva de otro no se distingue de la que no existe, y el");
    N.push("     mensaje de L92 lo dice: 'no existe o no te pertenece'.");
    N.push("");
    N.push("  6. Y LA BITÁCORA DE ESTE CASO ES LA MEJOR DEL MÓDULO: L994-995 trae oldData");
    N.push("     { estado: 'Solicitada' } y newData { estado: 'Cancelada' }. Las de CU21, L1131 y L1149,");
    N.push("     ponían null. Es la única transición de las cinco que guarda el estado anterior.");
    N.push("");
    N.push("  Y UN AVISO DE ESTE CASO QUE ES DE CU20 Y CU21: la ruta de cancelar, L968-982, es la");
    N.push("  BIEN HECHA. Mueve la prenda con cantidad positiva, L973-975, y el trigger de schema.sql L648");
    N.push("  la suma una sola vez, porque el UPDATE de L978-981 NO toca cantidad_disponible. El hallazgo");
    N.push("  3 de CU20 solo aplica a finalizarReserva, que usa el helper liberarStockReserva y sí suma dos");
    N.push("  veces, por la L710.");
    N.push("");
    N.push("SOBRE LA COLOCACIÓN DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Anchura: las diez cabeceras separadas " + PASO + " px, con " + ANCHO_CAB + " de ancho. Quedan");
    N.push("  65 px entre una y otra. Altura: " + PASO_MSG + " px por mensaje. El mensaje 1 cae en la y " + Y_MSG0);
    N.push("  y el " + TOTAL_MSG + " en la y " + (Y_MSG0 + (TOTAL_MSG - 1) * PASO_MSG) + ".");
    N.push("");
    N.push("  Un detalle que hizo fallar estos diagramas trece veces y que conviene no olvidar: EA");
    N.push("  guarda Top y Bottom en NEGATIVO, porque trabaja en coordenadas cartesianas con la Y");
    N.push("  creciendo hacia arriba. Si se le pasa la Y en positivo no da error, simplemente no coloca");
    N.push("  nada y todos los objetos se quedan en el mismo punto. En las dos funciones de colocación de");
    N.push("  este script está escrito o.Top = 0 - y y o.Bottom = 0 - y - alto. En el AddNew, en cambio,");
    N.push("  la Y va en positiva, porque ahí EA ya la convierte.");
    N.push("");
    N.push("  Comprobación de esta ejecución, leída del modelo de objetos:");
    N.push("    objetos en el diagrama: " + ch.leidos);
    N.push("    con la Y crecida, o sea colocados: " + ch.bien);
    N.push("    mensajes dibujados: " + r.puestos + " de " + TOTAL_MSG);
    N.push("    mensajes a sí mismo: " + r.autodestino);
    N.push("    conectores en el diagrama: " + r.enDiagrama);
    N.push("    MARCOS de fragmento colocados: " + MARCOS_PUESTOS + " de 1");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU22 Secuencia", 0); } catch (e) { }
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
    T.push("CU22 - DIAGRAMA DE SECUENCIA - INFORME");
    T.push("");
    T.push("Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB);
    T.push("Tipo de diagrama: " + tipoUsado);
    T.push("Mensajes: " + r.puestos + " de " + TOTAL_MSG);
    T.push("Mensajes a sí mismo: " + r.autodestino);
    T.push("Conectores en el diagrama: " + r.enDiagrama);
    T.push("Hallazgos: " + h2.total + " de " + TOTAL_HAL + ", banda hasta la y " + h2.fin);
    T.push("");
    T.push("AVISO DE NUMERACIÓN");
    T.push("Este caso es CU22 en el documento y CU29 en el código, y el título");
    T.push("COINCIDE EXACTO. Bajo ese título hay TRES llamadas distintas:");
    T.push("  L1701  listarReservasMias()      GET   /reservas/mias");
    T.push("  L1706  obtenerReservaDetalle()   GET   /reservas/{id}");
    T.push("  L1711  cancelarReserva()         PATCH /reservas/{id}/cancelar");
    T.push("Y a diferencia de CU21, las dos pantallas SÍ existen:");
    T.push("MisReservas.tsx 148 líneas, DetalleReserva.tsx 324, rutas en router.tsx L87-90.");
    T.push("");
    T.push("MARCOS Y BARRAS  <-- MIRA ESTO");
    T.push("Este caso tiene 1 loop y NINGUN alt. Contado antes de dibujar con");
    T.push("contadores sobre las 1215 líneas de SRV_ReservasService:");
    T.push("  for 5   while 0   Promise.all 0   continue 2   reduce 1");
    T.push("  if 60   throw 45   ternarios 80   map 11");
    T.push("  dataSource.query 22   em.query 20   transaction 5");
    T.push("De los 5 for, solo 1 es de este caso: L968, el de cancelar. Los otros");
    T.push("4 son L524, L698, L1086 y L1173, de otros casos de uso.");
    T.push("Y LAS DOS CONSULTAS DE LECTURA NO TIENEN NINGÚN BUCLE: consultarMias,");
    T.push("consultarDetalle e itemDetalle son un SELECT y un map, y un map no");
    T.push("cuenta como bucle de control.");
    T.push("Fragmentos colocados: " + MARCOS_PUESTOS + " de 1");
    T.push("Barras de activación colocadas: " + BARRAS_PUESTAS + " de 3");
    if (MARCOS_PUESTOS < 1 || BARRAS_PUESTAS < 3) {
        T.push("  Si alguno sale a 0, EA no ha aceptado la forma y hay que");
        T.push("  dibujarlo a mano en el diagrama.");
    } else {
        T.push("  Los 4 han salido. Son FORMAS dibujadas por script, no");
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
    msg = msg + "CU22 - Consultar y Cancelar el Estado de una Reserva" + SALTO;
    msg = msg + "Diagrama de secuencia, sección 3.3.2.1." + SALTO;
    msg = msg + "En el código del proyecto este caso es CU29, y el título" + SALTO;
    msg = msg + "COINCIDE EXACTO." + SALTO + SALTO;
    msg = msg + "10 líneas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "1 loop (L968, el de cancelar) y NINGUN alt." + SALTO;
    msg = msg + "Las dos consultas de lectura no tienen bucle." + SALTO;
    msg = msg + "FRAGMENTOS colocados: " + MARCOS_PUESTOS + " de 1." + SALTO;
    msg = msg + "BARRAS colocadas: " + BARRAS_PUESTAS + " de 3." + SALTO;
    if (MARCOS_PUESTOS < 1 || BARRAS_PUESTAS < 3) msg = msg + "  Si falta alguno, hay que dibujarlo a mano." + SALTO;
    msg = msg + SALTO;
    msg = msg + "A DIFERENCIA DE CU21, LAS DOS PANTALLAS EXISTEN:" + SALTO;
    msg = msg + "MisReservas 148 líneas, DetalleReserva 324, rutas" + SALTO;
    msg = msg + "de verdad en router.tsx L87-90." + SALTO + SALTO;
    msg = msg + "PERO HAY DOS HALLAZGOS GRAVES:" + SALTO;
    msg = msg + "1. El caso pide gestionar_reservas, L197, y el rol" + SALTO;
    msg = msg + "   Cliente del seed, L577, tiene ver_catalogo, comprar," + SALTO;
    msg = msg + "   reservar y usar_vestidor_ra. O sea que los tres" + SALTO;
    msg = msg + "   endpoints devuelven 403 al que debe usarlos, y el" + SALTO;
    msg = msg + "   permiso 'reservar' no lo comprueba nadie." + SALTO;
    msg = msg + "2. El único índice de reservas, L565, está sobre" + SALTO;
    msg = msg + "   id_usuario, y las tres consultas filtran por" + SALTO;
    msg = msg + "   id_cliente. La lista hace seq scan cada carga." + SALTO + SALTO;
    msg = msg + "Y el número de reserva no existe en la base de datos:" + SALTO;
    msg = msg + "la tabla tiene 11 columnas y numero no está entre ellas." + SALTO;
    msg = msg + "Se recompone en cada respuesta, cuatro veces aquí." + SALTO + SALTO;
    msg = msg + "Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACIÓN: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU22 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU22 Secuencia", 0); } catch (e3) { }
}
