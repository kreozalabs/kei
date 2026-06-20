import type { Event, Action, ActionStatus } from "@kreozalabs/core";

export interface DatabaseAdapter {
  saveEvent(event: Event<any>): Promise<void>;
  saveEventsBatch(events: Event<any>[]): Promise<number>;
  getEventsForEntity(entityId: string): Promise<Event[]>;
  getNextSequenceNumber(deviceId: string): Promise<number>;
  getEvents(): Promise<Event[]>;

  // Action Projection methods:
  getAction(id: string): Promise<Action | null>;
  upsertAction(action: Action): Promise<void>;
  deleteAction(id: string): Promise<void>;
  clearActions(): Promise<void>;
  getMaxSortOrder(scheduledDate: string): Promise<number | null>;
  getActions(filters?: {
    startDate?: string;
    endDate?: string;
    status?: ActionStatus[];
  }): Promise<Action[]>;
  saveActionsBatch(actions: Action[]): Promise<void>;

  // Settings Projection methods
  getSetting<T>(key: string): Promise<T | null>;
  upsertSetting(key: string, value: unknown): Promise<void>;
  saveSettingsBatch(settings: [string, unknown][]): Promise<void>;
  clearSettings(): Promise<void>;

  // Syncing methods
  getLocalWatermarks(): Promise<Record<string, number>>;
  getEventsSince(watermarks: Record<string, number>): Promise<Event[]>;

  // Transaction
  transaction<T>(callback: (txAdapter: DatabaseAdapter) => Promise<T>): Promise<T>;

  // UI Syncing & Notifications
  notifyUpdate(entity: "actions" | "settings"): void;
  incrementActiveWrites(): void;
  decrementActiveWrites(): void;
}
