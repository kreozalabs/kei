import { getOrCreateDeviceIdentity } from "@/utils/device";
import { activeAdapter } from "./index";
import * as core from "@kreozalabs/core";
import type { Settings } from "@kreozalabs/core";

const getDeviceId = () => {
  if (typeof window !== "undefined") {
    return getOrCreateDeviceIdentity();
  }
  return "server-ssr";
};

export const getSetting = <T>(key: keyof Settings) => core.getSetting<T>(key, activeAdapter);

export const setSetting = (key: keyof Settings, value: unknown) =>
  core.setSetting(key, value, getDeviceId(), activeAdapter);

export const initDefaultSettings = (defaults: Record<string, unknown>) =>
  core.initDefaultSettings(defaults, activeAdapter);

export const rebuildSettings = () => core.rebuildSettings(activeAdapter);
