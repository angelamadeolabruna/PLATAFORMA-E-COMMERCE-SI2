// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU14  Registrar Proveedor
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/admin/AdminProveedores.tsx        711 lineas
//     web/src/lib/api.ts                            L1493-1520
//     api/src/main.ts                               L22-43 ValidationPipe
//     api/src/modulos/seguridad/dependencias.ts     L15-65 JwtAuthGuard
//     api/src/modulos/proveedores/CTR_Proveedores.ts 110 lineas, 3 endpoints
//     api/src/modulos/proveedores/SRV_ProveedoresService.ts 409 lineas
//     api/src/modulos/seguridad/SRV_BitacoraService.ts L14-39
//     BASE DE DATOS/schema.sql                      L197-209
//
//   Cada mensaje lleva la linea del fichero de la que sale.
//
// QUE HACE ESTE CASO, Y POR QUE ES EL HALLAZGO MAS GRAVE DEL PROYECTO
//   De las 8 columnas que el INSERT de L220-222 nombra, 4 NO EXISTEN.
//
//   LO QUE DICE EL ESQUEMA, L197-209, la tabla entera, 11 columnas:
//     id_proveedor, nombre_empresa, persona_contacto, telefono, email,
//     direccion, observaciones, tiempo_entrega_dias, estado_riesgo,
//     calidad_score, fecha_registro
//
//   LO QUE ESCRIBE EL CODIGO, L220-222:
//     nombre_empresa, nit_ruc, telefono, email, id_ciudad, direccion,
//     condiciones_comerciales, estado
//
//   LAS 4 QUE NO EXISTEN: nit_ruc, id_ciudad, condiciones_comerciales y
//   estado. Y las 4 que si existen y el codigo no usa: persona_contacto,
//   observaciones, tiempo_entrega_dias y estado_riesgo.
//
//   O sea que el INSERT da 42703. Y antes de llegar al INSERT, la
//   consulta de duplicados de L208 hace WHERE nit_ruc = $1, que tambien
//   falla. O sea que registrar un proveedor da 500 en la consulta de
//   duplicados, sin haber llegado a escribir nada.
//
//   Y lo que hay debajo es grave: la tabla NO TIENE columna de documento
//   fiscal. El concepto de NIT existe para clientes, nit_cliente, pero no
//   para proveedores. Y el codigo valida el NIT con un regex de 6 a 10
//   digitos, L16, y luego lo busca en una columna que no existe.
//
//   Es la cuarta vez que salen columnas que faltan, CU09 departamento,
//   CU10 porcentaje_iva, CU11 talla_europea y porcentaje_iva_default, y
//   aqui nit_ruc e id_ciudad. Y la primera con cuatro de golpe.
//
//   45 mensajes. 10 lineas de vida. 11 van a la base de datos, 17 son
//   mensajes a si mismo, 4 van al loop de validaciones y 10 son retornos.
//   10 guardas escritas entre corchetes y 4 codigos: 200, 201, 403, 409 y
//   422, mas el 42703 de Postgres.
//
// LOS FRAGMENTOS alt Y loop, Y LAS BARRAS DE ACTIVACION
//   Aqui si los hay, y son reales, no decorativos:
//
//   loop  sobre las nueve validaciones del servidor, L164-191, que son
//         nueve if independientes y cada uno lanza su propio 422.
//   alt   en la comprobacion de la ciudad, L203: existe y Activa, o no.
//   alt   en la comprobacion del duplicado, L211.
//
//   Y las barras de activacion van en la linea de vida del servicio, que
//   es la unica que ejecuta codigo: de la L1 a la L44 del diagrama.
//
//   OJO, Y ESTO ES LO QUE TIENES QUE MIRAR: EA no coloca fragmentos de
//   forma fiable por script. Lo que hay aqui son FORMAS dibujadas con
//   AddNew, con su etiqueta, que es la unica via que se puede forzar
//   desde el script. Si EA las acepta, se ven como cajas con su nombre.
//   Si no, el informe te dira cuantos han quedado: el apartado MARCOS Y
//   BARRAS del ShowMessage y de las notas del diagrama. Si pone 0, no se
//   han colocado y habra que hacerlos a mano en EA.
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
var TOTAL_MSG = 45;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU14 Secuencia Registrar Proveedor";
var DIAG_NOMBRE = "CU14 Registrar Proveedor";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 110;

var X_NOTA = 2675;
var ANCHO_NOTA = 520;
var Y_NOTA0 = 250;
var ALTO_LINEA_NOTA = 12;
var ALTO_MIN_NOTA = 130;
var SEPARACION_NOTA = 26;

var ANCHO_ACTIVACION = 14;
var PLAN = [];
var ERRORES = [];
var INFORME = [];
var MARCOS_PUESTOS = 0;
var BARRAS_PUESTAS = 0;

// ---------------------------------------------------------------
// LOS DATOS
// ---------------------------------------------------------------

