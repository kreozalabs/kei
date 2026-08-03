import { AboutSettings } from "@/components/settings/about/AboutSettings";
import { AppearanceSettings } from "@/components/settings/appearance/AppearanceSettings";
import { GeneralSettings } from "@/components/settings/general/GeneralSettings";
import { SettingsSubPageLayout } from "@/components/settings/layout/SettingsSubPageLayout";
import {
  SETTINGS_SUB_PAGES,
  ROOT_SETTINGS_SECTION_ID,
} from "@/components/settings/settingsSubPages";

const rootSubPage = SETTINGS_SUB_PAGES.find((p) => p.id === ROOT_SETTINGS_SECTION_ID);

export default function SettingsIndexRoute() {
  return (
    <div>
      <SettingsSubPageLayout title={rootSubPage?.title ?? "General"} showBack={false}>
        <GeneralSettings />
      </SettingsSubPageLayout>
      <SettingsSubPageLayout title="Appearance" showBack={false}>
        <AppearanceSettings />
      </SettingsSubPageLayout>
      <SettingsSubPageLayout title="About" showBack={false}>
        <AboutSettings />
      </SettingsSubPageLayout>
    </div>
  );
}
