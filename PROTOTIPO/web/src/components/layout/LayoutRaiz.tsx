import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { Footer } from './Footer.js';
import { CartPanel } from '@/components/carrito/CartPanel.js';

export function LayoutRaiz() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4">
        <Outlet />
      </main>
      <Footer />
      <CartPanel />
    </div>
  );
}