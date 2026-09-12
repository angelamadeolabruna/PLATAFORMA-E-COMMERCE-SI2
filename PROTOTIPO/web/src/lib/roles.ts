import type { UsuarioSesion } from './api.js';

const ROLES_PERSONAL = ['Administrador', 'Encargado de Sucursal', 'Cajero'];

export function esPersonal(usuario: UsuarioSesion | null): boolean {
  if (!usuario) return false;
  return ROLES_PERSONAL.includes(usuario.rol ?? '');
}

export function esAdmin(usuario: UsuarioSesion | null): boolean {
  return usuario?.rol === 'Administrador';
}
