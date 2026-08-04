import type { DatabaseAdapter } from "./adapter";

export async function purgeDerivedProjections(adapter: DatabaseAdapter): Promise<void> {
  await adapter.clearActions();
  await adapter.clearSettings();
}

export async function executeSelfHealing(
  adapter: DatabaseAdapter,
  error: unknown,
  onProgress?: (detail: string) => void,
  attempt = 1
): Promise<void> {
  // Attempt to establish connection if adapter is not ready
  if (adapter.connect && (!adapter.isReady || !adapter.isReady())) {
    const delay = attempt * 200;
    onProgress?.(`Resolving connection issues (pausing ${delay}ms)...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    try {
      await adapter.connect();
    } catch (connectErr) {
      console.warn("[Self-Healing] Reconnection attempt failed:", connectErr);
    }
  }

  // Purge derived projections so they can be cleanly replayed
  onProgress?.("Purging derived cache & preparing event log replay...");
  try {
    await purgeDerivedProjections(adapter);
  } catch (purgeErr) {
    console.warn("[Self-Healing] Could not purge derived tables cleanly:", purgeErr);
  }
}
