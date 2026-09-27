// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU32  Recomendar Prendas con IA
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/router.tsx                             L97, /recomendaciones
//     web/src/pages/cliente/Recomendaciones.tsx      182 lineas
//     web/src/data/clienteMenu.ts                    L20-32, el CU41 del menu
//     web/src/lib/api.ts                             L2041-2045 y L2077-2099
//     api/src/modulos/seguridad/dependencias.ts      JwtOpcionalAuthGuard
//     api/src/modulos/recomendaciones/CTR_Recomendaciones.ts   16 lineas
//     api/src/modulos/recomendaciones/SRV_RecomendacionesService.ts  320
//     api/src/modulos/recomendaciones/SRV_ScoringService.ts        188
//     api/src/modulos/recomendaciones/SRV_PreferenciasService.ts    131
//     api/src/modulos/sesiones-ra/SRV_SesionesRaService.ts    L307-310
//     BASE DE DATOS/schema.sql   L478, L499, L501-509, L577
//
// QUE HACE ESTE CASO
//   Un endpoint, GET /recomendaciones, y con una bifurcacion que lo
//   cambia TODO:
//
//     el guard es OPCIONAL, JwtOpcionalAuthGuard, o sea que un
//     visitante sin sesion tambien entra
//
//   Y HAY TRES CAMINOS:
//
//     1  ANONIMO, o sin perfil.  Se devuelven las mas vendidas de
//        la temporada, con el motivo fijo 'Populares de esta
//        temporada', L229.   CERO personalization.
//
//     2  CON PERFIL.  Se arman 4 mapas de afinidad con 3 bucles, se
//        traen TODOS los candidatos, y luego se intenta una IA
//        externa con un POST y 4 segundos de timeout.   Si la IA no
//        esta, falla o expira, se degrada a una heuristica
//        interna de pesos, y eso lo dice el campo fuente de la
//        respuesta.
//
//     3  SIN CANDIDATOS.  Se devuelve una lista vacia con fuente
//        'scoring_interno', L279, lo cual es un texto que no
//        corresponde a lo que ha pasado.
//
//   37 mensajes. 9 lineas de vida. 8 hallazgos.
//   6 fragmentos: cinco loop y un alt. Explicado mas abajo.
//
// LOS FRAGMENTOS: CINCO loop Y UN alt
//   Contado ANTES de dibujar, con contadores, por servicio, porque
//   este caso es el primero que reparte sus bucles en TRES ficheros
//   distintos del mismo modulo:
//
//     SRV_RecomendacionesService, 320 lineas
//       for 3   while 0   whileEach 0   Promise.all 0   continue 0
//       map( 5   filter( 0   sort( 1   if 11   throw 1
//       dataSource.query 9   em.query 0   transaction( 0
//       try 0   catch 0   ternarios 20
//
//     SRV_ScoringService, 188 lineas
//       for 2   while 0   continue 1   map( 1   filter( 0   sort( 0
//       if 11   throw 0   dataSource.query 0   transaction( 0
//       try 1   catch 1   ternarios 2
//
//     SRV_PreferenciasService, 131 lineas
//       for 1   while 0   map( 1   filter( 1   if 6   throw 0
//       dataSource.query 7   try 0   catch 0   ternarios 7
//
//   Y LOS CINCO loop DEL CASO, Y ESTAN REPARTIDOS:
//
//     LOOP 1  Recomendaciones L121  for ( const p of prefs )
//             sobre las preferencias explicitas del cliente, y el
//             peso es el puntaje de cada fila
//
//     LOOP 2  Recomendaciones L142  for ( const c of compras )
//             sobre el historial de ventas, con GROUP BY y
//             SUM(cantidad), y el peso es la cantidad comprada
//
//     LOOP 3  Recomendaciones L161  for ( const g of gustas )
//             sobre los resultados 'Gusta' del vestidor virtual, y
//             el peso es SIEMPRE 1
//
//     LOOP 4  Scoring         L44   for ( const valor of mapa.values() )
//             dentro de maxDe, que se llama desde norm, y norm se
//             llama CUATRO VECES por prenda, en L95-98
//
//     LOOP 5  Scoring         L173  for ( const item of body.items )
//             sobre lo que devuelve la IA externa, armando el mapa
//
//   LOS TRES PRIMEROS ESTAN SEGUIDOS, DEL 121 AL 166, Y EN EL MISMO
//   METODO: construirPerfil.   Los dos ultimos estan en otro
//   fichero del mismo modulo.
//
//   O SEA QUE ESTE CASO TIENE CINCO BUCLES, Y ES EL PRIMERO DE LA
//   SERIE EN EL QUE NO ESTAN TODOS EN EL MISMO ELEMENTO.
//
// EL alt, Y POR QUE ESTE SI
//   Un alt de verdad es una decision con DOS CAMINOS EXCLUYENTES que
//   hacen cosas distintas.   Aqui la hay, y son dos:
//
//     L261  if (usuario == null) -> las populares y se acaba
//     L272  if (this.perfilVacio(perfil)) -> las populares y se acaba
//
//   LAS DOS RAMAS DEVUELVEN EXACTAMENTE LA MISMA COSA, L262 y L273,
//   que es this.popularesTemporada().   O sea que el codigo tiene
//   dos salidas distintas que convergen en la misma respuesta, y eso
//   en un diagrama de caso de uso es un alt con la misma salida en las
//   dos ramas.
//
//   Y LA TERCERA, L278, if (candidatos.length === 0), devuelve una
//   lista vacia con la fuente 'scoring_interno', lo cual ya no es lo
//   mismo.   Esa va como mensaje de retorno, no como rama.
//
// LA Y EN NEGATIVO, QUE ES LO QUE HACE FALLAR ESTOS DIAGRAMAS
//   EA guarda Top y Bottom en NEGATIVO, porque trabaja en
//   coordenadas cartesianas con la Y creciendo hacia arriba. Si se le
//   pasa la Y en positivo no da error: simplemente no coloca nada, y
//   todos los objetos se quedan en el mismo punto.
//
//   Por eso en las dos funciones de colocacion de este script:
//
//     o.Top    = 0 - y;
//     o.Bottom = 0 - y - alto;
//
//   Y en el AddNew, en cambio, la Y va en POSITIVA.
//
// LOS MARCOS DICEN SOBRE QUE ELEMENTO ESTAN
//   La pestaña de cada fragmento lleva tres lineas: el tipo, el
//   elemento al que pertenece, y la condicion.   Y el elemento se
//   saca de las coordenadas del marco con lifelineEnX(), no esta
//   escrito a mano.
//
// SIN NINGUNA LLAMADA A SQL
//   Todo se coloca con el modelo de objetos. Nada de ExecuteSQL,
//   Execute ni SQLQuery.
//
// Autorreparable. Una instruccion por linea. Sin continuaciones con
// +. Sin operadores ternarios. Ninguna excepcion escapa.
// ================================================================

var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var TOTAL_CAB = 9;
var TOTAL_MSG = 37;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU32 Secuencia Recomendar con IA";
var DIAG_NOMBRE = "CU32 Recomendar con IA";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 150;

var X_NOTA = 2430;
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
    ["U", "ACTOR_Cliente", "Actor", "Lifeline", "Cliente", "quien mira las recomendaciones", "Actor, no clase: es la persona", "no es codigo, es la persona. Y este caso se puede ver SIN sesion, porque el guard es opcional"],
    ["X", "Recomendaciones.tsx", "Object", "Lifeline", "Recomendaciones", "182 lineas, la pantalla", "Boundary", "web/src/pages/cliente/Recomendaciones.tsx, 182 lineas. L30-46 el useEffect con la carga, y L143 el Badge del score"],
    ["H", "api.ts", "Object", "Lifeline", "api", "seccion CU41", "Boundary", "web/src/lib/api.ts, L2041-2045 el metodo y L2077-2099 los tipos. Y el mismo numero CU41 aparece dos veces, en L2041 y en L2077"],
    ["G", "JwtOpcionalAuthGuard", "Object", "Lifeline", "JwtOpcionalAuthGuard", "OPCIONAL, a diferencia de todos", "Control", "api/src/modulos/seguridad/dependencias.ts. Es el UNICO caso de la serie cuyo guard no es JwtAuthGuard: L11 en CTR_Recomendaciones, y a diferencia de los demas NO lleva @UsuarioActual"],
    ["C", "CTR_Recomendaciones", "Object", "Lifeline", "RecomendacionesController", "16 lineas, el mas pequeno", "Control", "api/src/modulos/recomendaciones/CTR_Recomendaciones.ts, 16 lineas. L10-13 el unico endpoint. Y el cierre del metodo, L14-15, esta sin sangrar"],
    ["P", "SRV_RecomendacionesService", "Object", "Lifeline", "RecomendacionesService", "320 lineas, 3 bucles AQUI", "Control", "api/src/modulos/recomendaciones/SRV_RecomendacionesService.ts. L258-319 el metodo completo. LOS TRES LOOP DEL CASO SON L121, L142 Y L161, EN ESTE ELEMENTO"],
    ["S", "SRV_ScoringService", "Object", "Lifeline", "ScoringService", "188 lineas, 2 bucles AQUI", "Control", "api/src/modulos/recomendaciones/SRV_ScoringService.ts. L32-36 los pesos, L90-127 el scoring interno, L133-187 la IA externa. LOS OTROS DOS LOOP DEL CASO SON L44 Y L173, EN ESTE ELEMENTO"],
    ["I", "IA_EXTERNAL_URL", "Object", "Lifeline", "IA externa", "fetch con 4 s de timeout", "Entity", "NO ES CODIGO DEL PROYECTO: es la URL de la variable de entorno IA_EXTERNAL_URL, L29 de ScoringService. Si no esta definida, L138, no hay IA y se degrada al interno"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "6 tablas", "Entity", "schema.sql: productos y producto_talla_color, ventas y venta_items, preferencias_cliente L501, resultados_prueba y sesiones_ra, temporadas, y categorias, tallas, colores"]
];

