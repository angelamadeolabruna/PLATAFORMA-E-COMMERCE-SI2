// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU01  Iniciar Sesion en Plataforma
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo. De estos
//   ficheros, y solo de ellos:
//
//     web/src/pages/Login.tsx                        151 lineas
//     web/src/contexts/AuthContext.tsx               103 lineas
//     web/src/lib/api.ts                             2053 lineas
//     api/src/modulos/seguridad/CTR_Auth.ts
//     api/src/modulos/seguridad/SRV_AuthService.ts
//     api/src/modulos/seguridad/SRV_SeguridadService.ts     18 lineas
//     api/src/modulos/seguridad/SRV_JWTService.ts
//     api/src/modulos/seguridad/SRV_BitacoraService.ts
//     api/src/modulos/seguridad/dependencias.ts               JwtAuthGuard
//     api/src/modulos/seguridad/Esquemas.ts                   LoginRequest
//     api/src/modulos/seguridad/CE_Modelos.ts                 Usuario, Rol
//     BASE DE DATOS/schema.sql                                51 tablas
//
//   Cada mensaje lleva la linea del fichero de la que sale. Es la
//   diferencia entre un diagrama de secuencia y un dibujo.
//
// POR QUE ESTE CASO Y NO OTRO
//   Es el primero del documento y es el unico que se puede comprobar de
//   punta a punta: el actor escribe, el navegador manda, el backend
//   busca, compara, firma dos tokens, escribe dos cookies y deja
//   constancia en la bitacora.
//
//   38 mensajes. 30 tocan el backend y 8 el navegador. 9 van a la base de
//   datos, 8 salen hacia el navegador o el actor, 17 son mensajes a si
//   mismo y 4 son retornos.
//   6 guardas escritas entre corchetes, 5 puntos donde se lanza una
//   excepcion y 3 codigos HTTP distintos: 401, 422 y 423.
//
// LOS DIEZ ELEMENTOS QUE LLEVAN LA Y EN NEGATIVO
//   Este es el punto que hizo fallar seis versiones seguidas de este
//   script, asi que va aqui arriba y no en un comentario perdido.
//
//   EA guarda Top y Bottom en NEGATIVO, porque trabaja en coordenadas
//   cartesianas con la Y creciendo hacia arriba. Si se le pasa la Y en
//   positivo no la entiende: no da error, simplemente no coloca nada y
//   todos los objetos se quedan en el mismo punto. El diagrama se ve
//   amontonado.
//
//   Por eso en las dos funciones de colocacion de este script, las
//   cabeceras y los hallazgos, esta escrito:
//
//     o.Top    = 0 - y;
//     o.Bottom = 0 - y - alto;
//
//   Y en el AddNew, en cambio, la Y va en POSITIVO:
//
//     var tam = "l=..;r=..;t=130;b=178;";
//
//   porque ahi EA ya la convierte por su cuenta. No son contradictorias:
//   una es la propiedad del objeto, y la otra es la cadena del AddNew.
//
//   La comprobacion final lee Left, Right, Top y Bottom de cada objeto y
//   cuenta cuantos tienen la Y crecida, o sea con Bottom menor que Top.
//   Si estan todos, la colocacion ha funcionado.
//
// POR QUE NO HAY NINGUNA LLAMADA A SQL
//   Las seis versiones anteriores escribian las coordenadas a mano en las
//   tablas internas del repositorio, con Repository.ExecuteSQL,
//   Repository.Execute y Repository.SQLQuery. En esta instalacion eso
//   devuelve un error de la capa de base de datos de EA que dice
//   "DAO.database[3061] too few parameters. expected 1", y el script se
//   para a mitad.
//
//   No hacen falta. El diagrama de capas se coloca entero con el modelo
//   de objetos y sin una sola llamada a SQL, asi que este tambien. Todo
//   lo que hay aqui abajo es API normal de EA.
//
// POR QUE LAS CABEZAS SON ELEMENTOS "Object" Y NO CLASES
//   EA solo dibuja la linea de vida punteada si la cabeza es un elemento
//   de tipo Object con el estereotipo Lifeline. Si se arrastra una Clase,
//   EA la admite pero el resultado no es UML valido y las lineas de vida
//   no se dibujan. Ademas las cabeceras deben estar en el MISMO paquete
//   que el diagrama, porque si no se rompen al pasar por control de
//   versiones. Por eso las diez son elementos propios.
//
//   El estereotipo Lifeline lo pone EA, no es el rol. El papel RUP,
//   Boundary, Control o Entity, va en las notas de cada cabecera y en la
//   leyenda, para no ensuciar la caja.
//
// POR QUE NO HAY FRAGMENTOS alt NI loop
//   EA los dibuja con un elemento aparte que no se puede colocar por
//   script de forma fiable. En su lugar la guarda va escrita en el
//   propio mensaje, entre corchetes al principio, que es la convencion
//   UML admitida y se lee igual. Los caminos de error llevan el numero
//   de codigo HTTP que devuelve el codigo real.
//
// COMO ESTA COLOCADO
//   Anchura: las diez cabeceras separadas 215 px, con 150 de ancho. Quedan
//   65 px entre una y otra, que es lo que necesitan las etiquetas de los
//   mensajes largos para caber enteras sin cortarse.
//
//   Altura: 58 px por mensaje, que es lo que hace falta para leer una
//   linea de codigo. El mensaje 1 cae en la y 250 y el 38 en la y 2396, y
//   el diagrama mide 2245 de ancho.
//
//   Los ocho hallazgos van a la derecha, de la y 250 a la y 2040, cada uno
//   con el alto que le corresponde a sus lineas.
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
var PAQ_NOMBRE = "CU01 Secuencia Login";
var DIAG_NOMBRE = "CU01 Iniciar Sesion en Plataforma";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 58;

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
    ["U", "ACTOR_Usuario", "Actor", "Lifeline", "Usuario", "la persona", "Actor, no clase: es quien inicia", "no es codigo, es la persona"],
    ["L", "Login.tsx", "Object", "Lifeline", "Login", "pantalla de acceso", "Boundary", "web/src/pages/Login.tsx, 151 lineas"],
    ["A", "AuthContext", "Object", "Lifeline", "AuthProvider", "estado de sesion", "Control", "web/src/contexts/AuthContext.tsx, 103 lineas"],
    ["H", "api.ts", "Object", "Lifeline", "api", "cliente HTTP", "Boundary", "web/src/lib/api.ts, L1017 login, L56 credentials"],
    ["C", "CTR_Auth", "Object", "Lifeline", "AuthController", "POST /auth/login", "Control", "api/src/modulos/seguridad/CTR_Auth.ts, L26-50"],
    ["S", "SRV_AuthService", "Object", "Lifeline", "AuthService", "autenticar()", "Control", "api/src/modulos/seguridad/SRV_AuthService.ts, L36-102"],
    ["G", "SRV_SeguridadService", "Object", "Lifeline", "SeguridadService", "validarPassword()", "Control", "api/src/modulos/seguridad/SRV_SeguridadService.ts, 18 lineas"],
    ["J", "SRV_JWTService", "Object", "Lifeline", "JwtTokenService", "generarPar()", "Control", "api/src/modulos/seguridad/SRV_JWTService.ts, L28-76"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar()", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "4 tablas y 1 trigger", "Entity", "schema.sql: usuarios, usuarios_roles, roles, bitacora_auditoria"]
];

