import {
  type ReactNode,
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  startTransition,
} from "react";
import type { Action } from "@kreozalabs/kei-core";
import { useSettings } from "@/providers/SettingsContext";
import { useDb } from "@/providers/DbContext";
import { useCurrentDay } from "@/hooks/useCurrentDay";
import { getTodayString, STORAGE_KEYS } from "@kreozalabs/kei-core";

import type { ViewMode } from "../types";
import { useDashboardQueries } from "../hooks/useDashboardQueries";
import { useActionMutations } from "../hooks/useActionMutations";
import { DashboardContext, type DashboardContextValue } from "./DashboardContext";

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { isDbReady, dbError } = useDb();

  const [viewMode, setViewModeState] = useState<ViewMode>("day");
  const todayStr = useCurrentDay();
  const [selectedDate, setSelectedDateState] = useState(getTodayString);
  const [startDateStr, setStartDateStr] = useState(getTodayString);
  const [endDateStr, setEndDateStr] = useState(() => {
    const d = new Date(getTodayString());
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });

  // Restore client-side state on mount to prevent SSR hydration mismatch warnings
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedViewMode = localStorage.getItem("kei_dashboard_view_mode") as ViewMode;
      if (storedViewMode) {
        setViewModeState(storedViewMode);
      }

      if (settings.remember_layout_on_refresh) {
        const storedDate = localStorage.getItem(STORAGE_KEYS.LOCAL.SELECTED_DATE);
        if (storedDate) {
          setSelectedDateState(storedDate);
        }
      }
    }
  }, [settings.remember_layout_on_refresh]);

  const setViewMode = useCallback((val: ViewMode) => {
    startTransition(() => {
      setViewModeState(val);
    });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("kei_dashboard_view_mode", val);
    }
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

  const queries = useDashboardQueries({
    isDbReady,
    startDate: startDateStr,
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

  const value = useMemo<DashboardContextValue>(
    () => ({
      viewMode,
      setViewMode,
      selectedDate,
      setSelectedDate,
      startDateStr,
      setStartDateStr,
      endDateStr,
      setEndDateStr,
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
    }),
    [
      viewMode,
      setViewMode,
      selectedDate,
      setSelectedDate,
      startDateStr,
      endDateStr,
      todayStr,
      queries.allActions,
      queries.activeActions,
      queries.completedActions,
      queries.abandonedActions,
      isDbReady,
      dbError,
      visibleSelectedActionIds,
      isBulkModeActive,
      isSelectionModeForced,
      handleClearSelection,
      handleSelectToggle,
      actionToEdit,
      isDialogOpen,
      dialogPreDate,
      mutations,
    ]
  );

  return <DashboardContext value={value}>{children}</DashboardContext>;
}
