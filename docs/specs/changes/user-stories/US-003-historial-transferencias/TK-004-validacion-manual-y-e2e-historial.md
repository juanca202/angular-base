# TK-004: Validación manual y escenarios E2E del historial

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-003](./README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Cerrar la verificación del historial con escenarios E2E de Playwright sobre un historial sembrado (orden, filtros, exportar por descarga, eliminar con y sin confirmación, estado vacío, ausencia de desplazamiento horizontal a 360 px y 1280 px) y un guion manual en Chrome para Android para compartir con otras aplicaciones y su cancelación, con el registro de resultados en el `progress.md` de la tarea.

## Dependencias

- Tareas TK-001 a TK-003 completadas — historial, exportación y pantalla
- Playwright — escenarios E2E con datos sembrados en el almacenamiento privado
- Chrome para Android — pruebas manuales de compartir

## Referencias

- **Casos de prueba:** [índice de casos de la historia](./test-cases/README.md)
- **Arquitectura:** [ADR-005: pruebas end-to-end con Playwright](../../../../adr/ADR-005-e2e-testing-playwright.md)
- **Arquitectura:** [ADR-003: pruebas unitarias con Vitest y Testing Library](../../../../adr/ADR-003-unit-testing-vitest-testing-library.md)

## Archivos afectados

```text
laboratorio-1/
├── + e2e/history.spec.ts                            # escenarios E2E del historial
└── + docs/specs/changes/user-stories/US-003-historial-transferencias/
    └── + assets/guion-validacion-historial.md       # guion manual y hoja de registro
```

## Plan de implementación

- [x] **IT-01** — Preparar el sembrado del historial (entradas enviadas y recibidas con fechas y tamaños conocidos) para los escenarios
- [x] **IT-02** — Escribir los escenarios E2E de lista, filtros, exportar por descarga, eliminar (confirmar y cancelar), estado vacío y desplazamiento horizontal a 360 px y 1280 px
- [x] **IT-03** — Redactar el guion manual de compartir con otras aplicaciones y de su cancelación, con hoja de registro
- [ ] **IT-04** — Ejecutar el guion en Chrome para Android y registrar los resultados en el `progress.md`

## Observaciones

- Las pruebas manuales dependen de un móvil Android con Chrome.
- Los escenarios se derivan de los casos de prueba de la historia.
