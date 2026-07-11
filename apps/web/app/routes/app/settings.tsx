import { useEffect } from "react";
import { useOutletContext } from "react-router";
import type { AppLayoutContext } from "@/components/layout/AppLayout";
import { PersonalizationSettings } from "@/components/settings/PersonalizationSettings";
import { BehaviorSettings } from "@/components/settings/BehaviorSettings";
import { ActionsSettings } from "@/components/settings/ActionsSettings";
import { MaintenanceSettings } from "@/components/settings/MaintenanceSettings";
import { SystemSettings } from "@/components/settings/SystemSettings";

export default function Settings() {
  const { setTitle, setSubtitle, setHeaderActions } = useOutletContext<AppLayoutContext>();

  useEffect(() => {
    setTitle("Settings");
    setSubtitle("Manage your experience and preferences.");
    setHeaderActions({ center: null, right: null });

    return () => setHeaderActions(undefined);
  }, [setTitle, setSubtitle, setHeaderActions]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 flex flex-col space-y-12 duration-700">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">General Settings</h2>
        </div>
        <p className="text-muted-foreground/60 text-sm">
          Customize how Kei looks and feels for you.
        </p>
      </div>
      <div className="grid grid-cols-1 items-start gap-8">
        <div className="bg-card/50 border-border/40 group relative space-y-8 overflow-hidden rounded-4xl border p-8">
          <div className="relative">
            <h3 className="mb-8 text-lg font-bold tracking-tight">Personalization</h3>
            <PersonalizationSettings />
          </div>
        </div>

        <div className="bg-card/50 border-border/40 group relative space-y-8 overflow-hidden rounded-4xl border p-8">
          <div className="relative">
            <h3 className="mb-8 text-lg font-bold tracking-tight">Behavior</h3>
            <BehaviorSettings />
          </div>
        </div>

        <div className="bg-card/50 border-border/40 group relative space-y-8 overflow-hidden rounded-4xl border p-8">
          <div className="relative">
            <h3 className="mb-8 text-lg font-bold tracking-tight">Actions Configuration</h3>
            <ActionsSettings />
          </div>
        </div>

        <div className="bg-card/50 border-border/40 group relative space-y-8 overflow-hidden rounded-4xl border p-8">
          <div className="relative">
            <h3 className="mb-8 text-lg font-bold tracking-tight">Maintenance</h3>
            <MaintenanceSettings />
          </div>
        </div>
        <div className="bg-card/50 border-border/40 group relative space-y-8 overflow-hidden rounded-4xl border p-8">
          <div className="relative">
            <h3 className="mb-8 text-lg font-bold tracking-tight">System Settings</h3>
            <SystemSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
