/**
 * ESLint rule: project-rules/mapper-location
 *
 * ADR-012 / architecture CR-014 — los mappers de entidad de feature deben
 * vivir en `features/{feature}/utils/{entity}-mapper.ts`.
 */
import {
  ALLOWED_MAPPER_PATH_RE,
  MAPPER_FILENAME_RE,
  collectExportedMapperBindings,
  toPosix,
} from './mapper-shared.mjs';

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Feature entity mappers must live in features/{feature}/utils/{entity}-mapper.ts (ADR-012).',
    },
    schema: [],
    messages: {
      misplaced:
        'Los mappers de entidad de feature deben vivir en features/{feature}/utils/{entity}-mapper.ts (actual: "{{actual}}").',
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    if (!filename || filename === '<input>') {
      return {};
    }
    const posix = toPosix(filename);
    if (ALLOWED_MAPPER_PATH_RE.test(posix)) {
      return {};
    }

    const cwd = toPosix(context.cwd ?? context.getCwd?.() ?? '');
    const actual = cwd && posix.startsWith(`${cwd}/`) ? posix.slice(cwd.length + 1) : posix;

    function report(node) {
      context.report({ node, messageId: 'misplaced', data: { actual } });
    }

    if (MAPPER_FILENAME_RE.test(posix)) {
      return {
        'Program:exit': report,
      };
    }

    return {
      'Program:exit'(program) {
        const bindings = collectExportedMapperBindings(program);
        for (const binding of bindings) {
          report(binding.node);
        }
      },
    };
  },
};

export default rule;
