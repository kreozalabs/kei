import { useEffect } from "react";
import { useLocation, useParams, Navigate } from "react-router";
import {
  findSubPageByPath,
  getBackNavigation,
  isRootSettingsSubPage,
  SETTINGS_BASE_PATH,
} from "@/components/settings/settingsSubPages";
import { SettingsSubPageLayout } from "@/components/settings/layout/SettingsSubPageLayout";

export default function DynamicSettingsSubpageRoute() {
  const location = useLocation();
  const params = useParams();
  const path = params["*"] || location.pathname;

  const subpageDef = findSubPageByPath(path);
  const backNav = getBackNavigation(subpageDef);

  useEffect(() => {
    if (subpageDef) {
      document.title = `Kei︱Settings - ${subpageDef.title}`;
    } else {
      document.title = "Kei︱Settings";
    }
  }, [subpageDef]);

  if (!subpageDef || isRootSettingsSubPage(subpageDef)) {
    return <Navigate to={SETTINGS_BASE_PATH} replace />;
  }

  const Component = subpageDef.component;

  return (
    <SettingsSubPageLayout
      title={subpageDef.title}
      backTo={backNav.backTo}
      backLabel={backNav.backLabel}
    >
      <Component />
    </SettingsSubPageLayout>
  );
}
