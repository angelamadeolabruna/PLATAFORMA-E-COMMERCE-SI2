// ================================================================
// PAQUETE 1  ·  ARQUITECTURA DEL SUBSISTEMA
// Seguridad y Auditoria  ·  CU01, CU03, CU08
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 5.3.1
//
// QUE DIBUJA
//   El diagrama de componentes del paquete 1, con los 20 componentes
//   del subsistema y las 33 interfaces entre ellos, y TODO DENTRO de
//   un marco que se llama PAQUETE 1 - SEGURIDAD Y AUDITORIA, con las
//   6 capas dibujadas como marcos mas pequenos dentro de ese marco.
//
//   20 componentes:  6 de presentacion, 2 de control, 1 de seguridad,
//                    6 de logica de negocio, 3 de datos y 2 externos
//   33 interfaces:  5 de pantalla al cliente HTTP, 2 del cliente a los
//                    controladores, 18 de codigo, 6 a la base de datos
//                    y 2 a los externos
//
// PATRON COPIADO DE CAPAS_diagrama_por_capas.js, QUE SI DIBUJA BIEN
//   -  Los marcos son Package REALES del modelo, colocados en el
//      diagrama con Sequence = 1 para que EA los deje DETRAS del
//      contenido.  El nombre del Package es la etiqueta del marco.
//      No son formas ni rectangulos de texto.
//   -  LAS COORDENADAS VERTICALES VAN EN NEGATIVO: o.Top = 0 - arr
//      y o.Bottom = 0 - arr - alto.  EA las guarda assim.  En positivo
//      el diagrama sale en blanco.
//   -  DOS PASADAS con guardarYRecargar entre ellas: Update, Reload,
//      Open y GetDiagramByID.  Una sola pasada no guarda las
//      coordenadas.
//   -  El conector se crea en el PAQUETE y se coloca a mano con
//      con.DiagramID = diag.ID, y se reutiliza si coincide nombre y
//      estereotipo.
//
// DE DONDE SALE CADA COSA
//   Las 9 rutas, los 5 controladores del modulo seguridad que usan el
//   paquete, los 6 servicios, las 13 entidades de CE_Modelos y los
//   DTOs de Esquemas: leyendo api/src/modulos/seguridad.  Las 5
//   pantallas, leyendo web/src/pages.  Las 34 interfaces, leyendo los
//   statements import del paquete y las llamadas que hace cada uno.
//
// Aviso con WScript.Shell.Popup.  Sin llamadas a SQL y sin
// SaveDiagram.  Una instruccion por linea.  Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================


var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var PAQ_NOMBRE = "Paquete 1 - Seguridad y Auditoria";
var DIAG_NOMBRE = "Arquitectura del Paquete 1";

var TOTAL_CMP = 20;
var TOTAL_REL = 33;
var TOTAL_CAP = 6;

var ERRORES = [];
var INFORME = [];


// El marco de todo el diagrama.  Es un Package, como los de capa.
var MARCO_NOMBRE = "PAQUETE 1 - SEGURIDAD Y AUDITORIA";
var MARCO_X = 10;
var MARCO_Y = 10;
var MARCO_W = 1670;
var MARCO_H = 700;
var MARCO_COLOR = 15132358;

// Los 6 marcos de capa: nombre, izquierda, arriba, ancho, alto, color
var CAPAS = [
    ["Presentacion", 30, 60, 700, 200, 13421823],
    ["Control", 30, 300, 700, 180, 13434879],
    ["Seguridad", 30, 520, 700, 150, 13434828],
    ["Logica de Negocio", 770, 60, 520, 610, 16777164],
    ["Datos", 1330, 60, 310, 340, 16770790],
    ["Externos", 1330, 440, 310, 200, 16247743]
];


// ================================================================
// LOS 20 COMPONENTES   [nombre, capa, nota]
//
//   Los nombres son TAL CUAL: el nombre del fichero, sin prefijo
//   inventado.  Los del backend conservan su CTR_, SRV_ y CE_.
// ================================================================

