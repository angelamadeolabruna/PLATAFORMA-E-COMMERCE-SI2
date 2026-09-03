// ================================================================
// ANÁLISIS ARQUITECTÓNICO — PAQUETES DEL CICLO 1 (SOLO PAQUETES)
// Tiendas Montaño | 6 paquetes | Dependencias
// Ejecutar en EA: Scripting > JScript > Run
// ================================================================

function main()
{
    var selectedObject = Repository.GetTreeSelectedObject();
    var pkg;
    if (selectedObject.ObjectType == 4) { pkg = selectedObject; }
    else { pkg = Repository.Models.GetAt(0); }

    // DIAGRAMA
    var diagram = pkg.Diagrams.AddNew("Análisis Arquitectónico - Paquetes Ciclo 1", "Logical");
    diagram.Update();

    // -------------------------------------------------------
    // HELPERS
    // -------------------------------------------------------
    function crearSubPaquete(nombre) {
        var sp = pkg.Packages.AddNew(nombre, "");
        sp.Update();
        return sp;
    }
    function crearPaqueteVisual(nombre) {
        var e = pkg.Elements.AddNew(nombre, "Package");
        e.Update();
        return e;
    }
    function posPaquete(elemento, l, t, r, b) {
        var obj = diagram.DiagramObjects.AddNew("l="+l+";r="+r+";t="+t+";b="+b+";", "");
        obj.ElementID = elemento.ElementID;
        obj.Update();
    }
    function dependencia(origen, destino) {
        try {
            var conn = origen.Connectors.AddNew("", "Dependency");
            conn.SupplierID = destino.PackageID;
            conn.Update();
            var link = diagram.DiagramLinks.AddNew("", "");
            link.ConnectorID = conn.ConnectorID;
            link.Update();
        } catch(e) {
            try {
                var elOrigen = Repository.GetElementByID(origen.PackageID);
                var conn2 = elOrigen.Connectors.AddNew("", "Dependency");
                conn2.SupplierID = destino.PackageID;
                conn2.Update();
                var link2 = diagram.DiagramLinks.AddNew("", "");
                link2.ConnectorID = conn2.ConnectorID;
                link2.Update();
            } catch(e2) {
                Session.Output("Dependencia no creada: " + origen.Name + " -> " + destino.Name);
            }
        }
    }

    // -------------------------------------------------------
    // 6 SUB-PAQUETES (carpetas en el Project Browser)
    // -------------------------------------------------------
    var pkgSeg = crearSubPaquete("1. Seguridad y Auditoría");
    var pkgUsr = crearSubPaquete("2. Gestión de Usuarios y Roles");
    var pkgSuc = crearSubPaquete("3. Gestión de Sucursales");
    var pkgCat = crearSubPaquete("4. Gestión de Catálogo");
    var pkgPrv = crearSubPaquete("5. Gestión de Proveedores y Compras");
    var pkgInv = crearSubPaquete("6. Gestión de Inventario y Almacén");

    // -------------------------------------------------------
    // 6 PAQUETES VISUALES EN EL DIAGRAMA
    // -------------------------------------------------------
    var visSeg = crearPaqueteVisual("1. Seguridad y Auditoría");
    var visUsr = crearPaqueteVisual("2. Gestión de Usuarios y Roles");
    var visSuc = crearPaqueteVisual("3. Gestión de Sucursales");
    var visCat = crearPaqueteVisual("4. Gestión de Catálogo");
    var visPrv = crearPaqueteVisual("5. Gestión de Proveedores y Compras");
    var visInv = crearPaqueteVisual("6. Gestión de Inventario y Almacén");

    // Posiciones: fila arriba y fila abajo
    posPaquete(visSeg,  30,  30, 350, 250);
    posPaquete(visUsr, 400,  30, 720, 250);
    posPaquete(visCat, 770,  30,1090, 250);
    posPaquete(visSuc,  30, 310, 350, 460);
    posPaquete(visPrv, 400, 310, 720, 460);
    posPaquete(visInv, 770, 310,1090, 460);

    // -------------------------------------------------------
    // DEPENDENCIAS ENTRE PAQUETES
    // -------------------------------------------------------
    dependencia(pkgUsr, pkgSeg);
    dependencia(pkgSuc, pkgSeg);
    dependencia(pkgCat, pkgSeg);
    dependencia(pkgPrv, pkgSeg);
    dependencia(pkgInv, pkgSeg);
    dependencia(pkgCat, pkgSuc);
    dependencia(pkgInv, pkgSuc);
    dependencia(pkgPrv, pkgCat);
    dependencia(pkgInv, pkgPrv);

    // -------------------------------------------------------
    Session.Output("=============================================");
    Session.Output("6 PAQUETES CREADOS (sin CU)");
    Session.Output("=============================================");
    Session.Output("1. Seguridad y Auditoría");
    Session.Output("2. Gestión de Usuarios y Roles");
    Session.Output("3. Gestión de Sucursales");
    Session.Output("4. Gestión de Catálogo");
    Session.Output("5. Gestión de Proveedores y Compras");
    Session.Output("6. Gestión de Inventario y Almacén");
    Session.Output("=============================================");
    Session.Output("Dependencias: 9");
    Session.Output("Si las dependencias no se dibujaron,");
    Session.Output("dibújalas manualmente como flechas punteadas.");
    Session.Output("=============================================");
}

main();
