import * as React from "react";
import { Link } from "react-router";
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
  return (
    <div className="mx-auto max-w-4xl space-y-5 px-1 py-2 sm:px-2">
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground hover:text-foreground mb-1 -ml-2 gap-1.5"
        >
          <Link to={backTo}>
            <ChevronLeft className="size-4" />
            {backLabel}
          </Link>
        </Button>

        <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
      </div>

      {children}
    </div>
  );
}
