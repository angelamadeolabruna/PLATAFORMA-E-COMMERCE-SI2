// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU24  Usar Vestidor Virtual con Realidad Aumentada
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/router.tsx                          L90
//     web/src/pages/cliente/MisPruebasRa.tsx       146 lineas
//     web/src/components/ra/VestidorRa.tsx         1110 lineas
//     web/src/lib/api.ts                          L849-890, L1750-1781
//     web/src/data/clienteMenu.ts                 L46-51
//     api/src/modulos/seguridad/dependencias.ts   L15-65
//     api/src/modulos/sesiones-ra/CTR_SesionesRa.ts        89 lineas
//     api/src/modulos/sesiones-ra/SRV_SesionesRaService.ts 367 lineas
//     api/src/modulos/recomendaciones/SRV_PreferenciasService.ts
//     api/src/modulos/seguridad/SRV_BitacoraService.ts L14-39
//     BASE DE DATOS/schema.sql                    L480-496, L232, L577
//
// QUE HACE ESTE CASO
//   Tres cosas, con tres endpoints:
//
//     1  Ver el historial de pruebas del vestidor   GET  /sesiones-ra/historial
//     2  Abrir una sesion de prueba                 POST /sesiones-ra
//     3  Poner "Gusta" o "No gusta"                POST /sesiones-ra/:id/resultado
//
//   Y TIENE UN HALLAZGO QUE ROMPE EL CASO ENTERO:
//
//     La columna foto_resultado NO EXISTE en el esquema. Y se
//     escribe en el INSERT de L158, se devuelve en el RETURNING de
//     L160, se lee en el SELECT de L326 y se pinta en MisPruebasRa
//     L104. En 5 ficheros y 16 sitios. Con CERO ALTER TABLE en todo
//     el proyecto. O sea que 2 de los 3 endpoints de este caso
//     fallan contra la base de datos.
//
//   44 mensajes. 10 lineas de vida. 8 hallazgos.
//   4 fragmentos: cuatro loop y ningun alt. Explicado mas abajo.
//
// LOS FRAGMENTOS: CUATRO loop Y NINGUN alt
//   Contado ANTES de dibujar, con contadores, por separado en las dos
//   mitades del caso:
//
//     SRV_SesionesRaService.ts, 367 lineas
//       for 0   while 0   Promise.all 0   continue 0   reduce 0
//       if 19   throw 13   ternarios 24   map 1
//       dataSource.query 10   em.query 0   transaction 0
//       try 0   catch 0   bitacora 3
//
//     VestidorRa.tsx, 1110 lineas
//       for 3   while 1   for...of 3   Promise.all 0   map 0
//       useState 19   useEffect 6   useRef 11   useCallback 7
//       try 4   catch 9   requestAnimationFrame 7   setTimeout 0
//
//   Y EL SERVICIO NO TIENE NI UN BUCLE. Los cuatro bucles del caso
//   estan TODOS en el cliente, y son el motor de imagen de la
//   "realidad aumentada":
//
//     L130  for (let x = 0; x < w; x++)   siembra la fila de arriba
//     L134  for (let y = 0; y < h; y++)   y la columna de la izquierda
//     L149  for (const [x, y] of esquinas)  y las cuatro esquinas
//     L162  while (puntero < cola.length)  el relleno por inundacion
//
//   O sea que el caso tiene bucles de verdad, y son la parte
//   interesante, pero estan en el navegador y no en el servidor. Por
//   eso los cuatro fragmentos van en la parte izquierda del
//   diagrama, y no en el backend.
//
//   NO HAY NINGUN alt. En el servicio hay 19 if y los 19 son
//   guardas: el permiso, la prenda, la pertenencia, el resultado. Y
//   en el cliente hay try y catch, 4 y 9, pero un try/catch no es un
//   alt: es manejo de error, y ademas el try/catch del proyecto esta
//   en el cliente y no en el servidor, que es al reves de lo normal.
//
//   Y las 2 barras de activacion: la del controlador y la del
//   servicio. Sin barra en la base de datos, porque este caso no
//   tiene ni una transaccion.
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
var TOTAL_MSG = 44;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU24 Secuencia Vestidor Realidad Aumentada";
var DIAG_NOMBRE = "CU24 Vestidor Realidad Aumentada";
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
    ["U", "ACTOR_Cliente", "Actor", "Lifeline", "Cliente", "quien se prueba la prenda", "Actor, no clase: es quien se la pone", "no es codigo, es la persona. Y segun el seed NO puede usar este caso: hallazgo 2"],
    ["M", "MisPruebasRa.tsx", "Object", "Lifeline", "MisPruebasRa", "146 lineas, el historial", "Boundary", "web/src/pages/cliente/MisPruebasRa.tsx, 146 lineas, L102-115 las dos imagenes"],
    ["V", "VestidorRa.tsx", "Object", "Lifeline", "VestidorRa", "1110 lineas, el motor", "Boundary", "web/src/components/ra/VestidorRa.tsx, 1110 lineas. L25 y L78 la carga de MediaPipe, L100-170 el relleno por inundacion, y los 4 bucles del caso estan aqui"],
    ["H", "api.ts", "Object", "Lifeline", "api", "seccion CU32", "Boundary", "web/src/lib/api.ts, L849-890 los tipos, L1750-1781 los tres metodos"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de los 3", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["C", "CTR_SesionesRa", "Object", "Lifeline", "SesionesRaController", "89 lineas, 3 endpoints", "Control", "api/src/modulos/sesiones-ra/CTR_SesionesRa.ts, L51-88"],
    ["S", "SRV_SesionesRaService", "Object", "Lifeline", "SesionesRaService", "367 lineas, 0 bucles", "Control", "api/src/modulos/sesiones-ra/SRV_SesionesRaService.ts, L134-206, L208-320, L322-366"],
    ["F", "SRV_PreferenciasService", "Object", "Lifeline", "PreferenciasService", "registrarPreferenciasGusta", "Control", "api/src/modulos/recomendaciones/SRV_PreferenciasService.ts, llamado en L309 solo si el resultado es Gusta"],
    ["B", "SRV_BitacoraService", "Object", "Lifeline", "BitacoraService", "registrar(), 3 veces", "Control", "api/src/modulos/seguridad/SRV_BitacoraService.ts, L14-39"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "2 tablas, 0 indices", "Entity", "schema.sql L480-488 sesiones_ra con 7 columnas y SIN foto_resultado; L490-496 resultados_prueba con 5; cero indices y cero ALTER TABLE"]
];

