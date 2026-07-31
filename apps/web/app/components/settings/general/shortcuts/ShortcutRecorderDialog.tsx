import React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Kbd,
  KbdGroup,
} from "@kreozalabs/kei-ui";
import { KeyboardIcon, RotateCcw } from "lucide-react";

import type { CommandShortcut } from "./types";
import { useShortcutRecorder } from "./useShortcutRecorder";
import { formatKeyForPlatform } from "./utils";

interface ShortcutRecorderDialogProps {
  selectedCommand: CommandShortcut | null;
  onClose: () => void;
  onSave: (pendingKeys: string[]) => void;
}

export function ShortcutRecorderDialog({
  selectedCommand,
  onClose,
  onSave,
}: ShortcutRecorderDialogProps) {
  const isOpen = !!selectedCommand;
  const { pendingKeys, clearPendingKeys } = useShortcutRecorder(isOpen);
  const recorderRef = React.useRef<HTMLDivElement>(null);

  const handleSave = () => {
    if (pendingKeys.length > 0) {
      onSave(pendingKeys);
    }
  };

  const handleRecorderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && pendingKeys.length > 0) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          recorderRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {selectedCommand
              ? `Add shortcut for "${selectedCommand.description}"`
              : "Create new shortcut"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Press the desired key combination to create a binding. Use Tab to move between buttons.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={recorderRef}
          tabIndex={0}
          role="region"
          aria-label="Shortcut recording area. Press desired keys to bind."
          onKeyDown={handleRecorderKeyDown}
          className="border-border bg-muted/30 focus-visible:ring-ring/50 focus-visible:border-ring my-4 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center outline-none focus-visible:ring-2"
        >
          {pendingKeys.length > 0 ? (
            <KbdGroup className="flex-wrap items-center justify-center gap-1.5">
              {pendingKeys.map((key, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground text-xs font-semibold select-none"
                    >
                      +
                    </span>
                  )}
                  <Kbd className="px-2.5 py-1 text-sm font-medium">{formatKeyForPlatform(key)}</Kbd>
                </React.Fragment>
              ))}
            </KbdGroup>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="bg-muted text-muted-foreground rounded-full p-2.5">
                <KeyboardIcon className="size-5" aria-hidden="true" />
              </div>
              <span className="text-muted-foreground text-sm font-medium">
                Press desired key combination...
              </span>
            </div>
          )}

          {pendingKeys.length > 0 && (
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground hover:text-foreground mt-1 gap-1 text-xs"
              onClick={clearPendingKeys}
              aria-label="Clear recorded key combination"
            >
              <RotateCcw className="size-3" aria-hidden="true" />
              Clear key combination
            </Button>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" disabled={pendingKeys.length === 0} onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
