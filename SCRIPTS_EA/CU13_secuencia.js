// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU13  Consultar Disponibilidad por Sucursal
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/Producto.tsx                     la ficha
//     web/src/pages/Catalogo.tsx                     L78 y L286, dos mas
//     web/src/lib/api.ts                             L1302-1306
//     api/src/modulos/catalogo/CTR_Catalogo.ts       L49-57, dos endpoints
//     api/src/modulos/catalogo/SRV_CatalogoService.ts L102-216, 116 lineas
//     BASE DE DATOS/schema.sql                       L302-311, L331-339,
//                                                    L848-868
//
//   Cada mensaje lleva la linea del fichero de la que sale.
//
// QUE HACE ESTE CASO, Y POR QUE ES EL MAS LARGO EN CODIGO
//   consultarDisponibilidad, L102-216, son 116 lineas: el metodo mas largo
//   de todo el modulo de catalogo, y de los que lleva. Son 5 consultas,
//   SECUENCIALES, sin un solo Promise.all, para contestarle a una persona
//   "de que color me queda esta talla, y en que tienda".
//
//   Y aqui aparecen dos hallazgos que no habian salido en los doce casos
//   anteriores, y los dos son sobre el mismo dato: el stock.
//
//   1. EL CATALOGO MUESTRA DISPONIBILIDAD QUE LA VENTA NO VA A ACEPTAR.
//      El filtro de L168 es cantidad_disponible > 0. Y el procedimiento
//      sp_registrar_venta, schema.sql L687, calcula:
//        cantidad_disponible - cantidad_reservada
//      O sea que cantidad_reservada NUNCA se resta en TypeScript. En 20
//      sitios del proyecto se lee suelta, y en ninguno se resta. La
//      resta solo existe en los dos procedimientos almacenados.
//
//   2. HAY DOS COLUMNAS PARA EL MINIMO DE STOCK, Y EL TRIGGER LEE LA
//      QUE NADIE ESCRIBE. El catalogo y el servicio de alertas usan
//      inventario_stock.stock_minimo_alert. El trigger
//      fn_detectar_stock_bajo, L865, usa alertas_stock_config.
//      stock_minimo. Y alertas_stock_config no aparece en ni un solo
//      fichero de TypeScript del proyecto: cero INSERT, cero UPDATE.
//
//   A eso se suma lo de siempre: porcentaje_iva no existe, y el JOIN a
//   ciudades de L167 es interno.
//
//   44 mensajes. 10 lineas de vida. 8 van a la base de datos, 13 son
//   mensajes a si mismo, 3 van al Map y 9 son retornos.
//   3 guardas escritas entre corchetes y 3 codigos: 200, 404 y 500, mas
//   el 42703 de Postgres, que es la columna que no existe.
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
//   convierte por su cuenta. No son contradictorias: una es la propiedad
//   del objeto y la otra es la cadena del AddNew.
//
// SIN NINGUNA LLAMADA A SQL
//   Todo se coloca con el modelo de objetos, como el diagrama de capas.
//   Nada de ExecuteSQL, Execute ni SQLQuery.
//
// Autorreparable. Una instruccion por linea. Sin continuaciones con +.
// Sin operadores ternarios. Ninguna excepcion escapa.
// ================================================================

var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var TOTAL_CAB = 10;
var TOTAL_MSG = 44;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU13 Secuencia Disponibilidad por Sucursal";
var DIAG_NOMBRE = "CU13 Consultar Disponibilidad por Sucursal";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 110;

var X_NOTA = 2675;
var ANCHO_NOTA = 520;
var Y_NOTA0 = 250;
var ALTO_LINEA_NOTA = 12;
var ALTO_MIN_NOTA = 130;
var SEPARACION_NOTA = 26;

var PLAN = [];
var ERRORES = [];
var INFORME = [];

// ---------------------------------------------------------------
// LOS DATOS
// ---------------------------------------------------------------

// Las diez cabeceras. clave, nombre, tipo, estereotipo, subtipo,
// cabecera corta, papel RUP, fichero real.
var CAB = [
    ["U", "ACTOR_Visitante", "Actor", "Lifeline", "Visitante", "pregunta por una talla", "Actor, no clase: es quien compra", "no es codigo, es cualquiera, sin login"],
    ["F", "Producto.tsx", "Object", "Lifeline", "Producto", "la ficha de la prenda", "Boundary", "web/src/pages/Producto.tsx, la unica que abre por codigo"],
    ["H", "api.ts", "Object", "Lifeline", "api", "cliente HTTP", "Boundary", "web/src/lib/api.ts, L1302-1306"],
    ["C", "CTR_Catalogo", "Object", "Lifeline", "CatalogoController", "dos rutas, un metodo", "Control", "api/src/modulos/catalogo/CTR_Catalogo.ts, L49-57"],
    ["S", "SRV_CatalogoService", "Object", "Lifeline", "CatalogoService", "116 lineas, 5 consultas", "Control", "api/src/modulos/catalogo/SRV_CatalogoService.ts, L102-216"],
    ["H2", "el Map de sucursales", "Object", "Lifeline", "Map<number, Sucursal>", "el agrupado en memoria", "Control", "api/src/modulos/catalogo/SRV_CatalogoService.ts, L173-198"],
    ["M", "inventario_stock", "Object", "Lifeline", "inventario_stock", "la tabla que decide", "Control", "schema.sql L302-311, 9 columnas con UNIQUE(id_ptc, id_sucursal)"],
    ["W", "producto_talla_color", "Object", "Lifeline", "producto_talla_color", "la combinacion", "Control", "schema.sql L237-244, y su UNIQUE de L243"],
    ["A", "alertas_stock_config", "Object", "Lifeline", "alertas_stock_config", "la que nadie escribe", "Control", "schema.sql L331-339, y el trigger de L848-868"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "8 tablas y 5 consultas", "Entity", "schema.sql: productos, producto_imagenes, tallas, colores, inventario_stock, sucursales, ciudades, alertas_stock_config"]
];

