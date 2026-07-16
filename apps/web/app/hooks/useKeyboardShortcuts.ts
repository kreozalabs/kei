import { useMemo } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface ShortcutConfig {
  /**
   * The key to trigger the shortcut (e.g., 'b', 'k', 'Enter').
   * Case-insensitive. Space-separated for sequences.
   */
  key: string;
  /**
   * Whether the Ctrl key (Windows/Linux) or Command key (Mac) must be pressed.
   */
  ctrlOrMeta?: boolean;
  /**
   * Whether the Alt key must be pressed.
   */
  alt?: boolean;
  /**
   * Whether the Shift key must be pressed.
   */
  shift?: boolean;
  /**
   * Callback when the shortcut is triggered.
   */
  handler: (event: KeyboardEvent) => void;
  /**
   * Optional description for documentation or UI hints.
   */
  description?: string;
  /**
   * Whether to allow triggering even when focused on an input.
   * Default is false.
   */
  allowInInputs?: boolean;
}

function getHotkeyValue(shortcut: ShortcutConfig): string {
  const parts: string[] = [];
  if (shortcut.ctrlOrMeta) {
    parts.push("mod");
  }
  if (shortcut.alt) {
    parts.push("alt");
  }
  if (shortcut.shift) {
    parts.push("shift");
  }

  const cleanKey = shortcut.key.trim().toLowerCase();
  if (cleanKey.includes(" ")) {
    parts.push(cleanKey.split(/\s+/).join(">"));
  } else {
    parts.push(cleanKey);
  }
  return parts.join("+");
}

/**
 * A hook to register global keyboard shortcuts using react-hotkeys-hook.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const hotkeyMap = useMemo(() => {
    return shortcuts.map((s) => ({
      hotkey: getHotkeyValue(s),
      shortcut: s,
    }));
  }, [shortcuts]);

  const hotkeysList = useMemo(() => hotkeyMap.map((h) => h.hotkey), [hotkeyMap]);

  useHotkeys(
    hotkeysList,
    (event, handler) => {
      const target = event.target as HTMLElement;
      const isInput =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;

      const matched = hotkeyMap.find((h) => h.hotkey === handler.hotkey);
      if (matched) {
        if (isInput && !matched.shortcut.allowInInputs) {
          return;
        }
        event.preventDefault();
        matched.shortcut.handler(event);
      }
    },
    {
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
    [hotkeyMap]
  );
}
