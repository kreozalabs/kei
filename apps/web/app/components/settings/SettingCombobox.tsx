import { SettingRow, type SettingRowProps } from "./SettingRow";
import { ComboboxSelect, type ComboboxSelectProps } from "./ComboboxSelect";

export interface SettingComboboxProps
  extends
    ComboboxSelectProps,
    Pick<
      SettingRowProps,
      "label" | "description" | "icon" | "layout" | "className" | "controlClassName"
    > {}

export function SettingCombobox({
  label,
  description,
  icon,
  layout = "row",
  className,
  controlClassName,
  align,
  ...comboboxProps
}: SettingComboboxProps) {
  const effectiveAlign = align ?? (layout === "column" ? "start" : "end");

  return (
    <SettingRow
      label={label}
      description={description}
      icon={icon}
      layout={layout}
      className={className}
      controlClassName={controlClassName}
    >
      <ComboboxSelect align={effectiveAlign} {...comboboxProps} />
    </SettingRow>
  );
}

export type { ComboboxOption, ComboboxGroup } from "./ComboboxSelect";
