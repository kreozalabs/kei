import { Button, cn } from "@kreozalabs/ui";
import type { Action } from "../types/events";
import { ActionItem } from "./ActionItem";
import { useState, useEffect } from "react";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { ActionInput } from "./ActionInput";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

interface ActionListProps {
  id: string;
  sectionTitle: string;
  actions: Action[];
  isTodayLocked?: boolean;
  onComplete?: (action: Action) => void;
  onAbandon?: (action: Action) => void;
  onEdit?: (action: Action) => void;
  sectionDate: string;
}

export function ActionSection({
  id,
  sectionTitle,
  actions,
  isTodayLocked,
  onComplete,
  onAbandon,
  onEdit,
  sectionDate,
}: ActionListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { setNodeRef: setSectionRef, isOver } = useDroppable({
    id: `section-${sectionDate}`,
    data: {
      type: "section",
      date: sectionDate,
    },
  });

  // TODO: Allow user to set settings if he wants to save state at all.
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.sessionStorage.getItem(`kei-section-expanded-${id}`);
      if (stored !== null) return stored === "true";
    }
    return true; // NOTE: Default to expanded
  });

  useEffect(() => {
    window.sessionStorage.setItem(`kei-section-expanded-${id}`, String(isExpanded));
  }, [id, isExpanded]);

  const showContent = isTodayLocked ? true : isExpanded;

  return (
    <div className="mb-6 group/section">
      <div className="flex items-center gap-2 px-1 sm:px-2 border-b border-border/20 pb-2 mb-1 min-h-10">
        <div className="flex-1 flex items-center gap-2 overflow-hidden">
          <h2 className="text-[14px] font-bold tracking-tight text-muted-foreground/70 truncate">
            {sectionTitle}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAdding(true);
              setIsExpanded(true);
            }}
            className="size-6 p-0 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all opacity-50 group-hover/section:opacity-100 flex items-center justify-center shrink-0"
            title="Add Action"
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
        {!isTodayLocked && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="size-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95 opacity-70 group-hover/section:opacity-100 -mr-1"
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
          "grid transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]",
          showContent ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="flex flex-col overflow-hidden">
          {isAdding && (
            <div className="mt-2 mb-4">
              <ActionInput
                variant="inline"
                initialDate={sectionDate}
                onSuccess={() => setIsAdding(false)}
                onCancel={() => setIsAdding(false)}
              />
            </div>
          )}

          <div
            ref={setSectionRef}
            className={cn(
              "flex flex-col min-h-12 rounded-xl border border-dashed transition-all p-1",
              isOver
                ? "bg-primary/5 border-primary/40 ring-1 ring-primary/10"
                : "bg-muted/5 border-transparent hover:border-border/50"
            )}
          >
            <SortableContext
              items={actions.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col min-h-5">
                {actions.map((action) => (
                  <ActionItem
                    key={action.id}
                    action={action}
                    type={action.status === "completed" ? "completed" : "active"}
                    onComplete={onComplete ?? (() => {})}
                    onAbandon={onAbandon ?? (() => {})}
                    onEdit={onEdit ?? (() => {})}
                  />
                ))}
                {actions.length === 0 && (
                  <div className="text-[11px] font-medium text-muted-foreground/30 p-3 text-center border border-dashed border-border/20 rounded-lg mx-1 mb-1">
                    No actions for this day
                  </div>
                )}
              </div>
            </SortableContext>
          </div>
        </div>
      </div>
    </div>
  );
}
