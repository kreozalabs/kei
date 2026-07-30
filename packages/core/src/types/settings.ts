import type { TimeFormatType, DateFormatType, DateFormatSeparatorType } from "../constants";

export type Theme = "dark" | "light" | "system";
export type Accent = "blue" | "indigo" | "violet" | "emerald" | "rose" | "amber" | "forest";
export interface Settings {
  section_expanded: boolean;
  theme: Theme;
  accent: Accent;
  today_locked: boolean;
  date_format: DateFormatType;
  date_format_separator: DateFormatSeparatorType;
  time_format: TimeFormatType;
  timezone: string;
  subtle_on_idle: boolean;
  language: string;
  remember_layout_on_refresh: boolean;
  action_duration_options: {
    label: string | null;
    value: [number, number];
    default: boolean;
  }[];
  action_timezone_options: string[];
  default_energy: string;
  default_intention: string;
  show_overdue: boolean;
  show_completed: boolean;
  show_abandoned: boolean;
  direct_edit_mode: boolean;
  enable_undo_toast: boolean;
  enable_selection: boolean;
  show_checkboxes_on_hover: boolean;
  default_insert_at_top: boolean;
  show_intentions: boolean;
  show_default_energy: boolean;
}

export type SettingKey = keyof Settings;
