import { useState, useRef } from "react";
import { Button, Input } from "@kreozalabs/ui";
import {
  Loader2,
  Database,
  RefreshCw,
  Download,
  Upload,
  Smartphone,
  WifiOff,
  Link2,
  Unlink,
  Copy,
  Check,
} from "lucide-react";
import { rebuildActions } from "@/db/actions";
import { rebuildSettings } from "@/db/settings";
import { toast } from "sonner";
import { exportEvents, importEvents } from "@/db/backup";
import { useP2P } from "@/providers/P2PProvider";

export function MaintenanceSettings() {
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isPaired,
    pairingCode,
    connectionStatus,
    connectedPeers,
    pairDevice,
    unpairDevice,
    generatePairingCode,
  } = useP2P();

  const [inputCode, setInputCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setGeneratedCode(generatePairingCode());
  };

  const handlePair = async () => {
    if (!inputCode) return;
    const success = await pairDevice(inputCode);
    if (success) {
      setInputCode("");
      setGeneratedCode("");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode || pairingCode);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

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

        {/* Export & Import */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
          <div className="flex items-center gap-2 text-amber-500">
            <Database className="size-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Export & Import</h4>
          </div>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Export and Import Your Data
          </p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              variant="outline"
              className="w-full justify-start gap-2 h-10 rounded-xl bg-background hover:bg-muted border-border/50 text-foreground"
            >
              {isExporting ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <Download className="size-4 text-primary" />
              )}
              <span className="font-bold text-[12px] uppercase tracking-widest">
                {isExporting ? "Exporting..." : "Export"}
              </span>
            </Button>
            <Button
              onClick={handleImportClick}
              disabled={isImporting}
              variant="outline"
              className="w-full justify-start gap-2 h-10 rounded-xl bg-background hover:bg-muted border-border/50 text-foreground"
            >
              {isImporting ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <Upload className="size-4 text-primary" />
              )}
              <span className="font-bold text-[12px] uppercase tracking-widest">
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
        <div className="p-4 rounded-2xl bg-zinc-500/5 border border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Smartphone className="size-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Device Sync</h4>
            </div>
            {/* Connection Status Badge */}
            <div className="flex items-center gap-1.5">
              {!isPaired ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-border bg-muted/30 text-muted-foreground">
                  <WifiOff className="size-3" /> Unpaired
                </span>
              ) : connectionStatus === "connected" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-500/20 bg-amber-500/10 text-amber-500">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" /> Connecting
                </span>
              )}
            </div>
          </div>

          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Synchronize tasks and settings directly with your other devices (laptop, phone) using
            secure, real-time WebRTC channels.
          </p>

          {!isPaired ? (
            <div className="space-y-4 pt-2">
              {/* Option A: Generate pairing code */}
              <div className="space-y-3">
                <Button
                  onClick={handleGenerate}
                  variant="outline"
                  className="w-full justify-center gap-2 h-10 rounded-xl bg-background hover:bg-muted border-border/50 text-foreground"
                >
                  <Link2 className="size-4 text-primary" />
                  <span className="font-bold text-[12px] uppercase tracking-widest">
                    Generate Pairing Code
                  </span>
                </Button>

                {generatedCode && (
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
                    <span className="font-mono text-lg font-bold tracking-widest text-primary px-2 selection:bg-primary/20">
                      {generatedCode}
                    </span>
                    <Button
                      size="sm"
                      onClick={handleCopy}
                      variant="outline"
                      className="rounded-lg h-8 px-3 bg-background hover:bg-muted border-border/50 text-foreground gap-1.5"
                    >
                      {copied ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {copied ? "Copied" : "Copy"}
                      </span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Option B: Input pairing code */}
              <div className="space-y-2 pt-2 border-t border-border/30">
                <p className="text-[11px] text-muted-foreground/80 uppercase tracking-widest font-bold">
                  Or enter code from other device
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="KEI-XXXX-XXXX"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="flex-1 rounded-xl h-10 border-border/50 text-center font-mono uppercase tracking-widest bg-background/50 placeholder:text-muted-foreground/45 text-sm"
                  />
                  <Button
                    onClick={handlePair}
                    disabled={!inputCode}
                    variant="outline"
                    className="h-10 rounded-xl px-5 bg-background hover:bg-muted border-border/50 font-bold text-[12px] uppercase tracking-widest text-primary disabled:opacity-50"
                  >
                    Pair
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Paired state display */}
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/30 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Pairing Code</span>
                  <span className="font-mono font-semibold tracking-wider text-foreground select-all">
                    {pairingCode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Active Peer Channels</span>
                  <span className="font-semibold text-foreground">
                    {connectedPeers.length > 0
                      ? `${connectedPeers.length} active`
                      : "waiting for peer..."}
                  </span>
                </div>
              </div>

              <Button
                onClick={unpairDevice}
                variant="outline"
                className="w-full justify-center gap-2 h-10 rounded-xl bg-background hover:bg-red-500/5 border-border/50 text-red-500 hover:text-red-600 hover:border-red-500/20"
              >
                <Unlink className="size-4" />
                <span className="font-bold text-[12px] uppercase tracking-widest">
                  Unpair & Disconnect
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
