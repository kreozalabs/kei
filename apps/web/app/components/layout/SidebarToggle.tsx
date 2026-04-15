import { PanelLeftIcon } from "lucide-react";
import { Button, cn } from "@kreozalabs/ui";

export interface SidebarToggleProps {
  onClick?: () => void;
  className?: string;
}

export function SidebarToggle({ onClick, className }: SidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "size-8 rounded-lg hover:bg-muted/80 border-none text-muted-foreground/40 hover:text-foreground transition-all active:scale-90",
        className
      )}
      onClick={onClick}
    >
      <PanelLeftIcon className="size-5" />
    </Button>
  );
}
