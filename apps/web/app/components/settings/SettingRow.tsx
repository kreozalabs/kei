import * as React from "react";
import { Label, cn } from "@kreozalabs/kei-ui";

export interface SettingRowProps {
  label?: string;
  htmlFor?: string;
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
  htmlFor,
  description,
  icon,
  layout = "row",
  className,
  controlClassName,
  children,
  onClick,
}: SettingRowProps) {
  const labelId = htmlFor ? `${htmlFor}-label` : undefined;

  if (layout === "column") {
    return (
      <div className={cn("space-y-1.5", className)} onClick={onClick}>
        {(label || icon) && (
          <div className="flex items-center gap-2">
            {icon && <div className="text-muted-foreground shrink-0">{icon}</div>}
            {label &&
              (htmlFor ? (
                <Label
                  id={labelId}
                  htmlFor={htmlFor}
                  className={cn("text-foreground cursor-pointer text-sm font-medium")}
                >
                  {label}
                </Label>
              ) : (
                <span
                  className={cn("text-foreground text-sm font-medium", onClick && "cursor-pointer")}
                >
                  {label}
                </span>
              ))}
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
            {label &&
              (htmlFor ? (
                <Label
                  id={labelId}
                  htmlFor={htmlFor}
                  className={cn("text-foreground cursor-pointer text-sm leading-none font-medium")}
                >
                  {label}
                </Label>
              ) : (
                <span
                  className={cn(
                    "text-foreground text-sm leading-none font-medium",
                    onClick && "cursor-pointer"
                  )}
                >
                  {label}
                </span>
              ))}
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
