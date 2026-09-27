// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU18  Consultar Kardex Dinamico
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/admin/AdminKardex.tsx    468 lineas
//     web/src/pages/admin/AdminAjustes.tsx   L309, el otro que llama a las opciones
//     web/src/lib/api.ts                     L1564-1581, seccion CU23
//     api/src/modulos/seguridad/dependencias.ts L15-65 JwtAuthGuard
//     api/src/modulos/inventario/CTR_Kardex.ts    42 lineas
//     api/src/modulos/inventario/SRV_KardexService.ts  296 lineas
//     BASE DE DATOS/schema.sql               L421-435, L562, L873-887
//
// QUE HACE ESTE CASO
//   Muestra el historial de movimientos de inventario de un producto en una
//   sucursal, con el saldo de cada linea y el saldo actual. Y hace tres
//   cosas que no hacia ningun caso anterior:
//
//     1  Acota la consulta a la sucursal del usuario, no a la que pida
//     2  El saldo de cada linea VIENE ALMACENADO en la fila, no se recalcula
//     3  El rango de fechas se pasa como $3::timestamp con horas extremas
//
//   40 mensajes. 10 lineas de vida. 8 hallazgos.
//   CERO fragmentos. Se explica mas abajo, con los contadores.
//
// LOS FRAGMENTOS: NINGUNO, Y SE DICE POR QUE
//   Contado antes de escribir, con contadores, sobre las 296 lineas de
//   SRV_KardexService:
//
//     for 0   while 0   Promise.all 0
//     if 15   ternarios 38   throw 9   map 3   filter 0   reduce 0
//     dataSource.query 9   transaction 0
//
//   Y las 15 lineas con OVER, ROW_NUMBER, SUM OVER o LATERAL en la consulta
//   del kardex: CERO. O sea que la consulta es plana, sin ventanas.
//
//   POR QUE NO HAY NINGUN FRAGMENTO, y hay que decirlo en vez de inventar:
//
//   - Cero for, cero while, cero Promise.all. No hay ningun bucle en el
//     servicio, ni de filas ni de paginas.
//   - Los 15 if son guardas con una sola salida cada una: permiso, falta el
//     producto, no es admin, la sucursal no existe, tres validaciones de
//     fecha, la pagina fuera de rango. Ninguno tiene dos caminos de verdad.
//   - Los 3 map son de transformation, no de control: el de L265 convierte
//     filas en movimientos, y los otros dos son de los helpers.
//   - Los 38 ternarios son de valor: ?? 0, los Math.min y Math.max de la
//     paginacion de L224-225, y el ?? del final de descripcionTipo.
//
//   Un alt se dibuja cuando hay una DECISION con dos ramas quecarry dos
//   caminos distintos. Aqui hay quince decisiones y las quince tienen un
//   unico camino: o se cumple y se sigue, o se lanza y se para.
//
//   Y las barras de activacion, que no son un extra: dos, la del
//   controlador y la del servicio.
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
var TOTAL_MSG = 40;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU18 Secuencia Kardex Dinamico";
var DIAG_NOMBRE = "CU18 Consultar Kardex Dinamico";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 146;

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
    ["U", "ACTOR_Administrador", "Actor", "Lifeline", "Administrador", "quien consulta", "Actor, no clase: es quien pulsa", "no es codigo, es la persona"],
    ["F", "AdminKardex.tsx", "Object", "Lifeline", "AdminKardex", "468 lineas", "Boundary", "web/src/pages/admin/AdminKardex.tsx, 468 lineas"],
    ["J", "AdminAjustes.tsx", "Object", "Lifeline", "AdminAjustes", "L309, el otro que pregunta", "Boundary", "web/src/pages/admin/AdminAjustes.tsx, L309, con Promise.all"],
    ["H", "api.ts", "Object", "Lifeline", "api", "L1564-1581, seccion CU23", "Boundary", "web/src/lib/api.ts, L1564-1581"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["C", "CTR_Kardex", "Object", "Lifeline", "KardexController", "42 lineas, sin DTO", "Control", "api/src/modulos/inventario/CTR_Kardex.ts, L1-42"],
    ["S", "SRV_KardexService", "Object", "Lifeline", "KardexService", "296 lineas, 9 consultas", "Control", "api/src/modulos/inventario/SRV_KardexService.ts, L141-296"],
    ["T", "DESCRIPCIONES_TIPO", "Object", "Lifeline", "DESCRIPCIONES_TIPO", "7 codigos, L40-48", "Entity", "SRV_KardexService L40-48, un Record con 7 claves"],
    ["K", "fn_kardex_producto", "Object", "Lifeline", "fn_kardex_producto", "schema L873-887, sin usar", "Entity", "BASE DE DATOS/schema.sql L873-887, la version en SQL que nadie llama"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "4 tablas y 1 indice", "Entity", "schema.sql: movimientos_inventario L421, inventario_stock L302, usuarios_empleados, sucursales; indice idx_mov_inv_ptc_suc L562"]
];