// Los 38 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [
    [1, "U", "L", "1. escribe su correo o su CI, y su contrasena, en el formulario", "S"],
    [2, "L", "L", "2. [los dos campos vacios] setError('Ingresa tu correo y contrasena.') y NO llama al servidor.   Login.tsx L43-46", "S"],
    [3, "L", "A", "3. login( credencial.trim(), password )   Login.tsx L50  ->  AuthContext.tsx L65", "S"],
    [4, "A", "H", "4. api.login( credencial, password )   AuthContext.tsx L65", "S"],
    [5, "H", "C", "5. POST /api/v1/auth/login   { credencial, password }   con credentials:'include' y renovar:false.   api.ts L1017-1027", "S"],
    [6, "C", "S", "6. autenticar( credencial, password, request )   CTR_Auth.ts L33.   Este endpoint NO lleva JwtAuthGuard", "S"],
    [7, "S", "S", "7. credencial = credencial.trim().toLowerCase()   SRV_AuthService.ts L37", "S"],
    [8, "S", "S", "8. [credencial o password vacios] HttpException 422 UNPROCESSABLE_ENTITY   L38-40", "S"],
    [9, "S", "D", "9. buscarPorCredencial(): SELECT usuarios, LEFT JOIN usuarios_roles, LEFT JOIN roles, LEFT JOIN clientes,", "S"],
    [10, "S", "D", "10. LEFT JOIN empleados  WHERE LOWER(usuarios.email) = :email  OR  usuarios.ci = :ci   L23-34", "S"],
    [11, "S", "B", "11. [no existe el usuario] registrar( null, 'LOGIN_FAILED', 'usuarios', 'usuario_no_existe', request )   L44", "S"],
    [12, "B", "D", "12. INSERT INTO bitacora_auditoria ( accion_sql, tabla_afectada, detalle, ip_address, user_agent )   L27-38", "S"],
    [13, "S", "S", "13. throw UnauthorizedException 401 'Credenciales invalidas.'   L45.   El mismo 401 que una contrasena mala", "S"],
    [14, "S", "S", "14. [usuario.estado <> 'activo'] registrar( id, 'LOGIN_FAILED', 'usuarios', 'usuario_inactivo', request )   L49", "S"],
    [15, "S", "S", "15. throw UnauthorizedException 401 'Credenciales invalidas.'   L50", "S"],
    [16, "S", "S", "16. [bloqueado_hasta > new Date()] HttpException 423 LOCKED   'Cuenta temporalmente bloqueada.   L53-58", "S"],
    [17, "S", "G", "17. validarPassword( usuario, password )   SRV_AuthService.ts L60", "S"],
    [18, "G", "G", "18. bcrypt.compare( password, usuario.password_hash )   SRV_SeguridadService.ts L13.   El hasheado usa coste 10, L8", "S"],
    [19, "S", "D", "19. [contrasena incorrecta] UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1   L61 y L66", "S"],
    [20, "D", "D", "20. trg_bloquear_usuario_5_intentos, BEFORE UPDATE OF intentos_fallidos: si NEW.intentos_fallidos >= 5", "S"],
    [21, "D", "D", "21. pone estado='Bloqueado', bloqueado_hasta = NOW() + 15 min, intentos_fallidos = 0.   schema.sql L608-623", "S"],
    [22, "S", "B", "22. registrar( id, 'LOGIN_FAILED', 'usuarios', 'password_incorrecto', request )   L67", "S"],
    [23, "B", "D", "23. INSERT INTO bitacora_auditoria   L27-38", "S"],
    [24, "S", "S", "24. throw UnauthorizedException 401 'Credenciales invalidas.'   L68", "S"],
    [25, "S", "S", "25. intentos_fallidos = 0, bloqueado_hasta = null, fecha_ultimo_acceso = new Date()   L71-73", "S"],
    [26, "S", "J", "26. generarPar( usuario.id_usuario, usuario.rol?.nombre_rol, usuario.rol?.permisos_json )   L75-79", "S"],
    [27, "J", "J", "27. crearAccessToken: { sub, rol, permisos, type:'access', jti: randomUUID() }  firmado HS256, 15 min   L44-57", "S"],
    [28, "J", "J", "28. crearRefreshToken: { sub, type:'refresh', jti: randomUUID() }  firmado HS256, 7 dias.   L59-70", "S"],
    [29, "S", "D", "29. UPDATE usuarios SET fecha_ultimo_acceso = now   L81.   NO hay ningun INSERT en la tabla sesiones", "S"],
    [30, "S", "B", "30. registrar( id, 'LOGIN', 'usuarios', 'Login exitoso del usuario ' + email, request )   L82-88", "S"],
    [31, "B", "D", "31. INSERT INTO bitacora_auditoria  con accion_sql = 'LOGIN'   L27-38", "S"],
    [32, "S", "C", "32. AuthResponse { access_token, refresh_token, token_type:'bearer', usuario:{ id, nombre, email, rol, permisos } }", "A"],
    [33, "C", "C", "33. response.cookie( 'access_token', { httpOnly:true, sameSite:'lax', secure:false, maxAge:15 min, path:'/' })   L35-41", "S"],
    [34, "C", "C", "34. response.cookie( 'refresh_token', { httpOnly:true, sameSite:'lax', secure:false, maxAge:7 dias, path:'/' })   L42-48", "S"],
    [35, "C", "H", "35. 200 OK   Set-Cookie: access_token, Set-Cookie: refresh_token   mas el cuerpo JSON   L49", "A"],
    [36, "H", "A", "36. LoginResponse   api.ts L1027", "A"],
    [37, "A", "A", "37. localStorage.setItem( 'access_token', token )   AuthContext.tsx L48, via api.ts L16.   Anula el httpOnly", "S"],
    [38, "L", "U", "38. navigate( destino, { replace:true } )   /admin si es personal, / si es cliente.   Login.tsx L51-52", "A"]
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. La tabla sesiones nunca recibe una fila", [
        "autenticar() no hace INSERT en sesiones. En las 1.100 lineas de",
        "SRV_AuthService.ts no hay ni un solo INSERT sobre esa tabla.",
        "",
        "La primera vez que se toca es en cerrarSesion(), L204-211, que la",
        "UPDATE. Y como no hay filas, ese UPDATE no cierra nada: cierra cero.",
        "",
        "Consecuencia: no hay forma de saber quien esta conectado, desde que",
        "IP ni con que navegador, aunque las columnas ip_origen, user_agent,",
        "fecha_inicio y fecha_fin esten definidas y en uso cero. El caso de",
        "uso no lo dice, y la tabla esta ahi con sus siete columnas."
    ]],
    ["2. La cookie es httpOnly y el token tambien a localStorage", [
        "El controlador monta dos cookies httpOnly, L35-48. El guard las lee,",
        "dependencias.ts L26-28. Todo correcto.",
        "",
        "Pero AuthContext.tsx L48 y api.ts L16 guardan el mismo access_token",
        "en localStorage, y api.ts L56 manda las peticiones con",
        "credentials:'include' ademas del encabezado Authorization.",
        "",
        "Con las dos vias abiertas, el httpOnly no protege nada: cualquier",
        "XSS lee el token de localStorage sin necesidad de robar la cookie."
    ]],
    ["3. COOKIE_SECURE vale false en el .env", [
        "CTR_Auth.ts L38 y L45 leen COOKIE_SECURE, y el .env linea 19 lo",
        "pone a false. Tambien el .env.example linea 20.",
        "",
        "Con secure:false las cookies viajan sin la marca Secure. Si el",
        "despliegue llega por HTTPS funcionan, pero no viajan protegidas",
        "contra una bajada a HTTP, y sameSite:'lax' no cubre ese caso.",
        "",
        "Es el valor por defecto de la fabrica, no una decision tomada."
    ]],
    ["4. JWT_SECRET sigue siendo el texto de ejemplo", [
        ".env linea 13: 41 caracteres que empiezan por 'cambia'. Es la",
        "plantilla, no un secreto generado.",
        "",
        "Y el codigo la pone tambien por defecto:",
        "  this.config.get('JWT_SECRET', 'cambia-esta-clave')",
        "  SRV_JWTService.ts L29",
        "",
        "Es decir: si falta la variable, la aplicacion ARRANCA y firma con",
        "una clave publica. Cualquiera con el codigo puede firmar un token",
        "de administrador. No es una hipotesis: es lo que pasa por defecto."
    ]],
    ["5. El bloqueo de 5 intentos esta duplicado, y el trigger es una", [
        "puerta sin llave.",
        "",
        "EL CODIGO, SRV_AuthService.ts L61-64:",
        "  intentos_fallidos = intentos_fallidos + 1",
        "  si intentos_fallidos >= 5: bloqueado_hasta = ahora + 15 min",
        "                              intentos_fallidos = 0",
        "  NO toca usuario.estado",
        "",
        "EL TRIGGER, schema.sql L608-623:",
        "  BEFORE UPDATE OF intentos_fallidos ON usuarios",
        "  si NEW.intentos_fallidos >= 5: estado = 'Bloqueado'",
        "                                    bloqueado_hasta = NOW() + 15 min",
        "                                    intentos_fallidos = 0",
        "",
        "El codigo deja el contador en cero ANTES de que el trigger lo mire.",
        "Asi que el trigger no se dispara nunca por esta via, y el bloqueo que",
        "ocurre es el del codigo, que a proposito no toca estado. Correcto.",
        "",
        "El problema es el otro: SI el trigger llegara a dispararse, pondria",
        "estado='Bloqueado' de forma permanente. Y de ahi no se sale:",
        "",
        "  - autenticar() L48 exige estado = 'activo'",
        "  - JwtAuthGuard L49 tambien, en cada peticion posterior",
        "  - rehabilitarEmpleado, CU07, solo toca filas con",
        "    LOWER(estado) = 'inactivo'   SRV_EmpleadosService.ts L286",
        "    Un 'Bloqueado' no es un 'inactivo'. El boton no hace nada y",
        "    ademas contesta 409, L290.",
        "  - el unico otro sitio que repone estado='Activo' es",
        "    establecerPrimeraContrasena L365, y su token queda usado en L370",
        "    la primera vez que funciona.",
        "",
        "O sea: el trigger convierte un bloqueo de 15 minutos en una cuenta",
        "que solo arregla un UPDATE a mano. Hoy no hace nada, porque el codigo",
        "llega siempre antes con el contador a cero. El dia que alguien reordene",
        "esas dos lineas, un cliente que se equivoque cinco veces pierde su",
        "cuenta, y ni el mismo administrador puede devolversela con el boton."
    ]],
    ["6. usuario.rol es un getter que devuelve solo el primer rol", [
        "CE_Modelos.ts L76-81:",
        "  get rol(): Rol | null {",
        "    if (this.roles && this.roles.length > 0) return this.roles[0].rol;",
        "    return null;",
        "  }",
        "",
        "usuarios_roles es una tabla de varios a varios, y el usuario puede",
        "tener mas de un rol. Este getter devuelve el primero, sin mirar los",
        "demas.",
        "",
        "Como el token se firma con ese valor, L75-79, un usuario con dos",
        "roles entra con el rol uno y con los permisos del rol uno. El",
        "frontend recibe el mismo permiso recortado en AuthResponse, L94-100.",
        "",
        "Un empleado con rol Cajero y rol Supervisor se autentica como Cajero",
        "y no puede ni ver la caja. No es un caso raro: es cualquier usuario",
        "con dos filas en usuarios_roles."
    ]],
    ["7. El 423 LOCKED delata que una cuenta existe", [
        "Tres caminos de error, tres codigos:",
        "  usuario inexistente       401  L45",
        "  estado <> activo          401  L50",
        "  contrasena incorrecta     401  L68",
        "  cuenta bloqueada          423  L54-57",
        "",
        "Que los tres 401 sean el mismo texto, 'Credenciales invalidas.', esta",
        "bien hecho: no permite distinguir usuario de contrasena. Ese detalle",
        "esta bien resuelto.",
        "",
        "El 423 no lo esta. 'Cuenta temporalmente bloqueada. Intenta en unos",
        "minutos.' solo se puede leer si la cuenta EXISTE. Con una lista de",
        "correos se puede comprobar cuales estan dados de alta, solo hay que",
        "intentar el quinto fallo a cada uno. El caso de uso no lo menciona."
    ]],
    ["8. Tres codigos de error y el frontend solo sabe tratar uno", [
        "Login.tsx L53-59:",
        "  si err.status === 401  -> 'Correo o contrasena incorrectos.'",
        "  en cualquier otro caso -> err.message, el texto crudo del backend",
        "",
        "El backend devuelve cuatro codigos distintos: 401, 422 y 423. El",
        "frontend solo distingue el 401. Los otros dos salen tal cual, y el",
        "422 ni se puede producir desde la propia pagina, porque L43-46 ya",
        "filtra los campos vacios antes de llamar.",
        "",
        "Quiere decir que la validacion del DTO LoginRequest, con sus",
        "decoradores IsString e IsNotEmpty de Esquemas.ts, es inalcanzable",
        "desde la pantalla. Solo la pueden tocar los clientes externos."
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
// se deja algo de una pasada anterior, se queda amontonado en el origen y
// encima de lo recien colocado.
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
// fichero. Si esto se cambia a positivo, los 21 objetos caen en el mismo
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU01."; } catch (e) { }
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
    // El titulo, arriba a la izquierda, en la banda libre sobre la primera
    // cabecera: de la y 30 a la 62. Las cabeceras empiezan en la 130.
    var t = "l=40;r=" + (X0 + 700) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU01  Iniciar Sesion en Plataforma"; } catch (e) { }
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
    // La leyenda, de la y 186 a la 236, entre las cabeceras y el primer
    // mensaje, que cae en la 250. No solapa con nada.
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja: lo que esta mas arriba pasa antes. Cada mensaje lleva el fichero y la linea de donde sale. Lo que va entre corchetes es la guarda, el camino de error que toma el codigo. Las flechas de punta abierta son retornos."; } catch (e) { }
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
// en EA es Sequence. Con la sintaxis estricta activada EA avisa, pero el
// conector se crea igualmente. La etiqueta va COMPLETA, con el fichero y
// la linea: recortarla es lo que hacia que el diagrama dejara de ser
// trazable.
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
//
// No hay ninguna llamada a SQL en este script, ni a ExecuteSQL, ni a
// Execute, ni a SQLQuery. Nada de eso hace falta para colocar un
// diagrama, y en esta instalacion esas llamadas devuelven un error de la
// capa de base de datos de EA que para el script.
//
// La comprobacion lee las coordenadas de cada objeto y cuenta cuantos
// tienen la Y crecida, o sea con Bottom menor que Top. Si la colocacion
// ha funcionado, todos la tienen.
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
    N.push("CU01  Iniciar Sesion en Plataforma.  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Usuario        «actor»     la persona que escribe");
    N.push("    Login.tsx            «boundary»  web/src/pages/Login.tsx");
    N.push("    AuthContext          «control»   web/src/contexts/AuthContext.tsx");
    N.push("    api.ts               «boundary»  web/src/lib/api.ts");
    N.push("    CTR_Auth             «control»   el @Post('login') de CTR_Auth.ts");
    N.push("    SRV_AuthService      «control»   el autenticar() de SRV_AuthService.ts");
    N.push("    SRV_SeguridadService «control»   el bcrypt.compare de SRV_SeguridadService.ts");
    N.push("    SRV_JWTService       «control»   el generarPar de SRV_JWTService.ts");
    N.push("    SRV_BitacoraService  «control»   el registrar de SRV_BitacoraService.ts");
    N.push("    PostgreSQL           «entity»    4 tablas y 1 trigger de schema.sql");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes: 30 tocan el backend y 8 el navegador. 9 van a la base de datos y");
    N.push("  8 salen hacia el navegador o el actor. 17 son mensajes a si mismo y 4 son");
    N.push("  retornos, dibujados con punta de flecha abierta.");
    N.push("  6 llevan la guarda escrita entre corchetes, 5 son el punto donde el codigo");
    N.push("  lanza una excepcion, y hay 3 codigos HTTP distintos: 401, 422 y 423.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("DE DONDE SALE CADA MENSAJE");
    N.push("");
    N.push("Del codigo, no de la descripcion del caso de uso. Cada mensaje lleva el");
    N.push("fichero y la linea. Y hay una razon de fondo: la descripcion del caso y el");
    N.push("codigo no coinciden. El caso habla de permisos y de sesion, y el codigo");
    N.push("hace las dos cosas de otra manera. Los ocho hallazgos salen de ahi.");
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  La tabla sesiones nunca recibe una fila. Ni al entrar ni al salir. El");
    N.push("     logout la actualiza, y como no hay nada, no cierra nada. La tabla");
    N.push("     tiene siete columnas, con ip_origen y user_agent, y no se usan nunca.");
    N.push("  2  La cookie es httpOnly, pero el mismo token se guarda en localStorage.");
    N.push("     Con las dos vias abiertas, el httpOnly no protege nada ante un XSS.");
    N.push("  3  COOKIE_SECURE vale false en el .env. Las cookies viajan sin la marca");
    N.push("     Secure, y sameSite:'lax' no cubre el caso de una bajada a HTTP.");
    N.push("  4  JWT_SECRET es el texto de ejemplo: 41 caracteres que empiezan por");
    N.push("     'cambia'. Y el codigo lo pone de defecto tambien, SRV_JWTService.ts");
    N.push("     L29, asi que si falta la variable la aplicacion arranca y firma con");
    N.push("     una clave publica.");
    N.push("  5  El bloqueo por 5 intentos esta en el codigo y en el trigger. El codigo");
    N.push("     pone el contador a cero antes de que el trigger lo mire, asi que el");
    N.push("     trigger no se dispara nunca por esta via, y el bloqueo que ocurre es el");
    N.push("     del codigo, que no toca estado. Eso esta bien.");
    N.push("");
    N.push("     El problema es el trigger. Si llegara a dispararse, pondria");
    N.push("     estado='Bloqueado' PERMANENTE, y de ahi no se sale: el boton de");
    N.push("     Rehabilitar, CU07, solo toca filas con LOWER(estado)='inactivo',");
    N.push("     SRV_EmpleadosService.ts L286, y un 'Bloqueado' no es un 'inactivo'.");
    N.push("     Ademas contesta 409, L290. El unico otro sitio que repone");
    N.push("     estado='Activo' es establecerPrimeraContrasena, L365, y su token queda");
    N.push("     usado en L370 la primera vez que funciona.");
    N.push("");
    N.push("     O sea: el trigger convierte un bloqueo de 15 minutos en una cuenta que");
    N.push("     solo arregla un UPDATE a mano. Hoy no hace nada. El dia que alguien");
    N.push("     reordene esas dos lineas, un cliente que se equivoque cinco veces");
    N.push("     pierde su cuenta y el administrador no puede devolversela con el boton.");
    N.push("  6  usuario.rol es un getter que devuelve roles[0].rol, CE_Modelos.ts L76-81.");
    N.push("     Con dos roles en usuarios_roles, el token solo lleva el primero y los");
    N.push("     permisos solo los de ese. Un Cajero que sea tambien Supervisor entra");
    N.push("     como Cajero y no ve la caja.");
    N.push("  7  El 423 LOCKED dice 'Cuenta temporalmente bloqueada', que solo se puede");
    N.push("     leer si la cuenta existe. Los tres 401 si estan bien: el mismo texto y no");
    N.push("     distinguen usuario de contrasena. El 423 si distingue.");
    N.push("  8  El backend devuelve 401, 422 y 423. Login.tsx solo trata el 401, y el 422");
    N.push("     ni se puede producir desde la pagina, que ya filtra los campos vacios en");
    N.push("     L43-46. La validacion del DTO LoginRequest es inalcanzable desde aqui.");
    N.push("");
    N.push("LO QUE ESTA BIEN, Y NO ES POCO");
    N.push("");
    N.push("  - Los tres caminos de error que no dependen de la clave devuelven el mismo");
    N.push("    texto, 'Credenciales invalidas.', y los tres 401 son indistinguibles entre");
    N.push("    si. Eso es exactamente lo que hay que hacer, y esta hecho.");
    N.push("  - La credencial se normaliza antes de buscar, L37, con trim y toLowerCase, y");
    N.push("    la busqueda acepta correo o CI en el mismo campo.");
    N.push("  - Los dos tokens llevan jti, SRV_JWTService.ts L50 y L63, que es lo que");
    N.push("    permite revocarlos uno a uno. El logout los mete en token_blacklist y el");
    N.push("    guard los consulta en cada peticion, dependencias.ts L40.");
    N.push("  - La cookie del access_token dura lo mismo que el token, 15 minutos, y la");
    N.push("    del refresh 7 dias, con el maxAge tomado de la misma variable que firma el");
    N.push("    token. No se pueden desincronizar.");
    N.push("  - La bitacora se escribe con la IP y el user agent en los cuatro caminos,");
    N.push("    y tambien en el de error, que es donde hace falta.");
    N.push("  - El frontend manda credentials:'include' en todas las peticiones, y el");
    N.push("    guard acepta el token por encabezado o por cookie. Funciona con las dos.");
    N.push("");
    N.push("SOBRE LA COLOCACION DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Anchura: las diez cabeceras separadas " + PASO + " px, con " + ANCHO_CAB + " de ancho. Quedan");
    N.push("  65 px entre una y otra, que es lo que necesitan las etiquetas largas para");
    N.push("  caber enteras sin cortarse. Altura: " + PASO_MSG + " px por mensaje. El mensaje 1 cae en la");
    N.push("  y " + Y_MSG0 + " y el 38 en la y " + (Y_MSG0 + (TOTAL_MSG - 1) * PASO_MSG) + ".");
    N.push("");
    N.push("  Un detalle que hizo fallar este diagrama seis veces y que conviene no");
    N.push("  olvidar: EA guarda Top y Bottom en NEGATIVO, porque trabaja en");
    N.push("  coordenadas cartesianas con la Y creciendo hacia arriba. Si se le pasa");
    N.push("  la Y en positivo no da error, simplemente no coloca nada y todos los");
    N.push("  objetos se quedan en el mismo punto. En las dos funciones de colocacion");
    N.push("  de este script esta escrito o.Top = 0 - y y o.Bottom = 0 - y - alto. En el");
    N.push("  AddNew, en cambio, la Y va en positivo, porque ahi EA ya la convierte.");
    N.push("");
    N.push("  Comprobacion de esta ejecucion, leida del modelo de objetos:");
    N.push("    objetos en el diagrama: " + ch.leidos);
    N.push("    con la Y crecida, o sea colocados: " + ch.bien);
    N.push("    mensajes dibujados: " + r.puestos + " de " + TOTAL_MSG);
    N.push("    mensajes a si mismo: " + r.autodestino);
    N.push("    conectores en el diagrama: " + r.enDiagrama);
    N.push("");
    N.push("  Si las flechas se dibujaran todas en el mismo punto, se seleccionan las");
    N.push("  38 y se pulsa Supr y luego la flecha del menu de contexto, y EA las");
    N.push("  reparte por orden temporal. Lo que no habria que tocar nunca es la");
    N.push("  posicion de las cabeceras, que es lo que el script coloca.");
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS QUE YA EXISTEN");
    N.push("");
    N.push("  Este diagrama y los 36 diagramas de clases dicen cosas distintas. Los");
    N.push("  de clases dicen QUE clases hay y QUE metodos tienen. Este dice EN QUE");
    N.push("  ORDEN se llaman, con el resultado de cada uno y con lo que se escribe");
    N.push("  en la base de datos. Un metodo puede estar en el diagrama de clases y no");
    N.push("  aparecer en ningun diagrama de secuencia, y al reves.");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU01 Secuencia", 0); } catch (e) { }
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
    T.push("CU01 - DIAGRAMA DE SECUENCIA - INFORME");
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
    msg = msg + "CU01 - Iniciar Sesion en Plataforma" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO;
    msg = msg + "Todo sale del codigo, con el fichero y la linea." + SALTO + SALTO;
    msg = msg + "LO MAS GRAVE: la tabla sesiones nunca recibe" + SALTO;
    msg = msg + "una fila. Ni al entrar ni al salir. Y JWT_SECRET" + SALTO;
    msg = msg + "sigue siendo el texto de ejemplo del .env." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU01 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU01 Secuencia", 0); } catch (e3) { }
}
