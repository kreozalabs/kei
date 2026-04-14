import {
  PlusIcon,
  SearchIcon,
  PanelLeftIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
} from "lucide-react";
import { Button } from "@kreozalabs/ui";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onFabClick?: () => void;
}

export function AppHeader({ title, subtitle, onFabClick }: AppHeaderProps) {
  return (
    <header className="shrink-0 z-40 w-full h-14 md:h-12 flex items-center justify-between px-4 md:py-10 py-8 sm:px-8 md:px-6 sticky top-0 bg-background/95 backdrop-blur-xl border-b md:border-none">
      {/* Title */}
      <div className="flex flex-col md:m-10">
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        {subtitle && <span className="text-xs text-muted-foreground font-medium">{subtitle}</span>}
      </div>
      <div className="flex items-center gap-1 md:gap-3 text-muted-foreground">
        {/* Top Right Actions */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex items-center gap-2 h-8 rounded-md hover:bg-muted/50 border-none font-medium"
        >
          <SearchIcon className="size-4" /> Ctrl+K
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={onFabClick}
          className="hidden md:flex items-center gap-1.5 h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-3 shadow-sm border-none transition-all active:scale-95"
        >
          <PlusIcon className="size-4" /> New Action
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex items-center gap-1.5 h-8 rounded-md hover:bg-muted/50 border-none font-medium"
        >
          <PanelLeftIcon className="size-4" /> Display
        </Button>
        <div className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-md hover:bg-muted/50 border-none"
          >
            <MessageSquareIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-md hover:bg-muted/50 border-none"
          >
            <MoreVerticalIcon className="size-4" />
          </Button>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <Button variant="ghost" size="icon" className="size-8 border-none">
            <SearchIcon className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 border-none">
            <MoreVerticalIcon className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
