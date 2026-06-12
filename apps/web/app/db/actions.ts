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
import { broadcastDbUpdate } from "../utils/broadcast";

declare global {
  interface Window {
    __activeWrites?: number;
  }
}

/**
 * Reconstructs or updates an Action state based on an event.
 */
function applyEventToAction(action: Action | null, event: Event<ActionPayload>): Action | null {
  const { type, payload, timestamp, id: actionId } = event;

  if (type === EVENT_TYPES.ACTION_DELETED) {
    return null;
  }

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
      sortOrder: payload.sortOrder ?? -timestamp,
    };
  }

  if (!action) {
    throw new Error(`Cannot apply event ${type} to non-existent action ${actionId}`);
  }

  switch (type) {
    case EVENT_TYPES.ACTION_UPDATED: {
      const hasScheduledDateChanged =
        payload.scheduledDate !== undefined && payload.scheduledDate !== action.scheduledDate;

      const nextSortOrder =
        payload.sortOrder !== undefined
          ? payload.sortOrder
          : hasScheduledDateChanged
            ? -timestamp
            : action.sortOrder;

      return {
        ...action,
        ...payload,
        sortOrder: nextSortOrder,
      };
    }
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
  if (typeof window !== "undefined") {
    window.__activeWrites = (window.__activeWrites || 0) + 1;
    window.dispatchEvent(new CustomEvent("kei_active_writes_change"));
  }
  try {
    await db.query("BEGIN");
    try {
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

      if (!updatedAction) {
        await db.query("DELETE FROM actions WHERE id = $1", [actionId]);
        await db.query("COMMIT");
        broadcastDbUpdate("actions");
        return event;
      }

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

      await db.query("COMMIT");

      broadcastDbUpdate("actions");

      return event;
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } finally {
    if (typeof window !== "undefined") {
      window.__activeWrites = Math.max(0, (window.__activeWrites || 0) - 1);
      window.dispatchEvent(new CustomEvent("kei_active_writes_change"));
    }
  }
}

async function bulkPushEvents(updates: { id: string; type: string; payload: ActionPayload }[]) {
  if (typeof window !== "undefined") {
    window.__activeWrites = (window.__activeWrites || 0) + 1;
    window.dispatchEvent(new CustomEvent("kei_active_writes_change"));
  }
  try {
    await db.query("BEGIN");
    try {
      for (const { id, type, payload } of updates) {
        // 1. Store the event using the central persistence
        const event = await persistEvent(id, type, payload);

        // 2. Update the snapshot
        let currentAction: Action | null = null;
        if (type !== EVENT_TYPES.ACTION_INTENDED) {
          const result = await db.query("SELECT * FROM actions WHERE id = $1", [id]);
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

        if (!updatedAction) {
          await db.query("DELETE FROM actions WHERE id = $1", [id]);
        } else {
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
        }
      }
      await db.query("COMMIT");
      broadcastDbUpdate("actions");
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } finally {
    if (typeof window !== "undefined") {
      window.__activeWrites = Math.max(0, (window.__activeWrites || 0) - 1);
      window.dispatchEvent(new CustomEvent("kei_active_writes_change"));
    }
  }
}

export async function bulkCompleteActions(ids: string[]) {
  await bulkPushEvents(ids.map((id) => ({ id, type: EVENT_TYPES.ACTION_COMPLETED, payload: {} })));
}

export async function bulkActivateActions(ids: string[]) {
  await bulkPushEvents(ids.map((id) => ({ id, type: EVENT_TYPES.ACTION_ACTIVATED, payload: {} })));
}

export async function bulkAbandonActions(ids: string[]) {
  await bulkPushEvents(ids.map((id) => ({ id, type: EVENT_TYPES.ACTION_ABANDONED, payload: {} })));
}

export async function bulkUpdateActions(ids: string[], payload: Partial<ActionPayload>) {
  await bulkPushEvents(ids.map((id) => ({ id, type: EVENT_TYPES.ACTION_UPDATED, payload })));
}

export async function bulkStatusUpdateActions(updates: { id: string; status: ActionStatus }[]) {
  const mapped = updates.map(({ id, status }) => {
    let type: string = EVENT_TYPES.ACTION_ACTIVATED;
    if (status === ACTION_STATUS.COMPLETED) {
      type = EVENT_TYPES.ACTION_COMPLETED;
    } else if (status === ACTION_STATUS.ABANDONED) {
      type = EVENT_TYPES.ACTION_ABANDONED;
    }
    return { id, type, payload: {} };
  });
  await bulkPushEvents(mapped);
}

export async function bulkUpdateMultipleActions(
  updates: { id: string; payload: Partial<ActionPayload> }[]
) {
  const processedUpdates = updates.map(({ id, payload }) => {
    return { id, type: EVENT_TYPES.ACTION_UPDATED, payload };
  });
  await bulkPushEvents(processedUpdates);
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
  let finalSortOrder = payload.sortOrder;
  if (finalSortOrder === undefined) {
    if (payload.insertAtTop) {
      const scheduledDate = payload.scheduledDate || getTodayString();
      const result = await db.query(
        "SELECT MAX(sort_order) as max_order FROM actions WHERE scheduled_date = $1 AND status = 'active'",
        [scheduledDate]
      );
      const maxOrder = (result.rows[0] as Record<string, unknown> | undefined)?.max_order;
      finalSortOrder =
        maxOrder !== null && maxOrder !== undefined ? Number(maxOrder) + 1 : -Date.now();
    } else {
      finalSortOrder = -Date.now();
    }
  }

  const cleanPayload = { ...payload };
  delete cleanPayload.insertAtTop;

  await pushEvent(actionId, EVENT_TYPES.ACTION_INTENDED, {
    ...cleanPayload,
    scheduledDate: payload.scheduledDate || getTodayString(),
    sortOrder: finalSortOrder,
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

export async function deleteActionPermanently(id: string) {
  await pushEvent(id, EVENT_TYPES.ACTION_DELETED, {});
}

export async function restoreAction(action: Action) {
  await pushEvent(action.id, EVENT_TYPES.ACTION_INTENDED, {
    title: action.title,
    note: action.note,
    intention: action.intention,
    important: action.important,
    energy: action.energy,
    duration: action.duration as [number, number],
    scheduledDate: action.scheduledDate,
    startTime: action.startTime || undefined,
    endTime: action.endTime || undefined,
    timezone: action.timezone,
    sortOrder: action.sortOrder,
  });
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
      } else {
        actionsMap.delete(actionId);
      }
    } catch (e) {
      console.warn(`Skipping event during rebuild: ${e}`);
    }
  }

  await db.query("BEGIN");
  try {
    await db.query("DELETE FROM actions");

    const actions = Array.from(actionsMap.values()).filter(Boolean);
    if (actions.length > 0) {
      const chunkSize = 50;
      for (let i = 0; i < actions.length; i += chunkSize) {
        const chunk = actions.slice(i, i + chunkSize);
        const valueStrings: string[] = [];
        const values: unknown[] = [];
        let paramIdx = 1;

        for (const action of chunk) {
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
      }
    }
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}

export async function applyEventsToActionsProjection(actionIds: string[]) {
  if (actionIds.length === 0) return;

  const uniqueIds = Array.from(new Set(actionIds));
  const chunkSize = 50;

  const toUpsert: Action[] = [];
  const toDelete: string[] = [];

  for (let i = 0; i < uniqueIds.length; i += chunkSize) {
    const chunk = uniqueIds.slice(i, i + chunkSize);
    const placeholders = chunk.map((_, idx) => `$${idx + 1}`).join(", ");

    // Fetch all events for these action IDs ordered by timestamp
    const result = await db.query(
      `SELECT * FROM events WHERE id IN (${placeholders}) ORDER BY timestamp ASC`,
      chunk
    );
    const events = result.rows as Event<ActionPayload>[];

    // Group events by action ID
    const eventsByAction = new Map<string, Event<ActionPayload>[]>();
    for (const event of events) {
      const list = eventsByAction.get(event.id) || [];
      list.push(event);
      eventsByAction.set(event.id, list);
    }

    // Compute final snapshot for each action ID in the chunk
    for (const actionId of chunk) {
      const actionEvents = eventsByAction.get(actionId) || [];
      let currentAction: Action | null = null;
      for (const event of actionEvents) {
        try {
          currentAction = applyEventToAction(currentAction, event);
        } catch (e) {
          console.warn(`Skipping event for action ${actionId}: ${e}`);
        }
      }
      if (currentAction) {
        toUpsert.push(currentAction);
      } else {
        toDelete.push(actionId);
      }
    }
  }

  // Apply changes in a transaction
  await db.query("BEGIN");
  try {
    // 1. Delete removed actions
    if (toDelete.length > 0) {
      for (let i = 0; i < toDelete.length; i += chunkSize) {
        const chunk = toDelete.slice(i, i + chunkSize);
        const placeholders = chunk.map((_, idx) => `$${idx + 1}`).join(", ");
        await db.query(`DELETE FROM actions WHERE id IN (${placeholders})`, chunk);
      }
    }

    // 2. Upsert updated actions
    if (toUpsert.length > 0) {
      for (const action of toUpsert) {
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
      }
    }
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}
