import { useState, useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from "react";
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
  Plus,
  Minus,
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
import { addAction, updateAction, getRecentConfigs } from "../db/actions";
import type { Action } from "../types/events";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDiscardGuard } from "../hooks/useDiscardGuard";

interface ActionInputProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialDate?: string;
  className?: string;
  variant?: "inline" | "dialog";
  actionToEdit?: Action;
}

// TODO: Somehow we should allow user to move between input fields, so it is frictionless and requires less effort. Maybe enter, or arrows?
// TODO: NOT RELATED TO THIS COMPONENT, BUT IT IS BACKUP LOGIC. Allow user to import and export data.
// TODO: Create settings to allow user to set custom default values for the input fields. So that if user does a lot of 150 minutes tasks, he does not need to reenter it over again.
// TODO: Use config file instead of in line hard-coded settings, which should allow us to create custom settings with ease.

export interface ActionInputHandle {
  handleCancelAttempt: () => void;
}

const DurationStepper = ({
  value,
  label,
  onChange,
}: {
  value: number;
  label: string;
  onChange: (v: number) => void;
}) => {
  const getIncrement = (val: number) => (val < 60 ? 5 : 15);
  const getDecrement = (val: number) => (val <= 60 ? 5 : 15);

  return (
    <div className="flex flex-col gap-1.5 items-center flex-1 bg-muted/20 p-2.5 rounded-xl border border-border/30">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
        {label}
      </span>
      <div className="flex items-center gap-1.5 w-full justify-between mt-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 bg-background/50 hover:bg-background shadow-sm border border-border/40 text-muted-foreground hover:text-foreground rounded-lg transition-all active:scale-95 shrink-0"
          onClick={() => onChange(Math.max(0, value - getDecrement(value)))}
        >
          <Minus className="size-3" />
        </Button>
        <div className="font-bold text-[13px] text-foreground tracking-tight select-none">
          {value}m
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 bg-background/50 hover:bg-background shadow-sm border border-border/40 text-muted-foreground hover:text-foreground rounded-lg transition-all active:scale-95 shrink-0"
          onClick={() => onChange(value + getIncrement(value))}
        >
          <Plus className="size-3" />
        </Button>
      </div>
    </div>
  );
};

const DurationInputs = ({
  value,
  onChange,
}: {
  value: [number, number | null];
  onChange: (v: [number, number | null]) => void;
}) => {
  const currentMin = value[0];
  const currentMax = value[1] === null ? currentMin : value[1];

  const handleMinChange = (newMin: number) => {
    let newMax = currentMax;
    if (newMin > newMax) newMax = newMin;
    onChange([newMin, newMax]);
  };

  const handleMaxChange = (newMax: number) => {
    let newMin = currentMin;
    if (newMax < newMin) newMin = newMax;
    onChange([newMin, newMax]);
  };

  return (
    <div className="p-2 space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
          Custom Duration
        </p>
      </div>
      <div className="flex items-center gap-2">
        <DurationStepper value={currentMin} label="Min" onChange={handleMinChange} />
        <DurationStepper value={currentMax} label="Max" onChange={handleMaxChange} />
      </div>
    </div>
  );
};

const timeOptions = Array.from({ length: 96 }).map((_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  const value = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  return {
    label: `${displayHours}:${displayMinutes}${ampm}`,
    value: value,
  };
});

