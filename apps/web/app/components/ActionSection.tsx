import { Button, cn } from "@kreozalabs/ui";
import type { Action } from "../types/events";
import { ActionItem } from "./ActionItem";
import { useState, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";

interface ActionListProps {
  id: string;
  sectionTitle: string;
  actions: Action[];
  isTodayLocked?: boolean;
}

export function ActionSection({ id, sectionTitle, actions, isTodayLocked }: ActionListProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.sessionStorage.getItem(`kei-section-expanded-${id}`);
      if (stored !== null) return stored === "true";
    }
    return true; // Default to expanded
  });

  useEffect(() => {
    window.sessionStorage.setItem(`kei-section-expanded-${id}`, String(isExpanded));
  }, [id, isExpanded]);

  // If locked to today, always show. Otherwise, rely on user expansion preference.
  const showContent = isTodayLocked ? true : isExpanded;

  return (
    <div className="mb-8 group/section">
      <div className="flex items-center gap-2 mb-2 px-1 sm:px-2 border-b border-border/40 pb-2">
        <h2 className="text-[14px] font-bold text-foreground flex-1 tracking-tight">
          {sectionTitle}
        </h2>

        {!isTodayLocked && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="size-6 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all active:scale-95 opacity-70 focus-visible:opacity-100 group-hover/section:opacity-100 -mr-1"
            title={isExpanded ? "Collapse section" : "Expand section"}
          >
            <ChevronDownIcon
              className={cn(
                "size-4 transition-transform duration-200",
                !showContent && "rotate-90"
              )}
            />
          </Button>
        )}
      </div>

      <div
        className={cn(
          "flex flex-col origin-top overflow-hidden transition-all duration-300",
          showContent ? "opacity-100 max-h-auto" : "opacity-0 max-h-0"
        )}
      >
        {actions.map((action) => (
          <ActionItem
            key={action.id}
            action={action}
            type="active"
            onComplete={() => {}}
            onAbandon={() => {}}
          />
        ))}
        {actions.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground/50 border border-dashed rounded-lg mt-2 font-medium">
            No active initiatives.
          </div>
        )}
      </div>
    </div>
  );
}
