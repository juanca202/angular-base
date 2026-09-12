/**
 * ESLint rule: project-rules/manager-naming
 *
 * ADR-011 / architecture CR-013 — las clases Manager deben nombrarse
 * `{Entidad|Flujo}Manager` y vivir en el archivo `{entidad|flujo}-manager.ts`.
 */
import path from 'node:path';
import { pascalToKebab } from './naming-case.mjs';

const FILE_RE = /-manager\.ts$/i;
const KEBAB_FILE_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*-manager\.ts$/;
const CLASS_NAME_RE = /^[A-Z][A-Za-z0-9]*Manager$/;

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Manager classes must be named {Entity|Flow}Manager and live in {entity|flow}-manager.ts (ADR-011).',
    },
    schema: [],
    messages: {
      badClassName: 'La clase "{{name}}" no sigue el patrón {Entidad|Flujo}Manager.',
      emptyEntity: 'La clase "Manager" necesita un prefijo de entidad/flujo (p. ej. "UserManager").',
      wrongFile: 'La clase {{name}} exige el archivo "{{expected}}" (actual: "{{actual}}").',
      orphanFile: 'El archivo *-manager.ts debe exportar una clase {Entidad|Flujo}Manager.',
      badFileCasing: 'El nombre de archivo *-manager.ts debe ser kebab-case.',
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    if (!filename || filename === '<input>') {
      return {};
    }
    const base = path.basename(filename);
    let foundManagerClass = false;

    /** @param {import('estree').ClassDeclaration | import('estree').ClassExpression} node */
    function checkClass(node) {
      const name = node.id?.name;
      if (!name || !name.endsWith('Manager')) {
        return;
      }
      foundManagerClass = true;

      if (!CLASS_NAME_RE.test(name)) {
        context.report({ node: node.id, messageId: 'badClassName', data: { name } });
        return;
      }

      const entity = name.slice(0, -'Manager'.length);
      if (!entity) {
        context.report({ node: node.id, messageId: 'emptyEntity' });
        return;
      }

      const expected = `${pascalToKebab(entity)}-manager.ts`;
      if (base !== expected) {
        context.report({
          node: node.id,
          messageId: 'wrongFile',
          data: { name, expected, actual: base },
        });
      }
    }

    return {
      ClassDeclaration: checkClass,
      ClassExpression: checkClass,
      'Program:exit'(node) {
        if (!FILE_RE.test(base)) {
          return;
        }
        if (!KEBAB_FILE_RE.test(base)) {
          context.report({ node, messageId: 'badFileCasing' });
        }
        if (!foundManagerClass) {
          context.report({ node, messageId: 'orphanFile' });
        }
      },
    };
  },
};

export default rule;
