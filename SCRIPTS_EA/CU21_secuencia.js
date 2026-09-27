// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU21  Realizar Reserva de Múltiples Prendas
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/router.tsx                         L56, la ruta que redirige
//     web/src/data/clienteMenu.ts                20 items, ninguno de crear
//     web/src/pages/Producto.tsx                831 lineas
//     web/src/lib/api.ts                         L673, seccion CU28
//     api/src/main.ts                            L22-43 ValidationPipe
//     api/src/modulos/seguridad/dependencias.ts  L15-65 JwtAuthGuard
//     api/src/modulos/reservas/CTR_Reservas.ts   L26-48, L134-149
//     api/src/modulos/reservas/SRV_ReservasService.ts  1215 lineas
//     api/src/modulos/seguridad/SRV_EmailService.ts    L76
//     api/src/modulos/seguridad/SRV_BitacoraService.ts L14-39
//     BASE DE DATOS/schema.sql                   L342-365, L728-769
//
// QUE HACE ESTE CASO
//   Crea una reserva con N prendas, para una fecha y una hora, en una
//   sucursal. Y es el MEJOR ESCRITO DEL PROYECTO, por dos cosas que
//   estan bien GRACIAS A COMBINARLAS, y no por ser las unicas:
//
//     1  Una transaccion de verdad, L1070, con las 5 escrituras dentro
//     2  Un SELECT con FOR UPDATE, L1098, DENTRO del bucle
//
//   Y las dos cosas las sabe hacer el proyecto: hay 5 transacciones
//   en este fichero y 2 en Pagos, y las 7 llevan FOR UPDATE. Lo que
//   este caso hace bien es el ORDEN, que se compruebe DESPUES de
//   bloquear y nunca antes.
//
//   Y hay un problema de interfaz que es lo primero que hay que decir.
//
// EL CASO SE LLAMA "DE MÚLTIPLES PRENDAS" Y LA PANTALLA NO EXISTE
//   router.tsx L56, la ruta entera:
//
//     <Route path="/reservas/nueva" element={<Navigate to="/catalogo" replace />} />
//
//   O sea que /reservas/nueva no lleva a ninguna parte: redirige al
//   catalogo. Y el menu del cliente, clienteMenu.ts, no tiene ninguna
//   entrada para crear una reserva: solo /reservas (CU29, Mis Reservas),
//   /reservas/pruebas-ra (CU32), /recomendaciones (CU41) y /compras (CU38).
//
//   O sea que la reserva se hace prenda a prenda, desde la ficha del
//   producto. Y sin embargo el backend acepta N prendas:
//
//     CTR_Reservas L44   @IsArray({ message: 'Debes seleccionar al menos una prenda.' })
//     L45                @ValidateNested({ each: true })
//     L46                @Type(() => ItemReservaRequest)
//     L47                items!: ItemReservaRequest[];
//
//   Y el servicio mete un bucle sobre items, dos veces. O sea que la
//   capacidad de varias prendas esta escrita, validada y probada en el
//   backend, y es inalcanzable desde la interfaz.
//
//   43 mensajes. 10 lineas de vida. 8 hallazgos. 12 van a la base de datos, 18 son
//   mensajes a si mismo, 9 son retornos, 5 llevan guarda y 3 tocan al actor.
//   2 fragmentos: dos loop y ningun alt. Explicado mas abajo.
//
// LOS FRAGMENTOS: DOS loop Y NINGUN alt
//   Contado antes de escribir, con contadores, sobre las 1215 lineas de
//   SRV_ReservasService:
//
//     for 5   while 0   Promise.all 0
//     if 60   throw 45   ternarios 80   map 11   reduce 1   continue 2
//     dataSource.query 22   em.query 20   transaction 5
//     bitacoraService.registrar 6   enviarAvisoReserva 1
//
//   Y DE LOS 5 FOR, SOLO 2 SON DE ESTE CASO:
//
//     L1173  validarPrendas, un bucle por prenda, con un SELECT por prenda
//     L1086  el bucle de la transaccion, un bucle por prenda, con 4
//            escrituras por prenda
//
//   Los otros tres son de otros casos: liberarStockReserva L698, que es
//   de cerrar y anular, y dos mas de confirmar y finalizar. Y se cuentan
//   aparte, porque son otros casos de uso.
//
//   NO HAY NINGUN alt, y hay que decirlo en vez de inventar uno. De los
//   60 if del fichero, en el camino de este caso hay cinco y los cinco
//   son guardas: la fecha, la hora, la cantidad, la prenda que no existe,
//   la prenda que no esta disponible, y el stock. Ninguno tiene dos
//   caminos de verdad.
//
//   Y las 3 barras de activacion, que no son un extra: la del
//   controlador, la del servicio, y la de la transaccion, que existe
//   solo entre L1070 y L1122.
//
// LA Y EN NEGATIVO, QUE ES LO QUE HACE FALLAR ESTOS DIAGRAMAS
//   EA guarda Top y Bottom en NEGATIVO, porque trabaja en coordenadas
//   cartesianas con la Y creciendo hacia arriba. Si se le pasa la Y en
//   positivo no da error: simplemente no coloca nada, y todos los objetos
//   se quedan en el mismo punto. El diagrama sale amontonado.
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
var TOTAL_MSG = 43;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU21 Secuencia Reserva Multiples Prendas";
var DIAG_NOMBRE = "CU21 Reserva Multiples Prendas";
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
    ["U", "ACTOR_Cliente", "Actor", "Lifeline", "Cliente", "quien reserva", "Actor, no clase: es quien pulsa", "no es codigo, es la persona"],
    ["P", "Producto.tsx", "Object", "Lifeline", "Producto", "831 lineas, la ficha", "Boundary", "web/src/pages/Producto.tsx, 831 lineas, y es desde donde se reserva"],
    ["H", "api.ts", "Object", "Lifeline", "api", "seccion CU28", "Boundary", "web/src/lib/api.ts, L673, seccion CU28 de reservas"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["V", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "anidado sobre items", "Control", "api/src/main.ts, L22-43, con ValidateNested({ each: true })"],
    ["C", "CTR_Reservas", "Object", "Lifeline", "ReservasController", "L134-149, POST /", "Control", "api/src/modulos/reservas/CTR_Reservas.ts, 150 lineas"],
    ["S", "SRV_ReservasService", "Object", "Lifeline", "ReservasService", "1215 lineas, 5 tx", "Control", "api/src/modulos/reservas/SRV_ReservasService.ts, L1001-1166"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar(), 2 veces", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["E", "SRV_EmailService", "Object", "Lifeline", "EmailService", "enviarAvisoReserva", "Control", "api/src/modulos/seguridad/SRV_EmailService.ts, L76"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "5 tablas y 1 sp muerto", "Entity", "schema.sql: reservas, reserva_items, inventario_stock, movimientos_inventario, usuarios_empleados; sp_registrar_reserva L728-769 sin usar"]
];

var MSG = [
    [1, "U", "P", "1. quiere reservar varias prendas.   Y aqui empieza el problema del caso: en router.tsx L56, /reservas/nueva es un Navigate al catalogo   O sea que no hay formulario de varias prendas, y el menu del cliente tampoco lo tiene", "S"],
    [2, "P", "P", "2. o sea que abre la ficha de UNA prenda, Producto.tsx, 831 lineas, y reserva desde ahi   Una prenda por ficha, y por tanto una prenda por POST   Y el endpoint acepta items, que es un array   La capacidad de varias prendas existe y es inalcanzable", "S"],
    [3, "P", "H", "3. POST /api/v1/reservas con { id_sucursal, fecha_reserva, hora_reserva, items: [ { id_ptc, cantidad } ] }   api.ts L673, seccion CU28", "S"],
    [4, "H", "G", "4. con Authorization Bearer y credentials:'include'   El POST va a la raiz del controlador, que es @Controller('reservas') en L50, no a /reservas/nueva", "S"],
    [5, "G", "D", "5. SELECT usuarios WHERE id_usuario = :sub   L44.   Una consulta por peticion, en el guard", "S"],
    [6, "G", "G", "6. [estado != 'activo'] 401 'Tu cuenta esta deshabilitada.'   L49-51", "S"],
    [7, "G", "V", "7. el guard no toca el cuerpo.   El pipe ve un array de objetos, y aqui SI hay DTO, a diferencia de CU18 y CU20", "S"],
    [8, "V", "C", "8. CrearReservaRequest, L34-48, con @IsDateString, @IsString para la hora, e items con @IsArray, @ValidateNested({ each: true }) y @Type(() => ItemReservaRequest), L44-47   Y ItemReservaRequest, L26-33, con id_ptc y cantidad", "S"],
    [9, "C", "S", "9. crearReserva( currentUser, dto, request )   L148.   El controlador mapea el array linea a linea, L146, copiando id_ptc y cantidad, y no copia nada mas", "S"],
    [10, "S", "S", "10. y aqui empieza la validacion de las dos cosas que el caso promete.   La fecha, y la hora contra el horario de la sucursal: L1060-1064 lanza 422 con el horario en el mensaje, '(apertura - cierre)'   O sea que el horario se lee de la base y se compara con la hora pedida", "S"],
    [11, "S", "S", "11. validarPrendas( dto.items ), L1066, y aqui empieza el PRIMER LOOP del caso, L1173.   Un bucle por prenda, con un SELECT por prenda dentro, L1180-1190, y 4 JOIN para traer el nombre, la talla y el color que luego salen en el correo", "S"],
    [12, "S", "D", "12. y por cada prenda, L1182-1189: SELECT ptc.id_ptc, p.estado, ptc.estado_stock, nombre, talla, color FROM producto_talla_color con JOIN a productos, tallas y colores   O sea N consultas para N prendas   Y esto esta FUERA de la transaccion, que aun no ha abierto", "S"],
    [13, "S", "S", "13. vuelta a vuelta: [cantidad no entera o <= 0] 422, [prenda no encontrada] 422, y [producto inactivo o estado_stock != 'disponible'] 409 'La prenda X no está disponible actualmente.'   L1176-1202   O sea que hay una lista blanca de estados, y el mensaje nombra la prenda", "S"],
    [14, "S", "S", "14. fin del primer loop, y vuelve el detalle con una prenda por linea, ya con nombre, talla y color, L1204-1210   Ese detalle es el que despues sale en el correo, L1160, prenda por prenda", "A"],
    [15, "S", "S", "15. y aqui empieza lo bueno: dataSource.transaction( async (em) => { ... } ), L1070   O sea que las 5 escrituras de este caso SI estan en una transaccion.   Y son CINCO transacciones en este fichero, L726, L780, L836, L924 y L1070, mas dos en SRV_PagosService, L276 y L647   O sea que la transaccion no es un invento de este caso: es el patron del proyecto, y este caso es el que mejor lo aprovecha", "S"],
    [16, "S", "D", "16. em.query: INSERT INTO reservas ( id_cliente, id_usuario, id_sucursal, fecha_reserva, hora_reserva, estado ) VALUES ( .., 'Solicitada', NOW() ) RETURNING id_reserva   L1073-1076   Escritura 1 de 5.   OJO que mete id_cliente, que es la columna que le falta a la funcion del esquema", "S"],
    [17, "S", "S", "17. numero = 'RES-' + el id con padStart(6,'0'), L1083.   Y otra escritura solo para el numero, L1084, que es el mismo patron de dos pasos de CU16: no se puede saber el SERIAL antes del INSERT", "S"],
    [18, "S", "D", "18. em.query: UPDATE reservas SET estado = 'Solicitada' WHERE id_reserva = $1   L1084   Escritura 2 de 5.   Y es RARA: el INSERT de L1074 ya puso 'Solicitada' en el VALUES   O sea que esta escritura no cambia nada, y ademas no tiene fecha_recepcion ni otro campo", "S"],
    [19, "S", "M", "19. y aqui empieza el SEGUNDO LOOP del caso, L1086, y es el que hace el trabajo de verdad: for ( const linea of detalle )   Un bucle por prenda, con CUATRO escrituras por prenda, y el mas importante de todo el proyecto: un SELECT con FOR UPDATE", "S"],
    [20, "M", "D", "20. vuelta 1: INSERT INTO reserva_items ( id_reserva, id_ptc, cantidad ) VALUES ( $1, $2, $3 )   L1088-1090   Escritura 3 de 5, y se repite por prenda   Consulta 1 de 2 de la transaccion", "S"],
    [21, "M", "D", "21. vuelta 2, y aqui esta el SELECT que hace que el caso aguante: SELECT cantidad_disponible, cantidad_reservada FROM inventario_stock WHERE id_ptc = $1 AND id_sucursal = $2 FOR UPDATE   L1094-1098   El FOR UPDATE bloquea la fila hasta el final de la transaccion, y por eso dos reservas simultaneas de la MISMA prenda no se pueden pasar el stock   Y NO es un invento de este caso: hay 8 SELECT con FOR UPDATE en el proyecto, 5 en este fichero y 4 en SRV_PagosService   Lo que si es de este caso es el ORDEN", "S"],
    [22, "M", "S", "22. vuelta 3: [disponible < linea.cantidad] 409 'Stock insuficiente de la prenda X (talla, color).'   L1103-1106   Y OJO: compara contra cantidad_disponible SOLO, sin restar cantidad_reservada   Que es correcto, porque el trigger de CU20 ya descuenta la reserva de disponible", "S"],
    [23, "M", "D", "23. vuelta 4: INSERT INTO movimientos_inventario ( id_ptc, id_sucursal, tipo_movimiento, cantidad, referencia, id_usuario, id_reserva ) VALUES ( $1, $2, 'SALIDA-RESERVA', $3, $4, $5, $6 ) con -linea.cantidad   L1110-1112   Escritura 4 de 5.   Y el trigger la descuenta de disponible, que es lo que hace que la vuelta 2 del turno siguiente vea el stock ya actualizado", "S"],
    [24, "M", "D", "24. vuelta 5: UPDATE inventario_stock SET cantidad_reservada = cantidad_reservada + $3 WHERE id_ptc = $1 AND id_sucursal = $2   L1116-1119   Escritura 5 de 5.   O sea que cantidad_reservada es un CONTADOR al lado del disponible, y nadie lo lee para decidir: CU20 solo lo pinta", "S"],
    [25, "M", "S", "25. y vuelta a vuelta, cuatro escrituras por prenda, con el FOR UPDATE en la segunda.   Con 6 prendas son 24 escrituras y 6 bloqueos de fila, todo dentro de la misma transaccion   Consulta 2 de 2 de la transaccion, y con esto se acaban las del caso", "A"],
    [26, "S", "S", "26. fin de la transaccion: COMMIT, L1122.   Si una sola prenda no tiene stock, L1104, se deshace TODO: la cabecera, los items anteriores y los movimientos.   Y eso es justo lo que CU19 no hacia, con su bucle de 20 productos sin transaccion", "A"],
    [27, "S", "B", "27. bitacoraService.registrar( usuario, 'INSERT', 'reservas', 'Reserva creada: RES-000123 (N prenda(s), sucursal X)', request, idReserva, null, { id_cliente, id_sucursal, fecha_reserva, hora_reserva, estado, items } )   L1124-1140   Y el newData lleva el array de items con nombre, talla, color y cantidad, L1138   O sea que la bitacora SI sabe cuantas prendas son y cuales", "S"],
    [28, "B", "D", "28. y se escribe por el repositorio de TypeORM, SRV_BitacoraService L27-38, repo.create y repo.save   NO es un INSERT por dataSource.query, y por eso no puede entrar en la transaccion de L1070 aunque se quisiera.   O sea que la 6 de las 6 escrituras del caso: 5 atomicas y 1 que no", "A"],
    [29, "S", "B", "29. y aqui hay un detalle: una SEGUNDA fila de bitacora, L1142-1151, con la accion 'NOTIFICAR' en vez de 'INSERT'   O sea que una sola creacion de reserva deja DOS filas en la bitacora, y CU08, que es donde se leen, no distingue una de otra", "S"],
    [30, "S", "E", "30. y aqui esta lo que hace que este caso sea el unico que avisa a alguien: notificarSucursal( .., dto.id_sucursal ), L1153-1163, que primero busca los correos con emailsSucursal, L240-244, un SELECT sobre usuarios_empleados con JOIN a usuarios, el filtro de fecha_baja IS NULL y el de estado activo", "S"],
    [31, "E", "E", "31. y monta un CUERPO de texto con la sucursal, el numero, la fecha, la hora y la lista de prendas con su talla, color y cantidad, L256-260   Y lo manda con enviarAvisoReserva( para, 'Tiendas Montaño - Nueva reserva X', cuerpo ), L261.   Devuelve un boolean, y no se mira", "S"],
    [32, "S", "S", "32. y aqui esta el hallazgo 2: si no hay ningun empleado activo con correo en esa sucursal, L252-255, lo unico que pasa es un logger.warn con el texto '[CU30] Sin correos de empleados activos en la sucursal N'.   O sea que la reserva se crea igual y nadie se entera, y solo queda una linea en el log del servidor", "S"],
    [33, "S", "C", "33. { detail: 'Reserva RES-000123 creada.', id_reserva, numero, estado: 'Solicitada' }   L1165   Y el estado 'Solicitada' esta en el INSERT de L1074, en el UPDATE de L1084 y en el return.   Tres veces el mismo literal en 90 lineas", "A"],
    [34, "C", "H", "34. 201 Created con el JSON   Y el numero de reserva vuelve en la respuesta, L1165, que es el detalle del correo y el de la pantalla", "A"],
    [35, "H", "P", "35. la respuesta   api.ts L673", "A"],
    [36, "P", "U", "36. el cliente ve su reserva en Mis Reservas, que es CU29, y el aviso le llega al correo de la sucursal, no al suyo   O sea que el cliente no recibe nada: quien recibe el aviso es el empleado de la tienda, y con el L259-260 tells him when it is and how many pieces", "A"],
    [37, "P", "P", "37. y si vuelve a abrir /reservas/nueva, L56, el router lo manda al catalogo otra vez.   O sea que el caso se llama de multiples prendas y la pantalla solo admite una", "S"],
    [38, "D", "D", "38. y en el esquema hay un sp_registrar_reserva, L728-769, que es ESTE CASO ENTERO escrito en SQL: el INSERT de la cabecera, el FOR sobre jsonb_array_elements, el SELECT con FOR UPDATE, el INSERT de los items, el UPDATE del reservado y el INSERT del movimiento   L746-767", "S"],
    [39, "D", "D", "39. y no lo usa nadie, como los otros tres sp_ del esquema.   Y ademas se diferencia del codigo en tres cosas: no mete id_cliente, L742; escribe el tipo como 'Reserva' y no 'SALIDA-RESERVA', L766 contra L1111; y comprueba disponible MENOS reservada, L751, contra disponible a secas, L1102", "S"],
    [40, "D", "D", "40. y el FOR UPDATE de L752 esta en la funcion que nadie llama, y el L1098, que si se usa, esta en una transaccion de verdad   O sea que el proyecto sabe bloquear una fila, y lo sabe hacer bien, y en el unico sitio donde lo escribio dos veces, una corre y la otra no", "S"],
    [41, "S", "S", "41. y el hallazgo 3, que viene de CU20: la contracara de todo esto es liberarStockReserva, L682-716.   Y hay que corregir lo que decia CU20: NO es un helper compartido, se llama UNA vez, L861, desde finalizarReserva   Y su L709-L710 vuelve a sumar la cantidad a cantidad_disponible DESPUES de que el trigger ya la sumo por el movimiento de L703   O sea que el stock se cuenta dos veces al FINALIZAR", "S"],
    [42, "S", "S", "42. y por eso el for de L698, el del helper, no es de este caso pero es su contraparte exacta.   Y el de L968, que es el MISMO bloque copiado a mano dentro de cancelar, devuelve el stock una vez, y no dos   O sea que el bloque esta duplicado, y las dos copias no hacen lo mismo", "S"],
    [43, "U", "U", "43. este es el mejor caso de escritura del proyecto, y el que mas se acerca a lo que un buen diseño hace: transaccion de verdad, bloqueo de fila, una validacion de lista blanca por prenda, dos bucles, un correo que sale, y una bitacora con el detalle.   Y tiene la pantalla de multiples prendas borrada, una funcion que lo reimplementa y nadie usa, y un helper que cuenta el stock dos veces   A", "A"]
];

var HAL = [
    ["1. El caso se llama de multiples prendas y la pantalla no existe", [
        "El hallazgo de interfaz, y es lo primero que se encuentra al",
        "seguir el rastro del caso desde el cliente.",
        "",
        "LA RUTA, router.tsx L56, entera:",
        "",
        "  <Route path=\"/reservas/nueva\"",
        "    element={<Navigate to=\"/catalogo\" replace />} />",
        "",
        "O sea que la ruta que da nombre al caso no lleva a ninguna parte:",
        "redirige al catalogo con replace, que ademas quita la entrada del",
        "historial del navegador. Y no es la unica: L51 hace lo mismo con",
        "/productos.",
        "",
        "Y EL MENU DEL CLIENTE, clienteMenu.ts, 20 lineas de datos y 4",
        "entradas, y ninguna de ellas es crear una reserva:",
        "",
        "  L24  /recomendaciones   Recomendaciones para ti   CU41",
        "  L38  /reservas          Mis Reservas             CU29",
        "  L46  /reservas/pruebas-ra  Vestidor Virtual     CU32",
        "  L59  /compras           Mis Compras              CU38",
        "",
        "O sea que CU28, que es este caso, NO ESTA EN EL MENU. El",
        "administrador tiene cuatro entradas de inventario y el cliente",
        "cuatro de cuenta, y ninguna de las ocho es esta.",
        "",
        "PERO EL BACKEND SI ACEPTA N PRENDAS. Y no es que lo acepte sin",
        "querer: lo valida prenda por prenda. CTR_Reservas L44-47:",
        "",
        "  @IsArray({ message: 'Debes seleccionar al menos una prenda.' })",
        "  @ValidateNested({ each: true })",
        "  @Type(() => ItemReservaRequest)",
        "  items!: ItemReservaRequest[];",
        "",
        "Y el servicio mete dos bucles sobre items, L1173 y L1086, con",
        "cuatro escrituras por prenda en el segundo. O sea que la capacidad",
        "de varias prendas esta escrita, validada y con su logica de stock",
        "por prenda. Lo que no existe es el formulario que la LLene.",
        "",
        "ASI QUE LO QUE HAY HECHO ES LA PARTE DIFICIL: el endpoint, el",
        "DTO, la validacion anidada, los dos bucles y el FOR UPDATE por",
        "prenda. Y LO QUE FALTA ES UNA PANTALLA, que es la parte facil."
    ]],
    ["2. Sin correos de empleados, la reserva se crea y nadie se entera", [
        "El hallazgo de notificacion, y es el mas raro de todos porque",
        "el camino existe entero y llega hasta el final.",
        "",
        "notificarSucursal, L249-265, es un camino de 17 lineas que hace",
        "las cuatro cosas:",
        "",
        "  L251  emailsSucursal( idSucursal )",
        "  L252  if (emails.length === 0) {",
        "  L253    this.logger.warn(`[CU30] Sin correos de empleados",
        "         activos en la sucursal ${idSucursal}.`);",
        "  L254    return;",
        "  L255  }",
        "  L256-260  monta el cuerpo del correo, con sucursal, numero,",
        "         fecha, hora y la lista de prendas con talla y color",
        "  L261  this.emailService.enviarAvisoReserva( emails.join(', '),",
        "         `Tiendas Montaño - Nueva reserva ${..}`, cuerpo )",
        "",
        "Y LA CONSULTA DE LOS CORREOS, L240-244, esta bien hecha:",
        "",
        "  SELECT u.email",
        "  FROM usuarios_empleados ue",
        "  JOIN usuarios u ON u.id_usuario = ue.usuario_id",
        "  WHERE ue.sucursal_id = $1",
        "    AND ue.fecha_baja IS NULL",
        "    AND LOWER(u.estado) = 'activo'",
        "",
        "O sea que solo avisa a los empleados activos de ESA sucursal, y con",
        "el LOWER que hace el contraste insensible a mayusculas. Es el",
        "mismo cuidado que en el resto del proyecto.",
        "",
        "EL PROBLEMA, y son dos cosas:",
        "",
        "  1  Si no hay correos, la reserva ya esta creada y se devuelve",
        "     con exito. Lo unico que queda es una linea en el log del",
        "     servidor. Y ese log es lo unico que le dice a alguien que la",
        "     tienda no se ha enterado. O sea que el fallo es invisible",
        "     para la persona que la pidio y para la que la deberia",
        "     atender.",
        "",
        "  2  El boolean que devuelve enviarAvisoReserva, L261, NO SE MIRA.",
        "     Ese metodo devuelve boolean, o sea que sabe si el envio",
        "     funciono, y el resultado se tira. Y hay un segundo",
        "     descuido al lado: todo el notificarSucursal esta dentro de",
        "     un try/catch, L250-264, que se traga el error con un",
        "     logger.error. O sea que ni una excepcion ni un false llegan",
        "     a la reserva.",
        "",
        "LO QUE SE PIDIÓ, y hay que decirlo: el aviso va a la SUCURSAL,",
        "no al cliente. El cliente que reserva no recibe nada. Y eso es",
        "una decision, y probablemente correcta, porque la tienda es la",
        "que tiene que preparar las prendas. Pero significa que el",
        "cliente tiene que entrar en Mis Reservas, que es CU29, para",
        "saber que su reserva existe."
    ]],
    ["3. El bloque que devuelve el stock esta duplicado, y una de las dos copias lo cuenta dos veces", [
        "Este es el hallazgo de CU20, corregido con lo que se ve al leer las tres",
        "rutas enteras. Y la correccion es importante: CU20 lo conto como un",
        "helper COMPARTIDO por cerrar, anular y finalizar. NO lo es.",
        "",
        "PRIMER DATO: el fichero tiene cinco metodos publicos que hacen",
        "transaccion, y solo dos devuelven las prendas al stock:",
        "",
        "  L682  private liberarStockReserva( em, idReserva, idSucursal, ... )",
        "  L718  async prepararReserva( ... )          tx en L726",
        "  L772  async confirmarRecepcion( ... )      tx en L780",
        "  L826  async finalizarReserva( ... )        tx en L836   <-- USA EL HELPER, L861",
        "  L910  async cancelar( ... )                tx en L924   <-- SQL PROPIO, L972-982",
        "  L1001 async crearReserva( ... )            tx en L1070  <-- ESTE CASO",
        "",
        "Y ADEMAS NO EXISTE NINGUN METODO QUE SE LLAME CERRAR. CU20 asi lo",
        "llamo, y no era cierto: L702-713, que es donde esta el INSERT del",
        "movimiento y el UPDATE que suma dos veces, esta dentro de",
        "liberarStockReserva, y lo unico que lo ejecuta es finalizarReserva.",
        "",
        "SEGUNDO DATO, y es el que cambia el hallazgo: el bloque de codigo que",
        "devuelve el stock esta ESCRITO DOS VECES A MANO, y las dos copias no",
        "hacen lo mismo.",
        "",
        "  COPIA 1, el helper, L698-713:",
        "",
        "    L698  for (const item of items) {",
        "    L700    if (cantidad <= 0) continue;",
        "    L702    INSERT INTO movimientos_inventario ( .., cantidad, .. )",
        "    L704      VALUES ($1, $2, 'SALIDA-RESERVA', $3, $4, $5, $6)",
        "    L705      [item.id_ptc, idSucursal, cantidad, `Cierre ${numero}`, ..]",
        "    L707    UPDATE inventario_stock",
        "    L709      SET cantidad_reservada = GREATEST(0, cantidad_reservada - $3),",
        "    L710      cantidad_disponible = cantidad_disponible + $3",
        "",
        "  COPIA 2, dentro de cancelar, L968-982:",
        "",
        "    L968  for (const item of items) {",
        "    L970    if (cantidad <= 0) continue;",
        "    L972    INSERT INTO movimientos_inventario ( .., cantidad, .. )",
        "    L974      VALUES ($1, $2, 'SALIDA-RESERVA', $3, $4, $5, $6)",
        "    L975      [item.id_ptc, idSucursal, cantidad, `Cancelacion ...`, ..]",
        "    L977    UPDATE inventario_stock",
        "    L979      SET cantidad_reservada = GREATEST(0, cantidad_reservada - $3)",
        "    L980      WHERE id_ptc = $1 AND id_sucursal = $2",
        "",
        "SON LAS MISMAS DOCE LINEAS, con un cambio: la copia 1 tiene una coma",
        "detras del GREATEST y una linea mas, que es la de L710. Y la copia 2 no",
        "la tiene. O sea que la diferencia entre las dos es exactamente una",
        "linea, y es la que multiplica el stock por dos.",
        "",
        "POR QUE DUPLICA. El INSERT de L703 lleva la cantidad POSITIVA, porque la",
        "prenda vuelve. Y el trigger, schema.sql L648, ya la suma:",
        "",
        "  DO UPDATE SET cantidad_disponible =",
        "    inventario_stock.cantidad_disponible + NEW.cantidad;",
        "",
        "ASI QUE EN LA COPIA 1 LA PRENDA VUELVE DOS VECES. Y no se puede",
        "fallar por la mitad, porque el INSERT y el UPDATE estan los dos en em.query,",
        "dentro de la misma transaccion de L836. O sea que se infla siempre, y con",
        "exito.",
        "",
        "Y EN LA COPIA 2 NO: solo el trigger. O sea que anular una reserva devuelve",
        "el stock a su sitio y finalizar una reserva lo infla. Y las dos hacen lo",
        "mismo desde el punto de vista del negocio: la prenda vuelve al armario.",
        "",
        "POR QUE CU20 NO LO VIO. Porque CU20 leyo las tres rutas como si fueran",
        "tres métodos, cuando una es un helper. Y porque los dos bloques son",
        "identicos linea a linea salvo en la de L710, que es exactamente el tipo",
        "de diferencia que uno no ve si los lee por encima.",
        "",
        "Y LO QUE HACE ESTE CASO, que es donde se ve la cadena completa: la",
        "reserva que se crea aqui descuenta la prenda con un movimiento de signo",
        "menos, L1110-1112. Si esa misma reserva se finaliza, la prenda vuelve",
        "doble, por el trigger y por L710. O sea que el saldo de una reserva de",
        "una prenda, de principio a fin, no es cero: es MAS una prenda. Y ese",
        "numero es el que ve el cliente en el siguiente caso, de disponibilidad",
        "por sucursal."
    ]],
    ["4. Dos filas de bitacora para una sola creacion", [
        "Un detalle de la auditoria, y se ve al leer los 20 ultimos",
        "renglones del metodo.",
        "",
        "crearReserva, L1124-1151, escribe en la bitacora DOS veces:",
        "",
        "  L1124  bitacoraService.registrar(",
        "  L1126    'INSERT',",
        "  L1127    'reservas',",
        "  L1128    `Reserva creada: ${numero} (${detalle.length} prenda(s),",
        "            sucursal ${sucursal.nombre ?? dto.id_sucursal})`,",
        "  L1131    null,                      <-- oldData",
        "  L1132-1139  { id_cliente, id_sucursal, fecha_reserva,",
        "                  hora_reserva, estado: 'Solicitada',",
        "                  items: [...] }",
        "",
        "  L1142  bitacoraService.registrar(",
        "  L1144    'NOTIFICAR',",
        "  L1145    'reservas',",
        "  L1146    `Notificación a sucursal: reserva ${numero} en",
        "            estado Solicitada.`,",
        "  L1149    null,                      <-- oldData",
        "  L1150    { sucursal: .., evento: 'Reserva nueva' }",
        "",
        "O sea que la accion 'INSERT' se usa para dos cosas distintas:",
        "el INSERT de la tabla, y el aviso. Y las dos filas se distinguen",
        "solo por la accion, que es una cadena libre de 40 caracteres, no",
        "por una columna de tipo.",
        "",
        "Y EN CU08, que es donde se leen estas filas, no hay forma de",
        "saber cual es cual: la pantalla lista por tabla y por fecha. Un",
        "auditor que vea dos filas de 'reservas' el mismo segundo tiene",
        "que leer el texto de las dos para saber cual es la creacion y",
        "cual es el aviso.",
        "",
        "LO QUE ESTA BIEN, y es la parte que hace que estas dos filas",
        "valgan la pena:",
        "",
        "  1  El newData de L1132-1139 lleva el array de items completo,",
        "     con id_ptc, cantidad, nombre, talla y color. O sea que la",
        "     bitacora SABE cuantas prendas son y cuales, sin tener que",
        "     ir a la tabla hija. Y en una linea de codigo.",
        "  2  El oldData es null, y con razon: la reserva no existia antes.",
        "  3  El mensaje lleva el numero de reserva, no el id. Y el",
        "     numero es el que ve el usuario.",
        "",
        "Y LAS DOS ESCRITURAS ESTAN FUERA DE LA TRANSACCION, L1122 cierra",
        "y L1124 empieza. O sea que la reserva puede estar creada y sin",
        "bitacora. Y la segunda fila, la del aviso, va DESPUES del correo,",
        "no antes, aunque se escribe antes: el notificarSucursal esta en",
        "L1153, o sea que la bitacora dice 'notificacion enviada' y el",
        "correo puede haber fallado en silencio, con el try/catch de L262."
    ]],
    ["5. La validacion de prendas es un N+1, y esta fuera de la transaccion", [
        "Un hallazgo de rendimiento y de orden, y sale de mirar donde",
        "esta el bucle de L1173.",
        "",
        "validarPrendas, L1168-1214, y el bucle es L1173-1211:",
        "",
        "  for (const item of items) {",
        "    L1174  const cantidad = Math.trunc(Number(item.cantidad));",
        "    L1176  if (!Number.isInteger(idPtc) || !Number.isInteger(cantidad)",
        "           || cantidad <= 0) 422",
        "    L1180  const fila = this.unaFila(",
        "    L1181    await this.dataSource.query(",
        "    L1182      `SELECT ptc.id_ptc, ptc.id_producto, ptc.estado_stock,",
        "    L1183            p.nombre AS nombre_producto, p.estado,",
        "    L1184            t.nombre AS talla, c.nombre AS color",
        "    L1185      FROM producto_talla_color ptc",
        "    L1186      JOIN productos p ON ...",
        "    L1187      JOIN tallas t ON ...",
        "    L1188      JOIN colores c ON ...",
        "    L1189      WHERE ptc.id_ptc = $1`,",
        "",
        "O sea que UN SELECT POR PRENDA, con 3 JOIN para traer los tres",
        "nombres que solo se usan para el mensaje de error y para el",
        "correo. Con 6 prendas son 6 consultas con 3 JOIN cada una.",
        "",
        "LO QUE HAY EN EL PROYECTO PARA HACERLO MEJOR, y es literalmente",
        "el patron de otro caso, CU16, L327-330:",
        "",
        "  `SELECT id_ptc FROM producto_talla_color",
        "   WHERE id_ptc = ANY($1::int[])`",
        "",
        "Una consulta para N ids, con el ANY y el cast. Y aqui, como alli,",
        "se podria traer tambien el estado y los tres nombres en la misma,",
        "y el bucle se quedaria solo para validar y montar el detalle.",
        "",
        "Y EL LUGAR, que es lo mas importante: este bucle esta FUERA de la",
        "transaccion, que abre en L1070, o sea ANTES. Y dentro, el bucle",
        "vuelve a hacer un SELECT con FOR UPDATE por prenda, L1094-1098.",
        "",
        "ASI QUE CADA PRENDA SE CONSULTA DOS VECES:",
        "",
        "  antes de la transaccion   L1181  sin bloqueo, para ver si el",
        "                               producto esta activo y disponible",
        "  dentro de la transaccion  L1094  con FOR UPDATE, para ver si hay",
        "                               stock",
        "",
        "Y LA PRIMERA DE LAS DOS SE PASA. Entre la consulta de L1181 y el",
        "FOR UPDATE de L1094 cabe el COMMIT de otro proceso. O sea que se",
        "puede comprobar que una prenda esta 'disponible' en estado_stock y",
        "que en el momento de bloquearla ya no lo este, y en ese caso la",
        "comprobacion de L1195-1202 no vuelve a correr. Lo que lo coge es la",
        "de L1103, que es la de stock y es la correcta."
    ]],
    ["6. El UPDATE de L1084 no cambia nada", [
        "Un hallazgo pequeno, pero es el tipo de cosa que hace que un",
        "lector del diagrema dude de todo lo demas.",
        "",
        "L1073-1076, el INSERT de la cabecera:",
        "",
        "  INSERT INTO reservas ( id_cliente, id_usuario, id_sucursal,",
        "                             fecha_reserva, hora_reserva, estado )",
        "  VALUES ( $1, $2, $3, $4, $5, 'Solicitada', NOW() )",
        "  RETURNING id_reserva",
        "",
        "L1084, justo despues:",
        "",
        "  UPDATE reservas SET estado = 'Solicitada' WHERE id_reserva = $1",
        "",
        "O sea que el UPDATE pone el estado en el MISMO VALOR que ya",
        "metio el INSERT. No hay ningun campo mas, ni fecha_recepcion, ni",
        "otro. O sea que es un UPDATE que no cambia nada.",
        "",
        "Y ES EL MISMO PATRON DE DOS ESCRITURAS QUE EN CU16, pero alli",
        "tenia razon: el numero de la orden depende del SERIAL, y no se",
        "puede saber antes del INSERT. Aqui el numero se pone en L1083 con",
        "un UPDATE de verdad, L1084... y este otro UPDATE no es del numero,",
        "es del estado, que ya venia bien.",
        "",
        "O SEA QUE EL NUMERO, que es lo que si hace falta, NO SE GUARDA.",
        "L1083 lo construye en una variable:",
        "",
        "  numero = `RES-${String(idReserva).padStart(6, '0')}`;",
        "",
        "Y despues el UPDATE de L1084, en vez de SET numero = $2, pone SET",
        "estado = 'Solicitada'. O sea que la intencion del autor era",
        "claramente guardar el numero, y la linea que se escribio se",
        "quedo con el estado de un borrador anterior.",
        "",
        "LA CONSECUENCIA, y no es pequena: la columna numero de la tabla",
        "reservas no se rellena NUNCA por esta via. Y el numero es lo que",
        "se ve en el correo, L259, en el mensaje de la bitacora, L1128, y",
        "en el return, L1165. O sea que el numero existe en la respuesta y",
        "en los correos, y en la base de datos no."
    ]],
    ["7. El sp_registrar_reserva es este caso entero, y no se usa", [
        "La cuarta de las ocho funciones muertas del esquema, y la que",
        "mas se parece al caso vivo.",
        "",
        "sp_registrar_reserva, schema L728-769, con sus 4 parametros y un",
        "OUT, es este caso de uso escrito en plpgsql:",
        "",
        "  L742  INSERT INTO reservas ( id_usuario, id_sucursal,",
        "         fecha_reserva, hora_reserva, estado )",
        "  L746  FOR item IN SELECT * FROM jsonb_array_elements(p_items)",
        "  L751  SELECT cantidad_disponible - cantidad_reservada",
        "         INTO v_stock_libre FROM inventario_stock",
        "         WHERE .. FOR UPDATE;",
        "  L754  IF v_stock_libre IS NULL OR v_stock_libre < v_cant THEN",
        "  L755    RAISE EXCEPTION 'No hay stock libre suficiente (producto %)'",
        "  L758  INSERT INTO reserva_items ( id_reserva, id_ptc, cantidad )",
        "  L761  UPDATE inventario_stock SET cantidad_reservada = cantidad_reservada + v_cant",
        "  L764  INSERT INTO movimientos_inventario ( .., cantidad, .. )",
        "  L766    VALUES ( v_id_ptc, p_id_sucursal, 'Reserva', -v_cant, 'Reserva #' || p_id_reserva, p_id_reserva );",
        "",
        "O sea que tiene el bucle, el FOR UPDATE, el INSERT de los items, el",
        "UPDATE del reservado y el INSERT del movimiento. Es el caso",
        "completo.",
        "",
        "Y SE DIFERENCIA DEL CODIGO VIVO EN TRES COSAS, y las tres dicen",
        "que la funcion es ANTERIOR al caso:",
        "",
        "  1  No mete id_cliente. L742 inserta id_usuario y ya. El codigo",
        "     de L1073 mete las dos, y la tabla tiene las dos columnas.",
        "  2  Escribe el tipo del movimiento como 'Reserva', L766, y el",
        "     codigo escribe 'SALIDA-RESERVA', L1111. Y el diccionario de",
        "     CU18 tiene 'SALIDA-RESERVA' y no tiene 'Reserva'. O sea que",
        "     si la funcion se llamara, el kardex mostraria 'Movimiento",
        "     Reserva' en cada linea, por el ?? de L51.",
        "  3  Comprueba disponibilidad MENOS reservada, L751, y el codigo",
        "     comprueba disponible a secas, L1102. Las dos reglas son",
        "     defendibles, pero son distintas, y la de la funcion es mas",
        "     conservadora.",
        "",
        "Y NO LA LLAMA NADIE, como los otros tres sp_ del esquema. Cero",
        "llamadas a sp_ o fn_ en los 24 modulos y las 40 paginas.",
        "",
        "LO INTERESANTE, y es la razon de que CU17 y este caso sean los",
        "dos mas caros de cerrar: el autor escribio la version SQL, que",
        "es la rapida y la segura con el FOR UPDATE, y despues escribio la",
        "version TypeScript, mas larga y con mas mensajes de error. Las",
        "dos coexisten y solo una corre."
    ]],
    ["8. Lo que esta bien, que es lo mejor del proyecto", [
        "Este caso tiene mas cosas buenas que ningun otro, y hay que",
        "decirlo con el mismo detalle que los malos. Las seis.",
        "",
        "1. LA TRANSACCION CON LAS 5 ESCRITURAS DENTRO, L1070-L1122. Y",
        "   en el bucle, no alrededor: cada iteracion de L1086 abre sus",
        "   cuatro escrituras dentro de la misma transaccion. Si una prenda",
        "   no tiene stock en L1104, se deshace la cabecera, los items",
        "   anteriores y los movimientos. CU19 hacia lo mismo con veinte",
        "   productos y SIN transaccion.",
        "",
        "2. EL FOR UPDATE, L1094-1098, y DENTRO del bucle. Bloquea la",
        "   fila de inventario_stock de ESA prenda hasta el final de la",
        "   transaccion. Dos personas reservando la misma talla al mismo",
        "   tiempo no se pueden pasar el stock: la segunda se queda",
        "   esperando en el SELECT, y cuando entra ya ve el numero",
        "   actualizado.",
        "",
        "   Y AQUI HAY QUE CORREGIR UNA COSA, porque es facil de decir mal:",
        "   el bloqueo por filas NO es un invento de este caso. Hay OCHO",
        "   SELECT con FOR UPDATE en el proyecto y las SIETE",
        "   transacciones lo llevan:",
        "",
        "     SRV_ReservasService   L732, L786, L842, L930 y L1098",
        "     SRV_PagosService      L302 y L673, en sus tx de L276 y L647",
        "",
        "   Las siete transacciones del proyecto, todas con FOR UPDATE. Es",
        "   el patron del proyecto, hecho bien y repetido. Lo que SI es de",
        "   este caso es el orden, que es el punto 3.",
        "",
        "3. Y EL ORDEN DE ESAS DOS COSAS, que es lo que lo hace",
        "   correcto: el SELECT con FOR UPDATE va en la segunda vuelta del",
        "   bucle y el INSERT del movimiento en la cuarta. O sea que se",
        "   comprueba el stock DESPUES de bloquear, nunca antes. Y por eso",
        "   el resultado no depende del orden de llegada.",
        "",
        "4. LA COMPROBACION DEL ESTADO DE LA PRENDA, L1195-1202, que es",
        "   una lista blanca de verdad:",
        "",
        "     String(fila.estado_producto ?? '').toLowerCase() !== 'activo'",
        "     || String(fila.estado_stock ?? '').toLowerCase() !== 'disponible'",
        "",
        "   Con el ?? '' para que un null no pase, y con el toLowerCase",
        "   para que el contraste no dependa de como este escrito en la",
        "   base. Y el mensaje NOMBRA la prenda, el nombre, la talla y el",
        "   color, L1200, no un id.",
        "",
        "5. EL CORREO A LA SUCURSAL, que es el unico aviso real de todo",
        "   el proyecto. No hay plantillas, no hay un motor, es una",
        "   concatenacion de cadenas en L256-260. Pero trae los cinco",
        "   datos que hacen falta: sucursal, numero, fecha, hora y las",
        "   prendas con talla, color y cantidad. Y la consulta de los",
        "   destinatarios, L240-244, filtra por fecha_baja y por estado",
        "   activo, o sea que no avisa a gente que se fue.",
        "",
        "6. Y QUE LA MISMA IDEA ESTA ESCRITA DOS VECES Y SOLO UNA CORRE.",
        "   El FOR UPDATE de la funcion del esquema, L752, y el de L1098.",
        "   Y las siete transacciones, que son todas el mismo esqueleto:",
        "   cabecera, bucle por prenda, y cuatro escrituras por prenda.",
        "",
        "   O sea que el proyecto SABE escribir una transaccion con varias",
        "   escrituras y un bloqueo de fila, y lo repite en todas partes. Lo",
        "   que no esta bien nunca es el patron: son tres lineas. El",
        "   UPDATE de L1084, que no cambia nada. Y el par L709-L710, que",
        "   suma el stock dos veces al finalizar. Las dos estan a mil",
        "   lineas una de otra y a treinta del final del fichero."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU21."; } catch (e) { }
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
    fragmento(diag, "loop [por cada prenda: valida y consulta, FUERA de la transaccion]", xD, xS, Y_MSG0 + 10 * PASO_MSG - 34, Y_MSG0 + 13 * PASO_MSG + 16);
    // El loop de la transaccion, L1086: cuatro escrituras y un FOR UPDATE por prenda.
    fragmento(diag, "loop [por cada prenda: 4 escrituras y un FOR UPDATE, DENTRO]", xS, xD, Y_MSG0 + 18 * PASO_MSG - 34, Y_MSG0 + 24 * PASO_MSG + 16);
    activacion(diag, xDe(indiceDe("C")), Y_MSG0 + 7 * PASO_MSG - 26, Y_MSG0 + 32 * PASO_MSG + 12);
    activacion(diag, xS, Y_MSG0 + 9 * PASO_MSG - 26, Y_MSG0 + 31 * PASO_MSG + 12);
    activacion(diag, xD, Y_MSG0 + 14 * PASO_MSG - 26, Y_MSG0 + 25 * PASO_MSG + 12);
}

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 940) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU21  Realizar Reserva de Múltiples Prendas   ·   en el código del proyecto este caso es CU28"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 940) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseño de caso de uso, sección 3.3.2.1.  10 líneas de vida, 43 mensajes, 8 hallazgos, 2 loop y NINGUN alt, y 3 barras de activación."; } catch (e) { }
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
    N.push("CU21  Realizar Reserva de Múltiples Prendas.  Diseño de caso de uso, sección 3.3.2.1.");
    N.push("");
    N.push("EL CASO SE LLAMA DE MÚLTIPLES PRENDAS Y LA PANTALLA NO EXISTE");
    N.push("");
    N.push("  router.tsx L56, la ruta entera:");
    N.push("");
    N.push("    <Route path=\"/reservas/nueva\" element={<Navigate to=\"/catalogo\" replace />} />");
    N.push("");
    N.push("  Redirige al catálogo, con replace, que además quita la entrada del historial. Y L51 hace");
    N.push("  lo mismo con /productos. Y el menú del cliente no tiene ninguna entrada para crear una");
    N.push("  reserva: clienteMenu.ts solo declara /recomendaciones (CU41), /reservas (CU29),");
    N.push("  /reservas/pruebas-ra (CU32) y /compras (CU38). CU28 no está en el menú.");
    N.push("");
    N.push("  PERO EL BACKEND SÍ ACEPTA N PRENDAS, y no sin querer. CTR_Reservas L44-47:");
    N.push("");
    N.push("    @IsArray({ message: 'Debes seleccionar al menos una prenda.' })");
    N.push("    @ValidateNested({ each: true })");
    N.push("    @Type(() => ItemReservaRequest)");
    N.push("    items!: ItemReservaRequest[];");
    N.push("");
    N.push("  Y el servicio mete dos bucles sobre items, L1173 y L1086, con cuatro escrituras por");
    N.push("  prenda en el segundo. O sea que la capacidad de varias prendas está escrita, validada");
    N.push("  y con su lógica de stock por prenda. Lo que no existe es el formulario que la llene.");
    N.push("");
    N.push("AVISO DE NUMERACIÓN, IGUAL QUE EN LOS CUATRO ANTERIORES");
    N.push("");
    N.push("  Este caso es CU21 en el documento y CU28 en el código del proyecto.");
    N.push("");
    N.push("    web/src/lib/api.ts L673   // CU28 - Realizar Reserva de Múltiples Prendas");
    N.push("    BASE DE DATOS/schema.sql L342   -- 8. RESERVAS - CU28-CU31");
    N.push("    BASE DE DATOS/schema.sql L726   -- 4. PROCEDIMIENTO: Registrar reserva (CU28)");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 líneas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Cliente            «actor»     quien reserva");
    N.push("    Producto.tsx             «boundary»  831 líneas, y es desde donde se reserva");
    N.push("    api.ts                   «boundary»  sección CU28");
    N.push("    JwtAuthGuard             «control»   dependencias.ts, L15-65");
    N.push("    ValidationPipe           «control»   main.ts, L22-43, con ValidateNested sobre items");
    N.push("    CTR_Reservas             «control»   150 líneas, POST a la raíz del controlador");
    N.push("    SRV_ReservasService      «control»   1215 líneas, 5 transacciones, 22 em.query");
    N.push("    SRV_BitacoraService      «control»   registrar(), DOS veces por creación");
    N.push("    SRV_EmailService         «control»   enviarAvisoReserva, el aviso real del proyecto");
    N.push("    PostgreSQL               «entity»    5 tablas y un sp_registrar_reserva que nadie usa");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes. 12 van a la base de datos, 18 son mensajes a sí mismo, 9 son retornos,");
    N.push("  5 llevan la guarda escrita entre corchetes, y 3 tocan al actor.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("LOS DOS FRAGMENTOS: DOS loop Y NINGUN alt");
    N.push("");
    N.push("  Contados ANTES de dibujar, con contadores, sobre las 1215 líneas de SRV_ReservasService:");
    N.push("");
    N.push("    for 5   while 0   Promise.all 0   continue 2   reduce 1");
    N.push("    if 60   throw 45   ternarios 80   map 11");
    N.push("    dataSource.query 22   em.query 20   transaction 5");
    N.push("    bitacoraService.registrar 6   enviarAvisoReserva 1");
    N.push("");
    N.push("  Y DE LOS 5 FOR, SOLO 2 SON DE ESTE CASO:");
    N.push("");
    N.push("    L1173  validarPrendas: un bucle por prenda, con un SELECT por prenda dentro,");
    N.push("           y con 3 JOIN para traer los nombres que van al mensaje y al correo.");
    N.push("           Esta FUERA de la transacción, que aún no ha abierto.");
    N.push("    L1086  el bucle de la transaccion: un bucle por prenda, con CUATRO escrituras");
    N.push("           por prenda, y con un SELECT con FOR UPDATE en la segunda vuelta.");
    N.push("");
    N.push("  Los otros tres for son de otros casos: liberarStockReserva L698, que es de cerrar y");
    N.push("  anular, y dos más de confirmar y finalizar. Y se cuentan aparte, porque son otros");
    N.push("  casos de uso. El de L698 es la contraparte exacta de este, y es el hallazgo 3.");
    N.push("");
    N.push("  NO HAY NINGUN alt. En el camino de este caso hay cinco if y los cinco son guardas: la");
    N.push("  fecha, la hora, la cantidad, la prenda que no existe, la prenda no disponible, y el");
    N.push("  stock. Ninguno tiene dos caminos de verdad. De los 60 if del fichero, el resto");
    N.push("  pertenecen a los otros casos de reservas.");
    N.push("");
    N.push("  Y las 3 barras de activación, que no son un extra: la del controlador, la del servicio, y");
    N.push("  la de la base de datos, que existe solo entre L1070 y L1122.");
    N.push("");
    N.push("LO BUENO, Y ES LO MEJOR DEL PROYECTO");
    N.push("");
    N.push("  1. LA TRANSACCIÓN CON LAS 5 ESCRITURAS DENTRO, L1070-L1122, y en el bucle, no");
    N.push("     alrededor. Cada iteración de L1086 abre sus cuatro escrituras dentro de la misma");
    N.push("     transacción. Si una prenda no tiene stock en L1104 se deshace la cabecera, los items");
    N.push("     anteriores y los movimientos. CU19 hacía lo mismo con veinte productos y SIN");
    N.push("     transacción.");
    N.push("");
    N.push("  2. EL FOR UPDATE, L1094-1098, y DENTRO del bucle. Bloquea la fila de inventario_stock de");
    N.push("     ESA prenda hasta el final de la transacción. Dos personas reservando la misma talla");
    N.push("     al mismo tiempo no se pueden pasar el stock: la segunda espera en el SELECT y");
    N.push("     cuando entra ya ve el número actualizado.");
    N.push("");
    N.push("     Y OJO, porque es lo que hay que decir de este caso: el bloqueo por filas NO es un");
    N.push("     invento suyo. Hay NUEVE SELECT con FOR UPDATE en el proyecto, y las SIETE");
    N.push("     transacciones del proyecto lo llevan: cinco en este fichero, L732, L786, L842, L930 y");
    N.push("     L1098, y dos en SRV_PagosService, L276 y L647. Es el patrón del proyecto, y este caso");
    N.push("     es uno de los que lo cumplen bien, no el único.");
    N.push("");
    N.push("  3. Y EL ORDEN DE ESAS DOS COSAS, que es lo que lo hace correcto: el SELECT con FOR");
    N.push("     UPDATE va en la segunda vuelta y el INSERT del movimiento en la cuarta. O sea que");
    N.push("     se comprueba el stock DESPUÉS de bloquear, nunca antes. Por eso el resultado no");
    N.push("     depende del orden de llegada. Y el trigger de CU20 es lo que hace que la vuelta");
    N.push("     siguiente vea el stock ya descontado.");
    N.push("");
    N.push("  4. LA COMPROBACIÓN DEL ESTADO DE LA PRENDA, L1195-1202, que es una lista blanca de");
    N.push("     verdad: el estado del producto tiene que ser 'activo' y el del stock 'disponible', con");
    N.push("     el ?? '' para que un null no pase y el toLowerCase para que el contraste no dependa");
    N.push("     de cómo esté escrito. Y el mensaje NOMBRA la prenda, la talla y el color, L1200, no");
    N.push("     un id. Y comprueba el horario de atención, L1060-1064, con el rango en el mensaje.");
    N.push("");
    N.push("  5. EL CORREO A LA SUCURSAL, que es el único aviso real de todo el proyecto. No hay");
    N.push("     motor ni plantillas: es una concatenación de cadenas en L256-260. Pero trae los");
    N.push("     cinco datos que hacen falta, y la consulta de los destinatarios, L240-244, filtra");
    N.push("     por fecha_baja y por estado activo, así que no avisa a gente que se fue.");
    N.push("");
    N.push("  6. Y QUE LA MISMA IDEA ESTÁ ESCRITA DOS VECES, Y SOLO UNA CORRE. El FOR UPDATE de la");
    N.push("     función del esquema, L752, y el de L1098. Y también las siete transacciones, que son");
    N.push("     todas el mismo esqueleto. O sea que el proyecto sabe bloquear una fila y hacer una");
    N.push("     transacción con varias escrituras dentro, y lo repite en todas partes, y lo que falla");
    N.push("     no es el patrón sino tres líneas concretas: el UPDATE de L1084 y el par L709-L710.");
    N.push("");
    N.push("EL HALLAZGO 2: SIN CORREOS DE EMPLEADOS, LA RESERVA SE CREA Y NADIE SE ENTERA");
    N.push("");
    N.push("  notificarSucursal, L249-265, hace las cuatro cosas: busca los correos con");
    N.push("  emailsSucursal, L240-244, con el filtro de fecha_baja IS NULL y de estado activo; y si no");
    N.push("  hay ninguno, L252-255, lo único que pasa es un logger.warn con el texto '[CU30] Sin");
    N.push("  correos de empleados activos en la sucursal N'.");
    N.push("");
    N.push("  O sea que la reserva ya está creada y se devuelve con éxito. Ese log es lo único que le");
    N.push("  dice a alguien que la tienda no se ha enterado, y el fallo es invisible para las dos");
    N.push("  personas que lo necesitan.");
    N.push("");
    N.push("  Y el boolean que devuelve enviarAvisoReserva, L261, NO SE MIRA. Ese método sabe si el");
    N.push("  envío funcionó y el resultado se tira. Y todo el notificarSucursal está dentro de un");
    N.push("  try/catch, L250-264, que se traga el error con un logger.error. O sea que ni una");
    N.push("  excepción ni un false llegan a la reserva.");
    N.push("");
    N.push("  Y UN MATIZ: el aviso va a la SUCURSAL, no al cliente. La persona que reserva no recibe");
    N.push("  nada, y tiene que entrar en Mis Reservas, que es CU29, para saber que su reserva");
    N.push("  existe. Puede ser una decisión correcta, porque la tienda es la que prepara las");
    N.push("  prendas, pero conviene decirlo.");
    N.push("");
    N.push("EL HALLAZGO 6: EL UPDATE DE L1084 NO CAMBIA NADA");
    N.push("");
    N.push("  L1073-1076, el INSERT de la cabecera, ya mete el estado:");
    N.push("");
    N.push("    VALUES ( $1, $2, $3, $4, $5, 'Solicitada', NOW() )");
    N.push("");
    N.push("  Y L1084, justo después:");
    N.push("");
    N.push("    UPDATE reservas SET estado = 'Solicitada' WHERE id_reserva = $1");
    N.push("");
    N.push("  El mismo valor, y ningún campo más. Y el número, que es lo que sí hace falta, NO se");
    N.push("  guarda: L1083 lo construye en una variable, y el UPDATE de L1084, en vez de SET numero");
    N.push("  = $2, pone SET estado. La intención del autor era guardar el número y la línea que se");
    N.push("  escribió se quedó con el estado de un borrador anterior.");
    N.push("");
    N.push("  O sea que la columna numero de la tabla reservas no se rellena NUNCA por esta vía. Y el");
    N.push("  número es lo que se ve en el correo, L259, en el mensaje de la bitácora, L1128, y en el");
    N.push("  return, L1165. Existe en la respuesta y en los correos, y en la base de datos no.");
    N.push("");
    N.push("RELACIÓN CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  CU20, CU18 y CU17 comparten tabla con este caso, y el hallazgo 3 de CU20 aparece aquí");
    N.push("  desde el otro lado, y CORRIGIENDO lo que dijo CU20: liberarStockReserva, L682-716, no es");
    N.push("  un helper compartido. Se llama una sola vez, L861, desde finalizarReserva. Y el bloque de");
    N.push("  código que devuelve el stock está escrito DOS veces a mano, y las dos copias difieren en");
    N.push("  una línea:");
    N.push("");
    N.push("    el helper, L698-713      INSERT del movimiento + L710 cantidad_disponible = + $3");
    N.push("    cancelar, L968-982      INSERT del movimiento, y el UPDATE se para en L979");
    N.push("");
    N.push("  Como el movimiento lleva la cantidad positiva y el trigger de schema.sql L648 ya la suma,");
    N.push("  en la primera copia la prenda vuelve dos veces y en la segunda vuelve una. O sea que");
    N.push("  FINALIZAR una reserva infla el stock y ANULARLA no. Y las dos hacen lo mismo desde el");
    N.push("  punto de vista del negocio: la prenda vuelve al armario. Y tampoco existe ningún");
    N.push("  método que se llame cerrar, que es como lo llamó CU20 al leerlo por encima.");
    N.push("");
    N.push("  Y CU20 vio esas mismas tres líneas desde el lado del kardex y escribió que dos de los");
    N.push("  tres SALIDA-RESERVA no son salidas porque la prenda vuelve. Aquí se ve que la que");
    N.push("  vuelve dos veces. Y el hallazgo 7 de este caso es el reverso: sp_registrar_reserva,");
    N.push("  L728-769, es este caso entero escrito en plpgsql, con su FOR, su FOR UPDATE y sus");
    N.push("  cuatro escrituras, y no lo usa nadie. Es la cuarta de las ocho funciones muertas que");
    N.push("  CU17 contó, y la que más se parece al caso vivo.");
    N.push("");
    N.push("  CU19 tenía un bucle de veinte productos con un UPDATE cada uno y sin transacción, y");
    N.push("  decía que con catorce productos escritos y un 404 a la mitad se quedaba a medias.");
    N.push("  Aquí el bucle es de prendas y tiene transición, y el orden de las dos últimas");
    N.push("  operaciones, el FOR UPDATE antes del movimiento, es lo que hace que aguante. Es la");
    N.push("  diferencia entre el segundo mejor caso y el mejor.");
    N.push("");
    N.push("SOBRE LA COLOCACIÓN DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Anchura: las diez cabeceras separadas " + PASO + " px, con " + ANCHO_CAB + " de ancho. Quedan");
    N.push("  65 px entre una y otra. Altura: " + PASO_MSG + " px por mensaje. El mensaje 1 cae en la y " + Y_MSG0);
    N.push("  y el " + TOTAL_MSG + " en la y " + (Y_MSG0 + (TOTAL_MSG - 1) * PASO_MSG) + ".");
    N.push("");
    N.push("  Un detalle que hizo fallar estos diagramas doce veces y que conviene no");
    N.push("  olvidar: EA guarda Top y Bottom en NEGATIVO, porque trabaja en");
    N.push("  coordenadas cartesianas con la Y creciendo hacia arriba. Si se le pasa");
    N.push("  la Y en positivo no da error, simplemente no coloca nada y todos los");
    N.push("  objetos se quedan en el mismo punto. En las dos funciones de colocación");
    N.push("  de este script está escrito o.Top = 0 - y y o.Bottom = 0 - y - alto. En el");
    N.push("  AddNew, en cambio, la Y va en positiva, porque ahí EA ya la convierte.");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU21 Secuencia", 0); } catch (e) { }
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
    T.push("CU21 - DIAGRAMA DE SECUENCIA - INFORME");
    T.push("");
    T.push("Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB);
    T.push("Tipo de diagrama: " + tipoUsado);
    T.push("Mensajes: " + r.puestos + " de " + TOTAL_MSG);
    T.push("Mensajes a sí mismo: " + r.autodestino);
    T.push("Conectores en el diagrama: " + r.enDiagrama);
    T.push("Hallazgos: " + h2.total + " de " + TOTAL_HAL + ", banda hasta la y " + h2.fin);
    T.push("");
    T.push("AVISO DE NUMERACIÓN");
    T.push("Este caso es CU21 en el documento y CU28 en el código del proyecto.");
    T.push("Y la pantalla de múltiples prendas no existe: router.tsx L56");
    T.push("manda /reservas/nueva al catálogo.");
    T.push("");
    T.push("MARCOS Y BARRAS  <-- MIRA ESTO");
    T.push("Este caso tiene 2 loop y NINGUN alt. Contado antes de dibujar con");
    T.push("contadores sobre las 1215 líneas de SRV_ReservasService:");
    T.push("  for 5   while 0   Promise.all 0   continue 2   reduce 1");
    T.push("  if 60   throw 45   ternarios 80   map 11");
    T.push("  dataSource.query 22   em.query 20   transaction 5");
    T.push("De los 5 for, solo 2 son de este caso: L1173 y L1086. Los otros 3");
    T.push("son de cerrar, anular y finalizar.");
    T.push("Fragmentos colocados: " + MARCOS_PUESTOS + " de 2");
    T.push("Barras de activación colocadas: " + BARRAS_PUESTAS + " de 3");
    if (MARCOS_PUESTOS < 2 || BARRAS_PUESTAS < 3) {
        T.push("  Si alguno sale a 0, EA no ha aceptado la forma y hay que");
        T.push("  dibujarlo a mano en el diagrama.");
    } else {
        T.push("  Los 5 han salido. Son FORMAS dibujadas por script, no");
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
    msg = msg + "CU21 - Realizar Reserva de Múltiples Prendas" + SALTO;
    msg = msg + "Diagrama de secuencia, sección 3.3.2.1." + SALTO;
    msg = msg + "En el código del proyecto este caso es CU28." + SALTO + SALTO;
    msg = msg + "10 líneas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "2 loop (L1173 y L1086) y NINGUN alt." + SALTO;
    msg = msg + "FRAGMENTOS colocados: " + MARCOS_PUESTOS + " de 2." + SALTO;
    msg = msg + "BARRAS colocadas: " + BARRAS_PUESTAS + " de 3." + SALTO;
    if (MARCOS_PUESTOS < 2 || BARRAS_PUESTAS < 3) msg = msg + "  Si falta alguno, hay que dibujarlo a mano." + SALTO;
    msg = msg + SALTO;
    msg = msg + "ES EL MEJOR CASO DE ESCRITURA DEL PROYECTO: transacción" + SALTO;
    msg = msg + "con las 5 escrituras dentro y un SELECT con FOR UPDATE" + SALTO;
    msg = msg + "dentro del bucle, antes de mover el stock. No es el único" + SALTO;
    msg = msg + "bloqueo del proyecto: las 7 transacciones lo llevan." + SALTO;
    msg = msg + "Lo que sí es de este caso es el orden." + SALTO + SALTO;
    msg = msg + "PERO: la pantalla de múltiples prendas no existe, el" + SALTO;
    msg = msg + "UPDATE de L1084 no cambia nada y deja la columna numero" + SALTO;
    msg = msg + "vacía, y el helper que devuelve el stock lo cuenta dos" + SALTO;
    msg = msg + "veces al FINALIZAR, y lo hace porque el bloque que devuelve el stock" + SALTO;
    msg = msg + "está escrito dos veces a mano y solo una copia suma." + SALTO + SALTO;
    msg = msg + "Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACIÓN: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU21 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU21 Secuencia", 0); } catch (e3) { }
}
