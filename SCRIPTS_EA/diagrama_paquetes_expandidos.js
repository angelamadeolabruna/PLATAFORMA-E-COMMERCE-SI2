// ================================================================
// TIENDAS MONTAÑO - DIAGRAMA DE PAQUETES EXPANDIDOS (CU dentro)
// Un diagrama maestro muestra los 6 sub-paquetes como CAJAS CON
// PESTAÑA expandidas, y los CU (hijos de cada sub-paquete) se
// muestran ANIDADOS dentro de su caja automáticamente por EA.
//
// CLAVE: NO se dibujan los CU como elementos sueltos. Solo se
// agrega CADA SUB-PAQUETE al diagrama; EA renderiza su contenido.
//
// CREA un diagrama NUEVO para no romper los anteriores.
// Ejecutar en EA: Scripting > JScript > Run
// ================================================================

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Progreso", 0);
}

function main()
{
    aviso("INICIO: diagrama de paquetes expandidos...");
    try
    {
        function buscarPaqueteCarpeta(paquete, nombre) {
            if (paquete.Name == nombre) { return paquete; }
            for (var i = 0; i < paquete.Packages.Count; i++) {
                var e = buscarPaqueteCarpeta(paquete.Packages.GetAt(i), nombre);
                if (e != null) { return e; }
            }
            return null;
        }

        function obtenerSubPaquete(padre, nombre) {
            for (var i = 0; i < padre.Packages.Count; i++) {
                var sp = padre.Packages.GetAt(i);
                if (sp.Name == nombre) { return sp; }
            }
            return null;
        }

        function obtenerDiagrama(paquete, nombre) {
            for (var i = 0; i < paquete.Diagrams.Count; i++) {
                var d = paquete.Diagrams.GetAt(i);
                if (d.Name == nombre) { return d; }
            }
            return null;
        }

        var raizModelo = Repository.Models.GetAt(0);
        var pqCasosUso = buscarPaqueteCarpeta(raizModelo, "Casos de Uso");
        if (pqCasosUso == null) { pqCasosUso = raizModelo; }

        // Nombre de diagrama NUEVO (para no tocar lo anterior)
        var nombreDiagrama = "Diagrama Paquetes Expandidos (CU dentro)";
        var diagram = obtenerDiagrama(pqCasosUso, nombreDiagrama);
        if (diagram == null) {
            diagram = pqCasosUso.Diagrams.AddNew(nombreDiagrama, "Logical");
            diagram.Update();
            pqCasosUso.Diagrams.Refresh();
        }

        // Los 6 sub-paquetes
        var nombres = [
            "1. Seguridad y Auditoría",
            "2. Gestión de Usuarios y Roles",
            "3. Gestión de Sucursales",
            "4. Gestión de Catálogo",
            "5. Gestión de Proveedores y Compras",
            "6. Gestión de Inventario y Almacén"
        ];

        // Posiciones en grilla 3 columnas x 2 filas
        var pos = [
            {l:40,  t:40,  r:420, b:320},
            {l:480, t:40,  r:860, b:320},
            {l:920, t:40,  r:1300,b:320},
            {l:40,  t:380, r:420, b:660},
            {l:480, t:380, r:860, b:660},
            {l:920, t:380, r:1300,b:660}
        ];

        var yaEn = function(diagram, id) {
            for (var i = 0; i < diagram.DiagramObjects.Count; i++) {
                if (diagram.DiagramObjects.GetAt(i).ElementID == id) return true;
            }
            return false;
        };

        var agregados = [];

        for (var i = 0; i < nombres.length; i++) {
            var subPkg = obtenerSubPaquete(pqCasosUso, nombres[i]);
            if (subPkg == null) { continue; }

            // Obtener el ElementID del sub-paquete. En EA, un sub-paquete
            // (Packages.AddNew) se representa con un Element de tipo Package
            // cuyo PackageID == subPkg.PackageID y parentID == padre.
            // Buscamos ese elemento Package.
            var pkgEl = null;
            for (var e = 0; e < pqCasosUso.Elements.Count; e++) {
                var el = pqCasosUso.Elements.GetAt(e);
                if (el.Type == "Package" && el.PackageID == subPkg.PackageID) { pkgEl = el; break; }
            }
            if (pkgEl == null) {
                // Si no existe elemento Package, no podemos dibujarlo en este
                // diagrama como contenedor. Saltamos con aviso.
                aviso("Sin elemento Package para: " + nombres[i] + ". Revisar.");
                continue;
            }

            if (!yaEn(diagram, pkgEl.ElementID)) {
                var dobj = diagram.DiagramObjects.AddNew("l="+pos[i].l+";r="+pos[i].r+";t="+pos[i].t+";b="+pos[i].b+";", "");
                dobj.ElementID = pkgEl.ElementID;
                dobj.Update();
            }
            agregados.push(nombres[i]);
        }

        diagram.Update();
        try { Repository.OpenDiagram(diagram.DiagramID); } catch (e) { }

        aviso("Se agregaron " + agregados.length + " sub-paquetes al diagrama.\n\n" +
              "VERIFICÁ: si EA muestre cada caja con sus CU dentro y el nombre en la pestaña, ¡listo!\n" +
              "Si las cajas salen SIN contenido, entonces tocá cada caja:\n" +
              "  Botón derecho sobre la caja -> 'Show as' -> 'Folder' (o 'Package Contents').\n" +
              "O desde el menú: Diagram > Properties > opción de mostrar paquetes como carpetas.");
    }
    catch (e)
    {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error", 0);
    }
}

main();
