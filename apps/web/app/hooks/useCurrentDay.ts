import { useState, useEffect } from "react";

import { getTodayString } from "@kreozalabs/core";

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
