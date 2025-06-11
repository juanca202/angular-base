const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const enJsonPath = path.join(__dirname, 'public/i18n/en.json');
const esJsPath = path.join(__dirname, 'public/i18n/es.js');
const enJsPath = path.join(__dirname, 'public/i18n/en.js');
const missingTranslationsPath = path.join(__dirname, 'public/i18n/es_missing.json');

// Función para leer `es.js` usando un archivo temporal `.mjs`
async function readEsJsFile(esFilePath) {
  if (!fs.existsSync(esFilePath)) return {};

  const tempMjsPath = esFilePath.replace('.js', '.mjs');
  fs.copyFileSync(esFilePath, tempMjsPath);

  try {
    const esModule = await import(pathToFileURL(tempMjsPath));
    fs.unlinkSync(tempMjsPath);
    return esModule.default || {};
  } catch (error) {
    console.error(`❌ Error al importar ${tempMjsPath}:`, error);
    return {};
  }
}

// Función para actualizar o crear `es.js`
async function updateOrCreateEsJsFile(esFilePath, enTranslations) {
  const esTranslations = await readEsJsFile(esFilePath);
  const orderedTranslations = {};
  const missingTranslations = {};

  // Ordenar las claves existentes en `es.js` según `en.json`
  Object.keys(enTranslations).forEach(key => {
    if (esTranslations.hasOwnProperty(key)) {
      orderedTranslations[key] = esTranslations[key];
    } else {
      missingTranslations[key] = enTranslations[key]; // Guardar claves faltantes
    }
  });

  // Leer `missing_translations.json` y filtrar claves que ya existen en `es.js`
  let completedTranslations = {};
  if (fs.existsSync(missingTranslationsPath)) {
    try {
      completedTranslations = JSON.parse(fs.readFileSync(missingTranslationsPath, 'utf-8'));
      Object.keys(completedTranslations).forEach(key => {
        if (!esTranslations.hasOwnProperty(key)) {
          orderedTranslations[key] = completedTranslations[key]; // Solo agregar si sigue faltando
        }
      });
    } catch (error) {
      console.error(`❌ Error al leer ${missingTranslationsPath}:`, error);
    }
  }

  // Guardar claves realmente faltantes en `missing_translations.json`
  const stillMissing = {};
  Object.keys(missingTranslations).forEach(key => {
    if (!completedTranslations.hasOwnProperty(key)) {
      stillMissing[key] = enTranslations[key]; // Solo guardar las realmente faltantes
    }
  });

  if (Object.keys(stillMissing).length > 0) {
    fs.writeFileSync(missingTranslationsPath, JSON.stringify(stillMissing, null, 2), 'utf-8');
    console.log(`⚠️ Aún hay claves faltantes en es.js. Complétalas en ${missingTranslationsPath}.`);
  } else {
    // Si no hay claves faltantes, borrar el archivo `es_missing.json`
    if (fs.existsSync(missingTranslationsPath)) {
      fs.unlinkSync(missingTranslationsPath);
      console.log(`✅ El archivo ${missingTranslationsPath} ha sido eliminado porque no hay claves faltantes.`);
    }
  }

  // Guardar `es.js`
  const esFileContent = `export default ${JSON.stringify(orderedTranslations, null, 2)};`;
  fs.writeFileSync(esFilePath, esFileContent, 'utf-8');
  console.log(`✅ Archivo ${esFilePath} actualizado correctamente.`);
}

// Función para generar `en.js`
function generateEnJsFile(enTranslations, enFilePath) {
  const enFileContent = `export default ${JSON.stringify(enTranslations, null, 2)};`;
  fs.writeFileSync(enFilePath, enFileContent, 'utf-8');
  console.log(`✅ Archivo ${enFilePath} generado correctamente.`);
}

// Función principal
async function processFiles() {
  // Leer `en.json`
  const enJson = JSON.parse(fs.readFileSync(enJsonPath, 'utf-8'));
  const enTranslations = enJson.translations;

  // Actualizar `es.js`
  await updateOrCreateEsJsFile(esJsPath, enTranslations);

  // Generar `en.js`
  generateEnJsFile(enTranslations, enJsPath);

  // Elimina archivo json
  fs.unlinkSync(enJsonPath);
}

processFiles().catch((error) => console.error("❌ Hubo un error en el proceso:", error));
