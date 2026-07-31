import { useState } from "react";
import { INITIAL_COMMANDS } from "./constants";
import type { CommandShortcut } from "./types";
import { matchCommandShortcut } from "./utils";

export function useKeyboardShortcuts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [commands, setCommands] = useState<CommandShortcut[]>(INITIAL_COMMANDS);
  const [selectedCommandForAdd, setSelectedCommandForAdd] = useState<CommandShortcut | null>(null);

  const handleSaveNewShortcut = (pendingKeys: string[]) => {
    if (!selectedCommandForAdd || pendingKeys.length === 0) return;

    setCommands((prev) =>
      prev.map((cmd) =>
        cmd.id === selectedCommandForAdd.id
          ? { ...cmd, shortcuts: [...cmd.shortcuts, pendingKeys] }
          : cmd
      )
    );

    setSelectedCommandForAdd(null);
  };

  const handleRemoveShortcut = (commandId: string, indexToRemove: number) => {
    setCommands((prev) =>
      prev.map((cmd) =>
        cmd.id === commandId
          ? { ...cmd, shortcuts: cmd.shortcuts.filter((_, i) => i !== indexToRemove) }
          : cmd
      )
    );
  };

  const isCommandModified = (cmd: CommandShortcut) => {
    const initial = INITIAL_COMMANDS.find((item) => item.id === cmd.id);
    if (!initial) return false;
    return JSON.stringify(cmd.shortcuts) !== JSON.stringify(initial.shortcuts);
  };

  const handleResetSingleCommand = (commandId: string) => {
    const initial = INITIAL_COMMANDS.find((item) => item.id === commandId);
    if (!initial) return;
    setCommands((prev) =>
      prev.map((cmd) => (cmd.id === commandId ? { ...cmd, shortcuts: initial.shortcuts } : cmd))
    );
  };

  const handleResetAll = () => {
    setCommands(INITIAL_COMMANDS);
    setSearchQuery("");
  };

  const filteredCommands = commands.filter((cmd) => matchCommandShortcut(cmd, searchQuery));

  return {
    searchQuery,
    setSearchQuery,
    commands,
    filteredCommands,
    selectedCommandForAdd,
    setSelectedCommandForAdd,
    handleSaveNewShortcut,
    handleRemoveShortcut,
    handleResetSingleCommand,
    handleResetAll,
    isCommandModified,
  };
}
