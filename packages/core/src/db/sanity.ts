import type { DatabaseAdapter } from "./adapter";
import { assertDatabaseAdapterReady } from "./events";

export class SanityTestError extends Error {
  constructor(message: string, public override cause?: unknown) {
    super(`Database Sanity Test Failed: ${message}`);
    this.name = "SanityTestError";
  }
}

/**
 * Performs an instant local read/write assertion to verify that the local database
 * storage adapter is responsive and accessible before unlocking application UI.
 */
export async function performSanityTest(adapter: DatabaseAdapter): Promise<void> {
  assertDatabaseAdapterReady(adapter);

  try {
    // 1. Verify device identity can be resolved
    const deviceId = adapter.getDeviceId();
    if (!deviceId) {
      throw new Error("Device ID resolution failed.");
    }

    // 2. Perform storage read test on event log
    await adapter.getEvents();

    // 3. Perform storage read test on projections / settings
    await adapter.getSetting("_sanity_ping");
  } catch (err) {
    if (err instanceof SanityTestError) throw err;
    throw new SanityTestError(
      err instanceof Error ? err.message : "Storage assertion failed.",
      err
    );
  }
}
