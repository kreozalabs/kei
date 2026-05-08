import { DEFAULT_SETTINGS } from "@/config/constants";
import { PGliteWorker } from "@electric-sql/pglite/worker";

export const db =
  typeof window !== "undefined"
    ? new PGliteWorker(
        new Worker(new URL("./worker.ts", import.meta.url), {
          type: "module",
        })
      )
    : (null as unknown as PGliteWorker);

// Initialize some tables if needed
async function runMigrations() {
  if (!db) return;
  try {
    const tableInfo = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'event_id'
    `);

    if (tableInfo.rows.length === 0) {
      const checkTable = await db.query(`
        SELECT table_name FROM information_schema.tables WHERE table_name = 'events'
      `);

      if (checkTable.rows.length > 0) {
        console.log("Migrating events table to new schema...");
        await db.exec(`
          ALTER TABLE events RENAME TO events_old;
          CREATE TABLE events (
            event_id UUID PRIMARY KEY,
            id TEXT NOT NULL,
            type TEXT NOT NULL,
            timestamp BIGINT NOT NULL,
            payload JSONB NOT NULL
          );
          INSERT INTO events (event_id, id, type, timestamp, payload)
          SELECT gen_random_uuid(), id, type, timestamp, payload FROM events_old;
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
}

async function ensureSchema() {
  if (!db) return;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      event_id UUID PRIMARY KEY,
      id TEXT NOT NULL,
      type TEXT NOT NULL,
      timestamp BIGINT NOT NULL,
      payload JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS actions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      note TEXT,
      intention TEXT NOT NULL,
      important BOOLEAN NOT NULL,
      energy TEXT NOT NULL,
      duration JSONB,
      scheduled_date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      timezone TEXT,
      status TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      sort_order DOUBLE PRECISION NOT NULL
    );
  `);
}

async function ensureDefaults() {
  const { initDefaultSettings } = await import("./settings");
  await initDefaultSettings(DEFAULT_SETTINGS);
}

async function ensureDerivedData() {
  if (!db) return;
  // Check if actions table is empty but we have events
  const actionsExist = await db.query("SELECT 1 FROM actions LIMIT 1");
  const eventsExist = await db.query("SELECT 1 FROM events LIMIT 1");

  if (actionsExist.rows.length === 0 && eventsExist.rows.length > 0) {
    console.log("Derived data tables are empty. Rebuilding from event log...");
    const { rebuildActions } = await import("./actions");
    const { rebuildSettings } = await import("./settings");
    await rebuildActions();
    await rebuildSettings();
    console.log("Derived data rebuild complete.");
  }
}

export const initDb = async () => {
  if (typeof window === "undefined") return;
  await runMigrations();
  await ensureSchema();
  await ensureDefaults();
  await ensureDerivedData();
};

// Start initialization immediately
export const initPromise = typeof window !== "undefined" ? initDb() : Promise.resolve();
