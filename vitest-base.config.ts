// Learn more about Vitest configuration options at https://vitest.dev/config/

import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [
    // Resuelve los paths de TypeScript (@/*, @/core/*, etc.)
    tsconfigPaths({
      root: path.resolve(__dirname)
    })
  ],
  test: {
    // Habilitar globals (describe, it, expect, etc.) sin necesidad de importarlos
    globals: true,
    // Entorno DOM para pruebas unitarias de componentes Angular
    environment: 'jsdom',
    // Excluir archivos (Angular CLI maneja la detección de archivos de prueba)
    exclude: ['node_modules', 'dist', '.angular'],
    // Configuración de cobertura
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
    // Configuración para mejorar la compatibilidad con Angular
    setupFiles: [],
    // Timeout para pruebas
    testTimeout: 10000,
    // Configuración de hooks
    hookTimeout: 10000
  },
  // Resolver extensiones de archivo y alias
  // IMPORTANTE: Los alias más específicos deben ir antes que los genéricos
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
