import { Button, cn } from "@kreozalabs/ui";
import type { Action } from "../types/actions";
import { ActionItem } from "./ActionItem";
import { useState, useEffect } from "react";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { ActionInput } from "./action-input";
import { AnimatePresence } from "framer-motion";
import { ACTION_STATUS, STORAGE_KEYS } from "@/config/constants";
import { useSettings } from "@/providers/SettingsContext";

interface ActionSectionProps {
  id: string;
  sectionTitle: string;
  actions: Action[];
  isTodayLocked?: boolean;
  onComplete?: (action: Action) => void;
  onAbandon?: (action: Action) => void;
  onEdit?: (action: Action) => void;
  onReactivate?: (action: Action) => void;
  onDeletePermanently?: (action: Action) => void;
  sectionDate: string;
  defaultExpanded?: boolean;
  selectedActionIds?: Set<string>;
  onSelectToggle?: (id: string) => void;
  isBulkModeActive?: boolean;
  onMoveUp?: (action: Action) => void;
  onMoveDown?: (action: Action) => void;
  onMoveToPosition?: (action: Action, targetIndex: number) => void;
  onQuickReschedule?: (action: Action) => void;
}

export function ActionSection({
  id,
  sectionTitle,
  actions,
  isTodayLocked,
  onComplete,
  onAbandon,
  onEdit,
  onReactivate,
  onDeletePermanently,
  sectionDate,
  defaultExpanded,
  selectedActionIds,
  onSelectToggle,
  isBulkModeActive,
  onMoveUp,
  onMoveDown,
  onMoveToPosition,
  onQuickReschedule,
}: ActionSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== "undefined" && settings.remember_layout_on_refresh) {
      const stored = window.sessionStorage.getItem(STORAGE_KEYS.SESSION.SECTION_EXPANDED(id));
      if (stored !== null) return stored === "true";
    }
    return defaultExpanded ?? settings.section_expanded;
  });

  useEffect(() => {
    if (settings.remember_layout_on_refresh) {
      window.sessionStorage.setItem(STORAGE_KEYS.SESSION.SECTION_EXPANDED(id), String(isExpanded));
    } else {
      window.sessionStorage.removeItem(STORAGE_KEYS.SESSION.SECTION_EXPANDED(id));
    }
  }, [id, isExpanded, settings.remember_layout_on_refresh]);

  const totalActions = actions.length;
  const completedActionsCount = actions.filter((a) => a.status === ACTION_STATUS.COMPLETED).length;

  const showContent = isTodayLocked ? true : isExpanded;

  return (
    <div className="mb-8 group/section relative">
      <div className="sticky top-0 z-20 flex items-center gap-2 px-1 sm:px-2 py-3 border-b border-border/20 bg-background/95 backdrop-blur-sm -mx-1 sm:-mx-2 mb-2 transition-shadow">
        <div className="flex-1 flex items-center gap-2 overflow-hidden">
          <h2 className="text-[14px] font-bold tracking-wider text-muted-foreground/60 truncate flex items-center gap-2">
            <span>{sectionTitle}</span>
            {totalActions > 0 && (
              <span className="text-[10px] font-medium text-muted-foreground/40 tabular-nums px-1.5 py-0.5 bg-muted/30 rounded-md border border-border/10">
                {completedActionsCount}/{totalActions}
              </span>
            )}
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

          <div className="flex flex-col min-h-12 rounded-xl border border-dashed transition-all p-1 bg-muted/5 border-transparent hover:border-border/50">
            <div className="flex flex-col min-h-5">
              <AnimatePresence initial={false}>
                {(() => {
                  let activeCount = 0;
                  const activeActions = actions.filter((a) => a.status === ACTION_STATUS.ACTIVE);
                  const totalActiveCount = activeActions.length;

                  return actions.map((action) => {
                    const isActive = action.status === ACTION_STATUS.ACTIVE;
                    if (isActive) {
                      activeCount++;
                    }

                    return (
                      <ActionItem
                        key={action.id}
                        action={action}
                        type={action.status}
                        index={isActive ? activeCount : undefined}
                        onComplete={onComplete ?? (() => {})}
                        onAbandon={onAbandon ?? (() => {})}
                        onEdit={onEdit ?? (() => {})}
                        onReactivate={onReactivate}
                        onDeletePermanently={onDeletePermanently}
                        isSelected={selectedActionIds?.has(action.id)}
                        onSelectToggle={onSelectToggle}
                        isBulkModeActive={isBulkModeActive}
                        onMoveUp={onMoveUp}
                        onMoveDown={onMoveDown}
                        onMoveToPosition={onMoveToPosition}
                        onQuickReschedule={onQuickReschedule}
                        isFirstActive={isActive && activeCount === 1}
                        isLastActive={isActive && activeCount === totalActiveCount}
                      />
                    );
                  });
                })()}
              </AnimatePresence>
              {actions.length === 0 && (
                <div className="text-[11px] font-medium text-muted-foreground/30 p-3 text-center border border-dashed border-border/20 rounded-lg mx-1 mb-1">
                  No actions for this day
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
