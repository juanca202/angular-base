#!/usr/bin/env node
// =============================================================================
// Fitness functions del estándar Coding Style Standards — checks/coding-style.mjs
// -----------------------------------------------------------------------------
// UN archivo por ESTÁNDAR (no por criterio): agrupa los chequeos de todos los
// criterios de cumplimiento (CR) automatizables de docs/standards/coding-style.md.
//
// Los CR se delegan en reglas de ESLint (nativas o de project-rules/). `npm run lint` y
// `npm run arch` son compuertas separadas: este archivo NO ejecuta ESLint, solo
// audita que eslint.config.mjs registre la regla en al menos severidad "warn"
// (ver scripts/arch/lib/eslint-config.mjs). Si la regla detecta una violación
// real en el código, eso lo reporta `npm run lint`, no `npm run arch`.
//
// El runner (../verify.mjs) descubre este archivo por convención
// (checks/coding-style.mjs) y lo ejecuta junto al resto; con
// `node scripts/arch/verify.mjs coding-style` se ejecuta solo este estándar.
// =============================================================================
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEslintConfig, requireRuleSeverity, ruleTag } from '../lib/eslint-config.mjs';
import { colorStatus } from '../lib/colors.mjs';

const STANDARD = 'coding-style';
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
    const detail = err?.message || '';
    if (detail) console.log(detail.trim().split('\n').map((l) => `     ${l}`).join('\n'));
  }
}

const eslintConfig = await loadEslintConfig(repoRoot);

// --- CR-001 (warning) ---------------------------------------------------------
// Toda propiedad/método definido por el desarrollador debe declarar su
// modificador de acceso explícito, salvo el constructor y los lifecycle hooks
// de Angular (ver ADR-002). Enforcement: @typescript-eslint/explicit-member-accessibility.
check('CR-001', 'warning', `regla de modificador de acceso explícito en miembros de clase activa${ruleTag('@typescript-eslint/explicit-member-accessibility')}`, () => {
  requireRuleSeverity(eslintConfig, '@typescript-eslint/explicit-member-accessibility', 'warn', {
    label: 'ADR-002',
  });
});

// --- CR-002 (warning) ----------------------------------------------------------
// Las propiedades private que nunca se reasignan fuera del constructor deben
// declararse readonly (ver ADR-002). Enforcement: @typescript-eslint/prefer-readonly.
check('CR-002', 'warning', `regla de uso de readonly en propiedades private inmutables activa${ruleTag('@typescript-eslint/prefer-readonly')}`, () => {
  requireRuleSeverity(eslintConfig, '@typescript-eslint/prefer-readonly', 'warn', {
    label: 'ADR-002',
  });
});

// --- CR-005 (warning) ----------------------------------------------------------
// Los servicios de alcance de aplicación deben declararse con @Service en vez de
// @Injectable({ providedIn: 'root' }) (ver ADR-015). Enforcement:
// project-rules/prefer-service-decorator (scripts/eslint-rules/prefer-service-decorator.mjs).
check('CR-005', 'warning', `regla de decorador @Service para servicios de aplicación activa${ruleTag('project-rules/prefer-service-decorator')}`, () => {
  requireRuleSeverity(eslintConfig, 'project-rules/prefer-service-decorator', 'warn', {
    label: 'ADR-015',
  });
});

process.exit(blockingFailures > 0 ? 1 : 0);
