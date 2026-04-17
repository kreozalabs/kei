import { Maximize, Minimize } from "lucide-react";
import { Button, cn } from "@kreozalabs/ui";
import { useFullscreen } from "@/hooks/useFullscreen";

export interface FullscreenToggleProps {
  className?: string;
  size?: "icon" | "icon-lg";
}

export function FullscreenToggle({ className, size = "icon-lg" }: FullscreenToggleProps) {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn("transition-colors hover:bg-muted", className)}
      onClick={toggleFullscreen}
      title={isFullscreen ? "Exit Fullscreen (Alt+F)" : "Enter Fullscreen (Alt+F)"}
    >
      {isFullscreen ? (
        <Minimize className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Maximize className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle fullscreen</span>
    </Button>
  );
}
