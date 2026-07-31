import { KeyboardShortcutsSettings } from "./general/KeyboardShortcuts";
import { LocalizationSettings } from "./general/LocalizationSettings";

export function GeneralSettings() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-1 py-2 sm:px-2">
      <LocalizationSettings />
      <KeyboardShortcutsSettings />
    </div>
  );
}
