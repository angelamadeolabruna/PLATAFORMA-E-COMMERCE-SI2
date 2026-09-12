# DIAGRAMA DE COMUNICACIÓN - CU01 Iniciar Sesión en la Plataforma

> **Plantilla estándar** para todos los diagramas de comunicación de Tiendas Montaño.
> Stack: **FastAPI (Python)** + **Angular** + **PostgreSQL** + **Flutter**.
> Estructura de clases:
> - **IU_** = Clase UI (componente Angular / pantalla Flutter)
> - **CTRL_** = Clase Control (router + servicio FastAPI)
> - **CE_** = Clase Entidad (tabla PostgreSQL / modelo SQLAlchemy)
> - **SRV_** = Servicio externo o servicio de infraestructura
>
> Este documento es la plantilla de referencia. Sirve como estándar para CU01-CU46.

---

## CU01: Iniciar Sesión en la Plataforma

### Diagrama de Comunicación - CU01 Iniciar Sesión

**Precondición:** Usuario no autenticado. El ruteo raíz del SPA Angular redirige al login.

```
[Usuario No Autenticado] <--- (asociación) ---> [IU_Login]
                        \                        /
                         \--(asociación)------>/ | \
                                              / |  \
                                        IU_Login  IU_Layout
                                              |
                                              v
                                        [CTRL_Auth]  (FastAPI: router + service)
                                          |    \
                                          |     \--> CTRL_Auth:validar_input()
                                          v
                                     [SRV_SupabaseAuth / SRV_Seguridad]
                                          |
                                          v
                                        [CE_Usuario] --(1..1)--> [CE_Rol]
                                        [CE_Bitacora]
```

---

## Secuencia CU01 (Flujo Principal)

### 0. Precondición: Usuario no autenticado

Antes de mostrar cualquier pantalla, la ruta raíz redirige al login.
El guard Angular `AuthGuard` verifica si existe token JWT.

```typescript
// app-routing.module.ts
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  // ...
];
```

```typescript
// core/guards/auth.guard.ts
canActivate(route, state): boolean {
  const token = this.authService.getToken();
  if (!token) {
    this.router.navigate(['/login']);
    return false;
  }
  return true;
}
```

---

### 1. Usuario No Autenticado → IU_Layout: accederPlataforma()

El usuario ingresa a la URL raíz `/` o directamente a `/login`.
El layout renderiza la versión *guest* (sin sidebar, solo header centrado).

```typescript
// layouts/app-layout.component.html (rama guest)
<ng-container *ngIf="authService.isAuthenticated(); else guestTemplate">
  <!-- sidebar + topbar completa -->
</ng-container>
<ng-template #guestTemplate>
  <div class="centered-container">
    <ng-content></ng-content>
  </div>
</ng-template>
```

---

### 2. IU_Layout → IU_Login: mostrarFormularioLogin()

`AuthService.isAuthenticated()` es `false`, el layout renderiza el contenedor centrado
y dentro el `<router-outlet>` muestra el componente `LoginComponent`.

```typescript
// pages/login/login.component.html
<div class="card">
  <h2>Iniciar sesión</h2>
  <p>Ingresá con tu correo electrónico o CI.</p>

  <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>

  <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
    <label for="credencial">Correo o CI</label>
    <input id="credencial" formControlName="credencial" />

    <label for="password">Contraseña</label>
    <input id="password" formControlName="password" type="password" />

    <button type="submit" [disabled]="loginForm.invalid">Ingresar</button>
    <a routerLink="/recuperar-password">¿Olvidaste tu contraseña?</a>
  </form>
</div>
```

---

#### E2. IU_Login → IU_Login: mostrarErrorValidacion()

Si hay errores de validación previos, se muestran en el mismo formulario (estado reactive form).

```typescript
// pages/login/login.component.ts
onSubmit(): void {
  if (this.loginForm.invalid) { return; }
  const { credencial, password } = this.loginForm.value;
  this.authService.login(credencial, password).subscribe({
    next: (res) => this.router.navigate(['/dashboard']),
    error: (err) => { this.errorMessage = err.error?.detail || 'Error al iniciar sesión.'; }
  });
}
```

---

### 3. Usuario No Autenticado → IU_Login: ingresarCredenciales(correo_o_ci, contraseña)

El actor completa el formulario y presiona "Ingresar".
El frente Angular envía `POST /api/v1/auth/login` con body JSON.

```typescript
// core/services/auth.service.ts
login(credencial: string, password: string): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { credencial, password });
}
```

---

### 4. IU_Login → CTR_Auth: autenticar(credencial, password)

El endpoint FastAPI recibe la petición. Entra al router de autenticación.

