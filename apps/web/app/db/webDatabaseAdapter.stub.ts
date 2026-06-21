import type { DatabaseAdapter } from "@kreozalabs/core";

// Web database adapter stub for Tauri/native production builds
export const webDatabaseAdapter: DatabaseAdapter = {} as DatabaseAdapter;

// Export null database client for Tauri environments
export const db = null;
