import { APP_VERSION } from "@/config/version";
import { checkForUpdates } from "@/utils/pwa";
import { cn, toast } from "@kreozalabs/kei-ui";
import { CheckCircle2, RefreshCw, Sparkles, TagIcon } from "lucide-react";
import { useState } from "react";
import { SettingBadge } from "../primitives/SettingBadge";
import { SettingButton } from "../primitives/SettingButton";
import { SettingSection } from "../primitives/SettingSection";
import { SettingStatusBadge } from "../primitives/SettingStatusBadge";

export interface VersionSettingsProps {
  id?: string;
}

export const VersionSettings = ({ id }: VersionSettingsProps) => {
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true);
    toast.promise(checkForUpdates(), {
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
        return err instanceof Error ? err.message : "Failed to check update server.";
      },
    });
  };

  return (
    <SettingSection
      id={id}
      title="Version & Updates"
      description="View installed version details and check for the latest software releases."
      icon={<Sparkles className="size-4" />}
    >
      <SettingBadge
        label="Current Version"
        description="Installed version of Kei"
        icon={<TagIcon className="size-4" />}
        value={`v${APP_VERSION}`}
      />

      <SettingButton
        label="Software Updates"
        description="Check if a newer version or update is available"
        icon={<RefreshCw className="size-4" />}
        onClick={handleCheckUpdates}
        loading={isCheckingUpdates}
      >
        <RefreshCw
          className={cn(
            "text-muted-foreground size-3.5 shrink-0",
            isCheckingUpdates && "text-primary animate-spin"
          )}
        />
        <span>{isCheckingUpdates ? "Checking..." : "Check for Updates"}</span>
      </SettingButton>

      <SettingStatusBadge
        label="Update Channel"
        description="Automatic web and service worker update channel"
        icon={<CheckCircle2 className="size-4" />}
        statusLabel="Stable Channel"
        status="success"
      />
    </SettingSection>
  );
};
