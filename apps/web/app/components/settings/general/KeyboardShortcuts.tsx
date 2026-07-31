import { useSettings } from "@/providers/SettingsContext";
import { Switch, cn } from "@kreozalabs/kei-ui";
import { KeyboardIcon } from "lucide-react";
import { SettingSection } from "../SettingSection";

import {
  ShortcutItemRow,
  ShortcutRecorderDialog,
  ShortcutSearchHeader,
  useKeyboardShortcuts,
} from "./shortcuts";

export function KeyboardShortcutsSettings() {
  const { settings, updateSetting } = useSettings();
  const isEnabled = settings.enable_keyboard_shortcuts ?? true;

  const {
    searchQuery,
    setSearchQuery,
    filteredCommands,
    selectedCommandForAdd,
    setSelectedCommandForAdd,
    handleSaveNewShortcut,
    handleRemoveShortcut,
    handleResetSingleCommand,
    handleResetAll,
    isCommandModified,
  } = useKeyboardShortcuts();

  return (
    <SettingSection
      title="Keyboard shortcuts"
      description="Manage application hotkeys and quick action key bindings."
      icon={<KeyboardIcon className="size-4" />}
      className="hidden md:block"
      action={
        <Switch
          checked={isEnabled}
          onCheckedChange={(val) => updateSetting("enable_keyboard_shortcuts", val)}
          aria-label="Enable keyboard shortcuts"
        />
      }
    >
      <div className={cn("transition-opacity", !isEnabled && "pointer-events-none opacity-50")}>
        <ShortcutSearchHeader
          isEnabled={isEnabled}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onResetAll={handleResetAll}
        />

        <div>
          <div className="divide-border divide-y">
            {filteredCommands.length === 0 ? (
              <div className="text-muted-foreground p-6 text-center text-sm">
                No matching commands or shortcuts found for &quot;{searchQuery}&quot;.
              </div>
            ) : (
              filteredCommands.map((command) => (
                <ShortcutItemRow
                  key={command.id}
                  command={command}
                  isModified={isCommandModified(command)}
                  onRemoveShortcut={handleRemoveShortcut}
                  onResetCommand={handleResetSingleCommand}
                  onAddShortcut={setSelectedCommandForAdd}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <ShortcutRecorderDialog
        selectedCommand={selectedCommandForAdd}
        onClose={() => setSelectedCommandForAdd(null)}
        onSave={handleSaveNewShortcut}
      />
    </SettingSection>
  );
}
