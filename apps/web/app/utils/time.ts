export const timeToMinutes = (time24: string): number => {
  if (!time24) return 0;
  const [h, m] = time24.split(":").map(Number);
  return h * 60 + m;
};

export const minutesToTime = (totalMinutes: number): string => {
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalizedMinutes / 60);
  const m = normalizedMinutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

export const formatTime = (time24: string, format: "12h" | "24h") => {
  if (!time24) return "";
  if (format === "24h") return time24;
  const [h, m] = time24.split(":");
  const hours = parseInt(h, 10);
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${m}${ampm}`;
};

export const isNextDay = (startTime: string, endTime: string) => {
  if (!startTime || !endTime) return false;
  return timeToMinutes(endTime) < timeToMinutes(startTime);
};

export const getTodayString = () => new Date().toLocaleDateString("en-CA");

export const formatGoogleDate = (dateStr: string) => {
  if (!dateStr) return "Date";
  // We use dateStr + 'T12:00:00' to avoid timezone shift issues from "YYYY-MM-DD"
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
};

export const getTimeOptions = (format: "12h" | "24h") =>
  Array.from({ length: 96 }).map((_, i) => {
    const hours = Math.floor(i / 4);
    const minutes = (i % 4) * 15;
    const value = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    const label = formatTime(value, format);
    return { label, value };
  });

export const parseManualTime = (input: string): string | null => {
  const clean = input.trim().toLowerCase();
  if (!clean) return null;

  // Try HH:mm
  const hhmm = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    const h = parseInt(hhmm[1]);
    const m = parseInt(hhmm[2]);
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  // Try h am/pm
  const h_ampm = clean.match(/^(\d{1,2})\s*(am|pm)$/);
  if (h_ampm) {
    let h = parseInt(h_ampm[1]);
    const ampm = h_ampm[2];
    if (h >= 1 && h <= 12) {
      if (ampm === "pm" && h < 12) h += 12;
      if (ampm === "am" && h === 12) h = 0;
      return `${h.toString().padStart(2, "0")}:00`;
    }
  }

  // Try h:mm am/pm
  const hmm_ampm = clean.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
  if (hmm_ampm) {
    let h = parseInt(hmm_ampm[1]);
    const m = parseInt(hmm_ampm[2]);
    const ampm = hmm_ampm[3];
    if (h >= 1 && h <= 12 && m >= 0 && m < 60) {
      if (ampm === "pm" && h < 12) h += 12;
      if (ampm === "am" && h === 12) h = 0;
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  return null;
};

export const formatDuration = (min: number, max: number | null): string => {
  const formatSingle = (m: number) => {
    if (m === 0) return "0 mins";
    if (m % 60 === 0) {
      const hrs = m / 60;
      return `${hrs} ${hrs === 1 ? "hr" : "hrs"}`;
    }
    return `${m} mins`;
  };

  if (max === null || min === max) {
    return formatSingle(min);
  }

  // Handle common range cases
  if (min === 0) return `< ${formatSingle(max)}`;

  // If both are hours, format as hours
  if (min % 60 === 0 && max % 60 === 0) {
    return `${min / 60} - ${max / 60} hrs`;
  }

  return `${min} - ${max} mins`;
};
