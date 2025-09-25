// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const angular = require('@angular-eslint/eslint-plugin');

module.exports = [
  // Configuración global de ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/.angular/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.json',
      '**/angular.json',
      '**/tsconfig*.json',
      '**/jest.config.ts',
      '**/eslint.config.js',
      '**/generate-i18n.js',
      '**/git-version.js',
      '**/setup-jest.ts',
      '**/*.html',
      '**/*.scss',
      '**/*.css',
      '**/*.js',
      '**/*.mjs',
      '**/firebase-messaging-sw.js',
      '**/sw-custom.js',
    ],
  },

  // Configuración base
  eslint.configs.recommended,

  // Configuración para archivos TypeScript (excluyendo archivos de prueba)
  {
    files: ['src/**/*.ts'],
    ignores: [
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/node_modules/**',
      '**/.angular/**',
      '**/dist/**',
      '**/build/**',
      '**/tsconfig*.json',
      '**/package.json',
      '**/angular.json',
      '**/jest.config.ts',
      '**/eslint.config.js',
      '**/generate-i18n.js',
      '**/git-version.js',
      '**/setup-jest.ts',
    ],
    plugins: {
      '@typescript-eslint': tseslint,
      '@angular-eslint': angular,
    },
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Variables globales de Angular
        $localize: 'readonly',
        ngDevMode: 'readonly',
        // Variables del navegador
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        history: 'readonly',
        performance: 'readonly',
        crypto: 'readonly',
        fetch: 'readonly',
        HTMLElement: 'readonly',
        Node: 'readonly',
        DocumentFragment: 'readonly',
        URL: 'readonly',
        XMLHttpRequest: 'readonly',
        AbortController: 'readonly',
        PaymentRequest: 'readonly',
        CredentialRequestOptions: 'readonly',
        sessionStorage: 'readonly',
        localStorage: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      'no-undef': 'off', // TypeScript maneja esto
      'no-unused-vars': 'off', // Usamos la regla de TypeScript
    },
  },

  // Configuración para archivos de prueba
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      // Reglas específicas para tests (opcional)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
