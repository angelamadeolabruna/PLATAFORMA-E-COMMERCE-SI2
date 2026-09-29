import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Package, Search, ShoppingCart, User, X } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import { useAuth } from '@/contexts/AuthContext.js';
import { useCart } from '@/contexts/CartContext.js';
import { CuentaClienteProvider, useCuentaCliente } from '@/contexts/CuentaClienteContext.js';
import { fecha } from '@/lib/formato.js';
import logoUrl from '@/assets/logo.png';

type UsuarioMenu = {
  permisos?: unknown[];
  nombre?: string | null;
  email?: string | null;
  rol?: string | null;
} | null;

/**
 * Acceso a la cuenta del cliente, en la barra superior.
 *
 * Antes era un desplegable: un boton con una flechita que abria una lista.
 * El problema es que el cliente no sabe que hay un menu ahi, y si busca sus
 * reservas no se le ocurre pulsarlo. Un desplegable solo lo encuentra quien ya
 * sabe que existe, que es justo quien no lo necesita.
 *
 * Ahora es un enlace con texto, que es la forma en que la gente busca: si
 * pone el raton encima de algo que pone "Mi cuenta", entiende que ahi estan
 * sus cosas. Sin flechita, porque no hay nada que desplegar.
 *
 * Solo aparece con la sesion iniciada. Para un visitante que no ha entrado no
 * tiene sentido, y por eso su sitio lo ocupa el boton de "Ingresar".
 */
function AccesoCuenta({ usuario }: { usuario: UsuarioMenu }) {
  const { pendientes } = useCuentaCliente();
  const inicial = (usuario?.nombre ?? usuario?.email ?? 'U').charAt(0).toUpperCase();

  return (
    <Link
      to="/mi-cuenta"
      className="relative flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left transition-colors hover:bg-ink-50 sm:px-3"
      aria-label="Mi cuenta"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
        {inicial}
      </span>
      <span className="hidden min-w-0 lg:block">
        {/* El nombre arriba y "Mi cuenta" debajo. Al reves no se entiende que
            el boton lleva a otra pagina. */}
        <span className="block max-w-32 truncate text-sm font-semibold leading-tight text-ink-900">
          {usuario?.nombre ?? usuario?.email ?? 'Mi cuenta'}
        </span>
        <span className="block text-[11px] leading-tight text-ink-400">Mi cuenta</span>
      </span>
      {/* Distintivo discreto con las reservas sin resolver. */}
      {pendientes > 0 && (
        <span className="absolute top-0 right-0 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-warning-500 px-1 text-[11px] leading-none font-bold text-ink-950 sm:right-1">
          {pendientes}
        </span>
      )}
    </Link>
  );
}

/** Boton de ingresar, para el visitante que todavia no tiene sesion. */
function BotonIngresar() {
  return (
    <Link
      to="/login"
      className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
    >
      <User size={19} />
      <span className="hidden sm:inline">Ingresar</span>
    </Link>
  );
}

/**
 * Franja ambar bajo la barra. Solo aparece cuando hay una prenda ya
 * preparada para recoger, que es lo unico que el cliente no puede resolver
 * por su cuenta, o cuando hay reservas que la tienda aun no ha confirmado.
 *
 * Va en ambar y no en rojo: el rojo es para errores, y aqui no hay nada
 * roto, solo algo que resolver. Es un aviso, no una alarma.
 */
