# WhatsApp Bot — Modular Commands (Baileys)

This repository is initialized to run a modular WhatsApp bot using Baileys.

Quick start

1. Install dependencies (if you haven't already):

   npm install

2. Create a `.env` file at the repo root with any of these (optional):

   PREFIX=!   # command prefix (default: .)

3. Start the bot:

   npm start

4. On first run, you'll be prompted to enter your WhatsApp phone number with country code (e.g., +1234567890)

5. A 6-digit pairing code will be displayed — check your phone and enter it when prompted

Behavior

- Each command lives in `src/commands/` and exports `{ name, description, execute(client, message, args) }`.
- The bot uses `@whiskeysockets/baileys` to connect directly to WhatsApp. On first run you'll be asked for your phone number instead of scanning a QR code.
- Auth files are stored in `auth_info/` (gitignored).

Adding commands

- Copy `src/commands/_template.js` and update `name`, `description` and `execute`.

Notes

- This is a foundation: replace or extend error handling, permission checks, and persistence as needed.
