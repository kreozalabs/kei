import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useNavigate,
} from "react-router";

import { useEffect } from "react";
import { Toaster, TooltipProvider } from "@kreozalabs/kei-ui";
import "./index.css";
import { QueryProvider } from "./providers/QueryProvider";
import { SettingsProvider } from "./providers/SettingsProvider";
import { DbProvider } from "./providers/DbProvider";
import { P2PProvider } from "./providers/P2PProvider";

import { ErrorPage } from "./components/ErrorPage";
import { STORAGE_KEYS } from "@kreozalabs/kei-core";
import { registerPWA } from "./utils/pwa";
import { SyncListener } from "./components/SyncListener";
import { ActionInputModalProvider } from "./providers/ActionInputModalContext";
import { useHotkeys } from "react-hotkeys-hook";

export function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerPWA();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#18181b" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <DbProvider>
          <P2PProvider>
            <SettingsProvider storageKey={STORAGE_KEYS.SETTINGS}>
              <TooltipProvider delayDuration={800}>
                {children}
                <Toaster position="bottom-right" />
              </TooltipProvider>
            </SettingsProvider>
          </P2PProvider>
        </DbProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const navigate = useNavigate();

  // Navigation shortcuts
  useHotkeys("g>s>t", () => navigate("/app/settings"), { preventDefault: true });
  useHotkeys("g>d>t", () => navigate("/app/calendar/day"), { preventDefault: true });
  useHotkeys("g>w>t", () => navigate("/app/calendar/week"), { preventDefault: true });
  useHotkeys("g>c>t", () => navigate("/app/calendar/month"), { preventDefault: true });
  useHotkeys("g>y>t", () => navigate("/app/calendar/year"), { preventDefault: true });
  useHotkeys("g>i>t", () => navigate("/app/calendar/inbox"), { preventDefault: true });
  useHotkeys("g>t>t", () => navigate("/app/calendar/day"), { preventDefault: true });
  useHotkeys("g>a>t", () => navigate("/app/calendar/agenda"), { preventDefault: true });
  useHotkeys("g>l>t", () => navigate("/app/calendar/lists"), { preventDefault: true });

  // Other shortcuts
  useHotkeys("mod+k", () => console.log("Search..."), { preventDefault: true });

  return (
    <QueryProvider>
      <ActionInputModalProvider>
        <SyncListener />
        <Outlet />
      </ActionInputModalProvider>
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
        message={
          error.status === 404
            ? "The page you are looking for doesn't exist or has been moved."
            : undefined
        }
      />
    );
  }

  const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
  return <ErrorPage status={500} title="Application Error" message={errorMessage} />;
}