const formatTime12h = (time24: string) => {
  if (!time24) return "Time";
  const [h, m] = time24.split(":");
  const hours = parseInt(h, 10);
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${m}${ampm}`;
};

const formatGoogleDate = (dateStr: string) => {
  if (!dateStr) return "Date";
  // We use dateStr + 'T12:00:00' to avoid timezone shift issues from "YYYY-MM-DD"
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
};

const parseManualTime = (input: string): string | null => {
  const clean = input.trim().toLowerCase();
  if (!clean) return null;

  // Try HH:mm
  const hhmm = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    let h = parseInt(hhmm[1]);
    let m = parseInt(hhmm[2]);
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  // Try h am/pm
  const h_ampm = clean.match(/^(\d{1,2})\s*(am|pm)$/);
  if (h_ampm) {
    let h = parseInt(h_ampm[1]);
    const ampm = h_ampm[2];
    if (h >= 1 && h <= 12) {
      if (ampm === "pm" && h < 12) h += 12;
      if (ampm === "am" && h === 12) h = 0;
      return `${h.toString().padStart(2, "0")}:00`;
    }
  }

  // Try h:mm am/pm
  const hmm_ampm = clean.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
  if (hmm_ampm) {
    let h = parseInt(hmm_ampm[1]);
    let m = parseInt(hmm_ampm[2]);
    const ampm = hmm_ampm[3];
    if (h >= 1 && h <= 12 && m >= 0 && m < 60) {
      if (ampm === "pm" && h < 12) h += 12;
      if (ampm === "am" && h === 12) h = 0;
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  return null;
};

const allTimezones = (Intl as any).supportedValuesOf?.("timeZone") || [
  "UTC",
  Intl.DateTimeFormat().resolvedOptions().timeZone,
];

const getNearestTimeValue = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.round(minutes / 15) * 15;
  const hours = now.getHours() + (roundedMinutes === 60 ? 1 : 0);
  const finalMinutes = roundedMinutes === 60 ? 0 : roundedMinutes;
  return `${hours.toString().padStart(2, "0")}:${finalMinutes.toString().padStart(2, "0")}`;
};

export const ActionInput = forwardRef<ActionInputHandle, ActionInputProps>(
  ({ onSuccess, onCancel, initialDate, className, variant = "inline", actionToEdit }, ref) => {
    const [title, setTitle] = useState(actionToEdit?.title || "");
    const [note, setNote] = useState(actionToEdit?.note || "");
    const [intention, setIntention] = useState<"must" | "want">(actionToEdit?.intention || "want");
    const [isImportant, setIsImportant] = useState(actionToEdit?.important || false);
    const [energy, setEnergy] = useState<"low" | "medium" | "high">(
      actionToEdit?.energy || "medium"
    );
    const [duration, setDuration] = useState<[number, number | null]>(
      actionToEdit?.duration ? [actionToEdit.duration[0], actionToEdit.duration[1]] : [15, 30]
    );
    const [scheduledDate, setScheduledDate] = useState(
      actionToEdit?.scheduledDate || initialDate || new Date().toLocaleDateString("en-CA")
    );
    const [startTime, setStartTime] = useState<string>(actionToEdit?.startTime || "");
    const [endTime, setEndTime] = useState<string>(actionToEdit?.endTime || "");
    const [timezone, setTimezone] = useState<string>(
      actionToEdit?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    const [timezoneSearch, setTimezoneSearch] = useState("");
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

    const hasChanges = useMemo(() => {
      const initialTitle = actionToEdit?.title || "";
      const initialNote = actionToEdit?.note || "";
      const initialIntention = actionToEdit?.intention || "want";
      const initialEnergy = actionToEdit?.energy || "medium";
      const initialImportant = actionToEdit?.important || false;
      const initialDurationMin = actionToEdit?.duration?.[0] ?? 15;
      const initialDurationMax = actionToEdit?.duration?.[1] ?? 30;
      const initialScheduledDate =
        actionToEdit?.scheduledDate || initialDate || new Date().toLocaleDateString("en-CA");
      const initialStartTime = actionToEdit?.startTime || "";
      const initialEndTime = actionToEdit?.endTime || "";

      return (
        title.trim() !== initialTitle ||
        note.trim() !== initialNote ||
        intention !== initialIntention ||
        energy !== initialEnergy ||
        isImportant !== initialImportant ||
        duration[0] !== initialDurationMin ||
        (duration[1] ?? duration[0]) !== initialDurationMax ||
        scheduledDate !== initialScheduledDate ||
        startTime !== initialStartTime ||
        endTime !== initialEndTime
      );
    }, [
      title,
      note,
      intention,
      energy,
      isImportant,
      duration,
      scheduledDate,
      startTime,
      endTime,
      actionToEdit,
      initialDate,
    ]);

    const { showConfirmDialog, setShowConfirmDialog, handleCancelAttempt, handleConfirmDiscard } =
      useDiscardGuard({
        hasChanges,
        onDiscard: onCancel,
      });

    useImperativeHandle(ref, () => ({
      handleCancelAttempt,
    }));

    useEffect(() => {
      titleInputRef.current?.focus();
    }, []);

    const handleSubmit = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!title.trim() || isLoading) return;

      setIsLoading(true);
      try {
        const payload = {
          title: title.trim(),
          note: note.trim(),
          intention,
          important: isImportant,
          energy,
          duration: [duration[0], duration[1] ?? duration[0]] as [number, number],
          scheduledDate,
          startTime: startTime || undefined,
          endTime: endTime || undefined,
          timezone,
        };

        if (actionToEdit) {
          await updateAction(actionToEdit.id, payload);
        } else {
          await addAction(payload);
        }

        setTitle("");
        setNote("");
        queryClient.invalidateQueries({ queryKey: ["actions"] });
        onSuccess?.();
      } catch (error) {
        console.error("Failed to save action:", error);
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
        <form onSubmit={handleSubmit} className="flex flex-col">
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
              contentClassName="w-[280px]"
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

            <div className="flex items-center gap-1">
              <ActionSelector
                label={formatGoogleDate(scheduledDate)}
                options={[
                  {
                    label: "Today",
                    value: new Date().toLocaleDateString("en-CA"),
                  },
                  {
                    label: "Tomorrow",
                    value: new Date(Date.now() + 86400000).toLocaleDateString("en-CA"),
                  },
                ]}
                onSelect={(val) => {
                  if (val === "custom") {
                    // TODO: open calendar picker
                  } else {
                    setScheduledDate(val);
                  }
                }}
                value={scheduledDate}
                triggerClassName="bg-muted/30 border-none hover:bg-muted/50 rounded-md px-3 h-8 shadow-none"
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

              <ActionSelector
                label={startTime ? formatTime12h(startTime) : "Time"}
                options={timeOptions}
                scrollTargetValue={getNearestTimeValue()}
                onSelect={(val) => {
                  handleStartTimeChange(val);
                  if (val && endTime && val > endTime) {
                    setIsTimeInvalid(true);
                  } else {
                    setIsTimeInvalid(false);
                  }
                }}
                value={startTime}
                triggerClassName={cn(
                  "bg-muted/30 border-none hover:bg-muted/50 rounded-md px-3 h-8 shadow-none",
                  !startTime && "text-muted-foreground/50"
                )}
                contentClassName="max-h-[350px] overflow-y-auto w-[180px]"
              >
                <div className="p-2 flex flex-col gap-2">
                  <Input
                    placeholder="Custom (e.g. 5pm)"
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Enter") {
                        const parsed = parseManualTime(e.currentTarget.value);
                        if (parsed) {
                          handleStartTimeChange(parsed);
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                    className="h-8 text-xs bg-muted/20 border-none px-2 focus-visible:ring-1 focus-visible:ring-primary/20"
                  />
                  {startTime && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStartTime("");
                        setEndTime("");
                        setIsTimeInvalid(false);
                      }}
                      className="w-full text-[10px] uppercase font-bold tracking-widest text-red-500 hover:text-red-600 hover:bg-red-500/10 h-7"
                    >
                      Clear time
                    </Button>
                  )}
                </div>
              </ActionSelector>

              {startTime && (
                <>
                  <span className="text-muted-foreground/50 px-0.5 font-medium">-</span>
                  <ActionSelector
                    label={endTime ? formatTime12h(endTime) : "End"}
                    options={timeOptions}
                    scrollTargetValue={getNearestTimeValue()}
                    onSelect={(val) => {
                      setEndTime(val);
                      if (startTime && val < startTime) {
                        setIsTimeInvalid(true);
                      } else {
                        setIsTimeInvalid(false);
                      }
                    }}
                    value={endTime}
                    triggerClassName={cn(
                      "bg-muted/30 border-none hover:bg-muted/50 rounded-md px-3 h-8 shadow-none",
                      isTimeInvalid && "ring-1 ring-red-500/50"
                    )}
                    contentClassName="max-h-[350px] overflow-y-auto w-[180px]"
                  >
                    <div className="p-2 flex flex-col gap-2">
                      <Input
                        placeholder="Custom (e.g. 6:30pm)"
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter") {
                            const parsed = parseManualTime(e.currentTarget.value);
                            if (parsed) {
                              setEndTime(parsed);
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                        className="h-8 text-xs bg-muted/20 border-none px-2 focus-visible:ring-1 focus-visible:ring-primary/20"
                      />
                    </div>
                  </ActionSelector>
                </>
              )}

              <ActionSelector
                label={timezone.split("/").pop()?.replace("_", " ") || timezone}
                options={allTimezones
                  .filter((tz: string) =>
                    tz.toLowerCase().includes(timezoneSearch.toLowerCase())
                  )
                  .slice(0, 50) // Limit for performance
                  .map((tz: string) => ({
                    label: tz.replace("_", " "),
                    value: tz,
                  }))}
                onSelect={(val) => {
                  setTimezone(val);
                  setTimezoneSearch("");
                }}
                value={timezone}
                triggerClassName="bg-muted/30 border-none hover:bg-muted/50 rounded-md px-3 h-8 shadow-none text-muted-foreground/60 text-[11px]"
                contentClassName="max-h-[300px] overflow-y-auto w-[220px]"
                title="Scheduling Timezone"
              >
                <div className="p-2 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-1">
                    Search Timezone
                  </p>
                  <Input
                    placeholder="Enter city or zone..."
                    value={timezoneSearch}
                    onChange={(e) => setTimezoneSearch(e.target.value)}
                    className="h-8 text-[12px] bg-muted/30 border-none px-2 focus-visible:ring-1 focus-visible:ring-primary/20"
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </ActionSelector>
            </div>
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
                {actionToEdit ? "Update task" : "Add task"}
              </Button>
            </div>
          </div>
        </form>

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent
            showCloseButton={false}
            className="max-w-100 p-6 bg-popover border border-border/50 shadow-2xl rounded-xl"
          >
            <DialogHeader className="gap-2">
              <DialogTitle className="text-[17px] font-bold tracking-tight text-foreground">
                Discard unsaved changes?
              </DialogTitle>
              <DialogDescription className="text-[14px] text-muted-foreground leading-relaxed font-medium">
                Your unsaved changes will be discarded.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-row justify-end gap-3 mt-6 bg-transparent border-none p-0 mx-0 mb-0">
              <Button
                variant="secondary"
                onClick={() => setShowConfirmDialog(false)}
                className="h-9 px-4 rounded-lg font-bold transition-all active:scale-95 border-none"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleConfirmDiscard}
                className="h-9 px-4 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold transition-all active:scale-95 border-none"
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
