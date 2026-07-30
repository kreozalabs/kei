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
