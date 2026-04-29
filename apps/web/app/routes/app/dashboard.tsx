import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppLayoutContext } from "@/components/layout/AppLayout";
import { HeaderSearch, HeaderNewAction } from "@/components/layout/AppHeader";
import { initPromise } from "@/db";
import {
  getActions,
  updateAction,
  completeAction,
  activateAction,
  abandonAction,
} from "@/db/actions";
import { Button } from "@kreozalabs/ui";
import { LockIcon, UnlockIcon, Loader2Icon } from "lucide-react";
import type { Action } from "@/types/events";
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

const getTodayString = () => new Date().toLocaleDateString("en-CA");

export default function Dashboard() {
  const [isDbReady, setIsDbReady] = useState(false);
  const queryClient = useQueryClient();
  const [isTodayLocked, setIsTodayLocked] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.sessionStorage.getItem("kei-dashboard-timeline-locked");
      if (stored !== null) return stored === "true";
    }
    return true; // Default to locked
  });

  const [selectedDate, setSelectedDate] = useState(getTodayString());
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
    window.sessionStorage.setItem("kei-dashboard-timeline-locked", String(isTodayLocked));
  }, [isTodayLocked]);

  const { setTitle, setSubtitle, setHeaderActions } = useOutletContext<AppLayoutContext>();

  useEffect(() => {
    initPromise.then(() => setIsDbReady(true));
  }, []);

  useEffect(() => {
    setTitle("Timeline");
    setSubtitle(
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    );

    setHeaderActions({
      center: <HeaderSearch />,
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
    selectedDate,
    dialogPreDate,
    isTodayLocked,
  ]);

  const { data: allActions = [] } = useQuery({
    queryKey: ["actions"],
    queryFn: getActions,
    enabled: isDbReady,
  });

  const handleComplete = async (action: Action) => {
    if (action.status === "completed") {
      await activateAction(action.id);
    } else {
      await completeAction(action.id);
    }
    queryClient.invalidateQueries({ queryKey: ["actions"] });
  };

  const handleAbandon = async (action: Action) => {
    await abandonAction(action.id);
    queryClient.invalidateQueries({ queryKey: ["actions"] });
  };

  const handleEdit = (action: Action) => {
    setActionToEdit(action);
    setIsDialogOpen(true);
  };

  const todayStr = getTodayString();

  const { overdueActions, daySections } = useMemo(() => {
    const visibleActions = allActions.filter(
      (a) => a.status === "active" || a.status === "completed"
    );
    const todayStr = getTodayString();

    const sortFn = (a: Action, b: Action) => {
      // Completed items always go to the bottom
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (a.status !== "completed" && b.status === "completed") return -1;

      // For active items, sort by time if both have it
      if (a.startTime && b.startTime) {
        const timeCompare = a.startTime.localeCompare(b.startTime);
        if (timeCompare !== 0) return timeCompare;
      } else if (a.startTime) return -1;
      else if (b.startTime) return 1;

      // Default fallback to sortOrder
      return b.sortOrder - a.sortOrder;
    };

    // 1. Compute Overdue (tasks before Today)
    const overdue = visibleActions
      .filter((a) => a.scheduledDate < todayStr && a.status === "active")
      .sort(sortFn);

    const sections = [];

    if (isTodayLocked) {
      // Locked mode: Only show TODAY
      const actionsForDay = visibleActions.filter((a) => a.scheduledDate === todayStr).sort(sortFn);

      sections.push({
        id: todayStr,
        title: `${new Date(todayStr + "T12:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short" })} ‧ Today ‧ ${new Date(todayStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" })}`,
        date: todayStr,
        actions: actionsForDay,
      });
    } else {
      // Extended mode: Compute 30 days of sections starting from selectedDate
      const baseDate = new Date(selectedDate + "T12:00:00");

      for (let i = 0; i < 30; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toLocaleDateString("en-CA");

        const actionsForDay = visibleActions
          .filter((a) => a.scheduledDate === dateStr)
          .sort(sortFn);

        let title = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
        const isToday = dateStr === todayStr;
        const isTomorrow =
          dateStr ===
          new Date(new Date(todayStr + "T12:00:00").getTime() + 86400000).toLocaleDateString(
            "en-CA"
          );

        if (isToday) title += " ‧ Today";
        else if (isTomorrow) title += " ‧ Tomorrow";

        title += ` ‧ ${d.toLocaleDateString("en-US", { weekday: "long" })}`;

        sections.push({
          id: dateStr,
          title,
          date: dateStr,
          actions: actionsForDay,
        });
      }
    }

    return { overdueActions: overdue, daySections: sections };
  }, [allActions, selectedDate, isTodayLocked]);

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
      const updatedActions = allActions.map((a) => {
        if (a.id === activeId) {
          return {
            ...a,
            scheduledDate: targetDate!,
          };
        }
        return a;
      });
      queryClient.setQueryData(["actions"], updatedActions);
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
      .filter((a) => a.scheduledDate === targetDate && a.status === "active" && a.id !== activeId)
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
    const previousActions = allActions;
    const updatedActions = allActions.map((a) =>
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

    // Update query cache immediately
    queryClient.setQueryData(["actions"], updatedActions);

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
      queryClient.setQueryData(["actions"], previousActions);
    }
  };

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
            sectionDate={todayStr}
          />
        )}

        {/* Daily Sections */}
        {!isDbReady ? (
          <div className="space-y-6">
            <ActionSectionSkeleton />
            <ActionSectionSkeleton />
          </div>
        ) : (
          daySections.map((section) => (
            <ActionSection
              key={section.id}
              id={`date-${section.id}`}
              sectionTitle={section.title}
              actions={section.actions}
              isTodayLocked={isTodayLocked}
              onComplete={handleComplete}
              onAbandon={handleAbandon}
              onEdit={handleEdit}
              sectionDate={section.date}
            />
          ))
        )}

        <div className="h-24 md:h-8" />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div className="opacity-80 scale-105 shadow-2xl rounded-xl border-2 border-primary/20 bg-background/50 backdrop-blur-md overflow-hidden pointer-events-none">
            <ActionItem
              action={allActions.find((a) => a.id === activeId)!}
              type="active"
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
    </DndContext>
  );
}
