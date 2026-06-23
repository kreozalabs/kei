import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useOutletContext } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppLayoutContext } from "@/components/layout/AppLayout";
import { HeaderSearch, HeaderNewAction } from "@/components/layout/AppHeader";
import { useDb } from "@/providers/DbContext";
import {
  getActions,
  completeAction,
  activateAction,
  abandonAction,
  deleteActionPermanently,
  restoreAction,
  bulkCompleteActions,
  bulkActivateActions,
  bulkAbandonActions,
  updateAction,
  bulkStatusUpdateActions,
  bulkUpdateMultipleActions,
} from "@/db/actions";
import { useCurrentDay } from "@/hooks/useCurrentDay";
import {
  getTodayString,
  formatDate,
  getNextDayString,
  formatShortDate,
  formatFullWeekday,
  formatTitleDate,
  parseDateString,
} from "@kreozalabs/core";
import {
  Button,
  cn,
  Input,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  toast,
} from "@kreozalabs/ui";
import {
  LockIcon,
  UnlockIcon,
  Loader2Icon,
  Trash2Icon,
  CheckCircle2Icon,
  CalendarIcon,
  RotateCcw,
  MoreVertical,
  CheckSquare,
  X,
} from "lucide-react";
import type { Action, ActionStatus } from "@kreozalabs/core";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    __activeWrites?: number;
  }
}
import { ActionSection } from "@/components/ActionSection";
import { DragResizeWrapper } from "@/components/DragResizeWrapper";
import { ActionDetailView } from "@/components/ActionDetailView";
import { ActionInput } from "@/components/action-input";
import { TimelineCalendar } from "@/components/TimelineCalendar";
import { ActionSectionSkeleton } from "@/components/ActionSkeleton";
import { useSettings } from "@/providers/SettingsContext";
import { STORAGE_KEYS, ACTION_STATUS, TIME } from "@kreozalabs/core";

