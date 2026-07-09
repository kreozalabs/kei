import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActions } from "@/db/actions";
import { ACTION_STATUS } from "@kreozalabs/kei-core";

interface UseDashboardQueriesProps {
  isDbReady: boolean;
  startDate: string;
  endDate: string;
  showCompleted: boolean;
  showAbandoned: boolean;
}

export function useDashboardQueries({
  isDbReady,
  startDate,
  endDate,
  showCompleted,
  showAbandoned,
}: UseDashboardQueriesProps) {
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
    enabled: isDbReady && showCompleted,
  });

  const { data: abandonedActions = [] } = useQuery({
    queryKey: ["actions", { status: ACTION_STATUS.ABANDONED, startDate, endDate }],
    queryFn: () =>
      getActions({
        status: [ACTION_STATUS.ABANDONED],
        startDate,
        endDate,
      }),
    enabled: isDbReady && showAbandoned,
  });

  const allActions = useMemo(() => {
    const list = [...activeActions];
    if (showCompleted) {
      list.push(...completedActions);
    }
    if (showAbandoned) {
      list.push(...abandonedActions);
    }
    return list;
  }, [activeActions, completedActions, abandonedActions, showCompleted, showAbandoned]);

  return {
    activeActions,
    completedActions,
    abandonedActions,
    allActions,
  };
}
