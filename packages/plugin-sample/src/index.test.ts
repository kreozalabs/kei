import { describe, expect, it, vi } from "vitest";
import { HabitStreakPlugin } from "./index";
import type { Event, KeiPluginContext } from "./types";

describe("HabitStreakPlugin", () => {
  it("subscribes to ACTION_COMPLETED and emits HABIT_STREAK_INCREMENTED", async () => {
    let actionCompletedHandler: ((event: Event<unknown>) => void) | null = null;
    const storageMap = new Map<string, unknown>();
    const emittedEvents: Array<{ type: string; id: string; payload: unknown }> = [];
    const registeredWidgets = new Map<string, () => { title: string; content: string }>();

    const mockContext: KeiPluginContext = {
      manifest: {
        id: "test",
        name: "Test Plugin",
        version: "1.0.0",
        description: "",
        author: "",
        permissions: ["events:subscribe", "events:emit", "storage:local", "ui:widget"],
        slots: []
      },
      events: {
        subscribe: (type, handler) => {
          if (type === "ACTION_COMPLETED") {
            actionCompletedHandler = handler as (event: Event<unknown>) => void;
          }
          return () => {
            actionCompletedHandler = null;
          };
        },
        emit: async (type, id, payload) => {
          emittedEvents.push({ type: type as string, id, payload });
          return {
            eventId: "evt-123",
            id,
            type: type as any,
            timestamp: Date.now(),
            payload
          };
        }
      },
      storage: {
        get: async <T>(key: string) => (storageMap.get(key) as T) ?? null,
        set: async (key, val) => {
          storageMap.set(key, val);
        }
      },
      ui: {
        registerWidget: (slotId, render) => {
          registeredWidgets.set(slotId, render);
        }
      }
    };

    const plugin = new HabitStreakPlugin();
    await plugin.activate(mockContext);

    // Verify subscription and widget registration
    expect(actionCompletedHandler).not.toBeNull();
    expect(registeredWidgets.has("habit-streak-card")).toBe(true);

    // Simulate completion event
    const mockCompletedEvent: Event<{ actionId: string }> = {
      eventId: "evt-1",
      id: "act-42",
      type: "ACTION_COMPLETED",
      timestamp: Date.now(),
      payload: { actionId: "act-42" }
    };

    await actionCompletedHandler!(mockCompletedEvent);

    // Check storage update and emitted custom event
    const updatedStreak = storageMap.get("streak_state") as { currentStreak: number };
    expect(updatedStreak.currentStreak).toBe(1);
    expect(emittedEvents).toHaveLength(1);
    expect(emittedEvents[0].type).toBe("HABIT_STREAK_INCREMENTED");
    expect(emittedEvents[0].payload).toEqual({
      streak: 1,
      completedActionId: "act-42"
    });

    await plugin.deactivate();
  });
});
