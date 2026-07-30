/**
 * ESLint rule: project-rules/require-layer-path-alias
 *
 * ADR-001 / architecture CR-004 — los imports relativos no deben cruzar de capa.
 * Entre capas hay que usar los path aliases (@/core, @/shared, @/cross, @/features).
 */
import path from 'node:path';

const LAYERS = ['core', 'shared', 'cross', 'features'];
const APP_SEGMENTS = ['src', 'app'];

/**
 * @param {string} filePath
 * @returns {string | null}
 */
function layerOf(filePath) {
  const normalized = filePath.replaceAll('\\', '/');
  const parts = normalized.split('/');
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (
      parts[i] === APP_SEGMENTS[0] &&
      parts[i + 1] === APP_SEGMENTS[1] &&
      LAYERS.includes(parts[i + 2])
    ) {
      return parts[i + 2];
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
        'Require path aliases when importing across Core/Shared/Cross/Features layers (ADR-001).',
    },
    schema: [],
    messages: {
      useAlias:
        "Import relativo cruza de capa '{{fromLayer}}' → '{{toLayer}}'. Usa el path alias '@/{{toLayer}}' en lugar de una ruta relativa.",
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    if (!filename || filename === '<input>') {
      return {};
    }

    const fromLayer = layerOf(filename);
    if (!fromLayer) {
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
      const toLayer = layerOf(resolved);
      if (!toLayer || toLayer === fromLayer) {
        return;
      }

      context.report({
        node,
        messageId: 'useAlias',
        data: { fromLayer, toLayer },
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
