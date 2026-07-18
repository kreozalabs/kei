import { NavLink } from "react-router";
import { useRef } from "react";
import { cn, useIsMobile } from "@kreozalabs/kei-ui";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@kreozalabs/kei-ui/components/drawer";
import { navGroups } from "@/config/navigation";
import { SettingsIcon } from "lucide-react";

interface AppSidebarProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AppSidebar({ isOpen = true, onOpenChange }: AppSidebarProps) {
  const isMobile = useIsMobile();

  const handleLinkClick = () => {
    if (isMobile) {
      onOpenChange?.(false);
    }
  };

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchStartX.current - touchEndX; // positive delta means swiped left
    const deltaY = Math.abs(touchEndY - touchStartY.current);

    // Close on swipe left (min 80px horizontal shift, max 50px vertical shift)
    if (deltaX > 80 && deltaY < 50) {
      onOpenChange?.(false);
    }
  };

  const content = (
    <div
      className={cn(
        "no-scrollbar flex h-full w-full flex-col overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:w-72",
        !isOpen && !isMobile && "-translate-x-12"
      )}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      <div className="flex flex-1 flex-col gap-2 space-y-2 p-4 pt-6">
        <div className="flex flex-1 flex-col gap-2.5 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label} className="flex flex-col space-y-1">
              <h4 className="text-muted-foreground/50 mb-3 px-3 text-[11px] font-bold tracking-wider uppercase">
                {group.label}
              </h4>
              {group.items.map((item) => {
                const isHighlight = item.variant === "highlight";
                return (
                  <NavLink
                    key={item.id}
                    to={item.href}
                    end={item.href === "/app"}
                    draggable={false}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      cn(
                        "group flex w-full items-center justify-between rounded-lg border-none px-3 py-2 font-medium transition-none",
                        isActive
                          ? cn(
                              "bg-primary/10 text-primary shadow-none",
                              isHighlight && "bg-primary/15"
                            )
                          : cn(
                              "text-muted-foreground hover:bg-muted/60",
                              isHighlight && "text-foreground/80 font-bold"
                            )
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <item.icon
                            className={cn(
                              "size-4.5",
                              isActive || isHighlight ? "text-primary" : "text-muted-foreground/70",
                              isHighlight && !isActive && "opacity-60"
                            )}
                          />
                          <span className="text-sm tracking-tight">{item.label}</span>
                        </div>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        <div className="border-border/40 mt-auto border-t pt-4">
          <NavLink
            to="/app/settings"
            draggable={false}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              cn(
                "group flex w-full items-center gap-2.5 rounded-lg border-none px-3 py-2 font-medium transition-none",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )
            }
          >
            <SettingsIcon className="size-4.5" />
            <span className="text-sm tracking-tight">Settings</span>
          </NavLink>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange} direction="left">
        <DrawerContent className="bg-background rounded-none border-none p-0 data-[vaul-drawer-direction=left]:w-72">
          <DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>
          <DrawerDescription className="sr-only">
            Main application navigation links
          </DrawerDescription>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <aside
      className={cn(
        "group hidden shrink-0 flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:flex",
        isOpen ? "w-72 opacity-100" : "w-0 opacity-0"
      )}
    >
      {content}
    </aside>
  );
}
