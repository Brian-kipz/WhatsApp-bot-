module.exports = {
  name: 'alive',
  description: 'Check if the bot is operational',
  async execute(sock, msg, args) {
    const remoteJid = msg.key.remoteJid;
    await sock.sendMessage(remoteJid, { text: "🤖 *BRIAN-TECH is active and online!*" });
  }
};
