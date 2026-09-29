// Portada de la tienda.
//
// Antes los destacados salian de productosDemo, que es una lista de datos
// inventados en src/data/productos.ts. Por eso se veian prendas que no
// existen en la tienda, con fotos de Unsplash que solo cargan con internet.
//
// Ahora los destacados se piden al catalogo de verdad, con la misma funcion
// que usa la pagina del catalogo. Asi lo que sale en la portada es lo que
// hay en la tienda, con su foto de verdad y su precio de verdad.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ChevronRight, Package, ScanLine, SlidersHorizontal } from 'lucide-react';
import { api, type ItemCatalogoPublico } from '@/lib/api.js';
import { usarSeo } from '@/lib/seo.js';
import { resolverImagenProducto, hexDeColor } from '@/lib/productoMedia.js';
import { cn } from '@/lib/utils.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';

const CATEGORIAS = [
  { nombre: 'Hombre', emoji: '👔',Classes: '' },
  { nombre: 'Mujer', emoji: '👗', classes: '' },
  { nombre: 'Zapatos', emoji: '👟', classes: '' },
  { nombre: 'Accesorios', emoji: '👜', classes: '' },
];

// Emoji de reserva, por si un producto llega sin foto. El mismo criterio que
// usa el catalogo.
const EMOJI: Array<[RegExp, string]> = [
  [/zapat|calzado|sandal/i, '👟'],
  [/pantalon|chino|jean/i, '👖'],
  [/vestido|falda/i, '👗'],
  [/pijama|batik|buzo|sudadera/i, '🧥'],
  [/campera|abrigo|chaqueta/i, '🧥'],
];

function emojiDe(categoria: string | null | undefined): string {
  if (!categoria) return '👕';
  for (const [patron, e] of EMOJI) if (patron.test(categoria)) return e;
  return '👕';
}

/** Tarjeta de la portada. Es mas simple que la del catalogo a proposito:
 *  en la portada el cliente no compra ahi, navega. */