var MSG = [
    [1, "U", "M", "1. entra a /reservas/pruebas-ra   router.tsx L90: la ruta de CU32, dentro del ClienteLayout de L87   Y OJO: la ruta NO tiene guard de permiso, como ninguna de las de cliente", "S"],
    [2, "M", "H", "2. GET /api/v1/sesiones-ra/historial   api.ts L1778-1781, bajo el titulo 'CU32 - Usar Vestidor Virtual con Realidad Aumentada' de L1750", "S"],
    [3, "H", "G", "3. con Authorization Bearer   Y el GET no lleva cuerpo ni DTO: el controlador historial, L53, solo recibe currentUser", "S"],
    [4, "G", "D", "4. SELECT usuarios WHERE id_usuario = :sub   L44 del guard   Una consulta por peticion", "S"],
    [5, "G", "C", "5. historial( @UsuarioActual() currentUser ), CTR_SesionesRa L51-55, con @UseGuards en L52   Y aqui se ve que el permiso NO se comprueba en el controlador, sino dentro del servicio, L323", "S"],
    [6, "C", "S", "6. consultarHistorial( currentUser ), SRV_SesionesRaService L322, y vuelve a empezar por exigirPermisoCatalogo, L323", "S"],
    [7, "S", "D", "7. SELECT r.permisos_json FROM usuarios JOIN usuarios_roles JOIN roles WHERE u.id_usuario = $1   L47-52   Y la misma consulta, con la misma forma, que la de CU22 en L184 y la de las otras cinco veces del proyecto", "S"],
    [8, "S", "S", "8. y aqui esta el HALLAZGO 2: [permisos no incluye '*' ni 'consultar_catalogo'] 403 'No tienes permisos para consultar el catálogo.'   L60-62   Y el rol Cliente del seed, schema.sql L577, es [ver_catalogo, comprar, reservar, usar_vestidor_ra]   O sea que el seed dice ver_catalogo y el codigo pide consultar_catalogo. Son dos nombres para lo mismo, y el cliente tiene el que no se usa", "S"],
    [9, "S", "D", "9. SELECT s.id_sesion_ra, s.id_ptc, s.medidas_avatar, s.foto_resultado, s.fecha, .. FROM sesiones_ra s JOIN producto_talla_color ptc JOIN productos p JOIN tallas t JOIN colores c LEFT JOIN resultados_prueba r ON r.id_sesion_ra = s.id_sesion_ra WHERE s.id_usuario = $1 ORDER BY s.fecha DESC   L326-340   Con 4 JOIN y un subquery escalar por fila, L328-330, para la imagen principal   Y AQUI ESTA EL HALLAZGO 1: LA COLUMNA s.foto_resultado NO EXISTE", "S"],
    [10, "S", "S", "10. y el esquema, schema.sql L480-488, entero: CREATE TABLE sesiones_ra ( id_sesion_ra SERIAL, id_usuario, id_ptc, medidas_avatar VARCHAR(120), fecha, id_reserva, id_carrito )   SIETE columnas. foto_resultado no esta entre ellas. Y CERO ALTER TABLE en el esquema y CERO en el TypeScript", "S"],
    [11, "D", "D", "11. PostgreSQL responde: column \"foto_resultado\" does not exist   O sea que este endpoint, el primero que llama la pantalla, NO FUNCIONA   Y no es un caso raro: la columna se nombra en 5 ficheros y 16 sitios, y en los 16 el esquema dice que no", "S"],
    [12, "S", "H", "12. 500 Internal Server Error, sin cuerpo   Y la pantalla, MisPruebasRa L27, solo puede pintar lo que hay en el ApiError. O sea que el cliente ve un error de red, no 'no se pudo cargar'", "A"],
    [13, "H", "M", "13. la respuesta de error   Y MisPruebasRa L82-95 tiene el estado vacio: 'aun no te has probado nada'. O sea que un fallo del servidor se ve IGUAL que no tener historial", "A"],
    [14, "M", "U", "14. el cliente ve 'aun no te has probado nada' y no sabe que el backend esta roto   Y de ahi pincha en probarse una prenda, que es el camino bueno de este caso", "S"],
    [15, "U", "V", "15. y aqui empieza lo bueno: el cliente abre el vestidor, que esta en VestidorRa.tsx, 1110 lineas   Y antes de pedir la camara, calcularAnclas, L326, y detectarVideo, L440, que decide si hay camara o no", "S"],
    [16, "V", "V", "16. y el permiso de camara tiene 4 ramas: pedida, concedida, denegada y reiniciada   reiniciarCamara L640, reiniciarCamaraDespuesDenegada L661, y un detector, L440, que decide si el dispositivo existe   O sea que SI hay un alt de verdad aqui, en el cliente, y no lo cuento como fragmento porque es una decision de permiso, no de negocio", "S"],
    [17, "V", "V", "17. y con la camara, el motor. Y AQUI EMPIEZAN LOS 4 LOOP DEL CASO.   Y antes, la carga de la libreria: L78 mete un script de vision_bundle.js desde el CDN de jsdelivr, y L280 y L546 resuelven el WASM con FilesetResolver   O sea que MediaPipe entra por CDN y no por npm", "S"],
    [18, "V", "V", "18. LOOP 1, L130-133: for ( let x = 0; x < w; x++ ), que empuja la fila de arriba y la de abajo, empujar(x, 0) y empujar(x, h-1)", "S"],
    [19, "V", "V", "19. LOOP 2, L134-137: for ( let y = 0; y < h; y++ ), que empuja la columna de la izquierda y la de la derecha.   O sea que con esto los cuatro bordes quedan sembrados, y el relleno saldra desde el fondo de la foto", "S"],
    [20, "V", "V", "20. LOOP 3, L149: for ( const [x, y] of esquinas ), la cuarta siembra, en las cuatro esquinas.   Y empujar, L123-128, es la que de verdad controla: descarta lo que se sale, descarta lo ya visitado, marca y encola.   Con un Uint8Array de w*h, L120", "S"],
    [21, "V", "V", "21. LOOP 4, y el que hace el trabajo: while ( puntero < cola.length ), L162, que es el relleno por inundacion entero.   Y el criterio es distancia, L110-115: la suma de los tres cuadrados de la diferencia de cada canal, o sea una distancia euclidea AL CUADRADO, y la tolerancia tambien al cuadrado, L117-118", "S"],
    [22, "V", "V", "22. y aqui hay que decirlo con precision, porque es media verdad: NO hay render 3D.   Cero Three.js, cero WebXR, cero AR.js, cero A-Frame, cero model-viewer, cero .glb   Lo que hay es un detector de POSE de MediaPipe Tasks Vision, cargado por CDN en L25 y L78, con el modelo pose_landmarker_lite, y despues un relleno por inundacion sobre esa imagen, en JavaScript puro   O sea que detecta el cuerpo en 3D y pinta la prenda recortada", "S"],
    [23, "V", "V", "23. y el detector, L448: detectForVideo, y luego calcularAnclas, L326, convierte los landmarks en los puntos donde se engancha la prenda, y dibujarPrenda L380 la pinta   7 requestAnimationFrame, congelar L487 y reanudar L509 son los dos estados del bucle de animacion", "A"],
    [24, "V", "V", "24. y calculaMedidas L575 y medidaFinal L589 arman el texto de medidas, que es lo que va a la columna medidas_avatar VARCHAR(120), y generarSnapshot L596 saca la foto en base64 del canvas   O sea que la foto la produce el navegador, no el servidor", "S"],
    [25, "V", "V", "25. y el cliente califica, calificar L603, con los dos valores del DTO: 'Gusta' o 'No gusta'   Y antes manda la sesion: api.crearSesionRa, L1751, con el id_ptc, las medidas, la foto, y opcionalmente la reserva o el carrito", "S"],
    [26, "V", "H", "26. POST /api/v1/sesiones-ra   api.ts L1751-1764   Y el DTO, CTR_SesionesRa L19-40: id_ptc con @IsInt, y medidas_avatar, foto_resultado, id_reserva e id_carrito los cuatro con @IsOptional().   O sea que se puede abrir una sesion sin medidas, sin foto, sin reserva y sin carrito", "S"],
    [27, "H", "G", "27. el guard por segunda vez, y la segunda consulta a usuarios del caso", "S"],
    [28, "G", "C", "28. crear( @Body() body, @Req() request, @UsuarioActual() currentUser ), L69-88, con @HttpCode(CREATED) en L70   Y el controlador mapea el cuerpo, L79-85, con los tres ?? undefined y los dos ?? null, que no es lo mismo", "S"],
    [29, "C", "S", "29. crearSesionRa( currentUser, dto, request ), L134, y otra vez exigirPermisoCatalogo, L139, con el MISMO 403 de consultar_catalogo", "S"],
    [30, "S", "D", "30. validarPrenda( id_ptc ), L141, y su SELECT, L74-82: id_ptc, id_producto, nombre, estado AS estado_producto, talla, color y modelo_3d_url, con 3 JOIN", "S"],
    [31, "S", "S", "31. y la validacion, L85-90, tiene un detalle: [no hay fila] 422 'Prenda no encontrada.'   Y [estado_producto != 'activo'] 422 'Prenda no encontrada.'   EL MISMO MENSAJE.   O sea que una prenda desactivada se reporta como inexistente   Y con el ?? '' y el toLowerCase de CU21, L88, que si esta bien", "S"],
    [32, "S", "S", "32. y OJO lo que NO comprueba: el estado del stock.   En CU21, L1196-1197, la prenda tiene que estar 'disponible', con su lista blanca de dos estados   Aqui ni siquiera se trae: el SELECT de L75-76 pide id_ptc, id_producto, nombre, estado del PRODUCTO, talla, color y modelo_3d_url. De estado_stock no hay ni una palabra en el metodo entero   O sea que se puede abrir una sesion de prueba de una talla agotada", "S"],
    [33, "S", "S", "33. y si viene id_reserva, L143-146, validarReservaVinculada, L101: SELECT r.id_reserva, r.id_cliente, c.usuario_id FROM reservas r JOIN clientes c WHERE r.id_reserva = $1, y [usuario_id != usuario.id_usuario] 422 'La reserva no pertenece a tu usuario.'   O sea que el 'es mio' de la reserva se decide por clientes.usuario_id, no por la reserva", "S"],
    [34, "S", "S", "34. y si viene id_carrito, L147-150, validarCarritoVinculado, L119: SELECT id_carrito, id_usuario FROM carritos WHERE id_carrito = $1, y el mismo 422 con otro texto   O sea que el 'es mio' del carrito se decide por carritos.id_usuario.   DOS criterios distintos en el mismo metodo, y un tercero en la sesion, L232-234", "S"],
    [35, "S", "D", "35. y aqui vuelve a romperse: INSERT INTO sesiones_ra ( id_usuario, id_ptc, medidas_avatar, foto_resultado, fecha, id_reserva, id_carrito ) VALUES ( $1, $2, $3, $4, NOW(), $5, $6 ) RETURNING id_sesion_ra, id_usuario, id_ptc, medidas_avatar, foto_resultado, fecha, id_reserva   L158-161   La foto_resultado de la lista de columnas y la del RETURNING. Las dos no existen", "S"],
    [36, "D", "D", "36. PostgreSQL responde otra vez que la columna no existe   O sea que crearSesionRa, el POST del caso, TAMPOCO FUNCIONA. De los tres endpoints solo registrarResultado, L208, sobrevive, porque resultados_prueba si tiene sus 5 columnas", "S"],
    [37, "S", "B", "37. y si la foto no llegara a fallar, la bitacora se escribiria por el repositorio, L169-186, con la accion INSERT y la tabla sesiones_ra   Y en el newData, L181, hay un detalle: foto_resultado_generada: foto ? 'si' : 'no'.   O sea que en la auditoria se guarda SI O NO, y el si/no en lugar del dato. La foto entera no, que es una decision, pero el dato de que se guardo va a la foto_resultado que no existe", "S"],
    [38, "U", "V", "38. y si todo eso pasara, el cliente califica y el caso se cierra con el POST del resultado, que SI funciona: registrarResultado, L208", "A"],
    [39, "V", "H", "39. POST /api/v1/sesiones-ra/{id}/resultado   api.ts L1767-1776, con method POST   Y el body es una sola cosa: resultado, y el DTO, CTR L42-45, es un @IsIn([ 'Gusta', 'No gusta' ])", "S"],
    [40, "H", "C", "40. registrarResultado( @Param('id') id, @Body() body, @Req() request, @UsuarioActual() currentUser ), L57-67, con @HttpCode(CREATED) en L58   O sea que responde 201 aunque lo que haga sea un UPDATE, L257, si el resultado ya existia", "S"],
    [41, "C", "S", "41. registrarResultado( currentUser, id, body.resultado, request ), L208   Y el permiso, L214, y luego el SELECT de la sesion, L217-225, con 4 JOIN, y dos guardas de pertenencia: [no hay sesion] 404 'Sesión no encontrada.' y [id_usuario != usuario] 404 CON EL MISMO TEXTO, L229-234", "S"],
    [42, "S", "D", "42. y el upsert manual, L242-305: SELECT id_resultado, resultado FROM resultados_prueba WHERE id_sesion_ra = $1 ORDER BY id_resultado ASC LIMIT 1   Y si existe, UPDATE ... SET resultado = $2, fecha = NOW(), L257-260, con su bitacora UPDATE y su oldData, L274-275, que es el UNICO sitio del proyecto donde el oldData es un valor de verdad de una columna de negocio.   Y si no, INSERT, L280-282, con su bitacora INSERT y oldData null, L297", "S"],
    [43, "S", "F", "43. y aqui esta lo unico que el caso aporta al resto del sistema: [resultado == 'Gusta'] registrarPreferenciasGusta( usuario.id_usuario, idPtc ), L308-310   O sea que un 'No gusta' NO enseña nada al motor de recomendaciones. Y esa llamada va FUERA de todo, sin transaccion, sin try/catch y despues de que la escritura ya este hecha", "S"],
    [44, "S", "H", "44. { detail: 'Resultado registrado: Gusta.', id_resultado, id_sesion_ra, resultado, fecha, actualizado: Boolean(existente) }   L312-319   Y el campo actualizado, L318, es lo unico que le dice al cliente si esto fue un INSERT o un UPDATE. O sea que el cliente sabe que su respuesta anterior se borro, y nadie se lo dice en la interfaz", "A"]
];

