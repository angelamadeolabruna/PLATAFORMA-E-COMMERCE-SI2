# CU08 — Roles y Permisos (RBAC) — Especificación NestJS + React

**Proyecto:** Tiendas Montaño (prototipo web)
**Stack implementado:** Backend NestJS + TypeORM + PostgreSQL (Supabase) | Frontend React + Vite + Tailwind CSS
**Ruta backend:** `/api/v1/admin/roles*`
**Ruta frontend:** `/admin/roles` (panel AdminLayout, rol con permiso `gestionar_roles`)
**Fuente original a adaptar:** `Detalle CU Ciclo 1 v3.md` (sección CU08, stack Angular/Flutter/FastAPI)

---

## 1. Propósito

Permitir al Administrador General definir y ajustar los permisos de acceso de cada rol del sistema (RBAC), controlando qué módulos y acciones puede ejecutar cada tipo de usuario, manteniendo la trazabilidad de cada cambio en la bitácora de auditoría.

## 2. Actores

| Actor | Permiso requerido |
| --- | --- |
| Administrador General | `gestionar_roles` (o `*`) |
| Cualquier otro rol | Sin acceso (HTTP 403) |

## 3. Catálogo canónico de permisos (8 grupos, 21 permisos)

Este catálogo es la fuente única de verdad. Todos los módulos del sistema deben exigir estos nombres en `roles.permisos_json`.

| Grupo | Permisos |
| --- | --- |
| Usuarios | `gestionar_empleados`, `gestionar_roles` |
| Sucursales | `gestionar_sucursales` |
| Catálogo | `gestionar_productos`, `gestionar_tallas_colores`, `gestionar_temporadas`, `consultar_catalogo` |
| Inventario | `gestionar_inventario`, `consultar_kardex`, `ajustar_stock`, `gestionar_alertas` |
| Proveedores | `gestionar_proveedores`, `evaluar_proveedores`, `elaborar_orden_compra` |
| Ventas | `realizar_venta`, `gestionar_reservas`, `procesar_pago`, `gestionar_devoluciones`, `consultar_reportes` |
| Respaldos | `respaldos` |
| Seguridad y Auditoría | `ver_auditoria` |

### Roles base en la base de datos

| id_rol | nombre_rol | permisos_json |
| --- | --- | --- |
| 1 | Administrador | `["*"]` (acceso total; protegido) |
| 2 | Encargado de Sucursal | `gestionar_productos`, `consultar_kardex`, `gestionar_inventario`, `elaborar_orden_compra`, `gestionar_reservas` |
| 3 | Cajero | `procesar_pago`, `consultar_kardex`, `realizar_venta`, `gestionar_devoluciones` |
| 4 | Cliente | `consultar_catalogo`, `realizar_venta`, `gestionar_reservas` |
| 5 | Proveedor | `[]` |

> **Migración (2026):** los nombres heredados se re-mapearon al catálogo canónico: `gestionar_usuarios→gestionar_empleados`, `gestionar_catalogo→gestionar_productos`, `ver_inventario→consultar_kardex`, `editar_inventario→gestionar_inventario`, `gestionar_compras→elaborar_orden_compra`, `gestionar_recepciones→gestionar_inventario`, `procesar_pagos→procesar_pago`, `registrar_venta→realizar_venta`, `ver_catalogo→consultar_catalogo`, `comprar→realizar_venta`, `reservar→gestionar_reservas`. Los permisos sin equivalente se descartaron.

## 4. Endpoints

Todas las rutas exigen `Authorization: Bearer {access_token}` y permiso `gestionar_roles`.

| Método | Ruta | Descripción | Respuesta |
| --- | --- | --- | --- |
| GET | `/api/v1/admin/roles` | Lista roles con nº de usuarios (`nro_usuarios`) y sus permisos | `200` array de `RolItem` |
| GET | `/api/v1/admin/roles/permisos-catalogo` | Devuelve el catálogo agrupado | `200` `{ grupos: GrupoPermisos[] }` |
| GET | `/api/v1/admin/roles/:rolId/permisos` | Permisos actuales de un rol | `200` o `404` |
| PUT | `/api/v1/admin/roles/:rolId/permisos` | Actualiza permisos de un rol | `200` / `404` / `422` / `403` |
| POST | `/api/v1/admin/roles` | Crea rol nuevo | `201` `{ detail, id_rol }` |
| PUT | `/api/v1/admin/roles/:rolId` | Edita nombre/descripción | `200` |
| DELETE | `/api/v1/admin/roles/:rolId` | Elimina rol sin usuarios | `200` |

`RolItem`:

```json
{
  "id_rol": 3,
  "nombre_rol": "Cajero",
  "descripcion": null,
  "estado": "Activo",
  "nro_usuarios": 0,
  "permisos": ["procesar_pago", "consultar_kardex", "realizar_venta", "gestionar_devoluciones"]
}
```

## 5. Implementación backend

