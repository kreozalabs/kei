import { useRouteError } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { DbProvider } from "@/providers/DbProvider";
import { P2PProvider } from "@/providers/P2PProvider";
import { PluginProvider } from "@/providers/PluginProvider";

export default function AppDashboardLayout() {
  return (
    <DbProvider>
      <P2PProvider>
        <PluginProvider>
          <AppLayout />
        </PluginProvider>
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
