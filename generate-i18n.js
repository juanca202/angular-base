const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const i18nDir = path.join(__dirname, 'public', 'i18n');
const baseJsPath = path.join(i18nDir, 'en.js'); // Base siempre es en.js

/**
 * Leer un archivo JS como módulo
 */
async function readJsFile(jsFilePath) {
  if (!fs.existsSync(jsFilePath)) return {};
  const tempMjsPath = jsFilePath.replace('.js', '.mjs');
  fs.copyFileSync(jsFilePath, tempMjsPath);
  try {
    const mod = await import(pathToFileURL(tempMjsPath));
    fs.unlinkSync(tempMjsPath);
    return mod.default || {};
  } catch (err) {
    console.error(`❌ Error al importar ${tempMjsPath}:`, err);
    return {};
  }
}

/**
 * Generar o actualizar archivo del idioma destino
 */
async function generateLanguage(langCode) {
  if (!fs.existsSync(baseJsPath)) {
    console.error(`❌ No se encontró el archivo base: ${baseJsPath}`);
    return;
  }

  const targetJsPath = path.join(i18nDir, `${langCode}.js`);
  const missingPath = path.join(i18nDir, `${langCode}_missing.json`);

  const baseTranslations = await readJsFile(baseJsPath);
  const targetTranslations = await readJsFile(targetJsPath);

  const orderedTranslations = {};
  const missingTranslations = {};

  Object.keys(baseTranslations).forEach((key) => {
    if (targetTranslations.hasOwnProperty(key)) {
      orderedTranslations[key] = targetTranslations[key];
    } else {
      missingTranslations[key] = baseTranslations[key];
    }
  });

  // Leer claves faltantes previas
  let completedTranslations = {};
  if (fs.existsSync(missingPath)) {
    try {
      completedTranslations = JSON.parse(fs.readFileSync(missingPath, 'utf-8'));
      Object.keys(completedTranslations).forEach((key) => {
        if (!targetTranslations.hasOwnProperty(key)) {
          orderedTranslations[key] = completedTranslations[key];
        }
      });
    } catch (err) {
      console.error(`❌ Error al leer ${missingPath}:`, err);
    }
  }

  // Guardar realmente faltantes
  const stillMissing = {};
  Object.keys(missingTranslations).forEach((key) => {
    if (!completedTranslations.hasOwnProperty(key)) {
      stillMissing[key] = baseTranslations[key];
    }
  });

  if (Object.keys(stillMissing).length > 0) {
    fs.writeFileSync(missingPath, JSON.stringify(stillMissing, null, 2), 'utf-8');
    console.log(`⚠️ Claves faltantes guardadas en ${missingPath}`);
  } else if (fs.existsSync(missingPath)) {
    fs.unlinkSync(missingPath);
    console.log(`✅ ${missingPath} eliminado porque no hay claves faltantes.`);
  }

  // Guardar target JS
  const content = `export default ${JSON.stringify(orderedTranslations, null, 2)};`;
  fs.writeFileSync(targetJsPath, content, 'utf-8');
  console.log(`✅ Archivo ${targetJsPath} actualizado correctamente.`);
}

/**
 * Validar y sanitizar el código de idioma
 */
function validateLanguageCode(langCode) {
  // Validar que el código de idioma sea alfanumérico y no contenga caracteres peligrosos
  if (!langCode || typeof langCode !== 'string') {
    throw new Error('Código de idioma inválido: debe ser una cadena no vacía');
  }

  // Solo permitir caracteres alfanuméricos y guiones bajos
  if (!/^[a-zA-Z0-9_]+$/.test(langCode)) {
    throw new Error('Código de idioma inválido: solo se permiten letras, números y guiones bajos');
  }

  // Longitud máxima razonable
  if (langCode.length > 10) {
    throw new Error('Código de idioma inválido: longitud máxima de 10 caracteres');
  }

  return langCode;
}

// === CLI ===
const rawLangCode = process.argv[2];

if (!rawLangCode) {
  console.error('❌ Uso: node generate-i18n.js <codigo_idioma>');
  console.error('Ejemplo: node generate-i18n.js es');
  process.exit(1);
}

let langCode;
try {
  langCode = validateLanguageCode(rawLangCode);
} catch (error) {
  console.error(`❌ ${error.message}`);
  process.exit(1);
}

generateLanguage(langCode).catch((err) => console.error('❌ Error en el proceso:', err));
