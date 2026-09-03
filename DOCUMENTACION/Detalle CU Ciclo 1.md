# DETALLE DE CASOS DE USO — CICLO 1 (Fundación y Núcleo de Datos)

---

## CU01 — Iniciar Sesión en Plataforma

Campo | Descripción
--- | ---
CASO DE USO | CU01 - Iniciar Sesión en Plataforma
PROPÓSITO | Permitir a los usuarios del sistema autenticarse con credenciales válidas y acceder a la funcionalidad correspondiente a su rol en la plataforma web o móvil.
DESCRIPCIÓN | La plataforma presenta una pantalla de inicio de sesión accesible desde /login (web) o la pantalla Login (móvil). El formulario contiene dos campos: correo electrónico y contraseña, un botón "Iniciar Sesión", un enlace "¿Olvidaste tu contraseña?" que redirige a CU05 y un enlace "¿No tienes cuenta? Regístrate" que redirige a CU03. Al enviar el formulario, el backend FastAPI recibe las credenciales, verifica que el correo exista en la tabla usuarios, compara el hash bcrypt de la contraseña ingresada con la almacenada y, si coincide, genera un token JWT (access_token + refresh_token) con el id, email, rol y permisos del usuario. El frontend almacena el token en httpOnly cookie (web) o Secure Storage (móvil) y redirige al usuario al dashboard correspondiente según su rol: Administrador → /inicio, Encargado de Sucursal → /sucursal, Cajero → /caja, Cliente → /catalogo. El sistema registra en la tabla bitacora_auditoria la fecha_hora, ip, dispositivo, email y resultado (exitoso/fallido). Se permiten máximo 5 intentos fallidos consecutivos; al quinto fallido la cuenta se bloquea temporalmente durante 15 minutos.
ACTORES | Administrador General, Encargado de Sucursal, Cajero, Cliente.
ACTOR INICIADOR | Cualquier usuario que desee acceder a la plataforma.
PRECONDICIÓN | El usuario debe existir en la tabla usuarios con estado = 'Activo'. Si es la primera vez que inicia sesión después del registro o del restablecimiento, debe haber confirmado su contraseña con CU06 o CU05 respectivamente.
FLUJO PRINCIPAL (Camino Feliz) | 1. El usuario ingresa a la ruta /login (web) o abre la pantalla de Login (móvil). 2. Ingresa su correo electrónico y contraseña en los campos del formulario. 3. El sistema valida en cliente que los campos no estén vacíos (validación reactiva Angular/Dart). 4. El usuario presiona "Iniciar Sesión". 5. El frontend envía una petición POST /api/auth/login con { email, password }. 6. El backend busca el registro en la tabla usuarios por email, verifica que estado = 'Activo' y que los intentos_fallidos < 5. 7. El backend compara el hash bcrypt de la contraseña con la almacenada en usuarios.password_hash. 8. Si coinciden, genera un JWT con payload { user_id, email, rol, permisos } y lo retorna junto con los datos básicos del usuario (nombre, rol, avatar). 9. El frontend almacena el token en httpOnly cookie o Secure Storage. 10. El sistema redirige al usuario al panel correspondiente a su rol. 11. El backend registra el evento exitoso en bitacora_auditoria.
POST CONDICIÓN | El usuario tiene una sesión activa con JWT válido, puede navegar por las funcionalidades autorizadas por su rol, y el evento queda registrado en la bitácora de auditoría.
EXCEPCIONES (Flujo Secundario) | - E1: Credenciales inválidas. Si el email no existe o la contraseña no coincide, el sistema retorna HTTP 401 y muestra el mensaje "Correo o contraseña incorrectos". Se incrementa el contador intentos_fallidos en la tabla usuarios. Se registra el intento fallido en bitacora_auditoria con la IP del dispositivo. - E2: Cuenta deshabilitada. Si usuarios.estado = 'Inactivo', el sistema no valida la contraseña y retorna HTTP 403 con el mensaje "Tu cuenta está deshabilitada. Contacta al administrador." - E3: Cuenta bloqueada por intentos. Si intentos_fallidos >= 5, el sistema verifica si han pasado menos de 15 minutos desde el último intento fallido. Si no han pasado, retorna HTTP 429 con "Demasiados intentos. Intenta de nuevo en X minutos." Si ya pasaron, resetea el contador y permite el intento. - E4: Token expirado. Si el usuario ya tenía sesión pero el JWT expiró, el sistema redirige automáticamente a /login con el mensaje "Tu sesión ha expirado. Inicia sesión nuevamente."

---

## CU02 — Cerrar Sesión Activa

Campo | Descripción
--- | ---
CASO DE USO | CU02 - Cerrar Sesión Activa
PROPÓSITO | Permitir al usuario cerrar su sesión de forma segura, invalidando su token JWT y eliminando las credenciales almacenadas en el dispositivo.
DESCRIPCIÓN | El usuario presiona el botón "Cerrar Sesión" ubicado en el menú de perfil (web: dropdown del avatar en la barra superior; móvil: ícono de salir en el menú hamburguesa). El frontend envía una petición POST /api/auth/logout con el token JWT vigente. El backend registra el token en una tabla token_blacklist con fecha de expiración para evitar su reutilización, y registra el evento en bitacora_auditoria. El frontend elimina la cookie o Secure Storage y redirige al usuario a la pantalla de login (/login) con el mensaje "Sesión cerrada correctamente."
ACTORES | Todos los usuarios autenticados.
ACTOR INICIADOR | El usuario que desea cerrar su sesión.
PRECONDICIÓN | El usuario debe tener una sesión activa (JWT válido en el cliente).
FLUJO PRINCIPAL (Camino Feliz) | 1. El usuario presiona "Cerrar Sesión" desde el menú de perfil. 2. El sistema muestra una confirmación: "¿Estás seguro que deseas cerrar sesión?" con botones "Cerrar Sesión" y "Cancelar". 3. El usuario confirma. 4. El frontend envía POST /api/auth/logout con el token JWT en el header Authorization. 5. El backend registra el jti (JWT ID) en la tabla token_blacklist con su fecha de expiración. 6. El backend registra el evento "Cierre de sesión" en bitacora_auditoria con timestamp, IP y dispositivo. 7. El frontend elimina la cookie httpOnly o Secure Storage. 8. El sistema redirige al usuario a /login con un toast de confirmación.
POST CONDICIÓN | La sesión queda invalidada; el token JWT ya no puede ser utilizado para acceder a la API. El evento queda registrado en la bitácora.
EXCEPCIONES (Flujo Secundario) | - E1: Token ya expirado. Si el JWT ya expiró cuando el usuario presiona cerrar, el sistema simplemente elimina las credenciales del cliente y redirige a /login sin intentar contactar al backend. - E2: Error de red. Si la petición POST /api/auth/logout falla por conectividad, el frontend de todas formas elimina las credenciales locales y redirige a /login; la invalidación remota del token se realizará cuando el backend detecte su expiración natural.

---

## CU03 — Registrar Nuevo Cliente

Campo | Descripción
--- | ---
CASO DE USO | CU03 - Registrar Nuevo Cliente
PROPÓSITO | Permitir a un usuario nuevo crear una cuenta de cliente en la plataforma para poder reservar prendas, comprar en línea, recibir recomendaciones personalizadas y acceder al vestidor virtual.
DESCRIPCIÓN | Desde la pantalla de login, el usuario presiona "¿No tienes cuenta? Regístrate". El sistema muestra un formulario de registro con campos: nombre completo, correo electrónico, contraseña, confirmar contraseña, teléfono (opcional) y aceptación de términos y condiciones. El formulario aplica validación en tiempo real: nombre mínimo 2 caracteres, email con formato válido, contraseña mínimo 8 caracteres con al menos una mayúscula, un número y un carácter especial, y las contraseñas deben coincidir. Al enviar, el backend valida unicidad del email en la tabla clientes, hashea la contraseña con bcrypt y crea el registro en la tabla usuarios (rol = 'Cliente', estado = 'Activo') y en la tabla clientes con los datos personales. Se genera automáticamente un email de bienvenida vía servicio de correo. El usuario es redirigido a una pantalla de "Cuenta creada — revisa tu correo para confirmar tu cuenta" (o confirmación automática según configuración).
ACTORES | Cliente (usuario nuevo).
ACTOR INICIADOR | Persona que desea crear una cuenta de cliente en Tiendas Montaño.
PRECONDICIÓN | No existir previamente una cuenta con el mismo correo electrónico en la tabla usuarios.
FLUJO PRINCIPAL (Camino Feliz) | 1. El usuario presiona "Regístrate" en la pantalla de login. 2. El sistema muestra el formulario de registro. 3. El usuario completa los campos: nombre, email, contraseña, confirmar contraseña, teléfono (opcional). 4. El sistema valida en tiempo reactividad (Angular: Reactive Forms / Dart: TextFormField + validator) que todos los campos cumplan las reglas. 5. El usuario acepta los Términos y Condiciones (checkbox obligatorio). 6. El usuario presiona "Crear Cuenta". 7. El frontend envía POST /api/clientes/registrar con { nombre, email, password, telefono }. 8. El backend verifica que el email no exista en usuarios. 9. El backend crea el registro en usuarios (rol='Cliente', password_hash=bcrypt, estado='Activo') y en clientes (nombre, email, telefono, fecha_registro=now()). 10. El backend genera un token de confirmación y envía email de bienvenida. 11. El sistema muestra "Cuenta creada exitosamente. Ya puedes iniciar sesión." y redirige a /login.
POST CONDICIÓN | Existe un registro activo en las tablas usuarios y clientes; el usuario puede iniciar sesión y usar las funcionalidades de cliente (catálogo, reservas, compra, vestidor virtual).
EXCEPCIONES (Flujo Secundario) | - E1: Email ya registrado. Si el email ya existe en la tabla usuarios, el backend retorna HTTP 409 Conflict con "Ya existe una cuenta con este correo electrónico". El foco se coloca en el campo email con borde rojo y el mensaje debajo. - E2: Contraseña débil. Si no cumple los requisitos mínimos, el frontend muestra "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial" debajo del campo. - E3: Contraseñas no coinciden. El frontend muestra "Las contraseñas no coinciden" debajo del campo confirmar contraseña. - E4: Campos obligatorios vacíos. El botón "Crear Cuenta" permanece deshabilitado hasta que los campos obligatorios sean válidos. - E5: Error de servidor. Si el backend retorna HTTP 500, se muestra "Error al crear la cuenta. Intenta de nuevo."

