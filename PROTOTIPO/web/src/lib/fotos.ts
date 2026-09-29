// Fotos de los productos. El usuario las descarga y las deja en
// public/productos, y aqui se declara cuales hay.
//
// Por que una tabla y no buscar en el disco: la carpeta public no se copia
// al backend, asi que el servidor no puede saber que ficheros hay. Y en el
// navegador no se puede leer una carpeta. La unica forma fiable de saberlo
// es que alguien lo escriba, y que ese alguien sea este fichero, que se lee
// de un vistazo.
//
// La tabla se amplia anadiendo una linea. No hay que tocar nada mas: ni la
// base de datos, ni las rutas, ni los componentes.
//
// ---------------------------------------------------------------------
// QUE HAY AHORA MISMO
// ---------------------------------------------------------------------
//
// En public/productos hay 15 ficheros SVG dibujados a mano. Se ven bien
// como maqueta, pero no sirven para una presentacion de una tienda de ropa:
// son dibujos y se nota.
//
// Cuando se descarguen fotos reales, se ponen en FOTOS_REALES. Cada linea
// es una foto, con el nombre de la prenda y el color en minusculas, que es
// como se guardan:
//
//   { prenda: 'campera', color: 'negro', fichero: 'campera-negro.jpg' },
//   { prenda: 'pantalon', color: 'azul', fichero: 'pantalon-azul.jpg' },
//
// La primera linea de cada prenda es la que sale en la tarjeta del catalogo.
// Se aceptan jpg, jpeg, webp, png y avif.
//
// Si solo hay una foto por prenda, se declara solo la del primer color. Los
// demas colores salen con esa misma imagen, que es mejor que sin foto.
//
// Los dibujos de abajo dejan de usarse en cuanto hay una foto real de esa
// prenda, y se pueden borrar sin mas consecuencias.

/** Una foto: el nombre del fichero, sin carpeta. */
export interface FotoProducto {
  /** Prenda, que es el prefijo del nombre del fichero. */
  prenda: string;
  /** Color, en minusculas y sin tilde. */
  color: string;
  /** Nombre del fichero, con extension. */
  fichero: string;
}

// ---------------------------------------------------------------------
// FOTOS REALES. Rellena este bloque cuando tengas las descargas.
// ---------------------------------------------------------------------
//
// Cada linea es una foto, con el nombre de la prenda y el color en
// minusculas, que es como se guardan en public/productos:
//
//   { prenda: 'campera', color: 'negro', fichero: 'campera-negro.jpg' },
//   { prenda: 'pantalon', color: 'azul', fichero: 'pantalon-azul.jpg' },
//   { prenda: 'remera', color: 'negro', fichero: 'remera-negro.jpg' },
//
// La extension puede ser jpg, jpeg, webp, png o avif. La primera linea de
// cada prenda es la que sale en la tarjeta del catalogo.
//
// Si solo tienes una foto por prenda, pon solo la del primer color. Los
// demas colores saldrán con esa misma imagen, que es mejor que sin foto.
//
// La pagina /comprobar-fotos dice cuantas faltan y cuales son.
const FOTOS_REALES: FotoProducto[] = [];

// ---------------------------------------------------------------------
// DIBUJOS DE APOYO, mientras no haya foto real de cada prenda.
// ---------------------------------------------------------------------
const DIBUJOS: FotoProducto[] = [
  { prenda: 'remera', color: 'negro', fichero: 'remera/negro.svg' },
  { prenda: 'remera', color: 'blanco', fichero: 'remera/blanco.svg' },
  { prenda: 'remera', color: 'gris', fichero: 'remera/gris.svg' },

  { prenda: 'polo', color: 'rojo', fichero: 'polo/rojo.svg' },
  { prenda: 'polo', color: 'azul', fichero: 'polo/azul.svg' },

  { prenda: 'campera', color: 'negro', fichero: 'campera/negro.svg' },
  { prenda: 'campera', color: 'gris', fichero: 'campera/gris.svg' },

  { prenda: 'pantalon', color: 'azul', fichero: 'pantalon/azul.svg' },
  { prenda: 'pantalon', color: 'beige', fichero: 'pantalon/beige.svg' },

  { prenda: 'pijama', color: 'rosa', fichero: 'pijama/rosa.svg' },
  { prenda: 'pijama', color: 'verde', fichero: 'pijama/verde.svg' },

  { prenda: 'vestido', color: 'rosa', fichero: 'vestido/rosa.svg' },
  { prenda: 'vestido', color: 'blanco', fichero: 'vestido/blanco.svg' },

  { prenda: 'zapatilla', color: 'negro', fichero: 'zapatilla/negro.svg' },
  { prenda: 'zapatilla', color: 'blanco', fichero: 'zapatilla/blanco.svg' },
];

// La foto real se busca antes que el dibujo, asi que gana siempre.
const TODAS: FotoProducto[] = [...FOTOS_REALES, ...DIBUJOS];

/**
 * Ruta publica de la foto de una prenda en un color, o null si no hay.
 * El resultado ya lleva la barra inicial, que es lo que espera el atributo
 * src de la imagen.
 */
export function rutaFoto(prenda: string, color?: string | null): string | null {
  const p = prenda.trim().toLowerCase();
  const c = (color ?? '').trim().toLowerCase();

  if (c) {
    const exacta = TODAS.find((f) => f.prenda === p && f.color === c);
    if (exacta) return `/productos/${exacta.fichero}`;

    // Si el color no coincide, se usa cualquier foto de esa prenda. Por si
    // la foto se guardo con un color distinto al de la base de datos.
    const deLaPrenda = TODAS.find((f) => f.prenda === p);
    if (deLaPrenda) return `/productos/${deLaPrenda.fichero}`;
  }

  // Sin color: la primera foto de la prenda, que es la principal.
  const principal = TODAS.find((f) => f.prenda === p);
  return principal ? `/productos/${principal.fichero}` : null;
}

/** Que prendas tienen foto declarada ahora mismo. */
export function prendasConFoto(): string[] {
  return [...new Set(TODAS.map((f) => f.prenda))];
}

/** Cuantas fotos hay declaradas. */
export function totalFotos(): number {
  return TODAS.length;
}

/**
 * De donde sale la foto de una prenda. Sirve para que la pagina de
 * comprobacion diga la verdad: una cosa es tener una foto descargada por el
 * usuario y otra estar viendo un dibujo de apoyo.
 *
 *   'foto'    la descarga real
 *   'dibujo'  el SVG de apoyo, que hay que cambiar cuanto antes
 *   'ninguna' no hay nada
 */
export function origenFoto(prenda: string, color?: string | null): 'foto' | 'dibujo' | 'ninguna' {
  const p = prenda.trim().toLowerCase();
  const c = (color ?? '').trim().toLowerCase();

  const enReales = FOTOS_REALES.filter((f) => f.prenda === p && (!c || f.color === c));
  if (enReales.length > 0) return 'foto';
  // Con un color que no esta declarado, se cae a la primera foto de esa
  // prenda, igual que hace rutaFoto.
  if (c && FOTOS_REALES.some((f) => f.prenda === p)) return 'foto';

  if (DIBUJOS.some((f) => f.prenda === p)) return 'dibujo';
  return 'ninguna';
}
