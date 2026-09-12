/**
 * ESLint rule: project-rules/require-layer-path-alias
 *
 * ADR-001 / architecture CR-004 — todo import relativo cuyo destino sea
 * alcanzable mediante un path alias configurado en tsconfig.json (`@/core`,
 * `@/shared`, `@/features`, `@/environments`, `@/version-info`, `@/test`)
 * DEBE usar ese alias, sea o no cruce de capa.
 *
 * Los alias se leen de tsconfig.json en vez de hardcodearse, para que la
 * regla no se desincronice si el mapa de paths cambia.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** @typedef {{ alias: string, dir: string, wildcard: boolean }} AliasEntry */

/** Lee `compilerOptions.paths` de tsconfig.json y las resuelve a rutas absolutas. */
function loadAliasTable() {
  const tsconfigPath = path.join(repoRoot, 'tsconfig.json');
  let tsconfig;
  try {
    // tsconfig.json admite comentarios; para esta lectura simple basta con
    // despojarlos antes de parsear (no hay comentarios de bloque anidados aquí).
    const raw = readFileSync(tsconfigPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    tsconfig = JSON.parse(raw);
  } catch {
    return [];
  }

  const paths = tsconfig.compilerOptions?.paths ?? {};
  /** @type {AliasEntry[]} */
  const entries = [];
  for (const [alias, targets] of Object.entries(paths)) {
    const target = targets[0];
    if (!target) continue;
    const wildcard = alias.endsWith('/*');
    const aliasBase = wildcard ? alias.slice(0, -2) : alias;
    const targetBase = wildcard ? target.slice(0, -2) : target;
    entries.push({
      alias: aliasBase,
      dir: path.resolve(repoRoot, targetBase),
      wildcard,
    });
  }
  // Los más específicos (rutas más largas) primero, por si algún día se anidan.
  return entries.sort((a, b) => b.dir.length - a.dir.length);
}

const ALIAS_TABLE = loadAliasTable();

/**
 * @param {string} absolutePath
 * @returns {string | null} el import con alias equivalente, o null si `absolutePath`
 *   no cae bajo ningún alias configurado.
 */
function toAliasImport(absolutePath) {
  const normalized = absolutePath.replaceAll('\\', '/');
  for (const { alias, dir, wildcard } of ALIAS_TABLE) {
    const dirNormalized = dir.replaceAll('\\', '/');
    if (normalized === dirNormalized) {
      return alias;
    }
    if (wildcard && normalized.startsWith(`${dirNormalized}/`)) {
      return `${alias}${normalized.slice(dirNormalized.length)}`;
    }
  }
  return null;
}

/**
 * @param {string} fromFile
 * @param {string} importSource
 * @returns {string}
 */
function resolveImport(fromFile, importSource) {
  const fromDir = path.dirname(fromFile);
  return path.resolve(fromDir, importSource);
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require the configured path alias instead of a relative import whenever one resolves the same target (ADR-001).',
    },
    schema: [],
    messages: {
      useAlias:
        "Import relativo '{{source}}' resuelve a un destino con alias configurado. Usa '{{aliasImport}}' en vez de la ruta relativa.",
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    if (!filename || filename === '<input>' || ALIAS_TABLE.length === 0) {
      return {};
    }

    /**
     * @param {import('estree').Node} node
     * @param {string | undefined} sourceValue
     */
    function checkSource(node, sourceValue) {
      if (!sourceValue || (!sourceValue.startsWith('./') && !sourceValue.startsWith('../'))) {
        return;
      }

      const resolved = resolveImport(filename, sourceValue);
      const aliasImport = toAliasImport(resolved);
      if (!aliasImport) {
        return;
      }

      context.report({
        node,
        messageId: 'useAlias',
        data: { source: sourceValue, aliasImport },
      });
    }

    return {
      ImportDeclaration(node) {
        if (node.source?.type === 'Literal' && typeof node.source.value === 'string') {
          checkSource(node.source, node.source.value);
        }
      },
      ExportNamedDeclaration(node) {
        if (node.source?.type === 'Literal' && typeof node.source.value === 'string') {
          checkSource(node.source, node.source.value);
        }
      },
      ExportAllDeclaration(node) {
        if (node.source?.type === 'Literal' && typeof node.source.value === 'string') {
          checkSource(node.source, node.source.value);
        }
      },
      CallExpression(node) {
        if (
          node.callee.type === 'Import' &&
          node.arguments[0]?.type === 'Literal' &&
          typeof node.arguments[0].value === 'string'
        ) {
          checkSource(node.arguments[0], node.arguments[0].value);
        }
      },
    };
  },
};

export default rule;
