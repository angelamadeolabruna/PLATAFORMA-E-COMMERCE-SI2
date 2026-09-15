import { type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutRaiz } from '@/components/layout/LayoutRaiz.js';
import { AdminLayout } from '@/components/layout/admin/AdminLayout.js';
import { Home } from '@/pages/Home.js';
import { Catalogo } from '@/pages/Catalogo.js';
import { Producto } from '@/pages/Producto.js';
import { Login } from '@/pages/Login.js';
import { Registro } from '@/pages/Registro.js';
import { RecuperarContrasena } from '@/pages/RecuperarContrasena.js';
import { RestablecerContrasena } from '@/pages/RestablecerContrasena.js';
import { EstablecerContrasena } from '@/pages/EstablecerContrasena.js';
import { Auditoria } from '@/pages/admin/Auditoria.js';
import { Usuarios } from '@/pages/admin/Usuarios.js';
import { Roles } from '@/pages/admin/Roles.js';
import { Sucursales } from '@/pages/admin/Sucursales.js';
import { AdminCatalogoProductos } from '@/pages/admin/AdminCatalogoProductos.js';
import { AdminCatalogos } from '@/pages/admin/AdminCatalogos.js';
import { AdminTemporadas } from '@/pages/admin/AdminTemporadas.js';
import { AdminProveedores } from '@/pages/admin/AdminProveedores.js';
import { AdminOrdenesCompra } from '@/pages/admin/AdminOrdenesCompra.js';
import { AdminKardex } from '@/pages/admin/AdminKardex.js';
import { AdminAjustes } from '@/pages/admin/AdminAjustes.js';
import { AdminAlertas } from '@/pages/admin/AdminAlertas.js';
import { AdminExistencias } from '@/pages/admin/AdminExistencias.js';
import { AdminRespaldos } from '@/pages/admin/AdminRespaldos.js';
import { AdminPlaceholder } from '@/pages/admin/AdminPlaceholder.js';
import { EnConstruccion } from '@/pages/EnConstruccion.js';

function Placeholder({ titulo }: { titulo: string }): ReactNode {
  return <EnConstruccion titulo={titulo} />;
}

export function RouterApp() {
  return (
    <Routes>
      <Route element={<LayoutRaiz />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/productos" element={<Navigate to="/catalogo" replace />} />
        <Route path="/productos/:codigo" element={<Producto />} />
        <Route path="/carrito" element={<Placeholder titulo="Carrito de compras" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-contraseña" element={<RecuperarContrasena />} />
        <Route path="/restablecer-contraseña" element={<RestablecerContrasena />} />
        <Route path="/establecer-contraseña" element={<EstablecerContrasena />} />
        <Route path="*" element={<Placeholder titulo="Página no encontrada" />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/usuarios" replace />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="roles" element={<Roles />} />
        <Route path="sucursales" element={<Sucursales />} />
        <Route path="catalogo/productos" element={<AdminCatalogoProductos />} />
        <Route path="catalogo/listas" element={<AdminCatalogos />} />
        <Route path="temporadas" element={<AdminTemporadas />} />
        <Route path="proveedores" element={<AdminProveedores />} />
        <Route path="ordenes-compra" element={<AdminOrdenesCompra />} />
        <Route path="inventario/kardex" element={<AdminKardex />} />
        <Route path="inventario/ajustes" element={<AdminAjustes />} />
        <Route path="inventario/alertas" element={<AdminAlertas />} />
        <Route path="inventario/existencias" element={<AdminExistencias />} />
        <Route path="inventario/backup" element={<AdminRespaldos />} />
        <Route path="auditoria" element={<Auditoria />} />
        <Route path="*" element={<AdminPlaceholder />} />
      </Route>
    </Routes>
  );
}