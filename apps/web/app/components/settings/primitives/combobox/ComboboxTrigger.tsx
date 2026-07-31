import * as React from "react";
import { Button, cn } from "@kreozalabs/kei-ui";
import { ChevronsUpDown, X } from "lucide-react";
import type { UseComboboxSelectReturn } from "./useComboboxSelect";

export interface ComboboxTriggerProps extends React.ComponentPropsWithoutRef<typeof Button> {
  combobox: UseComboboxSelectReturn;
  disabled?: boolean;
  clearable?: boolean;
  triggerClassName?: string;
}

export const ComboboxTrigger = React.forwardRef<HTMLButtonElement, ComboboxTriggerProps>(
  (
    {
      combobox,
      disabled = false,
      clearable = true,
      triggerClassName,
      className,
      children,
      id,
      "aria-labelledby": ariaLabelledBy,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const { open, displayLabel, isSelected, handleClear } = combobox;
    const defaultLabelledBy = id ? `${id}-label` : undefined;

    return (
      <Button
        ref={ref}
        id={id}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy || defaultLabelledBy}
        disabled={disabled}
        className={cn(
          "bg-background/80 border-border/60 hover:bg-background h-9 w-full justify-between px-3 text-sm font-normal shadow-xs transition-all",
          !isSelected && "text-muted-foreground",
          triggerClassName,
          className
        )}
        {...props}
      >
        {children ?? <span className="truncate">{displayLabel}</span>}
        <div className="ml-2 flex shrink-0 items-center gap-1">
          {clearable && isSelected && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear selection"
              className="text-muted-foreground hover:text-foreground cursor-pointer rounded-xs p-0.5 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleClear(e);
              }}
            >
              <X className="size-3.5" />
            </span>
          )}
          <ChevronsUpDown className="text-muted-foreground size-3.5 opacity-60" />
        </div>
      </Button>
    );
  }
);

ComboboxTrigger.displayName = "ComboboxTrigger";
