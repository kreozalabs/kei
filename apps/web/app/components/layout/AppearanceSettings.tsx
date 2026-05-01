import { MoonIcon, SunIcon, LaptopIcon } from "lucide-react";
import { Button, cn } from "@kreozalabs/ui";
import { useTheme, type Accent, type Theme } from "../../providers/ThemeContext";

const ACCENTS: { name: Accent; color: string; hover: string }[] = [
  { name: "blue", color: "bg-[#1e60f2]", hover: "hover:bg-[#1e60f2]" },
  { name: "indigo", color: "bg-[#818cf8]", hover: "hover:bg-[#818cf8]" },
  { name: "violet", color: "bg-[#a78bfa]", hover: "hover:bg-[#a78bfa]" },
  { name: "emerald", color: "bg-[#10b981]", hover: "hover:bg-[#10b981]" },
  { name: "rose", color: "bg-[#f43f5e]", hover: "hover:bg-[#f43f5e]" },
  { name: "amber", color: "bg-[#f59e0b]", hover: "hover:bg-[#f59e0b]" },
  { name: "forest", color: "bg-[#22c55e]", hover: "hover:bg-[#22c55e]" },
];

export function AppearanceSettings() {
  const { theme, setTheme, accent, setAccent, timeFormat, setTimeFormat, showRecentConfigs, setShowRecentConfigs } = useTheme();

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
                "size-5 p-0 min-w-0 border-none transition-all hover:scale-110 active:scale-95",
                a.color,
                a.hover,
                accent === a.name
                  ? "ring-2 ring-ring ring-offset-2 ring-offset-background scale-110"
                  : "opacity-80 hover:opacity-100"
              )}
              onClick={() => setAccent(a.name)}
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
              onClick={() => setTheme(t)}
              className={cn(
                "flex flex-row items-center justify-center h-8 rounded-lg text-[12px] font-medium transition-all gap-1.5 border-none",
                theme === t
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
          {(["12h", "24h"] as const).map((f) => (
            <Button
              key={f}
              variant="ghost"
              size="sm"
              onClick={() => setTimeFormat(f)}
              className={cn(
                "flex-1 flex flex-row items-center justify-center h-8 rounded-lg text-[12px] font-medium transition-all border-none",
                timeFormat === f
                  ? "bg-background text-foreground shadow-sm hover:bg-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <span>{f === "12h" ? "12-hour" : "24-hour"}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Recent Configs
          </h4>
          <span className="text-[10px] text-muted-foreground/40 font-medium">
            Quick action presets
          </span>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl">
          {[
            { label: "Show", value: true },
            { label: "Hide", value: false },
          ].map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => setShowRecentConfigs(opt.value)}
              className={cn(
                "flex-1 flex flex-row items-center justify-center h-8 rounded-lg text-[12px] font-medium transition-all border-none",
                showRecentConfigs === opt.value
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
