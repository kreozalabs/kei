import { useState, useCallback, useMemo } from "react";
import { Outlet, isRouteErrorResponse } from "react-router";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { Button, cn } from "@kreozalabs/kei-ui";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { ErrorPage } from "../ErrorPage";
import { useActionInputModal } from "@/providers/ActionInputModalContext";
import { SidebarToggle } from "./SidebarToggle";
import { FullscreenToggle } from "../FullscreenToggle";
import { useSettings } from "@/providers/SettingsContext";
import { useAppShortcuts } from "@/hooks/useAppShortcuts";
import { MobileFABProvider, useMobileFAB } from "@/components/MobileFAB";
import { useDb } from "@/providers/DbContext";
import { HeaderPortalContext } from "./HeaderPortalContext";

export interface AppLayoutContext {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openActionInput: () => void;
}

export function AppLayout({ error }: { error?: unknown }) {
  return (
    <MobileFABProvider>
      <AppLayoutContent error={error} />
    </MobileFABProvider>
  );
}

function AppLayoutContent({ error }: { error?: unknown }) {
  const { settings } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { openActionInput } = useActionInputModal();
  const { hasCustomFab } = useMobileFAB();
  const { isDbReady, isWriting } = useDb();
  const isLoading = !isDbReady || isWriting;
  const [headerPortalRef, setHeaderPortalRef] = useState<HTMLElement | null>(null);

  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

  // Register keyboard shortcuts for the application.
  useAppShortcuts({
    toggleSidebar,
  });

  const contextValue: AppLayoutContext = useMemo(
    () => ({
      isSidebarOpen,
      toggleSidebar,
      openActionInput,
    }),
    [isSidebarOpen, toggleSidebar, openActionInput]
  );

  return (
    <HeaderPortalContext.Provider value={headerPortalRef}>
      <div className="bg-background md:bg-muted text-foreground flex h-dvh w-full flex-col overflow-hidden">
        {/* Global Top Header - Desktop Only */}
        <header className="bg-muted/95 hidden h-20 w-full shrink-0 items-center justify-between px-6 pt-2 pb-1 backdrop-blur-xl md:flex">
          <div className="flex items-center gap-4">
            <SidebarToggle onClick={toggleSidebar} />
          </div>

          {/* Portal target container for page header content */}
          <div
            ref={setHeaderPortalRef}
            id="global-header-content"
            className="flex flex-1 items-center justify-between px-6"
          />

          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex items-center gap-1.5 transition-opacity",
                settings.subtle_on_idle ? "opacity-0 hover:opacity-100" : "opacity-100"
              )}
            >
              <FullscreenToggle
                size="icon"
                className="hover:bg-muted/80 text-muted-foreground/40 hover:text-foreground size-8 rounded-lg border-none transition-all active:scale-90"
              />
            </div>
          </div>
        </header>

        {/* Main Workspace below header */}
        <div className="flex flex-1 flex-row overflow-hidden">
          {/* Desktop Sidebar */}
          <AppSidebar isOpen={isSidebarOpen} />

          {/* Main Content Area */}
          <main className="bg-background relative flex min-w-0 flex-1 flex-col overflow-hidden">
            {/* Route Area - full height so that routes themselves manage layout, headers, and scroll areas */}
            <div className="flex-1 overflow-hidden">
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

            {/* Default Floating Action Button (Mobile only) */}
            {!hasCustomFab && (
              <Button
                onClick={() => openActionInput()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground group shadow-primary/30 fixed right-6 bottom-24 z-50 flex size-14 items-center justify-center rounded-2xl border-none shadow-2xl transition-all duration-300 active:scale-95 md:hidden"
                aria-label="Add Action"
              >
                <PlusIcon className="size-8 transition-transform duration-300 group-hover:rotate-90" />
              </Button>
            )}

            {/* Database Sync Status (Floating bottom-left) */}
            {isLoading && (
              <div className="bg-card/85 border-border/40 animate-in fade-in zoom-in-95 absolute bottom-24 left-6 z-50 flex size-14 items-center justify-center rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 md:bottom-6">
                <Loader2Icon className="text-muted-foreground/60 size-6 animate-spin" />
              </div>
            )}

            {/* Mobile Bottom Navigation */}
            <MobileNav />
          </main>
        </div>
      </div>
    </HeaderPortalContext.Provider>
  );
}
