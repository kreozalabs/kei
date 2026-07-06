// FIXME: Refactor !
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
import type { Theme } from "@kreozalabs/core";
import { TIME_FORMATS, ACCENTS, LANGUAGES, LANGUAGE_LABELS } from "@kreozalabs/core";

export function PersonalizationSettings() {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h4 className="text-muted-foreground/50 px-2 text-[11px] font-bold tracking-wider uppercase">
          Accent Color
        </h4>
        <div className="flex items-center gap-2 px-1">
          {ACCENTS.map((a) => (
            <Button
              key={a.name}
              variant="ghost"
              className={cn(
                "size-5 min-w-0 rounded-full border-none p-0 transition-transform hover:scale-110 active:scale-95",
                a.color,
                a.hover,
                settings.accent === a.name
                  ? "ring-ring ring-offset-background scale-110 ring-2 ring-offset-2"
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
        <h4 className="text-muted-foreground/50 px-2 text-[11px] font-bold tracking-wider uppercase">
          Theme
        </h4>
        <div className="bg-muted/40 flex items-center gap-1.5 rounded-xl p-1">
          {(["light", "dark", "system"] as Theme[]).map((t) => (
            <Button
              key={t}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("theme", t)}
              className={cn(
                "flex h-8 flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border-none text-[12px] font-medium transition-colors",
                settings.theme === t
                  ? "bg-background text-foreground hover:bg-background shadow-sm"
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
        <h4 className="text-muted-foreground/50 px-2 text-[11px] font-bold tracking-wider uppercase">
          Time Format
        </h4>
        <div className="bg-muted/40 flex items-center gap-1.5 rounded-xl p-1">
          {[TIME_FORMATS.H12, TIME_FORMATS.H24].map((f) => (
            <Button
              key={f}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("time_format", f)}
              className={cn(
                "flex h-8 flex-1 flex-row items-center justify-center rounded-lg border-none text-[12px] font-medium transition-colors",
                settings.time_format === f
                  ? "bg-background text-foreground hover:bg-background shadow-sm"
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
          <h4 className="text-muted-foreground/50 text-[11px] font-bold tracking-wider uppercase">
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
              {Object.values(LANGUAGES).map((l) => (
                <SelectItem key={l} value={l}>
                  {LANGUAGE_LABELS[l] || l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
