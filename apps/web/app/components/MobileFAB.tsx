import { createPortal } from "react-dom";
import { useEffect, useState, createContext, useContext } from "react";
import { Button, cn } from "@kreozalabs/kei-ui";

interface MobileFABContextType {
  hasCustomFab: boolean;
  setHasCustomFab: (has: boolean) => void;
}

const MobileFABContext = createContext<MobileFABContextType>({
  hasCustomFab: false,
  setHasCustomFab: () => {},
});

export function MobileFABProvider({ children }: { children: React.ReactNode }) {
  const [hasCustomFab, setHasCustomFab] = useState(false);
  return (
    <MobileFABContext.Provider value={{ hasCustomFab, setHasCustomFab }}>
      {children}
    </MobileFABContext.Provider>
  );
}

export function useMobileFAB() {
  return useContext(MobileFABContext);
}

interface MobileFABProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}

export function MobileFAB({
  onClick,
  className,
  children,
  "aria-label": ariaLabel,
}: MobileFABProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const { setHasCustomFab } = useMobileFAB();

  useEffect(() => {
    setHasCustomFab(true);
    return () => setHasCustomFab(false);
  }, [setHasCustomFab]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setPortalTarget(document.getElementById("mobile-fab-content"));
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  if (!portalTarget || !children) return null;

  return createPortal(
    <Button
      onClick={onClick}
      className={cn(
        "floating-toolbar bg-primary hover:bg-primary/90 text-primary-foreground group shadow-primary/30 fixed right-6 bottom-24 z-50 flex size-14 items-center justify-center rounded-2xl border-none shadow-2xl transition-all duration-300 active:scale-95 md:hidden",
        className
      )}
      aria-label={ariaLabel || "Floating action button"}
    >
      {children}
    </Button>,
    portalTarget
  );
}
