---
name: Frontend Standards
domain: frontend
status: Active
last_update: 2026-07-30
source_adrs: [ADR-006, ADR-013]
tags: [frontend, tailwind, css, presentacion, apply, iconos, ft-icon]
---

# Frontend Standards

Estándar de dominio que agrupa los requisitos verificables sobre la capa de presentación: framework
de estilos, prohibición de estilos en línea, convención para clases CSS propias y el componente
unificado de iconos. Aplica a plantillas, estilos de componentes y hojas CSS/SCSS bajo `src/` (y
estilos globales del proyecto).

## Presentación con Tailwind CSS

**ID:** tailwind-presentation

La UI se estiliza con **Tailwind CSS** como framework exclusivo de presentación. Las utilidades
Tailwind se usan preferentemente en plantillas (`class` / class bindings). **NO DEBE** introducirse
otro framework o librería de CSS de presentación en paralelo (p. ej. Bootstrap, Bulma, Foundation)
para código de aplicación.

- El proyecto **DEBE** mantener Tailwind CSS configurado y operativo como sistema de presentación.
- **NO DEBE** añadirse otro framework CSS de presentación como dependencia de aplicación en paralelo
  a Tailwind.

### Excepciones

- Librerías de componentes de terceros que traigan sus propios estilos encapsulados **PUEDEN**
  usarse si el equipo las adopta mediante un ADR; sus estilos internos no se tratan como un segundo
  framework de presentación del código propio.
- Estilos de terceros en `node_modules` quedan fuera de este requisito.

## Sin estilos en línea

**ID:** no-inline-styles

Los elementos de la UI **NO DEBEN** llevar estilos en línea. Eso incluye atributos `style="…"`,
bindings `[style.prop]` / `[style]`, `ngStyle` y asignación equivalente de CSS inline desde el
componente.

- El estilo visual **DEBE** expresarse con utilidades Tailwind en `class` / class bindings, o con
  clases CSS propias que cumplan el requisito «Clases CSS con @apply».

### Excepciones

- Valores dinámicos calculados en runtime que **no** sean expresables de forma razonable con
  utilidades Tailwind (p. ej. `transform`/`top`/`left` derivados de medición o animación
  imperativa) **PUEDEN** usarse vía `style` binding, justificados en revisión de código.
- Atributos ARIA o HTML no visuales no están sujetos a este requisito.

## Clases CSS con @apply

**ID:** css-classes-via-apply

Si se define una clase CSS propia en hojas de estilo del proyecto (globales o de componente), el
cuerpo de esa clase **DEBE** componerse con `@apply` y utilidades Tailwind. **NO DEBE** usarse CSS
“crudo” (propiedades sueltas tipo `display: flex; color: #…`) como vía habitual para clases propias.

### Excepciones

- Directivas y at-rules de Tailwind/PostCSS necesarias para el setup (`@import`, `@theme`,
  `@source`, `@layer`, etc.) **PUEDEN** aparecer fuera de bloques de clase propios.
- Propiedades CSS no cubiertas por utilidades Tailwind o necesarias para polyfills/vendor **PUEDEN**
  usarse de forma puntual junto a `@apply`, documentadas en comentario breve junto a la regla.
- Selectores de reset o de terceros importados **PUEDEN** quedar sin `@apply`.

## Iconos unificados con `ft-icon`

**ID:** unified-ft-icon

Todo icono de la UI **DEBE** renderizarse con el componente **`<ft-icon />`**. **NO DEBE** usarse
`mat-icon`, tipografías tipo `material-icons`, ni SVG/markup de icono inline como sustituto del
componente.

- **API:** `name` es **REQUERIDO**; `collection` es opcional (por defecto `factoricons-regular`).
- **Colecciones predefinidas:** `factoricons-regular`, `factoricons-slim`, `factoricons-solid`. Se
  **DEBERÍA** preferir una colección predefinida cuando exista un símbolo adecuado.
- **Personalizados:** colección `icons` **DEBE** resolverse contra símbolos en
  `public/images/icons.svg`. Cada símbolo **DEBE** ser un `<symbol>` con `id` (= `name`),
  `viewBox="0 0 24 24"` y paths con `fill="currentColor"` (o equivalente que herede el color del
  texto), alineado a la grilla Material 24×24.
- **Tamaño:** se **DEBE** ajustar con `ft-icon--1` … `ft-icon--5` (escala estándar; `ft-icon--3` =
  mediano por defecto) o, fuera de escala, con utilidades Tailwind (p. ej. `text-[32px]`). **NO DEBE**
  usarse estilo en línea para el tamaño del icono.
- Solo se **DEBERÍA** añadir un icono a `icons` cuando no exista equivalente en las colecciones
  predefinidas.

### Excepciones

- Ilustraciones, logos o gráficos decorativos que **no** sean iconografía de UI **PUEDEN** usarse
  como `<img>`, SVG de asset o markup no-`ft-icon`, sin tratarlos como iconos del design system.
- Componentes de terceros encapsulados que rendericen sus propios iconos internos **PUEDEN**
  conservarlos; el código de aplicación propio sigue obligado a `ft-icon`.

## Criterios de cumplimiento

| ID     | Requisito                 | Descripción                                                                                                                                                         | Origen                                                    | Automatizable | Enfoque    | Verificación |
| ------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------- | ---------- | ------------ |
| CR-002 | no-inline-styles          | Las plantillas y componentes **NO DEBEN** usar estilos en línea (`style`, `[style.*]`, `ngStyle`), salvo valores dinámicos no expresables con utilidades Tailwind | [ADR-006](../adr/ADR-006-presentation-tailwind-css.md)  | yes           | bloqueante | yes          |
| CR-003 | css-classes-via-apply     | Las clases CSS propias definidas en el proyecto **DEBEN** usar `@apply` con utilidades Tailwind                                                                     | [ADR-006](../adr/ADR-006-presentation-tailwind-css.md)  | yes           | bloqueante | yes          |

## Referencias

- [ADR-006: Presentación con Tailwind CSS](../adr/ADR-006-presentation-tailwind-css.md)
- [ADR-013: Componente unificado de iconos (`ft-icon`)](../adr/ADR-013-unified-ft-icon-component.md)
- [scripts/arch/README.md](../../scripts/arch/README.md)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind — @apply](https://tailwindcss.com/docs/functions-and-directives#apply-directive)
