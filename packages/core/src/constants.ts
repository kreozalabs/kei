export const GLOBAL_SETTINGS_ID = "00000000-0000-0000-0000-000000000000";

export const EVENT_TYPES = {
  ACTION_INTENDED: "ACTION_INTENDED",
  ACTION_UPDATED: "ACTION_UPDATED",
  ACTION_COMPLETED: "ACTION_COMPLETED",
  ACTION_ACTIVATED: "ACTION_ACTIVATED",
  ACTION_ABANDONED: "ACTION_ABANDONED",
  ACTION_DELETED: "ACTION_DELETED",
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

export const DATE_FORMATS = {
  SYSTEM: "system",
  DDMMYYYY: "ddmmyyyy",
  MMDDYYYY: "mmddyyyy",
  YYYYMMDD: "yyyymmdd",
} as const;

export const DATE_FORMAT_SEPARATORS = {
  DASH: "-",
  SLASH: "/",
  DOT: ".",
} as const;

export type DateFormatType = (typeof DATE_FORMATS)[keyof typeof DATE_FORMATS];
export type DateFormatSeparatorType =
  (typeof DATE_FORMAT_SEPARATORS)[keyof typeof DATE_FORMAT_SEPARATORS];

export const TIME_FORMATS = {
  SYSTEM: "system",
  H12: "12h",
  H24: "24h",
} as const;

export type TimeFormatType = (typeof TIME_FORMATS)[keyof typeof TIME_FORMATS];
export const TIME = {
  MINUTES_IN_DAY: 1440,
  MINUTES_IN_HOUR: 60,
  TIMELINE_DAYS: 30,
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

export const DURATION_OPTIONS: {
  label: string | null;
  value: [number, number];
  default: boolean;
}[] = [
  { label: null, value: [0, 0], default: true },
  { label: "<15 mins", value: [0, 15], default: false },
  { label: "15 mins", value: [15, 15], default: false },
  { label: "15 - 30 mins", value: [15, 30], default: false },
  { label: "30 - 60 mins", value: [30, 60], default: false },
  { label: "1 - 2 hours", value: [60, 120], default: false },
];

export const TIMEZONES = {
  SYSTEM: "system",
} as const;

export const MAJOR_TIMEZONES = [
  { value: "system", label: "System" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (New York)" },
  { value: "America/Chicago", label: "Central Time (Chicago)" },
  { value: "America/Denver", label: "Mountain Time (Denver)" },
  { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Asia/Almaty", label: "Almaty (UTC+5)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
] as const;

export const DEFAULT_SETTINGS = {
  section_expanded: true,
  theme: "system" as const,
  accent: "rose" as const,
  today_locked: true,
  date_format: DATE_FORMATS.SYSTEM,
  date_format_separator: DATE_FORMAT_SEPARATORS.SLASH,
  time_format: TIME_FORMATS.SYSTEM,
  timezone: "system",
  subtle_on_idle: true,
  language: "system",
  remember_layout_on_refresh: true,
  action_duration_options: DURATION_OPTIONS,
  action_timezone_options: MAJOR_TIMEZONES,
  default_energy: ENERGY_LEVELS.MEDIUM,
  default_intention: INTENTIONS.MUST,
  show_overdue: false,
  show_completed: true,
  show_abandoned: false,
  direct_edit_mode: false,
  enable_undo_toast: true,
  enable_selection: true,
  show_checkboxes_on_hover: false,
  default_insert_at_top: false,
  show_intentions: true,
  show_default_energy: false,
  animations: "smooth" as const,
};

export const STORAGE_KEYS = {
  SETTINGS: "kei-ui-settings",
  SESSION: {
    SECTION_EXPANDED: (id: string) => `kei-section-expanded-${id}`,
    TIMELINE_LOCKED: "kei-dashboard-timeline-locked",
  },
  LOCAL: {
    SELECTED_DATE: "kei-dashboard-selected-date",
  },
} as const;

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

export const LANGUAGES = {
  SYSTEM: "system",
  EN: "en",
  // DE: "de",
  // ES: "es",
  // RU: "ru",
} as const;

import type { Accent } from "./types/settings";

export const ACCENTS: { name: Accent; color: string; hover: string }[] = [
  { name: "blue", color: "bg-[#1e60f2]", hover: "hover:bg-[#1e60f2]" },
  { name: "indigo", color: "bg-[#818cf8]", hover: "hover:bg-[#818cf8]" },
  { name: "violet", color: "bg-[#a78bfa]", hover: "hover:bg-[#a78bfa]" },
  { name: "emerald", color: "bg-[#10b981]", hover: "hover:bg-[#10b981]" },
  { name: "rose", color: "bg-[#f43f5e]", hover: "hover:bg-[#f43f5e]" },
  { name: "amber", color: "bg-[#f59e0b]", hover: "hover:bg-[#f59e0b]" },
  { name: "forest", color: "bg-[#22c55e]", hover: "hover:bg-[#22c55e]" },
];

export const DISTRACTION_FREE_OPTIONS = [
  { label: "On", value: true },
  { label: "Off", value: false },
];

export const TIMELINE_VIEW_OPTIONS = [
  { label: "Locked (Today)", value: true },
  { label: "Unlocked (Full)", value: false },
];

export const SECTION_STATE_OPTIONS = [
  { label: "Expanded", value: true },
  { label: "Collapsed", value: false },
];

export const OVERDUE_ACTIONS_OPTIONS = [
  { label: "Expanded", value: true },
  { label: "Collapsed", value: false },
];

export const LAYOUT_PERSISTENCE_OPTIONS = [
  { label: "On", value: true },
  { label: "Off", value: false },
];

export const SHOW_ABANDONED_OPTIONS = [
  { label: "Show", value: true },
  { label: "Hide", value: false },
];

export const SHOW_COMPLETED_OPTIONS = [
  { label: "Show", value: true },
  { label: "Hide", value: false },
];

export const DIRECT_EDIT_OPTIONS = [
  { label: "Direct Edit", value: true },
  { label: "View Details", value: false },
];

export const UNDO_TOAST_OPTIONS = [
  { label: "Show", value: true },
  { label: "Hide", value: false },
];

export const SELECTION_OPTIONS = [
  { label: "On", value: true },
  { label: "Off", value: false },
];

export const SHOW_CHECKBOXES_ON_HOVER_OPTIONS = [
  { label: "On Hover", value: true },
  { label: "Mode Only", value: false },
];

export const DEFAULT_INSERT_AT_TOP_OPTIONS = [
  { label: "Top", value: true },
  { label: "Bottom", value: false },
];

export const SHOW_INTENTIONS_OPTIONS = [
  { label: "Show", value: true },
  { label: "Hide", value: false },
];

export const SHOW_DEFAULT_ENERGY_OPTIONS = [
  { label: "Show", value: true },
  { label: "Hide", value: false },
];
