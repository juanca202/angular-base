#!/usr/bin/env node
// =============================================================================
// Fitness functions del estándar Architecture Standards — checks/architecture.mjs
// -----------------------------------------------------------------------------
// UN archivo por ESTÁNDAR (no por criterio): agrupa los chequeos de todos los
// criterios de cumplimiento (CR) automatizables de docs/standards/architecture.md.
// La trazabilidad al criterio se indica en cada chequeo: su referencia CR-XXX (en
// el registro del chequeo y en la línea de salida) y un comentario con el detalle.
//
// El runner (../verify.mjs) descubre este archivo por convención
// (checks/architecture.mjs) y lo ejecuta junto al resto; con
// `node scripts/arch/verify.mjs architecture` se ejecuta solo este estándar.
// =============================================================================
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const STANDARD = 'architecture';
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
let blockingFailures = 0;

/** PascalCase → kebab-case (UserProfile → user-profile). */
function pascalToKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/** Clases `*Manager` en archivos de producción bajo src/app. */
function findManagerClasses() {
  const appRoot = join(repoRoot, 'src/app');
  const results = [];
  for (const file of walkFiles(appRoot, (f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'))) {
    const text = readFileSync(file, 'utf8');
    const re = /\b(?:export\s+)?(?:abstract\s+)?class\s+(\w+Manager)\b/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      results.push({ file, className: m[1], rel: relative(repoRoot, file).replace(/\\/g, '/') });
    }
  }
  return results;
}

/** kebab-case → PascalCase (user-profile → UserProfile). */
function kebabToPascal(name) {
  return name
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/** Ruta de mapper de entidad de feature (ADR-012 / CR-014). */
function isAllowedMapperPath(relPosix) {
  return /^src\/app\/features\/[^/]+\/utils\/[^/]+-mapper\.ts$/.test(relPosix);
}

/**
 * Archivos mapper de producción: `*-mapper.ts` o export `*Mapper`
 * (objeto const/let o class).
 */
function findMapperModules() {
  const appRoot = join(repoRoot, 'src/app');
  const byPath = walkFiles(
    appRoot,
    (f) => /(?:^|[/\\])[\w.-]+-mapper\.ts$/i.test(f) && !f.endsWith('.spec.ts')
  );
  const byExport = walkFiles(appRoot, (f) => f.endsWith('.ts') && !f.endsWith('.spec.ts')).filter(
    (f) => {
      if (byPath.includes(f)) return false;
      const text = readFileSync(f, 'utf8');
      return /\bexport\s+(?:const|let|class)\s+\w+Mapper\b/.test(text);
    }
  );
  return [...new Set([...byPath, ...byExport])].map((file) => {
    const text = readFileSync(file, 'utf8');
    const names = [
      ...text.matchAll(/\bexport\s+(?:const|let|class)\s+(\w+Mapper)\b/g),
    ].map((m) => m[1]);
    return {
      file,
      rel: relative(repoRoot, file).replace(/\\/g, '/'),
      names,
      text,
    };
  });
}

// Registra y ejecuta el chequeo de UN criterio de cumplimiento.
function check(cr, enfoque, descripcion, fn) {
  try {
    fn();
    console.log(`PASS ${STANDARD}/${cr} — ${descripcion}`);
  } catch (err) {
    const status = enfoque === 'warning' ? 'WARN' : 'FAIL';
    if (status === 'FAIL') blockingFailures += 1;
    console.log(`${status} ${STANDARD}/${cr} — ${descripcion}`);
    const detail = err?.stdout?.toString?.() || err?.message || '';
    if (detail) console.log(detail.trim().split('\n').map((l) => `     ${l}`).join('\n'));
  }
}

// Ejecuta un comando acotado; lanza si sale ≠ 0 (eso marca el criterio como violado).
const run = (cmd) => execSync(cmd, { stdio: 'pipe', encoding: 'utf8', cwd: repoRoot });

function walkFiles(dir, predicate, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === 'coverage') continue;
      walkFiles(full, predicate, acc);
    } else if (predicate(full)) {
      acc.push(full);
    }
  }
  return acc;
}

// --- CR-002 (bloqueante) ------------------------------------------------------
// Ningún módulo de src/app/ debe importar (directa o transitivamente) un módulo
// de otra capa en dirección prohibida (ver ADR-001). Se verifica con
// dependency-cruiser; config: .dependency-cruiser.js (raíz del repo).
check('CR-002', 'bloqueante', 'dirección de dependencias entre capas', () => {
  run('npx depcruise --config .dependency-cruiser.js --output-type err src/app');
});

