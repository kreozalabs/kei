import * as React from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

export interface SettingsLinkRowProps {
  title: string;
  description?: string;
  to: string;
  icon?: React.ReactNode;
}

export function SettingsLinkRow({
  title,
  description,
  to,
  icon,
}: SettingsLinkRowProps) {
  return (
    <Link
      to={to}
      className="hover:bg-muted/50 flex items-center justify-between rounded-lg p-4 transition-colors"
    >
      <div className="flex items-start gap-3">
        {icon}

        <div>
          <h3 className="font-medium">{title}</h3>

          {description && (
            <p className="text-muted-foreground text-sm">
              {description}
            </p>
          )}
        </div>
      </div>

      <ChevronRight className="text-muted-foreground size-4" />
    </Link>
  );
}
