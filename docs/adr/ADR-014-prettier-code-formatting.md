---
id: ADR-014
status: Accepted
last_update: 2026-07-30
deciders: [Equipo de Arquitectura]
tags: [prettier, formatting, coding-style, tooling]
supersedes: null
superseded_by: null
emits: []
---

# ADR-014: Formateo de código con Prettier

## Contexto

Sin un formateador único y compartido, cada editor y cada desarrollador aplican reglas distintas de
estilo (comillas, ancho de línea, saltos, indentación), lo que genera diffs ruidosos, revisiones
centradas en formato en lugar de comportamiento, y fricción en el onboarding. El lint (ESLint) no
sustituye a un formateador: su foco es calidad y reglas de diseño, no la presentación uniforme del
código fuente.

## Decisión

Se adopta **Prettier** como el formateador único del repositorio, según la configuración compartida
(`.prettierrc`). Los archivos que **no** deben formatearse se excluyen **únicamente** mediante
`.prettierignore` (p. ej. Markdown, texto plano y artefactos generados).

El cumplimiento se verifica con el modo de comprobación de Prettier (`--check`) en el flujo local
(hooks) y/o CI, además de poder aplicarse con `format` en desarrollo.

El enunciado normativo (RFC 2119) de esta decisión vive en el estándar de dominio
**Coding Style Standards** (`../standards/coding-style.md`).

## Consecuencias

### Positivas

- Un solo estilo de formato, reproducible entre máquinas y editores.
- Diffs y code reviews más centrados en el cambio funcional.
- Separación clara: Prettier formatea; ESLint valida reglas de calidad y arquitectura.
- El alcance (qué se formatea y qué no) queda centralizado en `.prettierignore`.

### Negativas / trade-offs

- Requiere disciplina de configuración compartida y de no sobreescribir opciones por editor.
- El primer pase de formato sobre código legado puede generar un diff grande (fuera del alcance
  puntual de este ADR).
- Quien añada tipos de archivo fuera de alcance debe actualizar `.prettierignore`; no hay criterio
  de cumplimiento (`CR`) dedicado en el estándar de arquitectura.

## Referencias

- [Coding Style Standards](../standards/coding-style.md)
- [Índice de ADRs](./README.md)
- [Prettier](https://prettier.io/)
- [`.prettierignore`](../../.prettierignore)
