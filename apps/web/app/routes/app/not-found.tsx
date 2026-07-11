import { useEffect } from "react";
import { useOutletContext } from "react-router";
import { ErrorPage } from "@/components/ErrorPage";
import { AppHeader } from "@/components/layout/AppHeader";
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
    <div className="flex h-full w-full flex-col overflow-hidden">
      <AppHeader title="Error" />
      <div className="no-scrollbar flex-1 overflow-y-auto p-6 md:p-8">
        <ErrorPage status={404} homeLink="/app" homeLabel="Return to Dashboard" />
      </div>
    </div>
  );
}
