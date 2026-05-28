import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { config } from './config.js';
import { leadRoutes } from './lead.js';
// Side-effect import: starts the grammY bot if credentials are configured.
import './telegram.js';

const app = new Hono();

app.get('/api/health', (c) =>
  c.json({
    status: 'ok',
    service: 'tetrasoft-backend',
    nodeEnv: config.nodeEnv,
    timestamp: new Date().toISOString(),
  }),
);

app.route('/api', leadRoutes);

const server = serve({ fetch: app.fetch, port: config.port });

console.log(
  `[tetrasoft-backend] listening on :${config.port} (NODE_ENV=${config.nodeEnv})`,
);
if (!config.telegram.botToken || !config.telegram.adminChatId) {
  console.warn(
    '[tetrasoft-backend] Telegram credentials not configured — bot disabled.',
  );
}

function shutdown(signal: NodeJS.Signals): void {
  console.log(`[tetrasoft-backend] received ${signal}, shutting down`);
  server.close();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
