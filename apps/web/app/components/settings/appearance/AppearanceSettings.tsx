import { DisplaySettings } from "./DisplaySettings";
import { LayoutSettings } from "./LayoutSettings";
import { MotionSettings } from "./MotionSettings";
import { ResetFooter } from "./ResetFooter";
import { ThemeSettings } from "./ThemeSettings";
import { BackgroundImagePluginSettings } from "../plugins/BackgroundImagePluginSettings";
import { CustomFontPluginSettings } from "../plugins/CustomFontPluginSettings";

export function AppearanceSettings() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-1 py-2 sm:px-2">
      <ThemeSettings id="appearance-theme" />
      <BackgroundImagePluginSettings id="appearance-background" />
      <CustomFontPluginSettings id="appearance-font" />
      <MotionSettings id="appearance-motion" />
      <DisplaySettings id="appearance-display" />
      <LayoutSettings id="appearance-layout" />
      <ResetFooter id="appearance-reset" />
    </div>
  );
}
