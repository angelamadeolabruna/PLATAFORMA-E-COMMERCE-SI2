export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  precioAntes: number | null;
  descuento: number | null;
  color: string;
  emoji: string;
  tallas: string[];
  valoracion: number;
  reseñas: number;
  destacado?: boolean;
}

export const productosDemo: Producto[] = [
  {
    id: 1,
    nombre: 'Camisa Oxford Slim Fit',
    categoria: 'Camisas',
    precio: 249,
    precioAntes: 329,
    descuento: 24,
    color: 'Azul cielo',
    emoji: '👔',
    tallas: ['S', 'M', 'L', 'XL'],
    valoracion: 4.8,
    reseñas: 132,
    destacado: true,
  },
  {
    id: 2,
    nombre: 'Jeans Skinny Tiro Medio',
    categoria: 'Pantalones',
    precio: 289,
    precioAntes: null,
    descuento: null,
    color: 'Azul índigo',
    emoji: '👖',
    tallas: ['28', '30', '32', '34'],
    valoracion: 4.6,
    reseñas: 98,
    destacado: true,
  },
  {
    id: 3,
    nombre: 'Vestido Verano Floral',
    categoria: 'Vestidos',
    precio: 329,
    precioAntes: 420,
    descuento: 22,
    color: 'Menta',
    emoji: '👗',
    tallas: ['XS', 'S', 'M', 'L'],
    valoracion: 4.9,
    reseñas: 214,
    destacado: true,
  },
  {
    id: 4,
    nombre: 'Zapatillas Urban Comfort',
    categoria: 'Zapatos',
    precio: 459,
    precioAntes: 549,
    descuento: 16,
    color: 'Blanco',
    emoji: '👟',
    tallas: ['38', '39', '40', '41', '42'],
    valoracion: 4.7,
    reseñas: 176,
    destacado: true,
  },
  {
    id: 5,
    nombre: 'Chaqueta Denim Unisex',
    categoria: 'Abrigos',
    precio: 389,
    precioAntes: null,
    descuento: null,
    color: 'Celeste',
    emoji: '🧥',
    tallas: ['S', 'M', 'L', 'XL'],
    valoracion: 4.5,
    reseñas: 87,
  },
  {
    id: 6,
    nombre: 'Cardigan Lana Suave',
    categoria: 'Abrigos',
    precio: 279,
    precioAntes: 350,
    descuento: 20,
    color: 'Gris perla',
    emoji: '🧶',
    tallas: ['S', 'M', 'L'],
    valoracion: 4.4,
    reseñas: 64,
  },
  {
    id: 7,
    nombre: 'Polo Clásico Piqué',
    categoria: 'Camisas',
    precio: 199,
    precioAntes: null,
    descuento: null,
    color: 'Verde oliva',
    emoji: '👕',
    tallas: ['S', 'M', 'L', 'XL'],
    valoracion: 4.3,
    reseñas: 51,
  },
  {
    id: 8,
    nombre: 'Bolso Tote de Cuero',
    categoria: 'Accesorios',
    precio: 519,
    precioAntes: 650,
    descuento: 20,
    color: 'Cognac',
    emoji: '👜',
    tallas: ['Única'],
    valoracion: 4.9,
    reseñas: 143,
  },
];

export const categoriasDemo = [
  { nombre: 'Hombre', emoji: '👔', color: 'from-brand-500 to-brand-700' },
  { nombre: 'Mujer', emoji: '💃', color: 'from-pink-500 to-rose-600' },
  { nombre: 'Zapatos', emoji: '👟', color: 'from-amber-500 to-orange-600' },
  { nombre: 'Accesorios', emoji: '👜', color: 'from-violet-500 to-purple-700' },
];