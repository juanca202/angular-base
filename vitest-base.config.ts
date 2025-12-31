// Learn more about Vitest configuration options at https://vitest.dev/config/

import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    // Resuelve los paths de TypeScript (@/*, @/core/*, etc.)
    tsconfigPaths({
      projects: ['./tsconfig.spec.json']
    })
  ],
  test: {
    // Habilitar globals (describe, it, expect, etc.) sin necesidad de importarlos
    globals: true,
    // Entorno DOM para pruebas de componentes Angular
    environment: 'happy-dom',
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
  // Resolver extensiones de archivo
  resolve: {
    extensions: ['.ts', '.js', '.json']
  }
});
