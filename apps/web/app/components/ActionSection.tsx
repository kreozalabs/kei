import { Button, cn } from "@kreozalabs/ui";
import type { Action } from "../types/events";
import { ActionItem } from "./ActionItem";
import { useState, useEffect } from "react";
import { ChevronDownIcon, SparklesIcon } from "lucide-react";

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
        <h2
          className="text-[14px] font-bold flex-1 tracking-tight flex items-center gap-2 text-foreground"
        >
          {sectionTitle}
          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground/70">
            {actions.length}
          </span>
        </h2>

        {!isTodayLocked && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="pl-0.5 size-6 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all active:scale-95 opacity-70 focus-visible:opacity-100 group-hover/section:opacity-100 -mr-1"
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
          "grid transition-all duration-300 ease-in-out",
          showContent ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="flex flex-col overflow-hidden">
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
            <div className="p-6 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground/50 border border-dashed border-border/50 rounded-lg mt-2 font-medium bg-muted/10">
              <SparklesIcon className="size-5 text-muted-foreground/40" />
              <p>All caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
