import { cn } from "@kreozalabs/ui";
import { isNextDay } from "@kreozalabs/core";

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
        "text-primary bg-primary/10 rounded-sm px-1 py-0.5 text-[9px] leading-none font-black",
        className
      )}
    >
      +1
    </span>
  );
}
