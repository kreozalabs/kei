import { createContext, useContext } from "react";
import { TIME_FORMATS } from "../config/constants";

export type Theme = "dark" | "light" | "system";
export type Accent = "blue" | "indigo" | "violet" | "emerald" | "rose" | "amber" | "forest";
export type TimeFormat = (typeof TIME_FORMATS)[keyof typeof TIME_FORMATS];

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
  theme: "system",
  accent: "rose",
  timeFormat: TIME_FORMATS.H12,
  showRecentConfigs: true,
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
