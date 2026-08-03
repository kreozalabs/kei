import { useEffect, useState, useRef } from "react";

export interface UseScrollSpyOptions {
  enabled?: boolean;
  offset?: number;
}

/**
 * Custom hook to track which section ID is currently active/visible in the viewport.
 * Useful for Table of Contents, sidebars, and document section navigation.
 */
export function useScrollSpy(sectionIds: string[], options: UseScrollSpyOptions = {}): string {
  const { enabled = true, offset = 160 } = options;
  const [activeId, setActiveId] = useState<string>("");
  const sectionIdsRef = useRef(sectionIds);
  sectionIdsRef.current = sectionIds;

  useEffect(() => {
    if (!enabled || sectionIds.length === 0) {
      return;
    }

    let rafId: number | null = null;
    let scrollTarget: HTMLElement | Window | null = null;

    const findScrollContainer = (el: HTMLElement | null): HTMLElement | Window => {
      let curr = el?.parentElement;
      while (curr) {
        const overflowY = window.getComputedStyle(curr).overflowY;
        if (overflowY === "auto" || overflowY === "scroll") {
          return curr;
        }
        curr = curr.parentElement;
      }

      const scrollable = document.querySelector(".overflow-y-auto, .overflow-y-scroll");
      if (scrollable instanceof HTMLElement) {
        return scrollable;
      }

      return window;
    };

    const getPresentIds = (): string[] => {
      return sectionIdsRef.current.filter((id) => document.getElementById(id) !== null);
    };

    const getScrollTarget = (): HTMLElement | Window => {
      const presentIds = getPresentIds();
      for (const id of presentIds) {
        const el = document.getElementById(id);
        if (el) {
          return findScrollContainer(el);
        }
      }
      return findScrollContainer(null);
    };

    const updateActiveSection = () => {
      const presentIds = getPresentIds();
      if (presentIds.length === 0) return;

      const container = getScrollTarget();

      let isAtTop = false;
      let isAtBottom = false;

      if (container instanceof HTMLElement) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        isAtTop = scrollTop <= 30;
        isAtBottom = scrollTop + clientHeight >= scrollHeight - 15;
      } else {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        isAtTop = scrollTop <= 30;
        isAtBottom = scrollTop + clientHeight >= scrollHeight - 15;
      }

      // 1. Top of container check
      if (isAtTop) {
        setActiveId(presentIds[0]);
        return;
      }

      // 2. Direct section matching (find section currently spanning offset)
      let currentActive = "";
      for (const id of presentIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= offset && rect.bottom > offset) {
          currentActive = id;
          break;
        }
      }

      if (currentActive) {
        setActiveId(currentActive);
        return;
      }

      // 3. Bottom of container fallback (if no section spanned offset)
      if (isAtBottom) {
        setActiveId(presentIds[presentIds.length - 1]);
        return;
      }

      // 4. Distance fallback: pick section whose top is closest to offset
      let minDiff = Infinity;
      for (const id of presentIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const diff = Math.abs(rect.top - offset);
        if (diff < minDiff) {
          minDiff = diff;
          currentActive = id;
        }
      }

      if (currentActive) {
        setActiveId(currentActive);
      }
    };

    const handleScroll = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveSection);
    };

    // Attach listener to scroll target
    scrollTarget = getScrollTarget();
    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    // Initial check and retry to handle async component mounting
    updateActiveSection();
    const retryTimer = setTimeout(() => {
      const newTarget = getScrollTarget();
      if (newTarget !== scrollTarget) {
        if (scrollTarget) scrollTarget.removeEventListener("scroll", handleScroll);
        scrollTarget = newTarget;
        scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
      }
      updateActiveSection();
    }, 100);

    return () => {
      clearTimeout(retryTimer);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (scrollTarget) {
        scrollTarget.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("resize", handleScroll);
    };
  }, [sectionIds, enabled, offset]);

  return activeId;
}
