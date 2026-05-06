import { useState, useMemo } from "react";
import { Plus, Minus, Trash2, Search, X } from "lucide-react";
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
// FIXME: At some point, settings seem to be overwritten. What causes it?
const allTimezones = (
  Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }
).supportedValuesOf?.("timeZone") || ["UTC"];

function NumberStepper({
  value,
  label,
  onChange,
  min = 0,
  max = 100,
}: {
  value: number;
  label: string;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
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
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Minus className="size-3" />
        </Button>
        <div className="font-bold text-[13px] text-foreground tracking-tight select-none">
          {value}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 bg-background/50 hover:bg-background shadow-sm border border-border/40 text-muted-foreground hover:text-foreground rounded-lg transition-all active:scale-95 shrink-0"
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Plus className="size-3" />
        </Button>
      </div>
    </div>
  );
}

export function ActionsSettings() {
  const { settings, updateSetting } = useSettings();
  const [tzSearch, setTzSearch] = useState("");

  const filteredTimezones = useMemo(() => {
    const search = tzSearch.toLowerCase().trim();
    if (!search) return [];
    return allTimezones
      .filter(
        (tz) => tz.toLowerCase().includes(search) && !settings.action_timezone_options.includes(tz)
      )
      .slice(0, 10);
  }, [tzSearch, settings.action_timezone_options]);

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

  const addTimezonePreset = (tz: string) => {
    const newTimezones = [...settings.action_timezone_options, tz];
    updateSetting("action_timezone_options", newTimezones);
    setTzSearch("");
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

      {/* TODO: Make use of it or remove */}
      {/* Daily Action Limits */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Daily Action Limits
          </h4>
          <span className="text-[10px] text-muted-foreground/40 font-medium">
            NOTE: This is under development
          </span>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl">
          {[
            { label: "Enabled", value: true },
            { label: "Disabled", value: false },
          ].map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("min_max_actions_enabled", opt.value)}
              className={cn(
                "flex-1 flex flex-row items-center justify-center h-8 rounded-lg text-[12px] font-medium transition-colors border-none",
                settings.min_max_actions_enabled === opt.value
                  ? "bg-background text-foreground shadow-sm hover:bg-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <span>{opt.label}</span>
            </Button>
          ))}
        </div>
        {settings.min_max_actions_enabled && (
          <div className="flex items-center gap-4 px-2 animate-in fade-in slide-in-from-top-2">
            <NumberStepper
              label="Min Actions"
              value={settings.min_daily_actions}
              onChange={(v) => updateSetting("min_daily_actions", v)}
            />
            <NumberStepper
              label="Max Actions"
              value={settings.max_daily_actions}
              onChange={(v) => updateSetting("max_daily_actions", v)}
            />
          </div>
        )}
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
          {/* FIXME: When user searches timezone, it has limited space down, so it looks like it does not fit ! */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
              <Input
                placeholder="Search to add timezone..."
                value={tzSearch}
                onChange={(e) => setTzSearch(e.target.value)}
                className="h-9 pl-9 text-xs bg-muted/20 border-border/30 rounded-xl"
              />
            </div>
            {filteredTimezones.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border/40 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                {filteredTimezones.map((tz) => (
                  <button
                    key={tz}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-muted/80 transition-colors"
                    onClick={() => addTimezonePreset(tz)}
                  >
                    {tz.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
