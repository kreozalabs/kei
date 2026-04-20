import type { Action } from "../types/events";
import { Button, cn } from "@kreozalabs/ui";
import { Trash2Icon, CheckCircle2Icon, CalendarIcon, InboxIcon, Star } from "lucide-react";

interface ActionItemProps {
  action: Action;
  type: "active" | "completed";
  onComplete: (action: Action) => void;
  onAbandon: (action: Action) => void;
}
// TODO: Add on click edit, and other things.

export function ActionItem({ action, type, onComplete, onAbandon }: ActionItemProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-500 border-red-500/50 hover:bg-red-500/5";
      case "medium":
        return "text-orange-500 border-orange-500/50 hover:bg-orange-500/5";
      case "low":
        return "text-blue-500 border-blue-500/50 hover:bg-blue-500/5";
      default:
        return "text-muted-foreground/30 border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5";
    }
  };

  const todayString = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  const isOverdue = action.scheduledDate < todayString;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 py-2.5 border-b border-border/40 last:border-none transition-colors px-1 sm:px-2 cursor-default",
        type === "completed" ? "opacity-50" : "hover:bg-muted/10"
      )}
    >
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
            getPriorityColor(action.priority)
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

            {action.description && (
              <span className="text-[12.5px] text-muted-foreground/80 line-clamp-1 leading-normal">
                {action.description}
              </span>
            )}

            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  "text-[11px] font-medium flex items-center gap-1",
                  isOverdue ? "text-red-500/80" : "text-muted-foreground/60"
                )}
              >
                <CalendarIcon className="size-3" />
                {/* TODO: Instead of overdue, maybe put date and time? */}
                {isOverdue ? "Overdue" : "Scheduled"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-0.5">
            <span className="text-[11px] font-medium text-muted-foreground/60 hover:text-foreground transition-colors flex items-center gap-1 group/project">
              {action.project || "Inbox"}
              <InboxIcon className="size-3 opacity-40 group-hover/project:opacity-80" />
            </span>
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
