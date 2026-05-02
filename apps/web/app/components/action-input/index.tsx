import { useState, useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from "react";
import {
  AudioLines,
  Clock,
  BatteryMedium,
  BatteryFull,
  BatteryLow,
  Heart,
  AlertCircle,
  Star,
} from "lucide-react";
import { Input, Button, Textarea, cn } from "@kreozalabs/ui";
import { ActionSelector } from "../ActionSelector";
import { NextDayBadge } from "../NextDayBadge";
import { addAction, updateAction, getRecentConfigs } from "../../db/actions";
import type { Action, EnergyType, IntentionType } from "../../types/actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDiscardGuard } from "../../hooks/useDiscardGuard";
import { useTheme } from "../../providers/ThemeContext";
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
  TIME,
  ENERGY_OPTIONS,
  INTENTION_OPTIONS,
  DURATION_OPTIONS,
  IMPORTANT_CONFIG,
} from "../../config/constants";
import { DurationInputs } from "./DurationInputs";
import { DiscardDialog } from "./DiscardDialog";

// TODO: Somehow we should allow user to move between input fields, so it is frictionless and requires less effort. Maybe enter, or arrows?
// TODO: NOT RELATED TO THIS COMPONENT, BUT IT IS BACKUP LOGIC. Allow user to import and export data.
// TODO: Create settings to allow user to set custom default values for the input fields. So that if user does a lot of 150 minutes tasks, he does not need to reenter it over again.
// TODO: Use config file instead of in line hard-coded settings, which should allow us to create custom settings with ease.
// TODO: Show recent timezones at the top of the timezone dropdown,
// TODO: Allow to set default timezone, used in the app, in settings.

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

