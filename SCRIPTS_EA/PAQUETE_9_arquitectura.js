// ================================================================
// PAQUETE 9  ·  ARQUITECTURA DEL SUBSISTEMA
// Servicios de Inteligencia Artificial  ·  CU32
// E-COMMERCE TIENDA MONTANO   ·   Seccion 5.3.9
//
// QUE DIBUJA
//   El diagrama de componentes del paquete 9, con los 28 componentes
//   del subsistema y las 44 interfaces entre ellos, y TODO DENTRO de
//   un marco que se llama PAQUETE 9 - SERVICIOS DE INTELIGENCIA ARTIFICIAL.
//
//   Un solo modulo de NestJS, recomendaciones, con 5 ficheros y 672
//   lineas.  Y UNA SOLA RUTA en todo el paquete: GET recomendaciones.
//
//   28 componentes:  2 de presentacion, 1 de control, 3 de logica,
//                    2 del paquete 1, 1 del paquete 4, 1 del paquete 7,
//                    1 del paquete 8, 1 externo y 16 de datos
//   44 interfaces
//
// PATRON COPIADO DE CAPAS_diagrama_por_capas.js, QUE SI DIBUJA BIEN
//   -  Los marcos son Package REALES del modelo, con Sequence = 1.
//   -  LAS COORDENADAS VERTICALES VAN EN NEGATIVO.
//   -  DOS PASADAS con guardarYRecargar entre ellas.
//   -  El conector se coloca con con.DiagramID = diag.ID.
//
// POR QUE ESTE PAQUETE ES DISTINTO A LOS OTROS OCHO
//
//   Los otros ocho paquetes tienen entre 9 y 31 componentes y entre 11
//   y 62 interfaces.  Este tiene 28 y 54, y aun asi UNA SOLA RUTA.
//
//   O sea que el 90 por ciento del paquete no se alcanza por HTTP.  Es
//   llamado por los paquetes 7 y 8, que son los que disparan las tres
//   senales con las que el motor puntua.  Por eso el mapa de
//   dependencias del proyecto lo hacia parecer el paquete mas aislado,
//   y es justo lo contrario.
//
// LOS TRES HALLAZGOS
//
//   1. LA TABLA recomendaciones_ia NO LA ESCRIBE NADIE.  Cinco
//      columnas, y ni un solo INSERT en los 79 ficheros de modulos ni
//      en las 65 del frontend.  El script de poblacion_datos.sql le
//      mete 16 filas a mano, y ahi se queda.  Y el nombre de su
//      columna es justificacion, o sea que la tabla esta disenada
//      justamente para guardar el motivo de cada recomendacion, que es
//      lo unico que el servicio calcula de verdad.
//
//   2.upsertDimension ES UN SELECT Y DESPUES UN UPDATE O UN INSERT, SIN
//      TRANSACCION Y SIN UNIQUE.  Y se llama cuatro veces por prenda.
//      Dos compras a la vez pasan por ahi, las dos no encuentran fila,
//      y las dos insertan.  No hay indice que lo impida y no hay
//      transaccion que lo deshaga.  El perfil se infla solo y nadie se
//      entera, porque la tabla no tiene ni UNIQUE ni indice.
//
//   3. EL PUNTAJE NO ES UN MODELO, SON CUATRO PESOS Y UNA DIVISION.
//      categoria 40, talla 25, color 20, temporada 15, y un bonus de 8
//      por estar en temporada.  Cada dimension se normaliza por el
//      maximo de esa dimension, de manera que el valor absoluto de los
//      puntajes no importa: solo el orden.  Y eso hace que el motor
//      SEA EL MISMO PARA TODOS LOS CLIENTES, y solo cambien los pesos.
//
// Y LO QUE ESTA HECHO CON LA DEGRADACION, QUE ES LO MEJOR DEL PAQUETE
//
//   delegarIA, en la 133, hace POST a IA_EXTERNAL_URL con un abort de
//   4 segundos.  Y si la variable no esta, devuelve null en la 138, y
//   si la llamada falla, avisa con el logger y devuelve null en la 184.
//   En los dos casos el motor interno responde.  O sea que una IA
//   externa caida no tumba la aplicacion, y el sistema disimula.  Eso
//   esta muy bien.
//
// Aviso con WScript.Shell.Popup.  Sin llamadas a SQL y sin
// SaveDiagram.  Una instruccion por linea.  Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================


var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var PAQ_NOMBRE = "Paquete 9 - Servicios de Inteligencia Artificial";
var DIAG_NOMBRE = "Arquitectura del Paquete 9";

var TOTAL_CMP = 28;
var TOTAL_REL = 44;
var TOTAL_CAP = 9;

var ERRORES = [];
var INFORME = [];

var MARCO_NOMBRE = "PAQUETE 9 - SERVICIOS DE INTELIGENCIA ARTIFICIAL";
var MARCO_X = 10;
var MARCO_Y = 10;
var MARCO_W = 1890;
var MARCO_H = 1240;
var MARCO_COLOR = 15132358;

// nombre, izquierda, arriba, ancho, alto, color
var CAPAS = [
    ["Presentacion", 30, 60, 800, 210, 13421823],
    ["Control", 30, 320, 800, 170, 13434879],
    ["Logica de Negocio", 30, 540, 800, 300, 13434828],
    ["Del Paquete 1", 880, 60, 300, 210, 16777164],
    ["Del Paquete 4", 880, 320, 300, 170, 13434828],
    ["Del Paquete 7", 880, 540, 300, 170, 13434828],
    ["Del Paquete 8", 880, 760, 300, 170, 13434828],
    ["Externos", 880, 980, 300, 140, 16777164],
    ["Datos", 1230, 60, 640, 1060, 16770790]
];


// ================================================================
// LOS 28 COMPONENTES   [nombre, capa, nota]
// ================================================================

