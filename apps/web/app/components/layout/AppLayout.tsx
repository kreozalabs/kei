import { useState, useMemo } from "react";
import { Outlet, isRouteErrorResponse } from "react-router";
import { PlusIcon } from "lucide-react";
import { Button, cn, SidebarProvider, SidebarInset } from "@kreozalabs/kei-ui";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { ErrorPage } from "../ErrorPage";
import { useActionInputModal } from "@/providers/ActionInputModalContext";
import { SidebarToggle } from "./SidebarToggle";
import { FullscreenToggle } from "../FullscreenToggle";
import { useSettings } from "@/providers/SettingsContext";
import { MobileFABProvider, useMobileFAB } from "@/components/MobileFAB";
import { HeaderPortalContext } from "./HeaderPortalContext";
import { DbSyncStatus } from "./DbSyncStatus";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useHotkeys } from "react-hotkeys-hook";

export interface AppLayoutContext {
  openActionInput: () => void;
}

export function AppLayout({ error }: { error?: unknown }) {
  return (
    <SidebarProvider className="h-svh w-full overflow-hidden">
      <MobileFABProvider>
        <AppLayoutContent error={error} />
      </MobileFABProvider>
    </SidebarProvider>
  );
}

function AppLayoutContent({ error }: { error?: unknown }) {
  const { settings } = useSettings();
  const { openActionInput } = useActionInputModal();
  const { hasCustomFab } = useMobileFAB();
  const [headerPortalRef, setHeaderPortalRef] = useState<HTMLElement | null>(null);

  const { toggleFullscreen } = useFullscreen();

  useHotkeys("f", toggleFullscreen, { preventDefault: true });

  const contextValue: AppLayoutContext = useMemo(
    () => ({
      openActionInput,
    }),
    [openActionInput]
  );

  return (
    <HeaderPortalContext.Provider value={headerPortalRef}>
      <div className="bg-background text-foreground flex h-svh w-full flex-col overflow-hidden">
        {/* Global Top Header */}
        <header className="bg-muted/95 border-border/40 hidden h-16 w-full shrink-0 items-center justify-between border-b px-6 backdrop-blur-xl md:flex">
          <div className="flex items-center gap-4">
            <SidebarToggle />
          </div>

          {/* Portal target container for page header content */}
          <div
            ref={setHeaderPortalRef}
            id="global-header-content"
            className="flex flex-1 items-center justify-between px-4 md:px-6"
          />

          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex items-center gap-1.5 transition-opacity duration-300",
                settings.subtle_on_idle ? "opacity-50 hover:opacity-100" : "opacity-100"
              )}
            >
              <FullscreenToggle
                size="icon"
                className="hover:bg-muted/80 text-muted-foreground hover:text-foreground size-8 rounded-lg border-none transition-all active:scale-90"
              />
            </div>
          </div>
        </header>

        {/* Main Workspace below header */}
        <div className="flex flex-1 flex-row overflow-hidden">
          {/* AppSidebar */}
          <AppSidebar />

          {/* Main Content Area in SidebarInset */}
          <SidebarInset className="bg-background relative flex min-w-0 flex-1 flex-col overflow-hidden">
            {/* Route Area */}
            <div className="flex-1 h-full min-h-0 overflow-hidden">
              {error ? (
                <div className="no-scrollbar h-full w-full overflow-y-auto p-6 pb-24 md:p-8 md:pb-0">
                  <ErrorPage
                    status={isRouteErrorResponse(error) ? error.status : 500}
                    title={isRouteErrorResponse(error) ? error.statusText : "App Error"}
                    message={
                      isRouteErrorResponse(error)
                        ? error.status === 404
                          ? "The requested page was not found."
                          : "Something went wrong in the app."
                        : error instanceof Error
                          ? error.message
                          : "An unexpected error occurred."
                    }
                    homeLink="/app"
                    homeLabel="Return to Dashboard"
                  />
                </div>
              ) : (
                <Outlet context={contextValue} />
              )}
            </div>

            {/* Portal target container for mobile FAB */}
            <div id="mobile-fab-content" />

            {!hasCustomFab && (
              <Button
                onClick={() => openActionInput()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground group shadow-primary/30 fixed right-6 bottom-24 z-50 flex size-14 items-center justify-center rounded-2xl border-none shadow-2xl transition-all duration-300 active:scale-95 md:hidden"
                aria-label="Add Action"
              >
                <PlusIcon className="size-8 transition-transform duration-300 group-hover:rotate-90" />
              </Button>
            )}

            <DbSyncStatus />
            <MobileNav />
          </SidebarInset>
        </div>
      </div>
    </HeaderPortalContext.Provider>
  );
}
