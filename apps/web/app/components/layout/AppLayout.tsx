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
import { usePlugins } from "@/providers/PluginProvider";
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
  const { backgroundImage } = usePlugins();
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

  const blurClass = useMemo(() => {
    const px = backgroundImage.config.blurPx;
    if (px <= 0) return "blur-none";
    if (px <= 4) return "blur-xs";
    if (px <= 8) return "blur-sm";
    if (px <= 12) return "blur-md";
    return "blur-lg";
  }, [backgroundImage.config.blurPx]);

  const opacityClass = useMemo(() => {
    const op = backgroundImage.config.overlayOpacity;
    if (op <= 0.2) return "bg-background/20";
    if (op <= 0.45) return "bg-background/40";
    if (op <= 0.65) return "bg-background/55";
    if (op <= 0.8) return "bg-background/70";
    return "bg-background/85";
  }, [backgroundImage.config.overlayOpacity]);

  return (
    <HeaderPortalContext.Provider value={headerPortalRef}>
      <div className="text-foreground relative flex h-svh w-full flex-col overflow-hidden">
        {/* Background Image Plugin Layer */}
        {backgroundImage.enabled && backgroundImage.activeUrl ? (
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <img
              src={backgroundImage.activeUrl}
              alt=""
              className={cn("h-full w-full object-cover transition-all duration-700", blurClass)}
            />
            <div className={cn("absolute inset-0 transition-all duration-700", opacityClass)} />
          </div>
        ) : (
          <div className="bg-background fixed inset-0 -z-10" />
        )}

        {/* Global Top Header */}
        <header
          className={cn(
            "border-border/40 hidden h-16 w-full shrink-0 items-center justify-between border-b pr-6 pl-0 backdrop-blur-xl md:flex",
            backgroundImage.enabled && backgroundImage.activeUrl ? "bg-muted/40" : "bg-muted/95"
          )}
        >
          <div className="flex w-(--sidebar-width-icon) shrink-0 items-center justify-center">
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
                (settings.interface_behavior ?? "subtle_on_idle") === "subtle_on_idle"
                  ? "opacity-50 hover:opacity-100"
                  : "opacity-100"
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
          <SidebarInset
            className={cn(
              "relative flex min-w-0 flex-1 flex-col overflow-hidden pb-16 md:pb-0",
              backgroundImage.enabled && backgroundImage.activeUrl ? "bg-transparent" : "bg-background"
            )}
          >
            {/* Route Area */}
            <div className="h-full min-h-0 flex-1 overflow-hidden">
              {error ? (
                <div className="no-scrollbar h-full w-full overflow-y-auto p-6 md:p-8">
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
