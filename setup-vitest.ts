import '@angular/localize/init';
import '@angular/compiler';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { getTestBed } from '@angular/core/testing';
import { vi } from 'vitest';

// Configure test environment
getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
  {
    errorOnUnknownElements: false,
    errorOnUnknownProperties: false
  }
);

// Configuraciones globales para las pruebas
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock para localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
});

// Mock para sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
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
    getRandomValues: vi.fn(),
    randomUUID: vi.fn(() => 'mock-uuid')
  },
  writable: true
});
