const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const i18nDir = path.join(__dirname, 'public', 'i18n');
const baseJsPath = path.join(i18nDir, 'en.js'); // Base is always en.js

/**
 * Read a JS file as a module
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
    console.error(`❌ Error importing ${tempMjsPath}:`, err);
    return {};
  }
}

/**
 * Generate or update the target language file
 */
async function generateLanguage(langCode) {
  if (!fs.existsSync(baseJsPath)) {
    console.error(`❌ Base file not found: ${baseJsPath}`);
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

  // Read previously missing keys
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
      console.error(`❌ Error reading ${missingPath}:`, err);
    }
  }

  // Save keys that are still missing
  const stillMissing = {};
  Object.keys(missingTranslations).forEach((key) => {
    if (!completedTranslations.hasOwnProperty(key)) {
      stillMissing[key] = baseTranslations[key];
    }
  });

  if (Object.keys(stillMissing).length > 0) {
    fs.writeFileSync(missingPath, JSON.stringify(stillMissing, null, 2), 'utf-8');
    console.log(`⚠️ Missing keys saved in ${missingPath}`);
  } else if (fs.existsSync(missingPath)) {
    fs.unlinkSync(missingPath);
    console.log(`✅ ${missingPath} removed because there are no missing keys.`);
  }

  // Save target JS
  const content = `export default ${JSON.stringify(orderedTranslations, null, 2)};`;
  fs.writeFileSync(targetJsPath, content, 'utf-8');
  console.log(`✅ File ${targetJsPath} updated successfully.`);
}

/**
 * Validate and sanitize the language code
 */
function validateLanguageCode(langCode) {
  // Validate that the language code is alphanumeric and contains no dangerous characters
  if (!langCode || typeof langCode !== 'string') {
    throw new Error('Invalid language code: must be a non-empty string');
  }

  // Allow only alphanumeric characters and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(langCode)) {
    throw new Error('Invalid language code: only letters, numbers and underscores are allowed');
  }

  // Reasonable maximum length
  if (langCode.length > 10) {
    throw new Error('Invalid language code: maximum length is 10 characters');
  }

  return langCode;
}

// === CLI ===
const rawLangCode = process.argv[2];

if (!rawLangCode) {
  console.error('❌ Usage: node generate-i18n.js <language_code>');
  console.error('Example: node generate-i18n.js es');
  process.exit(1);
}

let langCode;
try {
  langCode = validateLanguageCode(rawLangCode);
} catch (error) {
  console.error(`❌ ${error.message}`);
  process.exit(1);
}

generateLanguage(langCode).catch((err) => console.error('❌ Process error:', err));
