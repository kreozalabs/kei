import { useQuery } from "@tanstack/react-query";
import { db } from "../db";
import type { Action, Event, ActionPayload } from "../types/events";

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

export function useCurrentDay() {
  // 1. Fetch settings (max_daily_actions)
  const { data: settings } = useQuery({
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

  const maxActions = parseInt(settings?.max_daily_actions || "6", 10);

  // 2. Fetch today's events
  const { data: events, isLoading } = useQuery<Event<unknown>[]>({
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
      case "ACTION_INTENDED": {
        const payload = event.payload as ActionPayload;
        actionsMap.set(event.id, {
          id: event.id,
          title: payload.title,
          priority: payload.priority || "medium",
          energy: payload.energy || "medium",
          duration: payload.duration,
          status: "active",
          createdAt: event.timestamp,
        });
        break;
      }
      case "ACTION_COMPLETED": {
        const payload = event.payload as { id: string };
        const actionToComplete = actionsMap.get(payload.id);
        if (actionToComplete) {
          actionToComplete.status = "completed";
        }
        break;
      }
      case "ACTION_ABANDONED": {
        const payload = event.payload as { id: string };
        const actionToAbandon = actionsMap.get(payload.id);
        if (actionToAbandon) {
          actionToAbandon.status = "abandoned";
        }
        break;
      }
    }
  });

  actionsMap.forEach((action) => {
    if (action.status === "active") {
      activeActions.push(action);
    } else if (action.status === "completed") {
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
