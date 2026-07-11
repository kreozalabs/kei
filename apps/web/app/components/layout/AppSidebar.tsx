import { NavLink } from "react-router";
import { Button, cn } from "@kreozalabs/kei-ui";
import { SidebarToggle } from "./SidebarToggle";
import { Logo as KreozaLogo } from "@kreozalabs/icons";
import { navGroups } from "@/config/navigation";
import { FullscreenToggle } from "../FullscreenToggle";
import { SettingsIcon } from "lucide-react";
import { useSettings } from "@/providers/SettingsContext";

interface AppSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AppSidebar({ isOpen = true, onToggle }: AppSidebarProps) {
  const { settings } = useSettings();
  return (
    <aside
      className={cn(
        "group hidden shrink-0 flex-col overflow-hidden transition-[width,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:flex",
        isOpen ? "w-72 opacity-100" : "invisible w-0 opacity-0"
      )}
    >
      <div
        className={cn(
          "no-scrollbar flex h-full w-72 flex-col overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          !isOpen && "-translate-x-12"
        )}
      >
        <div
          className={cn(
            "border-border/80 animate-in fade-in slide-in-from-top-2 animation-duration-[700ms] mb-2 flex shrink-0 items-end justify-between px-6 pt-4 pb-2 md:px-8 md:pt-6 md:pb-2"
          )}
        >
          <div className="flex h-12 w-full items-center justify-between">
            <SidebarToggle onClick={onToggle} />
            <div
              className={cn(
                "flex items-center gap-1.5 transition-opacity",
                settings.subtle_on_idle ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              )}
            >
              <FullscreenToggle
                size="icon"
                className="hover:bg-muted/80 text-muted-foreground/40 hover:text-foreground size-8 rounded-lg border-none transition-all active:scale-90"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 space-y-2 p-4">
          {/* App & Profile Header */}
          <div className="mb-6 flex items-center justify-between px-0">
            <Button
              variant="ghost"
              className="hover:bg-muted/50 group hidden h-auto min-w-0 flex-1 items-center justify-start gap-2.5 rounded-lg border-none px-0 py-1.5 font-medium md:flex"
            >
              <div className="bg-primary/10 text-primary group-hover:bg-primary/20 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors">
                <KreozaLogo className="size-5" />
              </div>
              <div className="flex min-w-0 flex-col items-start">
                <span className="text-foreground/90 text-[13px] leading-none font-bold tracking-tight">
                  Kei
                </span>
                <span className="text-muted-foreground/70 mt-1 truncate text-[10.5px] font-medium">
                  {"{user.email} or login"}
                </span>
              </div>
            </Button>
          </div>

          <div className="flex flex-1 flex-col gap-2.5 space-y-6">
            {navGroups.map((group) => (
              <div key={group.label} className="flex flex-col space-y-1">
                <h4 className="text-muted-foreground/50 mb-3 px-3 text-[11px] font-bold tracking-wider uppercase">
                  {group.label}
                </h4>
                {group.items.map((item) => {
                  const isToday = item.id === "today";
                  return (
                    <NavLink
                      key={item.id}
                      to={item.href}
                      end={item.href === "/app"}
                      draggable={false}
                      className={({ isActive }) =>
                        cn(
                          "group flex w-full items-center justify-between rounded-lg border-none px-3 py-2 font-medium transition-none",
                          isActive
                            ? cn(
                                "bg-primary/10 text-primary shadow-none",
                                isToday && "bg-primary/15"
                              )
                            : cn(
                                "text-muted-foreground hover:bg-muted/60",
                                isToday && "text-foreground/80 font-bold"
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
                                isActive || isToday ? "text-primary" : "text-muted-foreground/70",
                                isToday && !isActive && "opacity-60"
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
    </aside>
  );
}
