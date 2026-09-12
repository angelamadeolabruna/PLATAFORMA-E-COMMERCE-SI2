import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.js';
import { esPersonal } from '@/lib/roles.js';
import { cn } from '@/lib/utils.js';
import logoUrl from '@/assets/logo.png';

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('flex shrink-0 items-center gap-2', className)} aria-label="Tiendas Montaño">
      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl shadow-sm ring-1 ring-white/10">
        <img src={logoUrl} alt="" className="block h-full w-full object-cover" />
      </span>
      <span className="text-lg leading-tight font-extrabold tracking-tight text-ink-900">
        Tiendas<span className="text-brand-600">Montaño</span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [sugerencias, setSugerencias] = useState<string[]>([]);

  const sugerenciasDemo = ['Camisas','Pantalones','Vestidos','Zapatos','Abrigos','Jeans'];

  function onSubmitBusqueda(e: FormEvent) {
    e.preventDefault();
    const q = busqueda.trim();
    navigate(q ? `/productos?q=${encodeURIComponent(q)}` : '/productos');
  }

  function handleSalir() {
    void logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <button
          className="rounded-lg p-2 text-ink-600 hover:bg-ink-50 lg:hidden"
          onClick={() => setMenuAbierto((v) => !v)}
          aria-label="Abrir menú"
        >
          {menuAbierto ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Logo />

        <div className="relative hidden flex-1 max-w-2xl md:block">
          <form onSubmit={onSubmitBusqueda} role="search">
            <div className="relative">
              <input
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setSugerencias(sugerenciasDemo.filter((s) => s.toLowerCase().includes(e.target.value.toLowerCase())));
                }}
                placeholder="Buscar en Tiendas Montaño"
                className="h-11 w-full rounded-full border border-ink-200 bg-ink-50 pl-11 pr-4 text-sm text-ink-900 outline-none transition-all placeholder:text-ink-400 focus:border-brand-500 focus:bg-ink-100 focus:ring-4 focus:ring-brand-500/15"
              />
              <Search className="pointer-events-none absolute inset-y-0 left-4 my-auto text-ink-400" size={18} />
            </div>
          </form>

          {sugerencias.length > 0 && busqueda.trim() && (
            <div className="absolute top-full left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-pop">
              {sugerencias.map((s) => (
                <button
                  key={s}
                  onClick={() => navigate(`/productos?q=${encodeURIComponent(s)}`)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ink-700 hover:bg-ink-50"
                >
                  <Search size={15} className="text-ink-400" /> {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="ml-auto flex items-center gap-1.5">
          {esPersonal(usuario) && (
            <Link
              to="/admin"
              className="mr-1 hidden items-center gap-2 rounded-xl bg-ink-950 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-950/80 sm:flex"
            >
              <LayoutDashboard size={18} />
              Panel
            </Link>
          )}

          <Link
            to="/carrito"
            className="relative rounded-xl p-2.5 text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
            aria-label="Carrito de compras"
          >
            <ShoppingCart size={22} />
            <span className="absolute top-1 right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] leading-none font-bold text-ink-950">
              0
            </span>
          </Link>

          {usuario ? (
            <div className="ml-1 hidden items-center gap-2 sm:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                {(usuario.nombre ?? usuario.email)[0]?.toUpperCase()}
              </span>
              <div className="hidden lg:block">
                <p className="max-w-40 truncate text-sm font-semibold text-ink-800">{usuario.nombre ?? usuario.email}</p>
                <p className="text-xs capitalize text-ink-500">{usuario.rol ?? 'cliente'}</p>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-1 hidden items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 sm:flex"
            >
              <User size={19} />
              Ingresar
            </Link>
          )}

          {usuario && (
            <button
              onClick={handleSalir}
              className="rounded-xl p-2.5 text-ink-500 transition-colors hover:bg-ink-50 hover:text-danger-600 sm:ml-1"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          )}

          <button
            className="rounded-xl p-2.5 text-ink-600 hover:bg-ink-50 lg:hidden"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
          >
            <User size={22} />
          </button>
        </nav>
      </div>

      {menuAbierto && (
        <div className="border-t border-ink-100 bg-white p-4 lg:hidden">
          <form onSubmit={onSubmitBusqueda} className="relative">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar en Tiendas Montaño"
              className="h-11 w-full rounded-full border border-ink-200 bg-ink-50 pl-11 pr-4 text-sm outline-none focus:border-brand-500"
            />
            <Search className="pointer-events-none absolute inset-y-0 left-4 my-auto text-ink-400" size={18} />
          </form>
          {esPersonal(usuario) && (
            <Link
              to="/admin"
              onClick={() => setMenuAbierto(false)}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-ink-950 px-4 py-3 text-sm font-semibold text-white"
            >
              <LayoutDashboard size={18} />
              Panel de administración
            </Link>
          )}
        </div>
      )}
    </header>
  );
}