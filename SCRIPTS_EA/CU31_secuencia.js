// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU31 (en tu documento)  Actualizar Inventario Tras Venta (Automático)
//
// AVISO DE NUMERACIÓN, Y AQUÍ HAY QUE MIRAR LAS DOS COSAS
//   1. El TÍTULO de este caso es el CU39 del documento que hay en la
//      carpeta del proyecto, "2.2 Casos de Uso.md" L79:
//
//        | CU39 | Actualizar inventario tras venta (automático) | Alto |
//
//      y el CU31 de ese mismo documento es OTRO caso, que es
//      "Confirmar recepción del cliente en el vestidor físico",
//      L66.   O sea que el número y el título no van juntos en
//      ningún sitio del proyecto.
//
//   2. En el CÓDIGO este caso no tiene número.   No hay endpoint, no
//      hay servicio, no hay método y no hay pantalla.   Es lo único
//      que hace de la serie que NO tiene ninguno de los cuatro.
//
//   ESTE DIAGRAMA DIBUJA EL CASO QUE DESCRIBE EL TÍTULO, que es el
//   CU39 del proyecto.   Si lo que querías era el CU31 del
//   documento, ese es el vestidor, y avísame.
//
// QUE SE DIBUJA Y DE DONDE SALE
//   Sale del código, y de una parte del código que no es TypeScript:
//
//     BASE DE DATOS/schema.sql   L302-311  inventario_stock
//     BASE DE DATOS/schema.sql   L384-398  ventas
//     BASE DE DATOS/schema.sql   L399-406  venta_items
//     BASE DE DATOS/schema.sql   L421-435  movimientos_inventario
//     BASE DE DATOS/schema.sql   L628-652  fn_aplicar_movimiento_inventario
//     BASE DE DATOS/schema.sql   L654-657  trg_movimiento_inventario
//     BASE DE DATOS/schema.sql   L237-244  producto_talla_color, L242 el estado
//     api/.../pagos/SRV_PagosService.ts  L340-349 y L709-719, los INSERT
//     api/.../reservas/SRV_ReservasService.ts  L703, L973 y L1110
//     api/.../inventario/SRV_AjustesService.ts  L231-235
//     web/src/pages/admin/AdminKardex.tsx   L32-36, como se lee
//     "2.2 Casos de Uso.md"                   L79, el caso
//     "Detalle CU Ciclo 2.md"                L172-183, el detalle
//
// QUE HACE ESTE CASO
//   Es el UNICO caso de la serie sin persona.   El documento lo dice,
//   L178: "ACTORS | Sistema (backend NestJS, transaccion automatica)
//   como unico ejecutor. No interviene ningun usuario".
//
//   Y EL MOTOR REAL NO ESTA EN NINGUN SITIO DE TYPESCRIPT.   El
//   stock no lo baja el backend: lo baja un trigger de PostgreSQL.
//
//     1  El backend inserta una fila en movimientos_inventario con la
//        cantidad en NEGATIVO, y no hace nada mas.
//     2  PostgreSQL dispara trg_movimiento_inventario, BEFORE INSERT.
//     3  La funcion lee el disponible, escribe el antes y el despues
//        en la propia fila del movimiento, y suma la cantidad a
//        inventario_stock.
//
//   O SEA QUE LA MITAD DEL CASO QUE ESTA EN PL/PGSQL, Y LA QUE
//   MUEVE EL STOCK, NO SE VE LEYENDO EL CODIGO DE LA APLICACION.
//
//   Y CONTADAS TODAS LAS ESCRITURAS DE LAS DOS COLUMNAS QUE EL
//   DOCUMENTO DICE QUE SON LAS DE ESTE CASO, en los 147 ficheros
//   .ts y .tsx del prototipo y en todo el esquema:
//
//     cantidad_disponible   2 sitios:  el trigger, schema L648, que es
//                                     el de este caso,  y
//                                     SRV_ReservasService L710, que es
//                                     OTRO caso y encima suma otra vez
//     cantidad_vendida      2 sitios:  Pagos L341, la caja, y L711,
//                                     el digital.   Y en el esquema
//                                     NINGUNO, en ninguna de las ocho
//                                     funciones
//
//   27 mensajes. 9 lineas de vida. 8 hallazgos.
//   CERO fragmentos. Explicado mas abajo, y es la primera vez que
//   pasa en la serie.
//
// CERO FRAGMENTOS, Y POR QUE, QUE ES LO MAS LLAMATIVO DEL CASO
//   Contado ANTES de dibujar, con contadores, sobre LAS DOS
//   implementaciones que hay en el esquema.   Y el truco esta en que
//   la palabra LOOP sale DOS VECES por bucle, una en el "FOR .. LOOP"
//   y otra en el "END LOOP", asi que hay que restar:
//
//     fn_aplicar_movimiento_inventario  L628-652   LA VIVA
//       LOOP 0   END LOOP 0   WHILE 0   RETURNS TRIGGER
//
//     sp_registrar_venta     L662-727   MUERTA   LOOP 4  END LOOP 2   = 2
//     sp_registrar_reserva   L728-773   MUERTA   LOOP 2  END LOOP 1   = 1
//     sp_registrar_devolucion L774-810  MUERTA   LOOP 2  END LOOP 1   = 1
//     sp_registrar_recepcion L811-847   MUERTA   LOOP 2  END LOOP 1   = 1
//     fn_detectar_stock_bajo L848-872   MUERTA   LOOP 0  END LOOP 0   = 0
//     fn_kardex_producto     L873-892   MUERTA   LOOP 0  END LOOP 0   = 0
//
//   O SEA QUE HAY CINCO BUCLES EN EL ESQUEMA, Y LOS CINCO ESTAN EN
//   CUATRO FUNCIONES QUE NADIE EJECUTA.
//
//   Y EL CONTEO DE LLAMADAS, que es lo que decide:
//
//     de las 8 funciones del esquema, solo UNA esta viva:
//       fn_aplicar_movimiento_inventario, que es la del trigger de L654
//       y es de este caso
//
//     y las otras SIETE, o no tienen trigger o el trigger esta
//       duplicado en TypeScript:
//       fn_incrementar_intentos, L608, tiene el trigger de L620, pero
//         SRV_AuthService L61-64 hace lo mismo en codigo
//       sp_registrar_venta, sp_registrar_reserva,
//       sp_registrar_devolucion, sp_registrar_recepcion,
//       fn_detectar_stock_bajo, fn_kardex_producto
//         CERO llamadas desde el codigo, contadas en los 147
//         ficheros .ts y .tsx del prototipo
//
//   POR ESO ESTE CASO TIENE CERO BUCLES Y CERO ALTS, Y NO ES QUE NO
//   LOS TENGA: ES QUE LOS QUE TIENE ESTAN MUERTOS.
//
//   Y CERO ALTS TAMBIEN, aunque la funcion tenga un IF, L637, que
//   comprueba si el disponible es nulo.   Eso no es un alt: las dos
//   ramas hacen lo mismo, que es sumar la cantidad.   Y el
//   ON CONFLICT DO UPDATE de L647-648, que si es dos caminos, es una
//   clausula de SQL y no una decision del caso de uso.
//
// LAS 2 BARRAS: la del backend y la del trigger, que este ultimo
//   esta dentro de la base de datos y se dibuja como una activacion
//   del lifeline del motor.
//
// LA Y EN NEGATIVO, QUE ES LO QUE HACE FALLAR ESTOS DIAGRAMAS
//   EA guarda Top y Bottom en NEGATIVO. Si se le pasa la Y en
//   positivo no da error: simplemente no coloca nada.
//
//     o.Top    = 0 - y;
//     o.Bottom = 0 - y - alto;
//
//   Y en el AddNew, en cambio, la Y va en POSITIVA.
//
// LOS MARCOS DICEN SOBRE QUE ELEMENTO ESTAN
//   La pestaña lleva el tipo, el elemento y la condicion, y el
//   elemento se saca de las coordenadas con lifelineEnX().
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

var TOTAL_CAB = 9;
var TOTAL_MSG = 27;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU31 Secuencia Actualizar Inventario Automatico";
var DIAG_NOMBRE = "CU31 Actualizar Inventario Automatico";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 150;

var X_NOTA = 2430;
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
    ["A", "ACTOR_Sistema", "Actor", "Lifeline", "Sistema", "sin persona", "Actor, no clase: es el propio sistema", "NO ES CÓDIGO. Es el actor de este caso, que es el único de la serie que no es una persona. El documento lo dice en L178 y L179: Sistema (backend NestJS, transacción automática) como único ejecutor. No interviene ningún usuario"],
    ["P", "SRV_PagosService", "Object", "Lifeline", "PagosService", "el que dispara el caso", "Control", "api/src/modulos/pagos/SRV_PagosService.ts, 784 líneas. L715-718 el INSERT que dispara el trigger en el camino digital, y L345-349 el de la caja. Y son CU35 y CU37, que se dibujan aparte"],
    ["V", "venta_items", "Object", "Lifeline", "venta_items", "de donde salen las prendas", "Entity", "schema.sql L399-406. El caso NO la lee: el backend ya le pasó las prendas resueltas en el INSERT del movimiento"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "el motor, con el trigger", "Entity", "schema.sql, y en este caso el centro de todo: L628-652 la función viva, L654-657 su trigger, y L648 la única escritura de cantidad_disponible del proyecto que está en el motor"],
    ["T", "trg_movimiento_inventario", "Object", "Lifeline", "trg_movimiento_inventario", "BEFORE INSERT", "Entity", "schema.sql L654-657. Cuatro lineas: el nombre, BEFORE INSERT ON movimientos_inventario, FOR EACH ROW, y el EXECUTE FUNCTION"],
    ["F", "fn_aplicar_movimiento_inventario", "Object", "Lifeline", "fn_aplicar_movimiento_inventario", "25 lineas, sin bucles", "Entity", "schema.sql L628-652. CERO bucles, contados con LOOP y END LOOP. Y es la UNICA de las ocho funciones del esquema que esta viva"],
    ["S", "inventario_stock", "Object", "Lifeline", "inventario_stock", "la tabla que se actualiza", "Entity", "schema.sql L302-311, con sus cuatro cantidades y el UNIQUE de L310. Y sin ningun CHECK, lo cual es el hallazgo 1"],
    ["M", "movimientos_inventario", "Object", "Lifeline", "movimientos_inventario", "el kardex", "Entity", "schema.sql L421-435, 15 lineas y 13 columnas. Y tres de ellas, stock_anterior, stock_posterior y fecha, las rellena el trigger y no el codigo"],
    ["K", "producto_talla_color", "Object", "Lifeline", "producto_talla_color", "estado_stock", "Entity", "schema.sql L237-244, con estado_stock VARCHAR(20) DEFAULT 'Disponible' en L242. Y es el hallazgo 2: esa columna NO LA ESCRIBE NADIE en el proyecto entero"]
];

