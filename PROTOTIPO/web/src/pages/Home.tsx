import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { productosDemo, categoriasDemo } from '@/data/productos.js';
import { usarSeo } from '@/lib/seo.js';
import { ProductCard } from '@/components/productos/ProductCard.js';
import { Badge } from '@/components/ui/Badge.js';
import { Button } from '@/components/ui/Button.js';

export function Home() {
  const [productosAgregados, setProductosAgregados] = useState(0);
  const destacados = productosDemo.filter((p) => p.destacado);

  usarSeo({
    titulo: 'Tiendas Montaño',
    descripcion:
      'Moda boliviana para mujer, hombre y niños. Compra en línea o reserva sin pagar en la sucursal más cercana de Santa Cruz, La Paz, Cochabamba y Sucre.',
  });

  return (
    <div className="flex flex-col gap-10 pb-4">
      <section className="relative -mx-4 overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-800 via-ink-950 to-black px-6 py-10 sm:-mx-0 sm:px-10 sm:py-14">
        <div className="relative z-10 max-w-xl">
          <Badge variant="accent" className="mb-4 border-accent-300/40 bg-accent-400/15 text-accent-200">
            ✨ Nuevo: Vestidor Virtual
          </Badge>
          <h1 className="text-3xl leading-tight font-extrabold text-white sm:text-4xl">
            Pruébate la ropa antes de comprarla.
          </h1>
          <p className="mt-3 max-w-md text-sm text-brand-100 sm:text-base">
            Descubre el catálogo de temporada y usa nuestro vestidor con realidad aumentada para ver cómo te
            queda cualquier prenda.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-accent-500 text-ink-950 hover:bg-accent-400 active:bg-accent-600"
              onClick={() => setProductosAgregados((n) => n + productosAgregados)}
            >
              <ScanLine size={18} /> Probar en vestidor
            </Button>
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

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {categoriasDemo.map((cat) => (
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
          <h2 className="text-xl font-extrabold text-ink-900">Destacados de la semana</h2>
          <Link to="/catalogo" className="flex items-center gap-0.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
            Ver todos <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {destacados.map((p) => (
            <ProductCard key={p.id} producto={p} onAgregar={() => setProductosAgregados((n) => n + 1)} />
          ))}
        </div>
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