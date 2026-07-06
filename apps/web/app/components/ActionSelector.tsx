// FIXME: Refactor !
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
  childrenPosition?: "top" | "bottom";
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
  childrenPosition = "bottom",
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
            "border-border/30 hover:bg-muted/50 flex h-8 flex-row items-center justify-center gap-2 rounded-lg whitespace-nowrap transition-all outline-none",
            triggerClassName
          )}
        >
          {icon}
          <span className="text-muted-foreground/70 text-[12px] font-medium">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={cn(
          "border-border/40 bg-background custom-scrollbar max-h-80 w-45 overflow-x-hidden overflow-y-auto p-1 shadow-xl ring-0",
          contentClassName
        )}
      >
        {children && childrenPosition === "top" && (
          <>
            <div className="p-1">{children}</div>
            <div className="border-border/40 my-1 border-t" />
          </>
        )}
        <div ref={scrollRef}>
          {title && (
            <div className="text-muted-foreground/40 px-2 py-1.5 text-[10px] font-bold tracking-wider uppercase">
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
                  "hover:bg-muted/50 flex items-center gap-3 px-2.5 py-2 font-medium transition-colors outline-none",
                  option.className,
                  isScrollTarget && "bg-primary/5"
                )}
              >
                <div className="shrink-0">{option.icon}</div>
                <span className="flex-1 truncate text-[13px]">{option.label}</span>
                {isSelected && <CheckIcon className="text-primary ml-auto size-3.5 shrink-0" />}
              </DropdownMenuItem>
            );
          })}
        </div>
        {children && childrenPosition === "bottom" && (
          <>
            <div className="border-border/40 my-1 border-t" />
            <div className="p-1">{children}</div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