var MSG = [
    [1, "U", "X", "1. entra a /recomendaciones   router.tsx L97, dentro de ClienteLayout   Y ese layout NO es un guard: es el mismo que usan /reservas, L87, y /compras, L93.   O sea que la pagina se abre y si no hay sesion no se ve nada raro, y si la hay tambien no", "S"],
    [2, "X", "H", "2. GET del catálogo de recomendaciones: obtenerRecomendaciones, api.ts L2043   Y el tipo de retorno, L2096-2099, es RespuestaRecomendaciones, que son DOS campos: items y fuente.   O SEA QUE LA RESPUESTA DICE DE DONDE SALE, y eso no lo hace ninguna otra de la serie", "A"],
    [3, "H", "G", "3. sin cabecera deAuthorization, o con ella   Y el guard de este endpoint NO es JwtAuthGuard: es JwtOpcionalAuthGuard, CTR L11.   O SEA QUE ESTE ES EL UNICO CASO DE LA SERIE QUE NO EXIGE SESION.   Y el comentario del propio codigo lo explica, L259-260: las populares de la temporada son informacion publica, como el catalogo", "A"],
    [4, "G", "C", "4. y el guard devuelve credenciales, no usuario: CredencialesCarritoActual, L12, que es un objeto con usuario y tokenInvitado, y el usuario puede ser null   O sea que el controlador pasa credenciales.usuario, L13, y ese valor puede ser null de verdad.   Ningun otro endpoint de la serie hace esto", "A"],
    [5, "C", "P", "5. recomendar( usuario ), L258, y el tipo del parametro es Usuario | null   O sea que el servicio esta escrito desde el principio para el caso anonimo, y no para el usuario con sesion.   Es la unica firma de la serie que admite null en el usuario", "A"],
    [6, "P", "P", "6. y AQUI SE ABRE EL alt DEL CASO: L261, if (usuario == null)   Y la primera rama devuelve las populares y se acaba, L262.   O sea que sin sesion este caso es un SELECT y un return", "A"],
    [7, "P", "D", "7. RAMA 1, las populares.   SELECT con 5 JOINs, L205-220, y con DOS subqueries por fila: la imagen principal, L210-212, con ORDER BY pi.orden y LIMIT 1, y las vendidas, L213-214, con COALESCE de un SUM de inventario_stock   Y el filtro de temporada, L222, que son 156 caracteres en una linea: p.id_temporada = la activa, OR p.id_temporada IS NULL.   Consulta 1", "A"],
    [8, "P", "P", "8. y L229 las mapea con mapaItem, f, 0, 'Populares de esta temporada'.   O sea que el score es CERO y el motivo es una frase fija, sin personalization ninguna.   Y lo mismo que la rama 2 del alt", "S"],
    [9, "P", "S", "9. y vuelve por la otra rama del alt, L265: exigirPermisoRecomendaciones, y L66 pide consultar_catalogo con el 403 'No tienes permisos para acceder a recomendaciones.'   Volveremos a esto en el hallazgo 2", "S"],
    [10, "P", "D", "10. SELECT r.permisos_json FROM usuarios u JOIN usuarios_roles ur JOIN roles r WHERE u.id_usuario = $1, L54-58   Consulta 2.   O sea que los permisos se leen de la base en CADA peticion, y no del token", "S"],
    [11, "P", "D", "11. y dos SELECT mas de contexto: el id_cliente del usuario, L74, y la temporada activa, L84-88, que es un SELECT con LOWER(estado) = 'activa' Y las dos fechas comparadas con NOW(), y con ORDER BY fecha_inicio DESC LIMIT 1   Consulta 3", "S"],
    [12, "P", "P", "12. y L93-95: [no hay ninguna temporada con las fechas de hoy] un segundo SELECT de fallback, sin las fechas, solo por estado y ORDER BY id_temporada LIMIT 1.   O sea que la temporada puede ser una que ya ha terminado, y el codigo no lo avisa.   Volveremos a esto en el hallazgo 4", "A"],
    [13, "P", "D", "13. y aqui empieza construirPerfil, L100, con sus TRES BUCLES.   El primero, L115-120: SELECT id_categoria, id_talla, id_color, id_temporada, puntaje FROM preferencias_cliente WHERE id_cliente = $1   Consulta 4.   O SEA QUE ESTE CASO LEE LA TABLA DE LAS PREFERENCIAS DIRECTAMENTE, saltandose SRV_PreferenciasService, que es el servicio que la escribe", "A"],
    [14, "P", "P", "14. LOOP 1 DEL CASO, L121: for ( const p of prefs )   Y el peso es el puntaje de la fila, L122.   Y dentro llama a sumar CUATRO VECES, L123-126, una por dimension: categoria, talla, color y temporada.   Cada sumar mete en un Map<number, number>, L110: mapa.set(clave, el valor anterior + peso)", "S"],
    [15, "P", "D", "15. y el LOOP 2, L132-141: SELECT ptc.id_talla, ptc.id_color, p.id_categoria, p.id_temporada, SUM(vi.cantidad) AS total FROM ventas v JOIN venta_items vi JOIN producto_talla_color ptc JOIN productos p WHERE v.id_cliente = $1 GROUP BY ptc.id_talla, ptc.id_color, p.id_categoria, p.id_temporada   Consulta 5.   El GROUP BY es de cuatro columnas, o sea que el historial se agrupa por talla, color, categoria y temporada a la vez", "A"],
    [16, "P", "P", "16. LOOP 2 DEL CASO, L142: for ( const c of compras )   Y el peso es el total comprado, L143, o sea que las repeticiones suman mas.   Y otros cuatro sumar, L144-147.   O sea que este bucle y el anterior son COPIAS, con la unica diferencia de de donde sale el peso", "S"],
    [17, "P", "D", "17. y el LOOP 3, L152-159: SELECT ptc.id_talla, ptc.id_color, p.id_categoria, p.id_temporada FROM resultados_prueba r JOIN sesiones_ra s ON s.id_sesion_ra = r.id_sesion_ra JOIN producto_talla_color ptc JOIN productos p WHERE s.id_usuario = $1 AND LOWER(r.resultado) = 'gusta'   Consulta 6.   OJO: este usa id_usuario, y los otros dos usan id_cliente", "A"],
    [18, "P", "P", "18. LOOP 3 DEL CASO, L161: for ( const g of gustas )   Y aqui el peso es SIEMPRE 1, L162-165, las cuatro lineas con el mismo uno.   O sea que un Gusta pesa lo mismo que un punto de preferencia, y que comprar dos veces pesa mas que un Gusta.   Volveremos a esto en el hallazgo 5", "A"],
    [19, "P", "S", "19. y L168 devuelve el perfil: cuatro Map, uno por dimension, y ya fuera del bucle   O sea que el resultado de los tres bucles son cuatro mapas de id a suma de pesos.   Y con eso se llama al scoring, L296", "A"],
    [20, "P", "P", "20. y antes, dos salidas mas del alt.   L272: [el perfil esta vacio, perfilVacio de L171] devuelve las populares con la fuente 'populares_temporada', L273.   Y L278: [no hay candidatos] devuelve items vacio con la fuente 'scoring_interno', L279   O sea que el texto de la fuente no dice que paso", "A"],
    [21, "P", "D", "21. candidatos(), L181-199: SELECT con 5 JOINs, mas una subquery de la imagen principal, L187-189, y un EXISTS de inventario_stock con cantidad_disponible > 0, L197-198   Consulta 7.   Y OJO: este SELECT NO TIENE LIMIT.   Se traen todas las prendas activas con stock, sin top", "A"],
    [22, "P", "S", "22. y L282-293 mapea los candidatos a PrendaParaScoring, con ocho campos por prenda, y lo pasa entero a la IA: delegarIA( perfil, prendas, temporadaActualId ), L296   Con el comentario de L295: se intenta la IA externa; si falla o expira, se degrada automaticamente al interno", "A"],
    [23, "S", "S", "23. y L138: [no hay IA_EXTERNAL_URL definida] return null.   O sea que por defecto NO HAY IA EXTERNA, y este caso entero se resuelve con la heuristica de pesos.   El proyecto tiene el gancho puesto, y la variable de entorno vacia", "A"],
    [24, "S", "I", "24. y si la hay, un POST con AbortSignal.timeout(4000), L141-142, y en el cuerpo el perfil entero con los cuatro mapas pasado a objeto, L147-152, y TODAS las prendas, L154-163, con nueve campos cada una   O SEA QUE SE MANDAN TODOS LOS CANDIDATOS, y despues solo se muestran 10 con el slice de L316", "A"],
    [25, "I", "S", "25. y la respuesta es un JSON con items, un array de id_ptc, score y motivo, L167-169.   Y el codigo acota el score a 0..100, L175: Math.max(0, Math.min(100, Number(item.score) || 0))   Volveremos a esto en el hallazgo 3", "S"],
    [26, "S", "S", "26. LOOP 5 DEL CASO, L173: for ( const item of body.items ), con el continue de L174 si el item o su id_ptc es null   Y arma un Map<number, ScorePrenda>, L176-180, y el motivo de la IA se respeta si no viene vacio, L179, y si no se pone Recomendado para ti", "S"],
    [27, "S", "P", "27. y hay tres salidas mas, y las tres devuelven null: L166 si la respuesta no es ok, L170 si items no es un array, y L183-186 el catch, con un logger.warn y el texto IA externa no disponible, se degrada al ScoringService interno.   Con el STRING(err) dentro, L184", "A"],
    [28, "P", "S", "28. y aqui L298-305, y es el HALLAZGO 1: por cada prenda, si el mapa de la IA tiene esa prenda usa su score, y si no llama al scoring interno.   O sea que el degradado es POR PRENDA, no global.   Y en L301, en cuanto UNA prenda vino de la IA, fuente pasa a ser 'ia_externa'", "A"],
    [29, "S", "S", "29. y el scoring interno, L90-127.   Los pesos estan en L32-36: categoria 40, talla 25, color 20, temporada 15, y un bonus de 8 si la prenda es de la temporada actual.   Suman 100, mas 8, y despues se corta con Math.min de L101", "A"],
    [30, "S", "S", "30. y aqui esta el LOOP 4 DEL CASO, que es el que nadie ve: L95-98 llama a norm CUATRO VECES por prenda, y norm, L53, llama a maxDe, y maxDe, L44, tiene for ( const valor of mapa.values() ).   O SEA QUE PUNTUAR UNA PRENDA HACE CUATRO BUCLES sobre los cuatro mapas del perfil.   Volveremos a esto en el hallazgo 3", "A"],
    [31, "S", "P", "31. y L112-126 devuelve el score con su motivo, y motivoPrincipal, L56-87, elige UNA de cuatro frases segun que dimension gano: Por tu preferencia en X, Por la talla X que mas compras, Por tu color favorito, o En temporada X.   Y si nada domina, L86, Recommended para ti", "S"],
    [32, "P", "P", "32. y L307 mete todo en un Map por id_ptc, y L309-316 mapea los candidatos, ordena por score de mayor a menor con el desempate por id_ptc, L315, y corta con el slice(0, LIMITE), L316, o sea que 10.   Y si una prenda no tiene score, L312, el motivo es Recomendado para ti y el score 0", "S"],
    [33, "P", "H", "33. y L318 devuelve { items, fuente }.   O sea que el backend manda si la respuesta es de la IA o de la heuristica, en una palabra", "A"],
    [34, "H", "X", "34. la respuesta   Y la pantalla la guarda entera, L36-37: setItems(resp.items) y setFuente(resp.fuente).   Volveremos a esto en el hallazgo 1", "A"],
    [35, "X", "U", "35. y la pinta: el titulo, L53, y L58 el aviso de que son las populares de la temporada cuando fuente es ese valor, y el boton de recargar, L63   Y cada prenda con su Badge de score, L143, con el porcentaje dentro, y su motivo debajo, L156", "A"],
    [36, "U", "U", "36. y si la lista viene vacia, L96-99, hay un estado propio con su icono y su texto, y si hay error, L70-75, otro con su boton de reintentar, L75   O sea que la pantalla tiene TRES estados de carga mas el de error, y todos separados", "A"],
    [37, "U", "U", "37. fin del camino con perfil.   Y aqui hay que decir la paradoja de este caso, que es el hallazgo 1: lo que este caso devuelve lo escribieron otros dos casos, y este no escribe nada.   Volveremos a esto", "A"]
];

