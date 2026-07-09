import { activeAdapter } from "./index";
import * as core from "@kreozalabs/kei-core";
import type { Settings } from "@kreozalabs/kei-core";

export const getSetting = <T>(key: keyof Settings) => core.getSetting<T>(key, activeAdapter);

export const setSetting = (key: keyof Settings, value: unknown) =>
  core.setSetting(key, value, activeAdapter.getDeviceId(), activeAdapter);

const initDefaultSettings = (defaults: Record<string, unknown>) =>
  core.initDefaultSettings(defaults, activeAdapter);

export const rebuildSettings = () => core.rebuildSettings(activeAdapter);
