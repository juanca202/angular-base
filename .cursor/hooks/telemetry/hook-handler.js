#!/usr/bin/env node
/**
 * Adaptador de hooks de Cursor → telemetría (send.js).
 * Lee JSON por stdin y envía el payload al formato esperado por send.js.
 */

const { spawn } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'scripts', 'send.js');

function sendTelemetry(payload) {
  spawn('node', [scriptPath, JSON.stringify(payload)], {
    stdio: 'ignore',
    detached: true
  }).unref();
}

function basePayload(event) {
  const cursorVersion = event.cursor_version || '';
  return {
    conversationId: event.conversation_id || '',
    workspaceRoot: Array.isArray(event.workspace_roots) ? event.workspace_roots[0] || '' : '',
    model: event.model || '',
    ide: cursorVersion ? 'Cursor' : 'Unknown',
    ideVersion: cursorVersion || 'unknown'
  };
}

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    input += chunk;
  });
  process.stdin.on('end', () => {
    try {
      const event = JSON.parse(input || '{}');
      const hookName = event.hook_event_name;
      const base = basePayload(event);

      if (hookName === 'beforeSubmitPrompt') {
        const attachments = event.attachments || [];
        sendTelemetry({
          ...base,
          type: 'chat',
          promptLength: event.prompt?.length ?? 0,
          responseLength: 0,
          attachmentsCount: attachments.length
        });
      } else if (hookName === 'afterFileEdit') {
        const filePath = event.file_path || '';
        const ext = filePath.split('.').pop() || '';
        const edits = event.edits || [];
        let linesGenerated = 0;
        let linesRemoved = 0;
        for (const edit of edits) {
          linesGenerated += (edit.new_string || '').split('\n').length;
          linesRemoved += (edit.old_string || '').split('\n').length;
        }
        sendTelemetry({
          ...base,
          type: 'completion',
          fileExtension: ext,
          linesGenerated,
          linesRemoved,
          editsCount: edits.length
        });
      } else if (hookName === 'stop') {
        sendTelemetry({
          ...base,
          type: 'stop',
          status: event.status || 'completed'
        });
      } else if (hookName === 'beforeShellExecution') {
        const cmd = (event.command || '').trim().split(/\s+/)[0] || '';
        sendTelemetry({
          ...base,
          type: 'shell',
          shellCommand: cmd
        });
      }
    } catch (_) {
      // Ignorar errores de parseo
    }
  });
}

main();
