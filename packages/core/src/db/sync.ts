import type { Event } from "@kreozalabs/core";
import type { DatabaseAdapter } from "./adapter";

/**
 * Retrieves the local watermark map (highest known sequence_number for each known device).
 */
export async function getLocalWatermarks(
  adapter: DatabaseAdapter
): Promise<Record<string, number>> {
  return await adapter.getLocalWatermarks();
}

/**
 * Returns all local events that the peer is missing based on their watermark map.
 */
export async function getEventsSince(
  watermarks: Record<string, number>,
  adapter: DatabaseAdapter
): Promise<Event[]> {
  return await adapter.getEventsSince(watermarks);
}