---

## CU04 — Cambiar Contraseña Propia

Campo | Descripción
--- | ---
CASO DE USO | CU04 - Cambiar Contraseña Propia
PROPÓSITO | Permitir al usuario autenticado actualizar su contraseña de acceso desde su perfil, como medida de seguridad preventiva.
DESCRIPCIÓN | Desde la pantalla de "Mi Perfil" (web: /mi-perfil, móvil: pantalla Perfil), el usuario accede a la sección "Seguridad" y presiona "Cambiar Contraseña". El sistema muestra un formulario con tres campos: contraseña actual, nueva contraseña y confirmar nueva contraseña. Las validaciones de la nueva contraseña son iguales a las del registro (mínimo 8 caracteres, una mayúscula, un número, un carácter especial). Al enviar, el backend verifica que la contraseña actual coincida con el hash almacenado, valida que la nueva contraseña sea diferente de la actual, actualiza el password_hash en la tabla usuarios y registra el evento en bitacora_auditoria. Se muestra un toast de confirmación "Contraseña actualizada correctamente."
ACTORES | Administrador General, Encargado de Sucursal, Cajero, Cliente.
ACTOR INICIADOR | El usuario que desea cambiar su contraseña.
PRECONDICIÓN | El usuario debe tener una sesión activa con JWT válido.
FLUJO PRINCIPAL (Camino Feliz) | 1. El usuario navega a Mi Perfil → Seguridad. 2. Presiona "Cambiar Contraseña". 3. Ingresa su contraseña actual. 4. Ingresa la nueva contraseña y la confirma. 5. El frontend valida que la nueva contraseña cumpla los requisitos y que ambas coincidan. 6. El usuario presiona "Guardar". 7. El frontend envía PUT /api/auth/cambiar-contraseña con { password_actual, password_nueva }. 8. El backend verifica que password_actual coincida con el hash. 9. El backend valida que password_nueva sea distinta de password_actual. 10. El backend actualiza usuarios.password_hash = bcrypt(password_nueva) y usuarios.fecha_actualizacion = now(). 11. El backend registra el evento en bitacora_auditoria. 12. El frontend muestra toast "Contraseña actualizada correctamente."
POST CONDICIÓN | La contraseña del usuario quedó actualizada; el próximo inicio de sesión requerirá la nueva contraseña.
EXCEPCIONES (Flujo Secundario) | - E1: Contraseña actual incorrecta. El backend retorna HTTP 401 con "La contraseña actual es incorrecta". El foco se coloca en el campo contraseña actual. - E2: Nueva contraseña igual a la actual. El backend retorna HTTP 400 con "La nueva contraseña debe ser diferente a la actual". - E3: Contraseña nueva débil. El frontend muestra las reglas de validación antes de enviar la petición. - E4: Sesión expirada. Si el JWT ya no es válido, se redirige a /login.

---

## CU05 — Recuperar Contraseña Olvidada

Campo | Descripción
--- | ---
CASO DE USO | CU05 - Recuperar Contraseña Olvidada (Reset vía email)
PROPÓSITO | Permitir al usuario restablecer su contraseña cuando la ha olvidado, mediante un enlace seguro enviado a su correo electrónico registrado.
DESCRIPCIÓN | Desde la pantalla de login, el usuario presiona "¿Olvidaste tu contraseña?". El sistema muestra un formulario con un campo: correo electrónico. Al enviar, el backend verifica que el email exista en la tabla usuarios con estado = 'Activo'. Si existe, genera un token de restablecimiento (UUID + timestamp, expira en 30 minutos), lo almacena en la tabla password_resets y envía un email al usuario con un enlace /restablecer-contraseña?token=xxx. Al abrir el enlace, el usuario ingresa su nueva contraseña y su confirmación. El backend valida el token (que no esté expirado ni usado), actualiza el password_hash y marca el token como usado.
ACTORES | Cliente, Administrador General, Encargado de Sucursal, Cajero.
ACTOR INICIADOR | El usuario que ha olvidado su contraseña.
PRECONDICIÓN | El usuario debe tener una cuenta activa en la tabla usuarios con un correo electrónico válido.
FLUJO PRINCIPAL (Camino Feliz) | 1. El usuario presiona "¿Olvidaste tu contraseña?" en la pantalla de login. 2. El sistema muestra el formulario "Restablecer Contraseña" con un campo de email. 3. El usuario ingresa su correo electrónico registrado. 4. Presiona "Enviar enlace de restablecimiento". 5. El frontend envía POST /api/auth/forgot-password con { email }. 6. El backend busca el email en la tabla usuarios. 7. Si existe, genera un token UUID, lo almacena en password_resets con fecha_expiracion = now() + 30 minutos y estado = 'Pendiente'. 8. El backend envía un email transaccional con el enlace /restablecer-contraseña?token=xxx. 9. El sistema muestra "Revisa tu correo. Te enviamos un enlace para restablecer tu contraseña." 10. El usuario abre el email, presiona el enlace y es redirigido a /restablecer-contraseña?token=xxx. 11. El sistema muestra un formulario con: nueva contraseña, confirmar contraseña. 12. El usuario ingresa y confirma su nueva contraseña. 13. El frontend envía PUT /api/auth/reset-password con { token, password_nueva }. 14. El backend verifica que el token exista, no esté expirado y no haya sido usado. 15. Actualiza usuarios.password_hash, marca password_resets.estado = 'Usado'. 16. El sistema muestra "Contraseña restablecida exitosamente" y redirige a /login.
POST CONDICIÓN | La contraseña del usuario quedó actualizada; puede iniciar sesión con la nueva contraseña. El token de reset queda invalidado.
EXCEPCIONES (Flujo Secundario) | - E1: Email no registrado. Por seguridad, el sistema muestra el mismo mensaje "Revisa tu correo" sin revelar si el email existe o no (previene enumeración de usuarios). - E2: Token expirado. Si el usuario abre el enlace después de 30 minutos, el sistema muestra "El enlace ha expirado. Solicita uno nuevo." con botón "Reenviar enlace". - E3: Token ya usado. El sistema muestra "Este enlace ya fue utilizado. Solicita uno nuevo." - E4: Contraseña débil. El frontend aplica las mismas validaciones que en CU03.

---

## CU06 — Establecer Primera Contraseña

Campo | Descripción
--- | ---
CASO DE USO | CU06 - Establecer Primera Contraseña
PROPÓSITO | Permitir al usuario que fue registrado por un administrador establecer su contraseña de acceso por primera vez antes de usar la plataforma.
DESCRIPCIÓN | Cuando el Administrador crea un empleado (CU07) con una contraseña temporal, el empleado recibe un email con un enlace para establecer su primera contraseña. Al abrir el enlace, se muestra un formulario con: nueva contraseña y confirmar contraseña. Las validaciones son iguales al registro (8 caracteres, mayúscula, número, carácter especial). Al guardar, el backend actualiza el password_hash, cambia el estado del usuario a 'Activo' y marca la contraseña temporal como usada.
ACTORES | Administrador General (crea el empleado), Empleado nuevo (establece la contraseña).
ACTOR INICIADOR | Empleado que recibe el email de bienvenida y abre el enlace.
PRECONDICIÓN | El Administrador debe haber creado previamente el empleado con CU07 y el empleado debe tener estado = 'Pendiente'.
FLUJO PRINCIPAL (Camino Feliz) | 1. El Administrador registra el empleado (CU07) con nombre, email y una contraseña temporal. 2. El sistema envía un email al empleado con el enlace /establecer-contraseña?token=xxx. 3. El empleado abre el enlace desde su correo. 4. El sistema muestra el formulario "Establece tu contraseña" con dos campos: nueva contraseña y confirmar contraseña. 5. El empleado ingresa su contraseña personal. 6. El frontend valida que cumpla los requisitos y que coincidan ambos campos. 7. El empleado presiona "Guardar Contraseña". 8. El frontend envía PUT /api/auth/first-password con { token, password }. 9. El backend valida el token (no expirado, no usado), actualiza password_hash con bcrypt y cambia usuarios.estado = 'Activo'. 10. El sistema muestra "Contraseña establecida. Ya puedes iniciar sesión." y redirige a /login.
POST CONDICIÓN | El empleado tiene una contraseña personal y estado = 'Activo'; puede iniciar sesión con sus credenciales.
EXCEPCIONES (Flujo Secundario) | - E1: Token expirado (más de 24 horas). Se muestra "El enlace ha expirado. Contacta al administrador para que reenvíe la invitación." - E2: Token ya usado. Se muestra "Ya estableciste tu contraseña. Inicia sesión." - E3: Contraseña débil. El frontend muestra las reglas de validación.

