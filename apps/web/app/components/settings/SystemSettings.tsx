import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Button, cn } from "@kreozalabs/ui";
import { useP2P } from "@/providers/P2PProvider";
import { db } from "@/db";
import { toast } from "sonner";
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
  Github,
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

export function TelemetryCard({ title, icon, children, className }: TelemetryCardProps) {
  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-muted/10 border border-border/40 space-y-4 hover:border-border/60 transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <h4 className="text-xs font-bold uppercase tracking-wider">{title}</h4>
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

export function TelemetryRow({ label, value, borderTop }: TelemetryRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between text-xs",
        borderTop && "pt-1.5 border-t border-border/30"
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      {typeof value === "string" ? (
        <span className="font-semibold text-foreground">{value}</span>
      ) : (
        value
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
          className="rounded-xl h-10 px-5 bg-background hover:bg-muted border-border/50 text-foreground gap-2 transition-all text-xs font-bold uppercase tracking-widest animate-in fade-in zoom-in-95 duration-300"
        >
          <Activity className="size-4 text-primary" />
          <span>Reveal System Diagnostics</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-3 duration-300">
      {/* App Identity Banner */}
      <div className="bg-linear-to-r from-primary/10 to-accent/10 border border-border/40 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/15 rounded-xl border border-primary/25 shadow-[0_0_12px_rgba(244,63,94,0.15)]">
            <Layers className="size-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold tracking-tight text-foreground">
                Kei Productivity Engine
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/20 text-primary rounded-full border border-primary/30 uppercase tracking-widest">
                v1.1.0
              </span>
            </div>
            <p className="text-xs text-muted-foreground/80 mt-0.5 leading-relaxed">
              Standalone Event-Sourced Local-First Productivity Space
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 md:flex-none rounded-xl h-9 px-3 bg-background hover:bg-muted border-border/50 text-foreground gap-1.5 transition-all text-xs font-semibold"
          >
            <Link to="https://github.com/kreozalabs/kei" target="_blank" rel="noopener noreferrer">
              <Github className="size-3.5" />
              <span>Source Code</span>
            </Link>
          </Button>

          <Button
            onClick={handleCheckUpdates}
            disabled={isCheckingUpdates}
            variant="outline"
            size="sm"
            className="flex-1 md:flex-none rounded-xl h-9 px-3 bg-background hover:bg-muted border-border/50 text-foreground gap-1.5 transition-all text-xs font-semibold"
          >
            <RefreshCw className={cn("size-3.5", isCheckingUpdates && "animate-spin")} />
            <span>Check for Updates</span>
          </Button>

          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="flex-1 md:flex-none rounded-xl h-9 px-3 hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-semibold"
          >
            Hide
          </Button>
        </div>
      </div>

      {/* Stats and Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Storage & Local Cache */}
        <TelemetryCard title="Storage & Cache" icon={<HardDrive className="size-4" />}>
          <TelemetryRow label="Location" value="Browser Local (IndexedDB)" />
          <TelemetryRow
            label="Datastore Path"
            value={
              <span className="font-mono text-[11px] bg-muted/30 px-1.5 py-0.5 rounded text-foreground">
                idb://kei-db
              </span>
            }
          />

          {/* Storage Progress */}
          {storageStats && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Storage Allocated</span>
                <span className="font-medium text-foreground">
                  {storageStats.usedMb} MB /{" "}
                  {storageStats.totalMb > 1000
                    ? `${(storageStats.totalMb / 1024).toFixed(1)} GB`
                    : `${storageStats.totalMb} MB`}{" "}
                  ({storageStats.percent}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
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
                  <span className="flex items-center gap-1.5 text-emerald-500 font-semibold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="size-3" />
                    <span>Protected</span>
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1.5 text-amber-500 font-semibold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <ShieldAlert className="size-3" />
                      <span>Best Effort</span>
                    </span>
                    <Button
                      onClick={handleRequestPersistence}
                      disabled={isRequestingPersistence}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px] uppercase font-bold rounded-lg border border-border bg-background hover:bg-muted text-foreground"
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
          <TelemetryRow label="Database Engine" value="PGlite (Postgres WASM)" />
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
                      ? "bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse"
                      : "bg-zinc-500"
                  )}
                />
                <span className="font-semibold text-foreground">
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
                  <span className="flex items-center gap-1 text-emerald-500 font-semibold text-[11px]">
                    <Check className="size-3.5" />
                    <span>Ready</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground/70 text-[11px]">
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
                  <span className="flex items-center gap-1 text-emerald-500 font-semibold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Bell className="size-3" />
                    <span>Enabled</span>
                  </span>
                ) : notificationStatus === "denied" ? (
                  <span className="flex items-center gap-1 text-red-500 font-semibold text-[11px] bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
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
                      className="h-6 px-2 text-[10px] uppercase font-bold rounded-lg border border-border bg-background hover:bg-muted text-foreground"
                    >
                      Enable
                    </Button>
                  </div>
                )}
              </div>
            }
          />
        </TelemetryCard>
      </div>
    </div>
  );
}
