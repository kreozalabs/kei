import { forwardRef } from "react";
import { PlusIcon, SearchIcon, Loader2Icon } from "lucide-react";
import { Button, cn } from "@kreozalabs/kei-ui";
import { useSettings } from "@/providers/SettingsContext";
import { useSubtleOnIdle } from "@/hooks/useSubtleOnIdle";
import { useDb } from "@/providers/DbContext";
import { useOutletContext } from "react-router";
import { SidebarToggle } from "./SidebarToggle";
import type { AppLayoutContext } from "./AppLayout";

interface AppHeaderProps {
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

export function AppHeader({ title, className, children }: AppHeaderProps) {
  const { settings } = useSettings();
  const { isSubtle, show, hide } = useSubtleOnIdle({
    initialDelay: 3000,
    idleDelay: 2000,
    disableOnMobile: true,
    disabled: !settings.subtle_on_idle,
  });
  return (
    <header
      className={cn(
        "bg-muted/95 border-border/40 sticky top-0 z-40 w-full shrink-0 border-b px-6 pt-2 pb-1 backdrop-blur-xl md:h-20",
        className
      )}
      onMouseEnter={show}
      onMouseMove={show}
      onMouseLeave={hide}
    >
      <div
        className={cn(
          "flex w-full cursor-default items-center gap-4 transition-[opacity,transform] duration-1000 ease-in-out",
          isSubtle ? "translate-y-0.5 opacity-20" : "opacity-100"
        )}
      >
        {children ? (
          children
        ) : (
          <>
            {/* Left Area (Sidebar toggle) */}
            <HeaderSidebarToggle />

            {/* Title Area */}
            <HeaderTitleArea title={title || ""} />
          </>
        )}
      </div>
    </header>
  );
}

// NOTE: It is not displayed on mobile screen
export function HeaderSidebarToggle() {
  const context = useOutletContext<AppLayoutContext | null>();
  if (!context) return null;

  const { isSidebarOpen, toggleSidebar, isDocked } = context;
  if (isDocked) return null;

  return (
    <div
      className={cn(
        "flex items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        isSidebarOpen ? "invisible w-0 opacity-0" : "visible mr-2 w-10 opacity-100"
      )}
    >
      <SidebarToggle onClick={toggleSidebar} />
    </div>
  );
}

interface HeaderTitleAreaProps {
  title: string;
  className?: string;
}

export function HeaderTitleArea({ title, className }: HeaderTitleAreaProps) {
  const { isDbReady, isWriting } = useDb();
  const isLoading = !isDbReady || isWriting;

  return (
    <div className={cn("flex h-10 min-w-0 flex-col justify-end gap-1 md:h-16", className)}>
      <h1 className="mb-4 flex items-center gap-2 text-lg leading-none font-bold tracking-tight md:text-xl">
        <span>{title}</span>
        {isLoading && (
          <Loader2Icon
            className="text-muted-foreground/60 size-4 shrink-0 animate-spin"
            aria-hidden="true"
          />
        )}
      </h1>
    </div>
  );
}

export function HeaderSearch() {
  return (
    <Button variant="ghost" size="icon" className="size-10">
      <SearchIcon />
    </Button>
  );
}

export const HeaderNewAction = forwardRef<HTMLButtonElement, { onClick?: () => void }>(
  ({ onClick, ...props }, ref) => {
    const context = useOutletContext<AppLayoutContext | null>();

    // If the FAB is explicitly disabled (undefined), hide the header button too
    if (context && context.onFabClick === undefined && !onClick) {
      return null;
    }

    const handleClick = onClick || context?.onFabClick || context?.openActionInput;

    return (
      <Button
        ref={ref}
        variant="default"
        size="icon"
        onClick={handleClick}
        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/30 hidden h-10 w-20 items-center justify-center rounded-xl border-none shadow-lg transition-all active:scale-95 md:flex"
        {...props}
      >
        <PlusIcon className="size-6" />
      </Button>
    );
  }
);

HeaderNewAction.displayName = "HeaderNewAction";
