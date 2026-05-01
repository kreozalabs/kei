import type { Action } from "../types/events";
import { Button, cn } from "@kreozalabs/ui";
import {
  Trash2Icon,
  CheckCircle2Icon,
  CalendarIcon,
  InboxIcon,
  Star,
  GripVertical,
  Clock,
  BatteryMedium,
  RotateCcw,
  PencilIcon,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@kreozalabs/ui";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTheme } from "../providers/ThemeContext";
import { formatTime } from "../utils/time";

interface ActionItemProps {
  action: Action;
  type: "active" | "completed";
  onComplete: (action: Action) => void;
  onAbandon: (action: Action) => void;
  onEdit: (action: Action) => void;
}

export function ActionItem({ action, type, onComplete, onAbandon, onEdit }: ActionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: action.id,
    disabled: type === "completed",
  });
  const { timeFormat } = useTheme();

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const getEnergyColor = (energy: string) => {
    switch (energy?.toLowerCase()) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-orange-500";
      case "low":
        return "text-emerald-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getEnergyBg = (energy: string) => {
    switch (energy?.toLowerCase()) {
      case "high":
        return "bg-red-500/10 border-red-500/20";
      case "medium":
        return "bg-orange-500/10 border-orange-500/20";
      case "low":
        return "bg-emerald-500/10 border-emerald-500/20";
      default:
        return "bg-muted/50 border-border/50";
    }
  };

  const todayString = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  const isOverdue = action.scheduledDate < todayString;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-start gap-1 py-2.5 border-b border-border/40 last:border-none transition-colors px-1 sm:px-2 cursor-default relative",
        type === "completed" ? "opacity-50" : "hover:bg-muted/10",
        isDragging &&
          "opacity-50 z-50 bg-background shadow-lg rounded-lg border-2 border-primary/20"
      )}
    >
      {/* Drag Handle */}
      {type === "active" && (
        <div
          {...attributes}
          {...listeners}
          className="mt-0.5 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-0.5 -ml-1.5 text-muted-foreground/30 hover:text-muted-foreground/60 transition-all shrink-0"
          title="Drag to reorder"
        >
          <GripVertical className="size-3.5" />
        </div>
      )}

      <div className="flex items-start gap-3 flex-1 min-w-0">
        {type === "active" ? (
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(action);
            }}
            className={cn(
              "mt-0.5 size-5 rounded-full transition-all shrink-0 bg-transparent border-[1.5px] p-0 shadow-none flex items-center justify-center group/check hover:scale-110",
              getEnergyColor(action.energy),
              getEnergyBg(action.energy).split(" ")[1]
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
          onClick={() => type !== "completed" && onEdit(action)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col flex-1 min-w-0">
              <span
                className={cn(
                  "text-[14px] font-medium leading-[1.4] transition-colors relative flex-1 truncate",
                  type === "completed" ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {action.title}
                {/* Strike-through line */}
                <div
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-muted-foreground/40 transition-all duration-300 ease-in-out",
                    type === "completed" ? "w-full opacity-100" : "w-0 opacity-0"
                  )}
                />
                {action.important && (
                  <Star className="size-3 ml-1.5 text-amber-500 fill-amber-500 shrink-0 inline-block" />
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
                    {action.endTime ? ` - ${formatTime(action.endTime, timeFormat)}` : ""}
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

                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 px-1.5 py-0.5 rounded-md border",
                    getEnergyColor(action.energy),
                    getEnergyBg(action.energy)
                  )}
                >
                  <BatteryMedium className="size-3" />
                  {action.energy}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              <span
                className={cn(
                  "text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center gap-1 group/project px-2 py-1 rounded-lg",
                  action.intention === "must"
                    ? "text-orange-500 bg-orange-500/5 border border-orange-500/10"
                    : "text-muted-foreground/60 hover:text-foreground bg-muted/20 border border-transparent"
                )}
              >
                {action.intention === "must" ? "Must Do" : "Want to Do"}
                <InboxIcon className="size-3 opacity-40 group-hover/project:opacity-80" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {type === "active" && (
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
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
}
