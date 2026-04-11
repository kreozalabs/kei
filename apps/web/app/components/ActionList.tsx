import type { Action } from "../types/events";
import { Card, Button, Badge } from "@kreozalabs/ui";
import { Trash2Icon, CheckCircle2Icon, CircleIcon } from "lucide-react";
import { db } from "../db";
import { useQueryClient } from "@tanstack/react-query";
import { v7 as uuidv7 } from "uuid";

interface ActionListProps {
  actions: Action[];
  type: "active" | "completed";
}

export function ActionList({ actions, type }: ActionListProps) {
  const queryClient = useQueryClient();

  const handleComplete = async (action: Action) => {
    const now = Date.now();
    try {
      const event = {
        id: uuidv7(),
        type: "ACTION_COMPLETED",
        timestamp: now,
        payload: { id: action.id },
      };
      await db.query(
        "INSERT INTO events (id, type, timestamp, payload) VALUES ($1, $2, $3, $4)",
        [event.id, event.type, event.timestamp, JSON.stringify(event.payload)]
      );
      queryClient.invalidateQueries({ queryKey: ["events", "today"] });
    } catch (error) {
      console.error("Failed to complete action:", error);
    }
  };

  const handleAbandon = async (action: Action) => {
    const now = Date.now();
    try {
      const event = {
        id: uuidv7(),
        type: "ACTION_ABANDONED",
        timestamp: now,
        payload: { id: action.id },
      };
      await db.query(
        "INSERT INTO events (id, type, timestamp, payload) VALUES ($1, $2, $3, $4)",
        [event.id, event.type, event.timestamp, JSON.stringify(event.payload)]
      );
      queryClient.invalidateQueries({ queryKey: ["events", "today"] });
    } catch (error) {
      console.error("Failed to abandon action:", error);
    }
  };

  if (actions.length === 0) {
    return (
      <div className="text-center py-20 px-6 border-2 border-dashed rounded-4xl bg-muted/20 opacity-40">
        <p className="text-sm font-bold uppercase tracking-[0.2em] italic">
          {type === "active" ? "No active initiatives. Calibrate your trajectory." : "Archive empty. No actions processed."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actions.map((action) => (
        <Card 
          key={action.id} 
          className={`group relative flex items-center justify-between p-5 transition-all duration-300 border border-border/60 shadow-sm overflow-hidden ${
            action.status === 'completed' 
              ? 'bg-muted/30 opacity-60' 
              : 'bg-card hover:bg-muted/20 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 rounded-2xl'
          }`}
        >
          {/* Subtle Accent Glow for Active Items */}
          {action.status !== 'completed' && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          )}

          <div className="flex items-center gap-5 flex-1 z-10">
            {type === "active" ? (
              <button 
                onClick={() => handleComplete(action)}
                className="text-muted-foreground/40 hover:text-primary transition-all hover:scale-110 active:scale-90"
                title="Mark as completed"
              >
                <CircleIcon className="size-7 stroke-[1.5]" />
              </button>
            ) : (
              <div className="bg-primary/10 p-1.5 rounded-full">
                <CheckCircle2Icon className="size-5 text-primary" />
              </div>
            )}
            
            <div className="flex-1">
              <p className={`text-lg font-bold tracking-tight transition-all ${
                action.status === 'completed' 
                  ? 'line-through text-muted-foreground/70' 
                  : 'text-foreground'
              }`}>
                {action.title}
              </p>
              <div className="flex gap-2 mt-1.5">
                {action.priority && (
                  <Badge variant="outline" className="text-[9px] px-2 py-0 font-black uppercase tracking-widest bg-background/50 border-border/50 text-muted-foreground/80">
                    {action.priority}
                  </Badge>
                )}
                <span className="text-[10px] font-mono text-muted-foreground/40 font-bold uppercase">
                  {new Date(action.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {type === "active" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAbandon(action)}
              className="opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
              title="Abandon action"
            >
              <Trash2Icon className="size-4" />
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}
