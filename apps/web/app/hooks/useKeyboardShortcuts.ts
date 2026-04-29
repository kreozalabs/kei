import { useEffect } from "react";

export interface ShortcutConfig {
  /**
   * The key to trigger the shortcut (e.g., 'b', 'k', 'Enter').
   * Case-insensitive.
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

/**
 * A hook to register global keyboard shortcuts.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 1. Check if we should ignore this event (e.g., focused in an input)
      const target = event.target as HTMLElement;
      const isInput =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      for (const shortcut of shortcuts) {
        if (isInput && !shortcut.allowInInputs) {
          continue;
        }

        // 2. Match modifiers
        const matchesCtrlMeta = shortcut.ctrlOrMeta
          ? event.ctrlKey || event.metaKey
          : !(event.ctrlKey || event.metaKey);
        
        const matchesAlt = !!shortcut.alt === event.altKey;
        const matchesShift = !!shortcut.shift === event.shiftKey;
        
        // 3. Match key
        // We check both key and code to be more robust (e.g., 'KeyB' or 'b')
        const pressedKey = event.key.toLowerCase();
        const targetKey = shortcut.key.toLowerCase();
        
        const matchesKey = pressedKey === targetKey || event.code.toLowerCase() === `key${targetKey}`;

        if (matchesCtrlMeta && matchesAlt && matchesShift && matchesKey) {
          // Found a match!
          event.preventDefault();
          shortcut.handler(event);
          return; // Stop after first match
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
