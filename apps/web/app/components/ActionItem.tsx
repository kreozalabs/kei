import type { Action, ActionStatus } from "../types/actions";
import { Button, cn, Checkbox } from "@kreozalabs/ui";
import {
  Trash2Icon,
  CheckCircle2Icon,
  CalendarIcon,
  Star,
  GripVertical,
  Clock,
  RotateCcw,
  PencilIcon,
  MoreVertical,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  AlertCircle,
  Heart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@kreozalabs/ui";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { NextDayBadge } from "./NextDayBadge";
import { useSettings } from "../providers/SettingsContext";
import { formatTime } from "../utils/time";
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
}: ActionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: action.id,
    disabled: type === ACTION_STATUS.COMPLETED || type === ACTION_STATUS.ABANDONED,
  });
  const { settings } = useSettings();
  const timeFormat = settings.time_format;

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const energyConfig = ENERGY_OPTIONS.find((opt) => opt.value === action.energy?.toLowerCase());
  const intentionConfig =
    INTENTION_OPTIONS.find((opt) => opt.value === action.intention) || INTENTION_OPTIONS[0];
  const todayString = useCurrentDay();
  const isOverdue = action.scheduledDate < todayString;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{
        opacity: type === ACTION_STATUS.COMPLETED ? 0.5 : type === ACTION_STATUS.ABANDONED ? 0.45 : 1,
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
        "group flex items-start gap-1 py-2.5 border-b border-border/40 last:border-none transition-colors px-1 sm:px-2 cursor-default relative overflow-hidden",
        type === ACTION_STATUS.COMPLETED
          ? "opacity-50"
          : type === ACTION_STATUS.ABANDONED
            ? "opacity-45 italic bg-rose-500/1"
            : "hover:bg-muted/10",
        isDragging &&
          "opacity-50 z-50 bg-background shadow-lg rounded-lg border-2 border-primary/20"
      )}
    >
      {/* Drag Handle */}
      {type === ACTION_STATUS.ACTIVE && (
        <div
          {...attributes}
          {...listeners}
          className="mt-0.5 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-0.5 -ml-1.5 text-muted-foreground/30 hover:text-muted-foreground/60 transition-all shrink-0"
          title="Drag to reorder"
        >
          <GripVertical className="size-3.5" />
        </div>
      )}

      {/* Floating Checkbox (Gmail style hover / active bulk selection transition) */}
      <div
        className={cn(
          "mt-0.5 shrink-0 transition-all duration-200 flex items-center justify-center h-5",
          isBulkModeActive || isSelected
            ? "w-5 opacity-100 mr-1.5 ml-1"
            : "w-0 opacity-0 overflow-hidden group-hover:w-5 group-hover:opacity-100 group-hover:mr-1.5 group-hover:ml-1"
        )}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelectToggle?.(action.id)}
        />
      </div>

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

                <div
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5",
                    energyConfig?.bg || "bg-muted/50 border-border/50"
                  )}
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
                      "uppercase tracking-wider",
                      energyConfig?.color || "text-muted-foreground"
                    )}
                  >
                    {action.energy}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              <span
                className={cn(
                  "text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center gap-1.5 group/project px-2 py-1 rounded-lg border",
                  intentionConfig.bg,
                  intentionConfig.color
                )}
              >
                {action.intention === INTENTIONS.MUST ? (
                  <>
                    Must Do
                    <AlertCircle className="size-3 opacity-60" />
                  </>
                ) : (
                  <>
                    Want to Do
                    <Heart className="size-3 opacity-60" />
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {type === ACTION_STATUS.ACTIVE && (
        <div className="flex items-center gap-0.5 shrink-0 ml-1">
          {/* Desktop Hover Actions */}
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
                className="w-32 bg-background border-border/40 shadow-xl p-1 animate-in fade-in zoom-in-95 duration-200 ring-0"
              >
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
  );
}
