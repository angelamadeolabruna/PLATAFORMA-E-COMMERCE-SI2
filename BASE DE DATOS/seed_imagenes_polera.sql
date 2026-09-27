-- Imágenes de polera por color (assets en web/public/productos/polera/)
-- Ejecutar contra la BD del prototipo cuando exista un producto tipo polera/remera.

-- Opcional: asociar imagen a color
ALTER TABLE producto_imagenes
  ADD COLUMN IF NOT EXISTS id_color INTEGER REFERENCES colores(id_color) ON DELETE SET NULL;

-- Inserta/actualiza imágenes para el primer producto activo cuya categoría o nombre
-- sugiera polera/remera/polo. Ajusta el WHERE si usas otro código (ej. TMU-REM-001).

WITH prod AS (
  SELECT p.id_producto
  FROM productos p
  LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
  WHERE LOWER(p.estado) = 'activo'
    AND (
      LOWER(p.nombre) ~ '(polera|remera|polo|camiseta)'
      OR LOWER(COALESCE(c.nombre, '')) ~ '(remera|polo|polera)'
      OR LOWER(p.codigo) LIKE '%rem%'
    )
  ORDER BY p.id_producto
  LIMIT 1
),
cols AS (
  SELECT col.id_color, LOWER(col.nombre) AS nom
  FROM colores col
  WHERE LOWER(col.estado) = 'activo'
)
INSERT INTO producto_imagenes (id_producto, url, es_principal, orden, id_color)
SELECT
  prod.id_producto,
  v.url,
  v.es_principal,
  v.orden,
  cols.id_color
FROM prod
CROSS JOIN (VALUES
  ('/productos/polera/negra.png',  true,  1, 'negro'),
  ('/productos/polera/blanca.png', false, 2, 'blanco'),
  ('/productos/polera/gris.png',   false, 3, 'gris')
) AS v(url, es_principal, orden, color_key)
JOIN cols ON cols.nom = v.color_key
WHERE NOT EXISTS (
  SELECT 1 FROM producto_imagenes pi
  WHERE pi.id_producto = prod.id_producto AND pi.url = v.url
);
