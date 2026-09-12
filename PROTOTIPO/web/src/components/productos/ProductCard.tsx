import { ShoppingCart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge.js';
import { cn, formatPrecio } from '@/lib/utils.js';
import type { Producto } from '@/data/productos.js';

interface Props {
  producto: Producto;
  onAgregar?: (producto: Producto) => void;
}

export function ProductCard({ producto, onAgregar }: Props) {
  const conDescuento = producto.descuento !== null && producto.descuento !== undefined;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-ink-200 hover:shadow-card-hover">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-ink-50 to-ink-100">
        <span className="text-7xl transition-transform duration-300 group-hover:scale-110" aria-hidden>
          {producto.emoji}
        </span>

        {conDescuento && (
          <Badge variant="accent" className="absolute top-3 left-3">
            -{producto.descuento}%
          </Badge>
        )}

        <button
          onClick={() => onAgregar?.(producto)}
          className="absolute inset-x-4 bottom-4 flex translate-y-3 items-center justify-center gap-2 rounded-xl bg-ink-950/90 py-2.5 text-sm font-semibold text-white opacity-0 backdrop-blur transition-all duration-200 hover:bg-ink-950/60 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ShoppingCart size={16} /> Agregar
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-medium text-ink-400">{producto.categoria}</p>
        <h3 className="line-clamp-1 text-sm font-semibold text-ink-800 group-hover:text-brand-700">{producto.nombre}</h3>
        <p className="text-xs text-ink-400">{producto.color}</p>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            {producto.precioAntes && (
              <p className={cn('text-xs text-ink-400 line-through')}>{formatPrecio(producto.precioAntes)}</p>
            )}
            <p className="text-lg leading-none font-extrabold text-ink-900">{formatPrecio(producto.precio)}</p>
          </div>
          <span className="flex items-center gap-1 rounded-md bg-success-50 px-1.5 py-1 text-xs font-bold text-success-700">
            <Star size={12} className="fill-current" />
            {producto.valoracion.toFixed(1)}
          </span>
        </div>
      </div>
    </article>
  );
}