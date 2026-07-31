import { useEffect, useState } from "react";
import { IGNORE_RECORDING_KEYS } from "./constants";

export function useShortcutRecorder(active: boolean) {
  const [pendingKeys, setPendingKeys] = useState<string[]>([]);
  const [prevActive, setPrevActive] = useState(active);

  // Reset pending keys during rendering when active state changes
  if (prevActive !== active) {
    setPrevActive(active);
    if (!active) {
      setPendingKeys([]);
    }
  }

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Escape to close dialog naturally
      if (e.key === "Escape") return;

      // Allow standalone Tab and Shift+Tab for focus navigation (preventing keyboard trap)
      if (e.key === "Tab" && !e.ctrlKey && !e.metaKey && !e.altKey) return;

      // If user is currently focused on an interactive button (Cancel, Save, Clear), allow normal button interactions
      const activeEl = document.activeElement;
      const isButtonFocused = activeEl && activeEl.tagName === "BUTTON";

      if (isButtonFocused) {
        if (e.key === "Enter" || e.key === " " || e.key.startsWith("Arrow")) {
          return;
        }
      }

      // Ignore modifier-only key presses
      if (IGNORE_RECORDING_KEYS.includes(e.key)) return;

      e.preventDefault();
      e.stopPropagation();

      const keys: string[] = [];
      if (e.metaKey || e.ctrlKey) {
        keys.push("Mod");
      }
      if (e.altKey) keys.push("Alt");
      if (e.shiftKey) keys.push("Shift");

      let keyName = e.key;
      if (keyName === " ") keyName = "Space";
      else if (keyName === "ArrowLeft") keyName = "ArrowLeft";
      else if (keyName === "ArrowRight") keyName = "ArrowRight";
      else if (keyName === "ArrowUp") keyName = "ArrowUp";
      else if (keyName === "ArrowDown") keyName = "ArrowDown";
      else if (keyName.length === 1) keyName = keyName.toUpperCase();

      keys.push(keyName);
      setPendingKeys(keys);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active]);

  const clearPendingKeys = () => setPendingKeys([]);

  return {
    pendingKeys,
    setPendingKeys,
    clearPendingKeys,
  };
}
