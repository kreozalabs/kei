import { useSettings } from "@/providers/SettingsContext";
import {
  DATE_FORMATS,
  type DateFormatType,
  LANGUAGES,
  TIME_FORMATS,
  type TimeFormatType,
} from "@kreozalabs/kei-core";
import { Calendar, Clock, Globe, Languages } from "lucide-react";
import { SettingSection } from "../SettingSection";
import { SettingSelect } from "../SettingSelect";

// Local UI mapping
// TODO: Replace with i18n
const TIME_FORMAT_OPTIONS: { value: TimeFormatType; label: string }[] = [
  { value: TIME_FORMATS.H12, label: "4:00pm (12-hour)" },
  { value: TIME_FORMATS.H24, label: "16:00 (24-hour)" },
];

const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: LANGUAGES.AUTO, label: "Auto (System)" },
  { value: LANGUAGES.EN, label: "English (US)" },
];

const DATE_FORMAT_OPTIONS: { value: DateFormatType; label: string }[] = [
  { value: DATE_FORMATS.DDMMYYYY, label: "31/12/2000 (DD/MM/YYYY)" },
  { value: DATE_FORMATS.MMDDYYYY, label: "12/31/2000 (MM/DD/YYYY)" },
  { value: DATE_FORMATS.YYYYMMDD, label: "2000/12/31 (YYYY/MM/DD)" },
];

export function LocalizationSettings() {
  const { settings, updateSetting } = useSettings();

  return (
    <SettingSection
      title="Language and region"
      description="Customize display language, date, and time formatting preferences."
      icon={<Globe className="h-4 w-4" />}
    >
      <SettingSelect
        label="Language"
        description="Choose your preferred interface language"
        icon={<Languages className="h-4 w-4" />}
        value={settings.language}
        onValueChange={(val) => updateSetting("language", val)}
        options={LANGUAGE_OPTIONS}
        placeholder="Select a language"
        groupLabel="Languages"
      />
      <SettingSelect
        label="Date Format"
        description="Format used for displaying dates across the app"
        icon={<Calendar className="h-4 w-4" />}
        value={settings.date_format}
        onValueChange={(val) => updateSetting("date_format", val)}
        options={DATE_FORMAT_OPTIONS}
        placeholder="Select a date format"
        groupLabel="Date formats"
      />
      <SettingSelect
        label="Time Format"
        description="Choose between 12-hour and 24-hour time formats"
        icon={<Clock className="h-4 w-4" />}
        value={settings.time_format}
        onValueChange={(val) => updateSetting("time_format", val)}
        options={TIME_FORMAT_OPTIONS}
        placeholder="Select a time format"
        groupLabel="Time formats"
      />
    </SettingSection>
  );
}
