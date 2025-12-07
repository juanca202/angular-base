/* eslint-disable */
import type { Config } from 'jest';
// Use dynamic import to load CommonJS module
// eslint-disable-next-line @typescript-eslint/no-var-requires
const presets = require('jest-preset-angular/build/presets/index.js');
const { createCjsPreset } = presets as { createCjsPreset: (opts?: Record<string, unknown>) => any };

const cjsPreset: any = createCjsPreset({
  tsconfig: '<rootDir>/tsconfig.spec.json'
});

const config: Config = {
  ...cjsPreset,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['**/__tests__/**/*.spec.ts', '**/?(*.)+(spec).ts'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^app/(.*)$': '<rootDir>/src/app/$1',
    '^environments/(.*)$': '<rootDir>/src/environments/$1',
    '^@/environments/(.*)$': '<rootDir>/src/environments/$1',
    '^@/version-info$': '<rootDir>/test/mocks/version-info.ts',
    '^@/(.*)$': '<rootDir>/src/app/$1',
    '^version-info$': '<rootDir>/test/mocks/version-info.ts',
    '^@factor_ec/ui$': '<rootDir>/test/mocks/factor-ui.ts',
    '^@factor_ec/utils$': '<rootDir>/test/mocks/factor-utils.ts',
    '^apollo-angular$': '<rootDir>/test/mocks/apollo-angular.ts',
    '^@sentry/angular$': '<rootDir>/test/mocks/sentry-angular.ts'
  },
  transformIgnorePatterns: [
    'node_modules/(?!jest-preset-angular|@angular|tslib|@factor_ec|apollo-angular|d3|@sentry)'
  ],
  transform: {
    ...cjsPreset.transform,
    '^.+\\.(mjs|js)$': 'babel-jest'
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/out-tsc/', '/test/mocks/'],
  collectCoverage: true,
  coverageReporters: ['html', 'text', 'lcov'],
  coverageDirectory: '<rootDir>/coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/out-tsc/',
    '/test/',
    '/coverage/',
    '/.angular/',
    '/build/',
    'jest.config.ts',
    'setup-jest.ts',
    'generate-i18n.js',
    'git-version.js'
  ]
};

export default config;
