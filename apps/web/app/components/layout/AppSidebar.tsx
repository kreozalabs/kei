import { NavLink } from "react-router";
import {
  cn,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  useIsMobile,
} from "@kreozalabs/kei-ui";
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

  const content = (
    <div
      className={cn(
        "no-scrollbar flex h-full w-72 flex-col overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        !isOpen && !isMobile && "-translate-x-12"
      )}
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
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="bg-background w-72 p-0 data-[side=left]:data-open:slide-in-from-left-full data-[side=left]:data-closed:slide-out-to-left-full duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">Main application navigation links</SheetDescription>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "group hidden shrink-0 flex-col overflow-hidden transition-[width,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:flex",
        isOpen ? "w-72 opacity-100" : "invisible w-0 opacity-0"
      )}
    >
      {content}
    </aside>
  );
}