function FranjaReservas() {
  const { listasParaRecoger, esperandoConfirmacion } = useCuentaCliente();

  if (listasParaRecoger.length === 0 && esperandoConfirmacion.length === 0) return null;

  let texto: ReactNode;
  let urgente = false;

  if (listasParaRecoger.length > 0) {
    urgente = true;
    const n = listasParaRecoger.length;
    const primera = listasParaRecoger[0];
    texto = (
      <>
        <span className="font-semibold">
          {n === 1 ? 'Tienes 1 prenda lista' : `Tienes ${n} prendas listas`} para recoger
        </span>{' '}
        {n === 1
          ? `en ${primera.sucursal}, ${fecha(primera.fecha_reserva)} a las ${primera.hora_reserva?.slice(0, 5)}.`
          : 'en distintas sucursales.'}
      </>
    );
  } else {
    const n = esperandoConfirmacion.length;
    texto = (
      <>
        <span className="font-semibold">
          {n === 1 ? 'Tienes 1 reserva esperando' : `Tienes ${n} reservas esperando`}
        </span>{' '}
        que la tienda confirme. Te avisamos en cuanto estén listas.
      </>
    );
  }

  return (
    <div
      className={cn(
        'border-b',
        urgente ? 'border-warning-500/40 bg-warning-50' : 'border-ink-200 bg-ink-100',
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2">
        <Package
          size={16}
          className={cn('shrink-0', urgente ? 'text-warning-500' : 'text-ink-400')}
        />
        <p
          className={cn(
            'flex-1 text-sm',
            urgente ? 'text-warning-500' : 'text-ink-600',
          )}
        >
          {texto}
        </p>
        <Link
          to="/mi-cuenta?tab=reservas"
          className={cn(
            'text-sm font-semibold underline underline-offset-2 hover:opacity-80',
            urgente ? 'text-warning-500' : 'text-ink-600',
          )}
        >
          Ver detalle
        </Link>
      </div>
    </div>
  );
}

export function ClienteLayout() {
  return (
    <CuentaClienteProvider>
      <ContenidoClienteLayout />
    </CuentaClienteProvider>
  );
}

function ContenidoClienteLayout(): ReactNode {
  const { token, usuario, logout } = useAuth();
  const { totalCantidad, abrirPanel } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [busqueda, setBusqueda] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [sugerencias, setSugerencias] = useState<string[]>([]);

  const sugerenciasDemo = ['Camisas', 'Pantalones', 'Vestidos', 'Zapatos', 'Abrigos', 'Jeans'];

  function onSubmitBusqueda(e: FormEvent) {
    e.preventDefault();
    const q = busqueda.trim();
    navigate(q ? `/productos?q=${encodeURIComponent(q)}` : '/productos');
  }

  /* Si no hay sesion y se pide la cuenta, se manda al login y se apunta donde
     queria ir, para que al entrar caiga ahi. Sin esto, escribir /mi-cuenta en
     la barra de direcciones mostraba una pagina vacia de una cuenta que no
     existe. */
  const esCuenta = location.pathname === '/mi-cuenta';
  if (!token && esCuenta) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return (
    <div className="min-h-screen bg-ink-50/40">
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <button
            className="rounded-lg p-2 text-ink-600 hover:bg-ink-50 lg:hidden"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-label="Abrir menú"
          >
            {menuAbierto ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Tiendas Montaño">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl shadow-sm ring-1 ring-white/10">
              <img src={logoUrl} alt="" className="block h-full w-full object-cover" />
            </span>
            <span className="text-lg leading-tight font-extrabold tracking-tight text-ink-900">
              Tiendas<span className="text-brand-600">Montaño</span>
            </span>
          </Link>

          <div className="relative hidden flex-1 max-w-2xl md:block">
            <form onSubmit={onSubmitBusqueda} role="search">
              <div className="relative">
                <input
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setSugerencias(
                      sugerenciasDemo.filter((s) => s.toLowerCase().includes(e.target.value.toLowerCase())),
                    );
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

          {/* Aqui esta toda la diferencia con la version anterior: con sesion
              aparece el acceso a la cuenta, y sin sesion el de ingresar. Uno
              u otro, nunca los dos. */}
          <nav className="ml-auto flex items-center gap-1">
            {usuario ? <AccesoCuenta usuario={usuario} /> : <BotonIngresar />}

            <button
              type="button"
              onClick={() => {
                if (!usuario) {
                  navigate('/login');
                  return;
                }
                abrirPanel();
              }}
              className="relative rounded-xl p-2.5 text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
              aria-label="Carrito de compras"
            >
              <ShoppingCart size={22} />
              {totalCantidad > 0 && (
                <span className="absolute top-1 right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] leading-none font-bold text-ink-950">
                  {totalCantidad}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Cerrar sesion baja a la barra, porque es una accion poco frecuente
            y no debe competir con la compra. */}
        {usuario && (
          <div className="border-t border-ink-100 bg-ink-50/60">
            <div className="mx-auto flex max-w-7xl items-center justify-end gap-2 px-4 py-1.5">
              <span className="text-[11px] text-ink-400">
                Sesión de {usuario.nombre ?? usuario.email}
              </span>
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold text-ink-500 transition hover:bg-ink-100 hover:text-danger-600"
              >
                <LogOut size={12} /> Cerrar sesión
              </button>
            </div>
          </div>
        )}

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
          </div>
        )}
      </header>

      {/* Va fuera de la barra para que se lea como un aviso y no como otro
          elemento del menu. Solo sale si hay alguna reserva sin resolver. */}
      <FranjaReservas />

      <main className="px-4 py-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
