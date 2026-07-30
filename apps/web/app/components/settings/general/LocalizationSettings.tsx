import { useSettings } from "@/providers/SettingsContext";
import {
  LANGUAGES,
  DATE_FORMATS,
  type DateFormatType,
  TIME_FORMATS,
  type TimeFormatType,
} from "@kreozalabs/kei-core";
import { Calendar, Clock, Globe, Languages, MapPin } from "lucide-react";
import { SettingSection } from "../SettingSection";
import { SettingSelect } from "../SettingSelect";
import { TimeZoneCombobox } from "../TimeZoneCombobox";

// Local UI mapping
// TODO: Replace with i18n
const TIME_FORMAT_OPTIONS: { value: TimeFormatType; label: string }[] = [
  { value: TIME_FORMATS.SYSTEM, label: "System" },
  { value: TIME_FORMATS.H12, label: "4:00pm" },
  { value: TIME_FORMATS.H24, label: "16:00" },
];

const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: LANGUAGES.SYSTEM, label: "System" },
  { value: LANGUAGES.EN, label: "English" },
];

const DATE_FORMAT_OPTIONS: { value: DateFormatType; label: string }[] = [
  { value: DATE_FORMATS.SYSTEM, label: "System" },
  { value: DATE_FORMATS.DDMMYYYY, label: "31/12/2000" },
  { value: DATE_FORMATS.MMDDYYYY, label: "12/31/2000" },
  { value: DATE_FORMATS.YYYYMMDD, label: "2000/12/31" },
];

export function LocalizationSettings() {
  const { settings, updateSetting } = useSettings();

  return (
    <SettingSection
      title="Language and region"
      description="Customize display language, time zone, date, and time formatting preferences."
      icon={<Globe className="size-4" />}
    >
      <SettingSelect
        label="Language"
        description="Choose your preferred interface language."
        icon={<Languages className="size-4" />}
        value={settings.language}
        onValueChange={(val) => updateSetting("language", val)}
        options={LANGUAGE_OPTIONS}
        placeholder="Select a language..."
        groupLabel="Languages"
      />
      <TimeZoneCombobox
        label="Time Zone"
        description="Set your primary time zone"
        icon={<MapPin className="size-4" />}
        value={settings.timezone}
        onValueChange={(val) => updateSetting("timezone", val)}
        placeholder="Select a time zone..."
        searchPlaceholder="Search city, region, or GMT offset..."
        emptyText="No time zones found."
      />
      <SettingSelect
        label="Date Format"
        description="Choose how dates are displayed throughout the application."
        icon={<Calendar className="size-4" />}
        value={settings.date_format}
        onValueChange={(val) => updateSetting("date_format", val)}
        options={DATE_FORMAT_OPTIONS}
        placeholder="Select a date format..."
        groupLabel="Date Formats"
      />
      <SettingSelect
        label="Time Format"
        description="Choose between 12-hour and 24-hour time display."
        icon={<Clock className="size-4" />}
        value={settings.time_format}
        onValueChange={(val) => updateSetting("time_format", val)}
        options={TIME_FORMAT_OPTIONS}
        placeholder="Select a time format..."
        groupLabel="Time Formats"
      />
    </SettingSection>
  );
}
