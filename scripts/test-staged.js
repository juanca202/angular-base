#!/usr/bin/env node
/**
 * Ejecuta pruebas unitarias solo para los archivos staged.
 * Recibe la lista de archivos staged (p. ej. desde lint-staged) y:
 * - Si el archivo es un .spec.ts, lo incluye.
 * - Si es un .ts que no es spec, busca el .spec.ts correspondiente y lo incluye si existe.
 * Luego ejecuta ng test --include=... solo para esos specs.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');

function toSpecPath(filePath) {
  if (filePath.endsWith('.spec.ts') || filePath.endsWith('.test.ts')) return filePath;
  if (filePath.endsWith('.ts')) {
    return filePath.replace(/\.ts$/, '.spec.ts');
  }
  return null;
}

function isSpecPath(filePath) {
  return filePath.endsWith('.spec.ts') || filePath.endsWith('.test.ts');
}

// lint-staged pasa los archivos como argumentos
const stagedFiles = process.argv.slice(2).filter(Boolean);
const specPaths = new Set();

for (const file of stagedFiles) {
  const absolutePath = path.isAbsolute(file) ? file : path.resolve(projectRoot, file);
  const relativePath = path.relative(projectRoot, absolutePath);

  if (isSpecPath(relativePath)) {
    specPaths.add(relativePath);
  } else {
    const specPath = toSpecPath(relativePath);
    if (specPath) {
      const specAbsolute = path.resolve(projectRoot, specPath);
      if (fs.existsSync(specAbsolute)) {
        specPaths.add(specPath);
      }
    }
  }
}

if (specPaths.size === 0) {
  process.exit(0);
}

const includeArgs = [...specPaths].flatMap((p) => ['--include', p]);
const cmd = ['npx', 'ng', 'test', '--watch=false', ...includeArgs];

try {
  execSync(cmd.join(' '), {
    stdio: 'inherit',
    cwd: projectRoot,
    shell: true
  });
} catch (err) {
  process.exit(err.status ?? 1);
}
