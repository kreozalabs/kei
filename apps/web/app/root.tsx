import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";

import { Toaster } from "sonner";
import "./index.css";
import { QueryProvider } from "./providers/QueryProvider";
import { SettingsProvider } from "./providers/SettingsProvider";
import { STORAGE_KEYS } from "./config/constants";
import { ErrorPage } from "./components/ErrorPage";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <SettingsProvider storageKey={STORAGE_KEYS.SETTINGS}>
          {children}
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              className: "rounded-2xl border-border bg-background text-foreground shadow-lg",
            }}
          />
        </SettingsProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <QueryProvider>
      <Outlet />
    </QueryProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <ErrorPage
        status={error.status}
        title={error.statusText}
        message={error.status === 404 ? "The page you are looking for doesn't exist or has been moved." : undefined}
      />
    );
  }

  const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
  return <ErrorPage status={500} title="Application Error" message={errorMessage} />;
}
