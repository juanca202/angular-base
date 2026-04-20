#!/usr/bin/env node
/**
 * Fetches icons from a Figma page/frame and saves them as SVG files.
 *
 * Usage (run from project root):
 *   FIGMA_ACCESS_TOKEN=xxx node .ai/skills/abp-extract-figma-icons/fetch-figma-icons.js <fileKey> <nodeId>
 *   FIGMA_ACCESS_TOKEN=xxx node .ai/skills/abp-extract-figma-icons/fetch-figma-icons.js https://figma.com/design/VT4W8MFWwD8k1TYcABLEjf/Design-system-template?node-id=6-2
 *
 * Token: Figma Settings > Security > Personal access tokens
 * Scopes: file_content:read (required)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const FIGMA_API = 'https://api.figma.com/v1';
const OUTPUT_DIR = 'src/theme/icons';

function parseUrlOrArgs(input) {
  const urlMatch = input?.match(/figma\.com\/design\/([^/]+)[^?]*\?node-id=([\d-]+)/);
  if (urlMatch) {
    return { fileKey: urlMatch[1], nodeId: urlMatch[2].replace(/-/g, ':') };
  }
  return null;
}

function sanitizeFilename(name) {
  return (
    name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'icon'
  );
}

function fetchJson(url, token) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: { 'X-Figma-Token': token }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Parse error: ${data.slice(0, 200)}`));
          }
        });
      }
    );
    req.on('error', reject);
  });
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

function findNodeById(doc, nodeId) {
  if (!doc) return null;
  if (String(doc.id) === String(nodeId)) return doc;

  if (doc.children) {
    for (const child of doc.children) {
      const found = findNodeById(child, nodeId);
      if (found) return found;
    }
  }
  return null;
}

function collectIconNodes(targetNode) {
  const acc = [];
  const iconTypes = ['FRAME', 'COMPONENT', 'GROUP', 'VECTOR', 'BOOLEAN_OPERATION'];

  if (!targetNode || !targetNode.id) return acc;

  const children = targetNode.children || [];
  const iconChildren = children.filter((c) => c && iconTypes.includes(c.type || ''));

  if (iconChildren.length > 0) {
    for (const child of iconChildren) {
      acc.push({ id: child.id, name: child.name || child.id });
    }
  } else {
    acc.push({ id: targetNode.id, name: targetNode.name || 'icon' });
  }

  return acc;
}

async function main() {
  const input = process.argv[2];
  const nodeIdArg = process.argv[3];

  let fileKey, nodeId;
  const parsed = parseUrlOrArgs(input);
  if (parsed) {
    fileKey = parsed.fileKey;
    nodeId = parsed.nodeId;
  } else if (input && nodeIdArg) {
    fileKey = input;
    nodeId = nodeIdArg.replace(/-/g, ':');
  } else {
    console.error(
      'Usage: FIGMA_ACCESS_TOKEN=xxx node .ai/skills/abp-extract-figma-icons/fetch-figma-icons.js <fileKey> <nodeId>'
    );
    console.error(
      '   or: FIGMA_ACCESS_TOKEN=xxx node .ai/skills/abp-extract-figma-icons/fetch-figma-icons.js <figma-url-with-node-id>'
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

  console.log(`Fetching file ${fileKey}, node ${nodeId}...`);

  const fileUrl = `${FIGMA_API}/files/${fileKey}?ids=${encodeURIComponent(nodeId)}&depth=5`;
  const file = await fetchJson(fileUrl, token);

  if (file.err) {
    console.error('Figma API error:', file.err);
    process.exit(1);
  }

  const doc = file.document;
  if (!doc) {
    console.error('No document in response.');
    process.exit(1);
  }
  const targetNode = findNodeById(doc, nodeId);

  if (!targetNode) {
    console.error(`Node ${nodeId} not found in document.`);
    process.exit(1);
  }

  const iconNodes = collectIconNodes(targetNode);

  if (iconNodes.length === 0) {
    console.error('No icon nodes found. Try a different node-id or check the page structure.');
    process.exit(1);
  }

  console.log(`Found ${iconNodes.length} icon(s). Exporting as SVG...`);

  const ids = iconNodes.map((n) => n.id).join(',');
  const imagesUrl = `${FIGMA_API}/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=svg`;
  const imagesRes = await fetchJson(imagesUrl, token);

  if (imagesRes.err || !imagesRes.images) {
    console.error('Export error:', imagesRes.err || imagesRes);
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const usedNames = new Set();
  let saved = 0;

  for (const node of iconNodes) {
    const url = imagesRes.images[node.id];
    if (!url) continue;

    const rawName = sanitizeFilename(node.name);
    let filename = rawName;
    let i = 1;
    while (usedNames.has(filename)) {
      filename = `${rawName}-${i}`;
      i++;
    }
    usedNames.add(filename);

    const svg = await fetchUrl(url);
    const filePath = path.join(OUTPUT_DIR, `${filename}.svg`);
    fs.writeFileSync(filePath, svg, 'utf8');
    saved++;
    console.log(`  ✓ ${filename}.svg`);
  }

  console.log(`\n✔ ${saved} icon(s) saved to ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
