import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Button,
  cn,
  useMediaQuery,
} from "@kreozalabs/kei-ui";
import { XIcon } from "lucide-react";

interface DragResizeWrapperProps {
  children: React.ReactNode;
  onClose?: () => void;
  portalTargetId?: string;
}

const initialVariants = {
  floating: { opacity: 0, scale: 0.95 },
  drawer: { opacity: 0, y: "100%" },
};

const variants = (size: { width: number; height: number }, position: { x: number; y: number }) => ({
  floating: {
    opacity: 1,
    scale: 1,
    width: size.width,
    height: size.height,
    x: position.x,
    y: position.y,
  },
  drawer: {
    opacity: 1,
    scale: 1,
    width: "100%",
    height: "85vh",
    x: 0,
    y: 0,
  },
});

export const DragResizeWrapper = ({
  children,
  onClose,
}: DragResizeWrapperProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const currentMode = isMobile ? "drawer" : "floating";

  const [size, setSize] = useState({ width: 450, height: 500 });
  const [position, setPosition] = useState({ x: -260, y: -100 });
  const [isInteracting, setIsInteracting] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && currentMode === "floating" && onClose) {
        onClose();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (
        currentMode === "floating" &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node) &&
        onClose
      ) {
        const target = e.target as HTMLElement;
        if (
          target.closest('[role="dialog"]') ||
          target.closest("[data-radix-popper-content-wrapper]")
        ) {
          return;
        }
        onClose();
      }
    };

    if (currentMode === "floating") {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("pointerdown", handlePointerDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [currentMode, onClose]);

  // Drag handler for Header
  const handleDragStart = (e: React.MouseEvent) => {
    if (e.button !== 0 || !wrapperRef.current) return;
    e.preventDefault();
    setIsInteracting(true);

    const startX = position.x;
    const startY = position.y;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const startScreenRect = wrapperRef.current.getBoundingClientRect();

    const doDrag = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - mouseX;
      const deltaY = moveEvent.clientY - mouseY;

      let validDeltaX = deltaX;
      if (startScreenRect.left + validDeltaX < 0) {
        validDeltaX = -startScreenRect.left;
      } else if (startScreenRect.left + validDeltaX + size.width > window.innerWidth) {
        validDeltaX = window.innerWidth - (startScreenRect.left + size.width);
      }

      let validDeltaY = deltaY;
      if (startScreenRect.top + validDeltaY < 0) {
        validDeltaY = -startScreenRect.top;
      } else if (startScreenRect.top + validDeltaY + size.height > window.innerHeight) {
        validDeltaY = window.innerHeight - (startScreenRect.top + size.height);
      }

      setPosition({ x: startX + validDeltaX, y: startY + validDeltaY });

    };

    const stopDrag = () => {
      setIsInteracting(false);
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  // Resize handler for Right side
  const handleRightResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!wrapperRef.current) return;
    setIsInteracting(true);
    const startWidth = size.width;
    const startX = e.clientX;
    const startScreenLeft = wrapperRef.current.getBoundingClientRect().left;

    const doDrag = (moveEvent: MouseEvent) => {
      const maxWidth = window.innerWidth - startScreenLeft;
      const newWidth = Math.max(300, Math.min(maxWidth, startWidth + (moveEvent.clientX - startX)));
      setSize((prev) => ({ ...prev, width: newWidth }));
    };

    const stopDrag = () => {
      setIsInteracting(false);
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  // Resize handler for Bottom side
  const handleBottomResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!wrapperRef.current) return;
    setIsInteracting(true);
    const startHeight = size.height;
    const startY = e.clientY;
    const startScreenTop = wrapperRef.current.getBoundingClientRect().top;

    const doDrag = (moveEvent: MouseEvent) => {
      const maxHeight = window.innerHeight - startScreenTop;
      const newHeight = Math.max(
        300,
        Math.min(maxHeight, startHeight + (moveEvent.clientY - startY))
      );
      setSize((prev) => ({ ...prev, height: newHeight }));
    };

    const stopDrag = () => {
      setIsInteracting(false);
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  // Resize handler for Corner (bottom-right)
  const handleCornerResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!wrapperRef.current) return;
    setIsInteracting(true);
    const startWidth = size.width;
    const startHeight = size.height;
    const startX = e.clientX;
    const startY = e.clientY;
    const rect = wrapperRef.current.getBoundingClientRect();
    const startScreenLeft = rect.left;
    const startScreenTop = rect.top;

    const doDrag = (moveEvent: MouseEvent) => {
      const maxWidth = window.innerWidth - startScreenLeft;
      const maxHeight = window.innerHeight - startScreenTop;
      const newWidth = Math.max(300, Math.min(maxWidth, startWidth + (moveEvent.clientX - startX)));
      const newHeight = Math.max(
        300,
        Math.min(maxHeight, startHeight + (moveEvent.clientY - startY))
      );
      setSize({ width: newWidth, height: newHeight });
    };

    const stopDrag = () => {
      setIsInteracting(false);
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const motionVariants = variants(size, position);

  const content = (
    <motion.div
      ref={wrapperRef}
      initial={initialVariants[currentMode]}
      animate={motionVariants[currentMode]}
      exit={initialVariants[currentMode]}
      transition={isInteracting ? { duration: 0 } : { type: "spring", damping: 26, stiffness: 220 }}
      className={cn(
        "bg-background z-100 flex flex-col overflow-hidden",
        currentMode === "floating" &&
          "border-border/50 fixed top-1/2 left-1/2 rounded-2xl border shadow-2xl",
        currentMode === "drawer" &&
          "border-border fixed right-0 bottom-0 left-0 rounded-t-2xl border-t shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
      )}
    >
      {/* Header / Drag Handle */}
      <div
        onMouseDown={currentMode === "floating" ? handleDragStart : undefined}
        className={cn(
          "bg-muted border-border flex h-10 items-center justify-end border-b px-4 select-none",
          currentMode === "floating"
            ? "hover:bg-muted-foreground/15 cursor-grab transition-colors active:cursor-grabbing"
            : ""
        )}
      >
        {onClose && (
          <Button size="sm" variant="ghost" onClick={onClose}>
            <XIcon className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">{children}</div>

      {/* Resize Handles */}
      {currentMode === "floating" && (
        <div
          onMouseDown={handleRightResizeStart}
          className="hover:bg-primary/25 absolute top-0 right-0 bottom-0 z-50 w-1 cursor-ew-resize transition-colors"
        />
      )}
      {currentMode === "floating" && (
        <>
          <div
            onMouseDown={handleBottomResizeStart}
            className="hover:bg-primary/25 absolute right-0 bottom-0 left-0 z-50 h-1 cursor-ns-resize transition-colors"
          />
          <div
            onMouseDown={handleCornerResizeStart}
            className="hover:bg-primary/25 absolute right-0 bottom-0 z-50 h-3 w-3 cursor-nwse-resize transition-colors"
          />
        </>
      )}
    </motion.div>
  );

  return content;
};
