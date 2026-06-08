import { useState, useEffect } from "react";
import type { Action, ActionStatus } from "../types/actions";
import { Button, cn, Checkbox, Input } from "@kreozalabs/ui";
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
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@kreozalabs/ui";
import { NextDayBadge } from "./NextDayBadge";
import { useSettings } from "../providers/SettingsContext";
import { formatTime, getNextDayString } from "../utils/time";
import { useCurrentDay } from "../hooks/useCurrentDay";
import {
  ACTION_STATUS,
  ENERGY_LEVELS,
  ENERGY_OPTIONS,
  INTENTIONS,
  INTENTION_OPTIONS,
  IMPORTANT_CONFIG,
} from "../config/constants";
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
  const timeFormat = settings.time_format;

  const [isEditingIndex, setIsEditingIndex] = useState(false);
  const [editIndexValue, setEditIndexValue] = useState(String(index || ""));
  const [prevIndex, setPrevIndex] = useState(index);

  if (index !== prevIndex) {
    setPrevIndex(index);
    setEditIndexValue(String(index || ""));
  }

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    return () => {
      if (showTimeout) clearTimeout(showTimeout);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [showTimeout, hideTimeout]);

  const handleMouseEnter = () => {
    if (!settings.enable_hover_preview) return;

    // Disable hover previews on touch devices to avoid sticky popups on tap
    const isTouchDevice =
      typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    // Disable preview if editing index or bulk selection mode is active
    if (isEditingIndex || isBulkModeActive) return;

    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }

    if (!isPreviewOpen && !showTimeout) {
      const timeout = setTimeout(() => {
        setIsPreviewOpen(true);
      }, settings.hover_preview_delay * 1000);
      setShowTimeout(timeout);
    }
  };

  const handleMouseLeave = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
      setShowTimeout(null);
    }

    if (isPreviewOpen && !hideTimeout) {
      const timeout = setTimeout(() => {
        setIsPreviewOpen(false);
        setHideTimeout(null);
      }, 300); // 300ms bridge window to move cursor onto the preview card
      setHideTimeout(timeout);
    }
  };

  const handlePopoverMouseEnter = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  };

  const handlePopoverMouseLeave = () => {
    if (!hideTimeout) {
      const timeout = setTimeout(() => {
        setIsPreviewOpen(false);
        setHideTimeout(null);
      }, 300);
      setHideTimeout(timeout);
    }
  };

  const dismissPreview = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
      setShowTimeout(null);
    }
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    setIsPreviewOpen(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPreviewOpen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const formattedScheduledDate = (() => {
    try {
      const date = new Date(action.scheduledDate + "T12:00:00");
      return date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return action.scheduledDate;
    }
  })();

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
    <Popover open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClickCapture={dismissPreview}
        className={cn(
          "group flex items-start gap-1 py-2.5 border-b border-border/40 last:border-none transition-colors px-1 sm:px-2 cursor-default relative overflow-hidden",
          type === ACTION_STATUS.COMPLETED
            ? "opacity-50"
            : type === ACTION_STATUS.ABANDONED
              ? "opacity-45 italic bg-rose-500/1"
              : "hover:bg-muted/10"
        )}
      >
        <PopoverAnchor asChild>
          <div
            className="absolute pointer-events-none"
            style={{
              left: mouseCoords ? `${mouseCoords.x}px` : "50%",
              top: mouseCoords ? `${mouseCoords.y}px` : "50%",
              width: "1px",
              height: "1px",
            }}
          />
        </PopoverAnchor>
          {/* Reorder Arrows */}
          {type === ACTION_STATUS.ACTIVE && (
            <div className="flex flex-col items-center gap-0.5 mr-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
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
                className="size-5 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 disabled:opacity-0 rounded-md transition-all active:scale-90"
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
                className="size-5 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 disabled:opacity-0 rounded-md transition-all active:scale-90"
                title="Move down (Shift-click to move to bottom)"
              >
                <ChevronDown className="size-3.5" />
              </Button>
            </div>
          )}

          {/* Floating Checkbox (Gmail style hover / active bulk selection transition) */}
          {settings.enable_selection && (
            <div
              className={cn(
                "mt-0.5 shrink-0 flex items-center justify-center h-5",
                settings.shift_on_selection_hover
                  ? cn(
                      "transition-all duration-200",
                      isBulkModeActive || isSelected
                        ? "w-5 opacity-100 mr-1.5 ml-1"
                        : "w-0 opacity-0 overflow-hidden group-hover:w-5 group-hover:opacity-100 group-hover:mr-1.5 group-hover:ml-1"
                    )
                  : cn(
                      "w-5 mr-1.5 ml-1 transition-opacity duration-200",
                      isBulkModeActive || isSelected
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    )
              )}
            >
              <Checkbox checked={isSelected} onCheckedChange={() => onSelectToggle?.(action.id)} />
            </div>
          )}

          <div className="flex items-start gap-3 flex-1 min-w-0">
            {type === ACTION_STATUS.ACTIVE ? (
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete(action);
                }}
                className={cn(
                  "mt-0.5 size-5 rounded-full transition-all shrink-0 bg-transparent border-[1.5px] p-0 shadow-none flex items-center justify-center group/check hover:scale-110",
                  energyConfig?.color || "text-muted-foreground",
                  energyConfig?.bg.split(" ")[1] || "border-border/40"
                )}
                title="Mark as completed"
              >
                <CheckCircle2Icon
                  className={cn(
                    "size-3.5 opacity-0 group-hover/check:opacity-100 transition-all duration-300",
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
                className="mt-0.5 size-5 shrink-0 flex items-center justify-center hover:bg-primary/10 rounded-full transition-all duration-300 p-0 active:scale-90"
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
                className="mt-0.5 size-5 shrink-0 flex items-center justify-center hover:bg-primary/10 rounded-full transition-all duration-300 p-0 group/uncheck active:scale-90"
                title="Unmark as completed"
              >
                <CheckCircle2Icon className="size-4 text-primary group-hover/uncheck:hidden animate-in zoom-in duration-300" />
                <RotateCcw className="size-3.5 text-primary hidden group-hover/uncheck:block animate-in spin-in-180 duration-300" />
              </Button>
            )}

            <div
              className="flex-1 min-w-0 flex flex-col gap-0.5 cursor-pointer"
              onClick={() => onEdit(action)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col flex-1 min-w-0">
                  <span
                    className={cn(
                      "text-[14px] font-medium leading-[1.4] transition-colors relative flex-1 truncate",
                      type === ACTION_STATUS.COMPLETED
                        ? "text-muted-foreground"
                        : type === ACTION_STATUS.ABANDONED
                          ? "text-rose-500/60"
                          : "text-foreground"
                    )}
                  >
                    {index !== undefined && (
                      <span
                        className="mr-1.5 select-none inline-block w-5 shrink-0"
                        onClick={(e) => {
                          if (type === ACTION_STATUS.ACTIVE) {
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
                            className="h-5 w-6 text-[10px] font-black text-center p-0 border border-primary bg-background focus-visible:ring-0 rounded"
                          />
                        ) : (
                          <span
                            className="text-[11px] font-bold text-muted-foreground/40 hover:text-primary hover:font-black tabular-nums cursor-pointer transition-colors"
                            title="Click to change order position"
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
                        "absolute left-0 top-1/2 -translate-y-1/2 h-px transition-all duration-300 ease-in-out",
                        type === ACTION_STATUS.COMPLETED
                          ? "w-full opacity-100 bg-muted-foreground/40"
                          : type === ACTION_STATUS.ABANDONED
                            ? "w-full opacity-100 bg-rose-500/30"
                            : "w-0 opacity-0 bg-transparent"
                      )}
                    />
                    {action.important && (
                      <Star
                        className={cn(
                          "size-3 ml-1.5 shrink-0 inline-block",
                          IMPORTANT_CONFIG.active.color,
                          IMPORTANT_CONFIG.active.fill
                        )}
                      />
                    )}
                  </span>

                  {action.note && (
                    <span className="text-[12.5px] text-muted-foreground/80 line-clamp-1 leading-normal">
                      {action.note}
                    </span>
                  )}
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {action.startTime ? (
                      <span className="text-[11px] font-medium flex items-center gap-1 text-primary/80">
                        <Clock className="size-3" />
                        {formatTime(action.startTime, timeFormat)}
                        {action.endTime ? (
                          <>
                            {" - "}
                            {formatTime(action.endTime, timeFormat)}
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
                          "text-[11px] font-medium flex items-center gap-1",
                          isOverdue ? "text-red-500/80" : "text-muted-foreground/60"
                        )}
                      >
                        <CalendarIcon className="size-3" />
                        {isOverdue ? "Overdue" : "Anytime"}
                      </span>
                    )}

                    {action.duration && (
                      <span className="text-[11px] font-bold flex items-center gap-1 text-muted-foreground/80 bg-muted/40 px-1.5 py-0.5 rounded-md">
                        <Clock className="size-3" />
                        {!action.duration[1] || action.duration[0] === action.duration[1]
                          ? `${action.duration[0]}m`
                          : `${action.duration[0]}-${action.duration[1]}m`}
                      </span>
                    )}
                    {shouldShowEnergy && (
                      <div
                        className={cn(
                          "px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 sm:gap-1.5",
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
                            "uppercase tracking-wider hidden sm:inline",
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
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center gap-1 sm:gap-1.5 group/project px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border",
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

          {type === ACTION_STATUS.ACTIVE && (
            <div className="flex items-center gap-0.5 shrink-0 ml-1">
              {/* Desktop Hover Actions */}
              {type === ACTION_STATUS.ACTIVE && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickReschedule?.(action);
                  }}
                  className="hidden lg:flex opacity-0 group-hover:opacity-100 transition-all duration-200 size-7 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 select-none active:scale-90 hover:scale-110"
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
                className="hidden lg:flex opacity-0 group-hover:opacity-100 transition-all duration-200 size-7 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 select-none active:scale-90 hover:rotate-12"
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
                className="hidden lg:flex opacity-0 group-hover:opacity-100 transition-all duration-200 size-7 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 select-none active:scale-90 hover:-rotate-12"
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
                      className="size-7 text-muted-foreground/40 hover:text-foreground active:scale-90 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-background border-border/40 shadow-xl p-1 animate-in fade-in zoom-in-95 duration-200 ring-0"
                  >
                    {type === ACTION_STATUS.ACTIVE && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickReschedule?.(action);
                        }}
                        className="flex items-center gap-2 px-2 py-1.5 text-[13px] font-medium hover:bg-muted/50 rounded-md transition-colors"
                      >
                        <CalendarIcon className="size-3.5 text-muted-foreground/60" />
                        {rescheduleLabel}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(action);
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 text-[13px] font-medium hover:bg-muted/50 rounded-md transition-colors"
                    >
                      <PencilIcon className="size-3.5 text-muted-foreground/60" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onAbandon(action);
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 text-[13px] font-medium text-destructive focus:text-destructive hover:bg-destructive/5 rounded-md transition-colors"
                    >
                      <Trash2Icon className="size-3.5" />
                      Abandon
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

          {type === ACTION_STATUS.ABANDONED && (
            <div className="flex items-center gap-0.5 shrink-0 ml-1">
              {/* Desktop Hover Actions */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onReactivate?.(action);
                }}
                className="hidden lg:flex opacity-0 group-hover:opacity-100 transition-all duration-200 size-7 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 select-none active:scale-90 hover:rotate-12"
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
                className="hidden lg:flex opacity-0 group-hover:opacity-100 transition-all duration-200 size-7 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 select-none active:scale-95 hover:-rotate-12"
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
                      className="size-7 text-muted-foreground/40 hover:text-foreground active:scale-95 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-40 bg-background border-border/40 shadow-xl p-1 animate-in fade-in zoom-in-95 duration-200 ring-0"
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onReactivate?.(action);
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 text-[13px] font-medium hover:bg-muted/50 rounded-md transition-colors"
                    >
                      <RotateCcw className="size-3.5 text-muted-foreground/60" />
                      Reactivate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to permanently delete this task?")) {
                          onDeletePermanently?.(action);
                        }
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 text-[13px] font-medium text-destructive focus:text-destructive hover:bg-destructive/5 rounded-md transition-colors"
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

      <PopoverContent
        side="right"
        align="start"
        sideOffset={16}
        className="z-50 w-[380px] p-5 bg-background/98 backdrop-blur-md border border-border/60 shadow-2xl rounded-2xl select-text animate-in fade-in zoom-in-95 duration-200"
        onMouseEnter={handlePopoverMouseEnter}
        onMouseLeave={handlePopoverMouseLeave}
      >
        <div className="flex flex-col gap-4 text-left">
          {/* Header with status/importance/intention */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-lg border",
                isOverdue
                  ? "text-red-500 bg-red-500/10 border-red-500/20"
                  : "text-muted-foreground bg-muted/40 border-border/20"
              )}
            >
              {isOverdue ? "Overdue" : "Scheduled"}
            </span>

            <div className="flex items-center gap-1.5">
              {action.important && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  <span>Important</span>
                </span>
              )}
              {settings.show_intentions && (
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-lg border",
                    intentionConfig.bg,
                    intentionConfig.color
                  )}
                >
                  {intentionConfig.label}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <h4
              className={cn(
                "text-[16px] font-bold leading-snug break-words",
                type === ACTION_STATUS.COMPLETED
                  ? "text-muted-foreground line-through decoration-muted-foreground/40"
                  : type === ACTION_STATUS.ABANDONED
                    ? "text-rose-500/60 italic line-through decoration-rose-500/30"
                    : "text-foreground"
              )}
            >
              {action.title}
            </h4>
          </div>

          {/* Note / Description */}
          {action.note && (
            <div className="text-[13px] text-muted-foreground/90 leading-relaxed border border-border/30 bg-muted/20 p-3 rounded-xl whitespace-pre-wrap break-words">
              {action.note}
            </div>
          )}

          {/* Metadata Footer: Date, Time, Duration, Energy */}
          <div className="flex flex-col gap-2 border-t border-border/20 pt-3">
            <div className="flex items-center justify-between text-[11.5px] text-muted-foreground/75">
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="size-4 shrink-0 text-sky-500" />
                <span>Date:</span>
              </span>
              <span className="font-semibold text-foreground">{formattedScheduledDate}</span>
            </div>

            {(action.startTime || action.duration || shouldShowEnergy) && (
              <div className="flex flex-col gap-2">
                {action.startTime && (
                  <div className="flex items-center justify-between text-[11.5px] text-muted-foreground/75">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-4 shrink-0 text-indigo-500" />
                      <span>Time:</span>
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatTime(action.startTime, timeFormat)}
                      {action.endTime && ` - ${formatTime(action.endTime, timeFormat)}`}
                    </span>
                  </div>
                )}

                {action.duration && (
                  <div className="flex items-center justify-between text-[11.5px] text-muted-foreground/75">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-4 shrink-0 text-indigo-400" />
                      <span>Duration:</span>
                    </span>
                    <span className="font-semibold text-foreground">
                      {!action.duration[1] || action.duration[0] === action.duration[1]
                        ? `${action.duration[0]}m`
                        : `${action.duration[0]}-${action.duration[1]}m`}
                    </span>
                  </div>
                )}

                {shouldShowEnergy && (
                  <div className="flex items-center justify-between text-[11.5px] text-muted-foreground/75">
                    <span className="flex items-center gap-1.5">
                      {action.energy === ENERGY_LEVELS.HIGH ? (
                        <BatteryFull className="size-4 shrink-0 text-red-500" />
                      ) : action.energy === ENERGY_LEVELS.MEDIUM ? (
                        <BatteryMedium className="size-4 shrink-0 text-amber-500" />
                      ) : (
                        <BatteryLow className="size-4 shrink-0 text-emerald-500" />
                      )}
                      <span>Energy:</span>
                    </span>
                    <span
                      className={cn(
                        "font-bold uppercase tracking-wider text-[11px]",
                        energyConfig?.color
                      )}
                    >
                      {action.energy}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
