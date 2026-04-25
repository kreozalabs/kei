export type EventType = 
  | "ACTION_INTENDED" 
  | "ACTION_UPDATED"
  | "ACTION_COMPLETED" 
  | "ACTION_ABANDONED" 
  | "TRANSITION_STARTED";

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
  intention?: "must" | "want";
  energy?: "low" | "medium" | "high";
  duration?: [number, number]; // [min, max] in minutes
  important?: boolean;
  scheduledDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  sortOrder?: number;
}

export interface Action {
  id: string;
  title: string;
  note?: string;
  intention: "must" | "want";
  important: boolean;
  energy: "low" | "medium" | "high";
  duration?: [number, number];
  scheduledDate: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  status: "active" | "completed" | "abandoned";
  createdAt: number;
  sortOrder: number;
}
