import { createContext, useContext } from "react";
import { DEFAULT_SETTINGS } from "../config/constants";
import type { Settings } from "../types/settings";

export interface SettingsProviderState {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export const initialState: SettingsProviderState = {
  settings: DEFAULT_SETTINGS,
  updateSetting: () => null,
};

export const SettingsProviderContext = createContext<SettingsProviderState>(initialState);

export const useSettings = () => {
  const context = useContext(SettingsProviderContext);
  if (context === undefined) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};
