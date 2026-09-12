/**
 * ESLint rule: project-rules/mapper-naming
 *
 * ADR-012 / architecture CR-015 — el objeto/clase exportado `{Entity}Mapper`
 * debe alinearse con el archivo `{entity}-mapper.ts`.
 */
import { basename } from 'node:path';
import { kebabToPascal, pascalToKebab } from './naming-case.mjs';
import { MAPPER_FILENAME_RE, collectExportedMapperBindings, toPosix } from './mapper-shared.mjs';

const KEBAB_MAPPER_FILE_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*-mapper\.ts$/;
const EXPORT_NAME_RE = /^[A-Z][A-Za-z0-9]*Mapper$/;

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Exported {Entity}Mapper must align with the {entity}-mapper.ts filename (ADR-012).',
    },
    schema: [],
    messages: {
      badFileCasing: 'El nombre de archivo *-mapper.ts debe ser kebab-case ({entity}-mapper.ts).',
      noExport: 'El archivo *-mapper.ts debe exportar "{{expected}}".',
      nameMismatch: 'Se espera exportar "{{expected}}" (encontrado: {{found}}).',
      badExportName: 'La exportación "{{name}}" no sigue el patrón {Entity}Mapper.',
      wrongFileForExport:
        'La exportación {{name}} exige el archivo "{{expectedFile}}" (actual: "{{actual}}").',
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    if (!filename || filename === '<input>') {
      return {};
    }
    const posix = toPosix(filename);
    const isMapperFile = MAPPER_FILENAME_RE.test(posix);

    return {
      'Program:exit'(program) {
        const bindings = collectExportedMapperBindings(program);
        if (!isMapperFile && bindings.length === 0) {
          return;
        }

        const base = basename(filename);
        if (!KEBAB_MAPPER_FILE_RE.test(base)) {
          context.report({ node: program, messageId: 'badFileCasing' });
          return;
        }

        const entityKebab = base.replace(/-mapper\.ts$/, '');
        const expectedName = `${kebabToPascal(entityKebab)}Mapper`;

        if (bindings.length === 0) {
          context.report({ node: program, messageId: 'noExport', data: { expected: expectedName } });
          return;
        }

        const names = bindings.map((b) => b.name);
        if (!names.includes(expectedName)) {
          context.report({
            node: program,
            messageId: 'nameMismatch',
            data: { expected: expectedName, found: names.join(', ') },
          });
        }

        for (const { name, node } of bindings) {
          if (!EXPORT_NAME_RE.test(name)) {
            context.report({ node, messageId: 'badExportName', data: { name } });
            continue;
          }
          const entity = name.slice(0, -'Mapper'.length);
          const expectedFile = `${pascalToKebab(entity)}-mapper.ts`;
          if (base !== expectedFile) {
            context.report({
              node,
              messageId: 'wrongFileForExport',
              data: { name, expectedFile, actual: base },
            });
          }
        }
      },
    };
  },
};

export default rule;