var PAQ = [

    // ---------------- PRESENTACION: 6 ----------------

    ["Login.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU01 Iniciar Sesion | FICHERO: web/src/pages/Login.tsx | QUE HACE: el formulario de acceso. Dos useState, uno para la credencial y otro para la contrasena, y un onSubmit que primero comprueba que no esten vacias | LLAMA: login(credencial, password) del AuthContext, que a su vez llama a api.login() | ANTES DE ENVIAR NADA: llama a leerIntencionReserva(), que lee el sessionStorage. Si habia una prenda reservada a medias, al iniciar sesion devuelve al cliente a esa pantalla y no a la portada | ERRORES: distingue un ApiError del servidor de un fallo de conexion, y los dos textos son distintos | RUTA QUE CONSUME: POST /api/v1/auth/login"],

    ["RecuperarContrasena.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: NINGUNO de los 36. La pantalla existe y funciona, pero el caso no esta en la lista | FICHERO: web/src/pages/RecuperarContrasena.tsx | LLAMA: api.forgotPassword(email.trim()) | RUTA: POST /api/v1/auth/forgot-password | VALIDA: el formato del correo en el cliente antes de enviarlo | ESTADO REAL: el backend crea el token en password_resets correctamente, pero el correo no sale nunca, porque el servicio de correo esta sin implementar. Ver el componente SRV_EmailService | NO FUNCIONA DE PUNTA A PUNTA"],

    ["RestablecerContrasena.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: NINGUNO de los 36, como la anterior | FICHERO: web/src/pages/RestablecerContrasena.tsx | LEE: el parametro token de la URL con useSearchParams, o sea que espera un enlace de un solo uso | LLAMA: api.resetPassword(token, password) | RUTA: PUT /api/v1/auth/reset-password | VALIDA EN EL CLIENTE: que la contrasena tenga 8 caracteres como minimo y que las dos casillas coincidan | SI FALLA: responde Este enlace no es valido o ya expiro, y ofrece pedir uno nuevo | NO ES ALCANZABLE por el usuario normal, porque el enlace llega por correo y el correo no sale"],

    ["EstablecerContrasena.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: NINGUNO de los 36 | FICHERO: web/src/pages/EstablecerContrasena.tsx | LLAMA: api.firstPassword(token, password) | RUTA: PUT /api/v1/auth/first-password | PARA QUE ES: el primer ingreso de un empleado, que es un flujo distinto del de un cliente y usa otra tabla, first_password_tokens, y otro metodo del servicio, establecerPrimeraContrasena"],

    ["Auditoria.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU08 Consultar Bitacora de Auditoria | FICHERO: web/src/pages/admin/Auditoria.tsx, la unica pantalla de administracion de este paquete | LLAMA: api.listarAuditoria() y api.exportarAuditoriaCSV(), las dos del mismo servicio | RUTAS: GET /api/v1/admin/auditoria y GET /api/v1/admin/usuarios-email | LA SEGUNDA RUTA NO ES DEL CASO CU08: sirve para alimentar el selector de usuario del filtro, y es la unica razon por la que existe | EXPORTA: el listado se descarga como CSV, y lo genera el mismo servicio con la misma consulta"],

    ["api.ts", "Presentacion",
    "CAPA: Presentacion | FICHERO: web/src/lib/api.ts | QUE ES: el cliente HTTP del paquete, y la unica puerta por la que salen las peticiones de estas cinco pantallas | COMO LLAMA: fetch con credentials: 'include' en las dos variantes, con y sin cabecera, para que viaje la cookie httpOnly, y con Authorization cuando hay token | RENOVACION: cuando el token caduca llama a POST /auth/refresh y guarda el nuevo en localStorage, y despacha el evento tm:sesion de la ventana para que el AuthContext se entere. Guarda la promesa de renovacion en una variable, para que veinte llamadas simultaneas no renueven veinte veces | RUTAS QUE EXPONE: las 7 de /auth y las 2 de /admin, o sea las 9 del paquete, mas todas las de los otros nueve paquetes"],

    // ---------------- CONTROL: 2 ----------------

    ["CTR_Auth", "Control",
    "CAPA: Control | CASOS: CU01 y CU03 | FICHERO: api/src/modulos/seguridad/CTR_Auth.ts | RUTAS: 7, todas bajo @Controller('auth'), o sea /api/v1/auth: POST login, POST refresh, POST logout, PUT cambiar-password, POST forgot-password, PUT reset-password y PUT first-password | LAS GUARDIAS NO ESTAN TODAS IGUAL, Y ES LO IMPORTANTE: logout y cambiar-password llevan @UseGuards(JwtAuthGuard) a nivel de METODO. Las otras cinco no llevan ninguna, y no es un descuido: sin token no se puede pedir un token, y un token caducado se recupera por la misma via | NO TIENE LOGICA DE NEGOCIO NINGUNA: las siete reciben el cuerpo, lo pasan a SRV_AuthService y devuelven lo que el servicio devuelve | IMPORTA: SRV_AuthService, Esquemas, dependencias y CE_Modelos"],

    ["CTR_Auditoria", "Control",
    "CAPA: Control | CASO: CU08 | FICHERO: api/src/modulos/seguridad/CTR_Auditoria.ts | RUTAS: 2, bajo @Controller('admin'), o sea /api/v1/admin: GET auditoria y GET usuarios-email | GUARDIA: @UseGuards(JwtAuthGuard) a NIVEL DE CLASE, de manera que las dos rutas quedan protegidas de una vez. Es el otro criterio del modulo, y no es el mismo que el de CTR_Auth | IMPORTA: SRV_AuditoriaService, dependencias y CE_Modelos | OJO CON EL PREFIJO: admin lo comparten tambien CTR_Roles, CTR_Empleados y CTR_Sucursales, que son de los paquetes 2 y 3"],

    // ---------------- SEGURIDAD: 1 ----------------

    ["dependencias.ts", "Seguridad",
    "CAPA: Seguridad | FICHERO: api/src/modulos/seguridad/dependencias.ts, 148 lineas | EXPORTA CUATRO COSAS: JwtAuthGuard, UsuarioActual, JwtOpcionalAuthGuard y CredencialesCarritoActual | QUE HACE LA GUARDIA: lee el token de la cabecera Authorization con el prefijo Bearer y, si no esta, de la cookie httpOnly access_token, que es el segundo camino y el que usa el navegador | QUE VERIFICA: la firma con SRV_JWTService, y despues consulta token_blacklist por el jti para aceptar un token que se haya revocado | UsuarioActual ES UN createParamDecorator: no vuelve a preguntar por el usuario, inyecta el que la guarda ya verifico | LO CONSUMEN 4 de los 5 controladores del modulo seguridad, y ademas 14 controladores de los otros 14 modulos"],

    // ---------------- LOGICA DE NEGOCIO: 6 ----------------

    ["SRV_AuthService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: SRV_AuthService.ts, 426 lineas | METODOS: 7. autenticar, refrescar, cerrarSesion, solicitarRecuperacion, restablecerContrasena, establecerPrimeraContrasena y cambiarPassword | ES EL CORAZON DEL PAQUETE | EL METODO autenticar, EN 67 LINEAS: normaliza la credencial a minusculas y sin espacios, busca al usuario, si no existe registra LOGIN_FAILED con el motivo usuario_no_existente, si su estado no es activo responde con el motivo usuario_inactivo, si bloqueado_hasta es una fecha futura responde 423 Locked con un mensaje distinto, valida la contrasena, y si falla suma un intento y al llegar a CINCO fija el bloqueo quince minutos y reinicia el contador | SI ACIERTA: pone el contador a cero, limpia el bloqueo, actualiza fecha_ultimo_acceso, genera el par de tokens CON EL ROL Y LOS PERMISOS DENTRO, y registra LOGIN | REPOSITORIOS: cinco, todos de TypeORM. Usuario, Sesion, TokenBlacklist, PasswordReset y FirstPasswordToken | IMPORTES: CE_Modelos, Esquemas, SRV_BitacoraService, SRV_EmailService, SRV_JWTService y SRV_SeguridadService | SIN TRANSACCION: sus siete metodos escriben entre una y dos tablas"],

    ["SRV_JWTService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: SRV_JWTService.ts, 122 lineas | METODOS: 8. crearAccessToken, crearRefreshToken, generarPar, decodificar, verificarAccessToken, verificarRefreshToken, estaEnBlacklist e invalidar | QUE HACE: firma con jwtService.sign un token de acceso de 15 minutos y uno de refresco de 7 dias, con esos valores por defecto en el propio codigo y el algoritmo HS256 | generarPar DEVUELVE LOS DOS JUNTOS, y es lo que usa SRV_AuthService en el unico sitio del proyecto donde se emiten | LA REVOCACION: estaEnBlacklist consulta la tabla token_blacklist por el jti, e invalidar mete la fila. Eso permite que un token siga siendo criptograficamente valido y aun asi no se acepte, que es lo que hace el cierre de sesion | REPOSITORIO: TokenBlacklist | ES EL UNICO SERVICIO DEL PAQUETE QUE USA LA LIBRERIA DE JWT"],

    ["SRV_SeguridadService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: SRV_SeguridadService.ts, 18 LINEAS | METODOS: 2. hashearPassword y validarPassword | TODO EL CIFRADO DEL PROYECTO SON ESTAS 18 LINEAS: hashearPassword es bcrypt.hash(password, 10) con diez rondas, y validarPassword es bcrypt.compare(password, usuario.password_hash), con la excepcion capturada y devuelta como false | NO ACCEDE A LA BASE DE DATOS: compara el hash que le dan contra el hash guardado y no guarda nada | LO USA SOLO SRV_AuthService, y en un unico sitio, la linea 60 de autenticar | ES EL COMPONENTE MAS PEQUEÑO DEL PAQUETE Y EL MAS DELICADO, porque de el sale la unica decision de seguridad del sistema"],

    ["SRV_BitacoraService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: SRV_BitacoraService.ts, 40 lineas | UN SOLO METODO: registrar | OCHO PARAMETROS: idUsuario, accion, tabla, detalle, request, idRegistro, oldData y newData | QUE GUARDA: ademas de la accion y la tabla, la IP que sale de request.ip y el user agent de la cabecera, y el estado anterior y el posterior de la fila en las columnas old_data y new_data. Es la unica parte del proyecto que guarda el antes y el despues de un cambio | ESCRIBE CON TYPEORM, en la tabla bitacora_auditoria | A EL VAN TODAS LAS LLAMADAS DE AUDITORIA DEL SISTEMA, y es lo que hace que CU08 tenga datos que mostrar"],

    ["SRV_EmailService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: SRV_EmailService.ts, 103 lineas | METODOS DE ENVIO: 4. enviarBienvenida, enviarPrimeraContrasena, enviarRecuperacionContrasena y enviarAvisoReserva | CADA UNO HACE LO MISMO: comprueba EMAIL_ENABLED y, si esta en false, escribe dos lineas en el registro con el prefijo [EMAIL SIMULADO] y DEVUELVE TRUE | SI ESTA EN TRUE, llama a _enviarViaSmtp, QUE NO ESTA IMPLEMENTADO: en las lineas 100 y 101 ese metodo lanza el error SMTP aun no configurado en el prototipo | CONSECUENCIA: el paquete tiene tres rutas de correo, forgot-password, reset-password y first-password, y NINGUNA llega al usuario. El backend responde exito, y el enlace no existe | EMAIL_ENABLED ESTA EN FALSE POR DEFECTO, o sea que el comportamiento por defecto del proyecto es el de simular"],

    ["SRV_AuditoriaService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: SRV_AuditoriaService.ts, 198 lineas | METODOS: 3. consultar, exportarCSV y listarEmails | LA DECISION QUE MEJORA EL PAQUETE: consultar y exportarCSV comparten la funcion construirQuery, que es un QueryBuilder de TypeORM sobre BitacoraAuditoria. Asi el listado y el archivo CSV no pueden discordar nunca, porque salen de la misma consulta | exportarCSV GENERA EL CSV EN MEMORIA y lo devuelve como texto, no escribe ningun archivo | REPOSITORIOS: BitacoraAuditoria y Usuario, este ultimo para resolver los nombres del filtro | IMPORTA: solo CE_Modelos, y es el unico servicio del paquete que no depende de ningun otro servicio"],

    // ---------------- DATOS: 3 ----------------

    ["CE_Modelos", "Datos",
    "CAPA: Datos | FICHERO: api/src/modulos/seguridad/CE_Modelos.ts | SON 13 ENTIDADES MAPEADAS, Y SON LAS 13 UNICAS DEL PROYECTO ENTERO | LAS DE ESTE PAQUETE, 10: Rol, Usuario, UsuarioRol, UsuarioEmpleado, FirstPasswordToken, EmailConfirmation, PasswordReset, TokenBlacklist, Sesion y BitacoraAuditoria | LAS OTRAS 3 SON DE OTROS PAQUETES: Ciudad y Sucursal del paquete 3, y ReporteGenerativo del paquete 10 | POR QUE IMPORTA: de las 51 tablas del esquema, solo 13 tienen entidad mapeada. Las otras 38 se consultan con SQL crudo escrito a mano en cada servicio. Este paquete es el unico que usa el repositorio como se debe"],

    ["Esquemas", "Datos",
    "CAPA: Datos | FICHERO: api/src/modulos/seguridad/Esquemas.ts | QUE ES: los objetos de transferencia de entrada y salida, con sus reglas de class-validator | LOS QUE USA CTR_Auth: CambiarPasswordRequest, FirstPasswordRequest, ForgotPasswordRequest y ResetPasswordRequest de entrada, y AuthResponse de salida | COMO SE VALIDAN: el ValidationPipe global de main.ts lleva whitelist: true, de manera que descarta cualquier campo que no este declarado aqui. La validacion vive en este fichero y no en el controlador | ES UNA HOJA DEL DIAGRAMA: no importa ningun servicio y nadie lo importa de forma circular"],

    ["PostgreSQL 16", "Datos",
    "CAPA: Datos | LAS TABLAS DEL PAQUETE SON 10: usuarios, roles, usuarios_roles, usuarios_empleados, sesiones, token_blacklist, password_resets, first_password_tokens, email_confirmations y bitacora_auditoria | ACCESO: CON REPOSITORIOS DE TYPEORM, y eso es lo que lo distingue de los otros nueve paquetes, que consultan con dataSource.query y SQL escrito a mano | INTEGRIDAD: usuarios.email, usuarios.ci, roles.nombre_rol y usuarios_empleados.usuario_id son UNIQUE, y bitacora_auditoria declara su clave foranea con ON DELETE SET NULL, de modo que el registro de una operacion sobreviva al borrado del usuario que la hizo | UN DISPARADOR LE AFECTA: trg_bloquear_usuario_5_intentos, que bloquea la cuenta tras cinco intentos fallidos. O SEA QUE EL BLOQUEO EXISTE DOS VECES: en el trigger y en la linea 62 de SRV_AuthService"],

    // ---------------- EXTERNOS: 2 ----------------

    ["bcrypt", "Externos",
    "CAPA: Externo | QUE ES: la libreria de cifrado, version 6.0 | LO USA SOLO SRV_SeguridadService, con diez rondas | NINGUNA OTRA PARTE DEL PROYECTO LEE NI ESCRIBE UN HASH DE CONTRASENA: las comparaciones salen de los dos metodos de ese servicio de 18 lineas | ES LA UNICA LIBRERIA DE CIFRADO DEL PROYECTO"],

    ["Correo SMTP", "Externos",
    "CAPA: Externo | QUE ES: el servidor de correo que deberia enviar la confirmacion de cuenta, la primera contrasena, la recuperacion y los avisos de reserva | VARIABLES: EMAIL_ENABLED, SMTP_HOST, EMAIL_FROM y EMAIL_BASE_URL | ESTADO REAL: DECLARADO Y NO IMPLEMENTADO. El metodo _enviarViaSmtp de SRV_EmailService lanza el error SMTP aun no configurado en el prototipo, en las lineas 100 y 101 | Y CON EMAIL_ENABLED EN FALSE, QUE ES SU VALOR POR DEFECTO, NI SIQUIERA LLEGA A LLAMARLO | ESTE ES EL UNICO COMPONENTE DEL PAQUETE CUYA INTERFAZ ESTA DECLARADA Y NO FUNCIONA, y arrastra a las tres rutas de contrasena"]
];


