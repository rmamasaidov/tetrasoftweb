import Database from 'better-sqlite3';
import { config } from './config.js';

export const db = new Database(config.sqliteFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    contact     TEXT    NOT NULL,
    message     TEXT,
    source      TEXT,
    ip          TEXT,
    user_agent  TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
`);

export interface Lead {
  id: number;
  name: string;
  contact: string;
  message: string | null;
  source: string | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

const insertStmt = db.prepare(
  `INSERT INTO leads (name, contact, message, source, ip, user_agent)
   VALUES (?, ?, ?, ?, ?, ?)
   RETURNING id, name, contact, message, source, ip, user_agent, created_at`,
);

export function insertLead(input: {
  name: string;
  contact: string;
  message: string | null;
  source: string | null;
  ip: string | null;
  userAgent: string | null;
}): Lead {
  return insertStmt.get(
    input.name,
    input.contact,
    input.message,
    input.source,
    input.ip,
    input.userAgent,
  ) as Lead;
}
