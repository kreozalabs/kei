import { MoonIcon, SunIcon, LaptopIcon } from "lucide-react";
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
import type { Theme } from "../../types/settings";
import { TIME_FORMATS, ACCENTS } from "../../config/constants";

export function GeneralSettings() {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50 px-2">
          Accent Color
        </h4>
        <div className="flex items-center gap-2 px-1">
          {ACCENTS.map((a) => (
            <Button
              key={a.name}
              variant="ghost"
              rounded="full"
              className={cn(
                "size-5 p-0 min-w-0 border-none transition-transform hover:scale-110 active:scale-95",
                a.color,
                a.hover,
                settings.accent === a.name
                  ? "ring-2 ring-ring ring-offset-2 ring-offset-background scale-110"
                  : "opacity-80 hover:opacity-100"
              )}
              onClick={() => updateSetting("accent", a.name)}
              title={a.name.charAt(0).toUpperCase() + a.name.slice(1)}
            >
              <span className="sr-only">{a.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50 px-2">
          Theme
        </h4>
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl">
          {(["light", "dark", "system"] as Theme[]).map((t) => (
            <Button
              key={t}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("theme", t)}
              className={cn(
                "flex flex-row items-center justify-center h-8 rounded-lg text-[12px] font-medium transition-colors gap-1.5 border-none",
                settings.theme === t
                  ? "bg-background text-foreground shadow-sm hover:bg-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              {t === "light" && <SunIcon className="size-3.5" />}
              {t === "dark" && <MoonIcon className="size-3.5" />}
              {t === "system" && <LaptopIcon className="size-3.5" />}
              <span className="capitalize">{t}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50 px-2">
          Time Format
        </h4>
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl">
          {[TIME_FORMATS.H12, TIME_FORMATS.H24].map((f) => (
            <Button
              key={f}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("time_format", f)}
              className={cn(
                "flex-1 flex flex-row items-center justify-center h-8 rounded-lg text-[12px] font-medium transition-colors border-none",
                settings.time_format === f
                  ? "bg-background text-foreground shadow-sm hover:bg-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <span>{f === TIME_FORMATS.H12 ? "12-hour" : "24-hour"}</span>
            </Button>
          ))}
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

      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Language
          </h4>
        </div>
        <div className="px-2">
          <Select
            value={settings.language}
            onValueChange={(value) => updateSetting("language", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="en">English</SelectItem>
              {/* Add more languages here when ready */}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
