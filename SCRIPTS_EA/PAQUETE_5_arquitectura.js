// ================================================================
// PAQUETE 5  ·  ARQUITECTURA DEL SUBSISTEMA
// Gestion de Proveedores y Compras  ·  CU14, CU15, CU16
// E-COMMERCE TIENDA MONTANO   ·   Seccion 5.3.5
//
// QUE DIBUJA
//   El diagrama de componentes del paquete 5, con los 15 componentes
//   del subsistema y las 27 interfaces entre ellos, y TODO DENTRO de
//   un marco que se llama PAQUETE 5 - PROVEEDORES Y COMPRAS.
//
//   A diferencia de los otros, este paquete son DOS MODULOS de NestJS
//   distintos, proveedores y compras, que no se importan entre si.
//   Se juntan por negocio, no por codigo.
//
//   15 componentes:  3 de presentacion, 2 de control, 2 de logica,
//                    2 del paquete 1 y 6 de datos
//   27 interfaces
//
// PATRON COPIADO DE CAPAS_diagrama_por_capas.js, QUE SI DIBUJA BIEN
//   -  Los marcos son Package REALES del modelo, con Sequence = 1
//      para que EA los deje DETRAS del contenido.  El nombre del
//      Package es la etiqueta del marco.  No son formas.
//   -  LAS COORDENADAS VERTICALES VAN EN NEGATIVO.
//   -  DOS PASADAS con guardarYRecargar entre ellas.
//   -  El conector se coloca con con.DiagramID = diag.ID.
//
// EL HALLAZGO DE ESTE PAQUETE, Y ES EL MAS DURO
//   La tabla proveedores tiene 11 columnas en schema.sql.  El codigo
//   USA CUATRO QUE NO ESTAN: nit_ruc, condiciones_comerciales,
//   score_fecha e id_ciudad.  Y no es que el codigo las ignore: las
//   exige en el DTO, las pinta en la pantalla, comprueba su unicidad
//   con un COUNT y las escribe en el INSERT y en el UPDATE.
//
//   Consecuencia, ruta por ruta de las 4 del modulo de proveedores:
//     GET                    funciona
//     PATCH :id/estado       funciona, usa estado_riesgo, que si existe
//     POST                   NO FUNCIONA, el INSERT nombra 3 columnas de mas
//     POST :id/recalcular_score  NO FUNCIONA, y por dos motivos
//
//   Y el segundo motivo es una cadena de tres eslabones rotos:
//     1. calcularScore filtra ordenes_compra por estado 'recibida'
//     2. NADIE ESCRIBE estado 'recibida' en ningun sitio del proyecto
//     3. Y NADIE ESCRIBE en recepciones ni en recepcion_items: cero
//        INSERT en las 145 clases del backend
//   O sea que la nota del proveedor no se puede calcular aunque la
//   columna existiera, porque no hay ninguna orden recibida.
//
// Aviso con WScript.Shell.Popup.  Sin llamadas a SQL y sin
// SaveDiagram.  Una instruccion por linea.  Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================


var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var PAQ_NOMBRE = "Paquete 5 - Proveedores y Compras";
var DIAG_NOMBRE = "Arquitectura del Paquete 5";

var TOTAL_CMP = 15;
var TOTAL_REL = 27;
var TOTAL_CAP = 5;

var ERRORES = [];
var INFORME = [];

var MARCO_NOMBRE = "PAQUETE 5 - PROVEEDORES Y COMPRAS";
var MARCO_X = 10;
var MARCO_Y = 10;
var MARCO_W = 1700;
var MARCO_H = 900;
var MARCO_COLOR = 15132358;

// nombre, izquierda, arriba, ancho, alto, color
var CAPAS = [
    ["Presentacion", 30, 60, 640, 300, 13421823],
    ["Control", 30, 410, 640, 190, 13434879],
    ["Logica de Negocio", 30, 650, 640, 190, 13434828],
    ["Del Paquete 1", 720, 60, 380, 780, 16777164],
    ["Datos", 1160, 60, 520, 780, 16770790]
];


// ================================================================
// LOS 17 COMPONENTES   [nombre, capa, nota]
// ================================================================

