import { NavLink } from "react-router";
import { BellIcon } from "lucide-react";
import { Button, cn } from "@kreozalabs/ui";
import { SidebarToggle } from "./SidebarToggle";
import { Logo as KreozaLogo } from "@kreozalabs/icons";
import { navGroups } from "@/config/navigation";
import { FullscreenToggle } from "../FullscreenToggle";
import { SettingsIcon } from "lucide-react";

export interface AppSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AppSidebar({ isOpen = true, onToggle }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 transition-[width,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden group",
        isOpen ? "w-72 opacity-100" : "w-0 opacity-0 invisible"
      )}
    >
      <div
        className={cn(
          "flex flex-col h-full overflow-y-auto no-scrollbar w-72 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          !isOpen && "-translate-x-12"
        )}
      >
        <div
          className={cn(
            "flex items-end justify-between px-6 md:px-8 pt-4 md:pt-6 pb-2 md:pb-2 shrink-0 border-b border-border/80 mb-2 animate-in fade-in slide-in-from-top-2 duration-700"
          )}
        >
          <div className="flex items-center justify-between w-full h-12">
            <SidebarToggle onClick={onToggle} />
            {/* FIXME: Do we need to add subtleonidle settings off? */}
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <FullscreenToggle
                size="icon"
                className="size-8 rounded-lg hover:bg-muted/80 border-none text-muted-foreground/40 hover:text-foreground transition-all active:scale-90"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4 space-y-2 gap-2 flex-1">
          {/* App & Profile Header */}
          <div className="flex items-center justify-between mb-6 px-0">
            <Button
              variant="ghost"
              className="hidden md:flex items-center gap-2.5 px-0 py-1.5 h-auto border-none font-medium hover:bg-muted/50 justify-start flex-1 min-w-0 rounded-lg group"
            >
              <div className="flex items-center justify-center bg-primary/10 text-primary size-8 rounded-lg shrink-0 group-hover:bg-primary/20 transition-colors">
                <KreozaLogo className="size-5" />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="font-bold text-[13px] tracking-tight leading-none text-foreground/90">
                  Kei
                </span>
                <span className="text-[10.5px] font-medium text-muted-foreground/70 truncate mt-1">
                  {"{user.email} or login"}
                </span>
              </div>
            </Button>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex items-center gap-1.5 h-8 rounded-md hover:bg-muted/50 border-none font-medium size-8 hover:text-foreground text-muted-foreground/60"
              >
                <BellIcon className="size-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col space-y-6 flex-1 gap-2.5">
            {navGroups.map((group) => (
              <div key={group.label} className="flex flex-col space-y-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50 px-3 mb-3">
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
                          "w-full flex items-center justify-between px-3 py-2 font-medium transition-none border-none rounded-lg group",
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
                            <span className="tracking-tight text-sm">{item.label}</span>
                          </div>
                          {item.count !== undefined && (
                            <span
                              className={cn(
                                "text-[11px] font-bold tabular-nums",
                                isActive ? "text-primary/70" : "text-muted-foreground/50",
                                isToday && !isActive && "text-primary/40"
                              )}
                            >
                              {item.count}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-border/40">
            <NavLink
              to="/app/settings"
              draggable={false}
              className={({ isActive }) =>
                cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 font-medium transition-none border-none rounded-lg group",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )
              }
            >
              <SettingsIcon className="size-4.5" />
              <span className="tracking-tight text-sm">Settings</span>
            </NavLink>
          </div>
        </div>
      </div>
    </aside>
  );
}
