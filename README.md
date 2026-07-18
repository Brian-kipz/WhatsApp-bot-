# WhatsApp Bot — Modular Commands (Baileys)

This repository is initialized to run a modular WhatsApp bot using Baileys.

Quick start

1. Install dependencies (if you haven't already):

   npm install

2. Create a `.env` file at the repo root with any of these (optional):

   PREFIX=!   # command prefix (default: !)

3. Start the bot:

   npm start

Behavior

- Each command lives in `src/commands/` and exports `{ name, description, execute(client, message, args) }`.
- The bot uses `@whiskeysockets/baileys` to connect directly to WhatsApp. On first run you'll see a QR code in the terminal to pair a phone.
- Auth files are stored in `auth_info/` (gitignored).

Adding commands

- Copy `src/commands/_template.js` and update `name`, `description` and `execute`.

Notes

- This is a foundation: replace or extend error handling, permission checks, and persistence as needed.
