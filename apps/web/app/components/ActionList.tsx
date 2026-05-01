import type { Action, ActionStatus } from "../types/events";
import { db } from "../db";
import { useQueryClient } from "@tanstack/react-query";
import { v7 as uuidv7 } from "uuid";
import { ActionItem } from "./ActionItem";
import { ACTION_STATUS, EVENT_TYPES } from "@/config/constants";

interface ActionListProps {
  actions: Action[];
  type: ActionStatus;
  onEdit: (action: Action) => void;
}

export function ActionList({ actions, type, onEdit }: ActionListProps) {
  const queryClient = useQueryClient();

  const handleComplete = async (action: Action) => {
    const now = Date.now();
    try {
      const event = {
        id: uuidv7(),
        type: EVENT_TYPES.ACTION_COMPLETED,
        timestamp: now,
        payload: { id: action.id },
      };
      await db.query("INSERT INTO events (id, type, timestamp, payload) VALUES ($1, $2, $3, $4)", [
        event.id,
        event.type,
        event.timestamp,
        JSON.stringify(event.payload),
      ]);
      queryClient.invalidateQueries({ queryKey: ["events", "today"] });
    } catch (error) {
      console.error("Failed to complete action:", error);
    }
  };

  const handleAbandon = async (action: Action) => {
    const now = Date.now();
    try {
      const event = {
        id: uuidv7(),
        type: EVENT_TYPES.ACTION_ABANDONED,
        timestamp: now,
        payload: { id: action.id },
      };
      await db.query("INSERT INTO events (id, type, timestamp, payload) VALUES ($1, $2, $3, $4)", [
        event.id,
        event.type,
        event.timestamp,
        JSON.stringify(event.payload),
      ]);
      queryClient.invalidateQueries({ queryKey: ["events", "today"] });
    } catch (error) {
      console.error("Failed to abandon action:", error);
    }
  };

  if (actions.length === 0) {
    return (
      <div className="text-center py-20 px-6 border-2 border-dashed rounded-4xl bg-muted/20 opacity-40">
        <p className="text-sm font-bold uppercase tracking-[0.2em] italic">
          {type === ACTION_STATUS.ACTIVE
            ? "No active initiatives. Calibrate your trajectory."
            : "Archive empty. No actions processed."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {actions.map((action) => (
        <ActionItem
          key={action.id}
          action={action}
          type={type}
          onComplete={handleComplete}
          onAbandon={handleAbandon}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
