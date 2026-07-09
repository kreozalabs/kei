import { type DatabaseAdapter, type Event, type Action } from "@kreozalabs/kei-core";

let cachedTauriDeviceId = "tauri-device-fallback";

export const tauriDatabaseAdapter: DatabaseAdapter = {
  async connect() {
    console.log("Connecting to native Tauri database...");
    try {
      // Dynamic import to avoid loading Tauri deps in the web browser bundle:
      // const { invoke } = await import("@tauri-apps/api/kei-core");
      // cachedTauriDeviceId = await invoke("get_device_id");
      cachedTauriDeviceId = `tauri-device-${crypto.randomUUID().slice(0, 8)}`;
    } catch (e) {
      console.error("Failed to get native Tauri device ID", e);
    }
  },

  async disconnect() {
    console.log("Disconnecting from Tauri database...");
  },

  getDeviceId() {
    return cachedTauriDeviceId;
  },

  async saveEvent(event: Event<unknown>): Promise<void> {
    console.log("Tauri: saveEvent", event);
  },

  async saveEventsBatch(events: Event<unknown>[]): Promise<number> {
    console.log("Tauri: saveEventsBatch", events);
    return events.length;
  },

  async getEventsForEntity(entityId: string): Promise<Event[]> {
    console.log("Tauri: getEventsForEntity", entityId);
    return [];
  },

  async getNextSequenceNumber(deviceId: string): Promise<number> {
    console.log("Tauri: getNextSequenceNumber", deviceId);
    return 1;
  },

  async getEvents(): Promise<Event[]> {
    console.log("Tauri: getEvents");
    return [];
  },

  async getAction(id: string): Promise<Action | null> {
    console.log("Tauri: getAction", id);
    return null;
  },

  async upsertAction(action: Action): Promise<void> {
    console.log("Tauri: upsertAction", action);
  },

  async deleteAction(id: string): Promise<void> {
    console.log("Tauri: deleteAction", id);
  },

  async clearActions(): Promise<void> {
    console.log("Tauri: clearActions");
  },

  async getMaxSortOrder(scheduledDate: string): Promise<number | null> {
    console.log("Tauri: getMaxSortOrder", scheduledDate);
    return null;
  },

  async getActions(filters?: Parameters<DatabaseAdapter["getActions"]>[0]): Promise<Action[]> {
    console.log("Tauri: getActions", filters);
    return [];
  },

  async saveActionsBatch(actions: Action[]): Promise<void> {
    console.log("Tauri: saveActionsBatch", actions);
  },

  async getSetting<T>(key: string): Promise<T | null> {
    console.log("Tauri: getSetting", key);
    return null;
  },

  async upsertSetting(key: string, value: unknown): Promise<void> {
    console.log("Tauri: upsertSetting", key, value);
  },

  async saveSettingsBatch(settings: [string, unknown][]): Promise<void> {
    console.log("Tauri: saveSettingsBatch", settings);
  },

  async clearSettings(): Promise<void> {
    console.log("Tauri: clearSettings");
  },

  async getLocalWatermarks(): Promise<Record<string, number>> {
    console.log("Tauri: getLocalWatermarks");
    return {};
  },

  async getEventsSince(watermarks: Record<string, number>): Promise<Event[]> {
    console.log("Tauri: getEventsSince", watermarks);
    return [];
  },

  async transaction<T>(callback: (txAdapter: DatabaseAdapter) => Promise<T>): Promise<T> {
    return callback(this);
  },

  notifyUpdate(entity) {
    console.log("Tauri: notifyUpdate", entity);
  },

  incrementActiveWrites() {},
  decrementActiveWrites() {},
};
