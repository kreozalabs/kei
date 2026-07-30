import { createPortal } from "react-dom";
import { cn, useIsMobile } from "@kreozalabs/kei-ui";
import { useHeaderPortalTarget } from "./HeaderPortalContext";
import { IdleFadeWrapper } from "./IdleFadeWrapper";
import { HeaderTitleArea } from "./HeaderTitleArea";
import { SidebarToggle } from "./SidebarToggle";

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
        <SidebarToggle className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">{headerContent}</div>
      </header>
    );
  }

  if (!portalTarget) return null;
  return createPortal(headerContent, portalTarget);
}
