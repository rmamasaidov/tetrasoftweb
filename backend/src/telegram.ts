import { Bot } from 'grammy';
import { config } from './config.js';
import type { Lead } from './db.js';

export const bot: Bot | null = config.telegram.botToken
  ? new Bot(config.telegram.botToken)
  : null;

if (bot) {
  bot.command('start', async (ctx) => {
    const chatId = ctx.chat?.id;
    await ctx.reply(
      `Tetrasoft lead bot is online.\n` +
        `Your chat ID: ${chatId}\n` +
        `Configured admin chat: ${config.telegram.adminChatId ?? '(not set)'}`,
    );
  });

  bot.catch((err) => {
    console.error('[tetrasoft-backend] grammy error:', err.error);
  });

  // grammY's bot.start() resolves only when the bot stops, so we deliberately
  // do not await it. Errors that occur during startup are caught below.
  bot
    .start({
      onStart: (info) =>
        console.log(`[tetrasoft-backend] telegram bot started as @${info.username}`),
    })
    .catch((err) => {
      console.error('[tetrasoft-backend] telegram bot failed to start:', err);
    });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function notifyAdminOfLead(lead: Lead): Promise<void> {
  if (!bot || !config.telegram.adminChatId) return;

  const lines = [
    `🔔 <b>New lead #${lead.id}</b>`,
    `<b>Name:</b> ${escapeHtml(lead.name)}`,
    `<b>Contact:</b> ${escapeHtml(lead.contact)}`,
  ];
  if (lead.message) lines.push(`<b>Message:</b>\n${escapeHtml(lead.message)}`);
  if (lead.source) lines.push(`<b>Source:</b> ${escapeHtml(lead.source)}`);
  if (lead.ip) lines.push(`<b>IP:</b> ${escapeHtml(lead.ip)}`);
  lines.push(`<b>At:</b> ${escapeHtml(lead.created_at)} UTC`);

  await bot.api.sendMessage(config.telegram.adminChatId, lines.join('\n'), {
    parse_mode: 'HTML',
  });
}
