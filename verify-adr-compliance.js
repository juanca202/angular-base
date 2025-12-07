#!/usr/bin/env node

/**
 * Script para verificar el cumplimiento de los ADRs de arquitectura
 * Genera un reporte detallado de cumplimiento
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, 'src');
const APP_DIR = path.join(SRC_DIR, 'app');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Resultados de verificación
const results = {
  'ADR-001': { name: 'Separación de Responsabilidades', passed: 0, failed: 0, warnings: 0, issues: [] },
  'ADR-002': { name: 'Guía de Estilo Angular', passed: 0, failed: 0, warnings: 0, issues: [] },
  'ADR-003': { name: 'Tailwind CSS', passed: 0, failed: 0, warnings: 0, issues: [] },
  'ADR-005': { name: 'Internacionalización (i18n)', passed: 0, failed: 0, warnings: 0, issues: [] },
  'ADR-006': { name: 'Patrón Repository', passed: 0, failed: 0, warnings: 0, issues: [] },
  'ADR-008': { name: 'Validación de Formularios', passed: 0, failed: 0, warnings: 0, issues: [] },
  'ADR-010': { name: 'Estrategia de Iconos', passed: 0, failed: 0, warnings: 0, issues: [] },
  'ADR-012': { name: 'Modificadores de Acceso', passed: 0, failed: 0, warnings: 0, issues: [] },
  'ADR-013': { name: 'Layout de Formularios', passed: 0, failed: 0, warnings: 0, issues: [] }
};

/**
 * Función auxiliar para leer archivos recursivamente
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      // Excluir node_modules y otros directorios
      if (!file.startsWith('.') && file !== 'node_modules') {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

/**
 * Leer contenido de archivo
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return '';
  }
}

/**
 * Verificar ADR-001: Separación de Responsabilidades
 */
