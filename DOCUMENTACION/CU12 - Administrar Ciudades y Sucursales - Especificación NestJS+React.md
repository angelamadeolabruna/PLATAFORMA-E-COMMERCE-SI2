# CU12 — Administrar Ciudades y Sucursales — Especificación NestJS + React

**Proyecto:** Tiendas Montaño (prototipo web)
**Stack implementado:** Backend NestJS + TypeORM + PostgreSQL (Supabase) | Frontend React + Vite + Tailwind CSS
**Rutas backend:** `/api/v1/admin/ciudades` y `/api/v1/admin/sucursales` (paquete gestión de sucursales)
**Ruta frontend:** `/admin/sucursales` (pestañas Ciudades / Sucursales)
**Fuente original a adaptar:** `Detalle CU Ciclo 1 v3.md` (sección CU12, stack Angular/Flutter/FastAPI)

---

## 1. Propósito

Permitir al Administrador General crear, modificar e inhabilitar ciudades y sucursales de Tiendas Montaño, para estructurar la red de tiendas físicas y habilitar la disponibilidad de inventario por ubicación.

## 2. Actores

| Actor | Permiso requerido |
| --- | --- |
| Administrador General | `gestionar_sucursales` (o `*`) |
| Cualquier otro rol | Sin acceso (HTTP 403) |

> El permiso `gestionar_sucursales` ya forma parte del catálogo canónico (grupo "Sucursales"). El rol Administrador tiene `*`.

## 3. Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/admin/ciudades` | Lista ciudades con `nro_sucursales` por ciudad |
| `POST` | `/admin/ciudades` | Crea ciudad `{ nombre*, departamento* }` → 201 |
| `PUT` | `/admin/ciudades/:id` | Modifica nombre/departamento → 200 + bitácora old/new |
| `PATCH` | `/admin/ciudades/:id/estado` | `{ estado: 'Activa'/'Inactiva' }` → 200 |
| `GET` | `/admin/sucursales` | Lista sucursales con ciudad (join) |
| `POST` | `/admin/sucursales` | Crea sucursal `{ nombre*, id_ciudad*, direccion*, telefono? }` → 201 |
| `PUT` | `/admin/sucursales/:id` | Modifica sucursal → 200 + bitácora old/new |
| `PATCH` | `/admin/sucursales/:id/estado` | `{ estado }` → 200; verifica inventario activo al inhabilitar |
| `GET` | `/admin/sucursales/activas` | Helper CU07 (solo activas, id+nombre), usado por el modal "Nuevo Empleado" |

Todos exigen `Authorization: Bearer {access_token}` y permiso `gestionar_sucursales`.

## 4. Reglas de negocio

1. **Ciudades**: validar permiso → validar `nombre`/`departamento` no vacíos → duplicado por nombre (case-insensitive) → 409 `"La ciudad ya está registrada."` → INSERT con `estado='Activa'` → bitácora `INSERT` (new_data).
2. **Modificar ciudad**: 404 si no existe; nombre vacío → 400; duplicado (otra ciudad) → 409; UPDATE + bitácora old/new.
3. **Inhabilitar ciudad**: si tiene sucursales `Activa` → 409 `"La ciudad tiene sucursales activas. Inhabilite primero sus sucursales."` (E5, adicional por el propósito de modificar/inhabilitar ciudades); UPDATE estado + bitácora old/new.
4. **Sucursales**: validar permiso → validar `nombre`/`direccion` → la ciudad debe existir y estar **activa** (si no → 400 E2) → INSERT `estado='Activa'` + bitácora `INSERT`.
5. **Modificar sucursal**: 404 si no existe; ciudad inexistente → 400; UPDATE + bitácora old/new.
6. **Inhabilitar sucursal (E3)**: consulta `inventario_stock` por `id_sucursal`; si hay filas con `cantidad_disponible > 0` o `cantidad_reservada > 0` → 409 `"La sucursal tiene inventario activo. Reubique o agote el stock antes de inhabilitarla."`; si no → UPDATE estado + bitácora.
7. Reactivar siempre permitido (no requiere inventario).

