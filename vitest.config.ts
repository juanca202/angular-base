import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.spec.ts',
        '**/*.config.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/app'),
      '@/core': resolve(__dirname, './src/app/core'),
      '@/shared': resolve(__dirname, './src/app/shared'),
      '@/cross': resolve(__dirname, './src/app/cross'),
      '@/features': resolve(__dirname, './src/app/features'),
      '@/environments/environment': resolve(__dirname, './src/environments/environment.ts'),
      '@/environments': resolve(__dirname, './src/environments'),
      '@/version-info': resolve(__dirname, './src/version-info.ts'),
      '@/test': resolve(__dirname, './test')
    }
  }
});

