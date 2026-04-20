import { forwardRef } from "react";
import { PlusIcon, SearchIcon, MoreVerticalIcon } from "lucide-react";
import { Button, cn } from "@kreozalabs/ui";
import { useSubtleOnIdle } from "@/hooks/useSubtleOnIdle";
import { ThemeToggle } from "../ThemeToggle";
import { AccentPicker } from "../AccentPicker";

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

export function AppHeader({ title, subtitle, left, center, right }: AppHeaderProps) {
  const { isSubtle, show, hide } = useSubtleOnIdle({
    initialDelay: 3000,
    idleDelay: 2000,
    disableOnMobile: true,
  });

  return (
    <header
      className="shrink-0 z-40 w-full pt-2 md:pt-4 pb-1 md:pb-6 px-6 md:px-8 sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border/40 md:border-none transition-all"
      onMouseEnter={show}
      onMouseMove={show}
      onMouseLeave={hide}
    >
      <div
        className={cn(
          "flex w-full gap-4 transition-all duration-1000 ease-in-out cursor-default",
          isSubtle ? "opacity-20 translate-y-0.5" : "opacity-100"
        )}
      >
        {/* 1. Left Area (e.g. Sidebar toggle) */}
        {left && <div className="flex items-center shrink-0">{left}</div>}

        {/* 2. Title Area (Reserved space for stability) */}
        <div className="md:ml-12 flex flex-col flex-1 min-w-0 h-10 md:h-16 justify-end gap-1">
          <h1 className="text-lg md:text-xl font-bold tracking-tight leading-none mb-2">{title}</h1>
          <div className="h-4 flex items-center overflow-hidden">
            {subtitle ? (
              <span className="text-[11px] md:text-xs text-muted-foreground font-semibold truncate tracking-wider opacity-70">
                {subtitle}
              </span>
            ) : (
              <span className="invisible text-[11px] uppercase">placeholder</span>
            )}
          </div>
        </div>

        {/* 3. Actions Area (Right-aligned grouping) */}
        <div className="flex-1 flex items-center justify-end gap-6 md:gap-10 min-w-0 h-12">
          {/* Search stays grouped with the other actions */}
          <div className="hidden lg:flex items-center">{center}</div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-2 md:gap-6 font-medium">
            <div className="lg:hidden text-muted-foreground/40">{center}</div>
            {right}
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Reusable Header Action Components
 * Routes can import these to maintain consistency while staying explicit.
 */

export function HeaderSearch() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-2 h-8 rounded-md hover:bg-muted/50 border-none font-medium px-2 md:px-3 text-muted-foreground"
    >
      <SearchIcon className="size-4 md:size-4" />
      <span className="hidden md:inline text-xs">Search</span>
      <span className="hidden md:inline text-[10px] opacity-40">Ctrl+K</span>
    </Button>
  );
}

export const HeaderNewAction = forwardRef<HTMLButtonElement, { onClick?: () => void }>(
  ({ onClick, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="default"
        size="sm"
        onClick={onClick}
        className="hidden md:flex items-center gap-1.5 h-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 shadow-lg shadow-primary/20 border-none transition-all active:scale-95 hover:shadow-primary/30"
        {...props}
      >
        <PlusIcon className="size-4" />
        <span className="text-sm">New Action</span>
        <span className="hidden lg:inline text-[10px] opacity-40 ml-1 font-medium">N</span>
      </Button>
    );
  }
);
HeaderNewAction.displayName = "HeaderNewAction";

export function HeaderMore({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="size-8 rounded-md hover:bg-muted/50 border-none text-muted-foreground"
    >
      <MoreVerticalIcon className="size-4" />
    </Button>
  );
}

export function HeaderAppearance() {
  return (
    <div className="flex items-center gap-1">
      <AccentPicker />
      <ThemeToggle />
    </div>
  );
}
