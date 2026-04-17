import { useState, useCallback, useMemo } from "react";
import { Outlet, isRouteErrorResponse } from "react-router";
import { PlusIcon } from "lucide-react";
import { SidebarToggle } from "./SidebarToggle";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  cn
} from "@kreozalabs/ui";
import { AppSidebar } from "./AppSidebar";
import { AppHeader, HeaderSearch, HeaderNewAction, HeaderMore } from "./AppHeader";
import { MobileNav } from "./MobileNav";
import { ErrorPage } from "../ErrorPage";
import { ActionInput } from "../ActionInput";

export interface AppLayoutContext {
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string | undefined) => void;
  setOnFabClick: (fn: (() => void) | undefined) => void;
  setHeaderActions: (actions: { center?: React.ReactNode; right?: React.ReactNode } | undefined) => void;
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
  const [onFabClick, setOnFabClick] = useState<(() => void) | undefined>(
    () => defaultFabClick
  );
  
  const [headerActions, setHeaderActions] = useState<
    { center?: React.ReactNode; right?: React.ReactNode } | undefined
  >();

  const openActionInput = useCallback(() => {
    setIsDesktopAddMenuOpen(false);
    setIsMobileAddMenuOpen(false);
    setIsActionInputOpen(true);
  }, []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

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

  return (
    <div className="flex flex-col md:flex-row h-dvh w-full overflow-hidden bg-background md:bg-muted/10 text-foreground">
      {/* Desktop Sidebar */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        onAddAction={openActionInput}
      />

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
            <div className={cn(
              "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center overflow-hidden",
              isSidebarOpen ? "w-0 opacity-0 invisible" : "w-10 opacity-100 visible mr-2"
            )}>
              <SidebarToggle onClick={toggleSidebar} />
            </div>
          }
          center={
            headerActions?.center ?? (
              <div className="hidden md:block">
                <HeaderSearch />
              </div>
            )
          }
          right={
            headerActions?.right ?? (
              <div className="hidden md:flex items-center gap-8">
                {onFabClick === defaultFabClick ? (
                  <DropdownMenu open={isDesktopAddMenuOpen} onOpenChange={setIsDesktopAddMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <HeaderNewAction />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      side="bottom" 
                      sideOffset={12} 
                      className="w-64 z-50 rounded-[24px] p-2 border-border/10 bg-background/95 backdrop-blur-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                    >
                      <DropdownMenuItem onClick={openActionInput} className="gap-3 py-3 px-3 rounded-[16px] cursor-pointer transition-all hover:bg-muted/50 active:scale-[0.98]">
                        <div className="flex items-center justify-center size-9 rounded-full bg-primary/10 text-primary shrink-0 transition-transform group-hover:scale-110">
                          <PlusIcon className="size-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">New Task</span>
                          <span className="text-xs text-muted-foreground/60 leading-tight">Log a new task</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={openActionInput} className="gap-3 py-3 px-3 rounded-[16px] cursor-pointer transition-all hover:bg-muted/50 active:scale-[0.98]">
                        <div className="flex items-center justify-center size-9 rounded-full bg-blue-500/10 text-blue-500 shrink-0 transition-transform group-hover:scale-110">
                          <span className="text-lg">📝</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">New Note</span>
                          <span className="text-xs text-muted-foreground/60 leading-tight">Capture a thought</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={openActionInput} className="gap-3 py-3 px-3 rounded-[16px] cursor-pointer transition-all hover:bg-muted/50 active:scale-[0.98]">
                        <div className="flex items-center justify-center size-9 rounded-full bg-green-500/10 text-green-500 shrink-0 transition-transform group-hover:scale-110">
                          <span className="text-lg">🎯</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">New Goal</span>
                          <span className="text-xs text-muted-foreground/60 leading-tight">Set a new objective</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : onFabClick ? (
                  <HeaderNewAction onClick={onFabClick} />
                ) : null}
                <div className="hidden md:block">
                  <HeaderMore />
                </div>
              </div>
            )
          }
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-12">
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
          <DropdownMenu open={isMobileAddMenuOpen} onOpenChange={setIsMobileAddMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                className={cn(
                  "md:hidden fixed bottom-24 right-6 size-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-95 z-50 group border-none",
                  isMobileAddMenuOpen ? "shadow-none bg-primary" : "shadow-primary/30"
                )}
                aria-label="Add Action"
              >
                <PlusIcon className={cn("size-8 transition-transform duration-300", isMobileAddMenuOpen ? "rotate-45" : "group-hover:rotate-90")} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              side="top" 
              sideOffset={20} 
              className="z-50 bg-transparent border-none shadow-none p-0 flex flex-col items-end gap-3 min-w-0"
            >
              <DropdownMenuItem 
                onClick={openActionInput} 
                className="flex items-center gap-3 py-2 px-4 rounded-full bg-background/95 backdrop-blur-xl border border-border/40 shadow-xl cursor-pointer transition-all active:scale-95 focus:bg-background/95 ring-0 outline-none group"
              >
                <div className="flex items-center justify-center size-9 rounded-full bg-green-500/10 text-green-500 shrink-0 transition-transform group-hover:scale-110">
                  <span className="text-lg">🎯</span>
                </div>
                <span className="font-semibold text-sm pr-1">New Goal</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={openActionInput} 
                className="flex items-center gap-3 py-2 px-4 rounded-full bg-background/95 backdrop-blur-xl border border-border/40 shadow-xl cursor-pointer transition-all active:scale-95 focus:bg-background/95 ring-0 outline-none group"
              >
                <div className="flex items-center justify-center size-9 rounded-full bg-blue-500/10 text-blue-500 shrink-0 transition-transform group-hover:scale-110">
                  <span className="text-lg">📝</span>
                </div>
                <span className="font-semibold text-sm pr-1">New Note</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={openActionInput} 
                className="flex items-center gap-3 py-2 px-4 rounded-full bg-background/95 backdrop-blur-xl border border-border/40 shadow-xl cursor-pointer transition-all active:scale-95 focus:bg-background/95 ring-0 outline-none group"
              >
                <div className="flex items-center justify-center size-9 rounded-full bg-primary/10 text-primary shrink-0 transition-transform group-hover:scale-110">
                  <PlusIcon className="size-5" />
                </div>
                <span className="font-semibold text-sm pr-1">New Task</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <Dialog open={isActionInputOpen} onOpenChange={setIsActionInputOpen}>
          <DialogContent className="sm:max-w-lg p-0 bg-background border-none shadow-2xl">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle className="text-xl font-extrabold tracking-tight">New Action</DialogTitle>
              <DialogDescription className="sr-only">
                Capture your next high-impact move in the system.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <ActionInput onSuccess={() => setIsActionInputOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
