import { db } from "../../../../apps/web/app/db/index";
import { rebuildActions } from "./actions";
import { rebuildSettings } from "./settings";
import type { Event, EventType } from "@kreozalabs/core";
import { broadcastDbUpdate } from "../utils/broadcast";

/**
 * Queries and exports all event records chronologically from the local event log.
 */
export async function exportEvents(): Promise<Event[]> {
  const result = await db.query(
    "SELECT event_id, id, type, timestamp, payload, origin_device_id, sequence_number FROM events ORDER BY timestamp ASC"
  );

  return result.rows.map((row) => {
    const r = row as Record<string, unknown>;
    let payload = r.payload;
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {
        // Keep raw value if parsing fails
      }
    }
    return {
      eventId: r.event_id as string,
      id: r.id as string,
      type: r.type as EventType,
      timestamp: Number(r.timestamp),
      payload,
      originDeviceId: r.origin_device_id as string | undefined,
      sequenceNumber: r.sequence_number ? Number(r.sequence_number) : undefined,
    };
  });
}

/**
 * Processes a batch of events and returns the count of newly inserted events.
 * Events are inserted using a single SQL transaction with ON CONFLICT DO NOTHING to ensure idempotency.
 */
class Mutex {
  private queue = Promise.resolve();

  async run<T>(fn: () => Promise<T>): Promise<T> {
    const res = new Promise<T>((resolve, reject) => {
      this.queue = this.queue.then(async () => {
        try {
          const val = await fn();
          resolve(val);
        } catch (err) {
          reject(err);
        }
      });
    });
    return res;
  }
}

const importMutex = new Mutex();

export async function importEvents(events: Event[]): Promise<number> {
  if (typeof window !== "undefined") {
    window.__activeWrites = (window.__activeWrites || 0) + 1;
    window.dispatchEvent(new CustomEvent("kei_active_writes_change"));
  }
  try {
    return await importMutex.run(() => executeImportEvents(events));
  } finally {
    if (typeof window !== "undefined") {
      window.__activeWrites = Math.max(0, (window.__activeWrites || 0) - 1);
      window.dispatchEvent(new CustomEvent("kei_active_writes_change"));
    }
  }
}

async function executeImportEvents(events: Event[]): Promise<number> {
  console.log("[P2P/Import] Received events to import:", events);
  if (!Array.isArray(events)) {
    throw new Error("Invalid backup format: data is not a list of events.");
  }

  const validEvents = events.filter((e) => e.eventId && e.id && e.type && e.timestamp);
  console.log(`[P2P/Import] Valid events count: ${validEvents.length} / total: ${events.length}`);

  if (validEvents.length === 0) {
    return 0;
  }

  const chunkSize = 100;
  let importedCount = 0;

  await db.query("BEGIN");
  try {
    for (let i = 0; i < validEvents.length; i += chunkSize) {
      const chunk = validEvents.slice(i, i + chunkSize);
      const valueStrings: string[] = [];
      const values: unknown[] = [];
      let paramIdx = 1;

      for (const event of chunk) {
        valueStrings.push(
          `($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`
        );
        const payloadString =
          typeof event.payload === "string" ? event.payload : JSON.stringify(event.payload);

        values.push(
          event.eventId,
          event.id,
          event.type,
          event.timestamp,
          payloadString,
          event.originDeviceId || null,
          event.sequenceNumber || null
        );
        importedCount++;
      }

      const insertQuery = `
        INSERT INTO events (event_id, id, type, timestamp, payload, origin_device_id, sequence_number)
        VALUES ${valueStrings.join(", ")}
        ON CONFLICT (event_id) DO NOTHING
      `;

      await db.query(insertQuery, values);
    }
    await db.query("COMMIT");

    // 1. Rebuild actions and settings derived projection tables
    await rebuildActions();
    await rebuildSettings();

    // 2. Notify all tabs that the database was updated
    broadcastDbUpdate("actions");
    broadcastDbUpdate("settings");

    return importedCount;
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}
