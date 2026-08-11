import manifestRaw from "../plugin.json" with { type: "json" };
import type {
  KeiPlugin,
  KeiPluginContext,
  PluginManifest
} from "./types";

export * from "./types";

export interface HabitStreakState {
  currentStreak: number;
  lastCompletedDate: string; // YYYY-MM-DD
}

export class HabitStreakPlugin implements KeiPlugin {
  public manifest: PluginManifest = manifestRaw as PluginManifest;
  private unsubscribe: (() => void) | null = null;

  async activate(context: KeiPluginContext): Promise<void> {
    console.log(`[Plugin] Activating ${this.manifest.name} v${this.manifest.version}`);

    // 1. Subscribe to completed actions in the Kei Event Stream
    this.unsubscribe = context.events.subscribe(
      "ACTION_COMPLETED",
      async (event) => {
        const today = new Date().toISOString().split("T")[0];

        // Retrieve stored streak state
        const state = (await context.storage.get<HabitStreakState>("streak_state")) || {
          currentStreak: 0,
          lastCompletedDate: ""
        };

        if (state.lastCompletedDate !== today) {
          const newStreak = state.currentStreak + 1;
          const newState: HabitStreakState = {
            currentStreak: newStreak,
            lastCompletedDate: today
          };

          await context.storage.set("streak_state", newState);

          // Emit custom plugin event back into event log!
          await context.events.emit("HABIT_STREAK_INCREMENTED", event.id, {
            streak: newStreak,
            completedActionId: event.id
          });
        }
      }
    );

    // 2. Register Dashboard UI Widget
    context.ui.registerWidget("habit-streak-card", () => {
      return {
        title: "Daily Habit Streak 🔥",
        content: "Complete an action today to maintain your streak!"
      };
    });
  }

  async deactivate(): Promise<void> {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    console.log(`[Plugin] Deactivated ${this.manifest.name}`);
  }
}

export const plugin = new HabitStreakPlugin();
export default plugin;
