import * as React from "react";
import { Label, cn } from "@kreozalabs/kei-ui";

export interface SettingRowProps {
  label?: string;
  description?: string;
  icon?: React.ReactNode;
  layout?: "row" | "column";
  className?: string;
  controlClassName?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function SettingRow({
  label,
  description,
  icon,
  layout = "row",
  className,
  controlClassName,
  children,
  onClick,
}: SettingRowProps) {
  if (layout === "column") {
    return (
      <div className={cn("space-y-1.5", className)} onClick={onClick}>
        {(label || icon) && (
          <div className="flex items-center gap-2">
            {icon && <div className="text-muted-foreground shrink-0">{icon}</div>}
            {label && (
              <Label
                className={cn("text-foreground text-sm font-medium", onClick && "cursor-pointer")}
              >
                {label}
              </Label>
            )}
          </div>
        )}
        <div className={controlClassName}>{children}</div>
        {description && (
          <p className="text-muted-foreground text-xs leading-normal">{description}</p>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "hover:bg-muted/30 flex flex-col justify-between gap-3 rounded-lg px-3 py-3.5 transition-colors sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-4",
        onClick && "cursor-pointer",
        className
      )}
    >
      {(label || description || icon) && (
        <div className="flex items-start gap-3">
          {icon && <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>}
          <div className="space-y-1">
            {label && (
              <Label
                className={cn(
                  "text-foreground text-sm leading-none font-medium",
                  onClick && "cursor-pointer"
                )}
              >
                {label}
              </Label>
            )}
            {description && (
              <p className="text-muted-foreground text-xs leading-normal">{description}</p>
            )}
          </div>
        </div>
      )}
      <div className={cn("w-full shrink-0 sm:w-80", controlClassName)}>{children}</div>
    </div>
  );
}
