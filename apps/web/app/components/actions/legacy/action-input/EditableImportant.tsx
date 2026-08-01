import { Star } from "lucide-react";
import { PropertyButton } from "./PropertyButton";
import { cn } from "@kreozalabs/kei-ui";

export function EditableImportant({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <PropertyButton
      icon={<Star className={cn("size-3.5", value && "fill-yellow-400 text-yellow-500")} />}
      label="Important"
      isActive={value}
      onClick={() => onChange(!value)}
      className={cn(
        value &&
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 hover:text-yellow-700"
      )}
    />
  );
}
