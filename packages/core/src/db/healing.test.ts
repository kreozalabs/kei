import { describe, it, expect, vi } from "vitest";
import { purgeDerivedProjections, executeSelfHealing } from "./healing";
import type { DatabaseAdapter } from "./adapter";

function createMockAdapter(overrides?: Partial<DatabaseAdapter>): DatabaseAdapter {
  return {
    getDeviceId: () => "mock-device-123",
    saveEvent: vi.fn(),
    saveEventsBatch: vi.fn(),
    getEventsForEntity: vi.fn(),
    getNextSequenceNumber: vi.fn(),
    getEvents: vi.fn().mockResolvedValue([]),
    getAction: vi.fn(),
    upsertAction: vi.fn(),
    deleteAction: vi.fn(),
    clearActions: vi.fn().mockResolvedValue(undefined),
    getMaxSortOrder: vi.fn(),
    getActions: vi.fn(),
    saveActionsBatch: vi.fn(),
    getSetting: vi.fn().mockResolvedValue(null),
    upsertSetting: vi.fn(),
    saveSettingsBatch: vi.fn(),
    clearSettings: vi.fn().mockResolvedValue(undefined),
    getLocalWatermarks: vi.fn(),
    getEventsSince: vi.fn(),
    transaction: vi.fn(),
    notifyUpdate: vi.fn(),
    incrementActiveWrites: vi.fn(),
    decrementActiveWrites: vi.fn(),
    ...overrides,
  };
}

describe("executeSelfHealing", () => {
  it("purges derived projections on state/sanity error", async () => {
    const adapter = createMockAdapter();
    await executeSelfHealing(adapter, new Error("Projection mismatch"));
    expect(adapter.clearActions).toHaveBeenCalledOnce();
    expect(adapter.clearSettings).toHaveBeenCalledOnce();
  });

  it("handles storage lock errors by pausing and reconnecting", async () => {
    const connectMock = vi.fn().mockResolvedValue(undefined);
    const adapter = createMockAdapter({
      connect: connectMock,
    });
    await executeSelfHealing(adapter, new Error("Storage lock busy"));
    expect(connectMock).toHaveBeenCalledOnce();
  });
});
