---
name: translate-i18n-missing
description: Traduce las cadenas del archivo {locale}-missing.json al idioma del locale y las agrega al final del archivo de idioma (p. ej. es.js). Usar cuando exista public/i18n/{locale}-missing.json tras el flujo del comando translate-i18n-missing (locale en formato ISO: es, fr, en, etc.).
---

# Traducir i18n faltantes

## Objetivo

Tomar las cadenas en inglés del archivo `public/i18n/{locale}-missing.json`, traducirlas al idioma indicado por el locale (formato ISO), añadirlas **al final del objeto** en `public/i18n/{locale}.js` (sin borrar entradas existentes) y **eliminar** el archivo `{locale}-missing.json` al finalizar.

## Cuándo usar

- Existe un archivo `public/i18n/{locale}-missing.json` (p. ej. `es-missing.json`).
- El comando translate-i18n-missing ya ejecutó la búsqueda y, si hacía falta, `npm run i18n -- {locale}` y/o `npm run extract-i18n`, y ha detectado que hay missing para ese locale.

## Proceso

### 1. Detección

- El **locale** es el idioma en formato ISO indicado por el usuario (p. ej. `es`, `fr`, `en`).
- El archivo a usar es `public/i18n/{locale}-missing.json` (con guión, no underscore).

### 2. Leer el archivo missing

- El archivo es JSON: claves = IDs de mensaje (numéricos como string), valores = texto **en inglés** a traducir.
- Ejemplo: `"7656051180617915023": "Create Quote"` → para `es` debe quedar `"7656051180617915023": "Crear cotización"` (o equivalente).

### 3. Traducir

- Traducir cada **valor** al idioma del locale (español para `es`, francés para `fr`, etc.).
- **No traducir ni modificar** placeholders; dejarlos exactamente igual:
  - `{$START_LINK}`, `{$CLOSE_LINK}`, `{$START_TAG_STRONG}`, `{$CLOSE_TAG_STRONG}`, `{$INTERPOLATION}`, `{$INTERPOLATION_1}`, `{$PH}`, `{$START_BLOCK_IF}`, `{$CLOSE_BLOCK_IF}`, `{$START_BLOCK_ELSE}`, `{$CLOSE_BLOCK_ELSE}`, `{$START_TAG_SPAN}`, `{$CLOSE_TAG_SPAN}`, `{$START_TAG_MAT_ICON}`, `{$CLOSE_TAG_MAT_ICON}`, y variantes con sufijos `_1`, `_2`, etc.
- Mantener el mismo estilo y tono que el resto del archivo de idioma (tuteo/voseo, puntuación, espacios).

### 4. Escribir en el archivo de idioma

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

### 5. Eliminar el archivo missing

- Al final del proceso, **eliminar** el archivo `public/i18n/{locale}-missing.json` (p. ej. `es-missing.json`) tras haber incorporado todas las claves al `{locale}.js`.

## Resumen de reglas

| Regla | Detalle |
|-------|--------|
| Origen | Texto en inglés en `public/i18n/{locale}-missing.json` |
| Destino | `public/i18n/{locale}.js`, al final del objeto |
| Placeholders | No traducir; copiar tal cual (`{$...}`) |
| Formato | Una línea por entrada, última entrada sin coma antes de `};` |
| Idioma | locale en ISO: `es` → español, `fr` → francés, `en` → inglés; otros según convención del proyecto |
| Cierre | Eliminar `public/i18n/{locale}-missing.json` al terminar |
