# CU09 — Inhabilitar Empleado (Baja Lógica) — Especificación NestJS + React

**Proyecto:** Tiendas Montaño (prototipo web)
**Stack implementado:** Backend NestJS + TypeORM + PostgreSQL (Supabase) | Frontend React + Vite + Tailwind CSS
**Ruta backend:** `PATCH /api/v1/admin/empleados/{id_usuario}/deshabilitar`
**Ruta frontend:** `/admin/usuarios` (acción "Deshabilitar" en la tabla de empleados)
**Fuente original a adaptar:** `Detalle CU Ciclo 1 v3.md` (sección CU09, stack Angular/Flutter/FastAPI)

---

## 1. Propósito

Permitir al Administrador General desactivar la cuenta de un empleado (baja lógica) sin eliminar sus registros históricos, impidiendo que inicie sesión o realice operaciones, y conservando la trazabilidad para auditoría.

## 2. Actores

| Actor | Permiso requerido |
| --- | --- |
| Administrador General | `gestionar_empleados` (o `*`) |
| Cualquier otro rol | Sin acceso (HTTP 403) |

## 3. Endpoint

`PATCH /api/v1/admin/empleados/:id/deshabilitar`
- Header: `Authorization: Bearer {access_token}`
- Body (opcional): `{ "motivo": string }` → se persiste en `usuarios_empleados.motivo_baja`
- Extiende `SRV_EmpleadosService.inhabilitarEmpleado` y `CTR_Empleados.deshabilitarEmpleado`.

## 4. Reglas de negocio (orden de validación en backend)

1. Verificar permiso `gestionar_empleados` (leído de `roles.permisos_json` en cada request; soporta `*`). → si no, `403`.
2. El empleado debe existir. → si no, `404` "Empleado no encontrado.".
3. No auto-deshabilitación (`id == sesión actual`). → `400` "No puede deshabilitar su propia cuenta.".
4. No deshabilitar al superadministrador (rol `Administrador`). → `403` "No puede deshabilitar al superadministrador.".
5. `UPDATE usuarios SET estado='Inactivo' WHERE id_usuario=$1 AND estado='Activo'`; si 0 filas → `409` "El empleado ya está inactivo.".
6. `UPDATE usuarios_empleados SET fecha_baja=NOW(), motivo_baja=$2 WHERE usuario_id=$1`.
7. `INSERT bitacora_auditoria` (`UPDATE usuarios`, `old_data: { estado: 'Activo' }`, `new_data: { estado: 'Inactivo', motivo?, fecha_baja }`).
8. Respuesta `200 { detail: "Empleado deshabilitado." }`.

> Nota de esquema: `estado` vive en `usuarios`; `fecha_baja`/`motivo_baja` viven en `usuarios_empleados`. El superadministrador es el usuario con rol `Administrador` (no necesariamente `id_usuario = 1`).

## 5. Revocación de sesión

El guard `JwtAuthGuard` (dependencias.ts) ahora valida `usuarios.estado = 'Activo'` en **cada petición autenticada**:

- Carga al usuario desde la DB por request (ya lo hacía) y si `estado != 'Activo'` → `401` "Tu cuenta está deshabilitada. Contacta al administrador.".
- Efecto: el JWT de un empleado recién inhabilitado queda inutilizado de inmediato (no depende del `jti`/blacklist).
- El login (CU01) ya exigía `estado = 'Activo'`, por lo que el inhabilitado tampoco puede iniciar sesión.

## 6. UI React (`Usuarios.tsx`)

- Cada fila con `estado === 'Activo'` muestra el botón **Deshabilitar** (icono `UserX`, estilo danger–ghost).
- Al presionarlo se abre modal de confirmación: "¿Deshabilitar a {nombre}? Perderá el acceso al sistema." con campo opcional **Motivo** (textarea, max 255).
- Confirmar → `PATCH /admin/empleados/:id/deshabilitar` → toast "Empleado deshabilitado." y recarga; el badge pasa a "Inactivo" (gris) y el botón desaparece.
- Cliente (`api.ts`): `deshabilitarEmpleado(id, motivo?)`.

## 7. Excepciones verificadas (e2e)

| Código | Caso | Detalle retornado |
| --- | --- | --- |
| `200` | Baja correcta (con motivo) | `{ detail: "Empleado deshabilitado." }` |
| `409` | E1: ya inactivo | `El empleado ya está inactivo.` |
| `400` | E2: auto-deshabilitación | `No puede deshabilitar su propia cuenta.` |
| `403` | E3: superadministrador (desde otro admin) | `No puede deshabilitar al superadministrador.` |
| `403` | E4: sin permiso `gestionar_empleados` | `No tienes permiso para gestionar usuarios.` |
| `404` | E5: empleado inexistente | `Empleado no encontrado.` |
| `401` | Token de inhabilitado (guard) | `Tu cuenta está deshabilitada. Contacta al administrador.` |

## 8. Notas de validación (pruebas e2e realizadas)

- Creación + activación manual del empleado de prueba; token funcional antes de la baja (403 por permisos, no 401).
- Baja con motivo "Renuncia" → 200; `estado='Inactivo'`, `fecha_baja` y `motivo_baja` seteados; bitácora con `old_data`/`new_data`.
- Login del inhabilitado rechazado (401); token previo rechazado por el guard (401).
- Re-baja → 409; superadmin desde otro admin → 403; auto-deshabilitación → 400; inexistente → 404; cliente sin permiso → 403.
- Datos de prueba eliminados al finalizar.

## 9. Casos de uso relacionados

- CU01 (Login — exige `estado='Activo'`), CU07 (Registro — alta del empleado), CU10 (Rehabilitar — acción inversa), CU11 (Bitácora — `old_data`/`new_data`).