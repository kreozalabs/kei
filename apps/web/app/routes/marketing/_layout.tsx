import { Outlet, useRouteError, isRouteErrorResponse } from "react-router";
import { ErrorPage } from "@/components/ErrorPage";

export default function MarketingLayout() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <ErrorPage
      status={isRouteErrorResponse(error) ? error.status : 500}
      title={isRouteErrorResponse(error) ? error.statusText : "Error"}
      homeLink="/"
      homeLabel="Return Home"
    />
  );
}
