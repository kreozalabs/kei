// FIXME: Refactor !
import { useEffect, useState } from "react";
import { Button, cn, toast } from "@kreozalabs/kei-ui";
import { Calendar, Clock, CheckCircle2, Trash2, XCircle, RotateCcw, Loader2 } from "lucide-react";
import type { Action } from "@kreozalabs/kei-core";
import type { Event } from "@kreozalabs/kei-core";
import {
  EVENT_TYPES,
  ACTION_STATUS,
  ENERGY_OPTIONS,
  INTENTION_OPTIONS,
} from "@kreozalabs/kei-core";
import { formatGoogleDate } from "@kreozalabs/kei-core";
import { getEventsForEntity, updateAction } from "@/db/actions";
import { EditableTitle } from "./action-input/EditableTitle";
import { EditableNote } from "./action-input/EditableNote";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_BADGE_STYLES: Record<string, string> = {
  [ACTION_STATUS.COMPLETED]: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  [ACTION_STATUS.ABANDONED]: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  [ACTION_STATUS.ACTIVE]: "bg-primary/10 text-primary border-primary/20",
};

const EVENT_NAME_LABELS: Record<string, string> = {
  [EVENT_TYPES.ACTION_INTENDED]: "Action Intended / Created",
  [EVENT_TYPES.ACTION_UPDATED]: "Details Refined",
  [EVENT_TYPES.ACTION_COMPLETED]: "Marked Completed",
  [EVENT_TYPES.ACTION_ACTIVATED]: "Reactivated",
  [EVENT_TYPES.ACTION_ABANDONED]: "Action Abandoned",
  [EVENT_TYPES.ACTION_DELETED]: "Action Deleted",
};

const EVENT_NODE_STYLES: Record<string, string> = {
  [EVENT_TYPES.ACTION_INTENDED]: "border-primary ring-2 ring-primary/10",
  [EVENT_TYPES.ACTION_COMPLETED]: "border-emerald-500 bg-emerald-500/10",
  [EVENT_TYPES.ACTION_ABANDONED]: "border-rose-500 bg-rose-500/10",
  [EVENT_TYPES.ACTION_ACTIVATED]: "border-sky-500 bg-sky-500/10",
  [EVENT_TYPES.ACTION_UPDATED]: "border-primary bg-primary/10",
};

const BUTTON_STYLES = {
  COMPLETE:
    "flex-1 min-w-28 h-9 flex items-center justify-center gap-1.5 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20 rounded-xl",
  ABANDON:
    "flex-1 min-w-28 h-9 flex items-center justify-center gap-1.5 text-xs font-bold hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 rounded-xl",
  EDIT: "flex-1 min-w-28 h-9 flex items-center justify-center gap-1.5 text-xs font-bold hover:bg-primary/10 hover:text-primary hover:border-primary/20 rounded-xl",
  DELETE:
    "flex-1 min-w-28 h-9 flex items-center justify-center gap-1.5 text-xs font-bold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 text-muted-foreground/60 rounded-xl border-dashed",
  CONTROL:
    "flex-1 min-w-32 h-9 flex items-center justify-center gap-1.5 text-xs font-bold hover:bg-muted/50 rounded-xl",
} as const;

interface ActionDetailViewProps {
  action: Action;
  onEdit: () => void;
  onClose: () => void;
  onComplete?: (action: Action) => void;
  onAbandon?: (action: Action) => void;
  onReactivate?: (action: Action) => void;
  onDeletePermanently?: (action: Action) => void;
}

