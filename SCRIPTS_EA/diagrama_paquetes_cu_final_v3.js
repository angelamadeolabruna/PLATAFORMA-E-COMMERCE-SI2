// ================================================================
// TIENDAS MONTAÑO - DIAGRAMA ANALISIS ARQUITECTONICO (FINAL v3)
// 6 sub-paquetes (reutilizados) + CU DENTRO de cada uno + trace
// Cada paquete es un sub-paquete que CONTIENE sus casos de uso.
// Crea el diagrama y dibuja los elementos visuales con «trace».
// Ejecutar en EA: Scripting > JScript > Run
// ================================================================

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Progreso", 0);
}

function main()
{
    aviso("INICIO v3: reutilizando 6 carpetas y poblándolas con CU...");
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

        function obtenerCU(carpeta, nombre) {
            for (var i = 0; i < carpeta.Elements.Count; i++) {
                var el = carpeta.Elements.GetAt(i);
                if (el.Name == nombre && el.Type == "UseCase") { return el; }
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
        var pqCasosUso = buscarPaqueteCarpeta(raizModelo, "Casos de Uso");
        if (pqCasosUso == null) { pqCasosUso = raizModelo; }
        aviso("Paquete ancla: '" + pqCasosUso.Name + "'");

        // ---------- DIAGRAMA ----------
        var nombreDiagrama = "Análisis Arquitectónico - Paquetes Ciclo 1";
        var diagram = obtenerDiagrama(pqCasosUso, nombreDiagrama);
        if (diagram == null) {
            diagram = pqCasosUso.Diagrams.AddNew(nombreDiagrama, "Logical");
            diagram.Update();
            pqCasosUso.Diagrams.Refresh();
        }
        aviso("Diagrama listo: '" + diagram.Name + "'");

        // ---------- MAPA DE PAQUETES Y CU ----------
        var mapa = [
            { nombre: "1. Seguridad y Auditoría",
              pos: {l:30, t:30, r:350, b:250},
              cus: ["CU01 Iniciar sesión en la plataforma",
                    "CU02 Cerrar sesión activa",
                    "CU03 Registrar nuevo cliente",
                    "CU04 Cambiar contraseña propia",
                    "CU05 Recuperar contraseña olvidada",
                    "CU06 Establecer primera contraseña",
                    "CU11 Consultar bitácora de auditoría"] },
            { nombre: "2. Gestión de Usuarios y Roles",
              pos: {l:400, t:30, r:720, b:250},
              cus: ["CU07 Registrar nuevo empleado",
                    "CU08 Asignar/modificar roles y permisos",
                    "CU09 Inhabilitar empleado",
                    "CU10 Rehabilitar empleado"] },
            { nombre: "3. Gestión de Sucursales",
              pos: {l:30, t:310, r:350, b:460},
              cus: ["CU12 Administrar ciudades y sucursales",
                    "CU17 Consultar disponibilidad por sucursal"] },
            { nombre: "4. Gestión de Catálogo",
              pos: {l:770, t:30, r:1090, b:250},
              cus: ["CU13 Registrar producto de ropa en el catálogo",
                    "CU14 Gestionar tallas, colores y categorías",
                    "CU15 Gestionar temporadas y colecciones",
                    "CU16 Consultar catálogo con filtros"] },
            { nombre: "5. Gestión de Proveedores y Compras",
              pos: {l:400, t:310, r:720, b:460},
              cus: ["CU18 Registrar proveedor",
                    "CU19 Inhabilitar/bloquear proveedor",
                    "CU20 Evaluar y puntuar proveedores",
                    "CU21 Elaborar orden de compra a proveedor",
                    "CU22 Registrar recepción física de prendas"] },
            { nombre: "6. Gestión de Inventario y Almacén",
              pos: {l:770, t:310, r:1090, b:460},
              cus: ["CU23 Consultar Kardex dinámico",
                    "CU24 Registrar ajuste manual o merma",
                    "CU25 Configurar alertas de stock mínimo",
                    "CU26 Consultar existencias consolidadas",
                    "CU27 Respaldar información a storage externo"] }
        ];

        var totalCU = 0;
        var avisos = [];

        for (var p = 0; p < mapa.length; p++) {
            var item = mapa[p];

            // 1) Reutilizar la carpeta (sub-paquete)
            var carpeta = obtenerCarpeta(pqCasosUso, item.nombre);
            if (carpeta == null) {
                carpeta = pqCasosUso.Packages.AddNew(item.nombre, "");
                carpeta.Update();
                pqCasosUso.Packages.Refresh();
            }
            avisos.push("Usando carpeta: '" + carpeta.Name + "'");

            // 2) CREAR LOS CU DENTRO DE LA CARPETA (UseCase elements)
            var cuElementos = [];
            for (var c = 0; c < item.cus.length; c++) {
                var nombreCU = item.cus[c];
                var cuEl = obtenerCU(carpeta, nombreCU);
                if (cuEl == null) {
                    cuEl = carpeta.Elements.AddNew(nombreCU, "UseCase");
                    cuEl.Update();
                    carpeta.Elements.Refresh();
                }
                cuElementos.push(cuEl);
                totalCU++;
            }

            // 3) El paquete VISUAL en el diagrama:
            //    usamos el ELEMENTO Package que representa a la carpeta.
            //    Si la carpeta no tiene elemento visual propio, creamos uno.
            var pkgEl = null;
            for (var i = 0; i < pqCasosUso.Elements.Count; i++) {
                var ee = pqCasosUso.Elements.GetAt(i);
                if (ee.Name == item.nombre && ee.Type == "Package") { pkgEl = ee; }
            }
            if (pkgEl == null) {
                pkgEl = pqCasosUso.Elements.AddNew(item.nombre, "Package");
                pkgEl.Update();
                pqCasosUso.Elements.Refresh();
            }

            // 4) Posicionar el paquete visual
            var pos = item.pos;
            posEnDiagrama(diagram, pkgEl, pos.l, pos.t, pos.r, pos.b);

            // 5) Posicionar los CU debajo del paquete (vertical) y trazar trace
            var y0 = pos.b + 35;
            var altoCU = 48;
            var anchoCU = Math.min((pos.r - pos.l) - 10, 280);
            for (var j = 0; j < cuElementos.length; j++) {
                var ly = y0 + j * (altoCU + 18);
                var lx = pos.l + 5;
                posEnDiagrama(diagram, cuElementos[j], lx, ly, lx + anchoCU, ly + altoCU);
                link(diagram, cuElementos[j].ElementID, pkgEl.ElementID, "Dependency", "trace");
            }
        }

        aviso("Proceso completado: " + totalCU + " CU creados/dibujados dentro de sus 6 carpetas.\n\nAbriendo diagrama...");

        diagram.Update();
        Repository.OpenDiagram(diagram.DiagramID);

        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("LISTO.\n\n" + avisos.join("\n") + "\n\n" + totalCU + " CU totales.\n\nCada CU está DENTRO de su carpeta (podés abrirla en el árbol) y conectado con «trace» a su paquete.\n\nSi no se ve completo, usá Diagram > Fit to Window.", 0, "OK", 0);
    }
    catch (e)
    {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR: " + e.description, 0, "Error", 0);
    }
}

main();
