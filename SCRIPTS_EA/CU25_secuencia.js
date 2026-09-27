// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU25  Agregar Productos al Carrito
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/components/carrito/CartPanel.tsx      200 lineas
//     web/src/pages/Catalogo.tsx                   L306-310
//     web/src/pages/Producto.tsx
//     web/src/lib/api.ts                           L898, L1783
//     api/src/modulos/seguridad/dependencias.ts    JwtOpcionalAuthGuard
//     api/src/modulos/carrito/CTR_Carrito.ts       86 lineas
//     api/src/modulos/carrito/SRV_CarritoService.ts 649 lineas
//     api/src/modulos/seguridad/SRV_BitacoraService.ts L14-39
//     BASE DE DATOS/schema.sql                     L366-382, L576-577
//
// QUE HACE ESTE CASO
//   Meter una prenda en el carrito, y el carrito tiene DOS DUEÑOS:
//
//     con sesion   el carrito es del usuario, y necesita permiso
//     sin sesion   el carrito es de invitado, y NO necesita permiso
//
//   Y TIENE EL HALLAZGO MAS GRAVE DE LOS TRES FALLOS DE ESQUEMA:
//
//     La columna token_invitado NO EXISTE. Y se usa en un SELECT, L105,
//     en un UPDATE, L115, en otro SELECT, L150 y en un INSERT, L167.
//     Con CERO ALTER TABLE. O sea que de los cuatro caminos del alt
//     SOLO FUNCIONA UNO: el del usuario que ya tiene carrito.
//
//   Y ADEMAS EL CASO TIENE LO CONTRARIO QUE LOS OTROS: CERO
//   BUCLES Y DOS alt DE VERDAD.
//
//   39 mensajes. 10 lineas de vida. 8 hallazgos.
//   2 fragmentos: dos alt y ningun loop. Explicado mas abajo.
//
// LOS FRAGMENTOS: DOS alt Y NINGUN loop
//   Contado ANTES de dibujar, con contadores, sobre las 649 lineas de
//   SRV_CarritoService:
//
//     for 0   while 0   Promise.all 0   continue 0   reduce 0
//     if 35   throw 15   ternarios 35   map 1
//     dataSource.query 26   em.query 0   transaction 0
//     try 0   catch 0   bitacoraService.registrar 4
//
//   CERO BUCLES. Ni uno. Y no es que este caso sea el simple: es el
//   que hace mas trabajo. Agregar una prenda son hasta 10 consultas,
//   un upsert manual, un recalculo de subtotal y una reconstruccion
//   del carrito entero, y todo eso sin un solo for.
//
//   Y LOS alt REALES DE LA SERIE, que son DOS, porque el carrito
//   tiene DOS DUEÑOS:
//
//     L355  if (credenciales.usuario) { exigirPermisoVenta() }
//     L82   if (usuario) { ... } else { /* Invitado */ }
//
//   El primero decide si hay que comprobar permiso. El segundo
//   decide COMO SE BUSCA EL CARRITO: por id_usuario, o por
//   token_invitado. Y dentro del else hay TRES salidas: un SELECT por
//   usuario, un SELECT por token mas un UPDATE de traspaso, y si nada
//   de eso, un INSERT. O sea que el else no es un camino, son tres.
//
//   DE LOS 35 if DEL FICHERO, SOLO 2 SON DE ESTE CASO: el L355 y el
//   L82. Los otros 33 son de consultarCarrito, actualizarCantidad y
//   quitarItem, que son otros casos de uso. Y se cuentan aparte.
//
//   Y las 3 barras de activacion: la del controlador, la del
//   servicio, y la del helper obtenerOCrearCarrito, que se invoca
//   desde este caso y por eso tiene la suya.
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
var TOTAL_MSG = 39;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU25 Secuencia Agregar Producto al Carrito";
var DIAG_NOMBRE = "CU25 Agregar Producto al Carrito";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 150;

var X_NOTA = 2675;
var ANCHO_NOTA = 700;
var Y_NOTA0 = 250;
var ALTO_LINEA_NOTA = 10;
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
    ["U", "ACTOR_Cliente", "Actor", "Lifeline", "Cliente", "quien agrega", "Actor, no clase: es quien pulsa", "no es codigo, es la persona. Y puede estar O SIN sesion, que es el alt del caso"],
    ["K", "Catalogo.tsx", "Object", "Lifeline", "Catalogo", "abre el panel", "Boundary", "web/src/pages/Catalogo.tsx, L306-310: arma la prenda y abre el panel con setVestidorAbierto(true)"],
    ["P", "CartPanel.tsx", "Object", "Lifeline", "CartPanel", "200 lineas, el panel", "Boundary", "web/src/components/carrito/CartPanel.tsx, 200 lineas, el unico componente del carrito"],
    ["H", "api.ts", "Object", "Lifeline", "api", "seccion CU33", "Boundary", "web/src/lib/api.ts, L898 la seccion y L1783 los metodos del carrito"],
    ["G", "JwtOpcionalAuthGuard", "Object", "Lifeline", "JwtOpcionalAuthGuard", "guard OPCIONAL", "Control", "api/src/modulos/seguridad/dependencias.ts, y con el decorador CredencialesCarritoActual. Es un guard distinto del JwtAuthGuard de los otros casos, y por eso el carrito funciona sin sesion"],
    ["V", "ValidationPipe", "Object", "Lifeline", "ValidationPipe", "anidado sobre el DTO", "Control", "api/src/main.ts, L22-43, y el DTO de 3 enteros de CTR_Carrito L23-33"],
    ["C", "CTR_Carrito", "Object", "Lifeline", "CarritoController", "86 lineas, POST items", "Control", "api/src/modulos/carrito/CTR_Carrito.ts, L51-64, con @HttpCode(CREATED) en L52"],
    ["S", "SRV_CarritoService", "Object", "Lifeline", "CarritoService", "649 lineas, 0 bucles", "Control", "api/src/modulos/carrito/SRV_CarritoService.ts, L349-451 agregarItem, y L77-181 obtenerOCrearCarrito"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar(), 2 veces", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "2 tablas, 0 indices", "Entity", "schema.sql L368-374 carritos con 5 columnas y SIN token_invitado; L376-382 carrito_items con 5, y esta vez SI con precio_unitario"]
];

