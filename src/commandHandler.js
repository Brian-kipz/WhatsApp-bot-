const fs = require('fs');
const path = require('path');

function loadCommands(commandsPath) {
  const commands = new Map();
  if (!fs.existsSync(commandsPath)) return commands;
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js') && !f.startsWith('_'));
  for (const file of files) {
    try {
      const fullPath = path.join(commandsPath, file);
      // delete from require cache to allow runtime reloads if needed
      delete require.cache[require.resolve(fullPath)];
      const cmd = require(fullPath);
      if (!cmd || !cmd.name || typeof cmd.execute !== 'function') {
        console.warn(`Skipping invalid command file: ${file}`);
        continue;
      }
      commands.set(cmd.name, cmd);
    } catch (err) {
      console.warn(`Failed to load command ${file}:`, err.message);
    }
  }
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
