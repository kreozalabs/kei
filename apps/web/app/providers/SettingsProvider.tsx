import * as React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { SettingsProviderContext } from "./SettingsContext";
import { DEFAULT_SETTINGS, SETTING_CATEGORIES, STORAGE_KEYS } from "@kreozalabs/kei-core";
import { getSetting, setSetting } from "@/db/settings";
import type { SettingCategory, Settings } from "@kreozalabs/kei-core";
import { initPromise } from "../db";

interface ThemeProviderProps {
  children: React.ReactNode;
  storageKey?: string;
}

export function SettingsProvider({
  children,
  storageKey = STORAGE_KEYS.SETTINGS,
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

  const updateSettings = useCallback(
    (partial: Partial<Settings>) => {
      setSettingsState((prev) => {
        const newSettings = { ...prev, ...partial };
        localStorage.setItem(storageKey, JSON.stringify(newSettings));
        return newSettings;
      });

      initPromise.then(() => {
        (Object.keys(partial) as (keyof Settings)[]).forEach((key) => {
          const val = partial[key];
          if (val !== undefined) {
            setSetting(key, val);
          }
        });
      });
    },
    [storageKey]
  );

  const resetSettings = useCallback(
    (keys?: readonly (keyof Settings)[]) => {
      const keysToReset = keys ?? (Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]);
      const resetPartial: Partial<Settings> = {};
      keysToReset.forEach((key) => {
        resetPartial[key] = DEFAULT_SETTINGS[key] as never;
      });
      updateSettings(resetPartial);
    },
    [updateSettings]
  );

  const resetCategory = useCallback(
    (category: SettingCategory) => {
      const keys = SETTING_CATEGORIES[category];
      if (keys) {
        resetSettings(keys);
      }
    },
    [resetSettings]
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

      // Update data attributes for display & motion settings
      root.setAttribute("data-motion", settings.animations || "smooth");
      root.setAttribute("data-minimal", settings.minimal_mode ? "true" : "false");
      root.setAttribute("data-behavior", settings.interface_behavior || "subtle_on_idle");
      root.setAttribute("data-density", settings.interface_density || "comfortable");
      root.setAttribute("data-grid-lines", settings.grid_lines || "subtle");

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
  }, [
    settings.theme,
    settings.accent,
    settings.animations,
    settings.minimal_mode,
    settings.interface_behavior,
    settings.interface_density,
    settings.grid_lines,
  ]);

  const value = useMemo(
    () => ({
      settings,
      updateSetting,
      updateSettings,
      resetSettings,
      resetCategory,
    }),
    [settings, updateSetting, updateSettings, resetSettings, resetCategory]
  );

  return <SettingsProviderContext value={value}>{children}</SettingsProviderContext>;
}
