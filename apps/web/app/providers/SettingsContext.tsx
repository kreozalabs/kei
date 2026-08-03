import { createContext, use } from "react";
import { DEFAULT_SETTINGS } from "@kreozalabs/kei-core";
import type { SettingCategory, Settings } from "@kreozalabs/kei-core";

interface SettingsProviderState {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(
    key: K,
    value: Settings[K] | ((prev: Settings[K]) => Settings[K])
  ) => void;
  updateSettings: (partial: Partial<Settings>) => void;
  resetSettings: (keys?: readonly (keyof Settings)[]) => void;
  resetCategory: (category: SettingCategory) => void;
}

const initialState: SettingsProviderState = {
  settings: DEFAULT_SETTINGS,
  updateSetting: () => null,
  updateSettings: () => null,
  resetSettings: () => null,
  resetCategory: () => null,
};

export const SettingsProviderContext = createContext<SettingsProviderState>(initialState);

export const useSettings = () => {
  const context = use(SettingsProviderContext);
  if (context === undefined) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};
