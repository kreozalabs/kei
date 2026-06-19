import type { Event } from "../types/events";
import type { Action, ActionPayload, ActionStatus } from "../types/actions";
import {
  EVENT_TYPES,
  ENERGY_LEVELS,
  INTENTIONS,
  ACTION_STATUS,
  DEFAULT_CONFIG,
} from "../constants";
import { getTodayString } from "../utils/time";

/**
 * Reconstructs or updates an Action state based on an event.
 */
export function applyEventToAction(action: Action | null, event: Event<ActionPayload>): Action | null {
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
