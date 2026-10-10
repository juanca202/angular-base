# TK-005: PWA instalable sin red y estrategia de actualización

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-001](README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Garantizar que, tras la primera carga con red, el envío funciona completamente sin conexión, que la aplicación no realiza ninguna petición de red durante el envío (ni telemetría) y que cada nueva versión se aplica sin dejar al usuario con una versión obsoleta en caché. Incluye la comprobación automática de cero peticiones y de funcionamiento sin conexión.

## Dependencias

- `@angular/service-worker` y `ngsw-config.json` — caché de la aplicación y actualización
- `SwUpdate` — detección y activación de nuevas versiones
- Playwright — modo sin conexión y captura de peticiones

## Referencias

- [Informe del spike WI-002](../../requirements/SRS-001-transferencia-qr/references/spike-report-WI-002-medicion-qr-android.md) (veredicto viable con trabajo; hallazgos y lagunas por tarea)
- **Arquitectura:** [ADR-005: pruebas end-to-end con Playwright](../../../../adr/ADR-005-e2e-testing-playwright.md)
- **Arquitectura:** [ADR-001: arquitectura híbrida por capas y funcionalidades](../../../../adr/ADR-001-hybrid-layered-feature-architecture.md)
- **Arquitectura:** [ADR-003: pruebas unitarias con Vitest y Testing Library](../../../../adr/ADR-003-unit-testing-vitest-testing-library.md)

## Archivos afectados

```text
laboratorio-1/
├── ~ ngsw-config.json                              # grupos de caché de la aplicación
├── ~ src/app/app.config.ts                         # registro del service worker y comprobación de versiones
├── + src/app/core/services/app-update.ts           # avisa y activa nuevas versiones
├── + src/app/core/services/app-update.spec.ts
└── + e2e/send-offline.spec.ts                      # sin conexión y cero peticiones durante el envío
```

## Plan de implementación

- [x] **IT-01** — Revisar y ajustar `ngsw-config.json` para cachear todos los recursos de la aplicación necesarios sin conexión
- [x] **IT-02** — Implementar el servicio de actualización con `SwUpdate`: detectar la versión nueva y activarla con aviso al usuario
- [x] **IT-03** — Verificar que el código de envío no hace peticiones de red (sin telemetría ni recursos externos)
- [x] **IT-04** — Escribir la prueba E2E: cargar con red, pasar a modo sin conexión, enviar un archivo y comprobar que no hay peticiones durante el envío
- [x] **IT-05** — Probar el servicio de actualización con un `SwUpdate` simulado

## Observaciones

- El spike vio que una estrategia de caché fija dejó un móvil con una versión antigua tras desplegar; esta tarea fija la estrategia de actualización de la aplicación definitiva.
