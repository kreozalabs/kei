export const EVENT_TYPES = {
  ACTION_INTENDED: "ACTION_INTENDED",
  ACTION_UPDATED: "ACTION_UPDATED",
  ACTION_COMPLETED: "ACTION_COMPLETED",
  ACTION_ACTIVATED: "ACTION_ACTIVATED",
  ACTION_ABANDONED: "ACTION_ABANDONED",
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
  { label: "Want to do", value: INTENTIONS.WANT, color: "text-pink-500" },
  { label: "Must do", value: INTENTIONS.MUST, color: "text-orange-500" },
];

export const DURATION_OPTIONS = [
  { label: "<15 mins", value: [0, 15] as [number, number] },
  { label: "15 mins", value: [15, 15] as [number, number] },
  { label: "15 - 30 mins", value: [15, 30] as [number, number] },
  { label: "30 - 60 mins", value: [30, 60] as [number, number] },
  { label: "1 - 2 hours", value: [60, 120] as [number, number] },
];
