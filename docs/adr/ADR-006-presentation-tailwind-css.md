---
id: ADR-006
status: Accepted
last_update: 2026-07-30
deciders: [Equipo de Arquitectura]
tags: [frontend, tailwind, css, presentacion, apply]
supersedes: null
superseded_by: null
emits: [frontend/CR-002, frontend/CR-003]
---

# ADR-006: Presentación con Tailwind CSS

## Contexto

Sin un único sistema de presentación, los estilos tienden a fragmentarse entre utilidades ad hoc,
CSS propio, estilos en línea y eventualmente otros frameworks. Eso genera inconsistencia visual,
dificulta el mantenimiento y el onboarding, y diluye el design system implícito del producto.

El proyecto ya incorpora Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/postcss` e `@import 'tailwindcss'`
en los estilos globales). Se necesita fijar Tailwind como **el** framework de presentación y
acotar cómo se escriben estilos fuera de las utilidades (clases CSS propias y prohibición de estilos
en línea, con excepciones acotadas).

## Decisión

Se adopta **Tailwind CSS** como framework exclusivo de presentación del proyecto:

1. **Stack:** Tailwind CSS (v4 en la configuración actual del repo) como sistema de utilidades para
   maquetar y estilizar la UI.
2. **Estilos en línea:** no se usan estilos en línea (`style="…"`, `[style.*]`, `ngStyle` u
   equivalentes) salvo cuando el valor es dinámico y no es expresable de forma razonable con
   utilidades Tailwind.
3. **Clases CSS propias:** si se define una clase CSS en hojas de estilo del proyecto, su cuerpo se
   escribe con la sintaxis `@apply` y utilidades Tailwind (no propiedades CSS “crudas” como vía
   habitual).

El enunciado normativo (RFC 2119), los criterios de cumplimiento verificables y sus fitness functions
de esta decisión viven en el estándar de dominio **Frontend Standards**
(`../standards/frontend.md`), no en este ADR.

## Consecuencias

### Positivas

- Un solo lenguaje visual (utilidades Tailwind) acelera revisiones y reduce drift de estilos.
- Evitar estilos en línea fuerza decisiones explícitas en `class` / hojas de estilo y facilita
  theming y overrides controlados.
- `@apply` mantiene las clases propias alineadas con el mismo vocabulario de diseño.

### Negativas / trade-offs

- Valores dinámicos (p. ej. posición calculada en runtime) seguirán necesitando `style` binding; hay
  que justificar la excepción en revisión.
- `@apply` puede ocultar la procedencia de utilidades si se abusa de clases semánticas grandes; el
  equipo debe preferir utilidades en plantilla cuando baste.
- Prohibir otros frameworks CSS en paralelo implica migrar cualquier estilo legado que no use
  Tailwind.

## Referencias

- [Frontend Standards](../standards/frontend.md)
- [Índice de ADRs](./README.md)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind — @apply](https://tailwindcss.com/docs/functions-and-directives#apply-directive)
