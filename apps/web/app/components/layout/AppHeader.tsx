import { createPortal } from "react-dom";
import { cn, useIsMobile } from "@kreozalabs/kei-ui";
import { useHeaderPortalTarget } from "./HeaderPortalContext";
import { IdleFadeWrapper } from "./IdleFadeWrapper";
import { HeaderTitleArea } from "./HeaderTitleArea";

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