export function ActionDetailView({
  action,
  onClose,
  onComplete,
  onAbandon,
  onReactivate,
  onDeletePermanently,
}: Omit<ActionDetailViewProps, "onEdit">) {
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [prevActionId, setPrevActionId] = useState(action.id);

  const handleFieldUpdate = async (field: keyof Action, value: any) => {
    if (action[field] === value) return;

    const previousActions = queryClient.getQueryData<Action[]>(["actions"]);
    if (previousActions) {
      queryClient.setQueryData<Action[]>(
        ["actions"],
        previousActions.map((a) => (a.id === action.id ? { ...a, [field]: value } : a))
      );
    }

    try {
      await updateAction(action.id, { [field]: value });
      toast.success("Action updated", {
        description: "Your changes have been saved.",
        action: {
          label: "Undo",
          onClick: async () => {
            if (previousActions) {
              queryClient.setQueryData(["actions"], previousActions);
            }
            await updateAction(action.id, { [field]: action[field] });
            toast.success("Action restored");
          },
        },
      });
    } catch (error) {
      if (previousActions) {
        queryClient.setQueryData(["actions"], previousActions);
      }
      toast.error("Failed to update action");
    }
  };

  if (action.id !== prevActionId) {
    setPrevActionId(action.id);
    setEvents([]);
    setLoadingEvents(true);
  }

  useEffect(() => {
    let active = true;

    getEventsForEntity(action.id)
      .then((evs) => {
        if (active) {
          setEvents(evs);
          setLoadingEvents(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load action history events:", err);
        if (active) {
          setLoadingEvents(false);
        }
      });

    return () => {
      active = false;
    };
  }, [action.id]);

  const getIntentionBadgeStyle = (intention: string) => {
    const config = INTENTION_OPTIONS.find((opt) => opt.value === intention?.toLowerCase());
    return config
      ? `${config.bg} ${config.color} border`
      : "bg-muted text-muted-foreground border border-border/40";
  };

  const getEnergyBadgeStyle = (energy: string) => {
    const config = ENERGY_OPTIONS.find((opt) => opt.value === energy?.toLowerCase());
    return config
      ? `${config.bg} ${config.color} border`
      : "bg-muted text-muted-foreground border border-border/40";
  };

  const getEventName = (type: string) => {
    return EVENT_NAME_LABELS[type] || type.replace("ACTION_", "").toLowerCase();
  };

  const formatEventTime = (timestamp: number) => {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(timestamp));
  };

  const handleDeleteClick = () => {
    if (
      confirm(
        "Are you absolutely sure you want to permanently delete this action? This cannot be undone."
      )
    ) {
      onDeletePermanently?.(action);
      onClose();
    }
  };

  return (
    <div className="custom-scrollbar flex max-h-[80vh] flex-col gap-6 overflow-y-auto px-6 pt-2 pb-6">
      {/* Title & Status */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <EditableTitle
              value={action.title}
              onChange={(val) => handleFieldUpdate("title", val)}
            />
          </div>
          <span
            className={cn(
              "mt-1 shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black tracking-widest uppercase",
              STATUS_BADGE_STYLES[action.status] || STATUS_BADGE_STYLES[ACTION_STATUS.ACTIVE]
            )}
          >
            {action.status}
          </span>
        </div>

        <div className="mt-2">
          <EditableNote
            value={action.note || ""}
            onChange={(val) => handleFieldUpdate("note", val)}
          />
        </div>
      </div>

      {/* Metadata Badges */}
      <div className="bg-muted/30 border-border/10 divide-border/10 flex flex-col divide-y rounded-3xl border p-5">
        <div className="flex flex-col gap-1 pb-3">
          <span className="text-muted-foreground/40 text-[9px] font-bold tracking-wider uppercase">
            Intention
          </span>
          <span
            className={cn(
              "mt-1 w-max rounded-lg px-2 py-0.5 text-center text-xs leading-none font-black tracking-widest uppercase",
              getIntentionBadgeStyle(action.intention)
            )}
          >
            {action.intention}
          </span>
        </div>

        <div className="flex flex-col gap-1 py-3">
          <span className="text-muted-foreground/40 text-[9px] font-bold tracking-wider uppercase">
            Energy Required
          </span>
          <span
            className={cn(
              "mt-1 w-max rounded-lg px-2 py-0.5 text-center text-xs leading-none font-black tracking-widest uppercase",
              getEnergyBadgeStyle(action.energy)
            )}
          >
            {action.energy}
          </span>
        </div>

        <div className="flex flex-col gap-1 py-3">
          <span className="text-muted-foreground/40 text-[9px] font-bold tracking-wider uppercase">
            Scheduled Date
          </span>
          <span className="text-foreground/80 mt-1 flex items-center gap-1.5 text-xs font-bold">
            <Calendar className="text-muted-foreground/50 size-3.5 shrink-0" />
            {formatGoogleDate(action.scheduledDate)}
          </span>
        </div>

        <div className="flex flex-col gap-1 pt-3">
          <span className="text-muted-foreground/40 text-[9px] font-bold tracking-wider uppercase">
            Timing & Span
          </span>
          <span className="text-foreground/80 mt-1 flex items-center gap-1.5 text-xs font-bold">
            <Clock className="text-muted-foreground/50 size-3.5 shrink-0" />
            {action.startTime ? (
              <span>
                {action.startTime}
                {action.endTime ? ` - ${action.endTime}` : ""}
              </span>
            ) : action.duration ? (
              <span>
                {action.duration[0]}h {action.duration[1]}m
              </span>
            ) : (
              <span className="text-muted-foreground/40 italic">Flexible</span>
            )}
          </span>
        </div>
      </div>

      {/* Chronological Event History Log */}
      <div className="flex flex-col gap-3">
        <h4 className="text-muted-foreground/50 px-1 text-[11px] font-black tracking-widest uppercase">
          Chronological Lifecycle History
        </h4>
        <div className="bg-card/45 border-border/20 custom-scrollbar relative max-h-56 min-h-24 overflow-hidden overflow-y-auto rounded-3xl border p-4">
          {loadingEvents ? (
            <div className="bg-background/20 absolute inset-0 flex items-center justify-center backdrop-blur-xs">
              <Loader2 className="text-primary size-5 animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-muted-foreground/30 py-6 text-center text-xs italic">
              No historical checkpoints recorded.
            </div>
          ) : (
            <div className="border-border/20 relative ml-2.5 space-y-5 border-l py-1 pl-5">
              {events.map((event) => {
                return (
                  <div key={event.eventId} className="group/item relative">
                    {/* Circle Node */}
                    <div
                      className={cn(
                        "bg-background absolute top-1 -left-6.5 flex size-3 items-center justify-center rounded-full border transition-all",
                        EVENT_NODE_STYLES[event.type] || "border-border/60"
                      )}
                    />
                    {/* Content */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-foreground/80 text-xs font-bold">
                        {getEventName(event.type)}
                      </span>
                      <span className="text-muted-foreground/50 text-[9px] font-medium">
                        {formatEventTime(event.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer Button Drawer */}
      <div className="border-border/10 mt-2 flex flex-wrap items-center gap-2.5 border-t pt-5">
        {action.status === ACTION_STATUS.COMPLETED ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onComplete?.(action);
              onClose();
            }}
            className={BUTTON_STYLES.CONTROL}
          >
            <RotateCcw className="text-muted-foreground size-3.5" />
            Mark Active
          </Button>
        ) : action.status === ACTION_STATUS.ABANDONED ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onReactivate?.(action);
              onClose();
            }}
            className={BUTTON_STYLES.CONTROL}
          >
            <RotateCcw className="text-muted-foreground size-3.5" />
            Reactivate Task
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onComplete?.(action);
                onClose();
              }}
              className={BUTTON_STYLES.COMPLETE}
            >
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Complete
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onAbandon?.(action);
                onClose();
              }}
              className={BUTTON_STYLES.ABANDON}
            >
              <XCircle className="size-3.5 text-rose-500" />
              Abandon
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteClick}
          className={BUTTON_STYLES.DELETE}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}
