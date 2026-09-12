#!/usr/bin/env node
// =============================================================================
// Fitness functions del estándar Frontend Standards — checks/frontend.mjs
// -----------------------------------------------------------------------------
// UN archivo por ESTÁNDAR (no por criterio): agrupa los chequeos de todos los
// criterios de cumplimiento (CR) automatizables de docs/standards/frontend.md.
//
// CR-002 se delega en una regla nativa de ESLint. `npm run lint` y
// `npm run arch` son compuertas separadas: este archivo NO ejecuta ESLint,
// solo audita que eslint.config.mjs registre la regla en severidad "error"
// (ver scripts/arch/lib/eslint-config.mjs).
//
// El runner (../verify.mjs) descubre este archivo por convención
// (checks/frontend.mjs) y lo ejecuta junto al resto; con
// `node scripts/arch/verify.mjs frontend` se ejecuta solo este estándar.
// =============================================================================
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEslintConfig, requireRuleSeverity, ruleTag } from '../lib/eslint-config.mjs';
import { colorStatus } from '../lib/colors.mjs';

const STANDARD = 'frontend';
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
let blockingFailures = 0;

const eslintConfig = await loadEslintConfig(repoRoot);

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

function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Detecta bloques de selector de clase cuyo cuerpo usa CSS crudo sin @apply.
 * Heurística: propiedades `nombre: valor` que no son custom properties (--*) ni @-rules.
 */
function findRawCssClassViolations(cssText) {
  const css = stripCssComments(cssText);
  const violations = [];
  // Matcher simple de bloques; suficiente para hojas de estilo planas del proyecto.
  const blockRe = /([^{}@][^{]*)\{([^{}]*)\}/g;
  let match;
  while ((match = blockRe.exec(css)) !== null) {
    const selector = match[1].trim();
    const body = match[2];
    if (!/(^|[\s,>+~])\.[A-Za-z_][\w-]*/.test(selector)) continue;
    if (/@apply\b/.test(body)) continue;

    const rawProps = body
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((decl) => {
        if (decl.startsWith('@')) return false;
        const prop = decl.split(':')[0]?.trim() ?? '';
        if (!prop || prop.startsWith('--')) return false;
        return /^[a-zA-Z-]+$/.test(prop);
      });

    if (rawProps.length > 0) {
      violations.push({ selector: selector.slice(0, 80), sample: rawProps[0] });
    }
  }
  return violations;
}

function collectStyleSources() {
  const srcRoot = join(repoRoot, 'src');
  const sources = [];

  for (const file of walkFiles(srcRoot, (f) => f.endsWith('.css') || f.endsWith('.scss'))) {
    sources.push({ path: file, css: readFileSync(file, 'utf8') });
  }

  for (const file of walkFiles(srcRoot, (f) => f.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');
    const styleRe = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
    let m;
    while ((m = styleRe.exec(html)) !== null) {
      sources.push({ path: `${file}#<style>`, css: m[1] });
    }
  }

  return sources;
}


// --- CR-002 (bloqueante) ------------------------------------------------------
// Sin estilos en línea en plantillas (style / ngStyle). Los [style.*] bindings
// se permiten (allowBindToStyle) por la excepción de valores dinámicos.
// Enforcement: @angular-eslint/template/no-inline-styles.
check('CR-002', 'bloqueante', `regla de prohibición de estilos en línea en plantillas activa${ruleTag('@angular-eslint/template/no-inline-styles')}`, () => {
  requireRuleSeverity(eslintConfig, '@angular-eslint/template/no-inline-styles', 'error', {
    label: 'ADR-006',
  });
});

// --- CR-003 (bloqueante) ------------------------------------------------------
// Clases CSS propias deben usar @apply con utilidades Tailwind (ver ADR-006).
// Se verifica escaneando hojas .css/.scss y bloques <style> bajo src/.
check('CR-003', 'bloqueante', 'clases CSS propias vía @apply', () => {
  const offenders = [];
  for (const source of collectStyleSources()) {
    const violations = findRawCssClassViolations(source.css);
    if (violations.length === 0) continue;
    const rel = relative(repoRoot, source.path.replace(/#<style>$/, ''));
    const suffix = source.path.endsWith('#<style>') ? ' (<style>)' : '';
    for (const v of violations.slice(0, 5)) {
      offenders.push(`${rel}${suffix}: \`${v.selector}\` → ${v.sample}`);
    }
    if (violations.length > 5) {
      offenders.push(`${rel}${suffix}: … y ${violations.length - 5} más`);
    }
  }
  if (offenders.length > 0) {
    throw new Error(
      `${offenders.length} clase(s) con CSS crudo (deben usar @apply):\n${offenders
        .map((o) => `  - ${o}`)
        .join('\n')}`
    );
  }
});

process.exit(blockingFailures > 0 ? 1 : 0);
