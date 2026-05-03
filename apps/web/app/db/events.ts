import { db } from "./index";
import { v7 as uuidv7 } from "uuid";
import type { Event, EventType } from "../types/events";

/**
 * Persists an event to the events table.
 * This is the low-level source of truth for all state changes.
 */
export async function persistEvent<T>(entityId: string, type: string, payload: T): Promise<Event<T>> {
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
