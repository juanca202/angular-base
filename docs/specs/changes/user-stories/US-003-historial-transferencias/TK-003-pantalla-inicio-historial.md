# TK-003: Pantalla de inicio e historial

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-003](./README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Disponer de la pantalla de inicio en la ruta `/`, según el wireframe aprobado: dos botones con icono, Enviar (navega a `/enviar`) y Recibir (navega a `/recibir`), y debajo el historial con filtro Todos / Recibidos / Enviados (Todos por defecto), una fila por transferencia con su contenido y las acciones Exportar y Eliminar. Eliminar pide confirmación antes de borrar. Sin transferencias muestra «Aún no hay transferencias» en lugar de la lista. Es operable sin desplazamiento horizontal de 360 px a 1280 px o más.

## Dependencias

- Servicio de historial (TK-001) — lista, filtro y eliminación
- Servicio de exportación (TK-002) — Exportar por descarga o compartir
- Componentes de `@factor_ec/ui` (incluido `ft-icon`) y Tailwind CSS — presentación
- `MessageService` / puente de notificaciones del Core — avisos de error
- Enrutador de Angular — rutas `/`, `/enviar` y `/recibir` con carga diferida

## Referencias

- **Diseño:** [WF-001: Inicio e historial](../../requirements/SRS-001-transferencia-qr/wireframes/WF-001-inicio-historial.md) — Aprobado ([SVG](../../requirements/SRS-001-transferencia-qr/wireframes/WF-001-inicio-historial.svg), [móvil](../../requirements/SRS-001-transferencia-qr/wireframes/WF-001-inicio-historial-movil.svg))
- **Arquitectura:** [ADR-001: arquitectura híbrida por capas y funcionalidades](../../../../adr/ADR-001-hybrid-layered-feature-architecture.md)
- **Arquitectura:** [ADR-006: presentación con Tailwind CSS](../../../../adr/ADR-006-presentation-tailwind-css.md)
- **Arquitectura:** [ADR-013: componente unificado de iconos (`ft-icon`)](../../../../adr/ADR-013-unified-ft-icon-component.md)
- **Arquitectura:** [ADR-011: patrón Manager para orquestación](../../../../adr/ADR-011-manager-pattern-orchestration.md)
- **Arquitectura:** [ADR-005: pruebas end-to-end con Playwright](../../../../adr/ADR-005-e2e-testing-playwright.md)
- **Arquitectura:** [ADR-003: pruebas unitarias con Vitest y Testing Library](../../../../adr/ADR-003-unit-testing-vitest-testing-library.md)
- **Arquitectura:** [ADR-002: modificadores de acceso explícitos y readonly](../../../../adr/ADR-002-explicit-member-accessibility-and-readonly.md)
- **Arquitectura:** [ADR-004: documentación con TSDoc](../../../../adr/ADR-004-tsdoc-documentation-during-development.md)

## Archivos afectados

```text
laboratorio-1/
├── ~ src/app/app.routes.ts                         # ruta / con carga diferida
└── src/app/features/home/
    └── components/
        ├── + home-page.ts                          # botones, filtro y estado
        ├── + home-page.html
        ├── + home-page.spec.ts
        ├── + history-list.ts                       # filas con Exportar y Eliminar
        └── + history-list.html
```

## Plan de implementación

- [ ] **IT-01** — Registrar la ruta `/` con carga diferida
- [ ] **IT-02** — Implementar la pantalla con los botones Enviar y Recibir con icono y la navegación a sus rutas
- [ ] **IT-03** — Implementar la lista del historial con el filtro (Todos por defecto) y el contenido de cada fila
- [ ] **IT-04** — Implementar el estado vacío con el mensaje «Aún no hay transferencias»
- [ ] **IT-05** — Implementar las acciones Exportar (descarga o compartir según disponibilidad) y Eliminar con confirmación previa
- [ ] **IT-06** — Maquetar con Tailwind para 360 px a 1280 px o más sin desplazamiento horizontal, incluidos nombres largos
- [ ] **IT-07** — Probar con Testing Library: orden, filtros, estado vacío, confirmación de eliminar y su cancelación

## Observaciones

- La ruta de recepción `/recibir` sigue la convención de `/enviar` (ver [TK-004 de la US-001](../US-001-enviar-archivo-qr/TK-004-pantalla-envio.md)); las tareas de la US-002 deben registrar esa misma ruta.
- Esta tarea no construye las pantallas de envío ni de recepción, solo navega a ellas.
