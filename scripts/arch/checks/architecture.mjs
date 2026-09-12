#!/usr/bin/env node
// =============================================================================
// Fitness functions del estándar Architecture Standards — checks/architecture.mjs
// -----------------------------------------------------------------------------
// UN archivo por ESTÁNDAR (no por criterio): agrupa los chequeos de todos los
// criterios de cumplimiento (CR) automatizables de docs/standards/architecture.md.
// La trazabilidad al criterio se indica en cada chequeo: su referencia CR-XXX (en
// el registro del chequeo y en la línea de salida) y un comentario con el detalle.
//
// Los CR delegados en ESLint (CR-004, CR-009, CR-013 a CR-016) NO ejecutan
// ESLint aquí: `npm run lint` y `npm run arch` son compuertas separadas. Lo que
// se audita es que eslint.config.mjs registre la regla correspondiente en
// severidad "error" (ver scripts/arch/lib/eslint-config.mjs) — si la regla
// detecta una violación real, eso lo reporta `npm run lint`, no `npm run arch`.
//
// El runner (../verify.mjs) descubre este archivo por convención
// (checks/architecture.mjs) y lo ejecuta junto al resto; con
// `node scripts/arch/verify.mjs architecture` se ejecuta solo este estándar.
// =============================================================================
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEslintConfig, requireRuleSeverity, ruleTag } from '../lib/eslint-config.mjs';
import { colorStatus } from '../lib/colors.mjs';

const STANDARD = 'architecture';
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
let blockingFailures = 0;

// Registra y ejecuta el chequeo de UN criterio de cumplimiento.
function check(cr, enfoque, descripcion, fn) {
  try {
    fn();
    console.log(`${colorStatus('PASS')} ${STANDARD}/${cr} — ${descripcion}`);
  } catch (err) {
    const status = enfoque === 'warning' ? 'WARN' : 'FAIL';
    if (status === 'FAIL') blockingFailures += 1;
    console.log(`${colorStatus(status)} ${STANDARD}/${cr} — ${descripcion}`);
    const detail = err?.stdout?.toString?.() || err?.message || '';
    if (detail) console.log(detail.trim().split('\n').map((l) => `     ${l}`).join('\n'));
  }
}

// Ejecuta un comando acotado; lanza si sale ≠ 0 (eso marca el criterio como violado).
const run = (cmd) => execSync(cmd, { stdio: 'pipe', encoding: 'utf8', cwd: repoRoot });

const eslintConfig = await loadEslintConfig(repoRoot);

// --- CR-001 (bloqueante) ------------------------------------------------------
// Las capas de primer nivel son Core, Shared y Features (ver ADR-001).
check('CR-001', 'bloqueante', 'carpetas de capas', () => {
  const appRoot = join(repoRoot, 'src/app');
  const missing = ['core', 'shared', 'features'].filter((d) => !existsSync(join(appRoot, d)));
  if (missing.length > 0) {
    throw new Error(`Faltan carpetas de capa: ${missing.map((d) => `src/app/${d}/`).join(', ')}`);
  }
});

// --- CR-002 (bloqueante) ------------------------------------------------------
// Ningún módulo de src/app/ debe importar (directa o transitivamente) un módulo
// de otra capa en dirección prohibida (ver ADR-001). Se verifica con
// dependency-cruiser; config: .dependency-cruiser.js (raíz del repo).
check('CR-002', 'bloqueante', 'dirección de dependencias entre capas', () => {
  run('npx depcruise --config .dependency-cruiser.js --output-type err src/app');
});

// --- CR-004 (bloqueante) -------------------------------------------------------
// Ningún import relativo debe cruzar de capa sin usar el path alias correspondiente
// (ver ADR-001). Enforcement: regla ESLint project-rules/require-layer-path-alias
// (scripts/eslint-rules/require-layer-path-alias.mjs); aquí solo se audita que
// esté registrada en severidad "error".
check('CR-004', 'bloqueante', `regla de path alias obligatorio activa${ruleTag('project-rules/require-layer-path-alias')}`, () => {
  requireRuleSeverity(eslintConfig, 'project-rules/require-layer-path-alias', 'error', {
    label: 'ADR-001',
  });
});

