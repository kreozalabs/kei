import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Button, cn, Tooltip, TooltipContent, TooltipTrigger, useMediaQuery } from "@kreozalabs/ui";
import { Grip, PanelLeft, X } from "lucide-react";

interface DragResizeWrapperProps {
  children: React.ReactNode;
  mode?: "floating" | "docked" | "drawer";
  onModeChange?: (mode: "floating" | "docked" | "drawer") => void;
  onClose?: () => void;
  portalTargetId?: string;
}

export const DragResizeWrapper = ({
  children,
  mode: controlledMode,
  onModeChange,
  onClose,
  portalTargetId = "dock-container",
}: DragResizeWrapperProps) => {
  const [internalMode, setInternalMode] = useState<"floating" | "docked" | "drawer">("floating");
  const mode = controlledMode !== undefined ? controlledMode : internalMode;

  const handleModeChange = (newMode: "floating" | "docked" | "drawer") => {
    if (onModeChange) onModeChange(newMode);
    else setInternalMode(newMode);
  };
  const [size, setSize] = useState({ width: 450, height: 500 });
  const [position, setPosition] = useState({ x: -260, y: -100 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && portalTargetId) {
      // Defer the state update to avoid synchronous cascading renders
      const frameId = requestAnimationFrame(() => {
        setPortalTarget(document.getElementById(portalTargetId));
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [portalTargetId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mode === "floating" && onClose) {
        onClose();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (
        mode === "floating" &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node) &&
        onClose
      ) {
        // Prevent closing if clicking inside a toast, dialog, or popover
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

    if (mode === "floating") {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("pointerdown", handlePointerDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [mode, onClose]);

  // Mobile layout check
  const isMobile = useMediaQuery("(max-width: 768px)");
  const currentMode = isMobile ? "drawer" : mode;

  // Drag handler for Header
  const handleDragStart = (e: React.MouseEvent) => {
    if (e.button !== 0 || !wrapperRef.current) return; // Only drag on left click
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

  const content = (
    <motion.div
      ref={wrapperRef}
      initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95 }}
      animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
      exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95 }}
      transition={isInteracting ? { duration: 0 } : { type: "spring", damping: 25, stiffness: 300 }}
      style={{
        width: currentMode === "floating" ? size.width : "100%",
        height: currentMode === "floating" ? size.height : "100%",
        ...(currentMode === "floating"
          ? {
              left: "50%",
              top: "50%",
              x: position.x,
              y: position.y,
            }
          : {}),
      }}
      className={cn(
        "bg-background overflow-hidden flex flex-col z-100",
        currentMode === "floating" && "fixed shadow-2xl rounded-2xl border border-border/50",
        currentMode === "docked" && "w-full h-full rounded-none border-l border-border",
        currentMode === "drawer" &&
          "fixed bottom-0 left-0 right-0 h-[85vh] rounded-t-2xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
      )}
    >
      {/* Header / Drag Handle */}
      <div
        onMouseDown={currentMode === "floating" ? handleDragStart : undefined}
        className={cn(
          "h-10 bg-muted flex items-center justify-between px-4 select-none border-b border-border",
          currentMode === "floating"
            ? "cursor-grab active:cursor-grabbing hover:bg-muted-foreground/15 transition-colors"
            : ""
        )}
      >
        {!isMobile && (
          <div className="flex gap-2">
            {/* Docking buttons */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleModeChange(mode === "floating" ? "docked" : "floating")}
                >
                  {/* FIXME: Feels kind of off. Maybe switch icons' order */}
                  {mode === "floating" ? <PanelLeft /> : <Grip />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{mode === "floating" ? "Dock to sidebar" : "Float to top of page"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {onClose && (
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">{children}</div>

      {/* Resize Handles (Only rendered in floating mode) */}
      {currentMode === "floating" && (
        <>
          <div
            onMouseDown={handleRightResizeStart}
            className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/25 transition-colors"
          />
          <div
            onMouseDown={handleBottomResizeStart}
            className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-primary/25 transition-colors"
          />
          <div
            onMouseDown={handleCornerResizeStart}
            className="absolute right-0 bottom-0 w-3 h-3 cursor-nwse-resize hover:bg-primary/25 transition-colors"
          />
        </>
      )}
    </motion.div>
  );

  if (currentMode === "docked" && portalTarget) {
    return createPortal(content, portalTarget);
  }

  return content;
};
