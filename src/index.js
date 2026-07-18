require('dotenv').config();

const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys');

async function startBot() {
  const authDir = process.env.AUTH_DIR || './auth_info';
  const prefix = process.env.PREFIX || '.'; // default prefix from your snippet

  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    version,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === 'open') console.log('WhatsApp connection open');
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('connection closed, reconnect?', shouldReconnect);
    }
  });

  // Load Commands into a Map
  const commands = new Map();
  const commandFolder = path.join(__dirname, 'commands');

  if (fs.existsSync(commandFolder)) {
    const entries = fs.readdirSync(commandFolder, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(commandFolder, entry.name);
      if (entry.isDirectory()) {
        const files = fs.readdirSync(entryPath).filter(f => f.endsWith('.js') && !f.startsWith('_'));
        for (const file of files) {
          try {
            const cmd = require(path.join(entryPath, file));
            if (cmd && cmd.name) commands.set(cmd.name, cmd);
          } catch (err) {
            console.warn('Failed to load command', file, err.message);
          }
        }
      } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.startsWith('_')) {
        try {
          const cmd = require(entryPath);
          if (cmd && cmd.name) commands.set(cmd.name, cmd);
        } catch (err) {
          console.warn('Failed to load command', entry.name, err.message);
        }
      }
    }
  }

  // Listen for incoming messages
  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages[0];
      if (!msg) return;
      if (!msg.message || msg.key.fromMe) return;

      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
      if (!text.startsWith(prefix)) return; // Command prefix

      const args = text.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      if (commands.has(commandName)) {
        const cmd = commands.get(commandName);
        // Normalize a small client wrapper for existing commands
        const client = {
          raw: sock,
          sendMessage: async (to, content) => {
            // If content is an object (baileys message payload), forward directly
            if (typeof content === 'object') return sock.sendMessage(to, content);
            return sock.sendMessage(to, { text: String(content) });
          },
          reply: async (messageObj, content) => {
            const to = messageObj.key?.remoteJid || messageObj.from;
            return client.sendMessage(to, content);
          }
        };

        const message = {
          from: msg.key.remoteJid,
          id: msg.key.id,
          body: text,
          raw: msg
        };

        try {
          await cmd.execute(client, message, args);
        } catch (err) {
          console.error('Command execution error:', err);
          await sock.sendMessage(msg.key.remoteJid, { text: "❌ Error executing command." });
        }
      }
    } catch (err) {
      console.error('messages.upsert handler error:', err);
    }
  });

  console.log('Bot started — scanning/ready to accept commands.');
}

startBot().catch(err => {
  console.error('Fatal error starting bot:', err);
  process.exit(1);
});