---

## CU07 — Registrar Nuevo Empleado

Campo | Descripción
--- | ---
CASO DE USO | CU07 - Registrar Nuevo Empleado (Administrador, Encargado, Cajero)
PROPÓSITO | Permitir al Administrador General crear cuentas de acceso para el personal de la cadena (encargados, cajeros) con su rol y permisos correspondientes.
DESCRIPCIÓN | Desde el módulo "Usuarios" (/admin/usuarios), el Administrador presiona "Nuevo Empleado" y completa un formulario con: nombre completo, correo electrónico, teléfono, sucursal asignada (select), rol (select: Administrador, Encargado de Sucursal, Cajero) y una contraseña temporal generada por el sistema (editable). Al guardar, el backend crea los registros en usuarios y usuarios_empleados (con sucursal_id, rol), envía un email de bienvenida con enlace para establecer primera contraseña (CU06) y registra el evento en bitacora_auditoria.
ACTORES | Administrador General.
ACTOR INICIADOR | Administrador que necesita agregar un nuevo empleado a la plataforma.
PRECONDICIÓN | El Administrador debe tener sesión activa con permiso de gestión de usuarios (RBAC). Debe existir al menos una sucursal registrada en la tabla sucursales para poder asignar.
FLUJO PRINCIPAL (Camino Feliz) | 1. El Administrador navega a Usuarios → Nuevo Empleado. 2. El sistema muestra el formulario. 3. El Administrador ingresa: nombre, email, teléfono, selecciona la sucursal y el rol. 4. El sistema genera automáticamente una contraseña temporal (ej: "Tmp#8xK2mQ") que el Administrador puede modificar. 5. El Administrador presiona "Registrar". 6. El frontend envía POST /api/admin/empleados con { nombre, email, telefono, sucursal_id, rol, password_temporal }. 7. El backend verifica que el email no exista. 8. Crea el registro en usuarios (rol, password_hash=bcrypt(password_temporal), estado='Pendiente') y en usuarios_empleados (sucursal_id, rol). 9. Envía email de bienvenida con enlace /establecer-contraseña?token=xxx (CU06). 10. Registra en bitacora_auditoria. 11. Muestra "Empleado registrado exitosamente."
POST CONDICIÓN | Existe un nuevo empleado en las tablas usuarios y usuarios_empleados con estado = 'Pendiente'. Se envió el email de bienvenida con el enlace para establecer su primera contraseña.
EXCEPCIONES (Flujo Secundario) | - E1: Email ya registrado. HTTP 409 "Ya existe un usuario con este correo electrónico." - E2: Sucursal inexistente. Si el ID de sucursal no existe en la tabla, el backend retorna HTTP 400 "La sucursal seleccionada no es válida." - E3: Email de bienvenida fallido. El empleado se registra igual pero se muestra una alerta al Administrador "Empleado registrado pero no se pudo enviar el email de bienvenida. Reenvía manualmente."

---

## CU08 — Asignar/Modificar Roles y Permisos

Campo | Descripción
--- | ---
CASO DE USO | CU08 - Asignar/Modificar Roles y Permisos
PROPÓSITO | Permitir al Administrador definir y ajustar los permisos de acceso de cada rol del sistema (RBAC), controlando qué módulos y acciones puede ejecutar cada tipo de usuario.
DESCRIPCIÓN | Desde el módulo "Roles y Permisos" (/admin/roles), el Administrador visualiza una grilla con los roles existentes (Administrador, Encargado de Sucursal, Cajero, Cliente) y una columna de checkboxes que representa cada módulo/acción del sistema (Gestionar Usuarios, Gestionar Sucursales, Gestionar Catálogo, Ver Inventario, Editar Inventario, Gestionar Proveedores, Gestionar Reservas, Procesar Pagos, Ver Reportes, etc.). El rol "Administrador" tiene todos los permisos marcados y deshabilitados (no se puede editar). Los demás roles son editables. Al guardar, el backend actualiza la tabla roles_permisos y refresca los JWTs activos de los usuarios afectados en el próximo request.
ACTORES | Administrador General.
ACTOR INICIADOR | Administrador que necesita ajustar los permisos de un rol.
PRECONDICIÓN | El Administrador debe tener sesión activa con permiso de RBAC. Deben existir los roles base en la tabla roles.
FLUJO PRINCIPAL (Camino Feliz) | 1. El Administrador navega a Roles y Permisos. 2. El sistema muestra la grilla de roles × permisos. 3. El Administrador selecciona un rol (ej: Cajero). 4. Activa o desactiva permisos específicos (ej: activar "Procesar Pagos", desactivar "Gestionar Proveedores"). 5. Presiona "Guardar Cambios". 6. El frontend envía PUT /api/admin/roles con { rol_id, permisos: [...] }. 7. El backend actualiza la tabla roles_permisos (DELETE + INSERT). 8. El backend registra en bitacora_auditoria qué permisos se cambiaron. 9. Muestra "Permisos actualizados. Los cambios se aplicarán en el próximo inicio de sesión de los usuarios afectados."
POST CONDICIÓN | Los permisos del rol quedan actualizados; los usuarios con ese rol tendrán los nuevos permisos en su próximo request autenticado.
EXCEPCIONES (Flujo Secundario) | - E1: Intento de modificar rol Administrador. El sistema bloquea la edición del rol Administrador (todos los checkboxes deshabilitados) con un tooltip "El rol Administrador tiene acceso total y no es modificable." - E2: Todos los permisos desactivados. El backend valida que ningún rol tenga 0 permisos; retorna HTTP 400 "Un rol debe tener al menos un permiso asignado." - E3: Sin permisos RBAC. Si el usuario que intenta acceder no tiene permiso de gestión de roles, el módulo no aparece en el menú lateral.

---

## CU09 — Inhabilitar Empleado (Baja Lógica)

Campo | Descripción
--- | ---
CASO DE USO | CU09 - Inhabilitar Empleado (Baja Lógica)
PROPÓSITO | Permitir al Administrador desactivar la cuenta de un empleado sin eliminarlo del sistema, impidiendo que pueda iniciar sesión mientras se conserva su historial.
DESCRIPCIÓN | Desde la lista de usuarios (/admin/usuarios), el Administrador busca el empleado, presiona el ícono de acciones y selecciona "Inhabilitar". El sistema muestra un diálogo de confirmación: "¿Estás seguro de inhabilitar a [nombre]? No podrá iniciar sesión." Si confirma, el backend cambia usuarios.estado = 'Inactivo' y registra el motivo y la fecha en bitacora_auditoria. Si el empleado tenía una sesión activa, esta queda invalidada en el próximo request.
ACTORES | Administrador General.
ACTOR INICIADOR | Administrador que necesita desactivar a un empleado (renuncia, despido, licencia).
PRECONDICIÓN | El Administrador debe tener permiso de RBAC. El empleado a inhabilitar debe existir con estado = 'Activo'.
FLUJO PRINCIPAL (Camino Feliz) | 1. El Administrador navega a Usuarios y busca al empleado por nombre o email. 2. Presiona el ícono de acciones (⋮) y selecciona "Inhabilitar". 3. El sistema muestra un diálogo: "¿Inhabilitar a [nombre] ([email])? Esta acción impedirá su acceso." 4. Opcionalmente, el Administrador ingresa un motivo. 5. Presiona "Confirmar". 6. El frontend envía PUT /api/admin/empleados/{id}/inhabilitar con { motivo }. 7. El backend cambia usuarios.estado = 'Inactivo' y usuarios.fecha_baja = now(). 8. Registra en bitacora_auditoria. 9. Muestra "Empleado inhabilitado correctamente."
POST CONICIÓN | El empleado ya no puede iniciar sesión; su estado es 'Inactivo' pero todos sus registros históricos se conservan.
EXCEPCIONES (Flujo Secundario) | - E1: El empleado ya está inhabilitado. El sistema muestra "Este empleado ya está inhabilitado." y no realiza cambios. - E2: Intento de auto-inhabilitar. El Administrador no puede inhabilitar su propia cuenta desde esta función (debe usar un segundo Administrador). El botón está deshabilitado en su propia fila.