var MSG = [
    [1, "U", "F", "1. abre el Kardex Dinamico.   El menu lo declara en adminMenu L172-177: ruta /admin/inventario/kardex, etiqueta Kardex Dinamico, cu CU23, permiso consultar_kardex, icono Layers, implementado true", "S"],
    [2, "F", "F", "2. al montar carga las opciones, L142: api.obtenerOpcionesKardex()   Con 5 estados de filtro, L119-130, y useMemo para el permiso, L132-135", "S"],
    [3, "F", "F", "3. el permisoOk de L134 es permisos.includes('*') || permisos.includes('consultar_kardex')   O sea que la pantalla se oculta entera, L228-235, sin el permiso   Y ese permiso NO esta en el seed de schema.sql", "S"],
    [4, "F", "H", "4. GET /api/v1/admin/inventario/kardex/opciones   api.ts L1565-1568", "S"],
    [5, "H", "G", "5. con Authorization Bearer y credentials:'include'   Las dos rutas del kardex, la de opciones y la de consulta, pasan por el mismo guard", "S"],
    [6, "G", "D", "6. SELECT usuarios WHERE id_usuario = :sub   L44.   Una consulta por peticion, en el guard", "S"],
    [7, "G", "G", "7. [estado != 'activo'] 401 'Tu cuenta esta deshabilitada.'   L49-51", "S"],
    [8, "G", "C", "8. el guard pasa.   OJO: aqui NO hay ValidationPipe, porque no hay DTO.   CTR_Kardex L22 lee el @Query() crudo y se lo come con parseIntId, L36-42", "S"],
    [9, "C", "S", "9. obtenerOpciones( currentUser )   L11-14.   Y despues consultar( currentUser, filtro )   L16-33, con el filtro armado a mano campo por campo", "S"],
    [10, "S", "D", "10. SELECT r.permisos_json FROM usuarios JOIN usuarios_roles JOIN roles WHERE u.id_usuario = $1   L62-68.   SIN getter, sexta vez en dieciocho casos", "S"],
    [11, "S", "S", "11. [sin '*' ni 'consultar_kardex'] 403 'No tienes permiso para consultar el kardex.'   L72-77", "S"],
    [12, "S", "D", "12. SELECT id_ptc, nombre_producto, talla, color, precio_base, activo FROM producto_talla_color, y otra para la sucursal del usuario   L151 y L160-162", "S"],
    [13, "S", "C", "13. { productos, sucursales, sucursal_actual }   y el menu de la pantalla se llena   Consulta 3 de 6", "A"],
    [14, "F", "H", "14. ahora el usuario elige un producto y una sucursal, y pulsa consultar   GET /admin/inventario/kardex?id_ptc&id_sucursal&fecha_desde&fecha_hasta&pagina&limite   api.ts L1570-1581", "S"],
    [15, "H", "G", "15. con Authorization Bearer   El limite lo manda la pantalla, pero el servidor lo recorta a 100, L225", "S"],
    [16, "G", "D", "16. SELECT usuarios WHERE id_usuario = :sub   L44.   Segunda vez en el guard, y es la segunda peticion de la pantalla", "S"],
    [17, "G", "C", "17. el guard pasa otra vez   Y el pipe tampoco esta: el kardex es la unica ruta del modulo de inventario que no tiene DTO", "S"],
    [18, "C", "S", "18. consultar( currentUser, filtro )   L16-33", "S"],
    [19, "S", "D", "19. SELECT r.permisos_json ... JOIN roles   L62-68   Consulta 4 de 6   O sea que la misma consulta de permisos se hace DOS veces en la sesion, una por cada GET", "S"],
    [20, "S", "S", "20. y aqui esta lo bueno del caso: esAdministrador( usuario ), L89-92, mira si tiene el asterisco   Si lo tiene, L96-107, tiene que elegir sucursal y se comprueba que exista", "S"],
    [21, "S", "D", "21. y si NO es admin, L109-116, va a su propia sucursal: SELECT sucursal_id FROM usuarios_empleados WHERE usuario_id = $1 AND fecha_baja IS NULL   L80-84   Y si pide otra, 403 'No tienes permisos para consultar esta sucursal.'", "S"],
    [22, "S", "S", "22. [sin sucursal asignada] 403 'Tu usuario no esta asociado a una sucursal.'   L111   O sea que la sucursal la decide el servidor, no el que pregunta   Esto no lo hacia ningun caso anterior", "S"],
    [23, "S", "S", "23. [falta id_ptc] 422 'Debe seleccionar un producto.'   L207-209.   Y tres 422 mas de fecha: L214-215, L217-218, y L220-221 'La fecha desde no puede ser mayor que la fecha hasta'", "S"],
    [24, "S", "S", "24. pagina = max(1, ...), limite = min(100, max(1, ...)), offset = (pagina-1)*limite   L224-226   Y las fechas se pasan como desde + ' 00:00:00' y hasta + ' 23:59:59', L228-229, para que un dia entero sea un dia entero", "S"],
    [25, "S", "D", "25. SELECT COUNT(*) FROM movimientos_inventario WHERE id_ptc = $1 AND id_sucursal = $2 AND ($3::timestamp IS NULL OR fecha >= $3) AND ($4::timestamp IS NULL OR fecha <= $4)   L233-237   Consulta 5 de 6", "S"],
    [26, "S", "D", "26. y la consulta de verdad, L244-252: id_movimiento, fecha::text, tipo_movimiento, cantidad, COALESCE(stock_anterior, 0), COALESCE(stock_posterior, 0), referencia, id_orden_compra, id_venta, id_reserva, id_usuario   ORDER BY fecha DESC, id_movimiento DESC   LIMIT $5 OFFSET $6   Consulta 6 de 6   Y CERO funciones de ventana", "S"],
    [27, "S", "D", "27. SELECT cantidad_disponible, cantidad_reservada, cantidad_vendida FROM inventario_stock   L258-260   Una consulta aparte para el saldo actual   Y con idx_mov_inv_ptc_suc, L562, que es exactamente (id_ptc, id_sucursal, fecha), el WHERE de las dos consultas, en el mismo orden", "S"],
    [28, "S", "T", "28. descripcionTipo( tipo ), L277, que va al diccionario de L40-48   Y aqui empieza el hallazgo 1: el diccionario tiene 7 codigos y solo 3 se escriben", "S"],
    [29, "T", "T", "29. LAS 7 CLAVES DEL DICCIONARIO, L40-48: ENTRADA-COMPRA, ENTRADA-DEVOLUCION, SALIDA-VENTA, SALIDA-RESERVA, SALIDA-DEVOLUCION, AJUSTE, MERMA   CADA UNA CON SU FRASE", "S"],
    [30, "T", "T", "30. CUATRO DE LAS SIETE NO LAS ESCRIBE NADIE: ENTRADA-COMPRA, ENTRADA-DEVOLUCION, SALIDA-VENTA y SALIDA-DEVOLUCION   Y la quinta, ENTRADA-COMPRA, la escribiria sp_registrar_recepcion, pero con otro texto: 'Recepcion' con tilde, no el codigo", "S"],
    [31, "T", "T", "31. y lo que SI se escribe para las ventas es 'Venta', en Pagos L347 y L717, que NO es ninguna de las 7 claves   O sea que descripcionTipo L51 cae en su ?: y devuelve el literal 'Movimiento Venta'", "S"],
    [32, "S", "C", "32. { total, pagina, limite, id_ptc, id_sucursal, saldo_actual, movimientos }   L282-293   Y el saldo de cada linea es el stock_posterior ALMACENADO, L274, no un recalculo   Eso es lo que evita el fallo clasico del kardex con paginacion", "A"],
    [33, "C", "H", "33. el JSON con los movimientos, el total de la pagina y el saldo actual de las tres cantidades   api.ts L1579-1580", "A"],
    [34, "H", "F", "34. la respuesta.   api.ts L1570-1581", "A"],
    [35, "F", "F", "35. y aqui esta el hallazgo 2, que es de la pantalla: L32-36, cantidadSigno decide el signo mirando el TEXTO del tipo, no el signo que trae la cantidad   Para SALIDA-RESERVA hace -Math.abs(m.cantidad)", "S"],
    [36, "F", "F", "36. y hay dos de los tres SALIDA-RESERVA que NO son salidas.   Reservas L705 y L975 meten cantidad POSITIVA, porque al cerrar o anular una reserva la prenda vuelve.   El stock sube y la pantalla lo muestra con signo menos", "S"],
    [37, "F", "U", "37. el administrador ve el historial con el saldo de cada linea, el saldo disponible, reservado y vendido, y un boton de exportar CSV, L256, que pone el BOM con el uFEFF de L103   Y las ventas salen con el texto 'Movimiento Venta' y en rojo, porque badgeDe L29 cae en su return por defecto   A", "A"],
    [38, "U", "U", "38. el kardex funciona y es la pantalla mas bien hecha del modulo de inventario.   Pero el tipo de movimiento no es un catalogo: son cuatro textos que se escriben a mano en cuatro sitios, y el que mas se usa no esta en el diccionario   Y no habra ninguna entrada de mercaderia, porque CU17 no esta implementado   A", "A"],
    [39, "J", "H", "39. y hay un SEGUNDO sitio que entra en este mismo caso: AdminAjustes L309, con un Promise.all de obtenerOpcionesKardex() y listaMovimientos()   O sea que las opciones del kardex se piden desde dos pantallas, y por eso se piden sueltas y no por el caso de Ajustes", "S"],
    [40, "K", "K", "40. y el esquema tiene SU propio kardex, fn_kardex_producto, L873-887: los mismos 6 campos, pero con ORDER BY fecha ASC, que es lo contrario del DESC de L251, y sin fechas, sin paginar y sin COALESCE   Y no la llama nadie: es la septima de las ocho funciones muertas que cuento en el hallazgo 7 de CU17", "S"]
];

