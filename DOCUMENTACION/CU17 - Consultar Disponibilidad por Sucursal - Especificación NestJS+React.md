# CU17 - Consultar Disponibilidad por Sucursal - Especificación NestJS + React

## Tabla del caso de uso

| CASO DE USO | **CU17 - Consultar Disponibilidad por Sucursal (Web Cliente)** |
|---|---|
| PROPÓSITO | Permitir al Cliente/Visitante consultar en qué sucursales y en qué cantidades está disponible una prenda (por talla y color) antes de comprar o reservar. |
| DESCRIPCIÓN | Módulo NestJS `catalogo` nuevo (público, sin JWT). Página pública `GET /productos/:codigo` (ruta `LayoutRaiz`, reemplaza el placeholder, a la espera de CU16). El frontend hace `GET /api/v1/catalogo/publico/:codigo/disponibilidad`; el backend valida producto activo por `codigo` (hace de slug, evita enumeración por IDs) y retorna info base de la prenda + líneas de disponible por sucursal/talla/color con semáforo por umbral (CU25). Sin bitácora (consulta pública, no muta). |
| ACTORES | Cliente, Visitante. |
| ACTOR INICIADOR | Cliente que quiere saber dónde y cuánto stock hay de una prenda. |
| PRECONDICIÓN | Producto `estado='Activo'` con combinaciones `producto_talla_color` y `inventario_stock.cantidad_disponible > 0` en sucursales activas. No requiere autenticación. Se sembró el catálogo demo: `Remera Básica Algodón` (TMU-REM-001). |
| FLUJO PRINCIPAL | 1. Abre `/productos/:codigo`. 2. GET disponibilidad. 3. Backend valida y retorna prenda + sucursales activas con stock > 0. 4. Se renderizan cards por sucursal con combinaciones y semáforo. 5. Selecciona Talla y Color (filtro en vivo). 6. Ve cantidades y decide comprar/reservar. |
| POST CONDICIÓN | El cliente conoce la disponibilidad real por sucursal y puede decidir dónde comprar/reservar (CU28). |
| EXCEPCIONES | E1 sin stock: "Prenda agotada temporalmente." · E2 combinación sin stock: "Sin stock en la talla y color seleccionados." · E3 inexistente/inactivo: 404 "Prenda no encontrada." · E4 error de conexión/500: banner con Reintentar. |

## Adaptaciones al stack real (respecto al spec original)

- No existe columna `slug` → se usa `productos.codigo` como identificador público (no enumerable).
- `inventario_stock` no tiene `id_producto` → se une vía `id_ptc → producto_talla_color.id_ptc`.
- No existen `horario_apertura/cierre` en `sucursales` → se omiten.
- Botones "Agregar al carrito"/"Reservar" son placeholders visuales deshabilitados (Carrito y CU28 aún no implementados).
- Imágenes: no hay S3 → `producto_imagenes.url` apunta a placeholder (picsum) en la seed.

## Backend (NestJS)

- `modulos/catalogo/SRV_CatalogoService.ts` — `consultarDisponibilidad(codigo)`:
  - Valida producto activo por `codigo` (case-insensitive); si no → `NotFoundException('Prenda no encontrada.')` (E3).
  - Consulta tallas y colores del producto (independientes del stock, para alimentar los selects).
  - Consulta líneas: `inventario_stock JOIN producto_talla_color JOIN tallas/colores JOIN sucursales JOIN ciudades` con `cantidad_disponible > 0` y `sucursales.estado='Activa'`.
  - Agrupa por sucursal y añade `stock_bajo: disponible <= stock_minimo_alert` (semáforo, umbral CU25).
  - Retorna `{ producto, tallas, colores, sucursales: [{ ..., lineas: [{ talla, color, codigo_hex, disponible, reservada, stock_bajo }] }] }`.
- `modulos/catalogo/CTR_Catalogo.ts` — `GET catalogo/publico/:codigo/disponibilidad` (sin guard).
- `modulos/catalogo/catalogo.module.ts` + registro en `app.module.ts`.

## Frontend (React + Vite)

- `lib/api.ts` — tipos (`ConsultaDisponibilidad`, `SucursalDisponibilidad`, `LineaDisponibilidad`) y `api.consultarDisponibilidad(codigo)` (público, `renovar: false`).
- `pages/Producto.tsx` — página pública:
  - Header: imagen (fallback 🧥), categoría (badge), nombre, precio `Bs. XX.XX`, descripción, botones placeholder (deshabilitados).
  - Selects de Talla y Color con filtrado en vivo.
  - Cards por sucursal: ciudad (badge), teléfono, líneas con talla/color (swatch hex), semáforo verde ("N disponibles") / ámbar ("Stock bajo: N ud.").
  - Estados: skeleton en carga, E1/E2/E3/E4 según corresponda.
- `router.tsx` — ruta pública `/productos/:codigo`.

## Seed (dato semilla, se conserva como catálogo demo)

- `Remera Básica Algodón` (`TMU-REM-001`, categoria *Remera*, Bs. 89.00) + imagen principal.
- 12 combinaciones: tallas S/M/L/XL × colores Negro/Blanco/Gris (`estado_stock='Disponible'`).
- `inventario_stock` en Sucursal Centro (id 1), `stock_minimo_alert=5`: S(5-12), M(6-15), L(4-7), XL(1-3 → marca "Stock bajo").

## Validación e2e

- `GET /catalogo/publico/tmu-rem-001/disponibilidad` → 200: producto Remera Bs. 89, tallas [S,M,L,XL], colores [Blanco,Gris,Negro], 1 sucursal (Sucursal Centro, La Paz), 12 líneas.
- Mayúsculas en el código → OK (case-insensitive). A través del proxy de Vite (5173) → OK.
- Código inventado → 404 `{"message":"Prenda no encontrada."}`.
- Semáforo: XL (3 combinaciones) todas con `stock_bajo=true`; S/Negro disp=5 con `stock_minimo=5` → `stock_bajo=true`.

## Prueba manual

1. Abrir `http://localhost:5173/productos/tmu-rem-001` (o navegar desde el Home → "Ver catálogo" no enlaza aún, pegar la URL).
2. Comprobar header, precios, selects de talla/color y cards por sucursal.
3. Probar código inexistente (`http://localhost:5173/productos/zzz`) → 404 "Prenda no encontrada."