- `SRV_RolesService.ts`: catálogo (`CATALOGO_PERMISOS`, `TODOS_PERMISOS`), CRUD de roles, conteo de usuarios por subquery (`getRawMany` + `addSelect`), validación de permisos y bitácora.
- `CTR_Roles.ts`: controlador con DTOs de `class-validator` (validación global `ValidationPipe` con `whitelist`).
- Verificación de permisos: se lee `roles.permisos_json` desde la DB en **cada request** (`cargarPermisos`), no del JWT. Soporta el comodín `"*"`.
- Bitácora: `BitacoraService.registrar(...)` con `old_data`/`new_data` (JSONB) para registrar permisos anteriores y nuevos.

### Protecciones del rol Administrador (id 1)

- No puede eliminarse → `403`.
- No puede renombrarse (nombre fijo "Administrador") → `403`.
- No puede perder el permiso `gestionar_roles` → `403`.
- En la UI, los permisos del Administrador se muestran pero `gestionar_roles` queda marcado como "obligatorio" (checkbox deshabilitado) y los botones Editar/Eliminar están deshabilitados.

## 6. Flujo principal (camino feliz) — React

1. El Administrador abre el panel y navega a **Roles y Permisos** (`/admin/roles`).
2. El frontend ejecuta `GET /admin/roles` y `GET /admin/roles/permisos-catalogo` en paralelo.
3. Se renderiza la tabla con columnas: Rol (nombre + descripción), Usuarios (badge con cantidad), Permisos (conteo), Estado (badge Activo/Inactivo), Acciones.
4. El Administrador presiona **Nuevo Rol** → modal con Nombre (requerido) y Descripción (opcional) → `POST /admin/roles` → `201`. El rol se crea con permisos vacíos; luego se asignan.
5. El Administrador presiona **Permisos** en la fila del rol → modal con los 8 grupos agrupados (checklist), cargando `GET /admin/roles/:id/permisos`.
6. Marca/desmarca permisos (el encabezado del grupo selecciona el grupo completo; el contador `n/m` indica avance).
7. Presiona **Guardar Permisos** → `PUT /admin/roles/:id/permisos` con `{ "permisos": [...] }` → `200` → toast de éxito y recarga.
8. Editar rol → `PUT /admin/roles/:id` (nombre/descripción).
9. Eliminar rol (solo si tiene 0 usuarios) → modal de confirmación → `DELETE /admin/roles/:id` → `200`.

## 7. Excepciones verificadas (e2e)

| Código | Caso | Detalle retornado |
| --- | --- | --- |
| `422` | E1: permiso no existente en el catálogo | `Permiso no reconocido: {nombres}.` |
| `400` | E2: cuerpo `permisos` no es array | `Formato de permisos inválido.` |
| `409` | E3: rol con usuarios asignados | `No se puede eliminar un rol con usuarios asignados.` |
| `404` | E4: rol inexistente | `Rol no encontrado.` |
| `403` | E5: rol Administrador (eliminar / renombrar / quitar `gestionar_roles`) | mensajes descriptivos (ver §5) |
| `409` | E6: nombre de rol duplicado | `Ya existe un rol con ese nombre.` |
| `403` | E7: sesión sin permiso `gestionar_roles` | `No tienes permiso para gestionar roles y permisos.` |
| `401` | E8: token inválido/expirado | manejado por `JwtAuthGuard` + `AuthContext` |

## 8. Bitácora (auditoría)

Cada operación registra un evento en `bitacora_auditoria`:

- `INSERT roles` → `accion_sql: 'INSERT'`, `new_data` omitido (solo detalle en descripción).
- `UPDATE roles/permisos` → `old_data: { permisos: [...] }`, `new_data: { permisos: [...] }`.
- `UPDATE roles` (nombre/descripción) y `DELETE roles` → detalle en descripción, `registro_id = id_rol`.

## 9. Notas de validación (pruebas e2e realizadas)

- T1 `GET /roles` → 5 roles; T2 catálogo → 8 grupos / 21 permisos; T3 actualizar permisos Cajero OK y reversión OK.
- T4/T5/T6 crear → editar → eliminar rol sin usuarios (201 / 200 / 200).
- E1 `422` permiso desconocido; E2 `409` borrar Cliente (7 usuarios); E3a/b/c `403` sobre rol Administrador.
- E4 cliente sin permiso → `403` en `/roles`, `/roles/permisos-catalogo`, `/roles/1/permisos`.
- CU07 verificado con prefijo canónico: cliente → `403` en `/admin/empleados` y `/admin/sucursales`; admin → `200`.

## 10. Casos de uso relacionados

- CU01 (Iniciar Sesión): los permisos del rol se cargan en la sesión (`UsuarioSesion.permisos`).
- CU07 (Registrar Empleado): asigna un rol; exige `gestionar_empleados`.
- CU09 / CU10 (Inhabilitar/Rehabilitar Empleado): exigen `gestionar_empleados`.
- CU11 (Bitácora de Auditoría): exige `ver_auditoria`.
- CU12–CU27: usan los permisos canónicos del catálogo (ver §3).