module.exports = {
  name: 'ping',
  description: 'Replies with Pong and latency',
  async execute(client, message, args) {
    const start = Date.now();
    await client.sendMessage(message.from, 'Pong!');
    const latency = Date.now() - start;
    await client.sendMessage(message.from, `Latency: ${latency}ms`);
  },
};
