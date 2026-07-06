import { NavLink } from "react-router";
import { cn } from "@kreozalabs/ui";
import { navItems } from "@/config/navigation";

export function MobileNav() {
  const visibleItems = navItems.filter((item) => item.mobileVisible);

  return (
    <nav className="bg-card/80 pb-safe fixed right-0 bottom-0 left-0 z-50 flex h-16 items-center justify-around border-t px-2 backdrop-blur-2xl md:hidden">
      {visibleItems.map((item) => {
        const isDays = item.id === "days";
        return (
          <NavLink
            key={item.id}
            to={item.href}
            end={item.href === "/app"}
            draggable={false}
            className={({ isActive }) =>
              cn(
                "flex h-full min-w-16 flex-col items-center justify-center gap-1 rounded-xl transition-colors",
                isActive
                  ? "text-primary"
                  : isDays
                    ? "text-muted-foreground/80"
                    : "text-muted-foreground/60"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "rounded-full p-1.5 transition-all",
                    isActive ? "bg-primary/10" : isDays ? "bg-primary/5" : ""
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-6",
                      isActive || isDays ? "text-primary" : "",
                      isActive ? "fill-primary/20" : isDays ? "opacity-60" : ""
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold tracking-tight uppercase",
                    isDays && !isActive && "text-primary/60"
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
