// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU12  Consultar Catalogo con Filtros (Web y Movil)
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/Catalogo.tsx                    701 lineas
//     web/src/lib/api.ts                            L1040-1075
//     api/src/main.ts                               L22-43 ValidationPipe
//     api/src/modulos/catalogo/CTR_Catalogo.ts      74 lineas, 4 endpoints
//     api/src/modulos/catalogo/SRV_CatalogoService.ts 341 lineas
//     BASE DE DATOS/schema.sql                      L191, L223-253, L302-311
//
//   Cada mensaje lleva la linea del fichero de la que sale.
//
// QUE HACE ESTE CASO, Y POR QUE ES EL MAS GRAVE DE LOS DOCE
//   Es el unico caso de uso publico del proyecto: el controlador no
//   lleva @UseGuards, L15-16, y cualquiera sin cuenta puede llamarlo.
//
//   Y aqui la columna que no existe, porcentaje_iva, se nota mas que en
//   ningun otro caso, por una razon concreta:
//
//   EL PRECIO CON IVA SE CALCULA EN SQL. L263:
//
//     ROUND(p.precio_base * (1 + p.porcentaje_iva / 100.0), 2)
//            AS precio_con_iva
//
//   O sea que el precio que ve el cliente no se calcula en el backend ni
//   en el frontend: se calcula en la consulta. Si la columna no existe,
//   la consulta no compila, y no hay precio. Y Catalogo.tsx L147 pinta
//   exactamente ese campo:
//
//     <Precio valor={item.precio_con_iva} />
//
//   Y a eso se le suma un filtro de estado, L226, que es
//   LOWER(p.estado) = 'activo' contra un default que es 'Disponible'.
//   Y no hay ni un producto en el seed, y CU10, que es el alta, falla.
//
//   O sea que la tienda devuelve una lista vacia. Y si la devolviera,
//   sin precios. Y la ficha, L167, hace un JOIN INTERNO a ciudades, que
//   CU09 demostro que no se pueden crear. O sea que este caso depende de
//   que se arreglen CU09 y CU10, y es la cadena de tres casos mas larga
//   del proyecto.
//
//   Y el caso se llama "Web y Movil". En PROTOTIPO/ solo hay dos
//   carpetas: api/ y web/. No hay app movil de ningun tipo.
//
//   44 mensajes. 10 lineas de vida. 7 van a la base de datos, 16 son
//   mensajes a si mismo, 2 van al helper de filtros y 9 son retornos.
//   6 guardas escritas entre corchetes y 5 codigos: 200, 404, 422, 500 y
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
var PAQ_NOMBRE = "CU12 Secuencia Catalogo Publico con Filtros";
var DIAG_NOMBRE = "CU12 Consultar Catalogo con Filtros";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 112;

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
    ["U", "ACTOR_Visitante", "Actor", "Lifeline", "Visitante", "quien navega sin cuenta", "Actor, no clase: es quien compra", "no es codigo, es cualquiera, sin login"],
    ["F", "Catalogo.tsx", "Object", "Lifeline", "Catalogo", "la tienda", "Boundary", "web/src/pages/Catalogo.tsx, 701 lineas"],
    ["H", "api.ts", "Object", "Lifeline", "api", "cliente HTTP", "Boundary", "web/src/lib/api.ts, L1040-1075"],
    ["C", "CTR_Catalogo", "Object", "Lifeline", "CatalogoController", "cuatro endpoints, sin guard", "Control", "api/src/modulos/catalogo/CTR_Catalogo.ts, 74 lineas"],
    ["P", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "no toca el query", "Control", "api/src/main.ts, L22-43, es global"],
    ["S", "SRV_CatalogoService", "Object", "Lifeline", "CatalogoService", "341 lineas", "Control", "api/src/modulos/catalogo/SRV_CatalogoService.ts, 341 lineas"],
    ["H2", "construirFiltrosPublico", "Object", "Lifeline", "construirFiltrosPublico", "el que arma la clausula", "Control", "api/src/modulos/catalogo/SRV_CatalogoService.ts, L218-247"],
    ["I", "inventario_stock", "Object", "Lifeline", "inventario_stock", "la segunda condicion fija", "Control", "schema.sql L302-311, y el EXISTS de L227"],
    ["T", "producto_talla_color", "Object", "Lifeline", "producto_talla_color", "tallas y colores", "Control", "schema.sql L237-244, con su UNIQUE de L243"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "6 tablas y 4 consultas", "Entity", "schema.sql: productos, categorias, producto_imagenes, tallas, colores, temporadas, ciudades, sucursales, inventario_stock"]
];

