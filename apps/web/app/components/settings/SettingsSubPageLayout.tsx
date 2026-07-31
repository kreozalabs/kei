import * as React from "react";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@kreozalabs/kei-ui";
import { SETTINGS_BASE_PATH } from "./settingsSubPages";

export interface SettingsSubPageLayoutProps {
  title: string;
  backTo?: string;
  backLabel?: string;
  showBack?: boolean;
  children: React.ReactNode;
}

export function SettingsSubPageLayout({
  title,
  backTo = SETTINGS_BASE_PATH,
  backLabel = "Back to Settings",
  showBack = true,
  children,
}: SettingsSubPageLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(backTo);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-1 py-2 sm:px-2">
      <div className="space-y-1">
        {showBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground mb-1 -ml-2 gap-1.5"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            {backLabel}
          </Button>
        )}

        <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      </div>

      {children}
    </div>
  );
}
