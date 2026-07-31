import React from "react";
import { Button, Kbd, KbdGroup } from "@kreozalabs/kei-ui";
import { MinusCircle } from "lucide-react";
import { formatKeyForPlatform } from "./utils";

interface ShortcutKeyBadgeProps {
  keys: string[];
  onRemove: () => void;
}

export function ShortcutKeyBadge({ keys, onRemove }: ShortcutKeyBadgeProps) {
  const isSequence = keys.includes(">");

  return (
    <div className="flex items-center gap-2">
      <KbdGroup className="flex-wrap items-center gap-1">
        {keys.map((k, kIdx) => {
          if (k === ">") {
            return (
              <span
                key={kIdx}
                aria-hidden="true"
                className="text-muted-foreground px-1 text-sm font-semibold select-none"
              >
                &gt;
              </span>
            );
          }

          return (
            <React.Fragment key={kIdx}>
              {kIdx > 0 && !isSequence && keys[kIdx - 1] !== ">" && (
                <span
                  aria-hidden="true"
                  className="text-muted-foreground px-0.5 text-sm font-semibold select-none"
                >
                  +
                </span>
              )}
              <Kbd>{formatKeyForPlatform(k)}</Kbd>
            </React.Fragment>
          );
        })}
      </KbdGroup>
      <Button
        variant="ghost"
        size="icon-xs"
        className="text-muted-foreground hover:text-destructive size-6 shrink-0 transition-colors"
        onClick={onRemove}
        title="Remove key combination"
        aria-label="Remove key combination"
      >
        <MinusCircle className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
