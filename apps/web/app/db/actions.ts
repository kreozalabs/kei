import { db } from "./index";
import { v7 as uuidv7 } from "uuid";
import type { Event } from "../types/events";
import type { Action, ActionPayload, ActionStatus } from "../types/actions";
import {
  EVENT_TYPES,
  ENERGY_LEVELS,
  INTENTIONS,
  ACTION_STATUS,
  DEFAULT_CONFIG,
} from "../config/constants";
import { persistEvent } from "./events";
import { getTodayString } from "../utils/time";

const channel = typeof window !== "undefined" ? new BroadcastChannel("kei_db_sync") : null;

/**
 * Reconstructs or updates an Action state based on an event.
 */
function applyEventToAction(action: Action | null, event: Event<any>): Action {
  const { type, payload, timestamp, id: actionId } = event;

  if (type === EVENT_TYPES.ACTION_INTENDED) {
    return {
      id: actionId,
      title: payload.title || DEFAULT_CONFIG.TITLE,
      note: payload.note,
      intention: payload.intention || INTENTIONS.WANT,
      important: payload.important || false,
      energy: payload.energy || ENERGY_LEVELS.MEDIUM,
      duration: payload.duration,
      scheduledDate: payload.scheduledDate || getTodayString(),
      startTime: payload.startTime,
      endTime: payload.endTime,
      timezone: payload.timezone,
      status: ACTION_STATUS.ACTIVE,
      createdAt: timestamp,
      sortOrder: payload.sortOrder ?? timestamp,
    };
  }

  if (!action) {
    throw new Error(`Cannot apply event ${type} to non-existent action ${actionId}`);
  }

  switch (type) {
    case EVENT_TYPES.ACTION_UPDATED:
      return { ...action, ...payload };
    case EVENT_TYPES.ACTION_COMPLETED:
      return { ...action, status: ACTION_STATUS.COMPLETED as ActionStatus };
    case EVENT_TYPES.ACTION_ACTIVATED:
      return { ...action, status: ACTION_STATUS.ACTIVE as ActionStatus };
    case EVENT_TYPES.ACTION_ABANDONED:
      return { ...action, status: ACTION_STATUS.ABANDONED as ActionStatus };
    default:
      return action;
  }
}

/**
 * Persists an event and updates the corresponding action snapshot.
 */
