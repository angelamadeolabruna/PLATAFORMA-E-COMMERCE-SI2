/**
 * Resolución de imágenes de producto por color.
 * Prioriza lo que viene de la API; si falta, usa assets locales de la prenda.
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
  roja: '#c62828',
  azul: '#1565c0',
  verde: '#2e7d32',
  beige: '#d7c4a3',
  rosa: '#e91e8c',
};

// Un camino por cada tipo de prenda y color. Antes solo existia el de
// polera, porque era el unico producto que tenia los ficheros. Ahora hay uno
// por cada prenda del catalogo, y son los mismos ficheros que se.subieron
// a public/productos, que es lo que la base de datos guarda en la columna
// producto_imagenes.url.
const PRENDA_POR_COLOR: Record<string, Record<string, string>> = {
  remera: {
    blanco: '/productos/remera/blanco.svg',
    negra: '/productos/remera/negro.svg',
    negro: '/productos/remera/negro.svg',
    gris: '/productos/remera/gris.svg',
  },
  // La polera es el mismo dibujo que la remera. Se deja el nombre viejo
  // porque hay codigos y consultas que lo siguen usando.
  polera: {
    blanco: '/productos/remera/blanco.svg',
    blanca: '/productos/remera/blanco.svg',
    negro: '/productos/remera/negro.svg',
    negra: '/productos/remera/negro.svg',
    gris: '/productos/remera/gris.svg',
  },
  polo: {
    rojo: '/productos/polo/rojo.svg',
    roja: '/productos/polo/rojo.svg',
    azul: '/productos/polo/azul.svg',
  },
  pantalon: {
    azul: '/productos/pantalon/azul.svg',
    beige: '/productos/pantalon/beige.svg',
  },
  campera: {
    negro: '/productos/campera/negro.svg',
    negra: '/productos/campera/negro.svg',
    gris: '/productos/campera/gris.svg',
  },
  pijama: {
    rosa: '/productos/pijama/rosa.svg',
    verde: '/productos/pijama/verde.svg',
  },
  vestido: {
    blanco: '/productos/vestido/blanco.svg',
    blanca: '/productos/vestido/blanco.svg',
    rosa: '/productos/vestido/rosa.svg',
  },
  zapatilla: {
    blanco: '/productos/zapatilla/blanco.svg',
    negra: '/productos/zapatilla/negro.svg',
    negro: '/productos/zapatilla/negro.svg',
  },
};

// Cuando solo hay un color, ese color es el que se dibuja. Sirve para que
// un Producto cuya imagen principal no viene de la base de datos, como los
// del pack de demostracion, no se quede sin foto.
const COLOR_UNICO: Record<string, string> = {
  remera: 'negro',
  polera: 'negro',
  polo: 'azul',
  pantalon: 'azul',
  campera: 'negro',
  pijama: 'rosa',
  vestido: 'rosa',
  zapatilla: 'negro',
};

function normalizarColor(nombre: string): string {
  return nombre
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

// Deuelve el nombre de la prenda que le toca a un producto, o null si no
// hay ninguna ilustracion local para el. Se decide por el codigo y el
// nombre, que es lo unico que hay antes de pedir imagenes a la base.
function tipoDePrenda(codigo: string, nombre: string): string | null {
  const t = `${codigo} ${nombre}`.toLowerCase();
  if (/zapat|calzado|sandal|tenis/.test(t)) return 'zapatilla';
  if (/pijama|batik/.test(t)) return 'pijama';
  if (/pantalon|chino|jean|pantal/.test(t)) return 'pantalon';
  if (/vestido|falda/.test(t)) return 'vestido';
  if (/campera|abrigo|chaqueta|coat/.test(t)) return 'campera';
  if (/polo\b|polera|remera|camiseta|camisa|blusa|t-shirt/.test(t)) return 'remera';
  return null;
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
  const tipo = tipoDePrenda(codigo, nombre);
  const porTipo = tipo ? PRENDA_POR_COLOR[tipo] : undefined;

  if (colorSeleccionado) {
    const key = normalizarColor(colorSeleccionado);
    const porColor = imagenes.find(
      (img) => img.color && normalizarColor(img.color) === key,
    );
    if (porColor?.url) return porColor.url;

    if (porTipo?.[key]) {
      return porTipo[key];
    }
  }

  const principal = imagenes.find((i) => i.es_principal)?.url ?? imagenPrincipal;
  if (principal) return principal;

  // Sin imagen principal de la base de datos, se usa la del color que se le
  // pone por defecto a esa prenda.
  if (tipo) {
    const unico = COLOR_UNICO[tipo];
    const dibujada = unico ? PRENDA_POR_COLOR[tipo]?.[unico] : undefined;
    if (dibujada) return dibujada;
  }

  return null;
}

/** Colores del catálogo enriquecidos con hex e imagen cuando falte la API. */
export function enriquecerColoresCatalogo(
  codigo: string,
  nombre: string,
  colores: Array<string | ColorCatalogo>,
): ColorCatalogo[] {
  const tipo = tipoDePrenda(codigo, nombre);
  const porTipo = tipo ? PRENDA_POR_COLOR[tipo] : undefined;

  return colores.map((c) => {
    if (typeof c === 'string') {
      const key = normalizarColor(c);
      return {
        nombre: c,
        codigo_hex: HEX_FALLBACK[key] ?? null,
        imagen_url: porTipo?.[key] ?? null,
      };
    }
    const key = normalizarColor(c.nombre);
    return {
      nombre: c.nombre,
      codigo_hex: c.codigo_hex ?? HEX_FALLBACK[key] ?? null,
      imagen_url: c.imagen_url ?? porTipo?.[key] ?? null,
    };
  });
}
