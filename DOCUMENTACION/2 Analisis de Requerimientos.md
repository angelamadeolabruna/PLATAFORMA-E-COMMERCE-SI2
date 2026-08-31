# 2. ANÁLISIS DE REQUERIMIENTOS

## 2.1 ACTORES PRINCIPALES

**Cliente**
- Registrarse e iniciar sesión.
- Consultar catálogo.
- Buscar y filtrar prendas.
- Consultar tallas y colores.
- Consultar disponibilidad por sucursal.
- Utilizar el vestidor virtual.
- Reservar varias prendas.
- Consultar y cancelar reservas.
- Comprar desde web o móvil.
- Realizar pagos electrónicos.
- Consultar historial de compras.
- Recibir recomendaciones mediante IA.

**Administrador**
- Gestionar usuarios y roles.
- Gestionar sucursales.
- Gestionar productos.
- Gestionar categorías, tallas y colores.
- Gestionar temporadas y colecciones.
- Gestionar proveedores.
- Consultar inventario global.
- Gestionar promociones.
- Consultar ventas y reservas.
- Visualizar indicadores empresariales.

**Encargado de sucursal**
- Consultar reservas.
- Preparar prendas reservadas.
- Confirmar recepción del cliente.
- Gestionar disponibilidad de prendas.
- Registrar movimientos de inventario.
- Consultar ventas de la sucursal.

**Cajero**
- Consultar productos.
- Registrar ventas presenciales.
- Procesar pagos en caja.
- Emitir comprobantes.
- Actualizar inventario después de una venta.

**Proveedor**
- Registrar o enviar información de productos.
- Informar disponibilidad de productos.
- Asociar productos con temporadas y colecciones.

**Sistema de pagos**
- Procesar pagos electrónicos.
- Confirmar o rechazar transacciones.
- Informar el estado del pago.

**Servicio de inteligencia artificial**
- Analizar preferencias.
- Recomendar productos.
- Asistir al cliente mediante chatbot o asistente inteligente.
- Generar reportes generativos bajo demanda, vía comando de voz.

## 2.2 REQUISITOS FUNCIONALES (RF01–RF25)

- **RF01.** El sistema deberá permitir registrar clientes.
- **RF02.** El sistema deberá permitir gestionar usuarios y roles.
- **RF03.** El sistema deberá administrar múltiples ciudades y sucursales.
- **RF04.** El sistema deberá permitir gestionar productos de ropa.
- **RF05.** El sistema deberá gestionar tallas, colores, categorías y temporadas.
- **RF06.** El sistema deberá gestionar proveedores.
- **RF07.** El cliente deberá poder consultar el catálogo desde web y móvil.
- **RF08.** El cliente deberá poder consultar disponibilidad por sucursal.
- **RF09.** El cliente deberá poder seleccionar múltiples prendas para una reserva.
- **RF10.** El sistema deberá registrar y gestionar reservas.
- **RF11.** El sistema deberá notificar las reservas a la sucursal correspondiente.
- **RF12.** El sistema deberá permitir consultar el estado de una reserva.
- **RF13.** La aplicación móvil deberá permitir utilizar el vestidor virtual.
- **RF14.** El cliente deberá poder agregar productos al carrito.
- **RF15.** El cliente deberá poder comprar mediante la plataforma web.
- **RF16.** El cliente deberá poder comprar mediante la aplicación móvil.
- **RF17.** El cajero deberá poder registrar ventas presenciales.
- **RF18.** El sistema deberá permitir pagos en punto de caja.
- **RF19.** El sistema deberá integrar una pasarela de pago para compras digitales.
- **RF20.** El sistema deberá actualizar automáticamente el inventario después de una venta.
- **RF21.** El sistema deberá controlar las existencias por sucursal.
- **RF22.** El sistema deberá registrar movimientos de inventario.
- **RF23.** El sistema deberá gestionar temporadas y colecciones.
- **RF24.** El sistema deberá permitir consultar reportes de ventas e inventario.
- **RF25.** El sistema deberá proporcionar al menos una funcionalidad basada en inteligencia artificial.

## 2.3 REQUISITOS NO FUNCIONALES (RNF01–RNF09)

- **RNF01. Seguridad:** las contraseñas y datos sensibles deberán protegerse adecuadamente.
- **RNF02. Rendimiento:** las consultas del catálogo deberán responder en tiempos adecuados.
- **RNF03. Disponibilidad:** el sistema deberá estar disponible para usuarios web y móviles.
- **RNF04. Escalabilidad:** la arquitectura deberá permitir incorporar nuevas sucursales y ciudades.
- **RNF05. Usabilidad:** las interfaces deberán ser intuitivas y adaptables a diferentes dispositivos.
- **RNF06. Mantenibilidad:** el código deberá organizarse en módulos y seguir buenas prácticas.
- **RNF07. Integración:** FastAPI deberá proporcionar servicios mediante API REST.
- **RNF08. Compatibilidad:** la aplicación móvil deberá desarrollarse utilizando Flutter/Dart.
- **RNF09. Seguridad transaccional:** las operaciones de pago deberán utilizar mecanismos seguros y, para el proyecto académico, entornos de prueba.

## 2.4 MATRIZ DE TRAZABILIDAD RF ↔ MÓDULOS

| Requisito | Módulo(s) del Alcance que lo cubren |
|-----------|--------------------------------------|
| RF01 | 1.5.1 Usuarios, roles y seguridad |
| RF02 | 1.5.1 Usuarios, roles y seguridad |
| RF03 | 1.5.2 Ciudades y sucursales |
| RF04 | 1.5.3 Catálogo de prendas |
| RF05 | 1.5.4 Tallas, colores, categorías y temporadas |
| RF06 | 1.5.5 Proveedores y colecciones |
| RF07 | 1.5.3 Catálogo + Aplicación Móvil (acceso remoto) |
| RF08 | 1.5.6 Inventario + 1.5.7 Disponibilidad consolidada |
| RF09 | 1.5.8 Reservas y atención en sucursal |
| RF10 | 1.5.8 Reservas y atención en sucursal |
| RF11 | 1.5.8 Reservas + Alertas y notificaciones (App) |
| RF12 | 1.5.8 Reservas y atención en sucursal |
| RF13 | 1.5.9 Vestidor virtual RA + Aplicación Móvil |
| RF14 | 1.5.10 Carrito y compra digital |
| RF15 | 1.5.10 Carrito + 1.5.12 Pasarela de pago |
| RF16 | 1.5.10 Carrito + 1.5.12 Pasarela de pago + Aplicación Móvil |
| RF17 | 1.5.11 Ventas presenciales en caja |
| RF18 | 1.5.11 Ventas presenciales en caja |
| RF19 | 1.5.12 Pasarela de pago |
| RF20 | 1.5.6 Kardex + 1.5.11/1.5.12 Ventas |
| RF21 | 1.5.6 Inventario por sucursal + 1.5.7 Disponibilidad |
| RF22 | 1.5.6 Kardex de inventario |
| RF23 | 1.5.4 Temporadas + 1.5.5 Proveedores/colecciones |
| RF24 | 1.5.15 Reportes y dashboards + Panel de reportes (App) |
| RF25 | 1.5.14 Inteligencia artificial |

> Resultado de verificación: los 25 RF y los 9 RNF están cubiertos por los 15 módulos funcionales y el apartado Aplicación Móvil del Alcance. No falta ningún requisito del enunciado.