```python
# app/api/v1/endpoints/auth.py
@router.post("/login", response_model=TokenResponse)
def login(credencial: str = Body(...), password: str = Body(...),
          db: Session = Depends(get_db),
          request: Request = None):
    return auth_service.autenticar(credencial, password, db, request)
```

#### 4.1. CTR_Auth → CTR_Auth: validarInput()

Valida que `credencial` y `password` estén presentes y con tipos correctos.

```python
# app/services/auth_service.py
def autenticar(self, credencial: str, password: str, db: Session, request: Request):
    # Normalizar input
    credencial = credencial.strip().lower()
    if not credencial or not password:
        raise HTTPException(status_code=422, detail="Credencial y contraseña son obligatorias.")
```

---

### 5. CTR_Auth → CE_Usuario: buscarPorEmailOCi(credencial)

Busca el usuario por email (case-insensitive) o CI, cargando también el rol.

```python
# app/services/auth_service.py
usuario = db.query(Usuario).filter(
    (func.lower(Usuario.email) == credencial) | (Usuario.ci == credencial)
).first()
if not usuario:
    raise HTTPException(status_code=401, detail="Credenciales inválidas.")
```

**CE_Usuario** es la tabla `usuarios`:

```sql
CREATE TABLE usuarios (
    id_usuario  SERIAL PRIMARY KEY,
    id_rol      INTEGER REFERENCES roles(id_rol),
    email       VARCHAR(120) UNIQUE,
    ci          VARCHAR(30) UNIQUE,
    password_hash VARCHAR(255),
    estado      VARCHAR(30) DEFAULT 'activo',  -- activo / inactivo / pendiente
    intentos_fallidos INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_ultimo_acceso TIMESTAMP,
    ultimo_login TIMESTAMP
);
```

#### 5.1. CE_Usuario → CE_Rol: obtenerRol()

FastAPI hace eager-load del rol del usuario mediante la relación SQLAlchemy.

```python
# app/models/usuario.py
class Usuario(Base):
    __tablename__ = "usuarios"
    id_usuario = Column(Integer, primary_key=True)
    id_rol = Column(Integer, ForeignKey("roles.id_rol"))
    rol = relationship("Rol", back_populates="usuarios")
```

---

### 6. CTR_Auth → CTR_Auth: verificarEstadoActivo()

Valida que el usuario exista y esté `activo`. Si no, retorna error genérico
(no revela si existe o está inactivo — seguridad anti-enumeración).

```python
if usuario.estado != "activo":
    raise HTTPException(status_code=401, detail="Credenciales inválidas.")
```

#### E2. CTR_Auth → IU_Login: mostrarErrorCredenciales()

Flujo cortado: vuelve al formulario con error genérico.

---

### 7. CTR_Auth → SRV_Seguridad: validarPassword(usuario, password)

Delega la validación de contraseña al servicio de seguridad (usa `bcrypt`/`passlib`).

```python
# app/services/seguridad_service.py
def validar_password(self, usuario: Usuario, password: str) -> bool:
    return bcrypt.checkpw(password.encode(), usuario.password_hash.encode())
```

#### E1. SRV_Seguridad → IU_Login: mostrarCredencialesInvalidas()

Flujo cortado: contraseña incorrecta → vuelve al login con error genérico.

---

### 8. CTR_Auth → CE_Usuario: crearSesion(usuario)

Crea el JWT de acceso y lo retorna.

```python
# app/services/auth_service.py (inicio de sesión OK)
access_token = self.jwt_service.create_access_token(
    sub=str(usuario.id_usuario), rol=usuario.rol.nombre_rol
)
# Actualiza intentos fallidos a 0
usuario.intentos_fallidos = 0
```

---

### 9. CTR_Auth → CE_Usuario: actualizarUltimoLogin()

Actualiza la marca de tiempo del último acceso y la sesión.

```python
usuario.fecha_ultimo_acceso = datetime.utcnow()
db.commit()
```

---

### 10. CTR_Auth → CE_Rol: cargarPermisos()

El JWT incluye el rol y los permisos para el frontend (sidebar, guards).

```python
# app/core/security/jwt_service.py
payload = {
    "sub": str(usuario.id_usuario),
    "rol": usuario.rol.nombre_rol,
    "permisos": usuario.rol.permisos_json,
    "exp": datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
}
```

---

### 11. CTR_Auth → CE_Bitacora: registrarLOGIN(id_usuario, ip, user_agent)

Registra el evento en la bitácora de auditoría.

```python
# app/services/bitacora_service.py
def registrar(self, id_usuario, accion, tabla, detalle, ip, id_registro):
    bitacora = Bitacora(
        id_usuario=id_usuario, accion=accion, tabla_afectada=tabla,
        detalle=detalle, ip_origen=ip, id_registro=id_registro
    )
    db.add(bitacora); db.commit()
```

**CE_Bitacora** es la tabla `bitacoras`:

