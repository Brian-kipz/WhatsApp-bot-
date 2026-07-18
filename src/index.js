const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');

// Setup standard terminal reading interface
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    // 1. Manage authentication state directory
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    // 2. Initialize connection profile
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Explicitly false so it relies on the text code
        logger: pino({ level: 'silent' }),
        // Emulate standard desktop browser so connection is stable
        browser: ['Ubuntu', 'Chrome', '20.0.04'] 
    });

    // 3. Trigger Pairing Code Prompt if not registered yet
    if (!sock.authState.creds.registered) {
        // Simple artificial delay to let socket handshake initialize smoothly
        await delay(3000); 
        
        const phoneNumber = await question('Please enter your WhatsApp number with country code (e.g., 254712345678):\n> ');
        
        try {
            // Clean formatting: remove spaces, symbols, and plus signs
            const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
            const code = await sock.requestPairingCode(formattedNumber);
            console.log(`\n🔑 Your WhatsApp Linking Code is: \x1b[32m${code}\x1b[0m\n`);
        } catch (error) {
            console.error('❌ Failed to generate pairing code:', error.message);
        }
    }

    // 4. Register Session Events
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log('✅ Bot successfully connected to WhatsApp!');
        }
        if (connection === 'close') {
            console.log('🔄 Connection closed. Attempting restart...');
            startBot();
        }
    });

    // Handle incoming messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        if (text.toLowerCase() === 'ping') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'pong 🏓' });
        }
    });
}

startBot();
