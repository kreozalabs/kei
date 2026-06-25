import { Zap } from "lucide-react";
import { EditableDropdown } from "./EditableDropdown";

export type EnergyType = "low" | "medium" | "high";

const ENERGY_OPTIONS = [
  { value: "low", label: "Low Energy" },
  { value: "medium", label: "Medium Energy" },
  { value: "high", label: "High Energy" },
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
      icon={<Zap className="size-3.5" />}
      placeholder="Energy"
    />
  );
}
