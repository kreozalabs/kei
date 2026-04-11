import { PGlite } from '@electric-sql/pglite'

export const db = new PGlite()

// Initialize some tables if needed
export const initDb = async () => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY,
      type TEXT NOT NULL,
      timestamp BIGINT NOT NULL,
      payload JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL
    );

    -- Initialize default settings
    INSERT INTO settings (key, value)
    VALUES ('min_daily_actions', '3'), ('max_daily_actions', '6')
    ON CONFLICT (key) DO NOTHING;
  `)
}
