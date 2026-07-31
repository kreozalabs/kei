// FIXME: Refactor !
import { useState, useRef } from "react";
import { Button, Input, toast } from "@kreozalabs/kei-ui";
import { Loader2, Database, RefreshCw, Download, Upload } from "lucide-react";
import { rebuildActions } from "@/db/actions";
import { rebuildSettings } from "@/db/settings";
import { exportEvents, importEvents } from "@/db/backup";
import { SyncSettings } from "./SyncSettings";

export function MaintenanceSettings() {
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const events = await exportEvents();
      const payload = {
        version: 1,
        exportedAt: Date.now(),
        events,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().split("T")[0];
      link.download = `kei-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully", {
        description: `Exported ${events.length} events. Keep this file safe!`,
      });
    } catch (error) {
      console.error("Failed to export data:", error);
      toast.error("Export failed", {
        description: "Check the console for more details.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON: The uploaded file is not a valid JSON document.");
      }

      const eventsList = Array.isArray(parsed) ? parsed : parsed?.events;

      if (!eventsList || !Array.isArray(eventsList)) {
        throw new Error("Invalid backup file: Could not locate event logs array.");
      }

      const actualImportedCount = await importEvents(eventsList);

      if (actualImportedCount === 0) {
        toast.info("Database up to date", {
          description: "All events in the backup are already present in your local database.",
        });
      } else {
        toast.success("Data imported successfully", {
          description: `Successfully restored and rebuilt ${actualImportedCount} events. Refreshing...`,
        });

        // Clean reload to ensure all cached React states and DB connections are completely pristine
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to import data:", error);
      toast.error("Import failed", {
        description: error instanceof Error ? error.message : "Invalid backup file format.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {/* Rebuild Derived Data */}
        <div className="space-y-3 rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 text-amber-500">
            <Database className="size-4" />
            <h4 className="text-xs font-bold tracking-wider uppercase">Derived Data</h4>
          </div>
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            Derived data can be reconstructed at any time from the permanent event log. Use this if
            you notice any data inconsistencies.
          </p>
          <Button
            onClick={handleRebuild}
            disabled={isRebuilding}
            variant="outline"
            className="bg-background hover:bg-muted border-border/50 text-foreground h-10 w-full justify-start gap-2 rounded-xl"
          >
            {isRebuilding ? (
              <Loader2 className="text-primary size-4 animate-spin" />
            ) : (
              <RefreshCw className="text-primary size-4" />
            )}
            <span className="text-[12px] font-bold tracking-widest uppercase">
              {isRebuilding ? "Rebuilding..." : "Rebuild Database"}
            </span>
          </Button>
        </div>

        {/* Export & Import */}
        <div className="space-y-3 rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 text-amber-500">
            <Database className="size-4" />
            <h4 className="text-xs font-bold tracking-wider uppercase">Export & Import</h4>
          </div>
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            Export and Import Your Data
          </p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              variant="outline"
              className="bg-background hover:bg-muted border-border/50 text-foreground h-10 w-full justify-start gap-2 rounded-xl"
            >
              {isExporting ? (
                <Loader2 className="text-primary size-4 animate-spin" />
              ) : (
                <Download className="text-primary size-4" />
              )}
              <span className="text-[12px] font-bold tracking-widest uppercase">
                {isExporting ? "Exporting..." : "Export"}
              </span>
            </Button>
            <Button
              onClick={handleImportClick}
              disabled={isImporting}
              variant="outline"
              className="bg-background hover:bg-muted border-border/50 text-foreground h-10 w-full justify-start gap-2 rounded-xl"
            >
              {isImporting ? (
                <Loader2 className="text-primary size-4 animate-spin" />
              ) : (
                <Upload className="text-primary size-4" />
              )}
              <span className="text-[12px] font-bold tracking-widest uppercase">
                {isImporting ? "Importing..." : "Import"}
              </span>
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleImportChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Device Sync (P2P) */}
        <div className="border-border/50 space-y-4 rounded-2xl border bg-zinc-500/5 p-4">
          <SyncSettings />
        </div>
      </div>
    </div>
  );
}
