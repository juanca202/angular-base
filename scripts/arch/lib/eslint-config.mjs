/**
 * Auditoría estática de eslint.config.mjs para las fitness functions de arch/.
 *
 * `npm run lint` (ESLint) y `npm run arch` son compuertas separadas: arch NO
 * ejecuta ESLint para buscar violaciones actuales (eso es responsabilidad del
 * gate de lint). Lo que arch verifica es que la regla que un CR delega en
 * ESLint esté realmente registrada y en la severidad esperada — igual que
 * CR-005 (testing) audita el umbral de cobertura en angular.json sin volver a
 * correr la suite, o CR-003 (devops) audita el hook de Husky sin simular un
 * commit real.
 */
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const SEVERITY_ORDER = { off: 0, warn: 1, error: 2 };

function normalizeSeverity(entry) {
  const raw = Array.isArray(entry) ? entry[0] : entry;
  if (raw === 'error' || raw === 2) return 'error';
  if (raw === 'warn' || raw === 1) return 'warn';
  return 'off';
}

/** Importa el array de bloques resuelto por `defineConfig(...)` en eslint.config.mjs. */
export async function loadEslintConfig(repoRoot) {
  const mod = await import(pathToFileURL(join(repoRoot, 'eslint.config.mjs')).href);
  return mod.default;
}

/**
 * Bloques del config plano que declaran `ruleId`, con severidad normalizada y
 * las opciones crudas de la regla (para inspeccionar selectors/mensajes).
 */
export function findRuleBlocks(config, ruleId) {
  return config
    .filter((block) => block?.rules && Object.prototype.hasOwnProperty.call(block.rules, ruleId))
    .map((block) => {
      const entry = block.rules[ruleId];
      return {
        files: block.files ?? null,
        ignores: block.ignores ?? null,
        severity: normalizeSeverity(entry),
        options: Array.isArray(entry) ? entry.slice(1) : [],
      };
    });
}

/**
 * Exige que `ruleId` esté registrada con severidad >= `minSeverity` en algún
 * bloque (opcionalmente, que ese bloque mencione `contains` en sus opciones,
 * para distinguir entre varias entradas de una regla genérica como
 * no-restricted-syntax). Lanza si ningún bloque cumple.
 */
/**
 * Sufijo `[regla ESLint: ...]` para anexar a la descripción de un `check()` que
 * delega en ESLint — así la línea de protocolo de `npm run arch` deja claro qué
 * regla audita, sin tener que abrir el archivo de checks para saberlo.
 */
export function ruleTag(...ruleIds) {
  const label = ruleIds.length > 1 ? 'reglas ESLint' : 'regla ESLint';
  return ` [${label}: ${ruleIds.join(', ')}]`;
}

export function requireRuleSeverity(config, ruleId, minSeverity, { contains, label } = {}) {
  const blocks = findRuleBlocks(config, ruleId);
  const matching = contains
    ? blocks.filter((b) => JSON.stringify(b.options).includes(contains))
    : blocks;
  const ok = matching.some((b) => SEVERITY_ORDER[b.severity] >= SEVERITY_ORDER[minSeverity]);
  if (!ok) {
    const scope = contains ? ` (entrada relacionada con "${contains}")` : '';
    const suffix = label ? ` — ${label}` : '';
    throw new Error(
      `eslint.config.mjs: "${ruleId}" debe estar registrada con severidad >= "${minSeverity}"${scope}${suffix}.`
    );
  }
  return matching;
}
