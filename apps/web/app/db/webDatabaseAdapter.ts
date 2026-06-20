import {
  type DatabaseAdapter,
  type Event,
  type EventType,
  type Action,
  type ActionStatus,
} from "@kreozalabs/core";
import { db } from "./index";

// The BroadcastChannel only exists in the browser
const channel = typeof window !== "undefined" ? new BroadcastChannel("kei_db_sync") : null;

declare global {
  interface Window {
    __activeWrites?: number;
  }
}

export const webDatabaseAdapter: DatabaseAdapter = {
  async getEventsForEntity(entityId: string): Promise<Event[]> {
    const result = await db.query("SELECT * FROM events WHERE id = $1 ORDER BY timestamp ASC", [
      entityId,
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
  },

  async saveEvent(event: Event<any>) {
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
  },

  async saveEventsBatch(events: Event<any>[]): Promise<number> {
    const chunkSize = 100;
    let importedCount = 0;

    await db.query("BEGIN");
    try {
      for (let i = 0; i < events.length; i += chunkSize) {
        const chunk = events.slice(i, i + chunkSize);
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
      return importedCount;
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  },

  async getNextSequenceNumber(deviceId: string) {
    const result = await db.query(
      "SELECT MAX(sequence_number) as max_seq FROM events WHERE origin_device_id = $1",
      [deviceId]
    );
    return Number(result.rows[0]?.max_seq || 0) + 1;
  },

  async getEvents(): Promise<Event[]> {
    const result = await db.query("SELECT * FROM events ORDER BY timestamp ASC");
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
  },

  async getAction(id: string): Promise<Action | null> {
    const result = await db.query("SELECT * FROM actions WHERE id = $1", [id]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0] as Record<string, unknown>;
    const parseDuration = (val: unknown) => {
      if (typeof val !== "string") return val;
      try {
        return JSON.parse(val);
      } catch {
        return null;
      }
    };

    return {
      ...row,
      scheduledDate: row.scheduled_date as string,
      startTime: row.start_time as string | null,
      endTime: row.end_time as string | null,
      createdAt: Number(row.created_at),
      sortOrder: Number(row.sort_order),
      duration: parseDuration(row.duration),
    } as unknown as Action;
  },

  async upsertAction(action: Action): Promise<void> {
    await db.query(
      `INSERT INTO actions (
        id, title, note, intention, important, energy, duration, 
        scheduled_date, start_time, end_time, timezone, status, created_at, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        note = EXCLUDED.note,
        intention = EXCLUDED.intention,
        important = EXCLUDED.important,
        energy = EXCLUDED.energy,
        duration = EXCLUDED.duration,
        scheduled_date = EXCLUDED.scheduled_date,
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        timezone = EXCLUDED.timezone,
        status = EXCLUDED.status,
        sort_order = EXCLUDED.sort_order`,
      [
        action.id,
        action.title,
        action.note,
        action.intention,
        action.important,
        action.energy,
        JSON.stringify(action.duration),
        action.scheduledDate,
        action.startTime,
        action.endTime,
        action.timezone,
        action.status,
        action.createdAt,
        action.sortOrder,
      ]
    );
  },

  async deleteAction(id: string): Promise<void> {
    await db.query("DELETE FROM actions WHERE id = $1", [id]);
  },

  async clearActions(): Promise<void> {
    await db.query("DELETE FROM actions");
  },

  async getMaxSortOrder(scheduledDate: string): Promise<number | null> {
    const result = await db.query(
      "SELECT MAX(sort_order) as max_order FROM actions WHERE scheduled_date = $1 AND status = 'active'",
      [scheduledDate]
    );
    const maxOrder = (result.rows[0] as Record<string, unknown> | undefined)?.max_order;
    return maxOrder !== null && maxOrder !== undefined ? Number(maxOrder) : null;
  },

  async getActions(filters?: {
    startDate?: string;
    endDate?: string;
    status?: ActionStatus[];
  }): Promise<Action[]> {
    let query = `SELECT * FROM actions`;
    const params: unknown[] = [];
    const whereClauses: string[] = [];

    if (filters?.startDate) {
      params.push(filters.startDate);
      whereClauses.push(`scheduled_date >= $${params.length}`);
    }

    if (filters?.endDate) {
      params.push(filters.endDate);
      whereClauses.push(`scheduled_date <= $${params.length}`);
    }

    if (filters?.status && filters.status.length > 0) {
      const statusPlaceholders = filters.status
        .map((_, i) => {
          params.push(filters.status![i]);
          return `$${params.length}`;
        })
        .join(", ");
      whereClauses.push(`status IN (${statusPlaceholders})`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(" AND ");
    }

    const result = await db.query(query, params);
    return result.rows.map((row) => {
      const r = row as Record<string, unknown>;
      const parseDuration = (val: unknown) => {
        if (typeof val !== "string") return val;
        try {
          return JSON.parse(val);
        } catch {
          return null;
        }
      };
      return {
        ...r,
        scheduledDate: r.scheduled_date as string,
        startTime: r.start_time as string | null,
        endTime: r.end_time as string | null,
        createdAt: Number(r.created_at),
        sortOrder: Number(r.sort_order),
        duration: parseDuration(r.duration),
      } as unknown as Action;
    });
  },

  async saveActionsBatch(actions: Action[]): Promise<void> {
    const valueStrings: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    for (const action of actions) {
      valueStrings.push(
        `($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`
      );
      values.push(
        action.id,
        action.title,
        action.note,
        action.intention,
        action.important,
        action.energy,
        JSON.stringify(action.duration),
        action.scheduledDate,
        action.startTime,
        action.endTime,
        action.timezone,
        action.status,
        action.createdAt,
        action.sortOrder
      );
    }

    const insertQuery = `
      INSERT INTO actions (
        id, title, note, intention, important, energy, duration, 
        scheduled_date, start_time, end_time, timezone, status, created_at, sort_order
      ) VALUES ${valueStrings.join(", ")}
    `;

    await db.query(insertQuery, values);
  },

  async getSetting<T>(key: string): Promise<T | null> {
    const result = await db.query("SELECT value FROM settings WHERE key = $1", [key]);
    if (result.rows.length === 0) return null;
    const value = (result.rows[0] as { value: unknown }).value;
    if (typeof value !== "string") return value as T;
    try {
      return JSON.parse(value);
    } catch {
      return value as unknown as T;
    }
  },

  async upsertSetting(key: string, value: unknown): Promise<void> {
    await db.query(
      "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      [key, JSON.stringify(value)]
    );
  },

  async clearSettings(): Promise<void> {
    await db.query("DELETE FROM settings");
  },

  async saveSettingsBatch(settings: [string, unknown][]): Promise<void> {
    const valueStrings: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    for (const [key, value] of settings) {
      valueStrings.push(`($${paramIdx++}, $${paramIdx++})`);
      values.push(key, JSON.stringify(value));
    }

    // Notice we DO UPDATE here so rebuildSettings works properly when overriding
    const insertQuery = `
      INSERT INTO settings (key, value) 
      VALUES ${valueStrings.join(", ")} 
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
    await db.query(insertQuery, values);
  },

  async transaction<T>(callback: (txAdapter: DatabaseAdapter) => Promise<T>): Promise<T> {
    await db.query("BEGIN");
    try {
      const result = await callback(this);
      await db.query("COMMIT");
      return result;
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  },

  notifyUpdate(entity) {
    if (channel) {
      channel.postMessage({ type: "DB_UPDATED", entity });
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("kei_db_sync_local", { detail: { type: "DB_UPDATED", entity } })
      );
    }
  },

  incrementActiveWrites() {
    if (typeof window !== "undefined") {
      window.__activeWrites = (window.__activeWrites || 0) + 1;
      window.dispatchEvent(new CustomEvent("kei_active_writes_change"));
    }
  },

  decrementActiveWrites() {
    if (typeof window !== "undefined") {
      window.__activeWrites = Math.max(0, (window.__activeWrites || 0) - 1);
      window.dispatchEvent(new CustomEvent("kei_active_writes_change"));
    }
  },
};
