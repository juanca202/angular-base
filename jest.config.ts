/* eslint-disable */
import type { Config } from 'jest';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createCjsPreset } = require('jest-preset-angular/presets');

const cjsPreset = createCjsPreset({
  tsconfig: '<rootDir>/tsconfig.spec.json',
});

const config: Config = {
  ...cjsPreset,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['**/__tests__/**/*.spec.ts', '**/?(*.)+(spec).ts'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    ...cjsPreset.moduleNameMapper,
    '^app/(.*)$': '<rootDir>/src/app/$1',
    '^environments/(.*)$': '<rootDir>/src/environments/$1',
    '^version-info$': '<rootDir>/src/version-info.ts',
    '^@factor_ec/ui$': '<rootDir>/test/mocks/factor-ui.ts',
    '^@factor_ec/utils$': '<rootDir>/test/mocks/factor-utils.ts',
    '^apollo-angular$': '<rootDir>/test/mocks/apollo-angular.ts',
    '^@sentry/angular$': '<rootDir>/test/mocks/sentry-angular.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!jest-preset-angular|@angular|tslib|@factor_ec|apollo-angular|d3|@sentry)',
  ],
  transform: {
    ...cjsPreset.transform,
    '^.+\\.(mjs|js)$': 'babel-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/out-tsc/'],
  collectCoverage: true,
  coverageReporters: ['html', 'text', 'lcov'],
  coverageDirectory: '<rootDir>/coverage',
};

export default config;