var HAL = [
    ["1. El diccionario de 7 codigos y los 3 que se escriben", [
        "El hallazgo de fondo, y se demuestra con dos enumeraciones.",
        "",
        "EL DICCIONARIO, SRV_KardexService L40-48, sin cambios:",
        "",
        "  const DESCRIPCIONES_TIPO: Record<string, string> = {",
        "    'ENTRADA-COMPRA':      'Entrada por compra',",
        "    'ENTRADA-DEVOLUCION':  'Entrada por devolucion',",
        "    'SALIDA-VENTA':        'Salida por venta',",
        "    'SALIDA-RESERVA':      'Salida por reserva',",
        "    'SALIDA-DEVOLUCION':   'Salida por devolucion',",
        "    AJUSTE:                'Ajuste de inventario',",
        "    MERMA:                 'Merma',",
        "  };",
        "",
        "O sea 7 codigos, con una convencion clara: ENTRADA- y SALIDA- con",
        "guion, y dos sueltos sin prefijo. Es un catalogo bien hecho.",
        "",
        "LO QUE SE ESCRIBE, los 6 INSERT sobre movimientos_inventario:",
        "",
        "  SRV_AjustesService L231   $3, que es 'AJUSTE' o 'MERMA'",
        "                              SI esta en el diccionario",
        "  SRV_PagosService   L347   'Venta'        <-- NO esta",
        "  SRV_PagosService   L717   'Venta'        <-- NO esta",
        "  SRV_ReservasService L704  'SALIDA-RESERVA'   SI esta",
        "  SRV_ReservasService L974  'SALIDA-RESERVA'   SI esta",
        "  SRV_ReservasService L1111 'SALIDA-RESERVA'   SI esta",
        "",
        "Y el septimo escritor posible, que no se ejecuta, es el de",
        "sp_registrar_recepcion L837, que mete 'Recepcion' con tilde, que",
        "tampoco es ninguna de las 7 claves.",
        "",
        "EL RESULTADO, que es lo que se ve:",
        "",
        "  4 de las 7 claves no las escribe nadie:",
        "    ENTRADA-COMPRA, ENTRADA-DEVOLUCION, SALIDA-VENTA,",
        "    SALIDA-DEVOLUCION",
        "  3 de las 7 se escriben: AJUSTE, MERMA, SALIDA-RESERVA",
        "  y el texto que mas se escribe, 'Venta', no es ninguna.",
        "",
        "O sea que la columna tipo_movimiento, VARCHAR(30) y sin CHECK, no",
        "es un catalogo. Son cuatro literales escritos a mano en cuatro",
        "ficheros, con tres convenciones distintas: guion y mayusculas",
        "para el kardex, capitalizacion normal para 'Venta', y el nombre",
        "del tipo de ajuste en la columna.",
        "",
        "Y POR QUE NO SE NOTA MÁS: descripcionTipo L51 tiene un fallback,",
        "  DESCRIPCIONES_TIPO[tipo] ?? `Movimiento ${tipo ?? '(sin tipo)'}`",
        "asi que no rompe. Solo pone 'Movimiento Venta' donde deberia poner",
        "'Salida por venta'. Un texto generico donde habia uno bueno.",
        "",
        "Y AQUI ESTA LA PRUEBA DE QUE NO ES FALTA DE ESFUERZO: el",
        "diccionario existe, esta bien hecho, y tiene el ?? para no romper.",
        "Lo que falta es que los escritores usen las claves. Y en el",
        "esquema no hay ni un CHECK ni un enum que se lo recuerde."
    ]],
    ["2. Dos de los tres SALIDA-RESERVA no son salidas, y la pantalla los muestra al reves", [
        "El hallazgo mas fino de este caso, y sale de cruzar el signo",
        "con la etiqueta.",
        "",
        "LO QUE DICEN LAS ETIQUETAS DEL LADO DEL SERVIDOR:",
        "",
        "  'SALIDA-RESERVA'  ->  'Salida por reserva'",
        "",
        "Y LA PANTALLA, AdminKardex L32-36, decide el signo con el texto:",
        "",
        "  function cantidadSigno(m: KardexMovimiento): number {",
        "    if (esEntrada(m.tipo_movimiento)) return Math.abs(m.cantidad);",
        "    if (String(m.tipo_movimiento).startsWith('SALIDA'))",
        "      return -Math.abs(m.cantidad);",
        "    return m.saldo - m.stock_anterior;",
        "  }",
        "",
        "O sea que la regla es: si el texto empieza por SALIDA, el signo",
        "es menos. Y el signo REAL lo trae la cantidad, en negativo.",
        "",
        "EL PROBLEMA, y es que los tres SALIDA-RESERVA no son lo mismo.",
        "Los tres INSERT, con su cantidad:",
        "",
        "  SRV_ReservasService L703   [.., cantidad,      ..]   L705",
        "  SRV_ReservasService L973   [.., cantidad,      ..]   L975",
        "  SRV_ReservasService L1110  [.., -linea.cantidad, ..]  L1112",
        "",
        "O sea que DOS meten cantidad POSITIVA y uno la mete NEGATIVA.",
        "Y no es un error de signo: es que las tres operaciones son",
        "distintas y las tres comparten etiqueta.",
        "",
        "  L1110  crear la reserva        -linea.cantidad   la prenda SALE",
        "  L703   cerrar la reserva       cantidad          la.prenda VUELVE",
        "  L973   anular la reserva       cantidad          la prenda VUELVE",
        "",
        "Asi que en el kardex, cada reserva que se cierra y cada reserva",
        "que se anula aparece como si la prenda SALIERA del almacen, y el",
        "stock que en realidad ha subido aparece con signo menos.",
        "",
        "Y LA ARITMETICA NO FALLA, que es lo importante. El trigger de",
        "schema L648 suma NEW.cantidad, y NEW.cantidad es positiva en esas",
        "dos, asi que inventario_stock.cantidad_disponible SUBE bien. Y el",
        "saldo de la fila, stock_posterior, tambien sale bien, porque lo",
        "calcula el mismo trigger.",
        "",
        "O sea que la base de datos esta bien y la pantalla miente. Y la",
        "pantalla miente porque CREE en la etiqueta en vez de mirar el",
        "signo, que ya viene en la misma fila.",
        "",
        "LO QUE SE VERIA, con una reserva de 3 prendas que se cierra:",
        "",
        "  L1110  tipo SALIDA-RESERVA  cantidad  -3  pantalla:  -3   ok",
        "  L703   tipo SALIDA-RESERVA  cantidad   3  pantalla:  -3   MAL",
        "",
        "O sea que el descuento de la reserva aparece dos veces, con signo",
        "menos las dos, y la devolucion no aparece. El saldo acumulado de",
        "la columna de al lado esta bien, y no cuadra con la cantidad.",
        "",
        "Y LA CAUSA DE FONDO es la misma del hallazgo 1: como no hay",
        "catalogo, la direccion esta escrita dos veces, en el texto y en",
        "el signo, y las dos pueden no coincidir. Con un catalogo, el",
        "signo se derivaria del tipo y no podrian separarse."
    ]],
    ["3. El saldo viene almacenado, y eso es lo que hace bien este caso", [
        "Esto no es un hallazgo: es lo mejor del caso, y hay que decirlo",
        "porque es el fallo clasico del kardex y aqui esta evitado.",
        "",
        "EL FALLO CLASICO: un kardex que calcula el saldo con un running",
        "total, o con SUM() OVER, se rompe en cuanto se pagina. El saldo",
        "de la linea 21 de la pagina 2 se calcula sin las 20 anteriores, y",
        "sale mal.",
        "",
        "LO QUE HACE ESTE, L245 y L274:",
        "",
        "  COALESCE(stock_anterior, 0) AS stock_anterior,",
        "  COALESCE(stock_posterior, 0) AS stock_posterior,",
        "  ...",
        "  saldo: Number(f.stock_posterior ?? 0),",
        "",
        "O sea que el saldo no se recalcula: se LEE de la fila. Y la fila",
        "lo tiene porque el trigger fn_aplicar_movimiento_inventario, L641-642,",
        "lo escribio en el BEFORE INSERT:",
        "",
        "  NEW.stock_anterior  := v_disponible;",
        "  NEW.stock_posterior := v_disponible + NEW.cantidad;",
        "",
        "Y eso tiene una consecuencia fuerte: CERO funciones de ventana.",
        "Contadas en la consulta: 0 OVER, 0 ROW_NUMBER, 0 SUM() OVER,",
        "0 LATERAL. O sea que la consulta es plana, y por eso se puede",
        "paginar con LIMIT y OFFSET sin que el saldo se rompa.",
        "",
        "ADEMAS, hay una garantia extra que no se ve: contados los UPDATE",
        "y los DELETE sobre movimientos_inventario en los 24 modulos, son",
        "CERO de cada uno. O sea que una vez escrito, un movimiento no se",
        "toca. Y como el trigger es BEFORE INSERT, un UPDATE no",
        "recalcularia los saldos, pero es que no hay UPDATE. Eso es lo que",
        "hace que el saldo almacenado sea fiable, y es una garantia que no",
        "esta escrita en ningun sitio: se cumple por casualidad.",
        "",
        "Y EL INDICE, L562:",
        "",
        "  CREATE INDEX idx_mov_inv_ptc_suc",
        "    ON movimientos_inventario (id_ptc, id_sucursal, fecha);",
        "",
        "Que es exactamente el WHERE de las dos consultas del kardex, en el",
        "mismo orden. Con el ORDER BY fecha DESC encima. O sea que el",
        "indice esta disenado para esta consulta. Pocas veces se ve eso.",
        "",
        "Y LAS COALESCE, que parecen un detalle y no lo son: sin ellas, un",
        "movimiento anterior al trigger, o de un INSERT antiguo, traeria",
        "NULL y se veria como saldo en blanco. Con ellas se ve 0, que al",
        "menos es un numero."
    ]],
    ["4. El filtro por sucursal lo pone el servidor, y es lo mejor del caso", [
        "La primera vez en dieciocho casos que el servicio acota lo que el",
        "usuario puede ver, en vez de fiarse de lo que pide.",
        "",
        "validarElegida, L94-117, y son dos caminos de verdad:",
        "",
        "  SI ES ADMIN (tiene el asterisco), L96-107:",
        "    L97   si no eligió sucursal, 422 'Debe seleccionar una",
        "          sucursal.'",
        "    L101  SELECT id_sucursal FROM sucursales WHERE id_sucursal = $1",
        "    L104  si no existe, 404 'Sucursal no encontrada.'",
        "",
        "  SI NO ES ADMIN, L109-116:",
        "    L80   SELECT sucursal_id FROM usuarios_empleados",
        "          WHERE usuario_id = $1 AND fecha_baja IS NULL",
        "    L111  si no tiene, 403 'Tu usuario no esta asociado a una",
        "          sucursal.'",
        "    L113  si pide una que no es la suya, 403 'No tienes permisos",
        "          para consultar esta sucursal.'",
        "    L116  y devuelve la suya, no la que pidio",
        "",
        "O sea que un encargado de sucursal que manipule el id_sucursal en",
        "la URL no ve nada de otras tiendas. Y el 403 de L114 dice",
        "exactamente por que.",
        "",
        "Y EL FILTRO fecha_baja IS NULL, L83, que parece un detalle: es lo",
        "que hace que un empleado dado de baja no pueda seguir viendo el",
        "kardex de su tienda por un token que aun no ha expirado.",
        "",
        "Y LA DEFINICION DE ADMIN esPermissions.includes('*'), L91. O sea",
        "que admin es exactamente lo que dice el seed del Administrador, y",
        "nadie mas. Un Encargado de Sucursal con su asterisco improbable",
        "tambien entraria por aqui, y su sucursal seria la del L80.",
        "",
        "LO QUE NO HAY, y es lo que se echa de menos: no hay un CHECK",
        "queCompare. O sea que la seguridad depende de que validarElegida",
        "se llame. Y en consultar SI se llama, L210. En obtenerOpciones no,",
        "pero ahi solo se devuelven productos publicos, L151."
    ]],
    ["5. El permiso consultar_kardex no esta en el seed, y el caso no tiene DTO", [
        "Dos cosas de fondo, una que ya se ha visto en otros casos y otra",
        "que es solo de aqui.",
        "",
        "EL PERMISO, y se ha contado en las 17 lineas de INSERT de roles",
        "del seed de schema.sql:",
        "",
        "  consultar_kardex   NO aparece en ninguna",
        "",
        "Y en el codigo aparece en 6 sitios, y todos lo TIENEN presente:",
        "",
        "  SRV_KardexService L74     el servicio lo exige",
        "  adminMenu L93             la pagina publica de disponibilidad",
        "  adminMenu L175            el kardex dinamico",
        "  AdminKardex L134          la pantalla se oculta",
        "  SRV_RolesService L29      esta en la lista por defecto de un rol",
        "  Roles.tsx L24             tiene su etiqueta en pantalla",
        "",
        "O sea que el permiso esta en el codigo por todas partes y en la",
        "base de datos por ninguna. Es el mismo patron de CU09, CU10, CU12,",
        "CU14 y CU17: el permiso existe en el papel y no en el seed. Y",
        "CU05 ya demostro que el asterisco del Administrador no se puede",
        "editar desde la aplicacion. O sea que este caso, en la practica,",
        "solo lo abre el Administrador.",
        "",
        "Y HAY UN DETALLE QUE NO ES SOLO DEL SEED: el mismo permiso",
        "consultar_kardex aparece en DOS entradas del menu con alcances",
        "distintos.",
        "",
        "  adminMenu L90-95   ruta /productos/tmu-rem-001",
        "                     etiqueta 'Disponibilidad por Sucursal'",
        "                     cu CU17   implementado true",
        "  adminMenu L172-177 ruta /admin/inventario/kardex",
        "                     etiqueta 'Kardex Dinamico'",
        "                     cu CU23   implementado true",
        "",
        "El primero es una pagina de producto, y su icono es MapPin. O",
        "sea que un permiso de inventario abre una ruta del catalogo",
        "publico, y una pagina de catalogo pide permiso de inventario. Y las",
        "dos comparten la validacion de sucursal de validarElegida, porque",
        "las dos pasan por el mismo servicio.",
        "",
        "Y EL DTO, que es la segunda cosa de este hallazgo:",
        "",
        "  CTR_Kardex L22  @Query() query: Record<string, string | undefined>",
        "  CTR_Kardex L24-32  el filtro se arma a mano, campo por campo",
        "  CTR_Kardex L36-42  function parseIntId(valor, mensaje)",
        "",
        "O sea que el pipe de main.ts, que es global y que CU12 y CU16",
        "usaron, no interviene. No hay clase DTO, no hay @IsInt, no hay",
        "exceptionFactory, y el 400 sale con el mensaje que pone el",
        "propio parseIntId:",
        "",
        "  if (!Number.isInteger(n) || n <= 0)",
        "    throw new BadRequestException(mensaje);",
        "",
        "Lo cual esta bien hecho: valida entero, valida mayor que cero, y el",
        "mensaje es concreto ('El producto no es valido.'). Es la",
        "validacion del caso CU17 y del caso CU16 hecha a mano, que es lo",
        "correcto cuando no hay DTO. Y el dates, que si son dos regex."
    ]],
    ["6. El esquema tiene su propio kardex, y es una version mas pobre", [
        "La octava funcion del esquema, y aqui se ve porque se escribio.",
        "",
        "fn_kardex_producto, schema L873-887, entera:",
        "",
        "  CREATE OR REPLACE FUNCTION fn_kardex_producto(",
        "      p_id_ptc INTEGER, p_id_sucursal INTEGER",
        "  ) RETURNS TABLE(",
        "      fecha TIMESTAMP, tipo VARCHAR, cantidad INTEGER,",
        "      stock_anterior INTEGER, stock_posterior INTEGER,",
        "      referencia VARCHAR",
        "  ) AS $$",
        "  BEGIN",
        "      RETURN QUERY",
        "      SELECT m.fecha, m.tipo_movimiento, m.cantidad,",
        "             m.stock_anterior, m.stock_posterior, m.referencia",
        "      FROM movimientos_inventario m",
        "      WHERE m.id_ptc = p_id_ptc AND m.id_sucursal = p_id_sucursal",
        "      ORDER BY m.fecha ASC;",
        "  END;",
        "  $$ LANGUAGE plpgsql;",
        "",
        "Y LA APP, SRV_KardexService L244-252, hace la misma consulta con",
        "cinco cosas mas:",
        "",
        "  la funcion   la app",
        "  --------    --------",
        "  sin fechas   fecha_desde y fecha_hasta con horas extremas",
        "  sin paginar  LIMIT y OFFSET con el limite recortado a 100",
        "  sin COALESCE  COALESCE en los dos saldos",
        "  sin id_usuario  id_usuario sale en la respuesta",
        "  sin descripcion  descripcionTipo lo pone en el mapa",
        "  ASC          DESC, y con id_movimiento de segundo",
        "",
        "LA ULTIMA FILA ES LA IMPORTANTE, y es una contradiccion de",
        "sentido: la funcion ordena ASC, cronologico, que es como se lee",
        "un libro. La app ordena DESC, del mas nuevo al mas viejo. Las dos",
        "implementan el mismo caso y no se parecen.",
        "",
        "Y NINGUNA DE LAS DOS SE USA. La funcion no la llama nadie, no",
        "tiene trigger, y es la septima de las ocho funciones muertas que",
        "CU17 conto. La app tampoco la llama: hace el RETURN QUERY a mano.",
        "",
        "O sea que el kardex esta escrito DOS VECES, en dos lenguajes, con",
        "cinco diferencias y un orden invertido, y la buena es la que no",
        "esta en el esquema.",
        "",
        "Y ADEMAS no tendria las COALESCE, o sea que devolveria NULL en",
        "los saldos viejos, y no traeria el id_usuario, que es lo que",
        "permite saber quien hizo cada movimiento. O sea que se podria",
        "haber resuelto el caso entero con una linea de SELECT en el",
        "servicio, sin la funcion, y el autor escribio las dos."
    ]],
    ["7. El mismo servicio hace la consulta de permisos dos veces por sesion", [
        "Un detalle de rendimiento que se ve al cruzar los dos GET, y que",
        "afecta a todos los casos del proyecto.",
        "",
        "  AdminKardex L142   api.obtenerOpcionesKardex()",
        "  AdminKardex L183   api.consultarKardex(filtro)",
        "",
        "Y las dos llamadas ejecutan la MISMA consulta de permisos:",
        "",
        "  obtenerOpciones  L145  await this.exigirPermiso(usuario);",
        "  consultar        L205  await this.exigirPermiso(usuario);",
        "",
        "  y exigirPermiso, L72-77, llama a cargarPermisos, L60-70:",
        "",
        "    SELECT r.permisos_json",
        "    FROM usuarios u",
        "    JOIN usuarios_roles ur ON ur.id_usuario = u.id_usuario",
        "    JOIN roles r ON r.id_rol = ur.id_rol",
        "    WHERE u.id_usuario = $1",
        "",
        "O sea que abrir la pantalla del kardex son 2 peticiones, y cada una",
        "hace: la consulta del guard, la de permisos, y la suya. Y validarElegida",
        "en consultar, L210, hace la comprobacion de esAdministrador, L95, que",
        "VUELVE A LLAMAR cargarPermisos, L90. O sea que en la segunda",
        "peticion la consulta de permisos se ejecuta DOS veces.",
        "",
        "CONTADAS LAS EJECUCIONES DE ESA CONSULTA EN UNA SESION DEL KARDEX:",
        "",
        "  peticion 1, opciones:    guard 1 + permisos 1          = 2",
        "  peticion 2, consultar:   guard 1 + permisos 1 + esAdmin 1 = 3",
        "                                                    TOTAL  = 5",
        "",
        "Cinco veces la misma consulta de roles, para mostrar un historial.",
        "",
        "Y OJO con esAdministrador, L89-92, porque tiene un detalle:",
        "",
        "  private async esAdministrador(usuario: Usuario): Promise<boolean> {",
        "    const permisos = await this.cargarPermisos(usuario);",
        "    return permisos.includes('*');",
        "  }",
        "",
        "No acepta un segundo argumento con los permisos ya cargados. O",
        "sea que la funcion que existe para no repetir la consulta es",
        "justamente la que repite la consulta. Un parámetro opcional",
        "permisos?: string[] lo arreglaba, y ademas el nombre",
        "esAdministrador dice una cosa y lo que hace es mirar si tiene el",
        "asterisco, que en el seed solo lo tiene el Administrador."
    ]],
    ["8. Lo que esta bien, que es mucho en este caso", [
        "El inventario es el modulo mas trabajado del proyecto, y este",
        "caso es la prueba. Las seis cosas.",
        "",
        "1. EL SALDO VIENE ALMACENADO, y no se recalcula nunca. Es el",
        "   fallo clasico del kardex con paginacion, evitado. Cero",
        "   funciones de ventana, cero SUM() OVER, y el saldo sale de la",
        "   fila. Y la razon por la que es fiable es que hay CERO UPDATE y",
        "   CERO DELETE sobre movimientos_inventario en los 24 modulos:",
        "   un movimiento, una vez escrito, no se toca. Y como el trigger",
        "   es BEFORE INSERT, un UPDATE no lo recalcularia. O sea que",
        "   esa garantia es real, pero se cumple por casualidad y no esta",
        "   escrita en ningun sitio.",
        "",
        "2. EL INDICE ESTA DISENADO PARA ESTA CONSULTA. L562:",
        "     (id_ptc, id_sucursal, fecha)",
        "   que es el WHERE de las dos consultas, en el mismo orden, y con",
        "   el ORDER BY por encima.",
        "",
        "3. EL FILTRO DE SUCURSAL LO PONE EL SERVIDOR, L94-117, con dos",
        "   caminos: el admin elige y se le comprueba que exista, el resto",
        "   recibe la suya aunque pida otra, con un 403 que lo dice. Y con",
        "   el fecha_baja IS NULL, L83, para que un empleado dado de baja",
        "   no siga viendo el kardex con un token vivo. Es la primera vez",
        "   que un caso acota el alcance por el usuario y no por lo que",
        "   pide.",
        "",
        "4. LAS TRES VALIDACIONES DE FECHA, L214-222, y la ultima es la",
        "   que casi nadie pone:",
        "     L220  if (fechaDesde != null && fechaHasta != null",
        "          && fechaDesde > fechaHasta)",
        "       throw new UnprocessableEntityException(",
        "         'La fecha desde no puede ser mayor que la fecha hasta.');",
        "   O sea que compara las dos fechas como texto, que con AAAA-MM-DD",
        "   es la misma cosa que compararlas como fechas. Y con el",
        "   rango al reves, el error tambien lo dice.",
        "",
        "5. EL RANGO SE PASA CON HORAS EXTREMAS, L228-229:",
        "     desde = `${fechaDesde} 00:00:00`",
        "     hasta = `${fechaHasta} 23:59:59`",
        "   Y los parametros van con cast, $3::timestamp y $4::timestamp,",
        "   L236-237, para que el IS NULL del filtro optional funcione.",
        "   Es el modo correcto de hacer un rango de dia entero sobre un",
        "   TIMESTAMP, y evita el BETWEEN con dos casting.",
        "",
        "6. Y EL LIMITE RECORTADO, L225:",
        "     const limite = Math.min(100, Math.max(1, Number(filtro.limite ?? 20)));",
        "   con el piso en 1 y el techo en 100, y el offset en L226. Y la",
        "   pagina con max(1, ...) en L224. O sea que ni un limite de 0 ni",
        "   uno de un millon, ni una pagina negativa. Y CU11 hacia lo",
        "   contrario: validaba el limite pero no el techo."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU18."; } catch (e) { }
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
// LAS BARRAS DE ACTIVACION
//
// Este caso tiene CERO fragmentos, y eso se ha contado antes de
// escribir: cero for, cero while, cero Promise.all, y 15 if que son
// todos guardas con una sola salida. Asi que aqui no hay funcion de
// fragmento a proposito, y el informe lo dice con el 0.
//
// Las barras si se dibujan, porque son parte de la notacion: dos, la del
// controlador y la del servicio.
// ---------------------------------------------------------------

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
    activacion(diag, xDe(indiceDe("C")), Y_MSG0 + 8 * PASO_MSG - 26, Y_MSG0 + 12 * PASO_MSG + 12);
    activacion(diag, xDe(indiceDe("S")), Y_MSG0 + 9 * PASO_MSG - 26, Y_MSG0 + 31 * PASO_MSG + 12);
    MARCOS_PUESTOS = 0;
}

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 860) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU18  Consultar Kardex Dinamico   ·   en el codigo del proyecto este caso es CU23"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 860) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseno de caso de uso, seccion 3.3.2.1.  10 lineas de vida, 40 mensajes, 8 hallazgos, CERO fragmentos y 2 barras de activacion."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja. Este caso NO tiene ningun fragmento, y se ha contado antes de dibujar: cero for, cero while y cero Promise.all en las 296 lineas del servicio, y quince if que son todos guardas con una sola salida. No hay ninguna rama de verdad. Las barras estrechas sobre el controlador y el servicio son las activaciones. La linea de vida DESCRIPCIONES_TIPO es el diccionario de siete codigos del tipo de movimiento, y es donde esta el hallazgo 1."; } catch (e) { }
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
// LOS 38 MENSAJES
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
    N.push("CU18  Consultar Kardex Dinamico.  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("AVISO DE NUMERACION, IGUAL QUE EN CU17");
    N.push("");
    N.push("  Este caso es CU18 en el documento y CU23 en el codigo del proyecto.");
    N.push("");
    N.push("    web/src/data/adminMenu.ts L174     cu: 'CU23',");
    N.push("    web/src/lib/api.ts L480 y L1564    // CU23 - Kardex dinamico");
    N.push("    BASE DE DATOS/schema.sql L871     -- 8. FUNCION: Kardex con saldos (CU23)");
    N.push("");
    N.push("  Y HAY UNA SEGUNDA ENTRADA AL MISMO SERVICIO QUE TAMBIEN ES CU23:");
    N.push("");
    N.push("    web/src/data/adminMenu.ts L90-95   ruta /productos/tmu-rem-001");
    N.push("                                      etiqueta 'Disponibilidad por Sucursal'");
    N.push("                                      cu CU17   permiso consultar_kardex");
    N.push("");
    N.push("  O sea que el mismo permiso, el mismo servicio y el mismo filtro de");
    N.push("  sucursal sirven para un caso de inventario y para una pagina de producto.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Administrador   «actor»     quien consulta");
    N.push("    AdminKardex.tsx       «boundary»  468 lineas, con el exportador de CSV");
    N.push("    AdminAjustes.tsx      «boundary»  L309, el otro que pide las opciones del kardex");
    N.push("    api.ts                «boundary»  L1564-1581, seccion CU23");
    N.push("    JwtAuthGuard          «control»   dependencias.ts, L15-65, dos veces por sesion");
    N.push("    CTR_Kardex            «control»   42 lineas, sin DTO y sin ValidationPipe");
    N.push("    SRV_KardexService     «control»   296 lineas, 9 consultas, sin transacciones");
    N.push("    DESCRIPCIONES_TIPO    «entity»    L40-48, un Record con 7 claves");
    N.push("    fn_kardex_producto    «entity»    schema L873-887, la version en SQL que nadie usa");
    N.push("    PostgreSQL            «entity»    movimientos_inventario, inventario_stock, usuarios_empleados, sucursales");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes. 9 van a la base de datos, 15 son mensajes a si mismo, 6 son retornos,");
    N.push("  4 llevan la guarda escrita entre corchetes, y 3 tocan al actor.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("CERO FRAGMENTOS, Y NO ES UNA CARENCIA: ES QUE NO LOS HAY");
    N.push("");
    N.push("  Contados ANTES de dibujar, sobre las 296 lineas de SRV_KardexService:");
    N.push("");
    N.push("    for 0   while 0   Promise.all 0   filter 0   reduce 0");
    N.push("    if 15   ternarios 38   throw 9   map 3");
    N.push("    dataSource.query 9   transaction 0");
    N.push("    Y en la consulta del kardex: 0 OVER, 0 ROW_NUMBER, 0 SUM OVER, 0 LATERAL");
    N.push("");
    N.push("  POR QUE NO SE DIBUJA NINGUNO:");
    N.push("");
    N.push("  - Cero for, cero while, cero Promise.all. No hay ningun bucle en el servicio, ni de");
    N.push("    filas ni de paginas. La consulta es plana y se pagina con LIMIT y OFFSET.");
    N.push("  - Los 15 if son guardas con una sola salida: permiso, falta el producto, no es admin,");
    N.push("    la sucursal no existe, tres validaciones de fecha, y la pagina fuera de rango.");
    N.push("    Ninguno tiene dos caminos de verdad.");
    N.push("  - Los 3 map son de transformacion de datos, no de control de flujo.");
    N.push("  - Los 38 ternarios son de valor: los ?? 0, los Math.min y Math.max de la paginacion");
    N.push("    de L224-225, y el ?? del final de descripcionTipo, L51.");
    N.push("");
    N.push("  Un alt se dibuja cuando hay una DECISION con dos caminos. Aqui hay quince");
    N.push("  decisiones y las quince tienen un unico camino: o se cumple y se sigue, o se lanza.");
    N.push("");
    N.push("  Y las barras de activacion, que no son un extra: dos, la del controlador y la del");
    N.push("  servicio, las dos unicas lineas de vida con codigo propio de este caso.");
    N.push("");
    N.push("EL HALLAZGO 1: EL DICCIONARIO TIENE 7 CODIGOS Y SE ESCRIBEN 3");
    N.push("");
    N.push("  DESCRIPCIONES_TIPO, L40-48, un catalogo bien hecho con convencion clara:");
    N.push("");
    N.push("    ENTRADA-COMPRA      Entrada por compra");
    N.push("    ENTRADA-DEVOLUCION  Entrada por devolucion");
    N.push("    SALIDA-VENTA        Salida por venta");
    N.push("    SALIDA-RESERVA      Salida por reserva");
    N.push("    SALIDA-DEVOLUCION   Salida por devolucion");
    N.push("    AJUSTE              Ajuste de inventario");
    N.push("    MERMA               Merma");
    N.push("");
    N.push("  LO QUE SE ESCRIBE, los 6 INSERT sobre movimientos_inventario:");
    N.push("");
    N.push("    SRV_AjustesService L231   $3, que es AJUSTE o MERMA     SI esta");
    N.push("    SRV_PagosService   L347   'Venta'                      NO esta");
    N.push("    SRV_PagosService   L717   'Venta'                      NO esta");
    N.push("    SRV_ReservasService L704  'SALIDA-RESERVA'             SI esta");
    N.push("    SRV_ReservasService L974  'SALIDA-RESERVA'             SI esta");
    N.push("    SRV_ReservasService L1111 'SALIDA-RESERVA'             SI esta");
    N.push("");
    N.push("  O sea que 4 de las 7 claves no las escribe nadie, y el texto que mas se escribe,");
    N.push("  'Venta', no es ninguna de las 7. Con el fallback de L51 no rompe: solo pone");
    N.push("  'Movimiento Venta' donde deberia poner 'Salida por venta'.");
    N.push("");
    N.push("  Y el septimo escritor posible, sp_registrar_recepcion L837, mete 'Recepcion' con");
    N.push("  tilde, que tampoco es ninguna de las 7. Y no se ejecuta, por el hallazgo de CU17.");
    N.push("");
    N.push("  La columna tipo_movimiento es VARCHAR(30) sin CHECK y sin enum. No es un catalogo:");
    N.push("  son cuatro literales escritos a mano en cuatro ficheros, con tres convenciones");
    N.push("  distintas, y el mas usado no esta en el diccionario.");
    N.push("");
    N.push("EL HALLAZGO 2: DOS DE LOS TRES SALIDA-RESERVA NO SON SALIDAS");
    N.push("");
    N.push("  Los tres INSERT de reservas, con su cantidad:");
    N.push("");
    N.push("    L1110  crear la reserva      -linea.cantidad   la prenda SALE");
    N.push("    L703   cerrar la reserva     cantidad          la prenda VUELVE");
    N.push("    L973   anular la reserva     cantidad          la prenda VUELVE");
    N.push("");
    N.push("  Y la pantalla decide el signo por el TEXTO del tipo, AdminKardex L32-36: si");
    N.push("  empieza por SALIDA, el signo es menos. O sea que cada reserva que se cierra y cada");
    N.push("  reserva que se anula aparece como si la prenda saliera del almacen, con signo menos,");
    N.push("  y la devolucion no aparece por ningun lado.");
    N.push("");
    N.push("  LA ARITMETICA NO FALLA, que es lo importante. El trigger de L648 suma NEW.cantidad,");
    N.push("  y en esas dos es positiva, asi que cantidad_disponible SUBE bien. Y stock_posterior");
    N.push("  tambien sale bien, porque lo calcula el mismo trigger. O sea que la base de datos");
    N.push("  esta bien y la pantalla miente, y miente porque cree en la etiqueta en vez de mirar");
    N.push("  el signo, que ya viene en la misma fila.");
    N.push("");
    N.push("  Y LA CAUSA DE FONDO es la del hallazgo 1: como no hay catalogo, la direccion esta");
    N.push("  escrita dos veces, en el texto y en el signo, y pueden no coincidir.");
    N.push("");
    N.push("EL HALLAZGO 3: EL SALDO VIENE ALMACENADO, Y ESO ES LO QUE LO HACE BIEN");
    N.push("");
    N.push("  El fallo clasico del kardex es calcular el saldo con un running total o con");
    N.push("  SUM() OVER, que se rompe en cuanto se pagina: la linea 21 de la pagina 2 se");
    N.push("  calcula sin las 20 anteriores. Aqui no hay ni una funcion de ventana, y L274 hace:");
    N.push("");
    N.push("    saldo: Number(f.stock_posterior ?? 0),");
    N.push("");
    N.push("  O sea que el saldo se LEE de la fila. Y lo tiene porque el trigger lo escribio en el");
    N.push("  BEFORE INSERT, L641-642. Por eso se puede paginar con LIMIT y OFFSET sin que el");
    N.push("  saldo se rompa, y eso no lo hace ningun otro caso del proyecto.");
    N.push("");
    N.push("  Y ADEMAS hay una garantia que no esta escrita en ningun sitio: contados los UPDATE y");
    N.push("  los DELETE sobre movimientos_inventario en los 24 modulos, CERO de cada uno. Como");
    N.push("  el trigger es BEFORE INSERT, un UPDATE no recalcularia los saldos, y es que no hay");
    N.push("  UPDATE. O sea que el saldo almacenado es fiable por casualidad, no por diseño.");
    N.push("");
    N.push("  Y EL INDICE ESTA DISENADO PARA ESTA CONSULTA, L562:");
    N.push("");
    N.push("    CREATE INDEX idx_mov_inv_ptc_suc");
    N.push("      ON movimientos_inventario (id_ptc, id_sucursal, fecha);");
    N.push("");
    N.push("  Que es el WHERE de las dos consultas, en el mismo orden, con el ORDER BY encima.");
    N.push("");
    N.push("EL HALLAZGO 4: EL FILTRO DE SUCURSAL LO PONE EL SERVIDOR");
    N.push("");
    N.push("  Primera vez en dieciocho casos que el servicio acota lo que el usuario puede ver en");
    N.push("  vez de fiarse de lo que pide. validarElegida, L94-117:");
    N.push("");
    N.push("    si es admin:      L97  sin sucursal, 422.  L101 comprueba que exista, L104 404");
    N.push("    si no es admin:   L80  SELECT sucursal_id FROM usuarios_empleados");
    N.push("                            WHERE usuario_id = $1 AND fecha_baja IS NULL");
    N.push("                     L111 sin sucursal, 403.  L113 si pide otra, 403");
    N.push("                     L116 y devuelve la suya, no la que pidio");
    N.push("");
    N.push("  Un encargado que manipule el id_sucursal en la URL no ve nada de otras tiendas.");
    N.push("  Y el fecha_baja IS NULL, L83, es lo que hace que un empleado dado de baja no siga");
    N.push("  viendo el kardex con un token que aun no ha expirado.");
    N.push("");
    N.push("EL HALLAZGO 5: EL PERMISO NO ESTA EN EL SEED, Y ESTE CASO NO TIENE DTO");
    N.push("");
    N.push("  consultar_kardex no aparece en ninguna de las 17 lineas de INSERT de roles del");
    N.push("  seed, y en cambio aparece en 6 sitios del codigo, todosACGERTANDOSE de que existe:");
    N.push("  el servicio L74, el menu L93 y L175, la pantalla L134, la lista por defecto de un");
    N.push("  rol L29, y su etiqueta en Roles.tsx L24. Es el mismo patron de CU09, CU10, CU12,");
    N.push("  CU14 y CU17. Y CU05 ya demostro que el asterisco del Administrador no se puede");
    N.push("  editar desde la aplicacion, asi que en la practica solo lo abre el Administrador.");
    N.push("");
    N.push("  Y ADEMAS el mismo permiso aparece en DOS entradas del menu con alcances distintos: la");
    N.push("  pagina publica de disponibilidad, que es CU17, y el kardex dinamico, que es CU23.");
    N.push("  Un permiso de inventario abre una ruta del catalogo publico.");
    N.push("");
    N.push("  Y ESTE CASO NO TIENE DTO. CTR_Kardex L22 lee el @Query() crudo y arma el filtro a");
    N.push("  mano, L24-32, con un parseIntId propio, L36-42, que valida entero y mayor que cero y")
    N.push("  devuelve un 400 con el mensaje que el pone el. O sea que el ValidationPipe de main.ts")
    N.push("  no interviene en esta ruta, y el 400 sale como cadena y no como el array de CU12.")
    N.push("");
    N.push("EL HALLAZGO 7: LA CONSULTA DE PERMISOS SE EJECUTA 5 VECES POR SESION");
    N.push("");
    N.push("  Abrir la pantalla son 2 peticiones, AdminKardex L142 y L183, y las dos llaman a");
    N.push("  exigirPermiso, L145 y L205, que llama a cargarPermisos, L60-70. Y en la segunda,");
    N.push("  validarElegida L210 llama a esAdministrador L95, que VUELVE a llamar cargarPermisos,");
    N.push("  L90. Sumando el guard de cada peticion:");
    N.push("");
    N.push("    peticion 1, opciones:   guard 1 + permisos 1                 = 2")
    N.push("    peticion 2, consultar:  guard 1 + permisos 1 + esAdmin 1     = 3")
    N.push("                                                                TOTAL = 5")
    N.push("");
    N.push("  Y esAdministrador, L89-92, es justamente la funcion que existe para no repetir la")
    N.push("  consulta y la repite, porque no acepta un segundo argumento con los permisos ya")
    N.push("  cargados. Y su nombre dice una cosa y lo que hace es mirar si tiene el asterisco.")
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  El diccionario de 7 codigos y los 3 que se escriben. 4 claves no las escribe nadie, y el")
    N.push("     texto mas usado, 'Venta', no es ninguna. La columna es VARCHAR(30) sin CHECK.");
    N.push("  2  Dos de los tres SALIDA-RESERVA son entradas, no salidas, y la pantalla las muestra con")
    N.push("     signo menos porque decide por el texto. La aritmetica del trigger es correcta.")
    N.push("  3  El saldo viene almacenado y no se recalcula nunca, con cero funciones de ventana. Eso")
    N.push("     evita el fallo clasico del kardex con paginacion. Y no hay ni un UPDATE ni un DELETE")
    N.push("     sobre la tabla, que es lo que lo hace fiable, aunque no este escrito en ninguna parte.");
    N.push("  4  El filtro de sucursal lo pone el servidor con dos caminos, y es la primera vez que un")
    N.push("     caso acota el alcance por el usuario y no por lo que pide. Con fecha_baja IS NULL.")
    N.push("  5  El permiso consultar_kardex no esta en el seed, y el mismo permiso abre una pagina de")
    N.push("     producto. Y este caso no tiene DTO, asi que el ValidationPipe no interviene.")
    N.push("  6  El esquema tiene su propio kardex, fn_kardex_producto L873-887, con orden ASC frente al")
    N.push("     DESC de la app, sin fechas, sin paginar y sin COALESCE. Y no la llama nadie.")
    N.push("  7  La consulta de roles se ejecuta 5 veces por sesion, y esAdministrador, que existe para")
    N.push("     no repetirla, la repite porque no acepta los permisos ya cargados.");
    N.push("  8  El indice esta disenado para esta consulta, el rango de fechas usa horas extremas con")
    N.push("     cast, las tres fechas se validan y la tercera compara las dos entre si, y el limite")
    N.push("     tiene suelo en 1 y techo en 100.");
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  CU17 demostro que el caso de recepcion no existe y que por eso el kardex no va a");
    N.push("  tener NINGUNA entrada de mercaderia. O sea que este caso, que es el libro de");
    N.push("  movimientos del almacen, no tendra ni una sola linea de ENTRADA-COMPRA. Solo");
    N.push("  ajustes, mermas, ventas y reservas. Y tres de los siete codigos del diccionario seran");
    N.push("  los unicos que aparezcan, mas el 'Venta' que no es ninguna clave.");
    N.push("");
    N.push("  Y el otro agujero de CU17 se nota aqui: los 6 INSERT de movimientos_inventario no");
    N.push("  rellenan id_orden_compra, ninguno de los 6. Y este caso, que es el sitio donde se");
    N.push("  veria, tiene la columna en la respuesta, L246, y la guarda en referencia_id, L267.");
    N.push("  O sea que el hueco de CU17 se ve en la linea del kardex, y lo que sale es un null.");
    N.push("");
    N.push("SOBRE LA COLOCACION DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Anchura: las diez cabeceras separadas " + PASO + " px, con " + ANCHO_CAB + " de ancho. Quedan");
    N.push("  65 px entre una y otra. Altura: " + PASO_MSG + " px por mensaje. El mensaje 1 cae en la y " + Y_MSG0);
    N.push("  y el " + TOTAL_MSG + " en la y " + (Y_MSG0 + (TOTAL_MSG - 1) * PASO_MSG) + ".");
    N.push("");
    N.push("  Un detalle que hizo fallar estos diagramas nueve veces y que conviene no");
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
    N.push("    MARCOS de fragmento colocados: " + MARCOS_PUESTOS + " de 0, porque no los hay");
    N.push("    BARRAS de activacion colocadas: " + BARRAS_PUESTAS + " de 2");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU18 Secuencia", 0); } catch (e) { }
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

    if (BARRAS_PUESTAS == 0) colocarFragmentos(diag);
    diag = guardarYRecargar(diag);

    var ch = comprobar(diag);
    INFORME.push("objetos: " + ch.leidos + ", colocados: " + ch.bien);
    INFORME.push("primeras coordenadas: " + ch.muestra);

    notasDelDiagrama(diag, r, h2, ch);

    var T = [];
    T.push("CU18 - DIAGRAMA DE SECUENCIA - INFORME");
    T.push("");
    T.push("Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB);
    T.push("Tipo de diagrama: " + tipoUsado);
    T.push("Mensajes: " + r.puestos + " de " + TOTAL_MSG);
    T.push("Mensajes a si mismo: " + r.autodestino);
    T.push("Conectores en el diagrama: " + r.enDiagrama);
    T.push("Hallazgos: " + h2.total + " de " + TOTAL_HAL + ", banda hasta la y " + h2.fin);
    T.push("");
    T.push("FRAGMENTOS  <-- MIRA ESTO");
    T.push("Este caso tiene CERO fragmentos, y no es una carencia del script.");
    T.push("Contado antes de dibujar sobre las 296 lineas del servicio:");
    T.push("  for 0   while 0   Promise.all 0   filter 0   reduce 0");
    T.push("  if 15   ternarios 38   throw 9   map 3");
    T.push("  y en la consulta: 0 OVER, 0 ROW_NUMBER, 0 SUM OVER, 0 LATERAL");
    T.push("Los 15 if son guardas con una sola salida. No hay ninguna rama de verdad.");
    T.push("MARCOS colocados: " + MARCOS_PUESTOS + " de 0");
    T.push("Barras de activacion colocadas: " + BARRAS_PUESTAS + " de 2");
    if (BARRAS_PUESTAS < 2) {
        T.push("  Si las barras salen a 0, EA no ha aceptado la forma y hay que");
        T.push("  dibujarlas a mano en el diagrama.");
    } else {
        T.push("  Las 2 barras han salido. Son FORMAS dibujadas por script.");
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
    msg = msg + "CU18 - Consultar Kardex Dinamico" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO;
    msg = msg + "En el codigo del proyecto este caso es CU23." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "CERO fragmentos: no hay ni un for, ni un while, ni un" + SALTO;
    msg = msg + "Promise.all, y los 15 if son guardas de una salida." + SALTO;
    msg = msg + "BARRAS colocadas: " + BARRAS_PUESTAS + " de 2." + SALTO;
    if (BARRAS_PUESTAS < 2) msg = msg + "  Si faltan, hay que dibujarlas a mano." + SALTO;
    msg = msg + SALTO;
    msg = msg + "EL HALLAZGO 1: el diccionario de 7 codigos del tipo de" + SALTO;
    msg = msg + "movimiento y solo 3 se escriben. El texto que mas" + SALTO;
    msg = msg + "se usa, 'Venta', no es ninguna de las 7 claves, asi que" + SALTO;
    msg = msg + "cada venta sale como 'Movimiento Venta'." + SALTO;
    msg = msg + "Y dos de los tres SALIDA-RESERVA son ENTRADAS, porque al" + SALTO;
    msg = msg + "cerrar o anular una reserva la prenda vuelve, y la" + SALTO;
    msg = msg + "pantalla las muestra con signo menos." + SALTO + SALTO;
    msg = msg + "LO BUENO: el saldo viene almacenado y no se recalcula," + SALTO;
    msg = msg + "el indice esta disenado para esta consulta, y el" + SALTO;
    msg = msg + "filtro de sucursal lo pone el servidor." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU18 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU18 Secuencia", 0); } catch (e3) { }
}
