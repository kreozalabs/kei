import { createContext, useContext } from "react";
import type { Action } from "@kreozalabs/kei-core";
import type { ViewMode } from "../types";
import { useActionMutations } from "../hooks/useActionMutations";

export interface DashboardContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  selectedDate: string;
  setSelectedDate: (date: string) => void;
  startDateStr: string;
  setStartDateStr: (date: string) => void;
  endDateStr: string;
  setEndDateStr: (date: string) => void;
  todayStr: string;

  allActions: Action[];
  activeActions: Action[];
  completedActions: Action[];
  abandonedActions: Action[];

  isDbReady: boolean;
  dbError: Error | null;

  visibleSelectedActionIds: Set<string>;
  setSelectedActionIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  isBulkModeActive: boolean;
  isSelectionModeForced: boolean;
  setIsSelectionModeForced: (val: boolean) => void;
  handleClearSelection: () => void;
  handleSelectToggle: (id: string) => void;

  actionToEdit: Action | null;
  setActionToEdit: (action: Action | null) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (val: boolean) => void;
  dialogPreDate: string | null;
  setDialogPreDate: (date: string | null) => void;

  mutations: ReturnType<typeof useActionMutations>;
}

export const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardContext must be used within a DashboardProvider");
  }
  return context;
}
