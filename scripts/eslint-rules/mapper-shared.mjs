/**
 * Utilidades compartidas por project-rules/mapper-location y
 * project-rules/mapper-naming (ADR-012 / architecture CR-014, CR-015).
 */

export const ALLOWED_MAPPER_PATH_RE = /(^|\/)src\/app\/features\/[^/]+\/utils\/[^/]+-mapper\.ts$/;
export const MAPPER_FILENAME_RE = /(?:^|\/)[\w.-]+-mapper\.ts$/i;

export function toPosix(filePath) {
  return filePath.replaceAll('\\', '/');
}

/**
 * Nombres exportados `const|let|class NombreMapper` en el `Program` dado.
 * @param {import('estree').Program} program
 * @returns {{ name: string, node: import('estree').Node }[]}
 */
export function collectExportedMapperBindings(program) {
  const bindings = [];
  for (const node of program.body) {
    if (node.type !== 'ExportNamedDeclaration' || !node.declaration) {
      continue;
    }
    const decl = node.declaration;
    if (decl.type === 'VariableDeclaration') {
      for (const declarator of decl.declarations) {
        if (declarator.id?.type === 'Identifier' && declarator.id.name.endsWith('Mapper')) {
          bindings.push({ name: declarator.id.name, node: declarator.id });
        }
      }
    } else if (decl.type === 'ClassDeclaration' && decl.id?.name.endsWith('Mapper')) {
      bindings.push({ name: decl.id.name, node: decl.id });
    }
  }
  return bindings;
}