// ================================================================
// LAS 33 INTERFACES   [origen, destino, nombre, tipo, estereotipo]
//
//   Las 5 primeras son de pantalla al cliente HTTP.  Las 2 siguientes
//   del cliente a los controladores, y llevan las 9 rutas.
//   Las 18 siguientes son dependencias de codigo, que son los
//   statements import del paquete.  Las 6 ultimas son a la base de
//   datos, y las 2 anteriores a los externos.
// ================================================================

var REL = [

    ["Login.tsx", "api.ts", "login(credencial, password)", "Assembly", "llama"],
    ["RecuperarContrasena.tsx", "api.ts", "forgotPassword(email)", "Assembly", "llama"],
    ["RestablecerContrasena.tsx", "api.ts", "resetPassword(token, password)", "Assembly", "llama"],
    ["EstablecerContrasena.tsx", "api.ts", "firstPassword(token, password)", "Assembly", "llama"],
    ["Auditoria.tsx", "api.ts", "listarAuditoria y exportarCSV", "Assembly", "llama"],

    ["api.ts", "CTR_Auth", "HTTP/JSON, 7 rutas de /auth", "Assembly", "expone"],
    ["api.ts", "CTR_Auditoria", "HTTP/JSON, 2 rutas de /admin", "Assembly", "expone"],

    ["CTR_Auth", "SRV_AuthService", "7 metodos, uno por ruta", "Dependency", "delega"],
    ["CTR_Auth", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_Auth", "CE_Modelos", "Usuario", "Dependency", "importa"],
    ["CTR_Auth", "Esquemas", "4 peticiones y AuthResponse", "Dependency", "importa"],

    ["CTR_Auditoria", "SRV_AuditoriaService", "consultar, exportarCSV, listarEmails", "Dependency", "delega"],
    ["CTR_Auditoria", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_Auditoria", "CE_Modelos", "Usuario y BitacoraAuditoria", "Dependency", "importa"],

    ["SRV_AuthService", "SRV_SeguridadService", "validarPassword, 1 llamada", "Dependency", "delega"],
    ["SRV_AuthService", "SRV_JWTService", "generarPar e invalidar", "Dependency", "delega"],
    ["SRV_AuthService", "SRV_BitacoraService", "registrar, 4 llamadas", "Dependency", "delega"],
    ["SRV_AuthService", "SRV_EmailService", "3 envios de contrasena", "Dependency", "delega"],
    ["SRV_AuthService", "CE_Modelos", "5 repositorios TypeORM", "Dependency", "importa"],
    ["SRV_AuthService", "Esquemas", "AuthResponse y 3 peticiones", "Dependency", "importa"],

    ["SRV_JWTService", "CE_Modelos", "TokenBlacklist", "Dependency", "importa"],
    ["SRV_BitacoraService", "CE_Modelos", "BitacoraAuditoria", "Dependency", "importa"],
    ["SRV_AuditoriaService", "CE_Modelos", "BitacoraAuditoria y Usuario", "Dependency", "importa"],
    ["dependencias.ts", "SRV_JWTService", "verificarAccessToken y estaEnBlacklist", "Dependency", "delega"],
    ["dependencias.ts", "CE_Modelos", "Usuario", "Dependency", "importa"],

    ["SRV_AuthService", "PostgreSQL 16", "TypeORM, 5 repositorios", "Assembly", "consulta"],
    ["SRV_JWTService", "PostgreSQL 16", "TypeORM, token_blacklist", "Assembly", "consulta"],
    ["SRV_BitacoraService", "PostgreSQL 16", "TypeORM, bitacora_auditoria", "Assembly", "escribe"],
    ["SRV_AuditoriaService", "PostgreSQL 16", "TypeORM QueryBuilder", "Assembly", "consulta"],
    ["dependencias.ts", "PostgreSQL 16", "TypeORM, Usuario", "Assembly", "consulta"],
    ["CE_Modelos", "PostgreSQL 16", "13 entidades mapeadas", "Assembly", "mapea"],

    ["SRV_EmailService", "Correo SMTP", "SMTP, declarado sin implementar", "Dependency", "declarado"],
    ["SRV_SeguridadService", "bcrypt", "hash y compare, 10 rondas", "Dependency", "cifra"]
];


// ================================================================
// DONDE CAE CADA COMPONENTE   [nombre, izquierda, arriba, ancho, alto]
// ================================================================

var DOND = [
    ["Login.tsx", 45, 100, 215, 60],
    ["RecuperarContrasena.tsx", 275, 100, 215, 60],
    ["RestablecerContrasena.tsx", 505, 100, 215, 60],
    ["EstablecerContrasena.tsx", 45, 175, 215, 60],
    ["Auditoria.tsx", 275, 175, 215, 60],
    ["api.ts", 505, 175, 215, 60],

    ["CTR_Auth", 45, 340, 300, 90],
    ["CTR_Auditoria", 375, 340, 300, 90],

    ["dependencias.ts", 45, 560, 400, 70],

    ["SRV_AuthService", 800, 100, 220, 100],
    ["SRV_SeguridadService", 1055, 100, 220, 100],
    ["SRV_JWTService", 800, 255, 220, 100],
    ["SRV_BitacoraService", 1055, 255, 220, 100],
    ["SRV_EmailService", 800, 410, 220, 100],
    ["SRV_AuditoriaService", 1055, 410, 220, 100],

    ["CE_Modelos", 1355, 100, 260, 70],
    ["Esquemas", 1355, 200, 260, 70],
    ["PostgreSQL 16", 1355, 300, 260, 70],

    ["bcrypt", 1355, 480, 260, 70],
    ["Correo SMTP", 1355, 560, 260, 70]
];


function aviso(txt) {
    try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup(txt, 0, "Paquete 1 - Seguridad", 64);
    } catch (e) { }
}

function descError(e) {
    var d = "";
    try { if (e.description != null) d = d + e.description; } catch (x) { }
    if (d === "") { try { d = String(e); } catch (x2) { d = "error desconocido"; } }
    return d;
}


// ---------- LAS UTILIDADES, IGUALES QUE EL SCRIPT DE CAPAS ----------

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
        if (String(padre.Packages.GetAt(i).Name) == nombre) {
            return padre.Packages.GetAt(i);
        }
    }
    var nuevo = padre.Packages.AddNew(nombre, "");
    nuevo.Update();
    padre.Packages.Refresh();
    return buscarPaquete(padre, nombre);
}

