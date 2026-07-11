import { Target } from "lucide-react";
import { EditableDropdown } from "./EditableDropdown";

export type IntentionType = "want" | "need" | "should" | "have" | "must";

const INTENTION_OPTIONS = [
  { value: "want", label: "Want to" },
  { value: "need", label: "Need to" },
  { value: "should", label: "Should" },
  { value: "have", label: "Have to" },
  { value: "must", label: "Must" },
] as const;

export function EditableIntention({
  value,
  onChange,
}: {
  value: IntentionType;
  onChange: (value: IntentionType) => void;
}) {
  return (
    <EditableDropdown
      value={value}
      options={[...INTENTION_OPTIONS]}
      onChange={onChange}
      icon={<Target className="size-3.5" />}
      placeholder="Intention"
    />
  );
}
