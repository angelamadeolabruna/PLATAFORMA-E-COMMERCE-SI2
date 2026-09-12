import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  MapPin,
  PackageX,
  Phone,
  RefreshCw,
  ShoppingCart,
  Store,
} from 'lucide-react';
import { api, ApiError, type ConsultaDisponibilidad } from '@/lib/api.js';
import { Button } from '@/components/ui/Button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { Badge } from '@/components/ui/Badge.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import { cn } from '@/lib/utils.js';

function Precio({ valor }: { valor: number }) {
  return (
    <span className="text-2xl font-extrabold text-brand-700">
      Bs. {valor.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}

export function Producto() {
  const { codigo } = useParams<{ codigo: string }>();

  const [datos, setDatos] = useState<ConsultaDisponibilidad | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [es404, setEs404] = useState(false);
  const [tallaSel, setTallaSel] = useState('');
  const [colorSel, setColorSel] = useState('');
  const [imgFallback, setImgFallback] = useState(false);

  const cargar = useCallback(async () => {
    if (!codigo) return;
    setCargando(true);
    setError(null);
    setEs404(false);
    try {
      const datos = await api.consultarDisponibilidad(codigo);
      setDatos(datos);
    } catch (err) {
      setEs404(err instanceof ApiError && err.status === 404);
      setError(err instanceof Error ? err.message : 'No pudimos cargar la disponibilidad.');
    } finally {
      setCargando(false);
    }
  }, [codigo]);

  useEffect(() => {
    setDatos(null);
    setImgFallback(false);
    setTallaSel('');
    setColorSel('');
    void cargar();
  }, [cargar]);

  const sucursalesVisibles = useMemo(() => {
    if (!datos) return [];
    const visibles = datos.sucursales
      .map((s) => ({
        ...s,
        lineas: s.lineas.filter(
          (l) => (!tallaSel || l.talla === tallaSel) && (!colorSel || l.color === colorSel),
        ),
      }))
      .filter((s) => s.lineas.length > 0);
    return visibles;
  }, [datos, tallaSel, colorSel]);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            {es404 ? (
              <>
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-100 text-ink-500">
                  <PackageX size={30} />
                </span>
                <div>
                  <h1 className="text-xl font-extrabold text-ink-900">Prenda no encontrada</h1>
                  <p className="mt-1 text-sm text-ink-500">{error}</p>
                </div>
              </>
            ) : (
              <>
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-50 text-danger-600">
                  <AlertTriangle size={30} />
                </span>
                <div>
                  <h1 className="text-xl font-extrabold text-ink-900">No pudimos cargar la disponibilidad</h1>
                  <p className="mt-1 text-sm text-ink-500">Verifica tu conexión e intenta de nuevo.</p>
                </div>
                <Button onClick={() => void cargar()}>
                  <RefreshCw size={16} /> Reintentar
                </Button>
              </>
            )}
            <Link to="/catalogo" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              <ArrowLeft size={15} className="mr-1 inline" /> Volver al catálogo
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-4 text-sm text-ink-500">
        <Link to="/" className="font-semibold text-brand-600 hover:text-brand-700">
          Inicio
        </Link>{' '}
        <span className="mx-1">/</span>
        <Link to="/catalogo" className="font-semibold text-brand-600 hover:text-brand-700">
          Catálogo
        </Link>
      </nav>

      <Card className="mb-6 overflow-hidden">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row">
          <div className="flex h-56 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-ink-50 sm:w-56">
            {datos?.producto.imagen_principal && !imgFallback ? (
              <img
                src={datos.producto.imagen_principal}
                alt={datos.producto.nombre}
                className="h-full w-full object-cover"
                onError={() => setImgFallback(true)}
              />
            ) : (
              <span className="text-7xl opacity-60">🧥</span>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-3">
            {cargando ? (
              <>
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : (
              datos && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    {datos.producto.categoria && <Badge variant="brand">{datos.producto.categoria}</Badge>}
                    <span className="text-xs text-ink-400">Código: {datos.producto.codigo}</span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-ink-900">{datos.producto.nombre}</h1>
                  <Precio valor={datos.producto.precio} />
                  <p className="text-sm text-ink-600">{datos.producto.descripcion}</p>

                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    <Button variant="secondary" disabled title="Carrito disponible en próximos módulos">
                      <ShoppingCart size={16} /> Agregar al carrito
                    </Button>
                    <Button disabled title="Reservas disponibles en próximos módulos">
                      <CalendarClock size={16} /> Reservar
                    </Button>
                  </div>
                </>
              )
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Disponibilidad por sucursal</CardTitle>
          <CardDescription>Selecciona talla y color para ver stock real en tienda.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-700">Talla</label>
            <select
              className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              value={tallaSel}
              onChange={(e) => setTallaSel(e.target.value)}
            >
              <option value="">Todas las tallas</option>
              {(datos?.tallas ?? []).map((t) => (
                <option key={t.nombre} value={t.nombre}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-700">Color</label>
            <select
              className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              value={colorSel}
              onChange={(e) => setColorSel(e.target.value)}
            >
              <option value="">Todos los colores</option>
              {(datos?.colores ?? []).map((c) => (
                <option key={c.nombre} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        {cargando && (
          <Card>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        )}

        {!cargando && datos && datos.sucursales.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-50 text-amber-600">
                <PackageX size={26} />
              </span>
              <p className="font-semibold text-ink-800">Prenda agotada temporalmente.</p>
              <p className="text-sm text-ink-500">Prueba más adelante o consulta otras prendas del catálogo.</p>
            </CardContent>
          </Card>
        )}

        {!cargando && datos && datos.sucursales.length > 0 && sucursalesVisibles.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-50 text-amber-600">
                <PackageX size={26} />
              </span>
              <p className="font-semibold text-ink-800">Sin stock en la talla y color seleccionados.</p>
              <p className="text-sm text-ink-500">Prueba otra combinación de talla o color.</p>
            </CardContent>
          </Card>
        )}

        {!cargando &&
          datos &&
          sucursalesVisibles.map((s) => (
            <Card key={s.id_sucursal}>
              <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Store size={20} />
                  </span>
                  <div>
                    <CardTitle>{s.nombre}</CardTitle>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} /> {s.ciudad}
                      </span>
                      {s.telefono && (
                        <span className="flex items-center gap-1">
                          <Phone size={13} /> {s.telefono}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant="neutral">{s.lineas.length} combinación(es)</Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-2 sm:grid-cols-2">
                  {s.lineas.map((l) => (
                    <div
                      key={`${l.talla}-${l.color}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-ink-100 bg-ink-50/40 px-3.5 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral">{l.talla}</Badge>
                        <span className="flex items-center gap-1.5 text-sm text-ink-700">
                          <span
                            className={cn('h-3 w-3 rounded-full border border-ink-200')}
                            style={{ backgroundColor: l.codigo_hex ?? '#ccc' }}
                          />
                          {l.color}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                          l.stock_bajo
                            ? 'bg-warning-50 text-amber-700'
                            : 'bg-success-50 text-success-700',
                        )}
                      >
                        {l.stock_bajo ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
                        {l.stock_bajo ? `Stock bajo: ${l.disponible} ud.` : `${l.disponible} disponibles`}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </section>
    </div>
  );
}