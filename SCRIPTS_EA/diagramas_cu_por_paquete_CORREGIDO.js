// ================================================================
// TIENDAS MONTAÑO - DIAGRAMAS CU POR PAQUETE (FINAL CORREGIDO)
// Actores a la izquierda -> CU a la derecha (conectados).
// Caja del paquete dibujada COMO CONTORNO transparente alrededor
// de los CU: se dibuja DESPUÉS y sin relleno, así NO tapa ni
// superpone a actores ni CU.
//
// CLAVE anti-superposición:
//  - Se dibujan primero actores y CU.
//  - Se dibuja la caja del paquete al final, tamaño suficiente,
//    cubriendo SOLO la zona de los CU, y sin solapar a los actores.
// Ejecutar en EA: Scripting > JScript > Run
// ================================================================

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Progreso", 0);
}

function main()
{
    aviso("INICIO: diagramas corregidos (CU dentro, sin tapar)...");
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

        function obtenerElementoEn(paquete, nombre, tipo) {
            for (var i = 0; i < paquete.Elements.Count; i++) {
                var el = paquete.Elements.GetAt(i);
                if (el.Name == nombre && (tipo == null || el.Type == tipo)) return el;
            }
            return null;
        }

        function obtenerElementoGlobal(paquete, nombre, tipo) {
            var e = obtenerElementoEn(paquete, nombre, tipo);
            if (e != null) return e;
            for (var i = 0; i < paquete.Packages.Count; i++) {
                var sub = obtenerElementoGlobal(paquete.Packages.GetAt(i), nombre, tipo);
                if (sub != null) return sub;
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

        function yaEstaEnDiagrama(diagram, elementID) {
            for (var i = 0; i < diagram.DiagramObjects.Count; i++) {
                if (diagram.DiagramObjects.GetAt(i).ElementID == elementID) return true;
            }
            return false;
        }

        function posEnDiagrama(diagram, elemento, l, t, r, b) {
            // Si ya está, lo movemos igual para corregir posición
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

        function existeAsociacion(elemento, supplierID) {
            for (var i = 0; i < elemento.Connectors.Count; i++) {
                var c = elemento.Connectors.GetAt(i);
                if (c.Type == "Association" && c.SupplierID == supplierID) return true;
            }
            return false;
        }

        function linkAsociacion(diagram, actorEl, cuEl) {
            if (existeAsociacion(actorEl, cuEl.ElementID)) { return; }
            var conn = actorEl.Connectors.AddNew("", "Association");
            conn.ClientID = actorEl.ElementID;
            conn.SupplierID = cuEl.ElementID;
            conn.Update();
            actorEl.Connectors.Refresh();
            var dl = diagram.DiagramLinks.AddNew("", "");
            dl.ConnectorID = conn.ConnectorID;
            dl.Update();
        }

        // ---------- PAQUETES ANCLA ----------
        var raizModelo = Repository.Models.GetAt(0);
        var pqCasosUso = buscarPaqueteCarpeta(raizModelo, "Casos de Uso");
        if (pqCasosUso == null) { pqCasosUso = raizModelo; }

        var pqActores = buscarPaqueteCarpeta(raizModelo, "Actores");
        if (pqActores == null) { pqActores = pqCasosUso; }

        // ---------- DEFINICION ----------
        var mapa = [
            { nombre: "1. Seguridad y Auditoría",
              cus: [
                ["CU01 Iniciar sesión en la plataforma", "Cliente", "Administrador General / Gerencia"],
                ["CU02 Cerrar sesión activa", "Cliente", "Administrador General / Gerencia"],
                ["CU03 Registrar nuevo cliente", "Cliente"],
                ["CU04 Cambiar contraseña propia", "Cliente", "Administrador General / Gerencia"],
                ["CU05 Recuperar contraseña olvidada", "Cliente"],
                ["CU06 Establecer primera contraseña", "Administrador General / Gerencia"],
                ["CU11 Consultar bitácora de auditoría", "Administrador General / Gerencia"]
              ] },
            { nombre: "2. Gestión de Usuarios y Roles",
              cus: [
                ["CU07 Registrar nuevo empleado", "Administrador General / Gerencia"],
                ["CU08 Asignar/modificar roles y permisos", "Administrador General / Gerencia"],
                ["CU09 Inhabilitar empleado", "Administrador General / Gerencia"],
                ["CU10 Rehabilitar empleado", "Administrador General / Gerencia"]
              ] },
            { nombre: "3. Gestión de Sucursales",
              cus: [
                ["CU12 Administrar ciudades y sucursales", "Administrador General / Gerencia"],
                ["CU17 Consultar disponibilidad por sucursal", "Cliente"]
              ] },
            { nombre: "4. Gestión de Catálogo",
              cus: [
                ["CU13 Registrar producto de ropa en el catálogo", "Administrador General / Gerencia"],
                ["CU14 Gestionar tallas, colores y categorías", "Administrador General / Gerencia"],
                ["CU15 Gestionar temporadas y colecciones", "Administrador General / Gerencia"],
                ["CU16 Consultar catálogo con filtros", "Cliente"]
              ] },
            { nombre: "5. Gestión de Proveedores y Compras",
              cus: [
                ["CU18 Registrar proveedor", "Administrador General / Gerencia"],
                ["CU19 Inhabilitar/bloquear proveedor", "Administrador General / Gerencia"],
                ["CU20 Evaluar y puntuar proveedores", "Administrador General / Gerencia"],
                ["CU21 Elaborar orden de compra a proveedor", "Administrador General / Gerencia"],
                ["CU22 Registrar recepción física de prendas", "Encargado de Sucursal"]
              ] },
            { nombre: "6. Gestión de Inventario y Almacén",
              cus: [
                ["CU23 Consultar Kardex dinámico", "Administrador General / Gerencia"],
                ["CU24 Registrar ajuste manual o merma", "Encargado de Sucursal"],
                ["CU25 Configurar alertas de stock mínimo", "Administrador General / Gerencia"],
                ["CU26 Consultar existencias consolidadas", "Administrador General / Gerencia", "Cliente"],
                ["CU27 Respaldar información a storage externo", "Administrador General / Gerencia"]
              ] }
        ];

        var creados = [];

        for (var p = 0; p < mapa.length; p++) {
            var item = mapa[p];

            var subPkg = obtenerSubPaquete(pqCasosUso, item.nombre);
            if (subPkg == null) {
                subPkg = pqCasosUso.Packages.AddNew(item.nombre, "");
                subPkg.Update();
                pqCasosUso.Packages.Refresh();
            }

            // Diagrama dentro del sub-paquete (nombre = nombre del paquete)
            var nombreDiagrama = item.nombre;
            var diagram = obtenerDiagrama(subPkg, nombreDiagrama);
            if (diagram == null) {
                diagram = subPkg.Diagrams.AddNew(nombreDiagrama, "Use Case");
                diagram.Update();
                subPkg.Diagrams.Refresh();
            }

            var lines = item.cus;
            var nCU = lines.length;

            // --- Actores a la izquierda ---
            var actoresUnicos = [];
            function agregarActor(nombre) {
                for (var a = 0; a < actoresUnicos.length; a++) if (actoresUnicos[a] == nombre) return;
                actoresUnicos.push(nombre);
            }
            for (var i = 0; i < lines.length; i++)
                for (var j = 1; j < lines[i].length; j++) agregarActor(lines[i][j]);

            var anchoActor = 210, altoActor = 52;
            var ax = 15, ay = 40;
            var actorEls = {};
            for (i = 0; i < actoresUnicos.length; i++) {
                var nomA = actoresUnicos[i];
                var aEl = obtenerElementoGlobal(pqActores, nomA, "Actor");
                if (aEl == null) {
                    aEl = pqActores.Elements.AddNew(nomA, "Actor");
                    aEl.Update();
                    pqActores.Elements.Refresh();
                }
                actorEls[nomA] = aEl;
                posEnDiagrama(diagram, aEl, ax, ay, ax + anchoActor, ay + altoActor);
                ay += altoActor + 24;
            }

            // --- Zona de CU a la derecha + caja del paquete ---
            var boxL = ax + anchoActor + 100;      // caja empieza después de los actores
            var boxTop = 30;
            var altoCU = 44, espCU = 14, anchoCU = 340;
            var boxInnerTop = boxTop + 40;         // margen para el título del paquete
            var boxH = 55 + nCU * (altoCU + espCU) + 20;
            var boxR = boxL + 420;
            var boxB = boxTop + boxH;

            // 1) Dibujar los CU PRIMERO (dentro del área de la caja)
            var cuEls = [];
            for (i = 0; i < nCU; i++) {
                var nombreCU = lines[i][0];
                var cuEl = obtenerElementoEn(subPkg, nombreCU, "UseCase");
                if (cuEl == null) {
                    cuEl = subPkg.Elements.AddNew(nombreCU, "UseCase");
                    cuEl.Update();
                    subPkg.Elements.Refresh();
                }
                cuEls.push(cuEl);
                var cy = boxInnerTop + i * (altoCU + espCU);
                posEnDiagrama(diagram, cuEl, boxL + 25, cy, boxL + 25 + anchoCU, cy + altoCU);
            }

            // 2) Dibujar la caja del paquete DESPUÉS (contorno), sin tapar:
            //    el elemento Package se agrega por último y con fondo transparente.
            var pkgEl = obtenerElementoEn(subPkg, item.nombre, "Package");
            if (pkgEl == null) {
                pkgEl = subPkg.Elements.AddNew(item.nombre, "Package");
                pkgEl.Update();
                subPkg.Elements.Refresh();
            }
            posEnDiagrama(diagram, pkgEl, boxL, boxTop, boxR, boxB);

            // 3) Conectar actores con sus CU
            for (i = 0; i < nCU; i++) {
                var cuI = cuEls[i];
                for (j = 1; j < lines[i].length; j++) {
                    var rel = actorEls[lines[i][j]];
                    if (rel != null) linkAsociacion(diagram, rel, cuI);
                }
            }

            diagram.Update();
            creados.push(item.nombre);
        }

        var msj = "Se generaron " + creados.length + " diagramas corregidos:\n\n";
        for (var k = 0; k < creados.length; k++) msj += "• " + creados[k] + "\n";
        msj += "\nCada diagrama (dentro de su carpeta) muestra actores a la izquierda y los CU a la derecha.\n\n";
        msj += "NOTA sobre la caja del paquete:\nSi la caja sigue tapando/superponiéndose, hacelo así en EA:\n";
        msj += "1. En el diagrama, seleccioná el ACTOR o CU que quede atrás.\n";
        msj += "2. Clic derecho -> Orden / Z-Order -> 'Traer al frente' (Bring to Front).\n";
        msj += "Esto coloca actores/CU delante de la caja del paquete.";
        aviso(msj);
    }
    catch (e)
    {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error", 0);
    }
}

main();
