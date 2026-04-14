import {
  PlusIcon,
  SearchIcon,
  PanelLeftIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
} from "lucide-react";
import { Button } from "@kreozalabs/ui";

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onFabClick?: () => void;
  headerActions?: React.ReactNode;
}

export function AppHeader({ title, subtitle, headerActions }: AppHeaderProps) {
  return (
    <header className="shrink-0 z-40 w-full h-14 md:h-12 flex items-center justify-between px-4 md:py-10 py-8 sm:px-8 md:px-6 sticky top-0 bg-background/95 backdrop-blur-xl border-b md:border-none">
      {/* Title */}
      <div className="flex flex-col md:m-10">
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        {subtitle && <span className="text-xs text-muted-foreground font-medium">{subtitle}</span>}
      </div>
      <div className="flex items-center gap-1 md:gap-3 text-muted-foreground">
        {/* Actions Slot (Decentralized) */}
        <div className="flex items-center gap-2">
          {headerActions}
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

