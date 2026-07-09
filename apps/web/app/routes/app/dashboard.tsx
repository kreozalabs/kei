import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { type AppLayoutContext } from "@/components/layout/AppLayout";
import { HeaderSearch, HeaderNewAction, HeaderCalendar } from "@/components/layout/AppHeader";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@kreozalabs/kei-ui";
import {
  LockIcon,
  UnlockIcon,
  MoreVertical,
  CheckSquare,
  CheckCircle2Icon,
  Trash2Icon,
  Loader2Icon,
  LayoutGrid,
} from "lucide-react";
import { parseDateString, formatTitleDate } from "@kreozalabs/kei-core";
import { AnimatePresence } from "framer-motion";
import { ActionInput } from "@/components/action-input";
import { ActionDetailView } from "@/components/ActionDetailView";
import { DragResizeWrapper } from "@/components/DragResizeWrapper";
import { useSettings } from "@/providers/SettingsContext";

import { createPortal } from "react-dom";
import { useDashboardContext } from "./dashboard/context/DashboardContext";
import { DashboardProvider } from "./dashboard/context/DashboardProvider";
import { ViewSwitcher } from "./dashboard/components/ViewSwitcher";
import { BulkActionBar } from "./dashboard/components/BulkActionBar";
import { DayView } from "./dashboard/views/DayView";
import { KanbanView } from "./dashboard/views/KanbanView";

function HeaderPortal({ to, children }: { to: string; children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let checkCount = 0;
    const checkTarget = () => {
      const el = document.getElementById(to);
      if (el) {
        setTarget(el);
      } else if (checkCount < 10) {
        checkCount++;
        requestAnimationFrame(checkTarget);
      }
    };
    checkTarget();
  }, [to]);

  if (!target) return null;
  return createPortal(children, target);
}

function DashboardShell() {
  const { settings, updateSetting } = useSettings();
  const {
    viewMode,
    isTodayLocked,
    setIsTodayLocked,
    selectedDate,
    setSelectedDate,
    startDate,
    visibleSelectedActionIds,
    isSelectionModeForced,
    setIsSelectionModeForced,
    handleClearSelection,
    isDialogOpen,
    setIsDialogOpen,
    dialogPreDate,
    setDialogPreDate,
    actionToEdit,
    setActionToEdit,
    mutations: { handleComplete, handleAbandon, handleReactivate, handleDeletePermanently },
    dbError,
    isDbReady,
    todayStr,
  } = useDashboardContext();

  const [editorMode, setEditorMode] = useState<"floating" | "docked" | "drawer">("floating");

  const { setTitle, setSubtitle, setHeaderActions, setIsDocked } =
    useOutletContext<AppLayoutContext>();

  useEffect(() => {
    setTitle("Timeline");
    setSubtitle(formatTitleDate(parseDateString(startDate)));

    setHeaderActions({
      center: <div id="header-center-portal-root" />,
      right: <div id="header-right-portal-root" />,
    });

    return () => setHeaderActions(undefined);
  }, [setTitle, setSubtitle, setHeaderActions, startDate]);

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
      Content = <DayView />;
      break;
    case "kanban":
      Content = <KanbanView />;
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
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => useDashboardContext().setViewMode("day")}
          >
            Return to Day Grid
          </Button>
        </div>
      );
  }

  return (
    <>
      <HeaderPortal to="header-center-portal-root">
        <div className="flex items-center gap-3">
          {/* Sticky Today Button for Day Grid */}
          {viewMode === "day" && !isTodayLocked && selectedDate !== todayStr && (
            <div className="animate-in fade-in slide-in-from-top-4 hidden duration-200 sm:block">
              <Button
                onClick={() => setSelectedDate(todayStr)}
                className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-full border-none px-3 py-1.5 text-[10px] font-black tracking-wider uppercase shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                Today
              </Button>
            </div>
          )}
          <HeaderCalendar />
          <ViewSwitcher />
          <div className="hidden sm:block">
            <HeaderSearch />
          </div>
        </div>
      </HeaderPortal>

      <HeaderPortal to="header-right-portal-root">
        <div className="flex items-center gap-2">
          <div
            onClick={() => {
              setDialogPreDate(null);
              setActionToEdit(null);
              setIsDialogOpen(true);
            }}
          >
            <HeaderNewAction />
          </div>

          {viewMode === "day" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsTodayLocked((prev) => !prev)}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 size-8 rounded-full border-none transition-all active:scale-95"
              title={isTodayLocked ? "Unlock Timeline" : "Lock to Today"}
            >
              {isTodayLocked ? <LockIcon className="size-4" /> : <UnlockIcon className="size-4" />}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 size-8 rounded-full border-none transition-all active:scale-95"
                title="More Actions"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border-border/40 w-48">
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
                  className="flex cursor-pointer items-center gap-2 text-xs"
                >
                  <CheckSquare
                    className={cn(
                      "mr-1 size-3.5",
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
                className="flex cursor-pointer items-center gap-2 text-xs"
              >
                <CheckCircle2Icon
                  className={cn(
                    "mr-1 size-3.5",
                    settings.show_completed ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>Show Completed</span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={settings.show_abandoned}
                onCheckedChange={(checked) => updateSetting("show_abandoned", checked)}
                className="flex cursor-pointer items-center gap-2 text-xs"
              >
                <Trash2Icon
                  className={cn(
                    "mr-1 size-3.5",
                    settings.show_abandoned ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>Show Abandoned</span>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </HeaderPortal>

      {Content}
      <BulkActionBar />

      {/* Sync Status Alert */}
      {!isDbReady && (
        <div className="animate-in fade-in slide-in-from-bottom-4 fixed right-8 bottom-24 z-50 duration-500 md:bottom-8">
          <div className="border-primary/20 bg-background/80 flex items-center gap-3 rounded-2xl border px-4 py-2 shadow-2xl backdrop-blur-md">
            <Loader2Icon className="text-primary size-4 animate-spin" />
            <span className="text-primary/80 text-[10px] font-bold tracking-[0.15em] uppercase">
              Synchronizing
            </span>
          </div>
        </div>
      )}

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
    </>
  );
}

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardShell />
    </DashboardProvider>
  );
}
