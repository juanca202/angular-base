import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import '@angular/compiler';
import { vi } from 'vitest';
import { resolve } from 'path';

// Mock d3 to avoid import errors - must be before any imports that use it
vi.mock('d3', () => ({
  default: {},
  select: () => ({}),
  scaleLinear: () => ({}),
  axisBottom: () => ({}),
  axisLeft: () => ({})
}));

// Mock @factor_ec/ui
vi.mock('@factor_ec/ui', async () => {
  const actual = await vi.importActual('../test/mocks/factor-ui');
  return actual;
});

// Mock @factor_ec/utils
vi.mock('@factor_ec/utils', async () => {
  const actual = await vi.importActual('../test/mocks/factor-utils');
  return actual;
});

// Mock @/version-info using the resolved path
vi.mock(resolve(__dirname, '../version-info.ts'), () => ({
  versionInfo: {
    npmPackage: { name: 'angular-base-project', version: '0.0.0-test' },
    git: { raw: 'test-sha' }
  }
}));

// Initialize Angular testing environment
// This must be called before any tests that use TestBed
TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
