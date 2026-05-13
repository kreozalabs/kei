import { useState } from "react";
import { Button } from "@kreozalabs/ui";
import { Loader2, Database, RefreshCw } from "lucide-react";
import { rebuildActions } from "../../db/actions";
import { rebuildSettings } from "../../db/settings";
import { toast } from "sonner";

export function MaintenanceSettings() {
  const [isRebuilding, setIsRebuilding] = useState(false);

  const handleRebuild = async () => {
    setIsRebuilding(true);
    try {
      await rebuildActions();
      await rebuildSettings();
      toast.success("Database rebuild complete", {
        description: "Derived data has been synchronized from the event log.",
      });
    } catch (error) {
      console.error("Failed to rebuild database:", error);
      toast.error("Database rebuild failed", {
        // TODO: Should description be removed, since user may not get what it means even if he looks in details?
        description: "Check the console for more details.",
      });
    } finally {
      setIsRebuilding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
          <div className="flex items-center gap-2 text-amber-500">
            <Database className="size-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Derived Data</h4>
          </div>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Derived data can be reconstructed at any time from the permanent event log. Use this if
            you notice any data inconsistencies.
          </p>
          <Button
            onClick={handleRebuild}
            disabled={isRebuilding}
            variant="outline"
            className="w-full justify-start gap-2 h-10 rounded-xl bg-background hover:bg-muted border-border/50 text-foreground"
          >
            {isRebuilding ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <RefreshCw className="size-4 text-primary" />
            )}
            <span className="font-bold text-[12px] uppercase tracking-widest">
              {isRebuilding ? "Rebuilding..." : "Rebuild Database"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
