import { useSettings } from "@/providers/SettingsContext";
import { THEMES, ACCENTS, type Theme, type Accent } from "@kreozalabs/kei-core";
import { Palette, SunMoon } from "lucide-react";
import { SettingSection } from "../primitives/SettingSection";
import { SettingSelect } from "../primitives/SettingSelect";

// TODO: Localize texts!

const COLOR_MODE_OPTIONS: { value: Theme; label: string }[] = [
  { value: THEMES.SYSTEM, label: "System" },
  { value: THEMES.LIGHT, label: "Light" },
  { value: THEMES.DARK, label: "Dark" },
];

const ACCENT_OPTIONS: { value: Accent; label: string }[] = ACCENTS.map((acc) => ({
  value: acc.name,
  label: acc.name.charAt(0).toUpperCase() + acc.name.slice(1),
}));

export interface ThemeSettingsProps {
  id?: string;
}

export function ThemeSettings({ id }: ThemeSettingsProps) {
  const { settings, updateSetting } = useSettings();

  return (
    <SettingSection
      id={id}
      title="Theme"
      description="Customize color mode and visual theme accents."
      icon={<Palette className="size-4" />}
    >
      <SettingSelect
        label="Color Mode"
        description="Choose between light, dark, or system preference."
        icon={<SunMoon className="size-4" />}
        value={settings.theme}
        onValueChange={(val) => updateSetting("theme", val as Theme)}
        options={COLOR_MODE_OPTIONS}
        placeholder="Select color mode..."
        groupLabel="Color Modes"
      />
      <SettingSelect
        label="Accent Color"
        description="Choose your primary theme accent color."
        icon={<Palette className="size-4" />}
        value={settings.accent}
        onValueChange={(val) => updateSetting("accent", val as Accent)}
        options={ACCENT_OPTIONS}
        placeholder="Select accent color..."
        groupLabel="Accent Colors"
      />
    </SettingSection>
  );
}
