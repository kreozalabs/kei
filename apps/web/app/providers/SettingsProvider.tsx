import * as React from "react";
import { useEffect, useState } from "react";
import { SettingsProviderContext } from "./SettingsContext";
import type { Settings } from "../types/settings";
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../config/constants";
import { getSetting, setSetting } from "../db/settings";
import { initPromise } from "../db";

interface ThemeProviderProps {
  children: React.ReactNode;
  storageKey?: string;
}

export function SettingsProvider({
  children,
  storageKey = STORAGE_KEYS.SETTINGS,
  ...props
}: ThemeProviderProps) {
  const [settings, setSettingsState] = useState<Settings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return { ...DEFAULT_SETTINGS, ...parsed };
        }
      }
    } catch {
      // Legacy or invalid data, fallback to defaults
    }
    return DEFAULT_SETTINGS;
  });

  const updateSetting = <K extends keyof Settings>(
    key: K,
    valueOrFn: Settings[K] | ((prev: Settings[K]) => Settings[K])
  ) => {
    setSettingsState((prev) => {
      const newValue =
        typeof valueOrFn === "function"
          ? (valueOrFn as (prev: Settings[K]) => Settings[K])(prev[key])
          : valueOrFn;

      const newSettings = { ...prev, [key]: newValue };
      localStorage.setItem(storageKey, JSON.stringify(newSettings));

      // Persist to DB asynchronously
      initPromise.then(() => setSetting(key, newValue));

      return newSettings;
    });
  };

  useEffect(() => {
    // On mount, load latest from DB
    const loadFromDb = async () => {
      await initPromise;
      const dbSettings: Partial<Settings> = {};

      for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
        const dbValue = await getSetting<Settings[keyof Settings]>(key);
        if (dbValue !== null) {
          dbSettings[key] = dbValue as never;
        }
      }

      setSettingsState((prev) => {
        let hasChanges = false;
        const newSettings = { ...prev };

        for (const [key, value] of Object.entries(dbSettings) as [
          keyof Settings,
          Settings[keyof Settings],
        ][]) {
          if (JSON.stringify(value) !== JSON.stringify(prev[key])) {
            newSettings[key] = value as never;
            hasChanges = true;
          }
        }

        if (hasChanges) {
          localStorage.setItem(storageKey, JSON.stringify(newSettings));
          return newSettings;
        }
        return prev;
      });
    };

    loadFromDb();

    // Listen to broadcast channel for changes in other tabs
    const channel = new BroadcastChannel("kei_db_sync");
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "DB_UPDATED" && e.data.entity === "settings") {
        loadFromDb();
      }
    };
    channel.addEventListener("message", handleMessage);
    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = () => {
      root.classList.add("disable-transitions");
      root.classList.remove("light", "dark");

      if (settings.theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(settings.theme);
      }

      // Allow browser to apply the theme without transition, then re-enable
      setTimeout(() => {
        root.classList.remove("disable-transitions");
      }, 50); // Small delay to ensure styles are painted
    };

    applyTheme();

    if (settings.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemChange = () => applyTheme();

      mediaQuery.addEventListener("change", handleSystemChange);
      return () => mediaQuery.removeEventListener("change", handleSystemChange);
    }
  }, [settings.theme]);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.add("disable-transitions");

    // Remove all theme-* classes
    const classes = root.className.split(" ").filter((c) => !c.startsWith("theme-"));
    root.className = classes.join(" ").trim();

    // Add new accent class
    root.classList.add(`theme-${settings.accent}`);

    setTimeout(() => {
      root.classList.remove("disable-transitions");
    }, 50);
  }, [settings.accent]);

  const value = {
    settings,
    updateSetting,
  };

  return (
    <SettingsProviderContext.Provider {...props} value={value}>
      {children}
    </SettingsProviderContext.Provider>
  );
}
