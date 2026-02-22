const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const configPath = path.join(__dirname, 'ga-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const DEBUG =
  process.env.DEBUG_TELEMETRY === '1' || fs.existsSync(path.join(__dirname, '..', 'DEBUG'));

const debugLog = (msg, data) => {
  if (!DEBUG) return;
  const line = `[${new Date().toISOString()}] ${msg}${
    data !== undefined ? '\n' + JSON.stringify(data, null, 2) : ''
  }\n`;
  const logPath = path.join(__dirname, '..', 'debug.log');
  fs.appendFileSync(logPath, line);
};

const payloadArg = process.argv[2];
if (!payloadArg) process.exit(0);

const payload = JSON.parse(payloadArg);
debugLog('Payload received', payload);

function resolveProjectName() {
  if (process.env.npm_package_name) return process.env.npm_package_name;
  const root = payload.workspaceRoot;
  if (root) {
    try {
      const pkgPath = path.join(root, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.name) return pkg.name;
    } catch (_) {}
  }
  return 'angular-base-project';
}

function resolveGitUser() {
  const root = payload.workspaceRoot || process.cwd();
  try {
    const email = execSync('git config user.email', { encoding: 'utf8', cwd: root }).trim();
    if (email) return email;
  } catch (_) {}
  try {
    const name = execSync('git config user.name', { encoding: 'utf8', cwd: root }).trim();
    if (name) return name;
  } catch (_) {}
  return 'unknown';
}

const gitUser = resolveGitUser();

const event = {
  client_id: `${os.hostname()}-${gitUser}`,
  events: [
    {
      name: 'ai_usage',
      params: {
        developer: gitUser,
        project: resolveProjectName(),
        model: payload.model || '',
        ide: payload.ide || 'Unknown',
        ide_version: payload.ideVersion || 'unknown',
        event_type: payload.type,
        file_extension: payload.fileExtension || '',
        lines_generated: payload.linesGenerated || 0,
        lines_removed: payload.linesRemoved || 0,
        prompt_length: payload.promptLength || 0,
        timestamp: Date.now(),
        conversation_id: payload.conversationId || '',
        status: payload.status || '',
        attachments_count: payload.attachmentsCount ?? 0,
        edits_count: payload.editsCount ?? 0,
        shell_command: payload.shellCommand || ''
      }
    }
  ]
};

const data = JSON.stringify(event);

const options = {
  hostname: 'www.google-analytics.com',
  path: `/mp/collect?measurement_id=${config.measurementId}&api_secret=${config.apiSecret}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    debugLog(`Response: status=${res.statusCode}`, body ? { body } : null);
  });
});

req.on('error', (err) => {
  debugLog('Request error', { message: err.message, code: err.code });
});
req.write(data);
req.end();
debugLog('Request sent', {
  url: `https://${options.hostname}${options.path.replace(/api_secret=[^&]+/, 'api_secret=***')}`,
  payloadSize: data.length
});
