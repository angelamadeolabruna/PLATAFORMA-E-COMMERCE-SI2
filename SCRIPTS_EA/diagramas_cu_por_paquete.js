// ================================================================
// TIENDAS MONTAÑO - 6 DIAGRAMAS DE CASOS DE USO POR PAQUETE
// Cada diagrama muestra los ACTORES y sus casos de uso del paquete.
// Genera 6 sub-diagramas (uno por paquete) bajo 'Casos de Uso'.
// Actores a la izquierda, CU a la derecha, conectados por asociación.
// Ejecutar en EA: Scripting > JScript > Run
// ================================================================

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Progreso", 0);
}

function main()
{
    aviso("INICIO: generando 6 diagramas de casos de uso por paquete...");
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
            // Si no está en el paquete de actores, crearlo ahí
            actor = paqueteModeloActores.Elements.AddNew(nombreActor, "Actor");
            actor.Update();
            paqueteModeloActores.Elements.Refresh();
            return actor;
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

        // Buscar paquete de Actores (si existe), si no lo usamos como contenedor
        var pqActores = buscarPaqueteCarpeta(raizModelo, "Actores");
        if (pqActores == null) { pqActores = pqCasosUso; }

        // ---------- DEFINICION: cada paquete -> {cu:[nombre, actor1, actor2...]} ----------
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

        // Para cada paquete, crear su diagrama de casos de uso
        for (var p = 0; p < mapa.length; p++) {
            var item = mapa[p];
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

            // recolectar actores unicos
            var actoresUnicos = [];
            function agregarActor(nombre) {
                for (var a = 0; a < actoresUnicos.length; a++) {
                    if (actoresUnicos[a] == nombre) return;
                }
                actoresUnicos.push(nombre);
            }
            var i, j;
            var lines = [];
            for (i = 0; i < item.cus.length; i++) {
                var linea = item.cus[i];
                lines.push(linea);
                for (j = 1; j < linea.length; j++) {
                    agregarActor(linea[j]);
                }
            }

            // posicionar actores a la izquierda
            var actorEls = {};
            var anchoActor = 220;
            var altoActor = 55;
            var ay = 40;
            for (i = 0; i < actoresUnicos.length; i++) {
                var nombreActor = actoresUnicos[i];
                var actorEl = obtenerOCrearActor(pqActores, nombreActor);
                actorEls[nombreActor] = actorEl;
                posEnDiagrama(diagram, actorEl, 40, ay, 40 + anchoActor, ay + altoActor);
                ay += altoActor + 30;
            }

            // posicionar CU a la derecha, apilados verticalmente
            var anchoCU = 300;
            var altoCU = 50;
            var cx = 40 + anchoActor + 120; // separación de actores
            var cy = 40;
            for (i = 0; i < lines.length; i++) {
                var nombreCU = lines[i][0];
                var cuEl = obtenerElemento(carpeta, nombreCU, "UseCase");
                if (cuEl == null) {
                    cuEl = carpeta.Elements.AddNew(nombreCU, "UseCase");
                    cuEl.Update();
                    carpeta.Elements.Refresh();
                }
                posEnDiagrama(diagram, cuEl, cx, cy, cx + anchoCU, cy + altoCU);
                // conectar con cada actor de la línea
                for (j = 1; j < lines[i].length; j++) {
                    var actorRel = actorEls[lines[i][j]];
                    if (actorRel != null) {
                        linkAsociacion(diagram, actorRel, cuEl);
                    }
                }
                cy += altoCU + 20;
            }

            diagram.Update();
            creados.push(item.nombre);
        }

        var msj = "Se generaron " + creados.length + " diagramas de casos de uso:\n\n";
        for (var k = 0; k < creados.length; k++) {
            msj += "• " + creados[k] + "\n";
        }
        msj += "\nCada uno ubicado dentro de su carpeta/paquete.";
        aviso(msj);
    }
    catch (e)
    {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error", 0);
    }
}

main();
