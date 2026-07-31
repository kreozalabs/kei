import * as React from "react";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@kreozalabs/kei-ui";

export interface SettingsSubPageLayoutProps {
  title: string;
  backTo?: string;
  backLabel?: string;
  children: React.ReactNode;
}

export function SettingsSubPageLayout({
  title,
  backTo = "/app/settings",
  backLabel = "Back to Settings",
  children,
}: SettingsSubPageLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(backTo);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-1 py-2 sm:px-2">
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground mb-1 -ml-2 gap-1.5"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {backLabel}
        </Button>

        <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      </div>

      {children}
    </div>
  );
}
