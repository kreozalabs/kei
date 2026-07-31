import { useEffect, useState } from "react";

export interface UseScrollSpyOptions {
  enabled?: boolean;
  rootMargin?: string;
  thresholds?: number[];
  minRatio?: number;
}

/**
 * Custom hook to track which section ID is currently active/visible in the viewport via IntersectionObserver.
 * Useful for Table of Contents, sidebars, and document section navigation.
 */
export function useScrollSpy(sectionIds: string[], options: UseScrollSpyOptions = {}): string {
  const {
    enabled = true,
    rootMargin = "-20% 0px -60% 0px",
    thresholds = [0.1, 0.5, 0.8],
    minRatio = 0.1,
  } = options;

  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!enabled || sectionIds.length === 0) {
      return;
    }

    const observerMap = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          observerMap.set(entry.target.id, entry.intersectionRatio);
        });

        // Find the section with maximum visible ratio
        let maxRatio = 0;
        let topSection = "";

        observerMap.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            topSection = id;
          }
        });

        if (topSection && maxRatio > minRatio) {
          setActiveId(topSection);
        }
      },
      {
        root: null,
        rootMargin,
        threshold: thresholds,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [sectionIds, enabled, rootMargin, thresholds, minRatio]);

  return activeId;
}
