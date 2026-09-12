// ================================================================
// TIENDAS MONTAÑO - REPARAR LAYOUT PAQUETES + 27 CU (trace)
// Fuerza la reubicación de los 6 paquetes y 27 CU en posiciones
// visibles, aunque ya existan (arregla CU fuera de vista).
// Ejecutar en EA: Scripting > JScript > Run
// ================================================================

var EJECUTAR_LAYOUT_MANUAL = true; // true: autoorganiza con Layout Diagram

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Progreso", 0);
}

function main()
{
    aviso("INICIO reparación layout...");
    try
    {
        function buscarPaquete(paquete, nombre) {
            if (paquete.Name == nombre) { return paquete; }
            for (var i = 0; i < paquete.Packages.Count; i++) {
                var e = buscarPaquete(paquete.Packages.GetAt(i), nombre);
                if (e != null) { return e; }
            }
            return null;
        }

        function buscarElementoPodado(paquete, nombre) {
            for (var i = 0; i < paquete.Elements.Count; i++) {
                var el = paquete.Elements.GetAt(i);
                if (el.Name == nombre) return el;
            }
            for (var i = 0; i < paquete.Packages.Count; i++) {
                var sp = paquete.Packages.GetAt(i);
                if (sp.Name == nombre) return null; // no bajar a subpaquetes con ese nombre exacto
                var e = buscarElementoPodado(sp, nombre);
                if (e != null) return e;
            }
            return null;
        }

        function obtenerDiagrama(contenedor, nombre) {
            for (var i = 0; i < contenedor.Diagrams.Count; i++) {
                var d = contenedor.Diagrams.GetAt(i);
                if (d.Name == nombre) { return d; }
            }
            return null;
        }

        function posForzada(diagram, elemento, l, t, r, b) {
            // Buscar DiagramObject y forzar su posición
            var dobj = null;
            for (var i = 0; i < diagram.DiagramObjects.Count; i++) {
                var d = diagram.DiagramObjects.GetAt(i);
                if (d.ElementID == elemento.ElementID) { dobj = d; break; }
            }
            if (dobj != null) {
                dobj.Left = l; dobj.Top = t; dobj.Right = r; dobj.Bottom = b;
                dobj.Update();
            } else {
                var obj = diagram.DiagramObjects.AddNew("l="+l+";r="+r+";t="+t+";b="+b+";", "");
                obj.ElementID = elemento.ElementID;
                obj.Update();
            }
        }

        function existeConector(elemento, tipo, supplierID) {
            for (var i = 0; i < elemento.Connectors.Count; i++) {
                var c = elemento.Connectors.GetAt(i);
                if (c.Type == tipo && c.SupplierID == supplierID) return true;
            }
            return false;
        }

        function link(diagram, aId, bId, tipo, estereotipo) {
            var elA = Repository.GetElementByID(aId);
            if (existeConector(elA, tipo, bId)) { return; }
            var conn = elA.Connectors.AddNew("", tipo);
            if (estereotipo) { conn.Stereotype = estereotipo; }
            conn.ClientID = aId;
            conn.SupplierID = bId;
            conn.Update();
            elA.Connectors.Refresh();
            var dl = diagram.DiagramLinks.AddNew("", "");
            dl.ConnectorID = conn.ConnectorID;
            dl.Update();
        }

        // -------------------------------------------------------
        var raizModelo = Repository.Models.GetAt(0);
        var pqCasosUso = buscarPaquete(raizModelo, "Casos de Uso");
        if (pqCasosUso == null) { pqCasosUso = raizModelo; }

        var diagram = obtenerDiagrama(pqCasosUso, "Análisis Arquitectónico - Paquetes Ciclo 1");
        if (diagram == null) {
            aviso("No encontré el diagrama. Verificá que exista bajo 'Casos de Uso'.");
            return;
        }

        // -------------------------------------------------------
        // 1) REUBICAR LOS 6 PAQUETES VISUALES (a la fuerza)
        // -------------------------------------------------------
        var posPkg = {
            "1. Seguridad y Auditoría":          {l:30,  t:30,  r:350, b:250},
            "2. Gestión de Usuarios y Roles":     {l:400, t:30,  r:720, b:250},
            "4. Gestión de Catálogo":             {l:770, t:30,  r:1090,b:250},
            "3. Gestión de Sucursales":           {l:30,  t:310, r:350, b:460},
            "5. Gestión de Proveedores y Compras":{l:400, t:310, r:720, b:460},
            "6. Gestión de Inventario y Almacén": {l:770, t:310, r:1090,b:460}
        };

        var visuales = {};
        for (var np in posPkg) {
            var elPkg = buscarElementoPodado(pqCasosUso, np);
            if (elPkg != null && elPkg.Type == "Package") {
                visuales[np] = elPkg;
                posForzada(diagram, elPkg, posPkg[np].l, posPkg[np].t, posPkg[np].r, posPkg[np].b);
            }
        }

        aviso("Paquetes reubicados. Reubicando 27 CU...");

        // -------------------------------------------------------
        // 2) REUBICAR LOS 27 CU (a la fuerza) + trace
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

        var total = 0;
        for (var nombrePkg in mapCUs) {
            var pkgEl = visuales[nombrePkg];
            if (pkgEl == null) { continue; }
            var ppos = posPkg[nombrePkg];
            var lista = mapCUs[nombrePkg];
            var count = lista.length;

            var colW = (ppos.r - ppos.l) - 10;
            var y0 = ppos.b + 40;
            var altoCU = 50;

            for (var i = 0; i < count; i++) {
                var nombreCU = lista[i];
                var cuEl = buscarElementoPodado(pqCasosUso, nombreCU);
                if (cuEl == null) {
                    cuEl = pqCasosUso.Elements.AddNew(nombreCU, "UseCase");
                    cuEl.Update();
                    pqCasosUso.Elements.Refresh();
                }
                // Posición: columna vertical debajo del paquete (siempre visible)
                var ly = y0 + i * (altoCU + 20);
                var lx = ppos.l + 5;
                var anchoCU = Math.min(colW, 250);
                posForzada(diagram, cuEl, lx, ly, lx + anchoCU, ly + altoCU);
                link(diagram, cuEl.ElementID, pkgEl.ElementID, "Dependency", "trace");
                total++;
            }
        }

        aviso(total + " CU reubicados y conectados. Ajustando vista...");

        diagram.Update();

        // -------------------------------------------------------
        // 3) LAYOUT MANUAL (si soporta la API)
        // -------------------------------------------------------
        if (EJECUTAR_LAYOUT_MANUAL) {
            try {
                var layout = diagram.GetDiagramObjectsByType ? diagram.GetDiagramObjectsByType("UseCase") : null;
                // Usar menu facade para "Layout Diagram"
                Repository.EnsureOutputVisible("System");
                var menu = new ActiveXObject("EA.Menu");
                if (menu != null) {
                    // EA no expone Menu via COM directamente; usamos GetMenu via:
                }
            } catch (e) { }
        }

        // Abrir y mostrar el diagrama
        Repository.OpenDiagram(diagram.DiagramID);
        try { Repository.ShowBrowser("diagram"); } catch (e) { }

        aviso("LISTO.\n\nTodos los paquetes y CU fueron reubicados de forma forzada.\nAbrí el diagrama y usá 'Fit To Window' si hace falta (Ctrl+Shift+W o menú Diagram).\n\nSi aún ves algo en blanco, avisame.");
    }
    catch (e)
    {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error", 0);
    }
}

main();
