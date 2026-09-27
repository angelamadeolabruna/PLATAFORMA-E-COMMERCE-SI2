// ================================================================
// DISENO DE CASO DE USO - DIAGRAMA DE SECUENCIA
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 3.3.2.1 del documento
//
// CASO DE USO
//   CU17  Registrar Recepcion Fisica de Prendas (Ingreso a Inventario)
//
// AVISO DE NUMERACION, QUE HAY QUE DECIR ANTES QUE NADA
//   El proyecto numera este caso de dos formas distintas, y las dos estan
//   escritas en el codigo:
//
//     la del documento, que es la de este trabajo:  CU17
//     la del propio proyecto:                       CU22
//
//   Y la del proyecto es coherente en tres sitios independientes:
//
//     web/src/data/adminMenu.ts L158-163
//        ruta: '/admin/recepciones',
//        etiqueta: 'Recepcion de Mercaderia',
//        cu: 'CU22',
//        permiso: 'gestionar_inventario',
//        icono: PackagePlus,
//        implementado: false          <-- el codigo lo dice
//
//     BASE DE DATOS/schema.sql L809
//        -- 6. PROCEDIMIENTO: Recepcion de mercaderia (CU22)
//     BASE DE DATOS/schema.sql L300
//        -- 7. INVENTARIO [con raya] CU22-CU26
//
//   Y la prueba de que CU22 nunca se escribio esta en api.ts: sus
//   comentarios de seccion van CU21 y despues CU23. El 22 no esta.
//
//   Las dos series se separan a partir de CU12. En la del documento,
//   CU12 es el catalogo publico; en la del codigo, CU12 es la pantalla de
//   sucursales. Y ordenes-compra es CU16 en el documento y CU21 en el
//   codigo. Este diagrama usa la del documento, CU17, y dice CU22 donde
//   toca, para que se puedan cruzar las dos.
//
// QUE SE DIBUJA Y DE DONDE SALE
//   No sale de la descripcion del caso de uso: sale del codigo.
//
//     web/src/data/adminMenu.ts                   L154-164
//     web/src/components/layout/admin/AdminLayout.tsx  L69-72
//     web/src/router.tsx                          L65-84
//     web/src/pages/admin/AdminPlaceholder.tsx    24 lineas
//     web/src/pages/EnConstruccion.tsx             32 lineas
//     web/src/pages/admin/AdminAjustes.tsx         462 lineas
//     web/src/lib/api.ts                          2105 lineas
//     api/src/modulos/seguridad/dependencias.ts   L15-65
//     api/src/modulos/inventario/CTR_Ajustes.ts   L15-71
//     api/src/modulos/inventario/SRV_AjustesService.ts L186-270
//     api/src/modulos/proveedores/SRV_ProveedoresService.ts L350-408
//     BASE DE DATOS/schema.sql                    L302-338, L421-434,
//                                                 L628-657, L811-843
//
// EL CASO NO ESTA IMPLEMENTADO. Y ESTO ES LO QUE DIBUJA EL DIAGRAMA
//   El boton esta, la base de datos esta entera, y en TypeScript no hay
//   ni una linea. Concretamente:
//
//     el menu tiene la entrada, con implementado: false        L158-163
//     el campo implementado se DECLARA y se ASIGNA 26 veces,
//       21 en adminMenu y 5 en clienteMenu, y no se LEE en ningun sitio
//     el router no tiene la ruta /admin/recepciones              L65-84
//     la ruta cae en el comodin, que es AdminPlaceholder        L84
//     AdminPlaceholder busca la etiqueta y pinta EnConstruccion  L9-15, sobre 20 items
//     y lo que sale es, textualmente, EnConstruccion L24:
//       'Esta seccion aun no esta implementada. Pronto estara disponible.'
//     en el backend no hay ningun CTR de recepciones
//     inventario.module.ts L17 declara 4 controladores:
//       Kardex, Ajustes, Alertas, Existencias. Ninguno de recepciones.
//     api.ts, 2105 lineas, su unico metodo con recepcion es el de las reservas
//
//   39 mensajes. 10 lineas de vida. 8 hallazgos.
//   15 van a la base de datos, y de esos 6 son consultas reales desde
//   otro objeto y 9 son pasos internos del propio PostgreSQL.
//   22 son mensajes a si mismo, 2 son retornos, 4 llevan la guarda
//   escrita entre corchetes y 10 tocan al actor.
//   1 fragmento, y es un loop, no un alt. Explicado mas abajo.
//
// LOS FRAGMENTOS: UN loop Y NINGUN alt
//   Contado antes de escribir, con contadores, en las tres partes del caso:
//
//     AdminPlaceholder.tsx, 24 lineas
//        for 1   if 1   while 0   map 0
//     EnConstruccion.tsx, 32 lineas
//        for 0   if 0   ternarios 2
//     SRV_AjustesService.registrar, L186-270
//        for 0   if 5   while 0   ternarios 19   dataSource.query 4
//     sp_registrar_recepcion, schema L811-843
//        FOR 1   (el unico bucle real del caso, y esta en SQL)
//
//   El LOOP que se dibuja es el del procedimiento, L827-838:
//
//     FOR item IN SELECT * FROM jsonb_array_elements(p_items)
//     LOOP
//         v_id_ptc    := (item->>'id_ptc')::INTEGER;
//         v_recibida  := (item->>'cantidad_recibida')::INTEGER;
//         INSERT INTO recepcion_items ...;
//         INSERT INTO movimientos_inventario ...;
//     END LOOP;
//
//   Una vuelta por prenda recibida, con dos escrituras en cada vuelta. Es
//   un bucle de verdad, y es el que tendria el caso si estuviera escrito.
//   Se dibuja sobre PostgreSQL, en la parte de abajo del diagrama.
//
//   NO HAY NINGUN alt, y hay que decirlo en vez de inventar uno:
//
//   - El for de AdminPlaceholder L10 busca una etiqueta en una lista de 16
//        entradas, y el if de L11 es un break. Eso no es una rama del caso
//     de uso, es una busqueda.
//   - Los 5 if de SRV_AjustesService.registrar son guardas con una salida
//     cada una: permiso, cantidad no entera, motivo corto, producto que no
//     existe, stock insuficiente. Ninguno tiene dos caminos de verdad.
//   - Los 19 ternarios de ese mismo metodo son de valores, no de control.
//
//   Y las barras de activacion, que no son un extra: dos, la del
//   controlador de ajustes y la del servicio, que son las unicas dos lineas
//   de vida con codigo propio de este caso.
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
var TOTAL_MSG = 39;
var TOTAL_HAL = 8;

var RAIZ_NOMBRE = "Diseno Logico";
var PAQ_NOMBRE = "CU17 Secuencia Recepcion Fisica Prendas";
var DIAG_NOMBRE = "CU17 Recepcion Fisica Prendas Ingreso Inventario";
var DIAG_TIPO = "Sequence";

var X0 = 160;
var PASO = 215;
var ANCHO_CAB = 150;
var Y_CAB = 130;
var ALTO_CAB = 48;
var Y_MSG0 = 250;
var PASO_MSG = 152;

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
    ["U", "ACTOR_Administrador", "Actor", "Lifeline", "Administrador", "quien recepciona", "Actor, no clase: es quien pulsa", "no es codigo, es la persona"],
    ["M", "adminMenu.ts", "Object", "Lifeline", "adminMenu", "CU22, implementado false", "Boundary", "web/src/data/adminMenu.ts, L154-164, 255 lineas"],
    ["P", "AdminPlaceholder.tsx", "Object", "Lifeline", "AdminPlaceholder", "24 lineas", "Boundary", "web/src/pages/admin/AdminPlaceholder.tsx, 24 lineas"],
    ["E", "EnConstruccion.tsx", "Object", "Lifeline", "EnConstruccion", "32 lineas", "Boundary", "web/src/pages/EnConstruccion.tsx, 32 lineas"],
    ["H", "api.ts", "Object", "Lifeline", "api", "CU20, CU21, CU23, CU24: falta el 22", "Boundary", "web/src/lib/api.ts, 2105 lineas; su unico metodo con recepcion es el de las reservas, L1740"],
    ["G", "JwtAuthGuard", "Object", "Lifeline", "JwtAuthGuard", "guard de la ruta", "Control", "api/src/modulos/seguridad/dependencias.ts, L15-65"],
    ["F", "AdminAjustes.tsx", "Object", "Lifeline", "AdminAjustes", "462 lineas, el sustituto", "Boundary", "web/src/pages/admin/AdminAjustes.tsx, 462 lineas"],
    ["C", "CTR_Ajustes", "Object", "Lifeline", "AjustesController", "POST inventario/ajustes", "Control", "api/src/modulos/inventario/CTR_Ajustes.ts, L15-71"],
    ["S", "SRV_AjustesService", "Object", "Lifeline", "AjustesService", "L186-270, 85 lineas", "Control", "api/src/modulos/inventario/SRV_AjustesService.ts, L186-270"],
    ["D", "PostgreSQL", "Object", "Lifeline", "PostgreSQL", "6 tablas y el trigger", "Entity", "schema.sql: recepciones L313, recepcion_items L322, inventario_stock L302, movimientos_inventario L421, ordenes_compra L277, productos"]
];

