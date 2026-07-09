// FIXME: Refactor !
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Button, cn, toast } from "@kreozalabs/kei-ui";
import { useP2P } from "@/providers/P2PProvider";
import { db } from "@/db";
import type { BenchmarkResult } from "@/db/webDatabaseAdapter";
import {
  Check,
  X,
  Database,
  HardDrive,
  RefreshCw,
  Bell,
  BellOff,
  Layers,
  Activity,
  Github as GitHub,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

interface DbStats {
  eventsCount: number;
  actionsCount: number;
  dbAge: string;
}

interface StorageStats {
  usedMb: number;
  totalMb: number;
  percent: number;
  persisted: boolean;
}

// Reusable card component for telemetry diagnostics
interface TelemetryCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function TelemetryCard({ title, icon, children, className }: TelemetryCardProps) {
  return (
    <div
      className={cn(
        "bg-muted/10 border-border/40 hover:border-border/60 @container space-y-4 rounded-2xl border p-5 transition-all duration-300",
        className
      )}
    >
      <div className="text-primary flex items-center gap-2">
        {icon}
        <h4 className="text-xs font-bold tracking-wider uppercase">{title}</h4>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// Reusable row component for key-value styling consistency
interface TelemetryRowProps {
  label: string;
  value: React.ReactNode;
  borderTop?: boolean;
}

function TelemetryRow({ label, value, borderTop }: TelemetryRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-1 text-xs @sm:flex-row @sm:items-center @sm:gap-4",
        borderTop && "border-border/30 border-t pt-1.5"
      )}
    >
      <span className="text-muted-foreground shrink-0">{label}</span>
      {typeof value === "string" ? (
        <span className="text-foreground min-w-0 text-left font-semibold @sm:text-right">
          {value}
        </span>
      ) : (
        <div className="flex min-w-0 items-center justify-start @sm:justify-end">{value}</div>
      )}
    </div>
  );
}