function Tarjeta({ item }: { item: ItemCatalogoPublico }) {
  const [rota, setRota] = useState(false);
  const foto = useMemo(
    () =>
      resolverImagenProducto({
        codigo: item.codigo,
        nombre: item.nombre,
        imagenPrincipal: item.imagen_principal,
      }),
    [item],
  );

  const precio = Number(item.precio_con_iva ?? item.precio_base ?? 0);
  const colores = (item.colores ?? []) as Array<string | { nombre: string; codigo_hex?: string | null }>;

  return (
    <Link
      to={`/productos/${encodeURIComponent(item.codigo)}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-card-hover"
    >
      <div className="relative flex aspect-4/5 items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-50 via-slate-50 to-neutral-100/70 p-4">
        {foto && !rota ? (
          <img
            key={foto}
            src={foto}
            alt={item.nombre}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
            onError={() => setRota(true)}
          />
        ) : (
          <span className="text-7xl" aria-hidden>
            {emojiDe(item.categoria)}
          </span>
        )}

        {item.categoria && (
          <Badge variant="brand" className="absolute top-3 left-3 shadow-xs">
            {item.categoria}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-1 text-sm font-bold text-ink-900 transition group-hover:text-brand-700">
          {item.nombre}
        </h3>

        {colores.length > 0 && (
          <div className="flex items-center gap-1.5">
            {colores.slice(0, 4).map((c, i) => {
              const nombre = typeof c === 'string' ? c : c.nombre;
              return (
                <span
                  key={`${nombre}-${i}`}
                  title={nombre}
                  style={{ backgroundColor: hexDeColor(nombre, typeof c === 'string' ? null : c.codigo_hex) }}
                  className={cn(
                    'h-3.5 w-3.5 rounded-full ring-1',
                    hexDeColor(nombre, typeof c === 'string' ? null : c.codigo_hex) === '#f5f5f5'
                      ? 'ring-ink-300'
                      : 'ring-black/10',
                  )}
                />
              );
            })}
            {colores.length > 4 && (
              <span className="text-[11px] text-ink-400">+{colores.length - 4}</span>
            )}
          </div>
        )}

        <p className="mt-auto pt-2 text-base leading-none font-extrabold text-brand-700">
          Bs. {new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(precio)}
        </p>
      </div>
    </Link>
  );
}

export function Home() {
  const [items, setItems] = useState<ItemCatalogoPublico[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usarSeo({
    titulo: 'Tiendas Montaño',
    descripcion:
      'Moda boliviana para mujer, hombre y niños. Compra en línea o reserva sin pagar en la sucursal más cercana de Santa Cruz, La Paz, Cochabamba y Sucre.',
  });

  useEffect(() => {
    let vivo = true;
    // Se piden ocho, que es lo que cabe en la rejilla de la portada.
    api
      .listarCatalogoPublico({ limite: 8, pagina: 1 })
      .then((res) => {
        if (!vivo) return;
        setItems((res?.items ?? []).slice(0, 8));
        setError(null);
      })
      .catch((e: unknown) => {
        if (!vivo) return;
        setItems([]);
        setError(e instanceof Error ? e.message : 'No se pudo cargar los destacados.');
      })
      .finally(() => {
        if (vivo) setCargando(false);
      });
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-10 pb-4">
      <section className="relative -mx-4 overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-800 via-ink-950 to-black px-6 py-10 sm:mx-0 sm:px-10 sm:py-14">
        <div className="relative z-10 max-w-xl">
          <Badge variant="accent" className="mb-4 border-accent-300/40 bg-accent-400/15 text-accent-200">
            <SparklesIcon /> Nuevo: Vestidor Virtual
          </Badge>
          <h1 className="text-3xl leading-tight font-extrabold text-white sm:text-4xl">
            Pruébate la ropa antes de comprarla.
          </h1>
          <p className="mt-3 max-w-md text-sm text-brand-100 sm:text-base">
            Descubre el catálogo de temporada y usa nuestro vestidor con realidad aumentada para ver cómo te
            queda cualquier prenda.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/catalogo">
              <Button
                size="lg"
                className="bg-accent-500 text-ink-950 hover:bg-accent-400 active:bg-accent-600"
              >
                <ScanLine size={18} /> Probar en vestidor
              </Button>
            </Link>
            <Link to="/catalogo">
              <Button size="lg" variant="secondary" className="bg-white/15 text-white hover:bg-white/25">
                Ver catálogo
              </Button>
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-10 -bottom-16 select-none text-[16rem] opacity-15">
          🛍️
        </div>
      </section>

      {/* Las tres cosas que la tienda ofrece y que no tiene una tienda
          normal: probar sin pagar, ver donde hay stock y comprar en tienda. */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icono: ScanLine,
            titulo: 'Pruébate con realidad aumentada',
            texto: 'Mírate la prenda con el vestidor virtual antes de decidir.',
            to: '/catalogo',
          },
          {
            icono: Package,
            titulo: 'Stock real por sucursal',
            texto: 'Ves cuántas hay de cada talla en cada tienda, sin adivinar.',
            to: '/catalogo',
          },
          {
            icono: CalendarClock,
            titulo: 'Aparta sin pagar',
            texto: 'Reserva en la tienda y ven a probártela cuando quieras.',
            to: '/catalogo',
          },
        ].map((c) => (
          <Link
            key={c.titulo}
            to={c.to}
            className="flex items-start gap-3 rounded-2xl border border-ink-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <c.icono size={20} />
            </span>
            <div>
              <p className="text-sm font-bold text-ink-900">{c.titulo}</p>
              <p className="mt-0.5 text-xs text-ink-500">{c.texto}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {CATEGORIAS.map((cat) => (
          <Link
            key={cat.nombre}
            to="/catalogo"
            className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-gradient-to-br from-zinc-800 to-ink-950 p-4 text-white shadow-card transition-transform hover:-translate-y-0.5 hover:border-ink-400 hover:shadow-card-hover"
          >
            <span className="text-2xl" aria-hidden>
              {cat.emoji}
            </span>
            <div>
              <p className="text-sm font-bold">Ropa de</p>
              <p className="text-sm">{cat.nombre}</p>
            </div>
            <ChevronRight className="ml-auto" size={18} />
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-ink-900">Destacados de la semana</h2>
            <p className="text-sm text-ink-500">Prendas que hay ahora mismo en la tienda</p>
          </div>
          <Link to="/catalogo" className="flex items-center gap-0.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
            Ver todos <ChevronRight size={16} />
          </Link>
        </div>

        {cargando ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-ink-200 bg-white">
                <div className="aspect-4/5 bg-ink-100" />
                <div className="space-y-2 p-4">
                  <div className="h-3.5 w-3/4 rounded bg-ink-100" />
                  <div className="h-4 w-1/3 rounded bg-ink-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-danger-500/30 bg-danger-50 px-4 py-6 text-center">
            <p className="text-sm font-semibold text-danger-600">No se pudieron cargar los destacados</p>
            <p className="mt-1 text-xs text-danger-600">{error}</p>
            <Link to="/catalogo" className="mt-3 inline-block text-sm font-semibold text-brand-600 underline">
              Ir al catálogo
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-300 bg-ink-50 px-4 py-10 text-center">
            <p className="text-sm text-ink-500">Ahora mismo no hay prendas en el catálogo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <Tarjeta key={item.id_producto} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 p-8 text-center">
        <SlidersHorizontal className="text-brand-600" size={28} />
        <h2 className="text-lg font-bold text-ink-900">¿Buscas algo específico?</h2>
        <p className="max-w-md text-sm text-ink-500">
          Explora el catálogo completo con filtros por categoría, talla, precio y más.
        </p>
        <Link to="/catalogo">
          <Button variant="secondary">Explorar catálogo</Button>
        </Link>
      </section>
    </div>
  );
}

function SparklesIcon() {
  return <span aria-hidden>✨</span>;
}
