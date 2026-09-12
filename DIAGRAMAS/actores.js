!INC Local Scripts.EAConstants-JScript

function main()
{
    var repo as EA.Repository;
    repo = Repository;

    var proyecto as EA.Package;
    proyecto = repo.Models.GetAt(0);

    // 1. Crear el paquete "Actores"
    var pqActores as EA.Package;
    pqActores = proyecto.Packages.AddNew("Actores", "Package");
    pqActores.Update();
    proyecto.Packages.Refresh();

    // 2. Definir los 7 actores: nombre y notas (responsabilidades)
    var nombres = new Array(
        "Cliente",
        "Administrador General",
        "Encargado de Sucursal",
        "Cajero",
        "Proveedor",
        "Sistema de Pagos",
        "Servicio de Inteligencia Artificial"
    );

    var notas = new Array(
        "Actor interno con autenticacion. Registrarse e iniciar sesion, consultar catalogo, buscar/filtrar prendas, consultar tallas y colores, consultar disponibilidad por sucursal, usar vestidor virtual (RA), reservar varias prendas, consultar y cancelar reservas, comprar en web o movil, realizar pagos electronicos, consultar historial de compras, recibir recomendaciones con IA.",
        "Actor interno. Gestionar usuarios y roles (RBAC), sucursales, productos, categorias/tallas/colores, temporadas y colecciones, proveedores, consultar inventario global, gestionar promociones, consultar ventas y reservas, visualizar indicadores empresariales.",
        "Actor interno. Consultar reservas, preparar prendas reservadas, confirmar recepcion del cliente, gestionar disponibilidad, registrar movimientos de inventario, consultar ventas de la sucursal.",
        "Actor interno. Consultar productos, registrar ventas presenciales, procesar pagos en caja, emitir comprobantes, actualizar inventario tras una venta.",
        "Actor externo, sin login, registrado transaccionalmente. Enviar/registrar informacion de productos, informar disponibilidad, asociar productos con temporadas y colecciones.",
        "Sistema externo. Procesar pagos electronicos, confirmar o rechazar transacciones, informar el estado del pago.",
        "Sistema externo. Analizar preferencias, recomendar productos, asistir al cliente mediante chatbot/asistente, generar reportes generativos por voz."
    );

    // 3. Coordenadas para 2 columnas (internos a la izquierda, externos a la derecha)
    var colX = new Array(0, 0, 0, 0, 250, 250, 250);
    var colT = new Array(0, 150, 300, 450, 0, 150, 300);

    // 4. Crear el diagrama de Casos de Uso
    var diagUC as EA.Diagram;
    diagUC = pqActores.Diagrams.AddNew("Actores - Tiendas Montano", "Use Case");
    diagUC.Update();
    pqActores.Diagrams.Refresh();

    // 5. Crear cada actor, guardar sus notas y colocarlo en el diagrama
    for (var i = 0; i < nombres.length; i++)
    {
        var actor as EA.Element;
        actor = pqActores.Elements.AddNew(nombres[i], "Actor");
        actor.Notes = notas[i];
        actor.Update();
        pqActores.Elements.Refresh();

        var x1 = colX[i];
        var x2 = colX[i] + 100;
        var t1 = colT[i];
        var t2 = colT[i] + 100;

        var oDiagObj as EA.DiagramObject;
        oDiagObj = diagUC.DiagramObjects.AddNew("l=" + x1 + ";r=" + x2 + ";t=" + t1 + ";b=" + t2 + ";", "");
        oDiagObj.ElementID = actor.ElementID;
        oDiagObj.Update();
    }

    diagUC.DiagramObjects.Refresh();
    repo.OpenDiagram(diagUC.DiagramID);

    Session.Output("Listo: 7 actores creados y colocados en el diagrama 'Actores - Tiendas Montano'.");
}

main();