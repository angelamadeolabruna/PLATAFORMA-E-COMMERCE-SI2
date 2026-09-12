import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronRight,
  FilterX,
  Loader2,
  PackageX,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import {
  api,
  ApiError,
  type ItemCatalogoPublico,
  type OpcionesCatalogoPublico,
} from '@/lib/api.js';
import { Badge } from '@/components/ui/Badge.js';
import { Button } from '@/components/ui/Button.js';
import { Card } from '@/components/ui/Card.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import { cn } from '@/lib/utils.js';

const LIMITE = 20;

function Precio({ valor }: { valor: number }) {
  return (
    <span className="text-xl font-extrabold text-brand-700">
      Bs. {valor.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}

function TarjetaPrenda({ item }: { item: ItemCatalogoPublico }) {
  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-card-hover">
      <Link
        to={`/productos/${encodeURIComponent(item.codigo)}`}
        className="flex h-44 items-center justify-center overflow-hidden bg-ink-50"
      >
        {item.imagen_principal ? (
          <img
            src={item.imagen_principal}
            alt={item.nombre}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="text-6xl opacity-50">🧥</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="line-clamp-1 text-base font-bold text-ink-900 transition group-hover:text-brand-700">
              {item.nombre}
            </p>
            <p className="mt-0.5 text-xs text-ink-400">{item.codigo}</p>
          </div>
          {item.categoria && <Badge variant="brand">{item.categoria}</Badge>}
        </div>

        <Precio valor={item.precio_con_iva} />

        <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-ink-600">
          {item.tallas.length > 0 && (
            <span className="line-clamp-1">
              <span className="font-semibold text-ink-500">Tallas:</span> {item.tallas.join(', ')}
            </span>
          )}
          {item.colores.length > 0 && (
            <span className="flex items-center gap-1.5">
              {item.colores.slice(0, 4).map((c) => (
                <span key={c} className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full border border-ink-200" />
                  {c}
                </span>
              ))}
              {item.colores.length > 4 && <span>+{item.colores.length - 4}</span>}
            </span>
          )}
        </div>

        <Link to={`/productos/${encodeURIComponent(item.codigo)}`} className="mt-2">
          <Button size="sm" className="w-full">
            Ver detalle <ChevronRight size={15} />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export function Catalogo() {
  const [opciones, setOpciones] = useState<OpcionesCatalogoPublico | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [talla, setTalla] = useState('');
  const [color, setColor] = useState('');
  const [temporada, setTemporada] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');

  const [items, setItems] = useState<ItemCatalogoPublico[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorFiltro, setErrorFiltro] = useState<string | null>(null);

  const paginaCargada = useRef(0);
  const busquedaDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cargarOpciones = useCallback(async () => {
    try {
      const op = await api.listarOpcionesCatalogo();
      setOpciones(op);
    } catch {
      setOpciones(null);
    }
  }, []);

  useEffect(() => {
    void cargarOpciones();
  }, [cargarOpciones]);

  const construirFiltros = useCallback(
    (pagina: number) => ({
      busqueda: busqueda.trim() || undefined,
      categoria: categoria ? Number(categoria) : undefined,
      talla: talla ? Number(talla) : undefined,
      color: color ? Number(color) : undefined,
      temporada: temporada ? Number(temporada) : undefined,
      precio_min: precioMin !== '' ? Number(precioMin) : undefined,
      precio_max: precioMax !== '' ? Number(precioMax) : undefined,
      pagina,
      limite: LIMITE,
    }),
    [busqueda, categoria, talla, color, temporada, precioMin, precioMax],
  );

  const hayErrorRango =
    precioMin !== '' && precioMax !== '' && Number(precioMin) > Number(precioMax);

  const cargar = useCallback(
    async (pagina: number, acumular: boolean) => {
      setCargando(true);
      setErrorFiltro(null);
      if (hayErrorRango) {
        setErrorFiltro('Rango de precio inválido.');
        setItems([]);
        setTotal(0);
        setCargando(false);
        return;
      }
      try {
        const res = await api.listarCatalogoPublico(construirFiltros(pagina));
        setTotal(res.total);
        setItems((prev) => (acumular ? [...prev, ...res.items] : res.items));
        paginaCargada.current = pagina;
      } catch (err) {
        if (err instanceof ApiError && err.status === 422) {
          setErrorFiltro(err.message);
          setItems([]);
          setTotal(0);
        } else {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar las prendas.');
          if (!acumular) {
            setItems([]);
            setTotal(0);
          }
        }
      } finally {
        setCargando(false);
      }
    },
    [construirFiltros, hayErrorRango],
  );

  const recargar = useCallback(() => {
    setError(null);
    paginaCargada.current = 0;
    void cargar(1, false);
  }, [cargar]);

  useEffect(() => {
    if (busquedaDebounce.current) clearTimeout(busquedaDebounce.current);
    busquedaDebounce.current = setTimeout(recargar, 300);
    return () => {
      if (busquedaDebounce.current) clearTimeout(busquedaDebounce.current);
    };
  }, [busqueda, categoria, talla, color, temporada, precioMin, precioMax, recargar]);

  const cargarMas = useCallback(async () => {
    if (cargandoMas) return;
    setCargandoMas(true);
    try {
      const res = await api.listarCatalogoPublico(construirFiltros(paginaCargada.current + 1));
      setTotal(res.total);
      setItems((prev) => [...prev, ...res.items]);
      paginaCargada.current += 1;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar más prendas.');
    } finally {
      setCargandoMas(false);
    }
  }, [cargandoMas, construirFiltros]);

  const limpiarFiltros = useCallback(() => {
    setBusqueda('');
    setCategoria('');
    setTalla('');
    setColor('');
    setTemporada('');
    setPrecioMin('');
    setPrecioMax('');
  }, []);

  const hayFiltrosActivos = useMemo(
    () => !!(busqueda || categoria || talla || color || temporada || precioMin || precioMax),
    [busqueda, categoria, talla, color, temporada, precioMin, precioMax],
  );

  const inputBase =
    'h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';

  const sinResultados = !cargando && !errorFiltro && !error && total === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Catálogo de prendas</h1>
          <p className="text-sm text-ink-500">
            Solo se muestran prendas activas con stock disponible en alguna sucursal.
          </p>
        </div>
        {hayFiltrosActivos && (
          <Button variant="ghost" size="sm" onClick={limpiarFiltros}>
            <FilterX size={15} /> Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-800">
              <SlidersHorizontal size={16} className="text-brand-600" /> Filtros
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-600">Buscar</label>
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" />
                <input
                  className={cn(inputBase, 'pl-9')}
                  placeholder="Ej. camisa roja"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-600">Categoría</label>
              <select className={inputBase} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="">Todas</option>
                {(opciones?.categorias ?? []).map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-600">Talla</label>
              <select className={inputBase} value={talla} onChange={(e) => setTalla(e.target.value)}>
                <option value="">Todas</option>
                {(opciones?.tallas ?? []).map((t) => (
                  <option key={t.id_talla} value={t.id_talla}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-600">Color</label>
              <select className={inputBase} value={color} onChange={(e) => setColor(e.target.value)}>
                <option value="">Todos</option>
                {(opciones?.colores ?? []).map((c) => (
                  <option key={c.id_color} value={c.id_color}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-600">Temporada</label>
              <select className={inputBase} value={temporada} onChange={(e) => setTemporada(e.target.value)}>
                <option value="">Todas</option>
                {(opciones?.temporadas ?? []).map((t) => (
                  <option key={t.id_temporada} value={t.id_temporada}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink-600">Precio mín.</label>
                <input
                  className={inputBase}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={precioMin}
                  onChange={(e) => setPrecioMin(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink-600">Precio máx.</label>
                <input
                  className={inputBase}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Sin límite"
                  value={precioMax}
                  onChange={(e) => setPrecioMax(e.target.value)}
                />
              </div>
            </div>
          </Card>
        </aside>

        <section className="flex flex-col gap-4">
          {errorFiltro && (
            <Card className="border-danger-200 bg-danger-50">
              <div className="flex items-center gap-2.5 p-4 text-sm text-danger-700">
                <AlertTriangle size={16} className="shrink-0" />
                <span className="flex-1">{errorFiltro}</span>
              </div>
            </Card>
          )}

          {error && !errorFiltro && (
            <Card className="border-danger-200 bg-danger-50">
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-100 text-danger-600">
                  <AlertTriangle size={26} />
                </span>
                <div>
                  <p className="font-extrabold text-ink-900">No se pudo cargar el catálogo. Verifique su conexión.</p>
                  <p className="mt-1 text-sm text-ink-500">{error}</p>
                </div>
                <Button onClick={recargar}>
                  <RefreshCw size={16} /> Reintentar
                </Button>
              </div>
            </Card>
          )}

          {cargando && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-44 w-full rounded-none" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {sinResultados && (
            <Card>
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
                  <PackageX size={30} />
                </span>
                <p className="font-extrabold text-ink-900">No se encontraron prendas con los filtros seleccionados.</p>
                <p className="max-w-sm text-sm text-ink-500">
                  Probá quitar algún filtro o cambiar la búsqueda.
                </p>
                {hayFiltrosActivos && (
                  <Button variant="secondary" onClick={limpiarFiltros}>
                    <FilterX size={15} /> Limpiar filtros
                  </Button>
                )}
              </div>
            </Card>
          )}

          {!cargando && !errorFiltro && !error && total > 0 && (
            <>
              <p className="text-sm text-ink-500">
                {total} {total === 1 ? 'producto disponible' : 'productos disponibles'}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <TarjetaPrenda key={item.id_producto} item={item} />
                ))}
              </div>
              {items.length < total && (
                <div className="flex justify-center pt-2">
                  <Button variant="secondary" onClick={() => void cargarMas()} loading={cargandoMas}>
                    {cargandoMas ? 'Cargando…' : 'Cargar más'}
                  </Button>
                </div>
              )}
            </>
          )}

          {cargandoMas && (
            <div className="flex justify-center py-2 text-brand-600">
              <Loader2 size={20} className="animate-spin" />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}