function buscarLocal(paq, nombre) {
    for (var i = 0; i < paq.Elements.Count; i++) {
        var e = paq.Elements.GetAt(i);
        if (String(e.Name) == nombre) return e;
    }
    return null;
}

function objetoEn(diag, el) {
    for (var i = 0; i < diag.DiagramObjects.Count; i++) {
        var c = diag.DiagramObjects.GetAt(i);
        if (c.ElementID == el.ElementID) return c;
    }
    return null;
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
    return nuevo;
}


// ---------- EL MARCO: un Package real, con Sequence 1 para que quede detras ----------

function marco(diag, el, izq, arr, ancho, alto, color) {
    if (el == null) return false;
    var o = objetoEn(diag, el);
    if (o == null) {
        var tam = "l=" + izq + ";r=" + (izq + ancho) + ";t=" + arr + ";b=" + (arr + alto) + ";";
        try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e) { return false; }
        o.ElementID = el.ElementID;
    }
    try { o.ManuallySized = true; } catch (e) { }
    try { o.Left = izq; } catch (e) { }
    try { o.Right = izq + ancho; } catch (e) { }
    try { o.Top = 0 - arr; } catch (e) { }
    try { o.Bottom = 0 - arr - alto; } catch (e) { }
    try { o.FontSize = 10; } catch (e) { }
    try { o.TextAlign = 1; } catch (e) { }
    try { o.ShowStereotype = false; } catch (e) { }
    try { o.ShowNotes = false; } catch (e) { }
    try { o.BackGroundColor = color; } catch (e) { }
    try { o.BorderStyle = 1; } catch (e) { }
    try { o.BorderColor = 8421504; } catch (e) { }
    try { o.Sequence = 1; } catch (e) { }
    try { o.Update(); } catch (e) { }
    return true;
}


