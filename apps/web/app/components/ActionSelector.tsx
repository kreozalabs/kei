import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
  cn,
} from "@kreozalabs/ui";
import { CheckIcon } from "lucide-react";

export interface ActionSelectorOption<T = any> {
  label: string;
  value: T;
  icon?: React.ReactNode;
  className?: string;
}

export interface ActionSelectorProps<T = any> {
  icon?: React.ReactNode;
  label: string;
  options: ActionSelectorOption<T>[];
  onSelect: (value: T) => void;
  value?: T;
  variant?: "outline" | "ghost" | "secondary" | "default";
  triggerClassName?: string;
  contentClassName?: string;
  children?: React.ReactNode;
}

function areValuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
  return false;
}

export function ActionSelector<T = any>({
  icon,
  label,
  options,
  onSelect,
  value,
  variant = "outline",
  triggerClassName,
  contentClassName,
  children,
}: ActionSelectorProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size="sm"
          className={cn(
            "h-8 flex flex-row items-center justify-center gap-2 rounded-lg border-border/30 hover:bg-muted/50 transition-all outline-none whitespace-nowrap",
            triggerClassName
          )}
        >
          {icon}
          <span className="text-[12px] font-medium text-muted-foreground/70">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn("ring-0 p-1 shadow-xl border-border/40 bg-background w-45", contentClassName)}
      >
        {options.map((option, index) => {
          const isSelected =
            value !== undefined ? areValuesEqual(option.value, value) : label === option.label;
          return (
            <DropdownMenuItem
              key={index}
              onClick={() => onSelect(option.value)}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 font-medium hover:bg-muted/50 outline-none transition-colors",
                option.className
              )}
            >
              <div className="shrink-0">{option.icon}</div>
              <span className="text-[13px] flex-1 truncate">{option.label}</span>
              {isSelected && <CheckIcon className="size-3.5 text-primary ml-auto shrink-0" />}
            </DropdownMenuItem>
          );
        })}
        {children && (
          <>
            <div className="my-1 border-t border-border/40" />
            <div className="p-1">{children}</div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
