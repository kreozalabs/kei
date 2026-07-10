// FIXME: Refactor !
import { useState, useCallback, useMemo, useEffect } from "react";
import { Outlet, isRouteErrorResponse } from "react-router";
import { PlusIcon } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useFullscreen } from "@/hooks/useFullscreen";
import { SidebarToggle } from "./SidebarToggle";
import { Button, cn } from "@kreozalabs/kei-ui";
import { AppSidebar } from "./AppSidebar";
import { AppHeader, HeaderSearch, HeaderNewAction, HeaderMore } from "./AppHeader";
import { MobileNav } from "./MobileNav";
import { ErrorPage } from "../ErrorPage";
import { DragResizeWrapper } from "../DragResizeWrapper";
import { ActionInput } from "../action-input";
import { SyncListener } from "../SyncListener";
import { AnimatePresence } from "framer-motion";

export interface AppLayoutContext {
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string | undefined) => void;
  setOnFabClick: (fn: (() => void) | undefined) => void;
  setHeaderActions: (
    actions: { center?: React.ReactNode; right?: React.ReactNode } | undefined
  ) => void;
  openActionInput: () => void;
  setIsDocked: (isDocked: boolean) => void;
}

export function AppLayout({ error }: { error?: unknown }) {
  const [title, setTitle] = useState("Dashboard");
  const [subtitle, setSubtitle] = useState<string | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isActionInputOpen, setIsActionInputOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"floating" | "docked" | "drawer">("floating");
  const [isDocked, setIsDocked] = useState(false);
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
      setIsDocked,
    }),
    [openActionInput]
  );

  useEffect(() => {
    document.title = `${title}${subtitle ? ` - ${subtitle}` : ""} - Kei`;
  }, [title, subtitle]);

  return (
    <div className="bg-background md:bg-muted text-foreground flex h-dvh w-full flex-col overflow-hidden md:flex-row">
      {/* Desktop Sidebar */}
      {!isDocked && <AppSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />}

      {/* Dock Container for Portaled components */}
      <div
        id="dock-container"
        className="z-20 h-full flex-shrink-0 transition-all duration-300 empty:hidden"
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
        {/* Header */}
        <AppHeader
          title={title}
          subtitle={subtitle}
          left={
            isDocked ? null : (
              <div
                className={cn(
                  "flex items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  isSidebarOpen ? "invisible w-0 opacity-0" : "visible mr-2 w-10 opacity-100"
                )}
              >
                <SidebarToggle onClick={toggleSidebar} />
              </div>
            )
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
              <div className="hidden items-center gap-8 md:flex">
                {onFabClick === defaultFabClick ? (
                  <HeaderNewAction onClick={openActionInput} />
                ) : onFabClick ? (
                  <HeaderNewAction onClick={onFabClick} />
                ) : null}
                <div className="hidden items-center gap-1 md:flex">
                  <HeaderMore />
                </div>
              </div>
            )
          }
        />

        {/* Scrollable Content */}
        <div className="no-scrollbar flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="h-full w-full">
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