// Las diez cabeceras. clave, nombre, tipo, estereotipo, subtipo,
// cabecera corta, papel RUP, fichero real.
var CAB = [
    ["U", "ACTOR_Administrador", "Actor", "Lifeline", "Administrador", "quien da de alta", "Actor, no clase: es quien pulsa", "no es codigo, es la persona"],
    ["F", "AdminProveedores.tsx", "Object", "Lifeline", "AdminProveedores", "pantalla de proveedores", "Boundary", "web/src/pages/admin/AdminProveedores.tsx, 711 lineas"],
    ["H", "api.ts", "Object", "Lifeline", "api", "cliente HTTP", "Boundary", "web/src/lib/api.ts, L1493-1520"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["P", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "siete campos", "Control", "api/src/main.ts, L22-43, es global"],
    ["C", "CTR_Proveedores", "Object", "Lifeline", "ProveedoresController", "tres endpoints", "Control", "api/src/modulos/proveedores/CTR_Proveedores.ts, L55-93, en /proveedores"],
    ["S", "SRV_ProveedoresService", "Object", "Lifeline", "ProveedoresService", "409 lineas", "Control", "api/src/modulos/proveedores/SRV_ProveedoresService.ts, L157-244"],
    ["H2", "las nueve validaciones", "Object", "Lifeline", "L164-191", "el loop del servidor", "Control", "SRV_ProveedoresService.ts, L164-191, nueve if independientes"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar()", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "2 tablas y 4 columnas de mas", "Entity", "schema.sql: proveedores L197-209 y bitacora_auditoria, mas ciudades L51-56"]
];

// Los 44 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [
    [1, "U", "F", "1. abre /admin/proveedores   AdminProveedores.tsx, 711 lineas.   Con alta, listado y un menu de estado de riesgo con tres opciones   L267-280", "S"],
    [2, "F", "F", "2. el useEffect de L492 pide el listado y las ciudades a la vez, con Promise.all   L492", "S"],
    [3, "F", "H", "3. GET /api/v1/proveedores   api.ts L1493.   Ojo con la ruta: este controlador NO es admin, es @Controller('proveedores')   CTR_Proveedores L55", "S"],
    [4, "H", "G", "4. GET con Authorization Bearer y credentials:'include'", "S"],
    [5, "G", "D", "5. SELECT usuarios WHERE id_usuario = :sub   L44.   Una consulta por peticion, en el guard", "S"],
    [6, "G", "G", "6. [estado != 'activo'] 401 'Tu cuenta esta deshabilitada.'   L49-51", "S"],
    [7, "C", "P", "7. el pipe valida los 7 campos del DTO   CTR_Proveedores L20-47: @IsString y @IsNotEmpty en nombre, nit_ruc, telefono y correo, @IsInt en id_ciudad, y @IsOptional @IsString en direccion y condiciones_comerciales", "S"],
    [0, "P", "C", "0. y aqui el pipe no puede mirar longitudes: no hay ni un MaxLength en los 7 campos.   Todo lo que sea mas largo de la columna lo comprueba despues el servicio   L164-191", "S"],
    [8, "S", "D", "8. SELECT r.permisos_json FROM usuarios JOIN usuarios_roles JOIN roles WHERE u.id_usuario = $1   L71-79.   SIN getter, tercera vez en trece casos", "S"],
    [9, "S", "S", "9. [sin '*' ni 'gestionar_proveedores'] 403 'No tienes permiso para gestionar proveedores.'   L83-89", "S"],
    [10, "S", "H2", "10. y aqui empieza el LOOP de las nueve validaciones, L164-191.   Son nueve if independientes, cada uno con su propio 422, y el pipe ya habia validado seis campos", "S"],
    [11, "H2", "H2", "11. [nombre < 3] 422 L165-167.   [nombre > 150] 422 L168-170.   El nombre va a VARCHAR(150), schema.sql L199, asi que aqui si cuadra", "S"],
    [12, "H2", "H2", "12. [el NIT no cumple NIT_RE, que es 6 a 10 digitos] 422 L172-175.   [telefono vacio] 422 L177-180.   [telefono > 30] 422 L181-183", "S"],
    [13, "H2", "H2", "13. [el correo no cumple CORREO_RE] 422 L185-188.   [correo > 120] 422 L189-191.   CORREO_RE es un regex propio, L17, no el @IsEmail de class-validator que usa CU01", "S"],
    [14, "H2", "S", "14. el loop termina, o con el NIT mas largo validado, o con un 422 y la peticion muerta aqui", "S"],
    [15, "S", "D", "15. SELECT id_ciudad, nombre, estado FROM ciudades WHERE id_ciudad = $1   L197-201.   Y aqui empieza el primer ALT", "S"],
    [16, "S", "S", "16. [no existe, o no esta Activa] 422 'La ciudad seleccionada no existe.'   L203-205.   Y ojo: sin ciudades no se puede dar de alta un proveedor, por el hallazgo 2 de CU09", "S"],
    [17, "S", "D", "17. el segundo ALT: SELECT COUNT(*) FROM proveedores WHERE nit_ruc = $1   L207-210", "S"],
    [18, "D", "D", "18. [error 42703] la columna nit_ruc no existe en proveedores.   El esquema, L197-209, tiene 11 columnas y ninguna es nit_ruc.   Y aqui se acaba el caso", "S"],
    [19, "S", "S", "19. el ALT nunca llega a su rama de 409, porque la consulta de L208 falla antes.   O sea que el mensaje 'El NIT/RUC ya esta registrado' es inalcanzable", "S"],
    [20, "S", "D", "20. INSERT INTO proveedores (nombre_empresa, nit_ruc, telefono, email, id_ciudad, direccion, condiciones_comerciales, estado) VALUES ($1..$7, 'Activo', NOW()) RETURNING id_proveedor   L220-223", "S"],
    [21, "D", "D", "21. [otro 42703] de las 8 columnas, 4 existen: nombre_empresa, telefono, email y direccion.   Y 4 no: nit_ruc, id_ciudad, condiciones_comerciales y estado   L220-222", "S"],
    [22, "S", "S", "22. y aunque se llegara, el INSERT pone estado y la columna se llama estado_riesgo, L206.   El mismo fichero, L285, si la usa bien en el UPDATE de cambiarEstado", "S"],
    [23, "S", "B", "23. bitacora('INSERT', 'proveedores', 'Proveedor creado: ...', usuario, request, idProveedor, null, { nombre, nit_ruc, correo, telefono, id_ciudad })   L232-241 y L97-117", "S"],
    [24, "B", "D", "24. INSERT INTO bitacora_auditoria con new_data   L27-38.   Y esta si llegaria, porque va detras", "A"],
    [25, "S", "C", "25. [la fila no volvio] Error 'No se pudo registrar el proveedor.'   L227-229.   Un Error a secas, que sale como 500 sin cuerpo   A", "A"],
    [26, "C", "H", "26. { detail, id_proveedor }   api.ts L1497-1505", "A"],
    [27, "H", "F", "27. Toast de exito con el id, o Toast de error con el 500   L512 y L520", "A"],
    [28, "F", "U", "28. el administrador ve un error generico, sin saber que el problema es una columna que no existe   A", "A"],
    [29, "F", "F", "29. en paralelo, el boton se habilita solo si el NIT cumple el regex del cliente, L90, que es el mismo NIT_RE de L17.   O sea que hay tres NIT_RE: el del cliente, el del servicio, y el que no existe en la base", "S"],
    [30, "F", "F", "30. y el listado, L492, tampoco funciona, porque L124 pide p.condiciones_comerciales y L140 lee p.estado_riesgo: la primera no existe y la segunda si, pero la consulta las pide juntas   L124", "S"],
    [31, "F", "F", "31. el menu de estado de riesgo, L267-280, si esta bien: tres estados y transiciones.   ESTADOS_VALIDOS, L18, es una lista blanca de verdad   A", "S"],
    [32, "F", "H", "32. PATCH /api/v1/proveedores/:id/estado   api.ts L1507", "S"],
    [33, "C", "S", "33. cambiarEstado( currentUser, id, body.estado, request )   L85.   Y aqui no hay return temprano como en CU11, el servicio comprueba el estado   L246-301", "S"],
    [34, "S", "D", "34. SELECT id_proveedor, nombre_empresa, estado_riesgo FROM proveedores WHERE id_proveedor = $1   L261-263.   Consulta correcta: estado_riesgo si existe   S", "S"],
    [35, "S", "S", "35. [el estado no esta en ESTADOS_VALIDOS] 422 o 400   L18 y L267-280.   Y el switch de detalleEstado, L302-311, tiene default, asi que un estado raro no rompe   A", "S"],
    [36, "S", "D", "36. UPDATE proveedores SET estado_riesgo = $2 WHERE id_proveedor = $1   L285.   Y aqui si coincide con el esquema   A", "S"],
    [37, "S", "B", "37. bitacora('UPDATE', 'proveedores', 'Proveedor ...', ..., { estado: el viejo }, { estado: el nuevo })   L246-301.   oldData real, como en CU09 y CU11   A", "S"],
    [38, "B", "D", "38. INSERT INTO bitacora_auditoria con old_data y new_data   L27-38", "A"],
    [39, "S", "C", "39. { detail: detalleEstado(nuevo) }, con los tres mensajes: activado, deshabilitado o bloqueado   L299 y L302-311", "A"],
    [40, "C", "H", "40. el JSON con el detalle   api.ts L1507-1515", "A"],
    [41, "H", "F", "41. setProveedores y recarga   L528", "A"],
    [42, "F", "F", "42. y el menu se reconstruye con las transiciones del estado nuevo   L386, con OPCIONES_POR_ESTADO   S", "S"],
    [43, "U", "F", "43. el administrador ve el proveedor con su nuevo estado de riesgo, si es que se pudo crear   S", "S"],
    [44, "F", "F", "44. y si no se pudo crear, no lo sabra nunca, porque el error es un 500 sin cuerpo y la bitacora no registra el intento fallido   A", "A"]
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. Cuatro de las ocho columnas del INSERT no existen", [
        "El hallazgo mas grande de los catorce, y el primero con cuatro",
        "columnas que faltan en el mismo INSERT.",
        "",
        "LO QUE DICE EL ESQUEMA, L197-209. La tabla proveedores entera,",
        "11 columnas:",
        "",
        "  id_proveedor, nombre_empresa, persona_contacto, telefono,",
        "  email, direccion, observaciones, tiempo_entrega_dias,",
        "  estado_riesgo, calidad_score, fecha_registro",
        "",
        "LO QUE ESCRIBE EL CODIGO, L220-222:",
        "",
        "  INSERT INTO proveedores",
        "    (nombre_empresa, nit_ruc, telefono, email, id_ciudad,",
        "     direccion, condiciones_comerciales, estado)",
        "  VALUES ($1, $2, $3, $4, $5, $6, $7, 'Activo', NOW())",
        "",
        "LAS 8, UNA POR UNA:",
        "",
        "  nombre_empresa          L199  SI existe",
        "  telefono                L201  SI existe",
        "  email                   L202  SI existe",
        "  direccion               L203  SI existe",
        "  nit_ruc                 NO EXISTE",
        "  id_ciudad               NO EXISTE",
        "  condiciones_comerciales NO EXISTE",
        "  estado                  NO EXISTE.   La real se llama estado_riesgo, L206",
        "",
        "O sea que el INSERT da 42703. Y ADEMAS falla antes, porque la",
        "consulta de duplicados de L208 nombra nit_ruc. O sea que el",
        "primer error es en el SELECT, y nunca se llega a escribir.",
        "",
        "Y LAS 4 QUE EXISTEN Y NO USA, que es la otra mitad del despiste:",
        "  persona_contacto     la persona a la que llamar",
        "  observaciones         las notas internas",
        "  tiempo_entrega_dias   con DEFAULT 15, el plazo de entrega",
        "  estado_riesgo         el estado, que el codigo llama estado",
        "",
        "tiempo_entrega_dias es la que mas duele para el negocio: es el",
        "plazo de entrega de un proveedor, y hay ordenes de compra",
        "dependiendo de el. Y no hay ninguna forma de introducirlo desde la",
        "aplicacion."
    ]],
    ["2. No hay columna de documento fiscal, y el NIT se valida contra el aire", [
        "La columna que falta no es un descuido de nombre. Es que el",
        "concepto no existe en la tabla.",
        "",
        "LO QUE SE VALIDA, L172-175:",
        "",
        "  const nit = dto.nit_ruc.trim();",
        "  if (!NIT_RE.test(nit))",
        "    throw new UnprocessableEntityException(",
        "      'El NIT/RUC no tiene un formato valido.');",
        "",
        "Y EL REGEX, L16:",
        "",
        "  const NIT_RE = /^\\d{6,10}$/;",
        "",
        "Y LA CONSULTA, L208:",
        "",
        "  SELECT COUNT(*)::int AS n FROM proveedores WHERE nit_ruc = $1",
        "",
        "O sea que el NIT se valida con un formato, se busca en una tabla,",
        "y no hay ni la columna ni el valor donde meterlo.",
        "",
        "EL NIT SI EXISTE, PARA CLIENTES. En la tabla de clientes hay un",
        "  nit_cliente VARCHAR(30)",
        "Es decir: el concepto se implemento para los clientes y no se",
        "llevo a los proveedores. Y el caso de uso se llama 'Registrar",
        "Proveedor' y pide el NIT/RUC como OBLIGATORIO, L25-28 del DTO,",
        "con @IsNotEmpty. O sea que el formulario exige un dato que el",
        "sistema no sabe guardar.",
        "",
        "Y EL REGEX TIENE DOS PROBLEMAS:",
        "",
        "  - de 6 a 10 digitos. Un NIT boliviano de verdad es de 10 a 13,",
        "    y un RUC peruano de 11. O sea que el rango acepta cosas que",
        "    no son NIT y rechaza cosas que si lo son.",
        "  - sin digito verificador. No hay suma, ni modulo, ni nada. O sea",
        "    que 123456 pasaria, y es un numero valido en formato pero",
        "    imposible.",
        "",
        "Y hay tres NIT_RE en el proyecto: el del cliente, AdminProveedores",
        "L17, el del servicio, L16, y el que no existe en la base. Los dos",
        "primeros son identicos, o sea que estan duplicados en dos capas."
    ]],
    ["3. El control de duplicados busca la columna equivocada", [
        "Aun si nit_ruc existiera, la comprobacion no serviria de nada.",
        "",
        "LO QUE COMPRUEBA, L207-213:",
        "",
        "  SELECT COUNT(*)::int AS n FROM proveedores WHERE nit_ruc = $1",
        "  if ((duplicado?.n ?? 0) > 0)",
        "    throw new ConflictException('El NIT/RUC ya esta registrado.');",
        "",
        "LO QUE ES UNIQUE DE VERDAD EN EL ESQUEMA:",
        "",
        "  L199  nombre_empresa VARCHAR(150) UNIQUE NOT NULL",
        "  L202  email         VARCHAR(120) UNIQUE",
        "",
        "O sea que las dos unicas que el alta puede violar son el nombre de",
        "la empresa y el correo, y el codigo no comprueba ninguna de las",
        "dos. Comprueba una tercera que no es UNIQUE ni existe.",
        "",
        "CONSECUENCIA, si se arreglara la columna: se podrian dar de alta",
        "dos proveedores con el mismo nombre de empresa y el mismo correo,",
        "y el INSERT reventaria con el 23505 de Postgres, que aqui no se",
        "captura. O sea que el 409 de L212 no se dispara nunca y el",
        "cliente veria un 500 en vez de un 409.",
        "",
        "Y hay una ironia: CU10, en el mismo proyecto, si aprendio a",
        "capturar el 23505, con un bucle de 6 intentos para el SKU de",
        "productos. Ahi el autor sabe que el UNIQUE de Postgres puede",
        "reventar. Aqui no lo tiene en cuenta.",
        "",
        "Y CU11, en el mismo modulo de catalogo, tiene asegurarUnico, que",
        "es un control de duplicados con 5 parametros, parametrizado y",
        "con el id actual para no darme un 409 contra si mismo. O sea",
        "que el patron correcto existe, tres ficheros mas alla."
    ]],
    ["4. El estado se llama estado_riesgo, y solo el alta lo ignora", [
        "Un hallazgo pequeno, pero es el mismo tipo de despiste del 1, y",
        "esta vez dentro del mismo fichero.",
        "",
        "EL INSERT, L222, escribe estado:",
        "  ... condiciones_comerciales, estado) VALUES (..., 'Activo', NOW())",
        "",
        "EL UPDATE, L285, escribe estado_riesgo:",
        "  UPDATE proveedores SET estado_riesgo = $2 WHERE id_proveedor = $1",
        "",
        "Y LA CONSULTA, L261, lee estado_riesgo:",
        "  SELECT id_proveedor, nombre_empresa, estado_riesgo FROM proveedores",
        "",
        "Y EL LISTADO, L124 y L140, tambien:",
        "  p.estado_riesgo,   y   estado: f.estado_riesgo as string,",
        "",
        "O sea que de las cinco apariciones del estado de un proveedor,",
        "cuatro usan el nombre correcto y UNA, la del INSERT, usa el",
        "equivocado. Y el INSERT es el que no funciona.",
        "",
        "Y ADEMAS, el nombre correcto dice algo mas. estado_riesgo no es un",
        "estado de alta y baja como el de usuarios. Es un estado de RIESGO,",
        "con tres valores, y el frontend los maneja con un menu de",
        "transiciones, L267-280:",
        "",
        "  Activo      -> Deshabilitar (Inactivo) | Bloquear (Bloqueado)",
        "  Inactivo    -> Activar (Activo) | Bloquear (Bloqueado)",
        "  Bloqueado   -> Activar (Activo) | Deshabilitar (Inactivo)",
        "",
        "Y hay una LISTA BLANCA de verdad, L18, que es lo que CU09 no",
        "tenia:",
        "  const ESTADOS_VALIDOS = ['Activo', 'Inactivo', 'Bloqueado']",
        "",
        "Y un switch con default, detalleEstado L302-311, que devuelve un",
        "de tres mensajes. O sea que la parte de estado de este servicio",
        "esta bien escrita. Solo el INSERT la descoloca."
    ]],
    ["5. El listado tampoco funciona, y arrastra al formulario entero", [
        "La pantalla de proveedores no se puede usar ni para ver lo que",
        "ya hay, que es mas grave que no poder dar de alta.",
        "",
        "LO QUE PIDE EL LISTADO, L119-130:",
        "",
        "  SELECT p.id_proveedor, p.nombre_empresa, p.nit_ruc, p.telefono,",
        "         p.email, p.id_ciudad, p.direccion, p.condiciones_comerciales,",
        "         p.estado_riesgo, p.calidad_score, ...",
        "",
        "Y LAS COLUMNAS QUE NO EXISTEN EN ESA CONSULTA:",
        "",
        "  nit_ruc                  L119",
        "  id_ciudad                L121",
        "  condiciones_comerciales  L122",
        "",
        "O sea que el listado tambien da 42703. Y el listado es lo que se",
        "carga en el useEffect de L492, lo primero que hace la pantalla.",
        "",
        "ASI QUE: la pantalla de proveedores esta doblemente muerta. No se",
        "puede crear y no se puede listar. Y como no hay seed de",
        "proveedores, cero INSERT, tampoco habria nada que ver.",
        "",
        "Y AUN ASI, el cliente valida antes de enviar. L90:",
        "",
        "  NIT_RE.test(nitRuc.trim())",
        "",
        "O sea que el boton se habilita, el POST sale, y el error vuelve",
        "sin cuerpo. El usuario ve un Toast de error y no sabe si se",
        "equivoco en el NIT o si el sistema esta roto.",
        "",
        "Y hay un detalle de la arquitectura: este controlador NO es de",
        "admin. Es @Controller('proveedores'), L55, y el frontend lo llama",
        "en /api/v1/proveedores, api.ts L1493. De los 25 controladores",
        "del proyecto, 13 no llevan admin en la ruta, y son los de cliente,",
        "que es lo correcto. Pero el segundo controlador del MISMO",
        "fichero, L96, si es @Controller('admin/proveedores'), para el",
        "recalculo de score de CU20. O sea que el mismo fichero tiene las",
        "dos rutas, y solo una es de administracion."
    ]],
    ["6. El loop de validaciones se repite entero, y en dos capas", [
        "Aqui hay una duplicacion enorme, y de la buena: el servidor",
        "repite todas las validaciones del pipe. Eso es lo correcto. Pero",
        "se repite hasta el punto de ser codigo muerto.",
        "",
        "LO QUE VALIDA EL PIPE, CTR_Proveedores L20-47. Siete campos:",
        "",
        "  nombre   @IsString @IsNotEmpty",
        "  nit_ruc  @IsString @IsNotEmpty",
        "  telefono @IsString @IsNotEmpty",
        "  correo   @IsString @IsNotEmpty",
        "  id_ciudad @IsInt",
        "  direccion @IsOptional @IsString",
        "  condiciones_comerciales @IsOptional @IsString",
        "",
        "LO QUE VALIDA EL SERVIDOR, L164-191. Nueve comprobaciones:",
        "",
        "  nombre < 3        422        el pipe NO lo comprueba",
        "  nombre > 150      422        el pipe NO lo comprueba",
        "  NIT_RE            422        el pipe NO lo comprueba",
        "  telefono vacio    422        el pipe SI lo comprueba, L30-32",
        "  telefono > 30     422        el pipe NO lo comprueba",
        "  CORREO_RE         422        el pipe NO lo comprueba",
        "  correo > 120      422        el pipe NO lo comprueba",
        "  id_ciudad entero  422        el pipe SI lo comprueba, L37-38",
        "  CORREO_RE otra vez",
        "",
        "O sea que de las nueve del servidor, DOS son exactamente lo que",
        "el pipe ya hacia: telefono vacio e id_ciudad entero. Esas dos",
        "nunca se ejecutan, porque si el pipe las dejo pasar, el servicio",
        "no llega. Son codigo muerto.",
        "",
        "Las otras siete si aportan, y son las de longitud y formato, que",
        "el pipe no hace. Y estan bien elegidas: nombre 3-150 que",
        "coincide con VARCHAR(150) de L199, telefono 30 con VARCHAR(30)",
        "de L201, correo 120 con VARCHAR(120) de L202. ESTE es el unico",
        "caso de los catorce donde el MaxLength o el limite del servidor",
        "coinciden con la columna. CU05, CU11 y el nombre de la talla no",
        "coincidian.",
        "",
        "PERO el filtro se puede pulir: si el pipe ya valido el correo con",
        "su propio @IsEmail, el servicio lo vuelve a validar con un regex",
        "propio. Y CU01, en el mismo proyecto, usa @IsEmail de",
        "class-validator, que es el validador estandar. O sea que hay dos",
        "validadores de correo en el proyecto, y este caso usa el menos",
        "estandar de los dos."
    ]],
    ["7. El permiso no usa el getter, y el catalogo tiene cuatro", [
        "La tercera vez en catorce casos, y las tres en el mismo modulo:",
        "catalogo de CU10, catalogos de CU11, y aqui.",
        "",
        "cargarPermisos, L71-81, hace un JOIN directo a usuarios_roles, sin",
        "getter y sin roles[0]. Con la consulta completa:",
        "",
        "  SELECT r.permisos_json",
        "  FROM usuarios u",
        "  JOIN usuarios_roles ur ON ur.id_usuario = u.id_usuario",
        "  JOIN roles r ON r.id_rol = ur.id_rol",
        "  WHERE u.id_usuario = $1",
        "",
        "Y hay DOS funciones de permiso en este servicio, L83 y L90:",
        "",
        "  exigirPermiso          'gestionar_proveedores'   L83-89",
        "  exigirPermisoEvaluar   otro permiso             L90-96",
        "",
        "O sea que CU14 y CU20, el recalculo de score, tienen permisos",
        "distintos, que es correcto. Y el de CU20 no lo he mirado, asi que",
        "no digo cual es.",
        "",
        "PERO hay un detalle del proyecto, que si es un hallazgo y es de",
        "CU05: 'gestionar_proveedores' es uno de los 21 del catalogo de",
        "permisos. Y segun el seed de schema.sql L573-L578, de los 16",
        "permisos que se siembran, el codigo entiende 2, y ninguno es",
        "este. O sea que segun el seed, este caso de uso solo es",
        "accesible con el asterisco del Administrador, que CU05 demostro",
        "que no se puede editar desde la aplicacion.",
        "",
        "Es la misma cadena que CU09: un caso de administracion que solo",
        "el superadministrador puede abrir."
    ]],
    ["8. Lo que si esta bien: los limites cuadran con las columnas", [
        "Y hay que decirlo porque es lo contrario de CU05, CU11 y CU13, y",
        "porque es el unico sitio de los catorce donde el detalle esta",
        "bien en todas las columnas.",
        "",
        "  COLUMNA           ESQUEMA      EL SERVICIO COMPRUEBA",
        "  nombre_empresa    VARCHAR(150)  3 a 150.   L165-170",
        "  telefono          VARCHAR(30)   1 a 30.    L177-183",
        "  email             VARCHAR(120)  regex, 120. L185-191",
        "  nit_ruc           no existe     regex, sin longitud",
        "",
        "O sea que las tres que existen, cuadran. Y eso no es casualidad:",
        "el autor ha leido el esquema para el servicio, pero no para la",
        "entidad ni para el seed. Por eso los limites estan bien y las",
        "columnas que no existen se le han colado.",
        "",
        "Y ADEMAS hay tres cosas mas que estan bien de verdad:",
        "",
        "  - ESTADOS_VALIDOS, L18, es una LISTA BLANCA con as const. Es lo",
        "    que CU09 L396 no hacia, alli el endpoint convertia cualquier",
        "    cadena en Inactiva sin mirar. Aqui hay tres valores y se",
        "    comprueban.",
        "",
        "  - detalleEstado, L302-311, es un switch con default, de modo que",
        "    un estado que se colara no rompe nada y devuelve el mensaje",
        "    de activado. Es defensivo.",
        "",
        "  - Y la bitacora de cambiarEstado, L246-301, pasa oldData con el",
        "    estado REAL leido de la fila en L269. Igual que CU09 y CU11, y",
        "    al contrario que CU06 y CU07, donde era un literal.",
        "",
        "Y un detalle de la pantalla: AdminProveedores.tsx L20 tiene su",
        "propio ESTADO_COLORES, y el menu de transiciones, L267-280, esta",
        "modelado como un Record con las opciones por estado, lo cual es",
        "una forma limpia de escribir una maquina de estados en el",
        "frontend. Es el mejor tratamiento de estados de todo el admin."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU14."; } catch (e) { }
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

// ---------------------------------------------------------------
// LOS FRAGMENTOS alt Y loop, Y LAS BARRAS DE ACTIVACION
//
// EA no coloca fragmentos de forma fiable por script, asi que lo que hay
// aqui son FORMAS con su etiqueta, que es la unica via que se puede forzar.
// Cada una va en try/catch y cuenta las que ha conseguido poner. El
// informe final dice cuantas, y si son 0 hay que hacerlas a mano.
//
// Un fragmento se dibuja como: una forma rectangular que abarca el rango
// de mensajes que cubre, y un texto pegado a su esquina superior izquierda
// con el nombre del operando y la guarda.
//
// Una barra de activacion se dibuja como: una forma estrecha sobre la
// linea de vida, entre la y de entrada y la y de salida.
// ---------------------------------------------------------------

// De que lifeline es este punto. Se usa para poner en la
// pestaña del fragmento sobre QUE lifeline esta el loop o el alt.
function lifelineEnX(x) {
    for (var i = 0; i < CAB.length; i++) {
        if (xDe(i) === x) return CAB[i][1];
    }
    return "el diagrama";
}

function fragmento(diag, nombre, izq, der, yTop, yBottom) {
    var alto = yBottom - yTop;
    if (alto < 40) alto = 40;
    var x1 = izq - 14;
    var x2 = der + 14;

    // EL MARCO. Es un rectángulo con borde, que es la forma del
    // fragmento combinado, y no una etiqueta suelta al lado.
    var tam = "l=" + x1 + ";r=" + x2 + ";t=" + yTop + ";b=" + (yTop + alto) + ";";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(tam, "Shape"); } catch (e) { o = null; }
    if (o == null) {
        try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e2) { o = null; }
    }
    if (o == null) return false;
    try { o.BackGroundColor = 251658239; } catch (e) { }
    try { o.BorderStyle = 1; } catch (e) { }
    try { o.BorderColor = 8421504; } catch (e) { }
    try { o.ManuallySized = true; } catch (e) { }
    try { o.Left = x1; } catch (e) { }
    try { o.Right = x2; } catch (e) { }
    try { o.Top = 0 - yTop; } catch (e) { }
    try { o.Bottom = 0 - (yTop + alto); } catch (e) { }
    try { o.Update(); } catch (e) { }

        // LA PESTAÑA, arriba a la izquierda, DENTRO del marco. Y lleva
    // TRES lineas: el tipo del fragmento, sobre QUE lifeline esta,
    // y la condicion entre corchetes.   Lo segundo es lo que
    // faltaba: un loop sin saber de quien es, no dice nada.
    var pos = String(nombre).indexOf("[");
    var tipo = String(nombre);
    var condicion = "";
    if (pos > 0) {
        tipo = String(nombre).substring(0, pos);
        condicion = String(nombre).substring(pos);
    }
    var sobre = lifelineEnX(izq);
    var tab = "l=" + x1 + ";r=" + (x1 + 300) + ";t=" + yTop + ";b=" + (yTop + 36) + ";";
    var ot = null;
    try { ot = diag.DiagramObjects.AddNew(tab, "Text"); } catch (e) { ot = null; }
    if (ot != null) {
        var txt = tipo + "\nsobre: " + sobre + "\n" + condicion;
        try { ot.Text = txt; } catch (e) { }
        try { ot.FontSize = 9; } catch (e) { }
        try { ot.BorderStyle = 1; } catch (e) { }
        try { ot.BorderColor = 8421504; } catch (e) { }
        try { ot.BackGroundColor = 216543242; } catch (e) { }
        try { ot.Left = x1; } catch (e) { }
        try { ot.Right = x1 + 300; } catch (e) { }
        try { ot.Top = 0 - yTop; } catch (e) { }
        try { ot.Bottom = 0 - (yTop + 36); } catch (e) { }
        ot.Update();
    }

    // Y LA LINEA PUNTEADA, que es lo que separa las dos ramas de un
    // alt y lo que no tiene un loop. Se dibuja en la mitad del alto.
    if (String(nombre).indexOf("/") > 0) {
        var ym = yTop + Math.round(alto / 2);
        var lp = "l=" + x1 + ";r=" + (x1 + 40) + ";t=" + ym + ";b=" + (ym + 3) + ";";
        var ol = null;
        try { ol = diag.DiagramObjects.AddNew(lp, "Shape"); } catch (e) { ol = null; }
        if (ol != null) {
            try { ol.BackGroundColor = 8421504; } catch (e) { }
            try { ol.BorderStyle = 0; } catch (e) { }
            try { ol.ManuallySized = true; } catch (e) { }
            try { ol.Left = x1; } catch (e) { }
            try { ol.Right = x1 + 40; } catch (e) { }
            try { ol.Top = 0 - ym; } catch (e) { }
            try { ol.Bottom = 0 - (ym + 3); } catch (e) { }
            ol.Update();
        }
    }

    MARCOS_PUESTOS++;
    return true;
}

