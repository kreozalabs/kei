import { TIME_FORMATS } from "../config/constants";

export type Theme = "dark" | "light" | "system";
export type Accent = "blue" | "indigo" | "violet" | "emerald" | "rose" | "amber" | "forest";
export type TimeFormat = (typeof TIME_FORMATS)[keyof typeof TIME_FORMATS];

export interface Settings {
  min_daily_actions: number;
  max_daily_actions: number;
  min_max_actions_enabled: boolean;
  section_expanded: boolean;
  theme: Theme;
  accent: Accent;
  today_locked: boolean;
  time_format: TimeFormat;
  timezone: string;
  distraction_free_mode: boolean;
  language: string;
  action_duration_options: { label: string; value: [number, number] }[];
  action_timezone_options: string[];
}

export type SettingKey = keyof Settings;
