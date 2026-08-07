import { Loader2Icon } from "lucide-react";
import { useDb } from "@/providers/DbContext";

export function DbSyncStatus() {
  const { isDbReady, isWriting } = useDb();
  const isLoading = !isDbReady || isWriting;

  if (!isLoading) return null;

  return (
    <div className="floating-toolbar bg-card/85 border-border/40 animate-in fade-in zoom-in-95 absolute bottom-24 left-6 z-50 flex size-14 items-center justify-center rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 md:bottom-6">
      <Loader2Icon className="text-muted-foreground/60 size-6 animate-spin" />
    </div>
  );
}
