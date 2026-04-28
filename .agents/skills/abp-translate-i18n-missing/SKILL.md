---
name: abp-translate-i18n-missing
description: Flujo completo para traducir cadenas i18n faltantes. Obtiene el locale, genera el archivo missing si hace falta (npm run i18n, extract-i18n), traduce las cadenas al idioma indicado y las incorpora a public/i18n/{locale}.js. Usar cuando el usuario quiera traducir i18n faltantes.
---

# Traducir i18n faltantes

Flujo completo para detectar, generar (si hace falta) y traducir las cadenas del archivo `{locale}-missing.json` al idioma del locale, incorporándolas a `public/i18n/{locale}.js`.

## Fase 0. Idioma (locale) en formato ISO

- **Primero** asegurarte de que el usuario haya indicado el idioma al que traducir en **formato ISO** (p. ej. `es`, `fr`, `en`).
- Si no lo ha indicado, preguntar: *"Indica el idioma en formato ISO (ej: es, fr) para saber a qué idioma traducir."*
- Usar ese valor como `{locale}` en los pasos siguientes.

## Fase 1. Buscar archivo missing

- Buscar en `public/i18n/` si existe el archivo **`{locale}-missing.json`** (p. ej. `es-missing.json`).
- Si **existe** → ir a la **Fase 5** (traducir).
- Si **no existe** → ir a la **Fase 2**.

## Fase 2. Generar y volver a comprobar

- Ejecutar en la consola: **`npm run i18n -- {locale}`**
- Volver a comprobar si existe **`public/i18n/{locale}-missing.json`**.
- Si **existe** → ir a la **Fase 5** (traducir).
- Si **no existe** → ir a la **Fase 3**.

## Fase 3. Extraer, generar y comprobar de nuevo

- Ejecutar en la consola: **`npm run extract-i18n`**
- Cuando termine, ejecutar: **`npm run i18n -- {locale}`**
- Comprobar de nuevo si existe **`public/i18n/{locale}-missing.json`**.
- Si **existe** → ir a la **Fase 5** (traducir).
- Si **no existe** → indicar al usuario: **"No hay nada por traducir."** y terminar.

## Fase 4. No hay nada por traducir

- Si tras las fases 1–3 no se encontró `{locale}-missing.json`, informar al usuario y terminar.

## Fase 5. Traducir e incorporar

Cuando en alguna fase anterior se encontró **`{locale}-missing.json`**:

### 5.1 Leer el archivo missing

- El archivo es JSON: claves = IDs de mensaje (numéricos como string), valores = texto **en inglés** a traducir.
- Ejemplo: `"7656051180617915023": "Create Quote"` → para `es` debe quedar `"7656051180617915023": "Crear cotización"` (o equivalente).

### 5.2 Traducir

- Traducir cada **valor** al idioma del locale (español para `es`, francés para `fr`, etc.).
- **No traducir ni modificar** placeholders; dejarlos exactamente igual:
  - `{$START_LINK}`, `{$CLOSE_LINK}`, `{$START_TAG_STRONG}`, `{$CLOSE_TAG_STRONG}`, `{$INTERPOLATION}`, `{$INTERPOLATION_1}`, `{$PH}`, `{$START_BLOCK_IF}`, `{$CLOSE_BLOCK_IF}`, `{$START_BLOCK_ELSE}`, `{$CLOSE_BLOCK_ELSE}`, `{$START_TAG_SPAN}`, `{$CLOSE_TAG_SPAN}`, `{$START_TAG_MAT_ICON}`, `{$CLOSE_TAG_MAT_ICON}`, y variantes con sufijos `_1`, `_2`, etc.
- Mantener el mismo estilo y tono que el resto del archivo de idioma (tuteo/voseo, puntuación, espacios).

### 5.3 Escribir en el archivo de idioma

- Archivo destino: `public/i18n/{locale}.js`.
- Estructura del archivo: `export default { ... };`
- **Añadir solo las nuevas entradas al final del objeto**, justo antes de `};`:
  1. En la **última línea existente** del objeto (la que está antes de `};`), asegurar que termine en **coma** (`,`).
  2. Añadir una línea por cada clave del missing, formato: `  "ID": "Traducción",`
  3. En la **última línea añadida** no poner coma (para que el JSON/objeto sea válido).

Ejemplo de bloque a insertar (español):

```js
  "7656051180617915023": "Crear cotización",
  "1986145234404113222": "Servicios de interés",
  "1085053704398140755": "ID estatal"
};
```

(El `};` cierra el objeto; la línea anterior no lleva coma.)

### 5.4 Eliminar el archivo missing

- Al final del proceso, **eliminar** el archivo `public/i18n/{locale}-missing.json` (p. ej. `es-missing.json`) tras haber incorporado todas las claves al `{locale}.js`.

## Resumen de reglas

| Regla | Detalle |
|-------|---------|
| Origen | Texto en inglés en `public/i18n/{locale}-missing.json` |
| Destino | `public/i18n/{locale}.js`, al final del objeto |
| Placeholders | No traducir; copiar tal cual (`{$...}`) |
| Formato | Una línea por entrada, última entrada sin coma antes de `};` |
| Idioma | locale en ISO: `es` → español, `fr` → francés, `en` → inglés; otros según convención del proyecto |
| Cierre | Eliminar `public/i18n/{locale}-missing.json` al terminar |