async function pushEvent<T>(actionId: string, type: string, payload: T) {
  // 1. Store the event using the central persistence
  const event = await persistEvent(actionId, type, payload);

  // 2. Update the snapshot
  // We fetch existing snapshot if it's an update, or start fresh if it's a creation
  let currentAction: Action | null = null;
  if (type !== EVENT_TYPES.ACTION_INTENDED) {
    const result = await db.query("SELECT * FROM actions_snapshot WHERE id = $1", [actionId]);
    if (result.rows.length > 0) {
      const row = result.rows[0] as any;
      currentAction = {
        ...row,
        scheduledDate: row.scheduled_date,
        startTime: row.start_time,
        endTime: row.end_time,
        createdAt: Number(row.created_at),
        sortOrder: Number(row.sort_order),
        duration: typeof row.duration === "string" ? JSON.parse(row.duration) : row.duration,
      } as Action;
    }
  }

  const updatedAction = applyEventToAction(currentAction, event);

  await db.query(
    `INSERT INTO actions_snapshot (
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
      updatedAction.id,
      updatedAction.title,
      updatedAction.note,
      updatedAction.intention,
      updatedAction.important,
      updatedAction.energy,
      JSON.stringify(updatedAction.duration),
      updatedAction.scheduledDate,
      updatedAction.startTime,
      updatedAction.endTime,
      updatedAction.timezone,
      updatedAction.status,
      updatedAction.createdAt,
      updatedAction.sortOrder,
    ]
  );

  if (channel) {
    channel.postMessage({ type: "DB_UPDATED" });
  }

  return event;
}

export async function getActions(filters?: {
  startDate?: string;
  endDate?: string;
  status?: ActionStatus[];
}): Promise<Action[]> {
  let query = `SELECT * FROM actions_snapshot`;
  const params: any[] = [];
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

  query += ` ORDER BY sort_order DESC`;

  const result = await db.query(query, params);
  return result.rows.map((row: any) => ({
    ...row,
    scheduledDate: row.scheduled_date,
    startTime: row.start_time,
    endTime: row.end_time,
    createdAt: Number(row.created_at),
    sortOrder: Number(row.sort_order),
    duration: typeof row.duration === "string" ? JSON.parse(row.duration) : row.duration,
  })) as Action[];
}

export async function addAction(payload: ActionPayload) {
  const actionId = uuidv7();
  await pushEvent(actionId, EVENT_TYPES.ACTION_INTENDED, {
    ...payload,
    scheduledDate: payload.scheduledDate || getTodayString(),
    sortOrder: payload.sortOrder ?? Date.now(),
  });
  return actionId;
}

export async function updateAction(id: string, payload: Partial<ActionPayload>) {
  await pushEvent(id, EVENT_TYPES.ACTION_UPDATED, payload);
}

export async function completeAction(id: string) {
  await pushEvent(id, EVENT_TYPES.ACTION_COMPLETED, {});
}

export async function activateAction(id: string) {
  await pushEvent(id, EVENT_TYPES.ACTION_ACTIVATED, {});
}

export async function abandonAction(id: string) {
  await pushEvent(id, EVENT_TYPES.ACTION_ABANDONED, {});
}

/**
 * Rebuilds the entire actions_snapshot table from the events log.
 * Useful for migrations or when the derivation logic changes.
 */
export async function rebuildSnapshots() {
  const result = await db.query(`SELECT * FROM events ORDER BY timestamp ASC`);
  const events = result.rows as Event<any>[];

  const actionsMap = new Map<string, Action>();

  for (const event of events) {
    const actionId = event.id;
    const existing = actionsMap.get(actionId) || null;
    try {
      const updated = applyEventToAction(existing, event);
      actionsMap.set(actionId, updated);
    } catch (e) {
      console.warn(`Skipping event during rebuild: ${e}`);
    }
  }

  await db.query("DELETE FROM actions_snapshot");

  for (const action of actionsMap.values()) {
    await db.query(
      `INSERT INTO actions_snapshot (
        id, title, note, intention, important, energy, duration, 
        scheduled_date, start_time, end_time, timezone, status, created_at, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
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
  }
}
// TODO: Add function that will allow to create configs for actions, so user can set 4 hours or something like that, instead of just using defaults or recents or writing custom duration every time.

// TODO: Create table for recent configs, or use settings table instead. It should help to avoid unnecessary reads from events table.
export async function getRecentConfigs(): Promise<ActionPayload[]> {
  const result = await db.query(
    `SELECT payload FROM events WHERE type = '${EVENT_TYPES.ACTION_INTENDED}' ORDER BY timestamp DESC LIMIT 30`
  );
  const payloads = (result.rows as { payload: string | object }[]).map((r) =>
    typeof r.payload === "string" ? JSON.parse(r.payload) : r.payload
  ) as ActionPayload[];

  const configs: ActionPayload[] = [];
  const seen = new Set<string>();

  for (const payload of payloads) {
    const configKey = JSON.stringify({
      intention: payload.intention || INTENTIONS.WANT,
      energy: payload.energy || ENERGY_LEVELS.MEDIUM,
      duration: payload.duration,
      important: payload.important || false,
    });

    if (!seen.has(configKey)) {
      seen.add(configKey);
      configs.push({
        intention: payload.intention || INTENTIONS.WANT,
        energy: payload.energy || ENERGY_LEVELS.MEDIUM,
        duration: payload.duration,
        important: payload.important || false,
      });
    }
    if (configs.length >= 4) break;
  }

  return configs;
}

export async function getLastKnownTime(
  id: string
): Promise<{ startTime: string; endTime?: string | null } | null> {
  const result = await db.query(
    `SELECT payload FROM events WHERE id = $1 AND (type = '${EVENT_TYPES.ACTION_INTENDED}' OR type = '${EVENT_TYPES.ACTION_UPDATED}') ORDER BY timestamp DESC`,
    [id]
  );

  for (const row of result.rows as { payload: string | object }[]) {
    const payload = (
      typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload
    ) as Partial<ActionPayload>;
    // Check if this payload has startTime defined and not null/empty string
    if (payload.startTime) {
      return {
        startTime: payload.startTime,
        endTime: payload.endTime,
      };
    }
  }
  return null;
}
