---
name: angular-code-context
description: Contexto operativo para generar código Angular en este repositorio siguiendo ADRs (arquitectura por capas/features, estilo Angular moderno, repositorios, formularios, managers y diálogos). Usar cuando la tarea implique crear o modificar código de aplicación.
---

# Angular code context

## Cuándo usar

Úsalo cuando debas crear, refactorizar o ampliar código Angular en este proyecto.

## Flujo rápido

1. **Ubica la responsabilidad** (ADR-001): `core`, `shared`, `cross` o `features`.
2. **Aplica estilo Angular moderno** (ADR-002): `inject()`, `input()/output()`, control flow nativo, standalone.
3. **Respeta UI y utilidades** (ADR-003, ADR-009, ADR-011): clases utilitarias permitidas, iconos definidos, `private/protected/public` y `readonly` según convención.
4. **Si hay datos remotos**, usar patrón Repository (ADR-005).
5. **Si hay formularios**, aplicar validación y layout (ADR-007 + ADR-012).
6. **Si hay maestro-detalle o flujos complejos**, usar Manager + diálogos (ADR-013 + ADR-014).
7. **Agregar o ajustar tests** y validar con ADR-006.

## Checklist antes de terminar

- No romper dirección de dependencias entre capas.
- Componentes enfocados en presentación; coordinación compleja en managers.
- Código y nombres consistentes con los ADRs.
- Tests alineados al comportamiento público.

## Referencias

- `docs/adr/ADR-001-separation-of-responsibilities.md`
- `docs/adr/ADR-002-angular-style-guide.md`
- `docs/adr/ADR-003-css-utilities.md`
- `docs/adr/ADR-005-repository-pattern.md`
- `docs/adr/ADR-007-form-validation-strategy.md`
- `docs/adr/ADR-009-icon-usage-strategy.md`
- `docs/adr/ADR-011-typescript-access-modifiers.md`
- `docs/adr/ADR-012-form-layout-structure.md`
- `docs/adr/ADR-013-dialog-master-detail.md`
- `docs/adr/ADR-014-manager-pattern.md`
