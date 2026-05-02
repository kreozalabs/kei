export type EventType =
  | "ACTION_INTENDED"
  | "ACTION_UPDATED"
  | "ACTION_COMPLETED"
  | "ACTION_ACTIVATED"
  | "ACTION_ABANDONED"
  | "TRANSITION_STARTED";

export type EnergyType = "low" | "medium" | "high";
export type IntentionType = "must" | "want";
export type ActionStatus = "active" | "completed" | "abandoned";

// Events are the immutable source of truth for the application.
// Every state change is recorded as an event, allowing for a complete audit trail
// and the ability to reconstruct the state of any entity (e.g., an Action)
// at any point in time by replaying its history.
// See apps/web/app/db/actions.ts for the replay logic.
export interface Event<T = unknown> {
  eventId: string; // Unique identifier for this specific event
  id: string; // The entity ID (e.g., actionId) this event refers to
  type: EventType;
  timestamp: number;
  payload: T; // Data associated with this state change
}

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