// Los 43 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [
    [1, "U", "F", "1. abre la tienda, sin cuenta y sin token   Catalogo.tsx, 701 lineas.   Este es el unico caso de uso publico del proyecto", "S"],
    [2, "F", "F", "2. el useEffect pide primero las opciones de filtro   L237-244.   Siete filtros: busqueda, categoria, talla, color, temporada, precio min y precio max", "S"],
    [3, "F", "H", "3. GET /api/v1/catalogo/publico/opciones   api.ts L1040", "S"],
    [4, "H", "C", "4. GET sin Authorization.   Y no es que falte: el controlador no lleva @UseGuards, L15-16.   Cualquiera puede llamarlo, y sin credenciales no hay consulta de permiso", "S"],
    [5, "C", "S", "5. opcionesFiltros()   L46, sin usuario y sin permiso.   No hay ninguno que comprobar, y es lo correcto en un catalogo publico", "S"],
    [6, "S", "D", "6. 4 SELECT en Promise.all   L325-338: categorias, tallas, colores y temporadas.   Los tres primeros con LOWER(estado) = 'activo'", "S"],
    [7, "D", "D", "7. y el cuarto es la trampa: temporadas se filtra con LOWER(estado) = 'activa', en genero femenino, y su default es 'Programada'   L336 y L191.   El desplegable sale vacio siempre", "S"],
    [8, "S", "C", "8. { categorias, tallas, colores, temporadas }, con la de temporadas vacia   L339", "A"],
    [9, "C", "H", "9. el JSON de las cuatro opciones", "A"],
    [10, "H", "F", "10. setOpciones   y tres desplegables con contenido y el cuarto sin nada   L237", "A"],
    [11, "F", "H", "11. GET /api/v1/catalogo/publico?busqueda=&categoria=&talla=&color=&temporada=&precio_min=&precio_max=   api.ts L1055", "S"],
    [12, "H", "C", "12. GET con los siete query params, mas pagina y limite", "S"],
    [0, "C", "P", "0. y el ValidationPipe no interviene.   El @Query es Record<string, string>, un tipo anonimo que desaparece al compilar, y el pipe solo valida lo que tiene metadatos de clase   CTR_Catalogo L20", "S"],
    [13, "C", "C", "13. entero() y decimal() validan a mano   L59-73.   Hace falta porque el @Query es Record<string, string>, un tipo anonimo, y el ValidationPipe se lo salta entero, como en CU08", "S"],
    [14, "C", "C", "14. [precioMin > precioMax] 422 'Rango de precio invalido.'   L26-28.   El unico 422 del caso, y esta bien puesto", "S"],
    [15, "C", "C", "15. limite con tope de 100 en el servidor, no en el cliente   L22, con LIMITE_MAX = 100 de L13.   Un recorte de verdad", "S"],
    [16, "C", "S", "16. listarPublico( filtros )   L41", "S"],
    [17, "S", "H2", "17. construirFiltrosPublico, L218-247.   El helper mejor escrito del proyecto: un contador de parametros, y push() devuelve el $n que toca   L220-223.   Cero valores interpolados", "S"],
    [18, "H2", "H2", "18. y antepone SIEMPRE dos condiciones fijas, L225-228: LOWER(p.estado) = 'activo'   L226, y un EXISTS sobre inventario_stock con cantidad_disponible > 0   L227", "S"],
    [19, "S", "I", "19. el EXISTS de L227 entra por producto_talla_color, o sea que un producto sale solo si tiene una combinacion con stock.   Y aqui si: inventario_stock existe, L302-311, con 9 columnas y UNIQUE(id_ptc, id_sucursal).   Consulta 1 de 4", "S"],
    [20, "S", "D", "20. SELECT COUNT(DISTINCT p.id_producto) FROM productos WHERE la clausula   L253.   Con DISTINCT, que es lo correcto, y con los mismos parametros", "S"],
    [21, "S", "S", "21. [total === 0] devuelve { items: [], total: 0 } sin lanzar la segunda consulta   L257-259.   Un atajo bien puesto, y es el que hace el fallo silencioso", "S"],
    [22, "S", "D", "22. SELECT DISTINCT p.id_producto, p.codigo, p.nombre, ROUND(p.precio_base * (1 + p.porcentaje_iva / 100.0), 2) AS precio_con_iva, p.precio_base, p.porcentaje_iva, c.nombre AS categoria, y un subquery de producto_imagenes   L261-270.   Consulta 2 de 4.   ORDER BY p.nombre ASC, LIMIT $n OFFSET $n+1   L271-272", "S"],
    [23, "D", "D", "23. [error 42703] la columna porcentaje_iva no existe.   Y el precio con IVA se calculaba EN ESTA CONSULTA, asi que no hay precio que devolver.   Consulta 3 de 4", "S"],
    [24, "S", "T", "24. la consulta de combinaciones, L287-299: un ARRAY(SELECT DISTINCT) de tallas y otro de colores por producto, con WHERE ptc.id_producto = ANY($1::int[])", "S"],
    [25, "S", "S", "25. y el mapa se arma con un Map<number, ...> y un for   L302-305.   Sin getter, y con ANY en vez del primer elemento", "S"],
    [26, "S", "S", "26. y el precio no se recalcula: llega de la consulta, L313, y el mapper solo le hace Number.   O sea que sin la columna no hay precio, y precio_base, que si llega, no se pinta en ningun sitio", "S"],
    [27, "S", "C", "27. { items, total }, con cada item con sus tallas y sus colores   L307-321", "A"],
    [28, "C", "H", "28. el JSON con la pagina de prendas", "A"],
    [29, "H", "F", "29. setItems y setTotal   L246-247", "A"],
    [30, "F", "F", "30. cada tarjeta pinta el nombre, el precio_con_iva, los colores como muestras y las tallas   L147-186.   Con esColorClaro de L168 para el borde de cada muestra", "S"],
    [31, "F", "F", "31. al pasar el raton por una muestra, el titulo cambia a 'Color: X'   L132 y L163.   Y hay debounce en la busqueda, L263, que CU08 no tenia", "S"],
    [32, "F", "F", "32. el scroll infinito con paginaCargada, L262, carga pagina+1 con los mismos siete filtros   L249", "S"],
    [33, "F", "U", "33. la persona ve su prenda.   O no ve ninguna, que es lo que pasa: el filtro de L226 no encuentra productos, el total da 0 y L257 corta antes de la segunda consulta", "A"],
    [34, "U", "F", "34. toca una prenda del catalogo", "S"],
    [35, "F", "H", "35. GET /api/v1/catalogo/publico/TMU-0001   api.ts L1070", "S"],
    [36, "C", "C", "36. ojo: hay dos endpoints que hacen lo mismo.   L49 publico/:codigo y L54 publico/:codigo/disponibilidad, los dos llaman a consultarDisponibilidad   L51 y L56", "S"],
    [37, "C", "S", "37. consultarDisponibilidad( codigo )   L51.   116 lineas, L102-216, el metodo mas largo del servicio", "S"],
    [38, "S", "D", "38. SELECT p.id_producto, p.codigo, p.nombre, p.precio_base, p.porcentaje_iva, c.nombre, p.modelo_3d_url, y un subquery de producto_imagenes con es_principal   L104-111.   Consulta 4 de 4.   Y L111 vuelve a filtrar por LOWER(p.estado) = 'activo'", "S"],
    [39, "D", "D", "39. [error 42703] otra vez, el mismo.   Y aqui ademas L167 hace JOIN INTERNO a ciudades: sin ciudades no hay ninguna fila de disponibilidad, y CU09 demostro que no se pueden crear", "S"],
    [40, "S", "S", "40. [no existe el codigo] 404 'Prenda no encontrada.'   L125-127.   Y si existiera, L206 calcularia el precio en TypeScript, no en SQL como el listado: dos sitios para el mismo numero", "S"],
    [41, "S", "C", "41. la prenda entera, con imagenes por color, tallas, colores y el stock agrupado por sucursal en un Map   L173-198 y L200-215", "A"],
    [42, "C", "H", "42. el JSON de la ficha", "A"],
    [43, "H", "F", "43. la ficha, con el visor 3D si hay modelo_3d_url   L308.   Y L317-330 restaura la intencion de una reserva si la persona vuelve desde el checkout", "A"]
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. El precio con IVA se calcula en SQL, asi que no hay precio", [
        "Este es el hallazgo mas grave de los doce, y el mas facil de",
        "explicar: el cliente no ve un precio.",
        "",
        "LO QUE DICE EL ESQUEMA, L223-235. productos tiene 11 columnas:",
        "  id_producto, codigo, nombre, descripcion, id_categoria,",
        "  id_temporada, id_proveedor, precio_base, modelo_3d_url, estado y",
        "  fecha_registro.",
        "",
        "NO HAY porcentaje_iva. Es la tercera vez que sale, CU10, CU11 y",
        "aqui, y aqui es donde mas duele.",
        "",
        "PORQUE EL PRECIO CON IVA SE CALCULA EN LA CONSULTA, L262-263:",
        "",
        "  SELECT DISTINCT p.id_producto, p.codigo, p.nombre,",
        "         ROUND(p.precio_base * (1 + p.porcentaje_iva / 100.0), 2)",
        "           AS precio_con_iva,",
        "         p.precio_base, p.porcentaje_iva, ...",
        "",
        "Y eso, como decision de diseño, esta bien: calcularlo en la base",
        "es lo correcto para paginar y para ordenar por precio. El",
        "problema es que la columna de la que depende no existe.",
        "",
        "Y LA CADENA ES ESTA:",
        "",
        "  la consulta de L263 no compila   ->   42703   ->   500",
        "  el mapper de L313 solo hace Number de lo que le llega",
        "  Catalogo.tsx L147 pinta <Precio valor={item.precio_con_iva} />",
        "",
        "O sea que no hay un NaN ni un undefined: no hay consulta. Y el",
        "precio_base, que si existe y si llegaria, no se muestra en ningun",
        "sitio de la tarjeta, porque la unica etiqueta de precio es la de",
        "L147.",
        "",
        "Y la ficha tiene lo mismo, L104 y L119, con el SELECT y el tipo.",
        "Las dos pantallas publicas del proyecto fallan con el mismo",
        "error, que es el primero que se veria al probar la tienda."
    ]],
    ["2. El catalogo esta vacio, y la tienda depende de CU09 y CU10", [
        "La tienda no muestra nada, y no es por un motivo sino por tres,",
        "cada uno de un caso anterior.",
        "",
        "PRIMERO. La primera condicion fija de L226:",
        "",
        "  LOWER(p.estado) = 'activo'",
        "",
        "Y el default de productos.estado, L233, es 'Disponible'. Como en",
        "el hallazgo 3 de CU11.",
        "",
        "SEGUNDO. El seed no siembra ni un producto. Cero INSERT. Y CU10,",
        "que es el alta, falla con 42703 en su propio INSERT, asi que",
        "tampoco se pueden crear. Y la unica via que escribiria 'Activo'",
        "es justamente esa, SRV_ProductosService L246, que no se ejecuta.",
        "",
        "TERCERO. Y este es el mas grave, porque es una cadena: la ficha,",
        "L167, hace un JOIN INTERNO a ciudades.",
        "",
        "  JOIN ciudades ci ON ci.id_ciudad = s.id_ciudad",
        "",
        "Y CU09 demostro dos cosas: que el seed no siembra ninguna ciudad,",
        "y que no se pueden crear porque la tabla ciudades no tiene la",
        "columna departamento que el codigo usa. O sea que la ficha",
        "devuelve cero lineas de disponibilidad aunque hubiera productos.",
        "",
        "Y hay una cuarta condicion, L227, que tambien vacia: un EXISTS",
        "sobre inventario_stock con cantidad_disponible > 0, que entra",
        "por producto_talla_color. Esa tabla SI existe, L302-311, y tiene",
        "9 columnas con UNIQUE(id_ptc, id_sucursal), y la usan 11 ficheros",
        "del proyecto. Es la condicion mas bien puesta de las cuatro.",
        "",
        "PERO OJO CON EL EFECTO. El atajo de L257-259 corta antes de la",
        "segunda consulta si el total es 0. O sea que el fallo del",
        "hallazgo 1, que es un 500, se ve. Y el fallo de L226, que es una",
        "consulta correcta que devuelve 0 filas, no se ve: la pantalla",
        "pinta cero tarjetas y no hay ningun error en ninguna parte."
    ]],
    ["3. El filtro de temporadas usa el genero femenino y no puede ser cierto", [
        "El unico sitio de todo el proyecto donde el genero se cruza con",
        "un estado que no es ni activo ni inactivo.",
        "",
        "EL FILTRO, L336, el cuarto de los cuatro de opcionesFiltros:",
        "",
        "  SELECT id_temporada, nombre FROM temporadas",
        "    WHERE LOWER(estado) = 'activa'",
        "    ORDER BY fecha_inicio DESC NULLS LAST, nombre ASC",
        "",
        "EL DEFAULT, schema.sql L191:",
        "  estado VARCHAR(20) DEFAULT 'Programada'",
        "",
        "'activa' en genero femenino, como ciudades y sucursales. Y un",
        "estado que no es activo ni inactivo, sino Programada.",
        "",
        "ASI QUE: ninguna temporada podria pasar ese filtro. Ni una. El",
        "desplegable de temporadas sale vacio, y el filtro de temporada de",
        "L242 es una de las siete condiciones, o sea que tampoco se puede",
        "buscar por temporada.",
        "",
        "Y las otras tres, L327, L330 y L333, usan 'activo', y sus defaults",
        "SI son 'Activo'. O sea que tres de cuatro funcionan y la cuarta no,",
        "a nueve lineas de distancia, en la misma funcion. Es el mismo",
        "descuido de genero de CU09, pero aqui con un estado distinto.",
        "",
        "Y hay una incoherencia mas, en el filtro de busqueda por",
        "temporada, L242, que es p.id_temporada = a secas, sin AND de",
        "estado. O sea que si el desplegable llegara a tener algo, el",
        "filtro pasaria temporadas inactivas. Y CU10 hace lo contrario:",
        "L160-162 comprueba que la temporada exista y no mira su estado.",
        "",
        "Tres sitios, tres criterios, y ninguno es el del otro."
    ]],
    ["4. El precio se calcula en dos sitios, con tres valores por defecto", [
        "Un numero que aparece en dos lugares distintos, calculado de dos",
        "formas distintas, y con tres defaults diferentes para la columna",
        "que no existe.",
        "",
        "EN EL LISTADO, L263, se calcula EN SQL:",
        "",
        "  ROUND(p.precio_base * (1 + p.porcentaje_iva / 100.0), 2)",
        "    AS precio_con_iva",
        "",
        "EN LA FICHA, L206, se calcula EN TYPESCRIPT:",
        "",
        "  precio: Math.round(Number(producto.precio_base)",
        "    * (1 + Number(producto.porcentaje_iva ?? 0) / 100) * 100) / 100,",
        "",
        "O sea que el mismo numero sale de dos sitios. Si uno se arregla y",
        "el otro no, el listado y la ficha mostraran precios distintos, y",
        "nadie se enterara hasta que alguien compare los dos numeros.",
        "",
        "Y los TRES DEFAULTS para la misma columna que no existe:",
        "",
        "  SRV_CatalogoService L206     ?? 0",
        "  SRV_ProductosService L147    ?? 13",
        "  SRV_CatalogosService L467     ?? 13",
        "",
        "O sea que si se anadiera la columna, el listado y la ficha",
        "calcularian el precio con dos valores distintos, segun por donde",
        "se mire. Y en un Bolivia con IVA del 13, un producto con IVA 0 en",
        "la ficha y 13 en el listado.",
        "",
        "Y hay un cuarto sitio mas, que es el que de verdad deberia",
        "mandar: categorias.porcentaje_iva_default, que CU10 lee de L163 y",
        "CU11 usa en L467. Esa columna TAMPOCO existe, schema.sql L179-184.",
        "O sea que el IVA por categoria, que es la idea del negocio, no",
        "tiene sitio en ninguna parte: ni en productos ni en categorias."
    ]],
    ["5. El ORDER BY no desempata, y hay scroll infinito", [
        "Un detalle pequeno de paginacion que con scroll infinito se",
        "convierte en un fallo visible.",
        "",
        "LO QUE HAY, L271-272:",
        "",
        "  ORDER BY p.nombre ASC",
        "  LIMIT $n OFFSET $n+1",
        "",
        "Y la pagina va con OFFSET, o sea que el servidor tiene que contar",
        "las filas que descarta. Con scroll infinito, L262 paginaCargada,",
        "cada pagina se pide con un OFFSET mas grande.",
        "",
        "EL PROBLEMA: el desempate. Con dos productos que se llamen",
        "igual, el orden entre ellos no lo decide la consulta, lo decide",
        "el planificador. Y si entre la pagina 1 y la pagina 2 cambia el",
        "plan, o entra un producto nuevo, la misma prenda aparece dos",
        "veces o no aparece nunca.",
        "",
        "Y en CU08, el mismo autor, si lo habia hecho bien:",
        "",
        "  L127  .orderBy('b.fecha_hora', 'DESC')",
        "  L128  .addOrderBy('b.id_bitacora', 'DESC')",
        "",
        "O sea que en la bitacora desempata por clave primaria y en el",
        "catalogo no. El patron correcto ya existe en el proyecto, a nueve",
        "ficheros de distancia.",
        "",
        "Y ADEMAS hay un nombre duplicado, que se ha visto en CU09:",
        "productos.nombre NO es UNIQUE, schema.sql L226, que es VARCHAR(150)",
        "NOT NULL sin indice. A diferencia de categorias.nombre, colores.",
        "nombre y tallas.nombre, que si son UNIQUE. O sea que dos",
        "prendas con el mismo nombre son legales, y con el ORDER BY sin",
        "desempate eso son dos filas indistinguibles en el mismo sitio de",
        "la pantalla."
    ]],
    ["6. Un subquery correlacionado dentro de un SELECT DISTINCT", [
        "La consulta de L148-156, que es la de los colores de la ficha,",
        "tiene una cosa que va a doler cuando haya datos.",
        "",
        "  SELECT DISTINCT col.nombre, col.codigo_hex,",
        "         (SELECT pi.url FROM producto_imagenes pi",
        "          WHERE pi.id_producto = ptc.id_producto AND pi.id_color = ...",
        "         )",
        "  FROM producto_talla_color ptc",
        "  JOIN colores col ON col.id_color = ptc.id_color",
        "  WHERE ptc.id_producto = $1 AND LOWER(col.estado) = 'activo'",
        "  ORDER BY col.nombre ASC",
        "",
        "O sea que hay un subquery correlacionado en la lista del SELECT, y",
        "la consulta outer lleva DISTINCT.",
        "",
        "POR QUE ES UN PROBLEMA, y no solo unarezagado:",
        "",
        "  Postgres no puede empujar un DISTINCT por encima de un",
        "  subquery. O sea que tiene que materializar TODAS las filas de",
        "  producto_talla_color del producto, resolver el subquery en cada",
        "  una, y luego deduplicar. Con el indice de producto_imagenes",
        "  eso son N busquedas por color, y el DISTINCT de fuera no ayuda.",
        "",
        "  Y la consulta de tallas, L129-135, hace lo mismo con un",
        "  GROUP BY t.nombre y un ORDER BY MIN(t.orden) ASC. O sea que",
        "  tambien agrega, tambien materializa.",
        "",
        "Y hay una cosa mejor en L173-198, que es el agrupado del stock:",
        "",
        "  const sucursales = new Map<number, SucursalDisponibilidad>();",
        "  for (const f of filas) { ... }",
        "",
        "Eso es agrupar en memoria con un Map, y se lee bien. Pero",
        "tambien es un Map<number, ...> con un solo elemento por sucursal,",
        "que es justo la estructura del getter de roles[0] de CU01 a",
        "CU09, aqui con una garantia de la base de datos detras. O sea",
        "que en este sitio si se puede, porque UNIQUE(id_ptc, id_sucursal)",
        "de L310 lo garantiza, y en el getter no habia nada que lo"
    ]],
    ["7. Lo que si esta bien: el helper de filtros, y el limite en el servidor", [
        "Tres cosas, y la primera es la mejor pieza de codigo de consulta",
        "que tiene el proyecto.",
        "",
        "1. construirFiltrosPublico, L218-247. Es un parametro",
        "   numerado a mano:",
        "",
        "     const params: unknown[] = [];",
        "     const push = (valor: unknown): string => {",
        "       params.push(valor);",
        "       return `$${params.length}`;",
        "     };",
        "",
        "   Y luego las siete condiciones, cada una con su push:",
        "",
        "     L230  if (f.busqueda) partes.push(`p.nombre ILIKE",
        "                 '%'||${push(f.busqueda)}||'%'`);",
        "     L231  if (f.categoria) partes.push(`p.id_categoria =",
        "                 ${push(f.categoria)}`);",
        "     L243  if (f.precioMin !== undefined) partes.push(",
        "                 `p.precio_base >= ${push(f.precioMin)}`);",
        "",
        "   O sea que los siete filtros van parametrizados, el $n se",
        "   numera solo, y el SQL se construye con el numero de",
        "   parametros que hay. No hay ni un valor concatenado. Es",
        "   exactamente lo que habria que hacer, y es el unico sitio del",
        "   proyecto que lo hace de principio a fin.",
        "",
        "   Y ademas las condiciones opcionales se anaden con if, o sea que",
        "   sin filtro no hay WHERE de mas, y el planificador ve la",
        "   consulta real.",
        "",
        "2. LIMITE_MAX = 100, L13, aplicado en L22 con Math.min. Aunque",
        "   el cliente pida limite=99999, se queda en 100. Es un recorte",
        "   de servidor de verdad, y CU08 lo tenia tambien, y CU12 lo",
        "   repite. Son los dos unicos casos con tope en el servidor.",
        "",
        "3. Y el atajo de L257-259: si el total es 0, devuelve sin hacer",
        "   la segunda consulta. Es una optimizacion bien puesta, y lo",
        "   unico es que aqui tapa el fallo del hallazgo 2.",
        "",
        "Y una cuarta, en el frontend, que CU08 no tenia:",
        "",
        "  Catalogo.tsx L263   const busquedaDebounce = useRef(",
        "                       ReturnType<typeof setTimeout> | null>(null);",
        "",
        "O sea que aqui SI hay debounce en el campo de busqueda, y no se",
        "recarga con cada tecla. CU08 recarga con cada tecla y aqui no.",
        "Es el mismo autor, y ha mejorado. Y L264 y L317-330 restauran la",
        "intencion de una reserva cuando la persona vuelve desde el"
    ]],
    ["8. El caso dice Web y Movil, y en el proyecto hay una sola web", [
        "Un hallazgo de alcance, que no es de codigo pero que es de la",
        "documentacion, y conviene decirlo porque el diagrama tiene que",
        "reflejar lo que existe.",
        "",
        "LO QUE DICE EL CASO: CU12, Consultar Catalogo con Filtros",
        "(Web y Movil).",
        "",
        "LO QUE HAY EN PROTOTIPO/, las carpetas de primer nivel:",
        "",
        "  api/",
        "  web/",
        "",
        "Eso es todo. No hay movil/, ni app/, ni android/, ni ios/.",
        "",
        "Y en todo el proyecto no hay ni un solo fichero que hable de una",
        "app nativa: nada de react-native, expo, capacitor, cordova, ni un",
        "manifest.json, ni un capacitor.config, ni un Info.plist.",
        "",
        "LO QUE SI HAY, y es la adaptation a movil: la web es responsive.",
        "Tailwind con sus prefijos sm, md, lg y xl, que son mobile-first,",
        "o sea que la misma pagina se adapta al movil sin codigo",
        "duplicado. Y hay un solo Catalogo.tsx, no una version web y otra",
        "movil.",
        "",
        "ASI QUE: la parte de Web es real y esta hecha. La parte de",
        "Movil, como version propia, no existe. Y no es un fallo: es una",
        "decision, y probablemente la correcta, porque una sola web",
        "responsive cubre los dos casos. Pero el nombre del caso de uso",
        "no lo refleja.",
        "",
        "Y el diagrama, por eso, dibuja una sola linea de vida de",
        "frontend y no dos. Si manana apareciera una app movil, seria una",
        "linea de vida mas, y el resto del diagrama no cambiaria: el",
        "backend es el mismo y es publico, que es justo lo que hace bien",
        "el L15-16 del controlador, sin guard."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU12."; } catch (e) { }
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
        try { o.Text = "CU12  Consultar Catalogo con Filtros (Web y Movil)"; } catch (e) { }
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
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja. Este es el unico caso de uso publico del proyecto: el controlador no lleva guard, y cualquiera sin cuenta puede llamarlo. Es tambien el que mas depende de los demas, porque la ficha hace un JOIN a ciudades, que CU09 demostro que no se pueden crear."; } catch (e) { }
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
    N.push("CU12  Consultar Catalogo con Filtros (Web y Movil).  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Visitante          «actor»     quien navega sin cuenta");
    N.push("    Catalogo.tsx             «boundary»  pages/Catalogo.tsx, 701 lineas");
    N.push("    api.ts                   «boundary»  lib/api.ts, L1040-1075");
    N.push("    CTR_Catalogo             «control»   4 endpoints, 74 lineas, SIN guard");
    N.push("    ValidationPipe           «control»   main.ts, L22-43, no toca el query");
    N.push("    SRV_CatalogoService      «control»   341 lineas, 3 metodos publicos");
    N.push("    construirFiltrosPublico  «control»   L218-247, el helper mejor escrito del proyecto");
    N.push("    inventario_stock         «control»   schema.sql L302-311, la segunda condicion fija");
    N.push("    producto_talla_color     «control»   schema.sql L237-244, tallas y colores");
    N.push("    PostgreSQL               «entity»    9 tablas y 4 consultas");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes: 7 van a la base de datos, 16 son mensajes a si mismo, 2 van al");
    N.push("  helper de filtros y 9 son retornos. 6 llevan la guarda escrita entre corchetes, y aparecen 4");
    N.push("  codigos HTTP mas el 42703 de Postgres, que es la columna que no existe.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("LO MAS IMPORTANTE: ESTE CASO DEPENDE DE DOS CASOS ANTERIORES");
    N.push("");
    N.push("  Es el unico caso de uso publico del proyecto. El controlador no lleva @UseGuards,");
    N.push("  L15-16, y los 4 endpoints se llaman sin token. Eso es correcto para un catalogo de");
    N.push("  tienda, y por eso no hay consulta de permiso en ningun mensaje.");
    N.push("");
    N.push("  Y es el caso que mas depende de los demas. La cadena, en orden:");
    N.push("");
    N.push("  CU09  El seed no siembra ninguna ciudad, y no se pueden crear porque la tabla");
    N.push("        ciudades no tiene la columna departamento que el codigo usa.");
    N.push("  CU10  El seed no siembra ningun producto, y no se pueden crear porque productos no");
    N.push("        tiene la columna porcentaje_iva que el codigo usa.");
    N.push("  CU12  El filtro de L226 busca estado 'activo' contra un default 'Disponible', asi que");
    N.push("        no encuentra productos. Y la ficha, L167, hace un JOIN INTERNO a ciudades.");
    N.push("");
    N.push("  O sea que la tienda no muestra nada por dos motivos distintos, y uno de los dos");
    N.push("  viene de un caso de uso de administracion de hace tres diagramas.");
    N.push("");
    N.push("EL HALLAZGO 1: EL PRECIO SE CALCULA EN SQL, ASI QUE NO HAY PRECIO");
    N.push("");
    N.push("  L262-263, en la consulta que devuelve los productos del catalogo:");
    N.push("");
    N.push("    SELECT DISTINCT p.id_producto, p.codigo, p.nombre,");
    N.push("           ROUND(p.precio_base * (1 + p.porcentaje_iva / 100.0), 2)");
    N.push("             AS precio_con_iva,");
    N.push("           p.precio_base, p.porcentaje_iva, ...");
    N.push("");
    N.push("  Y productos no tiene porcentaje_iva, schema.sql L223-235. O sea que la consulta no");
    N.push("  compila, y no hay precio. Y Catalogo.tsx L147 pinta exactamente ese campo:");
    N.push("");
    N.push("    <Precio valor={item.precio_con_iva} />");
    N.push("");
    N.push("  Y la ficha, L104, pide la misma columna. O sea que las dos pantallas publicas del");
    N.push("  proyecto fallan con el mismo error, y es el primero que se veria al abrir la tienda.");
    N.push("");
    N.push("  Y el precio_base, que si existe y si llegaria, no se muestra en ninguna parte de la");
    N.push("  tarjeta, porque la unica etiqueta de precio es la de L147.");
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  El precio con IVA se calcula en la consulta, y la columna de la que depende no");
    N.push("     existe. El listado y la ficha dan 500 y el cliente no ve ningun precio.");
    N.push("  2  El catalogo esta vacio por tres motivos: el filtro de estado contra el default, el");
    N.push("     seed vacio con un alta rota, y el JOIN interno a ciudades de la ficha, que");
    N.push("     depende de CU09. Y el atajo del total 0 hace que el segundo no se vea.");
    N.push("  3  El filtro de temporadas usa 'activa' en genero femenino contra un default que es");
    N.push("     'Programada'. El desplegable sale vacio. Las otras tres opciones usan 'activo' y");
    N.push("     sus defaults si son 'Activo': tres de cuatro funcionan, a nueve lineas de distancia.");
    N.push("  4  El precio se calcula en SQL en el listado y en TypeScript en la ficha, con tres");
    N.push("     defaults distintos para la misma columna: 0, 13 y 13. Y el IVA por categoria,");
    N.push("     que es la idea del negocio, no tiene sitio en ninguna de las dos tablas.");
    N.push("  5  El ORDER BY no desempata y hay scroll infinito, con productos.nombre sin UNIQUE.");
    N.push("     En CU08 el mismo autor si desempata por clave primaria.");
    N.push("  6  La consulta de colores lleva un subquery correlacionado dentro de un SELECT DISTINCT,");
    N.push("     que Postgres no puede optimizar. En cambio el agrupado del stock, L173-198, si");
    N.push("     usa bien un Map.");
    N.push("  7  Lo que si esta bien: construirFiltrosPublico es la mejor pieza de codigo de");
    N.push("     consulta del proyecto, con un contador de parametros y cero valores interpolados.");
    N.push("     Y el limite de 100 en el servidor, y el debounce en la busqueda, que CU08 no tenia.");
    N.push("  8  El caso dice Web y Movil, y en PROTOTIPO/ solo hay api/ y web/. No hay app nativa.");
    N.push("     Lo que hay es una web responsive de Tailwind, que es la decision correcta pero no");
    N.push("     es lo que dice el nombre del caso.");
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  Los hallazgos 1 y 4 son la tercera vez que sale porcentaje_iva, CU10, CU11 y aqui. Y");
    N.push("  las tres veces la cuenta sale distinta: en CU10 el alta da 500, en CU11 el listado de");
    N.push("  categorias y el de tallas dan 500, y aqui la tienda entera. El modulo de catalogo es el");
    N.push("  mas escrito y el mas roto, y las dos cosas son del mismo autor.");
    N.push("");
    N.push("  El hallazgo 2 es la cadena mas larga que ha salido: CU09, CU10 y CU12. Ningun caso de");
    N.push("  uso habia necesitado dos casos anteriores para funcionar, y este necesita dos.");
    N.push("");
    N.push("  Y el hallazgo 7 es la parte buena, y es la que mas contraste tiene. El mismo autor que");
    N.push("  en CU08 recarga con cada tecla, aqui mete un debounce en L263. Y el mismo proyecto que");
    N.push("  en CU11 interpola el nombre de la tabla, aqui numera los parametros a mano. O sea que");
    N.push("  el codigo mejora de caso a caso, y que la calidad depende del momento en que se");
    N.push("  escribio cada parte, no de un criterio comun.");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU12 Secuencia", 0); } catch (e) { }
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
    T.push("CU12 - DIAGRAMA DE SECUENCIA - INFORME");
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
    msg = msg + "CU12 - Consultar Catalogo con Filtros" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "UNICO CASO PUBLICO: el controlador no lleva guard," + SALTO;
    msg = msg + "y cualquiera sin cuenta puede llamarlo." + SALTO + SALTO;
    msg = msg + "EL PRECIO SE CALCULA EN SQL, Y LA COLUMNA NO EXISTE." + SALTO;
    msg = msg + "Asi que la tienda no tiene precio. Y esta vacia por" + SALTO;
    msg = msg + "tres motivos, y uno viene de CU09." + SALTO + SALTO;
    msg = msg + "Lo bueno: construirFiltrosPublico es la mejor pieza de" + SALTO;
    msg = msg + "consulta del proyecto, con parametros numerados a mano." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU12 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU12 Secuencia", 0); } catch (e3) { }
}
