import * as React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { SettingsProviderContext } from "./SettingsContext";
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@kreozalabs/kei-core";
import { getSetting, setSetting } from "@/db/settings";
import type { Settings } from "@kreozalabs/kei-core";
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
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      // Legacy or invalid data, fallback to defaults
    }
    return DEFAULT_SETTINGS;
  });

  const updateSetting = useCallback(
    <K extends keyof Settings>(
      key: K,
      valueOrFn: Settings[K] | ((prev: Settings[K]) => Settings[K])
    ) => {
      const newValue =
        typeof valueOrFn === "function"
          ? (valueOrFn as (prev: Settings[K]) => Settings[K])(settings[key])
          : valueOrFn;

      const newSettings = { ...settings, [key]: newValue };

      setSettingsState(newSettings);
      localStorage.setItem(storageKey, JSON.stringify(newSettings));
      initPromise.then(() => setSetting(key, newValue));
    },
    [settings, storageKey]
  );

  useEffect(() => {
    const loadFromDb = async () => {
      await initPromise;
      const keys = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];
      const dbValues = await Promise.all(keys.map((k) => getSetting(k)));

      setSettingsState((prev) => {
        let hasChanges = false;
        const newSettings = { ...prev };

        keys.forEach((key, idx) => {
          const val = dbValues[idx];
          if (val !== null && JSON.stringify(val) !== JSON.stringify(prev[key])) {
            newSettings[key] = val as never;
            hasChanges = true;
          }
        });

        if (hasChanges) {
          localStorage.setItem(storageKey, JSON.stringify(newSettings));
          return newSettings;
        }
        return prev;
      });
    };

    loadFromDb();

    const channel = new BroadcastChannel("kei_db_sync");
    const sync = (data: any) => {
      if (data?.type === "DB_UPDATED" && data?.entity === "settings") {
        loadFromDb();
      }
    };
    const handleMessage = (e: MessageEvent) => sync(e.data);
    const handleCustomEvent = (e: Event) => sync((e as CustomEvent).detail);

    channel.addEventListener("message", handleMessage);
    window.addEventListener("kei_db_sync_local", handleCustomEvent);

    return () => {
      channel.removeEventListener("message", handleMessage);
      window.removeEventListener("kei_db_sync_local", handleCustomEvent);
      channel.close();
    };
  }, [storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;

    const applyThemeAndAccent = () => {
      root.classList.add("disable-transitions");

      // Update theme classes
      root.classList.remove("light", "dark");
      if (settings.theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(settings.theme);
      }

      // Update accent classes
      const classes = root.className.split(" ").filter((c) => !c.startsWith("theme-"));
      root.className = classes.join(" ").trim();
      root.classList.add(`theme-${settings.accent}`);

      // Allow browser to apply styles without transition, then re-enable
      setTimeout(() => {
        root.classList.remove("disable-transitions");
      }, 50);
    };

    applyThemeAndAccent();

    if (settings.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemChange = () => applyThemeAndAccent();

      mediaQuery.addEventListener("change", handleSystemChange);
      return () => mediaQuery.removeEventListener("change", handleSystemChange);
    }
  }, [settings.theme, settings.accent]);

  const value = useMemo(
    () => ({
      settings,
      updateSetting,
    }),
    [settings, updateSetting]
  );

  return <SettingsProviderContext value={value}>{children}</SettingsProviderContext>;
}
