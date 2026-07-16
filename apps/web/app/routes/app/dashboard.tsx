import { useEffect, useState, memo } from "react";
import { Button } from "@kreozalabs/kei-ui";
import { LayoutGrid } from "lucide-react";
import { parseDateString, formatTitleDate } from "@kreozalabs/kei-core";
import { AnimatePresence } from "framer-motion";
import { ActionDetailView } from "@/components/ActionDetailView";
import { DragResizeWrapper } from "@/components/DragResizeWrapper";
import { useDashboardContext } from "./dashboard/context/DashboardContext";
import { DashboardProvider } from "./dashboard/context/DashboardProvider";
import { BulkActionBar } from "./dashboard/components/BulkActionBar";
import { CalendarView } from "./dashboard/views/CalendarView";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AppPage } from "@/components/layout/AppPage";
import { CalendarSkeleton } from "@/components/CalendarSkeleton";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

const DashboardShell = memo(function DashboardShell() {
  const {
    viewMode,
    isDialogOpen,
    setIsDialogOpen,
    actionToEdit,
    setActionToEdit,
    mutations: { handleComplete, handleAbandon, handleReactivate, handleDeletePermanently },
    dbError,
    selectedDate,
    isDbReady,
  } = useDashboardContext();
  const [shouldRenderCalendar, setShouldRenderCalendar] = useState(false);

  const { setViewMode } = useDashboardContext();

  useKeyboardShortcuts([
    { key: "g>d>t", handler: () => setViewMode("day"), description: "Go to Day View" },
    { key: "g>w>t", handler: () => setViewMode("week"), description: "Go to Week View" },
    { key: "g>c>t", handler: () => setViewMode("month"), description: "Go to Calendar" },
    { key: "g>i>t", handler: () => setViewMode("inbox"), description: "Go to Inbox" },
    { key: "g>t>t", handler: () => setViewMode("day"), description: "Go to Timeline" },
  ]);

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
        {isDialogOpen && actionToEdit && (
          <DragResizeWrapper
            onClose={() => {
              setIsDialogOpen(false);
              setActionToEdit(null);
            }}
          >
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
