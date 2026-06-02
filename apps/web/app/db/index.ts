import { DEFAULT_SETTINGS } from "@/config/constants";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import { getOrCreateDeviceIdentity } from "./events";

export const db =
  typeof window !== "undefined"
    ? new PGliteWorker(
        new Worker(new URL("./worker.ts", import.meta.url), {
          type: "module",
        })
      )
    : (null as unknown as PGliteWorker);

/**
 * Ensures a column exists in a table without dropping or recreating it.
 * This is the preferred way to perform additive schema migrations while
 * preserving existing data.
 */

export async function ensureColumn(tableName: string, columnName: string, columnDef: string) {
  if (!db) return;
  const result = await db.query(
    `
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = $1 AND column_name = $2
  `,
    [tableName, columnName]
  );

  if (result.rows.length === 0) {
    console.log(`Adding column ${columnName} to table ${tableName}...`);
    await db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
  }
}

// Initialize some tables if needed
async function runMigrations() {
  if (!db) return;
  try {
    // 1. Core Event Migration (from old schema without event_id)
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

    // 2. Additive Migrations for other tables
    // Use ensureColumn to add new fields to existing tables without data loss.
    await ensureColumn("events", "origin_device_id", "TEXT");
    await ensureColumn("events", "sequence_number", "BIGINT");
    await db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_device_sequence 
      ON events (origin_device_id, sequence_number)
    `);

    // 3. Backfill legacy events with default device identity and monotonic sequences
    const legacyEvents = await db.query(
      "SELECT event_id FROM events WHERE origin_device_id IS NULL ORDER BY timestamp ASC"
    );

    if (legacyEvents.rows.length > 0) {
      console.log(`Backfilling ${legacyEvents.rows.length} legacy events with device identity...`);
      const localId = await getOrCreateDeviceIdentity();

      await db.query("BEGIN");
      try {
        let seq = 1;
        for (const row of legacyEvents.rows) {
          const r = row as Record<string, unknown>;
          await db.query(
            "UPDATE events SET origin_device_id = $1, sequence_number = $2 WHERE event_id = $3",
            [localId, seq++, r.event_id]
          );
        }
        await db.query("COMMIT");
        console.log("Backfill complete.");
      } catch (err) {
        await db.query("ROLLBACK");
        console.error("Backfill failed:", err);
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
      payload JSONB NOT NULL,
      origin_device_id TEXT,
      sequence_number BIGINT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_device_sequence 
    ON events (origin_device_id, sequence_number);

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