// ---------- EL RECUADRO: el componente de verdad, con su nombre ----------

function recuadro(diag, el, izq, arr, ancho, alto) {
    var o = objetoEn(diag, el);
    if (o == null) {
        var tam = "l=" + izq + ";r=" + (izq + ancho) + ";t=" + arr + ";b=" + (arr + alto) + ";";
        try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e) { return null; }
        o.ElementID = el.ElementID;
    }
    // LAS COORDENADAS VERTICALES EN NEGATIVO.  EA las guarda assim, y es
    // lo que hace el script de capas.  En positivo sale en blanco.
    try { o.ManuallySized = true; } catch (e) { }
    try { o.Left = izq; } catch (e) { }
    try { o.Right = izq + ancho; } catch (e) { }
    try { o.Top = 0 - arr; } catch (e) { }
    try { o.Bottom = 0 - arr - alto; } catch (e) { }
    try { o.FontSize = 9; } catch (e) { }
    try { o.ShowNotes = false; } catch (e) { }
    try { o.WrapText = true; } catch (e) { }
    try { o.BackGroundColor = 16777215; } catch (e) { }
    try { o.BorderStyle = 1; } catch (e) { }
    try { o.BorderColor = 4210752; } catch (e) { }
    o.Update();
    return o;
}


// ---------- UNA PASADA: el marco grande, las 6 capas y los 20 recuadros ----------

