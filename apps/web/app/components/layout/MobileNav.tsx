import { NavLink } from "react-router";
import { cn } from "@kreozalabs/ui";
import { navItems } from "@/config/navigation";

export function MobileNav() {
  const visibleItems = navItems.filter((item) => item.mobileVisible);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-2xl border-t z-50 flex items-center justify-around px-2 pb-safe">
      {visibleItems.map((item) => {
        const isToday = item.id === "today";
        return (
          <NavLink
            key={item.id}
            to={item.href}
            end={item.href === "/app"}
            draggable={false}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 min-w-16 h-full transition-colors rounded-xl",
                isActive
                  ? "text-primary"
                  : isToday
                    ? "text-muted-foreground/80"
                    : "text-muted-foreground/60"
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
