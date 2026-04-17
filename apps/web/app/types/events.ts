export type EventType = 
  | "ACTION_INTENDED" 
  | "ACTION_COMPLETED" 
  | "ACTION_ABANDONED" 
  | "TRANSITION_STARTED";

export interface Event<T = unknown> {
  id: string;
  type: EventType;
  timestamp: number;
  payload: T;
}

export interface ActionPayload {
  title: string;
  description?: string;
  project?: string;
  priority?: "low" | "medium" | "high";
  energy?: "low" | "medium" | "high";
  duration?: [number, number]; // [min, max] in minutes
}

export interface Action {
  id: string;
  title: string;
  description?: string;
  project?: string;
  priority: "low" | "medium" | "high";
  energy: "low" | "medium" | "high";
  duration?: [number, number];
  status: "active" | "completed" | "abandoned";
  createdAt: number;
}
