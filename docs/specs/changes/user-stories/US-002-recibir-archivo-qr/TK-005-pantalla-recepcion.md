# TK-005: Pantalla de recepción: cámara, progreso y confirmación

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-002](README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Disponer de la pantalla de recepción con ruta propia `/recibir`, a la que la pantalla de inicio ([US-003](../US-003-historial-transferencias/README.md)) enlaza, según el wireframe aprobado: al entrar activa la cámara; muestra la vista de cámara con marco de lectura y, debajo, nombre, tamaño total, tiempo estimado restante, fragmentos recibidos del total y barra de progreso con porcentaje (en móvil, al menos nombre, tamaño, tiempo y porcentaje). Muestra el aviso de confirmación con «Confirmar» y «Descartar», que permanece visible mientras no se decida con el avance actualizándose. Ofrece «Terminar lectura» y «Cancelar» (sin confirmación), muestra mensajes claros y no inicia la recepción cuando no hay cámara, falta el permiso o el navegador no es compatible (con botón para reintentar), y se usa sin desplazamiento horizontal de 360 px a 1280 px o más.

## Dependencias

- Gestor de la recepción ([TK-004](TK-004-gestor-recepcion.md)) — estado, avance, confirmación y acciones
- Ruta `/recibir` en `app.routes.ts` — carga diferida
- Componentes de `@factor_ec/ui` y Tailwind CSS — presentación
- `MessageService` / puente de notificaciones del Core — mensajes de error

## Referencias

- [Informe del spike WI-002](../../requirements/SRS-001-transferencia-qr/references/spike-report-WI-002-medicion-qr-android.md) (veredicto viable con trabajo; hallazgos y lagunas por tarea)
- **Diseño:** [WF-004: Recibir: escaneo e información](../../requirements/SRS-001-transferencia-qr/wireframes/WF-004-recibir-escaneo.md) — Aprobado ([SVG](../../requirements/SRS-001-transferencia-qr/wireframes/WF-004-recibir-escaneo.svg), [móvil](../../requirements/SRS-001-transferencia-qr/wireframes/WF-004-recibir-escaneo-movil.svg))
- **Arquitectura:** [ADR-001: arquitectura híbrida por capas y funcionalidades](../../../../adr/ADR-001-hybrid-layered-feature-architecture.md)
- **Arquitectura:** [ADR-006: presentación con Tailwind CSS](../../../../adr/ADR-006-presentation-tailwind-css.md)
- **Arquitectura:** [ADR-002: modificadores de acceso explícitos y readonly](../../../../adr/ADR-002-explicit-member-accessibility-and-readonly.md)
- **Arquitectura:** [ADR-003: pruebas unitarias con Vitest y Testing Library](../../../../adr/ADR-003-unit-testing-vitest-testing-library.md)
- **Arquitectura:** [ADR-004: documentación con TSDoc](../../../../adr/ADR-004-tsdoc-documentation-during-development.md)

## Archivos afectados

```text
laboratorio-1/
├── ~ src/app/app.routes.ts                         # ruta propia /recibir con carga diferida
└── src/app/features/receive/
    └── components/
        ├── + receive-page.ts                       # pantalla de recepción y estados
        ├── + receive-page.html
        ├── + receive-page.spec.ts
        ├── + camera-view.ts                        # vídeo de la cámara con recuadro sobre el QR detectado
        ├── + receive-progress.ts                   # nombre, tamaño, tiempo, fragmentos y barra
        └── + transfer-confirmation.ts              # aviso Confirmar / Descartar
```

## Plan de implementación

- [x] **IT-01** — Crear la ruta `/recibir` con carga diferida y la pantalla, que inicia la recepción al entrar y la detiene al salir
- [x] **IT-02** — Implementar la vista de cámara con un recuadro sobre el QR solo mientras se detecta (FR-036), sin marco fijo
- [x] **IT-03** — Implementar el bloque de progreso (nombre, tamaño, tiempo restante, fragmentos y barra con porcentaje) con la variante mínima en móvil
- [x] **IT-04** — Implementar el aviso de confirmación siempre visible mientras haya una transferencia pendiente, con el avance actualizándose
- [x] **IT-05** — Implementar «Terminar lectura» y «Cancelar» sin confirmación, y deshabilitar el inicio de una lectura nueva mientras hay una en curso
- [x] **IT-06** — Mostrar los estados de sin permiso, sin cámara y navegador no compatible con mensaje claro y botón de reintento
- [x] **IT-07** — Verificar la ausencia de desplazamiento horizontal de 360 px a 1280 px o más y los requisitos de accesibilidad
- [x] **IT-08** — Probar los estados de la pantalla con un gestor simulado
