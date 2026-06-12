export type EventType =
  | "ACTION_INTENDED"
  | "ACTION_UPDATED"
  | "ACTION_COMPLETED"
  | "ACTION_ACTIVATED"
  | "ACTION_ABANDONED"
  | "ACTION_DELETED"
  | "TRANSITION_STARTED"
  | "SETTING_UPDATED";

// Events are the immutable source of truth for the application.
// Every state change is recorded as an event, allowing for a complete audit trail
// and the ability to reconstruct the state of any entity (e.g., an Action)
// at any point in time by replaying its history.
export interface Event<T = unknown> {
  eventId: string; // Unique identifier for this specific event
  id: string; // The entity ID (e.g., actionId) this event refers to
  type: EventType;
  timestamp: number;
  payload: T; // Data associated with this state change
  originDeviceId?: string;
  sequenceNumber?: number;
}
