module.exports = {
  name: 'kick',
  description: 'Removes a user from the group',
  async execute(client, message, args) {
    try {
      const raw = message.raw;
      const remoteJid = raw?.key?.remoteJid || message.from;
      if (!remoteJid || !remoteJid.endsWith('@g.us')) {
        return client.sendMessage(remoteJid || message.from, { text: "❌ This command only works in groups!" });
      }

      // Try to get mentioned JID from contextInfo, otherwise fall back to args[0]
      const mentioned = raw?.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      let target = Array.isArray(mentioned) && mentioned.length ? mentioned[0] : null;
      if (!target && args && args.length) {
        const maybe = args[0];
        // sanitize number: allow forms like 2547xxxx or 2547xxxx@s.whatsapp.net
        target = maybe.includes('@') ? maybe : `${maybe.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
      }

      if (!target) return client.sendMessage(remoteJid, { text: "⚠️ Please mention a user to kick." });

      // perform group remove
      await client.raw.groupParticipantsUpdate(remoteJid, [target], 'remove');
      await client.sendMessage(remoteJid, { text: `✅ Successfully removed participant.` });
    } catch (err) {
      console.error('kick command error:', err);
      const to = message.raw?.key?.remoteJid || message.from;
      await client.sendMessage(to, { text: '❌ Failed to remove participant. Ensure the bot has admin permissions.' });
    }
  }
};
