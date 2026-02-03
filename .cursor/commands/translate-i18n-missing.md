# Traducir i18n faltantes

Sigue este flujo en orden.

## 0. Idioma (locale) en formato ISO

- **Primero** asegurarte de que el usuario haya indicado el idioma al que traducir en **formato ISO** (p. ej. `es`, `fr`, `en`).
- Si no lo ha indicado, preguntar: *"Indica el idioma en formato ISO (ej: es, fr) para saber a qué idioma traducir."*
- Usar ese valor como `{locale}` en los pasos siguientes.

## 1. Buscar archivo missing

- Buscar en `public/i18n/` si existe el archivo **`{locale}-missing.json`** (p. ej. `es-missing.json`).
- Si **existe** → ir al paso 4 (aplicar el skill).
- Si **no existe** → ir al paso 2.

## 2. Generar y volver a comprobar

- Ejecutar en la consola: **`npm run i18n -- {locale}`**
- Volver a comprobar si existe **`public/i18n/{locale}-missing.json`**.
- Si **existe** → ir al paso 4 (aplicar el skill).
- Si **no existe** → ir al paso 3.

## 3. Extraer, generar y comprobar de nuevo

- Ejecutar en la consola: **`npm run extract-i18n`**
- Cuando termine, ejecutar: **`npm run i18n -- {locale}`**
- Comprobar de nuevo si existe **`public/i18n/{locale}-missing.json`**.
- Si **existe** → ir al paso 4 (aplicar el skill).
- Si **no existe** → indicar al usuario: **"No hay nada por traducir."** y terminar.

## 4. Aplicar el skill

- Si en algún paso anterior se encontró **`{locale}-missing.json`**, aplicar el skill **translate-i18n-missing** (traducir las cadenas del archivo missing al idioma del locale e incorporarlas a `public/i18n/{locale}.js`).

Ejecuta todo el proceso siguiendo estos pasos.
