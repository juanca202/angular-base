---
name: abp-code-context
description: Contexto operativo para generar código Angular en este repositorio siguiendo ADRs (arquitectura por capas/features, estilo Angular moderno, repositorios, formularios, managers y diálogos). Usar cuando la tarea implique crear o modificar código de aplicación.
---

# Angular code context

## Cuándo usar

Úsalo cuando debas crear, refactorizar o ampliar código Angular en este proyecto.

## Flujo rápido

1. **Ubica la responsabilidad** (ADR-001): `core`, `shared`, `cross` o `features`.
2. **Aplica estilo Angular moderno** (ADR-002): `inject()`, `input()/output()`, control flow nativo, standalone.
3. **Respeta UI y utilidades** (ADR-003, ADR-005, ADR-012): clases utilitarias permitidas, iconos definidos, `private/protected/public` y `readonly` según convención.
4. **Si hay datos remotos**, usar patrón Repository (ADR-006).
5. **Si hay formularios**, aplicar estrategia de formularios y layout (ADR-009 + ADR-010).
6. **Si hay maestro-detalle o flujos complejos**, usar Manager + diálogos (ADR-007 + ADR-013).
7. **Agregar o ajustar tests** y validar con ADR-015.

## Checklist antes de terminar

- No romper dirección de dependencias entre capas.
- Componentes enfocados en presentación; coordinación compleja en managers.
- Código y nombres consistentes con los ADRs.
- Tests alineados al comportamiento público.

## Referencias

- `docs/adr/ADR-001-separation-of-responsibilities.md`
- `docs/adr/ADR-002-angular-style-guide.md`
- `docs/adr/ADR-003-typescript-access-modifiers.md`
- `docs/adr/ADR-004-component-library.md`
- `docs/adr/ADR-005-css-utilities.md`
- `docs/adr/ADR-006-repository-pattern.md`
- `docs/adr/ADR-007-manager-pattern.md`
- `docs/adr/ADR-008-mapper-pattern.md`
- `docs/adr/ADR-009-form-strategy.md`
- `docs/adr/ADR-010-form-layout-structure.md`
- `docs/adr/ADR-011-code-quality-tooling.md`
- `docs/adr/ADR-012-icon-usage-strategy.md`
- `docs/adr/ADR-013-dialog-master-detail.md`
- `docs/adr/ADR-014-internationalization-strategy.md`
- `docs/adr/ADR-015-testing-strategy.md`
- `docs/adr/ADR-016-documentation-strategy.md`
- `docs/adr/ADR-017-branching-strategy.md`
