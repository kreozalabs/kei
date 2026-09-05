/* eslint-disable @typescript-eslint/no-explicit-any */

import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

let db: any = null;
let initPromise: Promise<void> | null = null;

async function checkAndRunMigration(sqlite3: any) {
  // Check if SQLite database already exists in OPFS
  let sqliteExists = false;
  try {
    const root = await navigator.storage.getDirectory();
    await root.getFileHandle("kei.sqlite3", { create: false });
    sqliteExists = true;
  } catch {
    // Doesn't exist
  }

  // Check if old IndexedDB 'kei-db' exists
  let oldDbExists = false;
  if (typeof indexedDB !== "undefined" && indexedDB.databases) {
    try {
      const dbs = await indexedDB.databases();
      oldDbExists = dbs.some((d) => d.name === "kei-db");
    } catch (e) {
      console.warn("Failed to list IndexedDB databases:", e);
    }
  }

  if (!oldDbExists) {
    console.log("No old PGlite IndexedDB 'kei-db' found. Proceeding with SQLite.");
    return;
  }

  // If old DB exists, we need to handle it
  console.log("Old PGlite IndexedDB 'kei-db' detected.");

  if (sqliteExists) {
    // SQLite already exists. Let's check if the migration was already marked successful
    let migrated = false;
    let tempDb: any = null;
    try {
      if (sqlite3.oo1?.OpfsDb) {
        tempDb = new sqlite3.oo1.OpfsDb("/kei.sqlite3");
      } else {
        tempDb = new sqlite3.oo1.DB("/kei.sqlite3", "c");
      }
      if (sqlite3.capi && sqlite3.capi.sqlite3_trace_v2 && tempDb.pointer) {
        try {
          sqlite3.capi.sqlite3_trace_v2(tempDb.pointer, 0, 0, 0);
        } catch (e) {
          console.warn("Failed to trace SQLite database:", e);
        }
      }
      // Check migration flag
      const rows: any[] = [];
      tempDb.exec({
        sql: "SELECT value FROM settings WHERE key = ?",
        bind: ["migrated_from_pglite"],
        rowMode: "object",
        callback: (row: any) => rows.push(row),
      });
      if (rows.length > 0) {
        const val = JSON.parse(rows[0].value);
        if (val === true) {
          migrated = true;
        }
      }
    } catch (e) {
      console.warn("Failed to check migration flag in existing SQLite:", e);
    } finally {
      if (tempDb) {
        try {
          tempDb.close();
        } catch {
          // ignore
        }
      }
    }

    if (migrated) {
      console.log("Migration was already completed previously. Purging old IndexedDB...");
      try {
        indexedDB.deleteDatabase("kei-db");
      } catch (e) {
        console.error("Failed to delete old IndexedDB:", e);
      }
      return;
    }
  }

  // Run the full migration
  console.log("Starting data migration from PGlite to SQLite WASM...");
  let tempDb: any = null;
  try {
    const { PGlite } = await import("@electric-sql/pglite");
    const oldDb = new PGlite("idb://kei-db");

    let oldEvents: any[] = [];
    let oldSettings: any[] = [];
    let oldActions: any[] = [];

    try {
      const res = await oldDb.query("SELECT * FROM events");
      oldEvents = res.rows || [];
    } catch (e) {
      console.warn("Migration: failed to read events from PGlite:", e);
    }

    try {
      const res = await oldDb.query("SELECT * FROM settings");
      oldSettings = res.rows || [];
    } catch (e) {
      console.warn("Migration: failed to read settings from PGlite:", e);
    }

    try {
      const res = await oldDb.query("SELECT * FROM actions");
      oldActions = res.rows || [];
    } catch (e) {
      console.warn("Migration: failed to read actions from PGlite:", e);
    }

    await oldDb.close();

    console.log(
      `Migration read: ${oldEvents.length} events, ${oldSettings.length} settings, ${oldActions.length} actions.`
    );

    // Initialize/open temp SQLite database
    if (sqlite3.oo1?.OpfsDb) {
      tempDb = new sqlite3.oo1.OpfsDb("/kei.sqlite3");
    } else {
      tempDb = new sqlite3.oo1.DB("/kei.sqlite3", "c");
    }

    // Ensure SQLite schema exists
    tempDb.exec({
      sql: `
        CREATE TABLE IF NOT EXISTS events (
          event_id TEXT PRIMARY KEY,
          id TEXT NOT NULL,
          type TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          payload TEXT NOT NULL,
          origin_device_id TEXT,
          sequence_number INTEGER
        );

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS actions (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          note TEXT,
          intention TEXT NOT NULL,
          important INTEGER NOT NULL,
          energy TEXT NOT NULL,
          duration TEXT,
          scheduled_date TEXT NOT NULL,
          start_time TEXT,
          end_time TEXT,
          timezone TEXT,
          status TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          sort_order REAL NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_events_id ON events(id);
        CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_events_device_sequence ON events(origin_device_id, sequence_number);
      `,
    });

    // Populate data
    tempDb.exec({ sql: "BEGIN TRANSACTION" });
    try {
      for (const ev of oldEvents) {
        tempDb.exec({
          sql: `INSERT OR IGNORE INTO events (event_id, id, type, timestamp, payload, origin_device_id, sequence_number) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          bind: [
            ev.event_id,
            ev.id,
            ev.type,
            Number(ev.timestamp),
            typeof ev.payload === "string" ? ev.payload : JSON.stringify(ev.payload),
            ev.origin_device_id,
            ev.sequence_number !== null && ev.sequence_number !== undefined
              ? Number(ev.sequence_number)
              : null,
          ],
        });
      }

      for (const st of oldSettings) {
        tempDb.exec({
          sql: `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
          bind: [st.key, typeof st.value === "string" ? st.value : JSON.stringify(st.value)],
        });
      }

      for (const ac of oldActions) {
        tempDb.exec({
          sql: `INSERT OR REPLACE INTO actions (
                  id, title, note, intention, important, energy, duration, 
                  scheduled_date, start_time, end_time, timezone, status, created_at, sort_order
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          bind: [
            ac.id,
            ac.title,
            ac.note,
            ac.intention,
            ac.important ? 1 : 0,
            ac.energy,
            typeof ac.duration === "string" ? ac.duration : JSON.stringify(ac.duration),
            ac.scheduled_date,
            ac.start_time,
            ac.end_time,
            ac.timezone,
            ac.status,
            Number(ac.created_at),
            Number(ac.sort_order),
          ],
        });
      }

      // Mark migration as successful
      tempDb.exec({
        sql: "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
        bind: ["migrated_from_pglite", JSON.stringify(true)],
      });

      tempDb.exec({ sql: "COMMIT" });
      console.log("Migration successfully committed to SQLite WASM.");
    } catch (txErr) {
      tempDb.exec({ sql: "ROLLBACK" });
      console.error("Migration failed inside transaction, rolled back:", txErr);
      throw txErr;
    }

    // Purge old IndexedDB database
    try {
      indexedDB.deleteDatabase("kei-db");
      console.log("Old PGlite IndexedDB purged successfully.");
    } catch (e) {
      console.error("Failed to purge old IndexedDB:", e);
    }
  } catch (err) {
    console.error("Error performing PGlite to SQLite WASM migration:", err);
  } finally {
    if (tempDb) {
      try {
        tempDb.close();
      } catch {
        // ignore
      }
    }
  }
}

async function initDb() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const sqlite3 = (await sqlite3InitModule()) as any;

    // Diagnostic logging for OPFS availability
    console.log("SQLite WASM OPFS Diagnostic:", {
      isSecureContext: self.isSecureContext,
      crossOriginIsolated: self.crossOriginIsolated,
      hasSharedArrayBuffer: typeof self.SharedArrayBuffer !== "undefined",
      hasStorage: typeof navigator.storage !== "undefined",
      hasOPFS: typeof navigator.storage?.getDirectory !== "undefined",
      sqliteHasOpfs: !!sqlite3.opfs,
      sqliteHasOpfsDb: !!sqlite3.oo1?.OpfsDb,
    });

    // Check and run migration before opening the main connection
    await checkAndRunMigration(sqlite3);

    if (sqlite3.oo1?.OpfsDb) {
      db = new sqlite3.oo1.OpfsDb("/kei.sqlite3");
    } else {
      console.warn("OPFS is not available. Falling back to in-memory database.");
      db = new sqlite3.oo1.DB("/kei.sqlite3", "c");
    }

    // Disable verbose SQL console tracing
    if (sqlite3.capi && sqlite3.capi.sqlite3_trace_v2 && db.pointer) {
      try {
        sqlite3.capi.sqlite3_trace_v2(db.pointer, 0, 0, 0);
      } catch (e) {
        console.warn("Failed to disable SQL tracing:", e);
      }
    }

    // Always run schema verification on the database connection
    db.exec({
      sql: `
        CREATE TABLE IF NOT EXISTS events (
          event_id TEXT PRIMARY KEY,
          id TEXT NOT NULL,
          type TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          payload TEXT NOT NULL,
          origin_device_id TEXT,
          sequence_number INTEGER
        );

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS actions (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          note TEXT,
          intention TEXT NOT NULL,
          important INTEGER NOT NULL,
          energy TEXT NOT NULL,
          duration TEXT,
          scheduled_date TEXT NOT NULL,
          start_time TEXT,
          end_time TEXT,
          timezone TEXT,
          status TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          sort_order REAL NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_events_id ON events(id);
        CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_events_device_sequence ON events(origin_device_id, sequence_number);
      `,
    });

    console.log("SQLite WASM connection established and schema verified.");
  })();
  return initPromise;
}

self.onmessage = async (event: MessageEvent) => {
  const origin = (event as MessageEvent & { origin?: string }).origin;
  const trustedOrigin = self.location.origin;

  // Verify message origin when provided.
  // In worker messaging, origin may be absent or "null" depending on sender/context.
  if (origin && origin !== "null" && origin !== trustedOrigin) {
    throw new Error(`Untrusted message origin: ${origin}`);
  }

  const { id, type, sql, params } = event.data;

  try {
    if (type === "init") {
      await initDb();
      self.postMessage({ id, type: "success" });
      return;
    }

    if (type === "query") {
      if (!db) {
        throw new Error("Database not initialized. Please call 'init' first.");
      }

      const rows: any[] = [];
      db.exec({
        sql,
        bind: params || [],
        rowMode: "object",
        callback: (row: any) => {
          rows.push(row);
        },
      });

      self.postMessage({ id, type: "success", rows });
      return;
    }

    if (type === "exec") {
      if (!db) {
        throw new Error("Database not initialized. Please call 'init' first.");
      }
      db.exec({ sql });
      self.postMessage({ id, type: "success" });
      return;
    }

    throw new Error(`Unknown message type: ${type}`);
  } catch (error: any) {
    self.postMessage({
      id,
      type: "error",
      error: error?.message || String(error),
    });
  }
};
