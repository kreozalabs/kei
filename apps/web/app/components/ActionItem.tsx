import type { Action } from "../types/events";
import { Button, cn } from "@kreozalabs/ui";
import { Trash2Icon, CheckCircle2Icon, CalendarIcon, InboxIcon, Star, GripVertical, Clock, BatteryMedium } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ActionItemProps {
  action: Action;
  type: "active" | "completed";
  onComplete: (action: Action) => void;
  onAbandon: (action: Action) => void;
}

export function ActionItem({ action, type, onComplete, onAbandon }: ActionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: action.id,
    disabled: type === "completed"
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const getEnergyColor = (energy: string) => {
    switch (energy?.toLowerCase()) {
      case "high":
        return "text-red-500 border-red-500/50 hover:bg-red-500/5";
      case "medium":
        return "text-orange-500 border-orange-500/50 hover:bg-orange-500/5";
      case "low":
        return "text-green-500 border-green-500/50 hover:bg-green-500/5";
      default:
        return "text-muted-foreground/30 border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5";
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
        isDragging && "opacity-50 z-50 bg-background shadow-lg rounded-lg border-2 border-primary/20"
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
              "mt-0.5 size-4.5 rounded-full transition-all shrink-0 bg-transparent border-[1.5px] p-0 shadow-none flex items-center justify-center group/check hover:scale-110",
              getEnergyColor(action.energy)
            )}
            title="Mark as completed"
          >
            <div className="size-2 rounded-full bg-current opacity-0 group-hover/check:opacity-20 transition-opacity" />
          </Button>
        ) : (
          <div className="mt-0.5 size-4.5 shrink-0 flex items-center justify-center">
            <CheckCircle2Icon className="size-4 text-primary" />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col gap-0.5 cursor-pointer">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col flex-1 min-w-0">
              <span
                className={cn(
                  "text-[14px] font-medium leading-[1.4] transition-all flex items-center gap-1.5",
                  type === "completed" ? "line-through text-muted-foreground" : "text-foreground"
                )}
              >
                {action.title}
                {action.important && <Star className="size-3 text-amber-500 fill-amber-500 shrink-0" />}
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
                    {action.startTime}{action.endTime ? ` - ${action.endTime}` : ''}
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
                  <span className="text-[11px] font-medium flex items-center gap-1 text-muted-foreground/60">
                    <Clock className="size-3" />
                    {!action.duration[1] || action.duration[0] === action.duration[1] 
                      ? `${action.duration[0]}m` 
                      : `${action.duration[0]}-${action.duration[1]}m`}
                  </span>
                )}
                
                <span className="text-[11px] font-medium flex items-center gap-1 text-muted-foreground/60 capitalize">
                  <BatteryMedium className="size-3" />
                  {action.energy}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              <span className="text-[11px] font-medium text-muted-foreground/60 hover:text-foreground transition-colors flex items-center gap-1 group/project">
                {action.intention === "must" ? "Must Do" : "Want to Do"}
                <InboxIcon className="size-3 opacity-40 group-hover/project:opacity-80" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {type === "active" && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onAbandon(action);
          }}
          className="opacity-0 lg:group-hover:opacity-100 transition-opacity size-7 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 shrink-0 select-none ml-1"
          title="Abandon action"
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
