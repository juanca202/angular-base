#!/usr/bin/env node
// =============================================================================
// Fitness functions del estándar Testing Standards — checks/testing.mjs
// -----------------------------------------------------------------------------
// UN archivo por ESTÁNDAR (no por criterio): agrupa los chequeos de todos los
// criterios de cumplimiento (CR) automatizables de docs/standards/testing.md.
//
// CR-008 delega en una regla nativa de ESLint la parte de "sin imports de
// Playwright fuera de e2e/". `npm run lint` y `npm run arch` son compuertas
// separadas: este archivo NO ejecuta ESLint, solo audita que eslint.config.mjs
// registre la regla en severidad "error" (ver scripts/arch/lib/eslint-config.mjs).
//
// El runner (../verify.mjs) descubre este archivo por convención
// (checks/testing.mjs) y lo ejecuta junto al resto; con
// `node scripts/arch/verify.mjs testing` se ejecuta solo este estándar.
// =============================================================================
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEslintConfig, requireRuleSeverity, ruleTag } from '../lib/eslint-config.mjs';
import { colorStatus } from '../lib/colors.mjs';

const STANDARD = 'testing';
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
let blockingFailures = 0;

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

function readJson(relPath) {
  return JSON.parse(readFileSync(join(repoRoot, relPath), 'utf8'));
}

const eslintConfig = await loadEslintConfig(repoRoot);

function walkFiles(dir, predicate, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === 'coverage') continue;
      walkFiles(full, predicate, acc);
    } else if (predicate(full)) {
      acc.push(full);
    }
  }
  return acc;
}


// --- CR-002 (bloqueante) ------------------------------------------------------
// Los archivos *.spec.ts deben vivir junto al código bajo prueba (colocation).
// Para cada `foo.spec.ts` debe existir el hermano `foo.ts` en el mismo directorio.
check('CR-002', 'bloqueante', 'colocation de archivos *.spec.ts', () => {
  const srcRoot = join(repoRoot, 'src');
  const specs = walkFiles(srcRoot, (f) => f.endsWith('.spec.ts'));
  const orphans = [];
  for (const spec of specs) {
    const sibling = spec.replace(/\.spec\.ts$/, '.ts');
    if (!existsSync(sibling)) {
      orphans.push(relative(repoRoot, spec));
    }
  }
  if (orphans.length > 0) {
    throw new Error(
      `${orphans.length} spec(s) sin módulo hermano colocalizado:\n${orphans.map((p) => `  - ${p}`).join('\n')}`
    );
  }

  const remoteRoots = ['tests', 'test', '__tests__'].map((d) => join(repoRoot, d));
  const remoteSpecs = remoteRoots.flatMap((dir) =>
    walkFiles(dir, (f) => f.endsWith('.spec.ts') || f.endsWith('.test.ts'))
  );
  if (remoteSpecs.length > 0) {
    throw new Error(
      `Hay pruebas unitarias fuera de src/ (deben colocalizarse):\n${remoteSpecs
        .map((p) => `  - ${relative(repoRoot, p)}`)
        .join('\n')}`
    );
  }
});

// --- CR-005 (bloqueante) ------------------------------------------------------
// Cobertura de pruebas unitarias ≥ 80%. Se verifica que el builder nativo
// @angular/build:unit-test tenga la cobertura activada y el umbral cableado en
// angular.json; que la cobertura real de hoy cumpla ese umbral ya lo hace fallar
// cualquier `ng test` (coverage+coverageThresholds son opciones por defecto del
// target), así que no se re-ejecuta aquí la suite completa.
check('CR-005', 'bloqueante', 'umbral de cobertura ≥ 80% configurado (no re-ejecuta la suite)', () => {
  const angular = readJson('angular.json');
  const project = Object.values(angular.projects ?? {})[0];
  const options = project?.architect?.test?.options ?? {};
  const thresholds = options.coverageThresholds ?? {};
  const metrics = ['statements', 'branches', 'functions', 'lines'];
  const weak = metrics.filter((m) => Number(thresholds[m] ?? 0) < 80);
  if (!options.coverage) {
    throw new Error("angular.json: test.options.coverage debe ser true");
  }
  if (weak.length > 0) {
    throw new Error(
      `angular.json: coverageThresholds debe ser ≥ 80 para: ${weak.join(', ')}`
    );
  }
});

// --- CR-007 (bloqueante) ------------------------------------------------------
// Las pruebas E2E deben implementarse con Playwright; no debe coexistir otro
// framework E2E (ver ADR-005). Se verifica package.json + playwright.config.ts.
check('CR-007', 'bloqueante', 'stack Playwright para E2E', () => {
  const pkg = readJson('package.json');
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (!deps['@playwright/test'] && !deps['playwright']) {
    throw new Error("Falta dependencia E2E: @playwright/test");
  }

  const configCandidates = ['playwright.config.ts', 'playwright.config.js', 'playwright.config.mjs'];
  if (!configCandidates.some((f) => existsSync(join(repoRoot, f)))) {
    throw new Error(
      `Debe existir playwright.config.ts (o .js/.mjs) en la raíz del repositorio`
    );
  }

  const forbidden = [
    'cypress',
    'nightwatch',
    'webdriverio',
    '@wdio/cli',
    'protractor',
    'selenium-webdriver',
  ].filter((name) => deps[name]);
  if (forbidden.length > 0) {
    throw new Error(
      `No debe coexistir otro framework E2E como dependencia: ${forbidden.join(', ')}`
    );
  }
});

// --- CR-008 (bloqueante) ------------------------------------------------------
// Los archivos de prueba E2E deben vivir bajo e2e/ (raíz del repo). Se verifica
// que e2e/ exista y que playwright.config apunte a ese testDir; que no haya
// imports de @playwright/test fuera de e2e/ se verifica con la regla ESLint
// no-restricted-imports (ver eslint.config.mjs; e2e/ está fuera de su alcance).
check('CR-008', 'bloqueante', `regla de ubicación E2E bajo e2e/ activa${ruleTag('no-restricted-imports')}`, () => {
  const e2eRoot = join(repoRoot, 'e2e');
  if (!existsSync(e2eRoot) || !statSync(e2eRoot).isDirectory()) {
    throw new Error('Debe existir el directorio e2e/ en la raíz del repositorio');
  }

  const configPath = ['playwright.config.ts', 'playwright.config.js', 'playwright.config.mjs']
    .map((f) => join(repoRoot, f))
    .find((p) => existsSync(p));
  if (configPath) {
    const configText = readFileSync(configPath, 'utf8');
    if (!/testDir\s*:\s*['"`]\.?\/?e2e['"`]/.test(configText)) {
      throw new Error(
        `${relative(repoRoot, configPath)}: testDir debe ser './e2e' (o 'e2e')`
      );
    }
  }

  requireRuleSeverity(eslintConfig, 'no-restricted-imports', 'error', {
    contains: '@playwright/test',
    label: 'ADR-005',
  });
});

process.exit(blockingFailures > 0 ? 1 : 0);
