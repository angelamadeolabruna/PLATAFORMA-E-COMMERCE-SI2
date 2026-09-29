import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Package, Search, ShoppingCart, User, X } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import { useAuth } from '@/contexts/AuthContext.js';
import { useCart } from '@/contexts/CartContext.js';
import { PAQUETES_CLIENTE, type ItemMenuCliente } from '@/data/clienteMenu.js';
import { CuentaClienteProvider, useCuentaCliente } from '@/contexts/CuentaClienteContext.js';
import { fecha } from '@/lib/formato.js';
import logoUrl from '@/assets/logo.png';

type UsuarioMenu = { permisos?: unknown[]; nombre?: string | null; email?: string | null; rol?: string | null } | null;

function MenuCuenta({ usuario, logout }: { usuario: UsuarioMenu; logout: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const { pendientes } = useCuentaCliente();

  const permisos = (usuario?.permisos ?? []) as string[];
  const permitido = (item: ItemMenuCliente) =>
    permisos.includes('*') || (item.permiso ? permisos.includes(item.permiso) : true);

  const paquetesVisibles = PAQUETES_CLIENTE.filter((paquete) => paquete.items.some(permitido));

  // El desplegable es un atajo, no el sitio donde vive la informacion. Por
  // eso lo primero que ofrece es "Mi cuenta", que es donde esta todo, y
  // despues los accesos sueltos que mas se usan. Repetir aqui el historial
  // entero de pedidos y reservas duplicaria la pagina sin aportar nada.
  return (
    <div className="relative">
      <button
        type="button"
        className="relative flex items-center gap-2 rounded-xl p-2.5 text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Mi cuenta"
        aria-expanded={abierto}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
          {(usuario?.nombre ?? usuario?.email ?? 'U').charAt(0).toUpperCase()}
        </span>
        <span className="hidden lg:block text-sm font-semibold text-ink-800 truncate max-w-36">
          {usuario?.nombre ?? usuario?.email ?? 'Mi Cuenta'}
        </span>
        {/* Distintivo discreto: avisa sin gritar. La franja ambar de la pagina
            de cuenta es la que reclama atencion si algo ya esta listo. */}
        {pendientes > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-warning-500 px-1 text-[11px] leading-none font-bold text-ink-950">
            {pendientes}
          </span>
        )}
        <ChevronDown size={16} className={cn('text-ink-500 transition-transform', abierto && 'rotate-180')} />
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right animate-in fade-in-0 zoom-in-95">
          <div className="rounded-xl border border-ink-100 bg-white py-1.5 shadow-pop ring-1 ring-ink-100">
            <Link
              to="/mi-cuenta"
              onClick={() => setAbierto(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-ink-50"
            >
              <User size={18} className="text-ink-400" />
              <span className="flex-1">Mi cuenta</span>
              {pendientes > 0 && (
                <span className="rounded-full bg-warning-500 px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none text-ink-950">
                  {pendientes}
                </span>
              )}
            </Link>

            <p className="px-3 pb-1 pt-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-400">
              Ir directo a
            </p>
            <ul className="flex flex-col gap-0.5">
              {paquetesVisibles
                .flatMap((paquete) => paquete.items)
                .filter(permitido)
                .map((item) => (
                  <li key={item.ruta}>
                    <NavLink
                      to={item.ruta}
                      onClick={() => setAbierto(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
                    >
                      <span className="shrink-0">
                        <item.icono size={17} className="text-ink-400" />
                      </span>
                      <span className="flex-1 leading-tight">{item.etiqueta}</span>
                      <span className="rounded-md bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-500">
                        {item.cu}
                      </span>
                    </NavLink>
                  </li>
                ))}
            </ul>

            <hr className="my-1.5 border-ink-100" />
            <div className="px-3 py-1">
              <p className="text-xs text-ink-500 truncate max-w-full">
                {usuario?.nombre ?? usuario?.email}
              </p>
              <p className="text-[11px] text-ink-400 capitalize">{usuario?.rol ?? 'Cliente'}</p>
            </div>
            <button
              onClick={() => void logout()}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Franja ambar bajo la barra. Es la parte que de verdad "se nota", porque
// ocupa el ancho de la pantalla y no se puede pasar por alto.
//
// Cubre las dos situaciones en las que el cliente tiene algo pendiente, y el
// texto cambia segun cual sea:
//
//   1. Hay una prenda ya preparada. Es lo urgente: la tienda la guardo y el
//      cliente tiene que pasar a recogerla. Se dice cuando y donde.
//   2. No hay ninguna, pero si hay reservas solicitadas. Aqui la tienda aun
//      no ha confirmado. Se avisa igualmente, porque una reserva que nadie
//      toca es justo lo que el cliente debe notar.
//
// Va en ambar y no en rojo: el rojo es para errores, y aqui no hay nada
// roto, solo algo que resolver. Es un aviso, no una alarma.
function FranjaReservas() {
  const { listasParaRecoger, esperandoConfirmacion } = useCuentaCliente();

  if (listasParaRecoger.length === 0 && esperandoConfirmacion.length === 0) return null;

  let texto: ReactNode;
  if (listasParaRecoger.length > 0) {
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
          {n === 1
            ? 'Tienes 1 reserva esperando'
            : `Tienes ${n} reservas esperando`}
        </span>{' '}
        que la tienda confirme. Te avisamos en cuanto estén listas.
      </>
    );
  }

  return (
    <div
      className={cn(
        'border-b',
        listasParaRecoger.length > 0
          ? 'border-warning-500/40 bg-warning-50'
          : 'border-ink-200 bg-ink-100',
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2">
        <Package
          size={16}
          className={cn('shrink-0', listasParaRecoger.length > 0 ? 'text-warning-500' : 'text-ink-400')}
        />
        {/* Cuando solo hay reservas por confirmar el texto va en gris, no en
            ambar: es informativo, no algo que exija una accion ya. */}
        <p
          className={cn(
            'flex-1 text-sm',
            listasParaRecoger.length > 0 ? 'text-warning-500' : 'text-ink-600',
          )}
        >
          {texto}
        </p>
        <Link
          to="/mi-cuenta?tab=reservas"
          className={cn(
            'text-sm font-semibold underline underline-offset-2 hover:opacity-80',
            listasParaRecoger.length > 0 ? 'text-warning-500' : 'text-ink-600',
          )}
        >
          Ver detalle
        </Link>
      </div>
    </div>
  );
}

function MenuMovil({ usuario, logout }: { usuario: UsuarioMenu; logout: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const { pendientes } = useCuentaCliente();

  const permisos = (usuario?.permisos ?? []) as string[];
  const permitido = (item: ItemMenuCliente) =>
    permisos.includes('*') || (item.permiso ? permisos.includes(item.permiso) : true);
  const paquetesVisibles = PAQUETES_CLIENTE.filter((paquete) => paquete.items.some(permitido));

  return (
    <div className="lg:hidden">
      <button
        className="relative rounded-xl p-2.5 text-ink-600 hover:bg-ink-50"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Abrir menú de cuenta"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
          {(usuario?.nombre ?? usuario?.email ?? 'U').charAt(0).toUpperCase()}
        </span>
        {pendientes > 0 && (
          <span className="absolute top-1.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-warning-500 px-1 text-[10px] leading-none font-bold text-ink-950">
            {pendientes}
          </span>
        )}
      </button>
      {abierto && (
        <div className="absolute right-0 top-full mt-2 w-64 origin-top-right animate-in fade-in-0 zoom-in-95 lg:static lg:visible lg:w-auto lg:shadow-none lg:bg-transparent lg:ring-0">
          <div className="rounded-xl border border-ink-100 bg-white py-1.5 shadow-pop ring-1 ring-ink-100">
            <Link
              to="/mi-cuenta"
              onClick={() => setAbierto(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-ink-50"
            >
              <User size={18} className="text-ink-400" />
              <span className="flex-1">Mi cuenta</span>
              {pendientes > 0 && (
                <span className="rounded-full bg-warning-500 px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none text-ink-950">
                  {pendientes}
                </span>
              )}
            </Link>
            <p className="px-3 pb-1 pt-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-400">
              Ir directo a
            </p>
            <ul className="flex flex-col gap-0.5">
              {paquetesVisibles
                .flatMap((paquete) => paquete.items)
                .filter(permitido)
                .map((item) => (
                  <li key={item.ruta}>
                    <NavLink
                      to={item.ruta}
                      onClick={() => setAbierto(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
                    >
                      <span className="shrink-0">
                        <item.icono size={17} className="text-ink-400" />
                      </span>
                      <span className="flex-1 leading-tight">{item.etiqueta}</span>
                      <span className="rounded-md bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-500">
                        {item.cu}
                      </span>
                    </NavLink>
                  </li>
                ))}
            </ul>
            <hr className="my-1.5 border-ink-100" />
            <div className="px-3 py-1">
              <p className="text-xs text-ink-500 truncate max-w-full">
                {usuario?.nombre ?? usuario?.email}
              </p>
              <p className="text-[11px] text-ink-400 capitalize">{usuario?.rol ?? 'Cliente'}</p>
            </div>
            <button
              onClick={() => void logout()}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
// El layout envuelve a la pagina con el provider para que el numero del
// distintivo y el contenido de /mi-cuenta vengan de la misma carga y nunca
// se contradigan entre si.
export function ClienteLayout() {
  return (
    <CuentaClienteProvider>
      <ContenidoClienteLayout />
    </CuentaClienteProvider>
  );
}

function ContenidoClienteLayout(): ReactNode {
  const { usuario, logout } = useAuth();
  const { totalCantidad, abrirPanel } = useCart();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [sugerencias, setSugerencias] = useState<string[]>([]);

  const sugerenciasDemo = ['Camisas', 'Pantalones', 'Vestidos', 'Zapatos', 'Abrigos', 'Jeans'];

  function onSubmitBusqueda(e: FormEvent) {
    e.preventDefault();
    const q = busqueda.trim();
    navigate(q ? `/productos?q=${encodeURIComponent(q)}` : '/productos');
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

          <nav className="ml-auto flex items-center gap-1.5">
            {usuario ? (
              <>
                <MenuCuenta usuario={usuario} logout={logout} />
                <MenuMovil usuario={usuario} logout={logout} />
              </>
            ) : (
              <Link
                to="/login"
                className="ml-1 hidden items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 sm:flex"
              >
                <User size={19} />
                Ingresar
              </Link>
            )}

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
