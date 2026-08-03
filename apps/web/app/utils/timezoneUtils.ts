import { MAJOR_TIMEZONES } from "@kreozalabs/kei-core";

const RECENT_TIMEZONES_KEY = "kei_recent_timezones";
const EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days auto-clear

export interface RecentTzEntry {
  value: string;
  timestamp: number;
}

const TIMEZONE_LABEL_CACHE = new Map<string, string>();
const TIMEZONE_DETAILS_CACHE = new Map<string, { offset: string; name: string; city: string }>();

/**
 * Returns offset, long name, and city name for a given IANA timezone ID.
 */
// FIXME: How will it work when user's language is not English?
export function getTimezoneDetails(tz: string): { offset: string; name: string; city: string } {
  if (TIMEZONE_DETAILS_CACHE.has(tz)) return TIMEZONE_DETAILS_CACHE.get(tz)!;

  if (!tz || tz === "system") {
    return { offset: "", name: "System", city: "Auto-detect" };
  }

  const city = tz.split("/").pop()?.replace(/_/g, " ") || tz;

  let offset = "GMT+00:00";
  let name = "";

  try {
    const now = new Date();

    // Get Offset string
    const offsetFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const offsetParts = offsetFormatter.formatToParts(now);
    const tzOffsetVal = offsetParts.find((p) => p.type === "timeZoneName")?.value;

    if (tzOffsetVal) {
      if (tzOffsetVal === "GMT" || tzOffsetVal === "UTC") {
        offset = "GMT+00:00";
      } else {
        const match = tzOffsetVal.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
        if (match) {
          const sign = match[1];
          const hours = match[2].padStart(2, "0");
          const mins = match[3] ? match[3].padStart(2, "0") : "00";
          offset = `GMT${sign}${hours}:${mins}`;
        } else {
          offset = tzOffsetVal;
        }
      }
    }

    // Get Long Name
    const nameFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "long",
    });
    const nameParts = nameFormatter.formatToParts(now);
    const tzNameVal = nameParts.find((p) => p.type === "timeZoneName")?.value;

    if (
      tzNameVal &&
      !tzNameVal.startsWith("GMT") &&
      !tzNameVal.startsWith("UTC") &&
      !tzNameVal.includes("+") &&
      !tzNameVal.includes("-")
    ) {
      name = tzNameVal;
    }
  } catch {
    // fallback if timezone string is invalid
  }
  const result = { offset, name, city };
  TIMEZONE_DETAILS_CACHE.set(tz, result);
  return result;
}

/**
 * Formats a timezone ID into the standard display string:
 * e.g. "(GMT+02:00) Central European Time - Berlin"
 */
export function formatTimezoneLabel(tz: string): string {
  if (!tz || tz === "system") {
    return "System (Auto-detect)"; // TODO: Set current timezone?
  }

  if (TIMEZONE_LABEL_CACHE.has(tz)) {
    return TIMEZONE_LABEL_CACHE.get(tz)!;
  }

  const { offset, name, city } = getTimezoneDetails(tz);

  let formatted = "";
  if (name) {
    formatted = `(${offset}) ${name} - ${city}`;
  } else {
    formatted = `(${offset}) ${city}`;
  }

  TIMEZONE_LABEL_CACHE.set(tz, formatted);
  return formatted;
}

/**
 * Returns array of recent timezones saved on this device.
 * Automatically clears items older than 30 days.
 */
export function getRecentTimezones(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_TIMEZONES_KEY);
    if (!raw) return [];
    const parsed: RecentTzEntry[] = JSON.parse(raw);
    const now = Date.now();

    // Auto-clear entries older than 30 days
    const valid = parsed.filter(
      (item) => typeof item.timestamp === "number" && now - item.timestamp < EXPIRATION_MS
    );

    // If any expired items were filtered, update localStorage
    if (valid.length !== parsed.length) {
      localStorage.setItem(RECENT_TIMEZONES_KEY, JSON.stringify(valid));
    }

    return valid.map((item) => item.value);
  } catch {
    return [];
  }
}

