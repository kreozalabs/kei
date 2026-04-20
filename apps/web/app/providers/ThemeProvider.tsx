import * as React from "react";
import { useEffect, useState } from "react";
import { 
  Theme, 
  Accent, 
  ThemeProviderContext 
} from "./ThemeContext";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultAccent?: Accent;
  storageKey?: string;
  accentStorageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultAccent = "rose",
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

    const applyTheme = () => {
      root.classList.remove("light", "dark");

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };

    applyTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemChange = () => applyTheme();

      mediaQuery.addEventListener("change", handleSystemChange);
      return () => mediaQuery.removeEventListener("change", handleSystemChange);
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
