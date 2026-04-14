import { NavLink } from "react-router";
import { BellIcon, PanelLeftIcon, PlusIcon } from "lucide-react";
import { Button, cn } from "@kreozalabs/ui";
import { Logo as KreozaLogo } from "@kreozalabs/icons";
import { navGroups } from "@/config/navigation";

export function AppSidebar() {
  return (
    <aside className="hidden md:flex w-72 flex-col p-4 space-y-2 shrink-0 overflow-y-auto">
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
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex items-center gap-1.5 h-8 rounded-md hover:bg-muted/50 border-none font-medium size-8 hover:text-foreground text-muted-foreground/60"
          >
            <PanelLeftIcon className="size-5" />
          </Button>
        </div>
      </div>

      {/* Add Action Button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          className="flex flex-row items-center transition-all hover:scale-[1.02] active:scale-[0.98] w-full justify-start text-primary hover:text-primary hover:bg-primary/5 gap-2.5 h-9 rounded-lg px-2"
        >
          <PlusIcon className="size-5 sm:size-6" />
          <span className="font-semibold text-sm sm:inline">Add Action</span>
        </Button>
      </div>

      <div className="flex flex-col space-y-6 flex-1">
        {navGroups.map((group) => (
          <div key={group.label} className="flex flex-col space-y-1">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50 px-3 mb-1">
              {group.label}
            </h4>
            {group.items.map((item) => (
              <NavLink
                key={item.id}
                to={item.href}
                draggable={false}
                className={({ isActive }) =>
                  cn(
                    "w-full flex items-center justify-between px-3 py-2 font-medium transition-none border-none rounded-lg",
                    isActive
                      ? "bg-primary/10 text-primary shadow-none"
                      : "text-muted-foreground hover:bg-muted/60"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <item.icon className={cn("size-4.5", isActive && "text-primary")} />
                      <span className="tracking-tight text-sm">{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span
                        className={cn(
                          "text-[11px] font-bold tabular-nums",
                          isActive ? "text-primary/70" : "text-muted-foreground/50"
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
        ))}
      </div>
    </aside>
  );
}
