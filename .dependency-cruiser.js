/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ADR-001 / architecture CR-002 — dirección de dependencias entre capas
    {
      name: 'no-core-to-shared',
      comment: 'Core no debe depender de Shared (ADR-001).',
      severity: 'error',
      from: { path: '^src/app/core' },
      to: { path: '^src/app/shared' },
    },
    {
      name: 'no-core-to-cross',
      comment: 'Core no debe depender de Cross (ADR-001).',
      severity: 'error',
      from: { path: '^src/app/core' },
      to: { path: '^src/app/cross' },
    },
    {
      name: 'no-core-to-features',
      comment: 'Core no debe depender de Features (ADR-001).',
      severity: 'error',
      from: { path: '^src/app/core' },
      to: { path: '^src/app/features' },
    },
    {
      name: 'no-shared-to-features',
      comment: 'Shared no debe depender de Features (ADR-001).',
      severity: 'error',
      from: { path: '^src/app/shared' },
      to: { path: '^src/app/features' },
    },
    {
      name: 'no-cross-to-shared',
      comment: 'Cross no debe depender de Shared (ADR-001).',
      severity: 'error',
      from: { path: '^src/app/cross' },
      to: { path: '^src/app/shared' },
    },
    {
      name: 'no-cross-to-features',
      comment: 'Cross no debe depender de Features (ADR-001).',
      severity: 'error',
      from: { path: '^src/app/cross' },
      to: { path: '^src/app/features' },
    },
    {
      name: 'no-feature-to-feature',
      comment:
        'Una Feature no debe importar otra Feature; usar contracts en shared/contracts (ADR-001).',
      severity: 'error',
      from: { path: '^src/app/features/([^/]+)' },
      to: {
        path: '^src/app/features/([^/]+)',
        pathNot: '^src/app/features/$1',
      },
    },
    // ADR-009 / architecture CR-006 — Core no acopla a la UI concreta, salvo el puente
    // AppManager y shells de error designados que concentran MessageService / Icon.
    {
      name: 'no-core-to-factor-ec-ui',
      comment:
        'Core no debe importar @factor_ec/ui salvo AppManager (puente notify) y el shell de error (ADR-009).',
      severity: 'error',
      from: {
        path: '^src/app/core',
        pathNot:
          '^src/app/core/services/app-manager\\.ts$|^src/app/core/components/error/error\\.ts$',
      },
      to: { path: '(^|/)@factor_ec/ui|/node_modules/@factor_ec/ui' },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.app.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
    },
  },
};
