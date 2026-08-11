export interface GoogleFontPreset {
  id: string;
  name: string;
  family: string;
  category: "sans-serif" | "serif" | "monospace" | "display";
  weights: number[];
  googleFontUrl: string;
}

export interface MonoFontPreset {
  id: string;
  name: string;
  family: string;
  googleFontUrl: string;
}

export interface CustomFontConfig {
  enabled: boolean;
  mode: "preset" | "custom";
  presetId: string;
  customFamily: string;
  fontScale: number; // 0.9 (90%), 1.0 (100%), 1.1 (110%), 1.2 (120%)
  fontWeight: "light" | "normal" | "medium" | "semibold";
  monoPresetId: string;
}

export const GOOGLE_FONT_PRESETS: GoogleFontPreset[] = [
  {
    id: "inter",
    name: "Inter",
    family: "Inter",
    category: "sans-serif",
    weights: [300, 400, 500, 600, 700],
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
  },
  {
    id: "roboto",
    name: "Roboto",
    family: "Roboto",
    category: "sans-serif",
    weights: [300, 400, 500, 700],
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
  },
  {
    id: "outfit",
    name: "Outfit",
    family: "Outfit",
    category: "sans-serif",
    weights: [300, 400, 500, 600, 700],
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap"
  },
  {
    id: "plus-jakarta-sans",
    name: "Plus Jakarta Sans",
    family: "Plus Jakarta Sans",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
  },
  {
    id: "lexend",
    name: "Lexend",
    family: "Lexend",
    category: "sans-serif",
    weights: [300, 400, 500, 600, 700],
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap"
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    family: "Space Grotesk",
    category: "display",
    weights: [400, 500, 600, 700],
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
  },
  {
    id: "playfair-display",
    name: "Playfair Display",
    family: "Playfair Display",
    category: "serif",
    weights: [400, 600, 700],
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap"
  }
];

export const MONO_FONT_PRESETS: MonoFontPreset[] = [
  {
    id: "system-mono",
    name: "System Monospace",
    family: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    googleFontUrl: ""
  },
  {
    id: "jetbrains-mono",
    name: "JetBrains Mono",
    family: "JetBrains Mono",
    googleFontUrl: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
  },
  {
    id: "fira-code",
    name: "Fira Code",
    family: "Fira Code",
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap"
  }
];

export const DEFAULT_FONT_CONFIG: CustomFontConfig = {
  enabled: true,
  mode: "preset",
  presetId: "inter",
  customFamily: "",
  fontScale: 1.0,
  fontWeight: "normal",
  monoPresetId: "system-mono"
};
