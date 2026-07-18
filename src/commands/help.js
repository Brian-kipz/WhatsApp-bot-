const path = require('path');
const CommandHandler = require('../commandHandler');

module.exports = {
  name: 'help',
  description: 'Lists available commands',
  async execute(client, message, args) {
    const commands = CommandHandler.loadCommands(path.join(__dirname));
    if (commands.size === 0) {
      await client.sendMessage(message.from, 'No commands available. Add files to src/commands/');
      return;
    }
    const lines = ['Available commands:'];
    for (const cmd of commands.values()) {
      lines.push(`${cmd.name} — ${cmd.description || 'no description'}`);
    }
    await client.sendMessage(message.from, lines.join('\n'));
  },
};