function pintar(diag, C, F) {
    var marcos = 0;
    if (marco(diag, F[MARCO_NOMBRE], MARCO_X, MARCO_Y, MARCO_W, MARCO_H, MARCO_COLOR)) { marcos++; }
    for (var mc = 0; mc < CAPAS.length; mc++) {
        if (marco(diag, F[CAPAS[mc][0]], CAPAS[mc][1], CAPAS[mc][2], CAPAS[mc][3], CAPAS[mc][4], CAPAS[mc][5])) { marcos++; }
    }
    var puestos = 0;
    for (var i = 0; i < DOND.length; i++) {
        var pos = DOND[i];
        if (pos == null) { ERRORES.push("DOND[" + i + "] es null"); continue; }
        var el = C[pos[0]];
        if (el == null) { ERRORES.push("no hay componente " + pos[0]); continue; }
        var o = recuadro(diag, el, pos[1], pos[2], pos[3], pos[4]);
        if (o != null) { puestos++; }
    }
    try { diag.DiagramObjects.Refresh(); } catch (e) { }
    try { diag.Update(); } catch (e) { }
    return puestos + " recuadros y " + marcos + " marcos";
}

function enDiagrama(diag, con) {
    if (diag == null || con == null) return false;
    try { diag.DiagramLinks.Refresh(); } catch (e) { }
    try {
        for (var i = 0; i < diag.DiagramLinks.Count; i++) {
            if (diag.DiagramLinks.GetAt(i).ConnectorID == con.ConnectorID) return true;
        }
    } catch (e) { }
    return false;
}


// ---------- EL CONECTOR ----------

function relacion(diag, a, b, etiqueta, tipo, est) {
    if (a == null || b == null) return 0;
    var i;
    var con = null;
    for (i = 0; i < a.Connectors.Count; i++) {
        var existente = a.Connectors.GetAt(i);
        if (existente.SupplierID == b.ElementID && String(existente.Name) == etiqueta && String(existente.Stereotype) == est) {
            con = existente;
            break;
        }
    }
    if (con == null) {
        try { con = a.Connectors.AddNew("", tipo); } catch (e) { con = null; }
    }
    if (con == null) {
        try { con = a.Connectors.AddNew("", "Association"); } catch (e) { con = null; }
    }
    if (con == null) return 0;
    try { con.ClientID = a.ElementID; } catch (e) { }
    try { con.SupplierID = b.ElementID; } catch (e) { }
    try { con.Update(); } catch (e) { }
    try { con.DiagramID = diag.ID; con.Update(); } catch (e) { }
    try { con.Name = etiqueta; } catch (e) { }
    try { con.Stereotype = est; } catch (e) { }
    try { con.FontSize = 7; } catch (e) { }
    try { con.Update(); } catch (e) { }
    if (enDiagrama(diag, con)) return 1;
    return 0;
}


// ---------- MAIN ----------

