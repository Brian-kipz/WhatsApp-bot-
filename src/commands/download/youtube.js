module.exports = {
  name: 'youtube',
  description: 'Download a YouTube video (placeholder). Usage: !youtube <url>',
  async execute(client, message, args) {
    if (!args || args.length === 0) {
      await client.sendMessage(message.from, 'Usage: !youtube <url>');
      return;
    }
    const url = args[0];
    await client.sendMessage(message.from, `Received YouTube download request for: ${url}\n(placeholder) Implementation coming soon.`);
  },
};
