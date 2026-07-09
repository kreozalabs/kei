import { useDashboardContext } from "../context/DashboardContext";
import {
  Button,
  Input,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@kreozalabs/kei-ui";
import { RotateCcw, CheckCircle2Icon, CalendarIcon, Trash2Icon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getNextDayString } from "@kreozalabs/kei-core";
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
    },
  } = useDashboardContext();

  const areAllSelectedCompleted = useMemo(() => {
    const selectedActions = allActions.filter((a) => visibleSelectedActionIds.has(a.id));
    return selectedActions.length > 0 && selectedActions.every((a) => a.status === "completed");
  }, [allActions, visibleSelectedActionIds]);

  return (
    <AnimatePresence>
      {isBulkModeActive && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="border-border/40 bg-background/70 fixed bottom-20 left-1/2 z-50 flex max-w-[95vw] -translate-x-1/2 items-center gap-2 rounded-full border px-3 py-2 shadow-2xl backdrop-blur-xl sm:gap-4 sm:px-5 sm:py-3 md:bottom-6 md:max-w-none"
        >
          <div className="border-border/20 flex shrink-0 items-center gap-1.5 border-r pr-2 sm:pr-4">
            <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-[10px] font-black">
              {visibleSelectedActionIds.size}
            </span>
            <span className="text-muted-foreground hidden text-xs font-black tracking-wider uppercase sm:inline">
              Selected
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {areAllSelectedCompleted ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkReactivate}
                disabled={visibleSelectedActionIds.size === 0}
                className="text-muted-foreground h-8 gap-1.5 rounded-full border-none px-2 text-xs font-bold transition-all hover:border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-500 disabled:opacity-40 sm:px-3"
                title="Reactivate selected"
              >
                <RotateCcw className="size-3.5 text-amber-500" />
                <span className="hidden sm:inline">Reactivate</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkComplete}
                disabled={visibleSelectedActionIds.size === 0}
                className="text-muted-foreground h-8 gap-1.5 rounded-full border-none px-2 text-xs font-bold transition-all hover:border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 disabled:opacity-40 sm:px-3"
                title="Complete selected"
              >
                <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Complete</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={visibleSelectedActionIds.size === 0}
                  className="hover:bg-primary/10 hover:text-primary text-muted-foreground h-8 gap-1.5 rounded-full border-none px-2 text-xs font-bold transition-all disabled:opacity-40 sm:px-3"
                  title="Reschedule selected"
                >
                  <CalendarIcon className="size-3.5" />
                  <span className="hidden sm:inline">Reschedule</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="bg-background/90 border-border/20 animate-in fade-in zoom-in-95 w-44 rounded-2xl border p-1 shadow-2xl ring-0 backdrop-blur-md duration-200"
              >
                <DropdownMenuItem
                  onClick={() => handleBulkReschedule(todayStr)}
                  className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md border-none px-2 py-1.5 text-[12.5px] font-semibold transition-colors"
                >
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkReschedule(getNextDayString(todayStr))}
                  className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md border-none px-2 py-1.5 text-[12.5px] font-semibold transition-colors"
                >
                  Tomorrow
                </DropdownMenuItem>
                <div className="border-border/10 flex flex-col gap-1 border-t px-2 py-1.5">
                  <span className="text-muted-foreground/50 text-[9px] font-bold tracking-wider uppercase">
                    Pick custom date
                  </span>
                  <Input
                    type="date"
                    className="border-border/20 focus-visible:ring-primary text-foreground h-7 rounded-lg border bg-transparent px-1 py-0.5 text-xs focus-visible:ring-1 focus-visible:ring-offset-0"
                    onChange={(e) => {
                      if (e.target.value) handleBulkReschedule(e.target.value);
                    }}
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkAbandon}
              disabled={visibleSelectedActionIds.size === 0}
              className="text-muted-foreground h-8 gap-1.5 rounded-full border-none px-2 text-xs font-bold transition-all hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-40 sm:px-3"
              title="Abandon selected"
            >
              <Trash2Icon className="size-3.5" />
              <span className="hidden sm:inline">Abandon</span>
            </Button>
          </div>

          <div className="border-border/20 shrink-0 border-l pl-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 h-7 rounded-full border-none px-2 text-[10px] font-black tracking-wider uppercase transition-all sm:px-2.5"
              title="Clear selection"
            >
              <X className="size-3.5 sm:hidden" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
