/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type DatabaseAdapter,
  type Event,
  type EventType,
  type Action,
  type ActionStatus,
} from "@kreozalabs/core";
import { getOrCreateDeviceIdentity } from "@/utils/device";

// Export db as null to maintain interface compatibility with old PGlite imports
export const db: any = null;

// The BroadcastChannel only exists in the browser
const channel = typeof window !== "undefined" ? new BroadcastChannel("kei_db_sync") : null;

declare global {
  interface Window {
    __activeWrites?: number;
  }
}

// FIFO Promise-based lock to serialize all DB operations
let lockChain: Promise<any> = Promise.resolve();
let transactionDepth = 0;

async function acquireLock(): Promise<() => void> {
  let resolveLock: () => void;
  const newLock = new Promise<void>((resolve) => {
    resolveLock = resolve;
  });
  const previousLock = lockChain;
  lockChain = newLock;
  await previousLock;
  return resolveLock!;
}

// Worker message handling client
let worker: Worker | null = null;
const pendingRequests = new Map<
  number,
  { resolve: (value: any) => void; reject: (reason: any) => void }
>();
let nextRequestId = 0;

function getWorker(): Worker {
  if (typeof window === "undefined") {
    throw new Error("Worker cannot be initialized on the server side.");
  }
  if (!worker) {
    worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (event: MessageEvent) => {
      const { id, type, rows, error } = event.data;
      const pending = pendingRequests.get(id);
      if (!pending) return;

      pendingRequests.delete(id);
      if (type === "success") {
        pending.resolve(rows);
      } else {
        pending.reject(new Error(error || "Unknown worker error"));
      }
    };
  }
  return worker;
}

function sendToWorker(type: "init" | "query" | "exec", sql?: string, params?: any[]): Promise<any> {
  const w = getWorker();
  const id = nextRequestId++;
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });
    w.postMessage({ id, type, sql, params });
  });
}

export interface WebDatabaseAdapter extends DatabaseAdapter {
  query(sql: string, params?: any[]): Promise<any[]>;
  queryDirect(sql: string, params?: any[]): Promise<any[]>;
}

