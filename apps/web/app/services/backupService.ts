import { exportEvents, importEvents } from "@/db/backup";
import { APP_VERSION } from "@/config/version";
import { downloadJsonFile, readJsonFile } from "@/utils/file";
import { formatUTCDateKey, type Event } from "@kreozalabs/kei-core";

export interface BackupPayload {
  version?: string | number;
  exportedAt?: number;
  events: Event[];
}

export interface ImportResult {
  actualImportedCount: number;
  shouldReload: boolean;
}

/**
 * Export database events to a JSON file.
 * Handles payload envelope construction and triggers download.
 * Ready for Tauri: platform-specific dialog branching can be added here cleanly.
 */
export async function exportBackupFile(): Promise<number> {
  const events = await exportEvents();
  const payload: BackupPayload = {
    version: APP_VERSION,
    exportedAt: Date.now(),
    events,
  };

  const dateStr = formatUTCDateKey(new Date());
  const filename = `kei-backup-${dateStr}.json`;

  downloadJsonFile(payload, filename);
  return events.length;
}

/**
 * Parses a JSON backup object/payload and imports its events into the database.
 * Validates payload structure and performs table re-projection.
 */
export async function importBackupFromPayload(rawContent: unknown): Promise<ImportResult> {
  let parsed: unknown = rawContent;

  if (typeof rawContent === "string") {
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      throw new Error("Invalid JSON: The uploaded file is not a valid JSON document.");
    }
  }

  const eventsList = Array.isArray(parsed) ? parsed : (parsed as BackupPayload)?.events;

  if (!eventsList || !Array.isArray(eventsList)) {
    throw new Error("Invalid backup file: Could not locate event logs array.");
  }

  const actualImportedCount = await importEvents(eventsList);

  return {
    actualImportedCount,
    shouldReload: actualImportedCount > 0,
  };
}

/**
 * Process a Web File object directly for backup import.
 */
export async function importBackupFile(file: File): Promise<ImportResult> {
  const parsed = await readJsonFile(file);
  return importBackupFromPayload(parsed);
}