---

## CU10 — Rehabilitar Empleado

Campo | Descripción
--- | ---
CASO DE USO | CU10 - Rehabilitar Empleado
PROPÓSITO | Permitir al Administrador reactivar la cuenta de un empleado previamente inhabilitado, restaurando su acceso al sistema.
DESCRIPCIÓN | Desde la lista de usuarios (/admin/usuarios) con el filtro "Inactivos" activado, el Administrador selecciona el empleado y presiona "Rehabilitar". El sistema muestra un diálogo de confirmación. Si confirma, el backend cambia usuarios.estado = 'Activo' y registra el evento en bitacora_auditoria. El empleado puede iniciar sesión nuevamente con sus credenciales previas.
ACTORES | Administrador General.
ACTOR INICIADOR | Administrador que necesita restaurar el acceso de un empleado.
PRECONDICIÓN | El Administrador debe tener permiso de RBAC. El empleado debe existir con estado = 'Inactivo'.
FLUJO PRINCIPAL (Camino Feliz) | 1. El Administrador navega a Usuarios y activa el filtro "Inactivos". 2. Localiza al empleado y presiona "Rehabilitar". 3. El sistema muestra diálogo: "¿Rehabilitar a [nombre]?" 4. El Administrador confirma. 5. El frontend envía PUT /api/admin/empleados/{id}/rehabilitar. 6. El backend cambia usuarios.estado = 'Activo' y limpia usuarios.fecha_baja. 7. Registra en bitacora_auditoria. 8. Muestra "Empleado rehabilitado. Ya puede iniciar sesión."
POST CONDICIÓN | El empleado tiene estado = 'Activo' y puede iniciar sesión con sus credenciales previas.
EXCEPCIONES (Flujo Secundario) | - E1: El empleado ya está activo. El sistema muestra "Este empleado ya está activo." - E2: El empleado fue eliminado permanentemente (no aplica en baja lógica, pero se maneja si existe soft-delete futuro).

---

## CU11 — Consultar Bitácora de Auditoría

Campo | Descripción
--- | ---
CASO DE USO | CU11 - Consultar Bitácora de Auditoría
PROPÓSITO | Permitir al Administrador revisar el registro histórico de acciones realizadas en el sistema por todos los usuarios, como herramienta de trazabilidad y seguridad.
DESCRIPCIÓN | Desde el módulo "Auditoría" (/admin/auditoría), el Administrador visualiza una tabla paginada con columnas: fecha_hora, usuario, email, rol, acción, módulo, IP, dispositivo y resultado (exitoso/fallido). La tabla incluye filtros por rango de fechas, usuario, módulo y resultado. El Administrador puede exportar el resultado a CSV. La tabla se carga bajo demanda (no al login) para no impactar el rendimiento.
ACTORES | Administrador General.
ACTOR INICIADOR | Administrador que necesita auditar acciones del sistema.
PRECONDICIÓN | El Administrador debe tener sesión activa y permiso de auditoría. Debe existir al menos un registro en la tabla bitacora_auditoria.
FLUJO PRINCIPAL (Camino Feliz) | 1. El Administrador navega a Auditoría. 2. El sistema ejecuta GET /api/admin/auditoria con parámetros de paginación (page, limit) y retorna los registros más recientes primero. 3. El sistema renderiza la tabla con los campos visibles y paginación (20 registros por página). 4. El Administrador aplica filtros opcionales (ej: usuario = "carlos@tiendasmontano.com", módulo = "Inventario", rango de fechas = último mes). 5. El sistema refiltra y muestra los resultados. 6. El Administrador presiona "Exportar CSV" y descarga el archivo con los registros filtrados.
POST CONDICIÓN | El Administrador tiene visibilidad completa de las acciones realizadas en el sistema, puede detectar accesos no autorizados o errores recurrentes.
EXCEPCIONES (Flujo Secundario) | - E1: Sin registros. Si no hay registros que coincidan con los filtros, la tabla muestra "No se encontraron registros con los filtros seleccionados." - E2: Tabla vacía. Si no existe ningún registro en bitacora_auditoria, se muestra "Aún no hay registros de auditoría." con un ícono ilustrativo. - E3: Sin permisos. Si un usuario sin permiso de auditoría intenta acceder vía URL directa, se redirige a /inicio.

---

## CU12 — Administrar Ciudades y Sucursales

Campo | Descripción
--- | ---
CASO DE USO | CU12 - Administrar Ciudades y Sucursales
PROPÓSITO | Permitir al Administrador registrar y gestionar las ciudades y sucursales de la cadena Tiendas Montaño, definiendo la estructura geográfica del negocio.
DESCRIPCIÓN | El módulo (/admin/sucursales) muestra dos secciones: (1) Ciudades — lista de ciudades con nombre, país y botón "Nueva Ciudad"; (2) Sucursales — lista de sucursales con columns: nombre, dirección, ciudad (FK), teléfono, horario de atención, estado (Activa/Inactiva) y botón "Nueva Sucursal". Para crear una ciudad se solicita nombre y país (default: Bolivia). Para crear una sucursal se solicita: nombre, dirección, ciudad (select), teléfono, horario de apertura y cierre. Las sucursales inactivas aparecen en gris y no están disponibles para reservas ni ventas.
ACTORES | Administrador General.
ACTOR INICIADOR | Administrador que necesita registrar una nueva ciudad o sucursal.
PRECONDICIÓN | El Administrador debe tener permiso de gestión de sucursales. Para crear sucursal debe existir al menos una ciudad.
FLUJO PRINCIPAL (Camino Feliz) | 1. El Administrador navega a Sucursales. 2. Presiona "Nueva Ciudad" o "Nueva Sucursal". 3. Completa el formulario correspondiente. 4. Para sucursal: ingresa nombre, dirección, selecciona ciudad, ingresa teléfono, horario (apertura, cierre), y estado (Activa por defecto). 5. Presiona "Guardar". 6. El frontend envía POST /api/admin/sucursales con los datos. 7. El backend valida que no exista una sucursal con el mismo nombre en la misma ciudad. 8. Inserta el registro en la tabla sucursales (o ciudades). 9. Registra en bitacora_auditoria. 10. Muestra "Sucursal creada exitosamente."
POST CONDICIÓN | La sucursal queda registrada y visible para asignarla a empleados, consultar inventario y mostrar disponibilidad a clientes.
EXCEPCIONES (Flujo Secundario) | - E1: Nombre duplicado. Si ya existe una sucursal con el mismo nombre en la misma ciudad, HTTP 409 "Ya existe una sucursal con ese nombre en esta ciudad." - E2: Ciudad inexistente. Si se intenta asignar una sucursal a una ciudad que no existe, se muestra error de validación en el select. - E3: Horario inválido. Si la hora de cierre es anterior a la de apertura, el frontend muestra "La hora de cierre debe ser posterior a la de apertura."

---

## CU13 — Registrar Producto de Ropa en Catálogo

Campo | Descripción
--- | ---
CASO DE USO | CU13 - Registrar Producto de Ropa en Catálogo (Tallas y Colores)
PROPÓSITO | Permitir al Administrador o Encargado agregar nuevas prendas al catálogo de la tienda con toda su información: nombre, descripción, categoría, talla, color, imagen y precio.
DESCRIPCIÓN | Desde el módulo "Catálogo" (/admin/catalogo), el usuario presiona "Nuevo Producto" y completa un formulario con: nombre de la prenda, descripción, categoría (select: Remera, Pantalón, Vestido, Zapato, Accesorio, etc.), talla (select múltiple: XS, S, M, L, XL, XXL), color (select múltiple: Negro, Blanco, Rojo, Azul, Verde, etc.), precio base, imagen principal (upload) e imágenes secundarias (upload múltiple). El sistema crea el registro en la tabla productos y genera registros en producto_talla_color para cada combinación talla×color seleccionada, con precio y estado_stock = 'Disponible'.
ACTORES | Administrador General, Encargado de Sucursal (con permiso de catálogo).
ACTOR INICIADOR | Administrador o Encargado que necesita agregar una prenda al catálogo.
PRECONDICIÓN | Deben existir las tablas de tallas, colores y categorías previamente configuradas (CU14).
FLUJO PRINCIPAL (Camino Feliz) | 1. El usuario navega a Catálogo → Nuevo Producto. 2. Completa el formulario: nombre, descripción, categoría. 3. Selecciona las tallas disponibles (múltiple). 4. Selecciona los colores disponibles (múltiple). 5. Ingresa el precio base. 6. Sube la imagen principal y hasta 5 imágenes secundarias. 7. El frontend muestra una preview del producto. 8. El usuario presiona "Publicar Producto". 9. El frontend envía POST /api/catalogo/productos con FormData (incluyendo imágenes). 10. El backend crea el registro en productos, sube las imágenes a storage y genera las combinaciones talla×color en producto_talla_color. 11. Registra en bitacora_auditoria. 12. Muestra "Producto publicado exitosamente."
POST CONDICIÓN | La prenda está visible en el catálogo público (web y móvil), con sus tallas, colores e imágenes disponibles para consulta, reserva y compra.
EXCEPCIONES (Flujo Secundario) | - E1: Nombre duplicado. Si ya existe un producto con el mismo nombre, HTTP 409 "Ya existe una prenda con este nombre." - E2: Imagen inválida. Si el archivo supera 5MB o no es jpg/png/webp, el frontend muestra "Formato de imagen no soportado o tamaño excedido (máx. 5MB)." - E3: Sin tallas ni colores seleccionados. El botón "Publicar" permanece deshabilitado. - E4: Precio inválido. Si el precio es 0 o negativo, se muestra "El precio debe ser mayor a 0."

