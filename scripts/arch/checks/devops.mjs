#!/usr/bin/env node
// =============================================================================
// Fitness functions del estándar DevOps Standards — checks/devops.mjs
// -----------------------------------------------------------------------------
// UN archivo por ESTÁNDAR (no por criterio): agrupa los chequeos de todos los
// criterios de cumplimiento (CR) automatizables de docs/standards/devops.md.
//
// El runner (../verify.mjs) descubre este archivo por convención
// (checks/devops.mjs) y lo ejecuta junto al resto; con
// `node scripts/arch/verify.mjs devops` se ejecuta solo este estándar.
// =============================================================================
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const STANDARD = 'devops';
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
let blockingFailures = 0;

function check(cr, enfoque, descripcion, fn) {
  try {
    fn();
    console.log(`PASS ${STANDARD}/${cr} — ${descripcion}`);
  } catch (err) {
    const status = enfoque === 'warning' ? 'WARN' : 'FAIL';
    if (status === 'FAIL') blockingFailures += 1;
    console.log(`${status} ${STANDARD}/${cr} — ${descripcion}`);
    const detail = err?.stdout?.toString?.() || err?.stderr?.toString?.() || err?.message || '';
    if (detail) console.log(detail.trim().split('\n').map((l) => `     ${l}`).join('\n'));
  }
}

function readJson(relPath) {
  return JSON.parse(readFileSync(join(repoRoot, relPath), 'utf8'));
}

const run = (cmd, opts = {}) =>
  execSync(cmd, {
    stdio: 'pipe',
    encoding: 'utf8',
    cwd: repoRoot,
    ...opts,
  });

const EXPECTED_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
];

function resolveCommitlintConfigPath() {
  const candidates = [
    'commitlint.config.mjs',
    'commitlint.config.js',
    'commitlint.config.cjs',
    '.commitlintrc',
    '.commitlintrc.js',
    '.commitlintrc.cjs',
    '.commitlintrc.json',
  ];
  return candidates.find((f) => existsSync(join(repoRoot, f))) ?? null;
}

// --- CR-002 (bloqueante) ------------------------------------------------------
// Mensajes de commit deben seguir Conventional Commits con los tipos del
// estándar (ver ADR-008). Se verifica ejecutando commitlint sobre mensajes
// de control (válido / inválido) y comprobando type-enum en la config.
check('CR-002', 'bloqueante', 'Conventional Commits vía commitlint', () => {
  const configPath = resolveCommitlintConfigPath();
  if (!configPath) {
    throw new Error('Falta commitlint.config.* (o .commitlintrc*) en la raíz del repo');
  }

  const configText = readFileSync(join(repoRoot, configPath), 'utf8');
  if (!configText.includes('@commitlint/config-conventional')) {
    throw new Error(`${configPath} debe extender @commitlint/config-conventional`);
  }
  for (const type of EXPECTED_TYPES) {
    if (!configText.includes(`'${type}'`) && !configText.includes(`"${type}"`)) {
      throw new Error(`${configPath}: falta el tipo permitido '${type}' en type-enum`);
    }
  }

  try {
    run('printf "feat: smoke conventional commit\\n" | npx commitlint');
  } catch (err) {
    throw new Error(
      `commitlint rechazó un mensaje Conventional Commits válido:\n${err.stdout || err.message}`
    );
  }

  let invalidRejected = false;
  try {
    run('printf "not a conventional commit\\n" | npx commitlint');
  } catch {
    invalidRejected = true;
  }
  if (!invalidRejected) {
    throw new Error('commitlint aceptó un mensaje no convencional (debería rechazarlo)');
  }
});

// --- CR-003 (bloqueante) ------------------------------------------------------
// El proyecto debe validar mensajes con commitlint; Husky puede engancharlo en
// commit-msg (ver ADR-008).
check('CR-003', 'bloqueante', 'enforcement commitlint (+ Husky commit-msg)', () => {
  const pkg = readJson('package.json');
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const missing = [];
  if (!deps['@commitlint/cli']) missing.push('@commitlint/cli');
  if (!deps['@commitlint/config-conventional']) missing.push('@commitlint/config-conventional');
  if (missing.length > 0) {
    throw new Error(`Faltan dependencias de commitlint: ${missing.join(', ')}`);
  }

  if (!resolveCommitlintConfigPath()) {
    throw new Error('Falta archivo de configuración de commitlint en la raíz');
  }

  if (!deps['husky']) {
    throw new Error('Falta husky (requerido para enganchar commitlint en commit-msg)');
  }
  if (pkg.scripts?.prepare !== 'husky') {
    throw new Error('package.json: scripts.prepare debe ser "husky"');
  }

  const hookPath = join(repoRoot, '.husky/commit-msg');
  if (!existsSync(hookPath)) {
    throw new Error('Falta el hook .husky/commit-msg');
  }
  const hook = readFileSync(hookPath, 'utf8');
  if (!/commitlint/.test(hook)) {
    throw new Error('.husky/commit-msg debe invocar commitlint');
  }
});

process.exit(blockingFailures > 0 ? 1 : 0);