var MSG = [
    [1, "U", "K", "1. mira una prenda en el catalogo y la quiere meter en el carrito   Catalogo.tsx, que es la pantalla publica, y el boton de anadir   O el mismo boton en Producto.tsx, la ficha, que hace lo mismo con otro camino", "S"],
    [2, "K", "P", "2. abre el panel   Catalogo.tsx L309-310: setVestidorAbierto(true) con la prenda montada en L306-308, y el panel es CartPanel.tsx, 200 lineas   Y OJO: esta prenda lleva su modelo_3d_url, L308, que CU24 demostro que el vestidor ignora", "S"],
    [3, "P", "P", "3. y dentro del panel, el boton de agregar   Y el caso tiene DOS DUEÑOS, que es lo que lo hace distinto: con sesion el carrito es del usuario, sin sesion es de invitado   O sea que el caso se puede hacer sin haber iniciado sesion, y eso lo decide JwtOpcionalAuthGuard, no el frontend", "S"],
    [4, "P", "H", "4. POST /api/v1/carrito/items   api.ts L1783, seccion CU33 - Carrito de compras   Y el caso del documento es CU25 'Agregar Productos al Carrito', y el del codigo CU33 'Carrito de compras', que es el bloque entero: consultar, agregar, actualizar y quitar", "S"],
    [5, "H", "G", "5. con Authorization Bearer SI lo hay, y SIN cabecera si no lo hay   Y esto es lo unico en toda la serie: el guard es JwtOpcionalAuthGuard, NO JwtAuthGuard.   O sea que el carrito es el unico modulo del proyecto que no exige sesion. Con el JwtAuthGuard de los otros 5 casos, el invitado no llegaria ni a la puerta", "S"],
    [6, "G", "G", "6. y si hay token, [el token no vale] NO LANZA: sigue con credenciales.usuario = null   O sea que el guard falla de forma silenciosa, y de ahi el CredencialesCarritoActual() que mete el usuario o null y el tokenInvitado", "S"],
    [7, "G", "C", "7. agregar( @CredencialesCarritoActual() credenciales, @Body() body, @Req() request ), CTR_Carrito L54-64, con @HttpCode(CREATED) en L52   Y el DTO, L23-33, son 3 enteros: id_ptc, cantidad e id_sucursal, con @IsInt y sus mensajes", "S"],
    [8, "C", "V", "8. AgregarItemRequest, L23-33: 'Debe indicar la prenda a comprar.', 'La cantidad debe ser un numero entero.' y 'Debe indicar la sucursal donde resolvera la compra.'   Y la validacion NO comprueba que la cantidad sea positiva: eso lo hace el servicio, L360", "S"],
    [9, "V", "S", "9. agregarItem( credenciales, dto, request ), L349, y aqui empieza el PRIMER alt del caso", "S"],
    [10, "S", "S", "10. alt, rama 1: [credenciales.usuario NO es null]   L355-357, y lo unico que hace es exigirPermisoVenta( credenciales.usuario ), L356   Y OJO lo que NO comprueba: el Cliente del seed, schema.sql L577, tiene [ver_catalogo, comprar, reservar, usar_vestidor_ra], y exigirPermisoVenta L72 pide realizar_venta   O sea que el Cliente recibe 403 al agregar al carrito, y el permiso que SI tiene, comprar, no lo comprueba NADIE", "S"],
    [11, "S", "Q", "11. SELECT r.permisos_json FROM usuarios JOIN usuarios_roles JOIN roles WHERE u.id_usuario = $1   L59-66, con 3 JOIN   Y solo en esta rama. En la de invitado no hay ni una consulta de permisos: el invitado no necesita permiso", "S"],
    [12, "S", "S", "12. [no incluye '*' ni 'realizar_venta'] 403 'No tienes permisos para comprar.'   L72-74   Y OJO el contraste, porque es lo mejor de este hallazgo: el MENSAJE esta bien, dice exactamente lo que la persona queria hacer. Lo que esta mal es la CONDICION, que es de venta   O sea que el autor escribio el mensaje del caso bien y la comprobacion del caso mal", "S"],
    [13, "S", "S", "13. y vuelta del alt, y aqui empieza lo REAL: [cantidad no entera o <= 0] 422 'La cantidad debe ser mayor a cero.', L360-362   O sea que el DTO decia 'numero entero' y el servicio anade 'mayor a cero'. El DTO podria haberlo comprobado y no lo comproba", "S"],
    [14, "S", "S", "14. validarPrenda( id_ptc ), L364, y despues validarSucursalActiva( id_sucursal ), L365, y validarStock( prenda, id_sucursal, cantidad ), L366   Tres validaciones seguidas, y OJO: las tres ocurren ANTES de obtener el carrito, L368   O sea que se comprueba el stock antes de saber en que carrito se va a meter", "S"],
    [15, "S", "Q", "15. y las tres hacen su consulta: la prenda con JOIN a productos, tallas y colores; la sucursal con su estado; y el stock, que es SELECT cantidad_disponible FROM inventario_stock WHERE id_ptc = $1 AND id_sucursal = $2   Consulta 1, 2 y 3 de hasta 26", "S"],
    [16, "S", "Q", "16. [stock insuficiente] 409, con la prenda nombrada   Y aqui ESTA LA SEGUNDA validacion de stock del caso, L384, mas adelante: cuando la prenda ya esta en el carrito se vuelve a comprobar, y con la cantidad SUMADA, no con la nueva", "S"],
    [17, "S", "S", "17. y aqui empieza el SEGUNDO alt, y el grande: obtenerOCrearCarrito( credenciales, id_sucursal ), L368, un metodo de 105 lineas, L77-181, que decide COMO SE BUSCA EL CARRITO", "S"],
    [18, "S", "S", "18. alt, rama del USUARIO: L82, if (usuario).   Primero busca si ya tiene un carrito activo: SELECT c.id_carrito, c.id_sucursal FROM carritos c WHERE c.id_usuario = $1 AND LOWER(c.estado) = 'activo' ORDER BY c.fecha_creacion DESC LIMIT 1, L85-90   O sea que si tiene DOS carritos activos, gana el mas nuevo, y el otro se queda abierto para siempre", "S"],
    [19, "S", "S", "19. y si NO tiene carrito de usuario, pero trae tokenInvitado, busca el suyo: SELECT .. WHERE c.token_invitado = $1, L103-108   Y AQUI ESTA EL HALLAZGO 1: LA COLUMNA c.token_invitado NO EXISTE EN EL ESQUEMA", "S"],
    [20, "D", "D", "20. PostgreSQL responde: column \"token_invitado\" does not exist   O sea que la rama del usuario con token falla.   Y la tabla carritos, schema.sql L368-374, tiene 5 columnas: id_carrito, id_usuario, estado, id_sucursal y fecha_creacion. token_invitado no esta. Y CERO ALTER TABLE en todo el proyecto", "S"],
    [21, "S", "Q", "21. y si ese SELECT y el UPDATE de L113-118 funcionaran, haria SET id_usuario = $1, token_invitado = NULL, o sea que al iniciar sesion el carrito de invitado pasaria a ser del usuario   O sea que el caso esta DISEÑADO para eso: comprar sin registro y luego vincularlo. Lo que pasa es que la columna no existe, o sea que el diseño se quedo a medias en el esquema", "S"],
    [22, "S", "Q", "22. y si no hay ni usuario ni token, crea el carrito: INSERT INTO carritos ( id_usuario, estado, id_sucursal, fecha_creacion ) VALUES ( $1, 'Activo', $2, NOW() ) RETURNING id_carrito, id_sucursal, L127-129   Consulta 4   Y AQUI ESTA BIEN HECHO: es el unico caso donde id_usuario puede ser NULL, porque la columna lo permite, y el carrito de invitado se guarda sin dueno", "S"],
    [23, "S", "S", "23. y ahora la TERCERA rama del alt, que es la del INVITADO: L143, el comentario dice // Invitado   Si hay token, SELECT .. WHERE c.token_invitado = $1, L148-153. Y si no, tokenInvitado = randomUUID(), L164, e INSERT INTO carritos ( token_invitado, estado, id_sucursal, fecha_creacion ), L167   LAS DOS SOBRAN: la columna no existe   O sea que el carrito de invitado NO SE PUEDE NI BUSCAR NI CREAR", "S"],
    [24, "D", "D", "24. PostgreSQL responde otra vez, con el mismo error   Y aqui hay un detalle que lo hace PEOR que en CU24: aqui la columna se genera con randomUUID(), L164, o sea que el servidor inventa un token, lo intenta guardar, falla, y el siguiente paso de esa peticion ya va con un id que no esta en ninguna parte.   En CU24, foto_resultado era un dato del cliente. Aqui es un token que el servidor acaba de crear", "S"],
    [25, "S", "Q", "25. y el helper devuelve { id_carrito, id_sucursal, token_invitado }, y volveria con el token para que el frontend lo guarde   Y precioVigente( prenda ), L369, que es la 5a consulta: SELECT del precio, y si no hay precio vigente lanza 409", "S"],
    [26, "S", "Q", "26. y aqui empieza el UPSERT MANUAL, L371-378: SELECT id_carrito_item, cantidad FROM carrito_items WHERE id_carrito = $1 AND id_ptc = $2 LIMIT 1   Y el WHERE es la pareja de claves, sin indice que lo sostenga   Consulta 6", "S"],
    [27, "S", "S", "27. y si la prenda YA estaba en el carrito, rama A: nuevaCantidad = la cantidad que habia MAS la que se agrega, L383   Y antes de escribir vuelve a validarStock, L384, CON LA SUMA.   O sea que la comprobacion de stock se hace DOS veces, L366 y L384, y la segunda con el dato correcto.   La primera es la de mas trabajo y la que puede fallar sin motivo", "S"],
    [28, "S", "Q", "28. y UPDATE carrito_items SET cantidad = $3, precio_unitario = $4 WHERE id_carrito_item = $1 AND id_carrito = $2 RETURNING .., L387-390   Consulta 7.   Y aqui esta LO BUENO de este caso: el precio_unitario se GUARDA, en un DECIMAL(10,2) de la tabla, L381   O sea que el carrito recuerda a que precio se agrego cada prenda. Las reservas, que son el caso hermano, NO lo hacen: reserva_items tiene 4 columnas y ninguna es de precio", "A"],
    [29, "S", "B", "29. y aqui la bitacora CON oldData Y newData REALES, que es el unico sitio del proyecto donde pasa: { id_ptc, cantidad: la que habia, precio_unitario }, L406, y { id_ptc, cantidad: la nueva, precio_unitario }, L407-411   Y la accion es UPDATE, L401, y la tabla carrito_items, L402   O sea que el antes y el despues de la cantidad, en la bitacora, como lo hizo CU24 con el Gusta", "S"],
    [30, "S", "S", "30. y si la prenda NO estaba, rama B: INSERT INTO carrito_items ( id_carrito, id_ptc, cantidad, precio_unitario ) VALUES ( $1, $2, $3, $4 ) RETURNING .., L416-418   Consulta 7, la misma numerada   Y con su bitacora INSERT, L429, con oldData null, L434, que es lo de siempre", "S"],
    [31, "S", "S", "31. y aqui hay un detalle: void accion, L446   O sea que la variable que dice si esto fue un INSERT o un UPDATE, que se asigna en L398 y en L426, se DESCARTA.   El usuario no puede saber en su toast si ha anadido una prenda nueva o ha anadido otra mas", "S"],
    [32, "S", "Q", "32. y despues de escribir, dos consultas mas de lectura: recalcularSubtotal( id_carrito ), L443, y cargarItems( id_carrito ), L444   Y la segunda trae el carrito entero, y luego un find, L445, que es un bucle disfrazado: recorre items buscando el que acabas de tocar   O sea que CADA anadir al carrito devuelve el carrito COMPLETO, no solo el item, y ademas filtra la lista otra vez para sacar el que cambio", "S"],
    [33, "S", "Q", "33. y la consulta mas pesada del caso, la de cargarItems, L278-291: SELECT con JOIN a producto_talla_color, productos, tallas y colores, y con un subquery escalar para la imagen principal, L281-283, igual que el historial de CU24   Y trae SOLO el precio_unitario guardado, NO el precio de catalogo de hoy.   O sea que el carrito le ensena a la persona el precio que ella eligio, y si el catalogo ha subido desde entonces, el carrito no lo dice", "S"],
    [34, "S", "H", "34. armarCarrito( id_carrito, id_sucursal, items, subtotal, coincidencia, token_invitado ), L448-450, que devuelve el objeto entero: el carrito, sus items, el subtotal, el total y el item recien tocado   Y el token de invitado viaja en la respuesta, para que el frontend lo guarde y lo mande en la siguiente peticion", "A"],
    [35, "H", "P", "35. la respuesta   api.ts L1783 y siguientes   Y el CartPanel la pinta: la prenda, la cantidad, el precio y el subtotal", "A"],
    [36, "P", "U", "36. el cliente ve el carrito con un item mas   Y si estaba sin sesion, en este punto tiene un token en el navegador y su carrito existe... en la theory, porque en L167 la columna no esta", "A"],
    [37, "U", "P", "37. y si vuelve a pinchar en la misma prenda, NO se crea otra linea: es la rama A del upsert, L382, y la cantidad se suma   O sea que el caso tiene el comportamiento correcto de accumular, y lo hace con un SELECT y un UPDATE en vez de un INSERT y un DELETE", "A"],
    [38, "P", "H", "38. y si pulsa la X en una prenda, DELETE /carrito/items/{idCarritoItem}, CTR_Carrito L77-85, que es quitarItem, L609   O sea que este caso de agregar, cuando el usuario se equivoca, pasa por el caso de quitar.   Y ese tampoco tiene transaccion ni try/catch", "A"],
    [39, "U", "U", "39. este caso es el unico de la serie con alt DE VERDAD y con CERO bucles, que es justo al reves que los demas.   Y tiene el hallazgo mas grave de los tres fallos de esquema: token_invitado, que se usa en 4 sitios del SQL y no existe, y que hace que el carrito de invitado no se pueda ni buscar ni crear   Y el mismo bug de permiso que CU22 y CU24, con otro nombre: realizar_venta en vez de comprar", "A"]
];

