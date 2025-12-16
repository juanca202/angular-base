import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import path from 'path';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup-vitest.ts'],
    include: ['**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'out-tsc/',
        'test/',
        'coverage/',
        '.angular/',
        'build/',
        'vitest.config.ts',
        'setup-vitest.ts',
        'generate-i18n.js',
        'git-version.js'
      ]
    }
  },
  resolve: {
    alias: [
      { find: /^src\/(.*)$/, replacement: path.resolve(__dirname, './src/$1') },
      { find: /^app\/(.*)$/, replacement: path.resolve(__dirname, './src/app/$1') },
      { find: /^environments\/(.*)$/, replacement: path.resolve(__dirname, './src/environments/$1') },
      { find: /^@\/environments\/(.*)$/, replacement: path.resolve(__dirname, './src/environments/$1') },
      { find: /^@\/version-info$/, replacement: path.resolve(__dirname, './test/mocks/version-info.ts') },
      { find: /^@\/test\/(.*)$/, replacement: path.resolve(__dirname, './test/$1') },
      { find: /^@\/(.*)$/, replacement: path.resolve(__dirname, './src/app/$1') },
      { find: /^version-info$/, replacement: path.resolve(__dirname, './test/mocks/version-info.ts') },
      { find: /^@factor_ec\/ui$/, replacement: path.resolve(__dirname, './test/mocks/factor-ui.ts') },
      { find: /^@factor_ec\/utils$/, replacement: path.resolve(__dirname, './test/mocks/factor-utils.ts') },
      { find: /^apollo-angular$/, replacement: path.resolve(__dirname, './test/mocks/apollo-angular.ts') },
      { find: /^@sentry\/angular$/, replacement: path.resolve(__dirname, './test/mocks/sentry-angular.ts') }
    ]
  }
});
