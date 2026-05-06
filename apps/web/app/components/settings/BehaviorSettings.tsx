import {
  Button,
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kreozalabs/ui";
import { useSettings } from "../../providers/SettingsContext";
import { MAJOR_TIMEZONES } from "../../config/constants";

export function BehaviorSettings() {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Timezone
          </h4>
          <span className="text-[10px] text-muted-foreground/40 font-medium">
            System default or custom
          </span>
        </div>
        <div className="px-2">
          <Select
            value={settings.timezone}
            onValueChange={(value) => updateSetting("timezone", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (System Default)</SelectItem>
              {MAJOR_TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          {[
            { label: "On", value: true },
            { label: "Off", value: false },
          ].map((opt) => (
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
          {[
            { label: "Locked (Today)", value: true },
            { label: "Unlocked (Full)", value: false },
          ].map((opt) => (
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
          {[
            { label: "Expanded", value: true },
            { label: "Collapsed", value: false },
          ].map((opt) => (
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
            Remember Layout on Refresh
          </h4>
          <span className="text-[10px] text-muted-foreground/40 font-medium">
            Keep sections as you left them when you refresh the page
          </span>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl">
          {[
            { label: "On", value: true },
            { label: "Off", value: false },
          ].map((opt) => (
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
