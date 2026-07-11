import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { type AppLayoutContext } from "@/components/layout/AppLayout";
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

function DashboardShell() {
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
  } = useDashboardContext();

  const [editorMode, setEditorMode] = useState<"floating" | "docked" | "drawer">("floating");

  const { setViewMode } = useDashboardContext();

  const { setIsDocked } = useOutletContext<AppLayoutContext>();

  useEffect(() => {
    document.title = `Kei︱Timeline — ${formatTitleDate(parseDateString(selectedDate))}`; // TODO: Add Weekday
  }, [selectedDate]);

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
      Content = <CalendarView />;
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
            mode={editorMode}
            onModeChange={(newMode) => {
              setEditorMode(newMode);
              setIsDocked(newMode === "docked");
            }}
            onClose={() => {
              setIsDialogOpen(false);
              setActionToEdit(null);
              setIsDocked(false);
              setEditorMode("floating");
            }}
          >
            {actionToEdit ? (
              <ActionDetailView
                action={actionToEdit}
                onClose={() => {
                  setIsDialogOpen(false);
                  setActionToEdit(null);
                  setIsDocked(false);
                  setEditorMode("floating");
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
                  setEditorMode("floating");
                }}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setActionToEdit(null);
                  setIsDocked(false);
                  setEditorMode("floating");
                }}
                initialDate={dialogPreDate || undefined}
              />
            )}
          </DragResizeWrapper>
        )}
      </AnimatePresence>
    </AppPage>
  );
}

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardShell />
    </DashboardProvider>
  );
}
