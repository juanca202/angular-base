// Learn more about Vitest configuration options at https://vitest.dev/config/

import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [
    // Resolves TypeScript paths (@/*, @/core/*, etc.)
    tsconfigPaths({
      root: path.resolve(__dirname)
    })
  ],
  test: {
    // Enable globals (describe, it, expect, etc.) without needing to import them
    globals: true,
    // DOM environment for Angular component unit tests
    environment: 'jsdom',
    // Exclude files (Angular CLI handles test file detection)
    exclude: ['node_modules', 'dist', '.angular'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/**/*.config.ts',
        'src/main.ts'
      ]
    },
    // Configuration to improve Angular compatibility
    setupFiles: [],
    // Test timeout
    testTimeout: 10000,
    // Hook configuration
    hookTimeout: 10000
  },
  // Resolve file extensions and aliases
  // IMPORTANT: More specific aliases must come before generic ones
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '@/core': path.resolve(__dirname, 'src/app/core'),
      '@/shared': path.resolve(__dirname, 'src/app/shared'),
      '@/cross': path.resolve(__dirname, 'src/app/cross'),
      '@/features': path.resolve(__dirname, 'src/app/features'),
      '@/environments': path.resolve(__dirname, 'src/environments'),
      '@/version-info': path.resolve(__dirname, 'src/version-info'),
      '@/test': path.resolve(__dirname, 'test'),
      '@': path.resolve(__dirname, 'src/app')
    }
  }
});
