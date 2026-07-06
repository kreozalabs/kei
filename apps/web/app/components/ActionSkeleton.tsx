// FIXME: Refactor !
function ActionSkeleton() {
  return (
    <div className="border-border/10 flex animate-pulse items-center gap-4 border-b px-2 py-4">
      <div className="bg-muted/40 size-6 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="bg-muted/40 h-4 w-3/4 rounded-md" />
        <div className="bg-muted/20 h-3 w-1/2 rounded-md" />
      </div>
      <div className="bg-muted/20 size-8 shrink-0 rounded-full" />
    </div>
  );
}

export function ActionSectionSkeleton() {
  return (
    <div className="mb-8">
      <div className="border-border/20 mb-4 flex items-center gap-2 border-b px-2 pb-2">
        <div className="bg-muted/40 h-5 w-32 rounded-md" />
      </div>
      <div className="space-y-1">
        <ActionSkeleton />
        <ActionSkeleton />
        <ActionSkeleton />
      </div>
    </div>
  );
}