var PAQ = [

    // ---------------- PRESENTACION: 3 ----------------

    ["AdminProveedores.tsx", "Presentacion",
    "CAPA: Presentacion | CASOS: CU14 Registrar Proveedor y CU15 Inhabilitar o Bloquear Proveedor | FICHERO: web/src/pages/admin/AdminProveedores.tsx, 711 LINEAS: la sexta mas larga del frontend | LLAMA: cinco funciones, api.listarProveedores, api.listarCiudades, api.crearProveedor, api.cambiarEstadoProveedor y api.recalcularScoreProveedor | **PINTA LAS CUATRO COLUMNAS QUE NO EXISTEN**: el NIT o RUC en su propio campo de formulario y en su columna de la tabla, y las condiciones comerciales en un area de texto. El score y su fecha salen en un componente con la insignia de la nota | **UNA DE SUS CINCO LLAMADAS ES A OTRO PAQUETE**: listarCiudades no es de proveedores, es del paquete 3. La pantalla de proveedores pide las ciudades al servicio de sucursales | Y ES LA UNICA DEL PAQUETE CON UN RUC, que es el identificador fiscal obligatorio en Bolivia y que la base de datos no tiene donde guardsar"],

    ["AdminOrdenesCompra.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU16 Elaborar Orden de Compra a Proveedor | FICHERO: web/src/pages/admin/AdminOrdenesCompra.tsx, 794 LINEAS: **la segunda pantalla mas larga del frontend**, detras de Producto.tsx con 831 | LLAMA: seis funciones, api.listarOrdenesCompra, api.obtenerOpcionesOrdenCompra, api.obtenerOrdenCompra, api.crearOrdenCompra, api.actualizarOrdenCompra y api.anularOrdenCompra | LAS SEIS LLAMADAS SON LAS SEIS RUTAS DEL CONTROLADOR, una a una, como la pantalla de sucursales en el paquete 3 | **TIENE UN ESTADO QUE NUNCA VA A APARECER**: la linea 30 tiene la insignia verde para 'recibida', y ninguna ruta del proyecto pone una orden en ese estado. La pantalla esta preparada para un estado que el backend no sabe producir"],

    ["api.ts", "Presentacion",
    "CAPA: Presentacion | FICHERO: web/src/lib/api.ts | EL CLIENTE HTTP DEL PAQUETE | DIEZ rutas del paquete, y OCHO de ellas son propias y DOS son del paquete 3: listarCiudades, que la pantalla de proveedores pide a las ciudades | LAS DIEZ EN UN SOLO FICHERO DE TIPOS, donde el tipo Proveedor declara nit_ruc, condiciones_comerciales y score_fecha. O sea que el cliente y la pantalla comparten la misma columna inexistente"],

    // ---------------- CONTROL: 2 ----------------

    ["CTR_Proveedores", "Control",
    "CAPA: Control | CASOS: CU14 y CU15, y una cuarta ruta sin caso | FICHERO: api/src/modulos/proveedores/CTR_Proveedores.ts, 110 lineas | @Controller('proveedores') con JwtAuthGuard. OJO: ESTE NO ES UN ADMIN, es el unico controlador del proyecto que expone su recurso en la raiz del API sin el prefijo admin | CUATRO rutas: GET, POST, PATCH :id/estado y POST :id/recalcular_score | **LA CUARTA RUTA NO TIENE CASO DE USO Y ES LOGICA DE NEGOCIO REAL**: recalcular la nota del proveedor. No es una pantalla de consulta, es una operacion que recalcula y escribe, y existe porque el resto del sistema no tiene forma de puntuar a nadie | SU DTO EXIGE nit_ruc COMO OBLIGATORIO, en la linea 27, y acepta condiciones_comerciales como opcional. Los dos campos no existen en la base de datos | DECLARA EL DTO EN SU PROPIO FICHERO, y ademas lo importa del servicio, que es lo mismo que hace el resto de controladores del modulo"],

    ["CTR_Compras", "Control",
    "CAPA: Control | CASOS: CU16, y la ruta de opciones no tiene caso | FICHERO: api/src/modulos/compras/CTR_Compras.ts, 131 lineas | @Controller('admin/ordenes-compra') con JwtAuthGuard | SEIS rutas: GET, GET opciones, GET :id, POST, PUT :id y PATCH :id/anular | **ES EL UNICO CONTROLADOR DEL PAQUETE CON LAS SEIS OPERACIONES DEL CICLO DE VIDA DE UN DOCUMENTO**: crear, leer, listar, modificar y anular. Los demas hacen solo parte | LA RUTA DE OPCIONES NO TIENE CASO, y es la que carga proveedores, sucursales y productos para el formulario, de una vez | USA Type del class-transformer, que es el unico de los 27 controladores que lo importa, porque convierte los parametros de ruta antes de validarlos"],

    // ---------------- LOGICA DE NEGOCIO: 2 ----------------

    ["SRV_ProveedoresService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/proveedores/SRV_ProveedoresService.ts, 409 lineas | METODOS: 4, para 4 rutas | **TRECE LLAMADAS, CERO REPOSITORIOS, TODO SQL A MANO**, igual que el paquete 4 | **AQUI ESTA LA CUARTA RUTA, Y TIENE LA LOGICA MAS INTERESANTE DEL PROYECTO**: calcularScore, que es privado, consulta las ordenes de compra recibidas del proveedor y saca tres numeros: cuantasEntregas hubo, cuantas llegaron a tiempo, contando como a tiempo las que no tienen fecha estimada, y la media de dias de retraso. Con eso compone la nota | **Y TIENE UN CRITERIO QUE ESTA ESCRITO, NO HEREDADO**: el filtro es estado igual a 'recibida'. Como nadie pone ese estado, el total siempre es cero, y calcularScore lanza BadRequest con el texto No hay datos de entregas para calcular el score | TAMBIEN COMPRUEBA ANTES DE BLOQUEAR: antes de poner un proveedor en Bloqueado mira si tiene ordenes de compra en un estado distinto de procesada, recibida, anulada o cancelada, y si las tiene lanza ConflictException con el texto de que las procese o anule antes. ESA REGLA SI FUNCIONA, porque el estado de las ordenes si se escribe | SIN TRANSACCION: sus trece llamadas van sueltas"],

    ["SRV_ComprasService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/compras/SRV_ComprasService.ts, 540 lineas | METODOS: 6, para 6 rutas | **LAS DOS TRANSACCIONES DEL PAQUETE ESTAN AQUI**, en L390 para crear y en L454 para modificar, y son dataSource.transaction con el gestor de la transaccion | **EL NUMERO DE LA ORDEN SE GENERA EN DOS PASOS**: primero inserta la cabecera sin numero, y despues hace un UPDATE para ponerlo. Es un apaño, y funciona, porque va dentro de la transaccion | **LAS TRES VALIDACIONES DE LA CABECERA**: la sucursal destino tiene que existir y estar activa, y la fecha estimada de entrega es obligatoria y valida | **LAS VALIDACIONES DE LAS LINEAS SON CUATRO Y ESTAN EN EL BUCLE**: al menos una linea, cada linea con un producto valido, cada linea con producto y cantidad mayor que cero, y cada linea con un precio unitario mayor que cero. La cantidad la comprueba ADEMAS el unico CHECK del esquema entero, el de orden_compra_items | **LAS DOS REGLAS DE ESTADO**: solo se puede editar una orden en estado Pendiente, y no se puede anular una orden ya recibida. La segunda vuelve a mirar fecha_recepcion ademas del estado, de modo que aguanta las dos formas de tener una orden recibida"],

    // ---------------- DEL PAQUETE 1: 2 ----------------

    ["dependencias.ts", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/dependencias.ts, 148 lineas | LA USA LOS 2 CONTROLADORES, con la guarda a NIVEL DE CLASE, de manera que las 10 rutas quedan protegidas con dos lineas | **Y ADEMAS LOS 2 SERVICIOS TIENEN SU PROPIA COMPROBACION**: exigirPermisoEvaluar en el de proveedores, para la nota, y una linea suelta en el de compras que lanza No tienes permiso para elaborar ordenes de compra | O SEA QUE LA CUARTA REGLA DE PERMISOS DEL PROYECTO, y es la segunda vez que aparece en un servicio: la del paquete 3 con gestionar sucursales, y ahora estas dos. Ninguna se apoya en el servicio de roles del paquete 2"],

    ["SRV_BitacoraService", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/SRV_BitacoraService.ts, 40 lineas | LA USA LOS 2 SERVICIOS, y es la unica dependencia que comparten | **AQUI SI DEJA RASTRO DE UN CAMBIO DE VALOR**: la recalculacion de la nota pasa a la bitacora la nota anterior y la nueva, de modo que el registro dice de cuanto a cuanto, y no solo que se toco el proveedor | ES LO QUE HACE QUE LA NOTA SEA AUDITABLE. Sin esto nadie podria saber si un proveedor subio o bajo de nota, y en un sistema de compras eso es informacion de la que se depende para decidir"],

    // ---------------- DATOS: 6 ----------------

    ["CE_Modelos.ts (seguridad)", "Datos",
    "CAPA: Datos | FICHERO: api/src/modulos/seguridad/CE_Modelos.ts | LO USA SOLO PARA EL TIPO Usuario, en los dos controladores y en los dos servicios | Y POR ESO ES LA DEPENDENCIA MAS BARATA DEL PAQUETE: una clase usada como tipo, sin una sola consulta"],

    ["proveedores", "Datos",
    "CAPA: Datos | FICHERO: la tabla | **AQUI ESTA EL HALLAZGO DEL PAQUETE** | EN schema.sql TIENE 11 COLUMNAS: id_proveedor, nombre_empresa, persona_contacto, telefono, email, direccion, observaciones, tiempo_entrega_dias, estado_riesgo, calidad_score y fecha_registro | **Y EL CODIGO USA CUATRO QUE NO ESTAN**: nit_ruc, condiciones_comerciales, score_fecha e id_ciudad. Zero apariciones de las tres primeras en el esquema | **Y NO ES QUE EL CODIGO LAS USE DE PASO**: el DTO de la ruta de alta EXIGE nit_ruc como obligatorio, la pantalla tiene un campo de formulario con ese nombre, el servicio comprueba su unicidad con un SELECT COUNT antes de insertar, y el INSERT y el UPDATE las escriben | **LO QUE SI FUNCIONA**: estado_riesgo y calidad_score si existen, y por eso las rutas de listado y de bloqueo funcionan. El nombre de la columna es estado_riesgo con el valor Activo, que es un nombre de estado de riesgo con un valor de estado de vida, y el codigo lo usa bien | LAS DOS UNIQUE: nombre_empresa es NOT NULL, y email es UNIQUE aunque puede ser nulo"],

    ["ordenes_compra", "Datos",
    "CAPA: Datos | FICHERO: la tabla | ONCE COLUMNAS, con el estado en Pendiente por defecto y tres fechas: la de la orden, la estimada de entrega y la de recepcion | **SU NUMERO ES NULLABLE Y SE ESCRIBE A MANOS**: el servicio inserta la cabecera sin numero y luego lo pone con un segundo UPDATE, porque si lo autogenerase el motor haria falta una secuencia | **ES LA TABLA DE LA QUE DEPENDE LA NOTA DEL PROVEEDOR, Y NO LLEGA NUNCA A ESTADO RECIBIDA**: hay indice sobre id_proveedor y estado, que es exactamente la pareja que necesita la nota, y el indice esta puesto para una consulta que no puede devolver nada | TIENE TRES CLAVES FORANEAS, id_proveedor, id_sucursal y ninguna mas, y NINGUNA CON ON DELETE, o sea que son RESTRICT. No se puede borrar un proveedor con ordenes, ni una sucursal con ordenes"],

    ["orden_compra_items", "Datos",
    "CAPA: Datos | FICHERO: la tabla | SEIS COLUMNAS, y es la unica del PROYECTO con un CHECK: cantidad es NOT NULL CHECK cantidad mayor que cero | **EL CHECK Y LA VALIDACION SON LO MISMO, Y ESTAN EN LOS DOS SITIOS**: el motor lo garantiza y el servicio lo comprueba antes de insertar. Es la unica restriccion declarativa del esquema, y la esta usando el unico sitio donde tiene sentido | SU CLAVE FORANEA A LA ORDEN ES CASCADE, de manera que anular o borrar la cabecera se lleva sus lineas. Las otras dos, a producto_talla_color y a la orden, se complementan | NO HAY INDICE SOBRE ELLA, y es la tabla mas consultada de las dos del documento, porque cada listado de orden las trae todas"],

    ["producto_talla_color", "Datos",
    "CAPA: Datos | FICHERO: la tabla | NO ES DE ESTE PAQUETE, Y AUNQUE ASI AMBOS SERVICIOS LA LEEN | ES LA QUE RESUELVE QUE ES UNA PRENDA: un producto no tiene talla ni color propios, tiene combinaciones, y el renglon de la orden apunta a la combinacion y no al producto | Y POR ESO EL ALTA DE UNA PRENDA GENERA UNA FILA POR COMBINACION, en el paquete 4. Las dos cosas son la misma tabla vista desde los dos lados"],

    ["PostgreSQL 16", "Datos",
    "CAPA: Datos | LAS CUATRO TABLAS DEL PAQUETE MAS LAS DOS QUE SOLO LEE, Y NINGUNA DE LAS CUATRO TIENE MAS DE 11 COLUMNAS | **LO UNICO QUE SOSTIENE AL PAQUETE ES EL UNICO CHECK DEL ESQUEMA**: el de orden_compra_items, que impide que una linea de compra pida cero prendas | Y LO QUE LE FALTA, ademas de las 4 columnas de proveedores, es la recepcion: las tablas recepciones y recepcion_items existen en el esquema, con sus seis y cinco columnas, y no hay ni un solo INSERT en las 145 clases del backend | Y NO HAY NINGUN CAMPO QUE DIGA CUANDO SE RECIBIO UNA PRENDA, porque fecha_recepcion esta en la orden y solo la escribe alguien que no existe"]
];


// ================================================================
// LAS 27 INTERFACES   [origen, destino, nombre, tipo, estereotipo]
// ================================================================

var REL = [
    ["AdminProveedores.tsx", "api.ts", "5 funciones, 1 de otro paquete", "Assembly", "llama"],
    ["AdminOrdenesCompra.tsx", "api.ts", "6 funciones, 1 por ruta", "Assembly", "llama"],

    ["api.ts", "CTR_Proveedores", "HTTP/JSON, 4 rutas", "Assembly", "expone"],
    ["api.ts", "CTR_Compras", "HTTP/JSON, 6 rutas de admin", "Assembly", "expone"],

    ["CTR_Proveedores", "SRV_ProveedoresService", "4 metodos, uno por ruta", "Dependency", "delega"],
    ["CTR_Proveedores", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_Proveedores", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["CTR_Compras", "SRV_ComprasService", "6 metodos, uno por ruta", "Dependency", "delega"],
    ["CTR_Compras", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_Compras", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["SRV_ProveedoresService", "SRV_BitacoraService", "registrar, con la nota antes y la nueva", "Dependency", "delega"],
    ["SRV_ComprasService", "SRV_BitacoraService", "registrar, 5 escrituras", "Dependency", "delega"],
    ["SRV_ProveedoresService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],
    ["SRV_ComprasService", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["SRV_ProveedoresService", "proveedores", "4 columnas que NO existen", "Assembly", "rompe"],
    ["SRV_ComprasService", "proveedores", "lee nombre y estado_riesgo", "Dependency", "consulta"],
    ["SRV_ProveedoresService", "ordenes_compra", "lee estado 'recibida', que nadie pone", "Dependency", "lee"],
    ["SRV_ComprasService", "ordenes_compra", "2 transacciones: cabecera y renglones", "Assembly", "escribe"],
    ["SRV_ComprasService", "orden_compra_items", "borra y reinserta los renglones", "Assembly", "escribe"],
    ["SRV_ComprasService", "producto_talla_color", "valida que la combinacion exista", "Dependency", "consulta"],

    ["SRV_ProveedoresService", "PostgreSQL 16", "13 llamadas, todas SQL a mano", "Assembly", "consulta"],
    ["SRV_ComprasService", "PostgreSQL 16", "13 llamadas, 2 con transaccion", "Assembly", "consulta"],

    ["CE_Modelos.ts (seguridad)", "PostgreSQL 16", "13 entidades, solo como tipo", "Assembly", "mapea"],
    ["proveedores", "PostgreSQL 16", "11 columnas, faltan 4 en el codigo", "Assembly", "apunta"],
    ["ordenes_compra", "PostgreSQL 16", "indice por id_proveedor y estado", "Assembly", "apunta"],
    ["orden_compra_items", "PostgreSQL 16", "el unico CHECK del esquema", "Assembly", "apunta"],
    ["producto_talla_color", "PostgreSQL 16", "la combinacion de talla y color", "Assembly", "apunta"]
];


// ================================================================
// DONDE CAE CADA COMPONENTE   [nombre, izquierda, arriba, ancho, alto]
// ================================================================

var DOND = [
    ["AdminProveedores.tsx", 55, 100, 270, 100],
    ["AdminOrdenesCompra.tsx", 350, 100, 270, 100],
    ["api.ts", 55, 220, 565, 100],

    ["CTR_Proveedores", 55, 450, 270, 110],
    ["CTR_Compras", 350, 450, 270, 110],

    ["SRV_ProveedoresService", 55, 690, 270, 110],
    ["SRV_ComprasService", 350, 690, 270, 110],

    ["dependencias.ts", 745, 100, 330, 300],
    ["SRV_BitacoraService", 745, 450, 330, 300],

    ["CE_Modelos.ts (seguridad)", 1185, 100, 470, 100],
    ["proveedores", 1185, 220, 470, 100],
    ["ordenes_compra", 1185, 340, 470, 100],
    ["orden_compra_items", 1185, 460, 470, 100],
    ["producto_talla_color", 1185, 580, 470, 100],
    ["PostgreSQL 16", 1185, 700, 470, 100]
];


function aviso(txt) {
    try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup(txt, 0, "Paquete 5 - Proveedores y Compras", 64);
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
    N.push("ARQUITECTURA DEL PAQUETE 5 - INFORME DE EJECUCION");
    N.push("Paquete 5: Gestion de Proveedores y Compras. Casos CU14, CU15 y CU16.");
    N.push("");
    N.push("Componentes:   " + creados + " de " + TOTAL_CMP);
    N.push("Interfaces:    " + enlaces + " de " + TOTAL_REL);
    N.push("Marcos:        " + marcosCreados + " de 6, y son Package reales");
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
    N.push("  deben ser 21 objetos con tamano: 15 componentes + 6 marcos.");
    N.push("");
    N.push("EL REPARTO DE LOS 15 COMPONENTES");
    N.push("  Presentacion        3   2 pantallas y el cliente HTTP");
    N.push("  Control             2   uno por cada modulo de NestJS");
    N.push("  Logica de Negocio  2   uno por cada modulo de NestJS");
    N.push("  Del Paquete 1       2   las guardas y la bitacora");
    N.push("  Datos               6   4 tablas propias, 1 que solo lee y el motor");
    N.push("");
    N.push("EL REPARTO DE LAS 27 INTERFACES");
    N.push("  pantalla -> cliente HTTP      2   una por pantalla");
    N.push("  cliente -> control            2   las 10 rutas, en dos bloques");
    N.push("  dependencias de codigo       10   los statements import");
    N.push("  hacia las tablas              6   1 de ellas rota, marcada");
    N.push("  hacia PostgreSQL 16           7   2 servicios y 5 entidades");
    N.push("");
    N.push("EL CONECTOR MARCADO COMO ROMPE, Y POR QUE");
    N.push("");
    N.push("  El conector de SRV_ProveedoresService a la tabla proveedores");
    N.push("  lleva el estereotipo rompe, y es el UNICO del diagrama.");
    N.push("");
    N.push("  EN schema.sql, proveedores TIENE 11 COLUMNAS:");
    N.push("    id_proveedor, nombre_empresa, persona_contacto, telefono,");
    N.push("    email, direccion, observaciones, tiempo_entrega_dias,");
    N.push("    estado_riesgo, calidad_score, fecha_registro");
    N.push("");
    N.push("  Y EL CODIGO USA CUATRO QUE NO ESTAN:");
    N.push("    nit_ruc                    0 apariciones en el esquema");
    N.push("    condiciones_comerciales    0 apariciones en el esquema");
    N.push("    score_fecha                0 apariciones en el esquema");
    N.push("    id_ciudad                  la tabla no la tiene");
    N.push("");
    N.push("  Y NO ES QUE EL CODIGO LAS USE DE PASO:");
    N.push("    CTR_Proveedores L27   el DTO EXIGE nit_ruc como obligatorio");
    N.push("    AdminProveedores L148  la pantalla tiene el campo de formulario");
    N.push("    AdminProveedores L643  y la columna en la tabla de la pantalla");
    N.push("    SRV_Proveedores L208  el servicio comprueba su unicidad");
    N.push("                              con un SELECT COUNT antes de insertar");
    N.push("    SRV_Proveedores L221  el INSERT escribe 3 de ellas");
    N.push("    SRV_Proveedores L333  el UPDATE escribe score_fecha");
    N.push("    api.ts L378-398       el cliente declara los tres tipos");
    N.push("  Son 8 sitios de punta a punta, de la pantalla al UPDATE.");
    N.push("");
    N.push("  CONSECUENCIA, RUTA POR RUTA DE LAS 4 DEL MODULO:");
    N.push("");
    N.push("    GET                       FUNCIONA");
    N.push("    PATCH :id/estado          FUNCIONA, usa estado_riesgo, que si");
    N.push("                               existe. Es el estado de bloqueo");
    N.push("    POST                      NO FUNCIONA, el INSERT nombra 3");
    N.push("                               columnas de mas. Es el caso CU14");
    N.push("    POST :id/recalcular_score  NO FUNCIONA, y por dos motivos");
    N.push("");
    N.push("  O SEA QUE DE LOS 3 CASOS DEL PAQUETE, UNO FUNCIONA ENTERO.");
    N.push("");
    N.push("  Y LA CUARTA RUTA FALLA POR UN SEGUNDO MOTIVO, UNA CADENA");
    N.push("  DE TRES ESLABONES ROTOS:");
    N.push("");
    N.push("    1. calcularScore filtra ordenes_compra por estado 'recibida'");
    N.push("    2. NADIE ESCRIBE estado 'recibida': 0 escrituras en 145 clases");
    N.push("    3. NADIE ESCRIBE en recepciones ni en recepcion_items: 0 INSERT");
    N.push("");
    N.push("  O SEA QUE LA NOTA DEL PROVEEDOR NO SE PUEDE CALCULAR NI");
    N.push("  SIQUIERA EXISTIERA LA COLUMNA, porque no hay ninguna orden");
    N.push("  recibida. Y CU17, que es el caso de la recepcion, no tiene");
    N.push("  ninguna linea de codigo que lo implemente.");
    N.push("");
    N.push("  Y LA PANTALLA LO MUESTRA: AdminOrdenesCompra tiene la insignia");
    N.push("  verde de 'Recibida' preparada, y ninguna ruta la produce.");
    N.push("");
    N.push("  LO QUE SI FUNCIONA, Y HAY TRES COSAS CONCRETAS");
    N.push("");
    N.push("  EL BLOQUEO CON CONDICION. Antes de poner un proveedor en");
    N.push("  Bloqueado, el servicio mira si tiene ordenes en un estado");
    N.push("  distinto de procesada, recibida, anulada o cancelada, y si las");
    N.push("  tiene lo rechaza con un mensaje que explica que hacer. Es la");
    N.push("  regla de negocio mas cuidada del proyecto.");
    N.push("");
    N.push("  LAS DOS TRANSACCIONES. Crear y modificar una orden envuelven la");
    N.push("  cabecera y los renglones en dataSource.transaction, y por eso");
    N.push("  no queda nunca una orden sin sus lineas. El numero se pone en");
    N.push("  un segundo UPDATE, y como va dentro de la transaccion, o se");
    N.push("  escribe entero o no se escribe.");
    N.push("");
    N.push("  EL UNICO CHECK DEL ESQUEMA. orden_compra_items.cantidad es NOT");
    N.push("  NULL CHECK cantidad mayor que cero, y el servicio ademas lo");
    N.push("  comprueba en el bucle. Motor y codigo dicen lo mismo. Es la");
    N.push("  unica restriccion declarativa del proyecto, y esta en el sitio");
    N.push("  donde de verdad puede evitar un dato malo.");
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
    U.push("PAQUETE 5 - Proveedores y Compras");
    U.push("CU14, CU15 y CU16   ·   2 modulos de NestJS");
    U.push("");
    U.push("Componentes:   " + creados + " de " + TOTAL_CMP);
    U.push("Interfaces:    " + enlaces + " de " + TOTAL_REL);
    U.push("Marcos:        " + marcosCreados + " de 6");
    U.push("Huerfanos:     " + huerfanos);
    U.push("Errores:       " + ERRORES.length);
    U.push("");
    U.push("LEIDO DEL DIAGRAMA:");
    U.push("  tipo:       " + tipoDiag);
    U.push("  objetos:    " + nObj);
    U.push("  con tamano: " + conTam + "   (deben ser 21)");
    U.push("  lineas:     " + nLin);
    U.push("");
    U.push("FALLO CONFIRMADO:");
    U.push("  proveedores tiene 11 columnas y el codigo usa 4");
    U.push("  que no estan: nit_ruc, condiciones_comerciales,");
    U.push("  score_fecha e id_ciudad. CU14 no funciona.");
    U.push("  Y recalcular_score falla por partida doble, porque");
    U.push("  nadie pone una orden en estado 'recibida'.");
    U.push("");
    U.push("1 de los 3 casos del paquete funciona entero.");
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
