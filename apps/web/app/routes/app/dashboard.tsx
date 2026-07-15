import { useEffect, useState, memo } from "react";
import { Button } from "@kreozalabs/kei-ui";
import { LayoutGrid } from "lucide-react";
import { parseDateString, formatTitleDate } from "@kreozalabs/kei-core";
import { AnimatePresence } from "framer-motion";
import { ActionInput } from "@/components/action-input";
import { ActionDetailView } from "@/components/ActionDetailView";
import { DragResizeWrapper } from "@/components/DragResizeWrapper";
import { useDashboardContext } from "./dashboard/context/DashboardContext";
import { DashboardProvider } from "./dashboard/context/DashboardProvider";
import { BulkActionBar } from "./dashboard/components/BulkActionBar";
import { CalendarView } from "./dashboard/views/CalendarView";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AppPage } from "@/components/layout/AppPage";

const CalendarSkeleton = () => (
  <div className="flex h-full flex-1 animate-pulse flex-col gap-4 p-4">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <div className="bg-muted h-9 w-20 rounded-full" />
        <div className="bg-muted h-9 w-24 rounded-lg" />
      </div>
      <div className="bg-muted h-9 w-32 rounded-lg" />
    </div>
    {/* Grid Skeleton */}
    <div className="border-border/40 flex-1 rounded-xl border p-4">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-muted/60 h-6 rounded-md" />
        ))}
      </div>
      <div className="mt-4 grid h-[calc(100%-2rem)] grid-cols-7 grid-rows-5 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="bg-muted/30 flex flex-col gap-2 rounded-lg p-2">
            <div className="bg-muted/50 h-4 w-6 rounded" />
            {i % 5 === 0 && <div className="bg-primary/20 h-5 w-full rounded" />}
            {i % 7 === 2 && <div className="bg-muted/40 h-5 w-full rounded" />}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DashboardShell = memo(function DashboardShell() {
  const {
    viewMode,
    isDialogOpen,
    setIsDialogOpen,
    dialogPreDate,
    actionToEdit,
    setActionToEdit,
    mutations: { handleComplete, handleAbandon, handleReactivate, handleDeletePermanently },
    dbError,
    selectedDate,
    isDbReady,
  } = useDashboardContext();

  const [shouldRenderCalendar, setShouldRenderCalendar] = useState(false);

  const { setViewMode } = useDashboardContext();

  useEffect(() => {
    document.title = `Kei︱Timeline — ${formatTitleDate(parseDateString(selectedDate))}`; // TODO: Add Weekday
  }, [selectedDate]);

  useEffect(() => {
    if (isDbReady) {
      const timer = setTimeout(() => {
        setShouldRenderCalendar(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isDbReady]);

  if (dbError) {
    return (
      <div className="border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center gap-4 rounded-3xl border-2 p-12">
        <div className="text-destructive font-bold">Database Error</div>
        <p className="text-muted-foreground max-w-md text-center text-sm">
          {dbError.message || "Failed to initialize the local database engine."}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry Initialization
        </Button>
      </div>
    );
  }

  let Content;
  switch (viewMode) {
    case "day":
    case "week":
    case "month":
    case "year":
    case "agenda":
      Content = shouldRenderCalendar ? <CalendarView /> : <CalendarSkeleton />;
      break;
    default:
      Content = (
        <div className="text-muted-foreground border-border/40 mt-12 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center">
          <div className="bg-muted mb-4 rounded-full p-4">
            <LayoutGrid className="size-8 opacity-50" />
          </div>
          <h3 className="text-foreground text-lg font-bold">View Not Implemented</h3>
          <p className="mt-2 max-w-md text-sm">
            The "{viewMode}" view is currently under development.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => setViewMode("day")}>
            Return to Day Grid
          </Button>
        </div>
      );
  }

  return (
    <AppPage header={<DashboardHeader />} className="flex flex-col">
      {Content}
      <BulkActionBar />

      {/* Global Action Modals */}
      <AnimatePresence>
        {isDialogOpen && (
          <DragResizeWrapper
            onClose={() => {
              setIsDialogOpen(false);
              setActionToEdit(null);
            }}
          >
            {actionToEdit ? (
              <ActionDetailView
                action={actionToEdit}
                onClose={() => {
                  setIsDialogOpen(false);
                  setActionToEdit(null);
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
                }}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setActionToEdit(null);
                }}
                initialDate={dialogPreDate || undefined}
              />
            )}
          </DragResizeWrapper>
        )}
      </AnimatePresence>
    </AppPage>
  );
});

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardShell />
    </DashboardProvider>
  );
}
