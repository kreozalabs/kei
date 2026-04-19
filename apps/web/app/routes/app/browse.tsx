import { useEffect } from "react";
import { useOutletContext, NavLink, useNavigate } from "react-router";
import type { AppLayoutContext } from "@/components/layout/AppLayout";
import { navGroups } from "@/config/navigation";
import { SettingsIcon, SearchIcon, BellIcon } from "lucide-react";
import { cn, Button } from "@kreozalabs/ui";

export default function Browse() {
  const navigate = useNavigate();
  const { setTitle, setSubtitle, setOnFabClick, setHeaderActions } =
    useOutletContext<AppLayoutContext>();

  useEffect(() => {
    setTitle("Browse");
    setSubtitle("Navigate your entire setup and archives.");
    setOnFabClick(undefined);

    setHeaderActions({
      right: (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 border-none relative"
            onClick={() => navigate("/app/notifications")}
          >
            <BellIcon className="size-4 text-muted-foreground/60" />
            <div className="absolute top-1.5 right-1.5 size-1.5 bg-primary rounded-full animate-pulse" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 border-none text-muted-foreground"
            onClick={() => navigate("/app/settings")}
          >
            <SettingsIcon className="size-5" />
          </Button>
        </>
      ),
    });

    return () => setHeaderActions(undefined);
  }, [setTitle, setSubtitle, setOnFabClick, setHeaderActions, navigate]);

  return (
    <div className="flex flex-col space-y-8 pb-12 mt-4 w-full max-w-md mx-auto md:max-w-none">
      {/* Mobile Browse View */}
      <div className="md:hidden flex flex-col space-y-10">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => !item.mobileVisible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="flex flex-col space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 px-4">
                {group.label}
              </h4>
              <div className="flex flex-col space-y-2">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.href}
                    end={item.href === "/app"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 font-medium",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:bg-muted/80 active:bg-muted"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn(
                            "size-5",
                            isActive ? "text-primary fill-primary/20" : "text-muted-foreground/60"
                          )}
                        />
                        <span className="text-base">{item.label}</span>
                        {item.count !== undefined && (
                          <span
                            className={cn(
                              "ml-auto text-xs font-bold tabular-nums bg-background/50 px-2 rounded-full",
                              isActive ? "text-primary/70" : "text-muted-foreground/60"
                            )}
                          >
                            {item.count}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}

        <div className="flex flex-col space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 px-4">
            System
          </h4>
          <div className="flex flex-col px-2">
            <NavLink
              to="/app/settings"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 font-medium",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:bg-muted/80 active:bg-muted"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <SettingsIcon
                    className={cn(
                      "size-5",
                      isActive ? "text-primary fill-primary/20" : "text-muted-foreground/60"
                    )}
                  />
                  <span className="text-base">Settings</span>
                </>
              )}
            </NavLink>
          </div>
        </div>
      </div>

      {/* Desktop Message Placeholder */}
      <div className="hidden md:flex flex-col items-center justify-center min-h-[60vh] p-20 border border-dashed rounded-[3rem] gap-6 bg-muted/5">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative flex items-center justify-center bg-background border shadow-xl text-primary size-20 rounded-3xl">
            <SearchIcon className="size-10 stroke-[1.5px]" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-center max-w-xs">
          <h3 className="text-xl font-bold tracking-tight">Navigation Hub</h3>
          <p className="text-sm text-muted-foreground/60 leading-relaxed uppercase tracking-widest font-bold">
            Use the sidebar to explore your workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
