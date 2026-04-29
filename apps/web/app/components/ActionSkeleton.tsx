export function ActionSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 px-2 border-b border-border/10 animate-pulse">
      <div className="size-6 rounded-full bg-muted/40 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted/40 rounded-md w-3/4" />
        <div className="h-3 bg-muted/20 rounded-md w-1/2" />
      </div>
      <div className="size-8 rounded-full bg-muted/20 shrink-0" />
    </div>
  );
}

export function ActionSectionSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 px-2 border-b border-border/20 pb-2 mb-4">
        <div className="h-5 bg-muted/40 rounded-md w-32" />
      </div>
      <div className="space-y-1">
        <ActionSkeleton />
        <ActionSkeleton />
        <ActionSkeleton />
      </div>
    </div>
  );
}
