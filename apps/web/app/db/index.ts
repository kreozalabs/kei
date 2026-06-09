import { DEFAULT_SETTINGS } from "@/config/constants";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import { getOrCreateDeviceIdentity } from "@/utils/device";

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
    const checkTableAndColumn = await db.query(`
      SELECT 
        EXISTS (
          SELECT 1 FROM pg_class c
          JOIN pg_namespace n ON c.relnamespace = n.oid
          WHERE n.nspname = 'public' AND c.relname = 'events'
        ) as table_exists,
        EXISTS (
          SELECT 1 FROM pg_class c
          JOIN pg_attribute a ON a.attrelid = c.oid
          JOIN pg_namespace n ON c.relnamespace = n.oid
          WHERE n.nspname = 'public' 
            AND c.relname = 'events' 
            AND a.attname = 'event_id'
            AND NOT a.attisdropped
        ) as column_exists;
    `);

    const { table_exists, column_exists } = checkTableAndColumn.rows[0] as {
      table_exists: boolean;
      column_exists: boolean;
    };

    if (table_exists && !column_exists) {
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

    // 2. Additive Migrations for other tables
    // We use native ALTER TABLE ADD COLUMN IF NOT EXISTS for atomic, bulletproof execution
    await db.exec(`
      ALTER TABLE events ADD COLUMN IF NOT EXISTS origin_device_id TEXT;
      ALTER TABLE events ADD COLUMN IF NOT EXISTS sequence_number BIGINT;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_device_sequence 
      ON events (origin_device_id, sequence_number);
    `);

    // 3. Backfill legacy events with default device identity and monotonic sequences
    const legacyEvents = await db.query(
      "SELECT event_id FROM events WHERE origin_device_id IS NULL LIMIT 1"
    );

    if (legacyEvents.rows.length > 0) {
      console.log("Backfilling legacy events with device identity...");
      const localId = getOrCreateDeviceIdentity();

      await db.query(
        `
        WITH numbered_events AS (
          SELECT event_id, ROW_NUMBER() OVER (ORDER BY timestamp ASC) as seq
          FROM events
          WHERE origin_device_id IS NULL
        )
        UPDATE events
        SET origin_device_id = $1,
            sequence_number = numbered_events.seq
        FROM numbered_events
        WHERE events.event_id = numbered_events.event_id
      `,
        [localId]
      );
      console.log("Backfill complete.");
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
      payload JSONB NOT NULL,
      origin_device_id TEXT,
      sequence_number BIGINT
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

    CREATE INDEX IF NOT EXISTS idx_actions_scheduled_status 
    ON actions (scheduled_date, status);
  `);
}

async function ensureDefaults() {
  const { initDefaultSettings } = await import("./settings");
  await initDefaultSettings(DEFAULT_SETTINGS);
}

async function ensureDerivedData() {
  if (!db) return;

  const eventsExist = await db.query("SELECT 1 FROM events LIMIT 1");
  if (eventsExist.rows.length === 0) return;

  // 1. Rebuild actions if actions table is empty
  const actionsExist = await db.query("SELECT 1 FROM actions LIMIT 1");
  if (actionsExist.rows.length === 0) {
    console.log("Actions table is empty. Rebuilding from event log...");
    const { rebuildActions } = await import("./actions");
    await rebuildActions();
  }

  // 2. Rebuild settings from settings-related events if needed
  // Check if we have custom setting updates in the event log
  const hasSettingsEvents = await db.query(
    "SELECT 1 FROM events WHERE type = 'SETTING_UPDATED' LIMIT 1"
  );

  if (hasSettingsEvents.rows.length > 0) {
    // If we have custom settings in the event log, we should rebuild them
    // to ensure they overlay correctly on top of the defaults.
    console.log("Settings events found. Syncing configurations from event log...");
    const { rebuildSettings } = await import("./settings");
    await rebuildSettings();
  }
}

export const initDb = async () => {
  if (typeof window === "undefined") return;
  await ensureSchema();
  await runMigrations();
  await ensureDefaults();
  await ensureDerivedData();
};

// Start initialization immediately
export const initPromise = typeof window !== "undefined" ? initDb() : Promise.resolve();
