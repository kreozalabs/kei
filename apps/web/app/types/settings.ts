// Settings are the application's current configuration preferences,
// representing runtime values that can be modified by the user
// (e.g., desired number of daily actions, theme preferences).

export interface Settings {
  min_daily_actions: number;
  max_daily_actions: number;
}

export type SettingKey = keyof Settings;
