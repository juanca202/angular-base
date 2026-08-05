#!/usr/bin/env node
// =============================================================================
// Fitness functions del estándar Coding Style Standards — checks/coding-style.mjs
// -----------------------------------------------------------------------------
// UN archivo por ESTÁNDAR (no por criterio): agrupa los chequeos de todos los
// criterios de cumplimiento (CR) automatizables de docs/standards/coding-style.md.
//
// El runner (../verify.mjs) descubre este archivo por convención
// (checks/coding-style.mjs) y lo ejecuta junto al resto; con
// `node scripts/arch/verify.mjs coding-style` se ejecuta solo este estándar.
// =============================================================================
import { execSync } from 'node:child_process';

const STANDARD = 'coding-style';
let blockingFailures = 0;

// Registra y ejecuta el chequeo de UN criterio de cumplimiento.
function check(cr, enfoque, descripcion, fn) {
  try {
    fn();
    console.log(`PASS ${STANDARD}/${cr} — ${descripcion}`);
  } catch (err) {
    const status = enfoque === 'warning' ? 'WARN' : 'FAIL';
    if (status === 'FAIL') blockingFailures += 1;
    console.log(`${status} ${STANDARD}/${cr} — ${descripcion}`);
    const detail = err?.message || '';
    if (detail) console.log(detail.trim().split('\n').map((l) => `     ${l}`).join('\n'));
  }
}

// Una sola ejecución de ESLint, reutilizada por los dos CR de este estándar.
let eslintResults = [];
try {
  const output = execSync('npx eslint . --format json', {
    stdio: 'pipe',
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  eslintResults = JSON.parse(output || '[]');
} catch (err) {
  eslintResults = JSON.parse(err.stdout?.toString?.() || '[]');
}

const countByRule = (ruleId) =>
  eslintResults.reduce(
    (acc, file) => acc + file.messages.filter((m) => m.ruleId === ruleId).length,
    0
  );

// --- CR-001 (warning) ---------------------------------------------------------
// Toda propiedad/método definido por el desarrollador debe declarar su
// modificador de acceso explícito, salvo el constructor y los lifecycle hooks
// de Angular (ver ADR-002). Se verifica con
// @typescript-eslint/explicit-member-accessibility.
check('CR-001', 'warning', 'modificador de acceso explícito en miembros de clase', () => {
  const count = countByRule('@typescript-eslint/explicit-member-accessibility');
  if (count > 0) {
    throw new Error(
      `${count} miembro(s) de clase sin modificador de acceso explícito. Ejecuta 'npx eslint .' para ver el detalle.`
    );
  }
});

// --- CR-002 (warning) ----------------------------------------------------------
// Las propiedades private que nunca se reasignan fuera del constructor deben
// declararse readonly (ver ADR-002). Se verifica con
// @typescript-eslint/prefer-readonly.
check('CR-002', 'warning', 'uso de readonly en propiedades private inmutables', () => {
  const count = countByRule('@typescript-eslint/prefer-readonly');
  if (count > 0) {
    throw new Error(
      `${count} propiedad(es) private podrían declararse readonly. Ejecuta 'npx eslint .' para ver el detalle.`
    );
  }
});

process.exit(blockingFailures > 0 ? 1 : 0);
