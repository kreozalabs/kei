import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import {
  MoreHorizontal,
  AudioLines,
  Clock,
  BatteryMedium,
  BatteryFull,
  BatteryLow,
  Heart,
  AlertCircle,
  Star,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Button,
  Textarea,
  cn,
} from "@kreozalabs/ui";
import { ActionSelector } from "./ActionSelector";
import { addAction, getRecentConfigs } from "../db/actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDiscardGuard } from "../hooks/useDiscardGuard";

interface ActionInputProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialDate?: string;
  className?: string;
  variant?: "inline" | "dialog";
}

// TODO: Somehow we should allow user to move between input fields, so it is frictionless and requires less effort. Maybe enter, or arrows?
// TODO: NOT RELATED TO THIS COMPONENT, BUT IT IS BACKUP LOGIC. Allow user to import and export data.
// TODO: Create settings to allow user to set custom default values for the input fields. So that if user does a lot of 150 minutes tasks, he does not need to reenter it over again.
// TODO: Use config file instead of in line hard-coded settings, which should allow us to create custom settings with ease.

export interface ActionInputHandle {
  handleCancelAttempt: () => void;
}

const DurationInputs = ({
  value,
  onChange,
}: {
  value: [number, number | null];
  onChange: (v: [number, number | null]) => void;
}) => {
  const [min, setMin] = useState(value[0].toString());
  const [max, setMax] = useState(value[1]?.toString() || "");

  useEffect(() => {
    setMin(value[0].toString());
    setMax(value[1]?.toString() || "");
  }, [value]);

  const minVal = parseInt(min) || 0;
  const maxVal = max === "" ? null : parseInt(max);
  const isInvalid = maxVal !== null && maxVal < minVal;

  const handleBlur = () => {
    if (!isInvalid) {
      onChange([minVal, maxVal]);
    }
  };

  return (
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
          Custom (min - max)
        </p>
        {isInvalid && (
          <p className="text-[9px] font-bold uppercase text-red-500 animate-pulse">
            Max must be ≥ Min
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Min"
          value={min}
          className={cn(
            "h-8 text-[12px] font-bold bg-muted/30 border-none focus-visible:ring-1 transition-all",
            isInvalid ? "focus-visible:ring-red-500/50" : "focus-visible:ring-primary/20"
          )}
          onChange={(e) => setMin(e.target.value)}
          onBlur={handleBlur}
        />
        <span
          className={cn(
            "font-bold transition-colors",
            isInvalid ? "text-red-500/50" : "text-muted-foreground/30"
          )}
        >
          -
        </span>
        <Input
          type="number"
          placeholder="Max (opt)"
          value={max}
          className={cn(
            "h-8 text-[12px] font-bold bg-muted/30 border-none focus-visible:ring-1 transition-all",
            isInvalid
              ? "focus-visible:ring-red-500/50 ring-1 ring-red-500/20"
              : "focus-visible:ring-primary/20"
          )}
          onChange={(e) => setMax(e.target.value)}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
};

const TimeInputs = ({
  startTime: initialStartTime,
  endTime: initialEndTime,
  onChange,
  onErrorChange,
}: {
  startTime: string;
  endTime: string;
  onChange: (start: string, end: string) => void;
  onErrorChange?: (hasError: boolean) => void;
}) => {
  const [start, setStart] = useState(initialStartTime);
  const [end, setEnd] = useState(initialEndTime);

  const isInvalid = start && end && end < start;

  useEffect(() => {
    onErrorChange?.(!!isInvalid);
  }, [isInvalid, onErrorChange]);

  useEffect(() => {
    setStart(initialStartTime);
    setEnd(initialEndTime);
  }, [initialStartTime, initialEndTime]);

  return (
    <div className="p-2 space-y-2">
      <div className="space-y-1">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Start Time
          </p>
          {isInvalid && (
            <p className="text-[9px] font-bold uppercase text-red-500 animate-pulse">
              End must be after Start
            </p>
          )}
        </div>
        <Input
          type="time"
          value={start}
          max={end || undefined}
          onChange={(e) => {
            setStart(e.target.value);
            onChange(e.target.value, end);
          }}
          className={cn(
            "h-8 text-[12px] font-bold bg-muted/30 border-none focus-visible:ring-1 transition-all",
            isInvalid ? "focus-visible:ring-red-500/50" : "focus-visible:ring-primary/20"
          )}
        />
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-1">
          End Time (optional)
        </p>
        <Input
          type="time"
          value={end}
          min={start || undefined}
          onChange={(e) => {
            setEnd(e.target.value);
            onChange(start, e.target.value);
          }}
          className={cn(
            "h-8 text-[12px] font-bold bg-muted/30 border-none focus-visible:ring-1 transition-all",
            isInvalid
              ? "focus-visible:ring-red-500/50 ring-1 ring-red-500/20"
              : "focus-visible:ring-primary/20"
          )}
        />
      </div>
      {start && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setStart("");
            setEnd("");
            onChange("", "");
          }}
          className="w-full text-[10px] uppercase font-bold tracking-widest text-red-500 hover:text-red-600 hover:bg-red-500/10 h-7"
        >
          Clear time
        </Button>
      )}
    </div>
  );
};

