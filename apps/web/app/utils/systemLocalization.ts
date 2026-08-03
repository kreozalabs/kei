import {
  TIME_FORMATS,
  DATE_FORMATS,
  TIMEZONES,
  LANGUAGES,
  type TimeFormatType,
  type DateFormatType,
} from "@kreozalabs/kei-core";

export const getSystemTimeFormat = (): typeof TIME_FORMATS.H12 | typeof TIME_FORMATS.H24 => {
  if (typeof window === "undefined") return TIME_FORMATS.H24;
  try {
    const hourCycle = new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions()
      .hourCycle;
    if (hourCycle === "h11" || hourCycle === "h12") return TIME_FORMATS.H12;
    if (hourCycle === "h23" || hourCycle === "h24") return TIME_FORMATS.H24;
    const testStr = new Intl.DateTimeFormat(undefined, { hour: "numeric" }).format(
      new Date(2026, 0, 1, 13, 0)
    );
    return testStr.includes("13") ? TIME_FORMATS.H24 : TIME_FORMATS.H12;
  } catch {
    return TIME_FORMATS.H24;
  }
};

export const getSystemDateFormat = (): DateFormatType => {
  if (typeof window === "undefined") return DATE_FORMATS.DDMMYYYY;
  try {
    const parts = new Intl.DateTimeFormat(undefined).formatToParts(new Date(2000, 11, 31));
    const firstPart = parts.find(
      (p) => p.type === "day" || p.type === "month" || p.type === "year"
    )?.type;
    if (firstPart === "year") return DATE_FORMATS.YYYYMMDD;
    if (firstPart === "month") return DATE_FORMATS.MMDDYYYY;
    return DATE_FORMATS.DDMMYYYY;
  } catch {
    return DATE_FORMATS.DDMMYYYY;
  }
};

export const getSystemLanguage = (): string => {
  if (typeof window === "undefined") return "en";
  return navigator.language || "en";
};

export const getSystemTimezone = (): string => {
  if (typeof window === "undefined") return "UTC";
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
};

export const getEffectiveTimeFormat = (format: TimeFormatType) => {
  if (format === TIME_FORMATS.SYSTEM) {
    return getSystemTimeFormat();
  }
  return format;
};

export const getEffectiveDateFormat = (format: DateFormatType) => {
  if (format === DATE_FORMATS.SYSTEM) {
    return getSystemDateFormat();
  }
  return format;
};

export const getEffectiveLanguage = (lang: string) => {
  if (lang === LANGUAGES.SYSTEM) {
    return getSystemLanguage();
  }
  return lang;
};

export const getEffectiveTimezone = (tz: string) => {
  if (tz === TIMEZONES.SYSTEM) {
    return getSystemTimezone();
  }
  return tz;
};

/**
 * Formats a date using the effective date format, timezone, and language preferences.
 * Uses formatToParts to guarantee exact field ordering (DD/MM/YYYY, MM/DD/YYYY, YYYY/MM/DD).
 */
export const formatDate = (
  date: Date | string | number,
  rawDateFormat: DateFormatType = DATE_FORMATS.SYSTEM,
  rawTimezone: string = TIMEZONES.SYSTEM,
  rawLanguage: string = LANGUAGES.SYSTEM
): string => {
  if (!date) return "";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const dateFormat = getEffectiveDateFormat(rawDateFormat);
  const timeZone = getEffectiveTimezone(rawTimezone);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(d);
  const year = parts.find((p) => p.type === "year")?.value || "";
  const month = parts.find((p) => p.type === "month")?.value || "";
  const day = parts.find((p) => p.type === "day")?.value || "";

  switch (dateFormat) {
    case DATE_FORMATS.DDMMYYYY:
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case DATE_FORMATS.MMDDYYYY:
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case DATE_FORMATS.YYYYMMDD:
    case "YYYY/MM/DD":
      return `${year}/${month}/${day}`;
    default: {
      const lang = getEffectiveLanguage(rawLanguage);
      return new Intl.DateTimeFormat(lang, {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);
    }
  }
};

/**
 * Formats a time string ("HH:mm") or Date object into 12-hour ("1:30pm") or 24-hour ("13:30") format
 * based on user settings and target timezone.
 */
export const formatTimeValue = (
  time: Date | string | number,
  rawTimeFormat: TimeFormatType = TIME_FORMATS.SYSTEM,
  rawTimezone: string = TIMEZONES.SYSTEM,
  rawLanguage: string = LANGUAGES.SYSTEM
): string => {
  if (!time && time !== 0) return "";
  const timeFormat = getEffectiveTimeFormat(rawTimeFormat);
  const is12Hour = timeFormat === TIME_FORMATS.H12;

  // Handle "HH:mm" time string format (e.g., "13:30" or "09:15")
  if (typeof time === "string" && /^\d{1,2}:\d{2}$/.test(time.trim())) {
    const [hStr, mStr] = time.trim().split(":");
    const h = parseInt(hStr, 10);
    if (is12Hour) {
      const ampm = h >= 12 ? "pm" : "am";
      const displayH = h % 12 || 12;
      return `${displayH}:${mStr}${ampm}`;
    }
    return `${hStr.padStart(2, "0")}:${mStr}`;
  }

  const d = typeof time === "string" || typeof time === "number" ? new Date(time) : time;
  if (isNaN(d.getTime())) return String(time);

  const timeZone = getEffectiveTimezone(rawTimezone);
  const lang = getEffectiveLanguage(rawLanguage);

  return new Intl.DateTimeFormat(lang, {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: is12Hour,
  }).format(d);
};

/**
 * Formats duration range in minutes into human-readable localized unit strings (e.g., "15 mins", "1 hr", "2 hrs")
 * using standard web-based Intl.NumberFormat.
 */
export const formatDurationValue = (
  min: number,
  max: number | null,
  rawLanguage: string = LANGUAGES.SYSTEM
): string => {
  const lang = getEffectiveLanguage(rawLanguage);

  const formatSingle = (m: number) => {
    if (m === 0) {
      return new Intl.NumberFormat(lang, {
        style: "unit",
        unit: "minute",
        unitDisplay: "short",
      }).format(0);
    }
    if (m % 60 === 0) {
      return new Intl.NumberFormat(lang, {
        style: "unit",
        unit: "hour",
        unitDisplay: "short",
      }).format(m / 60);
    }
    return new Intl.NumberFormat(lang, {
      style: "unit",
      unit: "minute",
      unitDisplay: "short",
    }).format(m);
  };

  if (max === null || min === max) {
    return formatSingle(min);
  }

  if (min % 60 === 0 && max % 60 === 0) {
    const minHrs = new Intl.NumberFormat(lang, {
      style: "unit",
      unit: "hour",
      unitDisplay: "short",
    }).format(min / 60);
    const maxHrs = new Intl.NumberFormat(lang, {
      style: "unit",
      unit: "hour",
      unitDisplay: "short",
    }).format(max / 60);
    return `${minHrs} - ${maxHrs}`;
  }

  return `${formatSingle(min)} - ${formatSingle(max)}`;
};
