// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU20  Consultar Existencias Consolidadas
//         (Disponibles, Reservadas, Vendidas, Agotadas, Por Ingresar)
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/admin/AdminExistencias.tsx   441 lineas
//     web/src/lib/api.ts                         L592, L1621, seccion CU26
//     api/src/modulos/seguridad/dependencias.ts  L15-65
//     api/src/modulos/inventario/CTR_Existencias.ts   44 lineas, sin DTO
//     api/src/modulos/inventario/SRV_ExistenciasService.ts  259 lineas
//     BASE DE DATOS/schema.sql  L302-311, L562-563, L774, L648
//
// EL TITULO DEL CASO NO CUADRA, Y ES LO PRIMERO QUE HAY QUE DECIR
//   El caso se llama Disponibles, Reservadas, Vendidas, Agotadas y Por
//   Ingresar. Son cinco categorias. En el codigo hay TRES:
//
//     disponibles   si.   total_disponible,   L168 y L240
//     reservadas    si.   total_reservado,    L169 y L241
//     vendidas      si.   total_vendido,      L170 y L242
//     agotadas      NO.   No existe en ninguna parte
//     por ingresar  NO.   No existe en ninguna parte
//
//   Y lo he contado en los cinco sitios donde podria estar: la interfaz
//   ExistenciaItem, L23-36, que tiene tres totales; el mapa de L230-247;
//   la cabecera del CSV de la pantalla, L71; las tres columnas de la
//   tabla, L319-321; y las tres del desglose por sucursal, L383-385.
//   Tres y tres y tres.
//
//   Y ADEMAS, las agotadas no solo no estan: estan EXCLUIDAS. L180:
//
//     HAVING SUM(i.cantidad_disponible) > 0
//
//   O sea que un producto que se queda sin stock en todas las sucursales
//   desaparece de la lista. Y el total de L183 cuenta sobre ese mismo
//   HAVING, o sea que el contador de paginacion tambien lo excluye.
//
//   43 mensajes. 10 lineas de vida. 8 hallazgos.
//   1 fragmento: un loop y NINGUN alt. Explicado mas abajo.
//
// LOS FRAGMENTOS: UN loop Y NINGUN alt
//   Contado antes de escribir, con contadores, sobre las 259 lineas de
//   SRV_ExistenciasService:
//
//     for 1   while 0   Promise.all 0
//     if 12   throw 3   ternarios 32   map 4   filter 0   reduce 0
//     dataSource.query 8   transaction 0
//     Y CERO funciones de ventana: 0 OVER, 0 ROW_NUMBER, 0 SUM OVER,
//       0 FILTER, 0 LATERAL, 0 CTE. Con UN GROUP BY, el de L179.
//
//   El LOOP es el de L215-228, y es el unico bucle del fichero. Su
//   trabajo es el mas interesante de los tres casos de inventario: recibe
//   una fila por producto y sucursal, y monta un Map para convertirla en
//   una fila por producto con las sucursales dentro. O sea que hace un
//   giro, y el giro es el algoritmo del caso.
//
//   NO HAY NINGUN alt, y hay que decirlo en vez de inventar uno:
//
//   - De los 12 if, nueve son guardas: permiso, sucursal inexistente,
//     categoria inexistente, el array de ids vacio, y cinco que son la
//     construccion opcional del WHERE, L148, L152, L157, que anaden una
//     condicion o la dejan fuera. Eso no es una rama del caso de uso, es
//     montar una consulta.
//   - Los 32 ternarios son de valor: los ?? '', los ?? 0 de los tres
//     totales, y el max y min de la paginacion.
//   - La agregacion se hace en SQL, en una sola pasada, con un GROUP BY
//     y un HAVING. No hay ninguna funcion de ventana, asi que no hay
//     ninguna rama que dibujar.
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
var TOTAL_MSG = 43;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU20 Secuencia Existencias Consolidadas";
var DIAG_NOMBRE = "CU20 Existencias Consolidadas";
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
    ["U", "ACTOR_Administrador", "Actor", "Lifeline", "Administrador", "quien consulta", "Actor, no clase: es quien pulsa", "no es codigo, es la persona"],
    ["F", "AdminExistencias.tsx", "Object", "Lifeline", "AdminExistencias", "441 lineas", "Boundary", "web/src/pages/admin/AdminExistencias.tsx, 441 lineas"],
    ["H", "api.ts", "Object", "Lifeline", "api", "seccion CU26", "Boundary", "web/src/lib/api.ts, L592 y L1621, seccion CU26"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["C", "CTR_Existencias", "Object", "Lifeline", "ExistenciasController", "44 lineas, sin DTO", "Control", "api/src/modulos/inventario/CTR_Existencias.ts, L1-44"],
    ["S", "SRV_ExistenciasService", "Object", "Lifeline", "ExistenciasService", "259 lineas, 1 bucle", "Control", "api/src/modulos/inventario/SRV_ExistenciasService.ts, L111-258"],
    ["M", "el mapa porPtc", "Object", "Lifeline", "porPtc", "el giro de L214-228", "Entity", "SRV_ExistenciasService L214-228, un Map<number, ExistenciaPorSucursal[]>"],
    ["K", "fn_aplicar_movimiento_inventario", "Object", "Lifeline", "fn_aplicar_movimiento_inventario", "schema L628-657", "Entity", "BASE DE DATOS/schema.sql L628-657, el trigger que escribe cantidad_disponible"],
    ["V", "sp_registrar_devolucion", "Object", "Lifeline", "sp_registrar_devolucion", "schema L774, sin usar", "Entity", "BASE DE DATOS/schema.sql L774, la que bajaria cantidad_vendida y no la llama nadie"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "6 tablas y 2 indices", "Entity", "schema.sql: inventario_stock L302-311, producto_talla_color, productos, tallas, colores, categorias, sucursales; indices L562 y L563"]
];

