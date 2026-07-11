import { BatteryFull, BatteryLow, BatteryMedium } from "lucide-react";
import { EditableDropdown } from "./EditableDropdown";

type EnergyType = "low" | "medium" | "high";

const ENERGY_OPTIONS = [
  { value: "low", label: "Low", icon: <BatteryLow /> },
  { value: "medium", label: "Medium", icon: <BatteryMedium /> },
  { value: "high", label: "High", icon: <BatteryFull /> },
] as const;

export function EditableEnergy({
  value,
  onChange,
}: {
  value: EnergyType;
  onChange: (value: EnergyType) => void;
}) {
  return (
    <EditableDropdown
      value={value}
      options={[...ENERGY_OPTIONS]}
      onChange={onChange}
      icon={ENERGY_OPTIONS.find((option) => option.value === value)?.icon}
      placeholder="Energy"
    />
  );
}
