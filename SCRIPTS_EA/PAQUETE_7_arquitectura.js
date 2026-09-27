// ================================================================
// PAQUETE 7  ·  ARQUITECTURA DEL SUBSISTEMA
// Gestion de Reservas y Vestidor  ·  CU21, CU22, CU23, CU24
// E-COMMERCE TIENDA MONTANO   ·   Seccion 5.3.7
//
// QUE DIBUJA
//   El diagrama de componentes del paquete 7, con los 24 componentes
//   del subsistema y las 37 interfaces entre ellos, y TODO DENTRO de
//   un marco que se llama PAQUETE 7 - RESERVAS Y VESTIDOR.
//
//   Dos modulos de NestJS, reservas y sesiones-ra, que no se importan
//   entre si.  Y el servicio de reservas es el fichero mas largo de
//   todo el backend, con 1.215 lineas.
//
//   22 componentes:  8 de presentacion, 2 de control, 2 de logica,
//                    2 del paquete 1, 1 del paquete 9 y 9 de datos
//   37 interfaces
//
// PATRON COPIADO DE CAPAS_diagrama_por_capas.js, QUE SI DIBUJA BIEN
//   -  Los marcos son Package REALES del modelo, con Sequence = 1.
//   -  LAS COORDENADAS VERTICALES VAN EN NEGATIVO.
//   -  DOS PASADAS con guardarYRecargar entre ellas.
//   -  El conector se coloca con con.DiagramID = diag.ID.
//
// EL HALLAZGO DE ESTE PAQUETE, Y ES EL MAS GRAVE DEL PROYECTO
//   El metodo liberarStockReserva ACREDITA EL STOCK DOS VECES:
//
//     L703  INSERT INTO movimientos_inventario
//           VALUES (..., 'SALIDA-RESERVA', $3, ...)  con la cantidad
//                                                  EN POSITIVO
//     L708  UPDATE inventario_stock
//           SET cantidad_reservada = GREATEST(0, cantidad_reservada - $3),
//               cantidad_disponible = cantidad_disponible + $3
//
//   El INSERT salta trg_movimiento_inventario, y el disparador hace
//   cantidad_disponible = cantidad_disponible + NEW.cantidad.  Como la
//   cantidad va en POSITIVO, el disparador ACREDITA.  Y despues la
//   linea 708 lo acredita OTRA VEZ, a mano.
//
//   Cada prenda de cada reserva cerrada suma el doble al stock
//   disponible de esa tienda, y por eso el numero que ve el cliente y
//   el que tiene el motor dejan de ser el mismo.
//
//   Y HAY UNA SEGUNDA CONSECUENCIA: la linea 708 es la UNICA escritura
//   directa a la COLUMNA cantidad_disponible de todo el proyecto.  En
//   total hay cinco UPDATE contra inventario_stock, repartidos en tres
//   ficheros de dos paquetes, pero solo este suma al disponible.  El
//   paquete 6 sostiene que el stock lo lleva el motor, y este lo rompe.
//
// Aviso con WScript.Shell.Popup.  Sin llamadas a SQL y sin
// SaveDiagram.  Una instruccion por linea.  Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================


var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var PAQ_NOMBRE = "Paquete 7 - Reservas y Vestidor";
var DIAG_NOMBRE = "Arquitectura del Paquete 7";

var TOTAL_CMP = 24;
var TOTAL_REL = 37;
var TOTAL_CAP = 6;

var ERRORES = [];
var INFORME = [];

var MARCO_NOMBRE = "PAQUETE 7 - GESTION DE RESERVAS Y VESTIDOR";
var MARCO_X = 10;
var MARCO_Y = 10;
var MARCO_W = 1600;
var MARCO_H = 1000;
var MARCO_COLOR = 15132358;

// nombre, izquierda, arriba, ancho, alto, color
var CAPAS = [
    ["Presentacion", 30, 60, 800, 300, 13421823],
    ["Control", 30, 410, 800, 190, 13434879],
    ["Logica de Negocio", 30, 650, 800, 190, 13434828],
    ["Del Paquete 1", 890, 60, 300, 200, 16777164],
    ["Del Paquete 9", 890, 310, 300, 150, 13434828],
    ["Datos", 1250, 60, 320, 900, 16770790]
];


// ================================================================
// LOS 22 COMPONENTES   [nombre, capa, nota]
// ================================================================

