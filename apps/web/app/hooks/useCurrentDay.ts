import { useState, useEffect } from "react";

import { getTodayString } from "@kreozalabs/kei-core";

/**
 * Returns the active day ISO key ("YYYY-MM-DD") used for database task queries.
 * Automatically triggers a React re-render when the user's system clock crosses midnight.
 *
 * Note: Use this for domain date filtering (e.g. action.scheduledDate === today).
 * For displaying formatted dates in UI elements, pass the value to `formatDate()` from `useLocalization()`.
 */
export function useCurrentDay() {
  const [today, setToday] = useState(getTodayString);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleUpdate = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);

      const timeToMidnight = nextMidnight.getTime() - now.getTime();

      timeoutId = setTimeout(() => {
        setToday(getTodayString());
        scheduleUpdate();
      }, timeToMidnight + 100); // Add a small buffer to ensure we've actually crossed midnight
    };

    scheduleUpdate();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return today;
}