var HAL = [
    ["1. El campo fuente no describe la respuesta", [
        "El hallazgo que rompe el caso, y sale de un solo",
        "condicional mal puesto.",
        "",
        "L296-305, en el servicio de recomendaciones:",
        "",
        "  const puntajesIA = await this.scoringService.delegarIA(",
        "    perfil, prendas, temporadaActualId);",
        "  let fuente = 'scoring_interno';",
        "  const scored = prendas.map((p) => {",
        "    const ia = puntajesIA?.get(p.id_ptc);",
        "    if (ia) {",
        "      fuente = 'ia_externa';",
        "      return ia;",
        "    }",
        "    return this.scoringService.scoringInterno(",
        "      p, perfil, temporadaActualId);",
        "  });",
        "",
        "EL DEGRADADO ES POR PRENDA, NO GLOBAL.   Y eso quiere decir",
        "tres cosas:",
        "",
        "  1  LA IA PUEDE DEVOLVER UNA SOLA PRENDA Y EL RESTO SE",
        "     CALCULA EN CASA.   Si la IA responde bien pero se",
        "     equivoca, o se pasa de lista, el score de esa prenda y",
        "     el score de las otras son de dos motores distintos, y",
        "     no se puede comparar.   Un 90 de la IA y un 90 de la",
        "     heuristica no son lo mismo.",
        "",
        "  2  LA ETIQUETA MIENTE EN CADA CASO MIXTO.   L301 pone",
        "     'ia_externa' en cuanto UNA prenda vino de la IA.   Si",
        "     fueron 3 de 400, la respuesta dice 'ia_externa' y 397",
        "     puntajes son de la heuristica.   Y el campo solo admite",
        "     dos valores, porque es un string, L2098.",
        "",
        "  3  Y LA PANTALLA USA ESA ETIQUETA PARA DECIDIR.   L58:",
        "     {fuente === 'populares_temporada' && ...}",
        "     Recomendaciones.tsx.   O sea que decide con un valor",
        "     binario una pregunta que tiene tres respuestas posibles.",
        "     Y no hay forma de que el cliente sepa quantas prendas",
        "     salieron de cada motor.",
        "",
        "Y LO MAS RARO DEL CASO, que es de otro tipo:",
        "este caso NO ESCRIBE NADA.   Es el UNICO de la serie que es",
        "solo de lectura.   Todo lo que devuelve lo escribieron otros",
        "dos casos, y en los tres hay un salto:",
        "",
        "  CU24 del documento, que es CU32 del codigo   el vestidor",
        "     virtual.   SRV_SesionesRaService L307-310: si el",
        "     resultado es 'Gusta' llama a registrarPreferenciasGusta.",
        "",
        "  CU26 y CU29 del documento, que son CU34 y CU37   las",
        "     compras.   SRV_PagosService L769:",
        "     registrarPreferenciasVenta.",
        "",
        "Y EL QUE LAS ESCRIBE, SRV_PreferenciasService, no aparece en",
        "este diagrama: este caso LEE la tabla preferencias_cliente",
        "con un dataSource.query propio, L115-120, en vez de pasar por",
        "el servicio.   O sea que si manana el servicio cambia una",
        "columna, hay que tocar dos ficheros, y este es el que nadie",
        "mira porque es el mas nuevo."
    ]],
    ["2. Sexto caso con el mismo bug de permiso", [
        "Un hallazgo de coherencia, y hay que decirlo con la cuenta",
        "debajo porque es la sexta vez.",
        "",
        "L64-68, en el servicio de recomendaciones:",
        "",
        "  private async exigirPermisoRecomendaciones(usuario) {",
        "    const permisos = await this.cargarPermisos(usuario);",
        "    if (!(permisos.includes('*') ||",
        "        permisos.includes('consultar_catalogo'))) {",
        "      throw new ForbiddenException(",
        "        'No tienes permisos para acceder a recomendaciones.');",
        "    }",
        "  }",
        "",
        "Y EL ROL CLIENTE DEL SEED, schema.sql L577:",
        "",
        "  ('Cliente', 'Compra y reserva en la plataforma',",
        "   '[\"ver_catalogo\",\"comprar\",\"reservar\", ...",
        "",
        "O SEA QUE EL CLIENTE TIENE ver_catalogo Y NADIE PIDE ESE",
        "NOMBRE.   Los dos son lo mismo y solo uno existe.",
        "",
        "Y DONDE APARECE EL NOMBRE EQUIVOCADO, que son cuatro sitios",
        "y todos con el mismo error:",
        "",
        "  SRV_RecomendacionesService  L66   este caso",
        "  SRV_SesionesRaService       L60   el vestidor",
        "  clienteMenu.ts              L27   el menu del cliente",
        "  adminMenu.ts              L131   el menu del admin",
        "",
        "Y EL LADO BUENO, que es el que hace que esto no se vea:",
        "clienteMenu.ts, L26-29, declara permiso 'consultar_catalogo'",
        "para el item de recomendaciones, y el propio menu se oculta si",
        "el usuario no lo tiene.   O sea que el Usuario final ve el",
        "item y no puede entrar? No: el guard del endpoint es",
        "OPCIONAL, L11, y el servicio solo comprueba el permiso si hay",
        "usuario, L265.   O sea que un Cliente sin ver_catalogo ve el",
        "enlace, lo pulsa, y en vez de un 403 recibe las populares de",
        "la temporada con L262, que es una respuesta 200.   El fallo",
        "del permiso esta enmascarado por el ser opcional del guard.",
        "",
        "LA CUENTA, y hay que ponerla porque es lo que hace que sea",
        "un patron y no un descuido:",
        "",
        "  CU22  consultar_catalogo   el digital",
        "  CU24  consultar_catalogo   el vestidor",
        "  CU25  gestionar_reservas  el carrito",
        "  CU26  realizar_venta       la compra digital",
        "  CU29  realizar_venta       la caja",
        "  CU32  consultar_catalogo   ESTE",
        "",
        "SEIS.   Y NINGUNO DE LOS SEIS PERMISOS CORRECTOS LO",
        "COMPRUEBA NADIE, porque el Cliente tiene comprar, reservar y",
        "ver_catalogo, y ninguno de los seis codigos los usa."
    ]],
    ["3. Se normaliza cuatro veces por prenda, y seHX4 JUECES sin normalizar", [
        "El hallazgo de rendimiento del caso, y sale de mirar lo que",
        "hay debajo de una division.",
        "",
        "SRV_ScoringService, y esto es L42-54:",
        "",
        "  private maxDe(mapa: Map<number, number>): number {",
        "    let max = 0;",
        "    for (const valor of mapa.values()) {",
        "      if (valor > max) max = valor;",
        "    }",
        "    return max || 1;",
        "  }",
        "",
        "  private norm(mapa, clave): number {",
        "    if (clave == null) return 0;",
        "    return (mapa.get(clave) ?? 0) / this.maxDe(mapa);",
        "  }",
        "",
        "Y scoringInterno, L95-98, la llama CUATRO VECES seguidas:",
        "",
        "  const catNorm   = this.norm(perfil.categorias, prenda.id_categoria);",
        "  const tallaNorm = this.norm(perfil.tallas, prenda.id_talla);",
        "  const colorNorm = this.norm(perfil.colores, prenda.id_color);",
        "  const tempNorm  = this.norm(perfil.temporadas, prenda.id_temporada);",
        "",
        "O SEA QUE PUNTUAR UNA PRENDA RECORRE CUATRO VECES LOS",
        "CUATRO MAPAS DEL PERFIL.   Y CON 4 BOUCES.",
        "",
        "Y LO QUE LO HACE INUTIL ES QUE maxDe DEPENDE SOLO DEL",
        "PERFIL, Y EL PERFIL NO CAMBIA DENTRO DEL BUCLE DE",
        "CANDIDATOS.   O sea que se estan recalculando 200 veces el",
        "mismo numero.",
        "",
        "CON LOS DATOS DE PRUEBA NO SE NOTA, y hay que decirlo:",
        "contadas las escrituras de seed de todo el proyecto, hay",
        "UN solo INSERT INTO productos y UN solo INSERT INTO",
        "producto_talla_color.   O sea que el catalogo tiene una",
        "prenda, y candidatos(), L181, devuelve una fila.   Con una",
        "prenda el caso va a milisegundos.",
        "",
        "PERO EL CODIGO NO TIENE LIMIT en ese SELECT, L182-198, y la",
        "prueba de que el autor sabia que la lista podia ser larga es",
        "el slice(0, LIMITE) del final, L316, con LIMITE = 10 en L30.",
        "O sea que trae todas, las manda todas a la IA, L154-163, y",
        "enseña diez.   En una tienda de verdad, con 200 productos",
        "por 6 tallas y 4 colores, son 4.800 filas, 19.200",
        "iteraciones de normalizacion y un POST de casi un megabyte",
        "con un timeout de 4 segundos, L141.   Y ese POST se caeria",
        "siempre, y el caso terminaria siempre en la heuristica.",
        "",
        "LO QUE LO ARREGLA SON TRES LINEAS: calcular los cuatro",
        "maxDe una vez antes del bucle de candidatos, poner un LIMIT",
        "grande en el SELECT de L182, o mejor, prefiltrar por",
        "categoria y talla con el score interno y solo pasarle a la IA",
        "los veinte primeros."
    ]],
    ["4. La temporada activa se busca dos veces y de dos maneras", [
        "Un hallazgo de logica, y sale de contar las veces que se",
        "busca lo mismo.",
        "",
        "HAY UN METODO, temporadaActualId, L81-97, que hace dos",
        "SELECT en cascada:",
        "",
        "  L84-88  SELECT id_temporada FROM temporadas",
        "          WHERE LOWER(estado) = 'activa'",
        "            AND fecha_inicio <= NOW() AND fecha_fin >= NOW()",
        "          ORDER BY fecha_inicio DESC LIMIT 1",
        "",
        "  L94     SELECT id_temporada FROM temporadas",
        "          WHERE LOWER(estado) = 'activa'",
        "          ORDER BY id_temporada LIMIT 1      <-- el fallback",
        "",
        "EL FALLBACK ESTA EN L92, CON UN COMENTARIO: Fallback:",
        "primera temporada con estado Activa.   Y el comentario es",
        "EXACTO lo que hace: coge la primera por id, que es la mas",
        "ANTIGUA, y no comprueba fechas.   O sea que si la temporada",
        "de invierno sigue marcada como activa en agosto, la tienda",
        "recomienda ropa de invierno.   Y el metodo se llama en L269 y",
        "el resultado se usa en L296 y en L99, para el bonus de",
        "temporada.",
        "",
        "PERO LA SEGUNDA RAMA DEL ALT, la de las populares, NO USA",
        "ESE METODO.   L222, en el SELECT de popularesTemporada, trae",
        "el filtro de temporada COMPLETO dentro, y son 156 caracteres",
        "en una sola linea:",
        "",
        "  AND (p.id_temporada = (SELECT id_temporada FROM temporadas",
        "       WHERE LOWER(estado) = 'activa'",
        "       ORDER BY id_temporada LIMIT 1)",
        "       OR p.id_temporada IS NULL)",
        "",
        "TRES DIFERENCIAS, y las tres importan:",
        "",
        "  1  EL METODO COMPRUEBA LAS FECHAS y este NO.   El",
        "     subquery de L222 solo mira el estado.",
        "  2  EL METODO TIENE FALLBACK y este NO.   Si no hay",
        "     temporada activa, este subquery devuelve NULL y la",
        "     comparacion es NULL, o sea que NO ENTRA NINGUNA PRENDA",
        "     por temporada.   Y no por el OR de L222, porque el",
        "     subquery es la parte izquierda de la igualdad, no el",
        "     WHERE entero.",
        "  3  Y ESTE ACEPTA LAS PRENDAS SIN TEMPORADA con el OR",
        "     p.id_temporada IS NULL, y el metodo no tiene nada de",
        "     eso.   O sea que las dos ramas del alt.Sequential",
        "",
        "LO QUE HACE ESO, y es el efecto real: si no hay ninguna",
        "temporada activa, un Cliente con perfil recibe una lista",
        "vacia con la fuente 'scoring_interno', L279, que es un texto",
        "que no corresponde a nada, y un visitante sin sesion recibe",
        "las popularimas de temporada con la fuente",
        "'populares_temporada'.   O sea que LOS DOS USUARIOS DEL MISMO",
        "SISTEMA VEN COSAS DISTINTAS SEGUN TENGAN SESION, y el caso",
        "no lo dice por ningun lado."
    ]],
    ["5. El perfil solo sube, y un Gusta pesa lo mismo que un punto", [
        "Un hallazgo de logica de negocio, y sale de mirar los pesos.",
        "",
        "LOS TRES BUCLES, y sus pesos:",
        "",
        "  L121  for ( const p of prefs )    peso = el puntaje, L122",
        "  L142  for ( const c of compras )  peso = SUM(cantidad), L143",
        "  L161  for ( const g of gustas )   peso = SIEMPRE 1, L162-165",
        "",
        "EL TERCERO ES EL QUE DUDE.   Y sus tres SELECT de origen no",
        "son la misma cosa:",
        "",
        "  L115-120  preferencias_cliente WHERE id_cliente = $1",
        "  L132-141  ventas JOIN venta_items, con WHERE v.id_cliente",
        "  L152-159  resultados_prueba JOIN sesiones_ra, con WHERE",
        "             s.id_usuario = $1",
        "",
        "O SEA QUE LOS DOS PRIMEROS IDENTIFICAN AL CLIENTE POR",
        "id_cliente Y EL TERCERO POR id_usuario.   Y como en la",
        "base un usuario puede no tener id_cliente, y en ese caso",
        "los otros dos bucles no corren, L114 y L131, pero el tercero",
        "SI CORRE SIEMPRE, porque no esta dentro de ningun if.",
        "",
        "Y LOS PESOS NO SON HOMOGENEOS:",
        "",
        "  -  Un punto de preferencia explicita, que va de 0 a lo que",
        "     sea.   Se sube con un Gusta, con peso 1, y con cada",
        "     prenda comprada, con peso = cantidad.",
        "  -  Una compra de una prenda, con peso 1.   Y un Gusta de",
        "     esa misma prenda, con peso 1 tambien.",
        "  -  Y NADCA BAJA.   Buscado en los tres bucles, el signo es",
        "     siempre mas: sumar, L110, y el peso se filtra con",
        "     peso <= 0 en el servicio de preferencias, L35, o sea que",
        "     un peso negativo se descarta.   Y registrarPreferencias",
        "     solo se llama con resultado 'Gusta', SesionesRa L308, o",
        "     con una compra.",
        "",
        "CONSECUENCIA, y es de negocio:",
        "",
        "  -  EL PERFIL NO OLVIDA NADA.   Un cliente que compro algo",
        "     hace cinco anos sigue pesando igual que ayer, y sus",
        "     recomendaciones de 2026 se parecen a las de 2021.",
        "  -  MARCAR 'NO GUSTA' NO CUENTA NADA.   El vestidor",
        "     virtual, L308, solo tiene en cuenta 'Gusta'.",
        "  -  Y COMPRAR MAS PESARA MAS QUE GUSTAR MAS.   Un cliente",
        "     que prueba veinte prendas en el vestidor y no compra",
        "     nada tiene perfil de peso 20.   Uno que compra dos",
        "     prendas de la misma talla tiene perfil de peso 2 en esa",
        "     talla, y 0 en las veinte que probo."
    ]],
    ["6. El perfil se escribe sin transaccion y sin indice", [
        "Un hallazgo de concurrencia, en el servicio que escribe lo",
        "que este caso lee.",
        "",
        "upsertDimension, SRV_PreferenciasService L29-61:",
        "",
        "  L40-44  SELECT id_preferencia FROM preferencias_cliente",
        "          WHERE id_cliente = $1 AND ${dimension} = $2",
        "            AND ${otros.map((c) => `${c} IS NULL`).join(' AND ')}",
        "          LIMIT 1",
        "  L47-53  si existe, UPDATE preferencias_cliente",
        "            SET puntaje = puntaje + $2",
        "  L56-60  si no, INSERT INTO preferencias_cliente",
        "",
        "LO QUE LE FALTA A LA TABLA, que es la parte grave:",
        "",
        "  PRIMARY KEY   si, id_preferencia, L502",
        "  UNIQUE        NO",
        "  CHECK         NO",
        "  indice        NO, y cero ALTER TABLE en todo el esquema",
        "",
        "O SEA QUE NO HAY NADA QUE IMPIDA TENER DOS FILAS CON EL",
        "MISMO cliente, la misma dimension y el mismo valor.",
        "",
        "CONSECUENCIA 1, LA DE CONCURRENCIA: dos Gustas a la vez",
        "sobre la misma prenda hacen los dos el SELECT, los dos no",
        "ven fila, y los dos insertan.   O sea que el puntaje se",
        "parte en dos filas de puntaje 1 en vez de una de 2.   Y a",
        "partir de ahi, la siguiente llamada al UPDATE, L50, solo",
        "cambia una de las dos, con WHERE id_preferencia = $1, y la",
        "otra se queda para siempre.   Y esto es facil de que pase:",
        "el vestidor registra Gustas sin transaccion, SesionesRa",
        "L307-310, y el boton de gusta se puede pulsar dos veces.",
        "",
        "CONSECUENCIA 2, LA DE RENDIMIENTO: el SELECT de L40-44",
        "busca por id_cliente, por la dimension, por el valor y por",
        "tres IS NULL.   Sin indice, PostgreSQL hace un seq scan de",
        "toda la tabla.   Y ese SELECT se hace CUATRO VECES por",
        "prenda, L87-92, y una vez mas por prenda comprada, L109-114.",
        "O sea que una venta de seis prendas hace 6 x 4 = 24 seq",
        "scan, y una compra de una prenda, 4.",
        "",
        "Y CUANTAS ESCRITURAS HACE UNA VENTA, sin transaccion:",
        "",
        "  L109-114  for ( const item of items )",
        "    L112  un SELECT de dimensionesDePtc por prenda",
        "    L113  aplicarDimensiones, que son 4 upsertDimension",
        "          y cada uno es un SELECT y un INSERT o un UPDATE",
        "",
        "  6 prendas x (1 + 4 x 2) = 54 CONSULTAS, y el 109 es un",
        "  bucle mas de este servicio, que es de otro caso."
    ]],
    ["7. LIMIT ${LIMITE} es lo unico del proyecto, y hay dos sitios que lo hacen bien", [
        "Un hallazgo de estilo, pero que es el unico de la serie que",
        "no es de logica ni de seguridad.",
        "",
        "L226, en popularesTemporada:",
        "",
        "  ORDER BY vendidas DESC, p.nombre ASC, t.orden ASC, c.nombre ASC",
        "  LIMIT ${LIMITE}`,",
        "",
        "Y LIMITE es una constante, L30: const LIMITE = 10.   O sea",
        "que NO ES INYECCION SQL, y hay que decirlo claro para que no",
        "suene a agujero de seguridad.",
        "",
        "LO QUE SI ES:",
        "",
        "  -  POSTGRESQL NO PUEDE CACHEAR EL PLAN.   El plan de",
        "     ejecucion se compila una vez por texto de consulta, y",
        "     un texto distinto es un plan distinto.   Como aqui el",
        "     valor es siempre 10, en la practica si se cachea, pero",
        "     el dia que alguien haga configurable LIMITE, cada",
        "     valor distinto seria una compilacion nueva.",
        "",
        "  -  Y LA INCONSISTENCIA ES LO QUE LA HACE VISIBLE, porque",
        "     en el MISMO PROYECTO hay dos sitios que resuelven",
        "     exactamente el mismo problema bien.   Contadas las",
        "     interpolaciones dentro de algo que parece SQL en los",
        "     149 ficheros .ts y .tsx, hay 28, y de esas:",
        "",
        "       SRV_ExistenciasService  L190  LIMIT $${params.length + 1}",
        "       SRV_CatalogoService    L272  LIMIT $${params.length + 1}",
        "",
        "     O sea que el autor sabe poner un limite dinamico como",
        "     parametro de verdad, con el numero calculado, y en un",
        "     sitio lo hace con interpolacion.",
        "",
        "LO QUE CAMBIARIA SERIA UNA LINEA:",
        "",
        "  await this.dataSource.query(sql, [LIMITE]);",
        "",
        "y quitar el ${}.   O mejor, mover el LIMIT fuera de la",
        "interpolacion, que es lo que hacen los otros dos."
    ]],
    ["8. Lo que esta bien, y hay bastante", [
        "Este caso tiene ocho cosas buenas. Y hay que empezar por",
        "las dos primeras, porque son las que hacen que el caso",
        "funcione.",
        "",
        "1. EL GUARD OPCIONAL ESTA PENSADO Y ESTA COMENTADO. L259-260:",
        "   Anonimo: las populares de la temporada son informacion",
        "   publica (como el catalogo), no requieren sesion ni permiso;",
        "   la personalizacion siempre exige autenticacion.   O sea",
        "   que el autor decidio que ver tendencias de moda no es un",
        "   dato privado, y lo escribio para que no se lea como un",
        "   descuido.   Es la unica vez en la serie que un permiso no",
        "   se pide a proposito, y con el porque al lado.",
        "",
        "2. Y LA DEGRADACION FUNCIONA Y ESTA PENSADA. delegarIA, L133-187,",
        "   tiene las cinco salidas que tiene que tener: L138 si no",
        "   hay URL, L166 si la respuesta no es ok, L170 si el cuerpo",
        "   no trae items, L174 si un item viene sin id, y L183 el",
        "   catch.   Y el timeout de 4 segundos con AbortSignal, L141,",
        "   que es la unica llamada de red externa con limite de tiempo",
        "   del proyecto.   Y el comentario de L131 lo explica:",
        "   Devuelve null si no hay endpoint o si la llamada falla o",
        "   expiro (degradacion al interno).   Un autor que escribe el",
        "   contrato de su propia degradacion es un autor que sabe lo",
        "   que hace.",
        "",
        "3. Y EL PUNTAJE SE ACOTA POR LOS DOS LADOS. La IA, L175, con",
        "   Math.max(0, Math.min(100, ...)), y el interno, L101, con",
        "   Math.min(100, ...).   O sea que ninguna de las dos motores",
        "   puede devolver un 4000 por un descuido y romper el orden,",
        "   porque el .sort de L315 es sobre el score.",
        "",
        "4. Y LOS PESOS ESTAN ESCRITOS Y SUMAN 100. L32-36, con un",
        "   comentario, L31, que dice que suman 100 cuando todo",
        "   coincide al maximo, mas un bonus de 8.   O sea que la",
        "   heuristica es explicable, y la pantalla puede decir por que",
        "   recomienda algo.   Y lo dice: motivoPrincipal, L56-87, con",
        "   cuatro frases y un ganador, L68, que es el maximo de las",
        "   cuatro dimensiones normalizadas.",
        "",
        "5. Y EL ROLLO DE LA RESPUESTA DICE DE DONDE SALE. El campo",
        "   fuente, L2098, con la pantalla usandolo, L58, para",
        "   avisar de que son las populares.   Es un detalle pequeno",
        "   que casi nadie hace, y es exactamente el que se rompe en",
        "   el hallazgo 1.   O sea que la intencion estaba ahi.",
        "",
        "6. Y maxDe DEVUELVE max || 1, L47, en vez de dividir entre",
        "   cero.   Es un detalle de una linea que evita un NaN que",
        "   se propagaria por los cuatro pesos y por el sort.",
        "",
        "7. Y EL HISTORIAL SE AGRUPA EN EL SQL, no en JavaScript. L139:",
        "   GROUP BY ptc.id_talla, ptc.id_color, p.id_categoria,",
        "   p.id_temporada, con SUM(vi.cantidad).   O sea que de una",
        "   compra de seis prendas con tres tallas no salen seis",
        "   filas, salen tres.   Y el bucle de L142, que es el que se",
        "   dibuja, itera sobre esas, no sobre las venta_items.",
        "",
        "8. Y LA IMAGEN PRINCIPAL ESTA EN EL SQL, con su desempate",
        "   escrito. L188-189: WHERE es_principal = true ORDER BY",
        "   pi.orden ASC, pi.id_imagen ASC LIMIT 1.   O sea que dos",
        "   imagenes marcadas como principales no rompen nada, y",
        "   sale siempre la misma."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de " + TOTAL_CAB + " del diagrama de secuencia de CU32."; } catch (e) { }
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
    var xP = xDe(indiceDe("P"));
    var xS = xDe(indiceDe("S"));
    var xI = xDe(indiceDe("I"));
    var xD = xDe(indiceDe("D"));
    var xC = xDe(indiceDe("C"));
    // EL alt DEL CASO. Son dos decisiones, L261 y L272, y las dos salidas
    // son EXACTAMENTE la misma llamada, L262 y L273, con la misma fuente
    // 'populares_temporada'. O sea que hay dos caminos para la misma
    // respuesta, y eso se dibuja como alt con las dos mitades.
    fragmento(diag, "alt [SIN PERFIL: no hay sesion, o el perfil salio vacio] / [CON PERFIL: tres bucles, los candidatos y el scoring]", xC, xD, Y_MSG0 + 5 * PASO_MSG - 34, Y_MSG0 + 33 * PASO_MSG - 20);
    // LOS 3 LOOP DE construirPerfil, y estan SEGUIDOS, del 121 al 166, y
    // en el MISMO metodo. Los tres van en la misma columna.
    fragmento(diag, "loop [por cada preferencia del cliente: el peso es el puntaje de la fila]", xP, xD, Y_MSG0 + 13 * PASO_MSG - 34, Y_MSG0 + 15 * PASO_MSG - 34);
    fragmento(diag, "loop [por cada fila del historial de compras: el peso es la cantidad comprada]", xP, xD, Y_MSG0 + 15 * PASO_MSG - 34, Y_MSG0 + 17 * PASO_MSG - 34);
    fragmento(diag, "loop [por cada resultado Gusta del vestidor: el peso es SIEMPRE 1]", xP, xD, Y_MSG0 + 17 * PASO_MSG - 34, Y_MSG0 + 19 * PASO_MSG - 34);
    // LOS 2 LOOP DEL SERVICIO DE SCORING, que es otro fichero del mismo
    // modulo. Este caso es el primero de la serie en el que los bucles no
    // estan todos en el mismo lifeline, asi que van en otra columna.
    fragmento(diag, "loop [por cada item que devuelve la IA: arma el mapa de puntajes, con continue]", xS, xI, Y_MSG0 + 25 * PASO_MSG - 34, Y_MSG0 + 27 * PASO_MSG - 34);
    fragmento(diag, "loop [maxDe: por cada valor del mapa, y norm lo llama CUATRO VECES por prenda]", xP, xS, Y_MSG0 + 29 * PASO_MSG - 34, Y_MSG0 + 31 * PASO_MSG - 34);
    // LAS 3 BARRAS: el controlador, el servicio de recomendaciones, y el
    // de scoring, que se anida porque el primero llama al segundo.
    activacion(diag, xC, Y_MSG0 + 3 * PASO_MSG - 26, Y_MSG0 + 5 * PASO_MSG - 26);
    activacion(diag, xP, Y_MSG0 + 4 * PASO_MSG - 26, Y_MSG0 + 33 * PASO_MSG - 26);
    activacion(diag, xS, Y_MSG0 + 18 * PASO_MSG - 26, Y_MSG0 + 31 * PASO_MSG - 26);
}

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 940) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU32  Recomendar Prendas con IA   ·   en el código del proyecto este caso es CU41, y el CU32 del código es el VESTIDOR VIRTUAL"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 940) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseño de caso de uso, sección 3.3.2.1.  9 líneas de vida, 37 mensajes, 8 hallazgos, 5 loop y 1 alt, y 3 barras de activación."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su línea de vida. El tiempo baja. El caso de las recomendaciones, y el primero de la serie que NO ESCRIBE NADA: es solo de lectura, y lo que devuelve lo escribieron el vestidor y las compras. Es el único con el guard OPCIONAL, L11, así que se ve sin sesión. Y el único con cinco bucles, repartidos en dos lifelines distintos: tres seguidos en construirPerfil, L121, L142 y L161, y dos en el scoring, L44 y L173. El L44 es el que no se ve: maxDe se recalcula cuatro veces por prenda, dentro de una división. Y el campo fuente de la respuesta, L2098, dice de dónde sale, pero no es cierto cuando el degradado es por prenda, L298-305."; } catch (e) { }
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

// CU26 - notas del diagrama y MAIN
// CU27 - notas del diagrama y MAIN
// CU29 - notas del diagrama y MAIN
// CU32 - notas del diagrama y MAIN
function notasDelDiagrama(diag, r, h, ch) {
    var N = [];
    N.push("CU32  Recomendar Prendas con IA.  Diseño de caso de uso, sección 3.3.2.1.");
    N.push("");
    N.push("AVISO DE NUMERACIÓN, Y AQUÍ ESTÁ EL LÍO");
    N.push("");
    N.push("  Este caso es CU32 en el documento y CU41 en el código del proyecto, y el título");
    N.push("  COINCIDE EXACTO:");
    N.push("");
    N.push("    documento  Recomendar Prendas con IA");
    N.push("    codigo     // CU41 - Recomendar Prendas con IA   api.ts L2041");
    N.push("");
    N.push("  PERO AQUÍ HAY UNA COSA QUE NO PASA EN NINGÚN OTRO CASO, Y POR ESO ESTÁ ARRIBA DEL");
    N.push("  TODO: el número CU32, en el código, NO es este caso. Es el VESTIDOR VIRTUAL.");
    N.push("");
    N.push("    schema.sql  L478   -- 9. VESTIDOR VIRTUAL RA — CU32");
    N.push("    api.ts      L1750  // CU32 - Usar Vestidor Virtual con Realidad Aumentada");
    N.push("    clienteMenu L48    cu: 'CU32',   etiqueta: 'Vestidor Virtual'");
    N.push("");
    N.push("  O SEA QUE EN EL CÓDIGO HAY DOS CASOS DISTINTOS Y LOS DOS ESTÁN EN PANTALLAS DE");
    N.push("  CLIENTE, A DOS LINESAS UNA DE OTRA EN clienteMenu.ts: las recomendaciones, que son");
    N.push("  CU41, en L26, y el vestidor, que es CU32, en L48.");
    N.push("");
    N.push("  Y POR ESO HAY QUE TENER CUIDADO CON LOS COMENTARIOS DEL CÓDIGO, porque usan la");
    N.push("  numeración del código y no la del documento.  SRV_PreferenciasService L11 dice:");
    N.push("");
    N.push("    al confirmar una compra (CU34/CU36) o registrar un \"Gusta\" (CU32),");
    N.push("");
    N.push("  Y L117:");
    N.push("");
    N.push("    Registra las preferencias de un resultado \"Gusta\" del vestidor virtual (CU32).");
    N.push("");
    N.push("  Eso es correcto DENTRO del código, y engañoso para quien lee el documento, porque");
    N.push("  ese Gusta lo registra el caso que en el documento es CU24.");
    N.push("");
    N.push("  Y LA CONSECUENCIA PARA ESTE DIAGRAMA, que es lo que hay que tener claro al leerlo:");
    N.push("  lo que este caso devuelve lo escribieron OTROS DOS CASOS, y este no escribe nada.");
    N.push("  Está en el hallazgo 1.");
    N.push("");
    N.push("  Y OTRO DESAJUSTE DE LA MISMA FAMILIA, y es el último de la serie: el CU41 aparece");
    N.push("  DOS veces en api.ts, en L2041 y en L2077, con el CU43 en medio, en L2047.   O sea");
    N.push("  que el mismo caso está numerado dos veces en el mismo fichero.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  9 líneas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Cliente              «actor»     y puede verlos SIN sesión");
    N.push("    Recomendaciones.tsx        «boundary»  182 líneas, en pages/cliente/");
    N.push("    api.ts                     «boundary»  sección CU41, L2041-2045");
    N.push("    JwtOpcionalAuthGuard       «control»   OPCIONAL, y es lo único único de este caso");
    N.push("    CTR_Recomendaciones       «control»   16 líneas, el más pequeño de la serie");
    N.push("    SRV_RecomendacionesService «control»  320 líneas, 3 bucles AQUÍ");
    N.push("    SRV_ScoringService         «control»   188 líneas, 2 bucles AQUÍ");
    N.push("    IA_EXTERNAL_URL            «entity»    NO ES CÓDIGO: es la variable de entorno, L29");
    N.push("    PostgreSQL                 «entity»    6 tablas y dos UPSERT de preferencias");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes. Y dos lifecycle a propósito NO están, y los dos son servicios:");
    N.push("");
    N.push("    SRV_PreferenciasService  131 líneas, y este caso lo IGNORA por completo.   En vez de");
    N.push("      pasar por él, lee la tabla preferencias_cliente con un dataSource.query");
    N.push("      propio, Recomendaciones L115-120.   Y ese servicio es quien la escribe.");
    N.push("");
    N.push("    SRV_SesionesRaService    367 líneas.   No aparece porque no hace nada aquí: es el");
    N.push("      CU24 del documento, y lo que aporta, los Gustas, ya están en la base cuando");
    N.push("      este caso empieza.");
    N.push("");
    N.push("  Y POR LIFELINE, por destino, contados sobre el diagrama: la base de datos y el");
    N.push("  servicio de recomendaciones se reparten casi todo, y eso es porque este caso es de");
    N.push("  lectura: 9 consultas a la base y ninguna escritura.");
    N.push("");
    N.push("  Y UN DATO QUE CAMBIA TODO EL CASO: es el ÚNICO de la serie que no escribe nada.   Los");
    N.push("  otros veintiséis tienen al menos un INSERT o un UPDATE.   Este es de solo lectura.");
    N.push("");
    N.push("LOS CINCO LOOP Y EL alt, Y POR QUÉ ESTE CASO ES EL PRIMERO CON VARIOS ELEMENTOS");
    N.push("");
    N.push("  Contados antes de dibujar, por servicio, porque este caso reparte sus bucles en");
    N.push("  TRES ficheros distintos del mismo módulo.   Los de Recomendaciones, 320 líneas:");
    N.push("");
    N.push("    for 3   while 0   continue 0   map( 5   filter( 0   sort( 1");
    N.push("    if 11   throw 1   ternarios 20   dataSource.query 9   try 0   catch 0");
    N.push("");
    N.push("  Los de Scoring, 188 líneas:");
    N.push("");
    N.push("    for 2   while 0   continue 1   map( 1   if 11   throw 0");
    N.push("    try 1   catch 1   ternarios 2   dataSource.query 0");
    N.push("");
    N.push("  Los de Preferencias, 131 líneas, que son de otros casos:");
    N.push("");
    N.push("    for 1   while 0   map( 1   filter( 1   if 6   dataSource.query 7");
    N.push("");
    N.push("  Y LOS CINCO DEL CASO:");
    N.push("");
    N.push("    loop 1  sobre SRV_RecomendacionesService  L121  for ( const p of prefs )");
    N.push("            las preferencias explicitas, y el peso es el puntaje de la fila");
    N.push("    loop 2  sobre SRV_RecomendacionesService  L142  for ( const c of compras )");
    N.push("            el historial, con GROUP BY de cuatro columnas y el peso = SUM(cantidad)");
    N.push("    loop 3  sobre SRV_RecomendacionesService  L161  for ( const g of gustas )");
    N.push("            los Gustas del vestidor, y el peso es SIEMPRE 1");
    N.push("    loop 4  sobre SRV_ScoringService         L44   for ( const valor of mapa.values() )");
    N.push("            dentro de maxDe, que norm llama desde L53, y scoringInterno llama a");
    N.push("            norm CUATRO VECES por prenda, en L95-98");
    N.push("    loop 5  sobre SRV_ScoringService         L173  for ( const item of body.items )");
    N.push("            lo que devuelve la IA externa, armando el mapa de puntajes");
    N.push("");
    N.push("  LOS TRES PRIMEROS ESTÁN SEGUIDOS, DEL 121 AL 166, Y EN EL MISMO MÉTODO:");
    N.push("  construirPerfil.   Los otros dos están en otro fichero del mismo módulo.   O sea");
    N.push("  que ESTE ES EL PRIMER CASO DE LA SERIE EN EL QUE LOS BUCLES NO ESTÁN TODOS EN EL");
    N.push("  MISMO ELEMENTO, y hay que mirarlos en dos columnas.");
    N.push("");
    N.push("  Y EL LOOP 4 ES EL QUE NO SE VE, y hay que señalarlo: está cuatro llamadas más");
    N.push("  abajo que el código que lo invoca, dentro de una división.   Ninguna herramienta de");
    N.push("  diagrama lo sube.   Está en el hallazgo 3.");
    N.push("");
    N.push("EL alt, Y POR QUÉ LAS DOS RAMAS DEVUELVEN LO MISMO");
    N.push("");
    N.push("  Las dos decisiones son L261 y L272:");
    N.push("");
    N.push("    L261  if (usuario == null)");
    N.push("    L272  if (this.perfilVacio(perfil))");
    N.push("");
    N.push("  Y LAS DOS SALIDAS SON LA MISMA LLAMADA, L262 y L273:");
    N.push("");
    N.push("    return { items: await this.popularesTemporada(),");
    N.push("             fuente: 'populares_temporada' };");
    N.push("");
    N.push("  O SEA QUE HAY DOS CAMINOS DISTINTOS PARA LLEGAR A LA MISMA RESPUESTA: o no hay");
    N.push("  sesión, o hay sesión pero el perfil ha salido vacío.   En un diagrama de caso de uso");
    N.push("  eso es un alt, y por eso se dibuja.   Con el detalle de que las dos mitades del alt");
    N.push("  llevan a la misma respuesta, y eso es lo que hay que ver en el diagrama.");
    N.push("");
    N.push("  LA TERCERA SALIDA, L278, if (candidatos.length === 0), ya NO es lo mismo: devuelve");
    N.push("  una lista vacía con la fuente 'scoring_interno', L279, que es un texto que no");
    N.push("  corresponde a lo que ha pasado.   Esa va como mensaje de retorno con su guarda, no");
    N.push("  como rama del alt.");
    N.push("");
    N.push("EL HALLAZGO 1: EL CAMPO FUENTE NO DESCRIBE LA RESPUESTA");
    N.push("");
    N.push("  L296-305, y son diez líneas:");
    N.push("");
    N.push("    const puntajesIA = await this.scoringService.delegarIA(...);");
    N.push("    let fuente = 'scoring_interno';");
    N.push("    const scored = prendas.map((p) => {");
    N.push("      const ia = puntajesIA?.get(p.id_ptc);");
    N.push("      if (ia) {");
    N.push("        fuente = 'ia_externa';");
    N.push("        return ia;");
    N.push("      }");
    N.push("      return this.scoringService.scoringInterno(p, perfil, temporadaActualId);");
    N.push("    });");
    N.push("");
    N.push("  EL DEGRADADO ES POR PRENDA, NO GLOBAL.   Y de ahí salen tres cosas:");
    N.push("");
    N.push("  1  LA IA PUEDE DEVOLVER UNA SOLA PRENDA Y EL RESTO SE CALCULA EN CASA.   Y entonces");
    N.push("     un 90 de la IA y un 90 de la heurística no son lo mismo, y el .sort de L315 los");
    N.push("     mezcla en la misma lista sin distinguirlos.");
    N.push("");
    N.push("  2  LA ETIQUETA MIENTE EN CADA CASO MIXTO.   L301 pone 'ia_externa' en cuanto UNA");
    N.push("     prenda vino de la IA.   Si fueron 3 de 400, la respuesta lo dice igual.   Y el");
    N.push("     campo solo admite dos valores, porque es un string, L2098.");
    N.push("");
    N.push("  3  Y LA PANTALLA USA ESA ETIQUETA PARA DECIDIR.   L58:");
    N.push("");
    N.push("       {fuente === 'populares_temporada' && ...}");
    N.push("");
    N.push("     O sea que decide con un valor binario una pregunta que tiene tres respuestas");
    N.push("     posibles, y no hay forma de que el cliente sepa cuántas prendas salieron de");
    N.push("     cada motor.");
    N.push("");
    N.push("  Y LA PARADOJA DEL CASO, que es de otro tipo y hay que decirla: ESTE CASO NO ESCRIBE");
    N.push("  NADA.   Es el único de la serie que es solo de lectura.   Todo lo que devuelve lo");
    N.push("  escribieron dos casos, y en los tres hay un salto:");
    N.push("");
    N.push("    CU24 del documento, que es CU32 del código    el vestidor.   SesionesRa L307-310:");
    N.push("      si el resultado es 'Gusta' llama a registrarPreferenciasGusta.");
    N.push("");
    N.push("    CU26 y CU29 del documento, que son CU34 y CU37    las compras.   Pagos L769:");
    N.push("      registrarPreferenciasVenta.");
    N.push("");
    N.push("  Y EL QUE LAS ESCRIBE, SRV_PreferenciasService, no aparece en este diagrama.");
    N.push("");
    N.push("EL HALLAZGO 2: SEXTO CASO CON EL MISMO BUG DE PERMISO");
    N.push("");
    N.push("  Recomendaciones L66 pide consultar_catalogo, y el rol Cliente del seed, schema L577,");
    N.push("  tiene ver_catalogo.   Los dos significan lo mismo y solo existe el segundo.");
    N.push("");
    N.push("  Y EL NOMBRE EQUIVOCADO ESTÁ EN CUATRO SITIOS, todos con el mismo error:");
    N.push("");
    N.push("    SRV_RecomendacionesService  L66    este caso");
    N.push("    SRV_SesionesRaService       L60    el vestidor");
    N.push("    clienteMenu.ts              L27    el menú del cliente");
    N.push("    adminMenu.ts              L131    el menú del admin");
    N.push("");
    N.push("  LA CUENTA, y por eso es un patrón y no un descuido:");
    N.push("");
    N.push("    CU22  consultar_catalogo   el digital");
    N.push("    CU24  consultar_catalogo   el vestidor");
    N.push("    CU25  gestionar_reservas  el carrito");
    N.push("    CU26  realizar_venta       la compra digital");
    N.push("    CU29  realizar_venta       la caja");
    N.push("    CU32  consultar_catalogo   ESTE");
    N.push("");
    N.push("  SEIS, Y NINGUNO DE LOS SEIS PERMISOS CORRECTOS LO COMPRUEBA NADIE, porque el Cliente");
    N.push("  tiene comprar, reservar y ver_catalogo, y ninguno de los seis códigos los usa.");
    N.push("");
    N.push("  Y AQUÍ EL FALLO ESTÁ ENMASCARADO, que es lo que lo hace más interesante: el guard");
    N.push("  de este endpoint es OPCIONAL, L11, y el permiso solo se comprueba si hay usuario,");
    N.push("  L265.   O sea que un Cliente sin ver_catalogo ve el enlace, lo pulsa, y en vez de un");
    N.push("  403 recibe las populares de la temporada con L262, que es un 200.   Los otros cinco");
    N.push("  casos devuelven el 403, porque su guard es obligatorio.");
    N.push("");
    N.push("EL HALLAZGO 3: SE NORMALIZA CUATRO VECES POR PRENDA, Y EL NÚMERO NUNCA CAMBIA");
    N.push("");
    N.push("  Scoring L42-54:");
    N.push("");
    N.push("    private maxDe(mapa) {");
    N.push("      let max = 0;");
    N.push("      for (const valor of mapa.values()) {");
    N.push("        if (valor > max) max = valor;");
    N.push("      }");
    N.push("      return max || 1;");
    N.push("    }");
    N.push("    private norm(mapa, clave) {");
    N.push("      if (clave == null) return 0;");
    N.push("      return (mapa.get(clave) ?? 0) / this.maxDe(mapa);");
    N.push("    }");
    N.push("");
    N.push("  Y scoringInterno, L95-98, llama a norm CUATRO VECES seguidas, una por dimensión.   O");
    N.push("  sea que puntuar una prenda recorre cuatro veces los cuatro mapas del perfil.");
    N.push("");
    N.push("  Y maxDe DEPENDE SOLO DEL PERFIL, Y EL PERFIL NO CAMBIA dentro del bucle de");
    N.push("  candidatos.   Se está recalculando el mismo número una vez por prenda.");
    N.push("");
    N.push("  CON LOS DATOS DE PRUEBA NO SE NOTA, y hay que decirlo: contadas las escrituras de");
    N.push("  seed de todo el proyecto, hay UN solo INSERT INTO productos y UN solo INSERT INTO");
    N.push("  producto_talla_color.   El catálogo tiene una prenda, y candidatos(), L181, devuelve");
    N.push("  una fila.   Con una prenda este caso va a milisegundos.");
    N.push("");
    N.push("  PERO EL CÓDIGO NO TIENE LIMIT en ese SELECT, L182-198.   Y la prueba de que el autor");
    N.push("  sabía que la lista podía ser larga es el slice(0, LIMITE) del final, L316, con");
    N.push("  LIMITE = 10 en L30.   Trae todas, las manda todas a la IA, L154-163, y enseña diez.");
    N.push("  En una tienda de verdad, con 200 productos por 6 tallas y 4 colores, son 4.800");
    N.push("  filas, 19.200 iteraciones de normalización y un POST de casi un megabyte con un");
    N.push("  timeout de 4 segundos, L141.   Ese POST se caería siempre y el caso terminaría");
    N.push("  siempre en la heurística.");
    N.push("");
    N.push("EL HALLAZGO 4: LA TEMPORADA ACTIVA SE BUSCA DOS VECES Y DE DOS MANERAS");
    N.push("");
    N.push("  HAY UN MÉTODO, temporadaActualId, L81-97, con dos SELECT en cascada:");
    N.push("");
    N.push("    L84-88  SELECT id_temporada FROM temporadas");
    N.push("            WHERE LOWER(estado) = 'activa'");
    N.push("              AND fecha_inicio <= NOW() AND fecha_fin >= NOW()");
    N.push("            ORDER BY fecha_inicio DESC LIMIT 1");
    N.push("");
    N.push("    L94     SELECT id_temporada FROM temporadas");
    N.push("            WHERE LOWER(estado) = 'activa'");
    N.push("            ORDER BY id_temporada LIMIT 1      <-- el fallback");
    N.push("");
    N.push("  EL FALLBACK ESTÁ EN L92, CON UN COMENTARIO: Fallback: primera temporada con estado");
    N.push("  Activa.   Y el comentario es exacto lo que hace: coge la primera por id, que es la");
    N.push("  MÁS ANTIGUA, y no comprueba fechas.   Si la temporada de invierno sigue marcada");
    N.push("  como activa en agosto, la tienda recomienda ropa de invierno.   Y el método se");
    N.push("  llama en L269 y su resultado se usa en L296 y en L99, para el bonus de temporada.");
    N.push("");
    N.push("  PERO LA RAMA DE LAS POPULARES NO USA ESE MÉTODO.   L222 trae el filtro COMPLETO");
    N.push("  dentro del SELECT, y son 156 caracteres en una sola línea:");
    N.push("");
    N.push("    AND (p.id_temporada = (SELECT id_temporada FROM temporadas");
    N.push("         WHERE LOWER(estado) = 'activa'");
    N.push("         ORDER BY id_temporada LIMIT 1)");
    N.push("         OR p.id_temporada IS NULL)");
    N.push("");
    N.push("  TRES DIFERENCIAS, y las tres importan:");
    N.push("");
    N.push("  1  EL MÉTODO COMPRUEBA LAS FECHAS y este NO.   El subquery solo mira el estado.");
    N.push("  2  EL MÉTODO TIENE FALLBACK y este NO.   Si no hay temporada activa, el subquery");
    N.push("     devuelve NULL, y la comparación es NULL, o sea que NO ENTRA NINGUNA PRENDA por");
    N.push("     temporada.   Y no por el OR de L222, porque el subquery es la parte izquierda");
    N.push("     de la igualdad, no el WHERE entero.");
    N.push("  3  Y ESTE ACEPTA LAS PRENDAS SIN TEMPORADA con el OR p.id_temporada IS NULL, y el");
    N.push("     método no tiene nada de eso.");
    N.push("");
    N.push("  EL EFECTO REAL: si no hay ninguna temporada activa, un Cliente con perfil recibe una");
    N.push("  lista vacía con la fuente 'scoring_interno', L279, que no describe lo que pasó, y");
    N.push("  un visitante sin sesión recibe las populares con la fuente 'populares_temporada'.");
    N.push("  O sea que LOS DOS USUARIOS DEL MISMO SISTEMA VEN COSAS DISTINTAS SEGÚN TENGAN");
    N.push("  SESIÓN, y el caso no lo dice por ningún lado.");
    N.push("");
    N.push("EL HALLAZGO 5: EL PERFIL SOLO SUBE, Y UN GUSTA PESA LO MISMO QUE UN PUNTO");
    N.push("");
    N.push("  LOS TRES BUCLES Y SUS PESOS:");
    N.push("");
    N.push("    L121  for ( const p of prefs )    peso = el puntaje de la fila");
    N.push("    L142  for ( const c of compras )  peso = SUM(cantidad)");
    N.push("    L161  for ( const g of gustas )   peso = SIEMPRE 1");
    N.push("");
    N.push("  Y LOS TRES SELECT DE ORIGEN NO SON LA MISMA COSA, y esa es la parte fina:");
    N.push("");
    N.push("    L115-120  preferencias_cliente WHERE id_cliente = $1");
    N.push("    L132-141  ventas JOIN venta_items, con WHERE v.id_cliente");
    N.push("    L152-159  resultados_prueba JOIN sesiones_ra, con WHERE s.id_usuario = $1");
    N.push("");
    N.push("  O SEA QUE LOS DOS PRIMEROS IDENTIFICAN AL CLIENTE POR id_cliente Y EL TERCERO POR");
    N.push("  id_usuario.   Y como en la base un usuario puede no tener id_cliente, y en ese caso");
    N.push("  los otros dos bucles no corren, L114 y L131, el TERCERO SÍ CORRE SIEMPRE, porque no");
    N.push("  está dentro de ningún if.");
    N.push("");
    N.push("  Y NADA BAJA NUNCA.   El signo es siempre más: sumar, L110, y el servicio de");
    N.push("  preferencias descarta los pesos negativos, L35, con peso <= 0.   Y solo se llama con");
    N.push("  un 'Gusta', SesionesRa L308, o con una compra.");
    N.push("");
    N.push("  CONSECUENCIA, y es de negocio:");
    N.push("");
    N.push("  -  EL PERFIL NO OLVIDA NADA.   Un cliente que compró algo hace cinco años sigue");
    N.push("     pesando igual que ayer, y sus recomendaciones se parecen a las de entonces.");
    N.push("  -  MARCAR 'NO GUSTA' NO CUENTA NADA.   El vestidor, L308, solo mira 'Gusta'.");
    N.push("  -  Y COMPRAR MÁS PESARÁ MÁS QUE GUSTAR MÁS.   Uno que prueba veinte prendas y no");
    N.push("     compra nada tiene perfil de peso 20.   Otro que compra dos prendas de la misma");
    N.push("     talla tiene perfil de peso 2 en esa talla, y 0 en las veinte que probó.");
    N.push("");
    N.push("EL HALLAZGO 6: EL PERFIL SE ESCRIBE SIN TRANSACCIÓN Y SIN ÍNDICE");
    N.push("");
    N.push("  upsertDimension, Preferencias L29-61, que es un SELECT y luego un UPDATE o un");
    N.push("  INSERT, y nada más.");
    N.push("");
    N.push("  Y LO QUE LE FALTA A LA TABLA, que es la parte grave:");
    N.push("");
    N.push("    PRIMARY KEY   sí, id_preferencia, L502");
    N.push("    UNIQUE        NO");
    N.push("    CHECK         NO");
    N.push("    índice        NO, y cero ALTER TABLE en todo el esquema");
    N.push("");
    N.push("  CONSECUENCIA 1, LA DE CONCURRENCIA: dos Gustas a la vez sobre la misma prenda");
    N.push("  hacen los dos el SELECT, los dos no ven fila, y los dos insertan.   El puntaje se");
    N.push("  parte en dos filas de 1 en vez de una de 2, y a partir de ahí el UPDATE de L50 solo");
    N.push("  cambia una, con WHERE id_preferencia = $1, y la otra se queda para siempre.   Y es");
    N.push("  fácil de que pase: el vestidor registra Gustas sin transacción, SesionesRa L307-310.");
    N.push("");
    N.push("  CONSECUENCIA 2, LA DE RENDIMIENTO: el SELECT de L40-44 busca por id_cliente, por la");
    N.push("  dimensión, por el valor y por tres IS NULL.   Sin índice, PostgreSQL hace un seq");
    N.push("  scan de toda la tabla.   Y ese SELECT se hace CUATRO VECES por prenda, L87-92, y");
    N.push("  una vez más por prenda comprada, L109-114.   Una venta de seis prendas hace");
    N.push("  6 x 4 = 24 seq scan, y una compra de una prenda, 4.");
    N.push("");
    N.push("  Y CUÁNTAS ESCRITURAS HACE UNA VENTA, sin transacción:");
    N.push("");
    N.push("    L109-114  for ( const item of items )");
    N.push("      L112  un SELECT de dimensionesDePtc por prenda");
    N.push("      L113  aplicarDimensiones, que son 4 upsertDimension");
    N.push("            y cada uno es un SELECT y un INSERT o un UPDATE");
    N.push("");
    N.push("  6 prendas x (1 + 4 x 2) = 54 CONSULTAS.   Y el L109 es un bucle más de ese servicio,");
    N.push("  que es de otro caso.");
    N.push("");
    N.push("LO QUE ESTÁ BIEN, Y SON OCHO COSAS");
    N.push("");
    N.push("  1. EL GUARD OPCIONAL ESTÁ PENSADO Y ESTÁ COMENTADO.   L259-260: Anónimo: las");
    N.push("     populares de la temporada son información pública (como el catálogo), no requieren");
    N.push("     sesión ni permiso; la personalización siempre exige autenticación.   O sea que el");
    N.push("     autor decidió que ver tendencias de moda no es un dato privado, y lo escribió");
    N.push("     para que no se lea como un descuido.   Es la única vez en la serie que un");
    N.push("     permiso no se pide a propósito, y con el porqué al lado.");
    N.push("");
    N.push("  2. Y LA DEGRADACIÓN FUNCIONA Y ESTÁ PENSADA.   delegarIA, L133-187, tiene las cinco");
    N.push("     salidas que tiene que tener: L138 si no hay URL, L166 si la respuesta no es ok,");
    N.push("     L170 si el cuerpo no trae items, L174 si un item viene sin id, y L183 el catch.");
    N.push("     Y el timeout de 4 segundos con AbortSignal, L141, que es la única llamada de red");
    N.push("     externa con límite de tiempo del proyecto.   Y el comentario de L131 escribe el");
    N.push("     contrato: Devuelve null si no hay endpoint o si la llamada falla o expiró.");
    N.push("");
    N.push("  3. Y EL PUNTAJE SE ACOTA POR LOS DOS LADOS.   La IA, L175, con Math.max(0,");
    N.push("     Math.min(100, ...)), y el interno, L101, con Math.min(100, ...).   Ninguno de los");
    N.push("     dos motores puede devolver un 4000 por un descuido y romper el orden de L315.");
    N.push("");
    N.push("  4. Y LOS PESOS ESTÁN ESCRITOS Y SUMAN 100.   L32-36, con el comentario de L31 que lo");
    N.push("     dice, más un bonus de 8.   La heurística es explicable, y la pantalla puede decir");
    N.push("     por qué recomienda algo.   Y lo dice: motivoPrincipal, L56-87, con cuatro frases y");
    N.push("     un ganador, L68, que es el máximo de las cuatro dimensiones normalizadas.");
    N.push("");
    N.push("  5. Y EL ROLLO DE LA RESPUESTA DICE DE DÓNDE SALE.   El campo fuente, L2098, con la");
    N.push("     pantalla usándolo, L58.   Es un detalle pequeño que casi nadie hace, y es");
    N.push("     exactamente el que se rompe en el hallazgo 1.   O sea que la intención estaba.");
    N.push("");
    N.push("  6. Y maxDe DEVUELVE max || 1, L47, en vez de dividir entre cero.   Una línea que");
    N.push("     evita un NaN que se propagaría por los cuatro pesos y por el orden.");
    N.push("");
    N.push("  7. Y EL HISTORIAL SE AGRUPA EN EL SQL, no en JavaScript.   L139, con GROUP BY de");
    N.push("     cuatro columnas y SUM(vi.cantidad).   Una compra de seis prendas con tres tallas no");
    N.push("     sale en seis filas, sale en tres.   Y el bucle de L142 itera sobre esas.");
    N.push("");
    N.push("  8. Y LA IMAGEN PRINCIPAL ESTÁ EN EL SQL, con su desempate escrito.   L188-189:");
    N.push("     WHERE es_principal = true ORDER BY pi.orden ASC, pi.id_imagen ASC LIMIT 1.   Dos");
    N.push("     imágenes marcadas como principales no rompen nada, y sale siempre la misma.");
    N.push("");
    N.push("SOBRE LA COLOCACIÓN DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Anchura: las nueve cabeceras separadas " + PASO + " px, con " + ANCHO_CAB + " de ancho. Quedan");
    N.push("  65 px entre una y otra. Altura: " + PASO_MSG + " px por mensaje. El mensaje 1 cae en la y " + Y_MSG0);
    N.push("  y el " + TOTAL_MSG + " en la y " + (Y_MSG0 + (TOTAL_MSG - 1) * PASO_MSG) + ".");
    N.push("");
    N.push("  Un detalle que hizo fallar estos diagramas dieciséis veces y que conviene no");
    N.push("  olvidar: EA guarda Top y Bottom en NEGATIVO, porque trabaja en coordenadas");
    N.push("  cartesianas con la Y creciendo hacia arriba. Si se le pasa la Y en positivo no da");
    N.push("  error, simplemente no coloca nada y todos los objetos se quedan en el mismo");
    N.push("  punto. En las dos funciones de colocación de este script está escrito o.Top = 0 - y");
    N.push("  y o.Bottom = 0 - y - alto. En el AddNew, en cambio, la Y va en positiva.");
    N.push("");
    N.push("  Y LA BANDA DE LOS HALLAZGOS EMPIEZA EN LA X " + X_NOTA + ", que es donde acaban las cabeceras");
    N.push("  y los marcos.   Con nueve lifelines en vez de diez, la banda va 245 px más a la");
    N.push("  izquierda que en los casos anteriores.");
    N.push("");
    N.push("  Comprobación de esta ejecución, leída del modelo de objetos:");
    N.push("    objetos en el diagrama: " + ch.leidos);
    N.push("    con la Y crecida, o sea colocados: " + ch.bien);
    N.push("    mensajes dibujados: " + r.puestos + " de " + TOTAL_MSG);
    N.push("    mensajes a sí mismo: " + r.autodestino);
    N.push("    conectores en el diagrama: " + r.enDiagrama);
    N.push("    MARCOS de fragmento colocados: " + MARCOS_PUESTOS + " de 6");
    N.push("    BARRAS de activación colocadas: " + BARRAS_PUESTAS + " de 3");
    N.push("");
    N.push("  Y UN AVISO QUE HAY QUE REPETIR: los seis marcos y las tres barras son FORMAS");
    N.push("  dibujadas por script, NO son fragmentos nativos de EA.   Cada uno va en try/catch y");
    N.push("  cuenta los que ha puesto, y el informe final lo dice.   Si alguno sale a 0, hay que");
    N.push("  dibujarlo a mano.");
    N.push("");
    N.push("  Y UN AVISO DE ESTE CASO, EL MÁS IMPORTANTE DE LOS DOS: el LOOP 4, el de maxDe de L44,");
    N.push("  está en la columna del servicio de scoring, pero su INVOQUE, el norm de L53, está");
    N.push("  dentro de una división en L95-98.   Si al releer el diagrama alguien busca el bucle");
    N.push("  en la recomendación, no lo va a encontrar, porque está dos servicios más abajo.");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU32 Secuencia", 0); } catch (e) { }
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
    T.push("CU32 - DIAGRAMA DE SECUENCIA - INFORME");
    T.push("");
    T.push("Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB);
    T.push("Tipo de diagrama: " + tipoUsado);
    T.push("Mensajes: " + r.puestos + " de " + TOTAL_MSG);
    T.push("Mensajes a sí mismo: " + r.autodestino);
    T.push("Conectores en el diagrama: " + r.enDiagrama);
    T.push("Hallazgos: " + h2.total + " de " + TOTAL_HAL + ", banda hasta la y " + h2.fin);
    T.push("");
    T.push("AVISO DE NUMERACIÓN  <-- LEE ESTO, ES RARO");
    T.push("Este caso es CU32 en el documento y CU41 en el código, y el título");
    T.push("COINCIDE EXACTO. Pero el CU32 DEL CÓDIGO NO es este caso: es el");
    T.push("VESTIDOR VIRTUAL. En schema.sql L478, en api.ts L1750 y en");
    T.push("clienteMenu.ts L48. Las dos pantallas de cliente están a dos líneas");
    T.push("una de otra en clienteMenu.ts: recomendaciones es CU41 en L26, y el");
    T.push("vestidor es CU32 en L48.");
    T.push("Y el CU41 aparece DOS veces en api.ts, en L2041 y en L2077, con el");
    T.push("CU43 en medio, en L2047.");
    T.push("Y ESTE CASO NO ESCRIBE NADA: es el único de la serie de solo lectura.");
    T.push("Lo que devuelve lo escribieron el vestidor, CU24 del documento, y");
    T.push("las compras, CU26 y CU29. Ver el hallazgo 1.");
    T.push("");
    T.push("MARCOS Y BARRAS  <-- MIRA ESTO");
    T.push("Este caso tiene 5 loop y 1 alt, y es el PRIMERO de la serie en el que");
    T.push("los bucles NO están todos en el mismo lifeline. Contado antes de");
    T.push("dibujar, con contadores, por servicio, porque el módulo tiene tres:");
    T.push("  SRV_RecomendacionesService, 320 líneas");
    T.push("    for 3   while 0   continue 0   map( 5   filter( 0   sort( 1");
    T.push("    if 11   throw 1   ternarios 20   dataSource.query 9   try 0");
    T.push("  SRV_ScoringService, 188 líneas");
    T.push("    for 2   while 0   continue 1   map( 1   if 11   throw 0");
    T.push("    try 1   catch 1   ternarios 2   dataSource.query 0");
    T.push("  SRV_PreferenciasService, 131 líneas, de OTROS casos");
    T.push("    for 1   while 0   map( 1   filter( 1   if 6   dataSource.query 7");
    T.push("");
    T.push("LOS 5 LOOP DEL CASO, Y DÓNDE ESTÁ CADA UNO:");
    T.push("  loop 1  SRV_RecomendacionesService  L121  for ( const p of prefs )");
    T.push("  loop 2  SRV_RecomendacionesService  L142  for ( const c of compras )");
    T.push("  loop 3  SRV_RecomendacionesService  L161  for ( const g of gustas )");
    T.push("  loop 4  SRV_ScoringService         L44   for ( const valor of mapa.values() )");
    T.push("  loop 5  SRV_ScoringService         L173  for ( const item of body.items )");
    T.push("Los tres primeros están SEGUIDOS, del 121 al 166, y en el MISMO");
    T.push("método: construirPerfil. Los dos últimos, en otro fichero.");
    T.push("Y EL LOOP 4 ES EL QUE NO SE VE: maxDe, L44, se llama desde norm, L53,");
    T.push("que se llama CUATRO VECES por prenda desde L95-98. Está dos");
    T.push("servicios más abajo que donde se le busca.");
    T.push("");
    T.push("EL alt, Y POR QUÉ LAS DOS RAMAS SON LA MISMA:");
    T.push("  L261  if (usuario == null)          -> populares, L262");
    T.push("  L272  if (this.perfilVacio(...))   -> populares, L273");
    T.push("Las dos salidas son EXACTAMENTE la misma llamada, L262 y L273, con");
    T.push("la misma fuente 'populares_temporada'. Dos caminos para la misma");
    T.push("respuesta, y eso es un alt. La tercera salida, L278, con");
    T.push("candidatos vacíos, devuelve items [] con fuente 'scoring_interno'");
    T.push("y va como mensaje de retorno, no como rama.");
    T.push("");
    T.push("SOBRE QUÉ ELEMENTO ESTÁ CADA MARCO:");
    T.push("  alt    sobre SRV_RecomendacionesService  L261  ¿tiene perfil?");
    T.push("  loop 1 sobre SRV_RecomendacionesService  L121  las preferencias");
    T.push("  loop 2 sobre SRV_RecomendacionesService  L142  el historial");
    T.push("  loop 3 sobre SRV_RecomendacionesService  L161  los Gustas");
    T.push("  loop 4 sobre SRV_ScoringService         L44   normaliza");
    T.push("  loop 5 sobre SRV_ScoringService         L173  la respuesta de la IA");
    T.push("El nombre sale de las coordenadas del marco con lifelineEnX(), no");
    T.push("está escrito a mano, así que no puede desincronizarse.");
    T.push("");
    T.push("Fragmentos colocados: " + MARCOS_PUESTOS + " de 6");
    T.push("Barras de activación colocadas: " + BARRAS_PUESTAS + " de 3");
    T.push("Si alguno sale a 0, EA no ha aceptado la forma y hay que dibujarlo");
    T.push("a mano.  Los 9 son FORMAS dibujadas por script, no fragmentos");
    T.push("nativos de EA: EA no los coloca por API de forma fiable.");
    T.push("");
    T.push("HALLAZGOS");
    T.push("  1  El campo fuente no describe la respuesta.  El degradado de la");
    T.push("     IA es POR PRENDA, L298-305, no global, y en cuanto UNA prenda");
    T.push("     vino de la IA, L301 pone 'ia_externa'.  Si fueron 3 de 400, la");
    T.push("     respuesta lo dice igual, y el .sort de L315 los mezcla.  Y la");
    T.push("     pantalla usa esa etiqueta para decidir, L58, con un binario.");
    T.push("  2  Sexto caso con el bug de permiso.  Pide consultar_catalogo, L66,");
    T.push("     y el Cliente tiene ver_catalogo, seed L577.  El nombre malo está");
    T.push("     en 4 sitios: Recomendaciones L66, SesionesRa L60, clienteMenu");
    T.push("     L27 y adminMenu L131.  Y aquí el fallo está ENMASCARADO: el");
    T.push("     guard es opcional, L11, así que un Cliente sin el permiso");
    T.push("     recibe un 200 con las populares en vez de un 403.");
    T.push("  3  Se normaliza cuatro veces por prenda, y el número nunca cambia.");
    T.push("     maxDe, L44, depende solo del perfil, y norm lo llama 4 veces");
    T.push("     por prenda desde L95-98.  Con el seed, que tiene UNA sola");
    T.push("     prenda, no se nota.  Pero candidatos(), L182, no tiene LIMIT,");
    T.push("     y todo se manda a la IA, L154-163, con 4 s de timeout, L141.");
    T.push("  4  La temporada activa se busca dos veces y de dos maneras.  El");
    T.push("     método, L81-97, comprueba las fechas y tiene fallback a la más");
    T.push("     antigua por id, L94.  Y el SELECT de las populares, L222, no usa");
    T.push("     ese método: 156 caracteres con un subquery que solo mira el");
    T.push("     estado, y con un OR para las prendas sin temporada.");
    T.push("  5  El perfil solo sube.  Los 3 pesos son el puntaje, el SUM de");
    T.push("     cantidad y un 1 fijo.  Y nada baja nunca: Preferencias L35");
    T.push("     descarta los pesos <= 0 y solo se llama con 'Gusta'.  Y los");
    T.push("     dos primeros bucles usan id_cliente y el tercero id_usuario.");
    T.push("  6  El perfil se escribe sin transacción y sin índice.  La tabla");
    T.push("     preferencias_cliente, L501-509, tiene PRIMARY KEY y nada");
    T.push("     más: cero UNIQUE, cero CHECK, cero ALTER TABLE.  El upsert de");
    T.push("     L40-60 es un SELECT y un INSERT o UPDATE, así que dos Gustas");
    T.push("     a la vez crean dos filas y el puntaje se parte para siempre.");
    T.push("  7  LIMIT ${LIMITE}, L226, es lo único del proyecto que interpola");
    T.push("     un valor en un LIMIT.  No es inyección, LIMITE es una constante");
    T.push("     de 10 en L30, pero en Existencias L190 y Catalogo L272 el");
    T.push("     mismo problema se resuelve con un parámetro de verdad.");
    T.push("  8  Y ocho cosas buenas.  El guard opcional está comentado, L259-260.");
    T.push("     La degradación tiene sus cinco salidas y un timeout de 4 s.");
    T.push("     El score se acota por los dos lados, L175 y L101.  Los pesos");
    T.push("     están escritos y suman 100, L32-36.");
    T.push("");
    T.push("COLOCACIÓN");
    T.push("Objetos en el diagrama: " + ch.leidos);
    T.push("Con la Y crecida, o sea colocados: " + ch.bien + " de " + ch.leidos);
    T.push("Con 9 líneas de vida, la banda de hallazgos va en la x " + X_NOTA + ".");
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
    msg = msg + "CU32 - Recomendar Prendas con IA" + SALTO;
    msg = msg + "Diagrama de secuencia, sección 3.3.2.1." + SALTO;
    msg = msg + "En el código del proyecto este caso es CU41, y el título" + SALTO;
    msg = msg + "COINCIDE EXACTO.  PERO el CU32 del código NO es este caso:" + SALTO;
    msg = msg + "es el VESTIDOR VIRTUAL, schema L478 y clienteMenu L48." + SALTO;
    msg = msg + "Y el CU41 sale dos veces en api.ts, L2041 y L2077." + SALTO + SALTO;
    msg = msg + "9 líneas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "5 loop y 1 alt, y es el PRIMERO de la serie con los bucles" + SALTO;
    msg = msg + "repartidos en dos lifelines.  Sobre qué elemento está cada uno:" + SALTO;
    msg = msg + "  loop 1 Recomendaciones  L121  las preferencias" + SALTO;
    msg = msg + "  loop 2 Recomendaciones  L142  el historial de compras" + SALTO;
    msg = msg + "  loop 3 Recomendaciones  L161  los Gustas del vestidor" + SALTO;
    msg = msg + "  loop 4 Scoring         L44   normaliza, el que no se ve" + SALTO;
    msg = msg + "  loop 5 Scoring         L173  la respuesta de la IA" + SALTO;
    msg = msg + "  alt   Recomendaciones  L261  ¿tiene perfil? las dos ramas" + SALTO;
    msg = msg + "         devuelven las MISMAS populares, L262 y L273" + SALTO;
    msg = msg + "FRAGMENTOS colocados: " + MARCOS_PUESTOS + " de 6." + SALTO;
    msg = msg + "BARRAS colocadas: " + BARRAS_PUESTAS + " de 3." + SALTO;
    if (MARCOS_PUESTOS < 6 || BARRAS_PUESTAS < 3) msg = msg + "  Si falta alguno, hay que dibujarlo a mano." + SALTO;
    msg = msg + SALTO;
    msg = msg + "HALLAZGO PRINCIPAL: el campo fuente no describe la respuesta." + SALTO;
    msg = msg + "El degradado de la IA es POR PRENDA, L298-305, no global, y" + SALTO;
    msg = msg + "en cuanto UNA prenda vino de la IA, L301 pone 'ia_externa'." + SALTO;
    msg = msg + "La pantalla usa esa etiqueta para decidir, L58, con un" + SALTO;
    msg = msg + "binario.  Y este caso NO ESCRIBE NADA: lo que devuelve lo" + SALTO;
    msg = msg + "escribieron el vestidor y las compras." + SALTO + SALTO;
    msg = msg + "Y el guard es OPCIONAL, L11, único en la serie, y eso" + SALTO;
    msg = msg + "enmascara el sexto bug de permiso: L66 pide" + SALTO;
    msg = msg + "consultar_catalogo y el Cliente tiene ver_catalogo, así que" + SALTO;
    msg = msg + "recibe un 200 con las populares en vez de un 403." + SALTO + SALTO;
    msg = msg + "Y maxDe, L44, se recalcula 4 veces por prenda con el" + SALTO;
    msg = msg + "perfil que no cambia: 4 bucles por prenda.  Con el seed, que" + SALTO;
    msg = msg + "tiene una sola prenda, no se nota.  Pero candidatos(), L182," + SALTO;
    msg = msg + "no tiene LIMIT y todo se manda a la IA con 4 s de timeout." + SALTO + SALTO;
    msg = msg + "Lo bueno: el guard opcional está comentado y justificado," + SALTO;
    msg = msg + "L259-260.  La degradación tiene sus cinco salidas y un" + SALTO;
    msg = msg + "timeout de 4 s con AbortSignal, L141.  Y el score se acota por" + SALTO;
    msg = msg + "los dos lados, L175 y L101." + SALTO + SALTO;
    msg = msg + "Líneas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACIÓN: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU32 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU32 Secuencia", 0); } catch (e3) { }
}
