import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { config } from './config.js';

const app = new Hono();

app.get('/api/health', (c) =>
  c.json({
    status: 'ok',
    service: 'tetrasoft-backend',
    nodeEnv: config.nodeEnv,
    timestamp: new Date().toISOString(),
  }),
);

// /api/lead is implemented in Phase 5.

const server = serve({ fetch: app.fetch, port: config.port });

console.log(`[tetrasoft-backend] listening on :${config.port} (NODE_ENV=${config.nodeEnv})`);
if (!config.telegram.botToken || !config.telegram.adminChatId) {
  console.warn('[tetrasoft-backend] Telegram credentials not configured — bot disabled (Phase 5 will require them).');
}

function shutdown(signal: NodeJS.Signals): void {
  console.log(`[tetrasoft-backend] received ${signal}, shutting down`);
  server.close();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
