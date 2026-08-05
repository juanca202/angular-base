// @ts-check
import js from '@eslint/js';
import angular from 'angular-eslint';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import requireLayerPathAlias from './tools/eslint-rules/require-layer-path-alias.mjs';

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
      'tools/**',
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
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'project-rules': {
        rules: {
          'require-layer-path-alias': requireLayerPathAlias,
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
