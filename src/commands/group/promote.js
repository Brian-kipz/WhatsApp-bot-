module.exports = {
  name: 'promote',
  description: 'Promote a user to admin. Usage: !promote <jid>',
  async execute(client, message, args) {
    if (!args || args.length === 0) {
      await client.sendMessage(message.from, 'Usage: !promote <jid>');
      return;
    }
    const jid = args[0];
    // Real implementation would call Baileys group participant update API
    await client.sendMessage(message.from, `Requested to promote: ${jid}\n(placeholder) Make sure the bot has admin permissions.`);
  },
};
