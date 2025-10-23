const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const i18nDir = path.join(__dirname, 'public', 'i18n');
const basesJsonPath = path.join(i18nDir, 'en.json');
const baseJsPath = path.join(i18nDir, 'en.js');

/**
 * Build a safe filename from the validated language code
 */
function makeSafeFilename(langCode, suffix) {
  const sanitized = validateLanguageCode(langCode);
  return `${sanitized}${suffix}`;
}

/**
 * Resolve a file under a base directory and ensure it cannot escape it
 */
function safeResolveUnderDir(dir, filename) {
  // Reject if the filename contains path separators
  if (filename.includes(path.sep) || filename.includes('/')) {
    throw new Error('Invalid filename: contains path separators');
  }
  const resolvedDir = path.resolve(dir);
  const resolved = path.resolve(resolvedDir, filename);
  // Accept when it is exactly the directory (unexpected) or when it starts with dir + sep
  const prefix = resolvedDir.endsWith(path.sep) ? resolvedDir : resolvedDir + path.sep;
  if (resolved !== resolvedDir && !resolved.startsWith(prefix)) {
    throw new Error('Resolved path outside the allowed directory');
  }
  return resolved;
}

/**
 * Read a JS file as a module
 */
async function readJsFile(jsFilePath) {
  if (!fs.existsSync(jsFilePath)) return {};
  // Ensure jsFilePath is inside the i18nDir to prevent path traversal
  const resolvedI18nDir = path.resolve(i18nDir);
  const resolvedJsPath = path.resolve(jsFilePath);
  const prefix = resolvedI18nDir.endsWith(path.sep) ? resolvedI18nDir : resolvedI18nDir + path.sep;
  if (resolvedJsPath !== resolvedI18nDir && !resolvedJsPath.startsWith(prefix)) {
    console.error('❌ Path outside %s detected: %s', i18nDir, jsFilePath);
    return {};
  }

  // Create a temporary file in the same directory to import as a module
  const dirOfFile = path.dirname(resolvedJsPath);
  const baseName = path.basename(resolvedJsPath, '.js');
  const tempMjsPath = path.join(dirOfFile, `.tmp_import_${baseName}.mjs`);
  fs.copyFileSync(resolvedJsPath, tempMjsPath);
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

  if (Object.keys(missingTranslations).length > 0) {
    fs.writeFileSync(missingPath, JSON.stringify(missingTranslations, null, 2), 'utf-8');
    console.warn(`- Missing keys saved in ${missingPath}`);
  } else if (fs.existsSync(missingPath)) {
    fs.unlinkSync(missingPath);
    console.log(`- ${missingPath} removed because there are no missing keys.`);
  }

  // Save target JS
  const content = `export default ${JSON.stringify(orderedTranslations, null, 2)};`;
  fs.writeFileSync(targetJsPath, content, 'utf-8');
  console.log(`- File ${targetJsPath} updated successfully.`);
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

// Function to generate `en.js`
function generateEnJsFile(enTranslations, enFilePath) {
  const enFileContent = `export default ${JSON.stringify(enTranslations, null, 2)};`;
  fs.writeFileSync(enFilePath, enFileContent, 'utf-8');
  console.log(`- File ${enFilePath} generated successfully.`);
}

function processFiles(langCode) {
  // Check if the basesJsonPath file (en.json) exists
  if (fs.existsSync(basesJsonPath)) {
    // Read `en.json`
    const enJson = JSON.parse(fs.readFileSync(basesJsonPath, 'utf-8'));
    const enTranslations = enJson.translations;

    // Generate `en.js`
    generateEnJsFile(enTranslations, baseJsPath);

    // Remove `en.json`
    fs.unlinkSync(basesJsonPath);
  }

  // Update the target language file
  generateLanguage(langCode);
}

// === CLI ===
const rawLangCode = process.argv[2];

if (!rawLangCode) {
  console.error('Usage: node generate-i18n.js <language_code>');
  console.error('Example: node generate-i18n.js es');
  process.exit(1);
}

let langCode;
try {
  langCode = validateLanguageCode(rawLangCode);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

try {
  processFiles(langCode);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
