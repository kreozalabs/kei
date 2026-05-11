import { Button, cn } from "@kreozalabs/ui";

import { useSettings } from "../../providers/SettingsContext";
import {
  LANGUAGE_OPTIONS,
  DISTRACTION_FREE_OPTIONS,
  TIMELINE_VIEW_OPTIONS,
  SECTION_STATE_OPTIONS,
  OVERDUE_ACTIONS_OPTIONS,
  LAYOUT_PERSISTENCE_OPTIONS,
} from "../../config/constants";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { TimezoneSelector } from "../TimezoneSelector";

export function BehaviorSettings() {
  const { settings, updateSetting } = useSettings();

  const presets = settings.action_timezone_options || [];

  const handleDetect = () => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    updateSetting("timezone", detected);
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
          <TimezoneSelector
            value={settings.timezone}
            onSelect={(tz) => updateSetting("timezone", tz)}
            showAuto={true}
          />
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