var MSG = [
    [1, "A", "P", "1. el actor de este caso es el propio sistema, y no hay ninguna persona delante de la pantalla.   El documento lo dice en L178 y L179: el backend, al confirmarse el pago de una venta, CU35 o CU37, y marcarse la venta como Completada.   O sea que este caso no tiene quien lo dispare, se dispara solo", "A"],
    [2, "P", "V", "2. y lo primero que se lee son las venta_items de la venta, schema.sql L399-406, con L288-292 y L659-663 como las dos consultas que las traen.   OJO: este lifeline no recibe NINGUN mensaje de este caso.   El backend no las consulta aqui, porque en el camino de CU35 y CU37 ya las leyo antes, en el bucle del stock.   Es la unica tabla del diagrama que solo se mira", "A"],
    [3, "P", "M", "3. y aqui esta TODO lo que hace el codigo de este caso: un INSERT en movimientos_inventario, L715-718, con tipo 'Venta', la cantidad NEGATIVA, -cantidad, la referencia VNT-NNN, el usuario y el id de la venta.   Y ya esta.   UNA sentencia.   Volveremos a esto en el hallazgo 1", "A"],
    [4, "P", "P", "4. y sigue dentro de la misma transaccion, que abre con dataSource.transaction en L647 y se cierra sola al cerrarse el callbacks.   O sea que si el trigger falla, la venta entera se deshace.   Eso es lo que el documento promete en L177 punto f, y es verdad.   Y la caja abre la suya en L276, y tambien cierra sola", "A"],
    [5, "M", "T", "5. y aqui PostgreSQL hace lo que el codigo no hace: salta el trigger.   L654-657, y son CUATRO lineas: CREATE TRIGGER, BEFORE INSERT ON movimientos_inventario, FOR EACH ROW, y EXECUTE FUNCTION fn_aplicar_movimiento_inventario()   O SEA QUE ES UN BEFORE, o sea que la funcion se ejecuta ANTES de que la fila exista, y por eso puede modificarla", "A"],
    [6, "T", "F", "6. y el motor llama a la funcion, que es la unica viva de las ocho del esquema: fn_aplicar_movimiento_inventario, L628-652   Con su comentario de L626-627: Trigger: Recalcular stock en movimiento de inventario", "A"],
    [7, "F", "S", "7. y lo primero que hace es LEER: SELECT cantidad_disponible INTO v_disponible FROM inventario_stock WHERE id_ptc = NEW.id_ptc AND id_sucursal = NEW.id_sucursal, L633-635   Consulta 1.   Y OJO: es un SELECT a secas, SIN FOR UPDATE y sin ningun otro candado.   Volveremos a esto en el hallazgo 6", "A"],
    [8, "F", "F", "8. y el unico IF del caso, L637-639: [no hay fila de inventario para esa prenda en esa sucursal] v_disponible := 0.   O SEA QUE LAS DOS RAMAS HACEN LO MISMO DESPUES, que es restar o sumar la cantidad.   No es un alt", "A"],
    [9, "F", "M", "9. y aqui la funcion se MODIFICA A SI MISMA, y eso es lo que puede hacer por ser un BEFORE INSERT: NEW.stock_anterior := v_disponible, L641, y NEW.stock_posterior := v_disponible + NEW.cantidad, L642   O sea que el ANTES y el DESPUES del stock quedan guardados en la propia fila del movimiento, sin que nadie los escriba.   Es lo unico del esquema que guarda la foto del antes y despues", "A"],
    [10, "F", "M", "10. y la tercera columna que se rellena sola, L643: NEW.fecha := NOW()   O sea que la fecha no la pone el codigo del INSERT, la pone el trigger.   El DEFAULT de L434 es NOW() tambien, pero el trigger lo pisa siempre", "S"],
    [11, "F", "S", "11. y aqui esta la ESCRITURA que mueve el stock de verdad, L645-648: INSERT INTO inventario_stock ( id_ptc, id_sucursal, cantidad_disponible ) VALUES ( NEW.id_ptc, NEW.id_sucursal, NEW.cantidad ) ON CONFLICT ( id_ptc, id_sucursal ) DO UPDATE SET cantidad_disponible = inventario_stock.cantidad_disponible + NEW.cantidad   Consulta 2.   Y COMO LA CANTIDAD ES NEGATIVA, RESTA", "A"],
    [12, "F", "F", "12. y el ON CONFLICT, L647, tiene dos salidas de verdad, y no es un alt del caso: si no existia fila la CREA, con la cantidad de la venta, que es negativa, y si existia la SUMA.   O sea que una prenda sin fila de inventario NACE con disponible negativo, y eso lo nadie lo comprueba.   Y funciona por el UNIQUE de L310, que es lo unico que lo hace posible.   Volveremos a esto en el hallazgo 1", "A"],
    [13, "F", "M", "13. y RETURN NEW, L650, que devuelve la fila modificada y la da por buena.   Con eso termina la funcion y el BEFORE INSERT termina, y la fila se inserta con las tres columnas ya rellenadas.   Y el motor sigue con el siguiente movimiento si lo hay", "A"],
    [14, "M", "D", "14. y aqui vuelve el motor, y el INSERT original ya esta hecho.   O SEA QUE EL CASO TERMINA SIN QUE NINGUN MENSAJE VUELVA AL CODIGO.   El backend no espera resultado, no lee nada y no se entero.   El caso es un fuego y olvidasse", "A"],
    [15, "P", "P", "15. y el backend sigue su camino, que es el bucle de CU35 y CU37: el siguiente bucle, y el cierre de la transaccion de L721.   Y si el motor hubiera fallado, el error habria subido por la transaccion y la venta no se habria completado.   O sea que la garantia de que no hay venta sin descuento la da la transaccion del caso anterior, no este", "A"],
    [16, "P", "K", "16. y aqui esta el hallazgo 2 del diagrama, y es una consulta que NO LLEGA A HACERSE.   El documento, L176 punto d, pide: actualizar producto_talla_color.estado_stock con la regla Sin stock si disponible mas reservada es 0, Bajo si disponible es menor o igual que stock_minimo_alert, y Disponible si no.   Y NINGUN SITIO DEL PROYECTO ESCRIBE ESA COLUMNA.   Contadas todas las escrituras de estado_stock en los 147 ficheros .ts y .tsx y en el esquema: CERO", "A"],
    [17, "K", "K", "17. y la columna tiene DEFAULT 'Disponible', schema.sql L242.   O sea que se queda SIEMPRE en Disponible, para siempre, desde el INSERT que hizo SRV_ProductosService L198   Y eso importa porque 6 sitios la usan para decidir si hay stock: Carrito L246, Reservas L1197, L330 y L383, y Ventas L197 y L315.   Volveremos a esto en el hallazgo 2", "A"],
    [18, "A", "D", "18. y aqui el caso se multiplica, y hay que decirlo porque el titulo dice tras VENTA y no es verdad.   El trigger no es de la venta: es BEFORE INSERT sobre movimientos_inventario, L655, y por lo tanto se dispara con CUALQUIER movimiento, de los 6 INSERT vivos del proyecto", "A"],
    [19, "D", "M", "19. y los 6 INSERT vivos, contados fichero por fichero, y son de 3 casos distintos:   SRV_PagosService L346, el camino de la caja, que es CU37   SRV_PagosService L716, el camino digital, que es CU35   SRV_ReservasService L703, L973 y L1110, que son CU28 y CU29   SRV_AjustesService L231, que es CU24   Volveremos a esto en el hallazgo 3", "A"],
    [20, "D", "M", "20. y los TIPOS de movimiento que travels con eso, que son cuatro y ninguno empieza por ENTRADA:   'Venta', en los dos de Pagos   'SALIDA-RESERVA', en los tres de Reservas   'AJUSTE' y 'MERMA', en el de Ajustes, con un ternario en L193   O sea que el Kardex tiene cuatro tipos vivos y siete funciones del esquema que meten otros cuatro, que no se usan nunca", "A"],
    [21, "M", "F", "21. y para cada uno de esos movimientos, el motor repite los trece mensajes del 5 al 13.   O SEA QUE EL CASO NO SE EJECUTA UNA VEZ POR VENTA, SE EJECUTA UNA VEZ POR LINEA DE VENTA_ITEM.   Con seis prendas son seis ejecuciones del trigger, con seis bloqueos de fila y seis INSERT en inventario_stock", "A"],
    [22, "A", "D", "22. y la otra mitad de este caso, la que NO se dibuja aqui: la cantidad_vendida.   El trigger, L645-648, SOLO toca cantidad_disponible.   Y cantidad_vendida la escribe el codigo, en un UPDATE aparte, Pagos L709-714 en el digital y L339-344 en la caja   Contadas todas las escrituras de esa columna en el proyecto: 2, y las 2 aqui.   Y en el esquema NINGUNA, en ninguna de las ocho funciones", "A"],
    [23, "A", "D", "23. y lo que NO hace NINGUNO de los dos: cantidad_reservada.   El documento, L176 punto c, lo pide: si el item proviene de una prenda reservada, trasladar cantidad_reservada menos cantidad y cantidad_vendida mas cantidad.   Y eso no lo hace el trigger, no lo hace el codigo del pago, y no lo hace ninguna de las cuatro funciones muertas del esquema.   Volveremos a esto en el hallazgo 4", "A"],
    [24, "A", "D", "24. y tampoco comprueba que el disponible quede positivo.   El documento lo prohibe, L176: nunca permitiendo que cantidad_disponible quede negativo, si el saldo no alcanza la transaccion entera se revierte.   Y el trigger resta y punto, L648.   Y la tabla no tiene CHECK, ni indice mas alla del UNIQUE, y el esquema entero no tiene NI UN ALTER TABLE.   Volveremos a esto en el hallazgo 1", "A"],
    [25, "D", "S", "25. y para cerrar el recorrido del caso: SELECT cantidad_disponible, cantidad_reservada, cantidad_vendida FROM inventario_stock WHERE id_ptc = $1 AND id_sucursal = $2, que es lo que lee el Kardex, SRV_KardexService L258-262.   O sea que las tres columnas se leen juntas para el informe, pero solo DOS se escriben, y cada una en un sitio distinto", "S"],
    [26, "D", "M", "26. y el Kardex los lee con su nombre cambiado, L274: saldo: Number(f.stock_posterior ?? 0).   O sea que lo que la pantalla llama saldo es la columna stock_posterior, y lo que llama stock_anterior es stock_anterior.   Las dos las relleno el trigger.   Volveremos a esto en el hallazgo 5", "A"],
    [27, "A", "D", "27. fin del caso.   Y aqui hay que decir la paradoja: este caso se llama Actualizar Inventario Tras Venta, y no existe en el codigo.   No hay ningun servicio, ningun endpoint, ningun metodo y ninguna pantalla.   Lo que hay es UN TRIGGER de 25 lineas en el esquema, y la mitad del trabajo, la cantidad_vendida, repartida en TypeScript por dos casos distintos.   Y el resto del trabajo lo hace mal el caso de las reservas, que es el hallazgo 3", "A"]
];

