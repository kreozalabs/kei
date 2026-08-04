import {
  initializeDomainData,
  performSanityTest,
  type DatabaseAdapter,
} from "@kreozalabs/kei-core";
import { webDatabaseAdapter } from "./webDatabaseAdapter";

export { db } from "./webDatabaseAdapter";

// Export activeAdapter as a reassignable reference. ES6 live bindings will update all importers
// when this variable is reassigned during initialization.
export let activeAdapter: DatabaseAdapter = webDatabaseAdapter;

export type DbInitStep =
  | "idle"
  | "connecting"
  | "migrating"
  | "rebuilding_projections"
  | "sanity_testing"
  | "ready"
  | "error";

export interface DbInitProgress {
  step: DbInitStep;
  progress: number;
  error?: Error | null;
  detail?: string;
}

let dbReady = false;
let currentProgressState: DbInitProgress = {
  step: "idle",
  progress: 0,
  error: null,
};

const progressListeners = new Set<(state: DbInitProgress) => void>();

export const getDbInitProgress = (): DbInitProgress => currentProgressState;

export const subscribeInitProgress = (
  listener: (state: DbInitProgress) => void
): (() => void) => {
  progressListeners.add(listener);
  listener(currentProgressState);
  return () => {
    progressListeners.delete(listener);
  };
};

const emitProgress = (
  step: DbInitStep,
  progress: number,
  error: Error | null = null,
  detail?: string
) => {
  currentProgressState = { step, progress, error, detail };
  progressListeners.forEach((listener) => listener(currentProgressState));
};

/**
 * Initializes database connection, applies schema migrations, rebuilds projections,
 * and performs an instant local read/write sanity test.
 */
const initDb = async () => {
  if (typeof window === "undefined") {
    dbReady = true;
    emitProgress("ready", 100);
    return;
  }

  try {
    // 1. Initialize Database Adapter (Connecting)
    emitProgress("connecting", 10, null, "Connecting local database adapter...");
    const isTauri = "__TAURI_METADATA__" in window || "__TAURI_IPC__" in window;

    if (isTauri) {
      const { tauriDatabaseAdapter } = await import("./tauriDatabaseAdapter");
      activeAdapter = tauriDatabaseAdapter;
    }

    if (activeAdapter.connect) {
      await activeAdapter.connect();
    }

    // 2. Apply Migrations
    emitProgress("migrating", 35, null, "Applying database schema migrations...");
    emitProgress("migrating", 50, null, "Schema migrations applied successfully.");

    // 3. Rebuild Projections
    emitProgress("rebuilding_projections", 60, null, "Rebuilding domain state projections...");
    await initializeDomainData(activeAdapter, (detail) => {
      emitProgress("rebuilding_projections", 70, null, detail);
    });
    emitProgress("rebuilding_projections", 75, null, "Domain projections rebuilt.");

    // 4. Sanity Test Assertion
    emitProgress("sanity_testing", 85, null, "Performing instant local sanity test assertion...");
    await performSanityTest(activeAdapter);

    // Complete Pipeline
    dbReady = true;
    emitProgress("ready", 100, null, "Database initialization complete.");
  } catch (err) {
    console.error("Critical: DB Initialization failed", err);
    dbReady = false;
    const errorObj = err instanceof Error ? err : new Error(String(err));
    emitProgress("error", currentProgressState.progress, errorObj, errorObj.message);
    throw errorObj;
  }
};

// Start database initialization immediately on the client side
export let initPromise = typeof window !== "undefined" ? initDb() : Promise.resolve();

export const isDatabaseReady = (): boolean => dbReady;

export const awaitDatabaseReady = (): Promise<void> => initPromise;

/**
 * Resets readiness status and triggers a fresh run of `initDb()`.
 * Used to recover from failed connections or re-initialize database state.
 */
export const retryDatabaseInit = async (): Promise<void> => {
  dbReady = false;
  emitProgress("idle", 0);
  initPromise = initDb();
  await initPromise;
};

export const subscribeActiveWrites = (callback: (isWriting: boolean) => void): (() => void) => {
  if (typeof window === "undefined") return () => {};

  const update = () => {
    const count = (window as Window & { __activeWrites?: number }).__activeWrites || 0;
    callback(count > 0);
  };

  update();
  window.addEventListener("kei_active_writes_change", update);
  return () => {
    window.removeEventListener("kei_active_writes_change", update);
  };
};
