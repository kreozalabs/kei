import manifestRaw from "../plugin.json" with { type: "json" };
import type { KeiPlugin, KeiPluginContext, PluginManifest } from "@kreozalabs/kei-plugin-sample";
import {
  DEFAULT_FONT_CONFIG,
  GOOGLE_FONT_PRESETS,
  MONO_FONT_PRESETS,
  type CustomFontConfig
} from "./types";

export * from "./types";

export class CustomFontPlugin implements KeiPlugin {
  public manifest: PluginManifest = manifestRaw as PluginManifest;
  private context: KeiPluginContext | null = null;
  private config: CustomFontConfig = { ...DEFAULT_FONT_CONFIG };

  async activate(context: KeiPluginContext): Promise<void> {
    this.context = context;

    // Load persisted configuration
    const saved = await context.storage.get<CustomFontConfig>("font_config");
    if (saved) {
      this.config = { ...DEFAULT_FONT_CONFIG, ...saved };
    }

    this.applyToDOM();
    console.log(`[Plugin] CustomFontPlugin activated with preset: ${this.config.presetId}`);
  }

  async deactivate(): Promise<void> {
    this.removeFromDOM();
    this.context = null;
    console.log("[Plugin] CustomFontPlugin deactivated");
  }

  public getConfig(): CustomFontConfig {
    return { ...this.config };
  }

  public getActiveFontFamily(): string {
    if (!this.config.enabled) return "";
    if (this.config.mode === "custom" && this.config.customFamily.trim()) {
      return this.config.customFamily.trim();
    }
    const preset = GOOGLE_FONT_PRESETS.find((p) => p.id === this.config.presetId) || GOOGLE_FONT_PRESETS[0];
    return preset.family;
  }

  public getActiveMonoFamily(): string {
    if (!this.config.enabled) return "";
    const preset = MONO_FONT_PRESETS.find((p) => p.id === this.config.monoPresetId) || MONO_FONT_PRESETS[0];
    return preset.family;
  }

  public getGoogleFontUrls(): string[] {
    if (!this.config.enabled) return [];
    const urls: string[] = [];

    if (this.config.mode === "custom" && this.config.customFamily.trim()) {
      const familyEncoded = encodeURIComponent(this.config.customFamily.trim());
      urls.push(`https://fonts.googleapis.com/css2?family=${familyEncoded}:wght@300;400;500;600;700&display=swap`);
    } else {
      const preset = GOOGLE_FONT_PRESETS.find((p) => p.id === this.config.presetId);
      if (preset && preset.googleFontUrl) {
        urls.push(preset.googleFontUrl);
      }
    }

    const monoPreset = MONO_FONT_PRESETS.find((p) => p.id === this.config.monoPresetId);
    if (monoPreset && monoPreset.googleFontUrl) {
      urls.push(monoPreset.googleFontUrl);
    }

    return urls;
  }

  public async updateConfig(partial: Partial<CustomFontConfig>): Promise<CustomFontConfig> {
    this.config = { ...this.config, ...partial };
    if (this.context) {
      await this.context.storage.set("font_config", this.config);
      await this.context.events.emit("FONT_CONFIG_UPDATED", "font-plugin", this.config);
    }
    this.applyToDOM();
    return this.config;
  }

  public applyToDOM(doc: Document = typeof document !== "undefined" ? document : (null as unknown as Document)): void {
    if (!doc || !doc.head) return;

    // 1. Google Font Links Injection
    const linkId = "kei-plugin-google-fonts-link";
    let existingLink = doc.getElementById(linkId) as HTMLLinkElement | null;

    const urls = this.getGoogleFontUrls();
    if (urls.length > 0) {
      if (!existingLink) {
        existingLink = doc.createElement("link");
        existingLink.id = linkId;
        existingLink.rel = "stylesheet";
        doc.head.appendChild(existingLink);
      }
      existingLink.href = urls.join("&family=");
    } else if (existingLink) {
      existingLink.remove();
    }

    // 2. Custom Style Injection for CSS variables and font scaling
    const styleId = "kei-plugin-custom-font-style";
    let existingStyle = doc.getElementById(styleId) as HTMLStyleElement | null;

    if (!this.config.enabled) {
      if (existingStyle) existingStyle.remove();
      return;
    }

    const fontFamily = this.getActiveFontFamily();
    const monoFamily = this.getActiveMonoFamily();
    const fontScale = this.config.fontScale || 1.0;
    const weightMap: Record<string, string> = {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600"
    };
    const fontWeight = weightMap[this.config.fontWeight] || "400";

    const cssRules = `
      :root {
        ${fontFamily ? `--font-sans: "${fontFamily}", system-ui, -apple-system, sans-serif !important;` : ""}
        ${monoFamily ? `--font-mono: "${monoFamily}", ui-monospace, monospace !important;` : ""}
        font-size: ${fontScale * 100}% !important;
        font-weight: ${fontWeight};
      }
      ${fontFamily ? `body, button, input, select, textarea { font-family: var(--font-sans); }` : ""}
    `;

    if (!existingStyle) {
      existingStyle = doc.createElement("style");
      existingStyle.id = styleId;
      doc.head.appendChild(existingStyle);
    }
    existingStyle.textContent = cssRules;
  }

  public removeFromDOM(doc: Document = typeof document !== "undefined" ? document : (null as unknown as Document)): void {
    if (!doc || !doc.head) return;
    const link = doc.getElementById("kei-plugin-google-fonts-link");
    if (link) link.remove();
    const style = doc.getElementById("kei-plugin-custom-font-style");
    if (style) style.remove();
  }
}

export const plugin = new CustomFontPlugin();
export default plugin;
