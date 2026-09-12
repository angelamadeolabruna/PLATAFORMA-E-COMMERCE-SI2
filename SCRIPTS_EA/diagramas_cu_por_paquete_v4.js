// ================================================================
// TIENDAS MONTAÑO - 6 DIAGRAMAS CU POR PAQUETE v4 (ANIDADO REAL)
// Cada diagrama muestra el SUB-PAQUETE (caja con nombre) y los CU
// creados dentro de él quedan ANIDADOS dentro de la caja.
// Actores FUERA conectados por asociación.
//
// CLAVE EA: los CU son Elements dentro del sub-paquete (PackageID
// = sub-paquete). Al agregarlos al MISMO diagrama que el sub-paquete,
// EA los dibuja anidados dentro de la caja del paquete.
// Ejecutar en EA: Scripting > JScript > Run
// ================================================================

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Progreso", 0);
}

function main()
{
    aviso("INICIO v4: diagramas con CU anidados en la caja del paquete...");
    try
    {
        // ---------- BUSQUEDA ----------
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
            if (yaEstaEnDiagrama(diagram, elemento.ElementID)) { return; }
            var obj = diagram.DiagramObjects.AddNew("l="+l+";r="+r+";t="+t+";b="+b+";", "");
            obj.ElementID = elemento.ElementID;
            obj.Update();
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
            {
                nombre: "1. Seguridad y Auditoría",
                cus: [
                    ["CU01 Iniciar sesión en la plataforma", "Cliente", "Administrador General / Gerencia"],
                    ["CU02 Cerrar sesión activa", "Cliente", "Administrador General / Gerencia"],
                    ["CU03 Registrar nuevo cliente", "Cliente"],
                    ["CU04 Cambiar contraseña propia", "Cliente", "Administrador General / Gerencia"],
                    ["CU05 Recuperar contraseña olvidada", "Cliente"],
                    ["CU06 Establecer primera contraseña", "Administrador General / Gerencia"],
                    ["CU11 Consultar bitácora de auditoría", "Administrador General / Gerencia"]
                ]
            },
            {
                nombre: "2. Gestión de Usuarios y Roles",
                cus: [
                    ["CU07 Registrar nuevo empleado", "Administrador General / Gerencia"],
                    ["CU08 Asignar/modificar roles y permisos", "Administrador General / Gerencia"],
                    ["CU09 Inhabilitar empleado", "Administrador General / Gerencia"],
                    ["CU10 Rehabilitar empleado", "Administrador General / Gerencia"]
                ]
            },
            {
                nombre: "3. Gestión de Sucursales",
                cus: [
                    ["CU12 Administrar ciudades y sucursales", "Administrador General / Gerencia"],
                    ["CU17 Consultar disponibilidad por sucursal", "Cliente"]
                ]
            },
            {
                nombre: "4. Gestión de Catálogo",
                cus: [
                    ["CU13 Registrar producto de ropa en el catálogo", "Administrador General / Gerencia"],
                    ["CU14 Gestionar tallas, colores y categorías", "Administrador General / Gerencia"],
                    ["CU15 Gestionar temporadas y colecciones", "Administrador General / Gerencia"],
                    ["CU16 Consultar catálogo con filtros", "Cliente"]
                ]
            },
            {
                nombre: "5. Gestión de Proveedores y Compras",
                cus: [
                    ["CU18 Registrar proveedor", "Administrador General / Gerencia"],
                    ["CU19 Inhabilitar/bloquear proveedor", "Administrador General / Gerencia"],
                    ["CU20 Evaluar y puntuar proveedores", "Administrador General / Gerencia"],
                    ["CU21 Elaborar orden de compra a proveedor", "Administrador General / Gerencia"],
                    ["CU22 Registrar recepción física de prendas", "Encargado de Sucursal"]
                ]
            },
            {
                nombre: "6. Gestión de Inventario y Almacén",
                cus: [
                    ["CU23 Consultar Kardex dinámico", "Administrador General / Gerencia"],
                    ["CU24 Registrar ajuste manual o merma", "Encargado de Sucursal"],
                    ["CU25 Configurar alertas de stock mínimo", "Administrador General / Gerencia"],
                    ["CU26 Consultar existencias consolidadas", "Administrador General / Gerencia", "Cliente"],
                    ["CU27 Respaldar información a storage externo", "Administrador General / Gerencia"]
                ]
            }
        ];

        var creados = [];

        for (var p = 0; p < mapa.length; p++) {
            var item = mapa[p];

            // 1) Obtener (o crear) el SUB-PAQUETE del árbol
            var subPkg = obtenerSubPaquete(pqCasosUso, item.nombre);
            if (subPkg == null) {
                subPkg = pqCasosUso.Packages.AddNew(item.nombre, "");
                subPkg.Update();
                pqCasosUso.Packages.Refresh();
            }

            // 2) Crear los CU DENTRO del sub-paquete (PackageID = subPkg)
            var lines = item.cus;
            var cuEls = [];
            for (var i = 0; i < lines.length; i++) {
                var nombreCU = lines[i][0];
                var cuEl = obtenerElementoEn(subPkg, nombreCU, "UseCase");
                if (cuEl == null) {
                    cuEl = subPkg.Elements.AddNew(nombreCU, "UseCase");
                    cuEl.Update();
                    subPkg.Elements.Refresh();
                }
                cuEls.push(cuEl);
            }

            // 3) Recolectar actores únicos
            var actoresUnicos = [];
            function agregarActor(nombre) {
                for (var a = 0; a < actoresUnicos.length; a++) {
                    if (actoresUnicos[a] == nombre) return;
                }
                actoresUnicos.push(nombre);
            }
            for (i = 0; i < lines.length; i++) {
                for (var j = 1; j < lines[i].length; j++) {
                    agregarActor(lines[i][j]);
                }
            }

            // 4) Diagrama DENTRO del sub-paquete
            var nombreDiagrama = "CU - " + item.nombre;
            var diagram = obtenerDiagrama(subPkg, nombreDiagrama);
            if (diagram == null) {
                diagram = subPkg.Diagrams.AddNew(nombreDiagrama, "Use Case");
                diagram.Update();
                subPkg.Diagrams.Refresh();
            }

            // 5) Posiciones
            var nCU = lines.length;
            var altoCU = 44, espacioCU = 14;
            var anchoCU = 320;
            var anchoActor = 200, altoActor = 52;

            // Caja del paquete (sub-paquete) a la derecha
            var boxL = 320, boxT = 40;
            var boxH = 60 + nCU * (altoCU + espacioCU) + 20;
            var boxR = boxL + 430;
            var boxB = boxT + boxH;

            // UBICAR los CU DENTRO de la zona de la caja (coordenadas dentro del paquete)
            // Nota: los CU son hijos del sub-paquete; sus coordenadas son absolutas en el diagrama,
            // dentro del rectángulo del paquete.
            var cu0y = boxT + 45;
            var cuX = boxL + 25;
            for (i = 0; i < nCU; i++) {
                var cy = cu0y + i * (altoCU + espacioCU);
                posEnDiagrama(diagram, cuEls[i], cuX, cy, cuX + anchoCU, cy + altoCU);
            }

            // 6) Agregar la caja del SUB-PAQUETE al diagrama (después de los CU no importa,
            //    EA la dibuja como contenedor). Necesitamos el elemento del sub-paquete.
            //    EA: para agregar un sub-paquete se usa su ElementID de tipo Package.
            //    Obtenemos el elemento Package asociado al sub-paquete buscándolo en el modelo.
            var pkgElement = obtenerElementoGlobal(pqCasosUso, item.nombre, "Package");
            if (pkgElement != null) {
                posEnDiagrama(diagram, pkgElement, boxL, boxT, boxR, boxB);
            } else {
                // crear elemento Package visual
                pkgElement = subPkg.Elements.AddNew(item.nombre, "Package");
                pkgElement.Update();
                subPkg.Elements.Refresh();
                posEnDiagrama(diagram, pkgElement, boxL, boxT, boxR, boxB);
            }

            // 7) Actores a la izquierda, FUERA de la caja
            var actorEls = {};
            var ay = boxT + 30;
            var ax = 15;
            for (i = 0; i < actoresUnicos.length; i++) {
                var nomActor = actoresUnicos[i];
                var actorEl = obtenerElementoGlobal(pqActores, nomActor, "Actor");
                if (actorEl == null) {
                    actorEl = pqActores.Elements.AddNew(nomActor, "Actor");
                    actorEl.Update();
                    pqActores.Elements.Refresh();
                }
                actorEls[nomActor] = actorEl;
                posEnDiagrama(diagram, actorEl, ax, ay, ax + anchoActor, ay + altoActor);
                ay += altoActor + 26;
            }

            // 8) Conectar actores con CU
            for (i = 0; i < nCU; i++) {
                var cuX2 = cuEls[i];
                for (j = 1; j < lines[i].length; j++) {
                    var actRel = actorEls[lines[i][j]];
                    if (actRel != null) {
                        linkAsociacion(diagram, actRel, cuX2);
                    }
                }
            }

            diagram.Update();
            repositoryRefresh(diagram);
            creados.push(item.nombre);
        }

        var msj = "Se generaron " + creados.length + " diagramas (v4):\n\n";
        for (var k = 0; k < creados.length; k++) {
            msj += "• " + creados[k] + "\n";
        }
        msj += "\nLos CU están creados DENTRO de su sub-paquete.\nSi la caja del paquete muestra los CU anidados, perfecto.\n\nSi aún no se ven dentro, abrí el diagrama y:\n- Derecho sobre la caja del paquete -> 'Show as' -> 'Folder' (o verifica 'Package Contents').\n- O usa menú Diagram > Refresh.";
        aviso(msj);
    }
    catch (e)
    {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error", 0);
    }
}

function repositoryRefresh(diagram)
{
    // Forzar refresco del diagrama
    try { Repository.ReloadDiagram(diagram.DiagramID); } catch (e) { }
    try { diagram.Refresh(); } catch (e) { }
    try { Repository.OpenDiagram(diagram.DiagramID); } catch (e) { }
}

main();
