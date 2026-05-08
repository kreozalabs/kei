export const GLOBAL_SETTINGS_ID = "00000000-0000-0000-0000-000000000000";

export const EVENT_TYPES = {
  ACTION_INTENDED: "ACTION_INTENDED",
  ACTION_UPDATED: "ACTION_UPDATED",
  ACTION_COMPLETED: "ACTION_COMPLETED",
  ACTION_ACTIVATED: "ACTION_ACTIVATED",
  ACTION_ABANDONED: "ACTION_ABANDONED",
  SETTING_UPDATED: "SETTING_UPDATED",
} as const;

export const ENERGY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export const INTENTIONS = {
  MUST: "must",
  WANT: "want",
} as const;

export const ACTION_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  ABANDONED: "abandoned",
} as const;

export const DEFAULT_CONFIG = {
  TITLE: "",
  DURATION: [15, 30] as [number, number],
  ENERGY: ENERGY_LEVELS.MEDIUM,
  INTENTION: INTENTIONS.WANT,
};

export const TIME_FORMATS = {
  H12: "12h",
  H24: "24h",
} as const;

export const TIME = {
  MINUTES_IN_DAY: 1440,
  MINUTES_IN_HOUR: 60,
};

export const ENERGY_OPTIONS = [
  {
    label: "Low energy",
    value: ENERGY_LEVELS.LOW,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    label: "Medium energy",
    value: ENERGY_LEVELS.MEDIUM,
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
  {
    label: "High energy",
    value: ENERGY_LEVELS.HIGH,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
  },
];

export const INTENTION_OPTIONS = [
  {
    label: "Want to do",
    value: INTENTIONS.WANT,
    color: "text-pink-500",
    bg: "bg-pink-500/5 border-pink-500/10",
  },
  {
    label: "Must do",
    value: INTENTIONS.MUST,
    color: "text-orange-500",
    bg: "bg-orange-500/5 border-orange-500/10",
  },
];

export const IMPORTANT_CONFIG = {
  active: {
    color: "text-amber-500",
    fill: "fill-amber-500",
    bg: "bg-amber-500/10",
  },
  inactive: {
    color: "text-muted-foreground/40",
    bg: "bg-muted/30",
  },
};

export const DURATION_OPTIONS = [
  { label: "<15 mins", value: [0, 15] as [number, number] },
  { label: "15 mins", value: [15, 15] as [number, number] },
  { label: "15 - 30 mins", value: [15, 30] as [number, number] },
  { label: "30 - 60 mins", value: [30, 60] as [number, number] },
  { label: "1 - 2 hours", value: [60, 120] as [number, number] },
];

export const MAJOR_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Dubai",
  "Australia/Sydney",
];

export const DEFAULT_SETTINGS = {
  min_daily_actions: 3,
  max_daily_actions: 6,
  min_max_actions_enabled: true,
  section_expanded: true,
  theme: "system" as const,
  accent: "rose" as const,
  today_locked: true,
  time_format: TIME_FORMATS.H24,
  timezone: "auto",
  subtle_on_idle: true,
  language: "auto",
  remember_layout_on_refresh: true,
  action_duration_options: DURATION_OPTIONS,
  action_timezone_options: MAJOR_TIMEZONES,
  default_energy: ENERGY_LEVELS.MEDIUM,
  default_intention: INTENTIONS.WANT,
  show_overdue: false,
};


export const STORAGE_KEYS = {
  SETTINGS: "kei-ui-settings",
  SESSION: {
    SECTION_EXPANDED: (id: string) => `kei-section-expanded-${id}`,
    TIMELINE_LOCKED: "kei-dashboard-timeline-locked",
  },
} as const;

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

export const LANGUAGES = {
  AUTO: "auto",
  EN: "en",
  // DE: "de",
  // ES: "es",
  // RU: "ru",
} as const;

import type { Accent } from "../types/settings";

export const ACCENTS: { name: Accent; color: string; hover: string }[] = [
  { name: "blue", color: "bg-[#1e60f2]", hover: "hover:bg-[#1e60f2]" },
  { name: "indigo", color: "bg-[#818cf8]", hover: "hover:bg-[#818cf8]" },
  { name: "violet", color: "bg-[#a78bfa]", hover: "hover:bg-[#a78bfa]" },
  { name: "emerald", color: "bg-[#10b981]", hover: "hover:bg-[#10b981]" },
  { name: "rose", color: "bg-[#f43f5e]", hover: "hover:bg-[#f43f5e]" },
  { name: "amber", color: "bg-[#f59e0b]", hover: "hover:bg-[#f59e0b]" },
  { name: "forest", color: "bg-[#22c55e]", hover: "hover:bg-[#22c55e]" },
];
