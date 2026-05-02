import { useQuery } from "@tanstack/react-query";
import { db } from "../db";
import type { Action, Event, ActionPayload } from "../types/events";
import {
  ACTION_STATUS,
  DEFAULT_CONFIG,
  ENERGY_LEVELS,
  EVENT_TYPES,
  INTENTIONS,
} from "@/config/constants";
import type { IntentionType, EnergyType } from "../types/events";

export interface CurrentDayState {
  activeActions: Action[];
  completedActions: Action[];
  isInRedZone: boolean;
  maxActions: number;
}

interface SettingRow {
  key: string;
  value: string;
}

// TODO: WHAT IS THE POINT OF THIS FUNCTION?
export function useCurrentDay() {
  // 1. Fetch settings (max_daily_actions)
  const { data: settings } = useQuery({
    // TODO: Call the function from db/actions.ts
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await db.query<SettingRow>("SELECT * FROM settings");
      const s: Record<string, string> = {};
      res.rows.forEach((row) => {
        s[row.key] = row.value;
      });
      return s;
    },
  });

  // FIXME: remove or keep this!
  const maxActions = parseInt(settings?.max_daily_actions || "5", 10);

  // 2. Fetch today's events
  const { data: events, isLoading } = useQuery<Event<unknown>[]>({
    // TODO: Call the function from db/actions.ts
    queryKey: ["events", "today"],
    queryFn: async () => {
      // Simple "today" filter: events from the start of the current day
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const timestamp = startOfDay.getTime();

      const res = await db.query<Event<unknown>>(
        "SELECT * FROM events WHERE timestamp >= $1 ORDER BY timestamp ASC",
        [timestamp]
      );
      return res.rows;
    },
  });

  // 3. Process events into View State
  const activeActions: Action[] = [];
  const completedActions: Action[] = [];

  const actionsMap = new Map<string, Action>();

  events?.forEach((event) => {
    switch (event.type) {
      case EVENT_TYPES.ACTION_INTENDED: {
        const payload = event.payload as ActionPayload;
        actionsMap.set(event.id, {
          id: event.id,
          title: payload.title || DEFAULT_CONFIG.TITLE,
          note: payload.note,
          intention: payload.intention || (INTENTIONS.WANT as IntentionType),
          important: payload.important || false,
          energy: payload.energy || (ENERGY_LEVELS.MEDIUM as EnergyType),
          duration: payload.duration,
          scheduledDate:
            payload.scheduledDate || new Date(event.timestamp).toLocaleDateString("en-CA"),
          startTime: payload.startTime,
          endTime: payload.endTime,
          status: ACTION_STATUS.ACTIVE,
          createdAt: event.timestamp,
          sortOrder: payload.sortOrder ?? event.timestamp,
        });
        break;
      }
      case EVENT_TYPES.ACTION_UPDATED: {
        const payload = event.payload as Partial<ActionPayload>;
        const existing = actionsMap.get(event.id);
        if (existing) {
          actionsMap.set(event.id, { ...existing, ...payload });
        }
        break;
      }
      case EVENT_TYPES.ACTION_COMPLETED: {
        const payload = event.payload as { id: string };
        const actionToComplete = actionsMap.get(payload.id || event.id);
        if (actionToComplete) {
          actionToComplete.status = ACTION_STATUS.COMPLETED;
        }
        break;
      }
      case EVENT_TYPES.ACTION_ACTIVATED: {
        const payload = event.payload as { id: string };
        const actionToActivate = actionsMap.get(payload.id || event.id);
        if (actionToActivate) {
          actionToActivate.status = ACTION_STATUS.ACTIVE;
        }
        break;
      }
      case EVENT_TYPES.ACTION_ABANDONED: {
        const payload = event.payload as { id: string };
        const actionToAbandon = actionsMap.get(payload.id || event.id);
        if (actionToAbandon) {
          actionToAbandon.status = ACTION_STATUS.ABANDONED;
        }
        break;
      }
    }
  });

  actionsMap.forEach((action) => {
    if (action.status === ACTION_STATUS.ACTIVE) {
      activeActions.push(action);
    } else if (action.status === ACTION_STATUS.COMPLETED) {
      completedActions.push(action);
    }
  });

  const isInRedZone = activeActions.length >= maxActions;

  return {
    activeActions,
    completedActions,
    isInRedZone,
    maxActions,
    isLoading,
  };
}
