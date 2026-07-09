import { useMemo } from "react";
import { type Action, ACTION_STATUS, TIME } from "@kreozalabs/kei-core";
import {
  formatDate,
  parseDateString,
  formatShortDate,
  formatFullWeekday,
  getNextDayString,
} from "@kreozalabs/kei-core";
import { useSettings } from "@/providers/SettingsContext";
import { useDashboardContext } from "../context/DashboardContext";
import { ActionSection } from "@/components/ActionSection";
import { ActionSectionSkeleton } from "@/components/ActionSkeleton";
import { motion, AnimatePresence } from "framer-motion";

export function DayView() {
  const { settings } = useSettings();
  const {
    allActions,
    selectedDate,
    isTodayLocked,
    todayStr,
    isDbReady,
    visibleSelectedActionIds,
    handleSelectToggle,
    isBulkModeActive,
    mutations: {
      handleComplete,
      handleAbandon,
      handleReactivate,
      handleDeletePermanently,
      handleMoveAction,
      handleMoveActionToPosition,
      handleQuickReschedule,
    },
    setActionToEdit,
    setIsDialogOpen,
  } = useDashboardContext();

  const handleEdit = (action: Action) => {
    setActionToEdit(action);
    setIsDialogOpen(true);
  };

  const { overdueActions, daySections } = useMemo(() => {
    const timelineStartDate = isTodayLocked ? todayStr : selectedDate;

    const sortFn = (a: Action, b: Action) => {
      const isACompletedOrAbandoned =
        a.status === ACTION_STATUS.COMPLETED || a.status === ACTION_STATUS.ABANDONED;
      const isBCompletedOrAbandoned =
        b.status === ACTION_STATUS.COMPLETED || b.status === ACTION_STATUS.ABANDONED;

      if (isACompletedOrAbandoned && !isBCompletedOrAbandoned) return 1;
      if (!isACompletedOrAbandoned && isBCompletedOrAbandoned) return -1;
      return b.sortOrder - a.sortOrder;
    };

    const overdue = allActions
      .filter(
        (a) =>
          a.scheduledDate < todayStr &&
          a.scheduledDate < timelineStartDate &&
          a.status === ACTION_STATUS.ACTIVE
      )
      .sort(sortFn);

    const sections = [];

    if (isTodayLocked) {
      const actionsForDay = allActions.filter((a) => a.scheduledDate === todayStr).sort(sortFn);
      sections.push({
        id: todayStr,
        title: `${formatShortDate(parseDateString(todayStr))} ‧ Today ‧ ${formatFullWeekday(parseDateString(todayStr))}`,
        date: todayStr,
        actions: actionsForDay,
      });
    } else {
      const baseDate = parseDateString(selectedDate);
      for (let i = 0; i < TIME.TIMELINE_DAYS; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        const dateStr = formatDate(d);

        const actionsForDay = allActions.filter((a) => a.scheduledDate === dateStr).sort(sortFn);

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

  return (
    <div className="mx-auto mt-2 max-w-3xl px-2 sm:px-0">
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
          onQuickReschedule={(action) => handleQuickReschedule(action, todayStr, getNextDayString)}
        />
      )}

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
                onQuickReschedule={(action) =>
                  handleQuickReschedule(action, todayStr, getNextDayString)
                }
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-24 md:h-8" />
    </div>
  );
}