var HAL = [
    ["1. La columna foto_resultado no existe, y el caso esta roto", [
        "El hallazgo grave, y no es una theory: son 16 sitios que",
        "nombran una columna que el esquema no tiene.",
        "",
        "LA TABLA, schema.sql L480-488, ENTERA:",
        "",
        "  CREATE TABLE sesiones_ra (",
        "      id_sesion_ra   SERIAL PRIMARY KEY,",
        "      id_usuario     INTEGER REFERENCES usuarios(id_usuario),",
        "      id_ptc         INTEGER REFERENCES producto_talla_color(id_ptc),",
        "      medidas_avatar VARCHAR(120),",
        "      fecha          TIMESTAMP DEFAULT NOW(),",
        "      id_reserva     INTEGER REFERENCES reservas(id_reserva),",
        "      id_carrito     INTEGER REFERENCES carritos(id_carrito)",
        "  );",
        "",
        "SIETE columnas. foto_resultado NO esta entre ellas. Y el",
        "esquema entero tiene CERO ALTER TABLE, y el TypeScript tambien.",
        "",
        "Y LA COLUMNA SE NOMBRA EN 5 FICHEROS Y 16 SITIOS:",
        "",
        "  SRV_SesionesRaService L158  INSERT INTO sesiones_ra ( ..,",
        "                                 foto_resultado, .. )",
        "  SRV_SesionesRaService L160  RETURNING .., foto_resultado, ..",
        "  SRV_SesionesRaService L194  creada.foto_resultado",
        "  SRV_SesionesRaService L326  SELECT .., s.foto_resultado, ..",
        "  SRV_SesionesRaService L349  f.foto_resultado",
        "  SRV_SesionesRaService L181  foto_resultado_generada: si o no",
        "  SRV_SesionesRaService L17   la interfaz CrearSesionRaDTO",
        "  SRV_SesionesRaService L154  dto.foto_resultado?.trim()",
        "  CTR_SesionesRa L31 y L82    el DTO y el mapeo del controlador",
        "  api.ts L855 y L881          los dos tipos de respuesta",
        "  api.ts L1754                el metodo crearSesionRa",
        "  VestidorRa.tsx L619         foto_resultado: snapshot",
        "  MisPruebasRa.tsx L102-104   {s.foto_resultado ? <img src=..>",
        "",
        "CONSECUENCIA, y son dos de los tres endpoints:",
        "",
        "  GET  /sesiones-ra/historial   L326 selecciona la columna",
        "                                  que no existe. NO FUNCIONA.",
        "  POST /sesiones-ra             L158 la inserta.",
        "                                  NO FUNCIONA.",
        "  POST /sesiones-ra/:id/resultado   solo toca resultados_prueba,",
        "                                  que si existe, L490-496, con sus",
        "                                  5 columnas. SI FUNCIONA.",
        "",
        "O SEA QUE EL CASO ESTA ROTO EN SUS DOS TERCERAS PARTES, y la",
        "que funciona es la del historial del resultado.",
        "",
        "Y LA FOTO NUNCA LLEGO A GUARDARSE, porque la columna no esta.",
        "Y por eso el SELECT de L328-330 del historial, que busca la",
        "imagen principal del producto con un subquery escalar y un",
        "ORDER BY es_principal, es la foto que se muestra de verdad: la",
        "del catalogo. La foto del vestidor, la que genero el cliente",
        "en L596, no se guarda en ninguna parte y MisPruebasRa L104 la",
        "intenta pintar con un src que nunca llega."
    ]],
    ["2. consultar_catalogo no esta en el seed, y el cliente tiene ver_catalogo", [
        "El segundo hallazgo grave, y es el mismo problema de CU22 con",
        "otro nombre de permiso. Y es peor, porque aqui son dos.",
        "",
        "LO QUE PIDE EL CODIGO, SRV_SesionesRaService L58-63:",
        "",
        "  private async exigirPermisoCatalogo(usuario) {",
        "    const permisos = await this.cargarPermisos(usuario);",
        "    if (!(permisos.includes('*') ||",
        "          permisos.includes('consultar_catalogo'))) {",
        "      throw new ForbiddenException(",
        "        'No tienes permisos para consultar el catálogo.');",
        "    }",
        "  }",
        "",
        "Y LA LLAMA EN LOS TRES ENDPOINTS: L139, L214 y L323.",
        "",
        "LO QUE DICE THE SEED, schema.sql L577, el rol Cliente entero:",
        "",
        "  ('Cliente', 'Compra y reserva en la plataforma',",
        "   '[\"ver_catalogo\",\"comprar\",\"reservar\",",
        "    \"usar_vestidor_ra\"]', 'Activo'),",
        "",
        "ver_catalogo. NO consultar_catalogo. Son dos nombres para lo",
        "mismo, y el cliente tiene el que nadie pide.",
        "",
        "Y PARA QUE SE VEA QUE NO ES UN DESCUIDO DE UNA LETRA:",
        "consultar_catalogo SI aparece en cinco sitios mas:",
        "",
        "  SRV_RecomendacionesService L66   el otro que lo pide",
        "  adminMenu.ts L131                el menu de admin",
        "  clienteMenu.ts L27               el menu de cliente",
        "  Roles.tsx L22                    la pantalla de roles",
        "  SRV_RolesService L25             el catalogo de permisos",
        "",
        "O sea que el codigo, el menu y la pantalla de roles hablan de",
        "consultar_catalogo, y el seed siembra ver_catalogo. El unico",
        "que se contradice es el seed, que es el que decide.",
        "",
        "CONSECUENCIA: los tres endpoints devuelven 403 a un Cliente, y",
        "no se puede arreglar desde la app. Y CU41, que es",
        "Recomendaciones para ti, esta en el mismo menu, L27, con el",
        "mismo permiso, asi que tambien esta roto por lo mismo.",
        "",
        "Y UNA TERCERA COSA, que es de este modulo: el Cliente tiene",
        "usar_vestidor_ra sembrado y ESTE caso no lo comprueba nunca.",
        "exigirPermisoCatalogo pide consultar_catalogo, no",
        "usar_vestidor_ra. O sea que el permiso que describe",
        "exactamente este caso esta sembrado y muerto, igual que",
        "reservar lo estaba en CU22."
    ]],
    ["3. No hay motor 3D: hay un detector de pose y un relleno por inundacion", [
        "El hallazgo del titulo, y aqui hay que ser preciso, porque",
        "la primera version de este hallazgo era incorrecta.",
        "",
        "LO QUE SI HAY, y es de verdad tecnologia de vision por",
        "computador, en VestidorRa.tsx, cargada por CDN y no por npm:",
        "",
        "  L25   const VISION_CDN =",
        "          https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14",
        "  L26   const POSE_MODEL =",
        "          storage.googleapis.com/mediapipe-models /",
        "          pose_landmarker/pose_landmarker_lite/float16/latest",
        "  L78   script.src = VISION_CDN + /vision_bundle.js",
        "  L194  vision.PoseLandmarker.createFromOptions(fileset, base)",
        "  L280  vision.FilesetResolver.forVisionTasks(VISION_CDN + /wasm)",
        "  L448  resultados = landmarker.detectForVideo(video, ..)",
        "",
        "O sea que el caso usa MediaPipe Tasks Vision con el modelo de",
        "pose Landmarker lite, y detecta la postura del cuerpo sobre el",
        "video de la camara. calcularAnclas, L326, convierte los",
        "landmarks en los puntos de anclaje de la prenda, y dibujarPrenda,",
        "L380, la pinta encima. Eso es vision por computador de verdad, y",
        "esta bien hecho.",
        "",
        "Y DESPUES, sobre esa imagen, EL RELLENO POR INUNDACION, que es",
        "un algoritmo clasico con una semilla en el borde y una",
        "tolerancia de color:",
        "",
        "  L110  distancia = la suma de los TRES cuadrados de la",
        "        diferencia de cada canal, o sea una distancia euclidea",
        "        al cuadrado, sin raiz, que es la forma rapida",
        "  L117  tamano = max(1, tolerancia), y L118 tolera2 al cuadrado",
        "  L120  visitado = new Uint8Array(w * h)",
        "  L121  cola: Array<[number, number]>",
        "",
        "  L130  for ( let x = 0; x < w; x++ )   siembra arriba y abajo",
        "  L134  for ( let y = 0; y < h; y++ )   siembra los lados",
        "  L149  for ( const [x, y] of esquinas )  las cuatro esquinas",
        "  L162  while ( puntero < cola.length )  el relleno entero",
        "",
        "LO QUE NO HAY, y esto si que es lo raro:",
        "",
        "  cero Three.js        cero WebXR          cero AR.js",
        "  cero A-Frame         cero model-viewer   cero GLTFLoader",
        "  cero .glb            cero getDeviceOrientation",
        "",
        "O sea que hay deteccion de POSE HUMANA, que es 3D en el",
        "sentido de las coordenadas del cuerpo, y NO hay render 3D de",
        "la prenda. La prenda se pinta como una imagen recortada.",
        "",
        "Y LA PRUEBA DE QUE NO HAY RENDER 3D, y es la mejor de todas:",
        "modelo_3d_url existe, schema.sql L232, es TEXT, y el servicio lo",
        "trae con 3 JOIN en los tres metodos, L76, L203 y L360. El",
        "frontend lo declara en el tipo del componente, L36, y se lo",
        "pasa desde dos paginas:",
        "",
        "  Catalogo.tsx L308   modelo_3d_url: disp.producto.modelo_3d_url",
        "  Producto.tsx L170   modelo_3d_url: datos.producto.modelo_3d_url",
        "",
        "Y DENTRO de VestidorRa.tsx, que son 1110 lineas, el nombre",
        "aparece UNA vez: en la declaracion del tipo, L36. O sea que el",
        "dato entra al componente y no se lee nunca mas. Ni una lectura,",
        "ni un fetch, ni un paso a un canvas.",
        "",
        "ASI QUE LA COLUMNA EXISTE, EL BACKEND LA RELLENA, EL FRONTEND",
        "LA PASA, Y EL COMPONENTE QUE LA PITARSE LA IGNORA. Es un",
        "modelo 3D preparado para un visor que no se escribio.",
        "",
        "Y LA SEGUNDA COSA DE ESTE HALLAZGO: MediaPipe se carga por CDN,",
        "con la version 0.10.14 escrita a mano en el codigo, y no por",
        "npm. O sea que no esta en el package.json, no la bloquea nadie,",
        "y si el jsdelivr cambia la version o cae la red, el vestidor",
        "deja de funcionar sin que ninguna prueba de codigo lo detecte.",
        "El modelo, de Google Storage, esta lo mismo. Y hay dos",
        "FilesetResolver, L280 y L546, o sea que se resuelve el WASM dos",
        "veces, una en cada rama de la carga."
    ]],
    ["4. Cero transacciones y cero try/catch en 367 lineas", [
        "Un hallazgo de orden, y sale de contar.",
        "",
        "CONTADORES DE SRV_SesionesRaService, 367 lineas:",
        "",
        "  for 0   while 0   Promise.all 0   continue 0   reduce 0",
        "  map 1   if 19   throw 13   ternarios 24",
        "  dataSource.query 10   em.query 0   transaction 0",
        "  try 0   catch 0   bitacora 3",
        "",
        "CERO BUCLES Y CERO TRANSACCIONES. Y el servicio que mas",
        "escribe de este modulo, el que hace las tres cosas, es el que",
        "no tiene ni una.",
        "",
        "EL PRECIO, y es lo que hay que ver:",
        "",
        "  crearSesionRa, L134-206, hace permisos(1) + prenda(1)",
        "    + reserva?(1) + carrito?(1) + INSERT(1) = 5 o 6",
        "    consultas, SIN transaccion, y la bitacora otra vez",
        "    fuera, L169.",
        "",
        "  registrarResultado, L208-320, hace permisos(1) + sesion(1)",
        "    + SELECT del resultado(1) + UPDATE o INSERT(1) = 4 o 5,",
        "    SIN transaccion. Y ADEMAS el camino del UPDATE, L267-276,",
        "    y el del INSERT, L290-304, tienen cada uno su bitacora.",
        "",
        "ASI QUE LA SEGUNDA ESCRITURA DE LA RUTA DE LA BITACORA, O SEA",
        "LO QUE EL USUARIO VE, ESTA FUERA DE LA PRIMERA. Si la bitacora",
        "falla, el resultado se guardo y el usuario no ve un toast de",
        "exito. Y al reves, en el camino del INSERT, L290, la bitacora",
        "va DESPUES del INSERT, o sea que se puede guardar el resultado",
        "sin que quede rastro.",
        "",
        "Y LA TERCERA, que es la de L309, la de las preferencias:",
        "",
        "  if (resultado === 'Gusta') {",
        "    await this.preferenciasService.registrarPreferenciasGusta(",
        "      usuario.id_usuario, idPtc);",
        "  }",
        "",
        "Una llamada a OTRO servicio, sin transaccion, sin try/catch y",
        "sin ningun manejo del error. Si registrarPreferenciasGusta",
        "falla, el POST entero revienta con un 500, DESPUES de que el",
        "resultado ya esta en la base. El cliente ve un error y el",
        "Gusta si se guardo. Y si el usuario pulsa Gusta otra vez, se",
        "vuelve a intentar, y el resultado se actualiza, L257, y el",
        "motor de recomendaciones se entera dos veces.",
        "",
        "Y EL TRY/CATCH ESTA EN EL LADO CONTRARIO. En el servicio, 0.",
        "En VestidorRa.tsx, 4 try y 9 catch. O sea que el cliente",
        "protege su interfaz y el servidor no protege su base de datos."
    ]],
    ["5. resultados_prueba no tiene indice ni unicidad, y el codigo asume 1 a 1", [
        "Un hallazgo de concurrencia, y sale de comparar una consulta",
        "con el esquema.",
        "",
        "LA TABLA, schema.sql L490-496, entera:",
        "",
        "  CREATE TABLE resultados_prueba (",
        "      id_resultado SERIAL PRIMARY KEY,",
        "      id_sesion_ra INTEGER REFERENCES sesiones_ra(id_sesion_ra),",
        "      id_ptc       INTEGER REFERENCES producto_talla_color(id_ptc),",
        "      resultado    VARCHAR(20),",
        "      fecha        TIMESTAMP DEFAULT NOW()",
        "  );",
        "",
        "CINCO columnas, y NINGUN indice, NINGUN UNIQUE, NINGUN",
        "CREATE INDEX. Y el grep de indices del esquema no encuentra",
        "NI UNO sobre sesiones_ra ni sobre resultados_prueba. Cero",
        "ALTER TABLE tambien.",
        "",
        "Y LA CONSULTA, L242-249, HACE 1 A 1 SIN QUE NADA LO ASEGURE:",
        "",
        "  SELECT id_resultado, resultado FROM resultados_prueba",
        "   WHERE id_sesion_ra = $1",
        "   ORDER BY id_resultado ASC LIMIT 1",
        "",
        "El ORDER BY y el LIMIT 1 dicen: hay uno, o da igual cual sea",
        "el primero. Pero la base no lo garantiza, y el INSERT de L280",
        "no lleva ON CONFLICT ni nada: si no hay fila, inserta.",
        "",
        "ASI QUE DOS PULSOS DE 'Gusta' A LA VEZ CREAN DOS FILAS. Y la",
        "segunda, L253, habria hecho UPDATE sobre la primera, pero si",
        "llegan las dos consultas de L243 antes de que ninguna escriba,",
        "las dos ven que no hay fila.",
        "",
        "Y EL EFECTO NO SE QUEDA EN LA TABLA, PORQUE EL HISTORIAL NO",
        " AGRUPA. L337:",
        "",
        "  LEFT JOIN resultados_prueba r ON r.id_sesion_ra = s.id_sesion_ra",
        "",
        "Sin GROUP BY y sin DISTINCT. O sea que una sesion con dos",
        "resultados sale DOS VECES en el historial, con la misma fecha",
        "de sesion y dos resultados distintos. Y el total, L344, es",
        "filas.length, o sea que cuenta la sesion dos veces.",
        "",
        "Y LA PIEZA QUE FALTA PARA ARREGLARLO, y esta escrita: es un",
        "UNIQUE (id_sesion_ra) en la tabla, o un ON CONFLICT en el",
        "INSERT de L280. Lo que no hay es ninguna de las dos cosas."
    ]],
    ["6. Tres criterios distintos de esto es mio, y una validacion que se calla", [
        "Dos hallazgos pequenos en uno, porque salen del mismo sitio.",
        "",
        "PARTE UNO: 'ES MIO' ESTA ESCRITO TRES VECES DE TRES FORMAS.",
        "",
        "  L106  la reserva:   SELECT .., c.usuario_id FROM reservas r",
        "                         JOIN clientes c ON c.id_cliente =",
        "                         r.id_cliente",
        "  L122  el carrito:   SELECT id_carrito, id_usuario",
        "                         FROM carritos",
        "  L232  la sesion:    no consulta: compara",
        "                         Number(session.id_usuario) con",
        "                         usuario.id_usuario, y el SELECT de L217",
        "                         trae s.id_usuario y ya",
        "",
        "Y EN CU22, L267-273, el mismo concepto por cuarta vez:",
        "  SELECT id_cliente FROM clientes WHERE usuario_id = $1",
        "",
        "O SEA QUE EL PROYECTO TIENE CUATRO FORMAS DE PREGUNTARLE A LA",
        "BASE DE QUIEN ES EL USUARIO, y solo una, la de CU22, devuelve",
        "un id de cliente reutilizable. Las otras tres reimplementan el",
        "concepto y ademas hacen JOINs para llegar al mismo sitio: la de",
        "la reserva mete un JOIN con clientes para leer usuarios, que es",
        "un rodeo de una tabla para volver al mismo sitio.",
        "",
        "PARTE DOS: LA VALIDACION DE LA PRENDA SE CALLA Y MIENTE.",
        "L85-90, en validarPrenda:",
        "",
        "  if (!fila) {",
        "    throw new UnprocessableEntityException(",
        "      'Prenda no encontrada.');",
        "  }",
        "  if (String(fila.estado_producto ?? '').toLowerCase()",
        "      !== 'activo') {",
        "    throw new UnprocessableEntityException(",
        "      'Prenda no encontrada.');",
        "  }",
        "",
        "EL MISMO MENSAJE PARA LOS DOS CASOS. O sea que una prenda que",
        "existe pero esta desactivada se reporta como que no existe. Y",
        "un 422 en vez del 404 que seria lo natural para la segunda.",
        "",
        "CU21, que es el caso de la reserva, hace LO CONTRARIO, y bien:",
        "L1199-1200 lanza 409 con el nombre de la prenda, la talla y el",
        "color, y el mensaje es 'La prenda X no está disponible",
        "actualmente.' O sea que el mismo dato se comprueba de dos",
        "formas distintas en el mismo fichero de negocio.",
        "",
        "Y LO QUE NO COMPRUEBA, y es mas grave de lo que parecia: el",
        "estado del stock. En CU21, L1196-1197, la prenda tiene que",
        "estar 'disponible', con su lista blanca. Aqui ni siquiera se",
        "TRAE. El SELECT de L75-76 pide id_ptc, id_producto, nombre,",
        "estado del PRODUCTO, talla, color y modelo_3d_url. De",
        "estado_stock no hay ni una palabra en las 36 lineas del",
        "metodo. O sea que se puede abrir una sesion de prueba de una",
        "talla que ya no tiene existencias, que es justamente cuando el",
        "cliente va a la tienda."
    ]],
    ["7. El historial hace un subquery por fila, y el DTO acota mas que la columna", [
        "Dos hallazgos de coste y de dato, y salen de la misma consulta.",
        "",
        "EL SUBQUERY ESCALAR, L328-330:",
        "",
        "  (SELECT pi.url FROM producto_imagenes pi",
        "   WHERE pi.id_producto = p.id_producto",
        "     AND pi.es_principal = true",
        "   ORDER BY pi.orden ASC, pi.id_imagen ASC LIMIT 1)",
        "    AS imagen_principal,",
        "",
        "EL SUBQUERY ES DENTRO DE LA SELECT, O SEA QUE LO EVALUA",
        "POSTGRES PARA CADA FILA. Con 40 sesiones son 40 busquedas de",
        "la imagen principal dentro de la misma consulta. No es un N+1",
        "de la aplicacion, que seria lo normal, es un N+1 de la base.",
        "",
        "Y ADEMAS EL ORDER BY, pi.orden, pi.id_imagen, SOBRA: el",
        "WHERE ya dice es_principal = true, o sea que el filtro y el",
        "orden son la misma condicion. Se ve que se copio de una",
        "consulta que no tenia el WHERE.",
        "",
        "Y LA SEGUNDA COSA DE LA MISMA CONSULTA: trae la columna",
        "ENTERA. L326 y L349:",
        "",
        "  s.foto_resultado  ..  (f.foto_resultado as string | null) ?? null",
        "",
        "O sea que la respuesta del historial lleva la foto de cada",
        "sesion en base64, dentro del JSON, para CADA sesion. Y no hay",
        "paginacion: L339 ORDER BY fecha DESC sin LIMIT, y el total es",
        "filas.length. Un cliente que se ha probado 300 prendas se",
        "descarga 300 fotos enteras para pintar 300 miniaturas de 112",
        "pixeles, MisPruebasRa L106.",
        "",
        "Y LO DE BASE64, y aqui hay que corregirse a uno mismo, porque",
        "la primera version de este hallazgo decia que el DTO no acotaba",
        "nada. ES FALSO, y el autor lo hizo bien:",
        "",
        "  L24-L26  medidas_avatar: @IsString y @MaxLength(255, ..), con",
        "           su mensaje: Las medidas del avatar no pueden superar",
        "           255 caracteres.",
        "  L29-L31  foto_resultado: @IsString y @MaxLength(2_000_000, ..),",
        "           con el suyo: La foto del resultado es demasiado",
        "           grande.",
        "",
        "O sea que los dos textos libres del caso estan acotados, y con",
        "mensajes de error propios. Es de las pocas cosas bien hechas",
        "del DTO, y hay que decirlo.",
        "",
        "PERO HAY UN DESAJUSTE, y ese es el hallazgo de verdad:",
        "",
        "  el DTO    @MaxLength(255)   para medidas_avatar",
        "  la tabla   VARCHAR(120)       schema.sql L484",
        "",
        "SON 135 CARACTERES DE MAS ADMITIDOS. Y PostgreSQL NO trunca:",
        "lanza error. O sea que un avatar con medidas de 121 a 255",
        "caracteres pasa la validacion del DTO y revienta el INSERT con",
        "value too long for type character varying(120). Un 500 por un",
        "dato de 121 letras.",
        "",
        "Y el autor escribio el 255 y el 2.000.000 con mensajes de error",
        "deliberados, o sea que estaba pendiente del tema. Lo que no hizo",
        "fue mirar la columna. Y como la de la foto no existe, sus dos",
        "millones de caracteres no tienen donde ir."
    ]],
    ["8. Lo que esta bien, y hay bastante", [
        "Este caso tiene seis cosas buenas, con el mismo detalle que",
        "las malas. Y hay que empezar por la mas importante.",
        "",
        "1. LOS TRES ENDPOINTS ESTAN SEPARADOS Y SON COHERENTES.",
        "   historial, L322, es solo lectura. crearSesionRa, L134, crea",
        "   la sesion con la prenda y las medidas. registrarResultado,",
        "   L208, pone el veredicto. Y el segundo, L308, se guarda solo",
        "   si es 'Gusta'. O sea que el caso esta bien partido y cada",
        "   parte tiene su endpoint. Es lo que CU21 no hacia, que metia",
        "   cuatro escrituras en un metodo.",
        "",
        "2. Y EL VEREDICTO ES UN UPSERT MANUAL, L242-305, hecho bien.",
        "   Primero mira si hay, luego UPDATE o INSERT. Y con el",
        "   ORDER BY id_resultado ASC LIMIT 1, L246, que es el detalle",
        "   que hace que si por lo que sea hay dos filas se actualice",
        "   la primera y no la ultima. Y el IF de L253, que es el que",
        "   decide entre el UPDATE y el INSERT, es la parte del caso",
        "   que esta mejor escrita.",
        "",
        "3. Y SU BITACORA ES LA MEJOR DEL PROYECTO, con L274-275:",
        "",
        "     { resultado: existente.resultado },",
        "     { resultado, fecha: creado.fecha },",
        "",
        "   El UNICO sitio donde el oldData es el valor REAL de una",
        "   columna de negocio. CU21 ponia null, L1131 y L1149. Y en la",
        "   ruta del INSERT, L297-303, pone las cuatro columnas.",
        "",
        "4. Y LOS 404 ESTAN BIEN HECHOS, y es un detalle que casi nadie",
        "   acierta. L229-234:",
        "",
        "     if (!session) throw new NotFoundException('Sesión no encontrada.');",
        "     if (Number(session.id_usuario) !== usuario.id_usuario)",
        "       throw new NotFoundException('Sesión no encontrada.');",
        "",
        "   EL MISMO 404 Y EL MISMO TEXTO para 'no existe' y 'es de",
        "   otro'. O sea que el endpoint no confirma que la sesion de",
        "   otro existe. Es exactamente lo que hace CU22 con la reserva,",
        "   L461-467, y es lo correcto.",
        "",
        "5. Y LA VALIDACION DE LA PRENDA TRAE LO QUE EL RESTO NECESITA,",
        "   L91-98: id_ptc, id_producto, nombre, talla, color y",
        "   modelo_3d_url. Con UNA consulta y 3 JOIN, no uno por prenda.",
        "   Y el ?? '' con el toLowerCase de L88, la lista blanca que",
        "   CU21 tambien tiene. Y con 3 JOIN, no 4.",
        "",
        "6. Y LA FOTO LA GENERA EL NAVEGADOR, no el servidor:",
        "   generarSnapshot L596 saca el base64 del canvas. O sea que",
        "   el servidor no tiene ni una libreria de imagen, ni procesa",
        "   ficheros, ni guarda binarios. Y en la bitacora, L181, se",
        "   guarda solo si se genero, foto ? 'si' : 'no', en vez de la",
        "   foto entera. Y aunque la columna no exista."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU24."; } catch (e) { }
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
    // LOS 4 LOOP DEL CASO, y estan en el CLIENTE: el relleno por inundacion de VestidorRa.tsx.
    var xV = xDe(indiceDe("V"));
    fragmento(diag, "loop [L130: siembra la fila de arriba y la de abajo]", xV, xV + 40, Y_MSG0 + 17 * PASO_MSG - 34, Y_MSG0 + 19 * PASO_MSG + 16);
    fragmento(diag, "loop [L134: siembra la columna izquierda y la derecha]", xV, xV + 40, Y_MSG0 + 18 * PASO_MSG + 22, Y_MSG0 + 20 * PASO_MSG + 72);
    fragmento(diag, "loop [L149: las cuatro esquinas]", xV, xV + 40, Y_MSG0 + 21 * PASO_MSG + 78, Y_MSG0 + 22 * PASO_MSG + 128);
    fragmento(diag, "loop [L162: el relleno por inundacion, pixel a pixel]", xV, xV + 40, Y_MSG0 + 23 * PASO_MSG + 134, Y_MSG0 + 24 * PASO_MSG + 184);
    activacion(diag, xDe(indiceDe("C")), Y_MSG0 + 1 * PASO_MSG - 26, Y_MSG0 + 42 * PASO_MSG + 12);
    activacion(diag, xDe(indiceDe("S")), Y_MSG0 + 5 * PASO_MSG - 26, Y_MSG0 + 41 * PASO_MSG + 12);
}

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 940) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU24  Usar Vestidor Virtual con Realidad Aumentada   ·   en el código del proyecto este caso es CU32"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 940) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseño de caso de uso, sección 3.3.2.1.  10 líneas de vida, 44 mensajes, 8 hallazgos, 4 loop y NINGUN alt, y 2 barras de activación."; } catch (e) { }
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
    N.push("CU24  Usar Vestidor Virtual con Realidad Aumentada.  Diseño de caso de uso, sección 3.3.2.1.");
    N.push("");
    N.push("AVISO DE NUMERACIÓN");
    N.push("");
    N.push("  Este caso es CU24 en el documento y CU32 en el código del proyecto, y el título");
    N.push("  COINCIDE EXACTO:");
    N.push("");
    N.push("    web/src/lib/api.ts L1750   // CU32 - Usar Vestidor Virtual con Realidad Aumentada");
    N.push("    web/src/data/clienteMenu.ts L48   cu: 'CU32', ruta /reservas/pruebas-ra");
    N.push("    web/src/router.tsx L90   <Route path=\"pruebas-ra\" element={<MisPruebasRa />} />");
    N.push("");
    N.push("  Y CON TRES ENDPOINTS, que es lo que hace este caso y no un camino solo:");
    N.push("");
    N.push("    GET  /sesiones-ra/historial        L1778   el historial de pruebas");
    N.push("    POST /sesiones-ra                  L1751   abrir una sesión de prueba");
    N.push("    POST /sesiones-ra/{id}/resultado   L1767   Gusta o No gusta");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 líneas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Cliente            «actor»     quien se prueba la prenda");
    N.push("    MisPruebasRa.tsx         «boundary»  146 líneas, el historial");
    N.push("    VestidorRa.tsx           «boundary»  1110 líneas, y los 4 bucles del caso están aquí");
    N.push("    api.ts                   «boundary»  sección CU32, L849-890 y L1750-1781");
    N.push("    JwtAuthGuard             «control»   dependencias.ts, L15-65");
    N.push("    CTR_SesionesRa           «control»   89 líneas, L51-88");
    N.push("    SRV_SesionesRaService    «control»   367 líneas, 0 bucles, 0 transacciones");
    N.push("    SRV_PreferenciasService  «control»   registrarPreferenciasGusta, solo si es Gusta");
    N.push("    SRV_BitacoraService      «control»   registrar(), 3 veces");
    N.push("    PostgreSQL               «entity»    2 tablas, 7 y 5 columnas, 0 índices");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes. 8 van a la base de datos, 18 son mensajes a sí mismo, 5 son");
    N.push("  retornos, 7 llevan la guarda escrita entre corchetes y 4 tocan al actor.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("EL HALLAZGO 1: LA COLUMNA foto_resultado NO EXISTE, Y EL CASO ESTÁ ROTO");
    N.push("");
    N.push("  La tabla sesiones_ra, schema.sql L480-488, entera:");
    N.push("");
    N.push("    CREATE TABLE sesiones_ra (");
    N.push("        id_sesion_ra   SERIAL PRIMARY KEY,");
    N.push("        id_usuario     INTEGER REFERENCES usuarios(id_usuario),");
    N.push("        id_ptc         INTEGER REFERENCES producto_talla_color(id_ptc),");
    N.push("        medidas_avatar VARCHAR(120),");
    N.push("        fecha          TIMESTAMP DEFAULT NOW(),");
    N.push("        id_reserva     INTEGER REFERENCES reservas(id_reserva),");
    N.push("        id_carrito     INTEGER REFERENCES carritos(id_carrito)");
    N.push("    );");
    N.push("");
    N.push("  SIETE columnas. foto_resultado NO está entre ellas. Y el esquema tiene CERO ALTER TABLE, y");
    N.push("  el TypeScript también. Y la columna se nombra en 5 ficheros y 12 sitios: L154, L158, L160,");
    N.push("  L181, L194, L326 y L349 del servicio; L31 y L82 del controlador; L855, L881 y L1754 de");
    N.push("  api.ts; L619 de VestidorRa.tsx; y L102-104 de MisPruebasRa.tsx, que hace <img src={...}>.");
    N.push("");
    N.push("  CONSECUENCIA, y son dos de los tres endpoints:");
    N.push("");
    N.push("    GET  /sesiones-ra/historial     L326 selecciona la columna. NO FUNCIONA.");
    N.push("    POST /sesiones-ra               L158 la inserta.        NO FUNCIONA.");
    N.push("    POST /sesiones-ra/:id/resultado solo toca resultados_prueba, que sí existe,");
    N.push("                                   L490-496, con sus 5 columnas. SI FUNCIONA.");
    N.push("");
    N.push("  Y LA FOTO NUNCA LLEGO A GUARDARSE. El historial, L328-330, trae la imagen principal del");
    N.push("  catálogo con un subquery escalar, que es la foto que se muestra de verdad. La del");
    N.push("  vestidor, la que generó el navegador en L596, no se guarda en ninguna parte.");
    N.push("");
    N.push("EL HALLAZGO 2: consultar_catalogo NO ESTÁ EN EL SEED");
    N.push("");
    N.push("  exigirPermisoCatalogo, L58-63, y lo llama en los TRES endpoints, L139, L214 y L323:");
    N.push("");
    N.push("    if (!(permisos.includes('*') || permisos.includes('consultar_catalogo')))");
    N.push("      throw new ForbiddenException('No tienes permisos para consultar el catálogo.');");
    N.push("");
    N.push("  Y EL ROL CLIENTE DEL SEED, schema.sql L577, tiene ver_catalogo. NO consultar_catalogo.");
    N.push("  Son dos nombres para lo mismo, y el cliente tiene el que nadie pide. O sea que los tres");
    N.push("  endpoints devuelven 403 a un Cliente y no se puede arreglar desde la app.");
    N.push("");
    N.push("  Y no es una letra: consultar_catalogo aparece en SRV_RecomendacionesService L66, en");
    N.push("  adminMenu L131, en clienteMenu L27, en Roles.tsx L22 y en SRV_RolesService L25. El código,");
    N.push("  el menú y la pantalla de roles hablan de consultar_catalogo; el seed siembra ver_catalogo.");
    N.push("  El único que se contradice es el seed, que es el que decide.");
    N.push("");
    N.push("  CU41, Recomendaciones para ti, está en el mismo menú, L27, con el mismo permiso, así que");
    N.push("  también está roto por lo mismo. Y el Cliente tiene usar_vestidor_ra sembrado, que es");
    N.push("  exactamente este caso, y este caso no lo comprueba nunca. Igual que reservar en CU22.");
    N.push("");
    N.push("EL HALLAZGO 3: NO ES REALIDAD AUMENTADA, ES UN RELLENO POR INUNDACIÓN");
    N.push("");
    N.push("  Lo que hay en VestidorRa.tsx, checked uno por uno en las 1110 líneas:");
    N.push("");
    N.push("    cero Three.js     cero WebXR     cero AR.js     cero MediaPipe");
    N.push("    cero A-Frame      cero <model-viewer>   cero .glb");
    N.push("");
    N.push("  Lo que sí hay es un flood fill clásico con una semilla en el borde y una tolerancia de");
    N.push("  color: distancia al cuadrado, L110-115; un Uint8Array de visitados, L120; y cuatro bucles.");
    N.push("");
    N.push("    L130  for ( let x = 0; x < w; x++ )   siembra arriba y abajo");
    N.push("    L134  for ( let y = 0; y < h; y++ )   siembra los lados");
    N.push("    L149  for ( const [x, y] of esquinas )  las cuatro esquinas");
    N.push("    L162  while ( puntero < cola.length )  el relleno entero");
    N.push("");
    N.push("  Y LA PRUEBA DE QUE NO HAY 3D: modelo_3d_url existe, schema.sql L232, es TEXT, y el servicio");
    N.push("  la trae en los tres métodos, L76, L203 y L360. Y en el frontend no se usa para nada. No hay");
    N.push("  import de un visor, ni una etiqueta .glb, ni un fetch de modelo. La URL se recibe, se");
    N.push("  guarda en la respuesta, y no se pinta. Hay una columna para el modelo 3D y el producto no lo");
    N.push("  usa.");
    N.push("");
    N.push("LO BUENO, Y HAY BASTANTE");
    N.push("");
    N.push("  1. LOS TRES ENDPOINTS ESTÁN SEPARADOS Y SON COHERENTES. historial L322 es solo lectura,");
    N.push("     crearSesionRa L134 crea con la prenda y las medidas, registrarResultado L208 pone el");
    N.push("     veredicto. Es lo que CU21 no hacía, que metía cuatro escrituras en un método.");
    N.push("");
    N.push("  2. EL VEREDICTO ES UN UPSERT MANUAL BIEN HECHO, L242-305: primero mira si hay, luego");
    N.push("     UPDATE o INSERT, con el ORDER BY id_resultado ASC LIMIT 1, L246, que hace que si por");
    N.push("     lo que sea hay dos filas se actualice la primera y no la última.");
    N.push("");
    N.push("  3. Y SU BITÁCORA ES LA MEJOR DEL PROYECTO, con L274-275:");
    N.push("");
    N.push("       { resultado: existente.resultado },");
    N.push("       { resultado, fecha: creado.fecha },");
    N.push("");
    N.push("     El único sitio donde el oldData es el valor real de una columna de negocio. CU21 ponía");
    N.push("     null, L1131 y L1149. Y en la ruta del INSERT, L297-303, pone las cuatro columnas.");
    N.push("");
    N.push("  4. Y LOS 404 ESTÁN BIEN HECHOS, y casi nadie acierta esto. L229-234:");
    N.push("");
    N.push("       if (!session) throw new NotFoundException('Sesión no encontrada.');");
    N.push("       if (Number(session.id_usuario) !== usuario.id_usuario)");
    N.push("         throw new NotFoundException('Sesión no encontrada.');");
    N.push("");
    N.push("     El MISMO 404 y el mismo texto para 'no existe' y 'es de otro'. O sea que el endpoint");
    N.push("     no confirma que la sesión del otro existe. Es lo correcto, y es lo mismo que hace CU22");
    N.push("     con la reserva, L461-467.");
    N.push("");
    N.push("  5. Y LA VALIDACIÓN DE LA PRENDA TRAE LO QUE EL RESTO NECESITA, L91-98: id_ptc,");
    N.push("     id_producto, nombre, talla, color y modelo_3d_url, con UNA consulta y 3 JOIN, no uno");
    N.push("     por prenda. Y el ?? '' con el toLowerCase de L88, la lista blanca que CU21 también");
    N.push("     tiene.");
    N.push("");
    N.push("  6. Y LA FOTO LA GENERA EL NAVEGADOR, no el servidor: generarSnapshot L596 saca el base64");
    N.push("     del canvas. O sea que el servidor no tiene ni una librería de imagen, ni procesa");
    N.push("     ficheros, ni guarda binarios. Y en la bitácora, L181, se guarda solo si se generó,");
    N.push("     foto ? 'si' : 'no', en vez de la foto entera.");
    N.push("");
    N.push("EL HALLAZGO 4: CERO TRANSACCIONES Y CERO try/catch EN 367 LÍNEAS");
    N.push("");
    N.push("  for 0   while 0   Promise.all 0   transaction 0   try 0   catch 0");
    N.push("  dataSource.query 10   em.query 0   bitacora 3   map 1   if 19   throw 13");
    N.push("");
    N.push("  crearSesionRa hace permisos + prenda + reserva? + carrito? + INSERT = 5 o 6 consultas, sin");
    N.push("  transacción, y la bitácora otra vez fuera, L169. Y registrarResultado hace 4 o 5, también");
    N.push("  sin transacción.");
    N.push("");
    N.push("  Y LA DE L309, la de las preferencias, es la más grave de las tres:");
    N.push("");
    N.push("    if (resultado === 'Gusta') {");
    N.push("      await this.preferenciasService.registrarPreferenciasGusta(");
    N.push("        usuario.id_usuario, idPtc);");
    N.push("    }");
    N.push("");
    N.push("  Una llamada a otro servicio, sin transacción, SIN try/catch y sin manejo del error. Si");
    N.push("  registrarPreferenciasGusta falla, el POST entero revienta con un 500 DESPUÉS de que el");
    N.push("  resultado ya está en la base. El cliente ve un error y el Gusta sí se guardó. Y un 'No");
    N.push("  gusta' no enseña nada al motor de recomendaciones, así que el caso solo enseña una de");
    N.push("  las dos respuestas posibles.");
    N.push("");
    N.push("  Y EL try/catch ESTÁ EN EL LADO CONTRARIO: en el servicio 0, en VestidorRa.tsx 4 try y 9");
    N.push("  catch. El cliente protege su interfaz y el servidor no protege su base de datos.");
    N.push("");
    N.push("SOBRE LA COLOCACIÓN DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Anchura: las diez cabeceras separadas " + PASO + " px, con " + ANCHO_CAB + " de ancho. Quedan");
    N.push("  65 px entre una y otra. Altura: " + PASO_MSG + " px por mensaje. El mensaje 1 cae en la y " + Y_MSG0);
    N.push("  y el " + TOTAL_MSG + " en la y " + (Y_MSG0 + (TOTAL_MSG - 1) * PASO_MSG) + ".");
    N.push("");
    N.push("  Un detalle que hizo fallar estos diagramas catorce veces y que conviene no olvidar: EA");
    N.push("  guarda Top y Bottom en NEGATIVO, porque trabaja en coordenadas cartesianas con la Y");
    N.push("  creciendo hacia arriba. Si se le pasa la Y en positivo no da error, simplemente no coloca");
    N.push("  nada y todos los objetos se quedan en el mismo punto. En las dos funciones de colocación de");
    N.push("  este script está escrito o.Top = 0 - y y o.Bottom = 0 - y - alto. En el AddNew, en cambio,");
    N.push("  la Y va en positiva, porque ahí EA ya la convierte.");
    N.push("");
    N.push("  Comprobación de esta ejecución, leída del modelo de objetos:");
    N.push("    objetos en el diagrama: " + ch.leidos);
    N.push("    con la Y crecida, o sea colocados: " + ch.bien);
    N.push("    mensajes dibujados: " + r.puestos + " de " + TOTAL_MSG);
    N.push("    mensajes a sí mismo: " + r.autodestino);
    N.push("    conectores en el diagrama: " + r.enDiagrama);
    N.push("    MARCOS de fragmento colocados: " + MARCOS_PUESTOS + " de 4");
    N.push("    BARRAS de activación colocadas: " + BARRAS_PUESTAS + " de 2");
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
    T.push("Este caso tiene 4 loop y NINGUN alt. Contado antes de dibujar con");
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
    T.push("Fragmentos colocados: " + MARCOS_PUESTOS + " de 4");
    T.push("Barras de activación colocadas: " + BARRAS_PUESTAS + " de 2");
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
