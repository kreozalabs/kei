import { useEffect } from "react";
import { ErrorPage } from "@/components/ErrorPage";
import { AppPage } from "@/components/layout/AppPage";
import { MobileFAB } from "@/components/MobileFAB";

export default function AppNotFound() {
  useEffect(() => {
    document.title = "Kei - Not Found";
    if (typeof window !== "undefined") {
      console.log("[AppNotFound] 404 hit for path:", window.location.pathname);
    }
  }, []);

  return (
    <AppPage title="Error" scrollable padded>
      <MobileFAB className="hidden">{null}</MobileFAB>
      <ErrorPage status={404} homeLink="/app" homeLabel="Return to Dashboard" />
    </AppPage>
  );
}
