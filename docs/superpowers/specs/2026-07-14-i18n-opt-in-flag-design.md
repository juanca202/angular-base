# Diseño: flag `environment.i18n` para hacer opt-in la estrategia i18n

## Contexto

Este repositorio (`angular-base-project`) es la plantilla base que otros proyectos incorporan vía `git merge` (skill `project-create`). Actualmente la estrategia i18n de [ADR-014](../../adr/ADR-014-internationalization-strategy.md) está siempre activa: `AppManager` carga traducciones en runtime sin condición alguna.

Se quiere que un proyecto creado a partir de esta base **no ofrezca i18n por defecto**, pero pueda **activarla** cuando la necesite, sin tener que tocar el skill `project-create` (que es compartido con otras plantillas/stacks). El mecanismo debe vivir enteramente en este repo.

## Decisión de diseño

Agregar un flag booleano opcional `i18n` a la interfaz `Environment`, siguiendo el mismo patrón ya usado por `googleTagManager` (campo opcional, chequeado con `if` antes de activar la funcionalidad).

- Los archivos de entorno de esta plantilla (`environment.ts`, `environment.development.ts`) fijan `i18n: false` explícitamente. Como estos archivos viajan tal cual al hacer merge, cualquier proyecto nuevo hereda `i18n: false` — cumple "no se ofrece por defecto".
- `AppManager.setLocale()` sigue resolviendo el locale (preferencia de usuario → `navigator.language` → `defaultLocale`) y guardándolo en storage **siempre**, activado o no el flag. Esto es importante: `LOCALE_ID` y el `languageInterceptor` dependen de `getLocale()`, y no deben verse afectados por el flag.
- Solo el bloque que hace `import()` dinámico de `public/i18n/{locale}-base.js` / `{locale}.js` y `loadTranslations()` queda condicionado a `if (environment.i18n)`.
- Nada se borra: `public/i18n/*`, `generate-i18n.js`, los scripts npm (`extract-i18n`, `i18n`), el interceptor y la regla ESLint de templates permanecen intactos y listos para activarse con solo poner el flag en `true`.

### Trade-off aceptado

Al fijar `i18n: false` en los `environment.*.ts` de este propio repo, la plantilla base deja de cargar traducciones por defecto al correr `npm start`. Es una decisión consciente: este repo es la fuente que se copia a proyectos nuevos, así que su propio default determina el default heredado. Nada se rompe — la infraestructura sigue ahí, dormida hasta activarla.

## Alcance de los cambios

| Archivo | Cambio |
|---|---|
| `src/app/core/models/environment.ts` | Agregar `i18n?: boolean;` a la interfaz `Environment`. |
| `src/environments/environment.ts` | Agregar `i18n: false`. |
| `src/environments/environment.development.ts` | Agregar `i18n: false`. |
| `src/app/core/services/app-manager.ts` | Envolver en `setLocale()` el bloque de carga de traducciones (`import()` + `loadTranslations()`, líneas ~131-141 actuales) en `if (environment.i18n) { ... }`. El resto del método no cambia. |
| `docs/adr/ADR-014-internationalization-strategy.md` | Documentar que la estrategia es opt-in vía `environment.i18n`, con checklist corto de activación (poner flag en `true`, marcar textos con `i18n`/`$localize` si aún no está hecho, correr `extract-i18n`/`i18n`, confirmar que el ADR-014 sigue presente en `docs/adr/` del proyecto — restaurarlo con el skill `adr-manage` si no estuviera). |

No se modifica `project-create` ni ningún otro skill compartido. No se modifican tests existentes: no hay aserciones directas sobre `loadTranslations`/`setLocale` (es privado) en `app-manager.spec.ts`.

## Fuera de alcance

- No se corrige el bug preexistente de que el segundo `import()` en `setLocale()` no tiene `try/catch` (si `{locale}.js` no existe, rompe el bootstrap). Es un problema independiente del flag: solo aplica cuando `i18n: true`, que sigue siendo el comportamiento actual sin cambios.
- No se oculta ni condiciona el componente `language-picker` de `features/settings`; queda fuera de alcance de este cambio.
- No se toca el skill global `project-create` — la activación/desactivación queda documentada para que el usuario la aplique manualmente tras crear un proyecto.

## Testing

- Verificar que `npm run build` y `ng test` siguen pasando con `i18n: false`.
- Verificar manualmente que al poner `i18n: true` en un environment, el comportamiento de carga de traducciones es idéntico al actual (sin regresión).
