import { db } from "./index";
import type { Event, EventType } from "@kreozalabs/core";

/**
 * Retrieves the local watermark map (highest known sequence_number for each known device).
 */
export async function getLocalWatermarks(): Promise<Record<string, number>> {
  const result = await db.query(
    `SELECT origin_device_id, MAX(sequence_number) as max_seq 
     FROM events 
     WHERE origin_device_id IS NOT NULL 
     GROUP BY origin_device_id`
  );

  const watermarks: Record<string, number> = {};
  for (const row of result.rows) {
    const r = row as Record<string, unknown>;
    watermarks[r.origin_device_id as string] = Number(r.max_seq || 0);
  }
  return watermarks;
}

/**
 * Returns all local events that the peer is missing based on their watermark map.
 */
export async function getEventsSince(watermarks: Record<string, number>): Promise<Event[]> {
  // 1. Get all unique devices we have events for
  const devicesResult = await db.query(
    "SELECT DISTINCT origin_device_id FROM events WHERE origin_device_id IS NOT NULL"
  );

  if (devicesResult.rows.length === 0) return [];

  const clauses: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  for (const row of devicesResult.rows) {
    const r = row as Record<string, unknown>;
    const deviceId = r.origin_device_id as string;
    const peerSeq = watermarks[deviceId] || 0;

    clauses.push(`(origin_device_id = $${paramIdx++} AND sequence_number > $${paramIdx++})`);
    params.push(deviceId, peerSeq);
  }

  const query = `
    SELECT event_id, id, type, timestamp, payload, origin_device_id, sequence_number 
    FROM events 
    WHERE ${clauses.join(" OR ")}
    ORDER BY timestamp ASC
  `;

  const result = await db.query(query, params);
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
