import { useState, useEffect, useCallback } from "react";
import { useSettings } from "@/providers/SettingsContext";

type StorageType = "local" | "session";

function getStorage(type: StorageType): Storage | null {
  if (typeof window === "undefined") return null;
  return type === "session" ? window.sessionStorage : window.localStorage;
}

function parseStoredValue<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as unknown as T;
  }
}

/**
 * Gets a remembered item from storage if remember_layout_on_refresh setting is enabled.
 */
export function getRememberedItem<T>(
  key: string,
  storageType: StorageType = "local",
  rememberEnabled: boolean = true
): T | null {
  if (!rememberEnabled) return null;
  const storage = getStorage(storageType);
  if (!storage) return null;
  const raw = storage.getItem(key);
  if (raw === null) return null;
  return parseStoredValue<T>(raw);
}

/**
 * Sets or removes a remembered item in storage depending on remember_layout_on_refresh setting.
 */
export function setRememberedItem<T>(
  key: string,
  value: T,
  storageType: StorageType = "local",
  rememberEnabled: boolean = true
): void {
  const storage = getStorage(storageType);
  if (!storage) return;

  if (rememberEnabled) {
    try {
      const valStr = typeof value === "string" ? value : JSON.stringify(value);
      storage.setItem(key, valStr);
    } catch {
      // ignore write errors
    }
  } else {
    try {
      storage.removeItem(key);
    } catch {
      // ignore remove errors
    }
  }
}

/**
 * Custom React Hook that persists state in local or session storage when
 * settings.remember_layout_on_refresh is enabled.
 */
export function useRememberedState<T>(
  key: string,
  initialValue: T | (() => T),
  storageType: StorageType = "local"
): [T, (val: T | ((prev: T) => T)) => void] {
  const { settings } = useSettings();
  const rememberEnabled = settings.remember_layout_on_refresh ?? false;

  const [state, setState] = useState<T>(() => {
    const stored = getRememberedItem<T>(key, storageType, rememberEnabled);
    if (stored !== null) return stored;
    return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue;
  });

  useEffect(() => {
    setRememberedItem(key, state, storageType, rememberEnabled);
  }, [key, state, storageType, rememberEnabled]);

  const updateState = useCallback((val: T | ((prev: T) => T)) => {
    setState((prev) => (typeof val === "function" ? (val as (prev: T) => T)(prev) : val));
  }, []);

  return [state, updateState];
}
