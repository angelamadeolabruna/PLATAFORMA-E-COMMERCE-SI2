// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU05  Asignar/Modificar Roles y Permisos
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/admin/Roles.tsx                  663 lineas
//     web/src/lib/api.ts                            L1253-1300, seis metodos
//     api/src/main.ts                               L22-43 ValidationPipe
//     api/src/modulos/seguridad/dependencias.ts     L15-65 JwtAuthGuard
//     api/src/modulos/seguridad/CTR_Roles.ts        125 lineas
//     api/src/modulos/seguridad/SRV_RolesService.ts 335 lineas
//     api/src/modulos/seguridad/CE_Modelos.ts       L94-109 UsuarioRol
//     api/src/modulos/seguridad/SRV_BitacoraService.ts   L14-39
//     BASE DE DATOS/schema.sql                      L23-31 roles, L45-49
//                                                    usuarios_roles,
//                                                    L573-578 el seed
//
//   Cada mensaje lleva la linea del fichero de la que sale.
//
// QUE HACE ESTE CASO Y POR QUE ES EL MAS IMPORTANTE DE LOS CINCO
//   El caso se llama "Asignar/Modificar Roles y Permisos", y al leerlo
//   aparecen dos cosas:
//
//   1. LA MITAD QUE NO EXISTE. En los 114 endpoints del backend no hay
//      ni uno que asigne un rol a un usuario. La tabla usuarios_roles se
//      escribe en dos sitios de todo el proyecto, los dos de registro:
//      CU02 para clientes y CU04 para empleados. Y nunca se vuelve a
//      tocar. No hay PATCH, ni POST, ni PUT que la modifique.
//
//   2. LA PARTE QUE EXISTE ESTA ROTA. El seed de schema.sql L573-L578
//      siembra 17 permisos y el codigo solo entiende 2. Los otros 15 no
//      los comprueba nadie, en ningun sitio del proyecto. Y el permiso
//      que el Administrador si tiene, el asterisco, el editor de
//      permisos lo RECHAZA.
//
//   37 mensajes. 10 lineas de vida. 7 van a la base de datos, 11 son
//   mensajes a si mismo y 6 son retornos.
//   5 guardas escritas entre corchetes, 7 puntos donde el codigo lanza
//   una excepcion y 6 codigos: 200, 201, 403, 404, 409 y 422.
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
var TOTAL_MSG = 37;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU05 Secuencia Roles y Permisos";
var DIAG_NOMBRE = "CU05 Asignar Modificar Roles y Permisos";
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
    ["U", "ACTOR_Administrador", "Actor", "Lifeline", "Administrador", "quien edita", "Actor, no clase: es quien pulsa", "no es codigo, es la persona"],
    ["F", "Roles.tsx", "Object", "Lifeline", "Roles", "pantalla de roles", "Boundary", "web/src/pages/admin/Roles.tsx, 663 lineas"],
    ["H", "api.ts", "Object", "Lifeline", "api", "cliente HTTP", "Boundary", "web/src/lib/api.ts, L1253-1300, seis metodos"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["P", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "validacion del DTO", "Control", "api/src/main.ts, L22-43, es global"],
    ["C", "CTR_Roles", "Object", "Lifeline", "RolesController", "siete endpoints", "Control", "api/src/modulos/seguridad/CTR_Roles.ts, 125 lineas"],
    ["S", "SRV_RolesService", "Object", "Lifeline", "RolesService", "toda la logica", "Control", "api/src/modulos/seguridad/SRV_RolesService.ts, 335 lineas"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar()", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["M", "CE_Modelos", "Object", "Lifeline", "UsuarioRol", "getter rol", "Control", "api/src/modulos/seguridad/CE_Modelos.ts, L76-81 y L94-109"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "2 tablas y el seed", "Entity", "schema.sql: roles y usuarios_roles, mas el seed de L573-578"]
];

// Los 37 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [
    [1, "U", "F", "1. abre /admin/roles   Roles.tsx, 663 lineas, con cinco modales: permisos, crear, editar, borrar y ver", "S"],
    [2, "F", "F", "2. permisoOk = permisos incluye '*' o 'gestionar_roles'   L402.   Si no, no ve ni el boton de permisos", "S"],
    [3, "F", "H", "3. cargar() pide a la vez la lista de roles y el catalogo de permisos   L409", "S"],
    [4, "H", "G", "4. GET /api/v1/admin/roles   y en paralelo GET /api/v1/admin/roles/permisos-catalogo", "S"],
    [5, "G", "D", "5. SELECT usuarios LEFT JOIN usuarios_roles LEFT JOIN roles   L68-74.   Solo el token y el estado", "S"],
    [6, "G", "P", "6. el guard no mira permisos. Eso lo hace el servicio, con una consulta propia por operacion", "S"],
    [7, "P", "C", "7. GET no lleva cuerpo, asi que el pipe no tiene nada que validar   main.ts L22-43", "S"],
    [8, "C", "S", "8. listarRoles( currentUser )   CTR_Roles.ts L64", "S"],
    [9, "S", "D", "9. SELECT roles, con un COUNT de usuarios por rol en la misma consulta   L96-104", "S"],
    [10, "S", "S", "10. parsearPermisos tolera que el jsonb venga como array o como texto   L116-127", "S"],
    [11, "C", "S", "11. catalogoPermisos( currentUser )   L68, que llama a exigirPermisoPublico   L69", "S"],
    [12, "S", "D", "12. SELECT usuarios LEFT JOIN usuarios_roles LEFT JOIN roles   L68-74", "S"],
    [13, "S", "M", "13. y lee conRol.rol.permisos_json   L75.   Ese .rol es el getter que devuelve roles[0]", "S"],
    [14, "M", "M", "14. CE_Modelos L76-81:  get rol() { return this.roles[0].rol }   Solo el primer rol, siempre", "S"],
    [15, "S", "S", "15. [sin '*' ni 'gestionar_roles'] ForbiddenException 403   L84-85", "S"],
    [16, "S", "C", "16. devuelve { grupos: CATALOGO_PERMISOS }   L70.   8 grupos y 21 permisos, en el codigo", "A"],
    [17, "C", "H", "17. la lista de roles con su numero de usuarios, y el catalogo de permisos", "A"],
    [18, "H", "F", "18. setRoles y setGrupos   L409-414.   Los dos grupos con su contador {activos}/{total}   L170", "A"],
    [19, "F", "F", "19. el admin marca una casilla y guarda   L190 y L439-444", "S"],
    [20, "F", "H", "20. PUT /api/v1/admin/roles/:rolId/permisos   api.ts L1268", "S"],
    [21, "H", "G", "21. PUT con Authorization Bearer y credentials:'include'", "S"],
    [22, "G", "P", "22. el guard repite: token, blacklist, usuario.estado   dependencias.ts L22-55", "S"],
    [23, "P", "P", "23. valida ActualizarPermisosRequest: @IsArray, @ArrayMinSize(0), @IsString(each)   CTR_Roles L30-35", "S"],
    [24, "P", "P", "24. [falla] 422 con todos los mensajes   main.ts L27-41", "S"],
    [25, "P", "C", "25. el cuerpo validado pasa al controlador   CTR_Roles.ts L84", "S"],
    [26, "C", "S", "26. actualizarPermisos( currentUser, rolId, body.permisos, request )   L88", "S"],
    [27, "S", "D", "27. cargarPermisos(): SELECT usuarios LEFT JOIN usuarios_roles LEFT JOIN roles   L68-74", "S"],
    [28, "S", "S", "28. [sin permiso] 403.   Y otra vez con el getter, o sea solo con roles[0]   L75 y L84-85", "S"],
    [29, "S", "S", "29. [algún permiso fuera del catalogo] 422 'Permiso no reconocido: ...'   L157-163", "S"],
    [30, "S", "D", "30. SELECT roles WHERE id_rol = :rolId   L165-169", "S"],
    [31, "S", "S", "31. [no existe] 404 'Rol no encontrado.'   L170-172", "S"],
    [32, "S", "S", "32. [es el rol 1 y la lista no lleva 'gestionar_roles'] 403   L174-176", "S"],
    [33, "S", "D", "33. UPDATE roles SET permisos_json = :permisos   L179-180.   La escritura 1 de 2", "S"],
    [34, "S", "B", "34. registrar( id, 'UPDATE', 'roles', 'Permisos del rol X actualizados', ..., { antes }, { despues } )   L182-191", "S"],
    [35, "B", "D", "35. INSERT INTO bitacora_auditoria con old_data y new_data   SRV_BitacoraService L27-38.   La 2 de 2", "A"],
    [36, "S", "C", "36. { detail: 'Permisos actualizados.' }   L193", "A"],
    [37, "C", "U", "37. Toast de exito y recarga.   O Toast de error y el catalogo entero se queda sin guardar", "A"]
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. No existe ningun endpoint para asignar un rol a un usuario", [
        "El caso de uso se llama 'Asignar/Modificar Roles y Permisos'.",
        "La mitad de 'Asignar' no existe.",
        "",
        "En los 114 endpoints del backend no hay ni uno que escriba en la",
        "tabla usuarios_roles. Se revisa endpoint por endpoint.",
        "",
        "usuarios_roles se escribe en DOS sitios de todo el proyecto, y los",
        "dos son de alta:",
        "",
        "  SRV_ClienteService.ts L48     alta de cliente, CU02, rol Cliente",
        "  SRV_EmpleadosService.ts L153  alta de empleado, CU04, rol de un",
        "                                array fijo de tres",
        "",
        "Y nunca se vuelve a tocar. No hay PATCH admin/usuarios/:id/rol, no",
        "hay POST admin/usuarios/:id/roles, no hay nada. La tabla tiene",
        "PRIMARY KEY (id_usuario, id_rol), o sea que el modelo de datos",
        "admite varios roles por usuario, y no hay ninguna forma de",
        "cambiarlos despues de crearlos.",
        "",
        "Lo que si hay, y no es de este caso: crear rol, renombrar rol y",
        "borrar rol. Tres operaciones mas que el caso no menciona.",
        "",
        "O sea que el caso CU05 describes cuatro cosas, de las que una no",
        "esta hecha, otra esta hecha y rota, y las otras dos son un extra."
    ]],
    ["2. El seed y el catalogo usan dos vocabularios distintos", [
        "Este es el hallazgo gordo del proyecto, y solo se ve cruzando",
        "schema.sql con el codigo.",
        "",
        "El seed, schema.sql L573-L578, siembra 17 permisos, que son 16",
        "distintos:",
        "",
        "  Administrador         1, el asterisco",
        "  Encargado de Sucursal 7 permisos",
        "  Cajero                 4 permisos",
        "  Cliente                4 permisos",
        "  Proveedor              1 permiso",
        "",
        "El catalogo del codigo, SRV_RolesService L20-41, tiene OTROS 21, en",
        "8 grupos. Se cruzaron uno por uno, con el codigo entero:",
        "",
        "  DEL SEED, EL CODIGO ENTIENDE 2 DE LOS 16:",
        "    gestionar_reservas        si",
        "    gestionar_devoluciones    si",
        "",
        "  Y ESTOS 14 NO LOS COMPRUEBA NADIE, EN NINGUN SITIO:",
        "    *",
        "    gestionar_catalogo",
        "    ver_inventario",
        "    editar_inventario",
        "    gestionar_compras",
        "    gestionar_recepciones",
        "    ver_existencias",
        "    procesar_pagos",
        "    registrar_venta",
        "    ver_catalogo",
        "    comprar",
        "    reservar",
        "    usar_vestidor_ra",
        "    ver_ordenes_compra",
        "",
        "El codigo pide realizar_venta. El seed da registrar_venta. El codigo",
        "pide gestionar_inventario. El seed da ver_inventario y",
        "editar_inventario. El codigo pide procesar_pago. El seed da",
        "procesar_pagos. Son dos idiomas, y no se cruzan."
    ]],
    ["3. Un Cajero recién sembrado no puede cobrar ni registrar una venta", [
        "La consecuencia PRACTICA del hallazgo 2, y es la que se nota.",
        "",
        "Lo que el codigo exige para cobrar, en cuatro sitios:",
        "",
        "  SRV_VentasService.ts L72 y L79    realizar_venta",
        "  SRV_PagosService.ts L78 y L85     realizar_venta",
        "  SRV_CarritoService.ts L72         realizar_venta",
        "  SRV_ComprobantesService.ts L70    realizar_venta",
        "",
        "Y el seed le da al Cajero, L576:",
        "  [\"procesar_pagos\", \"ver_inventario\", \"registrar_venta\",",
        "   \"gestionar_devoluciones\"]",
        "",
        "Ninguno de los cuatro es realizar_venta. El unico que el codigo",
        "entiende es gestionar_devoluciones, y resulta que NADIE lo",
        "comprueba: no aparece en ningun permisos.includes() del proyecto.",
        "",
        "O sea que un Cajero recien sembrado tiene un conjunto de permisos",
        "efectivamente VACIO, y recibe 403 en las cuatro operaciones para",
        "las que existe. La caja no abre.",
        "",
        "El Encargado de Sucursal, L575, si puede gestionar_reservas. Las",
        "otras seis son codigo muerto. O sea que puede reservar y nada mas.",
        "",
        "Y CU04 inserta el rol Cajero con una fila en usuarios_roles, asi",
        "que cualquier empleado dado de alta como Cajero nace con este",
        "problema, no solo los del seed."
    ]],
    ["4. El asterisco no se puede editar, y el editor lo rechaza", [
        "El Administrador es el unico rol que funciona, y su permiso es",
        "imposible de tocar desde la aplicacion.",
        "",
        "El seed le da [\"*\"], schema.sql L574. El catalogo, L20-41, no",
        "tiene asterisco. Y actualizarPermisos valida contra el catalogo:",
        "",
        "  L157  const desconocidos = permisos.filter((p) => !TODOS_PERMISOS.includes(p));",
        "  L158  if (desconocidos.length > 0) throw 422 'Permiso no reconocido: ...'",
        "",
        "Y el frontend, Roles.tsx L430, carga los permisos actuales del rol",
        "con obtenerPermisosRol y los mete en el estado. El asterisco no",
        "tiene casilla, porque el catalogo no lo lista, pero sigue en el",
        "estado. Al guardar, L444, se manda el array entero, asterisco",
        "incluido.",
        "",
        "O sea que abrir el rol Administrador, marcar una casilla y guardar",
        "da 422. Siempre.",
        "",
        "Y si el asterisco se quitara de la lista, L174-176 lo impediria en",
        "el rol 1: exige que conserve gestionar_roles, y 'gestionar_roles'",
        "no es '*'. O sea que el rol Administrador tampoco puede quedarse",
        "solo con el asterisco.",
        "",
        "Los dos controles juntos dejan al Administrador con un juego de",
        "permisos congelado: no se puede anadir el asterisco ni quitarlo, y",
        "no se puede dejar solo con el."
    ]],
    ["5. Cuatro permisos del catalogo no los comprueba nadie", [
        "El catalogo ofrece 21 interruptores en la pantalla. Cuatro de ellos",
        "no estan conectados a nada.",
        "",
        "  ajustar_stock           nadie lo comprueba",
        "  gestionar_alertas      nadie lo comprueba",
        "  procesar_pago          nadie lo comprueba",
        "  gestionar_devoluciones nadie lo comprueba",
        "",
        "Lo que hay en su lugar, en los cuatro casos:",
        "",
        "  ajustar_stock      SRV_AjustesService.ts L69  pide gestionar_inventario",
        "  gestionar_alertas SRV_AlertasService.ts L64  pide gestionar_inventario",
        "  procesar_pago      SRV_PagosService.ts L78    pide realizar_venta",
        "  gestionar_devoluciones  no hay nada, porque no hay caso de devoluciones",
        "",
        "Asi que un administrador puede mover cuatro casillas, ver el",
        "contador subir, guardar, y no cambiar absolutamente nada. El",
        "contador {activos}/{total} de L170 miente sobre lo que el permiso",
        "hace.",
        "",
        "Y son 4 de 21, casi la quinta parte del catalogo."
    ]],
    ["6. La autorizacion solo mira el primer rol del usuario", [
        "Es el mismo getter de CU01, L76-81 de CE_Modelos, y aqui decide",
        "quien puede administrar el sistema.",
        "",
        "  get rol(): Rol | null {",
        "    if (this.roles && this.roles.length > 0) return this.roles[0].rol;",
        "    return null;",
        "  }",
        "",
        "Y se usa en los dos sitios de este caso:",
        "",
        "  SRV_RolesService.ts L75      return (conRol?.rol?.permisos_json ?? [])",
        "  y el mismo patron, exacto, en otros cuatro ficheros:",
        "  SRV_EmpleadosService L60, SRV_SucursalesService,",
        "  SRV_AuditoriaService y SRV_AuthService",
        "",
        "Y el asterisco, que 61 sitios del proyecto respetan, sigue sin",
        "poderse poner desde la aplicacion, por el hallazgo 4.",
        "",
        "La tabla usuarios_roles tiene PRIMARY KEY (id_usuario, id_rol),",
        "o sea que el modelo admite N roles por usuario. Y el codigo lee",
        "siempre el primero, sin ordenar y sin filtrar.",
        "",
        "Asi que un administrador con dos roles solo puede administrar lo",
        "que tenga el primero. Si tiene el segundo, no existe. Y desde la",
        "pantalla de roles, listarRoles L99-102 muestra cuantos usuarios",
        "tienen cada rol, asi que un administrador PUEDE ver que alguien",
        "tiene dos, y aun asi no puede contar con el segundo para nada.",
        "",
        "El frontend tiene el mismo problema, con la misma regla: 30 ficheros",
        "hacen permisos.includes('*') o el permiso concreto, y todos leen",
        "usuario.permisos, que viene del unico rol que se firmo en el token."
    ]],
    ["7. No hay MaxLength en el nombre del rol, y la columna es de 60", [
        "Un detalle pequeno, pero del mismo genero que los de CU02 y CU04.",
        "",
        "  CTR_Roles.ts L38-40   CrearRolRequest: @IsString y @IsNotEmpty",
        "  CTR_Roles.ts L48-50   ActualizarRolRequest: @IsString y @IsOptional",
        "  schema.sql L25        nombre_rol VARCHAR(60) UNIQUE NOT NULL",
        "",
        "Un nombre de 61 caracteres pasa la validacion y revienta en el",
        "INSERT, con un 500 en vez de un 400.",
        "",
        "Lo que si esta bien, y conviene decirlo porque son las dos",
        "protecciones que hacen que esto no sea un agujero:",
        "",
        "  - crearRol L213-215 rechaza que el nombre del rol sea",
        "    cualquiera de los 21 permisos. No se puede crear un rol",
        "    llamado 'gestionar_empleados' para que las comprobaciones",
        "    se confundan.",
        "",
        "  - eliminarRol L307-309 no deja borrar el rol 1, y L311-320 no",
        "    deja borrar un rol que tenga usuarios. Esa segunda Comprobacion",
        "    protege de verdad: la FK de usuarios_roles.id_rol es ON DELETE",
        "    CASCADE, schema.sql L47, o sea que sin la Comprobacion, borrar",
        "    un rol le quitaria el rol a todos sus usuarios en silencio.",
        "",
        "  - actualizarRol L262-264 no deja renombrar el rol 1, para que",
        "    el nombre 'Administrador' no se pueda perder."
    ]],
    ["8. Lo que si esta bien en la gestion de roles", [
        "Este es el unico de los cinco casos donde la validacion de entrada",
        "esta completa, y eso hay que decirlo porque es el patron.",
        "",
        "  - El DTO de permisos es el unico con una validacion de",
        "    elementos, no solo de la forma. CTR_Roles L31-34:",
        "      @IsArray()",
        "      @ArrayMinSize(0)",
        "      @IsString({ each: true })",
        "    O sea que comprueba que sea un array Y que cada elemento sea",
        "    texto. Un ['*', 5, null] pasaria un @IsString sin each, y",
        "    este DTO lo para. Los otros cuatro casos de uso no tienen",
        "    nada parecido.",
        "",
        "  - actualizarPermisos valida la lista CONTRA EL CATALOGO,",
        "    L157, y devuelve 422 con el nombre de los que no reconoce. No",
        "    guarda un permiso inventado. La lista blanca es real.",
        "",
        "  - El permiso se comprueba en el servicio y en los siete",
        "    endpoints, uno por operacion, con exigirPermiso. Y el guard no",
        "    lo comprueba, asi que no se puede saltarselo desde fuera.",
        "",
        "  - La bitacora de este caso es la mejor del proyecto: L178",
        "    guarda una COPIA del array anterior con .slice(), y L189-190",
        "    pasa los dos estados, antes y despues, en old_data y new_data.",
        "    Se puede ver exactamente que permisos habia y cuales hay.",
        "    CU03 y CU04 no llegaban a esto.",
        "",
        "  - El Administrador esta protegido contra el cierre de llaves:",
        "    no se le puede quitar gestionar_roles ni borrar el rol. Es",
        "    codigo magico, ROL_ADMIN_ID = 1 en L54, pero esta.",
        "",
        "  - parsearPermisos, L116-127, tolera que el jsonb de Postgres",
        "    vuelva como array o como texto, y que un json corrupto no",
        "    reviente la pantalla. Es defensivo y esta bien.",
        "",
        "  - eliminarRol comprueba usuarios antes de borrar, y la FK es",
        "    CASCADE, asi que la Comprobacion es lo que evita la perdida",
        "    silenciosa."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU05."; } catch (e) { }
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
        try { o.Text = "CU05  Asignar / Modificar Roles y Permisos"; } catch (e) { }
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
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja. Este es el camino de modificar los permisos de un rol. La otra mitad del caso, asignar un rol a un usuario, no tiene ningun endpoint en el proyecto, y eso no se puede dibujar: es lo que dice el hallazgo 1."; } catch (e) { }
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
    N.push("CU05  Asignar / Modificar Roles y Permisos.  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Administrador    «actor»     quien abre /admin/roles");
    N.push("    Roles.tsx              «boundary»  pages/admin/Roles.tsx, 663 lineas");
    N.push("    api.ts                 «boundary»  lib/api.ts, L1253-1300, seis metodos");
    N.push("    JwtAuthGuard           «control»   dependencias.ts, L15-65");
    N.push("    ValidationPipe         «control»   main.ts, L22-43, es global");
    N.push("    CTR_Roles              «control»   7 endpoints, 125 lineas");
    N.push("    SRV_RolesService       «control»   335 lineas, el CATALOGO_PERMISOS esta aqui");
    N.push("    SRV_BitacoraService    «control»   registrar(), la segunda escritura");
    N.push("    CE_Modelos             «control»   el getter de rol, L76-81");
    N.push("    PostgreSQL             «entity»    roles, usuarios_roles y el seed de L573-578");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes: 7 van a la base de datos, 11 son mensajes a si mismo y 6 son");
    N.push("  retornos. 5 llevan la guarda escrita entre corchetes, 7 son el punto donde el");
    N.push("  codigo lanza una excepcion, y aparecen 6 codigos: 200, 201, 403, 404, 409 y 422.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("LO QUE DICE EL CASO Y LO QUE HAY: 1 DE 4 PARTES EXISTE");
    N.push("");
    N.push("  El caso se llama 'Asignar/Modificar Roles y Permisos'. Al leerlo:");
    N.push("");
    N.push("  1. ASIGNAR UN ROL A UN USUARIO: no existe. En los 114 endpoints del");
    N.push("     backend no hay ni uno que escriba en usuarios_roles. Se escribe");
    N.push("     en dos sitios de todo el proyecto, SRV_ClienteService L48 y");
    N.push("     SRV_EmpleadosService L153, y los dos son de alta. Nunca se toca mas.");
    N.push("");
    N.push("  2. MODIFICAR LOS PERMISOS DE UN ROL: existe, y es lo que este diagrama");
    N.push("     dibuja. PUT /admin/roles/:rolId/permisos. Esta roto, hallazgos 2 a 5.");
    N.push("");
    N.push("  3. CREAR UN ROL: existe. POST /admin/roles. No lo menciona el caso.");
    N.push("");
    N.push("  4. RENOMBRAR Y BORRAR UN ROL: existen. PUT y DELETE /admin/roles/:rolId.");
    N.push("     Tampoco los menciona el caso.");
    N.push("");
    N.push("  Los siete endpoints de CTR_Roles son los de leer, escribir permisos,");
    N.push("  crear, renombrar y borrar. Ninguno toca usuarios_roles.");
    N.push("");
    N.push("EL HALLAZGO 2: EL SEED Y EL CATALOGO HABLAN IDIOMAS DISTINTOS");
    N.push("");
    N.push("  El catalogo del codigo, SRV_RolesService L20-41, tiene 21 permisos en 8");
    N.push("  grupos. El seed, schema.sql L573-L578, siembra 17. Se cruzaron uno por uno:");
    N.push("");
    N.push("  DEL SEED, EL CODIGO ENTIENDE 2 DE 17:");
    N.push("    gestionar_reservas       si");
    N.push("    gestionar_devoluciones   si");
    N.push("");
    N.push("  Y ESTOS 15 NO LOS COMPRUEBA NADIE EN NINGUN SITIO DEL PROYECTO:");
    N.push("    *");
    N.push("    gestionar_catalogo      ver_inventario       editar_inventario");
    N.push("    gestionar_compras       gestionar_recepciones  ver_existencias");
    N.push("    procesar_pagos          registrar_venta      ver_catalogo");
    N.push("    comprar                 reservar             usar_vestidor_ra");
    N.push("    ver_ordenes_compra");
    N.push("");
    N.push("  El codigo pide realizar_venta. El seed da registrar_venta.");
    N.push("  El codigo pide gestionar_inventario. El seed da ver_inventario y");
    N.push("  editar_inventario. El codigo pide procesar_pago. El seed da procesar_pagos.");
    N.push("  Son dos idiomas, y no se cruzan.");
    N.push("");
    N.push("  Esto es lo que el diagrama de capas advanced senalaba como 'la estructura");
    N.push("  de permisos es mala'. Ahora esta exacto: no es que sea mala, es que hay");
    N.push("  dos y no se han juntado.");
    N.push("");
    N.push("EL HALLAZGO 3: UN CAJERO NUEVO NO COBRA");
    N.push("");
    N.push("  El codigo pide realizar_venta en cuatro sitios: SRV_VentasService L72 y");
    N.push("  L79, SRV_PagosService L78 y L85, SRV_CarritoService L72 y");
    N.push("  SRV_ComprobantesService L70.");
    N.push("");
    N.push("  El seed da al Cajero, L576:");
    N.push("    procesar_pagos, ver_inventario, registrar_venta, gestionar_devoluciones");
    N.push("");
    N.push("  Ninguno es realizar_venta. El unico que el codigo entiende es");
    N.push("  gestionar_devoluciones, y no lo comprueba nadie. O sea que el Cajero");
    N.push("  tiene un juego de permisos EFECTIVAMENTE VACIO, y la caja no abre.");
    N.push("");
    N.push("  Y CU04 inserta el rol Cajero con una fila en usuarios_roles, asi que");
    N.push("  cualquier empleado dado de alta como Cajero nace con el problema, no");
    N.push("  solo los del seed.");
    N.push("");
    N.push("LOS OCHO HALLAZGOS, EN UNA LINEA CADA UNO");
    N.push("");
    N.push("  1  No hay ningun endpoint para asignar un rol a un usuario. En 114");
    N.push("     endpoints, ninguno escribe usuarios_roles. Solo los dos alta.");
    N.push("  2  El seed y el catalogo usan dos vocabularios distintos. De 17 permisos");
    N.push("     sembrados, el codigo entiende 2. Los otros 15 no los comprueba nadie.");
    N.push("  3  Un Cajero recien sembrado no puede cobrar ni registrar una venta: el");
    N.push("     codigo pide realizar_venta y el seed le da registrar_venta.");
    N.push("  4  El asterisco del Administrador no se puede editar. El editor lo rechaza");
    N.push("     con 422, porque no esta en el catalogo, y L174 impide dejar el rol 1");
    N.push("     solo con el asterisco. El juego de permisos del admin esta congelado.");
    N.push("  5  Cuatro de los 21 permisos del catalogo no los comprueba nadie:");
    N.push("     ajustar_stock, gestionar_alertas, procesar_pago y");
    N.push("     gestionar_devoluciones. Cuatro casillas que no hacen nada.");
    N.push("  6  La autorizacion solo mira el primer rol del usuario, por el getter de");
    N.push("     CE_Modelos L76-81. La tabla admite N roles y el codigo lee uno.");
    N.push("  7  nombre_rol no tiene MaxLength y la columna es VARCHAR(60). En cambio");
    N.push("     crearRol no deja nombrar un rol como un permiso, y eliminarRol no deja");
    N.push("     borrar el rol 1 ni uno con usuarios, que es lo que evita el CASCADE.");
    N.push("  8  Lo que si esta bien, y es el unico de los cinco con validacion de");
    N.push("     elementos: @IsArray, @ArrayMinSize y @IsString({each}). Valida la");
    N.push("     lista contra el catalogo con 422. La bitacora guarda el antes y el");
    N.push("     despues en old_data y new_data, la mejor del proyecto. Y el");
    N.push("     Administrador esta protegido contra el cierre de llaves.");
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  Este caso explica el hallazgo 6 de CU01 y el punto 3 del hallazgo 6 de");
    N.push("  CU04. El getter de roles[0] no es un detalle de un login: es lo que");
    N.push("  decide quien puede administrar roles, y sale aqui dos veces, L13 y L28.");
    N.push("");
    N.push("  Y el hallazgo 2 explica por que la capa de presentacion del diagrama de");
    N.push("  capas sale con diez recuadros que dicen 'pantalla' y nada mas: la");
    N.push("  pantalla de roles, 663 lineas, depende de un catalogo que no coincide");
    N.push("  con lo que hay en la base de datos.");
    N.push("");
    N.push("  Y un dato de alcance: los cuatro permisos muertos del hallazgo 5 y el");
    N.push("  nombre del caso CU18 'Devoluciones', que el diagrama de capas ya");
    N.push("  senalaba como un caso eliminado, son la misma cosa. El permiso");
    N.push("  gestionar_devoluciones esta en el catalogo y en el seed, y no hay caso");
    N.push("  de uso, ni endpoint, ni nada que lo compruebe.");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU05 Secuencia", 0); } catch (e) { }
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
    T.push("CU05 - DIAGRAMA DE SECUENCIA - INFORME");
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
    msg = msg + "CU05 - Asignar / Modificar Roles y Permisos" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "1 DE LAS 4 PARTES DEL CASO EXISTE." + SALTO;
    msg = msg + "Asignar un rol a un usuario no tiene ningun" + SALTO;
    msg = msg + "endpoint en 114. Solo se escribe al dar de alta." + SALTO + SALTO;
    msg = msg + "Y EL SEED HABLA OTRO IDIOMA QUE EL CODIGO: de" + SALTO;
    msg = msg + "17 permisos sembrados, el codigo entiende 2. Un" + SALTO;
    msg = msg + "Cajero nuevo no puede cobrar: el codigo pide" + SALTO;
    msg = msg + "realizar_venta y el seed le da registrar_venta." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU05 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU05 Secuencia", 0); } catch (e3) { }
}