var MSG = [
    [1, "U", "F", "1. abre Existencias Consolidadas.   El menu lo declara en adminMenu L196-201: etiqueta Existencias Consolidadas, cu CU26, permiso gestionar_inventario, icono Boxes, implementado true", "S"],
    [2, "F", "F", "2. al montar pide las opciones, L119, que son las sucursales activas y las categorias activas.   Con eso se llenan los dos desplegables, mas un campo de busqueda, L101", "S"],
    [3, "F", "F", "3. el permisoOk, L111-113, es permisos.includes('*') || permisos.includes('gestionar_inventario')   Y ese permiso NO esta en el seed de schema.sql   Es el mismo de CU17 y CU19, y el mismo hueco", "S"],
    [4, "F", "H", "4. GET /api/v1/admin/inventario/existencias/opciones   api.ts, seccion CU26", "S"],
    [5, "H", "G", "5. con Authorization Bearer y credentials:'include'   Las dos rutas pasan por el mismo guard", "S"],
    [6, "G", "D", "6. SELECT usuarios WHERE id_usuario = :sub   L44.   Una consulta por peticion, en el guard", "S"],
    [7, "G", "G", "7. [estado != 'activo'] 401 'Tu cuenta esta deshabilitada.'   L49-51", "S"],
    [8, "G", "C", "8. el guard pasa.   Y aqui NO hay ValidationPipe, porque no hay DTO: CTR_Existencias L18 lee el @Query() crudo y lo pasa por un parseIntId propio, L38-44, como el de CU18", "S"],
    [9, "C", "S", "9. obtenerOpciones( currentUser )   L11-14   Y el campo busqueda se limpia con un trim, L22, antes de entrar", "S"],
    [10, "S", "D", "10. SELECT r.permisos_json FROM usuarios JOIN usuarios_roles JOIN roles WHERE u.id_usuario = $1   L50-56.   SIN getter, octava vez en veinte casos", "S"],
    [11, "S", "S", "11. [sin '*' ni 'gestionar_inventario'] 403 'No tienes permiso para consultar las existencias consolidadas.'   L62-64   Y el mensaje nombra el caso entero, no una operacion", "S"],
    [12, "S", "D", "12. SELECT id_sucursal, nombre FROM sucursales WHERE LOWER(estado) = 'activa', y SELECT id_categoria, nombre FROM categorias WHERE LOWER(estado) = 'activo'   L86-96   Consulta 2 de 4   Las dos filtran por estado con LOWER, y en singular el de categorias", "S"],
    [13, "S", "C", "13. { sucursales, categorias }   y los dos desplegables se llenan   Consulta 3 de 4", "A"],
    [14, "C", "H", "14. el JSON de las opciones   api.ts, seccion CU26", "A"],
    [15, "H", "F", "15. la respuesta   api.ts, seccion CU26", "A"],
    [16, "F", "H", "16. el usuario elige categoria, sucursal o escribe una busqueda, y pulsa Consultar   GET /admin/inventario/existencias?busqueda&categoria&id_sucursal&pagina&limite   api.ts L1621", "S"],
    [17, "H", "G", "17. con Authorization Bearer   El limite lo manda la pantalla, pero el servidor lo recorta a 100, L143, con el mismo max y min que el kardex de CU18", "S"],
    [18, "G", "D", "18. SELECT usuarios WHERE id_usuario = :sub   L44.   Segunda vez en el guard, y es la segunda peticion de la pantalla", "S"],
    [19, "G", "C", "19. el guard pasa otra vez   Y el pipe tampoco esta: esta es la segunda ruta del modulo de inventario sin DTO, despues de la del kardex", "S"],
    [20, "C", "S", "20. consultar( currentUser, filtro )   L16-35.   El controlador arma el filtro con 5 campos y un parseIntId por cada id", "S"],
    [21, "S", "D", "21. SELECT r.permisos_json ... JOIN roles   L50-56   Consulta 4 de 4   Y es la TERCERA vez que se ejecuta en esta sesion: opciones, listar y esta", "S"],
    [22, "S", "S", "22. [no existe la sucursal] 404 'Sucursal no encontrada.', y [no existe la categoria] 404 'Categoría no encontrada.'   L125-140.   Dos 404 por id, antes de tocar inventario", "S"],
    [23, "S", "S", "23. pagina = max(1, ...), limite = min(100, max(1, ...)), offset = (pagina-1)*limite   L142-144   Y aqui empieza lo bueno: el WHERE se construye con un array, L146-162, añadiendo un $n por cada filtro que venga", "S"],
    [24, "S", "S", "24. los tres condicionales del WHERE: L148 si hay sucursal, L152 si hay categoria, y L157-160 si hay busqueda, que mete un %texto% en minusculas y lo compara contra el nombre del producto, el de la talla y el del color   O sea 3 LIKE con un solo parametro", "S"],
    [25, "S", "D", "25. y aqui se arma la agregacion, L164-180: es una variable de texto con SELECT ptc.id_ptc, el nombre, la talla, el color y la categoria, con SUM de las TRES cantidades y del stock minimo, FROM inventario_stock con 5 JOIN, el GROUP BY de L179 y el HAVING de L180", "S"],
    [26, "S", "S", "26. y el HAVING es el hallazgo 1: SUM(i.cantidad_disponible) > 0.   O sea que un producto sin stock en todas las sucursales NO APARECE.   Y como el total de la pagina 2 cuenta sobre este mismo HAVING, tampoco cuenta", "S"],
    [27, "S", "D", "27. la PRIMERA vez que se ejecuta la agregacion: SELECT COUNT(*)::int FROM ( la agregacion ) q   L183.   O sea que los 5 JOIN, el GROUP BY y el HAVING se ejecutan enteras solo para contar   Y despues se vuelven a ejecutar enteras para traer los datos", "S"],
    [28, "S", "D", "28. la SEGUNDA vez: la misma agregacion, mas ORDER BY p.nombre, t.orden, c.nombre, y LIMIT y OFFSET   L188-191   O sea 2 ejecuciones de la misma consulta de 5 JOIN por cada pagina que se ve.   Consulta 4b, y con ella se acaban las 4 officially", "S"],
    [29, "S", "D", "29. y una TERCERA consulta, L203-211, que es el desglose por sucursal: SELECT de inventario_stock con las 4 cantidades y el JOIN a sucursales, WHERE i.id_ptc = ANY($1::int[])   O sea una consulta para los 20 productos de la pagina, no 20 consultas.   Y si no hay filtro de sucursal, trae las de todas", "S"],
    [30, "S", "M", "30. y aqui empieza el LOOP, L215-228, que es el unico bucle del fichero.   Recibe las filas del desglose, que son una por producto y sucursal, y las gira: un Map con el id_ptc de clave y la lista de sucursales de valor   Consulta 4c, y el resto ya no son consultas", "S"],
    [31, "M", "M", "31. vuelta a vuelta: lee la fila, monta un objeto ExistenciaPorSucursal con los 4 numeros, L217-224, y lo mete en la lista del id_ptc con get y set, L225-227   El Map es lo que convierte 20 filas por sucursal en 1 fila por producto con 20 sucursales dentro.   Y es el unico sitio del proyecto que hace un giro asi", "S"],
    [32, "M", "S", "32. fin del bucle, y el Map queda con una entrada por cada producto de la pagina   L228", "A"],
    [33, "S", "S", "33. y aqui el segundo hallazgo: el segundo map, L230-247, junta cada fila de la agregacion con su entrada del Map, y calcula stock_bajo con stockMinimoGlobal > 0 && totalDisponible <= stockMinimoGlobal   Y stockMinimoGlobal es el SUM de los minimos de todas las sucursales, L171", "S"],
    [34, "S", "S", "34. o sea que compara un SUM con un SUM.   Un producto con minimo 2 en tres sucursales tiene minimo global 6, y se marca como stock bajo teniendo 5, aunque en cada una haya stock de sobra   Y si el producto solo esta en una sucursal, el minimo global es el de esa, y entonces si cuadra", "S"],
    [35, "S", "C", "35. { total, pagina, limite, busqueda, id_categoria, id_sucursal, items }   L249-257   Y cada item lleva sus 3 totales, el stock minimo global, el stock_bajo y el array de sucursales   Y NO lleva agotadas ni por ingresar: son 3 de las 5 del titulo del caso", "A"],
    [36, "C", "H", "36. el JSON.   Y el peso de la respuesta es el doble de lo que parece, porque cada item lleva dentro las N filas de su desglose por sucursal, aunque la tabla solo muestre 3 columnas", "A"],
    [37, "H", "F", "37. la respuesta   api.ts L1621", "A"],
    [38, "F", "F", "38. la pantalla pinta las 3 columnas, L319-321, y un desplegable por fila con el desglose por sucursal, L383-395, que se abre y cierra con un Set de expandidos, L109.   Y el boton de exportar CSV, L71, mete 6 columnas: producto, talla, color, categoria, los 3 totales y el desglose de sucursales en una celda", "S"],
    [39, "F", "U", "39. el administrador ve 3 cifras por prenda, y el detalle de cada tienda al desplegar.   Y el que mas le importa, el total disponible, lo mantiene un trigger de PostgreSQL que ninguna linea de TypeScript menciona.   Y las que faltan, agotadas y por ingresar, no se pueden ver por ningun lado   A", "A"],
    [40, "U", "U", "40. y la cifra de vendidas es un contador que NUNCA baja: solo se incrementa, en Pagos L341 y L711, y la funcion que lo bajaria es sp_registrar_devolucion, que no la llama nadie   A", "A"],
    [41, "D", "K", "41. y por otra parte, cada vez que alguien inserta un movimiento, salta trg_movimiento_inventario, L654-657, que es BEFORE INSERT sobre movimientos_inventario   Y su L645-648 hace el upsert de inventario_stock con un ON CONFLICT (id_ptc, id_sucursal) DO UPDATE que suma NEW.cantidad   Consulta 5, y es el unico que escribe la cifra que encabeza este caso", "S"],
    [42, "K", "D", "42. y el signo de NEW.cantidad es lo UNICO que decide si la cifra sube o baja: el trigger no mira tipo_movimiento, que esta a 30 caracteres y no se usa   Y como es BEFORE INSERT, un UPDATE de inventario_stock no lo dispararia, y un DELETE tampoco   Contados en los 24 modulos, cero de los dos.   O sea que la cifra es coherente por casualidad, no por diseño", "S"],
    [43, "V", "V", "43. y la que bajaria la cifra de vendidas: sp_registrar_devolucion, schema L774.   Y no la llama nadie: cero llamadas a sp_ o fn_ en los 24 modulos y las 40 paginas.   Es la tercera de las ocho funciones muertas que cuento en el hallazgo 7 de CU17, y es la que dejaria este numero sin poder bajar   Con lo cual las tres cifras de esta pantalla las mantienen tres cosas distintas: un trigger que nadie nombra, tres UPDATE con suelo, y dos UPDATE que solo suman", "S"]
];