function verifyADR001() {
  console.log(`${colors.cyan}Verificando ADR-001: Separación de Responsabilidades...${colors.reset}`);
  
  const issues = [];
  const coreDir = path.join(APP_DIR, 'core');
  const sharedDir = path.join(APP_DIR, 'shared');
  const crossDir = path.join(APP_DIR, 'cross');
  const featuresDir = path.join(APP_DIR, 'features');

  // Verificar estructura de carpetas
  if (!fs.existsSync(coreDir)) {
    issues.push({ type: 'error', message: 'Carpeta core/ no existe' });
    results['ADR-001'].failed++;
  } else {
    results['ADR-001'].passed++;
  }

  if (!fs.existsSync(sharedDir)) {
    issues.push({ type: 'error', message: 'Carpeta shared/ no existe' });
    results['ADR-001'].failed++;
  } else {
    results['ADR-001'].passed++;
  }

  if (!fs.existsSync(crossDir)) {
    issues.push({ type: 'warning', message: 'Carpeta cross/ no existe (puede ser normal si no hay dominios transversales)' });
    results['ADR-001'].warnings++;
  } else {
    results['ADR-001'].passed++;
  }

  if (!fs.existsSync(featuresDir)) {
    issues.push({ type: 'error', message: 'Carpeta features/ no existe' });
    results['ADR-001'].failed++;
  } else {
    results['ADR-001'].passed++;
  }

  // Verificar dependencias prohibidas
  const tsFiles = getAllFiles(APP_DIR).filter(f => f.endsWith('.ts') && !f.endsWith('.spec.ts'));
  
  tsFiles.forEach(file => {
    const content = readFile(file);
    const relativePath = path.relative(APP_DIR, file);

    // Core no debe depender de Shared, Cross o Features
    if (relativePath.startsWith('core/')) {
      if (content.includes("from '@/shared/") || content.includes("from '../shared/") || 
          content.includes("from '@/cross/") || content.includes("from '../cross/") ||
          content.includes("from '@/features/") || content.includes("from '../features/")) {
        issues.push({ 
          type: 'error', 
          message: `Core no debe depender de otras capas: ${relativePath}` 
        });
        results['ADR-001'].failed++;
      }
    }

    // Shared no debe depender de Features
    if (relativePath.startsWith('shared/')) {
      if (content.includes("from '@/features/") || content.includes("from '../features/")) {
        issues.push({ 
          type: 'error', 
          message: `Shared no debe depender de Features: ${relativePath}` 
        });
        results['ADR-001'].failed++;
      }
    }

    // Cross no debe depender de Shared o Features
    if (relativePath.startsWith('cross/')) {
      if (content.includes("from '@/shared/") || content.includes("from '../shared/") ||
          content.includes("from '@/features/") || content.includes("from '../features/")) {
        issues.push({ 
          type: 'error', 
          message: `Cross solo puede depender de Core: ${relativePath}` 
        });
        results['ADR-001'].failed++;
      }
    }

    // Features no deben depender de otras Features
    if (relativePath.startsWith('features/')) {
      const featureMatch = relativePath.match(/features\/([^\/]+)/);
      if (featureMatch) {
        const currentFeature = featureMatch[1];
        const otherFeatures = content.match(/from ['"]@\/features\/([^'"]+)/g) || [];
        otherFeatures.forEach(importLine => {
          const match = importLine.match(/features\/([^'"]+)/);
          if (match && match[1] !== currentFeature && !match[1].startsWith(currentFeature + '/')) {
            issues.push({ 
              type: 'error', 
              message: `Feature ${currentFeature} no debe depender de otras features: ${relativePath}` 
            });
            results['ADR-001'].failed++;
          }
        });
      }
    }
  });

  results['ADR-001'].issues = issues;
}

/**
 * Verificar ADR-002: Guía de Estilo Angular
 */
function verifyADR002() {
  console.log(`${colors.cyan}Verificando ADR-002: Guía de Estilo Angular...${colors.reset}`);
  
  const issues = [];
  const tsFiles = getAllFiles(APP_DIR).filter(f => f.endsWith('.ts') && !f.endsWith('.spec.ts'));

  tsFiles.forEach(file => {
    const content = readFile(file);
    const relativePath = path.relative(APP_DIR, file);

    // Verificar uso de inject() vs constructor injection
    if (content.includes('constructor(') && content.includes('private ') && 
        !content.includes('inject(') && content.includes('@Injectable') || content.includes('@Component')) {
      // Verificar si es un servicio o componente que debería usar inject()
      if (content.includes('@Injectable') || content.includes('@Component')) {
        issues.push({ 
          type: 'warning', 
          message: `Considerar usar inject() en lugar de constructor injection: ${relativePath}` 
        });
        results['ADR-002'].warnings++;
      }
    }

    // Verificar uso de signals
    if (content.includes('@Component') && !content.includes('signal(') && 
        !content.includes('Signal') && content.includes(': ')) {
      // Solo warning si hay propiedades que podrían ser signals
      if (content.match(/:\s*(string|number|boolean|\[\])\s*[=;]/)) {
        // No es crítico, solo warning
      }
    }

    // Verificar nombres de archivos (kebab-case)
    const fileName = path.basename(file, '.ts');
    if (fileName !== fileName.toLowerCase() && !fileName.includes('-')) {
      if (!['app', 'main', 'polyfills'].includes(fileName)) {
        issues.push({ 
          type: 'warning', 
          message: `Nombre de archivo debería estar en kebab-case: ${relativePath}` 
        });
        results['ADR-002'].warnings++;
      }
    }

    // Verificar uso de input() y output() en lugar de decoradores
    if (content.includes('@Input()') || content.includes('@Output()')) {
      issues.push({ 
        type: 'warning', 
        message: `Considerar usar input() y output() en lugar de decoradores: ${relativePath}` 
      });
      results['ADR-002'].warnings++;
    }
  });

  results['ADR-002'].issues = issues;
}

/**
 * Verificar ADR-003: Tailwind CSS
 */
function verifyADR003() {
  console.log(`${colors.cyan}Verificando ADR-003: Tailwind CSS...${colors.reset}`);
  
  const issues = [];
  const htmlFiles = getAllFiles(APP_DIR).filter(f => f.endsWith('.html'));
  const scssFiles = getAllFiles(APP_DIR).filter(f => f.endsWith('.scss'));

  htmlFiles.forEach(file => {
    const content = readFile(file);
    const relativePath = path.relative(APP_DIR, file);

    // Verificar uso de ngClass
    if (content.includes('[ngClass]')) {
      issues.push({ 
        type: 'error', 
        message: `No usar ngClass, usar [class] bindings: ${relativePath}` 
      });
      results['ADR-003'].failed++;
    }

    // Verificar uso de ngStyle
    if (content.includes('[ngStyle]')) {
      issues.push({ 
        type: 'error', 
        message: `No usar ngStyle, usar [style] bindings: ${relativePath}` 
      });
      results['ADR-003'].failed++;
    }

    // Verificar clases CSS personalizadas sin prefijo ft-
    const classMatches = content.match(/class=["']([^"']+)["']/g) || [];
    classMatches.forEach(match => {
      const classes = match.match(/["']([^"']+)["']/)[1];
      const customClasses = classes.split(' ').filter(c => 
        !c.startsWith('ft-') && 
        !c.match(/^(mat-|cdk-|ng-)/) &&
        !c.match(/^(grid|flex|p-|m-|gap-|text-|bg-|border-|rounded-|w-|h-|max-|min-|md:|lg:|sm:|xl:)/)
      );
      if (customClasses.length > 0 && !classes.includes('ft-')) {
        // Solo warning si hay clases que parecen personalizadas
        if (customClasses.some(c => c.length > 2 && !c.match(/^[a-z]+-[0-9]+$/))) {
          issues.push({ 
            type: 'warning', 
            message: `Considerar usar Tailwind o clases con prefijo ft-: ${relativePath}` 
          });
          results['ADR-003'].warnings++;
        }
      }
    });
  });

  results['ADR-003'].issues = issues;
}

/**
 * Verificar ADR-005: Internacionalización
 */
function verifyADR005() {
  console.log(`${colors.cyan}Verificando ADR-005: Internacionalización (i18n)...${colors.reset}`);
  
  const issues = [];
  const htmlFiles = getAllFiles(APP_DIR).filter(f => f.endsWith('.html'));
  const tsFiles = getAllFiles(APP_DIR).filter(f => f.endsWith('.ts') && !f.endsWith('.spec.ts'));

  htmlFiles.forEach(file => {
    const content = readFile(file);
    const relativePath = path.relative(APP_DIR, file);

    // Buscar texto hardcodeado en templates (texto entre > y < que no tenga i18n)
    const textMatches = content.match(/>([^<>{}\(\)]+)</g) || [];
    textMatches.forEach(match => {
      const text = match.replace(/[><]/g, '').trim();
      // Ignorar espacios, números solos, y atributos
      if (text.length > 2 && 
          !text.match(/^\s*$/) && 
          !text.match(/^[0-9\s\.]+$/) &&
          !text.includes('{{') &&
          !text.includes('|') &&
          !text.match(/^[a-z]+-[a-z-]+$/i) && // clases CSS
          !match.includes('i18n')) {
        // Verificar si el elemento padre tiene i18n
        const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
        const lines = content.split('\n');
        const currentLine = lines[lineNumber - 1];
        
        if (!currentLine.includes('i18n') && !currentLine.match(/<mat-label\s+i18n/) && 
            !currentLine.match(/<mat-error/) && !currentLine.match(/<mat-hint/)) {
          issues.push({ 
            type: 'warning', 
            message: `Texto hardcodeado sin i18n encontrado: "${text.substring(0, 30)}..." en ${relativePath}:${lineNumber}` 
          });
          results['ADR-005'].warnings++;
        }
      }
    });
  });

  tsFiles.forEach(file => {
    const content = readFile(file);
    const relativePath = path.relative(APP_DIR, file);

    // Verificar uso de $localize en strings traducibles
    const stringMatches = content.match(/['"`]([^'"`]+)['"`]/g) || [];
    stringMatches.forEach(match => {
      const str = match.replace(/['"`]/g, '');
      // Buscar strings que parecen texto de UI (más de 3 palabras, mayúsculas, etc.)
      if (str.length > 10 && 
          str.split(' ').length > 2 &&
          !str.includes('http') &&
          !str.includes('@') &&
          !str.includes('$') &&
          !match.includes('$localize') &&
          !str.match(/^[a-z-]+$/i) && // no es solo un identificador
          content.includes('@Component') || content.includes('@Injectable')) {
        // Solo warning, no error
        if (str.match(/[A-Z]/) && str.length > 15) {
          issues.push({ 
            type: 'warning', 
            message: `Considerar usar $localize para strings traducibles: ${relativePath}` 
          });
          results['ADR-005'].warnings++;
        }
      }
    });
  });

  results['ADR-005'].issues = issues;
}

/**
 * Verificar ADR-006: Patrón Repository
 */
function verifyADR006() {
  console.log(`${colors.cyan}Verificando ADR-006: Patrón Repository...${colors.reset}`);
  
  const issues = [];
  const repositoryFiles = getAllFiles(APP_DIR).filter(f => 
    f.includes('repository') && f.endsWith('.ts') && !f.endsWith('.spec.ts')
  );

  repositoryFiles.forEach(file => {
    const content = readFile(file);
    const relativePath = path.relative(APP_DIR, file);

    // Verificar uso de getMutations y getResource
    if (content.includes('class') && content.includes('Repository')) {
      if (!content.includes('getMutations') && !content.includes('getResource')) {
        issues.push({ 
          type: 'warning', 
          message: `Repository debería usar getMutations() o getResource(): ${relativePath}` 
        });
        results['ADR-006'].warnings++;
      } else {
        results['ADR-006'].passed++;
      }

      // Verificar uso de getApiUrl
      if (content.includes('httpClient') && !content.includes('getApiUrl')) {
        issues.push({ 
          type: 'error', 
          message: `Repository debería usar getApiUrl() para endpoints: ${relativePath}` 
        });
        results['ADR-006'].failed++;
      } else if (content.includes('getApiUrl')) {
        results['ADR-006'].passed++;
      }
    }
  });

  results['ADR-006'].issues = issues;
}

/**
 * Verificar ADR-008: Validación de Formularios
 */
function verifyADR008() {
  console.log(`${colors.cyan}Verificando ADR-008: Validación de Formularios...${colors.reset}`);
  
  const issues = [];
  const htmlFiles = getAllFiles(APP_DIR).filter(f => f.endsWith('.html'));
  const tsFiles = getAllFiles(APP_DIR).filter(f => f.endsWith('.ts') && !f.endsWith('.spec.ts'));

  htmlFiles.forEach(file => {
    const content = readFile(file);
    const relativePath = path.relative(APP_DIR, file);

    // Verificar uso de formularios reactivos
    if (content.includes('formControlName') || content.includes('[formGroup]')) {
      results['ADR-008'].passed++;
      
      // Verificar uso de pipe errorMessage
      if (content.includes('mat-error') && !content.includes('errorMessage')) {
        issues.push({ 
          type: 'warning', 
          message: `Considerar usar pipe errorMessage para mensajes de error: ${relativePath}` 
        });
        results['ADR-008'].warnings++;
      } else if (content.includes('errorMessage')) {
        results['ADR-008'].passed++;
      }
    }

    // Verificar uso de ngModel (no debería usarse)
    if (content.includes('[(ngModel)]')) {
      issues.push({ 
        type: 'error', 
        message: `No usar ngModel, usar formularios reactivos: ${relativePath}` 
      });
      results['ADR-008'].failed++;
    }
  });

  tsFiles.forEach(file => {
    const content = readFile(file);
    const relativePath = path.relative(APP_DIR, file);

    // Verificar uso de FormBuilder
    if (content.includes('@Component') && content.includes('formControlName')) {
      if (!content.includes('FormBuilder') && !content.includes('FormGroup')) {
        issues.push({ 
          type: 'warning', 
          message: `Componente con formulario debería usar FormBuilder: ${relativePath}` 
        });
        results['ADR-008'].warnings++;
      }
    }
  });

  results['ADR-008'].issues = issues;
}

/**
 * Verificar ADR-010: Estrategia de Iconos
 */
function verifyADR010() {
  console.log(`${colors.cyan}Verificando ADR-010: Estrategia de Iconos...${colors.reset}`);
  
  const issues = [];
  const htmlFiles = getAllFiles(APP_DIR).filter(f => f.endsWith('.html'));

  htmlFiles.forEach(file => {
    const content = readFile(file);
    const relativePath = path.relative(APP_DIR, file);

    // Verificar uso de mat-icon (no debería usarse)
    if (content.includes('<mat-icon>') || content.includes('mat-icon')) {
      issues.push({ 
        type: 'error', 
        message: `No usar mat-icon, usar componente ft-icon: ${relativePath}` 
      });
      results['ADR-010'].failed++;
    }

    // Verificar uso de ft-icon
    if (content.includes('<ft-icon') || content.includes('ft-icon')) {
      results['ADR-010'].passed++;
    }
  });

  results['ADR-010'].issues = issues;
}

/**
 * Verificar ADR-012: Modificadores de Acceso
 */
function verifyADR012() {
  console.log(`${colors.cyan}Verificando ADR-012: Modificadores de Acceso...${colors.reset}`);
  
  const issues = [];
  const tsFiles = getAllFiles(APP_DIR).filter(f => f.endsWith('.ts') && !f.endsWith('.spec.ts'));

  tsFiles.forEach(file => {
    const content = readFile(file);
    const relativePath = path.relative(APP_DIR, file);

    // Verificar propiedades sin modificador de acceso
    const propertyMatches = content.match(/\n\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:=]/g) || [];
    propertyMatches.forEach(match => {
      const propName = match.match(/\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:=]/)[1];
      const line = content.substring(0, content.indexOf(match)).split('\n').pop();
      
      // Ignorar lifecycle hooks y algunos casos especiales
      if (!['ngOnInit', 'ngOnDestroy', 'ngAfterViewInit', 'ngOnChanges', 'ngAfterContentInit'].includes(propName) &&
          !line.includes('public ') && !line.includes('private ') && !line.includes('protected ') &&
          !line.includes('readonly ') && !line.includes('@Input') && !line.includes('@Output') &&
          !line.includes('input(') && !line.includes('output(') && !line.includes('signal(') &&
          !line.includes('computed(') && !line.includes('effect(')) {
        // Verificar si está dentro de una clase
        const beforeMatch = content.substring(0, content.indexOf(match));
        if (beforeMatch.includes('class ') || beforeMatch.includes('export class')) {
          issues.push({ 
            type: 'warning', 
            message: `Propiedad sin modificador de acceso explícito: ${propName} en ${relativePath}` 
          });
          results['ADR-012'].warnings++;
        }
      }
    });
  });

  results['ADR-012'].issues = issues;
}

/**
 * Verificar ADR-013: Layout de Formularios
 */
function verifyADR013() {
  console.log(`${colors.cyan}Verificando ADR-013: Layout de Formularios...${colors.reset}`);
  
  const issues = [];
  const htmlFiles = getAllFiles(APP_DIR).filter(f => f.endsWith('.html'));

  htmlFiles.forEach(file => {
    const content = readFile(file);
    const relativePath = path.relative(APP_DIR, file);

    // Verificar uso de grid en formularios
    if (content.includes('formControlName') || content.includes('[formGroup]')) {
      // Buscar mat-form-field sin grid contenedor
      const formFields = content.match(/<mat-form-field[^>]*>/g) || [];
      if (formFields.length > 0) {
        // Verificar si hay un contenedor grid
        const hasGrid = content.includes('class="grid') || content.includes("class='grid");
        if (!hasGrid && formFields.length > 1) {
          issues.push({ 
            type: 'warning', 
            message: `Formulario con múltiples campos debería usar grid: ${relativePath}` 
          });
          results['ADR-013'].warnings++;
        } else if (hasGrid) {
          results['ADR-013'].passed++;
        }

        // Verificar uso de appearance en mat-form-field
        if (content.includes('appearance=')) {
          issues.push({ 
            type: 'warning', 
            message: `mat-form-field no debería usar atributo appearance: ${relativePath}` 
          });
          results['ADR-013'].warnings++;
        }
      }
    }
  });

  results['ADR-013'].issues = issues;
}

/**
 * Generar reporte final
 */
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.blue}REPORTE DE CUMPLIMIENTO DE ADRs${colors.reset}`);
  console.log('='.repeat(80) + '\n');

  let totalPassed = 0;
  let totalFailed = 0;
  let totalWarnings = 0;

  Object.keys(results).forEach(adr => {
    const result = results[adr];
    totalPassed += result.passed;
    totalFailed += result.failed;
    totalWarnings += result.warnings;

    const status = result.failed > 0 
      ? `${colors.red}❌ FALLIDO${colors.reset}`
      : result.warnings > 0 
        ? `${colors.yellow}⚠️  ADVERTENCIAS${colors.reset}`
        : `${colors.green}✅ CUMPLIDO${colors.reset}`;

    console.log(`${colors.cyan}${adr}: ${result.name}${colors.reset} - ${status}`);
    console.log(`  Pasados: ${colors.green}${result.passed}${colors.reset} | Fallidos: ${colors.red}${result.failed}${colors.reset} | Advertencias: ${colors.yellow}${result.warnings}${colors.reset}`);

    if (result.issues.length > 0) {
      console.log(`  ${colors.yellow}Problemas encontrados:${colors.reset}`);
      result.issues.slice(0, 5).forEach(issue => {
        const icon = issue.type === 'error' ? '❌' : '⚠️';
        const color = issue.type === 'error' ? colors.red : colors.yellow;
        console.log(`    ${icon} ${color}${issue.message}${colors.reset}`);
      });
      if (result.issues.length > 5) {
        console.log(`    ${colors.yellow}... y ${result.issues.length - 5} más${colors.reset}`);
      }
    }
    console.log('');
  });

  console.log('='.repeat(80));
  console.log(`${colors.blue}RESUMEN TOTAL${colors.reset}`);
  console.log('='.repeat(80));
  console.log(`Total Pasados: ${colors.green}${totalPassed}${colors.reset}`);
  console.log(`Total Fallidos: ${colors.red}${totalFailed}${colors.reset}`);
  console.log(`Total Advertencias: ${colors.yellow}${totalWarnings}${colors.reset}`);
  console.log('='.repeat(80) + '\n');

  // Guardar reporte en archivo
  const reportPath = path.join(__dirname, 'adr-compliance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`${colors.green}Reporte guardado en: ${reportPath}${colors.reset}\n`);
}

// Ejecutar todas las verificaciones
console.log(`${colors.blue}Iniciando verificación de cumplimiento de ADRs...${colors.reset}\n`);

verifyADR001();
verifyADR002();
verifyADR003();
verifyADR005();
verifyADR006();
verifyADR008();
verifyADR010();
verifyADR012();
verifyADR013();

generateReport();
