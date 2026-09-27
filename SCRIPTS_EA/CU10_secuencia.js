// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÃ‘O   Â·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU10  Registrar Producto de Ropa en Catalogo (Tallas y Colores)
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/admin/AdminCatalogoProductos.tsx     477 lineas
//     web/src/lib/api.ts                                L1180-1210
//     api/src/main.ts                                   L22-43 ValidationPipe
//     api/src/modulos/seguridad/dependencias.ts         L15-65 JwtAuthGuard
//     api/src/modulos/catalogo/CTR_CatalogoAdmin.ts     83 lineas, 3 endpoints
//     api/src/modulos/catalogo/CTR_CatalogosAdmin.ts    209 lineas, 12 endpoints
//     api/src/modulos/catalogo/SRV_ProductosService.ts  292 lineas
//     api/src/modulos/catalogo/SRV_CatalogosService.ts  634 lineas
//     api/src/modulos/seguridad/SRV_BitacoraService.ts L14-39
//     BASE DE DATOS/schema.sql                         L165-192, L223-244
//
//   Cada mensaje lleva la linea del fichero de la que sale.
//
// QUE HACE ESTE CASO, Y POR QUE ES EL MAS RICO DE LOS DIEZ
//   Registrar un producto de ropa es la operacion mas completa que
//   hace el proyecto en una sola llamada, y por eso es la que mas cosas
//   teach bien y mas cosas teach mal.
//
//   Lo que hace bien, y no lo hace ningun otro caso:
//
//     - El DTO, L20-57, es el mas completo del proyecto: MinLength,
//       MaxLength, IsInt, Min, Max, IsArray, ArrayMinSize, IsInt each,
//       IsNumber con maxDecimalPlaces. Doce validaciones en un DTO.
//
//     - El precio se valida dos veces, con dos metodos distintos. El
//       pipe usa maxDecimalPlaces, L38, y el servicio usa
//       Math.round(precio * 100) !== precio * 100, L143. Son dos
//       comprobaciones distintas de la misma cosa.
//
//     - El SKU se genera con un bucle de 6 intentos y una captura del
//       23505 de Postgres, L234-266. Eso es un patron de concurrencia
//       bien hecho: si dos altas cogen el mismo numero, el segundo
//       reintenta con el siguiente.
//
//     - Y cargarPermisos, L50-60, NO USA EL GETTER. Hace un JOIN
//       directo a usuarios_roles. Es la primera vez en diez casos que
//       se rompe con el defecto de roles[0], y por eso este caso
//       resuelve lo que los otros nueve no.
//
//   Lo que hace mal, y son cuatro cosas grandes:
//
//     1. LA COLUMNA porcentaje_iva NO EXISTE. L223-L235 de schema.sql
//        no la tiene. El DTO la pide, L46, el servicio la escribe, L246,
//        la pantalla la muestra, L211, y el listado la lee, L112. No hay
//        forma de crear un producto.
//
//     2. Y LO MISMO CON codigo, id_proveedor y modelo_3d_url, que si
//        existen pero el DTO no los expone y el servicio los deja a
//        NULL. Un producto sin proveedor y sin modelo 3D.
//
//     3. LAS TRES ESCRITURAS VAN SUELTAS. El producto, las N
//        combinaciones, y la bitacora. Cero transaccion, y este
//        servicio si la usa en otros sitios del proyecto.
//
//     4. LA COMBINACION DE STOCK NO SE VALIDA CONTRA LAS DIMENSIONES.
//        producto_talla_color tiene UNIQUE(id_producto, id_talla,
//        id_color), y el servicio comprueba que las tallas validas son
//        tantas como se pidieron, L172. Pero las combinaciones las
//        genera con un bucle anidado, L190-195, y si el cliente manda
//        una talla repetida, el INSERT revienta con el 23505 y no con
//        un mensaje util.
//
//   41 mensajes. 10 lineas de vida. 11 van a la base de datos, 14 son
//   mensajes a si mismo, 1 va al servicio de catalogos y 8 son retornos.
//   8 guardas escritas entre corchetes y 9 codigos: 200, 201, 403, 404,
//   409, 422, 500 y el 23505, que es de Postgres y no un codigo HTTP.
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
var TOTAL_MSG = 41;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU10 Secuencia Producto Tallas Colores";
var DIAG_NOMBRE = "CU10 Registrar Producto Tallas y Colores";
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
    ["U", "ACTOR_Administrador", "Actor", "Lifeline", "Administrador", "quien registra", "Actor, no clase: es quien pulsa", "no es codigo, es la persona"],
    ["F", "AdminCatalogoProductos.tsx", "Object", "Lifeline", "CatalogoProductos", "formulario de alta", "Boundary", "web/src/pages/admin/AdminCatalogoProductos.tsx, 477 lineas"],
    ["H", "api.ts", "Object", "Lifeline", "api", "cliente HTTP", "Boundary", "web/src/lib/api.ts, L1180-1210"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["P", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "doce validaciones", "Control", "api/src/main.ts, L22-43, es global"],
    ["C", "CTR_CatalogoAdmin", "Object", "Lifeline", "CatalogoAdminController", "tres endpoints", "Control", "api/src/modulos/catalogo/CTR_CatalogoAdmin.ts, 83 lineas"],
    ["S", "SRV_ProductosService", "Object", "Lifeline", "ProductosService", "292 lineas", "Control", "api/src/modulos/catalogo/SRV_ProductosService.ts, 292 lineas"],
    ["K", "SRV_CatalogosService", "Object", "Lifeline", "CatalogosService", "tallas, colores, categorias", "Control", "api/src/modulos/catalogo/SRV_CatalogosService.ts, 634 lineas"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar()", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "6 tablas y 3 escrituras", "Entity", "schema.sql: tallas, colores, categorias, productos, producto_talla_color, temporadas"]
];

// Los 40 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [
    [1, "U", "F", "1. abre /admin/catalogo/productos   AdminCatalogoProductos.tsx, 477 lineas   con el formulario de alta", "S"],
    [2, "F", "F", "2. el useEffect pide los selectores: categorias, tallas, colores y temporadas   L71-86 del backend", "S"],
    [3, "F", "H", "3. GET /api/v1/admin/catalogo/productos/selectores   api.ts L1180", "S"],
    [4, "H", "G", "4. GET con Authorization Bearer y credentials:'include'", "S"],
    [5, "G", "D", "5. SELECT usuarios WHERE id_usuario = :sub   L44.   Una consulta por peticion, en el guard", "S"],
    [6, "G", "G", "6. [estado != 'activo'] 401 'Tu cuenta esta deshabilitada.'   L49-51", "S"],
    [7, "C", "S", "7. listarSelectores( currentUser )   CTR_CatalogoAdmin L66", "S"],
    [8, "S", "D", "8. SELECT r.permisos_json FROM usuarios JOIN usuarios_roles JOIN roles WHERE u.id_usuario = $1   L51-58.   SIN getter", "S"],
    [9, "S", "S", "9. y esto es lo unico que hace bien: es la primera vez en diez casos que la autorizacion NO pasa por roles[0]   L59", "S"],
    [10, "S", "S", "10. [sin '*' ni 'gestionar_productos'] 403 'No tienes permiso para gestionar productos.'   L64-66", "S"],
    [11, "S", "K", "11. los 4 selectores.   Las categorias, tallas y colores los trae SRV_CatalogosService, que es el dueno de esas 3 tablas   L634 lineas", "S"],
    [0, "K", "D", "0. SELECT id_categoria, id_talla, id_color y nombre, con LOWER(estado) = 'activo' y ORDER BY propio   L71-85.   Con el seed: 6 tallas XS-XXL y 8 colores", "S"],
    [12, "S", "C", "12. { categorias, tallas, colores, temporadas }   L86", "A"],
    [13, "C", "H", "13. el JSON con los cuatro selectores", "A"],
    [14, "H", "F", "14. setSelectores   L71-86.   Con los defaults del esquema: 6 tallas XS-XXL y 8 colores base", "A"],
    [15, "F", "F", "15. el admin rellena el formulario.   Al elegir categoria, L163, copia su porcentaje_iva_default al campo de IVA, que arranca en 13   L62", "S"],
    [16, "F", "F", "16. marca tallas y colores, y la pantalla calcula combinaciones = tallas * colores   L86.   El boton se habilita con cinco condiciones   L80-85", "S"],
    [17, "F", "H", "17. POST /api/v1/admin/catalogo/productos   api.ts L1186", "S"],
    [18, "H", "G", "18. POST con { nombre, descripcion, id_categoria, id_temporada, precio_base, porcentaje_iva, tallas, colores }", "S"],
    [19, "G", "P", "19. el guard no toca el cuerpo.   El pipe si, y este es el DTO mas completo del proyecto   CTR_CatalogoAdmin L20-57", "S"],
    [20, "P", "C", "20. CrearProductoRequest: MinLength(3) y MaxLength(100) en el nombre, MaxLength(1000) en la descripcion, IsInt en categoria y temporada, IsNumber con 2 decimales y Min(0.01) en el precio, Min(0) y Max(100) en el IVA, e IsArray con ArrayMinSize(1) e IsInt each en tallas y colores   L20-57", "S"],
    [21, "P", "P", "21. [cualquiera de las doce reglas] 422 con todos los mensajes   main.ts L27-41", "S"],
    [22, "C", "S", "22. crearProducto( currentUser, body, request )   L81", "S"],
    [23, "S", "D", "23. SELECT COUNT(*) FROM productos WHERE LOWER(nombre) = LOWER($1)   L131-134.   El nombre es unico en el codigo, no en la base", "S"],
    [24, "S", "S", "24. [ya existe] 409 'Ya existe un producto con ese nombre.'   L135-137", "S"],
    [25, "S", "S", "25. y el servicio repite las validaciones del pipe por si acaso: nombre de 3, L127, precio positivo, L140, y 2 decimales con Math.round, L143", "S"],
    [26, "S", "D", "26. 4 SELECT de existencia: categorias, temporadas, tallas y colores, cada uno con su 422   L152-182", "S"],
    [27, "S", "S", "27. [una talla o un color no es valido, o su estado no es 'activo'] 422   L172 y L180.   Ojo con el genero: es 'activo' y el default es 'Activo'", "S"],
    [28, "S", "S", "28. insertarConSku: hasta 6 intentos.   En cada uno calcula el siguiente TMU con un MAX sobre un regex, L236, y si Postgres da 23505 reintenta   L234-266", "S"],
    [29, "S", "D", "29. SELECT COALESCE(MAX(CAST(substring(codigo FROM 'TMU-([0-9]+)\$' AS integer)), 0) + 1 FROM productos WHERE codigo ~ '^TMU-[0-9]+\$'   L236-237.   Escritura 1 de 3", "S"],
    [30, "S", "D", "30. INSERT INTO productos (codigo, nombre, descripcion, id_categoria, id_temporada, precio_base, porcentaje_iva, estado, fecha_registro) VALUES (... 'Activo', NOW()) RETURNING id_producto   L244-247", "S"],
    [31, "D", "D", "31. [error 42703] la columna porcentaje_iva no esta en la tabla productos, schema.sql L223-235.   Y el SELECT de L93 tambien la pide, asi que el listado falla igual", "S"],
    [32, "S", "S", "32. y aqui se acaba: el 500 sale del servidor y no hay ningun try que lo traduzca.   El 23505 de L261 solo captura el duplicado, no este", "S"],
    [33, "S", "D", "33. el bucle anidado, L190-195, genera las combinaciones: tallas por colores.   INSERT INTO producto_talla_color (id_producto, id_talla, id_color, estado_stock) VALUES (... 'Disponible')   L198-201.   Escritura 2 de 3", "S"],
    [34, "S", "S", "34. sin transaccion entre la 1 y la 2.   Cero queryRunner en 292 lineas, y este servicio si usa transacciones en otros modulos del proyecto", "S"],
    [35, "S", "B", "35. bitacora('INSERT', 'productos', 'Producto creado: ...', usuario, request, idProducto, null, { codigo, nombre, id_categoria, id_temporada, precio_base, porcentaje_iva, combinaciones, estado })   L206-215 y L271-291", "S"],
    [36, "B", "D", "36. INSERT INTO bitacora_auditoria con new_data   L27-38.   La 3 de 3, y la unica que llega   A", "A"],
    [37, "S", "C", "37. { detail, id_producto, codigo, combinaciones, precio_final }.   El precio final se calcula aqui, L204, y no se guarda en ninguna columna   L217-223", "A"],
    [38, "C", "H", "38. el JSON con el codigo TMU y el numero de combinaciones   api.ts L1186-1195", "A"],
    [39, "H", "F", "39. Toast de exito con el codigo, o Toast de error con el 422 o con el 500   L104-108", "A"],
    [40, "F", "U", "40. el producto aparece en el listado con su numero de combinaciones, que sale de un COUNT sobre producto_talla_color   L95", "A"]
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. La columna porcentaje_iva no existe, y el codigo la usa en 4 sitios", [
        "Este es el hallazgo mas grande de los diez, y es del mismo genero",
        "que el de CU09 pero con mas alcance.",
        "",
        "LO QUE DICE EL ESQUEMA, L223-235, la tabla productos entera:",
        "",
        "  id_producto    SERIAL PRIMARY KEY",
        "  codigo         VARCHAR(40) UNIQUE NOT NULL",
        "  nombre         VARCHAR(150) NOT NULL",
        "  descripcion    TEXT",
        "  id_categoria   INTEGER REFERENCES categorias(id_categoria)",
        "  id_temporada   INTEGER REFERENCES temporadas(id_temporada)",
        "  id_proveedor   INTEGER REFERENCES proveedores(id_proveedor)",
        "  precio_base    DECIMAL(10,2) NOT NULL",
        "  modelo_3d_url  TEXT",
        "  estado         VARCHAR(20) DEFAULT 'Disponible'",
        "  fecha_registro TIMESTAMP DEFAULT NOW()",
        "",
        "NO HAY porcentaje_iva. Ni en esta tabla ni en ninguna otra: la",
        "palabra no aparece en el esquema, y no hay ALTER TABLE.",
        "",
        "Y EL CODIGO LA USA EN CUATRO SITIOS:",
        "",
        "  L46   el DTO declara porcentaje_iva, con Min(0) y Max(100)",
        "  L112  el listado la lee: porcentaje_iva: Number(f.porcentaje_iva ?? 0)",
        "  L147  el alta la normaliza: Number(dto.porcentaje_iva ?? 13)",
        "  L246  el INSERT la escribe, en la lista de columnas de L244-245",
        "",
        "Consecuencias, y son cuatro:",
        "",
        "  1. El alta de producto da 500. El INSERT nombra una columna que",
        "     no existe: ERROR 42703. Y el catch de L260-266 solo mira el",
        "     23505 del duplicado, asi que el 42703 pasa de largo.",
        "",
        "  2. El LISTADO tambien falla, y eso es peor. L93 pide",
        "     p.porcentaje_iva en el SELECT. O sea que la pantalla de",
        "     catalogo esta vacia siempre, no solo el alta.",
        "",
        "  3. El precio final con IVA, L204, se calcula y se devuelve en la",
        "     respuesta, pero no se guarda en ninguna parte. No hay",
        "     columna donde quede. Se recalcula cada vez que se lee, si se",
        "     llegara a leerse.",
        "",
        "  4. Y el 13 de L147 es una constante en el codigo, con la",
        "     categoria como unico sitio donde se puede cambiar, L163. Pero",
        "     porcentaje_iva_default, que esta en categorias, si que",
        "     existe. O sea que la intention de tener el IVA por categoria",
        "     se puede cumplir, pero el resultado no tiene donde guardarse."
    ]],
    ["2. Tres columnas de la tabla productos no estan en el DTO", [
        "El mismo problema, en su otra forma: no lo que sobra, sino lo que",
        "falta. Y aqui el efecto es silencioso.",
        "",
        "La tabla productos tiene 12 columnas. El DTO, L14-23, expone 8:",
        "",
        "  EN EL DTO                    EN LA TABLA",
        "  nombre                       codigo          se genera solo, L240",
        "  descripcion                  id_proveedor    NUNCA SE ENVIA",
        "  id_categoria                 modelo_3d_url   NUNCA SE ENVIA",
        "  id_temporada",
        "  precio_base",
        "  porcentaje_iva               no existe",
        "  tallas, colores",
        "",
        "O sea que id_proveedor y modelo_3d_url quedan siempre a NULL, sin",
        "que haya ninguna validacion que lo impida ni ningun aviso. El",
        "producto se crea y aparece en el catalogo sin proveedor y sin",
        "modelo 3D, y no hay forma de saber desde la aplicacion que esas",
        "dos columnas estan vacias.",
        "",
        "Y eso tiene una consecuencia en el negocio: id_proveedor es",
        "INTEGER REFERENCES proveedores(id_proveedor), y es la columna",
        "que uniria el producto con su proveedor. Los 3 proveedores de",
        "CU14, y las ordenes de compra de CU15, cuelgan de ahi. Un",
        "producto sin proveedor no se puede pedir.",
        "",
        "Y hay una tercera cosa, mas pequena: productos.nombre es",
        "VARCHAR(150) y el DTO dice MaxLength(100), schema.sql L226 y",
        "CTR_CatalogoAdmin L24. O sea que el DTO es mas estricto que la",
        "base. Al reves que en CU05, donde faltaba el MaxLength. Aqui",
        "sobra, y no hace dano: simply no deja usar 50 caracteres de los",
        "150 disponibles. Es una decision discutible, no un error."
    ]],
    ["3. Las tres escrituras van sueltas, y aqui hay N filas", [
        "La misma falta de transaccion que CU06 y CU07, pero aqui el",
        "numero de filas no es 1, es N.",
        "",
        "  escritura 1, L244   INSERT INTO productos, una fila",
        "  escritura 2, L198   INSERT INTO producto_talla_color, N filas",
        "  escritura 3, L281   INSERT INTO bitacora_auditoria, una fila",
        "",
        "Y N es el producto cartesiano: mensaje 33, L190-195, un bucle",
        "anidado sobre tallas y colores. Con el seed, 6 tallas y 8",
        "colores, un producto puede generar 48 combinaciones en una sola",
        "sentencia, con los parametros numerados a mano, L189-194:",
        "",
        "  valores.push('($1, $' + i++ + ', $' + i++ + ', \\'Disponible\\')')",
        "",
        "Es ingenioso y funciona, pero significa que un solo producto",
        "mala puede generar cientos de filas. Sin transaccion:",
        "",
        "  - si el INSERT de producto_talla_color revienta, queda un",
        "    producto sin ninguna combinacion. Aparece en el catalogo con",
        "    0 combinaciones y no se puede vender, porque no hay ninguna",
        "    fila en producto_talla_color donde vender.",
        "  - si el INSERT de la bitacora revienta, quedan las dos",
        "    anteriores sin rastro. Y el usuario ve un error, cree que no",
        "    se ha creado, y al reintentar da 409 por el nombre de L135.",
        "",
        "Y el 23505 del UNIQUE(id_producto, id_talla, id_color), L243 del",
        "esquema, es la razon de que el servicio NO deduplique las tallas",
        "y los colores que le mandan. Ver el hallazgo 4.",
        "",
        "Lo que si tiene, y esta bien: el 23505 se captura en L261-266 y",
        "se reintenta hasta 6 veces. Eso es manejo de concurrencia de",
        "verdad. Lo que no tiene es la transaccion que lo rodea."
    ]],
    ["4. Las tallas y los colores no se deduplican, y el UNIQUE revienta", [
        "Un hueco pequeno de validacion que se cierra con un error de",
        "Postgres en vez de con un mensaje.",
        "",
        "LO QUE VALIDA EL SERVICIO, L168-182:",
        "",
        "  SELECT id_talla FROM tallas",
        "    WHERE id_talla = ANY($1) AND LOWER(estado) = 'activo'",
        "",
        "y luego compara longitudes:",
        "",
        "  if (tallasValidas.length !== dto.tallas.length)",
        "    throw 422 'Una de las tallas seleccionadas no es valida.'",
        "",
        "O sea que comprueba que TODAS las ids existen y estan activas.",
        "Eso esta bien y es la validacion correcta.",
        "",
        "LO QUE NO COMPRUEBA: que no haya ids repetidas en el array.",
        "",
        "Si mandas tallas: [1, 1, 2], la consulta con ANY() devuelve 2",
        "filas, y dto.tallas.length es 3. O sea que 2 !== 3, y da 422",
        "'Una de las tallas seleccionadas no es valida.'",
        "",
        "O sea que si esta controlado, pero POR EL CAMINO equivocado: el",
        "error dice que una talla no es valida, cuando lo que pasa es que",
        "la has mandado dos veces. El mensaje no lleva a ninguna",
        "solucion.",
        "",
        "PERO CON COLORES ES AL REVES, y ahi si hay un fallo de verdad.",
        "Con colores: [1, 1] la consulta devuelve 1 fila y el array",
        "tiene 2, asi que tambien 422. Y con tallas: [1] y colores: [1, 1],",
        "las tallas pasan, y entonces el bucle anidado genera:",
        "",
        "  (id, 1, 1)  y  (id, 1, 1)   dos filas identicas",
        "",
        "Y producto_talla_color tiene UNIQUE (id_producto, id_talla,",
        "id_color), schema.sql L243. O sea que el segundo INSERT da",
        "23505 duplicate key, que el catch de L260 NO captura porque",
        "solo captura el 23505 del INSERT de productos, no el de L198.",
        "",
        "Resultado: 422 con un mensaje que no cuadra, o 500 con un error",
        "de Postgres. Ninguno de los dos dice 'has mandado la misma talla",
        "dos veces'. Y con el DTO de L48-56, que valida IsInt each pero",
        "no ArrayUnique, la app no lo puede catching antes."
    ]],
    ["5. El codigo genera el SKU con un patron bueno, y con un fallo sneaky", [
        "insertarConSku, L228-269, es el manejo de concurrencia mejor",
        "escrito del proyecto, y tiene un detalle que lo estropea.",
        "",
        "LO QUE HACE BIEN. El patron es este:",
        "",
        "  L234  for (let intento = 0; intento < 6; intento++)",
        "  L236    SELECT COALESCE(MAX(CAST(substring(codigo FROM",
        "              'TMU-([0-9]+)\\$' AS integer)), 0) + 1 AS sig",
        "            FROM productos WHERE codigo ~ '^TMU-[0-9]+\\$'",
        "  L240    const codigo = 'TMU-' + String(sig).padStart(4, '0')",
        "  L243    INSERT ... RETURNING id_producto",
        "  L261    catch: si el code es '23505', no es el ultimo intento,",
        "           y se reintenta con el siguiente numero",
        "",
        "O sea que asume que dos altas simultaneas pueden coger el mismo",
        "numero, y en vez de un BEGIN TRANSACTION con SELECT FOR UPDATE,",
        "reintenta hasta 6 veces. Para un numero autoincremental manual,",
        "es una solucion valida y probablemente la mas simple que hay.",
        "Y el UNIQUE de la columna, schema.sql L225, es la red que",
        "hace que el 23505sea posible detectarlo.",
        "",
        "LO QUE ESTROPEA: el MAX con regex se salta los codigos que no",
        "cumplen el patron.",
        "",
        "  WHERE codigo ~ '^TMU-[0-9]+\\$'",
        "",
        "Asi que un producto cuyo codigo sea TMU-0008A, o PR-0009, o",
        "cualquier otra cosa, no cuenta. Y el padStart(4) mas el MAX",
        "hacen que despues de TMU-9999 venga TMU-10000, que son 5",
        "digitos y ya no es lo que el formato sugiere, aunque la columna",
        "es VARCHAR(40) y cabe de sobra.",
        "",
        "Y hay un detalle de estado de la clase: el codigo generado se",
        "guarda en this.codigoActual, L226 y L258, que es una propiedad",
        "de la INSTANCIA del servicio. En NestJS el servicio es",
        "singleton, asi que dos altas simultaneas comparten la propiedad:",
        "la primera pone TMU-0004, la segunda pone TMU-0005, y si la",
        "primera llega al L207 para la bitacora despues de que la",
        "segunda haya escrito, la bitacora de la primera graba el",
        "codigo de la segunda. Y el mensaje 35 y el 37 leen esa misma",
        "propiedad. Es una carrera real, y en un caso de uso de alta de",
        "productos, con dos admins dakolo a la vez, es probable."
    ]],
    ["6. El genero de los estados se vuelve a romper, y aqui con filtro", [
        "En CU09 se vio que ciudades y sucursales usan el genero",
        "femenino y usuarios el masculino. Aqui hay una tercera tabla",
        "que usa el masculino, y por eso el filtro del selector y el",
        "filtro del alta coinciden. Pero solo por casualidad.",
        "",
        "EN EL ESQUEMA:",
        "  usuarios.estado        L37   DEFAULT 'Pendiente'",
        "  tallas.estado          L168  DEFAULT 'Activo'      masculino",
        "  colores.estado         L176  DEFAULT 'Activo'      masculino",
        "  categorias.estado      L183  DEFAULT 'Activo'      masculino",
        "  ciudades.estado        L55   DEFAULT 'Activa'      femenino",
        "  sucursales.estado      L64   DEFAULT 'Activa'      femenino",
        "  productos.estado       L233  DEFAULT 'Disponible'  ni uno ni otro",
        "  temporadas.estado      L191  DEFAULT 'Programada'   ni uno ni otro",
        "",
        "Y EN EL CODIGO DE ESTE CASO, todo con 'activo' en minuscula:",
        "  L73   categorias  LOWER(estado) = 'activo'",
        "  L76   tallas      LOWER(estado) = 'activo'",
        "  L79   colores     LOWER(estado) = 'activo'",
        "  L153  categorias  LOWER(estado) = 'activo'",
        "  L169  tallas      LOWER(estado) = 'activo'",
        "  L177  colores     LOWER(estado) = 'activo'",
        "",
        "O sea que aqui SI cuadra, porque el default tambien es masculino.",
        "Y el LOWER salva las dos comparaciones con el 'Activo' del",
        "seed. Bien.",
        "",
        "PERO FALTA TEMPORADAS, y es el punto:",
        "  L82-83  SELECT id_temporada, nombre, estado FROM temporadas",
        "",
        "El selector de temporadas NO filtra por estado. Trae todas, y",
        "devuelve el estado para que el frontend lo pinte. Y el alta, L160-162,",
        "tampoco lo comprueba:",
        "",
        "  SELECT id_temporada FROM temporadas WHERE id_temporada = $1",
        "",
        "Sin AND LOWER(estado). O sea que se puede registrar un producto",
        "en una temporada Inactiva, que es lo contrario de lo que se hace",
        "con la categoria en L153. Y la unica validacion del genero de",
        "estados que hace el caso de uso, la de L27, ni siquiera mira la",
        "temporada.",
        "",
        "Y productos.estado es 'Disponible', no 'Activo'. L214 escribe",
        "'Activo' en la bitacora, pero el default de la tabla es",
        "'Disponible', y ninguna de las dos cosas se cruza con el otro",
        "sitio. Un producto con estado 'Disponible' no es lo mismo que un",
        "producto 'Activo' en ninguna consulta del proyecto."
    ]],
    ["7. Lo que si esta bien: el permiso sin getter, y es la exception que rompe el defecto", [
        "Este es el hallazgo positivo mas importante de los diez casos,",
        "porque es la excepcion a un defecto que llevaba nueve casos.",
        "",
        "cargarPermisos, L50-60, hace esto:",
        "",
        "  SELECT r.permisos_json",
        "  FROM usuarios u",
        "  JOIN usuarios_roles ur ON ur.id_usuario = u.id_usuario",
        "  JOIN roles r ON r.id_rol = ur.id_rol",
        "  WHERE u.id_usuario = $1",
        "",
        "Y luego L59:",
        "  return fila?.permisos_json ?? [];",
        "",
        "Sin getter, sin roles[0], sin leftJoinAndSelect. O sea que lee",
        "TODOS los roles del usuario, no el primero. Es la primera vez en",
        "diez casos de uso que la autorizacion no depende del orden de",
        "los roles.",
        "",
        "Y hay un detalle mas: es un JOIN normal, no un LEFT JOIN. O sea",
        "que si el usuario no tiene NINGUN rol, la consulta no devuelve",
        "filas, y con un destructuring [fila] fila es undefined. Y el ??",
        "de L59 lo convierte en un array vacio. O sea que un usuario sin",
        "roles no rompe nada: simplemente no tiene permisos. Esta bien",
        "resuelto.",
        "",
        "PERO TIENE UN COSTE, y hay que decirlo:",
        "",
        "  return fila?.permisos_json ?? [];",
        "",
        "Con varios roles, la consulta devuelve VARIAS filas, y el",
        "destructuring [fila] se queda con la primera. O sea que el",
        "arreglo sigue siendo el primero que llegue, pero ahora el",
        "primer es el que elija el planificador de Postgres, en lugar de",
        "ser el del getter de TypeORM. Se ha ganado la correccion",
        "conceptual y se ha perdido la garantia.",
        "",
        "Y la solucion seria una linea:",
        "",
        "  permisos_json",
        "  FROM usuarios_roles ur",
        "  JOIN roles r ON r.id_rol = ur.id_rol",
        "  WHERE ur.id_usuario = $1",
        "  ... y unir los arrays",
        "",
        "O un array_agg, o un ANY sobre el array de permisos. O sea que",
        "el defecto de fondo sigue ahi, solo que aqui se ve."
    ]],
    ["8. Lo demas que esta bien: el DTO mas completo y el unico bucle de reintento", [
        "Ademas del permiso sin getter, este caso tiene tres cosas que",
        "no tiene ningun otro.",
        "",
        "1. EL DTO MAS COMPLETO DEL PROYECTO. CTR_CatalogoAdmin L20-57:",
        "",
        "  nombre            @IsString @IsNotEmpty @MinLength(3) @MaxLength(100)",
        "  descripcion       @IsOptional @IsString @MaxLength(1000)",
        "  id_categoria      @IsInt",
        "  id_temporada      @IsInt",
        "  precio_base       @IsNumber(maxDecimalPlaces: 2) @Min(0.01)",
        "  porcentaje_iva    @IsOptional @IsNumber(maxDecimalPlaces: 2)",
        "                   @Min(0) @Max(100)",
        "  tallas            @IsArray @ArrayMinSize(1) @IsInt(each: true)",
        "  colores           @IsArray @ArrayMinSize(1) @IsInt(each: true)",
        "",
        "Doce reglas en un DTO. Y CU05, que era el mejor de los anteriores,",
        "tenia cinco. Y lo que mas importa: el IsInt each con el",
        "ArrayMinSize es la MISMA combinacion que CU05, y aqui se aplica",
        "a un array de ids, que es donde de verdad hace falta.",
        "",
        "2. EL PRECIO SE VALIDA DOS VECES CON METODOS DISTINTOS. El pipe",
        "   usa IsNumber con maxDecimalPlaces, L38, que es un validador de",
        "   formacion. El servicio usa Math.round(precio * 100) !==",
        "   precio * 100, L143, que es aritmetica. Los dos detectan los",
        "   decimales de mas, pero uno con regla y el otro con numero.",
        "   Y el segundo es el que de verdad aguanta, porque",
        "   transformOptions tiene enableImplicitConversion: false en",
        "   main.ts L26, asi que el body llega como lo que mando el",
        "   cliente. Es la defensa que CU05 no tenia.",
        "",
        "3. EL BUCLE DE REINTENTO DEL SKU. Ver el hallazgo 5. Es lo",
        "   unico del proyecto que captura el 23505 y reintenta.",
        "   Compruebalo: los otros 4 ficheros con transacciones son",
        "   Compras, Pagos, Reservas y Ventas, y ninguno genera un",
        "   identificador propio.",
        "",
        "Y una cosa mas, pequena pero buena: la validacion de las tallas",
        "y los colores se hace con LOWER(estado) = 'activo', o sea que",
        "una talla inhabilitada no se puede usar en un producto nuevo.",
        "Y es el criterio correcto: el bucle de doble comparacion de",
        "L172, tallasValidas.length contra dto.tallas.length, detecta",
        "tambien las repetidas, por el motivo equivocado pero las",
        "detecta."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU10."; } catch (e) { }
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
        try { o.Text = "CU10  Registrar Producto de Ropa en Catalogo (Tallas y Colores)"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 700) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseno de caso de uso, seccion 3.3.2.1.  10 lineas de vida, 41 mensajes, 8 hallazgos."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja. Este es el caso mas completo del proyecto en una llamada, y el que mas cosas teach bien: el DTO con doce validaciones, el precio validado dos veces, y el unico bucle de reintento con captura del 23505. Y el que mas falla: la columna porcentaje_iva no existe en el esquema, y el codigo la usa en cuatro sitios."; } catch (e) { }
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
    N.push("CU10  Registrar Producto de Ropa en Catalogo (Tallas y Colores).  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Administrador      Â«actorÂ»     quien abre /admin/catalogo/productos");
    N.push("    AdminCatalogoProductos.tsx Â«boundaryÂ» 477 lineas, el formulario de alta");
    N.push("    api.ts                   Â«boundaryÂ»  lib/api.ts, L1180-1210");
    N.push("    JwtAuthGuard             Â«controlÂ»   dependencias.ts, L15-65");
    N.push("    ValidationPipe           Â«controlÂ»   main.ts, L22-43, doce reglas");
    N.push("    CTR_CatalogoAdmin        Â«controlÂ»   3 endpoints, 83 lineas, el mejor DTO del proyecto");
    N.push("    SRV_ProductosService     Â«controlÂ»   292 lineas, el bucle del SKU y el bucle anidado");
    N.push("    SRV_CatalogosService     Â«controlÂ»   634 lineas, tallas, colores y categorias");
    N.push("    SRV_BitacoraService      Â«controlÂ»   registrar(), la tercera escritura");
    N.push("    PostgreSQL               Â«entityÂ»    6 tablas y 3 escrituras");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes: 11 van a la base de datos, 14 son mensajes a si mismo, 1 va al servicio");
    N.push("  de catalogos y 8 son retornos. 8 llevan la guarda escrita entre corchetes, y aparecen 8 codigos HTTP");
    N.push("  mas el 23505, que es de Postgres y no un codigo de estado.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("LO QUE SE DIBUJA: EL ALTA MAS COMPLETA DEL PROYECTO");
    N.push("");
    N.push("  El DTO, L20-57, es el mas completo de los diez casos. Doce reglas: MinLength, MaxLength,");
    N.push("  IsInt, IsNumber con maxDecimalPlaces, Min, Max, IsArray, ArrayMinSize e IsInt each.");
    N.push("  CU05, que era el mejor hasta ahora, tenia cinco.");
    N.push("");
    N.push("  El precio se valida dos veces con dos metodos distintos: el pipe con maxDecimalPlaces, L38,");
    N.push("  que es una regla de formacion, y el servicio con Math.round(precio * 100) !== precio * 100,");
    N.push("  L143, que es aritmetica. El segundo es el que aguanta, porque main.ts L26 tiene");
    N.push("  enableImplicitConversion: false y el body llega tal cual.");
    N.push("");
    N.push("  Y el SKU se genera con un bucle de 6 intentos que captura el 23505 y reintenta,");
    N.push("  L234-266. Es el unico sitio del proyecto que hace eso.");
    N.push("");
    N.push("EL HALLAZGO 1: LA COLUMNA QUE NO EXISTE, Y EL LISTADO TAMBIEN FALLA");
    N.push("");
    N.push("  schema.sql L223-235, la tabla productos entera. Las 12 columnas son id_producto, codigo,");
    N.push("  nombre, descripcion, id_categoria, id_temporada, id_proveedor, precio_base, modelo_3d_url,");
    N.push("  estado y fecha_registro. NO HAY porcentaje_iva. La palabra no aparece en el esquema");
    N.push("  entero, y no hay ALTER TABLE.");
    N.push("");
    N.push("  Y el codigo la usa en cuatro sitios: el DTO L46, el listado L112, el alta L147 y el");
    N.push("  INSERT de L246. Cuatro sitios, cuatro fallos.");
    N.push("");
    N.push("  Y el mas grave no es el alta, es el LISTADO. L93 pide p.porcentaje_iva en el SELECT, asi");
    N.push("  que la pantalla de catalogo esta vacia siempre, no solo cuando se da de alta.");
    N.push("");
    N.push("  El catch de L260-266 solo captura el 23505 del duplicado, asi que el 42703 de la columna");
    N.push("  inexistente pasa de largo y sale un 500 sin traducir.");
    N.push("");
    N.push("  Y el precio final con IVA, L204, se calcula y se devuelve en la respuesta pero no se");
    N.push("  guarda en ninguna columna, porque no hay donde guardarlo.");
    N.push("");
    N.push("EL HALLAZGO 2: TRES COLUMNAS QUE EL DTO NO EXPONE");
    N.push("");
    N.push("  productos tiene 12 columnas y el DTO expone 8. Fuedan fuera tres, y las tres se quedan");
    N.push("  a NULL en silencio, sin validacion que lo impida y sin aviso:");
    N.push("");
    N.push("    id_proveedor   la que uniria el producto con su proveedor. Los proveedores de CU14 y");
    N.push("                 las ordenes de compra de CU15 cuelgan de ahi");
    N.push("    modelo_3d_url  el modelo 3D de la prenda, que es el dato de la tienda de ropa");
    N.push("    codigo         este si se genera solo, L240, y no lo manda el cliente");
    N.push("");
    N.push("  Un producto sin proveedor no se puede pedir, y no hay forma de saber desde la");
    N.push("  aplicacion que la columna esta vacia.");
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  La columna porcentaje_iva no existe y el codigo la usa en el DTO, en el listado, en");
    N.push("     el alta y en el INSERT. El alta da 500 y el listado tambien, con lo que la pantalla");
    N.push("     de catalogo esta siempre vacia.");
    N.push("  2  id_proveedor y modelo_3d_url existen en la tabla pero no en el DTO, asi que quedan");
    N.push("     a NULL sin avisar. Un producto sin proveedor no se puede pedir.");
    N.push("  3  Tres escrituras sin transaccion, y la segunda no es una fila sino N: el bucle");
    N.push("     anidado genera hasta 48 combinaciones con el seed. Si esa falla, queda un producto");
    N.push("     con 0 combinaciones que no se puede vender.");
    N.push("  4  Las tallas y los colores no se deduplican. Con colores repetidos, el bucle genera");
    N.push("     filas identicas y el UNIQUE(id_producto, id_talla, id_color) revienta con un 23505");
    N.push("     que el catch de L260 no captura, porque es el del segundo INSERT, no el del primero.");
    N.push("  5  El bucle del SKU es el mejor manejo de concurrencia del proyecto y tiene un fallo");
    N.push("     sneaky: this.codigoActual es una propiedad de la instancia, y el servicio es");
    N.push("     singleton, asi que dos altas simultaneas se pisan el codigo en la bitacora.");
    N.push("  6  El genero de los estados: categorias, tallas y colores usan 'Activo' y el filtro es");
    N.push("     'activo', y cuadra. Pero temporadas NO se filtra ni en el selector L82 ni en el");
    N.push("     alta L160, asi que se puede registrar en una temporada inactiva. Y productos.estado");
    N.push("     es 'Disponible', no 'Activo'.");
    N.push("  7  cargarPermisos NO USA EL GETTER: hace un JOIN directo a usuarios_roles y lee todos");
    N.push("     los roles. Primera vez en diez casos que se rompe con el defecto de roles[0]. Pero");
    N.push("     el destructuring [fila] se queda con la primera fila, asi que el defecto sigue");
    N.push("     ahi, solo que ahora elige Postgres en vez de TypeORM.");
    N.push("  8  Ademas: el DTO con doce validaciones, el precio validado dos veces con dos metodos");
    N.push("     distintos, y el unico bucle de reintento con captura del 23505 de todo el proyecto.");
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  Los hallazgos 1 y 2 son del mismo genero que el 1 de CU09, la columna que no existe, y");
    N.push("  los dos son el mismo error de fondo: el esquema y el codigo se escribieron por");
    N.push("  separado y nunca se cruzaron. En CU09 era departamento, y bloqueaba 11 tablas. Aqui es");
    N.push("  porcentaje_iva, y bloquea el modulo de catalogo entero, que es la base de CU11 a CU13.");
    N.push("");
    N.push("  El hallazgo 3 es la tercera vez que aparece la falta de transaccion, y la primera en");
    N.push("  que hay N filas en juego. CU06 y CU07 eran dos escrituras de una fila cada una.");
    N.push("");
    N.push("  Y el hallazgo 7 es la respuesta al defecto que se ha visto en CU01, CU04, CU05, CU06,");
    N.push("  CU07, CU08 y CU09. En los ocho, la autorizacion pasaba por el getter de roles[0]. Aqui");
    N.push("  no. Es la primera vez que el proyecto escribe el JOIN bien, y la primera vez que no");
    N.push("  hace falta el getter. Y por eso las dos cosas son una sola: el defecto de fondo es");
    N.push("  que el modelo admite N roles y casi nadie lo tiene en cuenta.");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU10 Secuencia", 0); } catch (e) { }
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
    T.push("CU10 - DIAGRAMA DE SECUENCIA - INFORME");
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
    msg = msg + "CU10 - Registrar Producto de Ropa en Catalogo" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "LA COLUMNA porcentaje_iva NO EXISTE. El codigo la" + SALTO;
    msg = msg + "usa en 4 sitios, y el listado tambien falla, asi" + SALTO;
    msg = msg + "que la pantalla de catalogo esta siempre vacia." + SALTO + SALTO;
    msg = msg + "Y el permiso aqui NO usa el getter. Primera vez en 10" + SALTO;
    msg = msg + "casos que se rompe con el defecto de roles[0]." + SALTO + SALTO;
    msg = msg + "Lo bueno: el DTO con 12 validaciones, el precio" + SALTO;
    msg = msg + "validado dos veces, y el unico bucle de reintento." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU10 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU10 Secuencia", 0); } catch (e3) { }
}
