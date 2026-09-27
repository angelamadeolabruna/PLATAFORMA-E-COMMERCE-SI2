// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU06  Inhabilitar Empleado (Baja Logica)
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/admin/Usuarios.tsx                 713 lineas
//     web/src/lib/api.ts                               L1237-1251
//     api/src/main.ts                                  L22-43 ValidationPipe
//     api/src/modulos/seguridad/dependencias.ts        L15-65 JwtAuthGuard
//     api/src/modulos/seguridad/CTR_Empleados.ts       86 lineas
//     api/src/modulos/seguridad/SRV_EmpleadosService.ts 339 lineas
//     api/src/modulos/seguridad/SRV_AuthService.ts     L48-65, el login
//     api/src/modulos/seguridad/SRV_BitacoraService.ts L14-39
//     api/src/modulos/seguridad/CE_Modelos.ts          L49-56, L174-178
//     BASE DE DATOS/schema.sql                         L32-43 usuarios,
//                                                      L76-85 usuarios_empleados,
//                                                      L608-623 el trigger
//
//   Cada mensaje lleva la linea del fichero de la que sale.
//
// QUE HACE ESTE CASO, Y POR QUE ES EL MAS DELICADO DE LOS SEIS
//   La baja logica de un empleado son DOS escrituras en DOS tablas, y
//   aqui esta el problema: la segunda tabla, usuarios_empleados, es la
//   que de verdad decide si un empleado sigue contando en el proyecto.
//
//   fecha_baja se consulta en 7 sitios de 5 servicios, y 6 de esos 7
//   son la UNICA condicion que se aplica. Inventario, alertas, kardex,
//   reservas y ventasignes "este empleado es de esta sucursal" con
//   WHERE ue.usuario_id = $1 AND ue.fecha_baja IS NULL, y no miran
//   usuarios.estado para nada.
//
//   O sea que puesto usuarios.estado = 'Inactivo' NO es la baja. La
//   baja es la segunda sentencia, la de fecha_baja. Y esa segunda
//   sentencia va suelta: en las 339 lineas del servicio no hay ni una
//   transaccion, ni un queryRunner, ni un BEGIN.
//
//   39 mensajes. 10 lineas de vida. 7 van a la base de datos, 16 son
//   mensajes a si mismo y 6 son retornos.
//   9 guardas escritas entre corchetes, 9 puntos donde el codigo lanza
//   una excepcion y 7 codigos: 200, 400, 401, 403, 404, 409, 422 y 500.
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
var PAQ_NOMBRE = "CU06 Secuencia Baja Logica Empleado";
var DIAG_NOMBRE = "CU06 Inhabilitar Empleado Baja Logica";
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
    ["U", "ACTOR_Administrador", "Actor", "Lifeline", "Administrador", "quien da la baja", "Actor, no clase: es quien pulsa", "no es codigo, es la persona"],
    ["F", "Usuarios.tsx", "Object", "Lifeline", "Usuarios", "pantalla de empleados", "Boundary", "web/src/pages/admin/Usuarios.tsx, 713 lineas"],
    ["H", "api.ts", "Object", "Lifeline", "api", "cliente HTTP", "Boundary", "web/src/lib/api.ts, L1237-1251, dos metodos"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["P", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "validacion del DTO", "Control", "api/src/main.ts, L22-43, es global"],
    ["C", "CTR_Empleados", "Object", "Lifeline", "EmpleadosController", "cinco endpoints", "Control", "api/src/modulos/seguridad/CTR_Empleados.ts, 86 lineas"],
    ["S", "SRV_EmpleadosService", "Object", "Lifeline", "EmpleadosService", "toda la logica", "Control", "api/src/modulos/seguridad/SRV_EmpleadosService.ts, 339 lineas"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar()", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["M", "CE_Modelos", "Object", "Lifeline", "UsuarioEmpleado", "fecha_baja y motivo_baja", "Control", "api/src/modulos/seguridad/CE_Modelos.ts, L49-56 y L174-178"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "2 tablas, 1 bitacora y 1 trigger", "Entity", "schema.sql: usuarios, usuarios_empleados, bitacora_auditoria y el trigger de L608-623"]
];

// Los 39 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [
    [1, "U", "F", "1. abre /admin/usuarios   Roles... no: Usuarios.tsx, 713 lineas, tabla de 8 columnas", "S"],
    [2, "F", "F", "2. useEffect carga la lista   L438, con api.listarEmpleados() y api.listarSucursalesActivas() en paralelo", "S"],
    [3, "F", "H", "3. GET /api/v1/admin/empleados   api.ts L1146", "S"],
    [4, "H", "G", "4. GET con Authorization Bearer y credentials:'include'", "S"],
    [5, "G", "D", "5. SELECT usuarios WHERE id_usuario = :sub   L44.   Una consulta por peticion, en el guard", "S"],
    [6, "G", "G", "6. [estado != 'activo'] 401 'Tu cuenta esta deshabilitada. Contacta al administrador.'   L49-51", "S"],
    [7, "C", "S", "7. listarEmpleados( currentUser )   CTR_Empleados.ts L41", "S"],
    [8, "S", "D", "8. SELECT usuarios LEFT JOIN usuarios_empleados LEFT JOIN usuarios_roles LEFT JOIN roles   L73-81", "S"],
    [9, "S", "S", "9.WHERE u.id_usuario != :excludeId con excludeId = 1.   El usuario 1 no aparece nunca   L79", "S"],
    [10, "S", "S", "10. sucursal_nombre: null, escrito a mano.   La consulta no une con sucursales   L90", "S"],
    [11, "S", "C", "11. EmpleadoItem[] con id_usuario, email, rol, estado y ultimo_login.   Sin fecha_baja   L83-95", "A"],
    [12, "C", "H", "12. la lista de empleados", "A"],
    [13, "H", "F", "13. setEmpleados   L438.   El estado viaja como texto plano desde la base de datos", "A"],
    [14, "F", "F", "14. ESTADO_COLORES tiene tres claves: Pendiente, Activo e Inactivo   L26-30", "S"],
    [15, "F", "F", "15. el boton sale del estado: 'Activo' da Deshabilitar, 'Inactivo' da Rehabilitar, y cualquier otro da un guion   L634-659", "S"],
    [16, "F", "F", "16. el admin pulsa Deshabilitar, escribe un motivo opcional y confirma   L639-644, L252 y L301-321", "S"],
    [17, "F", "H", "17. PATCH /api/v1/admin/empleados/:id/deshabilitar   api.ts L1237-1245", "S"],
    [18, "H", "G", "18. PATCH con el cuerpo { motivo: motivo || undefined }   L1241", "S"],
    [19, "G", "D", "19. SELECT usuarios WHERE id_usuario = :sub   L44.   Otra vez, una consulta por peticion", "S"],
    [20, "G", "G", "20. [estado != 'activo'] 401.   El guard bloquea al que ya esta dado de baja, y tambien al que llama   L49-51", "S"],
    [21, "G", "P", "21. el guard no toca el cuerpo.   El motivo lo ve el pipe, que es global   main.ts L22-43", "S"],
    [22, "P", "P", "22. pero el @Body es un tipo de TypeScript, no una clase   CTR_Empleados L70.   Asi que no hay nada que validar", "S"],
    [23, "P", "C", "23. el cuerpo pasa tal cual, sin transformacion y sin validacion   main.ts L22-43", "S"],
    [24, "C", "S", "24. inhabilitarEmpleado( currentUser, id, request, body.motivo ?? null )   L74", "S"],
    [25, "S", "D", "25. SELECT usuarios LEFT JOIN usuarios_roles LEFT JOIN roles WHERE id_usuario = :id   L207-213", "S"],
    [26, "S", "S", "26. [no existe] 404 'Empleado no encontrado.'   L214-216", "S"],
    [27, "S", "S", "27. [es la propia cuenta] 400 'No puede deshabilitar su propia cuenta.'   L218-220", "S"],
    [28, "S", "S", "28. nombreRol = objetivo.rol?.nombre_rol   L222.   Ese .rol es el getter que devuelve roles[0]", "S"],
    [29, "S", "S", "29. [nombreRol === 'Administrador'] 403 'No puede deshabilitar al superadministrador.'   L223-225", "S"],
    [30, "S", "S", "30. motivoLimpio = motivo?.trim() ? motivo.trim() : null   L227", "S"],
    [31, "S", "M", "31. [el motivo no es texto] TypeError: motivo.trim is not a function, y sale un 500   L227.   Y motivo_baja es varchar(255)   CE_Modelos L177-178", "S"],
    [32, "S", "D", "32. UPDATE usuarios SET estado = 'Inactivo' WHERE id_usuario = :id AND LOWER(estado) = 'activo'   L229-235.   Escritura 1 de 3", "S"],
    [33, "S", "S", "33. [affected === 0] 409 'El empleado ya esta inactivo.'   L237-239", "S"],
    [34, "S", "D", "34. UPDATE usuarios_empleados SET fecha_baja = NOW(), motivo_baja = :motivo   L241-246.   La 2 de 3.   Esta es la que cuenta", "S"],
    [35, "S", "S", "35. entre la 1 y la 2 no hay transaccion.   Cero queryRunner en 339 lineas.   Si la 2 falla, el empleado esta Inactivo con fecha_baja NULL", "S"],
    [36, "S", "B", "36. registrar( id, 'UPDATE', 'usuarios', 'Empleado deshabilitado: ...', request, idUsuario, { estado: 'Activo' }, { estado: 'Inactivo', fecha_baja: 'NOW()', motivo } )   L248-257", "S"],
    [37, "B", "D", "37. INSERT INTO bitacora_auditoria con old_data y new_data   SRV_BitacoraService L27-38.   La 3 de 3", "A"],
    [38, "S", "C", "38. { detail: 'Empleado deshabilitado.' }   L259", "A"],
    [39, "C", "U", "39. Toast de exito y recarga de la lista.   O Toast de error con el 409, el 403 o el 500", "A"]
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. La baja de verdad es fecha_baja, y se escribe suelta", [
        "Este es el hallazgo gordo, y no se ve leyendo este caso: se ve",
        "cruzando con los otros cinco modulos que leen la columna.",
        "",
        "inhabilitarEmpleado hace DOS escrituras, en DOS tablas:",
        "",
        "  L229-235  UPDATE usuarios SET estado = 'Inactivo'",
        "  L241-246  UPDATE usuarios_empleados SET fecha_baja = NOW(),",
        "                              motivo_baja = :motivo",
        "",
        "Y la segunda es la que cuenta. fecha_baja se consulta en 7 sitios",
        "de 5 servicios, y en 6 de esos 7 es la UNICA condicion que se",
        "aplica. Ninguno mas mira usuarios.estado:",
        "",
        "  SRV_AjustesService.ts L78     fecha_baja IS NULL",
        "  SRV_AlertasService.ts L73     fecha_baja IS NULL",
        "  SRV_KardexService.ts L83      fecha_baja IS NULL",
        "  SRV_ReservasService.ts L216   fecha_baja IS NULL",
        "  SRV_ReservasService.ts L645   fecha_baja IS NULL",
        "  SRV_VentasService.ts L88      fecha_baja IS NULL",
        "",
        "Y ninguno de los seis se llama igual. Tres son sucursalEncargado,",
        "Ajustes L74, Alertas L69 y Kardex L79. Uno es sucursalDelEmpleado,",
        "Ventas L84. Y los dos de Reservas tienen otro nombre: alcanceSucursal",
        "L202 y exigirAlcanceSucursalReservas L631.",
        "",
        "Los seis contestan a la misma pregunta: DE QUE SUCURSAL ES ESTE",
        "EMPLEADO. Inventario, ajustes, alertas, kardex, reservas y ventas.",
        "",
        "El septimo, SRV_ReservasService L243, si mira las dos cosas:",
        "  ue.fecha_baja IS NULL AND LOWER(u.estado) = 'activo'",
        "",
        "Y no hay transaccion entre las dos escrituras. En las 339 lineas de",
        "SRV_EmpleadosService no hay un solo queryRunner, ni transaction,",
        "ni BEGIN. En el proyecto entero solo 4 ficheros tienen transacciones:",
        "Compras, Pagos, Reservas y Ventas. Este no es uno de ellos.",
        "",
        "O sea que si la segunda sentencia falla, el empleado queda con",
        "estado = 'Inactivo' y fecha_baja = NULL. No podra entrar, porque el",
        "guard y el login miran estado. Pero para inventario, alertas,",
        "kardex, reservas y ventas sigue siendo el encargado de su",
        "sucursal. Una baja a medias deja un empleado invisible para el",
        "login y vivo para la operacion."
    ]],
    ["2. El motivo no se valida en absoluto, y si no es texto da 500", [
        "El unico cuerpo de este caso que no tiene DTO.",
        "",
        "  CTR_Empleados.ts L70   @Body() body: { motivo?: string }",
        "",
        "Eso es un tipo de TypeScript, que desaparece al compilar. En tiempo",
        "de ejecucion no hay ninguna clase, asi que el ValidationPipe de",
        "main.ts L22-43 se lo salta: solo valida lo que tiene metadatos de",
        "clase, y un tipo anonimo no los tiene.",
        "",
        "whitelist: true, L24, tampoco ayuda, porque no hay lista blanca que",
        "aplicar. O sea que el motivo entra sin mirar.",
        "",
        "Y despues, L227:",
        "  const motivoLimpio = motivo?.trim() ? motivo.trim() : null;",
        "",
        "El ?. solo protege de null y de undefined. Si mandas un numero, un",
        "array o un objeto, motivo no es nulo, se busca .trim, no existe, y",
        "se llama. TypeError, y un 500.",
        "",
        "  PATCH /admin/empleados/7/deshabilitar   body: { \"motivo\": 123 }",
        "  -> 500",
        "",
        "Aparte, motivo_baja es VARCHAR(255), schema.sql L84, y no hay",
        "MaxLength en ninguna parte, asi que un motivo de 256 caracteres",
        "tambien revienta en el UPDATE, con un 500 y no con un 422.",
        "",
        "En el proyecto entero hay 3 cuerpos con tipo anonimo, y este es uno:",
        "  CTR_Empleados.ts L70     { motivo?: string }",
        "  CTR_ReportesVoz.ts L18   { texto?: string }",
        "  CTR_Auth.ts L55          { refresh_token?: string }",
        "",
        "Los otros casos de uso, CU02 a CU05, tienen DTO con decoradores."
    ]],
    ["3. La bitacora graba la fecha de baja como la palabra NOW", [
        "La tercera escritura es la auditoria, y graba mal la fecha.",
        "",
        "L244, la escritura real en la tabla, usa la funcion de Postgres:",
        "  .set({ fecha_baja: () => 'NOW()', motivo_baja: motivoLimpio })",
        "",
        "L256, la escritura en la bitacora, usa la cadena de texto:",
        "  { estado: 'Inactivo', fecha_baja: 'NOW()', ... }",
        "",
        "O sea que en usuarios_empleados hay una fecha, y en",
        "bitacora_auditoria.new_data hay la palabra NOW entrecomillada. Del",
        "registro de auditoria no se puede saber cuando se hizo la baja.",
        "Solo se sabe que se hizo.",
        "",
        "Y el motivo tambien cambia de nombre:",
        "  en la tabla, schema.sql L84   motivo_baja",
        "  en la bitacora, L256          motivo",
        "",
        "O sea que las dos copias de la misma fila no se llaman igual, y una",
        "de las dos no tiene fecha.",
        "",
        "Lo que si esta bien es el resto del rastro. L252 mete el email del",
        "empleado y el motivo en el texto, y L255-256 mete el estado antes y",
        "despues en old_data y new_data, que es lo que hace que se pueda",
        "reconstruir la baja. CU05 hacia lo mismo con el array de permisos,",
        "y lo hacia mejor, porque copiaba el valor real con .slice().",
        "Aqui el estado anterior, L255, es un literal: { estado: 'Activo' }.",
        "Es cierto por el WHERE de L234, pero esta afirmado, no observado."
    ]],
    ["4. La proteccion del superadministrador usa el getter de roles[0]", [
        "La unica proteccion de un administrador real, y se apoya en la",
        "suposicion mas frágil del proyecto.",
        "",
        "  SRV_EmpleadosService L222",
        "    const nombreRol = objetivo.rol?.nombre_rol ?? null;",
        "  L223",
        "    if (nombreRol === 'Administrador') { throw 403 }",
        "",
        "Ese .rol es el getter de CE_Modelos L76-81:",
        "",
        "  get rol(): Rol | null {",
        "    if (this.roles && this.roles.length > 0) return this.roles[0].rol;",
        "    return null;",
        "  }",
        "",
        "O sea que la comprobacion mira UN rol, el primero, y sin ORDER BY.",
        "El resto no existe para esta comprobacion.",
        "",
        "Y la consulta que lo carga, L207-213, tampoco ordena:",
        "  leftJoinAndSelect('u.roles', 'roles')",
        "  leftJoinAndSelect('roles.rol', 'rol')",
        "Que rol salga primero lo decide Postgres, no el codigo.",
        "",
        "La tabla usuarios_roles tiene PRIMARY KEY (id_usuario, id_rol),",
        "schema.sql L48, o sea que el modelo ADMITE varios roles por",
        "usuario. Con dos roles, si el Administrador no es el primero, la",
        "proteccion no salta y se puede dar de baja a un administrador de",
        "verdad.",
        "",
        "Hoy no pasa, y hay que decirlo: por el hallazgo 1 de CU05 no",
        "existe ningun endpoint para asignar un rol, asi que un empleado",
        "solo tiene el que le puso su alta, CU04 L153. La proteccion aguanta",
        "porque la tabla esta vacia de casos, no porque sea correcta.",
        "",
        "La otra proteccion es una constante magica, L79:",
        "  .where('u.id_usuario != :excludeId', { excludeId: 1 })",
        "El usuario 1 no sale en la lista, y por eso no se le puede dar de",
        "baja desde la pantalla. Es el mismo ROL_ADMIN_ID = 1 de CU05."
    ]],
    ["5. El trigger de los 5 intentos nunca se dispara, y su estado no tiene salida", [
        "El hallazgo que ya se vio en CU01, aqui con la causa completa.",
        "",
        "HAY DOS MECANISMOS DE BLOQUEO COMPITIENDO, y no encajan.",
        "",
        "El A, el de la aplicacion, SRV_AuthService L60-68:",
        "  L61  usuario.intentos_fallidos = (usuario.intentos_fallidos ?? 0) + 1",
        "  L62  if (usuario.intentos_fallidos >= 5) {",
        "  L63    usuario.bloqueado_hasta = new Date(Date.now() + 15 minutos)",
        "  L64    usuario.intentos_fallidos = 0",
        "  L66  await save(usuario)",
        "",
        "El B, el de la base de datos, schema.sql L608-623:",
        "  BEFORE UPDATE OF intentos_fallidos ON usuarios",
        "  IF NEW.intentos_fallidos >= 5 THEN",
        "    NEW.estado = 'Bloqueado'",
        "    NEW.bloqueado_hasta = NOW() + INTERVAL '15 minutes'",
        "    NEW.intentos_fallidos = 0",
        "",
        "L64 pone el contador a cero ANTES del save de L66. O sea que a la",
        "base de datos le llega un 0, y el trigger ve NEW.intentos_fallidos",
        "= 0. La condicion 0 >= 5 es falsa. El trigger NO se dispara nunca.",
        "",
        "intentos_fallidos se escribe en 5 sitios del proyecto, y los 5 son",
        "de SRV_AuthService: L61, L64, L71, L305 y L366. No hay ninguna otra",
        "escritura en el proyecto entero, asi que no hay forma de que el",
        "trigger llegue a ver un 5.",
        "",
        "Lo que si funciona es el A, y bien: L53 comprueba bloqueado_hasta,",
        "devuelve un 423 con un mensaje claro, y a los 15 minutos se",
        "cumple solo. Es el mecanismo bueno. El B es codigo muerto.",
        "",
        "PERO SI ALGUIEN LO ACTIVARA, el estado que crea no tiene salida:",
        "",
        "  - autenticar L48 comprueba estado ANTES que bloqueado_hasta, y",
        "    devuelve un 401 genérico, no el 423 con el mensaje bueno",
        "  - rehabilitarEmpleado L286 exige LOWER(estado) = 'inactivo', y",
        "    un Bloqueado no lo es, o sea que da 409",
        "  - el boton de la pantalla, L634 y L646, solo tiene casos para",
        "    'Activo' e 'Inactivo'. Un Bloqueado cae en el guion de L659",
        "  - ESTADO_COLORES, L26-30, no tiene la clave Bloqueado",
        "",
        "O sea que 'Bloqueado' seria un estado absorbente: ni boton, ni",
        "endpoint, ni 423. Solo un UPDATE a mano lo saca. Y el campo",
        "bloqueado_hasta, que el trigger si rellena, no lo lee nadie mas",
        "que L53."
    ]],
    ["6. El motivo de la baja no se puede volver a leer en ninguna parte", [
        "El admin escribe un motivo con cuidado y no lo vuelve a ver nunca.",
        "",
        "Se escribe en la tabla, L244:",
        "  UPDATE usuarios_empleados SET motivo_baja = :motivo",
        "",
        "Y en la bitacora, L252, dentro del texto del detalle.",
        "",
        "Pero del otro lado, en la lectura:",
        "",
        "  - listarEmpleados, L83-95, devuelve 11 campos y fecha_baja y",
        "    motivo_baja no estan entre ellos",
        "  - la interface EmpleadoItem, api.ts L132-144, no los declara",
        "  - la tabla de la pantalla tiene 8 columnas, L565-572, y ninguna",
        "    es de sucursal ni de baja",
        "  - en TODO el frontend, fecha_baja y motivo_baja aparecen 0 veces",
        "",
        "O sea que la unica copia legible del motivo esta en el texto de",
        "bitacora_auditoria, y la fecha de esa copia es la palabra NOW, por",
        "el hallazgo 3. El motivo se puede leer. La fecha, no.",
        "",
        "Y hay un detalle de la misma familia: L90",
        "  sucursal_nombre: null,",
        "Esta escrito a mano, siempre null. La consulta de L73-81 no une",
        "con sucursales, y la interfaceEmpleadoItem declara el campo en",
        "L139. La tabla no lo pintaba, asi que no se ve, pero es un campo",
        "que el backend announces y no cumple."
    ]],
    ["7. Rehabilitar no limpia el bloqueo, y no mira quien es", [
        "La operacion inversa, que el caso de uso no menciona pero que esta",
        "en la misma pantalla y en el mismo endpoint.",
        "",
        "  PATCH /admin/empleados/:id/rehabilitar   CTR_Empleados L77-84",
        "",
        "Tres cosas que le faltan, de menos a mas gordas:",
        "",
        "  1. NO LIMPIA EL BLOQUEO. L281-298 pone estado = 'Activo' y",
        "     limpia fecha_baja y motivo_baja, pero no toca",
        "     intentos_fallidos ni bloqueado_hasta. Y L53 del login sigue",
        "     leyendo bloqueado_hasta. O sea que un empleado al que se dio",
        "     de baja con un bloqueo de 15 minutos vivo, y al rehabilitarlo",
        "     sigue esperando el resto del bloqueo. El logout de L306 y el",
        "     reset de contraseña de L367 si lo limpian. Esta no.",
        "",
        "  2. NO COMPRUEBA EL ROL. L272-279 solo carga el usuario por id,",
        "     sin roles, y no repite la comprobacion de L223. Asimétrico:",
        "     no se puede dar de baja a un Administrador, pero eso es",
        "     asimetrico en el otro sentido, rehabilitar es menos",
        "     protegido que dar de baja, no mas.",
        "",
        "  3. NO ES IDEMPOTENTE NI DE GRACIA. L281-287 exige",
        "     LOWER(estado) = 'inactivo' y si no, 409 'El empleado no se",
        "     encuentra inactivo.' O sea que rehabilitar a un empleado que",
        "     ya esta activo es un error, no un no-op. Es defendible, pero",
        "     hay que saberlo.",
        "",
        "Y por cierto: el caso de uso se llama 'Inhabilitar Empleado (Baja",
        "Logica)' y rehabilitar no aparece por ningun lado. Es la segunda",
        "mitad del mismo endpoint, en la misma pantalla, y no la menciona."
    ]],
    ["8. Lo que si esta bien: el estado se comprueba en los tres sitios", [
        "Esto es lo que hace que la baja funcione, y hay que decirlo porque",
        "es la parte que un diagrama de baja logica suele_no tener.",
        "",
        "El estado se comprueba en los TRES puntos por los que puede colarse",
        "alguien, y en los tres se comprueba:",
        "",
        "  - el login, SRV_AuthService L48",
        "      if (usuario.estado.toLowerCase() !== 'activo') -> 401",
        "  - el guard de cada peticion, dependencias.ts L49",
        "      if (usuario.estado.toLowerCase() !== 'activo') -> 401",
        "  - el refresco de token, SRV_AuthService L140",
        "      if (usuario.estado.toLowerCase() !== 'activo') -> 401",
        "",
        "Lo tercero es lo importante. Si el refresco no mirara el estado, un",
        "empleado dado de baja podria renovar su token indefinidamente. Y lo",
        "mira. Por eso el caso funciona sin tocar la blacklist: el token viejo",
        "sigue siendo criptograficamente valido hasta que caduca, pero cada",
        "peticion vuelve a leer el estado, y el refresh tambien.",
        "",
        "Y el WHERE de L234, LOWER(estado) = 'activo', con el",
        "if (affected === 0) de L237, hace la baja CONCURRENTE SEGURA: dos",
        "administradores que pulsan a la vez, el segundo se lleva un 409 y",
        "no un segundo UPDATE. Es un patron de concurrencia optimista",
        "escrito a mano, y esta bien.",
        "",
        "Ademas, lo que CU05 no tenia: el boton de la pantalla sale del",
        "estado de la fila, L634 y L646, y no de un permiso aparte. No se",
        "puede ver un boton que el backend va a rechazar.",
        "",
        "Y la pantalla separa los dos modales, L239 y L331, con su propio",
        "estado de envio y su propio error, L422-423 y L425-426. El fallo de",
        "dar de alta no pisa el de dar de baja."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU06."; } catch (e) { }
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
        try { o.Text = "CU06  Inhabilitar Empleado (Baja Logica)"; } catch (e) { }
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
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja. Este es el camino de dar de baja a un empleado. Lo que no se ve en el diagrama, y es el hallazgo 1, es que la baja son dos escrituras en dos tablas y la segunda va suelta: fecha_baja es la que de verdad decide si el empleado cuenta, en 7 consultas de 5 servicios."; } catch (e) { }
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
// LOS 39 MENSAJES
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
    N.push("CU06  Inhabilitar Empleado (Baja Logica).  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Administrador    «actor»     quien abre /admin/usuarios");
    N.push("    Usuarios.tsx           «boundary»  pages/admin/Usuarios.tsx, 713 lineas");
    N.push("    api.ts                 «boundary»  lib/api.ts, L1237-1251, dos metodos");
    N.push("    JwtAuthGuard           «control»   dependencias.ts, L15-65");
    N.push("    ValidationPipe         «control»   main.ts, L22-43, es global");
    N.push("    CTR_Empleados          «control»   5 endpoints, 86 lineas");
    N.push("    SRV_EmpleadosService   «control»   339 lineas, cero transacciones");
    N.push("    SRV_BitacoraService    «control»   registrar(), la tercera escritura");
    N.push("    CE_Modelos             «control»   fecha_baja y motivo_baja, L174-178");
    N.push("    PostgreSQL             «entity»    usuarios, usuarios_empleados, bitacora_auditoria");
    N.push("                                         y el trigger de los 5 intentos");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes: 7 van a la base de datos, 16 son mensajes a si mismo y 6 son");
    N.push("  retornos. 9 llevan la guarda escrita entre corchetes, 9 son el punto donde el");
    N.push("  codigo lanza una excepcion, y aparecen 8 codigos: 200, 400, 401, 403, 404, 409,");
    N.push("  422 y 500.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("LO QUE SE DIBUJA: DOS ESCRITURAS EN DOS TABLAS");
    N.push("");
    N.push("  mensaje 32  UPDATE usuarios SET estado = 'Inactivo'            L229-235");
    N.push("  mensaje 34  UPDATE usuarios_empleados SET fecha_baja = NOW()  L241-246");
    N.push("  mensaje 37  INSERT INTO bitacora_auditoria                   L27-38");
    N.push("");
    N.push("  Entre la primera y la segunda no hay nada. En las 339 lineas de");
    N.push("  SRV_EmpleadosService no hay ni un queryRunner, ni transaction, ni BEGIN.");
    N.push("");
    N.push("EL HALLAZGO 1: LA BAJA DE VERDAD ES fecha_baja, Y ESTA SUELTA");
    N.push("");
    N.push("  fecha_baja se consulta en 7 sitios de 5 servicios, y en 6 de esos 7 es la");
    N.push("  UNICA condicion que se aplica. Ninguno mas mira usuarios.estado:");
    N.push("");
    N.push("    SRV_AjustesService.ts L78      fecha_baja IS NULL");
    N.push("    SRV_AlertasService.ts L73      fecha_baja IS NULL");
    N.push("    SRV_KardexService.ts L83       fecha_baja IS NULL");
    N.push("    SRV_ReservasService.ts L216    fecha_baja IS NULL");
    N.push("    SRV_ReservasService.ts L645    fecha_baja IS NULL");
    N.push("    SRV_VentasService.ts L88       fecha_baja IS NULL");
    N.push("");
    N.push("  Las seis estan en 4 metodos distintos: sucursalEncargado en Ajustes L74,");
    N.push("  Alertas L69 y Kardex L79, sucursalDelEmpleado en Ventas L84, y en Reservas");
    N.push("  alcanceSucursal L202 y exigirAlcanceSucursalReservas L631. La 7a consulta, la");
    N.push("  de emailsSucursal L238, es la unica que ademas mira LOWER(u.estado).");
    N.push("  seis contestan a la misma pregunta: DE QUE SUCURSAL ES ESTE EMPLEADO.");
    N.push("  Inventario, ajustes, alertas, kardex, reservas y ventas.");
    N.push("");
    N.push("  El septimo, SRV_ReservasService L243, si mira las dos cosas:");
    N.push("    ue.fecha_baja IS NULL AND LOWER(u.estado) = 'activo'");
    N.push("");
    N.push("  O sea que puesto usuarios.estado = 'Inactivo' NO es la baja. Si la segunda");
    N.push("  sentencia falla, el empleado no puede entrar, porque el guard y el login");
    N.push("  miran estado, pero para los cinco servicios sigue siendo el encargado de su");
    N.push("  sucursal. Invisible para el login y vivo para la operacion.");
    N.push("");
    N.push("EL HALLAZGO 5: EL TRIGGER DE LOS 5 INTENTOS NO SE DISPARA NUNCA");
    N.push("");
    N.push("  Hay dos mecanismos de bloqueo compitiendo, y no encajan.");
    N.push("");
    N.push("  El de la aplicacion, SRV_AuthService L60-68, pone el contador a 0 en L64");
    N.push("  ANTES del save de L66. A la base de datos le llega un 0.");
    N.push("");
    N.push("  El trigger, schema.sql L611, compara NEW.intentos_fallidos >= 5. Un 0 no");
    N.push("  cumple. Y intentos_fallidos se escribe en 5 sitios del proyecto, los 5 de");
    N.push("  SRV_AuthService: L61, L64, L71, L305 y L366. No hay otra escritura, asi que");
    N.push("  no hay forma de que el trigger llegue a ver un 5. Es codigo muerto.");
    N.push("");
    N.push("  El que si funciona es el de la aplicacion: L53 comprueba bloqueado_hasta,");
    N.push("  devuelve un 423 con mensaje claro, y a los 15 minutos se cumple solo.");
    N.push("");
    N.push("  PERO si el trigger llegara a dispararse, el estado que crea, 'Bloqueado', no");
    N.push("  tendria salida: autenticar L48 devuelve 401 antes de llegar al 423 de L53,");
    N.push("  rehabilitarEmpleado L286 exige 'inactivo' y da 409, el boton de L634 y L646");
    N.push("  cae en el guion de L659, y ESTADO_COLORES L26-30 no tiene la clave.");
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  La baja de verdad es fecha_baja, y se escribe en una segunda sentencia");
    N.push("     suelta, sin transaccion. La leen 7 consultas de 5 servicios y 6 no");
    N.push("     miran el estado. Una baja a medias deja al empleado vivo para la");
    N.push("     operacion e invisible para el login.");
    N.push("  2  El motivo no se valida: el @Body de L70 es un tipo de TypeScript, no una");
    N.push("     clase, asi que el ValidationPipe lo salta. Un motivo que no sea texto");
    N.push("     revienta con un 500 en el .trim de L227. Y no hay MaxLength para un");
    N.push("     VARCHAR(255).");
    N.push("  3  La bitacora graba la fecha de baja como la palabra NOW entrecomillada,");
    N.push("     y llama motivo a lo que en la tabla se llama motivo_baja. La escritura");
    N.push("     real si usa NOW(), pero la copia de auditoria no.");
    N.push("  4  La proteccion del superadministrador lee objetivo.rol, que es el getter");
    N.push("     de roles[0], sin ORDER BY. La tabla admite N roles. Hoy aguanta porque");
    N.push("     no existe endpoint para asignar roles, no porque sea correcta.");
    N.push("  5  El trigger de los 5 intentos nunca se dispara, porque L64 pone el");
    N.push("     contador a 0 antes del save. Y su estado, Bloqueado, no tendria salida.");
    N.push("  6  El motivo de la baja no se puede volver a leer: fecha_baja y motivo_baja");
    N.push("     aparecen 0 veces en todo el frontend, y no estan en EmpleadoItem.");
    N.push("  7  Rehabilitar no limpia intentos_fallidos ni bloqueado_hasta, no comprueba");
    N.push("     el rol, y da 409 si el empleado ya esta activo. El caso de uso no la");
    N.push("     menciona, y esta en la misma pantalla.");
    N.push("  8  Lo que si esta bien: el estado se comprueba en los tres puntos por los que");
    N.push("     puede colarse alguien, login, guard y refresco de token. Por eso la baja");
    N.push("     funciona sin tocar la blacklist. Y el WHERE con LOWER(estado) = 'activo'");
    N.push("     mas el if affected === 0 hacen la baja concurrente segura.");
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  El hallazgo 5 es el hallazgo de CU01, visto desde el otro lado. CU01 veia que");
    N.push("  el trigger era una puerta sin llave; aqui se ve por que: el otro mecanismo lo");
    N.push("  desactiva antes de que pueda hablar.");
    N.push("");
    N.push("  El hallazgo 4 es el getter de CU01 y CU04 y CU05, aparece por cuarta vez. En");
    N.push("  CU01 era un detalle del login, en CU05 decidia quien podia administrar roles, y");
    N.push("  aqui decide si se puede deshabilitar a un administrador de verdad.");
    N.push("");
    N.push("  Y el hallazgo 6 continua el de CU03, la pantalla que no existia: aqui la");
    N.push("  pantalla existe y esta bien, pero guarda un campo, sucursal_nombre, que el");
    N.push("  backend devuelve siempre a null, L90, y que ella no pinta.");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU06 Secuencia", 0); } catch (e) { }
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
    T.push("CU06 - DIAGRAMA DE SECUENCIA - INFORME");
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
    msg = msg + "CU06 - Inhabilitar Empleado (Baja Logica)" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "LA BAJA SON 2 ESCRITURAS SIN TRANSACCION." + SALTO;
    msg = msg + "La 2 es la que cuenta: fecha_baja la leen 7" + SALTO;
    msg = msg + "consultas de 5 servicios, y 6 no miran el estado." + SALTO + SALTO;
    msg = msg + "Y el trigger de los 5 intentos no se dispara nunca:" + SALTO;
    msg = msg + "L64 pone el contador a 0 antes del save." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU06 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU06 Secuencia", 0); } catch (e3) { }
}
