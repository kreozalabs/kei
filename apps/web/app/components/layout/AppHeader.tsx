import { forwardRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PlusIcon, SearchIcon, Loader2Icon } from "lucide-react";
import { Button, cn, useMediaQuery } from "@kreozalabs/kei-ui";
import { useSettings } from "@/providers/SettingsContext";
import { useSubtleOnIdle } from "@/hooks/useSubtleOnIdle";
import { useDb } from "@/providers/DbContext";
import { useOutletContext } from "react-router";
import type { AppLayoutContext } from "./AppLayout";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function AppHeader({ title, subtitle, icon, className, children }: AppHeaderProps) {
  const { settings } = useSettings();
  const { isSubtle, show, hide } = useSubtleOnIdle({
    initialDelay: 3000,
    idleDelay: 2000,
    disableOnMobile: true,
    disabled: !settings.subtle_on_idle,
  });

  const isMobile = useMediaQuery("(max-width: 768px)");
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const frameId = requestAnimationFrame(() => {
        if (!isMobile) {
          setPortalTarget(document.getElementById("global-header-content"));
        } else {
          setPortalTarget(null);
        }
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [isMobile]);

  const headerContent = (
    <div
      className={cn(
        "flex w-full cursor-default items-center gap-4 transition-[opacity,transform] duration-1000 ease-in-out",
        isSubtle ? "translate-y-0.5 opacity-20" : "opacity-100"
      )}
      onMouseEnter={show}
      onMouseMove={show}
      onMouseLeave={hide}
    >
      {children ? (
        children
      ) : (
        <HeaderTitleArea title={title || ""} subtitle={subtitle} icon={icon} />
      )}
    </div>
  );

  if (isMobile) {
    return (
      <header
        className={cn(
          "bg-muted/95 border-border/40 sticky top-0 z-40 w-full shrink-0 border-b px-6 pt-2 pb-1 backdrop-blur-xl md:h-20",
          className
        )}
      >
        {headerContent}
      </header>
    );
  }

  if (!portalTarget) return null;
  return createPortal(headerContent, portalTarget);
}

interface HeaderTitleAreaProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function HeaderTitleArea({ title, subtitle, icon, className }: HeaderTitleAreaProps) {
  const { isDbReady, isWriting } = useDb();
  const isLoading = !isDbReady || isWriting;

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {icon && (
        <div className="text-primary/80 flex shrink-0 items-center justify-center">{icon}</div>
      )}
      <div className="flex min-w-0 flex-col justify-center">
        <h1 className="flex items-center gap-2 text-base font-bold tracking-tight md:text-lg">
          <span>{title}</span>
          {isLoading && (
            <Loader2Icon
              className="text-muted-foreground/60 size-3.5 shrink-0 animate-spin"
              aria-hidden="true"
            />
          )}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground/60 mt-0.5 truncate text-xs font-normal">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function HeaderSearch() {
  return (
    <Button variant="ghost" size="icon" className="size-10">
      <SearchIcon className="size-5" />
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
        <PlusIcon className="size-5" />
      </Button>
    );
  }
);

HeaderNewAction.displayName = "HeaderNewAction";
