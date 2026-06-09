import {
  ArrowDownToLine,
  ArrowUpToLine,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  ChevronsUpDown,
  Clock,
  Star,
} from "lucide-react";
import { ActionSelector } from "../ActionSelector";
import { NextDayBadge } from "../NextDayBadge";
import { addAction, updateAction } from "../../db/actions";
import type { Action, EnergyType, IntentionType } from "../../types/actions";
import { useQueryClient } from "@tanstack/react-query";
import { useDiscardGuard } from "../../hooks/useDiscardGuard";
import { useSettings } from "../../providers/SettingsContext";
import { useDb } from "../../providers/DbContext";
import { MicroCalendar } from "../MicroCalendar";
import { TimezoneSelector } from "../TimezoneSelector";
import {
  formatTime,
  timeToMinutes,
  minutesToTime,
  getTodayString,
  getTomorrowString,
  formatGoogleDate,
  getTimeOptions,
  parseManualTime,
  formatDuration,
} from "../../utils/time";
import {
  DEFAULT_CONFIG,
  ENERGY_LEVELS,
  INTENTIONS,
  ENERGY_OPTIONS,
  TIMEZONES,
} from "../../config/constants";
import { DurationInputs } from "./DurationInputs";
import { DiscardDialog } from "./DiscardDialog";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Button, cn, Input, Textarea, Checkbox, toast } from "@kreozalabs/ui";

export interface ActionInputProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialDate?: string;
  className?: string;
  variant?: "inline" | "dialog";
  actionToEdit?: Action;
}

export interface ActionInputHandle {
  handleCancelAttempt: () => void;
}

