/**
 * Fanaye Technologies & Memo Living Memory Automated Setup
 * Author: Natinael Samuel (2026) <afritioalberts1216@gmail.com>
 * Extension: natinaelsamuel.memo-living-memory
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const EXTENSION_ID = 'natinaelsamuel.memo-living-memory';
const EXTENSION_URL = 'https://marketplace.visualstudio.com/items?itemName=natinaelsamuel.memo-living-memory';

console.log('\n===============================================================');
console.log('  🧠 Initializing Fanaye Living Memory Environment');
console.log('  📦 Extension: Memo - Living Memory (by Natinael Samuel)');
console.log('  🔗 Marketplace: ' + EXTENSION_URL);
console.log('===============================================================\n');

function runCommandSilently(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe', encoding: 'utf-8' });
  } catch (err) {
    return null;
  }
}

function installVscodeExtension() {
  const isCodeAvailable = runCommandSilently('code --version');
  const isCursorAvailable = runCommandSilently('cursor --version');

  let installed = false;

  if (isCodeAvailable) {
    console.log('ℹ️  VS Code CLI detected. Installing ' + EXTENSION_ID + '...');
    try {
      execSync(`code --install-extension ${EXTENSION_ID} --force`, { stdio: 'inherit' });
      console.log('✅ Successfully installed/updated ' + EXTENSION_ID + ' in VS Code.');
      installed = true;
    } catch (err) {
      console.warn('⚠️  Could not install extension via `code` CLI: ' + err.message);
    }
  }

  if (isCursorAvailable) {
    console.log('ℹ️  Cursor CLI detected. Installing ' + EXTENSION_ID + '...');
    try {
      execSync(`cursor --install-extension ${EXTENSION_ID} --force`, { stdio: 'inherit' });
      console.log('✅ Successfully installed/updated ' + EXTENSION_ID + ' in Cursor.');
      installed = true;
    } catch (err) {
      console.warn('⚠️  Could not install extension via `cursor` CLI: ' + err.message);
    }
  }

  if (!installed && !isCodeAvailable && !isCursorAvailable) {
    console.log('ℹ️  `code` / `cursor` CLI not detected in system PATH.');
    console.log('   Workspace recommendation added in .vscode/extensions.json.');
    console.log('   VS Code / Cursor will automatically prompt to install when the workspace opens.');
  }
}

function verifyMemoryStructure() {
  const rootDir = path.resolve(__dirname, '..');
  const memoryDir = path.join(rootDir, 'memory');

  if (!fs.existsSync(memoryDir)) {
    fs.mkdirSync(memoryDir, { recursive: true });
    console.log('📁 Created memory directory at ' + memoryDir);
  }

  const requiredFiles = [
    {
      name: 'development_guidelines.md',
      fallback: '# Living Development Guidelines\n\n- Invariant rules, architecture constraints, and standards.\n',
    },
    {
      name: 'progress_log.md',
      fallback: '# Living Progress Log\n\n## Milestone Tracker\n- Project initialized.\n',
    },
    {
      name: 'edit_log.md',
      fallback: '# Immutable Memory Edit Log\n\nAll memory updates are logged here.\n',
    },
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(memoryDir, file.name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, file.fallback, 'utf-8');
      console.log('📝 Initialized missing memory artifact: ' + file.name);
    }
  }

  console.log('✅ Living memory architecture verified and active.\n');
}

try {
  installVscodeExtension();
  verifyMemoryStructure();
} catch (error) {
  console.warn('⚠️  Non-blocking memo setup warning: ' + error.message);
}
