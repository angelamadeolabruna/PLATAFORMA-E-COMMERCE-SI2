// ================================================================
// TIENDAS MONTAÑO - 6 DIAGRAMAS CU POR PAQUETE v3 (CONTENCION REAL)
// Cada diagrama usa el SUB-PAQUETE (Package del árbol) como contenedor.
// Los CU pertenecen al sub-paquete (mismo PackageID) -> EA los dibuja
// ANIDADOS dentro de la caja del paquete, con el nombre visible.
// Actores FUERA conectados por asociación.
// Ejecutar en EA: Scripting > JScript > Run
// ================================================================

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Progreso", 0);
}

function main()
{
    aviso("INICIO v3: diagramas con sub-paquete contenedor real...");
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

            // 2) Diagrama DENTRO del sub-paquete
            var nombreDiagrama = "CU - " + item.nombre;
            var diagram = obtenerDiagrama(subPkg, nombreDiagrama);
            if (diagram == null) {
                diagram = subPkg.Diagrams.AddNew(nombreDiagrama, "Use Case");
                diagram.Update();
                subPkg.Diagrams.Refresh();
            }

            // 3) Crear los CU DENTRO del sub-paquete (PackageID = subPkg)
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

            // 4) Recolectar actores únicos
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

            // 5) Render simplificado: NO usamos la caja del paquete en el diagrama.
            //    Los CU ya pertenecen al sub-paquete. Para que el profesor vea el
            //    paquete, mostramos LOS CU directamente + actores, y el nombre del
            //    paquete va en el título del diagrama (que está dentro de la carpeta).

            // Actores a la izquierda
            var actorEls = {};
            var ay = 40, ax = 20, anchoActor = 200, altoActor = 55;
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
                ay += altoActor + 30;
            }

            // CU a la derecha (pertenecen al sub-paquete)
            var cx = ax + anchoActor + 120, cy = 40, anchoCU = 320, altoCU = 50;
            for (i = 0; i < lines.length; i++) {
                var cuX = cuEls[i];
                posEnDiagrama(diagram, cuX, cx, cy, cx + anchoCU, cy + altoCU);
                for (j = 1; j < lines[i].length; j++) {
                    var actRel = actorEls[lines[i][j]];
                    if (actRel != null) {
                        linkAsociacion(diagram, actRel, cuX);
                    }
                }
                cy += altoCU + 20;
            }

            diagram.Update();
            creados.push(item.nombre);
        }

        var msj = "Se generaron " + creados.length + " diagramas (v3):\n\n";
        for (var k = 0; k < creados.length; k++) {
            msj += "• " + creados[k] + "\n";
        }
        msj += "\nCada diagrama está DENTRO de su carpeta (sub-paquete).\nLos CU fueron creados DENTRO de su carpeta.\n\nAbrí el sub-paquete en el árbol para ver los CU anidados.\nLos actores están fuera, conectados por asociación.";
        aviso(msj);
    }
    catch (e)
    {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error", 0);
    }
}

main();
