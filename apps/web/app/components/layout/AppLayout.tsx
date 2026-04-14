import { useState, useCallback, useMemo } from "react";
import { Outlet, isRouteErrorResponse } from "react-router";
import { PlusIcon } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  const [isActionInputOpen, setIsActionInputOpen] = useState(false);
  const [onFabClick, setOnFabClick] = useState<(() => void) | undefined>(
    () => () => setIsActionInputOpen(true)
  );
  const [headerActions, setHeaderActions] = useState<
    { center?: React.ReactNode; right?: React.ReactNode } | undefined
  >();

  const openActionInput = useCallback(() => setIsActionInputOpen(true), []);

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
      <AppSidebar onAddAction={openActionInput} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-background">
        {/* Header */}
        <AppHeader
          title={title}
          subtitle={subtitle}
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
                <HeaderNewAction onClick={openActionInput} />
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
        {onFabClick && (
          <Button
            onClick={onFabClick}
            className="md:hidden fixed bottom-24 right-6 size-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 flex items-center justify-center transition-all active:scale-95 z-50 group border-none"
            aria-label="Add Action"
          >
            <PlusIcon className="size-8 group-hover:rotate-90 transition-transform duration-300" />
          </Button>
        )}

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
