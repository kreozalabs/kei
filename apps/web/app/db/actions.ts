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
function applyEventToAction(action: Action | null, event: Event<ActionPayload>): Action {
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
async function pushEvent(actionId: string, type: string, payload: ActionPayload) {
  // 1. Store the event using the central persistence
  const event = await persistEvent(actionId, type, payload);

  // 2. Update the snapshot
  // We fetch existing snapshot if it's an update, or start fresh if it's a creation
  let currentAction: Action | null = null;
  if (type !== EVENT_TYPES.ACTION_INTENDED) {
    const result = await db.query("SELECT * FROM actions WHERE id = $1", [actionId]);
    if (result.rows.length > 0) {
      const row = result.rows[0] as unknown as Action & {
        scheduled_date: string;
        start_time: string | null;
        end_time: string | null;
        created_at: string | number;
        sort_order: string | number;
      };
      const parseDuration = (val: unknown) => {
        if (typeof val !== "string") return val;
        try {
          return JSON.parse(val);
        } catch {
          return null;
        }
      };
      currentAction = {
        ...row,
        scheduledDate: row.scheduled_date,
        startTime: row.start_time,
        endTime: row.end_time,
        createdAt: Number(row.created_at),
        sortOrder: Number(row.sort_order),
        duration: parseDuration(row.duration),
      } as Action;
    }
  }

  const updatedAction = applyEventToAction(currentAction, event);

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
    channel.postMessage({ type: "DB_UPDATED", entity: "actions" });
  }

  return event;
}

export async function getActions(filters?: {
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
 * Rebuilds the entire actions table from the events log.
 * Useful for migrations or when the derivation logic changes.
 */
export async function rebuildActions() {
  const result = await db.query(
    `SELECT * FROM events WHERE type LIKE 'ACTION_%' ORDER BY timestamp ASC`
  );
  const events = result.rows as Event<ActionPayload>[];

  const actionsMap = new Map<string, Action>();

  for (const event of events) {
    const actionId = event.id;
    const existing = actionsMap.get(actionId) || null;
    try {
      const updated = applyEventToAction(existing, event);
      if (updated) {
        actionsMap.set(actionId, updated);
      }
    } catch (e) {
      console.warn(`Skipping event during rebuild: ${e}`);
    }
  }

  await db.query("DELETE FROM actions");

  for (const action of actionsMap.values()) {
    if (!action) continue;

    await db.query(
      `INSERT INTO actions (
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
