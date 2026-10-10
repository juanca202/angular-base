# TK-006: Pantalla de resultado y previsualización segura

<!-- tk:status=Ready -->
**Estado:** Ready
**Historia:** [US-002](README.md)
**Repositorio:** laboratorio-1
**Asignado a:** juanca202

## Descripción

Disponer de la presentación del resultado de la recepción dentro de `/recibir`, según el wireframe aprobado. En «completada» muestra la previsualización (la imagen si lo es; en otro caso, un icono con el nombre) con el historial directamente debajo, y al hacer clic abre el archivo: lo muestra si su tipo es visualizable y, si no, lo descarga. La previsualización y la apertura no ejecutan contenido activo (p. ej. scripts incrustados en SVG o HTML). En «incompleta», «datos inválidos», «no reconstruible» y «almacenamiento lleno» muestra una tarjeta de resultado con su acción (Seguir escaneando o Reintentar), indica que no se guardó ni registró nada y, en «almacenamiento lleno», ofrece descargar el archivo recién recibido. Es operable sin desplazamiento horizontal de 360 px a 1280 px o más.

## Dependencias

- Gestor de la recepción ([TK-004](TK-004-gestor-recepcion.md)) — resultado y acciones de continuar o reintentar
- Pantalla de recepción ([TK-005](TK-005-pantalla-recepcion.md)) — contenedor de la ruta `/recibir`
- Lista de historial de US-003 ([TK-003](../US-003-historial-transferencias/TK-003-pantalla-inicio-historial.md)) — historial bajo la previsualización
- Servicio de exportación de US-003 ([TK-002](../US-003-historial-transferencias/TK-002-servicio-exportacion.md)) — descarga del archivo
- Componentes de `@factor_ec/ui` (`ft-icon`) y Tailwind CSS — presentación

## Referencias

- [Informe del spike WI-002](../../requirements/SRS-001-transferencia-qr/references/spike-report-WI-002-medicion-qr-android.md) (veredicto viable con trabajo; hallazgos y lagunas por tarea)
- **Diseño:** [WF-005: Resultado y previsualización](../../requirements/SRS-001-transferencia-qr/wireframes/WF-005-resultado-recepcion.md) — Aprobado ([SVG](../../requirements/SRS-001-transferencia-qr/wireframes/WF-005-resultado-recepcion.svg), [móvil](../../requirements/SRS-001-transferencia-qr/wireframes/WF-005-resultado-recepcion-movil.svg), [error](../../requirements/SRS-001-transferencia-qr/wireframes/WF-005-resultado-recepcion-error.svg), [error móvil](../../requirements/SRS-001-transferencia-qr/wireframes/WF-005-resultado-recepcion-error-movil.svg))
- **Arquitectura:** [ADR-001: arquitectura híbrida por capas y funcionalidades](../../../../adr/ADR-001-hybrid-layered-feature-architecture.md)
- **Arquitectura:** [ADR-006: presentación con Tailwind CSS](../../../../adr/ADR-006-presentation-tailwind-css.md)
- **Arquitectura:** [ADR-013: componente unificado de iconos (`ft-icon`)](../../../../adr/ADR-013-unified-ft-icon-component.md)
- **Arquitectura:** [ADR-002: modificadores de acceso explícitos y readonly](../../../../adr/ADR-002-explicit-member-accessibility-and-readonly.md)
- **Arquitectura:** [ADR-003: pruebas unitarias con Vitest y Testing Library](../../../../adr/ADR-003-unit-testing-vitest-testing-library.md)
- **Arquitectura:** [ADR-004: documentación con TSDoc](../../../../adr/ADR-004-tsdoc-documentation-during-development.md)

## Archivos afectados

```text
laboratorio-1/
└── src/app/features/receive/
    ├── ~ components/receive-page.ts                # muestra el resultado según el estado
    ├── ~ components/receive-page.html
    ├── components/
    │   ├── + result-card.ts                        # tarjeta de error con su acción
    │   ├── + result-card.spec.ts
    │   ├── + file-preview.ts                       # imagen o icono con nombre; abre al hacer clic
    │   └── + file-preview.spec.ts
    └── services/
        ├── + safe-file-opener.ts                   # abre o descarga sin ejecutar contenido activo
        └── + safe-file-opener.spec.ts
```

## Plan de implementación

- [x] **IT-01** — Implementar la previsualización: imagen si lo es y, en otro caso, icono con el nombre
- [x] **IT-02** — Implementar la apertura al hacer clic: mostrar si el tipo es visualizable y descargar si no, sin ejecutar scripts de SVG o HTML
- [x] **IT-03** — Mostrar el historial directamente debajo de la previsualización reutilizando la lista de historial
- [x] **IT-04** — Implementar la tarjeta de resultado para «incompleta», «datos inválidos» y «no reconstruible» con Seguir escaneando o Reintentar, indicando que no se guardó ni registró
- [x] **IT-05** — Implementar la variante «almacenamiento lleno» con descarga del archivo recién recibido y Reintentar
- [x] **IT-06** — Verificar la ausencia de desplazamiento horizontal de 360 px a 1280 px o más y los requisitos de accesibilidad
- [x] **IT-07** — Probar un SVG con script incrustado: no se ejecuta en la previsualización ni al abrir
- [x] **IT-08** — Probar cada estado de resultado con un gestor simulado
