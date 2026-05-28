import { Hono } from 'hono';
import { insertLead } from './db.js';
import { notifyAdminOfLead } from './telegram.js';

const leadRoutes = new Hono();

// In-memory per-IP rate limit. For the contact form's expected volume this is
// fine; if traffic grows or the backend is horizontally scaled, replace with
// Redis or move the rate limit to Caddy.
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
const buckets = new Map<string, number[]>();

function checkRate(ip: string): boolean {
  const now = Date.now();
  const recent = (buckets.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    buckets.set(ip, recent);
    return false;
  }
  recent.push(now);
  buckets.set(ip, recent);
  return true;
}

function clip(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

leadRoutes.post('/lead', async (c) => {
  const ip =
    c.req.header('x-real-ip') ??
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';

  if (!checkRate(ip)) {
    return c.json({ error: 'rate_limited' }, 429);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid_json' }, 400);
  }
  if (typeof body !== 'object' || body === null) {
    return c.json({ error: 'invalid_body' }, 400);
  }

  const obj = body as Record<string, unknown>;
  const name = clip(obj.name, 100);
  const contact = clip(obj.contact, 200);
  const message = clip(obj.message, 2000);
  const source = clip(obj.source, 100);

  if (!name || !contact) {
    return c.json({ error: 'name_and_contact_required' }, 400);
  }

  const lead = insertLead({
    name,
    contact,
    message,
    source,
    ip,
    userAgent: c.req.header('user-agent') ?? null,
  });

  // Don't fail the user's submission if Telegram is briefly unreachable.
  notifyAdminOfLead(lead).catch((err) => {
    console.error('[tetrasoft-backend] telegram notify failed:', err);
  });

  return c.json({ ok: true, id: lead.id });
});

export { leadRoutes };
