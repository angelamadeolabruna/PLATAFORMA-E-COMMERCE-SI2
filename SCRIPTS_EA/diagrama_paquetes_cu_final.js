// ================================================================
// TIENDAS MONTAÑO - DIAGRAMA ANALISIS ARQUITECTONICO (FINAL LIMPIO)
// 6 paquetes (existentes) + 27 CU (existentes) + trace CU->paquete
// Reutiliza paquetes y CU ya creados; solo crea el diagrama nuevo.
// Layout: cada paquete tiene sus CU debajo, apilados en vertical,
// visibles y sin solaparse entre paquetes.
// Ejecutar en EA: Scripting > JScript > Run
// ================================================================

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Progreso", 0);
}

function main()
{
    aviso("INICIO: creando diagrama final limpio...");
    try
    {
        // ---------- BUSQUEDA ----------
        function buscarPaquete(paquete, nombre) {
            if (paquete.Name == nombre) { return paquete; }
            for (var i = 0; i < paquete.Packages.Count; i++) {
                var e = buscarPaquete(paquete.Packages.GetAt(i), nombre);
                if (e != null) { return e; }
            }
            return null;
        }

        // Busca el elemento visual (Package o UseCase) por nombre,
        // sin bajar a un sub-paquete que tenga exactamente ese nombre.
        function buscarElemento(paquete, nombre, tipo) {
            for (var i = 0; i < paquete.Elements.Count; i++) {
                var el = paquete.Elements.GetAt(i);
                if (el.Name == nombre && (tipo == null || el.Type == tipo)) return el;
            }
            for (var i = 0; i < paquete.Packages.Count; i++) {
                var sp = paquete.Packages.GetAt(i);
                if (sp.Name == nombre) { continue; }
                var e = buscarElemento(sp, nombre, tipo);
                if (e != null) return e;
            }
            return null;
        }

        function buscarDiagrama(paquete, nombre) {
            for (var i = 0; i < paquete.Diagrams.Count; i++) {
                var d = paquete.Diagrams.GetAt(i);
                if (d.Name == nombre) { return d; }
            }
            return null;
        }

        function yaEstaEnDiagrama(diagram, elementID) {
            for (var i = 0; i < diagram.DiagramObjects.Count; i++) {
                if (diagram.DiagramObjects.GetAt(i).ElementID == elementID) return true;
            }
            return false;
        }

        function posEnDiagrama(diagram, elemento, l, t, r, b) {
            if (yaEstaEnDiagrama(diagram, elemento.ElementID)) { return; }
            var obj = diagram.DiagramObjects.AddNew("l="+l+";r="+r+";t="+t+";b="+b+";", "");
            obj.ElementID = elemento.ElementID;
            obj.Update();
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

        // ---------- PAQUETE ANCLA ----------
        var raizModelo = Repository.Models.GetAt(0);
        var pqCasosUso = buscarPaquete(raizModelo, "Casos de Uso");
        if (pqCasosUso == null) { pqCasosUso = raizModelo; }
        aviso("Paquete ancla: '" + pqCasosUso.Name + "'");

        // ---------- CREAR DIAGRAMA NUEVO ----------
        var nombreDiagrama = "Análisis Arquitectónico - Paquetes Ciclo 1";
        var diagram = buscarDiagrama(pqCasosUso, nombreDiagrama);
        var esNuevo = false;
        if (diagram == null) {
            diagram = pqCasosUso.Diagrams.AddNew(nombreDiagrama, "Logical");
            diagram.Update();
            pqCasosUso.Diagrams.Refresh();
            esNuevo = true;
        }
        aviso("Diagrama listo: '" + diagram.Name + "' (nuevo: " + esNuevo + ")");

        // ---------- POSICIONES DE PAQUETES ----------
        var posPkg = {
            "1. Seguridad y Auditoría":          {l:30,  t:30,  r:350, b:250},
            "2. Gestión de Usuarios y Roles":     {l:400, t:30,  r:720, b:250},
            "4. Gestión de Catálogo":             {l:770, t:30,  r:1090,b:250},
            "3. Gestión de Sucursales":           {l:30,  t:310, r:350, b:460},
            "5. Gestión de Proveedores y Compras":{l:400, t:310, r:720, b:460},
            "6. Gestión de Inventario y Almacén": {l:770, t:310, r:1090,b:460}
        };

        // Posicionar los 6 paquetes visuales (ya existentes)
        for (var np in posPkg) {
            var elPkg = buscarElemento(pqCasosUso, np, "Package");
            if (elPkg != null) {
                posEnDiagrama(diagram, elPkg, posPkg[np].l, posPkg[np].t, posPkg[np].r, posPkg[np].b);
            } else {
                aviso("AVISO: no encontré el paquete visual '" + np + "'. ¿Lo borraste?");
            }
        }

        // ---------- 27 CU ----------
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
            var pkgEl = buscarElemento(pqCasosUso, nombrePkg, "Package");
            if (pkgEl == null) { continue; }
            var ppos = posPkg[nombrePkg];
            var lista = mapCUs[nombrePkg];

            var y0 = ppos.b + 35;
            var altoCU = 48;
            var anchoCU = Math.min((ppos.r - ppos.l) - 10, 280);

            for (var i = 0; i < lista.length; i++) {
                var nombreCU = lista[i];
                var cuEl = buscarElemento(pqCasosUso, nombreCU, "UseCase");
                if (cuEl == null) {
                    cuEl = pqCasosUso.Elements.AddNew(nombreCU, "UseCase");
                    cuEl.Update();
                    pqCasosUso.Elements.Refresh();
                }
                var ly = y0 + i * (altoCU + 18);
                var lx = ppos.l + 5;
                posEnDiagrama(diagram, cuEl, lx, ly, lx + anchoCU, ly + altoCU);
                link(diagram, cuEl.ElementID, pkgEl.ElementID, "Dependency", "trace");
                total++;
            }
        }

        aviso(total + " CU dibujados bajo sus paquetes (vertical). Abriendo diagrama...");

        diagram.Update();
        Repository.OpenDiagram(diagram.DiagramID);

        aviso("LISTO.\n\nVerás 6 paquetes con sus CU apilados debajo.\nCada CU está conectado a su paquete con «trace» (única relación).\n\nSi no se ve completo, usá Diagram > Fit to Window.\n\nEste script NO duplica: si el diagrama ya existía, lo ignora.");
    }
    catch (e)
    {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error", 0);
    }
}

main();