const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
    const { settings } = useSettings();
    const { isDbReady } = useDb();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState(actionToEdit?.title || DEFAULT_CONFIG.TITLE);
    const [note, setNote] = useState(actionToEdit?.note || "");
    const [intention, setIntention] = useState<IntentionType>(
      actionToEdit?.intention || (settings.default_intention as IntentionType)
    );
    const [isImportant, setIsImportant] = useState(actionToEdit?.important || false);
    const [energy, setEnergy] = useState<EnergyType>(
      actionToEdit?.energy || (settings.default_energy as EnergyType)
    );

    const [duration, setDuration] = useState<[number, number | null]>(() => {
      if (actionToEdit?.duration) return [actionToEdit.duration[0], actionToEdit.duration[1]];

      // Use the first duration preset if available, otherwise fallback to hardcoded default
      const firstPreset = settings.action_duration_options[0];
      return firstPreset ? firstPreset.value : DEFAULT_CONFIG.DURATION;
    });
    const [scheduledDate, setScheduledDate] = useState(
      actionToEdit?.scheduledDate || initialDate || getTodayString()
    );
    const [startTime, setStartTime] = useState<string>(actionToEdit?.startTime || "");
    const [endTime, setEndTime] = useState<string>(actionToEdit?.endTime || "");
    const [timezone, setTimezone] = useState<string>(
      actionToEdit?.timezone ||
        (settings.timezone === TIMEZONES.AUTO ? localTimezone : settings.timezone)
    );
    const [insertAtTop, setInsertAtTop] = useState(settings.default_insert_at_top || false);

    const [timezoneOpen, setTimezoneOpen] = useState(false);
    const [isTimeInvalid, setIsTimeInvalid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        handleCancelAttempt();
      }
    };

    const timeFormat = settings.time_format;

    const titleInputRef = useRef<HTMLTextAreaElement>(null);
    const noteInputRef = useRef<HTMLTextAreaElement>(null);

    const timeOptions = useMemo(() => getTimeOptions(timeFormat), [timeFormat]);
    const energyOption = ENERGY_OPTIONS.find((opt) => opt.value === energy) || ENERGY_OPTIONS[1];

    const energyOptionsWithIcons = useMemo(
      () =>
        ENERGY_OPTIONS.map((opt) => {
          const Icon =
            opt.value === ENERGY_LEVELS.HIGH
              ? BatteryFull
              : opt.value === ENERGY_LEVELS.MEDIUM
                ? BatteryMedium
                : BatteryLow;
          return {
            ...opt,
            icon: <Icon className="size-4" />,
            className: opt.color,
          };
        }),
      []
    );

    const EnergyIcon = useMemo(() => {
      switch (energy) {
        case ENERGY_LEVELS.HIGH:
          return BatteryFull;
        case ENERGY_LEVELS.MEDIUM:
          return BatteryMedium;
        case ENERGY_LEVELS.LOW:
          return BatteryLow;
        default:
          return BatteryMedium;
      }
    }, [energy]);

    const isCalculatingRef = useRef(false);

    const handleStartTimeChange = (newStart: string) => {
      setStartTime(newStart);
      if (isCalculatingRef.current) return;
      const targetDuration = duration[1] || duration[0];
      if (newStart && targetDuration > 0) {
        const newEndTotalM = timeToMinutes(newStart) + targetDuration;
        const formattedEnd = minutesToTime(newEndTotalM);

        isCalculatingRef.current = true;
        setEndTime(formattedEnd);
        setTimeout(() => (isCalculatingRef.current = false), 0);
      }
    };

    const handleEndTimeChange = (newEnd: string) => {
      setEndTime(newEnd);
    };

    const handleDurationChange = (newDuration: [number, number | null]) => {
      setDuration(newDuration);
      if (isCalculatingRef.current) return;
      const targetDuration = newDuration[1] || newDuration[0];
      if (startTime && targetDuration > 0) {
        const newEndTotalM = timeToMinutes(startTime) + targetDuration;
        const formattedEnd = minutesToTime(newEndTotalM);

        isCalculatingRef.current = true;
        setEndTime(formattedEnd);
        setTimeout(() => (isCalculatingRef.current = false), 0);
      }
    };

    const hasChanges = useMemo(() => {
      // Define the "Empty State" check for New Actions
      const isNewAction = !actionToEdit;
      const isBaseEmpty = !title.trim() && !note.trim();

      // If it's a new draft and nothing has been typed yet, don't trigger the guard
      // regardless of other setting changes (Energy, Intention, etc.)
      if (isNewAction && isBaseEmpty) return false;

      const initialTitle = actionToEdit?.title || DEFAULT_CONFIG.TITLE;
      const initialNote = actionToEdit?.note || "";
      const initialIntention = actionToEdit?.intention || DEFAULT_CONFIG.INTENTION;
      const initialEnergy = actionToEdit?.energy || DEFAULT_CONFIG.ENERGY;
      const initialImportant = actionToEdit?.important || false;
      const initialDurationMin = actionToEdit?.duration?.[0] ?? DEFAULT_CONFIG.DURATION[0];
      const initialDurationMax = actionToEdit?.duration?.[1] ?? DEFAULT_CONFIG.DURATION[1];
      const initialScheduledDate = actionToEdit?.scheduledDate || initialDate || getTodayString();
      const initialStartTime = actionToEdit?.startTime || "";
      const initialEndTime = actionToEdit?.endTime || "";
      const initialTimezone =
        actionToEdit?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

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
        endTime !== initialEndTime ||
        timezone !== initialTimezone
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
      timezone,
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
          insertAtTop,
        };

        const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
        if (actionToEdit) {
          queryClient.setQueriesData<Action[]>({ queryKey: ["actions"] }, (oldData) => {
            if (!oldData) return [];
            return oldData.map((a) => (a.id === actionToEdit.id ? { ...a, ...payload } : a));
          });
        }

        // Reset the input state immediately for a fast responsive feel
        setTitle("");
        setNote("");
        setInsertAtTop(false);
        setIsLoading(false);
        onSuccess?.();

        // Perform the write asynchronously in the background
        if (actionToEdit) {
          const originalAction = actionToEdit;
          updateAction(actionToEdit.id, payload)
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ["actions"] });
              if (settings.enable_undo_toast) {
                toast.success(`"${payload.title}" updated`, {
                  action: {
                    label: "Undo",
                    onClick: async () => {
                      const revertedQueries = queryClient.getQueriesData<Action[]>({
                        queryKey: ["actions"],
                      });
                      previousQueries.forEach(([queryKey, data]) => {
                        queryClient.setQueryData(queryKey, data);
                      });
                      try {
                        const revertPayload = {
                          title: originalAction.title,
                          note: originalAction.note || "",
                          intention: originalAction.intention,
                          important: originalAction.important,
                          energy: originalAction.energy,
                          duration: originalAction.duration as [number, number],
                          scheduledDate: originalAction.scheduledDate,
                          startTime: originalAction.startTime || undefined,
                          endTime: originalAction.endTime || undefined,
                          timezone: originalAction.timezone,
                          sortOrder: originalAction.sortOrder,
                        };
                        await updateAction(originalAction.id, revertPayload);
                        queryClient.invalidateQueries({ queryKey: ["actions"] });
                        toast.success("Reverted updates");
                      } catch (err) {
                        console.error(err);
                        revertedQueries.forEach(([queryKey, data]) => {
                          queryClient.setQueryData(queryKey, data);
                        });
                      }
                    },
                  },
                });
              }
            })
            .catch((error) => {
              console.error("Failed to save action:", error);
              previousQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
            });
        } else {
          addAction(payload)
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ["actions"] });
            })
            .catch((error) => {
              console.error("Failed to save action:", error);
            });
        }
      } catch (error) {
        console.error("Failed to prepare action save:", error);
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
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col">
          {/* Engine Syncing Notice */}
          {!isDbReady && (
            <div className="bg-amber-500/10 border-b border-amber-500/10 px-4 py-2.5 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 select-none">
                Database Syncing (inputs locked)
              </span>
            </div>
          )}
          {/* Input Section */}
          <div className="p-4 sm:p-5 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              <div className="flex-1 min-w-0 flex flex-col gap-4">
                <Textarea
                  ref={titleInputRef}
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      noteInputRef.current?.focus();
                    }
                  }}
                  placeholder="What do you want to accomplish?"
                  className="h-8 p-0 text-[17px] font-bold bg-transparent border-none dark:bg-transparent dark:border-none focus-visible:ring-0 placeholder:text-muted-foreground/30 selection:bg-primary/20 resize-none overflow-y-auto w-full break-all custom-scrollbar"
                  disabled={isLoading || !isDbReady}
                />
                <Textarea
                  ref={noteInputRef}
                  value={note}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Any notes or constraints?"
                  className="h-20 p-0 text-[14px] leading-relaxed bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/20 resize-none overflow-y-auto w-full break-all custom-scrollbar"
                  disabled={isLoading || !isDbReady}
                />
              </div>
            </div>
          </div>

          {/* Action Chips Row */}
          <div
            className={cn(
              "px-4 sm:px-5 pb-5 mt-5 flex flex-wrap gap-2 sm:gap-2.5 items-center",
              !isDbReady && "opacity-50 pointer-events-none"
            )}
          >
            <ActionSelector
              icon={<Clock className="size-3.5 text-blue-500/70" />}
              label={formatDuration(duration[0], duration[1])}
              options={settings.action_duration_options.map((opt) => ({
                ...opt,
                icon: <Clock className="size-4 text-muted-foreground" />,
              }))}
              onSelect={(val) => handleDurationChange(val as [number, number | null])}
              value={duration}
              contentClassName="w-[280px]"
            >
              <DurationInputs value={duration} onChange={handleDurationChange} />
            </ActionSelector>

            <ActionSelector
              icon={<EnergyIcon className={cn("size-3.5", energyOption.color)} />}
              label={energyOption.label}
              options={energyOptionsWithIcons}
              onSelect={setEnergy as (v: unknown) => void}
              value={energy}
            />

            <div className="flex flex-wrap items-center gap-2 sm:gap-1">
              <ActionSelector
                label={formatGoogleDate(scheduledDate)}
                options={[
                  {
                    label: "Today",
                    value: getTodayString(),
                  },
                  {
                    label: "Tomorrow",
                    value: getTomorrowString(),
                  },
                ]}
                onSelect={(val) => {
                  if (val === "custom") {
                    // TODO: open calendar picker
                  } else {
                    setScheduledDate(val as string);
                  }
                }}
                value={scheduledDate}
                align="center"
                triggerClassName="bg-muted/30 border-none hover:bg-muted/50 rounded-md px-3 h-8 shadow-none"
              >
                <MicroCalendar value={scheduledDate} onChange={setScheduledDate} />
              </ActionSelector>

              <ActionSelector
                label={startTime ? formatTime(startTime, timeFormat) : "Time"}
                options={timeOptions}
                scrollTargetValue={getNearestTimeValue()}
                onSelect={(val) => {
                  handleStartTimeChange(val as string);
                  setIsTimeInvalid(false);
                }}
                value={startTime}
                align="center"
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
                        isCalculatingRef.current = true;
                        setStartTime("");
                        setEndTime("");
                        setIsTimeInvalid(false);
                        setTimeout(() => (isCalculatingRef.current = false), 0);
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
                    label={
                      endTime ? (
                        <span className="flex items-center gap-1">
                          {formatTime(endTime, timeFormat)}
                          <NextDayBadge startTime={startTime} endTime={endTime} />
                        </span>
                      ) : (
                        "End"
                      )
                    }
                    options={timeOptions}
                    scrollTargetValue={getNearestTimeValue()}
                    onSelect={(val) => {
                      handleEndTimeChange(val as string);
                    }}
                    value={endTime}
                    align="center"
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
                              handleEndTimeChange(parsed);
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

              <TimezoneSelector
                value={timezone}
                onSelect={(tz) => setTimezone(tz)}
                align="end"
                trigger={
                  <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={timezoneOpen}
                    className="bg-muted/30 border-none hover:bg-muted/50 rounded-md px-3 h-8 shadow-none text-muted-foreground/60 text-[11px] justify-between gap-2"
                  >
                    <span className="truncate">
                      {timezone.split("/").pop()?.replace("_", " ") || timezone}
                    </span>
                    <ChevronsUpDown className="size-3 shrink-0 opacity-50" />
                  </Button>
                }
                open={timezoneOpen}
                onOpenChange={setTimezoneOpen}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-5 py-4 flex flex-wrap items-center justify-between gap-4 bg-muted/5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {settings.show_intentions && (
                <div
                  onClick={() =>
                    setIntention(intention === INTENTIONS.WANT ? INTENTIONS.MUST : INTENTIONS.WANT)
                  }
                  className={cn(
                    "flex items-center gap-2 px-2.5 h-8.5 rounded-lg border transition-all cursor-pointer select-none active:scale-[0.98]",
                    intention === INTENTIONS.WANT
                      ? "bg-pink-500/10 border-pink-500/30 text-pink-500 hover:bg-pink-500/15"
                      : "bg-muted/30 border-border/20 text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Checkbox
                    checked={intention === INTENTIONS.WANT}
                    onCheckedChange={(checked) =>
                      setIntention(checked ? INTENTIONS.WANT : INTENTIONS.MUST)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "size-4 rounded",
                      intention === INTENTIONS.WANT && "bg-pink-500 border-pink-500"
                    )}
                  />
                  <span className="text-[12px] font-bold">Want to do</span>
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsImportant((prev) => !prev)}
                className={cn(
                  "h-8.5 px-2.5 rounded-lg hover:bg-muted/50 text-muted-foreground/70 hover:text-foreground border border-transparent transition-all gap-1.5 active:scale-[0.98]",
                  isImportant &&
                    "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 hover:bg-yellow-500/15 hover:text-yellow-700"
                )}
                title={isImportant ? "Mark as regular" : "Mark as important"}
              >
                <Star
                  className={cn(
                    "size-4 transition-all",
                    isImportant ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/60"
                  )}
                />
                <span className="text-[12px] font-bold hidden sm:inline">Important</span>
              </Button>

              {!actionToEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setInsertAtTop((prev) => !prev)}
                  className="h-8.5 px-2.5 rounded-lg hover:bg-muted/50 text-muted-foreground/70 hover:text-foreground border border-transparent transition-all gap-1.5 active:scale-[0.98]"
                  title={
                    insertAtTop
                      ? "Insert at the top of the list"
                      : "Insert at the bottom of the list"
                  }
                >
                  <div className="size-4 flex items-center justify-center text-muted-foreground/60">
                    {insertAtTop ? (
                      <ArrowUpToLine className="size-3.5" />
                    ) : (
                      <ArrowDownToLine className="size-3.5" />
                    )}
                  </div>
                  <span className="text-[12px] font-bold hidden sm:inline">
                    {insertAtTop ? "Insert Top" : "Insert Bottom"}
                  </span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCancelAttempt}
                disabled={!isDbReady}
                className="h-8.5 px-3 sm:px-4 rounded-lg bg-muted/50 hover:bg-muted font-bold text-xs transition-all border-none active:scale-[0.98] disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={isLoading || !title.trim() || isTimeInvalid || !isDbReady}
                className="h-8.5 px-4 sm:px-5 rounded-lg font-bold text-xs shadow-md shadow-primary/5 transition-all bg-primary/10 hover:bg-primary/15 text-primary active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
              >
                {actionToEdit ? "Update task" : "Add task"}
              </Button>
            </div>
          </div>
        </form>

        <DiscardDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          onConfirm={handleConfirmDiscard}
        />
      </div>
    );
  }
);

ActionInput.displayName = "ActionInput";
