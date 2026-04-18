import { Button, cn } from "@kreozalabs/ui";
import type { Action } from "../types/events";
import { ActionItem } from "./ActionItem";
import { useState, useEffect } from "react";
import { ChevronDownIcon, SparklesIcon, PlusIcon } from "lucide-react";

interface ActionListProps {
  id: string;
  sectionTitle: string;
  actions: Action[];
  isTodayLocked?: boolean;
  onComplete?: (action: Action) => void;
  onAbandon?: (action: Action) => void;
  onAddAction?: () => void;
}

export function ActionSection({ 
  id, 
  sectionTitle, 
  actions, 
  isTodayLocked, 
  onComplete, 
  onAbandon,
  onAddAction 
}: ActionListProps) {
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

  const showContent = isTodayLocked ? true : isExpanded;

  return (
    <div className="mb-6 group/section">
      <div className="flex items-center gap-2 px-1 sm:px-2 border-b border-border/20 pb-2 mb-1">
        <h2
          className="text-[14px] font-bold flex-1 tracking-tight flex items-center gap-2 text-foreground"
        >
          {sectionTitle}
        </h2>

        {!isTodayLocked && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="size-6 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-all active:scale-95 opacity-0 group-hover/section:opacity-100 -mr-1"
            title={isExpanded ? "Collapse section" : "Expand section"}
          >
            <ChevronDownIcon
              className={cn(
                "size-4 transition-transform duration-200",
                !showContent && "rotate-[-90deg]"
              )}
            />
          </Button>
        )}
      </div>

      <div
        className={cn(
          "grid transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]",
          showContent ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="flex flex-col overflow-hidden">
          {actions.map((action) => (
            <ActionItem
              key={action.id}
              action={action}
              type="active"
              onComplete={onComplete ?? (() => {})}
              onAbandon={onAbandon ?? (() => {})}
            />
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddAction}
            className="justify-start gap-2 h-9 px-1 text-muted-foreground/60 hover:text-primary hover:bg-transparent -ml-1 transition-colors group/add"
          >
            <div className="flex items-center justify-center size-5 rounded-full text-primary group-hover/add:bg-primary group-hover/add:text-primary-foreground transition-all">
               <PlusIcon className="size-3.5" />
            </div>
            <span className="text-[13px] font-medium">Add task</span>
          </Button>

          {actions.length === 0 && showContent && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground/30 font-medium">
              <SparklesIcon className="size-5" />
              <p>No tasks for this day.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
