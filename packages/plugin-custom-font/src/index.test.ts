import { describe, expect, it } from "vitest";
import { CustomFontPlugin, GOOGLE_FONT_PRESETS, MONO_FONT_PRESETS } from "./index";
import type { KeiPluginContext } from "@kreozalabs/kei-plugin-sample";

describe("CustomFontPlugin", () => {
  it("initializes default font config, retrieves font families, and updates config", async () => {
    const storageMap = new Map<string, unknown>();
    const emitted: Array<{ type: string; payload: unknown }> = [];

    const mockContext: KeiPluginContext = {
      manifest: {
        id: "font-test",
        name: "Font Test",
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

    const plugin = new CustomFontPlugin();
    await plugin.activate(mockContext);

    // Verify initial preset family
    expect(plugin.getActiveFontFamily()).toBe(GOOGLE_FONT_PRESETS[0].family);
    expect(plugin.getActiveMonoFamily()).toBe(MONO_FONT_PRESETS[0].family);

    // Update to outfit preset and jetbrains mono
    await plugin.updateConfig({
      mode: "preset",
      presetId: "outfit",
      monoPresetId: "jetbrains-mono",
      fontScale: 1.1,
      fontWeight: "medium"
    });

    expect(plugin.getActiveFontFamily()).toBe("Outfit");
    expect(plugin.getActiveMonoFamily()).toBe("JetBrains Mono");
    expect(plugin.getConfig().fontScale).toBe(1.1);
    expect(emitted).toHaveLength(1);
    expect(emitted[0].type).toBe("FONT_CONFIG_UPDATED");

    // Update to custom font family
    await plugin.updateConfig({
      mode: "custom",
      customFamily: "Poppins"
    });

    expect(plugin.getActiveFontFamily()).toBe("Poppins");

    const fontUrls = plugin.getGoogleFontUrls();
    expect(fontUrls.some((u) => u.includes("Poppins"))).toBe(true);

    await plugin.deactivate();
  });
});
