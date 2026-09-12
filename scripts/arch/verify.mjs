#!/usr/bin/env node
// =============================================================================
// verify.mjs — Runner de fitness functions de arquitectura
// -----------------------------------------------------------------------------
// Ejecuta las validaciones de arquitectura del proyecto. Cada archivo de
// `checks/` agrupa las fitness functions de UN ESTÁNDAR de dominio
// (docs/standards/) y se llama como su slug: checks/<slug-estándar>.mjs
// (p. ej. checks/architecture.mjs). Dentro de cada archivo, cada chequeo traza a
// su criterio de cumplimiento (CR-XXX) mediante la línea de protocolo que
// imprime y los comentarios junto al chequeo.
//
// Contrato del runner:
//   - Sin argumentos: ejecuta TODOS los checks/<slug>.mjs (todos los estándares).
//   - Con argumento(s): ejecuta solo esos estándares (por slug):
//       node scripts/arch/verify.mjs architecture
//     Un slug sin archivo de check es un error (salida ≠ 0).
//   - Reenvía la salida de cada check y cuenta sus líneas de protocolo
//     (`PASS|FAIL|WARN <estándar>/CR-XXX — detalle`) para el resumen final.
//   - Sale con código 0 salvo que algún check salga ≠ 0 (es decir, salvo que
//     algún CR BLOQUEANTE haya fallado; los WARN no cambian el código de salida).
//
// Este runner NO se edita al añadir validaciones: descubre los checks por
// convención. Para registrar un estándar nuevo basta con crear su
// checks/<slug-estándar>.mjs (lo hace el skill `arch-manage`).
//
// Uso:   node scripts/arch/verify.mjs [slug-estándar ...]
//        (o `npm run arch` / target equivalente si el repo lo cablea)
// =============================================================================
import { readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripAnsi } from './lib/colors.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const checksDir = join(scriptDir, 'checks');
const requested = process.argv.slice(2);

// Los checks hijos escriben a un pipe, no a esta terminal: sin ayuda, su propia
// detección de TTY vería `isTTY: false` y no colorearían PASS/WARN/FAIL. Si esta
// terminal sí admite color (y el usuario no fijó NO_COLOR/FORCE_COLOR), se lo
// indicamos vía FORCE_COLOR para que el color sobreviva al pipe entre procesos.
const childEnv =
  process.stdout.isTTY && !('NO_COLOR' in process.env) && !('FORCE_COLOR' in process.env)
    ? { ...process.env, FORCE_COLOR: '1' }
    : process.env;

if (!existsSync(checksDir)) {
  console.log(`No existe el directorio de checks: ${checksDir}`);
  console.log('Aún no hay fitness functions de arquitectura registradas.');
  process.exit(0);
}

const isCheck = (f) => /\.(mjs|js)$/.test(f) && !f.includes('.template');
const files = readdirSync(checksDir).filter(isCheck).sort();
const bySlug = new Map(files.map((f) => [f.replace(/\.(mjs|js)$/, ''), f]));

let selected = files;
if (requested.length > 0) {
  const missing = requested.filter((slug) => !bySlug.has(slug));
  if (missing.length > 0) {
    console.error(`Estándar(es) sin check registrado: ${missing.join(', ')}`);
    console.error(`Disponibles: ${[...bySlug.keys()].join(', ') || '(ninguno)'}`);
    process.exit(2);
  }
  selected = requested.map((slug) => bySlug.get(slug));
}

if (selected.length === 0) {
  console.log(`No hay fitness functions de arquitectura registradas en ${checksDir}.`);
  process.exit(0);
}

let pass = 0;
let warn = 0;
let fail = 0;
const failedStandards = [];

for (const file of selected) {
  const slug = file.replace(/\.(mjs|js)$/, '');
  console.log(`\n=== ${slug} (checks/${file}) ===`);
  const res = spawnSync(process.execPath, [join(checksDir, file)], {
    encoding: 'utf8',
    env: childEnv,
  });
  if (res.stdout) process.stdout.write(res.stdout);
  if (res.stderr) process.stderr.write(res.stderr);
  for (const rawLine of (res.stdout ?? '').split('\n')) {
    const line = stripAnsi(rawLine);
    if (line.startsWith('PASS ')) pass += 1;
    else if (line.startsWith('WARN ')) warn += 1;
    else if (line.startsWith('FAIL ')) fail += 1;
  }
  if (res.status !== 0) failedStandards.push(slug);
}

console.log('\n----- Resumen de validaciones de arquitectura -----');
console.log(`Estándares: ${selected.length}   Criterios — PASS: ${pass}   WARN: ${warn}   FAIL: ${fail}`);
if (failedStandards.length > 0) {
  console.log(`Estándares con criterios bloqueantes violados: ${failedStandards.join(', ')}`);
  process.exit(1);
}
console.log('Todos los criterios bloqueantes se cumplen.');
process.exit(0);