var HAL = [
    ["1. La columna token_invitado no existe, y el carrito de invitado no funciona", [
        "El hallazgo grave, y es el MAS GRAVE de los tres fallos de",
        "esquema del proyecto, porque aqui no es un dato que se",
        "pierda: es el mecanismo entero del caso.",
        "",
        "LA TABLA, schema.sql L368-374, ENTERA:",
        "",
        "  CREATE TABLE carritos (",
        "      id_carrito     SERIAL PRIMARY KEY,",
        "      id_usuario     INTEGER REFERENCES usuarios(id_usuario),",
        "      estado         VARCHAR(20) DEFAULT 'Activo',",
        "      id_sucursal    INTEGER REFERENCES sucursales(id_sucursal),",
        "      fecha_creacion TIMESTAMP DEFAULT NOW()",
        "  );",
        "",
        "CINCO columnas. token_invitado NO esta. Y el esquema entero",
        "tiene CERO ALTER TABLE, y el TypeScript tambien.",
        "",
        "Y LA COLUMNA SE USA EN 4 SITIOS DEL SQL DEL PROYECTO, los",
        "cuatro de este caso:",
        "",
        "  L105  WHERE c.token_invitado = $1     SELECT, usuario con token",
        "  L115  SET id_usuario = $1, token_invitado = NULL   UPDATE,",
        "        o sea el pase de invitado a usuario al iniciar sesion",
        "  L150  WHERE c.token_invitado = $1     SELECT, rama de invitado",
        "  L167  INSERT INTO carritos ( token_invitado, estado, .. )",
        "",
        "LAS CUATRO SON DE ESTE CASO, y las cuatro fallan.",
        "",
        "CONSECUENCIA, y son TRES de los cuatro caminos del alt:",
        "",
        "  usuario con carrito activo   L85   FUNCIONA",
        "  usuario SIN carrito, con     L103  NO FUNCIONA",
        "    token de invitado",
        "  invitado con token           L148  NO FUNCIONA",
        "  invitado sin token          L167  NO FUNCIONA",
        "",
        "O SEA QUE SOLO FUNCIONA EL CASO DE UN USUARIO QUE YA TIENE",
        "CARRITO. Todo lo demas, que es justo lo que hace interesante",
        "al caso, revienta con column token_invitado does not exist.",
        "",
        "Y LO QUE HACE MAS GRAVE ESTO QUE EN CU24, y hay que decirlo:",
        "en CU24 la columna que falta es un dato que envia el cliente,",
        "una foto, y perderla es perder un adorno. AQUI la columna es",
        "el MECANISMO de la rama. Y hay una cosa mas: L164 genera el",
        "token con randomUUID(). O sea que el servidor crea un token,",
        "intenta guardarlo, falla, y el paso siguiente de esa misma",
        "peticion ya va con un token que no esta en ninguna parte. El",
        "cliente se lo lleva en la respuesta, L449, y lo reenvia en",
        "la siguiente, y ese tampoco existe.",
        "",
        "Y POR QUE NO SE HA VISTO: el caso se desarrollo entero con",
        "el camino de usuario, que es el que funciona. El de invitado",
        "esta escrito, con sus 4 consultas, sus mensajes y su",
        "randomUUID, y no se ha ejecutado nunca."
    ]],
    ["2. Pide realizar_venta para anadir una prenda, y el Cliente tiene comprar", [
        "El MISMO bug que CU22 y CU24, con el tercer nombre de",
        "permiso. Y ya son tres casos distintos con tres nombres.",
        "",
        "LO QUE PIDE EL CODIGO, SRV_CarritoService L70-75:",
        "",
        "  private async exigirPermisoVenta(usuario) {",
        "    const permisos = await this.cargarPermisos(usuario);",
        "    if (!(permisos.includes('*') ||",
        "          permisos.includes('realizar_venta'))) {",
        "      throw new ForbiddenException(",
        "        'No tienes permisos para comprar.');",
        "    }",
        "  }",
        "",
        "Y LA LLAMA EN LOS CUATRO ENDPOINTS DEL MODULO: L356, L456,",
        "L557 y L616. O sea que la pregunta no es de este caso: es del",
        "carrito entero.",
        "",
        "Y AQUI ESTA LA COSA MAS INTERESANTE DEL HALLAZGO: el AUTOR",
        "SE ACERTO EN EL MENSAJE Y SE EQUIVOCO EN LA CONDICION. El 403",
        "dice literalmente No tienes permisos para comprar, L73, que es",
        "exactamente lo que la persona quiere hacer. La condicion, en",
        "cambio, es realizar_venta, L72, que es el permiso de la caja.",
        "O sea que el mensaje y la comprobacion no son el mismo caso de",
        "negocio, y solo uno de los dos esta bien. Y el que esta bien es",
        "el que ve el usuario.",
        "",
        "EL ROL CLIENTE DEL SEED, schema.sql L577:",
        "",
        "  ('Cliente', 'Compra y reserva en la plataforma',",
        "   '[\"ver_catalogo\",\"comprar\",\"reservar\",",
        "    \"usar_vestidor_ra\"]', 'Activo'),",
        "",
        "comprar. NO realizar_venta. Y realizar_venta SI esta en el",
        "seed, pero en el rol Cajero, L576, que es 'procesar pagos,",
        "ver inventario, registrar venta, gestionar devoluciones'.",
        "",
        "O SEA QUE EL PERMISO QUE PIDE ESTA DISEÑADO PARA LA CAJA Y SE",
        "ESTA PIDIENDO PARA EL CARRITO. El nombre del metodo lo dice,",
        "exigirPermisoVenta, y todo el caso ocurre ANTES de que haya",
        "venta ninguna.",
        "",
        "Y LA LISTA DE LOS TRES CASOS ROTOS, que es lo que hace el",
        "patron evidente:",
        "",
        "  CU22  pide gestionar_reservas   el Cliente tiene reservar",
        "  CU24  pide consultar_catalogo    el Cliente tiene ver_catalogo",
        "  CU25  pide realizar_venta       el Cliente tiene comprar",
        "",
        "TRES CASOS, TRES NOMBRES DISTINTOS para la misma idea, y el",
        "seed con otros tres. Y los tres permisos que el Cliente SI",
        "tiene para esto, que son reservar, ver_catalogo y comprar, no",
        "los comprueba NADIE: cero ocurrencias de un includes con",
        "esos tres nombres en los 152 ficheros del proyecto.",
        "",
        "Y UNA COSA QUE ESTE CASO HACE MEJOR QUE LOS OTROS DOS: el",
        "INVITADO no necesita permiso. L355-357 es if",
        "(credenciales.usuario) y exigirPermisoVenta esta DENTRO. O",
        "sea que un carrito de invitado se puede hacer entero sin",
        "sesion y sin permiso. Lo unico que se necesita es un token,",
        "y el token no existe. Se podria decir que el caso esta bien",
        "de permisos y mal de esquema, al reves que CU22."
    ]],
    ["3. Cero transacciones y cero try/catch en 649 lineas", [
        "Un hallazgo de orden. Y aqui el numero duele mas que en",
        "CU24, porque el servicio hace MAS trabajo.",
        "",
        "CONTADORES DE SRV_CarritoService, 649 lineas:",
        "",
        "  for 0   while 0   Promise.all 0   continue 0   reduce 0",
        "  map 1   if 35   throw 15   ternarios 35",
        "  dataSource.query 26   em.query 0   transaction 0",
        "  try 0   catch 0   bitacora 4",
        "",
        "649 lineas, 26 consultas, 4 escrituras a la bitacora, y ni",
        "una transaccion. Y no es que el caso sea de lectura: es el",
        "que mas escribe de su modulo.",
        "",
        "EL PRECIO DE UNA SOLA LLAMADA A agregarItem, y son 8 en el",
        "camino feliz, mas 2 en el de item repetido:",
        "",
        "  L356  1  cargarPermisos, y solo si hay usuario",
        "  L364  2  validarPrenda",
        "  L365  3  validarSucursalActiva",
        "  L366  4  validarStock",
        "  L368  5  obtenerOCrearCarrito, que internamente son 1 o 2",
        "  L369  6  precioVigente",
        "  L373  7  el SELECT del upsert",
        "  L387  8  el UPDATE, o el INSERT de L416",
        "  L443  9  recalcularSubtotal",
        "  L444  10  cargarItems",
        "",
        "Y DE ESCRITURAS HAY 5 EN EL CAMINO COMPLETO, y ninguna en",
        "transaccion. Dos son de este metodo: el UPDATE de L387 o el",
        "INSERT de L416, segun la rama del upsert. Y las otras tres son",
        "del helper de L77-181, que se invoca desde aqui: el UPDATE de",
        "traspaso de L113-118, y los dos INSERT de carritos de L127 y",
        "L167.   Y las dos primeras solo se ejecutan en la rama del",
        "usuario y en la del invitado respectivamente, o sea que en un",
        "carrito ya creado no se escribe nada en carritos.",
        "",
        "Y LA CONSECUENCIA MAS SERIA, que es la del MERCADO DE",
        "INVITADO: obtenerOCrearCarrito, si el SELECT por usuario",
        "devuelve NADA y el token falla, crea el carrito. Y si el",
        "INSERT de L167 fallara, el SELECT de L148 y el UPDATE de",
        "L113 tambien habrian fallado antes. O sea que el metodo",
        "tiene tres puntos de fallo en serie y ninguna transaccion",
        "que los una.",
        "",
        "Y LA MAS SUTIL, que es la del CARRITO A MEDIAS: el UPDATE de",
        "L387 escribe la cantidad nueva, y despues L443 recalcula el",
        "subtotal. Si el recalculo falla, la cantidad esta escrita y",
        "el subtotal no. Y el subtotal es lo que ve el cliente. Sin",
        "transaccion, la pantalla puede mostrar un total que no",
        "corresponde a lo que hay en la tabla.",
        "",
        "Y EL try/catch NO ESTA EN NINGUNA PARTE DE ESTE CASO, y eso",
        "si que es una diferencia con CU24, donde el servicio tenia 0 y",
        "VestidorRa.tsx tenia 4.   Aqui el servicio tiene 0 y el",
        "cliente tambien: CartPanel.tsx, que son sus 200 lineas, no",
        "tiene ni un try ni un catch.   O sea que en CU25 el error se",
        "sube hasta el servidor sin que nadie lo intercepte por el",
        "camino, y lo que ve la persona es un 500 pelado."
    ]],
    ["4. void accion: el resultado del upsert se descarta", [
        "Un hallazgo pequeno, y es el tercero de la serie que son",
        "todos el mismo error de estilo.",
        "",
        "L380-381, al principio de la rama:",
        "",
        "  let idItem: number;",
        "  let accion: 'INSERT' | 'UPDATE';",
        "",
        "Y L398 y L426, en cada rama:",
        "",
        "  accion = 'UPDATE';      rama A, la prenda ya estaba",
        "  accion = 'INSERT';      rama B, la prenda es nueva",
        "",
        "Y L446, tres lineas antes del return:",
        "",
        "  void accion;",
        "",
        "O sea que se declara, se le dan dos valores distintos segun",
        "el camino, y luego se tira explicitamente con un void. El",
        "TypeScript lo pone porque si no se quejaria de la variable",
        "sin usar, pero la variable no lleva a ningun sitio.",
        "",
        "Y LO QUE SE PIERDE, y es lo que el usuario querria saber: si",
        "ha anadido una prenda nueva o ha anadido otra que ya tenia. Son",
        "dos cosas distintas en la interfaz: una es una prenda que",
        "aparece, y la otra es un numero que sube en una fila que ya",
        "estaba. La pantalla no puede distinguirlas.",
        "",
        "Y EL MISMO PATRON, y por eso es el tercero:",
        "",
        "  CU22  L398  const cantidadPrendas = prendas, que si se usa,",
        "               en el mensaje de la bitacora de L991",
        "  CU24  L318  actualizado: Boolean(existente), que SI se",
        "               devuelve, pero en un campo que la pantalla no",
        "               lee",
        "  CU25  L446  void accion, que ni se devuelve",
        "",
        "O sea que de tres veces que el codigo sabe si fue un alta o",
        "una modificacion, una la gasta en la bitacora, otra la",
        "devuelve en un campo muerto, y la tercera la tira."
    ]],
    ["5. El stock se comprueba dos veces, y la primera no puede hacer fallar nada", [
        "Un hallazgo de logica, y sale de mirar el orden.",
        "",
        "EN agregarItem, las validaciones de L364-366 son:",
        "",
        "  L364  validarPrenda( id_ptc )",
        "  L365  validarSucursalActiva( id_sucursal )",
        "  L366  validarStock( prenda, id_sucursal, cantidad )",
        "",
        "Y la de L384, dentro de la rama del upsert:",
        "",
        "  L384  await this.validarStock( prenda, carrito.id_sucursal,",
        "                 nuevaCantidad );",
        "",
        "O SEA QUE SE COMPRUEBA DOS VECES. Y la diferencia entre las",
        "dos es el dato: la primera usa dto.cantidad, que es lo que el",
        "usuario ha pedido AHORA, y la segunda usa nuevaCantidad, que",
        "es lo que habia mas lo que se pide.",
        "",
        "LA SEGUNDA ES LA CORRECTA. Si la prenda ya estaba con 2 y el",
        "usuario pide 2 mas, son 4, y el stock tiene que ser 4. La",
        "primera solo mira 2.",
        "",
        "Y LA PRIMERA NUNCA ES LA QUE HACE FALLAR, y esa es la parte",
        "que no es obvious: nuevaCantidad es siempre mayor o igual que",
        "cantidad, porque es cantidad mas lo que habia. O sea que si",
        "la segunda pasa, la primera tambien. Y si la primera falla, la",
        "segunda fallaria todavia mas.",
        "",
        "EL CASO QUE SI FALLA, y es el de la segunda, con la prenda",
        "ya en el carrito:",
        "",
        "  el carrito tiene 3, el stock es 5, el usuario anade 2.",
        "  L366 compara 5 contra 2: pasa.",
        "  L384 compara 5 contra 5: pasa. Se anade.",
        "",
        "  el carrito tiene 3, el stock es 5, el usuario anade 3.",
        "  L366 compara 5 contra 3: pasa.",
        "  L384 compara 5 contra 6: FALLA, y con razon.",
        "",
        "O SEA QUE LA PRIMERA ES UNA CONSULTA DE MAS. No es un bug de",
        "resultado, es trabajo gratis: un SELECT a inventario_stock en",
        "cada anadir, que no puede cambiar ninguna respuesta.",
        "",
        "Y TIENE UN EFECTO SECUNDARIO, y ese si es malo: comprueba con",
        "carrito.id_sucursal, L384, y la de L366 comprueba con",
        "dto.id_sucursal, L366. Son la misma columna en el camino",
        "normal, pero no tienen por que serlo: si entre L366 y L368 el",
        "carrito resultado se resuelve con una sucursal distinta, la",
        "primera habria validado una y la segunda otra."
    ]],
    ["6. Tres validaciones que se callan, y cero indices en las dos tablas", [
        "Dos hallazgos en uno, porque salen del mismo sitio: los",
        "mensajes que no distinguen un caso de otro, y los indices",
        "que no existen.",
        "",
        "PARTE UNO: TRES VALIDACIONES, TRES QUE SE CALLAN IGUAL.",
        "",
        "EN LA PRENDA, L200-205:",
        "",
        "  if (!fila) throw new 422 'Prenda no encontrada.';",
        "  if (String(fila.estado_producto ?? '').toLowerCase() !== 'activo')",
        "    throw new 422 'Prenda no encontrada.';",
        "",
        "EL MISMO MENSAJE para las dos cosas. O sea que una prenda",
        "desactivada se reporta como inexistente, y con un 422 en vez",
        "del 404 que seria lo natural.   CU21 hace lo contrario, y bien:",
        "L1199-1200 lanza 409 con el nombre, la talla y el color.",
        "",
        "Y EN LA SUCURSAL, L227-228, el mismo patron otra vez:",
        "",
        "  if (!fila || String(fila.estado ?? '').toLowerCase() !== 'activa')",
        "    throw new 422 'La sucursal seleccionada no está disponible.';",
        "",
        "O sea que una sucursal que no existe y una sucursal que está",
        "cerrada dan el mismo 422 con el mismo texto, y el texto no",
        "distingue las dos cosas. Tres validaciones en el caso, y las",
        "tres se callan de la misma forma.",
        "",
        "Y LA DE LAS TRES QUE SI DICE ALGO: validarStock, L232, que",
        "es la que mira la cantidad de verdad. Esa si tiene su mensaje",
        "con el nombre de la prenda, como CU21. O sea que de las tres,",
        "la que esta bien escrita es la que compara un numero.",
        "",
        "PARTE DOS: LOS INDICES",
        "",
        "NO HAY NI UN INDICE en carritos ni en carrito_items. El grep",
        "de CREATE INDEX del esquema no encuentra ninguno de los dos,",
        "y CERO ALTER TABLE, y cero CREATE INDEX en el TypeScript.",
        "",
        "Y LAS BUSQUEDAS DEL CASO SON:",
        "",
        "  carritos       L87   WHERE id_usuario = $1",
        "                           AND LOWER(c.estado) = 'activo'",
        "                           ORDER BY fecha_creacion DESC LIMIT 1",
        "  carritos      L105   WHERE token_invitado = $1",
        "  carritos      L150   WHERE token_invitado = $1",
        "  carrito_items L374   WHERE id_carrito = $1 AND id_ptc = $2",
        "                           LIMIT 1",
        "",
        "CADA ANADIR AL CARRITO ES UN SEQ SCAN DE LAS DOS TABLAS, y",
        "la de L374 es la del UPSERT, o sea que se ejecuta en CADA",
        "item que se toca. Y la de L87 es la primera consulta de",
        "obtenerOCrearCarrito, o sea que en CADA peticion.",
        "",
        "Y LA DE L374 ES LA PEOR, porque es la UNICA que hace el",
        "upsert y no tiene indice compuesto. id_ptc y cantidad se",
        "traen del SELECT de L373, y el L374 los filtra por la",
        "pareja. Sin indice, PostgreSQL compara fila por fila.",
        "",
        "Y LA DE L87 TIENE UN AGRAVANTE: el ORDER BY fecha_creacion",
        "DESC LIMIT 1. O sea que si un usuario tiene cinco carritos",
        "activos, hay que mirar los cinco y quedarse con el mas",
        "nuevo, SIN indice que los ordene.",
        "",
        "Y LA CONSECUENCIA FUNCIONAL, que no es solo lentitud: los",
        "cinco carritos activos se quedan abiertos para siempre. El",
        "codigo elige uno y no cierra los otros, y no hay ni un",
        "UPDATE que cierre carritos: el unico UPDATE de carritos del",
        "fichero, L114, es el de traspaso de invitado, no un cierre. Y",
        "como no hay indice por estado, ni siquiera puede responder",
        "rapido cuantos hay. Un usuario que entra y sale quince veces",
        "tiene quince carritos Activo y solo se ve el ultimo."
    ]],
    ["7. El contrato de la API: cada anadir devuelve el carrito entero", [
        "Un hallazgo de contrato, y sale de armarCarrito.",
        "",
        "L443-450, las tres ultimas lineas del metodo:",
        "",
        "  const subtotal = await this.recalcularSubtotal(carrito.id_carrito);",
        "  const items = await this.cargarItems(carrito.id_carrito);",
        "  const coincidencia = items.find((i) =>",
        "    Number(i.id_carrito_item) === idItem);",
        "  void accion;",
        "  return this.armarCarrito(carrito.id_carrito, carrito.id_sucursal,",
        "    items, subtotal, coincidencia, token_invitado: carrito.token_invitado);",
        "",
        "O SEA QUE TRES consultas de lectura DESPUES de escribir, y",
        "un find encima, y el resultado es el carrito COMPLETO. Cada",
        "vez que el usuario anade una prenda: se releen todos los",
        "items, se recalcula el subtotal entero, y se filtra la lista",
        "para sacar el unico item que cambio.",
        "",
        "Y ESO, PARA UN CARRITO DE 40 PRENDAS, SON 40 FILAS DE MAS",
        "QUE NO HACIA FALTA, en cada pulsacion. Y el find de L445 es",
        "un bucle disfrazado: recorre los 40 para quedarse con uno, y",
        "para eso estaba la variable coincidencia, que es lo que",
        "devuelve armarCarrito como el item recien tocado.",
        "",
        "Y LO DE RECALCULAR EL SUBTOTAL, y aqui hay que corregirse a",
        "uno mismo, porque la primera version de este hallazgo decia",
        "que recalcularSubtotal era un UPDATE. ES FALSO. L296-306 es un",
        "SELECT, y uno con COALESCE, L299:",
        "",
        "  SELECT COALESCE(SUM(ci.cantidad * ci.precio_unitario), 0)",
        "           AS subtotal",
        "   FROM carrito_items ci",
        "   WHERE ci.id_carrito = $1",
        "",
        "O SEA QUE EL SUBTOTAL NO SE GUARDA EN NINGUNA COLUMNA: se",
        "recalcula en cada respuesta. Y eso es MEJOR que guardarlo,",
        "porque guardarlo exige acordarse de reescribirlo en cada",
        "cambio, y sin transaccion habria quedado el hallazgo 3, el",
        "del carrito a medias. Con un SELECT eso no puede pasar.",
        "",
        "EL COSTE ES EL DE LA CONSULTA, y con 40 items es un barrido",
        "de las 40 filas en cada pulsacion. Pero un SELECT no escribe",
        "nada, y no puede dejar el carrito a medias.",
        "",
        "Y LA CONSECUENCIA DE DISENO, y aqui hay que corregirse OTRA",
        "VEZ, porque la primera version decia que cargarItems traia el",
        "precio_unitario guardado Y el precio de catalogo de HOY, en la",
        "misma fila. ES FALSO TAMBIEN. L278-291 trae SOLO el guardado:",
        "",
        "  ci.id_carrito_item, ci.id_carrito, ci.id_ptc, ci.cantidad,",
        "  ci.precio_unitario,",
        "  (ci.cantidad * ci.precio_unitario) AS subtotal_item,",
        "  ptc.id_producto, p.codigo, p.nombre AS nombre_producto,",
        "  t.nombre AS talla, c.nombre AS color",
        "",
        "O sea que el precio de HOY NO esta. Y eso es MEJOR que lo que",
        "hace CU22, donde el precio de la pantalla venia de una",
        "columna que no se guardaba nunca: aqui el precio guardado",
        "existe de verdad y es el unico que se ve. El carrito le",
        "ensena a la persona el precio que ella eligio, y si el",
        "catalogo ha subido desde entonces, el carrito no lo dice.",
        "",
        "Y LO QUE SI HAY, y es el hallazgo que queda de esta parte:",
        "el SUBQUERY ESCALAR de L281-283, el MISMO que en CU24",
        "L328-330, con el mismo ORDER BY por orden e id_imagen que",
        "sobra porque el WHERE ya dice es_principal = true. O sea",
        "que el carrito tiene el mismo N+1 dentro de la base que el",
        "historial de CU24, y con la copia literal del ORDER BY",
        "redundante. Dos casos, dos subquery, el mismo error."
    ]],
    ["8. Lo que esta bien, y hay bastante", [
        "Este caso tiene seis cosas buenas, con el mismo detalle que",
        "las malas. Y la primera es la mejor de la serie.",
        "",
        "1. EL PRECIO SE GUARDA. carrito_items tiene precio_unitario",
        "   DECIMAL(10,2), schema.sql L381, y agregarItem lo escribe en",
        "   las dos ramas, L388 y L417, con precioVigente, L369, que es",
        "   una consulta propia para el precio vigente.   O sea que el",
        "   carrito RECUERDA a que precio se agrego cada prenda.   Y",
        "   esto es exactamente lo que CU22 hace mal: alli DetalleReserva",
        "   calcula un total con precio_base de HOY, y reserva_items",
        "   no tiene columna de precio. El error opuesto, en otro caso,",
        "   y aqui esta bien.",
        "",
        "2. EL UPSERT MANUAL ESTA BIEN HECHO, L371-441. Primero mira",
        "   si el item existe por la pareja id_carrito + id_ptc, L374,",
        "   y luego UPDATE o INSERT.   Y con el LIMIT 1 de L375, que",
        "   hace que si por lo que sea hay dos filas con la misma",
        "   prenda se actualice la primera.   Es el mismo cuidado que",
        "   en registrarResultado de CU24, L246, y el mismo que le",
        "   falta a L384 de CU21.",
        "",
        "3. Y SU BITACORA TRAE EL ANTES Y EL DESPUES DE VERDAD, L406",
        "   y L407-411: la cantidad que habia y la nueva, con el",
        "   precio.   Es el segundo sitio del proyecto con oldData",
        "   real, y el primero en el que el oldData es una cantidad que",
        "   ha CAMBIADO.   CU24 L274-275 hace lo mismo con el Gusta.",
        "",
        "4. Y EL INVITADO NO NECESITA PERMISO, L355-357. El if",
        "   (credenciales.usuario) envuelve la comprobacion, y el",
        "   JwtOpcionalAuthGuard deja pasar sin sesion.   O sea que el",
        "   carrito se puede hacer entero sin estar registrado, que es",
        "   lo que un ecommerce necesita.   Y el id_usuario de",
        "   carrito_items se puede guardar como NULL: la columna lo",
        "   permite, L370, y la consulta del servicio lo contempla.",
        "",
        "5. Y EL CARRITO SE PASA DE INVITADO A USUARIO AL INICIAR",
        "   SESION, que es el L113-118: SET id_usuario = $1,",
        "   token_invitado = NULL.   El diseño esta bien: comprar sin",
        "   registro, y cuando te registras el carrito te espera. Es",
        "   la idea de las carteras de Amazon.   Y el que este roto es",
        "   el esquema, no el codigo.",
        "",
        "6. Y LAS TRES VALIDACIONES ANTES DE ESCRIBIR, L364-366, son",
        "   un patron que el resto de la serie deberia copiar: la",
        "   prenda, la sucursal y el stock, en ese orden, y las tres",
        "   con su mensaje.   Y las dos de estado usan la lista blanca",
        "   del ?? '' con el toLowerCase, L203 y L227, que es el mismo",
        "   cuidado que CU21 y CU24 tienen.   Y la de la sucursal",
        "   comprueba el estado con LOWER, que esta bien.",
        "",
        "   Y AQUI ESTA UN MATIZ QUE LO CAMBIA RESPECTO A CU24: alli",
        "   el estado del stock NI SIQUIERA se traia del esquema. Aqui",
        "   SI se trae, L187, y se devuelve, L214, con el ?? ''.   O",
        "   sea que en el carrito la columna esta a la vista del autor y",
        "   no la miro.   El mismo fallo, con el dato mas a mano."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU25."; } catch (e) { }
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
// Este caso tiene DOS loop (L1173 de validarPrendas y L1086 de la
// transaccion) y NINGUN alt. Se ha contado antes de escribir.
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
    // El loop de validarPrendas, L1173: un SELECT por prenda, fuera de la transaccion.
    // LOS 2 alt DEL CASO, y son los unicos alt reales de la serie: L355 y L82.
    // El carrito tiene dos duenos, y decidir cual es un camino de verdad.
    var xS2 = xDe(indiceDe("S"));
    var xD2 = xDe(indiceDe("D"));
    fragmento(diag, "alt [con sesion: exige realizar_venta] / [sin sesion: NO exige permiso]", xS2, xD2, Y_MSG0 + 8 * PASO_MSG - 34, Y_MSG0 + 14 * PASO_MSG + 16);
    fragmento(diag, "alt [usuario: busca por id_usuario] / [invitado: busca por token_invitado, que no existe]", xS2, xD2, Y_MSG0 + 16 * PASO_MSG - 34, Y_MSG0 + 25 * PASO_MSG + 16);
    activacion(diag, xDe(indiceDe("C")), Y_MSG0 + 2 * PASO_MSG - 26, Y_MSG0 + 44 * PASO_MSG + 12);
    activacion(diag, xS2, Y_MSG0 + 3 * PASO_MSG - 26, Y_MSG0 + 37 * PASO_MSG + 12);
    activacion(diag, xD2, Y_MSG0 + 14 * PASO_MSG - 26, Y_MSG0 + 36 * PASO_MSG + 12);
}

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 940) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU25  Agregar Productos al Carrito   ·   en el código del proyecto este caso es CU33, y el titulo es distinto"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 940) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseño de caso de uso, sección 3.3.2.1.  10 líneas de vida, 47 mensajes, 8 hallazgos, 2 alt y NINGUN loop, y 3 barras de activación."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su línea de vida. El tiempo baja. Este es el mejor caso de escritura del proyecto: tiene una transacción de verdad con las cinco escrituras dentro, y un SELECT con FOR UPDATE en la segunda vuelta del bucle, antes de mover el stock. El bloqueo por filas NO es un invento suyo: las siete transacciones del proyecto lo llevan. Lo que sí es de este caso es el orden. El caso se llama de múltiples prendas y la pantalla no existe: router.tsx L56 manda /reservas/nueva al catálogo. Dos bucles y ningún alt, de los cinco for del servicio solo dos son de este caso."; } catch (e) { }
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
// LOS 43 MENSAJES
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
    N.push("CU25  Agregar Productos al Carrito.  Diseño de caso de uso, sección 3.3.2.1.");
    N.push("");
    N.push("AVISO DE NUMERACIÓN, Y EL TÍTULO NO COINCIDE");
    N.push("");
    N.push("  Este caso es CU25 en el documento, y en el código del proyecto es CU33, con un");
    N.push("  título DISTINTO y más corto:");
    N.push("");
    N.push("    documento   CU25  Agregar Productos al Carrito");
    N.push("    codigo      CU33  Carrito de compras        api.ts L898 y L1783");
    N.push("");
    N.push("  Y LA DIFERENCIA IMPORTA, porque CU33 en el código es el BLOQUE ENTERO del carrito, no");
    N.push("  este caso. Y el esquema lo confirma, schema.sql L366:");
    N.push("");
    N.push("    -- 10. CARRITO Y VENTAS — CU33-CU39");
    N.push("");
    N.push("  O sea que este caso es la cuarta parte de un caso mas grande que abarca CU33 a CU39, y");
    N.push("  el endpoint es POST /carrito/items, uno de los cuatro. Los otros tres son consultar,");
    N.push("  actualizar cantidad y quitar. Y este caso, al fallar, llama al de quitar.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 líneas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Cliente            «actor»     quien agrega, y puede estar SIN sesión");
    N.push("    Catalogo.tsx             «boundary»  L306-310, arma la prenda y abre el panel");
    N.push("    CartPanel.tsx            «boundary»  200 líneas, el único componente del carrito");
    N.push("    api.ts                   «boundary»  sección CU33, L898 y L1783");
    N.push("    JwtOpcionalAuthGuard     «control»   y no JwtAuthGuard: el carrito no exige sesión");
    N.push("    ValidationPipe           «control»   main.ts L22-43, y un DTO de 3 enteros");
    N.push("    CTR_Carrito              «control»   86 líneas, L51-64, con @HttpCode(CREATED)");
    N.push("    SRV_CarritoService       «control»   649 líneas, 26 consultas, 0 bucles");
    N.push("    SRV_BitacoraService      «control»   registrar(), 2 veces, con oldData real");
    N.push("    PostgreSQL               «entity»    carritos, 5 columnas y SIN token_invitado");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes. 2 van a la base de datos, 15 son mensajes a sí mismo, 7 son");
    N.push("  retornos, 5 llevan la guarda escrita entre corchetes y 4 tocan al actor.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("LOS FRAGMENTOS: DOS alt Y NINGUN loop, AL REVES QUE LOS DEMÁS");
    N.push("");
    N.push("  Contados ANTES de dibujar, con contadores, sobre las 649 líneas de SRV_CarritoService:");
    N.push("");
    N.push("    for 0   while 0   Promise.all 0   continue 0   reduce 0");
    N.push("    if 35   throw 15   ternarios 35   map 1");
    N.push("    dataSource.query 26   em.query 0   transaction 0");
    N.push("    try 0   catch 0   bitacora 4");
    N.push("");
    N.push("  CERO BUCLES, y no porque el caso sea el simple: es el que más trabajo hace. Agregar una");
    N.push("  prenda son hasta 10 consultas, un upsert manual, un recálculo de subtotal y una");
    N.push("  reconstrucción del carrito entero, y todo eso sin un solo for.");
    N.push("");
    N.push("  Y LOS alt REALES DE LA SERIE, que son DOS, porque el carrito tiene DOS DUEÑOS:");
    N.push("");
    N.push("    L355  if (credenciales.usuario) { exigirPermisoVenta() }");
    N.push("    L82   if (usuario) { ... } else { /* Invitado */ }");
    N.push("");
    N.push("  El primero decide si hay que comprobar permiso. El segundo decide CÓMO SE BUSCA EL");
    N.push("  CARRITO: por id_usuario o por token_invitado. Y dentro del else hay TRES salidas: un");
    N.push("  SELECT por usuario, un SELECT por token más un UPDATE de traspaso, y si nada de eso, un");
    N.push("  INSERT. O sea que el else no es un camino, son tres.");
    N.push("");
    N.push("  DE LOS 35 if DEL FICHERO, SOLO 2 SON DE ESTE CASO: el L355 y el L82. Los otros 33 son");
    N.push("  de consultarCarrito, actualizarCantidad y quitarItem, que son otros casos de uso.");
    N.push("");
    N.push("  Y las 3 barras de activación: la del controlador, la del servicio, y la del helper");
    N.push("  obtenerOCrearCarrito, que se invoca desde aquí y por eso tiene la suya.");
    N.push("");
    N.push("EL HALLAZGO 1: LA COLUMNA token_invitado NO EXISTE, Y EL CARRITO DE INVITADO NO FUNCIONA");
    N.push("");
    N.push("  La tabla carritos, schema.sql L368-374, ENTERA:");
    N.push("");
    N.push("    CREATE TABLE carritos (");
    N.push("        id_carrito     SERIAL PRIMARY KEY,");
    N.push("        id_usuario     INTEGER REFERENCES usuarios(id_usuario),");
    N.push("        estado         VARCHAR(20) DEFAULT 'Activo',");
    N.push("        id_sucursal    INTEGER REFERENCES sucursales(id_sucursal),");
    N.push("        fecha_creacion TIMESTAMP DEFAULT NOW()");
    N.push("    );");
    N.push("");
    N.push("  CINCO columnas. token_invitado NO está. Y el esquema tiene CERO ALTER TABLE, y el");
    N.push("  TypeScript también. Y la columna se usa en 4 SITIOS DEL SQL, los cuatro de este caso:");
    N.push("");
    N.push("    L105  WHERE c.token_invitado = $1        SELECT, usuario que trae token");
    N.push("    L115  SET id_usuario = $1, token_invitado = NULL   UPDATE de traspaso");
    N.push("    L150  WHERE c.token_invitado = $1        SELECT, rama de invitado");
    N.push("    L167  INSERT INTO carritos ( token_invitado, estado, .. )");
    N.push("");
    N.push("  Y DE LOS CUATRO CAMINOS DEL SEGUNDO alt, SOLO UNO FUNCIONA:");
    N.push("");
    N.push("    usuario con carrito activo     L85    FUNCIONA");
    N.push("    usuario SIN carrito, con token L103   NO FUNCIONA");
    N.push("    invitado con token            L148   NO FUNCIONA");
    N.push("    invitado sin token           L167   NO FUNCIONA");
    N.push("");
    N.push("  O SEA QUE SOLO FUNCIONA EL USUARIO QUE YA TIENE CARRITO. Todo lo demás, que es justo");
    N.push("  lo que hace interesante al caso, revienta con column token_invitado does not exist.");
    N.push("");
    N.push("  Y AQUÍ HACE MÁS DAÑO QUE EN CU24, y hay que decirlo: en CU24 la columna que falta es");
    N.push("  un dato que envía el cliente, una foto. AQUÍ la columna es el MECANISMO de la rama, y");
    N.push("  además L164 genera el token con randomUUID(). O sea que el servidor crea un token,");
    N.push("  intenta guardarlo, falla, y el paso siguiente de esa misma petición ya va con un");
    N.push("  token que no está en ninguna parte. El cliente se lo lleva en la respuesta, L449, y lo");
    N.push("  reenvía en la siguiente, y ese tampoco existe.");
    N.push("");
    N.push("EL HALLAZGO 2: PIDE realizar_venta PARA AÑADIR UNA PRENDA");
    N.push("");
    N.push("  exigirPermisoVenta, L70-75, y lo llama en los CUATRO endpoints del módulo: L356, L456,");
    N.push("  L557 y L616. El nombre del método lo dice, y el mensaje también: No tienes permisos para");
    N.push("  realizar una venta. Todo el caso ocurre ANTES de que haya venta ninguna.");
    N.push("");
    N.push("  Y el rol Cliente del seed, L577, tiene comprar. NO realizar_venta. Ese permiso sí está");
    N.push("  en el seed, pero en el rol Cajero, L576, que es el de la caja.");
    N.push("");
    N.push("  LA LISTA DE LOS TRES CASOS ROTOS, y ya son tres nombres para la misma idea:");
    N.push("");
    N.push("    CU22  pide gestionar_reservas   el Cliente tiene reservar");
    N.push("    CU24  pide consultar_catalogo    el Cliente tiene ver_catalogo");
    N.push("    CU25  pide realizar_venta       el Cliente tiene comprar");
    N.push("");
    N.push("  Y los tres permisos que el Cliente SÍ tiene para esto no los comprueba NADIE: cero");
    N.push("  ocurrencias en los 152 ficheros del proyecto.");
    N.push("");
    N.push("  Y UNA COSA QUE ESTE CASO HACE MEJOR QUE LOS OTROS DOS: el INVITADO no necesita permiso.");
    N.push("  L355-357 es if (credenciales.usuario) y exigirPermisoVenta está DENTRO. Un carrito de");
    N.push("  invitado se puede hacer entero sin sesión y sin permiso. Lo único que necesita es un");
    N.push("  token, y el token no existe. Este caso está bien de permisos y mal de esquema, al revés");
    N.push("  que CU22.");
    N.push("");
    N.push("EL HALLAZGO 3: CERO TRANSACCIONES Y CERO try/catch EN 649 LÍNEAS");
    N.push("");
    N.push("  649 líneas, 26 consultas, 4 escrituras a la bitácora, y ni una transacción. Y no es un");
    N.push("  caso de lectura: es el que más escribe de su módulo.");
    N.push("");
    N.push("  UNA SOLA LLAMADA A agregarItem, en el camino feliz, son 10 consultas y hasta 4");
    N.push("  escrituras: permisos, prenda, sucursal, stock, el carrito, el precio, el SELECT del");
    N.push("  upsert, el UPDATE o INSERT del item, el subtotal y la lista. Ninguna en transacción.");
    N.push("");
    N.push("  Y LA MÁS SUTIL, que es la del CARRITO A MEDIAS: el UPDATE de L387 escribe la cantidad");
    N.push("  nueva, y después L443 recalcula el subtotal. Si el recálculo falla, la cantidad está");
    N.push("  escrita y el subtotal no. Sin transacción, la pantalla puede mostrar un total que no");
    N.push("  corresponde a lo que hay en la tabla. Y eso es el número que ve el cliente.");
    N.push("");
    N.push("LO BUENO, Y HAY BASTANTE");
    N.push("");
    N.push("  1. EL PRECIO SE GUARDA. carrito_items tiene precio_unitario DECIMAL(10,2), schema.sql");
    N.push("     L381, y agregarItem lo escribe en las dos ramas, L388 y L417, con precioVigente,");
    N.push("     L369, que es una consulta propia. El carrito RECUERDA a qué precio se agrego cada");
    N.push("     prenda. Y es exactamente lo que CU22 hace mal: allí DetalleReserva calcula un total");
    N.push("     con precio_base de HOY y reserva_items no tiene columna de precio. El error");
    N.push("     opuesto, en otro caso, y aquí está bien.");
    N.push("");
    N.push("  2. EL UPSERT MANUAL ESTÁ BIEN HECHO, L371-441: primero mira si el item existe por la");
    N.push("     pareja id_carrito + id_ptc, L374, y luego UPDATE o INSERT. Y con el LIMIT 1 de");
    N.push("     L375, que hace que si hay dos filas con la misma prenda se actualice la primera. Es");
    N.push("     el mismo cuidado que CU24 L246, y el mismo que le falta a CU21 L384.");
    N.push("");
    N.push("  3. Y SU BITÁCORA TRAE EL ANTES Y EL DESPUÉS DE VERDAD, L406 y L407-411: la cantidad");
    N.push("     que había y la nueva, con el precio. Es el segundo sitio del proyecto con oldData");
    N.push("     real, y el primero en que el oldData es una cantidad que ha CAMBIADO.");
    N.push("");
    N.push("  4. Y EL INVITADO NO NECESITA PERMISO, y el guard es el único que lo hace:");
    N.push("     JwtOpcionalAuthGuard, no JwtAuthGuard. Es el único endpoint del proyecto que no");
    N.push("     exige sesión. Y el id_usuario se puede guardar como NULL: la columna lo permite.");
    N.push("");
    N.push("  5. Y EL CARRITO SE PASA DE INVITADO A USUARIO AL INICIAR SESIÓN, que es el L113-118:");
    N.push("     SET id_usuario = $1, token_invitado = NULL. El diseño está bien: comprar sin");
    N.push("     registro, y cuando te registras el carrito te espera. Es la idea de las carteras de");
    N.push("     Amazon. Y el que está roto es el esquema, no el código.");
    N.push("");
    N.push("  6. Y LAS TRES VALIDACIONES ANTES DE ESCRIBIR, L364-366, son un patrón que el resto de");
    N.push("     la serie debería copiar: la prenda, la sucursal y el stock, en ese orden, con su");
    N.push("     mensaje. Pero comprueban el estado del PRODUCTO y NO el del stock, igual que CU24.");
    N.push("");
    N.push("SOBRE LA COLOCACIÓN DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Anchura: las diez cabeceras separadas " + PASO + " px, con " + ANCHO_CAB + " de ancho. Quedan");
    N.push("  65 px entre una y otra. Altura: " + PASO_MSG + " px por mensaje. El mensaje 1 cae en la y " + Y_MSG0);
    N.push("  y el " + TOTAL_MSG + " en la y " + (Y_MSG0 + (TOTAL_MSG - 1) * PASO_MSG) + ".");
    N.push("");
    N.push("  Un detalle que hizo fallar estos diagramas quince veces y que conviene no olvidar: EA");
    N.push("  guarda Top y Bottom en NEGATIVO, porque trabaja en coordenadas cartesianas con la Y");
    N.push("  creciendo hacia arriba. Si se le pasa la Y en positivo no da error, simplemente no");
    N.push("  coloca nada y todos los objetos se quedan en el mismo punto. En las dos funciones de");
    N.push("  colocación de este script está escrito o.Top = 0 - y y o.Bottom = 0 - y - alto. En el");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU24 Secuencia", 0); } catch (e) { }
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
    T.push("CU24 - DIAGRAMA DE SECUENCIA - INFORME");
    T.push("");
    T.push("Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB);
    T.push("Tipo de diagrama: " + tipoUsado);
    T.push("Mensajes: " + r.puestos + " de " + TOTAL_MSG);
    T.push("Mensajes a sí mismo: " + r.autodestino);
    T.push("Conectores en el diagrama: " + r.enDiagrama);
    T.push("Hallazgos: " + h2.total + " de " + TOTAL_HAL + ", banda hasta la y " + h2.fin);
    T.push("");
    T.push("AVISO DE NUMERACIÓN");
    T.push("Este caso es CU24 en el documento y CU32 en el código, y el título");
    T.push("COINCIDE EXACTO. Tres endpoints: historial, crear y resultado.");
    T.push("");
    T.push("MARCOS Y BARRAS  <-- MIRA ESTO");
    T.push("Este caso tiene 2 alt y NINGUN loop. Contado antes de dibujar con");
    T.push("contadores, por separado en las dos mitades del caso:");
    T.push("  SRV_SesionesRaService.ts, 367 líneas");
    T.push("    for 0   while 0   Promise.all 0   continue 0   reduce 0   map 1");
    T.push("    if 19   throw 13   ternarios 24");
    T.push("    dataSource.query 10   em.query 0   transaction 0   try 0   catch 0");
    T.push("  VestidorRa.tsx, 1110 líneas");
    T.push("    for 3   while 1   Promise.all 0   map 0");
    T.push("    useState 19   useEffect 6   useRef 11   useCallback 7");
    T.push("    try 4   catch 9   requestAnimationFrame 7   setTimeout 0");
    T.push("El servicio NO tiene ni un bucle. Los 4 loop del caso están TODOS");
    T.push("en el cliente y son el relleno por inundación del motor:");
    T.push("  L130  for x: siembra la fila de arriba y la de abajo");
    T.push("  L134  for y: siembra la columna izquierda y la derecha");
    T.push("  L149  for...of: las cuatro esquinas");
    T.push("  L162  while: el relleno por inundación píxel a píxel");
    T.push("Por eso los 4 marcos van en la parte izquierda, en la lifeline");
    T.push("del cliente, y no en el backend.");
    T.push("Fragmentos colocados: " + MARCOS_PUESTOS + " de 2");
    T.push("Barras de activación colocadas: " + BARRAS_PUESTAS + " de 3");
    if (MARCOS_PUESTOS < 4 || BARRAS_PUESTAS < 2) {
        T.push("  Si alguno sale a 0, EA no ha aceptado la forma y hay que");
        T.push("  dibujarlo a mano en el diagrama.");
    } else {
        T.push("  Los 6 han salido. Son FORMAS dibujadas por script, no");
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
    msg = msg + "CU24 - Usar Vestidor Virtual con Realidad Aumentada" + SALTO;
    msg = msg + "Diagrama de secuencia, sección 3.3.2.1." + SALTO;
    msg = msg + "En el código del proyecto este caso es CU32, y el título" + SALTO;
    msg = msg + "COINCIDE EXACTO." + SALTO + SALTO;
    msg = msg + "10 líneas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "4 loop, TODOS en el cliente, y NINGUN alt." + SALTO;
    msg = msg + "Son el relleno por inundación de VestidorRa.tsx: L130," + SALTO;
    msg = msg + "L134, L149 y L162. El servicio, con 367 líneas, no tiene" + SALTO;
    msg = msg + "ni un bucle ni una transacción." + SALTO;
    msg = msg + "FRAGMENTOS colocados: " + MARCOS_PUESTOS + " de 4." + SALTO;
    msg = msg + "BARRAS colocadas: " + BARRAS_PUESTAS + " de 2." + SALTO;
    if (MARCOS_PUESTOS < 4 || BARRAS_PUESTAS < 2) msg = msg + "  Si falta alguno, hay que dibujarlo a mano." + SALTO;
    msg = msg + SALTO;
    msg = msg + "HALLAZGO GRAVE: la columna foto_resultado NO EXISTE en el" + SALTO;
    msg = msg + "esquema, y se nombra en 5 ficheros y 12 sitios. Se inserta" + SALTO;
    msg = msg + "en L158 y se lee en L326, con CERO ALTER TABLE en todo el" + SALTO;
    msg = msg + "proyecto. Así que 2 de los 3 endpoints fallan: el historial" + SALTO;
    msg = msg + "y el de crear. Solo sobrevive el del resultado." + SALTO + SALTO;
    msg = msg + "Y pide consultar_catalogo, L60, pero el rol Cliente del" + SALTO;
    msg = msg + "seed, L577, tiene ver_catalogo. Dos nombres para lo mismo y" + SALTO;
    msg = msg + "el cliente tiene el que nadie pide. CU41 también." + SALTO + SALTO;
    msg = msg + "Y NO ES REALIDAD AUMENTADA: no hay Three.js, ni WebXR, ni" + SALTO;
    msg = msg + "MediaPipe, ni A-Frame. Es un flood fill con tolerancia de" + SALTO;
    msg = msg + "color. Y modelo_3d_url existe y el frontend no lo usa." + SALTO + SALTO;
    msg = msg + "Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACIÓN: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU24 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU24 Secuencia", 0); } catch (e3) { }
}
