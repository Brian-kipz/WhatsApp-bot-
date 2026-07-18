module.exports = {
  name: 'alive',
  description: 'Check whether the bot is alive',
  async execute(client, message, args) {
    await client.sendMessage(message.from, 'I am alive and ready!');
  },
};
