import { PanelLeftIcon } from "lucide-react";
import { Button, cn, useIsMobile } from "@kreozalabs/kei-ui";

interface SidebarToggleProps {
  onClick?: () => void;
  className?: string;
}

export function SidebarToggle({ onClick, className }: SidebarToggleProps) {
  const isMobile = useIsMobile();

  return (
    <Button
      variant="ghost"
      size="icon"
      id="sidebar-toggle-button"
      className={cn(
        "hover:bg-muted/80 text-muted-foreground/40 hover:text-foreground size-8 rounded-lg border-none transition-all active:scale-90",
        className
      )}
      onClick={(e) => {
        if (isMobile) {
          e.currentTarget.blur();
        }
        onClick?.();
      }}
      title="Toggle Sidebar (Ctrl+B)"
    >
      <PanelLeftIcon className="size-5" />
    </Button>
  );
}
