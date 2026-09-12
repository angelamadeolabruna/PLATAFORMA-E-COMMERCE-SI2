// ================================================================
// ANÁLISIS ARQUITECTÓNICO — PAQUETES + CASOS DE USO (trace)
// Tiendas Montaño | 6 paquetes | CU del Ciclo 1 (CU01-CU27)
// La flecha punteada «trace» indica que el CU pertenece al paquete.
// Ejecutar en EA: Scripting > JScript > Run
// Requiere que los 6 sub-paquetes ya existan (ejecuta antes
// paquetes_ciclo1.js si es necesario; este script los reutiliza).
// ================================================================

function main()
{
    var selectedObject = Repository.GetTreeSelectedObject();
    var pkg;
    if (selectedObject.ObjectType == 4) { pkg = selectedObject; }
    else { pkg = Repository.Models.GetAt(0); }

    // -------------------------------------------------------
    // HELPERS
    // -------------------------------------------------------
    // Crea (o reutiliza) el ELEMENTO CASO DE USO dentro del paquete visual
    function upsertCU(paqueteElem, nombreCU, codigo) {
        // Buscar si ya existe un elemento UseCase en el paquete con ese nombre
        for (var i = 0; i < paqueteElem.Elements.Count; i++) {
            var ee = paqueteElem.Elements.GetAt(i);
            if (ee.Name == nombreCU) { return ee; }
        }
        var cu = paqueteElem.Elements.AddNew(nombreCU, "UseCase");
        cu.Update();
        return cu;
    }

    // Posiciona un elemento dentro del diagrama
    function pos(diagram, elemento, l, t, r, b) {
        var obj = diagram.DiagramObjects.AddNew("l="+l+";r="+r+";t="+t+";b="+b+";", "");
        obj.ElementID = elemento.ElementID;
        obj.Update();
    }

    // Crea un enlace visual (conector) entre dos elementos ya posicionados
    function link(diagram, aId, bId, tipo, estereotipo) {
        var conn = diagram.Connectors.AddNew("", tipo);
        if (estereotipo) { conn.Stereotype = estereotipo; }
        conn.SupplierID = bId;
        conn.ClientID = aId;
        conn.Update();
        var dl = diagram.DiagramLinks.AddNew("", "");
        dl.ConnectorID = conn.ConnectorID;
        dl.Update();
    }

    // Encuentra el paquete visual (Element Package) por nombre en el diagrama
    function paqueteVisualPorNombre(nombre) {
        for (var i = 0; i < diagram.DiagramObjects.Count; i++) {
            var dobj = diagram.DiagramObjects.GetAt(i);
            var el = Repository.GetElementByID(dobj.ElementID);
            if (el.Type == "Package" && el.Name == nombre) { return el; }
        }
        return null;
    }

    // -------------------------------------------------------
    // USAR / CREAR DIAGRAMA
    // -------------------------------------------------------
    var diagram = null;
    for (var d = 0; d < pkg.Diagrams.Count; d++) {
        var dd = pkg.Diagrams.GetAt(d);
        if (dd.Name == "Análisis Arquitectónico - Paquetes Ciclo 1") { diagram = dd; }
    }
    if (diagram == null) {
        diagram = pkg.Diagrams.AddNew("Análisis Arquitectónico - Paquetes Ciclo 1", "Logical");
        diagram.Update();
    }

    // -------------------------------------------------------
    // CU POR PAQUETE (Ciclo 1)
    // -------------------------------------------------------
    var mapCUs = {
        "1. Seguridad y Auditoría": [
            "CU01 Iniciar sesión en la plataforma",
            "CU02 Cerrar sesión activa",
            "CU03 Registrar nuevo cliente",
            "CU04 Cambiar contraseña propia",
            "CU05 Recuperar contraseña olvidada",
            "CU06 Establecer primera contraseña",
            "CU11 Consultar bitácora de auditoría"
        ],
        "2. Gestión de Usuarios y Roles": [
            "CU07 Registrar nuevo empleado",
            "CU08 Asignar/modificar roles y permisos",
            "CU09 Inhabilitar empleado",
            "CU10 Rehabilitar empleado"
        ],
        "3. Gestión de Sucursales": [
            "CU12 Administrar ciudades y sucursales",
            "CU17 Consultar disponibilidad por sucursal"
        ],
        "4. Gestión de Catálogo": [
            "CU13 Registrar producto de ropa en el catálogo",
            "CU14 Gestionar tallas, colores y categorías",
            "CU15 Gestionar temporadas y colecciones",
            "CU16 Consultar catálogo con filtros"
        ],
        "5. Gestión de Proveedores y Compras": [
            "CU18 Registrar proveedor",
            "CU19 Inhabilitar/bloquear proveedor",
            "CU20 Evaluar y puntuar proveedores",
            "CU21 Elaborar orden de compra a proveedor",
            "CU22 Registrar recepción física de prendas"
        ],
        "6. Gestión de Inventario y Almacén": [
            "CU23 Consultar Kardex dinámico",
            "CU24 Registrar ajuste manual o merma",
            "CU25 Configurar alertas de stock mínimo",
            "CU26 Consultar existencias consolidadas",
            "CU27 Respaldar información a storage externo"
        ]
    };

    // Posiciones de los 6 paquetes (deben coincidir con paquetes_ciclo1.js)
    var posPkg = {
        "1. Seguridad y Auditoría":          {l:30,  t:30,  r:350, b:250},
        "2. Gestión de Usuarios y Roles":     {l:400, t:30,  r:720, b:250},
        "4. Gestión de Catálogo":             {l:770, t:30,  r:1090,b:250},
        "3. Gestión de Sucursales":           {l:30,  t:310, r:350, b:460},
        "5. Gestión de Proveedores y Compras":{l:400, t:310, r:720, b:460},
        "6. Gestión de Inventario y Almacén": {l:770, t:310, r:1090,b:460}
    };

    // -------------------------------------------------------
    // DIBUJAR CU DENTRO DE CADA PAQUETE + TRACE
    // -------------------------------------------------------
    for (var nombrePkg in mapCUs) {
        var pkgEl = paqueteVisualPorNombre(nombrePkg);
        if (pkgEl == null) {
            Session.Output("NO SE ENCONTRÓ el paquete visual: " + nombrePkg);
            continue;
        }
        var ppos = posPkg[nombrePkg];
        var lista = mapCUs[nombrePkg];
        var altura = 28;
        var count = lista.length;
        // Espacio interior del paquete (deja margen del borde)
        var x0 = ppos.l + 12;
        var w  = (ppos.r - ppos.l) - 24;
        var y  = ppos.t + 20;
        var altoCU = 24;

        for (var i = 0; i < count; i++) {
            var nombreCU = lista[i];
            var cuEl = upsertCU(pkgEl, nombreCU, nombreCU);
            // Posicionar dentro del paquete (apilados)
            pos(diagram, cuEl, x0, y + i * (altoCU+4), x0 + w, y + i * (altoCU+4) + altoCU);
            // Conector trace: del CU al paquete
            link(diagram, cuEl.ElementID, pkgEl.ElementID, "Dependency", "trace");
        }
    }

    // -------------------------------------------------------
    Session.Output("=============================================");
    Session.Output("PAQUETES + CASOS DE USO (trace)");
    Session.Output("=============================================");
    Session.Output("1. Seguridad y Auditoría (CU01-CU06, CU11)");
    Session.Output("2. Usuarios y Roles (CU07-CU10)");
    Session.Output("3. Sucursales (CU12, CU17)");
    Session.Output("4. Catálogo (CU13-CU16)");
    Session.Output("5. Proveedores y Compras (CU18-CU22)");
    Session.Output("6. Inventario y Almacén (CU23-CU27)");
    Session.Output("=============================================");
    Session.Output("27 CU creados/conectados vía «trace».");
    Session.Output("Si algún CU ya existía, se reutilizó.");
    Session.Output("=============================================");
}

main();
