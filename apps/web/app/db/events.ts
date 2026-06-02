import { db } from "./index";
import { v7 as uuidv7 } from "uuid";
import type { Event, EventType } from "../types/events";
import { getOrCreateDeviceIdentity } from "@/utils/device";

let localSequenceCounter: number | null = null;

/**
 * Returns the next monotonic sequence number for a device, querying max from DB if not cached.
 */
export async function getNextSequenceNumber(deviceId: string): Promise<number> {
  if (localSequenceCounter !== null) {
    localSequenceCounter++;
    return localSequenceCounter;
  }

  const result = await db.query(
    "SELECT MAX(sequence_number) as max_seq FROM events WHERE origin_device_id = $1",
    [deviceId]
  );
  const maxSeq = Number((result.rows[0] as Record<string, unknown> | undefined)?.max_seq || 0);
  localSequenceCounter = maxSeq + 1;
  return localSequenceCounter;
}

/**
 * Persists an event to the events table.
 * This is the low-level source of truth for all state changes.
 */
export async function persistEvent<T>(
  entityId: string,
  type: string,
  payload: T
): Promise<Event<T>> {
  const deviceId = getOrCreateDeviceIdentity();
  const sequenceNum = await getNextSequenceNumber(deviceId);

  const event: Event<T> = {
    eventId: uuidv7(),
    id: entityId,
    type: type as EventType,
    timestamp: Date.now(),
    payload,
    originDeviceId: deviceId,
    sequenceNumber: sequenceNum,
  };

  await db.query(
    "INSERT INTO events (event_id, id, type, timestamp, payload, origin_device_id, sequence_number) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [
      event.eventId,
      event.id,
      event.type,
      event.timestamp,
      JSON.stringify(event.payload),
      event.originDeviceId,
      event.sequenceNumber,
    ]
  );

  return event;
}
// FIXME: Rename function to `getEventsForEntity(entityId: string)`.
// Actually, this function just gets all events for a given entity.
// The name `getActionEvents` is misleading.
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
      originDeviceId: r.origin_device_id as string | undefined,
      sequenceNumber: r.sequence_number ? Number(r.sequence_number) : undefined,
    };
  });
}
