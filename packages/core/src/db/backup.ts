import type { DatabaseAdapter, Event, EventType } from "@kreozalabs/core";
import { rebuildActions } from "./actions";
import { rebuildSettings } from "./settings";

class Mutex {
  private queue = Promise.resolve();

  async run<T>(fn: () => Promise<T>): Promise<T> {
    const res = new Promise<T>((resolve, reject) => {
      this.queue = this.queue.then(async () => {
        try {
          const val = await fn();
          resolve(val);
        } catch (err) {
          reject(err);
        }
      });
    });
    return res;
  }
}

const importMutex = new Mutex();

export async function exportEvents(adapter: DatabaseAdapter): Promise<Event[]> {
  return await adapter.getEvents();
}

export async function importEvents(events: Event[], adapter: DatabaseAdapter): Promise<number> {
  adapter.incrementActiveWrites();
  try {
    return await importMutex.run(() => executeImportEvents(events, adapter));
  } finally {
    adapter.decrementActiveWrites();
  }
}

async function executeImportEvents(events: Event[], adapter: DatabaseAdapter): Promise<number> {
  console.log("[P2P/Import] Received events to import:", events);
  if (!Array.isArray(events)) {
    throw new Error("Invalid backup format: data is not a list of events.");
  }

  const validEvents = events.filter((e) => e.eventId && e.id && e.type && e.timestamp);
  console.log(`[P2P/Import] Valid events count: ${validEvents.length} / total: ${events.length}`);

  if (validEvents.length === 0) {
    return 0;
  }

  const importedCount = await adapter.saveEventsBatch(validEvents);

  // 1. Rebuild actions and settings derived projection tables
  await rebuildActions(adapter);
  await rebuildSettings(adapter);

  // 2. Notify all tabs that the database was updated
  adapter.notifyUpdate("actions");
  adapter.notifyUpdate("settings");

  return importedCount;
}
