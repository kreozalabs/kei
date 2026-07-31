import * as React from "react";
import {
  Select,
  SelectLabel,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kreozalabs/kei-ui";
import { SettingRow, type SettingRowProps } from "./SettingRow";

export interface SettingSelectProps<T extends string> extends Pick<
  SettingRowProps,
  "label" | "description" | "icon" | "layout" | "className" | "controlClassName"
> {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  placeholder?: string;
  groupLabel?: string;
  id?: string;
}

export function SettingSelect<T extends string>({
  label,
  description,
  icon,
  layout = "row",
  className,
  controlClassName,
  value,
  onValueChange,
  options,
  placeholder,
  groupLabel,
  id,
}: SettingSelectProps<T>) {
  const generatedId = React.useId();
  const selectId = id || generatedId;

  return (
    <SettingRow
      label={label}
      htmlFor={selectId}
      description={description}
      icon={icon}
      layout={layout}
      className={className}
      controlClassName={controlClassName}
    >
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={selectId}
          aria-label={label}
          className="bg-background/80 border-border/60 hover:bg-background h-9 w-full shadow-xs transition-all"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {groupLabel && (
              <SelectLabel className="text-muted-foreground text-xs font-semibold">
                {groupLabel}
              </SelectLabel>
            )}
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs sm:text-sm">
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </SettingRow>
  );
}
