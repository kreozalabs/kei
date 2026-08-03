import * as React from "react";
import { Check } from "lucide-react";
import { SettingRow, type SettingRowProps } from "./SettingRow";

export interface SettingBadgeGroupProps extends Pick<
  SettingRowProps,
  "label" | "description" | "icon" | "className" | "controlClassName"
> {
  items: string[];
  iconOverride?: React.ReactNode;
}

export function SettingBadgeGroup({
  label,
  description,
  icon,
  className,
  controlClassName,
  items,
  iconOverride,
}: SettingBadgeGroupProps) {
  return (
    <SettingRow
      label={label}
      description={description}
      icon={icon}
      layout="column"
      className={className}
      controlClassName={controlClassName}
    >
      <div className="flex flex-wrap gap-2 pt-1">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400"
          >
            {iconOverride || <Check className="size-3.5" />}
            <span>{item}</span>
          </div>
        ))}
      </div>
    </SettingRow>
  );
}
