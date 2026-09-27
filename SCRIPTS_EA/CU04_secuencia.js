// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU04  Registrar Nuevo Empleado (Administrador, Encargado, Cajero)
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/admin/Usuarios.tsx              713 lineas
//     web/src/lib/api.ts                            L1228 registrarEmpleado
//     api/src/main.ts                               L22-43 ValidationPipe
//     api/src/modulos/seguridad/dependencias.ts     L15-65 JwtAuthGuard
//     api/src/modulos/seguridad/CTR_Empleados.ts    86 lineas
//     api/src/modulos/seguridad/SRV_EmpleadosService.ts   339 lineas
//     api/src/modulos/seguridad/SRV_SeguridadService.ts    L7-17
//     api/src/modulos/seguridad/SRV_EmailService.ts        L32-52
//     api/src/modulos/seguridad/SRV_BitacoraService.ts     L14-39
//     BASE DE DATOS/schema.sql                      51 tablas, 6 en este caso
//
//   Cada mensaje lleva la linea del fichero de la que sale.
//
// QUE HACE ESTE CASO Y POR QUE ES EL MAS GRAVE DE LOS CUATRO
//   Es el unico de los cuatro que tiene una pantalla Y un fallo que
//   deja al empleado sin poder entrar nunca.
//
//   El hallazgo 1 es una cadena de cinco pasos, y cada paso esta
//   comprobado en el codigo. El frontend manda la contrasena temporal
//   vacia, el DTO la deja pasar, el ?? no hace su trabajo, y lo que se
//   hashea es la cadena vacia. El generador de contrasenos aleatorios,
//   que existe y esta bien escrito, no se llama nunca en el camino
//   normal.
//
//   Y el hallazgo 2 dice que aunque se arreglara eso, el empleado sigue
//   sin poder entrar: nace en 'Pendiente', el correo no se envia, y no
//   hay ninguna accion de administrador que lo passe a 'Activo'.
//
//   38 mensajes. 11 lineas de vida. 12 van a la base de datos, 15 son
//   mensajes a si mismo y 3 son retornos.
//   5 guardas escritas entre corchetes, 6 puntos donde el codigo lanza
//   una excepcion y 6 codigos: 201, 400, 401, 403, 409 y 422.
//
// POR QUE ONCE LINEAS DE VIDA Y NO DIEZ
//   A diferencia de CU01, CU02 y CU03, aqui hacen falta once. Los tres
//   servicios del nucleo (SeguridadService, EmailService y
//   BitacoraService) participan los tres, y ademas el guard, el pipe, el
//   cliente HTTP y la pantalla. Quitar uno seria quitar un participante
//   real, y este diagrama ya tiene que|Se pierde la verdad. La cabecera
//   de la pagina mide 150 px y el paso es de 215, asi que entra igual.
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
// POR QUE NO HAY FRAGMENTOS alt NI loop
//   EA los dibuja con un elemento aparte que no se puede colocar por
//   script de forma fiable. La guarda va escrita en el mensaje, entre
//   corchetes al principio, que es la convencion UML admitida.
//
// Autorreparable. Una instruccion por linea. Sin continuaciones con +.
// Sin operadores ternarios. Ninguna excepcion escapa.
// ================================================================

var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var TOTAL_CAB = 11;
var TOTAL_MSG = 38;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU04 Secuencia Alta Empleado";
var DIAG_NOMBRE = "CU04 Registrar Nuevo Empleado";
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

