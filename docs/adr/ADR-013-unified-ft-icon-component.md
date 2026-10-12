---
id: ADR-013
status: Accepted
last_update: 2026-07-30
deciders: [Equipo de Arquitectura]
tags: [frontend, iconos, ft-icon, factoricons, material-design, svg]
supersedes: null
superseded_by: null
emits: []
---

# ADR-013: Componente unificado de iconos (`ft-icon`)

## Contexto

Sin una convención única para colecciones, tamaños e iconos personalizados, el renderizado de iconos
tiende a divergir: distintas APIs (`mat-icon`, SVG inline, tipografías de iconos), escalas ad hoc y
símbolos custom sin alinear a la grilla Material 24×24. Eso rompe la consistencia visual y complica
el mantenimiento del design system, incluso cuando ya se usa Tailwind como presentación
([ADR-006](./ADR-006-presentation-tailwind-css.md)).

El proyecto ya dispone de `<ft-icon />` (p. ej. en layout y placeholders de error) y de colecciones
Factor Icons. Falta fijar esa API como la vía canónica y documentar colecciones, tamaños y el sprite
de iconos personalizados.

## Decisión

Se adopta **`<ft-icon />`** como único componente de renderizado de iconos de la aplicación:

1. **API:** `name` (requerido) y `collection` (opcional; por defecto `factoricons-regular`).
2. **Colecciones predefinidas:** `factoricons-regular`, `factoricons-slim`, `factoricons-solid`.
3. **Personalizados:** colección `icons` respaldada por `public/images/icons.svg`, con cada icono
   como `<symbol>` (`id` = `name`), `viewBox="0 0 24 24"` y `fill="currentColor"`, alineado a la
   grilla Material 24×24.
4. **Tamaño:** modificadores `ft-icon--1` … `ft-icon--5` (3 = mediano por defecto); tamaños fuera
   de escala vía utilidades Tailwind (p. ej. `text-[32px]`), no estilos en línea.
5. **Preferencia:** usar colecciones predefinidas cuando exista un símbolo adecuado; añadir a
   `icons` solo si no hay equivalente.

El enunciado normativo (RFC 2119), los criterios de cumplimiento verificables y sus fitness functions
viven en el estándar de dominio **Frontend Standards** (`../standards/frontend.md`), no en este ADR.

## Consecuencias

### Positivas

- Una sola API de iconos; búsqueda y revisión más simples.
- Escala de tamaños y color heredado (`currentColor`) coherentes con el resto de la UI.
- Iconos custom alineados a Material 24×24 y centralizados en un sprite.

### Negativas / trade-offs

- Prohibir `mat-icon` / SVG de icono ad hoc exige migrar usos residuales y excepcionar ilustraciones
  no-iconográficas.
- El sprite `icons.svg` es un punto de conflicto en PRs si crece sin proceso.
- Depender de colecciones Factor Icons acopla el look al set disponible (mitigado con `icons`).

## Referencias

- [Frontend Standards](../standards/frontend.md)
- [ADR-006: Presentación con Tailwind CSS](./ADR-006-presentation-tailwind-css.md)
- [Índice de ADRs](./README.md)
