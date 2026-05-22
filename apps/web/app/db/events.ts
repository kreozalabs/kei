import { db } from "./index";
import { v7 as uuidv7 } from "uuid";
import type { Event, EventType } from "../types/events";

/**
 * Persists an event to the events table.
 * This is the low-level source of truth for all state changes.
 */
export async function persistEvent<T>(
  entityId: string,
  type: string,
  payload: T
): Promise<Event<T>> {
  const event: Event<T> = {
    eventId: uuidv7(),
    id: entityId,
    type: type as EventType,
    timestamp: Date.now(),
    payload,
  };

  await db.query(
    "INSERT INTO events (event_id, id, type, timestamp, payload) VALUES ($1, $2, $3, $4, $5)",
    [event.eventId, event.id, event.type, event.timestamp, JSON.stringify(event.payload)]
  );

  return event;
}

export async function getActionEvents(actionId: string): Promise<Event[]> {
  const result = await db.query("SELECT * FROM events WHERE id = $1 ORDER BY timestamp ASC", [
    actionId,
  ]);
  return result.rows.map((row) => {
    const r = row as Record<string, unknown>;
    const parsePayload = (val: unknown) => {
      if (typeof val !== "string") return val;
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    };
    return {
      eventId: r.event_id as string,
      id: r.id as string,
      type: r.type as EventType,
      timestamp: Number(r.timestamp),
      payload: parsePayload(r.payload),
    };
  });
}
