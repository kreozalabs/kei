import { describe, it, expect, vi } from "vitest";
import { performSanityTest, SanityTestError } from "./sanity";
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
    clearActions: vi.fn(),
    getMaxSortOrder: vi.fn(),
    getActions: vi.fn(),
    saveActionsBatch: vi.fn(),
    getSetting: vi.fn().mockResolvedValue(null),
    upsertSetting: vi.fn(),
    saveSettingsBatch: vi.fn(),
    clearSettings: vi.fn(),
    getLocalWatermarks: vi.fn(),
    getEventsSince: vi.fn(),
    transaction: vi.fn(),
    notifyUpdate: vi.fn(),
    incrementActiveWrites: vi.fn(),
    decrementActiveWrites: vi.fn(),
    ...overrides,
  };
}

describe("performSanityTest", () => {
  it("passes when storage read/write assertions succeed", async () => {
    const adapter = createMockAdapter();
    await expect(performSanityTest(adapter)).resolves.not.toThrow();
  });

  it("throws SanityTestError when storage reads fail", async () => {
    const adapter = createMockAdapter({
      getEvents: vi.fn().mockRejectedValue(new Error("Storage corrupted")),
    });
    await expect(performSanityTest(adapter)).rejects.toThrow(SanityTestError);
  });
});
