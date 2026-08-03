import { useSettings } from "@/providers/SettingsContext";
import { Activity, Sparkles } from "lucide-react";
import { SettingSection } from "../primitives/SettingSection";
import { SettingSelect } from "../primitives/SettingSelect";

const ANIMATION_OPTIONS = [
  { value: "smooth", label: "Smooth / Full" },
  { value: "reduced", label: "Reduced Motion" },
  { value: "off", label: "Off" },
];

export interface MotionSettingsProps {
  id?: string;
}

export function MotionSettings({ id }: MotionSettingsProps) {
  const { settings, updateSetting } = useSettings();

  return (
    <SettingSection
      id={id}
      title="Motion"
      description="Customize animation and transition behaviors."
      icon={<Sparkles className="size-4" />}
    >
      <SettingSelect
        label="Animations"
        description="Control screen transitions and visual interface motion."
        icon={<Activity className="size-4" />}
        value={settings.animations ?? "smooth"}
        onValueChange={(val) => updateSetting("animations", val as "smooth" | "reduced" | "off")}
        options={ANIMATION_OPTIONS}
        placeholder="Select animation preference..."
        groupLabel="Animations"
      />
    </SettingSection>
  );
}
