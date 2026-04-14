import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import type { AppLayoutContext } from "@/components/layout/AppLayout";
import { HeaderSearch, HeaderNewAction, HeaderMore } from "@/components/layout/AppHeader";
import { initDb } from "@/db";
import {
  Alert,
  AlertTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@kreozalabs/ui";
import { AlertCircleIcon, CheckCircle2Icon, HistoryIcon, DatabaseIcon } from "lucide-react";
import { useCurrentDay } from "@/hooks/useCurrentDay";
import { ActionInput } from "@/components/ActionInput";
import { ActionList } from "@/components/ActionList";

export default function Dashboard() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const { activeActions, completedActions, isInRedZone, maxActions, isLoading } = useCurrentDay();
  const { setTitle, setSubtitle, setOnFabClick, setHeaderActions } =
    useOutletContext<AppLayoutContext>();

  useEffect(() => {
    initDb().then(() => setIsDbReady(true));
  }, []);

  useEffect(() => {
    setTitle("Today");
    setSubtitle(`${activeActions.length} ${activeActions.length === 1 ? "task" : "tasks"}`);
    setOnFabClick(() => () => setIsInputOpen(true));

    setHeaderActions(
      <>
        <HeaderSearch />
        <HeaderNewAction onClick={() => setIsInputOpen(true)} />
        <HeaderMore />
      </>
    );

    return () => setHeaderActions(undefined);
  }, [activeActions.length, setTitle, setSubtitle, setOnFabClick, setHeaderActions]);

  return (
    <>
      {/* Red Zone Warning */}
      {isInRedZone && (
        <Alert
          variant="destructive"
          size="lg"
          className="mb-8 border-destructive/20 bg-destructive/5 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-700 rounded-2xl flex flex-row items-center gap-4"
        >
          <AlertCircleIcon className="size-5 text-destructive shrink-0 animate-pulse" />
          <AlertTitle className="font-bold text-destructive leading-tight tracking-tight">
            System Saturation Error: You are over-planned ({activeActions.length}/{maxActions}).
          </AlertTitle>
        </Alert>
      )}

      {/* Desktop Input Section (Hidden on Mobile) */}
      <div className="hidden md:block mb-12">
        <ActionInput />
      </div>

      {/* Mobile Input Dialog */}
      <Dialog open={isInputOpen} onOpenChange={setIsInputOpen}>
        <DialogContent className="sm:max-w-lg p-0 bg-background border-none shadow-2xl">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-xl font-extrabold tracking-tight">New Action</DialogTitle>
            <DialogDescription className="sr-only">
              Capture your next high-impact move in the system.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <ActionInput onSuccess={() => setIsInputOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
        {/* Active Actions */}
        <div className="space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">
              <HistoryIcon className="size-4" />
              Active Initiatives
            </h3>
            <span className="text-[10px] font-mono font-bold bg-primary/10 px-2.5 py-1 rounded-full text-primary border border-primary/20">
              {activeActions.length.toString().padStart(1, "0")}
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-20 bg-muted/30 border border-dashed rounded-4xl gap-4">
              <div className="size-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                Calibrating...
              </p>
            </div>
          ) : (
            <ActionList actions={activeActions} type="active" />
          )}
        </div>

        {/* Completed Actions */}
        <div className="space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground/70">
              <CheckCircle2Icon className="size-4" />
              Activity Archive
            </h3>
            <span className="text-[10px] font-mono font-bold bg-muted px-2.5 py-1 rounded-full text-muted-foreground/70 border">
              {completedActions.length.toString().padStart(1, "0")}
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-20 bg-muted/30 border border-dashed rounded-4xl gap-4">
              <div className="size-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            </div>
          ) : (
            <ActionList actions={completedActions} type="completed" />
          )}
        </div>
      </div>

      {/* Status Alert */}
      {!isDbReady && (
        <div className="fixed bottom-24 right-8 z-50 md:bottom-8">
          <Alert
            variant="default"
            className="shadow-2xl border-primary/20 bg-background/80 backdrop-blur-md animate-pulse min-w-75 rounded-2xl"
          >
            <DatabaseIcon className="size-4 text-primary" />
            <AlertTitle className="text-xs font-bold uppercase tracking-wider">
              Initializing Local PGlite...
            </AlertTitle>
          </Alert>
        </div>
      )}
    </>
  );
}