var HAL = [
    ["1. De las cinco categorias del titulo hay tres, y las agotadas estan excluidas", [
        "El hallazgo del nombre, y hay que empezarlo por el titulo del caso,",
        "porque es lo primero que lee quien lo abre.",
        "",
        "EL CASO SE LLAMA: Disponibles, Reservadas, Vendidas, Agotadas y Por",
        "Ingresar. Son cinco categorias.",
        "",
        "EN EL CODIGO HAY TRES. Y lo he contado en los cinco sitios donde",
        "podrian estar, no en uno:",
        "",
        "  la interfaz ExistenciaItem, L23-36:  total_disponible,",
        "                               total_reservado,",
        "                               total_vendido,",
        "                               stock_minimo_global, stock_bajo",
        "                               y el array sucursales.   Ni una mas.",
        "  la agregacion, L168-171:           SUM de las TRES cantidades",
        "  el mapa de L230-247:              los mismos tres",
        "  la cabecera del CSV, L71:          los mismos tres",
        "  las columnas, L319-321 y L383-385: los mismos tres",
        "",
        "O sea que TRES, TRES, TRES, TRES y TRES.",
        "",
        "Y ADEMAS, LAS AGOTADAS NO SOLO NO ESTAN: ESTAN EXCLUIDAS. L180:",
        "",
        "  HAVING SUM(i.cantidad_disponible) > 0",
        "",
        "O sea que un producto que se queda sin stock en todas las sucursales",
        "desaparece de la lista. Y el total de L183 cuenta sobre ese mismo",
        "HAVING, o sea que el contador de paginacion tampoco lo cuenta.",
        "",
        "ASI QUE LA CATEGORIA MAS IMPORTANTE PARA COMPRAR, que es la que",
        "dira DE QUE PRODUCTO HAY QUE PEDIR, es la unica que el caso no",
        "puede mostrar. Se podria cambiar el HAVING a >= 0 y",
        "desplegar un campo mas, que es media hora de trabajo.",
        "",
        "Y POR INGRESAR no esta por una razon mas profunda, y es la que",
        "ya se vio en CU17: no hay ninguna recepcion. El estado",
        "'Recibida' no lo pone nadie, asi que no hay orden de compra que",
        "esté esperando, y no hay nada que pueda contar como 'por",
        "ingresar'. O sea que de las dos categorias que faltan, una esta",
        "excluida a proposito y la otra no puede existir todavia."
    ]],
    ["2. La agregacion se ejecuta dos veces, y la primera solo para contar", [
        "El hallazgo de rendimiento, y sale de ver como esta montado el",
        "paginado.",
        "",
        "La agregacion entera esta en una variable de texto, L164-180:",
        "",
        "  SELECT ptc.id_ptc, ptc.id_producto, p.nombre, t.nombre,",
        "         c.nombre, cat.nombre,",
        "         SUM(i.cantidad_disponible)::int,",
        "         SUM(i.cantidad_reservada)::int,",
        "         SUM(i.cantidad_vendida)::int,",
        "         SUM(i.stock_minimo_alert)::int",
        "  FROM inventario_stock i",
        "  JOIN producto_talla_color ptc ... JOIN productos p ... JOIN tallas",
        "  t ... JOIN colores c ... LEFT JOIN categorias cat",
        "  [WHERE, montado en L146-162]",
        "  GROUP BY ptc.id_ptc, ptc.id_producto, p.nombre, t.nombre,",
        "           t.orden, c.nombre, cat.nombre",
        "  HAVING SUM(i.cantidad_disponible) > 0",
        "",
        "Y esa variable se usa DOS veces, y ademas una tercera consulta:",
        "",
        "  L183  SELECT COUNT(*)::int AS n FROM ( la agregacion ) q",
        "        Para contar cuantas paginas hay. Los 5 JOIN, el GROUP BY y el",
        "        HAVING se ejecutan enteros, y se tiran todos menos un",
        "        numero.",
        "",
        "  L188  la agregacion, mas ORDER BY y LIMIT y OFFSET",
        "        Para traer los 20 de la pagina.",
        "",
        "  L203  SELECT de inventario_stock con el JOIN a sucursales, y",
        "        WHERE i.id_ptc = ANY($1::int[])",
        "        Para el desglose. Y esta es la buena: UNA consulta para los",
        "        20 productos, no 20 consultas.",
        "",
        "O sea que por cada pagina que se ve se ejecutan 3 consultas, y la",
        "primera es la mas cara de las tres para devolver un entero.",
        "",
        "LO QUE LA HACE BARATA, y hay que decirlo, es el indice. En",
        "inventario_stock hay UNIQUE (id_ptc, id_sucursal), L310. O sea",
        "que el GROUP BY que empieza por id_ptc puede usar ese indice como",
        "index scan holgado, sin agrupar nada: como el indice empieza por",
        "id_ptc, todas las filas de un id_ptc estan contiguas, y la",
        "agregacion se puede resolver leyendo un indice y no la tabla.",
        "",
        "ASI QUE ESTA BIEN DISENADA, y por eso no es un problema de",
        "produccion. Lo que es un problema es la forma: si manana anaden",
        "una columna mas al SELECT, o un JOIN mas, el coste del COUNT se",
        "duplica sin que nadie se entere.",
        "",
        "Y LA TERCERA CONSULTA, L203, es la que hace que el COUNT tenga",
        "sentido: como el desglose se pide con ANY, es una consulta para",
        "toda la pagina. Si alguien lo change a un for con una consulta",
        "por producto, serian 20. Y ese ANY, con el cast ::int[], es",
        "exactamente el mismo patron que uso validarDetalle en CU16, L328."
    ]],
    ["3. El stock se suma dos veces al cerrar una reserva", [
        "El hallazgo grave de este caso, y sale de comparar las tres",
        "operaciones de reserva linea a linea.",
        "",
        "LA COLUMNA, schema L306:",
        "",
        "  cantidad_disponible INTEGER DEFAULT 0,",
        "",
        "Y TIENE DOS ESCRITORES, no uno. El primero es el trigger del esquema:",
        "",
        "  trg_movimiento_inventario, L654-657",
        "    BEFORE INSERT ON movimientos_inventario",
        "    EXECUTE FUNCTION fn_aplicar_movimiento_inventario()",
        "",
        "  y su L645-648:",
        "",
        "    INSERT INTO inventario_stock (id_ptc, id_sucursal,",
        "                               cantidad_disponible)",
        "    VALUES (NEW.id_ptc, NEW.id_sucursal, NEW.cantidad)",
        "    ON CONFLICT (id_ptc, id_sucursal)",
        "    DO UPDATE SET cantidad_disponible =",
        "      inventario_stock.cantidad_disponible + NEW.cantidad;",
        "",
        "O sea que ese primer escritor anade el signo de NEW.cantidad a la",
        "cifra, y lo hace en cada INSERT de movimiento.",
        "",
        "EL SEGUNDO ESCRITOR ES UNA LINEA DE TYPESCRIPT, y aqui esta el",
        "problema: SRV_ReservasService.ts L710.",
        "",
        "  L703  INSERT INTO movimientos_inventario ( .., tipo_movimiento,",
        "        cantidad, .. ) VALUES ( $1, $2, 'SALIDA-RESERVA', $3, .. )",
        "  L705    [item.id_ptc, idSucursal, cantidad, 'Cierre ...']",
        "        O sea que el movimiento lleva la cantidad POSITIVA, porque",
        "        al cerrar una reserva la prenda vuelve al almacen.",
        "",
        "  L707  UPDATE inventario_stock",
        "  L709  SET cantidad_reservada = GREATEST(0, cantidad_reservada - $3),",
        "  L710  cantidad_disponible = cantidad_disponible + $3",
        "  L711  WHERE id_ptc = $1 AND id_sucursal = $2",
        "",
        "LAS TRES OPERACIONES DE RESERVA, Y LO QUE HACE CADA UNA CON EL",
        "STOCK. Esto es lo que hay que comparar:",
        "",
        "  CREAR la reserva, L1109-1120",
        "    L1110  INSERT movimiento, 'SALIDA-RESERVA', -linea.cantidad",
        "    el trigger resta la cantidad.                        -1",
        "    L1117  UPDATE SET cantidad_reservada = cantidad_reservada + $3",
        "    no toca cantidad_disponible.",
        "                                                        CORRECTO",
        "",
        "  CERRAR la reserva, L702-713",
        "    L703  INSERT movimiento, 'SALIDA-RESERVA', +cantidad",
        "    el trigger suma la cantidad.                         +1",
        "    L710  UPDATE SET cantidad_disponible = cantidad_disponible + $3",
        "    lo vuelve a sumar.                                   +1",
        "                                                        LA CUENTA DOS VECES",
        "",
        "  ANULAR la reserva, L972-982",
        "    L973  INSERT movimiento, 'SALIDA-RESERVA', +cantidad",
        "    el trigger suma la cantidad.                         +1",
        "    L979  UPDATE SET cantidad_reservada = GREATEST(0, .. - $3)",
        "    NO toca cantidad_disponible.",
        "                                                        CORRECTO",
        "",
        "O SEA QUE LAS TRES RUTAS SON SIMETRICAS Y UNA TIENE UN +1 DE MAS.",
        "La de cerrar es la unica que escribe la columna a mano, y por eso es",
        "la unica que la cuenta dos veces. Las otras dos se apoyan solo en el",
        "trigger. Es una divergencia de copia: las dos rutas de devolucion se",
        "copiaron la una de la otra y una se llevo una linea de mas.",
        "",
        "Y NO SE PUEDE FALLAR POR LA MITAD, porque el INSERT de L703 y el",
        "UPDATE de L707 estan los dos dentro de em.query, en la misma",
        "transaccion. O sea que el stock se infla con las dos sumas, siempre,",
        "con exito.",
        "",
        "Y EL EFECTO ES ACUMULATIVO E IRREVERSIBLE: cada reserva que se",
        "cierra suma el doble. Y esta cifra es la que encabeza este caso, el",
        "SUM de L168, la primera columna de la tabla, L365, y el primer",
        "numero del CSV, L77. O sea que el numero que el administrador ve",
        "para decidir que comprar es un numero que se ha ido arriba solo.",
        "",
        "Y EL TRIGGER, ademas, no mira tipo_movimiento, que esta a 30",
        "caracteres en L425 y no se usa. O sea que la cifra depende de la",
        "convencion de signo de los cinco escritores. Es el hallazgo 6 de",
        "CU17, y aqui se ve en la pantalla que lo consume. Y CU18 vio las",
        "mismas tres lineas desde el otro lado y escribio que dos de los",
        "tres SALIDA-RESERVA no son salidas: aqui se ve que ademas una",
        "cuenta el stock dos veces."
    ]],
    ["4. Vendidas es un contador que solo sube", [
        "El hallazgo de las tres cifras, y es el mas facil de ver de los",
        "tres al mirar la tabla.",
        "",
        "  L168  SUM(i.cantidad_disponible)::int AS total_disponible,",
        "  L169  SUM(i.cantidad_reservada)::int  AS total_reservado,",
        "  L170  SUM(i.cantidad_vendida)::int    AS total_vendido,",
        "",
        "LAS TRES COLUMNAS, schema L306-308:",
        "",
        "  cantidad_disponible  INTEGER DEFAULT 0",
        "  cantidad_reservada   INTEGER DEFAULT 0",
        "  cantidad_vendida     INTEGER DEFAULT 0",
        "",
        "LAS TRES SE MANTIENEN DE FORMA DISTINTA, y eso es lo importante:",
        "",
        "  cantidad_disponible  la mantiene el trigger, en los dos",
        "                      sentidos.   CU17, hallazgo 6",
        "",
        "  cantidad_reservada   la escriben tres UPDATE del modulo de",
        "                      reservas, y aqui SI esta el patron bueno:",
        "                        L1117  SET cantidad_reservada",
        "                               = cantidad_reservada + $3",
        "                        L709   SET cantidad_reservada =",
        "                               GREATEST(0, cantidad_reservada - $3)",
        "                        L979   lo mismo",
        "                      O sea que el GREATEST(0, ...) es un suelo,",
        "                      y es la defensa que CU09 no tenia.",
        "",
        "  cantidad_vendida     la escriben dos UPDATE, y los dos SUMAN:",
        "                        Pagos L341  cantidad_vendida",
        "                                       = cantidad_vendida + $2",
        "                        Pagos L711  lo mismo",
        "                      Y no hay ningun RESTO en todo el proyecto.",
        "",
        "O sea que total_vendido es un CONTADOR ACUMULADO, no un stock. Y",
        "por eso solo crece, y desde el primer dia del sistema.",
        "",
        "LO QUE DEBERIA BAJARLO, y existe:",
        "",
        "  sp_registrar_devolucion, schema L774",
        "",
        "Y no la llama nadie. En los 24 modulos y las 40 paginas hay cero",
        "llamadas a sp_ o a fn_. Es la tercera de las ocho funciones",
        "muertas que CU17 conto, y es la que dejaria este numero en su",
        "sitio.",
        "",
        "ASI QUE LA CONSECUENCIA, y es de las que se ven en el reporte: una",
        "devolucion de una venta en caja suma stock con un ajuste, si el",
        "encargado lo hace, y NO baja el total vendido. O sea que la cifra",
        "de vendidas cuenta Pieces que ya no estan en la tienda, y no se",
        "puede corregir sin intervention manual."
    ]],
    ["5. El stock_bajo compara dos sumas, y solo cuadra en un caso", [
        "El hallazgo de logica, y es el mas fino del caso.",
        "",
        "L244, en el segundo map:",
        "",
        "  stock_bajo: stockMinimoGlobal > 0 && totalDisponible <= stockMinimoGlobal,",
        "",
        "Y DE DONDE SALE CADA COSA:",
        "",
        "  L171  SUM(i.stock_minimo_alert)::int AS stock_minimo_global",
        "  L168  SUM(i.cantidad_disponible)::int AS total_disponible",
        "",
        "O sea que compara el SUM de los minimos de todas las sucursales con",
        "el SUM de los disponibles de todas las sucursales. Y eso SOLO",
        "tiene sentido si el producto esta en todas.",
        "",
        "UN EJEMPLELO CONCRETO, con un producto con minimo 2 en tres",
        "sucursales:",
        "",
        "  sucursal A   minimo 2   disponible 2   bien, 2 de 2",
        "  sucursal B   minimo 2   disponible 2   bien, 2 de 2",
        "  sucursal C   minimo 2   disponible 1   avisado, le falta 1",
        "  ---",
        "  total        minimo 6   disponible 5   stock_bajo: 5 <= 6  SI",
        "",
        "O sea que la bandera sale correcta POR EL CASO PEOR. En este ejemplo",
        "la suma y el minimo global dan la misma respuesta que el detalle.",
        "",
        "Y UN EJEMPLELO DONDE NO:",
        "",
        "  sucursal A   minimo 2   disponible 2   bien",
        "  sucursal B   minimo 2   disponible 2   bien",
        "  ---",
        "  total        minimo 4   disponible 4   stock_bajo: 4 <= 4  SI",
        "",
        "Y las dos sucursales tienen exactamente su minimo. O sea que un",
        "producto que esta en su limite exacto en todas las sucursales se",
        "marca como stock bajo, y eso es discutible pero no es un error.",
        "",
        "EL CASO VERDADERAMENTE MALO es el contrario:",
        "",
        "  sucursal A   minimo 0   disponible 0",
        "  sucursal B   minimo 5   disponible 1   avisado",
        "  ---",
        "  total        minimo 5   disponible 1   stock_bajo: 1 <= 5  SI",
        "",
        "Aqui tambien sale, pero por el motivo equivocado. Y si la A",
        "tuviera disponible 4 con minimo 0, que es una situacion normal de",
        "una tienda que no lleva esa talla:",
        "",
        "  sucursal A   minimo 0   disponible 4",
        "  sucursal B   minimo 5   disponible 1   avisado",
        "  ---",
        "  total        minimo 5   disponible 5   stock_bajo: 5 <= 5  SI",
        "",
        "O sea que se marca como stock bajo con 4 unidades de sobra en A y",
        "porque en B le falta 1. El detalle de L383-395 lo diria, pero el",
        "numero grande no.",
        "",
        "LO QUE PASARIA con un producto en UNA sola sucursal, que es el caso",
        "normal de una prenda que no se vende en todas: minimo global es el",
        "de esa sucursal, y entonces SI cuadra. O sea que la bandera es",
        "correcta en el caso de un producto y arbitraria en el de varios, y",
        "no hay forma de saber cual de los dos se esta mirando."
    ]],
    ["6. El WHERE se construye con un array, y eso esta bien hecho", [
        "No es un hallazgo malo: es el mejor trozo de codigo de consulta",
        "que hay en el proyecto, y conviene decirlo con el mismo detalle",
        "que los malos.",
        "",
        "L146-162, y son 17 lineas:",
        "",
        "  const condiciones: string[] = [];",
        "  const params: unknown[] = [];",
        "  if (filtro.id_sucursal != null) {",
        "    params.push(filtro.id_sucursal);",
        "    condiciones.push(`i.id_sucursal = $${params.length}`);",
        "  }",
        "  if (filtro.id_categoria != null) {",
        "    params.push(filtro.id_categoria);",
        "    condiciones.push(`p.id_categoria = $${params.length}`);",
        "  }",
        "  const busqueda = (filtro.busqueda ?? '').trim();",
        "  if (busqueda.length > 0) {",
        "    params.push(`%${busqueda.toLowerCase()}%`);",
        "    const op = `$${params.length}`;",
        "    condiciones.push(`(LOWER(p.nombre) LIKE ${op}",
        "      OR LOWER(t.nombre) LIKE ${op}",
        "      OR LOWER(c.nombre) LIKE ${op})`);",
        "  }",
        "  const whereClause = condiciones.length > 0",
        "    ? `WHERE ${condiciones.join(' AND ')}` : '';",
        "",
        "LO QUE HACE BIEN, y son cuatro cosas:",
        "",
        "  1  NUNCA concatena un valor del usuario en el SQL. El %busqueda%",
        "     va como parametro, y en el texto solo entra un $n.",
        "  2  El $n se calcula con params.length, o sea que el numerito se",
        "     mueve solo y no puede desincronizarse del array. Es el mismo",
        "     truco que usan el kardex de CU18 y el de alertas de CU19.",
        "  3  El $n de la busqueda se USA TRES VECES, y guardado en una",
        "     variable, op, para no repetir el numero a mano. El mismo",
        "     parametro thrice, que es lo correcto y lo economico.",
        "  4  Si no hay ningun filtro, no hay WHERE. Y no hay un WHERE 1=1",
        "     por el camino, que es lo que hacen casi todos.",
        "",
        "Y LA BUSQUEDA ES BIEN PENSADA: busca en el nombre del producto, en",
        "la talla y en el color, y con LOWER en los dos lados. O sea que",
        "buscar 'azul' encuentra la prenda, y buscar 'AZUL' tambien.",
        "",
        "LO UNICO QUE LE FALTA, y es un detalle: el LIKE es sobre",
        "LOWER(p.nombre), que no tiene indice. O sea que la busqueda es un",
        "recorrido secuencial de productos, tallas y colores. Con un",
        "catalogo de tienda eso no se nota; con veinte mil referencias, si."
    ]],
    ["7. El giro del Map es el mejor algoritmo de los tres casos de inventario", [
        "Y hay que decirlo porque es lo que hace que el caso funcione, y",
        "porque es codigo que no se parece a nada de lo demas del",
        "proyecto.",
        "",
        "EL PROBLEMA: la agregacion de L164-180 agrupa por id_ptc, o sea",
        "que devuelve UNA fila por producto con los totales ya sumados. Y",
        "el desglose de L203-211 devuelve UNA fila por producto Y",
        "sucursal. Son dos formas distintas de la misma verdad.",
        "",
        "Y LA PANTALLA QUIERE LAS DOS: los totales en la fila principal, L365-367,",
        "y el detalle de cada tienda debajo, L383-395, que se abre y se",
        "cierra con un Set de expandidos, L109.",
        "",
        "LA SOLUCION, L214-228, que es un giro de una forma a otra:",
        "",
        "  const porPtc = new Map<number, ExistenciaPorSucursal[]>();",
        "  for (const d of desglose) {",
        "    const id = d.id_ptc as number;",
        "    const fila: ExistenciaPorSucursal = { ... };",
        "    const lista = porPtc.get(id) ?? [];",
        "    lista.push(fila);",
        "    porPtc.set(id, lista);",
        "  }",
        "",
        "Y LUEGO, L245, en el segundo map:",
        "",
        "  sucursales: porPtc.get(f.id_ptc as number) ?? [],",
        "",
        "O sea que el Map se construye con los 20 productos de la pagina y",
        "se consulta con los mismos 20. Complejidad lineal, una pasada, y",
        "el get del segundo map es O(1).",
        "",
        "Y EL MAP ESTA DECLARADO EN EL INTERFAZ, L14-21, y el ARRAY que",
        "contiene en el L35. O sea que la forma que sale del servidor es la",
        "misma que consume la pantalla, y el CSV de L81 la recorre con un",
        "map y un join.",
        "",
        "COMPARADO CON LAS OTRAS FORMAS DE HACERLO, que tambien existen en",
        "el proyecto:",
        "",
        "  un for con un indice por atras para cada fila, que es O(n2).",
        "    No lo hace nadie aqui.",
        "  tres consultas y un merge a mano en la respuesta, que es lo que",
        "    haria un LLM. No lo hace nadie aqui.",
        "  una vista en el esquema. No hay ninguna vista: contadas las",
        "    CREATE TABLE y las CREATE FUNCTION del esquema, no hay ni una",
        "    CREATE VIEW.",
        "",
        "ASI QUE ESTA HECHO COMO SE DEBE. Y ES LA TERCERA VEZ QUE UNA",
        "CONSULTA DEVUELVE UNA FORMA Y EL SERVICIO LA GIRA: CU16 devolvia",
        "lineas y las empujaba a un array, CU19 hacia lo mismo con items, y",
        "aqui se gira de verdad, con clave."
    ]],
    ["8. Lo que esta bien, que en este caso es la mayoria", [
        "Este caso tiene mas cosas buenas que malas, y hay que decirlo con",
        "el mismo detalle. Las cinco.",
        "",
        "1. EL WHERE DINAMICO, L146-162, que es el hallazgo 6 y el mejor",
        "   codigo de consulta del proyecto. Un $n calculado con",
        "   params.length, un parametro reutilizado tres veces para los tres",
        "   LIKE, y cero concatenacion de valores del usuario.",
        "",
        "2. EL DESGLOSE EN UNA SOLA CONSULTA, L198:",
        "",
        "     let dWhere = `i.id_ptc = ANY($1::int[])`;",
        "",
        "   O sea que los 20 productos de la pagina se piden de una vez, con",
        "   el ANY y el cast, y no con un bucle de 20 consultas. Es el",
        "   mismo patron que uso validarDetalle en CU16, L328, y el que",
        "   hace que el giro del Map sea barato.",
        "",
        "3. EL INDICE SIRVE PARA LA AGREGACION, sin querer y bien. El",
        "   UNIQUE (id_ptc, id_sucursal) de L310 empieza por id_ptc, que es",
        "   la primera columna del GROUP BY de L179. O sea que el",
        "   index scan holgado puede resolver la agregacion leyendo el",
        "   indice y no la tabla, y no hace falta un indice sobre id_ptc",
        "   solo. El otro indice de la tabla, idx_inventario_sucursal de",
        "   L563, es para el caso inverso, el filtro por tienda.",
        "",
        "4. CERO FUNCIONES DE VENTANA, y en un caso de agregacion eso es",
        "   una decision. Contadas: 0 OVER, 0 ROW_NUMBER, 0 SUM() OVER,",
        "   0 FILTER, 0 LATERAL, 0 CTE. Con un GROUP BY y un HAVING y ya.",
        "   El HAVING, ademas, hace el trabajo de un WHERE en la agregacion,",
        "   que es donde debe ir.",
        "",
        "5. Y LA PAGINACION CON SUELO Y TECHO, L142-144:",
        "",
        "     pagina = Math.max(1, Number(filtro.pagina ?? 1));",
        "     limite = Math.min(100, Math.max(1, Number(filtro.limite ?? 20)));",
        "     offset = (pagina - 1) * limite;",
        "",
        "   que es exactamente el mismo patron que el kardex de CU18, L224-226.",
        "   Y CU11 hacia lo contrario: validaba el limite pero no el techo.",
        "",
        "Y UN DETALLE DE LA PANTALLA, L109, que es de los pocos sitios del",
        "proyecto donde se guarda un conjunto de ids:",
        "",
        "  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());",
        "",
        "O sea que el desplegable de cada fila remembera si esta abierto, y",
        "no con un array con indexOf, que es como lo haria un LLM."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU20."; } catch (e) { }
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
// EL UNICO FRAGMENTO DE ESTE CASO, Y LAS DOS BARRAS
//
// EA no coloca fragmentos de forma fiable por script, asi que lo que hay
// aqui son FORMAS con su etiqueta. Cada una va en try/catch y cuenta las
// que ha conseguido poner, y el informe final lo dice.
//
// Este caso tiene UN loop (L215, el del giro del Map) y NINGUN alt. Se ha
// contado antes de escribir, con contadores.
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
    var xM = xDe(indiceDe("M"));
    fragmento(diag, "loop [por cada fila del desglose, girando al Map]", xS, xM, Y_MSG0 + 29 * PASO_MSG - 34, Y_MSG0 + 31 * PASO_MSG + 16);
    activacion(diag, xDe(indiceDe("C")), Y_MSG0 + 7 * PASO_MSG - 26, Y_MSG0 + 36 * PASO_MSG + 12);
    activacion(diag, xS, Y_MSG0 + 9 * PASO_MSG - 26, Y_MSG0 + 35 * PASO_MSG + 12);
}

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 940) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU20  Consultar Existencias Consolidadas   ·   en el código del proyecto este caso es CU26"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 940) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseño de caso de uso, sección 3.3.2.1.  10 líneas de vida, 43 mensajes, 8 hallazgos, 1 loop y NINGUN alt, y 2 barras de activación."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su línea de vida. El tiempo baja. El caso se llama Disponibles, Reservadas, Vendidas, Agotadas y Por Ingresar, y en el código hay tres: las otras dos no existen, y las agotadas están además excluidas por el HAVING de L180. Este caso tiene un loop, el de L215, que gira el desglose por sucursal en un Map, y ningún alt: de los 12 if, nueve son guardas o construcción de consulta. Las barras estrechas sobre el controlador y el servicio son las activaciones."; } catch (e) { }
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
    N.push("CU20  Consultar Existencias Consolidadas.  Diseño de caso de uso, sección 3.3.2.1.");
    N.push("");
    N.push("EL TÍTULO DEL CASO NO CUADRA, Y ES LO PRIMERO QUE HAY QUE LEER");
    N.push("");
    N.push("  El caso se llama Disponibles, Reservadas, Vendidas, Agotadas y Por Ingresar.");
    N.push("  Son cinco categorías. En el código hay TRES, y lo he contado en los cinco");
    N.push("  sitios donde podrían estar:");
    N.push("");
    N.push("    la interfaz ExistenciaItem, L23-36   3 totales, y nada más");
    N.push("    la agregación, L168-171             SUM de las 3 cantidades");
    N.push("    el mapa de L230-247                 los mismos 3");
    N.push("    la cabecera del CSV, L71            los mismos 3");
    N.push("    las columnas, L319-321 y L383-385   los mismos 3");
    N.push("");
    N.push("  Y ADEMÁS, LAS AGOTADAS ESTÁN EXCLUIDAS. L180:");
    N.push("");
    N.push("    HAVING SUM(i.cantidad_disponible) > 0");
    N.push("");
    N.push("  O sea que un producto sin stock en todas las sucursales desaparece de la");
    N.push("  lista, y el total de L183 cuenta sobre ese mismo HAVING, así que el");
    N.push("  contador de paginación tampoco lo cuenta. La categoría que más importa para");
    N.push("  comprar, la que diría DE QUÉ PRODUCTO HAY QUE PEDIR, es la única que el caso");
    N.push("  no puede mostrar. Y por ingresar no está por una razón más profunda: no hay");
    N.push("  recepción, que es el hallazgo de CU17, así que no hay nada que contar.");
    N.push("");
    N.push("AVISO DE NUMERACIÓN, IGUAL QUE EN CU17, CU18 Y CU19");
    N.push("");
    N.push("  Este caso es CU20 en el documento y CU26 en el código del proyecto.");
    N.push("");
    N.push("    web/src/data/adminMenu.ts L198     cu: 'CU26',");
    N.push("    web/src/lib/api.ts L592 y L1621    // CU26 - Existencias consolidadas");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 líneas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Administrador   «actor»     quien consulta");
    N.push("    AdminExistencias.tsx  «boundary»  441 líneas, con el CSV y el Set de expandidos");
    N.push("    api.ts                «boundary»  sección CU26");
    N.push("    JwtAuthGuard          «control»   dependencias.ts, L15-65");
    N.push("    CTR_Existencias       «control»   44 líneas, sin DTO, con parseIntId propio");
    N.push("    SRV_ExistenciasService «control»  259 líneas, 8 consultas, 1 bucle");
    N.push("    el mapa porPtc        «entity»    L214-228, el giro de una forma a otra");
    N.push("    fn_aplicar_movimiento_inventario «entity»  schema L628-657, el trigger invisible");
    N.push("    sp_registrar_devolucion «entity»   schema L774, la que bajaría cantidad_vendida");
    N.push("    PostgreSQL            «entity»    6 tablas y 2 índices");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes. 10 van a la base de datos, 14 son mensajes a sí mismo, 9 son retornos,");
    N.push("  4 llevan la guarda escrita entre corchetes, y 3 tocan al actor.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("UN FRAGMENTO: UN loop Y NINGUN alt");
    N.push("");
    N.push("  Contados ANTES de dibujar, con contadores, sobre las 259 líneas de SRV_ExistenciasService:");
    N.push("");
    N.push("    for 1   while 0   Promise.all 0   filter 0   reduce 0   transaction 0");
    N.push("    if 12   throw 3   ternarios 32   map 4   dataSource.query 8");
    N.push("    Y CERO funciones de ventana: 0 OVER, 0 ROW_NUMBER, 0 SUM OVER, 0 FILTER,");
    N.push("      0 LATERAL, 0 CTE. Con UN GROUP BY, el de L179.");
    N.push("");
    N.push("  El LOOP es el de L215-228, el único bucle del fichero, y es el mejor algoritmo de");
    N.push("  los tres casos de inventario: recibe una fila por producto y sucursal, y monta un");
    N.push("  Map para convertirla en una fila por producto con las sucursales dentro. Eso es un");
    N.push("  giro, y el giro es el algoritmo del caso. Se dibuja sobre los mensajes 30 a 32.");
    N.push("");
    N.push("  NO HAY NINGUN alt, y hay que decirlo en vez de inventar uno:");
    N.push("");
    N.push("  - De los 12 if, nueve son guardas o construcción de consulta: permiso, sucursal");
    N.push("    inexistente, categoría inexistente, el array de ids vacío, y los cinco que")
    N.push("    anaden una condición al WHERE o la dejan fuera, L148, L152, L157. Eso no es");
    N.push("    una rama del caso de uso, es montar una consulta.")
    N.push("  - Los 32 ternarios son de valor: los ?? '', los ?? 0 de los tres totales, y el");
    N.push("    max y min de la paginación.")
    N.push("  - La agregación se hace en SQL, en una sola pasada, con un GROUP BY y un HAVING.");
    N.push("    Sin funciones de ventana no hay ninguna rama que dibujar.");
    N.push("");
    N.push("  Y las 2 barras de activación, que no son un extra: la del controlador y la del");
    N.push("  servicio, las dos únicas líneas de vida con código propio de este caso.");
    N.push("");
    N.push("EL HALLAZGO 2: LA AGREGACIÓN SE EJECUTA DOS VEZES, Y LA PRIMERA SOLO PARA CONTAR");
    N.push("");
    N.push("  La agregación entera está en una variable de texto, L164-180: 5 JOIN, un GROUP BY");
    N.push("  de 7 columnas y un HAVING. Y esa variable se usa dos veces, más una tercera consulta:");
    N.push("");
    N.push("    L183  SELECT COUNT(*)::int FROM ( la agregacion ) q");
    N.push("          Los 5 JOIN, el GROUP BY y el HAVING se ejecutan enteros, y se tiran todos")
    N.push("          menos un número. Para contar páginas.")
    N.push("    L188  la agregacion, más ORDER BY y LIMIT y OFFSET");
    N.push("          Para traer los 20 de la página.")
    N.push("    L203  SELECT de inventario_stock con el JOIN a sucursales,");
    N.push("          WHERE i.id_ptc = ANY($1::int[])")
    N.push("          El desglose. Y esta es la buena: UNA consulta para los 20 productos.")
    N.push("");
    N.push("  O sea que por cada página se ejecutan 3 consultas, y la primera es la más cara de");
    N.push("  las tres para devolver un entero.");
    N.push("");
    N.push("  LO QUE LA HACE BARATA, y hay que decirlo: inventario_stock tiene UNIQUE");
    N.push("  (id_ptc, id_sucursal) en L310, y el GROUP BY de L179 empieza por id_ptc. O sea que");
    N.push("  el índice puede resolver la agregación con un index scan holgado, sin agrupar nada,");
    N.push("  y no hace falta un índice sobre id_ptc solo. El otro, idx_inventario_sucursal de");
    N.push("  L563, es para el filtro por tienda.");
    N.push("");
    N.push("EL HALLAZGO 3: EL STOCK SE SUMA DOS VECES AL CERRAR UNA RESERVA");
    N.push("");
    N.push("  La columna es L306, cantidad_disponible INTEGER DEFAULT 0. Y TIENE DOS ESCRITORES.");
    N.push("");
    N.push("  EL PRIMERO es el trigger, trg_movimiento_inventario, L654-657, BEFORE INSERT sobre");
    N.push("  movimientos_inventario, y su L645-648 hace el upsert de inventario_stock sumando");
    N.push("  NEW.cantidad. O sea que añade el signo del movimiento a la cifra, en cada INSERT.");
    N.push("");
    N.push("  EL SEGUNDO es UNA LÍNEA DE TYPESCRIPT: SRV_ReservasService.ts L710.");
    N.push("");
    N.push("    L703  INSERT movimiento, 'SALIDA-RESERVA', +cantidad");
    N.push("          el trigger suma                                     +1");
    N.push("    L707  UPDATE inventario_stock");
    N.push("    L709  SET cantidad_reservada = GREATEST(0, cantidad_reservada - $3),");
    N.push("    L710  cantidad_disponible = cantidad_disponible + $3");
    N.push("          lo vuelve a sumar                                 +1");
    N.push("                                                              LA CUENTA DOS VECES");
    N.push("");
    N.push("  LAS TRES OPERACIONES DE RESERVA, COMPARADAS:");
    N.push("");
    N.push("    CREAR,   L1109-1120   movimiento -cantidad, el trigger resta        CORRECTO");
    N.push("    CERRAR,  L702-713     movimiento +cantidad, el trigger suma, y L710");
    N.push("                          suma otra vez                              LA CUENTA DOS VECES");
    N.push("    ANULAR,  L972-982     movimiento +cantidad, el trigger suma, y L979");
    N.push("                          no toca disponible                          CORRECTO");
    N.push("");
    N.push("  Las tres rutas son simétricas y UNA tiene un +1 de más. La de cerrar es la única que");
    N.push("  escribe la columna a mano. Las otras dos se apoyan solo en el trigger. Es una");
    N.push("  divergencia de copia entre las dos rutas de devolución.");
    N.push("");
    N.push("  Y no se puede fallar por la mitad: el INSERT de L703 y el UPDATE de L707 están los");
    N.push("  dos dentro de em.query, en la misma transacción. El stock se infla con las dos");
    N.push("  sumas, siempre, con éxito. Y es acumulativo e irreversible: cada reserva cerrada");
    N.push("  suma el doble. Y esa cifra es el SUM de L168, la primera columna de L365 y el");
    N.push("  primer número del CSV de L77. O sea que el número que el administrador mira para");
    N.push("  decidir qué comprar es un número que se ha ido arriba solo.");
    N.push("");
    N.push("  Y CU18 vio esas mismas tres líneas desde el otro lado, y escribió que dos de los");
    N.push("  tres SALIDA-RESERVA no son salidas y la pantalla los muestra con signo menos.");
    N.push("  Aquí se ve que además uno de los dos cuenta el stock dos veces.");
    N.push("");
    N.push("EL HALLAZGO 4: VENDIDAS ES UN CONTADOR QUE SOLO SUBE");
    N.push("");
    N.push("  Las tres columnas de L306-308 se mantienen de forma distinta, y eso es lo importante:");
    N.push("");
    N.push("    cantidad_disponible  DOS escritores: el trigger, en los dos sentidos, y un UPDATE");
    N.push("                       de Reservas L710 que duplica el stock al cerrar.   Hallazgo 3");
    N.push("    cantidad_reservada   tres UPDATE de reservas, con el suelo puesto:");
    N.push("                       L1117  cantidad_reservada = cantidad_reservada + $3");
    N.push("                       L709   GREATEST(0, cantidad_reservada - $3)")
    N.push("                       L979   lo mismo")
    N.push("                       O sea que el GREATEST(0, ...) es un suelo, y es la defensa")
    N.push("                       que CU09 no tenía.")
    N.push("    cantidad_vendida     dos UPDATE, y los dos SUMAN. Pagos L341 y L711. Y no hay")
    N.push("                       ningún RESTO en todo el proyecto.");
    N.push("");
    N.push("  O sea que total_vendido es un CONTADOR ACUMULADO, no un stock. Y por eso solo crece.");
    N.push("  Lo que debería bajarlo es sp_registrar_devolucion, schema L774, y no la llama");
    N.push("  nadie: cero llamadas a sp_ o fn_ en todo el TypeScript. Es la tercera de las ocho");
    N.push("  funciones muertas que CU17 contó.");
    N.push("");
    N.push("  CONSECUENCIA: una devolución suma stock con un ajuste, si el encargado lo hace, y NO");
    N.push("  baja el total vendido. O sea que la cifra de vendidas cuenta prendas que ya no");
    N.push("  están en la tienda, y no se puede corregir sin intervención manual.");
    N.push("");
    N.push("EL HALLAZGO 5: EL stock_bajo COMPARA DOS SUMAS");
    N.push("");
    N.push("  L244: stock_bajo: stockMinimoGlobal > 0 && totalDisponible <= stockMinimoGlobal");
    N.push("");
    N.push("  Y stock_minimo_global es el SUM de los mínimos de todas las sucursales, L171, y");
    N.push("  total_disponible es el SUM de los disponibles, L168. O sea que compara un SUM con");
    N.push("  un SUM, y eso solo tiene sentido si el producto está en todas.");
    N.push("");
    N.push("  CASO EN EL QUE NO CUADRA, y es el más normal de una tienda real:");
    N.push("");
    N.push("    sucursal A   minimo 0   disponible 4   no lleva esa talla");
    N.push("    sucursal B   minimo 5   disponible 1   le falta 1");
    N.push("    ---")
    N.push("    total        minimo 5   disponible 5   stock_bajo: 5 <= 5   SI");
    N.push("");
    N.push("  Se marca como stock bajo con 4 unidades de sobra en A, y porque en B le falta 1.");
    N.push("  El detalle de L383-395 lo diría, pero el número grande no. Y con un producto en una");
    N.push("  sola sucursal el mínimo global es el de esa, y entonces sí cuadra: la bandera es");
    N.push("  correcta en el caso de un producto y arbitraria en el de varios, y no hay forma de");
    N.push("  saber cuál de los dos se está mirando.");
    N.push("");
    N.push("LO BUENO, Y EN ESTE CASO ES LA MAYORÍA");
    N.push("");
    N.push("  - El WHERE dinámico de L146-162, que es el mejor código de consulta del proyecto.");
    N.push("    Un $n calculado con params.length, un solo parámetro reutilizado tres veces para");
    N.push("    los tres LIKE, y cero concatenación de valores del usuario. El hallazgo 6 lo")
    N.push("   .detail con los 17 renglones.")
    N.push("  - El desglose en una sola consulta, L198, con ANY y el cast ::int[]. Es el mismo")
    N.push("    patrón que validarDetalle en CU16, L328, y lo que hace barato el giro del Map.")
    N.push("  - El índice sirve para la agregación sin querer y bien: el UNIQUE (id_ptc,")
    N.push("    id_sucursal) de L310 empieza por la primera columna del GROUP BY de L179.")
    N.push("  - Cero funciones de ventana en un caso de agregación. Con un GROUP BY y un HAVING")
    N.push("    y ya, y el HAVING hace el trabajo que debe hacer, que es filtrar ya agregado.")
    N.push("  - La paginación con suelo y techo, L142-144, el mismo patrón que el kardex de CU18.")
    N.push("  - Y el Set de expandidos de la pantalla, L109, que es de los pocos sitios donde se")
    N.push("    guarda un conjunto de ids en vez de un array con indexOf.")
    N.push("");
    N.push("RELACIÓN CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  CU17 contó las 8 funciones del esquema y dijo que 7 estaban muertas. Esta es la");
    N.push("  tercera: sp_registrar_devolucion, L774, que es la que bajaría cantidad_vendida, o");
    N.push("  sea que el número de vendidas de esta pantalla depende de una función muerta.");
    N.push("");
    N.push("  Y CU17, CU18 y CU19 Dorsetshare tabla inventario_stock con este caso, pero cada uno");
    N.push("  en una columna: CU17 el stock_minimo_alert, CU18 el saldo del kardex, CU19 lo");
    N.push("  escribe, y CU20 lo resume. O sea que las cuatro pantallas de inventario leen y");
    N.push("  escriben la misma tabla y el único escritor de su cifra principal es un trigger.");
    N.push("");
    N.push("  Y el detalle por sucursal que hace este caso con el Map, L214-228, es el mismo");
    N.push("  patrón de ANY en una consulta que uso validarDetalle en CU16. Y el GREATEST(0,...")
    N.push("  de L709, en reservas, es la defensa contra el problema que CU09 tenía con");
    N.push("  cantidad_reservada. O sea que un caso lo resuelve y el siguiente lo hace bien.")
    N.push("");
    N.push("SOBRE LA COLOCACIÓN DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Anchura: las diez cabeceras separadas " + PASO + " px, con " + ANCHO_CAB + " de ancho. Quedan");
    N.push("  65 px entre una y otra. Altura: " + PASO_MSG + " px por mensaje. El mensaje 1 cae en la y " + Y_MSG0);
    N.push("  y el " + TOTAL_MSG + " en la y " + (Y_MSG0 + (TOTAL_MSG - 1) * PASO_MSG) + ".");
    N.push("");
    N.push("  Un detalle que hizo fallar estos diagramas once veces y que conviene no");
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
    N.push("    MARCOS de fragmento colocados: " + MARCOS_PUESTOS + " de 1");
    N.push("    BARRAS de activación colocadas: " + BARRAS_PUESTAS + " de 2");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU20 Secuencia", 0); } catch (e) { }
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
    T.push("CU20 - DIAGRAMA DE SECUENCIA - INFORME");
    T.push("");
    T.push("Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB);
    T.push("Tipo de diagrama: " + tipoUsado);
    T.push("Mensajes: " + r.puestos + " de " + TOTAL_MSG);
    T.push("Mensajes a sí mismo: " + r.autodestino);
    T.push("Conectores en el diagrama: " + r.enDiagrama);
    T.push("Hallazgos: " + h2.total + " de " + TOTAL_HAL + ", banda hasta la y " + h2.fin);
    T.push("");
    T.push("AVISO DE NUMERACIÓN");
    T.push("Este caso es CU20 en el documento y CU26 en el código del proyecto.");
    T.push("Y el título promete 5 categorías: disponibles, reservadas, vendidas,");
    T.push("agotadas y por ingresar. En el código hay 3, y las agotadas están");
    T.push("además excluidas por el HAVING de L180.");
    T.push("");
    T.push("MARCOS Y BARRAS  <-- MIRA ESTO");
    T.push("Este caso tiene 1 loop y NINGUN alt. Contado antes de dibujar con");
    T.push("contadores sobre las 259 líneas de SRV_ExistenciasService:");
    T.push("  for 1   while 0   Promise.all 0   transaction 0");
    T.push("  if 12   throw 3   ternarios 32   map 4   dataSource.query 8");
    T.push("  y CERO funciones de ventana: 0 OVER, 0 ROW_NUMBER, 0 SUM OVER,");
    T.push("    0 FILTER, 0 LATERAL, 0 CTE. Con 1 GROUP BY.");
    T.push("De los 12 if, nueve son guardas o construcción de consulta.");
    T.push("Fragmentos colocados: " + MARCOS_PUESTOS + " de 1");
    T.push("Barras de activación colocadas: " + BARRAS_PUESTAS + " de 2");
    if (MARCOS_PUESTOS < 1 || BARRAS_PUESTAS < 2) {
        T.push("  Si alguno sale a 0, EA no ha aceptado la forma y hay que");
        T.push("  dibujarlo a mano en el diagrama.");
    } else {
        T.push("  Los 3 han salido. Son FORMAS dibujadas por script, no");
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
    msg = msg + "CU20 - Consultar Existencias Consolidadas" + SALTO;
    msg = msg + "Diagrama de secuencia, sección 3.3.2.1." + SALTO;
    msg = msg + "En el código del proyecto este caso es CU26." + SALTO + SALTO;
    msg = msg + "10 líneas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "EL TITULO NO CUADRA: promete 5 categorías y hay 3." + SALTO;
    msg = msg + "Las agotadas están además excluidas por el HAVING de" + SALTO;
    msg = msg + "L180, y por ingresar no puede existir porque no hay" + SALTO;
    msg = msg + "recepción." + SALTO + SALTO;
    msg = msg + "1 loop (L215, el giro del Map) y NINGUN alt." + SALTO;
    msg = msg + "FRAGMENTOS colocados: " + MARCOS_PUESTOS + " de 1." + SALTO;
    msg = msg + "BARRAS colocadas: " + BARRAS_PUESTAS + " de 2." + SALTO;
    if (MARCOS_PUESTOS < 1 || BARRAS_PUESTAS < 2) msg = msg + "  Si falta alguno, hay que dibujarlo a mano." + SALTO;
    msg = msg + SALTO;
    msg = msg + "EL HALLAZGO 2: la agregación se ejecuta dos veces, y" + SALTO;
    msg = msg + "la primera solo para contar. Lo que la hace barata es que" + SALTO;
    msg = msg + "el UNIQUE (id_ptc, id_sucursal) empieza por la primera" + SALTO;
    msg = msg + "columna del GROUP BY." + SALTO;
    msg = msg + "EL HALLAZGO 4: vendidas es un contador que solo sube, y la" + SALTO;
    msg = msg + "función que lo bajaría no la llama nadie." + SALTO + SALTO;
    msg = msg + "LO BUENO: el WHERE dinámico con $n calculado, el desglose" + SALTO;
    msg = msg + "en una consulta con ANY, y el giro al Map, que es el" + SALTO;
    msg = msg + "mejor algoritmo de los tres casos de inventario." + SALTO + SALTO;
    msg = msg + "Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACIÓN: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU20 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU20 Secuencia", 0); } catch (e3) { }
}