// Los 39 mensajes. numero, desde, hasta, texto, tipo de flecha.
// S = sincrona, punta cerrada. A = asincrona, de retorno, punta abierta.
var MSG = [
    [1, "U", "M", "1. entra al menu de inventario.   AdminLayout L69-72 filtra por 'gestionar_inventario' o por el asterisco   El seed L573 no siembra ese permiso, asi que solo lo ve el Administrador", "S"],
    [2, "M", "M", "2. la entrada de recepciones, L157-164: ruta '/admin/recepciones', etiqueta 'Recepcion de Mercaderia', cu 'CU22', permiso 'gestionar_inventario', icono PackagePlus", "S"],
    [3, "M", "M", "3. y una linea mas abajo, L163: implementado: false   El propio menu declara que esta pantalla no existe   Y el campo implementado NO SE LEE EN NINGUN SITIO: se declara en L31 y se asigna 26 veces: 21 aqui y 5 en clienteMenu.ts", "S"],
    [4, "U", "M", "4. pulsa la entrada.   En el menu, la etiqueta CU22 se pinta al lado, AdminLayout L119-120 y L215, asi que el usuario ve el numero del caso junto a un boton que no lleva a ningun sitio", "S"],
    [5, "M", "P", "5. y aqui se acaba el caso de uso.   El router no tiene la ruta, L65-84, y el comodin de L84 la manda a AdminPlaceholder", "S"],
    [6, "P", "P", "6. AdminPlaceholder, 24 lineas enteras, y su unico trabajo es poner un titulo: un for sobre PAQUETES_ADMIN, L9, un find por ruta, L10, un if con break, L11-13, y un return", "S"],
    [7, "P", "E", "7. <EnConstruccion titulo='Recepcion de Mercaderia' volverA='/admin/auditoria' volverEtiqueta='Ir a la bitacora de auditoria' />   L18-22", "S"],
    [8, "E", "E", "8. y lo que se pinta, L24, es exactamente: 'Esta seccion aun no esta implementada. Pronto estara disponible.'   Con un icono de Construction, L19, y un boton que vuelve a la auditoria", "S"],
    [9, "E", "U", "9. el administrador lee 'Recepcion de Mercaderia' y debajo 'Esta seccion aun no esta implementada'.   Le offering un boton, un icono de obra y una fecha que no existe", "A"],
    [10, "U", "H", "10. y la pregunta siguiente es si al menos hay una llamada.   api.ts tiene 2105 lineas", "S"],
    [11, "H", "H", "11. buscar 'recepcion' en api.ts da 3 lineas: L416 fecha_recepcion, que es un tipo de la orden; y L1740-1741 confirmarRecepcionReserva, que SI es un metodo, pero es la recepcion del cliente en el vestidor, no de la mercaderia", "S"],
    [12, "H", "H", "12. y los comentarios de seccion de api.ts lo dicen solos: van CU21, CU21, y despues CU23.   El CU22 no esta.   Es la misma serie que el menu y que el esquema", "S"],
    [13, "U", "G", "13. en el backend tampoco.   inventario.module.ts L17 declara cuatro controladores: KardexController, AjustesController, AlertasController, ExistenciasController.   No hay ninguno de recepciones, y no hay ningun JwtAuthGuard que proteja una ruta que no existe", "S"],
    [14, "U", "D", "14. PERO LA BASE DE DATOS SI ESTA HECHA, Y ENTERA.   Esto es lo que falta.   schema.sql L313-319: recepciones, con 6 columnas, id_recepcion, id_orden_compra, id_sucursal, id_usuario, fecha_recepcion, estado", "S"],
    [15, "D", "D", "15. y L322-328: recepcion_items, con 6 columnas, y con ON DELETE CASCADE en L324 para que las lineas se borren solas con la recepcion   Las dos tablas son correctas y estan bien hechas", "S"],
    [16, "D", "D", "16. y sobre todo, L811-843: sp_registrar_recepcion, con sus 5 parametros, un OUT, y el cuerpo entero.   El comentario de L809 lo titula '6. PROCEDIMIENTO: Recepcion de mercaderia (CU22)'", "S"],
    [17, "D", "D", "17. su L823-825 inserta la cabecera en recepciones con estado 'Registrada' y devuelve el id por el OUT   L827 es el bucle, y es real: FOR item IN SELECT * FROM jsonb_array_elements(p_items)", "S"],
    [18, "D", "D", "18. cuerpo del bucle, L829-837: saca id_ptc y cantidad_recibida del JSON, mete una fila en recepcion_items, y mete un movimiento en movimientos_inventario con tipo 'Recepcion' y la referencia 'Orden #' + p_id_orden   dos escrituras por prenda", "S"],
    [19, "D", "D", "19. y al final, L840-841, la linea que arregla CU16 entero: UPDATE ordenes_compra SET estado = 'Recibida', fecha_recepcion = NOW() WHERE id_orden_compra = p_id_orden", "S"],
    [20, "D", "D", "20. [nadie la llama] cero llamadas a sp_ o a fn_ en los 24 modulos y en las 40 paginas.   De las 8 funciones del esquema, 4 son sp_ y ninguna se invoca", "S"],
    [21, "U", "D", "21. y ademas, aunque se llamara, no serviria del todo.   L832-833 mete 4 de las 6 columnas de recepcion_items: id_recepcion, id_ptc, cantidad_recibida y diferencia", "S"],
    [22, "D", "D", "22. cantidad_pedida NO se rellena, y diferencia es un 0 de L833, literal   O sea que la diferencia entre lo pedido y lo recibido, que es justo para lo que existe una recepcion, no se puede registrar ni aunque la funcion se llamara", "S"],
    [23, "U", "D", "23. y el L836-837, el INSERT de movimientos_inventario, SI pone id_orden_compra.   Es el unico sitio de todo el proyecto que lo hace, y es codigo que no se ejecuta.   Los 5 INSERT que si atan su movimiento lo hacen con id_venta o con id_reserva, en 5 de 6", "S"],
    [24, "U", "U", "24. o sea que el hueco es de una sola llamada.   Con SELECT sp_registrar_recepcion( ... ) en el sitio de la llamada, esta pantalla entera, el estado Recibida, el score de proveedor y la trazabilidad del movimiento salen.   Sin ella, CU16 tiene un 409 muerto, que es el hallazgo 4 de CU16", "S"],
    [25, "F", "F", "25. mientras tanto, la mercaderia entra al inventario por Ajustes y Mermas, que es OTRO caso de uso, el CU24 del proyecto.   El formulario pide id_ptc, id_sucursal, tipo, cantidad y motivo   El @IsIn de L23 del CTR es una lista blanca real, con 3 valores", "S"],
    [26, "F", "H", "26. POST /api/v1/admin/inventario/ajustes con { id_ptc, id_sucursal, tipo: 'AJUSTE', cantidad, motivo }   La pantalla manda tipo 'MERMA' o 'AJUSTE' y el servicio lo normaliza", "S"],
    [27, "H", "G", "27. con Authorization Bearer.   Esta ruta SI existe, y si la protege JwtAuthGuard de verdad", "S"],
    [28, "G", "D", "28. SELECT usuarios WHERE id_usuario = :sub   L44.   Una consulta por peticion, en el guard", "S"],
    [29, "G", "G", "29. [estado != 'activo'] 401 'Tu cuenta esta deshabilitada.'   L49-51", "S"],
    [30, "G", "C", "30. el guard pasa.   El permiso lo comprueba el servicio, no el guard: L69 pide '*' o 'gestionar_inventario'", "S"],
    [31, "C", "S", "31. registrar( currentUser, dto, request )   L69-70.   El controlador convierte el tipo, L64: si no es MERMA lo deja en AJUSTE, y se le pasa el resultado sin await", "S"],
    [32, "S", "S", "32. [sin permiso] 403   L69, y [cantidad no entera o 0] 422 'La cantidad debe ser un numero entero distinto de 0.'   L195-197", "S"],
    [33, "S", "S", "33. y aqui esta el signo de la mercaderia, que es lo unico que se parece a una recepcion: cantidadAplicada = tipo === 'MERMA' ? -Math.abs(cantidad) : cantidad   L198   Una merma al reves, y con eso el stock sube", "S"],
    [34, "S", "D", "34. SELECT id_ptc FROM producto_talla_color WHERE id_ptc = $1   L208, y SELECT cantidad_disponible FROM inventario_stock   L216   Consulta 2 y 3 de 5", "S"],
    [35, "S", "S", "35. [se resta mas de lo que hay] 422 'Stock insuficiente para el ajuste.'   L222-224   Esta comprobacion es la buena del proyecto, y la hace antes de escribir", "S"],
    [36, "S", "D", "36. INSERT INTO movimientos_inventario ( id_ptc, id_sucursal, tipo_movimiento, cantidad, referencia, id_usuario ) VALUES ( $1, $2, $3, $4, $5, $6 ) RETURNING id_movimiento, stock_anterior, stock_posterior   L231-234   Seis columnas de trece, y id_orden_compra NO esta", "S"],
    [37, "D", "D", "37. y aqui salta el trigger, que es lo unico que hace que esto funcione: trg_movimiento_inventario, BEFORE INSERT ON movimientos_inventario, L654-657   Por eso el RETURNING de L233 puede traer stock_anterior y stock_posterior", "S"],
    [38, "D", "D", "38. el trigger es fn_aplicar_movimiento_inventario, L628-652, y hace el upsert de inventario_stock: INSERT ... ON CONFLICT (id_ptc, id_sucursal) DO UPDATE SET cantidad_disponible = inventario_stock.cantidad_disponible + NEW.cantidad   L645-648", "S"],
    [39, "U", "U", "39. la mercaderia entra al inventario.   Como un ajuste suelto: sin orden de compra, sin proveedor, sin cantidad pedida y sin diferencia.   Y el movimiento queda sin id_orden_compra, que es la columna por la que CU15 y el score de proveedor lo buscan   A", "A"]
];

