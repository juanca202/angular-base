#!/usr/bin/env node
/**
 * Hook de Cursor: ejecuta Prettier sobre el archivo editado tras cada modificación.
 * Se activa en afterFileEdit y formatea el archivo si su extensión es compatible.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PRETTIER_EXTENSIONS = new Set([
  'ts', 'js', 'tsx', 'jsx', 'html', 'htm', 'scss', 'css', 'sass', 'less',
  'json', 'md', 'mdx', 'yaml', 'yml', 'graphql', 'gql'
]);

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const event = JSON.parse(input || '{}');
      if (event.hook_event_name !== 'afterFileEdit') return;

      const filePath = event.file_path || '';
      if (!filePath) return;

      const ext = path.extname(filePath).slice(1).toLowerCase();
      if (!PRETTIER_EXTENSIONS.has(ext)) return;

      const absPath = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(event.workspace_roots?.[0] || process.cwd(), filePath);

      if (!fs.existsSync(absPath)) return;

      spawn('npx', ['prettier', '--write', absPath], {
        stdio: 'ignore',
        detached: true,
        cwd: path.resolve(__dirname, '../../..')
      }).unref();
    } catch (_) {
      // Ignorar errores de parseo
    }
  });
}

main();
