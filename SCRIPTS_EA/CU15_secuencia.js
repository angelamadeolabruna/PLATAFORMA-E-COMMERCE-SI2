// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU15  Inhabilitar/Bloquear Proveedor (Estado de Riesgo)
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/admin/AdminProveedores.tsx        711 lineas
//     web/src/lib/api.ts                            L1507-1515
//     api/src/main.ts                               L22-43 ValidationPipe
//     api/src/modulos/seguridad/dependencias.ts     L15-65 JwtAuthGuard
//     api/src/modulos/proveedores/CTR_Proveedores.ts L84-92
//     api/src/modulos/proveedores/SRV_ProveedoresService.ts L246-300
//     api/src/modulos/compras/SRV_ComprasService.ts L336-355, el consumidor
//     api/src/modulos/seguridad/SRV_BitacoraService.ts L14-39
//     BASE DE DATOS/schema.sql                      L197-209
//
//   Cada mensaje lleva la linea del fichero de la que sale.
//
// QUE HACE ESTE CASO, Y POR QUE ES EL MAS LIMPIO DE LOS QUINCE
//   Es el caso mas corto del proyecto: 55 lineas de servicio, L246-300, y
//   tres consultas. Y es el primero que hace las cosas bien.
//
//   - ESTADOS_VALIDOS, L18, es una lista blanca de verdad, y L255 la
//     comprueba con includes. CU09 L396 hacia lo contrario: convertia
//     cualquier cadena en Inactiva sin mirar. Aqui no.
//   - La regla de negocio de bloquear esta escrita, y es buena. L271-282
//     mira si el proveedor tiene ordenes de compra pendientes y da un
//     mensaje accionable: 'Procese o anule antes de bloquear.'
//   - La maquina de estados del frontend, L269-282, es completa: los
//     tres estados con las dos transiciones de cada uno, las 6
//     direcciones. Y CONSECUENCIAS, L284-288, explica que pasa.
//
//   Y el resto son dos huecos que se ven por el contraste con CU14.
//
//   38 mensajes. 10 lineas de vida. 7 van a la base de datos, 14 son
//   mensajes a si mismo y 7 son retornos.
//   7 guardas escritas entre corchetes y 5 codigos: 200, 403, 404, 409 y 422.
//
// LOS FRAGMENTOS: UNO, Y ES REAL
//   Este caso tiene UN alt y NINGUN loop, y lo he contado antes de
//   escribir, no al reves:
//
//     en L246-L300   for 0, while 0, Promise.all 0
//     y cuatro if, de los que solo uno es una rama de verdad
//
//   El unico es L271:
//
//     if (nuevo === 'Bloqueado' && viejo !== 'Bloqueado') { ... }
//
//   Que tiene dos caminos: Bloqueado y no estaba Bloqueado, o cualquier
//   otro caso. Y dentro del primero hay una segunda decision, L277, que
//   tambien es de dos. O sea que el alt es de dos operandos, y el
//   segundo tiene un condicional dentro. Eso es un alt de verdad y es el
//   unico que se dibuja.
//
//   El switch de detalleEstado, L303-310, NO se dibuja como fragmento: es
//   una funcion pura que traduce un estado a una frase, sin control de
//   flujo del caso de uso. Y OPCIONES_POR_ESTADO, L269-282, es una tabla
//   de datos del frontend, tampoco es control de flujo.
//
//   Y las barras de activacion, que son parte de la notacion y no un
//   extra: dos, la del controlador y la del servicio.
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
var PAQ_NOMBRE = "CU15 Secuencia Estado de Riesgo Proveedor";
var DIAG_NOMBRE = "CU15 Inhabilitar Bloquear Proveedor";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 112;

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
    ["U", "ACTOR_Administrador", "Actor", "Lifeline", "Administrador", "quien cambia el estado", "Actor, no clase: es quien pulsa", "no es codigo, es la persona"],
    ["F", "AdminProveedores.tsx", "Object", "Lifeline", "AdminProveedores", "el menu de riesgo", "Boundary", "web/src/pages/admin/AdminProveedores.tsx, 711 lineas"],
    ["H", "api.ts", "Object", "Lifeline", "api", "cliente HTTP", "Boundary", "web/src/lib/api.ts, L1507-1515"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["P", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "un solo campo", "Control", "api/src/main.ts, L22-43, es global"],
    ["C", "CTR_Proveedores", "Object", "Lifeline", "ProveedoresController", "PATCH :id/estado", "Control", "api/src/modulos/proveedores/CTR_Proveedores.ts, L84-92"],
    ["S", "SRV_ProveedoresService", "Object", "Lifeline", "ProveedoresService", "55 lineas", "Control", "api/src/modulos/proveedores/SRV_ProveedoresService.ts, L246-300"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar()", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["X", "SRV_ComprasService", "Object", "Lifeline", "ComprasService", "el que SI lee el estado", "Control", "api/src/modulos/compras/SRV_ComprasService.ts, L336-355, CU15 de las ordenes"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "2 tablas y 2 escrituras", "Entity", "schema.sql: proveedores L197-209, ordenes_compra y bitacora_auditoria"]
];

// Los 38 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [
    [1, "U", "F", "1. abre el menu de estado de riesgo de un proveedor   AdminProveedores.tsx, 711 lineas", "S"],
    [2, "F", "F", "2. el menu sale de OPCIONES_POR_ESTADO, L269-282, que da las 2 transiciones de cada uno de los 3 estados: las 6 direcciones, completas   Y L386 lo lee con el ?? []", "S"],
    [3, "F", "F", "3. el modal, L290-378, explica la consecuencia con CONSECUENCIAS, L284-288: 'Al bloquear no se podran crear nuevas ordenes de compra con este proveedor.'", "S"],
    [4, "F", "H", "4. PATCH /api/v1/proveedores/:id/estado con { estado: 'Bloqueado' }   api.ts L1507", "S"],
    [5, "H", "G", "5. PATCH con Authorization Bearer y credentials:'include'", "S"],
    [6, "G", "D", "6. SELECT usuarios WHERE id_usuario = :sub   L44.   Una consulta por peticion, en el guard", "S"],
    [7, "G", "G", "7. [estado != 'activo'] 401 'Tu cuenta esta deshabilitada.'   L49-51", "S"],
    [8, "G", "P", "8. el guard no toca el cuerpo.   El pipe ve un solo campo   CTR_Proveedores L49-56", "S"],
    [9, "P", "C", "9. CambiarEstadoRequest: @IsString y @IsNotEmpty en estado   L49-53.   No hay enum, no hay MaxLength y no hay @IsIn", "S"],
    [10, "C", "S", "10. cambiarEstado( currentUser, id, body.estado, request )   L85", "S"],
    [11, "S", "D", "11. SELECT r.permisos_json FROM usuarios JOIN usuarios_roles JOIN roles WHERE u.id_usuario = $1   L71-79.   SIN getter, cuarta vez en quince casos", "S"],
    [12, "S", "S", "12. [sin '*' ni 'gestionar_proveedores'] 403 'No tienes permiso para gestionar proveedores.'   L83-89", "S"],
    [13, "S", "S", "13. y aqui esta lo mejor del caso: el estado se contrasta contra una lista blanca.   ESTADOS_VALIDOS, L18, con includes   L255", "S"],
    [14, "S", "S", "14. [el estado no es Activo, ni Inactivo, ni Bloqueado] 422 'Estado de proveedor no valido.'   L255-257.   Un 422, no un 500", "S"],
    [15, "S", "D", "15. SELECT id_proveedor, nombre_empresa, estado_riesgo FROM proveedores WHERE id_proveedor = $1   L261.   Consulta 1 de 3.   Aqui si coincide con el esquema", "S"],
    [16, "S", "S", "16. [no existe] 404 'Proveedor no encontrado.'   L265-267", "S"],
    [17, "S", "S", "17. y aqui empieza el ALT.   viejo = String(fila.estado_riesgo)   L269, y la condicion de L271: nuevo === 'Bloqueado' AND viejo !== 'Bloqueado'", "S"],
    [18, "S", "D", "18. rama 1 del alt: el proveedor pasa a Bloqueado y no lo estaba.   SELECT COUNT(*) FROM ordenes_compra WHERE id_proveedor = $1 AND LOWER(estado) NOT IN ('procesada', 'recibida', 'anulada', 'cancelada')   L272-276.   Consulta 2 de 3", "S"],
    [19, "S", "S", "19. [hay ordenes pendientes] 409 'El proveedor tiene ordenes de compra pendientes. Procese o anule antes de bloquear.'   L277-281.   El mensaje dice que hacer", "S"],
    [20, "S", "S", "20. rama 2 del alt: cualquier otro caso, y no se consulta nada.   O sea que pasar a Inactivo no comprueba NADA, ni una sola vez", "S"],
    [21, "S", "D", "21. UPDATE proveedores SET estado_riesgo = $2 WHERE id_proveedor = $1   L285.   Consulta 3 de 3.   Escritura 1 de 2.   Sin AND del estado viejo, o sea que no es idempotente", "S"],
    [22, "S", "B", "22. bitacora('UPDATE', 'proveedores', 'Proveedor bloqueado: ...', usuario, request, id, { nombre, estado: el viejo }, { nombre, estado: el nuevo })   L288-297.   oldData REAL, leido de la fila de L261", "S"],
    [23, "B", "D", "23. INSERT INTO bitacora_auditoria con old_data y new_data   L27-38.   La 2 de 2.   Sin transaccion con la 1", "A"],
    [24, "S", "C", "24. { detail: detalleEstado(nuevo) }, que con el switch de L303-310 devuelve uno de tres: bloqueado, deshabilitado o activado   L299", "A"],
    [25, "C", "H", "25. el JSON con el detalle   api.ts L1507-1515", "A"],
    [26, "H", "F", "26. Toast con el detalle, y recarga de la lista   L528", "A"],
    [27, "F", "F", "27. el menu se vuelve a construir con las transiciones del estado nuevo   L386.   O sea que el menu depende de la respuesta del servidor, no de un estado local", "S"],
    [28, "F", "U", "28. el administrador ve el nuevo estado de riesgo.   Y el menu ya no ofrece las transiciones que acaba de usar   A", "A"],
    [29, "U", "F", "29. ahora alguien compra.   Esta parte no la dibuja este caso, pero es donde el estado se usa de verdad   CU15 de ordenes de compra", "S"],
    [30, "F", "H", "30. POST /api/v1/compras   otro caso de uso, y el unico sitio del proyecto donde estado_riesgo se lee   SRV_ComprasService", "S"],
    [31, "H", "X", "31. validarEncabezado( dto )   SRV_ComprasService L336-355.   SELECT id_proveedor, nombre_empresa, estado_riesgo   L341", "S"],
    [32, "X", "D", "32. SELECT id_proveedor, nombre_empresa, estado_riesgo FROM proveedores WHERE id_proveedor = $1   L341.   La 4a lectura de estado_riesgo en todo el proyecto", "S"],
    [33, "X", "X", "33. y aqui esta el hallazgo 2: if (estadoProveedor.toLowerCase() !== 'activo')   L349.   Tres estados se convierten en una comparacion con un solo valor", "S"],
    [34, "X", "X", "34. asi que Bloqueado e Inactivo son lo mismo para el comprador.   El mensaje distingue los dos casos, L351-353, pero la condicion no   L349", "S"],
    [35, "X", "C", "35. [no es Activo] 409 con un mensaje especifico para bloqueado y otro generico para el resto   L350-354", "S"],
    [36, "C", "F", "36. Toast de error.   Y aqui se ve el problema: el proveedor Inactivo dio el mensaje generico, y el Bloqueado dio el especifico.   Los dos seolkaron en el mismo 409   A", "A"],
    [37, "F", "F", "37. y el menu, L284-288, decia las dos cosas: 'no podra usarse en nuevas ordenes' y 'no se podran crear nuevas ordenes'.   Las dos son la misma frase   S", "S"],
    [38, "F", "U", "38. el administrador cree que hay tres estados distintos.   Y en el unico sitio donde importa, hay uno solo   A", "A"]
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. La maquina de estados solo existe en el cliente", [
        "El hallazgo mas importante de este caso, y es de los que se ven",
        "comparando el frontend con el backend.",
        "",
        "LA MAQUINA, en el frontend, L269-282:",
        "",
        "  const OPCIONES_POR_ESTADO = {",
        "    Activo:    [ Deshabilitar->Inactivo, Bloquear->Bloqueado ],",
        "    Inactivo:  [ Activar->Activo,      Bloquear->Bloqueado ],",
        "    Bloqueado: [ Activar->Activo,      Deshabilitar->Inactivo ],",
        "  };",
        "",
        "O sea que 3 estados y 6 transiciones, todas las direcciones",
        "posibles. Esta completo. Y el menu se dibuja con esto, L386.",
        "",
        "EL BACKEND, en cambio, L254-257:",
        "",
        "  const nuevo = estado.trim();",
        "  if (!(ESTADOS_VALIDOS as readonly string[]).includes(nuevo))",
        "    throw new UnprocessableEntityException(",
        "      'Estado de proveedor no valido.');",
        "",
        "O sea que lo unico que se comprueba es que el estado DESTINO sea",
        "uno de los tres. En ningun sitio se mira de donde se viene.",
        "",
        "CONSECUENCIA: la maquina de estados es cosmetica. Un PATCH a mano",
        "con cualquier par de los nueve posibles funciona, incluidos los",
        "tres que la maquina no ofrece. Y el propio menu, que parece",
        "correcto, es la unicaBarrier que hay.",
        "",
        "Y OJO con lo que dice el dialogo, L323:",
        "  'Estado de riesgo del proveedor'",
        "El nombre 'estado de riesgo' sugiere un umbral, un nivel, algo",
        "medible. Y lo que hay son tres cadenas de texto sin relacion entre",
        "ellas. No hay puntuacion, no hay nivel, no hay nada. La palabra",
        "riesgo esta en el nombre de la columna y del modal, y en nada mas."
    ]],
    ["2. Los tres estados valen lo mismo en el unico sitio donde se usan", [
        "estado_riesgo se lee en cinco sitios de todo el proyecto, y",
        "cuatro de ellos son esta pantalla o su servicio. El quinto es",
        "donde de verdad se decide algo.",
        "",
        "EL UNICO CONSUMIDOR, SRV_ComprasService L336-355:",
        "",
        "  const estadoProveedor = String(proveedor.estado_riesgo ?? '');",
        "  if (estadoProveedor.toLowerCase() !== 'activo') {",
        "    const detalle =",
        "      estadoProveedor.toLowerCase() === 'bloqueado'",
        "        ? 'No se puede crear una orden con un proveedor bloqueado.'",
        "        : `No se puede crear una orden con un proveedor",
        "          ${estadoProveedor.toLowerCase()}.`;",
        "    throw new ConflictException(",
        "      `${detalle} Estado actual: ${estadoProveedor}.`);",
        "  }",
        "",
        "O sea que hay UNA COMPARACION con un solo valor. Activo pasa,",
        "todo lo demas no.",
        "",
        "Asi que Bloqueado e Inactivo son INDISTINGUIBLES para el",
        "comprador. Los dos impiden crear una orden. Los dos dicen lo",
        "mismo, con un matiz de redaccion en el mensaje y nada mas.",
        "",
        "Y el unico sitio donde Bloqueado significa algo mas es la",
        "comprobacion de ordenes pendientes, L271-282, de este mismo caso.",
        "O sea que la diferencia entre Bloqueado e Inactivo esta en un",
        "guard de entrada y en nada mas.",
        "",
        "O sea que los tres estados, las seis transiciones, el menu, el",
        "modal, las CONSECUENCIAS y el switch de detalleEstado son seis",
        "capas de interfaz sobre un bit. Y el bit esta bien puesto, que",
        "es lo importante: nadie puede comprar a un proveedor bloqueado."
    ]],
    ["3. Se puede rodear el bloqueo pasando antes por Inactivo", [
        "El hallazgo de logica, y es el mas fino de este caso.",
        "",
        "LA REGLA, L271-282:",
        "",
        "  if (nuevo === 'Bloqueado' && viejo !== 'Bloqueado') {",
        "    SELECT COUNT(*) FROM ordenes_compra",
        "      WHERE id_proveedor = $1",
        "        AND LOWER(estado) NOT IN ('procesada', 'recibida',",
        "                                  'anulada', 'cancelada')",
        "    if (n > 0) throw new ConflictException(",
        "      'El proveedor tiene ordenes de compra pendientes.",
        "       Procese o anule antes de bloquear.');",
        "  }",
        "",
        "LA REGLA QUE NO EXISTE: no hay nada equivalente para Inactivo.",
        "Pasar un proveedor con ordenes pendientes a Inactivo no consulta",
        "nada. No hay un solo if sobre nuevo === 'Inactivo' en el fichero.",
        "",
        "Y QUE DICE EL MENU, L284-288:",
        "",
        "  Bloqueado: 'Al bloquear no se podran crear nuevas ordenes",
        "              de compra con este proveedor.'",
        "  Inactivo:   'El proveedor quedará inhabilitado y no podrá",
        "              usarse en nuevas ordenes de compra.'",
        "",
        "LAS DOS FRASES SON LO MISMO. Una en futuro y otra en presente, y",
        "las dos significan que no se puede comprar. O sea que el menu",
        "distingue dos estados que se comportan igual.",
        "",
        "Y LA CONSECUENCIA, que es el agujero:",
        "",
        "  1. un proveedor tiene 3 ordenes de compra sin procesar",
        "  2. el admin pulsa Deshabilitar, que el menu SI ofrece, L271",
        "  3. pasa. Sin comprobar nada.",
        "  4. el proveedor queda Inactivo con 3 ordenes sin procesar",
        "  5. el admin pulsa Bloquear, que el menu ya no ofrece desde",
        "     Inactivo...   pero un PATCH a mano si",
        "  6. y si lo pulsa, el guard de L271 lo para.",
        "",
        "O sea que el estado que la maquina llama Intermedio es el unico",
        "desde el que se puede esquivar el control. Y el menu lo ofrece en",
        "los dos sentidos, porque L274 ofrece Bloquear desde Inactivo.",
        "",
        "Lo que faltaria es un solo if mas: comprobar tambien cuando nuevo",
        "es Inactivo. O no mirar el destino y mirar el hecho de que el",
        "proveedor tiene ordenes sin cerrar."
    ]],
    ["4. Las dos escrituras van sueltas, y en un estado de riesgo eso duele", [
        "La misma falta de transaccion que CU06, CU07 y CU10, y aqui tiene",
        "mas gravedad por lo que se esta escribiendo.",
        "",
        "  L284  UPDATE proveedores SET estado_riesgo = $2",
        "  L288  INSERT INTO bitacora_auditoria, con old_data y new_data",
        "",
        "Cero queryRunner, cero transaction, cero BEGIN. En las 55 lineas",
        "de L246-L300, contadas.",
        "",
        "SI LA BITACORA FALLA, el estado de riesgo del proveedor ha",
        "cambiado y no hay rastro de quien lo cambio ni de cuando. Y esto",
        "no es el estado de un usuario, que se puede rehacer, es una",
        "decision comercial sobre con quien se compra.",
        "",
        "Y hay un detalle en el que este caso es MEJOR que CU06 y CU07:",
        "el old_data sale de la fila REAL. L295:",
        "",
        "  { nombre: fila.nombre_empresa, estado: viejo }",
        "",
        "con viejo tomado de L269, que es lo que traia el SELECT de L261.",
        "No es un literal afirmado como en CU06 L255 y CU07 L307. O sea",
        "que el registro de auditoria es de fiar, y por eso el hallazgo 5",
        "sigue siendo un problema de entrega y no de contenido.",
        "",
        "Y el mensaje de la bitacora, L291, es bueno:",
        "  Proveedor ${nuevo.toLowerCase()}: ${fila.nombre_empresa}",
        "O sea que dice el estado NUEVO y el nombre de la empresa, no el",
        "id. Se puede leer sin mirar nada mas. CU08, que es donde se leen",
        "estas filas, no devuelve la columna detalle. O sea que este",
        "detalle, que es lo unico legible, no se ve en la pantalla de",
        "auditoria."
    ]],
    ["5. El mensaje del 409 solo se ve en la compra, no en el cambio de estado", [
        "Un detalle de la comunicacion entre dos casos de uso, y es de",
        "los que solo se ven cruzando.",
        "",
        "EL ESTADO CAMBIADO, L299:",
        "",
        "  return { detail: this.detalleEstado(nuevo) };",
        "",
        "Y detalleEstado, L302-311, devuelve UNO DE TRES FRASES:",
        "",
        "  Bloqueado -> 'Proveedor bloqueado.'",
        "  Inactivo   -> 'Proveedor deshabilitado.'",
        "  default    -> 'Proveedor activado.'",
        "",
        "O sea que el cambio de estado SIEMPRE sale con exito, y con un",
        "mensaje afirmativo. Y esta bien que sea asi, porque mientras no",
        "haya ordenes pendientes el bloqueo es legitimo.",
        "",
        "PERO: el estado nuevo no viaja en la respuesta. Solo el texto ya",
        "traducido. O sea que el frontend no puede saber cual es el estado",
        "sin parsear la frase. Y no lo necesita, porque recarga la lista,",
        "L528, que ya lo trae de la base.",
        "",
        "Y AQUI ESTA EL AGUJERO: cuando el estado NO cambia en la base,",
        "porque el proveedor ya estaba Bloqueado y se vuelve a bloquear,",
        "el L285 hace el UPDATE igualmente, sin AND del estado viejo, y la",
        "bitacora de L288 registra un cambio que no ha habido, con",
        "old_data y new_data iguales. O sea que el registro de auditoria",
        "miente: dice que un proveedor paso de Bloqueado a Bloqueado.",
        "",
        "Y el caso mas claro: el endpoint NO es idempotente. Un doble",
        "click, o un reintento por fallo de red, genera dos filas de",
        "bitacora con el mismo contenido. CU06 y CU07 tienen lo mismo, pero",
        "aqui el estado es un valor de riesgo y el registro se consulta",
        "en CU08."
    ]],
    ["6. El DTO no valida el estado, y la lista blanca esta a medias", [
        "El campo estado es el unico del caso, y el pipe no lo mira.",
        "",
        "LO QUE HACE EL PIPE, CambiarEstadoRequest L49-53:",
        "",
        "  @IsString()",
        "  @IsNotEmpty({ message: 'El estado es obligatorio.' })",
        "  estado!: string;",
        "",
        "O sea que dos reglas, y las dos de forma. No hay @IsIn, que es",
        "el decorador de class-validator exactamente para esto, y que",
        "acepta un array de valores validos.",
        "",
        "LO QUE HACE EL SERVICIO, L254-257:",
        "",
        "  const nuevo = estado.trim();",
        "  if (!(ESTADOS_VALIDOS as readonly string[]).includes(nuevo))",
        "    throw new UnprocessableEntityException(...);",
        "",
        "ASI QUE: la lista blanca existe y es correcta, pero esta",
        "escrita a mano en el servicio, en vez de estar en el DTO.",
        "",
        "Lo que pasa es que el 422 del estado invalido sale con el texto",
        "del servicio, no con los mensajes del pipe, que serian un array.",
        "O sea que este endpoint devuelve el 422 con una cadena suelta, y",
        "los que tienen DTO lo devuelven con un array. CU08, que tambien",
        "tiene exceptionFactory, devuelve el array. Inconsistencia entre",
        "endpoints del mismo proyecto.",
        "",
        "Y el trim de L254 es una buena defensa: si mandas ' Bloqueado'",
        "con espacios, lo acepta. Sin ese trim, el includes fallaria y",
        "daria 422 por un espacio. CU09 L396 no hacia trim, y por eso",
        "cualquier cosa que no fuera exactamente 'Activa' caia en",
        "Inactiva."
    ]],
    ["7. El consumidor esta duplicado, y con dos mensajes distintos", [
        "El estado_riesgo se lee en dos sitios del modulo de compras, con",
        "dos Implementaciones distintas de la misma regla.",
        "",
        "SITIO 1, L262-288, el selector de proveedores:",
        "",
        "  WHERE LOWER(p.estado_riesgo) = 'activo'",
        "  ...  estado: f.estado_riesgo as string,",
        "",
        "SITIO 2, L341-355, validarEncabezado, que es la comprobacion",
        "del POST:",
        "",
        "  const estadoProveedor = String(proveedor.estado_riesgo ?? '');",
        "  if (estadoProveedor.toLowerCase() !== 'activo') {",
        "    ... dos mensajes distintos segun sea bloqueado o no",
        "",
        "O sea que la misma regla en dos sitios, y con dos mensajes. El",
        "primero filtra en SQL y por eso no puede dar mensaje. El segundo",
        "comprueba en TypeScript y por eso da dos frases, L351-353.",
        "",
        "El primero devuelve la lista de proveedores disponibles, y ahi",
        "el usuario ve que un proveedor no aparece. El segundo devuelve",
        "un 409 con un texto. O sea que el mismo estado produce dos",
        "experiencias distintas: uno desaparece de una lista, y el otro",
        "falla con un mensaje si se llega a elegirlo de otra manera.",
        "",
        "Y ADEMAS: el primero consulta con LOWER, o sea que es",
        "insensible a mayusculas. El segundo tambien, con toLowerCase().",
        "Los dos bien. Pero la lista blanca de CU15, L18, y el default de",
        "la tabla, L206, son 'Activo' con mayuscula. O sea que el",
        "contraste de L255 es SENSIBLE a mayusculas, mientras que los dos",
        "consumidores son insensibles. Un estado escrito 'activo' en",
        "minuscula pasaria L255, haria que el servicio lo acepta como",
        "valido, y los dos consumidores lo tratarian como Activo. La",
        "incoherencia no rompe nada, pero hay tres criterios distintos."
    ]],
    ["8. Lo que si esta bien: la regla de bloqueo y la lista blanca", [
        "Es el unico caso de los quince con las dos cosas, y hay que",
        "decirlo porque es el patron.",
        "",
        "1. LA LISTA BLANCA, L18:",
        "",
        "   const ESTADOS_VALIDOS = ['Activo', 'Inactivo',",
        "     'Bloqueado'] as const;",
        "",
        "   Con el as const, que en TypeScript convierte el array en una",
        "   tupla de literales. O sea que el conjunto de estados validos",
        "   esta definido en un sitio, se comprueba con includes en L255, y",
        "   es el mismo conjunto que el que usa el menu del frontend, que",
        "   lo tiene escrito en OPCIONES_POR_ESTADO. Los dos sitios",
        "   coinciden, y no por casualidad sino porque son el mismo",
        "   dominio.",
        "",
        "   CU09 L396 hacia lo contrario:",
        "     const estadoNuevo = estado === 'Activa' ? 'Activa' :",
        "       'Inactiva';",
        "   O sea, cualquier cadena se convertia en Inactiva. Un",
        "   administrador que escribiera 'banana' en el PATCH deshabilitaba",
        "   la sucursal. Aqui eso no puede pasar, y da un 422 con un",
        "   mensaje claro.",
        "",
        "2. LA REGLA DE NEGOCIO, L271-282, que es la mejor del proyecto",
        "   en su clase:",
        "",
        "   - Mira las ordenes de compra PENDIENTES, y lo hace con una",
        "     lista de estados terminales, L274: NOT IN ('procesada',",
        "     'recibida', 'anulada', 'cancelada'). O sea que define",
        "     pendiente como lo que no es terminal, en vez de enumerar",
        "     los pendientes. Y si manana sale un estado nuevo de orden,",
        "     el pendiente es el nuevo por defecto. Es la manera correcta",
        "     de escribir esa consulta.",
        "   - Y el mensaje es accionable: 'Procese o anule antes de",
        "     bloquear.' Dice que hacer, no solo que no se puede.",
        "",
        "3. Y el frontend explica las consecuencias ANTES de confirmar,",
        "   L284-288, con CONSECUENCIAS. O sea que la persona sabe lo que",
        "   va a pasar antes de pulsar, y no despues. Es la unica pantalla",
        "   del proyecto que lo hace."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU15."; } catch (e) { }
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
// EL UNICO FRAGMENTO DE ESTE CASO, Y LAS DOS BARRAS
//
// EA no coloca fragmentos de forma fiable por script, asi que lo que hay
// aqui son FORMAS con su etiqueta. Cada una va en try/catch y cuenta las
// que ha conseguido poner, y el informe final lo dice.
//
// Este caso tiene UN alt, en L271, y ningun loop. Se ha contado antes de
// escribir: for 0, while 0, Promise.all 0 en L246-L300.
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

// El unico alt del caso, sobre los mensajes 17 a 20, que son la condicion
// de L271, la consulta de ordenes, el 409 y la rama que no consulta nada.
function colocarFragmentos(diag) {
    var xS = xDe(indiceDe("S"));
    var xD = xDe(indiceDe("D"));
    fragmento(diag, "alt [nuevo = Bloqueado y viejo != Bloqueado]", xD, xS, Y_MSG0 + 16 * PASO_MSG - 34, Y_MSG0 + 19 * PASO_MSG + 16);
    activacion(diag, xDe(indiceDe("C")), Y_MSG0 + 9 * PASO_MSG - 26, Y_MSG0 + 23 * PASO_MSG + 12);
    activacion(diag, xS, Y_MSG0 + 10 * PASO_MSG - 26, Y_MSG0 + 22 * PASO_MSG + 12);
}

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 700) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU15  Inhabilitar/Bloquear Proveedor (Estado de Riesgo)"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 700) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseno de caso de uso, seccion 3.3.2.1.  10 lineas de vida, 38 mensajes, 8 hallazgos, 1 fragmento alt y 2 barras de activacion."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja. Este caso tiene un solo alt, el de L271, que decide si hay que comprobar las ordenes de compra pendientes antes de bloquear. No hay ningun loop, y se ha contado antes de dibujar: cero for, cero while, cero Promise.all en las 55 lineas del servicio. Las barras estrechas sobre el controlador y el servicio son las activaciones."; } catch (e) { }
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
    N.push("CU15  Inhabilitar/Bloquear Proveedor (Estado de Riesgo).  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Administrador     «actor»     quien cambia el estado de riesgo");
    N.push("    AdminProveedores.tsx     «boundary»  711 lineas, con la maquina de estados en L269-282");
    N.push("    api.ts                  «boundary»  lib/api.ts, L1507-1515");
    N.push("    JwtAuthGuard            «control»   dependencias.ts, L15-65");
    N.push("    ValidationPipe          «control»   main.ts, L22-43, un solo campo");
    N.push("    CTR_Proveedores         «control»   L84-92, PATCH :id/estado");
    N.push("    SRV_ProveedoresService  «control»   L246-300, 55 lineas y 3 consultas");
    N.push("    SRV_BitacoraService     «control»   registrar(), la segunda escritura");
    N.push("    SRV_ComprasService      «control»   L336-355, el unico sitio donde el estado importa");
    N.push("    PostgreSQL              «entity»    proveedores, ordenes_compra, bitacora_auditoria");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes: 7 van a la base de datos, 14 son mensajes a si mismo y 7 son retornos.");
    N.push("  7 llevan la guarda escrita entre corchetes, y aparecen 5 codigos: 200, 403, 404, 409 y 422.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("EL UNICO FRAGMENTO, Y POR QUE SOLO UNO");
    N.push("");
    N.push("  Este caso tiene UN alt y NINGUN loop. Se ha contado ANTES de dibujar, en las");
    N.push("  55 lineas de L246-L300:  for 0,  while 0,  Promise.all 0,  y 4 if.");
    N.push("");
    N.push("  El alt es el de L271, que es la unica rama de verdad del metodo:");
    N.push("");
    N.push("    if (nuevo === 'Bloqueado' && viejo !== 'Bloqueado') { ... }");
    N.push("");
    N.push("  Con dos caminos: Bloqueado y no estaba Bloqueado, o cualquier otro. Y dentro");
    N.push("  del primero hay una segunda decision, L277, tambien de dos. O sea que es un alt");
    N.push("  de dos operandos con un condicional dentro del primero.");
    N.push("");
    N.push("  LO QUE NO SE DIBUJA COMO FRAGMENTO, y por que:");
    N.push("");
    N.push("  - El switch de detalleEstado, L303-310. Es una funcion pura que traduce un");
    N.push("    estado a una frase, sin control de flujo del caso de uso.");
    N.push("  - OPCIONES_POR_ESTADO, L269-282. Es una tabla de datos del frontend, no una");
    N.push("    rama de ejecucion. Se dibuja en los mensajes 2 y 27, con su contenido.");
    N.push("");
    N.push("  Y las barras de activacion, que no son un extra: dos, la del controlador y la");
    N.push("  del servicio, que es la unica linea de vida que ejecuta codigo propio.");
    N.push("");
    N.push("LO QUE HACE ESTE CASO, QUE ES LO QUE NO HACIA CU14");
    N.push("");
    N.push("  Este es el caso mas corto del proyecto y el primero que hace las cosas bien.");
    N.push("");
    N.push("  - ESTADOS_VALIDOS, L18, es una lista blanca con as const, y L255 la comprueba");
    N.push("    con includes. CU09 L396 hacia lo contrario: cualquier cadena se convertia");
    N.push("    en Inactiva sin mirar. Aqui un estado invalido da un 422 con un mensaje claro.");
    N.push("  - La regla de bloqueo, L271-282, mira las ordenes pendientes con un NOT IN de");
    N.push("    estados TERMINALES, L274, en vez de enumerar los pendientes. Y el mensaje dice");
    N.push("    que hacer: 'Procese o anule antes de bloquear.'");
    N.push("  - Y el frontend explica la consecuencia ANTES de confirmar, L284-288, que es la");
    N.push("    unica pantalla del proyecto que lo hace.");
    N.push("");
    N.push("  Y el UPDATE, L285, si usa el nombre real de la columna, estado_riesgo, que CU14");
    N.push("  L222 no hacia. Las tres consultas de este caso usan columnas que existen.");
    N.push("");
    N.push("EL HALLAZGO 1: LA MAQUINA DE ESTADOS SOLO EXISTE EN EL CLIENTE");
    N.push("");
    N.push("  El frontend, L269-282, define las 6 transiciones de los 3 estados, completas.");
    N.push("  El backend, L254-257, solo comprueba que el estado DESTINO sea uno de los tres.");
    N.push("  En ningun sitio se mira de donde se viene. O sea que un PATCH a mano con");
    N.push("  cualquiera de los 9 pares posibles funciona, incluidos los 3 que el menu no");
    N.push("  ofrece. Y el menu es la unica barrera que hay.");
    N.push("");
    N.push("  Y el nombre 'estado de riesgo' sugiere un umbral o un nivel medible. Lo que hay");
    N.push("  son tres cadenas de texto sin relacion entre ellas. No hay puntuacion, no hay");
    N.push("  nivel, no hay nada. La palabra riesgo esta en el nombre de la columna, del");
    N.push("  modal y del DTO, y en nada mas.");
    N.push("");
    N.push("EL HALLAZGO 3: SE PUEDE RODEAR EL BLOQUEO PASANDO ANTES POR INACTIVO");
    N.push("");
    N.push("  El guard de L271 solo comprueba cuando el destino es Bloqueado. No hay nada");
    N.push("  equivalente para Inactivo: pasar un proveedor con ordenes pendientes a Inactivo");
    N.push("  no consulta nada.");
    N.push("");
    N.push("  Y el menu, L284-288, dice para Bloqueado 'no se podran crear nuevas ordenes'");
    N.push("  y para Inactivo 'no podra usarse en nuevas ordenes'. Las dos frases son lo");
    N.push("  mismo, una en futuro y otra en presente.");
    N.push("");
    N.push("  O sea que el estado que la maquina llama intermedio es el unico desde el que se");
    N.push("  puede esquivar el control: se deshabilita primero, que no comprueba nada, y ya");
    N.push("  no se puede bloquear, porque el menu de Inactivo no lo ofrece... pero un PATCH");
    N.push("  a mano si lo haria, y el guard lo pararia.");
    N.push("");
    N.push("  Lo que faltaria es un if mas, o comprobar el hecho de que tiene ordenes sin");
    N.push("  cerrar en vez de mirar el estado de destino.");
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  La maquina de estados, con 3 estados y 6 transiciones, solo existe en el");
    N.push("     frontend. El backend comprueba el destino y nada mas. Y el nombre 'riesgo' no");
    N.push("     corresponde a nada medible.");
    N.push("  2  Los tres estados valen lo mismo en el unico sitio donde se usan: las dos");
    N.push("     comparaciones de Compras son contra 'activo'. Bloqueado e Inactivo son");
    N.push("     indistinguibles, y solo se diferencian en el mensaje y en el guard de entrada.");
    N.push("  3  Se puede rodear el bloqueo pasando antes por Inactivo, porque no hay ninguna");
    N.push("     comprobacion para ese estado. Y el menu ofrece Bloquear desde Inactivo.");
    N.push("  4  Las dos escrituras van sueltas. Y aqui duele mas que en otros casos, porque es");
    N.push("     una decision comercial. El oldData si sale de la fila real, L295, mejor que");
    N.push("     CU06 y CU07. Pero el detalle de L291 no se ve en la pantalla de auditoria.");
    N.push("  5  El UPDATE no lleva AND del estado viejo, asi que no es idempotente: un doble");
    N.push("     click genera dos filas de bitacora con el mismo contenido, y la segunda");
    N.push("     dice que un proveedor paso de Bloqueado a Bloqueado.");
    N.push("  6  El DTO solo valida que estado sea un string no vacio. No hay @IsIn, que es");
    N.push("     el decorador exacto para esto. Y el 422 sale con una cadena en vez del array");
    N.push("     que devuelven los endpoints con DTO.");
    N.push("  7  estado_riesgo se lee con dos reglas distintas en dos sitios de Compras, L262 y");
    N.push("     L349, y la lista blanca de L255 es sensible a mayusculas mientras que los dos");
    N.push("     consumidores no lo son. Tres criterios para el mismo dato.");
    N.push("  8  Lo que si esta bien: la lista blanca con as const, el NOT IN de estados");
    N.push("     terminales que define pendiente como lo que no es terminal, el mensaje que");
    N.push("     dice que hacer, y el modal que explica la consecuencia antes de confirmar.");
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  Este caso es la respuesta directa a CU14. Los dos son el mismo fichero,");
    N.push("  SRV_ProveedoresService, y el mismo controlador, CTR_Proveedores. En CU14 el");
    N.push("  INSERT nombra estado donde la columna es estado_riesgo, y da 500. Aqui el UPDATE");
    N.push("  nombra estado_riesgo, y funciona. O sea que el mismo autor, en el mismo");
    N.push("  fichero, se equivoco en el alta y acerto en el cambio de estado. El esqueno lo");
    N.push("  leyo para una operacion y no para la otra.");
    N.push("");
    N.push("  Y el hallazgo 6 es lo contrario de CU08 y CU09, que devuelven el 422 con un");
    N.push("  array de mensajes. Este devuelve una cadena, porque el exceptionFactory de");
    N.push("  main.ts L27-41 solo se aplica a los errores del pipe, y este 422 lo lanza el");
    N.push("  servicio. O sea que el array de mensajes y el 422 de negocio son dos caminos");
    N.push("  distintos, y el frontend tiene que manejar los dos.");
    N.push("");
    N.push("  Y el hallazgo 1 continua el de CU09, CU11 y CU12 sobre el estado. Alli el");
    N.push("  problema era que el codigo usaba estados que no existian. Aqui es al reves: los");
    N.push("  tres estados existen, estan bien nombrados, y estan bien contrastados. Lo que");
    N.push("  no existe es la transicion entre ellos, y solo en el backend.");
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
    N.push("    MARCOS alt colocados: " + MARCOS_PUESTOS + " de 1");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU15 Secuencia", 0); } catch (e) { }
        return;
    }
    INFORME.push("tipo de diagrama: " + tipoUsado);
    if (tipoUsado != DIAG_TIPO) ERRORES.push("el diagrama es de tipo " + tipoUsado + " y no " + DIAG_TIPO + ": las lineas de vida no se veran");
    diag.Update();
    try { paq.Diagrams.Refresh(); } catch (e) { }

    borrarTodo(diag);
    colocarCabeceras(diag, C);
    tituloYLeyenda(diag);
    var h1 = colocarHallazgos(diag, paq);
    diag = guardarYRecargar(diag);

    borrarTodo(diag);
    colocarCabeceras(diag, C);
    tituloYLeyenda(diag);
    var h2 = colocarHallazgos(diag, paq);
    if (h1.total != h2.total) ERRORES.push("los hallazgos no se colocan igual en las dos pasadas");
    INFORME.push("hallazgos colocados: " + h2.total + " de " + TOTAL_HAL);

    diag = guardarYRecargar(diag);

    var r = dibujarMensajes(diag, C);
    diag = guardarYRecargar(diag);

    if (MARCOS_PUESTOS == 0 && BARRAS_PUESTAS == 0) colocarFragmentos(diag);
    diag = guardarYRecargar(diag);

    var ch = comprobar(diag);
    INFORME.push("objetos: " + ch.leidos + ", colocados: " + ch.bien);
    INFORME.push("primeras coordenadas: " + ch.muestra);

    notasDelDiagrama(diag, r, h2, ch);

    var T = [];
    T.push("CU15 - DIAGRAMA DE SECUENCIA - INFORME");
    T.push("");
    T.push("Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB);
    T.push("Tipo de diagrama: " + tipoUsado);
    T.push("Mensajes: " + r.puestos + " de " + TOTAL_MSG);
    T.push("Mensajes a si mismo: " + r.autodestino);
    T.push("Conectores en el diagrama: " + r.enDiagrama);
    T.push("Hallazgos: " + h2.total + " de " + TOTAL_HAL + ", banda hasta la y " + h2.fin);
    T.push("");
    T.push("MARCOS Y BARRAS  <-- MIRA ESTO");
    T.push("Este caso tiene 1 alt y NINGUN loop. Contado antes de dibujar:");
    T.push("  for 0, while 0, Promise.all 0 en las 55 lineas de L246-L300.");
    T.push("Fragmentos alt colocados: " + MARCOS_PUESTOS + " de 1");
    T.push("Barras de activacion colocadas:   " + BARRAS_PUESTAS + " de 2");
    if (MARCOS_PUESTOS < 1 || BARRAS_PUESTAS < 2) {
        T.push("  Si alguno sale a 0, EA no ha aceptado la forma y hay que");
        T.push("  dibujarlo a mano en el diagrama.");
    } else {
        T.push("  Los 3 han salido. Son FORMAS dibujadas por script, no");
        T.push("  fragmentos nativos de EA.");
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
    msg = msg + "CU15 - Inhabilitar/Bloquear Proveedor" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "1 alt y NINGUN loop, contado antes de dibujar." + SALTO;
    msg = msg + "ALT colocados: " + MARCOS_PUESTOS + " de 1." + SALTO;
    msg = msg + "BARRAS colocadas: " + BARRAS_PUESTAS + " de 2." + SALTO;
    if (MARCOS_PUESTOS < 1 || BARRAS_PUESTAS < 2) msg = msg + "  Si falta alguno, hay que dibujarlo a mano." + SALTO;
    msg = msg + SALTO;
    msg = msg + "ES EL CASO MAS LIMPIO DE LOS QUINCE: lista blanca" + SALTO;
    msg = msg + "de verdad, regla de bloqueo escrita y accionable," + SALTO;
    msg = msg + "y el UPDATE con el nombre real de la columna." + SALTO + SALTO;
    msg = msg + "PERO: la maquina de estados solo existe en el cliente," + SALTO;
    msg = msg + "y se puede rodear el bloqueo pasando por Inactivo." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU15 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU15 Secuencia", 0); } catch (e3) { }
}
