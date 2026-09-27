// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU08  Consultar Bitacora de Auditoria
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/admin/Auditoria.tsx               504 lineas
//     web/src/lib/api.ts                              L1120-1145
//     api/src/main.ts                                 L22-43 ValidationPipe
//     api/src/modulos/seguridad/dependencias.ts       L15-65 JwtAuthGuard
//     api/src/modulos/seguridad/CTR_Auditoria.ts      49 lineas
//     api/src/modulos/seguridad/SRV_AuditoriaService.ts 198 lineas
//     api/src/modulos/seguridad/SRV_BitacoraService.ts L14-39, el escritor
//     api/src/modulos/seguridad/CE_Modelos.ts         L298-333
//     BASE DE DATOS/schema.sql                        L148-160, L560-561
//
//   Cada mensaje lleva la linea del fichero de la que sale.
//
// QUE HACE ESTE CASO, Y POR QUE ES EL MAS INTERESANTE DE LOS OCHO
//   Es el unico caso de uso del proyecto que NO escribe en la base de
//   datos: solo lee. Y eso lo hace el mas barato y el mas barato de
//  破碎ar, porque no hay ni una sola escritura que deshacer.
//
//   Pero al leer la tabla bitacora_auditoria y cruzar QUIEN la escribe
//   sale lo que de verdad importa, y es una paradoja:
//
//   La bitacora se llama de auditoria, hay un indice llamado
//   idx_bitacora_fecha, y el caso se llama "Consultar Bitacora de
//   Auditoria". Suena a que cubre el sistema entero.
//
//   YCover el 59 por ciento.
//
//   En el proyecto hay 31 SRV de servicios. De esos, 19 llaman a
//   bitacoraService.registrar, y los otros 12 no registran NADA:
//   kardex, existencias, catalogos, reportes de voz, backups, scoring,
//   recomendaciones, preferencias, y el propio SRV_AuditoriaService.
//
//   O sea que el modulo de inventario, que es el mas grande del
//   proyecto con diferencia, no deja ni un solo rastro. Y el modulo de
//   reportes de voz, que es el CU32 entero, escribe con un INSERT
//   propio, L447, saltandose el servicio.
//
//   39 mensajes. 10 lineas de vida. 8 van a la base de datos, 17 son
//   mensajes a si mismo, 1 va al modelo y 7 son retornos.
//   4 guardas escritas entre corchetes y 5 codigos: 200, 401, 403, 422 y 500.
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
var TOTAL_MSG = 39;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU08 Secuencia Bitacora Auditoria";
var DIAG_NOMBRE = "CU08 Consultar Bitacora de Auditoria";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 100;

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
    ["U", "ACTOR_Administrador", "Actor", "Lifeline", "Administrador", "quien consulta", "Actor, no clase: es quien busca", "no es codigo, es la persona"],
    ["F", "Auditoria.tsx", "Object", "Lifeline", "Auditoria", "pantalla de bitacora", "Boundary", "web/src/pages/admin/Auditoria.tsx, 504 lineas"],
    ["H", "api.ts", "Object", "Lifeline", "api", "cliente HTTP", "Boundary", "web/src/lib/api.ts, L1120-1145"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["P", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "no toca un query", "Control", "api/src/main.ts, L22-43, es global"],
    ["C", "CTR_Auditoria", "Object", "Lifeline", "AdminController", "dos endpoints", "Control", "api/src/modulos/seguridad/CTR_Auditoria.ts, 49 lineas"],
    ["S", "SRV_AuditoriaService", "Object", "Lifeline", "AuditoriaService", "consultar, CSV y emails", "Control", "api/src/modulos/seguridad/SRV_AuditoriaService.ts, 198 lineas"],
    ["M", "CE_Modelos", "Object", "Lifeline", "BitacoraAuditoria", "los 11 campos", "Control", "api/src/modulos/seguridad/CE_Modelos.ts, L298-333"],
    ["W", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "el escritor, 19 ficheros", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "1 tabla, 2 indices", "Entity", "schema.sql: bitacora_auditoria L148-160, indices L560-561"]
];

