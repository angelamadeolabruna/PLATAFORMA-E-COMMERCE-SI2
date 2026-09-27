// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU19  Configurar Alertas de Stock Mínimo
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/pages/admin/AdminAlertas.tsx
//     web/src/lib/api.ts                     L562-600, seccion CU25
//     api/src/main.ts                        L22-43 ValidationPipe
//     api/src/modulos/seguridad/dependencias.ts L15-65 JwtAuthGuard
//     api/src/modulos/inventario/CTR_Alertas.ts    L26-82
//     api/src/modulos/inventario/SRV_AlertasService.ts 291 lineas
//     api/src/modulos/seguridad/SRV_BitacoraService.ts L14-39
//     BASE DE DATOS/schema.sql               L302-311, L331-339, L848-868
//
// QUE HACE ESTE CASO, Y POR QUE EL NOMBRE NO CUADRA
//   Escribe un numero entero en una columna: inventario_stock.
//   stock_minimo_alert, L271. Y lista los productos que estan por debajo
//   de ese numero, L206-207.
//
//   O sea que lo que hay es un UMBRAL POR PRODUCTO Y SUCURSAL. Y el
//   caso se llama Configurar Alertas, el endpoint se llama stock-minimo,
//   y la tabla del esquema se llama alertas_stock_config. De las tres
//   cosas que suenan a alerta, solo una es codigo, y es la que menos
//   suena.
//
//   Y no hay ninguna alerta en el proyecto: cero correos, cero
//   notificaciones, cero plantillas. El caso hace el numero y la lista.
//
//   42 mensajes. 10 lineas de vida. 8 hallazgos.
//   2 fragmentos: 1 alt y 1 loop, los dos contados antes de dibujar.
//
// LOS FRAGMENTOS: UN alt Y UN loop, Y LOS DOS SON REALES
//   Contado antes de escribir, con contadores, sobre las 291 lineas de
//   SRV_AlertasService:
//
//     for 1   while 0   Promise.all 0
//     if 19   throw 13   ternarios 17   map 3
//     dataSource.query 10   transaction 0   bitacora 1
//
//   El LOOP es el de configurar, L242-287, y es el unico bucle del
//   fichero. Una vuelta por producto, y en cada vuelta cinco cosas: dos
//   validaciones, la sucursal, un SELECT, un UPDATE y una bitacora.
//
//   El ALT es el if (esAdmin), que sale DOS VECES con la misma forma:
//
//     L124  obtenerOpciones, decide si lista todas las sucursales o la suya
//     L176  listar, decide lo mismo
//     L81   sucursalAplicar, decide si acepta la elegida o impone la suya
//
//   El que se dibuja es el de L176, de listar, porque es el que separa las
//   dos respuestas del GET. Los otros dos se dibujan como mensajes a si
//   mismo, con su linea, porque son el mismo caso de uso.
//
//   Y hay 19 if, y solo estos tres son ramas de verdad. Los otros 16 son
//   guardas: o se cumple y se sigue, o se lanza y se para. Y las 3 barras
//   de activacion, que no son un extra: la del controlador, la del
//   servicio, y la del bucle, que es lo que mas se parece a una activacion
//   anidada en este caso.
//
// LA Y EN NEGATIVO, QUE ES LO QUE HACE FALLAR ESTOS DIAGRAMAS
//   EA guarda Top y Bottom en NEGATIVO, porque trabaja en coordenadas
//   cartesianas con la Y creciendo hacia arriba. Si se le pasa la Y en
//   positivo no da error: simplemente no coloca nada, y todos los objetos
//   se quedan en el mismo punto. El diagrama sale amontonado.
//
//   Por eso en las dos funciones de colocacion de este script:
//
//     o.Top    = 0 - y;
//     o.Bottom = 0 - y - alto;
//
//   Y en el AddNew, en cambio, la Y va en POSITIVO, porque ahi EA ya la
//   convierte por su cuenta.
//
// SIN NINGUNA LLAMADA A SQL
//   Todo se coloca con el modelo de objetos. Nada de ExecuteSQL, Execute
//   ni SQLQuery.
//
// Autorreparable. Una instruccion por linea. Sin continuaciones con +.
// Sin operadores ternarios. Ninguna excepcion escapa.
// ================================================================

var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var TOTAL_CAB = 10;
var TOTAL_MSG = 42;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU19 Secuencia Alertas Stock Minimo";
var DIAG_NOMBRE = "CU19 Configurar Alertas Stock Minimo";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 150;

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

