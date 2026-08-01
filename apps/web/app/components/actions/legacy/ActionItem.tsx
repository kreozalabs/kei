// FIXME: Refactor !
import { useState } from "react";
import type { Action, ActionStatus } from "@kreozalabs/kei-core";
import { Button, cn, Checkbox, Input } from "@kreozalabs/kei-ui";
import {
  Trash2Icon,
  CheckCircle2Icon,
  CalendarIcon,
  Star,
  ChevronUp,
  ChevronDown,
  Clock,
  RotateCcw,
  PencilIcon,
  MoreVertical,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Heart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@kreozalabs/kei-ui";
import { NextDayBadge } from "@/components/NextDayBadge";
import { useSettings } from "@/providers/SettingsContext";
import { getNextDayString } from "@kreozalabs/kei-core";
import { useLocalization } from "@/hooks/useLocalization";
import { useCurrentDay } from "@/hooks/useCurrentDay";

import {
  ACTION_STATUS,
  ENERGY_LEVELS,
  ENERGY_OPTIONS,
  INTENTIONS,
  INTENTION_OPTIONS,
  IMPORTANT_CONFIG,
} from "@kreozalabs/kei-core";
import { motion } from "framer-motion";

interface ActionItemProps {
  action: Action;
  type: ActionStatus;
  onComplete: (action: Action) => void;
  onAbandon: (action: Action) => void;
  onEdit: (action: Action) => void;
  onReactivate?: (action: Action) => void;
  onDeletePermanently?: (action: Action) => void;
  isSelected?: boolean;
  onSelectToggle?: (id: string) => void;
  isBulkModeActive?: boolean;
  index?: number;
  onMoveUp?: (action: Action) => void;
  onMoveDown?: (action: Action) => void;
  onMoveToPosition?: (action: Action, targetIndex: number) => void;
  onQuickReschedule?: (action: Action) => void;
  isFirstActive?: boolean;
  isLastActive?: boolean;
}

export function ActionItem({
  action,
  type,
  onComplete,
  onAbandon,
  onEdit,
  onReactivate,
  onDeletePermanently,
  isSelected = false,
  onSelectToggle,
  isBulkModeActive = false,
  index,
  onMoveUp,
  onMoveDown,
  onMoveToPosition,
  onQuickReschedule,
  isFirstActive = false,
  isLastActive = false,
}: ActionItemProps) {
  const { settings } = useSettings();
  const { formatTime } = useLocalization();

  const [isEditingIndex, setIsEditingIndex] = useState(false);
  const [editIndexValue, setEditIndexValue] = useState(String(index || ""));
  const [prevIndex, setPrevIndex] = useState(index);

  if (index !== prevIndex) {
    setPrevIndex(index);
    setEditIndexValue(String(index || ""));
  }

  const energyConfig = ENERGY_OPTIONS.find((opt) => opt.value === action.energy?.toLowerCase());
  const intentionConfig =
    INTENTION_OPTIONS.find((opt) => opt.value === action.intention) || INTENTION_OPTIONS[0];
  const todayString = useCurrentDay();
  const isOverdue = action.scheduledDate < todayString;
  const isDefaultEnergy = action.energy === (settings.default_energy || "medium");
  const shouldShowEnergy = settings.show_default_energy || !isDefaultEnergy;

  const rescheduleLabel = (() => {
    if (isOverdue) {
      return "Reschedule to Today";
    }
    if (action.scheduledDate === todayString) {
      return "Reschedule to Tomorrow";
    }
    try {
      const nextDateStr = getNextDayString(action.scheduledDate);
      const nextDate = new Date(nextDateStr + "T12:00:00");
      const weekday = nextDate.toLocaleDateString("en-US", { weekday: "long" });
      return `Reschedule to ${weekday}`;
    } catch {
      return "Reschedule to Next Day";
    }
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{
        opacity:
          type === ACTION_STATUS.COMPLETED ? 0.5 : type === ACTION_STATUS.ABANDONED ? 0.45 : 1,
        height: "auto",
        y: 0,
      }}
      exit={{ opacity: 0, height: 0, y: 10 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        opacity: { duration: 0.15 },
        height: { duration: 0.2 },
      }}
      className={cn(
        "group border-border/40 relative flex cursor-default items-start gap-2 overflow-hidden border-b px-1 py-2.5 transition-colors last:border-none sm:px-2",
        type === ACTION_STATUS.COMPLETED
          ? "opacity-50"
          : type === ACTION_STATUS.ABANDONED
            ? "bg-rose-500/1 italic opacity-45"
            : "hover:bg-muted/10"
      )}
    >
      {/* Reorder Arrows */}
      {type === ACTION_STATUS.ACTIVE && (
        <div
          className={cn(
            "flex h-10.5 shrink-0 flex-col items-center gap-0.5 overflow-hidden transition-all duration-200",
            isBulkModeActive
              ? "pointer-events-none w-0 opacity-0 md:w-5"
              : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
          )}
        >
          {!isBulkModeActive && (
            <>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  if (e.shiftKey) {
                    onMoveToPosition?.(action, 1);
                  } else {
                    onMoveUp?.(action);
                  }
                }}
                disabled={isFirstActive}
                className="text-muted-foreground/70 lg:text-muted-foreground/50 hover:text-primary hover:bg-primary/10 size-5 rounded-md transition-all active:scale-90 disabled:opacity-0"
                title="Move up (Shift-click to move to top)"
              >
                <ChevronUp className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  if (e.shiftKey) {
                    onMoveToPosition?.(action, Infinity);
                  } else {
                    onMoveDown?.(action);
                  }
                }}
                disabled={isLastActive}
                className="text-muted-foreground/70 lg:text-muted-foreground/50 hover:text-primary hover:bg-primary/10 size-5 rounded-md transition-all active:scale-90 disabled:opacity-0"
                title="Move down (Shift-click to move to bottom)"
              >
                <ChevronDown className="size-3.5" />
              </Button>
            </>
          )}
        </div>
      )}

      {settings.enable_selection && (
        <div
          className={cn(
            "mt-0.5 flex h-5 shrink-0 items-center justify-center transition-all duration-200",
            isBulkModeActive || isSelected
              ? "pointer-events-auto w-5 opacity-100"
              : settings.show_checkboxes_on_hover
                ? "pointer-events-none w-0 opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 md:w-5"
                : "pointer-events-none w-0 opacity-0"
          )}
        >
          <Checkbox checked={isSelected} onCheckedChange={() => onSelectToggle?.(action.id)} />
        </div>
      )}

      <div
        className={cn(
          "flex min-w-0 flex-1 items-start transition-all duration-200",
          isBulkModeActive ? "gap-0 md:gap-2" : "gap-2"
        )}
      >
        <div
          className={cn(
            "mt-0.5 flex shrink-0 items-center justify-center transition-all duration-200",
            isBulkModeActive
              ? "pointer-events-none w-0 overflow-hidden opacity-0 md:size-5 md:overflow-visible"
              : "size-5 overflow-visible opacity-100"
          )}
        >
          {type === ACTION_STATUS.ACTIVE ? (
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onComplete(action);
              }}
              className={cn(
                "group/check flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] bg-transparent p-0 shadow-none transition-all hover:scale-110",
                energyConfig?.color || "text-muted-foreground",
                energyConfig?.bg.split(" ")[1] || "border-border/40"
              )}
              title="Mark as completed"
            >
              <CheckCircle2Icon
                className={cn(
                  "size-3.5 opacity-0 transition-all duration-300 group-hover/check:opacity-100",
                  "group-hover/check:scale-110 group-active/check:scale-90"
                )}
              />
            </Button>
          ) : type === ACTION_STATUS.ABANDONED ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onReactivate?.(action);
              }}
              className="hover:bg-primary/10 flex size-5 shrink-0 items-center justify-center rounded-full p-0 transition-all duration-300 active:scale-90"
              title="Reactivate task"
            >
              <RotateCcw className="size-3.5 text-rose-500" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onComplete(action);
              }}
              className="hover:bg-primary/10 group/uncheck flex size-5 shrink-0 items-center justify-center rounded-full p-0 transition-all duration-300 active:scale-90"
              title="Unmark as completed"
            >
              <CheckCircle2Icon className="text-primary animate-in zoom-in size-4 duration-300 group-hover/uncheck:hidden" />
              <RotateCcw className="text-primary animate-in spin-in-180 hidden size-3.5 duration-300 group-hover/uncheck:block" />
            </Button>
          )}
        </div>

        <div
          className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5"
          onClick={(e) => {
            if (isBulkModeActive && onSelectToggle) {
              e.stopPropagation();
              onSelectToggle(action.id);
            } else {
              onEdit(action);
            }
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-col">
              <span
                className={cn(
                  "relative flex-1 truncate text-[14px] leading-[1.4] font-medium transition-colors",
                  type === ACTION_STATUS.COMPLETED
                    ? "text-muted-foreground"
                    : type === ACTION_STATUS.ABANDONED
                      ? "text-rose-500/60"
                      : "text-foreground"
                )}
              >
                {index !== undefined && (
                  <span
                    className="mr-1.5 inline-block w-5 shrink-0 select-none"
                    onClick={(e) => {
                      if (type === ACTION_STATUS.ACTIVE && !isBulkModeActive) {
                        e.stopPropagation();
                        setIsEditingIndex(true);
                      }
                    }}
                  >
                    {isEditingIndex ? (
                      <Input
                        type="text"
                        value={editIndexValue}
                        onChange={(e) => setEditIndexValue(e.target.value)}
                        onBlur={() => {
                          setIsEditingIndex(false);
                          const val = parseInt(editIndexValue, 10);
                          if (!isNaN(val) && val !== index) {
                            onMoveToPosition?.(action, val);
                          } else {
                            setEditIndexValue(String(index));
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsEditingIndex(false);
                            const val = parseInt(editIndexValue, 10);
                            if (!isNaN(val) && val !== index) {
                              onMoveToPosition?.(action, val);
                            } else {
                              setEditIndexValue(String(index));
                            }
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsEditingIndex(false);
                            setEditIndexValue(String(index));
                          }
                        }}
                        autoFocus
                        className="border-primary bg-background h-5 w-6 rounded border p-0 text-center text-[10px] font-black focus-visible:ring-0"
                      />
                    ) : (
                      <span
                        className={cn(
                          "text-muted-foreground/70 lg:text-muted-foreground/40 text-[11px] font-bold tabular-nums transition-colors",
                          !isBulkModeActive && "hover:text-primary cursor-pointer hover:font-black"
                        )}
                        title={!isBulkModeActive ? "Click to change order position" : undefined}
                      >
                        {index}
                      </span>
                    )}
                  </span>
                )}
                {action.title}
                {/* Strike-through line */}
                <div
                  className={cn(
                    "absolute top-1/2 left-0 h-px -translate-y-1/2 transition-all duration-300 ease-in-out",
                    type === ACTION_STATUS.COMPLETED
                      ? "bg-muted-foreground/40 w-full opacity-100"
                      : type === ACTION_STATUS.ABANDONED
                        ? "w-full bg-rose-500/30 opacity-100"
                        : "w-0 bg-transparent opacity-0"
                  )}
                />
                {action.important && (
                  <Star
                    className={cn(
                      "ml-1.5 inline-block size-3 shrink-0",
                      IMPORTANT_CONFIG.active.color,
                      IMPORTANT_CONFIG.active.fill
                    )}
                  />
                )}
              </span>

              {action.note && (
                <span className="text-muted-foreground/80 line-clamp-1 text-[12.5px] leading-normal">
                  {action.note}
                </span>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-3">
                {action.startTime ? (
                  <span className="text-primary/80 flex items-center gap-1 text-[11px] font-medium">
                    <Clock className="size-3" />
                    {formatTime(action.startTime)}
                    {action.endTime ? (
                      <>
                        {" - "}
                        {formatTime(action.endTime)}
                        <NextDayBadge
                          startTime={action.startTime}
                          endTime={action.endTime}
                          className="ml-1 opacity-70"
                        />
                      </>
                    ) : (
                      ""
                    )}
                  </span>
                ) : (
                  <span
                    className={cn(
                      "flex items-center gap-1 text-[11px] font-medium",
                      isOverdue ? "text-red-500/80" : "text-muted-foreground/60"
                    )}
                  >
                    <CalendarIcon className="size-3" />
                    {isOverdue ? "Overdue" : "Anytime"}
                  </span>
                )}

                {action.duration && (
                  <span className="text-muted-foreground/80 bg-muted/40 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold">
                    <Clock className="size-3" />
                    {!action.duration[1] || action.duration[0] === action.duration[1]
                      ? `${action.duration[0]}m`
                      : `${action.duration[0]}-${action.duration[1]}m`}
                  </span>
                )}
                {shouldShowEnergy && (
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-bold sm:gap-1.5 sm:px-2",
                      energyConfig?.bg || "bg-muted/50 border-border/50"
                    )}
                    title={`Energy: ${action.energy}`}
                  >
                    {action.energy === ENERGY_LEVELS.HIGH ? (
                      <BatteryFull className={cn("size-3", energyConfig?.color)} />
                    ) : action.energy === ENERGY_LEVELS.MEDIUM ? (
                      <BatteryMedium className={cn("size-3", energyConfig?.color)} />
                    ) : (
                      <BatteryLow className={cn("size-3", energyConfig?.color)} />
                    )}
                    <span
                      className={cn(
                        "hidden tracking-wider uppercase sm:inline",
                        energyConfig?.color || "text-muted-foreground"
                      )}
                    >
                      {action.energy}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {settings.show_intentions && action.intention === INTENTIONS.WANT && (
              <div className="flex shrink-0 items-center gap-2 pt-0.5">
                <span
                  className={cn(
                    "group/project flex items-center gap-1 rounded-lg border px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase transition-colors sm:gap-1.5 sm:px-2 sm:py-1",
                    intentionConfig.bg,
                    intentionConfig.color
                  )}
                  title="Want to Do"
                >
                  <span className="hidden sm:inline">Want to Do</span>
                  <Heart className="size-3 opacity-60" />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {type === ACTION_STATUS.ACTIVE && !isBulkModeActive && (
        <div className="ml-1 flex shrink-0 items-center gap-0.5">
          {/* Desktop Hover Actions */}
          {type === ACTION_STATUS.ACTIVE && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onQuickReschedule?.(action);
              }}
              className="text-muted-foreground/40 hover:text-primary hover:bg-primary/10 hidden size-7 opacity-0 transition-all duration-200 select-none group-hover:opacity-100 hover:scale-110 active:scale-90 lg:flex"
              title={rescheduleLabel}
            >
              <CalendarIcon className="size-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(action);
            }}
            className="text-muted-foreground/40 hover:text-primary hover:bg-primary/10 hidden size-7 opacity-0 transition-all duration-200 select-none group-hover:opacity-100 hover:rotate-12 active:scale-90 lg:flex"
            title="Edit action"
          >
            <PencilIcon className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onAbandon(action);
            }}
            className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 hidden size-7 opacity-0 transition-all duration-200 select-none group-hover:opacity-100 hover:-rotate-12 active:scale-90 lg:flex"
            title="Abandon action"
          >
            <Trash2Icon className="size-3.5" />
          </Button>

          {/* Mobile/Compact Overflow Menu */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground/70 lg:text-muted-foreground/40 hover:text-foreground size-7 transition-all active:scale-90"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-background border-border/40 animate-in fade-in zoom-in-95 w-48 p-1 shadow-xl ring-0 duration-200"
              >
                {type === ACTION_STATUS.ACTIVE && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickReschedule?.(action);
                    }}
                    className="hover:bg-muted/50 flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors"
                  >
                    <CalendarIcon className="text-muted-foreground/60 size-3.5" />
                    {rescheduleLabel}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(action);
                  }}
                  className="hover:bg-muted/50 flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors"
                >
                  <PencilIcon className="text-muted-foreground/60 size-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAbandon(action);
                  }}
                  className="text-destructive focus:text-destructive hover:bg-destructive/5 flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors"
                >
                  <Trash2Icon className="size-3.5" />
                  Abandon
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {type === ACTION_STATUS.ABANDONED && !isBulkModeActive && (
        <div className="ml-1 flex shrink-0 items-center gap-0.5">
          {/* Desktop Hover Actions */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onReactivate?.(action);
            }}
            className="text-muted-foreground/40 hover:text-primary hover:bg-primary/10 hidden size-7 opacity-0 transition-all duration-200 select-none group-hover:opacity-100 hover:rotate-12 active:scale-90 lg:flex"
            title="Reactivate task"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Are you sure you want to permanently delete this task?")) {
                onDeletePermanently?.(action);
              }
            }}
            className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 hidden size-7 opacity-0 transition-all duration-200 select-none group-hover:opacity-100 hover:-rotate-12 active:scale-95 lg:flex"
            title="Delete permanently"
          >
            <Trash2Icon className="size-3.5" />
          </Button>

          {/* Mobile/Compact Overflow Menu */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground/70 lg:text-muted-foreground/40 hover:text-foreground size-7 transition-all active:scale-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-background border-border/40 animate-in fade-in zoom-in-95 w-40 p-1 shadow-xl ring-0 duration-200"
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onReactivate?.(action);
                  }}
                  className="hover:bg-muted/50 flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors"
                >
                  <RotateCcw className="text-muted-foreground/60 size-3.5" />
                  Reactivate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Are you sure you want to permanently delete this task?")) {
                      onDeletePermanently?.(action);
                    }
                  }}
                  className="text-destructive focus:text-destructive hover:bg-destructive/5 flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors"
                >
                  <Trash2Icon className="size-3.5" />
                  Delete Permanently
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </motion.div>
  );
}
