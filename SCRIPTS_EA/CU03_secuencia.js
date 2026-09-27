// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU03  Cambiar Contraseña Propia
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo. De estos
//   ficheros:
//
//     web/src/lib/api.ts                             L1046-1053
//     api/src/main.ts                                L22-43 ValidationPipe
//     api/src/modulos/seguridad/dependencias.ts       L15-65 JwtAuthGuard
//     api/src/modulos/seguridad/SRV_JWTService.ts     L105-121 blacklist
//     api/src/modulos/seguridad/CTR_Auth.ts           L121-129
//     api/src/modulos/seguridad/SRV_AuthService.ts    L385-425
//     api/src/modulos/seguridad/SRV_SeguridadService.ts    L7-17
//     api/src/modulos/seguridad/Esquemas.ts           L26-36
//     api/src/modulos/seguridad/SRV_BitacoraService.ts     L14-39
//     web/src/router.tsx                             38 rutas, ninguna es esta
//     BASE DE DATOS/schema.sql                       51 tablas, 3 en este caso
//
//   Cada mensaje lleva la linea del fichero de la que sale.
//
// QUE HACE ESTE CASO Y POR QUE ES EL MAS INTERESANTE DE LOS TRES
//   Es el unico de los tres que esta IMPLEMENTADO y ademas INACCESIBLE:
//   el backend esta entero, el cliente HTTP tambien, y no hay ninguna
//   pantalla. api.cambiarPassword es la unica mencion de
//   'cambiarPassword' en los 41 ficheros de la carpeta web.
//
//   Y de los tres casos de contrasena del router, este es el que falta.
//   Hay /recuperar-contrasena, /restablecer-contrasena y
//   /establecer-contrasena, con 98, 134 y 132 lineas. Los tres tienen
//   pagina. Este no.
//
//   28 mensajes. 10 lineas de vida. 5 van a la base de datos, 11 son
//   mensajes a si mismo y 3 son retornos.
//   4 guardas escritas entre corchetes, 2 puntos donde el codigo lanza
//   una excepcion y 4 codigos: 200, 400, 401 y 422.
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
//   Nada de ExecuteSQL, Execute ni SQLQuery: en esta instalacion eso
//   devuelve "DAO.database[3061] too few parameters" y para el script.
//
// POR QUE LAS CABEZAS SON ELEMENTOS "Object" Y NO CLASES
//   EA solo dibuja la linea de vida punteada si la cabeza es un elemento
//   de tipo Object con el estereotipo Lifeline. Ademas las cabeceras
//   deben estar en el MISMO paquete que el diagrama, porque si no se
//   rompen al pasar por control de versiones.
//
// POR QUE NO HAY FRAGMENTOS alt NI loop
//   EA los dibuja con un elemento aparte que no se puede colocar por
//   script de forma fiable. En su lugar la guarda va escrita en el
//   propio mensaje, entre corchetes al principio.
//
// Autorreparable. Una instruccion por linea. Sin continuaciones con +.
// Sin operadores ternarios. Ninguna excepcion escapa.
// ================================================================

var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var TOTAL_CAB = 10;
var TOTAL_MSG = 28;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU03 Secuencia Cambiar Contrasena";
var DIAG_NOMBRE = "CU03 Cambiar Contrasena Propia";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 100;