export default function Dashboard() {
  const { settings, updateSetting } = useSettings();
  const { isDbReady, dbError } = useDb();
  const queryClient = useQueryClient();
  const [isTodayLocked, setIsTodayLocked] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.sessionStorage.getItem(STORAGE_KEYS.SESSION.TIMELINE_LOCKED);
      if (stored !== null) return stored === "true";
    }

    return settings.today_locked;
  });

  const todayStr = useCurrentDay();
  const [selectedDate, setSelectedDate] = useState(() => {
    if (typeof window !== "undefined" && settings.remember_layout_on_refresh) {
      const stored = localStorage.getItem(STORAGE_KEYS.LOCAL.SELECTED_DATE);
      if (stored) return stored;
    }
    return getTodayString();
  });

  useEffect(() => {
    if (settings.remember_layout_on_refresh) {
      localStorage.setItem(STORAGE_KEYS.LOCAL.SELECTED_DATE, selectedDate);
    }
  }, [selectedDate, settings.remember_layout_on_refresh]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogPreDate, setDialogPreDate] = useState<string | null>(null);
  const [actionToEdit, setActionToEdit] = useState<Action | null>(null);
  const [editorMode, setEditorMode] = useState<"floating" | "docked" | "drawer">("floating");
  const activeWritesRef = useRef(0);

  useMemo(() => {
    let val = 0;
    Object.defineProperty(activeWritesRef, "current", {
      get() {
        return val;
      },
      set(newVal) {
        const diff = newVal - val;
        val = newVal;
        if (typeof window !== "undefined") {
          window.__activeWrites = Math.max(0, (window.__activeWrites || 0) + diff);
          window.dispatchEvent(new CustomEvent("kei_active_writes_change"));
        }
      },
      configurable: true,
    });
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEYS.SESSION.TIMELINE_LOCKED, String(isTodayLocked));
  }, [isTodayLocked]);

  const { setTitle, setSubtitle, setHeaderActions, setIsDocked } =
    useOutletContext<AppLayoutContext>();
  const startDate = isTodayLocked ? todayStr : selectedDate;
  const endDate = useMemo(() => {
    if (isTodayLocked) return todayStr;
    const d = parseDateString(selectedDate);
    d.setDate(d.getDate() + TIME.TIMELINE_DAYS);
    return formatDate(d);
  }, [isTodayLocked, selectedDate, todayStr]);

  const { data: activeActions = [] } = useQuery({
    queryKey: ["actions", { status: ACTION_STATUS.ACTIVE, endDate }],
    queryFn: () => getActions({ status: [ACTION_STATUS.ACTIVE], endDate }),
    enabled: isDbReady,
  });

  const { data: completedActions = [] } = useQuery({
    queryKey: ["actions", { status: ACTION_STATUS.COMPLETED, startDate, endDate }],
    queryFn: () =>
      getActions({
        status: [ACTION_STATUS.COMPLETED],
        startDate,
        endDate,
      }),
    enabled: isDbReady && settings.show_completed,
  });

  const { data: abandonedActions = [] } = useQuery({
    queryKey: ["actions", { status: ACTION_STATUS.ABANDONED, startDate, endDate }],
    queryFn: () =>
      getActions({
        status: [ACTION_STATUS.ABANDONED],
        startDate,
        endDate,
      }),
    enabled: isDbReady && settings.show_abandoned,
  });

  const allActions = useMemo(() => {
    const list = [...activeActions];
    if (settings.show_completed) {
      list.push(...completedActions);
    }
    if (settings.show_abandoned) {
      list.push(...abandonedActions);
    }
    return list;
  }, [
    activeActions,
    completedActions,
    abandonedActions,
    settings.show_completed,
    settings.show_abandoned,
  ]);

  const updateActionsQueriesCache = (
    actionIds: string | string[],
    nextStatus: ActionStatus,
    updatedActionData?: Partial<Action>
  ) => {
    const ids = Array.isArray(actionIds) ? actionIds : [actionIds];
    const idSet = new Set(ids);

    const queries = queryClient.getQueryCache().findAll({ queryKey: ["actions"] });

    queries.forEach((query) => {
      const queryKey = query.queryKey;
      const filter = queryKey[1] as
        | {
            status?: string | string[];
            startDate?: string;
            endDate?: string;
          }
        | undefined;

      queryClient.setQueryData<Action[]>(queryKey, (oldData) => {
        if (!oldData) return [];
        const statusFilter = filter?.status;
        if (statusFilter) {
          const statuses = Array.isArray(statusFilter) ? statusFilter : [statusFilter];
          const matchesNextStatus = statuses.includes(nextStatus);

          let nextData = [...oldData];

          if (matchesNextStatus) {
            // Update existing ones in place, and add any that are not in the list yet
            ids.forEach((id) => {
              const index = nextData.findIndex((a) => a.id === id);
              if (index !== -1) {
                nextData[index] = {
                  ...nextData[index],
                  ...updatedActionData,
                  status: nextStatus,
                };
              } else {
                const actionToRestore = allActions.find((a) => a.id === id);
                if (actionToRestore) {
                  nextData.unshift({
                    ...actionToRestore,
                    ...updatedActionData,
                    status: nextStatus,
                  });
                }
              }
            });
          } else {
            // Remove any that match nextStatus mismatch
            nextData = nextData.filter((a) => !idSet.has(a.id));
          }

          return nextData;
        }

        return oldData.map((a) =>
          idSet.has(a.id) ? { ...a, ...updatedActionData, status: nextStatus } : a
        );
      });
    });
  };

  const handleComplete = async (action: Action) => {
    const isCompleted = action.status === ACTION_STATUS.COMPLETED;
    const nextStatus = isCompleted ? ACTION_STATUS.ACTIVE : ACTION_STATUS.COMPLETED;

    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

    if (settings.enable_undo_toast) {
      toast.success(isCompleted ? `"${action.title}" reactivated` : `"${action.title}" completed`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const revertedQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
            previousQueries.forEach(([queryKey, data]) => {
              queryClient.setQueryData(queryKey, data);
            });
            activeWritesRef.current++;
            await queryClient.cancelQueries({ queryKey: ["actions"] });
            try {
              if (isCompleted) {
                await completeAction(action.id);
              } else {
                await activateAction(action.id);
              }
              toast.success("Reverted status change");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to revert status change");
            } finally {
              activeWritesRef.current--;
              if (activeWritesRef.current === 0) {
                queryClient.invalidateQueries({ queryKey: ["actions"] });
              }
            }
          },
        },
      });
    }

    updateActionsQueriesCache(action.id, nextStatus);

    activeWritesRef.current++;
    await queryClient.cancelQueries({ queryKey: ["actions"] });
    try {
      if (isCompleted) {
        await activateAction(action.id);
      } else {
        await completeAction(action.id);
      }
    } catch (error) {
      console.error("Failed to complete action:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to complete action");
    } finally {
      activeWritesRef.current--;
      if (activeWritesRef.current === 0) {
        queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    }
  };

  const handleAbandon = async (action: Action) => {
    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

    if (settings.enable_undo_toast) {
      toast.success(`"${action.title}" abandoned`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const revertedQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
            previousQueries.forEach(([queryKey, data]) => {
              queryClient.setQueryData(queryKey, data);
            });
            activeWritesRef.current++;
            await queryClient.cancelQueries({ queryKey: ["actions"] });
            try {
              await activateAction(action.id);
              toast.success("Action reactivated");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to reactivate action");
            } finally {
              activeWritesRef.current--;
              if (activeWritesRef.current === 0) {
                queryClient.invalidateQueries({ queryKey: ["actions"] });
              }
            }
          },
        },
      });
    }

    updateActionsQueriesCache(action.id, ACTION_STATUS.ABANDONED);

    activeWritesRef.current++;
    await queryClient.cancelQueries({ queryKey: ["actions"] });
    try {
      await abandonAction(action.id);
    } catch (error) {
      console.error("Failed to abandon action:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to abandon action");
    } finally {
      activeWritesRef.current--;
      if (activeWritesRef.current === 0) {
        queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    }
  };

  const handleReactivate = async (action: Action) => {
    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

    if (settings.enable_undo_toast) {
      toast.success(`"${action.title}" reactivated`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const revertedQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
            previousQueries.forEach(([queryKey, data]) => {
              queryClient.setQueryData(queryKey, data);
            });
            activeWritesRef.current++;
            await queryClient.cancelQueries({ queryKey: ["actions"] });
            try {
              await abandonAction(action.id);
              toast.success("Action abandoned");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to abandon action");
            } finally {
              activeWritesRef.current--;
              if (activeWritesRef.current === 0) {
                queryClient.invalidateQueries({ queryKey: ["actions"] });
              }
            }
          },
        },
      });
    }

    updateActionsQueriesCache(action.id, ACTION_STATUS.ACTIVE);

    activeWritesRef.current++;
    await queryClient.cancelQueries({ queryKey: ["actions"] });
    try {
      await activateAction(action.id);
    } catch (error) {
      console.error("Failed to reactivate action:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to reactivate action");
    } finally {
      activeWritesRef.current--;
      if (activeWritesRef.current === 0) {
        queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    }
  };

  const handleDeletePermanently = async (action: Action) => {
    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

    if (settings.enable_undo_toast) {
      toast.success(`"${action.title}" deleted permanently`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const revertedQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
            previousQueries.forEach(([queryKey, data]) => {
              queryClient.setQueryData(queryKey, data);
            });
            activeWritesRef.current++;
            await queryClient.cancelQueries({ queryKey: ["actions"] });
            try {
              await restoreAction(action); // FIXME: should we not just provide id?
              toast.success("Action restored");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to restore action");
            } finally {
              activeWritesRef.current--;
              if (activeWritesRef.current === 0) {
                queryClient.invalidateQueries({ queryKey: ["actions"] });
              }
            }
          },
        },
      });
    }

    queryClient.setQueriesData<Action[]>({ queryKey: ["actions"] }, (oldData) => {
      if (!oldData) return [];
      return oldData.filter((a) => a.id !== action.id);
    });

    activeWritesRef.current++;
    await queryClient.cancelQueries({ queryKey: ["actions"] });
    try {
      await deleteActionPermanently(action.id);
    } catch (error) {
      console.error("Failed to delete action permanently:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to delete action");
    } finally {
      activeWritesRef.current--;
      if (activeWritesRef.current === 0) {
        queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    }
  };

  const handleEdit = (action: Action) => {
    setActionToEdit(action);
    setIsDialogOpen(true);
  };

  // Multi-select & Bulk actions state
  const [selectedActionIds, setSelectedActionIds] = useState<Set<string>>(new Set());
  const [isSelectionModeForced, setIsSelectionModeForced] = useState(false);

  // Filter selected IDs to only valid visible actions to prevent ghost selections
  const visibleSelectedActionIds = useMemo(() => {
    if (!settings.enable_selection) return new Set<string>();
    const validIds = new Set<string>();
    const allActionIds = new Set(allActions.map((a) => a.id));
    selectedActionIds.forEach((id) => {
      if (allActionIds.has(id)) {
        validIds.add(id);
      }
    });
    return validIds;
  }, [selectedActionIds, allActions, settings.enable_selection]);

  const isBulkModeActive = visibleSelectedActionIds.size > 0 || isSelectionModeForced;

  const selectedActions = useMemo(() => {
    return allActions.filter((a) => visibleSelectedActionIds.has(a.id));
  }, [allActions, visibleSelectedActionIds]);

  const areAllSelectedCompleted = useMemo(() => {
    return (
      selectedActions.length > 0 &&
      selectedActions.every((a) => a.status === ACTION_STATUS.COMPLETED)
    );
  }, [selectedActions]);

  const handleSelectToggle = (id: string) => {
    if (!settings.enable_selection) return;
    setSelectedActionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearSelection = useCallback(() => {
    setSelectedActionIds(new Set());
    setIsSelectionModeForced(false);
  }, []);

  useEffect(() => {
    setTitle("Timeline");
    setSubtitle(formatTitleDate(parseDateString(startDate)));

    setHeaderActions({
      center: (
        <div className="flex items-center gap-2">
          {/* Sticky Today Button */}
          {!isTodayLocked && selectedDate !== todayStr && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-200">
              <Button
                onClick={() => setSelectedDate(todayStr)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-wider rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all border-none"
              >
                Today
              </Button>
            </div>
          )}
          <HeaderSearch />
        </div>
      ),
      right: (
        <div className="flex items-center gap-2">
          <div onClick={() => {
            setDialogPreDate(null);
            setActionToEdit(null);
            setIsDialogOpen(true);
          }}>
            <HeaderNewAction />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsTodayLocked((prev) => !prev)}
            className="size-8 border-none rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
            title={isTodayLocked ? "Unlock Timeline" : "Lock to Today"}
          >
            {isTodayLocked ? <LockIcon className="size-4" /> : <UnlockIcon className="size-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 border-none rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
                title="More Actions"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background border-border/40">
              {settings.enable_selection && (
                <DropdownMenuCheckboxItem
                  checked={isSelectionModeForced || visibleSelectedActionIds.size > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setIsSelectionModeForced(true);
                    } else {
                      handleClearSelection();
                    }
                  }}
                  className="flex items-center gap-2 cursor-pointer text-xs"
                >
                  <CheckSquare
                    className={cn(
                      "size-3.5 mr-1",
                      isSelectionModeForced || visibleSelectedActionIds.size > 0
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                  <span>Selection Mode</span>
                </DropdownMenuCheckboxItem>
              )}
              <DropdownMenuCheckboxItem
                checked={settings.show_completed}
                onCheckedChange={(checked) => updateSetting("show_completed", checked)}
                className="flex items-center gap-2 cursor-pointer text-xs"
              >
                <CheckCircle2Icon
                  className={cn(
                    "size-3.5 mr-1",
                    settings.show_completed ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>Show Completed</span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={settings.show_abandoned}
                onCheckedChange={(checked) => updateSetting("show_abandoned", checked)}
                className="flex items-center gap-2 cursor-pointer text-xs"
              >
                <Trash2Icon
                  className={cn(
                    "size-3.5 mr-1",
                    settings.show_abandoned ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>Show Abandoned</span>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    });

    return () => setHeaderActions(undefined);
  }, [
    setTitle,
    setSubtitle,
    setHeaderActions,
    actionToEdit,
    isDialogOpen,
    isTodayLocked,
    todayStr,
    selectedDate,
    dialogPreDate,
    startDate,
    settings.show_completed,
    settings.show_abandoned,
    updateSetting,
    settings.enable_selection,
    isSelectionModeForced,
    visibleSelectedActionIds.size,
    handleClearSelection,
  ]);

  const handleBulkComplete = async () => {
    const idsToComplete = Array.from(visibleSelectedActionIds);
    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

    if (settings.enable_undo_toast) {
      toast.success(`Completed ${idsToComplete.length} actions`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const revertedQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
            previousQueries.forEach(([queryKey, data]) => {
              queryClient.setQueryData(queryKey, data);
            });
            activeWritesRef.current++;
            await queryClient.cancelQueries({ queryKey: ["actions"] });
            try {
              await bulkStatusUpdateActions(
                selectedActions.map((sa) => ({
                  id: sa.id,
                  status: sa.status,
                }))
              );
              toast.success("Reverted status changes");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to revert status changes");
            } finally {
              activeWritesRef.current--;
              if (activeWritesRef.current === 0) {
                queryClient.invalidateQueries({ queryKey: ["actions"] });
              }
            }
          },
        },
      });
    }

    updateActionsQueriesCache(idsToComplete, ACTION_STATUS.COMPLETED);
    setSelectedActionIds(new Set());

    activeWritesRef.current++;
    await queryClient.cancelQueries({ queryKey: ["actions"] });
    try {
      await bulkCompleteActions(idsToComplete);
    } catch (error) {
      console.error("Failed to bulk complete actions:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to bulk complete actions");
    } finally {
      activeWritesRef.current--;
      if (activeWritesRef.current === 0) {
        queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    }
  };

  const handleBulkReactivate = async () => {
    const idsToReactivate = Array.from(visibleSelectedActionIds);
    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

    if (settings.enable_undo_toast) {
      toast.success(`Reactivated ${idsToReactivate.length} actions`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const revertedQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
            previousQueries.forEach(([queryKey, data]) => {
              queryClient.setQueryData(queryKey, data);
            });
            activeWritesRef.current++;
            await queryClient.cancelQueries({ queryKey: ["actions"] });
            try {
              await bulkStatusUpdateActions(
                selectedActions.map((sa) => ({
                  id: sa.id,
                  status: sa.status,
                }))
              );
              toast.success("Reverted status changes");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to revert status changes");
            } finally {
              activeWritesRef.current--;
              if (activeWritesRef.current === 0) {
                queryClient.invalidateQueries({ queryKey: ["actions"] });
              }
            }
          },
        },
      });
    }

    updateActionsQueriesCache(idsToReactivate, ACTION_STATUS.ACTIVE);
    setSelectedActionIds(new Set());

    activeWritesRef.current++;
    await queryClient.cancelQueries({ queryKey: ["actions"] });
    try {
      await bulkActivateActions(idsToReactivate);
    } catch (error) {
      console.error("Failed to bulk reactivate actions:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to bulk reactivate actions");
    } finally {
      activeWritesRef.current--;
      if (activeWritesRef.current === 0) {
        queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    }
  };

  const handleBulkAbandon = async () => {
    const idsToAbandon = Array.from(visibleSelectedActionIds);
    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

    if (settings.enable_undo_toast) {
      toast.success(`Abandoned ${idsToAbandon.length} actions`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const revertedQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
            previousQueries.forEach(([queryKey, data]) => {
              queryClient.setQueryData(queryKey, data);
            });
            activeWritesRef.current++;
            await queryClient.cancelQueries({ queryKey: ["actions"] });
            try {
              await bulkStatusUpdateActions(
                selectedActions.map((sa) => ({
                  id: sa.id,
                  status: sa.status,
                }))
              );
              toast.success("Reverted status changes");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to revert status changes");
            } finally {
              activeWritesRef.current--;
              if (activeWritesRef.current === 0) {
                queryClient.invalidateQueries({ queryKey: ["actions"] });
              }
            }
          },
        },
      });
    }

    updateActionsQueriesCache(idsToAbandon, ACTION_STATUS.ABANDONED);
    setSelectedActionIds(new Set());

    activeWritesRef.current++;
    await queryClient.cancelQueries({ queryKey: ["actions"] });
    try {
      await bulkAbandonActions(idsToAbandon);
    } catch (error) {
      console.error("Failed to bulk abandon actions:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to bulk abandon actions");
    } finally {
      activeWritesRef.current--;
      if (activeWritesRef.current === 0) {
        queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    }
  };

  const handleBulkReschedule = async (newDate: string) => {
    const idsToReschedule = Array.from(visibleSelectedActionIds);
    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

    if (settings.enable_undo_toast) {
      toast.success(`Rescheduled ${idsToReschedule.length} actions`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const revertedQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
            previousQueries.forEach(([queryKey, data]) => {
              queryClient.setQueryData(queryKey, data);
            });
            activeWritesRef.current++;
            await queryClient.cancelQueries({ queryKey: ["actions"] });
            try {
              await bulkUpdateMultipleActions(
                selectedActions.map((sa) => ({
                  id: sa.id,
                  payload: { scheduledDate: sa.scheduledDate, sortOrder: sa.sortOrder },
                }))
              );
              toast.success("Reverted rescheduling");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to revert rescheduling");
            } finally {
              activeWritesRef.current--;
              if (activeWritesRef.current === 0) {
                queryClient.invalidateQueries({ queryKey: ["actions"] });
              }
            }
          },
        },
      });
    }

    // Calculate unique sortOrders preserving relative order
    const actionsOnNewDate = allActions.filter(
      (a) => a.scheduledDate === newDate && a.status === ACTION_STATUS.ACTIVE
    );
    let baseSortOrder = -Date.now();
    if (actionsOnNewDate.length > 0) {
      baseSortOrder = Math.min(...actionsOnNewDate.map((a) => a.sortOrder));
    }

    const sortedRescheduledActions = [...selectedActions].sort((a, b) => b.sortOrder - a.sortOrder);

    // Apply optimistic updates to query cache
    sortedRescheduledActions.forEach((sa, index) => {
      updateActionsQueriesCache(sa.id, ACTION_STATUS.ACTIVE, {
        scheduledDate: newDate,
        sortOrder: baseSortOrder - (index + 1),
      });
    });

    setSelectedActionIds(new Set());

    activeWritesRef.current++;
    await queryClient.cancelQueries({ queryKey: ["actions"] });
    try {
      const updates = sortedRescheduledActions.map((sa, index) => ({
        id: sa.id,
        payload: {
          scheduledDate: newDate,
          sortOrder: baseSortOrder - (index + 1),
        },
      }));
      await bulkUpdateMultipleActions(updates);
    } catch (error) {
      console.error("Failed to bulk reschedule actions:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to bulk reschedule actions");
    } finally {
      activeWritesRef.current--;
      if (activeWritesRef.current === 0) {
        queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    }
  };

  const { overdueActions, daySections } = useMemo(() => {
    const visibleActions = allActions;
    const timelineStartDate = isTodayLocked ? todayStr : selectedDate;

    const sortFn = (a: Action, b: Action) => {
      // Completed and Abandoned items always go to the bottom
      const isACompletedOrAbandoned =
        a.status === ACTION_STATUS.COMPLETED || a.status === ACTION_STATUS.ABANDONED;
      const isBCompletedOrAbandoned =
        b.status === ACTION_STATUS.COMPLETED || b.status === ACTION_STATUS.ABANDONED;

      if (isACompletedOrAbandoned && !isBCompletedOrAbandoned) return 1;
      if (!isACompletedOrAbandoned && isBCompletedOrAbandoned) return -1;

      // Sort strictly by sortOrder descending (larger values at the top)
      return b.sortOrder - a.sortOrder;
    };

    // 1. Compute Overdue (tasks before the current view and before today)
    const overdue = visibleActions
      .filter(
        (a) =>
          a.scheduledDate < todayStr &&
          a.scheduledDate < timelineStartDate &&
          a.status === ACTION_STATUS.ACTIVE
      )
      .sort(sortFn);

    const sections = [];

    if (isTodayLocked) {
      // Locked mode: Only show TODAY
      const actionsForDay = visibleActions.filter((a) => a.scheduledDate === todayStr).sort(sortFn);

      sections.push({
        id: todayStr,
        title: `${formatShortDate(parseDateString(todayStr))} ‧ Today ‧ ${formatFullWeekday(parseDateString(todayStr))}`,
        date: todayStr,
        actions: actionsForDay,
      });
    } else {
      // Extended mode: Compute sections starting from selectedDate
      const baseDate = parseDateString(selectedDate);

      for (let i = 0; i < TIME.TIMELINE_DAYS; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        const dateStr = formatDate(d);

        const actionsForDay = visibleActions
          .filter((a) => a.scheduledDate === dateStr)
          .sort(sortFn);

        let title = formatShortDate(d);
        const isToday = dateStr === todayStr;
        const isTomorrow = dateStr === getNextDayString(todayStr);

        if (isToday) title += " ‧ Today";
        else if (isTomorrow) title += " ‧ Tomorrow";

        title += ` ‧ ${formatFullWeekday(d)}`;

        sections.push({
          id: dateStr,
          title,
          date: dateStr,
          actions: actionsForDay,
        });
      }
    }

    return { overdueActions: overdue, daySections: sections };
  }, [allActions, selectedDate, isTodayLocked, todayStr]);

  const handleMoveAction = async (action: Action, direction: "up" | "down") => {
    // 1. Get all active actions for the same day, sorted descending by sortOrder
    const actionsInDay = allActions
      .filter((a) => a.scheduledDate === action.scheduledDate && a.status === ACTION_STATUS.ACTIVE)
      .sort((a, b) => b.sortOrder - a.sortOrder);

    const idx = actionsInDay.findIndex((a) => a.id === action.id);
    if (idx === -1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= actionsInDay.length) return;

    const targetAction = actionsInDay[targetIdx];

    // Swap sortOrder
    const currentOrder = action.sortOrder;
    const targetOrder = targetAction.sortOrder;

    // Handle identical sortOrders (e.g. if both have default timestamp) to ensure strict order difference
    let finalCurrentOrder = targetOrder;
    let finalTargetOrder = currentOrder;
    if (currentOrder === targetOrder) {
      if (direction === "up") {
        finalCurrentOrder = currentOrder + 1;
        finalTargetOrder = currentOrder - 1;
      } else {
        finalCurrentOrder = currentOrder - 1;
        finalTargetOrder = currentOrder + 1;
      }
    }

    // --- Optimistic Update ---
    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

    queryClient.setQueriesData<Action[]>({ queryKey: ["actions"] }, (oldData) => {
      if (!oldData) return [];
      return oldData.map((a) => {
        if (a.id === action.id) {
          return { ...a, sortOrder: finalCurrentOrder };
        }
        if (a.id === targetAction.id) {
          return { ...a, sortOrder: finalTargetOrder };
        }
        return a;
      });
    });

    activeWritesRef.current++;
    await queryClient.cancelQueries({ queryKey: ["actions"] });
    try {
      await bulkUpdateMultipleActions([
        { id: action.id, payload: { sortOrder: finalCurrentOrder } },
        { id: targetAction.id, payload: { sortOrder: finalTargetOrder } },
      ]);
    } catch (error) {
      console.error(`Failed to move action ${direction}:`, error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(`Failed to move action ${direction}`);
    } finally {
      activeWritesRef.current--;
      if (activeWritesRef.current === 0) {
        queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    }
  };

  const handleMoveActionToPosition = async (action: Action, targetIndex: number) => {
    // 1. Get all active actions for the same day, sorted descending by sortOrder
    const actionsInDay = allActions
      .filter((a) => a.scheduledDate === action.scheduledDate && a.status === ACTION_STATUS.ACTIVE)
      .sort((a, b) => b.sortOrder - a.sortOrder);

    const remaining = actionsInDay.filter((a) => a.id !== action.id);
    let finalSortOrder = 0;

    if (remaining.length === 0) {
      finalSortOrder = action.sortOrder;
    } else if (targetIndex <= 1) {
      finalSortOrder = remaining[0].sortOrder + 1;
    } else if (targetIndex > remaining.length) {
      finalSortOrder = remaining[remaining.length - 1].sortOrder - 1;
    } else {
      const prevAction = remaining[targetIndex - 2];
      const nextAction = remaining[targetIndex - 1];
      if (prevAction.sortOrder === nextAction.sortOrder) {
        finalSortOrder = prevAction.sortOrder - 0.5;
      } else {
        finalSortOrder = (prevAction.sortOrder + nextAction.sortOrder) / 2;
      }
    }

    // --- Optimistic Update ---
    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

    queryClient.setQueriesData<Action[]>({ queryKey: ["actions"] }, (oldData) => {
      if (!oldData) return [];
      return oldData.map((a) => {
        if (a.id === action.id) {
          return { ...a, sortOrder: finalSortOrder };
        }
        return a;
      });
    });

    activeWritesRef.current++;
    await queryClient.cancelQueries({ queryKey: ["actions"] });
    try {
      await updateAction(action.id, { sortOrder: finalSortOrder });
    } catch (error) {
      console.error(`Failed to move action to position:`, error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(`Failed to move action to position`);
    } finally {
      activeWritesRef.current--;
      if (activeWritesRef.current === 0) {
        queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    }
  };

  const handleQuickReschedule = async (action: Action) => {
    const isOverdue = action.scheduledDate < todayStr;
    let newDate = todayStr;
    if (!isOverdue) {
      const current = parseDateString(action.scheduledDate);
      current.setDate(current.getDate() + 1);
      newDate = formatDate(current);
    }

    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

    // Calculate new sortOrder for the bottom of the new date
    const actionsOnNewDate = allActions.filter(
      (a) => a.scheduledDate === newDate && a.status === ACTION_STATUS.ACTIVE
    );
    const finalSortOrder =
      actionsOnNewDate.length > 0
        ? Math.min(...actionsOnNewDate.map((a) => a.sortOrder)) - 1
        : -Date.now();

    if (settings.enable_undo_toast) {
      toast.success(`Rescheduled "${action.title}" to ${isOverdue ? "Today" : "Tomorrow"}`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const revertedQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
            previousQueries.forEach(([queryKey, data]) => {
              queryClient.setQueryData(queryKey, data);
            });
            activeWritesRef.current++;
            await queryClient.cancelQueries({ queryKey: ["actions"] });
            try {
              await updateAction(action.id, {
                scheduledDate: action.scheduledDate,
                sortOrder: action.sortOrder,
              });
              toast.success("Reverted rescheduling");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to revert rescheduling");
            } finally {
              activeWritesRef.current--;
              if (activeWritesRef.current === 0) {
                queryClient.invalidateQueries({ queryKey: ["actions"] });
              }
            }
          },
        },
      });
    }

    // Optimistic update
    updateActionsQueriesCache(action.id, ACTION_STATUS.ACTIVE, {
      scheduledDate: newDate,
      sortOrder: finalSortOrder,
    });

    activeWritesRef.current++;
    await queryClient.cancelQueries({ queryKey: ["actions"] });
    try {
      await updateAction(action.id, {
        scheduledDate: newDate,
        sortOrder: finalSortOrder,
      });
    } catch (error) {
      console.error("Failed to quick reschedule action:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to reschedule action");
    } finally {
      activeWritesRef.current--;
      if (activeWritesRef.current === 0) {
        queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    }
  };

  if (dbError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-destructive/20 rounded-3xl bg-destructive/5 gap-4">
        <div className="text-destructive font-bold">Database Error</div>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {dbError.message || "Failed to initialize the local database engine."}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry Initialization
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-0 mt-2">
      {!isTodayLocked && (
        <TimelineCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
      )}
      {overdueActions.length > 0 && !isTodayLocked && selectedDate <= todayStr && (
        <ActionSection
          id="overdue"
          sectionTitle="Overdue"
          actions={overdueActions}
          isTodayLocked={isTodayLocked}
          onComplete={handleComplete}
          onAbandon={handleAbandon}
          onEdit={handleEdit}
          onReactivate={handleReactivate}
          onDeletePermanently={handleDeletePermanently}
          sectionDate={todayStr}
          defaultExpanded={settings.show_overdue}
          selectedActionIds={visibleSelectedActionIds}
          onSelectToggle={handleSelectToggle}
          isBulkModeActive={isBulkModeActive}
          onMoveUp={(action) => handleMoveAction(action, "up")}
          onMoveDown={(action) => handleMoveAction(action, "down")}
          onMoveToPosition={handleMoveActionToPosition}
          onQuickReschedule={handleQuickReschedule}
        />
      )}

      {/* Daily Sections */}
      <AnimatePresence mode="wait">
        {!isDbReady ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            <ActionSectionSkeleton />
            <ActionSectionSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            {daySections.map((section) => (
              <ActionSection
                key={section.id}
                id={`date-${section.id}`}
                sectionTitle={section.title}
                actions={section.actions}
                isTodayLocked={isTodayLocked}
                onComplete={handleComplete}
                onAbandon={handleAbandon}
                onEdit={handleEdit}
                onReactivate={handleReactivate}
                onDeletePermanently={handleDeletePermanently}
                sectionDate={section.date}
                selectedActionIds={visibleSelectedActionIds}
                onSelectToggle={handleSelectToggle}
                isBulkModeActive={isBulkModeActive}
                onMoveUp={(action) => handleMoveAction(action, "up")}
                onMoveDown={(action) => handleMoveAction(action, "down")}
                onMoveToPosition={handleMoveActionToPosition}
                onQuickReschedule={handleQuickReschedule}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-24 md:h-8" />

      {/* Status Alert */}
      {!isDbReady && (
        <div className="fixed bottom-24 right-8 z-50 md:bottom-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 px-4 py-2 border border-primary/20 bg-background/80 backdrop-blur-md rounded-2xl shadow-2xl">
            <Loader2Icon className="size-4 text-primary animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/80">
              Synchronizing
            </span>
          </div>
        </div>
      )}

      {/* Floating Glassmorphic Bulk Actions Bar */}
      <AnimatePresence>
        {isBulkModeActive && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-4 px-3 py-2 sm:px-5 sm:py-3 border border-border/40 bg-background/70 backdrop-blur-xl rounded-full shadow-2xl max-w-[95vw] md:max-w-none"
          >
            <div className="flex items-center gap-1.5 border-r border-border/20 pr-2 sm:pr-4 shrink-0">
              <span className="flex items-center justify-center size-5 bg-primary text-primary-foreground font-black text-[10px] rounded-full">
                {visibleSelectedActionIds.size}
              </span>
              <span className="text-xs font-black tracking-wider uppercase text-muted-foreground hidden sm:inline">
                Selected
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {areAllSelectedCompleted ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkReactivate}
                  disabled={visibleSelectedActionIds.size === 0}
                  className="h-8 text-xs font-bold hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/20 text-muted-foreground gap-1.5 rounded-full px-2 sm:px-3 transition-all border-none disabled:opacity-40"
                  title="Reactivate selected"
                >
                  <RotateCcw className="size-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Reactivate</span>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkComplete}
                  disabled={visibleSelectedActionIds.size === 0}
                  className="h-8 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20 text-muted-foreground gap-1.5 rounded-full px-2 sm:px-3 transition-all border-none disabled:opacity-40"
                  title="Complete selected"
                >
                  <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">Complete</span>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={visibleSelectedActionIds.size === 0}
                    className="h-8 text-xs font-bold hover:bg-primary/10 hover:text-primary text-muted-foreground gap-1.5 rounded-full px-2 sm:px-3 transition-all border-none disabled:opacity-40"
                    title="Reschedule selected"
                  >
                    <CalendarIcon className="size-3.5" />
                    <span className="hidden sm:inline">Reschedule</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  className="bg-background/90 backdrop-blur-md border border-border/20 shadow-2xl p-1 rounded-2xl w-44 animate-in fade-in zoom-in-95 duration-200 ring-0"
                >
                  <DropdownMenuItem
                    onClick={() => handleBulkReschedule(todayStr)}
                    className="flex items-center gap-2 px-2 py-1.5 text-[12.5px] font-semibold hover:bg-muted/50 rounded-md transition-colors cursor-pointer border-none"
                  >
                    Today
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBulkReschedule(getNextDayString(todayStr))}
                    className="flex items-center gap-2 px-2 py-1.5 text-[12.5px] font-semibold hover:bg-muted/50 rounded-md transition-colors cursor-pointer border-none"
                  >
                    Tomorrow
                  </DropdownMenuItem>
                  <div className="px-2 py-1.5 flex flex-col gap-1 border-t border-border/10">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/50 tracking-wider">
                      Pick custom date
                    </span>
                    <Input
                      type="date"
                      className="h-7 text-xs border border-border/20 px-1 py-0.5 rounded-lg bg-transparent focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 text-foreground"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkReschedule(e.target.value);
                        }
                      }}
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkAbandon}
                disabled={visibleSelectedActionIds.size === 0}
                className="h-8 text-xs font-bold hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 text-muted-foreground gap-1.5 rounded-full px-2 sm:px-3 transition-all border-none disabled:opacity-40"
                title="Abandon selected"
              >
                <Trash2Icon className="size-3.5" />
                <span className="hidden sm:inline">Abandon</span>
              </Button>
            </div>

            <div className="border-l border-border/20 pl-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="h-7 text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-full px-2 sm:px-2.5 transition-all border-none"
                title="Clear selection"
              >
                <X className="size-3.5 sm:hidden" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDialogOpen && (
          <DragResizeWrapper
            mode={editorMode}
            onModeChange={(newMode) => {
              setEditorMode(newMode);
              setIsDocked(newMode === "docked");
            }}
            onClose={() => {
              setIsDialogOpen(false);
              setActionToEdit(null);
              setIsDocked(false);
            }}
          >
            {actionToEdit ? (
              <ActionDetailView
                action={actionToEdit}
                onClose={() => {
                  setIsDialogOpen(false);
                  setActionToEdit(null);
                  setIsDocked(false);
                }}
                onComplete={handleComplete}
                onAbandon={handleAbandon}
                onReactivate={handleReactivate}
                onDeletePermanently={handleDeletePermanently}
              />
            ) : (
              <ActionInput
                onSuccess={() => {
                  setIsDialogOpen(false);
                  setActionToEdit(null);
                  setIsDocked(false);
                }}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setActionToEdit(null);
                  setIsDocked(false);
                }}
                initialDate={dialogPreDate || undefined}
              />
            )}
          </DragResizeWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}
