import { useEffect } from "react";
import { useOutletContext } from "react-router";
import { ErrorPage } from "@/components/ErrorPage";
import { AppPage } from "@/components/layout/AppPage";
import type { AppLayoutContext } from "@/components/layout/AppLayout";

export default function AppNotFound() {
  const context = useOutletContext<AppLayoutContext | null>();
  const setOnFabClick = context?.setOnFabClick;

  useEffect(() => {
    document.title = "Kei - Not Found";
    if (setOnFabClick) {
      setOnFabClick(undefined);
    }
  }, [setOnFabClick]);

  return (
    <AppPage title="Error" scrollable padded>
      <ErrorPage status={404} homeLink="/app" homeLabel="Return to Dashboard" />
    </AppPage>
  );
}
