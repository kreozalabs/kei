import { Badge, Button } from "@kreozalabs/kei-ui";
import { Plus, RotateCcw } from "lucide-react";
import { ShortcutKeyBadge } from "./ShortcutKeyBadge";
import type { CommandShortcut } from "./types";

interface ShortcutItemRowProps {
  command: CommandShortcut;
  isModified: boolean;
  onRemoveShortcut: (commandId: string, indexToRemove: number) => void;
  onResetCommand: (commandId: string) => void;
  onAddShortcut: (command: CommandShortcut) => void;
}

export function ShortcutItemRow({
  command,
  isModified,
  onRemoveShortcut,
  onResetCommand,
  onAddShortcut,
}: ShortcutItemRowProps) {
  return (
    <div className="hover:bg-muted/30 grid grid-cols-12 items-center gap-4 p-3.5 text-sm transition-colors">
      {/* Column 1: Command Title & Category */}
      <div className="col-span-12 flex flex-col gap-1 sm:col-span-4">
        <span className="text-foreground font-medium">{command.description}</span>
        <Badge variant="outline" className="text-muted-foreground w-fit text-sm font-medium">
          {command.category}
        </Badge>
      </div>

      {/* Column 2: Shortcuts List */}
      <div className="col-span-12 flex flex-col gap-2 sm:col-span-6">
        {command.shortcuts.length === 0 && (
          <span className="text-muted-foreground py-0.5 text-sm italic">No shortcut assigned</span>
        )}

        {command.shortcuts.map((keys, sIdx) => (
          <ShortcutKeyBadge
            key={sIdx}
            keys={keys}
            onRemove={() => onRemoveShortcut(command.id, sIdx)}
          />
        ))}
      </div>

      {/* Column 3: Row Actions (Reset per field + Add) */}
      <div className="col-span-12 flex items-center justify-end gap-1.5 sm:col-span-2">
        {isModified && (
          <Button
            size="xs"
            variant="ghost"
            onClick={() => onResetCommand(command.id)}
            className="text-muted-foreground hover:text-foreground h-7 gap-1 px-2 text-sm"
            title="Reset this shortcut to default"
            aria-label={`Reset shortcut for ${command.description} to default`}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Reset
          </Button>
        )}
        <Button
          size="xs"
          variant="ghost"
          onClick={() => onAddShortcut(command)}
          className="h-7 gap-1 px-2.5 text-sm"
          aria-label={`Add shortcut for ${command.description}`}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Add
        </Button>
      </div>
    </div>
  );
}
