import { useSettings } from "@/providers/SettingsContext";
import { RotateCcw } from "lucide-react";
import { SettingButton } from "../primitives/SettingButton";
import { SettingSection } from "../primitives/SettingSection";

export interface ResetFooterProps {
  id?: string;
}

export function ResetFooter({ id }: ResetFooterProps) {
  const { resetCategory } = useSettings();

  const handleReset = () => {
    resetCategory("appearance");
  };

  return (
    <SettingSection
      id={id}
      title="Reset Appearance"
      description="Restore default appearance options and visual preferences."
      icon={<RotateCcw className="size-4" />}
    >
      <SettingButton
        label="Reset to Defaults"
        description="Reset appearance preferences to factory defaults."
        icon={<RotateCcw className="size-4" />}
        onClick={handleReset}
        buttonVariant="outline"
      >
        Reset Appearance
      </SettingButton>
    </SettingSection>
  );
}
