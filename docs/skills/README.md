# Skills del proyecto

Este directorio documenta los **skills operativos** para asistentes de IA (Cursor, Codex, Copilot, etc.).

## Objetivo

Separar claramente:

- **ADRs (`docs/adr/`)**: decisiones arquitectónicas estables del proyecto (qué y por qué).
- **Skills (`.cursor/skills/`)**: guías operativas para generación/edición de código con IA (cómo ejecutar esas decisiones en tareas concretas).

## Skills disponibles

- [`abp-code-context`](../../.cursor/skills/abp-code-context/SKILL.md): contexto mínimo para generar código alineado con arquitectura, estilo y patrones del proyecto.
- [`abp-testing-signals`](../../.cursor/skills/abp-testing-signals/SKILL.md): guía operativa para escribir tests de Signals con Vitest sin romper el contrato definido por ADR-015.

## Mapeo ADR → Skill

- **ADR-001, ADR-002, ADR-003, ADR-004, ADR-005, ADR-006, ADR-007, ADR-008, ADR-009, ADR-010, ADR-011, ADR-012, ADR-013**
  - Se aplican operacionalmente desde `abp-code-context`.
- **ADR-014** (Internacionalización)
  - Se aplica operacionalmente desde `abp-translate-i18n-missing`.
- **ADR-015** (Testing)
  - Se aplica operacionalmente desde `abp-testing-signals`.
- **ADR-016, ADR-017**
  - Documentación y branching; referenciados en `abp-code-context`.

## Regla de mantenimiento

Si cambia una decisión arquitectónica en ADRs, actualizar el skill relacionado en la misma PR para mantener consistencia entre decisión y ejecución.
