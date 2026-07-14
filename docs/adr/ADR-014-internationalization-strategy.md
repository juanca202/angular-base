# ADR-014: Estrategia de Internacionalización (i18n)

**Estado:** Aceptado  
**Fecha de Creación:** 06/01/2026  
**Última Actualización:** 14/07/2026  
**Decisores:** Equipo de Arquitectura

## Contexto

La aplicación debe soportar múltiples idiomas para una audiencia global, con cambio de idioma en tiempo de ejecución (sin reconstruir), un flujo de traducción mantenible, sincronización entre código fuente y archivos de traducción, detección automática de traducciones faltantes, e inglés como idioma base. Sin una estrategia definida se corre el riesgo de cadenas hardcodeadas, gestión inconsistente de traducciones y traducciones faltantes que pasan desapercibidas.

## Decisión

Usaremos **i18n integrado de Angular** con **carga de traducciones en tiempo de ejecución** vía `loadTranslations()` de `@angular/localize`:

1. **Extracción por marcado**: atributo `i18n` en templates y `$localize` en clases TypeScript.
2. **`en.json`** como formato base extraído del código fuente (fuente de verdad).
3. **Módulos JS por idioma** (`{lang}.js`) generados a partir de `en.json` para carga en runtime.
4. **Script `generate-i18n.js`** (`npm run extract-i18n`, `npm run i18n -- {lang}`) gestiona la generación, sincronización y detección de traducciones faltantes (`{lang}-missing.json`).
5. **Archivos con sufijo por ámbito** `{lang}-{sufijo}.js` (p. ej. `es-base.js`, `es-module.js`) separan traducciones comunes o por dominio; el script excluye del archivo principal los IDs ya cubiertos por un archivo con sufijo. En runtime se cargan primero los `-base.js` y después el archivo principal, que sobrescribe duplicados.
6. **Detección de locale** con prioridad: preferencia del usuario (localStorage) → `navigator.language` → idioma por defecto (`en`).
7. **Adopción opt-in por proyecto**: el flag `environment.i18n` (boolean) controla si `AppManager` carga traducciones en runtime. Los proyectos nuevos creados a partir de este proyecto base inician con `i18n: false`; el resto de la infraestructura (`public/i18n/*`, `generate-i18n.js`, scripts npm, interceptor HTTP, regla ESLint) permanece siempre presente y se activa poniendo el flag en `true`.

## Activar i18n en un proyecto

1. Poner `i18n: true` en todos los `src/environments/environment*.ts` del proyecto.
2. Marcar el texto visible de la UI con `i18n` (templates) o `$localize` (TypeScript) — ver [Reglas de código](#reglas-de-código).
3. Ejecutar `npm run extract-i18n` y `npm run i18n -- {lang}` para generar los archivos de idioma.
4. Confirmar que este ADR-014 sigue presente en `docs/adr/` del proyecto; si se hubiera perdido en el merge, restaurarlo o documentarlo de nuevo con el skill `adr-manage`.

## Reglas de código

- Todo texto visible en la UI usa `i18n` en templates o `$localize` en TypeScript; nunca cadenas hardcodeadas.
- Comentarios, documentación, nombres de variables y funciones en inglés.
- Contenido externo en otro idioma se traduce a inglés natural antes de mostrarse, preservando el significado.

```html
<button i18n>Save</button>
```

```typescript
title = $localize`User Profile`;
```

## Estructura de archivos

```
public/i18n/
├── en.json          # Base extraída por Angular (fuente de verdad)
├── en.js / es.js     # Módulos runtime por idioma
├── en-base.js / es-base.js  # Traducciones compartidas (carga prioritaria)
└── es-missing.json  # Generado; se elimina al completar traducciones
```

## Consecuencias

### Positivas

- Cambio de idioma en runtime sin recargar ni reconstruir la aplicación.
- Detección automatizada de traducciones faltantes y sincronización con la base en inglés.
- Integración nativa con las capacidades i18n de Angular; `i18n`/`$localize` son sencillos de aplicar.

### Negativas

- Todas las traducciones de un idioma se cargan a la vez (sin code-splitting por feature salvo los archivos con sufijo).
- IDs de traducción numéricos, no legibles por humanos.
- Requiere paso de extracción/build antes de generar archivos de idioma, y traducción manual de las cadenas nuevas.

### Mitigación

- Flujo operativo de traducción de faltantes documentado en el skill `abp-translate-i18n-missing`.
- Para aplicaciones grandes, evaluar carga diferida de traducciones por feature usando archivos con sufijo.

## Referencias

- [Documentación de i18n de Angular](https://angular.dev/guide/i18n)
- [API de Localize de Angular](https://angular.dev/api/localize)
- [Skill: abp-translate-i18n-missing](../../.agents/skills/abp-translate-i18n-missing/SKILL.md)
- [README - Sección de Internacionalización](../../README.md#internationalization-i18n)
