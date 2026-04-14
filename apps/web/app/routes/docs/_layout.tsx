import { Outlet, useRouteError, isRouteErrorResponse } from "react-router";
import { ErrorPage } from "@/components/ErrorPage";

export default function DocsLayout() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <ErrorPage
      status={isRouteErrorResponse(error) ? error.status : 500}
      title={isRouteErrorResponse(error) ? error.statusText : "Docs Error"}
      homeLink="/docs"
      homeLabel="Return to Docs"
    />
  );
}