// Las once cabeceras. clave, nombre, tipo, estereotipo, subtipo,
// cabecera corta, papel RUP, fichero real.
var CAB = [
    ["U", "ACTOR_Administrador", "Actor", "Lifeline", "Administrador", "quien da de alta", "Actor, no clase: es quien pulsa el boton", "no es codigo, es la persona"],
    ["F", "Usuarios.tsx", "Object", "Lifeline", "Usuarios", "modal de alta", "Boundary", "web/src/pages/admin/Usuarios.tsx, 713 lineas"],
    ["H", "api.ts", "Object", "Lifeline", "api", "cliente HTTP", "Boundary", "web/src/lib/api.ts, L1228 registrarEmpleado"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["P", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "validacion del DTO", "Control", "api/src/main.ts, L22-43, es global"],
    ["C", "CTR_Empleados", "Object", "Lifeline", "EmpleadosController", "POST /admin/empleados", "Control", "api/src/modulos/seguridad/CTR_Empleados.ts, 86 lineas"],
    ["S", "SRV_EmpleadosService", "Object", "Lifeline", "EmpleadosService", "registrarEmpleado()", "Control", "api/src/modulos/seguridad/SRV_EmpleadosService.ts, 339 lineas"],
    ["G2", "SRV_SeguridadService", "Object", "Lifeline", "SeguridadService", "hashearPassword()", "Control", "api/src/modulos/seguridad/SRV_SeguridadService.ts, L7-9"],
    ["E", "SRV_EmailService", "Object", "Lifeline", "EmailService", "enviarPrimeraContrasena()", "Control", "api/src/modulos/seguridad/SRV_EmailService.ts, L32-52"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar()", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "6 tablas", "Entity", "schema.sql: usuarios, roles, usuarios_roles, usuarios_empleados, first_password_tokens, bitacora_auditoria"]
];

// Los 38 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [
    [1, "U", "F", "1. abre /admin/usuarios y pulsa Nuevo Empleado   Usuarios.tsx L56", "S"],
    [2, "F", "F", "2. permisoOk = permisos incluye '*' o 'gestionar_empleados'   L429-432.   Sin el, no ve el boton", "S"],
    [3, "F", "F", "3. [contrasena temporal en blanco] el campo nace en '' y se manda tal cual   L83 y L106", "S"],
    [4, "F", "H", "4. registrarEmpleado({ nombre, email, telefono, sucursal_id, rol_nombre, password_temporal })   L100-107", "S"],
    [5, "H", "G", "5. POST /api/v1/admin/empleados   con Authorization Bearer y credentials:'include'", "S"],
    [6, "G", "D", "6. SELECT usuarios WHERE id_usuario = :sub   dependencias.ts L44", "S"],
    [7, "G", "G", "7. [estado <> 'activo'] 401 'Tu cuenta esta deshabilitada.'   L49-51", "S"],
    [8, "G", "P", "8. el guard NO mira permisos. El permiso lo comprueba el servicio, con su propia consulta", "S"],
    [9, "P", "P", "9. valida RegistrarEmpleadoRequest, que esta declarado en el CONTROLADOR, no en Esquemas.ts", "S"],
    [10, "P", "P", "10. nombre @IsString @IsNotEmpty, email @IsEmail, telefono @IsString @IsOptional   CTR_Empleados L8-32", "S"],
    [11, "P", "P", "11. [contrasena vacia] password_temporal es @IsString @IsOptional, y una cadena vacia NO es opcional", "S"],
    [12, "P", "P", "12.   L29-31.   Pasa. Y el ?? de L133 tampoco la descarta, porque '' no es null ni undefined", "S"],
    [13, "P", "C", "13. el cuerpo validado pasa al controlador   CTR_Empleados.ts L52", "S"],
    [14, "C", "C", "14. mapea el body a un RegistrarEmpleadoDTO a mano, campo por campo   L56-63", "S"],
    [15, "C", "S", "15. registrarEmpleado( currentUser, dto, request )   L64", "S"],
    [16, "S", "D", "16. cargarPermisos(): SELECT usuarios LEFT JOIN usuarios_roles LEFT JOIN roles   L53-59", "S"],
    [17, "S", "D", "17. y lee conRol.rol.permisos_json   L60.   Ese .rol es el getter que devuelve roles[0]", "S"],
    [18, "S", "S", "18. [sin '*' ni 'gestionar_empleados'] ForbiddenException 403   L104-105", "S"],
    [19, "S", "D", "19. SELECT usuarios WHERE LOWER(u.email) = :emailLimpio   L109-113", "S"],
    [20, "S", "S", "20. [ya existe] ConflictException 409 'Ya existe un usuario con este correo electronico.'   L114-116", "S"],
    [21, "S", "D", "21. SELECT sucursales WHERE id_sucursal = :id AND LOWER(estado) = 'activa'   L118-123", "S"],
    [22, "S", "S", "22. [no existe] HttpException 400 'La sucursal seleccionada no es valida.'   L124-126", "S"],
    [23, "S", "S", "23. [rol fuera de un array fijo de 3 en el codigo] 400 'El rol seleccionado no es valido'   L128-131", "S"],
    [24, "S", "S", "24. passwordTemporal = dto.password_temporal ?? generarPasswordTemporal()   L133", "S"],
    [25, "S", "G2", "25. hashearPassword( passwordTemporal )   L134", "S"],
    [26, "G2", "G2", "26. bcrypt.hash( password, 10 )   L8.   Si passwordTemporal es '', hashea la cadena vacia", "S"],
    [27, "S", "D", "27. INSERT usuarios ( email, password_hash, estado='Pendiente' )   L136-141.   Escritura 1 de 5", "S"],
    [28, "S", "D", "28. SELECT roles WHERE LOWER(nombre_rol) = LOWER(:nombre)   L143-147", "S"],
    [29, "S", "D", "29. [si el rol existe] INSERT usuarios_roles   L149-155.   Escritura 2 de 5, y es condicional", "S"],
    [30, "S", "D", "30. INSERT usuarios_empleados ( usuario_id, nombre, telefono, sucursal_id, rol )   L158-165.   La 3 de 5", "S"],
    [31, "S", "D", "31. SELECT NOW()::timestamp   L167.   La hora se pide al servidor, no al reloj del proceso", "S"],
    [32, "S", "D", "32. INSERT first_password_tokens ( usuario_id, token, expires_at +24h, used=false )   L169-175.   La 4 de 5", "S"],
    [33, "S", "E", "33. enviarPrimeraContrasena( emailLimpio, token )   L177", "S"],
    [34, "E", "E", "34. [EMAIL_ENABLED=false] escribe en el log y devuelve true   L36-40.   Con true, L100-102 hace throw", "S"],
    [35, "S", "B", "35. registrar( idAdmin, 'INSERT', 'usuarios', 'Empleado registrado: ... - rol: ...' )   L179-186", "S"],
    [36, "B", "D", "36. INSERT INTO bitacora_auditoria   L27-38.   Escritura 5 de 5", "A"],
    [37, "S", "C", "37. { detail, usuario_id }.   NO devuelve la contrasena temporal, nunca   L188-193", "A"],
    [38, "C", "U", "38. 201 Created.   El detalle dice que se envio un email, y con EMAIL_ENABLED=false no se envio ninguno", "A"]
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. La contrasena temporal vacia pasa las cinco capas y se hashea", [
        "Esta es la cadena mas larga del proyecto. Cada eslabon esta",
        "comprobado, y en ninguno se para.",
        "",
        "  1. El campo del modal nace vacio.",
        "     Usuarios.tsx L83:  useState('')",
        "     El campo es opcional, no tiene required, y su placeholder",
        "     L205 dice 'Tmp#xK2mQ9', que parece un ejemplo.",
        "",
        "  2. El modal manda el valor tal cual.",
        "     Usuarios.tsx L106:  password_temporal: passwordTemporal",
        "     Si el admin no lo toca, lo que viaja es ''.",
        "",
        "  3. El DTO lo deja pasar.",
        "     CTR_Empleados.ts L29-31:",
        "       @IsString()",
        "       @IsOptional()",
        "     @IsOptional de class-validator se salta null y undefined.",
        "     Una cadena vacia NO es ninguna de las dos cosas, asi que se",
        "     valida como @IsString y pasa.",
        "",
        "  4. El ?? no hace su trabajo.",
        "     SRV_EmpleadosService.ts L133:",
        "       dto.password_temporal ?? this.generarPasswordTemporal()",
        "     El ?? solo sustituye por la derecha cuando la izquierda es",
        "     null o undefined. '' no es ninguna de las dos. Si fuera ||, si.",
        "",
        "  5. Se hashea la cadena vacia.",
        "     L134:  hashearPassword('')  ->  bcrypt.hash('', 10)",
        "     Eso devuelve un hash VALIDO de la cadena vacia, y se guarda",
        "     en usuarios.password_hash.",
        "",
        "Resultado: generarPasswordTemporal, L330-337, no se llama nunca en",
        "el camino normal. El generador de contrasenos aleatorios esta",
        "escrito, funciona, y es codigo muerto.",
        "",
        "Lo que haria falta es un ||, o un chequeo explicito de que la",
        "cadena no este vacia. Es una palabra."
    ]],
    ["2. El empleado nace en Pendiente y no hay ninguna accion que lo", [
        "saque de ahi. Es un cierre permanente.",
        "",
        "El alta lo crea en 'Pendiente', L139. Y autenticar() L48 exige",
        "estado='activo', y JwtAuthGuard L49 tambien, en cada peticion.",
        "O sea que un empleado en 'Pendiente' no entra y no puede hacer",
        "nada.",
        "",
        "De las 51 tablas y de todo el proyecto, estado='Activo' sobre la",
        "tabla usuarios se pone en dos sitios, y ninguno es un boton de",
        "administracion:",
        "",
        "  SRV_ClienteService.ts L44        alta de cliente, CU02",
        "  SRV_AuthService.ts L365          establecerPrimeraContrasena()",
        "",
        "Y establecerPrimeraContrasena, que es el unico, necesita el token",
        "de first_password_tokens. Ese token solo viaja en el correo.",
        "",
        "Y el correo no se envia, que es el hallazgo 3 de CU02 y el mismo",
        "de aqui: con EMAIL_ENABLED=false, enviarPrimeraContrasena L36-40",
        "loguea y devuelve true sin mandar nada.",
        "",
        "Y la contrasena temporal, que era la salida de emergencia, no se",
        "devuelve en la respuesta: L188-193 solo trae detail y usuario_id.",
        "",
        "Y el boton de Rehabilitar no sirve, porque L286 exige",
        "LOWER(estado) = 'inactivo' y el empleado esta en 'Pendiente'.",
        "Devuelve 409, L290, con un texto que ademas no describe el caso.",
        "",
        "Y el de Deshabilitar tampoco: L234 exige 'activo', asi que un",
        "'Pendiente' da 409 con el texto 'El empleado ya esta inactivo.',",
        "L238, que es mentira: esta pendiente.",
        "",
        "O sea: el empleado se registra, Toast de exito, y no puede entrar",
        "nunca. El administrador no tiene ninguna accion que lo arregle."
    ]],
    ["3. El mensaje de exito es falso, y pide reenviar algo que no existe", [
        "La respuesta, L188-193, tiene dos textos:",
        "",
        "  emailOk   'Empleado X registrado. Se envio un email de",
        "            bienvenida.'",
        "  !emailOk  'Empleado X registrado. No se pudo enviar el email",
        "            (intenta reenviar la invitacion).'",
        "",
        "Con EMAIL_ENABLED=false, que es lo que hay en el .env L25 y en el",
        ".env.example L26, enviarPrimeraContrasena L36-40 escribe en el",
        "log y DEVUELVE TRUE. O sea que sale el primer texto: 'Se envio un",
        "email de bienvenida.' Y no se ha enviado ningun email.",
        "",
        "La segunda rama es codigo muerto con la configuracion actual, y",
        "si se pusiera EMAIL_ENABLED=true tampoco se arreglaria, porque",
        "_enviarViaSmtp L100-102 hace throw siempre:",
        "  throw new Error('SMTP aun no configurado en el prototipo.')",
        "",
        "Y el texto de la rama false dice 'intenta reenviar la",
        "invitacion'. El controlador tiene cinco endpoints:",
        "",
        "  GET   admin/empleados",
        "  GET   admin/sucursales/activas",
        "  POST  admin/empleados",
        "  PATCH admin/empleados/:id/deshabilitar",
        "  PATCH admin/empleados/:id/rehabilitar",
        "",
        "Ninguno reenvia nada. El frontend tiene api.listarRoles(),",
        "api.ts L1253, que si existe, y no tiene ningun reenviarInvitacion().",
        "",
        "O sea: el codigo le pide al administrador una accion que el",
        "propio codigo no ofrece."
    ]],
    ["4. La contrasena temporal usa Math.random y 6 caracteres", [
        "generarPasswordTemporal, SRV_EmpleadosService.ts L330-337:",
        "",
        "  const chars =",
        "    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';",
        "  let result = 'Tmp#';",
        "  for (let i = 0; i < 6; i++)",
        "    result += chars.charAt(Math.floor(Math.random() * chars.length));",
        "",
        "Tres cosas:",
        "",
        "  1. Math.random() NO es criptografico. Es un PRNG con estado de",
        "     128 bits, no un CSPRNG. Todo lo demas del proyecto si usa",
        "     node:crypto: randomUUID() para los tokens, aqui en L168, en",
        "     CU02 L60, y en SRV_JWTService L50 y L63 para el jti.",
        "     Los tokens son fuertes y las contrasenas debiles.",
        "",
        "  2. Seis caracteres, con el prefijo 'Tmp#' fijo. El alfabeto",
        "     tiene 56 simbolos, asi que la entropia son 6 x log2(56), unos",
        "     35 bits. Y los cuatro primeros son constantes.",
        "",
        "  3. Excluye I, O, l, 0 y 1 para no confundir. Eso esta bien",
        "     pensado, y es lo unico que hace el alfabeto.",
        "",
        "Ademas: el DTO L29-31 no le pone MinLength ni MaxLength a",
        "password_temporal. El admin puede mandar 'a' y se hashea 'a'.",
        "",
        "Y por el hallazgo 1, esto no se ejecuta en el camino normal."
    ]],
    ["5. El INSERT del rol es condicional y el fallo es silencioso", [
        "L128-131 valida el rol contra un array fijo en el codigo:",
        "  const rolesAdmin = ['Administrador', 'Encargado de Sucursal', 'Cajero'];",
        "",
        "O sea que valida contra el CODIGO, no contra la base de datos. Y",
        "despues, L143-156, lo busca en la base de datos otra vez:",
        "",
        "  const rol = ... .where('LOWER(r.nombre_rol) = LOWER(:nombre)')",
        "  if (rol) {",
        "    INSERT usuarios_roles ...",
        "  }",
        "",
        "El if no tiene else. Si la consulta no devuelve nada, el INSERT",
        "no se hace, el metodo sigue como si nada, y la respuesta dice",
        "'Empleado X registrado.'",
        "",
        "Cuando puede pasar: si en la base de datos el rol se llama",
        "'Encargado de Sucursal' pero el seed lo creo como 'Encargado',",
        "o con otro acento, o si alguien borro el rol. El array de L128",
        "pasa igual porque compara contra si mismo, y la consulta de L146",
        "no lo encuentra porque compara contra la base de datos.",
        "",
        "El resultado es un usuario con estado='Pendiente', sin rol y sin",
        "aviso. Y cuando por lo que sea se activara, entraria sin",
        "permisos: el getter de CU01, CE_Modelos L76-81, devuelve",
        "roles[0], y sin filas en usuarios_roles devuelve null, y L60",
        " castea null a string[]. El chequeo de L104 daria false por",
        "accidente, no por diseno."
    ]],
    ["6. La lista de roles esta escrita dos veces, en dos sitios", [
        "El frontend, Usuarios.tsx L24:",
        "  const ROLES_OPCIONES = ['Administrador', 'Encargado de Sucursal', 'Cajero'];",
        "",
        "El backend, SRV_EmpleadosService.ts L128:",
        "  const rolesAdmin = ['Administrador', 'Encargado de Sucursal', 'Cajero'];",
        "",
        "La misma lista de tres, en dos ficheros, en dos lenguajes, sin",
        "que ninguna se genere de la otra. Y el proyecto tiene una tabla",
        "roles, GET admin/roles, POST admin/roles, PUT admin/roles/:id y",
        "DELETE admin/roles/:id, mas un catalogo de permisos en",
        "SRV_RolesService L21 que ya agrupa 'gestionar_empleados'.",
        "",
        "O sea que se pueden crear roles por API, y ningun sitio los",
        "ofrece para dar de alta a un empleado. El unico camino es editar",
        "las dos listas a mano.",
        "",
        "Y el frontend tiene api.listarRoles(), api.ts L1253, que llama",
        "a GET admin/roles y devuelve la lista de verdad. El modal de",
        "empleado no la usa: usa la constante de L24."
    ]],
    ["7. No hay transaccion, y el nombre no tiene MaxLength en ninguna", [
        "capa, con la columna en varchar(120).",
        "",
        "Cinco escrituras, en este orden:",
        "",
        "  1  INSERT usuarios                 L141",
        "  2  INSERT usuarios_roles           L150-155, condicional",
        "  3  INSERT usuarios_empleados       L165",
        "  4  INSERT first_password_tokens    L175",
        "  5  INSERT bitacora_auditoria      SRV_BitacoraService L38",
        "",
        "En las 339 lineas del servicio no hay ni una transaction ni un",
        "QueryRunner. Cuatro modulos si los tienen: Compras, Pagos,",
        "Reservas y Ventas. Este no.",
        "",
        "Y nombre no tiene MaxLength en ninguna de las dos capas:",
        "",
        "  CTR_Empleados.ts L9-11   @IsString y @IsNotEmpty. Nada mas.",
        "  Usuarios.tsx             el unico maxLength del fichero esta en",
        "                            L310, y es el campo motivo del modal de",
        "                            deshabilitar, no el del alta",
        "  schema.sql L80           nombre VARCHAR(120) NOT NULL",
        "",
        "Un nombre de 121 caracteres pasa las dos validaciones. Entonces:",
        "",
        "  L141  INSERT usuarios            OK",
        "  L155  INSERT usuarios_roles      OK",
        "  L165  INSERT usuarios_empleados  FALLA, 22001 value too long",
        "  -> 500 Internal server error",
        "",
        "Queda un usuario con estado='Pendiente', con rol, y sin perfil de",
        "empleado. Y con el correo ocupado, asi que reintentar da 409 para",
        "siempre. Es el mismo fallo que el hallazgo 2 de CU02, con una",
        "columna mas corta: ahi era 150, aqui es 120.",
        "",
        "Lo del telefono es igual: VARCHAR(30) en schema.sql L81, y el DTO",
        "L17-19 solo le pone @IsString y @IsOptional."
    ]],
    ["8. Lo que si esta bien en este caso", [
        "Este caso tiene mas cosas bien que los otros tres, y conviene",
        "dejarlas escritas porque son el modelo de como deberia ser el",
        "resto.",
        "",
        "  - El permiso se comprueba en el SERVICIO, no en el controlador,",
        "    y con una consulta propia, L103-106. Un cliente externo no",
        "    puede saltarselo. Y el mismo permiso, con el mismo nombre,",
        "    se comprueba en los cinco metodos del servicio: L69, L104,",
        "    L203, L268 y L316. Ninguno se ha olvidado.",
        "",
        "  - El frontend tambien lo comprueba, Usuarios.tsx L429-432, con",
        "    la misma regla del asterisco: permisos.includes('*'). Y el",
        "    menu lo oculta, adminMenu.ts L63. Tres capas de acuerdo con",
        "    el mismo permiso.",
        "",
        "  - verificarPermiso acepta el asterisco, L64, para el rol",
        "    Administrador. Esta bien que exista esa via.",
        "",
        "  - La hora del token se pide a la base de datos, L167:",
        "      SELECT NOW()::timestamp AS 'ahora'",
        "    y el expires_at se calcula desde ahi, L172. Asi que el token",
        "    no caduca antes ni despues por un reloj desfasado. Es un",
        "    detalle pequeno y esta muy bien hecho.",
        "",
        "  - El token es randomUUID() de node:crypto, L168. Cuatro bytes",
        "    de entropia de sobra, a diferencia de la contrasena.",
        "",
        "  - Deshabilitar guarda fecha_baja y motivo_baja, L244, y el",
        "    motivo va tambien a la bitacora, L252. Y no se puede",
        "    deshabilitar a uno mismo, L218-220, ni al superadministrador,",
        "    L222-225. Los dos casos que de verdad importan.",
        "",
        "  - La bitacora de este alto si pasa estado anterior y nuevo,",
        "    L255-256 al deshabilitar y L307-308 al rehabilitar, a diferencia",
        "    de CU03, que registraba un texto fijo y nada mas."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 11 del diagrama de secuencia de CU04."; } catch (e) { }
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
        try { o.Text = "CU04  Registrar Nuevo Empleado"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 700) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseno de caso de uso, seccion 3.3.2.1.  11 lineas de vida, 38 mensajes, 8 hallazgos."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja: lo que esta mas arriba pasa antes. Cada mensaje lleva el fichero y la linea. Los mensajes 27 a 32 son las cuatro escrituras del alta, y ninguna esta en una transaccion. Los mensajes 3, 11 y 12 son la cadena que hashea la contrasena vacia."; } catch (e) { }
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
    N.push("CU04  Registrar Nuevo Empleado.  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  11 lineas de vida, de izquierda a derecha. A diferencia de CU01, CU02 y");
    N.push("  CU03, que tienen diez, aqui hacen falta once: los tres servicios del");
    N.push("  nucleo participan los tres, y ademas el guard, el pipe, el cliente HTTP");
    N.push("  y la pantalla del modal. Quitar uno seria quitar un participante real.");
    N.push("");
    N.push("    ACTOR_Administrador    «actor»     quien pulsa Nuevo Empleado");
    N.push("    Usuarios.tsx           «boundary»  pages/admin/Usuarios.tsx, 713 lineas");
    N.push("    api.ts                 «boundary»  lib/api.ts, L1228");
    N.push("    JwtAuthGuard           «control»   dependencias.ts, L15-65");
    N.push("    ValidationPipe         «control»   main.ts, L22-43, es global");
    N.push("    CTR_Empleados          «control»   el @Post('empleados'), 86 lineas");
    N.push("    SRV_EmpleadosService   «control»   registrarEmpleado(), 339 lineas");
    N.push("    SRV_SeguridadService   «control»   hashearPassword(), L7-9");
    N.push("    SRV_EmailService       «control»   enviarPrimeraContrasena(), L32-52");
    N.push("    SRV_BitacoraService    «control»   registrar(), la quinta escritura");
    N.push("    PostgreSQL             «entity»    6 tablas de schema.sql");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes: 12 van a la base de datos, 15 son mensajes a si mismo y 3 son");
    N.push("  retornos. 5 llevan la guarda escrita entre corchetes, 6 son el punto donde el");
    N.push("  codigo lanza una excepcion, y aparecen 6 codigos: 201, 400, 401, 403, 409 y 422.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("EL HALLAZGO 1: LA CONTRASENA VACIA PASA LAS CINCO CAPAS");
    N.push("");
    N.push("  Los mensajes 3, 11, 12, 24 y 26 son la cadena, y en ninguno se para:");
    N.push("");
    N.push("    3   Usuarios.tsx L83      useState('') y L106 manda el valor tal cual");
    N.push("    11  CTR_Empleados L29-31  @IsString y @IsOptional, y '' NO es optional");
    N.push("    12  y el ?? de L133 tampoco, porque '' no es null ni undefined");
    N.push("    24  passwordTemporal = dto.password_temporal ?? generar()  queda ''");
    N.push("    26  hashearPassword('')   ->  bcrypt.hash('', 10), un hash VALIDO del vacio");
    N.push("");
    N.push("  generarPasswordTemporal, L330-337, no se llama nunca en el camino normal.");
    N.push("  El generador de contrasenos aleatorios esta escrito, funciona, y es codigo");
    N.push("  muerto. Lo que haria falta es un || en vez de un ??, o un chequeo de que");
    N.push("  la cadena no este vacia. Es una palabra.");
    N.push("");
    N.push("EL HALLAZGO 2: EL EMPLEADO NACE PENDIENTE Y NO HAY SALIDA");
    N.push("");
    N.push("  L139 lo crea en 'Pendiente'. autenticar() L48 y JwtAuthGuard L49 exigen");
    N.push("  'activo', o sea que no entra ni puede hacer nada.");
    N.push("");
    N.push("  estado='Activo' sobre usuarios, en todo el proyecto, se pone en dos sitios:");
    N.push("");
    N.push("    SRV_ClienteService.ts L44    alta de cliente, CU02");
    N.push("    SRV_AuthService.ts L365      establecerPrimeraContrasena()");
    N.push("");
    N.push("  Y el segundo necesita el token de first_password_tokens, que solo viaja");
    N.push("  en un correo que no se envia. La contrasena temporal, que era la salida de");
    N.push("  emergencia, no se devuelve: L188-193 solo trae detail y usuario_id.");
    N.push("");
    N.push("  Y el boton de Rehabilitar no sirve, porque L286 exige 'inactivo' y el");
    N.push("  empleado esta en 'Pendiente': da 409. Y el de Deshabilitar tampoco, porque");
    N.push("  L234 exige 'activo': da 409 con el texto 'ya esta inactivo', que es falso.");
    N.push("");
    N.push("  O sea: Toast de exito, y un empleado que no puede entrar nunca, con ninguna");
    N.push("  accion de administrador que lo arregle.");
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  La contrasena temporal vacia pasa el modal, el DTO, el ?? y el hasheo. El");
    N.push("     generador de contrasenos aleatorios no se llama nunca en el camino normal.");
    N.push("  2  El empleado nace en 'Pendiente' y no hay ninguna accion de administrador");
    N.push("     que lo saque: ni Rehabilitar, ni Deshabilitar, ni el correo. Es un cierre");
    N.push("     permanente, y el Toast dice que todo ha ido bien.");
    N.push("  3  El mensaje de exito es falso, y el de error pide 'reenviar la");
    N.push("     invitacion' cuando no existe ningun endpoint para reenviarla.");
    N.push("  4  generarPasswordTemporal usa Math.random, que no es criptografico, con 6");
    N.push("     caracteres y el prefijo fijo Tmp#. Unos 35 bits. Todo lo demas del");
    N.push("     proyecto usa node:crypto, y ahi no.");
    N.push("  5  El INSERT de usuarios_roles es condicional, L149, y el if no tiene else.");
    N.push("     El rol se valida contra un array fijo en L128 y se busca en la base de");
    N.push("     datos en L146. Si no coinciden, el alta termina sin rol y sin avisar.");
    N.push("  6  La lista de roles esta escrita dos veces, en Usuarios.tsx L24 y en");
    N.push("     SRV_EmpleadosService L128, sin generarse una de otra. Y existe");
    N.push("     api.listarRoles() y una tabla roles, y el modal no usa ninguna de las dos.");
    N.push("  7  No hay transaccion, y nombre no tiene MaxLength en ninguna capa con la");
    N.push("     columna en varchar(120). Un nombre de 121 caracteres deja un usuario");
    N.push("     'Pendiente' con rol y sin perfil de empleado, y el correo ya ocupado.");
    N.push("  8  Lo que si esta bien, y es bastante: el permiso se comprueba en el");
    N.push("     servicio y en los cinco metodos, el frontend lo comprueba y oculta el");
    N.push("     menu, la hora del token se pide a la base de datos, el token es");
    N.push("     randomUUID, y no se puede deshabilitar ni a uno mismo ni al");
    N.push("     superadministrador.");
    N.push("");
    N.push("RELACION CON CU01, CU02 Y CU03");
    N.push("");
    N.push("  Los tres anteriores se cruzan aqui. CU03 dejo ver que la contrasena se hashea");
    N.push("  sin comprobar bytes, y que el cambio no cierra sesiones. CU02 dejo ver que");
    N.push("  el correo no se puede enviar en ninguna configuracion. Y aqui, CU04 usa las");
    N.push("  dos cosas: nace en 'Pendiente' justamente porque el correo no llega, y la");
    N.push("  contrasena con la que bornear llega vacia.");
    N.push("");
    N.push("  La diferencia con los otros tres, y es la buena: CU03 no tiene pantalla");
    N.push("  y este si. Aqui el fallo se ve, porque hay un Toast de exito y un boton de");
    N.push("  rehabilitar que no hace nada. En los otros dos el fallo habria que deducirlo.");
    N.push("");
    N.push("SOBRE LA COLOCACION DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Anchura: las once cabeceras separadas " + PASO + " px, con " + ANCHO_CAB + " de ancho. Quedan");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU04 Secuencia", 0); } catch (e) { }
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
    T.push("CU04 - DIAGRAMA DE SECUENCIA - INFORME");
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
    msg = msg + "CU04 - Registrar Nuevo Empleado" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO + SALTO;
    msg = msg + "11 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "LA CONTRASENA TEMPORAL VACIA PASA LAS CINCO" + SALTO;
    msg = msg + "CAPAS: el modal la manda vacia, el DTO la deja" + SALTO;
    msg = msg + "pasar, el ?? no la descarta y se hashea el" + SALTO;
    msg = msg + "vacio. El generador aleatorio no se llama nunca." + SALTO + SALTO;
    msg = msg + "Y el empleado nace en 'Pendiente' sin ninguna" + SALTO;
    msg = msg + "accion de administrador que lo saque. El Toast" + SALTO;
    msg = msg + "de exito no lo dice." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU04 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU04 Secuencia", 0); } catch (e3) { }
}