var X_NOTA = 2420;
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
    ["U", "ACTOR_Usuario", "Actor", "Lifeline", "Usuario", "quien la cambia", "Actor, no clase: es quien la escribe", "no es codigo, es la persona"],
    ["H", "api.ts", "Object", "Lifeline", "api", "cliente HTTP", "Boundary", "web/src/lib/api.ts, L1046-1053"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["J", "SRV_JWTService", "Object", "Lifeline", "JwtTokenService", "estaEnBlacklist()", "Control", "api/src/modulos/seguridad/SRV_JWTService.ts, L105-108"],
    ["P", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "validacion del DTO", "Control", "api/src/main.ts, L22-43, es global"],
    ["C", "CTR_Auth", "Object", "Lifeline", "AuthController", "PUT /auth/cambiar-password", "Control", "api/src/modulos/seguridad/CTR_Auth.ts, L121-129"],
    ["S", "SRV_AuthService", "Object", "Lifeline", "AuthService", "cambiarPassword()", "Control", "api/src/modulos/seguridad/SRV_AuthService.ts, L385-425"],
    ["G2", "SRV_SeguridadService", "Object", "Lifeline", "SeguridadService", "validar y hashear", "Control", "api/src/modulos/seguridad/SRV_SeguridadService.ts, L7-17"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar()", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "3 tablas", "Entity", "schema.sql: usuarios, token_blacklist, bitacora_auditoria"]
];

// Los 27 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [
    [1, "U", "H", "1. [no hay ninguna pantalla] esta llamada no la hace nadie. api.cambiarPassword es la unica", "S"],
    [2, "H", "H", "2. el router tiene 38 rutas y ninguna es cambiar contrasena. El caso de uso no se alcanza", "S"],
    [3, "H", "H", "3. headers['Authorization'] = Bearer <localStorage> y credentials:'include'   api.ts L51-56", "S"],
    [4, "H", "G", "4. PUT /api/v1/auth/cambiar-password { password_actual, password_nueva }   L1047-1051", "S"],
    [5, "G", "J", "5. estaEnBlacklist( payload.jti )   dependencias.ts L40  ->  SRV_JWTService.ts L105", "S"],
    [6, "J", "D", "6. SELECT token_blacklist WHERE jti = :jti   L106.   No mira expira_en", "S"],
    [7, "G", "D", "7. SELECT usuarios WHERE id_usuario = :sub   dependencias.ts L44.   No toca password_hash", "S"],
    [8, "G", "G", "8. [estado <> 'activo'] 401 'Tu cuenta esta deshabilitada. Contacta al administrador.'   L49-51", "S"],
    [9, "G", "P", "9. el guard no ha mirado la contrasena: el token vale, y el control pasa al pipe", "S"],
    [10, "P", "P", "10. valida CambiarPasswordRequest: actual @IsNotEmpty, nueva @MinLength(8) @MaxLength(72)", "S"],
    [11, "P", "P", "11. [falla el DTO] UnprocessableEntityException 422 con TODOS los mensajes   main.ts L27-41", "S"],
    [12, "P", "C", "12. el cuerpo ya validado pasa al controlador.   En Nest el guard corre antes que el pipe", "S"],
    [13, "C", "S", "13. cambiarPassword( currentUser, body, request )   CTR_Auth.ts L128", "S"],
    [14, "S", "G2", "14. validarPassword( usuario, body.password_actual )   SRV_AuthService.ts L390", "S"],
    [15, "G2", "G2", "15. bcrypt.compare( password_actual, usuario.password_hash )   L13.   Si el hash esta roto", "S"],
    [16, "G2", "G2", "16. devuelve false en vez de reventar, por el catch de L14-16.   Es un acierto", "S"],
    [17, "S", "S", "17. [actual incorrecta] UnauthorizedException 401 'La contrasena actual es incorrecta.'   L391", "S"],
    [18, "S", "S", "18. [nueva === actual] HttpException 400 'La nueva contrasena debe ser diferente a la actual.'", "S"],
    [19, "S", "S", "19.   L394-399.   Y solo se compara con la inmediata anterior, no con ninguna mas", "S"],
    [20, "S", "G2", "20. hashearPassword( body.password_nueva )   L401", "S"],
    [21, "G2", "G2", "21. bcrypt.hash( password, 10 ), que trunca a 72 BYTES sin avisar   L7-9", "S"],
    [22, "S", "D", "22. UPDATE usuarios SET password_hash = :nuevo   L402-403.   La escritura 1 de 2", "S"],
    [23, "S", "D", "23. UPDATE token_blacklist SET expira_en = ahora WHERE usuario_id = :id   L405-413.   La 2 de 2", "S"],
    [24, "S", "B", "24. registrar( id, 'UPDATE', 'usuarios', 'Cambio de contrasena', request, id )   L415-422", "S"],
    [25, "B", "D", "25. INSERT INTO bitacora_auditoria   SRV_BitacoraService.ts L27-38.   Sin old_data ni new_data", "S"],
    [26, "S", "C", "26. { detail: 'Contrasena actualizada correctamente.' }   L424.   Un PUT sin @HttpCode responde 200", "A"],
    [27, "C", "H", "27. 200 OK con el cuerpo JSON   CTR_Auth.ts L128", "A"],
    [28, "H", "U", "28. y el token que traia sigue valiendo 15 minutos, y el refresh 7 dias. El cambio no cierra ninguna sesion", "A"]
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. La funcionalidad no tiene pantalla. Es el caso de uso entero", [
        "api.cambiarPassword existe, api.ts L1046-1053. El backend existe,",
        "CTR_Auth L121-129 y SRV_AuthService L385-425. Y no hay pagina.",
        "",
        "api.cambiarPassword es la UNICA mencion de 'cambiarPassword' en",
        "los 63 ficheros de la carpeta web. Ninguna pagina lo llama.",
        "",
        "Y el router, que tiene 38 rutas, no tiene ninguna de este caso:",
        "",
        "  L59  /recuperar-contrasena      RecuperarContrasena     98 lineas",
        "  L60  /restablecer-contrasena   RestablecerContrasena  134 lineas",
        "  L61  /establecer-contrasena    EstablecerContrasena   132 lineas",
        "",
        "Las tres tienen pagina, y las tres tienen su endpoint. Esta no",
        "tiene ninguno de las dos cosas en el frontend.",
        "",
        "De los 36 casos de uso es el unico cuya interfaz no existe. El",
        "cliente tendria que llamar a la API a mano con curl."
    ]],
    ["2. El UPDATE de la blacklist no revoca ninguna sesion", [
        "SRV_AuthService.ts L405-413, que es lo que deberia cerrar las",
        "sesiones del usuario al cambiar la contrasena:",
        "",
        "  const ahora = new Date();",
        "  UPDATE token_blacklist SET expira_en = ahora",
        "    WHERE usuario_id = :id AND expira_en > :ahora",
        "",
        "Tres cosas, y las tres lo anulan:",
        "",
        "  1. Actualiza filas que YA estan en la blacklist, o sea tokens",
        "     que ya estaban revocados. Es un UPDATE sobre la lista negra.",
        "",
        "  2. estaEnBlacklist, SRV_JWTService.ts L105-108, hace",
        "     findOne({ where: { jti } }) y NO mira expira_en. Cambiar",
        "     expira_en no cambia en nada lo que el guard decida.",
        "",
        "  3. El token que lleva el usuario no esta en ninguna tabla. Un",
        "     access token es un JWT firmado: no hay fila que actualizar.",
        "",
        "Resultado: despues de cambiar la contrasena, el access token",
        "anterior sigue funcionando hasta 15 minutos y el refresh hasta",
        "7 dias. Un ladrillo que robe el token sigue dentro.",
        "",
        "Y el patron correcto esta 200 lineas mas arriba, en el mismo",
        "fichero, en cerrarSesion L184-193:",
        "  getRepository(TokenBlacklist).create({ jti, usuario_id, expira_en })",
        "  y luego .save(bl). Eso si revoca, porque mete el jti."
    ]],
    ["3. El MaxLength(72) cuenta caracteres y bcrypt corta a 72 BYTES", [
        "Esquemas.ts L34 pone @MaxLength(72) en password_nueva. El 72 es",
        "el limite de bcrypt, y ahi esta el error de unidad.",
        "",
        "bcrypt trunca a 72 BYTES, no a 72 caracteres. Con acentos, un",
        "caractere ocupa mas de un byte: la 'á' son 2, la 'ñ' son 2, un",
        "emoji son 4.",
        "",
        "O sea que una contrasena de 72 caracteres con acentos tiene",
        "bastantes mas de 72 bytes, y bcrypt se queda con los primeros 72",
        "bytes SIN AVISAR. No lanza error, no da warning, simplemente corta.",
        "",
        "Las dos consecuencias:",
        "",
        "  - El usuario escribe 72 caracteres y en realidad se ha guardado",
        "    una contrasena de 72 bytes. Todo lo que pase de ahi es",
        "    decorativo, y el usuario no tiene forma de saberlo.",
        "  - Dos contrasenas distintas con los mismos 72 primeros bytes",
        "    producen el MISMO hash. O sea que no son dos contrasenas, es",
        "    una.",
        "",
        "Y SRV_SeguridadService.hashearPassword, L7-9, no comprueba nada:",
        "  return bcrypt.hash(password, 10);",
        "Ni longitud, ni bytes, ni nada. Confia en que el DTO lo hizo bien."
    ]],
    ["4. CU02 y los otros tres caminos no tienen MaxLength en password", [
        "RegistroRequest, Esquemas.ts del modulo clientes L11-13, solo",
        "pone @IsString y @MinLength(8). Nada de MaxLength.",
        "",
        "Y por ese DTO pasan cinco llamadas a hashearPassword, las cinco",
        "del proyecto:",
        "",
        "  SRV_ClienteService.ts L39      alta de cliente, CU02",
        "  SRV_AuthService.ts L303        restablecer contrasena",
        "  SRV_AuthService.ts L363        establecer primera contrasena",
        "  SRV_AuthService.ts L401        cambiar contrasena, este caso",
        "  SRV_EmpleadosService.ts L134   alta de empleado, CU04",
        "",
        "O sea: cuatro de las cinco no tienen ningun limite de longitud.",
        "Una contrasena de 200 caracteres se registra y se trunca a 72",
        "bytes sin que nadie se entere.",
        "",
        "El truncado es determinista, asi que el login sigue",
        "funcionando: la comparacion usa el mismo truncado. El problema",
        "no es que se rompa, es que la seguridad prometida no existe."
    ]],
    ["5. Un 401 de contrasena incorrecta dispara una renovacion de token", [
        "El servicio devuelve UnauthorizedException 401 en L391 con el",
        "texto 'La contrasena actual es incorrecta.'. O sea, un 401 que",
        "significa credencial mala, no token caducado.",
        "",
        "El cliente no lo distingue. api.ts L58:",
        "  if (res.status === 401 && renovar) { ... }",
        "",
        "Y cambiarPassword llama a solicitar SIN el tercer argumento,",
        "L1047, asi que renovar vale true por el default de L48. No es",
        "una decision, es que no se paso el argumento. logout si lo pasa,",
        "L1041; registrar lo pasa en false, L1063.",
        "",
        "Asi que cada vez que el usuario escribe mal la contrasena",
        "actual ocurren tres cosas: se renueva el token, se reintenta la",
        "misma peticion, y vuelve a salir el mismo 401. Dos peticiones y",
        "una rotacion de token por tecleo equivocado.",
        "",
        "Y el caso grave: si la renovacion tambien falla, L65 llama a",
        "expulsarSesion(), que borra el token del localStorage y despacha",
        "el evento de sesion expirada. O sea que por escribir mal la",
        "contrasena actual, si el refresh tambien estaba caducado, te",
        "echan de la plataforma."
    ]],
    ["6. Solo se comprueba que sea distinta de la inmediata anterior", [
        "SRV_AuthService.ts L394:",
        "  if (body.password_nueva === body.password_actual)",
        "",
        "Eso es todo el control de reutilizacion. Y no hay mas nowhere:",
        "",
        "  - Ninguna de las 51 tablas de schema.sql es un historial de",
        "    contrasenas. Se comprobo una por una.",
        "  - La bitacora, L415-422, registra un texto fijo, 'Cambio de",
        "    contrasena', y NO pasa old_data ni new_data. Asi que del",
        "    cambio anterior no queda ni el hash ni una marca.",
        "",
        "Consecuencia: se puede volver a una contrasena de hace dos, tres",
        "o diez cambios, y no hay forma de comprobarlo ni de impedirlo.",
        "",
        "Y el filtro es el mas debil posible: cambiar un caracter basta.",
        "De 'Tiendas2026!' a 'Tiendas2026 ' pasa, porque un espacio al",
        "final no es la misma cadena. Y no hay regla que pida letra,",
        "numero ni simbolo, asi que 'Tiendas' tambien pasa."
    ]],
    ["7. No hay ni una regla de complejidad, ni una pista al usuario", [
        "El DTO, Esquemas.ts L26-36, tiene exactamente tres",
        "restricciones en las dos contrasenas:",
        "",
        "  password_actual   @IsString, @IsNotEmpty",
        "  password_nueva    @IsString, @IsNotEmpty, @MinLength(8),",
        "                    @MaxLength(72)",
        "",
        "No hay mayuscula, no hay minuscula, no hay numero, no hay simbolo,",
        "y no se rechaza ni la parte local del correo ni el nombre de la",
        "persona.",
        "",
        "Y el caso concreto: con el correo juanperez@mail.com se puede",
        "poner 'juanperez' como contrasena, y el DTO lo acepta. Con el",
        "nombre 'Juan Perez', tambien.",
        "",
        "Y como no hay pantalla (hallazgo 1), tampoco hay forma de",
        "mostrarle las reglas al usuario, ni un medidor de robustez, ni",
        "avisarle de que se ha repetido una contrasena vieja."
    ]],
    ["8. Lo que si esta bien en este caso", [
        "No todo esta roto aqui, y esto conviene dejarlo escrito porque",
        "es lo que hace que el resto sea raro y no Hathaway.",
        "",
        "  - El guard se ejecuta ANTES que la validacion del DTO, porque",
        "    en Nest los guards corren antes que los pipes. Eso significa",
        "    que un peticion sin token valido con un cuerpo invalido",
        "    recibe 401 y no 422: no se le dice a un desconocido que su",
        "    contrasena nueva es corta. Es lo correcto.",
        "",
        "  - validarPassword tiene un try/catch que devuelve false en",
        "    L14-16, en vez de dejar que bcrypt reviente. Si el hash de",
        "    la base de datos esta corrupto, el usuario recibe",
        "    'La contrasena actual es incorrecta.' y el sistema no se",
        "    cae. Eso esta bien pensado.",
        "",
        "  - La contrasena se hashea ANTES de tocar la base de datos,",
        "    L401 antes de L403, y con bcrypt a coste 10. En ningun sitio",
        "    se guarda en claro, ni en la tabla, ni en la bitacora, ni en",
        "    el cuerpo de la respuesta. La bitacora registra un texto",
        "    fijo, no el valor.",
        "",
        "  - El endpoint no acepta el hash por parametro ni acepta un",
        "    id de usuario por parametro. Usa @UsuarioActual(), L126, que",
        "    sale del guard. O sea que no hay forma de cambiarle la",
        "    contrasena a otro usuario con esta llamada.",
        "",
        "  - El refusal de la contrasena actual es un 401 con texto",
        "    propio, y el de la nueva igual es un 400 con texto propio.",
        "    Los dos se distinguen del 422 de la validacion del DTO."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU03."; } catch (e) { }
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
        try { o.Text = "CU03  Cambiar Contrasena Propia"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 700) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseno de caso de uso, seccion 3.3.2.1.  10 lineas de vida, 28 mensajes, 8 hallazgos."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja: lo que esta mas arriba pasa antes. Cada mensaje lleva el fichero y la linea de donde sale. El mensaje 23 es el UPDATE que deberia cerrar las sesiones y no cierra ninguna."; } catch (e) { }
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
// LOS 27 MENSAJES
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
    N.push("CU03  Cambiar Contrasena Propia.  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Usuario           «actor»     quien escribe las dos contrasenas");
    N.push("    api.ts                  «boundary»  web/src/lib/api.ts, L1046-1053");
    N.push("    JwtAuthGuard            «control»   dependencias.ts, L15-65");
    N.push("    SRV_JWTService          «control»   el estaEnBlacklist, L105-108");
    N.push("    ValidationPipe          «control»   main.ts, L22-43, es global");
    N.push("    CTR_Auth                «control»   el @Put('cambiar-password'), L121-129");
    N.push("    SRV_AuthService         «control»   el cambiarPassword(), L385-425");
    N.push("    SRV_SeguridadService    «control»   validarPassword y hashearPassword, L7-17");
    N.push("    SRV_BitacoraService     «control»   el registrar(), la segunda escritura");
    N.push("    PostgreSQL              «entity»    usuarios, token_blacklist, bitacora_auditoria");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes: 5 van a la base de datos, 11 son mensajes a si mismo y 3 son");
    N.push("  retornos. 4 llevan la guarda escrita entre corchetes, y los codigos que");
    N.push("  aparecen son 200, 400, 401 y 422.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("ESTE CASO DE USO NO TIENE PANTALLA, Y ESO ES EL HALLAZGO 1");
    N.push("");
    N.push("  El backend esta entero: CTR_Auth L121-129 y SRV_AuthService L385-425.");
    N.push("  El cliente HTTP tambien: api.ts L1046-1053. Y no hay pagina.");
    N.push("");
    N.push("  api.cambiarPassword es la unica mencion de 'cambiarPassword' en los 63");
    N.push("  ficheros de la carpeta web. Ninguna pagina lo llama.");
    N.push("");
    N.push("  Y el router, que tiene 38 rutas, tiene estas tres de contrasena:");
    N.push("");
    N.push("    L59  /recuperar-contrasena      RecuperarContrasena      98 lineas");
    N.push("    L60  /restablecer-contrasena   RestablecerContrasena   134 lineas");
    N.push("    L61  /establecer-contrasena    EstablecerContrasena    132 lineas");
    N.push("");
    N.push("  Las tres tienen pagina y las tres tienen su endpoint. Esta no tiene ninguna");
    N.push("  de las dos cosas en el frontend. De los 36 casos de uso es el unico cuya");
    N.push("  interfaz no existe. Un usuario tendria que llamar a la API a mano.");
    N.push("");
    N.push("  Por eso el diagrama empieza en la capa de cliente HTTP y no en una pagina.");
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  La funcionalidad no tiene pantalla. El backend y el cliente existen; la");
    N.push("     pagina no. Y el router no tiene ruta para este caso de uso.");
    N.push("  2  El UPDATE de la blacklist no revoca ninguna sesion. Actualiza filas que ya");
    N.push("     estaban revocadas, estaEnBlacklist no mira expira_en, y el token que");
    N.push("     lleva el usuario no esta en ninguna tabla porque es un JWT firmado. El");
    N.push("     patron correcto esta 200 lineas mas arriba, en cerrarSesion L184-193.");
    N.push("  3  El MaxLength(72) cuenta caracteres y bcrypt corta a 72 BYTES. Con acentos,");
    N.push("     72 caracteres son mas de 72 bytes y bcrypt trunca sin avisar. Dos");
    N.push("     contrasenas distintas con los mismos 72 primeros bytes son la misma.");
    N.push("  4  CU02 y los otros tres caminos no tienen MaxLength en password. De las cinco");
    N.push("     llamadas a hashearPassword del proyecto, cuatro no limitan la longitud,");
    N.push("     y el truncado a 72 bytes es silencioso.");
    N.push("  5  Un 401 de contrasena incorrecta dispara una renovacion de token, porque");
    N.push("     cambiarPassword llama a solicitar sin el tercer argumento. Dos");
    N.push("     peticiones y una rotacion por tecleo equivocado. Y si el refresh tambien");
    N.push("     falla, api.ts L65 llama a expulsarSesion() y echa al usuario.");
    N.push("  6  Solo se comprueba que la nueva sea distinta de la inmediata anterior, L394.");
    N.push("     No hay historial de contrasenas en ninguna de las 51 tablas, y la bitacora");
    N.push("     no pasa old_data ni new_data. Se puede volver a una de hace diez cambios.");
    N.push("  7  No hay ninguna regla de complejidad. Ni mayuscula, ni numero, ni simbolo, ni");
    N.push("     rechazo de la parte local del correo. Con juanperez@mail.com se puede");
    N.push("     poner 'juanperez'. Y sin pantalla no hay ni forma de mostrar las reglas.");
    N.push("  8  Lo que si esta bien, y conviene decirlo: el guard corre antes que el DTO y");
    N.push("     no filtra informacion a un desconocido; validarPassword traga el fallo");
    N.push("     de bcrypt y devuelve false; la contrasena se hashea antes de tocar la");
    N.push("     base de datos y en ningun sitio queda en claro; y el endpoint usa");
    N.push("     @UsuarioActual(), asi que no hay forma de cambiarle la contrasena a otro.");
    N.push("");
    N.push("RELACION CON CU01 Y CU02");
    N.push("");
    N.push("  Los tres diagramas comparten el mismo nucleo: el hash en");
    N.push("  usuarios.password_hash, el bcrypt de SRV_SeguridadService y la bitacora.");
    N.push("  Y los tres toman el resultado de la longitud de contrasena de un sitio");
    N.push("  distinto:");
    N.push("");
    N.push("    CU01  autenticar        no mira la longitud, compara el hash");
    N.push("    CU02  alta de cliente   MinLength(8) en el DTO, sin MaxLength");
    N.push("    CU03  cambiar propia    MinLength(8) y MaxLength(72) en el DTO");
    N.push("");
    N.push("  Tres caminos, tres reglas distintas, y en ninguno esta el limite de bytes de");
    N.push("  bcrypt, que es el unico limite que existe de verdad. Ese es el hallazgo 3.");
    N.push("");
    N.push("  Y hay una diferencia de nivel entre los tres casos. CU02 y CU03 son publicos");
    N.push("  en el sentido de que se pueden pedir por HTTP, pero CU03 exige token y");
    N.push("  CU02 no. El guard solo aparece en este diagrama, y por eso tiene su propia");
    N.push("  linea de vida.");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU03 Secuencia", 0); } catch (e) { }
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
    T.push("CU03 - DIAGRAMA DE SECUENCIA - INFORME");
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
    msg = msg + "CU03 - Cambiar Contrasena Propia" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "LO MAS GRAVE: este caso de uso no tiene" + SALTO;
    msg = msg + "pantalla. El backend y el cliente HTTP estan," + SALTO;
    msg = msg + "y no hay pagina ni ruta en el router." + SALTO;
    msg = msg + "Y el UPDATE que deberia cerrar las sesiones" + SALTO;
    msg = msg + "no cierra ninguna." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU03 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU03 Secuencia", 0); } catch (e3) { }
}
