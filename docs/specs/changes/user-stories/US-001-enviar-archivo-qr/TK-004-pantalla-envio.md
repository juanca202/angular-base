# TK-004: Pantalla de envío: selección de archivo, emisión y estados de error

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-001](README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Disponer de la pantalla de envío, con ruta propia `/enviar` a la que la pantalla de inicio (historia US-003) enlazará, según el wireframe aprobado: al entrar se abre el selector de archivos (un solo archivo, cualquier tipo); al elegirlo se muestra solo la secuencia de QR y, debajo, nombre, tipo, tamaño, cantidad de QR y tiempo estimado por vuelta, sin progreso; permite cancelar sin confirmación; muestra mensajes claros y no inicia la transferencia cuando el archivo está vacío, no cabe en el almacenamiento, supera el máximo de fragmentos o el navegador no es compatible; y se usa sin desplazamiento horizontal de 360 px a 1280 px o más.

## Dependencias

- Protocolo de fragmentación (tarea TK-001) — fragmentos y error de límite
- Servicio de almacenamiento privado (tarea TK-002) — copia del archivo y error de cuota
- Manager de la secuencia (tarea TK-003) — estado de la emisión y cancelación
- Componentes de `@factor_ec/ui` y Tailwind CSS — presentación
- `MessageService` / puente de notificaciones del Core — mensajes de error

## Referencias

- [Informe del spike WI-002](../../requirements/SRS-001-transferencia-qr/references/spike-report-WI-002-medicion-qr-android.md) (veredicto viable con trabajo; hallazgos y lagunas por tarea)
- **Diseño:** [WF-002: Enviar: QR e información del archivo](../../requirements/SRS-001-transferencia-qr/wireframes/WF-002-enviar-seleccion.md) — Aprobado ([SVG](../../requirements/SRS-001-transferencia-qr/wireframes/WF-002-enviar-seleccion.svg), [móvil](../../requirements/SRS-001-transferencia-qr/wireframes/WF-002-enviar-seleccion-movil.svg))
- **Arquitectura:** [ADR-001: arquitectura híbrida por capas y funcionalidades](../../../../adr/ADR-001-hybrid-layered-feature-architecture.md)
- **Arquitectura:** [ADR-011: patrón Manager para orquestación](../../../../adr/ADR-011-manager-pattern-orchestration.md)
- **Arquitectura:** [ADR-006: presentación con Tailwind CSS](../../../../adr/ADR-006-presentation-tailwind-css.md)
- **Arquitectura:** [ADR-005: pruebas end-to-end con Playwright](../../../../adr/ADR-005-e2e-testing-playwright.md)
- **Arquitectura:** [ADR-003: pruebas unitarias con Vitest y Testing Library](../../../../adr/ADR-003-unit-testing-vitest-testing-library.md)
- **Arquitectura:** [ADR-002: modificadores de acceso explícitos y readonly](../../../../adr/ADR-002-explicit-member-accessibility-and-readonly.md)

## Archivos afectados

```text
laboratorio-1/
├── ~ src/app/app.routes.ts                         # ruta propia /enviar con carga diferida
└── src/app/features/send/
    ├── components/
    │   ├── + send-page.ts                          # pantalla de emisión y estados
    │   ├── + send-page.html
    │   ├── + send-page.spec.ts
    │   └── + qr-canvas.ts                          # dibuja la matriz del QR en un canvas
    └── services/
        └── + send-file-validator.ts                # vacío, límite de fragmentos y compatibilidad
```

## Plan de implementación

- [x] **IT-01** — Implementar el validador del archivo elegido: vacío, máximo de fragmentos y compatibilidad del navegador, con mensajes claros
- [x] **IT-02** — Implementar el componente que dibuja el QR en un canvas con el tamaño necesario
- [x] **IT-03** — Implementar la pantalla de envío: selector de un solo archivo, orquestación con el manager, copia en almacenamiento, información del archivo y cancelación sin confirmación
- [x] **IT-04** — Mostrar los mensajes de error y no iniciar la transferencia cuando falle una validación o la cuota
- [x] **IT-05** — Maquetar con Tailwind para 360 px a 1280 px o más sin desplazamiento horizontal, incluidos los estados de error
- [x] **IT-06** — Registrar la ruta `/enviar` con carga diferida y probar los estados con Testing Library

## Observaciones

- Decisión (2026-10-08): la pantalla de envío tiene ruta propia `/enviar`; el botón «Enviar» de la pantalla de inicio (wireframe WF-001, historia US-003) navega a esa ruta, y esta tarea no construye la pantalla de inicio.
