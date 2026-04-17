import { useState, useEffect, useRef } from "react";

interface SubtleOptions {
  initialDelay?: number;
  idleDelay?: number;
  disableOnMobile?: boolean;
}

/**
 * Hook to manage elements that become "subtle" after a period of inactivity
 * and become active again on specific triggers (e.g. hover).
 */
export function useSubtleOnIdle({
  initialDelay = 3000,
  idleDelay = 2000,
  disableOnMobile = true,
}: SubtleOptions = {}) {
  const [isSubtle, setIsSubtle] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const isHoveringRef = useRef(false);

  const show = () => {
    isHoveringRef.current = true;
    if (disableOnMobile && window.matchMedia("(max-width: 767px)").matches) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsSubtle(false);
  };

  const hide = () => {
    isHoveringRef.current = false;
    if (disableOnMobile && window.matchMedia("(max-width: 767px)").matches) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        setIsSubtle(true);
      }
      timeoutRef.current = null;
    }, idleDelay);
  };

  useEffect(() => {
    if (disableOnMobile && window.matchMedia("(max-width: 767px)").matches) return;

    // Initial reveal then fade
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        setIsSubtle(true);
      }
      timeoutRef.current = null;
    }, initialDelay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [initialDelay, disableOnMobile]);

  return { isSubtle, show, hide };
}