export const ActionInput = forwardRef<ActionInputHandle, ActionInputProps>(
  ({ onSuccess, onCancel, initialDate, className, variant = "inline" }, ref) => {
    const [title, setTitle] = useState("");
    const [note, setNote] = useState("");
    const [intention, setIntention] = useState<"must" | "want">("want");
    const [isImportant, setIsImportant] = useState(false);
    const [energy, setEnergy] = useState<"low" | "medium" | "high">("medium");
    const [duration, setDuration] = useState<[number, number | null]>([15, 30]);
    const [scheduledDate, setScheduledDate] = useState(
      initialDate || new Date().toLocaleDateString("en-CA")
    );
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [isTimeInvalid, setIsTimeInvalid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();
    const titleInputRef = useRef<HTMLInputElement>(null);

    // Auto-calculate duration from times OR times from duration
    const isCalculatingRef = useRef(false);

    useEffect(() => {
      if (isCalculatingRef.current) return;
      if (startTime && endTime) {
        const [startH, startM] = startTime.split(":").map(Number);
        const [endH, endM] = endTime.split(":").map(Number);
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;

        if (endTotal > startTotal) {
          const diff = endTotal - startTotal;
          isCalculatingRef.current = true;
          setDuration([diff, diff]);
          setTimeout(() => (isCalculatingRef.current = false), 0);
        }
      }
    }, [startTime, endTime]);

    // Update endTime if startTime changes but we want to maintain current duration
    const handleStartTimeChange = (newStart: string) => {
      setStartTime(newStart);
      if (newStart && duration[0] > 0) {
        const [h, m] = newStart.split(":").map(Number);
        const newEndTotalM = Math.min(23 * 60 + 59, h * 60 + m + duration[0]);
        const newEndH = Math.floor(newEndTotalM / 60);
        const newEndM = newEndTotalM % 60;
        const formattedEnd = `${newEndH.toString().padStart(2, "0")}:${newEndM.toString().padStart(2, "0")}`;
        setEndTime(formattedEnd);
      }
    };

    const { data: recentConfigs = [] } = useQuery({
      queryKey: ["recent-configs"],
      queryFn: getRecentConfigs,
    });

    const { showConfirmDialog, setShowConfirmDialog, handleCancelAttempt, handleConfirmDiscard } =
      useDiscardGuard({
        hasChanges: title.trim() !== "" || note.trim() !== "",
        onDiscard: onCancel,
      });

    useImperativeHandle(ref, () => ({
      handleCancelAttempt,
    }));

    useEffect(() => {
      titleInputRef.current?.focus();
    }, []);

    const handleAdd = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!title.trim() || isLoading) return;

      setIsLoading(true);
      try {
        await addAction({
          title: title.trim(),
          note: note.trim(),
          intention,
          important: isImportant,
          energy,
          duration: [duration[0], duration[1] ?? duration[0]] as [number, number],
          scheduledDate,
          startTime: startTime || undefined,
          endTime: endTime || undefined,
        });

        setTitle("");
        setNote("");
        queryClient.invalidateQueries({ queryKey: ["actions"] });
        onSuccess?.();
      } catch (error) {
        console.error("Failed to add action:", error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div
        className={cn(
          "flex flex-col w-full transition-all duration-300 ease-out",
          variant === "inline"
            ? "bg-card/40 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl overflow-hidden"
            : "bg-transparent border-none rounded-none",
          className
        )}
      >
        <form onSubmit={handleAdd} className="flex flex-col">
          {/* Input Section */}
          <div className="p-5 flex flex-col gap-2">
            {/* Recent Configs */}
            {recentConfigs.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {recentConfigs.map((config, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDuration(config.duration || [15, 30]);
                      setEnergy(config.energy || "medium");
                      setIntention(config.intention || "want");
                      setIsImportant(config.important || false);
                    }}
                    className="h-7 px-2.5 rounded-lg bg-primary/5 hover:bg-primary/10 text-[11px] font-bold text-primary/70 transition-all border border-primary/10 active:scale-95"
                  >
                    {config.duration?.[0] === config.duration?.[1] || !config.duration?.[1]
                      ? `${config.duration?.[0]}m`
                      : `${config.duration?.[0]}-${config.duration?.[1]}m`}
                    <span className="mx-1 opacity-30">·</span>
                    {config.energy}
                    <span className="mx-1 opacity-30">·</span>
                    {config.intention}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 flex flex-col gap-4">
                <Input
                  ref={titleInputRef}
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  placeholder="What do you want to accomplish?"
                  className="h-8 p-0 text-[17px] font-bold bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/30 selection:bg-primary/20"
                  disabled={isLoading}
                />
                <Textarea
                  value={note}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                  placeholder="Any notes or constraints?"
                  className="min-h-0 h-auto p-0 text-[14px] leading-relaxed bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/20 resize-none overflow-hidden"
                  style={{ height: note ? "auto" : "20px" }}
                  disabled={isLoading}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 rounded-xl text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
              >
                {/* TODO: Make it work with device micro */}
                <AudioLines className="size-5" />
              </Button>
            </div>
          </div>

          {/* Action Chips Row */}
          <div className="px-5 pb-5 mt-5 flex flex-wrap gap-2.5 items-center">
            <ActionSelector
              icon={<Clock className="size-3.5 text-blue-500/70" />}
              label={
                !duration[1] || duration[0] === duration[1]
                  ? `${duration[0]} mins`
                  : duration[0] === 60
                    ? "1 hr+"
                    : `${duration[0]} - ${duration[1]} mins`
              }
              options={[
                {
                  label: "<15 mins",
                  value: [0, 15] as [number, number],
                  icon: <Clock className="size-4 text-muted-foreground" />,
                },
                {
                  label: "15 mins",
                  value: [15, 15] as [number, number],
                  icon: <Clock className="size-4 text-muted-foreground" />,
                },
                {
                  label: "15 - 30 mins",
                  value: [15, 30] as [number, number],
                  icon: <Clock className="size-4 text-muted-foreground" />,
                },
                {
                  label: "30 - 60 mins",
                  value: [30, 60] as [number, number],
                  icon: <Clock className="size-4 text-muted-foreground" />,
                },
                {
                  label: "1 hour+",
                  value: [60, 120] as [number, number],
                  icon: <Clock className="size-4 text-muted-foreground" />,
                },
              ]}
              onSelect={(val) => setDuration(val as [number, number | null])}
              value={duration}
            >
              <DurationInputs value={duration} onChange={setDuration} />
            </ActionSelector>

            <ActionSelector
              icon={
                energy === "high" ? (
                  <BatteryFull className="size-3.5 text-red-500" />
                ) : energy === "medium" ? (
                  <BatteryMedium className="size-3.5 text-yellow-500" />
                ) : (
                  <BatteryLow className="size-3.5 text-green-500" />
                )
              }
              label={`${energy} energy`}
              options={[
                {
                  label: "Low energy",
                  value: "low",
                  icon: <BatteryLow className="size-4" />,
                  className: "text-green-500",
                },
                {
                  label: "Medium energy",
                  value: "medium",
                  icon: <BatteryMedium className="size-4" />,
                  className: "text-yellow-500",
                },
                {
                  label: "High energy",
                  value: "high",
                  icon: <BatteryFull className="size-4" />,
                  className: "text-red-500",
                },
              ]}
              onSelect={setEnergy}
              value={energy}
            />

            <ActionSelector
              icon={<Calendar className="size-3.5 text-purple-500/70" />}
              label={
                scheduledDate === new Date().toLocaleDateString("en-CA")
                  ? "Today"
                  : scheduledDate === new Date(Date.now() + 86400000).toLocaleDateString("en-CA")
                    ? "Tomorrow"
                    : new Date(scheduledDate + "T12:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
              }
              options={[
                {
                  label: "Today",
                  value: new Date().toLocaleDateString("en-CA"),
                  icon: <Calendar className="size-4 text-muted-foreground" />,
                },
                {
                  label: "Tomorrow",
                  value: new Date(Date.now() + 86400000).toLocaleDateString("en-CA"),
                  icon: <Calendar className="size-4 text-muted-foreground" />,
                },
              ]}
              onSelect={(val) => {
                if (val === "custom") {
                  // TODO: open a full calendar picker instead of native date picker
                } else {
                  setScheduledDate(val);
                }
              }}
              value={scheduledDate}
            >
              <div className="p-2 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-1">
                  Custom Date
                </p>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="h-8 text-[12px] font-bold bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 block w-full"
                />
              </div>
            </ActionSelector>

            {/* TODO: Create a better time picker, maybe with a slider? */}
            <ActionSelector
              icon={<Clock className="size-3.5 text-emerald-500/70" />}
              label={
                startTime ? (endTime ? `${startTime} - ${endTime}` : `At ${startTime}`) : "Any time"
              }
              options={[]}
              onSelect={() => {}}
            >
              <TimeInputs
                startTime={startTime}
                endTime={endTime}
                onChange={(s, e) => {
                  if (s !== startTime) {
                    handleStartTimeChange(s);
                  } else {
                    setStartTime(s);
                    setEndTime(e);
                  }
                }}
                onErrorChange={setIsTimeInvalid}
              />
            </ActionSelector>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted/80 transition-all font-bold"
              // TODO: Add something or remove
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 flex items-center justify-between gap-4 bg-muted/5">
            <div className="flex items-center gap-1">
              <ActionSelector
                variant="ghost"
                icon={
                  <div
                    className={cn(
                      "size-5 rounded-md flex items-center justify-center",
                      intention === "must" ? "bg-orange-500/10" : "bg-pink-500/10"
                    )}
                  >
                    {intention === "must" ? (
                      <AlertCircle className="size-3.5 text-orange-500" />
                    ) : (
                      <Heart className="size-3.5 text-pink-500" />
                    )}
                  </div>
                }
                label={intention === "must" ? "Must do" : "Want to do"}
                options={[
                  {
                    label: "Want to do",
                    value: "want",
                    icon: <Heart className="size-4 text-pink-500" />,
                  },
                  {
                    label: "Must do",
                    value: "must",
                    icon: <AlertCircle className="size-4 text-orange-500" />,
                  },
                ]}
                onSelect={setIntention}
                value={intention}
                triggerClassName="h-9 px-3 rounded-xl hover:bg-muted/50 font-bold text-muted-foreground/70 hover:text-foreground border-none"
              />

              <ActionSelector
                variant="ghost"
                icon={
                  <div
                    className={cn(
                      "size-5 rounded-md flex items-center justify-center",
                      isImportant ? "bg-amber-500/10" : "bg-muted/30"
                    )}
                  >
                    <Star
                      className={cn(
                        "size-3.5 mb-0.5",
                        isImportant ? "text-amber-500 fill-amber-500" : "text-muted-foreground/40"
                      )}
                    />
                  </div>
                }
                label={isImportant ? "Important" : ""}
                options={[
                  {
                    label: "Regular",
                    value: false,
                    icon: <Star className="size-4 text-muted-foreground/40" />,
                  },
                  {
                    label: "Important",
                    value: true,
                    icon: <Star className="size-4 text-amber-500 fill-amber-500" />,
                  },
                ]}
                onSelect={setIsImportant}
                value={isImportant}
                triggerClassName="h-9 px-3 rounded-xl hover:bg-muted/50 font-bold text-muted-foreground/70 hover:text-foreground border-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCancelAttempt}
                className="h-10 px-5 rounded-xl bg-muted/50 hover:bg-muted font-bold text-sm transition-all border-none active:scale-95"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={isLoading || !title.trim() || isTimeInvalid}
                className="h-10 px-6 rounded-xl font-bold text-sm shadow-xl shadow-primary/10 transition-all bg-primary/10 hover:bg-primary/15 text-primary active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                Add task
              </Button>
            </div>
          </div>
        </form>

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent
            showCloseButton={false}
            className="max-w-100 p-6 bg-zinc-900 border border-zinc-100/10 shadow-2xl rounded-2xl"
          >
            <DialogHeader className="gap-2">
              <DialogTitle className="text-[17px] font-bold tracking-tight text-white">
                Discard unsaved changes?
              </DialogTitle>
              <DialogDescription className="text-[14px] text-zinc-400 leading-relaxed font-medium">
                Your unsaved changes will be discarded.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-row justify-end gap-3 mt-6 bg-transparent border-none p-0 mx-0 mb-0">
              <Button
                variant="ghost"
                onClick={() => setShowConfirmDialog(false)}
                className="h-9 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-all active:scale-95 border-none"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDiscard}
                className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-all active:scale-95"
              >
                Discard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);
