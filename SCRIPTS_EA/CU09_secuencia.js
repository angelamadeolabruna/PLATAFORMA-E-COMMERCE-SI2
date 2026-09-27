// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU09  Administrar Ciudades y Sucursales
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/admin/Sucursales.tsx               780 lineas
//     web/src/lib/api.ts                               L1156-1200
//     api/src/main.ts                                  L22-43 ValidationPipe
//     api/src/modulos/seguridad/dependencias.ts        L15-65 JwtAuthGuard
//     api/src/modulos/seguridad/CTR_Sucursales.ts      132 lineas, 8 endpoints
//     api/src/modulos/seguridad/SRV_SucursalesService.ts 467 lineas
//     api/src/modulos/seguridad/CE_Modelos.ts          L111-151
//     api/src/modulos/seguridad/SRV_BitacoraService.ts L14-39
//     BASE DE DATOS/schema.sql                         L51-66, y la ausencia
//                                                     de la columna que el
//                                                     codigo si usa
//
//   Cada mensaje lleva la linea del fichero de la que sale.
//
// QUE HACE ESTE CASO, Y POR QUE ES EL MAS GRAVE DE LOS NUEVE
//   Este caso no tiene un fallo. Tiene uno homogeneo: la tabla
//   ciudades NO TIENE LA COLUMNA departamento, y el codigo la usa en
//   todas partes.
//
//     schema.sql L51-L56     CREATE TABLE ciudades (
//                              id_ciudad, nombre, pais, estado
//                            )
//
//     CE_Modelos.ts L122     @Column({ name: 'departamento', ... })
//
//   La palabra departamento aparece 0 veces en las 900 lineas del
//   esquema. Y no hay ni un ALTER TABLE que la anada. O sea que la
//   entidad TypeORM declara una columna que la base de datos no tiene.
//
//   Y de ahi se sigue todo, en cadena:
//
//     1. Las 4 operaciones de ciudad generan SQL con departamento y
//        fallan con 500. Las cuatro. No es un caso raro, es el 100 por
//        ciento de las ciudades.
//     2. No hay ni una sola fila semilla de ciudades ni de sucursales:
//        cero INSERT en el seed.
//     3. crearSucursal L285-293 exige que la ciudad exista y este
//        Activa.
//     4. 11 tablas del esquema tienen FOREIGN KEY REFERENCES
//        sucursales(id_sucursal).
//
//   O sea que el sistema arranca sin ninguna sucursal, y no hay forma
//   de crear ni una: primero habria que crear una ciudad, y crear una
//   ciudad da 500. Este caso de uso bloquea 11 tablas.
//
//   44 mensajes. 10 lineas de vida. 13 van a la base de datos, 14 son
//   mensajes a si mismo, 1 va al modelo y 5 son retornos.
//   8 guardas escritas entre corchetes, 11 puntos donde el codigo lanza
//   una excepcion y 9 codigos: 200, 201, 400, 401, 403, 404, 409, 422 y
//   500. Y ese ultimo es el que se lleva las cuatro operaciones de ciudad.
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
var PAQ_NOMBRE = "CU09 Secuencia Ciudades y Sucursales";
var DIAG_NOMBRE = "CU09 Administrar Ciudades y Sucursales";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 105;

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
    ["U", "ACTOR_Administrador", "Actor", "Lifeline", "Administrador", "quien administra", "Actor, no clase: es quien pulsa", "no es codigo, es la persona"],
    ["F", "Sucursales.tsx", "Object", "Lifeline", "Sucursales", "dos pestanas", "Boundary", "web/src/pages/admin/Sucursales.tsx, 780 lineas"],
    ["H", "api.ts", "Object", "Lifeline", "api", "cliente HTTP", "Boundary", "web/src/lib/api.ts, L1156-1200, seis metodos"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["P", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "aqui si valida", "Control", "api/src/main.ts, L22-43, es global"],
    ["C", "CTR_Sucursales", "Object", "Lifeline", "SucursalesController", "ocho endpoints", "Control", "api/src/modulos/seguridad/CTR_Sucursales.ts, 132 lineas"],
    ["S", "SRV_SucursalesService", "Object", "Lifeline", "SucursalesService", "467 lineas", "Control", "api/src/modulos/seguridad/SRV_SucursalesService.ts, 467 lineas"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar()", "Control", "api/src/modulos/seguridad/SRV_SucursalesService.ts, L446-466, un metodo propio"],
    ["M", "CE_Modelos", "Object", "Lifeline", "Ciudad", "la columna que no existe", "Control", "api/src/modulos/seguridad/CE_Modelos.ts, L111-127 y L129-151"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "3 tablas y 11 FK", "Entity", "schema.sql: ciudades L51-56, sucursales L58-66, sucursal_horarios, y 11 FOREIGN KEY"]
];

// Los 42 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [
    [1, "U", "F", "1. abre /admin/sucursales   Sucursales.tsx, 780 lineas, con dos pestanas: Ciudades y Sucursales   L32-34", "S"],
    [2, "F", "F", "2. el useEffect de L38 carga las dos listas a la vez, con api.listarCiudades() y api.listarSucursales()", "S"],
    [3, "F", "H", "3. GET /api/v1/admin/ciudades   y en paralelo GET /api/v1/admin/sucursales   api.ts L1156", "S"],
    [4, "H", "G", "4. GET con Authorization Bearer y credentials:'include'", "S"],
    [5, "G", "D", "5. SELECT usuarios WHERE id_usuario = :sub   L44.   Una consulta por peticion, en el guard", "S"],
    [6, "G", "G", "6. [estado != 'activo'] 401 'Tu cuenta esta deshabilitada.'   L49-51", "S"],
    [7, "C", "S", "7. listarCiudades( currentUser )   CTR_Sucursales L65", "S"],
    [8, "S", "D", "8. SELECT usuarios LEFT JOIN usuarios_roles LEFT JOIN roles   L55-63, para el permiso", "S"],
    [9, "S", "S", "9. return conRol?.rol?.permisos_json   L63.   El getter de roles[0], por sexta vez en el proyecto", "S"],
    [10, "S", "S", "10. [sin '*' ni 'gestionar_sucursales'] 403 'No tienes permiso para gestionar sucursales.'   L70-75", "S"],
    [11, "S", "D", "11. SELECT c.id_ciudad, c.nombre, c.departamento, c.estado, y un COUNT de sucursales por ciudad   L80-85", "S"],
    [12, "D", "D", "12. [la columna c.departamento no existe] ERROR 42703: column 'departamento' does not exist.   schema.sql L51-56", "S"],
    [13, "F", "F", "13. la pestana de ciudades se queda vacia y la de sucursales tambien, porque su INNER depende de las ciudades.   Ningun error visible", "S"],
    [14, "F", "F", "14. el admin abre el modal de nueva ciudad.   L61-145, con un campo de Departamento obligatorio   L132-136", "S"],
    [15, "F", "H", "15. POST /api/v1/admin/ciudades   api.ts L1164", "S"],
    [16, "H", "G", "16. POST con { nombre, departamento }", "S"],
    [17, "G", "P", "17. el guard no toca el cuerpo.   El pipe si lo valida: aqui si hay DTO con decoradores   CTR_Sucursales L21-31", "S"],
    [18, "P", "C", "18. CrearCiudadRequest: @IsString, @IsNotEmpty y @MaxLength(80) en el nombre, y @MaxLength(60) en el departamento   L21-31", "S"],
    [19, "P", "P", "19. [falta el departamento, o pasa de 80 o de 60] 422 con los mensajes   main.ts L27-41", "S"],
    [20, "C", "S", "20. crearCiudad( currentUser, body, request )   L75", "S"],
    [21, "S", "M", "21. getRepository(Ciudad).create() arma el INSERT leyendo los metadatos de la entidad   L121-125.   Y L122 declara la columna departamento", "S"],
    [0, "M", "D", "0. INSERT INTO ciudades (nombre, departamento, estado) VALUES (...).   TypeORM lo genera desde la entidad, no desde la consulta", "S"],
    [0, "S", "D", "0. la escritura.   L126   Y sigue fallando, porque la entidad es la que metio la columna", "S"],
    [22, "D", "D", "22. [la columna no existe] ERROR 42703 otra vez, y un 500.   No hay ni un try que lo traduzca", "S"],
    [23, "S", "B", "23. bitacoraService.registrar( id, 'INSERT', 'ciudades', 'Ciudad creada: ...', request, id, null, {nombre, departamento, estado} )   L128-132, L456-465", "S"],
    [24, "B", "D", "24. INSERT INTO bitacora_auditoria.   L27-38.   Esta si llega, porque va detras", "A"],
    [25, "F", "U", "25. Toast de error con el 500.   O nada, si el manejador de errores no lo muestra   L145", "A"],
    [26, "F", "F", "26. el admin prueba a crear una sucursal.   El selector de ciudades esta vacio, asi que no puede", "S"],
    [27, "F", "H", "27. POST /api/v1/admin/sucursales con un id_ciudad   api.ts L1172", "S"],
    [28, "H", "G", "28. POST con { nombre, id_ciudad, direccion, telefono }", "S"],
    [29, "C", "S", "29. crearSucursal( currentUser, body, request )   L110", "S"],
    [30, "S", "D", "30. SELECT c.id_ciudad FROM ciudades WHERE id_ciudad = :id AND LOWER(c.estado) = 'activa'   L285-290.   Sin departamento, asi que esta si funciona", "S"],
    [31, "S", "S", "31. [no hay ninguna ciudad, porque no se pueden crear] 400 'La ciudad seleccionada no existe o esta inactiva.'   L291-293", "S"],
    [32, "S", "D", "32. SELECT usuarios LEFT JOIN usuarios_roles LEFT JOIN roles   L55-63.   La consulta del permiso, otra vez", "S"],
    [33, "S", "D", "33. y las otras 3 de ciudad: SELECT de la entidad, UPDATE ciudades SET nombre, departamento, y SELECT COUNT de sucursales   L145, L176, L210-215", "S"],
    [34, "D", "D", "34. las tres tambien fallan con 42703.   O sea que CIUDAD es un 500 en las 4 de sus 4 operaciones", "S"],
    [35, "F", "F", "35. la pantalla ofrece las 6 operaciones de sucursal y el alta funciona, porque no toca ciudades.   El alta de ciudad, no", "S"],
    [36, "F", "H", "36. GET /api/v1/admin/sucursales.   L98-101.   Con LEFT JOIN a ciudades, L253, asi que un id_ciudad nulo no lo rompe", "S"],
    [37, "C", "S", "37. listarSucursales( currentUser )   L100", "S"],
    [38, "S", "D", "38. SELECT s.id_sucursal, s.nombre, s.direccion, s.id_ciudad, s.telefono, s.estado, s.fecha_registro, y c.nombre AS nombre_ciudad   L249-255", "S"],
    [39, "S", "S", "39. nro_sucursales sale de un subquery COUNT por ciudad, L82.   Y el nombre de sucursal NO es UNIQUE, schema.sql L60", "S"],
    [40, "S", "C", "40. SucursalItem[] con 8 campos   L257-266", "A"],
    [41, "C", "H", "41. la lista de sucursales, vacia en una base recien creada   porque el seed tiene cero ciudades y cero sucursales", "A"],
    [42, "H", "F", "42. setSucursales   y las dos pestanas se pintan vacias, sin ningun mensaje que explique por que   L38", "A"]
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. La tabla ciudades no tiene la columna departamento, y el codigo la usa", [
        "Este es el hallazgo mas grave de los nueve casos, y no se ve",
        "leyendo este caso: se ve crossed con el esquema.",
        "",
        "LO QUE DICE EL ESQUEMA, L51-L56, integro:",
        "",
        "  CREATE TABLE ciudades (",
        "      id_ciudad SERIAL PRIMARY KEY,",
        "      nombre    VARCHAR(80) UNIQUE NOT NULL,",
        "      pais      VARCHAR(60) DEFAULT 'Bolivia',",
        "      estado    VARCHAR(20) DEFAULT 'Activa'",
        "  );",
        "",
        "LO QUE DICE EL CODIGO, CE_Modelos L122-123:",
        "",
        "  @Column({ name: 'departamento', type: 'varchar', length: 60,",
        "            nullable: true })",
        "  departamento: string | null;",
        "",
        "La palabra departamento aparece 0 veces en las lineas del",
        "esquema. Y no hay ni un ALTER TABLE que la anada. La entidad",
        "TypeORM declara una columna que la base de datos no tiene.",
        "",
        "Y no es que sobre: la columna que SI esta en el esquema, pais,",
        "no la usa nadie. Ni el DTO, ni el servicio, ni la pantalla. Se",
        "queda en 'Bolivia' por defecto y no se puede cambiar. O sea que",
        "el codigo pide una columna que no existe y ignora la que si.",
        "",
        "LO QUE ROMPE, operacion por operacion:",
        "",
        "  L122  el alta de la entidad. Todo INSERT de Ciudad falla",
        "  L145  findOneBy. Todo SELECT de Ciudad falla",
        "  L176  el UPDATE de modificarCiudad. Falla",
        "  L80-85  el SELECT crudo de listarCiudades, con c.departamento",
        "",
        "O sea que CIUDAD es un 500 en las 4 de sus 4 operaciones.",
        "Y la 4a, L80-85, lleva directamente el 42703 al usuario.",
        "",
        "El 4 de los 8 endpoints de CTR_Sucursales esta roto, y son",
        "exactamente los cuatro de ciudad."
    ]],
    ["2. Por eso no hay ninguna sucursal, y 11 tablas dependen de ellas", [
        "El hallazgo 1 no se queda en la cities. Se propaga.",
        "",
        "PASO 1. El seed, schema.sql L568 en adelante, siembra tallas,",
        "colores, roles y categorias. Ciudades y sucursales NO.",
        "Cero INSERT. Se comprobo.endpoint por endpoint: 0.",
        "",
        "PASO 2. En una base recien instalada no hay ninguna ciudad.",
        "",
        "PASO 3. crearSucursal, L285-293, exige que la ciudad exista y",
        "esté Activa:",
        "",
        "  .where('c.id_ciudad = :id', { id: dto.id_ciudad })",
        "  .andWhere(\"LOWER(c.estado) = 'activa'\")",
        "",
        "asi que sin ciudades no hay sucursales. Y como crear una ciudad",
        "da 500, no hay forma de salir de ahi desde la aplicacion.",
        "",
        "PASO 4. Y en el esquema hay 11 FOREIGN KEY a sucursales:",
        "",
        "  L70   usuarios_empleados.sucursal_id   ON DELETE CASCADE",
        "  L79   usuarios_empleados.sucursal_id",
        "  L280  L305  L316  L335  L348  L372  L388  L424  L462",
        "        inventario_stock, ventas, pagos, comprobantes,",
        "        reservas, movimientos_inventario, kardex, ...",
        "",
        "48 columnas del esquema se llaman id_sucursal. O sea que la",
        "red de tiendas, que es la estructura base del negocio, no se",
        "puede montar desde la aplicacion.",
        "",
        "Y hay una tercera tabla que no aparecia en ningun caso anterior:",
        "sucursal_horarios, L68 en adelante. Los horarios de cada",
        "tienda. Que tampoco se puede crear."
    ]],
    ["3. El nombre de la sucursal no es UNIQUE y no se comprueba", [
        "Las ciudades uniques; las sucursales, no. Y la comprobacion que",
        "tiene ciudades, las sucursales no la tienen.",
        "",
        "EN EL ESQUEMA:",
        "  ciudades.nombre    L53   VARCHAR(80) UNIQUE NOT NULL",
        "  sucursales.nombre  L60   VARCHAR(100) NOT NULL.   Sin UNIQUE",
        "",
        "EN LA ENTIDAD:",
        "  L116  @Column({ name: 'nombre', ..., unique: true })   Ciudad",
        "  L134  @Column({ name: 'nombre', type: 'varchar', length: 100 })",
        "       Sucursal.   Sin unique",
        "",
        "Y EN EL SERVICIO, la asimetria es total:",
        "",
        "  crearCiudad, L112-119, hace la comprobacion completa:",
        "    .where('LOWER(c.nombre) = :nombre')",
        "    si existe, 409 'La ciudad ya esta registrada.'",
        "  y modificarCiudad, L160-169, la repite pero anadiendo",
        "    .andWhere('existe.id_ciudad !== idCiudad') para no darme",
        "    un 409 contra si misma. Eso esta bien hecho.",
        "",
        "  crearSucursal, L269-322, NO TIENE NINGUNA. Ni una consulta",
        "  de duplicados. Ni un 409. Se puede crear limitless.",
        "",
        "Y el resultado es visible: L254 ordena por nombre, asi que dos",
        "sucursales con el mismo nombre salen juntas, en la misma tabla,",
        "con el mismo color y sin ningun otro campo que las",
        "distinga. La ciudad se ve, que es un nombre; la direccion se",
        "ve, que es larga; la sucursal repetida no se ve.",
        "",
        "Y hay una consecuencia mas: el indice que hace el proyecto para",
        "las ciudades, el UNIQUE de Postgres, no lo hay para las",
        "sucursales, y en el catalogo de permisos de CU05 hay un solo",
        "gestionar_sucursales para las dos tablas. O sea que el mismo",
        "permiso, con el mismo boton, cubre una tabla protegida por",
        "indice y otra que no lo tiene."
    ]],
    ["4. Cerrar una sucursal mira el inventario y solo el inventario", [
        "La comprobacion de L398-409 es buena, y es incompleta de una",
        "manera concreta.",
        "LO QUE COMPRUEBA:",
        "",
        "  L399-403",
        "    SELECT COUNT(*)::int AS n FROM inventario_stock",
        "    WHERE id_sucursal = $1",
        "      AND (cantidad_disponible > 0 OR cantidad_reservada > 0)",
        "",
        "Y el mensaje es preciso: 'La sucursal tiene inventario activo.",
        "Reubique o agote el stock antes de inhabilitarla.'   L406",
        "",
        "LO QUE NO COMPRUEBA, de las 11 tablas con id_sucursal:",
        "",
        "  ventas               L305, con su cabecera y su detalle",
        "  transacciones_pago   L335",
        "  comprobantes         L348",
        "  reservas             L372",
        "  movimientos_inventario L424",
        "  kardex               L462",
        "  y las 5 que faltan",
        "",
        "O sea que una sucursal con 400 ventas históricas, 200",
        "reservas y 900 lineas de kardex se puede insolventar con el",
        "stock a cero. El mensaje dice 'agote el stock' y laAgotar el",
        "stock significa vaciar las existencias, no las ventas. O sea",
        "que el aviso induce a la accion que resuelve el problema que",
        "problema que el propio aviso no previene.",
        "",
        "Y la direccion es la contraria de la de ciudad: cambiarEstado",
        "Ciudad, L209-221, comprueba que no haya sucursales activas, que",
        "si es una dependencia de verdad. Dos entities, dos criterios, y el",
        "de la ciudad es el bueno."
    ]],
    ["5. El genero de los estados: Activa, pero el guard mira activo", [
        "No es un error. Es una bomba de relojería, y hay que dejarla",
        "escrita porque el proximo caso de uso la va a pisar.",
        "",
        "USUARIOS, que es el unico que comprueba el guard:",
        "  schema.sql L37   estado VARCHAR(20) DEFAULT 'Pendiente'",
        "  CU01 L48         if (estado.toLowerCase() !== 'activo')",
        "  CU06 L232        .set({ estado: 'Inactivo' })",
        "  genero           masculino, 'Activo' / 'Inactivo'",
        "",
        "CIUDADES y SUCURSALES:",
        "  L55   estado VARCHAR(20) DEFAULT 'Activa'",
        "  L64   estado VARCHAR(20) DEFAULT 'Activa'",
        "  CU09 L300 .set({ estado: 'Activa' })",
        "  CU09 L396 estadoNuevo = estado === 'Activa' ? ... : 'Inactiva'",
        "  genero           femenino, 'Activa' / 'Inactiva'",
        "",
        "En 16 sitios del proyecto el filtro es:",
        "  LOWER(estado) = 'activa'",
        "",
        "y son todos de ciudades y sucursales. O sea que el codigo es",
        "CONSISTENTE dentro de su genero. Lo peligroso es que el unico",
        "ejemplo de estado que tiene todo el mundo en la cabeza es el de",
        "usuarios, y si alguien escribe LOWER(estado) = 'activo' en una",
        "consulta de sucursales, no encuentra nada y no da error.",
        "",
        "Y hay un segundo remate, L396.",
        "",
        "  const estadoNuevo = estado === 'Activa' ? 'Activa' : 'Inactiva';",
        "",
        "O sea que el endpoint PATCH .../estado acepta CUALQUIER",
        "cadena y la convierte. Si mandas 'inhabilitada', 'BANANA', '' o",
        "'0', sale 'Inactiva'. Y si mandas 'activa' en minuscula, sale",
        "'Inactiva', porque la comparacion es exacta y sensible a",
        "mayusculas. Y el DTO, L52-56, solo comprueba que estado sea un",
        "string no vacio. No hay enum, ni MaxLength, ni una lista.",
        "",
        "Aun asi la base de datos no se rompe: estado es VARCHAR(20), y",
        "'Inactiva' cabe. Lo que se rompe es la API, que no dice nunca",
        "que valores admite."
    ]],
    ["6. El mismo dropdown de ciudades depende de dos permisos distintos", [
        "Y este es un hallazgo de la architecture, no del caso.",
        "",
        "La pantalla de CU04, Usuarios.tsx, al dar de alta un empleado",
        "pide la sucursal, y para eso llama, L438:",
        "",
        "  api.listarSucursalesActivas()",
        "  -> GET /admin/sucursales/activas   api.ts L1151-1154",
        "  -> CTR_Empleados L44-47",
        "  -> SRV_EmpleadosService.listarSucursales L314-328",
        "  -> exige gestionar_empleados.   L316-318",
        "",
        "Y la pantalla de CU09, Sucursales.tsx, para el selector de",
        "ciudades del alta de sucursal llama:",
        "",
        "  api.listarCiudades()",
        "  -> GET /admin/ciudades   CTR_Sucursales L63-66",
        "  -> SRV_SucursalesService.listarCiudades L77-94",
        "  -> exige gestionar_sucursales.   L78",
        "",
        "O sea que las dos listas de Sucursales y Usuarios vienen de",
        "servicios distintos, con permisos distintos, sobre datos que",
        "deberian ser los mismos. Un Encargado de Sucursal con",
        "gestionar_sucursales y sin gestionar_empleados puede crear",
        "sucursales, y un Administrador con gestionar_empleados y sin",
        "gestionar_sucursales puede dar de alta empleados. Ninguno de",
        "los dos roles del seed, por cierto, cumple ambos permisos:",
        "gestionar_sucursales esta en el catalogo y es el unico del",
        "grupo, y el seed de CU05 no siembra ni ese ni ningun otro de",
        "los 21. Como se vio en CU05, de los 16 permisos del seed el",
        "codigo entiende 2. Y uno de esos 2 es gestionar_reservas.",
        "",
        "O sea que segun el seed, NADIE puede entrar en este caso, ni",
        "en CU06 ni en CU07. El unico que puede es el Administrador, con",
        "el asterisco. Y CU09 es el unico caso de uso cuya unica via de",
        "entrada real sea el superadministrador."
    ]],
    ["7. La bitacora de este caso es la mejor del proyecto", [
        "Y hay que decirlo, porque es lo contrario de CU05, CU06 y CU07.",
        "",
        "Tres cosas que aqui estan bien y en los otros no:",
        "",
        "  1. oldData se COPIA de la fila real, no se afirma. En las 6",
        "     operaciones:",
        "       L171  { nombre: ciudad.nombre, departamento: ciudad.",
        "               departamento, estado: ciudad.estado }",
        "       L223  lo mismo, en cambiarEstadoCiudad",
        "       L357  los 5 campos de la sucursal, en modificarSucursal",
        "       L411  los mismos 5, en cambiarEstadoSucursal",
        "     CU05 ponia un literal, CU06 y CU07 tambien, y CU05 al menos",
        "     hacia un .slice() del valor real. Aqui no hay ningun",
        "     literal: se lee de la entidad que se acaba de cargar.",
        "",
        "  2. newData incluye el estado real que NO ha cambiado, L188 y",
        "     L240 y L377 y L439. O sea que el rastro dice que estado no",
        "     se toco, en vez de omitirlo y dejar que se suponga. Eso es",
        "     mas informacion, no menos.",
        "",
        "  3. El alta de sucursal, L304-319, pasa null en oldData y el",
        "     objeto nuevo entero en newData, con los 5 campos. Y el",
        "     detalle incluye la ciudad:",
        "       Sucursal creada: ${guardada.nombre} (${ciudad.nombre})",
        "     o sea que la bitacora de una sucursal dice en que ciudad",
        "     se creo, sin tener que cruzar con la tabla.",
        "",
        "Y hay un detalle de coherencia: el servicio tiene un metodo",
        "privado propio para la bitacora, L446-466, con 8 parametros",
        "tipados, en vez de llamar a registrar() en cada sitio con 8",
        "argumentos posicionales. Es lo que hace que las 6 llamadas se",
        "lean igual.",
        "",
        "El unico pero: el detalle de L307 y el nombre de la ciudad",
        "vienen de la entidad ciudad, que no tiene la columna",
        "departamento del hallazgo 1. Si el INSERT de la ciudad",
        "funcionara algun dia, el detalle seguiria siendo correcto."
    ]],
    ["8. Lo que si esta bien: los DTO tienen MaxLength, y eso no lo tiene nadie", [
        "Este es el unico caso, de los nueve, con validacion de verdad",
        "en las cuatro capas. Y hay que decirlo porque es el patron que",
        "faltan en los otros ocho.",
        "",
        "EN EL CONTROLADOR, CTR_Sucursales:",
        "",
        "  CrearCiudadRequest L21-31",
        "    @IsString @IsNotEmpty @MaxLength(80)   nombre",
        "    @IsString @IsNotEmpty @MaxLength(60)   departamento",
        "",
        "  CrearSucursalRequest L33-50",
        "    @IsString @IsNotEmpty @MaxLength(100)  nombre",
        "    @IsInt                                        id_ciudad",
        "    @IsString @IsNotEmpty                        direccion",
        "    @IsString @IsOptional @MaxLength(30)          telefono",
        "",
        "  El nombre va a VARCHAR(100) y el MaxLength es 100. El",
        "  telefono a VARCHAR(30) y el MaxLength es 30. Coinciden.",
        "",
        "Y eso es exactamente lo que falta en los otros casos:",
        "  CU05 L38-40   CrearRolRequest, sin MaxLength, y nombre_rol es",
        "                 VARCHAR(60).   Un nombre de 61 da un 500",
        "  CU07 L277-278 y L296 el motivo va a VARCHAR(255) sin",
        "                 MaxLength, y sin DTO ademas",
        "  CU08 L28      el @Query es Record<string, unknown>, que es un",
        "                 tipo anonimo, y el pipe se lo salta",
        "",
        "Ademas hay una defensa en el servicio, que repite el MaxLength",
        "en el servidor, por si el pipe se salta:",
        "  L104  if (nombre.length === 0) 400",
        "  L107  if (!departamento)       400",
        "  L280  if (!direccion)          400",
        "",
        "Y tres cosas mas:",
        "",
        "  - Los cuatro errores de nombre duplicado y de sucursales",
        "    activas y de inventario activo usan ConflictException, o",
        "    sea 409, que es el codigo correcto para un conflicto de",
        "    estado y no un 400.",
        "",
        "  - exigirPermiso, L70-75, es un metodo privado que se llama 8",
        "    veces, una por operacion. Cada operacion comprueba su",
        "    permiso, y el guard no lo comprueba, asi que no se puede",
        "    saltar desde fuera. Es el mismo patron que CU05 y CU08.",
        "",
        "  - El orden de las comprobaciones es el correcto: permiso",
        "    primero, existencia del registro segundo, y datos",
        "    tercero. Y la comprobacion de duplicados solo se hace si el",
        "    nombre ha cambiado de verdad, L160."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU09."; } catch (e) { }
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
        try { o.Text = "CU09  Administrar Ciudades y Sucursales"; } catch (e) { }
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
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja. Este caso tiene dos mitades y solo una funciona. Las 4 operaciones de ciudad fallan con 500 porque la tabla ciudades no tiene la columna departamento, que el codigo si usa. Y como el seed no siembra ninguna ciudad, no hay forma de crear una, y sin ciudad no hay sucursal, y 11 tablas dependen de la sucursal."; } catch (e) { }
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
// LOS 42 MENSAJES
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
    N.push("CU09  Administrar Ciudades y Sucursales.  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Administrador    «actor»     quien abre /admin/sucursales");
    N.push("    Sucursales.tsx         «boundary»  pages/admin/Sucursales.tsx, 780 lineas");
    N.push("    api.ts                 «boundary»  lib/api.ts, L1156-1200, seis metodos");
    N.push("    JwtAuthGuard           «control»   dependencias.ts, L15-65");
    N.push("    ValidationPipe         «control»   main.ts, L22-43, aqui SI valida");
    N.push("    CTR_Sucursales         «control»   8 endpoints, 132 lineas, 3 DTO con MaxLength");
    N.push("    SRV_SucursalesService  «control»   467 lineas, 8 exigirPermiso, 0 transacciones");
    N.push("    SRV_BitacoraService    «control»   metodo privado propio, L446-466");
    N.push("    CE_Modelos             «control»   Ciudad L111-127 y Sucursal L129-151");
    N.push("    PostgreSQL             «entity»    ciudades, sucursales, sucursal_horarios, 11 FK");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes: 13 van a la base de datos, 14 son mensajes a si mismo,");
    N.push("  1 va al modelo y 5 son retornos. 8 llevan la guarda escrita entre corchetes, y aparecen");
    N.push("  9 codigos: 200, 201, 400, 401, 403, 404, 409, 422 y 500. Y ese ultimo se lleva las 4");
    N.push("  operaciones de ciudad.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("LO QUE SE DIBUJA: 8 ENDPOINTS, Y SOLO 4 FUNCIONAN");
    N.push("");
    N.push("  CIUDADES, las 4, y las 4 fallan con 500:");
    N.push("    mensaje 11  SELECT c.departamento       L80-85   42703");
    N.push("    mensaje 21  INSERT con departamento   L121-126  42703");
    N.push("    mensaje 35  UPDATE y SELECT COUNT     L145, L176, L210-215  42703");
    N.push("");
    N.push("  SUCURSALES, las 4, y estas funcionan, porque no tocan la columna que falta:");
    N.push("    mensaje 32  SELECT ciudades por id     L285-290, sin departamento");
    N.push("    mensaje 40  el listado con LEFT JOIN   L249-255");
    N.push("    y el alta y la modificacion y el estado, que tampoco tocan ciudades");
    N.push("");
    N.push("EL HALLAZGO 1: LA COLUMNA QUE NO EXISTE");
    N.push("");
    N.push("  schema.sql L51-L56, la tabla entera:");
    N.push("");
    N.push("    CREATE TABLE ciudades (");
    N.push("        id_ciudad SERIAL PRIMARY KEY,");
    N.push("        nombre    VARCHAR(80) UNIQUE NOT NULL,");
    N.push("        pais      VARCHAR(60) DEFAULT 'Bolivia',");
    N.push("        estado    VARCHAR(20) DEFAULT 'Activa'");
    N.push("    );");
    N.push("");
    N.push("  CE_Modelos.ts L122-123, lo que el codigo cree que hay:");
    N.push("");
    N.push("    @Column({ name: 'departamento', type: 'varchar', length: 60,");
    N.push("              nullable: true })");
    N.push("    departamento: string | null;");
    N.push("");
    N.push("  La palabra departamento aparece 0 veces en el esquema entero, y no hay ni un");
    N.push("  ALTER TABLE que la anada. Y en el lado contrario: pais, que SI esta, no lo usa");
    N.push("  nadie. Ni el DTO, ni el servicio, ni la pantalla. Se queda en Bolivia.");
    N.push("");
    N.push("EL HALLAZGO 2: POR ESO NO HAY NINGUNA SUCURSAL EN EL SISTEMA");
    N.push("");
    N.push("  El seed siembra tallas, colores, roles y categorias. Ciudades y sucursales no:");
    N.push("  cero INSERT, comprobado. En una base recien instalada no hay ninguna ciudad.");
    N.push("");
    N.push("  Y crearSucursal L285-293 exige ciudad existente y Activa. Sin ciudades no hay");
    N.push("  sucursales. Y como crear una ciudad da 500, no hay forma de salir de ahi desde la");
    N.push("  aplicacion. El unico camino es un INSERT manual.");
    N.push("");
    N.push("  Y en el esquema hay 11 FOREIGN KEY REFERENCES sucursales(id_sucursal) y 48");
    N.push("  columnas chamadas id_sucursal: inventario_stock, ventas, pagos, comprobantes,");
    N.push("  reservas, movimientos_inventario, kardex, usuarios_empleados. La estructura");
    N.push("  base del negocio no se puede montar desde la aplicacion.");
    N.push("");
    N.push("  Y hay una tercera tabla que no sale en ningun caso anterior: sucursal_horarios.");
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  La tabla ciudades no tiene la columna departamento y el codigo la declara en");
    N.push("     la entidad y la usa en el DTO, en el servicio, en la pantalla y en la");
    N.push("     bitacora. Las 4 operaciones de ciudad son un 500. Y pais, que si existe, no");
    N.push("     lo usa nadie.");
    N.push("  2  El seed no siembra ni ciudades ni sucursales, y crear una sucursal exige una");
    N.push("     ciudad activa. O sea que no hay ninguna sucursal posible, y 11 tablas con");
    N.push("     FOREIGN KEY a sucursales dependen de ella.");
    N.push("  3  ciudades.nombre es UNIQUE y sucursales.nombre no, ni en el esquema ni en la");
    N.push("     entidad. Y crearCiudad comprueba duplicados y crearSucursal no comprueba");
    N.push("     ninguno. Se pueden crear sucursales con el mismo nombre sin limite.");
    N.push("  4  Cerrar una sucursal mira solo inventario_stock, de las 11 tablas que la");
    N.push("     referencian. Y el mensaje dice 'agote el stock', que resuelve el problema que");
    N.push("     el aviso no previene. La comprobacion de ciudad, que si es de verdad, es la");
    N.push("     que no tiene.");
    N.push("  5  ciudades y sucursales usan el genero femenino, Activa e Inactiva, y usuarios");
    N.push("     el masculino. Es consistente, pero el unico ejemplo que tiene todo el mundo");
    N.push("     en la cabeza es el de usuarios, asi que un LOWER(estado) = 'activo' en una");
    N.push("     consulta de sucursales no encuentra nada y no da error. Y L396 convierte");
    N.push("     cualquier cadena en Inactiva, sin enum y sin lista.");
    N.push("  6  El mismo dropdown de ciudades depende de dos permisos: la pantalla de CU04");
    N.push("     pide sucursales con gestionar_empleados, y la de CU09 pide ciudades con");
    N.push("     gestionar_sucursales. Y segun el seed de CU05, ninguno de los dos roles del");
    N.push("     seed puede entrar aqui: el unico que puede es el Administrador con el");
    N.push("     asterisco.");
    N.push("  7  La bitacora de este caso es la mejor del proyecto: oldData se copia de la");
    N.push("     fila real en las 6 operaciones, sin un solo literal, y newData incluye el");
    N.push("     estado que no ha cambiado. Y hay un metodo privado propio, L446-466, con 8");
    N.push("     parametros tipados.");
    N.push("  8  Lo que si esta bien, y es el patron que faltan en los otros ocho casos: los");
    N.push("     tres DTO tienen @MaxLength, y coinciden con el VARCHAR de la columna. Y el");
    N.push("     servicio repite la comprobacion en el servidor por si el pipe se salta.");
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  El hallazgo 6 cierra el de CU05. Alli se vio que el seed siembra 17 permisos de");
    N.push("  los que el codigo entiende 2, y que el asterisco del Administrador no se puede");
    N.push("  editar. Aqui se ve la consecuencia: gestionar_sucursales es el unico permiso del");
    N.push("  grupo Sucursales del catalogo, y el seed no lo siembra. O sea que este caso de");
    N.push("  uso solo es accesible con el asterisco, y con el asterisco solo el seed lo da,");
    N.push("  y el asterisco no se puede editar desde la aplicacion. Esta es la cadena de tres");
    N.push("  casos mas larga del proyecto.");
    N.push("");
    N.push("  Y el hallazgo 7 es lo contrario de CU05, CU06 y CU07, donde el old_data era un");
    N.push("  literal. Aqui se lee de la entidad. Se puede comparar lado a lado:");
    N.push("");
    N.push("    CU05 L189   { permisos: oldPermisos }   una copia real, con .slice()");
    N.push("    CU06 L255   { estado: 'Activo' }        un literal afirmado");
    N.push("    CU07 L307   { estado: 'Inactivo' }      un literal afirmado");
    N.push("    CU09 L171   { nombre: ciudad.nombre,    la fila real, leida del objeto");
    N.push("               departamento: ciudad.departamento,");
    N.push("               estado: ciudad.estado }");
    N.push("");
    N.push("  Y el hallazgo 5 es la primera vez que el genero de los estados aparece como");
    N.push("  problema. CU06 y CU07 no lo detectaron porque no lo usan, asi que estara en el");
    N.push("  el caso de uso de ventas, que es donde LOWER(u.estado) = 'activo' y LOWER(s.");
    N.push("  estado) = 'activa' conviven en el mismo fichero.");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU09 Secuencia", 0); } catch (e) { }
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
    T.push("CU09 - DIAGRAMA DE SECUENCIA - INFORME");
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
    msg = msg + "CU09 - Administrar Ciudades y Sucursales" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "LA TABLA CIUDADES NO TIENE LA COLUMNA departamento." + SALTO;
    msg = msg + "El codigo la declara en la entidad y la usa en 4" + SALTO;
    msg = msg + "sitios. Las 4 operaciones de ciudad son un 500." + SALTO + SALTO;
    msg = msg + "Y el seed no siembra ni ciudades ni sucursales, y" + SALTO;
    msg = msg + "crear sucursal exige ciudad activa: no hay ninguna" + SALTO;
    msg = msg + "sucursal posible, y 11 tablas dependen de ella." + SALTO + SALTO;
    msg = msg + "Lo bueno: los 3 DTO tienen MaxLength, y la bitacora" + SALTO;
    msg = msg + "copia el oldData de la fila real. La mejor del proyecto." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU09 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU09 Secuencia", 0); } catch (e3) { }
}
