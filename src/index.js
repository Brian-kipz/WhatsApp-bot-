require('dotenv').config();

const path = require('path');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys');
const CommandHandler = require('./commandHandler');

async function start() {
  const commands = CommandHandler.loadCommands(path.join(__dirname, 'commands'));
  const prefix = process.env.PREFIX || '!';

  // auth state will be stored inside ./auth_info
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

  // get the latest WA Web version for compatibility
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    version
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

  sock.ev.on('messages.upsert', async (m) => {
    try {
      if (!m.messages) return;
      for (const msg of m.messages) {
        // ignore status broadcasts
        if (msg.key && msg.key.remoteJid === 'status@broadcast') continue;
        if (!msg.message) continue;

        const body = msg.message.conversation || (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) || '';
        const message = {
          from: msg.key.remoteJid,
          id: msg.key.id,
          body
        };

        const { commandName, args } = CommandHandler.parseMessage(message.body, prefix);
        if (!commandName) continue;

        const cmd = commands.get(commandName);
        if (!cmd) {
          await sock.sendMessage(message.from, { text: `Unknown command: ${commandName}. Use ${prefix}help` });
          continue;
        }

        const client = {
          raw: sock,
          sendMessage: (to, content) => sock.sendMessage(to, { text: content })
        };

        await cmd.execute(client, message, args);
      }
    } catch (err) {
      console.error('messages.upsert handler error:', err);
    }
  });

  console.log('Bot started — scan the QR code shown in terminal if needed.');
}

start().catch(err => {
  console.error('Fatal error starting bot:', err);
  process.exit(1);
});
