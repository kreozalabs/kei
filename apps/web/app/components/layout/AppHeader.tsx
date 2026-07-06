import { forwardRef, useState, useContext } from "react";
import { PlusIcon, SearchIcon, MoreVerticalIcon, Loader2Icon, ChevronDown } from "lucide-react";
import { Button, Calendar, cn, Popover, PopoverTrigger, PopoverContent } from "@kreozalabs/ui";
import { useSettings } from "@/providers/SettingsContext";
import { useSubtleOnIdle } from "@/hooks/useSubtleOnIdle";
import { useDb } from "@/providers/DbContext";
import { parseDateString, formatDate, getTodayString } from "@kreozalabs/core";
import { DashboardContext } from "@/routes/app/dashboard/context/DashboardContext";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

export function AppHeader({ title, subtitle, left, center, right }: AppHeaderProps) {
  const { settings } = useSettings();
  const { isSubtle, show, hide } = useSubtleOnIdle({
    initialDelay: 3000,
    idleDelay: 2000,
    disableOnMobile: true,
    disabled: !settings.subtle_on_idle,
  });

  const { isDbReady, isWriting } = useDb();
  const isLoading = !isDbReady || isWriting;

  return (
    <header
      className="bg-background/95 border-border/40 sticky top-0 z-40 w-full shrink-0 border-b px-6 pt-2 pb-1 backdrop-blur-xl md:border-none md:px-8 md:pt-4 md:pb-6"
      onMouseEnter={show}
      onMouseMove={show}
      onMouseLeave={hide}
    >
      <div
        className={cn(
          "flex w-full cursor-default gap-4 transition-[opacity,transform] duration-1000 ease-in-out",
          isSubtle ? "translate-y-0.5 opacity-20" : "opacity-100"
        )}
      >
        {/* 1. Left Area (e.g. Sidebar toggle) */}
        {left && <div className="flex shrink-0 items-center">{left}</div>}

        {/* 2. Title Area (Reserved space for stability) */}
        <div className="flex h-10 min-w-0 flex-1 flex-col justify-end gap-1 md:ml-12 md:h-16">
          <h1 className="mb-2 flex items-center gap-2 text-lg leading-none font-bold tracking-tight md:text-xl">
            <span>{title}</span>
            {isLoading && (
              <Loader2Icon
                className="text-muted-foreground/60 size-4 shrink-0 animate-spin"
                aria-hidden="true"
              />
            )}
          </h1>
          <div className="flex h-4 items-center overflow-hidden">
            {subtitle ? (
              <span className="text-muted-foreground truncate text-[11px] font-semibold tracking-wider opacity-70 md:text-xs">
                {subtitle}
              </span>
            ) : (
              <span className="invisible text-[11px] uppercase">placeholder</span>
            )}
          </div>
        </div>

        {/* 3. Actions Area (Right-aligned grouping) */}
        <div className="flex h-12 min-w-0 flex-1 items-center justify-end gap-6 md:gap-10">
          {/* Search stays grouped with the other actions */}
          <div className="hidden items-center lg:flex">{center}</div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-2 font-medium md:gap-6">
            <div className="text-muted-foreground/40 lg:hidden">{center}</div>
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
      className="hover:bg-muted/50 text-muted-foreground flex h-8 items-center gap-2 rounded-md border-none px-2 font-medium md:px-3"
    >
      <SearchIcon className="size-4 md:size-4" />
      <span className="hidden text-xs md:inline">Search</span>
      <span className="hidden text-[10px] opacity-40 md:inline">Ctrl+K</span>
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
        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 hover:shadow-primary/30 hidden h-9 items-center gap-1.5 rounded-full border-none px-4 font-bold shadow-lg transition-all active:scale-95 md:flex"
        {...props}
      >
        <PlusIcon className="size-4" />
        <span className="text-sm">New Action</span>
        <span className="ml-1 hidden text-[10px] font-medium opacity-40 lg:inline">N</span>
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
      className="hover:bg-muted/50 text-muted-foreground size-8 rounded-md border-none"
    >
      <MoreVerticalIcon className="size-4" />
    </Button>
  );
}

export function HeaderCalendar() {
  const context = useContext(DashboardContext);
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  const dateStr = context ? context.selectedDate : getTodayString();
  const selectedDateObj = parseDateString(dateStr);

  const localeCode = settings.language === "auto" ? undefined : settings.language;

  const displayDate = selectedDateObj.toLocaleDateString(localeCode, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      if (context) {
        context.setSelectedDate(formatDate(date));
      }
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="hover:bg-muted/50 text-muted-foreground flex h-8 items-center gap-2 rounded-md border-none px-3 text-sm font-black tracking-wider"
        >
          <span>{displayDate}</span>
          <ChevronDown className="size-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDateObj}
          onSelect={handleSelect}
          lang={localeCode}
        />
      </PopoverContent>
    </Popover>
  );
}
