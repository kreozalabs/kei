import { describe, expect, it } from "vitest";
import { BackgroundImagePlugin, WALLPAPER_PRESETS } from "./index";
import type { KeiPluginContext } from "@kreozalabs/kei-plugin-sample";

describe("BackgroundImagePlugin", () => {
  it("initializes default config and updates background options", async () => {
    const storageMap = new Map<string, unknown>();
    const emitted: Array<{ type: string; payload: unknown }> = [];

    const mockContext: KeiPluginContext = {
      manifest: {
        id: "bg-test",
        name: "BG Test",
        version: "1.0.0",
        description: "",
        author: "",
        permissions: ["storage:local", "ui:style"],
        slots: []
      },
      events: {
        subscribe: () => () => {},
        emit: async (type, id, payload) => {
          emitted.push({ type: type as string, payload });
          return {
            eventId: "evt-1",
            id,
            type: type as any,
            timestamp: Date.now(),
            payload
          };
        }
      },
      storage: {
        get: async <T>(key: string) => (storageMap.get(key) as T) ?? null,
        set: async (key, val) => {
          storageMap.set(key, val);
        }
      },
      ui: {
        registerWidget: () => {}
      }
    };

    const plugin = new BackgroundImagePlugin();
    await plugin.activate(mockContext);

    // Verify initial preset URL
    expect(plugin.getActiveImageUrl()).toBe(WALLPAPER_PRESETS[0].url);

    // Update config to custom URL
    await plugin.updateConfig({
      mode: "custom",
      customUrl: "https://example.com/custom.jpg",
      blurPx: 10,
      overlayOpacity: 0.5
    });

    expect(plugin.getActiveImageUrl()).toBe("https://example.com/custom.jpg");
    expect(plugin.getConfig().blurPx).toBe(10);
    expect(emitted).toHaveLength(1);
    expect(emitted[0].type).toBe("BACKGROUND_IMAGE_UPDATED");

    await plugin.deactivate();
  });
});
