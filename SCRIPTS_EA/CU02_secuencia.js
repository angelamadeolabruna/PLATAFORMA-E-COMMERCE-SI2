// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU02  Registrar Nuevo Cliente
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo. El modulo
//   clientes entero son 5 ficheros, 189 lineas, y este caso es lo unico
//   que hace:
//
//     web/src/pages/Registro.tsx                     182 lineas
//     web/src/lib/api.ts                             L1055 registrar
//     api/src/main.ts                                L22-43 ValidationPipe
//     api/src/modulos/clientes/CTR_Cliente.ts        20 lineas
//     api/src/modulos/clientes/SRV_ClienteService.ts  96 lineas
//     api/src/modulos/clientes/Esquemas.ts           26 lineas
//     api/src/modulos/clientes/CE_Modelos.ts         31 lineas
//     api/src/modulos/seguridad/SRV_SeguridadService.ts    hashearPassword
//     api/src/modulos/seguridad/SRV_EmailService.ts        enviarBienvenida
//     api/src/modulos/seguridad/SRV_BitacoraService.ts     registrar
//     BASE DE DATOS/schema.sql                       51 tablas, 6 en este caso
//
//   Cada mensaje lleva la linea del fichero de la que sale.
//
// POR QUE ESTE CASO Y NO OTRO
//   Es el segundo del documento y es el que mas contradicciones tiene con
//   su propia descripcion. El caso habla de confirmar la cuenta por
//   correo. El codigo no confirma nada, y el correo no se puede ni
//   enviar. Ademas es el unico alta sin transaccion, con 5 escrituras
//   en 4 tablas, y eso solo se ve mirando el codigo.
//
//   37 mensajes. 10 lineas de vida. 7 van a la base de datos, 18 son
//   mensajes a si mismo y 4 son retornos.
//   6 guardas escritas entre corchetes, 3 puntos donde el codigo lanza
//   una excepcion y 5 codigos distintos: 201, 207, 409, 422 y 500.
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
//   Las versiones anteriores de estos diagramas escribian las
//   coordenadas con Repository.ExecuteSQL, Repository.Execute y
//   Repository.SQLQuery. En esta instalacion eso devuelve "DAO.database
//   [3061] too few parameters. expected 1" y para el script a mitad,
//   con el diagrama ya borrado. No hace falta nada de eso: todo se
//   coloca con el modelo de objetos, como el diagrama de capas.
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
//   propio mensaje, entre corchetes al principio, que es la convencion
//   UML admitida y se lee igual.
//
// Autorreparable. Una instruccion por linea. Sin continuaciones con +.
// Sin operadores ternarios. Ninguna excepcion escapa.
// ================================================================

var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var TOTAL_CAB = 10;
var TOTAL_MSG = 37;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU02 Secuencia Registro";
var DIAG_NOMBRE = "CU02 Registrar Nuevo Cliente";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 68;

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
    ["U", "ACTOR_Cliente", "Actor", "Lifeline", "Cliente", "la persona", "Actor, no clase: es quien se da de alta", "no es codigo, es la persona"],
    ["L", "Registro.tsx", "Object", "Lifeline", "Registro", "formulario de alta", "Boundary", "web/src/pages/Registro.tsx, 182 lineas"],
    ["H", "api.ts", "Object", "Lifeline", "api", "cliente HTTP", "Boundary", "web/src/lib/api.ts, L1055 registrar"],
    ["P", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "validacion del DTO", "Control", "api/src/main.ts, L22-43, es global"],
    ["C", "CTR_Cliente", "Object", "Lifeline", "ClienteController", "POST /clientes/registrar", "Control", "api/src/modulos/clientes/CTR_Cliente.ts, 20 lineas"],
    ["S", "SRV_ClienteService", "Object", "Lifeline", "ClienteService", "registrarCliente()", "Control", "api/src/modulos/clientes/SRV_ClienteService.ts, 96 lineas"],
    ["G", "SRV_SeguridadService", "Object", "Lifeline", "SeguridadService", "hashearPassword()", "Control", "api/src/modulos/seguridad/SRV_SeguridadService.ts, L7-9"],
    ["E", "SRV_EmailService", "Object", "Lifeline", "EmailService", "enviarBienvenida()", "Control", "api/src/modulos/seguridad/SRV_EmailService.ts, L10-30"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar()", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "6 tablas", "Entity", "schema.sql: usuarios, roles, usuarios_roles, clientes, email_confirmations, bitacora_auditoria"]
];

