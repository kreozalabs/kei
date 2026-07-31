import * as React from "react";
import { SettingRow, type SettingRowProps } from "./SettingRow";
import { ComboboxSelect, type ComboboxSelectProps } from "./ComboboxSelect";

export interface SettingComboboxProps
  extends
    ComboboxSelectProps,
    Pick<
      SettingRowProps,
      "label" | "description" | "icon" | "layout" | "className" | "controlClassName"
    > {
  id?: string;
}

export function SettingCombobox({
  label,
  description,
  icon,
  layout = "row",
  className,
  controlClassName,
  align,
  id,
  ...comboboxProps
}: SettingComboboxProps) {
  const generatedId = React.useId();
  const comboboxId = id || generatedId;
  const effectiveAlign = align ?? (layout === "column" ? "start" : "end");

  return (
    <SettingRow
      label={label}
      htmlFor={comboboxId}
      description={description}
      icon={icon}
      layout={layout}
      className={className}
      controlClassName={controlClassName}
    >
      <ComboboxSelect
        id={comboboxId}
        aria-label={label}
        align={effectiveAlign}
        {...comboboxProps}
      />
    </SettingRow>
  );
}

export type { ComboboxOption, ComboboxGroup } from "./ComboboxSelect";
