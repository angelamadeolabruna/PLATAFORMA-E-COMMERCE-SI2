// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU16  Elaborar Orden de Compra a Proveedor
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/admin/AdminOrdenesCompra.tsx   794 lineas
//     web/src/lib/api.ts                         L1539-1546
//     api/src/main.ts                            L22-43 ValidationPipe
//     api/src/modulos/seguridad/dependencias.ts  L15-65 JwtAuthGuard
//     api/src/modulos/compras/CTR_Compras.ts     L81-100
//     api/src/modulos/compras/SRV_ComprasService.ts  L306-428
//     api/src/modulos/seguridad/SRV_BitacoraService.ts L10, L14-39
//     BASE DE DATOS/schema.sql                   L277-297, L566, L578, L811-840
//
//   Cada mensaje lleva la linea del fichero de la que sale.
//
// QUE HACE ESTE CASO
//   Crea una orden de compra: encabezado en ordenes_compra y una fila en
//   orden_compra_items por cada linea del detalle. Es el primer caso en
//   dieciseis que mete las escrituras en una transaccion de verdad, y el
//   primero en el que las doce columnas de los dos INSERT existen.
//
//   40 mensajes. 10 lineas de vida. 8 hallazgos.
//   9 van a la base de datos, 17 son mensajes a si mismo, 6 son retornos,
//   10 llevan la guarda entre corchetes y 2 salen del actor.
//   2 fragmentos: un alt y un loop, los dos contados antes de dibujar.
//
// LOS FRAGMENTOS: UN alt Y UN loop, Y LOS DOS SON REALES
//   Contados antes de escribir, con contadores, no a ojo:
//
//     en crearOrdenCompra, L379-L428:
//        for 1   while 0   em.query 3   dataSource.query 0
//     en validarDetalle, L306-L335:
//        for 1   if 5   query 1
//     en validarEncabezado, L336-L378:
//        for 0   if 5   query 2   ternarios 4
//
//   El LOOP es el de L406:
//
//     for (const linea of dto.detalle) {
//       const subtotal = redondearDos(linea.cantidad * linea.precio_unitario_compra);
//       await em.query(INSERT INTO orden_compra_items ...);
//     }
//
//   Una vuelta por cada linea de la orden, con una escritura en cada vuelta.
//   Es el unico bucle que dibuja este diagrama.
//
//   El ALT es el de L349, el del estado del proveedor:
//
//     if (estadoProveedor.toLowerCase() !== 'activo') { ... }
//
//   Dos caminos, y dentro del primero un ternario, L351-353, que elige
//   entre dos mensajes. Es la misma forma que el alt de CU15, L271, porque
//   es la misma comprobacion: CU15 la escribe y CU16 la consume.
//
//   Y hay un tercer bucle, el de L312 de validarDetalle, que tambien es un
//   for de verdad pero NO se dibuja como fragmento: no da al loop del
//   diagrama, da a cuatro validaciones que no escriben nada. Se dibuja como
//   mensajes a si mismo del 13 al 15.
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
//   convierte por su cuenta. No son contradictorias: una es la propiedad
//   del objeto y la otra es la cadena del AddNew.
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
var PAQ_NOMBRE = "CU16 Secuencia Orden de Compra";
var DIAG_NOMBRE = "CU16 Elaborar Orden de Compra Proveedor";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 142;

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

