import { useEffect, useState } from "react";
import { Button, cn } from "@kreozalabs/ui";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  XCircle,
  RotateCcw,
  Pencil,
  Loader2,
} from "lucide-react";
import type { Action } from "../types/actions";
import type { Event } from "../types/events";
import { getActionEvents } from "../db/events";
import { EVENT_TYPES, ACTION_STATUS, ENERGY_OPTIONS, INTENTION_OPTIONS } from "../config/constants";
import { formatGoogleDate } from "../utils/time";

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
  onEdit,
  onClose,
  onComplete,
  onAbandon,
  onReactivate,
  onDeletePermanently,
}: ActionDetailViewProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [prevActionId, setPrevActionId] = useState(action.id);

  if (action.id !== prevActionId) {
    setPrevActionId(action.id);
    setEvents([]);
    setLoadingEvents(true);
  }

  useEffect(() => {
    let active = true;

    getActionEvents(action.id)
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
    <div className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto custom-scrollbar px-6 pb-6 pt-2">
      {/* Title & Status */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold tracking-tight text-foreground leading-snug wrap-break-word flex-1">
            {action.title}
          </h3>
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 border",
              STATUS_BADGE_STYLES[action.status] || STATUS_BADGE_STYLES[ACTION_STATUS.ACTIVE]
            )}
          >
            {action.status}
          </span>
        </div>

        {action.note ? (
          <p className="text-sm text-muted-foreground/80 leading-relaxed bg-muted/20 border border-border/5 p-4 rounded-2xl whitespace-pre-wrap mt-2">
            {action.note}
          </p>
        ) : (
          <p className="text-xs italic text-muted-foreground/45 mt-1 px-1">
            No notes or subtasks attached to this action.
          </p>
        )}
      </div>

      {/* Metadata Badges */}
      <div className="flex flex-col bg-muted/30 border border-border/10 p-5 rounded-3xl divide-y divide-border/10">
        <div className="flex flex-col gap-1 pb-3">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40">
            Intention
          </span>
          <span
            className={cn(
              "text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-lg w-max text-center leading-none mt-1",
              getIntentionBadgeStyle(action.intention)
            )}
          >
            {action.intention}
          </span>
        </div>

        <div className="flex flex-col gap-1 py-3">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40">
            Energy Required
          </span>
          <span
            className={cn(
              "text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-lg w-max text-center leading-none mt-1",
              getEnergyBadgeStyle(action.energy)
            )}
          >
            {action.energy}
          </span>
        </div>

        <div className="flex flex-col gap-1 py-3">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40">
            Scheduled Date
          </span>
          <span className="text-xs font-bold text-foreground/80 flex items-center gap-1.5 mt-1">
            <Calendar className="size-3.5 text-muted-foreground/50 shrink-0" />
            {formatGoogleDate(action.scheduledDate)}
          </span>
        </div>

        <div className="flex flex-col gap-1 pt-3">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40">
            Timing & Span
          </span>
          <span className="text-xs font-bold text-foreground/80 flex items-center gap-1.5 mt-1">
            <Clock className="size-3.5 text-muted-foreground/50 shrink-0" />
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
        <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 px-1">
          Chronological Lifecycle History
        </h4>
        <div className="bg-card/45 border border-border/20 rounded-3xl p-4 overflow-hidden relative min-h-24 max-h-56 overflow-y-auto custom-scrollbar">
          {loadingEvents ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-xs">
              <Loader2 className="size-5 text-primary animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground/30 italic">
              No historical checkpoints recorded.
            </div>
          ) : (
            <div className="relative border-l border-border/20 ml-2.5 pl-5 py-1 space-y-5">
              {events.map((event) => {
                return (
                  <div key={event.eventId} className="relative group/item">
                    {/* Circle Node */}
                    <div
                      className={cn(
                        "absolute -left-6.5 top-1 size-3 rounded-full border bg-background transition-all flex items-center justify-center",
                        EVENT_NODE_STYLES[event.type] || "border-border/60"
                      )}
                    />
                    {/* Content */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-foreground/80">
                        {getEventName(event.type)}
                      </span>
                      <span className="text-[9px] text-muted-foreground/50 font-medium">
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
      <div className="flex items-center flex-wrap gap-2.5 mt-2 border-t border-border/10 pt-5">
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
            <RotateCcw className="size-3.5 text-muted-foreground" />
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
            <RotateCcw className="size-3.5 text-muted-foreground" />
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

        <Button variant="outline" size="sm" onClick={onEdit} className={BUTTON_STYLES.EDIT}>
          <Pencil className="size-3.5" />
          Edit Details
        </Button>

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