// --- CR-009 (bloqueante) ------------------------------------------------------
// URLs REST vía getApiUrl; no hardcodear /api/v1/ (u otro prefijo de versión) en
// callers bajo src/app (ver ADR-010). El contrato del helper se valida leyendo su
// fuente; el hardcodeo del prefijo lo detecta la regla ESLint no-restricted-syntax
// (ver eslint.config.mjs) — aquí solo se audita que esté registrada.
check('CR-009', 'bloqueante', `regla de getApiUrl obligatorio (sin prefijo de API hardcodeado) activa${ruleTag('no-restricted-syntax')}`, () => {
  const asyncPath = join(repoRoot, 'src/app/core/utils/async-resources.ts');
  const asyncSrc = readFileSync(asyncPath, 'utf8');
  if (!/apiRestBaseUrl/.test(asyncSrc) || !/export\s+function\s+getApiUrl\b/.test(asyncSrc)) {
    throw new Error('getApiUrl debe basarse en environment.apiRestBaseUrl');
  }

  requireRuleSeverity(eslintConfig, 'no-restricted-syntax', 'error', {
    contains: 'ADR-010',
    label: 'prefijo de API hardcodeado',
  });
});

// --- CR-013 (bloqueante) ------------------------------------------------------
// Clase {Entidad|Flujo}Manager ↔ archivo {entidad|flujo}-manager.ts (ADR-011).
// Enforcement: regla ESLint project-rules/manager-naming
// (scripts/eslint-rules/manager-naming.mjs).
check('CR-013', 'bloqueante', `regla de nomenclatura Manager (*Manager / *-manager.ts) activa${ruleTag('project-rules/manager-naming')}`, () => {
  requireRuleSeverity(eslintConfig, 'project-rules/manager-naming', 'error', { label: 'ADR-011' });
});

// --- CR-014 (bloqueante) ------------------------------------------------------
// Mappers de entidad de feature en features/{feature}/utils/{entity}-mapper.ts
// (ver ADR-012). Enforcement: regla ESLint project-rules/mapper-location
// (scripts/eslint-rules/mapper-location.mjs).
check('CR-014', 'bloqueante', `regla de ubicación de mappers (features/{feature}/utils/*-mapper.ts) activa${ruleTag('project-rules/mapper-location')}`, () => {
  requireRuleSeverity(eslintConfig, 'project-rules/mapper-location', 'error', { label: 'ADR-012' });
});

// --- CR-015 (bloqueante) ------------------------------------------------------
// Objeto {Entity}Mapper ↔ archivo {entity}-mapper.ts (ADR-012). Enforcement:
// regla ESLint project-rules/mapper-naming (scripts/eslint-rules/mapper-naming.mjs).
check('CR-015', 'bloqueante', `regla de nomenclatura Mapper (*Mapper / *-mapper.ts) activa${ruleTag('project-rules/mapper-naming')}`, () => {
  requireRuleSeverity(eslintConfig, 'project-rules/mapper-naming', 'error', { label: 'ADR-012' });
});

// --- CR-016 (bloqueante) ------------------------------------------------------
// Mappers sin DI Angular ni I/O (ADR-012). Enforcement: reglas nativas de ESLint
// no-restricted-syntax / no-restricted-globals, acotadas a src/app/**/*-mapper.ts
// (ver eslint.config.mjs).
check('CR-016', 'bloqueante', `regla de mappers puros (sin inject / DI / I/O) activa${ruleTag('no-restricted-syntax', 'no-restricted-globals')}`, () => {
  requireRuleSeverity(eslintConfig, 'no-restricted-syntax', 'error', {
    contains: 'ADR-012',
    label: 'mappers sin DI Angular',
  });
  requireRuleSeverity(eslintConfig, 'no-restricted-globals', 'error', {
    contains: 'ADR-012',
    label: 'mappers sin I/O',
  });
});

process.exit(blockingFailures > 0 ? 1 : 0);
