import { useState, useCallback, useMemo } from "react";
import { Outlet, isRouteErrorResponse } from "react-router";
import { PlusIcon } from "lucide-react";
import { Button, cn } from "@kreozalabs/kei-ui";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { ErrorPage } from "../ErrorPage";
import { DragResizeWrapper } from "../DragResizeWrapper";
import { ActionInput } from "../action-input";
import { SyncListener } from "../SyncListener";
import { AnimatePresence } from "framer-motion";
import { SidebarToggle } from "./SidebarToggle";
import { FullscreenToggle } from "../FullscreenToggle";
import { useSettings } from "@/providers/SettingsContext";
import { useAppShortcuts } from "@/hooks/useAppShortcuts";

export interface AppLayoutContext {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openActionInput: () => void;
  onFabClick?: () => void;
  setOnFabClick: (fn: (() => void) | undefined) => void;
}

export function AppLayout({ error }: { error?: unknown }) {
  const { settings } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isActionInputOpen, setIsActionInputOpen] = useState(false);

  const [isDesktopAddMenuOpen, setIsDesktopAddMenuOpen] = useState(false);
  const [isMobileAddMenuOpen, setIsMobileAddMenuOpen] = useState(false);

  const openActionInput = useCallback(() => {
    setIsActionInputOpen(true);
  }, []);

  const defaultFabClick = useCallback(() => openActionInput(), [openActionInput]);
  const [onFabClick, setOnFabClick] = useState<(() => void) | undefined>(() => defaultFabClick);
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
      onFabClick,
      setOnFabClick,
    }),
    [isSidebarOpen, toggleSidebar, openActionInput, onFabClick]
  );

  return (
    <div className="bg-background md:bg-muted text-foreground flex h-dvh w-full flex-col overflow-hidden">
      {/* Global Top Header - Desktop Only */}
      <header className="bg-muted/95 hidden h-20 w-full shrink-0 items-center justify-between px-6 pt-2 pb-1 backdrop-blur-xl md:flex">
        <div className="flex items-center gap-4">
          <SidebarToggle onClick={toggleSidebar} />
        </div>

        {/* Portal target container for page header content */}
        <div id="global-header-content" className="flex flex-1 items-center justify-between px-6" />

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
          {/* Dimmed Overlay for Add Menu */}
          {(isDesktopAddMenuOpen || isMobileAddMenuOpen) && (
            <div
              className="bg-background/40 animate-in fade-in fixed inset-0 z-40 backdrop-blur-sm transition-all duration-500"
              aria-hidden="true"
              onClick={() => {
                setIsDesktopAddMenuOpen(false);
                setIsMobileAddMenuOpen(false);
              }}
            />
          )}

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

          {/* Floating Action Button (Mobile only) */}
          {onFabClick === defaultFabClick ? (
            <Button
              onClick={openActionInput}
              className={cn(
                "bg-primary hover:bg-primary/90 text-primary-foreground group shadow-primary/30 fixed right-6 bottom-24 z-50 flex size-14 items-center justify-center rounded-2xl border-none shadow-2xl transition-all duration-300 active:scale-95 md:hidden"
              )}
              aria-label="Add Action"
            >
              <PlusIcon className="size-8 transition-transform duration-300 group-hover:rotate-90" />
            </Button>
          ) : onFabClick ? (
            <Button
              onClick={onFabClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/30 group fixed right-6 bottom-24 z-50 flex size-14 items-center justify-center rounded-2xl border-none shadow-2xl transition-all active:scale-95 md:hidden"
              aria-label="Add Action"
            >
              <PlusIcon className="size-8 transition-transform duration-300 group-hover:rotate-90" />
            </Button>
          ) : null}

          {/* Mobile Bottom Navigation */}
          <MobileNav />

          {/* Global Action Input Dialog */}
          <AnimatePresence>
            {isActionInputOpen && (
              <DragResizeWrapper
                onClose={() => {
                  setIsActionInputOpen(false);
                }}
              >
                <ActionInput
                  onSuccess={() => {
                    setIsActionInputOpen(false);
                  }}
                  onCancel={() => {
                    setIsActionInputOpen(false);
                  }}
                />
              </DragResizeWrapper>
            )}
          </AnimatePresence>

          {/* Global Sync Listener */}
          <SyncListener />
        </main>
      </div>
    </div>
  );
}
