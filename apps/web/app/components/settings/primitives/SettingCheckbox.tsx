import * as React from "react";
import { Checkbox, cn } from "@kreozalabs/kei-ui";
import { SettingRow, type SettingRowProps } from "./SettingRow";

export interface SettingCheckboxProps extends Pick<
  SettingRowProps,
  "label" | "description" | "icon" | "layout" | "className" | "controlClassName"
> {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
}

export function SettingCheckbox({
  label,
  description,
  icon,
  layout = "row",
  className,
  controlClassName,
  value,
  onValueChange,
  disabled = false,
  id,
  name,
}: SettingCheckboxProps) {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  const handleToggle = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <SettingRow
      label={label}
      htmlFor={checkboxId}
      description={description}
      icon={icon}
      layout={layout}
      className={cn(
        "select-none",
        disabled && "pointer-events-none cursor-not-allowed opacity-60",
        className
      )}
      controlClassName={cn("flex items-center justify-end sm:w-auto", controlClassName)}
      onClick={handleToggle}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          id={checkboxId}
          name={name}
          checked={value}
          onCheckedChange={onValueChange}
          disabled={disabled}
          aria-label={label}
          aria-labelledby={label ? `${checkboxId}-label` : undefined}
        />
      </div>
    </SettingRow>
  );
}
