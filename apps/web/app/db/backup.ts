import { db } from "./index";
import { rebuildActions } from "./actions";
import { rebuildSettings } from "./settings";
import type { Event, EventType } from "../types/events";

/**
 * Queries and exports all event records chronologically from the local event log.
 */
export async function exportEvents(): Promise<Event[]> {
  const result = await db.query(
    "SELECT event_id, id, type, timestamp, payload FROM events ORDER BY timestamp ASC"
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
    };
  });
}

/**
 * Idempotently imports a list of events into the events table, rebuilds projections, and broadcasts a reload.
 */
export async function importEvents(events: Event[]): Promise<void> {
  if (!Array.isArray(events)) {
    throw new Error("Invalid backup format: data is not a list of events.");
  }

  await db.query("BEGIN");
  try {
    for (const event of events) {
      if (!event.eventId || !event.id || !event.type || !event.timestamp) {
        console.warn("Skipping malformed event during import:", event);
        continue;
      }

      const payloadString =
        typeof event.payload === "string" ? event.payload : JSON.stringify(event.payload);

      await db.query(
        `INSERT INTO events (event_id, id, type, timestamp, payload)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (event_id) DO NOTHING`,
        [event.eventId, event.id, event.type, event.timestamp, payloadString]
      );
    }
    await db.query("COMMIT");

    // 1. Rebuild actions and settings derived projection tables
    await rebuildActions();
    await rebuildSettings();

    // 2. Notify all tabs that the database was updated
    if (typeof window !== "undefined") {
      const channel = new BroadcastChannel("kei_db_sync");
      channel.postMessage({ type: "DB_UPDATED", entity: "actions" });
      channel.postMessage({ type: "DB_UPDATED", entity: "settings" });
    }
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}