// Los 44 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [
    [1, "U", "F", "1. abre la ficha de una prenda, por codigo   Producto.tsx L83.   O desde una tarjeta del catalogo, que llama al mismo endpoint en L78 y L286", "S"],
    [2, "F", "H", "2. GET /api/v1/catalogo/publico/TMU-0001/disponibilidad   api.ts L1302-1306, con encodeURIComponent del codigo", "S"],
    [3, "H", "C", "3. GET sin Authorization.   El controlador no lleva @UseGuards, L15-16", "S"],
    [4, "C", "C", "4. ojo: hay dos rutas que hacen lo mismo.   L49 publico/:codigo y L54 publico/:codigo/disponibilidad, las dos llaman a consultarDisponibilidad   L51 y L56", "S"],
    [5, "C", "S", "5. consultarDisponibilidad( codigo )   L56.   116 lineas, L102-216, el metodo mas largo del servicio", "S"],
    [6, "S", "D", "6. CONSULTA 1 de 5.   SELECT p.id_producto, p.codigo, p.nombre, p.descripcion, p.precio_base, p.porcentaje_iva, c.nombre AS categoria, p.modelo_3d_url, y un subquery de producto_imagenes con es_principal = true   L104-108", "S"],
    [7, "S", "D", "7. WHERE LOWER(p.codigo) = LOWER($1) AND LOWER(p.estado) = 'activo'   L111.   Y LOWER(p.estado) = 'activo' contra un default que es 'Disponible'", "S"],
    [8, "D", "D", "8. [error 42703] porcentaje_iva no existe en productos, schema.sql L223-235.   Y como es la primera consulta, las otras cuatro no llegan a ejecutarse", "S"],
    [9, "S", "S", "9. [no hay ninguna fila] 404 'Prenda no encontrada.'   L125-127.   Ojo con el orden: el 404 tambien se pierde, porque el 42703 salta antes", "S"],
    [10, "S", "D", "10. CONSULTA 2 de 5.   SELECT t.nombre FROM producto_talla_color ptc JOIN tallas t WHERE ptc.id_producto = $1 AND LOWER(t.estado) = 'activo' GROUP BY t.nombre ORDER BY MIN(t.orden) ASC   L129-135", "S"],
    [11, "S", "D", "11. CONSULTA 3 de 5.   SELECT pi.url, pi.es_principal, col.nombre AS color, col.codigo_hex FROM producto_imagenes pi LEFT JOIN colores col WHERE pi.id_producto = $1 ORDER BY pi.es_principal DESC, pi.orden ASC, pi.id_imagen ASC   L140-144", "S"],
    [12, "S", "D", "12. CONSULTA 4 de 5.   SELECT DISTINCT col.nombre, col.codigo_hex, y un subquery correlacionado de producto_imagenes por color   L149-153", "S"],
    [13, "S", "W", "13. y los cuatro joins de esta consulta salen de producto_talla_color   L151-152.   O sea que sin combinaciones no hay colores", "S"],
    [14, "S", "D", "14. CONSULTA 5 de 5, la grande.   L158-169: inventario_stock JOIN producto_talla_color JOIN tallas JOIN colores JOIN sucursales JOIN ciudades, con 13 columnas", "S"],
    [15, "S", "M", "15. WHERE ptc.id_producto = $1 AND inv.cantidad_disponible > 0 AND LOWER(s.estado) = 'activa'   L168.   Aqui el genero femenino SI es el correcto: sucursales.estado es 'Activa'   L64", "S"],
    [16, "S", "S", "16. OJO: el filtro es cantidad_disponible > 0 y NO resta cantidad_reservada.   En los 20 sitios del proyecto que la leen, ninguno la resta", "S"],
    [17, "S", "H2", "17. el agrupado en memoria   L173-198: un Map<number, SucursalDisponibilidad> y un for.   Si la sucursal no esta, la crea con sus 6 campos   L177-184", "S"],
    [18, "H2", "H2", "18. y dentro mete una linea por combinacion, L189-197, con disponible, reservada y stock_bajo: disponible <= stockMinimo   L196", "S"],
    [19, "H2", "H2", "19. y stock_bajo sale de inventario_stock.stock_minimo_alert, L188.   O sea que aqui hay un minimo de stock en la tabla de existencias", "S"],
    [20, "H2", "A", "20. PERO el trigger que dispara las alertas de stock bajo, fn_detectar_stock_bajo L848-868, usa alertas_stock_config.stock_minimo, L865.   Otra tabla, otra columna", "S"],
    [21, "A", "A", "21. y alertas_stock_config no aparece en NI UN SOLO fichero de TypeScript del proyecto.   Cero INSERT, cero UPDATE.   Nadie la rellena nunca", "S"],
    [22, "S", "D", "22. y si el producto se.reserve entero, el catalogo lo sigue enseñando.   sp_registrar_venta, schema.sql L687, calcula cantidad_disponible - cantidad_reservada, y si da 0 o menos lanza 'Stock insuficiente'   L693", "S"],
    [23, "S", "S", "23. y 5 consultas, SECUENCIALES, sin un solo Promise.all.   Las 2 y la 3 no dependen de nada y podrian ir en paralelo   L129 y L139", "S"],
    [24, "S", "S", "24. y el precio se calcula AQUI, en TypeScript   L206: Math.round(precio_base * (1 + porcentaje_iva ?? 0 / 100) * 100) / 100.   En CU12 L263 se calcula en SQL", "S"],
    [25, "S", "C", "25. { producto, imagenes, tallas, colores, sucursales }   L200-215.   Y sucursales es un Array.from del Map   L214", "A"],
    [26, "C", "H", "26. el JSON con la prenda, sus imagenes, sus tallas, sus colores y el stock por sucursal", "A"],
    [27, "H", "F", "27. la ficha   Producto.tsx L83.   Y si venia desde una tarjeta, la tarjeta se actualiza   Catalogo.tsx L78", "A"],
    [28, "F", "F", "28. la pantalla pinta las tallas con su stock y los colores con su imagen   L124-186", "S"],
    [29, "F", "F", "29. y el boton de provar el vestidor   L283-310: busca una linea con disponible > 0 y, si no hay, con talla y color aunque no haya stock   L289-290", "S"],
    [30, "F", "H", "30. y para eso vuelve a llamar a consultarDisponibilidad   L286.   O sea que abrir la ficha y luego el vestidor hace 10 consultas, 5 por cada una", "S"],
    [31, "H", "C", "31. GET otra vez al mismo endpoint, con el mismo codigo   L1302.   Cero cache en el cliente", "S"],
    [32, "C", "S", "32. y otra vez las 5 consultas, y otra vez la primera falla con 42703   L102-216", "S"],
    [33, "S", "S", "33. [el codigo no existe] 404 otra vez   L125-127", "S"],
    [34, "S", "C", "34. la misma respuesta   L200-215", "A"],
    [35, "C", "H", "35. el JSON otra vez, con los mismos datos", "A"],
    [36, "H", "F", "36. el vestidor, si hay una linea con talla y color   L296-310", "A"],
    [37, "F", "U", "37. la persona ve de que colores y tallas hay, y en que tiendas   o no ve nada, que es lo que pasa", "A"],
    [38, "U", "F", "38. elige talla y color, y toca anadir al carrito", "S"],
    [39, "F", "H", "39. POST /api/v1/carrito.   Un caso de uso distinto, CU25, que ya no se dibuja aqui   pero que usa el id_ptc que esta consulta le devolvio   L190", "S"],
    [40, "H", "C", "40. y ahi, en el carrito, se comprueba el stock otra vez   SRV_CarritoService.   Que es donde se ve si la disponibilidad que dijo esta consulta era real", "S"],
    [41, "C", "S", "41. y si el producto estaba reservado entero, el carrito da error.   O sea que esta consulta dijo que habia y el carrito dice que no   L22 del hallazgo", "S"],
    [42, "S", "S", "42. el dato que se llevo la persona y el que se uso para comprar no son el mismo.   Este caso devuelve disponible; la venta compara disponible menos reservada   L687", "S"],
    [43, "S", "C", "43. { detalle, items } con la disponibilidad recalculada en el servidor   que es el unico sitio donde el numero es de fiar", "A"],
    [44, "C", "U", "44. o entra en el carrito, o no.   Y si no, el mensaje es de stock insuficiente, no de que la ficha estaba mal   L693 del procedimiento", "A"]
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. El catalogo ofrece stock que la venta no va a aceptar", [
        "Este es el hallazgo mas grave de los trece, y es el primero que",
        "no es una columna que falta sino un numero que no significa lo",
        "que parece.",
        "",
        "LO QUE FILTRA ESTA CONSULTA, L168:",
        "",
        "  WHERE ptc.id_producto = $1",
        "    AND inv.cantidad_disponible > 0",
        "    AND LOWER(s.estado) = 'activa'",
        "",
        "O sea que una combinacion sale si tiene unidades disponibles.",
        "cantidad_reservada no aparece en el filtro.",
        "",
        "LO QUE HACE LA VENTA, schema.sql L687, sp_registrar_venta:",
        "",
        "  SELECT cantidad_disponible - cantidad_reservada INTO v_stock",
        "  FROM inventario_stock",
        "  WHERE id_ptc = NEW.id_ptc AND id_sucursal = p_id_sucursal",
        "    FOR UPDATE",
        "",
        "  IF v_stock <= 0 THEN",
        "    RAISE EXCEPTION 'Stock insuficiente para producto %",
        "      (disponible %)', v_id_ptc, v_stock;",
        "",
        "O sea que la venta compara la DISPONIBLE MENOS LA RESERVADA.",
        "",
        "EJEMPLO CONCRETO. Un talle M negro con 3 disponibles y 3 reservadas:",
        "",
        "  esta consulta   3 > 0, sale.   La ficha lo muestra.",
        "  la venta         3 - 3 = 0, revienta con 'Stock insuficiente'.",
        "",
        "Y lo grave: cantidad_reservada NUNCA se resta en TypeScript. En 20",
        "sitios del proyecto se lee, y en ninguno se resta. Lo he mirado",
        "uno por uno: Existencias L169 y L221, Kardex L258 y L290,",
        "Pagos L670, Reservas L379 y L393, Ventas, Carrito, Sucursales. En",
        "todos es un Number(cantidad_reservada) que se devuelve tal cual.",
        "",
        "La resta solo existe en los dos procedimientos almacenados, L687",
        "y L751. O sea que la regla de disponibilidad esta escrita dos",
        "veces, en dos lenguajes, y solo una de las dos la usa el catalogo.",
        "",
        "Y hay un tercer sitio que define la disponibilidad de otra forma",
        "todavia. CU09, L399-401, para poder cerrar una sucursal:",
        "",
        "  WHERE id_sucursal = $1",
        "    AND (cantidad_disponible > 0 OR cantidad_reservada > 0)",
        "",
        "Con un OR. O sea que el mismo numero, en tres sitios, con tres",
        "criterios: mayor que cero, menos la reservada, o cualquiera de las",
        "dos."
    ]],
    ["2. Dos columnas para el minimo, y el trigger lee la que nadie escribe", [
        "El otro hallazgo nuevo de este caso, y es el mismo patron que el",
        "de las columnas que faltan, pero en el otro extremo: hay una",
        "columna de mas.",
        "",
        "EL CATALOGO, L188 y L196, usa inventario_stock:",
        "",
        "  const stockMinimo = Number(f.stock_minimo_alert ?? 0);",
        "  stock_bajo: stockMinimo > 0 && disponible <= stockMinimo,",
        "",
        "Y el servicio de alertas usa la MISMA columna con la MISMA regla,",
        "SRV_AlertasService L206-207:",
        "",
        "  WHERE s.stock_minimo_alert > 0",
        "    AND s.cantidad_disponible <= s.stock_minimo_alert",
        "",
        "O sea que esos dos si sepillar. Los dos leen",
        "inventario_stock.stock_minimo_alert, schema.sql L309, y los dos",
        "comparan disponible contra ese minimo.",
        "",
        "EL TRIGGER, en cambio. fn_detectar_stock_bajo, L848-868:",
        "",
        "  FROM alertas_stock_config a",
        "  JOIN inventario_stock is2 ON is2.id_ptc = a.id_ptc",
        "    AND is2.id_sucursal = a.id_sucursal",
        "  ...",
        "  WHERE a.notificar_email = true",
        "    AND is2.cantidad_disponible <= a.stock_minimo",
        "",
        "O sea que el trigger lee alertas_stock_config.stock_minimo,",
        "schema.sql L336, que es OTRA TABLA y OTRA COLUMNA para el mismo",
        "concepto.",
        "",
        "Y AQUI ESTA LO GRAVE: alertas_stock_config no aparece en ni un",
        "solo fichero de TypeScript del proyecto. Cero INSERT, cero",
        "UPDATE, cero SELECT. Es una tabla que el esquema crea y que",
        "nadie, en todo el codigo, lee o escribe.",
        "",
        "Con lo cual: el trigger no puede dispararse, porque su tabla",
        "esta vacia. Y la pantalla de alertas, AdminAlertas.tsx L115, que",
        "es donde se configura el minimo, escribe en la OTRA columna:",
        "SRV_AlertasService L271 hace UPDATE inventario_stock SET",
        "stock_minimo_alert.",
        "",
        "O sea que el usuario configura un minimo, la pantalla lo guarda",
        "donde el servicio de alertas lo lee bien, y el trigger nunca se",
        "entera. La alerta por correo no existe. Es CU18 de una forma, o",
        "CU19, o el caso de alertas que sea."
    ]],
    ["3. Cinco consultas secuenciales para preguntar por una talla", [
        "116 lineas, L102-216, el metodo mas largo del modulo de",
        "catalogo. Y cinco viajes a la base de datos, uno detras de otro.",
        "",
        "  L103  el producto, con su precio y su imagen principal",
        "  L129  las tallas disponibles",
        "  L139  las imagenes, con su color",
        "  L148  los colores, con su imagen",
        "  L158  el stock, que cruza 6 tablas",
        "",
        "Y CERO Promise.all en las 116 lineas. Comprobado. Es el unico",
        "metodo del proyecto con cinco consultas asi, y el peor en ese",
        "sentido: las de L129 y L139 no dependen de nada entre si, y",
        "podrian ir en la misma Promise.all.",
        "",
        "Lo que hace que la cuenta no duela tanto es que la consulta 2 y la",
        "3 podrian ser una sola. tallas y colores salen de la misma tabla,",
        "producto_talla_color, con el mismo id_producto y el mismo filtro",
        "de estado. O sea que un solo GROUP BY con dos columnas, o un",
        "UNION, y de 5 consultas pasan a 4.",
        "",
        "Y hay una razon de peso para no paralelizar sin mas: la consulta",
        "5 es la que se lleva el 90 por ciento del trabajo, porque cruza",
        "inventario_stock, producto_talla_color, tallas, colores,",
        "sucursales y ciudades. Con el indice UNIQUE (id_ptc,",
        "id_sucursal) de L310, esa consulta es la unica bien indexada de",
        "las cinco. Las otras cuatro van por id_producto, que no tiene",
        "indice: hay 48 columnas llamadas id_sucursal en el esquema y",
        "ningun indice declarado sobre productos.id_categoria,",
        "productos.id_temporada ni producto_talla_color.id_producto.",
        "",
        "O sea que un catalogo con mil productos hace, por cada ficha que",
        "se abre, cinco consultas de las que cuatro son seqscan de",
        "producto_talla_color."
    ]],
    ["4. El JOIN interno a ciudades deja este caso sin datos", [
        "La consulta 5, L158-169, es la que trae el stock por sucursal,",
        "y por lo tanto la que responde a la pregunta del caso de uso. Y",
        "tiene seis JOIN, uno de los cuales lo vacia.",
        "",
        "  FROM inventario_stock inv",
        "  JOIN producto_talla_color ptc ON ptc.id_ptc = inv.id_ptc",
        "  JOIN tallas t ON t.id_talla = ptc.id_talla",
        "  JOIN colores col ON col.id_color = ptc.id_color",
        "  JOIN sucursales s ON s.id_sucursal = inv.id_sucursal",
        "  JOIN ciudades ci ON ci.id_ciudad = s.id_ciudad",
        "",
        "SEIS JOIN, todos interiores. Y el ultimo es a ciudades.",
        "",
        "O sea que la fila solo sale si la sucursal tiene ciudad, y la",
        "ciudad tiene que existir en la tabla. Y CU09 demostro dos cosas",
        "que se juntan aqui:",
        "",
        "  - el seed no siembra ninguna ciudad, cero INSERT",
        "  - no se pueden crear, porque la tabla ciudades no tiene la",
        "    columna departamento que el codigo usa en 6 sitios",
        "",
        "Con lo cual el stock por sucursal de este caso es SIEMPRE vacio,",
        "aunque haya stock. Y es la unica consulta que responde a la",
        "pregunta del caso de uso.",
        "",
        "Y lo que hace el fallo es silencioso, que es lo de siempre: la",
        "consulta devuelve 0 filas, el for de L174 no itera, el Map de",
        "L173 se queda vacio, y Array.from de L214 devuelve un array",
        "vacio. La respuesta es un 200 con sucursales: [].",
        "",
        "Un LEFT JOIN a ciudades habria devuelto la sucursal con la ciudad",
        "a null, que es mejor que no devolver la sucursal. Y para el",
        "cliente es peor: ve la prenda y no ve ninguna tienda, y no hay",
        "forma de distinguir 'no hay stock' de 'no hay ciudades'.",
        "",
        "Y el dato de la ciudad es lo que se ordena, L169, ORDER BY",
        "ci.nombre ASC. O sea que el orden de la respuesta depende",
        " tambien de una tabla que esta vacia."
    ]],
    ["5. El precio se calcula aqui y en CU12 lo calcula SQL", [
        "El mismo numero, en dos sitios, calculado de dos maneras, y con",
        "un default que no coincide con los de los otros casos.",
        "",
        "AQUI, L206, en TypeScript:",
        "",
        "  precio: Math.round(",
        "    Number(producto.precio_base)",
        "    * (1 + Number(producto.porcentaje_iva ?? 0) / 100)",
        "    * 100) / 100,",
        "",
        "EN CU12, L263, en SQL:",
        "",
        "  ROUND(p.precio_base * (1 + p.porcentaje_iva / 100.0), 2)",
        "    AS precio_con_iva",
        "",
        "Y los defaults para la misma columna que no existe:",
        "  SRV_CatalogoService L206   ?? 0     aqui",
        "  SRV_ProductosService L147  ?? 13    en el alta de CU10",
        "  SRV_CatalogosService L467   ?? 13    en el listado de CU11",
        "",
        "O sea que si manana se anade la columna, la ficha y el listado",
        "pueden dar precios distintos, segun por donde se mire, y nadie",
        "se entera hasta que alguien compare los dos numeros.",
        "",
        "Y el ?? 0 de L206 es el mas peligroso de los tres, porque es el",
        "unico que NO es el 13. Con el 13 pasaria: un producto sin IVA",
        "guardado tendria 13 en el alta y 13 en la lectura, coherente. Con",
        "el 0, un producto con IVA 0 guardado sale a 0 en la ficha y a 13",
        "en el listado.",
        "",
        "Y hay una cuarta cosa: la operacion se hace dos veces. L206",
        "multiplica y divide por 100 para redondear a dos decimales, y el",
        "mapper lo devuelve sin mas. O sea que el redondeo se hace una vez,",
        "bien. Pero en CU12 el redondeo lo hace el ROUND de Postgres. Dos",
        "redondeos, dos motores, dos resultados posibles en el borde."
    ]],
    ["6. Dos rutas, un metodo, y tres llamadas desde el frontend", [
        "La superficie de API esta triplicada, y eso tiene coste",
        "concreto en un caso que ya hace 5 consultas.",
        "",
        "EN EL CONTROLADOR, L49-57:",
        "",
        "  @Get('publico/:codigo')",
        "    consultarDetalle() { return ...consultarDisponibilidad(codigo) }",
        "",
        "  @Get('publico/:codigo/disponibilidad')",
        "    consultarDisponibilidad() {",
        "      return ...consultarDisponibilidad(codigo) }",
        "",
        "Los dos metodos del controlador tienen el MISMO nombre, y los dos",
        "llaman al mismo metodo del servicio. Uno de los dos sobra.",
        "",
        "Y el que usa el frontend es el segundo, api.ts L1304:",
        "  /catalogo/publico/${encodeURIComponent(codigo)}/disponibilidad",
        "",
        "O sea que la ruta publica/:codigo no la llama nadie del frontend,",
        "en ninguna parte.",
        "",
        "EN EL FRONTEND, tres llamadas al mismo endpoint:",
        "  Producto.tsx L83    al abrir la ficha",
        "  Catalogo.tsx L78    al anadir al carrito desde una tarjeta",
        "  Catalogo.tsx L286   al abrir el vestidor virtual",
        "",
        "Y las dos de Catalogo.tsx son en la misma pantalla, con el",
        "mismo codigo, en la misma sesion. O sea que si una persona abre",
        "una tarjeta, la anade al carrito y prueba el vestidor, la",
        "disponibilidad se pide tres veces y se calcula tres veces.",
        "",
        "Cada llamada son 5 consultas. O sea que 15 viajes a la base de",
        "datos para lo que en el fondo es la misma pregunta. Y no hay",
        "cache de ningun tipo en el cliente.",
        "",
        "Y el encodeURIComponent de L1304 es un detalle bien hecho: el",
        "codigo va en la URL, y sin eso un TMU con barra o espacio",
        "romperia la ruta."
    ]],
    ["7. El boton del vestidor acepta una linea sin stock", [
        "Un detalle de la pantalla que agrava el hallazgo 1, porque",
        "deja que se llegue al problema.",
        "",
        "Catalogo.tsx L287-294, dentro de probarVestidor:",
        "",
        "  const lineas = disp.sucursales.flatMap((s) => s.lineas);",
        "  const linea =",
        "    lineas.find((l) => l.disponible > 0 && l.talla && l.color) ??",
        "    lineas.find((l) => l.talla && l.color);",
        "",
        "O sea que hay dos busquedas. La primera quiere disponible > 0. La",
        "segunda, si la primera no encuentra nada, se conforma con que",
        "tenga talla y color, DA IGUAL QUE HAYA CERO STOCK.",
        "",
        "Y si aparece esa segunda linea, L292 lo dice:",
        "",
        "  setErrorVestidor(`No se pudo abrir el vestidor: ${item.nombre}",
        "    no tiene tallas/colores con stock.`)",
        "",
        "O sea que el mensaje es correcto y el caso esta bien Thought",
        "through: si no hay stock, lo dice y no abre. Eso esta bien.",
        "",
        "PERO: el fallback de la segunda linea solo se ejecuta si el",
        "Array de lineas NO esta vacio. Y el Array viene de la consulta 5,",
        "que tiene WHERE inv.cantidad_disponible > 0. O sea que si no hay",
        "stock, no hay lineas, y el fallback no encuentra nada tampoco.",
        "",
        "O sea que el fallback es codigo muerto en el camino normal. Solo",
        "se ejecutaria si la consulta cambiara el filtro. Y si alguien lo",
        "cambia para que salgan las lineas sin stock, el fallback pasaria",
        "a abrir el vestidor con una combinacion que no se puede comprar.",
        "",
        "O sea que hay dos mecanismos que se contradicen: el filtro de la",
        "consulta dice disponible > 0 y el fallback del frontend dice me",
        "vale con que exista. Con el filtro puesto, el segundo es ilisible."
    ]],
    ["8. Lo que si esta bien: el agrupado en memoria, con garantia de la base", [
        "Es la mejor pieza de este metodo, y hay que decir exactamente",
        "por que, porque es el mismo patron que el getter de roles[0] de",
        "CU01 a CU09, aqui con una diferencia que lo hace correcto.",
        "",
        "L173-198:",
        "",
        "  const sucursales = new Map<number, SucursalDisponibilidad>();",
        "  for (const f of filas) {",
        "    let item = sucursales.get(f.id_sucursal);",
        "    if (!item) {",
        "      item = { id_sucursal, nombre, direccion, ciudad,",
        "               telefono, lineas: [] };",
        "      sucursales.set(f.id_sucursal, item);",
        "    }",
        "    ...",
        "    item.lineas.push({ id_ptc, talla, color, disponible,",
        "                        reservada, stock_bajo });",
        "  }",
        "",
        "Y por que aqui si funciona y el getter no:",
        "",
        "  - El Map esta_indexado por id_sucursal, que es la clave del",
        "    inventario por combinacion, y la base lo garantiza con",
        "    UNIQUE (id_ptc, id_sucursal), schema.sql L310. O sea que",
        "    para una combinacion dada hay como mucho una fila por",
        "    sucursal. No puede haber dos filas de la misma sucursal que se",
        "    colISIONEN al agrupar.",
        "",
        "  - El getter de roles[0] indexa por lo que sea, con un array que",
        "    no tiene ORDEN, sobre una tabla con PRIMARY KEY (id_usuario,",
        "    id_rol) que si garantiza unicidad pero no orden. La diferencia",
        "    es que aqui la clave del Map es la misma que la clave del",
        "    UNIQUE, y alli no.",
        "",
        "Y ademas el ORDER BY de L169, que es",
        "  ORDER BY ci.nombre ASC, s.nombre ASC, t.orden ASC, col.nombre ASC",
        "hace que las lineas de cada sucursal lleguen ya agrupadas y en",
        "orden. O sea que el Map no solo agrupa, que es lo que hacia el",
        "getter, sino que ademas respeta el orden del indice.",
        "",
        "Y L196 calcula stock_bajo una vez por linea, en TypeScript, en",
        "vez de traer un CASE WHEN de la consulta. Es menos eficiente que",
        "hacerlo en SQL, pero es mas claro, y evita repetir la regla en",
        "dos lenguaje, que es justo el problema del hallazgo 2."
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

// NO se usa SaveDiagram. Se recarga el diagrama, que es lo que hace que las
// coordenadas se queden escritas. SaveDiagram las deshace.
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

// Hay que borrar TODO lo que hubiera en el diagrama, no solo las formas. Si
// se deja algo de una pasada anterior, se queda amontonado en el origen.
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU13."; } catch (e) { }
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
            // El AddNew lleva la Y en POSITIVO. EA la convierte por su cuenta.
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

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 700) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU13  Consultar Disponibilidad por Sucursal"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 700) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseno de caso de uso, seccion 3.3.2.1.  10 lineas de vida, 44 mensajes, 8 hallazgos."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja. Este es el metodo mas largo del modulo de catalogo: 116 lineas y 5 consultas secuenciales para contestarle a una persona de que color le queda esa talla. Lo que no se ve en el diagrama es el hallazgo 1: el filtro mira disponible, y la venta compara disponible menos reservada. Los dos datos son distintos y el catalogo no resta."; } catch (e) { }
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
// LOS 44 MENSAJES
// ---------------------------------------------------------------

// El conector de un mensaje va en el ELEMENTO, no en el diagrama, y su tipo
// en EA es Sequence. La etiqueta va COMPLETA, con el fichero y la linea.
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
        // El DiagramID se pone DESPUES de crear el conector. Sin esto, si el
        // diagrama se borra y se recrea, EA solo lo dibuja la primera vez.
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

// ---------------------------------------------------------------
// COMPROBACION FINAL, SOLO CON EL MODELO DE OBJETOS
// ---------------------------------------------------------------

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
    N.push("CU13  Consultar Disponibilidad por Sucursal.  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Visitante          «actor»     quien pregunta por una talla");
    N.push("    Producto.tsx             «boundary»  la ficha, la unica que abre por codigo");
    N.push("    api.ts                   «boundary»  lib/api.ts, L1302-1306");
    N.push("    CTR_Catalogo             «control»   dos rutas, un solo metodo, L49-57");
    N.push("    SRV_CatalogoService      «control»   116 lineas, L102-216, 5 consultas");
    N.push("    el Map de sucursales     «control»   L173-198, el agrupado en memoria");
    N.push("    inventario_stock         «control»   schema.sql L302-311, 9 columnas");
    N.push("    producto_talla_color     «control»   schema.sql L237-244, la combinacion");
    N.push("    alertas_stock_config     «control»   schema.sql L331-339, la que nadie escribe");
    N.push("    PostgreSQL               «entity»    8 tablas y 5 consultas");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes: 8 van a la base de datos, 13 son mensajes a si mismo, 3 van al Map y");
    N.push("  9 son retornos. 3 llevan la guarda escrita entre corchetes, y aparecen 2 codigos HTTP mas el");
    N.push("  42703 de Postgres, que es la columna que no existe.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("LO QUE SE DIBUJA: 5 CONSULTAS SECUENCIALES, SIN UN SOLO Promise.all");
    N.push("");
    N.push("  mensaje 6   el producto, con precio y imagen principal   L103-112");
    N.push("  mensaje 10  las tallas disponibles   L129-135");
    N.push("  mensaje 11  las imagenes, con su color   L139-146");
    N.push("  mensaje 12  los colores, con su imagen   L148-156");
    N.push("  mensaje 14  el stock, que cruza 6 tablas   L158-171");
    N.push("");
    N.push("  Y la 1 falla con 42703, asi que las otras cuatro no llegan a ejecutarse. Si se arregla,");
    N.push("  la 2 y la 3 no dependen de nada entre si y podrian ir en la misma Promise.all. Y la 2 y la");
    N.push("  4 podrian ser una sola consulta, porque salen de la misma tabla con el mismo filtro.");
    N.push("");
    N.push("EL HALLAZGO 1: EL CATALOGO MUESTRA STOCK QUE LA VENTA NO ACEPTA");
    N.push("");
    N.push("  El filtro de L168 es cantidad_disponible > 0. No resta nada.");
    N.push("");
    N.push("  Y sp_registrar_venta, schema.sql L687, hace:");
    N.push("    SELECT cantidad_disponible - cantidad_reservada INTO v_stock");
    N.push("    ... FOR UPDATE");
    N.push("    IF v_stock <= 0 THEN RAISE EXCEPTION 'Stock insuficiente'");
    N.push("");
    N.push("  Un talle M negro con 3 disponibles y 3 reservadas:");
    N.push("    esta consulta   3 > 0, sale.   La ficha lo muestra.");
    N.push("    la venta         3 - 3 = 0, revienta.");
    N.push("");
    N.push("  Y cantidad_reservada NUNCA se resta en TypeScript. En 20 sitios del proyecto se lee, y en");
    N.push("  ninguno se resta: Existencias, Kardex, Pagos, Reservas, Ventas, Carrito, Sucursales. La");
    N.push("  resta solo existe en los dos procedimientos almacenados, L687 y L751.");
    N.push("");
    N.push("  Y hay un tercer criterio para el mismo numero. CU09 L401, para cerrar una sucursal:");
    N.push("    (cantidad_disponible > 0 OR cantidad_reservada > 0)");
    N.push("  Con un OR. O sea que el mismo dato, en tres sitios, con tres criterios distintos.");
    N.push("");
    N.push("EL HALLAZGO 2: DOS COLUMNAS PARA EL MINIMO, Y EL TRIGGER LEE LA QUE NADIE ESCRIBE");
    N.push("");
    N.push("  El catalogo, L188 y L196, y el servicio de alertas, L206-207, usan los dos");
    N.push("  inventario_stock.stock_minimo_alert, schema.sql L309. Esos dos se pillar.");
    N.push("");
    N.push("  El trigger fn_detectar_stock_bajo, L865, usa en cambio alertas_stock_config.stock_minimo,");
    N.push("  schema.sql L336. Otra tabla, otra columna, el mismo concepto.");
    N.push("");
    N.push("  Y alertas_stock_config no aparece en NI UN SOLO fichero de TypeScript del proyecto:");
    N.push("  cero INSERT, cero UPDATE, cero SELECT. Es una tabla que el esquema crea y que nadie");
    N.push("  lee ni escribe. La pantalla de alertas, AdminAlertas.tsx L115, configura el minimo en la");
    N.push("  OTRA columna: SRV_AlertasService L271 hace UPDATE inventario_stock.");
    N.push("");
    N.push("  Con lo cual el trigger no puede dispararse, porque su tabla esta vacia. La alerta");
    N.push("  automatica por correo de stock bajo no existe. El servicio de alertas, que si lee la");
    N.push("  columna correcta, funciona; el trigger de la base de datos, no.");
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  El catalogo filtra por disponible > 0 y la venta compara disponible menos reservada.");
    N.push("     La reservada no se resta en ningun sitio de TypeScript. Con 3 y 3, la ficha muestra");
    N.push("     disponibilidad y el carrito dice que no hay. Y CU09 usa un tercer criterio, con OR.");
    N.push("  2  Hay dos columnas para el minimo de stock. El trigger lee alertas_stock_config, que no");
    N.push("     aparece en ni un fichero de TypeScript. La tabla esta vacia, el trigger no salta, y");
    N.push("     la alerta automatica de stock bajo no existe.");
    N.push("  3  Cinco consultas secuenciales y cero Promise.all en 116 lineas. Las de L129 y L139 no");
    N.push("     dependen de nada, y las de L129 y L148 podrian ser una sola. Y cuatro de las cinco");
    N.push("     van por id_producto, que no tiene indice.");
    N.push("  4  La consulta que responde a la pregunta del caso tiene seis JOIN, y el ultimo es a");
    N.push("     ciudades. Sin ciudades no hay stock por sucursal, y el fallo es un 200 con un array");
    N.push("     vacio, no un error.");
    N.push("  5  El precio se calcula aqui en TypeScript con un ?? 0, y en CU12 en SQL. El ?? 0 es el");
    N.push("     unico que no es 13, asi que un producto con IVA 0 daria precios distintos por donde");
    N.push("     se mire. Y el redondeo lo hacen dos motores distintos.");
    N.push("  6  Dos rutas del controlador con el mismo nombre y el mismo metodo, y la primera no la");
    N.push("     llama nadie. Y el frontend llama a este endpoint tres veces desde dos pantallas, sin");
    N.push("     cache: 15 viajes a la base de datos para la misma pregunta.");
    N.push("  7  El boton del vestidor tiene un fallback que acepta una linea con cero stock. Con el");
    N.push("     filtro de la consulta puesto, ese fallback no se puede ejecutar nunca: es codigo");
    N.push("     muerto en el camino normal, y peligroso si alguien afloja el filtro.");
    N.push("  8  Lo que si esta bien: el agrupado en memoria con un Map<number, Sucursal> es el");
    N.push("     mismo patron que el getter de roles[0] de CU01 a CU09, pero aqui la clave del Map");
    N.push("     es la misma que el UNIQUE de la base. Eso es lo que lo hace correcto.");
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  El hallazgo 1 es el primero que no es una columna que falta. En CU09, CU10 y CU11 el");
    N.push("  error era que el codigo pedia cosas que el esquema no tenia. Aqui el esquema lo tiene");
    N.push("  todo y el problema es que dos partes del proyecto usan el numero con reglas distintas:");
    N.push("  la que lo muestra y la que lo descuenta. Y el que no se descuenta es el TypeScript,");
    N.push("  que es donde se escribieron los dos.");
    N.push("");
    N.push("  El hallazgo 2 continua el de CU11 y CU12 sobre el estado, y le da la vuelta: alli el");
    N.push("  codigo pedia estados que no existian, y aqui hay un estado, stock_minimo, que existe en");
    N.push("  dos sitios y solo uno se usa. El error de fondo es el mismo, el esquema y el codigo se");
    N.push("  escribieron por separado, y aqui se ve en la otra direccion.");
    N.push("");
    N.push("  Y el hallazgo 8 es la respuesta al getter. CU01, CU04, CU05, CU06, CU07, CU08 y CU09");
    N.push("  grouping por un Map<number, Rol> sin orden y sin garantia. Aqui, CU10 y CU13 usan un");
    N.push("  Map con una clave que la base garantiza con un UNIQUE. El patron se repite; lo unico que");
    N.push("  cambia es si la clave del Map es la misma que la clave del indice.");
    N.push("");
    N.push("SOBRE LA COLOCACION DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Anchura: las diez cabeceras separadas " + PASO + " px, con " + ANCHO_CAB + " de ancho. Quedan");
    N.push("  65 px entre una y otra. Altura: " + PASO_MSG + " px por mensaje. El mensaje 1 cae en la y " + Y_MSG0);
    N.push("  y el " + TOTAL_MSG + " en la y " + (Y_MSG0 + (TOTAL_MSG - 1) * PASO_MSG) + ".");
    N.push("");
    N.push("  Un detalle que hizo fallar estos diagramas seis veces y que conviene no");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU13 Secuencia", 0); } catch (e) { }
        return;
    }
    INFORME.push("tipo de diagrama: " + tipoUsado);
    if (tipoUsado != DIAG_TIPO) ERRORES.push("el diagrama es de tipo " + tipoUsado + " y no " + DIAG_TIPO + ": las lineas de vida no se veran");
    diag.Update();
    try { paq.Diagrams.Refresh(); } catch (e) { }

    // PASADA 1. Se borra todo lo que hubiera y se coloca. Esta pasada sola no
    // basta: EA todavia no ha calculado ningun tamano y las coordenadas estan
    // solo en memoria.
    borrarTodo(diag);
    colocarCabeceras(diag, C);
    tituloYLeyenda(diag);
    var h1 = colocarHallazgos(diag, paq);
    diag = guardarYRecargar(diag);

    // PASADA 2. Se borra y se vuelve a colocar, con el diagrama ya
    // recargado, que es cuando las coordenadas se quedan escritas.
    borrarTodo(diag);
    colocarCabeceras(diag, C);
    tituloYLeyenda(diag);
    var h2 = colocarHallazgos(diag, paq);
    if (h1.total != h2.total) ERRORES.push("los hallazgos no se colocan igual en las dos pasadas");
    INFORME.push("hallazgos colocados: " + h2.total + " de " + TOTAL_HAL);

    diag = guardarYRecargar(diag);

    var r = dibujarMensajes(diag, C);
    diag = guardarYRecargar(diag);

    var ch = comprobar(diag);
    INFORME.push("objetos: " + ch.leidos + ", colocados: " + ch.bien);
    INFORME.push("primeras coordenadas: " + ch.muestra);

    notasDelDiagrama(diag, r, h2, ch);

    var T = [];
    T.push("CU13 - DIAGRAMA DE SECUENCIA - INFORME");
    T.push("");
    T.push("Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB);
    T.push("Tipo de diagrama: " + tipoUsado);
    T.push("Mensajes: " + r.puestos + " de " + TOTAL_MSG);
    T.push("Mensajes a si mismo: " + r.autodestino);
    T.push("Conectores en el diagrama: " + r.enDiagrama);
    T.push("Hallazgos: " + h2.total + " de " + TOTAL_HAL + ", banda hasta la y " + h2.fin);
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
    msg = msg + "CU13 - Consultar Disponibilidad por Sucursal" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "EL CATALOGO MUESTRA STOCK QUE LA VENTA NO ACEPTA." + SALTO;
    msg = msg + "Filtra por disponible > 0. La venta compara" + SALTO;
    msg = msg + "disponible MENOS reservada. Y la reservada no se" + SALTO;
    msg = msg + "resta en ningun sitio de TypeScript: 20 sitios, 0 restas." + SALTO + SALTO;
    msg = msg + "Y hay dos columnas para el minimo de stock. El" + SALTO;
    msg = msg + "trigger lee alertas_stock_config, que no aparece" + SALTO;
    msg = msg + "en ni un fichero de TypeScript. La tabla esta vacia" + SALTO;
    msg = msg + "y el trigger no puede dispararse nunca." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU13 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU13 Secuencia", 0); } catch (e3) { }
}
