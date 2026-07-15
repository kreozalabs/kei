export const CalendarSkeleton = () => (
  <div className="flex h-full flex-1 animate-pulse flex-col gap-4 p-4">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <div className="bg-muted h-9 w-20 rounded-full" />
        <div className="bg-muted h-9 w-24 rounded-lg" />
      </div>
      <div className="bg-muted h-9 w-32 rounded-lg" />
    </div>
    {/* Grid Skeleton */}
    <div className="border-border/40 flex-1 rounded-xl border p-4">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-muted/60 h-6 rounded-md" />
        ))}
      </div>
      <div className="mt-4 grid h-[calc(100%-2rem)] grid-cols-7 grid-rows-5 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="bg-muted/30 flex flex-col gap-2 rounded-lg p-2">
            <div className="bg-muted/50 h-4 w-6 rounded" />
            {i % 5 === 0 && <div className="bg-primary/20 h-5 w-full rounded" />}
            {i % 7 === 2 && <div className="bg-muted/40 h-5 w-full rounded" />}
          </div>
        ))}
      </div>
    </div>
  </div>
);