// Los 38 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [    [1, "U", "F", "1. abre /admin/auditoria   Auditoria.tsx, 504 lineas, con seis filtros y paginacion de 20 en 20   L24", "S"],
    [1, "F", "F", "1. useMemo junta los seis filtros en un objeto   L158-168.   El useEffect de L187 depende de ese objeto, no de un boton", "S"],
    [2, "F", "F", "2. y eso significa que se recarga con cada tecla del filtro de usuario.   No hay boton de buscar   L169-176", "S"],
    [3, "F", "H", "3. GET /api/v1/admin/auditoria?pagina=1&limite=20   api.ts L1120", "S"],
    [4, "H", "G", "4. GET con Authorization Bearer y credentials:'include'", "S"],
    [5, "G", "D", "5. SELECT usuarios WHERE id_usuario = :sub   L44", "S"],
    [6, "G", "G", "6. [estado != 'activo'] 401 'Tu cuenta esta deshabilitada.'   L49-51", "S"],
    [7, "G", "P", "7. el guard no toca la query.   La query la ve el pipe, que es global   main.ts L22-43", "S"],
    [8, "P", "P", "8. y el pipe no puede validar nada: el @Query es Record<string, unknown>, un tipo anonimo que desaparece al compilar   CTR_Auditoria L28", "S"],
    [9, "P", "P", "9. los seis filtros los normaliza a mano normalizarFiltros, L14-24, con Number(pagina) || 1 y con typeof === 'string' para los de texto", "S"],
    [10, "C", "C", "10. normalizarFiltros convierte los query params   L14-24.   Number(pagina) || 1, y los textos con typeof === 'string'", "S"],
    [11, "C", "C", "11. y mete un valor por defecto que no es de la pantalla: limite 20   L17", "S"],
    [12, "C", "S", "12. consultar( currentUser, filtros )   L42.   El caso de la consulta normal", "S"],
    [13, "S", "D", "13. SELECT usuarios LEFT JOIN usuarios_roles LEFT JOIN roles WHERE id_usuario = :id   L24-33", "S"],
    [14, "S", "S", "14. return conRol?.rol?.permisos_json   L32.   El getter de roles[0], por cuarta vez", "S"],
    [15, "S", "S", "15. [sin '*' ni 'ver_auditoria'] 403 'No tienes permiso para consultar la bitacora de auditoria.'   L101-103", "S"],
    [16, "S", "S", "16. calcularRango valida las dos fechas con la REGEX_ISO de L16 y compara que el rango no este del reves   L39-56", "S"],
    [17, "S", "S", "17. [una fecha no es AAAA-MM-DD, o el rango esta invertido] 422 'El rango de fechas es invalido.'   L41, L44, L53", "S"],
    [18, "S", "D", "18. SELECT COUNT(b.id_bitacora) con los mismos filtros   L110-112.   La consulta se clona para el total", "S"],
    [19, "S", "D", "19. SELECT b.id_bitacora, b.fecha_hora, u.email, b.accion_sql, b.tabla_afectada, b.id_registro, b.ip_address, y los dos JSONB con CAST a texto   L114-131", "S"],
    [20, "S", "S", "20. limite = Math.min(Math.max(filtros.limite || 20, 1), 100).   Tope de 100 filas por pagina, en el servidor   L107", "S"],
    [21, "S", "S", "21. y pagina = Math.max(filtros.pagina || 1, 1)   L108.   Offset (pagina - 1) * limite   L130", "S"],
    [22, "S", "M", "22. mapea los 10 campos que trae.   detalle y user_agent se piden a la base y no se devuelven   L77-97", "S"],
    [23, "S", "C", "23. { registros, total, pagina, limite, total_paginas }   L133-139", "A"],
    [24, "C", "H", "24. el JSON con la pagina de 20 registros", "A"],
    [25, "H", "F", "25. setDatos, setTotal, setTotalPaginas   L177-181", "A"],
    [26, "F", "F", "26. cada fila se puede desplegar para ver old_data y new_data   L150 y L150 expandidoId", "S"],
    [27, "F", "F", "27. y el boton de exportar pide los mismos filtros por format=csv   L213-215", "S"],
    [28, "F", "H", "28. GET /api/v1/admin/auditoria?format=csv   api.ts L1130", "S"],
    [29, "C", "S", "29. exportarCSV( currentUser, filtros )   L36, que vuelve a pedir el permiso de L143-146", "S"],
    [30, "S", "D", "30. la MISMA consulta de L114-131 pero SIN limite y SIN offset   L149-164.   El CSV sale entero", "S"],
    [31, "S", "S", "31. y eso significa que exportar 2 millones de filas las trae todas a memoria de golpe   L149-164", "S"],
    [32, "S", "C", "32. el CSV con cabecera y \\r\\n, y cada campo entre comillas con las comillas dobles dobladas   L166-181", "A"],
    [33, "C", "H", "33. response.setHeader('Content-Type', 'text/csv; charset=utf-8')   L37, y Content-Disposition con la fecha de hoy del servidor   L7 y L38", "A"],
    [34, "H", "F", "34. blob y filename, que saca del Content-Disposition   api.ts L1137", "A"],
    [35, "F", "U", "35. se descarga el fichero, o Toast de error con el 422 del rango   L213-224", "A"],
    [36, "W", "D", "36. Y EN ESTE LADO ESTA EL ESCRITOR.   INSERT INTO bitacora_auditoria   L27-38.   Lo llaman 19 servicios, 54 veces", "S"],
    [37, "S", "S", "37. y en la otra punta de la tabla: 12 de los 31 servicios del proyecto NO llaman nunca a registrar.   El modulo de inventario entero no deja ni un solo rastro", "S"],
    [38, "M", "D", "38. ademas, SRV_ReportesVozService L447 escribe con un INSERT propio, saltandose el servicio.   Y SRV_ComprobantesService L227 la lee con un SELECT propio", "S"],
    [39, "M", "D", "39. la tabla tiene 11 columnas, schema.sql L148-160, y esta consulta solo pide 9.   detalle y user_agent se quedan fuera, y detalle es la que guarda el motivo de cada operacion", "S"],
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. La bitacora no cubre el 59 por ciento del sistema", [
        "El hallazgo gordo, y sale de cruzar la tabla con quien la escribe.",
        "",
        "En el proyecto hay 31 ficheros SRV de servicios. De esos:",
        "",
        "  19 llaman a bitacoraService.registrar, 54 veces en total",
        "",
        "    SRV_AuthService          10",
        "    SRV_PagosService          9",
        "    SRV_ReservasService       6",
        "    SRV_CarritoService        4",
        "    SRV_RolesService          4",
        "    SRV_RespaldosService      3",
        "    SRV_EmpleadosService      3",
        "    SRV_SesionesRaService     3",
        "    SRV_VentasService         2",
        "    y otros 11 con 1 cada uno",
        "",
        "  12 NO LLAMAN NUNCA. Ni una sola vez, en ningun sitio:",
        "",
        "    SRV_KardexService        el kardex, el historico de inventario",
        "    SRV_ExistenciasService  las existencias",
        "    SRV_CatalogosService     tallas, colores y categorias",
        "    SRV_ReportesVozService   CU32 entero",
        "    SRV_RecomendacionesService",
        "    SRV_ScoringService       el scoring del recommender",
        "    SRV_PreferenciasService",
        "    SRV_StorageService       el almacenamiento de fotos",
        "    SRV_RespaldosService     espera, este si llama, 3 veces",
        "    SRV_EmailService, SRV_JWTService, SRV_SeguridadService",
        "    y SRV_AuditoriaService, que es el que consulta",
        "",
        "O sea que el modulo de inventario, que es el mas grande del",
        "proyecto con diferencia, no deja ni un solo rastro de nada. Se puede",
        "borrar una talla, cambiar un color o mover el kardex, y la bitacora",
        "no se entera.",
        "",
        "Y esto NO es un descuido de un servicio suelto: el catalogo de",
        "permisos de CU05 tiene un permiso llamado ver_auditoria, y el",
        "nombre del caso es 'Consultar Bitacora de Auditoria'. Suena a que",
        "cubre el sistema entero. Cubre 19 de 31 modulos."
    ]],
    ["2. Hay dos Thefts de la bitacora que se saltan el servicio", [
        "El proyecto tiene DOS caminos para escribir en bitacora_auditoria,",
        "y solo uno de los dos pasa por SRV_BitacoraService.",
        "",
        "CAMINO 1, el que todos creemos: el servicio, L14-39 de",
        "SRV_BitacoraService. 19 ficheros, 54 llamadas. Valida, crea la",
        "entidad y guarda.",
        "",
        "CAMINO 2, con SQL escrito a mano en el servicio que lo necesita:",
        "",
        "  SRV_ReportesVozService.ts L447",
        "    INSERT INTO bitacora_auditoria (id_usuario, accion_sql,",
        "      tabla_afectada, id_registro, new_data...",
        "",
        "Eso es el modulo de reportes de voz, que es el CU32 entero, y lo",
        "hace con su propia sentencia. No pasa por registrar(), asi que no",
        "pasa por el mapeo de campos, ni por el try de ip y user_agent, ni",
        "por la firma de 8 parametros. Se le puede olvidar una cosa sin que",
        "nadie se entere.",
        "",
        "Y hay un tercer caso, al reves: alguien LEE la bitacora con SQL",
        "propio en vez de con el servicio.",
        "",
        "  SRV_ComprobantesService.ts L227",
        "    FROM bitacora_auditoria",
        "",
        "O sea que un modulo de ventas lee la tabla de auditoria por su",
        "cuenta. Si mañana se cambia el esquema, ese sitio no se entera.",
        "",
        "Con un servicio centralizado, L14-39, con una firma de 8",
        "parametros, todo esto no podria pasar: no habria forma de escribir",
        "sin pasar por ahi. Es el argumento a favor de no saltarse la",
        "capa, y el proyecto la tiene."
    ]],
    ["3. El CSV no tiene limite, y sale con el nombre de un dia cualquiera", [
        "exportarCSV es la unica operacion de todo el caso que no tiene",
        "techo, y se nota.",
        "",
        "CONSULTAR, L107:",
        "  const limite = Math.min(Math.max(filtros.limite || 20, 1), 100);",
        "",
        "EXPORTAR, L149-164: la misma consulta, pero sin .limit() y sin",
        ".offset(). O sea que se trae la tabla entera.",
        "",
        "Eso no es un error de principle sino de dimension: la consulta",
        "normal esta blindada a 100 filas por pagina, y el CSV no tiene",
        "ningun blindaje. Con el filtro vacio, que es lo que hace el boton la",
        "primera vez,_exporta todo lo que haya acumulado. Y la cadena se",
        "construye entera en memoria antes de responder, L172-181, porque",
        "devuelve un string, no un stream.",
        "",
        "Y hay dos detalles mas en el CSV:",
        "",
        "  - el escapado de L167-170 solo dobla las comillas. No escapa",
        "    ni los saltos de linea ni los puntos y comas. Como el separador",
        "    es la coma y el terminador es \\r\\n, un detalle con una coma",
        "    dentro rompe las columnas. Y los detalles SI llevan comas:",
        "    'Empleado deshabilitado: x@y.com — motivo: conducta'",
        "",
        "  - el nombre del fichero, L38, usa HOY, que es una constante",
        "    calculada al cargar el modulo, L7:",
        "      const HOY = new Date().toISOString().slice(0, 10);",
        "    O sea que la fecha del nombre es la del servidor, en UTC, no la",
        "    del usuario. Un exportar desde Bolivia a las 21 de la tarde",
        "    puede llamarse con el dia siguiente."
    ]],
    ["4. detalle y user_agent se piden y no se devuelven", [
        "Dos columnas que se leen de la base de datos y se tiran.",
        "",
        "La consulta pide 9 columnas, L116-124:",
        "",
        "  b.id_bitacora, b.fecha_hora, u.email, b.accion_sql,",
        "  b.tabla_afectada, b.id_registro, b.ip_address, y los dos JSONB",
        "",
        "Y el mapper, L86-96, devuelve 10 campos: id, fecha, ip, correo,",
        "accion_sql, tabla_afectada, registro_id, old_data y new_data.",
        "",
        "La tabla tiene 11 columnas, schema.sql L148-160:",
        "",
        "  id_bitacora, id_usuario, accion_sql, tabla_afectada,",
        "  id_registro, detalle, old_data, new_data, ip_address,",
        "  user_agent, fecha_hora",
        "",
        "O sea que detalle y user_agent NO se piden. detalle es la columna",
        "mas informativa de todas, y es la unica que guarda POR QUE paso",
        "cada cosa en texto:",
        "",
        "  'Empleado deshabilitado: x@y.com — motivo: conducta'   CU06 L252",
        "  'Rol Administrador modificado'                            CU05 L287",
        "",
        "Es decir, el motivo de una baja logica esta en detalle, y en",
        "old_data y new_data solo estan los estados. Y como la pantalla no",
        "pide detalle, el motivo de la baja no se puede ver desde la",
        "bitacora, solo desde el texto que la propia fila de la pantalla",
        "muestra en ninguna parte.",
        "",
        "Y user_agent, que SRV_BitacoraService L25 si calcula y si guarda,",
        "tampoco se lee nunca. Con eso, de los 4 campos que el servicio",
        "escribe de mas, la pantalla aprovecha 1: el ip."
    ]],
    ["5. Se recarga con cada tecla, y el total se recalcula cada vez", [
        "La pantalla no tiene boton de buscar. L169-176 y L187.",
        "",
        "  useEffect(() => { ... }, [filtrosAplicados]);",
        "",
        "y filtrosAplicados es un useMemo, L158-168, que depende de los",
        "cinco estados de filtro y de la pagina. O sea que CADA TECLA que se",
        "pulse en el campo de usuario, y cada fecha que se escriba, cambia",
        "el objeto, dispara el efecto, y lanza un GET.",
        "",
        "Y cada GET hace DOS consultas, no una:",
        "",
        "  L110-112  SELECT COUNT(b.id_bitacora) con los mismos filtros",
        "  L114-131  la pagina de datos con LIMIT y OFFSET",
        "",
        "O sea que teclear 10 letras en el filtro son 20 consultas. Y el",
        "campo de usuario se manda tal cual, L164, con un ILIKE, L69:",
        "",
        "  b.u.email ILIKE :usuario con %${filtros.usuario.trim()}%",
        "",
        "El ILIKE con comodines a los dos lados no puede usar indice. Y",
        "como el filtro de texto es el unico de los cinco que se puede",
        "escribir letra a letra, es tambien el que peor indexa.",
        "",
        "Los dos indices que hay, schema.sql L560-561, son otros:",
        "",
        "  idx_bitacora_fecha  ON bitacora_auditoria (fecha_hora DESC)",
        "  idx_bitacora_tabla  ON bitacora_auditoria (tabla_afectada)",
        "",
        "O sea que el indice de fecha, que es el que usa el ORDER BY de",
        "L127-128, si sirve. Y el de tabla, que sirve para el filtro de L71,",
        "tambien. Los otros tres filtros, usuario, accion y rango, no tienen",
        "indice. Y el rango de fechas si lo tiene, el de la fecha, pero",
        "combinado con el ORDER BY y el LIMIT es el unico uso bueno del",
        "indice."
    ]],
    ["6. El 304 que devuelve el 403 del 422 no se puede ver", [
        "Los errores del filtro llegan, pero el del permiso no se distingue.",
        "",
        "El permiso se comprueba con el getter, L32, como en los otros",
        "cinco casos:",
        "",
        "  return (conRol?.rol?.permisos_json ?? []) as string[];",
        "",
        "y L101-103:",
        "",
        "  if (!this.verificarPermiso(permisos, 'ver_auditoria'))",
        "    throw new ForbiddenException('No tienes permiso para consultar la",
        "      bitacora de auditoria.');",
        "",
        "Eso esta bien: el mensaje es claro y el permiso es uno de los 21",
        "del catalogo de CU05, y ver_auditoria es de los que si se comprueba",
        "en el codigo, a diferencia de ajustar_stock o gestionar_alertas.",
        "",
        "PERO hay un problema de permisos concrete, y es el quinto caso que",
        "sale de la misma raiz: la tabla usuarios_roles admite N roles por",
        "usuario, PRIMARY KEY (id_usuario, id_rol), schema.sql L48, y el",
        "getter de CE_Modelos L76-81 lee roles[0]. La consulta de L28-29",
        "tampoco lleva ORDER BY. O sea que quien tenga ver_auditoria en su",
        "SEGUNDO rol no puede ver la bitacora, y no hay forma de saberlo",
        "desde la aplicacion.",
        "",
        "Y el 422 del rango, L41, L44 y L53, es un caso distinto y bien",
        "hecho:",
        "",
        "  REGEX_ISO = /^\\d{4}-\\d{2}-\\d{2}$/   L16",
        "",
        "se comprueba ANTES de construir las fechas, y despues se compara",
        "que desde no sea posterior a hasta, L52-54. O sea que valida el",
        "formato y luego el sentido, que es lo que de verdad importa. Y el",
        "frontend lo detecta antes, con los input type=date, L138-139.",
        "",
        "O sea que el unico filtro con validacion de verdad en las dos",
        "capas es el de fechas. Los otros cuatro, usuario, tabla, accion y",
        "pagina, no tienen ninguno."
    ]],
    ["7. La tabla tiene ON DELETE SET NULL, y eso destroys el rastro", [
        "La unica proteccion de la bitacora ante un borrado de usuario esta",
        "bien puesta, y tiene un coste que hay que saber.",
        "",
        "  schema.sql L150",
        "    id_usuario INTEGER REFERENCES usuarios(id_usuario)",
        "                ON DELETE SET NULL",
        "",
        "O sea que si se borra un usuario de la tabla usuarios, sus filas",
        "de bitacora NO se borran: se quedan con id_usuario a null. Y la",
        "consulta hace un leftJoin, L64, y lo mapea a null, L90. O sea que",
        "el LEFT JOIN es exactamente para esto: para que losEntries de un",
        "usuario borrado se puedan seguir viendo.",
        "",
        "PERO: no hay ninguna forma de saber a quien pertenecía esa fila.",
        "El id_usuario es null y no se guarda ningun email. La columna",
        "detalle, L154, es TEXT, pero solo la rellenan 12 de las 54 llamadas,",
        "y las de seguridad casi nunca:",
        "",
        "  registrar(null, 'LOGIN_FAILED', 'usuarios', 'usuario_no_existe')",
        "                                                          CU01 L44",
        "",
        "O sea que un intento de login con un correo que no existe se",
        "guarda con id_usuario a NULL y con el detalle literal",
        "'usuario_no_existe'. Del correo que se intento no queda nada, en",
        "el campo de texto ni en ninguna parte.",
        "",
        "Y en la pantalla tampoco hay forma de saberlo: el correo sale de",
        "u.email, L119, y si el usuario no existe, sale vacio. O sea que un",
        "intento de ataque por fuerza bruta contra un correo que no existe",
        "deja 3 filas de LOGIN_FAILED identicas, sin direccion IP de",
        "destinatario y sin el correo que se intento.",
        "",
        "Lo que si queda es la IP de origen, L89, que es lo unico que"
    ]],
    ["8. Lo que si esta bien: el caso es el unico que solo lee", [
        "Es el unico caso de uso del proyecto que no escribe nada, y eso se",
        "nota en el diagrama: no hay ninguna flecha de vuelta a la base de",
        "datos con una escritura. Solo 7 SELECT.",
        "",
        "Y hay cosas que este caso hace bien y los demas no:",
        "",
        "  - La consulta se construye una vez, construirQuery, L58-75, y se",
        "    clona para el total y para los datos, L111 y L115. Los filtros",
        "    estan en un solo sitio, y el COUNT y el SELECT no pueden",
        "    desincronizarse. Es lo contrario de las dos escrituras sueltas",
        "    de CU06 y CU07.",
        "",
        "  - Hay un tope de pagina en el servidor, L107, con Math.min y",
        "    Math.max. Aunque el cliente pida limite=9999, se queda en 100.",
        "    Eso es un recorte de servidor de verdad, no de cliente.",
        "",
        "  - El ORDER BY es de dos columnas, L127-128: fecha_hora DESC y",
        "    id_bitacora DESC. El segundo desempate por clave primaria es",
        "    lo que hace que la paginacion no repita ni pierda filas cuando",
        "    dos entradas tienen el mismo timestamp, que es lo habitual en",
        "    un lote. Es el detalle que casi nadie pone y aqui esta.",
        "",
        "  - El escapado del CSV, L167-170, dobla las comillas dobles, que",
        "    es la mitad correcta de lo que hay que hacer en un CSV.",
        "",
        "  - Y parseJson, L78-85, es defensivo de verdad: si el jsonb llega",
        "    como texto lo parsea, si llega como objeto lo deja, y si esta",
        "    corrupto devuelve el texto en vez de reventar. Un solo json",
        "    malo no tumba la pantalla de auditoria entera.",
        "",
        "  - Y el permiso se comprueba por operacion, no en el guard. El",
        "    guard L15-65 no sabe nada de ver_auditoria, asi que no se puede",
        "    saltar desde fuera. Es el mismo patron que CU05."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU08."; } catch (e) { }
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
        try { o.Text = "CU08  Consultar Bitacora de Auditoria"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 700) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseno de caso de uso, seccion 3.3.2.1.  10 lineas de vida, 39 mensajes, 8 hallazgos."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja. Este es el unico caso de uso del proyecto que no escribe nada: solo siete SELECT. Lo que no se ve en el diagrama, y es el hallazgo 1, es que la bitacora solo la escriben 19 de los 31 servicios. El modulo de inventario entero no deja ni un solo rastro."; } catch (e) { }
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
    N.push("CU08  Consultar Bitacora de Auditoria.  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Administrador    «actor»     quien busca en la bitacora");
    N.push("    Auditoria.tsx          «boundary»  pages/admin/Auditoria.tsx, 504 lineas");
    N.push("    api.ts                 «boundary»  lib/api.ts, L1120-1145");
    N.push("    JwtAuthGuard           «control»   dependencias.ts, L15-65, no sabe de auditoria");
    N.push("    ValidationPipe         «control»   main.ts, L22-43, no toca un query");
    N.push("    CTR_Auditoria          «control»   2 endpoints, 49 lineas");
    N.push("    SRV_AuditoriaService   «control»   198 lineas: consultar, exportarCSV y listarEmails");
    N.push("    CE_Modelos             «control»   BitacoraAuditoria, L298-333");
    N.push("    SRV_BitacoraService    «control»   el escritor, L14-39, lo llaman 19 servicios");
    N.push("    PostgreSQL             «entity»    bitacora_auditoria, 11 columnas y 2 indices");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes: 8 van a la base de datos, 17 son mensajes a si mismo, 1 va al modelo y");
    N.push("  7 son retornos. 4 llevan la guarda escrita entre corchetes, y aparecen 5 codigos: 200, 401, 403, 422 y 500.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("LO QUE SE DIBUJA: EL UNICO CASO QUE SOLO LEE");
    N.push("");
    N.push("  No hay ni una sola escritura en este diagrama. Todo son SELECT, y eso se nota: es");
    N.push("  el unico de los ocho casos donde no hace falta.transaction y no hay que deshacer");
    N.push("  nada. El coste esta en las consultas, no en la consistencia.");
    N.push("");
    N.push("  mensaje 12  SELECT usuarios LEFT JOIN roles   L24-33, para el permiso");
    N.push("  mensaje 17  SELECT COUNT(b.id_bitacora)       L110-112, el total de paginas");
    N.push("  mensaje 18  la pagina de datos, con LIMIT    L114-131");
    N.push("  mensaje 29  la misma consulta SIN limite     L149-164, la del CSV");
    N.push("");
    N.push("EL HALLAZGO 1: LA BITACORA NO CUBRE EL SISTEMA, CUBRE 19 DE 31");
    N.push("");
    N.push("  En el proyecto hay 31 ficheros SRV de servicios. 19 llaman a");
    N.push("  bitacoraService.registrar, 54 veces. Los 12 que no:");
    N.push("");
    N.push("    SRV_KardexService           el kardex, el historico de inventario");
    N.push("    SRV_ExistenciasService     las existencias");
    N.push("    SRV_CatalogosService        tallas, colores y categorias");
    N.push("    SRV_ReportesVozService      CU32 entero");
    N.push("    SRV_RecomendacionesService");
    N.push("    SRV_ScoringService          el scoring del recommender");
    N.push("    SRV_PreferenciasService");
    N.push("    SRV_StorageService");
    N.push("    SRV_EmailService, SRV_JWTService, SRV_SeguridadService");
    N.push("    y SRV_AuditoriaService, que es el que consulta");
    N.push("");
    N.push("  O sea que el modulo de inventario, el mas grande del proyecto, no deja ni un solo");
    N.push("  rastro. Se puede borrar una talla, cambiar un color o mover el kardex, y la");
    N.push("  bitacora no se entera. Y el caso se llama 'Consultar Bitacora de Auditoria', con");
    N.push("  un indice llamado idx_bitacora_fecha y un permiso llamado ver_auditoria. Suena a");
    N.push("  que cubre el sistema entero. Cubre 19 modulos de 31.");
    N.push("");
    N.push("EL HALLAZGO 2: HAY DOS CAMINOS PARA ESCRIBIR LA BITACORA");
    N.push("");
    N.push("  CAMINO 1, el servicio, L14-39 de SRV_BitacoraService. 19 ficheros, 54 llamadas,");
    N.push("  con mapeo de campos y firma de 8 parametros.");
    N.push("");
    N.push("  CAMINO 2, con SQL escrito a mano:");
    N.push("");
    N.push("    SRV_ReportesVozService L447   INSERT INTO bitacora_auditoria");
    N.push("");
    N.push("  Y un tercer caso, al reves: SRV_ComprobantesService L227 hace un FROM");
    N.push("  bitacora_auditoria con su propio SELECT, sin pasar por el servicio.");
    N.push("");
    N.push("  Con una capa centralizada, ninguna de las dos cosas podria pasar. No habria forma");
    N.push("  de escribir sin pasar por ahi. Es el argumento a favor de no saltarse la capa,");
    N.push("  y el proyecto la tiene.");
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  La bitacora la escriben 19 de los 31 servicios. El modulo de inventario entero,");
    N.push("     que es el mas grande, no registra nada.");
    N.push("  2  Hay dos caminos para escribirla y uno para leerla: ReportesVoz L447 y");
    N.push("     Comprobantes L227 se saltan el servicio con SQL propio.");
    N.push("  3  El CSV no tiene tope de filas, a diferencia de la consulta normal, que sí lo");
    N.push("     tiene en el servidor. Y el escapado solo dobla comillas, no escapa comas.");
    N.push("  4  detalle y user_agent se piden a la base y no se devuelven. detalle es la");
    N.push("     columna que guarda el motivo de cada operacion, y es la que no se ve.");
    N.push("  5  No hay boton de buscar: se recarga con cada tecla, y cada GET hace dos");
    N.push("     consultas. El filtro de texto con ILIKE no puede usar indice.");
    N.push("  6  El permiso se comprueba por el getter de roles[0], por quinta vez en el");
    N.push("     proyecto. Quien tenga ver_auditoria en el segundo rol no puede ver nada.");
    N.push("  7  id_usuario es ON DELETE SET NULL, lo cual esta bien, pero no se guarda el");
    N.push("     email: un LOGIN_FAILED con correo inexistente deja tres filas identicas.");
    N.push("  8  Lo que si esta bien: es el unico caso que no escribe, la consulta se clona");
    N.push("     para el total y los datos, hay tope de 100 filas en el servidor, el ORDER BY");
    N.push("     desempata por clave primaria, y el parseJson del mapper es a prueba de json");
    N.push("     corrupto.");
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  Este caso es la lectura de lo que escriben los otros siete. Las 54 llamadas a");
    N.push("  registrar estan en 19 ficheros, y CU01, CU02, CU04, CU05, CU06 y CU07 son seis de");
    N.push("  ellos. O sea que este diagrama es, literalmente, la vista de los otros seis.");
    N.push("");
    N.push("  Y el hallazgo 4 cierra un circle con CU06 y CU07. Alli el motivo de la baja se");
    N.push("  guardaba en la columna detalle, y aqui se descubre que detalle no se consulta.");
    N.push("  O sea que el motivo de una baja logica no es legible ni desde su propia");
    N.push("  pantalla, que no lo pinta, ni desde la bitacora, que no lo pide. Solo queda en");
    N.push("  la base de datos, y CU07 lo borra al rehabilitar.");
    N.push("");
    N.push("  El hallazgo 6 es el getter por quinta vez. En CU01 estaba en el login, en CU05");
    N.push("  decidia quien administra roles, en CU06 y CU07 era la ruta de autorizacion de la");
    N.push("  baja logica, y aqui decide quien puede ver el registro de todo lo que el sistema");
    N.push("  ha hecho. Es el defecto que mas veces ha salido en los ocho casos.");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU08 Secuencia", 0); } catch (e) { }
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
    T.push("CU08 - DIAGRAMA DE SECUENCIA - INFORME");
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
    msg = msg + "CU08 - Consultar Bitacora de Auditoria" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "UNICO CASO QUE SOLO LEE: 7 SELECT Y NINGUNA" + SALTO;
    msg = msg + "ESCRITURA. Por eso no necesita transaccion." + SALTO + SALTO;
    msg = msg + "PERO LA BITACORA LA ESCRIBEN 19 DE LOS 31" + SALTO;
    msg = msg + "SERVICIOS. El modulo de inventario entero no" + SALTO;
    msg = msg + "registra nada. Y detalle, que es donde esta el" + SALTO;
    msg = msg + "motivo de cada operacion, no se consulta." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU08 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU08 Secuencia", 0); } catch (e3) { }
}
