module.exports = {
  name: 'tiktok',
  description: 'Download a TikTok video (placeholder). Usage: !tiktok <url>',
  async execute(client, message, args) {
    if (!args || args.length === 0) {
      await client.sendMessage(message.from, 'Usage: !tiktok <url>');
      return;
    }
    const url = args[0];
    await client.sendMessage(message.from, `Received TikTok download request for: ${url}\n(placeholder) Implementation coming soon.`);
  },
};
