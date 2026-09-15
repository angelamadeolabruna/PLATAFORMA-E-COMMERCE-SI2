import { execSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const admin = await login('admin.cu11@tiendasmontano.com', 'AdminCu11#2026');
const cliente = await login('cliente.prueba@tiendasmontano.com', 'Prueba2026');

const directorioRespaldos = join(process.cwd(), 'api', 'respaldos');
const respaldosCreados = [];

try {
  // E4: cliente sin permiso -> 403
  let res = await fetch(`${BASE}/admin/respaldos`, { headers: BH(cliente) });
  check('Listar respaldos as cliente -> 403', res.status === 403, `status=${res.status}`);

  res = await fetch(`${BASE}/admin/respaldos/programacion`, { headers: BH(cliente) });
  check('Obtener programacion as cliente -> 403', res.status === 403, `status=${res.status}`);

  // Crear respaldo manual (admin)
  res = await fetch(`${BASE}/admin/respaldos/crear`, { method: 'POST', headers: BH(admin) });
  let b = await json(res);
  check('Crear respaldo -> 201 En Progreso', res.status === 201 && b?.id_respaldo > 0 && b?.estado === 'En Progreso', `status=${res.status} body=${JSON.stringify(b)}`);
  const idRep1 = b?.id_respaldo;
  respaldosCreados.push(idRep1);

  // Esperar a que termine (Exitoso) con polling
  let repFinal = null;
  for (let i = 0; i < 30; i++) {
    await sleep(1500);
    res = await fetch(`${BASE}/admin/respaldos`, { headers: BH(admin) });
    const lista = await json(res);
    repFinal = (lista?.items ?? []).find((r) => r.id_respaldo === idRep1);
    if (repFinal && repFinal.estado === 'Exitoso') break;
  }
  check('Respaldo finaliza Exitoso con tamano > 0 y archivo', !!repFinal && repFinal.estado === 'Exitoso' && repFinal.tamano_bytes > 0 && !!repFinal.storage_url?.endsWith('.sql.gz'), JSON.stringify(repFinal));

  // Verificar archivo en disco
  let archivoEnDisco = false;
  if (repFinal?.storage_url) {
    const ruta = join(directorioRespaldos, repFinal.storage_url.split(/[\\/]/).pop());
    archivoEnDisco = existsSync(ruta) && statSync(ruta).size > 1000;
  }
  check('Archivo .sql.gz existe en almacenamiento', archivoEnDisco, repFinal?.storage_url ?? 'sin archivo');

  // Descargar respaldo
  res = await fetch(`${BASE}/admin/respaldos/${idRep1}/descargar`, { headers: { Authorization: `Bearer ${admin}` } });
  const buffer = Buffer.from(await res.arrayBuffer());
  const gzipMagico = buffer.length > 2 && buffer[0] === 0x1f && buffer[1] === 0x8b;
  const nombreDicta = res.headers.get('content-disposition') ?? '';
  check('Descargar respaldo -> gzip + nombre', res.status === 200 && gzipMagico && nombreDicta.includes('.sql.gz'), `status=${res.status} gzip=${gzipMagico} cd=${nombreDicta}`);

  // E2: descargar respaldo inexistente -> 404
  res = await fetch(`${BASE}/admin/respaldos/999999/descargar`, { headers: { Authorization: `Bearer ${admin}` } });
  check('Descargar respaldo inexistente -> 404', res.status === 404, `status=${res.status}`);

  // Programación
  res = await fetch(`${BASE}/admin/respaldos/programacion`, { headers: BH(admin) });
  b = await json(res);
  check('Obtener programacion -> 200', res.status === 200 && b?.frecuencia === 'Diario' && b?.hora === '02:00', `status=${res.status} body=${JSON.stringify(b)}`);

  // Guardar programación Diario 08:30
  res = await fetch(`${BASE}/admin/respaldos/programacion`, {
    method: 'PUT',
    headers: BH(admin),
    body: JSON.stringify({ frecuencua: 'Diario', hora: '08:30' }),
  });
  b = await json(res);
  check('Programacion invalida (frecuencia_typo) -> 422', res.status === 422, `status=${res.status} body=${JSON.stringify(b)}`);

  res = await fetch(`${BASE}/admin/respaldos/programacion`, {
    method: 'PUT',
    headers: BH(admin),
    body: JSON.stringify({ frecuencia: 'Diario', hora: '08:30' }),
  });
  b = await json(res);
  check('Guardar programacion Diario -> 200', res.status === 200 && b?.programacion?.hora === '08:30', `status=${res.status} body=${JSON.stringify(b)}`);
  const idProg = b?.programacion?.id_programacion;

  // Semanal sin día -> 422
  res = await fetch(`${BASE}/admin/respaldos/programacion`, {
    method: 'PUT',
    headers: BH(admin),
    body: JSON.stringify({ frecuencia: 'Semanal', hora: '22:00' }),
  });
  check('Semanal sin dia -> 422', res.status === 422, `status=${res.status}`);

  // Semanal con día -> 200
  res = await fetch(`${BASE}/admin/respaldos/programacion`, {
    method: 'PUT',
    headers: BH(admin),
    body: JSON.stringify({ frecuencia: 'Semanal', hora: '22:00', dia_semana: 5 }),
  });
  b = await json(res);
  check('Guardar programacion Semanal (día 5) -> 200', res.status === 200 && b?.programacion?.frecuencia === 'Semanal' && b?.programacion?.dia_semana === 5, `status=${res.status} body=${JSON.stringify(b)}`);

  // Hora inválida -> 422
  res = await fetch(`${BASE}/admin/respaldos/programacion`, {
    method: 'PUT',
    headers: BH(admin),
    body: JSON.stringify({ frecuencia: 'Diario', hora: '25:99' }),
  });
  check('Hora invalida -> 422', res.status === 422, `status=${res.status}`);

  // Restaurar programación Diario 02:00
  res = await fetch(`${BASE}/admin/respaldos/programacion`, {
    method: 'PUT',
    headers: BH(admin),
    body: JSON.stringify({ frecuencia: 'Diario', hora: '02:00', dia_semana: null }),
  });
  b = await json(res);
  check('Restaurar programacion Diario 02:00 -> 200', res.status === 200 && b?.programacion?.hora === '02:00', `status=${res.status} body=${JSON.stringify(b)}`);

  // E3: crear dos respaldos rápidos -> el segundo debe ser 409/423 (ya hay uno en progreso)
  res = await fetch(`${BASE}/admin/respaldos/crear`, { method: 'POST', headers: BH(admin) });
  const b3a = await json(res);
  const idRep3 = b3a?.id_respaldo;
  respaldosCreados.push(idRep3);
  check('Crear respaldo rapido #1 -> 201', res.status === 201 && idRep3 > 0, `status=${res.status} body=${JSON.stringify(b3a)}`);
  if (idRep3) {
    // segundo inmediato -> esperamos 409 Conflict (hay En Progreso)
    res = await fetch(`${BASE}/admin/respaldos/crear`, { method: 'POST', headers: BH(admin) });
    const b3b = await json(res);
    const esperado = res.status === 409 || res.status === 423;
    check('Crear respaldo mientras otro en progreso -> 409', esperado, `status=${res.status} body=${JSON.stringify(b3b)}`);
    // esperar que el #1 termine para no dejar En Progreso
    for (let i = 0; i < 30; i++) {
      await sleep(1500);
      res = await fetch(`${BASE}/admin/respaldos`, { headers: BH(admin) });
      const lista = await json(res);
      const e = (lista?.items ?? []).find((r) => r.id_respaldo === idRep3);
      if (e && e.estado !== 'En Progreso') break;
    }
  }

  // Bitácora (ASCII sin tildes en búsqueda)
  const bit = extraerInt(psql(`SELECT count(*) FROM bitacora_auditoria WHERE accion_sql='BACKUP' AND tabla_afectada='respaldos' AND fecha_hora > NOW() - INTERVAL '1 hour'`));
  check('Bitacora registra acciones BACKUP', bit >= 2, `count=${bit}`);

  const bit2 = extraerInt(psql(`SELECT count(*) FROM bitacora_auditoria WHERE tabla_afectada='respaldo_programacion' AND fecha_hora > NOW() - INTERVAL '1 hour'`));
  check('Bitacora registra actualizaciones de programacion', bit2 >= 1, `count=${bit2}`);

  a('\n--- LIMPIEZA ---');
  // Eliminar respaldos e2e
  for (const id of respaldosCreados) {
    if (!Number.isInteger(id)) continue;
    const url = psql(`SELECT storage_url FROM respaldos WHERE id_respaldo=${id}`).trim();
    psql(`DELETE FROM bitacora_auditoria WHERE accion_sql='BACKUP' AND tabla_afectada='respaldos' AND id_registro=${id}`);
    psql(`DELETE FROM respaldos WHERE id_respaldo=${id}`);
    if (url) {
      const nombre = url.split(/[\\/]/).pop().trim();
      if (nombre) {
        const ruta = join(directorioRespaldos, nombre);
        if (existsSync(ruta)) {
          unlinkSync(ruta);
          a(`Eliminado archivo: ${nombre}`);
        }
      }
    }
  }
  // Limpiar bitácora de programación e2e
  psql(`DELETE FROM bitacora_auditoria WHERE tabla_afectada='respaldo_programacion' AND fecha_hora > NOW() - INTERVAL '1 hour'`);
  a('Limpieza completada.');

  a(`\nE2E CU27 · ${fallidos === 0 ? 'TODO OK' : `${fallidos} fallidos`}`);
  process.exit(fallidos === 0 ? 0 : 1);
} catch (error) {
  console.error('ERROR E2E:', error);
  // intentar limpiar
  for (const id of respaldosCreados) {
    if (!Number.isInteger(id)) continue;
    try { psql(`DELETE FROM respaldos WHERE id_respaldo=${id}`); } catch {}
  }
  try { psql(`DELETE FROM bitacora_auditoria WHERE tabla_afectada IN ('respaldos','respaldo_programacion') AND fecha_hora > NOW() - INTERVAL '1 hour'`); } catch {}
  process.exit(1);
}