// TODO: Add db guard that says if db is initiailized
import { v7 as uuidv7 } from "uuid";
import type { Event, EventType } from "@kreozalabs/kei-core";
import type { DatabaseAdapter } from "./adapter";

let localSequenceCounter: number | null = null;

/**
 * Returns the next monotonic sequence number for a device, querying max from DB if not cached.
 */
export async function getNextSequenceNumber(
  deviceId: string,
  adapter: DatabaseAdapter
): Promise<number> {
  if (localSequenceCounter !== null) {
    localSequenceCounter++;
    return localSequenceCounter;
  }

  localSequenceCounter = await adapter.getNextSequenceNumber(deviceId);
  return localSequenceCounter;
}

/**
 * Persists an event to the events table.
 * This is the low-level source of truth for all state changes.
 */
export async function persistEvent<T>(
  entityId: string,
  type: string,
  payload: T,
  deviceId: string,
  adapter: DatabaseAdapter
): Promise<Event<T>> {
  const sequenceNum = await getNextSequenceNumber(deviceId, adapter);

  const event: Event<T> = {
    eventId: uuidv7(),
    id: entityId,
    type: type as EventType,
    timestamp: Date.now(),
    payload,
    originDeviceId: deviceId,
    sequenceNumber: sequenceNum,
  };

  await adapter.saveEvent(event);

  return event;
}
/**
 * Returns all events for a given entity.
 * @param entityId The ID of the entity to get events for.
 * @returns An array of events for the given entity.
 */
export async function getEventsForEntity(
  entityId: string,
  adapter: DatabaseAdapter
): Promise<Event[]> {
  return adapter.getEventsForEntity(entityId);
}
