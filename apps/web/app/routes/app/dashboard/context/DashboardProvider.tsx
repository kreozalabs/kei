import { type ReactNode, useState, useMemo, useRef, useEffect, useCallback } from "react";
import type { Action } from "@kreozalabs/core";
import { useSettings } from "@/providers/SettingsContext";
import { useDb } from "@/providers/DbContext";
import { useCurrentDay } from "@/hooks/useCurrentDay";
import { getTodayString, STORAGE_KEYS } from "@kreozalabs/core";

import type { ViewMode } from "../types";
import { useDashboardQueries } from "../hooks/useDashboardQueries";
import { useActionMutations } from "../hooks/useActionMutations";
import { DashboardContext, type DashboardContextValue } from "./DashboardContext";

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { isDbReady, dbError } = useDb();

  const [viewMode, setViewModeState] = useState<ViewMode>("day");
  const [isTodayLocked, setIsTodayLockedState] = useState(true);
  const todayStr = useCurrentDay();
  const [selectedDate, setSelectedDateState] = useState(getTodayString);

  // Restore client-side state on mount to prevent SSR hydration mismatch warnings
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedViewMode = localStorage.getItem("kei_dashboard_view_mode") as ViewMode;
      if (storedViewMode) {
        setViewModeState(storedViewMode);
      }

      const storedLock = sessionStorage.getItem(STORAGE_KEYS.SESSION.TIMELINE_LOCKED);
      if (storedLock !== null) {
        setIsTodayLockedState(storedLock === "true");
      } else {
        setIsTodayLockedState(settings.today_locked);
      }

      if (settings.remember_layout_on_refresh) {
        const storedDate = localStorage.getItem(STORAGE_KEYS.LOCAL.SELECTED_DATE);
        if (storedDate) {
          setSelectedDateState(storedDate);
        }
      }
    }
  }, [settings.today_locked, settings.remember_layout_on_refresh]);

  const setViewMode = useCallback((val: ViewMode) => {
    setViewModeState(val);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("kei_dashboard_view_mode", val);
    }
  }, []);

  const setIsTodayLocked = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    setIsTodayLockedState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(STORAGE_KEYS.SESSION.TIMELINE_LOCKED, String(next));
      }
      return next;
    });
  }, []);

  const setSelectedDate = useCallback(
    (date: string) => {
      setSelectedDateState(date);
      if (settings.remember_layout_on_refresh) {
        localStorage.setItem(STORAGE_KEYS.LOCAL.SELECTED_DATE, date);
      }
    },
    [settings.remember_layout_on_refresh]
  );

  const startDate = isTodayLocked ? todayStr : selectedDate;
  // Compute endDate appropriately based on view mode or settings. For Day Grid, timeline is +3 days.
  const endDateStr = useMemo(() => {
    if (isTodayLocked) return todayStr;
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 3); // Based on TIME.TIMELINE_DAYS
    return d.toISOString().split("T")[0];
  }, [isTodayLocked, selectedDate, todayStr]);

  const queries = useDashboardQueries({
    isDbReady,
    startDate,
    endDate: endDateStr,
    showCompleted: settings.show_completed,
    showAbandoned: settings.show_abandoned,
  });

  const activeWritesRef = useRef(0);

  const [selectedActionIds, setSelectedActionIds] = useState<Set<string>>(new Set());
  const [isSelectionModeForced, setIsSelectionModeForced] = useState(false);

  const visibleSelectedActionIds = useMemo(() => {
    if (!settings.enable_selection) return new Set<string>();
    const validIds = new Set<string>();
    const allActionIds = new Set(queries.allActions.map((a) => a.id));
    selectedActionIds.forEach((id) => {
      if (allActionIds.has(id)) {
        validIds.add(id);
      }
    });
    return validIds;
  }, [selectedActionIds, queries.allActions, settings.enable_selection]);

  const isBulkModeActive = visibleSelectedActionIds.size > 0 || isSelectionModeForced;
  const selectedActions = useMemo(() => {
    return queries.allActions.filter((a) => visibleSelectedActionIds.has(a.id));
  }, [queries.allActions, visibleSelectedActionIds]);

  const handleSelectToggle = useCallback(
    (id: string) => {
      if (!settings.enable_selection) return;
      setSelectedActionIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [settings.enable_selection]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedActionIds(new Set());
    setIsSelectionModeForced(false);
  }, []);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogPreDate, setDialogPreDate] = useState<string | null>(null);
  const [actionToEdit, setActionToEdit] = useState<Action | null>(null);

  const mutations = useActionMutations({
    allActions: queries.allActions,
    enableUndoToast: settings.enable_undo_toast,
    activeWritesRef,
    selectedActions,
    visibleSelectedActionIds,
    setSelectedActionIds,
  });

  const value: DashboardContextValue = {
    viewMode,
    setViewMode,
    isTodayLocked,
    setIsTodayLocked,
    selectedDate,
    setSelectedDate,
    todayStr,
    allActions: queries.allActions,
    activeActions: queries.activeActions,
    completedActions: queries.completedActions,
    abandonedActions: queries.abandonedActions,
    isDbReady,
    dbError,
    visibleSelectedActionIds,
    setSelectedActionIds,
    isBulkModeActive,
    isSelectionModeForced,
    setIsSelectionModeForced,
    handleClearSelection,
    handleSelectToggle,
    actionToEdit,
    setActionToEdit,
    isDialogOpen,
    setIsDialogOpen,
    dialogPreDate,
    setDialogPreDate,
    mutations,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
