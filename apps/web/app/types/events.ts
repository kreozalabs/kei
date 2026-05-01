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

export interface Event<T = unknown> {
  eventId: string;
  id: string; // The action/entity ID
  type: EventType;
  timestamp: number;
  payload: T;
}

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
