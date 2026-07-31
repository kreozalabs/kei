import * as React from "react";
import { Badge } from "@kreozalabs/kei-ui";
import { SettingRow, type SettingRowProps } from "./SettingRow";

export interface SettingBadgeProps extends Pick<
  SettingRowProps,
  "label" | "description" | "icon" | "layout" | "className" | "controlClassName"
> {
  value: string;
  variant?: React.ComponentProps<typeof Badge>["variant"];
  badgeClassName?: string;
}

export function SettingBadge({
  label,
  description,
  icon,
  layout = "row",
  className,
  controlClassName,
  value,
  variant = "secondary",
  badgeClassName = "border-primary/20 bg-primary/10 text-primary font-mono text-sm font-semibold",
}: SettingBadgeProps) {
  return (
    <SettingRow
      label={label}
      description={description}
      icon={icon}
      layout={layout}
      className={className}
      controlClassName={controlClassName}
    >
      <Badge variant={variant} className={badgeClassName}>
        {value}
      </Badge>
    </SettingRow>
  );
}
