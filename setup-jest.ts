import 'zone.js';
import 'zone.js/testing';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone/index.js';
setupZoneTestEnv({ errorOnUnknownElements: false, errorOnUnknownProperties: false });

// Opcional: polyfills adicionales si tu app los requiere
// import 'zone.js';
// import 'zone.js/testing';
