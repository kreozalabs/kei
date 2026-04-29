import { useRouteError } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";

export default function AppDashboardLayout() {
  return <AppLayout />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <AppLayout error={error} />;
}
