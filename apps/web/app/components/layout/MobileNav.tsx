import { NavLink } from "react-router";
import { Button, cn } from "@kreozalabs/ui";
import { navItems } from "@/config/navigation";

interface MobileNavProps {
  onBrowseClick: () => void;
  isDrawerOpen?: boolean;
}

export function MobileNav({ onBrowseClick, isDrawerOpen }: MobileNavProps) {
  const visibleItems = navItems.filter((item) => item.mobileVisible);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-card/80 backdrop-blur-2xl border-t z-50 flex items-center justify-around px-2 pb-safe">
      {visibleItems.map((item) => {
        if (item.id === "browse") {
          const isActive = isDrawerOpen;
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={onBrowseClick}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-16 h-16 transition-all border-none rounded-xl hover:bg-transparent",
                isActive ? "text-primary bg-primary/2" : "text-muted-foreground/80"
              )}
            >
              <div className={cn("p-1.5 rounded-full transition-all", isActive && "bg-primary/10")}>
                <item.icon className={cn("size-6", isActive && "fill-primary/20")} />
              </div>
              <span className="text-[10px] font-bold tracking-tight uppercase">{item.label}</span>
            </Button>
          );
        }

        const isToday = item.id === "today";
        return (
          <NavLink
            key={item.id}
            to={item.href}
            end={item.href === "/app"}
            draggable={false}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 min-w-16 h-16 transition-all border-none rounded-xl",
                isActive
                  ? "text-primary bg-primary/2"
                  : isToday
                    ? "text-foreground/80 bg-primary/2"
                    : "text-muted-foreground/80"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "p-1.5 rounded-full transition-all",
                    isActive ? "bg-primary/10" : isToday ? "bg-primary/5" : ""
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-6",
                      isActive || isToday ? "text-primary" : "",
                      isActive ? "fill-primary/20" : isToday ? "opacity-60" : ""
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold tracking-tight uppercase",
                    isToday && !isActive && "text-primary/60"
                  )}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