function main() {
    var paq = subPaquete(RAIZ, PAQ_NOMBRE);
    try { paq.Diagrams.Refresh(); } catch (e) { }
    try { paq.Elements.Refresh(); } catch (e) { }

    // ---- los 7 marcos, que son Package del modelo
    var F = {};
    var marcosCreados = 0;
    var listaMarcos = [MARCO_NOMBRE];
    for (var mc0 = 0; mc0 < CAPAS.length; mc0++) { listaMarcos.push(CAPAS[mc0][0]); }
    for (var fm = 0; fm < listaMarcos.length; fm++) {
        var nomM = String(listaMarcos[fm]).replace(/\s+/g, " ");
        var me = buscarLocal(paq, nomM);
        if (me == null) {
            try { me = paq.Elements.AddNew(nomM, "Package"); } catch (e) { me = null; }
        }
        if (me != null) {
            try { me.Name = nomM; me.Stereotype = ""; me.Update(); } catch (e) { }
            F[nomM] = me;
            marcosCreados++;
        } else {
            ERRORES.push("no se pudo crear el marco " + nomM);
        }
    }
    try { paq.Elements.Refresh(); } catch (e) { }

    // ---- los 20 componentes
    var C = {};
    var creados = 0;
    for (var i = 0; i < PAQ.length; i++) {
        var def = PAQ[i];
        if (def == null) { ERRORES.push("PAQ[" + i + "] es null"); continue; }
        var el = buscarLocal(paq, def[0]);
        if (el == null) {
            try { el = paq.Elements.AddNew(def[0], "Component"); } catch (e) { el = null; }
            if (el == null) { try { el = paq.Elements.AddNew(def[0], "Class"); } catch (e2) { el = null; } }
        }
        if (el == null) { ERRORES.push("no se pudo crear " + def[0]); C[def[0]] = null; continue; }
        try { el.Name = def[0]; el.Stereotype = ""; el.Notes = def[2]; el.Update(); } catch (e) { }
        C[def[0]] = el;
        if (el.ElementID != 0) { creados++; }
    }
    try { paq.Elements.Refresh(); } catch (e) { }

    // ---- el diagrama
    var diag = null;
    for (var d = 0; d < paq.Diagrams.Count; d++) {
        if (String(paq.Diagrams.GetAt(d).Name) == DIAG_NOMBRE) { diag = paq.Diagrams.GetAt(d); break; }
    }
    if (diag == null) {
        try { diag = paq.Diagrams.AddNew(DIAG_NOMBRE, "Component"); } catch (e) { diag = null; }
    }
    if (diag == null) { try { diag = paq.Diagrams.AddNew(DIAG_NOMBRE, "Class"); } catch (e2) { diag = null; } }
    if (diag == null) { ERRORES.push("no se pudo crear el diagrama"); return; }
    diag.Update();
    try { paq.Diagrams.Refresh(); } catch (e) { }
    var tipoDiag = "?";
    try { tipoDiag = String(diag.Type); } catch (e) { }

    // ---- quitar las ubicaciones visuales anteriores
    for (var viejo = diag.DiagramObjects.Count - 1; viejo >= 0; viejo--) {
        try { diag.DiagramObjects.GetAt(viejo).Delete(); } catch (e) { }
    }
    try { diag.DiagramObjects.Refresh(); } catch (e) { }

    // PASADA 1.  Esta sola no basta: EA todavia no ha calculado el
    // tamano real de cada objeto y las coordenadas no estan guardadas.
    INFORME.push("pasada 1: " + pintar(diag, C, F));
    diag = guardarYRecargar(diag);

    // PASADA 2.
    INFORME.push("pasada 2: " + pintar(diag, C, F));
    diag = guardarYRecargar(diag);

    // ---- las 34 lineas
    var enlaces = 0;
    var huerfanos = 0;
    for (var r = 0; r < REL.length; r++) {
        var rel = REL[r];
        if (rel == null) { ERRORES.push("REL[" + r + "] es null"); continue; }
        var origen = C[rel[0]];
        var destino = C[rel[1]];
        if (origen == null || destino == null) {
            huerfanos++;
            ERRORES.push("no se pudo enlazar " + rel[0] + " -> " + rel[1]);
            continue;
        }
        enlaces = enlaces + relacion(diag, origen, destino, rel[2], rel[3], rel[4]);
    }
    diag = guardarYRecargar(diag);

    // ---- que hay de verdad
    var nObj = 0, nLin = 0, conTam = 0;
    try { nObj = diag.DiagramObjects.Count; } catch (e) { }
    try { nLin = diag.DiagramLinks.Count; } catch (e) { }
    try {
        for (var q = 0; q < diag.DiagramObjects.Count; q++) {
            var ob = diag.DiagramObjects.GetAt(q);
            var w = 0;
            try { w = ob.Right - ob.Left; } catch (e2) { w = 0; }
            if (w > 5) conTam++;
        }
    } catch (e3) { }

    INFORME.push("objetos " + nObj + ", con tamano " + conTam + ", lineas " + nLin);

    // ---- el informe
    var N = [];
    N.push("ARQUITECTURA DEL PAQUETE 1 - INFORME DE EJECUCION");
    N.push("Paquete 1: Seguridad y Auditoria. Casos CU01, CU03 y CU08.");
    N.push("");
    N.push("Componentes:   " + creados + " de " + TOTAL_CMP);
    N.push("Interfaces:    " + enlaces + " de " + TOTAL_REL);
    N.push("Marcos:        " + marcosCreados + " de 7, y son Package reales");
    N.push("Huerfanos:     " + huerfanos);
    N.push("Errores:       " + ERRORES.length);
    N.push("");
    N.push("EJECUCION");
    N.push("  " + INFORME.join(SALTO));
    N.push("");
    N.push("LEIDO DEL DIAGRAMA");
    N.push("  tipo del diagrama: " + tipoDiag);
    N.push("  objetos:          " + nObj + "   con tamano: " + conTam);
    N.push("  lineas:           " + nLin);
    N.push("  deben ser 27 objetos con tamano: 20 componentes + 7 marcos.");
    N.push("");
    N.push("EL REPARTO DE LOS 20 COMPONENTES");
    N.push("  Presentacion        6   5 pantallas y el cliente HTTP");
    N.push("  Control             2   CTR_Auth y CTR_Auditoria");
    N.push("  Seguridad           1   dependencias.ts, las guardas y UsuarioActual");
    N.push("  Logica de Negocio  6   los seis servicios");
    N.push("  Datos               3   CE_Modelos, Esquemas y PostgreSQL 16");
    N.push("  Externos            2   bcrypt y el correo SMTP");
    N.push("");
    N.push("EL REPARTO DE LAS 33 INTERFACES");
    N.push("  pantalla -> cliente HTTP      5   una por pantalla");
    N.push("  cliente -> control            2   las 9 rutas, en dos bloques");
    N.push("  dependencias de codigo       18   los statements import");
    N.push("  hacia PostgreSQL 16           6   los 5 que consultan y el mapeo");
    N.push("  hacia los externos            2   bcrypt y el correo SMTP");
    N.push("");
    N.push("EL PAQUETE TIENE 9 RUTAS Y SOLO 2 ESTAN PROTEGIDAS");
    N.push("  CTR_Auth, 7 rutas: logout y cambiar-password llevan");
    N.push("  @UseGuards(JwtAuthGuard) a nivel de METODO. Las otras cinco");
    N.push("  no llevan ninguna, y no es un descuido: sin token no se");
    N.push("  puede pedir un token.");
    N.push("  CTR_Auditoria, 2 rutas: la guarda va a nivel de CLASE.");
    N.push("  Son dos criterios distintos en el mismo modulo.");
    N.push("");
    N.push("LO QUE CUENTAN LAS 5 PANTALLAS");
    N.push("  CU01, el acceso, es la unica de las cinco que tiene caso.");
    N.push("  RecuperarContrasena, RestablecerContrasena y");
    N.push("  EstablecerContrasena NO tienen caso en la lista de 36, y la");
    N.push("  quinta pantalla, Auditoria, es CU08.");
    N.push("  Ademas hay una sexta ruta de recuperacion en el backend, la");
    N.push("  de refresh, y ninguna pantalla: la renueva api.ts sola.");
    N.push("");
    N.push("LO QUE DICEN LOS 6 SERVICIOS, Y SUS LINEAS");
    N.push("  SRV_AuthService        426   7 metodos, 5 repositorios");
    N.push("  SRV_AuditoriaService   198   3 metodos, listado y CSV con la misma consulta");
    N.push("  SRV_JWTService         122   8 metodos, firma y revocacion");
    N.push("  SRV_EmailService       103   4 envios, ninguno sale");
    N.push("  SRV_BitacoraService     40   1 metodo, registrar");
    N.push("  SRV_SeguridadService    18   2 metodos, y es todo el cifrado del proyecto");
    N.push("                              907 lineas en total");
    N.push("");
    N.push("LO QUE ESTA DECLARADO Y NO FUNCIONA");
    N.push("  Correo SMTP. _enviarViaSmtp, lineas 100 y 101, lanza el error");
    N.push("  SMTP aun no configurado en el prototipo. Y con EMAIL_ENABLED");
    N.push("  en false, su valor por defecto, ni se llega a llamar: se");
    N.push("  registra [EMAIL SIMULADO] y la API responde exito.");
    N.push("  Arrastra a las 3 rutas de contrasena: forgot-password,");
    N.push("  reset-password y first-password. El token se crea bien en");
    N.push("  password_resets, y el enlace nunca llega al usuario.");
    N.push("");
    N.push("DONDE ESTA");
    N.push("  raiz del modelo > " + PAQ_NOMBRE + " > " + DIAG_NOMBRE);
    N.push("");
    if (ERRORES.length == 0) N.push("Sin errores.");
    if (ERRORES.length > 0) {
        N.push("ERRORES: " + ERRORES.length);
        for (var e4 = 0; e4 < ERRORES.length && e4 < 20; e4++) N.push("  - " + ERRORES[e4]);
    }
    try { paq.Notes = N.join(SALTO); paq.Update(); } catch (e5) { }

    // el Popup no cabe con todo, asi que solo lo importante
    var U = [];
    U.push("PAQUETE 1 - Seguridad y Auditoria");
    U.push("Componentes:   " + creados + " de " + TOTAL_CMP);
    U.push("Interfaces:    " + enlaces + " de " + TOTAL_REL);
    U.push("Marcos:        " + marcosCreados + " de 7");
    U.push("Huerfanos:     " + huerfanos);
    U.push("Errores:       " + ERRORES.length);
    U.push("");
    U.push("LEIDO DEL DIAGRAMA:");
    U.push("  tipo:       " + tipoDiag);
    U.push("  objetos:    " + nObj);
    U.push("  con tamano: " + conTam + "   (deben ser 27)");
    U.push("  lineas:     " + nLin);
    U.push("");
    if (conTam < 27) U.push("AVISO: menos de 27 con tamano. Copia este texto y pegamelo.");
    U.push("9 rutas, y solo 2 con guardia.");
    U.push("El informe entero esta en las Notas del paquete.");
    aviso(U.join(SALTO));
}

try {
    main();
} catch (e) {
    try {
        var pp = buscarPaquete(RAIZ, PAQ_NOMBRE);
        if (pp != null) {
            pp.Notes = "ERROR NO CONTROLADO: " + descError(e) + SALTO + SALTO + INFORME.join(SALTO);
            pp.Update();
        }
    } catch (e2) { }
    aviso("Error: " + descError(e));
}
