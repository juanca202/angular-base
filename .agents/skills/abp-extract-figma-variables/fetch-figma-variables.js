#!/usr/bin/env node
/**
 * Fetches Figma variables via REST API and outputs JSON for theme.css mapping.
 *
 * Alternative when MCP get_variable_defs does not return data.
 *
 * Usage (run from project root):
 *   FIGMA_ACCESS_TOKEN=xxx node .agents/skills/abp-extract-figma-variables/fetch-figma-variables.js <fileKey>
 *   FIGMA_ACCESS_TOKEN=xxx node .agents/skills/abp-extract-figma-variables/fetch-figma-variables.js https://figma.com/design/VT4W8MFWwD8k1TYcABLEjf/Untitled
 *
 * Token: Figma Settings > Security > Personal access tokens
 * Scopes: file_content:read (required), file_variables:read (Enterprise only, for variables)
 *
 * If file_variables:read is not available (non-Enterprise), falls back to extracting
 * colors and typography from the document structure.
 */

const FIGMA_API = 'https://api.figma.com/v1';

function parseUrlOrFileKey(input) {
  const urlMatch = input.match(/figma\.com\/design\/([^/]+)/);
  if (urlMatch) return urlMatch[1];
  return input;
}

function figmaColorToHex(color) {
  if (!color || typeof color.r === 'undefined') return null;
  const r = Math.round((color.r ?? 0) * 255);
  const g = Math.round((color.g ?? 0) * 255);
  const b = Math.round((color.b ?? 0) * 255);
  const a = color.a !== undefined ? color.a : 1;
  if (a < 1) {
    return `rgba(${r},${g},${b},${a})`;
  }
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function pxToRem(px) {
  if (typeof px !== 'number') return null;
  return `${(px / 16).toFixed(4).replace(/\.?0+$/, '')}rem`;
}

async function fetchVariablesLocal(token, fileKey) {
  const res = await fetch(`${FIGMA_API}/files/${fileKey}/variables/local`, {
    headers: { 'X-Figma-Token': token }
  });
  if (!res.ok) {
    if (res.status === 403) return null;
    throw new Error(`Variables API: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  if (json.error || !json.meta) return null;
  return json.meta;
}

async function fetchFile(token, fileKey) {
  const res = await fetch(`${FIGMA_API}/files/${fileKey}`, {
    headers: { 'X-Figma-Token': token }
  });
  if (!res.ok) throw new Error(`File API: ${res.status} ${await res.text()}`);
  return res.json();
}

function traverseNodes(node, acc) {
  if (!node) return;
  if (node.fills && Array.isArray(node.fills)) {
    for (const fill of node.fills) {
      if (fill.visible !== false && fill.color) {
        const hex = figmaColorToHex(fill.color);
        if (hex) acc.colors.add(hex);
      }
    }
  }
  if (node.strokes && Array.isArray(node.strokes)) {
    for (const stroke of node.strokes) {
      if (stroke.visible !== false && stroke.color) {
        const hex = figmaColorToHex(stroke.color);
        if (hex) acc.colors.add(hex);
      }
    }
  }
  if (node.style) {
    if (node.style.fontSize) acc.fontSizes.add(node.style.fontSize);
    if (node.style.fontFamily) acc.fontFamilies.add(node.style.fontFamily);
    if (node.style.fontWeight) acc.fontWeights.add(String(node.style.fontWeight));
    if (node.style.lineHeightPx) acc.lineHeights.add(node.style.lineHeightPx);
  }
  if (node.children) {
    for (const child of node.children) traverseNodes(child, acc);
  }
}

function extractFromDocument(doc) {
  const acc = {
    colors: new Set(),
    fontSizes: new Set(),
    fontFamilies: new Set(),
    fontWeights: new Set(),
    lineHeights: new Set()
  };
  if (doc.document?.children) {
    for (const child of doc.document.children) traverseNodes(child, acc);
  }
  return {
    colors: [...acc.colors],
    fontSizes: [...acc.fontSizes]
      .map(Number)
      .filter(Boolean)
      .sort((a, b) => a - b),
    fontFamilies: [...acc.fontFamilies],
    fontWeights: [...acc.fontWeights],
    lineHeights: [...acc.lineHeights]
  };
}

function buildMappedVariables(meta) {
  const vars = meta.variables || {};
  const collections = meta.variableCollections || {};
  const mapped = {};

  const getDefaultValue = (variable) => {
    const coll = collections[variable.variableCollectionId];
    if (!coll) return null;
    const modeId = coll.defaultModeId || (coll.modes && coll.modes[0]?.modeId);
    if (!modeId || !variable.valuesByMode) return null;
    let val = variable.valuesByMode[modeId];
    if (val && val.type === 'VARIABLE_ALIAS' && val.id) {
      val = vars[val.id] ? getDefaultValue(vars[val.id]) : null;
    }
    return val;
  };

  const semanticMap = {
    primary: '--ft-color-primary',
    secondary: '--ft-color-secondary',
    tertiary: '--ft-color-tertiary',
    success: '--ft-color-success',
    warning: '--ft-color-warning',
    danger: '--ft-color-danger',
    info: '--ft-color-info',
    light: '--ft-color-light',
    dark: '--ft-color-dark',
    text: '--ft-color-text',
    'text-muted': '--ft-color-text-muted',
    textMuted: '--ft-color-text-muted',
    bg: '--ft-color-bg',
    background: '--ft-color-bg',
    border: '--ft-color-border',
    'font-family-base': '--ft-font-family-base',
    fontFamilyBase: '--ft-font-family-base',
    'font-weight-base': '--ft-font-weight-base',
    fontWeightBase: '--ft-font-weight-base',
    'font-size-base': '--ft-font-size-base',
    fontSizeBase: '--ft-font-size-base',
    'line-height-base': '--ft-line-height-base',
    lineHeightBase: '--ft-line-height-base',
    h1: '--ft-h1-font-size',
    h2: '--ft-h2-font-size',
    h3: '--ft-h3-font-size'
  };

  for (const v of Object.values(vars)) {
    const name = (v.name || v.key || '').toLowerCase().replace(/\s+/g, '-');
    const key = (v.key || v.name || '').toLowerCase().replace(/[.\s]+/g, '-');
    const pathParts = (v.key || v.name || '')
      .split(/[./]/)
      .map((p) => p.toLowerCase().replace(/\s+/g, '-'));

    let cssVar = semanticMap[name] || semanticMap[key];
    for (const part of pathParts) {
      if (semanticMap[part]) {
        cssVar = semanticMap[part];
        break;
      }
    }
    if (!cssVar) continue;

    const val = getDefaultValue(v);
    if (val == null) continue;

    if (v.resolvedType === 'COLOR' && typeof val === 'object') {
      mapped[cssVar] = figmaColorToHex(val);
    } else if (v.resolvedType === 'FLOAT' && typeof val === 'number') {
      if (cssVar.includes('font-size') || cssVar.includes('fontSize')) {
        mapped[cssVar] = pxToRem(val);
      } else {
        mapped[cssVar] = val;
      }
    } else if (v.resolvedType === 'STRING' && typeof val === 'string') {
      mapped[cssVar] = val;
    }
  }
  return mapped;
}

function buildFallbackMapped(extracted) {
  const mapped = {};
  if (extracted.colors?.length) {
    mapped['--ft-color-primary'] = extracted.colors[0];
    if (extracted.colors[1]) mapped['--ft-color-secondary'] = extracted.colors[1];
  }
  if (extracted.fontFamilies?.length) {
    const ff = extracted.fontFamilies[0];
    mapped['--ft-font-family-base'] = ff.includes(' ')
      ? `'${ff}', sans-serif`
      : `${ff}, sans-serif`;
  }
  const baseSize = extracted.fontSizes?.find((s) => s >= 14 && s <= 18) || extracted.fontSizes?.[0];
  if (baseSize) mapped['--ft-font-size-base'] = pxToRem(baseSize);
  const h1Size = extracted.fontSizes?.filter((s) => s >= 20).sort((a, b) => b - a)[0];
  if (h1Size) mapped['--ft-h1-font-size'] = pxToRem(h1Size);
  return mapped;
}

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.error(
      'Usage: FIGMA_ACCESS_TOKEN=xxx node .agents/skills/abp-extract-figma-variables/fetch-figma-variables.js <fileKey|url>'
    );
    process.exit(1);
  }

  const token = process.env.FIGMA_ACCESS_TOKEN;
  if (!token) {
    console.error(
      'Set FIGMA_ACCESS_TOKEN. Create at: Figma Settings > Security > Personal access tokens'
    );
    process.exit(1);
  }

  const fileKey = parseUrlOrFileKey(input);

  let meta = await fetchVariablesLocal(token, fileKey);
  let source = 'variables';

  if (!meta) {
    const file = await fetchFile(token, fileKey);
    const extracted = extractFromDocument(file);
    meta = { _fallback: extracted };
    source = 'document';
  }

  let result;
  if (source === 'variables') {
    result = { source: 'variables', mapped: buildMappedVariables(meta) };
  } else {
    result = {
      source: 'document',
      extracted: meta._fallback,
      mapped: buildFallbackMapped(meta._fallback)
    };
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
