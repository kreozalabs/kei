import { createContext, useContext } from "react";
import { DEFAULT_SETTINGS } from "../config/constants";
import type { Theme, Accent, TimeFormat } from "../types/settings";

export interface ThemeProviderState {
  theme: Theme;
  accent: Accent;
  timeFormat: TimeFormat;
  showRecentConfigs: boolean;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
  setTimeFormat: (format: TimeFormat) => void;
  setShowRecentConfigs: (show: boolean) => void;
}

export const initialState: ThemeProviderState = {
  theme: DEFAULT_SETTINGS.theme,
  accent: DEFAULT_SETTINGS.accent as Accent,
  timeFormat: DEFAULT_SETTINGS.time_format as TimeFormat,
  showRecentConfigs: DEFAULT_SETTINGS.recent_configs_enabled,
  setTheme: () => null,
  setAccent: () => null,
  setTimeFormat: () => null,
  setShowRecentConfigs: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
