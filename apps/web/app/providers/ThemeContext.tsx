import { createContext, useContext } from "react";

export type Theme = "dark" | "light" | "system";
export type Accent = "blue" | "indigo" | "violet" | "emerald" | "rose" | "amber" | "forest";

export interface ThemeProviderState {
  theme: Theme;
  accent: Accent;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
}

export const initialState: ThemeProviderState = {
  theme: "system",
  accent: "rose",
  setTheme: () => null,
  setAccent: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
