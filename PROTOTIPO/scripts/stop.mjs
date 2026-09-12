import { execSync } from 'node:child_process';

const PUERTOS = [3000, 5173];

function pidsEnPuerto(puerto) {
  const out = execSync('netstat -ano', { encoding: 'utf8' });
  const pids = new Set();
  for (const linea of out.split(/\r?\n/)) {
    const partes = linea.trim().split(/\s+/);
    if (partes.length < 5) continue;
    const [proto, local, , estado, pid] = partes;
    if (!proto.toLowerCase().startsWith('tcp')) continue;
    if (!local.endsWith(`:${puerto}`)) continue;
    if (estado !== 'LISTENING') continue;
    if (pid !== '0') pids.add(pid);
  }
  return [...pids];
}

for (const puerto of PUERTOS) {
  const pids = pidsEnPuerto(puerto);
  if (pids.length === 0) {
    console.log(`Puerto ${puerto}: nada escuchando.`);
    continue;
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'pipe' });
      console.log(`Puerto ${puerto}: proceso ${pid} detenido.`);
    } catch {
      console.log(`Puerto ${puerto}: no se pudo detener el proceso ${pid}.`);
    }
  }
}