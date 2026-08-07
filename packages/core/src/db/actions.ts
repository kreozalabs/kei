import { v7 as uuidv7 } from "uuid";
import type { Action, ActionPayload, ActionStatus } from "../types/actions";
import type { Event } from "../types/events";
import { EVENT_TYPES, ACTION_STATUS } from "../constants";
import { getTodayString } from "../utils/time";
import { applyEventToAction } from "../logic/actions";
import { persistEvent } from "./events";
import type { DatabaseAdapter } from "./adapter";

/**
 * Persists an event and updates the corresponding action snapshot.
 */
export async function pushEvent(
  actionId: string,
  type: string,
  payload: ActionPayload,
  deviceId: string,
  adapter: DatabaseAdapter
) {
  adapter.incrementActiveWrites();
  try {
    return await adapter.transaction(async (txAdapter) => {
      // 1. Store the event using the central persistence
      const event = await persistEvent(actionId, type, payload, deviceId, txAdapter);

      // 2. Fetch existing snapshot if it's an update, or start fresh if it's a creation
      let currentAction: Action | null = null;
      if (type !== EVENT_TYPES.ACTION_INTENDED) {
        currentAction = await txAdapter.getAction(actionId);
      }

      // 3. Update the snapshot
      const updatedAction = applyEventToAction(currentAction, event);

      // 4. Save or delete the updated snapshot
      if (!updatedAction) {
        await txAdapter.deleteAction(actionId);
      } else {
        await txAdapter.upsertAction(updatedAction);
      }

      adapter.notifyUpdate("actions");
      return event;
    });
  } finally {
    adapter.decrementActiveWrites();
  }
}

export async function bulkPushEvents(
  updates: { id: string; type: string; payload: ActionPayload }[],
  deviceId: string,
  adapter: DatabaseAdapter
) {
  adapter.incrementActiveWrites();
  try {
    return await adapter.transaction(async (txAdapter) => {
      for (const { id, type, payload } of updates) {
        // 1. Store the event
        const event = await persistEvent(id, type, payload, deviceId, txAdapter);

        // 2. Fetch existing snapshot
        let currentAction: Action | null = null;
        if (type !== EVENT_TYPES.ACTION_INTENDED) {
          currentAction = await txAdapter.getAction(id);
        }

        // 3. Apply event
        const updatedAction = applyEventToAction(currentAction, event);

        // 4. Save or delete
        if (!updatedAction) {
          await txAdapter.deleteAction(id);
        } else {
          await txAdapter.upsertAction(updatedAction);
        }
      }
      adapter.notifyUpdate("actions");
    });
  } finally {
    adapter.decrementActiveWrites();
  }
}

export async function bulkCompleteActions(
  ids: string[],
  deviceId: string,
  adapter: DatabaseAdapter
) {
  await bulkPushEvents(
    ids.map((id) => ({ id, type: EVENT_TYPES.ACTION_COMPLETED, payload: {} })),
    deviceId,
    adapter
  );
}

export async function bulkActivateActions(
  ids: string[],
  deviceId: string,
  adapter: DatabaseAdapter
) {
  await bulkPushEvents(
    ids.map((id) => ({ id, type: EVENT_TYPES.ACTION_ACTIVATED, payload: {} })),
    deviceId,
    adapter
  );
}

export async function bulkAbandonActions(
  ids: string[],
  deviceId: string,
  adapter: DatabaseAdapter
) {
  await bulkPushEvents(
    ids.map((id) => ({ id, type: EVENT_TYPES.ACTION_ABANDONED, payload: {} })),
    deviceId,
    adapter
  );
}

export async function bulkUpdateActions(
  ids: string[],
  payload: Partial<ActionPayload>,
  deviceId: string,
  adapter: DatabaseAdapter
) {
  await bulkPushEvents(
    ids.map((id) => ({ id, type: EVENT_TYPES.ACTION_UPDATED, payload })),
    deviceId,
    adapter
  );
}

export async function bulkStatusUpdateActions(
  updates: { id: string; status: ActionStatus }[],
  deviceId: string,
  adapter: DatabaseAdapter
) {
  const mapped = updates.map(({ id, status }) => {
    let type: string = EVENT_TYPES.ACTION_ACTIVATED;
    if (status === ACTION_STATUS.COMPLETED) {
      type = EVENT_TYPES.ACTION_COMPLETED;
    } else if (status === ACTION_STATUS.ABANDONED) {
      type = EVENT_TYPES.ACTION_ABANDONED;
    }
    return { id, type, payload: {} };
  });
  await bulkPushEvents(mapped, deviceId, adapter);
}

