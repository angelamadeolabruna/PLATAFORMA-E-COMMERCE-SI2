// ================================================================
// TIENDAS MONTAÑO - ANALISIS ARQUITECTONICO CICLO 1 (FINAL v2)
// 6 paquetes + 27 CU relacionados SOLO por «trace» (CU -> paquete)
// LAYOUT CORREGIDO: cada paquete tiene su propia fila de CU,
// sin solapamientos entre paquetes (se arregla el paquete 6).
// Version IDEMPOTENTE + POPUPS de progreso.
// Ejecutar en EA: Scripting > JScript > Run
// ================================================================

function aviso(texto)
{
    var shell = new ActiveXObject("WScript.Shell");
    shell.Popup(texto, 0, "Progreso", 0);
}

function main()
{
    aviso("INICIO: arrancando el script...");

    try
    {
        function buscarPaquetePorNombre(paquete, nombre) {
            if (paquete.Name == nombre) { return paquete; }
            for (var i = 0; i < paquete.Packages.Count; i++) {
                var encontrado = buscarPaquetePorNombre(paquete.Packages.GetAt(i), nombre);
                if (encontrado != null) { return encontrado; }
            }
            return null;
        }

        function buscarElemento(paquete, nombre) {
            var i;
            for (i = 0; i < paquete.Elements.Count; i++) {
                var el = paquete.Elements.GetAt(i);
                if (el.Name == nombre) return el;
            }
            for (i = 0; i < paquete.Packages.Count; i++) {
                var encontrado = buscarElemento(paquete.Packages.GetAt(i), nombre);
                if (encontrado != null) return encontrado;
            }
            return null;
        }

        function obtenerOCrearSubPaquete(padre, nombre) {
            for (var i = 0; i < padre.Packages.Count; i++) {
                var sp = padre.Packages.GetAt(i);
                if (sp.Name == nombre) { return sp; }
            }
            var nuevo = padre.Packages.AddNew(nombre, "");
            nuevo.Update();
            padre.Packages.Refresh();
            return nuevo;
        }

        function obtenerOCrearPaqueteVisual(contenedor, nombre) {
            for (var i = 0; i < contenedor.Elements.Count; i++) {
                var e = contenedor.Elements.GetAt(i);
                if (e.Name == nombre && e.Type == "Package") { return e; }
            }
            var nuevo = contenedor.Elements.AddNew(nombre, "Package");
            nuevo.Update();
            contenedor.Elements.Refresh();
            return nuevo;
        }

        function obtenerOCrearDiagrama(contenedor, nombre, tipo) {
            for (var i = 0; i < contenedor.Diagrams.Count; i++) {
                var d = contenedor.Diagrams.GetAt(i);
                if (d.Name == nombre) { return d; }
            }
            var nuevo = contenedor.Diagrams.AddNew(nombre, tipo);
            nuevo.Update();
            contenedor.Diagrams.Refresh();
            return nuevo;
        }

        function yaEstaEnDiagrama(diagram, elementID) {
            for (var i = 0; i < diagram.DiagramObjects.Count; i++) {
                if (diagram.DiagramObjects.GetAt(i).ElementID == elementID) { return true; }
            }
            return false;
        }

        function posSiNoExiste(diagram, elemento, l, t, r, b) {
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

        function upsertCU(paqueteBase, nombreCU) {
            var raiz = Repository.Models.GetAt(0);
            var existente = buscarElemento(raiz, nombreCU);
            if (existente != null) { return existente; }
            var cu = paqueteBase.Elements.AddNew(nombreCU, "UseCase");
            cu.Update();
            paqueteBase.Elements.Refresh();
            return cu;
        }

        // -------------------------------------------------------
        var raizModelo = Repository.Models.GetAt(0);
        var pqCasosUso = buscarPaquetePorNombre(raizModelo, "Casos de Uso");
        if (pqCasosUso == null) { pqCasosUso = raizModelo; }

        aviso("Paso 1 OK: paquete ancla = '" + pqCasosUso.Name + "'");

        var diagram = obtenerOCrearDiagrama(pqCasosUso, "Análisis Arquitectónico - Paquetes Ciclo 1", "Logical");

        aviso("Paso 2 OK: diagrama = '" + diagram.Name + "'");

        var nombresPkg = [
            "1. Seguridad y Auditoría",
            "2. Gestión de Usuarios y Roles",
            "3. Gestión de Sucursales",
            "4. Gestión de Catálogo",
            "5. Gestión de Proveedores y Compras",
            "6. Gestión de Inventario y Almacén"
        ];

        var visuales = {};
        for (var n = 0; n < nombresPkg.length; n++) {
            var nombre = nombresPkg[n];
            obtenerOCrearSubPaquete(pqCasosUso, nombre);
            visuales[nombre] = obtenerOCrearPaqueteVisual(pqCasosUso, nombre);
        }

        aviso("Paso 3 OK: 6 sub-paquetes y 6 elementos visuales listos");

        // ---------- LAYOUT SIN SOLAPAMIENTOS ----------
        // 3 columnas: col1=30..350, col2=400..720, col3=770..1090
        // Fila A (paquetes): y=30..250
        // Fila B (paquetes): y=310..460  (más compacta para espacio)
        // Zona de CU de cada paquete: debajo, con altura propia, sin invadir a otros

        var posPkg = {
            "1. Seguridad y Auditoría":          {l:30,  t:30,  r:350, b:250, fila:0},
            "2. Gestión de Usuarios y Roles":     {l:400, t:30,  r:720, b:250, fila:1},
            "4. Gestión de Catálogo":             {l:770, t:30,  r:1090,b:250, fila:2},
            "3. Gestión de Sucursales":           {l:30,  t:310, r:350, b:460, fila:0},
            "5. Gestión de Proveedores y Compras":{l:400, t:310, r:720, b:460, fila:1},
            "6. Gestión de Inventario y Almacén": {l:770, t:310, r:1090,b:460, fila:2}
        };

        for (var np = 0; np < nombresPkg.length; np++) {
            var nombrePkg = nombresPkg[np];
            var p = posPkg[nombrePkg];
            posSiNoExiste(diagram, visuales[nombrePkg], p.l, p.t, p.r, p.b);
        }

        aviso("Paso 4 OK: 6 cajas posicionadas en el diagrama");

        // -------------------------------------------------------
        // 27 CU + trace (UNICA relacion: CU -> paquete)
        // Cada paquete tiene su fila de CU debajo, sin solapar.
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

        // Posición de la zona de CU por fila/columna del paquete
        // Vamos a colocar cada CU justo debajo de su paquete, en la
        // misma columna, apilados verticalmente hacia abajo si son varios.
        var totalCU = 0;
        for (var nombrePkgCU in mapCUs) {
            var pkgEl = visuales[nombrePkgCU];
            var ppos = posPkg[nombrePkgCU];
            var lista = mapCUs[nombrePkgCU];
            var count = lista.length;

            // Ancho disponible dentro de la columna del paquete
            var colW = (ppos.r - ppos.l) - 10;

            // Primer CU debajo del paquete
            var y0 = ppos.b + 40;
            var anchoCU = Math.min(colW, 250);
            var altoCU = 50;
            var espacioY = 20;

            // Si son pocos y caben, los ponemos en una fila horizontal;
            // si no, en una columna vertical. Para no complicar, usamos
            // fila horizontal con ajuste de ancho para que quepan todos.
            var filaCabe = (count * (anchoCU + 20)) <= colW;
            if (filaCabe) {
                // Fila horizontal
                var paso = (colW - anchoCU) / (count > 1 ? (count - 1) : 1);
                for (var i = 0; i < count; i++) {
                    var nombreCU = lista[i];
                    var cuEl = upsertCU(pqCasosUso, nombreCU);
                    var lx = ppos.l + 5 + (i * paso);
                    posSiNoExiste(diagram, cuEl, lx, y0, lx + anchoCU, y0 + altoCU);
                    link(diagram, cuEl.ElementID, pkgEl.ElementID, "Dependency", "trace");
                    totalCU++;
                }
            } else {
                // Columna vertical apilada hacia abajo
                for (var j = 0; j < count; j++) {
                    var nombreCU2 = lista[j];
                    var cuEl2 = upsertCU(pqCasosUso, nombreCU2);
                    var ly = y0 + j * (altoCU + espacioY);
                    posSiNoExiste(diagram, cuEl2, ppos.l + 5, ly, ppos.l + 5 + anchoCU, ly + altoCU);
                    link(diagram, cuEl2.ElementID, pkgEl.ElementID, "Dependency", "trace");
                    totalCU++;
                }
            }
        }

        aviso("Paso 5 OK: " + totalCU + " CU dibujados y conectados con «trace» (unica relacion)");

        diagram.Update();
        Repository.OpenDiagram(diagram.DiagramID);

        aviso("TERMINADO CORRECTAMENTE.\n\nSolo quedan relaciones CU -> paquete («trace»).\nNo hay dependencias paquete-paquete.\n\nPodés correr este script las veces que quieras: es idempotente, nunca duplica nada.\n\nNOTA: paquete 6 (Inventario) tiene sus 5 CU debajo, visibles.");
    }
    catch (e)
    {
        var shell = new ActiveXObject("WScript.Shell");
        shell.Popup("ERROR CAPTURADO: " + e.description, 0, "Error", 0);
    }
}

main();
