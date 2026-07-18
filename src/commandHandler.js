const fs = require('fs');
const path = require('path');

function loadCommands(commandsPath) {
  const commands = new Map();
  if (!fs.existsSync(commandsPath)) return commands;

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith('.js')) continue;
      if (entry.name.startsWith('_')) continue; // skip templates/private files

      try {
        // clear from cache to allow reloads during runtime
        delete require.cache[require.resolve(fullPath)];
        const cmd = require(fullPath);
        if (!cmd || !cmd.name || typeof cmd.execute !== 'function') {
          console.warn(`Skipping invalid command file: ${fullPath}`);
          continue;
        }
        commands.set(cmd.name, cmd);
      } catch (err) {
        console.warn(`Failed to load command ${fullPath}:`, err.message);
      }
    }
  }

  walk(commandsPath);
  return commands;
}

function parseMessage(text, prefix = '!') {
  if (!text || !text.startsWith(prefix)) return { commandName: null, args: [] };
  const withoutPrefix = text.slice(prefix.length).trim();
  const parts = withoutPrefix.split(/\s+/);
  const commandName = parts.shift().toLowerCase();
  return { commandName, args: parts };
}

module.exports = { loadCommands, parseMessage };
