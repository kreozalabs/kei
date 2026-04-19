import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppLayoutContext } from "@/components/layout/AppLayout";
import { HeaderSearch, HeaderNewAction } from "@/components/layout/AppHeader";
import { initPromise } from "@/db";
import { getActions, completeAction, abandonAction } from "@/db/actions";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@kreozalabs/ui";
import { LockIcon, UnlockIcon, Loader2Icon } from "lucide-react";
import type { Action } from "@/types/events";
import { ActionSection } from "@/components/ActionSection";
import { ActionInput } from "@/components/ActionInput";
import { TimelineCalendar } from "@/components/TimelineCalendar";
import { ActionSectionSkeleton } from "@/components/ActionSkeleton";

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
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setDialogPreDate(null);
            }}
          >
            <DialogTrigger asChild>
              <HeaderNewAction />
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-0 bg-background/60 backdrop-blur-3xl border border-border/20 shadow-2xl ring-0 gap-0">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-xl font-bold">Add New Action</DialogTitle>
                <DialogDescription className="sr-only">
                  Capture a new high-impact move in the system.
                </DialogDescription>
              </DialogHeader>
              <div className="px-2 pb-2">
                <ActionInput
                  variant="dialog"
                  onSuccess={() => setIsDialogOpen(false)}
                  initialDate={dialogPreDate || selectedDate}
                />
              </div>
            </DialogContent>
          </Dialog>

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
    await completeAction(action.id);
    queryClient.invalidateQueries({ queryKey: ["actions"] });
  };

  const handleAbandon = async (action: Action) => {
    await abandonAction(action.id);
    queryClient.invalidateQueries({ queryKey: ["actions"] });
  };

  const todayStr = getTodayString();

  const { overdueActions, daySections } = useMemo(() => {
    const activeActions = allActions.filter((a) => a.status === "active");
    const todayStr = getTodayString();

    // 1. Compute Overdue (tasks before Today)
    const overdue = activeActions.filter((a) => a.scheduledDate < todayStr);

    const sections = [];

    if (isTodayLocked) {
      // Locked mode: Only show TODAY
      const actionsForDay = activeActions.filter((a) => a.scheduledDate === todayStr);
      sections.push({
        id: todayStr,
        title: `${new Date(todayStr + "T12:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short" })} ‧ Today ‧ ${new Date(todayStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" })}`,
        date: todayStr,
        actions: actionsForDay,
      });
    } else {
      // Extended mode: Compute 7 days of sections starting from selectedDate
      const baseDate = new Date(selectedDate + "T12:00:00");

      for (let i = 0; i < 7; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toLocaleDateString("en-CA");

        const actionsForDay = activeActions.filter((a) => a.scheduledDate === dateStr);

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

  return (
    <>
      <div className="max-w-3xl mx-auto px-2 sm:px-0 mt-2">
        {!isTodayLocked && (
          <TimelineCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        )}

        {/* Overdue Section (Visible only if viewing Today or nearby) */}
        {overdueActions.length > 0 && selectedDate <= todayStr && (
          <ActionSection
            id="overdue"
            sectionTitle="Overdue"
            actions={overdueActions}
            isTodayLocked={isTodayLocked}
            onComplete={handleComplete}
            onAbandon={handleAbandon}
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
              sectionDate={section.date}
            />
          ))
        )}

        {/* Mobile bottom padding for FAB */}
        <div className="h-24 md:h-8" />
      </div>

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
    </>
  );
}
