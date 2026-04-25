import { PGliteWorker } from '@electric-sql/pglite/worker'

export const db = new PGliteWorker(
  new Worker(new URL('./worker.ts', import.meta.url), {
    type: 'module',
  })
)

// Initialize some tables if needed
export const initDb = async () => {
  // Check if we need to migrate from the old schema where 'id' was the PK
  try {
    const tableInfo = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'event_id'
    `);

    if (tableInfo.rows.length === 0) {
      // Check if table exists at all
      const checkTable = await db.query(`
        SELECT table_name FROM information_schema.tables WHERE table_name = 'events'
      `);

      if (checkTable.rows.length > 0) {
        console.log("Migrating events table to new schema...");
        await db.exec(`
          ALTER TABLE events RENAME TO events_old;
          CREATE TABLE events (
            event_id UUID PRIMARY KEY,
            id UUID NOT NULL,
            type TEXT NOT NULL,
            timestamp BIGINT NOT NULL,
            payload JSONB NOT NULL
          );
          INSERT INTO events (event_id, id, type, timestamp, payload)
          SELECT id, id, type, timestamp, payload FROM events_old;
          DROP TABLE events_old;
          CREATE INDEX idx_events_id ON events(id);
          CREATE INDEX idx_events_timestamp ON events(timestamp);
        `);
        console.log("Migration complete.");
      }
    }
  } catch (e) {
    console.error("Migration check failed:", e);
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      event_id UUID PRIMARY KEY,
      id UUID NOT NULL,
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
  `);
};

// Start initialization immediately
export const initPromise = initDb()
