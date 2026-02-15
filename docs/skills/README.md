# Skills del proyecto

Este directorio documenta los **skills operativos** para asistentes de IA (Cursor, Codex, Copilot, etc.).

## Objetivo

Separar claramente:

- **ADRs (`docs/adr/`)**: decisiones arquitectónicas estables del proyecto (qué y por qué).
- **Skills (`.cursor/skills/`)**: guías operativas para generación/edición de código con IA (cómo ejecutar esas decisiones en tareas concretas).

## Skills disponibles

- [`angular-code-context`](../../.cursor/skills/angular-code-context/SKILL.md): contexto mínimo para generar código alineado con arquitectura, estilo y patrones del proyecto.
- [`angular-testing-signals`](../../.cursor/skills/angular-testing-signals/SKILL.md): guía operativa para escribir tests de Signals con Vitest sin romper el contrato definido por ADR-006.

## Mapeo ADR → Skill

- **ADR-001, ADR-002, ADR-003, ADR-005, ADR-007, ADR-009, ADR-011, ADR-012, ADR-013, ADR-014**
  - Se aplican operacionalmente desde `angular-code-context`.
- **ADR-006**
  - Se aplica operacionalmente desde `angular-testing-signals`.

## Regla de mantenimiento

Si cambia una decisión arquitectónica en ADRs, actualizar el skill relacionado en la misma PR para mantener consistencia entre decisión y ejecución.
