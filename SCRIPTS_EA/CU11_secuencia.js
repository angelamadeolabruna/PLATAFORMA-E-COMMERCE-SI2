// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU11  Gestionar Tallas, Colores y Categorias
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/admin/AdminCatalogos.tsx             684 lineas
//     web/src/lib/api.ts                                 L1205-1250
//     api/src/main.ts                                    L22-43 ValidationPipe
//     api/src/modulos/seguridad/dependencias.ts          L15-65 JwtAuthGuard
//     api/src/modulos/catalogo/CTR_CatalogosAdmin.ts     209 lineas, 12 endpoints
//     api/src/modulos/catalogo/SRV_CatalogosService.ts  634 lineas
//     api/src/modulos/seguridad/SRV_BitacoraService.ts  L14-39
//     BASE DE DATOS/schema.sql                          L165-184, y las
//                                                        columnas que el
//                                                        codigo si usa
//
//   Cada mensaje lleva la linea del fichero de la que sale.
//
// QUE HACE ESTE CASO, Y POR QUE ES EL MAS LARGO DE LOS ONCE
//   Es el caso mas grande del proyecto por codigo: 12 endpoints, 3
//   tablas, 9 operaciones de servicio y 634 lineas en un solo fichero.
//   Y es el unico que tiene las 12 operaciones con la MISMA estructura,
//   porque estan escritas como copias la una de la otra.
//
//   Y aqui estan las dos columnas que no existen, que es lo mismo que
//   CU10 pero con dos en vez de una:
//
//     schema.sql L165-L169, tallas, la tabla entera:
//         id_talla, nombre, estado, orden
//     Y el codigo usa talla_europea.   L165, L170, L187, L227, L242
//
//     schema.sql L179-L184, categorias, la tabla entera:
//         id_categoria, nombre, descripcion, estado
//     Y el codigo usa porcentaje_iva_default.   L460, L467, L497, L541
//
//   O sea que de las 9 operaciones, 4 fallan con 500 y 5 funcionan.
//   Las que fallan son las 4 de tallas y las 2 de categorias, de leer,
//   crear y modificar. Los colores, los 3, funcionan enteros.
//
//   Y despues esta el hallazgo que hace que las 3 comprobaciones de "en
//   uso" no protejan de nada, y es el mas sutil de los once.
//
//   45 mensajes. 10 lineas de vida. 14 van a la base de datos, 11 son
//   mensajes a si mismo, 2 van a los helpers privados y 8 son retornos.
//   7 guardas escritas entre corchetes y 7 codigos: 200, 201, 403, 404,
//   409 y 422. Y dos mas que no son HTTP: el 42703, que es la columna
//   inexistente, y el 22001, que es el nombre que no cabe.
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
var TOTAL_MSG = 45;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU11 Secuencia Tallas Colores Categorias";
var DIAG_NOMBRE = "CU11 Gestionar Tallas Colores y Categorias";
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
    ["U", "ACTOR_Administrador", "Actor", "Lifeline", "Administrador", "quien gestiona", "Actor, no clase: es quien pulsa", "no es codigo, es la persona"],
    ["F", "AdminCatalogos.tsx", "Object", "Lifeline", "Catalogos", "tres pestanas", "Boundary", "web/src/pages/admin/AdminCatalogos.tsx, 684 lineas"],
    ["H", "api.ts", "Object", "Lifeline", "api", "cliente HTTP", "Boundary", "web/src/lib/api.ts, L1205-1250, seis metodos"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["P", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "cuatro DTO", "Control", "api/src/main.ts, L22-43, es global"],
    ["C", "CTR_CatalogosAdmin", "Object", "Lifeline", "CatalogosAdminController", "doce endpoints", "Control", "api/src/modulos/catalogo/CTR_CatalogosAdmin.ts, 209 lineas"],
    ["S", "SRV_CatalogosService", "Object", "Lifeline", "CatalogosService", "634 lineas", "Control", "api/src/modulos/catalogo/SRV_CatalogosService.ts, 634 lineas"],
    ["H2", "5 helpers privados", "Object", "Lifeline", "Helpers", "los que no son endpoint", "Control", "api/src/modulos/catalogo/SRV_CatalogosService.ts, L88-158"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar()", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "3 tablas y 2 columnas de mas", "Entity", "schema.sql: tallas L165-169, colores L172-177, categorias L179-184"]
];

// Los 44 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [
    [1, "U", "F", "1. abre /admin/catalogos   AdminCatalogos.tsx, 684 lineas, con tres pestanas: Tallas, Colores y Categorias   L344", "S"],
    [2, "F", "F", "2. el useEffect de L371-373 pide las tres listas a la vez, con Promise.all: api.listarTallas(), listarColores() y listarCategorias()", "S"],
    [3, "F", "H", "3. tres GET: /admin/catalogos/tallas, /colores y /categorias   api.ts L1205-1220", "S"],
    [4, "H", "G", "4. cada uno con Authorization Bearer y credentials:'include'", "S"],
    [5, "G", "D", "5. SELECT usuarios WHERE id_usuario = :sub   L44.   Una consulta por peticion, y son tres peticiones", "S"],
    [6, "G", "G", "6. [estado != 'activo'] 401 'Tu cuenta esta deshabilitada.'   L49-51", "S"],
    [7, "C", "S", "7. listarTallas, listarColores y listarCategorias   L93, L133 y L173.   Las 3 exigen permiso antes de nada", "S"],
    [8, "S", "D", "8. SELECT r.permisos_json FROM usuarios JOIN usuarios_roles JOIN roles WHERE u.id_usuario = $1   L70-77.   SIN getter, otra vez", "S"],
    [9, "S", "S", "9. [sin '*' ni 'gestionar_tallas_colores'] 403 'No tienes permiso para gestionar tallas, colores y categorias.'   L83-85", "S"],
    [10, "S", "D", "10. SELECT id_talla, nombre, talla_europea, orden, estado FROM tallas ORDER BY orden ASC   L165", "S"],
    [11, "D", "D", "11. [error 42703] la columna talla_europea no esta en la tabla tallas.   schema.sql L165-169 tiene 4 columnas y esa no es una", "S"],
    [12, "S", "D", "12. SELECT id_color, nombre, codigo_hex, estado FROM colores ORDER BY nombre   L316.   Esta si funciona: las 4 columnas existen", "S"],
    [13, "S", "D", "13. SELECT id_categoria, nombre, descripcion, porcentaje_iva_default, estado FROM categorias   L460-461.   Y la 3a columna tampoco existe", "S"],
    [14, "F", "F", "14. la pestana de tallas y la de categorias se quedan vacias.   La de colores, no.   Y no hay ningun aviso: solo faltan filas   L371-373", "S"],
    [15, "F", "F", "15. el admin abre el modal de nueva talla   L106-115.   Los tres modales son el mismo componente con una bandera de pestana", "S"],
    [16, "F", "H", "16. POST /admin/catalogos/colores   porque es el unico alta que funciona.   Para tallas seria POST /tallas   L97-105", "S"],
    [17, "H", "G", "17. POST con { nombre, codigo_hex }", "S"],
    [18, "G", "P", "18. el guard no toca el cuerpo.   El pipe si: ColorRequest, CTR_CatalogosAdmin L47-58", "S"],
    [19, "P", "C", "19. ColorRequest: @IsString, @IsNotEmpty, @MinLength(3) y @MaxLength(60) en el nombre, y @Matches(/^#[0-9A-Fa-f]{6}$/) en el hex   L47-58", "S"],
    [20, "P", "P", "20. [hex que no es #RRGGBB] 422 'El codigo de color debe tener formato #RRGGBB.'   main.ts L27-41", "S"],
    [21, "C", "S", "21. crearColor( currentUser, body, request )   L144", "S"],
    [22, "S", "D", "22. SELECT r.permisos_json otra vez, L70-77.   El permiso se comprueba 9 veces en 634 lineas, y aqui es la segunda", "S"],
    [23, "S", "S", "23. validarNombre, L88-97: trim, MinLength(3) y MaxLength(60) en el servidor.   Y validarHex, L326-331, repite el regex del pipe", "S"],
    [24, "S", "D", "24. asegurarUnico, L99-113: SELECT COUNT(*) FROM colores WHERE LOWER(nombre) = LOWER($1) y el id actual para no darme un 409 contra si mismo   L107", "S"],
    [25, "S", "S", "25. [ya existe] 409 'Ya existe una color con ese nombre.'   L111.   Con el genero equivocado", "S"],
    [26, "S", "D", "26. INSERT INTO colores (nombre, codigo_hex, estado) VALUES ($1, $2, 'Activo') RETURNING id_color, nombre, codigo_hex, estado   L341-342.   Escritura 1 de 2", "S"],
    [27, "S", "H2", "27. unaFila, L115-125, desempaqueta el RETURNING.   Y tiene dos ramas: si el resultado viene como array de arrays o como array de objetos   L121-123", "S"],
    [28, "H2", "B", "28. bitacora('INSERT', 'colores', 'Color creado: ...', usuario, request, id, null, { nombre, codigo_hex })   L357-366 y L138-158", "S"],
    [29, "B", "D", "29. INSERT INTO bitacora_auditoria con new_data   L27-38.   La 2 de 2.   Sin transaccion con la 1", "A"],
    [30, "S", "C", "30. el ItemColor recien creado, con los 4 campos   L368", "A"],
    [31, "C", "H", "31. el JSON con la fila creada   api.ts L1230-1238", "A"],
    [32, "H", "F", "32. setColores y Toast de exito   L410 y L420-424", "A"],
    [0, "F", "U", "0. Toast: Color creado correctamente.   Es la unica persona que participa dos veces en el diagrama, al principio y al final   L420-424", "A"],
    [33, "F", "F", "33. el admin intentareyNullable: el caso esta vacio en 2 de las 3 pestanas y eso no se explica en ningun sitio   L371-373 y L610", "S"],
    [34, "F", "H", "34. PATCH /admin/catalogos/colores/:id con { estado: 'Inactivo' }   api.ts L1239-1246", "S"],
    [35, "C", "C", "35. y aqui hay un return temprano: si el estado no es 'inactivo', el controlador responde { detail: 'El color no tiene cambios.' } SIN LLEGAR AL SERVICIO   L164-166.   Sin permiso y sin bitacora", "S"],
    [36, "C", "S", "36. inhabilitarColor( currentUser, id, request )   L167.   El estado no viaja: el servicio pone 'Inactivo' fijo, L441", "S"],
    [37, "S", "D", "37. SELECT id_color, nombre, estado FROM colores WHERE id_color = $1   L428.   [no existe] 404   L433-435.   [ya esta inactivo] 409   L434-436", "S"],
    [38, "S", "H2", "38. enUsoPorProductos, L127-136: SELECT COUNT(DISTINCT p.id_producto) FROM producto_talla_color JOIN productos WHERE ptc.id_color = $1 AND LOWER(p.estado) = 'activo'", "S"],
    [39, "H2", "D", "39. y aqui esta el fallo: productos.estado es 'Disponible', schema.sql L233, y solo CU10 escribe 'Activo', SRV_ProductosService L246.   Con lo que el filtro de L132 depende de como se creo cada producto", "S"],
    [40, "S", "D", "40. UPDATE colores SET estado = 'Inactivo' WHERE id_color = $1   L441.   Sin AND de estado, al reves que CU06 y CU07", "S"],
    [41, "S", "B", "41. bitacora('UPDATE', 'colores', 'Color inhabilitado: ...', ..., { nombre, estado: el viejo }, { nombre, estado: 'Inactivo' })   L442-451", "S"],
    [42, "B", "D", "42. INSERT INTO bitacora_auditoria con old_data y new_data, los dos con valores reales leidos de la fila   L27-38", "A"],
    [43, "S", "C", "43. { detail: 'Color inhabilitado correctamente.' }   L452", "A"],
    [44, "C", "F", "44. setColores, Toast de exito y recarga de las tres listas   L438-441", "A"]
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. Dos columnas que no existen, y 4 de las 9 operaciones dead", [
        "Es el mismo error de fondo que CU10 y CU09, y aqui son dos",
        "columnas en dos tablas distintas.",
        "",
        "LO QUE DICE EL ESQUEMA. Las dos tablas enteras:",
        "",
        "  L165-L169  CREATE TABLE tallas (",
        "                id_talla  SERIAL PRIMARY KEY,",
        "                nombre    VARCHAR(10) UNIQUE NOT NULL,",
        "                estado    VARCHAR(20) DEFAULT 'Activo',",
        "                orden     INTEGER",
        "            );",
        "",
        "  L179-L184  CREATE TABLE categorias (",
        "                id_categoria  SERIAL PRIMARY KEY,",
        "                nombre        VARCHAR(80) UNIQUE NOT NULL,",
        "                descripcion   TEXT,",
        "                estado        VARCHAR(20) DEFAULT 'Activo'",
        "            );",
        "",
        "Y LO QUE USA EL CODIGO:",
        "  talla_europea           L165, L170, L187, L227, L242, L254, L269",
        "  porcentaje_iva_default  L460, L467, L497, L541, L571, L585",
        "",
        "LAS DOS PALABRAS APARECEN 0 VECES en el esquema entero, y no",
        "hay ni un ALTER TABLE.",
        "",
        "LO QUE ROMPE, operacion por operacion. Y aqui hay una cosa que",
        "no habia pasado en CU09 ni en CU10: el fallo es SELECT DEL",
        "LISTADO, no solo del alta.",
        "",
        "  TALLAS, las 3 de las 3, fallan:",
        "    L165  el listado pide talla_europea en el SELECT.   42703",
        "    L187  el INSERT la nombra.   42703",
        "    L227  el findOneBy del alta la pide.   42703",
        "    L242  el UPDATE la nombra.   42703",
        "",
        "  CATEGORIAS, las 3, fallan tambien:",
        "    L460  el listado pide porcentaje_iva_default.   42703",
        "    L497  el INSERT la nombra.   42703",
        "    L557  el UPDATE la nombra.   42703",
        "",
        "  COLORES, las 3, funcionan. Porque colores tiene 4 columnas y",
        "  el codigo usa las 4, ni una mas ni una menos.",
        "",
        "O sea que 6 de las 9 operaciones de escritura de este caso dan",
        "500, y ademas los 3 listados: el de tallas y el de categorias",
        "fallan, y el de colores no. La pantalla carga las tres listas",
        "en el mismo useEffect, L371-373, asi que 2 de 3 fallan y la",
        "pestana de tallas y la de categorias estan siempre vacias.",
        "",
        "Y el 42703 no lo traduce nadie: los throw de L193 y L247 son de",
        "una fila vacia, no de una excepcion de Postgres."
    ]],
    ["2. El nombre de la talla es VARCHAR(10) y el DTO permite 60", [
        "Un fallo que no es de columna inexistente sino al reves: el",
        "codigo es mas permisivo que la base, y el que se rompe es el",
        "propio usuario.",
        "",
        "EN EL ESQUEMA, L167:",
        "  nombre VARCHAR(10) UNIQUE NOT NULL",
        "",
        "EN EL DTO, CTR_CatalogosAdmin L34-45:",
        "  @MinLength(3, 'El nombre debe tener al menos 3 caracteres.')",
        "  @MaxLength(60, 'El nombre no puede superar 60 caracteres.')",
        "",
        "Y EN EL SERVICIO, validarNombre L88-97, repite los mismos 60:",
        "  if (limpio.length > 60) throw 422",
        "",
        "O sea que el camino feliz acepta un nombre de hasta 60",
        "caracteres, y tallas.nombre solo admite 10. El nombre 'Pantalon",
        "de mezclilla' pasa el DTO, pasa el servicio, y revienta en el",
        "INSERT de L187 con un 22001 value too long.",
        "",
        "Y ese error tampoco lo traduce nadie, asi que sale un 500.",
        "",
        "Lo que confirma que es un descuido y no una decision: el resto",
        "de las tres tablas si usa el 60, y coincide con su columna.",
        "  categorias.nombre  VARCHAR(80)   DTO MaxLength(60)   cabe",
        "  colores.nombre     VARCHAR(50)   DTO MaxLength(60)   cabe",
        "  tallas.nombre      VARCHAR(10)   DTO MaxLength(60)   NO CABE",
        "",
        "Y el caso de las tallas es el que mas duele, porque una talla",
        "de ropa corta: XS, S, M, L, XL, XXL, 3XL, 4XL. Con 10",
        "caracteres alcanza de sobra. El 60 es para tallas de marca, no",
        "para el catalogo de una tienda."
    ]],
    ["3. Las comprobaciones de en uso miran un estado que no es el del default", [
        "Este es el hallazgo mas sutil de los once, y es el que mas",
        "importa, porque son las tres unicas protecciones de este",
        "modulo y ninguna protege.",
        "",
        "LO QUE HACE LA COMPROBACION, enUsoPorProductos L127-136:",
        "",
        "  SELECT COUNT(DISTINCT p.id_producto)::int AS n",
        "  FROM producto_talla_color ptc",
        "  JOIN productos p ON p.id_producto = ptc.id_producto",
        "  WHERE ptc.id_color = $1 AND LOWER(p.estado) = 'activo'",
        "",
        "Y la de categorias, L613-616, escrita a mano:",
        "",
        "  SELECT COUNT(*)::int AS n FROM productos",
        "  WHERE id_categoria = $1 AND LOWER(estado) = 'activo'",
        "",
        "LO QUE DICE EL ESQUEMA, L233:",
        "  estado VARCHAR(20) DEFAULT 'Disponible'",
        "",
        "O sea que el DEFAULT es 'Disponible', y el filtro busca 'activo'.",
        "",
        "LO QUE ESCRIBE EL PROYECTO EN productos.estado, y aqui esta el",
        "matiz que hace que el fallo sea parcial y no total:",
        "  SRV_ProductosService L246   INSERT INTO productos ... 'Activo'",
        "  CU10, o sea, el alta de la aplicacion escribe 'Activo'",
        "",
        "Con lo cual:",
        "  - un producto creado por la aplicacion   estado = 'Activo'",
        "    La comprobacion lo encuentra.   Y la proteccion funciona.",
        "  - un producto con el default, o sea insertado a mano, o",
        "    importado, o de una carga inicial   estado = 'Disponible'",
        "    La comprobacion NO lo encuentra.   Y la proteccion no",
        "    protege.",
        "",
        "PERO CU10, el caso anterior, tiene un 42703 en su INSERT. O sea",
        "que el alta de productos esta rota. Entonces, en la practica,",
        "NO HAY NINGUN PRODUCTO con estado 'Activo', porque la unica",
        "via para crearlos falla antes de llegar a esa columna.",
        "",
        "Consecuencia: se puede quitar una talla o un color que esten en uso,",
        "porque el COUNT da 0 siempre. Y el mensaje de L294 y L438, que",
        "dice 'existen productos activos con esta talla', es",
        "exactamente la comprobacion que no funciona.",
        "",
        "Y el remedy es una linea: LOWER(p.estado) IN ('activo',",
        "'disponible'). O mejor, y mas honesto: un CHECK en el esquema,",
        "para que no pueda haber un estado mas."
    ]],
    ["4. El genero de los estados y una palabra mal escrita", [
        "Tres detalles del mismo tipo, que juntos cuentan una historia.",
        "",
        "1. L438, el mensaje de conflicto:",
        "     'No se puede inhabilitar: existen productos activos con esta",
        "      color.'",
        "   'esta color', en vez de 'este color'. El genero del sustantivo",
        "   se ha fijado en el mensaje equivocado. Y el mismo error en el",
        "   L294 de tallas, que si dice 'esta talla' y esa si es correcto.",
        "   O sea que el patron se copio del sitio bueno al malo.",
        "",
        "2. El return temprano de los 3 PATCH, en el CONTROLADOR:",
        "     if (String(body.estado).toLowerCase() !== 'inactivo') {",
        "       return { detail: 'La talla no tiene cambios.' };",
        "     }",
        "   L124-126 de tallas, L164-166 de colores, L204-206 de categorias.",
        "   O sea que un PATCH con estado 'activo' responde 200 sin",
        "   comprobar el permiso, sin ir al servicio y sin escribir en la",
        "   bitacora. No es un agujero grave, pero rompe la regla que el",
        "   propio caso cumple en las otras 9 operaciones: el permiso se",
        "   comprueba 9 veces, y estas 3 se lo saltan.",
        "",
        "3. Y el estado de productos, que ya se vio en CU10 y aqui es",
        "   la causa del hallazgo 3:",
        "     productos.estado     'Disponible'",
        "     categorias.estado    'Activo'",
        "     tallas.estado        'Activo'",
        "     colores.estado       'Activo'",
        "     ciudades.estado      'Activa'",
        "     sucursales.estado    'Activa'",
        "     usuarios.estado      'Pendiente', 'Activo', 'Inactivo', 'Bloqueado'",
        "",
        "   Siete tablas, cuatro generos distintos y un estado que no es",
        "   ni activo ni inactivo. Y en el proyecto hay 16 sitios con",
        "   LOWER(estado) = 'activa' y muchos con = 'activo', y no hay",
        "   ningun enum ni ningun CHECK en el esquema que lo ate."
    ]],
    ["5. El DTO de tallas no coincide con la tabla en ninguna de las dos columnas", [
        "Recapitulacion de los numeros de las tres tablas, para que se",
        "vea el despiste de un vistazo.",
        "",
        "  TABLA          COLUMNA     EN EL ESQUEMA   EN EL DTO     RESULTADO",
        "  tallas         nombre      VARCHAR(10)    MaxLength(60)  NO CABE",
        "  tallas         estado      VARCHAR(20)    no se envia    lo pone el",
        "                                                            servicio",
        "  tallas         orden       INTEGER        no se envia    lo calcula",
        "                                                            el serv.",
        "  tallas         talla_europ NO EXISTE      MaxLength(10)  42703",
        "  colores        nombre      VARCHAR(50)    MaxLength(60)  cabe",
        "  colores        codigo_hex  VARCHAR(7)     @Matches #RRGGBB  cabe",
        "  categorias     nombre      VARCHAR(80)    MaxLength(60)  cabe",
        "  categorias     descripcion TEXT           MaxLength(500) cabe",
        "  categorias     pct_iva_def NO EXISTE     Min(0) Max(100) 42703",
        "",
        "O sea que de 8 columnas, 2 no existen, 1 no cabe, 2 las pone el",
        "servicio y no el cliente, y las otras 3 cuadran.",
        "",
        "LO QUE ESTA BIEN, y conviene decirlo porque el resto del DTO",
        "esta bien:",
        "",
        "  - @Matches(/^#[0-9A-Fa-f]{6}$/), L56, para el codigo de color.",
        "    Eso es un validador de verdad, de los 3 que hay en el",
        "    proyecto. Un patron exacto sobre un VARCHAR(7) que ademas",
        "    tiene UNIQUE en el esquema, L175.",
        "",
        "  - Y el servicio lo repite, validarHex L326-331. O sea que el",
        "    regex se comprueba dos veces, en el pipe y en el servidor,",
        "    que es el patron que CU10 aplica al precio y CU09 a los",
        "    nombres. Es el unico sitio donde ese patron esta en las tres",
        "    capas.",
        "",
        "  - Y las tres tablas tienen nombre UNIQUE en el esquema, L167,",
        "    L174 y L181. Eso si es un buen diseño: el nombre es la",
        "    clave natural de las tres, y el indice de Postgres es la",
        "    ultima red. CU09 solo lo tenia en una de las dos."
    ]],
    ["6. asegurarUnico y enUsoPorProducts: un helper con nombre injectado", [
        "Dos helpers que hacen bien su trabajo, y uno con una cosa que",
        "no se puede pasar por alto.",
        "",
        "asegurarUnico, L99-113, es el mejor control de duplicados del",
        "proyecto, y hay que compararlo con los otros:",
        "",
        "  CU05 L213  if (TODOS_PERMISOS.some((p) => nombre === p))",
        "  CU09 L112  SELECT ... WHERE LOWER(c.nombre) = :nombre",
        "  CU10 L131  SELECT COUNT(*) FROM productos WHERE LOWER(nombre)",
        "                         = LOWER($1)",
        "",
        "Y aqui una sola consulta parametrizada, L106-109:",
        "",
        "  SELECT COUNT(*)::int AS n FROM ${tabla}",
        "  WHERE LOWER(nombre) = LOWER($1)",
        "    AND ($2::int IS NULL OR ${idColumna} = $2)",
        "",
        "O sea que resuelve tres cosas a la vez, con un parametro que es",
        "null en el alta y el id en la modificacion. Con eso una misma",
        "talla no se da 409 contra si misma, que es exactamente lo que",
        "hacia CU09 a mano en L160-169 con dos consultas. Y el mensaje",
        "sale bien armado, L111, con la etiqueta que le pasa el",
        "llamante: 'talla', 'color' o 'categoría', con la tilde puesta.",
        "",
        "LO QUE NO SE PUEDE PASAR POR ALTO: el nombre de la tabla y el",
        "de la columna van interpolados, ${tabla} y ${idColumna}, L107.",
        "Vienen de literales del propio codigo, nunca del body, asi que",
        "NO es una inyeccion. Pero es SQL dinamico, y eso significa que",
        "una consulta que se lee no se puede indexar ni usar el",
        "preparador de Postgres. Es una decision razonable, y aun asi",
        "merece un comentario en el codigo diciendo que los dos",
        "parametros son internos, porque dentro de seis meses alguien lo",
        "cambia por request.body.tabla y no hay nada que lo impida.",
        "",
        "Y enUsoPorProductos, L127-136, tiene el problema de que",
        "interpola ${idColumna} en el WHERE, L132, por el mismo motivo,",
        "ademas de ser el helper con el bug del hallazgo 3. Se llama con",
        "'id_talla' en L293 y con 'id_color' en L437. O sea que solo hay",
        "dos llamadas, y podria haber sido un parametro mas sin problema."
    ]],
    ["7. Lo que si esta bien: el permiso sin getter, y la estructura de copia", [
        "Dos cosas, y la primera es la que rompe el defecto de CU01 a CU09.",
        "",
        "1. cargarPermisos, L69-79, hace un JOIN directo:",
        "",
        "     SELECT r.permisos_json",
        "     FROM usuarios u",
        "     JOIN usuarios_roles ur ON ur.id_usuario = u.id_usuario",
        "     JOIN roles r ON r.id_rol = ur.id_rol",
        "     WHERE u.id_usuario = $1",
        "",
        "   Sin getter, sin roles[0], sin leftJoinAndSelect. Es la",
        "   segunda vez en once casos que la autorizacion no pasa por el",
        "   getter, y las dos estan en el modulo de catalogo: CU10 L50 y",
        "   aqui L69. El defecto de fondo, como en CU10, sigue ahi por el",
        "   destructuring, pero el resto del proyecto ya no lo arrastra.",
        "",
        "2. Y el permiso es 'gestionar_tallas_colores', L83, que es uno",
        "   de los 21 del catalogo de CU05. Un solo permiso para las tres",
        "   tablas. Es una decision discutible: quien puede cambiar una",
        "   talla puede cambiar una categoria, y quien puede tocar el",
        "   catalogo no puede tocar los productos, que es el caso de CU10",
        "   con 'gestionar_productos'. O sea que el modulo esta partido",
        "   en dos permisos, y por el seed de CU05, de los 16 que siembra",
        "   el codigo entiende 2, y ninguno de los dos es este. Este",
        "   caso, como CU09, solo es accesible con el asterisco.",
        "",
        "3. LA ESTRUCTURA DE LAS 9 OPERACIONES, que es lo mejor que",
        "   tiene el fichero y lo que hace que 634 lineas no sean 634",
        "   lineas de ruido. Las 9 tienen la misma forma:",
        "",
        "     L163  await this.exigirPermiso(usuario)",
        "     L178  validar el nombre",
        "     validarHex o validarIva",
        "     L183  await this.asegurarUnico(...)",
        "     L186  INSERT o UPDATE con RETURNING",
        "     L197  mapear la fila a Item",
        "     L205  await this.bitacora(...)",
        "     L216  return",
        "",
        "   Con la misma variable, la misma forma de bitacora y el mismo",
        "   nombre de helper. Se puede leer las 9 seguidas y se ve que",
        "   son la misma operacion con otros nombres. Es la unica forma",
        "   que conozco de que 634 lineas no se vuelvan inmanejables.",
        "",
        "   Y el orden es el correcto en las 9: permiso, validacion,",
        "   duplicados, y solo despues la escritura. La comprobacion de",
        "   duplicados va DESPUES de validar el nombre, y no antes, para",
        "   que la consulta de L106 no se haga con un nombre que todavia",
        "   no es valido.",
        "",
        "   Y el old_data de la bitacora, L267-270 y L414 y L582-586,",
        "   sale de la fila leida ANTES de escribir, con los valores",
        "   reales. Igual que CU09, y al contrario que CU06 y CU07."
    ]],
    ["8. Tres detalles pequenos que tambien son fallos", [
        "Ninguno de los tres es grave, pero los tres son codigo que no",
        "hace lo que parece.",
        "",
        "1. void vieja, en actualizarTalla L258.",
        "",
        "   La variable vieja, de L226, se lee, se usa en la bitacora de",
        "   L268-269, y luego se tira con un void. O sea que el",
        "   compilador se quejaria de que no se usa, y alguien puso un",
        "   void para callarlo. Pero no hace falta: L268-269 la usan. O",
        "   sea que el void sobra Y hay dos consultas de la misma fila:",
        "   la de L226, que trae 5 columnas, y la del UPDATE de L240, que",
        "   trae las mismas 5 con el RETURNING. Se podia haber usado el",
        "   RETURNING para las dos cosas, como hacen los colores.",
        "",
        "2. mensaje_bitacora: undefined, en crearTalla L213.",
        "",
        "     { ...nueva, mensaje_bitacora: undefined }",
        "",
        "   O sea que se extiende el Item con una propiedad que no",
        "   existe en el interface, y se pone a undefined. En JSON.stringify",
        "   una propiedad con valor undefined se OMITE, asi que el efecto",
        "   es nulo. O sea que la linea no hace nada, y ademas",
        "   ensucia el objeto que se va a devolver al cliente en L216 con",
        "   una propiedad fantasma. Se ve que el autor queria excluir",
        "   algo del registro, y se equivoco de nombre.",
        "",
        "3. El EstadoRequest, L79-83, solo comprueba que estado sea un",
        "   string no vacio. Y de los tres PATCH, uno lo usa:",
        "",
        "     L124  if (String(body.estado).toLowerCase() !== 'inactivo')",
        "",
        "   O sea que el unico uso del DTO es para RECHAZAR, nunca para",
        "   aceptar. El estado que acaba en la base de datos lo pone el",
        "   servicio, L297 y L441 y L621, con 'Inactivo' fijo y sin",
        "   mirar lo que vino. Es el mismo patron que el hallazgo 5 de",
        "   CU09, con L396: un endpoint que convierte cualquier cadena",
        "   y no admite ni una lista de valores. Y aqui, al menos, el",
        "   conversion es correcta y no hay riesgo."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU11."; } catch (e) { }
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
        try { o.Text = "CU11  Gestionar Tallas, Colores y Categorias"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 700) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseno de caso de uso, seccion 3.3.2.1.  10 lineas de vida, 45 mensajes, 8 hallazgos."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja. Este es el caso mas grande del proyecto: 12 endpoints, 3 tablas, 9 operaciones de servicio, 634 lineas. Y el unico donde las 12 operaciones tienen exactamente la misma estructura. De esas 9, 6 fallan con 500 porque el codigo usa dos columnas que el esquema no tiene, y los 3 colores funcionan enteros."; } catch (e) { }
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
    N.push("CU11  Gestionar Tallas, Colores y Categorias.  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Administrador    «actor»     quien abre /admin/catalogos");
    N.push("    AdminCatalogos.tsx      «boundary»  pages/admin/AdminCatalogos.tsx, 684 lineas, 3 pestanas");
    N.push("    api.ts                 «boundary»  lib/api.ts, L1205-1250, seis metodos");
    N.push("    JwtAuthGuard           «control»   dependencias.ts, L15-65");
    N.push("    ValidationPipe         «control»   main.ts, L22-43, cuatro DTO");
    N.push("    CTR_CatalogosAdmin     «control»   12 endpoints, 209 lineas");
    N.push("    SRV_CatalogosService   «control»   634 lineas, 9 operaciones, 9 exigirPermiso");
    N.push("    5 helpers privados     «control»   L88-158: validarNombre, asegurarUnico, unaFila, enUsoPorProductos, bitacora");
    N.push("    SRV_BitacoraService    «control»   registrar(), la segunda escritura");
    N.push("    PostgreSQL             «entity»    tallas, colores, categorias, y 2 columnas de mas");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes: 14 van a la base de datos, 11 son mensajes a si mismo, 2 van a los");
    N.push("  helpers privados y 8 son retornos. 7 llevan la guarda escrita entre corchetes, y aparecen 6 codigos");
    N.push("  HTTP mas dos que no lo son: el 42703, que es la columna inexistente, y el 22001, que es el");
    N.push("  nombre de la talla, que no cabe en VARCHAR(10).");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("LO QUE SE DIBUJA: 9 OPERACIONES, Y SOLO 3 FUNCIONAN");
    N.push("");
    N.push("  COLORES, las 3, funcionan. Porque colores tiene 4 columnas y el codigo usa las 4.");
    N.push("");
    N.push("  TALLAS, las 3, fallan con 42703:");
    N.push("    mensaje 10  el listado pide talla_europea en el SELECT   L165");
    N.push("    mensaje 26  el INSERT la nombra, para el alta de un color, no de una talla   L341");
    N.push("    mensaje 37  el findOneBy del alta la pide   L227");
    N.push("    el UPDATE de la L242 tambien la nombra");
    N.push("");
    N.push("  CATEGORIAS, las 3, fallan con 42703, por porcentaje_iva_default:");
    N.push("    mensaje 13  el listado lo pide   L460-461");
    N.push("    el INSERT de la L497 lo nombra, y el UPDATE de la L557 tambien");
    N.push("");
    N.push("  Y el listado de la pantalla, L371-373, pide las tres listas en el mismo useEffect, asi que");
    N.push("  2 de 3 fallan y las pestanas de tallas y categorias estan siempre vacias.");
    N.push("");
    N.push("EL HALLAZGO 3: LAS TRES COMPROBACIONES DE EN USO NO PROTEGEN NADA");
    N.push("");
    N.push("  Es el hallazgo mas sutil de los once, porque las tres comprobaciones existen, estan");
    N.push("  escritas con la consulta correcta, y no funcionan. L127-136 y L613-616:");
    N.push("");
    N.push("    ... AND LOWER(p.estado) = 'activo'");
    N.push("");
    N.push("  Y productos.estado es DEFAULT 'Disponible', schema.sql L233. El default no es el que");
    N.push("  busca el filtro. Y como CU10 tiene un 42703 en su INSERT, el alta de productos esta rota,");
    N.push("  con lo cual NO HAY NINGUN producto con estado 'Activo' y el COUNT da 0 siempre.");
    N.push("");
    N.push("  El mensaje de L294 y L438, que dice 'existen productos activos con esta talla', es");
    N.push("  exactamente la comprobacion que no encuentra nada. Se puedeapolisar una talla en uso.");
    N.push("");
    N.push("  Y el arreglo es una linea: LOWER(p.estado) IN ('activo', 'disponible'). O mejor, un");
    N.push("  CHECK en el esquema, para que no pueda haber un estado mas.");
    N.push("");
    N.push("EL HALLAZGO 2: EL NOMBRE DE LA TALLA ES VARCHAR(10) Y EL DTO PERMITE 60");
    N.push("");
    N.push("  schema.sql L167   nombre VARCHAR(10) UNIQUE NOT NULL");
    N.push("  CTR_CatalogosAdmin L38   @MaxLength(60)");
    N.push("  validarNombre L93   if (limpio.length > 60) throw 422");
    N.push("");
    N.push("  El camino feliz acepta 60 caracteres y la columna admite 10. 'Pantalon de mezclilla'");
    N.push("  pasa el DTO, pasa el servicio, y revienta en el INSERT con un 22001, que tampoco lo");
    N.push("  traduce nadie. Y es el unico de los tres que no cuadra: categorias.nombre es");
    N.push("  VARCHAR(80) y colores.nombre es VARCHAR(50), y los dos caben de sobra en 60.");
    N.push("");
    N.push("  Y el caso de las tallas es el que mas duele, porque una talla de ropa es corta:");
    N.push("  XS, S, M, L, XL, XXL, 3XL, 4XL. Con 10 caracteres sobra. El 60 es para tallas de marca.");
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  Dos columnas que no existen: talla_europea en tallas y porcentaje_iva_default en");
    N.push("     categorias. 6 de las 9 operaciones dan 500, y los 2 de los 3 listados tambien.");
    N.push("     Los 3 colores funcionan enteros, porque colores si tiene las 4 columnas que se usan.");
    N.push("  2  tallas.nombre es VARCHAR(10) y el DTO y el servicio permiten 60. Un nombre de 20");
    N.push("     caracteres pasa las dos validaciones y revienta en el INSERT con un 22001.");
    N.push("  3  Las tres comprobaciones de en uso filtran por LOWER(estado) = 'activo' cuando el");
    N.push("     default es 'Disponible'. Y como el alta de productos esta rota, no hay ninguno con");
    N.push("     'Activo', asi que el COUNT da 0 siempre y las tres protecciones no protegen.");
    N.push("  4  El mensaje de L438 dice 'esta color' en vez de 'este color', copiado del 'esta talla'");
    N.push("     de L294, que si es correcto. Y los 3 PATCH hacen un return temprano sin comprobar");
    N.push("     el permiso, que es lo unico que rompen de las 9 operaciones.");
    N.push("  5  De 8 columnas: 2 no existen, 1 no cabe, 2 las pone el servicio y no el cliente, y");
    N.push("     las otras 3 cuadran. Y lo que esta bien: el @Matches del hex y las 3 tablas con");
    N.push("     nombre UNIQUE en el esquema.");
    N.push("  6  asegurarUnico L99-113 es el mejor control de duplicados del proyecto, con un solo");
    N.push("     parametro que es null en el alta y el id en la modificacion. Pero interpola el");
    N.push("     nombre de la tabla y de la columna, asi que es SQL dinamico.");
    N.push("  7  El permiso NO usa el getter, segunda vez en once casos, y las dos estan en el modulo");
    N.push("     de catalogo. Y las 9 operaciones tienen exactamente la misma estructura, con el");
    N.push("     mismo orden: permiso, validacion, duplicados, escritura, bitacora.");
    N.push("  8  Tres detalles pequenos: un void vieja que sobra porque la variable si se usa en la");
    N.push("     bitacora, un mensaje_bitacora: undefined que no hace nada y ademas ensucia el");
    N.push("     objeto que se devuelve, y un EstadoRequest que solo se usa para rechazar.");
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  Los hallazgos 1 y 2 son la tercera vez que aparecen las columnas que no existen, y ya se");
    N.push("  puede decir la cuenta: CU09 departamento, CU10 porcentaje_iva, CU11 talla_europea y");
    N.push("  porcentaje_iva_default. Cuatro columnas en tres casos, y en ningun caso hay un ALTER");
    N.push("  TABLE. El esquema y el codigo se escribieron por separado y nunca se cruzaron. Y el");
    N.push("  unico sitio donde se cruzaron es CU08, que es donde se leyeron los dos.");
    N.push("");
    N.push("  El hallazgo 3 continua el de CU10. Alli se vio que productos.estado es 'Disponible' y");
    N.push("  que CU10 escribe 'Activo'. Aqui se ve la consecuencia: las tres comprobaciones de");
    N.push("  este caso, que son las unicas protecciones del modulo de catalogo contra Losing una talla");
    N.push("  o un color que este en uso, no encuentran nada. Y no es un error de este caso, es un");
    N.push("  error de los dos juntos.");
    N.push("");
    N.push("  Y el hallazgo 7 es la segunda vez que el permiso no usa el getter. CU01, CU04, CU05,");
    N.push("  CU06, CU07, CU08 y CU09 lo usaban: CU10 y CU11 no. Los dos unicos casos sin getter son");
    N.push("  los dos del modulo de catalogo, que es el unico modulo con transaccion y con un");
    N.push("  bucle de reintento del 23505. O sea que el modulo mejor escrito es el que mas reciente");
    N.push("  se escribio.");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU11 Secuencia", 0); } catch (e) { }
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
    T.push("CU11 - DIAGRAMA DE SECUENCIA - INFORME");
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
    msg = msg + "CU11 - Gestionar Tallas, Colores y Categorias" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "EL CASO MAS GRANDE: 12 endpoints, 9 operaciones," + SALTO;
    msg = msg + "634 lineas. Y 6 de las 9 fallan con 500." + SALTO + SALTO;
    msg = msg + "DOS COLUMNAS QUE NO EXISTEN: talla_europea en tallas" + SALTO;
    msg = msg + "y porcentaje_iva_default en categorias. Los 3 colores" + SALTO;
    msg = msg + "funcionan enteros. Y las 3 comprobaciones de en uso no" + SALTO;
    msg = msg + "protegen, porque buscan 'activo' y el default es 'Disponible'." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU11 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU11 Secuencia", 0); } catch (e3) { }
}