function activacion(diag, xLinea, yTop, yBottom) {
    var alto = yBottom - yTop;
    if (alto < 20) alto = 20;
    var x1 = xLinea - (ANCHO_ACTIVACION / 2);
    var tam = "l=" + x1 + ";r=" + (x1 + ANCHO_ACTIVACION) + ";t=" + yTop + ";b=" + (yTop + alto) + ";";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(tam, "Shape"); } catch (e) { o = null; }
    if (o == null) {
        try { o = diag.DiagramObjects.AddNew(tam, ""); } catch (e2) { o = null; }
    }
    if (o == null) return false;
    try { o.BackGroundColor = 4210752; } catch (e) { }
    try { o.BorderStyle = 0; } catch (e) { }
    try { o.ManuallySized = true; } catch (e) { }
    try { o.Left = x1; } catch (e) { }
    try { o.Right = x1 + ANCHO_ACTIVACION; } catch (e) { }
    try { o.Top = 0 - yTop; } catch (e) { }
    try { o.Bottom = 0 - (yTop + alto); } catch (e) { }
    try { o.Update(); } catch (e) { }
    BARRAS_PUESTAS++;
    return true;
}

// Los tres operandos que hay de verdad en este caso, mas dos barras sobre
// la linea de vida del servicio, que es la unica que ejecuta codigo.
function colocarFragmentos(diag) {
    var xS = xDe(indiceDe("S"));
    var xH2 = xDe(indiceDe("H2"));
    var xC = xDe(indiceDe("C"));
    var xD = xDe(indiceDe("D"));

    // loop sobre las nueve validaciones del servidor, mensajes 10 a 14.
    fragmento(diag, "loop [validar los 7 campos del DTO]", xH2, xS, Y_MSG0 + 9 * PASO_MSG - 34, Y_MSG0 + 13 * PASO_MSG + 16);

    // alt de la ciudad, mensajes 15 y 16.
    fragmento(diag, "alt [la ciudad existe y esta Activa]", xD, xS, Y_MSG0 + 14 * PASO_MSG - 34, Y_MSG0 + 15 * PASO_MSG + 16);

    // alt del duplicado, mensajes 17 a 19.
    fragmento(diag, "alt [el NIT ya esta registrado]", xD, xS, Y_MSG0 + 16 * PASO_MSG - 34, Y_MSG0 + 18 * PASO_MSG + 16);

    // Dos barras de activacion: la del controlador y la del servicio.
    activacion(diag, xC, Y_MSG0 + 6 * PASO_MSG - 26, Y_MSG0 + 25 * PASO_MSG + 12);
    activacion(diag, xS, Y_MSG0 + 7 * PASO_MSG - 26, Y_MSG0 + 24 * PASO_MSG + 12);
}

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 700) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU14  Registrar Proveedor"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 700) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseno de caso de uso, seccion 3.3.2.1.  10 lineas de vida, 45 mensajes, 8 hallazgos, 3 fragmentos y 2 barras de activacion."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja. Y las barras estrechas sobre el controlador y el servicio son las activaciones, que se dibujan a mano porque EA no las coloca por script. Los tres recuadros claros son los fragmentos: un loop sobre las nueve validaciones y dos alt, en la ciudad y en el duplicado. Lo que no se ve en el diagrama es el hallazgo 1: de las ocho columnas del INSERT, cuatro no existen en la tabla."; } catch (e) { }
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
// LOS 44 MENSAJES
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
    N.push("CU14  Registrar Proveedor.  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Administrador     «actor»     quien da de alta");
    N.push("    AdminProveedores.tsx     «boundary»  pages/admin/AdminProveedores.tsx, 711 lineas");
    N.push("    api.ts                  «boundary»  lib/api.ts, L1493-1520");
    N.push("    JwtAuthGuard            «control»   dependencias.ts, L15-65");
    N.push("    ValidationPipe          «control»   main.ts, L22-43, siete campos");
    N.push("    CTR_Proveedores         «control»   L55-93, en /proveedores y NO en /admin");
    N.push("    SRV_ProveedoresService  «control»   L157-244, 89 lineas para el alta");
    N.push("    las nueve validaciones  «control»   L164-191, el loop del servidor");
    N.push("    SRV_BitacoraService     «control»   registrar(), la segunda escritura");
    N.push("    PostgreSQL              «entity»    proveedores, bitacora_auditoria y ciudades");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes: 11 van a la base de datos, 17 son mensajes a si mismo, 4 van al loop de");
    N.push("  validaciones y 10 son retornos. 10 llevan la guarda escrita entre corchetes, y aparecen 4 codigos");
    N.push("  HTTP mas el 42703 de Postgres.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("LOS FRAGMENTOS Y LAS BARRAS, Y CUANTOS HAN QUEDADO");
    N.push("");
    N.push("  Este diagrama lleva 3 fragmentos y 2 barras de activacion:");
    N.push("");
    N.push("    loop [validar los 7 campos del DTO]   sobre los mensajes 10 a 14");
    N.push("    alt  [la ciudad existe y esta Activa]  sobre los mensajes 15 y 16");
    N.push("    alt  [el NIT ya esta registrado]       sobre los mensajes 17 a 19");
    N.push("    barra de activacion del controlador    de la y " + (Y_MSG0 + 6 * PASO_MSG - 26) + " a la " + (Y_MSG0 + 25 * PASO_MSG + 12));
    N.push("    barra de activacion del servicio       de la y " + (Y_MSG0 + 7 * PASO_MSG - 26) + " a la " + (Y_MSG0 + 24 * PASO_MSG + 12));
    N.push("");
    N.push("  CUANTOS HAN SIDO COLOCADOS: " + MARCOS_PUESTOS + " de 3 marcos, y " + BARRAS_PUESTAS + " de 2 barras.");
    N.push("");
    N.push("  ESTO ES LO QUE TIENES QUE MIRAR. EA no coloca fragmentos de forma fiable por");
    N.push("  script. Lo que hay aqui son FORMAS dibujadas con AddNew, con su etiqueta al lado,");
    N.push("  que es la unica via que se puede forzar desde JScript. Si el numero de arriba es 3");
    N.push("  y 2, se ven como recuadros claros y barras estrechas. Si es 0, no se han colocado y");
    N.push("  habra que hacerlos a mano en la pestana de la derecha del diagrama.");
    N.push("");
    N.push("EL HALLAZGO 1: CUATRO DE LAS OCHO COLUMNAS DEL INSERT NO EXISTEN");
    N.push("");
    N.push("  LA TABLA, schema.sql L197-209, 11 columnas:");
    N.push("    id_proveedor, nombre_empresa, persona_contacto, telefono, email, direccion,");
    N.push("    observaciones, tiempo_entrega_dias, estado_riesgo, calidad_score, fecha_registro");
    N.push("");
    N.push("  EL INSERT, L220-222, 8 columnas:");
    N.push("    nombre_empresa, nit_ruc, telefono, email, id_ciudad, direccion,");
    N.push("    condiciones_comerciales, estado");
    N.push("");
    N.push("  LAS 4 QUE NO EXISTEN: nit_ruc, id_ciudad, condiciones_comerciales y estado. La que");
    N.push("  guarda el estado se llama estado_riesgo, L206, y el mismo fichero la usa bien en L285.");
    N.push("");
    N.push("  Y LAS 4 QUE EXISTEN Y NO USA: persona_contacto, observaciones, tiempo_entrega_dias y");
    N.push("  estado_riesgo. tiempo_entrega_dias es el plazo de entrega, con DEFAULT 15, del que");
    N.push("  dependen las ordenes de compra, y no hay forma de introducirlo.");
    N.push("");
    N.push("  Ademas, el primer fallo no es el INSERT: la consulta de duplicados de L208 hace WHERE");
    N.push("  nit_ruc = $1, que tambien falla. O sea que registrar un proveedor da 500 en el SELECT");
    N.push("  de duplicados, sin haber llegado a escribir nada.");
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  De las 8 columnas del INSERT, 4 no existen: nit_ruc, id_ciudad, condiciones_");
    N.push("     comerciales y estado. Y 4 que si existen no se usan, entre ellas tiempo_entrega_dias,");
    N.push("     que es el plazo de entrega de las ordenes de compra. Es la cuarta vez que salen");
    N.push("     columnas que faltan, y la primera con cuatro de golpe.");
    N.push("  2  La tabla no tiene columna de documento fiscal. El NIT existe para clientes,");
    N.push("     nit_cliente, pero no para proveedores. Y el DTO lo pide como obligatorio, asi que");
    N.push("     el formulario exige un dato que el sistema no sabe guardar. El regex de L16 acepta");
    N.push("     de 6 a 10 digitos, sin digito verificador.");
    N.push("  3  El control de duplicados busca nit_ruc, que no es la clave. Las unicas UNIQUE son");
    N.push("     nombre_empresa y email, y no se comprueba ninguna de las dos. El 409 de L212 es");
    N.push("     inalcanzable, y el 23505 de Postgres tampoco se captura, como si si hiciera CU10.");
    N.push("  4  De las cinco apariciones del estado, cuatro usan estado_riesgo bien y solo el");
    N.push("     INSERT usa estado. Y el estado de un proveedor es de riesgo, con tres valores y un");
    N.push("     menu de transiciones en el frontend, no un alta y baja como el de usuarios.");
    N.push("  5  El listado tambien falla: L119-122 pide nit_ruc, id_ciudad y condiciones_");
    N.push("     comerciales. La pantalla esta doblemente muerta, no se crea ni se lista. Y el");
    N.push("     cliente valida el NIT con el mismo regex antes de enviar, o sea que el boton se");
    N.push("     habilita y el error vuelve sin cuerpo.");
    N.push("  6  El servidor repite 9 validaciones y 2 son codigo muerto, porque el pipe ya las");
    N.push("     hacia. Las otras 7 si aportan y los limites CUADRAN con las columnas: 3-150,");
    N.push("     1-30 y 120. El unico caso de los catorce en que eso pasa bien.");
    N.push("  7  El permiso no usa el getter, tercera vez en catorce casos y las tres en el");
    N.push("     mismo modulo. Y hay dos funciones de permiso, una para CU14 y otra para CU20.");
    N.push("     Y segun el seed, este caso solo lo abre el Administrador con el asterisco.");
    N.push("  8  Lo que si esta bien: ESTADOS_VALIDOS, L18, es una lista blanca de verdad, que es lo");
    N.push("     que CU09 no hacia. Y detalleEstado, L302-311, es un switch con default. Y la");
    N.push("     bitacora de cambiarEstado pasa el estado real, no un literal.");
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  Los hallazgos 1, 2 y 5 son la cuarta vez que aparecen columnas que faltan. La cuenta:");
    N.push("");
    N.push("    CU09  ciudades.departamento          1 columna, bloquea 4 operaciones");
    N.push("    CU10  productos.porcentaje_iva      1 columna, bloquea el alta y el listado");
    N.push("    CU11  tallas.talla_europea           1 columna, mas categorias.porcentaje_iva_default");
    N.push("    CU12  productos.porcentaje_iva      otra vez, y ahora la tienda no tiene precio");
    N.push("    CU14  proveedores.nit_ruc           4 columnas de golpe, en el mismo INSERT");
    N.push("");
    N.push("  O sea que CU14 es el caso donde mas se acumulan, y es el primero donde el error no es");
    N.push("  una columna suelta sino cuatro, con sus cuatro equivalentes reales sin usar. Alguien");
    N.push("  leyo el servicio y no el esquema. Y por eso los limites de longitud si cuadran, que es");
    N.push("  la senal de que se leyo una de las dos cosas y no la otra.");
    N.push("");
    N.push("  Y el hallazgo 6 es la respuesta a CU05 y CU11, donde el MaxLength no coincidia con la");
    N.push("  columna. Aqui coincide en las tres que existen. El autor aprendio, y lo que no hizo");
    N.push("  fueactualizar el esquema para que las otras cuatro existieran.");
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
    N.push("    MARCOS alt y loop colocados: " + MARCOS_PUESTOS + " de 3");
    N.push("    BARRAS de activacion colocadas: " + BARRAS_PUESTAS + " de 2");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU14 Secuencia", 0); } catch (e) { }
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

    // Los fragmentos y las barras van DESPUES de los mensajes, porque
    // necesitan las coordenadas en Y que ya estan escritas.
    if (MARCOS_PUESTOS == 0 && BARRAS_PUESTAS == 0) colocarFragmentos(diag);
    diag = guardarYRecargar(diag);

    var ch = comprobar(diag);
    INFORME.push("objetos: " + ch.leidos + ", colocados: " + ch.bien);
    INFORME.push("primeras coordenadas: " + ch.muestra);

    notasDelDiagrama(diag, r, h2, ch);

    var T = [];
    T.push("CU14 - DIAGRAMA DE SECUENCIA - INFORME");
    T.push("");
    T.push("Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB);
    T.push("Tipo de diagrama: " + tipoUsado);
    T.push("Mensajes: " + r.puestos + " de " + TOTAL_MSG);
    T.push("Mensajes a si mismo: " + r.autodestino);
    T.push("Conectores en el diagrama: " + r.enDiagrama);
    T.push("Hallazgos: " + h2.total + " de " + TOTAL_HAL + ", banda hasta la y " + h2.fin);
    T.push("");
    T.push("MARCOS Y BARRAS  <-- MIRA ESTO");
    T.push("Fragmentos alt y loop colocados: " + MARCOS_PUESTOS + " de 3");
    T.push("Barras de activacion colocadas:   " + BARRAS_PUESTAS + " de 2");
    if (MARCOS_PUESTOS < 3 || BARRAS_PUESTAS < 2) {
        T.push("  Si alguno sale a 0, EA no ha aceptado la forma y hay que");
        T.push("  dibujarlo a mano en el diagrama.");
    } else {
        T.push("  Los 5 han salido. Son FORMAS dibujadas por script, no");
        T.push("  fragmentos nativos de EA, asi que si al abrirlos se ven");
        T.push("  como rectangulos con etiqueta, es lo esperado.");
    }
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
    msg = msg + "CU14 - Registrar Proveedor" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "MARCOS: " + MARCOS_PUESTOS + " de 3 (1 loop y 2 alt)." + SALTO;
    msg = msg + "BARRAS DE ACTIVACION: " + BARRAS_PUESTAS + " de 2." + SALTO;
    if (MARCOS_PUESTOS < 3 || BARRAS_PUESTAS < 2) msg = msg + "  Si falta alguno, hay que dibujarlo a mano." + SALTO;
    msg = msg + SALTO;
    msg = msg + "CUATRO DE LAS OCHO COLUMNAS DEL INSERT NO EXISTEN:" + SALTO;
    msg = msg + "nit_ruc, id_ciudad, condiciones_comerciales y estado." + SALTO;
    msg = msg + "Y no hay columna de documento fiscal en la tabla." + SALTO + SALTO;
    msg = msg + "Lo bueno: los limites de longitud SI cuadran con" + SALTO;
    msg = msg + "las columnas, y ESTADOS_VALIDOS es una lista blanca." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU14 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU14 Secuencia", 0); } catch (e3) { }
}
