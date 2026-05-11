import { useState } from "react";
import { Plus, Minus, Trash2, Search, X, ChevronsUpDown } from "lucide-react";
import {
  Button,
  cn,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kreozalabs/ui";
import { useSettings } from "../../providers/SettingsContext";
import { ENERGY_OPTIONS, INTENTION_OPTIONS } from "../../config/constants";
import { TimezoneSelector } from "../TimezoneSelector";
// FIXME: At some point, settings seem to be overwritten. What causes it?

export function ActionsSettings() {
  const { settings, updateSetting } = useSettings();
  const [tzPopoverOpen, setTzPopoverOpen] = useState(false);

  const addDurationPreset = () => {
    const newPresets = [
      ...settings.action_duration_options,
      { label: "15-30m", value: [15, 30] as [number, number] },
    ];
    updateSetting("action_duration_options", newPresets);
  };

  const removeDurationPreset = (index: number) => {
    const newPresets = settings.action_duration_options.filter((_, i) => i !== index);
    updateSetting("action_duration_options", newPresets);
  };

  const updateDurationPreset = (
    index: number,
    updates: Partial<{ label: string; value: [number, number] }>
  ) => {
    const newPresets = settings.action_duration_options.map((p, i) => {
      if (i === index) {
        const updated = { ...p, ...updates };
        if (!updated.label.trim()) {
          const [min, max] = updated.value;
          updated.label = min === max ? `${min}m` : `${min}-${max}m`;
        }
        return updated;
      }
      return p;
    });
    updateSetting("action_duration_options", newPresets);
  };

  const toggleTimezonePreset = (tz: string) => {
    const isPreset = settings.action_timezone_options.includes(tz);
    const newTimezones = isPreset
      ? settings.action_timezone_options.filter((t) => t !== tz)
      : [...settings.action_timezone_options, tz];
    updateSetting("action_timezone_options", newTimezones);
    if (!isPreset) setTzPopoverOpen(false);
  };

  const removeTimezonePreset = (tz: string) => {
    const newTimezones = settings.action_timezone_options.filter((t) => t !== tz);
    updateSetting("action_timezone_options", newTimezones);
  };

  return (
    <div className="space-y-12">
      {/* Defaults Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Action Defaults
          </h4>
          <span className="text-[10px] text-muted-foreground/40 font-medium">
            Applied to new actions
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 px-1">
              Default Energy
            </label>
            <Select
              value={settings.default_energy}
              onValueChange={(v) => updateSetting("default_energy", v)}
            >
              <SelectTrigger className="h-9 text-xs bg-muted/20 border-border/30 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENERGY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className={cn("flex items-center gap-2", opt.color)}>{opt.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 px-1">
              Default Intention
            </label>
            <Select
              value={settings.default_intention}
              onValueChange={(v) => updateSetting("default_intention", v)}
            >
              <SelectTrigger className="h-9 text-xs bg-muted/20 border-border/30 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTENTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className={cn("flex items-center gap-2", opt.color)}>{opt.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Duration Presets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Duration Presets
          </h4>
          {/* TODO: Add input dialog, so user configures label together with value, not after some default was created. */}
          <Button
            variant="ghost"
            size="sm"
            onClick={addDurationPreset}
            className="h-7 px-2 text-[10px] uppercase font-bold tracking-widest text-primary hover:bg-primary/10"
          >
            <Plus className="size-3 mr-1" />
            Add Preset
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-2">
          {settings.action_duration_options.map((preset, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-muted/20 rounded-2xl border border-border/30 group/preset"
            >
              <div className="flex-1 space-y-2">
                <Input
                  value={preset.label}
                  onChange={(e) => updateDurationPreset(idx, { label: e.target.value })}
                  placeholder={
                    preset.value[0] === preset.value[1]
                      ? `${preset.value[0]}m`
                      : `${preset.value[0]}-${preset.value[1]}m`
                  }
                  className="h-7 text-xs font-bold bg-transparent border-none p-0 focus-visible:ring-0 placeholder:italic"
                />
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/40">
                      Min (m)
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-5 rounded-md hover:bg-background shadow-sm border border-border/40"
                        onClick={() =>
                          updateDurationPreset(idx, {
                            value: [Math.max(0, preset.value[0] - 5), preset.value[1]],
                          })
                        }
                      >
                        <Minus className="size-2.5" />
                      </Button>
                      <span className="text-xs font-bold w-6 text-center">{preset.value[0]}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-5 rounded-md hover:bg-background shadow-sm border border-border/40"
                        onClick={() =>
                          updateDurationPreset(idx, {
                            value: [
                              preset.value[0] + 5,
                              Math.max(preset.value[0] + 5, preset.value[1]),
                            ],
                          })
                        }
                      >
                        <Plus className="size-2.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/40">
                      Max (m)
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-5 rounded-md hover:bg-background shadow-sm border border-border/40"
                        onClick={() =>
                          updateDurationPreset(idx, {
                            value: [
                              preset.value[0],
                              Math.max(preset.value[0], preset.value[1] - 5),
                            ],
                          })
                        }
                      >
                        <Minus className="size-2.5" />
                      </Button>
                      <span className="text-xs font-bold w-6 text-center">{preset.value[1]}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-5 rounded-md hover:bg-background shadow-sm border border-border/40"
                        onClick={() =>
                          updateDurationPreset(idx, {
                            value: [preset.value[0], preset.value[1] + 5],
                          })
                        }
                      >
                        <Plus className="size-2.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeDurationPreset(idx)}
                className="size-8 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/preset:opacity-100 transition-opacity"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Timezone Presets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Timezone Presets
          </h4>
          <span className="text-[10px] text-muted-foreground/40 font-medium">
            Pinned in Action Input
          </span>
        </div>
        <div className="space-y-3 px-2">
          <div className="flex flex-wrap gap-2">
            {settings.action_timezone_options.map((tz) => (
              <div
                key={tz}
                className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 bg-primary/5 text-primary border border-primary/20 rounded-lg text-xs font-medium"
              >
                {tz.split("/").pop()?.replace(/_/g, " ")}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTimezonePreset(tz)}
                  className="size-5 rounded-md hover:bg-primary/10 text-primary/60 hover:text-primary"
                >
                  <X className="size-3" />
                </Button>
              </div>
            ))}
          </div>
          <TimezoneSelector
            value=""
            onSelect={toggleTimezonePreset}
            isItemSelected={(tz) => settings.action_timezone_options.includes(tz)}
            open={tzPopoverOpen}
            onOpenChange={setTzPopoverOpen}
            trigger={
              <Button
                variant="ghost"
                role="combobox"
                aria-expanded={tzPopoverOpen}
                className="w-full justify-between h-9 bg-muted/20 border border-border/30 rounded-xl px-3 hover:bg-muted/30"
              >
                <div className="flex items-center gap-2 text-muted-foreground/60">
                  <Search className="size-3.5" />
                  <span className="text-xs">Search to add timezone...</span>
                </div>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
