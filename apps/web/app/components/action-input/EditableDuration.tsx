import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger, Button } from "@kreozalabs/ui";
import { PropertyButton } from "./PropertyButton";
import { DurationInputs } from "./DurationInputs";
import { useState } from "react";

export function EditableDuration({
  value,
  onChange,
}: {
  value: [number, number | null];
  onChange: (value: [number, number | null]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftValue, setDraftValue] = useState<[number, number | null]>(value);

  const formatDuration = (val: [number, number | null]) => {
    if (val[0] === 0 && val[1] === null) return "Duration";
    if (val[1] === null || val[0] === val[1]) return `${val[0]}m`;
    return `${val[0]}-${val[1]}m`;
  };

  const handleSave = () => {
    onChange(draftValue);
    setIsOpen(false);
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) setDraftValue(value);
      }}
    >
      <PopoverTrigger asChild>
        <PropertyButton
          icon={<Clock className="size-3.5" />}
          label={formatDuration(value)}
          isActive={value[0] > 0 || value[1] !== null}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <DurationInputs value={draftValue} onChange={setDraftValue} />
        <div className="flex justify-end gap-2 mt-2 px-2 pb-2">
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
