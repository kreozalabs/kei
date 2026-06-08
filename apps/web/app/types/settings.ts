import { TIME_FORMATS } from "../config/constants";

export type Theme = "dark" | "light" | "system";
export type Accent = "blue" | "indigo" | "violet" | "emerald" | "rose" | "amber" | "forest";
export type TimeFormat = (typeof TIME_FORMATS)[keyof typeof TIME_FORMATS];

export interface Settings {
  section_expanded: boolean;
  theme: Theme;
  accent: Accent;
  today_locked: boolean;
  time_format: TimeFormat;
  timezone: string;
  subtle_on_idle: boolean;
  language: string;
  remember_layout_on_refresh: boolean;
  action_duration_options: { label: string; value: [number, number] }[];
  action_timezone_options: string[];
  default_energy: string;
  default_intention: string;
  show_overdue: boolean;
  show_completed: boolean;
  show_abandoned: boolean;
  direct_edit_mode: boolean;
  enable_undo_toast: boolean;
  enable_selection: boolean;
  default_insert_at_top: boolean;
  show_intentions: boolean;
  show_default_energy: boolean;
}

export type SettingKey = keyof Settings;
