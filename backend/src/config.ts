import 'dotenv/config';

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const config = {
  port: Number(optional('PORT', '3000')),
  nodeEnv: optional('NODE_ENV', 'production'),
  sqliteFile: optional('SQLITE_FILE', '/data/leads.db'),
  telegram: {
    // Optional at boot to allow scaffolding/smoke-test runs without real creds.
    // Phase 5 will treat these as required for the lead pipeline.
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID,
  },
};
