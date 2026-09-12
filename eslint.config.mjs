// @ts-check
import js from '@eslint/js';
import angular from 'angular-eslint';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import requireLayerPathAlias from './scripts/eslint-rules/require-layer-path-alias.mjs';
import managerNaming from './scripts/eslint-rules/manager-naming.mjs';
import mapperLocation from './scripts/eslint-rules/mapper-location.mjs';
import mapperNaming from './scripts/eslint-rules/mapper-naming.mjs';
import preferServiceDecorator from './scripts/eslint-rules/prefer-service-decorator.mjs';

const ANGULAR_LIFECYCLE_HOOKS = [
  'ngOnChanges',
  'ngOnInit',
  'ngDoCheck',
  'ngAfterContentInit',
  'ngAfterContentChecked',
  'ngAfterViewInit',
  'ngAfterViewChecked',
  'ngOnDestroy',
];

export default defineConfig(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'scripts/**',
      'e2e/**',
      'playwright-report/**',
      'test-results/**',
      '.angular/**',
      '*.js',
      '!eslint.config.mjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    ignores: ['playwright.config.ts'],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['playwright.config.ts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'project-rules': {
        rules: {
          'require-layer-path-alias': requireLayerPathAlias,
          'manager-naming': managerNaming,
          'mapper-location': mapperLocation,
          'mapper-naming': mapperNaming,
          'prefer-service-decorator': preferServiceDecorator,
        },
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      // ADR-002 / coding-style CR-001
      '@typescript-eslint/explicit-member-accessibility': [
        'warn',
        {
          accessibility: 'explicit',
          overrides: {
            constructors: 'no-public',
          },
          ignoredMethodNames: ANGULAR_LIFECYCLE_HOOKS,
        },
      ],
      // ADR-002 / coding-style CR-002 (requiere type info)
      '@typescript-eslint/prefer-readonly': 'warn',
      // ADR-001 / architecture CR-004
      'project-rules/require-layer-path-alias': 'error',
      // ADR-005 / testing CR-008 — las specs Playwright deben vivir bajo e2e/
      // (e2e/ está fuera del alcance de este bloque, ver `ignores` global)
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              message: 'Las pruebas Playwright deben vivir bajo e2e/ (ADR-005).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      // ADR-011 / architecture CR-013
      'project-rules/manager-naming': 'error',
      // ADR-012 / architecture CR-014
      'project-rules/mapper-location': 'error',
      // ADR-012 / architecture CR-015
      'project-rules/mapper-naming': 'error',
    },
  },
  {
    // ADR-010 / architecture CR-009 — sin prefijo de versión de API hardcodeado
    files: ['src/app/**/*.ts'],
    ignores: ['**/*.spec.ts', 'src/app/core/utils/async-resources.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/\\/api\\/v\\d+\\//]',
          message: 'No hardcodees el prefijo de versión de la API (/api/vN/); usa getApiUrl() (ADR-010).',
        },
        {
          selector: 'TemplateElement[value.raw=/\\/api\\/v\\d+\\//]',
          message: 'No hardcodees el prefijo de versión de la API (/api/vN/); usa getApiUrl() (ADR-010).',
        },
      ],
    },
  },
  {
    // ADR-015 / coding-style CR-005 — @Service en vez de @Injectable({ providedIn: 'root' })
    files: ['src/app/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'project-rules/prefer-service-decorator': 'warn',
    },
  },
  {
    // ADR-012 / architecture CR-016 — mappers puros, sin DI de Angular ni I/O
    files: ['src/app/**/*-mapper.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'localStorage', message: 'Los mappers deben ser funciones puras (ADR-012): sin I/O.' },
        { name: 'sessionStorage', message: 'Los mappers deben ser funciones puras (ADR-012): sin I/O.' },
        { name: 'indexedDB', message: 'Los mappers deben ser funciones puras (ADR-012): sin I/O.' },
        { name: 'fetch', message: 'Los mappers deben ser funciones puras (ADR-012): sin I/O.' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='inject']",
          message: 'Los mappers no deben usar inject() (ADR-012): sin DI de Angular.',
        },
        {
          selector: 'Decorator > CallExpression[callee.name=/^(Injectable|Service)$/]',
          message: 'Los mappers no deben llevar @Injectable/@Service (ADR-012): no son servicios con DI.',
        },
        {
          selector: 'Decorator > Identifier[name=/^(Injectable|Service)$/]',
          message: 'Los mappers no deben llevar @Injectable/@Service (ADR-012): no son servicios con DI.',
        },
        {
          selector: "ImportSpecifier[imported.name='HttpClient']",
          message: 'Los mappers no deben depender de HttpClient (ADR-012): sin I/O de red.',
        },
        {
          selector: "Identifier[name='HttpClient']:not(ImportDeclaration *)",
          message: 'Los mappers no deben depender de HttpClient (ADR-012): sin I/O de red.',
        },
      ],
    },
  },
  // ADR-006 / frontend CR-002 — plantillas Angular
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
    rules: {
      '@angular-eslint/template/no-inline-styles': [
        'error',
        {
          // Excepción del estándar: valores dinámicos vía style binding
          allowBindToStyle: true,
          allowNgStyle: false,
        },
      ],
    },
  },
);
