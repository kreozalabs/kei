import { useRouteError } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { DbProvider } from "@/providers/DbProvider";
import { P2PProvider } from "@/providers/P2PProvider";

export default function AppDashboardLayout() {
  return (
    <DbProvider>
      <P2PProvider>
        <AppLayout />
      </P2PProvider>
    </DbProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <DbProvider showGuard={false}>
      <AppLayout error={error} />
    </DbProvider>
  );
}
