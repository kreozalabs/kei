import { type RefObject, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@kreozalabs/ui";
import { type Action, ACTION_STATUS, type ActionStatus } from "@kreozalabs/core";
import {
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

export interface UseActionMutationsProps {
  allActions: Action[];
  enableUndoToast: boolean;
  activeWritesRef: RefObject<number>;
  selectedActions: Action[];
  visibleSelectedActionIds: Set<string>;
  setSelectedActionIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
}

export function useActionMutations({
  allActions,
  enableUndoToast,
  activeWritesRef,
  selectedActions,
  visibleSelectedActionIds,
  setSelectedActionIds,
}: UseActionMutationsProps) {
  const queryClient = useQueryClient();

  const updateActionsQueriesCache = useCallback(
    (
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
              nextData = nextData.filter((a) => !idSet.has(a.id));
            }

            return nextData;
          }

          return oldData.map((a) =>
            idSet.has(a.id) ? { ...a, ...updatedActionData, status: nextStatus } : a
          );
        });
      });
    },
    [queryClient, allActions]
  );

  const handleComplete = useCallback(
    async (action: Action) => {
      const isCompleted = action.status === ACTION_STATUS.COMPLETED;
      const nextStatus = isCompleted ? ACTION_STATUS.ACTIVE : ACTION_STATUS.COMPLETED;
      const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

      if (enableUndoToast) {
        toast.success(
          isCompleted ? `"${action.title}" reactivated` : `"${action.title}" completed`,
          {
            action: {
              label: "Undo",
              onClick: async () => {
                const revertedQueries = queryClient.getQueriesData<Action[]>({
                  queryKey: ["actions"],
                });
                previousQueries.forEach(([queryKey, data]) =>
                  queryClient.setQueryData(queryKey, data)
                );
                activeWritesRef.current++;
                await queryClient.cancelQueries({ queryKey: ["actions"] });
                try {
                  if (isCompleted) await completeAction(action.id);
                  else await activateAction(action.id);
                  toast.success("Reverted status change");
                } catch (err) {
                  console.error(err);
                  revertedQueries.forEach(([queryKey, data]) =>
                    queryClient.setQueryData(queryKey, data)
                  );
                  toast.error("Failed to revert status change");
                } finally {
                  activeWritesRef.current--;
                  if (activeWritesRef.current === 0)
                    queryClient.invalidateQueries({ queryKey: ["actions"] });
                }
              },
            },
          }
        );
      }

      updateActionsQueriesCache(action.id, nextStatus);
      activeWritesRef.current++;
      await queryClient.cancelQueries({ queryKey: ["actions"] });
      try {
        if (isCompleted) await activateAction(action.id);
        else await completeAction(action.id);
      } catch (error) {
        console.error("Failed to complete action:", error);
        previousQueries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
        toast.error("Failed to complete action");
      } finally {
        activeWritesRef.current--;
        if (activeWritesRef.current === 0) queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    },
    [enableUndoToast, queryClient, activeWritesRef, updateActionsQueriesCache]
  );

  const handleAbandon = useCallback(
    async (action: Action) => {
      const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

      if (enableUndoToast) {
        toast.success(`"${action.title}" abandoned`, {
          action: {
            label: "Undo",
            onClick: async () => {
              const revertedQueries = queryClient.getQueriesData<Action[]>({
                queryKey: ["actions"],
              });
              previousQueries.forEach(([queryKey, data]) =>
                queryClient.setQueryData(queryKey, data)
              );
              activeWritesRef.current++;
              await queryClient.cancelQueries({ queryKey: ["actions"] });
              try {
                await activateAction(action.id);
                toast.success("Action reactivated");
              } catch (err) {
                console.error(err);
                revertedQueries.forEach(([queryKey, data]) =>
                  queryClient.setQueryData(queryKey, data)
                );
                toast.error("Failed to reactivate action");
              } finally {
                activeWritesRef.current--;
                if (activeWritesRef.current === 0)
                  queryClient.invalidateQueries({ queryKey: ["actions"] });
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
        previousQueries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
        toast.error("Failed to abandon action");
      } finally {
        activeWritesRef.current--;
        if (activeWritesRef.current === 0) queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    },
    [enableUndoToast, queryClient, activeWritesRef, updateActionsQueriesCache]
  );

  const handleReactivate = useCallback(
    async (action: Action) => {
      const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

      if (enableUndoToast) {
        toast.success(`"${action.title}" reactivated`, {
          action: {
            label: "Undo",
            onClick: async () => {
              const revertedQueries = queryClient.getQueriesData<Action[]>({
                queryKey: ["actions"],
              });
              previousQueries.forEach(([queryKey, data]) =>
                queryClient.setQueryData(queryKey, data)
              );
              activeWritesRef.current++;
              await queryClient.cancelQueries({ queryKey: ["actions"] });
              try {
                await abandonAction(action.id);
                toast.success("Action abandoned");
              } catch (err) {
                console.error(err);
                revertedQueries.forEach(([queryKey, data]) =>
                  queryClient.setQueryData(queryKey, data)
                );
                toast.error("Failed to abandon action");
              } finally {
                activeWritesRef.current--;
                if (activeWritesRef.current === 0)
                  queryClient.invalidateQueries({ queryKey: ["actions"] });
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
        previousQueries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
        toast.error("Failed to reactivate action");
      } finally {
        activeWritesRef.current--;
        if (activeWritesRef.current === 0) queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    },
    [enableUndoToast, queryClient, activeWritesRef, updateActionsQueriesCache]
  );

  const handleDeletePermanently = useCallback(
    async (action: Action) => {
      const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

      if (enableUndoToast) {
        toast.success(`"${action.title}" deleted permanently`, {
          action: {
            label: "Undo",
            onClick: async () => {
              const revertedQueries = queryClient.getQueriesData<Action[]>({
                queryKey: ["actions"],
              });
              previousQueries.forEach(([queryKey, data]) =>
                queryClient.setQueryData(queryKey, data)
              );
              activeWritesRef.current++;
              await queryClient.cancelQueries({ queryKey: ["actions"] });
              try {
                await restoreAction(action);
                toast.success("Action restored");
              } catch (err) {
                console.error(err);
                revertedQueries.forEach(([queryKey, data]) =>
                  queryClient.setQueryData(queryKey, data)
                );
                toast.error("Failed to restore action");
              } finally {
                activeWritesRef.current--;
                if (activeWritesRef.current === 0)
                  queryClient.invalidateQueries({ queryKey: ["actions"] });
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
        previousQueries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
        toast.error("Failed to delete action");
      } finally {
        activeWritesRef.current--;
        if (activeWritesRef.current === 0) queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    },
    [enableUndoToast, queryClient, activeWritesRef]
  );

  const handleBulkComplete = useCallback(async () => {
    const idsToComplete = Array.from(visibleSelectedActionIds);
    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

    if (enableUndoToast) {
      toast.success(`Completed ${idsToComplete.length} actions`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const revertedQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
            previousQueries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
            activeWritesRef.current++;
            await queryClient.cancelQueries({ queryKey: ["actions"] });
            try {
              await bulkStatusUpdateActions(
                selectedActions.map((sa) => ({ id: sa.id, status: sa.status }))
              );
              toast.success("Reverted status changes");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) =>
                queryClient.setQueryData(queryKey, data)
              );
              toast.error("Failed to revert status changes");
            } finally {
              activeWritesRef.current--;
              if (activeWritesRef.current === 0)
                queryClient.invalidateQueries({ queryKey: ["actions"] });
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
      previousQueries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      toast.error("Failed to bulk complete actions");
    } finally {
      activeWritesRef.current--;
      if (activeWritesRef.current === 0) queryClient.invalidateQueries({ queryKey: ["actions"] });
    }
  }, [
    visibleSelectedActionIds,
    enableUndoToast,
    queryClient,
    activeWritesRef,
    selectedActions,
    updateActionsQueriesCache,
    setSelectedActionIds,
  ]);

  const handleBulkReactivate = useCallback(async () => {
    const idsToReactivate = Array.from(visibleSelectedActionIds);
    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

    if (enableUndoToast) {
      toast.success(`Reactivated ${idsToReactivate.length} actions`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const revertedQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
            previousQueries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
            activeWritesRef.current++;
            await queryClient.cancelQueries({ queryKey: ["actions"] });
            try {
              await bulkStatusUpdateActions(
                selectedActions.map((sa) => ({ id: sa.id, status: sa.status }))
              );
              toast.success("Reverted status changes");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) =>
                queryClient.setQueryData(queryKey, data)
              );
              toast.error("Failed to revert status changes");
            } finally {
              activeWritesRef.current--;
              if (activeWritesRef.current === 0)
                queryClient.invalidateQueries({ queryKey: ["actions"] });
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
      previousQueries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      toast.error("Failed to bulk reactivate actions");
    } finally {
      activeWritesRef.current--;
      if (activeWritesRef.current === 0) queryClient.invalidateQueries({ queryKey: ["actions"] });
    }
  }, [
    visibleSelectedActionIds,
    enableUndoToast,
    queryClient,
    activeWritesRef,
    selectedActions,
    updateActionsQueriesCache,
    setSelectedActionIds,
  ]);

  const handleBulkAbandon = useCallback(async () => {
    const idsToAbandon = Array.from(visibleSelectedActionIds);
    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

    if (enableUndoToast) {
      toast.success(`Abandoned ${idsToAbandon.length} actions`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const revertedQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
            previousQueries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
            activeWritesRef.current++;
            await queryClient.cancelQueries({ queryKey: ["actions"] });
            try {
              await bulkStatusUpdateActions(
                selectedActions.map((sa) => ({ id: sa.id, status: sa.status }))
              );
              toast.success("Reverted status changes");
            } catch (err) {
              console.error(err);
              revertedQueries.forEach(([queryKey, data]) =>
                queryClient.setQueryData(queryKey, data)
              );
              toast.error("Failed to revert status changes");
            } finally {
              activeWritesRef.current--;
              if (activeWritesRef.current === 0)
                queryClient.invalidateQueries({ queryKey: ["actions"] });
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
      previousQueries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      toast.error("Failed to bulk abandon actions");
    } finally {
      activeWritesRef.current--;
      if (activeWritesRef.current === 0) queryClient.invalidateQueries({ queryKey: ["actions"] });
    }
  }, [
    visibleSelectedActionIds,
    enableUndoToast,
    queryClient,
    activeWritesRef,
    selectedActions,
    updateActionsQueriesCache,
    setSelectedActionIds,
  ]);

  const handleBulkReschedule = useCallback(
    async (newDate: string) => {
      const idsToReschedule = Array.from(visibleSelectedActionIds);
      const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

      if (enableUndoToast) {
        toast.success(`Rescheduled ${idsToReschedule.length} actions`, {
          action: {
            label: "Undo",
            onClick: async () => {
              const revertedQueries = queryClient.getQueriesData<Action[]>({
                queryKey: ["actions"],
              });
              previousQueries.forEach(([queryKey, data]) =>
                queryClient.setQueryData(queryKey, data)
              );
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
                revertedQueries.forEach(([queryKey, data]) =>
                  queryClient.setQueryData(queryKey, data)
                );
                toast.error("Failed to revert rescheduling");
              } finally {
                activeWritesRef.current--;
                if (activeWritesRef.current === 0)
                  queryClient.invalidateQueries({ queryKey: ["actions"] });
              }
            },
          },
        });
      }

      const actionsOnNewDate = allActions.filter(
        (a) => a.scheduledDate === newDate && a.status === ACTION_STATUS.ACTIVE
      );
      let baseSortOrder = -Date.now();
      if (actionsOnNewDate.length > 0) {
        baseSortOrder = Math.min(...actionsOnNewDate.map((a) => a.sortOrder));
      }

      const sortedRescheduledActions = [...selectedActions].sort(
        (a, b) => b.sortOrder - a.sortOrder
      );

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
        previousQueries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
        toast.error("Failed to bulk reschedule actions");
      } finally {
        activeWritesRef.current--;
        if (activeWritesRef.current === 0) queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    },
    [
      visibleSelectedActionIds,
      enableUndoToast,
      queryClient,
      activeWritesRef,
      selectedActions,
      allActions,
      updateActionsQueriesCache,
      setSelectedActionIds,
    ]
  );

  const handleMoveAction = useCallback(
    async (action: Action, direction: "up" | "down") => {
      const actionsInDay = allActions
        .filter(
          (a) => a.scheduledDate === action.scheduledDate && a.status === ACTION_STATUS.ACTIVE
        )
        .sort((a, b) => b.sortOrder - a.sortOrder);

      const idx = actionsInDay.findIndex((a) => a.id === action.id);
      if (idx === -1) return;

      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= actionsInDay.length) return;

      const targetAction = actionsInDay[targetIdx];

      const currentOrder = action.sortOrder;
      const targetOrder = targetAction.sortOrder;

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

      const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

      queryClient.setQueriesData<Action[]>({ queryKey: ["actions"] }, (oldData) => {
        if (!oldData) return [];
        return oldData.map((a) => {
          if (a.id === action.id) return { ...a, sortOrder: finalCurrentOrder };
          if (a.id === targetAction.id) return { ...a, sortOrder: finalTargetOrder };
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
        previousQueries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
        toast.error(`Failed to move action ${direction}`);
      } finally {
        activeWritesRef.current--;
        if (activeWritesRef.current === 0) queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    },
    [allActions, queryClient, activeWritesRef]
  );

  const handleMoveActionToPosition = useCallback(
    async (action: Action, targetIndex: number) => {
      const actionsInDay = allActions
        .filter(
          (a) => a.scheduledDate === action.scheduledDate && a.status === ACTION_STATUS.ACTIVE
        )
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

      const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

      queryClient.setQueriesData<Action[]>({ queryKey: ["actions"] }, (oldData) => {
        if (!oldData) return [];
        return oldData.map((a) => {
          if (a.id === action.id) return { ...a, sortOrder: finalSortOrder };
          return a;
        });
      });

      activeWritesRef.current++;
      await queryClient.cancelQueries({ queryKey: ["actions"] });
      try {
        await updateAction(action.id, { sortOrder: finalSortOrder });
      } catch (error) {
        console.error(`Failed to move action to position:`, error);
        previousQueries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
        toast.error(`Failed to move action to position`);
      } finally {
        activeWritesRef.current--;
        if (activeWritesRef.current === 0) queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    },
    [allActions, queryClient, activeWritesRef]
  );

  const handleQuickReschedule = useCallback(
    async (action: Action, todayStr: string, getNextDayString: (d: string) => string) => {
      const isOverdue = action.scheduledDate < todayStr;
      let newDate = todayStr;
      if (!isOverdue) {
        newDate = getNextDayString(action.scheduledDate);
      }

      const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });

      const actionsOnNewDate = allActions.filter(
        (a) => a.scheduledDate === newDate && a.status === ACTION_STATUS.ACTIVE
      );
      const finalSortOrder =
        actionsOnNewDate.length > 0
          ? Math.min(...actionsOnNewDate.map((a) => a.sortOrder)) - 1
          : -Date.now();

      if (enableUndoToast) {
        toast.success(`Rescheduled "${action.title}" to ${isOverdue ? "Today" : "Tomorrow"}`, {
          action: {
            label: "Undo",
            onClick: async () => {
              const revertedQueries = queryClient.getQueriesData<Action[]>({
                queryKey: ["actions"],
              });
              previousQueries.forEach(([queryKey, data]) =>
                queryClient.setQueryData(queryKey, data)
              );
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
                revertedQueries.forEach(([queryKey, data]) =>
                  queryClient.setQueryData(queryKey, data)
                );
                toast.error("Failed to revert rescheduling");
              } finally {
                activeWritesRef.current--;
                if (activeWritesRef.current === 0)
                  queryClient.invalidateQueries({ queryKey: ["actions"] });
              }
            },
          },
        });
      }

      updateActionsQueriesCache(action.id, ACTION_STATUS.ACTIVE, {
        scheduledDate: newDate,
        sortOrder: finalSortOrder,
      });

      activeWritesRef.current++;
      await queryClient.cancelQueries({ queryKey: ["actions"] });
      try {
        await updateAction(action.id, { scheduledDate: newDate, sortOrder: finalSortOrder });
      } catch (error) {
        console.error("Failed to quick reschedule action:", error);
        previousQueries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
        toast.error("Failed to reschedule action");
      } finally {
        activeWritesRef.current--;
        if (activeWritesRef.current === 0) queryClient.invalidateQueries({ queryKey: ["actions"] });
      }
    },
    [allActions, enableUndoToast, queryClient, activeWritesRef, updateActionsQueriesCache]
  );

  return {
    handleComplete,
    handleAbandon,
    handleReactivate,
    handleDeletePermanently,
    handleBulkComplete,
    handleBulkReactivate,
    handleBulkAbandon,
    handleBulkReschedule,
    handleMoveAction,
    handleMoveActionToPosition,
    handleQuickReschedule,
  };
}