// --- CR-004 (bloqueante) -------------------------------------------------------
// Ningún import relativo debe cruzar de capa sin usar el path alias correspondiente
// (ver ADR-001). Se verifica con la regla ESLint personalizada
// project-rules/require-layer-path-alias (tools/eslint-rules/require-layer-path-alias.js),
// aislando sus violaciones de la salida JSON de ESLint.
check('CR-004', 'bloqueante', 'path alias obligatorio entre capas', () => {
  let output;
  try {
    output = execSync('npx eslint . --format json', {
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: repoRoot,
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch (err) {
    output = err.stdout?.toString?.() ?? '';
  }
  const results = JSON.parse(output || '[]');
  const count = results.reduce(
    (acc, file) =>
      acc + file.messages.filter((m) => m.ruleId === 'project-rules/require-layer-path-alias').length,
    0
  );
  if (count > 0) {
    throw new Error(
      `${count} import(s) relativo(s) cruzan de capa sin usar el path alias correspondiente. Ejecuta 'npx eslint .' para ver el detalle.`
    );
  }
});




// --- CR-009 (bloqueante) ------------------------------------------------------
// URLs REST vía getApiUrl; no hardcodear /api/v1/ (u otro prefijo de versión) en
// callers bajo src/app (ver ADR-010).
check('CR-009', 'bloqueante', 'URLs REST vía getApiUrl (sin prefijo manual)', () => {
  const asyncPath = join(repoRoot, 'src/app/core/utils/async-resources.ts');
  const asyncSrc = readFileSync(asyncPath, 'utf8');
  if (!/apiRestBaseUrl/.test(asyncSrc) || !/export\s+function\s+getApiUrl\b/.test(asyncSrc)) {
    throw new Error('getApiUrl debe basarse en environment.apiRestBaseUrl');
  }

  const appRoot = join(repoRoot, 'src/app');
  const offenders = walkFiles(appRoot, (f) => f.endsWith('.ts') && !f.endsWith('.spec.ts')).filter(
    (f) => {
      // El propio helper puede mencionar el prefijo solo en comentarios; buscamos literales de URL.
      if (f.endsWith(`${join('core', 'utils', 'async-resources.ts')}`)) return false;
      const text = readFileSync(f, 'utf8');
      return /['"`]\/api\/v\d+\//.test(text) || /['"`][^'"`]*\/api\/v\d+\//.test(text);
    }
  );
  if (offenders.length > 0) {
    throw new Error(
      `Prefijo de API hardcodeado (usar getApiUrl):\n${offenders
        .map((p) => `  - ${relative(repoRoot, p)}`)
        .join('\n')}`
    );
  }
});


// --- CR-013 (bloqueante) ------------------------------------------------------
// Clase {Entidad|Flujo}Manager ↔ archivo {entidad|flujo}-manager.ts (ADR-011).
check('CR-013', 'bloqueante', 'nomenclatura Manager (*Manager / *-manager.ts)', () => {
  const managers = findManagerClasses();
  const offenders = [];

  for (const { className, rel, file } of managers) {
    if (!/^[A-Z][A-Za-z0-9]*Manager$/.test(className)) {
      offenders.push(`  - ${rel}: clase "${className}" no sigue {Entidad|Flujo}Manager`);
      continue;
    }
    const entity = className.slice(0, -'Manager'.length);
    if (!entity) {
      offenders.push(`  - ${rel}: clase "Manager" sin prefijo de entidad/flujo`);
      continue;
    }
    const expected = `${pascalToKebab(entity)}-manager.ts`;
    const actual = basename(file);
    if (actual !== expected) {
      offenders.push(`  - ${rel}: clase ${className} exige archivo "${expected}" (actual: "${actual}")`);
    }
  }

  // Archivos *-manager.ts sin clase *Manager exportada/definida (huérfanos de convención).
  const appRoot = join(repoRoot, 'src/app');
  const managerFiles = walkFiles(
    appRoot,
    (f) => /(?:^|[/\\])[\w.-]+-manager\.ts$/i.test(f) && !f.endsWith('.spec.ts')
  );
  for (const file of managerFiles) {
    const rel = relative(repoRoot, file).replace(/\\/g, '/');
    const text = readFileSync(file, 'utf8');
    const names = [...text.matchAll(/\b(?:export\s+)?(?:abstract\s+)?class\s+(\w+Manager)\b/g)].map(
      (m) => m[1]
    );
    if (names.length === 0) {
      offenders.push(`  - ${rel}: archivo *-manager.ts sin clase *Manager`);
      continue;
    }
    const base = basename(file);
    if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*-manager\.ts$/.test(base)) {
      offenders.push(`  - ${rel}: nombre de archivo no es kebab-case *-manager.ts`);
    }
  }

  if (offenders.length > 0) {
    throw new Error(`Nomenclatura Manager incorrecta:\n${[...new Set(offenders)].join('\n')}`);
  }
});

// --- CR-014 (bloqueante) ------------------------------------------------------
// Mappers de entidad de feature en features/{feature}/utils/{entity}-mapper.ts
// (ver ADR-012).
check('CR-014', 'bloqueante', 'ubicación mappers (features/{feature}/utils/*-mapper.ts)', () => {
  const modules = findMapperModules();
  const offenders = modules
    .filter((m) => !isAllowedMapperPath(m.rel))
    .map((m) => {
      const label = m.names.length ? `${m.names.join(', ')} en ` : '';
      return `  - ${label}${m.rel}`;
    });
  if (offenders.length > 0) {
    throw new Error(
      `Mappers fuera de features/{feature}/utils/{entity}-mapper.ts:\n${offenders.join('\n')}`
    );
  }
});

// --- CR-015 (bloqueante) ------------------------------------------------------
// Objeto {Entity}Mapper ↔ archivo {entity}-mapper.ts (ADR-012).
check('CR-015', 'bloqueante', 'nomenclatura Mapper (*Mapper / *-mapper.ts)', () => {
  const modules = findMapperModules();
  const offenders = [];

  for (const { rel, names, file } of modules) {
    const base = basename(file);
    if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*-mapper\.ts$/.test(base)) {
      offenders.push(`  - ${rel}: nombre de archivo no es kebab-case {entity}-mapper.ts`);
      continue;
    }
    const entityKebab = base.replace(/-mapper\.ts$/, '');
    const expectedName = `${kebabToPascal(entityKebab)}Mapper`;

    if (names.length === 0) {
      offenders.push(`  - ${rel}: archivo *-mapper.ts sin export {Entity}Mapper`);
      continue;
    }
    if (!names.includes(expectedName)) {
      offenders.push(
        `  - ${rel}: se espera export "${expectedName}" (encontrado: ${names.join(', ')})`
      );
    }
    for (const name of names) {
      if (!/^[A-Z][A-Za-z0-9]*Mapper$/.test(name)) {
        offenders.push(`  - ${rel}: "${name}" no sigue {Entity}Mapper`);
        continue;
      }
      const entity = name.slice(0, -'Mapper'.length);
      const expectedFile = `${pascalToKebab(entity)}-mapper.ts`;
      if (base !== expectedFile) {
        offenders.push(
          `  - ${rel}: export ${name} exige archivo "${expectedFile}" (actual: "${base}")`
        );
      }
    }
  }

  if (offenders.length > 0) {
    throw new Error(`Nomenclatura Mapper incorrecta:\n${[...new Set(offenders)].join('\n')}`);
  }
});

// --- CR-016 (bloqueante) ------------------------------------------------------
// Mappers sin DI Angular ni I/O (ADR-012).
check('CR-016', 'bloqueante', 'mappers puros (sin inject / DI / I/O)', () => {
  const forbidden = [
    { re: /\binject\s*\(/, label: 'inject()' },
    { re: /@Injectable\b/, label: '@Injectable' },
    { re: /@Service\b/, label: '@Service' },
    { re: /\bHttpClient\b/, label: 'HttpClient' },
    { re: /\blocalStorage\b/, label: 'localStorage' },
    { re: /\bsessionStorage\b/, label: 'sessionStorage' },
    { re: /\bindexedDB\b/, label: 'indexedDB' },
    { re: /\bfetch\s*\(/, label: 'fetch()' },
  ];

  const offenders = [];
  for (const { rel, text } of findMapperModules()) {
    const hits = forbidden.filter((f) => f.re.test(text)).map((f) => f.label);
    if (hits.length > 0) {
      offenders.push(`  - ${rel}: ${hits.join(', ')}`);
    }
  }

  if (offenders.length > 0) {
    throw new Error(
      `Mapper con DI Angular o I/O (debe ser funciones puras):\n${offenders.join('\n')}`
    );
  }
});

process.exit(blockingFailures > 0 ? 1 : 0);
