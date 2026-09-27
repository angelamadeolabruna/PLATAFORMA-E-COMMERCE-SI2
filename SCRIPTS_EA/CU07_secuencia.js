// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU07  Rehabilitar Empleado
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/admin/Usuarios.tsx                  713 lineas
//     web/src/lib/api.ts                                L1246-1251
//     api/src/main.ts                                   L22-43 ValidationPipe
//     api/src/modulos/seguridad/dependencias.ts         L15-65 JwtAuthGuard
//     api/src/modulos/seguridad/CTR_Empleados.ts        L77-84, cuatro lineas
//     api/src/modulos/seguridad/SRV_EmpleadosService.ts L262-312, 51 lineas
//     api/src/modulos/seguridad/SRV_AuthService.ts      L48-53, L63, el login
//     api/src/modulos/seguridad/SRV_BitacoraService.ts  L14-39
//     api/src/modulos/seguridad/CE_Modelos.ts           L174-178
//     BASE DE DATOS/schema.sql                          L32-43, L76-85
//
//   Cada mensaje lleva la linea del fichero de la que sale.
//
// QUE HACE ESTE CASO, Y POR QUE ES EL SIMETRICO DE CU06 QUE NO ES SIMETRICO
//   Es la operacion inversa de CU06, y se dibuja aparte porque no lo es.
//
//   CU06 da de baja: escribe usuarios.estado y usuarios_empleados.fecha_baja.
//   CU07 rehabilita: escribe usuarios.estado y pone fecha_baja a null.
//
//   O sea que las dos operaciones comparten la columna mas importante del
//   proyecto, y la comparten sin ninguna de las dos seEjecute en una
//   transaccion. En las 339 lineas de SRV_EmpleadosService no hay ni un
//   queryRunner, ni transaction, ni BEGIN.
//
//   Y hay un detalle que CU06 no sufria: aqui el fallo sale con un
//   mensaje de EXITO. Si la segunda escritura falla, el empleado queda
//   Activo, puede entrar, y las 6 consultas que buscan su sucursal por
//   fecha_baja IS NULL siguen sin devolverlo. Y el toast dice
//   "Empleado rehabilitado."
//
//   38 mensajes. 10 lineas de vida. 8 van a la base de datos, 15 son
//   mensajes a si mismo, 1 va al modelo y 6 son retornos.
//   7 guardas escritas entre corchetes, 7 puntos donde el codigo lanza
//   una excepcion y 6 codigos: 200, 401, 403, 404, 409 y 500.
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
var TOTAL_MSG = 38;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU07 Secuencia Rehabilitar Empleado";
var DIAG_NOMBRE = "CU07 Rehabilitar Empleado";
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
    ["U", "ACTOR_Administrador", "Actor", "Lifeline", "Administrador", "quien rehabilita", "Actor, no clase: es quien pulsa", "no es codigo, es la persona"],
    ["F", "Usuarios.tsx", "Object", "Lifeline", "Usuarios", "pantalla de empleados", "Boundary", "web/src/pages/admin/Usuarios.tsx, 713 lineas"],
    ["H", "api.ts", "Object", "Lifeline", "api", "cliente HTTP", "Boundary", "web/src/lib/api.ts, L1246-1251, un metodo"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["P", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "no tiene nada que validar", "Control", "api/src/main.ts, L22-43, es global"],
    ["C", "CTR_Empleados", "Object", "Lifeline", "EmpleadosController", "cuatro lineas", "Control", "api/src/modulos/seguridad/CTR_Empleados.ts, L77-84"],
    ["S", "SRV_EmpleadosService", "Object", "Lifeline", "EmpleadosService", "51 lineas", "Control", "api/src/modulos/seguridad/SRV_EmpleadosService.ts, L262-312"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar()", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["M", "CE_Modelos", "Object", "Lifeline", "UsuarioEmpleado", "las dos columnas que se borran", "Control", "api/src/modulos/seguridad/CE_Modelos.ts, L174-178"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "2 tablas y la bitacora", "Entity", "schema.sql: usuarios, usuarios_empleados y bitacora_auditoria"]
];

// Los 38 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [
    [1, "U", "F", "1. abre /admin/usuarios.   La lista sale con los estados ya cargados, y el boton depende de ellos", "S"],
    [2, "F", "F", "2. useEffect carga la lista con api.listarEmpleados() y api.listarSucursalesActivas()   L438", "S"],
    [3, "F", "H", "3. GET /api/v1/admin/empleados   api.ts L1146", "S"],
    [4, "H", "G", "4. GET con Authorization Bearer y credentials:'include'", "S"],
    [5, "G", "D", "5. SELECT usuarios WHERE id_usuario = :sub   L44", "S"],
    [6, "G", "G", "6. [estado != 'activo'] 401 'Tu cuenta esta deshabilitada.'   L49-51", "S"],
    [7, "C", "S", "7. listarEmpleados( currentUser )   CTR_Empleados.ts L41", "S"],
    [8, "S", "D", "8. SELECT usuarios LEFT JOIN usuarios_empleados LEFT JOIN usuarios_roles LEFT JOIN roles   L73-81", "S"],
    [9, "S", "S", "9. WHERE u.id_usuario != :excludeId con excludeId = 1.   El superadmin no sale en la lista   L79", "S"],
    [10, "S", "C", "10. EmpleadoItem[] con 11 campos.   Ni fecha_baja ni motivo_baja vienen   L83-95", "A"],
    [11, "C", "H", "11. la lista de empleados", "A"],
    [12, "H", "F", "12. setEmpleados   L438", "A"],
    [13, "F", "F", "13. el boton sale del estado: L646, solo el caso 'Inactivo' lo enseña.   Cualquier otro estado da un guion   L659", "S"],
    [14, "F", "F", "14. ModalConfirmarRehabilitar   L331-343.   No pide motivo, a diferencia del de la baja, que lo pide en L252", "S"],
    [15, "F", "F", "15. el admin confirma.   Este boton si tiene disabled={enviando}   L394", "S"],
    [16, "F", "H", "16. PATCH /api/v1/admin/empleados/:id/rehabilitar   api.ts L1246-1249", "S"],
    [17, "H", "G", "17. PATCH con method:'PATCH' y nada mas.   Sin body y sin Content-Type   L1247-1248", "S"],
    [18, "G", "D", "18. SELECT usuarios WHERE id_usuario = :sub   L44", "S"],
    [19, "G", "G", "19. [estado != 'activo'] 401.   El guard mira el estado del que rehabilita, no del que se rehabilita   L49-51", "S"],
    [20, "G", "P", "20. el guard no toca el cuerpo.   Aqui no hay cuerpo   main.ts L22-43", "S"],
    [21, "P", "P", "21. y el pipe no tiene nada que validar.   El controlador de este endpoint no lleva @Body   CTR_Empleados L77-84", "S"],
    [22, "P", "C", "22. la peticion sigue igual de vacia.   A diferencia de CU06, aqui no hay ningun tipo anonimo que se escape   L22-43", "S"],
    [23, "C", "S", "23. rehabilitarEmpleado( currentUser, id, request )   L83.   Tres parametros, ninguno es el cuerpo", "S"],
    [24, "S", "D", "24. SELECT usuarios LEFT JOIN usuarios_roles LEFT JOIN roles WHERE id_usuario = :id   L52-60", "S"],
    [25, "S", "S", "25. return conRol?.rol?.permisos_json   L60.   El getter de roles[0], por tercera vez en este caso", "S"],
    [26, "S", "S", "26. [sin '*' ni 'gestionar_empleados'] 403 'No tienes permiso para gestionar usuarios.'   L268-270", "S"],
    [27, "S", "D", "27. SELECT usuarios WHERE id_usuario = :id   L272-276.   Sin join de roles, al contrario que en la baja", "S"],
    [28, "S", "S", "28. [no existe] 404 'Empleado no encontrado.'   L277-279", "S"],
    [29, "S", "S", "29. y aqui no se comprueba el rol del objetivo.   La baja si lo hace, en L222-225.   Las dos mitades cargan el usuario de forma distinta", "S"],
    [30, "S", "D", "30. UPDATE usuarios SET estado = 'Activo' WHERE id_usuario = :id AND LOWER(estado) = 'inactivo'   L281-287.   Escritura 1 de 3", "S"],
    [31, "S", "S", "31. [affected === 0] 409 'El empleado no se encuentra inactivo.'   L289-291.   O sea que no es idempotente", "S"],
    [32, "S", "D", "32. UPDATE usuarios_empleados SET fecha_baja = null, motivo_baja = null   L293-298.   La 2 de 3.   Esta destruye el motivo de la baja", "S"],
    [33, "S", "M", "33. las dos columnas que son el alma de la baja logica pasan a null   CE_Modelos L174-178   y en el esquema L83-84", "S"],
    [34, "S", "S", "34. no limpia intentos_fallidos ni bloqueado_hasta, y no hay transaccion con la 1.   Cero queryRunner en 339 lineas", "S"],
    [35, "S", "B", "35. registrar( id, 'UPDATE', 'usuarios', 'Empleado rehabilitado: ...', request, idUsuario, { estado: 'Inactivo' }, { estado: 'Activo' } )   L300-309", "S"],
    [36, "B", "D", "36. INSERT INTO bitacora_auditoria con old_data y new_data   SRV_BitacoraService L27-38.   La 3 de 3", "A"],
    [37, "S", "C", "37. { detail: 'Empleado rehabilitado.' }   L311", "A"],
    [38, "C", "U", "38. Toast de exito y recarga con void cargar()   L507-508.   O Toast de error con el 409", "A"]
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. Aqui el fallo sale con un mensaje de exito", [
        "Es el simetrico de CU06, y por eso hay que verlo aparte.",
        "",
        "Las dos operaciones tocan la misma columna y las dos van sueltas:",
        "",
        "  CU06  L229-235  UPDATE usuarios SET estado = 'Inactivo'",
        "        L241-246  UPDATE usuarios_empleados SET fecha_baja = NOW()",
        "",
        "  CU07  L281-287  UPDATE usuarios SET estado = 'Activo'",
        "        L293-298  UPDATE usuarios_empleados SET fecha_baja = null,",
        "                                   motivo_baja = null",
        "",
        "En SRV_EmpleadosService, 339 lineas, no hay ni un queryRunner, ni",
        "transaction, ni BEGIN. En el proyecto entero solo 4 ficheros tienen",
        "transacciones: Compras, Pagos, Reservas y Ventas.",
        "",
        "PERO aqui el daño es al reves que en CU06, y es peor de otra manera.",
        "",
        "En CU06, si la segunda escritura fallaba, el empleado quedaba",
        "Inactivo con fecha_baja NULL: no podia entrar, y se notaba. En CU07,",
        "si la segunda escritura falla, el empleado queda ACTIVO con",
        "fecha_baja puesta. O sea que:",
        "",
        "  - puede entrar, porque el login L48 y el guard L49 miran estado",
        "  - puede renovar su token, porque el refresh L140 tambien lo mira",
        "  - y no le sale de la lista de 6 consultas que piden",
        "    ue.fecha_baja IS NULL, o sea que no tiene sucursal asignada",
        "",
        "Y el toast de L507 dice 'Empleado rehabilitado.', y la pantalla se",
        "recarga con void cargar() en L508, y el estado se ve Activo. O sea",
        "que el unico sintoma es que el empleado no ve su propia sucursal en",
        "inventario, ajustes, alertas, kardex, reservas ni ventas, y no hay",
        "ningun mensaje que lo explique.",
        "",
        "Ademas, la bitacora de L300-309 no llega a escribirse, porque esta",
        "detras de la segunda sentencia. Asi que tampoco queda rastro."
    ]],
    ["2. Rehabilitar borra el motivo de la baja, y no lo deja en ninguna parte", [
        "La segunda escritura no pone fecha_baja a null: BORRA el motivo.",
        "",
        "  L296  .set({ fecha_baja: null, motivo_baja: null })",
        "",
        "O sea que la unica copia estructurada de POR QUE se dio de alta",
        "alguien desaparece al reincorporarlo. Y la columna es",
        "motivo_baja VARCHAR(255), schema.sql L84, nullable.",
        "",
        "Donde queda el motivo despues de rehabilitar:",
        "",
        "  - en usuarios_empleados.motivo_baja   ya no esta, es null",
        "  - en la respuesta de listarEmpleados   nunca estuvo, L83-95",
        "  - en la interface EmpleadoItem         no lo declara, L132-144",
        "  - en el frontend                       aparece 0 veces",
        "  - en la pantalla                       8 columnas, ninguna de baja",
        "",
        "Solo queda dentro del texto libre de bitacora_auditoria, el detalle",
        "que CU06 escribio en L252:",
        "",
        "  Empleado deshabilitado: gutierrez@... — motivo: conducta",
        "",
        "O sea que sobrevive como prosa dentro de un campo detalle, no como",
        "un dato. Y eso que la pantalla de auditoria, que si existe, enseña",
        "el detalle, pero no puede filtrar por motivo ni contarlo.",
        "",
        "Y hay un remate: la entrada de bitacora de ESTA operacion, L307-308,",
        "graba",
        "",
        "  { estado: 'Inactivo' }   ->   { estado: 'Activo' }",
        "",
        "y no menciona para nada que se han puesto a null las dos columnas",
        "de la baja logica. O sea que del rastro de auditoria no se puede",
        "saber que el motivo se borro. Solo se ve que el estado cambio."
    ]],
    ["3. No limpia el bloqueo, y el login puede seguir dando 423", [
        "Rehabilitar pone el estado a Activo y no toca nada mas. Entre lo",
        "que no toca estan las dos columnas del bloqueo por intentos.",
        "",
        "  usuarios.intentos_fallidos   INT DEFAULT 0      schema.sql L38",
        "  usuarios.bloqueado_hasta     TIMESTAMP          schema.sql L39",
        "",
        "Y el login las lee, SRV_AuthService L53:",
        "",
        "  if (usuario.bloqueado_hasta && usuario.bloqueado_hasta > new Date())",
        "    throw new HttpException('Cuenta temporalmente bloqueada. Intenta",
        "      en unos minutos.', HttpStatus.LOCKED);",
        "",
        "COMO SE LLEGA A ESTE ESTADO, paso a paso, y es alcanzable:",
        "",
        "  1. el empleado falla 5 contrasenas. L63 pone bloqueado_hasta",
        "     a ahora mas 15 minutos, y L64 pone el contador a 0. Ni el",
        "     estado ni el contador se tocan, asi que sigue Activo",
        "  2. un administrador le da de baja. estado pasa a Inactivo. El",
        "     bloqueado_hasta sigue en el futuro, porque nadie lo limpia",
        "  3. antes de que pasen 15 minutos, el mismo administrador le",
        "     rehabilita. estado vuelve a Activo",
        "  4. el empleado intenta entrar. L48 pasa, porque Activo. L53",
        "     dice que la cuenta esta bloqueada. 423.",
        "",
        "Y el toast ya habia dicho 'Empleado rehabilitado.'",
        "",
        "El caso de los intentos_fallidos es mas suave pero tambien real:",
        "un empleado con 4 intentos fallidos al que se da de baja y se",
        "rehabilita conserva el 4, y le quedan dos intentos antes de un",
        "bloqueo nuevo. El contador de CU06 tampoco se toca al dar de alta.",
        "",
        "LO QUE SI LIMPIA LAS DOS COLUMNAS, para comparar:",
        "  SRV_AuthService L72    login correcto",
        "  SRV_AuthService L306   logout",
        "  SRV_AuthService L367   reset de contrasena",
        "",
        "O sea que cerrar sesion o cambiar la contrasena desbloquea, y",
        "rehabilitar no."
    ]],
    ["4. Este endpoint solo conoce una palabra: inactivo", [
        "El sistema tiene cuatro estados posibles en usuarios.estado y este",
        "endpoint maneja uno.",
        "",
        "Lo que hay en el proyecto, con su sitio:",
        "",
        "  'Pendiente'   SRV_EmpleadosService L139, al dar de alta un empleado",
        "  'Activo'      SRV_ClienteService L44, al registrar un cliente",
        "                SRV_EmpleadosService L284, aqui",
        "  'Inactivo'    SRV_EmpleadosService L232, en la baja de CU06",
        "  'Bloqueado'   schema.sql L612, dentro del trigger",
        "",
        "Y el WHERE de L286 dice:",
        "",
        "  .where('id_usuario = :id', { id: idUsuario })",
        "  .andWhere(\"LOWER(estado) = 'inactivo'\")",
        "",
        "O sea que soloInactivo entra. Los otros dos dan 409:",
        "",
        "  un empleado en 'Pendiente'   409, y no puede entrar nunca, porque",
        "                                 el login L48 exige Activo",
        "  un empleado en 'Bloqueado'   409, aunque su bloqueado_hasta ya",
        "                                 haya pasado",
        "",
        "Y la pantalla es igual de estricta. L646 solo pinta el boton para",
        "'Inactivo', y el resto cae en el guion de L659. O sea que un",
        "empleado en Pendiente o en Bloqueado no ve ningun boton de accion.",
        "",
        "O sea que ESTE endpoint no es el inverso de los estados que el",
        "sistema puede dejar. El inverso de un bloqueo por intentos no",
        "existe, y el de un Pendiente, tampoco. Para dejar un empleado",
        "utilizable otra vez hay que pasar por el alta de CU04.",
        "",
        "Y con ESTADO_COLORES, L26-30, que tiene Pendiente, Activo e",
        "Inactivo pero no Bloqueado, un Bloqueado se pinta con el color de",
        "Inactivo, L623. O sea que en la pantalla un Bloqueado y un Inactivo",
        "se ven igual."
    ]],
    ["5. Las dos mitades de la pantalla cargan el usuario de forma distinta", [
        "El mismo usuario, en el mismo fichero, con dos consultas que no se",
        "parecen.",
        "",
        "LA BAJA, L207-213, carga los roles y mira el del objetivo:",
        "",
        "  .leftJoinAndSelect('u.roles', 'roles')",
        "  .leftJoinAndSelect('roles.rol', 'rol')",
        "  ...",
        "  const nombreRol = objetivo.rol?.nombre_rol ?? null;   L222",
        "  if (nombreRol === 'Administrador') throw 403;         L223-225",
        "",
        "LA REHABILITACION, L272-276, no carga nada:",
        "",
        "  .where('u.id_usuario = :id', { id: idUsuario })",
        "  .getOne()",
        "",
        "No hay join de roles, y no hay ninguna comprobacion del rol. Asi que",
        "rehabilitar es menos protegido que dar de baja.",
        "",
        "En este caso eso no abre un agujero, porque rehabilitar a un",
        "administrador es justamente lo que se quiere. Pero la asimetria",
        "existe, y tiene un efecto concreto: la unica forma de volver a",
        "poner Activo a un Administrador desde el backend es este endpoint,",
        "sin la red de seguridad que si tiene el otro.",
        "",
        "Lo que si es un problema real: cargarPermisos, L52-60, vuelve a",
        "usar el getter.",
        "",
        "  get rol(): Rol | null {",
        "    if (this.roles && this.roles.length > 0) return this.roles[0].rol;",
        "    return null;",
        "  }",
        "",
        "L60 devuelve conRol?.rol?.permisos_json. O sea que quien decide si",
        "puedes rehabilitar tiene el mismo juego de permisos que en los",
        "cinco casos anteriores, y la tabla usuarios_roles admite N roles",
        "por usuario, PRIMARY KEY (id_usuario, id_rol). Es la cuarta vez",
        "que el getter sale, y aqui es en la ruta de autorizacion."
    ]],
    ["6. El superadmin no sale en la lista, pero el endpoint si lo acepta", [
        "Una asimetria entre lo que se ve y lo que se puede hacer.",
        "",
        "listarEmpleados, L79:",
        "",
        "  .where('u.id_usuario != :excludeId', { excludeId: 1 })",
        "",
        "O sea que el usuario 1 no aparece en la tabla, y por eso no hay",
        "boton de Rehabilitar para el. Es el mismo excludeId = 1 magico que",
        "en CU05 es ROL_ADMIN_ID = 1, y que en la baja se combina con la",
        "comprobacion del rol de L223.",
        "",
        "PERO rehabilitarEmpleado, L281-287, no excluye a nadie:",
        "",
        "  .where('id_usuario = :id', { id: idUsuario })",
        "  .andWhere(\"LOWER(estado) = 'inactivo'\")",
        "",
        "Asi que un PATCH a mano a /admin/empleados/1/rehabilitar",
        "funciona, y rehabilita al superadmin si estuviera Inactivo. O sea",
        "que la API es mas capaz que la pantalla justo en el caso en que",
        "la pantalla haria falta.",
        "",
        "No es un agujero: rehabilitar es la operacion que menos peligro",
        "tiene de las siete, y solo un Administrador puede llegar aqui. Pero",
        "conviene decirlo porque el excludeId de L79 parece una proteccion y",
        "en realidad es solo un filtro de la lista. La proteccion de verdad",
        "esta en el permiso gestionar_empleados de L268, que es lo unico",
        "que comparte con la baja."
    ]],
    ["7. Lo que si esta bien: sin cuerpo no hay nada que validar", [
        "El problema de validacion de CU06, aqui no existe. Y no es casualidad:",
        "es que no hay cuerpo.",
        "",
        "  api.ts L1246-1249",
        "    await solicitar(url, { method: 'PATCH' })",
        "Ni body, ni headers, ni Content-Type. Solo el metodo.",
        "",
        "  CTR_Empleados.ts L77-84",
        "    @Patch('empleados/:id/rehabilitar')",
        "    async rehabilitarEmpleado(",
        "      @Param('id', ParseIntPipe) id: number,",
        "      @Req() request: Request,",
        "      @UsuarioActual() currentUser: Usuario,",
        "    )",
        "",
        "Tres parametros y ninguno es @Body. El ValidationPipe de main.ts",
        "L22-43 se encuentra con un objeto vacio y no tiene nada que hacer.",
        "Ni que validar, ni que limpiar con el whitelist de L24.",
        "",
        "Y el parametro de la ruta si pasa por ParseIntPipe, L80, o sea",
        "que un id que no sea un entero entero falla antes de llegar al",
        "servicio, con un 400. Eso si es validacion de verdad.",
        "",
        "Y el modal va en la misma linea. ModalConfirmarRehabilitar, L331-343,",
        "recibe empleado, enviando, error, alCerrar y alConfirmar. No recibe",
        "motivo, porque no hay ningun motivo que pedir. El de la baja si lo",
        "recibe, L250, porque el motivo si se guarda.",
        "",
        "O sea que el contrato entre pantalla, cliente y servidor esta",
        "completo y coherente en las tres capas. Es el unico endpoint de los",
        "siete de CTR_Empleados que esta asi."
    ]],
    ["8. Lo que si esta bien: el ciclo no necesita tocar ningun token", [
        "Esto es lo que hace que dar de alta y rehabilitar sea reversible de",
        "verdad, y es un acierto del diseno.",
        "",
        "El estado se comprueba en los tres puntos por los que alguien puede",
        "colarse, y en los tres se comprueba:",
        "",
        "  - el login,             SRV_AuthService L48   -> 401",
        "  - cada peticion,        dependencias.ts L49   -> 401",
        "  - el refresco de token, SRV_AuthService L140  -> 401",
        "",
        "Por eso no hace falta tocar la blacklist ni cerrar sesiones al dar",
        "de baja, ni al rehabilitar. El token de un empleado dado de baja",
        "sigue siendo criptograficamente valido hasta que caduca, pero cada",
        "peticion vuelve a leer el estado, y el refresh tambien. O sea que",
        "el acceso se corta en el acto y se devuelve en el acto, sin tocar",
        "una sola fila de token_blacklist.",
        "",
        "Eso tiene un coste, que es el hallazgo 3: el estado es lo unico que",
        "se guarda, y por eso el bloqueo por intentos se queda pegado. Pero",
        "el tradeoff esta bien hecho en lo esencial.",
        "",
        "Y el andWhere con el if del affected hace la escritura segura bajo",
        "concurrencia, otra vez, y esta vez con un efecto secundario molesto:",
        "",
        "  L286  .andWhere(\"LOWER(estado) = 'inactivo'\")",
        "  L289  if ((resultado.affected ?? 0) === 0) throw 409",
        "",
        "Dos administradores que pulsan a la vez, el segundo se lleva un 409",
        "en vez de un segundo UPDATE. Eso esta bien. Pero en la operacion",
        "inversa significa que el endpoint NO es idempotente: rehabilitar a",
        "alguien que ya esta activo es un error, no un no-op. Y la pantalla",
        "recarga con void cargar() en L508, asi que un reintento despues de",
        "un fallo de red muestra un error aunque la primera vez si haya",
        "funcionado.",
        "",
        "CU05 hacia lo mismo con el array de permisos y lo hacia mejor, con",
        "un .slice() del valor real en vez de un literal. Aqui el estado",
        "anterior de L307 es un literal, { estado: 'Inactivo' }. Es cierto",
        "por el WHERE de L286, pero esta afirmado, no observado."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU07."; } catch (e) { }
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
        try { o.Text = "CU07  Rehabilitar Empleado"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 700) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseno de caso de uso, seccion 3.3.2.1.  10 lineas de vida, 38 mensajes, 8 hallazgos."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja. Este es el camino de rehabilitar a un empleado, el simetrico de CU06. Lo que no se ve en el diagrama, y es el hallazgo 1, es que las dos escrituras van sueltas: si la segunda falla, el empleado queda Activo con fecha_baja puesta, no le sale ninguna sucursal, y el toast dice que ha ido bien."; } catch (e) { }
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
    N.push("CU07  Rehabilitar Empleado.  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Administrador    «actor»     quien abre /admin/usuarios");
    N.push("    Usuarios.tsx           «boundary»  pages/admin/Usuarios.tsx, 713 lineas");
    N.push("    api.ts                 «boundary»  lib/api.ts, L1246-1251, un metodo");
    N.push("    JwtAuthGuard           «control»   dependencias.ts, L15-65");
    N.push("    ValidationPipe         «control»   main.ts, L22-43, no tiene nada que hacer");
    N.push("    CTR_Empleados          «control»   L77-84, cuatro lineas y ningun @Body");
    N.push("    SRV_EmpleadosService   «control»   L262-312, 51 lineas, cero transacciones");
    N.push("    SRV_BitacoraService    «control»   registrar(), la tercera escritura");
    N.push("    CE_Modelos             «control»   fecha_baja y motivo_baja, L174-178");
    N.push("    PostgreSQL             «entity»    usuarios, usuarios_empleados, bitacora_auditoria");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes: 8 van a la base de datos, 15 son mensajes a si mismo, 1 va al");
    N.push("  modelo y 6 son retornos. 7 llevan la guarda escrita entre corchetes, 7 son el punto");
    N.push("  donde el codigo lanza una excepcion, y aparecen 6 codigos: 200, 401, 403, 404,");
    N.push("  409 y 500.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("LO QUE SE DIBUJA: LAS MISMAS DOS ESCRITURAS QUE CU06, AL REVES");
    N.push("");
    N.push("  mensaje 30  UPDATE usuarios SET estado = 'Activo'                   L281-287");
    N.push("  mensaje 32  UPDATE usuarios_empleados SET fecha_baja = null,        L293-298");
    N.push("                         motivo_baja = null");
    N.push("  mensaje 36  INSERT INTO bitacora_auditoria                        L27-38");
    N.push("");
    N.push("  Entre la primera y la segunda no hay nada. Cero queryRunner en las 339 lineas de");
    N.push("  SRV_EmpleadosService.");
    N.push("");
    N.push("EL HALLAZGO 1: AQUI EL FALLO SALE CON UN MENSAJE DE EXITO");
    N.push("");
    N.push("  Es el simetrico de CU06 y por eso se dibuja aparte. Las dos operaciones tocan");
    N.push("  la misma columna y las dos van sueltas. Pero el dano es al reves, y es peor de");
    N.push("  otra manera:");
    N.push("");
    N.push("  CU06, si la segunda falla   Inactivo con fecha_baja NULL. No puede entrar, y se");
    N.push("                              nota enseguida.");
    N.push("  CU07, si la segunda falla   ACTIVO con fecha_baja puesta. Puede entrar, puede");
    N.push("                              renovar token, y no le sale ninguna sucursal.");
    N.push("");
    N.push("  Y el toast de L507 dice 'Empleado rehabilitado.', la pantalla recarga con");
    N.push("  void cargar() en L508, y el estado se ve Activo. El unico sintoma es que no ve");
    N.push("  su sucursal en 6 consultas de 5 servicios, y no hay ningun mensaje que lo");
    N.push("  explique. Ademas la bitacora de L300-309 no llega a escribirse.");
    N.push("");
    N.push("EL HALLAZGO 3: NO LIMPIA EL BLOQUEO, Y EL LOGIN PUEDE SEGUIR DANDO 423");
    N.push("");
    N.push("  L281-298 pone estado a Activo y no toca intentos_fallidos ni bloqueado_hasta.");
    N.push("  Y el login los lee, SRV_AuthService L53. La secuencia para llegar:");
    N.push("");
    N.push("    1. el empleado falla 5 contrasenas. L63 pone bloqueado_hasta a ahora mas 15")
    N.push("       minutos, L64 pone el contador a 0, y el estado NO se toca");
    N.push("    2. un administrador le da de baja. estado pasa a Inactivo, y bloqueado_hasta")
    N.push("       sigue en el futuro porque nadie lo limpia")
    N.push("    3. antes de 15 minutos, le rehabilita. estado vuelve a Activo")
    N.push("    4. el empleado entra. L48 pasa, L53 dice que esta bloqueado. 423.");
    N.push("");
    N.push("  Y el toast ya habia dicho que habia funcionado. Lo que si limpia las dos columnas");
    N.push("  es el login correcto L72, el logout L306 y el reset de contrasena L367.");
    N.push("");
    N.push("  El caso de intentos_fallidos es mas suave: uno con 4 intentos al que se da de");
    N.push("  baja y se rehabilita conserva el 4, y le quedan dos antes de un bloqueo nuevo.");
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  Las dos escrituras van sueltas y aqui el fallo sale con un mensaje de exito:");
    N.push("     el empleado queda Activo sin sucursal y la pantalla dice que fue bien.");
    N.push("  2  Rehabilitar borra motivo_baja. La unica copia estructurada de por que se dio");
    N.push("     de baja desaparece, y solo queda como prosa en el detalle de la bitacora.");
    N.push("     La entrada de bitacora de L307-308 ni menciona las columnas que borro.");
    N.push("  3  No limpia intentos_fallidos ni bloqueado_hasta, y el login de L53 puede seguir");
    N.push("     dando 423 a un empleado que la pantalla acaba de rehabilitar.");
    N.push("  4  El endpoint solo conoce la palabra 'inactivo'. De los cuatro estados del");
    N.push("     sistema, Pending y Bloqueado dan 409 y no se pueden recuperar. Ademas un");
    N.push("     Bloqueado se pinta con el color de un Inactivo, porque ESTADO_COLORES L26-30");
    N.push("     no tiene esa clave y L623 cae en el color por defecto.");
    N.push("  5  La baja carga los roles y comprueba el del objetivo; la rehabilitacion no carga");
    N.push("     nada. Y cargarPermisos vuelve a usar el getter de roles[0], la cuarta vez.")
    N.push("  6  listarEmpleados L79 excluye al usuario 1, pero rehabilitarEmpleado L281-287 no")
    N.push("     excluye a nadie. La API es mas capaz que la pantalla en el caso que mas la")
    N.push("     necesitaria.");
    N.push("  7  Lo que si esta bien: sin cuerpo no hay nada que validar, y el ParseIntPipe si")
    N.push("     valida el id de la ruta con un 400. El unico de los siete endpoints de");
    N.push("     CTR_Empleados que esta asi. El modal tampoco pide motivo, y es coherente.");
    N.push("  8  Lo que si esta bien: el estado se comprueba en login, guard y refresh, asi que");
    N.push("     el ciclo baja/rehabilita no necesita tocar la blacklist ni cerrar sesiones.");
    N.push("     Y el andWhere con el if del affected hace la escritura segura bajo concurrencia,");
    N.push("     aunque por eso el endpoint no es idempotente.");
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  El hallazgo 1 es el espejo del hallazgo 1 de CU06. Alli el fallo hacia dano y se");
    N.push("  notaba; aqui el fallo sale con un toast de exito, que es peor porque no se nota.");
    N.push("");
    N.push("  Los hallazgos 2, 4 y 6 del bloque de CU06 son la otra cara de estos: alli se quejaba");
    N.push("  de que el motivo no se podia leer, y aqui de que directamente se borra.");
    N.push("");
    N.push("  El hallazgo 5 continua el getter de CU01, CU04 y CU05. En los tres estaba en el");
    N.push("  login o en la gestion de roles; aqui esta en la ruta de autorizacion de una baja");
    N.push("  logica, y por cuarta vez la consulta que lo carga no lleva ORDER BY.");
    N.push("");
    N.push("  Y CU06 y CU07 juntos son el unico caso de uso del proyecto que aparece con dos");
    N.push("  diagramas de secuencia, porque la operacion y su inversa no son el mismo camino:")
    N.push("  una pide un motivo y la otra no, una comprueba el rol del objetivo y la otra no,");
    N.push("  y una puede fallar con dano y la otra con un mensaje de exito.");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU07 Secuencia", 0); } catch (e) { }
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
    T.push("CU07 - DIAGRAMA DE SECUENCIA - INFORME");
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
    msg = msg + "CU07 - Rehabilitar Empleado" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "EL SIMETRICO DE CU06, QUE NO ES SIMETRICO." + SALTO;
    msg = msg + "Si la 2a escritura falla, el empleado queda Activo" + SALTO;
    msg = msg + "sin sucursal y el toast dice que ha ido bien." + SALTO + SALTO;
    msg = msg + "Y no limpia bloqueado_hasta: el login puede seguir" + SALTO;
    msg = msg + "dando 423 a un empleado recien rehabilitado." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU07 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU07 Secuencia", 0); } catch (e3) { }
}
