import { useEffect } from "react";
import { useOutletContext } from "react-router";
import { ErrorPage } from "@/components/ErrorPage";
import type { AppLayoutContext } from "@/components/layout/AppLayout";

export default function AppNotFound() {
  const { setTitle, setSubtitle, setOnFabClick } = useOutletContext<AppLayoutContext>();

  useEffect(() => {
    setTitle("Error");
    setSubtitle(undefined);
    setOnFabClick(undefined);
  }, [setTitle, setSubtitle, setOnFabClick]);

  return <ErrorPage status={404} homeLink="/app" homeLabel="Return to Dashboard" />;
}
