import * as React from "react";
import { useEffect, useState } from "react";
import { type Theme, type Accent, type TimeFormat, ThemeProviderContext } from "./ThemeContext";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultAccent?: Accent;
  storageKey?: string;
  accentStorageKey?: string;
  timeFormatStorageKey?: string;
  showRecentConfigsStorageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultAccent = "rose",
  storageKey = "kei-ui-theme",
  accentStorageKey = "kei-ui-accent",
  timeFormatStorageKey = "kei-ui-time-format",
  showRecentConfigsStorageKey = "kei-ui-show-recent-configs",
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

  const [timeFormat, setTimeFormat] = useState<TimeFormat>(() => {
    if (typeof window === "undefined") return "12h";
    return (localStorage.getItem(timeFormatStorageKey) as TimeFormat) || "12h";
  });

  const [showRecentConfigs, setShowRecentConfigs] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(showRecentConfigsStorageKey);
    return stored === null ? true : stored === "true";
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
    timeFormat,
    showRecentConfigs,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    setAccent: (accent: Accent) => {
      localStorage.setItem(accentStorageKey, accent);
      setAccent(accent);
    },
    setTimeFormat: (format: TimeFormat) => {
      localStorage.setItem(timeFormatStorageKey, format);
      setTimeFormat(format);
    },
    setShowRecentConfigs: (show: boolean) => {
      localStorage.setItem(showRecentConfigsStorageKey, String(show));
      setShowRecentConfigs(show);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