export function SystemSettings() {
  const { connectionStatus, connectedPeers } = useP2P();

  const [isOpen, setIsOpen] = useState(false);

  // Reactive state telemetry
  const [isOnline, setIsOnline] = useState(true);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string>("default");

  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [isRequestingPersistence, setIsRequestingPersistence] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const { runDbBenchmark } = await import("@/db/webDatabaseAdapter");
      const result = await runDbBenchmark();
      setBenchmarkResult(result);
      toast.success("Benchmark completed", {
        description: `Read: ${result.readTimeMs.toFixed(2)}ms | Write: ${result.writeTimeMs.toFixed(2)}ms | Batch: ${result.batchWriteTimeMs.toFixed(2)}ms`,
      });
    } catch (err) {
      console.error("Failed to run benchmark:", err);
      toast.error("Benchmark failed", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsBenchmarking(false);
    }
  };

  // Reactive listener for online status
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [isOpen]);

  // Check PWA offline readiness
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      setIsOfflineReady(!!navigator.serviceWorker.controller);
    }
  }, [isOpen]);

  // Notifications status
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationStatus(Notification.permission);
    }
  }, [isOpen]);

  // Query database metrics
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function fetchDbStats() {
      if (!db) return;
      try {
        const eventsRes = await db.query("SELECT COUNT(*) as count FROM events");
        const actionsRes = await db.query("SELECT COUNT(*) as count FROM actions");
        const oldestRes = await db.query("SELECT MIN(timestamp) as oldest FROM events");

        const eventsCount = Number(
          (eventsRes.rows?.[0] as { count?: number | string })?.count ?? 0
        );
        const actionsCount = Number(
          (actionsRes.rows?.[0] as { count?: number | string })?.count ?? 0
        );
        const oldestTimestamp = (oldestRes.rows?.[0] as { oldest?: number | string | null })
          ?.oldest;

        let dbAge = "No data yet";
        if (oldestTimestamp) {
          const diffMs = Date.now() - Number(oldestTimestamp);
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            dbAge = diffHours === 0 ? "Created just now" : `Created ${diffHours}h ago`;
          } else {
            dbAge = `Created ${diffDays}d ago`;
          }
        }

        if (isMounted) {
          setDbStats({ eventsCount, actionsCount, dbAge });
        }
      } catch (err) {
        console.error("Failed to query db stats for SystemSettings:", err);
      }
    }

    fetchDbStats();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Retrieve storage statistics
  const fetchStorageStats = async () => {
    if (typeof window !== "undefined" && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const usedBytes = estimate.usage ?? 0;
        const totalBytes = estimate.quota ?? 1;
        const usedMb = Number((usedBytes / (1024 * 1024)).toFixed(2));
        const totalMb = Number((totalBytes / (1024 * 1024)).toFixed(2));
        const percent = Math.min(100, Math.round((usedBytes / totalBytes) * 100));

        const persisted = await navigator.storage.persisted();

        setStorageStats({ usedMb, totalMb, percent, persisted });
      } catch (err) {
        console.error("Failed to estimate storage:", err);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchStorageStats();
  }, [isOpen]);

  // Request Persistent Storage to prevent automatic browser deletion
  const handleRequestPersistence = async () => {
    if (typeof window === "undefined" || !navigator.storage || !navigator.storage.persist) {
      toast.error("Not supported", {
        description: "Persistent storage API is not supported on this browser.",
      });
      return;
    }

    setIsRequestingPersistence(true);
    try {
      const granted = await navigator.storage.persist();
      if (granted) {
        toast.success("Persistent storage activated", {
          description:
            "Kei is now hardened. The browser will protect your database from automatic eviction.",
        });
      } else {
        toast.error("Request denied", {
          description:
            "Browser rejected the persistence request. This can occur under strict security rules.",
        });
      }
      await fetchStorageStats();
    } catch (err) {
      toast.error("Persistence check failed", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsRequestingPersistence(false);
    }
  };

  // Request Push Notification Permission
  const handleRequestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationStatus(permission);
        if (permission === "granted") {
          toast.success("Notifications allowed", {
            description: "You have successfully enabled system notifications for Kei.",
          });
        } else if (permission === "denied") {
          toast.error("Notifications blocked", {
            description:
              "Notifications are blocked. Please reset site permissions in your browser settings to enable.",
          });
        }
      } catch (err) {
        console.error("Failed to request notification permission:", err);
      }
    }
  };

  // Check for new PWA app versions
  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true);
    toast.promise(
      async () => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
          throw new Error("PWA is not supported on this browser.");
        }
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) {
          throw new Error("No service worker found. Refresh the page or try again.");
        }

        await reg.update();

        // Allow update lifecycle to transition
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (reg.installing || reg.waiting) {
          return "New version found! Reloading page to apply changes...";
        }
        return "Your application is fully up to date!";
      },
      {
        loading: "Checking for updates...",
        success: (msg) => {
          setIsCheckingUpdates(false);
          if (msg.includes("Reloading")) {
            setTimeout(() => window.location.reload(), 1500);
          }
          return msg;
        },
        error: (err) => {
          setIsCheckingUpdates(false);
          return err instanceof Error ? err.message : "Failed to query update server.";
        },
      }
    );
  };

  if (!isOpen) {
    return (
      <div className="flex justify-start pt-2">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="bg-background hover:bg-muted border-border/50 text-foreground animate-in fade-in zoom-in-95 h-10 gap-2 rounded-xl px-5 text-xs font-bold tracking-widest uppercase transition-all duration-300"
        >
          <Activity className="text-primary size-4" />
          <span>Reveal System Diagnostics</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-3 space-y-6 duration-300">
      {/* App Identity Banner */}
      <div className="from-primary/10 to-accent/10 border-border/40 flex flex-col items-start justify-between gap-4 rounded-2xl border bg-gradient-to-r p-6 md:flex-row md:items-center">
        <div className="flex w-full items-start gap-3 md:w-auto md:items-center">
          <div className="bg-primary/15 border-primary/25 shrink-0 rounded-xl border p-3 shadow-[0_0_12px_rgba(244,63,94,0.15)]">
            <Layers className="text-primary size-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-foreground text-base font-bold tracking-tight">
                Kei Productivity Engine
              </h4>
              {/* TODO: Remove manual versioning*/}
              <span className="bg-primary/20 text-primary border-primary/30 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
                v2.0.0
              </span>
            </div>
            <p className="text-muted-foreground/80 mt-0.5 text-xs leading-relaxed">
              Standalone Event-Sourced Local-First Productivity Space
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 md:w-auto md:flex-row md:items-center">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="bg-background hover:bg-muted border-border/50 text-foreground h-9 w-full gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all md:w-auto"
          >
            <Link to="https://github.com/kreozalabs/kei" target="_blank" rel="noopener noreferrer">
              <GitHub className="size-3.5 shrink-0" />
              <span>Source Code</span>
            </Link>
          </Button>

          <Button
            onClick={handleCheckUpdates}
            disabled={isCheckingUpdates}
            variant="outline"
            size="sm"
            className="bg-background hover:bg-muted border-border/50 text-foreground h-9 w-full gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all md:w-auto"
          >
            <RefreshCw className={cn("size-3.5 shrink-0", isCheckingUpdates && "animate-spin")} />
            <span>Check for Updates</span>
          </Button>

          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="hover:bg-muted/80 text-muted-foreground hover:text-foreground h-9 w-full rounded-xl px-3 text-xs font-semibold md:w-auto"
          >
            Hide
          </Button>
        </div>
      </div>

      {/* Stats and Telemetry Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Storage & Local Cache */}
        <TelemetryCard title="Storage & Cache" icon={<HardDrive className="size-4" />}>
          <TelemetryRow label="Location" value="Browser Origin Private File System (OPFS)" />
          <TelemetryRow
            label="Datastore Path"
            value={
              <span className="bg-muted/30 text-foreground rounded px-1.5 py-0.5 font-mono text-[11px]">
                /kei.sqlite3
              </span>
            }
          />

          {/* Storage Progress */}
          {storageStats && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Storage Allocated</span>
                <span className="text-foreground font-medium">
                  {storageStats.usedMb} MB /{" "}
                  {storageStats.totalMb > 1000
                    ? `${(storageStats.totalMb / 1024).toFixed(1)} GB`
                    : `${storageStats.totalMb} MB`}{" "}
                  ({storageStats.percent}%)
                </span>
              </div>
              <div className="bg-muted/30 h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${storageStats.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Persistence Status */}
          <TelemetryRow
            label="Hardened Persistence"
            borderTop
            value={
              <div className="flex items-center gap-2">
                {storageStats?.persisted ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-500">
                    <ShieldCheck className="size-3" />
                    <span>Protected</span>
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-500">
                      <ShieldAlert className="size-3" />
                      <span>Best Effort</span>
                    </span>
                    <Button
                      onClick={handleRequestPersistence}
                      disabled={isRequestingPersistence}
                      variant="ghost"
                      size="sm"
                      className="border-border bg-background hover:bg-muted text-foreground h-6 rounded-lg border px-2 text-[10px] font-bold uppercase"
                    >
                      Harden
                    </Button>
                  </div>
                )}
              </div>
            }
          />
        </TelemetryCard>

        {/* Database Telemetry */}
        <TelemetryCard title="Database Telemetry" icon={<Database className="size-4" />}>
          <TelemetryRow label="Database Engine" value="SQLite" />
          <TelemetryRow
            label="Total Logged Operations"
            value={dbStats ? dbStats.eventsCount.toLocaleString() : "Loading..."}
          />
          <TelemetryRow
            label="Derived Action Projections"
            value={dbStats ? dbStats.actionsCount.toLocaleString() : "Loading..."}
          />
          <TelemetryRow
            label="Database Age"
            borderTop
            value={dbStats ? dbStats.dbAge : "Loading..."}
          />
        </TelemetryCard>

        {/* Network & PWA Status */}
        <TelemetryCard title="Connectivity & PWA" icon={<Activity className="size-4" />}>
          {/* Online/Offline Status */}
          <TelemetryRow
            label="Network Status"
            value={
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    isOnline
                      ? "animate-pulse bg-emerald-500 shadow-[0_0_6px_#10b981]"
                      : "bg-zinc-500"
                  )}
                />
                <span className="text-foreground font-semibold">
                  {isOnline ? "Online" : "Offline Mode"}
                </span>
              </div>
            }
          />

          {/* Offline Readiness */}
          <TelemetryRow
            label="Offline Readiness"
            value={
              <div className="flex items-center gap-1.5">
                {isOfflineReady ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                    <Check className="size-3.5" />
                    <span>Ready</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground/70 flex items-center gap-1 text-[11px]">
                    <X className="size-3.5" />
                    <span>Pending activation</span>
                  </span>
                )}
              </div>
            }
          />

          {/* Service Worker Status */}
          <TelemetryRow
            label="Service Worker Status"
            value={isOfflineReady ? "Registered & Controlling Page" : "Registering..."}
          />

          {/* Target URL Origin */}
          <TelemetryRow
            label="Local Domain"
            borderTop
            value={typeof window !== "undefined" ? window.location.host : "localhost"}
          />
        </TelemetryCard>

        {/* Sync & Notifications */}
        <TelemetryCard title="Sync & Alerts" icon={<Bell className="size-4" />}>
          {/* Sync Chain Status */}
          <TelemetryRow label="Sync Chain Link" value={connectionStatus} />

          {/* Connected Nodes */}
          <TelemetryRow
            label="Peering Nodes"
            value={connectedPeers ? `${connectedPeers.length} device(s)` : "0 device(s)"}
          />

          {/* System Notifications */}
          <TelemetryRow
            label="System Alerts"
            borderTop
            value={
              <div className="flex items-center gap-2">
                {notificationStatus === "granted" ? (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-500">
                    <Bell className="size-3" />
                    <span>Enabled</span>
                  </span>
                ) : notificationStatus === "denied" ? (
                  <span className="flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-500">
                    <BellOff className="size-3" />
                    <span>Blocked</span>
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-[11px]">Not configured</span>
                    <Button
                      onClick={handleRequestNotificationPermission}
                      variant="ghost"
                      size="sm"
                      className="border-border bg-background hover:bg-muted text-foreground h-6 rounded-lg border px-2 text-[10px] font-bold uppercase"
                    >
                      Enable
                    </Button>
                  </div>
                )}
              </div>
            }
          />
        </TelemetryCard>

        {/* Database Benchmark Diagnostics */}
        <TelemetryCard title="Database Diagnostics" icon={<Activity className="size-4" />}>
          <div className="flex flex-col space-y-3">
            <p className="text-muted-foreground/80 text-xs leading-relaxed">
              Measure local SQLite database query latency and write performance.
            </p>
            {benchmarkResult ? (
              <div className="border-border/30 space-y-2 border-t pt-2.5">
                <TelemetryRow
                  label="Single Write Latency"
                  value={
                    <span
                      className={cn(
                        "font-semibold",
                        benchmarkResult.writeTimeMs < 10 ? "text-emerald-500" : "text-amber-500"
                      )}
                    >
                      {benchmarkResult.writeTimeMs.toFixed(2)} ms
                    </span>
                  }
                />
                <TelemetryRow
                  label="Batch Write Latency (100 rows)"
                  value={
                    <span
                      className={cn(
                        "font-semibold",
                        benchmarkResult.batchWriteTimeMs < 20
                          ? "text-emerald-500"
                          : "text-amber-500"
                      )}
                    >
                      {benchmarkResult.batchWriteTimeMs.toFixed(2)} ms
                    </span>
                  }
                />
                <TelemetryRow
                  label="Read Query Latency"
                  value={
                    <span
                      className={cn(
                        "font-semibold",
                        benchmarkResult.readTimeMs < 5 ? "text-emerald-500" : "text-amber-500"
                      )}
                    >
                      {benchmarkResult.readTimeMs.toFixed(2)} ms
                    </span>
                  }
                />
              </div>
            ) : null}
            <div className="flex justify-end pt-1.5">
              <Button
                onClick={handleRunBenchmark}
                disabled={isBenchmarking}
                variant="outline"
                size="sm"
                className="bg-background hover:bg-muted text-foreground h-8 gap-1.5 rounded-xl text-xs font-semibold"
              >
                <RefreshCw className={cn("size-3.5", isBenchmarking && "animate-spin")} />
                {isBenchmarking ? "Running Benchmark..." : "Run Benchmark"}
              </Button>
            </div>
          </div>
        </TelemetryCard>
      </div>
    </div>
  );
}
