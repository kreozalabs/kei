import { useState, useCallback, useMemo, useEffect } from "react";
import { Outlet, isRouteErrorResponse } from "react-router";
import { PlusIcon } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useFullscreen } from "@/hooks/useFullscreen";
import { SidebarToggle } from "./SidebarToggle";
import { Button, cn } from "@kreozalabs/ui";
import { AppSidebar } from "./AppSidebar";
import { AppHeader, HeaderSearch, HeaderNewAction, HeaderMore } from "./AppHeader";
import { MobileNav } from "./MobileNav";
import { ErrorPage } from "../ErrorPage";
import { ActionInputDialog } from "../ActionInputDialog";
import { SyncListener } from "../SyncListener";

export interface AppLayoutContext {
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string | undefined) => void;
  setOnFabClick: (fn: (() => void) | undefined) => void;
  setHeaderActions: (
    actions: { center?: React.ReactNode; right?: React.ReactNode } | undefined
  ) => void;
  openActionInput: () => void;
}

export function AppLayout({ error }: { error?: unknown }) {
  const [title, setTitle] = useState("Dashboard");
  const [subtitle, setSubtitle] = useState<string | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isActionInputOpen, setIsActionInputOpen] = useState(false);
  const [isDesktopAddMenuOpen, setIsDesktopAddMenuOpen] = useState(false);
  const [isMobileAddMenuOpen, setIsMobileAddMenuOpen] = useState(false);

  const defaultFabClick = useCallback(() => setIsMobileAddMenuOpen(true), []);
  const [onFabClick, setOnFabClick] = useState<(() => void) | undefined>(() => defaultFabClick);

  const [headerActions, setHeaderActions] = useState<
    { center?: React.ReactNode; right?: React.ReactNode } | undefined
  >();

  const openActionInput = useCallback(() => {
    setIsActionInputOpen(true);
  }, []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

  const { toggleFullscreen } = useFullscreen();

  // TODO: Add keyboard shortcut to open settings dialog/page.
  const shortcuts = useMemo(
    () => [
      {
        key: "b",
        ctrlOrMeta: true,
        handler: toggleSidebar,
        description: "Toggle Sidebar",
      },
      {
        key: "n",
        handler: openActionInput,
        description: "New Action",
      },
      {
        key: "k",
        ctrlOrMeta: true,
        handler: () => {
          console.log("Search shortcut triggered");
          // TODO: Implement actual search trigger (e.g., focus search input or open command palette)
        },
        description: "Search",
      },
      {
        key: "f",
        alt: true,
        handler: toggleFullscreen,
        description: "Toggle Fullscreen",
      },
    ],
    [toggleSidebar, openActionInput, toggleFullscreen]
  );

  useKeyboardShortcuts(shortcuts);

  const contextValue: AppLayoutContext = useMemo(
    () => ({
      setTitle,
      setSubtitle,
      setOnFabClick,
      setHeaderActions,
      openActionInput,
    }),
    [openActionInput]
  );

  useEffect(() => {
    document.title = `${title}${subtitle ? ` - ${subtitle}` : ""} - Kei`;
  }, [title, subtitle]);

  return (
    <div className="flex flex-col md:flex-row h-dvh w-full overflow-hidden bg-background md:bg-muted text-foreground">
      {/* Desktop Sidebar */}
      <AppSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-background">
        {/* Dimmed Overlay for Add Menu */}
        {(isDesktopAddMenuOpen || isMobileAddMenuOpen) && (
          <div
            className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm transition-all duration-500 animate-in fade-in"
            aria-hidden="true"
            onClick={() => {
              setIsDesktopAddMenuOpen(false);
              setIsMobileAddMenuOpen(false);
            }}
          />
        )}
        {/* Header */}
        <AppHeader
          title={title}
          subtitle={subtitle}
          left={
            <div
              className={cn(
                "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center overflow-hidden",
                isSidebarOpen ? "w-0 opacity-0 invisible" : "w-10 opacity-100 visible mr-2"
              )}
            >
              <SidebarToggle onClick={toggleSidebar} />
            </div>
          }
          center={
            headerActions?.center !== undefined ? (
              headerActions.center
            ) : (
              <div className="hidden md:block">
                <HeaderSearch />
              </div>
            )
          }
          right={
            headerActions?.right !== undefined ? (
              headerActions.right
            ) : (
              <div className="hidden md:flex items-center gap-8">
                {onFabClick === defaultFabClick ? (
                  <HeaderNewAction onClick={openActionInput} />
                ) : onFabClick ? (
                  <HeaderNewAction onClick={onFabClick} />
                ) : null}
                <div className="hidden md:flex items-center gap-1">
                  <HeaderMore />
                </div>
              </div>
            )
          }
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-12">
          <div className="w-full px-4 sm:px-8 md:px-12 pt-4 md:pt-10">
            <div className="max-w-3xl mx-auto">
              {error ? (
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
              ) : (
                <Outlet context={contextValue} />
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Button (Mobile only) */}
        {onFabClick === defaultFabClick ? (
          <Button
            onClick={openActionInput}
            className={cn(
              "md:hidden fixed bottom-24 right-6 size-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-95 z-50 group border-none shadow-primary/30"
            )}
            aria-label="Add Action"
          >
            <PlusIcon className="size-8 transition-transform duration-300 group-hover:rotate-90" />
          </Button>
        ) : onFabClick ? (
          <Button
            onClick={onFabClick}
            className="md:hidden fixed bottom-24 right-6 size-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 flex items-center justify-center transition-all active:scale-95 z-50 group border-none"
            aria-label="Add Action"
          >
            <PlusIcon className="size-8 group-hover:rotate-90 transition-transform duration-300" />
          </Button>
        ) : null}

        {/* Mobile Bottom Navigation */}
        <MobileNav />

        {/* Global Action Input Dialog */}
        <ActionInputDialog open={isActionInputOpen} onOpenChange={setIsActionInputOpen} />

        {/* Global Sync Listener */}
        <SyncListener />
      </main>
    </div>
  );
}
