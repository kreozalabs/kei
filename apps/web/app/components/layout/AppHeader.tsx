import { PlusIcon, SearchIcon, MoreVerticalIcon } from "lucide-react";
import { Button } from "@kreozalabs/ui";

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

export function AppHeader({ title, subtitle, left, center, right }: AppHeaderProps) {
  return (
    <header className="shrink-0 z-40 w-full h-14 md:h-16 flex items-center px-6 md:px-8 sticky top-0 bg-background/95 backdrop-blur-xl border-b md:border-none transition-all gap-4">
      {/* 1. Left Area (e.g. Sidebar toggle) */}
      {left && (
        <div className="flex items-center shrink-0">
          {left}
        </div>
      )}

      {/* 2. Title Area (Adjusted width) */}
      <div className="flex flex-col flex-1 min-w-0">
        <h1 className="text-xl font-bold tracking-tight truncate">{title}</h1>
        {subtitle && (
          <span className="text-xs text-muted-foreground font-medium truncate">{subtitle}</span>
        )}
      </div>

      {/* 2. Actions Area (Right-aligned grouping) */}
      <div className="flex-1 flex items-center justify-end gap-6 md:gap-10 min-w-0">
        {/* Search stays grouped with the other actions */}
        <div className="hidden lg:flex items-center">{center}</div>

        {/* Secondary Actions */}
        <div className="flex items-center gap-2 md:gap-6 font-medium">
          <div className="lg:hidden text-muted-foreground/40">{center}</div>
          {right}
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

export function HeaderNewAction({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="default"
      size="sm"
      onClick={onClick}
      className="hidden md:flex items-center gap-1.5 h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-3 shadow-sm border-none transition-all active:scale-95"
    >
      <PlusIcon className="size-4" />
      <span className="text-xs">New Action</span>
    </Button>
  );
}

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
