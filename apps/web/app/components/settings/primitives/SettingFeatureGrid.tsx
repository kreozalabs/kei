import * as React from "react";
import { cn } from "@kreozalabs/kei-ui";
import { SettingRow, type SettingRowProps } from "./SettingRow";

export interface SettingFeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  colSpan?: "full" | 1 | 2;
}

export interface SettingFeatureGridProps extends Pick<
  SettingRowProps,
  "label" | "description" | "icon" | "className" | "controlClassName"
> {
  items: SettingFeatureItem[];
  columns?: 1 | 2;
}

export function SettingFeatureGrid({
  label,
  description,
  icon,
  className,
  controlClassName,
  items,
  columns = 2,
}: SettingFeatureGridProps) {
  return (
    <SettingRow
      label={label}
      description={description}
      icon={icon}
      layout="column"
      className={className}
      controlClassName={controlClassName}
    >
      <div className={cn("grid grid-cols-1 gap-2.5 pt-1", columns === 2 && "sm:grid-cols-2")}>
        {items.map((item, index) => {
          const isFullWidth = item.colSpan === "full" || item.colSpan === 2;
          return (
            <div
              key={item.title || index}
              className={cn(
                "border-border/40 bg-muted/20 flex items-start gap-2.5 rounded-lg border p-2.5",
                isFullWidth && "sm:col-span-2"
              )}
            >
              <div className="bg-primary/10 text-primary mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md">
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <span className="text-foreground text-sm font-semibold">{item.title}</span>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </SettingRow>
  );
}