var HAL = [
    ["1. El disponible puede quedar negativo y nadie lo comprueba", [
        "El hallazgo más grave del apartado de integridad, y sale de",
        "leer la funciónTrigger entera, que son 25 líneas.",
        "",
        "  L645-648, la única escritura del caso:",
        "",
        "    INSERT INTO inventario_stock (id_ptc, id_sucursal,",
        "                                cantidad_disponible)",
        "    VALUES (NEW.id_ptc, NEW.id_sucursal, NEW.cantidad)",
        "    ON CONFLICT (id_ptc, id_sucursal)",
        "    DO UPDATE SET cantidad_disponible =",
        "      inventario_stock.cantidad_disponible + NEW.cantidad;",
        "",
        "NO HAY NINGÚN IF, NINGÚN RAISE, NINGÚN GREATEST Y NINGÚN",
        "CLAMP.   La cantidad se suma y punto.",
        "",
        "Y LO QUE LO CONTRASTE, y hay que ponerlo porque el",
        "documento dice L176 que nunca debe pasar:",
        "",
        "  nunca permitiendo que cantidad_disponible quede negativo",
        "  (si el saldo no alcanza, la transacción entera se revierte)",
        "",
        "Y LA COMPROBACIÓN ESTÁ, PERO EN OTRO LUGAR:",
        "",
        "  Pagos L312-316     la caja,   disponible < cantidad -> 409",
        "  Pagos L680-686     el digital, la misma comparación",
        "  Reservas L1102-1107  antes del INSERT de la reserva",
        "  Ventas L480-488     el punto de venta",
        "",
        "O SEA QUE LA VALIDACIÓN ESTÁ ANTES DE ESCRIBIR, EN EL CODIGO,",
        "Y NUNCA DESPUÉS, EN EL MOTOR.   Eso funciona para los dos",
        "casos de pago, porque ambos validan y luego insertan en la",
        "MISMA transacción.",
        "",
        "PERO HAY TRES CAMINOS QUE INSERTAN SIN VALIDAR:",
        "",
        "  1  EL ON CONFLICT, CUANDO LA FILA NO EXISTE.   L646 mete",
        "     NEW.cantidad tal cual, y si es una venta es NEGATIVA.",
        "     O sea que una prenda sin fila de inventario_stock nace",
        "     con disponible -3, y PostgreSQL lo acepta porque no hay",
        "     CHECK.   Y el CASE lo resuelve sin mirar nada.",
        "",
        "  2  SRV_AjustesService L231, que es CU24.   L198 decide el",
        "     signo: la MERMA es -Math.abs(cantidad) y el AJUSTE es",
        "     la cantidad que venga, SIN comprobar contra el stock.   Y",
        "     si el ajuste es negativo, es una merma que no se ha",
        "     validado, y pasa por el trigger igual.",
        "",
        "  3  Y CUALQUIER MOVIMIENTO FUTURO.   El trigger es BEFORE",
        "     INSERT sobre la tabla, L655, o sea que no distingue el",
        "     tipo.   Cualquiera que meta una fila mañana resta.",
        "",
        "Y LA TABLA NO PROTEGE, y esto hay que decirlo con la cuenta:",
        "inventario_stock, L302-311, tiene PRIMARY KEY y UNIQUE, y no",
        "tiene NI UN CHECK.   Y el esquema entero tiene UN solo CHECK,",
        "que es el de carrito_items.cantidad > 0, y CERO ALTER TABLE.",
        "",
        "CONSECUENCIA, y es de negocio: una prenda puede tener",
        "cantidad_disponible en negativo, y las existencias consolidadas",
        "de CU26 lo enseñan, y el Kardex lo enseña, y el que compre se",
        "lleva una prenda que ya no existe.   La garantía de que eso no",
        "pasa está en cuatro líneas de TypeScript que solo cubren dos",
        "de los seis sitios que mueven el stock."
    ]],
    ["2. estado_stock no lo escribe nadie, y seis módulos lo usan para decidir si hay stock", [
        "El hallazgo que más daña de la serie, porque no es que",
        "falte algo: es que HAY una columna y todo el mundo cuenta",
        "con ella.",
        "",
        "EL DOCUMENTO LO PIDE, L176 punto d:",
        "",
        "  actualizar producto_talla_color.estado_stock con la regla:",
        "  si (cantidad_disponible + cantidad_reservada) = 0 → 'Sin stock';",
        "  si cantidad_disponible <= stock_minimo_alert (>0) → 'Bajo';",
        "  si no → 'Disponible';",
        "",
        "Y LA COLUMNA EXISTE, schema.sql L237-244, y L242:",
        "",
        "  estado_stock  VARCHAR(20) DEFAULT 'Disponible'",
        "",
        "PERO CONTADAS TODAS LAS ESCRITURAS DE ESA COLUMNA EN LOS 147",
        "FICHEROS .ts Y .tsx DEL PROTOTIPO Y EN TODO EL ESQUEMA:",
        "",
        "  CERO.  Ni una sola vez se le asigna un valor distinto del",
        "  DEFAULT.  El único sitio que la nombra al escribir es",
        "  SRV_ProductosService L198, que es el INSERT que la crea.",
        "",
        "O SEA QUE ESTÁ SIEMPRE EN 'Disponible', PARA SIEMPRE, DESDE",
        "QUE NACIÓ.",
        "",
        "Y AQUÍ ESTÁ EL DAÑO, porque la usan para DECIDIR, en 6 sitios:",
        "",
        "  SRV_CarritoService    L246   if (estado_stock === 'sin stock')",
        "                                    rechaza la prenda del carrito",
        "  SRV_ReservasService  L1197   if (estado_stock !== 'disponible')",
        "                                    rechaza la prenda de la reserva",
        "  SRV_ReservasService   L330   WHERE estado_stock = 'Disponible'",
        "  SRV_ReservasService   L383   WHERE estado_stock = 'Disponible'",
        "  SRV_VentasService     L197   if (estado_stock !== 'Disponible')",
        "                                    rechaza la prenda del POS",
        "  SRV_VentasService     L315   WHERE estado_stock <> 'Sin stock'",
        "",
        "Y OJO CON QUE LAS COMPARACIONES NO COINCIDEN ENTRE SI:",
        "Carrito L246 busca 'sin stock' en minuscula, y Reservas L1197",
        "busca 'disponible' en minuscula, y la columna tiene 'Disponible'",
        "y 'Sin stock' con mayuscula.   O sea que dos de las seis",
        "comparaciones no pueden ser ciertas NUNCA, por mayusculas, ni",
        "aunque alguien escribiera la columna.   Y las otras cuatro si",
        "que lo serian, si la columna cambiara alguna vez.",
        "",
        "TODAS ESAS COMPARACIONES CON 'Disponible' SON SIEMPRE CIERTAS,",
        "PORQUE NUNCA CAMBIA.   O sea que las validaciones de",
        "disponibilidad no están validando nada.",
        "",
        "CONSECUENCIA, y es la que se ve: una prenda con",
        "cantidad_disponible = 0 sigue con estado_stock = 'Disponible', y",
        "",
        "  -  la ACEPTAN las cuatro validaciones que la leen",
        "  -  la ACEPTAN el carrito, la reserva y el punto de caja",
        "  -  y NO LA MUESTRA el módulo de recomendaciones, porque",
        "     SRV_RecomendacionesService L197-198 sí mira la cantidad",
        "     de verdad, con un EXISTS sobre inventario_stock.",
        "",
        "O SEA QUE EL CATÁLOGO, EL CARRITO, LA RESERVA Y LA CAJA OFRECEN",
        "PRENDAS AGOTADAS, Y LAS RECOMENDACIONES NO.   Y el único",
        "sitio del proyecto que comprueba el stock de verdad es el que",
        "nadie audita, porque es una recomendación.",
        "",
        "LO QUE LO ARREGLA: escribir el estado_stock en el trigger, que",
        "ya está dentro y ya sabe las dos cantidades, con las tres",
        "reglas del documento.   Serían cuatro líneas en L648, y",
        "harían correctas las 6 validaciones de golpe."
    ]],
    ["3. Finalizar una reserva devuelve el stock disponible DOS VEZES", [
        "El hallazgo más grave de negocio del caso, y es el más nuevo",
        "de la serie.   Sale de contar las escrituras de",
        "cantidad_disponible en TODO el proyecto, y son solo dos:",
        "",
        "  1  schema.sql L648, que es el trigger de este caso",
        "",
        "  2  SRV_ReservasService L710, que es de otro caso, y encima",
        "     es un ' + ' sobre un movimiento que el trigger ya ha",
        "     sumado.",
        "",
        "O SEA QUE HAY UN SOLO PUNTO DEL CÓDIGO QUE SUMA EL DISPONIBLE",
        "FUERA DEL TRIGGER, Y EL TRIGGER TAMBIÉN LO SUMA.   Y en el",
        "mismo bucle.",
        "",
        "EL SITIO ES ESTE, y son 17 líneas, L697-714:",
        "",
        "  for (const item of items) {",
        "    const cantidad = Number(item.cantidad ?? 0);",
        "    if (cantidad <= 0) continue;",
        "    prendas += cantidad;",
        "    await em.query(",
        "      `INSERT INTO movimientos_inventario (... tipo_movimiento,",
        "       cantidad, ...)",
        "       VALUES ($1, $2, 'SALIDA-RESERVA', $3, $4, $5, $6)`,",
        "      [item.id_ptc, idSucursal, cantidad, `Cierre ${numero}`,",
        "       usuario.id_usuario, idReserva],",
        "    );",
        "    await em.query(",
        "      `UPDATE inventario_stock",
        "       SET cantidad_reservada = GREATEST(0, cantidad_reservada - $3),",
        "           cantidad_disponible = cantidad_disponible + $3",
        "       WHERE id_ptc = $1 AND id_sucursal = $2`,",
        "      [item.id_ptc, idSucursal, cantidad],",
        "    );",
        "  }",
        "",
        "PASO A PASO, CON 2 PRENDAS RESERVADAS:",
        "",
        "  -  L703-705 inserta el movimiento con cantidad POSITIVA, +2.",
        "     El trigger lo ve y hace L648: disponible + 2.",
        "",
        "  -  L708-711 hace disponible + 2 OTRA VEZ, a mano.",
        "",
        "  -  TOTAL: +4 por dos prendas.   Y cantidad_reservada baja",
        "     bien, -2, con el GREATEST de L709.",
        "",
        "Y LO PEOR NO ES EL DOBLE, ES PARA QUE CASO ES:",
        "",
        "  L682  private async liberarStockReserva(",
        "  L861  la llama FINALIZAR RESERVA, L826, que es el momento",
        "        en que el cliente SE LLEVA LA PRENDA.",
        "",
        "  L860  UPDATE reservas SET estado = 'Cumplida'",
        "",
        "O SEA QUE ESTE TROZO DE CÓDIGO SE EJECUTA CUANDO LA ROPA SALE",
        "DE LA TIENDA, Y SU EFECTO EN EL DISPONIBLE ES DEVOLVERLA AL",
        "ARMARIO, Y DEVUELVERLA DOS VECES.   Y nunca resta, y nunca",
        "toca cantidad_vendida, que es la columna que diria quantas se",
        "han vendido, y que solo se escribe en 2 sitios del proyecto,",
        "Pagos L341 y L711, los dos de cobro.",
        "",
        "Y COMPARADO CON LOS OTROS DOS CAMINOS DE RESERVA, que hacen",
        "cosas distintas, en la misma tabla y con el mismo tipo de",
        "movimiento:",
        "",
        "  crearReserva    L1001  L1110-1112   movimiento -cantidad, o sea",
        "                       el trigger RESTA el disponible, y L1117",
        "                       suma la reservada.   CORRECTO: la prenda",
        "                       sale del armario a la reserva.",
        "",
        "  cancelar        L910   L972-975     movimiento +cantidad, o sea",
        "                       el trigger SUMA el disponible, y L979",
        "                       solo baja la reservada.   CORRECTO: la",
        "                       prenda vuelve al armario, y UNA vez.",
        "",
        "  finalizarReserva L826  L703-705     movimiento +cantidad, el",
        "                       trigger suma, y L710 suma OTRA vez.",
        "                       INCORRECTO: y además la prenda no",
        "                       vuelve, porque el cliente se la lleva.",
        "",
        "O SEA QUE DE LOS TRES CAMINOS, EL QUE ESTÁ MAL ES EL ÚNICO",
        "QUE NO DEVOLVE NADA, Y ES EL ÚNICO QUE DOBLA.",
        "",
        "CONSECUENCIA, y es de negocio directo: cada vez que una",
        "reserva se finaliza, el disponible de esa prenda en esa sucursal",
        "se infla en el doble.   Con veinte reservas de dos unidades,",
        "el catálogo forty más prendas de las que existen, y por el",
        "hallazgo 2 el catálogo ni se entero, porque mira el",
        "estado_stock, que no lo escribe nadie.",
        "",
        "Y EL ARREGLO, que es de una línea: L710 no debería existir.   O",
        "el movimiento de L703 debería llevar la cantidad con el signo",
        "que corresponde y L710 sobra, o al revés.   Pero NO pueden",
        "las dos.   Y el GREATEST de L709 sí está bien, porque evita",
        "que la reservada baje de cero."
    ]],
    ["4. El traslado de la reserva, que el documento pide y nadie hace", [
        "El hallazgo que ya conocemos de CU27 y CU29, y que aquí",
        "toca de lleno porque este caso es el que debería",
        "arreglarlo.",
        "",
        "EL DOCUMENTO LO PIDE, L176 punto c:",
        "",
        "  si el ítem proviene de una prenda reservada en esa",
        "  sucursal (la venta presencial de CU31/CU36 atiende la",
        "  reserva CU28), el stock se traslada: cantidad_reservada =",
        "  cantidad_reservada - cantidad y cantidad_vendida =",
        "  cantidad_vendida + cantidad;",
        "",
        "Y NINGÚN SITIO LO HACE:",
        "",
        "  -  El trigger, L645-648, solo toca cantidad_disponible.",
        "  -  El codigo del pago, ni en el digital (L709-714) ni en",
        "     la caja (L339-344), solo cantidad_vendida.",
        "  -  Y sp_registrar_reserva, L761, que es la unica funcion",
        "     del esquema que escribe la reservada, es una de las",
        "     cuatro MUERTAS.",
        "",
        "CONTADO EN TODO EL PROYECTO, LA COLUMNA SE ESCRIBE EN CUATRO",
        "SITIOS, y solo TRES están en el mismo fichero:",
        "",
        "  Reservas L1117   crearReserva          mas",
        "  Reservas L709    liberarStockReserva   menos, con GREATEST",
        "  Reservas L979    cancelar              menos, con GREATEST",
        "  schema.sql L761  sp_registrar_reserva  mas, en la MUERTA",
        "",
        "NINGUNO ESTA EN UN CAMINO DE PAGO.   Ni el digital ni la",
        "caja tocan la reservada, y este caso, que es el que",
        "descontaría, tampoco.   Y OJO: el segundo de los tres, el",
        "L709, es el del hallazgo 3, que además suma el disponible.",
        "",
        "CONSECUENCIA, y es la misma de CU27 y CU29 pero vista desde",
        "el unico sitio que podria arreglarla:",
        "",
        "  -  La prenda se vende y la reserva sigue Activa.",
        "  -  Y cuando se cancela esa reserva, su movimiento de",
        "     cantidad POSITIVA devuelve el disponible, y el stock",
        "     queda inflado para siempre.",
        "",
        "Y AQUI EL DATO NUEVO: el documento no solo pide el traslado,",
        "sino que lo pide CONCRETO, diciendo que la venta presencial",
        "atiende la reserva CU28.   O sea que el autor del documento",
        "sabía que ese caso tenía que existir.   Y el codigo lo sabe",
        "tambien, porque el SELECT de CU35 trae cantidad_reservada, L670,",
        "y el de la caja NO, L299.   O sea que la divergencia está",
        "dentro del mismo proyecto y a 40 líneas una de otra."
    ]],
    ["5. El Kardex invierte el signo de las tres salidas de reserva", [
        "Un hallazgo de presentación, y es el que se ve en la",
        "pantalla, pero la causa está repartida entre tres autores",
        "y el trigger en medio.",
        "",
        "AdminKardex.tsx, L32-36, y son cinco líneas:",
        "",
        "  function cantidadSigno(m) {",
        "    if (esEntrada(m.tipo_movimiento)) return Math.abs(m.cantidad);",
        "    if (String(m.tipo_movimiento).startsWith('SALIDA'))",
        "      return -Math.abs(m.cantidad);",
        "    return m.saldo - m.stock_anterior;",
        "  }",
        "",
        "Y LA SEGUNDA RAMA, la de SALIDA, multiplica por -1 SIEMPRE,",
        "sin mirar lo que hay en la base.   Y los tres movimientos",
        "SALIDA-RESERVA NO ESTÁN ESCRITOS IGUAL:",
        "",
        "  Reservas L1112   crear          -linea.cantidad   NEGATIVO",
        "  Reservas L705    cerrar          cantidad        POSITIVO",
        "  Reservas L975    cancelar        cantidad        POSITIVO",
        "",
        "ASI QUE LOS TRES SALEN CON EL SIGNO CONTRARIO AL GUARDADO:",
        "",
        "  crear    base -2   pantalla -Math.abs(-2) = +2   MAL",
        "  cerrar   base +2   pantalla -Math.abs(+2) = -2   MAL",
        "  cancelar base +2   pantalla -Math.abs(+2) = -2   MAL",
        "",
        "O SEA QUE LAS TRES SALIDAS DE RESERVA DEL KARDEX SALEN CON EL",
        "SIGNO INVERTIDO.   Y la del cierre y la de la cancelación son",
        "de Returns, así que además de inverted se muestran como",
        "salidas de stock que nunca salieron.   Y la de crear, que si",
        "es una salida de verdad, se muestra como una entrada.",
        "",
        "Y LA TERCERA RAMA, la del return, no la salva: para 'Venta' y",
        "'AJUSTE' devuelve m.saldo - m.stock_anterior, y como saldo es",
        "stock_posterior, SRV_Kardex L274, eso da NEW.cantidad, que",
        "si es negativo sale negativo.   O sea que la VENTA se ve",
        "bien y las TRES reservas mal, y el motivo es que la VENTA usa",
        "la tercera rama y las reservas la segunda.",
        "",
        "Y LA PRIMERA RAMA ESTA MUERTA, que es lo mas raro: esEntrada",
        "comprueba que el tipo empiece por 'ENTRADA', y NINGUN INSERT",
        "VIVO USA UN TIPO QUE EMPIECE POR ENTRADA.   Los cuatro vivos",
        "son 'Venta', 'SALIDA-RESERVA', 'AJUSTE' y 'MERMA'.   El",
        "'Recepción' de sp_registrar_recepcion, L837, es el único",
        "parecido, y esa funcion no la llama nadie.   O sea que la",
        "columna de entradas del Kardex no tiene ni una fila.",
        "",
        "Y COMO CONSECUENCIA, badgeDe, L379 y su funcion, cae en el",
        "return final para 'Venta', que es variante 'danger'.   O sea",
        "que TODAS las ventas del Kardex salen con la etiqueta roja."
    ]],
    ["6. El SELECT del trigger no bloquea, y el documento dice que sí", [
        "Un hallazgo de concurrencia, y es el que el documento",
        "resuelve mal.",
        "",
        "EL DOCUMENTO, L176 punto b, pide:",
        "",
        "  bloquea la fila con SELECT cantidad_disponible,",
        "  cantidad_reservada, cantidad_vendida FROM inventario_stock",
        "  WHERE id_ptc = :idPtc AND id_sucursal = :idSucursal FOR UPDATE",
        "  para evitar condiciones de carrera entre caja, web y",
        "  reservas concurrentes;",
        "",
        "LO QUE HACE EL TRIGGER, L633-635:",
        "",
        "  SELECT cantidad_disponible INTO v_disponible",
        "  FROM inventario_stock",
        "  WHERE id_ptc = NEW.id_ptc AND id_sucursal = NEW.id_sucursal;",
        "",
        "SIN FOR UPDATE.   Y ADEMAS SOLO TRAE UNA COLUMNA de las tres que",
        "pide el documento.",
        "",
        "LO QUE ESO SIGNIFICA, y hay que decirlo con precisión porque",
        "el resto del camino SÍ bloquea:",
        "",
        "  -  El INSERT de movimientos_inventario, con su L646 y su",
        "     ON CONFLICT, SÍ coge un candado de fila sobre",
        "     inventario_stock, porque un ON CONFLICT DO UPDATE toma",
        "     el lock de la fila que actualiza.   O sea que el L648",
        "     está protegido.",
        "  -  El L633-635, que es la LECTURA, no.   Y de esa lectura",
        "     salen el stock_anterior y el stock_posterior que se",
        "     guardan en la fila del movimiento, L641-642.",
        "",
        "O SEA QUE EL HISTORIAL PUEDE MENTIR, aunque el stock no.   Si",
        "dos ventas de la misma prenda entran a la vez, las dos leen el",
        "mismo disponible antes de que ninguna escriba, y las dos",
        "guardan el mismo stock_anterior, y el primer stock_posterior",
        "no cuadra con el disponible real.   El stock siempre queda",
        "bien, porque lo corrige el ON CONFLICT, pero el Kardex",
        "muestra dos filas con el mismo antes.",
        "",
        "Y LA GUARDÍA DE VERDAD ESTÁ TRES LÍNEAS ANTES, en CU35 y CU37:",
        "Pagos L299-302 y L309-317 hacen el SELECT del stock con FOR",
        "UPDATE y comparan, en la caja, y Pagos L670-673 y L680-686 en",
        "el digital.   O sea que para la venta el bloqueo existe, pero",
        "lo hace el CODIGO, en otro servicio, y el trigger no lo sabe.",
        "",
        "Y PARA LOS OTROS TRES CASOS QUE TAMBIEN PASAN POR AQUÍ, el",
        "bloqueo no existe en ninguno de los tres: un ajuste, una",
        "reserva y una compra simultáneos de la misma prenda leen y",
        "escriben sin candado.   Y en el hallazgo 3 eso es lo que",
        "permite que el doble + de L710 se aplique encima del + del",
        "trigger sin que nada se entere."
    ]],
    ["7. Hay ocho funciones de esquema, siete muertas, y dos implementaciones distintas del caso", [
        "Un hallazgo de arquitectura, y es el que explica por qué",
        "este caso no se puede probar.",
        "",
        "EL ESQUEMA TIENE 8 FUNCIONES Y 2 TRIGGERS, 51 tablas, UN solo",
        "CHECK y CERO ALTER TABLE.   Contadas las llamadas desde el",
        "código, en los 147 ficheros .ts y .tsx:",
        "",
        "  CERO llamadas a sp_ o fn_ desde TypeScript.",
        "",
        "Y DE LAS 8, UNA ESTÁ VIVA:",
        "",
        "  fn_aplicar_movimiento_inventario   L628   con su trigger de L654",
        "",
        "Y LA OTRA QUE TIENE TRIGGER ESTÁ DUPLICADA, no muerta:",
        "",
        "  fn_incrementar_intentos   L608   con su trigger de L620",
        "    Y SRV_AuthService L61-64 hace EXACTAMENTE lo mismo en",
        "    TypeScript, con el mismo 5, el mismo 15 minutos y el",
        "    mismo reset.   O sea que el trigger está duplicado, no",
        "    muerto.   Lo que hace el trigger es redundante.",
        "",
        "Y LAS 6 RESTARES ESTÁN SIN LLAMAR.   Con sus bucles contados",
        "sobre LOOP y END LOOP, porque la palabra sale dos veces por",
        "bucle:",
        "",
        "  sp_registrar_venta       L662-727  MUERTA  2 bucles",
        "  sp_registrar_reserva     L728-773  MUERTA  1 bucle",
        "  sp_registrar_devolucion  L774-810  MUERTA  1 bucle",
        "  sp_registrar_recepcion   L811-847  MUERTA  1 bucle",
        "  fn_detectar_stock_bajo   L848-872  MUERTA  0 bucles",
        "  fn_kardex_producto       L873-892  MUERTA  0 bucles",
        "",
        "  Total: CINCO BUCLES en el esquema, y los CINCO están en",
        "  funciones que nadie ejecuta.   De ahí que este caso se dibuje",
        "  sin un solo fragmento.",
        "",
        "Y LO QUE HACE EL CASO GRAVE, y es lo que hay que mirar:",
        "EXISTEN DOS IMPLEMENTACIONES DISTINTAS DE ESTE CASO.",
        "",
        "  la del trigger, L628-652, que es la viva:",
        "    25 líneas, cero bucles, un SELECT sin candado, un",
        "    INSERT con ON CONFLICT, y NO toca cantidad_vendida ni",
        "    cantidad_reservada ni estado_stock.",
        "",
        "  la de sp_registrar_venta, L662-727, que es la muerta:",
        "    dos bucles sobre jsonb_array_elements, un FOR UPDATE de",
        "    verdad, L687-690, que además resta la reservada del",
        "    disponible antes de comparar, y un RAISE EXCEPTION, L693,",
        "    que es el 409 que pide el documento.",
        "",
        "O SEA QUE LA QUE ESTÁ MUERTA ES LA QUE HACE LO QUE EL",
        "DOCUMENTO PIDE, Y LA QUE ESTÁ VIVA NO HACE NADA DE ESO.",
        "",
        "Y LA DIFERENCIA SE VE EN UNA LÍNEA:",
        "",
        "  L687  SELECT cantidad_disponible - cantidad_reservada INTO",
        "            v_stock",
        "  L688  FROM inventario_stock",
        "  L689  WHERE id_ptc = v_id_ptc AND id_sucursal = p_id_sucursal",
        "  L690  FOR UPDATE;",
        "",
        "La función muerta resta la reservada del disponible, que es",
        "justo lo que el trigger no hace.   O sea que el traslado que",
        "el documento pide está escrito, en el esquema, en la función",
        "que nadie llama.",
        "",
        "Y UN DATO SOBRE LAS COLUMNAS, porque explica por qué este",
        "caso no se puede ni auditar:",
        "",
        "  cantidad_vendida   se escribe en 2 sitios del proyecto, y",
        "                     los 2 son de cobro: Pagos L341 y L711.",
        "                     Y en el esquema NINGUNA de las 8",
        "                     funciones la escribe, ni la muerta",
        "                     sp_registrar_venta.",
        "  cantidad_disponible  se escribe en 2 sitios, y el 2 es el",
        "                     hallazgo 3."
    ]],
    ["8. Lo que está bien, y hay cinco cosas", [
        "Este caso tiene cinco cosas buenas, y dos de ellas son",
        "lo mejor que hay en todo el esquema.",
        "",
        "1. EL BEFORE INSERT GUARDA EL ANTES Y EL DESPUÉS, Y ESO NADA",
        "   MÁS LO HACE.   L641-642:",
        "",
        "     NEW.stock_anterior  := v_disponible;",
        "     NEW.stock_posterior := v_disponible + NEW.cantidad;",
        "",
        "   Son dos columnas de la propia tabla de movimientos, y",
        "   quedan rellenadas sin que el código las nombre.   Eso",
        "   convierte el Kardex en un libro mayor real, con el saldo",
        "   antes y después de cada movimiento, y es gratis.   En",
        "   todo el proyecto no hay otro sitio donde se guarde el",
        "   antes de un cambio.",
        "",
        "2. Y EL ON CONFLICT ES LA DECISIÓN CORRECTA.   L645-648 hace",
        "   las dos cosas en una sentencia: si la prenda no tenía",
        "   fila de inventario, la crea, y si la tenía, la suma.   Sin",
        "   eso habría que hacer un SELECT y un UPDATE en dos",
        "   sentencias, con una ventana entre medias.   Y funciona",
        "   porque UNIQUE (id_ptc, id_sucursal) existe, schema L310, y",
        "   es la primera vez en la serie que un índice del esquema",
        "   hace falta para que algo funcione.",
        "",
        "3. Y LA FECHA LA PONE EL MOTOR, L643, con NEW.fecha :=",
        "   NOW().   El código no manda la fecha, así que no puede",
        "   mandarla mal, y el DEFAULT de L434 es redundante pero",
        "   coherente.",
        "",
        "4. Y LA GARANTÍA DE ATOMICIDAD SÍ ESTÁ, y es mejor de lo que",
        "   seemed.   El documento, L177, promete que no se genera",
        "   venta sin descuento ni descuento sin venta.   Y eso es",
        "   verdad, y por la vía correcta: dataSource.transaction de",
        "   TypeORM, que abre en Pagos L276 para la caja y en L647",
        "   para el digital, y que se cierra sola al acabarse el",
        "   callback.   El trigger, el INSERT del movimiento y el",
        "   UPDATE de cantidad_vendida de L711 están DENTRO.   Un",
        "   autor que entiende de dónde viene su garantía es un autor",
        "   que la ha pensado, y aquí la ha pensado.",
        "",
        "5. Y LA FUNCIÓN ES CORTA Y SE LEE.   25 líneas, L628-652, con",
        "   un SELECT, tres asignaciones, un IF y un INSERT.   No hay",
        "   ni una variable muerta, ni un parámetro sin usar, ni una",
        "   consulta de más.   Para estar en PL/pgSQL, que suele ser",
        "   ilegible, esta función es un ejemplo.   Y la razón por la",
        "   que se entiende es que hace UNA cosa, y la hace en el",
        "   motor.   Si los dos IF y el GREATEST que le faltan los",
        "   escribió alguien que la hubiera leído, esta función",
        "   arreglaba los hallazgos 1, 2 y 4 de este diagrama."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de " + TOTAL_CAB + " del diagrama de secuencia de CU31."; } catch (e) { }
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
    var xT = xDe(indiceDe("T"));
    // CERO MARCOS EN ESTE CASO, Y NO ES UN OLVIDO.
    // fn_aplicar_movimiento_inventario, schema.sql L628-652, que es la
    // funcion VIVA que hace este caso, tiene LOOP 0, END LOOP 0 y
    // WHILE 0.   Y el ON CONFLICT DO UPDATE de L647-648, que si son
    // dos caminos de verdad, es una clausula de SQL y no una decision
    // del caso de uso.
    // OJO CON EL CONTEO: la palabra LOOP sale DOS VECES por bucle, una
    // en el FOR .. LOOP y otra en el END LOOP, asi que hay que restar.
    //   sp_registrar_venta     L662-727  MUERTA  LOOP 4  END LOOP 2  = 2
    //   sp_registrar_reserva   L728-773  MUERTA  LOOP 2  END LOOP 1  = 1
    //   sp_registrar_devolucion L774-810  MUERTA  LOOP 2  END LOOP 1  = 1
    //   sp_registrar_recepcion L811-847  MUERTA  LOOP 2  END LOOP 1  = 1
    // CINCO bucles en el esquema, y los CINCO en funciones que NADIE
    // ejecuta.   A la derecha, el contador MARCOS_PUESTOS se queda en 0.
    //
    // LAS 2 BARRAS, y son las unicas de la serie que estan DENTRO de la
    // base de datos. La primera es el backend, desde el INSERT que
    // dispara el trigger hasta el COMMIT. La segunda es el trigger, que
    // es una activacion del lifeline del motor, y por eso va en T y no
    // en F: la funcion la invoca el trigger, no al reves.
    activacion(diag, xP, Y_MSG0 - 26, Y_MSG0 + 15 * PASO_MSG - 26);
    activacion(diag, xT, Y_MSG0 + 5 * PASO_MSG - 26, Y_MSG0 + 13 * PASO_MSG - 26);
}

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 940) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU31  Actualizar Inventario Tras Venta (Automático)   ·   en 2.2 Casos de Uso.md este caso es el CU39, y el CU31 de ahi es el VESTIDOR FÍSICO   ·   en el CÓDIGO no tiene numero"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 940) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseño de caso de uso, sección 3.3.2.1.  9 líneas de vida, 27 mensajes, 8 hallazgos, CERO loop y CERO alt, y 2 barras de activación."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su línea de vida. El tiempo baja. El caso de los que NO TIENEN PERSONA DELANTE: el único actor de la serie que no es un usuario, y el único caso cuya mitad viva está en PL/pgSQL y no en TypeScript. Lo único que hace el código es UN INSERT, el mensaje 3, en Pagos L715-718. Y a partir de ahí el motor se encarga solo: salta el trigger, la función lee el disponible, se guarda el antes y el después en la propia fila del movimiento y suma la cantidad. Por eso este diagrama no tiene NINGÚN mensaje de vuelta: termina en M14, sin respuesta al backend. Y CERO fragmentos, que no es un olvido: la función viva no tiene ni un bucle ni un alt."; } catch (e) { }
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

// CU31 - notas del diagrama y MAIN
function notasDelDiagrama(diag, r, h, ch) {
    var N = [];
    N.push("CU31  Actualizar Inventario Tras Venta (Automático).  Diseño de caso de uso, sección 3.3.2.1.");
    N.push("");
    N.push("AVISO DE NUMERACIÓN, Y AQUÍ HAY DOS COSAS DISTINTAS");
    N.push("");
    N.push("  1. EL NÚMERO Y EL TÍTULO NO VAN JUNTOS EN NINGÚN SITIO DEL PROYECTO.   En el documento");
    N.push("  de casos de uso que hay en la carpeta, 2.2 Casos de Uso.md, este caso es el CU39:");
    N.push("");
    N.push("    L79   | CU39 | Actualizar inventario tras venta (automático) | Alto |");
    N.push("");
    N.push("  Y EL CU31 DE ESE MISMO DOCUMENTO ES OTRO CASO, que es el vestidor físico:");
    N.push("");
    N.push("    L66   | CU31 | Confirmar recepción del cliente en el vestidor físico | Medio |");
    N.push("");
    N.push("  Este diagrama dibuja el CASO QUE DESCRIBE EL TÍTULO, que es el CU39 del proyecto.   El");
    N.push("  CU31 real es el vestidor, y su detalle está en Detalle CU Ciclo 2.md.   Si lo que");
    N.push("  querías era el CU31, avísame y lo hago aparte.");
    N.push("");
    N.push("  2. EN EL CÓDIGO ESTE CASO NO TIENE NÚMERO.   Es lo único de la serie que no tiene");
    N.push("  endpoint, ni servicio, ni método, ni pantalla.   No aparece en api.ts, ni en el router,");
    N.push("  ni en clienteMenu.ts, ni en adminMenu.ts.   No se puede invocar ni probar desde el");
    N.push("  front ni desde un test de API.   Se tiene que mirar la base de datos.");
    N.push("");
    N.push("Y EL MOTOR REAL ESTA EN PL/PGSQL, que es lo que hay que entender antes de mirar el");
    N.push("diagrama: la mitad del caso que MUEVE EL STOCK no esta en ningun sitio de TypeScript.");
    N.push("");
    N.push("  Y CONTADAS TODAS LAS ESCRITURAS DE LAS DOS COLUMNAS QUE EL DOCUMENTO DICE QUE SON");
    N.push("  LAS DE ESTE CASO, en los 147 ficheros .ts y .tsx y en todo el esquema:");
    N.push("");
    N.push("    cantidad_disponible   2 sitios:  el trigger, schema L648, que es el de este caso,");
    N.push("                                      y SRV_ReservasService L710, que es de otro caso");
    N.push("                                      y encima suma una segunda vez.  Es el hallazgo 3");
    N.push("    cantidad_vendida      2 sitios:  Pagos L341, la caja, y L711, el digital.");
    N.push("                                      Y en el esquema NINGUNA de las ocho funciones");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  9 líneas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Sistema                    «actor»     el único actor que no es una persona");
    N.push("    SRV_PagosService                 «control»   el que dispara el caso, y solo con un INSERT");
    N.push("    venta_items                      «entity»    de donde salen las prendas, y no recibe mensajes");
    N.push("    PostgreSQL                       «entity»    el motor, con el trigger dentro");
    N.push("    trg_movimiento_inventario        «entity»    el BEFORE INSERT, cuatro líneas");
    N.push("    fn_aplicar_movimiento_inventario  «entity»    25 líneas, cero bucles, la única función viva");
    N.push("    inventario_stock                 «entity»    la tabla que se actualiza, y que no tiene CHECK");
    N.push("    movimientos_inventario            «entity»    el kardex, y el trigger rellena 3 de sus 13 columnas");
    N.push("    producto_talla_color             «entity»    estado_stock, que NO lo escribe nadie");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes. Y CUATRO COSAS A PROPÓSITO NO ESTÁN, y hay que decir cuáles y por qué:");
    N.push("");
    N.push("    venta_items  no recibe ninguno.   Está porque el caso necesita un origen de las");
    N.push("      prendas, pero en realidad el backend ya las leyó antes, en el bucle del stock de");
    N.push("      CU35 y CU37, con L288-292 y L659-663, y aquí solo pasa el id_ptc.");
    N.push("");
    N.push("    ventas  no está.   El caso no necesita la venta para nada: no mira su estado, ni su");
    N.push("      total, ni su sucursal.   Solo el movimiento, que ya lleva la venta en su id_venta.");
    N.push("");
    N.push("    BITACORA DE AUDITORIA  no está, y es una ausencia ELSEVE.   El documento, L183");
    N.push("      excepción E5, promete que el error se registra en api-server.err.log.   En el");
    N.push("      proyecto no hay ni un Logger en main.ts, ni un solo fichero que escriba a disco:");
    N.push("      cero appendFile, cero createWriteStream, cero logFile, en los 147 ficheros.   Así");
    N.push("      que la E5 no existe, ni el fichero ni el registro.");
    N.push("");
    N.push("    SRV_AjustesService, SRV_ReservasService y SRV_ComprobantesService  no están.   Los");
    N.push("      tres disparan el MISMO trigger con otros tipos de movimiento.   Y el de las");
    N.push("      reservas es el del hallazgo 3, que es el que más dano hace.");
    N.push("");
    N.push("CERO FRAGMENTOS, Y POR QUÉ, QUE ES LA PRIMERA VEZ QUE PASA EN LA SERIE");
    N.push("");
    N.push("  Contado ANTES de dibujar, con contadores, sobre LAS DOS implementaciones del caso que hay");
    N.push("  en el esquema.   Y con un truco que hace falta: la palabra LOOP sale DOS VECES por bucle,");
    N.push("  una en el FOR .. LOOP y otra en el END LOOP, así que hay que restar:");
    N.push("");
    N.push("    fn_aplicar_movimiento_inventario  L628-652   LA VIVA");
    N.push("      LOOP 0   END LOOP 0   WHILE 0   RETURNS TRIGGER");
    N.push("");
    N.push("    sp_registrar_venta     L662-727   MUERTA   LOOP 4  END LOOP 2   = 2");
    N.push("    sp_registrar_reserva   L728-773   MUERTA   LOOP 2  END LOOP 1   = 1");
    N.push("    sp_registrar_devolucion L774-810  MUERTA   LOOP 2  END LOOP 1   = 1");
    N.push("    sp_registrar_recepcion L811-847   MUERTA   LOOP 2  END LOOP 1   = 1");
    N.push("    fn_detectar_stock_bajo L848-872   MUERTA   LOOP 0  END LOOP 0   = 0");
    N.push("    fn_kardex_producto     L873-892   MUERTA   LOOP 0  END LOOP 0   = 0");
    N.push("");
    N.push("  O SEA QUE HAY CINCO BUCLES EN EL ESQUEMA, Y LOS CINCO ESTÁN EN CUATRO FUNCIONES QUE");
    N.push("  NADIE EJECUTA.   No es que el caso no tenga bucles: es que los que tiene están muertos.");
    N.push("");
    N.push("  Y EL CONTEO DE LLAMADAS, que es lo que decide cuál de las dos se dibuja.   De las ocho");
    N.push("  funciones del esquema:");
    N.push("");
    N.push("    UNA ESTÁ VIVA:  fn_aplicar_movimiento_inventario, L628, que es la del trigger de L654.");
    N.push("");
    N.push("    UNA TIENE TRIGGER DUPLICADO:  fn_incrementar_intentos, L608, con el de L620.   Y");
    N.push("      SRV_AuthService L61-64 hace exactamente lo mismo en TypeScript, con el mismo 5, el");
    N.push("      mismo 15 minutos y el mismo reset.   Está duplicada, no muerta.");
    N.push("");
    N.push("    LAS SEIS RESTARES NO LAS LLAMA NADIE.   CERO llamadas a sp_ o fn_ desde el código,");
    N.push("      contadas en los 147 ficheros .ts y .tsx del prototipo.");
    N.push("");
    N.push("  Y CERO ALTS TAMBIÉN, aunque la función tenga un IF, L637, que comprueba si el disponible");
    N.push("  es nulo.   No es un alt, porque las dos ramas hacen lo mismo después: sumar la cantidad.");
    N.push("  Y el ON CONFLICT DO UPDATE de L647-648, que sí que son dos caminos de verdad, es una");
    N.push("  cláusula de SQL y no una decisión del caso de uso.");
    N.push("");
    N.push("  UNA COSA QUE EL DOCUMENTO PIDE Y QUE NO SE DIBUJA PORQUE NO EXISTE: la consulta que pide");
    N.push("  en L176 punto d, la que actualiza producto_talla_color.estado_stock con las tres reglas.");
    N.push("  Está en el hallazgo 2, y es el mensaje que va con el símbolo de que no llega a hacerse.");
    N.push("");
    N.push("EL HALLAZGO 1: EL DISPONIBLE PUEDE QUEDAR NEGATIVO Y NADIE LO COMPRUEBA");
    N.push("");
    N.push("  L645-648, la única escritura del caso:");
    N.push("");
    N.push("    INSERT INTO inventario_stock (id_ptc, id_sucursal, cantidad_disponible)");
    N.push("    VALUES (NEW.id_ptc, NEW.id_sucursal, NEW.cantidad)");
    N.push("    ON CONFLICT (id_ptc, id_sucursal)");
    N.push("    DO UPDATE SET cantidad_disponible =");
    N.push("      inventario_stock.cantidad_disponible + NEW.cantidad;");
    N.push("");
    N.push("  NO HAY NINGÚN IF, NINGÚN RAISE, NINGÚN GREATEST Y NINGÚN CLAMP.   La cantidad se suma y");
    N.push("  punto.   Y el documento lo prohíbe, L176: nunca permitiendo que cantidad_disponible quede");
    N.push("  negativo, si el saldo no alcanza la transacción entera se revierte.");
    N.push("");
    N.push("  LA COMPROBACIÓN ESTÁ, PERO ANTES DE ESCRIBIR Y EN OTRO SITIO: Pagos L312-316 y L680-686,");
    N.push("  Reservas L1102-1107 y Ventas L480-488.   Los cuatro validan antes de insertar, y los");
    N.push("  cuatro insertan en la misma transacción.   Por eso para la venta funciona.");
    N.push("");
    N.push("  PERO HAY TRES CAMINOS QUE INSERTAN SIN VALIDAR:");
    N.push("");
    N.push("  1  EL ON CONFLICT CUANDO LA FILA NO EXISTE.   L646 mete NEW.cantidad tal cual, y si es");
    N.push("     una venta es negativa.   Una prenda sin fila de inventario_stock NACE con disponible");
    N.push("     -3, y PostgreSQL lo acepta porque no hay CHECK.");
    N.push("");
    N.push("  2  SRV_AjustesService L231, que es CU24.   L198 decide el signo: la MERMA es");
    N.push("     -Math.abs(cantidad) y el AJUSTE es la cantidad que venga, sin comprobar contra el");
    N.push("     stock.   Un ajuste con cantidad negativa es una merma que no se ha validado.");
    N.push("");
    N.push("  3  Y CUALQUIER MOVIMIENTO FUTURO.   El trigger es BEFORE INSERT sobre la tabla, L655, o");
    N.push("     sea que no mira el tipo.   Cualquiera que meta una fila mañana resta.");
    N.push("");
    N.push("  Y LA TABLA NO PROTEGE: inventario_stock, L302-311, tiene PRIMARY KEY y UNIQUE, y no tiene");
    N.push("  NI UN CHECK.   Y el esquema entero tiene UN solo CHECK, el de carrito_items.");
    N.push("");
    N.push("EL HALLAZGO 2: estado_stock NO LO ESCRIBE NADIE, Y SEIS MÓDULOS LO USAN PARA DECIDIR");
    N.push("");
    N.push("  El documento lo pide, L176 punto d, con las tres reglas: Sin stock si disponible más");
    N.push("  reservada es 0, Bajo si disponible es menor o igual que stock_minimo_alert, y Disponible si");
    N.push("  no.   Y la columna existe, schema.sql L242, con DEFAULT 'Disponible'.");
    N.push("");
    N.push("  PERO CONTADAS TODAS LAS ESCRITURAS DE ESA COLUMNA EN LOS 147 FICHEROS .ts Y .tsx DEL");
    N.push("  PROTOTIPO Y EN TODO EL ESQUEMA: CERO.   El único sitio que la nombra al escribir es");
    N.push("  SRV_ProductosService L198, que es el INSERT que la crea.   Así que está SIEMPRE en");
    N.push("  'Disponible', para siempre, desde que nació.");
    N.push("");
    N.push("  Y LA USAN PARA DECIDIR, en 6 sitios:");
    N.push("");
    N.push("    SRV_CarritoService    L246   si es 'sin stock', rechaza la prenda");
    N.push("    SRV_ReservasService  L1197   si NO es 'disponible', rechaza la prenda");
    N.push("    SRV_ReservasService   L330   WHERE estado_stock = 'Disponible'");
    N.push("    SRV_ReservasService   L383   WHERE estado_stock = 'Disponible'");
    N.push("    SRV_VentasService     L197   si NO es 'Disponible', rechaza la prenda");
    N.push("    SRV_VentasService     L315   WHERE estado_stock <> 'Sin stock'");
    N.push("");
    N.push("  Y OJO CON QUE LAS COMPARACIONES NO COINCIDEN ENTRE SÍ: Carrito L246 busca 'sin stock'");
    N.push("  en minúscula, y Reservas L1197 busca 'disponible' en minúscula, y la columna tiene");
    N.push("  'Disponible' y 'Sin stock' con mayúscula.   O sea que dos de las seis comparaciones no");
    N.push("  pueden ser ciertas NUNCA, por mayúsculas, ni aunque alguien escribiera la columna.");
    N.push("");
    N.push("  TODAS LAS OTRAS CON 'Disponible' SON SIEMPRE CIERTAS, PORQUE NUNCA CAMBIA.   O sea que");
    N.push("  las validaciones de disponibilidad no están validando nada.");
    N.push("");
    N.push("  CONSECUENCIA: una prenda con cantidad_disponible = 0 sigue con estado_stock =");
    N.push("  'Disponible', y la aceptan el carrito, la reserva y el punto de caja.   Y NO LA MUESTRA");
    N.push("  el módulo de recomendaciones, porque SRV_RecomendacionesService L197-198 sí mira la");
    N.push("  cantidad de verdad, con un EXISTS sobre inventario_stock.");
    N.push("");
    N.push("  O SEA QUE EL CATÁLOGO, EL CARRITO, LA RESERVA Y LA CAJA OFRECEN PRENDAS AGOTADAS, Y LAS");
    N.push("  RECOMENDACIONES NO.   Y el único sitio del proyecto que comprueba el stock de verdad es");
    N.push("  el que nadie audita, porque es una recomendación.");
    N.push("");
    N.push("  LO QUE LO ARREGLA: escribir el estado_stock en el trigger, que ya está dentro y ya sabe");
    N.push("  las dos cantidades.   Cuatro líneas en L648, y harían correctas las 6 validaciones.");
    N.push("");
    N.push("EL HALLAZGO 3, QUE ES EL MÁS NUEVO Y EL MÁS GRAVE DE NEGOCIO: FINALIZAR UNA RESERVA");
    N.push("DEVUELVE EL STOCK DISPONIBLE DOS VEZES");
    N.push("");
    N.push("  Sale de contar las escrituras de cantidad_disponible en TODO el proyecto, y son dos:");
    N.push("");
    N.push("    schema.sql L648, que es el trigger de este caso");
    N.push("    SRV_ReservasService L710, que es de otro caso, y encima es un ' + ' sobre un");
    N.push("      movimiento que el trigger ya ha sumado");
    N.push("");
    N.push("  O SEA QUE HAY UN SOLO PUNTO DEL CÓDIGO QUE SUMA EL DISPONIBLE FUERA DEL TRIGGER, Y EL");
    N.push("  TRIGGER TAMBIÉN LO SUMA.   Y en el mismo bucle.   L697-714:");
    N.push("");
    N.push("    for (const item of items) {");
    N.push("      const cantidad = Number(item.cantidad ?? 0);");
    N.push("      if (cantidad <= 0) continue;");
    N.push("      await em.query(");
    N.push("        `INSERT INTO movimientos_inventario (... tipo_movimiento, cantidad, ...)");
    N.push("         VALUES ($1, $2, 'SALIDA-RESERVA', $3, $4, $5, $6)`,");
    N.push("        [item.id_ptc, idSucursal, cantidad, `Cierre ${numero}`, ...],");
    N.push("      );");
    N.push("      await em.query(");
    N.push("        `UPDATE inventario_stock");
    N.push("         SET cantidad_reservada = GREATEST(0, cantidad_reservada - $3),");
    N.push("             cantidad_disponible = cantidad_disponible + $3");
    N.push("         WHERE id_ptc = $1 AND id_sucursal = $2`,");
    N.push("        [item.id_ptc, idSucursal, cantidad],");
    N.push("      );");
    N.push("    }");
    N.push("");
    N.push("  PASO A PASO, CON 2 PRENDAS RESERVADAS:");
    N.push("");
    N.push("    L703-705 inserta el movimiento con cantidad POSITIVA, +2.   El trigger lo ve y hace");
    N.push("    L648: disponible + 2.");
    N.push("");
    N.push("    L708-711 hace disponible + 2 OTRA VEZ, a mano.");
    N.push("");
    N.push("    TOTAL: +4 por dos prendas.   Y cantidad_reservada baja bien, -2, con el GREATEST.");
    N.push("");
    N.push("  Y LO PEOR NO ES EL DOBLE, ES PARA QUÉ CASO ES: L682 es liberarStockReserva, y la llama");
    N.push("  FINALIZAR RESERVA, L826, que es el momento en que el cliente SE LLEVA LA PRENDA, con");
    N.push("  L860 poniendo la reserva en 'Cumplida'.");
    N.push("");
    N.push("  O SEA QUE ESTE TROZO DE CÓDIGO SE EJECUTA CUANDO LA ROPA SALE DE LA TIENDA, Y SU EFECTO");
    N.push("  EN EL DISPONIBLE ES DEVOLVERLA AL ARMARIO, Y DEVUELVERLA DOS VECES.   Y nunca resta, y");
    N.push("  nunca toca cantidad_vendida, que solo se escribe en 2 sitios del proyecto, Pagos L341 y");
    N.push("  L711, los dos de cobro.");
    N.push("");
    N.push("  Y COMPARADO CON LOS OTROS DOS CAMINOS DE RESERVA, que hacen cosas distintas, con la");
    N.push("  misma tabla y el mismo tipo de movimiento:");
    N.push("");
    N.push("    crearReserva     L1001  L1110-1112  movimiento -cantidad, el trigger RESTA, y L1117");
    N.push("      suma la reservada.   CORRECTO: la prenda sale del armario a la reserva.");
    N.push("");
    N.push("    cancelar         L910   L972-975    movimiento +cantidad, el trigger SUMA, y L979");
    N.push("      solo baja la reservada.   CORRECTO: la prenda vuelve al armario, y UNA vez.");
    N.push("");
    N.push("    finalizarReserva L826   L703-705    movimiento +cantidad, el trigger suma, y L710");
    N.push("      suma OTRA vez.   INCORRECTO: y además la prenda no vuelve, porque se la lleva");
    N.push("      el cliente.");
    N.push("");
    N.push("  O SEA QUE DE LOS TRES CAMINOS, EL QUE ESTÁ MAL ES EL ÚNICO QUE NO DEVOLVE NADA, Y ES EL");
    N.push("  ÚNICO QUE DOBLA.");
    N.push("");
    N.push("  CONSECUENCIA: cada vez que una reserva se finaliza, el disponible de esa prenda en esa");
    N.push("  sucursal se infla en el doble.   Con veinte reservas de dos unidades, el catálogo");
    N.push("  ofrece cuarenta prendas más de las que existen, y por el hallazgo 2 el catálogo ni se");
    N.push("  entero, porque mira el estado_stock, que no lo escribe nadie.");
    N.push("");
    N.push("  Y EL ARREGLO ES DE UNA LÍNEA: L710 no debería existir.   O el movimiento de L703");
    N.push("  debería llevar el otro signo y L710 sobra, o al revés.   Pero NO pueden las dos.   Y el");
    N.push("  GREATEST de L709 sí está bien, porque evita que la reservada baje de cero.");
    N.push("");
    N.push("EL HALLAZGO 4: EL TRASLADO DE LA RESERVADA, QUE EL DOCUMENTO PIDE Y NADIE HACE");
    N.push("");
    N.push("  El documento, L176 punto c: si el ítem proviene de una prenda reservada en esa");
    N.push("  sucursal, el stock se traslada, cantidad_reservada menos cantidad y cantidad_vendida");
    N.push("  más cantidad.");
    N.push("");
    N.push("  Y NINGÚN SITIO LO HACE.   El trigger solo toca cantidad_disponible.   El código del");
    N.push("  pago, ni en el digital (L709-714) ni en la caja (L339-344), solo cantidad_vendida.   Y");
    N.push("  sp_registrar_reserva, L761, que es la única función del esquema que escribe la");
    N.push("  reservada, es una de las cuatro MUERTAS.");
    N.push("");
    N.push("  CONTADA EN TODO EL PROYECTO, LA COLUMNA SE ESCRIBE EN CUATRO SITIOS, y solo tres están");
    N.push("  en el mismo fichero: Reservas L1117, que suma, y L709 y L979, que restan con GREATEST.");
    N.push("  El cuarto es schema.sql L761, en la función muerta.   NINGUNO ESTÁ EN UN CAMINO DE");
    N.push("  PAGO.   Ni el digital ni la caja, y este caso, que es el que descontaría, tampoco.");
    N.push("");
    N.push("  Y AQUÍ EL DATO NUEVO: el documento pide el traslado CONCRETO, diciendo que la venta");
    N.push("  presencial atiende la reserva.   Y el código lo sabe también, porque el SELECT de CU35");
    N.push("  trae cantidad_reservada, L670, y el de la caja NO, L299.   La divergencia está dentro");
    N.push("  del mismo proyecto y a 40 líneas una de otra.");
    N.push("");
    N.push("EL HALLAZGO 5: EL KARDEX INVIERTE EL SIGNO DE LAS TRES SALIDAS DE RESERVA");
    N.push("");
    N.push("  AdminKardex.tsx, L32-36:");
    N.push("");
    N.push("    if (esEntrada(m.tipo_movimiento)) return Math.abs(m.cantidad);");
    N.push("    if (String(m.tipo_movimiento).startsWith('SALIDA'))");
    N.push("      return -Math.abs(m.cantidad);");
    N.push("    return m.saldo - m.stock_anterior;");
    N.push("");
    N.push("  Y LA SEGUNDA RAMA, la de SALIDA, multiplica por -1 SIEMPRE, sin mirar lo que hay en la");
    N.push("  base.   Y los tres movimientos SALIDA-RESERVA NO ESTÁN ESCRITOS IGUAL:");
    N.push("");
    N.push("    Reservas L1112   crear           -linea.cantidad   NEGATIVO");
    N.push("    Reservas L705    cerrar           cantidad        POSITIVO");
    N.push("    Reservas L975    cancelar         cantidad        POSITIVO");
    N.push("");
    N.push("  ASÍ QUE LOS TRES SALEN CON EL SIGNO CONTRARIO AL GUARDADO:");
    N.push("");
    N.push("    crear     base -2   pantalla -Math.abs(-2) = +2   MAL");
    N.push("    cerrar    base +2   pantalla -Math.abs(+2) = -2   MAL");
    N.push("    cancelar  base +2   pantalla -Math.abs(+2) = -2   MAL");
    N.push("");
    N.push("  O SEA QUE LAS TRES SALIDAS DE RESERVA DEL KARDEX SALEN CON EL SIGNO INVERTIDO.   Y las");
    N.push("  dos últimas son devoluciones, así que además de invertidas se muestran como salidas de");
    N.push("  stock que nunca salieron.   Y la de crear, que sí es una salida de verdad, se muestra");
    N.push("  como una entrada.");
    N.push("");
    N.push("  Y LA TERCERA RAMA NO LA SALVA: para 'Venta' y 'AJUSTE' devuelve saldo menos");
    N.push("  stock_anterior, y como saldo es stock_posterior, Kardex L274, eso da la cantidad, que si");
    N.push("  es negativa sale negativa.   La VENTA se ve bien y las TRES reservas mal, y el motivo");
    N.push("  es que la VENTA usa la tercera rama y las reservas la segunda.");
    N.push("");
    N.push("  Y LA PRIMERA RAMA ESTÁ MUERTA: esEntrada comprueba que el tipo empiece por 'ENTRADA', y");
    N.push("  NINGÚN INSERT VIVO USA UN TIPO QUE EMPIECE POR ENTRADA.   Los cuatro vivos son");
    N.push("  'Venta', 'SALIDA-RESERVA', 'AJUSTE' y 'MERMA'.   La columna de entradas del Kardex no");
    N.push("  tiene ni una fila, y como efecto secundario TODAS las ventas salen con la etiqueta");
    N.push("  roja de 'danger', porque badgeDe cae en su return final.");
    N.push("");
    N.push("EL HALLAZGO 6: EL SELECT DEL TRIGGER NO BLOQUEA");
    N.push("");
    N.push("  El documento, L176 punto b, pide: bloquea la fila con SELECT de las TRES columnas, FOR");
    N.push("  UPDATE, para evitar condiciones de carrera entre caja, web y reservas concurrentes.");
    N.push("");
    N.push("  LO QUE HACE EL TRIGGER, L633-635, es el mismo SELECT SIN FOR UPDATE y trayendo SOLO UNA");
    N.push("  de las tres columnas.");
    N.push("");
    N.push("  LO QUE ESO SIGNIFICA, y hay que decirlo con precisión porque el resto del camino SÍ");
    N.push("  bloquea: el INSERT con su ON CONFLICT SÍ coge un candado de fila sobre inventario_stock,");
    N.push("  porque un ON CONFLICT DO UPDATE toma el lock de la fila que actualiza.   El L648 está");
    N.push("  protegido.   El L633-635, que es la LECTURA, no.");
    N.push("");
    N.push("  Y DE ESA LECTURA SALEN el stock_anterior y el stock_posterior que se guardan en la fila");
    N.push("  del movimiento, L641-642.   O sea que EL HISTORIAL PUEDE MENTIR AUNQUE EL STOCK NO.   Si");
    N.push("  dos ventas de la misma prenda entran a la vez, las dos leen el mismo disponible antes de");
    N.push("  que ninguna escriba, las dos guardan el mismo stock_anterior, y el primer");
    N.push("  stock_posterior no cuadra con el disponible real.");
    N.push("");
    N.push("  Y LA GUARDÍA DE VERDAD ESTÁ TRES LÍNEAS ANTES, en CU35 y CU37: Pagos L299-302 y");
    N.push("  L309-317 hacen el SELECT del stock con FOR UPDATE y comparan, en la caja, y Pagos");
    N.push("  L670-673 y L680-686 en el digital.   El bloqueo existe, pero lo hace el código, en");
    N.push("  otro servicio, y el trigger no lo sabe.");
    N.push("");
    N.push("  Y PARA LOS OTROS TRES CASOS QUE TAMBIÉN PASAN POR AQUÍ, el bloqueo no existe en ninguno:");
    N.push("  un ajuste, una reserva y una compra simultáneos de la misma prenda leen y escriben sin");
    N.push("  candado.   Y en el hallazgo 3 eso es lo que permite que el doble + de L710 se aplique");
    N.push("  encima del + del trigger sin que nada se entere.");
    N.push("");
    N.push("EL HALLAZGO 7: HAY OCHO FUNCIONES, SIETE MUERTAS, Y DOS IMPLEMENTACIONES DISTINTAS");
    N.push("");
    N.push("  El esquema tiene 8 funciones, 2 triggers, 51 tablas, UN solo CHECK y CERO ALTER TABLE.");
    N.push("  Contadas las llamadas desde el código, en los 147 ficheros .ts y .tsx: CERO llamadas a");
    N.push("  sp_ o fn_ desde TypeScript.");
    N.push("");
    N.push("  UNA ESTÁ VIVA: fn_aplicar_movimiento_inventario, L628, con su trigger de L654.");
    N.push("");
    N.push("  LA QUE TIENE TRIGGER Y ESTÁ DUPLICADA: fn_incrementar_intentos, L608, con el de L620.");
    N.push("  SRV_AuthService L61-64 hace lo mismo en TypeScript, con el mismo 5, el mismo 15 minutos");
    N.push("  y el mismo reset.   El trigger es redundante.");
    N.push("");
    N.push("  LAS SEIS RESTARES NO LAS LLAMA NADIE.   Con sus bucles contados sobre LOOP y END LOOP:");
    N.push("");
    N.push("    sp_registrar_venta       L662-727  MUERTA  2 bucles");
    N.push("    sp_registrar_reserva     L728-773  MUERTA  1 bucle");
    N.push("    sp_registrar_devolucion  L774-810  MUERTA  1 bucle");
    N.push("    sp_registrar_recepcion   L811-847  MUERTA  1 bucle");
    N.push("    fn_detectar_stock_bajo   L848-872  MUERTA  0 bucles");
    N.push("    fn_kardex_producto       L873-892  MUERTA  0 bucles");
    N.push("");
    N.push("  O SEA QUE HAY CINCO BUCLES EN EL ESQUEMA, Y LOS CINCO ESTÁN EN FUNCIONES QUE NADIE");
    N.push("  EJECUTA.   De ahí que este caso se dibuje sin un solo fragmento.");
    N.push("");
    N.push("  Y LO QUE HACE EL CASO GRAVE: EXISTEN DOS IMPLEMENTACIONES DISTINTAS DE ESTE CASO.");
    N.push("");
    N.push("    la del trigger, L628-652, la viva: 25 líneas, cero bucles, un SELECT sin candado, un");
    N.push("      INSERT con ON CONFLICT, y NO toca cantidad_vendida, ni cantidad_reservada, ni");
    N.push("      estado_stock.");
    N.push("");
    N.push("    la de sp_registrar_venta, L662-727, la muerta: dos bucles sobre jsonb_array_elements,");
    N.push("      un FOR UPDATE de verdad, L687-690, que además resta la reservada del disponible");
    N.push("      antes de comparar, y un RAISE EXCEPTION, L693, que es el 409 que pide el documento.");
    N.push("");
    N.push("  O SEA QUE LA QUE ESTÁ MUERTA ES LA QUE HACE LO QUE EL DOCUMENTO PIDE, Y LA QUE ESTÁ");
    N.push("  VIVA NO HACE NADA DE ESO.   Y LA DIFERENCIA SE VE EN UNA LÍNEA, L687: la función muerta");
    N.push("  resta la reservada del disponible, que es justo lo que el trigger no hace.");
    N.push("");
    N.push("  Y UN DATO SOBRE LAS COLUMNAS: cantidad_vendida se escribe en 2 sitios del proyecto, y");
    N.push("  los 2 son de cobro, Pagos L341 y L711.   En el esquema NINGUNA de las ocho funciones la");
    N.push("  escribe, ni la muerta sp_registrar_venta.");
    N.push("");
    N.push("LO QUE ESTÁ BIEN, Y SON CINCO COSAS");
    N.push("");
    N.push("  1. EL BEFORE INSERT GUARDA EL ANTES Y EL DESPUÉS, Y ESO NADIE MÁS LO HACE.   L641-642:");
    N.push("     NEW.stock_anterior := v_disponible, y NEW.stock_posterior := v_disponible +");
    N.push("     NEW.cantidad.   Son dos columnas de la propia tabla de movimientos, y quedan rellenadas");
    N.push("     sin que el código las nombre.   Eso convierte el Kardex en un libro mayor real, con el");
    N.push("     saldo antes y después de cada movimiento, y es gratis.   En todo el proyecto no hay");
    N.push("     otro sitio donde se guarde el antes de un cambio.");
    N.push("");
    N.push("  2. Y EL ON CONFLICT ES LA DECISIÓN CORRECTA.   L645-648 hace las dos cosas en una");
    N.push("     sentencia: si la prenda no tenía fila, la crea, y si la tenía, la suma.   Sin eso");
    N.push("     habría que hacer un SELECT y un UPDATE en dos sentencias, con una ventana entre");
    N.push("     medias.   Y funciona porque UNIQUE (id_ptc, id_sucursal) existe, schema L310, y es la");
    N.push("     primera vez en la serie que un índice del esquema hace falta para que algo funcione.");
    N.push("");
    N.push("  3. Y LA FECHA LA PONE EL MOTOR, L643, con NEW.fecha := NOW().   El código no manda la");
    N.push("     fecha, así que no puede mandarla mal.");
    N.push("");
    N.push("  4. Y LA GARANTÍA DE ATOMICIDAD SÍ ESTÁ, y es por la vía correcta.   El documento promete");
    N.push("     en L177 que no se genera venta sin descuento ni descuento sin venta.   Y eso es");
    N.push("     verdad: dataSource.transaction de TypeORM, que abre en Pagos L276 para la caja y en");
    N.push("     L647 para el digital, y que se cierra sola al acabarse el callback.   El trigger, el");
    N.push("     INSERT del movimiento y el UPDATE de cantidad_vendida de L711 están DENTRO.   Un");
    N.push("     autor que entiende de dónde viene su garantía es un autor que la ha pensado.");
    N.push("");
    N.push("  5. Y LA FUNCIÓN ES CORTA Y SE LEE.   25 líneas, con un SELECT, tres asignaciones, un IF");
    N.push("     y un INSERT.   No hay ni una variable muerta, ni un parámetro sin usar, ni una consulta");
    N.push("     de más.   Para estar en PL/pgSQL, que suele ser ilegible, esta función es un ejemplo.");
    N.push("     Y la razón por la que se entiende es que hace UNA cosa, y la hace en el motor.   Si los");
    N.push("     dos IF y el GREATEST que le faltan los escribió alguien que la hubiera leído, esta");
    N.push("     función arreglaba los hallazgos 1, 2 y 4 de este diagrama.");
    N.push("");
    N.push("SOBRE LA COLOCACIÓN DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Anchura: las nueve cabeceras separadas " + PASO + " px, con " + ANCHO_CAB + " de ancho. Quedan");
    N.push("  65 px entre una y otra. Altura: " + PASO_MSG + " px por mensaje. El mensaje 1 cae en la y " + Y_MSG0);
    N.push("  y el " + TOTAL_MSG + " en la y " + (Y_MSG0 + (TOTAL_MSG - 1) * PASO_MSG) + ".");
    N.push("");
    N.push("  Un detalle que hizo fallar estos diagramas dieciséis veces: EA guarda Top y Bottom en");
    N.push("  NEGATIVO, porque trabaja en coordenadas cartesianas con la Y creciendo hacia arriba. Si se");
    N.push("  le pasa la Y en positivo no da error, simplemente no coloca nada y todos los objetos se");
    N.push("  quedan en el mismo punto. En las dos funciones de colocación de este script está escrito");
    N.push("  o.Top = 0 - y y o.Bottom = 0 - y - alto. En el AddNew, en cambio, la Y va en positiva.");
    N.push("");
    N.push("  Y ESTE CASO TIENE UNA COSA QUE LOS OTROS NO, y hay que avisar: la banda de hallazgos es");
    N.push("  MUCHO más ALTA que el diagrama.   Los ocho hallazgos son largos, y bajan bastante más de lo");
    N.push("  que suben los " + TOTAL_MSG + " mensajes.   Y no pasa nada, porque la banda está en la x " + X_NOTA + ",");
    N.push("  a la derecha de todo.   Lo que no puede pasar nunca es que se solape en ANCHO, y eso está");
    N.push("  comprobado.   Y que la banda fuera tan alta no es por diagramas largos: es por hallazgos");
    N.push("  largos, que es justo lo que pasó con el hallazgo 3, que nació de contar dos escrituras.");
    N.push("");
    N.push("  Comprobación de esta ejecución, leída del modelo de objetos:");
    N.push("    objetos en el diagrama: " + ch.leidos);
    N.push("    con la Y crecida, o sea colocados: " + ch.bien);
    N.push("    mensajes dibujados: " + r.puestos + " de " + TOTAL_MSG);
    N.push("    mensajes a sí mismo: " + r.autodestino);
    N.push("    conectores en el diagrama: " + r.enDiagrama);
    N.push("    MARCOS de fragmento colocados: " + MARCOS_PUESTOS + " de 0");
    N.push("    BARRAS de activación colocadas: " + BARRAS_PUESTAS + " de 2");
    N.push("");
    N.push("  Y UN AVISO MÁS IMPORTANTE QUE EN LOS OTROS CASOS: LOS MARCOS SON CERO, Y NO ES UN ERROR");
    N.push("  NI UN OLVIDO.   La función que hace este caso no tiene ni un bucle ni un alt, y los cinco");
    N.push("  bucles que hay en el esquema están en cuatro funciones que nadie ejecuta.   Las dos barras");
    N.push("  SÍ son formas dibujadas por script, y cada una va en try/catch y cuenta las que ha puesto.");
    N.push("");
    N.push("  Y EL AVISO MÁS ÚTIL DE TODOS PARA QUIEN TENGA QUE ARREGLAR ESTE CASO: casi todo está");
    N.push("  en la línea 648 del esquema, que es donde está la única escritura del caso, y en la");
    N.push("  línea 710 de SRV_ReservasService, que es donde está el + que sobra.   Y NINGUNO de los");
    N.push("  dos es un fichero .ts del módulo de pagos.   Las cuatro cosas que faltan son: un IF o un");
    N.push("  GREATEST para que el disponible no baje de cero, el estado_stock de L242 para que las 6");
    N.push("  validaciones que lo leen dejen de ser de adorno, el traslado de la reservada, y borrar");
    N.push("  el + de L710 o el signo del movimiento de L703, pero no los dos.");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU31 Secuencia", 0); } catch (e) { }
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
    T.push("CU31 - DIAGRAMA DE SECUENCIA - INFORME");
    T.push("");
    T.push("Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB);
    T.push("Tipo de diagrama: " + tipoUsado);
    T.push("Mensajes: " + r.puestos + " de " + TOTAL_MSG);
    T.push("Mensajes a sí mismo: " + r.autodestino);
    T.push("Conectores en el diagrama: " + r.enDiagrama);
    T.push("Hallazgos: " + h2.total + " de " + TOTAL_HAL + ", banda hasta la y " + h2.fin);
    T.push("");
    T.push("AVISO DE NUMERACIÓN  <-- LEE ESTO");
    T.push("El NÚMERO y el TÍTULO no van juntos en ningún sitio del proyecto.");
    T.push("  2.2 Casos de Uso.md L79   este caso es el CU39, con este título");
    T.push("  2.2 Casos de Uso.md L66   el CU31 real es el vestidor físico");
    T.push("Este diagrama dibuja el caso del TÍTULO, que es el CU39 del proyecto.");
    T.push("Y EN EL CÓDIGO ESTE CASO NO TIENE NÚMERO: es el único de la serie");
    T.push("sin endpoint, sin servicio, sin método y sin pantalla. No sale en");
    T.push("api.ts, ni en el router, ni en los menús. No se puede invocar ni");
    T.push("probar desde el front ni desde un test de API.");
    T.push("");
    T.push("Y LA MITAD DEL CASO ESTÁ EN PL/PGSQL, no en TypeScript. La parte");
    T.push("que MUEVE el stock, o sea el disponible, solo existe en el");
    T.push("esquema. Y las escrituras de las dos columnas del documento son:");
    T.push("  cantidad_disponible   2 sitios: el trigger de L648, y");
    T.push("                          SRV_ReservasService L710, que suma dos veces");
    T.push("  cantidad_vendida      2 sitios: Pagos L341 y L711, los de cobro");
    T.push("                          Y NINGUNA en el esquema, ni en la muerta");
    T.push("");
    T.push("MARCOS Y BARRAS  <-- MIRA ESTO, ES LA PRIMERA VEZ");
    T.push("Este caso tiene CERO loop y CERO alt. Y no es un error ni un olvido.");
    T.push("Contado ANTES de dibujar, con contadores, sobre LAS DOS");
    T.push("implementaciones del caso que hay en el esquema. Y con un truco:");
    T.push("la palabra LOOP sale DOS VECES por bucle, una en el FOR .. LOOP");
    T.push("y otra en el END LOOP, así que hay que restar.");
    T.push("  fn_aplicar_movimiento_inventario  L628-652  LA VIVA");
    T.push("    LOOP 0  END LOOP 0  WHILE 0  RETURNS TRIGGER");
    T.push("  sp_registrar_venta     L662-727  MUERTA  LOOP 4  END LOOP 2  = 2");
    T.push("  sp_registrar_reserva   L728-773  MUERTA  LOOP 2  END LOOP 1  = 1");
    T.push("  sp_registrar_devolucion L774-810  MUERTA  LOOP 2  END LOOP 1  = 1");
    T.push("  sp_registrar_recepcion L811-847  MUERTA  LOOP 2  END LOOP 1  = 1");
    T.push("  fn_detectar_stock_bajo L848-872  MUERTA  LOOP 0  END LOOP 0  = 0");
    T.push("  fn_kardex_producto     L873-892  MUERTA  LOOP 0  END LOOP 0  = 0");
    T.push("");
    T.push("De las 8 funciones del esquema, UNA está viva, que es la del");
    T.push("trigger de L654 y la de este caso. UNA tiene trigger duplicado, que");
    T.push("es fn_incrementar_intentos de L608, porque SRV_AuthService L61-64");
    T.push("hace lo mismo en TypeScript. Y LAS SEIS RESTARES NO LAS LLAMA");
    T.push("NADIE: cero llamadas a sp_ o fn_ desde el código, en los 147");
    T.push("ficheros .ts y .tsx del prototipo.");
    T.push("");
    T.push("O SEA QUE HAY CINCO BUCLES EN EL ESQUEMA, Y LOS CINCO ESTÁN EN");
    T.push("CUATRO FUNCIONES QUE NADIE EJECUTA, y la función viva que hace el");
    T.push("trabajo no tiene ni uno. Por eso este diagrama va sin un solo");
    T.push("fragmento.");
    T.push("");
    T.push("Y CERO ALTS TAMBIÉN, aunque la función tenga un IF en L637, porque sus");
    T.push("dos ramas hacen lo mismo. Y el ON CONFLICT DO UPDATE de L647-648,");
    T.push("que sí son dos caminos, es una cláusula de SQL.");
    T.push("");
    T.push("Fragmentos colocados: " + MARCOS_PUESTOS + " de 0");
    T.push("Barras de activación colocadas: " + BARRAS_PUESTAS + " de 2");
    T.push("Los 0 marcos son correctos para este caso. Si en el futuro se");
    T.push("arregla y se meten bucles en la función, el contador lo dirá.");
    T.push("Las 2 barras son FORMAS dibujadas por script, no fragmentos");
    T.push("nativos de EA: cada una va en try/catch y cuenta las que ha puesto.");
    T.push("");
    T.push("HALLAZGOS");
    T.push("  1  El disponible puede quedar NEGATIVO y nadie lo comprueba.");
    T.push("     L645-648 no tiene IF, ni RAISE, ni GREATEST, ni CLAMP. Y el");
    T.push("     documento lo prohíbe, L176. La comprobación existe, pero");
    T.push("     ANTES de escribir y en otro sitio: Pagos L312 y L680,");
    T.push("     Reservas L1102 y Ventas L480. Y hay 3 caminos que insertan sin");
    T.push("     validar: el ON CONFLICT cuando la fila no existe, el ajuste de");
    T.push("     CU24, y cualquier movimiento futuro. Y la tabla no tiene CHECK.");
    T.push("  2  estado_stock NO lo escribe nadie, y 6 módulos lo usan para");
    T.push("     decidir si hay stock. CERO escrituras de esa columna en los");
    T.push("     147 ficheros .ts y .tsx y en todo el esquema. Así que está");
    T.push("     siempre en 'Disponible', su DEFAULT de L242. Y OJO: dos de");
    T.push("     las 6 comparaciones no pueden ser ciertas ni por mayúsculas,");
    T.push("     porque buscan 'sin stock' y 'disponible' en minúscula. Las 4");
    T.push("     otras son siempre ciertas. CONSECUENCIA: el carrito, la");
    T.push("     reserva y la caja ofrecen prendas agotadas, y las");
    T.push("     recomendaciones no, porque ese sí mira la cantidad real.");
    T.push("  3  FINALIZAR UNA RESERVA DEVUELVE EL DISPONIBLE DOS VEZES. El más");
    T.push("     grave de negocio, y el más nuevo. cantidad_disponible se");
    T.push("     escribe en 2 sitios del proyecto: el trigger de L648 y");
    T.push("     Reservas L710. Y L710 es un + sobre un movimiento que el");
    T.push("     trigger ya ha sumado, en el MISMO bucle, L697-714. Y ese");
    T.push("     código lo ejecuta finalizarReserva L826, que es cuando el");
    T.push("     cliente SE LLEVA la prenda. O sea que la ropa sale de la");
    T.push("     tienda y el disponible sube el doble. Y comparar: crearReserva");
    T.push("     lo hace bien con el signo contrario, y cancelar lo hace bien");
    T.push("     creditando una vez. EL ARREGLO ES UNA LÍNEA: L710 no");
    T.push("     debería existir.");
    T.push("  4  El traslado de la reservada, que el documento pide y nadie hace.");
    T.push("     La columna se escribe en 4 sitios: 3 en Reservas, L1117, L709");
    T.push("     y L979, y 1 en schema.sql L761, en la función muerta.");
    T.push("     Ninguno en un camino de pago, y este caso tampoco.");
    T.push("  5  El Kardex invierte el signo de las TRES salidas de reserva.");
    T.push("     AdminKardex L34 las multiplica por -1, y en la base una está");
    T.push("     negativa y dos positivas, escritas por tres autores distintos.");
    T.push("     Así que las tres salen con el signo invertido. Y la rama de");
    T.push("     ENTRADA está muerta: ningún tipo vivo empieza por ENTRADA.");
    T.push("  6  El SELECT del trigger NO lleva FOR UPDATE, y el documento lo");
    T.push("     pide, y de las tres columnas solo trae una. El stock siempre");
    T.push("     queda bien, porque el ON CONFLICT sí bloquea, pero el");
    T.push("     HISTORIAL puede mentir: dos ventas a la vez guardan el mismo");
    T.push("     stock_anterior.");
    T.push("  7  Hay 8 funciones de esquema, 7 muertas, 5 bucles, y DOS");
    T.push("     implementaciones distintas de este caso. La MUERTA,");
    T.push("     sp_registrar_venta L662, es la que hace lo que el documento");
    T.push("     pide, con FOR UPDATE de verdad, la reservada restada y un RAISE");
    T.push("     EXCEPTION. La VIVA no hace nada de eso.");
    T.push("  8  Y cinco cosas buenas. El BEFORE INSERT guarda el antes y el");
    T.push("     después del stock, L641-642, y eso no lo hace nadie más en");
    T.push("     todo el proyecto. Y el ON CONFLICT es la decisión correcta.");
    T.push("     Y la atmicidad viene de dataSource.transaction, que sí existe.");
    T.push("");
    T.push("COLOCACIÓN");
    T.push("Objetos en el diagrama: " + ch.leidos);
    T.push("Con la Y crecida, o sea colocados: " + ch.bien + " de " + ch.leidos);
    T.push("Banda de hallazgos en la x " + X_NOTA + ", a la derecha de todo.");
    T.push("En este caso la banda baja MUCHO más que el último mensaje, y no");
    T.push("pasa nada: lo que no puede solaparse es el ancho, y está comprobado.");
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
    msg = msg + "CU31 - Actualizar Inventario Tras Venta (Automático)" + SALTO;
    msg = msg + "Diagrama de secuencia, sección 3.3.2.1." + SALTO + SALTO;
    msg = msg + "AVISO: el número y el título no van juntos." + SALTO;
    msg = msg + "En 2.2 Casos de Uso.md, este caso es el CU39 (L79) y el" + SALTO;
    msg = msg + "CU31 real (L66) es el vestidor físico.  Este diagrama es" + SALTO;
    msg = msg + "el del título, que es el CU39 del proyecto." + SALTO;
    msg = msg + "Y en el código este caso no tiene número: es el único sin" + SALTO;
    msg = msg + "endpoint, servicio, método ni pantalla." + SALTO + SALTO;
    msg = msg + "9 líneas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "CERO loop y CERO alt, y no es un olvido.  La función viva," + SALTO;
    msg = msg + "fn_aplicar_movimiento_inventario L628-652, no tiene ninguno." + SALTO;
    msg = msg + "Los CINCO bucles del esquema están en sp_registrar_venta," + SALTO;
    msg = msg + "sp_registrar_reserva, sp_registrar_devolucion y" + SALTO;
    msg = msg + "sp_registrar_recepcion, que NO LLAMA NADIE.  De las 8" + SALTO;
    msg = msg + "funciones, una viva, una con trigger duplicado por el TS, y" + SALTO;
    msg = msg + "seis sin usar." + SALTO;
    msg = msg + "FRAGMENTOS colocados: " + MARCOS_PUESTOS + " de 0." + SALTO;
    msg = msg + "BARRAS colocadas: " + BARRAS_PUESTAS + " de 2." + SALTO + SALTO;
    msg = msg + "HALLAZGO MÁS GRAVE DE NEGOCIO, Y ES NUEVO:" + SALTO;
    msg = msg + "finalizar una reserva devuelve el disponible DOS VEZES." + SALTO;
    msg = msg + "cantidad_disponible se escribe en 2 sitios: el trigger de" + SALTO;
    msg = msg + "L648, y Reservas L710, que es un + encima del + que ya" + SALTO;
    msg = msg + "hizo el trigger, en el mismo bucle.  Y lo ejecuta" + SALTO;
    msg = msg + "finalizarReserva L826, que es cuando el cliente se lleva la" + SALTO;
    msg = msg + "prenda.  El arreglo es una línea: L710 no debería existir." + SALTO + SALTO;
    msg = msg + "Y el disponible puede quedar NEGATIVO: L645-648 no tiene IF," + SALTO;
    msg = msg + "ni RAISE, ni GREATEST, y la tabla no tiene CHECK." + SALTO + SALTO;
    msg = msg + "Y estado_stock NO LO ESCRIBE NADIE: cero escrituras en los" + SALTO;
    msg = msg + "147 ficheros.  Así que está siempre en 'Disponible' y las" + SALTO;
    msg = msg + "6 validaciones que lo leen no validan nada." + SALTO + SALTO;
    msg = msg + "La mitad del caso está en PL/pgSQL.  Para arreglarlo, el sitio" + SALTO;
    msg = msg + "es la línea 648 del esquema y la 710 de Reservas, y no" + SALTO;
    msg = msg + "ningún fichero .ts del módulo de pagos." + SALTO + SALTO;
    msg = msg + "Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACIÓN: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU31 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU31 Secuencia", 0); } catch (e3) { }
}
