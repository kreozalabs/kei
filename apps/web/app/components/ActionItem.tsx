import type { Action } from "../types/events";
import { Button, cn } from "@kreozalabs/ui";
import { Trash2Icon, CheckCircle2Icon, CircleIcon, CalendarIcon, InboxIcon } from "lucide-react";

interface ActionItemProps {
  action: Action;
  type: "active" | "completed";
  onComplete: (action: Action) => void;
  onAbandon: (action: Action) => void;
}

export function ActionItem({ action, type, onComplete, onAbandon }: ActionItemProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high": return "text-red-500 hover:text-red-600 hover:bg-red-500/10";
      case "medium": return "text-orange-500 hover:text-orange-600 hover:bg-orange-500/10";
      case "low": return "text-blue-500 hover:text-blue-600 hover:bg-blue-500/10";
      default: return "text-muted-foreground/40 hover:text-primary hover:bg-primary/10";
    }
  };

  const isOverdue = Date.now() - action.createdAt > 86400000;
  const dateColor = isOverdue ? "text-red-500 font-medium" : "text-green-600";
  const dateText = isOverdue ? "Yesterday" : "Today";

  return (
    <div className={cn(
      "group flex items-start gap-2.5 py-2.5 border-b border-border/40 last:border-none transition-colors px-1 sm:px-2 rounded-lg cursor-pointer",
      type === "completed" ? "opacity-60 bg-muted/10 my-1 border-none" : "hover:bg-muted/30"
    )}>
      {type === "active" ? (
        <Button 
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onComplete(action); }}
          className={cn(
            "mt-0.5 size-5 rounded-full transition-all shrink-0 bg-transparent p-0", 
            getPriorityColor(action.priority)
          )}
          title="Mark as completed"
        >
          <CircleIcon className="size-[1.125rem] stroke-[1.5]" />
        </Button>
      ) : (
        <div className="mt-0.5 size-5 shrink-0 flex items-center justify-center">
          <CheckCircle2Icon className="size-[1.125rem] text-muted-foreground/60" />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className={cn(
          "text-[14px] leading-tight transition-all",
          type === "completed" ? "line-through text-muted-foreground" : "text-foreground"
        )}>
          {action.title}
        </span>
        
        {action.description && (
          <span className="text-[12px] text-muted-foreground/80 line-clamp-1 mt-0.5">
            {action.description}
          </span>
        )}
        
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <div className="flex items-center gap-1">
            <CalendarIcon className={cn("size-3", dateColor)} />
            <span className={cn("text-[12px]", dateColor)}>
              {dateText}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground/60 ml-auto">
            <span className="text-[12px]">{action.project || "Inbox"}</span>
            <InboxIcon className="size-3" />
          </div>
        </div>
      </div>

      {type === "active" && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onAbandon(action); }}
          className="opacity-0 lg:group-hover:opacity-100 transition-opacity size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 select-none ml-2"
          title="Abandon action"
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
