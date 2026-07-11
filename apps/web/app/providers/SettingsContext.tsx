import { createContext, useContext } from "react";
import { DEFAULT_SETTINGS } from "@kreozalabs/kei-core";
import type { Settings } from "@kreozalabs/kei-core";

interface SettingsProviderState {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(
    key: K,
    value: Settings[K] | ((prev: Settings[K]) => Settings[K])
  ) => void;
}

const initialState: SettingsProviderState = {
  settings: DEFAULT_SETTINGS,
  updateSetting: () => null,
};

export const SettingsProviderContext = createContext<SettingsProviderState>(initialState);

export const useSettings = () => {
  const context = useContext(SettingsProviderContext);
  if (context === undefined) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};
