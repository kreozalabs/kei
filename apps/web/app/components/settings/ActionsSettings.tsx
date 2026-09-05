import { useState } from "react";
import {
  Plus,
  Minus,
  Trash2,
  Search,
  X,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  Button,
  cn,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@kreozalabs/ui";
import { useSettings } from "../../providers/SettingsContext";
import { DEFAULT_CONFIG, ENERGY_OPTIONS, INTENTION_OPTIONS } from "@kreozalabs/core";
import { TimezoneSelector } from "../TimezoneSelector";

export function ActionsSettings() {
  const { settings, updateSetting } = useSettings();
  const [tzPopoverOpen, setTzPopoverOpen] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPreset, setNewPreset] = useState<{ label: string; value: [number, number] }>({
    label: "",
    value: DEFAULT_CONFIG.DURATION,
  });

  const addDurationPreset = () => {
    const finalLabel = newPreset.label.trim()
      ? newPreset.label
      : newPreset.value[0] === newPreset.value[1]
        ? `${newPreset.value[0]}m`
        : `${newPreset.value[0]}-${newPreset.value[1]}m`;

    updateSetting("action_duration_options", (prev) => [
      ...prev,
      { label: finalLabel, value: newPreset.value },
    ]);
    setIsAddDialogOpen(false);
    setNewPreset({ label: "", value: DEFAULT_CONFIG.DURATION });
  };

  const removeDurationPreset = (index: number) => {
    updateSetting("action_duration_options", (prev) => prev.filter((_, i) => i !== index));
  };

  const moveDurationPreset = (index: number, direction: "up" | "down") => {
    updateSetting("action_duration_options", (prev) => {
      const newPresets = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newPresets.length) return prev;

      [newPresets[index], newPresets[targetIndex]] = [newPresets[targetIndex], newPresets[index]];
      return newPresets;
    });
  };

  const updateDurationPreset = (
    index: number,
    updates: Partial<{ label: string; value: [number, number] }>
  ) => {
    updateSetting("action_duration_options", (prev) =>
      prev.map((p, i) => {
        if (i === index) {
          const updated = { ...p, ...updates };
          if (!updated.label.trim()) {
            const [min, max] = updated.value;
            updated.label = min === max ? `${min}m` : `${min}-${max}m`;
          }
          return updated;
        }
        return p;
      })
    );
  };

  const toggleTimezonePreset = (tz: string) => {
    updateSetting("action_timezone_options", (prev) => {
      const isPreset = prev.includes(tz);
      if (isPreset) {
        return prev.filter((t) => t !== tz);
      } else {
        setTzPopoverOpen(false);
        return [...prev, tz];
      }
    });
  };

  const removeTimezonePreset = (tz: string) => {
    updateSetting("action_timezone_options", (prev) => prev.filter((t) => t !== tz));
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
        <div
          className={cn(
            "grid grid-cols-1 gap-4 px-2",
            settings.show_intentions ? "sm:grid-cols-2" : "max-w-md"
          )}
        >
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
          {settings.show_intentions && (
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
          )}
        </div>
      </div>

      {/* Duration Presets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-0.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
              Duration Presets
            </h4>
            <p className="text-[9px] text-muted-foreground/30 font-medium">
              Quickly pick duration when adding actions
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px] uppercase font-bold tracking-widest text-primary hover:bg-primary/10"
              >
                <Plus className="size-3 mr-1" />
                Add Preset
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[320px]">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold uppercase tracking-wider">
                  New Duration Preset
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 px-1">
                    Label (Optional)
                  </label>
                  <Input
                    value={newPreset.label}
                    onChange={(e) => setNewPreset({ ...newPreset, label: e.target.value })}
                    placeholder="e.short, long, break..."
                    className="h-9 bg-muted/20 border-border/30 rounded-xl text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 px-1">
                      Min (m)
                    </label>
                    <InputGroup className="h-9 bg-muted/20 border-border/30 rounded-xl">
                      <InputGroupButton
                        onClick={() =>
                          setNewPreset({
                            ...newPreset,
                            value: [Math.max(0, newPreset.value[0] - 5), newPreset.value[1]],
                          })
                        }
                      >
                        <Minus className="size-3" />
                      </InputGroupButton>
                      <InputGroupInput
                        type="number"
                        value={newPreset.value[0]}
                        onChange={(e) =>
                          setNewPreset({
                            ...newPreset,
                            value: [parseInt(e.target.value) || 0, newPreset.value[1]],
                          })
                        }
                        className="text-center font-bold text-xs"
                      />
                      <InputGroupButton
                        onClick={() =>
                          setNewPreset({
                            ...newPreset,
                            value: [
                              newPreset.value[0] + 5,
                              Math.max(newPreset.value[0] + 5, newPreset.value[1]),
                            ],
                          })
                        }
                      >
                        <Plus className="size-3" />
                      </InputGroupButton>
                    </InputGroup>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 px-1">
                      Max (m)
                    </label>
                    <InputGroup className="h-9 bg-muted/20 border-border/30 rounded-xl">
                      <InputGroupButton
                        onClick={() =>
                          setNewPreset({
                            ...newPreset,
                            value: [
                              newPreset.value[0],
                              Math.max(newPreset.value[0], newPreset.value[1] - 5),
                            ],
                          })
                        }
                      >
                        <Minus className="size-3" />
                      </InputGroupButton>
                      <InputGroupInput
                        type="number"
                        value={newPreset.value[1]}
                        onChange={(e) =>
                          setNewPreset({
                            ...newPreset,
                            value: [newPreset.value[0], parseInt(e.target.value) || 0],
                          })
                        }
                        className="text-center font-bold text-xs"
                      />
                      <InputGroupButton
                        onClick={() =>
                          setNewPreset({
                            ...newPreset,
                            value: [newPreset.value[0], newPreset.value[1] + 5],
                          })
                        }
                      >
                        <Plus className="size-3" />
                      </InputGroupButton>
                    </InputGroup>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addDurationPreset} className="w-full rounded-xl font-bold text-xs">
                  Create Preset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col gap-3 px-2">
          {settings.action_duration_options.map((preset, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-muted/20 rounded-2xl border border-border/30 group/preset hover:border-primary/20 hover:bg-primary/2 transition-all"
            >
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Input
                    value={preset.label}
                    onChange={(e) => updateDurationPreset(idx, { label: e.target.value })}
                    placeholder={
                      preset.value[0] === preset.value[1]
                        ? `${preset.value[0]}m`
                        : `${preset.value[0]}-${preset.value[1]}m`
                    }
                    className="h-6 text-xs font-bold bg-transparent border-none p-0 focus-visible:ring-0 placeholder:italic w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <InputGroup className="h-7 bg-background/50 border-border/30 rounded-lg flex-1">
                    <InputGroupAddon className="text-[8px] font-bold uppercase tracking-tighter opacity-40 px-1.5">
                      Min
                    </InputGroupAddon>
                    <InputGroupButton
                      size="icon-xs"
                      onClick={() =>
                        updateDurationPreset(idx, {
                          value: [Math.max(0, preset.value[0] - 5), preset.value[1]],
                        })
                      }
                    >
                      <Minus className="size-2" />
                    </InputGroupButton>
                    <span className="text-[10px] font-bold w-6 text-center tabular-nums">
                      {preset.value[0]}
                    </span>
                    <InputGroupButton
                      size="icon-xs"
                      onClick={() =>
                        updateDurationPreset(idx, {
                          value: [
                            preset.value[0] + 5,
                            Math.max(preset.value[0] + 5, preset.value[1]),
                          ],
                        })
                      }
                    >
                      <Plus className="size-2" />
                    </InputGroupButton>
                  </InputGroup>

                  <InputGroup className="h-7 bg-background/50 border-border/30 rounded-lg flex-1">
                    <InputGroupAddon className="text-[8px] font-bold uppercase tracking-tighter opacity-40 px-1.5">
                      Max
                    </InputGroupAddon>
                    <InputGroupButton
                      size="icon-xs"
                      onClick={() =>
                        updateDurationPreset(idx, {
                          value: [preset.value[0], Math.max(preset.value[0], preset.value[1] - 5)],
                        })
                      }
                    >
                      <Minus className="size-2" />
                    </InputGroupButton>
                    <span className="text-[10px] font-bold w-6 text-center tabular-nums">
                      {preset.value[1]}
                    </span>
                    <InputGroupButton
                      size="icon-xs"
                      onClick={() =>
                        updateDurationPreset(idx, {
                          value: [preset.value[0], preset.value[1] + 5],
                        })
                      }
                    >
                      <Plus className="size-2" />
                    </InputGroupButton>
                  </InputGroup>
                </div>
              </div>
              <div className="flex flex-col items-center gap-0.5 opacity-50 group-hover/preset:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => moveDurationPreset(idx, "up")}
                  disabled={idx === 0}
                  className="size-6 text-muted-foreground/90 hover:text-primary hover:bg-primary/10 disabled:opacity-0"
                >
                  <ChevronUp className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeDurationPreset(idx)}
                  className="size-6 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => moveDurationPreset(idx, "down")}
                  disabled={idx === settings.action_duration_options.length - 1}
                  className="size-6 text-muted-foreground/90 hover:text-primary hover:bg-primary/10 disabled:opacity-0"
                >
                  <ChevronDown className="size-3.5" />
                </Button>
              </div>
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
