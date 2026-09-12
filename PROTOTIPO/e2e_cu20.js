import { execSync } from 'node:child_process';

const BASE = 'http://localhost:3000/api/v1';
const PG = 'psql -h aws-0-sa-east-1.pooler.supabase.com -U postgres.uclqouwevozituhonzpd -d postgres';
const ENV = { ...process.env, PGPASSWORD: 'Montano2026Segura' };
const psql = (sql) => execSync(`${PG} -c "${sql}"`, { env: ENV, stdio: 'pipe' }).toString();
const extraerInt = (out) => Number((out.match(/\d+/) ?? [null])[0]);

let fallidos = 0;
const a = (texto) => console.log(texto);
async function json(res) {
  return res.status === 204 ? null : res.json().catch(() => null);
}
async function login(credencial, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credencial, password }),
  });
  const body = await json(res);
  if (res.status !== 200 || !body?.access_token) throw new Error('No se pudo iniciar sesión');
  return body.access_token;
}
function check(nombre, condicion, detalle) {
  if (condicion) a(`OK   ${nombre}`);
  else {
    fallidos++;
    a(`FALLO ${nombre} :: ${detalle}`);
  }
}
const BH = (t) => ({ Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' });

const admin = await login('admin.cu11@tiendasmontano.com', 'AdminCu11#2026');
const cliente = await login('cliente.prueba@tiendasmontano.com', 'Prueba2026');

let idProv;
let ocId;
let repId;

try {
  // Crear proveedor
  let res = await fetch(`${BASE}/proveedores`, {
    method: 'POST',
    headers: BH(admin),
    body: JSON.stringify({
      nombre: 'Sourced E2E CU20', nit_ruc: '102030403', telefono: '2201124',
      correo: 'e2e.cu20@test.com', id_ciudad: 1,
    }),
  });
  const bodyProv = await json(res);
  idProv = bodyProv?.id_proveedor;
  check('POST proveedor -> 201', res.status === 201 && Number.isInteger(idProv), `status=${res.status} body=${JSON.stringify(bodyProv)}`);

  // E1: sin OC recibida -> 400
  res = await fetch(`${BASE}/admin/proveedores/${idProv}/recalcular_score`, { method: 'POST', headers: BH(admin) });
  let b = await json(res);
  check('Recalcular sin datos -> 400', res.status === 400 && b?.message === 'No hay datos de entregas para calcular el score.', `status=${res.status} body=${JSON.stringify(b)}`);

  // Insertar OC recibida a tiempo + recepción completa (puntualidad 40 + velocidad 20 + cumplimiento 20 + calidad 20 = 100)
  ocId = extraerInt(psql(`INSERT INTO ordenes_compra (id_proveedor, numero, fecha_orden, fecha_estimada_entrega, fecha_recepcion, estado, total) VALUES (${idProv}, 'OC-E2E-CU20', NOW() - INTERVAL '15 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '7 days', 'Recibida', 1000) RETURNING id_orden_compra`));
  repId = extraerInt(psql(`INSERT INTO recepciones (id_orden_compra, id_sucursal, id_usuario, fecha_recepcion, estado) VALUES (${ocId}, 1, 17, NOW() - INTERVAL '7 days', 'Registrada') RETURNING id_recepcion`));
  psql(`INSERT INTO recepcion_items (id_recepcion, id_ptc, cantidad_pedida, cantidad_recibida, diferencia) VALUES (${repId}, 1, 10, 10, 0)`);

  // Recalcular -> 200 con score 100
  res = await fetch(`${BASE}/admin/proveedores/${idProv}/recalcular_score`, { method: 'POST', headers: BH(admin) });
  b = await json(res);
  check('Recalcular con datos -> 200 score 100', res.status === 200 && b?.detail === 'Score recalculado.' && b?.score === 100, `status=${res.status} body=${JSON.stringify(b)}`);
  const scoreEsperado = b?.score;

  // GET refleja score y score_fecha
  res = await fetch(`${BASE}/proveedores`, { headers: BH(admin) });
  const lista = await json(res);
  const prov = (lista ?? []).find((p) => p.id_proveedor === idProv);
  check('GET refleja score + score_fecha', !!prov && prov.calidad_score === scoreEsperado && !!prov.score_fecha, JSON.stringify(prov));

  // Cliente sin permiso evaluar_proveedores -> 403
  res = await fetch(`${BASE}/admin/proveedores/${idProv}/recalcular_score`, { method: 'POST', headers: BH(cliente) });
  check('Recalcular as cliente -> 403', res.status === 403, `status=${res.status}`);

  // Proveedor inexistente -> 404
  res = await fetch(`${BASE}/admin/proveedores/999999/recalcular_score`, { method: 'POST', headers: BH(admin) });
  check('Recalcular proveedor inexistente -> 404', res.status === 404, `status=${res.status}`);
} finally {
  if (repId) psql(`DELETE FROM recepcion_items WHERE id_recepcion = ${repId}`);
  if (repId) psql(`DELETE FROM recepciones WHERE id_recepcion = ${repId}`);
  if (ocId) psql(`DELETE FROM ordenes_compra WHERE id_orden_compra = ${ocId}`);
  if (idProv) {
    psql(`DELETE FROM bitacora_auditoria WHERE tabla_afectada='proveedores' AND id_registro = ${idProv}`);
    psql(`DELETE FROM proveedores WHERE id_proveedor = ${idProv}`);
  }
}

a(`\nResultado: ${fallidos === 0 ? 'TODOS LOS PRUEBAS OK' : `${fallidos} FALLARON`}`);
process.exit(fallidos === 0 ? 0 : 1);