var PAQ = [

    // ---------------- PRESENTACION: 2 ----------------

    ["Recomendaciones.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU32 | FICHERO: web/src/pages/cliente/Recomendaciones.tsx, 182 lineas | LLAMA: una sola funcion, api.obtenerRecomendaciones, que es la unica ruta del paquete | **ES LA UNICA PANTALLA DEL PAQUETE, Y TAMBIEN LA MAS CORTA DEL FRONTEND** | **MUESTRA EL PUNTAJE COMO PORCENTAJE Y EL MOTIVO COMO TEXTO.** El Badge lleva el score, y debajo el motivo, que es lo que el motor produce con motivoPrincipal. Tres cortes: 70 y mas es success, 40 y mas es accent, y lo demas neutral | **LO QUE NO HACE, Y NO ES UN DETALLE: NO PERMITE DAR ME GUSTA.** Ni un boton, ni un icono, nada. Y la tercera senal del perfil sale justamente de un 'Gusta' del vestidor, asi que la senal mas barata de generar es la unica que se puede marcar desde aqui, que es desde la unica pantalla del paquete | Y cuando no hay sesion la pantalla no avisa, y el backend tampoco: el unico mensaje de error es No tienes permisos para acceder a recomendaciones, y solo lo ve quien ha iniciado sesion sin el rol"],

    ["api.ts", "Presentacion",
    "CAPA: Presentacion | FICHERO: web/src/lib/api.ts | EL CLIENTE HTTP DEL PAQUETE | **UNA SOLA RUTA, GET recomendaciones, que es la unica del paquete entero** | **Y LOS TRES TIPOS DEL PAQUETE ESTAN AQUI, Y SOLO UNO SE USA DE VERDAD**: RespuestaRecomendaciones, que trae la lista, e ItemRecomendacion, que trae id_ptc, score y motivo. Los otros dos, el uno de la llamada y el otro de la respuesta, son los mismos | **Y OJO CON LA FIRMA DE LA FUNCION**: la pantalla la llama sin pasar nada, api.obtenerRecomendaciones, sin usuario ni token. El token va solo, en la cabecera"],

    // ---------------- CONTROL: 1 ----------------

    ["CTR_Recomendaciones", "Control",
    "CAPA: Control | FICHERO: api/src/modulos/recomendaciones/CTR_Recomendaciones.ts, **16 LINEAS: EL CONTROLADOR MAS PEQUEÑO DE LOS 15 DEL PROYECTO** | @Controller('recomendaciones') | **UNA RUTA, GET recommendations, con JwtOpcionalAuthGuard y CredencialesCarritoActual** | **Y LA GUARDIA ES OPCIONAL, QUE ES LO CONTRARIO DE TODO LO DEMAS.** Los otros 14 controladores exigen sesion. Este no, porque una recomendacion se le puede pedir a un visitante que no ha iniciado sesion, y si no hay sesion pues se leKem recommend con lo que haya | **O SEA QUE ESTE ES EL SEGUNDO PUNTO DEL PROYECTO, CON EL CARRITO, DONDE SE PUEDE OPERAR SIN HABER INICIADO SESION.** Los demas son 13 de 15. Y de los dos, solo el carrito tiene ademas una columna para el invitado | **Y LA RUTA PASA EL USUARIO ENTERO AL SERVICIO**, no un identificador: this.recomendacionesService.recomendar(credenciales.usuario), en la 13. El servicio necesita saber quien es, y si no hay nadie, trabaja con lo que encuentre"],

    // ---------------- LOGICA DE NEGOCIO: 3 ----------------

    ["SRV_RecomendacionesService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/recomendaciones/SRV_RecomendacionesService.ts, 320 lineas, **ES EL 80 POR CIENTO DEL PAQUETE** | METODOS: 12, y solo uno es la ruta. Los otros once son de apoyo: unaFila, cargarPermisos, exigirPermisoRecomendaciones, idClienteDeUsuario, temporadaActualId, construirPerfil, perfilVacio, candidatos, popularesTemporada, precioConIva y mapaItem | **CERO TRANSACCIONES**, y aqui no es un problema: no escribe nada, solo lee y ordena | **ES EL UNICO SERVICIO DEL PROYECTO QUE CONSTRUYE UN PERFIL CON TRES SENALES Y LAS SUMA EN UN MISMO MAPA**, con la funcion sumar de la 108. Las tres son categorias, tallas, colores y temporadas, o sea que las tres alimentan los mismos cuatro mapas | **LAS TRES SENALES, EN ORDEN Y CON SU PESO:** (b) las preferencias explicitas de preferencias_cliente, con el peso del puntaje; (c) el historial de compras, con el peso de SUM de la cantidad comprada, y las repeticiones suman; (d) los resultados Gusta del vestidor, con peso UNO FIJO cada uno | **Y LA TERCERA SENAL ES LA UNICA QUE VIENE DEL PAQUETE 7**: consulta resultados_prueba y sesiones_ra por el identificador de usuario, y filtra con LOWER(resultado) = 'gusta'. O sea que el vestidor virtual es la unica fuente de senal que el usuario produce sin pagar | **CANDIDATOS ES UNA CONSULTA CORRECTA Y CORTA:** pide los productos activos con existencias, trayendo la imagen principal con una subconsulta sobre producto_imagenes, y nada mas. No hay paginacion, no hay limite, y no hay filtro por sucursal | **Y SI EL PERFIL ESTA VACIO NO PUNTUA NADA: devuelve las mas vendidas de la temporada actual**, con popularesTemporada en la 202, ordenando por la suma de cantidad_vendida del inventario. El comentario del codigo lo etiqueta como E3, y es un buen criterio | **LA TEMPORADA ACTUAL SE RESUELVE CON UNA CONDICION TRIPLE**: estado activa, y fecha_inicio menor o igual que ahora, y fecha_fin mayor o igual que ahora. Si dos temporadas se solapan, coge la de identificador mas alto"],

    ["SRV_ScoringService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/recomendaciones/SRV_ScoringService.ts, 188 lineas | METODOS: 5: maxDe, norm, motivoPrincipal, scoringInterno y delegarIA | **ESTE SERVICIO NO LEE NI ESCRIBE NI UNA TABLA, Y NI SIQUIERA TIENE CONSTRUCTOR.** Es el unico del proyecto que no inyecta nada. Solo un Logger. Es calculo puro | **Y ESO ES LO QUE LO HACE INTERESANTE: SEPARA EL CALCULO DE LOS DATOS.** Los otros tres servicios de los nueve paquetes mezclan las dos cosas. Aquel pide las prendas, y este las puntua. Se podria cambiar el motor entero sin tocar una consulta | **EL PUNTAJE SON CUATRO PESOS Y UNA DIVISION.** Categoria 40, talla 25, color 20 y temporada 15, que suman 100, y un bonus de 8 por estar en la temporada actual. Cada dimension se normaliza con norm, en la 51, que divide por el maximo de esa dimension, con maxDe en la 42 | **Y ESO HACE QUE EL VALOR ABSOLUTO DE LOS PUNTAJES NO IMPORTE, SOLO EL ORDEN.** Un cliente con diez compras de una talla y otro con una sola dan exactamente el mismo resultado, porque los dos se normalizan por el maximo | **Y POR TANTO EL MOTOR ES EL MISMO PARA TODOS LOS CLIENTES.** No hay nada aprendido, ni ningun parametro que cambie con el uso. Lo unico que se personalize son los cuatro mapas de entrada | **EL MOTIVO SE SACA DEL MAXIMO GANADOR, con un texto por dimension**: Por tu preferencia en la categoria, Por la talla que mas compras, Por tu color favorito, y En temporada. Y si nada gana, Recomendado para ti. O sea que el motivo es una etiqueta de la dimension que mas pesa, no una explicacion"],

    ["SRV_PreferenciasService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/recomendaciones/SRV_PreferenciasService.ts, 131 lineas, el mas pequeno de los tres | METODOS: 6, y solo dos son los que llaman los otros paquetes: registrarPreferenciasVenta y registrarPreferenciasGusta. Los otros cuatro son de apoyo: unaFila, upsertDimension, dimensionesDePtc y aplicarDimensiones | **CERO TRANSACCIONES, Y AQUI SI HAY UN FALLO DE VERDAD, QUE ESTA MAS ABAJO** | **ES EL UNICO SERVICIO DEL PAQUETE QUE ESCRIBE, Y ESCRIBE EN UNA SOLA TABLA: preferencias_cliente** | **SU UPSERT ESTA ESCRITO A MANO, Y NO PUEDE SER ATOMICO.** upsertDimension, en la 29, hace un SELECT para ver si la fila existe, y luego un UPDATE con puntaje = puntaje mas el peso, o si no, un INSERT. Entre el SELECT y el INSERT no hay nada | **Y LA TABLA NO TIENE UNIQUE NI INDICE, NI SOBRE LAS CINCO COLUMNAS NI SOBRE NINGUNA.** El propio script de poblacion_datos.sql lo anota como problema, en su bloque de diagnostico final | **ADEMAS LAS CINCO CLAVES FORANEAS SON NULLABLE**, y eso admite una fila que no dice ninguna cosa: un cliente, y las cuatro dimensiones a NULL, con un puntaje. El motor la sumara y no cambiara ningun mapa"],

    // ---------------- DEL PAQUETE 1: 2 ----------------

    ["dependencias.ts", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/dependencias.ts | LO USA EL UNICO CONTROLADOR DEL PAQUETE, con las dos cosas: JwtOpcionalAuthGuard y CredencialesCarritoActual | **O SEA QUE EL PAQUETE 9 USA LA MISMA TERCERA REGLA DE PERMISOS QUE EL PAQUETE 8, LA DE CredencialesCarrito, y por la misma razon: para que el visitante sin sesion pueda pasar.** Los dos unicos puntos del proyecto donde se opera sin iniciar sesion, y los dos con la misma pieza del paquete 1 | **Y LA DIFERENCIA ES QUE AQUI NO HAY COLUMNA QUE LO SOPORTE.** El carrito tiene token_invitado en la tabla, aunque no exista en el esquema. Aqui no hace falta ninguna columna, porque el motor solo lee: si no hay usuario, no hay senal, y se muestran las mas vendidas"],

    ["SRV_BitacoraService", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/SRV_BitacoraService.ts | **Y AQUI ESTA LA CONTRADICCION DE ESTE PAQUETE: NO LO USA NADIE.** Los tres servicios del paquete 9 tienen bitacora a mano, y ninguno la importa | **O SEA QUE EL PAQUETE 9 RECOMIENDA, PUNTUA Y EXPLICA, Y NO ANOTA NADA DE LO QUE HACE.** No deja rastro de a quien le recomiendao que, ni de por que. Y hay una tabla en el esquema, recomendaciones_ia, con una columna que se llama justo justificacion, que es para eso. Es el hueco mas grande del paquete y no se ve en ninguna parte del codigo"],

    // ---------------- DEL PAQUETE 4: 1 ----------------

    ["SRV_ProductosService", "Del Paquete 4",
    "CAPA: Del Paquete 4 | FICHERO: api/src/modulos/catalogo/SRV_ProductosService.ts | **LO DIBUJO COMO COMPONENTE PERO NO HAY NINGUN IMPORT ENTRE ESTE PAQUETE Y ESE.** Ninguno de los tres servicios de aqui importa nada del modulo de catalogo | **Y SIN EMBARGO EL PAQUETE 9 DEPENDE DEL PAQUETE 4 DE LA MANERA MAS FUERTE QUE HAY: CON LAS COLUMNAS.** La consulta candidatos, en la 180, pide p.porcentaje_iva y p.estado, de productos; id_categoria e id_temporada, tambien de productos; y las dimensiones de la prenda salen deahi, con dimensionesDePtc en la 64 del servicio de preferencias | **O SEA QUE LA DEPENDENCIA ES DE ESQUEMA, NO DE CODIGO.** Y eso significa que el mapa de dependencias que sale de leer los import dice que el paquete 9 no depende de nadie, y es mentira: depende de seis columnas de tres tablas del catalogo. Es acoplamiento invisible, y es el tipo de acoplamiento que no lo detecta ninguna herramienta"],

    // ---------------- DEL PAQUETE 7: 1 ----------------

    ["resultados_prueba y sesiones_ra", "Del Paquete 7",
    "CAPA: Del Paquete 7 | FICHERO: las dos tablas | **SON LA TERCERA SENAL DEL PERFIL, Y LA MAS BARATA DE GENERAR** | La consulta de la 152 del servicio de recomendaciones las une: resultados_prueba, sesiones_ra, producto_talla_color y productos, y filtra por LOWER de resultado igual a 'gusta' | **Y LA OBTIENE EL PAQUETE 7, NO ESTE.** La escribe SRV_SesionesRaService, en la 309, llamando a registrarPreferenciasGusta, y la foto que el vestidor genera no se guarda porque la columna no existe. O sea que la senal llega igual, pero sin la foto | **Y EL CRUCE FUNCIONA EN LOS DOS SENTIDOS**: el paquete 7 llama a este paquete, y este paquete lee las tablas de aquel. Es el unico cruce bidireccional del proyecto, y por eso el mapa de dependencias lo hacia parecer aislado | OJO: el filtro es sobre resultado, que tiene un VARCHAR de 20, y la comparacion va con LOWER. O sea que el codigo es el que decide la grafia, y la pantalla la pone"],

    // ---------------- DEL PAQUETE 8: 1 ----------------

    ["SRV_PagosService", "Del Paquete 8",
    "CAPA: Del Paquete 8 | FICHERO: api/src/modulos/pagos/SRV_PagosService.ts | **LO LLAMA EN DOS SITIOS, Y LOS DOS SON EL MISMO MOTIVO** | En la 353, el pago en caja, y en la 724, el pago confirmado por la pasarela. O sea que las dos formas de cobrar alimentan las preferencias | **Y LO LLAMA FUERA DE LA TRANSACCION, DESPUES, Y ENVUELTO EN UN TRY CATCH.** En la 768 abre el try, y en la 780 el catch. El comentario del paquete 8 lo dice con palabras: No debe bloquear el pago | **ESO ESTA MUY BIEN PENSADO Y ES LO CONTRARIO DE LO QUE HACE EL RESTO DEL PROYECTO.** Un pago ya cobrado no puede tirar abajo la operacion porque falle una recomendacion. Y aqui se resuelve con dos palabras, try y catch | **Y ES LA SEGUNDA SENAL, LA MAS FUERTE: la compra, con el peso de la cantidad.** La tercera, el Gusta, vale 1. La primera, la preferencia explicita, vale lo que el puntaje haya acumulado"],

    // ---------------- EXTERNOS: 1 ----------------

    ["Motor de IA externo", "Externos",
    "CAPA: Externos | FICHERO: api/src/modulos/recomendaciones/SRV_ScoringService.ts, y la constante IA_EXTERNAL_URL en la 29 | **ESTE COMPONENTE NO EXISTE EN EL PROYECTO, Y EL CODIGO LO DICE: la constante se inicializa con process.env.IA_EXTERNAL_URL, y si no, con la cadena VACIA** | **Y LA DEGRADACION ESTA BIEN HECHA, Y ES LO MEJOR DEL PAQUETE.** delegarIA, en la 133, devuelve null en la 138 si la variable esta vacia, y si la llamada falla o expira, avisa con el logger en la 184 y devuelve null tambien | **O SEA QUE HAY UN SEGURO Y UN DOBLE SEGURO, Y EN LOS DOS CASOS EL MOTOR INTERNO RESPONDE.** Una IA externa caida no tumba la aplicacion | **Y LA PETICION TIENE UN ABORT DE 4 SEGUNDOS**, con AbortSignal.timeout en la 141, de manera que una pasarela lenta tampoco tumba la pagina. Es el unico sitio del proyecto que pone un limite de tiempo a una llamada saliente | **LO QUE MANDA AL EXTERNO ES UN JSON CON DOS COSAS: el perfil, con los cuatro mapas convertidos con Object.fromEntries, y la lista de prendas con su categoria, talla, color y temporada.** Y lo que espera son objetos con id_ptc, score y motivo, y el servicio los acota con Math.max y Math.min para que ningun score se salga del 0 a 100"],

    // ---------------- DATOS: 16 ----------------

    ["preferencias_cliente", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **SEIS COLUMNAS, Y ES LA TABLA CENTRAL DEL PAQUETE** | TIENE id_preferencia, id_cliente, y las cuatro dimensiones, mas el puntaje | **Y NO TIENE UNIQUE NI INDICE, Y ESO LO DICE EL PROPIO PROYECTO.** El script de poblacion_datos.sql, en su bloque de diagnostico del final, lista como problema preferences_cliente sin UNIQUE ni indice, y anade que sus cinco claves foraneas son NULLABLE, de manera que admite una fila que no dice nada | **ADEMAS EL PUNTAJE NO TIENE NI DEFAULT NI CHECK.** Es un INTEGER a pelo, de manera que puede ser negativo y puede ser cero, y el motor normaliza por el maximo, con lo que un puntaje negativo hace que el maxDe de la 42 devuelva 1 y se normalice todo contra la pendiente, que es peor que no normalizar nada | **Y TIENE 14 FILAS EN EL SCRIPT DE POBLACION, PERO CERO EN LA APLICACION.** No hay ninguna pantalla ni ninguna ruta que cree una preferencia: las Preferences del cliente no se pueden escribir. Las 14 filas las puso el seed a mano, y el perfil de un cliente nuevo arranca vacio"],

    ["recomendaciones_ia", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **CINCO COLUMNAS, Y ES LA QUE NADIE ESCRIBE** | TIENE id_recomendacion, id_usuario, id_ptc, justificacion y fecha | **EL PROYECTO LE PUSO JUSTAMENTE EL NOMBRE QUE HACE FALTA.** Es la tabla de la historia de las recomendaciones, con la justificacion de cada una. O sea que la intencion esta clarisima | **Y CERO ESCRITORES.** Ni un INSERT en los 79 ficheros de modulos, ni uno en las 65 del frontend. La tabla solo crece con el script de poblacion_datos.sql, que le mete 16 filas a mano | **CONSECUENCIA: NO HAY BUCLE DE RETROALIMENTACION.** El motor calcula un motivo para cada prenda, decia el codigo, y ese motivo se enseña en pantalla y despues se tira. Nadie puede saber despues que le recomendaron, ni que se compro, ni si la recomendacion sirvio | **Y POR ESO LA IA NO APRENDE NADA.** Y con esto, el orden de los dos fallos cambia: el primero no es que la tabla este vacia, es que la columna se llama justificacion"],

    ["clientes", "Datos",
    "CAPA: Datos | FICHERO: la tabla | CINCO COLUMNAS, y la clave es usuario_id, que es UNIQUE | **LA COLUMNA QUE CONECTA USUARIOS CON CLIENTES SE LLAMA usuario_id, Y NO id_usuario.** Es la unica tabla del proyecto que llama asi a su clave foranea, y por eso los dos servicios tienen que hacer la conversion a mano con Number dos veces | **Y ES LA QUE DICE SI HAY PERFIL O NO.** idClienteDeUsuario, en la 71, busca por usuario_id, y si no devuelve null, y si devuelve null el perfil se arma con una sola senal: la del vestidor | **Y DE LAS TRES SENALES, SOLO UNA NECESITA ESTA TABLA.** Las compras se buscan por id_cliente en ventas, que ya tiene esa columna. El Gusta se busca por id_usuario en sesiones_ra. Asi que un usuario sin ficha de cliente si tiene senal del vestidor, pero no tiene senal de compras"],

    ["ventas", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **LEIDA, NUNCA ESCRITA POR ESTE PAQUETE.** La consulta de compras, en la 132, la une con venta_items y producto_talla_color y productos, y agrupa por talla, color, categoria y temporada, sumando la cantidad | **Y EL FILTRO ES SOLO POR id_cliente, SIN MIRAR EL ESTADO.** O sea que una venta en Pendiente cuenta igual que una Completada. Y con el DEFAULT de la tabla siendo Completada, y el codigo escribiendo Pendiente, hay ventas en los dos estados y el motor no distingue | **Y NO HAY UN INDICE SOBRE id_cliente**, que es la columna por la que se filtra la senal mas fuerte. La tabla tiene nueve filas de media en un proyecto de tienda, pero a escala no escala"],

    ["venta_items", "Datos",
    "CAPA: Datos | FICHERO: la tabla | SEIS COLUMNAS, leida y nunca escrita por este paquete | **ES LA QUE APORTA EL PESO DE LA SENAL DE COMPRAS, con SUM de la cantidad.** O sea que comprar dos veces la misma prenda del mismo color y talla vale dos, y una sola prenda vale una. Las unidades pesan, no las transacciones | **Y NUNCA APARECE CON ALIAS, y eso es raro, porque en las otras consultas del proyecto todo lleva apodo.** Aqui la consulta necesita las columnas de las cuatro tablas unidas, y por eso el GROUP BY tiene que repetir las de las otras tres"],

    ["productos", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **NUEVE COLUMNAS, Y DE ELLAS EL PAQUETE 9 USA TRES** | **id_categoria e id_temporada, QUE SON LAS DOS DIMENSIONES DEL PERFIL**, y que ademas son FK, de manera que la dimension del perfil sale de la cabecera del producto y no de la variante | **Y porcentaje_iva, QUE ES UNA DECLARACION CONFLICTA.** productos tiene precio_base y porcentaje_iva, y el servicio calcula con precioConIva, en la 235, con unaformula de la forma base por uno mas el porcentaje. O sea que el IVA no esta en la venta como columna calculada por el motor, se deriva del producto | **Y LA COLUMNA estado, QUE EL PAQUETE 9 SI USA Y CORRECTAMENTE, con LOWER de estado igual a 'activo'.** Es el unico sitio de los tres paquetes de stock y catalogo donde se filtra el estado del producto con LOWER, y por eso no sufre el problema de las cuatro grafias de estado_stock"],

    ["producto_talla_color", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **ES LA TABLA QUE CONVIERTE PRODUCTO EN PRENDA, Y ESTE PAQUETE LA USA COMO EJE** | De aqui salen id_talla e id_color, que son las otras dos dimensiones del perfil | **Y LA CONSULTA candidatos EMPIEZA POR ELLA, no por productos.** O sea que la unidad de recomendacion no es el producto sino la variante concreta de talla y color. Un mismo modelo aparece tantas veces como combinaciones haya con existencias | **Y EL FILTRO DE EXISTENCIAS ESTA EN UN EXISTS, NO EN UN JOIN.** En la 197, con cantidad_disponible mayor que cero. O sea que aqui SI se mira la columna de verdad, y no se mira estado_stock. Y por eso este paquete es el unico que acierta con la reserva de stock"],

    ["inventario_stock", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **LEIDA, NUNCA ESCRITA. Y LEIDA BIEN** | La consulta candidatos filtra por cantidad_disponible mayor que cero, y popularesTemporada ordena por la SUMA de cantidad_vendida, con un COALESCE a cero en la 213 | **O SEA QUE ESTE PAQUETE ES EL UNICO QUE USA LAS DOS COLUMNAS QUE IMPORTAN: CUANTO HAY Y CUANTO SE HA VENDIDO.** Y es el primero que mira cantidad_vendida para algo distinto de accumularla | **Y NO SUFRE EL ERROR DEL PAQUETE 7.** Aqui no se escribe nada, se lee. El doble credito del disponible no le puede llegar porque no toca la tabla"],

    ["producto_imagenes", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **SE USA CON UNA SUBCONSULTA, Y ESTA BIEN HECHA** | En la 187, para coger la imagen principal: una subconsulta sobre producto_imagenes que filtra por es_principal igual a true y ordena por orden y luego por identificador, y se queda con la primera, con un LIMIT 1 | **ESO ES LA DEFENSA CONTRA EL NULO, Y NO ES LO NORMAL.** Un producto sin imagen principal devuelve null en vez de devolver una fila vacia o un producto entero repetido por cada imagen. Y lo pone como alias, imagen_principal, para que el servicio sepa de donde viene | Y SE USA IGUAL EN LAS DOS CONSULTAS, la de candidatos y la de las mas vendidas, o sea que el autor copio el bloque entero y lo mantuvo"],

    ["temporadas", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **CINCO COLUMNAS, Y LA FECHA LA DECIDE TODO** | La temporada actual, en la 81, es la que cumple tres cosas a la vez: LOWER de estado igual a activa, y fecha_inicio menor o igual que hoy, y fecha_fin mayor o igual que hoy | **Y ESO ES UN MODELO BIEN PENSADO**: una temporada tiene principio y fin, y el motor no mira solo el estado. Una coleccion de invierno puede estar activa y no haber empezado todavia | **Y SI DOS TEMPORADAS SE SOLAPAN, GANA LA DE IDENTIFICADOR MAS ALTO**, porque el ORDER BY es por id_temporada descendente. No hay ninguna regla que lo impida en el esquema, asi que es un comportamiento que depende del orden de insercion | **Y LA TABLA ESTA EN UN JOIN LEFT, no en un JOIN.** De manera que un producto sin temporada no desaparece de las recomendaciones: aparece, y solo que no le suma puntos en esa dimension"],

    ["categorias, tallas y colores", "Datos",
    "CAPA: Datos | FICHERO: las tres tablas | **LAS TRES TABLAS DE LAS CUATRO DIMENSIONES DEL PERFIL, JUNTAS EN UN SOLO COMPONENTE** | categorias es LEFT JOIN, porque puede haber productos sin categoria. tallas y colores son JOIN a secas, porque una prenda sin talla o sin color no tiene sentido y se descarta | **Y LAS CUATRO DIMENSIONES DEL PERFIL SON ESTAS TRES MAS LAS TEMPORADAS.** Categoría pesa 40, talla 25, color 20 y temporada 15 | **Y DE LAS CUATRO, TRES TIENEN LA DIMENSION A NULL EN LA TABLA Y LA CUARTA TAMBIEN.** En preferencias_cliente las cuatro columnas admiten nulo, y ademas el upsert exige que las otras tres sean null para encontrar la fila. O sea que una preferencia de solo color se guarda con la categoria, la talla y la temporada a null, y por eso la funcion sumar de la 108 descarta la clave cuando es null | **COLORES ADEMAS TRAE codigo_hex, Y EL PAQUETE NO LO USA.** Se pide en la consulta y se devuelve, y eso es un campo de mas en una consulta que ya trae 18 columnas"],

    ["usuarios, roles y usuarios_roles", "Datos",
    "CAPA: Datos | FICHERO: las tres tablas | **LAS TRES TABLAS DEL PERMISO, Y SE USAN EN UNA SOLA CONSULTA** | cargarPermisos, en la 52, une usuarios con usuarios_roles y con roles, y si no encuentra el rol, lanza el ForbiddenException de la 67 | **Y EL UNICO MENSAJE DE PERMISO DEL PAQUETE 9 ES ESE**: No tienes permisos para acceder a recomendaciones. O sea que el motor de recomendaciones tiene la MISMA regla de acceso que la administracion, y por lo tanto un cliente normal no puede ver recomendaciones | **Y ESTO CHOCA CON LA GUARDIA OPCIONAL DEL CONTROLADOR.** El controlador deja pasar a cualquiera que no haya iniciado sesion, pero si la ha iniciado, el servicio exige el rol. O sea que el visitante anonimo ve recomendaciones y el cliente registrado no. Al reves de lo que uno esperaria, y no hay forma de arreglarlo sin tocar una de las dos mitades | **Y LA CONSULTA NO LLEVA NINGUN LIMITE Y NO USA NINGUNA COLUMNA DE ROL.** O sea que se lee el rol entero del usuario y no se mira que valor tiene. Con tres filas en roles da igual, pero es una consulta que no filtra lo que dice filtrar"],

    ["CE_Modelos.ts (seguridad)", "Datos",
    "CAPA: Datos | FICHERO: api/src/modulos/seguridad/CE_Modelos.ts | LA USA EL CONTROLADOR Y EL SERVICIO DE RECOMENDACIONES, o sea los dos unicos que llevan usuario | **Y DE AQUI SALE EL TIPADO DE LA RUTA UNICA DEL PAQUETE**: el controlador declara que la ruta recibe CredencialesCarrito y pasa credenciales.usuario al servicio, y ese usuario es de tipo Usuario, que es lo unico que este paquete importa de la base de datos por TypeScript | **NINGUNO DE LOS TRES SERVICIOS USA OTRA ENTIDAD.** Ni preferences, ni usuario, ni rol. Todo el modelo del motor lo manejan SQL a mano, como en los otros ocho paquetes"],

    ["sesiones_ra", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **CINCO COLUMNAS EFECTIVAS, Y ESTA EN LA CAPA DE PAQUETE 7 PERO SE USA AQUI** | La consulta de la 152 la une con resultados_prueba por id_sesion_ra, y filtra por id_usuario | **Y ESTA CONECTADA A LAS DOS DIRECCIONES:** la escribe el paquete 7, en la 309, y la lee este paquete. Y las siete columnas de la tabla, con sus dos referencias a usuario y a producto, son justo lo que hace falta para unirla | OJO: esta es una de las dos tablas de la senal del vestidor, y no es la que tiene la columna inexistente. La que la tiene es el resultado, que se guarda aparte"],

    ["resultados_prueba", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **CINCO COLUMNAS, Y LA QUE DICE SI LA PRENDA GUSTO** | La consulta de la 152 filtra con LOWER de resultado igual a 'gusta' | **O SEA QUE LA TERCERA SENAL DEL PERFIL DEPENDE ENTERA DE QUE ESA COLUMNA SE LLENE CON ESA GRAFIA.** Y no hay nada en el esquema que lo diga: resultado es un VARCHAR de 20, sin CHECK, sin lista de valores. Si el vestidor escribe Gusta, y el motor busca gusta, la LOWER lo arregla. Si escribiera gustar, ya no | **Y LA TABLA SI EXISTE, LA ESCRIBE EL PAQUETE 7, Y POR ESO ESTA SENAL ES LA UNICA QUE NO ESTA ROTA.** Al contrario que foto_resultado, que no tiene columna. Esta tiene columna, se escribe, y el motor la lee | Y SU HERMANA, resultados_prueba, es de las pocas tablas del proyecto que el esquema respeta y el codigo tambien"],

    ["PostgreSQL 16", "Datos",
    "CAPA: Datos | LAS QUINCE TABLAS PROPIAS SON preferencias_cliente con 6, recomendaciones_ia con 5, clientes con 5, ventas con 11, venta_items con 6, productos con 9, producto_talla_color, inventario_stock con 7, producto_imagenes, temporadas con 5, categorias, tallas, colores, usuarios, roles y usuarios_roles | **LO QUE SOSTIENE EL MOTOR SON TRES COSAS Y LAS TRES ESTAN FUERA DE LA BASE DE DATOS.** Los pesos, en el codigo. La normalizacion, en el codigo. El criterio de temporada vacia, en el codigo | **Y LA TABLA QUE EL PROYECTO ESCRIBIO PARA ESTO ESTA VACIA, CON 16 FILAS DE SEED Y CERO DE LA APLICACION.** Es la unica del paquete que tiene columna de justificacion y no la rellena nadie | **Y LAS 16 TABLAS DEL PAQUETE ESTAN LEIDAS, MENOS UNA QUE SE ESCRIBE: preferencias_cliente.** El motor no cambia nada del catalogo, y por eso puede ser Recommended sin riesgo de corromper nada"]
];


// ================================================================
// LAS 44 INTERFACES   [origen, destino, nombre, tipo, estereotipo]
// ================================================================

var REL = [
    // ---- pantalla -> cliente HTTP: 1 ----
    ["Recomendaciones.tsx", "api.ts", "obtenerRecomendaciones, la unica ruta", "Assembly", "llama"],

    // ---- cliente -> control: 1 ----
    ["api.ts", "CTR_Recomendaciones", "HTTP/JSON, 1 ruta GET", "Assembly", "expone"],

    // ---- importaciones de codigo: 5 ----
    ["CTR_Recomendaciones", "dependencias.ts", "JwtOpcionalAuthGuard y CredencialesCarritoActual", "Dependency", "importa"],
    ["SRV_RecomendacionesService", "SRV_PreferenciasService", "le pasa el id de la temporada", "Dependency", "delega"],
    ["SRV_RecomendacionesService", "SRV_ScoringService", "scoringInterno y delegarIA", "Dependency", "delega"],
    ["CTR_Recomendaciones", "CE_Modelos.ts (seguridad)", "Usuario, el tipo de la credencial", "Dependency", "importa"],
    ["SRV_RecomendacionesService", "CE_Modelos.ts (seguridad)", "Usuario, para el perfil del vestidor", "Dependency", "importa"],

    // ---- control -> logica: 1 ----
    ["CTR_Recomendaciones", "SRV_RecomendacionesService", "recomendar, 1 metodo para 1 ruta", "Dependency", "delega"],

    // ---- hacia el externo: 1 ----
    ["SRV_ScoringService", "Motor de IA externo", "POST con abort de 4 segundos, y degrada", "Assembly", "simula"],

    // ---- hacia las tablas: 18 ----
    ["SRV_RecomendacionesService", "preferencias_cliente", "senal 1, con el puntaje", "Assembly", "consulta"],
    ["SRV_RecomendacionesService", "ventas", "senal 2, por SUM de la cantidad", "Assembly", "consulta"],
    ["SRV_RecomendacionesService", "resultados_prueba y sesiones_ra", "senal 3, filtrando por 'gusta'", "Assembly", "consulta"],
    ["SRV_RecomendacionesService", "producto_talla_color", "las dos dimensiones de la prenda", "Assembly", "consulta"],
    ["SRV_RecomendacionesService", "productos", "categoria, temporada, IVA y estado", "Assembly", "consulta"],
    ["SRV_RecomendacionesService", "inventario_stock", "filtra por cantidad_disponible", "Assembly", "consulta"],
    ["SRV_RecomendacionesService", "producto_imagenes", "la imagen principal, con EXISTS", "Assembly", "consulta"],
    ["SRV_RecomendacionesService", "temporadas", "la temporada actual, con 3 condiciones", "Assembly", "consulta"],
    ["SRV_RecomendacionesService", "categorias, tallas y colores", "3 de las 4 dimensiones", "Assembly", "consulta"],
    ["SRV_RecomendacionesService", "usuarios, roles y usuarios_roles", "el permiso, en 1 consulta", "Assembly", "consulta"],
    ["SRV_RecomendacionesService", "clientes", "usuario a cliente, por usuario_id", "Assembly", "consulta"],
    ["SRV_RecomendacionesService", "recomendaciones_ia", "la tabla que NO escribe", "Assembly", "ignora"],
    ["SRV_PreferenciasService", "preferencias_cliente", "el unico INSERT del paquete", "Assembly", "escribe"],
    ["SRV_PreferenciasService", "ventas", "el id_cliente de la venta", "Assembly", "consulta"],
    ["SRV_PreferenciasService", "venta_items", "la cantidad comprada de cada prenda", "Assembly", "consulta"],
    ["SRV_PreferenciasService", "producto_talla_color", "las 4 dimensiones de la prenda", "Assembly", "consulta"],
    ["SRV_PreferenciasService", "clientes", "usuario a cliente, por usuario_id", "Assembly", "consulta"],
    ["SRV_PreferenciasService", "productos", "categoria y temporada de la prenda", "Assembly", "consulta"],
    ["SRV_PreferenciasService", "SRV_PagosService", "el paquete 8 la llama en 2 sitios", "Dependency", "delega"],

    // ---- hacia PostgreSQL 16: 16 ----
    ["preferencias_cliente", "PostgreSQL 16", "6 columnas, sin UNIQUE ni indice", "Assembly", "apunta"],
    ["recomendaciones_ia", "PostgreSQL 16", "5 columnas, 16 filas de seed y 0 de la app", "Assembly", "apunta"],
    ["clientes", "PostgreSQL 16", "la clave se llama usuario_id", "Assembly", "apunta"],
    ["ventas", "PostgreSQL 16", "11 columnas, sin indice por id_cliente", "Assembly", "apunta"],
    ["venta_items", "PostgreSQL 16", "6 columnas, y el peso es la cantidad", "Assembly", "apunta"],
    ["productos", "PostgreSQL 16", "el IVA vive aqui, no en la venta", "Assembly", "apunta"],
    ["producto_talla_color", "PostgreSQL 16", "la unidad de recomendacion", "Assembly", "apunta"],
    ["inventario_stock", "PostgreSQL 16", "las dos columnas que si importan", "Assembly", "apunta"],
    ["producto_imagenes", "PostgreSQL 16", "es_principal y orden", "Assembly", "apunta"],
    ["temporadas", "PostgreSQL 16", "fecha_inicio y fecha_fin deciden", "Assembly", "apunta"],
    ["categorias, tallas y colores", "PostgreSQL 16", "3 dimensiones del perfil", "Assembly", "apunta"],
    ["usuarios, roles y usuarios_roles", "PostgreSQL 16", "el permiso se comprueba aqui", "Assembly", "apunta"],
    ["sesiones_ra", "PostgreSQL 16", "7 columnas, esta si existe", "Assembly", "apunta"],
    ["resultados_prueba", "PostgreSQL 16", "5 columnas, sin CHECK", "Assembly", "apunta"],
    ["SRV_RecomendacionesService", "PostgreSQL 16", "0 escrituras, 12 SELECT", "Assembly", "consulta"],
    ["SRV_PreferenciasService", "PostgreSQL 16", "0 transacciones, y eso es un fallo", "Assembly", "consulta"]
];


// ================================================================
// DONDE CAE CADA COMPONENTE   [nombre, izquierda, arriba, ancho, alto]
// ================================================================

var DOND = [
    ["Recomendaciones.tsx", 55, 100, 230, 90],
    ["api.ts", 300, 100, 230, 90],

    ["CTR_Recomendaciones", 55, 360, 350, 95],

    ["SRV_RecomendacionesService", 55, 580, 240, 105],
    ["SRV_ScoringService", 315, 580, 240, 105],
    ["SRV_PreferenciasService", 575, 580, 240, 105],

    ["dependencias.ts", 905, 100, 250, 70],
    ["SRV_BitacoraService", 905, 180, 250, 70],

    ["SRV_ProductosService", 905, 360, 250, 90],

    ["resultados_prueba y sesiones_ra", 905, 580, 250, 90],

    ["SRV_PagosService", 905, 800, 250, 90],

    ["Motor de IA externo", 905, 1020, 250, 80],

    ["preferencias_cliente", 1255, 100, 290, 85],
    ["recomendaciones_ia", 1255, 225, 290, 85],
    ["CE_Modelos.ts (seguridad)", 1255, 350, 290, 85],
    ["clientes", 1255, 475, 290, 85],
    ["ventas", 1255, 600, 290, 85],
    ["venta_items", 1255, 725, 290, 85],
    ["productos", 1255, 850, 290, 85],
    ["producto_talla_color", 1255, 975, 290, 85],
    ["inventario_stock", 1560, 100, 290, 85],
    ["producto_imagenes", 1560, 225, 290, 85],
    ["temporadas", 1560, 350, 290, 85],
    ["categorias, tallas y colores", 1560, 475, 290, 85],
    ["usuarios, roles y usuarios_roles", 1560, 600, 290, 85],
    ["sesiones_ra", 1560, 725, 290, 85],
    ["resultados_prueba", 1560, 850, 290, 85],
    ["PostgreSQL 16", 1560, 975, 290, 85]
];


function aviso(txt) {
    try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup(txt, 0, "Paquete 9 - Servicios de IA", 64);
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


// ---------- EL MARCO ----------

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
    N.push("ARQUITECTURA DEL PAQUETE 9 - INFORME DE EJECUCION");
    N.push("Paquete 9: Servicios de Inteligencia Artificial. Caso CU32.");
    N.push("");
    N.push("Componentes:   " + creados + " de " + TOTAL_CMP);
    N.push("Interfaces:    " + enlaces + " de " + TOTAL_REL);
    N.push("Marcos:        " + marcosCreados + " de 10, y son Package reales");
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
    N.push("  deben ser 38 objetos con tamano: 28 componentes + 10 marcos.");
    N.push("");
    N.push("EL REPARTO DE LOS 28 COMPONENTES");
    N.push("  Presentacion        2   1 pantalla y el cliente HTTP");
    N.push("  Control             1   la unica ruta del paquete");
    N.push("  Logica de Negocio  3   uno construye el perfil, otro puntua, otro aprende");
    N.push("  Del Paquete 1       2   la guardia opcional y la bitacora que no se usa");
    N.push("  Del Paquete 4       1   el acoplamiento invisible, por columnas");
    N.push("  Del Paquete 7       1   las dos tablas de la senal del vestidor");
    N.push("  Del Paquete 8       1   el pago que dispara la senal de compras");
    N.push("  Externos            1   el motor de IA, que no existe");
    N.push("  Datos              16   14 tablas, las entidades y el motor");
    N.push("");
    N.push("EL REPARTO DE LAS 44 INTERFACES");
    N.push("  pantalla -> cliente HTTP       1   una sola pantalla, una sola ruta");
    N.push("  cliente -> control             1   la ruta unica del paquete");
    N.push("  importaciones de codigo        6   de las cuales 3 son de servicio a servicio");
    N.push("  hacia el externo                1   el POST con limite de 4 segundos");
    N.push("  hacia las tablas              19   16 de lectura y 3 de escritura");
    N.push("  hacia PostgreSQL 16           16   2 servicios y 14 entidades");
    N.push("");
    N.push("POR QUE ESTE PAQUETE ES DISTINTO A LOS OTROS OCHO");
    N.push("");
    N.push("  28 componentes, 54 interfaces, Y UNA SOLA RUTA.");
    N.push("");
    N.push("  Los otros ocho paquetes tienen entre 9 y 31 componentes y entre");
    N.push("  11 y 62 interfaces.  Este tiene 28 y 54 con un unico GET.");
    N.push("");
    N.push("  O SEA QUE EL 90 POR CIENTO DEL PAQUETE NO SE ALCANZA POR HTTP.");
    N.push("  Lo llaman los paquetes 7 y 8, que son los que disparan las tres");
    N.push("  senales con las que el motor puntua.");
    N.push("");
    N.push("  Y POR ESO EL MAPA DE DEPENDENCIAS LO HACIA PARECER EL PAQUETE MAS");
    N.push("  AISLADO, Y ES JUSTO LO CONTRARIO.  El paquete 9 es el nodo que");
    N.push("  recibe de dos paquetes y que devuelve a dos.");
    N.push("");
    N.push("FALLO 1: LA TABLA recomendaciones_ia NO LA ESCRIBE NADIE");
    N.push("");
    N.push("  id_recomendacion, id_usuario, id_ptc, justificacion, fecha.");
    N.push("  CINCO COLUMNAS.");
    N.push("");
    N.push("  CERO INSERT en los 79 ficheros de modulos.  CERO en las 65 del");
    N.push("  frontend.  La tabla solo crece con el script de poblacion_datos.sql,");
    N.push("  que le mete 16 filas a mano.");
    N.push("");
    N.push("  Y EL NOMBRE DE LA COLUMNA LO DICE TODO: se llama justificacion.");
    N.push("  La tabla esta disenada justamente para guardar el motivo de cada");
    N.push("  recomendacion, que es lo unico que el servicio calcula de verdad,");
    N.push("  con motivoPrincipal en la 56 de SRV_ScoringService.");
    N.push("");
    N.push("  CONSECUENCIA: NO HAY BUCLE DE RETROALIMENTACION.  El motivo se");
    N.push("  enseña en pantalla y despues se tira.  Nadie puede saber despues");
    N.push("  que le recomendaron, ni si la recomendacion sirvio, ni que se compro.");
    N.push("");
    N.push("  Y POR ESO LA IA NO APRENDE NADA.  Y con esto el orden de los dos");
    N.push("  fallos cambia: el primero no es que la tabla este vacia, es que la");
    N.push("  columna se llama justificacion.");
    N.push("");
    N.push("FALLO 2: EL UPSERT DE PREFERENCIAS NO PUEDE SER ATOMICO");
    N.push("");
    N.push("  upsertDimension, en la 29 de SRV_PreferenciasService:");
    N.push("");
    N.push("    L40  SELECT id_preferencia FROM preferencias_cliente");
    N.push("          WHERE id_cliente = $1 AND ... = $2 LIMIT 1");
    N.push("    L49  UPDATE preferencias_cliente SET puntaje = puntaje + $2");
    N.push("    L56  INSERT INTO preferencias_cliente (id_cliente, ...) VALUES (...)");
    N.push("");
    N.push("  ENTRE EL SELECT Y EL INSERT NO HAY NADA.  Cero transacciones en el");
    N.push("  servicio.  Y la tabla no tiene UNIQUE ni indice, ni sobre las cinco");
    N.push("  columnas ni sobre ninguna.");
    N.push("");
    N.push("  Y SE LLAMA CUATRO VECES POR PRENDA, porque hay cuatro dimensiones.");
    N.push("  De manera que una compra de tres prendas son doce SELECT y hasta");
    N.push("  doce INSERT, todos fuera de transaccion.");
    N.push("");
    N.push("  DOS COMPRAS A LA VEZ PASAN POR AHI, LAS DOS NO ENCUENTRAN FILA, Y");
    N.push("  LAS DOS INSERTAN.  No hay indice que lo impida y no hay transaccion");
    N.push("  que lo deshaga.  El perfil se infla solo y nadie se entera, porque");
    N.push("  sumar en la 108 no distingue y solo acumula.");
    N.push("");
    N.push("  Y NO ES MI INVENTARIO: el propio proyecto lo dice.  El script de");
    N.push("  poblacion_datos.sql, en su bloque de diagnostico del final, lista");
    N.push("  cinco problemas, y uno es:  preferencias_cliente sin UNIQUE ni indice,");
    N.push("  y sus 5 claves foraneas son NULLABLE, asi que admite una fila que no");
    N.push("  dice nada.");
    N.push("");
    N.push("  LOS CINCO PROBLEMAS QUE EL PROPIO PROYECTO DECLARA SON:");
    N.push("    inventario_stock NO tiene ningun CHECK, y las 4 cantidades pueden");
    N.push("      quedar negativas");
    N.push("    producto_talla_color.estado_stock NO se escribe, esta en Disponible");
    N.push("      siempre, y 6 sitios la leen para decidir si hay stock");
    N.push("    faltan 2 columnas en el esquema, carritos.token_invitado y");
    N.push("      sesiones_ra.foto_resultado");
    N.push("    ventas.estado DEFAULT Completada, pero el codigo siempre pone");
    N.push("      Pendiente, asi que el DEFAULT esta muerto");
    N.push("    preferencias_cliente sin UNIQUE ni indice");
    N.push("");
    N.push("FALLO 3: EL PUNTAJE NO ES UN MODELO, SON CUATRO PESOS Y UNA DIVISION");
    N.push("");
    N.push("  PESO_CATEGORIA   40");
    N.push("  PESO_TALLA       25");
    N.push("  PESO_COLOR       20");
    N.push("  PESO_TEMPORADA  15        suman 100");
    N.push("  BONUS_TEMPORADA_ACTUAL   8");
    N.push("");
    N.push("  Y CADA DIMENSION SE NORMALIZA DIVIDIENDO POR EL MAXIMO DE ESA");
    N.push("  DIMENSION, con norm en la 51 y maxDe en la 42.");
    N.push("");
    N.push("  O SEA QUE EL VALOR ABSOLUTO DE LOS PUNTAJES NO IMPORTA, SOLO EL");
    N.push("  ORDEN.  Un cliente con diez compras de una talla y otro con una");
    N.push("  sola dan el mismo resultado.");
    N.push("");
    N.push("  Y POR TANTO EL MOTOR ES EL MISMO PARA TODOS LOS CLIENTES.  No hay");
    N.push("  nada aprendido y ningun parametro que cambie con el uso.  Lo unico");
    N.push("  que se personalizar son los cuatro mapas de entrada.");
    N.push("");
    N.push("  EL MOTIVO ES UNA ETIQUETA DE LA DIMENSION QUE MAS PESA, no una");
    N.push("  explicacion.  Y EL PUNTAJE SE MUESTRA COMO PORCENTAJE, lo cual no")
    N.push("  quiere decir nada: no hay nada de aqui al 100.");
    N.push("");
    N.push("  Y LA CATEGORIA PESA EL DOBLE QUE EL COLOR, CON 40 CONTRA 20.  O");
    N.push("  sea que el motor recomienda por tipo de prenda y no por estilo, en");
    N.push("  una tienda que es de ropa.");
    N.push("");
    N.push("LO QUE ESTA HECHO CON LA DEGRADACION, Y ES LO MEJOR DEL PAQUETE");
    N.push("");
    N.push("  delegarIA, en la 133 de SRV_ScoringService, hace POST a");
    N.push("  IA_EXTERNAL_URL con un ABORT DE 4 SEGUNDOS, AbortSignal.timeout en");
    N.push("  la 141.");
    N.push("");
    N.push("  Y HAY UN DOBLE SEGURO:");
    N.push("    si la variable de entorno no esta, devuelve null en la 138");
    N.push("    si la llamada falla o expira, avisa con el logger y devuelve null en la 184")
    N.push("");
    N.push("  EN LOS DOS CASOS EL MOTOR INTERNO RESPONDE.  Una IA externa caida no");
    N.push("  tumba la aplicacion, y una pasarela lenta tampoco tumba la pagina.");
    N.push("  Es el unico sitio del proyecto que pone un limite de tiempo a una");
    N.push("  llamada saliente, y por eso esta bien hecho.");
    N.push("");
    N.push("  Y EL PAYLOAD ESTA ACOTADO AL VOLVER: el score que manda el externo");
    N.push("  pasa por Math.max y Math.min para que nadie se salga del 0 a 100, y");
    N.push("  el motivo, si no viene o viene en blanco, se cambia por");
    N.push("  Recomendado para ti.");
    N.push("");
    N.push("  IA_EXTERNAL_URL SE INICIALIZA CON process.env.IA_EXTERNAL_URL, y si");
    N.push("  no, con la CADENA VACIA.  O sea que el codigo deja constancia de que");
    N.push("  el motor externo no viene con el proyecto.  Con la cadena vacia, el")
    N.push("  motor interno es el unico que funciona, y por eso el CU32 se puede")
    N.push("  demostrar entero sin nada externo.");
    N.push("");
    N.push("LO QUE ESTA HECHO Y TAMBIEN CUENTA COMO ARQUITECTURA");
    N.push("");
    N.push("  SRV_ScoringService SEPARA EL CALCULO DE LOS DATOS.  Es el unico");
    N.push("  servicio del proyecto que no toca ninguna tabla y que ni siquiera");
    N.push("  tiene constructor, porque no inyecta nada.  Solo un Logger.  Los")
    N.push("  demas mezclan las dos cosas, y aqui el motor se podria cambiar")
    N.push("  entero sin tocar una sola consulta");
    N.push("");
    N.push("  LAS TRES SENALES LLEGAN SUMADAS A LOS MISMOS CUATRO MAPAS, con la");
    N.push("  funcion sumar de la 108.  Comprar, marcar Gusta y tener una")
    N.push("  preferencia guardada son tres cosas que mueven las mismas cuatro");
    N.push("  dimensiones.  Es lo que hace que el perfil sea comparable entre");
    N.push("  clientes");
    N.push("");
    N.push("  SI EL PERFIL ESTA VACIO NO PUNTUA NADA: devuelve las mas vendidas de");
    N.push("  la temporada actual, con popularesTemporada en la 202.  El codigo lo");
    N.push("  etiqueta como E3, y es un buen criterio: sin datos, no inventar,");
    N.push("  ofrecer lo que la tienda ya sabe que se vende");
    N.push("");
    N.push("  LA CONSULTA DE CANDIDATOS ESTA BIEN HECHA.  La imagen principal se");
    N.push("  pide con una subconsulta sobre producto_imagenes que filtra por")
    N.push("  es_principal igual a true y ordena por orden y luego por")
    N.push("  identificador, con un LIMIT 1.  Un producto sin imagen devuelve");
    N.push("  null en vez de repetir la fila.  Y el filtro de existencias esta en")
    N.push("  un EXISTS con cantidad_disponible mayor que cero, no en un JOIN, de")
    N.push("  manera que no duplica ninguna prenda.  Eso esta mas cuidado que")
    N.push("  cualquier otra consulta de recommendation del proyecto");
    N.push("");
    N.push("  Y EL IVA SE DERIVA DEL PRODUCTO, con precioConIva en la 235, en vez")
    N.push("  de venir calculado en la venta.  Es una decision discutible, porque")
    N.push("  si el porcentaje cambia, las ventas viejas no cuadran con el precio")
    N.push("  que se muestra ahora, pero al menos el calculo esta en un sitio")
    N.push("");
    N.push("LO QUE NO ESTA BIEN, Y TAMBIEN SE VE");
    N.push("");
    N.push("  EL PERMISO ESTA INVERTIDO RESPECTO A LA GUARDIA.  El controlador");
    N.push("  deja pasar a cualquiera con JwtOpcionalAuthGuard, y el servicio")
    N.push("  exige el rol con exigirPermisoRecomendaciones, en la 67.  O sea que")
    N.push("  el visitante ANONIMO ve recomendaciones y el cliente REGISTRADO no.")
    N.push("  Al reves de lo que uno esperaria, y no hay forma de arreglarlo sin")
    N.push("  tocar una de las dos mitades");
    N.push("");
    N.push("  LAS CINCO CLAVES FORANEAS DE preferencias_cliente SON NULLABLE, Y")
    N.push("  ESO ADMITE UNA FILA QUE NO DICE NINGUNA COSA.**  Un cliente, cuatro");
    N.push("  dimensiones a nulo y un puntaje.  El motor la suma y no cambia ningun");
    N.push("  mapa, porque sumar descarta la clave cuando es null");
    N.push("");
    N.push("  EL PUNTAJE NO TIENE NI DEFAULT NI CHECK.  Es un INTEGER a pelo, de")
    N.push("  manera que puede ser negativo.  Y si lo es, maxDe devuelve 1 y se")
    N.push("  normaliza todo contra la pendiente, que es peor que no normalizar");
    N.push("");
    N.push("  LA SENAL DE COMPRAS NO MIRA EL ESTADO DE LA VENTA.**  La consulta")
    N.push("  de la 132 filtra solo por id_cliente.  Una venta en Pendiente cuenta")
    N.push("  igual que una Completada, y con el DEFAULT de la tabla siendo")
    N.push("  Completada y el codigo escribiendo Pendiente, hay ventas en los dos");
    N.push("  estados y el motor no los distingue");
    N.push("");
    N.push("  Y VENTAS NO TIENE INDICE POR id_cliente, QUE ES LA COLUMNA POR LA")
    N.push("  QUE SE FILTRA LA SENAL MAS FUERTE.  Un proyecto de tienda lo")
    N.push("  aguanta.  Un catalogo de verdad no");
    N.push("");
    N.push("  LAS CUATRO DIMENSIONES DEL PERFIL SON LAS MISMAS QUE LAS DEL")
    N.push("  CATALOGO.**  Y el perfil guarda una sola combinacion por fila, con")
    N.push("  las otras tres dimensiones a nulo.  O sea que un cliente que le")
    N.push("  gusta una talla en un color de una categoria tiene tres filas, y el")
    N.push("  perfil suma las tres por separado.  Se podria haber guardado una")
    N.push("  fila por prenda con las cuatro dimensiones llenas, y habria dado")
    N.push("  mas informacion");
    N.push("");
    N.push("  LA CONSULTA DE CANDIDATOS NO TIENE LIMITE NI PAGINACION, Y TRAE")
    N.push("  18 COLUMNAS DE CADA VARIANTE CON EXISTENCIAS.**  Trae descripcion")
    N.push("  larga, codigo de color, y el precio base y el IVA.  Y luego el")
    N.push("  servicio se queda con las 5 primeras y descarta el resto, porque la");
    N.push("  pantalla solo necesita id_ptc, score y motivo.  En un catalogo")
    N.push("  grande, cada peticion de recomendaciones arrastra el catalogo entero");
    N.push("");
    N.push("  Y EL PAQUETE 9 RECOMIENDA, PUNTUA Y EXPLICA, Y NO ANOTA NADA DE LO")
    N.push("  QUE HACE.**  Los tres servicios tienen la bitacora a mano y ninguno la")
    N.push("  importa.  Es el hueco mas grande del paquete, y no se ve en ninguna");
    N.push("  parte del codigo porque no hay ninguna linea que lo diga");
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
    U.push("PAQUETE 9 - Servicios de Inteligencia Artificial");
    U.push("CU32   ·   1 modulo   ·   1 ruta GET   ·   5 ficheros, 672 lineas");
    U.push("");
    U.push("Componentes:   " + creados + " de " + TOTAL_CMP);
    U.push("Interfaces:    " + enlaces + " de " + TOTAL_REL);
    U.push("Marcos:        " + marcosCreados + " de 10");
    U.push("Huerfanos:     " + huerfanos);
    U.push("Errores:       " + ERRORES.length);
    U.push("");
    U.push("LEIDO DEL DIAGRAMA:");
    U.push("  tipo:       " + tipoDiag);
    U.push("  objetos:    " + nObj);
    U.push("  con tamano: " + conTam + "   (deben ser 38)");
    U.push("  lineas:     " + nLin);
    U.push("");
    U.push("FALLO 1: la tabla recomendaciones_ia no la escribe nadie.");
    U.push("  Tiene una columna que se llama justificacion, y el");
    U.push("  servicio calcula un motivo para cada prenda.");
    U.push("  No hay bucle de retroalimentacion.");
    U.push("");
    U.push("FALLO 2: el upsert de preferencias es un SELECT y luego un");
    U.push("  INSERT, sin transaccion y sin UNIQUE. Se llama 4 veces");
    U.push("  por prenda. Dos compras a la vez duplican la fila.");
    U.push("");
    U.push("FALLO 3: el puntaje son 4 pesos y una division por el maximo.");
    U.push("  El motor es el mismo para todos los clientes.");
    U.push("");
    U.push("LO BUENO: la degradacion de la IA externa esta bien hecha,");
    U.push("  con doble seguro y abort de 4 segundos. Y SRV_ScoringService");
    U.push("  separa el calculo de los datos: no toca ninguna tabla.");
    U.push("");
    if (conTam < 38) U.push("AVISO: menos de 38 con tamano. Copia este texto y pegamelo.");
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
