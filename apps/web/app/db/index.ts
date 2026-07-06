import { initializeDomainData, type DatabaseAdapter } from "@kreozalabs/core";
import { webDatabaseAdapter } from "./webDatabaseAdapter";

export { db } from "./webDatabaseAdapter";

// Export activeAdapter as a reassignable reference. ES6 live bindings will update all importers
// when this variable is reassigned during initialization.
export let activeAdapter: DatabaseAdapter = webDatabaseAdapter;

const initDb = async () => {
  if (typeof window === "undefined") return;

  // Detect if running inside the Tauri native container
  const isTauri = "__TAURI_METADATA__" in window || "__TAURI_IPC__" in window;

  if (isTauri) {
    // Dynamic import to prevent loading Tauri dependencies in web browser bundles
    const { tauriDatabaseAdapter } = await import("./tauriDatabaseAdapter");
    activeAdapter = tauriDatabaseAdapter;
  }

  // 1. Connect to the database (runs dialect-specific connection and migrations)
  if (activeAdapter.connect) {
    await activeAdapter.connect();
  }

  // 2. Initialize domain default settings and rebuild projections from event log
  await initializeDomainData(activeAdapter);
};

// Start database initialization immediately on the client side
export const initPromise = typeof window !== "undefined" ? initDb() : Promise.resolve();
