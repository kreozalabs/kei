import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Custom hook that automatically scrolls to the target DOM element specified by location.hash
 * on page reload, route navigation, or hash updates.
 */
export function useHashScroll() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const targetId = hash.replace("#", "");
    if (!targetId) return;

    let animationFrameId: number;
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];

    const scrollToElement = () => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
      }
      return false;
    };

    // Attempt immediate scroll. If element isn't in DOM yet (e.g. initial render/reload),
    // retry on subsequent frames and timeouts until mounted.
    if (!scrollToElement()) {
      animationFrameId = requestAnimationFrame(() => {
        if (!scrollToElement()) {
          const delays = [50, 150, 300, 500];
          delays.forEach((delay) => {
            const timer = setTimeout(() => {
              scrollToElement();
            }, delay);
            timeoutIds.push(timer);
          });
        }
      });
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      timeoutIds.forEach(clearTimeout);
    };
  }, [hash, pathname]);
}
