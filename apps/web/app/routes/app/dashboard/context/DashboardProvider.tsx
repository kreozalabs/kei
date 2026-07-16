import { type ReactNode, useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import type { Action } from "@kreozalabs/kei-core";
import { useSettings } from "@/providers/SettingsContext";
import { useDb } from "@/providers/DbContext";
import { useCurrentDay } from "@/hooks/useCurrentDay";
import { STORAGE_KEYS } from "@kreozalabs/kei-core";

import type { ViewMode } from "../types";
import { useDashboardQueries } from "../hooks/useDashboardQueries";
import { useActionMutations } from "../hooks/useActionMutations";
import { DashboardContext, type DashboardContextValue } from "./DashboardContext";

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { isDbReady, dbError } = useDb();
  const params = useParams();
  const navigate = useNavigate();

  const todayStr = useCurrentDay();

  // Parse splat parameters
  const splatParts = useMemo(() => {
    const splat = params["*"] || "";
    return splat.split("/").filter(Boolean);
  }, [params]);

  // 1. Derive viewMode
  const viewMode = useMemo(() => {
    const urlView = splatParts[0] as ViewMode | undefined;
    const validViews: ViewMode[] = ["day", "week", "month", "year", "agenda", "inbox", "lists"];
    if (urlView && validViews.includes(urlView)) {
      return urlView;
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("kei_dashboard_view_mode") as ViewMode;
      if (stored && validViews.includes(stored)) {
        return stored;
      }
    }
    return "day";
  }, [splatParts]);

  // 2. Derive selectedDate
  const selectedDate = useMemo(() => {
    const year = splatParts[1];
    const month = splatParts[2];
    const day = splatParts[3];

    if (year && month && day) {
      const y = year;
      const m = month.padStart(2, "0");
      const d = day.padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr))) {
        return dateStr;
      }
    }

    if (settings.remember_layout_on_refresh && typeof window !== "undefined") {
      const storedDate = localStorage.getItem(STORAGE_KEYS.LOCAL.SELECTED_DATE);
      if (storedDate && /^\d{4}-\d{2}-\d{2}$/.test(storedDate) && !isNaN(Date.parse(storedDate))) {
        return storedDate;
      }
    }

    return todayStr;
  }, [splatParts, settings.remember_layout_on_refresh, todayStr]);

  const [startDateStr, setStartDateStr] = useState(todayStr);
  const [endDateStr, setEndDateStr] = useState(() => {
    const d = new Date(todayStr);
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });

  // Sync query bounds when selectedDate changes
  useEffect(() => {
    const isChronological = ["day", "week", "month", "year", "agenda"].includes(viewMode);
    if (!isChronological) {
      setStartDateStr(selectedDate);
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 3);
      setEndDateStr(d.toISOString().split("T")[0]);
    }
  }, [selectedDate, viewMode]);

  // Redirection / URL sync effect:
  // Ensure the browser URL matches the active viewMode and selectedDate.
  useEffect(() => {
    const isChronological = ["day", "week", "month", "year", "agenda"].includes(viewMode);

    const urlView = splatParts[0];
    const urlYear = splatParts[1];
    const urlMonth = splatParts[2];
    const urlDay = splatParts[3];

    if (isChronological) {
      const [y, m, d] = selectedDate.split("-");
      const formattedYear = y;
      const formattedMonth = String(Number(m));
      const formattedDay = String(Number(d));

      if (
        urlView !== viewMode ||
        urlYear !== formattedYear ||
        urlMonth !== formattedMonth ||
        urlDay !== formattedDay
      ) {
        navigate(`/app/calendar/${viewMode}/${formattedYear}/${formattedMonth}/${formattedDay}`, {
          replace: true,
        });
      }
    } else {
      // Structural views (inbox, lists)
      if (urlView !== viewMode || urlYear !== undefined) {
        navigate(`/app/calendar/${viewMode}`, { replace: true });
      }
    }
  }, [viewMode, selectedDate, splatParts, navigate]);

  const setViewMode = useCallback(
    (val: ViewMode) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("kei_dashboard_view_mode", val);
      }

      const [y, m, d] = selectedDate.split("-");
      const formattedYear = y;
      const formattedMonth = String(Number(m));
      const formattedDay = String(Number(d));

      const isChronological = ["day", "week", "month", "year", "agenda"].includes(val);
      if (isChronological) {
        navigate(`/app/calendar/${val}/${formattedYear}/${formattedMonth}/${formattedDay}`, {
          replace: true,
        });
      } else {
        navigate(`/app/calendar/${val}`, { replace: true });
      }
    },
    [selectedDate, navigate]
  );

  const setSelectedDate = useCallback(
    (date: string) => {
      if (settings.remember_layout_on_refresh && typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.LOCAL.SELECTED_DATE, date);
      }

      const [y, m, d] = date.split("-");
      const formattedYear = y;
      const formattedMonth = String(Number(m));
      const formattedDay = String(Number(d));

      const urlYear = splatParts[1];
      const urlMonth = splatParts[2];
      const urlDay = splatParts[3];

      if (urlYear !== formattedYear || urlMonth !== formattedMonth || urlDay !== formattedDay) {
        const dest = `/app/calendar/${viewMode}/${formattedYear}/${formattedMonth}/${formattedDay}`;
        navigate(dest, { replace: true });
      }
    },
    [viewMode, splatParts, settings.remember_layout_on_refresh, navigate]
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

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
