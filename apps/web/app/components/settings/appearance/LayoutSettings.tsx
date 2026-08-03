import { useSettings } from "@/providers/SettingsContext";
import { Layout, RotateCcw } from "lucide-react";
import { SettingSection } from "../primitives/SettingSection";
import { SettingSwitch } from "../primitives/SettingSwitch";

export interface LayoutSettingsProps {
  id?: string;
}

export function LayoutSettings({ id }: LayoutSettingsProps) {
  const { settings, updateSetting } = useSettings();

  return (
    <SettingSection
      id={id}
      title="Layout"
      description="Customize default calendar views, sidebar position, and active widgets."
      icon={<Layout className="size-4" />}
    >
      <SettingSwitch
        label="Remember Layout on Refresh"
        description="Keep sections and view states as you left them when refreshing or reopening the app."
        icon={<RotateCcw className="size-4" />}
        value={settings.remember_layout_on_refresh ?? false}
        onValueChange={(val) => updateSetting("remember_layout_on_refresh", val)}
      />
    </SettingSection>
  );
}