// Los ocho hallazgos, a la derecha del diagrama.
var HAL = [
    ["1. El caso no existe, y el propio menu lo declara", [
        "Este es el hallazgo de fondo, y no hace falta buscarlo: esta escrito.",
        "",
        "adminMenu.ts, L157-164, la entrada entera:",
        "",
        "  {",
        "    ruta: '/admin/recepciones',",
        "    etiqueta: 'Recepcion de Mercaderia',",
        "    cu: 'CU22',",
        "    permiso: 'gestionar_inventario',",
        "    icono: PackagePlus,",
        "    implementado: false,",
        "  },",
        "",
        "implementado: false. El autor lo puso, y luego no lo uso.",
        "",
        "EL CAMPO 'implementado':",
        "",
        "  se DECLARA en la interfaz, L31:  implementado: boolean;",
        "  se ASIGNA 26 veces: 21 en adminMenu.ts y 5 en clienteMenu.ts",
        "  se LEE en 0 sitios del proyecto",
        "",
        "O sea que hay un interruptor de 'esto funciona o no' en los datos",
        "del menu, con el valor puesto en false para esta entrada, y ningun",
        "componente lo consulta. AdminLayout L119-120 y L215 pintan item.cu",
        "para enseyar el numero del caso, pero no pintan implementado. Asi que",
        "en pantalla el boton se ve exactamente igual que uno que funciona.",
        "",
        "LO QUE PASA AL PULSARLO, paso a paso y con lineas:",
        "",
        "  1  el menu enlaza a /admin/recepciones        L158",
        "  2  el router no declara esa ruta              L65-84",
        "  3  el comodin de L84 la captura",
        "  4  AdminPlaceholder, 24 lineas, L5-24",
        "  5  busca la etiqueta con un for, L9, un find por ruta, L10,",
        "     y un if con break, L11-13",
        "  6  pinta <EnConstruccion titulo=... />        L18-22",
        "  7  y se lee, L24, exactamente:",
        "       'Esta seccion aun no esta implementada. Pronto estara",
        "        disponible.'",
        "",
        "O sea que el boton, el icono de PackagePlus, el numero CU22 y el",
        "titulo 'Recepcion de Mercaderia' existen. Lo unico que no existe es",
        "la recepcion.",
        "",
        "Y hay que reconocer que el texto es honesto. No dice 'vacio' ni",
        "'proximamente en la beta'. Dice 'aun no esta implementada', que es",
        "exactamente verdad. Y EnConstruccion, 32 lineas, es un componente",
        "reutilizable, bien hecho, con su icono, su titulo y su boton de",
        "vuelta. La parte de 'todavia no' esta hecha. La parte de 'implementada'",
        "no."
    ]],
    ["2. La numeracion del proyecto y la del documento son dos series", [
        "Esto hay que decirlo antes que cualquier hallazgo, porque el",
        "numero de este caso sale de dos sitios a la vez.",
        "",
        "LA DEL DOCUMENTO, que es la de este trabajo: CU17.",
        "LA DEL PROYECTO, que esta escrita en tres ficheros independientes:",
        "CU22.",
        "",
        "LOS TRES SITIOS DEL PROYECTO, y coinciden:",
        "",
        "  web/src/data/adminMenu.ts L160",
        "     cu: 'CU22',",
        "  BASE DE DATOS/schema.sql L809",
        "     -- 6. PROCEDIMIENTO: Recepcion de mercaderia (CU22)",
        "  BASE DE DATOS/schema.sql L300",
        "     -- 7. INVENTARIO [con raya] CU22-CU26",
        "",
        "Y LA PRUEBA DE QUE CU22 NUNCA SE ESCRIBIO esta en api.ts, en los",
        "comentarios que encabezan cada seccion:",
        "",
        "  L1523   // CU21 - Ordenes de compra",
        "  L1564   // CU23 - Kardex dinamico",
        "",
        "El 22 no esta entre los dos. O sea que la serie del cliente salta del",
        "CU21 (L1523) al CU23 (L1564), y el hueco es exactamente este caso.",
        "",
        "Y UNA MATIZ QUE HAY QUE PONER, porque sin ella la afirmacion es falsa:",
        "api.ts SI tiene un metodo con la palabra recepcion en el nombre,",
        "confirmarRecepcionReserva, L1740-1741. Pero es la recepcion del cliente",
        "en el vestidor, que es CU31 del proyecto, y va a /reservas. Para la",
        "mercaderia que entra del proveedor no hay nada. Y fecha_recepcion, L416,",
        "es un tipo de la orden de compra, no una llamada.",
        "",
        "DONDE SE SEPARAN LAS DOS SERIES, a partir de CU12:",
        "",
        "  CU12   documento: catalogo publico     codigo: pantalla de sucursales",
        "  CU14   documento: alta de proveedor     codigo: tallas y colores",
        "  CU16   documento: orden de compra      codigo: catalogo publico",
        "  CU17   documento: recepcion (este)     codigo: kardex por producto",
        "  CU18   documento: estado de proveedor  codigo: proveedores",
        "",
        "Asi que el orden de compra es CU16 en el documento y CU21 en el",
        "codigo, y la recepcion es CU17 en el documento y CU22 en el codigo.",
        "Lo que explica por que el diagrama de CU16 que ya esta entregado",
        "titula los mensajes con L21 del codigo para el endpoint de ordenes",
        "de compra, y este los titula con CU22.",
        "",
        "LA SERIE DEL CODIGO tiene 20 entradas en el menu, 18 de ellas bajo /admin,",
        "y llega hasta CU43 en la parte de voz. La del documento tiene 46 casos.",
        "No son la misma lista. Este diagrama usa la del documento, CU17, y",
        "dice CU22 en el menu, porque los dos numeros son ciertos y conviene",
        "que quien lo lea sepa de donde sale cada uno."
    ]],
    ["3. La base de datos esta entera, y es justo la parte que falta", [
        "Lo raro de este caso no es que falte el frontend. Es que falta",
        "unicamente el puente.",
        "",
        "LO QUE HAY, las dos tablas:",
        "",
        "  recepciones, schema L313-319, 6 columnas",
        "     id_recepcion, id_orden_compra, id_sucursal, id_usuario,",
        "     fecha_recepcion, estado, con DEFAULT 'Registrada'",
        "",
        "  recepcion_items, schema L322-328, 6 columnas",
        "     id_recepcion_item, id_recepcion con ON DELETE CASCADE,",
        "     id_ptc, cantidad_pedida, cantidad_recibida, diferencia",
        "",
        "Y el procedimiento, schema L811-843, con sus 5 parametros y un OUT:",
        "",
        "  L823  INSERT INTO recepciones (id_orden_compra, id_sucursal,",
        "        id_usuario, estado) VALUES (..., 'Registrada')",
        "        RETURNING id_recepcion INTO p_recepcion_id",
        "  L827  FOR item IN SELECT * FROM jsonb_array_elements(p_items)",
        "  L832  INSERT INTO recepcion_items ...",
        "  L835  INSERT INTO movimientos_inventario ...",
        "  L840  UPDATE ordenes_compra SET estado = 'Recibida'",
        "",
        "LO QUE FALTA, UNA LLAMADA. Contado: en los 24 modulos y en las 40",
        "paginas hay cero llamadas a sp_ o a fn_. De las 8 funciones del",
        "esquema, 4 son sp_ y ninguna se invoca.",
        "",
        "Y LO QUE ESA UNA LLAMADA ARREGLA, y es mucho:",
        "",
        "  1  La pantalla, que es codigo de React, con un formulario de",
        "     cantidad recibida por prenda.",
        "  2  El estado 'Recibida' de la orden, que CU16 demostro que",
        "     nadie pone. Y con el, el 409 de 'No se puede anular una orden",
        "     ya recibida', L504-506, que hoy es codigo muerto.",
        "  3  El score de proveedor, que es el hallazgo 5.",
        "  4  La trazabilidad del movimiento, que es el hallazgo 8.",
        "",
        "O sea que el hueco es de una linea de TypeScript con un SELECT",
        "contra una funcion que ya esta escrita y probada, en teoria. Es el",
        "caso mas barato de cerrar de todo el proyecto y el de mas alcance."
    ]],
    ["4. La diferencia entre lo pedido y lo recibido no se puede registrar", [
        "Este es el hallazgo mas grave de los dos que estan en el SQL, y",
        "es independiente de que la funcion se llame o no.",
        "",
        "EL INSERT, schema L832-833:",
        "",
        "  INSERT INTO recepcion_items",
        "    ( id_recepcion, id_ptc, cantidad_recibida, diferencia )",
        "  VALUES ( p_recepcion_id, v_id_ptc, v_recibida, 0 );",
        "",
        "Y LA TABLA, schema L322-328, tiene 6 columnas:",
        "",
        "  id_recepcion_item, id_recepcion, id_ptc,",
        "  cantidad_pedida, cantidad_recibida, diferencia",
        "",
        "O sea que el INSERT nombra 4 de las 6. Faltan dos, y son las dos",
        "que importan:",
        "",
        "  cantidad_pedida   no se rellena, se queda NULL",
        "  diferencia        se rellena con un 0 de L833, literal",
        "",
        "Y POR QUE ES GRAVE: una recepcion existe para registrar lo que llego",
        "FALTA. Pedir 50 y recibir 43, con 7 de diferencia, es el dato por el",
        "que se hace una recepcion fisica. Con diferencia en 0 fijo, la",
        "recepcion solo puede decir que llego todo, y eso o no es verdad.",
        "",
        "PEOR: el 0 de L833 se podria cambiar por la resta y nadie se",
        "enteraria, porque la funcion no se llama. O sea que el fallo esta",
        "escondido detras del fallo mayor.",
        "",
        "Y HAY UNA CONSECUENCIA CRUZADA, que es el hallazgo 5:",
        "",
        "  SRV_ProveedoresService L375",
        "    COALESCE(SUM(ri.cantidad_pedida), 0)::float8 AS pedido",
        "",
        "Como cantidad_pedida nunca se rellena, el SUM da 0. O sea que el",
        "criterio de cumplimiento del proveedor tiene el denominador en 0",
        "siempre, y con el ?: 1 de L403 eso se traduce en la nota maxima.",
        "",
        "PARA ARREGLARLO hacen falta dos cosas, no una. La llamada a la",
        "funcion, y dentro de la funcion, leer el detalle de la orden para",
        "saber lo pedido. Porque un INSERT no puede saber lo pedido por si",
        "solo: tendria que hacer un SELECT de orden_compra_items por cada",
        "id_ptc, dentro del bucle. O mejor, Traer los dos campos en el JSON",
        "que ya se le pasa, p_items, que hoy solo lleva id_ptc y",
        "cantidad_recibida, L829-830."
    ]],
    ["5. El score de proveedor lee tablas vacias, y dos de sus cuatro notas", [
        "Esta es la consecuencia de fondo, y es la mas elegante de las",
        "cinco que dejan el caso de CU17.",
        "",
        "SRV_ProveedoresService, calcularScore, L350-408. Son 59 lineas y",
        "tres consultas para puntuar a un proveedor de 0 a 100.",
        "",
        "CONSULTA 1, L353-360: cuenta entregas a tiempo, pero con",
        "  WHERE oc.id_proveedor = $1 AND LOWER(oc.estado) = 'recibida'",
        "y L366-368:",
        "  if (total === 0) throw new BadRequestException(",
        "    'No hay datos de entregas para calcular el score.');",
        "",
        "Como nadie pone una orden en 'Recibida' -- y lo demostro CU16, y lo",
        "vuelve a demostrar este caso -- total es 0 siempre. O sea que",
        "calcularScore SIEMPRE lanza un 400. No es una funcion que a veces",
        "falla: es una funcion que no puede devolver nada nunca.",
        "",
        "CONSULTA 2, L375-380: une recepciones y recepcion_items, con el",
        "mismo filtro de 'recibida'. Las dos tablas estan vacias.",
        "",
        "CONSULTA 3, L388-392: cuenta mermas, y une por",
        "  JOIN ordenes_compra oc ON oc.id_orden_compra = m.id_orden_compra",
        "Y m.id_orden_compra no lo rellena NINGUN INSERT del proyecto:",
        "contados los 6 INSERT sobre movimientos_inventario, cero lo",
        "nombran. El unico que lo hace es sp_registrar_recepcion L836, que",
        "no se ejecuta. O sea que merma es 0 siempre, por otra via.",
        "",
        "Y AQUI ESTA LO FINO. Quitando el throw de L367, las notas de L400-405:",
        "",
        "  L400  puntualidad  = 40 * clamp(aTiempo / total, 0, 1)",
        "  L401  velocidad    = promDias <= 15 ? 20 : ...",
        "  L403  cumplimiento= 20 * clamp(pedido > 0 ? recibido/pedido : 1, 0, 1)",
        "  L405  calidad      = 20 * clamp(1 - (recibido > 0 ? merma/recibido : 0), 0, 1)",
        "",
        "Con pedido = 0, elternario de L403 cae en el 1, y cumplimiento = 20",
        "de 20: la maxima. Con recibido = 0, el de L405 cae en el 0, y calidad",
        "= 20 de 20: tambien la maxima.",
        "",
        "O sea que los dos criterios que dependen de la recepcion NO SON 0",
        "POR FALTA DE DATOS: SON 20 DE 20 POR FALTA DE DATOS. El : 1 y el : 0",
        "de L403 y L405 estan puestos para tratar el caso de 'no hay datos'",
        "como 'no penalizar', que es una decision defendible. Pero como no",
        "hay datos NUNCA, ese caso es el unico caso, y el resultado es que",
        "esos dos criterios son 40 puntos fijos.",
        "",
        "Y LA COLUMNA calidad_score SI SE ESCRIBE, y hay que decirlo con",
        "exactitud, porque sin ello la afirmacion seria falsa. L322 la lee",
        "y L333 la updatea:",
        "",
        "  L322  SELECT id_proveedor, nombre_empresa, calidad_score",
        "         FROM proveedores WHERE id_proveedor = $1",
        "  L333  UPDATE proveedores SET calidad_score = $2, score_fecha = NOW()",
        "",
        "O sea que el UPDATE existe, y lo precede el L347 'Score",
        "recalculado.'. El problema es que ese UPDATE esta en la misma funcion",
        "que lanza el 400, y el 400 va antes. O sea que el unico escritor de la",
        "columna no puede llegar a escribirla nunca.",
        "",
        "Y CU14 L221 no la rellena en el alta, asi que el valor inicial es el",
        "DEFAULT de la columna, que es NULL. O sea que se queda en NULL no por",
        "que nadie la escriba, sino porque el unico que la escribe falla antes.",
        "",
        "El campo 'estado de riesgo' de CU15 y el score de aqui son los dos",
        "inputs de la decision de compra a un proveedor, y los dos estan",
        "vacios por la misma causa raiz: la recepcion no existe."
    ]],
    ["6. El signo de la cantidad lo sostiene un if y nada mas", [
        "Un detalle pequeno de PostgreSQL, pero con una consecuencia",
        "silenciosa.",
        "",
        "LA COLUMNA, schema L426:",
        "",
        "  cantidad        INTEGER,",
        "",
        "Ni NOT NULL, ni CHECK, ni nada. Es un entero que puede ser NULL, o",
        "cero, o negativo, sin que la base de datos opine.",
        "",
        "Y LA ARITMETICA, schema L648, dentro del trigger:",
        "",
        "  DO UPDATE SET cantidad_disponible =",
        "    inventario_stock.cantidad_disponible + NEW.cantidad;",
        "",
        "O sea que el signo de NEW.cantidad es lo unico que decide si el",
        "stock sube o baja. El campo tipo_movimiento esta ahi, L425, con 30",
        "caracteres, y el trigger no lo mira.",
        "",
        "QUIEN PONE EL SIGNO, de todo el proyecto, un solo sitio:",
        "",
        "  SRV_AjustesService L198",
        "    const cantidadAplicada =",
        "      tipo === 'MERMA' ? -Math.abs(cantidad) : cantidad;",
        "",
        "Una linea. Con eso una MERMA resta y un AJUSTE suma. Y los otros",
        "cuatro INSERT sobre movimientos_inventario -- pagos L346 y L716,",
        "reservas L703, L973 y L1110 -- no tienen nada equivalente.",
        "",
        "ASI QUE LA REGLA, 'una salida es negativa y una entrada es positiva',",
        "esta en un if de TypeScript de un solo fichero. Si otro autor",
        "inserta un movimiento con tipo 'Salida' y cantidad 5, el stock",
        "SUMA 5. No hay error, no hay aviso: el trigger hace lo que le dicen.",
        "",
        "Y EL CASO DE NULL, que es el que de verdad duele:",
        "",
        "  NULL + 1 = NULL  en PostgreSQL",
        "",
        "Asi que un INSERT con cantidad NULL deja",
        "inventario_stock.cantidad_disponible en NULL. Y a partir de ahi, en",
        "esa fila, todas las operaciones dan NULL: las restas, las sumas, los",
        "clamp del score, los Number(f.cantidad ?? 0) del frontend. Todo en",
        "silencio, y todo a 0 por el ?? 0.",
        "",
        "LO QUE FALTARIA es un CHECK cantidad IS NOT NULL, y el signo",
        "sacado del tipo, no del valor."
    ]],
    ["7. De las 8 funciones del esquema, solo una trabaja, y es un trigger", [
        "Este recuento corrige una cuenta que yo he ido repitiendo, asi",
        "que lo dejo bien contado.",
        "",
        "EL ESQUEMA tiene 8 funciones y 2 triggers. Las 8 funciones:",
        "",
        "  fn_incrementar_intentos       L608   trigger L620   MUERTA",
        "  fn_aplicar_movimiento_inventario L628 trigger L654  VIVA",
        "  sp_registrar_venta            L662   sin trigger   MUERTA",
        "  sp_registrar_reserva          L728   sin trigger   MUERTA",
        "  sp_registrar_devolucion       L774   sin trigger   MUERTA",
        "  sp_registrar_recepcion        L811   sin trigger   MUERTA",
        "  fn_detectar_stock_bajo        L848   sin trigger   MUERTA",
        "  fn_kardex_producto            L873   sin trigger   MUERTA",
        "",
        "Y POR QUE VIVA LA OCTAVA, que es la que seiba de este caso:",
        "",
        "  trg_movimiento_inventario, L654-657",
        "    BEFORE INSERT ON movimientos_inventario",
        "    FOR EACH ROW EXECUTE FUNCTION fn_aplicar_movimiento_inventario()",
        "",
        "Los 6 INSERT sobre movimientos_inventario del proyecto la disparan",
        "sin querer, y por eso funciona el inventario entero. Y no es que la",
        "app la invoque: la base de datos la ejecuta sola.",
        "",
        "Y LA PRUEBA DE QUE FUNCIONA esta en SRV_AjustesService L233:",
        "",
        "  RETURNING id_movimiento, stock_anterior, stock_posterior",
        "",
        "Las dos ultimas columnas las rellena el trigger, L641-642, en el",
        "momento del BEFORE INSERT. La app no las escribe: las lee de vuelta.",
        "Y con el stock_posterior que vuelve, L240, la pantalla muestra el",
        "nuevo stock. Ese es el unico punto del proyecto donde el trigger es",
        "necesario, y por eso es el unico que no se puede quitar.",
        "",
        "LAS OTRAS SIETE, y por que estan muertas:",
        "",
        "  fn_incrementar_intentos  esta INSTALADA, pero SRV_AuthService",
        "    L62 compara >= 5 y L64 pone el contador a 0 antes del save. El",
        "    trigger, que es BEFORE UPDATE OF intentos_fallidos, nunca ve un 5.",
        "  sp_registrar_venta, reserva, devolucion y recepcion  ni trigger ni",
        "    llamada. El registro de venta lo hace SRV_VentasService con sus",
        "    propias consultas.",
        "  fn_detectar_stock_bajo  L858 lee alertas_stock_config, que no",
        "    aparece en NINGUN fichero de TypeScript: cero INSERT, cero",
        "    UPDATE, cero SELECT. Y el trigger de stock minimo que hay de",
        "    verdad esta en la app, sobre inventario_stock.stock_minimo_alert,",
        "    que es otra columna de otra tabla. O sea que la funcion y la app",
        "    leen dos sitios distintos para lo mismo.",
        "  fn_kardex_producto  L873-887 es el kardex escrito en SQL, y lo",
        "    hace otra vez SRV_KardexService L234 y L247 en TypeScript. Dos",
        "    implementaciones de lo mismo, y la de TypeScript es la viva."
    ]],
    ["8. El ingreso a inventario que si funciona pierde la trazabilidad", [
        "Como entra la mercaderia hoy, y lo que se pierde por el camino.",
        "",
        "EL CAMINO REAL, que es el caso CU24 del proyecto, Ajustes y Mermas:",
        "",
        "  AdminAjustes.tsx, 462 lineas",
        "  CTR_Ajustes.ts, L15-71, POST admin/inventario/ajustes",
        "  SRV_AjustesService.ts, L186-270, el metodo registrar",
        "",
        "EL INSERT, L231-234, y aqui esta la perdida:",
        "",
        "  INSERT INTO movimientos_inventario",
        "    ( id_ptc, id_sucursal, tipo_movimiento, cantidad, referencia,",
        "      id_usuario )",
        "  VALUES ( $1, $2, $3, $4, $5, $6 )",
        "",
        "Seis columnas de trece, y la que falta es la importante:",
        "",
        "  id_orden_compra   NO se rellena",
        "",
        "Y no es un olvido de este INSERT. Contados los 6 INSERT sobre",
        "movimientos_inventario de todo el proyecto -- Ajustes L231, Pagos",
        "L346 y L716, Reservas L703, L973 y L1110 -- NINGUNO nombra",
        "id_orden_compra. Cero de seis.",
        "",
        "  Y AQUI ESTA LA DISTINCION QUE HACE FALTA, porque cero de seis suena a",
        "  descuido y no lo es. Los 6 INSERT meten 6 o 7 columnas, y cinco de ellos SI",
        "  rellenan su columna de enlace al documento que los origina:",
        "",
        "    Ajustes L231      6 columnas, sin enlace: es un ajuste puro",
        "    Pagos L346        7 columnas, con id_venta",
        "    Pagos L716        7 columnas, con id_venta",
        "    Reservas L703     7 columnas, con id_reserva",
        "    Reservas L973     7 columnas, con id_reserva",
        "    Reservas L1110    7 columnas, con id_reserva",
        "",
        "O sea que el autor SI se acordo de atar el movimiento a la venta y a la",
        "reserva, en 5 INSERT de 6. Lo que no ata es a la orden de compra, que es",
        "justamente el documento que no tiene caso de uso. El hueco de este caso",
        "se nota hasta en las columnas.",
        "",
        "LO QUE ESO ROMPE, y son dos cosas que ya se viuieron:",
        "",
        "  1  La orden de compra no tiene ninguna idea de lo que entro por su",
        "     cuenta. No se puede saber que mercaderia se recibio de verdad.",
        "  2  SRV_ProveedoresService L390, la tercera consulta del score,",
        "     une por m.id_orden_compra. Esa union no puede devolver nada",
        "     nunca, y por eso la merma de un proveedor es siempre 0.",
        "",
        "Y LA REFERENCIA, que es lo que se salva: L227 la construye con el",
        "motivo, y si hay observacion la pega:",
        "",
        "  const referencia = observacion.length > 0",
        "    ? `${motivo} | ${observacion}`",
        "    : motivo;",
        "",
        "O sea que la unica traza que queda es texto libre que escribe una",
        "persona. Y CU08, que es donde se lee la bitacora, no lo indexa ni lo",
        "filtra. Es un campo de texto en un JSONB, del L5 de la bitacora",
        "cada vez que alguien escribe 'recepcion' a mano en el motivo.",
        "",
        "LO QUE ESTA BIEN EN ESTE CAMINO, y hay que decirlo:",
        "",
        "  - La comprobacion de stock insuficiente, L222-224, ANTES de",
        "    escribir. Es la validacion que mas falta hace en un ajuste de",
        "    inventario, y esta ahi.",
        "  - El @IsIn de CTR_Ajustes L23, que es una lista blanca real de 3",
        "    tipos, como el ESTADOS_VALIDOS de CU15.",
        "  - El motivo obligatorio con @MaxLength(1000), L29-30, y el",
        "    servidor exigiendo 3 caracteres, L201-203. Dos capas.",
        "  - El truncado con Math.trunc, L194, que evita los decimales en",
        "    una columna INTEGER.",
        "  - El RETURNING de L233, que hace que el stock que se aplica y el",
        "    que se muestra sean el mismo numero y no dos calculos."
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
        try { el.Notes = "Linea de vida " + (i + 1) + " de 10 del diagrama de secuencia de CU17."; } catch (e) { }
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
// Este caso tiene UN loop (el FOR de sp_registrar_recepcion, L827) y
// NINGUN alt. Se ha contado antes de escribir, con contadores.
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

// El unico loop del caso es el FOR de sp_registrar_recepcion, L827, y va
// sobre los mensajes 17 y 18, que son la cabecera y el cuerpo del bucle.
function colocarFragmentos(diag) {
    var xD = xDe(indiceDe("D"));
    fragmento(diag, "loop [por cada prenda recibida, en sp_registrar_recepcion]", xD, xD, Y_MSG0 + 16 * PASO_MSG - 34, Y_MSG0 + 18 * PASO_MSG + 16);
    activacion(diag, xDe(indiceDe("C")), Y_MSG0 + 30 * PASO_MSG - 26, Y_MSG0 + 37 * PASO_MSG + 12);
    activacion(diag, xDe(indiceDe("S")), Y_MSG0 + 31 * PASO_MSG - 26, Y_MSG0 + 36 * PASO_MSG + 12);
}

function tituloYLeyenda(diag) {
    var t = "l=40;r=" + (X0 + 860) + ";t=30;b=64;";
    var o = null;
    try { o = diag.DiagramObjects.AddNew(t, "Text"); } catch (e) { o = null; }
    if (o != null) {
        try { o.Text = "CU17  Registrar Recepcion Fisica de Prendas (Ingreso a Inventario)   ·   en el codigo del proyecto este caso es CU22"; } catch (e) { }
        try { o.FontSize = 14; } catch (e) { }
        try { o.BorderStyle = 0; } catch (e) { }
        try { o.BackGroundColor = 16777215; } catch (e) { }
        o.Update();
    }
    var t2 = "l=40;r=" + (X0 + 860) + ";t=64;b=98;";
    var o2 = null;
    try { o2 = diag.DiagramObjects.AddNew(t2, "Text"); } catch (e) { o2 = null; }
    if (o2 != null) {
        try { o2.Text = "Diseno de caso de uso, seccion 3.3.2.1.  10 lineas de vida, 39 mensajes, 8 hallazgos, 1 loop y NINGUN alt, y 2 barras de activacion."; } catch (e) { }
        try { o2.FontSize = 9; } catch (e) { }
        try { o2.BorderStyle = 0; } catch (e) { }
        try { o2.BackGroundColor = 16777215; } catch (e) { }
        o2.Update();
    }
    var t3 = "l=" + X0 + ";r=" + (xDe(TOTAL_CAB - 1) + ANCHO_CAB) + ";t=186;b=236;";
    var o3 = null;
    try { o3 = diag.DiagramObjects.AddNew(t3, "Text"); } catch (e) { o3 = null; }
    if (o3 != null) {
        try { o3.Text = "La vertical punteada de cada cabecera es su linea de vida. El tiempo baja. Este caso esta en tres tiempos: arriba, lo que hay, que es un boton de menu y una pantalla que dice que no esta implementada; en medio, lo que hay en la base de datos y no se usa, que son dos tablas y un procedimiento entero; abajo, el caso por el que la mercaderia entra de verdad hoy, que es Ajustes y Mermas. El unico loop es el FOR del procedimiento, sobre PostgreSQL. No hay ningun alt, y se ha contado antes de dibujar: cero ramas de verdad en el camino de interaccion."; } catch (e) { }
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
// LOS 39 MENSAJES
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
    N.push("CU17  Registrar Recepcion Fisica de Prendas (Ingreso a Inventario).  Diseno de caso de uso, seccion 3.3.2.1.");
    N.push("");
    N.push("AVISO DE NUMERACION, QUE HAY QUE LEER PRIMERO");
    N.push("");
    N.push("  Este caso tiene dos numeros, y los dos estan escritos en el codigo:");
    N.push("");
    N.push("    la del documento, que es la de este trabajo:  CU17");
    N.push("    la del propio proyecto:                       CU22");
    N.push("");
    N.push("  Y LA DEL PROYECTO ES COHERENTE EN TRES SITIOS:");
    N.push("");
    N.push("    web/src/data/adminMenu.ts L160   cu: 'CU22',");
    N.push("    BASE DE DATOS/schema.sql  L809   -- 6. PROCEDIMIENTO: Recepcion de mercaderia (CU22)");
    N.push("    BASE DE DATOS/schema.sql  L300   -- 7. INVENTARIO [con raya] CU22-CU26");
    N.push("");
    N.push("  Y LA PRUEBA DE QUE CU22 NUNCA SE ESCRIBIO esta en api.ts: sus comentarios de seccion");
    N.push("  van CU21 en L1523 y CU23 en L1564. El 22 no esta entre los dos. El hueco de la serie");
    N.push("  del cliente es exactamente este caso.");
    N.push("");
    N.push("  LAS DOS SERIES SE SEPARAN DESDE CU12, porque el documento tiene 46 casos y el");
    N.push("  proyecto tiene 20 entradas de menu, 18 de ellas bajo /admin. Ordenes de compra es CU16 en el");
    N.push("  documento y CU21 en el codigo. Este diagrama usa la del documento, CU17, y dice");
    N.push("  CU22 donde toca, para que se puedan cruzar las dos.");
    N.push("");
    N.push("QUE HAY EN ESTE DIAGRAMA");
    N.push("");
    N.push("  10 lineas de vida, de izquierda a derecha:");
    N.push("");
    N.push("    ACTOR_Administrador   «actor»     quien recepciona");
    N.push("    adminMenu.ts          «boundary»  255 lineas, con implementado: false en L163");
    N.push("    AdminPlaceholder.tsx  «boundary»  24 lineas, la pantalla que no existe");
    N.push("    EnConstruccion.tsx    «boundary»  32 lineas, lo que el usuario ve");
    N.push("    api.ts                «boundary»  2105 lineas, sin metodo de recepciones de mercaderia");
    N.push("    JwtAuthGuard          «control»   dependencias.ts, L15-65, protege la ruta de ajustes");
    N.push("    AdminAjustes.tsx      «boundary»  462 lineas, el caso CU24 del proyecto");
    N.push("    CTR_Ajustes           «control»   L15-71, POST admin/inventario/ajustes");
    N.push("    SRV_AjustesService    «control»   L186-270, el metodo registrar");
    N.push("    PostgreSQL            «entity»    6 tablas, 1 trigger y 1 procedimiento que nadie llama");
    N.push("");
    N.push("  " + TOTAL_MSG + " mensajes. 15 van a la base de datos, y de esos 6 son consultas reales desde otro objeto");
    N.push("  y 9 son pasos internos del propio PostgreSQL, que es donde vive sp_registrar_recepcion. 22 son mensajes a si mismo,");
    N.push("  2 son retornos, 4 llevan la guarda escrita entre corchetes, y 10 tocan al actor.");
    N.push("  " + TOTAL_HAL + " hallazgos, a la derecha, de la y " + Y_NOTA0 + " a la y " + h.fin + ".");
    N.push("");
    N.push("EL DIAGRAMA TIENE TRES PARTES, Y NO ES UNA DECORACION");
    N.push("");
    N.push("  ARRIBA, LOS MENSAJES 1 A 9: LO QUE HAY. Un boton de menu, un comodin de router y");
    N.push("  un componente de 32 lineas que dice que la seccion no esta implementada.");
    N.push("");
    N.push("  EN MEDIO, LOS MENSAJES 14 A 24: LO QUE HAY EN LA BASE DE DATOS Y NO SE USA. Dos");
    N.push("  tablas correctas, un procedimiento entero con su bucle, y cero llamadas.");
    N.push("");
    N.push("  ABAJO, LOS MENSAJES 25 A 39: LO QUE PASA DE VERDAD. La mercaderia entra por");
    N.push("  Ajustes y Mermas, que es otro caso de uso, y entra sin orden de compra.");
    N.push("");
    N.push("EL UNICO FRAGMENTO: UN loop Y NINGUN alt");
    N.push("");
    N.push("  Contados ANTES de dibujar, con contadores, en las cuatro partes del caso:");
    N.push("");
    N.push("    AdminPlaceholder.tsx, 24 lineas      for 1  if 1  while 0  map 0  (sobre 20 items)");
    N.push("    EnConstruccion.tsx, 32 lineas        for 0  if 0  ternarios 2");
    N.push("    SRV_AjustesService.registrar L186-L270   for 0  if 5  while 0  ternarios 19");
    N.push("    sp_registrar_recepcion, L811-843     FOR 1  (en SQL)");
    N.push("");
    N.push("  El LOOP dibujado es el del procedimiento, L827-838: una vuelta por prenda recibida,");
    N.push("  con un INSERT en recepcion_items y otro en movimientos_inventario en cada vuelta. Es");
    N.push("  un bucle de verdad, y es el que tendria el caso si estuviera escrito. Se dibuja");
    N.push("  sobre PostgreSQL, en los mensajes 17 y 18.");
    N.push("");
    N.push("  NO HAY NINGUN alt, y se dice en vez de inventar uno:");
    N.push("");
    N.push("  - El for de AdminPlaceholder L9 busca una etiqueta en 20 entradas, y el if de L11 es");
    N.push("    un break. Eso es una busqueda, no una rama del caso de uso.");
    N.push("  - Los 5 if de SRV_AjustesService.registrar son guardas con una salida cada una:");
    N.push("    permiso, cantidad no entera, motivo corto, producto inexistente, stock");
    N.push("    insuficiente. Ninguno tiene dos caminos de verdad.");
    N.push("  - Los 19 ternarios de ese metodo son de valores, no de control de flujo.");
    N.push("");
    N.push("  Y las barras de activacion, que no son un extra: dos, la del controlador de");
    N.push("  ajustes y la del servicio, que son las unicas dos lineas de vida con codigo propio.");
    N.push("");
    N.push("EL HALLAZGO 1: EL CODIGO YA DICE QUE ESTE CASO NO EXISTE");
    N.push("");
    N.push("  adminMenu.ts, L157-164, la entrada completa, con la etiqueta, el icono PackagePlus,");
    N.push("  el permiso, el numero CU22 y una linea mas:");
    N.push("");
    N.push("    implementado: false,");
    N.push("");
    N.push("  El campo se DECLARA en L31, se ASIGNA 26 veces (21 en adminMenu.ts y 5 en clienteMenu.ts),");
    N.push("  y no se LEE en ningun sitio. O sea que hay un interruptor de 'esto funciona o no' con");
    N.push("  el valor puesto en false, y ningun componente lo consulta. En pantalla el boton se ve");
    N.push("  igual que uno que funciona.");
    N.push("");
    N.push("  Y al pulsarlo, con lineas:");
    N.push("");
    N.push("    el menu enlaza a /admin/recepciones, L158");
    N.push("    el router no declara esa ruta, L65-84, y el comodin de L84 la captura");
    N.push("    AdminPlaceholder, 24 lineas, busca la etiqueta y pinta EnConstruccion, L18-22");
    N.push("    y se lee, EnConstruccion L24, exactamente:");
    N.push("      'Esta seccion aun no esta implementada. Pronto estara disponible.'");
    N.push("");
    N.push("EL HALLAZGO 4: LA DIFERENCIA ENTRE PEDIDO Y RECIBIDO NO SE PUEDE REGISTRAR");
    N.push("");
    N.push("  schema L832-833:");
    N.push("");
    N.push("    INSERT INTO recepcion_items ( id_recepcion, id_ptc, cantidad_recibida, diferencia )");
    N.push("    VALUES ( p_recepcion_id, v_id_ptc, v_recibida, 0 );");
    N.push("");
    N.push("  Y la tabla, L322-328, tiene 6 columnas. El INSERT nombra 4. Faltan las dos que");
    N.push("  importan: cantidad_pedida se queda NULL, y diferencia es un 0 literal de L833.");
    N.push("");
    N.push("  Pedir 50 y recibir 43, con 7 de diferencia, es el dato por el que se hace una");
    N.push("  recepcion fisica. Con diferencia en 0 fijo, la recepcion solo puede decir que llego");
    N.push("  todo, y eso o no es verdad. Y como la funcion no se llama, el fallo queda escondido");
    N.push("  detras del fallo mayor.");
    N.push("");
    N.push("EL HALLAZGO 5: EL SCORE DE PROVEEDOR DA 40 PUNTOS FIJOS");
    N.push("");
    N.push("  SRV_ProveedoresService, calcularScore, L350-408. Tres consultas y 59 lineas.");
    N.push("");
    N.push("  La primera, L360, filtra por LOWER(oc.estado) = 'recibida', y L366-368 lanza un 400");
    N.push("  si no hay ninguna. Como nadie pone una orden en Recibida, SIEMPRE da 0, o sea que");
    N.push("  la funcion no puede devolver nada nunca. La segunda, L377-379, une recepciones y");
    N.push("  recepcion_items, que estan vacias. Y la tercera, L390, une por m.id_orden_compra, y");
    N.push("  ninguno de los 6 INSERT del proyecto rellena esa columna.");
    N.push("");
    N.push("  Y lo fino es lo que pasaria si se quitara el throw. L403 y L405:");
    N.push("");
    N.push("    L403  cumplimiento = 20 * clamp( pedido > 0 ? recibido/pedido : 1, 0, 1 )");
    N.push("    L405  calidad       = 20 * clamp( 1 - (recibido > 0 ? merma/recibido : 0 ), 0, 1 )");
    N.push("");
    N.push("  Con pedido = 0, el ternario cae en el 1 y cumplimiento = 20 de 20. Con recibido = 0,");
    N.push("  el otro cae en el 0 y calidad = 20 de 20. O sea que los dos criterios que dependen");
    N.push("  de la recepcion no son 0 por falta de datos: son 20 de 20 por falta de datos. El : 1");
    N.push("  y el : 0 tratan 'no hay datos' como 'no penalizar', que es defendible, pero como no");
    N.push("  hay datos nunca, ese es el unico caso.");
    N.push("");
    N.push("  Y UNA MATIZ QUE IMPORTA: la columna calidad_score SI se escribe, en L333, con su score_fecha.");
    N.push("  Lo que pasa es que ese UPDATE esta en la misma funcion que lanza el 400, y el 400 va antes.");
    N.push("  O sea que el unico escritor de la columna no llega a escribirla. Y como CU14 L221 no la rellena en el");
    N.push("  alta, el valor inicial es el DEFAULT, que es NULL. Se queda en NULL no porque nadie la escriba, sino");
    N.push("  porque el que la escribe falla antes.");
    N.push("");
    N.push("  que es el otro input de la decision de compra, con el estado de riesgo de CU15.");
    N.push("");
    N.push("EL HALLAZGO 7: DE LAS 8 FUNCIONES, SOLO UNA TRABAJA, Y ES UN TRIGGER");
    N.push("");
    N.push("  Esto corrige un recuento que yo he ido repitiendo, asi que va con las cuentas:");
    N.push("");
    N.push("    fn_incrementar_intentos          L608  trigger L620  MUERTA");
    N.push("    fn_aplicar_movimiento_inventario L628  trigger L654  VIVA");
    N.push("    sp_registrar_venta               L662  sin trigger  MUERTA");
    N.push("    sp_registrar_reserva             L728  sin trigger  MUERTA");
    N.push("    sp_registrar_devolucion          L774  sin trigger  MUERTA");
    N.push("    sp_registrar_recepcion           L811  sin trigger  MUERTA");
    N.push("    fn_detectar_stock_bajo           L848  sin trigger  MUERTA");
    N.push("    fn_kardex_producto               L873  sin trigger  MUERTA");
    N.push("");
    N.push("  VIVA, y en este caso se ve: trg_movimiento_inventario, L654-657, BEFORE INSERT ON");
    N.push("  movimientos_inventario. Los 6 INSERT del proyecto la disparan sin querer, y por eso");
    N.push("  funciona el inventario entero. La prueba esta en SRV_AjustesService L233, que hace");
    N.push("  RETURNING stock_anterior, stock_posterior: las dos ultimas columnas las rellena el");
    N.push("  trigger, L641-642, en el BEFORE INSERT. La app no las escribe, las lee de vuelta.");
    N.push("");
    N.push("  LAS OTRAS SIETE. fn_incrementar_intentos esta instalada pero AuthService L62 compara");
    N.push("  el 5 y L64 pone el contador a 0 antes del save, asi que el trigger nunca lo ve. Las");
    N.push("  4 sp_ no las llama nadie. fn_detectar_stock_bajo, L858, lee alertas_stock_config, que");
    N.push("  no aparece en NINGUN fichero de TypeScript, mientras que la app usa");
    N.push("  inventario_stock.stock_minimo_alert, que es otra columna de otra tabla. Y");
    N.push("  fn_kardex_producto, L873-887, es el kardex en SQL, repetido por SRV_KardexService.")
    N.push("");
    N.push("EL HALLAZGO 8: EL INGRESO QUE SI FUNCIONA PIERDE LA TRAZABILIDAD");
    N.push("");
    N.push("  SRV_AjustesService L231-234, el INSERT que si mete la mercaderia:");
    N.push("");
    N.push("    INSERT INTO movimientos_inventario");
    N.push("      ( id_ptc, id_sucursal, tipo_movimiento, cantidad, referencia, id_usuario )");
    N.push("");
    N.push("  Seis columnas de trece. Falla id_orden_compra. Y no es un olvido de este INSERT:");
    N.push("  contados los 6 INSERT del proyecto, cero de seis la nombran. El unico que lo hace");
    N.push("  es sp_registrar_recepcion L836, que no se ejecuta.");
    N.push("");
    N.push("  Consecuencias: la orden no sabe que entro por su cuenta, y la tercera consulta del");
    N.push("  score, L390, une por esa columna, asi que la merma de un proveedor es siempre 0.");
    N.push("");
    N.push("  Y LA DISTINCION QUE HACE FALTA, porque cero de seis suena a descuido y no lo es. Los 6");
  N.push("  INSERT meten 6 o 7 columnas, y 5 de ellos SI rellenan su columna de enlace al documento que");
  N.push("  los origina: Pagos L346 y L716 con id_venta, y Reservas L703, L973 y L1110 con id_reserva. O");
  N.push("  sea que el autor si se acordo de atar el movimiento a la venta y a la reserva. Lo que no ata es a");
  N.push("  la orden de compra, que es justamente el documento que no tiene caso de uso. El hueco de este caso");
  N.push("  se nota hasta en las columnas.");
  N.push("");
  N.push("  Y LO QUE ESTA BIEN EN ESE CAMINO, que tambien hay que decir: la comprobacion de");
    N.push("  stock insuficiente ANTES de escribir, L222-224, que es la que mas falta hace en un");
    N.push("  ajuste de inventario. El @IsIn de L23 del controlador, lista blanca real de 3 tipos.")
    N.push("  El motivo obligatorio en dos capas, @MaxLength(1000) y 3 caracteres, L201-203. El")
    N.push("  Math.trunc de L194 contra una columna INTEGER. Y el RETURNING de L233, que hace que")
    N.push("  el stock que se aplica y el que se muestra sean el mismo numero y no dos calculos.");
    N.push("");
    N.push("RELACION CON LOS DIAGRAMAS ANTERIORES");
    N.push("");
    N.push("  CU16 demostro que nadie pone una orden en 'Recibida' y que el 409 de anular una orden");
    N.push("  recibida, L504-506, es codigo muerto. Este caso explica por que: la unica linea del");
    N.push("  proyecto que pondria ese estado es sp_registrar_recepcion L840, y no se ejecuta.");
    N.push("");
    N.push("  CU15 escribio el estado de riesgo del proveedor y CU16 lo consume en L349. Los dos");
    N.push("  son los inputs de la decision de compra a un proveedor, y los dos estan vacios por la");
    N.push("  misma causa: CU15 lo tiene en tres cadenas de texto sin puntuar, y CU17 no calcula");
    N.push("  el score porque no hay recepciones. El bloque 5 de proveedores esta entero y sin");
    N.push("  ninguna de las dos entradas alimentandolo.");
    N.push("");
    N.push("SOBRE LA COLOCACION DE ESTE DIAGRAMA");
    N.push("");
    N.push("  Anchura: las diez cabeceras separadas " + PASO + " px, con " + ANCHO_CAB + " de ancho. Quedan");
    N.push("  65 px entre una y otra. Altura: " + PASO_MSG + " px por mensaje. El mensaje 1 cae en la y " + Y_MSG0);
    N.push("  y el " + TOTAL_MSG + " en la y " + (Y_MSG0 + (TOTAL_MSG - 1) * PASO_MSG) + ".");
    N.push("");
    N.push("  Un detalle que hizo fallar estos diagramas ocho veces y que conviene no");
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
    N.push("    MARCOS de fragmento colocados: " + MARCOS_PUESTOS + " de 1");
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
        try { Repository.ShowMessage("No se pudo crear el diagrama.", "CU17 Secuencia", 0); } catch (e) { }
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
    T.push("CU17 - DIAGRAMA DE SECUENCIA - INFORME");
    T.push("");
    T.push("Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB);
    T.push("Tipo de diagrama: " + tipoUsado);
    T.push("Mensajes: " + r.puestos + " de " + TOTAL_MSG);
    T.push("Mensajes a si mismo: " + r.autodestino);
    T.push("Conectores en el diagrama: " + r.enDiagrama);
    T.push("Hallazgos: " + h2.total + " de " + TOTAL_HAL + ", banda hasta la y " + h2.fin);
    T.push("");
    T.push("AVISO DE NUMERACION");
    T.push("Este caso es CU17 en el documento y CU22 en el codigo del proyecto.");
    T.push("El menu lo marca implementado: false, en adminMenu.ts L163.");
    T.push("");
    T.push("MARCOS Y BARRAS  <-- MIRA ESTO");
    T.push("Este caso tiene 1 loop y NINGUN alt. Contado antes de dibujar con contadores.");
    T.push("Fragmentos colocados: " + MARCOS_PUESTOS + " de 1");
    T.push("Barras de activacion colocadas: " + BARRAS_PUESTAS + " de 2");
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
    msg = msg + "CU17 - Registrar Recepcion Fisica de Prendas" + SALTO;
    msg = msg + "Diagrama de secuencia, seccion 3.3.2.1." + SALTO;
    msg = msg + "En el codigo del proyecto este caso es CU22." + SALTO + SALTO;
    msg = msg + "10 lineas de vida, " + TOTAL_MSG + " mensajes, 8 hallazgos." + SALTO + SALTO;
    msg = msg + "1 loop (el FOR de L827) y NINGUN alt." + SALTO;
    msg = msg + "FRAGMENTOS colocados: " + MARCOS_PUESTOS + " de 1." + SALTO;
    msg = msg + "BARRAS colocadas: " + BARRAS_PUESTAS + " de 2." + SALTO;
    if (MARCOS_PUESTOS < 1 || BARRAS_PUESTAS < 2) msg = msg + "  Si falta alguno, hay que dibujarlo a mano." + SALTO;
    msg = msg + SALTO;
    msg = msg + "EL CODIGO YA DICE QUE NO EXISTE: adminMenu.ts" + SALTO;
    msg = msg + "L163 pone implementado: false, y ese campo no se" + SALTO;
    msg = msg + "lee en ningun sitio. Al pulsarlo sale un" + SALTO;
    msg = msg + "'EnConstruccion' que lo dice." + SALTO + SALTO;
    msg = msg + "PERO LA BASE DE DATOS SI ESTA ENTERA: 2 tablas y" + SALTO;
    msg = msg + "sp_registrar_recepcion, y no la llama nadie." + SALTO;
    msg = msg + "Ademas no rellena cantidad_pedida y pone" + SALTO;
    msg = msg + "diferencia en 0 fijo, y el score de proveedor se" + SALTO;
    msg = msg + "queda con 40 puntos fijos." + SALTO + SALTO;
    msg = msg + "Lineas de vida: " + clavesPresentes(C) + " de " + TOTAL_CAB + SALTO;
    msg = msg + "Mensajes: " + r.puestos + " de " + TOTAL_MSG + SALTO;
    msg = msg + "Conectores: " + r.enDiagrama + SALTO;
    msg = msg + "Hallazgos: " + h2.total + " de " + TOTAL_HAL + SALTO;
    msg = msg + "COLOCACION: " + ch.bien + " de " + ch.leidos + " objetos colocados" + SALTO;
    msg = msg + "Errores: " + ERRORES.length;
    try { Repository.ShowMessage(msg, "CU17 Secuencia", 0); } catch (e) { }
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
    try { Repository.ShowMessage("Error: " + String(e), "CU17 Secuencia", 0); } catch (e3) { }
}
