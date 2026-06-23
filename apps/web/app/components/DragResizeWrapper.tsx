import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button, cn, Tooltip, TooltipContent, TooltipTrigger, useMediaQuery } from "@kreozalabs/ui";
import { Grip, PanelLeft, X } from "lucide-react";

interface DragResizeWrapperProps {
  children: React.ReactNode;
  mode?: "floating" | "docked" | "drawer";
  onModeChange?: (mode: "floating" | "docked" | "drawer") => void;
  onClose?: () => void;
}

export const DragResizeWrapper = ({
  children,
  mode: controlledMode,
  onModeChange,
  onClose,
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
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  return (
    <motion.div
      ref={wrapperRef}
      style={
        currentMode === "floating"
          ? {
              width: size.width,
              height: size.height,
              left: position.x,
              top: position.y,
            }
          : undefined
      }
      className={cn(
        "flex flex-col bg-card border border-border shadow-lg overflow-hidden",
        !isInteracting && "transition-all duration-200",
        currentMode === "floating" && "fixed z-50 rounded-xl",
        currentMode === "docked" && "relative border-r border-border h-screen w-120 shrink-0",
        currentMode === "drawer" &&
          "fixed bottom-0 left-0 right-0 rounded-t-2xl max-h-[85vh] z-50 w-full"
      )}
    >
      {/* Header / Drag Handle */}
      <div
        onMouseDown={currentMode === "floating" ? handleDragStart : undefined}
        className={cn(
          "h-10 bg-muted flex items-center justify-between px-4 select-none border-b border-border",
          currentMode === "floating" ? "cursor-grab active:cursor-grabbing" : ""
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
                {/* FIXME: WHY IS THIS TEXT SHOWN EVEN IF IT IS NOT HOVERED OVER? */}
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
};