var CAB = [
    ["U", "ACTOR_Administrador", "Actor", "Lifeline", "Administrador", "quien configura", "Actor, no clase: es quien pulsa", "no es codigo, es la persona"],
    ["F", "AdminAlertas.tsx", "Object", "Lifeline", "AdminAlertas", "la pantalla de umbrales", "Boundary", "web/src/pages/admin/AdminAlertas.tsx"],
    ["H", "api.ts", "Object", "Lifeline", "api", "L562-600, seccion CU25", "Boundary", "web/src/lib/api.ts, seccion CU25 de alertas de stock minimo"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["P", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "anidado sobre el array", "Control", "api/src/main.ts, L22-43, es global"],
    ["C", "CTR_Alertas", "Object", "Lifeline", "AlertasController", "POST stock-minimo, L68-81", "Control", "api/src/modulos/inventario/CTR_Alertas.ts, L26-82, 90 lineas"],
    ["S", "SRV_AlertasService", "Object", "Lifeline", "AlertasService", "291 lineas, 1 bucle", "Control", "api/src/modulos/inventario/SRV_AlertasService.ts, 291 lineas"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar(), por producto", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "2 tablas vivas y 1 muerta", "Entity", "schema.sql: inventario_stock L302-311, sucursales, productos, producto_talla_color, tallas, colores; alertas_stock_config L331-339, sin usar"],
    ["X", "fn_detectar_stock_bajo", "Object", "Lifeline", "fn_detectar_stock_bajo", "schema L848-868, sin usar", "Entity", "BASE DE DATOS/schema.sql L848-868, lee alertas_stock_config y no tiene trigger"]
];

var MSG = [
    [1, "U", "F", "1. abre la pantalla de Alertas de Stock Mínimo.   El menu la declara en adminMenu L188-193: etiqueta Alertas de Stock Mínimo, cu CU25, permiso gestionar_inventario, implementado true", "S"],
    [2, "F", "F", "2. al montar pide las opciones, que son las sucursales y el catalogo de producto, talla y color.   Con eso se rellenan los dos desplegables de la pantalla", "S"],
    [3, "F", "F", "3. el permisoOk, L246, es permisos.includes('*') || permisos.includes('gestionar_inventario')   Y ese permiso NO esta en el seed de schema.sql   Es el mismo permiso que CU17 y CU18, y el mismo hueco", "S"],
    [4, "F", "H", "4. GET /api/v1/admin/inventario/alertas/opciones   api.ts, seccion CU25", "S"],
    [5, "H", "G", "5. con Authorization Bearer y credentials:'include'   Las tres rutas de esta pantalla pasan por el mismo guard", "S"],
    [6, "G", "D", "6. SELECT usuarios WHERE id_usuario = :sub   L44.   Una consulta por peticion, en el guard", "S"],
    [7, "G", "G", "7. [estado != 'activo'] 401 'Tu cuenta esta deshabilitada.'   L49-51", "S"],
    [8, "G", "P", "8. el guard no toca el cuerpo.   El pipe ve un cuerpo con un array de objetos dentro   CTR_Alertas L39-44, con @ValidateNested y @Type", "S"],
    [9, "P", "C", "9. ConfigurarAlertasRequest: un @IsArray y un @ValidateNested({ each: true }) sobre items   Y dentro, ItemStockMinimoRequest, L26-37: id_ptc @IsInt, id_sucursal @IsOptional @IsInt, stock_minimo @IsInt con @Min(0)", "S"],
    [10, "C", "S", "10. obtenerOpciones( currentUser )   L51-54", "S"],
    [11, "S", "D", "11. SELECT r.permisos_json FROM usuarios JOIN usuarios_roles JOIN roles WHERE u.id_usuario = $1   L47-53.   SIN getter, septima vez en diecinueve casos", "S"],
    [12, "S", "S", "12. [sin '*' ni 'gestionar_inventario'] 403   L62-67", "S"],
    [13, "S", "S", "13. y aqui aparece el ALT por primera vez, y es el patron del modulo: esAdministrador( usuario ), L122, y el if de L124 decide si lista todas las sucursales o solo la suya", "S"],
    [14, "S", "D", "14. rama 1 del alt, es admin: SELECT id_sucursal, nombre FROM sucursales WHERE LOWER(estado) = 'activa'   L126-130   Y despues el catalogo entero, L144-150, con los 4 JOIN   Consulta 2 de 5", "S"],
    [15, "S", "D", "15. rama 2 del alt, no es admin: sucursalEncargado( usuario ), L132, y L136-137 lo acota con WHERE id_sucursal = $1.   O sea que la lista de sucursales del desplegable tiene una entrada, y es la suya.   Consulta 3 de 5", "S"],
    [16, "S", "C", "16. { sucursales, productos }   y el desplegable de productos se llena con todos los activos, L149   Consulta 4 de 5", "A"],
    [17, "C", "H", "17. el JSON de las opciones   api.ts, seccion CU25", "A"],
    [18, "H", "F", "18. la respuesta   api.ts, seccion CU25", "A"],
    [19, "F", "H", "19. el usuario elige un producto, una sucursal y un numero, y pulsa guardar   POST /api/v1/admin/inventario/alertas/stock-minimo con { items: [ { id_ptc, id_sucursal, stock_minimo } ] }", "S"],
    [20, "H", "G", "20. con Authorization Bearer   Y el endpoint devuelve 200, no 201: el @HttpCode(HttpStatus.OK) de L69, porque no crea nada, cambia un numero", "S"],
    [21, "G", "D", "21. SELECT usuarios WHERE id_usuario = :sub   L44.   Segunda vez en el guard, y es la segunda peticion de la pantalla", "S"],
    [22, "G", "P", "22. el guard pasa   Y el pipe valida el array entero, con el @Min(0) del stock_minimo, L35", "S"],
    [23, "P", "C", "23. el pipe pasa el array ya validado, con un objeto por linea del formulario.   O sea que el pipe y el servicio validan lo mismo tres veces: el @IsInt del DTO, el Number.isInteger de L244 y el Math.trunc de L247", "S"],
    [24, "C", "S", "24. configurar( currentUser, items, request )   L75-80.   El controlador mapea el array linea a linea, L75-79, y solo copia tres campos de cada uno", "S"],
    [25, "S", "D", "25. SELECT r.permisos_json ... JOIN roles   L47-53   Consulta 5 de 5.   Y es la TERCERA vez que se ejecuta en esta sesion: la de opciones, la de listar y esta", "S"],
    [26, "S", "S", "26. [items vacio o no es un array] 422 'Debe enviar al menos un producto para configurar el stock mínimo.'   L237-239", "S"],
    [27, "S", "M", "27. y aqui empieza el LOOP, L242: for ( const item of items ).   El unico bucle de las 291 lineas del servicio.   Una vuelta por producto del formulario", "S"],
    [28, "S", "S", "28. vuelta 1 de las validaciones, que estan FUERA del bucle de consultas: [id_ptc no entero o <= 0] 422, y [stock_minimo no entero o < 0] 422 'El stock mínimo no puede ser negativo.'   L244-250", "S"],
    [29, "S", "M", "29. y aqui esta el hallazgo 2: sucursalAplicar( usuario, item.id_sucursal ), L252, se llama DENTRO del bucle.   O sea que la sucursal del usuario se resuelve una vez por producto, y con ella se repite la consulta de roles y la de su sucursal", "S"],
    [30, "M", "D", "30. dentro de sucursalAplicar, L79-102: SELECT permisos_json, y luego SELECT sucursal_id FROM usuarios_empleados, o el SELECT de la sucursal elegida.   O sea 2 o 3 consultas mas por producto.   Y en la linea 81 esta el TERCER if (esAdmin) del fichero, con la misma forma", "S"],
    [31, "M", "D", "31. SELECT id_stock, stock_minimo_alert, cantidad_disponible FROM inventario_stock WHERE id_ptc = $1 AND id_sucursal = $2   L259-261   Y OJO: cantidad_disponible se pide y NO se usa para nada.   El UPDATE de L271 no la toca", "S"],
    [32, "M", "S", "32. [no hay fila de inventario para ese par] 404 'No se encontró inventario para el producto en esa sucursal.'   L265-267   Y aqui se ve por que el bucle no tiene transaccion: este 404 puede dejar los N-1 anteriores ya escritos", "S"],
    [33, "M", "D", "33. UPDATE inventario_stock SET stock_minimo_alert = $1 WHERE id_stock = $2   L270-273   Escritura 1 de 1 por producto.   Y OJO: el WHERE es por id_stock, no por el valor anterior, asi que no protege de una escritura concurrente", "S"],
    [34, "M", "B", "34. bitacoraService.registrar( usuario.id_usuario, 'UPDATE', 'inventario_stock', 'Stock mínimo configurado para el producto #N (sucursal M): antes → despues', request, id_stock, { id_ptc, id_sucursal, stock_minimo_alert: anterior }, { .., stock_minimo_alert: nuevo } )   L275-284.   Una fila de bitacora POR PRODUCTO, y el oldData es real, sale del SELECT de L259", "S"],
    [35, "B", "D", "35. y aqui se escribe con repo.create y repo.save, por el repositorio de TypeORM, L27-38 de SRV_BitacoraService   NO es un INSERT por dataSource.query, y por eso no puede entrar en una transaccion aunque se quisiera", "A"],
    [36, "M", "S", "36. fin del bucle: actualizados += 1, L286.   Y aqui se repite la vuelta por cada producto del array, con sus 2 validaciones, su sucursal, su SELECT, su UPDATE y su bitacora   A", "A"],
    [37, "S", "C", "37. { detail: 'Umbral configurado.', actualizados }   L289   Y aqui esta el hallazgo 1: el texto no dice cuantos, y si el bucle fallo a la mitad no se devuelve nada de lo que ya se habia escrito", "A"],
    [38, "C", "H", "38. 200 OK con el JSON.   Y el detalle es SIEMPRE el mismo, haya escrito 1 producto o 20", "A"],
    [39, "F", "F", "39. la pantalla mete un toast con ese detalle, y recarga la lista.   Y la lista, L206-207, es: WHERE stock_minimo_alert > 0 AND cantidad_disponible <= stock_minimo_alert   O sea que solo sale lo que YA esta por debajo del umbral, que es lo unico que un administrador quiere ver", "S"],
    [40, "F", "U", "40. el administrador ve los umbrales que ha configurado, y en rojo los que estan por debajo.   Y si desactiva un producto, L203 lo saca de la lista sin avisar: el JOIN de productos lleva AND LOWER(p.estado) = 'activo'   Y no hay ninguna alerta, ningun correo y ninguna notificacion en todo el proyecto   A", "A"],
    [41, "U", "D", "41. y la parte del esquema que deberia avisar: fn_detectar_stock_bajo, L848-868, lee alertas_stock_config con su notificar_email y con su throttle de 24 horas de L866.   Y alertas_stock_config no la escribe nadie: cero apariciones en los 24 modulos y las 40 paginas   Y el propio schema.sql le asigna este caso, L846, con el titulo CU25/CU26", "S"],
    [42, "X", "X", "42. y esta funcion no tiene trigger: de los 2 del esquema, L620 y L654, ninguno es suyo   Y no la llama nadie, porque en todo el TypeScript hay cero llamadas a sp_ o fn_   Si alguien la llamara devolveria cero filas, porque la tabla que lee esta vacia y no hay quien la llene   Y su L865 compara is2.cantidad_disponible <= a.stock_minimo, que es la misma comparacion que hace la app en L207 con otra columna   Es la septima de las ocho funciones muertas que cuento en el hallazgo 7 de CU17", "S"]
];

var HAL = [
    ["1. El bucle escribe N filas y no hay transaccion", [
        "El hallazgo de fondo de este caso, y es de los que solo se ven",
        "mirando el bucle entero.",
        "",
        "configurar, L230-290. Y no hay ni una transaction en las 291",
        "lineas del fichero, contadas.",
        "",
        "  L235  exigirPermiso",
        "  L237  if (!Array.isArray(items) || items.length === 0) 422",
        "  L241  let actualizados = 0;",
        "  L242  for (const item of items) {",
        "  L244    if id_ptc no entero, 422",
        "  L248    if stock_minimo no entero o < 0, 422",
        "  L252    sucursalAplicar(usuario, item.id_sucursal)",
        "  L259    SELECT id_stock, stock_minimo_alert, cantidad_disponible",
        "  L265    if (!fila) 404",
        "  L270    UPDATE inventario_stock SET stock_minimo_alert = $1",
        "  L275    bitacoraService.registrar( ... )",
        "  L286    actualizados += 1;",
        "  L287  }",
        "  L289  return { detail: 'Umbral configurado.', actualizados };",
        "",
        "O sea que por producto hay un SELECT, un UPDATE y una escritura de",
        "bitacora, y nada de eso esta en una transaccion.",
        "",
        "EL ESCENARIO, con 20 productos en el formulario:",
        "",
        "  vuelta  1 a 14   se escriben las 14 filas de inventario_stock",
        "                  y las 14 filas de bitacora",
        "  vuelta 15       un 404 de L266, porque ese par producto-sucursal",
        "                  no tiene fila en inventario_stock",
        "  resultado       14 filas escritas, y un 422/404 al cliente",
        "",
        "Y lo que ve el administrador es el mensaje de error, y la pantalla",
        "NO recarga la lista, porque solo recarga en el camino feliz de L597.",
        "O sea que la base de datos tiene 14 umbrales que el usuario no cree",
        "haber puesto, y la lista le sigue enseñando los de antes.",
        "",
        "Y EL AGRAVANTE: la bitacora va por el repositorio de TypeORM.",
        "SRV_BitacoraService L27-38, repo.create y repo.save. O sea que",
        "aunque metieras el await de L275 dentro de una transaccion, esa",
        "escritura SEGUIRIA fuera, porque repo.save usa su propia",
        "conexion. Es el mismo problema que ------------- de CU16, y aqui",
        "se repite en cada vuelta del bucle.",
        "",
        "LO QUE HARIA FALTA: un dataSource.transaction con el bucle",
        "dentro, como el de crearOrdenCompra en SRV_ComprasService L390,",
        "que es la unica transaccion de un caso de escritura del proyecto",
        "que se ha visto. Y para la bitacora, em.manager.save."
    ]],
    ["2. sucursalAplicar se llama dentro del bucle", [
        "Un detalle de rendimiento que se ve al mirar donde esta la",
        "llamada, y que CU18 no tenia.",
        "",
        "configurar, L252:",
        "",
        "  const idSucursal = await this.sucursalAplicar(usuario, item.id_sucursal);",
        "",
        "O sea que la resolucion de la sucursal esta DENTRO del bucle. Y",
        "sucursalAplicar, L79-102, hace:",
        "",
        "  L80  esAdministrador(usuario)",
        "       y eso es cargarPermisos, L45-55, que es un SELECT de",
        "       usuarios con 2 JOIN a roles",
        "  L81  if (esAdmin) {",
        "  L86    SELECT id_sucursal FROM sucursales WHERE id_sucursal = $1",
        "  L94  const sucursal = await this.sucursalEncargado(usuario)",
        "       y eso es otro SELECT, sobre usuarios_empleados, L69-78",
        "",
        "ASI QUE EL COSTE POR PRODUCTO, con 20 productos:",
        "",
        "  el SELECT de la fila          1",
        "  el SELECT de permisos_json    1     <- el MISMO para los 20",
        "  el SELECT de la sucursal      0 o 1",
        "  el SELECT de usuarios_empleados  0 o 1   <- el MISMO para los 20",
        "  el UPDATE                     1",
        "  la escritura de bitacora      1",
        "",
        "O sea 4 o 6 consultas por producto, de las cuales 2 o 2 son",
        "SIEMPRE IGUALES porque no dependen del producto. Con 20 productos",
        "son 40 o 60 SELECT para cambiar 20 numeros enteros.",
        "",
        "Y LA FORMA DE ARREGLARLO, y es la misma de CU18: sacar el",
        "sucursalEncargado y el esAdministrador FUERA del bucle, resolver",
        "la sucursal una vez, y pasar el numero ya resuelto al DTO. O",
        "aceptarlos como segundo argumento, que es lo que hace esAdministrador",
        "en CU18 con los permisos ya cargados... que tampoco lo acepta.",
        "",
        "Y UN EFECTO SECUNDARIO QUE NO ES SOLO DE RENDIMIENTO: como la",
        "sucursal se comprueba en cada vuelta, un usuario que pierde la",
        "asignacion a mitad del bucle tendria la mitad de los umbrales",
        "escritos. Es poco probable, pero es la misma ventana que el",
        "hallazgo 1."
    ]],
    ["3. El esquema tiene una tabla de alertas, y no la usa nadie", [
        "El hallazgo transversal, ya visto en CU16 con la bitacora y en",
        "CU17 con las recepciones, y aqui es el caso central.",
        "",
        "LA TABLA, schema L331-339, con 7 columnas:",
        "",
        "  id_config, id_ptc, id_categoria, id_sucursal,",
        "  stock_minimo, notificar_email, ultima_notificacion",
        "",
        "YAppearance en ficheros de TypeScript: CERO. Contados los 24",
        "modulos y las 40 paginas. Ni un INSERT, ni un UPDATE, ni un",
        "SELECT, ni el nombre de la tabla en un comentario.",
        "",
        "LO QUE USA LA APLICACION, en cambio, es otra columna de otra",
        "tabla:",
        "",
        "  inventario_stock L309   stock_minimo_alert INTEGER DEFAULT 0",
        "",
        "Y ese es el unico sitio por el que pasa todo el caso de uso:",
        "",
        "  L198  s.stock_minimo_alert,          en el SELECT de listar",
        "  L206  WHERE s.stock_minimo_alert > 0",
        "  L207    AND s.cantidad_disponible <= s.stock_minimo_alert",
        "  L259  SELECT .. stock_minimo_alert,  antes de escribir",
        "  L271  UPDATE inventario_stock SET stock_minimo_alert = $1",
        "",
        "Y notificar_email y ultima_notificacion, CERO apariciones en",
        "TypeScript, las dos. O sea que la parte de la tabla que explica",
        "el nombre 'alertas' es la que no existe, y la que existe es la que",
        "no suena a alerta.",
        "",
        "ADEMAS, y esto es lo que mas duele: el nombre de la columna de la",
        "tabla muerta y el de la viva se parecen y no son lo mismo.",
        "",
        "  alertas_stock_config.stock_minimo         INTEGER",
        "  inventario_stock.stock_minimo_alert       INTEGER",
        "",
        "Un INVENTARIO lo tiene en su fila y se llama _alert; una tabla de",
        "CONFIGURACION lo tiene en su fila y se llama a secas. Los dos",
        "INTEGER, los dos el minimo de un producto. Y solo uno se usa."
    ]],
    ["4. fn_detectar_stock_bajo lee la tabla muerta, y no tiene trigger", [
        "La septima de las ocho funciones del esquema, y la unica que",
        "muere dos veces.",
        "",
        "fn_detectar_stock_bajo, schema L848-868, entera. Y su L858:",
        "",
        "  FROM alertas_stock_config a",
        "  JOIN inventario_stock is2",
        "    ON is2.id_ptc = a.id_ptc AND is2.id_sucursal = a.id_sucursal",
        "",
        "O sea que hace la MISMA comparacion que la app, y con OTRA columna:",
        "",
        "  la funcion  L865  is2.cantidad_disponible <= a.stock_minimo",
        "  la app      L207  s.cantidad_disponible  <= s.stock_minimo_alert",
        "",
        "Dos comparaciones identicas, dos columnas distintas, dos tablas",
        "distintas. Y la de la app es la que se ve en pantalla.",
        "",
        "ADEMAS la funcion tiene TRES condiciones que la app no tiene:",
        "",
        "  L864  a.notificar_email = true",
        "  L866  a.ultima_notificacion IS NULL",
        "        OR a.ultima_notificacion < NOW() - INTERVAL '24 hours'",
        "",
        "O sea que la funcion estaba hecha para NO AVISAR DOS VECES en 24",
        "horas, con una columna para la ultima vez que se aviso. Y eso es",
        "justamente el throttle de notificaciones, que es la razon de ser de",
        "una alerta. Y la app no tiene nada de eso, porque no hay nada a lo",
        "que throttlear: no hay correo.",
        "",
        "Y LA FUNCION MUERE DOS VECES:",
        "",
        "  1  no tiene trigger. De los 2 triggers del esquema, L620 y L654,",
        "     ninguno es suyo. O sea que no hay ningun INSERT, UPDATE ni",
        "     DELETE que la dispare",
        "  2  no la llama nadie. De los 24 modulos y las 40 paginas, cero",
        "     llamadas a sp_ o fn_",
        "",
        "O sea que ni siquiera como funcion la usaria nadie. Y si alguien",
        "la llamara, devolveria cero filas, porque alertas_stock_config esta",
        "vacia y no hay quien la llene."
    ]],
    ["5. El caso se llama Alertas y no hay ninguna alerta", [
        "El hallazgo de nombre, y hay que decirlo porque el nombre del",
        "caso es lo primero que se lee.",
        "",
        "TRES COSAS QUE SUENAN A ALERTA:",
        "",
        "  el nombre del caso     Configurar Alertas de Stock Mínimo",
        "  la tabla del esquema   alertas_stock_config",
        "  la función del esquema fn_detectar_stock_bajo, con su",
        "                       notificar_email y su throttle de 24 horas",
        "",
        "Y UNA COSA QUE NO SUENA:",
        "",
        "  el endpoint            POST /admin/inventario/alertas/stock-minimo",
        "  la columna que se usa  inventario_stock.stock_minimo_alert",
        "  lo que hace el metodo  UPDATE de un entero",
        "",
        "O sea que el endpoint, que es lo que de verdad define el caso, se",
        "llama stock-minimo. Y hace lo que dice: poner un numero.",
        "",
        "Y LO QUE NO HAY, contado en los 24 modulos y las 40 paginas:",
        "",
        "  correos        cero. No hay sendMail, ni nodemailer, ni ningun",
        "                 servicio de correo en el modulo de inventario",
        "  notificaciones cero. No hay NotificationService, ni push, ni",
        "                 websocket, ni Server-Sent Events",
        "  plantillas     cero. No hay ninguna cadena con el nombre de una",
        "                 alerta ni el texto de un aviso",
        "  disparos       CERO PARA EL STOCK, pero no en general. El proyecto",
        "                 SI tiene un temporizador: SchedulerService, en el modulo",
        "                 de respaldos, L12, con un setInterval de 60_000 que llama",
        "                 a revisar(). O sea que hay un precedent, y en el sitio",
        "                 correcto. Lo que no hay es ningun temporizador que mire",
        "                 el stock, y ningun modulo ScheduleModule en app.module",
        "                 L22-52, que lo declara.",
        "",
        "O sea que este caso configura un numero y una lista. Lo que hace",
        "con ese numero, si alguien mira la pantalla y lo ve en rojo, es",
        "cosa de la persona que la mira.",
        "",
        "Y LA CONSECUENCIA PRACTICA: el 'estado' de una alerta en este",
        "proyecto no es un dato, es una comparacion que se hace en el",
        "SELECT de L207, en el momento de listar. No hay ninguna fila que",
        "diga que este producto esta en alerta, porque no hay donde",
        "guardarla. Y por eso el listado tiene que recalcularlo en cada",
        "peticion, con un JOIN de 5 tablas, para pintar una tabla."
    ]],
    ["6. La vista de alertas se vacia sola si desactivas el producto", [
        "Un detalle del SELECT de L196-211, que parece una decision",
        "correcta y tiene un coste.",
        "",
        "  L197  SELECT s.id_stock, s.id_ptc, s.id_sucursal, nombre_sucursal,",
        "  L198         s.cantidad_disponible, s.stock_minimo_alert,",
        "  L199         nombre_producto, talla, color",
        "  L200  FROM inventario_stock s",
        "  L201  JOIN sucursales suc",
        "  L202  JOIN producto_talla_color ptc",
        "  L203  JOIN productos p ON p.id_producto = ptc.id_producto",
        "                        AND LOWER(p.estado) = 'activo'",
        "  L204  JOIN tallas t",
        "  L205  JOIN colores c",
        "  L206  WHERE s.stock_minimo_alert > 0",
        "  L207    AND s.cantidad_disponible <= s.stock_minimo_alert",
        "  L208    AND ($1::int IS NULL OR s.id_sucursal = $1)",
        "  L209  ORDER BY suc.nombre, p.nombre, t.orden, c.nombre",
        "",
        "EL FILTRO DE L203, y el resto de la consulta esta bien escrito:",
        "cinco JOIN, el de productos con la condicion de activo PEGADA al",
        "ON y no al WHERE, que es lo correcto.",
        "",
        "EL PROBLEMA: si un producto esta en alerta y alguien lo desactiva,",
        "el JOIN de L203 deja de casar y la fila desaparece de la lista.",
        "Sin error, sin aviso, y sin dejar rastro. O sea que un producto",
        "puede quedarse con stock 2 y umbral 10, con la alerta puesta, y",
        "desaparecer del sitio donde se ven las alertas.",
        "",
        "Y PUEDE PASAR: el estado de un producto se cambia en otro caso de",
        "uso, el de catalogo. Y el efecto es silencioso.",
        "",
        "LO QUE PASARIA si se invirtiera el JOIN a LEFT JOIN: la alerta",
        "seguiria viéndose, con el nombre del producto y un aviso de que",
        "esta inactivo. Que es mas informacion, no menos.",
        "",
        "Y EL OTRO FILTRO, L206-207, que es el que hace que la pantalla",
        "sea util: solo sale lo que YA esta por debajo del umbral. O sea",
        "que no hay forma de ver los umbrales que estan bien, ni de",
        "encontrar un producto para configurarle uno. Eso se resuelve",
        "viendo el catalogo de productos del desplegable, que es lo que",
        "hace la pantalla."
    ]],
    ["7. El DTO, el servicio y el pipe validan lo mismo tres veces", [
        "Tres capas de validacion para un entero, y las tres hacen algo",
        "distinto.",
        "",
        "CAPA 1, el DTO, CTR_Alertas L26-37:",
        "",
        "  @IsInt()                            id_ptc",
        "  @IsOptional() @IsInt()              id_sucursal",
        "  @IsInt() @Min(0)                    stock_minimo",
        "  @IsArray() @ValidateNested({ each: true })   en el padre, L40-42",
        "",
        "CAPA 2, el servicio, L244-250:",
        "",
        "  const idPtc = Number(item.id_ptc);",
        "  if (!Number.isInteger(idPtc) || idPtc <= 0)  422",
        "  const stockMinimo = Math.trunc(Number(item.stock_minimo));",
        "  if (!Number.isInteger(stockMinimo) || stockMinimo < 0)  422",
        "",
        "CAPA 3, otra vez en el servicio pero para la sucursal, L253-255:",
        "",
        "  if (idSucursal == null)  422 'Debe especificar la sucursal del producto.'",
        "",
        "EL PROBLEMA DE LA CAPA 2, y es de logica, no de estilo:",
        "",
        "  Math.trunc(Number(item.stock_minimo))",
        "",
        "O sea que PRIMERO convierte a entero, y DESPUES comprueba que es",
        "un entero entero. Un 3.7 se convierte en 3, y el Number.isInteger",
        "de L248 da true, y pasa. O sea que el Math.trunc de L247 hace que",
        "la validacion de L248 no pueda fallar por la parte decimal.",
        "",
        "Y el @Min(0) del DTO lo impide, asi que en el camino normal no",
        "pasa. Pero si alguien hace un POST a mano con 3.7, el DTO lo",
        "rechaza con el array de mensajes de CU12, y si el DTO no estuviera",
        "el servicio lo aceptaria y guardaria un 3 en silencio.",
        "",
        "COMPARADO CON LOS OTROS CASOS, que es lo que hace el hallazgo",
        "interesante:",
        "",
        "  CU17  parseIntId valida entero y mayor que cero, y NO trunca",
        "  CU18  parseIntId, lo mismo",
        "  CU19  Math.trunc, y luego valida que ya era entero",
        "",
        "O sea que CU19 es el unico de los tres que primero redondea y",
        "despues comprueba. En los otros dos, un 3.7 da 400. Aqui daria",
        "422 del DTO, o pasaria si el DTO no estuviera.",
        "",
        "Y LA TERCERA CAPA, L253, tiene un detalle bueno: comprueba que la",
        "sucursal NO SEA NULA antes de usarla, con un 422 que lo dice. En",
        "el bucle, y por cada producto."
    ]],
    ["8. Lo que esta bien, que es bastante en este caso", [
        "Hay que decirlo, porque el inventario es el modulo mas",
        "trabajado del proyecto y este caso lo confirma.",
        "",
        "1. EL FILTRO DE SUCURSAL, y sale por el camino corto. L79-102 y",
        "   L176-194 tienen los dos ramas, con mensajes distintos:",
        "",
        "     si es admin:   L82  sin sucursal, 422",
        "                     L86  comprueba que la sucursal exista, L89 404",
        "     si no es admin: L95  sin sucursal asignada, 403",
        "                     L98  si pide otra, L99 403 'No tienes permisos",
        "                         para gestionar alertas de esta sucursal.'",
        "",
        "   Y la palabra 'gestionar' en ese 403, que es el mismo permiso",
        "   que pide la operacion. O sea que el mensaje es exacto.",
        "",
        "2. EL FILTRO DE LISTAR, L206-208, que es el que hace util la",
        "   pantalla:",
        "",
        "     WHERE s.stock_minimo_alert > 0",
        "       AND s.cantidad_disponible <= s.stock_minimo_alert",
        "       AND ($1::int IS NULL OR s.id_sucursal = $1)",
        "",
        "   La tercera linea es la elegante: un solo parametro que puede",
        "   ser NULL, y el filtro se mueve solo. Es el mismo patron que",
        "   usaron en el kardex, CU18 L236-237, y en obtenerOpciones de",
        "   compras, CU16. Tres casos seguidos con la misma tecnica.",
        "",
        "3. EL oldData DE LA BITACORA ES REAL. L268:",
        "",
        "     const anterior = Number(fila.stock_minimo_alert ?? 0);",
        "",
        "   Y L282 lo mete en el registro de auditoria. O sea que el",
        "   'antes' sale del SELECT de L259, no es un literal afirmado.",
        "   CU06 y CU07 hacen lo contrario, y CU15 lo hace bien, y aqui",
        "   tambien. Y el mensaje de L279 lleva los dos numeros:",
        "",
        "     `Stock mínimo configurado para el producto #${idPtc}",
        "      (sucursal ${idSucursal}): ${anterior} → ${stockMinimo}`",
        "",
        "   Con la flecha, que es el signo de cambio en una cadena. Es lo",
        "   unico del proyecto que se atreve.",
        "",
        "4. Y EL 404 DE L266, que es una validacion de negocio escondida en",
        "   un SELECT que devuelve cero filas. O sea que si un producto no",
        "   tiene fila en inventario_stock para esa sucursal, el caso lo",
        "   dice con un 404 y un texto claro, en vez de dejar que el UPDATE",
        "   no afecte a nada y devolver exito. CU16 hacia eso, con el",
        "   RETURNING vacio y un throw new Error de 500."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU19."; } catch (e) { }
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
// LOS DOS FRAGMENTOS Y LAS TRES BARRAS
//
// EA no coloca fragmentos de forma fiable por script, asi que lo que hay
// aqui son FORMAS con su etiqueta. Cada una va en try/catch y cuenta las
// que ha conseguido poner, y el informe final lo dice.
//
// Este caso tiene UN alt (los tres if de esAdmin, y se dibuja el de L176)
// y UN loop (el de L242). Se ha contado antes de escribir, con contadores.
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

function colocarFragmentos(diag) {
    var xS = xDe(indiceDe("S"));
    var xD = xDe(indiceDe("D"));
    var xM = xDe(indiceDe("M"));
    // El alt de L176, el de listar, que separa las dos respuestas del GET.
    fragmento(diag, "alt [esAdministrador]", xD, xS, Y_MSG0 + 16 * PASO_MSG - 34, Y_MSG0 + 18 * PASO_MSG + 16);
    // El loop de L242, una vuelta por producto, con SELECT, UPDATE y bitacora.
    fragmento(diag, "loop [por cada producto del formulario]", xS, xD, Y_MSG0 + 26 * PASO_MSG - 34, Y_MSG0 + 35 * PASO_MSG + 16);
    activacion(diag, xDe(indiceDe("C")), Y_MSG0 + 7 * PASO_MSG - 26, Y_MSG0 + 37 * PASO_MSG + 12);
    activacion(diag, xS, Y_MSG0 + 9 * PASO_MSG - 26, Y_MSG0 + 36 * PASO_MSG + 12);
    activacion(diag, xM, Y_MSG0 + 28 * PASO_MSG - 26, Y_MSG0 + 35 * PASO_MSG + 12);
}

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 860) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU19  Configurar Alertas de Stock Mínimo   ·   en el código del proyecto este caso es CU25"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 860) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseño de caso de uso, sección 3.3.2.1.  10 líneas de vida, 42 mensajes, 8 hallazgos, 1 alt y 1 loop, y 3 barras de activación."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su línea de vida. El tiempo baja. Este caso tiene un alt, el if de esAdmin de L176, que sale tres veces en el servicio con la misma forma, y un loop, el de L242, que es el único bucle del fichero y mete un SELECT, un UPDATE y una bitácora por producto. Se ha contado antes de dibujar: cero while, cero Promise.all, y de los 19 if solo tres son ramas de verdad. La línea de vida fn_detectar_stock_bajo es la función del esquema que lee la tabla de alertas, y ni tiene trigger ni la llama nadie."; } catch (e) { }
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
// LOS 40 MENSAJES
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
    N.push("CU19  Configurar Alertas de Stock Mínimo.  Diseño de caso de uso, sección 3.3.2.1.");
    N.push("");
    N.push("AVISO DE NUMERACION, IGUAL QUE EN CU17 Y CU18");
    N.push("");
    N.push("  Este caso es CU19 en el documento y CU25 en el código del proyecto.");
    N.push("");
    N.push("    web/src/data/adminMenu.ts L190      cu: 'CU25',");
    N.push("    web/src/lib/api.ts L562            // CU25 - Alertas de stock mínimo");
    N.push("    BASE DE DATOS/schema.sql L846      -- 7. FUNCIÓN: Detectar stock bajo (CU25/CU26)");
    N.push("");
    N.push("  Y OJO CON ESTO, que es del hallazgo 4: la función del esquema que se le");
    N.push("  asigna a este caso se llama fn_detectar_stock_bajo, L848, lee la tabla");
    N.push("  alertas_stock_config, y no tiene trigger ni la llama nadie. O sea que el");
    N.push("  CU25 que el propio esquema se asigna NO es el CU25 que el menú declara.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 líneas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Administrador   «actor»     quien configura");
    N.push("    AdminAlertas.tsx      «boundary»  la pantalla de umbrales");
    N.push("    api.ts                «boundary»  sección CU25");
    N.push("    JwtAuthGuard          «control»   dependencias.ts, L15-65");
    N.push("    ValidationPipe        «control»   main.ts, L22-43, con ValidateNested sobre el array");
    N.push("    CTR_Alertas           «control»   L26-82, POST stock-minimo con @HttpCode(OK)");
    N.push("    SRV_AlertasService    «control»   291 líneas, 10 consultas, 1 bucle, 0 transacciones");
    N.push("    SRV_BitacoraService   «control»   registrar(), una vez POR PRODUCTO");
    N.push("    PostgreSQL            «entity»    inventario_stock L302-311 y 6 tablas más");
    N.push("    fn_detectar_stock_bajo «entity»   schema L848-868, sin trigger y sin llamadas");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes. 11 van a la base de datos, 9 son mensajes a sí mismo, 8 son retornos,");
    N.push("  6 llevan la guarda escrita entre corchetes, y 3 tocan al actor.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("LOS DOS FRAGMENTOS, Y LOS CONTEOS QUE LOS RESPALDAN");
    N.push("");
    N.push("  Contados ANTES de dibujar, con contadores, sobre las 291 líneas de SRV_AlertasService:");
    N.push("");
    N.push("    for 1   while 0   Promise.all 0   transaction 0");
    N.push("    if 19   throw 13   ternarios 17   map 3   dataSource.query 10");
    N.push("");
    N.push("  El LOOP es el de L242, for (const item of items), y es el único bucle del fichero.");
    N.push("  Una vuelta por producto del formulario, y en cada vuelta hay un SELECT, un UPDATE y");
    N.push("  una escritura de bitácora. Se dibuja sobre los mensajes 27 a 36.");
    N.push("");
    N.push("  El ALT es el if (esAdmin), que sale TRES VEZES en el servicio con la misma forma:");
    N.push("");
    N.push("    L124  obtenerOpciones   si lista todas las sucursales o solo la suya");
    N.push("    L176  listar            si lo mismo, y es el que separa las dos respuestas del GET")
    N.push("    L81   sucursalAplicar    si acepta la sucursal elegida o impone la del usuario");
    N.push("");
    N.push("  Se dibuja el de L176. Los otros dos van como mensajes a sí mismo, con su línea, porque");
    N.push("  son el mismo caso de uso y es el mismo condicional.");
    N.push("");
    N.push("  Y DE LOS 19 if, SOLO 3 son ramas de verdad. Los otros 16 son guardas: o se cumple y se");
    N.push("  sigue, o se lanza y se para. Por eso hay un alt y no cinco.");
    N.push("");
    N.push("  Las 3 barras de activación, que no son un extra: la del controlador, la del servicio,");
    N.push("  y la del bucle, que es lo que más se parece a una activación anidada en este caso.");
    N.push("");
    N.push("EL HALLAZGO 1: EL BUCLE ESCRIBE N FILAS Y NO HAY TRANSACCION");
    N.push("");
    N.push("  configurar va de L230 a L290, y en las 291 líneas del fichero hay CERO");
    N.push("  transaction. Con 20 productos en el formulario:");
    N.push("");
    N.push("    vueltas 1 a 14    se escriben 14 filas de inventario_stock y 14 de bitácora");
    N.push("    vuelta 15        un 404 de L266, porque ese par no tiene fila en inventario_stock");
    N.push("    resultado        14 filas escritas y un error al cliente");
    N.push("");
    N.push("  Y lo que ve el administrador es el error, y la pantalla NO recarga la lista, porque");
    N.push("  solo recarga en el camino feliz. O sea que la base de datos tiene 14 umbrales que el");
    N.push("  usuario no cree haber puesto.");
    N.push("");
    N.push("  Y EL AGRAVANTE: la bitácora va por el repositorio de TypeORM, SRV_BitacoraService");
    N.push("  L27-38, repo.create y repo.save. O sea que aunque metieras el await de L275 dentro de");
    N.push("  una transacción, esa escritura SEGUIRÍA fuera, porque repo.save usa su propia");
    N.push("  conexión. Es el mismo problema que CU16, y aquí se repite en cada vuelta del bucle.");
    N.push("");
    N.push("  Lo que haría falta: un dataSource.transaction con el bucle dentro, como el de");
    N.push("  crearOrdenCompra en SRV_ComprasService L390, y em.manager.save para la bitácora.");
    N.push("");
    N.push("EL HALLAZGO 2: sucursalAplicar SE LLAMA DENTRO DEL BUCLE");
    N.push("");
    N.push("  L252, una vez por producto. Y sucursalAplicar, L79-102, hace esAdministrador, que es");
    N.push("  el SELECT de roles, y luego O el SELECT de la sucursal elegida O el de");
    N.push("  usuarios_empleados. O sea 2 o 3 consultas por producto, de las cuales 2 son siempre");
    N.push("  iguales porque no dependen del producto. Con 20 productos, 40 o 60 SELECT para cambiar");
    N.push("  20 números enteros.");
    N.push("");
    N.push("  Y un efecto que no es solo de rendimiento: como la sucursal se comprueba en cada");
    N.push("  vuelta, un usuario que pierda la asignación a mitad del bucle tendría la mitad de los");
    N.push("  umbrales escritos. Es la misma ventana que el hallazgo 1.");
    N.push("");
    N.push("EL HALLAZGO 3: LA TABLA DE ALERTAS NO LA USA NADIE");
    N.push("");
    N.push("  alertas_stock_config, schema L331-339, 7 columnas: id_config, id_ptc,");
    N.push("  id_categoria, id_sucursal, stock_minimo, notificar_email, ultima_notificacion.");
    N.push("");
    N.push("  Apariciones en ficheros de TypeScript: CERO. Contados los 24 módulos y las 40");
    N.push("  páginas. Ni un INSERT, ni un UPDATE, ni un SELECT, ni el nombre en un comentario.");
    N.push("");
    N.push("  Y notificar_email y ultima_notificacion, CERO entre las dos. O sea que la parte de la");
    N.push("  tabla que explica el nombre 'alertas' es la que no existe, y la que existe es la que");
    N.push("  no suena a alerta: inventario_stock.stock_minimo_alert, L309, que es un INTEGER con");
    N.push("  DEFAULT 0 y que va en su propia fila de inventario.");
    N.push("");
    N.push("  Y EL NOMBRE PARECE Y NO ES: alertas_stock_config.stock_minimo e");
    N.push("  inventario_stock.stock_minimo_alert. Los dos INTEGER, los dos el mínimo de un");
    N.push("  producto, y solo uno se usa.");
    N.push("");
    N.push("EL HALLAZGO 4: fn_detectar_stock_bajo LEE ESA TABLA Y NO TIENE TRIGGER");
    N.push("");
    N.push("  L848-868, y su L858 hace FROM alertas_stock_config. O sea que hace la MISMA");
    N.push("  comparación que la app, con otra columna:");
    N.push("");
    N.push("    la función  L865  is2.cantidad_disponible <= a.stock_minimo");
    N.push("    la app      L207  s.cantidad_disponible  <= s.stock_minimo_alert");
    N.push("");
    N.push("  Y la función tiene TRES condiciones que la app no tiene: notificar_email = true, y el");
    N.push("  throttle de L866, que es la condición de no avisar dos veces en 24 horas. O sea que");
    N.push("  estaba hecha para no spamear, que es la razón de ser de una alerta. Y la app no");
    N.push("  tiene nada de eso, porque no hay correo a quien throttlear.");
    N.push("");
    N.push("  Y MUERE DOS VECES: no tiene trigger, porque de los 2 del esquema ninguno es suyo, y");
    N.push("  no la llama nadie. Y si alguien la llamara devolvería cero filas, porque la tabla");
    N.push("  que lee está vacía y no hay quien la llene.");
    N.push("");
    N.push("EL HALLAZGO 5: EL CASO SE LLAMA ALERTAS Y NO HAY NINGUNA ALERTA");
    N.push("");
    N.push("  TRES COSAS QUE SUENAN A ALERTA: el nombre del caso, la tabla alertas_stock_config,");
    N.push("  y la función fn_detectar_stock_bajo con su notificar_email.");
    N.push("");
    N.push("  UNA QUE NO SUENA: el endpoint, POST /admin/inventario/alertas/stock-minimo, que es lo");
    N.push("  que de verdad define el caso. Y hace lo que dice: poner un número.");
    N.push("");
    N.push("  Y LO QUE NO HAY, contado: correos cero (no hay sendMail ni nodemailer en el módulo");
    N.push("  de inventario), notificaciones cero, plantillas cero, y NINGÚN temporizador que mire el");
    N.push("  stock. Pero el proyecto SÍ tiene un temporizador, y es un precedente: SchedulerService, en");
    N.push("  el módulo de respaldos, L12, con un setInterval de 60_000 que llama a revisar(). O sea que");
    N.push("  la pieza de disparar falta, y el patrón de disparar ya está escrito en otro módulo. Este");
    N.push("  caso configura un número y una lista.");
    N.push("");
    N.push("  LA CONSECUENCIA: el estado de una alerta aquí no es un dato, es una comparación que");
    N.push("  se hace en el SELECT de L207 en el momento de listar. No hay fila que diga que este");
    N.push("  producto está en alerta, porque no hay dónde guardarla. Y por eso el listado tiene");
    N.push("  que recalcularlo en cada petición, con un JOIN de 5 tablas, para pintar una tabla.");
    N.push("");
    N.push("LO BUENO, Y HAY BASTANTE");
    N.push("");
    N.push("  - El filtro de sucursal sale por el camino corto, L79-102 y L176-194, y el 403 de");
    N.push("    L99 dice 'No tienes permisos para gestionar alertas de esta sucursal', que es el");
    N.push("    mismo permiso que pide la operación. El mensaje es exacto.");
    N.push("  - El filtro de L206-208 usa el parámetro NULL que mueve el filtro solo, y es el");
    N.push("    mismo patrón que el kardex de CU18 L236-237 y el de obtenerOpciones de CU16.");
    N.push("  - El oldData de la bitácora es REAL, L268, y el mensaje de L279 lleva los dos");
    N.push("    números con una flecha en medio: 'antes → después'. La flecha aparece en tres");
    N.push("    ficheros del proyecto, y hay que ser exacto: aquí es la única vez que está en el");
    N.push("    texto de una BITÁCORA. La otra es un log del servicio de respaldos,");
    N.push("    SRV_StorageService L25, y la tercera un comentario de código en Producto.tsx L240.");
    N.push("    O sea que para poner una flecha en un texto de auditoría no hay antecedente.");
    N.push("  - El @Min(0) del DTO y el 404 de L266, que es una validación de negocio escondida en");
    N.push("    un SELECT que devuelve cero filas. CU16 hacía eso con un RETURNING vacío y un 500.");
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  CU18 counted cero UPDATE y cero DELETE sobre movimientos_inventario, y dijo que eso");
    N.push("  es lo que hace que el saldo almacenado del kardex sea fiable. Este caso es la otra");
    N.push("  cara de la misma tabla: aquí sí se UPDATEa inventario_stock, y lo que se cambia es");
    N.push("  la columna que el kardex no lee. O sea que el umbral no aparece en el historial.");
    N.push("");
    N.push("  Y CU17, CU16 y CU14 comparten el hueco del permiso: gestionar_inventario,");
    N.push("  gestionar_recepciones y consultar_kardex no están en el seed. Este caso vuelve a");
    N.push("  pedir el primero, y CU05 ya demostró que el asterisco del Administrador no se puede");
    N.push("  editar desde la aplicación. O sea que en la práctica, solo el Administrador entra.");
    N.push("");
    N.push("SOBRE LA COLOCACIÓN DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Anchura: las diez cabeceras separadas " + PASO + " px, con " + ANCHO_CAB + " de ancho. Quedan");
    N.push("  65 px entre una y otra. Altura: " + PASO_MSG + " px por mensaje. El mensaje 1 cae en la y " + Y_MSG0);
    N.push("  y el " + TOTAL_MSG + " en la y " + (Y_MSG0 + (TOTAL_MSG - 1) * PASO_MSG) + ".");
    N.push("");
    N.push("  Un detalle que hizo fallar estos diagramas diez veces y que conviene no");
    N.push("  olvidar: EA guarda Top y Bottom en NEGATIVO, porque trabaja en");
    N.push("  coordenadas cartesianas con la Y creciendo hacia arriba. Si se le pasa");
    N.push("  la Y en positivo no da error, simplemente no coloca nada y todos los");
    N.push("  objetos se quedan en el mismo punto. En las dos funciones de colocación");
    N.push("  de este script está escrito o.Top = 0 - y y o.Bottom = 0 - y - alto. En el");
    N.push("  AddNew, en cambio, la Y va en positiva, porque ahí EA ya la convierte.");
    N.push("");
    N.push("  Comprobación de esta ejecución, leída del modelo de objetos:");
    N.push("    objetos en el diagrama: " + ch.leidos);
    N.push("    con la Y crecida, o sea colocados: " + ch.bien);
    N.push("    mensajes dibujados: " + r.puestos + " de " + TOTAL_MSG);
    N.push("    mensajes a sí mismo: " + r.autodestino);
    N.push("    conectores en el diagrama: " + r.enDiagrama);
    N.push("    MARCOS de fragmento colocados: " + MARCOS_PUESTOS + " de 2");
    N.push("    BARRAS de activación colocadas: " + BARRAS_PUESTAS + " de 3");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU19 Secuencia", 0); } catch (e) { }
        return;
    }
    INFORME.push("tipo de diagrama: " + tipoUsado);
    if (tipoUsado != DIAG_TIPO) ERRORES.push("el diagrama es de tipo " + tipoUsado + " y no " + DIAG_TIPO + ": las líneas de vida no se verán");
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
    T.push("CU19 - DIAGRAMA DE SECUENCIA - INFORME");
    T.push("");
    T.push("Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB);
    T.push("Tipo de diagrama: " + tipoUsado);
    T.push("Mensajes: " + r.puestos + " de " + TOTAL_MSG);
    T.push("Mensajes a sí mismo: " + r.autodestino);
    T.push("Conectores en el diagrama: " + r.enDiagrama);
    T.push("Hallazgos: " + h2.total + " de " + TOTAL_HAL + ", banda hasta la y " + h2.fin);
    T.push("");
    T.push("AVISO DE NUMERACIÓN");
    T.push("Este caso es CU19 en el documento y CU25 en el código del proyecto.");
    T.push("Y la función del esquema que el propio schema.sql le asigna a CU25,");
    T.push("fn_detectar_stock_bajo, no tiene trigger y no la llama nadie.");
    T.push("");
    T.push("MARCOS Y BARRAS  <-- MIRA ESTO");
    T.push("Este caso tiene 1 alt y 1 loop. Contado antes de dibujar con contadores");
    T.push("sobre las 291 líneas de SRV_AlertasService:");
    T.push("  for 1   while 0   Promise.all 0   transaction 0");
    T.push("  if 19   throw 13   ternarios 17   map 3   dataSource.query 10");
    T.push("De los 19 if, solo 3 son ramas de verdad: los tres if de esAdmin.");
    T.push("Fragmentos colocados: " + MARCOS_PUESTOS + " de 2");
    T.push("Barras de activación colocadas: " + BARRAS_PUESTAS + " de 3");
    if (MARCOS_PUESTOS < 2 || BARRAS_PUESTAS < 3) {
        T.push("  Si alguno sale a 0, EA no ha aceptado la forma y hay que");
        T.push("  dibujarlo a mano en el diagrama.");
    } else {
        T.push("  Los 5 han salido. Son FORMAS dibujadas por script, no");
        T.push("  fragmentos nativos de EA.");
    }
    T.push("");
    T.push("COLOCACIÓN");
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
    msg = msg + "CU19 - Configurar Alertas de Stock Mínimo" + SALTO;
    msg = msg + "Diagrama de secuencia, sección 3.3.2.1." + SALTO;
    msg = msg + "En el código del proyecto este caso es CU25." + SALTO + SALTO;
    msg = msg + "10 líneas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "1 alt (el if de esAdmin de L176) y 1 loop (L242)," + SALTO;
    msg = msg + "contados antes de dibujar. De los 19 if, solo 3" + SALTO;
    msg = msg + "son ramas de verdad." + SALTO;
    msg = msg + "FRAGMENTOS colocados: " + MARCOS_PUESTOS + " de 2." + SALTO;
    msg = msg + "BARRAS colocadas: " + BARRAS_PUESTAS + " de 3." + SALTO;
    if (MARCOS_PUESTOS < 2 || BARRAS_PUESTAS < 3) msg = msg + "  Si falta alguno, hay que dibujarlo a mano." + SALTO;
    msg = msg + SALTO;
    msg = msg + "EL HALLAZGO 1: el bucle de L242 escribe N filas y no" + SALTO;
    msg = msg + "hay transacción. Si falla en la vuelta 15 de 20, las" + SALTO;
    msg = msg + "14 anteriores quedan escritas y la pantalla no recarga." + SALTO;
    msg = msg + "Y la bitácora va por el repositorio de TypeORM, así que" + SALTO;
    msg = msg + "nocouldría entrar ni con una transaction." + SALTO;
    msg = msg + "EL HALLAZGO 3: la tabla alertas_stock_config, con 7" + SALTO;
    msg = msg + "columnas y su notificar_email, no la usa NADIE. La" + SALTO;
    msg = msg + "app usa inventario_stock.stock_minimo_alert." + SALTO + SALTO;
    msg = msg + "Y el caso se llama Alertas, pero no hay ni un correo," + SALTO;
    msg = msg + "ni una notificación, ni un disparo en todo el" + SALTO;
    msg = msg + "proyecto. El endpoint se llama stock-minimo y eso es" + SALTO;
    msg = msg + "lo que hace: poner un número." + SALTO + SALTO;
    msg = msg + "Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACIÓN: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU19 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU19 Secuencia", 0); } catch (e3) { }
}
