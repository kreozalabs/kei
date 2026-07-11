// FIXME: Refactor !
import { useState, useCallback, useMemo } from "react";
import { Outlet, isRouteErrorResponse } from "react-router";
import { PlusIcon } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useFullscreen } from "@/hooks/useFullscreen";
import { Button, cn } from "@kreozalabs/kei-ui";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { ErrorPage } from "../ErrorPage";
import { DragResizeWrapper } from "../DragResizeWrapper";
import { ActionInput } from "../action-input";
import { SyncListener } from "../SyncListener";
import { AnimatePresence } from "framer-motion";

export interface AppLayoutContext {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openActionInput: () => void;
  setIsDocked: (isDocked: boolean) => void;
  isDocked: boolean;
  onFabClick?: () => void;
  setOnFabClick: (fn: (() => void) | undefined) => void;
}

export function AppLayout({ error }: { error?: unknown }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isActionInputOpen, setIsActionInputOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"floating" | "docked" | "drawer">("floating");
  const [isDocked, setIsDocked] = useState(false);
  const [isDesktopAddMenuOpen, setIsDesktopAddMenuOpen] = useState(false);
  const [isMobileAddMenuOpen, setIsMobileAddMenuOpen] = useState(false);

  const defaultFabClick = useCallback(() => setIsMobileAddMenuOpen(true), []);
  const [onFabClick, setOnFabClick] = useState<(() => void) | undefined>(() => defaultFabClick);

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
      isSidebarOpen,
      toggleSidebar,
      openActionInput,
      setIsDocked,
      isDocked,
      onFabClick,
      setOnFabClick,
    }),
    [isSidebarOpen, toggleSidebar, openActionInput, setIsDocked, isDocked, onFabClick]
  );

  return (
    <div className="bg-background md:bg-muted text-foreground flex h-dvh w-full flex-col overflow-hidden md:flex-row">
      {/* Desktop Sidebar */}
      {!isDocked && <AppSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />}

      {/* Dock Container for Portaled components */}
      <div
        id="dock-container"
        className="z-20 h-full shrink-0 transition-all duration-300 empty:hidden"
      />

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
              mode={editorMode}
              onModeChange={(newMode) => {
                setEditorMode(newMode);
                setIsDocked(newMode === "docked");
              }}
              onClose={() => {
                setIsActionInputOpen(false);
                setIsDocked(false);
                setEditorMode("floating");
              }}
            >
              <ActionInput
                onSuccess={() => {
                  setIsActionInputOpen(false);
                  setIsDocked(false);
                  setEditorMode("floating");
                }}
                onCancel={() => {
                  setIsActionInputOpen(false);
                  setIsDocked(false);
                  setEditorMode("floating");
                }}
              />
            </DragResizeWrapper>
          )}
        </AnimatePresence>

        {/* Global Sync Listener */}
        <SyncListener />
      </main>
    </div>
  );
}
