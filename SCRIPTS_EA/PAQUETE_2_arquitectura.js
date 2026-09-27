// ================================================================
// PAQUETE 2  ·  ARQUITECTURA DEL SUBSISTEMA
// Gestion de Usuarios y Roles  ·  CU02, CU04, CU05, CU06, CU07
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 5.3.2
//
// QUE DIBUJA
//   El diagrama de componentes del paquete 2, con los 19 componentes
//   del subsistema y las 34 interfaces entre ellos, y TODO DENTRO de
//   un marco que se llama PAQUETE 2 - USUARIOS Y ROLES, con las 6
//   capas dibujadas como marcos mas pequenos dentro de ese marco.
//
//   A diferencia del paquete 1, este tiene una capa propia que se
//   llama Del Paquete 1, con las 4 piezas de las que depende. Es lo
//   que hace visible por que el paquete 1 es el nodo del sistema.
//
//   19 componentes:  4 de presentacion, 3 de control, 3 de logica,
//                    4 del paquete 1, 4 de datos y 1 externo
//   34 interfaces:  3 de pantalla al cliente HTTP, 3 del cliente a
//                    los controladores, 16 de codigo, 5 a la base de
//                    datos y 7 al paquete 1 o al correo
//
// PATRON COPIADO DE CAPAS_diagrama_por_capas.js, QUE SI DIBUJA BIEN
//   -  Los marcos son Package REALES del modelo, con Sequence = 1
//      para que EA los deje DETRAS del contenido.  El nombre del
//      Package es la etiqueta del marco.  No son formas.
//   -  LAS COORDENADAS VERTICALES VAN EN NEGATIVO: o.Top = 0 - arr
//      y o.Bottom = 0 - arr - alto.  En positivo sale en blanco.
//   -  DOS PASADAS con guardarYRecargar entre ellas.
//   -  El conector se coloca con con.DiagramID = diag.ID y se
//      reutiliza si coinciden nombre y estereotipo.
//
// DE DONDE SALE CADA COSA
//   Las 13 rutas, los tres controladores, los tres servicios, las dos
//   carpetas de entidades y los DTOs: leyendo api/src/modulos.  Las 3
//   pantallas, leyendo web/src/pages.  Los 34 cruces, leyendo los
//   statements import en las dos direcciones, incluido el ciclo.
//
// UNA CORRECCION QUE IMPORTA
//   Este paquete tiene 5 ficheros en la carpeta clientes, no 3: estan
//   CE_Modelos.ts y Esquemas.ts, que son los que hacen que el modulo
//   compile y los que cierran el ciclo con el paquete 1.  Un indice
//   de ficheros anterior no los tenia, y por eso el paquete 2 se
//   documentaba con 3 ficheros y 132 lineas en vez de 5 y 189.
//
// Aviso con WScript.Shell.Popup.  Sin llamadas a SQL y sin
// SaveDiagram.  Una instruccion por linea.  Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================


var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var PAQ_NOMBRE = "Paquete 2 - Usuarios y Roles";
var DIAG_NOMBRE = "Arquitectura del Paquete 2";

var TOTAL_CMP = 19;
var TOTAL_REL = 34;
var TOTAL_CAP = 6;

var ERRORES = [];
var INFORME = [];

var MARCO_NOMBRE = "PAQUETE 2 - GESTION DE USUARIOS Y ROLES";
var MARCO_X = 10;
var MARCO_Y = 10;
var MARCO_W = 2030;
var MARCO_H = 780;
var MARCO_COLOR = 15132358;

// nombre, izquierda, arriba, ancho, alto, color
var CAPAS = [
    ["Presentacion", 30, 60, 620, 190, 13421823],
    ["Control", 30, 290, 620, 190, 13434879],
    ["Logica de Negocio", 30, 520, 620, 190, 13434828],
    ["Del Paquete 1", 700, 60, 560, 650, 16777164],
    ["Datos", 1310, 60, 380, 650, 16770790],
    ["Externos", 1740, 60, 280, 180, 16247743]
];


// ================================================================
// LOS 19 COMPONENTES   [nombre, capa, nota]
// ================================================================