```sql
CREATE TABLE bitacoras (
    id_bitacora  SERIAL PRIMARY KEY,
    id_usuario   INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    accion       VARCHAR(120),
    tabla_afectada VARCHAR(80),
    id_registro  INTEGER,
    detalle      TEXT,
    ip_origen    VARCHAR(45),
    user_agent   VARCHAR(255),
    created_at   TIMESTAMP DEFAULT NOW()
);
```

---

### 12. CTR_Auth → IU_Dashboard: retornarTokenYRedirigir

El endpoint retorna el token JWT; el Angular guarda el token y redirige al dashboard.

```python
return {"access_token": access_token, "token_type": "bearer",
        "usuario": {"id": usuario.id_usuario, "nombre": usuario.nombre,
                    "rol": usuario.rol.nombre_rol, "permisos": usuario.rol.permisos_json}}
```

```typescript
// core/services/auth.service.ts
next: (res) => {
  this.tokenStorage.setToken(res.access_token);
  this.router.navigate(['/dashboard']);
}
```

---

### 13. IU_Layout → IU_Layout: renderizarSidebarPorRol()

El layout detecta `isAuthenticated()` y renderiza la versión completa con sidebar
y topbar. El sidebar muestra secciones según el rol y permisos del usuario.

```typescript
// core/services/auth.service.ts
getPermisos(): string[] {
  const user = this.tokenStorage.getUser();
  return user?.permisos ?? [];
}
```

```html
<!-- layouts/app-layout.component.html (rama auth) -->
<li *ngIf="hasPermiso('gestionar_usuarios')">Usuarios</li>
<li *ngIf="hasPermiso('gestionar_catalogo')">Catálogo</li>
```

---

### 14. CTR_Dashboard → CE_*: cargarIndicadores()

El dashboard consulta KPIs del negocio. (Detalle en CU44 - Dashboard Inteligente).

```python
# app/api/v1/endpoints/dashboard.py
@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return dashboard_service.indicadores(db, current_user.id_rol)
```

---

## Resumen de Clases del CU01

| Clase | Tipo | Archivo |
|-------|------|---------|
| IU_Layout | UI (Angular) | `src/app/layouts/app-layout.component.ts` |
| IU_Login | UI (Angular) | `src/app/pages/login/login.component.ts` |
| IU_Dashboard | UI (Angular) | `src/app/pages/dashboard/dashboard.component.ts` |
| CTR_Auth | Control (FastAPI) | `app/api/v1/endpoints/auth.py` |
| SRV_Seguridad | Servicio | `app/services/seguridad_service.py` |
| SRV_Bitacora | Servicio | `app/services/bitacora_service.py` |
| CE_Usuario | Entidad (tabla `usuarios`) | `app/models/usuario.py` |
| CE_Rol | Entidad (tabla `roles`) | `app/models/rol.py` |
| CE_Bitacora | Entidad (tabla `bitacoras`) | `app/models/bitacora.py` |

---

## Excepciones del CU01

| Excepción | Descripción | Código HTTP |
|-----------|-------------|-------------|
| E1. Credenciales inválidas | Usuario no existe o contraseña incorrecta (mantener genérico) | 401 |
| E2. Usuario inactivo | Estado != 'activo' → error genérico anti-enumeración | 401 |
| E3. Input inválido | Falta credencial o contraseña | 422 |
| E4. Error servidor | Excepción no controlada | 500 |

---

## Notas de coherencia

- **Nombre de métodos:** los nombres de los métodos del diagrama (`autenticar`, `validarPassword`,
  `buscarPorEmailOCi`, `crearSesion`, `registrarLOGIN`) corresponden 1:1 a los métodos reales
  en FastAPI y Angular. No inventamos nombres diferentes entre diagrama y código.
- **Clases Entidad = tablas.** Cada `CE_` mapea a una tabla PostgreSQL con su modelo SQLAlchemy.
- **Clases Control = routers + servicios FastAPI.** Separación de responsabilidades.
- **Clases UI = componentes Angular** (para móvil, pantallas Flutter con el mismo flujo).
- **Excepciones numeradas (E1, E2...)** y referenciadas consistentemente en diagrama, flujo y código.
- Los triggers/procedimientos almacenados de la BD se documentan por separado en `BASE DE DATOS`.

---

## Pendiente de definir (para la BD completa)

- Trigger `trg_bloquear_usuario` que incrementa `intentos_fallidos` y cambia estado a 'bloqueado'
  tras 5 intentos fallidos (soporta CU01 y CU04).
- Procedimiento `sp_registrar_login` que actualiza `fecha_ultimo_acceso` e inserta bitácora
  en una sola transacción.
- Tabla `token_sesiones` (blacklist de JWT revocados) para soportar CU02 (cerrar sesión) y
  CU04 (cambio de contraseña invalida sesiones).
