import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export const GESTURE_EDGE_THRESHOLD = 30; // px from left edge to trigger swipe-to-open
export const GESTURE_MIN_DISTANCE = 80; // px minimum swipe distance
export const GESTURE_MAX_OPPOSITE_DISTANCE = 50; // px max vertical deviation (prevents scroll interference)

export interface UseSwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  edgeThreshold?: number;
  minDistance?: number;
  maxOppositeDistance?: number;
  enabled?: boolean;
  targetRef?: RefObject<HTMLElement | null>;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  edgeThreshold,
  minDistance = GESTURE_MIN_DISTANCE,
  maxOppositeDistance = GESTURE_MAX_OPPOSITE_DISTANCE,
  enabled = true,
  targetRef,
}: UseSwipeGestureOptions) {
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  // Keep references to handlers so they always see the latest callbacks without re-triggering effect
  const onSwipeLeftRef = useRef(onSwipeLeft);
  const onSwipeRightRef = useRef(onSwipeRight);

  useEffect(() => {
    onSwipeLeftRef.current = onSwipeLeft;
    onSwipeRightRef.current = onSwipeRight;
  }, [onSwipeLeft, onSwipeRight]);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;

      // If edgeThreshold is specified, only track swipe starting near the edge
      if (edgeThreshold !== undefined && touchX > edgeThreshold) {
        return;
      }

      touchStartXRef.current = touchX;
      touchStartYRef.current = touchY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartXRef.current === 0) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartXRef.current;
      const deltaY = Math.abs(touchEndY - touchStartYRef.current);

      // Swipe right
      if (deltaX > minDistance && deltaY < maxOppositeDistance) {
        onSwipeRightRef.current?.();
      }
      // Swipe left
      else if (-deltaX > minDistance && deltaY < maxOppositeDistance) {
        onSwipeLeftRef.current?.();
      }

      touchStartXRef.current = 0;
    };

    const element = targetRef ? targetRef.current : window;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart as EventListener, { passive: true });
    element.addEventListener("touchend", handleTouchEnd as EventListener, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart as EventListener);
      element.removeEventListener("touchend", handleTouchEnd as EventListener);
    };
  }, [enabled, edgeThreshold, minDistance, maxOppositeDistance, targetRef]);
}