// Los 37 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [
    [1, "U", "L", "1. rellena nombre, correo, telefono, contrasena y repetir contrasena   Registro.tsx L101-165", "S"],
    [2, "L", "L", "2. [nombre.trim().length < 2] 'El nombre debe tener al menos 2 caracteres.' y no llama al servidor   L30-33", "S"],
    [3, "L", "L", "3. [correo con /\\S+@\\S+\\.\\S+$/] 'Ingresa un correo electronico valido.'   L34-37", "S"],
    [4, "L", "L", "4. [contrasena.length < 8] 'La contrasena debe tener al menos 8 caracteres.'   L38-41", "S"],
    [5, "L", "L", "5. [contrasena !== repetir] 'Las contrasenas no coinciden.'   L42-45", "S"],
    [6, "L", "H", "6. api.registrar({ nombre, email, password, telefono })   L49-54.   El campo repetir no se envia", "S"],
    [7, "H", "P", "7. POST /api/v1/clientes/registrar   con credentials:'include' y renovar:false   api.ts L1056-1063", "S"],
    [8, "P", "P", "8. valida RegistroRequest con whitelist:true y transform:true   main.ts L22-43", "S"],
    [9, "P", "P", "9. [falla el DTO] UnprocessableEntityException 422 con TODOS los mensajes, no solo el primero   main.ts L27-41", "S"],
    [10, "P", "C", "10. el cuerpo ya validado y sin propiedades de mas, pasa al controlador   el pipe va antes del @Post", "S"],
    [11, "C", "S", "11. registrarCliente( body, request )   CTR_Cliente.ts L16", "S"],
    [12, "S", "S", "12. emailNormalizado = body.email.toLowerCase().trim()   SRV_ClienteService.ts L23", "S"],
    [13, "S", "D", "13. SELECT usuarios WHERE email = :emailNormalizado   L25-27", "S"],
    [14, "S", "S", "14. [ya existe] ConflictException 409 'Ya existe una cuenta con este correo electronico.'   L28-30", "S"],
    [15, "S", "D", "15. SELECT roles WHERE nombre_rol = 'Cliente'   L32-34", "S"],
    [16, "S", "S", "16. [no existe el rol] HttpException 500 'El rol Cliente no esta configurado en el sistema.'   L35-37", "S"],
    [17, "S", "G", "17. hashearPassword( body.password )   L39", "S"],
    [18, "G", "G", "18. bcrypt.hash( password, 10 )   SRV_SeguridadService.ts L7-9", "S"],
    [19, "S", "D", "19. INSERT usuarios ( email, password_hash, estado='Activo' )   L41-46.   Es la escritura 1 de 5", "S"],
    [20, "S", "D", "20. INSERT usuarios_roles ( id_usuario, id_rol )   L48-51.   Es la escritura 2 de 5", "S"],
    [21, "S", "D", "21. INSERT clientes ( usuario_id, nombre, telefono )   L53-58.   Es la escritura 3 de 5", "S"],
    [22, "S", "D", "22. INSERT email_confirmations ( usuario_id, token, expires_at +24h, used=false )   L60-66.   La 4 de 5", "S"],
    [23, "S", "E", "23. enviarBienvenida( emailNormalizado, token )   L68", "S"],
    [24, "E", "E", "24. [EMAIL_ENABLED=false] escribe [EMAIL SIMULADO] en el log y devuelve true   SRV_EmailService.ts L14-21", "S"],
    [25, "E", "E", "25. [EMAIL_ENABLED=true] _enviarViaSmtp hace throw y devuelve false   SRV_EmailService.ts L100-102", "S"],
    [26, "S", "B", "26. registrar( id, 'INSERT', 'clientes', 'Alta de nuevo cliente', request, id )   L70-77", "S"],
    [27, "B", "D", "27. INSERT INTO bitacora_auditoria con ip_address y user_agent   SRV_BitacoraService.ts L27-38.   La 5 de 5", "S"],
    [28, "S", "S", "28. [emailOk] 201 CREATED, confirmacion_email: 'enviado'   L80-85", "S"],
    [29, "S", "S", "29. [!emailOk] 207, confirmacion_email: 'fallido', warning   L88-94", "S"],
    [30, "S", "C", "30. RegistroResponse & { statusCode }   L22", "A"],
    [31, "C", "C", "31. response.status( statusCode ) y devuelve el resultado sin el statusCode   CTR_Cliente.ts L17-18", "S"],
    [32, "C", "H", "32. 201 Created, o 207, con el cuerpo JSON", "A"],
    [33, "H", "L", "33. RegistroResponse   api.ts L1065", "A"],
    [34, "L", "L", "34. setExito( resultado.detail )   L55.   Pinta la caja verde, que dice 'Seras redirigido'", "S"],
    [35, "L", "L", "35. [warning] setError( warning ) y return: la caja roja y NO navega   L57-59", "S"],
    [36, "L", "L", "36. [sin warning] setTimeout( ... ) -> navigate( '/login?redirect=...' )   L61", "S"],
    [37, "L", "U", "37. la cuenta queda creada y lista para entrar por CU01   el mismo login del diagrama anterior", "A"]
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. No hay transaccion, y el alta escribe 5 veces en 4 tablas", [
        "En TODO el modulo clientes, de 5 ficheros y 189 lineas, no hay",
        "ni una transaction ni un QueryRunner. Ni una.",
        "",
        "Las cinco escrituras, en orden:",
        "",
        "  1  INSERT usuarios                 SRV_ClienteService.ts L46",
        "  2  INSERT usuarios_roles           L48",
        "  3  INSERT clientes                 L58",
        "  4  INSERT email_confirmations      L61",
        "  5  INSERT bitacora_auditoria      SRV_BitacoraService.ts L38",
        "",
        "Si falla la 3, la 4 o la 5, las anteriores se quedan escritas.",
        "No hay rollback porque no hay nada que deshaga.",
        "",
        "El caso de uso no dice nada de transacciones. Y cuatro modulos si las",
        "usan: SRV_ComprasService, SRV_PagosService, SRV_ReservasService y",
        "SRV_VentasService. El alta de cliente es el unico camino de escritura",
        "de usuario que no la tiene."
    ]],
    ["2. nombre no tiene MaxLength en ninguna capa, y la columna es", [
        "varchar(150). Con un nombre largo se rompe el alta por la mitad.",
        "",
        "  DTO Esquemas.ts L4-6       solo @IsString y @MinLength(2)",
        "  Frontend Registro.tsx L30  solo nombre.trim().length < 2",
        "  Columna schema.sql L90     nombre VARCHAR(150) NOT NULL",
        "  Entidad CE_Modelos.ts L20  @Column({ length: 150 })",
        "",
        "O sea: las dos validaciones miran el minimo y ninguna mira el",
        "maximo. Un nombre de 151 caracteres pasa las dos.",
        "",
        "Que pasa entonces:",
        "",
        "  L46  INSERT usuarios           OK, queda escrito",
        "  L48  INSERT usuarios_roles     OK, queda escrito",
        "  L58  INSERT clientes           FALLA, 22001 value too long",
        "  -> 500 Internal server error",
        "",
        "Y el usuario se queda con una fila en usuarios, estado='Activo',",
        "sin rol y sin perfil de cliente. Y con el correo ocupado, asi que",
        "reintentar da 409 para siempre. Ni el cliente ni el administrador",
        "lo pueden arreglar desde la aplicacion.",
        "",
        "Lo mismo pasa con un correo de mas de 120 caracteres, pero ahi",
        "falla el INSERT numero 1, asi que no queda nada escrito."
    ]],
    ["3. El correo no se puede enviar en ninguna configuracion posible", [
        "SRV_EmailService.enviarBienvenida, L10-30, tiene dos caminos:",
        "",
        "  EMAIL_ENABLED = false   L16-21",
        "    escribe [EMAIL SIMULADO] en el log y DEVUELVE TRUE   L20",
        "",
        "  EMAIL_ENABLED = true    L23-25",
        "    llama a _enviarViaSmtp, que es esto, L100-102:",
        "      throw new Error('SMTP aun no configurado en el prototipo.')",
        "    el catch de L26-29 lo traga y DEVUELVE FALSE",
        "",
        "O sea: con false dice que se envio y no se envio nada. Con true",
        "falla siempre, porque el metodo que manda el correo no esta",
        "implementado. No hay ninguna combinacion que mande un correo.",
        "",
        "El .env L25 y el .env.example L26 tienen EMAIL_ENABLED=false, asi",
        "que hoy la API responde 201 con confirmacion_email:'enviado' y no",
        "ha salido nada. Y la rama del 207, L88-94, es codigo muerto.",
        "",
        "Y el caso de uso dice que se confirma la cuenta por correo."
    ]],
    ["4. La tabla email_confirmations se llena y no se lee nunca", [
        "La entidad EmailConfirmation aparece en 3 ficheros del proyecto:",
        "la entidad, el registro en el modulo, y el INSERT de L61.",
        "Ningun endpoint la consulta. En todo el proyecto.",
        "",
        "  used            L110   se escribe false y nunca pasa a true",
        "  confirmado_en   L111   no se escribe nunca",
        "  expires_at      L109   se calcula a 24 h y no se comprueba nunca",
        "",
        "Las 7 columnas de la tabla, y se usan 4 para insertar.",
        "",
        "Y el enlace que llevaria el correo, que es",
        "  ${EMAIL_BASE_URL}/confirmar-cuenta?token=...   L12",
        "apunta a una pagina que NO EXISTE. El router tiene 38 rutas y",
        "ninguna es confirmar-cuenta, en router.tsx L45-100.",
        "",
        "La tabla, la entidad, la columna, el endpoint que falta y la",
        "pagina que falta. Las cinco pieces de la verificacion de correo",
        "estan escritas menos la de comprobarla."
    ]],
    ["5. El cliente nace Activo y el empleado nace Pendiente", [
        "Los dos altas de usuario del proyecto no se parecen:",
        "",
        "  ALTA DE CLIENTE, CU02, SRV_ClienteService.ts",
        "    L44    estado: 'Activo'",
        "    L61    inserta en email_confirmations, que no se lee",
        "    L68    enviarBienvenida, que no envia",
        "    -> el usuario queda activo de inmediato y sin verificar nunca",
        "",
        "  ALTA DE EMPLEADO, CU04, SRV_EmpleadosService.ts",
        "    L139   estado: 'Pendiente'",
        "    L169   genera un FirstPasswordToken",
        "    L175   lo guarda",
        "    -> el usuario tiene que fijar su contrasena antes de poder",
        "       entrar, porque autenticar() L48 exige estado='activo'",
        "",
        "Y el default de la columna es 'Pendiente', schema.sql L37. O",
        "sea que el alta de cliente sobrescribe el default a proposito o por",
        "descuido, y el resultado es que hay dos politicas distintas para",
        "dos altas del mismo sistema."
    ]],
    ["6. Si llegara el 207, el frontend se contradice consigo mismo", [
        "El camino de L55 a L61, en Registro.tsx:",
        "",
        "  L55  setExito( resultado.detail )",
        "       pinta la caja VERDE, cuyo texto en L96 es",
        "         'Cuenta creada exitosamente. Ya puedes iniciar sesion.",
        "          Seras redirigido al inicio de sesion...'",
        "",
        "  L57  if ( resultado.warning )",
        "  L58      setError( resultado.warning )   pinta la caja ROJA",
        "  L59      return                          NO LLEGA a L61",
        "",
        "Resultado: las dos cajas a la vez, la verde diciendo que le van a",
        "redirigir y la roja diciendo que no se pudo enviar el correo, y el",
        "navegador se queda en la pagina. Sin el return, L61 saltaria.",
        "",
        "Y la cuenta SI esta creada, porque las cinco escrituras de L46 a",
        "L61 ya se hicieron antes del 207. El aviso y el error se mezclan",
        "en el mismo estado, que es setError, y no hay ningun estado para",
        "un aviso que no sea un error.",
        "",
        "Ademas L100 esconde el formulario con !exito, asi que la pantalla",
        "se queda a medias con el formulario oculto y sin redireccion."
    ]],
    ["7. direccion no se rellena nunca, y ni se puede rellenar", [
        "La tabla clientes, schema.sql L87-94, tiene 6 columnas:",
        "",
        "  id_cliente     SERIAL       se rellena solo",
        "  usuario_id     INTEGER      se rellena en L53",
        "  nombre         VARCHAR(150) se rellena en L55",
        "  telefono       VARCHAR(30)  se rellena en L56",
        "  direccion      TEXT         NUNCA",
        "  fecha_registro TIMESTAMP    se rellena sola",
        "",
        "Y no es que falte: es que no se podria aunque se quisiera.",
        "",
        "  - RegistroRequest, Esquemas.ts, tiene 4 campos y direccion",
        "    no es uno de ellos",
        "  - registrarCliente L53-57 no la escribe",
        "  - CTR_Cliente.ts tiene 20 lineas y un unico endpoint",
        "  - y el ValidationPipe va con whitelist:true, main.ts L24, asi",
        "    que si un cliente manda direccion en el POST, se descarta en",
        "    silencio antes de llegar al servicio",
        "",
        "Una columna de la tabla que ningun camino del codigo puede tocar."
    ]],
    ["8. El 409 y el indice unico no son atomicos: hay una carrera", [
        "El alta comprueba y luego inserta, y entre medias no hay nada:",
        "",
        "  L25-27  findOne( { where: { email } } )   SELECT",
        "  L28-30  if ( existe ) throw 409",
        "  ...  hashearPassword, que es bcrypt, y tarda ~100 ms",
        "  L46     save( usuario )                 INSERT",
        "",
        "usuarios.email es UNIQUE, schema.sql L34, asi que el indice",
        "salva la integridad. Lo que no salva es el codigo de error.",
        "",
        "Dos altas simultaneas con el mismo correo pasan las dos el L28.",
        "La primera inserta. La segunda recibe un 23505 de Postgres que",
        "nadie captura, y sale un 500 Internal server error en vez del 409",
        "que el frontend esta escrito para mostrar en L65.",
        "",
        "Lo mismo con un reintento: la cuenta huerfana del hallazgo 2",
        "hace que el L28 la encuentre y devuelva 409, y el usuario que",
        "solo queria registrarse ve que ese correo ya esta ocupado."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU02."; } catch (e) { }
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
        try { o.Text = "CU02  Registrar Nuevo Cliente"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 700) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseno de caso de uso, seccion 3.3.2.1.  10 lineas de vida, 37 mensajes, 8 hallazgos."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja: lo que esta mas arriba pasa antes. Cada mensaje lleva el fichero y la linea de donde sale. Lo que va entre corchetes es la guarda. Los mensajes 19 a 27 son las cinco escrituras del alta, y ninguna esta en una transaccion."; } catch (e) { }
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
// LOS 37 MENSAJES
// ---------------------------------------------------------------

// El conector de un mensaje va en el ELEMENTO, no en el diagrama, y su tipo
// en EA es Sequence. La etiqueta va COMPLETA, con el fichero y la linea:
// recortarla es lo que hacia que el diagrama dejara de ser trazable.
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
    N.push("CU02  Registrar Nuevo Cliente.  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Cliente          «actor»     la persona que se da de alta");
    N.push("    Registro.tsx           «boundary»  web/src/pages/Registro.tsx, 182 lineas");
    N.push("    api.ts                 «boundary»  web/src/lib/api.ts, L1055");
    N.push("    ValidationPipe         «control»   api/src/main.ts, L22-43, es global");
    N.push("    CTR_Cliente            «control»   el @Post('registrar') de 20 lineas");
    N.push("    SRV_ClienteService     «control»   el registrarCliente() de 96 lineas");
    N.push("    SRV_SeguridadService   «control»   el bcrypt.hash, coste 10");
    N.push("    SRV_EmailService       «control»   el enviarBienvenida(), que no envia");
    N.push("    SRV_BitacoraService    «control»   el registrar(), la quinta escritura");
    N.push("    PostgreSQL             «entity»    6 tablas de schema.sql");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes: 7 van a la base de datos, 18 son mensajes a si mismo y 4 son");
    N.push("  retornos. 6 llevan la guarda escrita entre corchetes y hay 5 codigos");
    N.push("  distintos: 201, 207, 409, 422 y 500.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("EL MODULO CLIENTES ENTERO");
    N.push("");
    N.push("  Son 5 ficheros y 189 lineas, y este caso de uso es lo unico que hacen:");
    N.push("");
    N.push("    CTR_Cliente.ts          20 lineas, un unico endpoint");
    N.push("    SRV_ClienteService.ts   96 lineas, un unico metodo");
    N.push("    CE_Modelos.ts           31 lineas, una clase, 0 metodos");
    N.push("    Esquemas.ts             26 lineas, 2 DTOs");
    N.push("    clientes.module.ts      16 lineas");
    N.push("");
    N.push("  Y de las 6 tablas que toca, 4 son del paquete seguridad: usuarios,");
    N.push("  roles, usuarios_roles, email_confirmations y bitacora_auditoria. Solo");
    N.push("  clientes es suya. Es el mismo cruce de paquete que ya sale en el");
    N.push("  diagrama de capas, y aqui se ve por que pasa: el alta de cliente es");
    N.push("  medio alta de usuario.");
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  No hay transaccion, y el alta escribe 5 veces en 4 tablas. En todo el");
    N.push("     modulo no hay ni una transaction ni un QueryRunner. Cuatro modulos");
    N.push("     si las usan: Compras, Pagos, Reservas y Ventas. El alta de cliente es");
    N.push("     el unico camino de escritura de usuario que no la tiene.");
    N.push("  2  nombre no tiene MaxLength en ninguna de las dos capas, y la columna es");
    N.push("     varchar(150). Un nombre de 151 caracteres pasa las dos validaciones,");
    N.push("     deja escritas las filas 1 y 2, y revienta en la 3. Queda un usuario");
    N.push("     activo sin rol y sin perfil, con el correo ocupado para siempre.");
    N.push("  3  El correo no se puede enviar en ninguna configuracion. Con");
    N.push("     EMAIL_ENABLED=false dice que se envio y no se envia nada. Con true");
    N.push("     _enviarViaSmtp hace throw, SRV_EmailService.ts L100-102. El 201 con");
    N.push("     confirmacion_email:'enviado' es una mentira, y el 207 es codigo muerto.");
    N.push("  4  La tabla email_confirmations se llena y no se lee nunca. used nunca");
    N.push("     pasa a true, expires_at no se comprueba, y el enlace del correo apunta");
    N.push("     a /confirmar-cuenta, que no esta en las 38 rutas del router.");
    N.push("  5  El cliente nace estado='Activo' y el empleado nace 'Pendiente'. Son las");
    N.push("     dos altas de usuario del proyecto y no se parecen: el empleado tiene");
    N.push("     que fijar contrasena, el cliente no. El default de la columna es");
    N.push("     'Pendiente', asi que el alta de cliente lo sobrescribe.");
    N.push("  6  Si llegara el 207, el frontend se contradice: pinta la caja verde con");
    N.push("     'Seras redirigido al inicio de sesion' y la roja con el aviso, y hace");
    N.push("     return en L59, asi que L61 no navega. Las dos escrituras del alta ya");
    N.push("     estaban hechas, asi que la cuenta si existe.");
    N.push("  7  direccion no se rellena nunca y no se podria: no esta en el DTO, el");
    N.push("     servicio no la escribe, el unico endpoint del modulo no la expone, y");
    N.push("     el ValidationPipe va con whitelist:true, asi que si se manda, se");
    N.push("     descarta en silencio antes de llegar al servicio.");
    N.push("  8  El 409 y el indice unico no son atomicos. Se comprueba con un SELECT y");
    N.push("     se inserta un bcrypt despues, unos 100 ms. Dos altas simultaneas con");
    N.push("     el mismo correo pasan las dos el L28, y la segunda recibe un 23505 sin");
    N.push("     capturar, que sale como 500 y no como el 409 que el frontend muestra.");
    N.push("");
    N.push("LO QUE ESTA BIEN, Y NO ES POCO");
    N.push("");
    N.push("  - La validacion del DTO devuelve TODOS los errores, no solo el primero.");
    N.push("    El exceptionFactory de main.ts L27-41 recorre los constraints anidados");
    N.push("    y los junta todos, y handleResponse, api.ts L1006, une el array con");
    N.push("    saltos de linea. Un formulario con tres fallos muestra los tres a la vez.");
    N.push("  - El correo se normaliza en los dos lados, toLowerCase y trim en L23 y en");
    N.push("    Registro.tsx L51, asi que Juan@X.com y juan@x.com son la misma cuenta.");
    N.push("  - La contrasena se hashea antes de tocar la base de datos, L39 antes de");
    N.push("    L46, y con bcrypt a coste 10. Y en ningun sitio se guarda en claro.");
    N.push("  - La pantalla de registro NO depende de AuthContext: llama a api.registrar");
    N.push("    directamente. No hay estado de sesion que tocar ni que invalidar, que es");
    N.push("    lo correcto en un alta.");
    N.push("  - El servicio no acepta el rol del cliente. Lo busca por nombre, L32-34,");
    N.push("    asi que un cliente no puede pedir un rol de administrador con un POST");
    N.push("    manipulado. Y si el rol no existe devuelve 500, que es un codigo")
    N.push("    impropio para un dato que falta, pero no una fuga.");
    N.push("  - Los errores de validacion del DTO y los de negocio tienen codigos");
    N.push("    distintos: 422 para el DTO y 409 para el correo repetido. Se distinguen.");
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
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS QUE YA EXISTEN");
    N.push("");
    N.push("  Este es el segundo diagrama de secuencia, y el primero fue CU01 Iniciar");
    N.push("  Sesion en Plataforma. Los dos comparten cuatro de sus diez lineas de");
    N.push("  vida: api.ts, PostgreSQL, SRV_SeguridadService y SRV_BitacoraService. Y");
    N.push("  los dos terminan en el mismo sitio: la cuenta creada por CU02 entra por el");
    N.push("  login de CU01, que es el mensaje 37 de este y el mensaje 5 de aquel.");
    N.push("");
    N.push("  Ese enganche es el que hace util tener los dos: CU02 deja un usuario");
    N.push("  activo sin verificar, y CU01 lo deja entrar sin comprobar que le");
    N.push("  pertenece el correo. Los dos hallazgos juntos son el mismo fallo.");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU02 Secuencia", 0); } catch (e) { }
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
    T.push("CU02 - DIAGRAMA DE SECUENCIA - INFORME");
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
    msg = msg + "CU02 - Registrar Nuevo Cliente" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO;
    msg = msg + "5 escrituras en 4 tablas y ninguna transaccion." + SALTO + SALTO;
    msg = msg + "LO MAS GRAVE: el correo no se puede enviar en" + SALTO;
    msg = msg + "ninguna configuracion, y la tabla que verifica" + SALTO;
    msg = msg + "la cuenta se llena y no se lee nunca." + SALTO;
    msg = msg + "Y nombre sin MaxLength rompe el alta por la mitad." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU02 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU02 Secuencia", 0); } catch (e3) { }
}