## 5. Adaptación de esquema

- `ciudades` ganó la columna `departamento varchar(60)` (migración: `ALTER TABLE ciudades ADD COLUMN IF NOT EXISTS departamento varchar(60)`); la ciudad existente "La Paz" quedó con departamento "La Paz". Se conservan `pais` (default 'Bolivia'), `estado` y la unicidad de `nombre`.
- `sucursales` conserva su estructura actual: `nombre, direccion, id_ciudad (FK), telefono, estado, fecha_registro`. El campo opcional `encargado_id` se omite (columna inexistente en el esquema).
- Para la comprobación E3 se lee `inventario_stock`.

## 6. UI React (`Sucursales.tsx`)

- Pestañas **Ciudades** / **Sucursales** (botones estilo tab).
- **Ciudades**: columnas Nombre, Departamento, Estado (badge Activa=verde / Inactiva=gris), Nº de sucursales, Acciones (Editar, Inhabilitar/Reactivar). Botón "Nueva Ciudad" → modal `ModalCiudad` (nombre* + departamento*).
- **Sucursales**: columnas Nombre, Ciudad (badge), Dirección, Teléfono, Estado, Acciones. Botón "Nueva Sucursal" → modal `ModalSucursal` (nombre*, select de ciudades activas, dirección*, teléfono opcional).
- `ModalConfirmarCambio` para inhabilitar/reactivar con confirmación; toasts en cada operación; refresco de ambas tablas tras cada mutación.
- Sin permiso `gestionar_sucursales`: el módulo no aparece en el menú y la página muestra "Acceso denegado".
- Cliente (`api.ts`): `listarCiudades`, `crearCiudad`, `actualizarCiudad`, `cambiarEstadoCiudad`, `listarSucursales`, `crearSucursal`, `actualizarSucursal`, `cambiarEstadoSucursal`.

## 7. Excepciones verificadas (e2e)

| Código | Caso | Detalle retornado |
| --- | --- | --- |
| `201` | Crear ciudad / sucursal | `{ detail, id_ciudad / id_sucursal }` |
| `409` | E1: ciudad duplicada (case-insensitive) | `La ciudad ya está registrada.` |
| `400` | E2: sucursal con ciudad inexistente/inactiva | `La ciudad seleccionada no existe o está inactiva.` |
| `409` | E3: sucursal con inventario activo | `La sucursal tiene inventario activo. Reubique o agote el stock antes de inhabilitarla.` |
| `403` | E4: sin permiso | `No tienes permiso para gestionar sucursales.` |
| `409` | E5: ciudad con sucursales activas | `La ciudad tiene sucursales activas. Inhabilite primero sus sucursales.` |
| `404` | E6: registro inexistente en PUT/PATCH | `Ciudad no encontrada.` / `Sucursal no encontrada.` |

## 8. Notas de validación (pruebas e2e realizadas)

- Ciudad 201 + duplicado 409; sucursal 201 + ciudad inválida 400.
- PUT ciudad y sucursal → 200 con bitácora old/new correcta.
- E5 y E3 verificados (con inyección temporal de una fila en `inventario_stock` mediante `session_replication_role=replica` para simular stock, eliminada al terminar).
- Ciclo completo inhabilitar/reactivar (sucursal → ciudad → reactivación de ambas) → 200 con bitácora.
- Cliente sin permiso → 403.
- `GET /admin/sucursales/activas` (CU07) verificado sin colisión con `GET /admin/sucursales` (CU12).
- Datos de prueba eliminados al finalizar; quedaron solo "La Paz" y "Sucursal Centro" (ambas activas).

## 9. Casos de uso relacionados

- CU07 (Empleado se asocia a sucursal), CU13 (Producto por sucursal), CU17 (Disponibilidad por sucursal), CU23 (Kardex por sucursal), CU11 (Bitácora old/new).