---

## CU14 — Gestionar Tallas, Colores y Categorías

Campo | Descripción
--- | ---
CASO DE USO | CU14 - Gestionar Tallas, Colores y Categorías
PROPÓSITO | Permitir al Administrador administrar las listas maestras de tallas (XS–XXL), colores y categorías de prendas que alimentan el catálogo de productos.
DESCRIPCIÓN | Desde el módulo "Configuración → Listas Maestras" (/admin/listas), el Administrador puede crear, editar y desactivar registros en tres tablas: (1) Tallas —XS, S, M, L, XL, XXL con estado activo/inactivo; (2) Colores — Negro, Blanco, Rojo, Azul, Verde, etc. con código hexadecimal (#000000) y estado; (3) Categorías — Remera, Pantalón, Vestido, Zapato, Accesorio, etc. con descripción y estado. Cada tabla tiene botones "Nuevo", "Editar" (nombre), "Activar/Desactivar".
ACTORES | Administrador General.
ACTOR INICIADOR | Administrador que necesita agregar o modificar una talla, color o categoría.
PRECONDICIÓN | El Administrador debe tener permiso de configuración. Las tablas pueden estar vacías al inicio (se cargan datos iniciales en la migración de base de datos).
FLUJO PRINCIPAL (Camino Feliz) | 1. El Administrador navega a Configuración → Listas Maestras. 2. Selecciona la pestaña (Tallas / Colores / Categorías). 3. Presiona "Nuevo" para agregar un registro. 4. Completa el formulario (ej: talla "3XL" con estado Activo). 5. Presiona "Guardar". 6. El frontend envía POST /api/admin/listas/{tipo} con los datos. 7. El backend verifica unicidad (no repetir talla/color/categoría con el mismo nombre). 8. Inserta el registro y retorna el objeto creado. 9. Registra en bitacora_auditoria. 10. Muestra "Talla registrada exitosamente."
POST CONDICIÓN | La nueva talla, color o categoría queda disponible para ser seleccionada al registrar productos en CU13.
EXCEPCIONES (Flujo Secundario) | - E1: Nombre duplicado. HTTP 409 "Ya existe una talla/color/categoría con ese nombre." - E2: Intento de desactivar talla/color en uso. Si el registro está asociado a productos activos, el sistema muestra "Este registro está asociado a [N] productos activos. ¿Deseas desactivarlo de todas formas? Los productos mantendrán la asociación."

---

## CU15 — Gestionar Temporadas y Colecciones

Campo | Descripción
--- | ---
CASO DE USO | CU15 - Gestionar Temporadas y Colecciones
PROPÓSITO | Permitir al Administrador administrar las temporadas comerciales (Primavera-Verano, Otoño-Invierno, Temporada Escolar, etc.) y las colecciones asociadas, para organizar los productos por período de venta.
DESCRIPCIÓN | Desde el módulo "Temporadas" (/admin/temporadas), el Administrador puede crear, editar y cerrar temporadas, y dentro de cada una crear colecciones. Cada temporada tiene: nombre, fecha_inicio, fecha_fin, estado (Activa, Cerrada, Programada). Cada colección tiene: nombre, descripción, temporada_id (FK), y permite asociar productos existentes del catálogo.
ACTORES | Administrador General.
ACTOR INICIADOR | Administrador que necesita definir una nueva temporada o asociar productos a una colección.
PRECONDICIÓN | Deben existir productos en el catálogo para asociarlos a colecciones.
FLUJO PRINCIPAL (Camino Feliz) | 1. El Administrador navega a Temporadas. 2. Presiona "Nueva Temporada". 3. Ingresa nombre, fecha de inicio y fecha de fin. 4. Presiona "Crear". 5. El backend crea la temporada con estado = 'Programada'. 6. El Administrador ingresa a la temporada y presiona "Nueva Colección". 7. Ingresa nombre y descripción de la colección. 8. Selecciona productos del catálogo para asociarlos (multiselect con búsqueda). 9. Presiona "Guardar Colección". 10. El backend crea la colección en colecciones y las asociaciones en producto_coleccion. 11. Registra en bitacora_auditoria. 12. Muestra "Colección creada exitosamente."
POST CONDICIÓN | La temporada y colección quedan registradas; los productos asociados aparecen filtrables por temporada/coleccion en el catálogo público y en las recomendaciones de IA.
EXCEPCIONES (Flujo Secundario) | - E1: Fechas inválidas. Si fecha_fin < fecha_inicio, el sistema muestra "La fecha de fin debe ser posterior a la de inicio." - E2: Temporal superpuesta. Si ya existe una temporada activa cuyo rango de fechas se superpone con la nueva, el sistema muestra advertencia "Ya existe una temporada activa en este período. ¿Deseas continuar?" - E3: Colección sin productos. Si se guarda una colección sin productos, se muestra "La colección se creará vacía. Puedes agregar productos después."

---

## CU16 — Consultar Catálogo con Filtros (Web y Móvil)

Campo | Descripción
--- | ---
CASO DE USO | CU16 - Consultar Catálogo con Filtros (Web y Móvil)
PROPÓSITO | Permitir a los clientes explorar el catálogo completo de prendas de Tiendas Montaño, aplicando filtros por categoría, talla, color, temporada, precio y disponibilidad por sucursal.
DESCRIPCIÓN | La pantalla principal del catálogo (/catalogo en web, pantalla Home en móvil) muestra una grilla responsiva de productos con imagen, nombre, precio y badge de disponibilidad. Una barra lateral (web) o panel deslizante (móvil) contiene filtros: categoría (checkboxes), talla (checkboxes), color (swatches circulares), temporada (select), rango de precio (slider) y disponibilidad por sucursal (select). Un campo de búsqueda en la parte superior permite buscar por nombre de prenda. Los filtros se aplican en tiempo real sin recargar la página (query params en la URL). Cada producto es cliqueable y redirige a su página de detalle.
ACTORES | Cliente, Administrador General, Encargado de Sucursal.
ACTOR INICIADOR | Cualquier usuario que desee explorar las prendas disponibles.
PRECONDICIÓN | Debe existir al menos un producto publicado en el catálogo. El catálogo público muestra solo productos con al menos una combinación talla×color con estado_stock = 'Disponible'.
FLUJO PRINCIPAL (Camino Feliz) | 1. El usuario accede al catálogo desde el menú principal o la ruta /catalogo. 2. El sistema ejecuta GET /api/catalogo/productos con parámetros de filtros (vacíos al inicio). 3. El backend retorna la lista de productos activos con su información básica (nombre, precio, imagen principal, disponibilidad_resumen). 4. El frontend renderiza la grilla responsiva. 5. El usuario aplica filtros (ej: Categoría = "Remera", Talla = "M", Color = "Negro"). 6. El frontend actualiza los query params de la URL y ejecuta una nueva petición GET con los filtros. 7. El backend filtra los productos que tengan al menos una combinación talla×color que cumpla los filtros y que tenga stock disponible (inventario_stock.cantidad_disponible > 0). 8. El frontend re-renderiza la grilla con los resultados filtrados, mostrando "X resultados encontrados." 9. El usuario presiona un producto para ver su detalle (/catalogo/{producto_id}).
POST CONDICIÓN | El usuario visualiza el catálogo filtrado según sus criterios y puede navegar al detalle de cada prenda.
EXCEPCIONES (Flujo Secundario) | - E1: Sin resultados. Si ningún producto coincide con los filtros, el sistema muestra "No encontramos prendas con esos filtros. Prueba cambiando los criterios." con botón "Limpiar filtros." - E2: Catálogo vacío. Si no hay productos publicados, se muestra "El catálogo está vacío. Pronto agregaremos nuevas prendas." - E3: Error de carga. Si la petición falla, se muestra skeleton loader y un botón "Reintentar."

---

## CU17 — Consultar Disponibilidad por Sucursal

Campo | Descripción
--- | ---
CASO DE USO | CU17 - Consultar Disponibilidad por Sucursal
PROPÓSITO | Permitir al cliente saber si una prenda específica (talla y color) está disponible en una sucursal específica antes de reservarla o comprarla.
DESCRIPCIÓN | En la página de detalle de un producto (/catalogo/{producto_id}), el cliente selecciona talla y color y el sistema muestra una lista de sucursales con la disponibilidad de esa combinación: nombre de sucursal, dirección, cantidad disponible, horario de atención y estado de la reserva (Disponible, Pocas unidades, Agotada). Si el cliente selecciona una sucursal, el sistema muestra la información detallada de esa sucursal y un botón "Reservar esta prenda" que redirige a CU28.
ACTORES | Cliente (logueado o no), Administrador General, Encargado de Sucursal.
ACTOR INICIADOR | Cliente que quiere probar una prenda en una sucursal física.
PRECONDICIÓN | Debe existir al menos un registro en inventario_stock para la combinación producto_id + talla + color, con cantidad_disponible > 0 en al menos una sucursal.
FLUJO PRINCIPAL (Camino Feliz) | 1. El cliente está en la página de detalle de un producto. 2. Selecciona talla "M" y color "Negro". 3. El frontend envía GET /api/catalogo/disponibilidad?producto_id=X&talla=M&color=Negro. 4. El backend consulta inventario_stock agrupado por sucursal, retornando para cada sucursal: { sucursal_id, nombre, direccion, cantidad_disponible, horario } 5. El frontend renderiza la lista de sucursales ordenada por mayor disponibilidad. 6. Cada sucursal muestra: nombre, dirección, cantidad disponible con semáforo (verde ≥5, amarillo 1-4, rojo 0 = Agotada). 7. El cliente selecciona una sucursal y presiona "Reservar esta prenda". 8. El sistema redirige a CU28 (Realizar Reserva) con la prenda, talla, color y sucursal pre-seleccionados.
POST CONDICIÓN | El cliente conoce la disponibilidad real en cada sucursal y puede decidir dónde reservar o ir a comprar presencialmente.
EXCEPCIONES (Flujo Secundario) | - E1: Sin stock en ninguna sucursal. El sistema muestra "Esta talla y color no está disponible actualmente en ninguna sucursal. Te sugerimos consultar otra talla o color." - E2: Sin talla/color seleccionados. La sección de disponibilidad muestra "Selecciona una talla y color para ver disponibilidad." - E3: Error de conexión. Se muestra "No pudimos cargar la disponibilidad. Intenta de nuevo."

---

## CU18 — Registrar Proveedor

Campo | Descripción
--- | ---
CASO DE USO | CU18 - Registrar Proveedor
PROPÓSITO | Permitir al Administrador registrar nuevos proveedores de ropa en el sistema, almacenando su información de contacto y estado.
DESCRIPCIÓN | Desde el módulo "Proveedores" (/admin/proveedores), el Administrador presiona "Nuevo Proveedor" y completa un formulario con: nombre de la empresa, persona de contacto, teléfono, correo electrónico, dirección, observaciones (opcional) y estado (Activo por defecto). Al guardar, el backend crea el registro en la tabla proveedores con estado = 'Activo' y riesgo = 'Activo'.
ACTORES | Administrador General.
ACTOR INICIADOR | Administrador que necesita agregar un nuevo proveedor de ropa.
PRECONDICIÓN | El Administrador debe tener permiso de gestión de proveedores.
FLUJO PRINCIPAL (Camino Feliz) | 1. El Administrador navega a Proveedores → Nuevo Proveedor. 2. Completa el formulario: nombre empresa, contacto, teléfono, email, dirección, observaciones. 3. Presiona "Registrar". 4. El frontend envía POST /api/admin/proveedores con los datos. 5. El backend verifica que no exista un proveedor con el mismo nombre o email. 6. Inserta en proveedores (estado='Activo', riesgo='Activo'). 7. Registra en bitacora_auditoria. 8. Muestra "Proveedor registrado exitosamente."
POST CONDICIÓN | El proveedor queda registrado y puede ser seleccionado para asociar productos (CU13) y generar órdenes de compra (CU21).
EXCEPCIONES (Flujo Secundario) | - E1: Nombre o email duplicado. HTTP 409 "Ya existe un proveedor con ese nombre o correo." - E2: Campos obligatorios vacíos. El botón "Registrar" permanece deshabilitado.

---

## CU19 — Inhabilitar/Bloquear Proveedor

Campo | Descripción
--- | ---
CASO DE USO | CU19 - Inhabilitar/Bloquear Proveedor (Estado de Riesgo)
PROPÓSITO | Permitir al Administrador cambiar el estado de riesgo de un proveedor, bloqueándolo para evitar nuevas asociaciones y órdenes de compra.
DESCRIPCIÓN | Desde la lista de proveedores, el Administrador selecciona un proveedor y cambia su estado de riesgo: 'Activo' (puede operar normalmente), 'Observado' (advertencia, puede operar con restricciones) o 'Inhabilitado' (bloqueado, no puede recibir órdenes). El sistema muestra un diálogo de confirmación antes del cambio. El historial de cambios se registra en bitacora_auditoria.
ACTORES | Administrador General.
ACTOR INICIADOR | Administrador que necesita bloquear o advertir a un proveedor.
PRECONDICIÓN | El proveedor debe existir en la tabla proveedores.
FLUJO PRINCIPAL (Camino Feliz) | 1. El Administrador navega a Proveedores. 2. Selecciona el proveedor a modificar. 3. Cambia el estado de riesgo (ej: de 'Activo' a 'Observado'). 4. Selecciona el motivo del cambio (dropdown: Incumplimiento de plazo, Problemas de calidad, Otro). 5. Opcionalmente ingresa una observación. 6. Presiona "Confirmar Cambio". 7. El frontend envía PUT /api/admin/proveedores/{id}/riesgo con { nuevo_estado, motivo, observacion }. 8. El backend actualiza proveedores.estado_riesgo. 9. Registra en bitacora_auditoria. 10. Muestra "Estado del proveedor actualizado."
POST CONDICIÓN | El proveedor tiene el nuevo estado de riesgo. Si es 'Inhabilitado', no puede ser seleccionado para nuevas órdenes de compra.
EXCEPCIONES (Flujo Secundario) | - E1: Proveedor ya en ese estado. El sistema muestra "El proveedor ya tiene el estado [X]." - E2: Orden de compra pendiente. Si el proveedor tiene órdenes de compra abiertas, se muestra una advertencia "Este proveedor tiene [N] órdenes pendientes. Bloquearlo no cancela las órdenes existentes."

---

## CU20 — Evaluar y Puntuar Proveedores (Scoring)

Campo | Descripción
--- | ---
CASO DE USO | CU20 - Evaluar y Puntuar Proveedores (Scoring)
PROPÓSITO | Permitir al Administrador evaluar el desempeño de los proveedores según criterios objetivos (entrega a tiempo, calidad, precio) y generar un ranking que apoye las decisiones de compra.
DESCRIPCIÓN | Desde el módulo "Proveedores → Scoring" (/admin/proveedores/scoring), el Administrador visualiza una tabla con todos los proveedores activos y un puntaje consolidado (0–100) calculado automáticamente a partir de: % de entregas a tiempo, % de recepciones sin novedad de calidad, competitividad del precio vs. mercado y cantidad de órdenes completadas. El Administrador puede ajustar pesos de cada criterio y registrar evaluaciones manuales por orden de compra. Este CU es de prioridad Baja y puede posponerse al Ciclo 3.
ACTORES | Administrador General.
ACTOR INICIADOR | Administrador que necesita evaluar proveedores antes de una nueva temporada.
PRECONDICIÓN | Deben existir registros de recepciones y órdenes de compra históricas para calcular el puntaje automáticamente.
FLUJO PRINCIPAL (Camino Feliz) | 1. El Administrador navega a Proveedores → Scoring. 2. El sistema calcula automáticamente el puntaje de cada proveedor con las fórmulas: (A) % entregas a tiempo = (entregas_a_tiempo / total_ordenes) × 100; (B) % recepciones sin novedad = (recepciones_ok / total_recepciones) × 100; (C) Puntaje precio (0–100) según comparación; (D) Peso configurable por criterio. 3. El sistema renderiza la tabla con: proveedor, puntaje por criterio, puntaje consolidado y ranking. 4. El Administrador puede ajustar los pesos de los criterios (ej: dar más peso a calidad que a precio). 5. El sistema recalcula los puntajes con los nuevos pesos. 6. El Administrador puede agregar una evaluación manual para una orden específica (calificación del 1 al 5, comentario).
POST CONDICIÓN | El ranking de proveedores queda actualizado y visible para apoyar las decisiones de compra del Administrador.
EXCEPCIONES (Flujo Secundario) | - E1: Sin datos suficientes. Si un proveedor tiene menos de 3 órdenes, el sistema muestra "Datos insuficientes para evaluar. Se necesita al menos 3 órdenes históricas." - E2: Todos los pesos en cero. El sistema valida que la suma de pesos sea 100; si no lo es, muestra "La suma de los pesos debe ser 100%."

---

## CU21 — Elaborar Orden de Compra a Proveedor

Campo | Descripción
--- | ---
CASO DE USO | CU21 - Elaborar Orden de Compra a Proveedor
PROPÓSITO | Permitir al Administrador o Encargado crear órdenes de compra dirigidas a un proveedor para solicitar el reabastecimiento de prendas específicas.
DESCRIPCIÓN | Desde el módulo "Proveedores → Ordenes de Compra" (/admin/compras), el usuario presiona "Nueva Orden" y selecciona el proveedor (solo 'Activo'). El formulario permite agregar ítems: producto, talla, color, cantidad solicitada y precio unitario acordado. El sistema calcula el subtotal por ítem y el total de la orden. Al crear, el backend genera la orden con estado = 'Pendiente' y registra en bitacora_auditoria.
ACTORES | Administrador General, Encargado de Sucursal.
ACTOR INICIADOR | Administrador o Encargado que necesita solicitar mercadería a un proveedor.
PRECONDICIÓN | Debe existir al menos un proveedor activo. El usuario debe tener permiso de gestión de compras/proveedores.
FLUJO PRINCIPAL (Camino Feliz) | 1. El usuario navega a Proveedores → Ordenes de Compra → Nueva Orden. 2. Selecciona el proveedor (select con solo proveedores estado_riesgo = 'Activo'). 3. Agrega ítems: selecciona producto (search), talla, color, cantidad, precio unitario. 4. El sistema calcula subtotal por ítem y total de la orden. 5. El usuario presiona "Crear Orden de Compra". 6. El frontend envía POST /api/admin/compras con { proveedor_id, items: [...], observaciones }. 7. El backend crea la orden en ordenes_compra (estado='Pendiente') y los ítems en orden_compra_items. 8. Registra en bitacora_auditoria. 9. Muestra "Orden de compra #001 creada exitosamente." con botón "Imprimir" (genera PDF).
POST CONICIÓN | La orden de compra queda registrada con estado 'Pendiente', lista para ser procesada cuando el proveedor envíe la mercadería (CU22).
EXCEPCIONES (Flujo Secundario) | - E1: Proveedor inactivo. Si se intenta crear con un proveedor 'Inhabilitado', el sistema bloquea la selección. - E2: Orden vacía. Si no se agregó ningún ítem, el botón "Crear Orden" permanece deshabilitado. - E3: Cantidad inválida. Si la cantidad es 0 o negativa, el sistema muestra "La cantidad debe ser mayor a 0."

---

## CU22 — Registrar Recepción Física de Prendas

Campo | Descripción
--- | ---
CASO DE USO | CU22 - Registrar Recepción Física de Prendas (Ingreso a Inventario)
PROPÓSITO | Permitir al Encargado de Sucursal confirmar la recepción física de mercadería de un proveedor, registrando las cantidades reales recibidas y actualizando automáticamente el inventario.
DESCRIPCIÓN | Desde el módulo "Recepciones" (/sucursal/recepciones), el Encargado selecciona una orden de compra pendiente y visualiza los ítems esperados. Por cada ítem, registra la cantidad recibida real (puede diferir de la solicitada). El sistema compara cantidad_recibida vs. cantidad_solicitada, genera la diferencia (faltante/sobrante), y al confirmar crea los registros en inventario_stock (sumando a cantidad_disponible) y en movimientos_inventario con tipo = 'Recepción'. El estado de la orden pasa a 'Recibida'.
ACTORES | Encargado de Sucursal.
ACTOR INICIADOR | Encargado que recibe la mercadería del proveedor en la tienda.
PRECONDICIÓN | Debe existir una orden de compra con estado = 'Pendiente' asociada a la sucursal del Encargado. El usuario debe tener permiso de recepción.
FLUJO PRINCIPAL (Camino Feliz) | 1. El Encargado navega a Recepciones. 2. Visualiza la lista de órdenes pendientes para su sucursal. 3. Selecciona una orden de compra. 4. El sistema muestra los ítems esperados: producto, talla, color, cantidad_solicitada, precio_unitario. 5. Por cada ítem, el Encargado ingresa la cantidad recibida real. 6. El sistema muestra la diferencia (ej: Solicitado: 20, Recibido: 18, Faltante: 2). 7. El Encargado presiona "Confirmar Recepción". 8. El frontend envía PUT /api/sucursal/recepciones/{orden_id} con { items: [{producto_id, talla, color, cantidad_recibida}, ...] }. 9. Para cada ítem, el backend crea o actualiza inventario_stock sumando cantidad_recibida a cantidad_disponible para la sucursal correspondiente. 10. Crea registros en movimientos_inventario con tipo = 'Recepción', orden_compra_id, fecha, cantidad. 11. Actualiza orden_compra.estado = 'Recibida'. 12. Registra en bitacora_auditoria. 13. Muestra "Recepción registrada. Inventario actualizado."
POST CONDICIÓN | El inventario de la sucursal se incrementó con la mercadería recibida; los movimientos quedan registrados en el Kardex (CU23); la orden de compra cambia a 'Recibida'.
EXCEPCIONES (Flujo Secundario) | - E1: Cantidad recibida mayor a la solicitada. El sistema muestra advertencia "Recibiste más unidades de las solicitadas. ¿Deseas registrar la cantidad real?" con confirmación. - E2: Cero unidades recibidas de un ítem. Si la cantidad recibida es 0, se muestra "No se recibieron unidades de este ítem. Se registrará como faltante." - E3: Orden ya recibida. Si la orden ya tiene estado 'Recibida', el sistema muestra "Esta orden ya fue recibida."

---

## CU23 — Consultar Kardex Dinámico

Campo | Descripción
--- | ---
CASO DE USO | CU23 - Consultar Kardex Dinámico
PROPÓSITO | Permitir al Administrador y Encargados consultar el historial completo de movimientos de inventario de cualquier prenda por sucursal, talla, color y temporada (Kardex).
DESCRIPCIÓN | Desde el módulo "Inventario → Kardex" (/inventario/kardex), el usuario puede filtrar por: producto, talla, color, sucursal, rango de fechas y tipo de movimiento (Entrada, Salida, Reserva, Devolución, Ajuste, Merma). El sistema muestra una tabla cronológica con columnas: fecha, tipo_movimiento, cantidad, stock_anterior, stock_posterior, referencia (orden_compra, venta, reserva, etc.) y usuario que registró. El encabezado muestra el stock actual. Se permite exportar a CSV.
ACTORES | Administrador General, Encargado de Sucursal.
ACTOR INICIADOR | Administrador o Encargado que necesita auditar movimientos de inventario.
PRECONDICIÓN | Deben existir registros en la tabla movimientos_inventario.
FLUJO PRINCIPAL (Camino Feliz) | 1. El usuario navega a Inventario → Kardex. 2. El sistema muestra los filtros y la tabla vacía con mensaje "Selecciona un producto para ver su Kardex." 3. El usuario selecciona un producto, talla, color y sucursal. 4. El frontend envía GET /api/inventario/kardex con los parámetros. 5. El backend consulta movimientos_inventario ordenados por fecha ASC para esa combinación, calculando stock_anterior y stock_posterior para cada fila. 6. El sistema renderiza la tabla cronológica con el stock actual destacado en la última fila. 7. El usuario puede filtrar por rango de fechas y tipo de movimiento. 8. Presiona "Exportar CSV" para descargar el Kardex filtrado.
POST CONDICIÓN | El usuario tiene visibilidad completa del historial de movimientos de la prenda seleccionada.
EXCEPCIONES (Flujo Secundario) | - E1: Sin movimientos. Si no hay registros para los filtros, se muestra "No hay movimientos registrados para esta combinación." - E2: Producto no seleccionado. La tabla muestra el mensaje informativo de selección.

---

## CU24 — Registrar Ajuste Manual o Merma

Campo | Descripción
--- | ---
CASO DE USO | CU24 - Registrar Ajuste Manual o Merma
PROPÓSITO | Permitir al Encargado de Sucursal corregir discrepancias de stock (ajuste manual) o registrar pérdidas de mercadería (merma), manteniendo el Kardex actualizado y controlado.
DESCRIPCIÓN | Desde el módulo "Inventario → Ajustes" (/sucursal/ajustes), el Encargado puede crear un nuevo movimiento de tipo 'Ajuste' o 'Merma'. Selecciona el producto, talla, color, cantidad a ajustar (positiva para incremento, negativa para decremento), tipo (Ajuste/Merma), motivo (dropdown: Conteo físico, Daño, Extravío, Vencimiento, Otro) y observaciones. Al confirmar, el sistema actualiza inventario_stock y crea el registro en movimientos_inventario.
ACTORES | Encargado de Sucursal, Administrador General.
ACTOR INICIADOR | Encargado que detecta una discrepancia en el inventario o una prenda dañada.
PRECONDICIÓN | El usuario debe tener permiso de edición de inventario. Debe existir el producto/talla/color en inventario_stock para la sucursal.
FLUJO PRINCIPAL (Camino Feliz) | 1. El Encargado navega a Inventario → Ajustes. 2. Presiona "Nuevo Ajuste/Merma". 3. Selecciona producto, talla y color. 4. Selecciona tipo: "Ajuste Manual" o "Merma". 5. Ingresa la cantidad (entero; positiva si es incremento, negativa si es decremento). 6. Selecciona el motivo del ajuste/merma. 7. Ingresa observaciones (opcional pero recomendado). 8. Presiona "Registrar". 9. El frontend envía POST /api/inventario/ajustes con { producto_id, talla, color, tipo, cantidad, motivo, observaciones }. 10. El backend valida que el ajuste no deje stock negativo. 11. Actualiza inventario_stock.cantidad_disponible += cantidad. 12. Crea el registro en movimientos_inventario con tipo = 'Ajuste' o 'Merma'. 13. Registra en bitacora_auditoria. 14. Muestra "Ajuste registrado. Nuevo stock: [X] unidades."
POST CONDICIÓN | El inventario_stock quedó corregido; el movimiento queda registrado en el Kardex (CU23) y es visible en los reportes de mermas.
EXCEPCIONES (Flujo Secundario) | - E1: Stock quedaría negativo. Si el ajuste deja el stock en negativo, el backend retorna HTTP 400 "El ajuste resultaría en stock negativo (stock actual: [X]). La cantidad de ajuste no puede ser mayor al stock actual." - E2: Cero unidades. El sistema muestra "La cantidad no puede ser 0." - E3: Sin motivo seleccionado. El botón "Registrar" permanece deshabilitado.

---

## CU25 — Configurar Alertas de Stock Mínimo

Campo | Descripción
--- | ---
CASO DE USO | CU25 - Configurar Alertas de Stock Mínimo
PROPÓSITO | Permitir al Administrador definir umbrales de stock mínimo por producto (o por categoría) y habilitar alertas automáticas cuando el inventario caiga por debajo de ese umbral.
DESCRIPCIÓN | Desde el módulo "Inventario → Alertas" (/admin/alertas-stock), el Administrador puede configurar el umbral de stock mínimo por producto específico o por categoría (ej: todas las Remeras mínimo 5 unidades). El sistema ejecuta una consulta periódica (cron job o al momento de cada movimiento de inventario) que compara la cantidad_disponible con el umbral configurado y genera una alerta en la tabla alertas_stock cuando se supera el límite. Las alertas se muestran en el dashboard (CU44) y se envían por email al Administrador y al Encargado de la sucursal afectada.
ACTORES | Administrador General.
ACTOR INICIADOR | Administrador que necesita configurar los niveles mínimos de reposición.
PRECONDICIÓN | Deben existir productos en el catálogo y registros en inventario_stock.
FLUJO PRINCIPAL (Camino Feliz) | 1. El Administrador navega a Inventario → Alertas. 2. El sistema muestra la lista de productos/categorías con su stock mínimo actual y un botón "Editar Umbral". 3. El Administrador selecciona un producto (o categoría). 4. Ingresa el stock_mínimo (ej: 5 unidades). 5. Habilita las notificaciones por email (checkbox). 6. Presiona "Guardar". 7. El frontend envía PUT /api/admin/alertas-stock con { producto_id, stock_minimo, notificar_email }. 8. El backend crea o actualiza el registro en alertas_stock_config. 9. Registra en bitacora_auditoria. 10. Muestra "Umbral configurado. Se enviarán alertas cuando el stock baje de [X] unidades." 11. A partir de ese momento, cada movimiento de inventario que deje el stock bajo el umbral genera un registro en alertas_stock con estado = 'Activa'.
POST CONDICIÓN | La configuración de alertas queda activa; el sistema notificará automáticamente al Administrador y al Encargado cuando el stock de un producto baje del umbral configurado.
EXCEPCIONES (Flujo Secundario) | - E1: Umbral negativo o cero. El sistema muestra "El stock mínimo debe ser al menos 1." - E2: Umbral mayor al stock actual. El sistema muestra advertencia "El umbral es mayor al stock actual ([X]). Se generará una alerta inmediata."

---

## CU26 — Consultar Existencias Consolidadas

Campo | Descripción
--- | ---
CASO DE USO | CU26 - Consultar Existencias Consolidadas (Disponibles, Reservadas, Vendidas, Agotadas, Por Ingresar)
PROPÓSITO | Permitir al Administrador y Encargados visualizar una vista consolidada de todas las prendas con su estado de stock por sucursal: unidades disponibles, reservadas, vendidas, agotadas y próximas a ingresar (por orden de compra).
DESCRIPCIÓN | Desde el módulo "Inventario → Existencias" (/inventario/existencias), el usuario visualiza una tabla con columnas: producto, talla, color, sucursal, cantidad_disponible, cantidad_reservada, cantidad_vendida, estado (Disponible/Poco Stock/Agotado), cantidad_por_ingresar (sumatoria de órdenes de compra pendientes). Se pueden aplicar filtros por sucursal, categoría, talla, color, temporada y estado_stock. La tabla es paginada y exportable a CSV.
ACTORES | Administrador General, Encargado de Sucursal.
ACTOR INICIADOR | Administrador o Encargado que necesita un panorama completo del inventario.
PRECONDICIÓN | Deben existir registros en inventario_stock y movimientos_inventario.
FLUJO PRINCIPAL (Camino Feliz) | 1. El usuario navega a Inventario → Existencias. 2. El frontend envía GET /api/inventario/existencias con parámetros de filtro (vacíos al inicio). 3. El backend ejecuta una consulta que cruza inventario_stock, producto_talla_color, productos y sucursales, calculando: cantidad_disponible, cantidad_reservada (sumatoria de reserva_items donde estado_reserva = 'Activa'), cantidad_vendida (sumatoria de venta_items), cantidad_por_ingresar (sumatoria de orden_compra_items pendientes de recepción). 4. El sistema renderiza la tabla con colores por estado: verde (Disponible ≥5), amarillo (Poco Stock: 1-4), rojo (Agotado: 0). 5. El usuario aplica filtros (ej: Sucursal = "Sucursal Centro", Estado = "Agotado"). 6. El sistema refiltra y muestra los resultados. 7. El usuario exporta a CSV.
POST CONDICIÓN | El usuario tiene un panorama completo del estado de todas las prendas en todas las sucursales, con información para tomar decisiones de reposición y distribución.
EXCEPCIONES (Flujo Secundario) | - E1: Sin resultados. "No se encontraron existencias con los filtros seleccionados." - E2: Inventario vacío. "El inventario está vacío. Registra una recepción (CU22) para comenzar."

---

## CU27 — Respaldar Información a Storage Externo

Campo | Descripción
--- | ---
CASO DE USO | CU27 - Respaldar Información a Storage Externo
PROPÓSITO | Permitir al Administrador generar copias de seguridad de la base de datos y almacenarlas en un servicio de almacenamiento externo (cloud storage) como medida de protección contra pérdidas de datos.
DESCRIPCIÓN | Desde el módulo "Configuración → Respaldos" (/admin/respaldos), el Administrador puede ejecutar un respaldo manual o programar respaldos automáticos (diario/semanal). El sistema ejecuta pg_dump de PostgreSQL, comprime el archivo .sql.gz y lo sube a un bucket de almacenamiento externo (AWS S3, Google Cloud Storage o similar). La tabla de respaldos muestra: fecha, tipo (manual/automático), tamaño, estado (Exitoso/Fallido), ubicación en storage y botón "Descargar". La retención se configura (ej: conservar los últimos 30 respaldos).
ACTORES | Administrador General.
ACTOR INICIADOR | Administrador que necesita crear un respaldo o revisar respaldos anteriores.
PRECONDICIÓN | El Administrador debe tener permiso de configuración. Debe existir configuración válida de acceso al servicio de almacenamiento externo.
FLUJO PRINCIPAL (Camino Feliz) | 1. El Administrador navega a Configuración → Respaldos. 2. El sistema muestra la tabla de respaldos recientes. 3. El Administrador presiona "Crear Respaldo Ahora". 4. El sistema ejecuta pg_dump en el backend (subproceso asincrónico). 5. Comprime el archivo .sql en formato .sql.gz. 6. Sube el archivo al bucket de storage externo con la ruta /respaldos/tiendas_montano_YYYYMMDD_HHMMSS.sql.gz. 7. Registra el respaldo en la tabla respaldos con: fecha, tipo='Manual', tamano_bytes, estado='Exitoso', storage_url. 8. Registra en bitacora_auditoria. 9. Muestra "Respaldo creado exitosamente. Tamaño: [X] MB."
POST CONDICIÓN | Existe una copia de seguridad de la base de datos almacenada externamente; puede ser descargada o restaurada en caso de emergencia.
EXCEPCIONES (Flujo Secundario) | - E1: Error de conexión al storage. Si el upload falla, el sistema muestra "Respaldo fallido. No se pudo conectar con el servicio de almacenamiento." y mantiene el archivo local temporalmente. - E2: Espacio insuficiente en storage. El sistema muestra "Espacio insuficiente en el almacenamiento externo. Libera espacio o contacta al administrador de infraestructura." - E3: Respaldo en progreso. Si ya hay un respaldo ejecutándose, el botón se deshabilita con tooltip "Ya hay un respaldo en progreso."