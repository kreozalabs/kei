import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn, useMediaQuery } from "@kreozalabs/kei-ui";
import { useSettings } from "@/providers/SettingsContext";
import { useSubtleOnIdle } from "@/hooks/useSubtleOnIdle";
import { HeaderTitleArea } from "./HeaderTitleArea";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function AppHeader({
  title,
  subtitle,
  icon,
  className,
  children,
}: AppHeaderProps) {
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
        <HeaderTitleArea
          title={title || ""}
          subtitle={subtitle}
          icon={icon}
        />
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