const allTimezones = (
  Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }
).supportedValuesOf?.("timeZone") || ["UTC", Intl.DateTimeFormat().resolvedOptions().timeZone];

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
    const [title, setTitle] = useState(actionToEdit?.title || DEFAULT_CONFIG.TITLE);
    const [note, setNote] = useState(actionToEdit?.note || "");
    const [intention, setIntention] = useState<IntentionType>(
      actionToEdit?.intention || (DEFAULT_CONFIG.INTENTION as IntentionType)
    );
    const [isImportant, setIsImportant] = useState(actionToEdit?.important || false);
    const [energy, setEnergy] = useState<EnergyType>(
      actionToEdit?.energy || (DEFAULT_CONFIG.ENERGY as EnergyType)
    );
    const [duration, setDuration] = useState<[number, number | null]>(
      actionToEdit?.duration
        ? [actionToEdit.duration[0], actionToEdit.duration[1]]
        : DEFAULT_CONFIG.DURATION
    );
    const [scheduledDate, setScheduledDate] = useState(
      actionToEdit?.scheduledDate || initialDate || getTodayString()
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
    const { timeFormat, showRecentConfigs } = useTheme();
    const titleInputRef = useRef<HTMLInputElement>(null);

    const timeOptions = useMemo(() => getTimeOptions(timeFormat), [timeFormat]);
    const energyOption = ENERGY_OPTIONS.find((opt) => opt.value === energy) || ENERGY_OPTIONS[1];

    const sortedTimezones = useMemo(() => {
      const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // TODO: This list is hardcoded. We should use a config file to set the default timezones, including a list of "major" timezones.
      const major = [
        "UTC",
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "Europe/London",
        "Europe/Paris",
        "Europe/Berlin",
        "Asia/Tokyo",
        "Asia/Shanghai",
        "Asia/Dubai",
        "Australia/Sydney",
      ];

      // Filter out local and major from the main list to avoid duplicates
      const others = allTimezones.filter((tz) => tz !== local && !major.includes(tz));

      return [local, ...major.filter((m) => allTimezones.includes(m) && m !== local), ...others];
    }, []);

    const filteredTimezones = useMemo(() => {
      const search = timezoneSearch.toLowerCase().trim();
      if (!search) return sortedTimezones.slice(0, 15);

      // When searching, we might want to show more than 50 if there are many matches,
      // but let's keep a reasonable limit for performance.
      return sortedTimezones.filter((tz) => tz.toLowerCase().includes(search)).slice(0, 100);
    }, [timezoneSearch, sortedTimezones]);

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

    const intentionConfig = useMemo(
      () => INTENTION_OPTIONS.find((opt) => opt.value === intention) || INTENTION_OPTIONS[0],
      [intention]
    );

    const intentionOptionsWithIcons = useMemo(
      () =>
        INTENTION_OPTIONS.map((opt) => ({
          ...opt,
          icon:
            opt.value === INTENTIONS.MUST ? (
              <AlertCircle className={cn("size-4", opt.color)} />
            ) : (
              <Heart className={cn("size-4", opt.color)} />
            ),
        })),
      []
    );

    const importantOptionsWithIcons = useMemo(
      () => [
        {
          label: "Regular",
          value: false,
          icon: <Star className={cn("size-4", IMPORTANT_CONFIG.inactive.color)} />,
        },
        {
          label: "Important",
          value: true,
          icon: (
            <Star
              className={cn("size-4", IMPORTANT_CONFIG.active.color, IMPORTANT_CONFIG.active.fill)}
            />
          ),
        },
      ],
      []
    );

    const isCalculatingRef = useRef(false);

    const syncDurationFromTimes = (start: string, end: string) => {
      if (!start || !end || isCalculatingRef.current) return;
      const startTotal = timeToMinutes(start);
      let endTotal = timeToMinutes(end);
      if (endTotal < startTotal) endTotal += TIME.MINUTES_IN_DAY;
      const diff = endTotal - startTotal;

      isCalculatingRef.current = true;
      setDuration([diff, diff]);
      setTimeout(() => (isCalculatingRef.current = false), 0);
    };

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
      syncDurationFromTimes(startTime, newEnd);
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

    const { data: recentConfigs = [] } = useQuery({
      queryKey: ["recent-configs"],
      queryFn: getRecentConfigs,
      enabled: showRecentConfigs,
    });

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
        let finalDuration = duration;
        if (startTime && endTime) {
          const startTotal = timeToMinutes(startTime);
          let endTotal = timeToMinutes(endTime);
          if (endTotal < startTotal) endTotal += TIME.MINUTES_IN_DAY;
          const diff = endTotal - startTotal;
          finalDuration = [diff, diff];
        }

        const payload = {
          title: title.trim(),
          note: note.trim(),
          intention,
          important: isImportant,
          energy,
          duration: [finalDuration[0], finalDuration[1] ?? finalDuration[0]] as [number, number],
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
        queryClient.invalidateQueries({ queryKey: ["recent-configs"] });
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
          <div className="p-4 sm:p-5 flex flex-col gap-2">
            {showRecentConfigs && recentConfigs.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {recentConfigs.map((config, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleDurationChange(config.duration || DEFAULT_CONFIG.DURATION);
                      setEnergy((config.energy as EnergyType) || ENERGY_LEVELS.MEDIUM);
                      setIntention((config.intention as IntentionType) || INTENTIONS.WANT);
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

            <div className="flex items-start justify-between gap-2 sm:gap-4">
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
                <AudioLines className="size-5" />
              </Button>
            </div>
          </div>

          {/* Action Chips Row */}
          <div className="px-4 sm:px-5 pb-5 mt-5 flex flex-wrap gap-2 sm:gap-2.5 items-center">
            <ActionSelector
              icon={<Clock className="size-3.5 text-blue-500/70" />}
              label={formatDuration(duration[0], duration[1])}
              options={DURATION_OPTIONS.map((opt) => ({
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

              <ActionSelector
                label={timezone.split("/").pop()?.replace("_", " ") || timezone}
                options={filteredTimezones.map((tz: string) => ({
                  label: tz.replace("_", " "),
                  value: tz,
                }))}
                onSelect={(val) => {
                  setTimezone(val as string);
                  setTimezoneSearch("");
                }}
                value={timezone}
                align="end"
                childrenPosition="top"
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
          <div className="px-4 sm:px-5 py-4 flex flex-wrap items-center justify-between gap-4 bg-muted/5">
            <div className="flex items-center gap-1">
              <ActionSelector
                variant="ghost"
                icon={
                  <div
                    className={cn(
                      "size-5 rounded-md flex items-center justify-center border",
                      intentionConfig.bg
                    )}
                  >
                    {intention === INTENTIONS.MUST ? (
                      <AlertCircle className={cn("size-3.5", intentionConfig.color)} />
                    ) : (
                      <Heart className={cn("size-3.5", intentionConfig.color)} />
                    )}
                  </div>
                }
                label={intentionConfig.label}
                options={intentionOptionsWithIcons}
                onSelect={setIntention as (v: unknown) => void}
                value={intention}
                triggerClassName="h-9 px-2 sm:px-3 rounded-xl hover:bg-muted/50 font-bold text-muted-foreground/70 hover:text-foreground border-none"
              />

              <ActionSelector
                variant="ghost"
                icon={
                  <div
                    className={cn(
                      "size-5 rounded-md flex items-center justify-center",
                      isImportant ? IMPORTANT_CONFIG.active.bg : IMPORTANT_CONFIG.inactive.bg
                    )}
                  >
                    <Star
                      className={cn(
                        "size-3.5 mb-0.5",
                        isImportant
                          ? cn(IMPORTANT_CONFIG.active.color, IMPORTANT_CONFIG.active.fill)
                          : IMPORTANT_CONFIG.inactive.color
                      )}
                    />
                  </div>
                }
                label={isImportant ? "Important" : ""}
                options={importantOptionsWithIcons}
                onSelect={setIsImportant as (v: unknown) => void}
                value={isImportant}
                triggerClassName="h-9 px-2 sm:px-3 rounded-xl hover:bg-muted/50 font-bold text-muted-foreground/70 hover:text-foreground border-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCancelAttempt}
                className="h-10 px-4 sm:px-5 rounded-xl bg-muted/50 hover:bg-muted font-bold text-sm transition-all border-none active:scale-95"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={isLoading || !title.trim() || isTimeInvalid}
                className="h-10 px-4 sm:px-6 rounded-xl font-bold text-sm shadow-xl shadow-primary/10 transition-all bg-primary/10 hover:bg-primary/15 text-primary active:scale-95 disabled:opacity-50 disabled:scale-100"
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