/**
 * Adds a timezone to the recent history in localStorage.
 */
export function addRecentTimezone(tz: string): void {
  if (typeof window === "undefined" || !tz || tz === "system") return;
  try {
    const raw = localStorage.getItem(RECENT_TIMEZONES_KEY);
    let parsed: RecentTzEntry[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();

    // Auto-clear expired items
    parsed = parsed.filter((item) => now - item.timestamp < EXPIRATION_MS);

    // Remove duplicates
    parsed = parsed.filter((item) => item.value !== tz);

    // Prepend new entry
    parsed.unshift({ value: tz, timestamp: now });

    // Limit to 5 recent timezones
    if (parsed.length > 5) {
      parsed = parsed.slice(0, 5);
    }

    localStorage.setItem(RECENT_TIMEZONES_KEY, JSON.stringify(parsed));
  } catch {
    // ignore storage errors
  }
}

/**
 * Full list of IANA timezone IDs (cached).
 */
let ALL_IANA_TIMEZONES: string[] | null = null;

export function getAllIanaTimezones(): string[] {
  if (ALL_IANA_TIMEZONES) return ALL_IANA_TIMEZONES;

  let zones: string[] = [];
  try {
    if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
      zones = Intl.supportedValuesOf("timeZone");
    }
  } catch {
    // fallback if unsupported
  }

  if (!zones || zones.length === 0) {
    zones = MAJOR_TIMEZONES.map((zone) => zone.label); // FIXME: Gotta replace with something better?
  }

  ALL_IANA_TIMEZONES = zones;
  return zones;
}

function getOffsetVariants(offset: string): string[] {
  const variants = new Set<string>();
  if (!offset) return [];

  // Match e.g. GMT+05:00 or GMT-08:00
  const match = offset.match(/GMT([+-])(\d{1,2}):(\d{2})/i);
  if (match) {
    const sign = match[1];
    const hoursNum = parseInt(match[2], 10);
    const hoursPadded = hoursNum.toString().padStart(2, "0");
    const mins = match[3];

    const signedShort = `${sign}${hoursNum}`;
    const signedPadded = `${sign}${hoursPadded}`;

    variants.add(signedShort);
    variants.add(signedPadded);
    variants.add(`${signedShort}:${mins}`);
    variants.add(`${signedPadded}:${mins}`);

    variants.add(`utc${signedShort}`);
    variants.add(`utc${signedPadded}`);
    variants.add(`gmt${signedShort}`);
    variants.add(`gmt${signedPadded}`);
    variants.add(`utc${signedShort}:${mins}`);
    variants.add(`gmt${signedShort}:${mins}`);

    if (sign === "+") {
      variants.add(`${hoursNum}`);
      variants.add(hoursPadded);
      variants.add(`${hoursNum}:${mins}`);
      variants.add(`${hoursPadded}:${mins}`);
    }
  }

  return Array.from(variants);
}

export interface TimezoneOption {
  value: string;
  label: string;
  searchKey: string;
}

let TIMEZONE_OPTIONS_CACHE: TimezoneOption[] | null = null;

export function getTimezoneOptions(): TimezoneOption[] {
  if (TIMEZONE_OPTIONS_CACHE) return TIMEZONE_OPTIONS_CACHE;

  TIMEZONE_OPTIONS_CACHE = getAllIanaTimezones().map((tz) => {
    const details = getTimezoneDetails(tz);
    const label = formatTimezoneLabel(tz);
    const offsetVariants = getOffsetVariants(details.offset);

    const searchKey = [tz, details.city, details.name, details.offset, label, ...offsetVariants]
      .join(" ")
      .toLowerCase();

    return { value: tz, label, searchKey };
  });

  return TIMEZONE_OPTIONS_CACHE;
}
