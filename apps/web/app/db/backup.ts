import { db } from "./index";
import { rebuildActions } from "./actions";
import { rebuildSettings } from "./settings";
import type { Event, EventType } from "../types/events";

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
export async function importEvents(events: Event[]): Promise<number> {
  if (!Array.isArray(events)) {
    throw new Error("Invalid backup format: data is not a list of events.");
  }

  const validEvents = events.filter((e) => e.eventId && e.id && e.type && e.timestamp);

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
    if (typeof window !== "undefined") {
      const channel = new BroadcastChannel("kei_db_sync");
      channel.postMessage({ type: "DB_UPDATED", entity: "actions" });
      channel.postMessage({ type: "DB_UPDATED", entity: "settings" });
    }

    return importedCount;
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}
