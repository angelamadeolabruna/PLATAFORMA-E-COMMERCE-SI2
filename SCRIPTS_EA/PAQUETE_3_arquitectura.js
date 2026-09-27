// ================================================================
// PAQUETE 3  ·  ARQUITECTURA DEL SUBSISTEMA
// Gestion de Sucursales  ·  CU09
// E-COMMERCE TIENDAS MONTAÑO   ·   Seccion 5.3.3
//
// QUE DIBUJA
//   El diagrama de componentes del paquete 3, con los 9 componentes
//   del subsistema y las 11 interfaces entre ellos, y TODO DENTRO de
//   un marco que se llama PAQUETE 3 - SUCURSALES.
//
//   Es el paquete mas pequeno de los tres documentados: 1 caso de uso,
//   1 pantalla, 1 controlador, 1 servicio y 2 tablas propias.  Y no
//   tiene ni un componente externo, a diferencia del 1 y el 2.
//
//   9 componentes:  2 de presentacion, 1 de control, 1 de logica,
//                   2 del paquete 1 y 3 de datos
//   11 interfaces
//
// PATRON COPIADO DE CAPAS_diagrama_por_capas.js, QUE SI DIBUJA BIEN
//   -  Los marcos son Package REALES del modelo, con Sequence = 1
//      para que EA los deje DETRAS del contenido.  El nombre del
//      Package es la etiqueta del marco.  No son formas.
//   -  LAS COORDENADAS VERTICALES VAN EN NEGATIVO.
//   -  DOS PASADAS con guardarYRecargar entre ellas.
//   -  El conector se coloca con con.DiagramID = diag.ID.
//
// EL HALLAZGO DE ESTE PAQUETE
//   La entidad Ciudad declara 5 columnas y schema.sql declara 4.  La
//   quinta, departamento, no existe en el esquema, y el servicio la
//   pide en un SELECT escrito a mano.  Con synchronize: false,
//   TypeORM nunca la crea.  Es el tercer fallo confirmado de modelo
//   de datos del proyecto, y es el mas grave de los tres, porque los
//   otros dos son propiedades que el codigo escribe y este es una
//   columna que el codigo LEE, en un SELECT explicito.  Eso no falla
//   en silencio: falla con error.
//
//   Y CUANDO OCURRE: en GET admin/ciudades, o sea en la linea 81 del
//   servicio, que es lo primero que pinta la pantalla de 780 lineas.
//   O sea que CU09 no funciona contra una base de datos creada con
//   el esquema del proyecto.
//
// Aviso con WScript.Shell.Popup.  Sin llamadas a SQL y sin
// SaveDiagram.  Una instruccion por linea.  Sin continuaciones.
// Ninguna excepcion escapa.
// ================================================================


var SALTO = String.fromCharCode(10);
var RAIZ = Repository.Models.GetAt(0);

var PAQ_NOMBRE = "Paquete 3 - Sucursales";
var DIAG_NOMBRE = "Arquitectura del Paquete 3";

var TOTAL_CMP = 9;
var TOTAL_REL = 11;
var TOTAL_CAP = 5;

var ERRORES = [];
var INFORME = [];

var MARCO_NOMBRE = "PAQUETE 3 - GESTION DE SUCURSALES";
var MARCO_X = 10;
var MARCO_Y = 10;
var MARCO_W = 1120;
var MARCO_H = 790;
var MARCO_COLOR = 15132358;

// nombre, izquierda, arriba, ancho, alto, color
var CAPAS = [
    ["Presentacion", 30, 60, 500, 200, 13421823],
    ["Control", 30, 300, 500, 190, 13434879],
    ["Logica de Negocio", 30, 530, 500, 190, 13434828],
    ["Del Paquete 1", 570, 60, 500, 180, 16777164],
    ["Datos", 570, 280, 500, 440, 16770790]
];


