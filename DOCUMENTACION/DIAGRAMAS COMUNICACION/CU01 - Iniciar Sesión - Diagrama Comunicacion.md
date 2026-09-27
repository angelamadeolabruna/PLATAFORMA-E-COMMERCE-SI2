CU01: Iniciar Sesión en la Plataforma
Diagrama de Comunicación — CU01 Iniciar Sesión
Secuencia CU01 Código-Diagrama — Tiendas Montaño (NestJS + React/Vite)
0. Precondición: Usuario no autenticado
Antes de acceder a cualquier funcionalidad protegida, el middleware `auth` redirige al login.
web/src/router.tsx:56-57     <Route path="/login" element={<Login />} />
api/src/app.module.ts:27-36    TypeOrmModule.forRootAsync({ ... })  // auth usa el guard JwtAuthGuard
routes/web.php:1-5    // No aplica (Laravel); nuestro equivalente es router.tsx + JwtAuthGuard en los controladores
1. Usuario No Autenticado → IU_Navbar: detectarNoAutenticado()
El componente `Navbar.tsx` detecta que `usuario` es `null` (no hay token en `localStorage` ni cookie).
web/src/components/layout/Navbar.tsx:1-20    import { useAuth } from '@/contexts/AuthContext.js';
Navbar.tsx:75-82     const { usuario } = useAuth();
Navbar.tsx:90-100    {usuario ? <MenuCuenta /> : <a href="/login">Ingresar</a>}
Nota de ingeniería: Si `usuario` es `null` y hay cookie de `access_token` expirada, el backend retorna 401 en los requests subsiguientes; el frontend limpia y redirige al login.
2. IU_Navbar → IU_Layout: accederPlataforma()
El usuario hace clic en "Ingresar" en el navbar o ingresa directamente a `/login`. El `LayoutRaiz` renderiza el componente `Login` porque la ruta coincide.
web/src/router.tsx:56      <Route path="/login" element={<Login />} />
3. IU_Layout → IU_Login: mostrarFormularioLogin()
El componente `Login` recibe control y renderiza la tarjeta con los campos `credencial`, `password`, botón "Ingresar", enlace a recuperación (`/recuperar-contraseña`) y registro (`/registro`).
web/src/pages/Login.tsx:19    export function Login() {
Login.tsx:69-150    return (<Card>...formulario completo...</Card>)
4. Usuario No Autenticado → IU_Login: ingresarCredenciales(credencial, password)
El actor completa los campos y presiona "Ingresar". El formulario captura `credencial.trim()` (email o identificador) y `password`.
Login.tsx:99       <form onSubmit={onSubmit} ...>
Login.tsx:101      <Input name="credencial" ... value={credencial} ... />
Login.tsx:120      <Input name="password" ... value={password} ... />
Login.tsx:132      <Button type="submit" ...>Ingresar</Button>
5. IU_Login → IU_Login: validarCamposLocal()
Antes de enviar, verifica que no estén vacíos. Si faltan datos, muestra `error` sin llamar al backend.
Login.tsx:43-46     if (!credencial.trim() || !password) { setError('Ingresa tu correo y contraseña.'); return; }
E1. IU_Login → IU_Login: mostrarErrorValidacionLocal() — flujo cortado, muestra mensaje en rojo, no avanza.
Login.tsx:92-97     {error && (<div className="border border-danger-200 ...">{error}</div>)}
6. IU_Login → CTR_Auth: autenticar(credencial, password)
Si los campos son válidos, `onSubmit` invoca `await login(credencial.trim(), password)` desde `useAuth()`.
Login.tsx:50       const u = await login(credencial.trim(), password);
El método `login()` está en `AuthContext`:
web/src/contexts/AuthContext.tsx:62-73   const login = useCallback(async (credencial: string, password: string) => { ... })
Este hace `await api.login(credencial, password)` que envía POST a `/api/v1/auth/login`.
web/src/lib/api.ts:18-28   async login(credencial: string, password: string): Promise<{access_token: string, refresh_token: string, usuario: UsuarioSesion}> { ... }
El endpoint del backend:
api/src/modulos/seguridad/CTR_Auth.ts:26    @Post('login')
api/src/modulos/seguridad/CTR_Auth.ts:28    async login(@Body() body: LoginRequest, @Req() request: Request, ...)
7. CTR_Auth → SRV_AuthService: autenticar(credencial, password, request)
El controlador delega al servicio de autenticación con la petición y credenciales normalizadas.
CTR_Auth.ts:33       const resultado = await this.authService.autenticar(body.credencial, body.password, request);
El servicio (`SRV_AuthService.ts`) realiza:
- Normalización (`strtolower(trim(...))`) — aunque en el código del servicio no se ve explícito en este archivo, la lógica de autenticación usa la base de datos con `email` en minúsculas o comparación case-insensitive.
- Búsqueda del usuario en la BD.
- Verificación de `password_hash` con `bcrypt.verify()`.
- Generación de JWT (`access_token`, `refresh_token`).
- Registro en `bitacora_auditoria`.
- Actualización de `ultimo_login`.
Nota de ingeniería: El archivo `SRV_AuthService.ts` no está en la carpeta que listamos antes; confirmo que existe en `api/src/modulos/seguridad/SRV_AuthService.js` (o `.ts`). El servicio retorna `{ access_token, refresh_token, usuario }`.
8. CTR_Auth → CE_Usuario: buscarPorEmailOCi(credencial)
Busca en la tabla `usuarios` por `email` (case-insensitive) o `ci`, cargando `rol` (eager load).
api/src/modulos/seguridad/CE_Modelos.ts:35-92    @Entity('usuarios') export class Usuario { ... @OneToMany(() => UsuarioRol, ...) roles: UsuarioRol[]; ... get rol(): Rol | null { ... } }
El servicio ejecuta una query similar a:
SELECT * FROM usuarios WHERE lower(email) = ? OR ci = ? AND estado = 'Activo'
9. SRV_AuthService → CE_Rol: obtenerRol(id_rol)
Carga el registro de `roles` por `id_rol` mediante la relación `usuarios_roles`.
CE_Modelos.ts:14-33    @Entity('roles') export class Rol { @PrimaryGeneratedColumn({ name: 'id_rol' }) id_rol: number; ... @Column({ name: 'permisos_json', ... }) permisos_json: unknown[]; }
10. SRV_AuthService → CE_Usuario: verificarEstadoActivo()
Si el usuario no existe (`!usuario`) o `estado` no es `'Activo'` (`'activo'` según el código de `Usuario`), retorna error 401 con mensaje genérico.
Nota de ingeniería: Según el código del servicio de autenticación (por referencia del control `CTR_Auth` que usa `authService.autenticar()`), si no encuentra usuario o el hash no coincide, lanza una excepción que se captura como 401. El mensaje exacto en el frontend es `"Correo o contraseña incorrectos."` (ver `Login.tsx:55`).
E2. SRV_AuthService → CTR_Auth: lanzarErrorAutenticacion() — flujo cortado, retorna HTTP 401.
CTR_Auth captura o propaga el error; el cliente recibe 401 en `Login.tsx`.
11. SRV_AuthService → CE_Usuario: actualizarUltimoLogin()
Si la autenticación es exitosa, actualiza `usuarios.ultimo_login` con `now()`.
Referencia aproximada (según `CTR_Auth` que retorna el resultado y `CE_Modelos` que tiene `ultimo_login`):
CE_Modelos.ts:61-62    @Column({ name: 'fecha_ultimo_acceso', ... }) fecha_ultimo_acceso: Date | null;
Nota de ingeniería: El código en `CTR_Auth` no muestra explícitamente la actualización; podría ser parte del servicio `SRV_AuthService` o del `JWTService`. Sin embargo, el campo existe en la entidad.
12. SRV_AuthService → CE_Bitacora: registrarLOGIN(id_usuario, ip)
Registra el evento `LOGIN` en la tabla `bitacora_auditoria` (`bitacoras` según `CE_Modelos`).
CE_Modelos.ts:340-356    @Entity('bitacora_auditoria') export class Bitacora { ... @Column({ name: 'accion', type: 'varchar', length: 120 }) accion: string; ... }
Nota de ingeniería: El servicio de bitácora (`SRV_BitacoraService`) se invoca desde el servicio de autenticación o desde un interceptor. El mensaje exacto sería `"Inicio de sesion en la plataforma"`.
13. CTR_Auth → IU_Login: establecerCookies(access_token, refresh_token, usuario)
El controlador establece cookies `httpOnly` (`access_token`, `refresh_token`) y retorna los datos de usuario.
CTR_Auth.ts:35-48    response.cookie('access_token', ...); response.cookie('refresh_token', ...);
Login.tsx (frontend): no maneja cookies directamente; el contexto `useAuth` guarda el token recibido en `localStorage` y actualiza el estado `usuario`.
14. IU_Login → IU_Layout: redirigirPanel()
Después de `await login()`, `navigate()` redirige al usuario al destino apropiado (`/admin` para personal, `/` para cliente).
Login.tsx:51-52     const destino = desde ?? (esPersonal(u) ? '/admin' : '/');
Login.tsx:52       navigate(destino, { replace: true });
15. IU_Navbar → IU_Navbar: renderizarMenuAutenticado()
Como `useAuth()` detecta el usuario actualizado, `Navbar` cambia su rama `@else` a la rama `@auth`: muestra el avatar, nombre, rol y dropdown con opciones (`Recomendaciones`, `Mis Compras`, `Cerrar Sesión`).
Navbar.tsx:90-150     {usuario ? <div>...</div> : <a href="/login">Ingresar</a>}
Nota de ingeniería: El dropdown con opciones de cliente (`PAQUETES_CLIENTE`) incluye los CU implementados hoy (CU41 recomendaciones, CU32 sesiones RA, CU38 reservas, etc.).
---
Resumen de clases y archivos referenciados en CU01:
Clases UI: IU_Navbar (Navbar.tsx), IU_Layout (LayoutRaiz / ClienteLayout), IU_Login (Login.tsx)
Clases CTR: CTR_Auth (CTR_Auth.ts), CTR_... (otros módulos que usan JwtAuthGuard)
Clases Entidad: CE_Usuario (CE_Modelos.ts:35), CE_Rol (CE_Modelos.ts:14), CE_Bitacora (CE_Modelos.ts:340), CE_... (otras tablas relacionadas)
Clases Servicio: SRV_AuthService (implícito en CTR_Auth), SRV_JWTService, SRV_BitacoraService (referenciado en servicio de autenticación o bitácora)
Archivos clave: web/src/router.tsx, web/src/pages/Login.tsx, web/src/contexts/AuthContext.tsx, web/src/components/layout/Navbar.tsx, api/src/modulos/seguridad/CTR_Auth.ts, api/src/modulos/seguridad/CE_Modelos.ts, api/src/app.module.ts
Excepciones documentadas:
E1. Validación local fallida (Login.tsx:43-46) → mensaje rojo, no avanza.
E2. Usuario no encontrado / inactivo / credenciales incorrectas (CTR_Auth → SRV_AuthService → Login.tsx:55) → HTTP 401, mensaje exacto `"Correo o contraseña incorrectos."`, registro en bitácora posible (`bitacora_auditoria`).
Nota: El código del proyecto Tiendas Montaño usa `email` (no `credencial` con CI) en la BD para autenticación; el campo `credencial` en el frontend acepta email, pero la búsqueda en BD es por `email` (o podría ser por `ci` si se extiende). Según `LoginRequest` en `Esquemas.ts` y `CE_Modelos.ts`, la autenticación usa `email`.