import { useEffect } from "react";
import { useOutletContext } from "react-router";
import type { AppLayoutContext } from "@/components/layout/AppLayout";
import { PersonalizationSettings } from "@/components/settings/PersonalizationSettings";
import { BehaviorSettings } from "@/components/settings/BehaviorSettings";
import { ActionsSettings } from "@/components/settings/ActionsSettings";
import { MaintenanceSettings } from "@/components/settings/MaintenanceSettings";

export default function Settings() {
  const { setTitle, setSubtitle, setHeaderActions } = useOutletContext<AppLayoutContext>();

  useEffect(() => {
    setTitle("Settings");
    setSubtitle("Manage your experience and preferences.");
    setHeaderActions({ center: null, right: null });

    return () => setHeaderActions(undefined);
  }, [setTitle, setSubtitle, setHeaderActions]);

  return (
    <div className="flex flex-col space-y-12 animate-in fade-in slide-in-from-bottom-3 duration-700">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">General Settings</h2>
        </div>
        <p className="text-muted-foreground/60 text-sm">
          Customize how Kei looks and feels for you.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 items-start">
        <div className="bg-card/50 border border-border/40 rounded-4xl p-8 space-y-8 overflow-hidden relative group">
          <div className="relative">
            <h3 className="text-lg font-bold tracking-tight mb-8">Personalization</h3>
            <PersonalizationSettings />
          </div>
        </div>

        <div className="bg-card/50 border border-border/40 rounded-4xl p-8 space-y-8 overflow-hidden relative group">
          <div className="relative">
            <h3 className="text-lg font-bold tracking-tight mb-8">Behavior</h3>
            <BehaviorSettings />
          </div>
        </div>

        <div className="bg-card/50 border border-border/40 rounded-4xl p-8 space-y-8 overflow-hidden relative group">
          <div className="relative">
            <h3 className="text-lg font-bold tracking-tight mb-8">Actions Configuration</h3>
            <ActionsSettings />
          </div>
        </div>

        <div className="bg-card/50 border border-border/40 rounded-4xl p-8 space-y-8 overflow-hidden relative group">
          <div className="relative">
            <h3 className="text-lg font-bold tracking-tight mb-8">Maintenance</h3>
            <MaintenanceSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
