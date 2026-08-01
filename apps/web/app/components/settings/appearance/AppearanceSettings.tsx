import { DisplaySettings } from "./DisplaySettings";
import { LayoutSettings } from "./LayoutSettings";
import { MotionSettings } from "./MotionSettings";
import { ResetFooter } from "./ResetFooter";
import { ThemeSettings } from "./ThemeSettings";

export function AppearanceSettings() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-1 py-2 sm:px-2">
      <ThemeSettings id="appearance-theme" />
      <MotionSettings id="appearance-motion" />
      <DisplaySettings id="appearance-display" />
      <LayoutSettings id="appearance-layout" />
      <ResetFooter id="appearance-reset" />
    </div>
  );
}
