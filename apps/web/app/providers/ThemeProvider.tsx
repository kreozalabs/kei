import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";
export type Accent = "blue" | "indigo" | "violet" | "emerald" | "rose" | "amber" | "forest";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultAccent?: Accent;
  storageKey?: string;
  accentStorageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  accent: Accent;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
}

const initialState: ThemeProviderState = {
  theme: "system",
  accent: "blue",
  setTheme: () => null,
  setAccent: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultAccent = "blue",
  storageKey = "kei-ui-theme",
  accentStorageKey = "kei-ui-accent",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
  });

  const [accent, setAccent] = useState<Accent>(() => {
    if (typeof window === "undefined") return defaultAccent;
    return (localStorage.getItem(accentStorageKey) as Accent) || defaultAccent;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all theme-* classes
    const classes = root.className.split(" ").filter((c) => !c.startsWith("theme-"));
    root.className = classes.join(" ").trim();

    // Add new accent class
    root.classList.add(`theme-${accent}`);
  }, [accent]);

  const value = {
    theme,
    accent,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    setAccent: (accent: Accent) => {
      localStorage.setItem(accentStorageKey, accent);
      setAccent(accent);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
