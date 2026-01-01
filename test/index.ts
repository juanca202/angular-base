/**
 * Punto de entrada centralizado para todos los recursos de testing
 * Importa desde aquí para tener acceso a todos los mocks y helpers
 * 
 * Nota: En Angular 21+ no es necesario inicializar manualmente el TestBed,
 * Angular lo hace automáticamente según el entorno de pruebas.
 */

// Mocks de Angular
export * from './mocks/angular-mocks';

// Mocks de servicios
export * from './mocks/service-mocks';

// Mocks de ApplicationInsights
export * from './mocks/application-insights';

// Mocks de environment
export * from './mocks/environment';

// Helpers
export * from './helpers/window-helpers';

