// Minimal Baileys wrapper placeholder left intentionally — main wiring is done in src/index.js
// This file can be expanded to provide higher-level helpers around the raw socket.

class WhatsAppClient {
  constructor(rawSocket) {
    this.raw = rawSocket || null;
  }

  setRaw(rawSocket) {
    this.raw = rawSocket;
  }

  async sendMessage(to, text) {
    if (!this.raw) throw new Error('Raw socket not set');
    return this.raw.sendMessage(to, { text });
  }
}

module.exports = WhatsAppClient;
