import { createContext, useContext } from "react";
import { DEFAULT_SETTINGS } from "../config/constants";
import type { Settings } from "../types/settings";

export interface SettingsProviderState {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  // Aliases for backward compatibility
  theme: Settings["theme"];
  accent: Settings["accent"];
  timeFormat: Settings["time_format"];
  setTheme: (theme: Settings["theme"]) => void;
  setAccent: (accent: Settings["accent"]) => void;
  setTimeFormat: (format: Settings["time_format"]) => void;
}

export const initialState: SettingsProviderState = {
  settings: DEFAULT_SETTINGS,
  updateSetting: () => null,
  theme: DEFAULT_SETTINGS.theme,
  accent: DEFAULT_SETTINGS.accent,
  timeFormat: DEFAULT_SETTINGS.time_format,
  setTheme: () => null,
  setAccent: () => null,
  setTimeFormat: () => null,
};

export const SettingsProviderContext = createContext<SettingsProviderState>(initialState);

export const useSettings = () => {
  const context = useContext(SettingsProviderContext);
  if (context === undefined) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};

// Alias for backward compatibility
export const useTheme = useSettings;
