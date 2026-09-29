// Corrige las imagenes de los productos en la base de datos.
//
// Que estaba mal, verificado con una consulta a la tabla producto_imagenes:
//
//   - Doce filas apuntan a ficheros .png que no existen en el proyecto. Por
//     eso el catalogo salia con la tarjeta vacia.
//   - Dos filas apuntan a fotos de Amazon y de Care of Carl, que son de
//     otras tiendas y solo cargan si hay internet.
//   - Una fila lleva la imagen metida en base64 dentro de la propia tabla,
//     con lo que cada respuesta del catalogo pesa un megabyte.
//
// Que hace este script:
//
//   1. Guarda una copia de las quince filas en imagenes_copia_antes.json,
//      por si hay que volver atras.
//   2. Borra la fila del base64 y las dos de las URLs externas.
//   3. Inserta una imagen por cada color que declara el producto, apuntando
//      a la ilustracion que se creo en public/productos.
//   4. Deja como principal la de un color real, no una sin color, porque una
//      imagen sin color no se puede elegir ni saber a que prenda pertenece.
//
// Todo va dentro de una transaccion: si algo falla, no se queda nada a medias.
const { Client } = require('pg');
const { writeFileSync } = require('fs');

const ID_COLOR = { Negro: 1, Blanco: 2, Rojo: 3, Azul: 4, Verde: 5, Gris: 6, Beige: 7, Rosa: 8 };
const ID_PRODUCTO = { 'ABR-001': 6, 'PAN-001': 4, 'PIJ-001': 8, 'POL-001': 7, 'TMU-REM-001': 1, 'VES-001': 5, 'ZAP-001': 9 };

// La imagen que se dibuja por cada producto. El nombre del fichero coincide
// con el color, y el principal es el primero de la lista, que es el que sale
// en la tarjeta del catalogo antes de elegir color.
const PLAN = [
  { codigo: 'TMU-REM-001', carpeta: 'remera', colores: ['Negro', 'Blanco', 'Gris'] },
  { codigo: 'POL-001', carpeta: 'polo', colores: ['Rojo', 'Azul'] },
  { codigo: 'ABR-001', carpeta: 'campera', colores: ['Negro', 'Gris'] },
  { codigo: 'PAN-001', carpeta: 'pantalon', colores: ['Azul', 'Beige'] },
  { codigo: 'PIJ-001', carpeta: 'pijama', colores: ['Rosa', 'Verde'] },
  { codigo: 'VES-001', carpeta: 'vestido', colores: ['Rosa', 'Blanco'] },
  { codigo: 'ZAP-001', carpeta: 'zapatilla', colores: ['Negro', 'Blanco'] },
];

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  console.log('  conectado');

  // ---- 1. copia de seguridad ----
  const antes = await c.query(`
    SELECT i.id_imagen, i.id_producto, i.id_color, i.url, i.es_principal, i.orden
    FROM producto_imagenes i
    ORDER BY i.id_imagen
  `);
  const copia = antes.rows.map((r) => ({
    id_imagen: r.id_imagen,
    id_producto: r.id_producto,
    id_color: r.id_color,
    url: r.url,
    es_principal: r.es_principal,
    orden: r.orden,
  }));
  const destino =
    'C:/Users/pablo/desktop/open coude/PLATAFORMA WEB Y MOVIL DE E-COMMERCE DE TIENDA DE ROPA/BASE DE DATOS/imagenes_copia_antes.json';
  writeFileSync(destino, JSON.stringify(copia, null, 2), 'utf8');
  console.log(`  copia de ${copia.length} filas en imagenes_copia_antes.json`);

  // ---- 2. y 3. rehacer las imagenes ----
  await c.query('BEGIN');
  try {
    await c.query('DELETE FROM producto_imagenes');
    console.log('  tabla vaciada');

    let insertadas = 0;
    for (const p of PLAN) {
      const idProd = ID_PRODUCTO[p.codigo];
      if (!idProd) throw new Error(`no conozco el id de ${p.codigo}`);
      for (let i = 0; i < p.colores.length; i++) {
        const color = p.colores[i];
        const idColor = ID_COLOR[color];
        if (!idColor) throw new Error(`no conozco el id del color ${color}`);
        // El nombre del fichero va en minuscula y en singular, que es como
        // los creo las ilustraciones.
        const fichero = `/productos/${p.carpeta}/${color.toLowerCase()}.svg`;
        await c.query(
          `INSERT INTO producto_imagenes (id_producto, id_color, url, es_principal, orden)
           VALUES ($1, $2, $3, $4, $5)`,
          [idProd, idColor, fichero, i === 0, i + 1],
        );
        insertadas++;
        console.log(`  [OK] ${p.codigo} ${color.padEnd(6)} ${fichero}${i === 0 ? '  (principal)' : ''}`);
      }
    }
    await c.query('COMMIT');
    console.log(`  confirmadas ${insertadas} imagenes`);
  } catch (e) {
    await c.query('ROLLBACK');
    console.log('  ERROR, se ha deshecho todo: ' + e.message);
    await c.end();
    process.exit(1);
  }

  // ---- 4. comprobar ----
  const fin = await c.query(`
    SELECT p.codigo, COALESCE(co.nombre, 'SIN COLOR') AS color, i.url, i.es_principal
    FROM producto_imagenes i
    JOIN productos p ON p.id_producto = i.id_producto
    LEFT JOIN colores co ON co.id_color = i.id_color
    ORDER BY p.codigo, i.orden
  `);
  console.log('');
  console.log('  como queda:');
  for (const x of fin.rows) {
    console.log('    ' + x.codigo.padEnd(12) + x.color.padEnd(10) + (x.es_principal ? 'PRIN ' : '     ') + x.url);
  }
  console.log('  total: ' + fin.rowCount);

  const base64 = await c.query(`SELECT COUNT(*) AS n FROM producto_imagenes WHERE url LIKE 'data:%'`);
  const externas = await c.query(`SELECT COUNT(*) AS n FROM producto_imagenes WHERE url LIKE 'http%'`);
  console.log('');
  console.log('  base64 que quedan: ' + base64.rows[0].n);
  console.log('  urls externas: ' + externas.rows[0].n);

  await c.end();
}

main().catch((e) => {
  console.log('  ERROR: ' + e.message);
  process.exit(1);
});