var PAQ = [

    // ---------------- PRESENTACION: 8 ----------------

    ["MisReservas.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU22 Consultar y Cancelar el Estado de una Reserva | FICHERO: web/src/pages/cliente/MisReservas.tsx, 148 LINEAS: la pagina mas corta del paquete | LLAMA: una sola funcion, api.listarReservasMias, que es la ruta GET reservas/mias | ES LA LISTA DE UN CLIENTE CON SU HISTORIAL, y por eso no tiene mas que mostrar y cancelar"],

    ["NuevaReserva.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU21 Realizar Reserva de Multiples Prendas | FICHERO: web/src/pages/cliente/NuevaReserva.tsx, 681 lineas | LLAMA: una sola funcion, api.crearReserva, que es la ruta POST reservas | **ES LA MISMA ACCION QUE HACE ModalReserva, CON EL MISMO LLAMADO.** O sea que hay dos formas de crear una reserva y las dos van al mismo sitio | Y TIENE UNA VALIDACION QUE ESTA TAMBIEN EN EL SERVIDOR: la fecha no puede ser anterior a hoy, y la hora tiene que estar en formato con segundos"],

    ["ModalReserva.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU21, como la anterior | FICHERO: web/src/components/reserva/ModalReserva.tsx, 490 lineas | LLAMA: api.crearReserva, la misma llamada que la pagina anterior | **ES UN COMPONENTE, NO UNA PAGINA, Y ESTA DENTRO DE components.** El proyecto no tiene ninguna carpeta de compositionales con este patron, y por eso este componente hace la misma operacion que una pagina completa | **LO QUE SI APORTA**: es el que permite reservar una prenda SIN SALIR de la ficha de producto, que es el caso de uso de verdad. Y para eso existe"],

    ["DetalleReserva.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU22 | FICHERO: web/src/pages/cliente/DetalleReserva.tsx, 324 lineas | LLAMA: dos funciones, api.obtenerReservaDetalle y api.cancelarReserva, que son las rutas GET reservas/:id y PATCH reservas/:id/cancelar | **ES LA UNICA DE LAS CINCO PAGINAS DE RESERVA QUE PERMITE CANCELAR**, y la cancelacion es el unico paso del ciclo que puede hacer el cliente. Los otros tres los hace la tienda"],

    ["MisPruebasRa.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU24 Usar Vestidor Virtual con Realidad Aumentada | FICHERO: web/src/pages/cliente/MisPruebasRa.tsx, 146 lineas | LLAMA: una sola funcion, api.listarHistorialRa, que es la ruta GET sesiones-ra/historial | ES EL HISTORIAL DEL VESTIDOR, y deberia enseñar la foto que devuelve el reconocimiento. Y ESA FOTO NO SE PUEDE GUARDAR, porque la columna que la guardaria no existe en la base de datos"],

    ["AdminReservas.tsx", "Presentacion",
    "CAPA: Presentacion | CASOS: CU23 Notificar la Reserva a la Sucursal | FICHERO: web/src/pages/admin/AdminReservas.tsx, 465 lineas | LLAMA: cinco funciones, api.listarReservasSucursal, api.obtenerDetalleReservaSucursal, api.prepararReserva, api.confirmarRecepcionReserva y api.finalizarAtencionReserva | **ES LA MITAD ADMINISTRATIVA DE LA MAQUINA DE ESTADOS**: sus tres funciones son preparar, confirmar recepcion y finalizar, que son los tres pasos que hace la tienda. Con la pagina, las cinco pantallas cubren los cinco pasos | **Y CU23 ES EL CASO MAS DEGENERADO DEL PAQUETE**: se llama Notificar la Reserva a la Sucursal, y lo unico que hace es que la pantalla liste las reservas de esa sucursal. No notifica a nadie"],

    ["VestidorRa.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU24 | FICHERO: web/src/components/ra/VestidorRa.tsx, **1.110 LINEAS: EL FICHERO MAS LARGO DEL FRONTEND ENTERRO**, mas que Producto.tsx con 831, y mas que AdminOrdenesCompra con 794 | LLAMA: dos funciones, api.crearSesionRa y api.registrarResultadoRa, que son las rutas POST sesiones-ra y POST sesiones-ra/:id/resultado | **ES UN COMPONENTE DE REACT Y MIDE MAS QUE LAS PAGINAS.** Pinta el avatar, las medidas y la foto del resultado, y ademas gestiona el formulario de medidas | **Y ES EL QUE MAS DEPENDE DE QUE EL BACKEND FUNCIONE**: las dos rutas que llama escriben en sesiones_ra.foto_resultado, y esa columna no existe"],

    ["api.ts", "Presentacion",
    "CAPA: Presentacion | FICHERO: web/src/lib/api.ts | EL CLIENTE HTTP DEL PAQUETE | QUINCE rutas del paquete: doce de reservas y tres de sesiones-ra | **Y UNA MAS QUE ES DE OTRO PAQUETE**: Login.tsx llama a leerIntencionReserva, que esta en lib/reservas.ts y no en la API, y que guarda la prenda vista para devolver al cliente a esa pantalla cuando inicia sesion. O sea que la reserva depende del login"],

    // ---------------- CONTROL: 2 ----------------

    ["CTR_Reservas", "Control",
    "CAPA: Control | CASOS: CU21, CU22 y CU23 | FICHERO: api/src/modulos/reservas/CTR_Reservas.ts, 150 lineas | @Controller('reservas') con JwtAuthGuard | **DOCE RUTAS, Y ES EL CONTROLADOR CON MAS CICLO DE VIDA DEL PROYECTO**: cinco son de escritura y cada una es un paso, PATCH cancelar, PATCH preparar, PATCH confirmar-recepcion, PATCH finalizar y POST. Y las otras siete son de lectura, tres de ellas del lado de la sucursal: GET sucursal, GET sucursal/pendientes y GET sucursal/:id | **EL NOMBRE DE LAS RUTAS DICE LO QUE HACEN**, a diferencia de los demas paquetes, donde se llaman POST a secas. Y hay una razon: cada PATCH es un paso distinto de la maquina de estados y no se podrian distinguir | **NO HAY RUTA DE BORRADO.** Una reserva se cancela, no se borra"],

    ["CTR_SesionesRa", "Control",
    "CAPA: Control | CASO: CU24 | FICHERO: api/src/modulos/sesiones-ra/CTR_SesionesRa.ts | @Controller('sesiones-ra') con JwtAuthGuard | TRES rutas: GET historial, POST :id/resultado y POST. Y las tres tienen caso | **ES EL CONTROLADOR MAS PEQUENO DEL PAQUETE Y EL QUE MENOS DATOS TOCA, y aun asi es el que esta roto**, porque las tres rutas terminan escribiendo o leyendo una columna que no existe"],

    // ---------------- LOGICA DE NEGOCIO: 2 ----------------

    ["SRV_ReservasService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/reservas/SRV_ReservasService.ts, **1.215 LINEAS: EL FICHERO MAS LARGO DE TODO EL BACKEND**, mas que el de seguridad con 426 y mas que el de sucursales con 467 | METODOS: 17, de los cuales doce son de las doce rutas y cinco son de ayuda: unaFila, formatearFechaHora, formatearHora, formatearFecha y numeroReserva | **ES EL MODULO CON MAS TRANSACCIONES DEL PROYECTO: 5, en las lineas 726, 780, 836, 924 y 1070.** Una por cada paso de la maquina de estados. Es lo bien hecho del paquete | **LA MAQUINA DE ESTADOS TIENE CINCO ESTADOS**: Solicitada, que es el que pone el motor por defecto, luego Preparada, luego En tienda, luego Cumplida, y Cancelada desde cualquiera. Y las transiciones estan escritas con el mensaje de error de cada salto: no se puede preparar una cancelada, no se puede preparar dos veces, no se puede confirmar sin preparar, no se puede finalizar sin estar en tienda | **AQUI ESTA EL FALLO DEL PROYECTO**: liberarStockReserva, en las lineas 682 a 716, inserta un movimiento con la cantidad EN POSITIVO y despues actualiza inventario_stock a mano sumando la misma cantidad. El INSERT dispara el trigger, que ya suma, y luego la linea 708 suma otra vez | **Y ES LA UNICA ESCRITURA DIRECTA A LA COLUMNA cantidad_disponible DE TODO EL PROYECTO.** En total hay cinco UPDATE contra inventario_stock, en tres ficheros de dos paquetes, pero los otros cuatro no tocan esa columna: dos suman a cantidad_vendida, uno pone el umbral de stock_minimo_alert y los dos de este mismo servicio mueven cantidad_reservada. Los siete servicios del paquete 6 no tienen ni un UPDATE contra esa tabla, porque el motor la lleva. Este la toca, y por eso el stock se acredita dos veces | TAMBIEN CONTROLA EL USO POR SUCURSAL, con cuatro mensajes de permiso distintos segun quien pregunta y de que sucursal"],

    ["SRV_SesionesRaService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/sesiones-ra/SRV_SesionesRaService.ts, 367 lineas | METODOS: 3, para 3 rutas | **CERO TRANSACCIONES**, y aqui si es coherente: cada metodo hace una sola cosa | **Y AQUI ESTA EL OTRO FALLO, DEL TIPO ESQUEMA**: el servicio escribe y lee sesiones_ra.foto_resultado en siete sitios, la 17, la 154, la 158, la 160, la 194, la 326, la 332 y la 349, y esa columna NO EXISTE. La tabla tiene siete columnas y ninguna es la foto | **EL INSERT DE LA 158 LA NOMBRA EXPRESAMENTE**, y con un RETURNING que la pide de vuelta. O sea que falla al escribir y no en silencio | **ADEMAS TIENE UNA SEGUNDA TABLA QUE SI EXISTE Y SI SE USA**: resultados_prueba, que se escribe al registrar el resultado de un prueba y se lee con una union en el historial | **Y ES EL UNICO SERVICIO DEL PAQUETE QUE SALE DE SU PROPIO MODULO**: importa el servicio de preferencias del paquete 9, el de la inteligencia artificial. Es el unico cruce entre el paquete 7 y un paquete que no sea el 1"],

    // ---------------- DEL PAQUETE 1: 2 ----------------

    ["dependencias.ts", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/dependencias.ts, 148 lineas | LA USA LOS 2 CONTROLADORES, con la guarda a NIVEL DE CLASE, de manera que las 15 rutas quedan protegidas con dos lineas | **Y AQUI EL SERVICIO DE RESERVAS TAMBIEN COMPRUEBA PERMISOS POR SU CUENTA**, con cuatro mensajes distintos: no tienes permisos para realizar reservas, no tienes permisos para gestionar reservas, tu usuario no esta asociado a una sucursal y no tienes permisos para gestionar reservas de esta sucursal | **Y ES LA QUINTA REGLA DE PERMISOS DEL PROYECTO**: la guarda, la del paquete 2 para los roles, la del paquete 3 para sucursales, las dos del paquete 5 y estas cuatro. Ninguna se apoya en otra"],

    ["SRV_BitacoraService", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/SRV_BitacoraService.ts, 40 lineas | LA USA LOS 2 SERVICIOS | **GUARDA LA TRAZA DE LOS CAMBIOS DE ESTADO DE LA RESERVA**: cada uno de los cinco pasos deja registrado sobre que tabla se ha actuado y con que referencia, que es el numero de reserva | EN EL VESTIDOR GUARDA LAS PRUEBAS, en sesiones_ra y en resultados_prueba, con un detalle que dice si la foto se genero o no"],

    // ---------------- DEL PAQUETE 9: 1 ----------------

    ["SRV_PreferenciasService", "Del Paquete 9",
    "CAPA: Del Paquete 9 | FICHERO: api/src/modulos/recomendaciones/SRV_PreferenciasService.ts, 131 lineas | LO IMPORTA SRV_SesionesRaService, y es EL UNICO CRUCE ENTRE EL PAQUETE 7 Y UN PAQUETE QUE NO SEA EL 1** | **Y EL CRUCE TIENE SENTIDO**: al hacer una prueba con el vestidor, lo que se midio se guarda como preferencia del cliente, para que las recomendaciones tengan en cuenta la forma. O sea que el vestidor alimenta la IA | OJO: el modulo del paquete 9 se llama recomendaciones y tiene tres servicios, y este es el de preferencias, con dos metodos que registran lo que le gusta y lo que compro. No es el de puntuar"],

    // ---------------- DATOS: 7 ----------------

    ["CE_Modelos.ts (seguridad)", "Datos",
    "CAPA: Datos | FICHERO: api/src/modulos/seguridad/CE_Modelos.ts | LA USA LOS 2 CONTROLADORES Y LOS 2 SERVICIOS, o sea los 4 componentes del paquete menos el de preferencias | Y SIEMPRE PARA LO MISMO: el tipo Usuario"],

    ["reservas", "Datos",
    "CAPA: Datos | FICHERO: la tabla | DIEZ COLUMNAS, con el estado por defecto Solicitada y TRES fechas: la de creacion, la de preparada y la de atendida | **TIENE DOS CLAVES FORANEAS A usuarios, Y NO ES UN ERROR**: id_usuario es quien la hizo e id_encargado es el empleado que la preparo. Se necesitan las dos porque una reserva la pide un cliente y la trabaja un empleado, y son cosas distintas | **Y POR ESO EL INDICE ESTA MAL PUESTO**: idx_reservas_cliente esta sobre id_usuario, que es el EMPLEADO, no el cliente. La columna que se busca, id_cliente, no tiene indice, y el codigo la filtra en tres sitios | **Y NO HAY NINGUN CHECK SOBRE EL ESTADO.** Los cinco estados validos estan escritos en el codigo, en cinco sitios distintos, y ninguno esta en el esquema. Un estado mal escrito pasa y la reserva se queda sin poder avanzar ni.cancelarse"],

    ["reserva_items", "Datos",
    "CAPA: Datos | FICHERO: la tabla | CUATRO COLUMNAS, y la cantidad tiene DEFAULT 1 en vez de ser obligatoria | **SU CLAVE FORANEA A LA RESERVA ES CASCADE**, de manera que si la reserva se borrara se llevaria sus lineas. Pero como no hay ruta de borrado, esa regla nunca se ejerce | **NO TIENE UNIQUE, ASI QUE LA MISMA PRENDA PUEDE APARECER DOS VECES EN UNA RESERVA.** El servicio las recorre con un ORDER BY por el identificador, de manera que las dos filas se acreditan por separado al cerrar, y el bucle de liberarStockReserva las recorre una a una"],

    ["sesiones_ra", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **SIETE COLUMNAS, Y LE FALTA LA QUE EL CODIGO NECESITA** | TIENE id_sesion_ra, id_usuario, id_ptc, medidas_avatar, fecha, id_reserva e id_carrito | **NO TIENE foto_resultado, QUE ES LO UNICO QUE EL SERVICIO ESCRIBE.** El INSERT de la linea 158 la nombra y la pide de vuelta en el RETURNING | **Y NO HAY FORMA DE QUE CU24 FUNCIONE CONTRA EL ESQUEMA**: la tabla se crea con schema.sql, el motor no la cambia porque synchronize esta a false, y no hay migracion. La foto que devuelve el reconocimiento se pierde antes de llegar a la base de datos | ES LA TERCER COLUMNA INEXISTENTE DEL PROYECTO, y la unica cuyo fallo es al ESCRIBIR con un INSERT explicito"],

    ["resultados_prueba", "Datos",
    "CAPA: Datos | FICHERO: la tabla | CINCO COLUMNAS, y ESTA SI EXISTE Y SI SE USA | **ES LA HERMANA BUENA DE sesiones_ra**: guarda el resultado de la prueba con un VARCHAR de 20, y el servicio la escribe al registrar un resultado y la lee con una union en el historial | **LO RARO ES QUE EXISTAN LAS DOS**: el servicio guarda las medidas en sesiones_ra y el resultado en resultados_prueba, y podria haberlo hecho todo en la primera. Lo que no puede es guardar la foto, porque en ninguna de las dos hay sitio"],

    ["movimientos_inventario", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **AQUI LLEGA LA MITAD DEL ERROR, Y NO SE ENTERA** | SRV_ReservasService la escribe con un INSERT de tipo SALIDA-RESERVA, en la linea 703, y lo hace con la cantidad EN POSITIVO | **Y ESO ES JUSTO LO QUE LA CONVIERTE EN LA CULPARABLE**, porque sobre esta tabla esta el disparador trg_movimiento_inventario, y el disparador hace cantidad_disponible = cantidad_disponible + NEW.cantidad | **O SEA QUE EL CODIGO NUNCA PREGUNTO SI EL DISPARADOR YA SUMO: SIEMPRE CUENTA CON QUE NO.** El paquete 6 asumia que el motor lleva el stock y por eso sus servicios no lo tocan, y aqui el autor se cerro que si. Y el motor, que si lo lleva, tambien suma | **Y NO HAY UN CHECK QUE AVISE.** Nada en la base de datos impide que el disponible termine valiendo mas que el stock real, de manera que el error se acumula reserva a reserva sin que ninguna de las dos partes se entere"],

    ["inventario_stock", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **ESTE ES EL COMPONENTE DONDE ESTA EL FALLO DEL PAQUETE** | LOS SERVICIOS DEL PAQUETE 6 LA DICEN QUE NO LA ESCRIBEN, y es verdad: los siete no tienen ni un UPDATE. PERO ESTE PAQUETE SI, en la linea 708, y lo hace a mano | **LO QUE ESCRIBE SON DOS COLUMNAS DE LAS CUATRO QUE SON CONTADORES**: cantidad_reservada, que baja, y cantidad_disponible, que sube. La tabla tiene siete columnas en total, y las otras dos de contadores las escriben el paquete 8 y el paquete 6 | **Y LA SUMA SE HACE DOS VECES PORQUE UNA DE LAS DOS ES EL DISPARADOR**: el INSERT de la 703 suma, y la linea 708 vuelve a sumar | **Y NO HAY CHECK QUE LO PARE.** Ni aqui ni en el motor. Si el disponible llega a valer mas que el stock real, nadie lo detecta | **Y LO QUE ESTA HECHO EN EL PAQUETE 8 CON ESTA MISMA TABLA ES LO CONTRARIO, Y SIRVE DE COMPARACION**: ahi el UPDATE suma a cantidad_vendida, que es otra columna, y el movimiento lleva la cantidad en negativo. Ahi el disponible baja una sola vez. El patron es el mismo y el signo lo decide todo"],

    ["producto_imagenes", "Datos",
    "CAPA: Datos | FICHERO: la tabla | LA USA SOLO SRV_SesionesRaService, y la usa de LECTURA | **ES LA QUE RESUELVE LAS FOTOS EN EL VESTIDOR**, que necesita la imagen de la prenda para ponerla sobre el avatar | **LA LECTURA CRUZANDO PAQUETES:** la tabla es del paquete 4, el de catalogo, y este la consulta sin declarar ninguna dependencia de codigo con el modulo de productos. O sea que el acoplamiento es de datos, no de clases, y por eso el mapa de dependencias del proyecto no lo enseña"],

    ["PostgreSQL 16", "Datos",
    "CAPA: Datos | LAS CUATRO TABLAS PROPIAS SON reservas con 10 columnas, reserva_items con 4, sesiones_ra con 7 y resultados_prueba con 5 | **LO QUE SOSTIENE EL CICLO DE VIDA ES EL CODIGO, NO EL MOTOR.** Los cinco estados validos estan escritos en el servicio, en cinco sitios, y ninguno esta declarado en el esquema. La integridad de la maquina de estados depende de que las comparaciones de texto coincidan | **Y LA UNICA COSA QUE EL MOTOR APORTA AQUI ES EL DISPARADOR**, que es justamente el que hace que el stock se acredite dos veces | EL INDICE DE LA TABLA QUE MAS SE CONSULTA, la de reservas, esta sobre la columna equivocada"]
];


// ================================================================
// LAS 35 INTERFACES   [origen, destino, nombre, tipo, estereotipo]
// ================================================================

var REL = [
    ["MisReservas.tsx", "api.ts", "listarReservasMias", "Assembly", "llama"],
    ["NuevaReserva.tsx", "api.ts", "crearReserva", "Assembly", "llama"],
    ["ModalReserva.tsx", "api.ts", "crearReserva, la misma llamada", "Assembly", "llama"],
    ["DetalleReserva.tsx", "api.ts", "detalle y cancelar", "Assembly", "llama"],
    ["MisPruebasRa.tsx", "api.ts", "listarHistorialRa", "Assembly", "llama"],
    ["AdminReservas.tsx", "api.ts", "5 funciones, 3 pasos del ciclo", "Assembly", "llama"],
    ["VestidorRa.tsx", "api.ts", "crearSesionRa y registrarResultadoRa", "Assembly", "llama"],
    ["api.ts", "CTR_Reservas", "HTTP/JSON, 12 rutas", "Assembly", "expone"],
    ["api.ts", "CTR_SesionesRa", "HTTP/JSON, 3 rutas", "Assembly", "expone"],

    ["CTR_Reservas", "SRV_ReservasService", "17 metodos para 12 rutas", "Dependency", "delega"],
    ["CTR_Reservas", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_Reservas", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["CTR_SesionesRa", "SRV_SesionesRaService", "3 metodos para 3 rutas", "Dependency", "delega"],
    ["CTR_SesionesRa", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_SesionesRa", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["SRV_ReservasService", "SRV_BitacoraService", "registrar, 5 pasos del ciclo", "Dependency", "delega"],
    ["SRV_SesionesRaService", "SRV_BitacoraService", "registrar, 3 escrituras", "Dependency", "delega"],
    ["SRV_SesionesRaService", "SRV_PreferenciasService", "lo medido pasa a preferencia", "Dependency", "delega"],
    ["SRV_ReservasService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["SRV_SesionesRaService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["SRV_ReservasService", "reservas", "5 transacciones, 5 estados", "Assembly", "escribe"],
    ["SRV_ReservasService", "reserva_items", "las lineas de la reserva", "Assembly", "escribe"],
    ["SRV_ReservasService", "movimientos_inventario", "INSERT y el trigger suma", "Assembly", "acredita dos veces"],
    ["SRV_ReservasService", "inventario_stock", "UPDATE directo, L708", "Assembly", "acredita dos veces"],
    ["SRV_SesionesRaService", "sesiones_ra", "foto_resultado, que NO existe", "Assembly", "rompe"],
    ["SRV_SesionesRaService", "resultados_prueba", "el resultado, que si existe", "Assembly", "escribe"],
    ["SRV_SesionesRaService", "producto_imagenes", "resuelve la foto de la prenda", "Dependency", "consulta"],

    ["SRV_ReservasService", "PostgreSQL 16", "5 transacciones, 1.215 lineas", "Assembly", "consulta"],
    ["SRV_SesionesRaService", "PostgreSQL 16", "cero transacciones, 367 lineas", "Assembly", "consulta"],
    ["CE_Modelos.ts (seguridad)", "PostgreSQL 16", "solo el tipo Usuario", "Assembly", "mapea"],
    ["reservas", "PostgreSQL 16", "el indice esta en id_usuario, no en id_cliente", "Assembly", "apunta"],
    ["reserva_items", "PostgreSQL 16", "sin UNIQUE, la prenda puede repetirse", "Assembly", "apunta"],
    ["sesiones_ra", "PostgreSQL 16", "7 columnas, falta foto_resultado", "Assembly", "apunta"],
    ["resultados_prueba", "PostgreSQL 16", "5 columnas, y esta si existe", "Assembly", "apunta"],
    ["movimientos_inventario", "PostgreSQL 16", "el disparador suma aqui", "Assembly", "apunta"],
    ["inventario_stock", "PostgreSQL 16", "el disparador suma y despues el codigo", "Assembly", "apunta"],
    ["producto_imagenes", "PostgreSQL 16", "las fotos de la prenda", "Assembly", "apunta"]
];


// ================================================================
// DONDE CAE CADA COMPONENTE   [nombre, izquierda, arriba, ancho, alto]
// ================================================================

var DOND = [
    ["MisReservas.tsx", 55, 100, 175, 85],
    ["NuevaReserva.tsx", 245, 100, 175, 85],
    ["DetalleReserva.tsx", 435, 100, 175, 85],
    ["MisPruebasRa.tsx", 625, 100, 175, 85],
    ["AdminReservas.tsx", 55, 200, 175, 85],
    ["ModalReserva.tsx", 245, 200, 175, 85],
    ["VestidorRa.tsx", 435, 200, 175, 85],
    ["api.ts", 625, 200, 175, 85],

    ["CTR_Reservas", 55, 450, 350, 110],
    ["CTR_SesionesRa", 435, 450, 350, 110],

    ["SRV_ReservasService", 55, 690, 350, 110],
    ["SRV_SesionesRaService", 435, 690, 350, 110],

    ["dependencias.ts", 915, 100, 250, 70],
    ["SRV_BitacoraService", 915, 180, 250, 70],

    ["SRV_PreferenciasService", 915, 350, 250, 80],

    ["CE_Modelos.ts (seguridad)", 1275, 100, 270, 85],
    ["reservas", 1275, 195, 270, 85],
    ["reserva_items", 1275, 290, 270, 85],
    ["sesiones_ra", 1275, 385, 270, 85],
    ["resultados_prueba", 1275, 480, 270, 85],
    ["movimientos_inventario", 1275, 575, 270, 85],
    ["inventario_stock", 1275, 670, 270, 85],
    ["producto_imagenes", 1275, 765, 270, 85],
    ["PostgreSQL 16", 1275, 860, 270, 85]
];


function aviso(txt) {
    try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup(txt, 0, "Paquete 7 - Reservas y Vestidor", 64);
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
    N.push("ARQUITECTURA DEL PAQUETE 7 - INFORME DE EJECUCION");
    N.push("Paquete 7: Gestion de Reservas y Vestidor. Casos CU21, CU22, CU23 y CU24.");
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
    N.push("  deben ser 31 objetos con tamano: 24 componentes + 7 marcos.");
    N.push("");
    N.push("EL REPARTO DE LOS 24 COMPONENTES");
    N.push("  Presentacion        8   5 paginas, 2 componentes y el cliente HTTP");
    N.push("  Control             2   uno por cada modulo de NestJS");
    N.push("  Logica de Negocio  2   uno por cada modulo de NestJS");
    N.push("  Del Paquete 1       2   las guardas y la bitacora");
    N.push("  Del Paquete 9       1   el servicio de preferencias, de la IA");
    N.push("  Datos               9   5 tablas del paquete, el stock y el motor");
    N.push("");
    N.push("EL REPARTO DE LAS 37 INTERFACES");
    N.push("  pantalla -> cliente HTTP       7   una por pantalla o componente");
    N.push("  cliente -> control             2   las 15 rutas, en dos bloques");
    N.push("  importaciones de codigo       11   los statements import");
    N.push("  hacia las tablas               7   las que escriben y las que leen");
    N.push("  hacia PostgreSQL 16           10   2 servicios y 8 entidades");
    N.push("");
    N.push("EL FALLO MAS GRAVE DEL PROYECTO: EL STOCK SE ACREDITA DOS VECES");
    N.push("");
    N.push("  El metodo liberarStockReserva, lineas 682 a 716, hace dos");
    N.push("  cosas por cada prenda de la reserva:");
    N.push("");
    N.push("    L703  INSERT INTO movimientos_inventario");
    N.push("          VALUES (..., 'SALIDA-RESERVA', $3, ...)   con la");
    N.push("                                                cantidad EN POSITIVO");
    N.push("    L708  UPDATE inventario_stock");
    N.push("          SET cantidad_reservada = GREATEST(0, cantidad_reservada - $3),");
    N.push("              cantidad_disponible = cantidad_disponible + $3");
    N.push("");
    N.push("  EL INSERT SALTA trg_movimiento_inventario, Y EL DISPARADOR HACE");
    N.push("  cantidad_disponible = cantidad_disponible + NEW.cantidad.  Como la");
    N.push("  cantidad va en POSITIVO, EL DISPARADOR ACREDITA.  Y DESPUES LA");
    N.push("  LINEA 708 ACREDITA OTRA VEZ, A MANO.");
    N.push("");
    N.push("  O SEA QUE CADA PRENDA DE CADA RESERVA CERRADA SUMA EL DOBLE AL");
    N.push("  STOCK DISPONIBLE DE ESA TIENDA.  Y por eso el numero que ve el");
    N.push("  cliente y el que tiene el motor dejan de ser el mismo.");
    N.push("");
    N.push("  Y HAY UNA SEGUNDA CONSECUENCIA, Y ES DE ARQUITECTURA: la linea");
    N.push("  708 ES LA UNICA ESCRITURA DIRECTA A LA COLUMNA cantidad_disponible");
    N.push("  DE TODO EL PROYECTO.  En total hay cinco UPDATE contra");
    N.push("  inventario_stock, en tres ficheros de dos paquetes, pero los otros");
    N.push("  cuatro no tocan esa columna.  El paquete 6 sostiene, con razon, que");
    N.push("  el stock lo lleva el motor y que sus siete servicios no tocan esa");
    N.push("  tabla.  Este la toca, y por eso la regla se rompe aqui y no alla.");
    N.push("");
    N.push("  LOS DOS CONECTORES MARCADO CON 'acredita dos veces' SON ESE");
    N.push("  MISMO ERROR VISTO POR LOS DOS EXTREMOS: el del INSERT, que no lo");
    N.push("  sabe, y el del UPDATE, que si lo hace a proposito.");
    N.push("");
    N.push("EL SEGUNDO FALLO, DEL TIPO ESQUEMA: LA FOTO DEL VESTIDOR");
    N.push("");
    N.push("  sesiones_ra tiene 7 COLUMNAS: id_sesion_ra, id_usuario, id_ptc,");
    N.push("  medidas_avatar, fecha, id_reserva e id_carrito.");
    N.push("");
    N.push("  Y EL CODIGO USA UNA QUE NO ESTA: foto_resultado, en ocho sitios,");
    N.push("  la 17, la 154, la 158, la 160, la 194, la 326, la 332 y la 349.");
    N.push("");
    N.push("  EL INSERT DE LA 158 LA NOMBRA EXPRESAMENTE, y con un RETURNING");
    N.push("  que la pide de vuelta.  O sea que falla AL ESCRIBIR, no en");
    N.push("  silencio.  Y CU24 NO PUEDE FUNCIONAR contra el esquema: la tabla");
    N.push("  se crea con schema.sql, synchronize esta a false y no hay");
    N.push("  migracion.  La foto se pierde antes de llegar a la base de datos.");
    N.push("");
    N.push("  OJO CON EL ALCANCE: token_invitado, que aparece en 44 sitios del");
    N.push("  proyecto, NO es de este paquete.  Es de carritos, y es del paquete");
    N.push("  8.  Aqui la unica columna inexistente es foto_resultado.");
    N.push("");
    N.push("LO QUE ESTA BIEN, Y SON TRES COSAS CONCRETAS");
    N.push("");
    N.push("  LAS CINCO TRANSACCIONES, UNA POR PASO DEL CICLO DE VIDA. Lines");
    N.push("  726, 780, 836, 924 y 1070.  Es el modulo con mas transacciones");
    N.push("  del proyecto, y cada transaccion es un estado distinto.  Lo que se");
    N.push("  puede perder es una reserva a medio hacer, nunca un descuadre.");
    N.push("");
    N.push("  LA MAQUINA DE ESTADOS ESTA ESCRITA CON SUS MENSAJES.  Cada");
    N.push("  transicion tiene su propio error: no se puede preparar una");
    N.push("  cancelada, no se puede preparar dos veces, no se puede confirmar");
    N.push("  sin preparar, no se puede finalizar sin estar en tienda, y una");
    N.push("  reserva vigente no se puede cancelar.  Son cinco reglas de");
    N.push("  negocio comprobadas, que es lo que un caso de uso deberia traer.");
    N.push("");
    N.push("  EL CONTROL DE USO POR SUCURSAL, CON CUATRO MENSAJES.  Distingue");
    N.push("  entre no tener permiso para reservar, no tenerlo para gestionar,");
    N.push("  no estar asociado a una sucursal y no poder gestionar las");
    N.push("  reservas de ESE sitio.  Y las dos claves foraneas a usuarios lo");
    N.push("  hacen posible: id_usuario es quien la pide e id_encargado es el");
    N.push("  empleado que la prepara.  No es un error de duplicado.");
    N.push("");
    N.push("LO QUE NO ESTA BIEN, Y TAMBIEN SE VE");
    N.push("");
    N.push("  LOS CINCO ESTADOS NO ESTAN EN EL ESQUEMA.  El estado es un");
    N.push("  VARCHAR de 20 sin CHECK, y los cinco valores validos estan");
    N.push("  escritos en el codigo, en cinco sitios distintos.  Un estado mal");
    N.push("  escrito pasa, y una reserva con estado raro no se puede avanzar");
    N.push("  ni cancelar.");
    N.push("");
    N.push("  EL INDICE DE LA TABLA MAS CONSULTADA ESTA MAL PUESTO.");
    N.push("  idx_reservas_cliente esta sobre id_usuario, que es el EMPLEADO.");
    N.push("  La columna que el codigo filtra, id_cliente, no tiene indice, y");
    N.push("  el nombre del indice dice lo contrario de lo que hace.");
    N.push("");
    N.push("  reserva_items NO TIENE UNIQUE, de manera que la misma prenda");
    N.push("  puede aparecer dos veces en la misma reserva, y al cerrar se");
    N.push("  acreditan por separado.  Con el fallo del doble, eso duplica");
    N.push("  todavia mas.");
    N.push("");
    N.push("  CU23 NO HACE LO QUE DICE.  El caso se llama Notificar la Reserva");
    N.push("  a la Sucursal, y lo unico que hay es una pantalla que lista");
    N.push("  las reservas de la tienda.  No notifica a nadie, y la tabla de");
    N.push("  avisos de reserva no existe.");
    N.push("");
    N.push("  HAY DOS FORMAS DE CREAR UNA RESERVA, LAS DOS EN LLAMADA AL");
    N.push("  MISMO SITIO.  NuevaReserva.tsx, que es una pagina, y");
    N.push("  ModalReserva.tsx, que es un componente.  Las dos llaman a");
    N.push("  api.crearReserva.  Y hay un tercer sitio implicado: Login.tsx");
    N.push("  guarda la prenda vista para devolver al cliente.");
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
    U.push("PAQUETE 7 - Gestion de Reservas y Vestidor");
    U.push("CU21, CU22, CU23 y CU24   ·   2 modulos de NestJS");
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
    U.push("  con tamano: " + conTam + "   (deben ser 31)");
    U.push("  lineas:     " + nLin);
    U.push("");
    U.push("FALLO 1: el stock se acredita dos veces.");
    U.push("  El INSERT con cantidad positiva dispara el trigger, que");
    U.push("  suma, y la linea 708 vuelve a sumar a mano.");
    U.push("");
    U.push("FALLO 2: sesiones_ra.foto_resultado no existe,");
    U.push("  y el INSERT la nombra. CU24 no funciona.");
    U.push("");
    if (conTam < 31) U.push("AVISO: menos de 31 con tamano. Copia este texto y pegamelo.");
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