export async function bulkUpdateMultipleActions(
  updates: { id: string; payload: Partial<ActionPayload> }[],
  deviceId: string,
  adapter: DatabaseAdapter
) {
  const processedUpdates = updates.map(({ id, payload }) => {
    return { id, type: EVENT_TYPES.ACTION_UPDATED, payload };
  });
  await bulkPushEvents(processedUpdates, deviceId, adapter);
}

export async function getActions(
  adapter: DatabaseAdapter,
  filters?: {
    startDate?: string;
    endDate?: string;
    status?: ActionStatus[];
  }
): Promise<Action[]> {
  return await adapter.getActions(filters);
}

export async function addAction(
  payload: ActionPayload,
  deviceId: string,
  adapter: DatabaseAdapter
) {
  const actionId = uuidv7();
  let finalSortOrder = payload.sortOrder;

  if (finalSortOrder === undefined) {
    if (payload.insertAtTop) {
      const scheduledDate = payload.scheduledDate || getTodayString();
      const maxOrder = await adapter.getMaxSortOrder(scheduledDate);
      finalSortOrder = maxOrder !== null && maxOrder !== undefined ? maxOrder + 1 : -Date.now();
    } else {
      finalSortOrder = -Date.now();
    }
  }

  const cleanPayload = { ...payload };
  delete cleanPayload.insertAtTop;

  await pushEvent(
    actionId,
    EVENT_TYPES.ACTION_INTENDED,
    {
      ...cleanPayload,
      scheduledDate: payload.scheduledDate || getTodayString(),
      sortOrder: finalSortOrder,
    },
    deviceId,
    adapter
  );

  return actionId;
}

export async function updateAction(
  id: string,
  payload: Partial<ActionPayload>,
  deviceId: string,
  adapter: DatabaseAdapter
) {
  await pushEvent(id, EVENT_TYPES.ACTION_UPDATED, payload, deviceId, adapter);
}

export async function completeAction(id: string, deviceId: string, adapter: DatabaseAdapter) {
  await pushEvent(id, EVENT_TYPES.ACTION_COMPLETED, {}, deviceId, adapter);
}

export async function activateAction(id: string, deviceId: string, adapter: DatabaseAdapter) {
  await pushEvent(id, EVENT_TYPES.ACTION_ACTIVATED, {}, deviceId, adapter);
}

export async function abandonAction(id: string, deviceId: string, adapter: DatabaseAdapter) {
  await pushEvent(id, EVENT_TYPES.ACTION_ABANDONED, {}, deviceId, adapter);
}

export async function deleteActionPermanently(
  id: string,
  deviceId: string,
  adapter: DatabaseAdapter
) {
  await pushEvent(id, EVENT_TYPES.ACTION_DELETED, {}, deviceId, adapter);
}

export async function restoreAction(action: Action, deviceId: string, adapter: DatabaseAdapter) {
  await pushEvent(
    action.id,
    EVENT_TYPES.ACTION_INTENDED,
    {
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
    },
    deviceId,
    adapter
  );
}

/**
 * Rebuilds the entire actions table from the events log.
 * Useful for migrations or when the derivation logic changes.
 */
export async function rebuildActions(adapter: DatabaseAdapter) {
  const events = await adapter.getEvents();
  const actionEvents = events.filter((e) => e.type.startsWith("ACTION_"));

  const actionsMap = new Map<string, Action>();

  for (const event of actionEvents) {
    const actionId = event.id;
    const existing = actionsMap.get(actionId) || null;
    try {
      const updated = applyEventToAction(existing, event as Event<ActionPayload>);
      if (updated) {
        actionsMap.set(actionId, updated);
      } else {
        actionsMap.delete(actionId);
      }
    } catch (e) {
      console.warn(`Skipping event during rebuild: ${e}`);
    }
  }

  await adapter.transaction(async (txAdapter) => {
    await txAdapter.clearActions();

    const actions = Array.from(actionsMap.values()).filter(Boolean);
    if (actions.length > 0) {
      await txAdapter.saveActionsBatch(actions);
    }
  });
}
