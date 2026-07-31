import { useEffect } from "react";
import { useLocation, useParams, Navigate } from "react-router";
import { SettingsSubPageLayout } from "@/components/settings/SettingsSubPageLayout";
import { findSubPageByPath, getBackNavigation } from "@/components/settings/settingsSubPages";

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

  if (!subpageDef) {
    return <Navigate to="/app/settings" replace />;
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
