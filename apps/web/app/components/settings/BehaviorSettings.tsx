import {
  Button,
  cn,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@kreozalabs/ui";

import { useSettings } from "../../providers/SettingsContext";
import {
  MAJOR_TIMEZONES,
  ALL_TIMEZONES,
  TIMEZONES,
  LANGUAGE_OPTIONS,
  DISTRACTION_FREE_OPTIONS,
  TIMELINE_VIEW_OPTIONS,
  SECTION_STATE_OPTIONS,
  OVERDUE_ACTIONS_OPTIONS,
  LAYOUT_PERSISTENCE_OPTIONS,
} from "../../config/constants";
import { useState } from "react";
import { Check, ChevronsUpDown, MapPin, Globe } from "lucide-react";

export function BehaviorSettings() {
  const { settings, updateSetting } = useSettings();
  const [open, setOpen] = useState(false);

  const presets = settings.action_timezone_options || [];

  const handleDetect = () => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    updateSetting("timezone", detected);
    setOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Timezone
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDetect}
            className="h-6 px-2 text-[10px] uppercase font-bold tracking-widest text-primary hover:bg-primary/10"
          >
            <MapPin className="size-3 mr-1" />
            Detect
          </Button>
        </div>
        <div className="px-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-9 bg-muted/20 border border-border/30 rounded-xl px-3 hover:bg-muted/30"
              >
                <span className="truncate">
                  {settings.timezone === TIMEZONES.AUTO
                    ? `Auto (${Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, " ")})`
                    : settings.timezone.replace(/_/g, " ")}
                </span>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search timezone..." />
                <CommandList className="max-h-75">
                  <CommandEmpty>No timezone found.</CommandEmpty>
                  <CommandGroup heading="System">
                    <CommandItem
                      value={TIMEZONES.AUTO}
                      onSelect={() => {
                        updateSetting("timezone", TIMEZONES.AUTO);
                        setOpen(false);
                      }}
                    >
                      <Globe className="mr-2 size-4 opacity-50" />
                      Auto (System Default)
                      <Check
                        className={cn(
                          "ml-auto size-4",
                          settings.timezone === TIMEZONES.AUTO ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  </CommandGroup>

                  {presets.length > 0 && (
                    <CommandGroup heading="Your Presets">
                      {presets.map((tz) => (
                        <CommandItem
                          key={tz}
                          value={tz}
                          onSelect={() => {
                            updateSetting("timezone", tz);
                            setOpen(false);
                          }}
                        >
                          {tz.replace(/_/g, " ")}
                          <Check
                            className={cn(
                              "ml-auto size-4",
                              settings.timezone === tz ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  <CommandGroup heading="Common">
                    {MAJOR_TIMEZONES.filter((tz) => !presets.includes(tz)).map((tz) => (
                      <CommandItem
                        key={tz}
                        value={tz}
                        onSelect={() => {
                          updateSetting("timezone", tz);
                          setOpen(false);
                        }}
                      >
                        {tz.replace(/_/g, " ")}
                        <Check
                          className={cn(
                            "ml-auto size-4",
                            settings.timezone === tz ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  <CommandGroup heading="All Timezones">
                    {ALL_TIMEZONES.filter(
                      (tz) => !MAJOR_TIMEZONES.includes(tz) && !presets.includes(tz)
                    ).map((tz) => (
                      <CommandItem
                        key={tz}
                        value={tz}
                        onSelect={() => {
                          updateSetting("timezone", tz);
                          setOpen(false);
                        }}
                      >
                        {tz.replace(/_/g, " ")}
                        <Check
                          className={cn(
                            "ml-auto size-4",
                            settings.timezone === tz ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Language
          </h4>
          <span className="text-[10px] text-muted-foreground/40 font-medium">
            Interface language
          </span>
        </div>
        <div className="px-2">
          <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl">
            {LANGUAGE_OPTIONS.map((opt) => (
              <Button
                key={opt.label}
                variant="ghost"
                size="sm"
                onClick={() => updateSetting("language", opt.value)}
                className={cn(
                  "flex-1 flex flex-row items-center justify-center h-8 rounded-lg text-[12px] font-medium transition-colors border-none",
                  settings.language === opt.value
                    ? "bg-background text-foreground shadow-sm hover:bg-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                <span>{opt.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Distraction-Free Mode
          </h4>
          <span className="text-[10px] text-muted-foreground/40 font-medium">
            e.g., Hide header when idle
          </span>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl">
          {DISTRACTION_FREE_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("subtle_on_idle", opt.value)}
              className={cn(
                "flex-1 flex flex-row items-center justify-center h-8 rounded-lg text-[12px] font-medium transition-colors border-none",
                settings.subtle_on_idle === opt.value
                  ? "bg-background text-foreground shadow-sm hover:bg-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <span>{opt.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Default Timeline View
          </h4>
          <span className="text-[10px] text-muted-foreground/40 font-medium">
            Initial state of the dashboard
          </span>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl">
          {TIMELINE_VIEW_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("today_locked", opt.value)}
              className={cn(
                "flex-1 flex flex-row items-center justify-center h-8 rounded-lg text-[12px] font-medium transition-colors border-none",
                settings.today_locked === opt.value
                  ? "bg-background text-foreground shadow-sm hover:bg-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <span>{opt.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Default Section State
          </h4>
          <span className="text-[10px] text-muted-foreground/40 font-medium">
            Initial state for action sections
          </span>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl">
          {SECTION_STATE_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("section_expanded", opt.value)}
              className={cn(
                "flex-1 flex flex-row items-center justify-center h-8 rounded-lg text-[12px] font-medium transition-colors border-none",
                settings.section_expanded === opt.value
                  ? "bg-background text-foreground shadow-sm hover:bg-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <span>{opt.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Overdue Actions
          </h4>
          <span className="text-[10px] text-muted-foreground/40 font-medium">
            Initial state of the Overdue section
          </span>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl">
          {OVERDUE_ACTIONS_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("show_overdue", opt.value)}
              className={cn(
                "flex-1 flex flex-row items-center justify-center h-8 rounded-lg text-[12px] font-medium transition-colors border-none",
                settings.show_overdue === opt.value
                  ? "bg-background text-foreground shadow-sm hover:bg-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <span>{opt.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Remember Layout on Refresh
          </h4>
          <span className="text-[10px] text-muted-foreground/40 font-medium">
            Keep sections as you left them when you refresh the page
          </span>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl">
          {LAYOUT_PERSISTENCE_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("remember_layout_on_refresh", opt.value)}
              className={cn(
                "flex-1 flex flex-row items-center justify-center h-8 rounded-lg text-[12px] font-medium transition-colors border-none",
                settings.remember_layout_on_refresh === opt.value
                  ? "bg-background text-foreground shadow-sm hover:bg-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <span>{opt.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
