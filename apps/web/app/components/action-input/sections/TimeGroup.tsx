import { useState } from "react";
import { Calendar, Bell, Target } from "lucide-react";
import { EditableDuration } from "../EditableDuration";
import { PropertyButton } from "../PropertyButton";

export function TimeGroup() {
  const [duration, setDuration] = useState<[number, number | null]>([0, null]); // FIXME: Use TYPE
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-muted-foreground px-1 text-xs font-medium tracking-wider uppercase">
        Time & Scheduling
      </h4>
      <div className="flex flex-col gap-2">
        <EditableDuration value={duration} onChange={setDuration} />
        {/* Tooltip: Duration of the action. Use <key> in title or note to configure using keyboard. */}
        <PropertyButton icon={<Calendar className="size-3.5" />} label="Date & Time" />
        {/* Tooltip: Date and time of the action. Use <key> in title or note to configure using keyboard. */}
        <PropertyButton icon={<Target className="size-3.5" />} label="Deadline" />
        {/* Tooltip: Deadline for the action. Use <key> in title or note to configure using keyboard. */}
        <PropertyButton icon={<Bell className="size-3.5" />} label="Reminder" />
        {/* Tooltip: Reminder for the action. Use <key> in title or note to configure using keyboard. */}
      </div>
    </div>
  );
}
