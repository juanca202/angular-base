import '@angular/localize/init';
import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless/index.js';
setupZonelessTestEnv({ errorOnUnknownElements: false, errorOnUnknownProperties: false });

// Opcional: polyfills adicionales si tu app los requiere
// import 'zone.js';
// import 'zone.js/testing';
