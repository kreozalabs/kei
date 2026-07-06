import { useDashboardContext } from "../context/DashboardContext";

export function KanbanView() {
  const { isDbReady, allActions } = useDashboardContext();

  if (!isDbReady) {
    return <div className="text-muted-foreground p-8 text-center">Loading board...</div>;
  }

  return (
    <div className="flex h-full flex-col p-4 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Kanban Board</h2>
        <p className="text-muted-foreground text-sm">Visualize your workflow across statuses.</p>
      </div>

      <div className="flex flex-1 snap-x gap-6 overflow-x-auto pb-8">
        {/* Active Column */}
        <div className="bg-muted/30 border-border/40 flex min-w-[300px] flex-1 snap-center flex-col gap-4 rounded-2xl border p-4">
          <div className="flex items-center justify-between px-2 text-sm font-semibold">
            <span className="text-foreground">Active</span>
            <span className="bg-background text-muted-foreground border-border/50 rounded-full border px-2 py-0.5 text-xs">
              {allActions.filter((a) => a.status === "active").length}
            </span>
          </div>
          <div className="bg-background/50 border-border/50 text-muted-foreground flex flex-1 items-center justify-center rounded-xl border border-dashed text-sm">
            Cards go here
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-muted/30 border-border/40 flex min-w-[300px] flex-1 snap-center flex-col gap-4 rounded-2xl border p-4">
          <div className="flex items-center justify-between px-2 text-sm font-semibold">
            <span className="text-emerald-500">Completed</span>
            <span className="bg-background rounded-full border border-emerald-500/20 px-2 py-0.5 text-xs text-emerald-500">
              {allActions.filter((a) => a.status === "completed").length}
            </span>
          </div>
          <div className="bg-background/50 border-border/50 text-muted-foreground flex flex-1 items-center justify-center rounded-xl border border-dashed text-sm">
            Cards go here
          </div>
        </div>

        {/* Abandoned Column */}
        <div className="bg-muted/30 border-border/40 flex min-w-[300px] flex-1 snap-center flex-col gap-4 rounded-2xl border p-4">
          <div className="flex items-center justify-between px-2 text-sm font-semibold">
            <span className="text-rose-500">Abandoned</span>
            <span className="bg-background rounded-full border border-rose-500/20 px-2 py-0.5 text-xs text-rose-500">
              {allActions.filter((a) => a.status === "abandoned").length}
            </span>
          </div>
          <div className="bg-background/50 border-border/50 text-muted-foreground flex flex-1 items-center justify-center rounded-xl border border-dashed text-sm">
            Cards go here
          </div>
        </div>
      </div>
    </div>
  );
}
