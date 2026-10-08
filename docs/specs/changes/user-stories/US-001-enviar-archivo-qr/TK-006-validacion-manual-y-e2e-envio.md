# TK-006: Validación con móviles y escenarios E2E del envío

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-001](./README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Cerrar la verificación del envío con lo que la automatización unitaria no cubre: escenarios E2E del flujo completo de envío (selección, emisión, cancelación y errores) y un guion de pruebas manuales con móviles Android para la serie de lecturas por tamaño de fragmento, el envío de 1 MB cronometrado y el funcionamiento en modo avión, con registro de resultados en el `progress.md` de la tarea.

## Dependencias

- Tareas TK-001 a TK-005 completadas — el flujo de envío completo
- Playwright con cámara simulada o bucle local — escenarios E2E
- Móviles Android con Chrome y túnel HTTPS — pruebas manuales (guion del spike)

## Referencias

- [Informe del spike WI-002](../../../archived/work-items/WI-002-spike-medicion-qr-android/spike-report.md) (veredicto viable con trabajo; hallazgos y lagunas por tarea)
- **Guion:** `spike/GUIA-MEDICION.md` en la rama `spike/WI-002-medicion-qr-android` (referencia de lectura)
- **Arquitectura:** [ADR-005: pruebas end-to-end con Playwright](../../../../adr/ADR-005-e2e-testing-playwright.md)
- **Arquitectura:** [ADR-003: pruebas unitarias con Vitest y Testing Library](../../../../adr/ADR-003-unit-testing-vitest-testing-library.md)
- **Casos de prueba:** [índice de casos de la historia](./test-cases/README.md)

## Archivos afectados

```text
laboratorio-1/
├── + e2e/send-flow.spec.ts                          # flujo completo de envío y errores
└── + docs/specs/changes/user-stories/US-001-enviar-archivo-qr/
    └── + assets/guion-validacion-envio.md           # guion manual y hoja de registro
```

## Plan de implementación

- [ ] **IT-01** — Escribir los escenarios E2E del flujo de envío: selección, emisión, cancelación sin confirmación y cada mensaje de error
- [ ] **IT-02** — Redactar el guion manual a partir del guion del spike: serie de 10 lecturas secuenciales por tamaño candidato y hoja de registro
- [ ] **IT-03** — Ejecutar el envío de 1 MB cronometrado y la prueba en modo avión, y registrar los resultados en el `progress.md`
  Si 1 MB no se completa en 15 minutos, dejar el resultado documentado y decidir con la historia si se ajusta el tamaño de fragmento o la velocidad.

## Observaciones

- Las pruebas manuales dependen de dos dispositivos reales y de un túnel HTTPS.
