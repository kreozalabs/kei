export interface WallpaperPreset {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
}

export interface BackgroundImageConfig {
  enabled: boolean;
  mode: "preset" | "custom";
  presetId: string;
  customUrl: string;
  blurPx: number; // 0 to 20
  overlayOpacity: number; // 0.1 to 0.9 (10% to 90%)
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: "cosmic-dark",
    name: "Cosmic Dark",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2000&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "forest-dawn",
    name: "Forest Mist",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2000&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "cyberpunk-neon",
    name: "Cyberpunk City",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2000&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "minimal-gradient",
    name: "Nordic Dusk",
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300&auto=format&fit=crop"
  }
];

export const DEFAULT_BACKGROUND_CONFIG: BackgroundImageConfig = {
  enabled: true,
  mode: "preset",
  presetId: "cosmic-dark",
  customUrl: "",
  blurPx: 4,
  overlayOpacity: 0.4
};
