import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";

import { useEffect } from "react";
import { Button, Toaster, toast } from "@kreozalabs/ui";
import "./index.css";
import { QueryProvider } from "./providers/QueryProvider";
import { SettingsProvider } from "./providers/SettingsProvider";
import { DbProvider } from "./providers/DbProvider";
import { P2PProvider } from "./providers/P2PProvider";

import { ErrorPage } from "./components/ErrorPage";
import { STORAGE_KEYS } from "@kreozalabs/core";

export function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("virtual:pwa-register").then(({ registerSW }) => {
        registerSW({
          onOfflineReady() {
            toast.custom(
              (t) => (
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 shadow-lg w-80 md:w-96 text-left">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-foreground text-sm">Ready to work offline</h3>
                    <p className="text-xs text-muted-foreground">
                      Kei is now fully configured for offline capability and works perfectly without
                      internet connection!
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => toast.dismiss(t)}
                      className="rounded-xl px-4 py-1 text-xs"
                    >
                      OK
                    </Button>
                  </div>
                </div>
              ),
              {
                duration: Infinity,
              }
            );
          },
          onRegisteredSW(swUrl, r) {
            const intervalMS = 60 * 60 * 1000;
            if (r) {
              setInterval(async () => {
                if (r.installing || !navigator) return;

                if ("connection" in navigator && !navigator.onLine) return;

                try {
                  console.log("Checking for service worker updates...");
                  const resp = await fetch(swUrl, {
                    cache: "no-store",
                    headers: {
                      cache: "no-store",
                      "cache-control": "no-cache",
                    },
                  });

                  if (resp?.status === 200) {
                    await r.update();
                  }
                } catch (error) {
                  // handle fetch failure/network error gracefully (server is down)
                  console.error("Failed to check for service worker updates:", error);
                }
              }, intervalMS);
            }
          },
        });
      });
    }
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
              {children}
              <Toaster position="bottom-right" />
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
