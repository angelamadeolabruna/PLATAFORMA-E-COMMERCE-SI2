const TOKEN_KEY = 'access_token';
let promesaRefresh: Promise<string | null> | null = null;

function renovarToken(): Promise<string | null> {
  if (promesaRefresh) return promesaRefresh;

  promesaRefresh = (async () => {
    try {
      const res = await fetch(`${api.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) return null;
      const body = (await res.json()) as LoginResponse;
      localStorage.setItem(TOKEN_KEY, body.access_token);
      window.dispatchEvent(
        new CustomEvent('tm:sesion', {
          detail: { token: body.access_token, usuario: body.usuario, tipo: 'renovada' },
        }),
      );
      return body.access_token;
    } catch {
      return null;
    } finally {
      promesaRefresh = null;
    }
  })();

  return promesaRefresh;
}

function expulsarSesion(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('usuario');
  window.dispatchEvent(new CustomEvent('tm:sesion', { detail: { token: null, tipo: 'expirada' } }));
}

interface SolicitarOpciones {
  renovar?: boolean;
}

async function solicitar(
  entrada: RequestInfo | URL,
  init: RequestInit = {},
  opciones: SolicitarOpciones = {},
): Promise<Response> {
  const renovar = opciones.renovar ?? true;

  const headers = new Headers(init.headers);
  if (renovar && !headers.has('Authorization')) {
    const tok = localStorage.getItem(TOKEN_KEY);
    if (tok) headers.set('Authorization', `Bearer ${tok}`);
  }

  let res = await fetch(entrada, { ...init, headers, credentials: 'include' });

  if (res.status === 401 && renovar) {
    const nuevo = await renovarToken();
    if (nuevo) {
      const headers2 = new Headers(headers);
      headers2.set('Authorization', `Bearer ${nuevo}`);
      res = await fetch(entrada, { ...init, headers: headers2, credentials: 'include' });
    } else {
      expulsarSesion();
    }
  }

  return res;
}

export interface UsuarioSesion {
  id: number;
  nombre: string | null;
  email: string;
  rol: string | null;
  permisos: unknown[];
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  usuario: UsuarioSesion;
}

export interface RegistroPayload {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
}

export interface RegistroResponse {
  detail: string;
  usuario_id: number;
  confirmacion_email: string;
  warning?: string;
}

export interface RegistroAuditoria {
  id: number;
  fecha: string;
  ip: string | null;
  correo: string | null;
  accion_sql: string;
  tabla_afectada: string | null;
  registro_id: number | null;
  old_data: unknown;
  new_data: unknown;
}

export interface AuditoriaResponse {
  registros: RegistroAuditoria[];
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
}

export interface FiltrosAuditoria {
  pagina?: number;
  limite?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  usuario?: string;
  tabla?: string;
  accion?: string;
  format?: 'json' | 'csv';
}

export interface EmpleadoItem {
  id_usuario: number;
  id_empleado: number | null;
  email: string;
  nombre_empleado: string | null;
  telefono: string | null;
  sucursal_id: number | null;
  sucursal_nombre: string | null;
  rol: string | null;
  estado: string;
  fecha_creacion: string;
  ultimo_login: string | null;
}

export interface RegistrarEmpleadoPayload {
  nombre: string;
  email: string;
  telefono?: string;
  sucursal_id: number;
  rol_nombre: string;
  password_temporal?: string;
}

export interface GrupoPermisos {
  grupo: string;
  permisos: string[];
}

export interface RolItem {
  id_rol: number;
  nombre_rol: string;
  descripcion: string | null;
  estado: string;
  nro_usuarios: number;
  permisos: string[];
}

export interface CrearRolPayload {
  nombre_rol: string;
  descripcion?: string;
}

export interface ActualizarRolPayload {
  nombre_rol?: string;
  descripcion?: string;
}

export interface CiudadItem {
  id_ciudad: number;
  nombre: string;
  departamento: string | null;
  estado: string;
  nro_sucursales: number;
}

export interface LineaDisponibilidad {
  talla: string;
  color: string;
  codigo_hex: string | null;
  disponible: number;
  reservada: number;
  stock_bajo: boolean;
}

export interface SucursalDisponibilidad {
  id_sucursal: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string | null;
  lineas: LineaDisponibilidad[];
}

export interface ConsultaDisponibilidad {
  producto: {
    id_producto: number;
    codigo: string;
    nombre: string;
    descripcion: string | null;
    precio: number;
    categoria: string | null;
    imagen_principal: string | null;
  };
  tallas: Array<{ nombre: string }>;
  colores: Array<{ nombre: string; codigo_hex: string | null }>;
  sucursales: SucursalDisponibilidad[];
}

export interface ItemCatalogoPublico {
  id_producto: number;
  codigo: string;
  nombre: string;
  precio_con_iva: number;
  precio_base: number;
  porcentaje_iva: number;
  categoria: string | null;
  imagen_principal: string | null;
  tallas: string[];
  colores: string[];
}

export interface OpcionesCatalogoPublico {
  categorias: Array<{ id_categoria: number; nombre: string }>;
  tallas: Array<{ id_talla: number; nombre: string }>;
  colores: Array<{ id_color: number; nombre: string; codigo_hex: string | null }>;
  temporadas: Array<{ id_temporada: number; nombre: string }>;
}

export interface ResultadoCatalogoPublico {
  items: ItemCatalogoPublico[];
  total: number;
}

export interface FiltrosCatalogoPublico {
  busqueda?: string;
  categoria?: number;
  talla?: number;
  color?: number;
  temporada?: number;
  precio_min?: number;
  precio_max?: number;
  pagina?: number;
  limite?: number;
}

export interface ProductoItem {
  id_producto: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  id_categoria: number | null;
  categoria: string | null;
  id_temporada: number | null;
  temporada: string | null;
  precio_base: number;
  porcentaje_iva: number;
  combinaciones: number;
  estado: string;
  fecha_registro: string;
}

export interface SelectoresProducto {
  categorias: Array<{ id_categoria: number; nombre: string; porcentaje_iva_default: number }>;
  tallas: Array<{ id_talla: number; nombre: string }>;
  colores: Array<{ id_color: number; nombre: string; codigo_hex: string | null }>;
  temporadas: Array<{ id_temporada: number; nombre: string; estado: string }>;
}

export interface TallaItem {
  id_talla: number;
  nombre: string;
  talla_europea: string | null;
  orden: number;
  estado: string;
}

export interface ColorItem {
  id_color: number;
  nombre: string;
  codigo_hex: string | null;
  estado: string;
}

export interface CategoriaItem {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
  porcentaje_iva_default: number;
  estado: string;
}

export interface TemporadaItem {
  id_temporada: number;
  nombre: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado: string;
  nro_productos: number;
}

export interface ColeccionItem {
  id_coleccion: number;
  nombre: string;
  descripcion: string | null;
  id_temporada: number | null;
  nombre_temporada: string | null;
  fecha_creacion: string;
}

export type CrearTemporadaPayload = {
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado?: string;
};

export type CrearColeccionPayload = {
  nombre: string;
  descripcion?: string;
  id_temporada: number;
};

export type CrearTallaPayload = { nombre: string; talla_europea?: string };
export type CrearColorPayload = { nombre: string; codigo_hex: string };
export type CrearCategoriaPayload = {
  nombre: string;
  descripcion?: string;
  porcentaje_iva_default?: number;
};

export interface CrearProductoPayload {
  nombre: string;
  descripcion?: string;
  id_categoria: number;
  id_temporada: number;
  precio_base: number;
  porcentaje_iva?: number;
  tallas: number[];
  colores: number[];
}

export interface SucursalItem {
  id_sucursal: number;
  nombre: string;
  direccion: string;
  id_ciudad: number | null;
  nombre_ciudad: string | null;
  telefono: string | null;
  estado: string;
  fecha_registro: string;
}

// CU18 - Proveedores
export interface ProveedorItem {
  id_proveedor: number;
  nombre: string;
  nit_ruc: string;
  telefono: string;
  correo: string;
  id_ciudad: number | null;
  nombre_ciudad: string | null;
  direccion: string | null;
  condiciones_comerciales: string | null;
  estado: string;
  calidad_score: number | null;
  score_fecha: string | null;
  fecha_registro: string;
}

export interface CrearProveedorPayload {
  nombre: string;
  nit_ruc: string;
  telefono: string;
  correo: string;
  id_ciudad: number;
  direccion?: string;
  condiciones_comerciales?: string;
}

export interface RecalcularScoreResultado {
  detail: string;
  score: number;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    let message = 'Ocurrió un error inesperado.';
    if (body && typeof body === 'object') {
      const m = (body as { message?: string | string[] }).message;
      if (typeof m === 'string') message = m;
      else if (Array.isArray(m) && m.length > 0) message = m.join('\n');
    }
    throw new ApiError(res.status, message);
  }

  return body as T;
}

export const api = {
  baseUrl: '/api/v1',

  async login(credencial: string, password: string): Promise<LoginResponse> {
    const res = await solicitar(
      `${this.baseUrl}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credencial, password }),
      },
      { renovar: false },
    );
    return handleResponse<LoginResponse>(res);
  },

  async refresh(): Promise<LoginResponse | null> {
    const nuevo = await renovarToken();
    if (!nuevo) return null;
    const usuario = JSON.parse(localStorage.getItem('usuario') ?? 'null') as UsuarioSesion | null;
    return { access_token: nuevo, refresh_token: '', token_type: 'bearer', usuario: usuario ?? { id: 0, nombre: null, email: '', rol: null, permisos: [] } };
  },

  async logout(): Promise<void> {
    const res = await solicitar(
      `${this.baseUrl}/auth/logout`,
      { method: 'POST' },
      { renovar: true },
    );
    return handleResponse<void>(res);
  },

  async cambiarPassword(passwordActual: string, passwordNueva: string): Promise<{ detail: string }> {
    const res = await solicitar(`${this.baseUrl}/auth/cambiar-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password_actual: passwordActual, password_nueva: passwordNueva }),
    });
    return handleResponse<{ detail: string }>(res);
  },

  async registrar(payload: RegistroPayload): Promise<RegistroResponse> {
    const res = await solicitar(
      `${this.baseUrl}/clientes/registrar`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      { renovar: false },
    );
    return handleResponse<RegistroResponse>(res);
  },

  async forgotPassword(email: string): Promise<{ detail: string }> {
    const res = await solicitar(
      `${this.baseUrl}/auth/forgot-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      },
      { renovar: false },
    );
    return handleResponse<{ detail: string }>(res);
  },

  async resetPassword(token: string, password: string): Promise<{ detail: string }> {
    const res = await solicitar(
      `${this.baseUrl}/auth/reset-password`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      },
      { renovar: false },
    );
    return handleResponse<{ detail: string }>(res);
  },

  async firstPassword(token: string, password: string): Promise<{ detail: string }> {
    const res = await solicitar(
      `${this.baseUrl}/auth/first-password`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      },
      { renovar: false },
    );
    return handleResponse<{ detail: string }>(res);
  },

  async listarAuditoria(filtros: FiltrosAuditoria): Promise<AuditoriaResponse> {
    const search = new URLSearchParams();
    if (filtros.pagina) search.set('pagina', String(filtros.pagina));
    if (filtros.limite) search.set('limite', String(filtros.limite));
    if (filtros.fecha_desde) search.set('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) search.set('fecha_hasta', filtros.fecha_hasta);
    if (filtros.usuario) search.set('usuario', filtros.usuario);
    if (filtros.tabla) search.set('tabla', filtros.tabla);
    if (filtros.accion) search.set('accion', filtros.accion);

    const res = await solicitar(`${this.baseUrl}/admin/auditoria?${search.toString()}`);
    return handleResponse<AuditoriaResponse>(res);
  },

  async exportarAuditoriaCSV(filtros: FiltrosAuditoria): Promise<{ blob: Blob; filename: string }> {
    const search = new URLSearchParams();
    if (filtros.fecha_desde) search.set('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) search.set('fecha_hasta', filtros.fecha_hasta);
    if (filtros.usuario) search.set('usuario', filtros.usuario);
    if (filtros.tabla) search.set('tabla', filtros.tabla);
    if (filtros.accion) search.set('accion', filtros.accion);
    search.set('format', 'csv');

    const res = await solicitar(`${this.baseUrl}/admin/auditoria?${search.toString()}`);
    if (!res.ok) {
      throw new ApiError(res.status, 'No se pudo exportar la bitácora.');
    }
    const blob = await res.blob();
    const disposicion = res.headers.get('Content-Disposition') ?? '';
    const match = /filename="?([^";]+)"?/.exec(disposicion);
    const filename = match ? match[1] : `bitacora_auditoria_${new Date().toISOString().slice(0, 10)}.csv`;
    return { blob, filename };
  },

  async listarUsuariosEmail(): Promise<{ id: number; email: string }[]> {
    const res = await solicitar(`${this.baseUrl}/admin/usuarios-email`);
    return handleResponse<{ id: number; email: string }[]>(res);
  },

  async listarEmpleados(): Promise<EmpleadoItem[]> {
    const res = await solicitar(`${this.baseUrl}/admin/empleados`);
    return handleResponse<EmpleadoItem[]>(res);
  },

  async listarSucursalesActivas(): Promise<{ id_sucursal: number; nombre: string }[]> {
    const res = await solicitar(`${this.baseUrl}/admin/sucursales/activas`);
    return handleResponse<{ id_sucursal: number; nombre: string }[]>(res);
  },

  async listarCiudades(): Promise<CiudadItem[]> {
    const res = await solicitar(`${this.baseUrl}/admin/ciudades`);
    return handleResponse<CiudadItem[]>(res);
  },

  async crearCiudad(payload: { nombre: string; departamento: string }): Promise<{ detail: string; id_ciudad: number }> {
    const res = await solicitar(`${this.baseUrl}/admin/ciudades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ detail: string; id_ciudad: number }>(res);
  },

  async actualizarCiudad(id: number, payload: { nombre?: string; departamento?: string }): Promise<{ detail: string }> {
    const res = await solicitar(`${this.baseUrl}/admin/ciudades/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ detail: string }>(res);
  },

  async cambiarEstadoCiudad(id: number, estado: string): Promise<{ detail: string }> {
    const res = await solicitar(`${this.baseUrl}/admin/ciudades/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    return handleResponse<{ detail: string }>(res);
  },

  async listarSucursales(): Promise<SucursalItem[]> {
    const res = await solicitar(`${this.baseUrl}/admin/sucursales`);
    return handleResponse<SucursalItem[]>(res);
  },

  async crearSucursal(payload: {
    nombre: string;
    id_ciudad: number;
    direccion: string;
    telefono?: string;
  }): Promise<{ detail: string; id_sucursal: number }> {
    const res = await solicitar(`${this.baseUrl}/admin/sucursales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ detail: string; id_sucursal: number }>(res);
  },

  async actualizarSucursal(
    id: number,
    payload: { nombre?: string; id_ciudad?: number; direccion?: string; telefono?: string },
  ): Promise<{ detail: string }> {
    const res = await solicitar(`${this.baseUrl}/admin/sucursales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ detail: string }>(res);
  },

  async cambiarEstadoSucursal(id: number, estado: string): Promise<{ detail: string }> {
    const res = await solicitar(`${this.baseUrl}/admin/sucursales/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    return handleResponse<{ detail: string }>(res);
  },

  async registrarEmpleado(payload: RegistrarEmpleadoPayload): Promise<{ detail: string; usuario_id: number }> {
    const res = await solicitar(`${this.baseUrl}/admin/empleados`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ detail: string; usuario_id: number }>(res);
  },

  async deshabilitarEmpleado(id: number, motivo?: string): Promise<{ detail: string }> {
    const res = await solicitar(`${this.baseUrl}/admin/empleados/${id}/deshabilitar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo: motivo || undefined }),
    });
    return handleResponse<{ detail: string }>(res);
  },

  async rehabilitarEmpleado(id: number): Promise<{ detail: string }> {
    const res = await solicitar(`${this.baseUrl}/admin/empleados/${id}/rehabilitar`, {
      method: 'PATCH',
    });
    return handleResponse<{ detail: string }>(res);
  },

  async listarRoles(): Promise<RolItem[]> {
    const res = await solicitar(`${this.baseUrl}/admin/roles`);
    return handleResponse<RolItem[]>(res);
  },

  async obtenerCatalogoPermisos(): Promise<{ grupos: GrupoPermisos[] }> {
    const res = await solicitar(`${this.baseUrl}/admin/roles/permisos-catalogo`);
    return handleResponse<{ grupos: GrupoPermisos[] }>(res);
  },

  async obtenerPermisosRol(rolId: number): Promise<{ id_rol: number; nombre_rol: string; descripcion: string | null; estado: string; permisos: string[] }> {
    const res = await solicitar(`${this.baseUrl}/admin/roles/${rolId}/permisos`);
    return handleResponse(res);
  },

  async actualizarPermisosRol(rolId: number, permisos: string[]): Promise<{ detail: string }> {
    const res = await solicitar(`${this.baseUrl}/admin/roles/${rolId}/permisos`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permisos }),
    });
    return handleResponse<{ detail: string }>(res);
  },

  async crearRol(payload: CrearRolPayload): Promise<{ detail: string; id_rol: number }> {
    const res = await solicitar(`${this.baseUrl}/admin/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ detail: string; id_rol: number }>(res);
  },

  async actualizarRol(rolId: number, payload: ActualizarRolPayload): Promise<{ detail: string }> {
    const res = await solicitar(`${this.baseUrl}/admin/roles/${rolId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ detail: string }>(res);
  },

  async eliminarRol(rolId: number): Promise<{ detail: string }> {
    const res = await solicitar(`${this.baseUrl}/admin/roles/${rolId}`, {
      method: 'DELETE',
    });
    return handleResponse<{ detail: string }>(res);
  },

  async consultarDisponibilidad(codigo: string): Promise<ConsultaDisponibilidad> {
    const res = await solicitar(
      `${this.baseUrl}/catalogo/publico/${encodeURIComponent(codigo)}/disponibilidad`,
      {},
      { renovar: false },
    );
    return handleResponse<ConsultaDisponibilidad>(res);
  },

  async listarProductos(): Promise<ProductoItem[]> {
    const res = await solicitar(`${this.baseUrl}/admin/catalogo/productos`);
    return handleResponse<ProductoItem[]>(res);
  },

  async obtenerSelectoresProducto(): Promise<SelectoresProducto> {
    const res = await solicitar(`${this.baseUrl}/admin/catalogo/productos/selectores`);
    return handleResponse<SelectoresProducto>(res);
  },

  async crearProducto(payload: CrearProductoPayload): Promise<{
    detail: string;
    id_producto: number;
    codigo: string;
    combinaciones: number;
    precio_final: number;
  }> {
    const res = await solicitar(`${this.baseUrl}/admin/catalogo/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async listarTallas(): Promise<TallaItem[]> {
    const res = await solicitar(`${this.baseUrl}/admin/catalogos/tallas`);
    return handleResponse<TallaItem[]>(res);
  },
  async crearTalla(payload: CrearTallaPayload): Promise<TallaItem> {
    const res = await solicitar(`${this.baseUrl}/admin/catalogos/tallas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<TallaItem>(res);
  },
  async actualizarTalla(id: number, payload: CrearTallaPayload): Promise<TallaItem> {
    const res = await solicitar(`${this.baseUrl}/admin/catalogos/tallas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<TallaItem>(res);
  },
  async inhabilitarTalla(id: number): Promise<{ detail: string }> {
    const res = await solicitar(`${this.baseUrl}/admin/catalogos/tallas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'Inactivo' }),
    });
    return handleResponse<{ detail: string }>(res);
  },

  async listarColores(): Promise<ColorItem[]> {
    const res = await solicitar(`${this.baseUrl}/admin/catalogos/colores`);
    return handleResponse<ColorItem[]>(res);
  },
  async crearColor(payload: CrearColorPayload): Promise<ColorItem> {
    const res = await solicitar(`${this.baseUrl}/admin/catalogos/colores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<ColorItem>(res);
  },
  async actualizarColor(id: number, payload: CrearColorPayload): Promise<ColorItem> {
    const res = await solicitar(`${this.baseUrl}/admin/catalogos/colores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<ColorItem>(res);
  },
  async inhabilitarColor(id: number): Promise<{ detail: string }> {
    const res = await solicitar(`${this.baseUrl}/admin/catalogos/colores/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'Inactivo' }),
    });
    return handleResponse<{ detail: string }>(res);
  },

  async listarCategorias(): Promise<CategoriaItem[]> {
    const res = await solicitar(`${this.baseUrl}/admin/catalogos/categorias`);
    return handleResponse<CategoriaItem[]>(res);
  },
  async crearCategoria(payload: CrearCategoriaPayload): Promise<CategoriaItem> {
    const res = await solicitar(`${this.baseUrl}/admin/catalogos/categorias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<CategoriaItem>(res);
  },
  async actualizarCategoria(id: number, payload: CrearCategoriaPayload): Promise<CategoriaItem> {
    const res = await solicitar(`${this.baseUrl}/admin/catalogos/categorias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<CategoriaItem>(res);
  },
  async inhabilitarCategoria(id: number): Promise<{ detail: string }> {
    const res = await solicitar(`${this.baseUrl}/admin/catalogos/categorias/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'Inactivo' }),
    });
    return handleResponse<{ detail: string }>(res);
  },

  // CU15 - Temporadas y colecciones
  async listarTemporadas(): Promise<TemporadaItem[]> {
    const res = await solicitar(`${this.baseUrl}/admin/temporadas`);
    return handleResponse<TemporadaItem[]>(res);
  },
  async crearTemporada(payload: CrearTemporadaPayload): Promise<TemporadaItem> {
    const res = await solicitar(`${this.baseUrl}/admin/temporadas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<TemporadaItem>(res);
  },
  async actualizarTemporada(id: number, payload: CrearTemporadaPayload): Promise<TemporadaItem> {
    const res = await solicitar(`${this.baseUrl}/admin/temporadas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<TemporadaItem>(res);
  },
  async inhabilitarTemporada(id: number): Promise<{ detail: string }> {
    const res = await solicitar(`${this.baseUrl}/admin/temporadas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'Inactiva' }),
    });
    return handleResponse<{ detail: string }>(res);
  },

  async listarColecciones(): Promise<ColeccionItem[]> {
    const res = await solicitar(`${this.baseUrl}/admin/colecciones`);
    return handleResponse<ColeccionItem[]>(res);
  },
  async crearColeccion(payload: CrearColeccionPayload): Promise<ColeccionItem> {
    const res = await solicitar(`${this.baseUrl}/admin/colecciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<ColeccionItem>(res);
  },
  async actualizarColeccion(id: number, payload: CrearColeccionPayload): Promise<ColeccionItem> {
    const res = await solicitar(`${this.baseUrl}/admin/colecciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<ColeccionItem>(res);
  },

  // CU16 - Catálogo público con filtros
  async listarCatalogoPublico(filtros: FiltrosCatalogoPublico): Promise<ResultadoCatalogoPublico> {
    const params = new URLSearchParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params.set(clave, String(valor));
      }
    }
    const cadena = params.toString();
    const res = await solicitar(`${this.baseUrl}/catalogo/publico${cadena ? `?${cadena}` : ''}`);
    return handleResponse<ResultadoCatalogoPublico>(res);
  },
  async listarOpcionesCatalogo(): Promise<OpcionesCatalogoPublico> {
    const res = await solicitar(`${this.baseUrl}/catalogo/publico/opciones`);
    return handleResponse<OpcionesCatalogoPublico>(res);
  },

  // CU18 - Proveedores
  async listarProveedores(): Promise<ProveedorItem[]> {
    const res = await solicitar(`${this.baseUrl}/proveedores`);
    return handleResponse<ProveedorItem[]>(res);
  },
  async crearProveedor(payload: CrearProveedorPayload): Promise<{ detail: string; id_proveedor: number }> {
    const res = await solicitar(`${this.baseUrl}/proveedores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ detail: string; id_proveedor: number }>(res);
  },

  // CU19 - Estado de proveedor
  async cambiarEstadoProveedor(id: number, estado: string): Promise<{ detail: string }> {
    const res = await solicitar(`${this.baseUrl}/proveedores/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    return handleResponse<{ detail: string }>(res);
  },

  // CU20 - Recalcular score de proveedor
  async recalcularScoreProveedor(id: number): Promise<RecalcularScoreResultado> {
    const res = await solicitar(`${this.baseUrl}/admin/proveedores/${id}/recalcular_score`, {
      method: 'POST',
    });
    return handleResponse<RecalcularScoreResultado>(res);
  },
}