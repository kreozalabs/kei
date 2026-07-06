import { useDashboardContext } from "../context/DashboardContext";
import { Button, Input, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@kreozalabs/ui";
import { RotateCcw, CheckCircle2Icon, CalendarIcon, Trash2Icon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getNextDayString } from "@kreozalabs/core";
import { useMemo } from "react";

export function BulkActionBar() {
  const {
    isBulkModeActive,
    visibleSelectedActionIds,
    allActions,
    handleClearSelection,
    todayStr,
    mutations: {
      handleBulkComplete,
      handleBulkReactivate,
      handleBulkAbandon,
      handleBulkReschedule,
    }
  } = useDashboardContext();

  const areAllSelectedCompleted = useMemo(() => {
    const selectedActions = allActions.filter(a => visibleSelectedActionIds.has(a.id));
    return selectedActions.length > 0 && selectedActions.every(a => a.status === "completed");
  }, [allActions, visibleSelectedActionIds]);

  return (
    <AnimatePresence>
      {isBulkModeActive && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-4 px-3 py-2 sm:px-5 sm:py-3 border border-border/40 bg-background/70 backdrop-blur-xl rounded-full shadow-2xl max-w-[95vw] md:max-w-none"
        >
          <div className="flex items-center gap-1.5 border-r border-border/20 pr-2 sm:pr-4 shrink-0">
            <span className="flex items-center justify-center size-5 bg-primary text-primary-foreground font-black text-[10px] rounded-full">
              {visibleSelectedActionIds.size}
            </span>
            <span className="text-xs font-black tracking-wider uppercase text-muted-foreground hidden sm:inline">
              Selected
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {areAllSelectedCompleted ? (
              <Button variant="ghost" size="sm" onClick={handleBulkReactivate} disabled={visibleSelectedActionIds.size === 0} className="h-8 text-xs font-bold hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/20 text-muted-foreground gap-1.5 rounded-full px-2 sm:px-3 transition-all border-none disabled:opacity-40" title="Reactivate selected">
                <RotateCcw className="size-3.5 text-amber-500" />
                <span className="hidden sm:inline">Reactivate</span>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleBulkComplete} disabled={visibleSelectedActionIds.size === 0} className="h-8 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20 text-muted-foreground gap-1.5 rounded-full px-2 sm:px-3 transition-all border-none disabled:opacity-40" title="Complete selected">
                <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Complete</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={visibleSelectedActionIds.size === 0} className="h-8 text-xs font-bold hover:bg-primary/10 hover:text-primary text-muted-foreground gap-1.5 rounded-full px-2 sm:px-3 transition-all border-none disabled:opacity-40" title="Reschedule selected">
                  <CalendarIcon className="size-3.5" />
                  <span className="hidden sm:inline">Reschedule</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-background/90 backdrop-blur-md border border-border/20 shadow-2xl p-1 rounded-2xl w-44 animate-in fade-in zoom-in-95 duration-200 ring-0">
                <DropdownMenuItem onClick={() => handleBulkReschedule(todayStr)} className="flex items-center gap-2 px-2 py-1.5 text-[12.5px] font-semibold hover:bg-muted/50 rounded-md transition-colors cursor-pointer border-none">
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkReschedule(getNextDayString(todayStr))} className="flex items-center gap-2 px-2 py-1.5 text-[12.5px] font-semibold hover:bg-muted/50 rounded-md transition-colors cursor-pointer border-none">
                  Tomorrow
                </DropdownMenuItem>
                <div className="px-2 py-1.5 flex flex-col gap-1 border-t border-border/10">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground/50 tracking-wider">Pick custom date</span>
                  <Input type="date" className="h-7 text-xs border border-border/20 px-1 py-0.5 rounded-lg bg-transparent focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 text-foreground" onChange={(e) => { if (e.target.value) handleBulkReschedule(e.target.value); }} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" onClick={handleBulkAbandon} disabled={visibleSelectedActionIds.size === 0} className="h-8 text-xs font-bold hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 text-muted-foreground gap-1.5 rounded-full px-2 sm:px-3 transition-all border-none disabled:opacity-40" title="Abandon selected">
              <Trash2Icon className="size-3.5" />
              <span className="hidden sm:inline">Abandon</span>
            </Button>
          </div>

          <div className="border-l border-border/20 pl-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={handleClearSelection} className="h-7 text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-full px-2 sm:px-2.5 transition-all border-none" title="Clear selection">
              <X className="size-3.5 sm:hidden" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
