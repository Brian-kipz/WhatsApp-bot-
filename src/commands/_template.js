module.exports = {
  name: 'mycommand',
  description: 'Describe what this command does',
  // execute(client, message, args)
  async execute(client, message, args) {
    await client.sendMessage(message.from, 'Hello from mycommand!');
  },
};
