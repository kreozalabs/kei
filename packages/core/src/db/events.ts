import { v7 as uuidv7 } from "uuid";
import type { Event, EventType } from "../types/events";
import type { DatabaseAdapter } from "./adapter";

let localSequenceCounter: number | null = null;

/**
 * Asserts that the database adapter is valid and initialized before executing DB operations.
 */
export function assertDatabaseAdapterReady(adapter: DatabaseAdapter): void {
  if (!adapter) {
    throw new Error("DatabaseAdapter error: Database adapter instance is null or undefined.");
  }
  if (adapter.isReady && !adapter.isReady()) {
    const status = adapter.getStatus ? adapter.getStatus() : "unconnected";
    throw new Error(`DatabaseAdapter error: Database adapter is not ready (status: ${status}).`);
  }
}

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
  assertDatabaseAdapterReady(adapter);
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
  assertDatabaseAdapterReady(adapter);
  return adapter.getEventsForEntity(entityId);
}
