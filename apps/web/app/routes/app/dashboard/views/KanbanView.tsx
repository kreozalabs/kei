import { useDashboardContext } from "../context/DashboardContext";

export function KanbanView() {
  const { isDbReady, allActions } = useDashboardContext();

  if (!isDbReady) {
    return <div className="p-8 text-center text-muted-foreground">Loading board...</div>;
  }

  return (
    <div className="p-4 md:p-8 flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Kanban Board</h2>
        <p className="text-muted-foreground text-sm">Visualize your workflow across statuses.</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-8 snap-x">
        {/* Active Column */}
        <div className="flex-1 min-w-[300px] bg-muted/30 rounded-2xl p-4 flex flex-col gap-4 border border-border/40 snap-center">
          <div className="flex items-center justify-between font-semibold text-sm px-2">
            <span className="text-foreground">Active</span>
            <span className="bg-background px-2 py-0.5 rounded-full text-xs text-muted-foreground border border-border/50">
              {allActions.filter((a) => a.status === "active").length}
            </span>
          </div>
          <div className="flex-1 bg-background/50 rounded-xl border border-border/50 border-dashed flex items-center justify-center text-muted-foreground text-sm">
            Cards go here
          </div>
        </div>

        {/* Completed Column */}
        <div className="flex-1 min-w-[300px] bg-muted/30 rounded-2xl p-4 flex flex-col gap-4 border border-border/40 snap-center">
          <div className="flex items-center justify-between font-semibold text-sm px-2">
            <span className="text-emerald-500">Completed</span>
            <span className="bg-background px-2 py-0.5 rounded-full text-xs text-emerald-500 border border-emerald-500/20">
              {allActions.filter((a) => a.status === "completed").length}
            </span>
          </div>
          <div className="flex-1 bg-background/50 rounded-xl border border-border/50 border-dashed flex items-center justify-center text-muted-foreground text-sm">
            Cards go here
          </div>
        </div>

        {/* Abandoned Column */}
        <div className="flex-1 min-w-[300px] bg-muted/30 rounded-2xl p-4 flex flex-col gap-4 border border-border/40 snap-center">
          <div className="flex items-center justify-between font-semibold text-sm px-2">
            <span className="text-rose-500">Abandoned</span>
            <span className="bg-background px-2 py-0.5 rounded-full text-xs text-rose-500 border border-rose-500/20">
              {allActions.filter((a) => a.status === "abandoned").length}
            </span>
          </div>
          <div className="flex-1 bg-background/50 rounded-xl border border-border/50 border-dashed flex items-center justify-center text-muted-foreground text-sm">
            Cards go here
          </div>
        </div>
      </div>
    </div>
  );
}
