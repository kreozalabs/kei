// FIXME: Refactor !
import { Button, cn } from "@kreozalabs/kei-ui";

import { useSettings } from "../../providers/SettingsContext";
import {
  DISTRACTION_FREE_OPTIONS,
  TIMELINE_VIEW_OPTIONS,
  SECTION_STATE_OPTIONS,
  OVERDUE_ACTIONS_OPTIONS,
  LAYOUT_PERSISTENCE_OPTIONS,
  SHOW_ABANDONED_OPTIONS,
  SHOW_COMPLETED_OPTIONS,
  DIRECT_EDIT_OPTIONS,
  UNDO_TOAST_OPTIONS,
  SELECTION_OPTIONS,
  SHOW_CHECKBOXES_ON_HOVER_OPTIONS,
  DEFAULT_INSERT_AT_TOP_OPTIONS,
  SHOW_INTENTIONS_OPTIONS,
  SHOW_DEFAULT_ENERGY_OPTIONS,
} from "@kreozalabs/kei-core";

export function BehaviorSettings() {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-muted-foreground/50 text-[11px] font-bold tracking-wider uppercase">
            Distraction-Free Mode
          </h4>
          <span className="text-muted-foreground/40 text-[10px] font-medium">
            e.g., Hide header when idle
          </span>
        </div>
        <div className="bg-muted/40 flex items-center gap-1.5 rounded-xl p-1">
          {DISTRACTION_FREE_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("subtle_on_idle", opt.value)}
              className={cn(
                "flex h-8 flex-1 flex-row items-center justify-center rounded-lg border-none text-[12px] font-medium transition-colors",
                settings.subtle_on_idle === opt.value
                  ? "bg-background text-foreground hover:bg-background shadow-sm"
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
          <h4 className="text-muted-foreground/50 text-[11px] font-bold tracking-wider uppercase">
            Default Timeline View
          </h4>
          <span className="text-muted-foreground/40 text-[10px] font-medium">
            Initial state of the dashboard
          </span>
        </div>
        <div className="bg-muted/40 flex items-center gap-1.5 rounded-xl p-1">
          {TIMELINE_VIEW_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("today_locked", opt.value)}
              className={cn(
                "flex h-8 flex-1 flex-row items-center justify-center rounded-lg border-none text-[12px] font-medium transition-colors",
                settings.today_locked === opt.value
                  ? "bg-background text-foreground hover:bg-background shadow-sm"
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
          <h4 className="text-muted-foreground/50 text-[11px] font-bold tracking-wider uppercase">
            Default Section State
          </h4>
          <span className="text-muted-foreground/40 text-[10px] font-medium">
            Initial state for action sections
          </span>
        </div>
        <div className="bg-muted/40 flex items-center gap-1.5 rounded-xl p-1">
          {SECTION_STATE_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("section_expanded", opt.value)}
              className={cn(
                "flex h-8 flex-1 flex-row items-center justify-center rounded-lg border-none text-[12px] font-medium transition-colors",
                settings.section_expanded === opt.value
                  ? "bg-background text-foreground hover:bg-background shadow-sm"
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
          <h4 className="text-muted-foreground/50 text-[11px] font-bold tracking-wider uppercase">
            Overdue Actions
          </h4>
          <span className="text-muted-foreground/40 text-[10px] font-medium">
            Initial state of the Overdue section
          </span>
        </div>
        <div className="bg-muted/40 flex items-center gap-1.5 rounded-xl p-1">
          {OVERDUE_ACTIONS_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("show_overdue", opt.value)}
              className={cn(
                "flex h-8 flex-1 flex-row items-center justify-center rounded-lg border-none text-[12px] font-medium transition-colors",
                settings.show_overdue === opt.value
                  ? "bg-background text-foreground hover:bg-background shadow-sm"
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
          <h4 className="text-muted-foreground/50 text-[11px] font-bold tracking-wider uppercase">
            Abandoned Actions
          </h4>
          <span className="text-muted-foreground/40 text-[10px] font-medium">
            Toggle visibility of abandoned actions
          </span>
        </div>
        <div className="bg-muted/40 flex items-center gap-1.5 rounded-xl p-1">
          {SHOW_ABANDONED_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("show_abandoned", opt.value)}
              className={cn(
                "flex h-8 flex-1 flex-row items-center justify-center rounded-lg border-none text-[12px] font-medium transition-colors",
                settings.show_abandoned === opt.value
                  ? "bg-background text-foreground hover:bg-background shadow-sm"
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
          <h4 className="text-muted-foreground/50 text-[11px] font-bold tracking-wider uppercase">
            Completed Actions
          </h4>
          <span className="text-muted-foreground/40 text-[10px] font-medium">
            Toggle visibility of completed actions
          </span>
        </div>
        <div className="bg-muted/40 flex items-center gap-1.5 rounded-xl p-1">
          {SHOW_COMPLETED_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("show_completed", opt.value)}
              className={cn(
                "flex h-8 flex-1 flex-row items-center justify-center rounded-lg border-none text-[12px] font-medium transition-colors",
                settings.show_completed === opt.value
                  ? "bg-background text-foreground hover:bg-background shadow-sm"
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
          <h4 className="text-muted-foreground/50 text-[11px] font-bold tracking-wider uppercase">
            Click Action Behavior
          </h4>
          <span className="text-muted-foreground/40 text-[10px] font-medium">
            Configure default action when clicking a task
          </span>
        </div>
        <div className="bg-muted/40 flex items-center gap-1.5 rounded-xl p-1">
          {DIRECT_EDIT_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("direct_edit_mode", opt.value)}
              className={cn(
                "flex h-8 flex-1 flex-row items-center justify-center rounded-lg border-none text-[12px] font-medium transition-colors",
                settings.direct_edit_mode === opt.value
                  ? "bg-background text-foreground hover:bg-background shadow-sm"
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
          <h4 className="text-muted-foreground/50 text-[11px] font-bold tracking-wider uppercase">
            Remember Layout on Refresh
          </h4>
          <span className="text-muted-foreground/40 text-[10px] font-medium">
            Keep sections as you left them when you refresh the page
          </span>
        </div>
        <div className="bg-muted/40 flex items-center gap-1.5 rounded-xl p-1">
          {LAYOUT_PERSISTENCE_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("remember_layout_on_refresh", opt.value)}
              className={cn(
                "flex h-8 flex-1 flex-row items-center justify-center rounded-lg border-none text-[12px] font-medium transition-colors",
                settings.remember_layout_on_refresh === opt.value
                  ? "bg-background text-foreground hover:bg-background shadow-sm"
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
          <h4 className="text-muted-foreground/50 text-[11px] font-bold tracking-wider uppercase">
            Undo Toast on Action
          </h4>
          <span className="text-muted-foreground/40 text-[10px] font-medium">
            Show a toast to undo when updating or deleting actions
          </span>
        </div>
        <div className="bg-muted/40 flex items-center gap-1.5 rounded-xl p-1">
          {UNDO_TOAST_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("enable_undo_toast", opt.value)}
              className={cn(
                "flex h-8 flex-1 flex-row items-center justify-center rounded-lg border-none text-[12px] font-medium transition-colors",
                settings.enable_undo_toast === opt.value
                  ? "bg-background text-foreground hover:bg-background shadow-sm"
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
          <h4 className="text-muted-foreground/50 text-[11px] font-bold tracking-wider uppercase">
            Multi-Select & Bulk Actions
          </h4>
          <span className="text-muted-foreground/40 text-[10px] font-medium">
            Enable selection checkboxes to perform batch actions
          </span>
        </div>
        <div className="bg-muted/40 flex items-center gap-1.5 rounded-xl p-1">
          {SELECTION_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("enable_selection", opt.value)}
              className={cn(
                "flex h-8 flex-1 flex-row items-center justify-center rounded-lg border-none text-[12px] font-medium transition-colors",
                settings.enable_selection === opt.value
                  ? "bg-background text-foreground hover:bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <span>{opt.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {settings.enable_selection && (
        <div className="animate-in fade-in slide-in-from-top-2 space-y-3 duration-300">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-muted-foreground/50 text-[11px] font-bold tracking-wider uppercase">
              Checkbox Visibility
            </h4>
            <span className="text-muted-foreground/40 text-[10px] font-medium">
              Choose when selection checkboxes are displayed
            </span>
          </div>
          <div className="bg-muted/40 flex items-center gap-1.5 rounded-xl p-1">
            {SHOW_CHECKBOXES_ON_HOVER_OPTIONS.map((opt) => (
              <Button
                key={opt.label}
                variant="ghost"
                size="sm"
                onClick={() => updateSetting("show_checkboxes_on_hover", opt.value)}
                className={cn(
                  "flex h-8 flex-1 flex-row items-center justify-center rounded-lg border-none text-[12px] font-medium transition-colors",
                  settings.show_checkboxes_on_hover === opt.value
                    ? "bg-background text-foreground hover:bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                <span>{opt.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-muted-foreground/50 text-[11px] font-bold tracking-wider uppercase">
            Default Task Position
          </h4>
          <span className="text-muted-foreground/40 text-[10px] font-medium">
            Where new tasks are inserted by default
          </span>
        </div>
        <div className="bg-muted/40 flex items-center gap-1.5 rounded-xl p-1">
          {DEFAULT_INSERT_AT_TOP_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("default_insert_at_top", opt.value)}
              className={cn(
                "flex h-8 flex-1 flex-row items-center justify-center rounded-lg border-none text-[12px] font-medium transition-colors",
                settings.default_insert_at_top === opt.value
                  ? "bg-background text-foreground hover:bg-background shadow-sm"
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
          <h4 className="text-muted-foreground/50 text-[11px] font-bold tracking-wider uppercase">
            Task Intentions (Want/Must)
          </h4>
          <span className="text-muted-foreground/40 text-[10px] font-medium">
            Categorize actions as 'Want to do' or 'Must do'
          </span>
        </div>
        <div className="bg-muted/40 flex items-center gap-1.5 rounded-xl p-1">
          {SHOW_INTENTIONS_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("show_intentions", opt.value)}
              className={cn(
                "flex h-8 flex-1 flex-row items-center justify-center rounded-lg border-none text-[12px] font-medium transition-colors",
                settings.show_intentions === opt.value
                  ? "bg-background text-foreground hover:bg-background shadow-sm"
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
          <h4 className="text-muted-foreground/50 text-[11px] font-bold tracking-wider uppercase">
            Default Energy Badge
          </h4>
          <span className="text-muted-foreground/40 text-[10px] font-medium">
            Show the energy badge on tasks matching default energy
          </span>
        </div>
        <div className="bg-muted/40 flex items-center gap-1.5 rounded-xl p-1">
          {SHOW_DEFAULT_ENERGY_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => updateSetting("show_default_energy", opt.value)}
              className={cn(
                "flex h-8 flex-1 flex-row items-center justify-center rounded-lg border-none text-[12px] font-medium transition-colors",
                settings.show_default_energy === opt.value
                  ? "bg-background text-foreground hover:bg-background shadow-sm"
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