var PAQ = [

    // ---------------- PRESENTACION: 4 ----------------

    ["Registro.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU02 Registrar Nuevo Cliente | FICHERO: web/src/pages/Registro.tsx, 182 lineas | LA UNICA DE LAS TRES QUE NO ES DE ADMINISTRACION: es la unica pantalla de este paquete que esta en web/src/pages y no en web/src/pages/admin | LLAMA: api.registrar(), que es POST /api/v1/clientes/registrar | ES LA MAS CORTA DE LAS TRES Y LA UNICA CUYO CASO SE CUMPLE DE PRINCIPIO A FIN, porque el alta no depende de ningun correo: la cuenta se crea y se puede entrar en ella | LO QUE PIDE: nombre, correo, contrasena y telefono, y ese ultimo es opcional"],

    ["Usuarios.tsx", "Presentacion",
    "CAPA: Presentacion | CASOS: CU04 Registrar Nuevo Empleado, CU06 Inhabilitar Empleado y CU07 Rehabilitar Empleado | FICHERO: web/src/pages/admin/Usuarios.tsx, 713 LINEAS: es la pantalla mas larga del frontend entero | LLAMA: cinco funciones, api.listarEmpleados, api.listarSucursalesActivas, api.registrarEmpleado, api.deshabilitarEmpleado y api.rehabilitarEmpleado | RUTAS: las 5 de admin/empleados | LAS TRES ACCIONES DE UN EMPLEADO ESTAN EN UN SOLO FICHERO: darlo de alta, y despues habilitarlo o rehabilitarlo. Y por eso tiene mas de setecientas lineas, porque ademas del formulario tiene la tabla, el buscador y los dos avisos de confirmacion"],

    ["Roles.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU05 Asignar y Modificar Roles y Permisos | FICHERO: web/src/pages/admin/Roles.tsx, 663 lineas | LLAMA: siete funciones, api.listarRoles, api.obtenerCatalogoPermisos, api.obtenerPermisosRol, api.actualizarPermisosRol, api.actualizarRol, api.crearRol y api.eliminarRol | RUTAS: las 7 de admin/roles | ES LA PANTALLA MAS COMPLEJA DEL PAQUETE porque su caso es el unico que trabaja con una estructura, y no con un registro: hay que pintar un catalogo de permisos y marcar cuales tiene el rol, y por eso son las unicas que necesitan un PUT en vez de un PATCH | LAS TRES PANTALLAS DEL PAQUETE SUMAN 1.558 LINEAS, y las dos de administracion se llevan 1.376"],

    ["api.ts", "Presentacion",
    "CAPA: Presentacion | FICHERO: web/src/lib/api.ts | EL CLIENTE HTTP DEL PAQUETE | CUATROCEINCO rutas del paquete, que son las 13 del backend mas las de los otros nueve paquetes | COMO LLAMA: fetch con credentials: 'include' en las dos variantes, con y sin cabecera, para que viaje la cookie httpOnly | LO QUE HACE DE ESTE PAQUETE Y DE OTROS: renueva el token con POST /auth/refresh cuando caduca. ESA RUTA ES DEL PAQUETE 1, y es el punto por el que un paquete se apoya en otro sin que se note: ninguna pantalla menciona al paquete 1, y sin embargo las tres dependen de el"],

    // ---------------- CONTROL: 3 ----------------

    ["CTR_Cliente", "Control",
    "CAPA: Control | CASO: CU02 | FICHERO: api/src/modulos/clientes/CTR_Cliente.ts, 20 LINEAS: el controlador mas pequeno del sistema | @Controller('clientes') y una sola ruta, POST registrar | **NO LLEVA NINGUNA GUARDIA**, y es la unica de los tres controladores de este paquete que no la lleva. No es un descuido: sin cuenta no se puede crear una cuenta, y a la inversa | USA @Res passthrough para poder devolver 201 o 207 en vez del 200 por defecto, que es la unica forma de que el servicio elija el codigo de respuesta | NO IMPORTA CE_Modelos: solo el servicio y el DTO. Es el unico de los tres que no toca las entidades"],

    ["CTR_Empleados", "Control",
    "CAPA: Control | CASOS: CU04, CU06 y CU07 | FICHERO: api/src/modulos/seguridad/CTR_Empleados.ts | @Controller('admin') con @UseGuards(JwtAuthGuard) A NIVEL DE CLASE, de modo que las cinco rutas quedan protegidas de una vez | RUTAS: GET empleados, GET sucursales/activas, POST empleados, PATCH empleados/:id/deshabilitar y PATCH empleados/:id/rehabilitar | CUATRO DE LAS CINCO TIENEN CASO, y son CU04, CU06 y CU07. LA QUINTA, sucursales/activas, NO TIENE CASO: es el selector de sucursales que pinta la pantalla, y existe solo para eso | LLEGA A USAR UsuarioActual en las cinco, para saber quien pregunta y comparar permisos"],

    ["CTR_Roles", "Control",
    "CAPA: Control | CASO: CU05 | FICHERO: api/src/modulos/seguridad/CTR_Roles.ts | @Controller('admin') con la guarda tambien A NIVEL DE CLASE | RUTAS: 7. GET roles, GET roles/permisos-catalogo, GET roles/:rolId/permisos, PUT roles/:rolId/permisos, POST roles, PUT roles/:rolId y DELETE roles/:rolId | DECLARA SUS PROPIOS DTOs DENTRO del fichero del controlador, con las reglas de class-validator al lado, en vez de traerlos de un Esquemas aparte. ES LO CONTRARIO DE LO QUE HACE CTR_Cliente, que si los trae de fuera, y en el mismo paquete | IMPORTA DEL SERVICIO LA CONSTANTE CATALOGO_PERMISOS, que es el catalogo de permisos del sistema entero, y lo expone con la segunda ruta"],

    // ---------------- LOGICA DE NEGOCIO: 3 ----------------

    ["SRV_ClienteService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/clientes/SRV_ClienteService.ts, 96 lineas | UN SOLO METODO: registrarCliente | ES EL ALTA COMPLETA DEL CLIENTE, Y SON SEIS ESCRITURAS SEGUIDAS, SIN TRANSACCION: busca si el correo ya existe y si existe devuelve 409, busca el rol llamado Cliente y si no esta devuelve 500, hashea la contrasena, inserta el usuario, inserta en usuarios_roles, inserta en clientes, inserta el token de confirmacion y escribe en la bitacora | **DEVUELVE 201 O 207 SEGUN SALGA O NO EL CORREO**: si el envio va bien responde 201 Created con confirmacion_email enviado, y si no responde 207 con un warning. El codigo HTTP le avisa al cliente de que el correo fallo, y aun asi la operacion se dio por buena, porque la cuenta existe | SI EL ROL CLIENTE NO ESTA EN LA BASE DE DATOS, el alta falla con 500. No hay semilla de roles en schema.sql, o sea que sin cargar los roles a mano este caso no funciona | IMPORTA DEL PAQUETE 1: SeguridadService para el hash, BitacoraService para la traza y EmailService para el correo de bienvenida"],

    ["SRV_EmpleadosService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/seguridad/SRV_EmpleadosService.ts, 339 lineas | METODOS: 5. listarEmpleados, registrarEmpleado, inhabilitarEmpleado, rehabilitarEmpleado y listarSucursales | EL ALTA DE EMPLEADO ES MAS RICA QUE LA DE CLIENTE: genera una CONTRASENA TEMPORAL, la hashea, da de alta al usuario, busca el rol, inserta en usuarios_empleados, y genera un FirstPasswordToken con fecha de caducidad, para que el empleado tenga que poner la suya. El cliente elige su contrasena; el empleado no, y por eso tiene un flujo de recuperacion mas | USA EL RELOJ DE LA BASE DE DATOS Y NO EL DE NODE: la linea 167 hace SELECT NOW()::timestamp, y de ahi salen la caducidad del token y las fechas de la baja | LAS DOS BAJAS GUARDAN EL PORQUE: inhabilitar deja constancia de la fecha de baja y del motivo, en las columnas fecha_baja y motivo_baja, y rehabilitar las limpia. Un empleado dado de baja no desaparece, queda el rastro | TAMBIEN SIN TRANSACCION: las seis escrituras del alta pueden quedar a medias, igual que en el alta de cliente"],

    ["SRV_RolesService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/seguridad/SRV_RolesService.ts, 335 lineas | METODOS: 7 | **EL CATALOGO DE PERMISOS ES UNA CONSTANTE DE CODIGO**: CATALOGO_PERMISOS se exporta desde este fichero, y es lo que responde la ruta GET admin/roles/permisos-catalogo. NO HAY TABLA DE PERMISOS en el esquema, y por eso el catalogo no se puede consultar con SQL ni auditar | Y LOS PERMISOS DE CADA ROL SON UN JSON: la columna roles.permisos_json es JSON NOT NULL DEFAULT '[]', y se lee y se escribe como un arreglo de cadenas | DE AHI SALEN DOS RIESGOS REALES Y LOS DOS SON DEL MODELO: se puede asignar a un rol un permiso que no existe en el catalogo, porque la base de datos no comprueba nada, y parsearPermisos tolera que el valor llegue como arreglo o como cadena, o sea que el propio servicio reconoce que el formato no esta garantizado | **LA COMPROBACION DE PERMISOS ESTA EN EL SERVICIO, NO EN LA RUTA**: exigirPermisoPublico exige el permiso gestionar_roles, y los siete metodos lo exigen por dentro. Es la razon de que el paquete 1 sea el nodo, porque es el unico punto del sistema donde el permiso se decide en el servicio y no en el controlador | crearRol DEJA EL ROL SIN NINGUN PERMISO, porque inicializa permisos_json en el arreglo vacio. Es la decision correcta, y evita que un rol nuevo nazca con poder | actualizarPermisos GUARDA LOS PERMISOS ANTERIORES antes de cambiar los nuevos, y se los pasa a la bitacora. Es la unica operacion del sistema que deja rastro de un cambio de configuracion"],

    // ---------------- DEL PAQUETE 1: 4 ----------------

    ["dependencias.ts", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/dependencias.ts, 148 lineas | ESTE PAQUETE USA DOS DE SUS EXPORTACIONES: JwtAuthGuard, que los dos controladores de administracion montan a NIVEL DE CLASE, y UsuarioActual, que las doce rutas de administracion necesitan para saber quien pregunta | **ESTA PIEZA ES LA RAZON DE QUE EL PAQUETE 1 SEA EL NODO**: no es que los catorce modulos la importen, es que sin ella no hay ni una ruta de administracion del proyecto que se pueda abrir. Se puede quitar bcrypt entero del sistema y siguen entrando usuarios; esta no se puede quitar de ningun sitio"],

    ["SRV_SeguridadService", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/SRV_SeguridadService.ts, 18 lineas | LO USA ESTE PAQUETE PARA LAS DOS CONTRASENAS DEL SISTEMA, y son las dos del alta: la del cliente, que elige el usuario en el formulario, y la temporal del empleado, que genera el servicio | NINGUNA DE LAS DOS LA ESCOGE EL USUARIO, y la del empleado ademas caduca"],

    ["SRV_BitacoraService", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/SRV_BitacoraService.ts, 40 lineas | ESTE PAQUETE LO USA EN TRES SITIOS: el alta de cliente, con la accion INSERT sobre la tabla clientes, y las operaciones de roles, que guardan los permisos anteriores antes de escribir los nuevos | ES LO QUE HACE QUE EL PAQUETE SEA AUDITABLE, y con datos de verdad: no dice que se cambio un rol, dice que permisos tenia antes"],

    ["SRV_EmailService", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/SRV_EmailService.ts, 103 lineas | ESTE PAQUETE LE PIDE 2 DE SUS 4 ENVIOS: enviarBienvenida, en el alta de cliente, y enviarPrimeraContrasena, en el alta de empleado | LOS DOS EMPIEZAN CON LA MISMA PALABRA: comprueban EMAIL_ENABLED y, si esta en false, escriben dos lineas con el prefijo [EMAIL SIMULADO] y devuelven true | Y LOS DOS ACABAN IGUAL: la cuenta y el empleado se crean, y el correo no sale"],

    // ---------------- DATOS: 4 ----------------

    ["CE_Modelos.ts (seguridad)", "Datos",
    "CAPA: Datos | FICHERO: api/src/modulos/seguridad/CE_Modelos.ts, 13 ENTIDADES, LAS 13 UNICAS DEL PROYECTO | LAS DE ESTE PAQUETE SON 6: Rol, Usuario, UsuarioRol, UsuarioEmpleado, FirstPasswordToken y EmailConfirmation. La septima, Sucursal, es del paquete 3 | **Y ESTE ES UNO DE LOS DOS FICHEROS DEL CICLO**: en la linea 12 hace import type { Cliente } from '../clientes/CE_Modelos.js'. Con el import de tipo, que TypeScript borra al compilar, de modo que en el JavaScript que se ejecuta el ciclo no existe, pero en el codigo que se lee si"],

    ["CE_Modelos.ts (clientes)", "Datos",
    "CAPA: Datos | FICHERO: api/src/modulos/clientes/CE_Modelos.ts, 835 bytes | UNA SOLA ENTIDAD: Cliente, con 5 columnas, y una relacion @OneToOne con Usuario, con onDelete CASCADE, que en la base de datos es la regla usuarios_empleados.usuario_id que hace que al borrar el usuario se borre la ficha | **Y ESTE ES EL OTRO FICHERO DEL CICLO**: en la linea 9 hace import { Usuario } from '../seguridad/CE_Modelos.js' | POR QUE EL CICLO ES INEVITABLE: la relacion esta declarada de los dos lados, porque TipoScript lo pide. Cliente dice OneToOne a Usuario, y Usuario tiene el cliente de vuelta. Los dos ficheros se necesitan entre si, y no es un descuido de nadie: es lo que exige el framework | Y ASI SE EXPLICA QUE SEGURIDAD Y CLIENTES SE SEPARARON EN PAQUETES: no se separaron en el codigo, se separaron en los casos de uso. El corte existe en el documento y no en el arbol de carpetas"],

    ["Esquemas.ts", "Datos",
    "CAPA: Datos | FICHERO: api/src/modulos/clientes/Esquemas.ts, 695 bytes | DOS DTOs | RegistroRequest, con cuatro reglas de class-validator: el nombre con 2 caracteres minimos, el correo con IsEmail, la contrasena con 8 caracteres minimos, y el telefono opcional con 30 de maximo | RegistroResponse, con detail, usuario_id, confirmacion_email y warning | Y CADA REGLA TIENE SU MENSAJE EN CASTELLANO, uno por regla, con el texto exacto que ve el usuario. Es de los pocos sitios del proyecto donde el mensaje de validacion esta escrito para la persona y no para el programador | LO VALIDA EL ValidationPipe GLOBAL de main.ts, con whitelist: true, que ademas descarta cualquier campo que no este declarado aqui"],

    ["PostgreSQL 16", "Datos",
    "CAPA: Datos | LAS TABLAS DEL PAQUETE SON 7: usuarios, roles, usuarios_roles, usuarios_empleados, clientes, email_confirmations y first_password_tokens | ACCESO: TypeORM con repositorios, sin una sola consulta de SQL escrita a mano | LAS CUATRO RESTRICCIONES UNIQUE DEL PAQUETE: usuarios.email, usuarios.ci, roles.nombre_rol y usuarios_empleados.usuario_id. Las dos primeras son las que hacen que un correo no pueda darse de alta dos veces | **Y LA RESTRICCION QUE SOSTIENE EL MODELO ENTERO**: usuarios_roles declara sus dos columnas como parte de la clave primaria, y en PostgreSQL eso las hace NOT NULL aunque el esquema no lo escriba. O sea que un usuario no puede quedarse sin rol, y un rol no puede quedarse sin usuario. Es la unica tabla del proyecto en la que ninguna de las dos columnas es opcional | EN CAMBIO usuarios.ci ES NULLABLE, o sea que un usuario puede no tener cedula, y con ella no se puede iniciar sesion"],

    // ---------------- EXTERNOS: 1 ----------------

    ["Correo SMTP", "Externos",
    "CAPA: Externo | ESTE PAQUETE LO USA PARA LAS DOS ALTAS, y es la unica razon por la que se dibuja | QUE ES: el servidor que deberia mandar la confirmacion de cuenta al cliente y la contrasena temporal al empleado | LO QUE PASA: no sale ninguno de los dos correos. Por lo que se explica en SRV_EmailService | LA CONSECUENCIA EN ESTE PAQUETE ES CONCRETA: el alta de cliente responde 207 en vez de 201, y el alta de empleado responde con un aviso de que no se pudo enviar la invitacion. LAS DOS CUENTAS SE CREAN IGUAL | Y ESO TIENE UNA VENTAJA QUE NO SE HA VISTO: como el correo nunca llega, nadie tiene que confirmar la cuenta ni cambiar la contrasena temporal. Las dos altas funcionan de punta a punta sin el correo. Lo que no funciona es la recuperacion de contrasena del paquete 1, que si necesita el enlace"]
];


// ================================================================
// LAS 34 INTERFACES   [origen, destino, nombre, tipo, estereotipo]
// ================================================================

var REL = [

    ["Registro.tsx", "api.ts", "registrar(nombre, email, password)", "Assembly", "llama"],
    ["Usuarios.tsx", "api.ts", "5 funciones de empleados", "Assembly", "llama"],
    ["Roles.tsx", "api.ts", "7 funciones de roles", "Assembly", "llama"],

    ["api.ts", "CTR_Cliente", "HTTP/JSON, 1 ruta sin guardia", "Assembly", "expone"],
    ["api.ts", "CTR_Empleados", "HTTP/JSON, 5 rutas de admin", "Assembly", "expone"],
    ["api.ts", "CTR_Roles", "HTTP/JSON, 7 rutas de admin", "Assembly", "expone"],

    ["CTR_Cliente", "SRV_ClienteService", "registrarCliente, 1 metodo", "Dependency", "delega"],
    ["CTR_Cliente", "Esquemas.ts", "RegistroRequest", "Dependency", "importa"],

    ["CTR_Empleados", "SRV_EmpleadosService", "5 metodos, uno por ruta", "Dependency", "delega"],
    ["CTR_Empleados", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_Empleados", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["CTR_Roles", "SRV_RolesService", "7 metodos y CATALOGO_PERMISOS", "Dependency", "delega"],
    ["CTR_Roles", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_Roles", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["SRV_ClienteService", "SRV_SeguridadService", "hashearPassword", "Dependency", "delega"],
    ["SRV_ClienteService", "SRV_BitacoraService", "registrar, 1 llamada", "Dependency", "delega"],
    ["SRV_ClienteService", "SRV_EmailService", "enviarBienvenida", "Dependency", "delega"],
    ["SRV_ClienteService", "CE_Modelos.ts (seguridad)", "Usuario, Rol, UsuarioRol, EmailConfirmation", "Dependency", "importa"],
    ["SRV_ClienteService", "CE_Modelos.ts (clientes)", "Cliente", "Dependency", "importa"],
    ["SRV_ClienteService", "Esquemas.ts", "RegistroRequest y RegistroResponse", "Dependency", "importa"],

    ["SRV_EmpleadosService", "SRV_SeguridadService", "hashearPassword", "Dependency", "delega"],
    ["SRV_EmpleadosService", "SRV_BitacoraService", "registrar, 2 llamadas", "Dependency", "delega"],
    ["SRV_EmpleadosService", "SRV_EmailService", "enviarPrimeraContrasena", "Dependency", "delega"],
    ["SRV_EmpleadosService", "CE_Modelos.ts (seguridad)", "Usuario, Rol, UsuarioEmpleado, Sucursal, FirstPasswordToken", "Dependency", "importa"],

    ["SRV_RolesService", "SRV_BitacoraService", "registrar con permisos anteriores", "Dependency", "delega"],
    ["SRV_RolesService", "CE_Modelos.ts (seguridad)", "Rol y Usuario", "Dependency", "importa"],

    // EL CICLO, LAS DOS DIRECCIONES.  El verificador comprueba que
    // estan las dos, porque con una sola el diagrama mentiria.
    ["CE_Modelos.ts (seguridad)", "CE_Modelos.ts (clientes)", "import type Cliente, L12", "Dependency", "ciclo"],
    ["CE_Modelos.ts (clientes)", "CE_Modelos.ts (seguridad)", "import Usuario, L9", "Dependency", "ciclo"],

    ["SRV_ClienteService", "PostgreSQL 16", "TypeORM, 5 repositorios", "Assembly", "consulta"],
    ["SRV_EmpleadosService", "PostgreSQL 16", "TypeORM, 5 repositorios", "Assembly", "consulta"],
    ["SRV_RolesService", "PostgreSQL 16", "TypeORM, Rol y Usuario", "Assembly", "consulta"],
    ["CE_Modelos.ts (seguridad)", "PostgreSQL 16", "13 entidades mapeadas", "Assembly", "mapea"],
    ["CE_Modelos.ts (clientes)", "PostgreSQL 16", "1 entidad mapeada", "Assembly", "mapea"],

    ["SRV_EmailService", "Correo SMTP", "SMTP, declarado sin implementar", "Dependency", "declarado"]
];


// ================================================================
// DONDE CAE CADA COMPONENTE   [nombre, izquierda, arriba, ancho, alto]
// ================================================================

var DOND = [
    ["Registro.tsx", 50, 100, 290, 55],
    ["Usuarios.tsx", 340, 100, 290, 55],
    ["Roles.tsx", 50, 165, 290, 55],
    ["api.ts", 340, 165, 290, 55],

    ["CTR_Cliente", 50, 330, 185, 110],
    ["CTR_Empleados", 250, 330, 185, 110],
    ["CTR_Roles", 450, 330, 185, 110],

    ["SRV_ClienteService", 50, 560, 185, 110],
    ["SRV_EmpleadosService", 250, 560, 185, 110],
    ["SRV_RolesService", 450, 560, 185, 110],

    ["dependencias.ts", 725, 100, 510, 100],
    ["SRV_SeguridadService", 725, 250, 510, 100],
    ["SRV_BitacoraService", 725, 400, 510, 100],
    ["SRV_EmailService", 725, 550, 510, 100],

    ["CE_Modelos.ts (seguridad)", 1335, 100, 330, 100],
    ["CE_Modelos.ts (clientes)", 1335, 250, 330, 100],
    ["Esquemas.ts", 1335, 400, 330, 100],
    ["PostgreSQL 16", 1335, 550, 330, 100],

    ["Correo SMTP", 1765, 100, 230, 80]
];


function aviso(txt) {
    try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup(txt, 0, "Paquete 2 - Usuarios y Roles", 64);
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


// ---------- EL MARCO: un Package real, con Sequence 1 ----------

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


// ---------- EL RECUADRO ----------

function recuadro(diag, el, izq, arr, ancho, alto) {
    var o = objetoEn(diag, el);
    if (o == null) {
        var tam = "l=" + izq + ";r=" + (izq + ancho) + ";t=" + arr + ";b=" + (arr + alto) + ";";
        try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e) { return null; }
        o.ElementID = el.ElementID;
    }
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


// ---------- UNA PASADA ----------

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

    for (var viejo = diag.DiagramObjects.Count - 1; viejo >= 0; viejo--) {
        try { diag.DiagramObjects.GetAt(viejo).Delete(); } catch (e) { }
    }
    try { diag.DiagramObjects.Refresh(); } catch (e) { }

    INFORME.push("pasada 1: " + pintar(diag, C, F));
    diag = guardarYRecargar(diag);
    INFORME.push("pasada 2: " + pintar(diag, C, F));
    diag = guardarYRecargar(diag);

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

    var N = [];
    N.push("ARQUITECTURA DEL PAQUETE 2 - INFORME DE EJECUCION");
    N.push("Paquete 2: Gestion de Usuarios y Roles. Casos CU02, CU04, CU05, CU06 y CU07.");
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
    N.push("  deben ser 26 objetos con tamano: 19 componentes + 7 marcos.");
    N.push("");
    N.push("EL REPARTO DE LOS 19 COMPONENTES");
    N.push("  Presentacion        4   3 pantallas y el cliente HTTP");
    N.push("  Control             3   CTR_Cliente, CTR_Empleados y CTR_Roles");
    N.push("  Logica de Negocio  3   un servicio por cada caso de uso");
    N.push("  Del Paquete 1       4   las 4 piezas de las que depende");
    N.push("  Datos               4   las 2 carpetas de entidades, los DTOs y el motor");
    N.push("  Externos            1   el correo SMTP");
    N.push("");
    N.push("EL REPARTO DE LAS 34 INTERFACES");
    N.push("  pantalla -> cliente HTTP      3   una por pantalla");
    N.push("  cliente -> control            3   las 13 rutas, en tres bloques");
    N.push("  dependencias de codigo       22   los statements import, con el ciclo dentro");
    N.push("  hacia PostgreSQL 16           5   los 3 servicios y las 2 entidades");
    N.push("  hacia el correo               1   y no sale");
    N.push("");
    N.push("LA CAPA DEL PAQUETE 1 ES LA QUE HACE ESTE DIAGRAMA DISTINTO");
    N.push("  En el paquete 1 no habia nada externo que dibujar. En este");
    N.push("  hay una capa entera, Del Paquete 1, con 4 componentes: las");
    N.push("  guardas, el hash, la bitacora y el correo.");
    N.push("");
    N.push("  DE LAS 34 INTERFACES, 16 VAN A PIEZAS DEL PAQUETE 1 O AL");
    N.push("  CORREO, y 15 de ellas salen de los tres controladores o");
    N.push("  servicios. Una es el propio ciclo. Esa es la medida de lo que");
    N.push("  el paquete 2 le debe al paquete 1: casi la mitad de sus lineas,");
    N.push("  y el 100 por ciento de sus permisos.");
    N.push("");
    N.push("EL CICLO ENTRE LOS PAQUETES 1 Y 2, Y ESTA DIBUJADO");
    N.push("  seguridad/CE_Modelos.ts L12  ->  clientes/CE_Modelos.ts");
    N.push("  clientes/CE_Modelos.ts L9   ->  seguridad/CE_Modelos.ts");
    N.push("  Dos flechas, una en cada sentido, y por eso el verificador");
    N.push("  comprueba que esten las dos. Con una sola, el diagrama diria");
    N.push("  que la dependencia va en un solo sentido, y no es cierto.");
    N.push("");
    N.push("  El ciclo no es un descuido: la relacion Cliente-Usuario esta");
    N.push("  declarada de los dos lados porque TypeScript lo pide, con");
    N.push("  @OneToOne en un fichero y la property de vuelta en el otro.");
    N.push("  Los dos ficheros se necesitan entre si.");
    N.push("");
    N.push("  Y ESO EXPLICA POR QUE 1 Y 2 SON PAQUETES DISTINTOS SIENDO");
    N.push("  EL MISMO MODULO: el corte existe en los casos de uso y no en");
    N.push("  el arbol de carpetas. En el codigo, seguridad y clientes son");
    N.push("  una sola cosa con un acoplamiento circular.");
    N.push("");
    N.push("LO QUE DICEN LOS 3 CONTROLADORES, Y TRES CRITERIOS DISTINTOS");
    N.push("  CTR_Cliente     SIN GUARDIA, la unica de las tres");
    N.push("  CTR_Empleados   @UseGuards a NIVEL DE CLASE");
    N.push("  CTR_Roles       @UseGuards a NIVEL DE CLASE");
    N.push("  Y los dos ultimos estan en el mismo fichero de la carpeta,");
    N.push("  con el mismo prefijo de ruta admin, y se distinguen por el");
    N.push("  subcamino: empleados y roles.");
    N.push("");
    N.push("  Los 3 controladores estan sobre admin, y hay 4 en el modulo");
    N.push("  seguridad. Comparten prefijo con CTR_Auditoria, del paquete 1.");
    N.push("");
    N.push("EL CATALOGO DE PERMISOS NO ESTA EN LA BASE DE DATOS");
    N.push("  CATALOGO_PERMISOS es una constante exportada por");
    N.push("  SRV_RolesService, y es lo que responde la ruta del catalogo.");
    N.push("  Los permisos de cada rol viven en roles.permisos_json, un");
    N.push("  JSON NOT NULL DEFAULT '[]', leido y escrito como arreglo.");
    N.push("");
    N.push("  Las dos consecuencias: se puede asignar a un rol un permiso");
    N.push("  que no existe en el catalogo y la base de datos no dice nada,");
    N.push("  y el servicio parsea el valor tolerate si llega como arreglo");
    N.push("  o como cadena, o sea que el formato no esta garantizado.");
    N.push("");
    N.push("  Lo que si esta bien: crearRol deja el rol sin permisos, y");
    N.push("  actualizarPermisos guarda los anteriores en la bitacora antes");
    N.push("  de escribir los nuevos. Un cambio de permisos deja rastro de");
    N.push("  lo que habia, no solo de lo que queda.");
    N.push("");
    N.push("LAS DOS ALTAS NO TIENEN TRANSACCION, Y LAS DOS FUNCIONAN");
    N.push("  registrarCliente hace 6 escrituras seguidas. registrarEmpleado");
    N.push("  hace 6 tambien, mas el token de la primera contrasena. Si la");
    N.push("  quinta falla, las cuatro anteriores quedan en la base de datos.");
    N.push("");
    N.push("  registrarCliente devuelve 201 si el correo sale y 207 si no,");
    N.push("  con un warning. El codigo HTTP avisa de que el correo fallo y");
    N.push("  aun asi la operacion se dio por buena, porque la cuenta existe.");
    N.push("");
    N.push("  Y COMO EL CORREO NUNCA SALE, LAS DOS ALTAS QUEDAN EN 207. Las");
    N.push("  dos cuentas se crean sin confirmar el correo, que es un");
    N.push("  atajo, y la recuperacion de contrasena del paquete 1, que si");
    N.push("  necesita el enlace, es la que no funciona.");
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

    var U = [];
    U.push("PAQUETE 2 - Gestion de Usuarios y Roles");
    U.push("CU02, CU04, CU05, CU06 y CU07");
    U.push("");
    U.push("Componentes:   " + creados + " de " + TOTAL_CMP);
    U.push("Interfaces:    " + enlaces + " de " + TOTAL_REL);
    U.push("Marcos:        " + marcosCreados + " de 7");
    U.push("Huerfanos:     " + huerfanos);
    U.push("Errores:       " + ERRORES.length);
    U.push("");
    U.push("LEIDO DEL DIAGRAMA:");
    U.push("  tipo:       " + tipoDiag);
    U.push("  objetos:    " + nObj);
    U.push("  con tamano: " + conTam + "   (deben ser 26)");
    U.push("  lineas:     " + nLin);
    U.push("");
    if (conTam < 26) U.push("AVISO: menos de 26 con tamano. Copia este texto y pegamelo.");
    U.push("El ciclo con el paquete 1 va dibujado en las dos");
    U.push("direcciones, con el estereotipo ciclo.");
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
