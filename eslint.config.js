// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const angular = require('@angular-eslint/eslint-plugin');
const angularTemplate = require('@angular-eslint/eslint-plugin-template');

const projectRules = {
  rules: {
    'enforce-layer-imports': require('./tools/eslint-rules/enforce-layer-imports')
  }
};

const projectTemplateRules = {
  rules: {
    'no-ngclass': require('./tools/eslint-rules/no-ngclass')
  }
};

module.exports = [
  // Global ignore configuration
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
      '**/vitest-base.config.ts',
      '**/eslint.config.js',
      '**/generate-i18n.js',
      '**/git-version.js',
      '**/*.css',
      '**/*.js',
      '**/*.mjs',
      '**/firebase-messaging-sw.js',
      '**/sw-custom.js'
    ]
  },

  // Configuration for Angular templates
  {
    files: ['src/app/**/*.html'],
    plugins: {
      '@angular-eslint/template': angularTemplate,
      'project-template-rules': projectTemplateRules
    },
    languageOptions: {
      parser: require('@angular-eslint/template-parser')
    },
    rules: {
      '@angular-eslint/template/i18n': [
        'error',
        {
          checkId: false,
          checkText: true,
          checkAttributes: false
        }
      ],
      '@angular-eslint/template/prefer-control-flow': 'error',
      'project-template-rules/no-ngclass': 'error'
    }
  },

  // Base configuration
  eslint.configs.recommended,

  // Configuration for TypeScript files (excluding test files)
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
      '**/vitest.config.ts',
      '**/eslint.config.js',
      '**/generate-i18n.js',
      '**/git-version.js',
      '**/setup-vitest.ts'
    ],
    plugins: {
      '@typescript-eslint': tseslint,
      '@angular-eslint': angular,
      'project-rules': projectRules
    },
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.app.json', './tsconfig.spec.json'],
        tsconfigRootDir: __dirname
      },
      globals: {
        // Angular global variables
        $localize: 'readonly',
        ngDevMode: 'readonly',
        // Browser globals
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
        localStorage: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            accessors: 'explicit',
            constructors: 'no-public',
            methods: 'explicit',
            properties: 'explicit',
            parameterProperties: 'explicit'
          },
          ignoredMethodNames: [
            'ngOnInit',
            'ngOnChanges',
            'ngOnDestroy',
            'ngAfterViewInit',
            'ngAfterViewChecked',
            'ngAfterContentInit',
            'ngAfterContentChecked'
          ]
        }
      ],
      '@typescript-eslint/prefer-readonly': ['error', { onlyInlineLambdas: false }],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase'
        }
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case'
        }
      ],
      'project-rules/enforce-layer-imports': [
        'error',
        {
          crossLayerPackages: ['auth-msal']
        }
      ],
      'no-undef': 'off', // TypeScript handles this
      'no-unused-vars': 'off' // Use TypeScript rule instead
    }
  },

  // Configuration for test files
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    plugins: {
      '@typescript-eslint': tseslint
    },
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        Event: 'readonly',
        ErrorEvent: 'readonly',
        // Browser globals for testing
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
        globalThis: 'readonly'
      }
    },
    rules: {
      // Test-specific rules (optional)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off' // Use TypeScript rule instead
    }
  }
];
