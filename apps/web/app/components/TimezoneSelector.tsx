import * as React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  cn,
  Button,
} from "@kreozalabs/ui";
import { Check, ChevronsUpDown, Globe, MapPin } from "lucide-react";
import { MAJOR_TIMEZONES, ALL_TIMEZONES, TIMEZONES } from "../config/constants";
import { useSettings } from "../providers/SettingsContext";

export interface TimezoneSelectorProps {
  value: string;
  onSelect: (tz: string) => void;
  showAuto?: boolean;
  trigger?: React.ReactNode;
  triggerClassName?: string;
  align?: "start" | "center" | "end";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // If true, the checkmark will be shown for multiple items if value is an array?
  // For now let's keep it simple and let parent handle checkmarks if they need custom logic.
  // But we can support a custom check function.
  isItemSelected?: (tz: string) => boolean;
}

const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function TimezoneSelector({
  value,
  onSelect,
  showAuto = false,
  trigger,
  triggerClassName,
  align = "start",
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  isItemSelected,
}: TimezoneSelectorProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  const { settings } = useSettings();
  const presets = settings.action_timezone_options || [];

  const checkSelected = (tz: string) => {
    if (isItemSelected) return isItemSelected(tz);
    return value === tz;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-9 bg-muted/20 border border-border/30 rounded-xl px-3 hover:bg-muted/30",
              triggerClassName
            )}
          >
            <span className="truncate">
              {value === TIMEZONES.AUTO
                ? `Auto (${localTimezone.replace(/_/g, " ")})`
                : value.split("/").pop()?.replace(/_/g, " ") || value}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-60 p-0" align={align}>
        <Command>
          <CommandInput placeholder="Search timezone..." />
          <CommandList className="max-h-75">
            <CommandEmpty>No timezone found.</CommandEmpty>

            {showAuto && (
              <CommandGroup heading="System">
                <CommandItem
                  value={TIMEZONES.AUTO}
                  onSelect={() => {
                    onSelect(TIMEZONES.AUTO);
                    setOpen(false);
                  }}
                >
                  <Globe className="mr-2 size-4 opacity-50" />
                  Auto (System Default)
                  <Check
                    className={cn(
                      "ml-auto size-4",
                      checkSelected(TIMEZONES.AUTO) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              </CommandGroup>
            )}

            <CommandGroup heading="Detected">
              <CommandItem
                value={localTimezone}
                onSelect={() => {
                  onSelect(localTimezone);
                  setOpen(false);
                }}
              >
                <MapPin className="mr-2 size-4 opacity-50" />
                {localTimezone.replace(/_/g, " ")} (Local)
                <Check
                  className={cn(
                    "ml-auto size-4",
                    checkSelected(localTimezone) ? "opacity-100" : "opacity-0"
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
                      onSelect(tz);
                      // Don't close automatically if we are in "multi-select" mode (inferred from isItemSelected existence maybe?)
                      // Actually let the parent handle closing if they want.
                      // But for standard select we close.
                      if (!isItemSelected) setOpen(false);
                    }}
                  >
                    {tz.replace(/_/g, " ")}
                    <Check
                      className={cn(
                        "ml-auto size-4",
                        checkSelected(tz) ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading="Common">
              {MAJOR_TIMEZONES.map((tz) => (
                <CommandItem
                  key={tz}
                  value={tz}
                  onSelect={() => {
                    onSelect(tz);
                    if (!isItemSelected) setOpen(false);
                  }}
                >
                  {tz.replace(/_/g, " ")}
                  <Check
                    className={cn(
                      "ml-auto size-4",
                      checkSelected(tz) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="All Timezones">
              {ALL_TIMEZONES.filter((tz) => !MAJOR_TIMEZONES.includes(tz)).map((tz) => (
                <CommandItem
                  key={tz}
                  value={tz}
                  onSelect={() => {
                    onSelect(tz);
                    if (!isItemSelected) setOpen(false);
                  }}
                >
                  {tz.replace(/_/g, " ")}
                  <Check
                    className={cn(
                      "ml-auto size-4",
                      checkSelected(tz) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
