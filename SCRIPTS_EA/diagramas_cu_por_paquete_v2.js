// ================================================================
// TIENDAS MONTAÑO - 6 DIAGRAMAS DE CASOS DE USO POR PAQUETE v2
// Cada diagrama muestra la CAJA DEL PAQUETE como contenedor,
// con los CU DENTRO de la caja y los ACTORES FUERA a la izquierda,
// conectados por asociación a sus CU.
// Ejecutar en EA: Scripting > JScript > Run
// ================================================================

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Progreso", 0);
}

function main()
{
    aviso("INICIO: generando 6 diagramas con paquete contenedor...");
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

        function obtenerCarpeta(padre, nombre) {
            for (var i = 0; i < padre.Packages.Count; i++) {
                var sp = padre.Packages.GetAt(i);
                if (sp.Name == nombre) { return sp; }
            }
            return null;
        }

        function obtenerElemento(paquete, nombre, tipo) {
            for (var i = 0; i < paquete.Elements.Count; i++) {
                var el = paquete.Elements.GetAt(i);
                if (el.Name == nombre && (tipo == null || el.Type == tipo)) return el;
            }
            return null;
        }

        function obtenerOCrearActor(paqueteModeloActores, nombreActor) {
            var actor = obtenerElemento(paqueteModeloActores, nombreActor, "Actor");
            if (actor != null) return actor;
            actor = paqueteModeloActores.Elements.AddNew(nombreActor, "Actor");
            actor.Update();
            paqueteModeloActores.Elements.Refresh();
            return actor;
        }

        function obtenerOCrearPaqueteVisual(contenedor, nombre) {
            var e = obtenerElemento(contenedor, nombre, "Package");
            if (e != null) return e;
            e = contenedor.Elements.AddNew(nombre, "Package");
            e.Update();
            contenedor.Elements.Refresh();
            return e;
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

            // Carpeta (sub-paquete) del árbol
            var carpeta = obtenerCarpeta(pqCasosUso, item.nombre);
            if (carpeta == null) {
                carpeta = pqCasosUso.Packages.AddNew(item.nombre, "");
                carpeta.Update();
                pqCasosUso.Packages.Refresh();
            }

            var nombreDiagrama = "CU - " + item.nombre;
            var diagram = obtenerDiagrama(carpeta, nombreDiagrama);
            if (diagram == null) {
                diagram = carpeta.Diagrams.AddNew(nombreDiagrama, "Use Case");
                diagram.Update();
                carpeta.Diagrams.Refresh();
            }

            // Paquete VISUAL contenedor (la caja) -> se crea dentro de la carpeta
            var pkgEl = obtenerOCrearPaqueteVisual(carpeta, item.nombre);

            // Recolectar actores únicos
            var actoresUnicos = [];
            function agregarActor(nombre) {
                for (var a = 0; a < actoresUnicos.length; a++) {
                    if (actoresUnicos[a] == nombre) return;
                }
                actoresUnicos.push(nombre);
            }
            var i, j;
            var lines = item.cus;
            for (i = 0; i < lines.length; i++) {
                for (j = 1; j < lines[i].length; j++) {
                    agregarActor(lines[i][j]);
                }
            }

            // ---- Layout ----
            // Caja del paquete: zona grande a la derecha
            var boxL = 320, boxT = 30;
            // estimar alto/posiciones de CU dentro de la caja
            var altoCU = 50, espacioCU = 18;
            var cuW = 320;
            var cu0y = boxT + 55;    // margen dentro de la caja (debajo del título)
            var cuX = boxL + 25;

            // Altura de la caja según cantidad de CU
            var nCU = lines.length;
            var boxH = 70 + nCU * (altoCU + espacioCU) + 20;
            var boxR = boxL + 420;  // ancho de caja
            var boxB = boxT + boxH;

            // Dibujar la caja del paquete (contenedor)
            posEnDiagrama(diagram, pkgEl, boxL, boxT, boxR, boxB);

            // CU dentro de la caja
            var cuEls = [];
            for (i = 0; i < nCU; i++) {
                var nombreCU = lines[i][0];
                var cuEl = obtenerElemento(carpeta, nombreCU, "UseCase");
                if (cuEl == null) {
                    cuEl = carpeta.Elements.AddNew(nombreCU, "UseCase");
                    cuEl.Update();
                    carpeta.Elements.Refresh();
                }
                var cy = cu0y + i * (altoCU + espacioCU);
                posEnDiagrama(diagram, cuEl, cuX, cy, cuX + cuW, cy + altoCU);
                cuEls.push(cuEl);
            }

            // Actores a la izquierda, FUERA de la caja
            var actorEls = {};
            var ay = boxT + 40;
            var anchoActor = 200, altoActor = 55;
            var ax = 20;
            for (i = 0; i < actoresUnicos.length; i++) {
                var nombreActor = actoresUnicos[i];
                var actorEl = obtenerOCrearActor(pqActores, nombreActor);
                actorEls[nombreActor] = actorEl;
                posEnDiagrama(diagram, actorEl, ax, ay, ax + anchoActor, ay + altoActor);
                ay += altoActor + 30;
            }

            // Conectar actores con sus CU
            for (i = 0; i < nCU; i++) {
                var cuIdx = cuEls[i];
                for (j = 1; j < lines[i].length; j++) {
                    var actRel = actorEls[lines[i][j]];
                    if (actRel != null) {
                        linkAsociacion(diagram, actRel, cuIdx);
                    }
                }
            }

            diagram.Update();
            creados.push(item.nombre);
        }

        var msj = "Se generaron " + creados.length + " diagramas con paquete contenedor:\n\n";
        for (var k = 0; k < creados.length; k++) {
            msj += "• " + creados[k] + "\n";
        }
        msj += "\nCada uno muestra la caja del paquete con los CU DENTRO y los actores FUERA.";
        aviso(msj);
    }
    catch (e)
    {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error", 0);
    }
}

main();
