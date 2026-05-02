export type EnergyType = "low" | "medium" | "high";
export type IntentionType = "must" | "want";
export type ActionStatus = "active" | "completed" | "abandoned";

// ActionPayload defines the data container for Action-related events.
// It acts as the "box" used to collect and transport task properties
// (like title, duration, or intention) into the event store.
// It is used both for creating new actions and for partial updates.
export interface ActionPayload {
  title?: string;
  note?: string;
  intention?: IntentionType;
  energy?: EnergyType;
  duration?: [number, number]; // [min, max] in minutes
  important?: boolean;
  scheduledDate?: string; // YYYY-MM-DD
  startTime?: string | null; // HH:mm
  endTime?: string | null; // HH:mm
  timezone?: string;
  sortOrder?: number;
}

// Action represents the primary unit of work in the application.
// It is the materialized, current state of a task—representing anything
// the user plans to do, is currently doing, or has already finished.
// While events are immutable, the Action object is the mutable "view" used
// by the UI for rendering and interaction.
export interface Action {
  id: string;
  title: string;
  note?: string;
  intention: IntentionType;
  important: boolean;
  energy: EnergyType;
  duration?: [number, number];
  scheduledDate: string; // YYYY-MM-DD
  startTime?: string | null;
  endTime?: string | null;
  timezone?: string;
  status: ActionStatus;
  createdAt: number;
  sortOrder: number;
}
