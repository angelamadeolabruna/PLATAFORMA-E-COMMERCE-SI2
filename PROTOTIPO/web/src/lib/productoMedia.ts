/**
 * Resolución de imágenes de producto por color.
 * Prioriza lo que viene de la API; si falta, usa assets locales de polera.
 */

export interface ImagenProducto {
  url: string;
  es_principal: boolean;
  color: string | null;
  codigo_hex: string | null;
}

export interface ColorCatalogo {
  nombre: string;
  codigo_hex: string | null;
  imagen_url: string | null;
}

const HEX_FALLBACK: Record<string, string> = {
  negro: '#1a1a1a',
  negra: '#1a1a1a',
  blanco: '#f5f5f5',
  blanca: '#f5f5f5',
  gris: '#8a8a8a',
  rojo: '#c62828',
  azul: '#1565c0',
  verde: '#2e7d32',
  beige: '#d7c4a3',
  rosa: '#e91e8c',
};

const POLERA_POR_COLOR: Record<string, string> = {
  blanco: '/productos/polera/blanca.png',
  blanca: '/productos/polera/blanca.png',
  negro: '/productos/polera/negra.png',
  negra: '/productos/polera/negra.png',
  gris: '/productos/polera/gris.png',
};

function normalizarColor(nombre: string): string {
  return nombre
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function parecePolera(codigo: string, nombre: string): boolean {
  const t = `${codigo} ${nombre}`.toLowerCase();
  return /polera|remera|polo|camiseta|basica|básica/.test(t);
}

export function hexDeColor(nombre: string, codigoHex?: string | null): string {
  if (codigoHex && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(codigoHex)) return codigoHex;
  return HEX_FALLBACK[normalizarColor(nombre)] ?? '#c4c4c4';
}

export function esColorClaro(hex: string): boolean {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return false;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 170;
}

/** Imagen a mostrar según color seleccionado (o principal si no hay color). */
export function resolverImagenProducto(opts: {
  codigo: string;
  nombre: string;
  colorSeleccionado?: string;
  imagenPrincipal?: string | null;
  imagenes?: ImagenProducto[];
}): string | null {
  const { codigo, nombre, colorSeleccionado, imagenPrincipal, imagenes = [] } = opts;

  if (colorSeleccionado) {
    const key = normalizarColor(colorSeleccionado);
    const porColor = imagenes.find(
      (img) => img.color && normalizarColor(img.color) === key,
    );
    if (porColor?.url) return porColor.url;

    if (parecePolera(codigo, nombre) && POLERA_POR_COLOR[key]) {
      return POLERA_POR_COLOR[key];
    }
  }

  const principal = imagenes.find((i) => i.es_principal)?.url ?? imagenPrincipal;
  if (principal) return principal;

  if (parecePolera(codigo, nombre)) {
    return POLERA_POR_COLOR.negro;
  }

  return null;
}

/** Colores del catálogo enriquecidos con hex e imagen cuando falte la API. */
export function enriquecerColoresCatalogo(
  codigo: string,
  nombre: string,
  colores: Array<string | ColorCatalogo>,
): ColorCatalogo[] {
  return colores.map((c) => {
    if (typeof c === 'string') {
      const key = normalizarColor(c);
      return {
        nombre: c,
        codigo_hex: HEX_FALLBACK[key] ?? null,
        imagen_url: parecePolera(codigo, nombre) ? POLERA_POR_COLOR[key] ?? null : null,
      };
    }
    const key = normalizarColor(c.nombre);
    return {
      nombre: c.nombre,
      codigo_hex: c.codigo_hex ?? HEX_FALLBACK[key] ?? null,
      imagen_url:
        c.imagen_url ??
        (parecePolera(codigo, nombre) ? POLERA_POR_COLOR[key] ?? null : null),
    };
  });
}
