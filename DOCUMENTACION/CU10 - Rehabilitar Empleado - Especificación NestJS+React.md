# CU10 — Rehabilitar Empleado — Especificación NestJS + React

**Proyecto:** Tiendas Montaño (prototipo web)
**Stack implementado:** Backend NestJS + TypeORM + PostgreSQL (Supabase) | Frontend React + Vite + Tailwind CSS
**Ruta backend:** `PATCH /api/v1/admin/empleados/{id_usuario}/rehabilitar`
**Ruta frontend:** `/admin/usuarios` (acción "Rehabilitar" en la fila con estado Inactivo)
**Fuente original a adaptar:** `Detalle CU Ciclo 1 v3.md` (sección CU10, stack Angular/Flutter/FastAPI)

---

## 1. Propósito

Permitir al Administrador General reactivar la cuenta de un empleado previamente deshabilitado (baja lógica), restableciendo su acceso al sistema conservando su rol, sucursal y permisos.

## 2. Actores

| Actor | Permiso requerido |
| --- | --- |
| Administrador General | `gestionar_empleados` (o `*`) |
| Cualquier otro rol | Sin acceso (HTTP 403) |

## 3. Endpoint

`PATCH /api/v1/admin/empleados/:id/rehabilitar`
- Header: `Authorization: Bearer {access_token}` (sin body)
- Implementación: `SRV_EmpleadosService.rehabilitarEmpleado` y `CTR_Empleados.rehabilitarEmpleado`.

## 4. Reglas de negocio (orden de validación en backend)

1. Verificar permiso `gestionar_empleados` (leído de `roles.permisos_json` en cada request; soporta `*`). → si no, `403`.
2. El empleado debe existir. → si no, `404` "Empleado no encontrado.".
3. `UPDATE usuarios SET estado='Activo' WHERE id_usuario=$1 AND LOWER(estado)='inactivo'`; si 0 filas → `409` "El empleado no se encuentra inactivo.".
4. `UPDATE usuarios_empleados SET fecha_baja=NULL, motivo_baja=NULL WHERE usuario_id=$1`.
5. Rol, sucursal y permisos del empleado permanecen intactos (no se toca nada más).
6. `INSERT bitacora_auditoria` (`UPDATE usuarios`, `old_data: { estado: 'Inactivo' }`, `new_data: { estado: 'Activo' }`).
7. Respuesta `200 { detail: "Empleado rehabilitado." }`; la contraseña del empleado queda igual.

## 5. Rehabilitación y guard JWT

- Al quedar `estado='Activo'`, `JwtAuthGuard` (que exige `Estado='Activo'` en cada request) vuelve a aceptar el acceso en el siguiente login (CU01) con las credenciales previas.
- `fecha_baja`/`motivo_baja` (en `usuarios_empleados`) quedan en NULL tras la reactivación.

## 6. UI React (`Usuarios.tsx`)

- Cada fila con `estado === 'Inactivo'` muestra el botón **Rehabilitar** (icono `UserCheck`, estilo success–ghost).
- Se abre modal de confirmación: "¿Rehabilitar a {nombre}? Recuperará el acceso al sistema." (sin campos adicionales).
- Confirmar → `PATCH /admin/empleados/:id/rehabilitar` → toast "Empleado rehabilitado." y recarga; el badge pasa a "Activo" (verde) y el botón pasa a "Deshabilitar" (CU09).
- Cliente (`api.ts`): `rehabilitarEmpleado(id)`.

## 7. Excepciones verificadas (e2e)

| Código | Caso | Detalle retornado |
| --- | --- | --- |
| `200` | Rehabilitación correcta (estado Inactivo → Activo) | `{ detail: "Empleado rehabilitado." }` |
| `409` | E1: el empleado no está inactivo | `El empleado no se encuentra inactivo.` |
| `403` | E2: sin permiso `gestionar_empleados` | `No tienes permiso para gestionar usuarios.` |
| `404` | E3: empleado inexistente | `Empleado no encontrado.` |

## 8. Notas de validación (pruebas e2e realizadas)

- Empleado de prueba creado (CU07) y puesto `Inactivo` con `fecha_baja`/`motivo_baja` por DB para simular baja previa.
- Rehabilitación → 200; `estado='Activo'`, `fecha_baja`/`motivo_baja` NULL, rol "Cajero" intacto; login posterior OK.
- Re-rehabilitar (ya activo) → 409; inexistente → 404; cliente sin permiso → 403.
- Bitácora con `old_data: { estado: 'Inactivo' }` / `new_data: { estado: 'Activo' }` confirmada.
- Datos de prueba eliminados al finalizar.

## 9. Casos de uso relacionados

- CU09 (Inhabilitar — acción inversa; el botón "Rehabilitar" aparece tras la baja), CU01 (Login — retoma acceso con las mismas credenciales), CU07 (Registro — datos de rol/sucursal intactos), CU11 (Bitácora — `old_data`/`new_data`).