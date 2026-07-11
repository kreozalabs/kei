import { Activity, CheckCircle2, XCircle } from "lucide-react";
import { EditableDropdown } from "./EditableDropdown";

export type StatusType = "active" | "completed" | "abandoned";

const STATUS_OPTIONS = [
  { value: "active", label: "Active", icon: <Activity className="size-3.5" /> },
  { value: "completed", label: "Completed", icon: <CheckCircle2 className="size-3.5" /> },
  { value: "abandoned", label: "Abandoned", icon: <XCircle className="size-3.5" /> },
] as const;

export function EditableStatus({
  value,
  onChange,
}: {
  value: StatusType;
  onChange: (value: StatusType) => void;
}) {
  return (
    <EditableDropdown
      value={value}
      options={[...STATUS_OPTIONS]}
      onChange={onChange}
      icon={<Activity className="size-3.5" />}
      placeholder="Status"
      isActive={value !== "active"}
    />
  );
}
