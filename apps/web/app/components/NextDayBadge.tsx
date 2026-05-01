import { cn } from "@kreozalabs/ui";
import { isNextDay } from "../utils/time";

interface NextDayBadgeProps {
  startTime?: string;
  endTime?: string;
  className?: string;
}

/**
 * Renders a small "+1" badge if the endTime falls on the next day relative to startTime.
 */
export function NextDayBadge({ startTime, endTime, className }: NextDayBadgeProps) {
  if (!startTime || !endTime || !isNextDay(startTime, endTime)) return null;

  return (
    <span
      className={cn(
        "text-[9px] text-primary bg-primary/10 px-1 rounded-sm font-black leading-none py-0.5",
        className
      )}
    >
      +1
    </span>
  );
}
