import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppLayoutContext } from "@/components/layout/AppLayout";
import { HeaderSearch, HeaderNewAction } from "@/components/layout/AppHeader";
import { useDb } from "@/providers/DbContext";
import {
  getActions,
  updateAction,
  completeAction,
  activateAction,
  abandonAction,
  deleteActionPermanently,
  restoreAction,
} from "@/db/actions";
import { toast } from "sonner";
import { useCurrentDay } from "@/hooks/useCurrentDay";
import {
  getTodayString,
  formatDate,
  getNextDayString,
  formatShortDate,
  formatFullWeekday,
  formatTitleDate,
  parseDateString,
} from "@/utils/time";
import {
  Button,
  cn,
  Input,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
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
} from "lucide-react";
import type { Action, ActionStatus } from "@/types/actions";
import { motion, AnimatePresence } from "framer-motion";
import { ActionSection } from "@/components/ActionSection";
import { ActionItem } from "@/components/ActionItem";
import { ActionInputDialog } from "@/components/ActionInputDialog";
import { TimelineCalendar } from "@/components/TimelineCalendar";
import { ActionSectionSkeleton } from "@/components/ActionSkeleton";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { useSettings } from "@/providers/SettingsContext";
import { STORAGE_KEYS, ACTION_STATUS, TIME } from "@/config/constants";

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
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEYS.SESSION.TIMELINE_LOCKED, String(isTodayLocked));
  }, [isTodayLocked]);

  const { setTitle, setSubtitle, setHeaderActions } = useOutletContext<AppLayoutContext>();
  const startDate = isTodayLocked ? todayStr : selectedDate;
  const endDate = useMemo(() => {
    if (isTodayLocked) return todayStr;
    const d = parseDateString(selectedDate);
    d.setDate(d.getDate() + TIME.TIMELINE_DAYS);
    return formatDate(d);
  }, [isTodayLocked, selectedDate, todayStr]);

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
          <ActionInputDialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setDialogPreDate(null);
                setActionToEdit(null);
              }
            }}
            trigger={<HeaderNewAction />}
            initialDate={dialogPreDate}
            selectedDate={selectedDate}
            actionToEdit={actionToEdit ?? undefined}
          />

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
  ]);

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
            // Add any that are not in the list yet
            ids.forEach((id) => {
              const exists = nextData.some((a) => a.id === id);
              if (!exists) {
                const actionToRestore = allActions.find((a) => a.id === id);
                if (actionToRestore) {
                  nextData.unshift({ ...actionToRestore, ...updatedActionData, status: nextStatus });
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
            try {
              if (isCompleted) {
                await completeAction(action.id);
              } else {
                await activateAction(action.id);
              }
              queryClient.invalidateQueries({ queryKey: ["actions"] });
              toast.success("Reverted status change");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to revert status change");
            }
          },
        },
      });
    }

    updateActionsQueriesCache(action.id, nextStatus);

    try {
      if (isCompleted) {
        await activateAction(action.id);
      } else {
        await completeAction(action.id);
      }
      queryClient.invalidateQueries({ queryKey: ["actions"] });
    } catch (error) {
      console.error("Failed to complete action:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to complete action");
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
            try {
              await activateAction(action.id);
              queryClient.invalidateQueries({ queryKey: ["actions"] });
              toast.success("Action reactivated");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to reactivate action");
            }
          },
        },
      });
    }

    updateActionsQueriesCache(action.id, ACTION_STATUS.ABANDONED);

    try {
      await abandonAction(action.id);
      queryClient.invalidateQueries({ queryKey: ["actions"] });
    } catch (error) {
      console.error("Failed to abandon action:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to abandon action");
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
            try {
              await abandonAction(action.id);
              queryClient.invalidateQueries({ queryKey: ["actions"] });
              toast.success("Action abandoned");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to abandon action");
            }
          },
        },
      });
    }

    updateActionsQueriesCache(action.id, ACTION_STATUS.ACTIVE);

    try {
      await activateAction(action.id);
      queryClient.invalidateQueries({ queryKey: ["actions"] });
    } catch (error) {
      console.error("Failed to reactivate action:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to reactivate action");
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
            try {
              await restoreAction(action);
              queryClient.invalidateQueries({ queryKey: ["actions"] });
              toast.success("Action restored");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to restore action");
            }
          },
        },
      });
    }

    queryClient.setQueriesData<Action[]>({ queryKey: ["actions"] }, (oldData) => {
      if (!oldData) return [];
      return oldData.filter((a) => a.id !== action.id);
    });

    try {
      await deleteActionPermanently(action.id);
      queryClient.invalidateQueries({ queryKey: ["actions"] });
    } catch (error) {
      console.error("Failed to delete action permanently:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to delete action");
    }
  };

  const handleEdit = (action: Action) => {
    setActionToEdit(action);
    setIsDialogOpen(true);
  };

  // Multi-select & Bulk actions state
  const [selectedActionIds, setSelectedActionIds] = useState<Set<string>>(new Set());

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

  const isBulkModeActive = visibleSelectedActionIds.size > 0;

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

  const handleClearSelection = () => {
    setSelectedActionIds(new Set());
  };

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
            try {
              await Promise.all(
                selectedActions.map(async (sa) => {
                  if (sa.status === ACTION_STATUS.COMPLETED) {
                    await completeAction(sa.id);
                  } else {
                    await activateAction(sa.id);
                  }
                })
              );
              queryClient.invalidateQueries({ queryKey: ["actions"] });
              toast.success("Reverted status changes");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to revert status changes");
            }
          },
        },
      });
    }

    updateActionsQueriesCache(idsToComplete, ACTION_STATUS.COMPLETED);
    setSelectedActionIds(new Set());

    try {
      await Promise.all(idsToComplete.map((id) => completeAction(id)));
      queryClient.invalidateQueries({ queryKey: ["actions"] });
    } catch (error) {
      console.error("Failed to bulk complete actions:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to bulk complete actions");
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
            try {
              await Promise.all(
                selectedActions.map(async (sa) => {
                  if (sa.status === ACTION_STATUS.COMPLETED) {
                    await completeAction(sa.id);
                  } else if (sa.status === ACTION_STATUS.ABANDONED) {
                    await abandonAction(sa.id);
                  } else {
                    await activateAction(sa.id);
                  }
                })
              );
              queryClient.invalidateQueries({ queryKey: ["actions"] });
              toast.success("Reverted status changes");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to revert status changes");
            }
          },
        },
      });
    }

    updateActionsQueriesCache(idsToReactivate, ACTION_STATUS.ACTIVE);
    setSelectedActionIds(new Set());

    try {
      await Promise.all(idsToReactivate.map((id) => activateAction(id)));
      queryClient.invalidateQueries({ queryKey: ["actions"] });
    } catch (error) {
      console.error("Failed to bulk reactivate actions:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to bulk reactivate actions");
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
            try {
              await Promise.all(
                selectedActions.map(async (sa) => {
                  if (sa.status === ACTION_STATUS.COMPLETED) {
                    await completeAction(sa.id);
                  } else if (sa.status === ACTION_STATUS.ABANDONED) {
                    await abandonAction(sa.id);
                  } else {
                    await activateAction(sa.id);
                  }
                })
              );
              queryClient.invalidateQueries({ queryKey: ["actions"] });
              toast.success("Reverted status changes");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to revert status changes");
            }
          },
        },
      });
    }

    updateActionsQueriesCache(idsToAbandon, ACTION_STATUS.ABANDONED);
    setSelectedActionIds(new Set());

    try {
      await Promise.all(idsToAbandon.map((id) => abandonAction(id)));
      queryClient.invalidateQueries({ queryKey: ["actions"] });
    } catch (error) {
      console.error("Failed to bulk abandon actions:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to bulk abandon actions");
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
            try {
              await Promise.all(
                selectedActions.map((sa) =>
                  updateAction(sa.id, { scheduledDate: sa.scheduledDate })
                )
              );
              queryClient.invalidateQueries({ queryKey: ["actions"] });
              toast.success("Reverted rescheduling");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              toast.error("Failed to revert rescheduling");
            }
          },
        },
      });
    }

    updateActionsQueriesCache(idsToReschedule, ACTION_STATUS.ACTIVE, { scheduledDate: newDate });
    setSelectedActionIds(new Set());

    try {
      await Promise.all(idsToReschedule.map((id) => updateAction(id, { scheduledDate: newDate })));
      queryClient.invalidateQueries({ queryKey: ["actions"] });
    } catch (error) {
      console.error("Failed to bulk reschedule actions:", error);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to bulk reschedule actions");
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

      // For active items, sort by time if both have it
      if (a.startTime && b.startTime) {
        const timeCompare = a.startTime.localeCompare(b.startTime);
        if (timeCompare !== 0) return timeCompare;
      } else if (a.startTime) return -1;
      else if (b.startTime) return 1;

      // Default fallback to sortOrder
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeAction = allActions.find((a) => a.id === activeId);
    if (!activeAction) return;

    // Find target section/group
    let targetDate: string | undefined;

    const overAction = allActions.find((a) => a.id === overId);
    if (overAction) {
      targetDate = overAction.scheduledDate;
    } else {
      const overData = over.data.current;
      if (overData && overData.type === "section" && overData.date) {
        targetDate = overData.date;
      } else if (overId.startsWith("section-")) {
        targetDate = overId.replace("section-", "");
      }
    }

    if (!targetDate) return;

    // If section changed, update UI state optimistically
    const isDifferentSection = activeAction.scheduledDate !== targetDate;

    if (isDifferentSection) {
      queryClient.setQueriesData<Action[]>({ queryKey: ["actions"] }, (oldData) => {
        if (!oldData) return [];
        return oldData.map((a) => (a.id === activeId ? { ...a, scheduledDate: targetDate! } : a));
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeAction = allActions.find((a) => a.id === activeId);
    if (!activeAction) return;

    let targetDate: string | undefined;
    const overAction = allActions.find((a) => a.id === overId);

    if (overAction) {
      targetDate = overAction.scheduledDate;
    } else {
      // Check if we dropped on a section area
      const overData = over.data.current;
      if (overData && overData.type === "section" && overData.date) {
        targetDate = overData.date;
      } else if (overId.startsWith("section-")) {
        targetDate = overId.replace("section-", "");
      }
    }

    if (!targetDate) return;

    // Keep original times, only adoption logic removed to avoid data loss/confusion
    const newStartTime = activeAction.startTime;
    const newEndTime = activeAction.endTime;

    // Calculate new sortOrder
    const actionsInTargetDay = allActions
      .filter(
        (a) =>
          a.scheduledDate === targetDate && a.status === ACTION_STATUS.ACTIVE && a.id !== activeId
      )
      .sort((a, b) => {
        if (a.startTime && b.startTime) {
          const timeCompare = a.startTime.localeCompare(b.startTime);
          if (timeCompare !== 0) return timeCompare;
        } else if (a.startTime) return -1;
        else if (b.startTime) return 1;
        return b.sortOrder - a.sortOrder;
      });

    let newSortOrder: number;

    if (overAction) {
      const overIndex = actionsInTargetDay.findIndex((a) => a.id === overId);

      if (overIndex === 0) {
        // Dropped at the very top
        newSortOrder = actionsInTargetDay[0].sortOrder + 10000;
      } else if (overIndex === -1) {
        // Dropped on an item that somehow isn't in filtered list
        newSortOrder = Date.now();
      } else {
        // Dropped between two items OR at the end
        // If overIndex is last, we still put it "above" the overAction with this logic
        const prevItem = actionsInTargetDay[overIndex - 1];
        const nextItem = actionsInTargetDay[overIndex];
        newSortOrder = (prevItem.sortOrder + nextItem.sortOrder) / 2;
      }
    } else {
      // Dropped on an empty section or section header
      if (actionsInTargetDay.length > 0) {
        // Drop at the top of the section by default when dropping on header
        newSortOrder = actionsInTargetDay[0].sortOrder + 10000;
      } else {
        newSortOrder = Date.now();
      }
    }

    // --- Optimistic Update ---
    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

    queryClient.setQueriesData<Action[]>({ queryKey: ["actions"] }, (oldData) => {
      if (!oldData) return [];
      return oldData.map((a) =>
        a.id === activeId
          ? {
              ...a,
              scheduledDate: targetDate!,
              sortOrder: newSortOrder,
              startTime: newStartTime,
              endTime: newEndTime,
            }
          : a
      );
    });

    try {
      await updateAction(activeId, {
        scheduledDate: targetDate,
        sortOrder: newSortOrder,
        startTime: newStartTime,
        endTime: newEndTime,
      });
      // Optional: invalidate to make sure we are in sync with any other changes
      queryClient.invalidateQueries({ queryKey: ["actions"] });
    } catch (error) {
      console.error("Failed to update action order:", error);
      // Rollback on error
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
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
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-24 md:h-8" />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div className="opacity-80 scale-105 shadow-2xl rounded-xl border-2 border-primary/20 bg-background/50 backdrop-blur-md overflow-hidden pointer-events-none">
            <ActionItem
              action={allActions.find((a) => a.id === activeId)!}
              type={ACTION_STATUS.ACTIVE}
              onComplete={() => {}}
              onAbandon={() => {}}
              onEdit={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>

      {/* Status Alert */}
      {!isDbReady && (
        <div className="fixed bottom-24 right-8 z-50 md:bottom-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 px-4 py-2 border border-primary/20 bg-background/80 backdrop-blur-md rounded-2xl shadow-2xl">
            <Loader2Icon className="size-4 text-primary animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/80">
              Synchronizing Engine
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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-5 py-3 border border-border/40 bg-background/70 backdrop-blur-xl rounded-full shadow-2xl"
          >
            <div className="flex items-center gap-1.5 border-r border-border/20 pr-4 shrink-0">
              <span className="flex items-center justify-center size-5 bg-primary text-primary-foreground font-black text-[10px] rounded-full">
                {visibleSelectedActionIds.size}
              </span>
              <span className="text-xs font-black tracking-wider uppercase text-muted-foreground">
                Selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              {areAllSelectedCompleted ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkReactivate}
                  className="h-8 text-xs font-bold hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/20 text-muted-foreground gap-1.5 rounded-full px-3 transition-all border-none"
                >
                  <RotateCcw className="size-3.5 text-amber-500" />
                  Reactivate
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkComplete}
                  className="h-8 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20 text-muted-foreground gap-1.5 rounded-full px-3 transition-all border-none"
                >
                  <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                  Complete
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-bold hover:bg-primary/10 hover:text-primary text-muted-foreground gap-1.5 rounded-full px-3 transition-all border-none"
                  >
                    <CalendarIcon className="size-3.5" />
                    Reschedule
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
                className="h-8 text-xs font-bold hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 text-muted-foreground gap-1.5 rounded-full px-3 transition-all border-none"
              >
                <Trash2Icon className="size-3.5" />
                Abandon
              </Button>
            </div>

            <div className="border-l border-border/20 pl-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="h-7 text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-full px-2.5 transition-all border-none"
              >
                Clear
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DndContext>
  );
}
