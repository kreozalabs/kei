import { useState } from "react";
import { Outlet, isRouteErrorResponse } from "react-router";
import { PlusIcon } from "lucide-react";
import { Button } from "@kreozalabs/ui";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { MobileNav } from "./MobileNav";
import { MobileDrawer } from "./MobileDrawer";
import { ErrorPage } from "../ErrorPage";

export interface AppLayoutContext {
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string | undefined) => void;
  setOnFabClick: (fn: (() => void) | undefined) => void;
}

export function AppLayout({ error }: { error?: unknown }) {
  const [title, setTitle] = useState("Dashboard");
  const [subtitle, setSubtitle] = useState<string | undefined>();
  const [onFabClick, setOnFabClick] = useState<(() => void) | undefined>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const contextValue: AppLayoutContext = {
    setTitle,
    setSubtitle,
    setOnFabClick,
  };

  return (
    <div className="flex flex-col md:flex-row h-dvh w-full overflow-hidden bg-background md:bg-muted/10 text-foreground">
      {/* Desktop Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-background">
        {/* Header */}
        <AppHeader title={title} subtitle={subtitle} onFabClick={onFabClick} />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-12">
          <div className="container mx-auto max-w-3xl px-4 sm:px-8 md:px-12 pt-4 md:pt-10">
            {/* Desktop Full Title (Todoist Style) */}
            <div className="hidden md:flex md:flex-col mb-8">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            </div>

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
        <Button
          onClick={onFabClick}
          className="md:hidden fixed bottom-24 right-6 size-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 flex items-center justify-center transition-all active:scale-95 z-50 group border-none"
          aria-label="Add Action"
        >
          <PlusIcon className="size-8 group-hover:rotate-90 transition-transform duration-300" />
        </Button>

        {/* Mobile Bottom Navigation */}
        <MobileNav isDrawerOpen={isDrawerOpen} onBrowseClick={() => setIsDrawerOpen(true)} />

        <MobileDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
      </main>
    </div>
  );
}