export const webDatabaseAdapter: WebDatabaseAdapter = {
  async connect() {
    await sendToWorker("init");
  },

  async disconnect() {
    // Connection managed by worker lifecycle
  },

  getDeviceId() {
    return getOrCreateDeviceIdentity();
  },

  async queryDirect(sql: string, params?: any[]): Promise<any[]> {
    return sendToWorker("query", sql, params);
  },

  async query(sql: string, params?: any[]): Promise<any[]> {
    const release = await acquireLock();
    try {
      return await this.queryDirect(sql, params);
    } finally {
      release();
    }
  },

  async getEventsForEntity(entityId: string): Promise<Event[]> {
    const rows = await this.query("SELECT * FROM events WHERE id = ? ORDER BY timestamp ASC", [
      entityId,
    ]);
    return rows.map((r: any) => {
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

  async saveEvent(event: Event<unknown>) {
    await this.query(
      "INSERT INTO events (event_id, id, type, timestamp, payload, origin_device_id, sequence_number) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        event.eventId,
        event.id,
        event.type,
        event.timestamp,
        JSON.stringify(event.payload),
        event.originDeviceId || null,
        event.sequenceNumber || null,
      ]
    );
  },

  async saveEventsBatch(events: Event<unknown>[]): Promise<number> {
    if (events.length === 0) return 0;
    let importedCount = 0;

    const execute = async (adapterToUse: any) => {
      for (const event of events) {
        const payloadString =
          typeof event.payload === "string" ? event.payload : JSON.stringify(event.payload);

        await adapterToUse.query(
          `INSERT OR IGNORE INTO events (event_id, id, type, timestamp, payload, origin_device_id, sequence_number)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            event.eventId,
            event.id,
            event.type,
            event.timestamp,
            payloadString,
            event.originDeviceId || null,
            event.sequenceNumber || null,
          ]
        );
        importedCount++;
      }
    };

    if (transactionDepth > 0) {
      await execute(this);
    } else {
      await this.transaction(async (tx) => {
        await execute(tx);
      });
    }
    return importedCount;
  },

  async getNextSequenceNumber(deviceId: string) {
    const rows = await this.query(
      "SELECT MAX(sequence_number) as max_seq FROM events WHERE origin_device_id = ?",
      [deviceId]
    );
    const row = rows[0] as { max_seq?: number | null } | undefined;
    return Number(row?.max_seq || 0) + 1;
  },

  async getEvents(): Promise<Event[]> {
    const rows = await this.query("SELECT * FROM events ORDER BY timestamp ASC");
    return rows.map((r: any) => {
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
    const rows = await this.query("SELECT * FROM actions WHERE id = ?", [id]);
    if (rows.length === 0) return null;

    const row = rows[0] as Record<string, unknown>;
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
      important: row.important === 1,
      scheduledDate: row.scheduled_date as string,
      startTime: row.start_time as string | null,
      endTime: row.end_time as string | null,
      createdAt: Number(row.created_at),
      sortOrder: Number(row.sort_order),
      duration: parseDuration(row.duration),
    } as unknown as Action;
  },

  async upsertAction(action: Action): Promise<void> {
    await this.query(
      `INSERT INTO actions (
        id, title, note, intention, important, energy, duration, 
        scheduled_date, start_time, end_time, timezone, status, created_at, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        title = excluded.title,
        note = excluded.note,
        intention = excluded.intention,
        important = excluded.important,
        energy = excluded.energy,
        duration = excluded.duration,
        scheduled_date = excluded.scheduled_date,
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        timezone = excluded.timezone,
        status = excluded.status,
        sort_order = excluded.sort_order`,
      [
        action.id,
        action.title,
        action.note,
        action.intention,
        action.important ? 1 : 0,
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
    await this.query("DELETE FROM actions WHERE id = ?", [id]);
  },

  async clearActions(): Promise<void> {
    await this.query("DELETE FROM actions");
  },

  async getMaxSortOrder(scheduledDate: string): Promise<number | null> {
    const rows = await this.query(
      "SELECT MAX(sort_order) as max_order FROM actions WHERE scheduled_date = ? AND status = 'active'",
      [scheduledDate]
    );
    const maxOrder = (rows[0] as Record<string, unknown> | undefined)?.max_order;
    return maxOrder !== null && maxOrder !== undefined ? Number(maxOrder) : null;
  },

  async getActions(filters?: {
    startDate?: string;
    endDate?: string;
    status?: ActionStatus[];
  }): Promise<Action[]> {
    let queryStr = `SELECT * FROM actions`;
    const params: unknown[] = [];
    const whereClauses: string[] = [];

    if (filters?.startDate) {
      params.push(filters.startDate);
      whereClauses.push(`scheduled_date >= ?`);
    }

    if (filters?.endDate) {
      params.push(filters.endDate);
      whereClauses.push(`scheduled_date <= ?`);
    }

    if (filters?.status && filters.status.length > 0) {
      const statusPlaceholders = filters.status
        .map((_, i) => {
          params.push(filters.status![i]);
          return `?`;
        })
        .join(", ");
      whereClauses.push(`status IN (${statusPlaceholders})`);
    }

    if (whereClauses.length > 0) {
      queryStr += ` WHERE ` + whereClauses.join(" AND ");
    }

    const rows = await this.query(queryStr, params);
    return rows.map((r: any) => {
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
        important: r.important === 1,
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
    if (actions.length === 0) return;

    const execute = async (adapterToUse: any) => {
      for (const action of actions) {
        await adapterToUse.query(
          `INSERT OR REPLACE INTO actions (
            id, title, note, intention, important, energy, duration, 
            scheduled_date, start_time, end_time, timezone, status, created_at, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            action.id,
            action.title,
            action.note,
            action.intention,
            action.important ? 1 : 0,
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
      }
    };

    if (transactionDepth > 0) {
      await execute(this);
    } else {
      await this.transaction(async (tx) => {
        await execute(tx);
      });
    }
  },

  async getSetting<T>(key: string): Promise<T | null> {
    const rows = await this.query("SELECT value FROM settings WHERE key = ?", [key]);
    if (rows.length === 0) return null;
    const value = (rows[0] as { value: unknown }).value;
    if (typeof value !== "string") return value as T;
    try {
      return JSON.parse(value);
    } catch {
      return value as unknown as T;
    }
  },

  async upsertSetting(key: string, value: unknown): Promise<void> {
    await this.query("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [
      key,
      JSON.stringify(value),
    ]);
  },

  async clearSettings(): Promise<void> {
    await this.query("DELETE FROM settings");
  },

  async saveSettingsBatch(settings: [string, unknown][]): Promise<void> {
    if (settings.length === 0) return;

    const execute = async (adapterToUse: any) => {
      for (const [key, value] of settings) {
        await adapterToUse.query("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [
          key,
          JSON.stringify(value),
        ]);
      }
    };

    if (transactionDepth > 0) {
      await execute(this);
    } else {
      await this.transaction(async (tx) => {
        await execute(tx);
      });
    }
  },

  async getLocalWatermarks(): Promise<Record<string, number>> {
    const rows = await this.query(
      `SELECT origin_device_id, MAX(sequence_number) as max_seq 
       FROM events 
       WHERE origin_device_id IS NOT NULL 
       GROUP BY origin_device_id`
    );

    const watermarks: Record<string, number> = {};
    for (const row of rows) {
      const r = row as Record<string, unknown>;
      watermarks[r.origin_device_id as string] = Number(r.max_seq || 0);
    }
    return watermarks;
  },

  async getEventsSince(watermarks: Record<string, number>): Promise<Event[]> {
    const devicesResult = await this.query(
      "SELECT DISTINCT origin_device_id FROM events WHERE origin_device_id IS NOT NULL"
    );

    if (devicesResult.length === 0) return [];

    const clauses: string[] = [];
    const params: unknown[] = [];

    for (const row of devicesResult) {
      const r = row as Record<string, unknown>;
      const deviceId = r.origin_device_id as string;
      const peerSeq = watermarks[deviceId] || 0;

      clauses.push(`(origin_device_id = ? AND sequence_number > ?)`);
      params.push(deviceId, peerSeq);
    }

    const queryStr = `
      SELECT event_id, id, type, timestamp, payload, origin_device_id, sequence_number 
      FROM events 
      WHERE ${clauses.join(" OR ")}
      ORDER BY timestamp ASC
    `;

    const rows = await this.query(queryStr, params);
    return rows.map((r: any) => {
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

  async transaction<T>(callback: (txAdapter: DatabaseAdapter) => Promise<T>): Promise<T> {
    const release = await acquireLock();
    try {
      const isOutermost = transactionDepth === 0;
      if (isOutermost) {
        await this.queryDirect("BEGIN TRANSACTION");
      }
      transactionDepth++;

      const txAdapter = new Proxy(this, {
        get(target, prop, receiver) {
          if (prop === "query") {
            return (sql: string, params?: any[]) => target.queryDirect(sql, params);
          }
          if (prop === "transaction") {
            return (cb: any) => cb(txAdapter);
          }
          return Reflect.get(target, prop, receiver);
        },
      }) as any as DatabaseAdapter;

      try {
        const result = await callback(txAdapter);
        transactionDepth--;
        if (isOutermost && transactionDepth === 0) {
          await this.queryDirect("COMMIT");
        }
        return result;
      } catch (error) {
        transactionDepth--;
        if (isOutermost && transactionDepth === 0) {
          await this.queryDirect("ROLLBACK");
        }
        throw error;
      }
    } finally {
      release();
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

export interface BenchmarkResult {
  writeTimeMs: number;
  batchWriteTimeMs: number;
  readTimeMs: number;
}

export async function runDbBenchmark(): Promise<BenchmarkResult> {
  const adapter = webDatabaseAdapter;

  // Create benchmark table
  await adapter.query(`CREATE TABLE IF NOT EXISTS benchmark_test (id TEXT PRIMARY KEY, val TEXT)`);
  await adapter.query(`DELETE FROM benchmark_test`);

  // 1. Measure individual write time (10 writes)
  const t0 = performance.now();
  for (let i = 0; i < 10; i++) {
    await adapter.query(`INSERT INTO benchmark_test (id, val) VALUES (?, ?)`, [
      `single-${i}`,
      `val-${i}`,
    ]);
  }
  const t1 = performance.now();
  const writeTimeMs = (t1 - t0) / 10; // average per write

  // 2. Measure batch write time (100 writes in a single transaction)
  const t2 = performance.now();
  await adapter.transaction(async (tx) => {
    const rawTx = tx as any;
    for (let i = 0; i < 100; i++) {
      await rawTx.query(`INSERT INTO benchmark_test (id, val) VALUES (?, ?)`, [
        `batch-${i}`,
        `val-${i}`,
      ]);
    }
  });
  const t3 = performance.now();
  const batchWriteTimeMs = t3 - t2; // total for 100 writes

  // 3. Measure read time (select all 110 rows)
  const t4 = performance.now();
  await adapter.query(`SELECT * FROM benchmark_test`);
  const t5 = performance.now();
  const readTimeMs = t5 - t4;

  // Clean up
  await adapter.query(`DROP TABLE benchmark_test`);

  return {
    writeTimeMs,
    batchWriteTimeMs,
    readTimeMs,
  };
}