// Las diez cabeceras. clave, nombre, tipo, estereotipo, subtipo,
// cabecera corta, papel RUP, fichero real.
var CAB = [
    ["U", "ACTOR_Administrador", "Actor", "Lifeline", "Administrador", "quien la elabora", "Actor, no clase: es quien pulsa", "no es codigo, es la persona"],
    ["F", "AdminOrdenesCompra.tsx", "Object", "Lifeline", "AdminOrdenesCompra", "794 lineas", "Boundary", "web/src/pages/admin/AdminOrdenesCompra.tsx, 794 lineas"],
    ["H", "api.ts", "Object", "Lifeline", "api", "cliente HTTP", "Boundary", "web/src/lib/api.ts, L1539-1546"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["P", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "anidado con ValidateNested", "Control", "api/src/main.ts, L22-43, es global"],
    ["C", "CTR_Compras", "Object", "Lifeline", "ComprasAdminController", "POST admin/ordenes-compra", "Control", "api/src/modulos/compras/CTR_Compras.ts, L81-100"],
    ["S", "SRV_ComprasService", "Object", "Lifeline", "ComprasService", "L306-L428, 123 lineas", "Control", "api/src/modulos/compras/SRV_ComprasService.ts, L306-428"],
    ["M", "gestor de la transaccion", "Object", "Lifeline", "em", "dataSource.transaction", "Entity", "TypeORM, el em de L390, es la diferencia con las demas consultas"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "repo.save(), no es SQL crudo", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L10, L14-39"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "5 tablas", "Entity", "schema.sql: ordenes_compra L277-288, orden_compra_items L290-297, proveedores, sucursales, producto_talla_color"]
];

// Los 40 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [
    [1, "U", "F", "1. abre el modal de nueva orden de compra   AdminOrdenesCompra.tsx, L186-190, y el titulo L371 dice 'Orden de compra a proveedor'", "S"],
    [2, "F", "F", "2. el modal arranca con UNA linea vacia, L110-112: { uid: 1, id_ptc: '', cantidad: '1', precio: '' }   Y la fecha por defecto es HOY, L107", "S"],
    [3, "F", "F", "3. el total de la pantalla sale de un reduce SIN REDONDEAR, L130-133.   El que se guarda si se redondea, L375.   Los dos numeros no son el mismo   Hallazgo 2", "S"],
    [4, "F", "H", "4. POST /api/v1/admin/ordenes-compra con el payload de L170-180: id_proveedor, id_sucursal, fecha_estimada_entrega, detalle[], observaciones   api.ts L1539", "S"],
    [5, "H", "G", "5. PATCH con Authorization Bearer y credentials:'include'   Ojo: es un POST, L1540", "S"],
    [6, "G", "D", "6. SELECT usuarios WHERE id_usuario = :sub   L44.   Una consulta por peticion, en el guard", "S"],
    [7, "G", "G", "7. [estado != 'activo'] 401 'Tu cuenta esta deshabilitada.'   L49-51", "S"],
    [8, "G", "P", "8. el guard no toca el cuerpo.   El pipe ve un cuerpo con un array dentro del cuerpo   CTR_Compras L41-59", "S"],
    [9, "P", "C", "9. OrdenCompraRequest: 4 reglas en el encabezado.   Y LineaDetalleRequest, L30-39, con @ValidateNested({ each: true }) y @Type(() => LineaDetalleRequest) para el array   L51-54", "S"],
    [10, "C", "S", "10. crearOrdenCompra( currentUser, dto, request )   L99.   El controlador mapea el detalle linea a linea, L92-96", "S"],
    [11, "S", "D", "11. SELECT r.permisos_json FROM usuarios JOIN usuarios_roles JOIN roles WHERE u.id_usuario = $1   L100-105.   SIN getter, quinta vez en dieciseis casos", "S"],
    [12, "S", "S", "12. [sin '*' ni 'elaborar_orden_compra'] 403 'No tienes permiso para elaborar ordenes de compra.'   L112-114", "S"],
    [13, "S", "S", "13. validarDetalle( dto.detalle )   L385, que es un for, L312, con cuatro validaciones por vuelta y ninguna escritura", "S"],
    [14, "S", "S", "14. [id_ptc no entero] 422, [cantidad no entera o <= 0] 422, [precio no finito o <= 0] 422   L315-323.   Tres 422 distintos con tres mensajes distintos", "S"],
    [15, "S", "D", "15. SELECT id_ptc FROM producto_talla_color WHERE id_ptc = ANY($1::int[])   L328.   UNA consulta para N productos, no N consultas.   Consulta 3 de 8", "S"],
    [16, "S", "S", "16. [filas.length != ids.length] 422 'Uno de los productos seleccionados no existe.'   L331-333   Y aqui hay un fallo real: el mismo producto dos veces lo cuenta como inexistente   Hallazgo 3", "S"],
    [17, "S", "S", "17. validarEncabezado( dto )   L386", "S"],
    [18, "S", "D", "18. SELECT id_proveedor, nombre_empresa, estado_riesgo FROM proveedores WHERE id_proveedor = $1   L341.   Consulta 4 de 8.   Es la misma consulta de CU15 L261", "S"],
    [19, "S", "S", "19. [no existe] 404 'Proveedor no encontrado.'   L345-347", "S"],
    [20, "S", "S", "20. y aqui empieza el ALT, el de L349: if (estadoProveedor.toLowerCase() !== 'activo')   rama 1: 409 con dos mensajes distintos, L351-353", "S"],
    [21, "S", "S", "21. rama 2 del alt: el proveedor es Activo y se sigue.   El total sale de detalleRedondeado, L375, que SI redondea con Number.EPSILON, L533", "S"],
    [22, "S", "D", "22. SELECT id_sucursal, nombre, estado FROM sucursales WHERE id_sucursal = $1   L359.   Consulta 5 de 8", "S"],
    [23, "S", "S", "23. [no existe] 404, y [estado != 'activa'] 422 'La sucursal destino no esta activa.'   L363-368", "S"],
    [24, "S", "S", "24. [la fecha no casa con FECHA_RE] 422   L371-373, con la regex de L15: solo mira la forma, AAAA-MM-DD.   No mira que sea una fecha real ni que este en el futuro   Hallazgo 4", "S"],
    [25, "S", "M", "25. dataSource.transaction( async (em) => { ... } )   L390.   Primera transaccion de los dieciseis primeros casos.   Ojo: pagos, reservas y ventas tambien tienen, en 4 ficheros mas", "S"],
    [26, "M", "D", "26. INSERT INTO ordenes_compra ( id_proveedor, id_sucursal, fecha_orden, fecha_estimada_entrega, estado, total, observaciones ) VALUES ( $1, $2, NOW(), $3, 'Pendiente', $4, $5 ) RETURNING id_orden_compra   L393-396.   Escritura 1 de 3.   Las 7 columnas EXISTEN, comprobadas contra schema L277-288", "S"],
    [27, "S", "S", "27. [vuelve sin fila] throw new Error( 'No se pudo crear la orden de compra.' )   L399-401.   Un 500 sin managebars, y el unico throw del metodo que no es de Nest", "S"],
    [28, "S", "S", "28. numero = 'OC-' + String(id).padStart(6, '0')   L403.   El numero depende del SERIAL que devuelve el propio INSERT, por eso se escribe en el paso 29 y no en el 26", "S"],
    [29, "M", "D", "29. UPDATE ordenes_compra SET numero = $2 WHERE id_orden_compra = $1   L404.   Escritura 2 de 3.   Dentro de la misma transaccion, asi que nadie ve la orden sin numero", "S"],
    [30, "S", "M", "30. y aqui empieza el LOOP, L406: for ( const linea of dto.detalle )   una vuelta por cada linea de la orden   Consulta 6 de 8, y se repite N veces", "S"],
    [31, "M", "D", "31. cuerpo del loop, L408-411: INSERT INTO orden_compra_items ( id_orden_compra, id_ptc, cantidad, precio_unitario, subtotal ) VALUES ( $1, $2, $3, $4, $5 )   con subtotal = redondearDos( cantidad * precio_unitario_compra ), L407.   Escritura 3 de 3.   Las 5 columnas EXISTEN, contra schema L290-297", "S"],
    [32, "M", "S", "32. fin de la transaccion: COMMIT.   Si algo falla dentro, todo lo anterior se deshace, incluidas las N lineas del loop   L414", "A"],
    [33, "S", "B", "33. bitacora( 'INSERT', 'ordenes_compra', 'Orden de compra creada: OC-000123 (total 450.00)', usuario, request, idOrden, null, { id_proveedor, id_sucursal, total, n_lineas } )   L416-425.   OJO: esta FUERA de la transaccion que acaba de cerrarse   Hallazgo 1", "S"],
    [34, "B", "D", "34. y aqui OJO, que no es un INSERT por dataSource.query: this.repo.create({ id_usuario, accion_sql, tabla_afectada, id_registro, detalle, old_data, new_data, ip_address, user_agent }) y this.repo.save()   SRV_BitacoraService L27-38, con @InjectRepository(BitacoraAuditoria) en L10   O sea que usa OTRA conexion, y por eso no podia estar en la transaccion de L390 ni aunque se metiera", "A"],
    [35, "S", "C", "35. { detail: 'Orden de compra OC-000123 creada.', id_orden_compra, total }   L427.   El total que vuelve es el redondeado, no el que se veia en pantalla", "A"],
    [36, "C", "H", "36. 201 Created con el JSON.   El codigo lo pone @HttpCode(HttpStatus.CREATED), L82, no el 200 por defecto de Nest", "A"],
    [37, "H", "F", "37. la respuesta.   api.ts L1539-1546", "A"],
    [38, "F", "F", "38. Toast con res.detail y recarga de la lista, L597-598.   Y modalAbierto a false, L595", "S"],
    [39, "F", "F", "39. y aqui aparece el hallazgo 4: la orden queda en Pendiente PARA SIEMPRE.   Ningun fichero del proyecto escribe 'Recibida': solo lo hace sp_registrar_recepcion, schema L811-840, y no la llama nadie", "S"],
    [40, "F", "U", "40. el administrador ve 'Orden de compra OC-000123 creada.'   Y el menu de L511 le ofrece Ver, Editar y Anular, que es todo lo que hay   A", "A"]
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. La transaccion existe, pero la auditoria se queda fuera", [
        "Es el hallazgo mas importante, y es una mezcla de bien y mal.",
        "",
        "LO BIEN, y hay que decirlo con la medida correcta:",
        "",
        "  L390  await this.dataSource.transaction( async (em) => {",
        "",
        "Y dentro de la transaccion caen las TRES escrituras:",
        "",
        "  L392  INSERT INTO ordenes_compra ... RETURNING id_orden_compra",
        "  L404  UPDATE ordenes_compra SET numero",
        "  L408  INSERT INTO orden_compra_items, una vez por linea",
        "",
        "O sea que si la linea 7 de la orden falla, no queda ni la orden",
        "ni las 6 lineas anteriores. Es un salto real de calidad.",
        "",
        "PERO NO LA PRIMERA DEL PROYECTO, que es lo que parece al leerlo.",
        "Las transacciones del proyecto, contadas una a una:",
        "",
        "  SRV_ComprasService     L390, L454    dos",
        "  SRV_PagosService       L276, L647    dos",
        "  SRV_ReservasService    L726, L780, L836, L924, L1070   cinco",
        "  SRV_VentasService      L235, L513    dos",
        "",
        "Once en total, en cuatro servicios. O sea que compras es la",
        "primera de los dieciseis primeros casos, porque los otros tres",
        "servicios son de los casos 21 a 31, que todavia no se han",
        "dibujado.",
        "",
        "Y AQUI ESTA LA OBSERVACION UTIL: los servicios SIN transaccion",
        "son exactamente los que ya se han documentado. En los dieciseis",
        "primeros casos, los que escriben y no tienen transaction son",
        "usuarios, roles, sucursales, catalogos, proveedores. Y los que",
        "la tienen son pagos, reservas, ventas y este. O sea que el autor",
        "la uso cuando el caso le obliga, por el volumen de filas de la",
        "transaccion, y no como una regla.",
        "",
        "LO MAL, Y AQUI ESTA EL AGUJERO DE VERDAD:",
        "",
        "La cuarta escritura no entra. L416:",
        "",
        "  }        <-- aqui se cierra la transaccion, L414",
        "  await this.bitacora( 'INSERT', 'ordenes_compra', ... );  L416",
        "",
        "El await esta DESPUES del cierre, con una linea de por medio.",
        "Asi que si la bitacora falla, la orden ya esta creada y no hay",
        "rastro de quien la creo. Y aqui el coste es mayor que en otros",
        "casos, porque lo que se audita es una decision de a quien se",
        "le compra y de cuanta mercaderia entra. Y en CU08, que es donde",
        "se leen estas filas, no se ve el campo detalle: solo la accion y",
        "la tabla.",
        "",
        "Y NO BASTARIA CON MOVER EL AWAIT. Mirar como esta escrita la",
        "bitacora, SRV_BitacoraService.ts, 40 lineas:",
        "",
        "  L10   @InjectRepository( BitacoraAuditoria )",
        "  L27   const bitacora = this.repo.create({ id_usuario, accion_sql,",
        "          tabla_afectada, id_registro, detalle, old_data,",
        "          new_data, ip_address, user_agent });",
        "  L38   return this.repo.save( bitacora );",
        "",
        "O sea que NO es un INSERT por dataSource.query. Es el",
        "repositorio de TypeORM, y repo.save() usa su propia conexion,",
        "que no es la del em de L390. O sea que aunque el await de",
        "L416 se metiera dentro del callback, la escritura SEGUIRIA",
        "quedando fuera de la transaccion.",
        "",
        "Para que entrara de verdad habria que pasar el em al servicio,",
        "o usar em.manager.save( bitacora ), o em.getRepository(",
        "BitacoraAuditoria ).save(...). Y L27 no lo hace.",
        "",
        "Y esto no es un caso raro: en los 24 modulos, solo DOS",
        "servicios escriben por repositorio en vez de por dataSource.",
        "Este y SRV_JWTService, L117, que hace lo mismo con la lista",
        "negra de tokens. O sea que la bitacora es una excepcion dentro",
        "de un proyecto que escribe por consulta cruda."
    ]],
    ["2. El total de la pantalla no es el total que se guarda", [
        "El total se calcula en tres sitios, y solo dos redondean.",
        "",
        "1. LA PANTALLA, L130-133, SIN REDONDEAR:",
        "",
        "  const total = lineas.reduce(",
        "    (acc, l) => acc + (Number(l.cantidad) || 0) * (Number(l.precio) || 0),",
        "    0,",
        "  );",
        "",
        "2. EL TOTAL GUARDADO, L375, CON REDONDEO:",
        "",
        "  const total = detalleRedondeado( dto.detalle );",
        "",
        "3. EL SUBTOTAL DE CADA LINEA, L407, TAMBIEN REDONDEADO:",
        "",
        "  const subtotal = redondearDos( linea.cantidad * linea.precio_unitario_compra );",
        "",
        "redondearDos, L532-534:",
        "  return Math.round((valor + Number.EPSILON) * 100) / 100;",
        "",
        "UN EJEMPLO CONCRETO, con 3 lineas de cantidad 1 y precio 0.015:",
        "",
        "  la pantalla:  0.015 * 3 = 0.045     y L324 lo pinta con",
        "                total.toFixed(2), que en V8 da 0.04",
        "  el servicio:  redondearDos(0.045) = 0.05",
        "  cada linea:   redondearDos(0.015) = 0.02, y 3 * 0.02 = 0.06",
        "",
        "O sea que hay TRES numeros distintos para la misma orden: lo que",
        "se ve, lo que se guarda en la columna total, y la suma de los",
        "subtotales que se guardan en la tabla hija. Y no cuadran entre",
        "si, con lo que la suma de las lineas no sale de la cabecera.",
        "",
        "La decision de que el servidor recalcule el total y no fiarse",
        "del cliente es CORRECTA, y hay que decirlo. Lo que no esta",
        "resuelto es que la pantalla no se entera de la diferencia: el",
        "modal se cierra, L595, y la lista se recarga, L598, con el",
        "numero del servidor. El usuario ve dos totales distintos y no",
        "tiene forma de saber por que.",
        "",
        "Y con precios de 2 decimales, L37, que es lo que valida el",
        "@IsNumber({ maxDecimalPlaces: 2 }), el caso no se da. Con",
        "decimales de mas, que es justo lo que el DTO deberia",
        "impedir y no impide del todo, si."
    ]],
    ["3. El mismo producto no se puede pedir dos veces, y el error miente", [
        "Este es el fallo real de este caso, y se puede llegar desde la",
        "pantalla en cuatro clics.",
        "",
        "LA COMPROBACION, L326-333:",
        "",
        "  const ids = detalle.map((l) => l.id_ptc);",
        "  const filas = await this.dataSource.query(",
        "    `SELECT id_ptc FROM producto_talla_color WHERE id_ptc = ANY($1::int[])`,",
        "    [ids],",
        "  );",
        "  if (filas.length !== ids.length) {",
        "    throw new UnprocessableEntityException(",
        "      'Uno de los productos seleccionados no existe.');",
        "  }",
        "",
        "EL PROBLEMA: el operador = ANY( ) de PostgreSQL devuelve UNA",
        "FILA POR ID DISTINTO, no una fila por elemento del array. O sea",
        "que filas.length es cuantos ids distintos hay, e ids.length es",
        "cuantas lineas tiene la orden.",
        "",
        "CON DOS LINEAS DEL MISMO PRODUCTO, id_ptc 5 y 5:",
        "",
        "  ids           = [5, 5]        ids.length   = 2",
        "  filas         = [{id_ptc: 5}] filas.length = 1",
        "  1 != 2        ->  422 'Uno de los productos seleccionados no existe.'",
        "",
        "Y el producto 5 existe. Y la consulta ha devuelto su fila. El",
        "error dice que no existe y lo que ha pasado es que se ha",
        "pedido dos veces.",
        "",
        "COMO SE LLEGA: la pantalla no lo impide. agregarLinea, L142-145,",
        "anade una linea sin mirar nada. cambiarProducto, L149-161, solo",
        "asigna el id_ptc. Y al elegir el mismo producto por segunda vez,",
        "cambiarProducto ademas rellena el precio con precio_base, L157,",
        "o sea que la segunda linea sale con el mismo producto y el",
        "mismo precio, lista para enviarse.",
        "",
        "NI EL ESQUEMA LO IMPIDE: en orden_compra_items, schema L290-297,",
        "no hay UNIQUE ni indice sobre ( id_orden_compra, id_ptc ). Solo",
        "un CHECK de cantidad > 0, L294.",
        "",
        "LO QUE PASARIA SI SE SOLUCIONARA MAL: si en vez de comparar",
        "longitudes se comprobara con un Set, el 422 seguiria siendo el",
        "mismo para el caso de verdad, que es un id_ptc que no esta en",
        "producto_talla_color. O sea que el mensaje tiene que cambiar.",
        "",
        "Y hay un segundo efecto, mas gordo: una orden de compra legitima",
        "pide el mismo producto en dos lineas por una razón de verdad,",
        "que son precios distintos. Unearest, L157, lo impide desde la",
        "pantalla, pero un POST a mano no. O sea que el sistema no puede",
        "expresar 'este producto a 12 Bs y este mismo a 11,5 Bs'.",
        "",
        "La consulta en si es buena, y hay que decirlo: una sola vez",
        "para N productos, con ANY y el cast ::int[], en vez de N",
        "consultas. El problema es la comparacion de la linea 331."
    ]],
    ["4. La fecha solo se mira con una regex, y no hay ningun 'Recibida'", [
        "Dos cosas de la fecha, y una de ellas deja el caso cojo.",
        "",
        "4a. LA FECHA SE VALIDA TRES VECES, Y LAS TRES SOLO DE FORMA:",
        "",
        "  el DTO, CTR_Compras L48:   @IsDateString()",
        "  el servicio, L371:         FECHA_RE.test(fecha)",
        "  la pantalla, L138:         /^\\d{4}-\\d{2}-\\d{2}$/.test(fecha)",
        "",
        "Y FECHA_RE es, L15:",
        "  const FECHA_RE = /^\\d{4}-\\d{2}-\\d{2}$/;",
        "",
        "O sea que '2026-02-31' pasa las tres, y el 31 de febrero no",
        "existe. Y la de la pantalla es una COPIA de la del servicio,",
        "escrita otra vez en el tsx en vez de importarse.",
        "",
        "Y NADA COMPARA LA FECHA CON HOY. En todo el fichero: cero",
        "NOW(), cero CURRENT_DATE fuera del NOW() del INSERT de L394, y",
        "cero comparacion con fecha_orden. O sea que se puede crear una",
        "orden cuya entrega estimada es de 1990 y el sistema la acepta.",
        "",
        "Y el valor por defecto de la pantalla es HOY, L107:",
        "  setFecha( editando?.fecha_estimada_entrega",
        "            ?? new Date().toISOString().slice(0, 10) );",
        "",
        "O sea que la fecha estimada de entrega por defecto es el dia",
        "de hoy, que en el momento de crear la orden ya es pasado.",
        "",
        "4b. Y AQUI ESTA EL AGUJERO GRANDE: NADIE PONE LA ORDEN EN",
        "    'Recibida'.",
        "",
        "La columna existe, schema L284, fecha_recepcion TIMESTAMP. Y el",
        "estado 'Recibida' lo pinta el frontend: L30 lo devuelve en",
        "verde, y L512 lo pone en OPCIONES_ESTADO con ['Ver'].",
        "",
        "PERO: buscar 'Recibida' en los 24 modulos y en las paginas",
        "devuelve solo esas dos lineas del tsx, y las dos LEEN, ninguna",
        "ESCRIBE. Y lo unico que Asigna ese estado es:",
        "",
        "  schema L811  CREATE OR REPLACE FUNCTION sp_registrar_recepcion(",
        "  schema L840    UPDATE ordenes_compra SET estado = 'Recibida',",
        "                               fecha_recepcion = NOW()",
        "",
        "Y sp_registrar_recepcion NO LA LLAMA NADIE. Contado: en los",
        "24 modulos y en las 40 paginas, cero llamadas a sp_ o a fn_.",
        "O sea que hay 8 funciones y 2 triggers en el esquema, y ni",
        "uno ni otro se invoca desde TypeScript en ningun sitio.",
        "",
        "CONSECUENCIA, y es grave: una orden creada queda en 'Pendiente'",
        "PARA SIEMPRE. Y encima la proteccion de anular una orden",
        "recibida, L503-507, es CODIGO MUERTO:",
        "",
        "  const recibida = estado.toLowerCase() === 'recibida'",
        "                  || fila.fecha_recepcion != null;",
        "  if (recibida) throw new ConflictException(",
        "    'No se puede anular una orden ya recibida.');",
        "",
        "Las dos mitades del OR son siempre falsas, porque 'Recibida' no",
        "se pone nunca y fecha_recepcion no se rellena nunca. O sea que",
        "el 409 no se puede disparar, y el que lo puso creia que si."
    ]],
    ["5. El permiso sembrado no sirve para nada", [
        "El hallazgo transversal, ya visto en CU09, CU10, CU12 y CU14,",
        "y aqui tiene un giro nuevo.",
        "",
        "EL SEED, schema L578, el unico permiso de compras que se crea:",
        "",
        "  ('Proveedor', 'Consulta ordenes de compra',",
        "   '[\"ver_ordenes_compra\"]', 'Activo'),",
        "",
        "Y ese permiso NO LO ACEPTA NINGUN ENDPOINT. Se ha comprobado",
        "uno por uno los seis metodos publicos de SRV_ComprasService, y",
        "los seis llaman a exigirPermiso:",
        "",
        "  L159  listarOrdenesCompra     L190  obtenerOrdenCompra",
        "  L254  obtenerOpciones         L379  crearOrdenCompra",
        "  L430  actualizarOrdenCompra   L486  anularOrdenCompra",
        "",
        "Y exigirPermiso, L110-115, es:",
        "",
        "  if (!(permisos.includes('*')",
        "        || permisos.includes('elaborar_orden_compra')))",
        "    throw new ForbiddenException(...);",
        "",
        "O sea que el UNICO permiso que el sistema crea para este",
        "modulo no abre ninguno de sus seis endpoints, ni los de leer.",
        "Y el que si lo abre, elaborar_orden_compra, NO esta en el",
        "seed: no aparece en ninguna linea de schema.sql.",
        "",
        "SI ESTUVIERA, el problema seria el de siempre: 15 de los 17",
        "permisos del seed no los comprueba nadie. Pero aqui es peor,",
        "porque el permiso que si se crea no sirve para nada. El rol",
        "Proveedor queda con un permiso que no abre nada, y CU05 ya",
        "demostro que el asterisco del Administrador no se puede",
        "editar desde la aplicacion.",
        "",
        "Donde si aparece elaborar_orden_compra, y aqui esta el dato",
        "interesante, es en el codigo, no en el seed:",
        "",
        "  SRV_RolesService L33   permisos: ['gestionar_proveedores',",
        "                           'evaluar_proveedores',",
        "                           'elaborar_orden_compra', ...]",
        "  web/src/data/adminMenu.ts L153   permiso: 'elaborar_orden_compra'",
        "  web/src/pages/admin/Roles.tsx L29  la etiqueta que sale en pantalla",
        "",
        "O sea que el permiso esta en la lista por defecto de un rol, en",
        "el menu y en la etiqueta. Lo que no esta es en la base de datos,",
        "que es donde se decide. El menu, ademas, esconde la pantalla si",
        "el permiso no esta, L537-539 y L631, asi que un usuario con",
        "ver_ordenes_compra no ve la pantalla Y no podria usarla aunque",
        "la viera."
    ]],
    ["6. El numero se escribe en dos pasos, y aqui si es lo correcto", [
        "Este va en positivo, porque es el patron que hay que copiar.",
        "",
        "EL PROBLEMA REAL: la columna numero es VARCHAR(20), schema",
        "L281, y el numero que se pone es 'OC-' mas el id con 6",
        "digitos. O sea 9 caracteres. Y para construirlo hace falta el",
        "id, que es un SERIAL, que no se conoce hasta que se hace el",
        "INSERT.",
        "",
        "ASI QUE HACE DOS ESCRITURAS, y lo hace bien:",
        "",
        "  L393  INSERT INTO ordenes_compra ( id_proveedor, id_sucursal,",
        "        fecha_orden, fecha_estimada_entrega, estado, total,",
        "        observaciones )          <-- 7 columnas, numero NO esta",
        "        VALUES ( ..., NOW(), $3, 'Pendiente', $4, $5 )",
        "        RETURNING id_orden_compra",
        "",
        "  L402  idOrden = fila.id_orden_compra;",
        "  L403  numero = `OC-${String(idOrden).padStart(6, '0')}`;",
        "  L404  UPDATE ordenes_compra SET numero = $2 WHERE ...",
        "",
        "Y LO IMPORTANTE: las dos estan DENTRO de la transaccion, L390.",
        "O sea que la orden sin numero existe en la base durante unos",
        "milisegundos y dentro de una transaccion abierta, que nadie",
        "puede ver. Si el UPDATE fallara, la transaccion deshacia el",
        "INSERT entero.",
        "",
        "Eso es lo que hay que distinguir de los casos donde el mismo",
        "patron esta FUERA de la transaccion, como CU06 L255 y CU07",
        "L307, que ademas afirman el estado viejo en vez de leerlo.",
        "Aqui el patron de dos escrituras es correcto y la auditoria",
        "del patron es correcta.",
        "",
        "LO QUE SI FALTA, y es pequeno: numero no tiene UNIQUE ni",
        "indice. schema L281 lo declara VARCHAR(20) a secas, y el",
        "unico indice de la tabla es idx_ordenes_proveedor, L566, que",
        "es sobre ( id_proveedor, estado ). El numero es el",
        "identificador que se imprime en el toast, L427, en la",
        "bitacora, L419, y en la pantalla de auditoria, y buscar una",
        "orden por el es un seq scan. Ademas, como no es UNIQUE, nada",
        "impide por codigo que dos ordenes compartan numero, aunque",
        "el codigo de la aplicacion no lo va a hacer nunca."
    ]],
    ["7. El loop no tiene techo, y el DTO tampoco", [
        "El unico bucle del diagrama es correcto en lo que hace y no",
        "tiene ningun limite en cuanto a cuantas vueltas da.",
        "",
        "EL LOOP, L406-413:",
        "",
        "  for (const linea of dto.detalle) {",
        "    const subtotal = redondearDos(linea.cantidad * linea.precio_compra);",
        "    await em.query(`INSERT INTO orden_compra_items ...`);",
        "  }",
        "",
        "Ni el for tiene un maximo, ni el DTO lo tiene:",
        "",
        "  CTR_Compras L51-54:",
        "    @IsArray({ message: 'Agrega al menos una linea a la orden.' })",
        "    @ValidateNested({ each: true })",
        "    @Type(() => LineaDetalleRequest)",
        "    detalle!: LineaDetalleRequest[];",
        "",
        "Hay @IsArray y @IsNotEmpty en el servicio, L309, que es lo",
        "mismo. Y NO hay @ArrayMaxSize, que es el decorador de",
        "class-validator para esto, y que acepta un numero.",
        "",
        "NI LA PANTALLA LIMITA: agregarLinea, L142-145, anade una linea",
        "cada vez que se pulsa, sin contar nada. No hay contador de",
        "maximo en ninguna parte del tsx.",
        "",
        "ASI QUE: un POST a mano con 50.000 lineas abre una transaccion",
        "y mete 50.001 INSERT. La transaccion evita que queden mitades,",
        "que es lo que hace bien, pero no evita que la peticion se",
        "cargue el servidor. Y con el ANY de L328, la consulta de",
        "validacion tambien trae 50.000 elementos.",
        "",
        "Y ADEMAS, el total se recalcula entero despues, L375:",
        "",
        "  detalle.reduce((acc, l) => acc + cantidad * precio, 0)",
        "",
        "una vez, y luego una vuelta por linea. O sea que el total se",
        "recorre dos veces: una en el reduce y otra en el for. Con dos",
        "lineas no se nota; con 50.000, el navegador ya ha colapsado",
        "antes de enviar.",
        "",
        "Y el CHECK del esquema, L294, solo mira cantidad > 0. No mira",
        "cantidad maxima, ni que el subtotal quepa en DECIMAL(10,2), ni",
        "que el total quepa en DECIMAL(12,2), L286. Un total de 10",
        "billones de bolivianos, que es lo que cabria en 12 digitos con",
        "2 decimales, revienta el INSERT con un 22003 y el mensaje no",
        "dice nada de dinero."
    ]],
    ["8. Lo que esta bien, que es mucho en este caso", [
        "Hay que decirlo, porque es el caso con mas cosas correctas de",
        "los dieciseis, y algunas son el modelo.",
        "",
        "1. LAS DOCE COLUMNAS EXISTEN. Comprobadas una a una contra el",
        "   esquema, y las dos tablas:",
        "",
        "   ordenes_compra, L393:      id_proveedor, id_sucursal,",
        "                             fecha_orden, fecha_estimada_entrega,",
        "                             estado, total, observaciones",
        "   orden_compra_items, L409:  id_orden_compra, id_ptc, cantidad,",
        "                             precio_unitario, subtotal",
        "",
        "   Cero columnas que no existan. CU14 tenia 3 de 9 en el mismo",
        "   modulo: nit_ruc, id_ciudad y condiciones_comerciales. Y CU09, CU10,",
        "   CU11 y CU12 tambien. Aqui no hay ni una.",
        "",
        "2. LA TRANSACCION DE VERDAD, L390, con las tres escrituras",
        "   dentro. Es el primero.",
        "",
        "3. LA CONSULTA DE PRODUCTOS CON ANY, L328. Una consulta para N",
        "   productos, en vez de N consultas. Con el cast ::int[] y con",
        "   el indice de la clave primaria, que es lo que toca.",
        "",
        "4. EL FILTRO DEL PROVEEDOR ESTA EN LAS DOS CAPAS. obtenerOpciones",
        "   L264 lo quita en SQL con LOWER(estado_riesgo) = 'activo', y",
        "   validarEncabezado L349 lo vuelve a comprobar en TypeScript y",
        "   da el 409 con el mensaje. En CU15 el filtro en SQL era la",
        "   unica barrera del selector, y aqui no.",
        "",
        "5. EL DOBLE REDONDEO CON EPSILON, L533:",
        "",
        "     Math.round((valor + Number.EPSILON) * 100) / 100",
        "",
        "   El EPSILON esta para que Math.round no baje en los casos",
        "   x.xxx5, que es justo lo que pasa con dinero. Es un",
        "   detalle de una linea y casi nadie lo pone.",
        "",
        "6. LA FECHA LA FIJA EL SERVIDOR, L394, con NOW() en el VALUES.",
        "   No la manda el cliente, y no la acepta. El cliente manda",
        "   fecha_estimada_entrega y ya.",
        "",
        "7. EL DELETE ANTES DE REINSERTAR en actualizarOrdenCompra,",
        "   L461, y no un UPDATE de las lineas. Junto con el ON DELETE",
        "   CASCADE del esquema, L292, y el CHECK de cantidad, L294, la",
        "   tabla hija esta bien pensada.",
        "",
        "8. Y el mensaje del 404 y el del 403 son los del Nest, con el",
        "   verbo bien puesto: 'Proveedor no encontrado.' y 'No tienes",
        "   permiso para elaborar ordenes de compra.' No hay ni un",
        "   'error inesperado' en los cinco throws del servicio."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU16."; } catch (e) { }
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
// LOS DOS FRAGMENTOS DE ESTE CASO, Y LAS BARRAS
//
// EA no coloca fragmentos de forma fiable por script, asi que lo que hay
// aqui son FORMAS con su etiqueta. Cada una va en try/catch y cuenta las
// que ha conseguido poner, y el informe final lo dice.
//
// Este caso tiene UN alt (L349) y UN loop (L406), y ningun while ni
// ningun Promise.all. Se ha contado antes de escribir.
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

// El alt de L349 cubre los mensajes 20 y 21. El loop de L406 cubre el 30
// y el 31, y se dibuja a la derecha del cuerpo para que se vea que la
// escritura se repite.
function colocarFragmentos(diag) {
    var xS = xDe(indiceDe("S"));
    var xD = xDe(indiceDe("D"));
    var xM = xDe(indiceDe("M"));
    fragmento(diag, "alt [estado_riesgo != 'activo']", xD, xS, Y_MSG0 + 19 * PASO_MSG - 34, Y_MSG0 + 20 * PASO_MSG + 16);
    fragmento(diag, "loop [por cada linea del detalle]", xS, xD, Y_MSG0 + 29 * PASO_MSG - 34, Y_MSG0 + 31 * PASO_MSG + 16);
    activacion(diag, xDe(indiceDe("C")), Y_MSG0 + 9 * PASO_MSG - 26, Y_MSG0 + 35 * PASO_MSG + 12);
    activacion(diag, xS, Y_MSG0 + 10 * PASO_MSG - 26, Y_MSG0 + 34 * PASO_MSG + 12);
    activacion(diag, xM, Y_MSG0 + 24 * PASO_MSG - 26, Y_MSG0 + 31 * PASO_MSG + 12);
}

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 700) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU16  Elaborar Orden de Compra a Proveedor"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 700) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseno de caso de uso, seccion 3.3.2.1.  10 lineas de vida, 40 mensajes, 8 hallazgos, 1 alt y 1 loop, y 3 barras de activacion."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja. Este caso tiene un alt, el de L349, que decide si el proveedor esta activo, y un loop, el de L406, que mete una linea de la orden por cada elemento del detalle. No hay ningun while ni ningun Promise.all, y se ha contado antes de dibujar. La linea de vida 'gestor de la transaccion' es el em de L390: por el pasan las tres escrituras, y es lo que las separa de la bitacora, que va fuera."; } catch (e) { }
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
// LOS 40 MENSAJES
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
    N.push("CU16  Elaborar Orden de Compra a Proveedor.  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Administrador     «actor»     quien elabora la orden");
    N.push("    AdminOrdenesCompra.tsx   «boundary»  794 lineas, el modal y el total sin redondear");
    N.push("    api.ts                  «boundary»  lib/api.ts, L1539-1546");
    N.push("    JwtAuthGuard            «control»   dependencias.ts, L15-65");
    N.push("    ValidationPipe          «control»   main.ts, L22-43, con ValidateNested sobre el array");
    N.push("    CTR_Compras             «control»   L81-100, POST con @HttpCode(CREATED)");
    N.push("    SRV_ComprasService      «control»   L306-428, 123 lineas y 8 consultas");
    N.push("    gestor de la transaccion «entity»    el em de L390, solo dentro del transaction");
    N.push("    SRV_BitacoraService     «control»   registrar() por repositorio, FUERA de la transaccion y con otra conexion");
    N.push("    PostgreSQL              «entity»    5 tablas: ordenes_compra, orden_compra_items, proveedores, sucursales, producto_talla_color");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes: 9 van a la base de datos, 17 son mensajes a si mismo, 6 son retornos y 2 salen del actor.");
    N.push("  8 de los 9 mensajes a la base de datos son consultas reales del fichero, contadas una a una: permisos, productos, proveedor, sucursal, y las tres escrituras. El noveno, el 34, no: la bitacora va por el repositorio de TypeORM.");
    N.push("  10 llevan la guarda escrita entre corchetes, y aparecen 5 codigos: 201, 403, 404, 409, 422 y tambien 401 y 500.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("LOS DOS FRAGMENTOS, Y POR QUE SOLO DOS");
    N.push("");
    N.push("  Contados ANTES de dibujar, con contadores sobre L379-L428, L306-L335 y L336-L378:");
    N.push("");
    N.push("    crearOrdenCompra:     for 1   while 0   Promise.all 0   em.query 3   dataSource.query 0");
    N.push("    validarDetalle:       for 1   if 5      throw 5        query 1        map 1");
    N.push("    validarEncabezado:    for 0   if 5      throw 5        query 2        ternarios 4");
    N.push("");
    N.push("  El LOOP es el de L406, una vuelta por linea con un INSERT por vuelta. Es el unico");
    N.push("  bucle que dibuja este diagrama, y va sobre los mensajes 30 y 31.");
    N.push("");
    N.push("  El ALT es el de L349, el estado del proveedor. Dos caminos, y dentro del primero un");
    N.push("  ternario, L351-353, que elige entre dos mensajes. Es la misma comprobacion que");
    N.push("  escribe CU15 en L271 y que aqui se consume, asi que los dos diagramas encajan.");
    N.push("");
    N.push("  Y HAY UN TERCER FOR, el de L312 de validarDetalle, que tambien es real pero NO se");
    N.push("  dibuja como fragmento: da a cuatro validaciones que no escriben nada. Se dibuja como");
    N.push("  mensajes a si mismo del 13 al 14.");
    N.push("");
    N.push("  Las barras de activacion, que no son un extra: tres, la del controlador, la del");
    N.push("  servicio y la del gestor de la transaccion, que solo existe entre L390 y L414.");
    N.push("");
    N.push("LO QUE HACE ESTE CASO, Y POR QUE ES EL MAS LIMPIO DE LOS DIECISEIS");
    N.push("");
    N.push("  1. LAS DOCE COLUMNAS DE LOS DOS INSERT EXISTEN. Comprobadas una a una contra el");
    N.push("     esquema, L277-288 y L290-297. Cero columnas que no existan. CU14 tenia 3 de 9 en");
    N.push("     este mismo modulo, CU14 L221: nit_ruc, id_ciudad y condiciones_comerciales.");
    N.push("     CU09, CU10, CU11 y CU12 tambien. Aqui no hay ni una.");
    N.push("  2. HAY UNA TRANSACCION DE VERDAD, L390, con las tres escrituras dentro. Es la");
    N.push("     primera de los dieciseis primeros casos, pero NO la primera del proyecto: hay");
    N.push("     once en cuatro servicios, y las otras diez son de pagos, reservas y ventas.");
    N.push("  3. La consulta de productos usa = ANY($1::int[]), L328. Una consulta para N");
    N.push("     productos, no N consultas. CU09 y CU12 hacian una por elemento.");
    N.push("  4. El filtro del proveedor esta en las dos capas: obtenerOpciones L264 lo quita en");
    N.push("     SQL, y validarEncabezado L349 lo vuelve a comprobar y da el 409 con el mensaje.");
    N.push("  5. redondearDos, L533, usa Number.EPSILON antes del Math.round. Es un detalle de");
    N.push("     una linea, es exactamente el que hace falta con dinero, y casi nadie lo pone.");
    N.push("");
    N.push("Y LOS TRES AGUJEROS");
    N.push("");
    N.push("  1. La transaccion existe, pero la bitacora de L416 se queda FUERA, dos lineas");
    N.push("     despues del cierre de L414. Las tres escrituras son atomicas y la cuarta no. Si la");
    N.push("     bitacora falla, la orden existe y no hay rastro de quien la creo. Y aqui duele mas");
    N.push("     que en otros casos, porque lo que se audita es a quien se le compra y cuanta");
    N.push("     mercaderia entra.");
    N.push("  2. El total de la pantalla, L130-133, NO se redondea. El que se guarda, L375, si, y");
    N.push("     el subtotal de cada linea tambien, L407. Con precios de mas de 2 decimales hay");
    N.push("     tres numeros distintos para la misma orden, y no cuadran entre si.");
    N.push("  3. El mismo producto no se puede pedir dos veces, y el error dice que no existe.");
    N.push("     L326 hace ids = detalle.map(id_ptc) y L331 compara filas.length !== ids.length.");
    N.push("     El = ANY de PostgreSQL devuelve una fila por id DISTINTO, asi que con id_ptc 5 y 5");
    N.push("     sale 1 != 2 y un 422 falso. Y la pantalla no lo impide: cambiarProducto, L149-161,");
    N.push("     solo asigna el id, y ademas rellena el precio con precio_base, L157.");
    N.push("");
    N.push("Y EL HALLAZGO 4, QUE ES EL QUE DEJA ESTE CASO COJO");
    N.push("");
    N.push("  La columna fecha_recepcion existe, schema L284, y el frontend pinta 'Recibida' en");
    N.push("  verde, L30, y la pone en OPCIONES_ESTADO, L512. PERO ningun fichero del proyecto");
    N.push("  escribe ese estado. Buscar 'Recibida' en los 24 modulos y en las paginas devuelve");
    N.push("  dos lineas, las dos del tsx, y las dos LEEN.");
    N.push("");
    N.push("  Lo unico que lo asigna es sp_registrar_recepcion, schema L811, con el UPDATE de la");
    N.push("  L840. Y no la llama nadie: en todo el TypeScript del proyecto hay cero llamadas a sp_");
    N.push("  o a fn_. Hay 8 funciones y 2 triggers en el esquema, y ninguno se invoca.");
    N.push("");
    N.push("  Consecuencia: una orden creada queda en Pendiente PARA SIEMPRE. Y la proteccion de");
    N.push("  anular una orden recibida, L503-507, es codigo muerto, porque las dos mitades del OR");
    N.push("  son siempre falsas. El 409 que wrote alguien que creia que si se podia disparar.");
    N.push("");
    N.push("  Y lo mismo con la fecha: se valida tres veces, con el DTO, con la regex del servicio");
    N.push("  y con una copia de la regex en el tsx, y las tres miran solo la forma. 2026-02-31");
    N.push("  pasa las tres. Y no hay ninguna comparacion con hoy en el fichero, asi que una orden");
    N.push("  con entrega estimada en 1990 se acepta. Y el valor por defecto de la pantalla, L107,");
    N.push("  es hoy, que ya es pasado en el momento de crearla.");
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  La transaccion de L390 cubre las tres escrituras, pero la bitacora de L416 se");
    N.push("     queda fuera. Las tres son atomicas y la cuarta no, y es la que dice quien compro.");
    N.push("     Y no arreglarla moviendo el await: la bitacora va por el repositorio de TypeORM,");
    N.push("     L27-38, que usa otra conexion, asi que hace falta em.manager.save.");
    N.push("  2  El total de la pantalla no se redondea y el que se guarda si. Con mas de 2");
    N.push("     decimales hay tres numeros para la misma orden y la suma de las lineas no sale.");
    N.push("  3  El mismo producto dos veces da un 422 que dice que no existe. La pantalla lo");
    N.push("     permite y el esquema no tiene UNIQUE. Ademas el sistema no puede expresar el");
    N.push("     mismo producto a dos precios distintos.");
    N.push("  4  La fecha se valida tres veces y las tres por la forma, y nadie la compara con");
    N.push("     hoy. Y ningun fichero pone una orden en Recibida, asi que el 409 de anular una");
    N.push("     orden recibida es codigo muerto.");
    N.push("  5  El unico permiso de compras del seed, ver_ordenes_compra, no lo acepta ninguno de");
    N.push("     los seis endpoints: los seis exigen elaborar_orden_compra, que no esta en el");
    N.push("     seed. El rol Proveedor queda con un permiso que no abre nada.");
    N.push("  6  El numero se escribe en dos pasos porque depende del SERIAL, y aqui es el");
    N.push("     patron correcto: las dos escrituras estan dentro de la transaccion. Lo que falta")
    N.push("     es que numero no es UNIQUE ni tiene indice, y es el id que se imprime por todas")
    N.push("     partes.");
    N.push("  7  El loop de L406 no tiene techo, ni el for ni el DTO con ArrayMaxSize ni la");
    N.push("     pantalla. Un POST a mano mete 50.000 INSERT en una transaccion. Y el total se");
    N.push("     recorre entero dos veces, en el reduce de L375 y en el for de L406.");
    N.push("  8  Las doce columnas existen, hay transaccion real, el ANY es una sola consulta, el");
    N.push("     filtro del proveedor esta en las dos capas, el EPSILON del redondeo esta bien");
    N.push("     puesto y la fecha la fija el servidor con NOW().");
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  CU15 escribe el estado del proveedor, L271, y CU16 lo consume en L349, con la misma");
    N.push("  consulta y el mismo nombre de columna, estado_riesgo. Los dos diagramas encajan: el");
    N.push("  alt de L271 en CU15 y el de L349 aqui son la misma comprobacion vista desde los dos");
    N.push("  lados. Y CU15 ya senalo que Bloqueado e Inactivo son indistinguibles para el");
    N.push("  comprador, y L349 es exactamente donde se ve eso.");
    N.push("");
    N.push("  Y CU14 es el mismo modulo de proveedores y el error opuesto: ahi el INSERT nombra");
    N.push("  estado donde la columna es estado_riesgo, y da 500. Aqui el SELECT y el INSERT usan");
    N.push("  los nombres reales. El autor leyo el esquema para compras y no para el alta de");
    N.push("  proveedores.");
    N.push("");
    N.push("  Y el hallazgo 4 continua el de los triggers: fn_incrementar_intentos, schema L608,");
    N.push("  ya era codigo muerto porque SRV_AuthService L64 pone el contador a 0 antes del save.");
    N.push("  Con sp_registrar_recepcion, L811, son tres funciones del esquema que no ejecuta");
    N.push("  nadie, y dos triggers. El backend tiene una capa de base de datos escrita y no");
    N.push("  conectada con la aplicacion.");
    N.push("");
    N.push("SOBRE LA COLOCACION DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Anchura: las diez cabeceras separadas " + PASO + " px, con " + ANCHO_CAB + " de ancho. Quedan");
    N.push("  65 px entre una y otra. Altura: " + PASO_MSG + " px por mensaje. El mensaje 1 cae en la y " + Y_MSG0);
    N.push("  y el " + TOTAL_MSG + " en la y " + (Y_MSG0 + (TOTAL_MSG - 1) * PASO_MSG) + ".");
    N.push("");
    N.push("  Un detalle que hizo fallar estos diagramas siete veces y que conviene no");
    N.push("  olvidar: EA guarda Top y Bottom en NEGATIVO, porque trabaja en");
    N.push("  coordenadas cartesianas con la Y creciendo hacia arriba. Si se le pasa");
    N.push("  la Y en positivo no da error, simplemente no coloca nada y todos los");
    N.push("  objetos se quedan en el mismo punto. En las dos funciones de colocacion");
    N.push("  de este script esta escrito o.Top = 0 - y y o.Bottom = 0 - y - alto. En el");
    N.push("  AddNew, en cambio, la Y va en positiva, porque ahi EA ya la convierte.");
    N.push("");
    N.push("  Comprobacion de esta ejecucion, leida del modelo de objetos:");
    N.push("    objetos en el diagrama: " + ch.leidos);
    N.push("    con la Y crecida, o sea colocados: " + ch.bien);
    N.push("    mensajes dibujados: " + r.puestos + " de " + TOTAL_MSG);
    N.push("    mensajes a si mismo: " + r.autodestino);
    N.push("    conectores en el diagrama: " + r.enDiagrama);
    N.push("    MARCOS de fragmento colocados: " + MARCOS_PUESTOS + " de 2");
    N.push("    BARRAS de activacion colocadas: " + BARRAS_PUESTAS + " de 3");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU16 Secuencia", 0); } catch (e) { }
        return;
    }
    INFORME.push("tipo de diagrama: " + tipoUsado);
    if (tipoUsado != DIAG_TIPO) ERRORES.push("el diagrama es de tipo " + tipoUsado + " y no " + DIAG_TIPO + ": las lineas de vida no se veran");
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
    T.push("CU16 - DIAGRAMA DE SECUENCIA - INFORME");
    T.push("");
    T.push("Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB);
    T.push("Tipo de diagrama: " + tipoUsado);
    T.push("Mensajes: " + r.puestos + " de " + TOTAL_MSG);
    T.push("Mensajes a si mismo: " + r.autodestino);
    T.push("Conectores en el diagrama: " + r.enDiagrama);
    T.push("Hallazgos: " + h2.total + " de " + TOTAL_HAL + ", banda hasta la y " + h2.fin);
    T.push("");
    T.push("MARCOS Y BARRAS  <-- MIRA ESTO");
    T.push("Este caso tiene 1 alt (L349) y 1 loop (L406), y ningun while ni Promise.all.");
    T.push("Contado antes de dibujar con contadores sobre los tres metodos del servicio.");
    T.push("Fragmentos colocados: " + MARCOS_PUESTOS + " de 2");
    T.push("Barras de activacion colocadas: " + BARRAS_PUESTAS + " de 3");
    if (MARCOS_PUESTOS < 2 || BARRAS_PUESTAS < 3) {
        T.push("  Si alguno sale a 0, EA no ha aceptado la forma y hay que");
        T.push("  dibujarlo a mano en el diagrama.");
    } else {
        T.push("  Los 5 han salido. Son FORMAS dibujadas por script, no");
        T.push("  fragmentos nativos de EA.");
    }
    T.push("");
    T.push("COLOCACION");
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
    msg = msg + "CU16 - Elaborar Orden de Compra a Proveedor" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "1 alt (L349) y 1 loop (L406), contados antes de dibujar." + SALTO;
    msg = msg + "FRAGMENTOS colocados: " + MARCOS_PUESTOS + " de 2." + SALTO;
    msg = msg + "BARRAS colocadas: " + BARRAS_PUESTAS + " de 3." + SALTO;
    if (MARCOS_PUESTOS < 2 || BARRAS_PUESTAS < 3) msg = msg + "  Si falta alguno, hay que dibujarlo a mano." + SALTO;
    msg = msg + SALTO;
    msg = msg + "ES EL MAS LIMPIO DE LOS DIECISEIS: las 12 columnas" + SALTO;
    msg = msg + "existen, hay transaccion de verdad y el ANY es una" + SALTO;
    msg = msg + "sola consulta para N productos." + SALTO + SALTO;
    msg = msg + "PERO: la bitacora se queda fuera de la transaccion, el" + SALTO;
    msg = msg + "total de la pantalla no se redondea, el mismo producto" + SALTO;
    msg = msg + "dos veces da un 422 que dice que no existe, y NADIE" + SALTO;
    msg = msg + "pone una orden en Recibida." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU16 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU16 Secuencia", 0); } catch (e3) { }
}
