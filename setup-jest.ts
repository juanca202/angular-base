import '@angular/localize/init';
import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless/index.js';
setupZonelessTestEnv({ errorOnUnknownElements: false, errorOnUnknownProperties: false });

// Configuraciones globales para las pruebas
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock para localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  writable: true
});

// Mock para sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  writable: true
});

// Mock para navigator
Object.defineProperty(navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (compatible; Test Browser)'
});

// Mock para crypto
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: jest.fn(),
    randomUUID: jest.fn(() => 'mock-uuid')
  },
  writable: true
});