// ================================================================
// LOS 9 COMPONENTES   [nombre, capa, nota]
// ================================================================

var PAQ = [

    ["Sucursales.tsx", "Presentacion",
    "CAPA: Presentacion | CASO: CU09 Administrar Ciudades y Sucursales | FICHERO: web/src/pages/admin/Sucursales.tsx, 780 lineas: es la TERCERA pantalla mas larga del frontend, despues de Producto.tsx con 831 y de AdminOrdenesCompra.tsx con 794, y es la de UN SOLO CASO DE USO | LLAMA: ocho funciones, api.listarCiudades, api.crearCiudad, api.actualizarCiudad, api.cambiarEstadoCiudad, api.listarSucursales, api.crearSucursal, api.actualizarSucursal y api.cambiarEstadoSucursal | LAS OCHO FUNCIONES CORRESPONDEN A LAS OCHO RUTAS DEL CONTROLADOR, una a una. Es el unico paquete del proyecto donde la pantalla cubre todas las rutas, sin que sobre ninguna y sin que falte ninguna | LA PANTALLA TIENE DOS FORMULARIOS Y DOS TABLAS, y ademas pinta el conteo de sucursales por ciudad, que el servicio calcula con un subconsulta | EL CAMPO SE LLAMA departamento, y sale con ese nombre en el formulario, en la cabecera de la tabla y en las 24 apariciones suyas"],

    ["api.ts", "Presentacion",
    "CAPA: Presentacion | FICHERO: web/src/lib/api.ts | EL CLIENTE HTTP DEL PAQUETE | OCHO rutas del paquete, todas bajo el prefijo admin: cuatro de ciudades y cuatro de sucursales | COMO LLAMA: fetch con credentials: 'include', para que viaje la cookie httpOnly | LO QUE APORTA DE ESTE PAQUETE: declara el tipo Ciudad con un campo departamento, y las dos funciones de alta y modificacion lo envian en el cuerpo. O sea que el nombre del campo viaja desde la pantalla hasta el servicio, y de ahi al SQL"],

    ["CTR_Sucursales", "Control",
    "CAPA: Control | CASO: CU09 | FICHERO: api/src/modulos/seguridad/CTR_Sucursales.ts | @Controller('admin') con @UseGuards(JwtAuthGuard) A NIVEL DE CLASE, o sea que las ocho rutas quedan protegidas de una vez | RUTAS: cuatro de ciudades y cuatro de sucursales, y las cuatro son siempre las mismas operaciones en el mismo orden. GET para listar, POST para dar de alta, PUT para modificar y PATCH para cambiar el estado. Es el unico paquete con un CRUD tan regular que las ocho rutas se leen de memoria | **NO HAY RUTA DE BORRADO, NI PARA CIUDADES NI PARA SUCURSALES**: no hay DELETE en ninguna de las ocho. El estado se cambia con un PATCH, y no se borra nada. En el esquema, once tablas tienen clave foranea hacia sucursales, y solo una tiene ON DELETE CASCADE, de manera que borrar una sucursal con datos seria un error de integridad. El modelo y el codigo estan de acuerdo en que no se borra | DECLARA SUS PROPIOS DTOs DENTRO del fichero, con las reglas de class-validator al lado, como CTR_Roles y al contrario que CTR_Cliente | LAS REGLAS TIENEN MENSAJE EN CASTELLANO, uno por regla, y son la validacion mas completa del proyecto: nombre obligatorio y de 80 caracteres como maximo, departamento obligatorio y de 60, direccion obligatoria, telefono opcional de 30, y el estado obligatorio. Son quince mensajes distintos en un solo controlador"],

    ["SRV_SucursalesService", "Logica de Negocio",
    "CAPA: Logica de Negocio | FICHERO: api/src/modulos/seguridad/SRV_SucursalesService.ts, 467 LINEAS | METODOS PUBLICOS: 8, que son las ocho rutas. Y uno PRIVADO, que es el que no se ve desde fuera | **TIENE SU PROPIA COMPROBACION DE PERMISOS, Y ES EL UNICO SERVICIO QUE LO HACE**: un metodo privado verificarPermiso, que en la linea 73 lanza ForbiddenException con el texto No tienes permiso para gestionar sucursales. O sea que el proyecto tiene TRES maneras distintas de comprobar un permiso: la guarda JwtAuthGuard del paquete 1, el servicio de roles del paquete 2, y esta. Ninguna de las tres se apoya en las otras | **MEZCLA REPOSITORIOS Y SQL ESCRITO A MANO**, y este es el unico servicio de los tres paquetes que lo hace. Tres consultas van por dataSource.query y el resto por repositorio | LAS TRES CONSULTAS A MANO SON: el listado de ciudades, que cuenta las sucursales de cada una con un subconsulta; el listado de sucursales, que trae el nombre de la ciudad con una union; y **LA QUE IMPORTA, que cuenta el stock antes de dejar desactivar una sucursal** | **LA REGLA DE NEGOCIO MAS INTERESANTE DEL PROYECTO ESTA AQUI**: cambiarEstadoSucursal hace un SELECT COUNT sobre inventario_stock, y si encuentraExistencias lanza ConflictException. Es la unica regla del sistema que consulta el dato de otro paquete para decidir si puede operar, y esta en el paquete mas pequeno | TAMBIEN ES EL MAS RIGUROSO CON LA AUDITORIA**: guarda el estado ANTERIOR de la fila en oldData, en las cuatro operaciones de ciudad y las cuatro de sucursal. O sea que ocho de las ocho operaciones dejan rastro de lo que habia antes"],

    ["dependencias.ts", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/dependencias.ts, 148 lineas | LO USA PARA LAS DOS COSAS: la guarda, montada a nivel de clase, y UsuarioActual, que las cuatro rutas de listado necesitan para saber quien pregunta y que permiso tiene | **AUN ASI, ESTE PAQUETE COMPRUEBA EL PERMISO OTRA VEZ POR SU CUENTA**, en el servicio. O sea que la guarda deja pasar y el servicio vuelve a preguntar. Son dos capas de comprobacion para el mismo permiso, y la segunda es la que de verdad decide"],

    ["SRV_BitacoraService", "Del Paquete 1",
    "CAPA: Del Paquete 1 | FICHERO: api/src/modulos/seguridad/SRV_BitacoraService.ts, 40 lineas | LO USA EN LAS CUATRO OPERACIONES DE CIUDAD Y LAS CUATRO DE SUCURSAL, y en las ocho le pasa el estado anterior y el nuevo | ES LO QUE HACE QUE CU09 SEA EL PAQUETE MEJOR AUDITADO DEL PROYECTO: es el unico donde las ocho rutas guardan el antes y el despues, y donde la bitacora dice que cambio, no solo que se toco algo"],

    ["CE_Modelos.ts (seguridad)", "Datos",
    "CAPA: Datos | FICHERO: api/src/modulos/seguridad/CE_Modelos.ts | **AQUI ESTA EL FALLO DEL PAQUETE**: la entidad Ciudad declara CINCO columnas, id_ciudad, nombre, pais, departamento y estado, y schema.sql declara CUATRO. La quinta, departamento, no existe en el esquema, y el fichero tiene CERO apariciones de la palabra departamento | Y LA COLUMNA QUE SI ESTA EN LOS DOS ESTA MUERTA: pais, en la linea 119, con DEFAULT Bolivia, no la pide ningun DTO, ningun servicio la consulta y la pantalla no la muestra. O sea que la base de datos tiene un pais que nadie ve, y el codigo pide un departamento que no existe | LA ENTIDAD Sucursal SI ESTA COMPLETA: siete columnas, con id_ciudad como clave foranea SIN ON DELETE, o sea que es RESTRICT. No se puede borrar una ciudad que tenga sucursales | synchronize: false, de modo que TypeORM nunca crea ni renombra una columna. El esquema lo manda schema.sql"],

    ["inventario_stock", "Datos",
    "CAPA: Datos | FICHERO: la tabla, no el componente que la escribe | **ESTA TABLA NO ES DE ESTE PAQUETE, Y AUNQUE ASI EL SERVICIO LA LEE**: la linea 400 hace un SELECT COUNT sobre ella para decidir si deja desactivar una sucursal | ES LA DEPENDENCIA CRUZADA MAS ALTA DEL PROYECTO EN ESTE PAQUETE, y va en el sentido correcto: un paquete de cities decide sobre el dato del paquete de inventario, y no al reves. El servicio de inventario no sabe que existen las sucursales | TIENE UNA REGLA QUE ESTE PAQUETE RESPETA Y QUE NO SE PUEDE VER: el stock se lleva por id_ptc e id_sucursal, y por eso una sucursal con stock no se puede desactivar. Si la regla no estuviera en el servicio, el stock se quedaria huerfano de una sucursal desactivada"],

    ["PostgreSQL 16", "Datos",
    "CAPA: Datos | LAS DOS TABLAS PROPIAS SON 3 Y 7 COLUMNAS: ciudades, con 4 en el esquema, y sucursales, con 7. LAS DOS TIENEN UN ESTADO CON DEFAULT Activa, y es el patron de baja logica que usa todo el proyecto | LAS ONCE CLAVES FORANEAS QUE APUNTAN A sucursales: sucursal_horarios, usuarios_empleados, ordenes_compra, inventario_stock, recepciones, alertas_stock_config, reservas, carritos, ventas, movimientos_inventario y devoluciones. **UNA SOLA TIENE ON DELETE CASCADE**, que es sucursal_horarios. Las otras diez son RESTRICT | ESTO ES LO QUE HACE QUE NO HAYA RUTA DE BORRADO: con diez de once en RESTRICT, un DELETE sobre sucursales con cualquier dato Would fallar. El modelo y el codigo tomaron la misma decision por separado | LA QUE SE PASA SIN INDICE: reservas.id_sucursal. El indice que hay sobre reservas, idx_reservas_cliente, esta sobre id_usuario, que es el EMPLEADO que preparo la reserva, no el cliente. Y id_sucursal aparece 75 veces en el modulo de reservas, en 2 ficheros"]
];


// ================================================================
// LAS 11 INTERFACES   [origen, destino, nombre, tipo, estereotipo]
// ================================================================

var REL = [
    ["Sucursales.tsx", "api.ts", "8 funciones, 1 por ruta", "Assembly", "llama"],
    ["api.ts", "CTR_Sucursales", "HTTP/JSON, 8 rutas de admin", "Assembly", "expone"],

    ["CTR_Sucursales", "SRV_SucursalesService", "8 metodos, uno por ruta", "Dependency", "delega"],
    ["CTR_Sucursales", "dependencias.ts", "JwtAuthGuard y UsuarioActual", "Dependency", "importa"],
    ["CTR_Sucursales", "CE_Modelos.ts (seguridad)", "Usuario", "Dependency", "importa"],

    ["SRV_SucursalesService", "SRV_BitacoraService", "registrar, 8 llamadas con el antes", "Dependency", "delega"],
    ["SRV_SucursalesService", "CE_Modelos.ts (seguridad)", "Ciudad y Sucursal", "Dependency", "importa"],
    ["SRV_SucursalesService", "inventario_stock", "SELECT COUNT, no deja desactivar", "Dependency", "consulta"],
    ["SRV_SucursalesService", "PostgreSQL 16", "TypeORM y 3 consultas escritas a mano", "Assembly", "consulta"],

    ["CE_Modelos.ts (seguridad)", "PostgreSQL 16", "13 entidades, 5 en Ciudad", "Assembly", "mapea"],
    ["inventario_stock", "PostgreSQL 16", "id_sucursal, parte de su clave primaria", "Assembly", "apunta"]
];


// ================================================================
// DONDE CAE CADA COMPONENTE   [nombre, izquierda, arriba, ancho, alto]
// ================================================================

var DOND = [
    ["Sucursales.tsx", 55, 100, 220, 120],
    ["api.ts", 290, 100, 220, 120],

    ["CTR_Sucursales", 55, 340, 450, 120],

    ["SRV_SucursalesService", 55, 570, 450, 120],

    ["dependencias.ts", 595, 100, 220, 120],
    ["SRV_BitacoraService", 830, 100, 220, 120],

    ["CE_Modelos.ts (seguridad)", 595, 320, 450, 110],
    ["inventario_stock", 595, 460, 450, 110],
    ["PostgreSQL 16", 595, 600, 450, 90]
];


function aviso(txt) {
    try {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup(txt, 0, "Paquete 3 - Sucursales", 64);
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
    N.push("ARQUITECTURA DEL PAQUETE 3 - INFORME DE EJECUCION");
    N.push("Paquete 3: Gestion de Sucursales. Caso CU09, y solo ese.");
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
    N.push("  deben ser 15 objetos con tamano: 9 componentes + 6 marcos.");
    N.push("");
    N.push("EL REPARTO DE LOS 9 COMPONENTES");
    N.push("  Presentacion        2   1 pantalla y el cliente HTTP");
    N.push("  Control             1   CTR_Sucursales");
    N.push("  Logica de Negocio  1   SRV_SucursalesService");
    N.push("  Del Paquete 1       2   las guardas y la bitacora");
    N.push("  Datos               3   las entidades, el stock y el motor");
    N.push("");
    N.push("  Es el paquete mas pequeno: 9 componentes frente a los 20 del");
    N.push("  paquete 1 y los 19 del paquete 2. Y el unico SIN NINGUN");
    N.push("  COMPONENTE EXTERNO, porque no habla con nadie de fuera.");
    N.push("");
    N.push("EL HALLAZGO: LA ENTIDAD TIENE 5 COLUMNAS Y EL ESQUEMA 4");
    N.push("");
    N.push("  La entidad Ciudad declara id_ciudad, nombre, pais,");
    N.push("  departamento y estado. schema.sql declara id_ciudad, nombre,");
    N.push("  pais y estado. La quinta, departamento, NO EXISTE.");
    N.push("");
    N.push("  Y NO ES QUE NADIE LA USE. Hay 0 apariciones de departamento");
    N.push("  en schema.sql, y en cambio:");
    N.push("    CE_Modelos.ts L122  la declara como columna mapeada");
    N.push("    SRV_SucursalesService L81  la pide en un SELECT escrito a mano");
    N.push("    CTR_Sucursales L28-30  la valida como obligatoria, de 60 caracteres");
    N.push("    api.ts L1161 y L1170  la envia en el cuerpo de las dos rutas");
    N.push("    Sucursales.tsx  la pinta con ese nombre en 24 sitios");
    N.push("");
    N.push("  Con synchronize: false, TypeORM nunca la crea. O sea que la");
    N.push("  columna no existe y el servicio la pide en un SELECT explicito.");
    N.push("  Eso no falla en silencio: falla con error de columna.");
    N.push("");
    N.push("  CUANDO OCURRE: en GET admin/ciudades, la linea 81 del servicio,");
    N.push("  que es lo primero que pinta la pantalla de 780 lineas. O SEA");
    N.push("  QUE CU09 NO FUNCIONA CONTRA UNA BASE DE DATOS CREADA CON EL");
    N.push("  ESQUEMA DEL PROYECTO. Y no hay forma de que funcione, porque");
    N.push("  la tabla se crea con schema.sql y no hay migracion que la anada.");
    N.push("");
    N.push("  LA COLUMNA QUE SI ESTA EN LOS DOS ESTA MUERTA: pais, con");
    N.push("  DEFAULT Bolivia, no la pide ningun DTO, no la consulta ningun");
    N.push("  servicio y no la muestra la pantalla. La base de datos tiene");
    N.push("  un pais que nadie ve, y el codigo pide un departamento que");
    N.push("  no existe. Uno de los dos sobra, y el error es del segundo.");
    N.push("");
    N.push("  ESTE ES EL TERCER FALLO CONFIRMADO DE MODELO DE DATOS. Los");
    N.push("  otros dos, sesiones_ra.foto_resultado y carritos.token_invitado,");
    N.push("  son propiedades que el codigo ESCRIBE. Este es una columna que");
    N.push("  el codigo LEE, en un SELECT explicito, y por eso es el que mas");
    N.push("  duele de los tres.");
    N.push("");
    N.push("LO QUE ESTA BIEN EN ESTE PAQUETE");
    N.push("");
    N.push("  LA REGLA DE NEGOCIO: desactivarSucursal cuenta el stock de");
    N.push("  inventario_stock y, si hay, lanza ConflictException. Es la");
    N.push("  unica regla del proyecto que consulta el dato de otro paquete");
    N.push("  para decidir si puede operar. Y va en el sentido correcto: el");
    N.push("  servicio de inventario no sabe que existen las sucursales.");
    N.push("");
    N.push("  LA AUDITORIA: las 8 operaciones guardan el estado anterior de");
    N.push("  la fila, en las 8. Es el paquete donde la bitacora dice que");
    N.push("  cambio, y no solo que se toco algo.");
    N.push("");
    N.push("  LA COHERENCIA DEL BORRADO: no hay ruta de DELETE ni para");
    N.push("  ciudades ni para sucursales. Con 10 de las 11 claves foraneas");
    N.push("  que apuntan a sucursales en RESTRICT, un DELETE con cualquier");
    N.push("  dato seria un error de integridad. El codigo y el modelo");
    N.push("  tomaron la misma decision por separado, que es lo que se");
    N.push("");
    N.push("LO QUE NO ESTA BIEN, Y TAMBIEN SE VE");
    N.push("");
    N.push("  TERCER MECANISMO DE PERMISOS. La guarda JwtAuthGuard deja");
    N.push("  pasar, y despues el servicio vuelve a comprobar el permiso con");
    N.push("  un metodo PRIVADO suyo, el unico del proyecto que lo hace. Son");
    N.push("  tres capas distintas para lo mismo, y ninguna se apoya en otra.");
    N.push("");
    N.push("  MEZCLA REPOSITORIOS Y SQL A MANO. Es el unico servicio de los");
    N.push("  tres paquetes que escribe SQL en vez de usar el repositorio, y");
    N.push("  lo hace en 3 de sus 8 metodos.");
    N.push("");
    N.push("  EL INDICE MAL PUESTO. reservas.id_sucursal no tiene indice,");
    N.push("  y el indice que hay sobre reservas, idx_reservas_cliente, esta");
    N.push("  sobre id_usuario, que es el EMPLEADO que preparo la reserva y");
    N.push("  no el cliente. Y id_sucursal aparece 75 veces en el modulo.");
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
    U.push("PAQUETE 3 - Gestion de Sucursales  (solo CU09)");
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
    U.push("  con tamano: " + conTam + "   (deben ser 15)");
    U.push("  lineas:     " + nLin);
    U.push("");
    U.push("FALLO CONFIRMADO:");
    U.push("  La entidad Ciudad declara 5 columnas y schema.sql 4.");
    U.push("  Falta 'departamento', y el servicio la pide en un SELECT.");
    U.push("  CU09 no funciona contra el esquema del proyecto.");
    U.push("");
    if (conTam < 15) U.push("AVISO: menos de 15 con tamano. Copia este texto y pegamelo.");
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
