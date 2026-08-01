import { useSettings } from "@/providers/SettingsContext";
import {
  INTERFACE_BEHAVIOR_OPTIONS,
  INTERFACE_DENSITY_OPTIONS,
  GRID_LINES_OPTIONS,
  type InterfaceBehavior,
  type InterfaceDensity,
  type GridLines,
} from "@kreozalabs/kei-core";
import { Grid, Maximize2, Minimize2, Monitor, PanelTop } from "lucide-react";
import { SettingSection } from "../primitives/SettingSection";
import { SettingSelect } from "../primitives/SettingSelect";
import { SettingSwitch } from "../primitives/SettingSwitch";

export interface DisplaySettingsProps {
  id?: string;
}

export function DisplaySettings({ id }: DisplaySettingsProps) {
  const { settings, updateSetting } = useSettings();

  return (
    <SettingSection
      id={id}
      title="Display"
      description="Customize interface density, toolbars & floating controls, minimal mode, and grid lines."
      icon={<Monitor className="size-4" />}
    >
      <SettingSwitch
        label="Minimal Mode"
        description="Hide setting card sub-descriptions for a compact, title-only layout."
        icon={<Minimize2 className="size-4" />}
        value={settings.minimal_mode ?? false}
        onValueChange={(val) => updateSetting("minimal_mode", val)}
      />

      <SettingSelect
        label="Toolbars & Floating Controls"
        description="Choose how headers, sidebars, and floating action buttons (FAB) behave when scrolling or idle."
        icon={<PanelTop className="size-4" />}
        value={settings.interface_behavior ?? "subtle_on_idle"}
        onValueChange={(val) => updateSetting("interface_behavior", val as InterfaceBehavior)}
        options={INTERFACE_BEHAVIOR_OPTIONS}
        placeholder="Select interface behavior..."
        groupLabel="Interface Behaviors"
      />

      <SettingSelect
        label="Interface Density"
        description="Adjust spacing and sizing across calendar views and lists."
        icon={<Maximize2 className="size-4" />}
        value={settings.interface_density ?? "comfortable"}
        onValueChange={(val) => updateSetting("interface_density", val as InterfaceDensity)}
        options={INTERFACE_DENSITY_OPTIONS}
        placeholder="Select interface density..."
        groupLabel="Interface Densities"
      />

      <SettingSelect
        label="Grid Lines"
        description="Control visibility and contrast of calendar grid lines."
        icon={<Grid className="size-4" />}
        value={settings.grid_lines ?? "subtle"}
        onValueChange={(val) => updateSetting("grid_lines", val as GridLines)}
        options={GRID_LINES_OPTIONS}
        placeholder="Select grid lines style..."
        groupLabel="Grid Line Styles"
      />
    </SettingSection>
  );
}
