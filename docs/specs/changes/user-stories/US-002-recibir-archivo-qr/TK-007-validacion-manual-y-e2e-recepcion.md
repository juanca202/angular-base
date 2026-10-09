# TK-007: Validación con móviles y escenarios E2E de la recepción

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-002](./README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Cerrar la verificación de la recepción con lo que la automatización unitaria no cubre: escenarios E2E de Playwright del flujo de recepción (permiso denegado, cámara simulada con una secuencia de QR, confirmación y descarte, cuatro resultados, cancelación), la comprobación de cero peticiones de red y de funcionamiento sin conexión durante la recepción, la ausencia de desplazamiento horizontal de 360 px a 1280 px, y un guion de pruebas manuales con móviles Android para la lectura de QR de 400 B a unos 30 cm (9 de 10), la recepción de 1 MB cronometrada (objetivo de 15 minutos), el modo avión y el recuadro sobre el QR detectado, con registro de resultados en el `progress.md` de la tarea.

## Dependencias

- Pantalla de recepción ([TK-005](./TK-005-pantalla-recepcion.md)) y de resultado ([TK-006](./TK-006-pantalla-resultado-previsualizacion.md)) — flujo completo a verificar
- PWA sin red de US-001 ([TK-005](../US-001-enviar-archivo-qr/TK-005-pwa-sin-red-y-actualizacion.md)) — service worker y comprobación de cero peticiones
- Validación del envío de US-001 ([TK-006](../US-001-enviar-archivo-qr/TK-006-validacion-manual-y-e2e-envio.md)) — dispositivo emisor para las pruebas manuales
- Playwright — escenarios E2E

## Referencias

- [Informe del spike WI-002](../../../archived/work-items/WI-002-spike-medicion-qr-android/spike-report.md) (veredicto viable con trabajo; hallazgos y lagunas por tarea)
- **Guion de medición:** `spike/GUIA-MEDICION.md` en la rama `spike/WI-002-medicion-qr-android` (reutilizable para las pruebas manuales)
- **Diseño:** [WF-004: Recibir: escaneo e información](../../requirements/SRS-001-transferencia-qr/wireframes/WF-004-recibir-escaneo.md) — Aprobado ([SVG](../../requirements/SRS-001-transferencia-qr/wireframes/WF-004-recibir-escaneo.svg), [móvil](../../requirements/SRS-001-transferencia-qr/wireframes/WF-004-recibir-escaneo-movil.svg))
- **Diseño:** [WF-005: Resultado y previsualización](../../requirements/SRS-001-transferencia-qr/wireframes/WF-005-resultado-recepcion.md) — Aprobado ([SVG](../../requirements/SRS-001-transferencia-qr/wireframes/WF-005-resultado-recepcion.svg), [móvil](../../requirements/SRS-001-transferencia-qr/wireframes/WF-005-resultado-recepcion-movil.svg), [error](../../requirements/SRS-001-transferencia-qr/wireframes/WF-005-resultado-recepcion-error.svg), [error móvil](../../requirements/SRS-001-transferencia-qr/wireframes/WF-005-resultado-recepcion-error-movil.svg))
- **Arquitectura:** [ADR-005: pruebas end-to-end con Playwright](../../../../adr/ADR-005-e2e-testing-playwright.md)
- **Arquitectura:** [ADR-003: pruebas unitarias con Vitest y Testing Library](../../../../adr/ADR-003-unit-testing-vitest-testing-library.md)

## Archivos afectados

```text
laboratorio-1/
├── + e2e/receive-flow.spec.ts                       # flujo de recepción, resultados y errores
├── + e2e/receive-offline.spec.ts                    # sin conexión y cero peticiones durante la recepción
└── + docs/specs/changes/user-stories/US-002-recibir-archivo-qr/
    └── + assets/guion-validacion-recepcion.md       # guion manual y hoja de registro
```

## Plan de implementación

- [x] **IT-01** — Escribir los escenarios E2E del flujo de recepción con cámara simulada: confirmación y descarte, completada, incompleta, datos inválidos, no reconstruible, cancelación y errores de cámara
- [x] **IT-02** — Escribir los escenarios E2E de cero peticiones de red y de recepción sin conexión tras la primera carga
- [x] **IT-03** — Escribir la comprobación de ausencia de desplazamiento horizontal de 360 px a 1280 px en recepción y resultado
- [x] **IT-04** — Redactar el guion manual a partir del guion del spike: serie de 10 lecturas de QR de 400 B a 30 cm, recepción de 1 MB cronometrada, modo avión, recuadro sobre el QR y hoja de registro
- [ ] **IT-05** — Ejecutar las pruebas manuales con un móvil Android y registrar los resultados en el `progress.md`
  Si 1 MB no se completa en 15 minutos, dejar el resultado documentado y decidir con la historia si se ajusta el tamaño de fragmento o la velocidad.

## Observaciones

- Las pruebas manuales dependen de dos dispositivos reales y de un túnel HTTPS.
