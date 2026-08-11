import manifestRaw from "../plugin.json" with { type: "json" };
import type { KeiPlugin, KeiPluginContext, PluginManifest } from "@kreozalabs/kei-plugin-sample";
import {
  DEFAULT_BACKGROUND_CONFIG,
  WALLPAPER_PRESETS,
  type BackgroundImageConfig,
  type WallpaperPreset
} from "./types";

export * from "./types";

export class BackgroundImagePlugin implements KeiPlugin {
  public manifest: PluginManifest = manifestRaw as PluginManifest;
  private context: KeiPluginContext | null = null;
  private config: BackgroundImageConfig = { ...DEFAULT_BACKGROUND_CONFIG };

  async activate(context: KeiPluginContext): Promise<void> {
    this.context = context;

    // Load persisted configuration
    const saved = await context.storage.get<BackgroundImageConfig>("background_config");
    if (saved) {
      this.config = { ...DEFAULT_BACKGROUND_CONFIG, ...saved };
    }

    console.log(`[Plugin] BackgroundImagePlugin activated with preset: ${this.config.presetId}`);
  }

  async deactivate(): Promise<void> {
    this.context = null;
    console.log("[Plugin] BackgroundImagePlugin deactivated");
  }

  public getConfig(): BackgroundImageConfig {
    return { ...this.config };
  }

  public getActiveImageUrl(): string {
    if (!this.config.enabled) return "";
    if (this.config.mode === "custom" && this.config.customUrl.trim()) {
      return this.config.customUrl.trim();
    }
    const preset = WALLPAPER_PRESETS.find((p) => p.id === this.config.presetId) || WALLPAPER_PRESETS[0];
    return preset.url;
  }

  public async updateConfig(partial: Partial<BackgroundImageConfig>): Promise<BackgroundImageConfig> {
    this.config = { ...this.config, ...partial };
    if (this.context) {
      await this.context.storage.set("background_config", this.config);
      await this.context.events.emit("BACKGROUND_IMAGE_UPDATED", "bg-plugin", this.config);
    }
    return this.config;
  }
}

export const plugin = new BackgroundImagePlugin();
export default plugin;
