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

export interface ActionSelectorOption<T = unknown> {
  label: string;
  value: T;
  icon?: React.ReactNode;
  className?: string;
}

export interface ActionSelectorProps<T = unknown> {
  icon?: React.ReactNode;
  label: React.ReactNode;
  options: ActionSelectorOption<T>[];
  onSelect: (value: T) => void;
  value?: T;
  scrollTargetValue?: T;
  variant?: "outline" | "ghost" | "secondary" | "default";
  triggerClassName?: string;
  contentClassName?: string;
  children?: React.ReactNode;
  title?: string;
  align?: "start" | "center" | "end";
}

function areValuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
  return false;
}

export function ActionSelector<T = unknown>({
  icon,
  label,
  options,
  onSelect,
  value,
  scrollTargetValue,
  variant = "outline",
  triggerClassName,
  contentClassName,
  children,
  title,
  align = "start",
}: ActionSelectorProps<T>) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Need a small timeout to let the dropdown render
      setTimeout(() => {
        const targetValue = value !== undefined ? value : scrollTargetValue;
        if (targetValue !== undefined) {
          const selectedElement = scrollRef.current?.querySelector("[data-selected='true']");
          if (selectedElement) {
            selectedElement.scrollIntoView({ block: "center", behavior: "auto" });
          }
        }
      }, 0);
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
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
        align={align}
        className={cn(
          "ring-0 p-1 shadow-xl border-border/40 bg-background w-45 overflow-y-auto overflow-x-hidden max-h-80 custom-scrollbar",
          contentClassName
        )}
      >
        <div ref={scrollRef}>
          {title && (
            <div className="px-2 py-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/40">
              {title}
            </div>
          )}
          {options.map((option, index) => {
            const isSelected =
              value !== undefined ? areValuesEqual(option.value, value) : label === option.label;
            const isScrollTarget =
              !isSelected && scrollTargetValue !== undefined
                ? areValuesEqual(option.value, scrollTargetValue)
                : false;

            return (
              <DropdownMenuItem
                key={index}
                onClick={() => onSelect(option.value)}
                data-selected={isSelected || isScrollTarget}
                className={cn(
                  "flex items-center gap-3 px-2.5 py-2 font-medium hover:bg-muted/50 outline-none transition-colors",
                  option.className,
                  isScrollTarget && "bg-primary/5"
                )}
              >
                <div className="shrink-0">{option.icon}</div>
                <span className="text-[13px] flex-1 truncate">{option.label}</span>
                {isSelected && <CheckIcon className="size-3.5 text-primary ml-auto shrink-0" />}
              </DropdownMenuItem>
            );
          })}
        </div>
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
