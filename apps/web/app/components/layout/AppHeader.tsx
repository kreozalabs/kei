import { createPortal } from "react-dom";
import { useOutletContext } from "react-router";
import { cn, useIsMobile } from "@kreozalabs/kei-ui";
import { useHeaderPortalTarget } from "./HeaderPortalContext";
import { IdleFadeWrapper } from "./IdleFadeWrapper";
import { HeaderTitleArea } from "./HeaderTitleArea";
import { SidebarToggle } from "./SidebarToggle";
import type { AppLayoutContext } from "./AppLayout";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function AppHeader({ title, subtitle, icon, className, children }: AppHeaderProps) {
  const isMobile = useIsMobile();
  const portalTarget = useHeaderPortalTarget();
  const context = useOutletContext<AppLayoutContext | undefined>();
  const toggleSidebar = context?.toggleSidebar;

  const headerContent = (
    <IdleFadeWrapper>
      {children ? (
        children
      ) : (
        <HeaderTitleArea title={title || ""} subtitle={subtitle} icon={icon} />
      )}
    </IdleFadeWrapper>
  );

  if (isMobile) {
    return (
      <header
        className={cn(
          "bg-muted/95 border-border/40 sticky top-0 z-40 flex w-full shrink-0 items-start gap-2 border-b px-4 pt-2.5 pb-2 backdrop-blur-xl",
          className
        )}
      >
        {toggleSidebar && (
          <SidebarToggle onClick={toggleSidebar} className="shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          {headerContent}
        </div>
      </header>
    );
  }

  if (!portalTarget) return null;
  return createPortal(headerContent, portalTarget);
}
